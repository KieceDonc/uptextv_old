const request = require('request');
const app_twitch_client_id = '0c36td77t9i3e1npj8gy6req93567o'
const API_ENDPOINT = 'https://api.twitch.tv/helix/'

module.exports = {

    /**
     * @param {String} bearer_token 
     */
    getUserInfo(bearer_token){
        return new Promise((resolve,reject)=>{
            let urlToCall = 'https://id.twitch.tv/oauth2/userinfo'
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
                        resolve(response) // data[0] is needed cuz normaly you can ask for several user information but we just want data for our user
                    }
            })   
        })
    }
}
