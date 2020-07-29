const Koa = require('koa')
const Static = require('koa-static')
const path = require('path')

let app = new Koa();
app.use(Static(path.join(__dirname, './static'), {
    maxAge: 10 * 1000, // 10s
}))

const PORT = 5000
app.listen(PORT, () => {
    console.log(`static server listening at ${PORT}`)
})

