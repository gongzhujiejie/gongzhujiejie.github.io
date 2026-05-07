/**
 * 自定义脚本：FixIt 博客交互增强。
 * 修改日期：2026-05-07
 * 语言要求：现代浏览器 JavaScript（ES2017+）。
 * 依赖库：无；所有逻辑均为原生 DOM / Canvas API。
 *
 * 主要功能：
 * 1. About 页面打字机与交互终端。
 * 2. 首页 GitHub snake 区域的降级显示。
 * 3. 首页高性能动态点阵时钟，桌面端 Canvas，移动端文本降级。
 */
class FixItBlog {
  /**
   * 初始化调试问候。
   * 返回值：当前实例，便于链式调用。
   */
  hello() {
    console.log('custom.js: Hello FixIt!');
    return this;
  }

  /**
   * About 页 kicker 打字机效果。
   * 输入：读取 .xv-about-v3-kicker 的 data-typewriter（缺省则回退到元素内文本）。
   * 输出：逐字写入目标节点，支持 | 分隔多行循环；打字中元素带 is-typing 类驱动光标动画。
   */
  aboutKickerTypewriter() {
    const target = document.querySelector('.xv-about-v3-kicker');
    if (!target) return this;
    const raw = (target.dataset.typewriter || target.textContent || '').trim();
    if (!raw) return this;
    // 支持用 | 分隔多句，仅一句时也会循环"打-停-删-打"。
    const lines = raw.split('|').map((line) => line.trim()).filter(Boolean);
    if (!lines.length) return this;

    // 给屏幕阅读器保留全文，避免光标动画影响无障碍朗读。
    target.dataset.full = lines.join(' / ');
    target.setAttribute('aria-label', lines.join(' / '));
    target.classList.add('is-typing');
    target.textContent = '';

    let lineIndex = 0;
    let charIndex = 0;
    let deleting = false;
    // 不同阶段不同节奏：打字 85ms，退格 40ms，打完停顿 1600ms，删完停顿 420ms。
    const tick = () => {
      const line = lines[lineIndex];
      target.textContent = deleting ? line.slice(0, charIndex--) : line.slice(0, charIndex++);

      let delay = deleting ? 40 : 85;
      if (!deleting && charIndex > line.length) {
        deleting = true;
        delay = 1600;
      } else if (deleting && charIndex < 0) {
        deleting = false;
        lineIndex = (lineIndex + 1) % lines.length;
        charIndex = 0;
        delay = 420;
      }
      window.setTimeout(tick, delay);
    };
    // 页面绘制完成后再开始，视觉节奏更自然。
    window.setTimeout(tick, 350);
    return this;
  }

  /**
   * About 页打字机效果。
   * 输入：读取 .xv-about-v3-type 的 data-typewriter，以 | 分隔多行文案。
   * 输出：循环更新目标节点文字；节点不存在时安全跳过。
   */
  aboutTypewriter() {
    const target = document.querySelector('.xv-about-v3-type');
    if (!target) return this;
    const lines = (target.dataset.typewriter || '').split('|').filter(Boolean);
    if (!lines.length) return this;

    let lineIndex = 0;
    let charIndex = 0;
    let deleting = false;
    const tick = () => {
      const line = lines[lineIndex];
      target.textContent = deleting ? line.slice(0, charIndex--) : line.slice(0, charIndex++);

      let delay = deleting ? 26 : 50;
      if (!deleting && charIndex > line.length) {
        deleting = true;
        delay = 1250;
      } else if (deleting && charIndex < 0) {
        deleting = false;
        lineIndex = (lineIndex + 1) % lines.length;
        charIndex = 0;
        delay = 260;
      }
      window.setTimeout(tick, delay);
    };
    tick();
    return this;
  }

  /**
   * About 页交互终端。
   * 输入：用户在 contenteditable 命令行中输入命令。
   * 输出：在终端输出区追加转义后的命令结果，避免 HTML 注入。
   */
  aboutTerminal() {
    const terminal = document.querySelector('.xv-about-v3-terminal');
    const output = document.querySelector('.xv-about-terminal-output');
    const input = document.querySelector('.xv-about-terminal-command');
    if (!terminal || !output || !input) return this;

    const prompt = 'blog@lpppp:~$';
    const commands = {
      help: [
        'available commands:',
        '  whoami          show current user',
        '  pwd             print current path',
        '  ls              list notebook sections',
        '  cat mission.txt show current mission',
        '  skills          print skill matrix',
        '  date            show local date',
        '  clear           clear terminal output',
        '  banner          redraw logo hint'
      ].join('\n'),
      whoami: 'lpppp',
      pwd: '/home/lpppp/blog',
      ls: 'web/  pwn/  crypto/  misc-dfir/  reverse/  blog-ops/',
      'cat mission.txt': '把每一次破题，炼成下一次破局的刀。\nreproduce -> exploit -> review -> archive',
      skills: [
        'Web Security  [#########.] 86%',
        'Misc / DFIR   [########..] 78%',
        'Crypto        [#######...] 72%',
        'Full-stack    [#######...] 70%',
        'Pwn / Binary  [######....] 68%',
        'Reverse       [######....] 64%'
      ].join('\n'),
      date: new Date().toLocaleString(),
      banner: 'lpppp terminal online. type: help'
    };

    const escapeHtml = (value) => value.replace(/[&<>]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[ch]));

    const appendBlock = (cmd, result) => {
      const block = document.createElement('div');
      block.className = 'xv-about-terminal-block';
      block.innerHTML = `<p><span>${prompt}</span> ${escapeHtml(cmd)}</p><pre>${escapeHtml(result)}</pre>`;
      output.appendChild(block);
      output.scrollTop = output.scrollHeight;
    };

    const runCommand = (raw) => {
      const cmd = raw.trim().replace(/\s+/g, ' ');
      if (!cmd) return;
      if (cmd === 'clear') {
        output.innerHTML = '';
        return;
      }
      const result = commands[cmd] || `command not found: ${cmd}\ntype 'help' for available commands`;
      appendBlock(cmd, result);
    };

    const setCaretToEnd = () => {
      input.focus({ preventScroll: true });
      const range = document.createRange();
      const selection = window.getSelection();
      range.selectNodeContents(input);
      range.collapse(false);
      selection.removeAllRanges();
      selection.addRange(range);
    };

    terminal.addEventListener('click', setCaretToEnd);

    input.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        runCommand(input.textContent || '');
        input.textContent = '';
        setCaretToEnd();
        return;
      }
      if (event.key === 'Tab') {
        event.preventDefault();
        const value = (input.textContent || '').trim();
        const hit = Object.keys(commands).find((cmd) => cmd.startsWith(value));
        if (hit) {
          input.textContent = hit;
          setCaretToEnd();
        }
      }
    });

    input.textContent = '';
    return this;
  }

  /**
   * 首页 GitHub snake 降级处理。
   * 输入：snake SVG 图片加载状态。
   * 输出：成功加载后隐藏提示；生成文件不存在时保留提示，避免页面出现破图不明原因。
   */
  homeSnakeFallback() {
    const card = document.querySelector('.xb-snake-card');
    const img = document.querySelector('.xb-snake-img');
    if (!card || !img) return this;

    const markReady = () => {
      card.classList.add('is-loaded');
      card.classList.remove('is-missing');
    };

    if (img.complete && img.naturalWidth > 0) {
      markReady();
    } else {
      img.addEventListener('load', markReady, { once: true });
      img.addEventListener('error', () => card.classList.add('is-missing'), { once: true });
    }
    return this;
  }

  /**
   * 首页动态时间入口。
   * 设计原则：
   * - 桌面端使用 requestAnimationFrame + 低频逻辑更新，避免 setInterval 高频空转。
   * - 移动端、弱性能设备、用户开启 reduced-motion 时只启用文本时间。
   * - 页面不可见时暂停动画，降低后台 CPU 占用。
   */
  homeClock() {
    const canvas = document.getElementById('xb-canvas-clock');
    const fallback = document.getElementById('xb-cyber-clock');
    if (!canvas || !fallback) return this;

    const shouldReduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isSmallScreen = window.matchMedia('(max-width: 780px)').matches;
    const canUseCanvas = Boolean(canvas.getContext);
    const useCanvas = canUseCanvas && !shouldReduceMotion && !isSmallScreen;

    const updateFallback = () => {
      const now = new Date();
      const time = now.toLocaleTimeString('zh-CN', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
      const date = now.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        weekday: 'short'
      });
      fallback.querySelector('.xb-cyber-clock__time').textContent = time;
      fallback.querySelector('.xb-cyber-clock__date').textContent = `${date} · Security Lab online`;
    };

    updateFallback();
    window.setInterval(updateFallback, 1000);

    // 桌面端启用 canvas 时隐藏 fallback；移动端隐藏 canvas 显示 fallback
    if (useCanvas) {
      fallback.classList.add('is-hidden');
      fallback.classList.remove('is-primary');
      canvas.classList.remove('is-disabled');
    } else {
      fallback.classList.remove('is-hidden');
      fallback.classList.add('is-primary');
      canvas.classList.add('is-disabled');
    }

    if (!useCanvas) {
      return this;
    }

    this.startCanvasClock(canvas);
    return this;
  }

  /**
   * 启动点阵弹球钟。
   * 输入：canvas 元素。
   * 输出：根据本地时间绘制 HH:MM:SS；数字变化时生成有限数量彩色粒子。
   */
  startCanvasClock(canvas) {
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const digit = [
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

    const palette = ['#ff7aa8', '#f472b6', '#d946ef', '#a78bfa', '#7c5cff', '#38bdf8'];
    const dataFromDate = () => new Date().toTimeString().slice(0, 8).replace(/:/g, 'A').split('').map((item) => item === 'A' ? 10 : Number(item));

    let data = dataFromDate();
    let balls = [];
    let animationId = 0;
    let lastLogicUpdate = 0;
    let paused = false;

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
      const rect = canvas.getBoundingClientRect();
      // 物理画布下限随视觉尺寸同步，避免模糊。
      canvas.width = Math.max(480, Math.floor(rect.width * ratio));
      canvas.height = Math.max(120, Math.floor(rect.height * ratio));
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    };

    // LED 点阵时钟风格：布局单元（unit）与绘制圆点半径（dotRadius）拆开。
    // unit 仍按容器高度/宽度推导；gap 控制点阵间距（更密集），dotRadius 控制圆点显示大小（更小更圆）。
    // NOTE: 保留 radius = dotRadius 以兼容 render() 中对 m.radius 的引用（粒子绘制）。
    const metrics = () => {
      const width = canvas.clientWidth || 660;
      const height = canvas.clientHeight || 160;
      // 先按高度算出理想单元大小，再检查宽度是否放得下所有数字 slot（HH:MM:SS = 8 slots）
      const idealByHeight = Math.max(4, Math.floor((height * 0.82) / 20) - 1);
      const maxByWidth = Math.max(4, Math.floor((width * 0.92) / (14 * data.length)) - 1);
      // unit：布局所需的单元大小。
      const unit = Math.min(idealByHeight, maxByWidth);
      // gap：相邻圆心距的一半。
      const gap = unit + 1;
      // dotRadius：实际绘制的圆点半径，略小于 gap 保持圆点间有缝隙。
      const dotRadius = Math.max(3, unit * 0.72);
      // digitWidth：单个字符占据的水平宽度；14 列 * (radius+2) 是经典公式，数字间距自然拉开。
      const digitWidth = 14 * (unit + 2);
      const totalWidth = digitWidth * data.length;
      const totalHeight = 20 * gap;
      const startX = Math.max(4, (width - totalWidth) / 2);
      const startY = Math.max(2, (height - totalHeight) / 2);
      // radius 字段保留，等于 dotRadius，用于粒子绘制等旧调用点
      return { width, height, unit, radius: dotRadius, dotRadius, gap, digitWidth, totalWidth, startX, startY };
    };

    const addBalls = (index, num) => {
      const m = metrics();
      for (let row = 0; row < digit[num].length; row++) {
        for (let col = 0; col < digit[num][row].length; col++) {
          if (digit[num][row][col] !== 1 || balls.length > 120) continue;
          balls.push({
            x: m.startX + m.digitWidth * index + col * 2 * m.gap + m.gap,
            y: m.startY + row * 2 * m.gap + m.gap,
            vx: Math.random() * 4 - 1.5,
            vy: -2 - Math.random() * 4,
            color: palette[Math.floor(Math.random() * palette.length)],
            gravity: 0.32
          });
        }
      }
    };

    const updateTime = () => {
      const next = dataFromDate();
      for (let i = data.length - 1; i >= 0; i--) {
        if (next[i] !== data[i]) addBalls(i, data[i]);
      }
      data = next;
    };

    const updateBalls = () => {
      const m = metrics();
      balls = balls.filter((ball) => {
        ball.vy += ball.gravity;
        ball.x += ball.vx;
        ball.y += ball.vy;
        return ball.x < m.width + 16 && ball.y < m.height + 24;
      });
    };

    const renderDigit = (index, num, m, time) => {
      // 整行横向线性渐变：从最左 HH 的粉 #ff3d88 过渡到最右 SS 的紫 #7c5cff。
      // 所有 slot 共用同一条渐变轴，因此"时 → 分 → 秒"形成肉眼可辨的粉→紫流光。
      // scan 仍由 time 驱动，做一次白色高光扫描，不污染底色。
      const gradient = ctx.createLinearGradient(m.startX, 0, m.startX + m.totalWidth, 0);
      gradient.addColorStop(0.00, '#ff3d88');
      gradient.addColorStop(0.18, '#ff5aa8');
      gradient.addColorStop(0.50, '#d946ef');
      gradient.addColorStop(0.82, '#a78bfa');
      gradient.addColorStop(1.00, '#7c5cff');

      // shadowBlur 收小以避免阴影糊掉相邻点的色差；shadowColor 固定为粉色调外发光。
      ctx.shadowBlur = Math.max(2, m.dotRadius * 0.8);
      ctx.shadowColor = 'rgba(255, 120, 200, 0.55)';
      ctx.fillStyle = gradient;

      // 第一遍：整字按渐变一次性铺底。
      for (let row = 0; row < digit[num].length; row++) {
        for (let col = 0; col < digit[num][row].length; col++) {
          if (digit[num][row][col] !== 1) continue;
          const x = m.startX + m.digitWidth * index + col * 2 * m.gap + m.gap;
          const y = m.startY + row * 2 * m.gap + m.gap;
          ctx.beginPath();
          ctx.arc(x, y, m.dotRadius, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.shadowBlur = 0;

      // 第二遍：半透明白色扫描高光。scan 为 [0,1] 归一化位置；仅提亮距离 < 0.08 的点。
      const axisWidth = Math.max(1, m.totalWidth);
      const scan = (time / 1800) % 1;
      ctx.globalAlpha = 0.6;
      ctx.fillStyle = '#fff3ff';
      for (let row = 0; row < digit[num].length; row++) {
        for (let col = 0; col < digit[num][row].length; col++) {
          if (digit[num][row][col] !== 1) continue;
          const x = m.startX + m.digitWidth * index + col * 2 * m.gap + m.gap;
          const p = (x - m.startX) / axisWidth;
          if (Math.abs(p - scan) >= 0.11) continue;
          const y = m.startY + row * 2 * m.gap + m.gap;
          ctx.beginPath();
          ctx.arc(x, y, m.dotRadius * 1.08, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
    };

    const render = (time = 0) => {
      const m = metrics();
      ctx.clearRect(0, 0, m.width, m.height);
      for (let i = 0; i < data.length; i++) renderDigit(i, data[i], m, time);
      for (const ball of balls) {
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, m.radius, 0, Math.PI * 2);
        ctx.fillStyle = ball.color;
        ctx.fill();
      }
    };

    const loop = (time) => {
      if (!paused) {
        if (time - lastLogicUpdate > 1000) {
          updateTime();
          lastLogicUpdate = time;
        }
        updateBalls();
        render(time);
      }
      animationId = window.requestAnimationFrame(loop);
    };

    resize();
    render();
    window.addEventListener('resize', resize, { passive: true });
    document.addEventListener('visibilitychange', () => {
      paused = document.hidden;
    });
    animationId = window.requestAnimationFrame(loop);

    // NOTE: 暴露轻量停止钩子，便于后续 PJAX 场景中避免重复动画。
    window.__xbStopCanvasClock = () => {
      window.cancelAnimationFrame(animationId);
      balls = [];
    };
  }

  /**
   * 首页下滑箭头：点击后平滑跳到文章列表，用户手动离开首屏后自动隐藏。
   * 目标优先选择第一篇文章摘要；没有文章时退回到主内容区底部。
   */
  homeScrollHint() {
    const hint = document.querySelector('.xb-scroll-hint');
    if (!hint) return this;

    const syncVisibility = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;
      hint.classList.toggle('is-hidden', scrollTop > 100);
    };

    hint.addEventListener('click', () => {
      const target = document.querySelector('.page.home .single.summary') || document.querySelector('.page.home.posts');
      if (!target) return;
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    syncVisibility();
    window.addEventListener('scroll', syncVisibility, { passive: true });
    document.addEventListener('scroll', syncVisibility, { passive: true });
    return this;
  }

  /**
   * 统一初始化入口。
   * 注意：所有功能都先检测 DOM，避免非目标页面执行重逻辑。
   */
  init() {
    this.hello();
    this.aboutTypewriter();
    this.aboutKickerTypewriter();
    this.aboutTerminal();
    this.homeSnakeFallback();
    this.homeClock();
    this.homeScrollHint();
    return this;
  }
}

(() => {
  window.fixitBlog = new FixItBlog();
  document.addEventListener('DOMContentLoaded', () => {
    window.fixitBlog.init();
  });
})();
