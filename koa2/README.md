# KOA2

![Koa](/public/koa-cover.png)
## 简介
> Koa is a new web framework designed by the team behind Express, which aims to be a smaller, more expressive, and more robust foundation for web applications and APIs.

> Koa是由[Express](https://github.com/expressjs/express)原班人马设计开发的新型网络框架，旨在为web应用和服务接口打造一款更轻量稳定的基础框架

Koa轻量的设计和易上手的特性深受众多开发者的喜爱，成为目前最流行的nodejs框架之一，在github上的star已经超过29.5k（至2020.7.8）

TODO 与express的区别
### Koa vs Express
Koa和Express都是基于nodejs的网络框架。Express问世较早，周边的社区资源很丰富；Koa在Express之后，是个轻量级的web框架，需要第三方的中间件支持
二者最大的区别体现的两点：
1. 逻辑处理方式：Express采用callback处理业务逻辑；Koa摒弃了callback形式，在Koa1.x中使用Generator生成器函数，实现代码同步化；Koa2采用ES7的新特性async/await，也解决了异步函数异常难捕获的问题
2. 框架功能：Express更大，自带路由、参数验证、multipart/formdata解析等功能；Koa更轻量，它只提供基础的业务处理逻辑，而更具体的业务处理需要使用第三方中间件来完成，因而自由度更高

Koa高自由度的特点，同时也带来了一个问题：生态中具有相同功能的第三方插件众多，但是良莠不齐，如果想要基于Koa开发出健壮的web应用，需要开发者具备良好的鉴别能力，从众多中间件中选择出最适合、最优秀的工具



TODO 与koa1的区别
从koa诞生以来解决了Express异步回调的问题，只不过koa1.x和koa2的实现方式不一样
koa1.x使用的是Generator函数，利用其coroutin-like的特点实现执行栈的切换
```javascript
var koa = require('koa');
var app = koa();

app.use(function *(next){
  var start = new Date;
  yield next;
  var ms = new Date - start;
  console.log('%s %s - %s', this.method, this.url, ms);
});
```
其中`yield`实现中间件跳转
koa2使用的是ES7的async/await特性，比起Generator来更加优雅直观
```javascript
var Koa = require('koa');
const app = new Koa();

app.use(async (ctx, next) => {
  var start = new Date;
  await next();
  var ms = new Date - start;
  console.log('%s %s - %s', ctx.method, ctx.url, ms);
});
```
`await next()`切换代码执行，直到返回结果才跳回原栈中往下继续执行



TODO 洋葱模型的原理（洋葱模型的图片）
![koa 洋葱模型示意图](/public/koa-onion.webp)
koa使用`app.use`添加中间件，中间件的执行顺序类似洋葱，先添加的在最外层，后添加的在最里层，代码的执行顺序是先外层到里，外层中间件把执行权交给里层中间件；之后外层中间件依次收回代码执行权，执行剩余的代码逻辑
代码例子：
```javascript
const koa = require('koa')

const app = new koa();

app.use((ctx, next) => {
    console.log('1-1');
    next();
    console.log('1-2');
})

app.use((ctx, next) => {
    console.log('2-1');
    next();
    console.log('2-2');
})
app.use((ctx, next) => {
    console.log('3-1');
    next();
    console.log('3-2');
})

app.listen(3000, () => {
    console.log(`服务启动，监听端口：3000`)
})
```
使用[curl](https://curl.haxx.se/)发送http请求：`curl http://localhost:3000`
> 以下验证koa结果的方式相同

返回结果：
```shell
1-1
2-1
3-1
3-2
2-2
1-2
```
由结果分析：
1. 当接收到外部http请求，执行第一个中间件的`console.log('1-1')`，然后进入第二个中间件执行`console.log('2-1')`，再进入第三个中间件执行`console.log('3-1')`；
2. 由于没有第四个中间件了，第三个中间件的`next()`无效，直接执行`console.log('3-2')`，到此第三个中间件执行结束
3. 执行栈跳回第二个中间件，执行`console.log('2-2')`，到此第二个中间件执行结束
3. 执行栈跳回第一个中间件，执行`console.log('1-2')`，到此第一个中间件执行结束，并返回结果

## 实践
TODO 使用koa快速建立http服务
原生的nodejs实现建立http服务：
```javascript
const http = require('http');

const server = http.createServer((req, res) => {
    res.writeHead(200);
    res.end('Hello World');
})

server.listen(3001, () => {
    console.log('node原生服务器启动，监听端口：3001')
})
```
创建服务器时传入回调函数，回调函数包含业务代码，如果业务复杂，代码量巨大，显然不能再放在一个回调中，这时必然要找到其他的解决方案以便支撑复杂的业务逻辑
看koa如何建立服务：
```javascript
// koa-3002.js
const Koa = require('koa');
const Router = require('@koa/router');

const app = new Koa();
const router = new Router();

app.use((ctx, next) => {
    const start = Date.now();
    next();
    const end = Date.now();
    ctx.res.setHeader('X-Response-Time', end - start);
    console.log(`${ctx.method} ${ctx.originalUrl} ${end - start}ms`)
})

router.get('/hello', (ctx, next) => {
    ctx.status = 200;
    ctx.body = "Hello World!"
    next();
})
app.use(router.routes()).use(router.allowedMethods())

app.listen(3002, () => {
    console.log('服务启动，监听端口：3002');
})
```
首先需要添加[@koa/router](https://github.com/koajs/router)第三方包，该包的作用是建立路由匹配规则，实现后端RESTApi
不同的业务可以使用不同的接口实现，koa/router还支持`POST PUT DELETE OPTIONS`等http方法
> 关于`@koa/router`的使用和源码学习在之后的章节中涉及，这里只做简单介绍

TODO 中间件的本质
koa生态中存在很多的第三方中间件，用于处理不同的逻辑功能，那这些中间件到底做了什么呢？
首先我们打印出中间件函数中神秘的第一个参数：ctx
```javascript
// koa-3003.js
const Koa = require('koa');

const app = new Koa();

app.use((ctx, next) => {
    console.log(ctx)
})

app.listen(3003, () => {
    console.log('服务启动，监听端口：3003');
})
```
打印结果：
```javascript
{
  request: {
    method: 'GET',
    url: '/',
    header: {
      host: 'localhost:3003',
      'user-agent': 'curl/7.68.0',
      accept: '*/*'
    }
  },
  response: {
    status: 404,
    message: 'Not Found',
    header: [Object: null prototype] {}
  },
  app: { subdomainOffset: 2, proxy: false, env: 'development' },
  originalUrl: '/',
  req: '<original node req>',
  res: '<original node res>',
  socket: '<original node socket>'
}
```
注意到`ctx`中的两个属性：`req`和`res`实际上是原生node创建服务时传给回调函数的请求对象和响应对象；`socket`为该次网络通讯的socket对象；`request`和`response`是koa封装的请求对象和响应对象
可见，ctx其实是一个包括一系列重要对象和方法的封装对象，而每个中间件的作用就在于操作这些封装的对象和方法，实现业务逻辑

```javascript
// koa-3004.js
const Koa = require('koa');
const app = new Koa();

app.use((ctx, next) => {
    ctx.myKey = 'Hello World'
    next();
    console.log(ctx['myKey']);
})

app.use((ctx, next) => {
    console.log(ctx['myKey']);
    next();
    ctx.myKey = 'Just do it';
})

app.listen(3004, () => {
    console.log('服务启动，监听端口：3004');
})
```
1. 在对象`ctx`上添加属性`myKey`，并赋值`Hello World`
2. 进入第二个中间件函数，打印出`ctx.myKey`，此时其值为：`Hello World`
3. 继续执行，没有第三个中间件，执行赋值语句：`ctx.myKey = 'Just do it'`
4. 跳回第一个中间件，打印出`ctx.myKey`，此时其值为：`Just do it`

即打印结果为：
```shell
Hello World
Just do it
```

举上面的两个例子是为了说明中间件函数的本质就是对ctx对象的操作：从中取值或对其赋值；并将操作过的ctx传入下个中间件继续其他操作








## 源码阅读
为什么我们需要阅读源码？
首先我们需要学会阅读源码的最直接理由是Koa官网的文档虽然已经很详细地记录了koa的大部分用法，但是如果不明白内部的封装代码，我们会被koa暴露的接口所迷惑，比如启动服务的方法就有两种：
```javascript
// 1
const Koa = require('koa');
const app = new Koa();
app.listen(3000);
// 2
const http = require('http');
const Koa = require('koa');
const app = new Koa();
http.createServer(app.callback()).listen(3000);
```
你是不是对第二种实现方式的`app.callback()`有所疑惑，这个`callback`方法是实现了什么功能呢？如果这时候我们不深入阅读源码的话，就不能明白底层的实现，那koa对我们使用者来说就像个黑盒，只知道如何使用而不明白内中原理。一旦我们在开发过程中遇到bug，更是无法定位问题


首先我们应该先会用，知道koa为我们提供了哪些接口，才能更高效地阅读源码；知其然，知其所以然
TODO 前置知识 nodejs：Stream、events、http等



koa的全部代码只有4个js文件，接下来我们进行的源码阅读是简略版的阅读，只挑出最重要的部分代码讲解

### Application.js
上文众多代码实例中的导出的Koa是Application.js导出的类`const Koa = require('koa')`

```javascript
module.exports = class Application extends Emitter {...}
```
`Application`类继承自`events`模块的`EventEmitter`类
Application有4个重要的属性：
```javascript
this.middleware = [];
this.context = Object.create(context);
this.request = Object.create(request);
this.response = Object.create(response);
```
其中：
- middleware 是指定的中间件函数组成的数组
- context 是上下文对象，是对原生req和res的封装对象
- request 是请求对象，封装集成了很多请求相关的属性和方法
- response 是响应对象，封装集成了很多响应相关的属性和方法

```javascript
listen(...args) {
    const server = http.createServer(this.callback());
    return server.listen(...args);
  }
```
listen方法实际上封装了原生http创建服务的方法，当调用`app.listen(3000)`时，便同时启动了服务和监听端口，所以说`listen`方法是原生的语法糖
注意到`this.callback()`，我们大概可以猜测出Application的callback方法应该是返回一个函数：`(req,res) => {...}`作为`http.createServer`的回调函数



```javascript
  use(fn) {
    this.middleware.push(fn);
    return this;
  }
```
use方法便是添加中间件函数的方法，添加的中间件都存放在属性middlerware中



```javascript
  callback() {
    const fn = compose(this.middleware);
    const handleRequest = (req, res) => {
      const ctx = this.createContext(req, res);
      return this.handleRequest(ctx, fn);
    };
    return handleRequest;
  }

  handleRequest(ctx, fnMiddleware) {
    const onerror = err => ctx.onerror(err);
    const handleResponse = () => respond(ctx);
    return fnMiddleware(ctx).then(handleResponse).catch(onerror);
  }
```
callback方法确实返回新的函数handleRequest，在这个函数中，通过createContext的方法封装出了ctx，并将ctx交给this.handleRequest处理
compose










































TODO application.js










### context.js
context.js文件导出一个对象：
```javascript
const proto = module.exports = {...};
```
ctx对象封装了一些简单的方法和属性，其中最重要的属delegate函数实现的属性和方法的委托：
```javascript
delegate(proto, 'response')
  .method('attachment')
  ...
  .access('status')
  ...
  .getter('headerSent')
  ...
/**
 * Request delegation.
 */
delegate(proto, 'request')
  .method('acceptsLanguages')
  ...
  .access('querystring')
  ...
  .getter('origin')
  ...
```
该方法最终实现可以在ctx对象上访问ctx.request和ctx.response的某些属性和方法，即：
```javascript
ctx.status === ctx.response.status // true

ctx.body = {success:true,data:"Hello World"}
// or
ctx.response.body = {success:true,data:"Hello World"}
```

上文中讲到，ctx对象在Application.createContext方法下获得更多的属性



### request.js
该文件导出request对象
```javascript
module.exports = {...}
```
request对象使用getter/setter的形式添加属性，大部分属性是对原生req对象的直接委托或处理过的委托
```javascript
get header() {
  return this.req.headers;
},
set header(val) {
  this.req.headers = val;
},

get headers() {
  return this.req.headers;
},
set headers(val) {
  this.req.headers = val;
}
...
```
request对象的属性header和headers实现对req对象headers的委托，即：
```javascript
ctx.request.header === ctx.request.headers === ctx.req.headers
```
requset对象就是这么简单，但如果要深入学习更底层具体的实现，会涉及到很多网络协议相关的知识




### response.js
response的思路大致跟request对象一致，这里不再展开，只是具体的实现可以看看




## 简单实现
上文已经讲解了koa的精髓，剔除掉一些非主要的部分可以免受过多信息的干扰，从而快速掌握koa的核心
既然已经清楚了koa的核心代码，而且并不复杂，我们可以尝试着自己简单实现下koa

### 需求分析
1. 需要构建一个Application类，用于启动服务器、添加业务中间件函数、实现洋葱模型的中间件执行顺序、处理响应数据等功能
2. 封装Context上下文对象，集成请求数据对象和响应数据对象、并实现部分属性在Context对象的委托
3. 封装request对象，对原生req对象进行封装处理，屏蔽底层，开放安全的接口
4. 封装response对象，对原生res对象进行封装处理，屏蔽底层，开放安全的接口



### 代码抽象
分别新建4个文件：app.js、ctx.js、request.js、response.js，根据需求抽象成代码：

app.js
```javascript
// app.js
class Application extends EventEmitter {
  constructor () {
    super();
    this.middlewares = [];
  }
  // 添加中间件
  use () {}

  // 启动服务，监听端口
  listen () {}

  // 构建ctx对象
  createContext() {}

  // 生成回调函数，用于启动服务
  callback() {}

  // 处理响应数据
  respond() {}
}

module.exports = Application
```

ctx.js
```javascript
// ctx.js
const ctx = {
  ...
}

// 委托属性和方法的函数
function delegateGetter() {}
function delegateSetter() {}
function delegateMethod() {}

module.exports = ctx
```

request.js
```javascript
// request.js
const request = {
  ...
}
module.exports = request
```

response.js
```javascript
// response.js
const response = {
  ...
}
module.exports = response
```


### 具体实现
#### app.js
首先实现Application类的方法：
1. listen()方法启动服务
2. callback()方法生成回调函数
```javascript 
const http = require('http')
const EventEmitter = require('events');

class Application extends EventEmitter {
  constructor () {
    super();
  }

  listen (...args) {
    const server = http.createServer(this.callback());
    server.listen(...args);
  }
  
  callback() {
    return (req,res)=>{
      res.end('Hello World')
    }
  }

  ...
}

module.exports = Application
```

启动koa服务器，监听3000端口，并测试下服务
```javascript
// index.js
let Koa = require('./app')
let app = new Koa()

app.listen(3000,()=>{
  console.log('服务启动成功，监听端口：3000')
})
```
`curl http://localhost:3000`，返回 Hello World，说明服务启动成功


3. use()方法添加中间件函数
4. createContext()方法封装对象ctx
5. response()方法对请求做出响应
```javascript 
const http = require('http')
const EventEmitter = require('events');
const compose = require('koa-compose')
const context = require('./ctx')
const request = require('./request')
const response = require('./response')

class Application extends EventEmitter {
    constructor() {
        super();
        this.middlewares = [];
        this.context = Object.create(context);
        this.request = Object.create(request);
        this.response = Object.create(response);
    }

    callback() {
        const fn = compose(this.middlewares);
        return (req, res) => {
            const ctx = this.createContext(req, res);
            return fn(ctx).then(() => this.respond(ctx)).catch((err) => { })
        }
    }

    use(fn) {
        this.middlewares.push(fn);
        return this;
    }

    createContext(req, res) {
        const context = Object.create(this.context);
        const request = context.request = Object.create(this.request);
        const response = context.response = Object.create(this.response);
        context.app = request.app = response.app = this;
        context.req = request.req = response.req = req;
        context.res = request.res = response.res = res;
        request.ctx = response.ctx = context;
        request.response = response;
        response.request = request;
        return context;
    }

    respond(ctx) {
        const body = ctx.body;
        ctx.res.end(body);
    }
}

module.exports = Application
```

启动koa服务器，监听3000端口，并测试下服务
```javascript
// index.js
let Koa = require('./app')
let app = new Koa()

app.use((ctx, next) => {
    ctx.body = 'Hello World'
    next();
})

app.listen(3000, () => {
    console.log('服务启动成功，监听端口：3000')
})
```
`curl http://localhost:3000`，返回 Hello World，说明服务工作正常



> 关于compose函数，也可以实现自己的简约版：
> ```javascript
> // compose.js
> function compose(middlewares) {
>     return (ctx) => {
>         return dispatch(0);
>         function dispatch(index) {
>             const fn = middlewares[index];
>             if (!fn) {
>                 return Promise.resolve();
>             }
>             return Promise.resolve(fn(ctx, () => dispatch(index + 1)));
>         }
>     }
> }
> 
> module.exports = compose;
> ```





#### ctx.js
实现委托代理
```javascript
let ctx = {}

function delegateGetter(target, name) {
    ctx.__defineGetter__(name, function () {
        return this[target][name];
    })
}

function delegateSetter(target, name) {
    ctx.__defineSetter__(name, function (value) {
        this[target][name] = value;
    })
}

function delegateMethod(target, name) {
    ctx[name] = function (...args) {
        return this[target][name].call(ctx, ...args)
    }
}

module.exports = ctx
```




















































TODO application.js
TODO context.js
TODO request.js
TODO response.js

## 参考资料
1. [koa官网](https://koajs.com/)
2. [知乎：Express和koa各有啥优缺点?](https://www.zhihu.com/question/38879363)
    > 分析Express和Koa的异同，长短处
3. [常见koa中间件推荐（by死马）](https://www.npmjs.com/package/koa-middlewares)
4. [带你走进 koa2 的世界（koa2 源码浅谈）](https://juejin.im/post/5914fdce44d904006c44dfac)
