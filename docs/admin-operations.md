# APOWER 官网及管理后台

## 地址和账号

- 官网：`https://177.5.75.237/en/`、`/cn/`；后台：`https://177.5.75.237/admin/`。
- 初始管理员账号 `admin`，随机初始密码通过本地私密凭据文件交付，不在此文档或 Git 中保存。
- 第一次登录必须修改密码。管理员可以在“账号管理”新增独立运营账号、停用账号、重置临时密码。
- 运营可以管理产品和资讯，但不能管理账号、下载内容备份。改密、退出或停用立即撤销相应会话。

## 日常操作

1. 产品管理 → 新增产品。填写 AP- 型号和产品分类；型号创建后不再改动，以保留稳定网址。
2. 分别填写“中文内容”和“English 内容”，上传主图/配色、详情图。可将本语言图片复制到另一种语言；文字仍分别维护。
3. 参数每行一条：`参数名 | 参数值`。上传接受 JPG/PNG/WebP，每张最多 8MiB/2400万像素，服务器会转换为 WebP。
4. 保存草稿不公开；“保存并发布”立即展示到服务器官网；“下架”移出官网但保留后台；删除进入回收站，恢复后为草稿，须再次发布。
5. 资讯填写中英文标题和正文，空行分段；第一张图片用作列表封面，其余作为正文图片。HTML 只按文字显示，不执行脚本。
6. 同一内容被他人修改时会提示版本冲突，返回列表重新打开。保存前勿关闭页面；GitHub Pages 是独立静态测试站，不自动同步运营数据。
7. “资讯分类 → 常见问题”管理当前 23 条 APOWER 问答，发布/修改/下线会同步至 FAQ 和产品总览摘要。参考网站的历史 FAQ 深层网址保留只读，不混入运营列表。

## 部署结构

- 代码发布目录：`/opt/apower/releases/<release>/`；`/opt/apower/current` 为当前发布的符号链接。
- 数据库：`/var/lib/apower/cms.sqlite`；上传：`/var/lib/apower/uploads/`。发布代码不能覆盖此目录。
- 账号等环境配置：`/etc/apower.env`（root 仅可读，初始账号建好后移除 bootstrap 密码）。
- 服务：`apower.service`，非 root 用户 `apower`，仅监听 `127.0.0.1:3100`；Nginx 代理 80/443。
- 首次复制现有六款 APOWER 产品、资讯与当前 23 条 APOWER 问答，之后数据库为权威来源，删除内容不会从代码回填。
- 现有静态站仍使用 `npm run build`；服务器版使用 `npm run live:build`，本地编译后部署，不在 2GB 服务器上编译。
- 本地管理闭环测试：先 `npm run live:build`，再 `npx playwright test --config playwright.live.config.ts`。测试在独立临时库和 3110 端口运行，不操作生产数据。

## HTTPS 与日志

IP 使用 Let's Encrypt 短期证书，每天自动检查两次续期，成功后重载 Nginx。HTTP 自动跳 HTTPS。

```
systemctl status apower nginx
journalctl -u apower --since today
systemctl list-timers apower-certbot.timer apower-backup.timer
/opt/certbot/bin/certbot certificates
```

不要关闭自动续期；IP 变更需要重新签发证书。正式域名可后续添加 DNS 和域名证书。不在日志中记录密码或会话令牌。

## 备份与恢复

每日 `apower-backup.timer` 执行在线一致性 SQLite 备份，并连同上传文件归档到 `/var/backups/apower/`，保留最近 7 天；新包生成成功后才清理过期备份。文件权限 600，目录 700。

手动执行 `systemctl start apower-backup.service`；后台“下载内容备份”仅导出产品资讯 JSON，不包含账号密码和图片二进制。

恢复时：先停 `apower`，对当前数据再做一份备份；将指定归档解压到新的空目录，检查 `PRAGMA integrity_check`、图片和账号；确认后再替换持久数据目录，恢复 `apower:apower` 所有权，启动服务并验证。不要直接覆盖运行中的 SQLite/WAL 文件。

当前备份与官网在同一台服务器，只能防误操作，不能抵御整机丢失；建议定期下载备份到另一台设备。未配置远程对象存储或邮件服务。
