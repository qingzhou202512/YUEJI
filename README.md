# 悦己手账

一个温暖的日常记录应用，帮助你记录生活中的小确幸、高光时刻，并进行能量管理和目标追踪。

## 项目结构

```
悦己手账/
├── components/          # React 组件
│   ├── ui/             # 通用 UI 组件
│   │   ├── StepIndicator.tsx
│   │   └── Toast.tsx
│   ├── journal/        # 日记相关组件
│   │   ├── HappinessStep.tsx
│   │   ├── AchievementsStep.tsx
│   │   ├── DrainersStep.tsx
│   │   ├── MitStep.tsx
│   │   ├── TomorrowStep.tsx
│   │   └── JournalActions.tsx
│   ├── home/           # 首页相关组件
│   │   ├── Header.tsx
│   │   ├── Background.tsx
│   │   ├── EmptyState.tsx
│   │   ├── DetailModal.tsx
│   │   └── MomentCard.tsx
│   ├── history/         # 历史记录相关组件
│   │   ├── CalendarView.tsx
│   │   └── EntryCard.tsx
│   ├── Journal.tsx      # 日记主组件
│   ├── Meditation.tsx   # 冥想组件
│   ├── History.tsx      # 历史记录主组件
│   └── Home.tsx         # 首页主组件
├── services/            # 业务逻辑服务
│   ├── storage.ts       # 本地存储管理
│   └── geminiService.ts # AI 洞察生成
├── types.ts             # TypeScript 类型定义
├── App.tsx              # 应用入口组件
├── index.tsx            # React 入口文件
├── index.html           # HTML 模板
├── index.css            # 全局样式
├── vite.config.ts       # Vite 配置
├── tsconfig.json        # TypeScript 配置
└── package.json         # 项目依赖

```

## 技术栈

- **前端框架**: React 19 + TypeScript
- **构建工具**: Vite 6
- **样式**: Tailwind CSS (通过 CDN)
- **图标**: Lucide React
- **AI 服务**: Google Gemini API
- **PWA**: Service Worker + Web App Manifest

## 功能特性

1. **日记记录**
   - 记录 3 件小确幸
   - 记录 3 件高光时刻
   - 能量消耗监测
   - 今日要事追踪
   - 明日计划

2. **AI 洞察**
   - 基于日记内容生成温暖的中文反馈
   - 情绪基调分析

3. **历史记录**
   - 日历视图查看记录
   - 搜索功能
   - 日期筛选

4. **冥想功能**
   - 定时器
   - 背景音效（雨声、风声、白噪音）

5. **PWA 功能**
   - 可安装到主屏幕
   - 离线访问支持
   - 网络状态提示
   - 自动缓存更新

## 开发指南

### 安装依赖

```bash
npm install
```

### 配置环境变量

在 `.env.local` 文件中设置你的 Gemini API Key:

```
GEMINI_API_KEY=your_api_key_here
```

### 运行开发服务器

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

## 组件说明

### 组件拆分原则

为了保持代码的可维护性，大型组件被拆分为多个小组件：

1. **Journal 组件**: 拆分为 5 个步骤组件 + 1 个操作栏组件
2. **Home 组件**: 拆分为 Header、Background、EmptyState、DetailModal、MomentCard
3. **History 组件**: 拆分为 CalendarView 和 EntryCard

### 样式系统

使用 Tailwind CSS，自定义颜色包括：
- `primary`: 紫色系（主色调）
- `pink`: 粉色系（小确幸）
- `mint`: 薄荷绿（能量监测）
- `peach`: 桃色（低消耗）
- `orange`: 橙色（高光时刻）
- `red`: 红色（高消耗）
- `ink`: 灰色系（文本）

## PWA 功能

### 已实现功能

1. **Service Worker**
   - 网络优先策略，离线时使用缓存
   - 自动缓存核心资源
   - 支持离线查看记录

2. **Web App Manifest**
   - 应用元数据配置
   - 支持添加到主屏幕
   - iOS Safari 兼容

3. **安装提示**
   - 自动检测可安装状态
   - 友好的安装引导界面

4. **离线状态检测**
   - 实时显示网络状态
   - 离线时提示数据已保存到本地

### 添加应用图标

为了让 PWA 功能完整，需要在 `public/` 目录下添加：

- `icon-192.png` (192x192 像素)
- `icon-512.png` (512x512 像素)

图标设计建议：
- 使用应用主色调（紫色 #8B5CF6）
- 简洁易识别
- 圆角设计

可以使用在线工具生成：https://www.pwabuilder.com/imageGenerator

### 测试 PWA 功能

1. **开发环境测试**
   ```bash
   npm run build
   npm run preview
   ```

2. **检查清单**
   - 打开 Chrome DevTools > Application > Manifest
   - 检查 Service Worker 是否注册成功
   - 测试离线访问（Network > Offline）
   - 测试安装提示（Application > Manifest > Install）

## 注意事项

1. 数据存储在浏览器的 localStorage 中
2. AI 功能需要配置 Gemini API Key
3. 项目使用 ES Modules，通过 importmap 加载依赖
4. PWA 功能需要 HTTPS 环境（生产环境）或 localhost（开发环境）

