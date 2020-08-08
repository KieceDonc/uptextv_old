const uptexAPI = require('./uptex-api')
const debug = require('../../utils/debug')
const pin_icon_mouse_over_url = "https://uptextv.com/pe/pin-icon.svg"

var pinChannelModule

class pinButton{
    constructor(_pinChannelModule){
        pinChannelModule = _pinChannelModule
        if(shouldSetup()){
            setup()
        }
    }
}

// check if pin button exist
function shouldSetup(){
    let button = document.getElementById('pin-button')
    return button==null
}

// this code add the pin button
// twitch standard to look like button follow / notification : 
// button use to add streamer id = 'pin-button'
function setup(){
    let buttonID = "pin-button"
    let parentdiv = document.getElementsByClassName("tw-align-items-center tw-flex tw-full-height tw-overflow-hidden")[0]
  
    if(parentdiv!=null){
  
      let div0 = document.createElement("div")
      div0.className= "follow-btn__notification-toggle-container follow-btn__notification-toggle-container--visible tw-mg-l-1"
  
      let div1 = document.createElement("div")
  
      let div2 = document.createElement("div") // ADD MOUSE OVER / LEFT
      div2.addEventListener("mouseover",function(){
        button0.style.backgroundColor=pinChannelModule.getPinLiveColor()
      })
      div2.addEventListener("mouseleave",function(){
        let style = getComputedStyle(document.body);
        button0.style.backgroundColor= style.getPropertyValue("var(--color-background-base) !important")
      })
  
      let div3 = document.createElement("div")
      div3.className="tw-border-radius-medium tw-c-background-base tw-inline-flex tw-overflow-hidden"
  
      let button0 = document.createElement("button") // HANDLE PIN / UNPIN / ADD TO SIDE SECTION / DELETE FROM SIDE SECTION
      button0.id=buttonID
      button0.className="tw-align-items-center tw-align-middle tw-border-bottom-left-radius-medium tw-border-bottom-right-radius-medium tw-border-top-left-radius-medium tw-border-top-right-radius-medium tw-core-button tw-core-button--secondary tw-full-width tw-inline-flex tw-interactive tw-justify-content-center tw-overflow-hidden tw-relative"
      //button0.onclick=console.log("log")
      button0.addEventListener('click', function(){
        buttonTreatment()
      })
  
      let div4 = document.createElement("div")
      div4.className="tw-align-items-center tw-core-button-label tw-flex tw-flex-grow-0"
    
      let div5 = document.createElement("div")
      div5.className="tw-flex-grow-0"
  
      let div6 = document.createElement("div")
      div6.className="tw-align-items-center tw-flex tw-justify-content-center"
  
      let div7 = document.createElement("div")
      div7.className="tw-align-items-center tw-flex tw-justify-content-center tw-mg-r-0"
      div7.style="transform: translateX(0px) scale(1); transition: transform 300ms ease 0s;"
  
      let div8 = document.createElement("div")
      div8.className="tw-animation tw-animation--bounce-in tw-animation--duration-long tw-animation--fill-mode-both tw-animation--timing-ease"
  
      let div9 = document.createElement("div")
      div9.className="tw-align-items-center tw-flex tw-justify-content-center"
  
      let figure0 = document.createElement("figure")
      figure0.className="tw-svg"
  
      let img0 = document.createElement("img")
      img0.className="tw-svg__asset tw-svg__asset--inherit tw-svg__asset--notificationbell"
      img0.src= pin_icon_mouse_over_url//browser.runtime.getURL("../src/assets/icon/icon-pin-mouse-over.svg");
  
      let span0 = document.createElement("span")
      span0.style="opacity: 1; transform: translateX(0px); transition: all 300ms ease 300ms;"
  
      parentdiv.appendChild(div0)
      div0.appendChild(div1)
      div1.appendChild(div2)
      div2.appendChild(div3)
      div3.appendChild(button0)
      button0.append(div4)
      div4.appendChild(div5)
      div5.appendChild(div6)
      div6.appendChild(div7)
      div7.appendChild(div8)
      div8.appendChild(div9)
      div9.appendChild(figure0)
      figure0.appendChild(img0)
      div8.appendChild(span0)
    }
}

// handle pin / unpin, modification of colors etc 
function buttonTreatment(){
    let pinSection = pinChannelModule.getPinSection()
    let pinnedStreamers = pinChannelModule.getPinnedStreamers()
    let userID = pinChannelModule.getUserID()
    let streamerID = pinChannelModule.getStreamerID()

    if(isStreamerPinnedByUser(streamerID)){
        deleteCurrentStreamer(userID,streamerID,pinnedStreamers,pinSection)
    }else{
        addCurrentStreamer(userID,streamerID,pinnedStreamers,pinSection)
        
    }
}

// function name is preally clear
function isStreamerPinnedByUser(streamerID){
    return pinChannelModule.getStreamerIndex(streamerID)!=-1
}

// handle front ( pin section ) and back ( api ) end way with some verification to add a streamer
function addCurrentStreamer(userID,streamerID,pinnedStreamers,pinSection){
    uptexAPI.getStreamerInfo(streamerID).then((currentStreamerInfo)=>{
        pinnedStreamers.push(currentStreamerInfo)
        addCurrentStreamerInAPI(userID,streamerID)
        pinSection.addStreamer(currentStreamerInfo)
        pinSection.update()
    }).catch((err)=>{
        debug.error("error while trying to get current streamer info. err :",err)
    })
}

// add the streamer in the database in api
function addCurrentStreamerInAPI(userID,streamerID){
    uptexAPI.addStreamer(userID,streamerID).catch((err)=>{
        debug.error("failed in adding pinned streamer (api call failed). err :",err)
    })    
}

// handle front and back end way ( with some verification ) to delete a streamer
function deleteCurrentStreamer(userID,streamerID,pinnedStreamers,pinSection){
    uptexAPI.getStreamerInfo(streamerID).then((currentStreamerInfo)=>{
        pinnedStreamers = pinnedStreamers.filter(e => e.broadcaster_id !== streamerID);
        deleteCurrentStreamerInAPI()
        pinSection.deleteStreamer(currentStreamerInfo)
    }).catch((err)=>{
        debug.error("error while trying to get current streamer info. err :",err)
    })
}
    
    // delete the streamer in the database in api
function deleteCurrentStreamerInAPI(userID,streamerID){
    uptexAPI.deleteStreamer(userID,streamerID).catch((err)=>{
        debug.error("failed in deleting pinned streamer (api call failed). err :",err)
    })
}

module.exports = {
    setup:function(_pinChannelModule){
        return new pinButton(_pinChannelModule)
    }
}