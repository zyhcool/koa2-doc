
function compose(middlewares) {
    return (ctx) => {
        return dispatch(0)
        function dispatch(i) {
            let fn = middlewares[i];
            if (!fn) return Promise.resolve();
            return fn(ctx, () => dispatch(i + 1));
        }
    }
}

let middlewares = []
middlewares.push(async (ctx, next) => {
    console.log(1);
    next();
    console.log(2)
})
middlewares.push(async (ctx, next) => {
    console.log(3);
    next();
    console.log(4)
})
middlewares.push(async (ctx, next) => {
    console.log(5);
    next();
    console.log(6)
})

let fn = compose(middlewares);
fn()

z = {
    name = 'zyh'
}
console.log(Object.create(z));