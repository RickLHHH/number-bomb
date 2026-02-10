#!/bin/bash

echo "🚀 数字炸弹 - Railway 部署助手"
echo "==============================="
echo ""

# 检查是否已配置 git
if ! git config --global user.email > /dev/null 2>&1; then
    echo "⚠️ 请先配置 Git 用户信息："
    echo "   git config --global user.email \"你的邮箱@example.com\""
    echo "   git config --global user.name \"你的名字\""
    echo ""
fi

# 初始化仓库
if [ ! -d ".git" ]; then
    echo "📦 初始化 Git 仓库..."
    git init
fi

# 添加文件
echo "📁 添加文件到仓库..."
git add .

# 检查是否有变更
if git diff --cached --quiet; then
    echo "✅ 没有新的变更需要提交"
else
    echo "💾 提交变更..."
    git commit -m "Initial commit: Number Bomb Game ready for Railway deploy"
    echo "✅ 提交完成"
fi

echo ""
echo "==============================="
echo "下一步操作："
echo ""
echo "1. 在 GitHub 创建新仓库（不要初始化 README）"
echo "   访问: https://github.com/new"
echo ""
echo "2. 创建后，运行以下命令关联并推送："
echo "   git remote add origin https://github.com/你的用户名/仓库名.git"
echo "   git branch -M main"
echo "   git push -u origin main"
echo ""
echo "3. 然后访问 Railway 部署："
echo "   https://railway.app"
echo ""
