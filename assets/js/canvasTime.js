/**
 * 侧边栏 canvas 数字时钟
 * 源码来自互联网，由 geekswg 整理
 * @modified 2026-05-07 适配 FixIt 主题粉紫配色
 * @description 点阵数字时钟，显示 HH:MM:SS，数字变化时有粒子弹射效果
 */
(function () {
  // 主题配色：粉紫渐变
  var CLOCK_COLOR = '#d946ef';
  // 粒子颜色池：与主题粉紫色系一致
  var PARTICLE_COLORS = [
    '#ff7aa8', '#f472b6', '#d946ef', '#a78bfa',
    '#7c5cff', '#38bdf8', '#ff3d88', '#c084fc'
  ];

  // 0-9 和冒号的 7×10 点阵字模
  var digit = [
    [[0,0,1,1,1,0,0],[0,1,1,0,1,1,0],[1,1,0,0,0,1,1],[1,1,0,0,0,1,1],[1,1,0,0,0,1,1],[1,1,0,0,0,1,1],[1,1,0,0,0,1,1],[1,1,0,0,0,1,1],[0,1,1,0,1,1,0],[0,0,1,1,1,0,0]],
    [[0,0,0,1,1,0,0],[0,1,1,1,1,0,0],[0,0,0,1,1,0,0],[0,0,0,1,1,0,0],[0,0,0,1,1,0,0],[0,0,0,1,1,0,0],[0,0,0,1,1,0,0],[0,0,0,1,1,0,0],[0,0,0,1,1,0,0],[1,1,1,1,1,1,1]],
    [[0,1,1,1,1,1,0],[1,1,0,0,0,1,1],[0,0,0,0,0,1,1],[0,0,0,0,1,1,0],[0,0,0,1,1,0,0],[0,0,1,1,0,0,0],[0,1,1,0,0,0,0],[1,1,0,0,0,0,0],[1,1,0,0,0,1,1],[1,1,1,1,1,1,1]],
    [[1,1,1,1,1,1,1],[0,0,0,0,0,1,1],[0,0,0,0,1,1,0],[0,0,0,1,1,0,0],[0,0,1,1,1,0,0],[0,0,0,0,1,1,0],[0,0,0,0,0,1,1],[0,0,0,0,0,1,1],[1,1,0,0,0,1,1],[0,1,1,1,1,1,0]],
    [[0,0,0,0,1,1,0],[0,0,0,1,1,1,0],[0,0,1,1,1,1,0],[0,1,1,0,1,1,0],[1,1,0,0,1,1,0],[1,1,1,1,1,1,1],[0,0,0,0,1,1,0],[0,0,0,0,1,1,0],[0,0,0,0,1,1,0],[0,0,0,1,1,1,1]],
    [[1,1,1,1,1,1,1],[1,1,0,0,0,0,0],[1,1,0,0,0,0,0],[1,1,1,1,1,1,0],[0,0,0,0,0,1,1],[0,0,0,0,0,1,1],[0,0,0,0,0,1,1],[0,0,0,0,0,1,1],[1,1,0,0,0,1,1],[0,1,1,1,1,1,0]],
    [[0,0,0,0,1,1,0],[0,0,1,1,0,0,0],[0,1,1,0,0,0,0],[1,1,0,0,0,0,0],[1,1,0,1,1,1,0],[1,1,0,0,0,1,1],[1,1,0,0,0,1,1],[1,1,0,0,0,1,1],[1,1,0,0,0,1,1],[0,1,1,1,1,1,0]],
    [[1,1,1,1,1,1,1],[1,1,0,0,0,1,1],[0,0,0,0,1,1,0],[0,0,0,0,1,1,0],[0,0,0,1,1,0,0],[0,0,0,1,1,0,0],[0,0,1,1,0,0,0],[0,0,1,1,0,0,0],[0,0,1,1,0,0,0],[0,0,1,1,0,0,0]],
    [[0,1,1,1,1,1,0],[1,1,0,0,0,1,1],[1,1,0,0,0,1,1],[1,1,0,0,0,1,1],[0,1,1,1,1,1,0],[1,1,0,0,0,1,1],[1,1,0,0,0,1,1],[1,1,0,0,0,1,1],[1,1,0,0,0,1,1],[0,1,1,1,1,1,0]],
    [[0,1,1,1,1,1,0],[1,1,0,0,0,1,1],[1,1,0,0,0,1,1],[1,1,0,0,0,1,1],[0,1,1,1,0,1,1],[0,0,0,0,0,1,1],[0,0,0,0,0,1,1],[0,0,0,0,1,1,0],[0,0,0,1,1,0,0],[0,1,1,0,0,0,0]],
    [[0,0,0,0,0,0,0],[0,0,1,1,1,0,0],[0,0,1,1,1,0,0],[0,0,1,1,1,0,0],[0,0,0,0,0,0,0],[0,0,0,0,0,0,0],[0,0,1,1,1,0,0],[0,0,1,1,1,0,0],[0,0,1,1,1,0,0],[0,0,0,0,0,0,0]]
  ];

  var canvas = document.getElementById('canvasTime');
  if (!canvas || !canvas.getContext) return;

  var cxt = canvas.getContext('2d');
  var H = 100, W = 660;
  canvas.height = H;
  canvas.width = W;

  // 粒子半径
  var R = canvas.height / 20 - 1;

  // 存储当前时间数字
  var data = [];
  // 存储运动的粒子
  var balls = [];

  // 初始化时间
  (function () {
    var temp = /(\d)(\d):(\d)(\d):(\d)(\d)/.exec(new Date());
    data.push(temp[1], temp[2], 10, temp[3], temp[4], 10, temp[5], temp[6]);
  })();

  // 渲染单个数字的点阵
  function renderDigit(index, num) {
    cxt.fillStyle = CLOCK_COLOR;
    for (var i = 0; i < digit[num].length; i++) {
      for (var j = 0; j < digit[num][i].length; j++) {
        if (digit[num][i][j] === 1) {
          cxt.beginPath();
          cxt.arc(
            14 * (R + 2) * index + j * 2 * (R + 1) + (R + 1),
            i * 2 * (R + 1) + (R + 1),
            R, 0, 2 * Math.PI
          );
          cxt.closePath();
          cxt.fill();
        }
      }
    }
  }

  // 检测时间变化
  function updateDigitTime() {
    var changeNumArray = [];
    var temp = /(\d)(\d):(\d)(\d):(\d)(\d)/.exec(new Date());
    var newData = [];
    newData.push(temp[1], temp[2], 10, temp[3], temp[4], 10, temp[5], temp[6]);
    for (var i = data.length - 1; i >= 0; i--) {
      if (newData[i] !== data[i]) {
        changeNumArray.push(i + '_' + (Number(data[i]) + 1) % 10);
      }
    }
    // 数字变化时添加粒子
    for (var k = 0; k < changeNumArray.length; k++) {
      addBalls.apply(this, changeNumArray[k].split('_'));
    }
    data = newData.concat();
  }

  // 更新粒子运动状态
  function updateBalls() {
    for (var i = 0; i < balls.length; i++) {
      balls[i].stepY += balls[i].disY;
      balls[i].x += balls[i].stepX;
      balls[i].y += balls[i].stepY;
      // 超出画布边界则移除
      if (balls[i].x > W + R || balls[i].y > H + R) {
        balls.splice(i, 1);
        i--;
      }
    }
  }

  // 添加粒子：数字变化时从对应位置弹射
  function addBalls(index, num) {
    var numArray = [1, 2, 3];
    for (var i = 0; i < digit[num].length; i++) {
      for (var j = 0; j < digit[num][i].length; j++) {
        if (digit[num][i][j] === 1) {
          var ball = {
            x: 14 * (R + 2) * index + j * 2 * (R + 1) + (R + 1),
            y: i * 2 * (R + 1) + (R + 1),
            stepX: Math.floor(Math.random() * 4 - 2),
            stepY: -2 * numArray[Math.floor(Math.random() * numArray.length)],
            color: PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)],
            disY: 1
          };
          balls.push(ball);
        }
      }
    }
  }

  // 渲染：清空画布 → 画时钟 → 画粒子
  function render() {
    canvas.height = H;
    for (var i = 0; i < data.length; i++) {
      renderDigit(i, data[i]);
    }
    for (var j = 0; j < balls.length; j++) {
      cxt.beginPath();
      cxt.arc(balls[j].x, balls[j].y, R, 0, 2 * Math.PI);
      cxt.fillStyle = balls[j].color;
      cxt.closePath();
      cxt.fill();
    }
  }

  // 50ms 刷新一次
  setInterval(function () {
    updateDigitTime();
    updateBalls();
    render();
  }, 50);
})();
