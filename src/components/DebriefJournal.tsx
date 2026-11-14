import React from 'react';
import {
  AlertTriangle,
  BookOpen,
  CheckCircle,
  Globe,
  RotateCcw,
  ShieldX,
  Trophy,
} from 'lucide-react';
import { getUiCopy } from '../engine/i18n';
import { ACHIEVEMENTS_META } from '../engine/questAndAchievements';
import {
  evaluateTerminalOutcome,
  localizeDecisionEntry,
} from '../engine/simulationEngine';
import { GameState, Language } from '../engine/types';

interface DebriefJournalProps {
  gameState: GameState;
  lang: Language;
  onToggleLanguage: (lang: Language) => void;
  onRetry: () => void;
  onOpenScienceLibrary: () => void;
}

export const DebriefJournal: React.FC<DebriefJournalProps> = ({
  gameState,
  lang,
  onToggleLanguage,
  onRetry,
  onOpenScienceLibrary,
}) => {
  if (gameState.phase !== 'debrief') return null;

  const t = getUiCopy(lang);
  const en = lang === 'en';
  const evalLocalized = evaluateTerminalOutcome(gameState, lang);

  const isStable = gameState.outcome === 'stable';
  const isStress = gameState.outcome === 'stress';

  const bannerConfig = isStable
    ? {
        title: t.debriefStableTitle,
        subtitle: t.debriefStableSub,
        border: 'border-[#6BAF83]',
        bg: 'bg-[#1b4332]/60',
        text: 'text-[#bbf7d0]',
        Icon: CheckCircle,
      }
    : isStress
      ? {
          title: t.debriefStressTitle,
          subtitle: t.debriefStressSub,
          border: 'border-[#F0B85D]',
          bg: 'bg-[#78350f]/50',
          text: 'text-[#fde68a]',
          Icon: AlertTriangle,
        }
      : {
          title: t.debriefFailTitle,
          subtitle: evalLocalized.failureReason || t.debriefFailDefault,
          border: 'border-[#D76562]',
          bg: 'bg-[#7f1d1d]/60',
          text: 'text-[#fecaca]',
          Icon: ShieldX,
        };

  const BannerIcon = bannerConfig.Icon;
  const stressReasons =
    evalLocalized.stressReasons.length > 0
      ? evalLocalized.stressReasons
      : gameState.stress_reasons;
  const hasGrandLegend = gameState.unlocked_achievements.includes('grand_72h_survivor');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#101828]/95">
      <div className="pixel-panel-warm max-w-4xl w-full max-h-[92vh] flex flex-col">
        {/* Journal Header */}
        <div className="px-6 py-4 border-b border-slate-700 flex flex-wrap items-center justify-between gap-3 bg-[#152033]">
          <div>
            <div className="text-xs font-mono uppercase tracking-widest text-[#70B8D3]">
              {t.debriefTag} · 👩‍🚀 {gameState.astronaut_callsign || 'ASTRONAUT'}
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#F2C879]">
              {t.debriefTitle}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <div className="inline-flex items-center bg-[#101828] border border-[#70B8D3]/60 p-0.5 text-xs font-mono">
              <Globe className="w-3.5 h-3.5 text-[#70B8D3] mx-1.5" />
              <button
                type="button"
                onClick={() => onToggleLanguage('vi')}
                className={`px-2 py-1 font-bold cursor-pointer ${
                  lang === 'vi' ? 'bg-[#F2C879] text-[#101828]' : 'text-slate-300 hover:text-white'
                }`}
              >
                VI
              </button>
              <button
                type="button"
                onClick={() => onToggleLanguage('en')}
                className={`px-2 py-1 font-bold cursor-pointer ${
                  lang === 'en' ? 'bg-[#F2C879] text-[#101828]' : 'text-slate-300 hover:text-white'
                }`}
              >
                EN
              </button>
            </div>
            <div className="text-xs font-mono text-slate-300 bg-[#101828] border border-slate-600 px-3 py-1.5 tabular-nums">
              {t.debriefCompleted(gameState.decisions.length)}
            </div>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto custom-scroll space-y-5">
          {/* Outcome Banner */}
          <div className={`p-4 border-2 ${bannerConfig.border} ${bannerConfig.bg} flex items-start gap-3`}>
            <BannerIcon className={`w-7 h-7 shrink-0 mt-0.5 ${bannerConfig.text}`} />
            <div className="space-y-1">
              <div className={`text-lg sm:text-xl font-bold ${bannerConfig.text}`}>
                {bannerConfig.title}
              </div>
              <p className="text-sm text-slate-100">{bannerConfig.subtitle}</p>
              {stressReasons.length > 0 && (
                <ul className="pt-2 space-y-1 text-xs sm:text-sm text-[#fde68a]">
                  {stressReasons.map((r, i) => (
                    <li key={i}>• {r}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Grand Endgame Survivor Achievement Showcase */}
          {hasGrandLegend && (
            <div className="p-4 border-2 border-[#F2C879] bg-[#2a200d] flex items-center gap-3.5">
              <Trophy className="w-8 h-8 text-[#F2C879] shrink-0" />
              <div>
                <div className="text-xs font-mono uppercase tracking-wider text-[#F2C879]">
                  {en ? 'GRAND ACHIEVEMENT UNLOCKED' : 'THÀNH TỰU ĐẶC BIỆT CUỐI GAME'}
                </div>
                <div className="text-base sm:text-lg font-bold text-white">
                  🏆{' '}
                  {en
                    ? ACHIEVEMENTS_META.grand_72h_survivor.titleEn
                    : ACHIEVEMENTS_META.grand_72h_survivor.titleVi}
                </div>
                <p className="text-xs text-[#fef3c7] mt-0.5">
                  {en
                    ? ACHIEVEMENTS_META.grand_72h_survivor.descEn
                    : ACHIEVEMENTS_META.grand_72h_survivor.descVi}
                </p>
              </div>
            </div>
          )}

          {/* Final Telemetry Snapshot (Classic + NASA ECLSS Live Metrics) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2.5 text-xs font-mono">
            <div className="bg-[#152033] border border-slate-700 p-2.5">
              <div className="text-slate-400">{t.debriefBattery}</div>
              <div className="text-base font-bold text-[#70B8D3] tabular-nums">
                {gameState.battery} {t.powerUnit}
              </div>
            </div>
            <div className="bg-[#152033] border border-slate-700 p-2.5">
              <div className="text-slate-400">{t.debriefWater}</div>
              <div className="text-base font-bold text-[#6BAF83] tabular-nums">
                {gameState.water} · {gameState.eclss.water_l_day.toFixed(1)}L/d
              </div>
            </div>
            <div className="bg-[#152033] border border-slate-700 p-2.5">
              <div className="text-slate-400">O₂ · {t.debriefAir}</div>
              <div className="text-base font-bold text-[#6BAF83] tabular-nums">
                {gameState.eclss.o2_kpa.toFixed(1)} kPa · {gameState.air_quality_score}
              </div>
            </div>
            <div className="bg-[#152033] border border-slate-700 p-2.5">
              <div className="text-slate-400">{t.debriefGarden} · Kcal</div>
              <div className="text-base font-bold text-[#6BAF83] tabular-nums">
                {gameState.plant_health} · {Math.round(gameState.eclss.calories_kcal)}
              </div>
            </div>
            <div className="bg-[#152033] border border-slate-700 p-2.5">
              <div className="text-slate-400">{t.statHealth.replace(':', '')} · Temp</div>
              <div
                className={`text-base font-bold tabular-nums ${
                  gameState.crew_health < 60 ? 'text-[#D76562]' : 'text-[#6BAF83]'
                }`}
              >
                {Math.round(gameState.crew_health)} · {gameState.eclss.body_temp_c.toFixed(1)}°C
              </div>
            </div>
            <div className="bg-[#152033] border border-slate-700 p-2.5">
              <div className="text-slate-400">{t.debriefRad} · EVA</div>
              <div
                className={`text-sm font-bold tabular-nums ${
                  gameState.radiation_risk === 'at-risk' ? 'text-[#D76562]' : 'text-[#6BAF83]'
                }`}
              >
                {gameState.eclss.radiation_msv.toFixed(1)} mSv · {gameState.unlocked_sectors.length}/3
              </div>
            </div>
          </div>

          {/* Unlocked Achievements Chips */}
          {gameState.unlocked_achievements.length > 0 && (
            <div className="bg-[#111a2b] border border-slate-700 p-3.5 space-y-2">
              <div className="text-xs font-mono font-bold text-[#F2C879] flex items-center gap-1.5">
                <Trophy className="w-4 h-4" />
                {en
                  ? `ACHIEVEMENTS EARNED (${gameState.unlocked_achievements.length}/13)`
                  : `THÀNH TỰU ĐẠT ĐƯỢC (${gameState.unlocked_achievements.length}/13)`}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {gameState.unlocked_achievements.map((aid) => {
                  const am = ACHIEVEMENTS_META[aid];
                  return (
                    <span
                      key={aid}
                      className="px-2.5 py-1 text-xs font-mono border border-[#F2C879]/50 bg-[#1a2234] text-[#fef3c7]"
                    >
                      {am.icon} {en ? am.titleEn : am.titleVi}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* Radiation Real-World Context Box */}
          <div className="bg-[#182235] border border-[#70B8D3]/50 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="font-bold text-sm text-[#F2C879]">
                {t.radBoxTitle(gameState.radiation_units)}
              </div>
              <div className="text-xs text-slate-300 mt-1">{t.radBoxCompare}</div>
            </div>
            <span className="text-[11px] font-mono text-[#70B8D3] shrink-0">
              SCI-06 · SCI-07 · SCI-10 · SCI-11
            </span>
          </div>

          {/* Decision-by-Decision NASA Journal Cards */}
          <div className="space-y-3">
            <h3 className="text-sm font-mono uppercase tracking-wider text-slate-300">
              {t.debriefDecisionsTitle}
            </h3>
            {gameState.decisions.map((rawEntry) => {
              const entry = localizeDecisionEntry(rawEntry, lang);
              return (
                <div
                  key={entry.shift}
                  className="bg-[#152033] border border-slate-700 p-4 space-y-2"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-700/70 pb-2">
                    <span className="font-bold text-sm text-[#F2C879]">
                      {t.debriefShiftLabel(entry.shift, entry.eventTitle)}
                    </span>
                    <span className="text-xs font-mono px-2 py-0.5 bg-[#101828] border border-slate-600 text-[#70B8D3]">
                      {t.debriefChosen(entry.choiceId, entry.choiceLabel)}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-200">
                    <strong>{t.debriefResultLabel}</strong> {entry.consequenceSummary}
                  </p>
                  <div className="bg-[#101828] border border-[#6BAF83]/50 p-3 text-xs sm:text-sm space-y-1">
                    <div className="font-bold text-[#6BAF83]">{entry.nasaTitle}:</div>
                    <p className="text-slate-200">{entry.nasaFact}</p>
                    <div className="text-[11px] font-mono text-slate-400">
                      {t.debriefSourceLabel} {entry.nasaSourceId}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-700 bg-[#152033] flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={onOpenScienceLibrary}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold bg-[#1e3a5f] hover:bg-[#274b7a] border border-[#70B8D3] text-white cursor-pointer"
          >
            <BookOpen className="w-4 h-4 text-[#70B8D3]" />
            {t.debriefOpenLibrary}
          </button>

          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center gap-2 px-6 py-2.5 text-sm sm:text-base font-bold bg-[#F2C879] hover:bg-[#f6d492] text-[#101828] border-2 border-[#fef3c7] shadow-[0_4px_0_#926c2a] cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            {t.debriefRetry}
          </button>
        </div>
      </div>
    </div>
  );
};
