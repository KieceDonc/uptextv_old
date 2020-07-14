const request = require('request');

const app_twitch_client_id = '0c36td77t9i3e1npj8gy6req93567o'
const app_twitch_secret = '3cmxyp0fd5fvcg6k18qme2v67kaeei'
const token_url = 'https://id.twitch.tv/oauth2/token?client_id='+app_twitch_client_id+'&client_secret='+app_twitch_secret+'&grant_type=client_credentials'
const API_ENDPOINT = 'https://api.twitch.tv/helix/'

var current_token
var current_token_expire_date=0 // in milliseconds since midnight, January 1, 1970. It must be initialize

/**
 * get twitch access token to make twitch api call
 * it handle if token is expire or not
 */
function getTwitchAccessToken(){
    return new Promise((resolve,reject)=>{
        if(new Date().getTime()>current_token_expire_date){ // check if token expire             
            request.post({ 
                headers: {'content-type' : 'application/json' }, 
                url: token_url 
            }, 
                function(error, response, body){
                    body = JSON.parse(body)
                    if(error){
                        reject(error)
                    }else{
                        current_token=body.access_token
                        current_token_expire_date=body.expires_in+new Date().getTime()-1000 //  number in milliseconds the token expire ( ? not sure you should check twitch api documentation ) + number of milliseconds since midnight, January 1, 1970. January 1, 1970. - 1000 ( retire 1s for security ( time proccess ?) ) 
                        resolve(body.access_token)
                    }
            }); 
        }else{
            resolve(current_token)
        }
    })
}

module.exports = {

    /**
     * title is prelly clear
     * return object under this form
     * broadcaster_type  |string| 	User’s broadcaster type: "partner", "affiliate", or "".
     * description 	     |string| 	User’s channel description.
     * display_name 	 |string| 	User’s display name.
     * email 	         |string| 	User’s email address. Returned if the request includes the user:read:email scope.
     * id 	             |string| 	User’s ID.
     * login 	         |string| 	User’s login name.
     * offline_image_url |string| 	URL of the user’s offline image.
     * profile_image_url |string| 	URL of the user’s profile image.
     * type 	         |string| 	User’s type: "staff", "admin", "global_mod", or "".
     * view_count 	     | int	|   Total number of views of the user’s channel.
     * @param {*} userID 
     */
    getUser(userID){
        return new Promise((resolve,reject)=>{
            getTwitchAccessToken().then((bearer_token)=>{
                let urlToCall = API_ENDPOINT+'users?id='+userID
                request.get({ 
                    headers: {
                        'content-type' : 'application/json',
                        'Authorization': 'Bearer '+bearer_token,
                        'Client-ID' : app_twitch_client_id
                    }, 
                    url: urlToCall 
                }, 
                    function(error, response, body){
                        body = JSON.parse(body)
                        if(error){
                            reject(error)
                        }else{
                            resolve(body.data[0]) // data[0] is needed cuz normaly you can ask for several user information but we just want data for our user
                        }
                });
            }).catch((err)=>{
                reject(err)
            })
        })
    },

    /**
     * return information about the stream of a user 
     * return object under this form : 
     * status 	            |string| 	Channel’s streaming status
     * broadcaster_id 	    |string| 	Twitch User ID of this channel owner
     * game_id 	            |string| 	Current game ID being played on the channel
     * broadcaster_language |string| 	Language of the channel
     * title 	            |string| 	Title of the stream
     * description 	        |string| 	Description of the stream
     * @param {*} streamerID 
     */
    getStream(streamerID){
        return new Promise((resolve,reject)=>{
            getTwitchAccessToken().then((bearer_token)=>{
                let urlToCall = API_ENDPOINT+'channels?broadcaster_id='+streamerID
                request.get({ 
                    headers: {
                        'content-type' : 'application/json',
                        'Authorization': 'Bearer '+bearer_token,
                        'Client-ID' : app_twitch_client_id
                    }, 
                    url: urlToCall 
                }, 
                    function(error, response, body){
                        body = JSON.parse(body)
                        if(error){
                            reject(error)
                        }else{
                            resolve(body.data[0]) // data[0] is needed cuz normaly you can ask for several user information but we just want data for our user
                        }
                });
            }).catch((err)=>{
                reject(err)
            })
        })
    },

     /**
     * return information about the stream and the user ( the streamer )
     * return object under this form : 
     * streamer :{
     *    broadcaster_type      |string| 	User’s broadcaster type: "partner", "affiliate", or "".
     *    description 	        |string| 	User’s channel description.
     *    display_name 	        |string| 	User’s display name.
     *    email 	            |string| 	User’s email address. Returned if the request includes the user:read:email scope.
     *    id 	                |string| 	User’s ID.
     *    login 	            |string| 	User’s login name.
     *    offline_image_url     |string| 	URL of the user’s offline image.
     *    profile_image_url     |string| 	URL of the user’s profile image.
     *    type 	                |string| 	User’s type: "staff", "admin", "global_mod", or "".
     *    view_count 	        | int  |    Total number of views of the user’s channel.
     * },
     * stream:{
     *    broadcaster_id 	    |string| 	Twitch User ID of this channel owner
     *    game_id 	            |string| 	Current game ID being played on the channel
     *    broadcaster_language  |string| 	Language of the channel
     *    title 	            |string| 	Title of the stream
     *    description 	        |string| 	Description of the stream
     * }
     * @param {*} streamerID 
     */
    getStreamer(streamerID){
        return new Promise((resolve,reject)=>{

            let streamerInfo
            let streamInfo

            this.getUser(streamerID).then((user)=>{
                streamerInfo = user
                onInformationReceived()
            }).catch((err)=>{
                reject(err)
            })

            this.getStream(streamerID).then((stream)=>{
                streamInfo = stream

                onInformationReceived()
            }).catch((err)=>{
                reject(err)
            })

            /**
             * check if we received streamer & stream info. If yes, create an oject of this and return this object
             */
            let onInformationReceived = function(){
                if(streamerInfo&&streamInfo){
                    resolve({
                        'streamer':streamerInfo,
                        'stream':streamInfo
                    })
                }
            }
        })
    },

}