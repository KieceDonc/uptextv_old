const watcher = require('../../watcher');
const twitch = require('../../utils/twitch')
const uptexAPI = require('./uptex-api')
const debug = require('../../utils/debug')

// https://obfuscator.io/

const pin_icon_mouse_over_url = "https://uptextv.com/pe/pin-icon.svg"
const pinLiveColor = '#007aa3'

const css_picture_profile_online = "side-nav-card__avatar tw-align-items-center tw-flex-shrink-0"
const css_picture_profile_offline = "side-nav-card__avatar side-nav-card__avatar--offline tw-align-items-center tw-flex-shrink-0"

var userID
var streamerID
var pinnedStreamers = new Array() // array list of pinned streamers with their info

var shortPinnedStreamerBy = [
  function(){ // Viewer
    let splitByOnlineAndOffline = getOnlineAndOfflinePinnedStreamers()
    splitByOnlineAndOffline.online = splitByOnlineAndOffline.online.sort(function(a,b){
      if(a.viewer_count>b.viewer_count){
        return -1
      }else if(a.viewer_count<b.viewer_count){
        return 1
      }else{
        return 0 
      }
    })
    pinnedStreamers = splitByOnlineAndOffline.online.concat(splitByOnlineAndOffline.offline)
  },

  function(){ // Streamer name
    shortPinnedStreamerByPropertie('broadcaster_name')
  },

  function(){ // Game name
    shortPinnedStreamerByPropertie('game_name')
  },

  function (){ // uptime
    shortPinnedStreamerByPropertie('started_at')
  },
]
var currentIndexShortBy=0; // index of the function to call to short by

class PinChannelModule{
    constructor(){    
      watcher.on('load.sidenav',()=>{
        this.sidenavload()
      })
      watcher.on('load.followbutton',()=>{
        streamerID = twitch.getCurrentChannel().id
        if(shouldAddPinButton()){
          addPinButton()
        }
      })      
    }

    sidenavload(){
      if(shouldAddPinSection()){
          userID = twitch.getCurrentUser().id
          uptexAPI.getPinnedStreamers(userID).then((_pinnedStreamers)=>{
            pinnedStreamers = _pinnedStreamers   
            if(pinnedStreamers.length>0){
              shortPinnedStreamerBy[0]()
            }
            addPinSection()
            setupPinSection()
            handleUpdateEach5min()
          }).catch((err)=>{
            debug.error('error while trying to get pinned streamers through the api. err :',err )
          })
      }
    }
}



// use right after pinnedstreamers received. It basically add pinned streamers in pin section
function setupPinSection(){
  for(let x=0;x<pinnedStreamers.length;x++){
    addStreamerInPinSection(pinnedStreamers[x])
  }
}

// setup side nav pin section to welcome pinned streamer
// pin section id ( main div ) = sideNavPinSection
function addPinSection(){ 
  let mainDivID = "sideNavPinSection"

  createBlueClassColor()

  let parentDiv = document.getElementsByClassName('side-nav-section')[0] // getting div parent

  if(parentDiv!=null){
    // Start : Creating pin section
    let pinSection = document.createElement("div") 
    pinSection.className="tw-relative tw-transition-group"
    pinSection.id=mainDivID
    parentDiv.prepend(pinSection) // placing pinSection on the top
    // End

    // Start : Creating title like " chaines épinglées "
    let parentTitleDiv = document.createElement("div")
    parentTitleDiv.className="side-nav-header tw-flex"


    let titleDiv = document.createElement("div")
    titleDiv.className="side-nav-header-text tw-mg-1 tw-pd-t-05"

    let titleH5 = document.createElement("h5")
    titleH5.className="tw-font-size-6 tw-semibold tw-upcase"
    titleH5.innerHTML="PINNED CHANNELS"


    parentDiv.prepend(parentTitleDiv)
    parentTitleDiv.appendChild(titleDiv)
    titleDiv.appendChild(titleH5)
    // End
  }else{
    console.log('parentdiv is null  ')
  }
}

// check if pin section exist
function shouldAddPinSection(){
  let mainDiv = document.getElementById('sideNavPinSection')
  return mainDiv==null
}

// this code add the pin button
// twitch standard to look like button follow / notification : 
// button use to add streamer id = 'pin-button'
function addPinButton(){

  let buttonID = "pin-button"
  let parentdiv = document.getElementsByClassName("tw-align-items-center tw-flex tw-full-height tw-overflow-hidden")[0]

  if(parentdiv!=null){

    let div0 = document.createElement("div")
    div0.className= "follow-btn__notification-toggle-container follow-btn__notification-toggle-container--visible tw-mg-l-1"

    let div1 = document.createElement("div")

    let div2 = document.createElement("div") // ADD MOUSE OVER / LEFT
    div2.addEventListener("mouseover",function(){
      button0.style.backgroundColor=pinLiveColor
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
      pinButtonTreatment()
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

// check if pin button exist
function shouldAddPinButton(){
  let button = document.getElementById('pin-button')
  return button==null
}

// handle pin / unpin, modification of colors etc 
function pinButtonTreatment(){
  if(isStreamerPinnedByUser()){
    deleteCurrentStreamer()
  }else{
    addCurrentStreamer()
  }
}

// function name is preally clear
function isStreamerPinnedByUser(){
  return getCurrentStreamerIndex()!=-1
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

// return the index of current streamer in pinnedStreamer array
function getCurrentStreamerIndex(){
  return getStreamerIndex(streamerID)
}

// handle front ( pin section ) and back ( api ) end way with some verification to add a streamer
function addCurrentStreamer(){
  uptexAPI.getStreamerInfo(twitch.getCurrentChannel().id).then((currentStreamerInfo)=>{
    pinnedStreamers.push(currentStreamerInfo)
    addCurrentStreamerInAPI()
    addStreamerInPinSection(currentStreamerInfo)
    updatePinSection()
  }).catch((err)=>{
    debug.error("error while trying to get current streamer info. err :",err)
  })
}

// handle front and back end way ( with some verification ) to delete a streamer
function deleteCurrentStreamer(){
  pinnedStreamers = pinnedStreamers.filter(e => e.broadcaster_id !== streamerID);
  deleteCurrentStreamerInAPI()
  deleteCurrentStreamerInPinSection()
}

// add the streamer in the database in api
function addCurrentStreamerInAPI(){
  uptexAPI.addStreamer(userID,streamerID).catch((err)=>{
    debug.error("failed in adding pinned streamer (api call failed). err :",err)
  })

}

// delete the streamer in the database in api
function deleteCurrentStreamerInAPI(){
  uptexAPI.deleteStreamer(userID,streamerID).catch((err)=>{
    debug.error("failed in deleting pinned streamer (api call failed). err :",err)
  })
}

// use to add streamer in html / css 
// top div have the id of the streamerID 
// div with css properties of picture profile have the id of streamerID+ "picture_profile"
// span of number of viewer have the id of = streamerID + "viewercount"
// p of the current game of the id of = streamerID + "currentgame"
function addStreamerInPinSection(streamerInfo){

  let _streamerID = streamerInfo.broadcaster_id
  let streamerIsStreaming = streamerInfo.isStreaming
  let streamerName = streamerInfo.display_name
  let streamerIcon = streamerInfo.profile_image_url
  let streamerGame = streamerInfo.game_name
  let streamerViewerCount = streamerInfo.viewer_count

  let div0 = document.createElement("div")
  div0.className="tw-transition tw-transition--enter-done tw-transition__scale-over tw-transition__scale-over--enter-done"
  div0.style="transition-property: transform, opacity; transition-timing-function: ease; transition-duration: 250ms;"
  div0.id=_streamerID

  let div1 = document.createElement("div")

  let div2 = document.createElement("div")
  div2.className="side-nav-card tw-align-items-center tw-flex tw-relative"

  let a0 = document.createElement("a")
  a0.className = "side-nav-card__link tw-align-items-center tw-flex tw-flex-nowrap tw-full-width tw-interactive tw-link tw-link--hover-underline-none tw-pd-x-1 tw-pd-y-05"
  a0.href="/"+streamerName.toLowerCase()

  let div3 = document.createElement("div")
  div3.id=_streamerID+"picture_profile"
  if(streamerIsStreaming){
    div3.className=css_picture_profile_online
  }else{
    div3.className=css_picture_profile_offline
  }

  let figure0 =  document.createElement("figure")
  figure0.className="tw-avatar tw-avatar--size-30"

  let img0 = document.createElement("img")
  img0.className="tw-block tw-border-radius-rounded tw-image tw-image-avatar"
  img0.alt=streamerName
  img0.src=streamerIcon

  let div4 = document.createElement("div")
  div4.className="tw-ellipsis tw-flex tw-full-width tw-justify-content-between"

  let div5 = document.createElement("div")
  div5.className="tw-ellipsis tw-full-width tw-mg-l-1"

  let div6 = document.createElement("div")
  div6.className="side-nav-card__title tw-align-items-center tw-flex"

  let p0 = document.createElement("p")
  p0.className="tw-c-text-alt tw-ellipsis tw-ellipsis tw-flex-grow-1 tw-font-size-5 tw-line-height-heading tw-semibold"
  p0.title=streamerName
  p0.innerHTML=streamerName

  let div7 = document.createElement("div")
  div7.className="side-nav-card__metadata tw-pd-r-05"

  let p1 = document.createElement("p")
  p1.className="tw-c-text-alt-2 tw-ellipsis tw-font-size-6 tw-line-height-heading"
  p1.id=_streamerID+"currentgame"
  if(streamerIsStreaming){
    p1.title=streamerGame
    p1.innerHTML=streamerGame
  }


  let div8 = document.createElement("div")
  div8.id=_streamerID+"usedForUnknow"
  div8.className="side-nav-card__live-status tw-flex-shrink-0 tw-mg-l-05"

  let div9 = document.createElement("div")
  div9.id=_streamerID+"unknow0"
  let div10 = document.createElement("div")
  div10.id=_streamerID+"unknow1"
  let div11 = document.createElement("div")
  div11.id=_streamerID+"unknow2"
  if(streamerIsStreaming){

    div9.className = "tw-align-items-center tw-flex"
  
    div10.className="tw-border-radius-rounded tw-channel-status-indicator-pin tw-channel-status-indicator--live tw-channel-status-indicator--small tw-inline-block tw-relative"

    div11.className="tw-mg-l-05"
  }


  let span0 = document.createElement("span")
  span0.className="tw-c-text-alt tw-font-size-6"
  span0.id=_streamerID+"viewercount"
  if(streamerIsStreaming){
    span0.innerHTML=getViewerCountWithSpaces(streamerViewerCount)
  }else{
    span0.innerHTML="Disconnected"
  }

  let mainDiv = document.getElementById("sideNavPinSection")
  mainDiv.appendChild(div0)
  div0.appendChild(div1)
  div1.appendChild(div2)
  div2.appendChild(a0)
  a0.appendChild(div3)
  div3.appendChild(figure0)
  figure0.appendChild(img0)
  a0.appendChild(div4)
  div4.appendChild(div5)
  div5.append(div6)
  div6.append(p0)
  div5.append(div7)
  div7.append(p1)
  div4.append(div8)
  if(streamerIsStreaming){
    div8.append(div9)
    div9.append(div10)
    div9.append(div11)
    div11.append(span0)
  }else{
    div8.append(span0)
  }
}

// delete streamer in html / css
function deleteStreamerInPinSection(streamerInfo){
  let _streamerID = streamerInfo.broadcaster_id
  let mainDiv = document.getElementById(_streamerID)
  if(mainDiv){
    mainDiv.remove()
  }
}

// delete a streamer from pin section by his id
function deleteCurrentStreamerInPinSection(){
  let mainDiv = document.getElementById(streamerID)
  mainDiv.remove()
}

// handle to update streamers info each 5 min
function handleUpdateEach5min(){
  setInterval(function(){    
    updatePinSection()
  },300000)
}

// handle every thing in html / css about update
// handle transition etc ....
function updatePinSection(){
  let oldPinnedStreamers = pinnedStreamers // use to calculate old and new position of pinned streamers
  updateStreamersInfo() // update information of each streamers in the array 'pinnedStreamers'
  shortPinnedStreamerBy[currentIndexShortBy]() // sort pinned streamers by desired fct ( ex : sort by viewver, game name, etc .....)
  pinnedStreamers.forEach((currentStreamerInfo)=>{
    let currentStreamerID = currentStreamerInfo.broadcaster_id
    let oldPosition = getStreamerIndex(currentStreamerID,oldPinnedStreamers)
    let newPosition = getStreamerIndex(currentStreamerID)
    if(newPosition!=oldPosition&&oldPosition!=-1){
      makeTranslateYForOneStreamerInPinSection(currentStreamerInfo,oldPosition,newPosition)
      setTimeout(function () { // use to replace in good order in html  
        deleteStreamerInPinSection(currentStreamerInfo)
        addStreamerInPinSection(currentStreamerInfo)
      }, 500);
    }
  })
}

// handle to update streamers info
function updateStreamersInfo(){
  let goesOnline = new Array()
  let goesOffline = new Array()
  let updateOnline = new Array()

  let oldPinnedStreamers = pinnedStreamers

  uptexAPI.getPinnedStreamers(userID).then((newPinnedStreamers)=>{
    for(let x = 0;x<newPinnedStreamers.length;x++){

      let newStreamerInfo = newPinnedStreamers[x]

      let oldStreamerInfo = -1
      for(let y=0;y<oldPinnedStreamers.length;y++){
        if(oldPinnedStreamers[y].broadcaster_id==newStreamerInfo.broadcaster_id){
          oldStreamerInfo=oldPinnedStreamers[y]
        }
      }
      
      if(oldStreamerInfo!=-1){ // checking is pinned streamer have been just added or not
        if(oldStreamerInfo.isStreaming === newStreamerInfo.isStreaming){// streamer was offline - > streamer is offline or streamer was online - > streamer is online
          if(newStreamerInfo.isStreaming == true){// streamer was online - > streamer is online
            updateOnline.push(newStreamerInfo)
          }
        }else{
          if(newStreamerInfo.isStreaming == true){// streamer was offline - > streamer is online
            goesOnline.push(newStreamerInfo)
          }else{// streamer was online - > streamer is offline
            goesOffline.push(newStreamerInfo)
          }
        }
      }
    }

    goesOnline.forEach(streamerInfo => {
      streamerGoesOnline(streamerInfo)
    });

    goesOffline.forEach(streamerInfo =>{
      streamerGoesOffline(streamerInfo)
    })

    updateOnline.forEach(streamerInfo=>{
      modifyStreamerGame(streamerInfo)
      modifyStreamerViewerCount(streamerInfo)
    })

  }).catch((err)=>{
    debug.error('error while trying to get pinned streamers through the api. err :',err )
  })
}

// MAKE A SHORT BUT SO FUCKING COOL ANIMATION TO PLACE THE STREAMER IN THE CORRECT POSITION ACCORDING TO THE SORT CRITERIA
// animation duration = 250 ms ( normaly, plz refer to css value 'transition-duration')
function makeTranslateYForOneStreamerInPinSection(streamerInfo,oldPosition,newPosition){
  let _streamerID = streamerInfo.broadcaster_id
  let mainDiv = document.getElementById(_streamerID)

  /*let size = getComputedStyle(document.documentElement).getPropertyValue('--button-size-large');
  let sizePadding = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--button-padding-y'));
  let sizeValue = parseFloat(size)
  let sizeUnity = deleteNumbers(size).replace('.','')*/

  let boxWidth = mainDiv.offsetHeight
  let translateValue = (newPosition-oldPosition)*boxWidth
  mainDiv.style.transform = "translateY("+translateValue+"px)";
}

// modify a streamer viewver count from pin section by his id
function modifyStreamerViewerCount(streamerInfo){
  let _streamerID = streamerInfo.broadcaster_id
  let streamerViewerCount = streamerInfo.viewer_count
  let span = document.getElementById((_streamerID+"viewercount"))
  span.innerHTML=getViewerCountWithSpaces(streamerViewerCount)
}

// modify the streamer game from pin section by his id
function modifyStreamerGame(streamerInfo){
  let _streamerID = streamerInfo.broadcaster_id
  let streamerCurrentGame = streamerInfo.game_name
  let p = document.getElementById(_streamerID+"currentgame")
  p.title=streamerCurrentGame
  p.innerHTML=streamerCurrentGame
}

// modify & handle css change to make a streamer offline in pin section
function streamerGoesOffline(streamerInfo){
  let _streamerID = streamerInfo.broadcaster_id

  modifyStreamerGame(streamerInfo)
  modifyStreamerViewerCount(streamerInfo)
  // changing css properties of picture profile ( make it grey )
  let div_profile_picture = document.getElementById(_streamerID+"profile_picture")
  div_profile_picture.className = css_picture_profile_offline
  
  // if you want to go offline you must delete this div
  // i think this div are used for the red online circle 
  let div_unknow_0 = document.getElementById(_streamerID+"unknow_0")
  let div_unknow_1 = document.getElementById(_streamerID+"unknow_1")
  let div_unknow_2 = document.getElementById(_streamerID+"unknow_2")
  div_unknow_0.parentElement.removeChild(div_unknow_0)
  div_unknow_1.parentElement.removeChild(div_unknow_1)
  div_unknow_2.parentElement.removeChild(div_unknow_2)
}

// modify & handle css change to make a streamer online in pin section
function streamerGoesOnline(streamerInfo){
  let _streamerID = streamerInfo.broadcaster_id
  modifyStreamerGame(streamerInfo)
  modifyStreamerViewerCount(modifyStreamerViewerCount)

  let div9 = document.createElement("div")
  div9.id=_streamerID+"unknow0"
  let div10 = document.createElement("div")
  div10.id=_streamerID+"unknow1"
  let div11 = document.createElement("div")
  div11.id=_streamerID+"unknow2"

  let divUsedForUnknow = document.getElementById(_streamerID+"usedForUnknow")
  divUsedForUnknow.appendChild(div9)
  div9.append(div10)
  div9.append(div11)
}

// short pinned streamer by a propertie
function shortPinnedStreamerByPropertie(propertieName){
  let splitByOnlineAndOffline = getOnlineAndOfflinePinnedStreamers()
    splitByOnlineAndOffline.online = splitByOnlineAndOffline.online.sort(sortBy(propertieName))
    pinnedStreamers = splitByOnlineAndOffline.online.concat(splitByOnlineAndOffline.offline)
}

// return an object like this {online:ARRAY,offline:ARRAY}
// online is list of pinned streamer online
// offline is list of pinned streamer offline
function getOnlineAndOfflinePinnedStreamers(){
  let offline = new Array()
  let online = new Array()
  pinnedStreamers.forEach((currentPinnedStreamer)=>{
    if(currentPinnedStreamer.isStreaming == true){
      online.push(currentPinnedStreamer)
    }else{
      offline.push(currentPinnedStreamer)
    }
  })
  return {'online' : online, 'offline' : offline}
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

// params : 53210, return 53 120. params : 6543210, return : 6 543 210 etc etc etc 
function getViewerCountWithSpaces(viewerCount){
  if(!viewerCount){
    return ''
  }
  if (!(typeof viewerCount === 'string' || viewerCount instanceof String)){// it's not a string
    viewerCount=viewerCount.toString()
  }
  let strSplit_n3 = new Array();
  for (let x = viewerCount.length; x >=0; x -= 3) {
    strSplit_n3.unshift(viewerCount.substring(x-3, x));
  }
  let withSpaces=''
    for(let x=0;x<strSplit_n3.length;x++){
        withSpaces+=strSplit_n3[x]+' '  
    }
    return withSpaces.substring(0,withSpaces.length-1)
}

// return a string with deleted numbers
function deleteNumbers(string){
  let deletedNumberString=''
  for(let x=0;x<string.length;x++){
    let currentChar = string[x]
    if(isNaN(currentChar)){
      deletedNumberString+=currentChar
    }
  }
  return deletedNumberString
}


module.exports = new PinChannelModule()

//addStreamer("Ogaminglol","https://static-cdn.jtvnw.net/jtv_user_pictures/8dbce7bb-bb6e-4a3b-8121-ff262b717c81-profile_image-70x70.png","League of Legends","10 000",true)
        //addStreamer("Ogaminglol","https://static-cdn.jtvnw.net/jtv_user_pictures/8dbce7bb-bb6e-4a3b-8121-ff262b717c81-profile_image-70x70.png","1 new video","Disconnected",false)

