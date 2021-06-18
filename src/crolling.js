const axios = require("axios");
const cheerio = require("cheerio");
const fs = require('fs');
const { request } = require("http");
const https = require("https");
const sharp = require("sharp"); //이미지 처리 
const mime = require("mime"); //이미지 타입 

// var im = require('imagemagick'); //이거 안댐 
var gm = require('gm') // 이미지 처리

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


function checkMime(imgPath) {// 이미지의 타입을 체크하는 펑션 
    var imgMime = mime.getType(imgPath); // lookup -> getType으로 변경됨
    console.log('mime=' + imgMime);
}

function imgResize(num) { // 이미지 원본을 저장할때 변경된 이미지도 저장 

    //비율을 유지하며 리사이즈 한다. width가 변경되는 비율만큼 height도 변경된다.
    // https://wedul.site/523 여기에서는 이미지를 따로 저장하지 않고 바로 크기를 변경함 
    // https://darrengwon.tistory.com/565 여기도 설명이 좋은것 같다 궁금햇던것과 필요했던것 
    //https://www.npmjs.com/package/sharp  npm 

    //fs 리드 파일로 파일을  읽고 그 결과를 콜백으로 반환하는데 redafile 이 자동으로 버퍼로 변환함 

    // var fsResize = fs.readFile('../img/goodog'+a+'.jpg','utf8', function(err, data) {

    // console.log(" data" + data );
    // var bf =  new Buffer.from('../img/goodog'+a+'.jpg');
    // sharp(bf)
    // .resize(32, 32)
    // //   .toFile("../img_resize/resizeDog"+imgNum+".png");
    // .toFile('"../img_resize/resizeDog'+a+'.png"', (err, info) => { 

    //     console.log(" 성공 " + info );
    //  });
    // });
    /* 단순히 버퍼 형태로 저장이 필요한 거면  axios를 사용해서 사용할수 있다. 하지만 await  구문이라서 소스 코드의 변경이 필요할수 있다. 
    if (result.img) {
    //imgResult에 이미지들의 버퍼형태 저장
    const imgResult = await axios.get(result.img, {	//이미지 주소 result.img를 요청
        responseType: 'arraybuffer',	//buffer가 연속적으로 들어있는 자료 구조를 받아온다
    });
    //fs로 읽어준다
    //console에서 이미지 확장자 확인 후 같은 것으로 적용
    fs.writeFileSync(`poster/${r.제목}.jpg`, imgResult.data);
    }
    */
    return new Promise(resolve => {
        var a = num
        console.log("a == " + a)
        resolve(a)
        // fs.readFile('../img/goodog'+a+'.jpg','utf8', function(err, data) {
        //     resolve(data)
        // })
    }).then(function (a) {
        // im.resize({
        //     srcPath: '../img/goodog'+a+'.jpg',
        //     dstPath: '../img_resize/resizeDog'+a+'.jpg',
        //     width: 256
        //  }, function(err, stdout, stderr) {
        //     if(err) throw err
        //     console.log('resized image to fit within 256 x 256px');
        //  });
        gm('../img/goodog' + a + '.jpg')
            .options({ imageMagick: true })
            .resize(32, 32)
            .write('../img_resize/resizeDog' + a + '.jpg', function (err) {
                if (!err) {
                    console.log("this will be the resized image : resize.jpg");
                }
            })
        // var bf =  new Buffer.from('../img/goodog'+a+'.jpg');
        // // resolve()의 결과 값이 여기로 전달됨
        // console.log("url  "+bf); // $.get()의 reponse 값이 tableData에 전달됨
        //  sharp(bf)   //버퍼형태가 들어와야한다.  
        // .resize({fit:'fill', width:32, height:32})
        // .toFile("../img_resize/resizeDog"+a+".jpg")
    });
}
// 이미지를 다운받아서 url을 생성해 주고 그 url을 가져다 쓴후 폴더를 삭제하는 것이 있다고 함 . 

function inserMysql(img) {// 나중에는 리사이징한 이미지를 S3에 올리고 그것을 빅데이터 ㄱㄱ 

    var sql = 'INSERT INTO `dog` VALUES(?,?);'
    var params = ["0", img]
    connection.query(sql, params, function (error, rows) {
        if (error) throw error;
        else {
            console.log("insert completion" + rows);
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

    const file = fs.createWriteStream("../img/goodog" + imgNum + ".jpg");
    const request2 = https.get(url, function (response) {
        response.pipe(file);   //입력을 출력으로 리다이렉트 할수있게 해줌 
    });

    // 다른 방법 https://gracefullight.dev/2017/01/16/javascript%EB%A1%9C-%EB%A1%9C%EC%BB%AC%EC%97%90-%EC%9D%B4%EB%AF%B8%EC%A7%80-%EB%8B%A4%EC%9A%B4%EB%A1%9C%EB%93%9C/
    /*이미지를 base64로 인고딩을 한 후 FileReader나 Canvas를 이용해서 변환할수 있다. 
    그 후 이미지 데이터를 blob object로 변환한다. 
    blob = new Blob([view], {type: 'imge/png'})
    */
}

function pageCheck(){  // 페이지 내에 토탈 카운터와 페이지에 맞춰서 크롤링 url 을 넘겨 줘야함  
/*totalCount=11081&  //토탈 카운터 값 이값을 기준으로 10씩 나눠서 페이지를 체크 
pageSize=10&
boardId=&
desertionNo=&
menuNo=1000000055&
searchSDate=2021-05-01&   // 날짜값이 없을시 오늘날짜 ~ 30일 전까지 날짜를 출력 
searchEDate=2021-05-31&
searchUprCd=&
searchOrgCd=&
searchCareRegNo=&
searchUpKindCd=&
searchKindCd=&
searchState=protect& // 보호중인것만 
&page=11   //페이지 ㄱ분 
*/
}

// 메인에서 분리 해 와야함 
function main() {//아직 페이지갯수만큼 당겨오지 않음 
    var result = [];
    var firstDate = "2021-04-23"
    var lastDate = "2021-04-23"
    var searchUprCd = "" //  searchUprCd=6260000& 지역번호 
    // var url = "https://www.animal.go.kr/front/awtis/protection/protectionList.do?totalCount=4466&pageSize=10&boardId=&desertionNo=&menuNo=1000000060&"
    //     + "searchSDate=" + firstDate + "&searchEDate=" + lastDate + "&searchUprCd=&searchOrgCd=&searchCareRegNo=&searchUpKindCd=417000&searchKindCd=&searchState=protect&page=4#moreBtn"

    var url ="https://www.animal.go.kr/front/awtis/protection/protectionList.do"
    var serchUrl = ""
    // for(var j=0;j<result.length;j++){
    //1페이지에 10개 총갯수 가 52건이면 6페이지 
    
    /*
    페이지에 접속하면 조회 버튼의 이벤트를 강제로 실행해서 url 주소를 받아온다 .
    $("#my-btn").trigger("click")
    document.getElementById("my-btn")[0].click();   search_button
    출처 :  https://6developer.com/6

    현제 웹 페이지 URL 주소 가져오는것 
    window.location.href 
    */


    getHTML(url).then(html => { // 프로미스 시작 
        // let result = {};
        var urldata = html.data
        console.log("urldata " + urldata)

        fs.writeFile('html.html', JSON.stringify(urldata), 'utf8', function (error) {  //json 파일로 저장 
            console.log('write urldata');
        });   // HTML중 데이터 항목을 저장 


        console.log("get url "+window.location.href )
        const $ = cheerio.load(html.data);

        var text = $("body").find(".txt").text();
        var list = text.split('\n');
        var id = 0
        var listjson = []
        var listLength = list.length

        var bigSrc = []
        $(".list").find('img').each(function () {  // url에서 src값 img 
            var src = $(this).attr('src');
            bigSrc.push(src)
        });

        for (i = 0; i < listLength - 7; i++) { //for 문으로 작성시 나중에 변경할때 실수할 확률이 높아서 데이터의 누락이 일어날수 있다. 
            // var Area = list[i + 1].trim().substr(4, 6) + "_" + list[i + 5].trim().substr(4)
            // var data1 = list[i + 3].trim().substr(2)
            var a = {}

            a.id = id
            a.img = "https://www.animal.go.kr" + bigSrc[id]
            // a.age = list[i + 4].trim().substr(2, 5)
            // a.things = [data1, list[i + 6].trim().substr(2)]
            // a.days = 25
            a.passe = false
            i = i + 7;
            id = id + 1
            // var imgMime =checkMime(img)     //파일의 mime type 확인 
            listjson.push(a)
        }
        /*이미지들을 크롤링해서 분류 작업을 어느 시점에서 할지 정해야 한다 
        웹페이지에서는 url에 분류하는 방식이라 어느시점에서 해도 큰차이가 없다
        프로그램의 순서를 
        1 크롤링 => db 저장 =>웹페이지 , (품종별)
        2 크롤링 => 머신러닝 =>웹페이지  (색깔별) 
        
        사람을 따르는가 안따르는가, 품종, 거리
        */
        return listjson;

    }).then(res => { //크롤링으로 데이터를 제이손 파일로 저장 
        fs.writeFile('result_json.json', JSON.stringify(res), 'utf8', function (error) {  //json 파일로 저장 
            console.log('write end');
        }); return res;
    }).then(res => {//  원본이미지 로컬 저장 (추후 s3저장 )
        res.forEach(function (data, idx) {
            imgLocalfs(data.img)
        })
        return res;
    }).then(res => {  //mysql 저장  s3에 저장할거면 s3주소를 가져와야 하기 때문에 위치를 s3에서 가져온 위치 다음으로 옮겨야함 
        res.forEach(function (data, idx) {
            inserMysql(data.img)
            imgNum = imgNum + 1
            // console.log("res "+ JSON.stringify(data.img)  )
        })
        return res;
    }).then(res => {  //32 사이즈로 변경  나중에.. (추후 s3저장 )
        res.forEach(function (data, idx) {
            imgResize(data.img)
        })
        return res;
    })
    // 추가 작성  //json파일에 들어가야 하는 부분이 어떤걸지, 뷰에서 보여줄 부분은 어떤것일지 .  
}

// let timerId = setInterval(() => alert('tick'), 2000);  //부여된 시간 간격으로 주기적으로 실행 
// setTimeout(() => { clearInterval(timerId); alert('stop'); }, 5000); // 5초후 정지 

// function geturl (){  기본주소로 접속 후 조ㅚ 버튼을 눌러서 url 데이터를 가져오려고 했으나 실패 

//     var gurl  ="https://www.animal.go.kr/front/awtis/protection/protectionList.do"
//     document.getElementById("search_button")[0].click();   
//     var getURL = window.location.href 

//     console.log("getURL "+getURL)
// }
// geturl(); 
main();
// inserMysql();


