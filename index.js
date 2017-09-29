var req = require('request');
var fs = require('fs');
var sense = require("sense-hat-led");
var senseJoystick = require('sense-joystick');
var cprocess = require('child_process');
var filePath = '/tmp/camera.jpg';
var herokuDomain = 'https://[あなたのherokuアプリ名].herokuapp.com';
var interval1 = 600;
var interval2 = 500;
var flushCount = 10;

//LED消灯
sense.clear();

// Raspberri Pi上の呼び鈴ボタン : イベントリスナー登録
senseJoystick.getJoystick()
    .then((joystick) => {
        joystick.on('press', (direction) => {
            onClick();
        });
    });

// 呼び鈴ボタン押下時に実行させるファンクション
function onClick(){
    sense.clear(255,255,255);
    cprocess.exec('raspistill -t 1 -w 640 -h 480 -ev auto -o ' + filePath, (err, stdout, stderr) => {
        var imgFile = fs.readFileSync(filePath);
        var b64 = new Buffer(imgFile).toString('base64');
        var form = {
            b64 : b64
        }
        req.post({
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(form),
            url: herokuDomain + '/img'
        }, function(err, res, body){
            if (!err){
                sense.clear();
                var obj = JSON.parse(body);
                var predicted = obj.probabilities[0].label;
                var color = [0,0,255];
                flush(color);
            } else {
                sense.clear();
            }
        });
    });
}

// LED点滅させるファンクション
function flush(color, mycount){
    var count =
        mycount ? mycount:
        flushCount;
    for (i = 0; i < count; i++){
        setTimeout(function(){
            sense.clear(color);
        }, i * interval1);
        setTimeout(function(){
            sense.clear();
        }, (i * interval1 + interval2));
    }
}
