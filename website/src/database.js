
const { MongoClient } = require("mongodb");
const mongodb_username = 'main-access'
const mongodb_password = 'zwDde5oFzJGz7Lir'
const mongodb_db_name = 'website_db'
const mongodb_users_collection = "users"
const mongodb_uri = "mongodb+srv://"+mongodb_username+":"+mongodb_password+"@main.i8bys.mongodb.net/api?retryWrites=true&w=majority";
const mongodb_client = new MongoClient(mongodb_uri, { useNewUrlParser: true });

var db = null

function getDB(){
    return new Promise((resolve,reject)=>{
        if(!db){
            mongodb_client.connect(err => {
                db = mongodb_client.db(mongodb_db_name);
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
            var cursor=db.collection(mongodb_users_collection).find({ID: userID})
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
                db.collection(user_collection).insertOne(
                  {
                    'ID':ID,
                    'website_create_at':new Date()
                  });
                resolve()
            }).catch((err)=>{
                reject(err)
            })
        })
    },

    // ( broadcasterType ) User’s broadcaster type: "partner", "affiliate", or "".
    // ( twitchType ) User’s type: "staff", "admin", "global_mod", or "".
    updateUser(userID,displayName,email,twitch_type,broadcaster_type,view_count,profile_picutre){
      return new Promise((resolve,reject)=>{
        getDB().then((db)=>{
            db.collection(mongodb_users_collection).updateOne(
                {ID: userID}, 
                {
                    $set: {
                      'displayname':displayName,
                      'email':email,
                      'twitch_type':twitch_type,
                      'broadcaster_type':broadcaster_type,
                      'view_count':view_count,
                      'profile_picture':profile_picutre
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