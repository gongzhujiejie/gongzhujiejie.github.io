---
title: "加密示例"
date: 2026-04-28T00:00:00+08:00
lastmod: 2026-04-28T00:00:00+08:00
draft: false
description: "演示整页加密与段落加密"
keywords: ["加密", "隐私"]
categories:
  - 示例
tags:
  - 加密
toc:
  enable: true
  auto: true
comment: false
# NOTE: 整页加密 —— 填写此处即锁全文
password: "1234"
# message: "请输入密码查看全文"
summary: "加密测试" 
typeit: true
---

## 公开内容

这段文字对所有访客可见，用于演示"段落加密"。

## 下面是加密块

{{% fixit-encryptor "demo-password" "请输入密码解锁本段" %}}

这段内容只有输入 `demo-password` 才能查看。

- 支持 **Markdown**
- 支持代码块
- 支持图片

```bash
# 解锁后才能看到这条命令
echo "hello secret"
```

{{% /fixit-encryptor %}}

## 公开续段

段落加密后，后面的内容仍然对外可见。
