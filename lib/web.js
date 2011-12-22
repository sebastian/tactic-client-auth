var RequestController, auth_server, file_server, fs, http, io, libpath, mime, path, port, reqController, server, url;
http = require('http');
libpath = require('path');
fs = require('fs');
url = require('url');
mime = require('mime');
path = ".";
port = 8080;
RequestController = (function() {
  function RequestController() {}
  RequestController.prototype.reqs = [];
  RequestController.prototype.registerRequest = function(client, resource, callback) {
    var data, id;
    id = "" + client + "-" + resource;
    data = {
      client: client,
      resource: resource,
      id: id
    };
    this.io.sockets.emit('new_request', data);
    data.callback = callback;
    return this.reqs.push(data);
  };
  RequestController.prototype.handleResponse = function(id, response) {
    var req, reqs, reqs_sans_responded, _i, _j, _k, _len, _len2, _len3, _ref, _ref2, _results;
    reqs = [];
    _ref = this.reqs;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      req = _ref[_i];
      if (req.id === id) {
        reqs.push(req);
      }
    }
    reqs_sans_responded = [];
    _ref2 = this.reqs;
    for (_j = 0, _len2 = _ref2.length; _j < _len2; _j++) {
      req = _ref2[_j];
      if (req.id !== id) {
        reqs_sans_responded.push(req);
      }
    }
    this.reqs = reqs_sans_responded;
    _results = [];
    for (_k = 0, _len3 = reqs.length; _k < _len3; _k++) {
      req = reqs[_k];
      _results.push(req.callback(response));
    }
    return _results;
  };
  RequestController.prototype.setIo = function(io) {
    this.io = io;
  };
  RequestController.prototype.getAllRequests = function() {
    return this.reqs;
  };
  return RequestController;
})();
reqController = new RequestController();
auth_server = function(request, response) {
  if (request.method === "POST" && request.url === "/requests") {
    request.on('data', function(json) {
      var data;
      data = JSON.parse(json);
      return reqController.registerRequest(data.client, data.resource, function(answer) {
        response.writeHead(200, {
          "Content-Type": "text/plain"
        });
        response.write(answer);
        return response.end();
      });
    });
    return true;
  } else {
    return false;
  }
};
file_server = function(request, response) {
  var filename, uri;
  uri = url.parse(request.url).pathname;
  filename = libpath.join(path, uri);
  if (filename === "./") {
    filename += "html";
  }
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
};
server = http.createServer(function(req, res) {
  return auth_server(req, res) || file_server(req, res);
}).listen(port);
io = require('socket.io').listen(server);
io.sockets.on('connection', function(socket) {
  socket.emit('new_requests', reqController.getAllRequests());
  socket.on('approve', function(request_id) {
    reqController.handleResponse(request_id, "approve");
    return socket.broadcast.emit('approve', {
      request_id: request_id
    });
  });
  return socket.on('reject', function(request_id) {
    reqController.handleResponse(request_id, "reject");
    return socket.broadcast.emit('reject', {
      request_id: request_id
    });
  });
});
reqController.setIo(io);