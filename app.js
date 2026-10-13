const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)],sleep=ms=>new Promise(r=>setTimeout(r,ms));
const S={bg:'green',ar:'9:16',res:720,fps:30,dur:5,eng:'ultra',fmt:'mp4'};
const AR={'16:9':16/9,'9:16':9/16,'1:1':1,'4:5':.8,'21:9':21/9};
const BG={green:'solid #00FF00 (chroma key), nothing else on the background',alpha:'fully transparent canvas (clearRect only, no background fill)',theme:'a rich background that matches the theme of the idea'};
const ENG={ultra:'Encoder perangkat dengan bitrate tinggi. Tercepat dan paling tajam.',turbo:'Bitrate sedang. File lebih kecil, kualitas tetap baik.',eco:'Memberi napas ke browser tiap frame. Aman untuk HP RAM kecil.',compat:'Merekam real-time lewat MediaRecorder. Paling kompatibel, tapi selama durasi video.'};
const SAMPLE=`<!DOCTYPE html><html><body style="margin:0;background:#00FF00"><canvas id="c" style="width:100vw;height:100vh;display:block"></canvas><script>
const W=720,H=1280,FPS=30,DURATION=5,c=document.getElementById('c'),x=c.getContext('2d');c.width=W;c.height=H;
window.renderFrameAtTime=function(t){x.fillStyle='#00FF00';x.fillRect(0,0,W,H);const p=t/DURATION*Math.PI*2;
for(let i=0;i<5;i++){x.save();x.translate(W/2,H/2);x.rotate(p*(i%2?-1:1)+i);x.lineWidth=14;x.strokeStyle='hsl('+(i*40+t*60)+',90%,55%)';x.beginPath();x.arc(0,0,120+i*45,0,Math.PI*1.4);x.stroke();x.restore()}
x.fillStyle='#fff';x.font='bold 64px sans-serif';x.textAlign='center';x.fillText('STUDIO GERAK',W/2,H/2+20+Math.sin(p)*10)};
(function L(){renderFrameAtTime((performance.now()/1000)%DURATION);requestAnimationFrame(L)})();
<\/script></body></html>`;
function size(){const a=AR[S.ar],s=S.res;let w,h;if(a>=1){h=s;w=Math.round(s*a)}else{w=s;h=Math.round(s/a)}return[w&~1,h&~1]}
function buildPrompt(){const[w,h]=size(),idea=$('#idea').value.trim()||'(tulis ide animasi di atas)';
return`Write ONE complete, self-contained HTML5 file with a single <canvas>.\nIdea: ${idea}\n\nRules:\n- const W=${w},H=${h},FPS=${S.fps},DURATION=${S.dur},TOTAL_FRAMES=FPS*DURATION. Set canvas.width=W, canvas.height=H and make the canvas fill the viewport (100vw x 100vh, body margin 0).\n- Background: ${BG[S.bg]}.\n- Define window.renderFrameAtTime=function(t){...} that draws the whole frame as a pure function of t (seconds). No Date.now, no unseeded Math.random, no accumulated state.\n- Live preview loop: requestAnimationFrame calling renderFrameAtTime((performance.now()/1000)%DURATION), seamless at the loop point.\n- No external files, fonts or images.\n- Return the code only, no explanation.`}
function refresh(){const[w,h]=size(),N=S.fps*S.dur,px=w*h;
const sp=S.eng==='compat'?S.fps:Math.max(4,Math.min(60,2.4e7/px*(S.eng==='ultra'?1.3:1)));
$('#dims').textContent=`${w}x${h} ${S.fps}fps ${S.dur}s`;$('#est').textContent='Estimasi sekitar '+Math.ceil(N/sp)+' detik';
$('#engHint').textContent=ENG[S.eng];$('#durL').textContent=S.dur;$('#promptOut').value=buildPrompt();
const wr=$('#warn');wr.hidden=!(px>2560*1440||(px>1920*1080&&navigator.deviceMemory<=4));wr.textContent='Resolusi ini berat. HP dengan RAM kecil bisa kehabisan memori, coba 720p atau mesin Hemat.'}
$$('.seg').forEach(g=>g.onclick=e=>{const b=e.target.closest('button');if(!b)return;g.querySelectorAll('button').forEach(x=>x.classList.toggle('on',x===b));const v=b.dataset.v;S[g.dataset.k]=isNaN(v)?v:+v;refresh()});
$('#dur').oninput=e=>{S.dur=+e.target.value;refresh()};$('#idea').oninput=refresh;
$$('.chips button').forEach(b=>b.onclick=()=>{$('#idea').value=b.dataset.i;refresh()});
$$('#tabs button').forEach(b=>b.onclick=()=>{$$('#tabs button').forEach(x=>x.classList.toggle('on',x===b));$$('[data-p]').forEach(s=>s.hidden=s.dataset.p!==b.dataset.t);scrollTo(0,0)});
$('#copyP').onclick=async()=>{try{await navigator.clipboard.writeText($('#promptOut').value)}catch{$('#promptOut').select();document.execCommand('copy')}$('#copyP').lastChild.textContent='Tersalin'; setTimeout(()=>$('#copyP').lastChild.textContent='Salin prompt',1500)};
let pt;function codeChanged(){const v=$('#code').value;$('#lines').textContent=(v?v.split('\n').length:0)+' baris';clearTimeout(pt);pt=setTimeout(()=>{$('#pv').srcdoc=v},500)}
$('#code').oninput=codeChanged;
$('#paste').onclick=async()=>{try{$('#code').value=await navigator.clipboard.readText();codeChanged()}catch{$('#status').textContent='Izin clipboard ditolak, tempel manual di kotak.'}};
$('#clear').onclick=()=>{$('#code').value='';codeChanged()};
$('#save').onclick=()=>{try{localStorage.setItem('sg.code',$('#code').value);$('#status').textContent='Tersimpan'}catch{$('#status').textContent='Gagal menyimpan'}};
$('#sample').onclick=()=>{$('#code').value=SAMPLE;codeChanged()};
try{const sv=localStorage.getItem('sg.code');if(sv){$('#code').value=sv;codeChanged()}}catch{}
async function getSource(w,h){const f=document.createElement('iframe');f.setAttribute('sandbox','allow-scripts allow-same-origin');f.style.cssText=`position:fixed;left:-99999px;top:0;width:${w}px;height:${h}px;border:0`;document.body.appendChild(f);
await new Promise(r=>{f.onload=r;f.srcdoc=$('#code').value});await sleep(200);
const win=f.contentWindow,cv=f.contentDocument.querySelector('canvas');
if(typeof win.renderFrameAtTime!=='function'){f.remove();throw new Error('Kode belum punya fungsi renderFrameAtTime(t).')}
if(!cv){f.remove();throw new Error('Kode belum punya elemen canvas.')}return{f,win,cv}}
function loadMuxer(){return window.Mp4Muxer?Promise.resolve(true):new Promise(r=>{const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/mp4-muxer@5.1.3/build/mp4-muxer.js';s.onload=()=>r(true);s.onerror=()=>r(false);document.head.appendChild(s)})}
let cancel=false;
async function render(){const[w,h]=size(),{fps,dur}=S,N=fps*dur;cancel=false;openModal(N);let src;
try{if(!$('#code').value.trim())throw new Error('Kode masih kosong. Tempel kode di tab Kode.');
src=await getSource(w,h);const out=document.createElement('canvas');out.width=w;out.height=h;const g=out.getContext('2d',{alpha:false});
const draw=i=>{src.win.renderFrameAtTime(i/fps);g.fillStyle='#000';g.fillRect(0,0,w,h);g.drawImage(src.cv,0,0,w,h)};
const t0=performance.now(),tick=i=>{const el=(performance.now()-t0)/1000,sp=i/Math.max(el,.001);prog(i,N,sp,el,(N-i)/Math.max(sp,.001))};
const wc=S.fmt==='mp4'&&S.eng!=='compat'&&window.VideoEncoder&&await loadMuxer();
const blob=wc?await viaWC(out,draw,w,h,fps,N,tick):await viaMR(out,draw,fps,N,tick);
if(cancel)throw new Error('Render dibatalkan.');done(blob)}
catch(e){fail(e.message)}finally{src&&src.f.remove()}}
async function viaWC(out,draw,w,h,fps,N,tick){
const bits=Math.round(w*h*fps*({ultra:.12,turbo:.08,eco:.05}[S.eng]||.08)),codec=w*h>2560*1440?'avc1.640033':w*h>1920*1080?'avc1.640032':'avc1.64002a',cfg={codec,width:w,height:h,bitrate:bits,framerate:fps};
if(!(await VideoEncoder.isConfigSupported(cfg)).supported)return viaMR(out,draw,fps,N,tick);
const mux=new Mp4Muxer.Muxer({target:new Mp4Muxer.ArrayBufferTarget(),video:{codec:'avc',width:w,height:h},fastStart:'in-memory'});
let err;const enc=new VideoEncoder({output:(c,m)=>mux.addVideoChunk(c,m),error:e=>err=e});enc.configure(cfg);
for(let i=0;i<N&&!cancel;i++){if(err)throw err;draw(i);const fr=new VideoFrame(out,{timestamp:Math.round(i*1e6/fps),duration:Math.round(1e6/fps)});enc.encode(fr,{keyFrame:i%(fps*2)===0});fr.close();tick(i+1);
if(enc.encodeQueueSize>6||S.eng==='eco'||i%8===0)await sleep(0)}
if(cancel)return;await enc.flush();if(err)throw err;mux.finalize();return new Blob([mux.target.buffer],{type:'video/mp4'})}
async function viaMR(out,draw,fps,N,tick){
const want=S.fmt==='mp4'?['video/mp4','video/webm;codecs=vp9','video/webm']:['video/webm;codecs=vp9','video/webm;codecs=vp8','video/webm'],mime=want.find(m=>window.MediaRecorder&&MediaRecorder.isTypeSupported(m));
if(!mime)throw new Error('Browser ini belum mendukung perekaman video.');
const st=out.captureStream(0),tr=st.getVideoTracks()[0],ch=[],mr=new MediaRecorder(st,{mimeType:mime,videoBitsPerSecond:Math.round(out.width*out.height*fps*.1)});
mr.ondataavailable=e=>e.data.size&&ch.push(e.data);const stopped=new Promise(r=>mr.onstop=r);mr.start();const t0=performance.now();
for(let i=0;i<N&&!cancel;i++){draw(i);tr.requestFrame();tick(i+1);await sleep(Math.max(t0+(i+1)*1000/fps-performance.now(),0))}
mr.stop();await stopped;return new Blob(ch,{type:mime.split(';')[0]})}
function openModal(N){$('#modal').hidden=false;$('#res').hidden=true;$('#bar').hidden=false;$('#strip').innerHTML='<i></i>'.repeat(48);$('#mt').textContent='Merender';prog(0,N,0,0,0)}
function prog(i,N,sp,el,eta){const p=i/N;$('#pct').textContent=Math.round(p*100)+'%';$('#fr').textContent=i+' / '+N;$('#sp').textContent=sp.toFixed(1)+' fps';$('#el').textContent=el.toFixed(1)+' dtk';$('#eta').textContent=Math.ceil(eta)+' dtk';$$('#strip i').forEach((e,k,a)=>e.classList.toggle('f',k<p*a.length))}
function done(b){const u=URL.createObjectURL(b),ext=b.type.includes('mp4')?'mp4':'webm';$('#bar').hidden=true;$('#res').hidden=false;$('#mt').textContent='Selesai';$('#msg').textContent='';$('#vid').hidden=false;$('#vid').src=u;const a=$('#dl');a.hidden=false;a.href=u;a.download='studio-gerak-'+Date.now()+'.'+ext;a.textContent=`Unduh ${ext.toUpperCase()} (${(b.size/1048576).toFixed(1)} MB)`}
function fail(m){$('#bar').hidden=true;$('#res').hidden=false;$('#mt').textContent='Render gagal';$('#msg').textContent=m;$('#vid').hidden=true;$('#dl').hidden=true}
$('#go').onclick=render;$('#cancel').onclick=()=>cancel=true;$('#close').onclick=()=>{cancel=true;$('#modal').hidden=true};
refresh();
