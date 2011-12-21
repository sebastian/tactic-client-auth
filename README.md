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
- [0mq from source](https://github.com/zeromq/zeromq2-1)
