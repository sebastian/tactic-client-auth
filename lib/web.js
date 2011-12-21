var fs, http, io, libpath, mime, path, port, server, url;
http = require('http');
libpath = require('path');
fs = require('fs');
url = require('url');
mime = require('mime');
path = ".";
port = 8088;
server = http.createServer(function(request, response) {
  var filename, uri;
  uri = url.parse(request.url).pathname;
  filename = libpath.join(path, uri);
  return libpath.exists(filename, function(exists) {
    if (!exists) {
      response.writeHead(404, {
        "Content-Type": "text/plain"
      });
      response.write("404 Not Found\n");
      response.end();
      return;
    }
    if (fs.statSync(filename).isDirectory()) {
      filename += '/index.html';
    }
    return fs.readFile(filename, "binary", function(err, file) {
      var type;
      if (err) {
        response.writeHead(500, {
          "Content-Type": "text/plain"
        });
        response.write(err + "\n");
        response.end();
        return;
      }
      type = mime.lookup(filename);
      response.writeHead(200, {
        "Content-Type": type
      });
      response.write(file, "binary");
      return response.end();
    });
  });
}).listen(port);
io = require('socket.io').listen(server);
io.sockets.on('connection', function(socket) {
  socket.broadcast.emit('new_user');
  socket.on('approve', function(request_id) {
    console.log("Got approve for " + request_id);
    return socket.broadcast.emit('approve', {
      request_id: request_id
    });
  });
  return socket.on('reject', function(request_id) {
    console.log("Got reject for " + request_id);
    return socket.broadcast.emit('reject', {
      request_id: request_id
    });
  });
});