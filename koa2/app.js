const Koa = require('koa')
const Router = require('@koa/router')
const crypto = require('crypto');


const app = new Koa({
    keys: ['helloworld'],
    secure: true,
    // proxy: true,
});

const router = new Router()

router.get('/', async (ctx, next) => {
    let res = ctx.res;
    console.log('headerSent: ' + res.headersSent, 'finished: ' + res.finished)
    // res.writeHead(200)
    console.log('headerSent: ' + res.headersSent, 'finished: ' + res.finished)
    res.write('hello world');
    console.log('headerSent: ' + res.headersSent, 'finished: ' + res.finished)
    res.end()
    console.log('headerSent: ' + res.headersSent, 'finished: ' + res.finished)

    console.log(1);
    await next();
    console.log('headerSent: ' + res.headersSent, 'finished: ' + res.finished)
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

app.listen(3000, () => {
    console.log(`listening on 3000...`)
})