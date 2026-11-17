import {readFile, writeFile, mkdir} from 'node:fs/promises';
const file=path=>new URL(path,import.meta.url);
const load=path=>readFile(file(path),'utf8');
const titleKey=s=>s.normalize('NFKC').replace(/^\s*(?:[\[【]\s*有奖话题\s*[\]】]|有奖话题\s*[|：:])\s*/u,'').replace(/\s+/gu,'').toLowerCase();
function date(v){
 if(typeof v!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(v))throw Error('日期必须是 YYYY-MM-DD');
 const d=new Date(v+'T00:00:00Z');
 if(!Number.isFinite(+d)||d.toISOString().slice(0,10)!==v)throw Error('日期不存在：'+v);
 return v;
}
export function organize(input){
 if(!Array.isArray(input)||!input.length)throw Error('活动清单不能为空');
 const ids=new Set(), titles=new Map();
 return input.map((item,i)=>{
  const text=(s,label)=>{if(typeof s!=='string'||!s.trim())throw Error('缺少'+label);return s.normalize('NFKC').trim();};
  try{
   const id=text(item.id,'文章编号'), name=text(item.name,'活动名称');
   if(!/^\d{5,18}$/.test(id))throw Error('文章编号格式无效');
   if(ids.has(id))throw Error('重复文章编号：'+id);
   const key=titleKey(name);if(!key)throw Error('活动标题归一后为空');
   if(titles.has(key))throw Error('重复活动标题：「'+name+'」与「'+titles.get(key)+'」');
   ids.add(id);titles.set(key,name);
   const from=date(item.from),end=date(item.end);if(end<from)throw Error('结束日期早于开始日期');
   const url=new URL(text(item.url,'原公告链接'));
   if(url.origin!=='https://www.lixiang.com'||url.username||url.password||!new RegExp('^/(?:app/)?community/detail/article/'+id+'[.]html$').test(url.pathname))throw Error('原公告必须是文章编号相符的理想官网链接');
   const one=item.one,four=item.four;
   if(![one,four].every(n=>n===null||Number.isSafeInteger(n)&&n>=0))throw Error('积分档位必须为非负整数或 null');
   const tracks=item.stackableTracks??1;
   if(!Number.isSafeInteger(tracks)||tracks<1||tracks>30)throw Error('可叠加赛道数无效');
   const cap=Math.max(one??0,four??0)*tracks;if(!Number.isSafeInteger(cap))throw Error('最高积分超出范围');
   if(!Array.isArray(item.sections)||!item.sections.length)throw Error('至少填写一条创作灵感');
   const sections=item.sections.map(row=>{if(!Array.isArray(row)||row.length!==2)throw Error('创作灵感每条需要标题和内容');return [text(row[0],'灵感标题'),text(row[1],'灵感内容')];});
   const link=(s,host)=>{if(!s)return undefined;const u=new URL(s);if(u.protocol!=='https:'||u.hostname!==host||u.username||u.password)throw Error('登记或话题链接不是预期来源');return u.href;};
   const optionalList=(v,l)=>{if(v==null)return undefined;if(!Array.isArray(v))throw Error(l+'必须是列表');return v.map(x=>text(x,l));};
   return {id,name,from,end,one,four,cap,stack:tracks>1,tracks,rule:text(item.rule,'活动要求'),rewardDescription:item.rewardDescription==null?undefined:text(item.rewardDescription,'活动奖励说明'),sections,url:url.origin+url.pathname,platforms:optionalList(item.platforms,'发布平台'),topics:optionalList(item.topics,'话题'),notes:optionalList(item.notes,'活动须知'),reg:link(item.reg,'lx.jinshuju.com'),topic:link(item.topic,'li.auto'),communityFourth:item.communityFourth===true};
  }catch(e){throw Error('第 '+(i+1)+' 条活动（'+(item?.name??'未命名')+'）：'+e.message);}
 }).sort((a,b)=>a.end.localeCompare(b.end)||a.from.localeCompare(b.from)||a.id.localeCompare(b.id));
}
const rows=organize(JSON.parse((await load('activities.json')).replace(/^\uFEFF/,'')));
const safeJSON=JSON.stringify(rows).replaceAll('<','\\u003c');
const title='理想社区积分任务汇总';
const description='车主活动整理-非官方';
const attr=s=>s.replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;');
const base=process.env.PAGES_URL?.trim();
const baseUrl=base?new URL(base.endsWith('/')?base:base+'/'):null;
if(baseUrl&&(baseUrl.protocol!=='https:'||baseUrl.username||baseUrl.password||baseUrl.search||baseUrl.hash))throw Error('PAGES_URL 必须是公开的 HTTPS 站点地址');
const cover=baseUrl?new URL('share-card-v2.png',baseUrl).href:'./share-card-v2.png';
const layout=await load('layout.html');
function page(relative){
 const target=baseUrl?new URL(relative,baseUrl).href:null;
 const meta='<meta name="description" content="'+attr(description)+'"><meta property="og:type" content="website"><meta property="og:title" content="'+attr(title)+'"><meta property="og:description" content="'+attr(description)+'"><meta property="og:image" content="'+attr(cover)+'"><meta property="og:image:type" content="image/png"><meta property="og:image:width" content="600"><meta property="og:image:height" content="600"><meta property="og:image:alt" content="'+attr(title)+'">'+(target?'<meta property="og:url" content="'+attr(target)+'"><link rel="canonical" href="'+attr(target)+'">':'')+'<meta name="twitter:card" content="summary">';
 return '<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+title+'</title>'+meta+'</head><body>'+layout+'<script>window.activitySeed='+safeJSON+';</script><script src="./client.js"></script></body></html>';
}
await mkdir(file('dist/'),{recursive:true});
const image=await readFile(file('share-card.png'));
await Promise.all([writeFile(file('dist/index.html'),page('')),writeFile(file('dist/share.html'),page('share.html')),writeFile(file('dist/client.js'),await load('client.js')),writeFile(file('dist/activities.json'),JSON.stringify(rows,null,2)+'\n'),writeFile(file('dist/share-card.png'),image),writeFile(file('dist/share-card-v2.png'),image),writeFile(file('dist/.nojekyll'),'')]);
console.log('已校验并整理 '+rows.length+' 项活动。');
