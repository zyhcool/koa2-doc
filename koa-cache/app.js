const Koa = require('koa')
const path = require('path');
const static = require('koa-static')
const { createReadStream } = require('fs');

let app = new Koa();

app.use(static(path.join(__dirname, './static'), {
    maxage: 10 * 1000, // 10s
}))

// app.use(async (ctx, next) => {
//     ctx.response.type = path.extname(ctx.path);
//     if (ctx.path === '/') {
//         ctx.res.setHeader('Content-Type', 'text/html')
//         ctx.body = createReadStream(path.join(__dirname, 'static/index.html'))
//     } else {
//         ctx.res.setHeader('Cache-Control', 'max-age=10s')
//         ctx.body = createReadStream(path.join(__dirname, 'static', ctx.path))
//     }
//     await next();
// })

const PORT = 5000
app.listen(PORT, () => {
    console.log(`static server listening at ${PORT}`)
})

