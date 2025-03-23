// Function to get a cookie by name
function getCookie(name) {
    let cookieArr = document.cookie.split(";");
    for (let i = 0; i < cookieArr.length; i++) {
        let cookiePair = cookieArr[i].split("=");
        if (name == cookiePair[0].trim()) {
            return decodeURIComponent(cookiePair[1]);
        }
    }
    return null;
}

// Function to set a cookie
function setCookie(name, value, days) {
    let date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    let expires = "expires=" + date.toUTCString();
    document.cookie = name + "=" + encodeURIComponent(value) + ";" + expires + ";path=/";
}

// Function to generate a unique random ID
function generateUniqueId() {
    let randomId;
    do {
        randomId = Math.random().toString(36).substring(2, 15);
    } while (getCookie('id') === randomId);
    return randomId;
}

// Function to show a modal with a message and an input field
function showModal(message, callback) {
    const modal = document.getElementById('custom-modal');
    const modalMessage = document.getElementById('modal-message');
    const modalInput = document.getElementById('modal-input');
    const modalButton = document.getElementById('modal-button');

    modalMessage.innerHTML = message;
    modalInput.value = '';
    modal.style.display = 'flex';

    modalButton.onclick = function () {
        const inputValue = modalInput.value.trim();
        if (inputValue) {
            modal.style.display = 'none';
            callback(inputValue);
        } else {
            alert('Tên người dùng không được để trống. Vui lòng nhập tên người dùng của bạn:');
        }
    };
}

// Function to validate and sanitize cookies
function validateCookies() {
    const id = getCookie('id');
    const money = getCookie('money');
    const username = getCookie('username');
    if (!id || !/^[a-z0-9]+$/.test(id)) {
        setCookie('id', generateUniqueId(), 365);
    }

    if (!money || isNaN(money) || money < 0) {
        setCookie('money', 0, 365);
    }

    if (!username || username.trim() === '') {
        console.log('username')
        showModal("Vui lòng nhập tên người dùng của bạn:", function (newUsername) {
            setCookie('username', newUsername, 365);
            document.getElementById('custom-modal').style.display = 'none'; // Ensure modal is closed
        });
    }
}

// Validate cookies on page load
validateCookies();

// Kiểm tra nếu cookie 'id', 'money', và 'username' tồn tại, nếu không thì thiết lập chúng
if (!getCookie('id')) {
    let uniqueId = generateUniqueId();
    setCookie('id', uniqueId, 365);
}

if (!getCookie('money')) {
    setCookie('money', 0, 365);
}

if (!getCookie('username')) {
    showModal("Vui lòng nhập tên người dùng của bạn:", function (username) {
        setCookie('username', username, 365);
        document.getElementById('custom-modal').style.display = 'none'; // Ensure modal is closed
    });
}

// Function to adjust the width of the money display based on the length of the money value
function adjustMoneyDisplayWidth() {
    const moneyDisplay = document.getElementById('money-display');
    const moneyValue = getCookie('money');
    const baseWidth = 60; // base width for the display
    const extraWidthPerDigit = 10; // extra width per digit
    const newWidth = baseWidth + (moneyValue.length * extraWidthPerDigit);
    moneyDisplay.style.width = newWidth + 'px';
}

// Initial adjustment
adjustMoneyDisplayWidth();

// Cập nhật hiển thị tiền và điều chỉnh chiều rộng
document.getElementById('money-display').innerHTML = getCookie('money');
adjustMoneyDisplayWidth();

// Kiểm tra hướng màn hình
function checkOrientation() {
    if (window.innerWidth <= window.innerHeight) {
        document.body.style.display = 'none';
        alert("Vui lòng lật ngang màn hình để có trải nghiệm tốt nhất.");
    } else {
        document.body.style.display = 'block';
    }
}

// Kiểm tra ban đầu
checkOrientation();

// Thêm sự kiện lắng nghe cho thay đổi hướng màn hình
window.addEventListener("resize", checkOrientation);

d1 = document.getElementById("dice1");
d2 = document.getElementById("dice2");
d3 = document.getElementById("dice3");
idGame = document.getElementById("id");
soNguoiChonTai = document.getElementById("usertai");
soNguoiChonXiu = document.getElementById("userxiu");
tongTienDatTai = document.getElementById("sumtai");
tongTienDatXiu = document.getElementById("sumxiu");
time = document.getElementById("time");

gameStart = function () {
    time.style.opacity = 1;
    d1.style.opacity = 0;
    d2.style.opacity = 0;
    d3.style.opacity = 0;
    document.getElementById('dragon').style.webkitAnimationPlayState = 'running';
    document.getElementById("taitxt").style.webkitAnimationPlayState = 'paused';
    document.getElementById("xiutxt").style.webkitAnimationPlayState = 'paused';
}
gameOver = function (dice) {
    time.style.opacity = 0;
    roll = document.getElementById("roll");
    document.getElementById('dragon').style.webkitAnimationPlayState = 'paused';
    roll.src = "";
    roll.src = 'imgs/roll1.gif';
    roll.style.opacity = 1;
    setTimeout(() => {
        roll.style.opacity = 0;
        showDice(dice.dice1, dice.dice2, dice.dice3);
        document.getElementById(dice.result + "txt").style.webkitAnimationPlayState = 'running';
    }, 2000);
}

showDice = function (dice1, dice2, dice3) {
    dice = {
        1: '0 -2px',
        2: '-103px -3px',
        3: '-204px -3px',
        4: '-305px -3px',
        5: '-404px -3px',
        6: '-507px -2px',
    };
    d1.style.background = "url('imgs/dice.png') no-repeat " + dice[dice1];
    d2.style.background = "url('imgs/dice.png') no-repeat " + dice[dice2];
    d3.style.background = "url('imgs/dice.png') no-repeat " + dice[dice3];
    d1.style.opacity = 1;
    d2.style.opacity = 1;
    d3.style.opacity = 1;

}

showStt = function (msg, timeout = 3000) {
    statustxt = document.getElementById('statustxt');
    statustxt.innerHTML = msg;
    statustxt.style.opacity = 1;
    setTimeout(() => {
        statustxt.style.opacity = 0;
    }, timeout);
}

gameStart();

var socket = io();

socket.on('gameData', function (data) {
    idGame.innerHTML = '#' + data.idGame;
    soNguoiChonTai.innerHTML = data.soNguoiChonTai;
    soNguoiChonXiu.innerHTML = data.soNguoiChonXiu;
    tongTienDatTai.innerHTML = data.tongTienDatTai / 1000 + 'k';
    tongTienDatXiu.innerHTML = data.tongTienDatXiu / 1000 + 'k';
    if (data.time.toString().length == 1) {
        time.innerHTML = data.time == 0 ? '' : '0' + data.time;
    } else {
        time.innerHTML = data.time;
    }
});

let gameHistory = [];

function updateGameHistory(dice) {
    const result = dice.result === 'tai' ? 'Tài' : 'Xỉu';
    gameHistory.unshift({ dice1: dice.dice1, dice2: dice.dice2, dice3: dice.dice3, result: result });
    if (gameHistory.length > 10) {
        gameHistory.pop(); // Keep only the last 10 results
    }
    renderGameHistory();
}

function renderGameHistory() {
    const historyTable = document.getElementById('history-table-body');
    historyTable.innerHTML = '';
    const maxItems = window.innerHeight < 600 ? 5 : 10; // Render fewer items if height is small
    gameHistory.slice(0, maxItems).forEach((game, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${game.dice1}</td>
            <td>${game.dice2}</td>
            <td>${game.dice3}</td>
            <td>${game.result}</td>
        `;
        historyTable.appendChild(row);
    });
}

document.getElementById('history-button').onclick = function () {
    document.getElementById('history-modal').style.display = 'flex';
};

document.getElementById('history-close').onclick = function () {
    document.getElementById('history-modal').style.display = 'none';
};

socket.on('gameOver', function (data) {
    gameOver(data);
    updateGameHistory(data);
});

socket.on('gameStart', function (data) {
    gameStart();
    showStt('Game bắt đầu');
});

socket.on('pull', function (data) {
    if (data.status == 'success') {
        const userMoney = Number(getCookie('money'));
        setCookie('money', userMoney - selectedBet, 365);
        document.getElementById('money-display').innerHTML = getCookie('money');
        showStt('Đặt cược thành công');
    } else if (data.status == 'error') {
        showStt(data.error);
    }

});
socket.on('winGame', function (data) {
    if (data.id === getCookie('id')) {
        showStt(data.msg, 10000);
        setCookie('money', data.newMoney, 365);
        document.getElementById('money-display').innerHTML = getCookie('money');
        adjustMoneyDisplayWidth();
    }
});

socket.on('gameHistory', function (history) {
    gameHistory = history;
    renderGameHistory();
});

let selectedBet = 1000;

document.querySelectorAll('.bet-button').forEach(button => {
    button.addEventListener('click', function () {
        if (this.className.includes('custom-price')) {
            const price = document.getElementById('custombet').value;
            this.setAttribute('data-value', price);
            selectedBet = Number(price);
        } else {
            selectedBet = Number(this.getAttribute('data-value'));
        }
        document.querySelectorAll('.bet-button').forEach(btn => btn.style.border = '2px solid #fff');
        this.style.border = '2px solid #ff0';
    });
});

document.getElementById('custombet').addEventListener('input', function () {
    selectedBet = Number(this.value);
    document.querySelectorAll('.bet-button').forEach(btn => btn.style.border = '2px solid #fff');
    document.querySelector('.custom-price').style.border = '2px solid #ff0';
});

function placeBet(dice) {
    const userMoney = Number(getCookie('money'));
    if (selectedBet > userMoney) {
        showStt('Số dư không đủ để đặt cược');
        return;
    }
    // Trừ tiền từ tài khoản người dùng
    adjustMoneyDisplayWidth();
    socket.emit('pull', {
        id: getCookie('id'),
        dice: dice,
        money: selectedBet
    });
}

document.getElementById('bet-tai').addEventListener("click", function () {
    if (document.querySelector('.custom-price').style.border === '2px solid rgb(255, 255, 0)') {
        const price = document.getElementById('custombet').value;
        selectedBet = Number(price);
    }
    placeBet('tai');
});

document.getElementById('bet-xiu').addEventListener("click", function () {
    if (document.querySelector('.custom-price').style.border === '2px solid rgb(255, 255, 0)') {
        const price = document.getElementById('custombet').value;
        selectedBet = Number(price);
    }
    placeBet('xiu');
});

document.getElementById('custombet').addEventListener("keyup", function (event) {
    if (event.key === "Enter") {
        const price = document.getElementById('custombet').value;
        selectedBet = Number(price);
        document.querySelector('.custom-price').setAttribute('data-value', price);
        document.querySelectorAll('.bet-button').forEach(btn => btn.style.border = '2px solid #fff');
        document.querySelector('.custom-price').style.border = '2px solid #ff0';
    }
});

// Lấy các phần tử modal
const modal = document.getElementById("money-modal");
const modalMoneyDisplay = document.getElementById("modal-money-display");
const span = document.getElementsByClassName("close")[0];

// Khi người dùng nhấp vào hiển thị tiền, mở modal
document.getElementById('money-display').onclick = function () {
    modalMoneyDisplay.innerHTML = getCookie('money');
    modal.style.display = "flex";
}

// Khi người dùng nhấp vào <span> (x), đóng modal
span.onclick = function () {
    modal.style.display = "none";
}

// Khi người dùng nhấp vào bất kỳ đâu bên ngoài modal, đóng nó
window.onclick = function (event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}

let countdownInterval;

function showAd() {
    document.getElementById("ad-modal").style.display = "flex";
    const countdownElement = document.getElementById("ad-countdown");
    let countdown = 15;
    // Cập nhật đếm ngược mỗi giây
    countdownInterval = setInterval(() => {
        countdown--;
        countdownElement.textContent = countdown;

        // Khi đếm ngược đạt 0, hiển thị nút nhận thưởng và đóng modal
        if (countdown === 0) {
            clearInterval(countdownInterval);
            document.getElementById("claim-reward").classList.remove("hidden");
        }
    }, 1000);
}

function closeAd() {
    document.getElementById("ad-modal").style.display = "none";
    clearInterval(countdownInterval);
    document.getElementById("ad-countdown").textContent = 15;
    document.getElementById("claim-reward").classList.add("hidden");
}

function getReward() {
    let currentMoney = Number(getCookie('money'));
    let newMoney = currentMoney + 10000;
    setCookie('money', newMoney, 365);
    document.getElementById('money-display').innerHTML = newMoney;
    adjustMoneyDisplayWidth();
    closeAd();
    modal.style.display = "none";

    // Gửi tiền cập nhật lên server
    socket.emit('updateMoney', { id: getCookie('id'), newMoney: newMoney });
}

function toggleChat() {
    const chatWrapper = document.querySelector('.chat-wrapper');
    chatWrapper.classList.toggle('open');
    chatWrapper.classList.toggle('closed');
}

function sendMessage() {
    const input = document.getElementById('chat-input');
    const message = input.value.trim();
    if (message) {
        const username = getCookie('username');
        // Gửi tin nhắn lên server (giả sử socket.io được sử dụng)
        socket.emit('chatMessage', { sender: username, text: message });
        input.value = '';
    }
}

// Lắng nghe tin nhắn chat đến
socket.on('chatMessage', function (msg) {
    const chatMessages = document.getElementById('chat-messages');
    const newMessage = document.createElement('div');
    newMessage.className = 'chat-message';
    newMessage.innerHTML = `<strong>${msg.sender}:</strong> ${msg.text}`;
    chatMessages.appendChild(newMessage);
    chatMessages.scrollTop = chatMessages.scrollHeight;
});

window.addEventListener('resize', renderGameHistory);