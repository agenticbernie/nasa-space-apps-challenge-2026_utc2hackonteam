import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  ChevronLeft,
  FastForward,
  Globe,
  Play,
  Rocket,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';
import { soundEngine } from '../audio/soundEngine';
import { getCommanderWelcomeSentences } from '../engine/dialogueData';
import { getUiCopy } from '../engine/i18n';
import { validateAstronautCallsign } from '../engine/questAndAchievements';
import { GamePhase, Language } from '../engine/types';

interface OnboardingModalsProps {
  phase: GamePhase;
  callsign: string;
  lang: Language;
  cutsceneStage: number;
  onToggleLanguage: (lang: Language) => void;
  onBackToTitle: () => void;
  onSubmitCallsign: (validCallsign: string) => void;
  onFinishCutscene: () => void;
  onCompleteTutorial: () => void;
}

export const OnboardingModals: React.FC<OnboardingModalsProps> = ({
  phase,
  callsign,
  lang,
  cutsceneStage,
  onToggleLanguage,
  onBackToTitle,
  onSubmitCallsign,
  onFinishCutscene,
  onCompleteTutorial,
}) => {
  const [draft, setDraft] = useState(callsign || '');
  const [sentenceIdx, setSentenceIdx] = useState(0);
  const [typedLen, setTypedLen] = useState(0);

  useEffect(() => {
    if (phase === 'tutorial_npc') {
      setSentenceIdx(0);
    }
  }, [phase]);

  const welcomeSentences =
    phase === 'tutorial_npc' ? getCommanderWelcomeSentences(callsign, lang) : [];
  const activeWelcomeText = welcomeSentences[sentenceIdx] ?? '';

  useEffect(() => {
    if (phase !== 'tutorial_npc') {
      setTypedLen(0);
      return;
    }
    setTypedLen(0);
    const total = activeWelcomeText.length;
    if (total === 0) return;
    const timer = window.setInterval(() => {
      setTypedLen((prev) => {
        if (prev >= total) {
          window.clearInterval(timer);
          return total;
        }
        soundEngine.playTypewriterBlip(prev);
        return prev + 1;
      });
    }, 18);
    return () => window.clearInterval(timer);
  }, [phase, sentenceIdx, activeWelcomeText]);

  if (phase !== 'callsign' && phase !== 'cutscene' && phase !== 'tutorial_npc') {
    return null;
  }

  const t = getUiCopy(lang);
  const en = lang === 'en';
  const validation = validateAstronautCallsign(draft, lang);

  const LanguageSwitch = (
    <div
      className="inline-flex items-center bg-[#0f172a] border border-[#70B8D3]/60 p-0.5 text-xs font-mono"
      role="group"
      aria-label="Language Switcher"
    >
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
  );

  // =====================================================
  // STEP 1: ASTRONAUT CALLSIGN INPUT (STRICT ^[a-zA-Z_]+$)
  // =====================================================
  if (phase === 'callsign') {
    const handleFormSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!validation.valid) return;
      onSubmitCallsign(draft);
    };

    return (
      <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-[#070d1a]/92">
        <form
          onSubmit={handleFormSubmit}
          className="pixel-panel-warm max-w-lg w-full p-6 space-y-5"
        >
          <div className="flex items-start justify-between gap-3 border-b border-slate-700 pb-3">
            <div>
              <div className="text-[11px] font-mono uppercase tracking-wider text-[#70B8D3]">
                {t.callsignTag}
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#F2C879] mt-0.5 flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-[#6BAF83] shrink-0" />
                <span>{t.callsignTitle}</span>
              </h2>
            </div>
            {LanguageSwitch}
          </div>

          <p className="text-sm text-slate-200 leading-relaxed">{t.callsignDesc}</p>

          <div className="space-y-2">
            <label
              htmlFor="astronaut-callsign-input"
              className="block text-xs font-mono uppercase tracking-wider text-[#70B8D3]"
            >
              CALLSIGN (Regex: /^[a-zA-Z_]+$/)
            </label>
            <input
              id="astronaut-callsign-input"
              type="text"
              autoFocus
              maxLength={24}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={t.callsignPlaceholder}
              className={`w-full px-4 py-3 bg-[#09111f] border-2 font-mono text-base text-white focus:outline-none ${
                draft.length === 0
                  ? 'border-slate-600 focus:border-[#70B8D3]'
                  : validation.valid
                    ? 'border-[#6BAF83] text-[#bbf7d0]'
                    : 'border-[#D76562] text-[#fecaca]'
              }`}
            />

            <p className="text-xs font-mono text-slate-400">{t.callsignRuleHint}</p>

            {draft.length > 0 && !validation.valid && validation.errorMessage && (
              <div
                role="alert"
                className="p-3 bg-[#450a0a]/85 border border-[#D76562] text-xs font-semibold text-[#fecaca] flex items-start gap-2"
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#f87171]" />
                <span>{validation.errorMessage}</span>
              </div>
            )}

            {validation.valid && (
              <div className="p-2.5 bg-[#122620] border border-[#6BAF83]/70 text-xs font-mono font-bold text-[#bbf7d0] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#6BAF83] shrink-0" />
                <span>
                  {en
                    ? `Valid Callsign Ready: ${draft}`
                    : `Định danh hợp lệ: ${draft}`}
                </span>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-700">
            <button
              type="button"
              onClick={onBackToTitle}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold bg-[#182235] hover:bg-[#24324d] border border-slate-600 text-slate-200 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>{t.callsignBackBtn}</span>
            </button>

            <button
              type="submit"
              disabled={!validation.valid}
              className={`inline-flex items-center gap-2 px-6 py-3 text-sm sm:text-base font-bold border-2 transition-colors ${
                validation.valid
                  ? 'bg-[#6BAF83] hover:bg-[#82c499] text-[#101828] border-[#bbf7d0] shadow-[0_4px_0_#2c5e3e] cursor-pointer'
                  : 'bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed'
              }`}
            >
              <Rocket className="w-4 h-4" />
              <span>{t.callsignConfirmBtn}</span>
            </button>
          </div>
        </form>
      </div>
    );
  }

  // =====================================================
  // STEP 2: REAL-TIME 3D INTRO CUTSCENE OVERLAY (LIVE THREE.JS VIEWPORT BEHIND)
  // =====================================================
  if (phase === 'cutscene') {
    const safeIdx = Math.max(0, Math.min(t.cutsceneStages.length - 1, cutsceneStage));
    const stage = t.cutsceneStages[safeIdx] ?? t.cutsceneStages[0];

    return (
      <div className="fixed inset-0 z-40 pointer-events-none flex flex-col justify-between p-4 sm:p-6">
        {/* Top Cinematic Letterbox Bar + Skip Button */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="pointer-events-auto pixel-panel bg-[#070d1a]/88 border border-[#70B8D3]/70 px-3.5 py-2 flex items-center gap-2.5">
            <Rocket className="w-4 h-4 text-[#F2C879] shrink-0" />
            <div className="text-xs font-mono">
              <div className="font-bold text-[#70B8D3]">{stage.tag}</div>
              <div className="text-slate-300 text-[11px]">
                {en
                  ? `Astronaut: ${callsign || 'Commander'}`
                  : `Phi hành gia: ${callsign || 'Commander'}`}
              </div>
            </div>
          </div>

          <div className="pointer-events-auto flex items-center gap-2">
            {LanguageSwitch}
            <button
              type="button"
              onClick={() => {
                soundEngine.playUiClick();
                onFinishCutscene();
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-mono font-bold bg-[#0c1629]/95 hover:bg-[#1e2f4b] border-2 border-[#F2C879] text-[#F2C879] shadow-lg cursor-pointer"
            >
              <FastForward className="w-4 h-4" />
              <span>{t.cutsceneSkipBtn}</span>
            </button>
          </div>
        </div>

        {/* Bottom Cinematic Subtitle Strip */}
        <div className="pointer-events-auto w-full max-w-4xl mx-auto pixel-panel bg-[#060c18]/90 border-2 border-[#70B8D3]/80 px-5 py-4 space-y-2.5 shadow-2xl">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-base sm:text-xl font-bold text-[#F2C879]">{stage.title}</h2>
            <div className="flex items-center gap-1.5 shrink-0">
              {t.cutsceneStages.map((_, i) => (
                <span
                  key={i}
                  className={`h-2 transition-all ${
                    i === safeIdx
                      ? 'w-7 bg-[#F2C879]'
                      : i < safeIdx
                        ? 'w-3 bg-[#6BAF83]'
                        : 'w-3 bg-slate-600'
                  }`}
                />
              ))}
            </div>
          </div>
          <p className="text-sm sm:text-base text-slate-100 leading-relaxed">
            {stage.subtitle}
          </p>
        </div>
      </div>
    );
  }

  // =====================================================
  // STEP 3: COMMANDER AI SENTENCE-BY-SENTENCE WELCOME CHAT (LEFT PORTRAIT + BOTTOM BAR)
  // Once finished, Commander permanently switches to autonomous station patrol.
  // =====================================================
  const sentences = getCommanderWelcomeSentences(callsign, lang);
  const clampedIdx = Math.max(0, Math.min(sentences.length - 1, sentenceIdx));
  const currentSentence = sentences[clampedIdx] ?? '';
  const isLastSentence = clampedIdx >= sentences.length - 1;

  return (
    <div className="fixed inset-0 z-40 pointer-events-none flex flex-col justify-between p-3 sm:p-5">
      {/* Top-Right Language Switch */}
      <div className="flex justify-end">
        <div className="pointer-events-auto">{LanguageSwitch}</div>
      </div>

      {/* Bottom Visual Novel Bar: Commander Portrait Left + Full-Width Rectangular Chat Box */}
      <div className="pointer-events-auto w-full flex flex-col md:flex-row items-stretch md:items-end gap-3">
        {/* Left Character Portrait Card */}
        <div className="pixel-panel-warm bg-[#091222]/96 border-2 border-[#F2C879] p-3 sm:p-4 flex md:flex-col items-center gap-3 md:w-52 shrink-0 shadow-2xl">
          <svg
            viewBox="0 0 48 48"
            className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 shrink-0 border-2 border-[#F2C879] bg-[#0f172a]"
          >
            <rect x="8" y="28" width="32" height="19" fill="#f8fafc" />
            <rect x="14" y="32" width="20" height="4" fill="#F2C879" />
            <rect x="11" y="7" width="26" height="23" fill="#f8fafc" />
            <rect x="14" y="12" width="20" height="11" fill="#0f172a" />
            <rect x="17" y="14" width="14" height="5" fill="#F2C879" />
          </svg>
          <div className="md:text-center space-y-0.5">
            <div className="text-sm sm:text-base font-bold text-[#F2C879]">
              {en ? 'Commander AI' : 'Chỉ Huy Trạm AI'}
            </div>
            <div className="text-[11px] font-mono text-[#70B8D3]">
              {en ? 'Aurora Station Commander' : 'AI Điều Hành Trạm Aurora'}
            </div>
          </div>
        </div>

        {/* Bottom Full-Width Rectangular Chat Box */}
        <div className="flex-1 pixel-panel-warm bg-[#091222]/96 border-2 border-[#F2C879] p-4 sm:p-5 space-y-3 shadow-2xl">
          <div className="flex items-center justify-between gap-2 border-b border-slate-700/80 pb-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#70B8D3]">
              {en ? 'STATION BRIEFING · AURORA SOUTH POLE' : 'PHỔ BIẾN SỨ MỆNH · CỰC NAM AURORA'}
            </span>
            <span className="px-2 py-0.5 bg-[#152238] border border-slate-600 text-[11px] font-mono font-bold text-[#F2C879] tabular-nums">
              {clampedIdx + 1} / {sentences.length}
            </span>
          </div>

          <p className="text-sm sm:text-base md:text-lg text-slate-100 leading-relaxed min-h-[3.2rem]">
            “{currentSentence.slice(0, typedLen)}”
            {typedLen < currentSentence.length && (
              <span className="inline-block w-2 h-4 ml-1 bg-[#F2C879] animate-pulse align-middle" />
            )}
          </p>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <span className="text-xs font-mono text-slate-400">
              {en
                ? `Astronaut ${callsign || 'Commander'} · 72-Hour Artemis Survival`
                : `Phi hành gia ${callsign || 'Commander'} · Sứ mệnh 72 giờ Artemis`}
            </span>

            <button
              type="button"
              onClick={() => {
                if (typedLen < currentSentence.length) {
                  soundEngine.playUiClick();
                  setTypedLen(currentSentence.length);
                  return;
                }
                if (isLastSentence) {
                  soundEngine.playDecisionConfirm();
                  onCompleteTutorial();
                } else {
                  soundEngine.playUiClick();
                  setSentenceIdx((prev) => Math.min(sentences.length - 1, prev + 1));
                }
              }}
              className={`inline-flex items-center gap-2 px-6 py-2.5 text-sm sm:text-base font-bold border-2 cursor-pointer ${
                isLastSentence
                  ? 'text-[#101828] bg-[#6BAF83] hover:bg-[#82c499] border-[#bbf7d0] shadow-[0_4px_0_#2c5e3e]'
                  : 'text-[#101828] bg-[#F2C879] hover:bg-[#f7d794] border-[#fef3c7] shadow-[0_4px_0_#926c2a]'
              }`}
            >
              {isLastSentence ? (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>{en ? 'Enter Station (Shift 1)' : 'Vào Trạm Aurora (Ca 1)'}</span>
                </>
              ) : (
                <>
                  <span>{en ? 'Next' : 'Tiếp theo'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

