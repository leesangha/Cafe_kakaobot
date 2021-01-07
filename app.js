var express = require('express');
const axios = require("axios");
const cheerio = require("cheerio");
const { query } = require('express');

var app = express();
var url = "https://m.cafe.daum.net/skfootball/_rec?boardType=M";

var keywords = new Map();

const getHtml = async () => {
    try {
      return await axios.get("https://m.cafe.daum.net/skfootball/_rec?boardType=M");
    } catch (error) {
      console.error(error);
    }
  };
const getMyinfo= async ()=>{
  try{
    return await axios.get("https://kapi.kakao.com/v2/user/me?target_id_type=user_id");
  }
  catch(error){
    console.log(error);
  }
}


app.get('/', function (req, res) {
  
  res.sendFile(__dirname + '/index.html');
  getHtml()
  .then(html => {
    let titleList = [];
    const $ = cheerio.load(html.data);
    const bodyList = $("ul.list_cafe").children('li').children('a');

    bodyList.each(function(i, elem) {
      titleList[i] = {
        content: $(this).find('span.txt_detail').text(),
      };
    });
    return titleList;
  })
  .then(res => {
      res.forEach(title=>{
        let keyword = '용산';

        if(title.content.indexOf(keyword) !==-1){
          console.log(title.content);
        }

      })
    }); // 저장된 결과를 출력
});

app.get('/login',function(req,res){
  console.log(req.query.code);
  res.sendFile(__dirname+ '/login.html');
  
})

app.listen(3000,()=>{
    console.log('liten 3000');
});