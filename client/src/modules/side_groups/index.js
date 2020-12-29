const watcher = require('../../watcher');
const twitch = require('../../utils/twitch')
const uptextvAPI = require('../../utils/uptextv-api')
const debug = require('../../utils/debug')
const groupSection = require('./groupSection')
const pinButton = require('./pinButton');
const sideBottomBar = require('./sideBottomBar');
const follow = require('../../watchers/follow')

const defaultLiveColor = '#007aa3'

var groupsSection = new Array()
//var groups = new Array()

var userID // id of current user

class SideGroupsModule{
    constructor(){
      if(!twitch.getCurrentUser()){
        // user isn't connected
        return null
      }  

      userID = twitch.getCurrentUser().id 
      
      watcher.on('load.sidenav',()=>{
        uptextvAPI.setup(userID).then(()=>{
          uptextvAPI.getGroupsStreamers(userID).then((groups)=>{
            groups.sort((groupA,groupB)=>{
              return groupB.groupIndex - groupA.groupIndex
            })
            groups.forEach((currentGroup)=>{
              setupGroupSection(currentGroup,this)
              sideBottomBar.setup(this)
            }) 
            handleUpdateEach5min(this)
          })
        }).catch((err)=>{
          debug.error('error:',err )
        })
      })

      watcher.on('load.followbar',()=>{
        var pinButtonInstance = null

        if(follow.isFollowing){
          pinButtonInstance = pinButton.setup(this)
        }

        follow.onFollow(()=>{
          pinButtonInstance = pinButton.setup(this)
        })

        follow.onUnfollow(()=>{
          pinButtonInstance.selfRemove()
          pinButtonInstance = null
        })  
      }) 
    }

    getUserID(){
      return userID
    }

    getGroupsSection(){
      return groupsSection
    }

    // add a new group section on top from id
    // id must be in ASCII CODE
    addNewGroupSection(groupID){
      uptextvAPI.addGroup(groupID,userID).then(()=>{
        let newGroupObject = {
          name:groupID,
          list:[],
          liveColor:defaultLiveColor,
          sortByIndex:0,
          isGroupHiden:false,
          groupIndex:0
        }
        // because you added a new group section you need to shift every group section index by one
        groupsSection.forEach((currentGroupSection)=>{
          currentGroupSection.setGroupIndex(currentGroupSection.getGroupIndex()+1)
        }) 
        setupGroupSection(newGroupObject,this)
      }).catch((err)=>{
        debug.error('error while trying to add a new group in index.js',err)
      })
    }

    deleteGroupSection(indexOfGroup){  
      // splice delete from groupsSection and stock in deletedGroupSection the deleted group section 
      let deletedGroupSection = groupsSection.splice(indexOfGroup, 1)[0];
      let deletedGroupSectionIndex = deletedGroupSection.getGroupIndex()

      // for every group section you need to check if the 'current group section' is higher than the deleted group section index
      // you have to do to decremente the value also you will have bugs
      groupsSection.forEach((currentGroupSection)=>{
        let currentGroupSectionIndex = currentGroupSection.getGroupIndex()
        if(currentGroupSectionIndex>deletedGroupSectionIndex){
          currentGroupSection.setGroupIndex(currentGroupSectionIndex-1)
        }
      })
    }

    getGroupSectionIndexByID(groupID){
      let founded = false
      let cmpt = 0
      do{
        if(groupsSection[cmpt].getGroupID()==groupID){
          return groupsSection[cmpt].getGroupIndex()
        }
        cmpt++
      }while(cmpt<groupsSection.length&&!founded)
      return -2 // normaly impossible
    }

    getGroupSectionByIndex(index){
      if(index>=groupsSection.length||index<0){
        return -1
      }
      let founded = false
      let cmpt = 0
      do{
        if(groupsSection[cmpt].getGroupIndex()==index){
          return groupsSection[cmpt]
        }
        cmpt++
      }while(cmpt<groupsSection.length&&!founded)
      return -1 // normaly impossible
    }

    groupsSectionSwitchElements(first_element_index,second_element_index){
      let newGroupsSection = new Array()
      for(let x=0;x<groupsSection.length;x++){
        if(x==first_element_index||x==second_element_index){
          if(first_element_index==x){
            newGroupsSection.push(groupsSection[second_element_index])
          }else{
            newGroupsSection.push(groupsSection[first_element_index])
          }
        }else{
          newGroupsSection.push(groupsSection[x])
        }
      }
      groupsSection = newGroupsSection
    }
}

// setup for one group setup a side nav group section
function setupGroupSection(currentGroup,sideGroupsModule){
  var currentGroupSection = groupSection.setup(currentGroup,sideGroupsModule) // groupsSection.length represent the position of the currentGroup
  groupsSection.unshift(currentGroupSection)
}

// handle to update streamers info each 5 min
function handleUpdateEach5min(sideGroupsModule){
  setInterval(function(){    
    updateStreamersInfo(sideGroupsModule)
  },300000)
}

// handle to update streamers info
function updateStreamersInfo(sideGroupsModule){
   uptextvAPI.getGroupsStreamers(userID).then((newGroupsObject)=>{
    newGroupsObject.forEach((currentNewGroupObject)=>{
        let idToFind = currentNewGroupObject['name']
        let founded = false
        let index = -1 
        do{
          index+=1
          let currentGroupSectionID = groupsSection[index].getGroupID()
          founded = currentGroupSectionID === idToFind
        }while(index<groupsSection.length&&!founded)
        if(founded){
          let currentGroupSection = groupsSection[index]
          let oldGroupList = currentGroupSection.getGroupList()
          let newGroupList = currentNewGroupObject['list']
          currentGroupSection.setGroupList(newGroupList)
          currentGroupSection.sortStreamer()
          currentGroupSection.onListUpdate(oldGroupList)
        }else{
          setupGroupSection(currentNewGroupObject,sideGroupsModule)
        }
      })
    }).catch((err)=>{
        debug.error('error while trying to get pinned streamers through the api. err :',err )
    })
}

module.exports = new SideGroupsModule()