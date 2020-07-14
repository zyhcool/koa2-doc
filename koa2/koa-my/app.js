
const http = require('http')
const EventEmitter = require('events');
const context = require('./ctx')
const request = require('./request')
const response = require('./response');
const compose = require('./compose');

class Application extends EventEmitter {
    constructor() {
        super();
        this.middlewares = [];
        this.context = Object.create(context);
        this.request = Object.create(request);
        this.response = Object.create(response);
    }

    use(fn) {
        this.middlewares.push(fn);
        return this;
    }

    listen(...args) {
        const server = http.createServer(this.callback());
        return server.listen(...args);
    }

    callback() {
        const fn = compose(this.middlewares);
        return (req, res) => {
            const ctx = this.createContext(req, res);
            return fn(ctx).then(() => this.respond(ctx)).catch((err) => { })
        }
    }

    createContext(req, res) {
        const context = Object.create(this.context);
        const request = context.request = Object.create(this.request);
        const response = context.response = Object.create(this.response);
        context.app = request.app = response.app = this;
        context.req = request.req = response.req = req;
        context.res = request.res = response.res = res;
        request.ctx = response.ctx = context;
        request.response = response;
        response.request = request;
        return context;
    }

    respond(ctx) {
        const body = ctx.body;
        ctx.res.end(body);
    }
}

module.exports = Application