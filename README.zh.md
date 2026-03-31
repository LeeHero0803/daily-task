# The Daily Task

轻量、完全本地的 Todo 与定期事项管理工具。所有数据以纯 JSON 格式存储在本机，无需账号、无云同步、无第三方依赖。

[English →](README.md)

## 技术栈

| 层 | 选型 |
|---|---|
| 后端 | Python + FastAPI + uvicorn，纯 JSON 文件持久化 |
| 前端 | React 19 + TypeScript + Vite + Tailwind CSS v3 |
| 字体 | Playfair Display（衬线标题）、Lora（正文）、JetBrains Mono（等宽） |
| 图片导出 | html-to-image（toPng） |

## 功能

**任务管理**
- 添加任务，可选截止日期（精确到分钟）和标签
- 按状态（全部 / 待办 / 已完成）和标签筛选
- 截止日期显示相对时间（Today / 3d / 2w / 1d ago），右侧显示完整日期
- 过期任务红色高亮
- 行内编辑，表单状态跨提交保留
- Hover 时编辑/删除按钮以绝对定位覆盖，不挤压右侧内容

**定期事项**
- 支持每年 / 每月 / 每周三种重复类型
- 可配置提前提醒天数，临近时高亮显示
- 按最近发生日期排序
- 行内编辑

**日历**
- 月视图：7 列网格，点击日期展开当日事项详情
- 年视图：4×3 小月历，点击跳转对应月份
- 月度收据导出：热敏小票风格长图，flex 布局保证数字右对齐，通过 html-to-image 导出为 PNG

**全局**
- 深色/亮色模式，基于 CSS 自定义属性（切换 `html.dark` 类），所有组件自动适配
- 任务与定期事项共享标签系统，TagPicker 支持行内新建标签
- 当前 Tab 持久化到 localStorage，删除操作后不跳回首页
- Favicon：报纸风格 SVG，纸色背景 + 墨色衬线 T

## 环境要求

- **Python 3.11+** — [python.org](https://www.python.org/downloads/)
- **Node.js 18+** — [nodejs.org](https://nodejs.org/)
- **uv**（推荐的 Python 包管理器）— 或直接用 `pip`

## 首次安装

### 1. 安装后端依赖

```bash
cd backend
pip install fastapi "uvicorn[standard]"
```

或使用 uv：

```bash
cd backend
uv sync
```

### 2. 安装前端依赖

```bash
cd frontend
npm install
```

### 3. 安装根目录开发依赖（用于 `npm start`）

```bash
# 在项目根目录
npm install
```

## 启动方式

### Windows — 双击启动

双击项目根目录的 **`launch.bat`**，它会：

1. 以隐藏后台进程的方式启动后端（端口 8000）和前端（端口 5173）
2. 等待几秒后自动在浏览器打开 `http://localhost:5173`
3. 显示一个控制台窗口 — 在其中按任意键可停止所有服务

日志写入 `logs/backend.log` 和 `logs/frontend.log`。

### Linux / macOS — 终端

```bash
./start.sh
```

按 `Ctrl+C` 停止所有服务。

### 全平台 — npm

```bash
# 在项目根目录
npm start
```

然后打开 `http://localhost:5173`。

## 数据存储

数据以纯 JSON 格式保存在 `backend/data/`：

| 文件 | 内容 |
|------|------|
| `todos.json` | 所有任务（标题、截止日期、标签、完成状态） |
| `recurring.json` | 定期事项（生日等） |

首次运行时自动创建，可自行备份或同步。

## 目录结构

```
todo/
├── launch.bat              # Windows 启动器（双击运行）
├── _start_servers.ps1      # 由 launch.bat 调用 — 以隐藏窗口启动进程
├── _run_backend.bat        # 由 _start_servers.ps1 调用 — 启动 uvicorn，日志重定向
├── _run_frontend.bat       # 由 _start_servers.ps1 调用 — 启动 Vite，日志重定向
├── start.sh                # Linux/macOS 启动器
├── package.json            # 根目录 npm start（使用 concurrently）
├── logs/                   # 运行日志（已加入 .gitignore）
│
├── backend/
│   ├── main.py             # FastAPI 应用 — /api/todos 和 /api/recurring 的 CRUD 接口
│   ├── pyproject.toml      # Python 依赖声明
│   └── data/               # JSON 数据文件（已加入 .gitignore）
│       ├── todos.json
│       └── recurring.json
│
└── frontend/
    ├── public/favicon.svg
    ├── index.html
    └── src/
        ├── App.tsx                     # 根组件，数据加载、Tab 路由、深色模式
        ├── api.ts                      # HTTP 请求封装
        ├── types.ts                    # Todo / RecurringEvent 类型定义
        ├── index.css                   # CSS 变量、全局样式、点阵背景
        ├── utils/dateUtils.ts          # 日期格式化与定期事项工具函数
        └── components/
            ├── Header.tsx              # 报头、标签页、深色模式切换
            ├── TodoView.tsx            # 任务列表页，含添加表单和过滤栏
            ├── TodoItem.tsx            # 单条任务行，含行内编辑
            ├── RecurringView.tsx       # 定期事项列表页
            ├── RecurringItem.tsx       # 单条定期事项行，含行内编辑
            ├── CalendarView.tsx        # 月历/年历，收据导出
            ├── MonthReceipt.tsx        # 热敏小票风格 PNG 导出组件
            ├── TagBadge.tsx            # 标签展示徽章
            └── TagPicker.tsx           # 标签选择器，支持新建标签
```

## 按平台裁剪

如果只在单一平台使用，可以删除无关文件：

**仅 Windows** — 可删除：
```
start.sh
package.json        （根目录）
package-lock.json   （根目录）
node_modules/       （根目录）
```

**仅 Linux / macOS** — 可删除：
```
launch.bat
_start_servers.ps1
_run_backend.bat
_run_frontend.bat
```

