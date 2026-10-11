# AI 观察笔记

个人 AI 博客，纯静态 HTML，无构建步骤，托管于 GitHub Pages。

## 目录

```
index.html              首页（文章列表）
assets/site.css         公共配色、字体、页眉页脚（含深色模式）
assets/site.js          深浅色切换
posts/<slug>/index.html 每篇文章一个文件夹，自包含
```

## 新增文章

1. 新建 `posts/<日期-主题>/index.html`，引用 `../../assets/site.css` 和 `../../assets/site.js`，沿用页眉页脚结构。
2. 在 `index.html` 的文章列表最上面加一条 `<li class="post">`，并更新"共 N 篇"。
3. 推送到 GitHub，Pages 自动发布。

## 本地预览

```
python3 -m http.server 8765
```

然后打开 http://localhost:8765/

## 约定

- 不依赖任何外部 CDN 和网络字体，图表用原生 SVG 手写，保证国内网络下打开不卡。
- 文字最小 15px；每张图都注明数据出处。
