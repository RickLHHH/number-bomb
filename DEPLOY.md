# 🚀 数字炸弹 - 公网部署指南

让游戏可以在任何地方访问，随时随地和朋友对战！

## 📋 部署方案对比

| 方案 | 难度 | 成本 | 稳定性 | 适合场景 |
|------|------|------|--------|----------|
| [Railway](#方案一-railway-推荐) | ⭐ 简单 | 免费额度 | ⭐⭐⭐ | 快速部署，长期运行 |
| [Render](#方案二-render) | ⭐ 简单 | 免费 | ⭐⭐ | 简单快速，美国节点 |
| [云服务器](#方案三-云服务器) | ⭐⭐⭐ 中等 | 付费 | ⭐⭐⭐⭐⭐ | 国内访问，完全控制 |
| [内网穿透](#方案四-内网穿透-临时) | ⭐⭐ 较简单 | 免费 | ⭐ | 临时测试，快速体验 |

---

## 方案一：Railway（推荐）

Railway 提供免费额度，支持自定义域名，部署简单。

### 步骤

1. **Fork 或准备代码**
   - 将代码上传到 GitHub 仓库

2. **登录 Railway**
   - 访问 [railway.app](https://railway.app)
   - 使用 GitHub 账号登录

3. **创建项目**
   - 点击 "New Project"
   - 选择 "Deploy from GitHub repo"
   - 选择你的仓库

4. **部署**
   - Railway 会自动识别 `railway.json` 配置
   - 等待部署完成（约 2-3 分钟）

5. **获取域名**
   - 部署完成后，点击项目进入 Dashboard
   - 在 Settings 中可以看到分配的域名
   - 例如：`https://number-bomb-game-production.up.railway.app`

6. **分享游戏**
   - 将这个链接发给朋友即可一起玩！

### 注意事项
- 免费用户每月有 $5 额度限制
- 一段时间不访问会进入休眠，首次访问需要等待几秒唤醒

---

## 方案二：Render

Render 提供免费的 Web Service 托管。

### 步骤

1. **Fork 代码到 GitHub**

2. **登录 Render**
   - 访问 [render.com](https://render.com)
   - 使用 GitHub 登录

3. **创建 Web Service**
   - 点击 "New +" → "Web Service"
   - 选择你的 GitHub 仓库

4. **配置**
   - Name: `number-bomb-game`
   - Runtime: `Docker`
   - 其他保持默认

5. **创建**
   - 点击 "Create Web Service"
   - 等待部署完成

6. **获取链接**
   - 部署完成后会获得 `xxx.onrender.com` 域名

---

## 方案三：云服务器（国内推荐）

使用阿里云、腾讯云等国内云服务器，访问速度最快。

### 推荐配置
- **入门级**: 1核1GB 内存（约 30-50 元/月）
- **系统**: Ubuntu 20.04/22.04 LTS

### 部署步骤

1. **购买服务器并登录**
```bash
ssh root@你的服务器IP
```

2. **安装 Node.js 18**
```bash
# 安装 Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 验证安装
node -v  # 应显示 v18.x.x
npm -v
```

3. **上传代码**
```bash
# 方法一：使用 git
git clone https://github.com/你的用户名/number-bomb.git
cd number-bomb

# 方法二：手动上传后解压
# 使用 scp 或 FTP 上传 zip 文件
```

4. **安装依赖并启动**
```bash
npm install

# 使用 PM2 后台运行（推荐）
npm install -g pm2
pm2 start server.js --name "number-bomb"

# 或者直接用 node 运行（关闭终端会停止）
# npm start
```

5. **配置防火墙**
```bash
# 开放 3000 端口（或你自定义的端口）
sudo ufw allow 3000/tcp

# 如果使用阿里云/腾讯云，还需要在控制台安全组中开放端口
```

6. **访问游戏**
```
http://你的服务器IP:3000
```

### 进阶：使用 Nginx 反向代理 + 域名

如果你想使用域名（如 `game.yourdomain.com`）和 HTTPS：

```bash
# 安装 Nginx
sudo apt install nginx

# 编辑配置文件
sudo nano /etc/nginx/sites-available/number-bomb
```

添加配置：
```nginx
server {
    listen 80;
    server_name game.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        
        # WebSocket 支持
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

启用配置：
```bash
sudo ln -s /etc/nginx/sites-available/number-bomb /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# 配置 SSL（Let's Encrypt）
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d game.yourdomain.com
```

---

## 方案四：内网穿透（临时方案）

适合临时测试，无需购买服务器。

### 使用 ngrok（推荐）

1. **注册并下载 ngrok**
   - 访问 [ngrok.com](https://ngrok.com)
   - 注册账号，获取 Authtoken

2. **安装并配置**
```bash
# Mac
brew install ngrok

# Windows
# 下载 exe 并添加到 PATH

# Linux
wget https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-linux-amd64.tgz
tar xvzf ngrok-v3-stable-linux-amd64.tgz
sudo mv ngrok /usr/local/bin/
```

3. **配置 Authtoken**
```bash
ngrok config add-authtoken 你的token
```

4. **启动游戏服务器**
```bash
cd number-bomb
npm start
```

5. **开启内网穿透**
```bash
ngrok http 3000
```

6. **获取公网链接**
   - ngrok 会显示类似 `https://xxxx.ngrok-free.app` 的链接
   - 将这个链接发给朋友即可！

### 使用 cpolar（国内替代）

如果 ngrok 国内访问慢，可以用 cpolar：

```bash
# 安装
curl -L https://www.cpolar.com/static/downloads/install-release-cpolar.sh | sudo bash

# 登录（需先在网站注册）
cpolar authtoken 你的token

# 开启隧道
cpolar http 3000
```

---

## 🐳 Docker 部署

如果你熟悉 Docker，可以用容器方式部署：

```bash
# 构建镜像
docker build -t number-bomb .

# 运行容器
docker run -d -p 3000:3000 --name number-bomb-game number-bomb

# 查看日志
docker logs -f number-bomb-game

# 停止
docker stop number-bomb-game
```

### Docker Compose（推荐）

创建 `docker-compose.yml`：

```yaml
version: '3.8'

services:
  number-bomb:
    build: .
    container_name: number-bomb-game
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:3000/"]
      interval: 30s
      timeout: 10s
      retries: 3
```

运行：
```bash
docker-compose up -d
docker-compose logs -f
```

---

## 🔍 故障排查

### WebSocket 连接失败

1. **检查防火墙**
   - 确保服务器防火墙已开放对应端口
   - 云服务器需要在安全组中放行端口

2. **检查 HTTPS**
   - 如果网页是 HTTPS，WebSocket 必须使用 WSS
   - 确保服务器配置了 SSL（或使用平台的自动 SSL）

3. **查看服务器日志**
```bash
# 如果使用 PM2
pm2 logs number-bomb

# 如果使用 Docker
docker logs number-bomb-game

# 直接运行
npm start
```

### 部署后页面空白

- 检查服务器是否正确运行：`curl http://localhost:3000`
- 检查端口是否正确映射
- 查看浏览器控制台报错信息

### 房间创建成功但朋友无法加入

- 确保使用的是**同一个**链接
- 检查网络连接是否正常
- 某些企业网络可能会阻止 WebSocket，尝试切换网络（如手机热点）

---

## 📱 快速开始检查清单

部署完成后，按以下步骤验证：

- [ ] 访问你的公网链接，能看到游戏首页
- [ ] 点击"创建房间"，成功显示6位房间号
- [ ] 用另一台设备（或手机流量）打开相同链接
- [ ] 输入房间号加入，房主能看到"玩家2已加入"
- [ ] 双方设置数字后，游戏正常开始
- [ ] 能正常猜测并看到对方的结果

全部通过，恭喜你部署成功！🎉

---

## 💡 提示

1. **免费服务限制**
   - Railway/Render 免费版会在一段时间不活动后休眠
   - 首次访问可能需要等待几秒唤醒

2. **国内访问优化**
   - 如果部署在国外，国内访问可能较慢
   - 建议使用国内云服务器或开启 CDN

3. **数据安全**
   - 本游戏不存储任何数据，房间会在所有人离开后自动清理
   - 不要在不信任的网络中输入敏感数字

4. **更多功能**
   - 欢迎提交 Issue 或 PR 添加新功能
   - 建议功能：观战模式、排行榜、AI 对战等
