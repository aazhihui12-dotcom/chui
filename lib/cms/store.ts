import { DatabaseSync } from 'node:sqlite';
import { randomBytes, randomUUID } from 'node:crypto';
import { mkdirSync, chmodSync } from 'node:fs';
import { dirname } from 'node:path';
import type { Product, Article } from '@/content/schema';
import { CmsError, normalizeContent, object, text, type CmsKind, type CmsRecord, type CmsStatus } from './content';
import { hashPassword, verifyPassword, tokenHash } from './auth';

export interface CmsUser { id:string; username:string; role:'admin'|'editor'; active:boolean; mustChangePassword:boolean }
interface RawUser { id:string; username:string; role:'admin'|'editor'; active:number; must_change:number; password_hash:string }
interface RawContent { id:string;kind:CmsKind;status:CmsStatus;version:number;payload:string;created_at:string;updated_at:string;deleted_at:string|null }
const record = (r: RawContent): CmsRecord => ({id:r.id,kind:r.kind,status:r.status,version:r.version,payload:JSON.parse(r.payload),createdAt:r.created_at,updatedAt:r.updated_at,deletedAt:r.deleted_at});
const user = (r: RawUser): CmsUser => ({id:r.id,username:r.username,role:r.role,active:!!r.active,mustChangePassword:!!r.must_change});
export class CmsStore {
  readonly db: DatabaseSync;
  constructor(path: string) {
    mkdirSync(dirname(path),{recursive:true,mode:0o700});
    this.db = new DatabaseSync(path); chmodSync(path,0o600);
    this.db.exec(`PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON; PRAGMA busy_timeout=5000;
      CREATE TABLE IF NOT EXISTS meta(key TEXT PRIMARY KEY,value TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS content(kind TEXT NOT NULL,id TEXT NOT NULL,status TEXT NOT NULL,version INTEGER NOT NULL,payload TEXT NOT NULL,created_at TEXT NOT NULL,updated_at TEXT NOT NULL,deleted_at TEXT,PRIMARY KEY(kind,id));
      CREATE TABLE IF NOT EXISTS users(id TEXT PRIMARY KEY,username TEXT NOT NULL UNIQUE,password_hash TEXT NOT NULL,role TEXT NOT NULL,active INTEGER NOT NULL DEFAULT 1,must_change INTEGER NOT NULL DEFAULT 1);
      CREATE TABLE IF NOT EXISTS sessions(token_hash TEXT PRIMARY KEY,user_id TEXT NOT NULL REFERENCES users(id),expires INTEGER NOT NULL);
      CREATE TABLE IF NOT EXISTS attempts(key TEXT PRIMARY KEY,count INTEGER NOT NULL,expires INTEGER NOT NULL);
      CREATE TABLE IF NOT EXISTS audit(id INTEGER PRIMARY KEY,actor TEXT NOT NULL,action TEXT NOT NULL,target TEXT NOT NULL,at TEXT NOT NULL);
    `);
  }
  seed(products: Product[], articles: Article[]) {
    this.db.exec('BEGIN IMMEDIATE');
    try {
      if (!this.db.prepare('SELECT value FROM meta WHERE key=?').get('seed-v1')) {
        const now=new Date().toISOString(), add=this.db.prepare('INSERT OR IGNORE INTO content VALUES(?,?,?,?,?,?,?,NULL)');
        for(const [kind, entries] of [['product',products],['article',articles]] as const) for(const entry of entries) add.run(kind,entry.id,'published',1,JSON.stringify(entry),now,now);
        this.db.prepare('INSERT INTO meta VALUES(?,?)').run('seed-v1','1');
      }
      this.db.exec('COMMIT');
    } catch(e) { this.db.exec('ROLLBACK'); throw e; }
  }
  list(kind:CmsKind,status?:CmsStatus,deleted=false): CmsRecord[] {
    return (this.db.prepare(`SELECT * FROM content WHERE kind=? AND deleted_at IS ${deleted?'NOT ':''}NULL ${status?'AND status=?':''} ORDER BY updated_at DESC,id`).all(...(status?[kind,status]:[kind])) as unknown as RawContent[]).map(record);
  }
  get(kind:CmsKind,id:string):CmsRecord|undefined { const r=this.db.prepare('SELECT * FROM content WHERE kind=? AND id=?').get(kind,id) as unknown as RawContent|undefined; return r&&record(r); }
  save(kind:CmsKind,input:unknown,actor:string):CmsRecord {
    const raw=object(input), id=typeof raw.id==='string'?raw.id:undefined;
    const previous=id?this.get(kind,id):undefined;
    if(id&&!previous) throw new CmsError('内容不存在',404);
    if(previous?.deletedAt) throw new CmsError('请先从回收站恢复',409);
    const normalized=normalizeContent(kind,raw,previous), now=new Date().toISOString();
    if(previous) {
      const change=this.db.prepare('UPDATE content SET status=?,payload=?,version=version+1,updated_at=? WHERE kind=? AND id=? AND version=? AND deleted_at IS NULL').run(normalized.status,JSON.stringify(normalized.payload),now,kind,id!,Number(raw.version));
      if(!change.changes) throw new CmsError('其他人员已修改此内容，请重新打开后编辑（版本冲突）',409);
    } else {
      if(this.get(kind,normalized.id)) throw new CmsError('此型号已存在（可能在回收站）',409);
      this.db.prepare('INSERT INTO content VALUES(?,?,?,?,?,?,?,NULL)').run(kind,normalized.id,normalized.status,1,JSON.stringify(normalized.payload),now,now);
    }
    this.audit(actor,previous?'content.update':'content.create',`${kind}/${normalized.id}`);
    return this.get(kind,normalized.id)!;
  }
  remove(kind:CmsKind,id:string,version:number,actor:string) {
    const result=this.db.prepare('UPDATE content SET deleted_at=?,version=version+1,updated_at=? WHERE kind=? AND id=? AND version=? AND deleted_at IS NULL').run(new Date().toISOString(),new Date().toISOString(),kind,id,version);
    if(!result.changes) throw new CmsError('内容已被其他人员修改或删除（版本冲突）',409);
    this.audit(actor,'content.delete',`${kind}/${id}`);
  }
  restore(kind:CmsKind,id:string,actor:string) {
    const result=this.db.prepare("UPDATE content SET deleted_at=NULL,status='draft',version=version+1,updated_at=? WHERE kind=? AND id=? AND deleted_at IS NOT NULL").run(new Date().toISOString(),kind,id);
    if(!result.changes) throw new CmsError('回收站中没有此内容',404);
    this.audit(actor,'content.restore',`${kind}/${id}`);
  }
  audit(actor:string,action:string,target:string) {
    this.db.prepare('INSERT INTO audit(actor,action,target,at) VALUES(?,?,?,?)').run(actor,action,target,new Date().toISOString());
    this.db.exec('DELETE FROM audit WHERE id < (SELECT MAX(id)-5000 FROM audit)');
  }
  users():CmsUser[] { return (this.db.prepare('SELECT * FROM users ORDER BY username').all() as unknown as RawUser[]).map(user); }
  createUser(username:unknown,password:unknown,role:unknown):CmsUser {
    const name=text(username,60,true);
    if(!/^[a-zA-Z0-9_.-]{3,60}$/.test(name)) throw new CmsError('账号须为 3–60 位字母数字、点、横线或下划线');
    if(role!=='admin'&&role!=='editor') throw new CmsError('账号角色不正确');
    if(this.db.prepare('SELECT id FROM users WHERE username=?').get(name)) throw new CmsError('账号已存在',409);
    const id=randomUUID();this.db.prepare('INSERT INTO users(id,username,password_hash,role) VALUES(?,?,?,?)').run(id,name,hashPassword(password),role);
    return this.users().find(u=>u.id===id)!;
  }
  updateUser(id:string,change:{active?:boolean;password?:unknown}) {
    const current=this.users().find(u=>u.id===id);if(!current) throw new CmsError('账号不存在',404);
    if(change.active===false&&current.role==='admin'&&this.users().filter(u=>u.role==='admin'&&u.active).length<2) throw new CmsError('不能停用最后一个有效管理员');
    if(change.password!==undefined) this.db.prepare('UPDATE users SET password_hash=?,must_change=1 WHERE id=?').run(hashPassword(change.password),id);
    if(change.active!==undefined) this.db.prepare('UPDATE users SET active=? WHERE id=?').run(change.active?1:0,id);
    this.db.prepare('DELETE FROM sessions WHERE user_id=?').run(id);
  }
  async login(username:string,password:string,ip:string):Promise<string|undefined> {
    const now=Date.now();this.db.prepare('DELETE FROM attempts WHERE expires<?').run(now);this.db.prepare('DELETE FROM sessions WHERE expires<?').run(now);
    // Apply both source and account limits so rotating either dimension does not bypass protection.
    const keys=[`ip:${ip}`,`user:${username.toLowerCase()}`];
    for(const key of keys) { const a=this.db.prepare('SELECT count FROM attempts WHERE key=?').get(key) as {count:number}|undefined; if(a&&a.count>=10) throw new CmsError('登录尝试过于频繁，请 15 分钟后重试',429); }
    for(const key of keys) this.db.prepare('INSERT INTO attempts VALUES(?,1,?) ON CONFLICT(key) DO UPDATE SET count=count+1').run(key,now+15*60*1000);
    const r=this.db.prepare('SELECT * FROM users WHERE username=?').get(username) as unknown as RawUser|undefined;
    // Equal-work password derivation for unknown accounts avoids a trivial account timing oracle.
    const valid=await verifyPassword(password,r?.password_hash ?? '00000000000000000000000000000000:'+ '00'.repeat(64));
    if(!r||!r.active||!valid) return undefined;
    this.db.prepare('DELETE FROM attempts WHERE key=?').run(keys[1]);
    const token=randomBytes(32).toString('hex');this.db.prepare('INSERT INTO sessions VALUES(?,?,?)').run(tokenHash(token),r.id,now+12*60*60*1000);
    this.audit(r.id,'session.login',r.username);return token;
  }
  session(token:string):CmsUser|undefined {
    if(!/^[a-f0-9]{64}$/.test(token)) return;
    const r=this.db.prepare('SELECT u.* FROM sessions s JOIN users u ON u.id=s.user_id WHERE token_hash=? AND expires>? AND u.active=1').get(tokenHash(token),Date.now()) as unknown as RawUser|undefined;
    return r&&user(r);
  }
  logout(token:string) { this.db.prepare('DELETE FROM sessions WHERE token_hash=?').run(tokenHash(token)); }
  async changePassword(id:string,oldPassword:string,newPassword:unknown) {
    const r=this.db.prepare('SELECT * FROM users WHERE id=? AND active=1').get(id) as unknown as RawUser|undefined;
    if(!r||!await verifyPassword(oldPassword,r.password_hash)) throw new CmsError('原密码不正确',403);
    if(newPassword===oldPassword) throw new CmsError('新密码不能与原密码相同');
    this.db.prepare('UPDATE users SET password_hash=?,must_change=0 WHERE id=?').run(hashPassword(newPassword),id);
    this.db.prepare('DELETE FROM sessions WHERE user_id=?').run(id);this.audit(id,'user.password',id);
  }
}
