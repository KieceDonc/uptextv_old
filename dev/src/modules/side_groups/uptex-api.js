const uptexAPI = require('../../utils/uptex-api.js')

module.exports = {
    // make an api call to get all pinned streamers by user
    getGroupsStreamers(userID){
        return new Promise((resolve,reject)=>{
            let cryptedID = getCryptedId(userID)
            uptexAPI.get("/groups?userID="+cryptedID).then((data)=>{  
                if(data.length>0){ // checking if api hasn't return empty object. 
                  resolve(data)
                }else{ // has return empty object ( no pinned streamer )
                  // we return new Array cuz data.pinnedStreamers contain a array with one empty object
                  // and it does boring stuff 
                  resolve(new Array()) 
                }
            }).catch((err)=>{
                reject(err)
            })
        })
    },
  /**
   * make an api call to get information about a streamer
   * {
   *    broadcaster_type      |string| 	User’s broadcaster type: "partner", "affiliate", or "".
   *    -------------------------------------------------------------------------------------------------------------- Overwrites      description 	         |string| 	User’s channel description.
   *    display_name 	        |string| 	User’s display name.
   *    email 	              |string| 	User’s email address. Returned if the request includes the user:read:email scope.
   *    -------------------------------------------------------------------------------------------------------------- Overwrites      id 	                 |string| 	User’s ID.
   *    login 	              |string| 	User’s login name.
   *    offline_image_url     |string| 	URL of the user’s offline image.
   *    profile_image_url     |string| 	URL of the user’s profile image.
   *    -------------------------------------------------------------------------------------------------------------- Overwrites      type 	                 |string| 	User’s type: "staff", "admin", "global_mod", or "".
   *    view_count 	          | int  |  Total number of views of the user’s channel.
   *    broadcaster_id 	      |string| 	Twitch User ID of this channel owner
   *    broadcaster_name 	    |string| 	Twitch User name of this channel owner
   *    MAY NOT BE OVERWRITE IF STREAM IS OFFLINE -------------------------------------------------------------------- Overwrites      game_id 	             |string| 	Current game ID being played on the channel
   *    broadcaster_language  |string| 	Language of the channel
   *    title 	              |string| 	Title of the stream
   *    description 	        |string| 	Description of the stream
   *    isStreaming           |boolean| if streaming = true else = false
   *    FROM THIS PART MAY NOT APPEAR IF STREAM OFFLINE
   *    game_id 	            |string| 	ID of the game being played on the stream.
   *    id 	                  |string| 	Stream ID.
   *    language 	            |string| 	Stream language.
   *    pagination 	          |string| 	A cursor value, to be used in a subsequent request to specify the starting point of the next set of results.
   *    started_at 	          |string| 	UTC timestamp. 
   *    tag_ids 	            |string| 	Shows tag IDs that apply to the stream.
   *    thumbnail_url         |string| 	Thumbnail URL of the stream. All image URLs have variable width and height. You can replace {width} and {height} with any values to get that size image
   *    title 	              |string| 	Stream title.
   *    type 	                |string| 	Stream type: "live" or "" (in case of error).
   *    user_id 	            |string| 	ID of the user who is streaming.
   *    user_name 	          |string| 	Display name corresponding to user_id.
   *    viewer_count          | int  |  Number of viewers watching the stream at the time of the query.
   * }
   * @param {*} streamerID 
   */
    getStreamerInfo(streamerID){
        return new Promise((resolve,reject)=>{
            let cryptedID = getCryptedId(streamerID)
            uptexAPI.get("/streamer?streamerID="+cryptedID).then((data)=>{
                resolve(data.info)
            }).catch((err)=>{
                reject(err)
            })
        })
    },

    addStreamer(groupID,userID,streamerID){
        return new Promise((resolve,reject)=>{
            let userCryptedID = getCryptedId(userID)
            let streamerCryptedID = getCryptedId(streamerID)
            uptexAPI.put('/groups?groupID='+groupID+'userID='+userCryptedID+'&streamerID='+streamerCryptedID).then(()=>{
                resolve()
            }).catch((err)=>{
                reject(err)
            })
        })
    },

    deleteStreamer(groupID,userID,streamerID){
        return new Promise((resolve,reject)=>{
            let userCryptedID = getCryptedId(userID)
            let streamerCryptedID = getCryptedId(streamerID)
            uptexAPI.delete('/groups?groupID='+groupID+'userID='+userCryptedID+'&streamerID='+streamerCryptedID).then(()=>{
                resolve()
            }).catch((err)=>{
                reject(err)
            })
        })
    },

    modifyLiveColor(groupID,userID,liveColor){
        return new Promise((resolve,reject)=>{
            let userCryptedID = getCryptedId(userID)
            uptexAPI.put('/groups/livecolor?groupID='+groupID+'userID='+userCryptedID+'&liveColor='+liveColor).then(()=>{
                resolve()
            }).catch((err)=>{
                reject(err)
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

// from ttt to 156_156_156 
function getGroupCryptedId(groupID){
    let final = ''
    for(let x=0;x<groupID.length;x++){
        final+=groupID.charCodeAt(x)+'_'
    }
    return final.substring(0,final.length)
}

