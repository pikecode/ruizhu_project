# 🚀 安装快速参考

## 一键安装依赖

### 推荐方式 (所有平台)
```bash
npm run install:all
```

### 或使用脚本

**macOS/Linux:**
```bash
./install-all.sh
```

**Windows PowerShell:**
```powershell
powershell -ExecutionPolicy Bypass -File install-all.ps1
```

**Windows CMD:**
```cmd
install-all.bat
```

---

## 单独安装

```bash
npm run install:backend      # 只安装后端
npm run install:miniprogram  # 只安装小程序
npm run install:admin        # 只安装管理后台
```

---

## 启动服务

```bash
npm start                   # 启动所有服务
npm run dev:backend         # 启动后端 (localhost:3000)
npm run dev:miniprogram     # 启动小程序 (localhost:5173)
npm run dev:admin           # 启动管理后台 (localhost:5174)
```

---

## 数据库设置

```bash
npm run setup:database      # 初始化数据库
```

---

## 常见问题

**安装卡住?**
```bash
npm cache clean --force && npm run install:all
```

**权限错误?** (Linux/macOS)
```bash
chmod +x install-all.sh && ./install-all.sh
```

**查看详细说明:**
```bash
cat INSTALL.md
```

---

✅ 更多信息见 [INSTALL.md](./INSTALL.md)
