# koa中使用的第三方包

## cookies & keygrip
[cookies](https://www.npmjs.com/package/cookies)
[keygrip](https://www.npmjs.com/package/keygrip)

koa中内置了cookie的处理函数，可以通过http响应头的方式让浏览器保存返回的cookie数据
```javascript 
const app = new Koa({
    keys: ['helloworld'],
    secure: true,
});

app.use(async (ctx, next) => {
    let cookie = ctx.cookies.get('mykey')
    if (!cookie) {
        ctx.cookies.set('mykey', digest, {
            domain: 'localhost',
            signed: true,
            path: '/',
            maxAge: 10 * 60 * 1000,
            expires: new Date('2020-8-15'),
            httpOnly: false,
            overwrite: false
        })
    }
    ctx.body = cookie;
    await next();
})
```
ctx对象上暴露的cookies，get方法可以读取请求头携带的cookie值，set方法可以设置响应头的set-cookie字段值，具体实现封装在cookie包导出的Cookies对象中

### 签名cookie
当设置cookies时使用`signed:true`，需要同时设置Koa实例的keys属性：由秘钥组成的数组
Cookies模块根据keys签发签名，签名的目的是为了保证cookie的安全性，保证不被篡改
此时的响应头有两个Set-Cookie字段：
![dsf](/public/set-cookie.png)

之后的请求头都会带上cookie字段：`mykey=vUhVi9CBHiRP1u+ymA60Jg==; mykey.sig=VGf3oXvPyPGSvyncLswMZ9ree3w`


### Keygrip
在介绍cookie包之前先介绍下keygrip包。Keygrip是一个封装函数，开放三个接口方法：sign、verify和index
```javascript
var compare = require('tsscmp')
var crypto = require("crypto")
  
function Keygrip(keys, algorithm, encoding) {
  if (!algorithm) algorithm = "sha1";
  if (!encoding) encoding = "base64";
  if (!(this instanceof Keygrip)) return new Keygrip(keys, algorithm, encoding)

  if (!keys || !(0 in keys)) {
    throw new Error("Keys must be provided.")
  }

  function sign(data, key) {
    return crypto
      .createHmac(algorithm, key)
      .update(data).digest(encoding)
      .replace(/\/|\+|=/g, function(x) {
        return ({ "/": "_", "+": "-", "=": "" })[x]
      })
  }

  this.sign = function(data){ return sign(data, keys[0]) }

  this.verify = function(data, digest) {
    return this.index(data, digest) > -1
  }

  this.index = function(data, digest) {
    for (var i = 0, l = keys.length; i < l; i++) {
      if (compare(digest, sign(data, keys[i]))) {
        return i
      }
    }

    return -1
  }
}

Keygrip.sign = Keygrip.verify = Keygrip.index = function() {
  throw new Error("Usage: require('keygrip')(<array-of-keys>)")
}

module.exports = Keygrip
```

sign方法使用crypto模块以keys数组第一个值为秘钥，实现生成数据的加盐摘要，并且替换掉摘要中对URL不友好的字符，默认使用sha1算法，默认编码为base64

index方法对keys数组循环，找到匹配原始数据和摘要的秘钥，若存在则返回秘钥在数组的下标，否则返回-1

veriry方法验证摘要与原始数据是否匹配，返回布尔值

keys是这个函数很重要的一个点，如果由于秘钥泄漏了或者其他原因需要更换秘钥，则在keys开头添加最新的秘钥，对keys循环检验其实是为了让之前签发的摘要兼容旧秘钥；index方法在这里起到的作用就是当返回值大于0，则说明更换了秘钥，这时就应该重新派发签名摘要，避免以后对服务器资源的浪费。

> index方法中，比对摘要和新生成摘要的方法是引用tsscmp包的timeSafeCompare方法，这种对数据的比对方法更加安全


### Cookies
cookies模块可以操作http中的cookie，获取请求头的cookie值，设置响应头的cookie

Cookies类的实例暴露get和set方法
```javascript 
Cookies.prototype.get = function (name, opts) {
  var sigName = name + ".sig"
    , header, match, value, remote, data, index
    , signed = opts && opts.signed !== undefined ? opts.signed : !!this.keys

  header = this.request.headers["cookie"]
  if (!header) return

  match = header.match(getPattern(name))
  if (!match) return

  value = match[1]
  if (!opts || !signed) return value

  remote = this.get(sigName)
  if (!remote) return

  data = name + "=" + value
  if (!this.keys) throw new Error('.keys required for signed cookies');
  index = this.keys.index(data, remote)

  if (index < 0) {
    this.set(sigName, null, { path: "/", signed: false })
  } else {
    index && this.set(sigName, this.keys.sign(data), { signed: false })
    return value
  }
};
```
get方法接收的第一个参数name是cookie格式中[key:value]的key，从请求头中获取cookie的值，通过正则匹配出name对应的cookie值
`remote = this.get(sigName)`语句递归调用get方法，获取name+.sig的cookie值，这是当signed:true时额外设置的cookie值

第二个参数opts为可选参数，{signed:true}被传入时，说明需要获取的签名cookie，获取的cookie必须通过签名验证，否则返回undefined
```javascript
index = this.keys.index(data, remote)
if (index < 0) {
  this.set(sigName, null, { path: "/", signed: false })
}
```
上面源码片段中index<0说明cookie无法通过签名验证，故不返回任何值（等同返回undefined）



set方法设置响应头字段set-cookie，如果指定{signed: true}，则响应头多一条set-cookie数据，字段名为name+.sig，字段值为第一个cookie的加盐摘要
```javascript
if (opts && signed) {
    if (!this.keys) throw new Error('.keys required for signed cookies');
    cookie.value = this.keys.sign(cookie.toString())
    cookie.name += ".sig"
    pushCookie(headers, cookie)
}
```




































































