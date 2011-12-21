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
  timeStamp: 'TimeStamp'
  id: 1


###############################
# Controllers
###############################

App.requestController = Em.ArrayController.create
  # Array of all the requests
  content: []

  addRequest: (request) -> @addObject request

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

App.activeRequest = Em.Object.create
  content: null

  setRequest: (request) ->
    @set('content', request)

  client: ( -> 
    c = @get('content')
    c.get('client') if c
  ).property('content.client')

  resource: ( -> 
    c = @get('content')
    c.get('resource') if c
  ).property('content.resource')

  accept: ->
    console.log "approve from controller"
    r = @get('content')
    App.requestController.accept r
  
  reject: ->
    console.log "deny from controller"
    r = @get('content')
    App.requestController.reject r


###############################
# Views
###############################

App.requestsView = Em.View.extend
  didInsertElement: ->
    ($ "#requests-listview").listview()

App.activeRequestView = Em.View.extend
  approve: ->
    console.log "approve"

  deny: ->
    console.log "deny"

App.RequestView = Em.View.extend
  click: ->
    request = @get('content')
    App.activeRequest.setRequest request

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

socket.on 'approve', (data) -> App.requestController.removeRequestById data.request_id

socket.on 'reject', (data) -> App.requestController.removeRequestById data.request_id

App.sendApproveRequest = (request) -> socket.emit 'approve', request.get('id')

App.sendDenyRequest = (request) -> socket.emit 'reject', request.get('id')

###############################
# DOM Ready
###############################
$ ->
  App.requestController.addRequest(App.Request.create(id:1))
  App.requestController.addRequest(App.Request.create(id:2))
  App.requestController.addRequest(App.Request.create(id:3))
