let request = {
    get url() {
        return this.req.url;
    },
    set url(value) {
        this.req.url = value
    },
    get method() {
        return this.req.method;
    },
    set method(value) {
        this.req.method = value
    }
}

module.exports = request