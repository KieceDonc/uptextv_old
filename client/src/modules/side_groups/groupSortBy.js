const uptexAPI = require('./uptex-api')
const twitch = require('../../utils/twitch')

class groupSortBy{

  sortGroupStreamersFunction = null 
  currentGroupSection = null
  currentIndexSortBy = 0 // index of the function to call to sort by

  constructor(_currentGroupSection,_currentIndexSortBy){
    this.currentGroupSection = _currentGroupSection
    this.currentIndexSortBy = _currentIndexSortBy
    this.sortGroupStreamersFunction = getSortGroupStreamersFunctions(this)
    this.htmlSetup()
    this.sortCurrentGroupStreamersByWithCurrentIndexSortBy()
  }

  sort(){
    this.sortCurrentGroupStreamersByWithCurrentIndexSortBy()
  }

  // add in css / html the select element to let user sort by something he want
  // select id = (GROUP NAME IN ASCII)+groupSelect
  htmlSetup(){
    let div0 = document.createElement('div')
    div0.className="tw-border-radius-medium tw-c-background-base tw-inline-flex tw-overflow-hidden"
    div0.style="margin-left: 1rem !important;margin-bottom: 0.5rem;margin-top: 0.5rem;"
  
    let div1 = document.createElement('div')
    div1.className="tw-align-items-center tw-align-middle tw-border-bottom-left-radius-medium tw-border-bottom-right-radius-medium tw-border-top-left-radius-medium tw-border-top-right-radius-medium tw-core-button tw-core-button--secondary tw-full-width tw-inline-flex tw-interactive tw-justify-content-center tw-overflow-hidden tw-relative"
  
    let select0 = document.createElement('select')
    select0.className="tw-font-size-6"
    let temp_this = this
    select0.addEventListener('change', ()=>{
        temp_this.selectOnChange(select0)
    })
  
    let toAdd = new Array()
    let index = 0
    this.sortGroupStreamersFunction.forEach((object)=>{ // creating option for each 
      /* object {
        name = function name
        treatment = function use to sort by 
      }*/
  
      let optionToAdd=document.createElement('option')
      optionToAdd.value=index // value is to replace currentIndexsortBy in onChange in select
      optionToAdd.innerHTML=object.name // getting function name
      toAdd.push(optionToAdd)
      index++
    })
  
    let mainDiv = document.getElementById(this.currentGroupSection.getGroupID()+"_sideNavGroupSection")
    if(mainDiv!=null){
        mainDiv.prepend(div0)
        div0.append(div1)
        div1.append(select0)
        toAdd.forEach((optionToAdd)=>{
          select0.append(optionToAdd)
        })
        select0.value=this.currentIndexSortBy // use to set the saved option by user
    }
  }
    
  // call back of onChange() of groupSelect
  selectOnChange(selectElement){
      this.currentIndexSortBy = selectElement.value
      uptexAPI.setGroupProperty(this.currentGroupSection.getGroupID(),twitch.getCurrentUser().id,'sortByIndex',this.currentIndexSortBy)
      this.currentGroupSection.updateVisual(null)
  }

  sortCurrentGroupStreamersByWithCurrentIndexSortBy(){
      this.sortGroupStreamersFunction[this.currentIndexSortBy].treatment()
  }
}

// need to go on r/programminghorror
// name = the display name of the sorting function
// treatment= the logic of how you sort your streamers
// currentGroupSortBy is an initiate object of groupSortBy which contain the reference to the current groupSection ( initiate object of groupSection )

function getSortGroupStreamersFunctions(currentGroupSortBy){
  let currentGroupSection = currentGroupSortBy.currentGroupSection
  return [
    {
      'name':'Viewer',
      'treatment':function(){
        sortCurrentGroupStreamersByPropertie(currentGroupSortBy,'viewer_count')
      }
    },
  
    {
      'name':'Streamer name',
      'treatment': function(){ 
        let currentList = currentGroupSortBy.currentGroupSection.getGroupList()
        currentList.sort(function(a,b){
          let a_broadcaster_name = a["login"]
          let b_broadcaster_name = b["login"]
          if(a_broadcaster_name>b_broadcaster_name){
            return 1
          }else if(a_broadcaster_name<b_broadcaster_name){
            return -1
          }else{
            return 0 
          }
        }) 
        currentGroupSection.setGroupList(currentList)
      }
    },
  
    {
      'name':'Game name',
      'treatment': function(){ 
        let splitByOnlineAndOffline = getOnlineAndOfflineCurrentGroupStreamers(currentGroupSortBy)
        splitByOnlineAndOffline.online = splitByOnlineAndOffline.online.sort(function(a,b){
          let a_broadcaster_name = a["game_name"].toLowerCase()
          let b_broadcaster_name = b["game_name"].toLowerCase()
          if(a_broadcaster_name>b_broadcaster_name){
            return 1
          }else if(a_broadcaster_name<b_broadcaster_name){
            return -1
          }else{
            return 0 
          }
        })
        currentGroupSection.setGroupList(splitByOnlineAndOffline.online.concat(splitByOnlineAndOffline.offline))
      }
    },
  
    {
      'name':'Uptime',
      'treatment': function(){ 
        let splitByOnlineAndOffline = getOnlineAndOfflineCurrentGroupStreamers(currentGroupSortBy)
        splitByOnlineAndOffline.online = splitByOnlineAndOffline.online.sort(function(a,b){
          let a_live_start = new Date(a["started_at"]).getTime() // date in second from 1970
          let b_live_start = new Date(b["started_at"]).getTime() // date in second from 1970
          if(a_live_start>b_live_start){
            return 1
          }else if(a_live_start<b_live_start){
            return -1
          }else{
            return 0 
          }
        })
        currentGroupSection.setGroupList(splitByOnlineAndOffline.online.concat(splitByOnlineAndOffline.offline))
      }
    }
  ]
}

// sort current group list streamers by a propertie
function sortCurrentGroupStreamersByPropertie(currentGroupSortBy,propertieName){
  let splitByOnlineAndOffline = getOnlineAndOfflineCurrentGroupStreamers(currentGroupSortBy)
  splitByOnlineAndOffline.online = splitByOnlineAndOffline.online.sort(sortBy(propertieName))
  currentGroupSortBy.currentGroupSection.setGroupList(splitByOnlineAndOffline.online.concat(splitByOnlineAndOffline.offline))
}

// return an object like this {online:ARRAY,offline:ARRAY}
// online is list of current group list streamer online
// offline is list of current group list streamer offline
function getOnlineAndOfflineCurrentGroupStreamers(currentGroupSortBy){
    let offline = new Array()
    let online = new Array()
    let currentGroupStreamers = currentGroupSortBy.currentGroupSection.getGroupList()
    currentGroupStreamers.forEach((currentStreamerInfo)=>{
    if(currentStreamerInfo.isStreaming == true){
        online.push(currentStreamerInfo)
    }else{
        offline.push(currentStreamerInfo)
    }
    })
    return {'online' : online, 'offline' : offline}
}
  

function sortBy(propertieName){
  return function(a,b){
    if(a[propertieName]>b[propertieName]){
      return -1
    }else if(a[propertieName]<b[propertieName]){
      return 1
    }else{
      return 0 
    }
  }
}

module.exports = {
    setup:function(_currentGroupSection,_currentIndexSortBy){
        return new groupSortBy(_currentGroupSection,_currentIndexSortBy)
    }
}     