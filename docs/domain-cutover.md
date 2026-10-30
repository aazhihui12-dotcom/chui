# apowertech.net 正式域名切换

## 当前阶段：仅准备接入，未正式上线域名HTTPS

根域为`apowertech.net`，`www.apowertech.net`最终跳根域。服务器177.5.75.237，原IP官网/后台、数据库和GitHub测试站不变。

当前权威DNS仍为Cloudflare，阿里云dns17.hichina.com和dns18.hichina.com仅已准备好两条A记录。服务器新增HTTP接入：ACME路径进入`/var/www/apower-acme`，其他请求临时302到原IP HTTPS，避免明文后台；域名证书未签发，不能宣称HTTPS已上线。系统自带的Nginx默认欢迎页已停用，原软链接和配置备份在`/var/backups/apower/domain-config-20261030/`，可恢复。

启用的是`deploy/apower-domain-pending.conf`；`deploy/apower-domain.conf`为尚未启用的第二阶段模板，不可直接复制至conf.d。

### 准备阶段复测

以下命令由具有SSH权限的运维在项目根目录执行，仅放置/移除固定测试标记，不登录后台、不改业务数据。测试文件只是探测标记，不是正式ACME认证令牌。

```sh
scp tests/deployment/fixtures/acme-readiness.txt root@177.5.75.237:/var/www/apower-acme/.well-known/acme-challenge/apower-domain-readiness-20261030
APOWER_DEPLOYMENT_CHECK=1 node --test tests/deployment/domain-readiness.test.mjs
ssh root@177.5.75.237 'rm /var/www/apower-acme/.well-known/acme-challenge/apower-domain-readiness-20261030'
```

全部6项应通过；未显式设置APOWER_DEPLOYMENT_CHECK时全部跳过，普通单元测试不访问服务器。准备探测只适用于过渡配置，正式启用后应改跑有效TLS及主域重定向检查。

## DNS切换前

1. 向原DNS管理方导出完整记录，保留MX/TXT、DKIM、验证记录及其他子域。公网查询不到MX不等于完整DNS清单为空。
   本次用户已确认域名仅用于官网，没有邮箱或其他子域名业务；因此当前两条官网A记录是已确认的迁移范围。
2. 核对阿里云根域和www的A均且仅指向177.5.75.237，无旧站A/CNAME冲突；不要保留指向其他服务器的AAAA。确认CAA允许Let's Encrypt，若原启用DNSSEC，按迁移要求正确处理DS。
3. 由用户在阿里云域名管理中将权威DNS改为dns17.hichina.com、dns18.hichina.com；此步骤不会由服务器脚本代替执行。

## DNS生效后（仍需执行，不是已完成）

先从公网及多个公共递归DNS核对根域/www的A、AAAA、CAA。探测两个域名的HTTP挑战路径能到本服务器，不凭控制台截图或NS变化单独判断完成。

签发命令（不要在指向旧站时尝试，避免失败限额）：

```sh
/opt/certbot/bin/certbot certonly --webroot -w /var/www/apower-acme --cert-name apower-domain -d apowertech.net -d www.apowertech.net --agree-tos --non-interactive --register-unsafely-without-email
```

1. 激活前先建立新的私有回退目录（权限700），保存当时的`/etc/nginx/conf.d/apower.conf`（IP站配置）、`/etc/nginx/conf.d/apower-domain.conf`、`/etc/apower.env`（权限600）及`/opt/apower/current`链接目标；记录备份绝对路径，不覆盖准备阶段备份。验证新证书SAN包含两个域名、有效期正确；现有apower-ip证书保留。
2. 本地编译`NEXT_PUBLIC_SITE_URL=https://apowertech.net NEXT_PUBLIC_BASE_PATH= npm run live:build`并上传新运行发布包；不能只改运行环境，因为NEXT_PUBLIC变量会在编译时固化。不覆盖`/var/lib/apower`。先备份、保留旧发布可回退。
3. 将`/etc/apower.env`的`APOWER_PUBLIC_ORIGIN`改为`https://apowertech.net`，保留DATA_DIR，权限600；不添加bootstrap密码、不把多个Origin放宽为通配符。
4. 用最终模板替换过渡配置（不可同时加载两个模板），`nginx -t`成功后reload。原IP配置保留，在IP HTTPS server增加`/admin`及`/admin/`到新域名同路径的固定308，避免运营人员在旧来源登录失败；IP官网仍可读。重启应用加载新环境。
5. 验证根域TLS受信任、HTTP及www固定跳主域（路径查询保留）、中英文页面、canonical/sitemap不再是IP。后台登录/改密/上传/发布、匿名401、跨Origin403、Secure+HttpOnly cookie正常。
6. 现有apower-certbot.timer会同时检查两份证书。使用与服务一致的绝对路径和reload钩子，执行域名证书续期演练：`/opt/certbot/bin/certbot renew --cert-name apower-domain --dry-run --run-deploy-hooks --no-random-sleep-on-renew --deploy-hook "/usr/sbin/nginx -s reload"`。确认验证及钩子都成功后才交付正式地址。

## 回退

初始准备阶段失败时，恢复默认欢迎页软链接并移走本次域名过渡conf，`nginx -t`后reload，IP服务未改动。

正式激活失败时，从激活前的私有回退目录恢复旧发布链接、`/etc/apower.env`、过渡域名conf，**同时恢复IP站`/etc/nginx/conf.d/apower.conf`，移除这次新增的IP `/admin`到域名的跳转**。`nginx -t`成功后reload，重启apower以加载恢复的环境。核实IP `/admin/`直接200、不跳至域名；匿名API401、原IP Origin校验和账号登录正常，IP中英文官网200；域名HTTP回到IP HTTPS过渡。不要回滚/覆盖运营数据库或删除有效证书。DNS回退需用户明确同意，不能由部署程序猜测更改。
