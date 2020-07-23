let fs = require('fs')

let data = fs.readFileSync('./template.js').toString()
console.log(data)
data = data.replace(/\/.+\//g, 'haha')
console.log(data)

if (fs.existsSync('./results')) {
    fs.rmdirSync('./results', { recursive: true });
    fs.mkdirSync('./results');
}
fs.writeFileSync('./results/service.js', data)