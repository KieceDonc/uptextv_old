(() => {
    if (!String.prototype.includes || !Array.prototype.findIndex) return;
    if (window.location.pathname.endsWith('.html')) return;
    if (!['www.twitch.tv', 'canary.twitch.tv', 'clips.twitch.tv', 'dashboard.twitch.tv'].includes(window.location.hostname)) return;
    if (window.Ember) return;

    const debug = require('./utils/debug');
    const watcher = require('./watcher');
    const cookies = require('cookies-js');
    const twitch = require('./utils/twitch');

    const userCookie = cookies.get('twilight-user');
    if (userCookie) {
        try {
            const {authToken, id, login, displayName} = JSON.parse(userCookie);
            twitch.setCurrentUser(authToken, id, login, displayName);
        } catch (_) {
            debug.log('error loading user from twilight user cookie');
        }
    }

    watcher.setup();

    require('./modules/side_groups/index.js', {mode: (base, files) => {
        return files.map(module => {
            return `
                try {
                    require('${module}');
                } catch (e) {
                    debug.error('Failed to ${module}', e.stack);
                }
            `;
        }).join(' ');
    }});

    debug.log(`uptextv loaded`);

    window.uptextv = {
        version: debug.version,
        settings: require('./settings'),
        watcher: {
            emitLoad: name => watcher.emit(`load.${name}`),
        },
    };
})();
