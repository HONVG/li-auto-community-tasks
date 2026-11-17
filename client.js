(()=>{
const data=[...window.activitySeed],root=document.getElementById('lx-side'),q=s=>root.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]);
const safe=(s,allowed)=>{try{const u=new URL(s);return u.protocol==='https:'&&!u.username&&!u.password&&allowed.includes(u.hostname)?u.href:''}catch{return ''}};
const a=(v,label,hosts)=>{const u=safe(v,hosts);return u?'<a href="'+esc(u)+'" target="_blank" rel="noopener noreferrer">'+label+' ↗</a>':''};
const date=s=>s.length===5?'2026-'+s.replace('/','-'):s;
let order='end',message='';
function target(){return location.hash.slice(1).match(/^\/activity\/(\d+)$/)?.[1]}
function go(path){if(location.hash!=='#'+path)history.pushState({},'','#'+path);render();if(path!=='/')window.scrollTo(0,0);}
function details(r){
 const duration=r.rule??[r.ota&&'OTA '+r.ota,r.seconds&&'视频 ≥'+r.seconds+' 秒',r.graphics&&'图文 ≥'+r.graphics[0]+' 张＋'+r.graphics[1]+' 字',r.limited&&'仅限公告指定车辆，参加前请查看原公告'].filter(Boolean).join('；');
 const topics=(r.topics?.length?r.topics:[r.name,'全家人的理想座驾']).map(t=>'#'+t).join('　');
 const platform=r.platforms?.length?r.platforms.join('、'):r.communityFourth?'小红书、抖音、视频号、理想社区':r.stack?'小红书、抖音、视频号、微博、理想社区':'小红书、抖音、视频号、微博';
 const reg=r.reg?.startsWith('https://')?r.reg:r.reg?'https://lx.jinshuju.com/f/'+r.reg:'';
 const ideas=r.sections?.length?r.sections.map(([t,v])=>'<h4>'+esc(t)+'</h4><p>'+esc(v)+'</p>').join(''):r.evidence?.length?'<ul>'+r.evidence.map(n=>'<li>'+esc(n)+'</li>').join('')+'</ul><p>查看原公告了解各方向的完整说明。</p>':'<p>具体创作方向见原公告。</p>';
 const special={'2667039':'使用前登录车机高德账号，并开启理想同学的专家模式。','2656308':'理想社区话题入口显示「我的电池体验报告」；站外按规则使用「我的电池体检报告」。'}[r.id];
 const tiers=[r.one&&'单平台 '+r.one+' 积分',r.four&&'四平台 '+r.four+' 积分'].filter(Boolean).join('；');
 const rewardNote=r.stack?'三个赛道可分别参加并累加，同一赛道两个档位不相加。':'单平台和四平台为不同档位，不相加。';
 const extra=r.extra?.length?'<p class="points">万阅额外奖励：'+r.extra.map(n=>esc(n)+' 积分').join('、')+'（以原公告具体门槛为准）</p>':'';
 const reward=r.rewardDescription?'<p>'+esc(r.rewardDescription)+'</p>':'<p>'+esc(r.stack?'每个赛道：':'')+esc(tiers)+'</p><p>'+esc(rewardNote)+'</p>'+extra;
 const notes=(r.notes??[]).map(n=>'<li>'+esc(n)+'</li>').join('');
 return '<div class="summary"><div class="eyebrow hero-note">有奖话题 / 活动详情</div><h2>'+esc(r.name)+'</h2><span class="meta">活动时间 · '+esc(date(r.from))+' 至 '+esc(date(r.end))+'　·　</span>'+(r.cap?'<span class="points">最高 '+esc(r.cap)+' 积分</span>':r.rewardDescription?'<span class="points">实物或电卡奖励</span>':'')+'</div>'+
 '<section><h3>创作灵感</h3>'+ideas+'</section><section><h3>活动奖励</h3>'+reward+'</section>'+
 '<section><h3>活动要求</h3><p>'+esc(duration)+'</p><p><b>发布平台：</b>'+esc(platform)+'</p><p><b>关联话题：</b>'+esc(topics)+'</p>'+(special?'<p>'+esc(special)+'</p>':'')+(notes?'<ul>'+notes+'</ul>':'')+
 '</section><section><h3>登记与原公告</h3><p>'+[a(reg,'站外作品登记',['lx.jinshuju.com']),a(r.topic,'理想社区话题',['li.auto']),a(r.url??'https://www.lixiang.com/community/detail/article/'+r.id+'.html','理想社区原公告',['www.lixiang.com'])].filter(Boolean).join('　')+'</p></section>';
}
function render(){
 const importing=location.hash==='#/import',current=target(),rr=[...data].sort((a,b)=>(order==='cap'?(b.cap??0)-(a.cap??0):0)||date(a.end).localeCompare(date(b.end))||date(a.from).localeCompare(date(b.from)));
 const row=current?data.find(x=>x.id===current):rr[0]; root.dataset.reading=String(Boolean(current));q('.shell').hidden=importing;q('#lx-import').hidden=!importing;q('#lx-url-btn').hidden=importing;q('aside h2 small').textContent=data.length;
 q('#lx-list').innerHTML=rr.map(r=>'<button class="activity" data-id="'+esc(r.id)+'" aria-pressed="'+String(r.id===row?.id)+'"><span>'+esc(r.name)+'</span><small>'+esc(order==='end'?date(r.end).slice(5):r.rewardDescription?'实物或电卡':r.cap==null?'待核对':r.cap+' 分')+'</small></button>').join('');
 q('#lx-feedback').textContent=message;q('#lx-feedback').hidden=!message;
 q('#lx-article').innerHTML=row?details(row):'<p>未找到这项活动。</p>';
 for(const b of root.querySelectorAll('[data-sort]'))b.setAttribute('aria-pressed',String(b.dataset.sort===order));
}
root.addEventListener('click',e=>{
 const b=e.target.closest('button');if(!b)return;
 if(b.dataset.sort){order=b.dataset.sort;render();}
 if(b.dataset.id){message='';go('/activity/'+b.dataset.id);}
 if(b.id==='lx-url-btn'){go('/import');q('#lx-input').focus();}
 if(b.id==='lx-cancel'||b.id==='lx-back'){message='';go('/');}
});
addEventListener('popstate',()=>{message='';render();});
addEventListener('hashchange',render);
q('#lx-url-form').addEventListener('submit',async e=>{
 e.preventDefault();
 const status=q('#lx-status'),input=q('#lx-input');
 let u,m;
 try{u=new URL(input.value.trim());m=u.pathname.match(/^\/(?:app\/)?community\/detail\/article\/(\d{5,18})\.html$/);
 if(u.origin!=='https://www.lixiang.com'||u.username||u.password||!m)throw Error();}
 catch{status.textContent='请输入理想官网的活动文章链接。';return;}
 const existing=data.find(r=>r.id===m[1]);
 if(existing){message='此活动已收录。';status.textContent='';go('/activity/'+existing.id);return;}
 input.value=u.origin+u.pathname;
 try{await navigator.clipboard.writeText(input.value);status.textContent='链接已复制。请通过微信发给管理员审核，尚未提交或收录。';}
 catch{input.select();status.textContent='请手动复制链接，通过微信发给管理员审核。';}
});
render();
})();