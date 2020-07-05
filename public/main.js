'use strict';

(function () {

  var canvas = document.getElementsByClassName('whiteboard')[0];
  var colors = document.getElementsByClassName('color');
  var context = canvas.getContext('2d');

  var current = {
    color: 'black'
  };
  var drawing = false;

  canvas.addEventListener('mousedown', onMouseDown, false);
  canvas.addEventListener('mouseup', onMouseUp, false);
  canvas.addEventListener('mouseout', onMouseUp, false);
  canvas.addEventListener('mousemove', throttle(onMouseMove, 10), false);

  //Touch support for mobile devices
  canvas.addEventListener('touchstart', onMouseDown, false);
  canvas.addEventListener('touchend', onMouseUp, false);
  canvas.addEventListener('touchcancel', onMouseUp, false);
  canvas.addEventListener('touchmove', throttle(onMouseMove, 10), false);

  for (var i = 0; i < colors.length; i++) {
    colors[i].addEventListener('click', onColorUpdate, false);
  }

  socket.on('drawing', onDrawingEvent);

  function drawLine(x0, y0, x1, y1, color, emit) {
    context.beginPath();
    context.moveTo(x0, y0);
    context.lineTo(x1, y1);
    context.strokeStyle = color;
    context.lineWidth = 2;
    context.stroke();
    context.closePath();

    if (!emit) { return; }
    var w = canvas.width;
    var h = canvas.height;

    socket.emit('drawing', {
      x0: x0 / w,
      y0: y0 / h,
      x1: x1 / w,
      y1: y1 / h,
      color: color
    });
  }
  /**
   * ポインタのキャンバス基準の座標を取得
   * @param {event} e - 発生元イベント
   * @returns {object} - [x,y]
   */
  function getPosition(e) {
    const rect = e.target.getBoundingClientRect();
    return {
      x: e.offsetX || (e.touches[0].clientX - window.pageXOffset - rect.left),
      y: e.offsetY || (e.touches[0].clientY - window.pageYOffset - rect.top)
    }
  }

  function onMouseDown(e) {
    e.preventDefault(); //タッチ操作の既定を無効化
    drawing = true;
    let p = getPosition(e);
    current.x = p.x;
    current.y = p.y;
  }

  function onMouseUp(e) {
    if (!drawing) { return; }
    drawing = false;
    if (e.touches) { return false }; // タッチ終了系イベントではオブジェクト取得できない為ここで終了
    let p = getPosition(e);
    drawLine(current.x, current.y, p.x, p.y, current.color, true);
  }

  function onMouseMove(e) {
    if (!drawing) { return; }
    let p = getPosition(e);
    drawLine(current.x, current.y, p.x, p.y, current.color, true);
    current.x = p.x;
    current.y = p.y;
  }

  function onColorUpdate(e) {
    current.color = e.target.className.split(' ')[1];
  }

  // limit the number of events per second
  function throttle(callback, delay) {
    var previousCall = new Date().getTime();
    return function () {
      var time = new Date().getTime();

      if ((time - previousCall) >= delay) {
        previousCall = time;
        callback.apply(null, arguments);
      }
    };
  }

  function onDrawingEvent(data) {
    var w = canvas.width;
    var h = canvas.height;
    drawLine(data.x0 * w, data.y0 * h, data.x1 * w, data.y1 * h, data.color);
  }

  // キャンバスクリア
  let clear = document.getElementById("clear");
  clear.addEventListener('click', () => { socket.emit('clear') }, false);
  socket.on('clear', () => { context.clearRect(0, 0, canvas.width, canvas.height) });

})();
