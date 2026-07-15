# 小qt的旅行地图

一个可部署到 GitHub Pages 的个人旅行足迹网站。第一版完全静态运行，使用 `localStorage` 保存数据，不依赖后端或付费地图服务。

## 技术栈

- React + TypeScript + Vite
- Tailwind CSS
- ECharts + GeoJSON
- Zustand 状态管理
- localStorage 数据持久化
- Vitest 数据逻辑测试

## 本地开发

```bash
npm install
npm run dev
```

## 检查与构建

```bash
npm run typecheck
npm test
npm run build
```

构建产物会输出到 `dist/`。Vite 已配置 `base: "/qtmap/"`，适配目标地址：

https://qtq903816-coder.github.io/qtmap/

## GitHub Pages 部署

工作流文件位于 `.github/workflows/deploy.yml`。推送到 `main` 分支后会自动：

1. 检出代码
2. 安装 Node.js
3. 执行 `npm ci`
4. 执行类型检查和测试
5. 构建项目
6. 部署 `dist` 到 GitHub Pages

应用使用 `HashRouter`，刷新页面不会触发 GitHub Pages 的 SPA 路由 404 问题。

## 数据备份

足迹管理页支持导出和导入 JSON 备份。备份格式包含完整原始旅行记录，地图点亮状态会根据记录重新计算。

默认存储键：

```text
qtmap.travel-data
```

## 后续扩展

项目已将数据类型、存储服务、导入校验、派生统计、地图渲染和页面拆分。以后接入 Supabase 时，可优先替换 `src/services/travelStorage.ts` 和 Zustand store 的数据来源。
