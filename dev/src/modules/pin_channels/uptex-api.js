const uptexAPI = require('../../utils/uptex-api.js')

module.exports = {
    // make an api call to get all pinned streamers by user
    getPinnedStreamers(userID){
        return new Promise((resolve,reject)=>{
            uptexAPI.get("pin?userID="+userID).then((data)=>{
                resolve(data.pinnedStreamers)
            }).catch((err)=>{
                reject(err)
            })
        })
    },
    /**
   * make an api call to get information about a streamer
   * return an object under this form :
   * streamer :{
   *    broadcaster_type      |string| 	User’s broadcaster type: "partner", "affiliate", or "".
   *    description 	      |string| 	User’s channel description.
   *    display_name 	      |string| 	User’s display name.
   *    email 	              |string| 	User’s email address. Returned if the request includes the user:read:email scope.
   *    id 	                  |string| 	User’s ID.
   *    login 	              |string| 	User’s login name.
   *    offline_image_url     |string| 	URL of the user’s offline image.
   *    profile_image_url     |string| 	URL of the user’s profile image.
   *    type 	              |string| 	User’s type: "staff", "admin", "global_mod", or "".
   *    view_count 	          | int  |    Total number of views of the user’s channel.
   * },
   * stream1:{
   *    broadcaster_id 	     |string| 	Twitch User ID of this channel owner
   *    broadcaster_name 	 |string| 	Twitch User name of this channel owner
   *    game_id 	         |string| 	Current game ID being played on the channel
   *    broadcaster_language |string| 	Language of the channel
   *    title 	             |string| 	Title of the stream
   *    description 	     |string| 	Description of the stream
   * },
   * stream2:{
   *    game_id 	     |string| 	ID of the game being played on the stream.
   *    id 	             |string| 	Stream ID.
   *    language 	     |string| 	Stream language.
   *    pagination 	     |string| 	A cursor value, to be used in a subsequent request to specify the starting point of the next set of results.
   *    started_at 	     |string| 	UTC timestamp. 
   *    tag_ids 	     |string| 	Shows tag IDs that apply to the stream.
   *    thumbnail_url    |string| 	Thumbnail URL of the stream. All image URLs have variable width and height. You can replace {width} and {height} with any values to get that size image
   *    title 	         |string| 	Stream title.
   *    type 	         |string| 	Stream type: "live" or "" (in case of error).
   *    user_id 	     |string| 	ID of the user who is streaming.
   *    user_name 	     |string| 	Display name corresponding to user_id.
   *    viewer_count     | int  |   Number of viewers watching the stream at the time of the query.
   * }
   * @param {*} streamerID 
   */
    getStreamerInfo(streamerID){
        return new Promise((resolve,reject)=>{
            uptexAPI.get("streamerInfo?streamerID="+streamerID).then((data)=>{
                resolve(data.info)
            }).catch((err)=>{
                reject(err)
            })
        })
    },

    addStreamer(userID,streamerID){
        return new Promise((resolve,reject)=>{
            uptexAPI.put('pin?userID='+userID+'&streamerID='+streamerID).then(()=>{
                resolve()
            }).catch((err)=>{
                reject(err)
            })
        })
    },

    deleteStreamer(userID,streamerID){
        return new Promise((resolve,reject)=>{
            uptexAPI.delete('pin?userID='+userID+'&streamerID='+streamerID).then(()=>{
                resolve()
            }).catch((err)=>{
                reject(err)
            })
        })
    }
}

  
