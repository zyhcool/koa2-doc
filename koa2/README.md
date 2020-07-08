# KOA2

![avatar](/public/koa-cover.png)
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
> 




TODO 与koa1的区别
TODO 洋葱模型的原理（洋葱模型的图片）


## 实践
TODO 使用koa快速建立服务
TODO 体验中间件的执行顺序


## 源码阅读
TODO application.js
TODO context.js
TODO request.js
TODO response.js


## 简单实现
TODO application.js
TODO context.js
TODO request.js
TODO response.js

## 参考资料
1. [koa官网](https://koajs.com/)
2. [知乎：Express和koa各有啥优缺点?](https://www.zhihu.com/question/38879363)
    > 分析Express和Koa的异同，长短处
3. [常见koa中间件推荐（by死马）](https://www.npmjs.com/package/koa-middlewares)

