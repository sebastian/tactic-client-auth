# Client authenticator demo tactic

This is the web interface part of an authentication tactic.
When a signposts wishes to know if it should grant a client access to
a resource, a tactic can issue a request that is then displayed in
a webinterface where the signpost user or administrator manually grants or
denies a client access.

## Dependencies

This project depends on [node.js](http://nodejs.org/) being installed. I also recommend installing the node package manager ([npm](http://npmjs.org/)). If you are using npm, you can install the npm dependencies declared in `package.json` by running `npm install` in this projects root directory.

- [node.js](http://nodejs.org/)
- [npm](http://npmjs.org/)
- [socket.io](http://socket.io)

## Running application

The node application can be run as:

    node lib/web.js

as of this writing, the web app is listening on port 8080.

## Development

The application has been developed in coffeescript. The folder layout in use is
dictacted by anvil.js.

For ease of development, please install anvil.js

    npm install anvil.js -g

and have anvil in continuous integration mode while developing:

    anvil -h --ci

This ensures the coffeescript files are compiled on change.
HTML is automatically served out on port 3080. Running on the dev server will
not give you the server side node.js logic or the socket.io functionality, and
is therefore not very useful.
