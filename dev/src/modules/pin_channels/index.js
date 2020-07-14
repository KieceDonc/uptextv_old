const watcher = require('../../watcher');
const twitch = require('../../utils/twitch')
const twitchAPI = require('../../utils/twitch-api')


const pin_icon_mouse_over_url = "https://sendeyo.com/up/d/154ed91095"
const pin_icon_no_mouse_url =''
const pinLiveColor = '#007aa3'

class PinChannelModule{
    constructor(){
        watcher.on('load.channel',()=>{addPinButton();  
          //https://id.twitch.tv/oauth2/authorize?client_id=4i47709s2gwve3eg1mki2brms3n9bt&redirect_uri=http://localhost.&response_type=token
          twitchAPI.get("",{"url":"https://api.twitch.tv/helix/users/follows?from_id="+(twitch.getCurrentUser().id)}).then((userFollows)=>{
              console.log(userFollows)
            }).catch((err)=>{
              console.log(err)
            })
          })          
        
        //this.load()
    }

    load(){
        createBlueClassColor()
        addPinSection()
        addStreamer("Ogaminglol","https://static-cdn.jtvnw.net/jtv_user_pictures/8dbce7bb-bb6e-4a3b-8121-ff262b717c81-profile_image-70x70.png","League of Legends","10 000",true)
        addStreamer("Ogaminglol","https://static-cdn.jtvnw.net/jtv_user_pictures/8dbce7bb-bb6e-4a3b-8121-ff262b717c81-profile_image-70x70.png","1 new video","Disconnected",false)
        //watcher.on('load.following', () => addPinButton());
      }
}

// setup side nav pin section to welcome pinned streamer
function addPinSection(){ 

  let parentDiv = document.getElementsByClassName('side-nav-section')[0] // getting div parent

  if(parentDiv!=null){
    // Start : Creating pin section
    let pinSection = document.createElement("div") 
    pinSection.className="tw-relative tw-transition-group"
    pinSection.id="sideNavePinSection"
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
  }
}


// this code add the pin button
// TODO need to handle when user don't follow streamer
// twitch standard to look like button follow / notification : 
function addPinButton(){

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
    button0.className="tw-align-items-center tw-align-middle tw-border-bottom-left-radius-medium tw-border-bottom-right-radius-medium tw-border-top-left-radius-medium tw-border-top-right-radius-medium tw-core-button tw-core-button--secondary tw-full-width tw-inline-flex tw-interactive tw-justify-content-center tw-overflow-hidden tw-relative"
  
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

function addStreamerToPinList(){

}

function deleteStreamerFromPinList(){
  
}

// use to add streamer in html / css 
// top div have the id of the streamer name ( to lower case )
// span of number of viewer have the id of = streamername ( to lower case ) + "viewercount"
// p of the current game of the id of = streamername ( to lower case ) + "currentgame"
function addStreamer(streamerName, streamerIcon, streamerGame, streamerViewerCount,isStreaming){ // TODO ADD EVENT

  let div0 = document.createElement("div")
  div0.className="tw-transition tw-transition--enter-done tw-transition__scale-over tw-transition__scale-over--enter-done"
  div0.style="transition-property: transform, opacity; transition-timing-function: ease; transition-duration: 250ms;"
  div0.id=streamerName.toLowerCase()

  let div1 = document.createElement("div")

  let div2 = document.createElement("div")
  div2.className="side-nav-card tw-align-items-center tw-flex tw-relative"

  let a0 = document.createElement("a")
  a0.className = "side-nav-card__link tw-align-items-center tw-flex tw-flex-nowrap tw-full-width tw-interactive tw-link tw-link--hover-underline-none tw-pd-x-1 tw-pd-y-05"
  a0.href="/"+streamerName.toLowerCase()

  let div3 = document.createElement("div")
  if(isStreaming){
    div3.className="side-nav-card__avatar tw-align-items-center tw-flex-shrink-0"
  }else{
    div3.className="side-nav-card__avatar side-nav-card__avatar--offline tw-align-items-center tw-flex-shrink-0"
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
  p1.id=streamerName.toLowerCase()+"currentgame"
  p1.title=streamerGame
  p1.innerHTML=streamerGame


  let div8 = document.createElement("div")
  div8.className="side-nav-card__live-status tw-flex-shrink-0 tw-mg-l-05"

  let div9 = document.createElement("div")
  let div10 = document.createElement("div")
  let div11 = document.createElement("div")
  if(isStreaming){

    div9.className = "tw-align-items-center tw-flex"
  
    //div10.className="tw-border-radius-rounded tw-channel-status-indicator tw-channel-status-indicator--live tw-channel-status-indicator--small tw-inline-block tw-relative"
    div10.className="tw-border-radius-rounded tw-channel-status-indicator-pin tw-channel-status-indicator--live tw-channel-status-indicator--small tw-inline-block tw-relative"

    div11.className="tw-mg-l-05"
  }


  let span0 = document.createElement("span")
  span0.className="tw-c-text-alt tw-font-size-6"
  span0.id=streamerName.toLowerCase()+"viewercount"
  span0.innerHTML=streamerViewerCount

  let mainDiv = document.getElementById("sideNavePinSection")
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
  if(isStreaming){
    div8.append(div9)
    div9.append(div10)
    div9.append(div11)
    div11.append(span0)
  }else{
    div8.append(span0)
  }
}

// modify a streamer viewver count from pin section by his name 
function modifyStreamerViewerCount(streamerName,streamerViewerCount){
  let span = document.getElementById((streamerName.toLowerCase()+"viewercount"))
  span.innerHTML=streamerViewerCount
}

// modify the streamer game from pin section by his name 
function modifyStreamerGame(streamerName,streamerCurrentGame){
  let p = document.getElementById((streamerName.toLowerCase()+"currentgame"))
  p.title=streamerCurrentGame
  p.innerHTML=streamerCurrentGame
}

// delete a streamer from pin section by his name 
function deleteStreamer(streamerName){
  let mainDiv = document.getElementById(streamerName.toLowerCase())
  mainDiv.remove()
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