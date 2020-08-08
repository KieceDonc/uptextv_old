var sortPinnedStreamersFunction = [
    {
      'name':'Viewer',
      'treatment':function(){
        sortPinnedStreamersByPropertie('viewer_count')
      }
    },
  
    {
      'name':'Streamer name',
      'treatment': function(){ 
        sortPinnedStreamersByPropertie('broadcaster_name')
      }
    },
  
    {
      'name':'Game name',
      'treatment': function(){ 
        sortPinnedStreamersByPropertie('game_name')
      }
    },
  
    {
      'name':'Uptime',
      'treatment': function (){ 
        sortPinnedStreamersByPropertie('started_at')
      }
    }
]

var currentIndexSortBy=0; // index of the function to call to sort by

var pinChannelModule

class pinSortBy{
    constructor(_pinChannelModule){
        pinChannelModule = _pinChannelModule
        htmlSetup()
        sortPinnedStreamersByWithCurrentIndexSortBy()
    }

    sort(){
      sortPinnedStreamersByWithCurrentIndexSortBy()
    }
}
  
// add in css / html the select element to let user sort by something he want
// select id = pinSelect
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
    select0.id='pinSelect'
    select0.addEventListener('change', function(){
        selectOnChange()
    })
  
    let toAdd = new Array()
    let index = 0
    sortPinnedStreamersFunction.forEach((object)=>{ // creating option for each 
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
  
    let mainDiv = document.getElementById("sideNavPinSection")
    if(mainDiv!=null){
        mainDiv.prepend(div0)
        div0.append(div1)
        div1.append(select0)
        toAdd.forEach((optionToAdd)=>{
          select0.append(optionToAdd)
        })
    }
  }
  
// call back of onChange() of pinSelect
function selectOnChange(){
    let sel = document.getElementById('pinSelect')
    currentIndexSortBy = sel.value
    pinChannelModule.getPinSection().update()
}


function sortPinnedStreamersByWithCurrentIndexSortBy(){
    sortPinnedStreamersFunction[currentIndexSortBy].treatment()
}

// sort pinned streamers by a propertie
function sortPinnedStreamersByPropertie(propertieName){
    let splitByOnlineAndOffline = getOnlineAndOfflinePinnedStreamers()
    splitByOnlineAndOffline.online = splitByOnlineAndOffline.online.sort(sortBy(propertieName))
    pinChannelModule.setPinnedStreamers(splitByOnlineAndOffline.online.concat(splitByOnlineAndOffline.offline))
    console.log(pinChannelModule.getPinnedStreamers())
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
// online is list of pinned streamer online
// offline is list of pinned streamer offline
function getOnlineAndOfflinePinnedStreamers(){
    let offline = new Array()
    let online = new Array()
    let pinnedStreamers = pinChannelModule.getPinnedStreamers()
    pinnedStreamers.forEach((currentPinnedStreamer)=>{
    if(currentPinnedStreamer.isStreaming == true){
        online.push(currentPinnedStreamer)
    }else{
        offline.push(currentPinnedStreamer)
    }
    })
    return {'online' : online, 'offline' : offline}
}

module.exports = {
    setup:function(_pinChannelModule){
        return new pinSortBy(_pinChannelModule)
    }
}