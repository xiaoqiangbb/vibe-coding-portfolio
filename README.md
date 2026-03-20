# 🎨 AI 画廊

一个基于 Next.js 和火山引擎 Doubao Seedream 的 AI 图片生成画廊应用。

支持文生图、图生图，本地收藏管理你的 AI 创作。

## ✨ 功能特性

- 🎨 **文生图 / 图生图** - 基于 Doubao Seedream 模型生成高质量 AI 图片
- 🖼️ **2K / 3K 分辨率** - 支持高分辨率输出
- 💾 **本地收藏** - 生成的图片保存在浏览器 localStorage，刷新不丢失
- ❤️ **收藏管理** - 一键收藏喜欢的作品，支持只看收藏模式
- ⬇️ **一键下载** - 通过后端代理下载，绕过跨域限制
- 🎨 **现代 UI** - 深色渐变主题，毛玻璃效果，响应式设计
- ⚡ **Next.js 16 + React 19** - 最新技术栈，Edge Runtime

## 🚀 快速开始

### 1. 克隆安装

```bash
git clone <your-repo-url>
cd ai-image-gallery
npm install
```

### 2. 配置环境变量

复制 `.env.local.example` 到 `.env.local`:

```bash
cp .env.local.example .env.local
```

编辑 `.env.local`，填入你的火山方舟 API Key:

```env
VOLCENGINE_API_KEY=your-api-key-here
VOLCENGINE_IMAGE_MODEL=doubao-seedream-5-0-260128
```

### 3. 运行开发服务器

```bash
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000) 即可使用。

## 📝 部署到 Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/ai-image-gallery)

1. 推送到 GitHub
2. 导入到 Vercel
3. 添加环境变量 `VOLCENGINE_API_KEY`
4. 部署完成！

## 🏗️ 技术栈

- **框架:** Next.js 16 (App Router)
- **UI:** React 19 + Tailwind CSS v4
- **图标:** Lucide React
- **AI 模型:** 火山引擎 Doubao Seedream
- **运行时:** Edge Runtime

## 📂 项目结构

```
ai-image-gallery/
├── app/
│   ├── api/
│   │   ├── generate/route.ts    # AI 生成 API
│   │   └── download/route.ts    # 下载代理 API
│   ├── layout.tsx               # 根布局
│   └── page.tsx                 # 主页面
├── public/                      # 静态资源
├── .env.local.example           # 环境变量示例
└── package.json
```

## 🔒 安全说明

- `.env.local` 已经在 `.gitignore` 中，不会被提交到 Git
- 请妥善保管你的 API Key，不要泄露
- 建议设置 API 配额告警，避免意外消费

## 📄 许可证

MIT
