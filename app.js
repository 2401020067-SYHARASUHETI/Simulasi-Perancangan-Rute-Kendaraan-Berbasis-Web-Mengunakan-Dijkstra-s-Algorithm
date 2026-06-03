'use strict';
// ============================================================
//  SMART CITY KOTMOR — Dijkstra Pathfinding Simulator
// ============================================================

const canvas  = document.getElementById('gameCanvas');
const ctx     = canvas.getContext('2d');
const mmCanvas = document.getElementById('mmC');
const mctx    = mmCanvas.getContext('2d');

let W, H;
function resize(){ W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; }
resize();
window.addEventListener('resize', resize);

// ============================================================
//  KAMERA
// ============================================================
const WORLD = 2800;
let cam = { x: WORLD/2, y: WORLD/2, zoom: 0.72 };
let isDragging = false;
let dragStart  = { x:0, y:0 };
let camStart   = { x:0, y:0 };
let followCar  = false;
let mapSeed    = 0;
let paused     = false;
let starred    = false;

function w2s(wx, wy){
  return { x: (wx - cam.x) * cam.zoom + W/2, y: (wy - cam.y) * cam.zoom + H/2 };
}
function s2w(sx, sy){
  return { x: (sx - W/2) / cam.zoom + cam.x, y: (sy - H/2) / cam.zoom + cam.y };
}

// ============================================================
//  GRAPH
// ============================================================
let nodes   = [];
let edges   = [];
let adjList = {};

function addNode(x, y, type='road'){
  const id = nodes.length;
  nodes.push({ id, x, y, type });
  adjList[id] = [];
  return id;
}

function addEdge(a, b, noRender=false){
  if(a == null || b == null || a === b) return;
  const na = nodes[a], nb = nodes[b];
  const w  = Math.hypot(na.x - nb.x, na.y - nb.y);
  adjList[a].push({ to:b, w });
  adjList[b].push({ to:a, w });
  edges.push({ a, b, noRender });
}

// ============================================================
//  BUILD GRAPH
// ============================================================
function buildGraph(){
  nodes=[]; edges=[]; adjList={};

  const AV=[200,440,680,920,1160,1400,1640,1880,2120,2360,2600];
  const ST=[200,440,680,920,1160,1400,1640,1880,2120,2360,2600];
  const G={};
  ST.forEach((y,yi)=>{ G[yi]={}; AV.forEach((x,xi)=>{ G[yi][xi]=addNode(x,y,'inter'); }); });

  // ── BUNDARAN TENGAH ──────────────────────────────────────────
  // Radius jalan bundaran: 160 (titik tengah jalan bundaran)
  // Node di busur: setiap 15 derajat = 24 node → mobil berjalan smooth di atas jalan
  const RX=1400, RY=1400, RR=160;
  const NSEG=24; // jumlah segmen busur
  const rbtNodes=[];
  for(let i=0;i<NSEG;i++){
    const a = i*Math.PI*2/NSEG - Math.PI/2; // mulai dari atas (angle -90°)
    rbtNodes.push(addNode(RX+Math.cos(a)*RR, RY+Math.sin(a)*RR, 'rbt'));
  }
  // Hubungkan searah jarum jam — noRender (gambar oleh drawRoundabout)
  for(let i=0;i<NSEG;i++) addEdge(rbtNodes[i], rbtNodes[(i+1)%NSEG], true);

  // Indeks 4 titik entry/exit (setiap 90 derajat, mulai dari atas=index 0):
  // Atas  = index 0  (angle=-90° → y=RY-RR)
  // Kanan = index 6  (angle=0°   → x=RX+RR)
  // Bawah = index 12 (angle=90°  → y=RY+RR)
  // Kiri  = index 18 (angle=180° → x=RX-RR)
  const iUp=0, iRight=6, iDown=12, iLeft=18;

  // Sambungkan jalan grid ke titik entry bundaran
  addEdge(G[4][5], rbtNodes[iUp]);    // jalan dari atas → masuk bundaran atas
  addEdge(G[5][6], rbtNodes[iRight]); // jalan dari kanan → masuk bundaran kanan
  addEdge(G[6][5], rbtNodes[iDown]);  // jalan dari bawah → masuk bundaran bawah
  addEdge(G[5][4], rbtNodes[iLeft]);  // jalan dari kiri → masuk bundaran kiri

  // Sembunyikan node pusat G[5][5]
  nodes[G[5][5]].hidden=true;

  // ── JALAN GRID HORIZONTAL ───────────────────────────────────
  ST.forEach((_,yi)=>{
    AV.forEach((_,xi)=>{
      if(xi>=AV.length-1) return;
      if(yi===5 && xi===4) return; // G[5][4]→G[5][5] diganti lewat bundaran
      if(yi===5 && xi===5) return; // G[5][5]→G[5][6] diganti lewat bundaran
      const blk=(yi===2&&xi===3)||(yi===5&&xi===7)||(yi===8&&xi===4)||
                (yi===1&&xi===6)||(yi===7&&xi===2)||(yi===3&&xi===9)||
                (yi===9&&xi===1)||(yi===4&&xi===5);
      if(!blk) addEdge(G[yi][xi], G[yi][xi+1]);
    });
  });

  // ── JALAN GRID VERTIKAL ─────────────────────────────────────
  AV.forEach((_,xi)=>{
    ST.forEach((_,yi)=>{
      if(yi>=ST.length-1) return;
      if(xi===5 && yi===4) return; // G[4][5]→G[5][5] diganti lewat bundaran
      if(xi===5 && yi===5) return; // G[5][5]→G[6][5] diganti lewat bundaran
      const blk=(xi===2&&yi===1)||(xi===6&&yi===4)||(xi===4&&yi===7)||
                (xi===8&&yi===2)||(xi===1&&yi===8)||(xi===7&&yi===1)||
                (xi===3&&yi===9)||(xi===9&&yi===5);
      if(!blk) addEdge(G[yi][xi], G[yi+1][xi]);
    });
  });

  return G;
}



// ============================================================
//  DIJKSTRA
// ============================================================
function dijkstra(src, dst){
  if(src === dst) return { path:[src], cost:0, visited:[] };
  const dist={}, prev={}, visited=new Set(), visitOrder=[];
  nodes.forEach(n => { dist[n.id]=Infinity; prev[n.id]=null; });
  dist[src] = 0;
  const pq = [{ id:src, d:0 }];
  while(pq.length){
    pq.sort((a,b) => a.d - b.d);
    const { id:u } = pq.shift();
    if(visited.has(u)) continue;
    visited.add(u); visitOrder.push(u);
    if(u === dst) break;
    for(const { to, w } of (adjList[u]||[])){
      const alt = dist[u] + w;
      if(alt < dist[to]){ dist[to]=alt; prev[to]=u; pq.push({ id:to, d:alt }); }
    }
  }
  const path = [];
  let cur = dst;
  while(cur !== null && cur !== undefined){ path.unshift(cur); cur = prev[cur]; }
  if(!path.length || path[0] !== src) return { path:[], cost:Infinity, visited:visitOrder };
  return { path, cost:dist[dst], visited:visitOrder };
}

function closestNode(wx, wy){
  let best=null, bestD=Infinity;
  nodes.forEach(n => { const d=(n.x-wx)**2+(n.y-wy)**2; if(d<bestD){bestD=d;best=n.id;} });
  return best;
}

function sr(s){ let x=Math.sin(s*1.618+2.718)*99991; return x-Math.floor(x); }

// ============================================================
//  LOKASI
// ============================================================
const LOCS = [
  {id:'hospital',nm:'Rumah Sakit',     ico:'🏥',col:'#ff4466',wx:200,  wy:200 },
  {id:'police',  nm:'Kantor Polisi',   ico:'🚔',col:'#4477ff',wx:2600, wy:2600},
  {id:'school',  nm:'Sekolah',         ico:'🏫',col:'#ffcc00',wx:1400, wy:200 },
  {id:'mosque',  nm:'Masjid',          ico:'🕌',col:'#00cc88',wx:1400, wy:1400},
  {id:'market',  nm:'Pasar',           ico:'🏪',col:'#ff8822',wx:200,  wy:1400},
  {id:'taman',   nm:'Taman Kota',      ico:'🌳',col:'#33dd55',wx:1400, wy:680 },
  {id:'station', nm:'Stasiun KA',      ico:'🚉',col:'#9966ff',wx:2600, wy:200 },
  {id:'univ',    nm:'Universitas',     ico:'🎓',col:'#0099ff',wx:200,  wy:2600},
  {id:'mall',    nm:'Mall/Plaza',      ico:'🛍️',col:'#ff44aa',wx:2600, wy:1400},
  {id:'bank',    nm:'Bank',            ico:'🏦',col:'#44ddcc',wx:680,  wy:680 },
  {id:'airport', nm:'Bandara',         ico:'✈️',col:'#66aaff',wx:2600, wy:440 },
  {id:'hotel',   nm:'Hotel',           ico:'🏨',col:'#ffaa44',wx:920,  wy:2360},
  {id:'rs2',     nm:'RS Bethesda',     ico:'⚕️',col:'#ff6699',wx:2360, wy:680 },
  {id:'sport',   nm:'Lap. Olahraga',   ico:'🏟️',col:'#aadd00',wx:680,  wy:2360},
  {id:'museum',  nm:'Museum',          ico:'🏛️',col:'#ddaa44',wx:1880, wy:2360},
  {id:'fire',    nm:'Pemadam Kebakaran',ico:'🚒',col:'#ff4400',wx:2360,wy:2120},
  {id:'pos',     nm:'Kantor Pos',      ico:'📮',col:'#ffdd00',wx:440,  wy:1640},
  {id:'lib',     nm:'Perpustakaan',    ico:'📚',col:'#aa66ff',wx:2120, wy:200 },
  {id:'spbu',    nm:'SPBU',            ico:'⛽',col:'#44aaff',wx:920,  wy:1160},
  {id:'pusk',    nm:'Puskesmas',       ico:'🏥',col:'#ff6688',wx:2360, wy:1640},
];

function assignLocNodes(){
  LOCS.forEach(loc => { loc.node = closestNode(loc.wx, loc.wy); });
}

// ============================================================
//  CITY OBJECTS
// ============================================================
let cityObjs = [];
const PARKS = [
  {x:280,y:280,w:200,h:200},{x:760,y:760,w:190,h:180},
  {x:1760,y:280,w:200,h:200},{x:1760,y:1760,w:200,h:190},
  {x:280,y:1760,w:190,h:200},{x:2160,y:760,w:200,h:180},
  {x:760,y:2160,w:190,h:200},{x:2160,y:2160,w:200,h:200},
  {x:1160,y:1160,w:180,h:180},
];
const LOTS = [
  {x:760,y:200,w:200,h:80},{x:280,y:1160,w:190,h:70},
  {x:2160,y:200,w:200,h:80},{x:2160,y:1160,w:190,h:70},
  {x:1160,y:2160,w:200,h:75},{x:560,y:2000,w:170,h:70},
  {x:2000,y:2000,w:170,h:70},
];
const LBUILD = {
  hospital:{x:140,y:140,w:190,h:175},police:{x:2420,y:2420,w:185,h:175},
  school:{x:1300,y:140,w:200,h:180},mosque:{x:1310,y:1310,w:180,h:180},
  market:{x:140,y:1300,w:195,h:185},taman:{x:1300,y:590,w:185,h:175},
  station:{x:2420,y:250,w:195,h:175},univ:{x:250,y:2420,w:200,h:185},
  mall:{x:2560,y:1300,w:195,h:180},bank:{x:590,y:590,w:185,h:175},
  airport:{x:2560,y:350,w:200,h:170},hotel:{x:820,y:2200,w:190,h:175},
  rs2:{x:2200,y:590,w:195,h:175},sport:{x:590,y:2200,w:195,h:180},
  museum:{x:1840,y:2200,w:190,h:175},fire:{x:2200,y:2040,w:185,h:175},
  pos:{x:350,y:1600,w:185,h:165},lib:{x:2060,y:140,w:195,h:175},
  spbu:{x:820,y:1080,w:185,h:165},pusk:{x:2200,y:1600,w:190,h:175},
};
const BPAL=[
  {base:'#6a7888',roof:'#506070',rim:'#7a8898',win:'rgba(180,220,255,'},
  {base:'#7a7068',roof:'#5e5450',rim:'#8a8078',win:'rgba(255,210,160,'},
  {base:'#686878',roof:'#504e60',rim:'#787888',win:'rgba(180,180,255,'},
  {base:'#5e7868',roof:'#486058',rim:'#6e8878',win:'rgba(160,255,180,'},
  {base:'#887870',roof:'#6a5c54',rim:'#988880',win:'rgba(255,200,180,'},
];

function buildCityObjects(){
  cityObjs=[];
  const AV=[200,440,680,920,1160,1400,1640,1880,2120,2360,2600];
  const ST=[200,440,680,920,1160,1400,1640,1880,2120,2360,2600];
  PARKS.forEach(p=>cityObjs.push({t:'park',...p}));
  LOTS.forEach(l=>cityObjs.push({t:'lot',...l}));
  Object.entries(LBUILD).forEach(([id,b])=>{
    const s=id.charCodeAt(0)*19+(id.charCodeAt(1)||0)*7;
    cityObjs.push({t:'bld',x:b.x,y:b.y,w:b.w,h:b.h,seed:s,landmark:true,locId:id});
  });
  let bs=500;
  for(let yi=0;yi<ST.length-1;yi++){
    for(let xi=0;xi<AV.length-1;xi++){
      const bx=AV[xi]+55, by=ST[yi]+55;
      const bw=AV[xi+1]-AV[xi]-110, bh=ST[yi+1]-ST[yi]-110;
      if(bw<25||bh<25){bs+=10;continue;}
      // Skip blok sekitar bundaran (yi=4,5 dan xi=4,5)
      if((yi===4||yi===5)&&(xi===4||xi===5)){bs+=10;continue;}
      const skipL=Object.values(LBUILD).some(b=>Math.abs(b.x-bx)<95&&Math.abs(b.y-by)<95);
      const skipP=PARKS.some(p=>Math.abs(p.x-bx)<55&&Math.abs(p.y-by)<55);
      if(skipL||skipP){bs+=10;continue;}
      const rnd=sr(bs);
      const cnt=rnd<0.4?1:rnd<0.75?2:3;
      const mg=8;
      if(cnt===1){
        cityObjs.push({t:'bld',x:bx+mg,y:by+mg,w:bw-mg*2,h:bh-mg*2,seed:bs,landmark:false,locId:null});
      } else {
        const cols=Math.min(cnt,2),rows=Math.ceil(cnt/cols);
        const cw=Math.floor((bw-mg*(cols+1))/cols),ch=Math.floor((bh-mg*(rows+1))/rows);
        if(cw<18||ch<18){bs+=cnt;continue;}
        let idx=0;
        for(let row=0;row<rows&&idx<cnt;row++)
          for(let col=0;col<cols&&idx<cnt;col++,idx++)
            cityObjs.push({t:'bld',x:bx+mg+(cw+mg)*col,y:by+mg+(ch+mg)*row,w:cw,h:ch,seed:bs+idx*3,landmark:false,locId:null});
      }
      bs+=10;
    }
  }
  PARKS.forEach((p,pi)=>{
    for(let t=0;t<12;t++)
      cityObjs.push({t:'tree',x:p.x+sr(pi*100+t)*p.w,y:p.y+sr(pi*200+t)*p.h,sz:11+sr(pi*300+t)*9,seed:pi*50+t});
  });
  // Pohon tepi jalan dihapus — tidak menimpa jalan
}

// ============================================================
//  DRAW BACKGROUND
// ============================================================
function drawBG(){
  ctx.fillStyle='#3a5828'; ctx.fillRect(0,0,WORLD,WORLD);
  for(let x=0;x<WORLD;x+=96){
    for(let y=0;y<WORLD;y+=96){
      ctx.fillStyle=((x/96|0)+(y/96|0))%2===0?'rgba(0,0,0,0.04)':'rgba(255,255,255,0.02)';
      ctx.fillRect(x,y,96,96);
    }
  }
  ctx.strokeStyle='rgba(0,180,255,.2)'; ctx.lineWidth=6;
  ctx.strokeRect(3,3,WORLD-6,WORLD-6);
}

// ============================================================
//  DRAW JALAN
// ============================================================
function drawRoad(na, nb){
  const type=(na.type==='ring'||nb.type==='ring')?'ring':'main';
  const rw=type==='ring'?36:30;
  const x1=na.x,y1=na.y,x2=nb.x,y2=nb.y;
  ctx.save(); ctx.lineCap='square'; ctx.lineJoin='miter';
  ctx.strokeStyle='#909a94'; ctx.lineWidth=rw+10;
  ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke();
  ctx.strokeStyle='#404e4c'; ctx.lineWidth=rw+2;
  ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke();
  ctx.strokeStyle='#4e5e5c'; ctx.lineWidth=rw;
  ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke();
  const mk=type==='ring'?'rgba(255,220,0,.55)':'rgba(255,255,255,.22)';
  ctx.strokeStyle=mk; ctx.lineWidth=2; ctx.setLineDash([20,14]);
  ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke();
  ctx.setLineDash([]);
  const dx=x2-x1,dy=y2-y1,len=Math.hypot(dx,dy);
  if(len>0){
    const nx=-dy/len*(rw/2-3),ny=dx/len*(rw/2-3);
    ctx.strokeStyle='rgba(255,255,255,.09)'; ctx.lineWidth=1.5;
    ctx.beginPath();ctx.moveTo(x1+nx,y1+ny);ctx.lineTo(x2+nx,y2+ny);ctx.stroke();
    ctx.beginPath();ctx.moveTo(x1-nx,y1-ny);ctx.lineTo(x2-nx,y2-ny);ctx.stroke();
  }
  ctx.restore();
}

function drawIntersection(n){
  ctx.save();
  ctx.fillStyle='#4e5e5c'; ctx.fillRect(n.x-20,n.y-20,40,40);
  ctx.fillStyle='rgba(255,255,255,.07)';
  ctx.fillRect(n.x-20,n.y-20,7,7); ctx.fillRect(n.x+13,n.y-20,7,7);
  ctx.fillRect(n.x-20,n.y+13,7,7); ctx.fillRect(n.x+13,n.y+13,7,7);
  ctx.restore();
}

function drawZebra(x,y,ang){
  ctx.save(); ctx.translate(x,y); ctx.rotate(ang);
  ctx.fillStyle='rgba(60,70,65,.7)'; ctx.fillRect(-22,-12,44,24);
  ctx.fillStyle='rgba(255,255,255,.65)';
  for(let i=0;i<5;i++) ctx.fillRect(-22+i*9,-12,6,24);
  ctx.restore();
}

function drawRoundabout(cx0,cy0,rr){
  // rr = radius titik tengah jalan bundaran (160)
  // Jalan bundaran: ring aspal dari rr-18 sampai rr+18
  ctx.save();

  // Tutup area bundaran dulu dengan tanah hijau (supaya jalan grid tidak terlihat di dalam)
  ctx.beginPath(); ctx.arc(cx0,cy0,rr+22,0,Math.PI*2);
  ctx.fillStyle='#3a5828'; ctx.fill();

  // Jalan bundaran (ring aspal)
  ctx.beginPath(); ctx.arc(cx0,cy0,rr+18,0,Math.PI*2);
  ctx.strokeStyle='#909a94'; ctx.lineWidth=42; ctx.stroke(); // trotoar
  ctx.beginPath(); ctx.arc(cx0,cy0,rr+18,0,Math.PI*2);
  ctx.strokeStyle='#404e4c'; ctx.lineWidth=36; ctx.stroke(); // border
  ctx.beginPath(); ctx.arc(cx0,cy0,rr+18,0,Math.PI*2);
  ctx.strokeStyle='#4e5e5c'; ctx.lineWidth=34; ctx.stroke(); // aspal

  // Marka tengah jalan bundaran
  ctx.setLineDash([18,12]);
  ctx.beginPath(); ctx.arc(cx0,cy0,rr+18,0,Math.PI*2);
  ctx.strokeStyle='rgba(255,220,0,.6)'; ctx.lineWidth=2; ctx.stroke();
  ctx.setLineDash([]);

  // Pulau tengah (taman hijau)
  const rInner = rr-20; // radius pulau tengah
  const g=ctx.createRadialGradient(cx0,cy0,0,cx0,cy0,rInner);
  g.addColorStop(0,'#4a7838'); g.addColorStop(1,'#2a4e18');
  ctx.beginPath(); ctx.arc(cx0,cy0,rInner,0,Math.PI*2);
  ctx.fillStyle=g; ctx.fill();
  ctx.strokeStyle='rgba(0,200,80,.5)'; ctx.lineWidth=2; ctx.stroke();

  // Pohon di pulau tengah
  for(let i=0;i<6;i++){
    const a=i*Math.PI*2/6;
    drawTree(cx0+Math.cos(a)*(rInner-25),cy0+Math.sin(a)*(rInner-25),14,i*13);
  }
  // Pohon tengah
  drawTree(cx0,cy0,18,99);

  // Animasi air mancur di tengah
  const t=Date.now()*.0014;
  const fg=ctx.createRadialGradient(cx0,cy0,0,cx0,cy0,18);
  fg.addColorStop(0,'rgba(0,180,255,.7)'); fg.addColorStop(1,'rgba(0,80,180,.0)');
  ctx.beginPath(); ctx.arc(cx0,cy0,18,0,Math.PI*2); ctx.fillStyle=fg; ctx.fill();
  for(let i=0;i<8;i++){
    const a=i*Math.PI/4+t;
    ctx.fillStyle='rgba(100,220,255,.6)';
    ctx.beginPath(); ctx.arc(cx0+Math.cos(a)*8,cy0+Math.sin(a)*8,3,0,Math.PI*2); ctx.fill();
  }
  ctx.restore();
}


// ============================================================
function drawBuilding(obj){
  const {x:bx,y:by,w:bw,h:bh,seed,landmark,locId}=obj;
  const pal=BPAL[Math.floor(sr(seed)*BPAL.length)];
  ctx.save();
  ctx.fillStyle='rgba(0,0,0,.28)'; ctx.fillRect(bx+5,by+5,bw,bh);
  ctx.fillStyle=pal.base; ctx.fillRect(bx,by,bw,bh);
  ctx.fillStyle=pal.rim;
  ctx.fillRect(bx,by,bw,4); ctx.fillRect(bx,by,4,bh);
  ctx.fillRect(bx+bw-4,by,4,bh); ctx.fillRect(bx,by+bh-4,bw,4);
  const mg=Math.min(bw,bh)*0.14;
  ctx.fillStyle=pal.roof; ctx.fillRect(bx+mg,by+mg,bw-mg*2,bh-mg*2);
  const wC=Math.max(1,Math.floor((bw-mg*2)/22));
  const wR=Math.max(1,Math.floor((bh-mg*2)/22));
  for(let r=0;r<wR;r++){
    for(let c=0;c<wC;c++){
      const wx2=bx+mg+(bw-mg*2)/(wC+1)*(c+1)-4;
      const wy2=by+mg+(bh-mg*2)/(wR+1)*(r+1)-4;
      if(wx2+8>bx+bw-mg||wy2+8>by+bh-mg) continue;
      const lit=sr(seed*77+r*13+c)>.28;
      ctx.fillStyle=lit?(pal.win+(0.5+sr(seed+r+c)*.44)+')'):'rgba(20,28,36,.85)';
      ctx.fillRect(wx2,wy2,8,8);
      if(lit){ctx.fillStyle='rgba(255,255,255,.18)';ctx.fillRect(wx2,wy2,3,2);}
    }
  }
  if(bw>60&&bh>60&&sr(seed*3)>.5){
    const as=Math.min(bw,bh)*.18;
    ctx.fillStyle='rgba(80,90,100,.9)'; ctx.fillRect(bx+bw/2-as/2,by+bh/2-as/2,as,as);
  }
  if(bh>70&&sr(seed*5)>.5){
    const ax2=bx+bw/2;
    ctx.strokeStyle='rgba(160,180,200,.55)'; ctx.lineWidth=1.5;
    ctx.beginPath(); ctx.moveTo(ax2,by+5); ctx.lineTo(ax2,by-14); ctx.stroke();
    const bl=Math.sin(Date.now()*.004+seed)>.1;
    ctx.fillStyle=bl?'rgba(255,60,60,.95)':'rgba(255,60,60,.1)';
    if(bl){ctx.shadowColor='#f44';ctx.shadowBlur=7;}
    ctx.beginPath(); ctx.arc(ax2,by-16,2.5,0,Math.PI*2); ctx.fill();
    ctx.shadowBlur=0;
  }
  if(landmark){
    ctx.strokeStyle='rgba(0,200,255,.6)'; ctx.lineWidth=2;
    ctx.shadowColor='#00e5ff'; ctx.shadowBlur=9;
    ctx.strokeRect(bx+1,by+1,bw-2,bh-2); ctx.shadowBlur=0;
    if(locId){
      const loc=LOCS.find(l=>l.id===locId); if(loc){
        const lx=bx+bw/2, ly=by-6;
        ctx.strokeStyle=loc.col+'66'; ctx.lineWidth=1; ctx.setLineDash([3,3]);
        ctx.beginPath(); ctx.moveTo(lx,ly); ctx.lineTo(lx,ly-18); ctx.stroke(); ctx.setLineDash([]);
        ctx.fillStyle='rgba(3,10,22,.9)';
        ctx.beginPath();
        ctx.roundRect?ctx.roundRect(lx-26,ly-40,52,22,5):ctx.rect(lx-26,ly-40,52,22);
        ctx.fill();
        ctx.strokeStyle=loc.col+'aa'; ctx.lineWidth=1.2; ctx.stroke();
        ctx.font='12px serif'; ctx.textAlign='center'; ctx.fillStyle='#fff';
        ctx.fillText(loc.ico,lx,ly-23);
        ctx.font='bold 7px Rajdhani,sans-serif'; ctx.fillStyle=loc.col;
        ctx.fillText(loc.nm.slice(0,12),lx,ly-46);
      }
    }
  }
  ctx.restore();
}

// ============================================================
//  DRAW POHON
// ============================================================
function drawTree(tx,ty,sz,seed){
  ctx.save();
  ctx.fillStyle='rgba(0,0,0,.2)';
  ctx.beginPath(); ctx.ellipse(tx+2,ty+2,sz*.88,sz*.7,0,0,Math.PI*2); ctx.fill();
  const h=108+sr(seed)*24;
  ctx.fillStyle=`hsl(${h},50%,20%)`; ctx.beginPath(); ctx.arc(tx,ty,sz,0,Math.PI*2); ctx.fill();
  ctx.fillStyle=`hsl(${h+6},56%,29%)`; ctx.beginPath(); ctx.arc(tx-sz*.12,ty-sz*.12,sz*.7,0,Math.PI*2); ctx.fill();
  ctx.fillStyle=`hsl(${h+12},62%,38%)`; ctx.beginPath(); ctx.arc(tx-sz*.2,ty-sz*.18,sz*.42,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='rgba(200,255,120,.18)';
  ctx.beginPath(); ctx.ellipse(tx-sz*.22,ty-sz*.3,sz*.18,sz*.11,-.3,0,Math.PI*2); ctx.fill();
  ctx.restore();
}

function drawPark(p){
  ctx.save();
  const g=ctx.createLinearGradient(p.x,p.y,p.x+p.w,p.y+p.h);
  g.addColorStop(0,'#2e5a1e'); g.addColorStop(1,'#1e4012');
  ctx.fillStyle=g; ctx.fillRect(p.x,p.y,p.w,p.h);
  ctx.strokeStyle='rgba(0,180,60,.35)'; ctx.lineWidth=2; ctx.strokeRect(p.x,p.y,p.w,p.h);
  ctx.strokeStyle='#7a6a4a'; ctx.lineWidth=5; ctx.setLineDash([10,7]);
  ctx.beginPath();
  ctx.moveTo(p.x+p.w*.15,p.y+p.h*.5);
  ctx.bezierCurveTo(p.x+p.w*.35,p.y+p.h*.15,p.x+p.w*.65,p.y+p.h*.85,p.x+p.w*.85,p.y+p.h*.5);
  ctx.stroke(); ctx.setLineDash([]);
  ctx.fillStyle='rgba(0,80,160,.38)'; ctx.strokeStyle='rgba(0,150,255,.35)'; ctx.lineWidth=1.5;
  ctx.beginPath(); ctx.ellipse(p.x+p.w*.5,p.y+p.h*.5,p.w*.12,p.h*.09,0,0,Math.PI*2);
  ctx.fill(); ctx.stroke();
  ctx.restore();
}

function drawParking(p){
  ctx.save();
  ctx.fillStyle='#2a3330'; ctx.fillRect(p.x,p.y,p.w,p.h);
  ctx.strokeStyle='rgba(255,220,0,.32)'; ctx.lineWidth=1.5;
  const sp=Math.max(2,Math.floor(p.w/20));
  for(let i=0;i<=sp;i++){
    const sx=p.x+i*(p.w/sp);
    ctx.beginPath(); ctx.moveTo(sx,p.y+4); ctx.lineTo(sx,p.y+p.h-4); ctx.stroke();
  }
  ctx.fillStyle='rgba(0,120,255,.28)'; ctx.font='bold 14px Orbitron,monospace';
  ctx.textAlign='center'; ctx.fillText('P',p.x+p.w/2,p.y+p.h/2+5);
  ctx.strokeStyle='rgba(255,220,0,.22)'; ctx.lineWidth=1; ctx.strokeRect(p.x,p.y,p.w,p.h);
  ctx.restore();
}

// ============================================================
//  DRAW PATH DIJKSTRA
// ============================================================
let currentPath = [];
let pathAnimT   = 0;
let visitedNodes= [];

function drawPath(){
  if(currentPath.length < 2) return;
  ctx.save();
  visitedNodes.forEach(id=>{
    const n=nodes[id]; if(!n)return;
    ctx.fillStyle='rgba(0,80,200,.1)';
    ctx.beginPath(); ctx.arc(n.x,n.y,8,0,Math.PI*2); ctx.fill();
  });
  const pc=Math.floor(currentPath.length*Math.min(1,pathAnimT));
  if(pc>1){
    const n0=nodes[currentPath[0]]; if(!n0){ctx.restore();return;}
    ctx.lineWidth=16; ctx.lineCap='round'; ctx.lineJoin='round';
    ctx.strokeStyle='rgba(0,220,255,.07)';
    ctx.beginPath(); ctx.moveTo(n0.x,n0.y);
    for(let i=1;i<pc;i++){const n=nodes[currentPath[i]];if(n)ctx.lineTo(n.x,n.y);}
    ctx.stroke();
    ctx.lineWidth=4.5; ctx.strokeStyle='rgba(0,230,255,.9)';
    ctx.shadowColor='#00e5ff'; ctx.shadowBlur=14;
    ctx.beginPath(); ctx.moveTo(n0.x,n0.y);
    for(let i=1;i<pc;i++){const n=nodes[currentPath[i]];if(n)ctx.lineTo(n.x,n.y);}
    ctx.stroke(); ctx.shadowBlur=0;
  }
  currentPath.forEach((id,i)=>{
    if(i>pc) return;
    const n=nodes[id]; if(!n)return;
    const isEnd=(i===0||i===currentPath.length-1);
    ctx.shadowColor='#00e5ff'; ctx.shadowBlur=isEnd?16:5;
    ctx.fillStyle=i===0?'#ffd700':(i===currentPath.length-1?'#ff3a3a':'#00e5ff');
    ctx.beginPath(); ctx.arc(n.x,n.y,isEnd?9:3.5,0,Math.PI*2); ctx.fill();
    ctx.shadowBlur=0;
  });
  ctx.restore();
}

// ============================================================
//  DRAW FLAG
// ============================================================
function drawFlag(fx,fy,col,lbl){
  ctx.save();
  ctx.strokeStyle='rgba(255,255,255,.75)'; ctx.lineWidth=2;
  ctx.beginPath(); ctx.moveTo(fx,fy-4); ctx.lineTo(fx,fy-44); ctx.stroke();
  ctx.fillStyle=col;
  ctx.beginPath(); ctx.moveTo(fx,fy-44); ctx.lineTo(fx+24,fy-32); ctx.lineTo(fx,fy-20); ctx.fill();
  ctx.font='bold 8px Orbitron,monospace'; ctx.fillStyle='rgba(0,0,0,.9)'; ctx.textAlign='center';
  ctx.fillText(lbl,fx+12,fy-29);
  ctx.strokeStyle=col; ctx.lineWidth=2.5;
  ctx.globalAlpha=.35+.28*Math.sin(Date.now()*.006);
  ctx.beginPath(); ctx.arc(fx,fy,11,0,Math.PI*2); ctx.stroke();
  ctx.restore();
}

function drawFlags(){
  if(playerCar.path.length>0){
    const n=nodes[playerCar.path[0]]; if(n) drawFlag(n.x,n.y,'#ffd700','START');
  }
  if(playerCar.destNodeId!=null){
    const n=nodes[playerCar.destNodeId]; if(n) drawFlag(n.x,n.y,'#ff3a3a','END');
  }
}

// ============================================================
//  DRAW MOBIL (world-space)
// ============================================================
function carRRect(x,y,w,h,r){
  r=Math.min(r,w/2,h/2);
  ctx.beginPath();
  ctx.moveTo(x+r,y);
  ctx.lineTo(x+w-r,y); ctx.quadraticCurveTo(x+w,y,x+w,y+r);
  ctx.lineTo(x+w,y+h-r); ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
  ctx.lineTo(x+r,y+h); ctx.quadraticCurveTo(x,y+h,x,y+h-r);
  ctx.lineTo(x,y+r); ctx.quadraticCurveTo(x,y,x+r,y);
  ctx.closePath();
}

function drawCar(car, isPlayer){
  const L  = isPlayer ? 52 : 40;
  const WW = isPlayer ? 28 : 22;
  ctx.save();
  ctx.translate(car.x, car.y);
  ctx.rotate(car.angle);
  const col = isPlayer ? '#00dd88' : car.color;
  ctx.fillStyle='rgba(0,0,0,.35)';
  ctx.beginPath(); ctx.ellipse(4,6,L*.45,WW*.42,0,0,Math.PI*2); ctx.fill();
  ctx.fillStyle=col;
  carRRect(-L/2,-WW/2,L,WW,WW*.3); ctx.fill();
  ctx.fillStyle='rgba(255,255,255,.15)';
  carRRect(-L/2,-WW/2,L,WW*.4,WW*.3); ctx.fill();
  ctx.fillStyle='rgba(0,0,0,.18)';
  carRRect(-L*.5,-WW*.44,L*.2,WW*.88,WW*.15); ctx.fill();
  ctx.fillStyle='rgba(0,0,0,.18)';
  carRRect(L*.3,-WW*.44,L*.2,WW*.88,WW*.15); ctx.fill();
  ctx.fillStyle=isPlayer?'rgba(0,255,200,.72)':'rgba(180,230,255,.68)';
  ctx.beginPath();
  ctx.moveTo(L*.3,-WW*.4); ctx.lineTo(L*.5,-WW*.3);
  ctx.lineTo(L*.5,WW*.3); ctx.lineTo(L*.3,WW*.4);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle='rgba(100,150,180,.55)';
  ctx.beginPath();
  ctx.moveTo(-L*.3,-WW*.38); ctx.lineTo(-L*.5,-WW*.28);
  ctx.lineTo(-L*.5,WW*.28); ctx.lineTo(-L*.3,WW*.38);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle='rgba(150,210,240,.38)';
  ctx.fillRect(-L*.28,-WW*.5,L*.56,WW*.1);
  ctx.fillRect(-L*.28,WW*.4,L*.56,WW*.1);
  ctx.fillStyle=isPlayer?'rgba(200,255,220,.98)':'rgba(255,255,180,.98)';
  ctx.shadowColor=isPlayer?'#aaffcc':'#ffff88'; ctx.shadowBlur=10;
  ctx.fillRect(L*.48,-WW*.38,L*.04,WW*.18);
  ctx.fillRect(L*.48,WW*.2,L*.04,WW*.18);
  ctx.shadowBlur=0;
  ctx.fillStyle='rgba(255,40,40,.98)';
  ctx.shadowColor='#ff2222'; ctx.shadowBlur=8;
  ctx.fillRect(-L*.52,-WW*.38,L*.04,WW*.18);
  ctx.fillRect(-L*.52,WW*.2,L*.04,WW*.18);
  ctx.shadowBlur=0;
  [[-L*.3,-WW*.5],[L*.22,-WW*.5],[-L*.3,WW*.5],[L*.22,WW*.5]].forEach(([wx,wy])=>{
    ctx.fillStyle='#111';
    ctx.beginPath(); ctx.ellipse(wx,wy,8,5,0,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#555';
    ctx.beginPath(); ctx.ellipse(wx,wy,4.5,2.8,0,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#888';
    ctx.beginPath(); ctx.arc(wx,wy,1.5,0,Math.PI*2); ctx.fill();
  });
  if(isPlayer){
    ctx.shadowColor=col; ctx.shadowBlur=20;
    ctx.strokeStyle='rgba(0,255,160,.5)'; ctx.lineWidth=2;
    carRRect(-L/2,-WW/2,L,WW,WW*.3); ctx.stroke();
    ctx.shadowBlur=0;
  }
  const lbl=isPlayer?'🚗 PLAYER':(car.icon||'🚕')+' '+(car.name||'');
  ctx.font=`bold ${isPlayer?13:11}px Rajdhani,sans-serif`;
  ctx.textAlign='center'; ctx.textBaseline='bottom';
  const tw=ctx.measureText(lbl).width;
  ctx.fillStyle='rgba(0,0,0,.7)';
  carRRect(-tw/2-4,-WW/2-20,tw+8,18,4); ctx.fill();
  ctx.fillStyle=isPlayer?'#00ffcc':(car.color||'#fff');
  if(isPlayer){ctx.shadowColor='#00ffaa';ctx.shadowBlur=8;}
  ctx.fillText(lbl,0,-WW/2-4);
  ctx.shadowBlur=0; ctx.textBaseline='alphabetic';
  ctx.restore();
  if(isPlayer && car.trail && car.trail.length>1){
    for(let i=1;i<car.trail.length;i++){
      const pt=i/car.trail.length;
      ctx.strokeStyle=`rgba(0,220,130,${pt*.32})`;
      ctx.lineWidth=10*pt; ctx.lineCap='round';
      ctx.beginPath();
      ctx.moveTo(car.trail[i-1].x,car.trail[i-1].y);
      ctx.lineTo(car.trail[i].x,car.trail[i].y);
      ctx.stroke();
    }
  }
  if(isPlayer && car.path && car.path.length>=2 && car.pathIdx<car.path.length-1){
    const pulse=(Math.sin(Date.now()*.006)+1)*.5;
    ctx.strokeStyle=`rgba(0,255,160,${0.18+pulse*.38})`;
    ctx.lineWidth=3;
    ctx.beginPath(); ctx.arc(car.x,car.y,40+pulse*16,0,Math.PI*2); ctx.stroke();
  }
}

// ============================================================
//  PLAYER CAR
// ============================================================
let playerCar = {
  x:200, y:200, angle:0,
  path:[], pathIdx:0, t:0,
  speed:5,
  destNodeId:null,
  trail:[],
  color:'#00dd88'
};

function moveCarAlongPath(car){
  if(!car.path || car.path.length < 2) return;
  if(car.pathIdx >= car.path.length - 1){
    if(car !== playerCar){
      const ns=car.path[car.path.length-1];
      let nd=Math.floor(Math.random()*nodes.length);
      for(let _=0;_<10&&nd===ns;_++) nd=Math.floor(Math.random()*nodes.length);
      const {path}=dijkstra(ns,nd);
      if(path.length>1){ car.path=path; car.pathIdx=0; car.t=0; }
    }
    return;
  }
  let na=nodes[car.path[car.pathIdx]];
  let nb=nodes[car.path[car.pathIdx+1]];
  if(!na||!nb) return;
  let dx=nb.x-na.x, dy=nb.y-na.y;
  let segLen=Math.sqrt(dx*dx+dy*dy);
  if(segLen<1){ car.pathIdx++; return; }
  car.t += car.speed/segLen;
  if(car.t>=1){ car.t=0; car.pathIdx++; return; }
  car.x=na.x+dx*car.t;
  car.y=na.y+dy*car.t;
  car.angle=Math.atan2(dy,dx);
  if(car===playerCar){
    car.trail.push({x:car.x,y:car.y});
    if(car.trail.length>26) car.trail.shift();
  }
}

// ============================================================
//  NPC CARS
// ============================================================
let npcCars = [];
const NPC_COLORS=['#ff5555','#ffdd22','#44ee77','#4488ff','#ff55bb','#ff9933','#aa55ff','#55ddff'];
const NPC_NAMES =['Syhara','Septi','Nurpaisyah','Rydoi','Ama','Syhara','Septi','Nurpaisyah'];
const NPC_ICONS =['🚗','🚕','🚙','🚌','🏎️','🚐','🚑','🚓'];

function initNPCs(){
  npcCars=[];
  for(let i=0;i<8;i++){
    const s=Math.floor(sr(i*17)*nodes.length);
    let d=Math.floor(sr(i*31+5)*nodes.length);
    for(let _=0;_<10&&d===s;_++) d=Math.floor(Math.random()*nodes.length);
    const {path}=dijkstra(s,d);
    const sn=nodes[s]; if(!sn) continue;
    npcCars.push({
      x:sn.x,y:sn.y,angle:0,
      path,pathIdx:0,t:0,
      speed:0.9+sr(i*47)*1.1,
      color:NPC_COLORS[i],
      name:NPC_NAMES[i],
      icon:NPC_ICONS[i],
    });
  }
  buildNPCPanel();
}

function buildNPCPanel(){
  const nb=document.getElementById('npcBody'); nb.innerHTML='';
  npcCars.forEach((c,i)=>{
    const div=document.createElement('div'); div.className='npcItem';
    div.innerHTML=`<div class="nDot" style="background:${c.color};box-shadow:0 0 6px ${c.color}"></div>
      <div class="nInfo">
        <div class="nVeh">${c.icon} ${c.name}</div>
        <div class="nRt" id="nr${i}">Routing…</div>
      </div>`;
    div.onclick=()=>{ cam.x=c.x; cam.y=c.y; followCar=false; };
    nb.appendChild(div);
  });
}

// ============================================================
//  SET ROUTE
// ============================================================
function setRoute(srcId, dstId, srcName, dstName){
  if(srcId==null||dstId==null||srcId===dstId) return;
  const {path,cost,visited}=dijkstra(srcId,dstId);
  if(!path||path.length<2){ document.getElementById('algSt').textContent='NO PATH'; return; }
  currentPath=path; visitedNodes=visited; pathAnimT=0;
  playerCar.path=path; playerCar.pathIdx=0; playerCar.t=0;
  playerCar.destNodeId=dstId; playerCar.trail=[];
  const startNode=nodes[srcId];
  if(startNode){ playerCar.x=startNode.x; playerCar.y=startNode.y; }
  followCar=true;
  document.getElementById('bFol').classList.add('on');
  document.getElementById('tvCost').textContent=cost<Infinity?Math.round(cost)+'u':'N/A';
  document.getElementById('tvNds').textContent=path.length;
  document.getElementById('srcNm').textContent=srcName||'Node '+srcId;
  document.getElementById('dstNm').textContent=dstName||'Node '+dstId;
  document.getElementById('algSt').textContent='RUNNING';
  document.getElementById('algVis').textContent=visited.length;
  document.getElementById('algLen').textContent=path.length;
  document.getElementById('algDst').textContent=cost<Infinity?Math.round(cost)+'u':'N/A';
  document.getElementById('tvSt').textContent='ACTIVE';
  document.getElementById('tvSt').style.color='#0f0';
  document.getElementById('stPath').textContent=`Rute: ${srcName} → ${dstName}`;
  const nl=document.getElementById('nList'); nl.innerHTML='';
  path.slice(0,16).forEach((id,i)=>{
    const c=document.createElement('div');
    c.className='nChip'+(i===0?' cur':'');
    c.textContent='N'+id; nl.appendChild(c);
  });
  pathAnimT=0;
  const iv=setInterval(()=>{
    pathAnimT=Math.min(1,pathAnimT+0.05);
    document.getElementById('pBar').style.width=(pathAnimT*100)+'%';
    if(pathAnimT>=1) clearInterval(iv);
  },28);
}

// ============================================================
//  LOC BUTTONS
// ============================================================
let selSrc=null, selDst=null, clickT={};
function buildLocBtns(){
  const g=document.getElementById('locGrid'); g.innerHTML='';
  LOCS.forEach(loc=>{
    const btn=document.createElement('div'); btn.className='locBtn'; btn.id='lb_'+loc.id;
    btn.innerHTML=`<span class="locIcon">${loc.ico}</span><div class="locName">${loc.nm}</div>`;
    btn.onclick=()=>{
      if(!clickT[loc.id]){
        clickT[loc.id]=setTimeout(()=>{
          clickT[loc.id]=null;
          document.querySelectorAll('.locBtn').forEach(b=>b.classList.remove('sel-s'));
          btn.classList.add('sel-s');
          selSrc=loc;
          document.getElementById('srcNm').textContent=loc.nm;
          if(selDst&&selDst.node!=null&&loc.node!=null)
            setRoute(loc.node,selDst.node,loc.nm,selDst.nm);
        },260);
      } else {
        clearTimeout(clickT[loc.id]); clickT[loc.id]=null;
        document.querySelectorAll('.locBtn').forEach(b=>b.classList.remove('sel-d'));
        btn.classList.add('sel-d');
        selDst=loc;
        document.getElementById('dstNm').textContent=loc.nm;
        if(selSrc&&selSrc.node!=null&&loc.node!=null)
          setRoute(selSrc.node,loc.node,selSrc.nm,loc.nm);
      }
    };
    g.appendChild(btn);
  });
}

// ============================================================
//  MINIMAP
// ============================================================
function drawMinimap(){
  mctx.clearRect(0,0,155,155);
  mctx.fillStyle='#182818'; mctx.fillRect(0,0,155,155);
  const sx=155/WORLD, sy=155/WORLD;
  mctx.strokeStyle='#2a4840'; mctx.lineWidth=2;
  edges.forEach(e=>{
    const a=nodes[e.a],b=nodes[e.b]; if(!a||!b) return;
    mctx.beginPath(); mctx.moveTo(a.x*sx,a.y*sy); mctx.lineTo(b.x*sx,b.y*sy); mctx.stroke();
  });
  if(currentPath.length>1){
    mctx.strokeStyle='rgba(0,220,255,.88)'; mctx.lineWidth=2; mctx.beginPath();
    currentPath.forEach((id,i)=>{
      const n=nodes[id]; if(!n) return;
      i===0?mctx.moveTo(n.x*sx,n.y*sy):mctx.lineTo(n.x*sx,n.y*sy);
    }); mctx.stroke();
  }
  LOCS.forEach(l=>{
    if(l.node==null) return; const n=nodes[l.node]; if(!n) return;
    mctx.fillStyle=l.col;
    mctx.beginPath(); mctx.arc(n.x*sx,n.y*sy,3,0,Math.PI*2); mctx.fill();
  });
  mctx.fillStyle='#00e5ff';
  mctx.beginPath(); mctx.arc(playerCar.x*sx,playerCar.y*sy,4.5,0,Math.PI*2); mctx.fill();
  npcCars.forEach(c=>{
    mctx.fillStyle=c.color;
    mctx.beginPath(); mctx.arc(c.x*sx,c.y*sy,2.5,0,Math.PI*2); mctx.fill();
  });
  const vp=document.getElementById('mmV');
  vp.style.left=Math.max(0,(cam.x-W/2/cam.zoom)*sx)+'px';
  vp.style.top=Math.max(0,(cam.y-H/2/cam.zoom)*sy)+'px';
  vp.style.width=Math.min(155,(W/cam.zoom)*sx)+'px';
  vp.style.height=Math.min(155,(H/cam.zoom)*sy)+'px';
}

// ============================================================
//  UPDATE
// ============================================================
let frameCount=0;
function update(){
  if(paused) return;
  frameCount++;
  moveCarAlongPath(playerCar);
  if(playerCar.path.length>=2 && playerCar.pathIdx>=playerCar.path.length-1 && playerCar.t===0){
    document.getElementById('algSt').textContent='ARRIVED';
    document.getElementById('tvSt').textContent='DONE';
    document.getElementById('tvSt').style.color='#ffd700';
  }
  // npcCars.forEach(moveCarAlongPath);
  if(followCar){
    cam.x+=(playerCar.x-cam.x)*.08;
    cam.y+=(playerCar.y-cam.y)*.08;
  }
  document.getElementById('tvSpd').textContent=Math.round(32+Math.sin(Date.now()*.0012)*14)+' km/h';
  document.getElementById('tvZm').textContent=cam.zoom.toFixed(2)+'×';
  document.querySelectorAll('.nChip').forEach((c,i)=>{
    c.classList.remove('cur','vis');
    if(i<playerCar.pathIdx) c.classList.add('vis');
    else if(i===playerCar.pathIdx) c.classList.add('cur');
  });
  if(frameCount%35===0){
    npcCars.forEach((c,i)=>{
      const el=document.getElementById('nr'+i); if(!el) return;
      const nd=c.path&&c.path.length?nodes[c.path[c.path.length-1]]:null;
      el.textContent=nd?`→ Node ${nd.id}`:'Routing…';
    });
  }
}

// ============================================================
//  RENDER
// ============================================================
function render(){
  ctx.clearRect(0,0,W,H);
  ctx.save();
  ctx.translate(W/2,H/2);
  ctx.scale(cam.zoom,cam.zoom);
  ctx.translate(-cam.x,-cam.y);

  drawBG();

  // Layer 1: taman & parkir
  cityObjs.filter(o=>o.t==='park').forEach(o=>drawPark(o));
  cityObjs.filter(o=>o.t==='lot').forEach(o=>drawParking(o));

  // Layer 2: JALAN GRID — skip noRender, skip rbt, skip hidden
  edges.forEach(e=>{
    if(e.noRender) return;
    const na=nodes[e.a], nb=nodes[e.b]; if(!na||!nb) return;
    if(na.type==='rbt'||nb.type==='rbt') return;
    if(na.hidden||nb.hidden) return;
    drawRoad(na,nb);
  });
  // Jalan masuk bundaran (grid→rbt) — digambar sebagai jalan biasa
  edges.forEach(e=>{
    if(e.noRender) return;
    const na=nodes[e.a], nb=nodes[e.b]; if(!na||!nb) return;
    const oneRbt=(na.type==='rbt')!==(nb.type==='rbt'); // tepat satu rbt
    if(!oneRbt) return;
    drawRoad(na,nb);
  });
  // Persimpangan
  nodes.forEach(n=>{ if(n.type==='inter'&&!n.hidden) drawIntersection(n); });

  // Layer 3: BUNDARAN — di atas jalan grid, menutupi ujung jalan
  drawRoundabout(1400,1400,160);

  // Layer 4: GEDUNG — skip jika di atas garis jalan atau zona bundaran
  const ROAD=[200,440,680,920,1160,1400,1640,1880,2120,2360,2600];
  cityObjs.filter(o=>o.t==='bld').forEach(o=>{
    const cx=o.x+o.w/2, cy=o.y+o.h/2;
    // Skip gedung di zona bundaran
    if(Math.hypot(cx-1400,cy-1400)<220) return;
    // Skip gedung yg pusat-nya tepat di garis jalan (koordinat AV atau ST ±38px)
    if(ROAD.some(v=>Math.abs(cx-v)<38) && ROAD.some(v=>Math.abs(cy-v)<38)) return;
    // Skip gedung yg sisi-nya tumpang tindih dengan garis jalan
    const onRoadX=ROAD.some(v=>cx-o.w/2<v+20 && cx+o.w/2>v-20 && Math.abs(cy-v)>50);
    const onRoadY=ROAD.some(v=>cy-o.h/2<v+20 && cy+o.h/2>v-20 && Math.abs(cx-v)>50);
    if(onRoadX||onRoadY) return;
    drawBuilding(o);
  });

  // Layer 5: POHON — skip jika di atas garis jalan atau zona bundaran
  cityObjs.filter(o=>o.t==='tree').forEach(o=>{
    if(ROAD.some(v=>Math.abs(o.x-v)<38)) return;
    if(ROAD.some(v=>Math.abs(o.y-v)<38)) return;
    if(Math.hypot(o.x-1400,o.y-1400)<210) return;
    drawTree(o.x,o.y,o.sz,o.seed);
  });

  // Zebra cross
  [
    [440,200,0],[680,200,0],[920,200,0],[200,440,Math.PI/2],
    [1640,200,0],[200,1640,Math.PI/2],
    [2600,200,0],[200,2600,Math.PI/2],[2600,2600,0],[2600,1400,Math.PI/2],
    [920,680,0],[680,920,Math.PI/2],[1640,920,0],[1880,680,Math.PI/2],
  ].forEach(([zx,zy,ang])=>drawZebra(zx,zy,ang));

  drawPath();
  drawFlags();
  drawCar(playerCar,true);
  ctx.restore();
  drawMinimap();
}


// ============================================================
//  GAME LOOP
// ============================================================
function loop(){ update(); render(); requestAnimationFrame(loop); }

// ============================================================
//  INPUT
// ============================================================
canvas.addEventListener('mousedown',e=>{
  isDragging=true; dragStart={x:e.clientX,y:e.clientY}; camStart={x:cam.x,y:cam.y};
});
canvas.addEventListener('mousemove',e=>{
  if(isDragging){ cam.x=camStart.x-(e.clientX-dragStart.x)/cam.zoom; cam.y=camStart.y-(e.clientY-dragStart.y)/cam.zoom; }
});
canvas.addEventListener('mouseup',e=>{
  const moved=Math.abs(e.clientX-dragStart.x)+Math.abs(e.clientY-dragStart.y);
  isDragging=false;
  if(moved<5){
    const {x:wx,y:wy}=s2w(e.clientX,e.clientY);
    const d=closestNode(wx,wy);
    const s=selSrc&&selSrc.node!=null?selSrc.node:closestNode(playerCar.x,playerCar.y);
    setRoute(s,d,selSrc?selSrc.nm:'Posisi Kini','Titik Peta');
  }
});
canvas.addEventListener('mouseleave',()=>isDragging=false);
canvas.addEventListener('wheel',e=>{
  e.preventDefault();
  cam.zoom=Math.max(0.2,Math.min(5,cam.zoom*(e.deltaY<0?1.12:.9)));
},{passive:false});

let _lt=null;
canvas.addEventListener('touchstart',e=>{
  e.preventDefault();
  const t=e.touches[0];
  isDragging=true; dragStart={x:t.clientX,y:t.clientY}; camStart={x:cam.x,y:cam.y};
},{passive:false});
canvas.addEventListener('touchmove',e=>{
  e.preventDefault();
  if(isDragging&&e.touches.length===1){
    const t=e.touches[0];
    cam.x=camStart.x-(t.clientX-dragStart.x)/cam.zoom;
    cam.y=camStart.y-(t.clientY-dragStart.y)/cam.zoom;
  }
},{passive:false});
canvas.addEventListener('touchend',()=>isDragging=false,{passive:false});

document.getElementById('bZI').onclick=()=>cam.zoom=Math.min(5,cam.zoom*1.2);
document.getElementById('bZO').onclick=()=>cam.zoom=Math.max(0.2,cam.zoom*.85);
document.getElementById('bRes').onclick=()=>{ cam.x=WORLD/2; cam.y=WORLD/2; cam.zoom=0.72; };
document.getElementById('bFol').onclick=()=>{
  followCar=!followCar;
  document.getElementById('bFol').classList.toggle('on',followCar);
};
document.getElementById('bRnd').onclick=()=>{
  // Acak POSISI: start & tujuan keduanya acak
  const s=Math.floor(Math.random()*nodes.length);
  const d=Math.floor(Math.random()*nodes.length);
  selSrc=null; selDst=null;
  document.querySelectorAll('.locBtn').forEach(b=>{ b.classList.remove('sel-s','sel-d'); });
  playerCar.x=nodes[s]?nodes[s].x:playerCar.x;
  playerCar.y=nodes[s]?nodes[s].y:playerCar.y;
  setRoute(s,d,'Posisi Acak','Tujuan Acak');
};
document.getElementById('bAcakMap').onclick=()=>{
  // Acak Maps: regenerasi peta dengan seed acak (ubah jitter seed)
  mapSeed = Math.random()*9999|0;
  nodes=[]; edges=[]; adjList={};
  buildGraph();
  assignLocNodes();
  buildCityObjects();
  buildLocBtns();
  initNPCs();
  currentPath=[]; visitedNodes=[]; playerCar.path=[];
  playerCar.destNodeId=null; playerCar.trail=[];
  const h=LOCS.find(l=>l.id==='hospital');
  const p=LOCS.find(l=>l.id==='police');
  selSrc=null; selDst=null;
  document.getElementById('srcNm').textContent='Pilih lokasi…';
  document.getElementById('dstNm').textContent='Pilih lokasi…';
  document.getElementById('algSt').textContent='IDLE';
  cam.x=WORLD/2; cam.y=WORLD/2; cam.zoom=0.72;
};
document.getElementById('bPause').onclick=()=>{
  paused=!paused;
  document.getElementById('bPause').textContent=paused?'▶':'⏸';
  document.getElementById('bPause').classList.toggle('on',paused);
  document.getElementById('pOverlay').classList.toggle('show',paused);
  document.getElementById('tvSt').textContent=paused?'PAUSED':'ACTIVE';
  document.getElementById('tvSt').style.color=paused?'#fa0':'#0f0';
};
document.getElementById('bStar').onclick=()=>{
  starred=!starred;
  document.getElementById('bStar').classList.toggle('starred',starred);
};
document.getElementById('bResume').onclick=()=>{
  paused=false;
  document.getElementById('bPause').textContent='⏸';
  document.getElementById('bPause').classList.remove('on');
  document.getElementById('pOverlay').classList.remove('show');
  document.getElementById('tvSt').textContent='ACTIVE';
  document.getElementById('tvSt').style.color='#0f0';
};
document.getElementById('bResumeRnd').onclick=()=>{
  paused=false;
  document.getElementById('bPause').textContent='⏸';
  document.getElementById('bPause').classList.remove('on');
  document.getElementById('pOverlay').classList.remove('show');
  const d=Math.floor(Math.random()*nodes.length);
  const s=selSrc&&selSrc.node!=null?selSrc.node:closestNode(playerCar.x,playerCar.y);
  setRoute(s,d,selSrc?selSrc.nm:'Posisi Kini','Rute Acak');
};
document.getElementById('npcHdr').onclick=()=>
  document.getElementById('npcPanel').classList.toggle('open');

// ============================================================
//  INIT
// ============================================================
buildGraph();
assignLocNodes();
buildCityObjects();
buildLocBtns();
initNPCs();
cam.x=WORLD/2; cam.y=WORLD/2; cam.zoom=0.72;

setTimeout(()=>{
  const h=LOCS.find(l=>l.id==='hospital');
  const p=LOCS.find(l=>l.id==='police');
  if(h&&p&&h.node!=null&&p.node!=null){
    document.getElementById('lb_hospital').classList.add('sel-s');
    document.getElementById('lb_police').classList.add('sel-d');
    selSrc=h; selDst=p;
    setRoute(h.node,p.node,h.nm,p.nm);
  }
},300);

requestAnimationFrame(loop);
