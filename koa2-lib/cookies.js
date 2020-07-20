

class Cookies {
    constructor(request, response, options) {
        this.request = request;
        this.response = response;
        if (options) {
            this.keys = options.keys;
            this.secure = options.secure;
        }
    }
    get(name, opts) {
        let header = this.request.headers["cookie"];
        let match = header.match(new RegExp(
            "(?:^|;) *" +
            name.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&") +
            "=([^;]*)")
        );
        return match[0];
    }
    set(name, value, opts) {

    }
}









