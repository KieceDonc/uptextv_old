const express = require('express'); 
const fs = require('fs')
const https = require('https')
const database = require('./database')
const twitchAPI = require('./twitch-api');

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

var app = express();  

var server = https.createServer(credentials, app)
    .listen(port, function () {
})
  
var router = express.Router();

app.use((req, res, next) => {
    res.append('Access-Control-Allow-Origin' , 'https://www.twitch.tv');
    res.append('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    next();
});

app.use(router);  

app.get('/api/group_exist',function(req,res){ // check if group exist in db 
    let cryptedGroupID = req.query.groupID
    let cryptedUserID = req.query.userID
    try{
        let userID = decryptID(cryptedUserID)
        checkBeforeTreatment((userID)).then(()=>{
            database.isGroupExist(cryptedGroupID,userID).then((groupExistBoolean)=>{
                res.status(200).send({response : "ok",methode: req.method,boolean:groupExistBoolean})
            })
        })
    }catch{
        res.status(500).send({error:"stop trying to hack this api, you are going to be ban",methode:req.method})
    }
});

app.get('/api/streamers',function(req,res){ // get streamers info from all group id
    let cryptedUserID = req.query.userID
    try{
        let userID = decryptID(cryptedUserID)
        checkBeforeTreatment((userID)).then(()=>{
            database.getStreamers(userID).then((streamers)=>{

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
                    database.getGroups(userID).then((groups)=>{
                                
                        let arrayToReturn = new Array()
                        let currentGroupList // for this group creating an array which contain all streamer info of this group   

                        groups.forEach((currentGroup)=>{
                            currentGroupList = new Array()
                            currentGroup['list'].forEach((streamerID)=>{
                                let desireStreamerInfo = streamersInfo.filter( streamerInfo => streamerInfo['broadcaster_id'] == streamerID ) // getting the desire streamer info of the list of all streamers info
                                currentGroupList.push(desireStreamerInfo[0]) // pushing the desire streamer info in the array of the current streamers group
                            })
                        
                            arrayToReturn.push({
                                'name':getGroupCryptedID(currentGroup['name']),
                                'list':currentGroupList,
                                'liveColor':currentGroup['liveColor']
                            })
                        })
                        res.status(200)
                        res.json({result : arrayToReturn,methode: req.method})
                    })
                })
            
            }).catch((err)=>{
                res.status(500).send({error : err,methode: req.method})
            })
        })
    }catch{
        res.status(500).send({error:"stop trying to hack this api, you are going to be ban",methode:req.method})
    }
})

app.put('/api/group/livecolor',function(req,res){ // modify live color
    let cryptedUserID = req.query.userID
    let cryptedGroupID = req.query.groupID
    let livecolor = req.query.liveColor
    try{
        let userID = decryptID(cryptedUserID)
        database.modifyLiveColor(cryptedGroupID,userID,livecolor).then(()=>{
            res.status(200).send()
        }).catch((err)=>{
            res.status(500).send({error : err,methode: req.method})
        })
    }catch{
        res.status(500).send({error:"stop trying to hack this api, you are going to be ban",methode:req.method})
    }
})

app.get('/api/streamer',function(req,res){ // get streamer info
    let cryptedStreamerID = req.query.streamerID
    try{
        let streamerID = decryptID(cryptedStreamerID)
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
    }catch{
        res.status(500).send({error:"stop trying to hack this api, you are going to be ban",methode:req.method})
    }
})

function decryptIDS(){
    return new Promise((resolve,reject)=>{
        try{
            arrayNormalID = new Array()
            for(let x=0;x<arguments.length;x++){
                let cryptedID = arguments[x]
                arrayNormalID.push(decryptID(cryptedID))
            }
            resolve(arrayNormalID)
        }catch(_){
            reject(_)
        }
    })
}

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
    try{
        let idFirstPart = cryptedID.split('-')[0]
        let secondPartInArray = idFirstPart.split('0')
        let id=''
        for(let x=1;x<secondPartInArray.length;x++){
            id+='0'+secondPartInArray[x]
        }
        id=parseInt(id,16)
        return id
    }catch(err){
        throw 'stop trying to this api, you are going to be ban'
    }
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


// from ttt to 156_156_156 
function getGroupCryptedID(groupID){
    let final = ''
    for(let x=0;x<groupID.length;x++){
        final+=groupID.charCodeAt(x)+'_'
    }
    return final.substring(0,final.length-1 )
}

//mongo pe_db --eval "db.dropDatabase();"
//mongo pe_db --eval "db.dropDatabase();" &cd /usr/twitch_pin_extension/api/ && npm run api-listen &


var io = require('socket.io').listen(server);

io.on('connection', (socket) => {

    socket.on('setup',(cryptedUserID)=>{
        try{
            let userID = decryptID(cryptedUserID)
            setup(userID)
        }catch(err){
            socket.broadcast.emit('err',err)
        }
    })

    socket.on('add_group',(cryptedGroupID,cryptedUserID)=>{
        add_group(cryptedGroupID,cryptedUserID).then(()=>{
            socket.emit('callback_add_group','done')
        }).catch((err)=>{
            socket.emit('callback_add_group',err)
        })
    })
    socket.on('delete_group',(cryptedGroupID,cryptedUserID)=>{
        delete_group(cryptedGroupID,cryptedUserID).then(()=>{
            socket.emit('callback_delete_group','done')
        }).catch((err)=>{
            socket.emit('callback_delete_group',err)
        })     
    })
    socket.on('add_streamer_in_group',(cryptedGroupID,cryptedUserID,cryptedStreamerID)=>{
        add_streamer_in_group(cryptedGroupID,cryptedUserID,cryptedStreamerID).then(()=>{
            socket.emit('callback_add_streamer_in_group','done')
        }).catch((err)=>{
            socket.emit('callback_add_streamer_in_group',err)
        })
    })
    socket.on('delete_streamer_in_group',(cryptedGroupID,cryptedUserID,cryptedStreamerID)=>{
        delete_streamer_in_group(cryptedGroupID,cryptedUserID,cryptedStreamerID).then(()=>{
            socket.emit('callback_delete_streamer_in_group','done')
        }).catch((err)=>{
            socket.emit('callback_delete_streamer_in_group',err)
        })
    })
});

function setup(userID){
    return new Promise((resolve,reject)=>{
        database.isUserExist(userID).then((userExist)=>{
            if(!userExist){
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

function add_group(cryptedGroupID,cryptedUserID){
    return new Promise((resolve,reject)=>{
        try{
            let userID = decryptID(cryptedUserID)
            database.addGroup(cryptedGroupID,userID).then(()=>{
                resolve()
            }).catch((err)=>{
                reject(err)
            })
        }catch{
            reject('stop trying to hack this api, you are going to be ban')
        }
    })
}

function delete_group(cryptedGroupID,cryptedUserID){
    return new Promise((resolve,reject)=>{
        try{
            let userID = decryptID(cryptedUserID)
            database.deleteGroup(cryptedGroupID,userID).then(()=>{
                resolve()
            }).catch((err)=>{
                reject(err)
            })
        }catch{
            reject('stop trying to hack this api, you are going to be ban')
        }
    })
}

function add_streamer_in_group(cryptedGroupID,cryptedUserID,cryptedStreamerID){
    return new Promise((resolve,reject)=>{
        decryptIDS(cryptedUserID,cryptedStreamerID).then((arrayOfIDS)=>{
            let userID = arrayOfIDS[0]
            let streamerID = arrayOfIDS[1]
            database.addStreamer(cryptedGroupID,userID,streamerID).then(()=>{
                resolve()
            }).catch((err)=>{
                reject(err)
            })
        }).catch(()=>{
            reject('stop trying to hack this api, you are going to be ban')
        })
    })
}

function delete_streamer_in_group(cryptedGroupID,cryptedUserID,cryptedStreamerID){
    return new Promise((resolve,reject)=>{
        decryptIDS(cryptedUserID,cryptedStreamerID).then((arrayOfIDS)=>{
            let userID = arrayOfIDS[0]
            let streamerID = arrayOfIDS[1]
            database.deleteStreamer(cryptedGroupID,userID,streamerID).then(()=>{
                resolve()
            }).catch((err)=>{
                reject(err)
            })
        }).catch(()=>{
            reject('stop trying to hack this api, you are going to be ban')
        })
    })
}