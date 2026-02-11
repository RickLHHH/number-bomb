#!/bin/bash

echo "🚀 使用 Token 推送到 GitHub"
echo "=========================="
echo ""

cd /Users/linghuchangjian/number-bomb

# 询问信息
read -p "请输入你的 GitHub 用户名: " username
read -p "请输入仓库名 (默认: number-bomb): " reponame
reponame=${reponame:-number-bomb}

echo ""
echo "🔐 请输入 Personal Access Token（输入时不会显示）"
echo "   获取地址: https://github.com/settings/tokens"
read -s token

echo ""
echo "📤 正在推送到 GitHub..."
echo ""

# 设置远程仓库（使用 token 认证）
git remote remove origin 2>/dev/null
git remote add origin "https://${username}:${token}@github.com/${username}/${reponame}.git"
git branch -M main

# 推送
if git push -u origin main; then
    echo ""
    echo "✅ 推送成功！"
    echo ""
    echo "🌐 仓库地址: https://github.com/${username}/${reponame}"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "下一步：Railway 部署"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "1. 访问 https://railway.app/dashboard"
    echo "2. 点击 'New Project'"
    echo "3. 选择 'Deploy from GitHub repo'"
    echo "4. 选择 ${reponame} 仓库"
    echo "5. 点击 'Deploy Now'"
    echo ""
    echo "等待 2-3 分钟后，复制生成的链接即可！"
    echo ""
else
    echo ""
    echo "❌ 推送失败"
    echo ""
    echo "可能原因："
    echo "   1. Token 输入错误（注意没有空格）"
    echo "   2. Token 没有 repo 权限"
    echo "   3. 仓库名拼写错误"
    echo ""
    echo "请重新运行脚本，或检查 Token 设置"
fi

# 清除 token（安全）
git remote remove origin 2>/dev/null
git remote add origin "https://github.com/${username}/${reponame}.git"
