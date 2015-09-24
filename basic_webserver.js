var http = require("http");

//Make a server that serves up a basic hello world
http.createServer(function (req, res) {
  res.writeHead(200, {"Content-Type": "text/plain"});
  res.end("Hello World!\n");
}).listen(8080);

//Access at http://localhost:8080
console.log("Basic webserver running on port 8080.");
