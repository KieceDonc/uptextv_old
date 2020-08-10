const watcher = require('../../watcher');
const twitch = require('../../utils/twitch')
const uptexAPI = require('./uptex-api')
const debug = require('../../utils/debug')
const groupSection = require('./groupSection')
const pinButton = require('./pinButton');
const { group } = require('console');

const groupLiveColor = '#007aa3'


var groupsSection = new Array()
var _pinButton

var userID // id of current user
var streamerID // id of streamerID

class SideGroupsModule{
    constructor(){   
      createBlueClassColor() 
      watcher.on('load.sidenav',()=>{
        uptexAPI.getGroupsStreamers(userID)(userID).then((groups)=>{
          let index = 0;
          groups.forEach((currentGroup)=>{
            currentGroupSection = groupSection.setup(this,index,currentGroup)
            groupsSection.push(currentGroupSection)
          })
        }).catch((err)=>{
          debug.error('error while trying to get pinned streamers through the api. err :',err )
        })
      })
      watcher.on('load.followbutton',()=>{
        streamerID = twitch.getCurrentChannel().id
        _pinButton = pinButton.setup(this)
      })      
    }

    getGroupLiveColor(){
      return groupLiveCOlor
    }

    getUserID(){
      return userID
    }

    getStreamerID(){
      return streamerID
    }

    getGroupSection(index){
      return groupsSection[index]
    }

    getStreamerIndex(_streamerID,_pinnedStreamers){
      return getStreamerIndex(_streamerID,_pinnedStreamers)
    }
}

// create the css class of the color of the live button
// class name = .tw-channel-status-indicator-pin
// color can be modify on the top of this script
function createBlueClassColor(){
  var style = document.createElement('style');
  style.type = 'text/css';
  style.innerHTML = '.tw-channel-status-indicator-pin { background-color: '+pinLiveColor+'; }';
  document.getElementsByTagName('head')[0].appendChild(style);
}


module.exports = new PinChannelModule()

