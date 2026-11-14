import * as THREE from 'three';
import {
  getNpcName,
  isNpcAssignedToShift,
  SHIFT_TRIGGER_MAP,
} from '../engine/dialogueData';
import { getUnlockedRoomFlags } from '../engine/simulationEngine';
import {
  AirlockId,
  AirlockState,
  GameState,
  InteractableKind,
  Language,
  OutpostZoneId,
} from '../engine/types';
import { OutpostTextureSet } from './proceduralTextures';

export interface InteractiveTarget {
  kind: InteractableKind;
  id: string;
  zone: OutpostZoneId;
  label: string;
  shiftNumbers?: number[];
  mesh: THREE.Mesh;
}

export interface AirlockRig {
  id: AirlockId;
  x: number;
  z: number;
  axis: 'x' | 'z';
  leafL: THREE.Group;
  leafR: THREE.Group;
  statusMat: THREE.MeshStandardMaterial;
  buttonMat: THREE.MeshStandardMaterial;
  openProgress: number;
  isOpen: boolean;
}

export interface RadiationStreakItem {
  mesh: THREE.Mesh;
  mat: THREE.MeshBasicMaterial;
  progress: number;
  speed: number;
  startPos: THREE.Vector3;
  dir: THREE.Vector3;
  travelLen: number;
}

export interface AABBBox {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
}

export interface CrewmateRig {
  npcId: 'sam' | 'maya' | 'commander';
  root: THREE.Group;
  bodyGroup: THREE.Group;
  headGroup: THREE.Group;
  armL: THREE.Group;
  armR: THREE.Group;
  legL: THREE.Group;
  legR: THREE.Group;
  nameSprite: THREE.Sprite;
  nameTexVi: THREE.CanvasTexture;
  nameTexEn: THREE.CanvasTexture;
  questSprite: THREE.Sprite;
  questBangTex: THREE.CanvasTexture;
  questCheckTex: THREE.CanvasTexture;
  currentNode: number;
  targetNode: number;
  waitTimer: number;
  defaultPos: THREE.Vector3;
  defaultYaw: number;
  shelterPos: THREE.Vector3;
  shelterYaw: number;
}

export interface MedBayDoorRig {
  leaf: THREE.Group;
  statusMat: THREE.MeshStandardMaterial;
  openProgress: number;
  isOpen: boolean;
}

export interface OutpostDynamicRefs {
  solarDustMeshes: THREE.Mesh[];
  batteryBarMeshes: THREE.Mesh[];
  batteryBarMats: THREE.MeshStandardMaterial[];
  plantGroups: THREE.Group[];
  plantLeafMats: THREE.MeshStandardMaterial[];
  greenhouseLight: THREE.PointLight;
  habitatLight: THREE.PointLight;
  controlLight: THREE.PointLight;
  solarBayLight: THREE.PointLight;
  corridorWestLight: THREE.PointLight;
  corridorEastLight: THREE.PointLight;
  corridorSouthLight: THREE.PointLight;
  warmAccentMat: THREE.MeshStandardMaterial;
  alarmBeaconMat: THREE.MeshStandardMaterial;
  alarmPointLight: THREE.PointLight;
  co2BeaconMat: THREE.MeshStandardMaterial;
  co2BeaconLight: THREE.PointLight;
  waterLevelMesh: THREE.Mesh;
  shelterDoorMesh: THREE.Mesh;
  shelterStatusLedMat: THREE.MeshStandardMaterial;
  warehouseLockLedMat: THREE.MeshStandardMaterial;
  medBayDoorRig: MedBayDoorRig;
  obsGlassDoorGroup: THREE.Group;
  supplyTrolleyWorldGroup: THREE.Group;
  cutsceneLanderGroup: THREE.Group;
  cutsceneThrusterMesh: THREE.Mesh;
  titleShowcaseGroup: THREE.Group;
  titleAstronautArmR: THREE.Group;
  titleAstronautBody: THREE.Group;
  titleRoverGroup: THREE.Group;
  titleRoverWheels: THREE.Mesh[];
  speParticles: THREE.Points;
  dustMotes: THREE.Points;
  sunMesh: THREE.Mesh;
  sunLight: THREE.DirectionalLight;
  coronaInner: THREE.Sprite;
  coronaOuter: THREE.Sprite;
  coronalLoops: THREE.Mesh[];
  speSweepGroup: THREE.Group;
  speSweepMats: THREE.MeshBasicMaterial[];
  radiationStreaks: RadiationStreakItem[];
  speWashLight: THREE.PointLight;
  airlocks: Record<AirlockId, AirlockRig>;
  samRig: CrewmateRig;
  mayaRig: CrewmateRig;
  commanderRig: CrewmateRig;
  waypointGroup: THREE.Group;
  waypointMat: THREE.MeshStandardMaterial;
  corridorStrips: Record<'solar' | 'greenhouse' | 'habitat', THREE.MeshStandardMaterial>;
  roverHoloGroup: THREE.Group;
  hlsPadGroup: THREE.Group;
  hlsBeaconMat: THREE.MeshStandardMaterial;
  botanyLedMats: Record<'lettuce' | 'tomato' | 'wheat', THREE.MeshStandardMaterial>;
  airPipeMat: THREE.MeshStandardMaterial;
  interactiveTargets: InteractiveTarget[];
  colliders: AABBBox[];
  playerOnlyColliders: AABBBox[];
  dispose: () => void;
}

export function buildLunarOutpostScene(
  scene: THREE.Scene,
  textures: OutpostTextureSet,
  isSoftwareGl: boolean,
): OutpostDynamicRefs {
  const disposables: { dispose: () => void }[] = [];
  const trackGeo = <T extends THREE.BufferGeometry>(g: T): T => {
    disposables.push(g);
    return g;
  };
  const trackMat = <T extends THREE.Material>(m: T): T => {
    disposables.push(m);
    return m;
  };

  // Shared PBR materials (ISS/Gateway padded MLI walls + dark structural ribs + deck)
  const hullMat = trackMat(
    new THREE.MeshStandardMaterial({
      map: textures.stationWall,
      roughness: 0.58,
      metalness: 0.28,
      flatShading: true,
    }),
  );
  const darkTrimMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0x1a2436,
      roughness: 0.35,
      metalness: 0.7,
      flatShading: true,
    }),
  );
  const handrailBlueMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      roughness: 0.32,
      metalness: 0.45,
      flatShading: true,
    }),
  );
  const handrailGoldMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0xeab308,
      roughness: 0.35,
      metalness: 0.5,
      flatShading: true,
    }),
  );
  const floorMat = trackMat(
    new THREE.MeshStandardMaterial({
      map: textures.floorDeck,
      roughness: 0.72,
      metalness: 0.25,
      flatShading: true,
    }),
  );
  const warmAccentMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0xeab676,
      emissive: 0xeab676,
      emissiveIntensity: 0.22,
      roughness: 0.5,
      metalness: 0.2,
    }),
  );
  const glassMat = trackMat(
    new THREE.MeshPhysicalMaterial({
      color: 0x8cc8e8,
      transparent: true,
      opacity: isSoftwareGl ? 0.26 : 0.22,
      roughness: 0.08,
      metalness: 0.1,
      depthWrite: false,
    }),
  );

  // =====================================================
  // 1. OUTDOOR LUNAR SOUTH POLE TERRAIN, SUN (~3.3°) & EARTH
  // =====================================================
  const terrainGeo = trackGeo(new THREE.PlaneGeometry(180, 180, 56, 56));
  terrainGeo.rotateX(-Math.PI / 2);
  const posAttr = terrainGeo.attributes.position;
  for (let i = 0; i < posAttr.count; i++) {
    const x = posAttr.getX(i);
    const z = posAttr.getZ(i);
    const dist = Math.hypot(x, z);
    // Keep terrain cleanly below doubled station floor underside (-0.10) out to 30.5m
    let y = -0.13;
    if (dist > 30.5) {
      const ridge =
        Math.sin(x * 0.12) * Math.cos(z * 0.12) * 1.45 +
        Math.sin(x * 0.28 + z * 0.19) * 0.45;
      const rim = Math.max(0, (dist - 46) * 0.11);
      const craterDist = Math.hypot(x - 10, z + 38);
      const crater = craterDist < 9 ? -Math.cos((craterDist / 9) * (Math.PI / 2)) * 1.6 : 0;
      y = -0.13 + ridge + rim + crater;
    }
    posAttr.setY(i, y);
  }
  terrainGeo.computeVertexNormals();
  const terrainMat = trackMat(
    new THREE.MeshStandardMaterial({
      map: textures.regolith,
      roughness: 0.94,
      metalness: 0.04,
      flatShading: true,
    }),
  );
  const terrain = new THREE.Mesh(terrainGeo, terrainMat);
  terrain.receiveShadow = !isSoftwareGl;
  scene.add(terrain);

  // Instanced Lunar Rocks / Boulders outside 31.5m station perimeter
  const rockCount = 54;
  const rockGeo = trackGeo(new THREE.DodecahedronGeometry(0.7, 0));
  const rockMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0x677481,
      roughness: 0.92,
      metalness: 0.05,
      flatShading: true,
    }),
  );
  const rockInstances = new THREE.InstancedMesh(rockGeo, rockMat, rockCount);
  const dummy = new THREE.Object3D();
  const rockColor = new THREE.Color();
  for (let i = 0; i < rockCount; i++) {
    const angle = (i / rockCount) * Math.PI * 2 + (i % 3) * 0.11;
    const radius = 31.5 + (i % 8) * 5.2;
    const rx = Math.cos(angle) * radius;
    const rz = Math.sin(angle) * radius;
    dummy.position.set(rx, 0.1, rz);
    dummy.rotation.set(i * 0.7, i * 1.1, 0);
    const s = 0.7 + (i % 5) * 0.38;
    dummy.scale.set(s * 1.25, s * 0.75, s);
    dummy.updateMatrix();
    rockInstances.setMatrixAt(i, dummy.matrix);
    const shade = 0.75 + (i % 4) * 0.1;
    rockColor.setRGB(shade * 0.45, shade * 0.5, shade * 0.56);
    rockInstances.setColorAt(i, rockColor);
  }
  rockInstances.instanceMatrix.needsUpdate = true;
  if (rockInstances.instanceColor) rockInstances.instanceColor.needsUpdate = true;
  rockInstances.computeBoundingSphere();
  scene.add(rockInstances);

  // Starfield in deep space sky
  const starCount = 460;
  const starPositions = new Float32Array(starCount * 3);
  for (let i = 0; i < starCount; i++) {
    const theta = (i * 2.39996) % (Math.PI * 2);
    const phi = Math.acos(0.12 + ((i * 73) % 100) / 116);
    const r = 95;
    starPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    starPositions[i * 3 + 1] = r * Math.cos(phi) + 4;
    starPositions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
  }
  const starGeo = trackGeo(new THREE.BufferGeometry());
  starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
  const starMat = trackMat(
    new THREE.PointsMaterial({ color: 0xe2e8f0, size: 0.46, sizeAttenuation: true }),
  );
  const stars = new THREE.Points(starGeo, starMat);
  stars.frustumCulled = false;
  scene.add(stars);

  // Distant Earth ("Blue Marble" procedural texture with oceans, continents, ice caps & clouds)
  const earthGroup = new THREE.Group();
  earthGroup.position.set(19, 9.5, -70);
  const earthMesh = new THREE.Mesh(
    trackGeo(new THREE.SphereGeometry(3.2, 22, 16)),
    trackMat(
      new THREE.MeshStandardMaterial({
        map: textures.earthGlobe,
        emissiveMap: textures.earthGlobe,
        emissive: 0xffffff,
        emissiveIntensity: 0.36,
        roughness: 0.85,
        metalness: 0.04,
      }),
    ),
  );
  earthMesh.rotation.y = -0.5;
  earthMesh.rotation.z = 0.24;
  earthGroup.add(earthMesh);
  scene.add(earthGroup);

  // Distant SpaceX Starship HLS Landing Pad & Beacon (visible through North glass at x=6, z=-60)
  const hlsPadGroup = new THREE.Group();
  hlsPadGroup.position.set(6, 0, -60);
  const padSlab = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(5.5, 6.2, 0.35, 6)),
    darkTrimMat,
  );
  padSlab.position.y = 0.17;
  hlsPadGroup.add(padSlab);
  const hlsBeaconMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.75,
      roughness: 0.3,
    }),
  );
  const padRing = new THREE.Mesh(
    trackGeo(new THREE.TorusGeometry(4.2, 0.14, 6, 18)),
    hlsBeaconMat,
  );
  padRing.rotation.x = Math.PI / 2;
  padRing.position.y = 0.38;
  hlsPadGroup.add(padRing);
  [0, 1, 2, 3].forEach((bi) => {
    const a = (bi / 4) * Math.PI * 2 + Math.PI / 4;
    const pylon = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.4, 1.4, 0.4)), hullMat);
    pylon.position.set(Math.cos(a) * 4.8, 0.7, Math.sin(a) * 4.8);
    hlsPadGroup.add(pylon);
    const beacon = new THREE.Mesh(trackGeo(new THREE.SphereGeometry(0.28, 6, 6)), hlsBeaconMat);
    beacon.position.set(Math.cos(a) * 4.8, 1.55, Math.sin(a) * 4.8);
    hlsPadGroup.add(beacon);
  });
  scene.add(hlsPadGroup);

  // Real-time 3D Cutscene Artemis Lander (visible during phase === 'cutscene')
  const cutsceneLanderGroup = new THREE.Group();
  cutsceneLanderGroup.position.set(4.2, 18.0, -26.0);
  cutsceneLanderGroup.visible = false;
  const landerStageMat = trackMat(
    new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.42, metalness: 0.35, flatShading: true }),
  );
  const landerGoldMat = trackMat(
    new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.35, metalness: 0.72, flatShading: true }),
  );
  const landerBody = new THREE.Mesh(trackGeo(new THREE.CylinderGeometry(1.15, 1.35, 3.2, 8)), landerGoldMat);
  landerBody.position.y = 2.0;
  cutsceneLanderGroup.add(landerBody);
  const landerCabin = new THREE.Mesh(trackGeo(new THREE.CylinderGeometry(0.92, 1.15, 2.1, 8)), landerStageMat);
  landerCabin.position.y = 4.6;
  cutsceneLanderGroup.add(landerCabin);
  const landerNose = new THREE.Mesh(trackGeo(new THREE.ConeGeometry(0.92, 1.25, 8)), landerStageMat);
  landerNose.position.y = 6.25;
  cutsceneLanderGroup.add(landerNose);
  [0, 1, 2, 3].forEach((li) => {
    const la = (li / 4) * Math.PI * 2 + Math.PI / 4;
    const strut = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.16, 1.75, 0.16)), darkTrimMat);
    strut.position.set(Math.cos(la) * 1.45, 0.85, Math.sin(la) * 1.45);
    strut.rotation.z = Math.cos(la) * 0.35;
    strut.rotation.x = -Math.sin(la) * 0.35;
    cutsceneLanderGroup.add(strut);
    const pad = new THREE.Mesh(trackGeo(new THREE.CylinderGeometry(0.36, 0.42, 0.12, 8)), landerGoldMat);
    pad.position.set(Math.cos(la) * 1.72, 0.06, Math.sin(la) * 1.72);
    cutsceneLanderGroup.add(pad);
  });
  const cutsceneThrusterMesh = new THREE.Mesh(
    trackGeo(new THREE.ConeGeometry(0.75, 2.4, 8)),
    trackMat(
      new THREE.MeshBasicMaterial({
        color: 0xfb923c,
        transparent: true,
        opacity: 0.85,
      }),
    ),
  );
  cutsceneThrusterMesh.rotation.x = Math.PI;
  cutsceneThrusterMesh.position.y = -0.5;
  cutsceneLanderGroup.add(cutsceneThrusterMesh);
  scene.add(cutsceneLanderGroup);

  const createRadialGlowTexture = (innerHex: string, midHex: string): THREE.CanvasTexture => {
    const c = document.createElement('canvas');
    c.width = 128;
    c.height = 128;
    const ctx = c.getContext('2d');
    if (ctx) {
      const grad = ctx.createRadialGradient(64, 64, 4, 64, 64, 64);
      grad.addColorStop(0, innerHex);
      grad.addColorStop(0.35, midHex);
      grad.addColorStop(1, 'rgba(255, 160, 60, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 128, 128);
    }
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    disposables.push(tex);
    return tex;
  };

  // Accurate Lunar South Pole Low-Horizon Sun (~3.3° above horizon, framed cleanly through North Glass)
  const sunGroup = new THREE.Group();
  sunGroup.position.set(-14, 4.4, -76);
  const sunMesh = new THREE.Mesh(
    trackGeo(new THREE.IcosahedronGeometry(3.5, 2)),
    trackMat(
      new THREE.MeshBasicMaterial({
        color: 0xfff3c4,
      }),
    ),
  );
  sunGroup.add(sunMesh);

  const coronaInner = new THREE.Sprite(
    trackMat(
      new THREE.SpriteMaterial({
        map: createRadialGlowTexture('rgba(255, 250, 220, 0.95)', 'rgba(255, 210, 110, 0.48)'),
        color: 0xffe49c,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    ),
  );
  coronaInner.scale.set(14, 14, 1);
  sunGroup.add(coronaInner);

  const coronaOuter = new THREE.Sprite(
    trackMat(
      new THREE.SpriteMaterial({
        map: createRadialGlowTexture('rgba(255, 210, 120, 0.7)', 'rgba(255, 115, 45, 0.35)'),
        color: 0xffa64d,
        transparent: true,
        opacity: 0.55,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    ),
  );
  coronaOuter.scale.set(24, 24, 1);
  sunGroup.add(coronaOuter);

  // Magnetic Coronal Loops arcing around the solar limb
  const coronalLoops: THREE.Mesh[] = [];
  [-0.55, 0.45, 1.35].forEach((rotZ, idx) => {
    const loopMat = trackMat(
      new THREE.MeshBasicMaterial({
        color: 0xffc86b,
        transparent: true,
        opacity: 0.3,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    );
    const loop = new THREE.Mesh(
      trackGeo(new THREE.TorusGeometry(4.2 + idx * 0.45, 0.14, 6, 20, Math.PI * 1.1)),
      loopMat,
    );
    loop.rotation.z = rotZ;
    loop.rotation.y = (idx - 1) * 0.35;
    sunGroup.add(loop);
    coronalLoops.push(loop);
  });
  scene.add(sunGroup);

  // Solar Wind / CME Radiation Sweep Waves rushing from low-horizon Sun toward Aurora Station
  const speSweepGroup = new THREE.Group();
  speSweepGroup.position.set(-14, 4.4, -68);
  speSweepGroup.visible = false;
  const speSweepMats: THREE.MeshBasicMaterial[] = [];
  for (let i = 0; i < 3; i++) {
    const wMat = trackMat(
      new THREE.MeshBasicMaterial({
        color: i === 0 ? 0xffb74d : 0xff6b4a,
        transparent: true,
        opacity: 0.32,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    );
    const waveRing = new THREE.Mesh(
      trackGeo(new THREE.TorusGeometry(6.5 + i * 3.2, 0.3, 6, 28, Math.PI * 0.72)),
      wMat,
    );
    waveRing.rotation.z = Math.PI * 0.64;
    waveRing.rotation.x = 0.25;
    waveRing.position.z = i * 11;
    waveRing.position.y = -i * 0.4;
    speSweepGroup.add(waveRing);
    speSweepMats.push(wMat);
  }
  scene.add(speSweepGroup);

  // Progressive Solar Radiation Streaks shooting outward from low-horizon Sun (Shifts 1 -> 6)
  const radiationStreaks: RadiationStreakItem[] = [];
  const streakGeo = trackGeo(new THREE.BoxGeometry(0.06, 0.06, 3.8));
  const streakCount = 44;
  for (let i = 0; i < streakCount; i++) {
    const sMat = trackMat(
      new THREE.MeshBasicMaterial({
        color: 0xffd27d,
        transparent: true,
        opacity: 0.25,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    );
    const sMesh = new THREE.Mesh(streakGeo, sMat);
    const spreadX = -18 + ((i * 29) % 36);
    const spreadY = 3.2 + ((i * 17) % 6);
    const startPos = new THREE.Vector3(-14 + spreadX * 0.25, spreadY, -70);
    const endTarget = new THREE.Vector3(spreadX * 1.15, 1.8 + ((i * 13) % 6), -6.2);
    const dir = endTarget.clone().sub(startPos);
    const travelLen = dir.length();
    dir.normalize();
    sMesh.position.copy(startPos).addScaledVector(dir, ((i * 0.23) % 1) * travelLen);
    sMesh.lookAt(sMesh.position.clone().add(dir));
    sMesh.frustumCulled = false;
    scene.add(sMesh);
    radiationStreaks.push({
      mesh: sMesh,
      mat: sMat,
      progress: (i * 0.173) % 1,
      speed: 0.28 + (i % 5) * 0.055,
      startPos,
      dir,
      travelLen,
    });
  }

  // SPE Solar Particle Shower (streaking outside window during Shifts 3-4)
  const speCount = 260;
  const spePos = new Float32Array(speCount * 3);
  for (let i = 0; i < speCount; i++) {
    spePos[i * 3] = -26 + (i % 28) * 2;
    spePos[i * 3 + 1] = 1.5 + ((i * 7) % 16);
    spePos[i * 3 + 2] = -52 + ((i * 11) % 40);
  }
  const speGeo = trackGeo(new THREE.BufferGeometry());
  speGeo.setAttribute('position', new THREE.BufferAttribute(spePos, 3));
  const speMat = trackMat(
    new THREE.PointsMaterial({
      color: 0xff7a45,
      size: 0.45,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
  );
  const speParticles = new THREE.Points(speGeo, speMat);
  speParticles.visible = false;
  speParticles.frustumCulled = false;
  scene.add(speParticles);

  // =====================================================
  // 2. DOUBLED-AREA STATION SHELL + 8.4m CORRIDORS + 2 WINDOWS EACH
  //    Flush single Y floor level (-0.05) + >= 0.05m gaps bridged by thresholds
  // =====================================================
  const stationGroup = new THREE.Group();
  scene.add(stationGroup);

  const addFloor = (x: number, z: number, w: number, d: number, tint = 0xffffff) => {
    const m = floorMat.clone();
    m.color.setHex(tint);
    disposables.push(m);
    const mesh = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(w, 0.1, d)), m);
    mesh.position.set(x, -0.05, z);
    mesh.receiveShadow = !isSoftwareGl;
    stationGroup.add(mesh);
  };

  const addCeiling = (x: number, z: number, w: number, d: number, yCenter = 3.68, withStrip = true) => {
    const mesh = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(w, 0.14, d)), darkTrimMat);
    mesh.position.set(x, yCenter, z);
    stationGroup.add(mesh);

    if (withStrip) {
      const strip = new THREE.Mesh(
        trackGeo(new THREE.BoxGeometry(Math.min(w - 1.4, 4.2), 0.04, 0.24)),
        warmAccentMat,
      );
      strip.position.set(x, yCenter - 0.095, z);
      stationGroup.add(strip);
    }
  };

  // 1) Mission Control: x -5.6..5.6, z -5.6..5.6
  addFloor(0, 0, 11.12, 11.12, 0xffffff);
  addCeiling(0, 0, 11.12, 11.12, 3.68, false);
  [-2.6, 2.6].forEach((lx) => {
    const softStrip = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(1.4, 0.03, 0.24)),
      warmAccentMat,
    );
    softStrip.position.set(lx, 3.59, 0.5);
    stationGroup.add(softStrip);
  });

  // NASA ISS/Gateway 45-degree Chamfered Ceiling Ribs & Blue/Gold Mobility Handrails
  const addChamferedCornerBeam = (x: number, y: number, z: number, len: number, axis: 'x' | 'z', rotSign = 1) => {
    const beam = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(axis === 'x' ? len : 0.36, 0.24, axis === 'z' ? len : 0.36)),
      darkTrimMat,
    );
    beam.position.set(x, y, z);
    if (axis === 'x') beam.rotation.x = rotSign * (Math.PI / 4);
    else beam.rotation.z = rotSign * (Math.PI / 4);
    stationGroup.add(beam);
  };
  addChamferedCornerBeam(-9.8, 3.45, -1.78, 8.1, 'x', 1);
  addChamferedCornerBeam(-9.8, 3.45, 1.78, 8.1, 'x', -1);
  addChamferedCornerBeam(9.8, 3.45, -1.78, 8.1, 'x', 1);
  addChamferedCornerBeam(9.8, 3.45, 1.78, 8.1, 'x', -1);
  addChamferedCornerBeam(-1.78, 3.45, 9.8, 8.1, 'z', -1);
  addChamferedCornerBeam(1.78, 3.45, 9.8, 8.1, 'z', 1);

  const addIssHandrail = (x: number, y: number, z: number, rotY: number, isGold = false) => {
    const hr = new THREE.Group();
    hr.position.set(x, y, z);
    hr.rotation.y = rotY;
    const mat = isGold ? handrailGoldMat : handrailBlueMat;
    const bar = new THREE.Mesh(trackGeo(new THREE.CylinderGeometry(0.025, 0.025, 0.72, 6)), mat);
    bar.rotation.z = Math.PI / 2;
    hr.add(bar);
    [-0.3, 0.3].forEach((sx) => {
      const stand = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.04, 0.04, 0.12)), darkTrimMat);
      stand.position.set(sx, 0, -0.05);
      hr.add(stand);
    });
    stationGroup.add(hr);
  };
  // Corridor & Hub Mobility Handrails
  [-11.2, -8.4, 8.4, 11.2].forEach((hx) => addIssHandrail(hx, 1.38, 1.74, Math.PI, false));
  [7.6, 11.8].forEach((hz) => {
    addIssHandrail(-1.74, 1.38, hz, Math.PI / 2, true);
    addIssHandrail(1.74, 1.38, hz, -Math.PI / 2, false);
  });
  addIssHandrail(-5.42, 1.42, -1.9, Math.PI / 2, true);
  addIssHandrail(5.42, 1.42, -1.9, -Math.PI / 2, false);

  // Color-coded Overhead NASA Utility Piping (O2 Cyan, N2 Emerald) running along corridors
  const n2PipeMat = trackMat(new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.4, metalness: 0.45 }));
  const o2PipeMat = trackMat(new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.4, metalness: 0.45 }));
  const westPipe = new THREE.Mesh(trackGeo(new THREE.CylinderGeometry(0.045, 0.045, 8.1, 6)), o2PipeMat);
  westPipe.rotation.z = Math.PI / 2;
  westPipe.position.set(-9.8, 3.22, 1.65);
  stationGroup.add(westPipe);
  const eastPipe = new THREE.Mesh(trackGeo(new THREE.CylinderGeometry(0.045, 0.045, 8.1, 6)), n2PipeMat);
  eastPipe.rotation.z = Math.PI / 2;
  eastPipe.position.set(9.8, 3.22, 1.65);
  stationGroup.add(eastPipe);

  // 2) West Connecting Corridor: x -14.0..-5.6 (8.4m), z -1.8..1.8
  addFloor(-9.8, 0, 8.28, 3.52, 0xcbd5e1);
  addCeiling(-9.8, 0, 8.28, 3.56, 3.71, true);
  // 3) Solar Bay: x -22.6..-14.0, z -4.4..4.4
  addFloor(-18.3, 0, 8.52, 8.72, 0xdbeafe);
  addCeiling(-18.3, 0, 8.52, 8.72, 3.68, true);

  // 4) East Connecting Corridor: x 5.6..14.0 (8.4m), z -1.8..1.8
  addFloor(9.8, 0, 8.28, 3.52, 0xcbd5e1);
  addCeiling(9.8, 0, 8.28, 3.56, 3.71, true);
  // 5) Greenhouse: x 14.0..23.2, z -4.4..4.4
  addFloor(18.6, 0, 9.12, 8.72, 0xdcfce7);
  addCeiling(18.6, 0, 9.12, 8.72, 3.68, true);

  // 6) South Connecting Corridor: x -1.8..1.8, z 5.6..14.0 (8.4m)
  addFloor(0, 9.8, 3.52, 8.28, 0xcbd5e1);
  addCeiling(0, 9.8, 3.56, 8.28, 3.71, true);
  // 7) Habitat, Shelter & Supply Storage Warehouse: x -5.6..5.6, z 14.0..28.0
  addFloor(0, 21.0, 11.12, 13.92, 0xfef3c7);
  addCeiling(0, 21.0, 11.12, 13.92, 3.68, true);

  // Raised low-profile floor threshold plates at corridor transitions (zero Z-fighting, flush feel)
  const addThreshold = (x: number, z: number, w: number, d: number) => {
    const sill = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(w, 0.014, d)), darkTrimMat);
    sill.position.set(x, 0.005, z);
    stationGroup.add(sill);
  };
  addThreshold(-5.6, 0, 0.16, 3.52);
  addThreshold(-14.0, 0, 0.16, 3.52);
  addThreshold(5.6, 0, 0.16, 3.52);
  addThreshold(14.0, 0, 0.16, 3.52);
  addThreshold(0, 5.6, 3.52, 0.16);
  addThreshold(0, 14.0, 3.52, 0.16);

  // Wall & Collider helpers
  const colliders: AABBBox[] = [];
  const playerOnlyColliders: AABBBox[] = [];

  const addWall = (x: number, z: number, w: number, h: number, d: number, isGlass = false) => {
    const mesh = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(w, h, d)),
      isGlass ? glassMat : hullMat,
    );
    mesh.position.set(x, h / 2, z);
    if (!isGlass) {
      mesh.castShadow = !isSoftwareGl;
      mesh.receiveShadow = !isSoftwareGl;
    } else {
      mesh.renderOrder = 4;
    }
    stationGroup.add(mesh);
    colliders.push({
      minX: x - w / 2 - 0.35,
      maxX: x + w / 2 + 0.35,
      minZ: z - d / 2 - 0.35,
      maxZ: z + d / 2 + 0.35,
    });
  };

  // Structural corner pillars (0.34m x 3.64m) preventing perpendicular wall intersections
  const addCornerPillar = (x: number, z: number) => {
    const pillar = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.34, 3.64, 0.34)), darkTrimMat);
    pillar.position.set(x, 1.82, z);
    stationGroup.add(pillar);
  };
  [
    [-5.6, -5.6], [5.6, -5.6], [-5.6, 5.6], [5.6, 5.6],
    [-14.0, -4.4], [-14.0, 4.4], [-22.65, -4.4], [-22.65, 4.4],
    [14.0, -4.4], [14.0, 4.4], [23.25, -4.4], [23.25, 4.4],
    [-5.6, 14.0], [5.6, 14.0], [-5.6, 28.0], [5.6, 28.0],
  ].forEach(([px, pz]) => addCornerPillar(px, pz));

  // North Panoramic Window Wall in Mission Control (z = -5.6, x = -5.42..5.42)
  addWall(0, -5.6, 10.84, 0.85, 0.25); // lower sill
  const northHeader = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(10.84, 0.34, 0.25)), hullMat);
  northHeader.position.set(0, 3.48, -5.6);
  stationGroup.add(northHeader);
  const northGlass = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(10.8, 2.44, 0.08)), glassMat);
  northGlass.position.set(0, 2.08, -5.6);
  northGlass.renderOrder = 5;
  stationGroup.add(northGlass);
  [-2.6, 0, 2.6].forEach((sx) => {
    const strut = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.18, 2.44, 0.28)), darkTrimMat);
    strut.position.set(sx, 2.08, -5.6);
    stationGroup.add(strut);
  });

  // Helper to build a corridor wall along X with 2 space observation windows
  const buildCorridorWallWith2WindowsX = (
    xMin: number,
    xMax: number,
    zPos: number,
    win1X: number,
    win2X: number,
  ) => {
    const winW = 2.15;
    const segments: [number, number][] = [
      [xMin, win1X - winW / 2],
      [win1X + winW / 2, win2X - winW / 2],
      [win2X + winW / 2, xMax],
    ];
    segments.forEach(([s0, s1]) => {
      const len = s1 - s0;
      if (len > 0.05) {
        const post = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(len, 3.6, 0.22)), hullMat);
        post.position.set((s0 + s1) / 2, 1.8, zPos);
        stationGroup.add(post);
      }
    });
    [win1X, win2X].forEach((wx) => {
      const sill = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(winW, 0.94, 0.22)), hullMat);
      sill.position.set(wx, 0.47, zPos);
      stationGroup.add(sill);
      const header = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(winW, 0.86, 0.22)), hullMat);
      header.position.set(wx, 3.17, zPos);
      stationGroup.add(header);
      const pane = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(winW - 0.04, 1.8, 0.07)), glassMat);
      pane.position.set(wx, 1.84, zPos);
      pane.renderOrder = 5;
      stationGroup.add(pane);
      // Dark window trim bars
      [-winW / 2 + 0.05, winW / 2 - 0.05].forEach((dx) => {
        const trim = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.1, 1.8, 0.25)), darkTrimMat);
        trim.position.set(wx + dx, 1.84, zPos);
        stationGroup.add(trim);
      });
    });
    // Single clean collider along entire corridor wall span
    colliders.push({
      minX: xMin - 0.3,
      maxX: xMax + 0.3,
      minZ: zPos - 0.45,
      maxZ: zPos + 0.45,
    });
  };

  // Helper to build a corridor wall along Z with 2 space observation windows
  const buildCorridorWallWith2WindowsZ = (
    zMin: number,
    zMax: number,
    xPos: number,
    win1Z: number,
    win2Z: number,
  ) => {
    const winD = 2.15;
    const segments: [number, number][] = [
      [zMin, win1Z - winD / 2],
      [win1Z + winD / 2, win2Z - winD / 2],
      [win2Z + winD / 2, zMax],
    ];
    segments.forEach(([s0, s1]) => {
      const len = s1 - s0;
      if (len > 0.05) {
        const post = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.22, 3.6, len)), hullMat);
        post.position.set(xPos, 1.8, (s0 + s1) / 2);
        stationGroup.add(post);
      }
    });
    [win1Z, win2Z].forEach((wz) => {
      const sill = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.22, 0.94, winD)), hullMat);
      sill.position.set(xPos, 0.47, wz);
      stationGroup.add(sill);
      const header = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.22, 0.86, winD)), hullMat);
      header.position.set(xPos, 3.17, wz);
      stationGroup.add(header);
      const pane = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.07, 1.8, winD - 0.04)), glassMat);
      pane.position.set(xPos, 1.84, wz);
      pane.renderOrder = 5;
      stationGroup.add(pane);
      [-winD / 2 + 0.05, winD / 2 - 0.05].forEach((dz) => {
        const trim = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.25, 1.8, 0.1)), darkTrimMat);
        trim.position.set(xPos, 1.84, wz + dz);
        stationGroup.add(trim);
      });
    });
    colliders.push({
      minX: xPos - 0.45,
      maxX: xPos + 0.45,
      minZ: zMin - 0.3,
      maxZ: zMax + 0.3,
    });
  };

  // Center-to-West Wall Dividers (x = -5.6, doorway z = -1.8..1.8)
  addWall(-5.6, -3.62, 0.24, 3.6, 3.64);
  addWall(-5.6, 3.62, 0.24, 3.6, 3.64);
  // West 8.4m Corridor Walls (x = -13.84..-5.76, z = ±1.9) with 2 North space windows
  buildCorridorWallWith2WindowsX(-13.84, -5.76, -1.9, -11.5, -8.1);
  addWall(-9.8, 1.9, 8.08, 3.6, 0.22);
  [-12.9, -9.8, -6.7].forEach((rx) => {
    const rib = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.22, 3.46, 0.12)), darkTrimMat);
    rib.position.set(rx, 1.74, 1.72);
    stationGroup.add(rib);
  });
  // West Corridor-to-Solar Bay Bulkheads (x = -14.0)
  addWall(-14.0, -3.02, 0.24, 3.6, 2.44);
  addWall(-14.0, 3.02, 0.24, 3.6, 2.44);

  // Solar Bay Perimeter (x = -22.6..-14.0, z = -4.4..4.4)
  addWall(-18.3, -4.4, 8.32, 0.85, 0.24);
  const westGlass = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(8.28, 2.44, 0.08)), glassMat);
  westGlass.position.set(-18.3, 2.08, -4.4);
  westGlass.renderOrder = 5;
  stationGroup.add(westGlass);
  const westHeader = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(8.32, 0.34, 0.24)), hullMat);
  westHeader.position.set(-18.3, 3.48, -4.4);
  stationGroup.add(westHeader);
  [-20.2, -16.4].forEach((sx) => {
    const strut = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.18, 2.44, 0.26)), darkTrimMat);
    strut.position.set(sx, 2.08, -4.4);
    stationGroup.add(strut);
  });
  addWall(-22.65, 0, 0.24, 3.6, 8.48); // West end wall
  addWall(-18.3, 4.4, 8.32, 3.6, 0.24); // South side of Solar Bay

  // Center-to-East Wall Dividers (x = 5.6)
  addWall(5.6, -3.62, 0.24, 3.6, 3.64);
  addWall(5.6, 3.62, 0.24, 3.6, 3.64);
  // East 8.4m Corridor Walls (x = 5.76..13.84, z = ±1.9) with 2 North space windows
  buildCorridorWallWith2WindowsX(5.76, 13.84, -1.9, 8.1, 11.5);
  addWall(9.8, 1.9, 8.08, 3.6, 0.22);
  [6.7, 9.8, 12.9].forEach((rx) => {
    const rib = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.22, 3.46, 0.12)), darkTrimMat);
    rib.position.set(rx, 1.74, 1.72);
    stationGroup.add(rib);
  });
  // East Corridor-to-Greenhouse Bulkheads (x = 14.0)
  addWall(14.0, -3.02, 0.24, 3.6, 2.44);
  addWall(14.0, 3.02, 0.24, 3.6, 2.44);

  // Greenhouse Perimeter (x = 14.0..23.2, z = -4.4..4.4)
  addWall(18.6, -4.4, 8.92, 0.85, 0.24);
  const eastGlass = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(8.88, 2.44, 0.08)), glassMat);
  eastGlass.position.set(18.6, 2.08, -4.4);
  eastGlass.renderOrder = 5;
  stationGroup.add(eastGlass);
  const eastHeader = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(8.92, 0.34, 0.24)), hullMat);
  eastHeader.position.set(18.6, 3.48, -4.4);
  stationGroup.add(eastHeader);
  [16.6, 20.6].forEach((sx) => {
    const strut = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.18, 2.44, 0.26)), darkTrimMat);
    strut.position.set(sx, 2.08, -4.4);
    stationGroup.add(strut);
  });
  addWall(23.25, 0, 0.24, 3.6, 8.48); // East end wall
  addWall(18.6, 4.4, 8.92, 3.6, 0.24); // South side of Greenhouse

  // Center-to-South Wall Dividers (z = 5.6, doorway x: -1.8..1.8)
  addWall(-3.62, 5.6, 3.64, 3.6, 0.24);
  addWall(3.62, 5.6, 3.64, 3.6, 0.24);
  // South 8.4m Corridor Walls (x = ±1.9, z = 5.76..13.84) with 2 space windows on West & East
  buildCorridorWallWith2WindowsZ(5.76, 13.84, -1.9, 8.1, 11.5);
  buildCorridorWallWith2WindowsZ(5.76, 13.84, 1.9, 8.1, 11.5);
  // South Corridor-to-Habitat Bulkheads (z = 14.0)
  addWall(-3.62, 14.0, 3.64, 3.6, 0.24);
  addWall(3.62, 14.0, 3.64, 3.6, 0.24);

  // Habitat, Shelter & Supply Storage Warehouse Perimeter (x = -5.6..5.6, z = 14.0..28.0)
  addWall(-5.6, 21.0, 0.24, 3.6, 13.68);
  addWall(5.6, 21.0, 0.24, 3.6, 13.68);
  addWall(0, 28.0, 10.84, 3.6, 0.24); // South end outer hull wall of Supply Warehouse

  // =====================================================
  // 3. COMPOSITE HERO MODELS, WALL-HUGGING NASA LAB PROPS & INTERACTABLES
  // =====================================================
  const interactiveTargets: InteractiveTarget[] = [];
  const registerInteractive = (
    opts: {
      kind: InteractableKind;
      id: string;
      zone: OutpostZoneId;
      label: string;
      shiftNumbers?: number[];
      parent?: THREE.Object3D;
    },
    x: number,
    y: number,
    z: number,
    w = 1.6,
    h = 1.6,
    d = 1.2,
  ) => {
    const hitbox = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(w, h, d)),
      trackMat(new THREE.MeshBasicMaterial({ visible: false })),
    );
    hitbox.position.set(x, y, z);
    hitbox.layers.set(1);
    hitbox.userData.targetId = opts.id;
    (opts.parent || scene).add(hitbox);
    interactiveTargets.push({
      kind: opts.kind,
      id: opts.id,
      zone: opts.zone,
      label: opts.label,
      shiftNumbers: opts.shiftNumbers,
      mesh: hitbox,
    });
  };

  // Wall-hugging NASA Avionics / Telemetry Rack helper
  const addWallAvionicsRack = (x: number, z: number, rotY: number, accentHex = 0x38bdf8) => {
    const g = new THREE.Group();
    g.position.set(x, 0, z);
    g.rotation.y = rotY;
    const body = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.75, 2.3, 1.4)), darkTrimMat);
    body.position.y = 1.15;
    g.add(body);
    const panel = new THREE.Mesh(
      trackGeo(new THREE.PlaneGeometry(1.0, 0.65)),
      trackMat(
        new THREE.MeshStandardMaterial({
          color: 0x111827,
          map: textures.zoneScreen,
          emissiveMap: textures.zoneScreen,
          emissive: 0xffffff,
          emissiveIntensity: 0.68,
          roughness: 0.72,
        }),
      ),
    );
    panel.position.set(0.39, 1.48, 0);
    panel.rotation.y = Math.PI / 2;
    g.add(panel);
    const strip = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(0.06, 0.1, 1.0)),
      trackMat(new THREE.MeshStandardMaterial({ color: accentHex, emissive: accentHex, emissiveIntensity: 0.7 })),
    );
    strip.position.set(0.38, 0.85, 0);
    g.add(strip);
    stationGroup.add(g);
    colliders.push({ minX: x - 0.65, maxX: x + 0.65, minZ: z - 0.85, maxZ: z + 0.85 });
  };

  // Wall-hugging Pressurized N2/O2 Cylinders helper
  const addGasTankPair = (x: number, z: number, tankHex = 0x70b8d3) => {
    const g = new THREE.Group();
    g.position.set(x, 0, z);
    const rack = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.75, 1.9, 0.9)), darkTrimMat);
    rack.position.y = 0.95;
    g.add(rack);
    const tankMat = trackMat(new THREE.MeshStandardMaterial({ color: tankHex, roughness: 0.35, metalness: 0.55, flatShading: true }));
    [-0.22, 0.22].forEach((dz) => {
      const cyl = new THREE.Mesh(trackGeo(new THREE.CylinderGeometry(0.16, 0.16, 1.55, 8)), tankMat);
      cyl.position.set(0, 0.92, dz);
      g.add(cyl);
    });
    stationGroup.add(g);
    colliders.push({ minX: x - 0.55, maxX: x + 0.55, minZ: z - 0.65, maxZ: z + 0.65 });
  };

  // --- A. MISSION CONTROL DESK & WALL PROPS (x: -5.6..5.6, z: -5.6..5.6) ---
  const deskGroup = new THREE.Group();
  deskGroup.position.set(0, 0, -3.1);
  const deskBase = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(3.4, 0.85, 1.05)), darkTrimMat);
  deskBase.position.y = 0.425;
  deskGroup.add(deskBase);
  const deskTop = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(3.7, 0.1, 1.3)), hullMat);
  deskTop.position.set(0, 0.88, 0.05);
  deskGroup.add(deskTop);

  const centerMonitorPivot = new THREE.Group();
  centerMonitorPivot.position.set(0, 1.32, -0.25);
  centerMonitorPivot.rotation.x = -0.18;
  const centerHood = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(1.5, 0.84, 0.2)), darkTrimMat);
  centerMonitorPivot.add(centerHood);
  const centerScreenMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0x111827,
      map: textures.controlScreen,
      emissiveMap: textures.controlScreen,
      emissive: 0xffffff,
      emissiveIntensity: 0.72,
      roughness: 0.72,
      metalness: 0.05,
    }),
  );
  const centerScreen = new THREE.Mesh(trackGeo(new THREE.PlaneGeometry(1.36, 0.7)), centerScreenMat);
  centerScreen.position.set(0, 0, 0.125);
  centerMonitorPivot.add(centerScreen);
  deskGroup.add(centerMonitorPivot);

  // Curved Side Console Desk Wings framing the Mission Control Arc
  [-1.95, 1.95].forEach((wx, idx) => {
    const wing = new THREE.Group();
    wing.position.set(wx, 0, 0.34);
    wing.rotation.y = idx === 0 ? 0.38 : -0.38;
    const wBase = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.95, 0.85, 0.85)), darkTrimMat);
    wBase.position.y = 0.425;
    wing.add(wBase);
    const wTop = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(1.02, 0.09, 0.95)), hullMat);
    wTop.position.y = 0.88;
    wing.add(wTop);
    deskGroup.add(wing);
  });

  [-1.15, 1.15].forEach((mx, idx) => {
    const sidePivot = new THREE.Group();
    sidePivot.position.set(mx, 1.22, -0.15);
    sidePivot.rotation.y = idx === 0 ? 0.35 : -0.35;
    const hood = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.72, 0.58, 0.18)), darkTrimMat);
    sidePivot.add(hood);
    const sideScreenMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: 0x111827,
        map: textures.zoneScreen,
        emissiveMap: textures.zoneScreen,
        emissive: 0xffffff,
        emissiveIntensity: 0.7,
        roughness: 0.72,
        metalness: 0.05,
      }),
    );
    const screen = new THREE.Mesh(trackGeo(new THREE.PlaneGeometry(0.62, 0.45)), sideScreenMat);
    screen.position.set(0, 0, 0.115);
    sidePivot.add(screen);
    deskGroup.add(sidePivot);
  });

  const keyColors = [0x6baf83, 0x70b8d3, 0xf0b85d, 0xd76562];
  keyColors.forEach((kc, ki) => {
    const btn = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(0.24, 0.06, 0.18)),
      trackMat(
        new THREE.MeshStandardMaterial({
          color: kc,
          emissive: kc,
          emissiveIntensity: 0.38,
          roughness: 0.4,
        }),
      ),
    );
    btn.position.set(-0.63 + ki * 0.42, 0.96, 0.38);
    deskGroup.add(btn);
  });

  const alarmBeaconMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0x6baf83,
      emissive: 0x6baf83,
      emissiveIntensity: 0.45,
      roughness: 0.3,
    }),
  );
  const alarmBeacon = new THREE.Mesh(trackGeo(new THREE.CylinderGeometry(0.14, 0.18, 0.22, 8)), alarmBeaconMat);
  alarmBeacon.position.set(0, 3.45, -3.1);
  stationGroup.add(alarmBeacon);

  stationGroup.add(deskGroup);
  colliders.push({ minX: -2.15, maxX: 2.15, minZ: -3.9, maxZ: -2.3 });
  registerInteractive(
    {
      kind: 'shift_trigger',
      id: 'shift3_radar',
      zone: 'control',
      label: 'Radar Bão Mặt Trời & Bàn Chỉ Huy',
      shiftNumbers: [8, 9],
    },
    0,
    1.25,
    -3.1,
    3.4,
    1.6,
    1.6,
  );

  // Wall-hugging ISS racks & Lunar Regolith analysis table inside Control Hub
  addWallAvionicsRack(-5.05, -3.5, 0, 0x70b8d3);
  addWallAvionicsRack(5.05, -3.5, Math.PI, 0xf2c879);
  addWallAvionicsRack(-4.5, 4.95, Math.PI / 2, 0x6baf83);
  // Lunar Regolith Specimen Table flush against South-East wall
  const regBench = new THREE.Group();
  regBench.position.set(4.1, 0, 4.95);
  const regBase = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(2.0, 0.85, 0.85)), darkTrimMat);
  regBase.position.y = 0.425;
  regBench.add(regBase);
  const regCase = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.75, 0.42, 0.5)), glassMat);
  regCase.position.set(-0.35, 1.06, 0);
  regBench.add(regCase);
  const regSample = new THREE.Mesh(
    trackGeo(new THREE.DodecahedronGeometry(0.16, 0)),
    trackMat(new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.9, flatShading: true })),
  );
  regSample.position.set(-0.35, 1.02, 0);
  regBench.add(regSample);
  const microStand = new THREE.Mesh(trackGeo(new THREE.CylinderGeometry(0.08, 0.14, 0.48, 6)), hullMat);
  microStand.position.set(0.45, 1.09, 0);
  regBench.add(microStand);
  stationGroup.add(regBench);
  colliders.push({ minX: 2.85, maxX: 5.35, minZ: 4.35, maxZ: 5.55 });

  // EVA Lunar Rover Control Console inside Mission Control (x: -3.6, z: -2.6)
  const roverDeskGroup = new THREE.Group();
  roverDeskGroup.position.set(-3.6, 0, -2.6);
  roverDeskGroup.rotation.y = 0.35;
  const rDeskBase = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(1.3, 0.85, 0.85)), darkTrimMat);
  rDeskBase.position.y = 0.425;
  roverDeskGroup.add(rDeskBase);
  const rScreenHood = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.95, 0.68, 0.16)), darkTrimMat);
  rScreenHood.position.set(0, 1.24, -0.2);
  rScreenHood.rotation.x = -0.14;
  roverDeskGroup.add(rScreenHood);
  const rScreen = new THREE.Mesh(
    trackGeo(new THREE.PlaneGeometry(0.84, 0.56)),
    trackMat(
      new THREE.MeshStandardMaterial({
        color: 0x111827,
        map: textures.roverScreen,
        emissiveMap: textures.roverScreen,
        emissive: 0xffffff,
        emissiveIntensity: 0.78,
        roughness: 0.7,
      }),
    ),
  );
  rScreen.position.set(0, 1.24, -0.11);
  rScreen.rotation.x = -0.14;
  roverDeskGroup.add(rScreen);

  // Rotating Low-Poly Mini-Rover Hologram on right side of Rover Console
  const holoPad = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(0.28, 0.32, 0.06, 12)),
    trackMat(new THREE.MeshStandardMaterial({ color: 0x0284c7, emissive: 0x38bdf8, emissiveIntensity: 0.7 })),
  );
  holoPad.position.set(0.32, 0.88, 0.16);
  roverDeskGroup.add(holoPad);
  const roverHoloGroup = new THREE.Group();
  roverHoloGroup.position.set(0.32, 1.08, 0.16);
  const holoMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0x7dd3fc,
      emissive: 0x38bdf8,
      emissiveIntensity: 0.85,
      transparent: true,
      opacity: 0.82,
      flatShading: true,
    }),
  );
  const roverBodyHolo = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.26, 0.12, 0.18)), holoMat);
  roverHoloGroup.add(roverBodyHolo);
  const roverMastHolo = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.05, 0.14, 0.05)), holoMat);
  roverMastHolo.position.set(0.08, 0.12, 0);
  roverHoloGroup.add(roverMastHolo);
  [-0.1, 0.1].forEach((wx) => {
    [-0.1, 0.1].forEach((wz) => {
      const wheel = new THREE.Mesh(trackGeo(new THREE.CylinderGeometry(0.045, 0.045, 0.04, 6)), holoMat);
      wheel.rotation.x = Math.PI / 2;
      wheel.position.set(wx, -0.07, wz);
      roverHoloGroup.add(wheel);
    });
  });
  roverDeskGroup.add(roverHoloGroup);
  stationGroup.add(roverDeskGroup);
  colliders.push({ minX: -4.45, maxX: -2.75, minZ: -3.35, maxZ: -1.85 });
  registerInteractive(
    {
      kind: 'rover_console',
      id: 'rover_console',
      zone: 'control',
      label: '🛸 Máy Tính Điều Khiển Robot EVA Rover',
    },
    -3.6,
    1.2,
    -2.6,
    1.55,
    1.6,
    1.3,
  );

  // --- 3 Proximity Automatic Twin-Leaf Sliding Doors (8.4m Corridor Thresholds) ---
  const buildAirlockAssembly = (
    id: AirlockId,
    x: number,
    z: number,
    axis: 'x' | 'z',
  ): AirlockRig => {
    const group = new THREE.Group();
    group.position.set(x, 0, z);
    if (axis === 'x') {
      group.rotation.y = Math.PI / 2;
    }

    const jambL = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.36, 3.6, 0.42)), darkTrimMat);
    jambL.position.set(-1.62, 1.8, 0);
    group.add(jambL);
    const jambR = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.36, 3.6, 0.42)), darkTrimMat);
    jambR.position.set(1.62, 1.8, 0);
    group.add(jambR);
    const lintel = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(2.9, 0.86, 0.44)), hullMat);
    lintel.position.set(0, 3.16, 0);
    group.add(lintel);

    const statusMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: 0xf59e0b,
        emissive: 0xf59e0b,
        emissiveIntensity: 0.75,
        roughness: 0.3,
      }),
    );
    const buttonMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        emissive: 0x38bdf8,
        emissiveIntensity: 0.65,
        roughness: 0.3,
      }),
    );

    [-0.26, 0.26].forEach((zOff) => {
      const ledBar = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(1.15, 0.12, 0.05)), statusMat);
      ledBar.position.set(0, 2.88, zOff);
      group.add(ledBar);

      const sensorPod = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.24, 0.14, 0.08)), darkTrimMat);
      sensorPod.position.set(0, 2.7, zOff);
      group.add(sensorPod);

      const sensorEye = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.14, 0.05, 0.04)), buttonMat);
      sensorEye.position.set(0, 2.7, zOff + (zOff > 0 ? 0.04 : -0.04));
      group.add(sensorEye);
    });

    const leafMat = trackMat(
      new THREE.MeshStandardMaterial({
        map: textures.shelterDoor,
        color: 0xcbd5e1,
        roughness: 0.45,
        metalness: 0.55,
        flatShading: true,
      }),
    );
    const buildLeaf = (isLeft: boolean) => {
      const leafGroup = new THREE.Group();
      leafGroup.position.set(isLeft ? -0.74 : 0.74, 1.38, 0);
      const panel = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(1.46, 2.72, 0.14)), leafMat);
      leafGroup.add(panel);
      const trim = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.08, 2.72, 0.18)), warmAccentMat);
      trim.position.x = isLeft ? 0.69 : -0.69;
      leafGroup.add(trim);
      const viewport = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.34, 0.6, 0.17)), glassMat);
      viewport.position.set(isLeft ? 0.2 : -0.2, 0.32, 0);
      leafGroup.add(viewport);
      group.add(leafGroup);
      return leafGroup;
    };

    const leafL = buildLeaf(true);
    const leafR = buildLeaf(false);

    stationGroup.add(group);

    return {
      id,
      x,
      z,
      axis,
      leafL,
      leafR,
      statusMat,
      buttonMat,
      openProgress: 0,
      isOpen: false,
    };
  };

  const airlocks: Record<AirlockId, AirlockRig> = {
    solarControl: buildAirlockAssembly('solarControl', -6.05, 0, 'x'),
    solarBay: buildAirlockAssembly('solarBay', -13.55, 0, 'x'),
    greenhouseControl: buildAirlockAssembly('greenhouseControl', 6.05, 0, 'x'),
    greenhouseBay: buildAirlockAssembly('greenhouseBay', 13.55, 0, 'x'),
    habitatControl: buildAirlockAssembly('habitatControl', 0, 6.05, 'z'),
    habitatBay: buildAirlockAssembly('habitatBay', 0, 13.55, 'z'),
  };

  // --- B. SOLAR RIDGE (OUTSIDE) & BATTERY CORE RACK (WEST WING, x = -22.6..-14.0) ---
  const solarDustMeshes: THREE.Mesh[] = [];
  [-20.5, -13.5, -6.5].forEach((sx, idx) => {
    const tower = new THREE.Group();
    tower.position.set(sx, 0, -14.5 - (idx % 2) * 1.6);

    const pad = new THREE.Mesh(trackGeo(new THREE.CylinderGeometry(0.95, 1.15, 0.3, 6)), darkTrimMat);
    pad.position.y = 0.15;
    tower.add(pad);
    const mast = new THREE.Mesh(trackGeo(new THREE.CylinderGeometry(0.16, 0.22, 2.4, 6)), hullMat);
    mast.position.y = 1.45;
    tower.add(mast);
    const yoke = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.62, 0.25, 0.42)), darkTrimMat);
    yoke.position.y = 2.65;
    tower.add(yoke);
    const wing = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(3.5, 0.08, 1.7)),
      trackMat(
        new THREE.MeshStandardMaterial({
          map: textures.solarCell,
          roughness: 0.25,
          metalness: 0.65,
        }),
      ),
    );
    wing.position.y = 2.82;
    wing.rotation.x = 0.48;
    tower.add(wing);

    const dustMesh = new THREE.Mesh(
      trackGeo(new THREE.PlaneGeometry(3.46, 1.66)),
      trackMat(
        new THREE.MeshStandardMaterial({
          map: textures.dustOverlay,
          transparent: true,
          opacity: 0.9,
          roughness: 0.95,
          depthWrite: false,
        }),
      ),
    );
    dustMesh.position.set(0, 0.065, 0);
    dustMesh.rotation.x = -Math.PI / 2;
    wing.add(dustMesh);
    solarDustMeshes.push(dustMesh);

    scene.add(tower);
  });

  // Interior Battery Core Rack (Extended Solar Bay at x = -21.0, z = 0)
  const rackGroup = new THREE.Group();
  rackGroup.position.set(-21.0, 0, 0);
  const rackChassis = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(1.15, 2.45, 3.2)), darkTrimMat);
  rackChassis.position.y = 1.225;
  rackGroup.add(rackChassis);

  const batteryBarMeshes: THREE.Mesh[] = [];
  const batteryBarMats: THREE.MeshStandardMaterial[] = [];
  for (let i = 0; i < 5; i++) {
    const bMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: 0x70b8d3,
        emissive: 0x70b8d3,
        emissiveIntensity: 0.72,
        roughness: 0.35,
      }),
    );
    const bar = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.24, 1.65, 0.38)), bMat);
    bar.position.set(0.6, 1.22, -1.06 + i * 0.53);
    rackGroup.add(bar);
    batteryBarMeshes.push(bar);
    batteryBarMats.push(bMat);
  }
  const pScreenBack = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.08, 0.74, 0.94)), darkTrimMat);
  pScreenBack.position.set(0.56, 1.4, 2.08);
  rackGroup.add(pScreenBack);
  const pScreen = new THREE.Mesh(
    trackGeo(new THREE.PlaneGeometry(0.86, 0.66)),
    trackMat(
      new THREE.MeshStandardMaterial({
        color: 0x111827,
        map: textures.zoneScreen,
        emissiveMap: textures.zoneScreen,
        emissive: 0xffffff,
        emissiveIntensity: 0.72,
        roughness: 0.7,
      }),
    ),
  );
  pScreen.position.set(0.62, 1.4, 2.08);
  pScreen.rotation.y = Math.PI / 2;
  rackGroup.add(pScreen);
  stationGroup.add(rackGroup);
  colliders.push({ minX: -22.0, maxX: -19.8, minZ: -2.0, maxZ: 2.0 });
  registerInteractive(
    {
      kind: 'shift_trigger',
      id: 'shift1_solar',
      zone: 'solar',
      label: 'Bảng Điện Solar Ridge',
      shiftNumbers: [1, 5],
    },
    -20.2,
    1.25,
    0,
    1.9,
    2.1,
    3.4,
  );

  // Wall-hugging Solar Bay props (South wall z = 3.85)
  addWallAvionicsRack(-19.5, 3.85, -Math.PI / 2, 0xf59e0b);
  addGasTankPair(-16.5, 3.85, 0xfbbf24);

  // --- C. GREENHOUSE / SPACE BOTANY LAB (EAST WING, x = 14.0..23.2, z = -4.4..4.4) ---
  // 3 Distinct Real NASA Crops: Outredgeous Red Romaine Lettuce, Red Robin Dwarf Tomato, Apogee Dwarf Wheat
  const plantGroups: THREE.Group[] = [];
  const plantLeafMats: THREE.MeshStandardMaterial[] = [];

  const botanyLedMats: Record<'lettuce' | 'tomato' | 'wheat', THREE.MeshStandardMaterial> = {
    lettuce: trackMat(
      new THREE.MeshStandardMaterial({ color: 0xe9d5ff, emissive: 0xc084fc, emissiveIntensity: 0.7 }),
    ),
    tomato: trackMat(
      new THREE.MeshStandardMaterial({ color: 0xe9d5ff, emissive: 0xc084fc, emissiveIntensity: 0.7 }),
    ),
    wheat: trackMat(
      new THREE.MeshStandardMaterial({ color: 0xfef9c3, emissive: 0xfde047, emissiveIntensity: 0.65 }),
    ),
  };

  // North Bench (z = -2.2): Left half Lettuce (x 16.6, 17.7) + Right half Red Robin Tomato (x 18.9, 20.0)
  const northBench = new THREE.Group();
  northBench.position.set(18.3, 0, -2.2);
  const nTrough = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(5.0, 0.68, 1.05)), hullMat);
  nTrough.position.y = 0.34;
  northBench.add(nTrough);
  const nSoil = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(4.7, 0.12, 0.85)),
    trackMat(new THREE.MeshStandardMaterial({ color: 0x3b2f26, roughness: 0.95 })),
  );
  nSoil.position.y = 0.7;
  northBench.add(nSoil);
  const lettuceLedBar = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(2.2, 0.1, 0.36)), botanyLedMats.lettuce);
  lettuceLedBar.position.set(-1.15, 2.48, 0);
  northBench.add(lettuceLedBar);
  const tomatoLedBar = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(2.2, 0.1, 0.36)), botanyLedMats.tomato);
  tomatoLedBar.position.set(1.15, 2.48, 0);
  northBench.add(tomatoLedBar);
  stationGroup.add(northBench);

  // Outredgeous Red Romaine Lettuce (x = 16.6, 17.7)
  [-1.7, -0.58].forEach((px) => {
    const plantPivot = new THREE.Group();
    plantPivot.position.set(18.3 + px, 0.76, -2.2);
    const leafMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: 0x9d4edd,
        roughness: 0.65,
        metalness: 0.05,
        flatShading: true,
      }),
    );
    plantLeafMats.push(leafMat);
    for (let l = 0; l < 6; l++) {
      const leaf = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.24, 0.28, 0.08)), leafMat);
      const a = (l / 6) * Math.PI * 2;
      leaf.position.set(Math.cos(a) * 0.14, 0.16, Math.sin(a) * 0.14);
      leaf.rotation.y = -a;
      leaf.rotation.x = 0.42;
      plantPivot.add(leaf);
    }
    stationGroup.add(plantPivot);
    plantGroups.push(plantPivot);
  });

  // Red Robin Dwarf Tomato (x = 18.9, 20.0) with bright red cherry tomatoes
  const tomatoFruitMat = trackMat(
    new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0x991b1b, emissiveIntensity: 0.35, flatShading: true }),
  );
  const tomatoFlowerMat = trackMat(
    new THREE.MeshStandardMaterial({ color: 0xfacc15, emissive: 0xca8a04, emissiveIntensity: 0.35 }),
  );
  [0.58, 1.7].forEach((px) => {
    const plantPivot = new THREE.Group();
    plantPivot.position.set(18.3 + px, 0.76, -2.2);
    const leafMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: 0x4ade80,
        roughness: 0.62,
        metalness: 0.04,
        flatShading: true,
      }),
    );
    plantLeafMats.push(leafMat);
    const stem = new THREE.Mesh(trackGeo(new THREE.CylinderGeometry(0.05, 0.07, 0.56, 5)), leafMat);
    stem.position.y = 0.28;
    plantPivot.add(stem);
    for (let l = 0; l < 4; l++) {
      const leaf = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.3, 0.06, 0.15)), leafMat);
      const a = (l / 4) * Math.PI * 2;
      leaf.position.set(Math.cos(a) * 0.18, 0.42 + (l % 2) * 0.08, Math.sin(a) * 0.18);
      leaf.rotation.y = -a;
      leaf.rotation.z = 0.24;
      plantPivot.add(leaf);
    }
    // Red cherry tomatoes & yellow blossom
    [
      [-0.14, 0.36, 0.12],
      [0.14, 0.46, -0.1],
      [0.06, 0.3, 0.16],
    ].forEach(([tx, ty, tz]) => {
      const fruit = new THREE.Mesh(trackGeo(new THREE.DodecahedronGeometry(0.07, 0)), tomatoFruitMat);
      fruit.position.set(tx, ty, tz);
      plantPivot.add(fruit);
    });
    const blossom = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.06, 0.06, 0.06)), tomatoFlowerMat);
    blossom.position.set(-0.08, 0.56, -0.08);
    plantPivot.add(blossom);

    stationGroup.add(plantPivot);
    plantGroups.push(plantPivot);
  });

  // South Bench (z = 2.2): Apogee Dwarf Wheat (4 clumps of tall golden-green wheat stalks)
  const southBench = new THREE.Group();
  southBench.position.set(18.3, 0, 2.2);
  const sTrough = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(5.0, 0.68, 1.05)), hullMat);
  sTrough.position.y = 0.34;
  southBench.add(sTrough);
  const sSoil = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(4.7, 0.12, 0.85)),
    trackMat(new THREE.MeshStandardMaterial({ color: 0x3b2f26, roughness: 0.95 })),
  );
  sSoil.position.y = 0.7;
  southBench.add(sSoil);
  const wheatLedBar = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(4.6, 0.1, 0.36)), botanyLedMats.wheat);
  wheatLedBar.position.y = 2.48;
  southBench.add(wheatLedBar);
  stationGroup.add(southBench);

  const wheatHeadMat = trackMat(
    new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.65, flatShading: true }),
  );
  [-1.7, -0.56, 0.56, 1.7].forEach((px) => {
    const plantPivot = new THREE.Group();
    plantPivot.position.set(18.3 + px, 0.76, 2.2);
    const stalkMat = trackMat(
      new THREE.MeshStandardMaterial({ color: 0x84cc16, roughness: 0.65, flatShading: true }),
    );
    plantLeafMats.push(stalkMat);
    for (let s = 0; s < 5; s++) {
      const a = (s / 5) * Math.PI * 2;
      const sx = Math.cos(a) * 0.11;
      const sz = Math.sin(a) * 0.11;
      const stalk = new THREE.Mesh(trackGeo(new THREE.CylinderGeometry(0.02, 0.025, 0.68, 4)), stalkMat);
      stalk.position.set(sx, 0.34, sz);
      plantPivot.add(stalk);
      const ear = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.055, 0.16, 0.055)), wheatHeadMat);
      ear.position.set(sx, 0.7, sz);
      plantPivot.add(ear);
    }
    stationGroup.add(plantPivot);
    plantGroups.push(plantPivot);
  });

  // Wall-hugging Multi-Tier NASA Veggie/APH shelving with signature pink-magenta grow LEDs (Greenhouse South wall z = 3.85)
  [16.6, 20.4].forEach((rx) => {
    const vegRack = new THREE.Group();
    vegRack.position.set(rx, 0, 3.85);
    const frame = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(2.25, 2.32, 0.68)), darkTrimMat);
    frame.position.y = 1.16;
    vegRack.add(frame);
    [0.58, 1.24, 1.88].forEach((ty, tierIdx) => {
      const tray = new THREE.Mesh(
        trackGeo(new THREE.BoxGeometry(1.94, 0.14, 0.52)),
        trackMat(new THREE.MeshStandardMaterial({ color: 0x16a34a, emissive: 0x14532d, emissiveIntensity: 0.4 })),
      );
      tray.position.set(0, ty, -0.14);
      vegRack.add(tray);
      // Leafy mini Veggie cushions inside each tier
      [-0.6, 0, 0.6].forEach((cx) => {
        const pod = new THREE.Mesh(
          trackGeo(new THREE.DodecahedronGeometry(0.11, 0)),
          trackMat(new THREE.MeshStandardMaterial({ color: tierIdx === 1 ? 0xa855f7 : 0x4ade80, flatShading: true })),
        );
        pod.position.set(cx, ty + 0.12, -0.16);
        vegRack.add(pod);
      });
      const led = new THREE.Mesh(
        trackGeo(new THREE.BoxGeometry(1.92, 0.05, 0.24)),
        trackMat(new THREE.MeshStandardMaterial({ color: 0xf5d0fe, emissive: 0xe879f9, emissiveIntensity: 0.85 })),
      );
      led.position.set(0, ty + 0.34, -0.12);
      vegRack.add(led);
    });
    stationGroup.add(vegRack);
    colliders.push({ minX: rx - 1.3, maxX: rx + 1.3, minZ: 3.3, maxZ: 4.4 });
  });

  // Interactive Space Botany Care Terminal (x = 15.1, z = -3.1)
  const botanyStand = new THREE.Group();
  botanyStand.position.set(15.1, 0, -3.1);
  botanyStand.rotation.y = Math.PI / 4;
  const bBase = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.65, 1.05, 0.55)), darkTrimMat);
  bBase.position.y = 0.525;
  botanyStand.add(bBase);
  const bScreen = new THREE.Mesh(
    trackGeo(new THREE.PlaneGeometry(0.56, 0.42)),
    trackMat(
      new THREE.MeshStandardMaterial({
        color: 0x0f172a,
        map: textures.zoneScreen,
        emissiveMap: textures.zoneScreen,
        emissive: 0x86efac,
        emissiveIntensity: 0.72,
      }),
    ),
  );
  bScreen.position.set(0, 1.24, 0.12);
  bScreen.rotation.x = -0.35;
  botanyStand.add(bScreen);
  stationGroup.add(botanyStand);
  colliders.push({ minX: 14.55, maxX: 15.65, minZ: -3.65, maxZ: -2.55 });
  registerInteractive(
    {
      kind: 'botany_lab',
      id: 'botany_lab',
      zone: 'greenhouse',
      label: '🌱 Bảng Chăm Sóc 4 Loài Cây Thủy Canh (Botany Lab)',
    },
    15.1,
    1.15,
    -3.1,
    1.1,
    1.5,
    1.1,
  );

  // Greenhouse diagnostic stand (x = 22.1, z = 0)
  const ghStand = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.55, 1.4, 0.7)), darkTrimMat);
  ghStand.position.set(22.1, 0.7, 0);
  stationGroup.add(ghStand);
  const ghScreen = new THREE.Mesh(
    trackGeo(new THREE.PlaneGeometry(0.6, 0.48)),
    trackMat(
      new THREE.MeshStandardMaterial({
        color: 0x111827,
        map: textures.zoneScreen,
        emissiveMap: textures.zoneScreen,
        emissive: 0xffffff,
        emissiveIntensity: 0.72,
        roughness: 0.7,
      }),
    ),
  );
  ghScreen.position.set(21.79, 1.18, 0);
  ghScreen.rotation.y = -Math.PI / 2;
  stationGroup.add(ghScreen);

  colliders.push({ minX: 15.6, maxX: 21.0, minZ: -2.95, maxZ: -1.45 });
  colliders.push({ minX: 15.6, maxX: 21.0, minZ: 1.45, maxZ: 2.95 });
  colliders.push({ minX: 21.6, maxX: 22.8, minZ: -0.6, maxZ: 0.6 });
  registerInteractive(
    {
      kind: 'shift_trigger',
      id: 'shift4_greenhouse',
      zone: 'greenhouse',
      label: 'Bảng Chẩn Đoán Vườn Cây (Greenhouse)',
      shiftNumbers: [6],
    },
    21.5,
    1.2,
    0,
    1.6,
    2.0,
    1.8,
  );

  // --- D. HABITAT, ECLSS WATER (LEFT), CO2 SCRUBBER (RIGHT) & HIGH-PRESSURE GLASS LAB DOOR ---
  // Wall-hugging pressurized O2/N2 tanks near Habitat North corners
  addGasTankPair(-4.85, 15.0, 0x38bdf8);
  addGasTankPair(4.85, 15.0, 0x6baf83);

  // 1. ECLSS Water Recovery Unit (Left Wall x = -4.35, z = 17.5)
  const eclssGroup = new THREE.Group();
  eclssGroup.position.set(-4.35, 0, 17.5);
  const eclssFrame = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(1.1, 2.3, 2.1)), darkTrimMat);
  eclssFrame.position.y = 1.15;
  eclssGroup.add(eclssFrame);

  const waterTankShell = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(0.34, 0.34, 1.65, 8)),
    glassMat,
  );
  waterTankShell.position.set(0.6, 1.12, -0.35);
  waterTankShell.renderOrder = 4;
  eclssGroup.add(waterTankShell);

  const waterLevelMesh = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(0.28, 0.28, 1.45, 8)),
    trackMat(
      new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        emissive: 0x0284c7,
        emissiveIntensity: 0.5,
        roughness: 0.2,
      }),
    ),
  );
  waterLevelMesh.position.set(0.6, 1.0, -0.35);
  eclssGroup.add(waterLevelMesh);

  const waterScreen = new THREE.Mesh(
    trackGeo(new THREE.PlaneGeometry(0.72, 0.56)),
    trackMat(
      new THREE.MeshStandardMaterial({
        color: 0x111827,
        map: textures.zoneScreen,
        emissiveMap: textures.zoneScreen,
        emissive: 0xffffff,
        emissiveIntensity: 0.72,
        roughness: 0.7,
      }),
    ),
  );
  waterScreen.position.set(0.59, 1.36, 0.45);
  waterScreen.rotation.y = Math.PI / 2;
  eclssGroup.add(waterScreen);
  stationGroup.add(eclssGroup);
  colliders.push({ minX: -5.4, maxX: -3.4, minZ: 16.2, maxZ: 18.8 });

  // 2. Dedicated CO2 Air Scrubber Station (Right Wall x = +4.35, z = 17.8)
  const co2Group = new THREE.Group();
  co2Group.position.set(4.35, 0, 17.8);
  const co2Chassis = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(1.1, 2.3, 1.95)), darkTrimMat);
  co2Chassis.position.y = 1.15;
  co2Group.add(co2Chassis);

  [-0.5, 0.5].forEach((cz) => {
    const canister = new THREE.Mesh(trackGeo(new THREE.CylinderGeometry(0.22, 0.22, 1.5, 8)), hullMat);
    canister.position.set(-0.58, 0.85, cz);
    co2Group.add(canister);
  });

  const intakeGrille = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.1, 0.6, 0.54)),
    trackMat(
      new THREE.MeshStandardMaterial({
        color: 0x334155,
        emissive: 0x70b8d3,
        emissiveIntensity: 0.4,
        roughness: 0.35,
      }),
    ),
  );
  intakeGrille.position.set(-0.6, 1.25, 0);
  co2Group.add(intakeGrille);

  const co2SignMesh = new THREE.Mesh(
    trackGeo(new THREE.PlaneGeometry(1.25, 0.48)),
    trackMat(
      new THREE.MeshStandardMaterial({
        color: 0x111827,
        map: textures.co2Sign,
        emissiveMap: textures.co2Sign,
        emissive: 0xffffff,
        emissiveIntensity: 0.78,
        roughness: 0.68,
      }),
    ),
  );
  co2SignMesh.position.set(-0.59, 2.0, 0);
  co2SignMesh.rotation.y = -Math.PI / 2;
  co2Group.add(co2SignMesh);

  const co2BeaconMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0x6baf83,
      emissive: 0x6baf83,
      emissiveIntensity: 0.55,
      roughness: 0.25,
    }),
  );
  const co2BeaconSphere = new THREE.Mesh(trackGeo(new THREE.SphereGeometry(0.18, 8, 8)), co2BeaconMat);
  co2BeaconSphere.position.set(-0.42, 2.48, 0);
  co2Group.add(co2BeaconSphere);
  stationGroup.add(co2Group);
  colliders.push({ minX: 3.4, maxX: 5.4, minZ: 16.5, maxZ: 19.1 });

  const co2BeaconLight = new THREE.PointLight(0xd76562, 0, 9, 1.5);
  co2BeaconLight.position.set(3.6, 2.55, 17.8);
  scene.add(co2BeaconLight);

  // 2B. Specialized Chamber Framing: Water-Wall Radiation Shielding (West) & OGS Air Pipes (East) + Med & ARED Bay
  const waterWallMat = trackMat(
    new THREE.MeshPhysicalMaterial({
      color: 0x38bdf8,
      emissive: 0x0369a1,
      emissiveIntensity: 0.25,
      transparent: true,
      opacity: 0.52,
      roughness: 0.15,
      metalness: 0.08,
    }),
  );
  [16.3, 17.5, 18.7].forEach((wz) => {
    const bladder = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.16, 2.35, 1.0)), waterWallMat);
    bladder.position.set(-5.32, 1.45, wz);
    stationGroup.add(bladder);
  });

  // Walk-in Glass Partition Headers & Side Rails around Water Chamber (West) & Oxygen Chamber (East)
  [-2.65, 2.65].forEach((px) => {
    const headerBeam = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.16, 0.24, 3.8)), darkTrimMat);
    headerBeam.position.set(px, 3.15, 17.65);
    stationGroup.add(headerBeam);
    [15.85, 19.45].forEach((pz) => {
      const post = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.14, 3.2, 0.14)), darkTrimMat);
      post.position.set(px, 1.6, pz);
      stationGroup.add(post);
    });
    const glassSign = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.06, 0.72, 1.15)), glassMat);
    glassSign.position.set(px, 2.65, 17.65);
    glassSign.renderOrder = 4;
    stationGroup.add(glassSign);
  });

  // Dynamic Overhead & Wall Air Pipes connecting Water Chamber -> OGS Electrolysis -> CO2 Scrubber
  const airPipeMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.55,
      roughness: 0.25,
      metalness: 0.45,
    }),
  );
  const overheadPipe = new THREE.Mesh(trackGeo(new THREE.CylinderGeometry(0.09, 0.09, 7.8, 8)), airPipeMat);
  overheadPipe.rotation.z = Math.PI / 2;
  overheadPipe.position.set(0, 3.28, 17.65);
  stationGroup.add(overheadPipe);
  [-3.85, 3.85].forEach((dropX) => {
    const dropPipe = new THREE.Mesh(trackGeo(new THREE.CylinderGeometry(0.08, 0.08, 1.0, 8)), airPipeMat);
    dropPipe.position.set(dropX, 2.78, 17.65);
    stationGroup.add(dropPipe);
  });

  // Register non-blocking chamber info panels on front posts
  registerInteractive(
    {
      kind: 'chamber_info',
      id: 'chamber_water',
      zone: 'habitat',
      label: '💧 Buồng Tái Chế Nước & Vách Chắn Bức Xạ',
    },
    -2.65,
    1.5,
    15.85,
    0.9,
    1.8,
    0.9,
  );
  registerInteractive(
    {
      kind: 'chamber_info',
      id: 'chamber_oxygen',
      zone: 'habitat',
      label: '🫁 Buồng Điện Phân Oxy & Đường Ống Khí',
    },
    2.65,
    1.5,
    15.85,
    0.9,
    1.8,
    0.9,
  );

  // Space Medicine Bay Enclosure, Detailed Exam Bed, ECG Monitor & ARED Bay (Habitat NW, x = -5.5..-1.8, z = 14.1..16.05)
  // Glass partition on South face (z = 16.05) + East doorway wall (x = -1.8) with sliding door
  const medPartitionSouth = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(3.65, 2.9, 0.1)), glassMat);
  medPartitionSouth.position.set(-3.65, 1.45, 16.05);
  medPartitionSouth.renderOrder = 4;
  stationGroup.add(medPartitionSouth);
  const medSouthSill = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(3.65, 0.68, 0.16)), hullMat);
  medSouthSill.position.set(-3.65, 0.34, 16.05);
  stationGroup.add(medSouthSill);
  colliders.push({ minX: -5.5, maxX: -1.75, minZ: 15.88, maxZ: 16.25 });

  // East glass wall jamb + lockable sliding glass door (doorway z: 14.35..15.75)
  const medPostSouth = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.18, 3.1, 0.36)), darkTrimMat);
  medPostSouth.position.set(-1.82, 1.55, 15.92);
  stationGroup.add(medPostSouth);
  const medHeader = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.2, 0.72, 2.0)), darkTrimMat);
  medHeader.position.set(-1.82, 3.05, 15.05);
  stationGroup.add(medHeader);

  const medDoorStatusMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0xef4444,
      emissive: 0xef4444,
      emissiveIntensity: 0.9,
      roughness: 0.3,
    }),
  );
  const medDoorLed = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.24, 0.1, 0.9)), medDoorStatusMat);
  medDoorLed.position.set(-1.82, 2.75, 15.05);
  stationGroup.add(medDoorLed);

  const medDoorLeaf = new THREE.Group();
  medDoorLeaf.position.set(-1.82, 0, 15.05);
  const medDoorGlass = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.08, 2.48, 1.46)),
    trackMat(
      new THREE.MeshPhysicalMaterial({
        color: 0xbae6fd,
        transparent: true,
        opacity: isSoftwareGl ? 0.4 : 0.32,
        roughness: 0.08,
        metalness: 0.12,
        depthWrite: false,
      }),
    ),
  );
  medDoorGlass.position.y = 1.24;
  medDoorGlass.renderOrder = 6;
  medDoorLeaf.add(medDoorGlass);
  const medDoorFrame = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.12, 2.48, 0.08)), handrailBlueMat);
  medDoorFrame.position.set(0, 1.24, 0.69);
  medDoorLeaf.add(medDoorFrame);
  stationGroup.add(medDoorLeaf);

  const medBayDoorRig: MedBayDoorRig = {
    leaf: medDoorLeaf,
    statusMat: medDoorStatusMat,
    openProgress: 0,
    isOpen: false,
  };

  // Detailed Medical Exam Bed + Live ECG Bedside Monitor + Handheld Dosimeter
  const medBedGroup = new THREE.Group();
  medBedGroup.position.set(-4.35, 0, 15.0);
  const bedFrame = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(1.75, 0.5, 0.88)), darkTrimMat);
  bedFrame.position.y = 0.28;
  medBedGroup.add(bedFrame);
  const mattressMat = trackMat(new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.85, flatShading: true }));
  const mattress = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(1.66, 0.18, 0.82)), mattressMat);
  mattress.position.y = 0.6;
  medBedGroup.add(mattress);
  const pillow = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.32, 0.12, 0.56)),
    trackMat(new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.8 })),
  );
  pillow.position.set(-0.62, 0.72, 0);
  medBedGroup.add(pillow);
  stationGroup.add(medBedGroup);
  colliders.push({ minX: -5.35, maxX: -3.4, minZ: 14.45, maxZ: 15.55 });

  // Bedside ECG Monitor & Dosimeter Dock (x = -4.95, z = 14.32)
  const ecgStand = new THREE.Group();
  ecgStand.position.set(-4.95, 0, 14.32);
  const ecgPost = new THREE.Mesh(trackGeo(new THREE.CylinderGeometry(0.05, 0.08, 1.22, 6)), darkTrimMat);
  ecgPost.position.y = 0.61;
  ecgStand.add(ecgPost);
  const ecgCase = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.62, 0.44, 0.14)), darkTrimMat);
  ecgCase.position.set(0, 1.28, 0);
  ecgStand.add(ecgCase);
  const ecgScreen = new THREE.Mesh(
    trackGeo(new THREE.PlaneGeometry(0.54, 0.36)),
    trackMat(
      new THREE.MeshStandardMaterial({
        color: 0x06111c,
        map: textures.ecgMonitor,
        emissiveMap: textures.ecgMonitor,
        emissive: 0xffffff,
        emissiveIntensity: 0.88,
      }),
    ),
  );
  ecgScreen.position.set(0, 1.28, 0.08);
  ecgStand.add(ecgScreen);
  stationGroup.add(ecgStand);

  // Med Cabinet + ARED Bar (moved slightly inward at x = -2.65, z = 14.65 facing aisle/doorway)
  const medBayGroup = new THREE.Group();
  medBayGroup.position.set(-2.65, 0, 14.65);
  medBayGroup.rotation.y = 0.32;
  const medCab = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.92, 1.45, 0.56)), hullMat);
  medCab.position.y = 0.725;
  medBayGroup.add(medCab);
  const crossMat = trackMat(
    new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0xdc2626, emissiveIntensity: 0.55 }),
  );
  const crossH = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.32, 0.1, 0.04)), crossMat);
  crossH.position.set(-0.2, 1.05, 0.29);
  medBayGroup.add(crossH);
  const crossV = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.1, 0.32, 0.04)), crossMat);
  crossV.position.set(-0.2, 1.05, 0.29);
  medBayGroup.add(crossV);
  const medScreenMesh = new THREE.Mesh(
    trackGeo(new THREE.PlaneGeometry(0.46, 0.36)),
    trackMat(
      new THREE.MeshStandardMaterial({
        color: 0x0f172a,
        map: textures.medScreen,
        emissiveMap: textures.medScreen,
        emissive: 0xffffff,
        emissiveIntensity: 0.8,
      }),
    ),
  );
  medScreenMesh.position.set(0.2, 1.12, 0.29);
  medBayGroup.add(medScreenMesh);
  const aredBar = new THREE.Mesh(trackGeo(new THREE.CylinderGeometry(0.03, 0.03, 0.85, 6)), darkTrimMat);
  aredBar.rotation.z = Math.PI / 2;
  aredBar.position.set(0, 1.62, 0);
  medBayGroup.add(aredBar);
  [-0.36, 0.36].forEach((wx) => {
    const plate = new THREE.Mesh(trackGeo(new THREE.CylinderGeometry(0.14, 0.14, 0.08, 8)), crossMat);
    plate.rotation.z = Math.PI / 2;
    plate.position.set(wx, 1.62, 0);
    medBayGroup.add(plate);
  });
  stationGroup.add(medBayGroup);
  colliders.push({ minX: -3.2, maxX: -2.1, minZ: 14.2, maxZ: 15.15 });
  registerInteractive(
    {
      kind: 'med_bay',
      id: 'med_bay',
      zone: 'habitat',
      label: '🩺 Trạm Y Tế Vũ Trụ & Máy Tập ARED',
    },
    -2.55,
    1.15,
    14.75,
    1.45,
    1.7,
    1.2,
  );

  // 3. High-Pressure Lab Observation Tempered Glass Door (z = 21.0)
  //    Player is blocked by playerOnlyColliders; Sam & Maya pass freely when door slides open!
  const shelterLeft = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(3.85, 3.6, 0.62)), hullMat);
  shelterLeft.position.set(-3.45, 1.8, 21.0);
  stationGroup.add(shelterLeft);
  const shelterRight = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(3.85, 3.6, 0.62)), hullMat);
  shelterRight.position.set(3.45, 1.8, 21.0);
  stationGroup.add(shelterRight);
  const shelterTop = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(3.05, 1.02, 0.62)), darkTrimMat);
  shelterTop.position.set(0, 3.09, 21.0);
  stationGroup.add(shelterTop);

  // Radiation Shelter Unlock / Readiness Status LED Bar above z=20.68 lintel
  const shelterStatusLedMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0xef4444,
      emissive: 0xef4444,
      emissiveIntensity: 0.9,
      roughness: 0.25,
    }),
  );
  const shelterStatusBar = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(1.4, 0.11, 0.06)), shelterStatusLedMat);
  shelterStatusBar.position.set(0, 2.74, 20.66);
  stationGroup.add(shelterStatusBar);

  // Sliding glass door group
  const obsGlassDoorGroup = new THREE.Group();
  obsGlassDoorGroup.position.set(0, 0, 21.0);
  const obsGlassDoor = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(2.96, 2.52, 0.14)),
    trackMat(
      new THREE.MeshPhysicalMaterial({
        color: 0x7dd3fc,
        transparent: true,
        opacity: isSoftwareGl ? 0.34 : 0.28,
        roughness: 0.08,
        metalness: 0.15,
        depthWrite: false,
      }),
    ),
  );
  obsGlassDoor.position.set(0, 1.28, 0);
  obsGlassDoor.renderOrder = 6;
  obsGlassDoorGroup.add(obsGlassDoor);
  const glassFrameV = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.12, 2.52, 0.2)), darkTrimMat);
  glassFrameV.position.set(0, 1.28, 0);
  obsGlassDoorGroup.add(glassFrameV);
  const glassFrameH = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(2.96, 0.12, 0.2)), darkTrimMat);
  glassFrameH.position.set(0, 1.24, 0);
  obsGlassDoorGroup.add(glassFrameH);
  stationGroup.add(obsGlassDoorGroup);

  // Electronic Keypad Lock mounted on right jamb face (z = 20.64)
  const keypadChassis = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.3, 0.44, 0.12)), darkTrimMat);
  keypadChassis.position.set(1.78, 1.32, 20.64);
  stationGroup.add(keypadChassis);
  const keypadDisplay = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.22, 0.12, 0.03)),
    trackMat(
      new THREE.MeshStandardMaterial({
        color: 0xf97316,
        emissive: 0xea580c,
        emissiveIntensity: 0.85,
      }),
    ),
  );
  keypadDisplay.position.set(1.78, 1.44, 20.57);
  stationGroup.add(keypadDisplay);
  const warehouseLockLedMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0xef4444,
      emissive: 0xef4444,
      emissiveIntensity: 1.0,
    }),
  );
  const lockLed = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.18, 0.05, 0.03)),
    warehouseLockLedMat,
  );
  lockLed.position.set(1.78, 1.56, 20.57);
  stationGroup.add(lockLed);
  for (let kr = 0; kr < 2; kr++) {
    for (let kc = 0; kc < 3; kc++) {
      const btn = new THREE.Mesh(
        trackGeo(new THREE.BoxGeometry(0.045, 0.045, 0.03)),
        trackMat(
          new THREE.MeshStandardMaterial({
            color: 0xfb923c,
            emissive: 0xf97316,
            emissiveIntensity: 0.75,
          }),
        ),
      );
      btn.position.set(1.72 + kc * 0.06, 1.28 - kr * 0.07, 20.57);
      stationGroup.add(btn);
    }
  }

  // Supply Storage Warehouse Interior (z = 21.6..27.6) with 3D shelving racks & crates
  const crateBlueMat = trackMat(new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.5, metalness: 0.25, flatShading: true }));
  const crateAmberMat = trackMat(new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.5, metalness: 0.25, flatShading: true }));
  const crateGreenMat = trackMat(new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.5, metalness: 0.25, flatShading: true }));

  const addWarehouseRack = (rx: number, rz: number, rotY: number) => {
    const rack = new THREE.Group();
    rack.position.set(rx, 0, rz);
    rack.rotation.y = rotY;
    [
      [-0.85, -0.38], [0.85, -0.38], [-0.85, 0.38], [0.85, 0.38],
    ].forEach(([px, pz]) => {
      const post = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.08, 2.45, 0.08)), darkTrimMat);
      post.position.set(px, 1.225, pz);
      rack.add(post);
    });
    [0.28, 1.18, 2.08].forEach((sy, sIdx) => {
      const shelf = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(1.82, 0.06, 0.86)), hullMat);
      shelf.position.y = sy;
      rack.add(shelf);
      [-0.5, 0.45].forEach((cx, cIdx) => {
        const cMat = (sIdx + cIdx) % 3 === 0 ? crateAmberMat : (sIdx + cIdx) % 3 === 1 ? crateBlueMat : crateGreenMat;
        const crate = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.68, 0.52, 0.62)), cMat);
        crate.position.set(cx, sy + 0.29, 0);
        rack.add(crate);
      });
    });
    stationGroup.add(rack);
  };

  // Side racks along West & East warehouse walls + Back racks along South wall
  addWarehouseRack(-4.45, 23.2, Math.PI / 2);
  addWarehouseRack(-4.45, 25.6, Math.PI / 2);
  addWarehouseRack(4.45, 23.2, -Math.PI / 2);
  addWarehouseRack(4.45, 25.6, -Math.PI / 2);
  addWarehouseRack(-1.75, 27.05, 0);
  addWarehouseRack(1.75, 27.05, 0);

  // Heavy Radiation Shelter Blast Shutter (tucked on right when normal; slides across z = 20.52 on Shift 3/8)
  const shelterDoorMesh = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(3.0, 2.54, 0.24)),
    trackMat(
      new THREE.MeshStandardMaterial({
        map: textures.shelterDoor,
        roughness: 0.48,
        metalness: 0.6,
        flatShading: true,
      }),
    ),
  );
  shelterDoorMesh.position.set(2.55, 1.27, 20.52);
  stationGroup.add(shelterDoorMesh);

  // 3D Parked Supply Trolley right outside Warehouse entrance (x = 1.65, z = 19.3)
  const supplyTrolleyWorldGroup = new THREE.Group();
  supplyTrolleyWorldGroup.position.set(1.65, 0, 19.3);
  supplyTrolleyWorldGroup.rotation.y = 0.22;
  const trolleyDeck = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.84, 0.08, 1.15)), hullMat);
  trolleyDeck.position.y = 0.22;
  supplyTrolleyWorldGroup.add(trolleyDeck);
  [-0.34, 0.34].forEach((wx) => {
    [-0.42, 0.42].forEach((wz) => {
      const wheel = new THREE.Mesh(trackGeo(new THREE.CylinderGeometry(0.09, 0.09, 0.06, 8)), darkTrimMat);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(wx, 0.09, wz);
      supplyTrolleyWorldGroup.add(wheel);
    });
    const post = new THREE.Mesh(trackGeo(new THREE.CylinderGeometry(0.03, 0.03, 0.85, 6)), darkTrimMat);
    post.position.set(wx, 0.65, -0.52);
    supplyTrolleyWorldGroup.add(post);
  });
  const trolleyPushHandle = new THREE.Mesh(trackGeo(new THREE.CylinderGeometry(0.035, 0.035, 0.74, 8)), crateAmberMat);
  trolleyPushHandle.rotation.z = Math.PI / 2;
  trolleyPushHandle.position.set(0, 1.06, -0.52);
  supplyTrolleyWorldGroup.add(trolleyPushHandle);
  const trolleySampleCrate = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.56, 0.38, 0.62)), crateBlueMat);
  trolleySampleCrate.position.set(0, 0.45, 0.1);
  supplyTrolleyWorldGroup.add(trolleySampleCrate);
  stationGroup.add(supplyTrolleyWorldGroup);

  registerInteractive(
    {
      kind: 'supply_trolley',
      id: 'supply_trolley',
      zone: 'habitat',
      label: '🛒 Xe Đẩy Hàng Kho Vật Tư (Lấy / Đặt)',
    },
    1.65,
    0.8,
    19.3,
    1.35,
    1.6,
    1.45,
  );

  // Side bulkhead colliders allow passage through center doorway (-1.3..1.3) when pushing Supply Trolley
  colliders.push({ minX: -5.6, maxX: -1.3, minZ: 20.5, maxZ: 21.5 });
  colliders.push({ minX: 1.3, maxX: 5.6, minZ: 20.5, maxZ: 21.5 });
  // Warehouse shelving rack colliders leaving wide center aisle (x: -3.2..3.2, z: 21.5..26.2)
  colliders.push({ minX: -5.5, maxX: -3.45, minZ: 21.8, maxZ: 27.5 });
  colliders.push({ minX: 3.45, maxX: 5.5, minZ: 21.8, maxZ: 27.5 });
  colliders.push({ minX: -3.2, maxX: 3.2, minZ: 26.25, maxZ: 27.9 });
  registerInteractive(
    {
      kind: 'shift_trigger',
      id: 'shift2_water',
      zone: 'habitat',
      label: 'Trạm Lọc Nước ECLSS',
      shiftNumbers: [2, 4],
    },
    -3.55,
    1.2,
    17.5,
    1.5,
    2.0,
    2.2,
  );
  registerInteractive(
    {
      kind: 'shift_trigger',
      id: 'shift5_air',
      zone: 'habitat',
      label: 'Bộ Lọc Không Khí CO₂',
      shiftNumbers: [3, 7],
    },
    3.55,
    1.25,
    17.8,
    1.5,
    2.2,
    2.2,
  );

  // =====================================================
  // 3B. INTERACTIVE FUN-FACT PROPS (3 COMPOSITE PROPS)
  // =====================================================
  // Prop 1: Earth Observation Plaque & Binocular Scope at North Window
  const earthPropGroup = new THREE.Group();
  earthPropGroup.position.set(3.6, 0, -4.9);
  const scopeStand = new THREE.Mesh(trackGeo(new THREE.CylinderGeometry(0.08, 0.14, 1.1, 6)), darkTrimMat);
  scopeStand.position.y = 0.55;
  earthPropGroup.add(scopeStand);
  const scopeBody = new THREE.Mesh(trackGeo(new THREE.CylinderGeometry(0.11, 0.08, 0.48, 6)), hullMat);
  scopeBody.position.set(0, 1.18, 0);
  scopeBody.rotation.x = Math.PI / 3;
  earthPropGroup.add(scopeBody);
  const scopeLens = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(0.1, 0.1, 0.05, 6)),
    trackMat(new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0284c7, emissiveIntensity: 0.6 })),
  );
  scopeLens.position.set(0, 1.28, -0.22);
  scopeLens.rotation.x = Math.PI / 3;
  earthPropGroup.add(scopeLens);
  stationGroup.add(earthPropGroup);
  registerInteractive(
    {
      kind: 'prop',
      id: 'prop_earth_window',
      zone: 'control',
      label: '🔭 Cửa Sổ Quan Sát Trái Đất',
    },
    3.6,
    1.15,
    -4.9,
    1.1,
    1.5,
    1.1,
  );

  // Prop 2: Maya's Botanical Clipboard Display in Greenhouse (x = 15.2, z = -4.1)
  const journalGroup = new THREE.Group();
  journalGroup.position.set(15.2, 1.45, -4.15);
  const jBoard = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.85, 0.65, 0.08)), darkTrimMat);
  journalGroup.add(jBoard);
  const jPage = new THREE.Mesh(
    trackGeo(new THREE.PlaneGeometry(0.72, 0.52)),
    trackMat(new THREE.MeshStandardMaterial({ color: 0x6baf83, emissive: 0x1b4332, emissiveIntensity: 0.55 })),
  );
  jPage.position.z = 0.065;
  journalGroup.add(jPage);
  stationGroup.add(journalGroup);
  registerInteractive(
    {
      kind: 'prop',
      id: 'prop_maya_journal',
      zone: 'greenhouse',
      label: '📓 Nhật Ký Trồng Rau Của Maya',
    },
    15.2,
    1.45,
    -4.0,
    1.1,
    1.3,
    0.8,
  );

  // Prop 3: Outdoor Radiation Meter Pedestal near Solar Window (x = -15.5, z = -3.8)
  const radPropGroup = new THREE.Group();
  radPropGroup.position.set(-15.5, 0, -3.8);
  const radPost = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.32, 1.15, 0.32)), darkTrimMat);
  radPost.position.y = 0.575;
  radPropGroup.add(radPost);
  const radHead = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.42, 0.32, 0.24)),
    trackMat(new THREE.MeshStandardMaterial({ color: 0xf0b85d, emissive: 0x78350f, emissiveIntensity: 0.45 })),
  );
  radHead.position.y = 1.33;
  radPropGroup.add(radHead);
  stationGroup.add(radPropGroup);
  registerInteractive(
    {
      kind: 'prop',
      id: 'prop_rad_meter',
      zone: 'solar',
      label: '☢️ Đồng Hồ Đo Bức Xạ Ngoài Trời',
    },
    -15.5,
    1.2,
    -3.8,
    1.1,
    1.6,
    1.1,
  );

  // =====================================================
  // 3C. LOW-POLY 16-BIT CREWMATES (SAM & MAYA) + NAMEPLATES + [!] BADGES
  // =====================================================
  const createNameplateTexture = (label: string, accentHex: string): THREE.CanvasTexture => {
    const c = document.createElement('canvas');
    c.width = 256;
    c.height = 64;
    const ctx = c.getContext('2d');
    if (ctx) {
      ctx.fillStyle = 'rgba(13, 21, 36, 0.92)';
      ctx.fillRect(4, 8, 248, 48);
      ctx.strokeStyle = accentHex;
      ctx.lineWidth = 4;
      ctx.strokeRect(4, 8, 248, 48);
      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 24px "Space Grotesk", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, 128, 33);
    }
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    disposables.push(tex);
    return tex;
  };

  const createQuestBadgeTexture = (symbol: '!' | '✓', bgHex: string, borderHex: string): THREE.CanvasTexture => {
    const c = document.createElement('canvas');
    c.width = 96;
    c.height = 96;
    const ctx = c.getContext('2d');
    if (ctx) {
      ctx.beginPath();
      ctx.arc(48, 48, 38, 0, Math.PI * 2);
      ctx.fillStyle = bgHex;
      ctx.fill();
      ctx.lineWidth = 6;
      ctx.strokeStyle = borderHex;
      ctx.stroke();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 52px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(symbol, 48, 50);
    }
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    disposables.push(tex);
    return tex;
  };

  const questBangTex = createQuestBadgeTexture('!', '#dc2626', '#fecaca');
  const questCheckTex = createQuestBadgeTexture('✓', '#16a34a', '#bbf7d0');

  const buildCrewmateRig = (
    npcId: 'sam' | 'maya' | 'commander',
    suitHex: number,
    trimHex: number,
    accentStr: string,
    defaultPos: THREE.Vector3,
    defaultYaw: number,
    shelterPos: THREE.Vector3,
    shelterYaw: number,
    startNode: number,
    targetId: 'npc_sam' | 'npc_maya' | 'npc_commander',
    npcLabel: string,
    npcZone: OutpostZoneId,
  ): CrewmateRig => {
    const root = new THREE.Group();
    root.position.copy(defaultPos);
    root.rotation.y = defaultYaw;

    const suitMat = trackMat(
      new THREE.MeshStandardMaterial({ color: suitHex, roughness: 0.52, metalness: 0.16, flatShading: true }),
    );
    const bootMat = trackMat(
      new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.65, metalness: 0.35, flatShading: true }),
    );
    const trimMat = trackMat(
      new THREE.MeshStandardMaterial({ color: trimHex, roughness: 0.42, metalness: 0.25, flatShading: true }),
    );
    const gloveMat = trackMat(
      new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.55, metalness: 0.25, flatShading: true }),
    );
    const visorGlassMat = trackMat(
      new THREE.MeshPhysicalMaterial({
        color: 0x93c5fd,
        emissive: 0x0ea5e9,
        emissiveIntensity: 0.16,
        transparent: true,
        opacity: 0.36,
        roughness: 0.1,
        metalness: 0.2,
        depthWrite: false,
      }),
    );
    const faceTex =
      npcId === 'sam'
        ? textures.samFace
        : npcId === 'maya'
          ? textures.mayaFace
          : textures.commanderFace;
    const headSkinMat = trackMat(
      new THREE.MeshStandardMaterial({ map: faceTex, roughness: 0.65, metalness: 0.05 }),
    );
    const headBackMat = trackMat(
      new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.8 }),
    );

    const makeLeg = (lx: number) => {
      const legPivot = new THREE.Group();
      legPivot.position.set(lx, 0.6, 0);
      const thigh = new THREE.Mesh(trackGeo(new THREE.CylinderGeometry(0.085, 0.075, 0.26, 8)), suitMat);
      thigh.position.y = -0.14;
      legPivot.add(thigh);
      const pocket = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.04, 0.12, 0.11)), bootMat);
      pocket.position.set(lx < 0 ? -0.08 : 0.08, -0.16, 0.02);
      legPivot.add(pocket);
      const shin = new THREE.Mesh(trackGeo(new THREE.CylinderGeometry(0.075, 0.068, 0.24, 8)), suitMat);
      shin.position.y = -0.38;
      legPivot.add(shin);
      const boot = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.16, 0.13, 0.24)), bootMat);
      boot.position.set(0, -0.53, 0.03);
      legPivot.add(boot);
      root.add(legPivot);
      return legPivot;
    };
    const legL = makeLeg(-0.115);
    const legR = makeLeg(0.115);

    const bodyGroup = new THREE.Group();
    bodyGroup.position.y = 0.6;
    root.add(bodyGroup);

    // Sculpted Torso + Waist Belt
    const torso = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.42, 0.54, 0.25)), suitMat);
    torso.position.y = 0.29;
    bodyGroup.add(torso);
    const waistBelt = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.44, 0.08, 0.27)), bootMat);
    waistBelt.position.y = 0.05;
    bodyGroup.add(waistBelt);

    // Circular Aurora Outpost Chest Patch + Chest DCM Display Control Module
    const patchMesh = new THREE.Mesh(
      trackGeo(new THREE.CircleGeometry(0.072, 16)),
      trackMat(new THREE.MeshBasicMaterial({ map: textures.stationEmblem, transparent: true })),
    );
    patchMesh.position.set(0.11, 0.42, 0.135);
    bodyGroup.add(patchMesh);

    const dcmBox = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.17, 0.13, 0.06)), darkTrimMat);
    dcmBox.position.set(-0.07, 0.35, 0.145);
    bodyGroup.add(dcmBox);
    const dcmLed = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(0.11, 0.04, 0.02)),
      trackMat(new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x38bdf8, emissiveIntensity: 0.7 })),
    );
    dcmLed.position.set(-0.07, 0.37, 0.176);
    bodyGroup.add(dcmLed);

    // Compact PLSS Life-Support Backpack + Glowing Beacon
    const pack = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.32, 0.46, 0.16)), trimMat);
    pack.position.set(0, 0.32, -0.19);
    bodyGroup.add(pack);
    const packLed = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(0.1, 0.05, 0.03)),
      trackMat(new THREE.MeshStandardMaterial({ color: 0x4ade80, emissive: 0x22c55e, emissiveIntensity: 0.85 })),
    );
    packLed.position.set(0, 0.48, -0.275);
    bodyGroup.add(packLed);

    // Collar Neck Ring + Rounded Astronaut Helmet + Translucent Visor revealing friendly face
    const headGroup = new THREE.Group();
    headGroup.position.y = 0.62;
    bodyGroup.add(headGroup);

    const neckRing = new THREE.Mesh(trackGeo(new THREE.CylinderGeometry(0.15, 0.17, 0.06, 12)), bootMat);
    neckRing.position.y = 0.01;
    headGroup.add(neckRing);

    const innerHead = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.22, 0.22, 0.22)), [
      headBackMat, headBackMat, headBackMat, headBackMat, headSkinMat, headBackMat,
    ]);
    innerHead.position.set(0, 0.17, 0.01);
    headGroup.add(innerHead);

    const helmetShell = new THREE.Mesh(
      trackGeo(new THREE.SphereGeometry(0.22, 12, 10, 0, Math.PI * 2, 0, Math.PI * 0.75)),
      trimMat,
    );
    helmetShell.position.set(0, 0.19, -0.02);
    helmetShell.rotation.x = -0.25;
    headGroup.add(helmetShell);

    const visorDome = new THREE.Mesh(
      trackGeo(new THREE.SphereGeometry(0.205, 12, 10)),
      visorGlassMat,
    );
    visorDome.position.set(0, 0.17, 0.03);
    visorDome.renderOrder = 8;
    headGroup.add(visorDome);

    // Articulated 2-part Arms (Sleeve + Glove)
    const makeArm = (ax: number) => {
      const armPivot = new THREE.Group();
      armPivot.position.set(ax, 0.49, 0);
      const sleeve = new THREE.Mesh(trackGeo(new THREE.CylinderGeometry(0.068, 0.058, 0.34, 8)), suitMat);
      sleeve.position.y = -0.15;
      armPivot.add(sleeve);
      const glove = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.1, 0.12, 0.1)), gloveMat);
      glove.position.y = -0.36;
      armPivot.add(glove);
      bodyGroup.add(armPivot);
      return armPivot;
    };
    const armL = makeArm(-0.27);
    const armR = makeArm(0.27);

    const nameTexVi = createNameplateTexture(getNpcName(npcId, 'vi'), accentStr);
    const nameTexEn = createNameplateTexture(getNpcName(npcId, 'en'), accentStr);
    const nameSprite = new THREE.Sprite(
      trackMat(new THREE.SpriteMaterial({ map: nameTexVi, transparent: true, depthTest: false })),
    );
    nameSprite.position.set(0, 2.1, 0);
    nameSprite.scale.set(1.45, 0.36, 1);
    nameSprite.renderOrder = 20;
    root.add(nameSprite);

    const questSprite = new THREE.Sprite(
      trackMat(new THREE.SpriteMaterial({ map: questBangTex, transparent: true, depthTest: false })),
    );
    questSprite.position.set(0, 2.58, 0);
    questSprite.scale.set(0.45, 0.45, 1);
    questSprite.renderOrder = 21;
    root.add(questSprite);

    stationGroup.add(root);

    registerInteractive(
      {
        kind: npcId === 'commander' ? 'commander_npc' : 'npc',
        id: targetId,
        zone: npcZone,
        label: npcLabel,
        parent: root,
      },
      0,
      1.05,
      0,
      1.1,
      2.0,
      1.1,
    );

    return {
      npcId,
      root,
      bodyGroup,
      headGroup,
      armL,
      armR,
      legL,
      legR,
      nameSprite,
      nameTexVi,
      nameTexEn,
      questSprite,
      questBangTex,
      questCheckTex,
      currentNode: startNode,
      targetNode: startNode,
      waitTimer: npcId === 'sam' ? 1.5 : npcId === 'maya' ? 2.5 : 2.0,
      defaultPos,
      defaultYaw,
      shelterPos,
      shelterYaw,
    };
  };

  // Sam: White-Orange Artemis Crew Suit
  const samRig = buildCrewmateRig(
    'sam',
    0xf8fafc,
    0xf97316,
    '#f97316',
    new THREE.Vector3(-17.8, 0, 2.2),
    Math.PI * 0.72,
    new THREE.Vector3(-1.35, 0, 19.1),
    Math.PI,
    0,
    'npc_sam',
    '👨‍🔧 Kỹ sư Sam',
    'solar',
  );

  // Maya: NASA Blue IVA Flight Suit with Green Botany Trim — starts in Control East (node 8) so reachable in Shifts 1-3 before Greenhouse unlocks!
  const mayaRig = buildCrewmateRig(
    'maya',
    0x1d4ed8,
    0x4ade80,
    '#6BAF83',
    new THREE.Vector3(3.6, 0, 0),
    -Math.PI * 0.5,
    new THREE.Vector3(1.35, 0, 19.1),
    Math.PI,
    8,
    'npc_maya',
    '👩‍🌾 Tiến sĩ Maya',
    'control',
  );

  // Commander AI: NASA Navy-Blue Command IVA Suit with Gold Trim
  const commanderRig = buildCrewmateRig(
    'commander',
    0x0b3d91,
    0xf2c879,
    '#38bdf8',
    new THREE.Vector3(0, 0, -1.2),
    0,
    new THREE.Vector3(0, 0, 18.2),
    Math.PI,
    6,
    'npc_commander',
    '🧑‍🚀 Chỉ Huy Trạm',
    'control',
  );

  // =====================================================
  // 3C-BIS. START SCREEN OUTDOOR SHOWCASE PROPS (VISIBLE ONLY WHEN phase === 'title')
  // =====================================================
  const titleShowcaseGroup = new THREE.Group();
  titleShowcaseGroup.visible = false;
  scene.add(titleShowcaseGroup);

  // Waving Artemis Astronaut on Lunar Regolith outside North Viewport
  const titleAstroRoot = new THREE.Group();
  titleAstroRoot.position.set(-3.2, 0, -11.4);
  titleAstroRoot.rotation.y = Math.PI; // Face North toward Start Screen camera
  const titleSuitMat = trackMat(new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.5, flatShading: true }));
  const titleOrangeMat = trackMat(new THREE.MeshStandardMaterial({ color: 0xf97316, roughness: 0.45, flatShading: true }));
  const titleAstroBody = new THREE.Group();
  titleAstroBody.position.y = 0.62;
  const tTorso = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.46, 0.56, 0.28)), titleSuitMat);
  tTorso.position.y = 0.28;
  titleAstroBody.add(tTorso);
  const tPatch = new THREE.Mesh(
    trackGeo(new THREE.CircleGeometry(0.08, 16)),
    trackMat(new THREE.MeshBasicMaterial({ map: textures.stationEmblem, transparent: true })),
  );
  tPatch.position.set(0.11, 0.4, 0.145);
  titleAstroBody.add(tPatch);
  const tPack = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.36, 0.48, 0.18)), titleOrangeMat);
  tPack.position.set(0, 0.32, -0.2);
  titleAstroBody.add(tPack);
  const tHead = new THREE.Mesh(trackGeo(new THREE.SphereGeometry(0.24, 12, 10)), titleSuitMat);
  tHead.position.y = 0.78;
  titleAstroBody.add(tHead);
  const tVisor = new THREE.Mesh(
    trackGeo(new THREE.SphereGeometry(0.21, 12, 10)),
    trackMat(new THREE.MeshStandardMaterial({ color: 0xf59e0b, emissive: 0xd97706, emissiveIntensity: 0.28, metalness: 0.85, roughness: 0.12 })),
  );
  tVisor.position.set(0, 0.78, 0.06);
  titleAstroBody.add(tVisor);
  const titleArmL = new THREE.Mesh(trackGeo(new THREE.CylinderGeometry(0.07, 0.06, 0.44, 8)), titleSuitMat);
  titleArmL.position.set(-0.31, 0.34, 0);
  titleArmL.rotation.z = 0.2;
  titleAstroBody.add(titleArmL);
  const titleAstronautArmR = new THREE.Group();
  titleAstronautArmR.position.set(0.29, 0.52, 0);
  const titleArmRMesh = new THREE.Mesh(trackGeo(new THREE.CylinderGeometry(0.07, 0.06, 0.44, 8)), titleSuitMat);
  titleArmRMesh.position.y = -0.18;
  titleAstronautArmR.add(titleArmRMesh);
  titleAstroBody.add(titleAstronautArmR);
  titleAstroRoot.add(titleAstroBody);
  [-0.12, 0.12].forEach((lx) => {
    const leg = new THREE.Mesh(trackGeo(new THREE.CylinderGeometry(0.085, 0.075, 0.56, 8)), titleSuitMat);
    leg.position.set(lx, 0.31, 0);
    titleAstroRoot.add(leg);
    const boot = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.17, 0.14, 0.25)), darkTrimMat);
    boot.position.set(lx, 0.07, 0.03);
    titleAstroRoot.add(boot);
  });
  titleShowcaseGroup.add(titleAstroRoot);

  // Exterior 6-Wheeled NASA EVA Rover cruising outside on lunar regolith
  const titleRoverGroup = new THREE.Group();
  titleRoverGroup.position.set(4.5, 0, -14.5);
  const roverChassis = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(1.35, 0.38, 1.85)),
    trackMat(new THREE.MeshStandardMaterial({ color: 0xeab308, roughness: 0.38, metalness: 0.65, flatShading: true })),
  );
  roverChassis.position.y = 0.46;
  titleRoverGroup.add(roverChassis);
  const roverDeck = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(1.15, 0.16, 1.5)), darkTrimMat);
  roverDeck.position.y = 0.72;
  titleRoverGroup.add(roverDeck);
  const roverMast = new THREE.Mesh(trackGeo(new THREE.CylinderGeometry(0.06, 0.07, 0.82, 6)), hullMat);
  roverMast.position.set(0, 1.15, 0.46);
  titleRoverGroup.add(roverMast);
  const roverCamHead = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.42, 0.2, 0.24)), titleSuitMat);
  roverCamHead.position.set(0, 1.56, 0.5);
  titleRoverGroup.add(roverCamHead);
  const roverCamEye = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.28, 0.08, 0.04)),
    trackMat(new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x38bdf8, emissiveIntensity: 0.9 })),
  );
  roverCamEye.position.set(0, 1.56, 0.62);
  titleRoverGroup.add(roverCamEye);
  const roverHeadlightCone = new THREE.Mesh(
    trackGeo(new THREE.ConeGeometry(1.15, 3.4, 12, 1, true)),
    trackMat(
      new THREE.MeshBasicMaterial({
        color: 0xfde047,
        transparent: true,
        opacity: 0.16,
        side: THREE.DoubleSide,
        depthWrite: false,
      }),
    ),
  );
  roverHeadlightCone.rotation.x = -Math.PI / 2;
  roverHeadlightCone.position.set(0, 0.45, 2.65);
  titleRoverGroup.add(roverHeadlightCone);
  const titleRoverWheels: THREE.Mesh[] = [];
  [-0.78, 0.78].forEach((wx) => {
    [-0.68, 0, 0.68].forEach((wz) => {
      const wheel = new THREE.Mesh(trackGeo(new THREE.CylinderGeometry(0.22, 0.22, 0.16, 8)), darkTrimMat);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(wx, 0.22, wz);
      titleRoverGroup.add(wheel);
      titleRoverWheels.push(wheel);
    });
  });
  titleShowcaseGroup.add(titleRoverGroup);

  // =====================================================
  // 3D. EXPLORATION JUICE: 3D WAYPOINT, 8.4m CORRIDOR STRIPS & DUST MOTES
  // =====================================================
  const waypointGroup = new THREE.Group();
  const waypointMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0xf2c879,
      emissive: 0xf2c879,
      emissiveIntensity: 0.95,
      transparent: true,
      opacity: 0.75,
    }),
  );
  const wpDiamond = new THREE.Mesh(trackGeo(new THREE.OctahedronGeometry(0.24, 0)), waypointMat);
  wpDiamond.position.y = 2.45;
  waypointGroup.add(wpDiamond);
  const wpBeam = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(0.05, 0.14, 1.8, 6)),
    trackMat(
      new THREE.MeshBasicMaterial({
        color: 0xf2c879,
        transparent: true,
        opacity: 0.22,
        depthWrite: false,
      }),
    ),
  );
  wpBeam.position.y = 1.45;
  waypointGroup.add(wpBeam);
  scene.add(waypointGroup);

  const makeStripMat = () =>
    trackMat(
      new THREE.MeshStandardMaterial({
        color: 0x334155,
        emissive: 0x70b8d3,
        emissiveIntensity: 0.25,
        roughness: 0.45,
      }),
    );
  const solarStripMat = makeStripMat();
  const ghStripMat = makeStripMat();
  const habStripMat = makeStripMat();

  const addStrip = (x: number, z: number, w: number, d: number, mat: THREE.MeshStandardMaterial) => {
    const strip = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(w, 0.014, d)), mat);
    strip.position.set(x, 0.012, z);
    stationGroup.add(strip);
  };
  addStrip(-9.8, 0, 10.6, 0.16, solarStripMat);
  addStrip(9.8, 0, 10.6, 0.16, ghStripMat);
  addStrip(0, 9.8, 0.16, 10.6, habStripMat);

  const chevronGeo = trackGeo(new THREE.BoxGeometry(0.28, 0.014, 0.07));
  const addChevron = (
    cx: number,
    cz: number,
    dir: 'west' | 'east' | 'south',
    mat: THREE.MeshStandardMaterial,
  ) => {
    const a = new THREE.Mesh(chevronGeo, mat);
    const b = new THREE.Mesh(chevronGeo, mat);
    if (dir === 'west') {
      a.position.set(cx, 0.029, -0.32);
      a.rotation.y = Math.PI / 4;
      b.position.set(cx, 0.029, 0.32);
      b.rotation.y = -Math.PI / 4;
    } else if (dir === 'east') {
      a.position.set(cx, 0.029, -0.32);
      a.rotation.y = -Math.PI / 4;
      b.position.set(cx, 0.029, 0.32);
      b.rotation.y = Math.PI / 4;
    } else {
      a.position.set(-0.32, 0.029, cz);
      a.rotation.y = -Math.PI / 4;
      b.position.set(0.32, 0.029, cz);
      b.rotation.y = Math.PI / 4;
    }
    stationGroup.add(a, b);
  };
  [-4.4, -7.1, -9.8, -12.5, -15.2].forEach((x) => addChevron(x, 0, 'west', solarStripMat));
  [4.4, 7.1, 9.8, 12.5, 15.2].forEach((x) => addChevron(x, 0, 'east', ghStripMat));
  [4.4, 7.1, 9.8, 12.5, 15.2].forEach((z) => addChevron(0, z, 'south', habStripMat));

  // Floating air dust motes across doubled station interior
  const moteCount = 130;
  const motePos = new Float32Array(moteCount * 3);
  for (let i = 0; i < moteCount; i++) {
    motePos[i * 3] = -21 + ((i * 23) % 43);
    motePos[i * 3 + 1] = 0.4 + ((i * 7) % 28) * 0.1;
    motePos[i * 3 + 2] = -4.5 + ((i * 13) % 25);
  }
  const moteGeo = trackGeo(new THREE.BufferGeometry());
  moteGeo.setAttribute('position', new THREE.BufferAttribute(motePos, 3));
  const moteMat = trackMat(
    new THREE.PointsMaterial({
      color: 0xfef3c7,
      size: 0.055,
      transparent: true,
      opacity: 0.45,
    }),
  );
  const dustMotes = new THREE.Points(moteGeo, moteMat);
  dustMotes.frustumCulled = false;
  scene.add(dustMotes);

  // =====================================================
  // 4. SOFT DIFFUSED WARM/COOL LIGHTING RIG (ANTI-GLARE)
  // =====================================================
  const hemiLight = new THREE.HemisphereLight(0x93c5fd, 0x3f4854, 0.58);
  scene.add(hemiLight);

  const sunLight = new THREE.DirectionalLight(0xfff1d0, 1.55);
  sunLight.position.set(-24, 14, -36);
  if (!isSoftwareGl) {
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.set(1024, 1024);
    sunLight.shadow.camera.near = 1;
    sunLight.shadow.camera.far = 90;
    sunLight.shadow.camera.left = -32;
    sunLight.shadow.camera.right = 32;
    sunLight.shadow.camera.top = 32;
    sunLight.shadow.camera.bottom = -32;
    sunLight.shadow.bias = -0.0005;
    sunLight.shadow.normalBias = 0.02;
  }
  scene.add(sunLight);

  const controlLight = new THREE.PointLight(0xffd6a5, 1.25, 18, 1.15);
  controlLight.position.set(0, 3.05, 0.4);
  scene.add(controlLight);

  const solarBayLight = new THREE.PointLight(0x70b8d3, 1.95, 20, 1.25);
  solarBayLight.position.set(-18.3, 3.05, 0);
  scene.add(solarBayLight);

  const greenhouseLight = new THREE.PointLight(0xd8b4fe, 2.25, 20, 1.25);
  greenhouseLight.position.set(18.6, 3.0, 0);
  scene.add(greenhouseLight);

  const habitatLight = new THREE.PointLight(0xf2c879, 2.0, 20, 1.25);
  habitatLight.position.set(0, 3.0, 18.0);
  scene.add(habitatLight);

  const warehouseLight = new THREE.PointLight(0xfef3c7, 1.5, 18, 1.2);
  warehouseLight.position.set(0, 3.05, 24.6);
  scene.add(warehouseLight);

  const corridorWestLight = new THREE.PointLight(0x93c5fd, 0.95, 13, 1.25);
  corridorWestLight.position.set(-9.8, 3.05, 0);
  scene.add(corridorWestLight);

  const corridorEastLight = new THREE.PointLight(0x93c5fd, 0.95, 13, 1.25);
  corridorEastLight.position.set(9.8, 3.05, 0);
  scene.add(corridorEastLight);

  const corridorSouthLight = new THREE.PointLight(0x93c5fd, 0.95, 13, 1.25);
  corridorSouthLight.position.set(0, 3.05, 9.8);
  scene.add(corridorSouthLight);

  const alarmPointLight = new THREE.PointLight(0xd76562, 0, 15, 1.4);
  alarmPointLight.position.set(0, 3.2, -3.1);
  scene.add(alarmPointLight);

  const speWashLight = new THREE.PointLight(0xff7a33, 0, 18, 1.35);
  speWashLight.position.set(0, 2.3, -4.5);
  scene.add(speWashLight);

  return {
    solarDustMeshes,
    batteryBarMeshes,
    batteryBarMats,
    plantGroups,
    plantLeafMats,
    greenhouseLight,
    habitatLight,
    controlLight,
    solarBayLight,
    corridorWestLight,
    corridorEastLight,
    corridorSouthLight,
    warmAccentMat,
    alarmBeaconMat,
    alarmPointLight,
    co2BeaconMat,
    co2BeaconLight,
    waterLevelMesh,
    shelterDoorMesh,
    shelterStatusLedMat,
    warehouseLockLedMat,
    medBayDoorRig,
    obsGlassDoorGroup,
    supplyTrolleyWorldGroup,
    cutsceneLanderGroup,
    cutsceneThrusterMesh,
    titleShowcaseGroup,
    titleAstronautArmR,
    titleAstronautBody: titleAstroBody,
    titleRoverGroup,
    titleRoverWheels,
    speParticles,
    dustMotes,
    sunMesh,
    sunLight,
    coronaInner,
    coronaOuter,
    coronalLoops,
    speSweepGroup,
    speSweepMats,
    radiationStreaks,
    speWashLight,
    airlocks,
    samRig,
    mayaRig,
    commanderRig,
    waypointGroup,
    waypointMat,
    corridorStrips: {
      solar: solarStripMat,
      greenhouse: ghStripMat,
      habitat: habStripMat,
    },
    roverHoloGroup,
    hlsPadGroup,
    hlsBeaconMat,
    botanyLedMats,
    airPipeMat,
    interactiveTargets,
    colliders,
    playerOnlyColliders,
    dispose: () => {
      disposables.forEach((d) => d.dispose());
    },
  };
}

const _healthyColor = new THREE.Color(0x6baf83);
const _stressColor = new THREE.Color(0xd1b84b);
const _dyingColor = new THREE.Color(0x8c6d3b);
const _tmpColor = new THREE.Color();

// Safe interior waypoint graph spanning 8.4m extended corridors + doubled rooms + high-pressure lab chamber
const ROAM_NODES: { x: number; z: number; edges: number[] }[] = [
  { x: -17.8, z: 2.2, edges: [1, 2] },      // 0: Solar Bay SE
  { x: -17.8, z: -2.2, edges: [0, 2] },     // 1: Solar Bay NE
  { x: -14.8, z: 0, edges: [0, 1, 3] },     // 2: Solar Bay Entrance
  { x: -9.8, z: 0, edges: [2, 4] },         // 3: West 8.4m Corridor
  { x: -3.6, z: 0, edges: [3, 5, 7] },      // 4: Control W
  { x: -3.2, z: 2.2, edges: [4, 6] },       // 5: Control SW
  { x: 0, z: 2.5, edges: [5, 8, 13] },      // 6: Control South
  { x: 3.2, z: 2.2, edges: [6, 8] },        // 7: Control SE
  { x: 3.6, z: 0, edges: [7, 9] },          // 8: Control E
  { x: 9.8, z: 0, edges: [8, 10] },         // 9: East 8.4m Corridor
  { x: 15.2, z: 0, edges: [9, 11, 12] },    // 10: Greenhouse Entrance
  { x: 20.6, z: 0, edges: [10] },           // 11: Greenhouse East
  { x: 18.2, z: 0, edges: [10, 11] },       // 12: Greenhouse Center
  { x: 0, z: 9.8, edges: [6, 14] },         // 13: South 8.4m Corridor
  { x: 0, z: 16.5, edges: [13, 15] },       // 14: Habitat Center
  { x: 0, z: 19.4, edges: [14, 16] },       // 15: Supply Warehouse Glass Door Front
  { x: 0, z: 23.6, edges: [15] },           // 16: Inside Supply Storage Warehouse
];

function isNpcPosWalkable(
  x: number,
  z: number,
  colliders: AABBBox[],
): boolean {
  const inCenter = x >= -5.1 && x <= 5.1 && z >= -4.8 && z <= 5.1;
  const inWestCorr = x >= -14.4 && x <= -5.1 && z >= -1.45 && z <= 1.45;
  const inWestRoom = x >= -22.1 && x <= -13.8 && z >= -3.8 && z <= 3.8;
  const inEastCorr = x >= 5.1 && x <= 14.4 && z >= -1.45 && z <= 1.45;
  const inEastRoom = x >= 13.8 && x <= 22.6 && z >= -3.8 && z <= 3.8;
  const inSouthCorr = x >= -1.45 && x <= 1.45 && z >= 5.1 && z <= 14.4;
  const inSouthRoom = x >= -5.0 && x <= 5.0 && z >= 13.8 && z <= 20.3;
  const inWarehouseAisle = x >= -3.1 && x <= 3.1 && z >= 20.0 && z <= 25.9;

  if (
    !(
      inCenter ||
      inWestCorr ||
      inWestRoom ||
      inEastCorr ||
      inEastRoom ||
      inSouthCorr ||
      inSouthRoom ||
      inWarehouseAisle
    )
  ) {
    return false;
  }
  for (let i = 0; i < colliders.length; i++) {
    const c = colliders[i];
    if (x >= c.minX && x <= c.maxX && z >= c.minZ && z <= c.maxZ) {
      return false;
    }
  }
  return true;
}

function dampAngle(current: number, target: number, lambda: number, dt: number): number {
  let diff = ((target - current + Math.PI) % (Math.PI * 2)) - Math.PI;
  if (diff < -Math.PI) diff += Math.PI * 2;
  return current + diff * (1 - Math.exp(-lambda * dt));
}

function animateCrewmate(
  rig: CrewmateRig,
  playerPos: THREE.Vector3,
  elapsed: number,
  dt: number,
  colliders: AABBBox[],
  lang: Language,
  options: {
    inShelter: boolean;
    worried: boolean;
    happy: boolean;
    hasQuest: boolean;
    phaseOffset: number;
    otherNpcPos: THREE.Vector3;
    allowedNodes: Set<number>;
  },
) {
  const desiredNameTex = lang === 'en' ? rig.nameTexEn : rig.nameTexVi;
  if (rig.nameSprite.material.map !== desiredNameTex) {
    rig.nameSprite.material.map = desiredNameTex;
    rig.nameSprite.material.needsUpdate = true;
  }
  const desiredQuestTex = options.hasQuest ? rig.questBangTex : rig.questCheckTex;
  if (rig.questSprite.material.map !== desiredQuestTex) {
    rig.questSprite.material.map = desiredQuestTex;
    rig.questSprite.material.needsUpdate = true;
  }
  const questScale = options.hasQuest
    ? 0.46 + Math.sin(elapsed * 5.2 + options.phaseOffset) * 0.06
    : 0.34;
  rig.questSprite.scale.set(questScale, questScale, 1);
  rig.questSprite.position.y = 2.56 + (options.hasQuest ? Math.sin(elapsed * 4.2) * 0.06 : 0);

  const distToPlayer = Math.hypot(
    playerPos.x - rig.root.position.x,
    playerPos.z - rig.root.position.z,
  );
  const nearPlayer = distToPlayer < 3.6;

  let isWalking = false;

  if (options.inShelter) {
    let destX = rig.shelterPos.x;
    let destZ = rig.shelterPos.z;
    if (rig.root.position.z < 13.8 && Math.abs(rig.root.position.x) > 1.45) {
      destX = 0;
      destZ = 0;
    } else if (rig.root.position.z < 14.4) {
      destX = 0;
      destZ = 14.6;
    }
    const dx = destX - rig.root.position.x;
    const dz = destZ - rig.root.position.z;
    const d = Math.hypot(dx, dz);
    if (d > 0.12) {
      isWalking = true;
      const step = Math.min(d, 2.5 * dt);
      rig.root.position.x += (dx / d) * step;
      rig.root.position.z += (dz / d) * step;
      rig.root.rotation.y = dampAngle(rig.root.rotation.y, Math.atan2(dx, dz), 8, dt);
    } else {
      rig.root.rotation.y = dampAngle(rig.root.rotation.y, rig.shelterYaw, 6, dt);
    }
  } else if (nearPlayer) {
    const faceYaw = Math.atan2(
      playerPos.x - rig.root.position.x,
      playerPos.z - rig.root.position.z,
    );
    rig.root.rotation.y = dampAngle(rig.root.rotation.y, faceYaw, 8, dt);
  } else {
    if (!options.allowedNodes.has(rig.targetNode)) {
      const fallbackEdges = (ROAM_NODES[rig.currentNode]?.edges ?? [6]).filter((e) =>
        options.allowedNodes.has(e),
      );
      rig.targetNode = fallbackEdges.length > 0 ? fallbackEdges[0] : 6;
    }
    const dest = ROAM_NODES[rig.targetNode] || ROAM_NODES[6];
    const dx = dest.x - rig.root.position.x;
    const dz = dest.z - rig.root.position.z;
    const dist = Math.hypot(dx, dz);

    if (dist > 0.18) {
      const speed = 1.1;
      const step = Math.min(dist, speed * dt);
      const nx = rig.root.position.x + (dx / dist) * step;
      const nz = rig.root.position.z + (dz / dist) * step;
      const distOther = Math.hypot(nx - options.otherNpcPos.x, nz - options.otherNpcPos.z);

      if (isNpcPosWalkable(nx, nz, colliders) && distOther > 0.85) {
        rig.root.position.x = nx;
        rig.root.position.z = nz;
        rig.root.rotation.y = dampAngle(rig.root.rotation.y, Math.atan2(dx, dz), 6.5, dt);
        isWalking = true;
      } else {
        const curEdges = (ROAM_NODES[rig.currentNode]?.edges ?? [6]).filter((e) =>
          options.allowedNodes.has(e),
        );
        const pool = curEdges.length > 0 ? curEdges : [6];
        rig.targetNode = pool[Math.floor(Math.random() * pool.length)];
        rig.waitTimer = 1.2;
      }
    } else {
      rig.currentNode = rig.targetNode;
      rig.waitTimer -= dt;
      if (rig.waitTimer <= 0) {
        const edges = (ROAM_NODES[rig.currentNode]?.edges ?? [6]).filter((e) =>
          options.allowedNodes.has(e),
        );
        const pool = edges.length > 0 ? edges : [6];
        rig.targetNode = pool[Math.floor(Math.random() * pool.length)];
        rig.waitTimer = 1.8 + ((Math.sin(elapsed * 3 + options.phaseOffset) + 1) * 1.1);
      }
    }
  }

  const stride = isWalking ? Math.sin(elapsed * 7.5 + options.phaseOffset) : 0;
  const breath = Math.sin(elapsed * 2.4 + options.phaseOffset) * 0.018;
  rig.bodyGroup.position.y = 0.6 + breath + (isWalking ? Math.abs(stride) * 0.03 : 0);
  rig.legL.rotation.x = THREE.MathUtils.damp(rig.legL.rotation.x, stride * 0.45, 10, dt);
  rig.legR.rotation.x = THREE.MathUtils.damp(rig.legR.rotation.x, -stride * 0.45, 10, dt);

  let targetArmLZ = 0.08;
  let targetArmLX = isWalking ? -stride * 0.38 : 0;
  let targetArmRZ = -0.08;
  let targetArmRX = isWalking ? stride * 0.38 : 0;
  let targetHeadX = 0;

  if (options.worried && !nearPlayer) {
    targetArmLZ = 2.15;
    targetArmRZ = -2.15;
    targetArmLX = -0.35;
    targetArmRX = -0.35;
    targetHeadX = 0.16 + Math.sin(elapsed * 5 + options.phaseOffset) * 0.05;
  } else if (nearPlayer) {
    targetArmRZ = -2.4 + Math.sin(elapsed * 7) * 0.35;
    targetArmRX = -0.2;
    targetHeadX = -0.06;
  } else if (options.happy && !isWalking) {
    const clap = Math.abs(Math.sin(elapsed * 6 + options.phaseOffset)) * 0.4;
    targetArmLX = -0.95;
    targetArmRX = -0.95;
    targetArmLZ = -0.35 - clap;
    targetArmRZ = 0.35 + clap;
  }

  rig.armL.rotation.z = THREE.MathUtils.damp(rig.armL.rotation.z, targetArmLZ, 7, dt);
  rig.armL.rotation.x = THREE.MathUtils.damp(rig.armL.rotation.x, targetArmLX, 7, dt);
  rig.armR.rotation.z = THREE.MathUtils.damp(rig.armR.rotation.z, targetArmRZ, 7, dt);
  rig.armR.rotation.x = THREE.MathUtils.damp(rig.armR.rotation.x, targetArmRX, 7, dt);
  rig.headGroup.rotation.x = THREE.MathUtils.damp(rig.headGroup.rotation.x, targetHeadX, 6, dt);
}

export function syncOutpostWithGameState(
  refs: OutpostDynamicRefs,
  state: GameState,
  elapsed: number,
  dt: number,
  scene: THREE.Scene,
  playerPos: THREE.Vector3,
  lang: Language = 'vi',
  isPaused = false,
  onAirlockProximityChange?: (nextStates: AirlockState, changedId: AirlockId, opened: boolean) => void,
) {
  refs.solarDustMeshes.forEach((m) => {
    m.visible = state.solar_panels_dusty;
  });

  // Update NPC language sprites live even when paused
  const desireSamName = lang === 'en' ? refs.samRig.nameTexEn : refs.samRig.nameTexVi;
  if (refs.samRig.nameSprite.material.map !== desireSamName) {
    refs.samRig.nameSprite.material.map = desireSamName;
    refs.samRig.nameSprite.material.needsUpdate = true;
  }
  const desireMayaName = lang === 'en' ? refs.mayaRig.nameTexEn : refs.mayaRig.nameTexVi;
  if (refs.mayaRig.nameSprite.material.map !== desireMayaName) {
    refs.mayaRig.nameSprite.material.map = desireMayaName;
    refs.mayaRig.nameSprite.material.needsUpdate = true;
  }
  const desireCmdName = lang === 'en' ? refs.commanderRig.nameTexEn : refs.commanderRig.nameTexVi;
  if (refs.commanderRig.nameSprite.material.map !== desireCmdName) {
    refs.commanderRig.nameSprite.material.map = desireCmdName;
    refs.commanderRig.nameSprite.material.needsUpdate = true;
  }

  if (isPaused) {
    return;
  }

  // 1. Proximity Automatic Sliding Doors (< 2.2m sensor threshold) gated by Progressive Room Unlocking
  const unlocked = getUnlockedRoomFlags(state);
  const AUTO_DOOR_RADIUS = 2.15;
  const ALL_AIRLOCK_IDS: AirlockId[] = [
    'solarControl',
    'solarBay',
    'greenhouseControl',
    'greenhouseBay',
    'habitatControl',
    'habitatBay',
  ];
  const isAirlockUnlocked = (aid: AirlockId): boolean => {
    if (aid === 'solarControl' || aid === 'solarBay') return unlocked.solar;
    if (aid === 'greenhouseControl' || aid === 'greenhouseBay') return unlocked.greenhouse;
    if (aid === 'habitatControl' || aid === 'habitatBay') return unlocked.eclss;
    return true;
  };

  ALL_AIRLOCK_IDS.forEach((aid) => {
    const rig = refs.airlocks[aid];
    const roomOpenable = isAirlockUnlocked(aid);
    const dPlayer = Math.hypot(playerPos.x - rig.x, playerPos.z - rig.z);
    const dSam = Math.hypot(refs.samRig.root.position.x - rig.x, refs.samRig.root.position.z - rig.z);
    const dMaya = Math.hypot(refs.mayaRig.root.position.x - rig.x, refs.mayaRig.root.position.z - rig.z);
    const dCmd = Math.hypot(refs.commanderRig.root.position.x - rig.x, refs.commanderRig.root.position.z - rig.z);
    const shouldOpen =
      roomOpenable &&
      state.phase === 'playing' &&
      (dPlayer <= AUTO_DOOR_RADIUS ||
        dSam <= AUTO_DOOR_RADIUS ||
        dMaya <= AUTO_DOOR_RADIUS ||
        dCmd <= AUTO_DOOR_RADIUS);

    if (shouldOpen !== rig.isOpen) {
      rig.isOpen = shouldOpen;
      if (onAirlockProximityChange) {
        onAirlockProximityChange(
          {
            solarControl: refs.airlocks.solarControl.isOpen,
            solarBay: refs.airlocks.solarBay.isOpen,
            greenhouseControl: refs.airlocks.greenhouseControl.isOpen,
            greenhouseBay: refs.airlocks.greenhouseBay.isOpen,
            habitatControl: refs.airlocks.habitatControl.isOpen,
            habitatBay: refs.airlocks.habitatBay.isOpen,
          },
          aid,
          shouldOpen,
        );
      }
    }

    if (!roomOpenable) {
      // Strictly LOCKED room door shows bright RED status LED
      rig.statusMat.color.setHex(0xef4444);
      rig.statusMat.emissive.setHex(0xdc2626);
      rig.buttonMat.color.setHex(0xef4444);
      rig.buttonMat.emissive.setHex(0x991b1b);
    } else {
      rig.statusMat.color.setHex(rig.isOpen ? 0x22c55e : state.spe_active ? 0xef4444 : 0x4ade80);
      rig.statusMat.emissive.setHex(rig.isOpen ? 0x22c55e : state.spe_active ? 0xdc2626 : 0x16a34a);
      rig.buttonMat.color.setHex(rig.isOpen ? 0x4ade80 : 0x38bdf8);
      rig.buttonMat.emissive.setHex(rig.isOpen ? 0x22c55e : 0x0284c7);
    }

    const targetOpen = rig.isOpen ? 1 : 0;
    rig.openProgress = THREE.MathUtils.damp(rig.openProgress, targetOpen, 15, dt);
    const leafOffset = 0.74 + rig.openProgress * 0.96;
    rig.leafL.position.x = -leafOffset;
    rig.leafR.position.x = leafOffset;
  });

  // Med Bay Enclosure Glass Door & Status LED (unlocks after Shift 3)
  const medDist = Math.hypot(playerPos.x - -1.82, playerPos.z - 15.05);
  const medShouldOpen = unlocked.med_bay && state.phase === 'playing' && medDist <= 2.35;
  refs.medBayDoorRig.isOpen = medShouldOpen;
  refs.medBayDoorRig.openProgress = THREE.MathUtils.damp(
    refs.medBayDoorRig.openProgress,
    medShouldOpen ? 1 : 0,
    12,
    dt,
  );
  refs.medBayDoorRig.leaf.position.z = 15.05 - refs.medBayDoorRig.openProgress * 1.45;
  if (!unlocked.med_bay) {
    refs.medBayDoorRig.statusMat.color.setHex(0xef4444);
    refs.medBayDoorRig.statusMat.emissive.setHex(0xdc2626);
  } else {
    refs.medBayDoorRig.statusMat.color.setHex(0x22c55e);
    refs.medBayDoorRig.statusMat.emissive.setHex(0x16a34a);
  }

  // Supply Trolley, Cutscene Lander & Title Screen Outdoor Showcase
  refs.supplyTrolleyWorldGroup.visible = !state.trolley_attached;
  refs.cutsceneLanderGroup.visible = state.phase === 'cutscene';
  refs.titleShowcaseGroup.visible = state.phase === 'title';

  if (state.phase === 'title') {
    refs.titleAstronautArmR.rotation.z = -2.35 + Math.sin(elapsed * 5.2) * 0.35;
    refs.titleAstronautBody.position.y = 0.62 + Math.sin(elapsed * 2.4) * 0.02;
    // Animate cruising exterior Title EVA Rover in smooth oval on North Moon surface
    const rAngle = elapsed * 0.42;
    const rx = Math.sin(rAngle) * 7.8;
    const rz = -15.6 + Math.cos(rAngle) * 2.5;
    const dx = Math.cos(rAngle) * 7.8;
    const dz = -Math.sin(rAngle) * 2.5;
    refs.titleRoverGroup.position.set(rx, 0, rz);
    refs.titleRoverGroup.rotation.y = Math.atan2(dx, dz);
    refs.titleRoverWheels.forEach((w) => {
      w.rotation.x += dt * 5.5;
    });
  }

  // Warehouse Keypad LED & Radiation Shelter Status LED
  if (!unlocked.warehouse || !state.trolley_attached) {
    refs.warehouseLockLedMat.color.setHex(0xef4444);
    refs.warehouseLockLedMat.emissive.setHex(0xdc2626);
  } else {
    refs.warehouseLockLedMat.color.setHex(0x22c55e);
    refs.warehouseLockLedMat.emissive.setHex(0x16a34a);
  }
  if (!unlocked.shelter) {
    refs.shelterStatusLedMat.color.setHex(0xef4444);
    refs.shelterStatusLedMat.emissive.setHex(0xdc2626);
  } else if (state.shelter_state === 'sheltered') {
    refs.shelterStatusLedMat.color.setHex(0x22c55e);
    refs.shelterStatusLedMat.emissive.setHex(0x16a34a);
  } else {
    refs.shelterStatusLedMat.color.setHex(0xf59e0b);
    refs.shelterStatusLedMat.emissive.setHex(0xd97706);
  }

  // Supply Warehouse Glass Door slides open ONLY when warehouse unlocked & trolley pushed OR NPC passes
  const npcInLabDoorway =
    unlocked.warehouse &&
    ((refs.samRig.root.position.z > 19.0 && Math.abs(refs.samRig.root.position.x) < 1.8) ||
      (refs.mayaRig.root.position.z > 19.0 && Math.abs(refs.mayaRig.root.position.x) < 1.8));
  const playerPushingTrolleyAtDoor =
    unlocked.warehouse && state.trolley_attached && Math.hypot(playerPos.x, playerPos.z - 20.6) < 2.8;
  const targetGlassSlideX =
    (npcInLabDoorway || playerPushingTrolleyAtDoor) && state.shelter_state !== 'sheltered'
      ? -2.35
      : 0;
  refs.obsGlassDoorGroup.position.x = THREE.MathUtils.damp(
    refs.obsGlassDoorGroup.position.x,
    targetGlassSlideX,
    8,
    dt,
  );

  // 2. Battery Core Bars (0..20 capacity -> 5 bars)
  const ratio = Math.max(0, Math.min(1, state.battery / state.battery_capacity));
  const litBars = Math.ceil(ratio * 5);
  refs.batteryBarMats.forEach((mat, idx) => {
    const active = idx < litBars && state.battery > 0;
    if (active) {
      mat.color.setHex(state.battery <= 2 ? 0xf0b85d : 0x70b8d3);
      mat.emissive.setHex(state.battery <= 2 ? 0xf0b85d : 0x70b8d3);
      mat.emissiveIntensity = 0.72;
    } else {
      mat.color.setHex(0x1e293b);
      mat.emissive.setHex(0x0f172a);
      mat.emissiveIntensity = 0.1;
    }
  });

  // 3. Greenhouse Plants (droop angle & leaf color)
  const healthRatio = Math.max(0, Math.min(1, state.plant_health / 100));
  if (healthRatio > 0.65) {
    _tmpColor.copy(_stressColor).lerp(_healthyColor, (healthRatio - 0.65) / 0.35);
  } else {
    _tmpColor.copy(_dyingColor).lerp(_stressColor, healthRatio / 0.65);
  }
  const targetDroop =
    (1 - healthRatio) * 0.65 +
    (state.greenhouse_lights_dimmed ? 0.18 : 0) +
    (state.greenhouse_water_paused ? 0.15 : 0);

  refs.plantLeafMats.forEach((m) => m.color.copy(_tmpColor));
  refs.plantGroups.forEach((pg, idx) => {
    pg.rotation.z = THREE.MathUtils.damp(pg.rotation.z, targetDroop * (idx % 2 === 0 ? 1 : -1), 4, dt);
    pg.rotation.x = THREE.MathUtils.damp(pg.rotation.x, targetDroop * 0.6, 4, dt);
  });

  const targetGhIntensity = state.greenhouse_lights_dimmed ? 0.7 : 2.25;

  // 3B. Sync 3D Botany LED Spectrum strips, Rover Hologram, Starship HLS Beacon & Habitat Air Pipes
  refs.roverHoloGroup.rotation.y = elapsed * 1.1;
  refs.roverHoloGroup.position.y = 1.08 + Math.sin(elapsed * 2.5) * 0.03;

  const hlsLandingReady = state.shift === 9 || state.outcome === 'stable';
  refs.hlsBeaconMat.color.setHex(hlsLandingReady ? 0x4ade80 : 0x38bdf8);
  refs.hlsBeaconMat.emissive.setHex(hlsLandingReady ? 0x22c55e : 0x0284c7);
  refs.hlsBeaconMat.emissiveIntensity = hlsLandingReady
    ? 0.9 + Math.sin(elapsed * 5) * 0.4
    : 0.65;

  (['lettuce', 'tomato', 'wheat'] as const).forEach((cid) => {
    const mode = state.crops[cid]?.ledMode ?? 'red_blue';
    const mat = refs.botanyLedMats[cid];
    if (mode === 'off') {
      mat.color.setHex(0x1e293b);
      mat.emissive.setHex(0x0f172a);
      mat.emissiveIntensity = 0.05;
    } else if (mode === 'full_bright') {
      mat.color.setHex(0xfef9c3);
      mat.emissive.setHex(0xfde047);
      mat.emissiveIntensity = state.greenhouse_lights_dimmed ? 0.4 : 0.85;
    } else {
      mat.color.setHex(0xe9d5ff);
      mat.emissive.setHex(0xc084fc);
      mat.emissiveIntensity = state.greenhouse_lights_dimmed ? 0.35 : 0.8;
    }
  });

  const airDegraded = state.co2_haze_active || state.air_quality_score < 70;
  refs.airPipeMat.color.setHex(airDegraded ? 0xf59e0b : 0x38bdf8);
  refs.airPipeMat.emissive.setHex(airDegraded ? 0xd97706 : 0x0284c7);
  refs.airPipeMat.emissiveIntensity = airDegraded ? 0.65 + Math.sin(elapsed * 4) * 0.25 : 0.5;

  // 4. Water Tank Column Level (max 10)
  const wScale = Math.max(0.08, Math.min(1, state.water / 10));
  refs.waterLevelMesh.scale.y = THREE.MathUtils.damp(refs.waterLevelMesh.scale.y, wScale, 5, dt);
  refs.waterLevelMesh.position.y = 0.3 + 0.72 * refs.waterLevelMesh.scale.y;

  // 5. Radiation Shelter Blast Shutter (tucked on right normally; slides shut across z=20.52 when sheltered)
  const doorTargetX = state.shelter_state === 'sheltered' ? 0 : 2.55;
  refs.shelterDoorMesh.position.x = THREE.MathUtils.damp(refs.shelterDoorMesh.position.x, doorTargetX, 5, dt);

  // 6. Low-Horizon Lunar South Pole Sun (~3.3°), Corona, Loops & CME Waves (Shifts 1 -> 9)
  const isShift3Flare = state.spe_active;
  const isShift4Storm = (state.shift === 8 || state.shift === 7) && !state.spe_active;
  const isShift5Fade = state.shift === 5 || state.dust_storm_active;
  const showParticles = isShift3Flare || isShift4Storm;
  const showSweepWave = isShift3Flare || isShift4Storm || isShift5Fade;

  const activeStreakCount = isShift3Flare
    ? 44
    : isShift4Storm
      ? 32
      : isShift5Fade
        ? 18
        : state.shift <= 2
          ? 8
          : 10;
  const streakSpeedMult = isShift3Flare
    ? 2.25
    : isShift4Storm
      ? 1.55
      : isShift5Fade
        ? 0.95
        : 0.65;
  const streakHex = isShift3Flare
    ? 0xff5a36
    : isShift4Storm
      ? 0xff9442
      : isShift5Fade
        ? 0xffbe66
        : 0xffe49c;
  const streakOpacity = isShift3Flare
    ? 0.76
    : isShift4Storm
      ? 0.54
      : isShift5Fade
        ? 0.34
        : 0.24;

  refs.radiationStreaks.forEach((item, idx) => {
    const active = idx < activeStreakCount;
    item.mesh.visible = active;
    if (!active) return;
    item.progress = (item.progress + dt * item.speed * streakSpeedMult) % 1;
    item.mesh.position.copy(item.startPos).addScaledVector(item.dir, item.progress * item.travelLen);
    item.mat.color.setHex(streakHex);
    const fade = Math.sin(item.progress * Math.PI);
    item.mat.opacity = streakOpacity * (0.4 + fade * 0.6);
  });

  refs.speParticles.visible = showParticles;
  if (showParticles) {
    const pos = refs.speParticles.geometry.attributes.position as THREE.BufferAttribute;
    const speedMult = isShift3Flare ? 1.15 : 0.75;
    for (let i = 0; i < pos.count; i++) {
      let y = pos.getY(i) - dt * 7.0 * speedMult;
      let z = pos.getZ(i) + dt * 5.2 * speedMult;
      if (y < 0.2) y = 18;
      if (z > -6.0) z = -52;
      pos.setY(i, y);
      pos.setZ(i, z);
    }
    pos.needsUpdate = true;
  }

  refs.speSweepGroup.visible = showSweepWave;
  const sunMat = refs.sunMesh.material as THREE.MeshBasicMaterial;
  const innerMat = refs.coronaInner.material as THREE.SpriteMaterial;
  const outerMat = refs.coronaOuter.material as THREE.SpriteMaterial;

  if (isShift3Flare) {
    const pulseFlare = 1 + Math.sin(elapsed * 6.5) * 0.14;
    sunMat.color.setHex(0xff8e47);
    innerMat.color.setHex(0xffb74d);
    innerMat.opacity = 0.95;
    outerMat.color.setHex(0xff5232);
    outerMat.opacity = 0.85;
    refs.coronaInner.scale.set(19 * pulseFlare, 19 * pulseFlare, 1);
    refs.coronaOuter.scale.set(34 * pulseFlare, 34 * pulseFlare, 1);
    refs.coronalLoops.forEach((loop, idx) => {
      loop.rotation.z += dt * (0.25 + idx * 0.12);
      const lMat = loop.material as THREE.MeshBasicMaterial;
      lMat.color.setHex(0xff6b35);
      lMat.opacity = 0.62 + Math.sin(elapsed * 5 + idx) * 0.18;
    });
    refs.speSweepGroup.children.forEach((child, idx) => {
      const progress = ((elapsed * 0.62 + idx * 0.33) % 1);
      child.position.z = progress * 56;
      child.position.y = -progress * 2.0;
      const s = 0.85 + progress * 1.45;
      child.scale.set(s, s, 1);
      refs.speSweepMats[idx].opacity = (1 - progress) * 0.55;
    });
    refs.speWashLight.color.setHex(0xff6b35);
    refs.speWashLight.intensity = 0.9 + Math.sin(elapsed * 6) * 0.25;
    refs.sunLight.color.setHex(0xffb47a);
  } else if (isShift4Storm) {
    const pulse4 = 1 + Math.sin(elapsed * 4.2) * 0.09;
    sunMat.color.setHex(0xffb866);
    innerMat.color.setHex(0xffcc70);
    innerMat.opacity = 0.82;
    outerMat.color.setHex(0xff773d);
    outerMat.opacity = 0.65;
    refs.coronaInner.scale.set(17 * pulse4, 17 * pulse4, 1);
    refs.coronaOuter.scale.set(29 * pulse4, 29 * pulse4, 1);
    refs.coronalLoops.forEach((loop, idx) => {
      loop.rotation.z += dt * (0.16 + idx * 0.08);
      const lMat = loop.material as THREE.MeshBasicMaterial;
      lMat.color.setHex(0xff9e44);
      lMat.opacity = 0.48;
    });
    refs.speSweepGroup.children.forEach((child, idx) => {
      const progress = ((elapsed * 0.42 + idx * 0.33) % 1);
      child.position.z = progress * 56;
      child.position.y = -progress * 2.0;
      const s = 0.85 + progress * 1.35;
      child.scale.set(s, s, 1);
      refs.speSweepMats[idx].opacity = (1 - progress) * 0.38;
    });
    refs.speWashLight.color.setHex(0xff9248);
    refs.speWashLight.intensity = 0.65;
    refs.sunLight.color.setHex(0xffd2a1);
  } else if (isShift5Fade) {
    sunMat.color.setHex(0xffe1a8);
    innerMat.color.setHex(0xffe094);
    innerMat.opacity = 0.72;
    outerMat.color.setHex(0xffa64d);
    outerMat.opacity = 0.38;
    refs.coronaInner.scale.set(15, 15, 1);
    refs.coronaOuter.scale.set(25, 25, 1);
    refs.coronalLoops.forEach((loop) => {
      (loop.material as THREE.MeshBasicMaterial).opacity = 0.25;
    });
    refs.speSweepGroup.children.forEach((child, idx) => {
      const progress = ((elapsed * 0.25 + idx * 0.33) % 1);
      child.position.z = progress * 56;
      child.position.y = -progress * 2.0;
      const s = 0.9 + progress * 1.2;
      child.scale.set(s, s, 1);
      refs.speSweepMats[idx].opacity = (1 - progress) * 0.16;
    });
    refs.speWashLight.intensity = 0.22;
    refs.sunLight.color.setHex(0xfff1d0);
  } else {
    const gentle = 1 + Math.sin(elapsed * 1.5) * 0.04;
    sunMat.color.setHex(0xfff3c4);
    innerMat.color.setHex(0xffe9a8);
    innerMat.opacity = 0.72;
    outerMat.color.setHex(0xffca6b);
    outerMat.opacity = 0.36;
    refs.coronaInner.scale.set(14 * gentle, 14 * gentle, 1);
    refs.coronaOuter.scale.set(23 * gentle, 23 * gentle, 1);
    refs.coronalLoops.forEach((loop, idx) => {
      loop.rotation.z += dt * 0.05 * (idx + 1);
      const lMat = loop.material as THREE.MeshBasicMaterial;
      lMat.color.setHex(0xffd27d);
      lMat.opacity = 0.22;
    });
    refs.speWashLight.intensity = 0;
    refs.sunLight.color.setHex(0xfff1d0);
  }

  // Station-wide Red Alert Emergency Lighting (Shift 3 SPE) + Overhead Beacon
  const redAlertStrobe = 0.5 + 0.5 * Math.sin(elapsed * 7.5);
  if (state.spe_active) {
    const alertHex = redAlertStrobe > 0.5 ? 0xff3b30 : 0xdc2626;
    const alertIntensity = 0.95 + redAlertStrobe * 1.45;
    [
      refs.controlLight,
      refs.solarBayLight,
      refs.greenhouseLight,
      refs.habitatLight,
      refs.corridorWestLight,
      refs.corridorEastLight,
      refs.corridorSouthLight,
    ].forEach((lt) => {
      lt.color.setHex(alertHex);
      lt.intensity = alertIntensity;
    });
    refs.warmAccentMat.color.setHex(0xff5247);
    refs.warmAccentMat.emissive.setHex(0xff2d20);
    refs.warmAccentMat.emissiveIntensity = 0.45 + redAlertStrobe * 1.05;

    const flash = Math.sin(elapsed * 8) > 0 ? 1.45 : 0.25;
    refs.alarmBeaconMat.color.setHex(0xef4444);
    refs.alarmBeaconMat.emissive.setHex(0xef4444);
    refs.alarmBeaconMat.emissiveIntensity = flash;
    refs.alarmPointLight.intensity = flash * 0.95;
  } else {
    refs.controlLight.color.setHex(0xffd6a5);
    refs.controlLight.intensity = THREE.MathUtils.damp(refs.controlLight.intensity, 1.25, 5, dt);
    refs.solarBayLight.color.setHex(0x70b8d3);
    refs.solarBayLight.intensity = THREE.MathUtils.damp(refs.solarBayLight.intensity, 1.95, 5, dt);
    refs.greenhouseLight.color.setHex(0xd8b4fe);
    refs.greenhouseLight.intensity = THREE.MathUtils.damp(refs.greenhouseLight.intensity, targetGhIntensity, 5, dt);
    refs.habitatLight.color.setHex(0xf2c879);
    refs.habitatLight.intensity = THREE.MathUtils.damp(
      refs.habitatLight.intensity,
      state.co2_haze_active ? 1.2 : 2.0,
      4,
      dt,
    );
    [refs.corridorWestLight, refs.corridorEastLight, refs.corridorSouthLight].forEach((lt) => {
      lt.color.setHex(0x93c5fd);
      lt.intensity = THREE.MathUtils.damp(lt.intensity, 0.95, 5, dt);
    });
    refs.warmAccentMat.color.setHex(0xeab676);
    refs.warmAccentMat.emissive.setHex(0xeab676);
    refs.warmAccentMat.emissiveIntensity = 0.22;

    if (state.thermal_drop_active || state.shift === 3 || state.shift === 6) {
      // Polar Night -170C cold ambient tint
      refs.controlLight.color.setHex(0x93c5fd);
      refs.solarBayLight.color.setHex(0x60a5fa);
      refs.habitatLight.color.setHex(0xfde68a);
    }

    if (state.co2_haze_active || state.air_quality_score < 60 || state.water < 3 || state.dust_storm_active) {
      refs.alarmBeaconMat.color.setHex(0xf0b85d);
      refs.alarmBeaconMat.emissive.setHex(0xf0b85d);
      refs.alarmBeaconMat.emissiveIntensity = 0.65 + Math.sin(elapsed * 4) * 0.25;
      refs.alarmPointLight.intensity = 0.3;
    } else {
      refs.alarmBeaconMat.color.setHex(0x6baf83);
      refs.alarmBeaconMat.emissive.setHex(0x6baf83);
      refs.alarmBeaconMat.emissiveIntensity = 0.45;
      refs.alarmPointLight.intensity = 0;
    }
  }

  // 7. CO2 Haze, Dust Storm Fog & Dedicated CO2 Scrubber Beacon
  const co2NeedsAttention =
    (!state.handover_to_shift && state.shift === 7) || state.co2_haze_active || state.air_quality_score < 60;
  if (co2NeedsAttention) {
    const co2Flash = Math.sin(elapsed * 7) > 0 ? 1.45 : 0.3;
    const co2Hex = state.co2_haze_active || state.air_quality_score < 60 ? 0xd76562 : 0xf0b85d;
    refs.co2BeaconMat.color.setHex(co2Hex);
    refs.co2BeaconMat.emissive.setHex(co2Hex);
    refs.co2BeaconMat.emissiveIntensity = co2Flash;
    refs.co2BeaconLight.color.setHex(co2Hex);
    refs.co2BeaconLight.intensity = co2Flash * 0.85;
  } else {
    refs.co2BeaconMat.color.setHex(0x6baf83);
    refs.co2BeaconMat.emissive.setHex(0x6baf83);
    refs.co2BeaconMat.emissiveIntensity = 0.5;
    refs.co2BeaconLight.intensity = 0;
  }

  if (scene.fog instanceof THREE.FogExp2) {
    if (state.co2_haze_active) {
      scene.fog.color.setHex(0x28231b);
      scene.fog.density = THREE.MathUtils.damp(scene.fog.density, 0.032, 3, dt);
    } else if (state.dust_storm_active || state.shift === 5) {
      scene.fog.color.setHex(0x2b2824);
      scene.fog.density = THREE.MathUtils.damp(scene.fog.density, 0.022, 3, dt);
    } else if (state.spe_active) {
      scene.fog.color.setHex(0x261015);
      scene.fog.density = THREE.MathUtils.damp(scene.fog.density, 0.015, 3, dt);
    } else if (state.thermal_drop_active || state.shift === 3 || state.shift === 6) {
      scene.fog.color.setHex(0x0c162b);
      scene.fog.density = THREE.MathUtils.damp(scene.fog.density, 0.013, 3, dt);
    } else {
      scene.fog.color.setHex(0x101828);
      scene.fog.density = THREE.MathUtils.damp(scene.fog.density, 0.011, 3, dt);
    }
  }

  // 8. Animate Crewmates (Sam, Maya, & Post-Tutorial Idle/Wander Commander NPC)
  const isHandover = state.handover_to_shift !== null;
  const crewSheltered =
    state.shelter_state === 'sheltered' && state.decisions.some((d) => d.shift === 8);
  const samWorried = state.spe_active || state.co2_haze_active || state.water < 3 || state.battery <= 1;
  const mayaWorried = state.spe_active || state.co2_haze_active || state.plant_health < 55;
  const mayaHappy = !mayaWorried && state.plant_health >= 80;

  const samHasQuest =
    !isHandover && !state.shift_mission_accepted && isNpcAssignedToShift('sam', state.shift);
  const mayaHasQuest =
    !isHandover && !state.shift_mission_accepted && isNpcAssignedToShift('maya', state.shift);

  const allowedNodes = new Set<number>([0, 1, 2, 3, 4, 5, 6, 7, 8]);
  if (unlocked.eclss) {
    allowedNodes.add(13);
    allowedNodes.add(14);
    allowedNodes.add(15);
  }
  if (unlocked.greenhouse) {
    allowedNodes.add(9);
    allowedNodes.add(10);
    allowedNodes.add(11);
    allowedNodes.add(12);
  }
  if (unlocked.warehouse) {
    allowedNodes.add(16);
  }

  animateCrewmate(refs.samRig, playerPos, elapsed, dt, refs.colliders, lang, {
    inShelter: crewSheltered,
    worried: samWorried,
    happy: !samWorried && state.battery >= 4 && state.air_quality_score >= 85,
    hasQuest: samHasQuest,
    phaseOffset: 0,
    otherNpcPos: refs.mayaRig.root.position,
    allowedNodes,
  });
  animateCrewmate(refs.mayaRig, playerPos, elapsed, dt, refs.colliders, lang, {
    inShelter: crewSheltered,
    worried: mayaWorried,
    happy: mayaHappy,
    hasQuest: mayaHasQuest,
    phaseOffset: 1.8,
    otherNpcPos: refs.samRig.root.position,
    allowedNodes,
  });

  // CRITICAL POST-TUTORIAL RULE:
  // Once tutorial_completed === true, Commander NPC permanently enters Idle/Wander patrol
  // with NO quest sprite, NO worried/questing gestures, and ZERO interaction.
  if (!state.tutorial_completed) {
    refs.commanderRig.questSprite.visible = true;
    refs.commanderRig.root.position.set(0, 0, -1.2);
    refs.commanderRig.root.rotation.y = 0;
    refs.commanderRig.armR.rotation.z = -2.3 + Math.sin(elapsed * 5) * 0.25;
  } else {
    refs.commanderRig.questSprite.visible = false;
    animateCrewmate(refs.commanderRig, new THREE.Vector3(999, 0, 999), elapsed, dt, refs.colliders, lang, {
      inShelter: false,
      worried: false,
      happy: false,
      hasQuest: false,
      phaseOffset: 3.4,
      otherNpcPos: refs.samRig.root.position,
      allowedNodes,
    });
  }

  // 9. 3D Objective Waypoint Beacon & Corridor Guide Strips
  const activeTrigger = SHIFT_TRIGGER_MAP[state.shift];
  let wpTargetX = activeTrigger.x;
  let wpTargetZ = activeTrigger.z;
  let targetZone: OutpostZoneId = activeTrigger.zone;

  if (!isHandover && !state.shift_mission_accepted) {
    if (samHasQuest && mayaHasQuest) {
      const dSam = Math.hypot(playerPos.x - refs.samRig.root.position.x, playerPos.z - refs.samRig.root.position.z);
      const dMaya = Math.hypot(playerPos.x - refs.mayaRig.root.position.x, playerPos.z - refs.mayaRig.root.position.z);
      const chosen = dSam <= dMaya ? refs.samRig.root.position : refs.mayaRig.root.position;
      wpTargetX = chosen.x;
      wpTargetZ = chosen.z;
    } else if (samHasQuest) {
      wpTargetX = refs.samRig.root.position.x;
      wpTargetZ = refs.samRig.root.position.z;
    } else if (mayaHasQuest) {
      wpTargetX = refs.mayaRig.root.position.x;
      wpTargetZ = refs.mayaRig.root.position.z;
    }
    targetZone =
      wpTargetX < -5.6 ? 'solar' : wpTargetX > 5.6 ? 'greenhouse' : wpTargetZ > 5.6 ? 'habitat' : 'control';
  }

  refs.waypointGroup.visible = state.phase === 'playing' && !isHandover;
  refs.waypointGroup.position.x = THREE.MathUtils.damp(refs.waypointGroup.position.x, wpTargetX, 8, dt);
  refs.waypointGroup.position.z = THREE.MathUtils.damp(refs.waypointGroup.position.z, wpTargetZ, 8, dt);
  refs.waypointGroup.position.y = Math.sin(elapsed * 3.2) * 0.14;
  refs.waypointGroup.rotation.y = elapsed * 1.4;
  const wpHex = !state.shift_mission_accepted
    ? 0xef4444
    : state.spe_active || state.co2_haze_active
      ? 0xd76562
      : 0xf2c879;
  refs.waypointMat.color.setHex(wpHex);
  refs.waypointMat.emissive.setHex(wpHex);

  const pulse = 0.65 + Math.sin(elapsed * 4) * 0.35;
  const guideHex = !state.shift_mission_accepted ? 0xef4444 : 0xf2c879;
  if (state.spe_active) {
    const redStripIntensity = 0.45 + redAlertStrobe * 1.15;
    refs.corridorStrips.solar.emissive.setHex(0xef4444);
    refs.corridorStrips.solar.emissiveIntensity = redStripIntensity;
    refs.corridorStrips.greenhouse.emissive.setHex(0xef4444);
    refs.corridorStrips.greenhouse.emissiveIntensity = redStripIntensity;
    refs.corridorStrips.habitat.emissive.setHex(0xef4444);
    refs.corridorStrips.habitat.emissiveIntensity = redStripIntensity;
  } else if (isHandover) {
    refs.corridorStrips.solar.emissive.setHex(0x70b8d3);
    refs.corridorStrips.solar.emissiveIntensity = 0.25;
    refs.corridorStrips.greenhouse.emissive.setHex(0x6baf83);
    refs.corridorStrips.greenhouse.emissiveIntensity = 0.25;
    refs.corridorStrips.habitat.emissive.setHex(0x70b8d3);
    refs.corridorStrips.habitat.emissiveIntensity = 0.25;
  } else {
    refs.corridorStrips.solar.emissive.setHex(targetZone === 'solar' ? guideHex : 0x70b8d3);
    refs.corridorStrips.solar.emissiveIntensity = targetZone === 'solar' ? pulse * 1.3 : 0.25;
    refs.corridorStrips.greenhouse.emissive.setHex(targetZone === 'greenhouse' ? guideHex : 0x6baf83);
    refs.corridorStrips.greenhouse.emissiveIntensity = targetZone === 'greenhouse' ? pulse * 1.3 : 0.25;
    refs.corridorStrips.habitat.emissive.setHex(targetZone === 'habitat' ? guideHex : 0x70b8d3);
    refs.corridorStrips.habitat.emissiveIntensity = targetZone === 'habitat' ? pulse * 1.3 : 0.25;
  }

  // 10. Floating Dust Motes drift
  const mPos = refs.dustMotes.geometry.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < mPos.count; i++) {
    let my = mPos.getY(i) + dt * 0.12;
    if (my > 3.3) my = 0.35;
    mPos.setY(i, my);
  }
  mPos.needsUpdate = true;
}
