/*!
 * 文件：pagefind-modal.js
 * 用途：为站点顶部搜索按钮提供全局 Pagefind 搜索弹窗
 *       - 将触发按钮挂载到 header（桌面端 theme-switch 前，移动端 menu-system 首项）
 *       - 首次打开时懒加载 /pagefind/pagefind-ui.css 与 /pagefind/pagefind-ui.js
 *       - 实例化 PagefindUI 到 modal 容器，仅初始化一次
 *       - 支持按 Escape 与点击背景/关闭按钮关闭
 * 修改日期：2026-05-07
 * 语言：ES2017+，无任何第三方依赖
 * 合法授权学习使用，仅限本地环境
 */

(function () {
  'use strict';

  // ============== 常量定义 ==============
  // NOTE: Pagefind 资源发布在站点根 /pagefind 目录
  // 使用绝对路径，避免子页面（如 /about/）拼出错误的相对路径
  var PAGEFIND_CSS = '/pagefind/pagefind-ui.css';
  var PAGEFIND_JS = '/pagefind/pagefind-ui.js';

  // 关键元素 id，统一集中便于维护
  var TRIGGER_ID = 'xb-pagefind-trigger';
  var MODAL_ID = 'xb-pagefind-modal';
  var SEARCH_MOUNT_ID = 'xb-pagefind-modal-search';
  var SLOT_ID = 'xb-pagefind-trigger-slot';

  // body 背景滚动锁定类
  var BODY_LOCK_CLASS = 'xb-pagefind-locked';
  // modal 打开态类
  var MODAL_OPEN_CLASS = 'is-open';
  // 触发按钮在无挂载点时的浮动态类
  var FLOATING_CLASS = 'is-floating';

  // ============== 状态缓存 ==============
  // isReady：Pagefind 资源与 UI 是否已实例化
  var isReady = false;
  // 防止重复懒加载的 Promise 缓存
  var loadPromise = null;

  // ====================================================
  // 函数：ensureDesktopSlot
  // 说明：在桌面端 header 的 theme-switch 之前创建插槽（<li>）
  //       与 translate.html 使用同样的挂载方式，保持视觉一致
  // 返回：挂载元素；找不到则返回 null
  // ====================================================
  function ensureDesktopSlot() {
    var existed = document.getElementById(SLOT_ID);
    if (existed) return existed;

    var themeSwitch = document.querySelector('#header-desktop .menu > .theme-switch');
    if (!themeSwitch || !themeSwitch.parentNode) return null;

    var slot = document.createElement('li');
    slot.id = SLOT_ID;
    slot.className = 'menu-item menu-pagefind';
    themeSwitch.parentNode.insertBefore(slot, themeSwitch);
    return slot;
  }

  // ====================================================
  // 函数：ensureMobileSlot
  // 说明：在移动端 header 的 menu-system 中创建首项插槽（<span>）
  // 返回：挂载元素；找不到则返回 null
  // ====================================================
  function ensureMobileSlot() {
    var existed = document.getElementById(SLOT_ID);
    if (existed) return existed;

    var mobileSystem = document.querySelector('#header-mobile .menu-system');
    if (!mobileSystem) return null;

    var slot = document.createElement('span');
    slot.id = SLOT_ID;
    slot.className = 'menu-system-item menu-pagefind';
    mobileSystem.insertBefore(slot, mobileSystem.firstChild);
    return slot;
  }

  // ====================================================
  // 函数：mountTrigger
  // 说明：把触发按钮从 body 底部移动到 header 对应槽位
  //       若找不到任何挂载点则启用 floating 兜底样式
  // ====================================================
  function mountTrigger() {
    var trigger = document.getElementById(TRIGGER_ID);
    if (!trigger) return;

    // NOTE: 根据视口宽度优先选择挂载策略，移动端优先 menu-system
    var useMobile = window.matchMedia && window.matchMedia('(max-width: 680px)').matches;
    var slot = useMobile
      ? (ensureMobileSlot() || ensureDesktopSlot())
      : (ensureDesktopSlot() || ensureMobileSlot());

    if (!slot) {
      // 挂载点缺失：按钮保持在原位置并切换为浮动样式
      trigger.classList.add(FLOATING_CLASS);
      return;
    }

    if (slot.contains(trigger)) return;

    trigger.classList.remove(FLOATING_CLASS);
    slot.appendChild(trigger);
  }

  // ====================================================
  // 函数：loadAsset
  // 说明：按需注入外部 CSS / JS，返回 Promise
  // 参数：url - 资源地址；type - 'css' | 'js'
  // 返回：加载完成的 Promise
  // ====================================================
  function loadAsset(url, type) {
    return new Promise(function (resolve, reject) {
      var existed;
      if (type === 'css') {
        existed = document.querySelector('link[data-xb-pagefind="' + url + '"]');
        if (existed) return resolve();

        var link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = url;
        link.setAttribute('data-xb-pagefind', url);
        link.onload = function () { resolve(); };
        link.onerror = function () { reject(new Error('load css failed: ' + url)); };
        document.head.appendChild(link);
      } else {
        existed = document.querySelector('script[data-xb-pagefind="' + url + '"]');
        if (existed) {
          if (existed.dataset.loaded === '1') return resolve();
          existed.addEventListener('load', function () { resolve(); }, { once: true });
          existed.addEventListener('error', function () { reject(new Error('load js failed: ' + url)); }, { once: true });
          return;
        }

        var script = document.createElement('script');
        script.src = url;
        script.setAttribute('data-xb-pagefind', url);
        // NOTE: Pagefind UI 脚本依赖执行顺序，这里不加 defer，直接等待 load 回调
        script.onload = function () {
          script.dataset.loaded = '1';
          resolve();
        };
        script.onerror = function () { reject(new Error('load js failed: ' + url)); };
        document.body.appendChild(script);
      }
    });
  }

  // ====================================================
  // 函数：ensurePagefind
  // 说明：懒加载 Pagefind CSS 与 JS，并实例化 PagefindUI 到 modal
  // 返回：初始化完成的 Promise
  // ====================================================
  function ensurePagefind() {
    if (isReady) return Promise.resolve();
    if (loadPromise) return loadPromise;

    loadPromise = loadAsset(PAGEFIND_CSS, 'css')
      .then(function () { return loadAsset(PAGEFIND_JS, 'js'); })
      .then(function () {
        // PagefindUI 由外部脚本挂到 window 上
        if (typeof window.PagefindUI !== 'function') {
          throw new Error('PagefindUI not available');
        }

        // 实例化 Pagefind UI，只执行一次
        // eslint-disable-next-line no-new
        new window.PagefindUI({
          element: '#' + SEARCH_MOUNT_ID,
          showSubResults: true,
          showImages: false,
          excerptLength: 24,
          translations: {
            placeholder: '搜索文章 / CTF / Web / Pwn / Crypto / Misc',
            zero_results: '没有找到匹配结果',
            clear_search: '清空搜索'
          }
        });

        isReady = true;
      })
      .catch(function (err) {
        // 失败时清空 Promise 以便下次重试
        loadPromise = null;
        console.warn('[xb-pagefind] init failed:', err);
        throw err;
      });

    return loadPromise;
  }

  // ====================================================
  // 函数：focusInput
  // 说明：延迟把焦点交给搜索框，避免渲染未完成时丢焦
  // ====================================================
  function focusInput() {
    setTimeout(function () {
      var modal = document.getElementById(MODAL_ID);
      if (!modal) return;

      var input = modal.querySelector('.pagefind-ui__search-input');
      if (input) {
        input.focus();
        return;
      }

      // Pagefind 未完成渲染时回退到面板容器
      var panel = modal.querySelector('.xb-pagefind-panel');
      if (panel) panel.focus();
    }, 50);
  }

  // ====================================================
  // 函数：open
  // 说明：打开 modal，首次会触发懒加载
  // ====================================================
  function open() {
    var modal = document.getElementById(MODAL_ID);
    if (!modal) return;

    modal.classList.add(MODAL_OPEN_CLASS);
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add(BODY_LOCK_CLASS);

    ensurePagefind()
      .then(focusInput)
      .catch(function () {
        // 加载失败时也尽量把焦点放到面板，避免焦点丢失
        focusInput();
      });
  }

  // ====================================================
  // 函数：close
  // 说明：关闭 modal，恢复 body 滚动
  // ====================================================
  function close() {
    var modal = document.getElementById(MODAL_ID);
    if (!modal) return;

    modal.classList.remove(MODAL_OPEN_CLASS);
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove(BODY_LOCK_CLASS);
  }

  // ====================================================
  // 函数：bindEvents
  // 说明：绑定触发按钮、关闭控件、Escape 键等事件
  // ====================================================
  function bindEvents() {
    // 触发按钮点击 → 打开
    document.addEventListener('click', function (evt) {
      var trigger = evt.target.closest && evt.target.closest('#' + TRIGGER_ID);
      if (trigger) {
        evt.preventDefault();
        open();
        return;
      }

      // 任意带有 data-xb-pagefind-close 的元素 → 关闭
      var closer = evt.target.closest && evt.target.closest('[data-xb-pagefind-close="true"]');
      if (closer) {
        evt.preventDefault();
        close();
      }
    });

    // Escape 键关闭
    document.addEventListener('keydown', function (evt) {
      if (evt.key !== 'Escape') return;
      var modal = document.getElementById(MODAL_ID);
      if (modal && modal.classList.contains(MODAL_OPEN_CLASS)) {
        close();
      }
    });
  }

  // ====================================================
  // 函数：ready
  // 说明：DOM Ready 后完成挂载与事件绑定
  // ====================================================
  function ready() {
    mountTrigger();
    bindEvents();

    // NOTE: 视口变化时重新挂载，兼容桌面/移动切换
    window.addEventListener('resize', function () {
      window.clearTimeout(window.__xbPagefindResizeTimer);
      window.__xbPagefindResizeTimer = window.setTimeout(mountTrigger, 120);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', ready, { once: true });
  } else {
    ready();
  }

  // 暴露全局 API，便于其他脚本/控制台调用
  window.XbPagefind = {
    open: open,
    close: close,
    isReady: function () { return isReady; }
  };
})();
