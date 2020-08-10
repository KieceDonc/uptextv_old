var sortGroupStreamersFunction = [
    {
      'name':'Viewer',
      'treatment':function(){
        sortCurrentGroupStreamersByPropertie('viewer_count')
      }
    },
  
    {
      'name':'Streamer name',
      'treatment': function(){ 
        let currentList = currentGroupSection.getCurrentList()
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
        currentGroupSection.setCurrentList(currentList)
      }
    },
  
    {
      'name':'Game name',
      'treatment': function(){ 
        let splitByOnlineAndOffline = getOnlineAndOfflineCurrentGroupStreamers()
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
        currentGroupSection.setCurrentList(splitByOnlineAndOffline.online.concat(splitByOnlineAndOffline.offline))
      }
    },
  
    {
      'name':'Uptime',
      'treatment': function(){ 
        let splitByOnlineAndOffline = getOnlineAndOfflineCurrentGroupStreamers()
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
        currentGroupSection.setCurrentList(splitByOnlineAndOffline.online.concat(splitByOnlineAndOffline.offline))
      }
    }
]

var currentIndexSortBy=0; // index of the function to call to sort by
var currentGroupSection

class groupSortBy{
    constructor(_currentGroupSection){
        currentGroupSection = _currentGroupSection
        htmlSetup()
        sortCurrentGroupStreamersByWithCurrentIndexSortBy()
    }

    sort(){
      sortCurrentGroupStreamersByWithCurrentIndexSortBy()
    }
}
  
// add in css / html the select element to let user sort by something he want
// select id = (GROUP NAME IN ASCII)+groupSelect
function htmlSetup(){
    /*
    TODO change font size ( too much height )
  
    <div class="tw-border-radius-medium tw-c-background-base tw-inline-flex tw-overflow-hidden" style="padding-left: 1rem !important;padding-bottom: 0.5rem;padding-top: 0.5rem;">
      <div class="tw-align-items-center tw-align-middle tw-border-bottom-left-radius-medium tw-border-bottom-right-radius-medium tw-border-top-left-radius-medium tw-border-top-right-radius-medium tw-core-button tw-core-button--secondary tw-full-width tw-inline-flex tw-interactive tw-justify-content-center tw-overflow-hidden tw-relative">
        <select style="border: 0px black none;color: var(--color-text-base);background: transparent;" class="tw-font-size-6">
          <option>Sort by :</option>
          <option>Viewver</option>
          <option>Streamer name</option>
          <option>Game name</option>
          <option>Uptime</option>
        </select>
      </div>
    </div>
    */
  
    let div0 = document.createElement('div')
    div0.className="tw-border-radius-medium tw-c-background-base tw-inline-flex tw-overflow-hidden"
    div0.style="margin-left: 1rem !important;margin-bottom: 0.5rem;margin-top: 0.5rem;"
  
    let div1 = document.createElement('div')
    div1.className="tw-align-items-center tw-align-middle tw-border-bottom-left-radius-medium tw-border-bottom-right-radius-medium tw-border-top-left-radius-medium tw-border-top-right-radius-medium tw-core-button tw-core-button--secondary tw-full-width tw-inline-flex tw-interactive tw-justify-content-center tw-overflow-hidden tw-relative"
  
    let select0 = document.createElement('select')
    select0.className="tw-font-size-6"
    select0.id=currentGroupSection.getCurrentId()+'groupSelect'
    select0.addEventListener('change', function(){
        selectOnChange()
    })
  
    let toAdd = new Array()
    let index = 0
    sortGroupStreamersFunction.forEach((object)=>{ // creating option for each 
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
  
    let mainDiv = document.getElementById(currentGroupSection.getCurrentId()+"_sideNavGroupSection")
    if(mainDiv!=null){
        mainDiv.prepend(div0)
        div0.append(div1)
        div1.append(select0)
        toAdd.forEach((optionToAdd)=>{
          select0.append(optionToAdd)
        })
    }
  }
  
// call back of onChange() of groupSelect
function selectOnChange(){
    let sel = document.getElementById('groupSelect')
    currentIndexSortBy = sel.value
    currentGroupSection.update()
}


function sortCurrentGroupStreamersByWithCurrentIndexSortBy(){
    sortGroupStreamersFunction[currentIndexSortBy].treatment()
}

// sort current group list streamers by a propertie
function sortCurrentGroupStreamersByPropertie(propertieName){
    let splitByOnlineAndOffline = getOnlineAndOfflineCurrentGroupStreamers()
    splitByOnlineAndOffline.online = splitByOnlineAndOffline.online.sort(sortBy(propertieName))
    currentGroupSection.setCurrentList(splitByOnlineAndOffline.online.concat(splitByOnlineAndOffline.offline))
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

// return an object like this {online:ARRAY,offline:ARRAY}
// online is list of current group list streamer online
// offline is list of current group list streamer offline
function getOnlineAndOfflineCurrentGroupStreamers(){
    let offline = new Array()
    let online = new Array()
    let currentGroupStreamers = currentGroupSection.getCurrentList()
    currentGroupStreamers.forEach((currentStreamerInfo)=>{
    if(currentStreamerInfo.isStreaming == true){
        online.push(currentStreamerInfo)
    }else{
        offline.push(currentStreamerInfo)
    }
    })
    return {'online' : online, 'offline' : offline}
}

module.exports = {
    setup:function(_currentGroupSection){
        return new groupSortBy(_currentGroupSection)
    }
}