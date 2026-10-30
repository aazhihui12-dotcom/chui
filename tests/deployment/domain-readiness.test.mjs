import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import https from 'node:https';

// Explicit opt-in: this probes deployment routing and never logs in or writes.
const enabled = process.env.APOWER_DEPLOYMENT_CHECK === '1';
const ip = '177.5.75.237';
function request(protocol, host, path) {
  return new Promise((resolve, reject) => {
    const req = (protocol === 'https:' ? https : http).request({
      protocol, hostname: ip, port: protocol === 'https:' ? 443 : 80,
      method: 'GET', path, headers: { Host: host }, timeout: 8000,
      rejectUnauthorized: true,
    }, res => {
      let body='';res.setEncoding('utf8');res.on('data',chunk=>{if(body.length<4096)body+=chunk;});
      res.on('end',()=>resolve({status:res.statusCode,location:res.headers.location,body}));
    });
    req.on('timeout',()=>req.destroy(new Error('Routing probe timed out')));
    req.on('error',reject);req.end();
  });
}
for (const host of ['apowertech.net','www.apowertech.net']) {
  test(`${host}: ACME reaches the webroot without redirects`, {skip:!enabled},async()=>{
    const r = await request('http:',host,'/.well-known/acme-challenge/apower-domain-readiness-20261030');
    assert.equal(r.status,200);assert.equal(r.location,undefined);
    assert.equal(r.body,'apower-domain-readiness-20261030\n');
    assert.equal((await request('http:',host,'/.well-known/acme-challenge/apower-nonexistent-readiness-check')).status,404);
  });
  test(`${host}: pending website and admin keep using encrypted IP access`, {skip:!enabled},async()=>{
    for (const path of ['/cn/?probe=1','/admin/','/api/cms/login/']) {
      const r = await request('http:',host,path);
      assert.equal(r.status,302);assert.equal(r.location,`https://${ip}${path}`);
    }
  });
}
test('existing IP HTTPS website and API authentication stay intact',{skip:!enabled},async()=>{
  assert.equal((await request('https:',ip,'/cn/')).status,200);
  assert.equal((await request('https:',ip,'/api/cms/content/product/')).status,401);
});
test('an unknown HTTP Host is rejected, not proxied or reflected',{skip:!enabled},async()=>{
  await assert.rejects(request('http:','untrusted.example','/admin/'));
});
