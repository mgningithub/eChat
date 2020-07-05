'use strict';

(function () {

    const players = document.getElementById("players");
    const messages = document.getElementById("messages");
    const send_form = document.getElementById("send_form");
    const send_text = document.getElementById("send_text");
    const send_btn = document.getElementById("send_btn");

    // メッセージ送信
    send_form.addEventListener('submit', sendMessage, false);
    send_btn.addEventListener('click', sendMessage, false);
    function sendMessage(e) {
        e.preventDefault();
        if (!send_text.value) { return };
        socket.emit('player_say', send_text.value);
        send_text.value = "";
        send_text.focus();
    }

    // メッセージ受信
    socket.on('say', addMessage);
    function addMessage(data) {
        // 時刻編集
        let date = new Date(data.ts);
        let ts = date.getFullYear()
            + '/' + ("0" + (date.getMonth() + 1)).slice(-2)
            + '/' + ("0" + date.getDate()).slice(-2)
            + ' ' + ("0" + date.getHours()).slice(-2)
            + ':' + ("0" + date.getMinutes()).slice(-2)
            + ':' + ("0" + date.getSeconds()).slice(-2);
        // テンプレートに値を入れて要素追加
        let template = document.getElementById('template');
        let clone = template.content.cloneNode(true);
        clone.querySelector('.msg_name').textContent = data.sender.name;
        clone.querySelector('.msg_message').textContent = data.message;
        clone.querySelector('.msg_timestamp').textContent = ts;
        clone.querySelector('.message').style.background = data.sender.color;
        messages.insertBefore(clone, messages.firstChild);
    }

    // プレイヤーリスト更新
    socket.on('players', refreshPlayers);
    function refreshPlayers(data) {
        while (players.firstChild) { players.removeChild(players.firstChild) }
        Object.values(JSON.parse(data)).reverse().forEach((player) => {
            let ele = document.createElement("div");
            ele.textContent = player.name;
            ele.classList.add("player");
            ele.style.background = player.color;
            players.insertBefore(ele, players.firstChild);
        })
    }

    // 開始
    function gameStart() {
        // 名前入力
        const defaultName = "Guest"
        let name = prompt("Enter your name.", defaultName);
        if (!name) { name = dafeultName };
        socket.emit('join', name);
        send_text.focus();
    }
    gameStart();
})();
