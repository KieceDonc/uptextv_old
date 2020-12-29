const uptextvAPI = require('../../utils/uptextv-api')
const twitch = require('../../utils/twitch')

class groupSortBy{

  constructor(_groupSection){
    this.groupSection = _groupSection
    this.sortGroupStreamersFunction = getSortGroupStreamersFunctions(this.groupSection)
    this.htmlSetup();
  }

  getSortIndex(){
    return this.groupSection.getSortIndex()
  }

  setSortIndex(index){
    this.groupSection.setSortIndex(index)
  }

  sort(){
    this.sortGroupStreamersFunction[this.getSortIndex()].treatment()
  }

  // add in css / html the select element to let user sort by something he want
  // select id = (GROUP NAME IN ASCII)+groupSelect
  /*
  height: 70%;
  border-radius: 8px;
  border: none;
  padding-left: 2px;
  */
  htmlSetup(){
    let div0 = document.createElement('div')
    div0.className="tw-border-radius-medium  tw-inline-flex tw-overflow-hidden"
    div0.style="margin-left: 1rem !important;margin-bottom: 0.5rem;margin-top: 0.5rem;"
  
    let div1 = document.createElement('div')
    div1.className="tw-align-items-center tw-align-middle tw-border-bottom-left-radius-medium tw-border-bottom-right-radius-medium tw-border-top-left-radius-medium tw-border-top-right-radius-medium tw-core-button tw-full-width tw-inline-flex tw-interactive tw-justify-content-center tw-overflow-hidden tw-relative"

  
    let select0 = document.createElement('select')
    select0.className="tw-font-size-6"
    select0.style.height ="70%"
    select0.style.border = "none"
    select0.style.borderRadius = "8px"
    select0.style.paddingLeft = "2px"
    let temp_this = this
    select0.addEventListener('change', ()=>{
        temp_this.selectOnChange(select0)
    })
  
    let toAdd = new Array()
    let index = 0
    this.sortGroupStreamersFunction.forEach((object)=>{ // creating option for each 
      let optionToAdd=document.createElement('option')
      optionToAdd.value=index // value is to replace currentIndexsortBy in onChange in select
      optionToAdd.innerText=object.name // getting function name
      toAdd.push(optionToAdd)
      index++
    })
  
    let mainDiv = document.getElementById(this.groupSection.getGroupID()+"_sideNavGroupSection")
    if(mainDiv!=null){
        mainDiv.prepend(div0)
        div0.append(div1)
        div1.append(select0)
        toAdd.forEach((optionToAdd)=>{
          select0.append(optionToAdd)
        })
        select0.value=this.getSortIndex() // use to set the saved option by user
    }
  }
    
  // call back of onChange() of groupSelect
  selectOnChange(selectElement){
      this.setSortIndex(selectElement.value)
      uptextvAPI.setGroupProperty(this.groupSection.getGroupID(),twitch.getCurrentUser().id,'sortByIndex',this.getSortIndex())
      let oldList = this.groupSection.getGroupList()
      this.sort()
      this.groupSection.onListUpdate(oldList)
  }
  
}

function getSortGroupStreamersFunctions(groupSection){
  return [
    {
      'name':'Viewer',
      'treatment':function(){
        sortStreamersByPropertie(groupSection,'viewer_count')
      }
    },
  
    {
      'name':'Streamer name',
      'treatment': function(){ 
        let newList = groupSection.getGroupList().slice()
        newList.sort(function(a,b){
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
        groupSection.setGroupList(newList)
      }
    },
  
    {
      'name':'Game name',
      'treatment': function(){ 
        let splitByOnlineAndOffline = getOnlineAndOfflineStreamers(groupSection)
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
        let newList = splitByOnlineAndOffline.online.concat(splitByOnlineAndOffline.offline)
        groupSection.setGroupList(newList)
      }
    },
  
    {
      'name':'Uptime',
      'treatment': function(){ 
        let splitByOnlineAndOffline = getOnlineAndOfflineStreamers(groupSection)
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
        let newList = splitByOnlineAndOffline.online.concat(splitByOnlineAndOffline.offline)
        groupSection.setGroupList(newList)
      }
    }
  ]
}

// sort current group list streamers by a propertie
function sortStreamersByPropertie(groupSection,propertieName){
  let splitByOnlineAndOffline = getOnlineAndOfflineStreamers(groupSection)
  splitByOnlineAndOffline.online = splitByOnlineAndOffline.online.sort(sortBy(propertieName))
  let newList = splitByOnlineAndOffline.online.concat(splitByOnlineAndOffline.offline)
  groupSection.setGroupList(newList)
}

// return an object like this {online:ARRAY,offline:ARRAY}
// online is list of current group list streamer online
// offline is list of current group list streamer offline
function getOnlineAndOfflineStreamers(groupSection){
    let offline = new Array()
    let online = new Array()
    let currentGroupStreamers = groupSection.getGroupList()
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
    setup:function(_currentGroupSection){
        return new groupSortBy(_currentGroupSection)
    }
}     