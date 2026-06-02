// ============================================================
//  dijkstra.js — Tugas: Syhara Suheti (2401020067)
//  Implementasi Algoritma Dijkstra & Struktur Graf
// ============================================================
'use strict';

// ============================================================
//  GRAPH — variabel global dipakai modul lain
// ============================================================
let nodes = [];
let edges = [];
let adjList = {};

function addNode(x, y, type = 'road') {
  const id = nodes.length;
  nodes.push({ id, x, y, type });
  adjList[id] = [];
  return id;
}

function addEdge(a, b, noRender = false) {
  if (a == null || b == null || a === b) return;
  const na = nodes[a], nb = nodes[b];
  const w = Math.hypot(na.x - nb.x, na.y - nb.y);
  adjList[a].push({ to: b, w });
  adjList[b].push({ to: a, w });
  edges.push({ a, b, noRender });
}

// ============================================================
//  BUILD GRAPH
// ============================================================
function buildGraph() {
  nodes = []; edges = []; adjList = {};

  const AV = [200, 440, 680, 920, 1160, 1400, 1640, 1880, 2120, 2360, 2600];
  const ST = [200, 440, 680, 920, 1160, 1400, 1640, 1880, 2120, 2360, 2600];
  const G = {};
  ST.forEach((y, yi) => {
    G[yi] = {};
    AV.forEach((x, xi) => { G[yi][xi] = addNode(x, y, 'inter'); });
  });

  // ── BUNDARAN TENGAH ─────────────────────────────────────────
  const RX = 1400, RY = 1400, RR = 160;
  const NSEG = 24;
  const rbtNodes = [];
  for (let i = 0; i < NSEG; i++) {
    const a = i * Math.PI * 2 / NSEG - Math.PI / 2;
    rbtNodes.push(addNode(RX + Math.cos(a) * RR, RY + Math.sin(a) * RR, 'rbt'));
  }
  for (let i = 0; i < NSEG; i++) addEdge(rbtNodes[i], rbtNodes[(i + 1) % NSEG], true);

  const iUp = 0, iRight = 6, iDown = 12, iLeft = 18;
  addEdge(G[4][5], rbtNodes[iUp]);
  addEdge(G[5][6], rbtNodes[iRight]);
  addEdge(G[6][5], rbtNodes[iDown]);
  addEdge(G[5][4], rbtNodes[iLeft]);

  nodes[G[5][5]].hidden = true;

  // ── JALAN GRID HORIZONTAL ───────────────────────────────────
  ST.forEach((_, yi) => {
    AV.forEach((_, xi) => {
      if (xi >= AV.length - 1) return;
      if (yi === 5 && xi === 4) return;
      if (yi === 5 && xi === 5) return;
      const blk = (yi === 2 && xi === 3) || (yi === 5 && xi === 7) || (yi === 8 && xi === 4) ||
        (yi === 1 && xi === 6) || (yi === 7 && xi === 2) || (yi === 3 && xi === 9) ||
        (yi === 9 && xi === 1) || (yi === 4 && xi === 5);
      if (!blk) addEdge(G[yi][xi], G[yi][xi + 1]);
    });
  });

  // ── JALAN GRID VERTIKAL ─────────────────────────────────────
  AV.forEach((_, xi) => {
    ST.forEach((_, yi) => {
      if (yi >= ST.length - 1) return;
      if (xi === 5 && yi === 4) return;
      if (xi === 5 && yi === 5) return;
      const blk = (xi === 2 && yi === 1) || (xi === 6 && yi === 4) || (xi === 4 && yi === 7) ||
        (xi === 8 && yi === 2) || (xi === 1 && yi === 8) || (xi === 7 && yi === 1) ||
        (xi === 3 && yi === 9) || (xi === 9 && yi === 5);
      if (!blk) addEdge(G[yi][xi], G[yi + 1][xi]);
    });
  });

  return G;
}

// ============================================================
//  DIJKSTRA'S ALGORITHM — Single Source Shortest Path
// ============================================================
function dijkstra(src, dst) {
  if (src === dst) return { path: [src], cost: 0, visited: [] };
  const dist = {}, prev = {}, visited = new Set(), visitOrder = [];
  nodes.forEach(n => { dist[n.id] = Infinity; prev[n.id] = null; });
  dist[src] = 0;
  const pq = [{ id: src, d: 0 }];
  while (pq.length) {
    pq.sort((a, b) => a.d - b.d);
    const { id: u } = pq.shift();
    if (visited.has(u)) continue;
    visited.add(u); visitOrder.push(u);
    if (u === dst) break;
    for (const { to, w } of (adjList[u] || [])) {
      const alt = dist[u] + w;
      if (alt < dist[to]) { dist[to] = alt; prev[to] = u; pq.push({ id: to, d: alt }); }
    }
  }
  const path = [];
  let cur = dst;
  while (cur !== null && cur !== undefined) { path.unshift(cur); cur = prev[cur]; }
  if (!path.length || path[0] !== src) return { path: [], cost: Infinity, visited: visitOrder };
  return { path, cost: dist[dst], visited: visitOrder };
}

// ============================================================
//  HELPER
// ============================================================
function closestNode(wx, wy) {
  let best = null, bestD = Infinity;
  nodes.forEach(n => {
    const d = (n.x - wx) ** 2 + (n.y - wy) ** 2;
    if (d < bestD) { bestD = d; best = n.id; }
  });
  return best;
}

function sr(s) {
  let x = Math.sin(s * 1.618 + 2.718) * 99991;
  return x - Math.floor(x);
}
// ============================================================
//  ui.js — Tugas: Rydhoi Trimaniel Lase (2401020061)
//  Desain Antarmuka (UI/UX) — Panel, Lokasi, NPC List
// ============================================================
'use strict';

// ============================================================
//  LOKASI LANDMARK
// ============================================================
const LOCS = [
  { id: 'hospital', nm: 'Rumah Sakit', ico: '🏥', col: '#ff4466', wx: 200, wy: 200 },
  { id: 'police', nm: 'Kantor Polisi', ico: '🚔', col: '#4477ff', wx: 2600, wy: 2600 },
  { id: 'school', nm: 'Sekolah', ico: '🏫', col: '#ffcc00', wx: 1400, wy: 200 },
  { id: 'mosque', nm: 'Masjid', ico: '🕌', col: '#00cc88', wx: 1400, wy: 1400 },
  { id: 'market', nm: 'Pasar', ico: '🏪', col: '#ff8822', wx: 200, wy: 1400 },
  { id: 'taman', nm: 'Taman Kota', ico: '🌳', col: '#33dd55', wx: 1400, wy: 680 },
  { id: 'station', nm: 'Stasiun KA', ico: '🚉', col: '#9966ff', wx: 2600, wy: 200 },
  { id: 'univ', nm: 'Universitas', ico: '🎓', col: '#0099ff', wx: 200, wy: 2600 },
  { id: 'mall', nm: 'Mall/Plaza', ico: '🛍️', col: '#ff44aa', wx: 2600, wy: 1400 },
  { id: 'bank', nm: 'Bank', ico: '🏦', col: '#44ddcc', wx: 680, wy: 680 },
  { id: 'airport', nm: 'Bandara', ico: '✈️', col: '#66aaff', wx: 2600, wy: 440 },
  { id: 'hotel', nm: 'Hotel', ico: '🏨', col: '#ffaa44', wx: 920, wy: 2360 },
  { id: 'rs2', nm: 'RS Bethesda', ico: '⚕️', col: '#ff6699', wx: 2360, wy: 680 },
  { id: 'sport', nm: 'Lap. Olahraga', ico: '🏟️', col: '#aadd00', wx: 680, wy: 2360 },
  { id: 'museum', nm: 'Museum', ico: '🏛️', col: '#ddaa44', wx: 1880, wy: 2360 },
  { id: 'fire', nm: 'Pemadam Kebakaran', ico: '🚒', col: '#ff4400', wx: 2360, wy: 2120 },
  { id: 'pos', nm: 'Kantor Pos', ico: '📮', col: '#ffdd00', wx: 440, wy: 1640 },
  { id: 'lib', nm: 'Perpustakaan', ico: '📚', col: '#aa66ff', wx: 2120, wy: 200 },
  { id: 'spbu', nm: 'SPBU', ico: '⛽', col: '#44aaff', wx: 920, wy: 1160 },
  { id: 'pusk', nm: 'Puskesmas', ico: '🏥', col: '#ff6688', wx: 2360, wy: 1640 },
];

function assignLocNodes() {
  LOCS.forEach(loc => { loc.node = closestNode(loc.wx, loc.wy); });
}

// ============================================================
//  TOMBOL LOKASI — klik 1× = START, klik 2× = TUJUAN
// ============================================================
let selSrc = null, selDst = null, clickT = {};

function buildLocBtns() {
  const g = document.getElementById('locGrid');
  g.innerHTML = '';
  LOCS.forEach(loc => {
    const btn = document.createElement('div');
    btn.className = 'locBtn';
    btn.id = 'lb_' + loc.id;
    btn.innerHTML = `<span class="locIcon">${loc.ico}</span><div class="locName">${loc.nm}</div>`;
    btn.onclick = () => {
      if (!clickT[loc.id]) {
        clickT[loc.id] = setTimeout(() => {
          clickT[loc.id] = null;
          document.querySelectorAll('.locBtn').forEach(b => b.classList.remove('sel-s'));
          btn.classList.add('sel-s');
          selSrc = loc;
          document.getElementById('srcNm').textContent = loc.nm;
          if (selDst && selDst.node != null && loc.node != null)
            setRoute(loc.node, selDst.node, loc.nm, selDst.nm);
        }, 260);
      } else {
        clearTimeout(clickT[loc.id]);
        clickT[loc.id] = null;
        document.querySelectorAll('.locBtn').forEach(b => b.classList.remove('sel-d'));
        btn.classList.add('sel-d');
        selDst = loc;
        document.getElementById('dstNm').textContent = loc.nm;
        if (selSrc && selSrc.node != null && loc.node != null)
          setRoute(selSrc.node, loc.node, selSrc.nm, loc.nm);
      }
    };
    g.appendChild(btn);
  });
}

// ============================================================
//  NPC PANEL — daftar kendaraan NPC di sidebar kanan
// ============================================================
function buildNPCPanel() {
  const nb = document.getElementById('npcBody');
  nb.innerHTML = '';
  npcCars.forEach((c, i) => {
    const div = document.createElement('div');
    div.className = 'npcItem';
    div.innerHTML = `<div class="nDot" style="background:${c.color};box-shadow:0 0 6px ${c.color}"></div>
      <div class="nInfo">
        <div class="nVeh">${c.icon} ${c.name}</div>
        <div class="nRt" id="nr${i}">Routing…</div>
      </div>`;
    div.onclick = () => { cam.x = c.x; cam.y = c.y; followCar = false; };
    nb.appendChild(div);
  });
}

// ============================================================
//  UPDATE INFO PANEL — dipanggil tiap frame dari loop utama
// ============================================================
function updateUI(frameCount) {
  document.getElementById('tvSpd').textContent = Math.round(32 + Math.sin(Date.now() * .0012) * 14) + ' km/h';
  document.getElementById('tvZm').textContent = cam.zoom.toFixed(2) + '×';

  document.querySelectorAll('.nChip').forEach((c, i) => {
    c.classList.remove('cur', 'vis');
    if (i < playerCar.pathIdx) c.classList.add('vis');
    else if (i === playerCar.pathIdx) c.classList.add('cur');
  });

  if (frameCount % 35 === 0) {
    npcCars.forEach((c, i) => {
      const el = document.getElementById('nr' + i);
      if (!el) return;
      const nd = c.path && c.path.length ? nodes[c.path[c.path.length - 1]] : null;
      el.textContent = nd ? `→ Node ${nd.id}` : 'Routing…';
    });
  }
}

// ============================================================
//  SET ROUTE — update panel setelah rute dihitung
// ============================================================
function setRoute(srcId, dstId, srcName, dstName) {
  if (srcId == null || dstId == null || srcId === dstId) return;
  const { path, cost, visited } = dijkstra(srcId, dstId);
  if (!path || path.length < 2) {
    document.getElementById('algSt').textContent = 'NO PATH';
    return;
  }
  currentPath = path;
  visitedNodes = visited;
  pathAnimT = 0;

  playerCar.path = path;
  playerCar.pathIdx = 0;
  playerCar.t = 0;
  playerCar.destNodeId = dstId;
  playerCar.trail = [];

  const startNode = nodes[srcId];
  if (startNode) { playerCar.x = startNode.x; playerCar.y = startNode.y; }

  followCar = true;
  document.getElementById('bFol').classList.add('on');

  document.getElementById('tvCost').textContent = cost < Infinity ? Math.round(cost) + 'u' : 'N/A';
  document.getElementById('tvNds').textContent = path.length;
  document.getElementById('srcNm').textContent = srcName || 'Node ' + srcId;
  document.getElementById('dstNm').textContent = dstName || 'Node ' + dstId;
  document.getElementById('algSt').textContent = 'RUNNING';
  document.getElementById('algVis').textContent = visited.length;
  document.getElementById('algLen').textContent = path.length;
  document.getElementById('algDst').textContent = cost < Infinity ? Math.round(cost) + 'u' : 'N/A';
  document.getElementById('tvSt').textContent = 'ACTIVE';
  document.getElementById('tvSt').style.color = '#0f0';
  document.getElementById('stPath').textContent = `Rute: ${srcName} → ${dstName}`;

  const nl = document.getElementById('nList');
  nl.innerHTML = '';
  path.slice(0, 16).forEach((id, i) => {
    const c = document.createElement('div');
    c.className = 'nChip' + (i === 0 ? ' cur' : '');
    c.textContent = 'N' + id;
    nl.appendChild(c);
  });

  pathAnimT = 0;
  const iv = setInterval(() => {
    pathAnimT = Math.min(1, pathAnimT + 0.05);
    document.getElementById('pBar').style.width = (pathAnimT * 100) + '%';
    if (pathAnimT >= 1) clearInterval(iv);
  }, 28);
}

// ============================================================
//  Animation.js — Tugas Septia Dwi Ananta (2401020074)
//  Animasi pergerakan kendaraan (Player, NPC, InitNPC, MovecarAlongPath, dan UpdateAnimation)
// ============================================================
'use strict';

// ============================================================
//  PLAYER CAR
// ============================================================
let playerCar = {
  x: 200, y: 200, angle: 0,
  path: [], pathIdx: 0, t: 0,
  speed: 5,
  destNodeId: null,
  trail: [],
  color: '#00dd88'
};

function moveCarAlongPath(car) {
  if (!car.path || car.path.length < 2) return;
  if (car.pathIdx >= car.path.length - 1) {
    if (car !== playerCar) {
      const ns = car.path[car.path.length - 1];
      let nd = Math.floor(Math.random() * nodes.length);
      for (let _ = 0; _ < 10 && nd === ns; _++) nd = Math.floor(Math.random() * nodes.length);
      const { path } = dijkstra(ns, nd);
      if (path.length > 1) { car.path = path; car.pathIdx = 0; car.t = 0; }
    }
    return;
  }
  let na = nodes[car.path[car.pathIdx]];
  let nb = nodes[car.path[car.pathIdx + 1]];
  if (!na || !nb) return;
  let dx = nb.x - na.x, dy = nb.y - na.y;
  let segLen = Math.sqrt(dx * dx + dy * dy);
  if (segLen < 1) { car.pathIdx++; return; }
  car.t += car.speed / segLen;
  if (car.t >= 1) { car.t = 0; car.pathIdx++; return; }
  car.x = na.x + dx * car.t;
  car.y = na.y + dy * car.t;
  car.angle = Math.atan2(dy, dx);
  if (car === playerCar) {
    car.trail.push({ x: car.x, y: car.y });
    if (car.trail.length > 26) car.trail.shift();
  }
}

// ============================================================
//  NPC CARS
// ============================================================
let npcCars = [];
const NPC_COLORS = ['#ff5555', '#ffdd22', '#44ee77', '#4488ff', '#ff55bb', '#ff9933', '#aa55ff', '#55ddff'];
const NPC_NAMES = ['Syhara', 'Septi', 'Nurpaisyah', 'Rydoi', 'Ama', 'Syhara', 'Septi', 'Nurpaisyah'];
const NPC_ICONS = ['🚗', '🚕', '🚙', '🚌', '🏎️', '🚐', '🚑', '🚓'];

function initNPCs() {
  npcCars = [];
  for (let i = 0; i < 8; i++) {
    const s = Math.floor(sr(i * 17) * nodes.length);
    let d = Math.floor(sr(i * 31 + 5) * nodes.length);
    for (let _ = 0; _ < 10 && d === s; _++) d = Math.floor(Math.random() * nodes.length);
    const { path } = dijkstra(s, d);
    const sn = nodes[s]; if (!sn) continue;
    npcCars.push({
      x: sn.x, y: sn.y, angle: 0,
      path, pathIdx: 0, t: 0,
      speed: 0.9 + sr(i * 47) * 1.1,
      color: NPC_COLORS[i],
      name: NPC_NAMES[i],
      icon: NPC_ICONS[i],
    });
  }
  buildNPCPanel();
}
// ============================================================
//  UPDATE
// ============================================================
let frameCount = 0;
function update() {
  if (paused) return;
  frameCount++;
  moveCarAlongPath(playerCar);
  if (playerCar.path.length >= 2 && playerCar.pathIdx >= playerCar.path.length - 1 && playerCar.t === 0) {
    document.getElementById('algSt').textContent = 'ARRIVED';
    document.getElementById('tvSt').textContent = 'DONE';
    document.getElementById('tvSt').style.color = '#ffd700';
  }
  // npcCars.forEach(moveCarAlongPath);
  if (followCar) {
    cam.x += (playerCar.x - cam.x) * .08;
    cam.y += (playerCar.y - cam.y) * .08;
  }
  document.getElementById('tvSpd').textContent = Math.round(32 + Math.sin(Date.now() * .0012) * 14) + ' km/h';
  document.getElementById('tvZm').textContent = cam.zoom.toFixed(2) + '×';
  document.querySelectorAll('.nChip').forEach((c, i) => {
    c.classList.remove('cur', 'vis');
    if (i < playerCar.pathIdx) c.classList.add('vis');
    else if (i === playerCar.pathIdx) c.classList.add('cur');
  });
  if (frameCount % 35 === 0) {
    npcCars.forEach((c, i) => {
      const el = document.getElementById('nr' + i); if (!el) return;
      const nd = c.path && c.path.length ? nodes[c.path[c.path.length - 1]] : null;
      el.textContent = nd ? `→ Node ${nd.id}` : 'Routing…';
    });
  }
}
