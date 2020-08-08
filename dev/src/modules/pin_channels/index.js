const watcher = require('../../watcher');
const twitch = require('../../utils/twitch')
const uptexAPI = require('./uptex-api')
const debug = require('../../utils/debug')
const pinSection = require('./pinSection')
const pinButton = require('./pinButton')

// https://obfuscator.io/
// Subscribed channel
// hide pinned / followed / recommanded channel

const pinLiveColor = '#007aa3'


var _pinSection
var _pinButton

var userID // id of current user
var streamerID // id of streamerID
var pinnedStreamers = new Array() // array list of pinned streamers with their info


class PinChannelModule{
    constructor(){   
      createBlueClassColor() 
      watcher.on('load.sidenav',()=>{
        uptexAPI.getPinnedStreamers(userID).then((_pinnedStreamers)=>{
          pinnedStreamers = _pinnedStreamers   
          _pinSection = pinSection.setup(this)
        }).catch((err)=>{
          debug.error('error while trying to get pinned streamers through the api. err :',err )
        })
      })
      watcher.on('load.followbutton',()=>{
        streamerID = twitch.getCurrentChannel().id
        _pinButton = pinButton.setup(this)
      })      
    }

    getPinLiveColor(){
      return pinLiveColor
    }

    getUserID(){
      return userID
    }

    getStreamerID(){
      return streamerID
    }

    getPinnedStreamers(){
      return pinnedStreamers
    }

    setPinnedStreamers(_pinnedStreamers){
      pinnedStreamers = _pinnedStreamers
    }

    getPinSection(){
      return _pinSection
    }

    getStreamerIndex(_streamerID,_pinnedStreamers){
      return getStreamerIndex(_streamerID,_pinnedStreamers)
    }
}

// get streamer index in pinned streamers array
// _pinnedStreamers is not obligatory. If null it will parse pinnedStreamer array
// return -1 if not founded
function getStreamerIndex(_streamerID,_pinnedStreamers){
  let arrayToParse
  if(_pinnedStreamers){ // checking if we want to parse current pinnedStreamers array or a custom pinnedStreamers Array
      arrayToParse = _pinnedStreamers
  }else{
      arrayToParse = pinnedStreamers
  }


  if(arrayToParse.length==0){
      return -1
  }else{
      let founded = false
      let cmpt = 0
      do{
      if(_streamerID==parseInt(arrayToParse[cmpt].broadcaster_id)){
          founded=true
      }
      cmpt+=1
      }while(!founded&cmpt<arrayToParse.length)

      if(founded){
      return cmpt
      }else{
      return -1
      }
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

