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