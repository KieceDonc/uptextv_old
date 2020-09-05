const uptexAPI = require('./uptex-api')
const groupSortBy = require('./groupSortBy')
const debug = require('../../utils/debug')
const twitch = require('../../utils/twitch')

const css_picture_profile_online = "side-nav-card__avatar tw-align-items-center tw-flex-shrink-0"
const css_picture_profile_offline = "side-nav-card__avatar side-nav-card__avatar--offline tw-align-items-center tw-flex-shrink-0"

class groupSection{

    groupSortBy=null
    groupObject=null
    groupID=''
    groupID_normal=''

    sideGroupsModule=null

    constructor(_groupObject,_sideGroupsModule){
        this.groupObject = _groupObject
        this.groupID = this.groupObject.name
        this.groupID_normal = decryptGroupID(this.groupID)
        this.sideGroupsModule=_sideGroupsModule

        if(shouldSetup(this.groupID)){
            setup(this.groupID,this.groupID_normal,this.groupObject['groupIndex'],this.sideGroupsModule,this.groupObject['isGroupHiden'])
            let sortByIndexValue = this.groupObject['sortByIndex']
            this.groupSortBy = groupSortBy.setup(this,sortByIndexValue)
            setupStreamers(this.groupObject,()=>{
                if(this.groupObject['isGroupHiden']){
                    hideInHTML(this.groupID,null)
                }
            })

        }
    }  

    /**
     * use to add a streamer in the group section and in the api
     * @param {String} _streamerID normal
     */
    addStreamer(_streamerID){
        let oldGroup = this.groupObject['list']// use to calculate old and new position of streamers in current group
        uptexAPI.getStreamerInfo(_streamerID).then((streamerInfo)=>{
            this.groupObject['list'].push(streamerInfo)
            addStreamerInHTML(this.groupObject,streamerInfo)
            addStreamerInAPI(this.groupID,_streamerID)
            this.onGroupUpdate(oldGroup,this.groupObject['list'])
        }).catch((err)=>{
            debug.error('error while calling api',err)
        })
    }

    /**
     * use to delete a streamer in the group section and in the api
     * @param {String} _streamerID 
     */
    deleteStreamer(_streamerID){
        this.groupObject['list']= this.groupObject['list'].filter(e => e.broadcaster_id != _streamerID)
        deleteStreamerInHTML(this.groupID,_streamerID,true)
        deleteStreamerInAPI(this.groupID,_streamerID)
    }

    /**
     * use to get the group id in ASCII
     */
    getGroupID(){
        return this.groupID
    }
    
    /**
     * use to get the group id in normal and not in ASCII
     */
    getGroupID_normal(){
        return this.groupID_normal
    }

    getGroupList(){
        return this.groupObject.list
    }

    setGroupList(_list){
        this.groupObject.list = _list
    }

    getGroupIndex(){
        return this.groupObject.groupIndex
    }

    setGroupIndex(index){
        this.groupObject['groupIndex'] = index
        uptexAPI.setGroupProperty(this.groupID,twitch.getCurrentUser().id,'groupIndex',index).catch((err)=>{
            debug.error('error while calling api',err)
        })
    }

    // this.groupObject has been update
    // you must parse it and make thing with it 
    onGroupUpdate(oldGroup,newGroup){
        let goesOnline = new Array()
        let goesOffline = new Array()
        let updateOnline = new Array()
        newGroup.forEach((newStreamerInfo)=>{
            let oldStreamerInfo = -1
            for(let y=0;y<oldGroup.length;y++){ // trying to find oldStreamerInfo in oldGroup
                if(oldGroup[y].broadcaster_id==newStreamerInfo.broadcaster_id){
                    oldStreamerInfo=oldGroup[y]
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
        console.log(this.groupObject)
        goesOnline.forEach(streamerInfo => {
            streamerGoesOnline(this.groupID,streamerInfo)
        });

        goesOffline.forEach(streamerInfo =>{
            streamerGoesOffline(this.groupID,streamerInfo)
        })

        updateOnline.forEach(streamerInfo=>{
            modifyStreamerGame(this.groupID,streamerInfo)
            modifyStreamerViewerCount(this.groupID,streamerInfo)
        })
        this.updateVisual(oldGroup)
    }


    // handle every thing in html / css about update
    // handle transition etc ....
    updateVisual(oldGroup){
        if(!oldGroup){ 
            // sometimes you update groupObject from onCurrentUpdate so you need it. 
            // sometimes you just want to update from groupSortBy so you don't need it
            oldGroup = this.groupObject['list'].slice()// use to calculate old and new position of streamers in current group
        }
        let temp_groupSection = this
        this.groupSortBy.sort()
        temp_groupSection.groupObject['list'].forEach((currentStreamerInfo)=>{
            let currentStreamerID = currentStreamerInfo.broadcaster_id
            let oldPosition = this.getStreamerIndex(currentStreamerID,oldGroup)
            let newPosition = this.getStreamerIndex(currentStreamerID)
            if(newPosition!=oldPosition&&oldPosition!=-1){
                makeTranslateYForOneStreamer(this.groupID,currentStreamerInfo,oldPosition,newPosition)
                setTimeout(function () { // use to replace in good order in html  
                    temp_groupSection.groupObject['list'].forEach((currentStreamerInfo)=>{
                        deleteStreamerInHTML(temp_groupSection.groupID,currentStreamerInfo.broadcaster_id,false)
                        addStreamerInHTML(temp_groupSection.groupObject,currentStreamerInfo)
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
            arrayToParse = this.groupObject.list
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
class streamTileToolTipHandler{
    streamerInfo = null
    aElement = null
    elementToolTip = null
    
    thisInstance = this

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
        div0 <div class="tooltip-layer" style="transform: translate(0px, 356px); width: 242px; height: 42px;">
        div1     <div class="rich-content-tooltip">
        div2        <div style="width: 242px; height: 42px;">
                    </div>
        div3        <div class="tw-absolute tw-balloon tw-balloon--center tw-balloon--right tw-block" role="dialog">
        div4            <div class="tw-border-radius-large tw-c-background-base tw-c-text-inherit tw-elevation-2">
        div5                <div class="rich-content-tooltip__pointer-target">
        div6                    <div class="tw-pd-05">
        div7                        <div class="online-side-nav-channel-tooltip__body tw-pd-x-05">
        p0                               <p class="tw-c-text-base tw-ellipsis tw-line-clamp-2">
                                                LIVE: Complexity vs. Astralis - ESL Pro League Season 12 - Group B - EU
                                            </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        */

        let div0 = document.createElement('div')
        div0.className='tooltip-layer'
        div0.id='tooltip-layer-stream-title'
        div0.style.transform='translate('+(aWidth+5)+'px,'+(aRectTop+aHeight/2)+'px)'
        div0.style.width = aWidth
        div0.style.height = aHeight
        
        let div1 = document.createElement('div')
        div1.className='rich-content-tooltip'
        
        let div2 = document.createElement('div')
        div2.style.width = aWidth
        div2.style.height = aHeight
        
        let div3 = document.createElement('div')
        div3.className='tw-absolute tw-balloon tw-balloon--center tw-balloon--right tw-block'
        
        let div4 = document.createElement('div')
        div4.className='tw-border-radius-large tw-c-background-base tw-c-text-inherit tw-elevation-2'
        
        let div5 = document.createElement('div')
        div5.className='rich-content-tooltip__pointer-target'
        
        let div6 = document.createElement('div')
        div6.className='tw-pd-05'
        
        let div7 = document.createElement('div')
        div7.className='online-side-nav-channel-tooltip__body tw-pd-x-05'
        
        let p0 = document.createElement('p')
        p0.className='tw-c-text-base tw-ellipsis tw-line-clamp-2'
        p0.innerHTML=this.streamerInfo.title
        
        div0.appendChild(div1)
        div1.appendChild(div2)
        div1.appendChild(div3)
        div3.appendChild(div4)
        div4.appendChild(div5)
        div5.appendChild(div6)
        div6.appendChild(div7)
        div7.appendChild(p0)
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
 * @param {String} groupID groupID in ASCII code 
 * @param {String} groupID_normal groupID in normal 
 * @param {Int} groupIndex 
 * @param {SideGroupsModule} sideGroupsModule 
 * @param {boolean} isGroupHiden
 */
function setup(groupID,groupID_normal,groupIndex,sideGroupsModule,isGroupHiden){ 

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
    titleH5.innerHTML=groupID_normal

    let giveImgsDesireStyle = function(img){
        img.style.filter='brightness(0) invert(1)'
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
        imgHide_Show.src = 'https://uptextv.com/pe/show.png'
    }else{
        imgHide_Show.src= 'https://uptextv.com/pe/hide.png'
    }
    imgHide_Show.addEventListener('click',()=>{
        onHide_ShowButtonClic(imgHide_Show,groupID)
    })
    

    let imgSettings = document.createElement('img') // use to display the settings button of the current group section
    imgSettings.src='https://uptextv.com/pe/settings.png'
    giveImgsDesireStyle(imgSettings)
    giveTransitionStyle(imgSettings)

    let divSettingsMenu = document.createElement('div') // handle the settings menu 
    giveTransitionStyle(divSettingsMenu)
    divSettingsMenu.style.display='none'
    divSettingsMenu.style.transform='scale(0)'

    let imgBackArrowSettingsMenu = document.createElement('img')
    imgBackArrowSettingsMenu.src='https://uptextv.com/pe/back_arrow.png'
    giveImgsDesireStyle(imgBackArrowSettingsMenu)
    imgBackArrowSettingsMenu.addEventListener('click',function(){
        onBackArrowSettingsMenuButtonClick(divSettingsMenu,imgSettings)
    })

    let imgDelete = document.createElement('img')
    imgDelete.src='https://uptextv.com/pe/less.png'
    giveImgsDesireStyle(imgDelete)
    imgDelete.addEventListener('click',function(){
        onDeleteButtonClick(groupID,groupIndex,sideGroupsModule)
    })

    let imgReorder = document.createElement('img')
    imgReorder.src='https://uptextv.com/pe/reorder.png'
    giveImgsDesireStyle(imgReorder)

    let divReorderMenu = document.createElement('div') // handle the settings menu 
    giveTransitionStyle(divReorderMenu)
    divReorderMenu.style.display='none'
    divReorderMenu.style.transform='scale(0)'

    let imgBackArrowReorderMenu = document.createElement('img')
    imgBackArrowReorderMenu.src='https://uptextv.com/pe/back_arrow.png'
    giveImgsDesireStyle(imgBackArrowReorderMenu)
    imgBackArrowReorderMenu.addEventListener('click',function(){
        onBackArrowReorderMenuButtonClick(divReorderMenu,divSettingsMenu)
    })

    let imgArrowUp = document.createElement('img')
    imgArrowUp.src='https://uptextv.com/pe/top_arrow.png'
    giveImgsDesireStyle(imgArrowUp)
    imgArrowUp.addEventListener('click',function(){
        let currentIndex = sideGroupsModule.getGroupSectionIndexByName(groupID) // YOU MUST USE THIS FUNCTION TO GET THE INDEX BECAUSE THE INDEX ISN'T STATIC
        let groupSectionToMoveUp =  sideGroupsModule.getGroupSectionByIndex(currentIndex)
        let groupSectionToMoveDown = sideGroupsModule.getGroupSectionByIndex((currentIndex-1))
        if((currentIndex-1)>=0){
            onReorderUpOrDownButtonClick(groupSectionToMoveUp,groupSectionToMoveDown,sideGroupsModule)
        }
    })

    let imgArrowDown = document.createElement('img')
    imgArrowDown.src='https://uptextv.com/pe/bottom_arrow.png'
    giveImgsDesireStyle(imgArrowDown)
    imgArrowDown.addEventListener('click',function(){
        let currentIndex = sideGroupsModule.getGroupSectionIndexByName(groupID) // YOU MUST USE THIS FUNCTION TO GET THE INDEX BECAUSE THE INDEX ISN'T STATIC
        let groupSectionToMoveUp =  sideGroupsModule.getGroupSectionByIndex(currentIndex+1)
        let groupSectionToMoveDown = sideGroupsModule.getGroupSectionByIndex((currentIndex))
        if((currentIndex+1)<=sideGroupsModule.getGroupsSection().length){
            onReorderUpOrDownButtonClick(groupSectionToMoveUp,groupSectionToMoveDown,sideGroupsModule)
        }
    })

    imgReorder.addEventListener('click',function(){ // MUST STAY AFTER THE DECLARATION OF DIVREORDERMENU CUZ YOU PASS IT IN PARAMS
        onReorderButtonClick(divReorderMenu,divSettingsMenu)
    })

    imgSettings.addEventListener('click',function(){ // MUST STAY AFTER THE DECLARATION OF DIVSETTINGSMENU CUZ YOU PASS IT IN PARAMS
        onSettingsButtonClick(imgSettings,divSettingsMenu)
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
    divReorderMenu.appendChild(imgBackArrowReorderMenu)
    divReorderMenu.appendChild(imgArrowUp)
    divReorderMenu.appendChild(imgArrowDown)
    // End
    }else{
        debug.error('parentdiv is null, you should look at css properties about getElementsByClassName')
    }
}

/**
 * use right after groupObject received. It basically add current group streamers in group section
 * @param {Object} groupObject 
 */
function setupStreamers(groupObject,callback){
    for(let x=0;x<groupObject.list.length;x++){
        addStreamerInHTML(groupObject,groupObject.list[x])
    }
    callback()
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
 * delete all streamers and the sort by button in html
 */
function hideInHTML(groupID,callback){
    let mainDiv =  document.getElementById(groupID+"_sideNavGroupSection")
    let childs = [].slice.call(mainDiv.children).reverse()
    let translateXWidth = childs[0].offsetWidth
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
        uptexAPI.deleteGroup(groupID,twitch.getCurrentUser().id)
    })
}

function onHide_ShowButtonClic(imgHide_Show,groupID){
    if(imgHide_Show.src=='https://uptextv.com/pe/hide.png'){ // you must hide the group Section
        hideInHTML(groupID,null)
        imgHide_Show.style.transform='scale(0)'
        setTimeout(()=>{
            imgHide_Show.src='https://uptextv.com/pe/show.png'      
            imgHide_Show.style.transform='scale(1)'
        },250)
        uptexAPI.setGroupProperty(groupID,twitch.getCurrentUser().id,'isGroupHiden',true)
    }else{// you must show the group Section
        showInHTML(groupID,null)
        imgHide_Show.style.transform='scale(0)'
        setTimeout(()=>{
            imgHide_Show.src='https://uptextv.com/pe/hide.png'
            imgHide_Show.style.transform='scale(1)'
        },250)
        uptexAPI.setGroupProperty(groupID,twitch.getCurrentUser().id,'isGroupHiden',false)
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
 * @param {Object} groupObject 
 * @param {Oject} streamerInfo 
 */
function addStreamerInHTML(groupObject,streamerInfo){

    let _streamerID = streamerInfo.broadcaster_id
    let streamerIsStreaming = streamerInfo.isStreaming
    let streamerName = streamerInfo.display_name
    let streamerIcon = streamerInfo.profile_image_url
    let streamerGame = streamerInfo.game_name
    let streamerViewerCount = streamerInfo.viewer_count

    let div0 = document.createElement("div")
    div0.className="tw-transition tw-transition--enter-done tw-transition__scale-over tw-transition__scale-over--enter-done"
    div0.style="transition-property: transform, opacity; transition-timing-function: ease; transition-duration: 250ms;"
    div0.id=groupObject['name']+_streamerID


    let div1 = document.createElement("div")

    let div2 = document.createElement("div")
    div2.className="side-nav-card tw-align-items-center tw-flex tw-relative"

    let a0 = document.createElement("a")
    a0.className = "side-nav-card__link tw-align-items-center tw-flex tw-flex-nowrap tw-full-width tw-interactive tw-link tw-link--hover-underline-none tw-pd-x-1 tw-pd-y-05"
    //a0.href="/"+streamerName.toLowerCase()
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
    new streamTileToolTipHandler(streamerInfo,a0)

    let div3 = document.createElement("div")
    div3.id=groupObject['name']+_streamerID+"picture_profile"
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
    p1.id=groupObject['name']+_streamerID+"currentgame"
    if(streamerIsStreaming){
        p1.title=streamerGame
        p1.innerHTML=streamerGame
    }


    let div8 = document.createElement("div")
    div8.id=groupObject['name']+_streamerID+"usedForUnknow"
    div8.className="side-nav-card__live-status tw-flex-shrink-0 tw-mg-l-05"

    let div9 = document.createElement("div")
    div9.id=groupObject['name']+_streamerID+"unknow0"
    let div10 = document.createElement("div")
    div10.id=groupObject['name']+_streamerID+"unknow1"
    let div11 = document.createElement("div")
    div11.id=groupObject['name']+_streamerID+"unknow2"
    if(streamerIsStreaming){

        div9.className = "tw-align-items-center tw-flex"

        div10.className="tw-border-radius-rounded tw-channel-status-indicator--live tw-channel-status-indicator--small tw-inline-block tw-relative"
        div10.style.setProperty("background-color", groupObject.liveColor, "important");

        div11.className="tw-mg-l-05"
    }


    let span0 = document.createElement("span")
    span0.className="tw-c-text-alt tw-font-size-6"
    span0.id=groupObject['name']+_streamerID+"viewercount"
    if(streamerIsStreaming){
        span0.innerHTML=getViewerCountWithSpaces(streamerViewerCount)
    }else{
        span0.innerHTML="Disconnected"
    }

    let mainDiv = document.getElementById(groupObject['name']+"_sideNavGroupSection")
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
    uptexAPI.addStreamer(groupID,twitch.getCurrentUser().id,_streamerID).catch((err)=>{
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
    uptexAPI.deleteStreamer(groupID,twitch.getCurrentUser().id,_streamerID).catch((err)=>{
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
    span.innerHTML=getViewerCountWithSpaces(streamerViewerCount)
}

/**
 * modify the streamer game from group section by his id
 * @param {String} groupID 
 * @param {Object} streamerInfo 
 */
function modifyStreamerGame(groupID,streamerInfo){
    console.log(streamerInfo)
    let _streamerID = streamerInfo.broadcaster_id
    let streamerCurrentGame = streamerInfo.game_name
    let p = document.getElementById(groupID+_streamerID+"currentgame")
    console.log(groupID+_streamerID+"currentgame")
    p.title=streamerCurrentGame
    p.innerHTML=streamerCurrentGame
}

/**
 * modify & handle css change to make a streamer offline in group section
 * @param {String} groupID 
 * @param {Object} streamerInfo 
 */
function streamerGoesOffline(groupID,streamerInfo){
    let _streamerID = streamerInfo.broadcaster_id

    modifyStreamerGame(groupID,streamerInfo)
    modifyStreamerViewerCount(groupID,streamerInfo)
    // changing css properties of picture profile ( make it grey )
    let div_profile_picture = document.getElementById(groupID+_streamerID+"profile_picture")
    div_profile_picture.className = css_picture_profile_offline

    // if you want to go offline you must delete this div
    // i think this div are used for the red online circle 
    let div_unknow_0 = document.getElementById(groupID+_streamerID+"unknow_0")
    let div_unknow_1 = document.getElementById(groupID+_streamerID+"unknow_1")
    let div_unknow_2 = document.getElementById(groupID+_streamerID+"unknow_2")
    div_unknow_0.parentElement.removeChild(div_unknow_0)
    div_unknow_1.parentElement.removeChild(div_unknow_1)
    div_unknow_2.parentElement.removeChild(div_unknow_2)
}

/**
 * modify & handle css change to make a streamer online in group section
 * @param {String} groupID 
 * @param {Object} streamerInfo 
 */
function streamerGoesOnline(groupID,streamerInfo){
    let _streamerID = streamerInfo.broadcaster_id
    modifyStreamerGame(groupID,streamerInfo)
    modifyStreamerViewerCount(groupID,streamerInfo)

    let div9 = document.createElement("div")
    div9.id= groupID+_streamerID+"unknow0"
    let div10 = document.createElement("div")
    div10.id=groupID+_streamerID+"unknow1"
    let div11 = document.createElement("div")
    div11.id=groupID+_streamerID+"unknow2"

    let divUsedForUnknow = document.getElementById(groupID+_streamerID+"usedForUnknow")
    divUsedForUnknow.appendChild(div9)
    div9.append(div10)
    div9.append(div11)
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