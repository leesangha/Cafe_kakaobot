const {parentPort} = require('worker_threads');
const axios = require("axios");
const cheerio = require("cheerio");
var url = "https://m.cafe.daum.net/skfootball/_rec?boardType=M";

const getHtml = async () => {
    try {
      return await axios.get(url);
    } catch (error) {
      console.error(error);
    }
  };

var keywords = [];
var access_token;
parentPort.on('message',message =>{
    keywords=message.keywords;
    access_token=message.access_token;
    console.log(message);
});

setInterval(()=>{
    console.log(keywords);
    //parsing
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
        var result=[];
        res.forEach(title=>{
            
            keywords.forEach(keyword => {
                if(title.content.indexOf(keyword) !==-1){
                    result.push(title.content);
                }
            })

        })
        return result;
     }).then(async (result) => {
         console.log(`result  :  `+result);
        if(result.length ===0){
            return 0;
        }
        else{
            var headers = {
                'Authorization': `Bearer ${access_token}`
              };
              var dataString = `template_object={
                "object_type": "text",
                "text": "텍스트 영역입니다. 최대 200자 표시 가능합니다.",
                "link": {
                    "web_url": "https://developers.kakao.com",
                    "mobile_web_url": "https://developers.kakao.com"
                },
                "button_title": "바로 확인"
              }`
              var options = {
                url: 'https://kapi.kakao.com/v2/api/talk/memo/default/send',
                method: 'POST',
                headers: headers,
                data: `template_object={
                  "object_type": "text",
                  "text": "${result} :  ${url}",
                  "link": {
                      "web_url": "https://naver.com",
                      "mobile_web_url": "https://naver.com"
                  },
                  "button_title": "바로 확인"
                }`
              };
            
              await axios(options)
        }
     }); // 저장된 결과를 출력

},300000)