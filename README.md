# 理想社区积分任务汇总 · GitHub Pages

这是可公开的静态发布版本；只包含原本公开的活动信息与前端文件。首批活动来自原站初始清单。本站不接收或保存投稿：访客可以检查链接是否已收录，新链接由访客复制并在微信发给管理员。

## 首次发布

1. 在自己的 GitHub 账号新建空的公开仓库（建议名 li-auto-community-tasks，默认分支 main）。
2. 将此目录下的源文件上传到仓库根目录，包括隐藏目录 .github；不要上传 dist 或原站的 .git、配置和数据库。
3. 在 Settings → Pages → Build and deployment，Source 选 GitHub Actions。在 Actions 运行「检查并发布活动站」。成功后使用部署步骤给出的真实网址，不用根据用户名猜地址。
4. 用大陆手机流量在微信和 Safari 中各打开一次，检查首页和活动详情。GitHub Pages 的实际访问情况取决于访客网络。

## 审核与更新

收到微信链接后，查看原公告。核对时间、积分和活动要求，在新分支修改 activities.json；每条记录的结构可参考已有活动。原链接中的分享参数会在构建时清除。

开 Pull Request。Actions 会检查标题重名、文章编号、日期、官网链接，按结束日期整理活动，按官方允许的赛道数计算最高积分。PR 只校验，不部署。管理员审核后合并到 main，即批准发布；同一份校验通过后自动发布。两种平台档位不相加；只有明确可跨赛道累计的才设置 stackableTracks。

本地构建：使用 Node.js 24 运行 node build.mjs，直接打开 dist/index.html 可预览。

## 累计使用人数

计数端使用 Cloudflare Workers 和 D1。创建 D1 数据库，将 visitor-counter/schema.sql 导入一次。部署 visitor-counter/worker.mjs，绑定 D1（变量名 VISITS），设置随机、稳定的 Secret VISITOR_HASH_SECRET，关闭 Worker 请求日志。更换 Secret 会使已有 IP 无法去重。

启用前先验证 /visit 接口，同一网络连续请求三次只新增一次记录。将正式 HTTPS /visit 地址填入 visitor-api.json 后更新 main。用中国大陆手机流量在微信内核验计数能显示，记录从接口启用时开始。配置为空或接口不可用时隐藏计数。

计数接口只接受来自站点的跨域 POST，按请求到达 Cloudflare 时的 IP 计算带密钥的摘要。D1 只存摘要和总数。首页和分享页使用同一计数。
