const MongoClient = require('mongodb').MongoClient;
const url = "mongodb://localhost:27017"; 
const user_collection = "users"
const dbName = 'api_db';
const defaultLiveColor = '#007aa3'

/**
 * tutorial https://www.w3schools.com/nodejs/nodejs_mongodb_createcollection.asp
 * https://www.guru99.com/node-js-mongodb.html
 */

 /**
  *             {
                    name:decryptGroupID(groupID),
                    list:[],
                    liveColor:defaultLiveColor
                } group object look like this
  */
var db = null

function getDB(){
    return new Promise((resolve,reject)=>{
        if(!db){
            MongoClient.connect(url, function(err, client) {
                if (err) reject(err);
                db = client.db(dbName)
                resolve(db)
            });
        }else{
            resolve(db)
        }
    })
}
 
function getUser(userID){
    return new Promise((resolve,reject)=>{
        getDB().then((db)=>{        
            var cursor=db.collection(user_collection).find({ID: userID})
            cursor.each(function(err, doc) {
                if(err){
                    reject(err)
                }
                if(doc!=null&&doc.ID!=null&&doc.ID!=0){
                    resolve(doc)
                }else{
                    resolve(null)
                }
            });
        }).catch((err)=>{
            reject(err)
        })
    })
}

function getGroup(groupID,userID){
    return new Promise((resolve,reject)=>{
        getDB().then((db)=>{
            var cursor=db.collection(user_collection).find({ID: userID})

            cursor.each(function(err, doc) {
                if(err){
                    reject(err)
                }
                if(doc!=null&&doc.ID!=null&&doc.ID!=0){
                    if(doc[groupID]!=null){
                        resolve(doc[groupID])
                    }else{
                        resolve(null)
                    }
                }
            });
        }).catch((err)=>{
            reject(err)
        })
    })
}

function modifyGroup(groupID,userID,groupObject){
    return new Promise((resolve,reject)=>{
        getDB().then((db)=>{
            let toReplace = {}
            toReplace[groupID]=groupObject
            db.collection(user_collection).updateOne(
                {ID: userID}, 
                {
                    $set: toReplace
                }
            )
            resolve()
        }).catch((err)=>{
            reject(err)
        })
    })
}

function decryptGroupID(cryptedGroupID){
    let groupID = ''
    let eachLetterInASCII = cryptedGroupID.split('_')
    eachLetterInASCII.forEach((currentASCIICode)=>{
        groupID+=String.fromCharCode(currentASCIICode)
    })
    return groupID
}

module.exports= {

    isGroupExist(groupID,userID){
        return new Promise((resolve,reject)=>{
            getDB().then((db)=>{
                var cursor=db.collection(user_collection).find({ID: userID})
    
                cursor.each(function(err, doc) {
                    if(err){
                        reject(err)
                    }
                    if(doc!=null&&doc[(groupID)]!=null){ 
                        resolve(true)
                    }else{
                        resolve(false)
                    }
                });  
            }).catch((err)=>{
                reject(err)
            })
        })    
    },
    
    addGroup(groupID,userID){
        return new Promise((resolve,reject)=>{
            modifyGroup(groupID,userID,
                {
                    name:decryptGroupID(groupID),
                    list:[],
                    liveColor:defaultLiveColor,
                    sortByIndex:0,
                    isGroupHiden:false,
                    groupIndex:0
                }
                ).then(()=>{
                    resolve()
                }).catch((err)=>{
                    reject(err)
                })
            })
    },

    deleteGroup(groupID,userID){
        return new Promise((resolve,reject)=>{
            getDB().then((db)=>{
                let objectToDelete={}
                objectToDelete[groupID]=1
                db.collection(user_collection).updateOne(                
                    {ID: userID}, 
                    {
                        $unset: objectToDelete
                    }, 
                false, true)
                resolve()                    
            }).catch((err)=>{
                reject(err)
            })
        })    
    },

    isUserExist(userID){
        return new Promise((resolve,reject)=>{
            getUser(userID).then((user)=>{
                if(user){
                    resolve(true)
                }else{
                    resolve(false)
                }
            }).catch((err)=>{
                reject(err)
            })
        })
    },

    setGroupProperty(groupID,userID,propertyName,propertyValue){
        return new Promise((resolve,reject)=>{
            getGroup(groupID,userID).then((groupObject)=>{       
                groupObject[propertyName]=propertyValue
                modifyGroup(groupID,userID,groupObject).then(()=>{
                    resolve()
                })
            }).catch((err)=>{
                reject(err)
            })  
        })
    },

    getGroupProperty(groupID,userID,propertyName){
        return new Promise((resolve,reject)=>{
            getGroup(groupID,userID).then((groupObject)=>{
                resolve(groupObject[propertyName])
            }).catch((err)=>{
                reject(err)
            })
        })
    },

    addNewUser(userID){
        return new Promise((resolve,reject)=>{
            getDB().then((db)=>{
                let newUser = {}
                newUser['ID']=userID
                newUser['112_105_110_110_101_100_32_115_116_114_101_97_109_101_114_115']={
                    name:'pinned streamers',
                    list:[],
                    liveColor:defaultLiveColor,
                    sortByIndex:0,
                    isGroupHiden:false,
                    groupIndex:0
                }
                db.collection(user_collection).insertOne(newUser);
                resolve()
            }).catch((err)=>{
                reject(err)
            })
        })
    },

    /**
     * use to add streamer id in db corresponding to user
     * @param {*} groupID 
     * @param {*} userID 
     * @param {*} streamerID 
     */
    addStreamer(groupID,userID,streamerID){
        return new Promise((resolve,reject)=>{
            getGroup(groupID,userID).then((groupObject)=>{
                if(groupObject['list']!=null){
                    if(!groupObject['list'].includes(streamerID)){ // value already exist, we don't save it
                    groupObject['list'].push(streamerID)                
                    }else{
                        resolve()
                    }
                }else{
                    groupObject['list'] = new Array()
                    groupObject['list'].push(streamerID)
                }
                modifyGroup(groupID,userID,groupObject).then(()=>{
                    resolve()
                })
            }).catch((err)=>{
                reject(err)
            })  
        })
    },

    /**
     * use to delete streamer id in db corresponding to user
     * @param {*} groupID 
     * @param {*} userID 
     * @param {*} streamerID 
     */
    deleteStreamer(groupID,userID,streamerID){
        return new Promise((resolve,reject)=>{
            getGroup(groupID,userID).then((groupObject)=>{
                groupObject['list']= groupObject['list'].filter(e => e != streamerID);
                modifyGroup(groupID,userID,groupObject).then(()=>{
                    resolve()
                })
            }).catch((err)=>{
                reject(err)
            })  
        })
    },

    /**
     * use to get groups 
     * @param {*} userID 
     * @returns {Array} streamersID
     */
    getStreamers(userID){
        return new Promise((resolve,reject)=>{
            getUser(userID).then((userObject)=>{
                let streamers = new Array() // we will add each streamer from each group in this array in purpose to get their information. Doesn't contains duplicate
                for(var cryptedGroupID in userObject) { 
                    if(cryptedGroupID!=='ID'&&cryptedGroupID!=='_id'){
                        var groupList = userObject[cryptedGroupID]['list'];
                        groupList.forEach((streamer)=>{
                            let indexOfStreamInStreamers = streamers.indexOf(streamer)
                            if(indexOfStreamInStreamers==-1){ // streamer isn't in array
                                streamers.push(streamer)
                            }
                        })
                    }
                }
                resolve(streamers)
            }).catch((err)=>{
                reject(err)
            })
        })
    },

    getGroups(userID){
        return new Promise((resolve,reject)=>{
            getUser(userID).then((userObject)=>{
                let groups = new Array()
                for(var cryptedGroupID in userObject) {  // searching for live color
                    if(cryptedGroupID!=='ID'&&cryptedGroupID!=='_id'){
                        groups.push(userObject[cryptedGroupID])
                    }
                }
                resolve(groups)
            }).catch((err)=>{
                reject(err)
            })
        })
    }
}