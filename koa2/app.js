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
    let fs = require('fs');
    console.log(fs.statSync('app.js'))
    console.log(ctx.request.fresh)
    console.log(ctx.request.url, ctx.request.URL, ctx.request.originalUrl, ctx.request.origin);
    await next();
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

let cache = {};
router.get('/test', async (ctx, next) => {
    function fib(n) {
        let first = 1;
        let second = 1;
        for (let i = 1; i < n; i++) {
            const saved = first;
            first = second;
            second = saved + second;
        }
        return second;
    }

    function make() {
        let cache = new Map();
        return function fib(n) {
            if (n <= 2) {
                cache.set(n, 1);
                return n;
            }
            if (!cache.has(n)) {
                cache.set(n, fib(n - 1) + fib(n - 2));
            }
            return cache.get(n);
        }
    }
    function fib2(n) {
        if (n <= 2) {
            return n;
        }
        return fib2(n - 1) + fib2(n - 2);
    }
    console.time('for:')
    let n1 = fib(30)
    console.log(n1)
    console.timeEnd('for:')


    let newfun = memoize(fib2);
    console.time('memoize:')
    let n4 = newfun(45)
    console.log(n4)
    console.timeEnd('memoize:')

    console.time('digui:')
    let n2 = fib2(45)
    console.log(n2)
    console.timeEnd('digui:')

    let fib3 = make();
    console.time('memo:')
    let n3 = fib3(30)
    console.log(n3)
    console.timeEnd('memo:')

    function memoize(func) {
        return function (...args) {
            if (cache[args]) {
                console.log(';;;;;;;;;;')
                return cache[args]
            } else {
                return cache[args] = func.apply(null, args);
            }
        }
    }
    // console.time('memoize2:')
    // let n5 = newfun(30)
    // console.log(n5)
    // console.timeEnd('memoize2:')
    // console.time('memoize3:')
    // let n6 = newfun(30)
    // console.log(n6)
    // console.timeEnd('memoize3:')



    await next();
})


app.use(router.routes()).use(router.allowedMethods());

app.listen(8080, () => {
    console.log(`listening on 3000...`)
})