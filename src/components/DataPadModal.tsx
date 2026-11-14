import React from 'react';
import {
  CheckCircle2,
  ClipboardList,
  Compass,
  DoorOpen,
  Droplets,
  GitBranch,
  HeartPulse,
  Leaf,
  Lock,
  Map as MapIcon,
  Package,
  Radio,
  Radiation,
  Rocket,
  Tablet,
  Trophy,
  Wind,
  X,
  Zap,
} from 'lucide-react';
import {
  getPrimaryShiftNpcLabel,
  getShiftPreviewTopic,
  getShiftTriggerMeta,
  SHIFT_TRIGGER_MAP,
} from '../engine/dialogueData';
import { getUiCopy } from '../engine/i18n';
import { SPACE_AILMENTS_META, SUPPLY_ITEMS_META } from '../engine/nasaData';
import { ACHIEVEMENTS_META, EVA_SECTORS_META } from '../engine/questAndAchievements';
import { getShiftScript, getUnlockedRoomFlags } from '../engine/simulationEngine';
import {
  AchievementId,
  AirlockId,
  AirlockState,
  EvaSectorId,
  GameState,
  Language,
  OutpostZoneId,
  ShiftNumber,
  SupplyItemId,
} from '../engine/types';

export type DataPadTab = 'telemetry' | 'medical' | 'tree' | 'radar' | 'achievements';

interface DataPadModalProps {
  open: boolean;
  activeTab: DataPadTab;
  gameState: GameState;
  airlocks: AirlockState;
  lang: Language;
  onChangeTab: (tab: DataPadTab) => void;
  onClose: () => void;
  onOpenLog: () => void;
}

const SHIFTS: ShiftNumber[] = [1, 2, 3, 4, 5, 6, 7, 8, 9];
const ALL_ACHIEVEMENT_IDS = Object.keys(ACHIEVEMENTS_META) as AchievementId[];
const ALL_SECTOR_IDS: EvaSectorId[] = ['sector_easy', 'sector_medium', 'sector_hard'];

function toSvgX(worldX: number): number {
  return ((worldX + 24.2) / 48.7) * 360;
}
function toSvgY(worldZ: number): number {
  return ((worldZ + 6.8) / 36.2) * 236;
}

export const DataPadModal: React.FC<DataPadModalProps> = ({
  open,
  activeTab,
  gameState,
  airlocks,
  lang,
  onChangeTab,
  onClose,
  onOpenLog,
}) => {
  if (!open) return null;

  const t = getUiCopy(lang);
  const script = getShiftScript(gameState, lang);
  const activeTrigger = getShiftTriggerMeta(gameState.shift, lang);
  const totalPower = gameState.solar_supply + gameState.battery;
  const powerPct = Math.max(0, Math.min(100, Math.round((totalPower / 32) * 100)));
  const waterPct = Math.max(0, Math.min(100, Math.round((gameState.water / 12) * 100)));
  const completedMap = new Map(gameState.decisions.map((d) => [d.shift, d]));
  const isHandover = gameState.handover_to_shift !== null;

  const powerStatus =
    totalPower <= 6 ? 'critical' : totalPower < 12 ? 'warning' : 'normal';
  const waterStatus =
    gameState.water <= 2 ? 'critical' : gameState.water < 5 ? 'warning' : 'normal';
  const airStatus =
    gameState.air_quality_score < 60
      ? 'critical'
      : gameState.air_quality_score < 80
        ? 'warning'
        : 'normal';
  const plantStatus =
    gameState.plant_health < 35
      ? 'critical'
      : gameState.plant_health < 65
        ? 'warning'
        : 'normal';
  const healthStatus =
    gameState.crew_health < 50
      ? 'critical'
      : gameState.crew_health < 80
        ? 'warning'
        : 'normal';

  const statusTone = (s: 'normal' | 'warning' | 'critical') => {
    if (s === 'critical') return { border: 'border-[#D76562]', text: 'text-[#fca5a5]', bar: 'bg-[#D76562]' };
    if (s === 'warning') return { border: 'border-[#F0B85D]', text: 'text-[#fde68a]', bar: 'bg-[#F0B85D]' };
    return { border: 'border-[#6BAF83]', text: 'text-[#bbf7d0]', bar: 'bg-[#6BAF83]' };
  };

  const pTone = statusTone(powerStatus);
  const wTone = statusTone(waterStatus);
  const aTone = statusTone(airStatus);
  const gTone = statusTone(plantStatus);
  const hTone = statusTone(healthStatus);
  const en = lang === 'en';

  const airlockEntries: { id: AirlockId; name: string }[] = [
    { id: 'solarControl', name: t.doorSolarControl },
    { id: 'solarBay', name: t.doorSolarBay },
    { id: 'greenhouseControl', name: t.doorGhControl },
    { id: 'greenhouseBay', name: t.doorGhBay },
    { id: 'habitatControl', name: t.doorHabControl },
    { id: 'habitatBay', name: t.doorHabBay },
  ];

  const triggerWorld = SHIFT_TRIGGER_MAP[gameState.shift];
  const beaconColor = gameState.spe_active || gameState.co2_haze_active ? '#D76562' : '#F2C879';

  const badgeIcon = t.startBadges[gameState.astronaut_badge]?.icon ?? '🚀';
  const unlockedRooms = getUnlockedRoomFlags(gameState);

  return (
    <div className="pointer-events-auto fixed inset-0 z-40 flex items-center justify-center p-3 sm:p-6 bg-[#080d18]/90">
      {/* Space-Grade Metallic iPad / Data Pad Frame */}
      <div className="relative w-full max-w-4xl rounded-[28px] bg-gradient-to-b from-[#334155] via-[#1e293b] to-[#0f172a] p-3 sm:p-4 border-2 border-[#64748b] shadow-[0_20px_60px_rgba(0,0,0,0.75)]">
        {/* Top Hardware Bezel: Front Camera + Sensor + Grip Notch */}
        <div className="flex items-center justify-center gap-3 pb-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#38bdf8]/70" />
          <span className="w-12 h-1.5 rounded-full bg-[#0b111e] border border-slate-600" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#090e1a] border border-[#475569] flex items-center justify-center">
            <span className="w-1 h-1 rounded-full bg-[#70B8D3]" />
          </span>
        </div>

        {/* Inner LCD Display Screen */}
        <div className="rounded-[18px] bg-[#0a1220] border-2 border-[#70B8D3]/70 overflow-hidden">
          {/* Screen OS Header */}
          <div className="px-4 py-3 bg-[#111c30] border-b border-[#70B8D3]/40 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <button
                type="button"
                onClick={onClose}
                aria-label={t.treeCloseBtn}
                className="w-8 h-8 shrink-0 flex items-center justify-center bg-[#dc2626] hover:bg-[#ef4444] border-2 border-[#fecaca] text-white shadow-[0_2px_0_#7f1d1d] cursor-pointer"
              >
                <X className="w-4 h-4 stroke-[3]" />
              </button>
              <Tablet className="w-4 h-4 text-[#70B8D3] shrink-0 hidden sm:block" />
              <div className="min-w-0">
                <div className="text-[11px] font-mono text-[#70B8D3] truncate">
                  {t.dataPadHeader} · {badgeIcon} {gameState.astronaut_callsign || 'ASTRONAUT'}
                </div>
                <div className="text-sm sm:text-base font-bold text-[#F2C879] truncate">
                  {activeTab === 'tree'
                    ? t.treeTitle
                    : activeTab === 'medical'
                      ? t.tabMedical
                      : activeTab === 'achievements'
                        ? t.tabAchievements
                        : t.infoPanelTitle}{' '}
                  · {script.hoursLabel}
                </div>
              </div>
            </div>

            <span className="hidden md:inline-block px-2 py-0.5 bg-[#0f172a] border border-slate-600 text-[11px] font-mono text-slate-300 shrink-0">
              {t.dataPadShortcutHint}
            </span>
          </div>

          {/* Integrated iPad Navigation Tabs */}
          <div className="px-4 pt-2.5 bg-[#0e1729] border-b border-slate-700/80 flex items-center gap-1.5 overflow-x-auto">
            <button
              type="button"
              onClick={() => onChangeTab('telemetry')}
              className={`px-3.5 py-2 text-xs font-mono font-bold border-t-2 border-x flex items-center gap-1.5 cursor-pointer transition-colors shrink-0 ${
                activeTab === 'telemetry'
                  ? 'bg-[#0a1220] border-t-[#70B8D3] border-x-slate-600 text-[#70B8D3]'
                  : 'bg-[#131e33] border-t-transparent border-x-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Tablet className="w-3.5 h-3.5" />
              <span>{t.tabTelemetry}</span>
            </button>

            <button
              type="button"
              onClick={() => onChangeTab('medical')}
              className={`px-3.5 py-2 text-xs font-mono font-bold border-t-2 border-x flex items-center gap-1.5 cursor-pointer transition-colors shrink-0 ${
                activeTab === 'medical'
                  ? 'bg-[#0a1220] border-t-[#fb7185] border-x-slate-600 text-[#fecdd3]'
                  : 'bg-[#131e33] border-t-transparent border-x-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <HeartPulse className="w-3.5 h-3.5 text-[#fb7185]" />
              <span>{t.tabMedical}</span>
            </button>

            <button
              type="button"
              onClick={() => onChangeTab('tree')}
              className={`px-3.5 py-2 text-xs font-mono font-bold border-t-2 border-x flex items-center gap-1.5 cursor-pointer transition-colors shrink-0 ${
                activeTab === 'tree'
                  ? 'bg-[#0a1220] border-t-[#F2C879] border-x-slate-600 text-[#F2C879]'
                  : 'bg-[#131e33] border-t-transparent border-x-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <GitBranch className="w-3.5 h-3.5" />
              <span>{t.tabTree}</span>
              <span className="px-1.5 py-0.2 bg-[#1e293b] text-[10px] text-slate-300 tabular-nums">
                {gameState.decisions.length}/9
              </span>
            </button>

            <button
              type="button"
              onClick={() => onChangeTab('radar')}
              className={`px-3.5 py-2 text-xs font-mono font-bold border-t-2 border-x flex items-center gap-1.5 cursor-pointer transition-colors shrink-0 ${
                activeTab === 'radar'
                  ? 'bg-[#0a1220] border-t-[#6BAF83] border-x-slate-600 text-[#6BAF83]'
                  : 'bg-[#131e33] border-t-transparent border-x-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span>{t.tabRadar}</span>
            </button>

            <button
              type="button"
              onClick={() => onChangeTab('achievements')}
              className={`px-3.5 py-2 text-xs font-mono font-bold border-t-2 border-x flex items-center gap-1.5 cursor-pointer transition-colors shrink-0 ${
                activeTab === 'achievements'
                  ? 'bg-[#0a1220] border-t-[#F2C879] border-x-slate-600 text-[#F2C879]'
                  : 'bg-[#131e33] border-t-transparent border-x-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Trophy className="w-3.5 h-3.5" />
              <span>{t.tabAchievements}</span>
              <span className="px-1.5 py-0.2 bg-[#1e293b] text-[10px] text-[#F2C879] tabular-nums">
                {gameState.unlocked_achievements.length}/{ALL_ACHIEVEMENT_IDS.length}
              </span>
            </button>
          </div>

          {/* Screen Body */}
          <div className="p-4 sm:p-5 max-h-[62vh] overflow-y-auto custom-scroll">
            {activeTab === 'telemetry' && (
              <div className="space-y-4">
                {/* 6 Vital Systems Telemetry Grid with Progress Bars */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-xs font-mono">
                  <div className={`p-3 bg-[#10192b] border ${pTone.border} flex flex-col justify-between gap-2 tabular-nums`}>
                    <div className="flex items-center justify-between text-[11px] text-slate-300">
                      <span className="flex items-center gap-1">
                        <Zap className="w-3.5 h-3.5 text-[#70B8D3]" />
                        {t.statPower.replace(':', '')}
                      </span>
                    </div>
                    <div className={`text-base font-bold ${pTone.text}`}>
                      {gameState.solar_supply}+{gameState.battery}
                    </div>
                    <div className="w-full h-1.5 bg-[#1e293b] overflow-hidden">
                      <div className={`h-full ${pTone.bar}`} style={{ width: `${powerPct}%` }} />
                    </div>
                  </div>

                  <div className={`p-3 bg-[#10192b] border ${wTone.border} flex flex-col justify-between gap-2 tabular-nums`}>
                    <div className="flex items-center justify-between text-[11px] text-slate-300">
                      <span className="flex items-center gap-1">
                        <Droplets className="w-3.5 h-3.5 text-[#70B8D3]" />
                        {t.statWater.replace(':', '')}
                      </span>
                    </div>
                    <div className={`text-base font-bold ${wTone.text}`}>
                      {gameState.water} {t.waterUnit}
                    </div>
                    <div className="w-full h-1.5 bg-[#1e293b] overflow-hidden">
                      <div className={`h-full ${wTone.bar}`} style={{ width: `${waterPct}%` }} />
                    </div>
                  </div>

                  <div className={`p-3 bg-[#10192b] border ${aTone.border} flex flex-col justify-between gap-2 tabular-nums`}>
                    <div className="flex items-center justify-between text-[11px] text-slate-300">
                      <span className="flex items-center gap-1">
                        <Wind className="w-3.5 h-3.5 text-[#6BAF83]" />
                        {t.statAir.replace(':', '')}
                      </span>
                    </div>
                    <div className={`text-base font-bold ${aTone.text}`}>
                      {gameState.air_quality_score}/100
                    </div>
                    <div className="w-full h-1.5 bg-[#1e293b] overflow-hidden">
                      <div
                        className={`h-full ${aTone.bar}`}
                        style={{ width: `${Math.max(0, Math.min(100, gameState.air_quality_score))}%` }}
                      />
                    </div>
                  </div>

                  <div className={`p-3 bg-[#10192b] border ${gTone.border} flex flex-col justify-between gap-2 tabular-nums`}>
                    <div className="flex items-center justify-between text-[11px] text-slate-300">
                      <span className="flex items-center gap-1">
                        <Leaf className="w-3.5 h-3.5 text-[#6BAF83]" />
                        {t.statPlant.replace(':', '')}
                      </span>
                    </div>
                    <div className={`text-base font-bold ${gTone.text}`}>
                      {gameState.plant_health}/100
                    </div>
                    <div className="w-full h-1.5 bg-[#1e293b] overflow-hidden">
                      <div
                        className={`h-full ${gTone.bar}`}
                        style={{ width: `${Math.max(0, Math.min(100, gameState.plant_health))}%` }}
                      />
                    </div>
                  </div>

                  <div className={`p-3 bg-[#10192b] border ${hTone.border} flex flex-col justify-between gap-2 tabular-nums`}>
                    <div className="flex items-center justify-between text-[11px] text-slate-300">
                      <span className="flex items-center gap-1">
                        <HeartPulse className="w-3.5 h-3.5 text-rose-400" />
                        {t.statHealth.replace(':', '')}
                      </span>
                    </div>
                    <div className={`text-base font-bold ${hTone.text}`}>
                      {Math.round(gameState.crew_health)}/100
                    </div>
                    <div className="text-[10px] text-slate-300">
                      {gameState.active_ailments.length > 0
                        ? t.ailmentsActive(gameState.active_ailments.length)
                        : t.healthyTag}
                    </div>
                  </div>

                  <div
                    className={`p-3 bg-[#10192b] border flex flex-col justify-between gap-2 ${
                      gameState.radiation_risk === 'at-risk'
                        ? 'border-[#D76562] text-[#fca5a5]'
                        : gameState.radiation_risk === 'protected-risk'
                          ? 'border-[#6BAF83] text-[#bbf7d0]'
                          : 'border-slate-600 text-slate-200'
                    }`}
                  >
                    <span className="text-[11px] text-slate-300 flex items-center gap-1">
                      <Radiation className="w-3.5 h-3.5 text-[#F0B85D]" />
                      {t.statRadiation.replace(':', '')}
                    </span>
                    <span className="text-base font-bold">
                      {gameState.radiation_risk === 'at-risk'
                        ? t.radRisk
                        : gameState.radiation_risk === 'protected-risk'
                          ? t.radSafe
                          : t.radNormal}
                    </span>
                    <span className="text-[10px] text-slate-400 tabular-nums">
                      {gameState.eclss.radiation_msv.toFixed(1)} mSv
                    </span>
                  </div>
                </div>

                {/* Live NASA ECLSS Telemetry Readout */}
                <div className="bg-[#0e1729] border border-[#70B8D3]/45 p-3 grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs font-mono tabular-nums">
                  <div className="bg-[#111c30] border border-slate-700 px-2.5 py-2">
                    <div className="text-[10px] text-slate-400">O₂ PARTIAL PRESSURE</div>
                    <div className="font-bold text-[#bae6fd]">{gameState.eclss.o2_kpa.toFixed(2)} kPa</div>
                    <div className="text-[10px] text-slate-500">0.035 kg/hr</div>
                  </div>
                  <div className="bg-[#111c30] border border-slate-700 px-2.5 py-2">
                    <div className="text-[10px] text-slate-400">WATER QUOTA</div>
                    <div className="font-bold text-[#70B8D3]">{gameState.eclss.water_l_day.toFixed(2)} L/day</div>
                    <div className="text-[10px] text-slate-500">Target 2.5–3.0</div>
                  </div>
                  <div className="bg-[#111c30] border border-slate-700 px-2.5 py-2">
                    <div className="text-[10px] text-slate-400">CREW ENERGY</div>
                    <div className="font-bold text-[#86efac]">{Math.round(gameState.eclss.calories_kcal)} kcal</div>
                    <div className="text-[10px] text-slate-500">2500–3000 kcal/d</div>
                  </div>
                  <div className="bg-[#111c30] border border-slate-700 px-2.5 py-2">
                    <div className="text-[10px] text-slate-400">BODY TEMP</div>
                    <div className="font-bold text-[#F2C879]">{gameState.eclss.body_temp_c.toFixed(1)} °C</div>
                    <div className="text-[10px] text-slate-500">Target 37.0°C</div>
                  </div>
                  <div className="bg-[#111c30] border border-slate-700 px-2.5 py-2">
                    <div className="text-[10px] text-slate-400">EVA RADAR & SECTORS</div>
                    <div className="font-bold text-[#F2C879]">
                      Lv.{gameState.eva_radar_level} · {gameState.unlocked_sectors.length}/3
                    </div>
                    <div className="text-[10px] text-slate-500">Outer Fog Map</div>
                  </div>
                </div>

                {/* EVA Rover Cargo Inventory & Active Space Ailments */}
                <div className="bg-[#0e1729] border border-slate-700/90 p-3 space-y-2.5">
                  <div className="flex items-center justify-between text-[11px] font-mono text-[#70B8D3]">
                    <span className="flex items-center gap-1.5 font-bold">
                      <Package className="w-3.5 h-3.5" />
                      {en ? 'EVA ROVER SUPPLY CARGO' : 'KHO VẬT TƯ ROBOT EVA & CHẾ TẠO'}
                    </span>
                    <span className="text-slate-400 tabular-nums">
                      {en ? `Runs: ${gameState.rover_runs_completed}` : `Số chuyến Rover: ${gameState.rover_runs_completed}`}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-1.5 text-[11px] font-mono">
                    {(Object.keys(SUPPLY_ITEMS_META) as SupplyItemId[]).map((itemId) => {
                      const meta = SUPPLY_ITEMS_META[itemId];
                      const qty = gameState.inventory[itemId] ?? 0;
                      return (
                        <div
                          key={itemId}
                          className={`px-2 py-1.5 border flex items-center justify-between gap-1 ${
                            qty > 0
                              ? 'bg-[#122620] border-[#6BAF83]/70 text-[#bbf7d0]'
                              : 'bg-[#111827] border-slate-800 text-slate-400'
                          }`}
                        >
                          <span className="truncate">
                            {meta.icon} {en ? meta.nameEn : meta.nameVi}
                          </span>
                          <span className="font-bold tabular-nums shrink-0">x{qty}</span>
                        </div>
                      );
                    })}
                  </div>
                  {gameState.active_ailments.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1 border-t border-slate-800">
                      {gameState.active_ailments.map((aid) => {
                        const am = SPACE_AILMENTS_META[aid];
                        return (
                          <span
                            key={aid}
                            className="px-2 py-1 text-[11px] font-mono bg-[#450a0a]/80 border border-[#D76562]/70 text-[#fecaca]"
                          >
                            {am.icon} {en ? am.nameEn : am.nameVi}
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Sector Modules & 6 Airlock Door Seal Telemetry */}
                <div className="bg-[#0e1729] border border-slate-700/90 p-3.5 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {(['control', 'solar', 'greenhouse', 'habitat'] as OutpostZoneId[]).map((zid) => {
                        const hasShift =
                          !isHandover && gameState.shift_mission_accepted && activeTrigger.zone === zid;
                        const isHere = gameState.current_zone === zid;
                        return (
                          <span
                            key={zid}
                            className={`px-2.5 py-1 text-xs font-semibold border ${
                              isHere
                                ? 'bg-[#1e3a5f] border-[#70B8D3] text-white'
                                : hasShift
                                  ? 'bg-[#2a2212] border-[#F2C879] text-[#F2C879]'
                                  : 'bg-[#162032] border-slate-700 text-slate-400'
                            }`}
                          >
                            {t.zonesDock[zid]} {hasShift ? '★' : ''}
                          </span>
                        );
                      })}
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenLog();
                      }}
                      className="px-3 py-1.5 text-xs font-semibold bg-[#182235] hover:bg-[#24324d] border border-[#70B8D3]/70 text-slate-100 flex items-center gap-1.5 cursor-pointer"
                    >
                      <ClipboardList className="w-3.5 h-3.5 text-[#70B8D3]" />
                      {t.logBtn(gameState.decisions.length)}
                    </button>
                  </div>

                  {/* All 6 Corridor-to-Room Automatic Sliding Door Status Chips */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 pt-2 border-t border-slate-700/70">
                    {airlockEntries.map((entry) => {
                      const isOpen = airlocks[entry.id];
                      return (
                        <div
                          key={entry.id}
                          className={`px-2.5 py-1.5 text-[11px] font-mono border flex items-center justify-between gap-2 ${
                            isOpen
                              ? 'bg-[#122620] border-[#6BAF83]/70 text-[#bbf7d0]'
                              : 'bg-[#241b14] border-[#F0B85D]/60 text-[#fde68a]'
                          }`}
                        >
                          <span className="truncate">{entry.name}</span>
                          <span className="inline-flex items-center gap-1 font-bold shrink-0">
                            {isOpen ? (
                              <DoorOpen className="w-3.5 h-3.5 text-[#6BAF83]" />
                            ) : (
                              <Lock className="w-3.5 h-3.5 text-[#F0B8D3]" />
                            )}
                            {isOpen ? t.airlockOpenTag : t.airlockLockedTag}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'medical' && (
              <div className="space-y-4">
                {/* Read-Only Personal Medical Profile Header */}
                <div className="bg-[#181020] border border-[#fb7185]/60 p-3.5 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <HeartPulse className="w-5 h-5 text-[#fb7185] shrink-0" />
                    <div>
                      <div className="text-xs font-mono font-bold text-[#fecdd3]">
                        {t.medProfileHeader}
                      </div>
                      <div className="text-[11px] font-mono text-slate-300">
                        {badgeIcon} {gameState.astronaut_callsign || 'ASTRONAUT'} · {script.hoursLabel}
                      </div>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 bg-[#2a121b] border border-[#fb7185]/80 text-[11px] font-mono font-bold text-[#fecdd3]">
                    🔒 {t.medProfileReadOnlyBadge}
                  </span>
                </div>

                {/* Biometric Vitals Synced Live With Medical Bay */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs font-mono tabular-nums">
                  <div className={`p-3 bg-[#10192b] border ${hTone.border} space-y-1.5`}>
                    <div className="text-[11px] text-slate-400">
                      {t.statHealth.replace(':', '')}
                    </div>
                    <div className={`text-lg font-bold ${hTone.text}`}>
                      {Math.round(gameState.crew_health)}/100
                    </div>
                    <div className="w-full h-1.5 bg-[#1e293b] overflow-hidden">
                      <div
                        className={`h-full ${hTone.bar}`}
                        style={{ width: `${Math.max(0, Math.min(100, gameState.crew_health))}%` }}
                      />
                    </div>
                  </div>

                  <div className="p-3 bg-[#10192b] border border-[#F2C879]/60 space-y-1.5">
                    <div className="text-[11px] text-slate-400">BODY TEMP</div>
                    <div className="text-lg font-bold text-[#F2C879]">
                      {gameState.eclss.body_temp_c.toFixed(1)} °C
                    </div>
                    <div className="text-[10px] text-slate-400">Target 37.0°C</div>
                  </div>

                  <div className="p-3 bg-[#10192b] border border-[#fb7185]/60 space-y-1.5">
                    <div className="text-[11px] text-slate-400">{t.medProfileHeartRate}</div>
                    <div className="text-lg font-bold text-[#fecdd3]">
                      {Math.round(
                        70 +
                          (100 - gameState.crew_health) * 0.45 +
                          (gameState.spe_active ? 18 : 0),
                      )}{' '}
                      BPM
                    </div>
                    <div className="text-[10px] text-slate-400">Normal 60–100 BPM</div>
                  </div>

                  <div className="p-3 bg-[#10192b] border border-[#70B8D3]/60 space-y-1.5">
                    <div className="text-[11px] text-slate-400">{t.medProfileSpo2}</div>
                    <div className="text-lg font-bold text-[#bae6fd]">
                      {Math.min(100, Math.round(92 + (gameState.eclss.o2_kpa - 16) * 1.45))}%
                    </div>
                    <div className="text-[10px] text-slate-400">
                      O₂ {gameState.eclss.o2_kpa.toFixed(1)} kPa
                    </div>
                  </div>
                </div>

                {/* Radiation, Dust, Hydration & Calories Summary */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs font-mono tabular-nums">
                  <div className="p-3 bg-[#0e1729] border border-slate-700 space-y-1">
                    <div className="text-[10px] text-slate-400">
                      {t.statRadiation.replace(':', '')}
                    </div>
                    <div className="text-sm font-bold text-[#F2C879]">
                      {gameState.eclss.radiation_msv.toFixed(1)} mSv ·{' '}
                      {gameState.radiation_risk === 'at-risk'
                        ? t.radRisk
                        : gameState.radiation_risk === 'protected-risk'
                          ? t.radSafe
                          : t.radNormal}
                    </div>
                    <div className="text-[10px] text-slate-400">ISS ref: ~80 mSv/yr</div>
                  </div>

                  <div className="p-3 bg-[#0e1729] border border-slate-700 space-y-1">
                    <div className="text-[10px] text-slate-400">{t.medProfileDustLevel}</div>
                    <div className="text-sm font-bold text-[#fde68a]">
                      {gameState.dust_storm_active ||
                      gameState.active_ailments.includes('lunar_dust_pneumonia')
                        ? en
                          ? 'HIGH EXPOSURE'
                          : 'PHƠI NHIỄM CAO'
                        : gameState.airlock_hepa_cleaned
                          ? en
                            ? 'HEPA CLEANED'
                            : 'ĐÃ RỬA LỌC HEPA'
                          : en
                            ? 'NOMINAL'
                            : 'AN TOÀN'}
                    </div>
                    <div className="text-[10px] text-slate-400">HEPA &lt;0.3 µm</div>
                  </div>

                  <div className="p-3 bg-[#0e1729] border border-slate-700 space-y-1">
                    <div className="text-[10px] text-slate-400">NUTRITION &amp; HYDRATION</div>
                    <div className="text-sm font-bold text-[#86efac]">
                      {Math.round(gameState.eclss.calories_kcal)} kcal ·{' '}
                      {gameState.eclss.water_l_day.toFixed(1)} L/d
                    </div>
                    <div className="text-[10px] text-slate-400">
                      ARED Shifts: {gameState.ared_exercised_shifts.length}
                    </div>
                  </div>
                </div>

                {/* Read-Only Active & Cured Space Medicine Conditions */}
                <div className="bg-[#0e1729] border border-slate-700/90 p-3.5 space-y-2.5">
                  <div className="text-xs font-mono font-bold text-[#fecdd3]">
                    {en
                      ? 'MEDICAL CONDITION LOG (VISIT 3D MED BAY FOR TREATMENT)'
                      : 'NHẬT KÝ BỆNH LÝ KHÔNG GIAN (ĐẾN TRẠM Y TẾ 3D ĐỂ ĐIỀU TRỊ)'}
                  </div>
                  {gameState.active_ailments.length === 0 ? (
                    <div className="p-2.5 bg-[#112620] border border-[#6BAF83]/70 text-xs font-mono text-[#bbf7d0]">
                      ✅ {t.medNoAilments}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {gameState.active_ailments.map((aid) => {
                        const am = SPACE_AILMENTS_META[aid];
                        return (
                          <div
                            key={aid}
                            className="p-2.5 bg-[#450a0a]/80 border border-[#D76562]/80 text-xs space-y-1"
                          >
                            <div className="font-bold text-[#fecaca]">
                              {am.icon} {en ? am.nameEn : am.nameVi}
                            </div>
                            <div className="text-[11px] text-slate-200">
                              {en ? am.symptomEn : am.symptomVi}
                            </div>
                            <div className="text-[10px] font-mono text-[#F2C879]">
                              💊 {en ? am.cureGuideEn : am.cureGuideVi}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {gameState.cured_ailments.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1 border-t border-slate-800">
                      {gameState.cured_ailments.map((aid) => {
                        const am = SPACE_AILMENTS_META[aid];
                        return (
                          <span
                            key={aid}
                            className="px-2 py-0.5 text-[10px] font-mono bg-[#122620] border border-[#6BAF83]/60 text-[#bbf7d0]"
                          >
                            ✅ {en ? `${am.nameEn} (Cured)` : `${am.nameVi} (Đã khỏi)`}
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'tree' && (
              <div className="space-y-0">
                {/* Prologue Node */}
                <div className="flex items-stretch gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-[#1e3a5f] border-2 border-[#70B8D3] flex items-center justify-center shrink-0">
                      <Rocket className="w-4 h-4 text-[#70B8D3]" />
                    </div>
                    <div className="w-0.5 flex-1 bg-[#6BAF83]/60 my-1 min-h-[18px]" />
                  </div>
                  <div className="pb-3.5 flex-1">
                    <div className="bg-[#111c33] border border-[#70B8D3]/60 px-4 py-2.5">
                      <div className="text-xs font-mono font-bold text-[#70B8D3]">
                        PROLOGUE · 0h
                      </div>
                      <div className="text-sm font-bold text-white">{t.treePrologueTitle}</div>
                      <p className="text-xs text-slate-300 mt-0.5">{t.treePrologueDesc}</p>
                    </div>
                  </div>
                </div>

                {/* 9 Shifts Branching Timeline */}
                {SHIFTS.map((shiftNum, idx) => {
                  const record = completedMap.get(shiftNum);
                  const isCompleted = Boolean(record);
                  const isCurrent = !isCompleted && !isHandover && gameState.shift === shiftNum;
                  const preview = getShiftPreviewTopic(shiftNum, lang);
                  const trigger = getShiftTriggerMeta(shiftNum, lang);
                  const primaryNpc = getPrimaryShiftNpcLabel(shiftNum, lang);
                  const isLast = idx === SHIFTS.length - 1;

                  const nodeRingCls = isCompleted
                    ? 'bg-[#14532d] border-[#6BAF83] text-[#86efac]'
                    : isCurrent
                      ? 'bg-[#78350f] border-[#F2C879] text-[#F2C879]'
                      : 'bg-[#1e293b] border-slate-600 text-slate-500';

                  const cardBorderCls = isCompleted
                    ? 'bg-[#11241c] border-[#6BAF83]/75'
                    : isCurrent
                      ? 'bg-[#1d1c12] border-2 border-[#F2C879]'
                      : 'bg-[#0f172a]/85 border-slate-700/80 opacity-75';

                  return (
                    <div key={shiftNum} className="flex items-stretch gap-4">
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 ${nodeRingCls}`}
                        >
                          {isCompleted ? (
                            <CheckCircle2 className="w-4 h-4" />
                          ) : isCurrent ? (
                            <Radio className="w-4 h-4" />
                          ) : (
                            <Lock className="w-3.5 h-3.5" />
                          )}
                        </div>
                        {!isLast && (
                          <div
                            className={`w-0.5 flex-1 my-1 min-h-[18px] ${
                              isCompleted ? 'bg-[#6BAF83]/60' : 'bg-slate-700'
                            }`}
                          />
                        )}
                      </div>

                      <div className={`${isLast ? 'pb-1' : 'pb-3.5'} flex-1`}>
                        <div className={`border px-4 py-3 space-y-1.5 ${cardBorderCls}`}>
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <span className="text-sm font-bold text-white">
                              {preview.title}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] font-mono text-[#70B8D3]">
                                {preview.hours}
                              </span>
                              <span
                                className={`text-[10px] font-mono font-bold px-2 py-0.5 border ${
                                  isCompleted
                                    ? 'bg-[#14532d] border-[#6BAF83] text-[#bbf7d0]'
                                    : isCurrent
                                      ? 'bg-[#92400e] border-[#F2C879] text-[#fef3c7]'
                                      : 'bg-slate-800 border-slate-600 text-slate-400'
                                }`}
                              >
                                {isCompleted
                                  ? t.treeDoneTag
                                  : isCurrent
                                    ? t.treeActiveTag
                                    : t.treeLockedTag}
                              </span>
                            </div>
                          </div>

                          {isCompleted && record ? (
                            <div className="space-y-1 pt-0.5">
                              <div className="text-xs font-mono text-[#F2C879]">
                                {t.logPicked(record.choiceId)} — {record.choiceLabel}
                              </div>
                              <p className="text-xs text-slate-200 leading-snug">
                                {record.consequenceSummary}
                              </p>
                            </div>
                          ) : isCurrent ? (
                            <div
                              className={`text-xs font-mono font-semibold pt-0.5 ${
                                !gameState.shift_mission_accepted
                                  ? 'text-[#fca5a5]'
                                  : 'text-[#fde68a]'
                              }`}
                            >
                              {!gameState.shift_mission_accepted
                                ? `❗ ${t.treeWaitingNpc(primaryNpc)}`
                                : `📍 ${t.treeGoConsole(trigger.label)}`}
                            </div>
                          ) : (
                            <p className="text-xs font-mono text-slate-400">
                              🔒 {t.treeLockedHint(preview.topic)}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {activeTab === 'radar' && (
              <div className="space-y-3">
                <svg
                  viewBox="0 0 360 236"
                  className="w-full max-w-xl mx-auto h-auto bg-[#070e19] border-2 border-[#70B8D3]/50 block"
                  aria-label="Aurora Station Full Schematic Map"
                >
                  <defs>
                    <pattern id="ipadGrid" width="24" height="24" patternUnits="userSpaceOnUse">
                      <path d="M 24 0 L 0 0 0 24" fill="none" stroke="#152338" strokeWidth="0.8" />
                    </pattern>
                  </defs>
                  <rect width="360" height="236" fill="url(#ipadGrid)" />

                  {/* Corridors */}
                  <rect
                    x={toSvgX(-14.0)}
                    y={toSvgY(-1.8)}
                    width={toSvgX(-5.6) - toSvgX(-14.0)}
                    height={toSvgY(1.8) - toSvgY(-1.8)}
                    fill="#162235"
                    stroke="#475569"
                    strokeWidth="1.2"
                  />
                  <rect
                    x={toSvgX(5.6)}
                    y={toSvgY(-1.8)}
                    width={toSvgX(14.0) - toSvgX(5.6)}
                    height={toSvgY(1.8) - toSvgY(-1.8)}
                    fill="#162235"
                    stroke="#475569"
                    strokeWidth="1.2"
                  />
                  <rect
                    x={toSvgX(-1.8)}
                    y={toSvgY(5.6)}
                    width={toSvgX(1.8) - toSvgX(-1.8)}
                    height={toSvgY(14.0) - toSvgY(5.6)}
                    fill="#162235"
                    stroke="#475569"
                    strokeWidth="1.2"
                  />

                  {/* Rooms */}
                  <rect
                    x={toSvgX(-22.6)}
                    y={toSvgY(-4.4)}
                    width={toSvgX(-14.0) - toSvgX(-22.6)}
                    height={toSvgY(4.4) - toSvgY(-4.4)}
                    fill={gameState.current_zone === 'solar' ? '#1e3a5f' : '#17253d'}
                    stroke="#70B8D3"
                    strokeWidth="1.8"
                  />
                  <text x={toSvgX(-21.8)} y={toSvgY(-2.4)} fill="#70B8D3" fontSize="9.5" fontWeight="bold" fontFamily="monospace">
                    SOLAR BAY
                  </text>

                  <rect
                    x={toSvgX(-5.6)}
                    y={toSvgY(-5.6)}
                    width={toSvgX(5.6) - toSvgX(-5.6)}
                    height={toSvgY(5.6) - toSvgY(-5.6)}
                    fill={gameState.current_zone === 'control' ? '#243a5e' : '#1c2a42'}
                    stroke="#94a3b8"
                    strokeWidth="1.8"
                  />
                  <text x={toSvgX(-4.6)} y={toSvgY(-3.6)} fill="#e2e8f0" fontSize="9.5" fontWeight="bold" fontFamily="monospace">
                    CONTROL HUB
                  </text>

                  <rect
                    x={toSvgX(14.0)}
                    y={toSvgY(-4.4)}
                    width={toSvgX(23.2) - toSvgX(14.0)}
                    height={toSvgY(4.4) - toSvgY(-4.4)}
                    fill={
                      !unlockedRooms.greenhouse
                        ? '#111622'
                        : gameState.current_zone === 'greenhouse'
                          ? '#1b4332'
                          : '#142d27'
                    }
                    stroke={unlockedRooms.greenhouse ? '#6BAF83' : '#ef4444'}
                    strokeWidth="1.8"
                    strokeDasharray={unlockedRooms.greenhouse ? undefined : '4 3'}
                  />
                  <text
                    x={toSvgX(14.8)}
                    y={toSvgY(-2.4)}
                    fill={unlockedRooms.greenhouse ? '#6BAF83' : '#fca5a5'}
                    fontSize="9.5"
                    fontWeight="bold"
                    fontFamily="monospace"
                  >
                    {unlockedRooms.greenhouse ? 'GREENHOUSE' : '🔒 GREENHOUSE'}
                  </text>

                  <rect
                    x={toSvgX(-5.8)}
                    y={toSvgY(14.0)}
                    width={toSvgX(5.8) - toSvgX(-5.8)}
                    height={toSvgY(20.6) - toSvgY(14.0)}
                    fill={
                      !unlockedRooms.eclss
                        ? '#15121d'
                        : gameState.current_zone === 'habitat'
                          ? '#3b331b'
                          : '#27241a'
                    }
                    stroke={unlockedRooms.eclss ? '#F0B85D' : '#ef4444'}
                    strokeWidth="1.8"
                    strokeDasharray={unlockedRooms.eclss ? undefined : '4 3'}
                  />
                  <rect
                    x={toSvgX(-5.8)}
                    y={toSvgY(20.6)}
                    width={toSvgX(5.8) - toSvgX(-5.8)}
                    height={toSvgY(28.0) - toSvgY(20.6)}
                    fill={!unlockedRooms.warehouse ? '#141019' : '#241c14'}
                    stroke={unlockedRooms.warehouse ? '#fdba74' : '#ef4444'}
                    strokeWidth="1.8"
                    strokeDasharray={unlockedRooms.warehouse ? undefined : '4 3'}
                  />
                  <text
                    x={toSvgX(-4.6)}
                    y={toSvgY(19.0)}
                    fill={!unlockedRooms.eclss ? '#fca5a5' : unlockedRooms.shelter ? '#4ade80' : '#F0B85D'}
                    fontSize="8.8"
                    fontWeight="bold"
                    fontFamily="monospace"
                  >
                    {unlockedRooms.eclss
                      ? unlockedRooms.shelter
                        ? 'HABITAT & SHELTER'
                        : 'ECLSS (SHELTER 🔒)'
                      : '🔒 HABITAT & ECLSS'}
                  </text>
                  <text
                    x={toSvgX(-4.6)}
                    y={toSvgY(25.2)}
                    fill={unlockedRooms.warehouse ? '#fdba74' : '#fca5a5'}
                    fontSize="8.8"
                    fontWeight="bold"
                    fontFamily="monospace"
                  >
                    {unlockedRooms.warehouse ? 'SUPPLY WAREHOUSE' : '🔒 SUPPLY WAREHOUSE'}
                  </text>

                  {/* 6 Airlock Junction Bars */}
                  <line x1={toSvgX(-6.05)} y1={toSvgY(-1.7)} x2={toSvgX(-6.05)} y2={toSvgY(1.7)} stroke={airlocks.solarControl ? '#4ade80' : '#f59e0b'} strokeWidth="3.5" />
                  <line x1={toSvgX(-13.55)} y1={toSvgY(-1.7)} x2={toSvgX(-13.55)} y2={toSvgY(1.7)} stroke={airlocks.solarBay ? '#4ade80' : '#f59e0b'} strokeWidth="3.5" />
                  <line x1={toSvgX(6.05)} y1={toSvgY(-1.7)} x2={toSvgX(6.05)} y2={toSvgY(1.7)} stroke={!unlockedRooms.greenhouse ? '#ef4444' : airlocks.greenhouseControl ? '#4ade80' : '#f59e0b'} strokeWidth="3.5" />
                  <line x1={toSvgX(13.55)} y1={toSvgY(-1.7)} x2={toSvgX(13.55)} y2={toSvgY(1.7)} stroke={!unlockedRooms.greenhouse ? '#ef4444' : airlocks.greenhouseBay ? '#4ade80' : '#f59e0b'} strokeWidth="3.5" />
                  <line x1={toSvgX(-1.7)} y1={toSvgY(6.05)} x2={toSvgX(1.7)} y2={toSvgY(6.05)} stroke={!unlockedRooms.eclss ? '#ef4444' : airlocks.habitatControl ? '#4ade80' : '#f59e0b'} strokeWidth="3.5" />
                  <line x1={toSvgX(-1.7)} y1={toSvgY(13.55)} x2={toSvgX(1.7)} y2={toSvgY(13.55)} stroke={!unlockedRooms.eclss ? '#ef4444' : airlocks.habitatBay ? '#4ade80' : '#f59e0b'} strokeWidth="3.5" />

                  {/* Specialized Terminals */}
                  <g transform={`translate(${toSvgX(-3.6)}, ${toSvgY(-2.6)})`}>
                    <rect x="-5.5" y="-5.5" width="11" height="11" fill={unlockedRooms.warehouse ? '#0c4a6e' : '#450a0a'} stroke={unlockedRooms.warehouse ? '#38bdf8' : '#ef4444'} strokeWidth="1.2" />
                    <text x="0" y="2.8" textAnchor="middle" fill="#e0f2fe" fontSize="7" fontWeight="bold" fontFamily="monospace">
                      R
                    </text>
                  </g>
                  <g transform={`translate(${toSvgX(15.1)}, ${toSvgY(-3.1)})`}>
                    <rect x="-5.5" y="-5.5" width="11" height="11" fill={unlockedRooms.greenhouse ? '#14532d' : '#450a0a'} stroke={unlockedRooms.greenhouse ? '#4ade80' : '#ef4444'} strokeWidth="1.2" />
                    <text x="0" y="2.8" textAnchor="middle" fill="#dcfce7" fontSize="7" fontWeight="bold" fontFamily="monospace">
                      B
                    </text>
                  </g>
                  <g transform={`translate(${toSvgX(-2.85)}, ${toSvgY(14.85)})`}>
                    <rect x="-5.5" y="-5.5" width="11" height="11" fill={unlockedRooms.med_bay ? '#881337' : '#450a0a'} stroke={unlockedRooms.med_bay ? '#fb7185' : '#ef4444'} strokeWidth="1.2" />
                    <text x="0" y="2.8" textAnchor="middle" fill="#ffe4e6" fontSize="7" fontWeight="bold" fontFamily="monospace">
                      M
                    </text>
                  </g>

                  {/* Active Shift Console Beacon */}
                  {!isHandover && (
                    <g transform={`translate(${toSvgX(triggerWorld.x)}, ${toSvgY(triggerWorld.z)})`}>
                      <circle r="11" fill="none" stroke={beaconColor} strokeWidth="2" opacity="0.85" />
                      <circle r="4.5" fill={beaconColor} />
                    </g>
                  )}
                </svg>

                <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-mono text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <span className="inline-block w-3 h-1 bg-[#4ade80]" /> {t.airlockOpenTag}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="inline-block w-3 h-1 bg-[#f59e0b]" /> {t.airlockLockedTag}
                  </span>
                  <span className="text-[#F2C879] font-bold">
                    {t.zones[gameState.current_zone]}
                  </span>
                </div>
              </div>
            )}

            {activeTab === 'achievements' && (
              <div className="space-y-4">
                {/* Outer Lunar Sectors Summary */}
                <div className="bg-[#0e1729] border border-[#70B8D3]/50 p-3 space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono font-bold text-[#70B8D3]">
                    <span className="flex items-center gap-1.5">
                      <Compass className="w-4 h-4" />
                      {en ? 'OUTER EVA SECTORS & RADAR STATUS' : 'KHU VỰC THÁM HIỂM NGOÀI TRẠM & RADAR'}
                    </span>
                    <span className="text-[#F2C879] tabular-nums">
                      RADAR Lv.{gameState.eva_radar_level}/3 · {gameState.unlocked_sectors.length}/3
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {ALL_SECTOR_IDS.map((sid) => {
                      const sm = EVA_SECTORS_META[sid];
                      const unlocked = gameState.unlocked_sectors.includes(sid);
                      return (
                        <div
                          key={sid}
                          className={`p-2.5 border text-xs ${
                            unlocked
                              ? 'bg-[#122620] border-[#6BAF83] text-[#bbf7d0]'
                              : 'bg-[#111827] border-slate-700 text-slate-400'
                          }`}
                        >
                          <div className="font-bold flex items-center justify-between gap-1">
                            <span>{en ? sm.nameEn : sm.nameVi}</span>
                            <span>{unlocked ? '✅' : '🔒'}</span>
                          </div>
                          <div className="text-[11px] mt-1 opacity-85">
                            {en ? sm.descEn : sm.descVi}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* All 13 Achievements Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {ALL_ACHIEVEMENT_IDS.map((aid) => {
                    const meta = ACHIEVEMENTS_META[aid];
                    const unlocked = gameState.unlocked_achievements.includes(aid);
                    const isGrand = meta.category === 'grand';
                    return (
                      <div
                        key={aid}
                        className={`p-3 border flex items-start gap-2.5 ${
                          isGrand ? 'sm:col-span-2' : ''
                        } ${
                          unlocked
                            ? isGrand
                              ? 'bg-[#2a210f] border-2 border-[#F2C879] text-[#fef3c7]'
                              : 'bg-[#122620] border-[#6BAF83]/75 text-[#bbf7d0]'
                            : 'bg-[#0f172a] border-slate-800 text-slate-400'
                        }`}
                      >
                        <span className="text-xl shrink-0">{meta.icon}</span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-bold truncate">
                              {en ? meta.titleEn : meta.titleVi}
                            </span>
                            <span className="text-[10px] font-mono shrink-0">
                              {unlocked ? (en ? 'UNLOCKED' : 'ĐÃ MỞ') : '🔒'}
                            </span>
                          </div>
                          <p className="text-[11px] opacity-85 mt-0.5">
                            {en ? meta.descEn : meta.descVi}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Hardware Bezel: Physical Circular Home Button */}
        <div className="flex items-center justify-center pt-2.5">
          <button
            type="button"
            onClick={onClose}
            aria-label={t.treeCloseBtn}
            title={t.dataPadShortcutHint}
            className="w-9 h-9 rounded-full bg-[#0f172a] hover:bg-[#1e293b] border-2 border-[#64748b] flex items-center justify-center shadow-inner cursor-pointer"
          >
            <span className="w-3.5 h-3.5 rounded-[3px] border border-[#94a3b8]" />
          </button>
        </div>
      </div>
    </div>
  );
};
