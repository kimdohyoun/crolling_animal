const axios = require("axios");
const cheerio = require("cheerio");
const fs = require('fs');
const { request } = require("http");
const https = require("https");
const sharp = require("sharp"); //이미지 처리 


const dbconfig = require('../server/db.js')(); // 위에서 생성한 MySQL에 연결을 위한 코드(모듈)
const connection = dbconfig.init();

var resultList = [];
var cnt = 0;
var imgNum = 0




/*이미지 로컬 저장 부분 =>

//const xlsx =require("xlsx");
//const puppeteer = require;
//const add_to_sheet = require("./add_to_sheet");

fs.readdir('screenshot', (err) => {
  if(err){
    console.error("screenshot 폴더가 없어 screenshot 폴더를 생성합니다 ")
    fs.mkdirSync("screenshot");
  }
});

fs.readdir('poster', (err) => {
  if(err){
    console.error("poster 폴더가 없어 poster 폴더를 생성합니다 ")
    fs.mkdirSync("poster");
  }
});



*/ //<=이미지 크롤링 끝 //https://loy124.tistory.com/287 여기꺼가 생각을 많이하고 짠거같음 


/* node 스캐줄러  위치 =>

npm install node-schedule --save (저장 위치 경로에 대한 좀더 이해가 필요함 )

const schedule= require('node-schedule');

cron-style scheduling 
(******) / S/M/H/D/M/W (0,7 => sun)

var job = schedule.scheduleJob('3 40 18 12 9 *', function(){
   let mNow =new DAte();
   console.log(mNow);
});  // 매년 9월 12일 오후 6시 40분 3초에 시간을 로깅하게 

var job = schedule.scheduleJob('30 * * * * *', function(){
   let mNow =new DAte();
   console.log(mNow);
});  // 매 30초마다 실시, 30초 간격이 아니라 30초 지만 30초면 30초만큼이나 30초나 같지않나? 


다른 방법으로는 

function getTest(req, res){
   let rule=new schedule.RecurrenceRule();
   rule.minute = 45 //second, minute , hour, date, month , year , dayOfWeek
   let job =schedule.scheduleJob(rule, function (){
       console.log("45분이 되엇습니다. 이제 실행합니다.")
   })
}

스케쥴 취소 
job.cancel(); 

*/


/* 노드 로깅 
npm install winston --save 

const winston = requir('winston');


//로깅 레벨 
//error: 0 , warn : 1  , info: 2, verbose: 3, debug: 4 , silly: 5 

//로거 생성 
let logger = new (winston.Logger)({
    transports: new (winston.trasports.Console)({ //Console 창에서 로깅 하기위해 
        level : 'info',  //info이하의 것을 모두 로깅함 
        colorize : true
    })
});
// transports 는 배열이고 Consol, file ,db 등 여러가지를 넣을수 있음 

//file로 로깅 저장 
const fs = require('fs');
const path = require('path');
const logDir = 'log'

if(!fs.existsSync(logDir)) fs.mkdirSync(logDir);
const logFilename= path.join(__dirname, '/../', logDir, '/created-logfile.log);


let trasports = [];
transports.push(new (winston.trasports.Console)({
    level: 'info',
    colorize: true
}));

transports.push(new (winston.transports.File)({
    name: 'error-file',
    level: 'info',
    json: false,
    filename: logFilename,
    colorize : true,
    maxsize: 102400, // 100kb 
    maxFiles : 1000, 
      }))  //디렉토리와 파일명을 정확하게 지정해 주어야 함 

//transports 값을 넘겨 주기 
    let logger = new (winston.Logger)({ transports: transports})

    //일자별로 로그 파일 만들기 
    npm install winston-daily-file --save 

//  require (fs , winston , winston-daily-rotate-file, path, log )선언 

if(!fs.existsSync(logDir)) fs.mkdirSync(logDir);
const logFilename= path.join(__dirname, '/../', logDir, '/created-logfile.log);

    let transport = new (winston.transports.DailyRotateFile)({
        filename:logFilename,
        dataepattern: 'yyy-MM-dd',
        prepend: true
    })

*/
//이미지를 가져와서 origin폴더에 넣고, 리사이징한후 resizing폴더에 넣는다 (이미지 이름 규칙 설정)
//크롤링 해서 데이터를 가지고 있음, => 이데이터와 파일다운로더의 이름이 같을때 다운을 실행 

// fs.readdir('screenshot', (err) => { // 디렉토리를 읽고 없으면 생성해주는 코드 
//     if(err){
//       console.error("screenshot 폴더가 없어 screenshot 폴더를 생성합니다 ")
//       fs.mkdirSync("screenshot");
//     }
//   });

function imgResize(num){ // 이미지 원본을 저장할때 변경된 이미지도 저장 


//비율을 유지하며 리사이즈 한다. width가 변경되는 비율만큼 height도 변경된다.
// https://wedul.site/523 여기에서는 이미지를 따로 저장하지 않고 바로 크기를 변경함 

    sharp("../img/goodog0.jpg")
    .resize({fit:'fill', width:32, height:32})
    .toFile("../img_resize/resizeDog"+imgNum+".png");


}

function inserMysql(img) {// DB에 저장 부분 현제는 img 저장을 하고 있지만 나중에는 리사이징한 이미지를 S3에 올리고 그것을 가져올 생각중이였지만 내가 돈이어딨어?

    connection.query('INSERT INTO `dog` VALUES("0","' + img + '");', (error, rows) => {  //쿼리문 
        if (error) throw error;
        else {
            console.log("insert completion");
        }
    });
}

function delay(ms) {
    return new Promise(function (resolve, reject) {
        setTimeout(function () {
            resolve();
        }, ms);
    });
}

function getHTML(url) {
    return new Promise(resolve => {
        delay(300).then(function () {
            axios.get(url).then(function (data) {
                resolve(data);
            });
        });
    })
}

function imgLocalfs(url) { //원본 이미지 로컬 저장 

const file = fs.createWriteStream("../img/goodog"+imgNum+".jpg");
const request2 = https.get(url, function(response) {
  response.pipe(file);   //입력을 출력으로 리다이렉트 할수있게 해줌 
});
imgResize(imgNum) // 32 사이즈로 변경 

imgNum = imgNum+1
}

function main() {//아직 페이지갯수만큼 당겨오지 않음 

    var result = [];

    var firstDate = "2021-04-23"
    var lastDate = "2021-04-23"

    var url = "https://www.animal.go.kr/front/awtis/protection/protectionList.do?totalCount=4466&pageSize=10&boardId=&desertionNo=&menuNo=1000000060&"
        + "searchSDate=" + firstDate + "&searchEDate=" + lastDate + "&searchUprCd=&searchOrgCd=&searchCareRegNo=&searchUpKindCd=417000&searchKindCd=&&page=4#moreBtn"
    // for(var j=0;j<result.length;j++){
    //1페이지에 10개 총갯수 가 52건이면 6페이지 

    getHTML(url).then(html => {
        // let result = {};
        const $ = cheerio.load(html.data);

        var text = $("body").find(".txt").text();
        var bigSrc = []
        $(".list").find('img').each(function () {
            var src = $(this).attr('src');
            bigSrc.push(src)
        });

        // console.log("bigSrc " + bigSrc);

        var list = text.split('\n');
        var id = 0
        var listjson = []
        var listLength = list.length


        for (i = 0; i < listLength - 7; i++) {
            var Area = list[i + 1].trim().substr(4, 6) + "_" + list[i + 5].trim().substr(4)
            var data1 = list[i + 3].trim().substr(2)
            var a = {}

            a.id = id
            a.name = Area
            a.img = "https://www.animal.go.kr" + bigSrc[id]
            a.age = list[i + 4].trim().substr(2, 5)
            a.things = [data1, list[i + 6].trim().substr(2)]
            a.days = 25
            a.passe = false

            i = i + 7;
            id = id + 1


            var img = a.img
            // console.log("a img " + a.img + "  img  " + img)



            var inserMy = inserMysql(img);  //mysql 저장
            var local = imgLocalfs(img);  //  원본이미지, 리사이징이미지  로컬 저장
            listjson.push(a)

        }

        return listjson;

    })
        // 추가 작성
        .then(res => {
            fs.writeFile('result_json.json', JSON.stringify(res), 'utf8', function (error) {  //json 파일로 저장 
                console.log('write end');
            });
        });
}



// let timerId = setInterval(() => alert('tick'), 2000);  //부여된 시간 간격으로 주기적으로 실행 
// setTimeout(() => { clearInterval(timerId); alert('stop'); }, 5000); // 5초후 정지 
main();
// inserMysql();


