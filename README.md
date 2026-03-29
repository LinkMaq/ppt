# slider-ppt

静态 Web PPT，已配置为通过 GitHub Pages 自动发布。

## 发布方式

仓库包含 GitHub Pages 工作流：

- 工作流文件：`.github/workflows/deploy-pages.yml`
- 触发条件：推送到 `main`，或在 GitHub Actions 中手动触发
- 部署内容：仓库根目录静态文件

## GitHub 侧需要确认的设置

1. 打开仓库 `Settings -> Pages`
2. 在 `Build and deployment` 下把 `Source` 设为 `GitHub Actions`
3. 推送当前分支到 GitHub，等待 `Deploy GitHub Pages` 工作流完成

项目页地址通常会是：

`https://linkmaq.github.io/ppt/`

如果你后续绑定自定义域名，再额外配置 `CNAME` 即可。
