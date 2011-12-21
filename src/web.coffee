http = require('http')
libpath = require('path')
fs = require('fs')
url = require('url')
mime = require('mime')

path = "."
port = 8088

# Write static files and stuff
server = http.createServer (request, response) ->
  uri = url.parse(request.url).pathname
  filename = libpath.join(path, uri)
  libpath.exists filename, (exists) ->
    unless exists
      response.writeHead 404, 
        "Content-Type": "text/plain"
      response.write "404 Not Found\n"
      response.end()
      return
    filename += '/index.html' if fs.statSync(filename).isDirectory()
    fs.readFile filename, "binary", (err, file) ->
      if err
        response.writeHead 500,
          "Content-Type": "text/plain"
        response.write err + "\n"
        response.end()
        return
      type = mime.lookup filename
      response.writeHead 200,
        "Content-Type": type
      response.write file, "binary"
      response.end()
.listen port

io = require('socket.io').listen(server)

io.sockets.on 'connection', (socket) ->
  socket.broadcast.emit 'new_user'

  socket.on 'approve', (request_id) ->
    console.log "Got approve for #{request_id}"
    socket.broadcast.emit 'approve', request_id: request_id

  socket.on 'reject', (request_id) ->
    console.log "Got reject for #{request_id}"
    socket.broadcast.emit 'reject', request_id: request_id
