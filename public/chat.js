'use strict';

(function () {

    const players = document.getElementById("players");
    const messages = document.getElementById("messages");
    const send_form = document.getElementById("send_form");
    const send_text = document.getElementById("send_text");
    const send_btn = document.getElementById("send_btn");

    // テキストフィールド外をタップした時、
    // ソフトキーボードを閉じて画面一番上へ移動しキャンバスを見せる
    document.addEventListener('click', () => { scrollTo(0, 0); });

    // メッセージ送信
    send_form.addEventListener('submit', sendMessage, false);
    send_btn.addEventListener('click', sendMessage, false);
    function sendMessage(e) {
        e.preventDefault();
        send_text.focus();
        if (!send_text.value) { return };
        socket.emit('player_say', send_text.value);
        send_text.value = "";
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

    // 切断
    socket.on('disconnect', () => {
        alert('disconnected !');
        socket.close
        // 時刻編集
        let date = new Date();
        let ts = date.getFullYear()
            + '/' + ("0" + (date.getMonth() + 1)).slice(-2)
            + '/' + ("0" + date.getDate()).slice(-2)
            + ' ' + ("0" + date.getHours()).slice(-2)
            + ':' + ("0" + date.getMinutes()).slice(-2)
            + ':' + ("0" + date.getSeconds()).slice(-2);
        // テンプレートに値を入れて要素追加
        let template = document.getElementById('template');
        let clone = template.content.cloneNode(true);
        clone.querySelector('.msg_name').textContent = "SYSTEM";
        clone.querySelector('.msg_message').textContent = "You have been disconnected from the server !💀";
        clone.querySelector('.msg_timestamp').textContent = ts;
        clone.querySelector('.message').style.background = "red";
        messages.insertBefore(clone, messages.firstChild);
    });

    // 入室、名前入力
    const enter_div = document.getElementById("enter_div");
    const enter_form = document.getElementById("enter_form");
    const enter_text = document.getElementById("enter_text");
    const enter_btn = document.getElementById("enter_btn");

    enter_form.addEventListener('submit', enterRoom, false);
    enter_btn.addEventListener('click', enterRoom, false);

    function enterRoom(e) {
        e.preventDefault();
        let name = enter_text.value;
        if (!name) { name = defaultName };
        socket.emit('join', name);
        // 入室画面のコントロールを無効
        enter_div.style.pointerEvents = "none";
        enter_form.removeEventListener('submit', enterRoom, false);
        enter_form.addEventListener('submit', (e) => { e.preventDefault(); }, false);
        enter_btn.removeEventListener('click', enterRoom, false);
        enter_div.style.zIndex = "-1";
        enter_div.style.opacity = "0%"
    }
    // デフォルト名前　暫定対応として名前が被らないよう秒+ミリ秒を付加
    let dt = new Date();
    const defaultName = "Guest" + dt.getSeconds() + dt.getMilliseconds();
    enter_text.placeholder = defaultName;
    enter_text.focus();
})();
