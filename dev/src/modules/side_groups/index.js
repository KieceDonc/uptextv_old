const watcher = require('../../watcher');
const twitch = require('../../utils/twitch')
const uptexAPI = require('./uptex-api')
const debug = require('../../utils/debug')
const groupSection = require('./groupSection')
const pinButton = require('./pinButton');
const sideBottomBar = require('./sideBottomBar')

const defaultLiveColor = '#007aa3'

var groupsSection = new Array()
var groups = new Array()

var userID // id of current user
var streamerID // id of streamerID

class SideGroupsModule{
    constructor(){   
      watcher.on('load.sidenav',()=>{
        sideBottomBar.setup()
        userID = twitch.getCurrentUser(this).id
        uptexAPI.getGroupsStreamers(userID).then((_groups)=>{
          groups = _groups
          groups.forEach((currentGroup)=>{
            setupGroupSection(this,currentGroup)
          })
          handleUpdateEach5min()
        }).catch((err)=>{
          debug.error('error while trying to get pinned streamers through the api. err :',err )
        })
      })
      /*watcher.on('load.followbutton',()=>{
        streamerID = twitch.getCurrentChannel().id
        _pinButton = pinButton.setup(this)
      })*/     
    }

    getUserID(){
      return userID
    }

    getStreamerID(){
      return streamerID
    }

    getGroupsSection(){
      return groupsSection
    }

    // add a new group section on top from id
    // id must be in ASCII CODE
    addNewGroupSection(groupID){
      uptexAPI.addGroup(groupID,userID).then(()=>{
        let newGroupObject = {
          name:groupID,
          list:[],
          liveColor:defaultLiveColor
        }
        setupGroupSection(this,newGroupObject)
      }).catch((err)=>{
        debug.error('error while trying to add a new group in index.js',err)
      })
    }
}

// for one group setup a side nav group section
function setupGroupSection(currentGroup){
  let currentGroupSection = groupSection.setup(this,currentGroup)
  groupsSection.push(currentGroupSection)
}

// handle to update streamers info each 5 min
function handleUpdateEach5min(){
  setInterval(function(){    
    updateStreamersInfo()
  },300000)
}

// handle to update streamers info
function updateStreamersInfo(){
    let oldGroups = groups.slice()

    uptexAPI.getGroupsStreamers(userID).then((newGroups)=>{
      groups = newGroups
      // your purpose here is to find the old group section index 
      // if not exist before ( a bit strange but this case could exist if, in the future, you allow user to add groups from the website version)
      groups.forEach((currentNewGroup)=>{ // parsing newGroups
          let groupAlreadyExist = false
          let index = 0 
          let currentOldGroup = null
          oldGroups.forEach((_currentOldGroup)=>{ // trying to find old group index
            if(_currentOldGroup.name===currentNewGroup.name){
              groupAlreadyExist=true
              currentOldGroup = _currentOldGroup
            }else{
              index++
            }
          })
          if(!groupAlreadyExist){ // if doesn't exist you setup it
            setupGroupSection(currentNewGroup)
          }else{ // exist so u update it
            groupsSection[index].currentGroupUpdate(currentOldGroup,currentNewGroup)
          }
        })
        
    }).catch((err)=>{
        debug.error('error while trying to get pinned streamers through the api. err :',err )
    })
}


module.exports = new SideGroupsModule()

