const Koa = require('koa');

const app = new Koa();

app.use((ctx, next) => {
    console.log(ctx)
})

app.listen(3003, () => {
    console.log('服务启动，监听端口：3003');
})