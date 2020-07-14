const express = require('express'); 
const database = require('./database')

const hostname ="149.91.81.151";
const port = 3000; 
const app_twitch_client_id = '0c36td77t9i3e1npj8gy6req93567o'
const app_twitch_token = '3cmxyp0fd5fvcg6k18qme2v67kaeei'

// tutorial : https://www.frugalprototype.com/developpez-propre-api-node-js-express/

var app = express(); 
var router = express.Router(); 

app.use(router);  
 
app.listen(port, hostname, function(){
})
 
router.route('api/pin/:client_id')
.get(function(req,res){ // get pinned streamers
    let userID = req.params.client_id
    checkBeforeTreatment((userID)).then((userExistedBefore)=>{
        if(userExistedBefore){
            database.getStreamers(userID).then((pinnedStreamers)=>{
                res.json({pinnedStreamers : pinnedStreamers, methode : req.method});
            })
        }else{
            res.json({pinnedStreamers : [], methode : req.method});
        }
    }).catch((err)=>{
        res.status(500).send(err)
    })
})

router.route('api/pin/:client_id/:streamer_id')
.delete(function(req,res){  // delete streamer to pinned streamers
    let userID = req.params.client_id
    let streamerID = req.params.streamer_id
    checkBeforeTreatment((userID)).then(()=>{
        database.deleteStreamer(userID,streamerID).then(()=>{
            res.status(200)
        })
    }).catch((err)=>{
        res.status(500).send(err)
    })
}).put(function(req,res){ // add streamer to pinned streamers
    let userID = req.params.client_id
    let streamerID = req.params.streamer_id
    checkBeforeTreatment((userID)).then(()=>{
        database.addStreamer(userID,streamerID).then(()=>{
            res.status(200)
        })
    }).catch((err)=>{
        res.status(500).send(err)
    })
});

/**
 * check if user exist in database. If not create it
 * @param {*} userID 
 */
function checkBeforeTreatment(userID){
    return new Promise((resolve,reject)=>{
        database.isUserExist(userID).then((userExist)=>{
            if(userExist){
                resolve(true)
            }else{
                database.addNewUser(userID).then(()=>{
                    resolve(false)
                })
            }
        }).catch((err)=>{
            reject(err)
        })
    })
}
