const Koa = require('koa')
const Router = require('@koa/router')
const crypto = require('crypto');


const app = new Koa({
    keys: ['helloworld'],
    secure: true,
    // proxy: true,
});

const router = new Router()

router.get('/test', async (ctx, next) => {
    let url = require('url')
    let parsed = url.parse("http://user:pass@sub.example.com:8080/p/a/t/h?query=string#hashhash")
    console.log(parsed, parsed.hash)
    parsed.hash = 'hahahaah'
    console.log(parsed)
    console.log(parsed.href)
    console.log(new URL("http://user:pass@sub.example.com:8080/p/a/t/h?query=string#hashhash"))
    console.log(ctx.request.path)
    console.log(ctx.req.url)
    console.log(1);
    await next();
    console.log(2)
})
router.get('/hello', async (ctx, next) => {
    let cookie = ctx.cookies.get('mykey')
    console.log(cookie);
    if (!cookie) {
        let user = {
            name: 'zyh',
            userId: 'fakeuserid'
        };
        let digest = crypto.createHmac('md5', 'SECRECT').update(JSON.stringify(user)).digest('base64');
        // ctx.res.setHeader('Set-Cookie', digest)
        ctx.cookies.set('mykey', digest, {
            domain: 'localhost',
            signed: true,
            path: '/hello',
            maxAge: 10 * 60 * 1000,
            expires: new Date('2020-8-15'),
            httpOnly: false,
            overwrite: false
        })
    }
    ctx.body = 'Hello World!'
    await next();
})

router.get('/test', async (ctx, next) => {
    ctx.throw(404, new Error('iniini'));
    await next();
})


app.use(router.routes()).use(router.allowedMethods());

app.listen(80, () => {
    console.log(`listening on 3000...`)
})