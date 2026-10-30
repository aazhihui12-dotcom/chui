# apowertech.net 正式域名切换

## 当前阶段：正式域名 HTTPS 已上线（2026-10-30）

官网：`https://apowertech.net/cn/`、`https://apowertech.net/en/`；后台：`https://apowertech.net/admin/`。`www.apowertech.net`及域名 HTTP 固定308跳转根域 HTTPS，保留路径和查询。原IP官网仍可读，原IP后台入口转到新域名；账号、密码、数据库和上传不变，GitHub测试站独立保留。

用户已在注册商将NS切到`dns17.hichina.com`、`dns18.hichina.com`。Google及Cloudflare公共解析均返回根域/www仅177.5.75.237，无AAAA、CAA限制或DS；两个系统解析的HTTP挑战路径实际200且字节相符后才签发证书。部分本地递归缓存仍可能短时显示旧站，不代表应再次改记录。

已启用`deploy/apower-domain.conf`及更新的`deploy/apower.conf`。域名证书`apower-domain`覆盖根域与www，有效至2027-01-28；原IP证书保留，IP443显式default_server以兼容无SNI客户端。应用运行发布为`/opt/apower/releases/20261030-domain-1`，编译SITE_URL及运行PUBLIC_ORIGIN均为`https://apowertech.net`。不要把多来源或通配Origin加入后台。

### 正式阶段复测

将下方命令中的测试名改为正式阶段探测：

```sh
scp tests/deployment/fixtures/acme-readiness.txt root@177.5.75.237:/var/www/apower-acme/.well-known/acme-challenge/apower-domain-readiness-20261030
APOWER_DOMAIN_ACTIVATION_CHECK=1 node --test tests/deployment/domain-activation.test.mjs
ssh root@177.5.75.237 'rm /var/www/apower-acme/.well-known/acme-challenge/apower-domain-readiness-20261030'
```

11项应全通过；未显式启用时全部跳过。验证真实受信任域名TLS、两语言/admin、canonical/hreflang/sitemap、HTTP/www重定向、无SNI的IPHTTPS、旧后台跳转、匿名401及错误Origin403。只读探测不登录或发布内容。测试固定标记已在交付前清理，复测须先放置再清理。

另外已验证生产管理员原凭据登录、会话、Secure/HttpOnly/SameSite=Strict cookie及退出撤销；未改密码或发布测试内容。独立临时数据库Playwright5项全通过（包括改密、上传、发布、删除及恢复）；桌面英文、手机中文及后台浏览器实际受信任访问，无横向溢出。257项单元测试通过。在线备份恢复完整性、账号及上传字节核对通过，备份仍在原持久数据目录之外。

域名证书续期演练及reload钩子已成功，现有`apower-certbot.timer`与`apower-backup.timer`均启用。所有任务沿用原定时器，没有新增DNS轮询或自动切换任务。

### 历史：准备阶段复测（正式启用后不要执行旧302断言）

以下命令由具有SSH权限的运维在项目根目录执行，仅放置/移除固定测试标记，不登录后台、不改业务数据。测试文件只是探测标记，不是正式ACME认证令牌。

```sh
scp tests/deployment/fixtures/acme-readiness.txt root@177.5.75.237:/var/www/apower-acme/.well-known/acme-challenge/apower-domain-readiness-20261030
APOWER_DEPLOYMENT_CHECK=1 node --test tests/deployment/domain-readiness.test.mjs
ssh root@177.5.75.237 'rm /var/www/apower-acme/.well-known/acme-challenge/apower-domain-readiness-20261030'
```

全部6项应通过；未显式设置APOWER_DEPLOYMENT_CHECK时全部跳过，普通单元测试不访问服务器。准备探测只适用于过渡配置，正式启用后应改跑有效TLS及主域重定向检查。

## 维护参考：DNS切换前

1. 向原DNS管理方导出完整记录，保留MX/TXT、DKIM、验证记录及其他子域。公网查询不到MX不等于完整DNS清单为空。
   本次用户已确认域名仅用于官网，没有邮箱或其他子域名业务；因此当前两条官网A记录是已确认的迁移范围。
2. 核对阿里云根域和www的A均且仅指向177.5.75.237，无旧站A/CNAME冲突；不要保留指向其他服务器的AAAA。确认CAA允许Let's Encrypt，若原启用DNSSEC，按迁移要求正确处理DS。
3. 由用户在阿里云域名管理中将权威DNS改为dns17.hichina.com、dns18.hichina.com；此步骤不会由服务器脚本代替执行。

## 维护参考：DNS生效后的激活顺序（本次已执行）

先从公网及多个公共递归DNS核对根域/www的A、AAAA、CAA。探测两个域名的HTTP挑战路径能到本服务器，不凭控制台截图或NS变化单独判断完成。

签发命令（不要在指向旧站时尝试，避免失败限额）：

```sh
/opt/certbot/bin/certbot certonly --webroot -w /var/www/apower-acme --cert-name apower-domain -d apowertech.net -d www.apowertech.net --agree-tos --non-interactive --register-unsafely-without-email
```

1. 激活前先建立新的私有回退目录（权限700），保存当时的`/etc/nginx/conf.d/apower.conf`（IP站配置）、`/etc/nginx/conf.d/apower-domain.conf`、`/etc/apower.env`（权限600）及`/opt/apower/current`链接目标；记录备份绝对路径，不覆盖准备阶段备份。验证新证书SAN包含两个域名、有效期正确；现有apower-ip证书保留。
2. 本地编译`NEXT_PUBLIC_SITE_URL=https://apowertech.net NEXT_PUBLIC_BASE_PATH= npm run live:build`并上传新运行发布包；不能只改运行环境，因为NEXT_PUBLIC变量会在编译时固化。不覆盖`/var/lib/apower`。先备份、保留旧发布可回退。
3. 将`/etc/apower.env`的`APOWER_PUBLIC_ORIGIN`改为`https://apowertech.net`，保留DATA_DIR，权限600；不添加bootstrap密码、不把多个Origin放宽为通配符。
4. 用最终模板替换过渡配置（不可同时加载两个模板），IP443明确保留`default_server`，`nginx -t`成功后reload。原IP配置保留，在IP HTTPS server增加`/admin`及`/admin/`到新域名同路径的固定308，避免运营人员在旧来源登录失败；IP官网仍可读。重启应用加载新环境。Nginx的reload返回并不保证新worker已接管TLS；实际出现过立即探测拿到旧IP证书的短暂时序差。使用有上限、保持证书/主机名校验的就绪探测（本次最多8次、间隔300ms），不能以关闭TLS验证掩盖问题；持续失败则回退。
5. 验证根域TLS受信任、HTTP及www固定跳主域（路径查询保留）、中英文页面、canonical/sitemap不再是IP。后台登录/改密/上传/发布、匿名401、跨Origin403、Secure+HttpOnly cookie正常。
6. 现有apower-certbot.timer会同时检查两份证书。使用与服务一致的绝对路径和reload钩子，执行域名证书续期演练：`/opt/certbot/bin/certbot renew --cert-name apower-domain --dry-run --run-deploy-hooks --no-random-sleep-on-renew --deploy-hook "/usr/sbin/nginx -s reload"`。确认验证及钩子都成功后才交付正式地址。

## 回退

本次激活前配置与环境备份：`/var/backups/apower/domain-activation-20261030.QKC721/`（700，环境文件600）。原发布`/opt/apower/releases/20261030-admin-1`未改动，激活失败曾实际执行回退并验证原IP仍200，随后经有上限TLS就绪检查成功激活。

初始准备阶段失败时，恢复默认欢迎页软链接并移走本次域名过渡conf，`nginx -t`后reload，IP服务未改动。

正式激活失败时，从激活前的私有回退目录恢复旧发布链接、`/etc/apower.env`、过渡域名conf，**同时恢复IP站`/etc/nginx/conf.d/apower.conf`，移除这次新增的IP `/admin`到域名的跳转**。`nginx -t`成功后reload，重启apower以加载恢复的环境。核实IP `/admin/`直接200、不跳至域名；匿名API401、原IP Origin校验和账号登录正常，IP中英文官网200；域名HTTP回到IP HTTPS过渡。不要回滚/覆盖运营数据库或删除有效证书。DNS回退需用户明确同意，不能由部署程序猜测更改。
