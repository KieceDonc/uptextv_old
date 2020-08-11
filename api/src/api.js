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
 
app.delete('/api/groups',function(req,res){  // delete streamer from groupID
    let cryptedGroupID = req.queri.groupID
    let cryptedUserID = req.query.userID
    let cryptedStreamerID = req.query.streamerID
    decryptID(cryptedUserID).then((userID)=>{
        decryptID(cryptedStreamerID).then((streamerID)=>{
            checkBeforeTreatment((userID)).then(()=>{
                database.deleteStreamer(cryptedGroupID,userID,streamerID).then(()=>{
                    res.status(200).send({response : "ok",methode: req.method})
                })
            })
        })
    }).catch(()=>{
        res.status(500).send({error:"stop trying to hack this api, you are going to be ban",methode:req.method})
    })
})

app.put('/api/groups',function(req,res){ // add streamer in a group from a groupID
    let cryptedGroupID = req.queri.groupID
    let cryptedUserID = req.query.userID
    let cryptedStreamerID = req.query.streamerID
    decryptID(cryptedUserID).then((userID)=>{
        decryptID(cryptedStreamerID).then((streamerID)=>{
            checkBeforeTreatment((userID)).then(()=>{
                database.addStreamer(cryptedGroupID,userID,streamerID).then(()=>{
                    res.status(200).send({response : "ok",methode: req.method})
                })
            })
        })  
    }).catch(()=>{
        res.status(500).send({error:"stop trying to hack this api, you are going to be ban",methode:req.method})
    })
});

app.get('/api/groups',function(req,res){ // get streamers info from all group id
    let cryptedUserID = req.query.userID
    decryptID(cryptedUserID).then((userID)=>{
        checkBeforeTreatment((userID)).then((userExistedBefore)=>{
            if(userExistedBefore){
                database.getStreamers(userID).then((userObject)=>{
                    let streamers = new Array() // we will add each streamer from each group in this array in purpose to get their information. Doesn't contains duplicate
                    for(var group in userObject) { 
                        if(!group.includes('_liveColor')&&group!=='ID'){
                            var groupList = userObject[group];
                            groupList.forEach((streamer)=>{
                                let indexOfStreamInStreamers = streamers.indexOf(streamer)
                                if(indexOfStreamInStreamers==-1){ // streamer isn't in array
                                    streamers.push(streamer)
                                }
                            })
                        }
                    }

                    let getStreamersInfo = new Array() // push each promise get streamer info into an arrat
                    streamers.forEach((streamer)=>{
                        getStreamersInfo.push(twitchAPI.getStreamer(streamer))
                    })                        
                    
                    Promise.all(getStreamersInfo).then((streamersInfo)=>{ // we've got streamersInfo 
                        /* we are trying to return this kind of array
                        [{
                            name:'pinned streamers',
                            list:'[streamer_info_0,streamer_info_1,streamer_info_2],
                            liveColor:'#ffffff'
                        },
                        {
                            name:'chess group',
                            list:'[streamer_info_0,streamer_info_2,streamer_info_3],
                            liveColor:'#ff0000'
                        }]

                        */
                        let arrayToReturn = new Array()

                        for(var group in userObject) { // searching all streamersInformation for all streamers in group
                            if(!group.includes('_liveColor')&&group!=='ID'){ 
                                var groupListWithStreamerInfo = new Array() // for this group creating an array which contain all streamer info of this groupe
                                var groupListWithID = userObject[group]; // getting all streamers id of this group
                                groupListWithID.forEach((streamerID)=>{ 
                                    let desireStreamerInfo = streamersInfo.filter( streamersInfo => streamersInfo['broadcast_id'] === streamerID ) // getting the desire streamer info of the list of all streamers info
                                    groupListWithStreamerInfo.push(desireStreamerInfo[0]) // pushing the desire streamer info in the array of the current streamers group
                                })
                                arrayToReturn.push({
                                    'name':group,
                                    'list':groupListWithStreamerInfo
                                })
                            }
                        }

                        for(var group in userObject) {  // searching for live color
                            if(group.includes('_liveColor')){ 
                                let currentGroupID = group.substring(0,group.length-10) // -10 because of '_liveColor'.length                               
                                arrayToReturn.forEach((currentGroupObject)=>{
                                    if(currentGroupObject.name===currentGroupID){
                                        currentGroupObject['liveColor']=userObject[group] // adding liveColor:'#ff0000'
                                    }
                                })
                            }
                        }

                        arrayToReturn.forEach((currentGroupObject)=>{ // encrypt all group name
                            currentGroupObject['name']=decryptGroupID(currentGroupObject.name) 
                        })

                        res.status(200)
                        res.json({result : arrayToReturn,methode: req.method})
                    }).catch((err)=>{
                        res.status(500).send({error : err,methode: req.method})
                    })
                }).catch((err)=>{
                    res.status(500).send({error : err,methode: req.method})
                })
            }else{
                res.json({result : [], methode : req.method});
            }
        })
    }).catch((err)=>{
        res.status(500).send({error:"stop trying to hack this api, you are going to be ban",methode:req.method})
    })
})

app.put('/api/group/livecolor',function(req,res){ // modify live color
    let cryptedUserID = req.query.userID
    let cryptedGroupID = req.queri.groupID
    let livecolor = req.query.liveColor
    decryptID(cryptedUserID).then((userID)=>{
        database.modifyLiveColor(cryptedGroupID,userID,livecolor).then(()=>{
            res.status(200).send()
        }).catch((err)=>{
            res.status(500).send({error : err,methode: req.method})
        })
    }).catch(()=>{
        res.status(500).send({error:"stop trying to hack this api, you are going to be ban",methode:req.method})
    })
})



app.get('/api/streamer',function(req,res){ // get streamer info
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
 * group id is in ascii code and each letter is separate by _
 * ex:
 * 116_116_116 
 * ttt
 */

function decryptGroupID(cryptedGroupID){
    return new Promise((resolve)=>{
        let groupID = ''
        let eachLetterInASCII = cryptedGroupID.split('_')
        eachLetterInASCII.forEach((currentASCIICode)=>{
            groupID+=String.fromCharCode(currentASCIICode)
        })
        resolve(groupID)
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