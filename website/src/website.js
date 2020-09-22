/*const express = require('express'); 
const fs = require('fs')
const https = require('https')
const database = require('./database')
const twitch = require('./twitch')

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
 
app.get('/redirectAuth/',function(req,res){ // check if group exist in db 
    let access_token = req.query.access_token
    console.log(req.originalUrl)
    twitch.getUserInfo(access_token).then((userInfo)=>{
        //console.log(userInfo)
    }).catch((err)=>{
        console.log(err)
    })
});*/

// plz see https://stackoverflow.com/questions/17744003/get-url-after-in-express-js-middleware-request 