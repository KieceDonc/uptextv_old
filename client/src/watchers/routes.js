const $ = require('jquery');
const twitch = require('../utils/twitch');
const debug = require('../utils/debug');
const domObserver = require('../observers/dom');
const historyObserver = require('../observers/history');

let watcher;
let currentPath = '';
let currentRoute = '';
let sidenav_loaded = false
let followButton = null
let oldFollowButton = ''

const loadPredicates = {
    following: () => !!$('.tw-tabs div[data-test-selector="ACTIVE_TAB_INDICATOR"]').length,
    followbar: () => {
        // you had multiple problems with this 'follow bar'
        // on  route change, follow bar isn't update directly
        // it cause multiple problems with pinButton.js
        // you have to manually check when it's update
        followButton = $('.follow-btn__follow-btn')[0]
        if(followButton){
            if(followButton!=oldFollowButton){
                oldFollowButton=followButton
                debug.log(twitch.updateCurrentChannel())
                return true
            }else{
                return null
            }
        }else{
            return null
        }
    },
    channel: () => {
        const href = (
            $('.channel-header__user-avatar img').attr('src') ||
            $('h3[data-test-selector="side-nav-channel-info__name_link"] a').attr('href') ||
            $('.channel-info-content img.tw-image-avatar').attr('src')
        );
        return !!href && !!twitch.updateCurrentChannel();
    },
    player: () => !!twitch.getCurrentPlayer(),
    vod: () => !!twitch.updateCurrentChannel(),
    homepage: () => !!$('.front-page-carousel .video-player__container').length,
    sidenav: () => !!$('.side-nav-section').length
};

const routes = {
    HOMEPAGE: 'HOMEPAGE',
    DIRECTORY_FOLLOWING_LIVE: 'DIRECTORY_FOLLOWING_LIVE',
    DIRECTORY_FOLLOWING: 'DIRECTORY_FOLLOWING',
    DIRECTORY: 'DIRECTORY',
    CHANNEL: 'CHANNEL',
    CHANNEL_SQUAD: 'CHANNEL_SQUAD',
    DASHBOARD: 'DASHBOARD',
    VOD: 'VOD'
};

const routeKeysToPaths = {
    [routes.HOMEPAGE]: /^\/$/i,
    [routes.DIRECTORY_FOLLOWING_LIVE]: /^\/directory\/following\/live$/i,
    [routes.DIRECTORY_FOLLOWING]: /^\/directory\/following$/i,
    [routes.DIRECTORY]: /^\/directory/i,
    [routes.VOD]: /^(\/videos\/[0-9]+|\/[a-z0-9-_]+\/clip\/[a-z0-9-_]+)$/i,
    [routes.DASHBOARD]: /^(\/[a-z0-9-_]+\/dashboard|\/u\/[a-z0-9-_]+\/stream-manager)/i,
    [routes.CHANNEL_SQUAD]: /^\/[a-z0-9-_]+\/squad/i,
    [routes.CHANNEL]: /^\/[a-z0-9-_]+/i
};

function waitForLoad(type, context = null) {
    let timeout;
    let interval;
    const startTime = Date.now();
    return Promise.race([
        new Promise(resolve => {
            timeout = setTimeout(resolve, 15000);
        }),
        new Promise(resolve => {
            const loaded = loadPredicates[type];
            if (loaded(context)) {
                resolve();
                return;
            }
            interval = setInterval(() => loaded(context) && resolve(), 100);
        })
    ]).then(() => {
        debug.log(`waited for ${type} load: ${Date.now() - startTime}ms`);
        clearTimeout(timeout);
        clearInterval(interval);
    }).then(() => watcher.emit('load'));
}

function getRouteFromPath(path) {
    let route = null;
    for (const name of Object.keys(routeKeysToPaths)) {
        const regex = routeKeysToPaths[name];
        if (!regex.test(path)) continue;
        route = name;
        break;
    }

    // twitch's embed subdomain only supports channel view
    if (route === routes.HOMEPAGE && location.hostname === 'embed.twitch.tv') {
        return routes.CHANNEL;
    }

    return route;
}

function onRouteChange(location) {
    const lastPath = currentPath
    const lastRoute = currentRoute;
    const path = location.pathname;
    const route = getRouteFromPath(path);

    debug.log(`New route: ${location.pathname} as ${route}`);

    // trigger on all loads (like resize functions)
    watcher.emit('load');

    currentPath = path;
    currentRoute = route;
    if (currentPath === lastPath) return;

    if(!sidenav_loaded){
        sidenav_loaded = true
        waitForLoad('sidenav').then(() => {
            watcher.emit('load.sidenav')
        })
    }


    switch (route) {
        case routes.DIRECTORY_FOLLOWING:
            if (lastRoute === routes.DIRECTORY_FOLLOWING_LIVE) break;
            waitForLoad('following').then(() => watcher.emit('load.directory.following'));
            waitForLoad('followbar').then(() => watcher.emit('load.followbar'));
            break;
        case routes.VOD:
            waitForLoad('vod').then(() => watcher.emit('load.vod'));
            waitForLoad('player').then(() => watcher.emit('load.player'));
            break;
        case routes.CHANNEL_SQUAD:
            waitForLoad('player').then(() => watcher.emit('load.player'));
            break;
        case routes.CHANNEL:
            waitForLoad('channel').then(() => watcher.emit('load.channel'));
            waitForLoad('player').then(() => watcher.emit('load.player'));
            waitForLoad('followbar').then(() => watcher.emit('load.followbar'));
            break;
        case routes.HOMEPAGE:
            waitForLoad('homepage').then(() => watcher.emit('load.homepage'));
            break;
    }
}


module.exports = watcher_ => {
    watcher = watcher_;
    
    historyObserver.on('pushState', location => onRouteChange(location));
    historyObserver.on('replaceState', location => onRouteChange(location));
    historyObserver.on('popState', location => onRouteChange(location));
    onRouteChange(location);

    // force reload player when the player gets recreated
    domObserver.on('.persistent-player', (node, isConnected) => {
        if (!isConnected) return;
        waitForLoad('player').then(() => watcher.emit('load.player'));
    });
};