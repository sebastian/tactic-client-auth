var App, socket;
App = Em.Application.create();
App.Request = Em.Object.extend({
  client: 'ClientName',
  resource: 'ResourceName',
  timeStamp: 'TimeStamp',
  id: 1
});
App.requestController = Em.ArrayController.create({
  content: [],
  addRequest: function(request) {
    return this.addObject(request);
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
  }
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
    var r;
    console.log("approve from controller");
    r = this.get('content');
    return App.requestController.accept(r);
  },
  reject: function() {
    var r;
    console.log("deny from controller");
    r = this.get('content');
    return App.requestController.reject(r);
  }
});
App.requestsView = Em.View.extend({
  didInsertElement: function() {
    return ($("#requests-listview")).listview();
  }
});
App.activeRequestView = Em.View.extend({
  approve: function() {
    return console.log("approve");
  },
  deny: function() {
    return console.log("deny");
  }
});
App.RequestView = Em.View.extend({
  click: function() {
    var request;
    request = this.get('content');
    return App.activeRequest.setRequest(request);
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
$(function() {
  App.requestController.addRequest(App.Request.create({
    id: 1
  }));
  App.requestController.addRequest(App.Request.create({
    id: 2
  }));
  return App.requestController.addRequest(App.Request.create({
    id: 3
  }));
});