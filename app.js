var express = require('express');
var bodyParser = require('body-parser');
const axios = require("axios");
const {Worker} = require('worker_threads');

var app = express();

var keywords = ['은평','서대문'];
var access_token;
var refresh_token;

//thread message
var message = {
  keywords:keywords,
  access_token:access_token,
}
//body parser 
app.use(bodyParser.json());
//worker setting
const worker = new Worker('./worker.js');
worker.postMessage(message);


//카카오 인증 
const kakaoHeader = {
  'Authorization': '{ADMIN KEY}',
  'Content-type': 'application/x-www-form-urlencoded;charset=utf-8',
}
var code;

const getKakaoToken = async (code)=>{
  try{
    const data = {
      grant_type: 'authorization_code',
      client_id: '{REST API KEY}',
      redirect_uri: 'http://localhost:3000/login',
      code: code,
    };
    const queryString = Object.keys(data).map(k=>encodeURIComponent(k) + '=' + encodeURIComponent(data[k])).join('&');
    const result = await axios.post('https://kauth.kakao.com/oauth/token',queryString,{headers:kakaoHeader});
    return result;
  }
  catch(e){
    return e;
  }
}
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

app.get('/login',async function(req,res){
  code = req.query.code;
  var ls = await getKakaoToken(code);
  access_token=ls.data.access_token;
  refresh_token=ls.data.refresh_token;
  res.sendFile(__dirname+ '/login.html');
})
app.get('/token',async function(req,res){
  message.access_token=access_token;
  worker.postMessage(message);
  res.sendFile(__dirname + '/token.html');
})
app.post('/insert',function(req,res){
  var word = req.body.data;

  if(message.keywords.includes(word))
    console.log('check');
  else{
    message.keywords.push(word);
  }
  worker.postMessage(message);
  res.send('200');
})
app.get('/del',function(req,res){
  var word = req.body.data;

  if(message.keywords.includes(word)){
    var index = message.keywords.indexOf(word);
    message.keywords.splice(index,1);
    console.log('check');
  }
  worker.postMessage(message);
  res.send('200');
})
app.listen(3000,()=>{
    console.log('liten 3000');
});