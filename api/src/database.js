const MongoClient = require('mongodb').MongoClient;
const url = "mongodb://localhost:27017"; 
const user_collection = "users"
const dbName = 'pe_db';


/**
 * tutorial https://www.w3schools.com/nodejs/nodejs_mongodb_createcollection.asp
 * https://www.guru99.com/node-js-mongodb.html
 */

 
MongoClient.connect(url, function(err, client) {
    if (err) throw err;
    client.close();
});


function getUser(userID){
    return new Promise((resolve,reject)=>{
        MongoClient.connect(url, function(err, client) {

            var db = client.db(dbName);
            var cursor=db.collection(user_collection).find({ID: userID})

            cursor.each(function(err, doc) {
                if(err){
                    reject(err)
                }
                if(doc!=null&&doc.ID!=null){
                    resolve(doc)
                }else{
                    resolve(null)
                }
            });
        
            client.close()
        }); 
    })
}

function modifyGroup(groupID,userID,groupList){
    return new Promise((resolve,reject)=>{
        MongoClient.connect(url, function(err, client) {
            if(err){
                reject(err)
            }
            var db = client.db(dbName);
            let toReplace = {}
            toReplace[groupID]=groupList
            db.collection(user_collection).updateOne(
                {ID: userID}, 
                {
                    $set: toReplace
                }
            )
            resolve()
            client.close()
        }); 
    })
}


module.exports= {

    isUserExist(userID){
        return new Promise((resolve,reject)=>{
            MongoClient.connect(url, function(err, client) {

                if(err){
                    reject(err)
                }
                getUser(userID).then((user)=>{
                    if(user){
                        resolve(true)
                    }else{
                        resolve(false)
                    }
                }).catch((err)=>{
                    reject(err)
                })
                client.close()
            }); 
        })
    },

    addNewUser(userID){
        return new Promise((resolve,reject)=>{
            MongoClient.connect(url, function(err, client) {

                var db = client.db(dbName);
                db.collection(user_collection).insertOne({
                    ID: userID
                });
                if(err){
                    reject(err)
                }else{
                    resolve()
                }
                client.close()
            }); 
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
     * use to get streamers ids in db corresponding to 
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