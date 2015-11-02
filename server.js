var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');
var flying = false;
var buttons = [
    'FACE_1', 'FACE_2', 'FACE_3', 'FACE_4',
    'LEFT_TOP_SHOULDER', 'RIGHT_TOP_SHOULDER', 'LEFT_BOTTOM_SHOULDER', 'RIGHT_BOTTOM_SHOULDER',
    'SELECT_BACK', 'START_FORWARD', 'LEFT_STICK', 'RIGHT_STICK',
    'DPAD_UP', 'DPAD_DOWN', 'DPAD_LEFT', 'DPAD_RIGHT',
    'HOME'
];
var axes = ['LEFT_STICK_X', 'LEFT_STICK_Y', 'RIGHT_STICK_X', 'RIGHT_STICK_Y'];
var animations = [
    'blinkGreenRed', 'blinkGreen', 'blinkRed', 'blinkOrange', 'snakeGreenRed',
    'fire', 'standard', 'red', 'green', 'redSnake', 'blank', 'rightMissile',
    'leftMissile', 'doubleMissile', 'frontLeftGreenOthersRed',
    'frontRightGreenOthersRed', 'rearRightGreenOthersRed',
    'rearLeftGreenOthersRed', 'leftGreenRightRed', 'leftRedRightGreen',
    'blinkStandard'
];
var sock;
var arDrone = require('ar-drone');
var client = arDrone.createClient();
// var pngStream = client.getPngStream();
// var videoStream = client.getVideoStream();
// pngStream.on('error', console.log);
// videoStream.on('error', console.log);

// pngStream.on('data', function (pngBuffer) {
//     if (sock) {
//         sock.emit('video', pngBuffer);
//     }
// });

// videoStream.on('data', function (pngBuffer) {
//     if (sock) {
//         sock.emit('video', pngBuffer);
//     }
// });

app.use(express.static('public'));

app.get('/', function (req, res) {
    res.sendFile(path.resolve(__dirname) + '/public/index.html');
});

io.on('connection', function (socket) {
    sock = socket;

    console.log('a user connected');

    socket.on('disconnect', function () {
        console.log('user disconnected');
    });

    socket.on('axeschange', function (data) {
        var normFront = 0;
        var normUp = 0;
        var normLeft = 0;
        var normRotateLeft = 0;
        var forwards = true;
        var up = true;
        var left = true;
        var rotateLeft = true;

        switch (data.axis) {
            case 'LEFT_STICK_X':
                normLeft = data.value;

                if (data.value > 0.5) {
                    left = false;
                }

                if (normLeft > -0.5 && normLeft < 0.5) {
                    left ? client.left(normLeft) : client.right(normLeft);
                } else {
                    client.left(normLeft);
                    client.right(normLeft);
                }

                break;
            case 'LEFT_STICK_Y':
                normFront = data.value;

                if (data.value > 0.5) {
                    forwards = false;
                }

                if (normFront > -0.5 && normFront < 0.5) {
                    forwards ? client.front(normFront) : client.back(normFront);
                } else {
                    client.front(normFront);
                    client.back(normFront);
                }

                break;
            case 'RIGHT_STICK_X':
                normRotateLeft = data.value;

                if (data.value > 0.5) {
                    left = false;
                }

                if (normRotateLeft > -0.5 && normRotateLeft < 0.5) {
                    left ? client.clockwise(normRotateLeft) : client.counterClockwise(normRotateLeft);
                } else {
                    client.clockwise(normRotateLeft);
                    client.counterClockwise(normRotateLeft);
                }

                break;
            case 'RIGHT_STICK_Y':
                normUp = data.value;

                if (data.value > 0.5) {
                    up = false;
                }

                if (normUp > -0.5 && normUp < 0.5) {
                    up ? client.up(normUp) : client.down(normUp);
                } else {
                    client.up(normUp);
                    client.down(normUp);
                }

                break;
        }
    });

    socket.on('keyup', function (data) {
        switch (data) {
            case 'START_FORWARD':
                if (!flying) {
                    client.takeoff();
                } else {
                    client.land();
                }
                break;
            case 'FACE_1':
                client.disableEmergency();
                break;
            case 'FACE_2':
                client.animateLeds(animations[Math.round(Math.random() * (animations.length - 1))], 5, 2);
                break;
            case 'FACE_3':
                break;
            case 'FACE_4':
                break;
            case 'LEFT_TOP_SHOULDER':
                break;
            case 'RIGHT_TOP_SHOULDER':
                break;
        }
    });
});

require('dronestream').listen(http);

http.listen(3000, function () {
    console.log('listening on *:3000');
});
