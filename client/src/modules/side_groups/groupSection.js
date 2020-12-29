const groupSortBy = require('./groupSortBy')
const debug = require('../../utils/debug')
const twitch = require('../../utils/twitch')
const darkmode = require('../../watchers/darkmode.js')
const uptextvAPI = require('../../utils/uptextv-api')
const uptextvIMG = require('./../../utils/uptextv-image').get()

const css_picture_profile_online = "side-nav-card__avatar tw-align-items-center tw-flex-shrink-0"
const css_picture_profile_offline = "side-nav-card__avatar side-nav-card__avatar--offline tw-align-items-center tw-flex-shrink-0"

class groupSection{

    constructor(_groupObject,_sideGroupsModule){
        this.setGroupObject(_groupObject)
        this.groupObject['name_normal'] = decryptGroupID(this.getGroupID())
        this.sideGroupsModule=_sideGroupsModule

        if(shouldSetup(this.getGroupID())){
            setup(this)
            this.groupSortBy = groupSortBy.setup(this)
            this.sortStreamer()
            this.getGroupList().forEach((currentStreamerInfo)=>{
                // you're passing false for isGroupIsHiden to have a nice animation hidding all streamers
                addStreamerInHTML(this.getGroupID(),currentStreamerInfo,this.getLiveColor(),false)
            })
            if(this.getIsGroupHiden()){
                hideInHTML(this.getGroupID(),null)
            }
        }
    }  

    sortStreamer(){
        this.groupSortBy.sort()
    }

    /**
     * use to add a streamer in the group section and in the api
     * @param {String} _streamerID normal
     */
    addStreamer(_streamerID){
        uptextvAPI.getStreamerInfo(_streamerID).then((streamerInfo)=>{
            addStreamerInHTML(this.getGroupID(),streamerInfo,this.getLiveColor(),this.getIsGroupHiden())
            addStreamerInAPI(this.getGroupID(),_streamerID)
            let oldList = this.getGroupList().slice()
            this.getGroupList().push(streamerInfo)
            this.sortStreamer()
            this.onListUpdate(oldList)
        }).catch((err)=>{
            debug.error('error while trying to get information streamer in api. This error has been catch in addStreamer() in groupSection',err)
        })
    }

    /**
     * use to delete a streamer in the group section and in the api
     * @param {String} _streamerID 
     */
    deleteStreamer(_streamerID){
        let newGroupList = this.getGroupObject()['list'].filter(e => e.broadcaster_id != _streamerID)
        this.setGroupList(newGroupList)
        deleteStreamerInHTML(this.getGroupID(),_streamerID,true)
        deleteStreamerInAPI(this.getGroupID(),_streamerID)
    }

    /**
     * use to get the group id in ASCII
     */
    getGroupID(){
        return this.getGroupObject().name
    }
    
    /**
     * use to get the group id in normal and not in ASCII
     */
    getGroupID_normal(){
        return this.getGroupObject().name_normal
    }

    getLiveColor(){
        return this.getGroupObject().liveColor
    }

    getGroupList(){
        return this.getGroupObject().list
    }

    getGroupObject(){
        return this.groupObject
    }

    setGroupObject(_groupObject){
        if(this.groupObject!=null){ 
            let oldList = this.getGroupList()
            this.groupObject = _groupObject
            this.onListUpdate(oldList)
        }else{ // initialization
            this.groupObject = _groupObject
        }
    }

    setGroupList(_list){
        this.getGroupObject().list = _list
    }

    getGroupIndex(){
        return this.getGroupObject().groupIndex
    }

    getSortIndex(){
        return this.getGroupObject().sortByIndex
    }

    setSortIndex(index){
        this.getGroupObject().sortByIndex = index
    }

    setGroupIndex(index){
        this.getGroupObject()['groupIndex'] = index
        uptextvAPI.setGroupProperty(this.getGroupID(),twitch.getCurrentUser().id,'groupIndex',index).then(()=>{
            debug.log('successly change index of group section in api',this.getGroupObject())
        }).catch((err)=>{
            debug.error('error while trying to change index of group section in api\n'+JSON.stringify(this.getGroupObject()),err)
        })
    }

    getIsGroupHiden(){
        return this.getGroupObject().isGroupHiden
    }

    modifyIsGroupHiden(value){
        this.getGroupObject().isGroupHiden = value
    }

    getSideGroupsModule(){
        return this.sideGroupsModule
    }

    onListUpdate(oldList){
        let goesOnline = new Array()
        let goesOffline = new Array()
        let updateOnline = new Array()
        this.getGroupList().forEach((newStreamerInfo)=>{
            let oldStreamerInfo = -1
            for(let y=0;y<oldList.length;y++){ // trying to find oldStreamerInfo in oldGroup
                if(oldList[y].broadcaster_id==newStreamerInfo.broadcaster_id){
                    oldStreamerInfo=oldList[y]
                }
            }
            
            if(oldStreamerInfo!=-1){ // checking if streamer have been just added or not
                if(oldStreamerInfo.isStreaming === newStreamerInfo.isStreaming){// streamer was offline - > streamer is offline or streamer was online - > streamer is online
                    if(newStreamerInfo.isStreaming){// streamer was online - > streamer is online
                        updateOnline.push(newStreamerInfo)
                    }
                }else{
                    if(newStreamerInfo.isStreaming){// streamer was offline - > streamer is online
                        goesOnline.push(newStreamerInfo)
                    }else{// streamer was online - > streamer is offline
                        goesOffline.push(newStreamerInfo)
                    }
                }
            }
        })
        goesOnline.forEach(streamerInfo => {
            streamerGoesOnline(this.getGroupID(),streamerInfo,this.getLiveColor())
        });

        goesOffline.forEach(streamerInfo =>{
            streamerGoesOffline(this.getGroupID(),streamerInfo)
        })

        updateOnline.forEach(streamerInfo=>{
            modifyStreamerGame(this.getGroupID(),streamerInfo)
            modifyStreamerViewerCount(this.getGroupID(),streamerInfo)
        })
        this.updateVisual(oldList)
    }


    // handle every thing in html / css about update
    // handle transition etc ....
    updateVisual(oldList){
        let temp_groupSection = this
        this.getGroupList().forEach((currentStreamerInfo)=>{
            let currentStreamerID = currentStreamerInfo.broadcaster_id
            let oldPosition = this.getStreamerIndex(currentStreamerID,oldList)
            let newPosition = this.getStreamerIndex(currentStreamerID)
            if(newPosition!=oldPosition){
                if(oldPosition==-1){
                    // streamer has just been added
                    oldPosition=this.getGroupList().length                 
                }
                makeTranslateYForOneStreamer(this.getGroupID(),currentStreamerInfo,oldPosition,newPosition)
                setTimeout(function () { // use to replace in good order in html  
                    temp_groupSection.getGroupList().forEach((currentStreamerInfo)=>{
                        deleteStreamerInHTML(temp_groupSection.getGroupID(),currentStreamerInfo.broadcaster_id,false)
                        addStreamerInHTML(temp_groupSection.getGroupID(),currentStreamerInfo,temp_groupSection.getLiveColor(),temp_groupSection.getIsGroupHiden())
                    })
                }, 500);
            }
        })
    }

    getStreamerIndex(_streamerID){ 
        // getting the index of the _streamerID in this.groupObject.list
        // normally use to check if streamer is / isn't in list
        return getStreamerIndex(_streamerID,null)
    }

    // get streamer index in current group list streamers array
    // _currentGroup is not obligatory. If null it will parse this.groupObject.list array
    // return -1 if not founded
    getStreamerIndex(_streamerID,_currentGroup){
        let arrayToParse
        if(_currentGroup){ // checking if we want to parse current group list array or a custom group list Array
            arrayToParse = _currentGroup
        }else{
            arrayToParse = this.getGroupList()
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
}


// this class is the tooltip display right to streamerInHTLM to show their streamt title
// just call new streamerTitleToolTipHandler() to handle this option
class streamTitleToolTipHandler{
    /*streamerInfo = null
    aElement = null
    elementToolTip = null
    
    thisInstance = this*/

    constructor(_streamerInfo,_aElement){
        this.streamerInfo = _streamerInfo
        this.aElement = _aElement
        this.setup();
    }

    setup(){
        let setTimeOutDelete = null
        let setTimeOutShow = null
        this.aElement.addEventListener('mouseenter',()=>{
            // so because you want to do cool animation like twitch you have here a problem
            // when a stream title tooltip is already show ( you switch from a streamer to another) twitch delete the previous one and instanly show the over one
            // so you're checking if streamer is streaming and then check if a tooltip already exist and handle it if yes
            if(this.streamerInfo.isStreaming){
                let elementToolTipAlreadyExist = document.getElementById('tooltip-layer-stream-title')
                if(elementToolTipAlreadyExist!=null){
                    elementToolTipAlreadyExist.remove()
                    clearTimeout(setTimeOutDelete)
                    this.showElement()
                }else{
                    setTimeOutShow = setTimeout(()=>{
                        this.showElement()
                    },1500)
                }
            }
        })
        this.aElement.addEventListener('mouseleave',()=>{
            // for explication plz see commentary in addEventListener 'mouseover'

            setTimeOutDelete = setTimeout(()=>{
                if(this.elementToolTip!=null){
                    this.elementToolTip.remove()
                }
            },100)
            clearTimeout(setTimeOutShow)
        })
    }

    showElement(){
        let aRectTop = this.aElement.getBoundingClientRect().top
        let aWidth = this.aElement.offsetWidth
        let aHeight = this.aElement.offsetHeight
        this.elementToolTip = this.getElement(aRectTop,aWidth,aHeight)
        document.getElementById('root').children[0].appendChild(this.elementToolTip)
    }

    getElement(aRectTop,aWidth,aHeight){
        /*
        <div class="dialog-layer">
            <div class="ReactModal__Overlay ReactModal__Overlay--after-open react-modal__overlay" style="position: fixed; top: 0px; left: 0px; width: 1px; height: 1px;">
                <div class="ReactModal__Content ReactModal__Content--after-open react-modal__content" tabindex="-1" role="dialog" aria-modal="true">
                    <div style="position: absolute; inset: 0px auto auto 0px; transform: translate(240px, 485px);" data-popper-reference-hidden="false" data-popper-escaped="true" data-popper-placement="right-start">
                        <div>
                            <div class="tw-transition tw-transition--enter-done tw-transition__fade tw-transition__fade--enter-done" style="transition-delay: 0ms; transition-duration: 250ms;">
                                <div class="tw-pd-l-1">
                                    <div class="tw-balloon tw-border-radius-large tw-c-background-base tw-c-text-inherit tw-elevation-2 tw-inline-block" role="dialog">
                                        <div class="tw-pd-x-05 tw-pd-y-05">
                                            <div class="online-side-nav-channel-tooltip__body tw-pd-x-05">
                                                <p class="tw-c-text-base tw-ellipsis tw-line-clamp-2">Ranked All Day !prime !gfuel</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        */

        let div0 = document.createElement('div')
        div0.className='dialog-layer'
        div0.id='tooltip-layer-stream-title'
        //div0.style.width = aWidth
        //div0.style.height = aHeight
        
        let div1 = document.createElement('div')
        div1.className='ReactModal__Overlay ReactModal__Overlay--after-open react-modal__overlay'
        div1.style.position ='fixed'
        div1.style.top='0px'
        div1.style.left='0px'
        div1.style.width='1px'
        div1.style.height='1px'
        
        let div2 = document.createElement('div')
        div2.className='ReactModal__Content ReactModal__Content--after-open react-modal__content'

        let div3 = document.createElement('div')
        div3.className=''
        div3.style.transform='translate('+(aWidth+2)+'px,'+(aRectTop)+'px)'
        div3.style.position = 'absolute'
        
        let div4 = document.createElement('div')
        div4.className=''
        
        let div5 = document.createElement('div')
        div5.style.transitionDelay='0ms'
        div5.style.transitionDuration='250ms'
        div5.className='tw-transition tw-transition--enter-done tw-transition__fade tw-transition__fade--enter-done'
        
        let div6 = document.createElement('div')
        div6.className='tw-pd-l-1'
        
        let div7 = document.createElement('div')
        div7.className='tw-balloon tw-border-radius-large tw-c-background-base tw-c-text-inherit tw-elevation-2 tw-inline-block'

        let div8 = document.createElement('div')
        div8.className='tw-pd-x-05 tw-pd-y-05'

        let div9 = document.createElement('div')
        div9.className='online-side-nav-channel-tooltip__body tw-pd-x-05'
        
        let p0 = document.createElement('p')
        p0.className='online-side-nav-channel-tooltip__body tw-pd-x-05'
        p0.innerText=this.streamerInfo.title
        
        div0.appendChild(div1)
        div1.appendChild(div2)
        div2.appendChild(div3)
        div3.appendChild(div4)
        div4.appendChild(div5)
        div5.appendChild(div6)
        div6.appendChild(div7)
        div7.appendChild(div8)
        div8.appendChild(div9)
        div9.appendChild(p0)
        return div0
    }
}

/**
 * check if group section exist so it will allow the group section to setup or not
 * @param {String} groupID groupID in ASCII code 
 */
function shouldSetup(groupID){
    let idToFind =  groupID+"_sideNavGroupSection"
    let mainDiv = document.getElementById(idToFind)
    return mainDiv==null
}

/** 
 * setup side nav group section to welcome current group streamers
 * group section id ( main div ) =(GROUP NAME IN ASCII)_sideNavGroupSection
 * @param {groupSection} currentGroupSection
 */
function setup(currentGroupSection){ 

    let groupID = currentGroupSection.getGroupID()
    let groupID_normal = currentGroupSection.getGroupID_normal()
    let groupList = currentGroupSection.getGroupList()
    let liveColor = currentGroupSection.getLiveColor()
    let isGroupHiden = currentGroupSection.getIsGroupHiden()
    let sideGroupsModule = currentGroupSection.getSideGroupsModule()


    let mainDivID = groupID+"_sideNavGroupSection"
    let parentDiv = document.getElementsByClassName('side-bar-contents')[0].firstChild.firstChild.firstChild // getting div parent

    if(parentDiv){
    // Start : Creating group section
    let groupSection = document.createElement("div") 
    giveTransitionStyle(groupSection)
    groupSection.className="tw-relative tw-transition-group"
    groupSection.id=mainDivID
    parentDiv.prepend(groupSection) // placing groupSection on the top
    // End

    // Start : Creating title like " chaines épinglées "
    let parentTitleDiv = document.createElement("div")
    giveTransitionStyle(parentTitleDiv)
    parentTitleDiv.id=groupID+'_title'
    parentTitleDiv.className="side-nav-header tw-flex"


    let titleDiv = document.createElement("div")
    titleDiv.className="side-nav-header-text tw-mg-1 tw-pd-t-05"
    titleDiv.style.display='inline-flex' // use to display title and img on the same line

    let titleH5 = document.createElement("h5") // use to display the group Section name
    titleH5.className="tw-font-size-6 tw-semibold tw-upcase"
    titleH5.innerText=groupID_normal

    let imgsToWatchDarkLightMode = new Array()
    let giveImgsDesireStyle = function(img){
        imgsToWatchDarkLightMode.push(img)
        if(darkmode.isInDarkMode()){
            img.style.filter='brightness(0) invert(1)'
        }
        img.style.cursor='pointer'
        img.style.marginTop='auto'
        img.style.marginBottom='auto'
        img.style.marginLeft='0.5rem'
        img.style.marginRight='0.5rem'
        img.style.width='var(--font-size-5)'
        img.style.height='var(--font-size-5)'
    }

    let imgHide_Show = document.createElement('img')
    giveImgsDesireStyle(imgHide_Show)
    giveTransitionStyle(imgHide_Show)
    if(isGroupHiden){ // group is hide 
        imgHide_Show.src = uptextvIMG.show
    }else{
        imgHide_Show.src= uptextvIMG.hide
    }
    imgHide_Show.addEventListener('click',()=>{
        onHide_ShowButtonClic(currentGroupSection,imgHide_Show,groupID)
    })
    

    let imgSettings = document.createElement('img') // use to display the settings button of the current group section
    imgSettings.src=uptextvIMG.settings
    giveImgsDesireStyle(imgSettings)
    giveTransitionStyle(imgSettings)

    let divSettingsMenu = document.createElement('div') // handle the settings menu 
    giveTransitionStyle(divSettingsMenu)
    divSettingsMenu.style.display='none'
    divSettingsMenu.style.transform='scale(0)'

    let imgBackArrowSettingsMenu = document.createElement('img')
    imgBackArrowSettingsMenu.src=uptextvIMG.back_arrow
    giveImgsDesireStyle(imgBackArrowSettingsMenu)
    imgBackArrowSettingsMenu.addEventListener('click',function(){
        onBackArrowSettingsMenuButtonClick(divSettingsMenu,imgSettings)
    })

    let imgDelete = document.createElement('img')
    imgDelete.src=uptextvIMG.less
    giveImgsDesireStyle(imgDelete)
    imgDelete.addEventListener('click',function(){
        let currentGroupIndex = sideGroupsModule.getGroupSectionIndexByID(groupID) // YOU MUST USE THIS FUNCTION TO GET THE INDEX BECAUSE THE INDEX ISN'T STATIC

        onDeleteButtonClick(groupID,currentGroupIndex,sideGroupsModule)
    })

    let imgReorder = document.createElement('img')
    imgReorder.src=uptextvIMG.reorder
    giveImgsDesireStyle(imgReorder)

    let divReorderMenu = document.createElement('div') // handle the settings menu 
    giveTransitionStyle(divReorderMenu)
    divReorderMenu.style.display='none'
    divReorderMenu.style.transform='scale(0)'

    let imgBackArrowReorderMenu = document.createElement('img')
    imgBackArrowReorderMenu.src=uptextvIMG.back_arrow
    giveImgsDesireStyle(imgBackArrowReorderMenu)
    imgBackArrowReorderMenu.addEventListener('click',function(){
        onBackArrowReorderMenuButtonClick(divReorderMenu,divSettingsMenu)
    })

    let imgArrowUp = document.createElement('img')
    imgArrowUp.src=uptextvIMG.top_arrow
    giveImgsDesireStyle(imgArrowUp)
    imgArrowUp.addEventListener('click',function(){
        let currentIndex = sideGroupsModule.getGroupSectionIndexByID(groupID) // YOU MUST USE THIS FUNCTION TO GET THE INDEX BECAUSE THE INDEX ISN'T STATIC
        let groupSectionToMoveUp =  sideGroupsModule.getGroupSectionByIndex(currentIndex)
        let groupSectionToMoveDown = sideGroupsModule.getGroupSectionByIndex(currentIndex-1)
        // you check if the index you want really leads to a real group section 
        if(groupSectionToMoveUp!=-1||groupSectionToMoveDown!=-1||(currentIndex-1)>=0){
            onReorderUpOrDownButtonClick(groupSectionToMoveUp,groupSectionToMoveDown,sideGroupsModule)
        }
    })

    let imgArrowDown = document.createElement('img')
    imgArrowDown.src=uptextvIMG.bottom_arrow
    giveImgsDesireStyle(imgArrowDown)
    imgArrowDown.addEventListener('click',function(){
        let currentIndex = sideGroupsModule.getGroupSectionIndexByID(groupID) // YOU MUST USE THIS FUNCTION TO GET THE INDEX BECAUSE THE INDEX ISN'T STATIC
        let groupSectionToMoveUp =  sideGroupsModule.getGroupSectionByIndex(currentIndex+1)
        let groupSectionToMoveDown = sideGroupsModule.getGroupSectionByIndex(currentIndex)
        // you check if the index you want really leads to a real group section 
        if(groupSectionToMoveUp!=-1||groupSectionToMoveDown!=-1||(currentIndex+1)<=sideGroupsModule.getGroupsSection().length){
            onReorderUpOrDownButtonClick(groupSectionToMoveUp,groupSectionToMoveDown,sideGroupsModule)
        }
    })

    imgReorder.addEventListener('click',function(){ // MUST STAY AFTER THE DECLARATION OF DIVREORDERMENU CUZ YOU PASS IT IN PARAMS
        onReorderButtonClick(divReorderMenu,divSettingsMenu)
    })

    imgSettings.addEventListener('click',function(){ // MUST STAY AFTER THE DECLARATION OF DIVSETTINGSMENU CUZ YOU PASS IT IN PARAMS
        onSettingsButtonClick(imgSettings,divSettingsMenu)
    })

    // every time user switch to dark mode we change imgs to white ( from black )
    darkmode.onDarkMode(()=>{
        imgsToWatchDarkLightMode.forEach((currentElement)=>{
            currentElement.style.filter='brightness(0) invert(1)'
        })
    })

    // every time user switch to dark mode we change imgs to black ( from white )
    darkmode.onLightMode(()=>{
        imgsToWatchDarkLightMode.forEach((currentElement)=>{
            currentElement.style.filter=''
        })
    })

    parentDiv.prepend(parentTitleDiv)
    parentTitleDiv.appendChild(titleDiv);
    titleDiv.appendChild(titleH5)
    titleDiv.appendChild(imgHide_Show)
    titleDiv.appendChild(imgSettings)
    titleDiv.appendChild(divSettingsMenu)
    titleDiv.appendChild(divReorderMenu)
    divSettingsMenu.appendChild(imgBackArrowSettingsMenu)
    divSettingsMenu.appendChild(imgDelete)
    divSettingsMenu.appendChild(imgReorder)
    //divSettingsMenu.append(imgColorPicker)
    divReorderMenu.appendChild(imgBackArrowReorderMenu)
    divReorderMenu.appendChild(imgArrowUp)
    divReorderMenu.appendChild(imgArrowDown)
    // End
    }else{
        debug.error('parentdiv is null, you should look at css properties about getElementsByClassName')
    }
}

/**
 * show all streamers and the sort by button in html
 */
function showInHTML(groupID,callback){
    let mainDiv =  document.getElementById((groupID+"_sideNavGroupSection"))
    let childs = [].slice.call(mainDiv.children)
    let cmpt=200
    childs.forEach((currentChild)=>{
        setTimeout(function(){
			currentChild.style.display=''
			setTimeout(function(){
                currentChild.style.transform=''
                let index = cmpt/200-1
                if(callback!=null&&index==0){
                    callback()
                }
            },50)
        },cmpt);
        cmpt+=200
    })
}

/**
 * hide all streamers and the sort by button in html
 */
function hideInHTML(groupID,callback){
    // if you update translate ( animation when hide / show streamer ), please also update addStreamerInHTML
    // TODO regroup the way you're giving animation style to hide / show streamer
    let mainDiv =  document.getElementById(groupID+"_sideNavGroupSection")
    let childs = [].slice.call(mainDiv.children).reverse()
    let translateXWidth = document.getElementById('sideNav').offsetWidth
    let cmpt=0
    childs.forEach((currentChild)=>{
        setTimeout(function(){
            currentChild.style.transform='translateX(-'+translateXWidth+'px)'
            setTimeout(function(){
                currentChild.style.setProperty("display", "none", "important");
            },250)},cmpt);
        cmpt+=200
    })
    let timerToWait = 250+200*mainDiv.children.length
    setTimeout(function(){
        if(callback!=null){
            callback()
        }
    },timerToWait)
}

/**
 * the settings button has been click by the user
 * you must show the menu and hide the button
 */
function onSettingsButtonClick(imgSettings,divSettingsMenu){
    imgSettings.style.transform='scale(0)'
    setTimeout(function(){
        imgSettings.style.display='none'
        divSettingsMenu.style.display='inline-flex'
        divSettingsMenu.style.transform='scale(1)'
    },250)
}

/**
 * the back arrow settings menu button has been click by the user
 * you must hide the menu and show back the settings button
 */
function onBackArrowSettingsMenuButtonClick(divSettingsMenu,imgSettings){
    divSettingsMenu.style.transform='scale(0)'
    setTimeout(function(){
        divSettingsMenu.style.display='none'
        imgSettings.style.display=''
        imgSettings.style.transform='scale(1)'
    },250)
}

/**
 * the delete button has been click by the user
 * you must delete the current groupSection in HTML & api
 */
function onDeleteButtonClick(groupID,groupIndex,sideGroupsModule){
    hideInHTML(groupID,()=>{
        let titleDiv = document.getElementById(groupID+'_title')
        if(titleDiv){
            titleDiv.remove()
        }

        let mainDiv = document.getElementById(groupID+'_sideNavGroupSection')
        if(mainDiv){
            mainDiv.remove()
        }
        sideGroupsModule.deleteGroupSection(groupIndex)
        uptextvAPI.deleteGroup(groupID,twitch.getCurrentUser().id)
    })
}

function onHide_ShowButtonClic(currentGroupSection,imgHide_Show,groupID){
    if(imgHide_Show.src==uptextvIMG.hide){ // you must hide the group Section
        hideInHTML(groupID,null)
        imgHide_Show.style.transform='scale(0)'
        setTimeout(()=>{
            imgHide_Show.src=uptextvIMG.show      
            imgHide_Show.style.transform='scale(1)'
        },250)
        uptextvAPI.setGroupProperty(groupID,twitch.getCurrentUser().id,'isGroupHiden',true)
        currentGroupSection.modifyIsGroupHiden(true)
    }else{// you must show the group Section
        showInHTML(groupID,null)
        imgHide_Show.style.transform='scale(0)'
        setTimeout(()=>{
            imgHide_Show.src=uptextvIMG.hide
            imgHide_Show.style.transform='scale(1)'
        },250)
        uptextvAPI.setGroupProperty(groupID,twitch.getCurrentUser().id,'isGroupHiden',false)
        currentGroupSection.modifyIsGroupHiden(false)
    }
}

/**
 * the reorder button has been click by the user
 * you must show the reorder menu
 */
function onReorderButtonClick(divReorderMenu,divSettingsMenu){
    divSettingsMenu.style.transform='scale(0)'
    setTimeout(function(){
        divSettingsMenu.style.display='none'
        divReorderMenu.style.display='inline-flex'
        divReorderMenu.style.transform='scale(1)'
    },250)
}

/**
 * the back arrow settings menu button has been click by the user
 * you must hide the menu and show back the settings button
 */
function onBackArrowReorderMenuButtonClick(divReorderMenu,divSettingsMenu){
    divReorderMenu.style.transform='scale(0)'
    setTimeout(function(){
        divReorderMenu.style.display='none'
        divSettingsMenu.style.display=''
        divSettingsMenu.style.transform='scale(1)'
    },250)
}

/**
 * handle HTML / API move up and down group section. 
 * Your only problem is to know which one you have to move up / down and passing them in params
 * @param {groupSection} groupSectionToMoveUp 
 * @param {groupSection} groupSectionToMoveDown 
 */
function onReorderUpOrDownButtonClick(groupSectionToMoveUp,groupSectionToMoveDown,sideGroupsModule){
    let HTMLElementMoveUp = document.getElementById(groupSectionToMoveUp.getGroupID()+'_sideNavGroupSection');
    let HTMLElementTitleMoveUp = document.getElementById(groupSectionToMoveUp.getGroupID()+'_title')
    let groupSectionToMoveUp_newIndex = groupSectionToMoveUp.getGroupIndex()-1

    let HTMLElementMoveDown = document.getElementById(groupSectionToMoveDown.getGroupID()+'_sideNavGroupSection')
    let HTMLElementTitleMoveDown = document.getElementById(groupSectionToMoveDown.getGroupID()+'_title')
    let groupSectionToMoveDown_newIndex = groupSectionToMoveDown.getGroupIndex()+1

    sideGroupsModule.groupsSectionSwitchElements(groupSectionToMoveUp.getGroupIndex(),groupSectionToMoveDown.getGroupIndex())
    groupSectionToMoveUp.setGroupIndex(groupSectionToMoveUp_newIndex)
    groupSectionToMoveDown.setGroupIndex(groupSectionToMoveDown_newIndex)

    HTMLElementMoveUp.style.transform='translateY(-'+(HTMLElementTitleMoveDown.offsetHeight+HTMLElementMoveDown.offsetHeight)+'px)'
    HTMLElementTitleMoveUp.style.transform='translateY(-'+(HTMLElementTitleMoveDown.offsetHeight+HTMLElementMoveDown.offsetHeight)+'px)'
    HTMLElementMoveDown.style.transform='translateY('+(HTMLElementTitleMoveUp.offsetHeight+HTMLElementMoveUp.offsetHeight)+'px)'
    HTMLElementTitleMoveDown.style.transform='translateY('+(HTMLElementTitleMoveUp.offsetHeight+HTMLElementMoveUp.offsetHeight)+'px)'
    setTimeout(()=>{
        let toChange = [HTMLElementMoveUp,HTMLElementMoveDown,HTMLElementTitleMoveUp,HTMLElementTitleMoveDown]

        // you set transition duration to 0 so you can cancel transform without wait another 250ms
        toChange.forEach((currentElement)=>{
            currentElement.style.transitionDuration='0ms'
            currentElement.style.transform=''
            setTimeout(()=>{
                currentElement.style.transitionDuration='250ms'
            },10)
        })
        HTMLElementMoveUp.after(HTMLElementTitleMoveDown)
        HTMLElementMoveUp.after(HTMLElementMoveDown)
        HTMLElementTitleMoveUp.after(HTMLElementMoveUp)
        HTMLElementTitleMoveDown.after(HTMLElementMoveDown)
    },250)
    
}

/**
 * use to add streamer in html / css 
 * top div have the id of the (GROUP NAME IN ASCII)_+streamerID 
 * div with css properties of picture profile have the id of (GROUP NAME IN ASCII)_+streamerID+ "picture_profile"
 * span of number of viewer have the id of = (GROUP NAME IN ASCII)_+streamerID + "viewercount"
 * p of the current game of the id of = (GROUP NAME IN ASCII)_+streamerID + "currentgame"
 * @param {String} groupID 
 * @param {Oject} streamerInfo 
 * @param {String} liveColor
 */
function addStreamerInHTML(groupID,streamerInfo,liveColor,isGroupHiden){

    let _streamerID = streamerInfo.broadcaster_id
    let streamerIsStreaming = streamerInfo.isStreaming
    let streamerName = streamerInfo.display_name
    let streamerIcon = streamerInfo.profile_image_url
    let streamerGame = streamerInfo.game_name
    let streamerViewerCount = streamerInfo.viewer_count

    let div0 = document.createElement("div")
    div0.className="tw-transition tw-transition--enter-done tw-transition__scale-over tw-transition__scale-over--enter-done"
    div0.style="transition-property: transform, opacity; transition-timing-function: ease; transition-duration: 250ms;"
    div0.id=groupID+_streamerID

    if(isGroupHiden){
        // this is necessecary cuz addStreamerInHTML can be call after setup ( pin button )
        // if you update translate ( animation when hide / show streamer ), please also update hideInHTML
        // TODO regroup the way you're giving animation style to hide / show streamer
        div0.style.setProperty("display", "none", "important")
        let translateXWidth = document.getElementById('sideNav').offsetWidth
        div0.style.transform='translateX(-'+translateXWidth+'px)'
    }

    let div1 = document.createElement("div")

    let div2 = document.createElement("div")
    div2.className="side-nav-card tw-align-items-center tw-flex tw-relative"

    let a0 = document.createElement("a")
    a0.className = "side-nav-card__link tw-align-items-center tw-flex tw-flex-nowrap tw-full-width tw-interactive tw-link tw-link--hover-underline-none tw-pd-x-1 tw-pd-y-05"
    a0.href="/"+streamerName.toLowerCase()
    a0.style.cursor='pointer'
    a0.onclick=function(){
        return false
    }
    a0.addEventListener('click',()=>{
        // https://stackoverflow.com/questions/40781219/calling-react-router-from-vanilla-js
        // simulate navigation to where you want to be (changes URL but doesn't navigate)
        window.history.pushState("","",'/'+streamerName);
        // simulate navigation again so that
        window.history.pushState("","",'/'+streamerName);
        // when you simulate back, the router tries to get BACK to "/url"
        window.history.go(-1);
    
    })
    new streamTitleToolTipHandler(streamerInfo,a0)

    let div3 = document.createElement("div")
    div3.id=groupID+_streamerID+"profile_picture"
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
    p0.innerText=streamerName

    let div7 = document.createElement("div")
    div7.className="side-nav-card__metadata tw-pd-r-05"

    let p1 = document.createElement("p")
    p1.className="tw-c-text-alt-2 tw-ellipsis tw-font-size-6 tw-line-height-heading"
    p1.id=groupID+_streamerID+"currentgame"
    if(streamerIsStreaming){
        p1.title=streamerGame
        p1.innerText=streamerGame
    }


    let div8 = document.createElement("div")
    div8.id=groupID+_streamerID+"usedForUnknow"
    div8.className="side-nav-card__live-status tw-flex-shrink-0 tw-mg-l-05"

    let div9 = document.createElement("div")
    div9.id=groupID+_streamerID+"unknow0"
    let div10 = document.createElement("div")
    div10.id=groupID+_streamerID+"unknow1"
    let div11 = document.createElement("div")
    div11.id=groupID+_streamerID+"unknow2"
    if(streamerIsStreaming){

        div9.className = "tw-align-items-center tw-flex"

        div10.className="ScChannelStatusIndicator-sc-1cf6j56-0 fSVvnY tw-channel-status-indicator"
        div10.style.setProperty("background-color", liveColor, "important");

        div11.className="tw-mg-l-05"
    }


    let span0 = document.createElement("span")
    span0.className="tw-c-text-alt tw-font-size-6"
    span0.id=groupID+_streamerID+"viewercount"
    if(streamerIsStreaming){
        span0.innerText=getViewerCountWithSpaces(streamerViewerCount)
    }else{
        span0.innerText="Disconnected"
    }

    let mainDiv = document.getElementById(groupID+"_sideNavGroupSection")
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

/**
 * use to add streamer in the api
 * @param {String} groupID groupID in ASCII code
 * @param {String} _streamerID streamerID in normal
 */
function addStreamerInAPI(groupID,_streamerID){
    uptextvAPI.addStreamer(groupID,twitch.getCurrentUser().id,_streamerID).catch((err)=>{
        debug.error("failed in adding pinned streamer (api call failed). err :",err)
    }) 
}

/**
 * delete streamer in html / css
 * @param {String} groupID 
 * @param {String} _streamerID 
 */
function deleteStreamerInHTML(groupID,_streamerID,withAnimation){
    let idToFind = groupID+_streamerID
    let mainDiv = document.getElementById(idToFind)
    if(mainDiv){
        if(withAnimation){
            mainDiv.style.transform='translateX(-'+mainDiv.offsetWidth+'px)'
            setTimeout(function(){
                mainDiv.style.display='none'
                mainDiv.remove()
            },250)
        }else{
            mainDiv.remove()
        }
    }
}

/**
 * delete streamer in html / css
 * @param {String} groupID 
 * @param {String} _streamerID 
 */
function deleteStreamerInAPI(groupID,_streamerID){
    uptextvAPI.deleteStreamer(groupID,twitch.getCurrentUser().id,_streamerID).catch((err)=>{
        debug.error("failed in adding pinned streamer (api call failed). err :",err)
    }) 
}

/**
 * modify a streamer viewver count from group section by his id
 * @param {String} groupID 
 * @param {Object} streamerInfo 
 */
function modifyStreamerViewerCount(groupID,streamerInfo){
    let _streamerID = streamerInfo.broadcaster_id
    let streamerViewerCount = streamerInfo.viewer_count
    let span = document.getElementById((groupID+_streamerID+"viewercount"))
    span.innerText=getViewerCountWithSpaces(streamerViewerCount)
}

/**
 * modify the streamer game from group section by his id
 * @param {String} groupID 
 * @param {Object} streamerInfo 
 */
function modifyStreamerGame(groupID,streamerInfo){
    let _streamerID = streamerInfo.broadcaster_id
    let streamerCurrentGame = streamerInfo.game_name
    let p = document.getElementById(groupID+_streamerID+"currentgame")
    p.title=streamerCurrentGame
    p.innerText=streamerCurrentGame
}

/**
 * modify & handle css change to make a streamer offline in group section
 * @param {String} groupID 
 * @param {Object} streamerInfo 
 */
function streamerGoesOffline(groupID,streamerInfo){
    let _streamerID = streamerInfo.broadcaster_id

    // changing css properties of picture profile ( make it grey )
    let div_profile_picture = document.getElementById(groupID+_streamerID+"profile_picture")
    div_profile_picture.className = css_picture_profile_offline

    // if you want to go offline you must delete this div
    // i think this div are used for the red online circle 
    let div_unknow_0 = document.getElementById(groupID+_streamerID+"unknow0")
    let div_unknow_1 = document.getElementById(groupID+_streamerID+"unknow1")
    let div_unknow_2 = document.getElementById(groupID+_streamerID+"unknow2")
    div_unknow_0.remove()
    div_unknow_1.remove()
    div_unknow_2.remove()

    let spanDisconnected = document.createElement("span")
    spanDisconnected.className="tw-c-text-alt tw-font-size-6"
    spanDisconnected.id=groupID+_streamerID+"viewercount"
    spanDisconnected.innerText="Disconnected"

    let div_main_unknow = document.getElementById(groupID+_streamerID+'usedForUnknow')
    div_main_unknow.appendChild(spanDisconnected)

    streamerInfo.game_name=''
    modifyStreamerGame(groupID,streamerInfo)
}

/**
 * modify & handle css change to make a streamer online in group section
 * @param {String} groupID 
 * @param {Object} streamerInfo 
 */
function streamerGoesOnline(groupID,streamerInfo,liveColor){
    let _streamerID = streamerInfo.broadcaster_id
    let streamerViewerCount = streamerInfo.viewer_count

    let profile_picture = document.getElementById(groupID+_streamerID+'profile_picture')
    profile_picture.className=css_picture_profile_online

    let div9 = document.createElement("div")
    div9.id=groupID+_streamerID+"unknow0"
    let div10 = document.createElement("div")
    div10.id=groupID+_streamerID+"unknow1"
    let div11 = document.createElement("div")
    div11.id=groupID+_streamerID+"unknow2"

    div9.className = "tw-align-items-center tw-flex"

    div10.className="tw-border-radius-rounded tw-channel-status-indicator--live tw-channel-status-indicator--small tw-inline-block tw-relative"
    div10.style.setProperty("background-color", liveColor, "important");

    div11.className="tw-mg-l-05"
    

    let divUsedForUnknow = document.getElementById(groupID+_streamerID+"usedForUnknow")
    divUsedForUnknow.children[0].remove() // remove span use to display 'disconnected'


    let span0 = document.createElement("span")
    span0.className="tw-c-text-alt tw-font-size-6"
    span0.id=groupID+_streamerID+"viewercount"
    span0.innerText=getViewerCountWithSpaces(streamerViewerCount)
    
    divUsedForUnknow.appendChild(div9)
    div9.append(div10)
    div9.append(div11)
    div11.appendChild(span0)

    modifyStreamerGame(groupID,streamerInfo)
}

/**
 * MAKE A SHORT BUT SO FUCKING COOL ANIMATION TO PLACE THE STREAMER IN THE CORRECT POSITION ACCORDING TO THE SORT CRITERIA
 * animation duration = 250 ms ( normaly, plz refer to css value 'transition-duration')
 * @param {String} groupID 
 * @param {Object} streamerInfo 
 * @param {Int} oldPosition 
 * @param {Int} newPosition 
 */
function makeTranslateYForOneStreamer(groupID,streamerInfo,oldPosition,newPosition){
    let _streamerID = streamerInfo.broadcaster_id
    let mainDiv = document.getElementById(groupID+_streamerID)

    let boxHeight = mainDiv.offsetHeight
    let translateValue = (newPosition-oldPosition)*boxHeight
    mainDiv.style.transform = "translateY("+translateValue+"px)";
}

function giveTransitionStyle(element){
    element.style.transitionProperty='transform, opacity'
    element.style.transitionTimingFunction='ease'
    element.style.transitionDuration='250ms'
}

/**
 * group id is in ascii code and each letter is separate by _
 * ex:
 * 116_116_116 
 * ttt
 * @param {String} cryptedGroupID in ASCII code
 * @return {String} groupID in normal
 */
function decryptGroupID(cryptedGroupID){
    let groupID = ''
    let eachLetterInASCII = cryptedGroupID.split('_')
    eachLetterInASCII.forEach((currentASCIICode)=>{
        groupID+=String.fromCharCode(currentASCIICode)
    })
    return groupID
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


module.exports = {
    setup:function(_groupObject,_sideGroupsModule){
        return new groupSection(_groupObject,_sideGroupsModule)
    }
}