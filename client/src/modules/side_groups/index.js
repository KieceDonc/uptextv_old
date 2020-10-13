const watcher = require('../../watcher');
const twitch = require('../../utils/twitch')
const uptextvAPI = require('../../utils/uptextv-api')
const debug = require('../../utils/debug')
const groupSection = require('./groupSection')
const pinButton = require('./pinButton');
const sideBottomBar = require('./sideBottomBar');

const defaultLiveColor = '#007aa3'

var groupsSection = new Array()
//var groups = new Array()

var userID // id of current user
var streamerID // id of streamerID


class SideGroupsModule{
    constructor(){  
      watcher.on('load.sidenav',()=>{
  
        userID = twitch.getCurrentUser().id
        uptextvAPI.setup(userID).then(()=>{
          
          uptextvAPI.setGroupProperty('82_111_99_107_101_116_32_108_101_97_103_117_101',twitch.getCurrentUser().id,'groupIndex',0)
          uptextvAPI.setGroupProperty('65_79_69_32_73_73',twitch.getCurrentUser().id,'groupIndex',1)
          uptextvAPI.setGroupProperty('67_73_86_32_86_73',twitch.getCurrentUser().id,'groupIndex',2)
          uptextvAPI.setGroupProperty('80_111_108_105_116_105_113_117_101',twitch.getCurrentUser().id,'groupIndex',3)
          uptextvAPI.setGroupProperty('67_72_69_83_83',twitch.getCurrentUser().id,'groupIndex',4)
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
        showGroupsIndex()
      }).catch((err)=>{
        debug.error('error while trying to add a new group in index.js',err)
      })
    }

    deleteGroupSection(indexOfGroup){  
      // splice delete from groupsSection and stock in deletedGroupSection the deleted group section 
      let deletedGroupSection = groupsSection.splice(indexOfGroup, 1)[0];
      let deletedGroupSectionIndex = deletedGroupSection.getGroupIndex()
      console.log(deletedGroupSection)

      // for every group section you need to check if the 'current group section' is higher than the deleted group section index
      // you have to do to decremente the value also you will have bugs
      groupsSection.forEach((currentGroupSection)=>{
        let currentGroupSectionIndex = currentGroupSection.getGroupIndex()
        if(currentGroupSectionIndex>deletedGroupSectionIndex){
          currentGroupSection.setGroupIndex(currentGroupSectionIndex-1)
        }
      })
      setTimeout(()=>{
        showGroupsIndex()
      },100)
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

function showGroupsIndex(){
  groupsSection.forEach((currentGroupSection)=>{
    console.log(currentGroupSection.getGroupID_normal()+' index ='+currentGroupSection.getGroupIndex())
  })
}

// setup for one group setup a side nav group section
function setupGroupSection(currentGroup,sideGroupsModule){
  var currentGroupSection = groupSection.setup(currentGroup,sideGroupsModule) // groupsSection.length represent the position of the currentGroup
  console.log(currentGroupSection)
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
  //let oldList = groups.slice()

  uptextvAPI.getGroupsStreamers(userID).then((newGroups)=>{
      //let groups = newGroups
      // your purpose here is to find the old group section index 
      // if not exist before ( a bit strange but this case could exist if, in the future, you allow user to add groups from the website version)
      /*groups.forEach((currentNewGroup)=>{ // parsing newGroups
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
        })*/
        /*newGroups.forEach((currentNewGroup)=>{
          let idToFind = currentNewGroup['name']
          let founded = false
          let index = -1 
          do{
            index++
            let currentGroupSectionID = groupsSection[index].getGroupID()
            founded = currentGroupSectionID === idToFind
          }while(index<groupsSection.length&&!founded)
          if(founded){
            groupsSection[index].onGroupUpdate()
          }else{
            setupGroupSection(currentNewGroup,sideGroupsModule)
          }
        })*/
        newGroups.forEach((currentNewGroup)=>{
          let idToFind = currentNewGroup['name']
          let founded = false
          let index = -1 
          do{
            index+=1
            let currentGroupSectionID = groupsSection[index].getGroupID()
            founded = currentGroupSectionID === idToFind
          }while(index<groupsSection.length&&!founded)
          if(founded){
            groupsSection[index].onGroupUpdate(currentNewGroup)
          }else{
            setupGroupSection(currentNewGroup,sideGroupsModule)
          }
        })
    }).catch((err)=>{
        debug.error('error while trying to get pinned streamers through the api. err :',err )
    })
}


module.exports = new SideGroupsModule()

