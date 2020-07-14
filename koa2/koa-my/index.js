
let Koa = require('./app')
let app = new Koa()

app.use((ctx, next) => {
    const start = Date.now();
    next();
    const ms = Date.now() - start;
    console.log(`${ctx.method} ${ctx.url} ${ms}ms`);
})
app.use((ctx, next) => {
    ctx.body = 'Hello World'
    next();
})

app.listen(3000, () => {
    console.log('服务启动成功，监听端口：3000')
})