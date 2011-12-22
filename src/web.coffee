#############
# CLIENT AUTH
#
# This web application provides a webservice
# that allows a user to manually allow or disallow
# a user from accessing a signpost resource.
#
# A signpost tactic issues a request to this 
# webservice, which then in turn displays the
# request to the signpost administrator/user
# who then manually has to approve or decline
# the request.
#
#############

http = require('http')
libpath = require('path')
fs = require('fs')
url = require('url')
mime = require('mime')

path = "."
port = 8080


#############
# REQUESTS CLASS
#
# Maintains a list of pending requests so that freshly connected clients have
# requests to display.
#
#############
class RequestController
  reqs: []

  registerRequest: (client, resource, callback) ->
    id = "#{client}-#{resource}"
    data =
      client: client
      resource: resource
      id: id
    @io.sockets.emit 'new_request', data
    data.callback = callback
    @reqs.push data

  handleResponse: (id, response) ->
    # FIXME: Damn, this is ugly... how better to do this?
    reqs = []
    reqs.push(req) for req in @reqs when req.id == id
    reqs_sans_responded = []
    reqs_sans_responded.push(req) for req in @reqs when req.id != id
    @reqs = reqs_sans_responded
    # Run callback for waiting requests
    req.callback(response) for req in reqs

  setIo: (@io) -> 

  getAllRequests: -> @reqs

reqController = new RequestController()


#############
# ISSUING APPROVAL REQUESTS
#
# Signposts can issue authentication
# requests to the authentication app using
# the web interface.
#
# New requests are sent through:
#
# POST: /requests
#
# Requests should contain the following JSON post data:
#   {"client":CLIENT, "resource":RESOURCE}
#
# Example:
#   curl -d "{\"client\":\"macbook.kle.io\",\"resource\":\"iphone.kle.io\"}" \
#       http://localhost:8080/requests
#
#############
auth_server = (request, response) ->
  if request.method == "POST" and request.url == "/requests"
    request.on 'data', (json) ->
      data = JSON.parse(json)
      reqController.registerRequest data.client, data.resource, (answer) ->
        response.writeHead 200,
          "Content-Type": "text/plain"
        response.write answer
        response.end()
    # We could deal with the request
    true
  else
    # We could not deal with the request,
    # let the next server in the chain have a go
    false


#############
# STATIC FILES
#
# Server for serving static file.
# More specifically what needs serving is the
# client side javascript and the html file.
#
#############
file_server = (request, response) ->
  uri = url.parse(request.url).pathname
  filename = libpath.join(path, uri)
  # We want to serve html content out of the html folder
  filename += "html" if filename == "./"
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


#############
# HTTP SERVER
#
# Serve the http resource functions specified above
#
#############
server = http.createServer (req, res) ->
  auth_server(req, res) or file_server(req, res)
.listen port


#############
# SOCKET.IO
#
# Deals with communication between clients and
# the pending client authentications.
#
#############
io = require('socket.io').listen server

io.sockets.on 'connection', (socket) ->
  # Send the client a list of all pending requests
  socket.emit 'new_requests', reqController.getAllRequests()

  socket.on 'approve', (request_id) ->
    # Send response back to the signpost tactic
    reqController.handleResponse request_id, "approve"
    # Remove client from other web clients
    socket.broadcast.emit 'approve', request_id: request_id

  socket.on 'reject', (request_id) ->
    # Send response back to the signpost tactic
    reqController.handleResponse request_id, "reject"
    # Remove client from other web clients
    socket.broadcast.emit 'reject', request_id: request_id

# Register the socket with the request controller
reqController.setIo(io)
