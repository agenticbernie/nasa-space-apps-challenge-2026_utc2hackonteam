import * as THREE from 'three';
import { GameState } from '../engine/types';

function makePixelCanvas(w: number, h: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;
  ctx.imageSmoothingEnabled = false;
  return [canvas, ctx];
}

function finalizePixelTexture(
  canvas: HTMLCanvasElement,
  repeatX = 1,
  repeatY = 1,
  maxAniso = 4,
): THREE.CanvasTexture {
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.magFilter = THREE.NearestFilter;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repeatX, repeatY);
  tex.anisotropy = maxAniso;
  tex.needsUpdate = true;
  return tex;
}

export interface OutpostTextureSet {
  hullWall: THREE.CanvasTexture;
  stationWall: THREE.CanvasTexture;
  floorDeck: THREE.CanvasTexture;
  regolith: THREE.CanvasTexture;
  solarCell: THREE.CanvasTexture;
  dustOverlay: THREE.CanvasTexture;
  shelterDoor: THREE.CanvasTexture;
  stationEmblem: THREE.CanvasTexture;
  samFace: THREE.CanvasTexture;
  mayaFace: THREE.CanvasTexture;
  commanderFace: THREE.CanvasTexture;
  controlScreen: THREE.CanvasTexture;
  controlScreenCanvas: HTMLCanvasElement;
  zoneScreen: THREE.CanvasTexture;
  zoneScreenCanvas: HTMLCanvasElement;
  roverScreen: THREE.CanvasTexture;
  roverScreenCanvas: HTMLCanvasElement;
  medScreen: THREE.CanvasTexture;
  medScreenCanvas: HTMLCanvasElement;
  ecgMonitor: THREE.CanvasTexture;
  ecgMonitorCanvas: HTMLCanvasElement;
  co2Sign: THREE.CanvasTexture;
  earthGlobe: THREE.CanvasTexture;
  dispose: () => void;
}

function makeAstronautFaceTexture(
  skinHex: string,
  eyeHex: string,
  hairHex: string,
  isFemale: boolean,
  maxAniso: number,
): THREE.CanvasTexture {
  const [c, ctx] = makePixelCanvas(48, 48);
  ctx.fillStyle = skinHex;
  ctx.fillRect(0, 0, 48, 48);
  // Subtle forehead hair fringe
  ctx.fillStyle = hairHex;
  ctx.fillRect(0, 0, 48, isFemale ? 11 : 9);
  ctx.fillRect(0, 8, 6, 12);
  ctx.fillRect(42, 8, 6, 12);
  // Warm rosy cheeks for friendly kid-appealing stylized astronaut character
  ctx.fillStyle = 'rgba(244, 114, 182, 0.28)';
  ctx.fillRect(8, 28, 7, 4);
  ctx.fillRect(33, 28, 7, 4);
  // Eyebrows
  ctx.fillStyle = hairHex;
  ctx.fillRect(11, 16, 8, 2);
  ctx.fillRect(29, 16, 8, 2);
  // Eyes with bright catchlight
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(12, 20, 6, 6);
  ctx.fillRect(30, 20, 6, 6);
  ctx.fillStyle = eyeHex;
  ctx.fillRect(14, 21, 4, 4);
  ctx.fillRect(32, 21, 4, 4);
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(15, 22, 2, 2);
  ctx.fillRect(33, 22, 2, 2);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(14, 21, 1, 1);
  ctx.fillRect(32, 21, 1, 1);
  // Friendly confident smile
  ctx.fillStyle = '#9f4a3c';
  ctx.fillRect(18, 34, 12, 2);
  ctx.fillRect(16, 32, 2, 2);
  ctx.fillRect(30, 32, 2, 2);

  const tex = finalizePixelTexture(c, 1, 1, maxAniso);
  tex.wrapS = THREE.ClampToEdgeWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  return tex;
}

export function createOutpostTextures(maxAniso: number): OutpostTextureSet {
  // 1. 16-bit Outer Hull Wall Panel (64x64)
  const [hullC, hullCtx] = makePixelCanvas(64, 64);
  hullCtx.fillStyle = '#243247';
  hullCtx.fillRect(0, 0, 64, 64);
  hullCtx.fillStyle = '#2d3e57';
  hullCtx.fillRect(2, 2, 60, 60);
  hullCtx.fillStyle = '#192333';
  hullCtx.fillRect(0, 31, 64, 2);
  hullCtx.fillRect(31, 0, 2, 64);
  hullCtx.fillStyle = '#677481';
  const rivets = [
    [4, 4], [27, 4], [35, 4], [58, 4],
    [4, 27], [27, 27], [35, 27], [58, 27],
    [4, 35], [27, 35], [35, 35], [58, 35],
    [4, 58], [27, 58], [35, 58], [58, 58],
  ];
  rivets.forEach(([rx, ry]) => hullCtx.fillRect(rx, ry, 2, 2));
  hullCtx.fillStyle = '#f2c879';
  hullCtx.fillRect(2, 48, 60, 2);
  const hullWall = finalizePixelTexture(hullC, 3, 1, maxAniso);

  // 1B. Lunar Habitat White-Gray Padded Nomex/MLI Interior Wall (64x64)
  const [nwC, nwCtx] = makePixelCanvas(64, 64);
  nwCtx.fillStyle = '#cbd5e1';
  nwCtx.fillRect(0, 0, 64, 64);
  nwCtx.fillStyle = '#e2e8f0';
  nwCtx.fillRect(3, 3, 26, 26);
  nwCtx.fillRect(35, 3, 26, 26);
  nwCtx.fillRect(3, 35, 26, 26);
  nwCtx.fillRect(35, 35, 26, 26);
  // Quilted diagonal cross-stitch feel
  nwCtx.fillStyle = '#94a3b8';
  nwCtx.fillRect(0, 31, 64, 2);
  nwCtx.fillRect(31, 0, 2, 64);
  // Aurora sky-blue & gold trim band
  nwCtx.fillStyle = '#0284c7';
  nwCtx.fillRect(0, 52, 64, 3);
  nwCtx.fillStyle = '#eab308';
  nwCtx.fillRect(0, 56, 64, 1);
  // Fastener snaps
  nwCtx.fillStyle = '#475569';
  [[6, 6], [24, 6], [38, 6], [56, 6], [6, 38], [24, 38], [38, 38], [56, 38]].forEach(([fx, fy]) => {
    nwCtx.fillRect(fx, fy, 2, 2);
  });
  const stationWall = finalizePixelTexture(nwC, 3, 1, maxAniso);

  // 2. Grated ISS Deck Floor (64x64)
  const [floorC, floorCtx] = makePixelCanvas(64, 64);
  floorCtx.fillStyle = '#182232';
  floorCtx.fillRect(0, 0, 64, 64);
  floorCtx.fillStyle = '#223045';
  for (let y = 4; y < 64; y += 8) {
    for (let x = 4; x < 64; x += 8) {
      floorCtx.fillRect(x, y, 5, 5);
    }
  }
  floorCtx.strokeStyle = '#364966';
  floorCtx.lineWidth = 2;
  floorCtx.strokeRect(1, 1, 62, 62);
  const floorDeck = finalizePixelTexture(floorC, 6, 6, maxAniso);

  // 3. Lunar South Pole Regolith (64x64)
  const [regC, regCtx] = makePixelCanvas(64, 64);
  regCtx.fillStyle = '#535e6b';
  regCtx.fillRect(0, 0, 64, 64);
  const shades = ['#444e5a', '#677481', '#3b434e', '#768391'];
  for (let i = 0; i < 160; i++) {
    regCtx.fillStyle = shades[i % shades.length];
    const px = (i * 17) % 62;
    const py = (i * 29) % 62;
    const sz = i % 5 === 0 ? 3 : 2;
    regCtx.fillRect(px, py, sz, sz);
  }
  const regolith = finalizePixelTexture(regC, 18, 18, maxAniso);

  // 4. Photovoltaic Solar Cell Grid (64x64)
  const [solC, solCtx] = makePixelCanvas(64, 64);
  solCtx.fillStyle = '#132b4f';
  solCtx.fillRect(0, 0, 64, 64);
  solCtx.fillStyle = '#1f497d';
  for (let y = 2; y < 64; y += 16) {
    for (let x = 2; x < 64; x += 16) {
      solCtx.fillRect(x, y, 13, 13);
    }
  }
  solCtx.fillStyle = '#70b8d3';
  for (let i = 15; i < 64; i += 16) {
    solCtx.fillRect(i, 0, 1, 64);
    solCtx.fillRect(0, i, 64, 1);
  }
  const solarCell = finalizePixelTexture(solC, 2, 1, maxAniso);

  // 5. Lunar Dust Overlay for Solar Panels (64x64)
  const [dustC, dustCtx] = makePixelCanvas(64, 64);
  dustCtx.clearRect(0, 0, 64, 64);
  dustCtx.fillStyle = 'rgba(130, 138, 148, 0.88)';
  dustCtx.fillRect(0, 0, 34, 64);
  for (let i = 0; i < 90; i++) {
    dustCtx.fillStyle = i % 2 === 0 ? 'rgba(103, 116, 129, 0.85)' : 'rgba(165, 173, 181, 0.7)';
    dustCtx.fillRect((i * 13) % 52, (i * 23) % 60, 3, 3);
  }
  const dustOverlay = finalizePixelTexture(dustC, 1, 1, maxAniso);

  // 6. Heavy Radiation Shelter Door (64x64)
  const [shC, shCtx] = makePixelCanvas(64, 64);
  shCtx.fillStyle = '#2d3748';
  shCtx.fillRect(0, 0, 64, 64);
  shCtx.fillStyle = '#4a5568';
  shCtx.fillRect(4, 4, 56, 56);
  for (let x = 4; x < 60; x += 8) {
    shCtx.fillStyle = (x / 8) % 2 === 0 ? '#f0b85d' : '#101828';
    shCtx.fillRect(x, 52, 8, 6);
  }
  shCtx.fillStyle = '#f0b85d';
  shCtx.fillRect(22, 18, 20, 20);
  shCtx.fillStyle = '#101828';
  shCtx.fillRect(29, 25, 6, 6);
  shCtx.fillRect(24, 20, 5, 5);
  shCtx.fillRect(35, 20, 5, 5);
  shCtx.fillRect(29, 32, 6, 5);
  const shelterDoor = finalizePixelTexture(shC, 1, 1, maxAniso);

  // 6B. Original Aurora Research Station Emblem Patch (48x48) — zero agency trademarks
  const [mbC, mbCtx] = makePixelCanvas(48, 48);
  mbCtx.clearRect(0, 0, 48, 48);
  mbCtx.fillStyle = '#0f172a';
  mbCtx.beginPath();
  mbCtx.arc(24, 24, 21, 0, Math.PI * 2);
  mbCtx.fill();
  mbCtx.strokeStyle = '#f2c879';
  mbCtx.lineWidth = 2.5;
  mbCtx.stroke();
  // Inner orbital ring
  mbCtx.strokeStyle = '#38bdf8';
  mbCtx.lineWidth = 1.5;
  mbCtx.beginPath();
  mbCtx.arc(24, 24, 15, 0.3, Math.PI * 1.8);
  mbCtx.stroke();
  // Stylized silver lunar crescent
  mbCtx.fillStyle = '#cbd5e1';
  mbCtx.beginPath();
  mbCtx.arc(22, 27, 9, 0, Math.PI * 2);
  mbCtx.fill();
  mbCtx.fillStyle = '#0f172a';
  mbCtx.beginPath();
  mbCtx.arc(26, 24, 7.5, 0, Math.PI * 2);
  mbCtx.fill();
  // Cyan 4-point Aurora Polar Beacon Star
  mbCtx.fillStyle = '#38bdf8';
  mbCtx.fillRect(29, 13, 3, 11);
  mbCtx.fillRect(25, 17, 11, 3);
  mbCtx.fillStyle = '#f2c879';
  mbCtx.fillRect(29, 17, 3, 3);
  const stationEmblem = finalizePixelTexture(mbC, 1, 1, maxAniso);
  stationEmblem.wrapS = THREE.ClampToEdgeWrapping;
  stationEmblem.wrapT = THREE.ClampToEdgeWrapping;

  // 6C. Friendly Low-Poly Astronaut Portraits (inside translucent helmets)
  const samFace = makeAstronautFaceTexture('#f2c2a2', '#1d4ed8', '#7c4724', false, maxAniso);
  const mayaFace = makeAstronautFaceTexture('#f6cdb2', '#15803d', '#312e81', true, maxAniso);
  const commanderFace = makeAstronautFaceTexture('#e5b899', '#0369a1', '#1e293b', false, maxAniso);

  // 7. Dynamic Mission Control Screen (256x128)
  const [ctrlC] = makePixelCanvas(256, 128);
  const controlScreen = finalizePixelTexture(ctrlC, 1, 1, maxAniso);
  controlScreen.wrapS = THREE.ClampToEdgeWrapping;
  controlScreen.wrapT = THREE.ClampToEdgeWrapping;

  // 8. Dynamic Secondary Zone Screen (128x96)
  const [zoneC] = makePixelCanvas(128, 96);
  const zoneScreen = finalizePixelTexture(zoneC, 1, 1, maxAniso);
  zoneScreen.wrapS = THREE.ClampToEdgeWrapping;
  zoneScreen.wrapT = THREE.ClampToEdgeWrapping;

  // 8B. Dynamic EVA Rover Radar Screen (128x96)
  const [roverC] = makePixelCanvas(128, 96);
  const roverScreen = finalizePixelTexture(roverC, 1, 1, maxAniso);
  roverScreen.wrapS = THREE.ClampToEdgeWrapping;
  roverScreen.wrapT = THREE.ClampToEdgeWrapping;

  // 8C. Dynamic Space Medicine & ARED Screen (128x96)
  const [medC] = makePixelCanvas(128, 96);
  const medScreen = finalizePixelTexture(medC, 1, 1, maxAniso);
  medScreen.wrapS = THREE.ClampToEdgeWrapping;
  medScreen.wrapT = THREE.ClampToEdgeWrapping;

  // 8D. Dynamic Bedside ECG Heart-Rate & Dosimeter Monitor (128x80)
  const [ecgC] = makePixelCanvas(128, 80);
  const ecgMonitor = finalizePixelTexture(ecgC, 1, 1, maxAniso);
  ecgMonitor.wrapS = THREE.ClampToEdgeWrapping;
  ecgMonitor.wrapT = THREE.ClampToEdgeWrapping;

  // 9. Glowing CO2 Scrubber Sign (128x48)
  const [co2C, co2Ctx] = makePixelCanvas(128, 48);
  co2Ctx.fillStyle = '#0f172a';
  co2Ctx.fillRect(0, 0, 128, 48);
  co2Ctx.strokeStyle = '#6baf83';
  co2Ctx.lineWidth = 3;
  co2Ctx.strokeRect(2, 2, 124, 44);
  co2Ctx.fillStyle = '#f2c879';
  co2Ctx.font = 'bold 16px monospace';
  co2Ctx.fillText('CO2 SCRUBBER', 8, 22);
  co2Ctx.fillStyle = '#70b8d3';
  co2Ctx.font = 'bold 11px monospace';
  co2Ctx.fillText('CDRA · LiOH', 8, 39);
  const co2Sign = finalizePixelTexture(co2C, 1, 1, maxAniso);
  co2Sign.wrapS = THREE.ClampToEdgeWrapping;
  co2Sign.wrapT = THREE.ClampToEdgeWrapping;

  // 10. Earth "Blue Marble" Globe Texture (128x64)
  const [earthC, earthCtx] = makePixelCanvas(128, 64);
  earthCtx.fillStyle = '#0f3d85';
  earthCtx.fillRect(0, 0, 128, 64);
  earthCtx.fillStyle = '#3d9970';
  earthCtx.fillRect(22, 16, 18, 12);
  earthCtx.fillRect(30, 28, 10, 14);
  earthCtx.fillRect(58, 14, 24, 16);
  earthCtx.fillRect(66, 30, 12, 14);
  earthCtx.fillRect(96, 34, 14, 10);
  earthCtx.fillStyle = '#e2e8f0';
  earthCtx.fillRect(0, 0, 128, 6);
  earthCtx.fillRect(0, 58, 128, 6);
  earthCtx.fillStyle = 'rgba(255, 255, 255, 0.78)';
  [
    [12, 22, 24, 3], [44, 12, 20, 3], [52, 34, 26, 3],
    [82, 22, 22, 3], [16, 44, 28, 3], [90, 46, 20, 2],
  ].forEach(([cx, cy, cw, ch]) => earthCtx.fillRect(cx, cy, cw, ch));
  const earthGlobe = finalizePixelTexture(earthC, 1, 1, maxAniso);
  earthGlobe.wrapS = THREE.RepeatWrapping;
  earthGlobe.wrapT = THREE.ClampToEdgeWrapping;

  return {
    hullWall,
    stationWall,
    floorDeck,
    regolith,
    solarCell,
    dustOverlay,
    shelterDoor,
    stationEmblem,
    samFace,
    mayaFace,
    commanderFace,
    controlScreen,
    controlScreenCanvas: ctrlC,
    zoneScreen,
    zoneScreenCanvas: zoneC,
    roverScreen,
    roverScreenCanvas: roverC,
    medScreen,
    medScreenCanvas: medC,
    ecgMonitor,
    ecgMonitorCanvas: ecgC,
    co2Sign,
    earthGlobe,
    dispose: () => {
      hullWall.dispose();
      stationWall.dispose();
      floorDeck.dispose();
      regolith.dispose();
      solarCell.dispose();
      dustOverlay.dispose();
      shelterDoor.dispose();
      stationEmblem.dispose();
      samFace.dispose();
      mayaFace.dispose();
      commanderFace.dispose();
      controlScreen.dispose();
      zoneScreen.dispose();
      roverScreen.dispose();
      medScreen.dispose();
      ecgMonitor.dispose();
      co2Sign.dispose();
      earthGlobe.dispose();
    },
  };
}

export function updateDynamicScreenTextures(
  textures: OutpostTextureSet,
  state: GameState,
  lang: 'vi' | 'en' = 'vi',
) {
  // Update Main Mission Control Screen
  const ctx = textures.controlScreenCanvas.getContext('2d')!;
  ctx.fillStyle = '#0c1524';
  ctx.fillRect(0, 0, 256, 128);

  const isCrit =
    state.spe_active ||
    state.dust_storm_active ||
    state.air_quality_score < 60 ||
    state.water < 3 ||
    state.eclss.o2_kpa < 19.5;
  ctx.fillStyle = isCrit ? '#d76562' : '#1e3a5f';
  ctx.fillRect(0, 0, 256, 22);
  ctx.fillStyle = '#f8fafc';
  ctx.font = 'bold 11px monospace';
  const headerPrefix = lang === 'en' ? 'SHIFT' : 'CA';
  ctx.fillText(
    `AURORA · ${headerPrefix} ${state.shift}/9 (${(state.shift - 1) * 8}-${state.shift * 8}H)`,
    8,
    15,
  );

  // Left: 4 Telemetry Bars
  const drawBar = (y: number, label: string, val: number, valText: string, max: number, color: string) => {
    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 9px monospace';
    ctx.fillText(label, 8, y);
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(62, y - 8, 72, 10);
    const pct = Math.max(0, Math.min(1, val / max));
    ctx.fillStyle = color;
    ctx.fillRect(62, y - 8, Math.round(72 * pct), 10);
    ctx.fillStyle = '#f8fafc';
    ctx.fillText(valText, 138, y);
  };

  drawBar(42, 'O2 kPa', state.eclss.o2_kpa, `${state.eclss.o2_kpa.toFixed(1)}`, 24, state.eclss.o2_kpa < 19.5 ? '#d76562' : '#70b8d3');
  drawBar(64, 'WATER', state.water, `${state.water}u`, 10, state.water < 3 ? '#d76562' : '#6baf83');
  drawBar(86, 'AIR', state.air_quality_score, `${state.air_quality_score}`, 100, state.air_quality_score < 60 ? '#f0b85d' : '#6baf83');
  drawBar(108, 'PLANT', state.plant_health, `${state.plant_health}`, 100, state.plant_health < 45 ? '#f0b85d' : '#6baf83');

  // Right: South Pole Orbit / HLS Tracker + DONKI Radiation Plot
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 1;
  ctx.strokeRect(178, 28, 70, 90);
  // Moon & South Pole orbit ellipse
  ctx.fillStyle = '#94a3b8';
  ctx.beginPath();
  ctx.arc(213, 56, 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#f2c879';
  ctx.beginPath();
  ctx.ellipse(213, 56, 26, 9, -0.25, 0, Math.PI * 2);
  ctx.stroke();
  // HLS Starship marker along orbit
  const hlsPct = Math.min(1, state.mission_hours / 72);
  const angle = -0.3 + hlsPct * Math.PI * 1.4;
  ctx.fillStyle = '#4ade80';
  ctx.fillRect(211 + Math.cos(angle) * 24, 54 + Math.sin(angle) * 8, 5, 5);
  ctx.fillStyle = '#70b8d3';
  ctx.font = 'bold 8px monospace';
  ctx.fillText(`HLS T-${Math.max(0, Math.ceil(72 - state.mission_hours))}H`, 184, 88);
  ctx.fillStyle = state.spe_active ? '#ef4444' : '#6baf83';
  ctx.fillText(`DONKI:${state.spe_active ? 'SPE!' : 'QUIET'}`, 184, 102);
  ctx.fillStyle = '#f2c879';
  ctx.fillText(`mSv:${state.eclss.radiation_msv.toFixed(1)}`, 184, 114);

  textures.controlScreen.needsUpdate = true;

  // Update Secondary Zone Screen
  const zCtx = textures.zoneScreenCanvas.getContext('2d')!;
  zCtx.fillStyle = '#0b1320';
  zCtx.fillRect(0, 0, 128, 96);
  zCtx.strokeStyle = isCrit ? '#d76562' : '#70b8d3';
  zCtx.lineWidth = 3;
  zCtx.strokeRect(2, 2, 124, 92);

  zCtx.fillStyle = isCrit ? '#d76562' : '#f2c879';
  zCtx.font = 'bold 11px monospace';
  zCtx.fillText(`${headerPrefix} ${state.shift}/9`, 12, 20);
  zCtx.fillStyle = '#e2e8f0';
  zCtx.font = '10px monospace';
  zCtx.fillText(
    state.spe_active
      ? 'SPE RAD ALERT!'
      : state.dust_storm_active
        ? 'DUST STORM!'
        : state.thermal_drop_active
          ? '-170C NIGHT!'
          : 'PRESS [E] CONSOLE',
    10,
    42,
  );
  zCtx.fillStyle = state.shelter_state === 'sheltered' ? '#6baf83' : '#70b8d3';
  zCtx.fillText(`O2:${state.eclss.o2_kpa.toFixed(1)}kPa`, 10, 62);
  zCtx.fillStyle = state.eclss.body_temp_c < 36.2 ? '#f0b85d' : '#6baf83';
  zCtx.fillText(`TEMP:${state.eclss.body_temp_c.toFixed(1)}C`, 10, 82);

  textures.zoneScreen.needsUpdate = true;

  // Update EVA Rover Radar Screen
  const rCtx = textures.roverScreenCanvas.getContext('2d')!;
  rCtx.fillStyle = '#07131d';
  rCtx.fillRect(0, 0, 128, 96);
  rCtx.strokeStyle = state.eva_rover_unlocked ? '#38bdf8' : '#ef4444';
  rCtx.lineWidth = 2;
  rCtx.strokeRect(2, 2, 124, 92);
  rCtx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
  rCtx.beginPath();
  rCtx.arc(92, 54, 24, 0, Math.PI * 2);
  rCtx.stroke();
  rCtx.beginPath();
  rCtx.arc(92, 54, 12, 0, Math.PI * 2);
  rCtx.stroke();
  rCtx.fillStyle = '#f2c879';
  rCtx.fillRect(90, 52, 5, 5);
  rCtx.fillStyle = '#38bdf8';
  rCtx.font = 'bold 11px monospace';
  rCtx.fillText(`EVA RADAR L${state.eva_radar_level}`, 8, 19);
  rCtx.fillStyle = '#e2e8f0';
  rCtx.font = '10px monospace';
  rCtx.fillText(`SECT:${state.unlocked_sectors.length}/3`, 8, 40);
  rCtx.fillStyle = '#6baf83';
  rCtx.fillText(`SCRAP:${state.inventory.scrap_metal}`, 8, 58);
  rCtx.fillStyle = state.eva_rover_unlocked ? '#f2c879' : '#fca5a5';
  rCtx.fillText(state.eva_rover_unlocked ? '[E] SURFACE' : 'LOCKED SH1', 8, 82);
  textures.roverScreen.needsUpdate = true;

  // Update Medical & ARED Screen
  const mCtx = textures.medScreenCanvas.getContext('2d')!;
  const medAlert = state.active_ailments.length > 0 || state.crew_health < 75;
  mCtx.fillStyle = '#0c1624';
  mCtx.fillRect(0, 0, 128, 96);
  mCtx.strokeStyle = medAlert ? '#ef4444' : '#4ade80';
  mCtx.lineWidth = 2;
  mCtx.strokeRect(2, 2, 124, 92);
  mCtx.fillStyle = medAlert ? '#fca5a5' : '#86efac';
  mCtx.font = 'bold 11px monospace';
  mCtx.fillText('MED & CRAFT', 8, 19);
  mCtx.fillStyle = '#f8fafc';
  mCtx.font = 'bold 12px monospace';
  mCtx.fillText(`HP: ${Math.round(state.crew_health)}/100`, 8, 42);
  mCtx.fillStyle = medAlert ? '#f87171' : '#38bdf8';
  mCtx.font = '10px monospace';
  mCtx.fillText(
    state.active_ailments.length > 0
      ? `SICK: ${state.active_ailments.length} CASE`
      : `KI:${state.inventory.ki_pills} HEPA:${state.inventory.hepa_filter}`,
    8,
    62,
  );
  mCtx.fillStyle = '#f2c879';
  mCtx.fillText('[E] MED BAY', 8, 82);
  textures.medScreen.needsUpdate = true;

  // Update Medical Bay Bedside ECG Monitor
  const eCtx = textures.ecgMonitorCanvas.getContext('2d')!;
  eCtx.fillStyle = '#06111c';
  eCtx.fillRect(0, 0, 128, 80);
  eCtx.strokeStyle = medAlert ? '#f43f5e' : '#22c55e';
  eCtx.lineWidth = 2;
  eCtx.strokeRect(2, 2, 124, 76);
  const bpm = state.spe_active ? 98 : state.active_ailments.length > 0 ? 92 : 68;
  const spo2 = Math.min(99, Math.max(88, Math.round(94 + (state.eclss.o2_kpa - 18) * 1.4)));
  eCtx.fillStyle = '#4ade80';
  eCtx.font = 'bold 11px monospace';
  eCtx.fillText(`HR:${bpm} BPM`, 8, 18);
  eCtx.fillStyle = '#38bdf8';
  eCtx.fillText(`SpO2:${spo2}%`, 72, 18);
  // Crisp green ECG heartbeat waveform
  eCtx.strokeStyle = '#22c55e';
  eCtx.lineWidth = 2;
  eCtx.beginPath();
  eCtx.moveTo(8, 50);
  eCtx.lineTo(28, 50);
  eCtx.lineTo(34, 42);
  eCtx.lineTo(40, 56);
  eCtx.lineTo(46, 26);
  eCtx.lineTo(52, 64);
  eCtx.lineTo(58, 48);
  eCtx.lineTo(84, 48);
  eCtx.lineTo(90, 40);
  eCtx.lineTo(96, 56);
  eCtx.lineTo(102, 28);
  eCtx.lineTo(108, 60);
  eCtx.lineTo(114, 48);
  eCtx.lineTo(120, 48);
  eCtx.stroke();
  eCtx.fillStyle = '#f2c879';
  eCtx.font = 'bold 9px monospace';
  eCtx.fillText(`RAD:${state.eclss.radiation_msv.toFixed(1)}mSv`, 8, 72);
  textures.ecgMonitor.needsUpdate = true;
}
