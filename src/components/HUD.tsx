import React, { useEffect, useState } from 'react';
import {
  Compass,
  Gauge,
  GitBranch,
  Globe,
  HeartPulse,
  Info,
  Pause,
  Radio,
  ShieldAlert,
  Snowflake,
  Trophy,
  Volume2,
  VolumeX,
  Wifi,
  WifiOff,
  Wind,
  X,
} from 'lucide-react';
import {
  getNpcName,
  getPrimaryShiftNpcLabel,
  getShiftTriggerMeta,
  isNpcAssignedToShift,
} from '../engine/dialogueData';
import { getUiCopy } from '../engine/i18n';
import {
  ACHIEVEMENTS_META,
  formatMissionClock,
  getSolFromShift,
  SHIFT_TIMELINE_META,
} from '../engine/questAndAchievements';
import { getRepairProcedureForShift, getUnlockedRoomFlags } from '../engine/simulationEngine';
import {
  AirlockState,
  GameState,
  HoveredInteractable,
  Language,
  PerformanceSettings,
  PerformanceTelemetry,
  QualityMode,
  RoomUnlockKey,
  ShiftNumber,
} from '../engine/types';
import { DataPadModal, DataPadTab } from './DataPadModal';
import { RadarMiniMap, RadarMiniMapHandle } from './RadarMiniMap';

export interface CommsBannerPayload {
  shift: number;
  message: string;
}

interface HUDProps {
  gameState: GameState;
  lang: Language;
  airlocks: AirlockState;
  isPaused: boolean;
  hoveredTarget: HoveredInteractable | null;
  hasModalOpen: boolean;
  infoOpen: boolean;
  dataPadTab: DataPadTab;
  commsBanner: CommsBannerPayload | null;
  pointerLocked: boolean;
  lockedDoorBannerActive: boolean;
  lockedDoorBannerReason?: 'shift_unlock' | 'trolley';
  newlyUnlockedRoom?: RoomUnlockKey | null;
  muted: boolean;
  volume: number;
  perfSettings: PerformanceSettings;
  perfTelemetry: PerformanceTelemetry;
  radarRef: React.RefObject<RadarMiniMapHandle | null>;
  onToggleInfo: () => void;
  onToggleMedicalProfile: () => void;
  onToggleProgressTree: () => void;
  onChangeDataPadTab: (tab: DataPadTab) => void;
  onDismissComms: () => void;
  onDismissAchievement: () => void;
  onTogglePause: () => void;
  onToggleLanguage: (lang: Language) => void;
  onUpdatePerfSettings: (next: PerformanceSettings) => void;
  onToggleMute: () => void;
  onVolumeChange: (nextVolume: number) => void;
  onOpenLog: () => void;
}

const ALL_SHIFTS: ShiftNumber[] = [1, 2, 3, 4, 5, 6, 7, 8, 9];

export const HUD: React.FC<HUDProps> = ({
  gameState,
  lang,
  airlocks,
  isPaused,
  hoveredTarget,
  hasModalOpen,
  infoOpen,
  dataPadTab,
  commsBanner,
  pointerLocked,
  lockedDoorBannerActive,
  lockedDoorBannerReason = 'trolley',
  newlyUnlockedRoom = null,
  muted,
  volume,
  perfSettings,
  perfTelemetry,
  radarRef,
  onToggleInfo,
  onToggleMedicalProfile,
  onToggleProgressTree,
  onChangeDataPadTab,
  onDismissComms,
  onDismissAchievement,
  onTogglePause,
  onToggleLanguage,
  onUpdatePerfSettings,
  onToggleMute,
  onVolumeChange,
  onOpenLog,
}) => {
  const [perfPanelOpen, setPerfPanelOpen] = useState(false);
  const t = getUiCopy(lang);
  const en = lang === 'en';
  const badgeIcon = t.startBadges[gameState.astronaut_badge]?.icon ?? '🚀';

  // Close performance popover cleanly if pointer locks
  useEffect(() => {
    if (pointerLocked && perfPanelOpen) {
      setPerfPanelOpen(false);
    }
  }, [pointerLocked, perfPanelOpen]);

  if (gameState.phase !== 'playing') return null;

  const activeTrigger = getShiftTriggerMeta(gameState.shift, lang);
  const primaryNpcLabel = getPrimaryShiftNpcLabel(gameState.shift, lang);

  const tierLabel = t.perfTierNames[perfTelemetry.activeTier];
  const modePrefix =
    perfSettings.qualityMode === 'auto'
      ? t.perfAutoLabel
      : perfSettings.qualityMode.toUpperCase();
  const perfChipTone =
    perfTelemetry.activeTier === 'low'
      ? 'border-[#F0B85D]/70 text-[#fde68a]'
      : 'border-[#6BAF83]/70 text-[#bbf7d0]';

  const repairProc = getRepairProcedureForShift(gameState.shift);
  const needsRoverPart =
    gameState.shift_mission_accepted &&
    repairProc !== null &&
    !gameState.repaired_shifts.includes(gameState.shift) &&
    (gameState.inventory[repairProc.requiredPart] ?? 0) === 0;

  // Timeline progress metrics (00:00 -> 72:00 across 3 Sols & 9 Shifts)
  const missionPct = Math.max(0, Math.min(100, (gameState.mission_hours / 72) * 100));
  const currentSol = getSolFromShift(gameState.shift);
  const clockStr = formatMissionClock(gameState.mission_hours);
  const recentAchMeta = gameState.recent_achievement
    ? ACHIEVEMENTS_META[gameState.recent_achievement]
    : null;

  // Determine crosshair tint and hover prompt based on target & quest acceptance
  let crosshairColor = '#FFFFFF';
  let hoverPromptText = '';
  let hoverPromptClasses = 'border-[#70B8D3] text-[#bae6fd]';

  if (hoveredTarget) {
    if (hoveredTarget.kind === 'supply_trolley') {
      crosshairColor = '#F2C879';
      hoverPromptText = gameState.trolley_attached
        ? t.promptParkTrolley
        : t.promptGrabTrolley;
      hoverPromptClasses = 'border-[#F2C879] text-[#F2C879]';
    } else if (hoveredTarget.kind === 'locked_door') {
      crosshairColor = '#F0B85D';
      hoverPromptText = t.promptTryLockedDoor(hoveredTarget.label);
      hoverPromptClasses = 'border-[#F0B85D] text-[#fde68a]';
    } else if (hoveredTarget.kind === 'npc') {
      const npcId = hoveredTarget.id === 'npc_maya' ? 'maya' : 'sam';
      const hasQuest =
        !gameState.shift_mission_accepted &&
        isNpcAssignedToShift(npcId, gameState.shift);
      if (hasQuest) {
        crosshairColor = '#F2C879';
        hoverPromptText = t.promptAcceptQuest(getNpcName(npcId, lang));
        hoverPromptClasses = 'border-[#ef4444] text-[#fecaca]';
      } else {
        crosshairColor = '#6BAF83';
        hoverPromptText = t.promptInteract(hoveredTarget.label);
        hoverPromptClasses = 'border-[#6BAF83] text-[#bbf7d0]';
      }
    } else if (
      hoveredTarget.kind === 'shift_trigger' &&
      hoveredTarget.isCurrentShiftTrigger
    ) {
      if (!gameState.shift_mission_accepted) {
        crosshairColor = '#F0B85D';
        hoverPromptText = t.promptLockedConsole(gameState.shift);
        hoverPromptClasses = 'border-[#F0B85D] text-[#fde68a]';
      } else {
        crosshairColor = '#F2C879';
        hoverPromptText = t.promptOpenShift(gameState.shift, hoveredTarget.label);
        hoverPromptClasses = 'border-[#F2C879] text-[#F2C879]';
      }
    } else if (hoveredTarget.kind === 'rover_console') {
      crosshairColor = gameState.eva_rover_unlocked ? '#38bdf8' : '#F0B85D';
      hoverPromptText = gameState.eva_rover_unlocked
        ? t.promptInteract(hoveredTarget.label)
        : `🔒 ${t.promptInteract(hoveredTarget.label)}`;
      hoverPromptClasses = gameState.eva_rover_unlocked
        ? 'border-[#38bdf8] text-[#bae6fd]'
        : 'border-[#F0B85D] text-[#fde68a]';
    } else if (hoveredTarget.kind === 'botany_lab') {
      crosshairColor = '#4ade80';
      hoverPromptText = t.promptInteract(hoveredTarget.label);
      hoverPromptClasses = 'border-[#6BAF83] text-[#bbf7d0]';
    } else if (hoveredTarget.kind === 'med_bay') {
      crosshairColor = '#fb7185';
      hoverPromptText = t.promptInteract(hoveredTarget.label);
      hoverPromptClasses = 'border-[#fb7185] text-[#fecdd3]';
    } else if (hoveredTarget.kind === 'chamber_info') {
      crosshairColor = '#70B8D3';
      hoverPromptText = t.promptInteract(hoveredTarget.label);
      hoverPromptClasses = 'border-[#70B8D3] text-[#bae6fd]';
    } else {
      crosshairColor = '#6BAF83';
      hoverPromptText = t.promptInteract(hoveredTarget.label);
      hoverPromptClasses = 'border-[#70B8D3] text-[#bae6fd]';
    }
  }

  return (
    <div className="fixed inset-0 z-20 pointer-events-none select-none">
      {/* Subtle CO2 Haze Overlay during CO2 warning */}
      {gameState.co2_haze_active && (
        <div
          className="absolute inset-0 bg-[#F0B85D]/10 border-4 border-[#F0B85D]/35"
          aria-hidden="true"
        />
      )}

      {/* Polar Night Freeze Rim Subtle Tint during Shifts 3 & 6 */}
      {(gameState.thermal_drop_active || gameState.shift === 3 || gameState.shift === 6) && (
        <div
          className="absolute inset-0 bg-[#0ea5e9]/5 border-2 border-[#38bdf8]/35"
          aria-hidden="true"
        />
      )}

      {/* Station-Wide Red Alert Screen Edge Pulse during Shift 8 Solar Particle Event */}
      {gameState.spe_active && (
        <div
          className="absolute inset-0 border-4 border-red-500/85 bg-red-950/12 animate-pulse"
          aria-hidden="true"
        />
      )}

      {/* FIXED TOP-MIDDLE 72-HOUR / 9-SHIFT / 3-SOL TIMELINE BAR */}
      <div className="fixed top-2 left-1/2 -translate-x-1/2 z-30 pointer-events-none hidden md:flex flex-col items-center w-[340px] lg:w-[400px]">
        <div className="w-full pixel-panel bg-[#0a1323]/95 border border-[#70B8D3]/70 px-3 py-1.5 space-y-1 shadow-[0_8px_24px_rgba(0,0,0,0.65)]">
          <div className="flex items-center justify-between text-[11px] font-mono tabular-nums">
            <span className="font-bold text-[#F2C879]">
              {en ? `SOL ${currentSol}/3` : `NGÀY ${currentSol}/3`} ·{' '}
              {en ? `SHIFT ${gameState.shift}/9` : `CA ${gameState.shift}/9`}
            </span>
            <span className="font-bold text-[#70B8D3]">
              ⏱ {clockStr} / 72:00
            </span>
          </div>

          {/* 9 Shift Segments + Hazard Milestone Markers */}
          <div className="relative h-4 bg-[#070d18] border border-slate-700 grid grid-cols-9 gap-px p-0.5">
            {ALL_SHIFTS.map((sNum) => {
              const meta = SHIFT_TIMELINE_META[sNum];
              const done = gameState.decisions.some((d) => d.shift === sNum);
              const active = gameState.shift === sNum && !done;
              const hazardIcon =
                meta.hazardKind === 'thermal_drop'
                  ? '❄️'
                  : meta.hazardKind === 'dust_storm'
                    ? '🌪️'
                    : meta.hazardKind === 'radiation_storm'
                      ? '☢️'
                      : meta.hazardKind === 'hls_landing'
                        ? '🚀'
                        : null;
              return (
                <div
                  key={sNum}
                  className={`relative flex items-center justify-center text-[8px] font-mono font-bold ${
                    done
                      ? 'bg-[#6BAF83]/85 text-[#09131f]'
                      : active
                        ? 'bg-[#F2C879]/90 text-[#101828]'
                        : 'bg-[#162235] text-slate-400'
                  }`}
                >
                  {hazardIcon ? <span>{hazardIcon}</span> : <span>{sNum}</span>}
                </div>
              );
            })}
            {/* Live needle indicator */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_6px_#fff]"
              style={{ left: `${missionPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Center-Screen Achievement Honor Modal (Manual Close via X Button Only) */}
      {recentAchMeta && (
        <div className="pointer-events-auto fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#050912]/80">
          <div className="pixel-panel-warm max-w-md w-full bg-[#0c1629] border-2 border-[#F2C879] p-6 shadow-2xl text-center space-y-4 relative">
            <button
              type="button"
              onClick={onDismissAchievement}
              className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center bg-[#dc2626] hover:bg-[#ef4444] border-2 border-[#fecaca] text-white cursor-pointer"
              aria-label={t.achievementCloseBtn}
            >
              <X className="w-4 h-4 stroke-[3]" />
            </button>

            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#2a210f] border border-[#F2C879] text-xs font-mono font-bold uppercase tracking-wider text-[#F2C879]">
              <Trophy className="w-4 h-4" />
              <span>{t.achievementModalHeader}</span>
            </div>

            <div className="w-20 h-20 mx-auto rounded-full bg-[#152238] border-2 border-[#F2C879] flex items-center justify-center text-4xl shadow-[0_0_25px_rgba(242,200,121,0.35)]">
              {recentAchMeta.icon}
            </div>

            <div className="space-y-1.5">
              <h3 className="text-xl font-bold text-white">
                {en ? recentAchMeta.titleEn : recentAchMeta.titleVi}
              </h3>
              <p className="text-sm text-slate-200 leading-relaxed">
                {en ? recentAchMeta.descEn : recentAchMeta.descVi}
              </p>
            </div>

            {gameState.astronaut_callsign && (
              <div className="text-xs font-mono text-[#70B8D3]">
                {badgeIcon} {en ? 'Awarded to:' : 'Vinh danh Phi hành gia:'}{' '}
                <span className="font-bold text-[#F2C879]">{gameState.astronaut_callsign}</span>
              </div>
            )}

            <button
              type="button"
              onClick={onDismissAchievement}
              className="w-full py-2.5 px-5 font-bold text-[#101828] bg-[#F2C879] hover:bg-[#f7d794] border-2 border-[#fef3c7] shadow-[0_4px_0_#926c2a] cursor-pointer"
            >
              {t.achievementCloseBtn}
            </button>
          </div>
        </div>
      )}

      {/* Incoming Comms Message Banner (positioned neatly below Top-Middle Timeline) */}
      {commsBanner && !hasModalOpen && (
        <div className="pointer-events-auto fixed top-20 left-1/2 -translate-x-1/2 z-30 w-[92vw] max-w-md pixel-panel bg-[#0c192e]/95 border-2 border-[#70B8D3] px-3.5 py-2.5 shadow-[0_10px_30px_rgba(0,0,0,0.65)] transition-all duration-300">
          <div className="flex items-start justify-between gap-2.5">
            <div className="flex items-start gap-2 min-w-0">
              <Radio className="w-4 h-4 text-[#70B8D3] shrink-0 mt-0.5" />
              <div className="min-w-0">
                <div className="text-[11px] font-mono font-bold text-[#70B8D3] tracking-wider">
                  {t.commsTitle}
                </div>
                <p className="text-xs sm:text-sm font-semibold text-white leading-snug">
                  {commsBanner.message}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onDismissComms}
              aria-label="Dismiss Comms"
              className="p-1 text-slate-400 hover:text-white cursor-pointer shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* TOP BAR (LEFT STACK + RIGHT TOOLBAR/RADAR) */}
      <div className="flex items-start justify-between gap-2 p-3 sm:p-4">
        {/* Top-Left: Mission Objective + Real-Time NASA ECLSS Strip */}
        <div className="flex flex-col gap-1.5 max-w-[46vw] sm:max-w-[310px]">
          <div className="pixel-panel px-3 py-2 space-y-1">
            <div className="flex items-center justify-between gap-2 text-[11px] font-mono uppercase tracking-wider">
              <span className="px-1.5 py-0.5 font-bold bg-[#F2C879] text-[#101828]">
                {t.shiftBadgeLabel(gameState.shift)}
              </span>
              {gameState.astronaut_callsign && (
                <span className="text-[#bae6fd] truncate font-bold">
                  {badgeIcon} {gameState.astronaut_callsign}
                </span>
              )}
            </div>
            <div className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-[#70B8D3] shrink-0" />
              <span className="truncate">{t.zones[gameState.current_zone]}</span>
            </div>
            <div
              className={`text-[11px] font-mono pt-0.5 border-t border-slate-700/80 ${
                !gameState.shift_mission_accepted ? 'text-[#fca5a5]' : 'text-[#F2C879]'
              }`}
            >
              {!gameState.shift_mission_accepted
                ? `❗ ${t.meetNpcAction(primaryNpcLabel)}`
                : gameState.quest_failed_parts_needed
                  ? `🛸 ${en ? 'Salvage spare part on EVA Map' : 'Tìm linh kiện trên bản đồ EVA'}`
                  : needsRoverPart
                    ? `🛸 ${en ? 'Drive EVA Rover for part' : 'Lái EVA Rover lấy linh kiện'} → ${activeTrigger.label}`
                    : `📍 ${t.goToConsoleAction(activeTrigger.label)}`}
            </div>
          </div>

          {gameState.trolley_attached && (
            <div className="bg-[#2a210f]/95 border border-[#F2C879] px-2.5 py-1 text-[11px] font-mono font-bold text-[#fef3c7]">
              {t.trolleyAttachedBadge}
            </div>
          )}

          {/* Real-Time NASA ECLSS Compact Strip */}
          <div className="pixel-panel bg-[#0a1322]/94 px-2.5 py-1.5 grid grid-cols-3 gap-x-2 gap-y-1 text-[10px] font-mono tabular-nums">
            <span className={gameState.eclss.o2_kpa < 19.5 ? 'text-[#fca5a5] font-bold' : 'text-[#bae6fd]'}>
              O₂ {gameState.eclss.o2_kpa.toFixed(1)}kPa
            </span>
            <span className={gameState.eclss.water_l_day < 2.2 ? 'text-[#fde68a] font-bold' : 'text-[#70B8D3]'}>
              H₂O {gameState.eclss.water_l_day.toFixed(1)}L
            </span>
            <span className={gameState.eclss.calories_kcal < 2200 ? 'text-[#fde68a] font-bold' : 'text-[#86efac]'}>
              {Math.round(gameState.eclss.calories_kcal)}kcal
            </span>
            <span className={gameState.eclss.radiation_msv > 40 ? 'text-[#fca5a5] font-bold' : 'text-[#F2C879]'}>
              ☢️ {gameState.eclss.radiation_msv.toFixed(1)}mSv
            </span>
            <span className={gameState.eclss.body_temp_c < 36.2 ? 'text-[#93c5fd] font-bold' : 'text-slate-200'}>
              🌡️ {gameState.eclss.body_temp_c.toFixed(1)}°C
            </span>
            <span className="text-[#F2C879]">
              ⚡ {gameState.solar_supply}+{gameState.battery}
            </span>
          </div>

          {/* Mobile Compact Timeline Badge */}
          <div className="md:hidden pixel-panel bg-[#0a1323]/95 px-2.5 py-1 text-[10px] font-mono font-bold text-[#70B8D3] flex items-center justify-between tabular-nums">
            <span>SOL {currentSol}/3 · {gameState.shift}/9</span>
            <span className="text-[#F2C879]">⏱ {clockStr} / 72:00</span>
          </div>

          {(gameState.active_ailments.length > 0 || gameState.crew_health < 90) && (
            <div
              className={`px-3 py-1 border text-xs font-mono font-bold flex items-center justify-between gap-2 tabular-nums ${
                gameState.crew_health < 60 || gameState.active_ailments.length > 0
                  ? 'bg-[#450a0a]/95 border-[#D76562] text-[#fecaca]'
                  : 'bg-[#101828]/95 border-[#6BAF83]/70 text-[#bbf7d0]'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <HeartPulse className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                {t.statHealth} {Math.round(gameState.crew_health)}/100
              </span>
              <span>
                {gameState.active_ailments.length > 0
                  ? t.ailmentsActive(gameState.active_ailments.length)
                  : t.healthyTag}
              </span>
            </div>
          )}

          {(gameState.thermal_drop_active || gameState.shift === 3 || gameState.shift === 6) && (
            <div className="bg-[#0c2747] border border-[#38bdf8] px-2.5 py-1 text-[11px] font-mono font-bold text-[#bae6fd] flex items-center gap-1.5">
              <Snowflake className="w-3.5 h-3.5 text-[#38bdf8] shrink-0" />
              <span className="truncate">{t.thermalAlert}</span>
            </div>
          )}

          {(gameState.dust_storm_active || gameState.shift === 5) && (
            <div className="bg-[#45240d] border border-[#F0B85D] px-2.5 py-1 text-[11px] font-mono font-bold text-[#fde68a] flex items-center gap-1.5">
              <Wind className="w-3.5 h-3.5 text-[#F0B85D] shrink-0" />
              <span className="truncate">{t.dustAlert}</span>
            </div>
          )}

          {gameState.spe_active && (
            <div className="bg-[#7f1d1d] border-2 border-[#ef4444] px-3 py-1.5 text-xs font-mono font-bold text-white flex items-center gap-1.5 shadow-[0_0_20px_rgba(239,68,68,0.55)] animate-pulse">
              <ShieldAlert className="w-4 h-4 text-[#fde047] shrink-0" />
              <span>{t.redAlertBanner}</span>
            </div>
          )}
        </div>

        {/* Top-Right: Compact Toolbar (VI|EN, Perf, Mute, (i) Data Pad, (⏸) Pause) + Radar Mini-Map */}
        <div className="shrink-0 flex flex-col items-end gap-2 relative">
          <div className="pointer-events-auto pixel-panel px-2 py-1.5 flex items-center gap-1.5">
            {/* Instant Bilingual Toggle */}
            <div className="inline-flex items-center bg-[#0f172a] border border-[#70B8D3]/50 p-0.5 text-[11px] font-mono">
              <Globe className="w-3 h-3 text-[#70B8D3] mx-1" />
              <button
                type="button"
                onClick={() => onToggleLanguage('vi')}
                className={`px-1.5 py-0.5 font-bold cursor-pointer ${
                  lang === 'vi' ? 'bg-[#F2C879] text-[#101828]' : 'text-slate-300 hover:text-white'
                }`}
              >
                VI
              </button>
              <button
                type="button"
                onClick={() => onToggleLanguage('en')}
                className={`px-1.5 py-0.5 font-bold cursor-pointer ${
                  lang === 'en' ? 'bg-[#F2C879] text-[#101828]' : 'text-slate-300 hover:text-white'
                }`}
              >
                EN
              </button>
            </div>

            {/* Adaptive FPS Chip */}
            <button
              type="button"
              onClick={() => setPerfPanelOpen((v) => !v)}
              className={`px-2 py-1 bg-[#0f172a] hover:bg-[#1e293b] border text-[11px] font-mono flex items-center gap-1 cursor-pointer tabular-nums ${perfChipTone}`}
              title={t.perfTitle}
            >
              <Gauge className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{modePrefix}:</span>
              <span>{perfTelemetry.fps}</span>
            </button>

            {/* Audio Mute & Volume Slider */}
            <div className="inline-flex items-center gap-1 bg-[#1e293b] border border-slate-600 px-1.5 py-1">
              <button
                type="button"
                onClick={onToggleMute}
                title={muted ? t.muteOn : t.muteOff}
                className="text-slate-200 hover:text-white cursor-pointer flex items-center justify-center"
              >
                {muted ? (
                  <VolumeX className="w-4 h-4 text-[#D76562]" />
                ) : (
                  <Volume2 className="w-4 h-4 text-[#6BAF83]" />
                )}
              </button>
              <input
                type="range"
                min={0}
                max={100}
                value={muted ? 0 : Math.round(volume * 100)}
                onChange={(e) => onVolumeChange(Number(e.target.value) / 100)}
                title={`${t.volumeLabel}: ${muted ? 0 : Math.round(volume * 100)}%`}
                aria-label={t.volumeLabel}
                className="hidden sm:block w-14 accent-[#6BAF83] cursor-pointer h-1.5"
              />
            </div>

            {/* Space iPad Toggle [Tab / I] */}
            <button
              type="button"
              onClick={onToggleInfo}
              title={t.infoButtonTip}
              aria-label={t.infoButtonTip}
              aria-expanded={infoOpen && dataPadTab === 'telemetry'}
              className={`w-7 h-7 rounded-full flex items-center justify-center border-2 transition-colors cursor-pointer ${
                infoOpen && dataPadTab !== 'tree' && dataPadTab !== 'medical'
                  ? 'bg-[#F2C879] border-[#fef3c7] text-[#101828]'
                  : 'bg-[#1e3a5f] hover:bg-[#2a4e7d] border-[#70B8D3] text-white'
              }`}
            >
              <Info className="w-4 h-4" />
            </button>

            {/* Personal Medical Profile Inside iPad [B] */}
            <button
              type="button"
              onClick={onToggleMedicalProfile}
              title={t.tabMedical}
              aria-label={t.tabMedical}
              aria-expanded={infoOpen && dataPadTab === 'medical'}
              className={`w-7 h-7 flex items-center justify-center border-2 transition-colors cursor-pointer ${
                infoOpen && dataPadTab === 'medical'
                  ? 'bg-[#fb7185] border-[#ffe4e6] text-[#101828]'
                  : 'bg-[#2a1420] hover:bg-[#3f1c2e] border-[#fb7185]/80 text-[#fecdd3]'
              }`}
            >
              <HeartPulse className="w-3.5 h-3.5" />
            </button>

            {/* Mission Progress Tree Inside iPad [L] */}
            <button
              type="button"
              onClick={onToggleProgressTree}
              title={t.progressTreeButtonTip}
              aria-label={t.progressTreeButtonTip}
              aria-expanded={infoOpen && dataPadTab === 'tree'}
              className={`w-7 h-7 flex items-center justify-center border-2 transition-colors cursor-pointer ${
                infoOpen && dataPadTab === 'tree'
                  ? 'bg-[#F2C879] border-[#fef3c7] text-[#101828]'
                  : 'bg-[#143026] hover:bg-[#1b4335] border-[#6BAF83] text-[#bbf7d0]'
              }`}
            >
              <GitBranch className="w-3.5 h-3.5" />
            </button>

            {/* Game Pause Button [P] */}
            <button
              type="button"
              onClick={onTogglePause}
              title={t.pauseButtonTip}
              aria-label={t.pauseButtonTip}
              aria-pressed={isPaused}
              className={`w-7 h-7 flex items-center justify-center border-2 transition-colors cursor-pointer ${
                isPaused
                  ? 'bg-[#F2C879] border-[#fef3c7] text-[#101828]'
                  : 'bg-[#1e293b] hover:bg-[#334155] border-[#F2C879]/80 text-[#F2C879]'
              }`}
            >
              <Pause className="w-3.5 h-3.5 fill-current" />
            </button>
          </div>

          {/* Performance & Sensitivity Popover */}
          {perfPanelOpen && (
            <div className="pointer-events-auto pixel-panel p-3.5 w-72 space-y-3 z-30 bg-[#0d1524]/98 border-[#70B8D3]">
              <div className="flex items-center justify-between border-b border-slate-700 pb-2">
                <span className="text-xs font-mono font-bold text-[#F2C879] flex items-center gap-1.5">
                  <Gauge className="w-3.5 h-3.5 text-[#70B8D3]" />
                  {t.perfTitle} ({tierLabel})
                </span>
                <span className="text-[10px] font-mono flex items-center gap-1 text-slate-300">
                  {perfTelemetry.isOnline ? (
                    <>
                      <Wifi className="w-3 h-3 text-[#6BAF83]" /> {t.networkOnline}
                    </>
                  ) : (
                    <>
                      <WifiOff className="w-3 h-3 text-[#F0B85D]" /> {t.networkOffline}
                    </>
                  )}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-1.5">
                {(['auto', 'low', 'medium', 'high'] as QualityMode[]).map((qm) => {
                  const active = perfSettings.qualityMode === qm;
                  return (
                    <button
                      key={qm}
                      type="button"
                      onClick={() =>
                        onUpdatePerfSettings({ ...perfSettings, qualityMode: qm })
                      }
                      className={`px-2 py-1.5 text-[11px] font-mono border text-left cursor-pointer ${
                        active
                          ? 'bg-[#1e3a5f] border-[#F2C879] text-[#F2C879] font-bold'
                          : 'bg-[#152033] border-slate-700 text-slate-300 hover:border-slate-500'
                      }`}
                    >
                      {t.perfModes[qm]}
                    </button>
                  );
                })}
              </div>

              <p className="text-[11px] text-slate-400 leading-snug">
                {t.perfModeHints[perfSettings.qualityMode]}
              </p>

              {/* Mouse Sensitivity Slider */}
              <div className="space-y-1 pt-1 border-t border-slate-700/80">
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-200">
                  <span>{t.mouseSensLabel}</span>
                  <span className="text-[#70B8D3] font-bold tabular-nums">
                    {perfSettings.mouseSensitivity.toFixed(1)}x
                  </span>
                </div>
                <input
                  type="range"
                  min={0.4}
                  max={2.0}
                  step={0.1}
                  value={perfSettings.mouseSensitivity}
                  onChange={(e) =>
                    onUpdatePerfSettings({
                      ...perfSettings,
                      mouseSensitivity: parseFloat(e.target.value),
                    })
                  }
                  className="w-full accent-[#F2C879] cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* Retro 16-bit CRT Radar Mini-Map */}
          <RadarMiniMap
            ref={radarRef}
            shift={gameState.shift}
            lang={lang}
            isCriticalAlert={gameState.spe_active || gameState.co2_haze_active}
            shiftMissionAccepted={gameState.shift_mission_accepted}
            handoverActive={false}
            airlocks={airlocks}
            unlockedRooms={getUnlockedRoomFlags(gameState)}
            newlyUnlockedRoom={newlyUnlockedRoom}
          />
        </div>
      </div>

      {/* FUTURISTIC iPAD / DATA PAD WITH INTEGRATED MISSION TREE, RADAR & ACHIEVEMENTS */}
      <DataPadModal
        open={infoOpen && !isPaused}
        activeTab={dataPadTab}
        gameState={gameState}
        airlocks={airlocks}
        lang={lang}
        onChangeTab={onChangeDataPadTab}
        onClose={onToggleInfo}
        onOpenLog={onOpenLog}
      />

      {/* FPS PRECISION 4-BAR CROSSHAIR + HOVER PROMPT + CURSOR UNLOCK NOTICE */}
      {!hasModalOpen && !isPaused && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative w-6 h-6 pointer-events-none" aria-hidden="true">
            <div
              className="absolute left-1/2 -translate-x-1/2 top-[2px] w-[2px] h-[7px] opacity-100"
              style={{ backgroundColor: crosshairColor }}
            />
            <div
              className="absolute left-1/2 -translate-x-1/2 bottom-[2px] w-[2px] h-[7px] opacity-100"
              style={{ backgroundColor: crosshairColor }}
            />
            <div
              className="absolute top-1/2 -translate-y-1/2 left-[2px] h-[2px] w-[7px] opacity-100"
              style={{ backgroundColor: crosshairColor }}
            />
            <div
              className="absolute top-1/2 -translate-y-1/2 right-[2px] h-[2px] w-[7px] opacity-100"
              style={{ backgroundColor: crosshairColor }}
            />
          </div>

          {hoveredTarget && (
            <div
              className={`absolute top-1/2 translate-y-6 px-3 py-1.5 bg-[#101828]/95 border text-xs sm:text-sm font-semibold whitespace-nowrap shadow-lg ${hoverPromptClasses}`}
            >
              {hoverPromptText}
            </div>
          )}

          {lockedDoorBannerActive && (
            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 px-4 py-2 bg-[#7f1d1d]/95 border-2 border-[#F0B85D] text-xs font-mono font-semibold text-[#fef3c7] whitespace-nowrap shadow-lg">
              {lockedDoorBannerReason === 'shift_unlock'
                ? t.lockedRoomShiftNotice
                : t.lockedDoorNotice}
            </div>
          )}

          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3.5 py-1.5 bg-[#101828]/90 border border-[#70B8D3]/60 text-[11px] font-mono text-slate-200 whitespace-nowrap shadow-lg">
            {!pointerLocked ? t.freeLookHint : t.ctrlLockBarHint}
          </div>
        </div>
      )}
    </div>
  );
};
