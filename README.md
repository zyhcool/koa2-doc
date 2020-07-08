# Introduction
通过解读Koa2和Koa2周边优秀相关工具的源码，不仅能掌握Koa的使用技巧，还理解Koa底层原理和网络应用相关知识，为开发稳定的web应用打下坚实的基础
> Koa以其轻量的设计深受开发者喜爱，但一款成熟稳定的web应用还需要众多功能插件的支持，包括但不限于：RESTApi路由处理、http请求消息解析、错误处理、日志系统等。
因此，本小册的目的不在于全面学习掌握Koa的所有中间件，而在于通过理解Koa的中间件原理和学习几个重要中间件的源码，达到举一反三，能快速入手其他Koa中间件的使用；更进一步，还能基于具体的业务需求，开发出属于自己的中间件

## Koa2
github地址：[koa2](https://github.com/koajs/koa)

## koa-router
github地址：[koa-router](https://github.com/koajs/router)
> 该项目是从源项目[ZijianHe/koa-router](https://github.com/ZijianHe/koa-router) fork而来的；由于源项目缺少维护，故koa项目组接手维护，npm安装命令：`npm install @koa/router`