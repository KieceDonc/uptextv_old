const express = require('express'); 
const fs = require('fs')
const https = require('https')
const twitch = require('./twitch')
const database = require('./database');
const domain="uptextv.com"
const port = 1000; 

const privateKey = fs.readFileSync('/etc/letsencrypt/live/'+domain+'/privkey.pem', 'utf8'); // https://itnext.io/node-express-letsencrypt-generate-a-free-ssl-certificate-and-run-an-https-server-in-5-minutes-a730fbe528ca
const certificate = fs.readFileSync('/etc/letsencrypt/live/'+domain+'/cert.pem', 'utf8');
const ca = fs.readFileSync('/etc/letsencrypt/live/'+domain+'/chain.pem', 'utf8');

const credentials = {
	key: privateKey,
	cert: certificate,
	ca: ca
};

var app = express();  
app.use((req, res, next) => {
    res.append('Access-Control-Allow-Origin' , 'uptextv.com');
    res.append('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    next();
});

var server = https.createServer(credentials, app)
    .listen(port, function () {
})  

var io = require('socket.io').listen(server);

io.on('connection', (socket) => {
    socket.on('onLogin',(twitch_code)=>{
        twitch.getAcccessTokenAndID(twitch_code).then((JSON0)=>{
            console.log(JSON0)
            let bearer_token = JSON0.access_token
            twitch.getUserBasicInfo(bearer_token).then((JSON1)=>{
                console.log(JSON1)
                let userID = JSON1.sub
                twitch.getUserAllInfo(bearer_token,userID).then((JSON2)=>{
                    let userData = JSON2.data[0] 
                    let userEmail = userData['email']
                    let userID = userData['id']
                    let userName = userData['login']
                    let userType = userData['type']
                    let userBroadcasterType = userData['broadcaster_type']
                    let userViewCount = userData['view_count']
                    let userProfilePicture = userData['profile_image_picture']

                    updateUser = ()=>{
                        database.updateUser(userID,userName,userEmail,userType,userBroadcasterType,userViewCount,userProfilePicture).catch((err)=>{
                            console.log(err)
                        })
                    }

                    database.isUserExist(userID).then((isUserExist)=>{
                        if(isUserExist){
                            console.log('called')
                            database.createUser(userID).then(()=>{
                                updateUser()
                            })
                        }else{
                            updateUser()
                        }

                    })
                    //https://openclassrooms.com/fr/courses/5614116-go-full-stack-with-node-js-express-and-mongodb/5656296-create-authentication-tokens
                    socket.emit('callback_onLogin','')
                })
            })
        }).catch((err)=>{
            // normally not happening
            socket.emit('callback_onLogin','err',err)
        })
    })
});
