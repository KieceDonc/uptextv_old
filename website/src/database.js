const MongoClient = require('mongodb').MongoClient;
const url = "mongodb://localhost:27017"; 
const user_collection = "users"
const dbName = 'website_db';

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

module.exports= {

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

    createUser(ID,twitch_create_at){
        return new Promise((resolve,reject)=>{
            getDB().then((db)=>{
                let newUser = {}
                newUser['ID']=userID
                newUser['website_create_at']=website_create_at
                newUser['twitch_create_at']=twitch_create_at,
                db.collection(user_collection).insertOne(
                  {
                    'ID':ID,
                    'website_create_at':new Date(),
                    'twitch_create_at':twitch_create_at
                });
                resolve()
            }).catch((err)=>{
                reject(err)
            })
        })
    },

    // ( broadcasterType ) User’s broadcaster type: "partner", "affiliate", or "".
    // ( twitchType ) User’s type: "staff", "admin", "global_mod", or "".
    updateUser(displayName,login,email,twitch_type,broadcaster_type,view_count){
      return new Promise((resolve,reject)=>{
        getDB().then((db)=>{
            db.collection(user_collection).updateOne(
                {ID: userID}, 
                {
                    $set: {
                      'displayname':displayName,
                      'login':login,
                      'email':email,
                      'twitch_type':twitch_type,
                      'broadcaster_type':broadcaster_type,
                      'view_count':view_count
                    }
                }
            )
            resolve()
        }).catch((err)=>{
            reject(err)
        })
      })
    }

}