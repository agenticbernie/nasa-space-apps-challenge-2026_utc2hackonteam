import * as THREE from 'three';
import { GameState } from '../engine/types';
import { OutpostTextureSet } from './proceduralTextures';

export type NasaToolKind =
  | 'none'
  | 'solar_sensor'
  | 'water_wrench'
  | 'comms_unit'
  | 'plant_scanner'
  | 'co2_monitor';

export interface FirstPersonViewmodelRefs {
  root: THREE.Group;
  leftArmGroup: THREE.Group;
  rightArmGroup: THREE.Group;
  toolMount: THREE.Group;
  tools: Partial<Record<NasaToolKind, THREE.Group>>;
  co2LedMat: THREE.MeshStandardMaterial;
  dataPadGroup: THREE.Group;
  trolleyGroup: THREE.Group;
  activeTool: NasaToolKind;
  padProgress: number;
  swapDip: number;
  bobPhase: number;
  bobAmount: number;
  dispose: () => void;
}

export function buildFirstPersonViewmodel(
  textures: OutpostTextureSet,
): FirstPersonViewmodelRefs {
  const disposables: { dispose: () => void }[] = [];
  const trackGeo = <T extends THREE.BufferGeometry>(g: T): T => {
    disposables.push(g);
    return g;
  };
  const trackMat = <T extends THREE.Material>(m: T): T => {
    disposables.push(m);
    return m;
  };

  const root = new THREE.Group();

  // Shared 16-bit low-poly NASA suit materials (no harsh glare)
  const sleeveMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      roughness: 0.65,
      metalness: 0.12,
      flatShading: true,
    }),
  );
  const cuffMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.45,
      metalness: 0.55,
      flatShading: true,
    }),
  );
  const nasaOrangeMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0xf97316,
      roughness: 0.5,
      metalness: 0.2,
      flatShading: true,
    }),
  );
  const nasaBlueMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0x3b82f6,
      roughness: 0.5,
      metalness: 0.2,
      flatShading: true,
    }),
  );
  const gloveMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0x334155,
      roughness: 0.72,
      metalness: 0.2,
      flatShading: true,
    }),
  );
  const glovePadMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0x70b8d3,
      emissive: 0x0284c7,
      emissiveIntensity: 0.28,
      roughness: 0.4,
    }),
  );

  const buildArm = (isRight: boolean): THREE.Group => {
    const armGroup = new THREE.Group();
    const dir = isRight ? 1 : -1;

    // Forearm sleeve
    const forearm = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(0.088, 0.088, 0.32)),
      sleeveMat,
    );
    forearm.position.set(0, 0, 0.14);
    armGroup.add(forearm);

    // NASA mission stripe band
    const stripe = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(0.094, 0.094, 0.042)),
      isRight ? nasaOrangeMat : nasaBlueMat,
    );
    stripe.position.set(0, 0, 0.08);
    armGroup.add(stripe);

    // Metallic wrist coupling ring
    const cuff = new THREE.Mesh(
      trackGeo(new THREE.CylinderGeometry(0.052, 0.052, 0.036, 8)),
      cuffMat,
    );
    cuff.rotation.x = Math.PI / 2;
    cuff.position.set(0, 0, -0.025);
    armGroup.add(cuff);

    // EVA Glove palm & thumb
    const palm = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(0.076, 0.068, 0.095)),
      gloveMat,
    );
    palm.position.set(0, -0.005, -0.085);
    armGroup.add(palm);

    const fingerBlock = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(0.07, 0.048, 0.05)),
      gloveMat,
    );
    fingerBlock.position.set(-dir * 0.006, -0.015, -0.14);
    fingerBlock.rotation.x = 0.25;
    armGroup.add(fingerBlock);

    const thumb = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(0.028, 0.036, 0.055)),
      gloveMat,
    );
    thumb.position.set(-dir * 0.042, 0.015, -0.095);
    thumb.rotation.z = dir * 0.45;
    armGroup.add(thumb);

    // Tactile grip sensor accent on back of glove
    const sensorStrip = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(0.048, 0.012, 0.045)),
      glovePadMat,
    );
    sensorStrip.position.set(0, 0.032, -0.085);
    armGroup.add(sensorStrip);

    return armGroup;
  };

  const leftArmGroup = buildArm(false);
  leftArmGroup.position.set(-0.26, -0.25, -0.31);
  leftArmGroup.rotation.set(0.18, -0.18, 0.1);
  root.add(leftArmGroup);

  const rightArmGroup = buildArm(true);
  rightArmGroup.position.set(0.26, -0.24, -0.31);
  rightArmGroup.rotation.set(0.16, 0.2, -0.1);
  root.add(rightArmGroup);

  // Tool Mount attached to right hand
  const toolMount = new THREE.Group();
  toolMount.position.set(-0.01, 0.025, -0.105);
  rightArmGroup.add(toolMount);

  // =====================================================
  // 5 COMPOSITE NASA TOOLS FOR RIGHT HAND
  // =====================================================
  const metalMat = trackMat(
    new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.3, metalness: 0.78, flatShading: true }),
  );
  const darkMetalMat = trackMat(
    new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.42, metalness: 0.65, flatShading: true }),
  );

  // 1. Solar Irradiance / Multimeter Sensor (Solar Bay / Shift 1)
  const solarSensor = new THREE.Group();
  const ssBody = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.072, 0.032, 0.135)),
    trackMat(new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.45, metalness: 0.2, flatShading: true })),
  );
  solarSensor.add(ssBody);
  const ssScreen = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.052, 0.01, 0.055)),
    trackMat(new THREE.MeshStandardMaterial({ color: 0x0f172a, emissive: 0x38bdf8, emissiveIntensity: 0.75 })),
  );
  ssScreen.position.set(0, 0.016, -0.02);
  solarSensor.add(ssScreen);
  [-0.02, 0.02].forEach((px) => {
    const probe = new THREE.Mesh(trackGeo(new THREE.CylinderGeometry(0.005, 0.005, 0.065, 6)), metalMat);
    probe.rotation.x = Math.PI / 2;
    probe.position.set(px, 0.005, -0.095);
    solarSensor.add(probe);
  });
  toolMount.add(solarSensor);

  // 2. ISS EVA Torque Wrench & Water Purity Probe (ECLSS / Shift 2)
  const waterWrench = new THREE.Group();
  const wrenchShaft = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.026, 0.02, 0.18)), metalMat);
  wrenchShaft.position.set(0, 0.01, -0.03);
  waterWrench.add(wrenchShaft);
  const wrenchHead = new THREE.Mesh(trackGeo(new THREE.CylinderGeometry(0.028, 0.028, 0.026, 8)), darkMetalMat);
  wrenchHead.position.set(0, 0.012, -0.125);
  waterWrench.add(wrenchHead);
  const waterVial = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(0.013, 0.013, 0.065, 8)),
    trackMat(new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0284c7, emissiveIntensity: 0.65, roughness: 0.2 })),
  );
  waterVial.rotation.x = Math.PI / 2;
  waterVial.position.set(-0.024, 0.015, -0.05);
  waterWrench.add(waterVial);
  toolMount.add(waterWrench);

  // 3. NASA Flight Crew Comms Unit (Mission Control / Shift 3 & 6)
  const commsUnit = new THREE.Group();
  const radioBody = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.062, 0.034, 0.115)), darkMetalMat);
  commsUnit.add(radioBody);
  const radioAnt = new THREE.Mesh(trackGeo(new THREE.CylinderGeometry(0.005, 0.007, 0.11, 6)), metalMat);
  radioAnt.position.set(0.02, 0.055, -0.042);
  radioAnt.rotation.x = -0.25;
  commsUnit.add(radioAnt);
  const radioDisplay = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.044, 0.01, 0.04)),
    trackMat(new THREE.MeshStandardMaterial({ color: 0x111827, emissive: 0xf2c879, emissiveIntensity: 0.7 })),
  );
  radioDisplay.position.set(0, 0.016, -0.015);
  commsUnit.add(radioDisplay);
  const pttLed = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.012, 0.012, 0.012)),
    trackMat(new THREE.MeshStandardMaterial({ color: 0x22c55e, emissive: 0x22c55e, emissiveIntensity: 0.9 })),
  );
  pttLed.position.set(-0.02, 0.018, -0.045);
  commsUnit.add(pttLed);
  toolMount.add(commsUnit);

  // 4. NASA Veggie / APH Plant Health Scanner (Greenhouse / Shift 4)
  const plantScanner = new THREE.Group();
  const psBody = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.066, 0.032, 0.135)),
    trackMat(new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.45, metalness: 0.15, flatShading: true })),
  );
  plantScanner.add(psBody);
  const psBand = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.07, 0.02, 0.035)),
    trackMat(new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.4 })),
  );
  psBand.position.set(0, 0.005, -0.02);
  plantScanner.add(psBand);
  const psEmitter = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(0.018, 0.022, 0.035, 8)),
    trackMat(new THREE.MeshStandardMaterial({ color: 0xd8b4fe, emissive: 0xc084fc, emissiveIntensity: 0.8 })),
  );
  psEmitter.rotation.x = Math.PI / 2;
  psEmitter.position.set(0, 0.004, -0.082);
  plantScanner.add(psEmitter);
  toolMount.add(plantScanner);

  // 5. NASA CDM Portable CO2 Monitor (Habitat CO2 / Shift 5)
  const co2Monitor = new THREE.Group();
  const cdmBody = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.075, 0.038, 0.125)),
    trackMat(new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.5, metalness: 0.45, flatShading: true })),
  );
  co2Monitor.add(cdmBody);
  const cdmDome = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(0.022, 0.024, 0.024, 8)),
    trackMat(new THREE.MeshStandardMaterial({ color: 0x70b8d3, roughness: 0.35, metalness: 0.7 })),
  );
  cdmDome.position.set(0, 0.024, -0.035);
  co2Monitor.add(cdmDome);
  const co2LedMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0x6baf83,
      emissive: 0x6baf83,
      emissiveIntensity: 0.85,
    }),
  );
  const cdmScreen = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.048, 0.01, 0.038)), co2LedMat);
  cdmScreen.position.set(0, 0.02, 0.015);
  co2Monitor.add(cdmScreen);
  toolMount.add(co2Monitor);

  const tools: Partial<Record<NasaToolKind, THREE.Group>> = {
    solar_sensor: solarSensor,
    water_wrench: waterWrench,
    comms_unit: commsUnit,
    plant_scanner: plantScanner,
    co2_monitor: co2Monitor,
  };

  Object.values(tools).forEach((grp) => {
    if (grp) grp.visible = false;
  });

  // =====================================================
  // 3D NASA DATA PAD (iPad) FOR SMOOTH 0.35s RAISE ANIMATION
  // =====================================================
  const dataPadGroup = new THREE.Group();
  dataPadGroup.position.set(0, -0.52, -0.44);
  dataPadGroup.rotation.x = 0.55;
  dataPadGroup.visible = false;

  const bezelMesh = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.32, 0.22, 0.016)),
    trackMat(new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.35, metalness: 0.75, flatShading: true })),
  );
  dataPadGroup.add(bezelMesh);

  const padScreenMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      map: textures.controlScreen,
      emissiveMap: textures.controlScreen,
      emissive: 0xffffff,
      emissiveIntensity: 0.75,
      roughness: 0.65,
      metalness: 0.05,
    }),
  );
  const padScreen = new THREE.Mesh(trackGeo(new THREE.PlaneGeometry(0.28, 0.18)), padScreenMat);
  padScreen.position.z = 0.011;
  dataPadGroup.add(padScreen);

  const padHomeBtn = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(0.008, 0.008, 0.005, 10)),
    trackMat(new THREE.MeshStandardMaterial({ color: 0x70b8d3, emissive: 0x70b8d3, emissiveIntensity: 0.5 })),
  );
  padHomeBtn.rotation.x = Math.PI / 2;
  padHomeBtn.position.set(0, -0.1, 0.01);
  dataPadGroup.add(padHomeBtn);

  // Subtle grip rim bars on iPad sides
  [-0.165, 0.165].forEach((gx) => {
    const grip = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.016, 0.14, 0.02)), gloveMat);
    grip.position.set(gx, 0, 0);
    dataPadGroup.add(grip);
  });

  root.add(dataPadGroup);

  // =====================================================
  // 3D PUSHED SUPPLY TROLLEY VIEWMODEL (FRONT OF PLAYER)
  // =====================================================
  const trolleyGroup = new THREE.Group();
  trolleyGroup.position.set(0, -0.34, -0.58);
  trolleyGroup.visible = false;

  const vmHandleMat = trackMat(
    new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.38, metalness: 0.45, flatShading: true }),
  );
  const vmPushBar = new THREE.Mesh(trackGeo(new THREE.CylinderGeometry(0.016, 0.016, 0.48, 8)), vmHandleMat);
  vmPushBar.rotation.z = Math.PI / 2;
  vmPushBar.position.set(0, 0.14, 0.16);
  trolleyGroup.add(vmPushBar);

  [-0.22, 0.22].forEach((tx) => {
    const sideRail = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.025, 0.025, 0.42)), metalMat);
    sideRail.position.set(tx, 0.02, -0.02);
    sideRail.rotation.x = 0.55;
    trolleyGroup.add(sideRail);
  });

  const vmBasketBase = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.46, 0.04, 0.36)), darkMetalMat);
  vmBasketBase.position.set(0, -0.14, -0.18);
  trolleyGroup.add(vmBasketBase);

  const vmCrate1 = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.2, 0.14, 0.22)),
    trackMat(new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.5, flatShading: true })),
  );
  vmCrate1.position.set(-0.1, -0.05, -0.18);
  trolleyGroup.add(vmCrate1);

  const vmCrate2 = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.18, 0.12, 0.2)),
    trackMat(new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.5, flatShading: true })),
  );
  vmCrate2.position.set(0.11, -0.06, -0.18);
  trolleyGroup.add(vmCrate2);

  root.add(trolleyGroup);

  return {
    root,
    leftArmGroup,
    rightArmGroup,
    toolMount,
    tools,
    co2LedMat,
    dataPadGroup,
    trolleyGroup,
    activeTool: 'none',
    padProgress: 0,
    swapDip: 0,
    bobPhase: 0,
    bobAmount: 0,
    dispose: () => {
      disposables.forEach((d) => d.dispose());
    },
  };
}

function resolveDesiredTool(
  state: GameState,
  playerX: number,
  playerZ: number,
): NasaToolKind {
  // Only show specialized NASA tools inside Solar Bay, Greenhouse, or Habitat.
  // Inside Mission Control and all 3 connecting corridors, keep EVA hands clean/empty.
  if (playerX <= -14.0 && Math.abs(playerZ) <= 4.5) {
    return 'solar_sensor';
  }
  if (playerX >= 14.0 && Math.abs(playerZ) <= 4.5) {
    return 'plant_scanner';
  }
  if (playerZ >= 14.0 && Math.abs(playerX) <= 5.7) {
    if (state.shift === 2) {
      return playerX > 0.9 ? 'co2_monitor' : 'water_wrench';
    }
    if (state.shift === 5) {
      return playerX < -0.9 ? 'water_wrench' : 'co2_monitor';
    }
    return playerX < 0 ? 'water_wrench' : 'co2_monitor';
  }
  return 'none';
}

export function animateFirstPersonViewmodel(
  vm: FirstPersonViewmodelRefs,
  state: GameState,
  playerX: number,
  playerZ: number,
  options: {
    dt: number;
    elapsed: number;
    isWalking: boolean;
    dataPadActive: boolean;
    isPaused: boolean;
  },
) {
  const showArms = state.phase === 'playing' || state.phase === 'console';
  vm.root.visible = showArms;
  if (!showArms) return;

  const dt = options.dt;

  // 1. Resolve & swap NASA tool smoothly
  const desiredTool = resolveDesiredTool(state, playerX, playerZ);
  if (desiredTool !== vm.activeTool) {
    vm.activeTool = desiredTool;
    vm.swapDip = 1.0;
    (Object.keys(vm.tools) as NasaToolKind[]).forEach((k) => {
      const grp = vm.tools[k];
      if (grp) grp.visible = k === desiredTool;
    });
  }
  vm.swapDip = THREE.MathUtils.damp(vm.swapDip, 0, 11, dt);

  // Sync CO2 Monitor status color dynamically
  if (state.co2_haze_active || state.air_quality_score < 60) {
    vm.co2LedMat.color.setHex(0xd76562);
    vm.co2LedMat.emissive.setHex(0xd76562);
  } else if (state.shift === 5) {
    vm.co2LedMat.color.setHex(0xf0b85d);
    vm.co2LedMat.emissive.setHex(0xf0b85d);
  } else {
    vm.co2LedMat.color.setHex(0x6baf83);
    vm.co2LedMat.emissive.setHex(0x6baf83);
  }

  // 2. Smooth 0.35s Data Pad Raise / Lower Animation
  const padTarget = options.dataPadActive ? 1 : 0;
  // Lambda 11 gives ~98% completion in ~0.35s
  vm.padProgress = THREE.MathUtils.damp(vm.padProgress, padTarget, 11.5, dt);
  if (vm.padProgress > 0.015) {
    vm.dataPadGroup.visible = true;
    const ease = vm.padProgress;
    vm.dataPadGroup.position.set(
      0,
      THREE.MathUtils.lerp(-0.46, -0.055, ease),
      THREE.MathUtils.lerp(-0.46, -0.34, ease),
    );
    vm.dataPadGroup.rotation.x = THREE.MathUtils.lerp(0.65, -0.1, ease);
  } else {
    vm.dataPadGroup.visible = false;
  }

  // 3. View-bobbing (walk stride + idle breath)
  if (!options.isPaused) {
    vm.bobAmount = THREE.MathUtils.damp(vm.bobAmount, options.isWalking ? 1 : 0, 8, dt);
    if (options.isWalking) {
      vm.bobPhase += dt * 8.2;
    }
  }

  const walkBobX = Math.cos(vm.bobPhase * 0.5) * 0.012 * vm.bobAmount;
  const walkBobY = Math.abs(Math.sin(vm.bobPhase)) * 0.014 * vm.bobAmount;
  const idleBreath = Math.sin(options.elapsed * 2.1) * 0.004;

  const pushingTrolley = state.trolley_attached && !options.dataPadActive;
  vm.trolleyGroup.visible = pushingTrolley;
  if (pushingTrolley) {
    vm.trolleyGroup.position.set(walkBobX * 0.6, -0.34 - walkBobY * 0.65, -0.58);
    (Object.keys(vm.tools) as NasaToolKind[]).forEach((k) => {
      const grp = vm.tools[k];
      if (grp) grp.visible = false;
    });
  } else if (vm.activeTool !== 'none') {
    const activeGrp = vm.tools[vm.activeTool];
    if (activeGrp) activeGrp.visible = true;
  }

  // Left arm raises to hold the iPad when Data Pad is active, or grips Trolley handle
  const leftRestX = (pushingTrolley ? -0.19 : -0.25) + walkBobX;
  const leftRestY = (pushingTrolley ? -0.2 : -0.245) - walkBobY + idleBreath;
  const leftRestZ = pushingTrolley ? -0.35 : -0.31;

  vm.leftArmGroup.position.set(
    THREE.MathUtils.lerp(leftRestX, -0.155, vm.padProgress),
    THREE.MathUtils.lerp(leftRestY, -0.135, vm.padProgress),
    THREE.MathUtils.lerp(leftRestZ, -0.27, vm.padProgress),
  );
  vm.leftArmGroup.rotation.set(
    THREE.MathUtils.lerp((pushingTrolley ? 0.06 : 0.16) + walkBobY * 1.4, 0.36, vm.padProgress),
    THREE.MathUtils.lerp(pushingTrolley ? -0.04 : -0.18, -0.34, vm.padProgress),
    THREE.MathUtils.lerp(pushingTrolley ? 0.02 : 0.1, -0.18, vm.padProgress),
  );

  // Right arm grips Trolley handle symmetrically, dips on tool swap, or raises iPad
  const rightToolDip = pushingTrolley ? 0 : vm.swapDip * 0.14;
  const rightRestX = (pushingTrolley ? 0.19 : 0.255) + walkBobX;
  const rightRestY = (pushingTrolley ? -0.2 : -0.235) - walkBobY + idleBreath - rightToolDip;
  const rightRestZ = pushingTrolley ? -0.35 : -0.31;

  vm.rightArmGroup.position.set(
    THREE.MathUtils.lerp(rightRestX, 0.16, vm.padProgress),
    THREE.MathUtils.lerp(rightRestY, -0.16, vm.padProgress),
    THREE.MathUtils.lerp(rightRestZ, -0.28, vm.padProgress),
  );
  vm.rightArmGroup.rotation.set(
    THREE.MathUtils.lerp((pushingTrolley ? 0.06 : 0.14) + walkBobY * 1.4 - vm.swapDip * 0.3, 0.34, vm.padProgress),
    THREE.MathUtils.lerp(pushingTrolley ? 0.04 : 0.2, 0.32, vm.padProgress),
    THREE.MathUtils.lerp(pushingTrolley ? -0.02 : -0.1, 0.2, vm.padProgress),
  );
}
