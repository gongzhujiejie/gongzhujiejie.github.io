# 友链


<!-- friends-v3-glass-20260602 -->

<div class="xv-friends">
<section class="xv-friends-list" aria-label="友情链接">
<h2>朋友们</h2>

{{< friends >}}

</section>

<section class="xv-friends-intro" aria-label="本站信息">
<h2>本站信息</h2>
<p>欢迎交换友链，添加前请先把本站加入你的友链列表，信息如下：</p>
<pre class="xv-friends-card-code">name: lpppp
link: https://lpppp.xyz/
description: Success is not accidental, but has always been a habit.
avatar: https://lpppp.xyz/images/avatar.png</pre>
</section>
</div>

<style>
.xv-friends { display: flex; flex-direction: column; gap: 32px; }
.xv-friends h2 { margin: 0 0 14px; }
.xv-friends-intro p { color: var(--global-font-secondary-color, #888); margin: 0 0 12px; }
.xv-friends-card-code {
  background: var(--code-background-color, #f5f5f5);
  border-radius: 10px;
  padding: 14px 16px;
  font-size: 13px;
  line-height: 1.7;
  overflow-x: auto;
}

/* ---------- 毛玻璃渐变友链卡片 ---------- */
.xv-friends-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 18px;
}
.xv-friend-card {
  position: relative;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 18px;
  border-radius: 16px;
  overflow: hidden;
  text-decoration: none !important;
  isolation: isolate;
  /* 半透明磨砂背景 */
  background: color-mix(in srgb, var(--global-background-color, #fff) 62%, transparent);
  backdrop-filter: blur(10px) saturate(140%);
  -webkit-backdrop-filter: blur(10px) saturate(140%);
  /* 渐变描边：用 border + gradient 背景裁切实现柔和彩边 */
  border: 1px solid transparent;
  background-clip: padding-box;
  box-shadow: 0 4px 14px rgba(0, 0, 0, .06);
  transition: transform .22s ease, box-shadow .22s ease;
}
/* 渐变描边层 */
.xv-friend-card::before {
  content: "";
  position: absolute;
  inset: 0;
  padding: 1px;
  border-radius: inherit;
  background: linear-gradient(135deg, #a78bfa, #ec4899 45%, #38bdf8);
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  -webkit-mask-composite: xor;
          mask-composite: exclude;
  opacity: .5;
  transition: opacity .22s ease;
  z-index: -1;
}
.xv-friend-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 28px rgba(120, 80, 220, .22);
}
.xv-friend-card:hover::before { opacity: 1; }
/* hover 发光光斑 */
.xv-friend-glow {
  position: absolute;
  top: -40%;
  left: -30%;
  width: 160px;
  height: 160px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(236, 72, 153, .35), transparent 70%);
  opacity: 0;
  transition: opacity .3s ease, transform .5s ease;
  pointer-events: none;
  z-index: -1;
}
.xv-friend-card:hover .xv-friend-glow {
  opacity: 1;
  transform: translate(30px, 30px);
}
.xv-friend-avatar {
  flex: 0 0 auto;
  width: 54px;
  height: 54px;
  border-radius: 50%;
  overflow: hidden;
  background: color-mix(in srgb, var(--global-font-color, #333) 8%, transparent);
  box-shadow: 0 0 0 2px color-mix(in srgb, #a78bfa 40%, transparent);
}
.xv-friend-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.xv-friend-meta { display: flex; flex-direction: column; gap: 5px; min-width: 0; }
.xv-friend-name {
  color: var(--global-font-color, #303030);
  font-size: 15.5px;
  font-weight: 600;
  line-height: 1.2;
}
.xv-friend-desc {
  color: var(--global-font-secondary-color, #888);
  font-size: 12.5px;
  line-height: 1.5;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

/* 空状态占位 */
.xv-friends-empty {
  grid-column: 1 / -1;
  text-align: center;
  padding: 40px 20px;
  border-radius: 16px;
  border: 1px dashed var(--global-border-color, #e2e2e2);
  color: var(--global-font-secondary-color, #999);
}
.xv-friends-empty-emoji { font-size: 34px; display: block; margin-bottom: 8px; }
.xv-friends-empty p { margin: 0; font-size: 14px; }
</style>


---

> 作者: [lpppp](/)  
> URL: https://lpppp.xyz/friends/  

