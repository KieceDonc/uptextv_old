const MongoClient = require('mongodb').MongoClient;
const url = "mongodb://localhost/pe_db"; // pe = pin extension
const user_collection = "users"

/**
 * tutorial https://www.w3schools.com/nodejs/nodejs_mongodb_createcollection.asp
 * https://www.guru99.com/node-js-mongodb.html
 */

 
MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    db.close();
});


function getUser(userID){
    return new Promise((resolve,reject)=>{
        MongoClient.connect(url, function(err, db) {
            var cursor=db.collection(user_collection).find({ID: userID})

            if(err){
                reject(err)
            }else{
                resolve(cursor)
            }
            db.close()
        }); 
    })
}

function modifyPinnedStreamers(userID,_pinnedStreamers){
    return new Promise((resolve,reject)=>{
        MongoClient.connect(url, function(err, db) {

            db.collection(user_collection).updateOne(
                {ID: userID}, 
                {
                    $set: {pinnedStreamers: _pinnedStreamers}
                }
            );
            if(err){
                reject(err)
            }else{
                resolve()
            }
            db.close()
        }); 
    })
}


module.exports= {

    isUserExist(userID){
        return new Promise((resolve,reject)=>{
            MongoClient.connect(url, function(err, db) {
                if(err){
                    reject(err)
                }
                if(db.collection(user_collection).find({ ID: userID }).limit(1).length==1){
                    resolve(true)
                }else{
                    resolve(false)
                }
                db.close()
            }); 
        })
    },

    addNewUser(userID){
        return new Promise((resolve,reject)=>{
            MongoClient.connect(url, function(err, db) {
                db.collection(user_collection).insertOne({
                    ID: userID,
                    pinnedStreamers: []
                });
                if(err){
                    reject(err)
                }else{
                    resolve()
                }
                db.close()
            }); 
        })
    },

    addStreamer(userID,streamerID){
        return new Promise((resolve,reject)=>{
            getUser(userID).then((user)=>{
                var pinnedStreamers = user.pinnedStreamers
                pinnedStreamers.push(streamerID)
                modifyPinnedStreamers(userID,pinnedStreamers).then(()=>{
                    resolve()
                }).catch((err)=>{
                    reject(err)
                })
            }).catch((err)=>{
                reject(err)
            })
        })
    },

    deleteStreamer(userID,streamerID){
        return new Promise((resolve,reject)=>{
            var pinnedStreamers = user.pinnedStreamers
            pinnedStreamers = pinnedStreamers.filter(e => e !== streamerID);
            modifyPinnedStreamers(userID,pinnedStreamers).then(()=>{
                resolve()
            }).catch((err)=>{
                reject(err)
            })
        })
    },

    getStreamers(userID){
        return new Promise((resolve,reject)=>{
            getUser(userID).then((user)=>{
                resolve(user.pinnedStreamers)
            }).catch((err)=>{
                reject(err)
            })
        })
    }
}