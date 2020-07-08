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

