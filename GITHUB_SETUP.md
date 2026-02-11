# GitHub 设置步骤

## 1. 创建仓库后，你会看到如下提示：

```bash
# 或者从命令行推送现有仓库
git remote add origin https://github.com/你的用户名/number-bomb.git
git branch -M main
git push -u origin main
```

## 2. 在项目目录执行上述命令：

打开终端，进入项目目录：
```bash
cd /Users/linghuchangjian/number-bomb
```

然后执行（替换为你的用户名和仓库名）：
```bash
git remote add origin https://github.com/你的用户名/number-bomb.git
git branch -M main
git push -u origin main
```

## 3. 验证推送成功

访问 `https://github.com/你的用户名/number-bomb` 应该能看到所有文件。

## 4. Railway 部署

1. 访问 https://railway.app/dashboard
2. 点击 "New Project"
3. 选择 "Deploy from GitHub repo"
4. 选择你的 `number-bomb` 仓库
5. 点击 "Deploy Now"

Railway 会自动识别 `railway.json` 和 `Dockerfile` 进行部署。

## 5. 获取域名

部署完成后：
1. 点击项目进入 Dashboard
2. 在右侧找到 "Domains" 或 "Settings"
3. 你会看到类似 `https://number-bomb-production-xxx.up.railway.app` 的链接
4. 这个链接就是你的游戏地址！
