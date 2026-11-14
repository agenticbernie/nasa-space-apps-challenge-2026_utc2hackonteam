import React, { useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  Globe,
  Rocket,
  ShieldAlert,
  ShieldCheck,
  Sprout,
  Volume2,
  VolumeX,
  Wind,
  Zap,
} from 'lucide-react';
import { soundEngine } from '../audio/soundEngine';
import { getUiCopy } from '../engine/i18n';
import { validateAstronautCallsign } from '../engine/questAndAchievements';
import { AstronautBadgeId, GamePhase, Language } from '../engine/types';

interface TitleOverlayProps {
  phase: GamePhase;
  lang: Language;
  initialCallsign: string;
  initialBadge: AstronautBadgeId;
  muted: boolean;
  onToggleMute: () => void;
  onToggleLanguage: (lang: Language) => void;
  onStartMission: (validCallsign: string, badge: AstronautBadgeId) => void;
  onBeginMission: () => void;
}

const BADGE_OPTIONS: AstronautBadgeId[] = ['rocket', 'moon', 'planet', 'star'];

export const TitleOverlay: React.FC<TitleOverlayProps> = ({
  phase,
  lang,
  initialCallsign,
  initialBadge,
  muted,
  onToggleMute,
  onToggleLanguage,
  onStartMission,
  onBeginMission,
}) => {
  const [draft, setDraft] = useState(initialCallsign || '');
  const [badge, setBadge] = useState<AstronautBadgeId>(initialBadge || 'rocket');
  const [touched, setTouched] = useState(false);

  if (phase !== 'title' && phase !== 'intro') return null;

  const t = getUiCopy(lang);
  const en = lang === 'en';
  const validation = validateAstronautCallsign(draft, lang);

  const LanguageSwitch = (
    <div
      className="inline-flex items-center bg-[#0d1729]/95 border border-[#70B8D3]/70 p-0.5 text-xs font-mono"
      role="group"
      aria-label="Language Switcher"
    >
      <Globe className="w-3.5 h-3.5 text-[#70B8D3] mx-1.5" />
      <button
        type="button"
        onClick={() => {
          soundEngine.unlockAudio();
          soundEngine.playUiClick();
          onToggleLanguage('vi');
        }}
        className={`px-2 py-1 font-bold cursor-pointer transition-colors ${
          lang === 'vi' ? 'bg-[#F2C879] text-[#101828]' : 'text-slate-300 hover:text-white'
        }`}
      >
        VI
      </button>
      <button
        type="button"
        onClick={() => {
          soundEngine.unlockAudio();
          soundEngine.playUiClick();
          onToggleLanguage('en');
        }}
        className={`px-2 py-1 font-bold cursor-pointer transition-colors ${
          lang === 'en' ? 'bg-[#F2C879] text-[#101828]' : 'text-slate-300 hover:text-white'
        }`}
      >
        EN
      </button>
    </div>
  );

  if (phase === 'title') {
    const handleLaunchSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      soundEngine.unlockAudio();
      setTouched(true);
      if (!validation.valid) {
        soundEngine.playBeep(260, 0.08, 'square', 0.05);
        return;
      }
      soundEngine.playDecisionConfirm();
      onStartMission(draft, badge);
    };

    return (
      <div
        className="fixed inset-0 z-30 flex flex-col justify-between px-4 sm:px-6 py-4 sm:py-6 pointer-events-none"
        onPointerDown={() => soundEngine.unlockAudio()}
      >
        {/* Top Bar: Aurora Station Emblem Tag + Audio Quick Toggle + VI/EN */}
        <div className="w-full max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-2 pointer-events-auto">
          <div className="inline-flex items-center gap-2 text-[11px] sm:text-xs font-mono tracking-wider uppercase text-[#70B8D3] border-2 border-[#70B8D3]/60 bg-[#0b1424]/92 px-3 py-1.5 shadow-lg">
            <Rocket className="w-3.5 h-3.5 text-[#F2C879] shrink-0" />
            <span>{t.prologueTag}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                soundEngine.unlockAudio();
                soundEngine.playUiClick();
                onToggleMute();
              }}
              title={muted ? t.muteOn : t.muteOff}
              className="p-2 bg-[#0d1729]/95 hover:bg-[#192842] border border-[#70B8D3]/70 text-slate-100 cursor-pointer"
            >
              {muted ? (
                <VolumeX className="w-4 h-4 text-[#D76562]" />
              ) : (
                <Volume2 className="w-4 h-4 text-[#6BAF83]" />
              )}
            </button>
            {LanguageSwitch}
          </div>
        </div>

        {/* Upper Title Logo Banner — Compact & Clear of Center Viewport Showcase */}
        <div className="pointer-events-auto w-full max-w-3xl mx-auto flex flex-col items-center text-center mt-1">
          <div className="w-fit max-w-[92vw] px-5 sm:px-7 py-3 bg-[#0a1324]/92 border-[3px] border-[#F2C879] rounded-xl shadow-[0_8px_0_rgba(0,0,0,0.8)] flex items-center gap-4 text-left">
            {/* Kid-friendly Artemis Mission Patch SVG */}
            <svg viewBox="0 0 84 84" className="w-14 h-14 sm:w-16 sm:h-16 shrink-0" aria-hidden="true">
              <defs>
                <linearGradient id="patchSpace" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#1e3a8a" />
                  <stop offset="100%" stopColor="#0b1120" />
                </linearGradient>
              </defs>
              <circle cx="42" cy="42" r="38" fill="url(#patchSpace)" stroke="#F2C879" strokeWidth="3.5" />
              <circle cx="24" cy="24" r="2" fill="#fef08a" />
              <circle cx="62" cy="22" r="2.2" fill="#38bdf8" />
              <circle cx="58" cy="58" r="1.8" fill="#fef08a" />
              <path d="M16 56 Q42 18 68 54" fill="none" stroke="#38bdf8" strokeWidth="2.5" strokeDasharray="4 3" />
              <circle cx="42" cy="52" r="16" fill="#cbd5e1" stroke="#64748b" strokeWidth="2" />
              <circle cx="36" cy="49" r="3" fill="#94a3b8" />
              <circle cx="48" cy="53" r="4" fill="#94a3b8" />
              <path d="M42 18 L48 34 L42 31 L36 34 Z" fill="#f97316" stroke="#fef3c7" strokeWidth="1.5" />
            </svg>
            <div className="min-w-0">
              <h1 className="text-xl sm:text-3xl md:text-4xl font-extrabold font-mono tracking-wider text-[#F2C879] leading-tight">
                THE LAST 72 HOURS
              </h1>
              <p className="text-xs sm:text-sm md:text-base font-semibold text-[#bae6fd] mt-0.5">
                {t.titleSubtitle}
              </p>
            </div>
          </div>
        </div>

        {/* Lower-Center Interactive Junior Astronaut ID Card & Launch Pad */}
        <div className="pointer-events-auto w-full max-w-xl mx-auto mt-auto space-y-2.5">
          <form
            onSubmit={handleLaunchSubmit}
            className="pixel-panel-warm bg-[#0a1324]/94 border-[3px] border-[#70B8D3] rounded-xl p-4 sm:p-5 space-y-3.5 shadow-[0_14px_40px_rgba(0,0,0,0.8)]"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-700/80 pb-2">
              <div className="flex items-center gap-2 text-xs sm:text-sm font-mono font-bold text-[#F2C879]">
                <span className="text-lg">{t.startBadges[badge].icon}</span>
                <span>{t.startIdCardTitle}</span>
              </div>
              <span className="text-[11px] font-mono text-[#70B8D3]">
                ARTEMIS SOUTH POLE · 72H
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-start">
              {/* Name Input */}
              <div className="sm:col-span-7 space-y-1.5">
                <label
                  htmlFor="title-callsign-input"
                  className="block text-[11px] font-mono font-bold uppercase tracking-wider text-[#bae6fd]"
                >
                  {t.callsignPlaceholder}
                </label>
                <input
                  id="title-callsign-input"
                  type="text"
                  maxLength={24}
                  value={draft}
                  onChange={(e) => {
                    soundEngine.unlockAudio();
                    setDraft(e.target.value);
                    if (!touched) setTouched(true);
                  }}
                  placeholder={en ? 'Ex: Minh_Mars' : 'VD: Minh_VuTru'}
                  className={`w-full px-3.5 py-2.5 bg-[#070d19] border-2 rounded-lg font-mono text-sm sm:text-base text-white focus:outline-none ${
                    draft.length === 0
                      ? 'border-slate-600 focus:border-[#70B8D3]'
                      : validation.valid
                        ? 'border-[#6BAF83] text-[#bbf7d0]'
                        : 'border-[#D76562] text-[#fecaca]'
                  }`}
                />
                <p className="text-[11px] font-mono text-slate-400 leading-snug">
                  {t.callsignRuleHint}
                </p>
              </div>

              {/* Crew Badge Picker */}
              <div className="sm:col-span-5 space-y-1.5">
                <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#bae6fd]">
                  {t.startBadgeLabel}
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {BADGE_OPTIONS.map((bId) => {
                    const meta = t.startBadges[bId];
                    const selected = badge === bId;
                    return (
                      <button
                        key={bId}
                        type="button"
                        onClick={() => {
                          soundEngine.unlockAudio();
                          soundEngine.playUiClick();
                          setBadge(bId);
                        }}
                        title={meta.label}
                        className={`py-2 rounded-lg border-2 flex flex-col items-center justify-center transition-all cursor-pointer ${
                          selected
                            ? 'bg-[#2a210f] border-[#F2C879] scale-105 shadow-[0_0_12px_rgba(242,200,121,0.4)]'
                            : 'bg-[#101c31] border-slate-700 hover:border-[#70B8D3]'
                        }`}
                      >
                        <span className="text-xl leading-none">{meta.icon}</span>
                        <span className="text-[9px] font-mono text-slate-200 mt-1 truncate max-w-full px-0.5">
                          {meta.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {touched && !validation.valid && validation.errorMessage && (
              <div
                role="alert"
                className="px-3 py-2 bg-[#450a0a]/90 border border-[#D76562] rounded text-xs font-semibold text-[#fecaca] flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4 shrink-0 text-[#f87171]" />
                <span>{validation.errorMessage}</span>
              </div>
            )}

            {validation.valid && (
              <div className="px-3 py-1.5 bg-[#122620] border border-[#6BAF83]/70 rounded text-xs font-mono font-bold text-[#bbf7d0] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#6BAF83] shrink-0" />
                <span>
                  {en
                    ? `Ready! Crew Card: ${t.startBadges[badge].icon} ${draft}`
                    : `Sẵn sàng! Thẻ Phi Hành Gia: ${t.startBadges[badge].icon} ${draft}`}
                </span>
              </div>
            )}

            <button
              type="submit"
              className={`w-full py-3.5 px-6 rounded-lg text-base sm:text-lg font-extrabold tracking-wide border-2 transition-all flex items-center justify-center gap-2.5 ${
                validation.valid
                  ? 'bg-[#F2C879] hover:bg-[#f7d794] text-[#101828] border-[#fffbeb] shadow-[0_5px_0_#926c2a] active:translate-y-0.5 cursor-pointer'
                  : 'bg-[#1e293b] hover:bg-[#27354c] text-[#F2C879] border-[#70B8D3]/60 cursor-pointer'
              }`}
            >
              <span>{t.startLaunchCta}</span>
            </button>

            <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-slate-300 pt-0.5">
              <span>{t.controlsHint}</span>
              <span className="text-[#70B8D3]">{t.startAudioTip}</span>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Fallback legacy Mission Intro screen if phase === 'intro'
  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center p-4 bg-[#101828]/88">
      <div className="pixel-panel-warm max-w-2xl w-full p-6 sm:p-7 space-y-5 max-h-[94vh] overflow-y-auto custom-scroll">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-700 pb-3">
          <div>
            <p className="text-xs font-mono uppercase tracking-wider text-[#70B8D3]">
              {t.introHeaderTag}
            </p>
            <h2 className="text-xl sm:text-2xl font-bold text-[#F2C879]">{t.introTitle}</h2>
          </div>
          <div className="flex items-center gap-2">
            {LanguageSwitch}
            <span className="text-xs font-mono bg-[#1e293b] border border-slate-600 px-2.5 py-1 text-slate-200">
              {t.introShiftDuration}
            </span>
          </div>
        </div>

        <p className="text-sm sm:text-base text-slate-200 leading-relaxed">{t.introDesc}</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="bg-[#182235] border border-[#70B8D3]/50 p-3 flex items-start gap-3">
            <Zap className="w-5 h-5 text-[#70B8D3] shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-sm text-[#70B8D3]">{t.sysPowerTitle}</div>
              <div className="text-xs text-slate-300 mt-0.5">{t.sysPowerDesc}</div>
            </div>
          </div>

          <div className="bg-[#182235] border border-[#6BAF83]/50 p-3 flex items-start gap-3">
            <Wind className="w-5 h-5 text-[#6BAF83] shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-sm text-[#6BAF83]">{t.sysWaterTitle}</div>
              <div className="text-xs text-slate-300 mt-0.5">{t.sysWaterDesc}</div>
            </div>
          </div>

          <div className="bg-[#182235] border border-[#6BAF83]/50 p-3 flex items-start gap-3">
            <Sprout className="w-5 h-5 text-[#6BAF83] shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-sm text-[#6BAF83]">{t.sysGardenTitle}</div>
              <div className="text-xs text-slate-300 mt-0.5">{t.sysGardenDesc}</div>
            </div>
          </div>

          <div className="bg-[#182235] border border-[#F0B85D]/50 p-3 flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-[#F0B85D] shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-sm text-[#F0B85D]">{t.sysShelterTitle}</div>
              <div className="text-xs text-slate-300 mt-0.5">{t.sysShelterDesc}</div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-700">
          <div className="text-xs text-slate-400">{t.introTip}</div>
          <button
            type="button"
            onClick={() => {
              soundEngine.playUiClick();
              onBeginMission();
            }}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 font-bold text-[#101828] bg-[#6BAF83] hover:bg-[#7fc497] border-2 border-[#bbf7d0] shadow-[0_4px_0_#2c5e3e] cursor-pointer"
          >
            {t.enterShift1Btn}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
