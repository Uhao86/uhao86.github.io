# 直播写作与发布

站点仓库是 `Uhao86/uhao86.github.io`，线上地址是 https://uhao86.github.io 。这份文档只讲两件事：直播时怎样把一篇解读写完并上线，以及上线失败时怎样查。

## 现在的发布方式

- 唯一部署入口是 `.github/workflows/deploy.yml`，只在 `main` 收到推送或手动触发时运行。
- 构建在 GitHub Actions 里完成。`dist/`、`.astro/` 和 `gh-pages` 都不再是发布源。
- 仓库 Pages 的 Source 必须是 **GitHub Actions**，不是 “Deploy from a branch”。
- 发布链：`git push origin main` → Actions 构建 → `actions/deploy-pages` 上线。推送成功不等于部署成功，必须同时看 Actions 和线上 URL。

## 开播前十分钟

```sh
cd /Users/imac/my-project/playground/uhao86.github.io
git pull --ff-only
npm ci
npm run build
gh auth status
gh run list --repo Uhao86/uhao86.github.io --workflow deploy.yml --limit 3
```

只有最近一次 `Deploy to GitHub Pages` 是绿色才开播，否则先修部署。

构建日志里出现 `projects`、`videos`、`music` 集合为空是提示，不是失败：这三类目前还没有内容。

再开一个终端保持预览：

```sh
cd /Users/imac/my-project/playground/uhao86.github.io
npm run dev
```

打开终端给出的本地地址。开发模式会显示草稿，正式构建会排除草稿。

## 写作循环

```sh
cp templates/reading.md src/content/writing/first-reading.zh.md
```

打开 `/zh/writing/first-reading/` 写作和检查。草稿的 URL 在开发模式就存在，不必等到发布才看排版。

### Frontmatter

| 字段 | 注意 |
| --- | --- |
| `title` / `summary` | 页面已经渲染标题，正文不要再写一级标题。 |
| `lang` | 中文文章写 `zh`。 |
| `translationKey` | 同一篇内容的各语言版本共用；只写一种语言也要填。 |
| `slug` | 一旦发布就不要再改，否则旧链接失效。 |
| `publishedAt` | 用日期，不要写时间，避免构建时区导致日期差一天。 |
| `featured` | 想进首页才设 `true`；首页最多六条。 |
| `draft` | 写作时保持 `true`，发布时再改 `false`。 |
| `kind` | 文章解读用 `article`。 |

### 公式

站点用 KaTeX 在构建时渲染，支持：

- 行内：`$e(x,z;\theta)$`
- 独立公式：`$$ ... $$`
- 编号：在公式内写 `\tag{1}`
- 常用记号：`\mathcal{X}`、`\mathbb{R}`、`\arg\min`、`\underbrace`、`\left\| ... \right\|_2^2`

不要使用 `\(...\)` 或 `\[...\]`，当前没有配置这两种分隔符。正文里的美元符号写成 `\$`。本地 LaTeX 环境适合核对公式本身，但排版以站点预览为准；不要把 `.tex` 文件或编译出的 PDF 直接放进文章。

### 表格、引文、脚注

- 表格用 GFM 管道语法，列不要太多。公式里出现竖线要写成 `\|`，否则会把表格拆坏。
- 直接引文用 `>`，后面紧跟出处和链接；只引需要的句子，不要整段复制原文。
- 脚注用 `[^1]` 和 `[^1]: 内容`，发布前在站点里点一次脚注链接。

### 图片

- 放在 `public/images/first-reading/`。
- 正文写 `![图 1：说明](/images/first-reading/figure-1.png)`，不要用本机绝对路径、Obsidian 的 `![[...]]` 或编辑器临时链接。
- 截图先裁掉无关区域并压缩；注明原图出处。图片下方的说明可以写成 `*图 1：...*`。
- 发布后打开线上图片 URL 确认 200；本地能看不等于线上路径正确。

### 写作时区分四种句子

1. 原文声称了什么，给出定位。
2. 我的理解是什么。
3. 我实际观察或运行到了什么。
4. 哪些还没有验证。

这四类混在一起，读者无法判断可信度。未运行的实验写“设想”，不要写成结果。

## 发布

1. 把 `draft` 改为 `false`；希望进首页就保持 `featured: true`。
2. 构建并预览：

```sh
npm run build
npm run preview
```

检查首页、`/archive/`、正文、公式、表格、脚注、图片、外链和窄屏。预览通过后再提交。

3. 只提交这次要发布的文件：

```sh
git status --short
git add src/content/writing/first-reading.zh.md
# 只有确实新增图片时才执行下一行
git add public/images/first-reading/
git commit -m "Publish first reading"
git push origin main
```

`origin` 现在就是 `Uhao86/uhao86.github.io`，可以直接 `git push`。旧的远端已经清理，不要改回去。

4. 等部署并验证：

```sh
gh run list --repo Uhao86/uhao86.github.io --workflow deploy.yml --limit 1
# 把 <run-id> 换成上一行返回的 ID
gh run watch <run-id> --repo Uhao86/uhao86.github.io --exit-status
curl -fsS -o /dev/null -w '%{http_code}\n' https://uhao86.github.io/zh/writing/first-reading/
```

5. 浏览器打开线上文章，硬刷新一次，再点一次图片和外链。部署完成后的缓存通常一两分钟内消失。

## 失败与回滚

| 现象 | 先查什么 |
| --- | --- |
| 本地构建失败 | 报错指向的字段；`publishedAt` 是否合法、`slug` 是否只含小写字母和连字符、项目是否有 `repo`、视频是否有 `bilibiliUrl`。 |
| 推送成功但线上没变 | Actions 是否绿色；Pages 的 Source 是否仍是 GitHub Actions；是否推到了 `main`。 |
| 文章 404 | `draft` 是否仍为 `true`；URL 是否少了结尾斜杠；`slug` 是否与文件名和 frontmatter 一致。 |
| 公式显示为源码 | 是否用了 `\(...\)`；是否在表格里被竖线截断；本地预览是否其实没重启。 |
| 图片 404 | 路径是否以 `/images/...` 开头；文件是否真的提交进了仓库；大小写是否一致。 |
| 发布错了 | 优先 `git revert <commit>` 再推送，保留历史；不要强推 `main`。 |
| 想撤下文章 | 把 `draft` 改回 `true` 再推送；不要删除正文。 |

## 部署权限边界：工作流能做什么，不能做什么

工作流负责“谁可以构建、谁可以发布”，它不能替代账号权限。当前仓库的实际边界是：

- 协作者只有 `Uhao86`；其他账号不是仓库协作者，不能直接推送或改 Pages 设置。
- `deploy.yml` 只在 `main` 推送或手动触发时运行；PR 工作流 `check.yml` 没有部署权限。
- `deploy.yml` 带 `if: github.repository == 'Uhao86/uhao86.github.io'`，仓库改名或 fork 不会误部署。
- 部署使用 `GITHUB_TOKEN` 的最小权限（`contents: read`、`pages: write`、`id-token: write`），不保存长期部署密钥。
- `check.yml` 的 `guard` 任务会拒绝非 `Uhao86` 的 PR 修改 `.github/`、`astro.config.mjs`、`package.json`、`package-lock.json`、`src/content.config.ts`、`src/data/site.ts`。
- `.github/CODEOWNERS` 把这些路径的评审指向 `Uhao86`。

这些是“检查”和“默认拒绝”，不是硬锁。要让它们真正生效，需要在 `main` 上启用分支保护或规则集：要求 PR、要求 `Check site / build` 通过、要求 Code Owner 评审。`guard` 作为非本人 PR 的额外拒绝项，是否设为必需检查可以按 GitHub 对 skipped job 的处理再定。不要给其他账号写权限；如果以后让 agent 代写，让它推分支并开 PR，不要直接推 `main`。把 `pull_request_target` 用在会 checkout PR 代码的仓库上是危险的，这里不使用。

## 一次性配置记录

- 本机 `origin`：`https://github.com/Uhao86/uhao86.github.io.git`。
- 本机提交身份：`Uhao86 <bahexiansheng5463@agent.qq.com>`。
- `gh-agent` 的 Uhao86 token 已包含 `workflow` scope；否则无法提交 `.github/workflows/`。撤销该 scope 后，工作流文件将无法推送。
- Pages Source：GitHub Actions。
- 部署环境 `github-pages` 只允许 `main` 分支部署。
- 构建 Node：24。
