const uptexAPI = require('./uptex-api')
const groupSortBy = require('./groupSortBy')
const debug = require('../../utils/debug')

const css_picture_profile_online = "side-nav-card__avatar tw-align-items-center tw-flex-shrink-0"
const css_picture_profile_offline = "side-nav-card__avatar side-nav-card__avatar--offline tw-align-items-center tw-flex-shrink-0"

var currentGroupID // convert current group name in ASCII code with '_' between each nulbers
var currentGroupID_normal = '' // current group id but normal and not in ascii
var currentGroup // object of this style {'name':'pinned streamers','list':ARRAY}
var sideGroupsModule // parent instance 
var currentGroupSortBy

class groupSection{
    constructor(_sideGroupsModule,_currentGroup){
        sideGroupsModule = _sideGroupsModule
        currentGroup = _currentGroup
        currentGroupID = currentGroup.name
        currentGroupID_normal = decryptGroupID(currentGroupID)
        if(shouldSetup()){
            setup()
            currentGroupSortBy = groupSortBy.setup(this)
            setupStreamers()
        }
    }

    currentGroupUpdate(oldGroup,newGroup){ // use to update currentGroup and them html / css 
        onCurrentGroupUpdate(oldGroup,newGroup)
    }

    updateVisual(){ // use to update html / css
        updateVisual(null)
    }

    addStreamer(_streamerID){
        uptexAPI.getStreamerInfo(_streamerID).then((streamerInfo)=>{
            addStreamerInHTML(streamerInfo)
        }).catch((err)=>{
            debug.error('error while calling api',err)
        })
        addStreamerInAPI(_streamerID)
    }

    deleteStreamer(_streamerID){
        deleteStreamerInHTML(_streamerID)
        deleteStreamerInAPI(_streamerID)
    }

    getCurrentGroupID(){
        return currentGroupID
    }
    
    getCurrentGroupID_normal(){
        return currentGroupID_normal
    }

    getCurrentList(){
        return currentGroup.list
    }

    setCurrentList(_list){
        currentGroup.list = _list
    }

    getStreamerIndex(_streamerID){ 
        // getting the index of the _streamerID in currentGroup.list
        // normally use to check if streamer is / isn't in list
        getStreamerIndex(_streamerID,null)
    }
}

// check if group section exist
function shouldSetup(){
    let idToFind =  currentGroupID+"_sideNavGroupSection"
    let mainDiv = document.getElementById(idToFind)
    return mainDiv==null
}

// setup side nav group section to welcome current group streamers
// group section id ( main div ) =(GROUP NAME IN ASCII)_sideNavGroupSection
function setup(){ 
    let mainDivID = currentGroupID+"_sideNavGroupSection"
    let parentDiv = document.getElementsByClassName('side-bar-contents')[0].firstChild.firstChild.firstChild // getting div parent
  
    if(parentDiv){
      // Start : Creating group section
      let groupSection = document.createElement("div") 
      groupSection.className="tw-relative tw-transition-group"
      groupSection.id=mainDivID
      parentDiv.prepend(groupSection) // placing groupSection on the top
      // End
  
      // Start : Creating title like " chaines épinglées "
      let parentTitleDiv = document.createElement("div")
      parentTitleDiv.className="side-nav-header tw-flex"
  
  
      let titleDiv = document.createElement("div")
      titleDiv.className="side-nav-header-text tw-mg-1 tw-pd-t-05"
  
      let titleH5 = document.createElement("h5")
      titleH5.className="tw-font-size-6 tw-semibold tw-upcase"
      titleH5.innerHTML=currentGroupID_normal
  
  
      parentDiv.prepend(parentTitleDiv)
      parentTitleDiv.appendChild(titleDiv)
      titleDiv.appendChild(titleH5)
      // End
    }else{
        debug.error('parentdiv is null, you should look at css properties about getElementsByClassName')
    }
}

// use right after currentGroup received. It basically add current group streamers in group section
function setupStreamers(){
    for(let x=0;x<currentGroup.list.length;x++){
        addStreamerInHTML(currentGroup.list[x])
    }
}

// use to add streamer in html / css 
// top div have the id of the (GROUP NAME IN ASCII)_+streamerID 
// div with css properties of picture profile have the id of (GROUP NAME IN ASCII)_+streamerID+ "picture_profile"
// span of number of viewer have the id of = (GROUP NAME IN ASCII)_+streamerID + "viewercount"
// p of the current game of the id of = (GROUP NAME IN ASCII)_+streamerID + "currentgame"
function addStreamerInHTML(streamerInfo){

    let _streamerID = streamerInfo.broadcaster_id
    let streamerIsStreaming = streamerInfo.isStreaming
    let streamerName = streamerInfo.display_name
    let streamerIcon = streamerInfo.profile_image_url
    let streamerGame = streamerInfo.game_name
    let streamerViewerCount = streamerInfo.viewer_count

    let div0 = document.createElement("div")
    div0.className="tw-transition tw-transition--enter-done tw-transition__scale-over tw-transition__scale-over--enter-done"
    div0.style="transition-property: transform, opacity; transition-timing-function: ease; transition-duration: 250ms;"
    div0.id=currentGroupID+_streamerID

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
    p1.id=currentGroupID+_streamerID+"currentgame"
    if(streamerIsStreaming){
        p1.title=streamerGame
        p1.innerHTML=streamerGame
    }


    let div8 = document.createElement("div")
    div8.id=currentGroupID+_streamerID+"usedForUnknow"
    div8.className="side-nav-card__live-status tw-flex-shrink-0 tw-mg-l-05"

    let div9 = document.createElement("div")
    div9.id=currentGroupID+_streamerID+"unknow0"
    let div10 = document.createElement("div")
    div10.id=currentGroupID+_streamerID+"unknow1"
    let div11 = document.createElement("div")
    div11.id=currentGroupID+_streamerID+"unknow2"
    if(streamerIsStreaming){

        div9.className = "tw-align-items-center tw-flex"

        div10.className="tw-border-radius-rounded tw-channel-status-indicator--live tw-channel-status-indicator--small tw-inline-block tw-relative"
        div10.style.setProperty("background-color", currentGroup.liveColor, "important");

        div11.className="tw-mg-l-05"
    }


    let span0 = document.createElement("span")
    span0.className="tw-c-text-alt tw-font-size-6"
    span0.id=currentGroupID+_streamerID+"viewercount"
    if(streamerIsStreaming){
        span0.innerHTML=getViewerCountWithSpaces(streamerViewerCount)
    }else{
        span0.innerHTML="Disconnected"
    }

    let mainDiv = document.getElementById("sideNavGroupSection")
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

function addStreamerInAPI(_streamerID){
    uptexAPI.addStreamer(currentGroupID,sideGroupsModule.getUserID(),_streamerID).catch((err)=>{
        debug.error("failed in adding pinned streamer (api call failed). err :",err)
    }) 
}

// delete streamer in html / css
function deleteStreamerInHTML(_streamerID){
    let idToFind = currentGroupID+_streamerID
    let mainDiv = document.getElementById(idToFind)
    if(mainDiv){
        mainDiv.remove()
    }
}

function deleteStreamerInAPI(_streamerID){
    uptexAPI.deleteStreamer(currentGroupID,sideGroupsModule.getUserID(),_streamerID).catch((err)=>{
        debug.error("failed in adding pinned streamer (api call failed). err :",err)
    }) 
}

// currentGroup has been update
// you must parse it and make thing with it 
function onCurrentGroupUpdate(oldGroup,newGroup){
    let goesOnline = new Array()
    let goesOffline = new Array()
    let updateOnline = new Array()
    currentGroup = newGroup
    newGroup.forEach((newStreamerInfo)=>{
        let oldStreamerInfo = -1
        for(let y=0;y<oldGroup.length;y++){ // trying to find oldStreamerInfo in oldGroup
            if(oldGroup[y].broadcaster_id==newStreamerInfo.broadcaster_id){
                oldStreamerInfo=oldGroup[y]
            }
        }
        
        if(oldStreamerInfo!=-1){ // checking if streamer have been just added or not
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
    })
    updateVisual(oldGroup)
}

// handle every thing in html / css about update
// handle transition etc ....
function updateVisual(oldGroup){
    if(!oldGroup){ 
        // sometimes you update currentGroup from onCurrentUpdate so you need it. 
        // sometimes you just want to update from groupSortBy so you don't need it
        oldGroup = currentGroup.slice()// use to calculate old and new position of streamers in current group
    }else{
        
    }
    currentGroupSortBy.sort()
    currentGroup.list.forEach((currentStreamerInfo)=>{
        let currentStreamerID = currentStreamerInfo.broadcaster_id
        let oldPosition = getStreamerIndex(currentStreamerID,oldGroup.list)
        let newPosition = getStreamerIndex(currentStreamerID)
        if(newPosition!=oldPosition&&oldPosition!=-1){
            makeTranslateYForOneStreamer(currentStreamerInfo,oldPosition,newPosition)
            setTimeout(function () { // use to replace in good order in html  
                currentGroup.list.forEach((currentStreamerInfo)=>{
                    deleteStreamerInHTML(currentStreamerInfo.broadcaster_id)
                    addStreamerInHTML(currentStreamerInfo)
                })
            }, 500);
        }
    })
}

// MAKE A SHORT BUT SO FUCKING COOL ANIMATION TO PLACE THE STREAMER IN THE CORRECT POSITION ACCORDING TO THE SORT CRITERIA
// animation duration = 250 ms ( normaly, plz refer to css value 'transition-duration')
function makeTranslateYForOneStreamer(streamerInfo,oldPosition,newPosition){
    let _streamerID = streamerInfo.broadcaster_id
    let mainDiv = document.getElementById(currentGroupID+_streamerID)

    let boxWidth = mainDiv.offsetHeight
    let translateValue = (newPosition-oldPosition)*boxWidth
    mainDiv.style.transform = "translateY("+translateValue+"px)";
}

// modify a streamer viewver count from group section by his id
function modifyStreamerViewerCount(streamerInfo){
    let _streamerID = streamerInfo.broadcaster_id
    let streamerViewerCount = streamerInfo.viewer_count
    let span = document.getElementById((currentGroupID+_streamerID+"viewercount"))
    span.innerHTML=getViewerCountWithSpaces(streamerViewerCount)
}

// modify the streamer game from group section by his id
function modifyStreamerGame(streamerInfo){
    let _streamerID = streamerInfo.broadcaster_id
    let streamerCurrentGame = streamerInfo.game_name
    let p = document.getElementById(currentGroupID+_streamerID+"currentgame")
    p.title=streamerCurrentGame
    p.innerHTML=streamerCurrentGame
}

// modify & handle css change to make a streamer offline in group section
function streamerGoesOffline(streamerInfo){
    let _streamerID = streamerInfo.broadcaster_id

    modifyStreamerGame(streamerInfo)
    modifyStreamerViewerCount(streamerInfo)
    // changing css properties of picture profile ( make it grey )
    let div_profile_picture = document.getElementById(currentGroupID+_streamerID+"profile_picture")
    div_profile_picture.className = css_picture_profile_offline

    // if you want to go offline you must delete this div
    // i think this div are used for the red online circle 
    let div_unknow_0 = document.getElementById(currentGroupID+_streamerID+"unknow_0")
    let div_unknow_1 = document.getElementById(currentGroupID+_streamerID+"unknow_1")
    let div_unknow_2 = document.getElementById(currentGroupID+_streamerID+"unknow_2")
    div_unknow_0.parentElement.removeChild(div_unknow_0)
    div_unknow_1.parentElement.removeChild(div_unknow_1)
    div_unknow_2.parentElement.removeChild(div_unknow_2)
}

// modify & handle css change to make a streamer online in group section
function streamerGoesOnline(streamerInfo){
    let _streamerID = streamerInfo.broadcaster_id
    modifyStreamerGame(streamerInfo)
    modifyStreamerViewerCount(streamerInfo)

    let div9 = document.createElement("div")
    div9.id= currentGroupID+_streamerID+"unknow0"
    let div10 = document.createElement("div")
    div10.id=currentGroupID+_streamerID+"unknow1"
    let div11 = document.createElement("div")
    div11.id=currentGroupID+_streamerID+"unknow2"

    let divUsedForUnknow = document.getElementById(currentGroupID+_streamerID+"usedForUnknow")
    divUsedForUnknow.appendChild(div9)
    div9.append(div10)
    div9.append(div11)
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


// get streamer index in current group list streamers array
// _currentGroupList is not obligatory. If null it will parse _currentGroup.list array
// return -1 if not founded
function getStreamerIndex(_streamerID,_currentGroup){
    let arrayToParse
    if(_currentGroup){ // checking if we want to parse current group list array or a custom group list Array
        arrayToParse = _currentGroup.list
    }else{
        arrayToParse = currentGroup.list
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

/**
 * group id is in ascii code and each letter is separate by _
 * ex:
 * 116_116_116 
 * ttt
 */

function decryptGroupID(cryptedGroupID){
    let groupID = ''
    let eachLetterInASCII = cryptedGroupID.split('_')
    eachLetterInASCII.forEach((currentASCIICode)=>{
        groupID+=String.fromCharCode(currentASCIICode)
    })
    return groupID
}


module.exports = {
    setup:function(_sideGroupsModule,_currentGroup){
        return new groupSection(_sideGroupsModule,_currentGroup)
    }
}