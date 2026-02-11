#!/bin/bash

echo "🚀 推送到 GitHub"
echo "==============="
echo ""

cd /Users/linghuchangjian/number-bomb

# 询问用户名
read -p "请输入你的 GitHub 用户名: " username
read -p "请输入仓库名 (默认: number-bomb): " reponame
reponame=${reponame:-number-bomb}

echo ""
echo "📤 推送到 https://github.com/$username/$reponame ..."
echo ""

# 设置远程仓库
git remote remove origin 2>/dev/null
git remote add origin "https://github.com/$username/$reponame.git"
git branch -M main

# 推送
if git push -u origin main; then
    echo ""
    echo "✅ 推送成功！"
    echo ""
    echo "🌐 仓库地址: https://github.com/$username/$reponame"
    echo ""
    echo "下一步：访问 Railway 部署"
    echo "   https://railway.app/new"
    echo ""
    echo "选择 'Deploy from GitHub repo' 并选择 $reponame"
else
    echo ""
    echo "❌ 推送失败，请检查："
    echo "   1. GitHub 用户名是否正确"
    echo "   2. 仓库是否已创建"
    echo "   3. 网络连接是否正常"
fi
