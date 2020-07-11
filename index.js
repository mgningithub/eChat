
const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 3000;

app.use(express.static(__dirname + '/public'));

// 描画ログの保存に使用
const Redis = require('ioredis');
const redis = new Redis(process.env.REDIS_URL);

// 描画ログ
let log = [];

// システム(ダミープレイヤー)
const system = {
  name: "SYSTEM",
  color: "pink"
}

// プレイヤーリスト
let players = {};

// プレイヤークラス
class Player {
  constructor(id, name) {
    this.id = id;
    this.name = name;
    this.loginTime = Date.now();
    this.color = getPaleColor();
  }
}

// エラーキャッチ
process.on('uncaughtException', (err) => { console.log(err); });

/** 淡い色を取得。プレイヤー背景色として使用。 */
function getPaleColor() {
  let v1 = 360 * Math.random();
  let v2 = 25 + 70 * Math.random();
  let v3 = 80 + 10 * Math.random();
  return `hsl(${v1}, ${v2}%, ${v3}%)`;
}

/** クライアントへのレスポンス */
function onConnection(socket) {
  // 描画
  socket.on('drawing', (data) => {
    socket.broadcast.emit('drawing', data);
    log.push(data);
  });
  // プレイヤー発言
  socket.on('player_say', (data) => io.emit('say',
    {
      sender: players[socket.id],
      message: data,
      ts: Date.now()
    }
  ))
  // キャンバスクリア
  socket.on('clear', () => {
    try {
      io.emit('clear');
      // join経由していないsocket対策
      let name = (players[socket.id].name) ? players[socket.id].name : "[undefined]";
      io.emit('say',
        {
          sender: system,
          message: players[socket.id].name + " cleared the canvas.",
          ts: Date.now()
        })
      log = [];
    } catch (err) {
      console.log(socket.id, err);
      socket.disconnect();
    }

  })
  // 接続時
  socket.on('join', (name) => {
    // プレイヤーリストに追加
    if (!name) { name = "Guest" };
    let player = new Player(socket.id, name);
    players[socket.id] = player;
    console.log('join', player);
    // システムメッセージ発信
    io.emit('say',
      {
        sender: system,
        message: players[socket.id].name + " has joined ! 👏",
        ts: Date.now()
      })
    // プレイヤーリスト発信
    io.emit('players', JSON.stringify(players));
  })
  // 切断時
  socket.on('disconnect', () => {
    console.log('disconnect', players[socket.id]);
    if (!players[socket.id]) { return; };
    // システムメッセージ発信
    io.emit('say',
      {
        sender: system,
        message: players[socket.id].name + " has left ... 👋",
        ts: Date.now()
      })
    // プレイヤーリストから削除
    delete players[socket.id];
    // プレイヤーリスト発信
    io.emit('players', JSON.stringify(players));
    // 描画ログを保存
    redis.set("log", JSON.stringify(log));
  })

  // 接続時、ログを発信
  if (io.eio.clientsCount === 1) {
    // 1人目のクライアントはDBから描画ログを読み込む
    redis.get("log").then(function (result) {
      if (result) {
        log = JSON.parse(result);
        io.to(socket.id).emit("log", log);
      };
    });
  } else {
    io.to(socket.id).emit("log", log);
  }
}

io.on('connection', onConnection);

http.listen(port, () => console.log('listening on port ' + port));
