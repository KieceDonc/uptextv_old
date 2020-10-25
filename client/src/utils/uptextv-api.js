const io = require('socket.io-client')
const socket = io('https://uptextv.com:3000',{transport:["websocket"]});

module.exports = {
    // make an api call to get all pinned streamers by user

    setup(userID){
        return new Promise((resolve,reject)=>{
            let cryptedUserID = getCryptedId(userID)
            socket.emit('setup',cryptedUserID)
            socket.on('callback_setup',(reply)=>{
                if(reply==='done'){
                    resolve()
                }else{
                    reject(reply)
                }
            })
        })
    },
    
    getGroupsStreamers(userID){
        return new Promise((resolve,reject)=>{
            let cryptedUserID = getCryptedId(userID)
            socket.emit('get_groups',cryptedUserID)
            socket.on('callback_get_groups',(reply,groups)=>{
                if(reply==='done'){ // no error
                    resolve(groups)
                }else{ 
                    reject(reply)
                }
            })
        })
    },
  /**
   * make an api call to get information about a streamer
   * {
   *    broadcaster_type      |string| 	User’s broadcaster type: "partner", "affiliate", or "".
   *    -------------------------------------------------------------------------------------------------------------- Overwrites      description 	         |string| 	User’s channel description.
   *    display_name 	      |string| 	User’s display name.
   *    email 	              |string| 	User’s email address. Returned if the request includes the user:read:email scope.
   *    -------------------------------------------------------------------------------------------------------------- Overwrites      id 	                 |string| 	User’s ID.
   *    login 	              |string| 	User’s login name.
   *    offline_image_url     |string| 	URL of the user’s offline image.
   *    profile_image_url     |string| 	URL of the user’s profile image.
   *    -------------------------------------------------------------------------------------------------------------- Overwrites      type 	                 |string| 	User’s type: "staff", "admin", "global_mod", or "".
   *    view_count 	          | int  |  Total number of views of the user’s channel.
   *    broadcaster_id 	      |string| 	Twitch User ID of this channel owner
   *    broadcaster_name 	  |string| 	Twitch User name of this channel owner
   *    MAY NOT BE OVERWRITE IF STREAM IS OFFLINE -------------------------------------------------------------------- Overwrites      game_id 	             |string| 	Current game ID being played on the channel
   *    broadcaster_language  |string| 	Language of the channel
   *    title 	              |string| 	Title of the stream
   *    description 	      |string| 	Description of the stream
   *    isStreaming           |boolean| if streaming = true else = false
   *    FROM THIS PART MAY NOT APPEAR IF STREAM OFFLINE
   *    game_id 	          |string| 	ID of the game being played on the stream.
   *    id 	                  |string| 	Stream ID.
   *    language 	          |string| 	Stream language.
   *    pagination 	          |string| 	A cursor value, to be used in a subsequent request to specify the starting point of the next set of results.
   *    started_at 	          |string| 	UTC timestamp. 
   *    tag_ids 	          |string| 	Shows tag IDs that apply to the stream.
   *    thumbnail_url         |string| 	Thumbnail URL of the stream. All image URLs have variable width and height. You can replace {width} and {height} with any values to get that size image
   *    title 	              |string| 	Stream title.
   *    type 	              |string| 	Stream type: "live" or "" (in case of error).
   *    user_id 	          |string| 	ID of the user who is streaming.
   *    user_name 	          |string| 	Display name corresponding to user_id.
   *    viewer_count          | int  |  Number of viewers watching the stream at the time of the query.
   * }
   * @param {*} streamerID normal
   */
    getStreamerInfo(streamerID){
        return new Promise((resolve,reject)=>{
            let cryptedStreamerID = getCryptedId(streamerID)
            socket.emit('get_streamer_info',cryptedStreamerID)
            socket.on('callback_get_streamer_info',(reply,streamerInfo)=>{
                if(reply==='done'){ // no error
                    resolve(streamerInfo)
                }else{ 
                    reject(reply)
                }
            })
        })
    },

    /**
     * 
     * @param {*} groupID IN ASCII
     * @param {*} userID normal
     */
    isGroupAlreadyExist(groupID,userID){
        return new Promise((resolve,reject)=>{
            let userCryptedID = getCryptedId(userID)
            socket.emit('group_exist',groupID,userCryptedID)
            socket.on('callback_group_exist',(reply,isGroupAlreadyExist)=>{
                if(reply==='done'){ // no error
                    resolve(isGroupAlreadyExist)
                }else{ 
                    reject(reply)
                }
            })
        })
    },

    /**
     * 
     * @param {*} groupID IN ASCII
     * @param {*} userID normal
     */
    addGroup(groupID,userID){
        return new Promise((resolve,reject)=>{
            let userCryptedID = getCryptedId(userID)
            socket.emit('add_group',groupID,userCryptedID)
            socket.on('callback_add_group',(reply)=>{
                if(reply==='done'){ // no error
                    resolve()
                }else{ 
                    reject(reply)
                }
            })
        })
    },

    deleteGroup(groupID,userID){
        return new Promise((resolve,reject)=>{
            let userCryptedID = getCryptedId(userID)
            socket.emit('delete_group',groupID,userCryptedID)
            socket.on('callback_delete_group',(reply)=>{
                if(reply==='done'){ // no error
                    resolve()
                }else{ 
                    reject(reply)
                }
            })
        })
    },

    /**
     * 
     * @param {String} groupID IN ASCII
     * @param {String} userID normal
     * @param {String} streamerID normal
     */
    addStreamer(groupID,userID,streamerID){
        return new Promise((resolve,reject)=>{
            let streamerCryptedID = getCryptedId(streamerID)
            let userCryptedID = getCryptedId(userID)
            socket.emit('add_streamer_in_group',groupID,userCryptedID,streamerCryptedID)
            socket.on('callback_add_streamer_in_group',(reply)=>{
                if(reply==='done'){ // no error
                    resolve()
                }else{ 
                    reject(reply)
                }
            })
        });
    },

    /**
     * 
     * @param {*} groupID IN ASCII
     * @param {*} userID normal
     * @param {*} streamerID normal
     */
    deleteStreamer(groupID,userID,streamerID){
        return new Promise((resolve,reject)=>{
            let streamerCryptedID = getCryptedId(streamerID)
            let userCryptedID = getCryptedId(userID)
            socket.emit('delete_streamer_in_group',groupID,userCryptedID,streamerCryptedID)
            socket.on('callback_delete_streamer_in_group',(reply)=>{
                if(reply==='done'){ // no error
                    resolve()
                }else{ 
                    reject(reply)
                }
            })
        })
    },

    /**
     * 
     * @param {*} groupID IN ASCII
     * @param {*} userID normal
     * @param {*} propertyName liveColor,sortByIndex,isGroupHiden,groupIndex
     * @param {*} propertyValue correspondy to type of propertyName
     */
    setGroupProperty(groupID,userID,propertyName,propertyValue){
        return new Promise((resolve,reject)=>{
            let userCryptedID = getCryptedId(userID)
            socket.emit('set_group_property',groupID,userCryptedID,propertyName,propertyValue)
            socket.on('callback_set_group_property',(_propertyName,reply)=>{
                if(propertyName===_propertyName){
                    if(reply==='done'){ // no error
                        resolve()
                    }else{ 
                        reject(reply)
                    }
                }
            })
        })
    },

    /**
     * 
     * @param {*} groupID 
     * @param {*} userID 
     * @param {*} propertyName liveColor,sortByIndex,isGroupHiden,groupIndex 
     * @return {*} correspondy to type of propertyName
     */
    getGroupProperty(groupID,userID,propertyName){
        return new Promise((resolve,reject)=>{
            let userCryptedID = getCryptedId(userID)
            socket.emit('get_group_property',groupID,userCryptedID,propertyName)
            socket.on('callback_get_group_property',(_propertyName,reply,_propertyValue)=>{
                if(propertyName===_propertyName){
                    if(reply=='done'){
                        resolve(_propertyValue)
                    }else{
                        reject(reply)
                    }
                }
            })
        })
    }

}

  

/**
 * crypt the id
 */
function getCryptedId(id){

    let finalID = 'doNotTryToHackMyAPIItsBoringForMeAndYouWillProbablyNotSucceed'
    let firstPartLength = randomIntFromInterval(50,150); // random and useless part  
    let idInHexa = parseInt(id).toString(16)
    let lastPartLength = 180-idInHexa.toString().length-firstPartLength
    for(let x=0;x<firstPartLength;x++){
      finalID+=getRandomCharactersFirstPart()
    }
    finalID+='0'+idInHexa+'-'
    for(let x=0;x<lastPartLength;x++){
      finalID+=getRandomCharactersSecondPart()
    }
    return finalID
  }
  
function getRandomCharactersFirstPart(){
    let letterOrNumber = randomIntFromInterval(0,1);
    if(letterOrNumber==0){ // letter
        return getRamdomLetter()
    }else{
        return randomIntFromInterval(1,9)
    }
}

function getRandomCharactersSecondPart(){
    let random = randomIntFromInterval(0,30);
    if(random<15){
        return getRamdomLetter()
    }else if(random<28){
        return randomIntFromInterval(0,9)
    }else if(random<29){
        return '-'
    }else{
        return '_'
    }
}

function getRamdomLetter(){
    let upper_or_lower = randomIntFromInterval(0,1);
    let ascii_letter
    if(upper_or_lower==0){ // upper
        ascii_letter = randomIntFromInterval(65,90)
    }else{ // lower
        ascii_letter = randomIntFromInterval(97,122)
    }
    return String.fromCharCode(ascii_letter)
}

function randomIntFromInterval(min, max) { // min and max included 
    return Math.floor(Math.random() * (max - min + 1) + min);
}

