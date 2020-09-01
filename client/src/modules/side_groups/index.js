const watcher = require('../../watcher');
const twitch = require('../../utils/twitch')
const uptexAPI = require('./uptex-api')
const debug = require('../../utils/debug')
const groupSection = require('./groupSection')
const pinButton = require('./pinButton');
const sideBottomBar = require('./sideBottomBar');

const io = require('socket.io-client')
const socket = io('https://uptextv.com:3000');

const defaultLiveColor = '#007aa3'

var groupsSection = new Array()
var groups = new Array()

var userID // id of current user
var streamerID // id of streamerID


class SideGroupsModule{
    constructor(){  
      watcher.on('load.sidenav',()=>{
        userID = twitch.getCurrentUser().id
        socket.emit('setup',userID)
        sideBottomBar.setup(this)
        uptexAPI.getGroupsStreamers(userID).then((_groups)=>{
          groups = _groups
          groups.forEach((currentGroup)=>{
            setupGroupSection(currentGroup,this)
          }) 
          handleUpdateEach5min(this)
        }).catch((err)=>{
          debug.error('error while trying to get groups through the api. err :',err )
        })
      })
      watcher.on('load.followbutton',()=>{
        streamerID = twitch.getCurrentChannel().id
        pinButton.setup(this)
      })     
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
        setupGroupSection(newGroupObject,this)
      }).catch((err)=>{
        debug.error('error while trying to add a new group in index.js',err)
      })
    }

    deleteGroupSection(indexOfGroup){  
      groupsSection = groupsSection.splice(indexOfGroup, 1);
      groups = groups.splice(indexOfGroup,1)
    }
}

// setup for one group setup a side nav group section
function setupGroupSection(currentGroup,sideGroupsModule){
  console.log('called')
  var currentGroupSection = groupSection.setup(currentGroup,groupsSection.length,sideGroupsModule) // groupsSection.length represent the position of the currentGroup
  groupsSection.push(currentGroupSection)
}

// handle to update streamers info each 5 min
function handleUpdateEach5min(sideGroupsModule){
  setInterval(function(){    
    updateStreamersInfo(sideGroupsModule)
  },300000)
}

// handle to update streamers info
function updateStreamersInfo(sideGroupsModule){
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
            setupGroupSection(currentNewGroup,sideGroupsModule)
          }else{ // exist so u update it
            groupsSection[index].onGroupUpdate(currentOldGroup['list'],currentNewGroup['list'])
          }
        })
        
    }).catch((err)=>{
        debug.error('error while trying to get pinned streamers through the api. err :',err )
    })
}


module.exports = new SideGroupsModule()

