const express = require('express'); 
const database = require('./database')
const twitchAPI = require('./twitch-api')

const hostname ="149.91.81.151";
const port = 3000; 

// tutorial : https://www.frugalprototype.com/developpez-propre-api-node-js-express/

var app = express(); 
var router = express.Router(); 

app.use(router);  
 
app.listen(port, hostname, function(){
    
})
 
app.delete('/api/pin',function(req,res){  // delete streamer to pinned streamers
    let userID = req.query.userID
    let streamerID = req.query.streamerID
    if(userID&streamerID){
        checkBeforeTreatment((userID)).then(()=>{
            database.deleteStreamer(userID,streamerID).then(()=>{
                res.status(200).send("ok")
            })
        }).catch((err)=>{
            res.status(500).send(err)
        })
    }else{
        res.status(500).send("userID or/and streamerID not define")
    }

})

app.put('/api/pin',function(req,res){ // add streamer to pinned streamers
    let userID = req.query.userID
    let streamerID = req.query.streamerID
    if(userID&streamerID){
        checkBeforeTreatment((userID)).then(()=>{
            database.addStreamer(userID,streamerID).then(()=>{
                res.status(200).send("ok")
            })
        }).catch((err)=>{
            res.status(500).send(err)
        })
    }else{
        res.status(500).send("userID or/and streamerID not define")
    }
});

app.get('/api/pin',function(req,res){ // get pinned streamers
    let userID = req.query.userID
    if(userID){
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
    }else{
        res.status(500).send("userID not define")
    }
})

app.get('/api/streamerInfo',function(req,res){ // get pinned streamers information ( streamInfo & streamerInfo )
    let streamerID = req.query.streamerID
    if(streamerID){
        twitchAPI.getStreamer(streamerID).then((_streamerInfo)=>{
            res.json({info:_streamerInfo,methode:req.method})
        }).catch((err)=>{
            res.status(500).send(err)
        })
    }else{
        res.status(500).send("streamerID not define")
    }
})



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
                }).catch((err)=>{
                    reject(err)
                })
            }
        }).catch((err)=>{
            reject(err)
        })
    })
}



//curl GET 'http://149.91.81.151:3000/api/pin?userID=172304722'
//curl -X PUT 'http://149.91.81.151:3000/api/pin?userID=172304722&streamerID=10'
//curl -X DELETE 'http://149.91.81.151:3000/api/pin?userID=172304722&streamerID=10'
//mongo pe_db --eval "db.dropDatabase();"
//mongo pe_db --eval "db.dropDatabase();" &cd /usr/twitch_pin_extension/api/ && npm run api-listen &
//curl GET 'http://149.91.81.151:3000/api/streamerInfo?streamerID=44445592'