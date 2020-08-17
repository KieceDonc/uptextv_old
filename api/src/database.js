const MongoClient = require('mongodb').MongoClient;
const url = "mongodb://localhost:27017"; 
const user_collection = "users"
const dbName = 'pe_db';
const defaultLiveColor = '#007aa3'

/**
 * tutorial https://www.w3schools.com/nodejs/nodejs_mongodb_createcollection.asp
 * https://www.guru99.com/node-js-mongodb.html
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

function modifyGroup(groupID,userID,groupList){
    return new Promise((resolve,reject)=>{
        getDB().then((db)=>{
            let toReplace = {}
            toReplace[groupID]=groupList
            db.collection(user_collection).updateOne(
                {ID: userID}, 
                {
                    $set: toReplace
                }
            )
            addDefaultLiveColorIfNeeded(groupID,userID).then(()=>{
                resolve()
            }).catch((err)=>{
                reject(err)
            })
        }).catch((err)=>{
            reject(err)
        })
    })
}

function addDefaultLiveColorIfNeeded(groupID,userID){
    return new Promise((resolve,reject)=>{
        getDB().then((db)=>{
            var cursor=db.collection(user_collection).find({ID: userID})

            cursor.each(function(err, doc) {
                if(err){
                    reject(err)
                }
                if(doc!=null&&doc[(groupID+'_liveColor')]!=null){ // checking if a live color is already present
                    resolve(true)
                    modifyLiveColor(groupID,userID,defaultLiveColor)
                }else{
                    resolve(false)
                }
            });  
        }).catch((err)=>{
            reject(err)
        })
    })
}

module.exports= {

    isGroupExist(groupID,userID){
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

    modifyLiveColor(groupID,userID,LiveColor){
        return new Promise((resolve,reject)=>{
            getDB().then((db)=>{
                let toReplace = {}
                toReplace[(groupID+'_liveColor')]=LiveColor
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
    },

    addNewUser(userID){
        return new Promise((resolve,reject)=>{
            getDB().then((db)=>{
                let newUser = {}
                newUser['ID']=userID
                newUser['112_105_110_110_101_100_32_115_116_114_101_97_109_101_114_115']=[]
                newUser['112_105_110_110_101_100_32_115_116_114_101_97_109_101_114_115_liveColor']=defaultLiveColor
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
            getUser(userID).then((user)=>{
                var groupList = user[groupID]
                if(groupList){
                    if(!groupList.includes(streamerID)){ // value already exist, we don't save it
                        groupList.push(streamerID)                
                    }else{
                        resolve()
                    }
                }else{
                    groupList = new Array()
                    groupList.push(streamerID)
                }
                modifyGroup(groupID,userID,groupList).then(()=>{
                    resolve()
                }).catch((err)=>{
                    reject(err)
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
            getUser(userID).then((user)=>{
                var groupList = user[groupID]
                groupList = groupList.filter(e => e !== streamerID);
                modifyPinnedStreamers(groupID,userID,groupList).then(()=>{
                    resolve()
                }).catch((err)=>{
                    reject(err)
                })
            }).catch((err)=>{
                reject(err)
            })
        })
    },

    /**
     * use to get groups 
     * @param {*} userID 
     */
    getStreamers(userID){
        return new Promise((resolve,reject)=>{
            getUser(userID).then((user)=>{
                resolve(user)
            }).catch((err)=>{
                reject(err)
            })
        })
    }
}