const express = require('express'); 
const fs = require('fs')
const https = require('https')
const database = require('./database')
const twitchAPI = require('./twitch-api')

const domain="uptextv.com"
const port = 3000; 

const privateKey = fs.readFileSync('/etc/letsencrypt/live/'+domain+'/privkey.pem', 'utf8'); // https://itnext.io/node-express-letsencrypt-generate-a-free-ssl-certificate-and-run-an-https-server-in-5-minutes-a730fbe528ca
const certificate = fs.readFileSync('/etc/letsencrypt/live/'+domain+'/cert.pem', 'utf8');
const ca = fs.readFileSync('/etc/letsencrypt/live/'+domain+'/chain.pem', 'utf8');

const credentials = {
	key: privateKey,
	cert: certificate,
	ca: ca
};

// tutorial : https://www.frugalprototype.com/developpez-propre-api-node-js-express/

var app = express(); 
var router = express.Router(); 


https.createServer(credentials, app)
    .listen(port, function () {
})
  

app.use((req, res, next) => {
    res.append('Access-Control-Allow-Origin' , 'https://www.twitch.tv');
    res.append('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    next();
});

app.use(router);  
 
app.delete('/pin',function(req,res){  // delete streamer to pinned streamers
    let cryptedUserID = req.query.userID
    let cryptedStreamerID = req.query.streamerID
    decryptID(cryptedUserID).then((userID)=>{
        decryptID(cryptedStreamerID).then((streamerID)=>{
            checkBeforeTreatment((userID)).then(()=>{
                database.deleteStreamer(userID,streamerID).then(()=>{
                    res.status(200).send({response : "ok",methode: req.method})
                })
            }).catch((err)=>{
                res.status(500).send({error : err,methode: req.method})
            })
        }).catch((err)=>{
            res.status(500).send({error:"stop trying to this api, you are going to be ban",methode:req.method})
        })
    }).catch((err)=>{
        res.status(500).send({error:"stop trying to this api, you are going to be ban",methode:req.method})
    })

})

app.put('/pin',function(req,res){ // add streamer to pinned streamers
    let cryptedUserID = req.query.userID
    let cryptedStreamerID = req.query.streamerID
    decryptID(cryptedUserID).then((userID)=>{
        decryptID(cryptedStreamerID).then((streamerID)=>{
            checkBeforeTreatment((userID)).then(()=>{
                database.addStreamer(userID,streamerID).then(()=>{
                    res.status(200).send({response : "ok",methode: req.method})
                })
            }).catch((err)=>{
                res.status(500).send({error : err,methode: req.method})
            })
        }).catch((err)=>{
            res.status(500).send({error:"stop trying to this api, you are going to be ban",methode:req.method})
        })
    }).catch((err)=>{
        res.status(500).send({error:"stop trying to this api, you are going to be ban",methode:req.method})
    })
});

app.get('/pin',function(req,res){ // get pinned streamers with their information
    let cryptedUserID = req.query.userID
    decryptID(cryptedUserID).then((userID)=>{
        checkBeforeTreatment((userID)).then((userExistedBefore)=>{
            if(userExistedBefore){
                database.getStreamers(userID).then((pinnedStreamers)=>{
                    let getStreamersInfo = new Array()
                    for(let x=0;x<pinnedStreamers.length;x++){
                        getStreamersInfo.push(twitchAPI.getStreamer(pinnedStreamers[x]))
                    }
                    Promise.all(getStreamersInfo).then((pinnedStreamersInfo)=>{
                        res.status(200)
                        res.json({pinnedStreamers : pinnedStreamersInfo,methode: req.method})
                    }).catch((err)=>{
                        res.status(500).send({error : err,methode: req.method})
                    })
                }).catch((err)=>{
                    res.status(500).send({error : err,methode: req.method})
                })
            }else{
                res.json({pinnedStreamers : [{}], methode : req.method});
            }
        }).catch((err)=>{
            res.status(500).send({error : err,methode: req.method})
        })
    }).catch((err)=>{
        res.status(500).send({error:"stop trying to this api, you are going to be ban",methode:req.method})
    })
})

app.get('/streamerInfo',function(req,res){ // get pinned streamer information ( streamInfo & streamerInfo )
    let cryptedStreamerID = req.query.streamerID
    decryptID(cryptedStreamerID).then((streamerID)=>{
        if(streamerID){
            twitchAPI.getStreamer(streamerID).then((_streamerInfo)=>{
                res.status(200)
                res.json({info:_streamerInfo,methode:req.method})
            }).catch((err)=>{
                res.status(500).send({error : err,methode: req.method})
            })
        }else{
            res.status(500).send({error : "streamerID not define",methode: req.method})
        }
    }).catch((err)=>{
        res.status(500).send({error:"stop trying to this api, you are going to be ban",methode:req.method})
    })
})

/**
 * encrypt id
 * if reject it mean what someone is trying to understand your api 
 * 
 * crypted :
 * |____________________________________0xxxxxxxxxxxxxxxxxxxxxxxxx-___________|
 * ^                                    ^                         ^           ^
 * |                                    |                         |           |
 *  __                                  |                         |            _______
 *    |                                 |                         |                   |
 *  start (you don't care)        start crypted id               end crpyted id      end (you don't care)
 *                                '0' not include                  '-' not include
 *                                      [     id in x16 (hexa)   ]
 * 
 * @param {*} cryptedID 
 */
function decryptID(cryptedID){
    return new Promise((resolve,reject)=>{
        try{
            let idFirstPart = cryptedID.split('-')[0]
            let secondPartInArray = idFirstPart.split('0')
            let id=''
            for(let x=1;x<secondPartInArray.length;x++){
                id+='0'+secondPartInArray[x]
            }
            id=parseInt(id,16)
            resolve(id)
        }catch(err){
            reject(err)
        }
    })
}


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



//curl GET 'https://149.91.81.151:3000/api/pin?userID=172304722'
//curl -X PUT 'https://149.91.81.151:3000/api/pin?userID=172304722&streamerID=117011503'
//curl -X DELETE 'https://149.91.81.151:3000/api/pin?userID=172304722&streamerID=10'
//mongo pe_db --eval "db.dropDatabase();"
//mongo pe_db --eval "db.dropDatabase();" &cd /usr/twitch_pin_extension/api/ && npm run api-listen &
//curl GET 'http://149.91.81.151:3000/api/streamerInfo?streamerID=44445592'