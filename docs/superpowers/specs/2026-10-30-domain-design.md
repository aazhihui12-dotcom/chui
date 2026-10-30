# apowertech.net 域名接入

用户已选定 apowertech.net 为官网，并确认继续服务器域名绑定及 HTTPS；沿用本会话直接执行方式。www.apowertech.net 最终跳转主域名。

## 意图与边界

- 保留现有 Next.js 官网、持久数据库、上传、账号、IP HTTPS 及 GitHub Pages 测试站。
- 域名在阿里云，服务器177.5.75.237；设计时权威DNS为Cloudflare，阿里云dns17/dns18.hichina.com已准备两条A记录。2026-10-30用户完成委派切换，公网核实后已上线阶段2（详见`docs/domain-cutover.md`）。
- 不修改用户DNS，不索取/保存DNS账号或API密钥，不创建轮询或自动切换任务。

## 接入方式

采用现有 Nginx + Certbot webroot，两阶段上线。DNS-01要求当前权威DNS控制权，尚未提供；直接给域名套用IP证书不合法，不采用。

阶段1：只启用两个域名的HTTP接入和ACME挑战目录；其他HTTP路径临时302至现有有效IP HTTPS（保留路径/查询），不开放明文后台、不引用不存在的域名证书。准备好最终HTTPS配置，但不要启用。

阶段2：用户切换DNS且公网根域/www均只指向177.5.75.237、无错误AAAA或CAA限制后，签发覆盖两域名的证书，启用HTTPS配置。根域提供站点，www跳转根域；APOWER_PUBLIC_ORIGIN与NEXT_PUBLIC_SITE_URL切至https://apowertech.net，后者需要重建Next运行版本。保留IP官网可用，IP后台入口转到正式域名。续期沿用现有Certbot定时任务。

## 验证

部署前后跑真实HTTP探测：域名ACME不存在文件404（不能444/重定向）；普通路径302至固定IP HTTPS；陌生Host拒绝；现有IP官网200、匿名后台API401。用临时挑战文件实际验证两个域名都能读到正确字节，验证后清理。Nginx语法检查必须成功才reload。

阶段2另外验证受信任TLS、www/HTTP重定向、SEO canonical、后台Origin/安全cookie、证书续期。当前若DNS仍未切换，明确交付“准备完成、HTTPS待签发”，不能宣称完整域名上线。
