import { isRandomToken, readCookie, sessionCookieName } from '../_lib/management-credentials.js';

const CLASS_REF=/^[a-z0-9][a-z0-9-]{0,30}$/;
const COURSE_REF=/^[a-z0-9][a-z0-9._-]{0,79}$/;
const RANGE_DAYS={ '24h':1,'7d':7,'30d':30,'90d':90,'1y':365 };
const GRANULARITIES=new Set(['hour','day','month']);

function json(body,status=200){return new Response(JSON.stringify(body),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff'}});}
function dbFrom(env){return env.MED_NYKUTO_DB||env.DB||null;}
async function digest(value){const bytes=new TextEncoder().encode(String(value||''));const hash=await crypto.subtle.digest('SHA-256',bytes);return Array.from(new Uint8Array(hash),b=>b.toString(16).padStart(2,'0')).join('');}
function safeEqual(a,b){a=String(a||'');b=String(b||'');if(a.length!==b.length)return false;let diff=0;for(let i=0;i<a.length;i+=1)diff|=a.charCodeAt(i)^b.charCodeAt(i);return diff===0;}
function cleanClass(value){const v=String(value||'').trim().toLowerCase();return CLASS_REF.test(v)?v:'s4-e';}
function cleanCourse(value){const v=String(value||'').trim().toLowerCase();return COURSE_REF.test(v)?v:'';}

async function resolveClass(db,ref){return db.prepare(`SELECT id,slug,name FROM hub_classes WHERE (id=? OR slug=?) AND status='active'`).bind(ref,ref).first();}
async function ownerActor(request,env,db,classId){
  const header=request.headers.get('authorization')||'';
  const match=header.match(/^Bearer[\t ]+([^\s].*)$/i);
  if(match&&env.MED_NYKUTO_OWNER_TOKEN&&safeEqual(match[1].trim(),env.MED_NYKUTO_OWNER_TOKEN))return true;
  const presented=readCookie(request,sessionCookieName());
  if(!isRandomToken(presented))return false;
  const tokenHash=await digest(presented),now=new Date().toISOString();
  const row=await db.prepare(`SELECT s.class_id AS account_class_id,e.status,EXISTS(SELECT 1 FROM hub_site_owner_account o WHERE o.account_key='primary' AND o.editor_id=s.editor_id AND o.enabled=1) AS site_owner FROM hub_editor_sessions s JOIN hub_editors e ON e.class_id=s.class_id AND e.id=s.editor_id WHERE s.token_hash=? AND s.revoked_at IS NULL AND s.expires_at>?`).bind(tokenHash,now).first();
  return Boolean(row&&row.status==='active'&&Number(row.site_owner)===1);
}
function bucketExpression(granularity){
  if(granularity==='hour')return `strftime('%Y-%m-%dT%H:00',datetime(updated_at,'-3 hours'))`;
  if(granularity==='month')return `strftime('%Y-%m',datetime(updated_at,'-3 hours'))`;
  return `strftime('%Y-%m-%d',datetime(updated_at,'-3 hours'))`;
}

export async function onRequestGet(context){
  const {request,env}=context,db=dbFrom(env);
  if(!db)return json({ok:false,error:'Base de datos no disponible.'},503);
  const url=new URL(request.url),classRef=cleanClass(url.searchParams.get('class'));
  const classRecord=await resolveClass(db,classRef);
  if(!classRecord)return json({ok:false,error:'Clase no encontrada.'},404);
  if(!(await ownerActor(request,env,db,classRecord.id)))return json({ok:false,error:'Acceso reservado al propietario.'},403);

  const range=RANGE_DAYS[url.searchParams.get('range')]?url.searchParams.get('range'):'30d';
  const granularity=GRANULARITIES.has(url.searchParams.get('granularity'))?url.searchParams.get('granularity'):(range==='24h'?'hour':range==='1y'?'month':'day');
  const course=cleanCourse(url.searchParams.get('course'));
  const moduleId=cleanCourse(url.searchParams.get('module'));
  const since=new Date(Date.now()-RANGE_DAYS[range]*86400000).toISOString();
  const where=['class_id=?','updated_at>=?'];
  const binds=[classRecord.id,since];
  if(course){where.push('course_id=?');binds.push(course);}
  if(moduleId){where.push('module_id=?');binds.push(moduleId);}
  const clause=where.join(' AND '),bucket=bucketExpression(granularity);
  const [summaryResult,seriesResult,coursesResult,modulesResult]=await Promise.all([
    db.prepare(`SELECT COUNT(*) AS attempts,COUNT(DISTINCT player_id) AS people,COALESCE(SUM(correct),0) AS correct,COALESCE(SUM(total),0) AS questions,COUNT(DISTINCT date(datetime(updated_at,'-3 hours'))) AS active_days FROM community_scores WHERE ${clause}`).bind(...binds).first(),
    db.prepare(`SELECT ${bucket} AS bucket,COUNT(*) AS attempts,COUNT(DISTINCT player_id) AS people,COALESCE(SUM(correct),0) AS correct,COALESCE(SUM(total),0) AS questions FROM community_scores WHERE ${clause} GROUP BY bucket ORDER BY bucket`).bind(...binds).all(),
    db.prepare(`SELECT course_id AS id,COUNT(*) AS attempts,COUNT(DISTINCT player_id) AS people FROM community_scores WHERE class_id=? AND updated_at>=? AND course_id<>'' GROUP BY course_id ORDER BY attempts DESC,course_id`).bind(classRecord.id,since).all(),
    db.prepare(`SELECT module_id AS id,COUNT(*) AS attempts,COUNT(DISTINCT player_id) AS people FROM community_scores WHERE class_id=? AND updated_at>=? AND module_id<>'' ${course?'AND course_id=?':''} GROUP BY module_id ORDER BY attempts DESC,module_id LIMIT 200`).bind(...(course?[classRecord.id,since,course]:[classRecord.id,since])).all()
  ]);
  const questions=Number(summaryResult?.questions)||0,correct=Number(summaryResult?.correct)||0;
  return json({ok:true,class:{id:classRecord.id,slug:classRecord.slug,name:classRecord.name},filters:{range,granularity,course,module:moduleId,since,timeZone:'America/Asuncion'},summary:{people:Number(summaryResult?.people)||0,attempts:Number(summaryResult?.attempts)||0,questions,correct,accuracy:questions?Math.round(correct/questions*1000)/10:0,activeDays:Number(summaryResult?.active_days)||0},series:(seriesResult.results||[]).map(row=>({bucket:row.bucket,people:Number(row.people)||0,attempts:Number(row.attempts)||0,questions:Number(row.questions)||0,correct:Number(row.correct)||0})),courses:coursesResult.results||[],modules:modulesResult.results||[],generatedAt:new Date().toISOString()});
}
