import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import https from 'node:https';

// Read-only, explicit opt-in. Connect to the origin IP while validating the
// requested hostname's real TLS certificate, independently of local DNS caches.
const enabled = process.env.APOWER_DOMAIN_ACTIVATION_CHECK === '1';
const ip = '177.5.75.237';
const domain = 'apowertech.net';
const origin = `https://${domain}`;
function request(protocol, host, path, options = {}) {
  return new Promise((resolve, reject) => {
    const req = (protocol === 'https:' ? https : http).request({
      hostname: ip, port: protocol === 'https:' ? 443 : 80,
      servername: host === ip ? '' : host,
      method: options.method ?? 'GET', path,
      headers: { Host: host, ...options.headers }, timeout: 10000,
      rejectUnauthorized: true,
    }, res => {
      let body = '';
      res.setEncoding('utf8');
      res.on('data', chunk => { body += chunk; });
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body }));
    });
    req.on('timeout', () => req.destroy(new Error('Domain activation probe timed out')));
    req.on('error', reject);
    req.end();
  });
}
const check = (name, run) => test(name, { skip: !enabled }, run);

check('apex serves both languages and admin over trusted hostname TLS', async () => {
  for (const path of ['/cn/', '/en/', '/admin/']) {
    const r = await request('https:', domain, path);
    assert.equal(r.status, 200, path);
    assert.equal(r.headers['x-content-type-options'], 'nosniff');
    assert.equal(r.headers['x-frame-options'], 'SAMEORIGIN');
    assert.match(r.body, /APOWER/);
  }
});
check('canonical, hreflang and sitemap use the production domain', async () => {
  for (const locale of ['cn', 'en']) {
    const r = await request('https:', domain, `/${locale}/`);
    assert.match(r.body, new RegExp(`<link rel="canonical" href="${origin}/${locale}/"`));
    assert.match(r.body, new RegExp(`hrefLang="en" href="${origin}/en/"`, 'i'));
    assert.doesNotMatch(r.body, /(?:rel="canonical"|hrefLang="[^"]+") href="https:\/\/177\.5\.75\.237/);
  }
  const sitemap = await request('https:', domain, '/sitemap.xml');
  assert.equal(sitemap.status, 200);
  assert.match(sitemap.body, /<loc>https:\/\/apowertech\.net\//);
  assert.doesNotMatch(sitemap.body, /177\.5\.75\.237/);
});
for (const host of [domain, `www.${domain}`]) {
  check(`${host}: HTTP redirects to fixed HTTPS apex preserving path and query`, async () => {
    for (const path of ['/cn/?probe=1', '/admin/?from=old']) {
      const r = await request('http:', host, path);
      assert.equal(r.status, 308);
      assert.equal(r.headers.location, origin + path);
    }
  });
  check(`${host}: HTTP ACME challenge still reaches the webroot`, async () => {
    const r = await request('http:', host, '/.well-known/acme-challenge/apower-domain-readiness-20261030');
    assert.equal(r.status, 200);
    assert.equal(r.headers.location, undefined);
    assert.equal(r.body, 'apower-domain-readiness-20261030\n');
  });
}
check('www has trusted TLS and redirects to fixed apex preserving path and query', async () => {
  const path = '/en/?probe=1';
  const r = await request('https:', `www.${domain}`, path);
  assert.equal(r.status, 308);
  assert.equal(r.headers.location, origin + path);
});
check('original IP website works with trusted IP TLS even without SNI', async () => {
  for (const path of ['/cn/', '/en/']) {
    assert.equal((await request('https:', ip, path)).status, 200);
  }
});
check('old IP admin redirects to the production admin without changing other IP routes', async () => {
  for (const path of ['/admin', '/admin/?from=old']) {
    const r = await request('https:', ip, path);
    assert.equal(r.status, 308);
    assert.equal(r.headers.location, origin + path);
  }
});
check('CMS remains authenticated and accepts only the production write origin', async () => {
  const anonymous = await request('https:', domain, '/api/cms/content/product/');
  assert.equal(anonymous.status, 401);
  assert.match(anonymous.headers['cache-control'], /no-store/);
  for (const [headers, status] of [
    [{ Origin: origin }, 401],
    [{ Origin: `https://${ip}` }, 403],
    [{ Origin: 'https://untrusted.example' }, 403],
    [{ Origin: origin, 'Sec-Fetch-Site': 'cross-site' }, 403],
    [{}, 403],
  ]) {
    const r = await request('https:', domain, '/api/cms/logout/', { method: 'POST', headers });
    assert.equal(r.status, status);
  }
});
check('unrecognized HTTP and HTTPS Host values are rejected without reflection', async () => {
  await assert.rejects(request('http:', 'untrusted.example', '/admin/'));
  await assert.rejects(request('https:', domain, '/admin/', { headers: { Host: 'untrusted.example' } }));
});
