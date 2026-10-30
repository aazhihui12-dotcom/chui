import type { CmsStore } from './store';
import { CmsError, object, text, type CmsKind } from './content';
import { limitedBody, uploadImage } from './uploads';

export interface CmsOptions { origin:string; uploadDir:string; secure:boolean }
const cookie=(value:string,secure:boolean,maxAge=43200)=>`apower_session=${value}; Path=/api/cms; HttpOnly; SameSite=Strict; Max-Age=${maxAge}${secure?'; Secure':''}`;
const json=(body:unknown,status=200,headers:Record<string,string>={})=>Response.json(body,{status,headers:{'cache-control':'no-store, private','x-content-type-options':'nosniff',...headers}});
async function body(request:Request){try{return object(JSON.parse((await limitedBody(request,512*1024)).toString('utf8')));}catch(e){if(e instanceof CmsError)throw e;throw new CmsError('请求内容不是有效 JSON');}}
export async function handleCmsRequest(request:Request,store:CmsStore,options:CmsOptions):Promise<Response> {
  try {
    const path=new URL(request.url).pathname.replace(/\/$/,'').slice('/api/cms/'.length).split('/').map(decodeURIComponent);
    const [resource,kindOrId,id,action]=path, method=request.method;
    if(!['GET','HEAD'].includes(method)) {
      if(request.headers.get('origin')!==options.origin||request.headers.get('sec-fetch-site')==='cross-site') throw new CmsError('请求来源校验失败，请从后台页面重新操作',403);
    }
    if(resource==='login'&&method==='POST') {
      const data=await body(request),username=text(data.username,60,true),password=text(data.password,128,true);
      const token=await store.login(username,password,request.headers.get('x-real-ip')??'unknown');
      if(!token) throw new CmsError('账号或密码不正确',401);
      return json({user:store.session(token)},200,{'set-cookie':cookie(token,options.secure)});
    }
    const token=request.headers.get('cookie')?.split(';').map(s=>s.trim()).find(s=>s.startsWith('apower_session='))?.slice('apower_session='.length)??'';
    const user=store.session(token);if(!user) throw new CmsError('登录已失效，请重新登录',401);
    if(resource==='session'&&method==='GET')return json({user});
    if(resource==='logout'&&method==='POST'){store.logout(token);return json({ok:true},200,{'set-cookie':cookie('',options.secure,0)});}
    if(resource==='password'&&method==='POST') {
      const data=await body(request);await store.changePassword(user.id,text(data.oldPassword,128,true),data.password);
      return json({ok:true,reauthenticate:true},200,{'set-cookie':cookie('',options.secure,0)});
    }
    if(user.mustChangePassword)throw new CmsError('首次登录请先修改密码',403);
    if(resource==='content') {
      if(kindOrId!=='product'&&kindOrId!=='article')throw new CmsError('内容类型不正确',404);
      const kind:CmsKind=kindOrId;
      if(method==='GET'&&!id)return json({records:store.list(kind,undefined,new URL(request.url).searchParams.get('deleted')==='1')});
      if(method==='GET'&&id){const record=store.get(kind,id);if(!record)throw new CmsError('内容不存在',404);return json({record});}
      if(method==='POST'&&!id){const data=await body(request);if(data.id!==undefined)throw new CmsError('新增内容不能指定已有记录');return json({record:store.save(kind,data,user.id)},201);}
      if(method==='PATCH'&&id&&!action){const data=await body(request);return json({record:store.save(kind,{...data,id},user.id)});}
      if(method==='DELETE'&&id&&!action){const data=await body(request);store.remove(kind,id,Number(data.version),user.id);return json({ok:true});}
      if(method==='POST'&&id&&action==='restore'){store.restore(kind,id,user.id);return json({record:store.get(kind,id)});}
    }
    if(resource==='uploads'&&method==='POST') {const image=await uploadImage(request,options.uploadDir);store.audit(user.id,'image.upload',image.src);return json({image},201);}
    if(resource==='users'||resource==='backup'||resource==='audit') {
      if(user.role!=='admin')throw new CmsError('仅管理员可以执行此操作',403);
      if(resource==='users'&&method==='GET')return json({users:store.users()});
      if(resource==='users'&&method==='POST') {const data=await body(request);const created=store.createUser(data.username,data.password,data.role);store.audit(user.id,'user.create',created.id);return json({user:created},201);}
      if(resource==='users'&&method==='PATCH'&&kindOrId) {
        const data=await body(request);if(data.active!==undefined&&typeof data.active!=='boolean')throw new CmsError('账号状态不正确');
        store.updateUser(kindOrId,{active:data.active as boolean|undefined,password:data.password});store.audit(user.id,'user.update',kindOrId);return json({ok:true});
      }
      if(resource==='backup'&&method==='GET') {
        store.audit(user.id,'backup.download','content');
        return json({format:'apower-content-v1',exportedAt:new Date().toISOString(),records:[...store.list('product'),...store.list('product',undefined,true),...store.list('article'),...store.list('article',undefined,true)]},200,{'content-disposition':`attachment; filename="apower-content-${new Date().toISOString().slice(0,10)}.json"`});
      }
      if(resource==='audit'&&method==='GET')return json({entries:store.db.prepare('SELECT actor,action,target,at FROM audit ORDER BY id DESC LIMIT 100').all()});
    }
    throw new CmsError('没有此接口或不支持该操作',404);
  }catch(e){if(e instanceof CmsError)return json({error:e.message},e.status);console.error('CMS request failed',e instanceof Error?e.name:'UnknownError');return json({error:'服务暂时不可用，请稍后重试'},500);}
}
