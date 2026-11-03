# mrShaoGu 的个人站

核心目标：呈现自己的趣味。定位与取舍见 [site-purpose.md](./docs/site-purpose.md)。

## 页面结构

- 首页：统一精选（最多 6 条，包含思考、实验、音乐和影像），以及个人介绍。
- 全部记录 `/archive/`：所有已发布项目、写作、音乐和视频，按时间排列。
- 详情页：完整正文与相关外部链接。已有内容 URL 保持不变。

发布与首页推荐分开：`draft: false` 才会公开；`featured: true` 才有资格进入首页。推荐过多时按发布日期取最新的条目，中英文合计占一个位置。所有内容形式都可以参与精选。

## 修改入口

| 要修改什么 | 唯一入口 |
| --- | --- |
| 名称、个人介绍、外部账号 | `src/data/site.ts` |
| 正文、摘要、发布与推荐状态 | `src/content/` |
| 首页推荐数量、筛选与排序 | `src/lib/content.ts` |
| 内容字段与校验 | `src/content.config.ts` |
| 首页布局 | `src/pages/index.astro` |
| 全部记录布局 | `src/pages/archive.astro` |
| 详情页布局 | `src/pages/[lang]/[collection]/[slug].astro` |
| 导航和页脚 | `src/components/` |
| 全站外观与设计约定 | `src/styles/global.css`、`DESIGN.md` |

`dist/`、`.astro/` 和 `node_modules/` 是生成结果，不手动维护。

新增内容、分类边界和发布步骤见 [CONTENT_GUIDE.md](./CONTENT_GUIDE.md)。

## 本机验证

```sh
npm install
npm run dev
npm run build
```

构建会检查设计规则、Astro 类型并生成静态页面。推送到 `main` 后由 [`.github/workflows/deploy.yml`](./.github/workflows/deploy.yml) 构建并发布到 GitHub Pages；Pages 的 Source 需要是 GitHub Actions。直播写作与发布流程见 [docs/writing-and-publishing.md](./docs/writing-and-publishing.md)。
