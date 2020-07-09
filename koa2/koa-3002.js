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
    console.log('hello world');
    ctx.status = 200;
    ctx.body = "Hello World!";
    next();
})
app.use(router.routes()).use(router.allowedMethods())

app.listen(3002, () => {
    console.log('服务启动，监听端口：3002');
})