const http = require('http');

const server = http.createServer((req, res) => {
    res.writeHead(200);
    res.end('Hello World');
})

server.listen(3001, () => {
    console.log('node原生服务器启动，监听端口：3001')
})