# GitHub 推送指南

## 📋 前置要求

1. **安装 Git**（如果还没安装）
   - 下载地址：https://git-scm.com/download/win
   - 安装后重启终端

2. **创建 GitHub 账号**（如果还没有）
   - 访问：https://github.com
   - 注册账号

3. **创建 GitHub 仓库**
   - 登录 GitHub
   - 点击右上角 "+" → "New repository"
   - 输入仓库名称（例如：`yueji-shouzhang`）
   - 选择 **Public** 或 **Private**
   - **不要**勾选 "Initialize this repository with a README"（因为本地已有代码）
   - 点击 "Create repository"

## 🚀 推送步骤

### 方法 1：使用命令行（推荐）

**注意**：由于项目路径包含中文字符，建议在项目根目录打开 PowerShell 或 Git Bash。

#### 步骤 1：打开终端

在项目文件夹中，右键点击空白处，选择：
- **"Git Bash Here"**（如果安装了 Git）
- 或 **"在终端中打开"**（Windows 11）

#### 步骤 2：初始化 Git 仓库

```bash
# 检查是否已初始化
git status

# 如果显示 "not a git repository"，执行：
git init
```

#### 步骤 3：添加所有文件

```bash
# 添加所有文件（.gitignore 会自动排除不需要的文件）
git add .

# 检查要提交的文件
git status
```

#### 步骤 4：创建初始提交

```bash
git commit -m "init project"
```

#### 步骤 5：设置主分支为 main

```bash
git branch -M main
```

#### 步骤 6：添加远程仓库

**替换下面的 URL 为你的实际仓库地址**：

```bash
# 格式：https://github.com/你的用户名/仓库名.git
# 例如：
git remote add origin https://github.com/your-username/yueji-shouzhang.git
```

**如何获取仓库地址**：
1. 打开你的 GitHub 仓库页面
2. 点击绿色的 "Code" 按钮
3. 复制 HTTPS 地址

#### 步骤 7：推送到 GitHub

```bash
git push -u origin main
```

**如果这是第一次推送，可能会要求输入 GitHub 用户名和密码**：
- 用户名：你的 GitHub 用户名
- 密码：需要使用 **Personal Access Token**（不是 GitHub 密码）

**如何创建 Personal Access Token**：
1. GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. 点击 "Generate new token (classic)"
3. 设置名称和过期时间
4. 勾选 `repo` 权限
5. 点击 "Generate token"
6. **复制生成的 token**（只显示一次！）
7. 在推送时，密码处粘贴这个 token

### 方法 2：使用 GitHub Desktop（图形界面，更简单）

1. **下载 GitHub Desktop**
   - 访问：https://desktop.github.com
   - 下载并安装

2. **登录 GitHub**
   - 打开 GitHub Desktop
   - 登录你的 GitHub 账号

3. **添加本地仓库**
   - File → Add Local Repository
   - 选择项目文件夹
   - 点击 "Add repository"

4. **提交并推送**
   - 在左侧会显示所有更改的文件
   - 在底部输入提交信息："init project"
   - 点击 "Commit to main"
   - 点击 "Publish repository"
   - 输入仓库名称，选择 Public/Private
   - 点击 "Publish Repository"

## ✅ 验证推送成功

1. 打开你的 GitHub 仓库页面
2. 应该能看到所有项目文件
3. 包括：
   - `package.json`
   - `README.md`
   - `src/` 目录
   - `public/` 目录
   - 等等

## 🔒 重要：保护敏感信息

在推送之前，确保以下文件**不会被提交**（已在 `.gitignore` 中）：

- ✅ `.env.local` - 包含 API 密钥
- ✅ `node_modules/` - 依赖包
- ✅ `dist/` - 构建输出

**检查方法**：
```bash
git status
```

如果看到 `.env.local` 或 `node_modules`，说明 `.gitignore` 没有生效。

## 🐛 常见问题

### Q: 提示 "git: command not found"

**A**: Git 没有安装或不在 PATH 中
- 安装 Git：https://git-scm.com/download/win
- 安装后重启终端

### Q: 提示 "remote origin already exists"

**A**: 已经添加过远程仓库
```bash
# 查看现有远程仓库
git remote -v

# 如果需要修改，先删除再添加
git remote remove origin
git remote add origin https://github.com/你的用户名/仓库名.git
```

### Q: 推送时提示 "Authentication failed"

**A**: 需要使用 Personal Access Token
- 参考上面的 "如何创建 Personal Access Token" 部分
- 或者使用 SSH 密钥（更安全，但设置更复杂）

### Q: 提示 "fatal: refusing to merge unrelated histories"

**A**: 本地和远程仓库历史不相关
```bash
git pull origin main --allow-unrelated-histories
git push -u origin main
```

### Q: 路径包含中文导致问题

**A**: 使用 Git Bash 而不是 PowerShell，或者：
1. 在项目文件夹中右键 → "Git Bash Here"
2. 执行所有 Git 命令

## 📝 后续更新代码

推送成功后，以后更新代码的步骤：

```bash
# 1. 查看更改
git status

# 2. 添加更改的文件
git add .

# 3. 提交更改
git commit -m "描述你的更改"

# 4. 推送到 GitHub
git push
```

## 🎯 下一步

推送成功后，你可以：

1. **在 Vercel 部署**（参考 `DEPLOY.md`）
2. **分享仓库链接**给其他人
3. **继续开发**，定期提交和推送

---

**提示**：如果遇到任何问题，可以：
- 查看 Git 官方文档：https://git-scm.com/doc
- 查看 GitHub 帮助：https://docs.github.com


