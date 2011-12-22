###############################
# Main application
###############################
App = Em.Application.create()


###############################
# Models
###############################

App.Request = Em.Object.extend
  client: 'ClientName'
  resource: 'ResourceName'
  id: 1


###############################
# Controllers
###############################

App.requestController = Em.ArrayController.create
  # Array of all the requests
  content: []

  addRequest: (request_data) -> 
    request = App.Request.create
      client: request_data.client
      resource: request_data.resource
      id: request_data.id
    @pushObject request
  addRequests: (requests_data) ->  @addRequest data for data in requests_data

  removeRequest: (request) -> @removeObject request

  removeRequestById: (id) ->
    requests_to_remove = []
    requests_to_remove.push r for r in @get('content') when r.get('id') == id
    @removeRequest request for request in requests_to_remove

  accept: (request) ->
    @removeRequest request
    App.sendApproveRequest request

  reject: (request) ->
    @removeRequest request
    App.sendDenyRequest request
  
  hasRequests: (-> @get('length') != 0).property('@each')

App.activeRequest = Em.Object.create
  content: null

  setRequest: (request) -> @set('content', request)

  client: ( -> 
    c = @get('content')
    c.get('client') if c
  ).property('content.client')

  resource: ( -> 
    c = @get('content')
    c.get('resource') if c
  ).property('content.resource')

  accept: -> App.requestController.accept @get('content')
  reject: -> App.requestController.reject @get('content')


###############################
# Views
###############################

App.requestsView = Em.View.extend
  didInsertElement: -> ($ "#requests-listview").listview()

App.RequestView = Em.View.extend
  didInsertElement: -> ($ "#requests-listview").listview()
  click: -> App.activeRequest.setRequest @get('content')

App.ActionButton = Em.View.extend
  action: null
  tagName: "div"

  click: ->
    App.activeRequest.accept() if @get('action') == "accept"
    App.activeRequest.reject() if @get('action') == "reject"


###############################
# Websocket
###############################

socket = io.connect()
socket.on 'new_request', (data) -> App.requestController.addRequest data
socket.on 'new_requests', (data) -> App.requestController.addRequests data
socket.on 'approve', (data) -> App.requestController.removeRequestById data.request_id
socket.on 'reject', (data) -> App.requestController.removeRequestById data.request_id

App.sendApproveRequest = (request) -> socket.emit 'approve', request.get('id')
App.sendDenyRequest = (request) -> socket.emit 'reject', request.get('id')
