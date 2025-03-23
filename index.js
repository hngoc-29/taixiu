var io = require('socket.io')(server);
var express = require('express');
var cookieParser = require('cookie-parser');
var app = express();
app.use(express.static('./www'));
app.use(cookieParser());

var server = require('http').Server(app);
var io = require('socket.io')(server);

// cổng
server.listen(process.env.PORT || 3000, function () {
    console.log('server đang chạy....');
});

// tài xỉu
let users = {};

var Taixiu = function () {

    // cài đặt
    this.idPhien = 0;  // id phiên đặt
    this.timeDatCuoc = 60; // thời gian đặt cược = 60s;
    this.timechophienmoi = 10; // thời gian chờ phiên mới = 10s;
    this.soNguoiChonTai = 0;  // Số người đặt tài
    this.soNguoiChonXiu = 0;  // Số người đặt xỉu
    this.tongTienDatTai = 0;  // tổng tiền đặt tài
    this.tongTienDatXiu = 0;  // tổng tiền đặt xỉu
    this.time = this.timeDatCuoc;  // thời gian
    this.coTheDatCuoc = true; // có thể đặt hay không
    this.idChonTai = []; // array id chọn tài
    this.idChonXiu = []; // array id chọn xỉu
    this.ketQua = ''; // kết quả

    // game bắt đầu
    this.gameStart = function () {
        // code
        seft = this;
        seft.idPhien++;
        seft.coTheDatCuoc = true // có thể đặt
        seft.soNguoiChonTai = 0;  // Số người đặt tài
        seft.soNguoiChonXiu = 0;  // Số người đặt xỉu
        seft.tongTienDatTai = 0;  // tổng tiền đặt tài
        seft.tongTienDatXiu = 0;  // tổng tiền đặt xỉu
        seft.idChonTai = []; // array id chọn tài
        seft.idChonXiu = []; // array id chọn xỉu
        seft.time = seft.timeDatCuoc;
        io.sockets.emit('gameStart', this.ketQua);
        loopAGame = setInterval(function () {
            seft.time--;
            io.sockets.emit('gameData', {
                idGame: seft.idPhien,
                soNguoiChonTai: seft.soNguoiChonTai,
                soNguoiChonXiu: seft.soNguoiChonXiu,
                tongTienDatTai: seft.tongTienDatTai,
                tongTienDatXiu: seft.tongTienDatXiu,
                soNguoiChonTai: seft.soNguoiChonTai,
                time: seft.time,
            });
            ketqua = seft.gameRandomResult();
            if (seft.time == 0) {
                clearInterval(loopAGame);
                seft.gameOver();
            }
        }, 1000);
    };
    // game kết thúc
    this.gameOver = function () {
        seft = this;
        seft.coTheDatCuoc = false // không thể đặt
        seft.time = seft.timechophienmoi;
        this.ketQua = seft.gameRandomResult();
        io.sockets.emit('gameOver', this.ketQua);
        idWin = this.ketQua.result == 'tai' ? seft.idChonTai : seft.idChonXiu;
        setTimeout(() => {
            idWin.forEach((data) => {
                // Cập nhật tiền của người dùng
                let userMoney = getUserMoney(data.id);
                let newMoney = userMoney + (data.tien * 2); // Nhân đôi số tiền cược
                setUserMoney(data.id, newMoney);
                // Gửi thông báo thắng đến socket đúng
                io.to(users[data.id].socketId).emit('winGame', {
                    msg: 'Bạn đã thắng ' + (data.tien * 2) + ' xu',
                    newMoney: newMoney,
                    id: data.id
                });
            });
        }, 2000); // Delay to match the dice roll animation
        loopAGame = setInterval(function () {
            seft.time--;
            io.sockets.emit('gameData', {
                idGame: seft.idPhien,
                soNguoiChonTai: seft.soNguoiChonTai,
                soNguoiChonXiu: seft.soNguoiChonXiu,
                tongTienDatTai: seft.tongTienDatTai,
                tongTienDatXiu: seft.tongTienDatXiu,
                soNguoiChonTai: seft.soNguoiChonTai,
                time: seft.time,
            });
            if (seft.time == 0) {
                clearInterval(loopAGame);
                seft.gameStart();
            }
        }, 1000);
    };
    // đặt cược
    this.putMoney = function (id, cau, tien, socketId) {
        // nếu đang trong thời gian chờ (coTheDatCuoc == false)
        if (this.coTheDatCuoc == false) {
            return {
                status: 'error',
                error: 'Không thể đặt, vui lòng chờ giây lát'
            };
        }

        // Kiểm tra nếu người dùng có đủ tiền
        let userMoney = getUserMoney(id);
        if (tien > userMoney) {
            return {
                status: 'error',
                error: 'Số dư không đủ để đặt cược'
            };
        }

        // Trừ tiền từ tài khoản người dùng
        setUserMoney(id, userMoney - tien);

        if (cau == 'tai') {
            // thêm tiền vào tổng số tiền đặt tài
            this.tongTienDatTai += tien;
            // thêm id vào list id array nếu chưa có
            if (!this.idChonTai.find(x => x.id === id)) {
                this.idChonTai.push({
                    id: id,
                    cau: 'tai',
                    tien: tien,
                    socketId: socketId
                });
                this.soNguoiChonTai++;
            } else {
                // nếu tìm thấy thì cộng thêm tiền vô
                this.idChonTai.find(x => x.id === id).tien += tien;
            }

        } else if (cau == 'xiu') {
            // thêm tiền vào tổng số tiền đặt tài
            this.tongTienDatXiu += tien;
            // thêm id vào list id array nếu chưa có
            if (!this.idChonXiu.find(x => x.id === id)) {
                this.idChonXiu.push({
                    id: id,
                    cau: 'xiu',
                    tien: tien,
                    socketId: socketId
                });
                this.soNguoiChonXiu++;
            } else {
                // nếu tìm thấy thì cộng thêm tiền vô
                this.idChonXiu.find(x => x.id === id).tien += tien;
            }
        }
        return {
            status: 'success'
        }
    }
    // random kết quả
    this.gameRandomResult = function () {
        dice1 = Math.floor(1 + Math.random() * (6));
        dice2 = Math.floor(1 + Math.random() * (6));
        dice3 = Math.floor(1 + Math.random() * (6));
        return {
            dice1: dice1,
            dice2: dice2,
            dice3: dice3,
            result: dice1 + dice2 + dice3 <= 9 ? 'xiu' : 'tai'
        };
    }

}

// Lưu trữ trong bộ nhớ cho tiền người dùng (cho mục đích minh họa)

// Hàm trợ giúp để lấy và đặt tiền người dùng
function getUserMoney(id) {
    // Trả về tiền người dùng từ bộ nhớ trong
    return users[id] ? users[id].money : 0;
}

function setUserMoney(id, money) {
    // Đặt tiền người dùng trong bộ nhớ trong
    if (!users[id]) {
        users[id] = {};
    }
    users[id].money = money;
}

// Hàm trợ giúp để tạo ID ngẫu nhiên duy nhất
function generateUniqueId() {
    let randomId;
    do {
        randomId = Math.random().toString(36).substring(2, 15);
    } while (users[randomId]);
    return randomId;
}

tx = new Taixiu();

io.on('connection', function (socket) {
    // Lấy ID người dùng và tiền từ cookie
    let cookies = socket.handshake.headers.cookie;
    let id = cookies.split('; ').find(row => row.startsWith('id=')).split('=')[1];
    let money = cookies.split('; ').find(row => row.startsWith('money=')).split('=')[1];

    // Đảm bảo ID là duy nhất

    if (!id) id = generateUniqueId();
    users[id] = { money: Number(money), socketId: socket.id };


    socket.on('updateMoney', function (data) {
        setUserMoney(data.id, data.newMoney);
    });

    socket.on('chatMessage', function (msg) {
        io.emit('chatMessage', msg);
    });

    socket.on('pull', function (data) {
        msg = tx.putMoney(data.id, data.dice, data.money, socket.id);
        socket.emit('pull', msg);
    });
});
tx.gameStart();