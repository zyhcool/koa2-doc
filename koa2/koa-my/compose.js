function compose(middlewares) {
    return (ctx) => {
        return dispatch(0);
        function dispatch(index) {
            const fn = middlewares[index];
            if (!fn) {
                return Promise.resolve();
            }
            return Promise.resolve(fn(ctx, () => dispatch(index + 1)));
        }
    }
}

module.exports = compose;