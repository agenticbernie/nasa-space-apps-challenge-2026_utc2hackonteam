import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  BatteryCharging,
  Compass,
  Clock,
  Lock,
  PackageCheck,
  Radar,
  RotateCcw,
  ShieldAlert,
  Unlock,
  Wrench,
  X,
} from 'lucide-react';
import { soundEngine } from '../audio/soundEngine';
import { getUiCopy } from '../engine/i18n';
import { SUPPLY_ITEMS_META } from '../engine/nasaData';
import { EVA_SECTORS_META } from '../engine/questAndAchievements';
import { getRepairProcedureForShift } from '../engine/simulationEngine';
import {
  EvaSectorId,
  GameState,
  Language,
  ShiftNumber,
  SupplyInventory,
  SupplyItemId,
} from '../engine/types';

interface RoverControlModalProps {
  gameState: GameState;
  lang: Language;
  onCompleteHaul: (collected: Partial<SupplyInventory>) => void;
  onUpgradeRadar: () => void;
  onUnlockSector: (sectorId: EvaSectorId) => void;
  onTriggerBreakdown: () => void;
  onRepairRover: () => void;
  onClose: () => void;
}

interface CraterHazard {
  x: number;
  y: number;
  r: number;
}

interface RadZone {
  x: number;
  y: number;
  r: number;
  phase: number;
}

interface SalvageNode {
  id: string;
  sector: 'base' | EvaSectorId;
  item: SupplyItemId;
  x: number;
  y: number;
  collected: boolean;
  sourceName: string;
}

interface SectorBounds {
  id: EvaSectorId;
  x: number;
  y: number;
  w: number;
  h: number;
  stroke: string;
  fill: string;
}

const ARENA_W = 560;
const ARENA_H = 300;

const SECTOR_ZONES: SectorBounds[] = [
  {
    id: 'sector_easy',
    x: 112,
    y: 12,
    w: 145,
    h: 276,
    stroke: '#6BAF83',
    fill: 'rgba(107, 175, 131, 0.08)',
  },
  {
    id: 'sector_medium',
    x: 263,
    y: 12,
    w: 142,
    h: 276,
    stroke: '#F0B85D',
    fill: 'rgba(240, 184, 93, 0.08)',
  },
  {
    id: 'sector_hard',
    x: 411,
    y: 12,
    w: 138,
    h: 276,
    stroke: '#ef4444',
    fill: 'rgba(239, 68, 68, 0.08)',
  },
];

function getSectorAt(x: number): 'base' | EvaSectorId {
  if (x < 112) return 'base';
  if (x < 260) return 'sector_easy';
  if (x < 408) return 'sector_medium';
  return 'sector_hard';
}

function createSurfaceMission(shift: ShiftNumber, runSeed: number): {
  craters: CraterHazard[];
  radZones: RadZone[];
  nodes: SalvageNode[];
} {
  const proc = getRepairProcedureForShift(shift);
  const priorityItem: SupplyItemId = proc ? proc.requiredPart : 'med_kit';
  const offset = (runSeed % 3) * 14;

  const craters: CraterHazard[] = [
    { x: 165, y: 95 + (runSeed % 2) * 18, r: 24 },
    { x: 292, y: 210 - (runSeed % 2) * 14, r: 28 },
    { x: 375, y: 96 + offset * 0.5, r: 22 },
    { x: 215, y: 245, r: 19 },
    { x: 470, y: 220, r: 23 },
  ];

  const radZones: RadZone[] = [
    { x: 318, y: 128, r: 30, phase: 0 },
    { x: 446, y: 155, r: 34, phase: 1.5 },
    { x: 502, y: 82, r: 28, phase: 3.1 },
  ];

  const nodes: SalvageNode[] = [
    // Free immediate zone outside Dock (always reachable)
    {
      id: 'node-base-scrap',
      sector: 'base',
      item: 'scrap_metal',
      x: 92,
      y: 78 + offset * 0.6,
      collected: false,
      sourceName: 'Aurora Debris Pile',
    },
    {
      id: 'node-base-priority',
      sector: 'base',
      item: priorityItem,
      x: 94,
      y: 230 - offset * 0.4,
      collected: false,
      sourceName: 'Shuttle Strut Cache',
    },
    // Sector Easy: Crater Rim
    {
      id: 'node-easy-scrap',
      sector: 'sector_easy',
      item: 'scrap_metal',
      x: 158 + offset * 0.5,
      y: 48,
      collected: false,
      sourceName: 'Surveyor-7 Hull',
    },
    {
      id: 'node-easy-elec',
      sector: 'sector_easy',
      item: 'electronic_parts',
      x: 228,
      y: 152,
      collected: false,
      sourceName: 'LCROSS Sensor Probe',
    },
    {
      id: 'node-easy-priority',
      sector: 'sector_easy',
      item: priorityItem,
      x: 160,
      y: 245,
      collected: false,
      sourceName: 'Artemis Crate A',
    },
    // Sector Medium: Regolith Trench
    {
      id: 'node-med-elec',
      sector: 'sector_medium',
      item: 'electronic_parts',
      x: 332,
      y: 54,
      collected: false,
      sourceName: 'Ranger Relay Board',
    },
    {
      id: 'node-med-hepa',
      sector: 'sector_medium',
      item: 'hepa_filter',
      x: 368,
      y: 242,
      collected: false,
      sourceName: 'Hab Lander Lock',
    },
    {
      id: 'node-med-kit',
      sector: 'sector_medium',
      item: 'med_kit',
      x: 286,
      y: 148,
      collected: false,
      sourceName: 'Apollo Med Pod',
    },
    // Sector Hard: Eternal Shadow Fault
    {
      id: 'node-hard-ki',
      sector: 'sector_hard',
      item: 'ki_pills',
      x: 452,
      y: 62,
      collected: false,
      sourceName: 'CRaTER Vault',
    },
    {
      id: 'node-hard-priority',
      sector: 'sector_hard',
      item: priorityItem,
      x: 518,
      y: 168,
      collected: false,
      sourceName: 'Starship Recon Pod',
    },
    {
      id: 'node-hard-scrap',
      sector: 'sector_hard',
      item: 'scrap_metal',
      x: 492,
      y: 256,
      collected: false,
      sourceName: 'VIPER Chassis',
    },
  ];

  return { craters, radZones, nodes };
}

export const RoverControlModal: React.FC<RoverControlModalProps> = ({
  gameState,
  lang,
  onCompleteHaul,
  onUpgradeRadar,
  onUnlockSector,
  onTriggerBreakdown,
  onRepairRover,
  onClose,
}) => {
  const copy = getUiCopy(lang);
  const en = lang === 'en';
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fogCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const proc = getRepairProcedureForShift(gameState.shift);
  const requiredPart: SupplyItemId | null =
    gameState.quest_salvage_target_item ?? (proc ? proc.requiredPart : null);

  const [runNonce, setRunNonce] = useState(0);
  const [shield, setShield] = useState(100);
  const [collected, setCollected] = useState<Partial<SupplyInventory>>({});
  const [statusNote, setStatusNote] = useState<string>('');
  const [nowMs, setNowMs] = useState(() => Date.now());

  const cooldownSecsLeft = Math.max(
    0,
    Math.ceil((gameState.rover_cooldown_until - nowMs) / 1000),
  );
  const isRoverDisabled = cooldownSecsLeft > 0 || gameState.rover_needs_maintenance;

  const roverRef = useRef({ x: 54, y: ARENA_H / 2, angle: 0 });
  const clickTargetRef = useRef<{ x: number; y: number } | null>(null);
  const keysRef = useRef<Record<string, boolean>>({});
  const missionRef = useRef(createSurfaceMission(gameState.shift, 0));
  const shieldRef = useRef(100);
  const collectedRef = useRef<Partial<SupplyInventory>>({});
  const hitCooldownRef = useRef(0);
  const scannedNodesRef = useRef<Set<string>>(new Set());
  const unlockedSectorsRef = useRef(gameState.unlocked_sectors);
  const radarLevelRef = useRef(gameState.eva_radar_level);
  const disabledRef = useRef(isRoverDisabled);
  const needsMaintenanceRef = useRef(gameState.rover_needs_maintenance);
  const onTriggerBreakdownRef = useRef(onTriggerBreakdown);

  useEffect(() => {
    const timer = window.setInterval(() => setNowMs(Date.now()), 250);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    unlockedSectorsRef.current = gameState.unlocked_sectors;
  }, [gameState.unlocked_sectors]);

  useEffect(() => {
    radarLevelRef.current = gameState.eva_radar_level;
  }, [gameState.eva_radar_level]);

  useEffect(() => {
    disabledRef.current = isRoverDisabled;
    if (isRoverDisabled) {
      clickTargetRef.current = null;
    }
  }, [isRoverDisabled]);

  useEffect(() => {
    needsMaintenanceRef.current = gameState.rover_needs_maintenance;
  }, [gameState.rover_needs_maintenance]);

  useEffect(() => {
    onTriggerBreakdownRef.current = onTriggerBreakdown;
  }, [onTriggerBreakdown]);

  const resetRun = useCallback(() => {
    const nextSeed = runNonce + 1;
    setRunNonce(nextSeed);
    missionRef.current = createSurfaceMission(gameState.shift, nextSeed);
    roverRef.current = { x: 54, y: ARENA_H / 2, angle: 0 };
    clickTargetRef.current = null;
    shieldRef.current = 100;
    collectedRef.current = {};
    scannedNodesRef.current.clear();
    setShield(100);
    setCollected({});
    setStatusNote('');
  }, [gameState.shift, runNonce]);

  useEffect(() => {
    missionRef.current = createSurfaceMission(gameState.shift, 0);
    roverRef.current = { x: 54, y: ARENA_H / 2, angle: 0 };
    clickTargetRef.current = null;
    shieldRef.current = 100;
    collectedRef.current = {};
    scannedNodesRef.current.clear();
    setShield(100);
    setCollected({});
    setStatusNote('');
  }, [gameState.shift]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'KeyW', 'KeyA', 'KeyS', 'KeyD'].includes(e.code)) {
        e.preventDefault();
        keysRef.current[e.code] = true;
        clickTargetRef.current = null; // manual drive cancels click waypoint
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      keysRef.current[e.code] = false;
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, []);

  const handleCanvasPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (disabledRef.current) {
      soundEngine.playBeep(260, 0.08, 'square', 0.05);
      setStatusNote(
        needsMaintenanceRef.current
          ? copy.roverBreakdownDesc
          : copy.roverCooldownBanner(cooldownSecsLeft),
      );
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = ARENA_W / rect.width;
    const scaleY = ARENA_H / rect.height;
    const tx = Math.max(20, Math.min(ARENA_W - 20, (e.clientX - rect.left) * scaleX));
    const ty = Math.max(20, Math.min(ARENA_H - 20, (e.clientY - rect.top) * scaleY));

    const targetSector = getSectorAt(tx);
    if (targetSector !== 'base' && !unlockedSectorsRef.current.includes(targetSector)) {
      const meta = EVA_SECTORS_META[targetSector];
      soundEngine.playBeep(300, 0.08, 'square', 0.05);
      setStatusNote(
        en
          ? `🔒 Unlock "${meta.nameEn}" on the right panel first (Radar Lv.${meta.minRadarLevel})!`
          : `🔒 Hãy mở khóa "${meta.nameVi}" ở bảng bên phải trước (Radar Lv.${meta.minRadarLevel})!`,
      );
      return;
    }

    soundEngine.playBeep(660, 0.04, 'triangle', 0.04);
    clickTargetRef.current = { x: tx, y: ty };
  };

  useEffect(() => {
    let rafId = 0;
    let lastTs = performance.now();

    if (!fogCanvasRef.current && typeof document !== 'undefined') {
      const fc = document.createElement('canvas');
      fc.width = ARENA_W;
      fc.height = ARENA_H;
      fogCanvasRef.current = fc;
    }

    const step = (now: number) => {
      const dt = Math.min(0.05, (now - lastTs) / 1000);
      lastTs = now;
      const elapsed = now / 1000;

      const keys = keysRef.current;
      let dx =
        (keys['KeyD'] || keys['ArrowRight'] ? 1 : 0) -
        (keys['KeyA'] || keys['ArrowLeft'] ? 1 : 0);
      let dy =
        (keys['KeyS'] || keys['ArrowDown'] ? 1 : 0) -
        (keys['KeyW'] || keys['ArrowUp'] ? 1 : 0);

      const rover = roverRef.current;

      if (disabledRef.current) {
        dx = 0;
        dy = 0;
        clickTargetRef.current = null;
      }

      // Click-to-move auto navigation when no keyboard input is held
      if (!disabledRef.current && dx === 0 && dy === 0 && clickTargetRef.current) {
        const tx = clickTargetRef.current.x - rover.x;
        const ty = clickTargetRef.current.y - rover.y;
        const dist = Math.hypot(tx, ty);
        if (dist < 6) {
          clickTargetRef.current = null;
        } else {
          dx = tx / dist;
          dy = ty / dist;
        }
      }

      if (!disabledRef.current && (dx !== 0 || dy !== 0)) {
        const len = Math.hypot(dx, dy);
        const speed = 158;
        let nx = Math.max(22, Math.min(ARENA_W - 22, rover.x + (dx / len) * speed * dt));
        let ny = Math.max(22, Math.min(ARENA_H - 22, rover.y + (dy / len) * speed * dt));

        // Block entry into locked outer sector boundary cleanly
        const maxAllowedX = unlockedSectorsRef.current.includes('sector_hard')
          ? ARENA_W - 22
          : unlockedSectorsRef.current.includes('sector_medium')
            ? 406
            : unlockedSectorsRef.current.includes('sector_easy')
              ? 258
              : 108;

        const nextSector = getSectorAt(nx);
        if (nextSector !== 'base' && !unlockedSectorsRef.current.includes(nextSector)) {
          if (nx > maxAllowedX && getSectorAt(rover.x) !== nextSector) {
            nx = rover.x;
          }
        }

        // Deflect cleanly around craters
        for (const cr of missionRef.current.craters) {
          const dist = Math.hypot(nx - cr.x, ny - cr.y);
          const minDist = cr.r + 12;
          if (dist < minDist && dist > 0.001) {
            nx = cr.x + ((nx - cr.x) / dist) * minDist;
            ny = cr.y + ((ny - cr.y) / dist) * minDist;
          }
        }
        rover.x = nx;
        rover.y = ny;
        rover.angle = Math.atan2(dy, dx);
        soundEngine.playRoverDrivePulse();
      }

      if (hitCooldownRef.current > 0) {
        hitCooldownRef.current = Math.max(0, hitCooldownRef.current - dt);
      }

      // Check radiation pockets -> touching red RAD zone causes instant Rover breakdown!
      let inRad = false;
      for (const rz of missionRef.current.radZones) {
        if (Math.hypot(rover.x - rz.x, rover.y - rz.y) < rz.r) {
          inRad = true;
          break;
        }
      }
      if (inRad && !needsMaintenanceRef.current && hitCooldownRef.current <= 0) {
        hitCooldownRef.current = 0.8;
        shieldRef.current = Math.max(10, shieldRef.current - 35);
        setShield(shieldRef.current);
        clickTargetRef.current = null;
        needsMaintenanceRef.current = true;
        disabledRef.current = true;
        soundEngine.playSparkError();
        setStatusNote(copy.roverBreakdownDesc);
        onTriggerBreakdownRef.current();
      }

      // Check salvage pickup & forward sonar ping when uncollected crate enters forward cone
      const activeLvl = radarLevelRef.current;
      const activeConeLen = activeLvl === 1 ? 148 : activeLvl === 2 ? 210 : 285;
      const activeHalfSpread = activeLvl === 1 ? 0.44 : activeLvl === 2 ? 0.56 : 0.68;

      for (const node of missionRef.current.nodes) {
        if (node.collected) continue;
        const sectorOpen = node.sector === 'base' || unlockedSectorsRef.current.includes(node.sector);
        if (!sectorOpen) continue;
        const dist = Math.hypot(rover.x - node.x, rover.y - node.y);
        if (dist < 24) {
          node.collected = true;
          const nextMap = { ...collectedRef.current };
          nextMap[node.item] = (nextMap[node.item] ?? 0) + 1;
          collectedRef.current = nextMap;
          setCollected(nextMap);
          soundEngine.playRoverPickup();
          const meta = SUPPLY_ITEMS_META[node.item];
          setStatusNote(
            en
              ? `✅ Salvaged ${meta.icon} ${meta.nameEn} from ${node.sourceName}!`
              : `✅ Đã thu hồi ${meta.icon} ${meta.nameVi} từ ${node.sourceName}!`,
          );
        } else if (dist <= activeConeLen && !scannedNodesRef.current.has(node.id)) {
          const bearing = Math.atan2(node.y - rover.y, node.x - rover.x);
          let diff = bearing - rover.angle;
          while (diff > Math.PI) diff -= Math.PI * 2;
          while (diff < -Math.PI) diff += Math.PI * 2;
          if (Math.abs(diff) <= activeHalfSpread) {
            scannedNodesRef.current.add(node.id);
            soundEngine.playRoverScanPing();
          }
        }
      }

      // Render 2D Radar / Surface Canvas + Fog of War
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#09111e';
        ctx.fillRect(0, 0, ARENA_W, ARENA_H);

        // Tactical radar grid
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.12)';
        ctx.lineWidth = 1;
        for (let gx = 40; gx < ARENA_W; gx += 40) {
          ctx.beginPath();
          ctx.moveTo(gx, 0);
          ctx.lineTo(gx, ARENA_H);
          ctx.stroke();
        }
        for (let gy = 40; gy < ARENA_H; gy += 40) {
          ctx.beginPath();
          ctx.moveTo(0, gy);
          ctx.lineTo(ARENA_W, gy);
          ctx.stroke();
        }

        // Draw 3 Outer Sector Zones
        for (const sz of SECTOR_ZONES) {
          const isOpen = unlockedSectorsRef.current.includes(sz.id);
          ctx.fillStyle = isOpen ? sz.fill : 'rgba(15, 23, 42, 0.45)';
          ctx.fillRect(sz.x, sz.y, sz.w, sz.h);
          ctx.strokeStyle = isOpen ? sz.stroke : 'rgba(148, 163, 184, 0.35)';
          ctx.setLineDash(isOpen ? [] : [5, 4]);
          ctx.lineWidth = 1.5;
          ctx.strokeRect(sz.x, sz.y, sz.w, sz.h);
          ctx.setLineDash([]);
          ctx.fillStyle = isOpen ? sz.stroke : '#64748b';
          ctx.font = 'bold 9px monospace';
          const shortLbl =
            sz.id === 'sector_easy'
              ? 'SECTOR I · EASY'
              : sz.id === 'sector_medium'
                ? 'SECTOR II · MED'
                : 'SECTOR III · HARD';
          ctx.fillText(isOpen ? shortLbl : `🔒 ${shortLbl}`, sz.x + 6, 24);
        }

        // Aurora Base Dock zone on left
        ctx.fillStyle = 'rgba(56, 189, 248, 0.16)';
        ctx.strokeStyle = '#38bdf8';
        ctx.fillRect(10, ARENA_H / 2 - 42, 66, 84);
        ctx.strokeRect(10, ARENA_H / 2 - 42, 66, 84);
        ctx.fillStyle = '#bae6fd';
        ctx.font = 'bold 10px monospace';
        ctx.fillText('AURORA', 20, ARENA_H / 2 - 24);
        ctx.fillText('DOCK', 26, ARENA_H / 2 + 32);

        // Radiation pockets
        for (const rz of missionRef.current.radZones) {
          const pulse = 0.88 + Math.sin(elapsed * 4 + rz.phase) * 0.12;
          ctx.beginPath();
          ctx.arc(rz.x, rz.y, rz.r * pulse, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(239, 68, 68, 0.22)';
          ctx.fill();
          ctx.strokeStyle = 'rgba(248, 113, 113, 0.75)';
          ctx.lineWidth = 1.5;
          ctx.stroke();
          ctx.fillStyle = '#fca5a5';
          ctx.font = 'bold 11px monospace';
          ctx.fillText('☢ RAD', rz.x - 18, rz.y + 4);
        }

        // Lunar Impact Craters
        for (const cr of missionRef.current.craters) {
          ctx.beginPath();
          ctx.arc(cr.x, cr.y, cr.r, 0, Math.PI * 2);
          ctx.fillStyle = '#1e293b';
          ctx.fill();
          ctx.strokeStyle = '#64748b';
          ctx.lineWidth = 3;
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(cr.x - 3, cr.y - 3, cr.r * 0.55, 0, Math.PI * 2);
          ctx.fillStyle = '#0f172a';
          ctx.fill();
        }

        // Salvage Crates
        for (const node of missionRef.current.nodes) {
          if (node.collected) continue;
          const isTarget = node.item === requiredPart;
          const pulse = isTarget ? 1 + Math.sin(elapsed * 6) * 0.15 : 1;
          ctx.save();
          ctx.translate(node.x, node.y);
          ctx.scale(pulse, pulse);
          ctx.fillStyle = isTarget ? 'rgba(242, 200, 121, 0.24)' : 'rgba(107, 175, 131, 0.18)';
          ctx.beginPath();
          ctx.arc(0, 0, 16, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = isTarget ? '#f2c879' : '#6baf83';
          ctx.fillRect(-9, -9, 18, 18);
          ctx.strokeStyle = '#0f172a';
          ctx.lineWidth = 2;
          ctx.strokeRect(-9, -9, 18, 18);
          ctx.restore();
          ctx.fillStyle = '#f8fafc';
          ctx.font = '12px sans-serif';
          ctx.fillText(SUPPLY_ITEMS_META[node.item].icon, node.x - 7, node.y + 4);
          if (isTarget) {
            ctx.fillStyle = '#fde68a';
            ctx.font = 'bold 9px monospace';
            ctx.fillText('NEEDED', node.x - 17, node.y - 15);
          }
        }

        // Pure Forward-Facing Directional Headlight Fog-of-War (behind rover remains pitch black)
        const fogCanvas = fogCanvasRef.current;
        const fctx = fogCanvas?.getContext('2d');
        if (fogCanvas && fctx) {
          fctx.globalCompositeOperation = 'source-over';
          fctx.clearRect(0, 0, ARENA_W, ARENA_H);
          fctx.fillStyle = 'rgba(2, 6, 14, 0.94)';
          fctx.fillRect(0, 0, ARENA_W, ARENA_H);

          fctx.globalCompositeOperation = 'destination-out';

          // Subtle rover chassis glow so the vehicle icon itself stays legible
          const bodyGlow = fctx.createRadialGradient(rover.x, rover.y, 4, rover.x, rover.y, 22);
          bodyGlow.addColorStop(0, 'rgba(0,0,0,0.85)');
          bodyGlow.addColorStop(1, 'rgba(0,0,0,0)');
          fctx.fillStyle = bodyGlow;
          fctx.beginPath();
          fctx.arc(rover.x, rover.y, 22, 0, Math.PI * 2);
          fctx.fill();

          // Pure forward directional headlight cone aligned with rover.angle
          const lvl = radarLevelRef.current;
          const coneLen = lvl === 1 ? 148 : lvl === 2 ? 210 : 285;
          const halfSpread = lvl === 1 ? 0.44 : lvl === 2 ? 0.56 : 0.68;
          const coneGrad = fctx.createRadialGradient(
            rover.x,
            rover.y,
            10,
            rover.x,
            rover.y,
            coneLen,
          );
          coneGrad.addColorStop(0, 'rgba(0,0,0,1)');
          coneGrad.addColorStop(0.7, 'rgba(0,0,0,0.92)');
          coneGrad.addColorStop(1, 'rgba(0,0,0,0)');
          fctx.fillStyle = coneGrad;
          fctx.beginPath();
          fctx.moveTo(rover.x, rover.y);
          fctx.arc(
            rover.x,
            rover.y,
            coneLen,
            rover.angle - halfSpread,
            rover.angle + halfSpread,
          );
          fctx.closePath();
          fctx.fill();

          ctx.drawImage(fogCanvas, 0, 0);
        }

        // Click-to-Move Guidance Path & Waypoint Marker
        if (clickTargetRef.current) {
          ctx.save();
          ctx.strokeStyle = '#38bdf8';
          ctx.setLineDash([4, 4]);
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(rover.x, rover.y);
          ctx.lineTo(clickTargetRef.current.x, clickTargetRef.current.y);
          ctx.stroke();
          ctx.setLineDash([]);
          ctx.beginPath();
          ctx.arc(clickTargetRef.current.x, clickTargetRef.current.y, 7, 0, Math.PI * 2);
          ctx.strokeStyle = '#F2C879';
          ctx.stroke();
          ctx.restore();
        }

        // Lunar Rover Vehicle
        ctx.save();
        ctx.translate(rover.x, rover.y);
        ctx.rotate(rover.angle);
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(-12, -13, 8, 4);
        ctx.fillRect(4, -13, 8, 4);
        ctx.fillRect(-12, 9, 8, 4);
        ctx.fillRect(4, 9, 8, 4);
        ctx.fillStyle = needsMaintenanceRef.current ? '#ef4444' : '#38bdf8';
        ctx.fillRect(-12, -9, 24, 18);
        ctx.fillStyle = '#f2c879';
        ctx.fillRect(4, -5, 7, 10);
        if (!needsMaintenanceRef.current) {
          ctx.fillStyle = 'rgba(250, 204, 21, 0.24)';
          ctx.beginPath();
          ctx.moveTo(12, 0);
          ctx.lineTo(54, -22);
          ctx.lineTo(54, 22);
          ctx.closePath();
          ctx.fill();
        }
        ctx.restore();
      }

      rafId = requestAnimationFrame(step);
    };

    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, [copy.roverBreakdownDesc, en, requiredPart]);

  const holdDrive = (code: string, active: boolean) => {
    if (disabledRef.current) {
      keysRef.current[code] = false;
      return;
    }
    if (active) clickTargetRef.current = null;
    keysRef.current[code] = active;
  };

  const totalCollected = useMemo(
    () => (Object.values(collected) as number[]).reduce((acc, v) => acc + (v || 0), 0),
    [collected],
  );

  const handleDock = () => {
    if (totalCollected > 0) {
      soundEngine.playDecisionConfirm();
      onCompleteHaul(collected);
    }
    onClose();
  };

  const requiredMeta = requiredPart ? SUPPLY_ITEMS_META[requiredPart] : null;
  const hasRequiredAlready = requiredPart ? (gameState.inventory[requiredPart] ?? 0) > 0 : true;
  const collectedRequiredNow = requiredPart ? (collected[requiredPart] ?? 0) > 0 : false;

  const scrapOwned = gameState.inventory.scrap_metal ?? 0;
  const elecOwned = gameState.inventory.electronic_parts ?? 0;
  const radarCost =
    gameState.eva_radar_level === 1
      ? { scrap: 2, elec: 1 }
      : gameState.eva_radar_level === 2
        ? { scrap: 3, elec: 2 }
        : null;
  const canUpgradeRadar =
    radarCost !== null && scrapOwned >= radarCost.scrap && elecOwned >= radarCost.elec;

  const sectorIds: EvaSectorId[] = ['sector_easy', 'sector_medium', 'sector_hard'];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#060b14]/90 p-3 sm:p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-5xl max-h-[94vh] overflow-y-auto custom-scroll rounded-xl border-2 border-[#38bdf8]/60 bg-[#0d1626] p-4 sm:p-5 shadow-2xl">
        {/* Header */}
        <div className="mb-3 flex items-start justify-between gap-4 border-b border-[#1e293b] pb-3">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-[#38bdf8]">
              <Compass className="h-4 w-4" />
              <span>{copy.roverTitle}</span>
            </div>
            <p className="mt-1 text-xs text-slate-300">{copy.roverSubtitle}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-700 bg-slate-800/80 p-1.5 text-slate-300 hover:bg-slate-700 hover:text-white cursor-pointer"
            aria-label="Close Rover Console"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {/* Left: Interactive 2D Click-to-Move Lunar Surface & Forward-Cone Fog Map */}
          <div className="lg:col-span-2 space-y-2.5">
            {/* Cooldown or Breakdown / Periodic Maintenance Lockout Banners */}
            {cooldownSecsLeft > 0 && (
              <div className="rounded-lg border-2 border-[#38bdf8] bg-[#0c2340] px-3.5 py-2.5 text-xs sm:text-sm font-mono font-bold text-[#bae6fd] flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#F2C879] shrink-0" />
                <span>{copy.roverCooldownBanner(cooldownSecsLeft)}</span>
              </div>
            )}

            {gameState.rover_needs_maintenance && (
              <div className="rounded-lg border-2 border-[#ef4444] bg-[#450a0a]/90 p-3 space-y-2">
                <div className="text-xs sm:text-sm font-bold text-[#fecaca] flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-[#F2C879] shrink-0" />
                  <span>{copy.roverMaintenanceTitle}</span>
                </div>
                <p className="text-xs text-slate-200">
                  {gameState.rover_runs_since_maintenance >= 3
                    ? copy.roverMaintenanceDesc
                    : copy.roverBreakdownDesc}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playDecisionConfirm();
                    shieldRef.current = 100;
                    setShield(100);
                    setStatusNote('');
                    onRepairRover();
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold bg-[#F2C879] hover:bg-[#f7d794] text-[#101828] border border-[#fef3c7] cursor-pointer"
                >
                  <Wrench className="w-3.5 h-3.5" />
                  <span>{copy.roverRepairBtn(scrapOwned > 0)}</span>
                </button>
              </div>
            )}

            <div className="overflow-hidden rounded-lg border-2 border-[#38bdf8]/50 bg-[#09111e] cursor-crosshair relative">
              <canvas
                ref={canvasRef}
                width={ARENA_W}
                height={ARENA_H}
                onPointerDown={handleCanvasPointerDown}
                className="h-auto w-full block"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="text-xs text-slate-300">
                {en
                  ? `Forward headlight reveals only ahead · Runs until maintenance: ${gameState.rover_runs_since_maintenance}/3`
                  : `Đèn pha chỉ soi phía trước mũi xe · Chu kỳ bảo dưỡng: ${gameState.rover_runs_since_maintenance}/3 chuyến`}
              </div>
              <div className="flex items-center gap-1.5">
                {[
                  { code: 'ArrowLeft', label: '◀' },
                  { code: 'ArrowUp', label: '▲' },
                  { code: 'ArrowDown', label: '▼' },
                  { code: 'ArrowRight', label: '▶' },
                ].map((btn) => (
                  <button
                    key={btn.code}
                    type="button"
                    disabled={isRoverDisabled}
                    onMouseDown={() => holdDrive(btn.code, true)}
                    onMouseUp={() => holdDrive(btn.code, false)}
                    onMouseLeave={() => holdDrive(btn.code, false)}
                    onTouchStart={() => holdDrive(btn.code, true)}
                    onTouchEnd={() => holdDrive(btn.code, false)}
                    className={`rounded border px-3 py-1.5 text-xs font-bold ${
                      isRoverDisabled
                        ? 'border-slate-700 bg-slate-900 text-slate-600 cursor-not-allowed'
                        : 'border-slate-600 bg-slate-800 text-slate-100 hover:border-[#38bdf8] active:bg-[#0284c7] cursor-pointer'
                    }`}
                  >
                    {btn.label}
                  </button>
                ))}
              </div>
            </div>

            {statusNote && (
              <div className="rounded-lg border border-slate-700 bg-[#132036] px-3 py-1.5 text-xs font-medium text-[#f2c879]">
                {statusNote}
              </div>
            )}

            {/* 3 Outer Lunar Sectors Unlock Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
              {sectorIds.map((sid) => {
                const sm = EVA_SECTORS_META[sid];
                const isUnlocked = gameState.unlocked_sectors.includes(sid);
                const canAfford =
                  gameState.eva_radar_level >= sm.minRadarLevel &&
                  scrapOwned >= sm.scrapCost &&
                  elecOwned >= sm.elecCost;

                return (
                  <div
                    key={sid}
                    className={`rounded-lg border p-2.5 text-xs space-y-1.5 ${
                      isUnlocked
                        ? 'bg-[#112620] border-[#6BAF83]/70'
                        : 'bg-[#10192b] border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 font-bold text-white">
                      <span className="truncate">{en ? sm.nameEn : sm.nameVi}</span>
                      {isUnlocked ? (
                        <Unlock className="w-3.5 h-3.5 text-[#6BAF83] shrink-0" />
                      ) : (
                        <Lock className="w-3.5 h-3.5 text-[#F0B85D] shrink-0" />
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400 leading-snug">
                      {en ? sm.descEn : sm.descVi}
                    </p>
                    {!isUnlocked ? (
                      <button
                        type="button"
                        disabled={!canAfford}
                        onClick={() => {
                          soundEngine.playDecisionConfirm();
                          onUnlockSector(sid);
                        }}
                        className={`w-full py-1 px-2 text-[11px] font-mono font-bold border ${
                          canAfford
                            ? 'bg-[#F2C879] hover:bg-[#f7d794] text-[#101828] border-[#fef3c7] cursor-pointer'
                            : 'bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed'
                        }`}
                      >
                        {en ? 'Unlock' : 'Mở khóa'} (Radar {sm.minRadarLevel}, 🔩{sm.scrapCost}, 🔌{sm.elecCost})
                      </button>
                    ) : (
                      <div className="text-[11px] font-mono font-bold text-[#86efac]">
                        ✅ {en ? 'SECTOR OPEN' : 'ĐÃ MỞ KHU VỰC'}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Radar Upgrade, Shield, Target Part & Salvaged Cargo */}
          <div className="flex flex-col justify-between gap-3 rounded-lg border border-slate-700/80 bg-[#101c30] p-3.5">
            <div className="space-y-3">
              {/* Base Radar Upgrade Widget */}
              <div className="rounded-lg border border-[#38bdf8]/45 bg-[#0c182b] p-2.5 space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="flex items-center gap-1.5 font-bold text-[#38bdf8]">
                    <Radar className="w-4 h-4" />
                    {en ? 'BASE RADAR' : 'RADAR TRẠM'}
                  </span>
                  <span className="text-[#F2C879] font-bold">
                    Lv.{gameState.eva_radar_level}/3
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-300 tabular-nums">
                  <span>🔩 {en ? 'Scrap' : 'Phế liệu'}: {scrapOwned}</span>
                  <span>🔌 {en ? 'Elec' : 'Điện tử'}: {elecOwned}</span>
                </div>
                {radarCost ? (
                  <button
                    type="button"
                    disabled={!canUpgradeRadar}
                    onClick={() => {
                      soundEngine.playDecisionConfirm();
                      onUpgradeRadar();
                    }}
                    className={`w-full py-1.5 px-2.5 text-xs font-bold border ${
                      canUpgradeRadar
                        ? 'bg-[#38bdf8] hover:bg-[#7dd3fc] text-[#0b1324] border-[#e0f2fe] cursor-pointer'
                        : 'bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed'
                    }`}
                  >
                    {en ? `Upgrade Lv.${gameState.eva_radar_level + 1}` : `Nâng cấp Radar Lv.${gameState.eva_radar_level + 1}`} (🔩{radarCost.scrap} + 🔌{radarCost.elec})
                  </button>
                ) : (
                  <div className="text-[11px] font-mono font-bold text-[#6BAF83]">
                    ✅ {en ? 'MAX RADAR RANGE ACTIVE' : 'RADAR ĐÃ ĐẠT TẦM QUÉT TỐI ĐA'}
                  </div>
                )}
              </div>

              {/* Shield Bar */}
              <div>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1 font-semibold text-slate-200">
                    <ShieldAlert className="h-3.5 w-3.5 text-[#38bdf8]" />
                    {copy.roverShieldLabel}
                  </span>
                  <span className="font-mono font-bold tabular-nums text-[#38bdf8]">
                    {shield}%
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded bg-slate-800">
                  <div
                    className="h-full transition-all"
                    style={{
                      width: `${shield}%`,
                      backgroundColor: shield < 45 ? '#ef4444' : '#38bdf8',
                    }}
                  />
                </div>
              </div>

              {/* Priority Shift Part */}
              {requiredMeta && (
                <div className="rounded-lg border border-[#f2c879]/40 bg-[#182235] p-2.5">
                  <div className="text-[11px] font-mono uppercase tracking-wider text-[#f2c879]">
                    {copy.roverTargetLabel}
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-sm font-bold text-white">
                    <span className="text-lg">{requiredMeta.icon}</span>
                    <span>{en ? requiredMeta.nameEn : requiredMeta.nameVi}</span>
                  </div>
                  <div className="mt-1.5 text-[11px] font-semibold">
                    {hasRequiredAlready || collectedRequiredNow ? (
                      <span className="text-[#6baf83]">
                        ✅ {en ? 'Ready for Shift Repair!' : 'Đã đủ vật tư cho Ca này!'}
                      </span>
                    ) : (
                      <span className="text-amber-300">
                        ⏳ {en ? 'Steer to golden crate on map' : 'Lái tới thùng vàng trên bản đồ'}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Collected Cargo Bay */}
              <div className="rounded-lg border border-slate-700 bg-[#0c1524] p-2.5">
                <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider text-slate-300">
                  <PackageCheck className="h-3.5 w-3.5 text-[#6baf83]" />
                  <span>{copy.roverSalvagedLabel}</span>
                </div>
                {totalCollected === 0 ? (
                  <p className="text-xs text-slate-400">
                    {en ? 'Click terrain or press WASD to collect.' : 'Click bản đồ hoặc WASD để thu thập.'}
                  </p>
                ) : (
                  <div className="space-y-1">
                    {(Object.keys(collected) as SupplyItemId[]).map((itemId) => {
                      const qty = collected[itemId] ?? 0;
                      if (!qty) return null;
                      const meta = SUPPLY_ITEMS_META[itemId];
                      return (
                        <div
                          key={itemId}
                          className="flex items-center justify-between rounded bg-slate-800/80 px-2 py-1 text-xs"
                        >
                          <span className="text-slate-100">
                            {meta.icon} {en ? meta.nameEn : meta.nameVi}
                          </span>
                          <span className="font-mono font-bold tabular-nums text-[#6baf83]">
                            +{qty}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={handleDock}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#6baf83] px-3 py-2 text-xs font-bold text-slate-950 transition hover:bg-[#7fc798] cursor-pointer"
              >
                <BatteryCharging className="h-4 w-4" />
                <span>{copy.roverDockBtn}</span>
              </button>
              <button
                type="button"
                onClick={resetRun}
                className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-slate-600 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>{copy.roverResetBtn}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
