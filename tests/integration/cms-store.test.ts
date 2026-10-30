// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { CmsStore } from '@/lib/cms/store';
import { apowerProducts } from '@/content/apower';
import { articles } from '@/content/articles';

let dir: string, store: CmsStore;
beforeEach(() => { dir = mkdtempSync(join(tmpdir(), 'apower-cms-')); store = new CmsStore(join(dir, 'cms.sqlite')); });
afterEach(() => { store?.db.close(); rmSync(dir, { recursive: true, force: true }); });
const input = () => ({ model: 'AP-TEST', categoryId: '682975', locales: Object.fromEntries(['en','cn'].map(l => [l,{title:'AP-TEST',description:'A test dryer',images:['/media/apower/v2/product-g3.webp'],specifications:[{label:'Voltage',value:'220V'}],detailImages:[]}])) });

describe('authoritative content storage', () => {
 it('seeds once without resurrecting deleted content on restart', () => {
  store.seed(apowerProducts, articles);
  const first = store.get('product','AP-G3')!;
  store.remove('product','AP-G3',first.version,'admin');
  store.seed(apowerProducts, articles);
  expect(store.list('product','published').map(r=>r.id)).not.toContain('AP-G3');
  store.db.close(); store = new CmsStore(join(dir,'cms.sqlite')); store.seed(apowerProducts, articles);
  expect(store.get('product','AP-G3')!.deletedAt).not.toBeNull();
 });
 it('keeps drafts private and publishes/restores localized records', () => {
  let record = store.save('product',{...input(),status:'draft'},'operator');
  expect(store.list('product','published')).toHaveLength(0);
  record = store.save('product',{...input(),id:record.id,version:record.version,status:'published'},'operator');
  expect(store.list('product','published')[0].payload.locales.cn.legacyPath).toBe('/ProductDetail/AP-TEST.html');
  store.remove('product',record.id,record.version,'operator');
  expect(store.list('product','published')).toHaveLength(0);
  store.restore('product',record.id,'operator');
  expect(store.get('product',record.id)!.status).toBe('draft');
 });
 it('rejects stale writes and stale deletes rather than losing another editor changes', () => {
  const a=store.save('product',{...input(),status:'draft'},'a');
  store.save('product',{...input(),id:a.id,version:a.version,status:'published'},'b');
  expect(()=>store.save('product',{...input(),id:a.id,version:a.version,status:'draft'},'a')).toThrow(/其他|版本/);
  expect(()=>store.remove('product',a.id,a.version,'a')).toThrow(/其他|版本/);
 });
 it('rejects malformed paths, empty publish fields, unknown categories and model renames', () => {
  expect(()=>store.save('product',{...input(),categoryId:'unknown',status:'draft'},'a')).toThrow();
  const bad=input(); bad.locales.en.images=['/uploads/../../etc/passwd'];
  expect(()=>store.save('product',{...bad,status:'published'},'a')).toThrow();
  expect(()=>store.save('product',{...input(),locales:{en:{},cn:{}},status:'published'},'a')).toThrow();
  const record=store.save('product',{...input(),status:'draft'},'a');
  expect(()=>store.save('product',{...input(),model:'AP-OTHER',id:record.id,version:record.version,status:'draft'},'a')).toThrow();
 });
 it('saves safe text articles, preserves dates and rejects duplicate product models', () => {
  store.save('product',{...input(),status:'published'},'a');
  expect(()=>store.save('product',{...input(),status:'published'},'a')).toThrow(/已存在/);
  const r=store.save('article',{status:'published',category:'news',publishedAt:'2026-10-30',locales:{cn:{title:'新品',description:'介绍',body:'第一段\n\n第二段',images:[]},en:{title:'New',description:'Intro',body:'<script>alert(1)</script>',images:[]}}},'a');
  expect(r.payload.locales.en.blocks[0]).toEqual({type:'rich-text',paragraphs:['<script>alert(1)</script>']});
  expect(r.payload.publishedAt).toBe('2026-10-30');
 });
});

describe('identities and sessions', () => {
 it('hashes passwords and session tokens, rejects weak passwords, and revokes on password change', async () => {
  expect(()=>store.createUser('admin','123','admin')).toThrow();
  const user=store.createUser('admin','FirstPassword!123','admin');
  const token=await store.login('admin','FirstPassword!123','test-ip');
  expect(store.session(token!)?.id).toBe(user.id);
  const raw=store.db.prepare('SELECT password_hash FROM users WHERE id=?').get(user.id) as {password_hash:string};
  expect(raw.password_hash).not.toContain('FirstPassword');
  expect(store.db.prepare('SELECT token_hash FROM sessions').all()).not.toContainEqual({token_hash:token});
  await store.changePassword(user.id,'FirstPassword!123','SecondPassword!456');
  expect(store.session(token!)).toBeUndefined();
  expect(await store.login('admin','FirstPassword!123','test-ip')).toBeUndefined();
 });
 it('rate limits incorrect logins persistently and rejects disabled users sessions', async () => {
  const u=store.createUser('editor','Password123!X','editor');
  const token=await store.login('editor','Password123!X','ok');
  store.updateUser(u.id,{active:false});
  expect(store.session(token!)).toBeUndefined();
  for(let i=0;i<10;i++) await store.login('nobody','incorrect-pass','blocked');
  await expect(store.login('nobody','incorrect-pass','blocked')).rejects.toThrow(/频繁/);
 });
 it('does not allow disabling the last active administrator', () => {
  const u=store.createUser('admin','Password123!X','admin');
  expect(()=>store.updateUser(u.id,{active:false})).toThrow(/管理员/);
 });
});
