const debug = require('./utils/debug');
const SafeEventEmitter = require('./utils/safe-event-emitter');

class Watcher extends SafeEventEmitter {
    setup() {
        require('./watchers/routes')(this);
    
        debug.log('watcher started');
    }
}

module.exports = new Watcher();