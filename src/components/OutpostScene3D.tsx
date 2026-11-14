import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { soundEngine } from '../audio/soundEngine';
import { getLocalizedTargetLabel } from '../engine/dialogueData';
import { getUnlockedRoomFlags } from '../engine/simulationEngine';
import {
  AirlockState,
  GameState,
  HoveredInteractable,
  Language,
  OutpostZoneId,
  PerformanceSettings,
  PerformanceTelemetry,
  ResolvedQualityTier,
} from '../engine/types';
import {
  animateFirstPersonViewmodel,
  buildFirstPersonViewmodel,
} from '../three/firstPersonViewmodel';
import {
  createOutpostTextures,
  updateDynamicScreenTextures,
} from '../three/proceduralTextures';
import {
  AABBBox,
  buildLunarOutpostScene,
  syncOutpostWithGameState,
} from '../three/outpostBuilder';

export interface RadarTelemetry {
  playerX: number;
  playerZ: number;
  playerYaw: number;
  samX: number;
  samZ: number;
  mayaX: number;
  mayaZ: number;
}

interface OutpostScene3DProps {
  gameState: GameState;
  lang: Language;
  dataPadRaised: boolean;
  isPaused: boolean;
  hasModalOpen: boolean;
  resetPoseNonce: number;
  perfSettings: PerformanceSettings;
  onZoneChange: (zone: OutpostZoneId) => void;
  onHoverTarget: (target: HoveredInteractable | null) => void;
  onInteractTarget: (target: HoveredInteractable) => void;
  onPointerLockChange: (locked: boolean) => void;
  onAirlocksChange: (next: AirlockState) => void;
  onNearLockedDoorChange: (near: boolean, reason?: 'shift_unlock' | 'trolley') => void;
  onWarehouseBlocked: () => void;
  onCutsceneStageChange: (stage: number, finished?: boolean) => void;
  onRadarTelemetry: (telemetry: RadarTelemetry) => void;
  onPerfTelemetry: (telemetry: PerformanceTelemetry) => void;
}

// Pre-allocated math objects at module scope (Zero GC in render loop)
const _forward = new THREE.Vector3();
const _right = new THREE.Vector3();
const _move = new THREE.Vector3();
const _up = new THREE.Vector3(0, 1, 0);
const _cutsceneLookTarget = new THREE.Vector3();
const _raycaster = new THREE.Raycaster();
const _screenCenter = new THREE.Vector2(0, 0);
const _euler = new THREE.Euler(0, 0, 0, 'YXZ');

function detectZone(x: number, z: number): OutpostZoneId {
  if (x < -5.6) return 'solar';
  if (x > 5.6) return 'greenhouse';
  if (z > 5.6) return 'habitat';
  return 'control';
}

function isInsideOutpostFootprint(x: number, z: number): boolean {
  const inCenter = x >= -5.25 && x <= 5.25 && z >= -5.15 && z <= 5.25;
  const inWestCorr = x >= -14.3 && x <= -5.2 && z >= -1.45 && z <= 1.45;
  const inWestRoom = x >= -22.25 && x <= -13.7 && z >= -3.95 && z <= 3.95;
  const inEastCorr = x >= 5.2 && x <= 14.3 && z >= -1.45 && z <= 1.45;
  const inEastRoom = x >= 13.7 && x <= 22.75 && z >= -3.95 && z <= 3.95;
  const inSouthCorr = x >= -1.45 && x <= 1.45 && z >= 5.2 && z <= 14.3;
  const inSouthRoom = x >= -5.25 && x <= 5.25 && z >= 13.7 && z <= 27.4;
  return (
    inCenter ||
    inWestCorr ||
    inWestRoom ||
    inEastCorr ||
    inEastRoom ||
    inSouthCorr ||
    inSouthRoom
  );
}

function hitsCollider(x: number, z: number, colliders: AABBBox[]): boolean {
  for (let i = 0; i < colliders.length; i++) {
    const c = colliders[i];
    if (x >= c.minX && x <= c.maxX && z >= c.minZ && z <= c.maxZ) {
      return true;
    }
  }
  return false;
}

function clampDelta(v: number, limit = 80): number {
  return Math.max(-limit, Math.min(limit, v));
}

export const OutpostScene3D: React.FC<OutpostScene3DProps> = ({
  gameState,
  lang,
  dataPadRaised,
  isPaused,
  hasModalOpen,
  resetPoseNonce,
  perfSettings,
  onZoneChange,
  onHoverTarget,
  onInteractTarget,
  onPointerLockChange,
  onAirlocksChange,
  onNearLockedDoorChange,
  onWarehouseBlocked,
  onCutsceneStageChange,
  onRadarTelemetry,
  onPerfTelemetry,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stateRef = useRef<GameState>(gameState);
  const langRef = useRef<Language>(lang);
  const dataPadRaisedRef = useRef<boolean>(dataPadRaised);
  const pausedRef = useRef<boolean>(isPaused);
  const modalOpenRef = useRef<boolean>(hasModalOpen);
  const perfSettingsRef = useRef<PerformanceSettings>(perfSettings);
  const callbacksRef = useRef({
    onZoneChange,
    onHoverTarget,
    onInteractTarget,
    onPointerLockChange,
    onAirlocksChange,
    onNearLockedDoorChange,
    onWarehouseBlocked,
    onCutsceneStageChange,
    onRadarTelemetry,
    onPerfTelemetry,
  });
  const resetPosePendingRef = useRef<boolean>(false);

  useEffect(() => {
    stateRef.current = gameState;
    langRef.current = lang;
    dataPadRaisedRef.current = dataPadRaised;
    pausedRef.current = isPaused;
    modalOpenRef.current = hasModalOpen;
    perfSettingsRef.current = perfSettings;
    if ((gameState.phase !== 'playing' || hasModalOpen || isPaused) && document.pointerLockElement) {
      try {
        document.exitPointerLock();
      } catch {
        // Ignore if already exited
      }
    }
  }, [gameState, lang, dataPadRaised, isPaused, hasModalOpen, perfSettings]);

  useEffect(() => {
    callbacksRef.current = {
      onZoneChange,
      onHoverTarget,
      onInteractTarget,
      onPointerLockChange,
      onAirlocksChange,
      onNearLockedDoorChange,
      onWarehouseBlocked,
      onCutsceneStageChange,
      onRadarTelemetry,
      onPerfTelemetry,
    };
  }, [
    onZoneChange,
    onHoverTarget,
    onInteractTarget,
    onPointerLockChange,
    onAirlocksChange,
    onNearLockedDoorChange,
    onWarehouseBlocked,
    onCutsceneStageChange,
    onRadarTelemetry,
    onPerfTelemetry,
  ]);

  useEffect(() => {
    if (resetPoseNonce > 0) {
      resetPosePendingRef.current = true;
    }
  }, [resetPoseNonce]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const isSoftwareGl = (() => {
      try {
        const probeCanvas = document.createElement('canvas');
        const gl = probeCanvas.getContext('webgl2');
        if (!gl) return true;
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
        const gpu = String(gl.getParameter(param) || '');
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch {
        return true;
      }
    })();

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    renderer.setPixelRatio(isSoftwareGl ? 0.85 : Math.min(window.devicePixelRatio, 1.5));
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setSize(container.clientWidth || window.innerWidth, container.clientHeight || window.innerHeight);
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.dataset.outpostCanvas = 'true';
    canvasRef.current = renderer.domElement;
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x101828);
    scene.fog = new THREE.FogExp2(0x101828, 0.011);

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const roomEnv = new RoomEnvironment();
    const envRT = pmremGenerator.fromScene(roomEnv, 0.04);
    scene.environment = envRT.texture;
    roomEnv.dispose();
    pmremGenerator.dispose();

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;
    const camera = new THREE.PerspectiveCamera(68, width / height, 0.06, 180);
    camera.position.set(0, 1.65, 1.4);
    scene.add(camera);

    // Smoothed camera rotation targets (strictly locked when pointer is unlocked)
    let yaw = 0;
    let pitch = -0.05;
    let targetYaw = 0;
    let targetPitch = -0.05;

    const maxAniso = renderer.capabilities.getMaxAnisotropy();
    const textures = createOutpostTextures(maxAniso);
    updateDynamicScreenTextures(textures, stateRef.current, langRef.current);
    const outpostRefs = buildLunarOutpostScene(scene, textures, isSoftwareGl);
    const viewmodel = buildFirstPersonViewmodel(textures);
    camera.add(viewmodel.root);

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    const totalSpeParticles = outpostRefs.speParticles.geometry.attributes.position.count;
    const totalDustMotes = outpostRefs.dustMotes.geometry.attributes.position.count;

    // Adaptive quality tier controller
    let activeTier: ResolvedQualityTier = isSoftwareGl ? 'low' : 'medium';
    let radarInterval = activeTier === 'low' ? 0.1 : 0.05;

    const applyQualityTier = (tier: ResolvedQualityTier) => {
      activeTier = tier;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      if (tier === 'low') {
        renderer.setPixelRatio(0.75);
        renderer.shadowMap.enabled = false;
        outpostRefs.speParticles.geometry.setDrawRange(0, Math.max(20, Math.floor(totalSpeParticles * 0.3)));
        outpostRefs.dustMotes.geometry.setDrawRange(0, Math.max(12, Math.floor(totalDustMotes * 0.3)));
        radarInterval = 0.1; // 10Hz
      } else if (tier === 'medium') {
        renderer.setPixelRatio(1);
        renderer.shadowMap.enabled = !isSoftwareGl;
        outpostRefs.speParticles.geometry.setDrawRange(0, Math.floor(totalSpeParticles * 0.7));
        outpostRefs.dustMotes.geometry.setDrawRange(0, Math.floor(totalDustMotes * 0.7));
        radarInterval = 0.05; // 20Hz
      } else {
        renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 1.5));
        renderer.shadowMap.enabled = !isSoftwareGl;
        outpostRefs.speParticles.geometry.setDrawRange(0, totalSpeParticles);
        outpostRefs.dustMotes.geometry.setDrawRange(0, totalDustMotes);
        radarInterval = 0.05; // 20Hz
      }
      renderer.setSize(w, h, false);
    };
    applyQualityTier(activeTier);

    const keys: Record<string, boolean> = {};
    let currentHovered: HoveredInteractable | null = null;
    let lastObservedZone: OutpostZoneId = 'control';
    let lastNearLockedDoor = false;
    let lastLockedReason: 'shift_unlock' | 'trolley' | undefined = undefined;
    let lastScreenSyncKey = '';
    let stepTimer = 0;
    let stepCount = 0;
    let radarTimer = 0;
    let warehouseBlockWarnTimer = 0;
    let wasCutsceneActive = false;
    let cutsceneElapsed = 0;
    let lastCutsceneStage = -1;
    let cutsceneFinishedNotified = false;

    // Rolling FPS & Auto-Scaling timers
    let fpsFrameCount = 0;
    let fpsAccumTime = 0;
    let rollingFps = isSoftwareGl ? 30 : 60;
    let lowFpsSeconds = 0;
    let highFpsSeconds = 0;
    let perfReportTimer = 0;

    const canControlPlayer = () =>
      stateRef.current.phase === 'playing' && !modalOpenRef.current && !pausedRef.current;

    const tryRequestPointerLock = () => {
      if (!canControlPlayer()) return;
      if (document.pointerLockElement === renderer.domElement) return;
      try {
        const p = renderer.domElement.requestPointerLock?.() as unknown as Promise<void> | undefined;
        if (p && typeof p.catch === 'function') p.catch(() => {});
      } catch {
        // Cursor remains unlocked if sandbox declines pointer lock
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!canControlPlayer()) return;
      keys[e.code] = true;
      if (e.code === 'KeyE') {
        e.preventDefault();
        if (currentHovered) {
          callbacksRef.current.onInteractTarget(currentHovered);
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keys[e.code] = false;
    };

    const handleWindowBlur = () => {
      Object.keys(keys).forEach((k) => {
        keys[k] = false;
      });
    };

    const handlePointerLockChange = () => {
      const locked = document.pointerLockElement === renderer.domElement;
      callbacksRef.current.onPointerLockChange(locked);
    };

    // STRICT CAMERA LOCK RULE: Rotate camera ONLY when PointerLock is active on the canvas.
    const handleMouseMove = (e: MouseEvent) => {
      if (!canControlPlayer()) return;
      if (document.pointerLockElement !== renderer.domElement) return;
      const sens = perfSettingsRef.current.mouseSensitivity || 1.0;
      const mx = clampDelta(e.movementX, 80);
      const my = clampDelta(e.movementY, 80);
      targetYaw -= mx * 0.0024 * sens;
      targetPitch -= my * 0.0024 * sens;
      targetPitch = Math.max(-Math.PI / 2.6, Math.min(Math.PI / 2.6, targetPitch));
      yaw = targetYaw;
      pitch = targetPitch;
    };

    const handleCanvasClick = (e: MouseEvent) => {
      if (!canControlPlayer()) return;
      if (e.button !== 0) return;
      if (document.pointerLockElement !== renderer.domElement) {
        tryRequestPointerLock();
        return;
      }
      if (currentHovered) {
        callbacksRef.current.onInteractTarget(currentHovered);
      }
    };

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('resize', handleResize);
    document.addEventListener('pointerlockchange', handlePointerLockChange);
    renderer.domElement.addEventListener('click', handleCanvasClick);
    window.addEventListener('mousemove', handleMouseMove);

    const clock = new THREE.Clock();
    let frameId = 0;
    let disposed = false;
    let raycastAccumulator = 0;
    const interactiveMeshes = outpostRefs.interactiveTargets.map((t) => t.mesh);

    function afterDraw(cb: () => void) {
      if (disposed) return;
      const gl = renderer.getContext() as WebGL2RenderingContext;
      const sync = gl.fenceSync?.(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      if (!sync) {
        frameId = window.setTimeout(cb, 80);
        return;
      }
      gl.flush();
      const poll = () => {
        if (disposed) {
          gl.deleteSync(sync);
          return;
        }
        const status = gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (status === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    }

    function tick() {
      if (disposed) return;
      const rawDt = clock.getDelta();
      const dt = Math.min(rawDt, 0.05);
      const elapsed = clock.getElapsedTime();
      const st = stateRef.current;
      const currentLang = langRef.current;

      // 1. Rolling Average FPS & Adaptive Quality Scaling
      fpsFrameCount += 1;
      fpsAccumTime += Math.max(rawDt, 0.001);
      if (fpsAccumTime >= 0.5) {
        const instantFps = Math.round(fpsFrameCount / fpsAccumTime);
        rollingFps = Math.round(rollingFps * 0.5 + instantFps * 0.5);
        fpsFrameCount = 0;
        fpsAccumTime = 0;
      }

      const mode = perfSettingsRef.current.qualityMode;
      if (mode !== 'auto') {
        if (activeTier !== mode) {
          applyQualityTier(mode);
        }
        lowFpsSeconds = 0;
        highFpsSeconds = 0;
      } else if (!isSoftwareGl && st.phase === 'playing') {
        if (rollingFps < 35) {
          lowFpsSeconds += rawDt;
          highFpsSeconds = 0;
          if (lowFpsSeconds >= 3.0 && activeTier !== 'low') {
            applyQualityTier('low');
            lowFpsSeconds = 0;
          }
        } else if (rollingFps >= 50) {
          highFpsSeconds += rawDt;
          lowFpsSeconds = 0;
          if (highFpsSeconds >= 4.0) {
            if (activeTier === 'low') {
              applyQualityTier('medium');
              highFpsSeconds = 0;
            } else if (activeTier === 'medium' && rollingFps >= 56 && highFpsSeconds >= 5.0) {
              applyQualityTier('high');
              highFpsSeconds = 0;
            }
          }
        } else {
          lowFpsSeconds = Math.max(0, lowFpsSeconds - rawDt * 0.5);
        }
      }

      perfReportTimer += rawDt;
      if (perfReportTimer >= 0.6) {
        perfReportTimer = 0;
        callbacksRef.current.onPerfTelemetry({
          fps: Math.max(1, Math.min(144, rollingFps)),
          activeTier,
          isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
        });
      }

      // 2. Sync dynamic 3D monitor textures on state or language change
      const screenKey = `${currentLang}-${st.shift}-${st.battery}-${st.solar_supply}-${st.water}-${st.air_quality_score}-${st.plant_health}-${st.spe_active}-${st.dust_storm_active}-${st.thermal_drop_active}-${st.shelter_state}-${st.solar_panels_dusty}-${Math.round(st.crew_health)}-${st.active_ailments.length}-${st.eclss.o2_kpa.toFixed(1)}-${st.eclss.body_temp_c.toFixed(1)}-${st.eva_radar_level}-${st.unlocked_sectors.length}-${st.unlocked_rooms.length}-${st.eva_rover_unlocked}-${st.inventory.scrap_metal}-${st.inventory.ki_pills}-${st.inventory.hepa_filter}`;
      if (screenKey !== lastScreenSyncKey) {
        lastScreenSyncKey = screenKey;
        updateDynamicScreenTextures(textures, st, currentLang);
      }

      let playerWalking = false;
      if (warehouseBlockWarnTimer > 0) {
        warehouseBlockWarnTimer = Math.max(0, warehouseBlockWarnTimer - dt);
      }

      if (st.phase !== 'cutscene') {
        wasCutsceneActive = false;
        cutsceneElapsed = 0;
        lastCutsceneStage = -1;
        cutsceneFinishedNotified = false;
      }

      if (st.phase === 'cutscene') {
        if (!wasCutsceneActive) {
          wasCutsceneActive = true;
          cutsceneElapsed = 0;
          lastCutsceneStage = -1;
          cutsceneFinishedNotified = false;
        }
        cutsceneElapsed += dt;

        // 13.2s Real-time 3D Intro Cutscene:
        // Stage 0 (0..4.5s): Earth orbit -> Lunar South Pole approach
        // Stage 1 (4.5..9.0s): Lander touchdown on lunar terrain near Aurora Station
        // Stage 2 (9.0..13.2s): Camera glides straight through North viewport glass into Mission Control
        if (cutsceneElapsed < 4.5) {
          const p = cutsceneElapsed / 4.5;
          const ease = p * p * (3 - 2 * p);
          if (lastCutsceneStage !== 0) {
            lastCutsceneStage = 0;
            callbacksRef.current.onCutsceneStageChange(0, false);
          }
          camera.position.set(
            THREE.MathUtils.lerp(18, 8.5, ease),
            THREE.MathUtils.lerp(16.5, 9.5, ease),
            THREE.MathUtils.lerp(-48, -34, ease),
          );
          _cutsceneLookTarget.set(
            THREE.MathUtils.lerp(15, 2.8, ease),
            THREE.MathUtils.lerp(8.5, 2.2, ease),
            THREE.MathUtils.lerp(-64, -22, ease),
          );
          camera.lookAt(_cutsceneLookTarget);
          outpostRefs.cutsceneLanderGroup.position.set(4.2, THREE.MathUtils.lerp(22, 6.5, ease), -25.0);
          outpostRefs.cutsceneThrusterMesh.visible = true;
          outpostRefs.cutsceneThrusterMesh.scale.setScalar(0.95 + Math.sin(elapsed * 26) * 0.14);
        } else if (cutsceneElapsed < 9.0) {
          const p = (cutsceneElapsed - 4.5) / 4.5;
          const ease = p * p * (3 - 2 * p);
          if (lastCutsceneStage !== 1) {
            lastCutsceneStage = 1;
            callbacksRef.current.onCutsceneStageChange(1, false);
          }
          camera.position.set(
            THREE.MathUtils.lerp(8.5, 0.9, ease),
            THREE.MathUtils.lerp(9.5, 2.85, ease),
            THREE.MathUtils.lerp(-34, -15.5, ease),
          );
          _cutsceneLookTarget.set(
            THREE.MathUtils.lerp(2.8, 0.4, ease),
            THREE.MathUtils.lerp(2.2, 1.85, ease),
            THREE.MathUtils.lerp(-22, -6.0, ease),
          );
          camera.lookAt(_cutsceneLookTarget);
          outpostRefs.cutsceneLanderGroup.position.set(4.2, THREE.MathUtils.lerp(6.5, 0.0, ease), -25.0);
          outpostRefs.cutsceneThrusterMesh.visible = p < 0.92;
          outpostRefs.cutsceneThrusterMesh.scale.setScalar(0.75 + Math.sin(elapsed * 30) * 0.12);
        } else {
          const p = Math.min(1, (cutsceneElapsed - 9.0) / 4.2);
          const ease = p * p * (3 - 2 * p);
          if (lastCutsceneStage !== 2) {
            lastCutsceneStage = 2;
            callbacksRef.current.onCutsceneStageChange(2, false);
          }
          outpostRefs.cutsceneLanderGroup.position.set(4.2, 0.0, -25.0);
          outpostRefs.cutsceneThrusterMesh.visible = false;
          camera.position.set(
            THREE.MathUtils.lerp(0.9, 0.0, ease),
            THREE.MathUtils.lerp(2.85, 1.65, ease),
            THREE.MathUtils.lerp(-15.5, 1.4, ease),
          );
          _cutsceneLookTarget.set(
            0,
            THREE.MathUtils.lerp(1.85, 1.42, ease),
            THREE.MathUtils.lerp(-6.0, -1.2, ease),
          );
          camera.lookAt(_cutsceneLookTarget);
          if (p >= 1 && !cutsceneFinishedNotified) {
            cutsceneFinishedNotified = true;
            callbacksRef.current.onCutsceneStageChange(2, true);
          }
        }
      } else if (st.phase === 'title') {
        // Live animated South Pole exterior showcase: Aurora Station + Waving Astronaut + Cruising EVA Rover + Earth
        camera.position.set(
          Math.sin(elapsed * 0.22) * 8.5,
          4.2 + Math.sin(elapsed * 0.35) * 0.35,
          -26.5,
        );
        _cutsceneLookTarget.set(Math.sin(elapsed * 0.14) * 1.4, 1.5, -10.5);
        camera.lookAt(_cutsceneLookTarget);
      } else if (st.phase === 'callsign' || st.phase === 'intro') {
        const panAngle = elapsed * 0.12;
        camera.position.set(
          Math.sin(panAngle) * 1.8,
          1.75 + Math.sin(elapsed * 0.4) * 0.05,
          0.6 + Math.cos(panAngle) * 0.6,
        );
        camera.lookAt(Math.sin(panAngle * 0.6) * 4.5, 1.65, -14.0);
      } else if (st.phase === 'tutorial_npc') {
        camera.position.set(0, 1.65, 1.4);
        camera.lookAt(0, 1.42, -1.2);
      } else if (canControlPlayer()) {
        if (resetPosePendingRef.current) {
          resetPosePendingRef.current = false;
          camera.position.set(0, 1.65, 1.4);
          yaw = 0;
          pitch = -0.05;
          targetYaw = 0;
          targetPitch = -0.05;
        }

        // Instant zero-lag 1:1 mouse response when locked
        yaw = targetYaw;
        pitch = targetPitch;

        const unlocked = getUnlockedRoomFlags(st);
        const moveFwd =
          (keys['KeyW'] || keys['ArrowUp'] ? 1 : 0) -
          (keys['KeyS'] || keys['ArrowDown'] ? 1 : 0);
        const moveSide =
          (keys['KeyD'] || keys['ArrowRight'] ? 1 : 0) -
          (keys['KeyA'] || keys['ArrowLeft'] ? 1 : 0);

        if (moveFwd !== 0 || moveSide !== 0) {
          _forward.set(-Math.sin(yaw), 0, -Math.cos(yaw)).normalize();
          _right.crossVectors(_forward, _up).normalize();
          _move
            .set(0, 0, 0)
            .addScaledVector(_forward, moveFwd)
            .addScaledVector(_right, moveSide)
            .normalize()
            .multiplyScalar(4.4 * dt);

          const nextX = camera.position.x + _move.x;
          const xBlockedByGreenhouseLock = !unlocked.greenhouse && nextX > 5.05;
          const xBlockedByMedBayLock =
            !unlocked.med_bay &&
            nextX < -1.45 &&
            camera.position.z >= 13.8 &&
            camera.position.z <= 16.2;
          const xBlockedByWarehouse =
            (!unlocked.warehouse || !st.trolley_attached) &&
            camera.position.z > 20.15 &&
            Math.abs(nextX) < 5.4;

          if (
            !xBlockedByGreenhouseLock &&
            !xBlockedByMedBayLock &&
            !xBlockedByWarehouse &&
            isInsideOutpostFootprint(nextX, camera.position.z) &&
            !hitsCollider(nextX, camera.position.z, outpostRefs.colliders) &&
            !hitsCollider(nextX, camera.position.z, outpostRefs.playerOnlyColliders)
          ) {
            camera.position.x = nextX;
            playerWalking = true;
          }

          const nextZ = camera.position.z + _move.z;
          const zBlockedByEclssLock = !unlocked.eclss && nextZ > 5.05;
          const zBlockedByMedBayLock =
            !unlocked.med_bay &&
            camera.position.x < -1.45 &&
            nextZ >= 13.8 &&
            nextZ <= 16.2;
          const zBlockedByWarehouse =
            (!unlocked.warehouse || !st.trolley_attached) &&
            nextZ > 20.15 &&
            Math.abs(camera.position.x) < 5.4;

          if (zBlockedByWarehouse) {
            if (warehouseBlockWarnTimer <= 0) {
              warehouseBlockWarnTimer = 2.4;
              soundEngine.playSparkError();
              if (unlocked.warehouse && !st.trolley_attached) {
                callbacksRef.current.onWarehouseBlocked();
              }
            }
          } else if (
            !zBlockedByEclssLock &&
            !zBlockedByMedBayLock &&
            isInsideOutpostFootprint(camera.position.x, nextZ) &&
            !hitsCollider(camera.position.x, nextZ, outpostRefs.colliders) &&
            !hitsCollider(camera.position.x, nextZ, outpostRefs.playerOnlyColliders)
          ) {
            camera.position.z = nextZ;
            playerWalking = true;
          }

          if (playerWalking) {
            stepTimer += dt;
            if (stepTimer >= 0.36) {
              stepTimer = 0;
              stepCount += 1;
              soundEngine.playFootstep(stepCount);
            }
            if (st.trolley_attached) {
              soundEngine.playTrolleyRoll();
            }
          }
        } else {
          stepTimer = 0.28;
        }

        camera.position.y = 1.65;
        _euler.set(pitch, yaw, 0, 'YXZ');
        camera.quaternion.setFromEuler(_euler);

        const zId = detectZone(camera.position.x, camera.position.z);
        if (zId !== lastObservedZone) {
          lastObservedZone = zId;
          callbacksRef.current.onZoneChange(zId);
        }

        let nextLockedReason: 'shift_unlock' | 'trolley' | undefined = undefined;
        if (!unlocked.eclss && camera.position.z >= 3.9 && camera.position.z <= 5.45 && Math.abs(camera.position.x) < 2.3) {
          nextLockedReason = 'shift_unlock';
        } else if (!unlocked.greenhouse && camera.position.x >= 3.9 && camera.position.x <= 5.45 && Math.abs(camera.position.z) < 2.3) {
          nextLockedReason = 'shift_unlock';
        } else if (!unlocked.med_bay && Math.hypot(camera.position.x - (-1.82), camera.position.z - 15.05) < 2.25) {
          nextLockedReason = 'shift_unlock';
        } else if (camera.position.z > 19.15 && camera.position.z <= 20.35 && Math.abs(camera.position.x) < 2.4) {
          if (!unlocked.warehouse) {
            nextLockedReason = 'shift_unlock';
          } else if (!st.trolley_attached) {
            nextLockedReason = 'trolley';
          }
        }
        const nearLocked = nextLockedReason !== undefined;
        if (nearLocked !== lastNearLockedDoor || nextLockedReason !== lastLockedReason) {
          lastNearLockedDoor = nearLocked;
          lastLockedReason = nextLockedReason;
          callbacksRef.current.onNearLockedDoorChange(nearLocked, nextLockedReason);
        }

        // Center-screen raycast (~15Hz) onto interactive layer 1
        raycastAccumulator += dt;
        if (raycastAccumulator >= 0.065) {
          raycastAccumulator = 0;
          _raycaster.layers.set(1);
          _raycaster.far = 4.6;
          _raycaster.setFromCamera(_screenCenter, camera);
          const hits = _raycaster.intersectObjects(interactiveMeshes, false);

          let nextHover: HoveredInteractable | null = null;
          for (let hi = 0; hi < hits.length; hi++) {
            const hitId = hits[hi].object.userData.targetId as string;
            const info = outpostRefs.interactiveTargets.find((t) => t.id === hitId);
            if (!info) continue;
            // Post-Tutorial Rule: Commander NPC has ZERO interaction after tutorial completes
            if (info.kind === 'commander_npc' && st.tutorial_completed) continue;
            const isShiftMatch =
              !st.handover_to_shift &&
              info.kind === 'shift_trigger' &&
              Boolean(info.shiftNumbers?.includes(st.shift));
            const resolvedLabel = getLocalizedTargetLabel(info.id, st.shift, currentLang);
            nextHover = {
              kind: info.kind,
              id: info.id,
              zone: info.zone,
              label: resolvedLabel,
              isCurrentShiftTrigger: isShiftMatch,
            };
            break;
          }

          if (
            nextHover?.id !== currentHovered?.id ||
            nextHover?.label !== currentHovered?.label ||
            nextHover?.isCurrentShiftTrigger !== currentHovered?.isCurrentShiftTrigger
          ) {
            currentHovered = nextHover;
            callbacksRef.current.onHoverTarget(nextHover);
          }
        }
      } else if (lastNearLockedDoor && st.phase !== 'playing') {
        lastNearLockedDoor = false;
        lastLockedReason = undefined;
        callbacksRef.current.onNearLockedDoorChange(false, undefined);
      }

      syncOutpostWithGameState(
        outpostRefs,
        st,
        elapsed,
        dt,
        scene,
        camera.position,
        currentLang,
        pausedRef.current,
        (nextStates, _aid, opened) => {
          if (st.phase === 'playing') {
            soundEngine.playAirlockSlide(opened);
          }
          callbacksRef.current.onAirlocksChange(nextStates);
        },
      );

      viewmodel.root.visible = st.phase === 'playing';
      animateFirstPersonViewmodel(
        viewmodel,
        st,
        camera.position.x,
        camera.position.z,
        {
          dt,
          elapsed,
          isWalking: playerWalking,
          dataPadActive: dataPadRaisedRef.current,
          isPaused: pausedRef.current,
        },
      );

      // Update 2D Radar Mini-Map via direct DOM/SVG ref callback (20Hz normal, 10Hz on Low tier)
      radarTimer += dt;
      if (radarTimer >= radarInterval) {
        radarTimer = 0;
        callbacksRef.current.onRadarTelemetry({
          playerX: camera.position.x,
          playerZ: camera.position.z,
          playerYaw: yaw,
          samX: outpostRefs.samRig.root.position.x,
          samZ: outpostRefs.samRig.root.position.z,
          mayaX: outpostRefs.mayaRig.root.position.x,
          mayaZ: outpostRefs.mayaRig.root.position.z,
        });
      }

      renderer.render(scene, camera);

      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = requestAnimationFrame(tick);
      }
    }

    if (isSoftwareGl) {
      frameId = window.setTimeout(tick, 16);
    } else {
      frameId = requestAnimationFrame(tick);
    }

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('pointerlockchange', handlePointerLockChange);
      renderer.domElement.removeEventListener('click', handleCanvasClick);
      window.removeEventListener('mousemove', handleMouseMove);
      if (document.pointerLockElement === renderer.domElement) {
        try {
          document.exitPointerLock();
        } catch {
          // ignore
        }
      }
      canvasRef.current = null;
      viewmodel.dispose();
      outpostRefs.dispose();
      textures.dispose();
      envRT.dispose();
      renderer.dispose();
      if (renderer.domElement.parentElement === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="fixed inset-0 w-full h-full overflow-hidden bg-[#101828]"
      aria-label="3D Lunar Outpost Viewport"
    />
  );
};
