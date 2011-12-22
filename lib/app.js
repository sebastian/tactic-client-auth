var App, socket;
App = Em.Application.create();
App.Request = Em.Object.extend({
  client: 'ClientName',
  resource: 'ResourceName',
  id: 1
});
App.requestController = Em.ArrayController.create({
  content: [],
  addRequest: function(request_data) {
    var request;
    request = App.Request.create({
      client: request_data.client,
      resource: request_data.resource,
      id: request_data.id
    });
    return this.pushObject(request);
  },
  addRequests: function(requests_data) {
    var data, _i, _len, _results;
    _results = [];
    for (_i = 0, _len = requests_data.length; _i < _len; _i++) {
      data = requests_data[_i];
      _results.push(this.addRequest(data));
    }
    return _results;
  },
  removeRequest: function(request) {
    return this.removeObject(request);
  },
  removeRequestById: function(id) {
    var r, request, requests_to_remove, _i, _j, _len, _len2, _ref, _results;
    requests_to_remove = [];
    _ref = this.get('content');
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      r = _ref[_i];
      if (r.get('id') === id) {
        requests_to_remove.push(r);
      }
    }
    _results = [];
    for (_j = 0, _len2 = requests_to_remove.length; _j < _len2; _j++) {
      request = requests_to_remove[_j];
      _results.push(this.removeRequest(request));
    }
    return _results;
  },
  accept: function(request) {
    this.removeRequest(request);
    return App.sendApproveRequest(request);
  },
  reject: function(request) {
    this.removeRequest(request);
    return App.sendDenyRequest(request);
  },
  hasRequests: (function() {
    return this.get('length') !== 0;
  }).property('@each')
});
App.activeRequest = Em.Object.create({
  content: null,
  setRequest: function(request) {
    return this.set('content', request);
  },
  client: (function() {
    var c;
    c = this.get('content');
    if (c) {
      return c.get('client');
    }
  }).property('content.client'),
  resource: (function() {
    var c;
    c = this.get('content');
    if (c) {
      return c.get('resource');
    }
  }).property('content.resource'),
  accept: function() {
    return App.requestController.accept(this.get('content'));
  },
  reject: function() {
    return App.requestController.reject(this.get('content'));
  }
});
App.requestsView = Em.View.extend({
  didInsertElement: function() {
    return ($("#requests-listview")).listview();
  }
});
App.RequestView = Em.View.extend({
  didInsertElement: function() {
    return ($("#requests-listview")).listview();
  },
  click: function() {
    return App.activeRequest.setRequest(this.get('content'));
  }
});
App.ActionButton = Em.View.extend({
  action: null,
  tagName: "div",
  click: function() {
    if (this.get('action') === "accept") {
      App.activeRequest.accept();
    }
    if (this.get('action') === "reject") {
      return App.activeRequest.reject();
    }
  }
});
socket = io.connect();
socket.on('new_request', function(data) {
  return App.requestController.addRequest(data);
});
socket.on('new_requests', function(data) {
  return App.requestController.addRequests(data);
});
socket.on('approve', function(data) {
  return App.requestController.removeRequestById(data.request_id);
});
socket.on('reject', function(data) {
  return App.requestController.removeRequestById(data.request_id);
});
App.sendApproveRequest = function(request) {
  return socket.emit('approve', request.get('id'));
};
App.sendDenyRequest = function(request) {
  return socket.emit('reject', request.get('id'));
};