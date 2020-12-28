var express = require('express');
const axios = require("axios");
const cheerio = require("cheerio");

var app = express();
var url = "https://m.cafe.daum.net/skfootball/_rec?boardType=M";

const getHtml = async () => {
    try {
      return await axios.get("https://m.cafe.daum.net/skfootball/_rec?boardType=M");
    } catch (error) {
      console.error(error);
    }
  };

app.get('/', function (req, res) {
  res.send('hi');
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
  .then(res => {console.log(res)}); // 저장된 결과를 출력
});

app.listen(3000,()=>{
    console.log('liten 3000');
});
