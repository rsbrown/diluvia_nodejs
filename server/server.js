var http    = require("io"),
    io      = require("socket.io");

server = http.createServer(function (req, res) {
    var path = url.parse(req.url).pathname;
    switch (path) {
        case "/":
            req.writeHead(200, { "Content-type": "text/html" });
            fs.read
            break;
    }
})