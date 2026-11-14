import React, { useEffect, useState } from 'react';
import { ArrowRight, MessageSquare, Sparkles, X } from 'lucide-react';
import { soundEngine } from '../audio/soundEngine';
import { getUiCopy } from '../engine/i18n';
import {
  ActiveDialogueOverlay,
  DialogueChoiceOption,
  Language,
  SpeakerId,
} from '../engine/types';

interface DialogueOverlayProps {
  dialogue: ActiveDialogueOverlay | null;
  lang: Language;
  onContinue: () => void;
  onSelectChoice?: (choice: DialogueChoiceOption) => void;
  onClose?: () => void;
}

const SpeakerPortrait: React.FC<{ speaker: SpeakerId; size?: 'sm' | 'lg' }> = ({
  speaker,
  size = 'sm',
}) => {
  const cls =
    size === 'lg'
      ? 'w-20 h-20 sm:w-24 sm:h-24 shrink-0 border-2 bg-[#0f172a]'
      : 'w-11 h-11 shrink-0 border-2 bg-[#1e293b]';

  if (speaker === 'sam') {
    return (
      <svg viewBox="0 0 48 48" className={`${cls} border-[#f97316]`}>
        <rect x="8" y="28" width="32" height="19" fill="#f97316" />
        <rect x="14" y="32" width="20" height="4" fill="#fed7aa" />
        <rect x="11" y="7" width="26" height="23" fill="#fed7aa" />
        <rect x="14" y="12" width="20" height="11" fill="#0f172a" />
        <rect x="17" y="14" width="7" height="3.5" fill="#38bdf8" />
        <rect x="30" y="15" width="4" height="4" fill="#fb923c" />
      </svg>
    );
  }
  if (speaker === 'maya') {
    return (
      <svg viewBox="0 0 48 48" className={`${cls} border-[#6BAF83]`}>
        <rect x="8" y="28" width="32" height="19" fill="#6BAF83" />
        <rect x="14" y="32" width="20" height="4" fill="#bbf7d0" />
        <rect x="11" y="7" width="26" height="23" fill="#bbf7d0" />
        <rect x="14" y="12" width="20" height="11" fill="#0f172a" />
        <rect x="17" y="14" width="7" height="3.5" fill="#4ade80" />
        <rect x="30" y="15" width="4" height="4" fill="#a7f3d0" />
      </svg>
    );
  }
  if (speaker === 'commander') {
    return (
      <svg viewBox="0 0 48 48" className={`${cls} border-[#F2C879]`}>
        <rect x="8" y="28" width="32" height="19" fill="#f8fafc" />
        <rect x="14" y="32" width="20" height="4" fill="#F2C879" />
        <rect x="11" y="7" width="26" height="23" fill="#f8fafc" />
        <rect x="14" y="12" width="20" height="11" fill="#0f172a" />
        <rect x="17" y="14" width="14" height="4.5" fill="#F2C879" />
      </svg>
    );
  }
  if (speaker === 'operator') {
    return (
      <svg viewBox="0 0 48 48" className={`${cls} border-[#70B8D3]`}>
        <rect x="10" y="28" width="28" height="18" fill="#3b82f6" />
        <rect x="12" y="8" width="24" height="22" fill="#e2e8f0" />
        <rect x="15" y="13" width="18" height="10" fill="#0f172a" />
        <rect x="17" y="15" width="6" height="3" fill="#F2C879" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 48 48" className={`${cls} border-[#F2C879]`}>
      <circle cx="24" cy="24" r="14" fill="#1e3a5f" stroke="#F2C879" strokeWidth="2.5" />
      <circle cx="24" cy="24" r="5" fill="#70B8D3" />
    </svg>
  );
};

export const DialogueOverlay: React.FC<DialogueOverlayProps> = ({
  dialogue,
  lang,
  onContinue,
  onSelectChoice,
  onClose,
}) => {
  const t = getUiCopy(lang);
  const en = lang === 'en';
  const sequentialSteps = dialogue?.sequentialSteps;
  const isSequential = Boolean(sequentialSteps && sequentialSteps.length > 0);
  const isCinematicNpc = Boolean(!isSequential && dialogue?.choices && dialogue.choices.length > 0);

  const [stepIdx, setStepIdx] = useState(0);
  const [typedLen, setTypedLen] = useState(0);

  // Reset sequential step index whenever dialogue changes
  useEffect(() => {
    setStepIdx(0);
  }, [dialogue]);

  const currentStep = isSequential && sequentialSteps ? sequentialSteps[stepIdx] : undefined;

  // Typewriter character effect for locked steps (Steps 1 & 2)
  useEffect(() => {
    if (!currentStep) {
      setTypedLen(0);
      return;
    }
    if (!currentStep.typewriterLock) {
      setTypedLen(currentStep.text.length);
      return;
    }
    setTypedLen(0);
    const total = currentStep.text.length;
    const timer = window.setInterval(() => {
      setTypedLen((prev) => {
        if (prev >= total) {
          window.clearInterval(timer);
          return total;
        }
        soundEngine.playTypewriterBlip(prev);
        return prev + 1;
      });
    }, 16);
    return () => window.clearInterval(timer);
  }, [currentStep]);

  const isTypingLocked = Boolean(
    isSequential && currentStep?.typewriterLock && typedLen < currentStep.text.length,
  );
  const isLastSeqStep = Boolean(
    isSequential && sequentialSteps && stepIdx >= sequentialSteps.length - 1,
  );

  useEffect(() => {
    if (!dialogue) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Escape') {
        e.preventDefault();
        if (dialogue.mode === 'post_shift') {
          onContinue();
        } else if (onClose) {
          onClose();
        } else {
          onContinue();
        }
        return;
      }
      if (e.code === 'Enter' || e.code === 'Space') {
        e.preventDefault();
        if (isSequential) {
          if (isTypingLocked) return;
          soundEngine.playUiClick();
          if (!isLastSeqStep) {
            setStepIdx((prev) => prev + 1);
          } else {
            onContinue();
          }
          return;
        }
        if (isCinematicNpc && dialogue.choices && onSelectChoice) {
          const primary = dialogue.choices.find((c) => c.action === 'accept_quest');
          if (primary) {
            onSelectChoice(primary);
            return;
          }
          if (onClose) {
            onClose();
            return;
          }
        }
        onContinue();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [
    dialogue,
    isCinematicNpc,
    isLastSeqStep,
    isSequential,
    isTypingLocked,
    onContinue,
    onSelectChoice,
    onClose,
  ]);

  if (!dialogue) return null;

  const badgeColor = (speaker: SpeakerId) => {
    if (speaker === 'sam') return 'text-[#fb923c]';
    if (speaker === 'maya') return 'text-[#86efac]';
    if (speaker === 'operator') return 'text-[#70B8D3]';
    return 'text-[#F2C879]';
  };

  const handleCloseClick = () => {
    if (dialogue.mode === 'post_shift') {
      onContinue();
    } else if (onClose) {
      onClose();
    } else {
      onContinue();
    }
  };

  const choiceToneClasses = (tone: DialogueChoiceOption['tone']) => {
    switch (tone) {
      case 'primary':
        return 'bg-[#6BAF83] hover:bg-[#7fc798] text-[#09131f] border-[#bbf7d0] font-bold shadow-[0_3px_0_#1e5631]';
      case 'science':
        return 'bg-[#122a47] hover:bg-[#1a3c63] text-[#bae6fd] border-[#70B8D3] shadow-[0_3px_0_#0c4a6e]';
      case 'exit':
        return 'bg-[#3b151a] hover:bg-[#521c24] text-[#fecaca] border-[#f87171]/80 shadow-[0_3px_0_#450a0a]';
      case 'info':
      default:
        return 'bg-[#152033] hover:bg-[#1e2f4b] text-slate-100 border-[#F2C879]/70 shadow-[0_3px_0_#0f172a]';
    }
  };

  // =====================================================
  // SEQUENTIAL 3-STEP NPC QUEST BRIEFING OR COMMANDER MED BAY GUIDE
  // Fixed Left Portrait + Full-Width Bottom Rectangular Chat Box + Typewriter Lock
  // =====================================================
  if (isSequential && sequentialSteps && currentStep) {
    const portraitSpeaker: SpeakerId = dialogue.npcId || currentStep.speaker || 'sam';
    const isSam = portraitSpeaker === 'sam';
    const isMaya = portraitSpeaker === 'maya';
    const visibleText = currentStep.typewriterLock
      ? currentStep.text.slice(0, typedLen)
      : currentStep.text;
    const footerHint =
      currentStep.hintText ?? (isLastSeqStep ? dialogue.hintText : undefined);

    return (
      <div className="fixed inset-0 z-40 pointer-events-none flex flex-col justify-end p-3 sm:p-5 bg-gradient-to-t from-[#050a14]/75 via-transparent to-transparent">
        <div className="pointer-events-auto w-full flex flex-col md:flex-row items-stretch md:items-end gap-3">
          {/* Left Fixed NPC / Commander AI Portrait Card */}
          <div className="pixel-panel-warm bg-[#091222]/96 border-2 border-[#F2C879] p-3 sm:p-4 flex md:flex-col items-center gap-3 md:w-52 shrink-0 shadow-2xl">
            <SpeakerPortrait speaker={portraitSpeaker} size="lg" />
            <div className="min-w-0 md:text-center space-y-1">
              <div
                className={`text-sm sm:text-base font-bold leading-tight ${
                  isSam ? 'text-[#fb923c]' : isMaya ? 'text-[#86efac]' : 'text-[#F2C879]'
                }`}
              >
                {currentStep.speakerName}
              </div>
              {dialogue.npcRole && (
                <div className="text-[11px] font-mono text-[#70B8D3] leading-snug">
                  {dialogue.npcRole}
                </div>
              )}
              <div className="flex items-center md:justify-center gap-1 pt-1">
                {sequentialSteps.map((_, idx) => (
                  <span
                    key={idx}
                    className={`h-1.5 transition-all ${
                      idx === stepIdx
                        ? 'w-5 bg-[#F2C879]'
                        : idx < stepIdx
                          ? 'w-2.5 bg-[#6BAF83]'
                          : 'w-2.5 bg-slate-600'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Full-Width Rectangular Chat Box */}
          <div className="flex-1 pixel-panel-warm bg-[#091222]/96 border-2 border-[#F2C879] p-4 sm:p-5 space-y-3 shadow-2xl">
            <div className="flex items-center justify-between gap-2 border-b border-slate-700/80 pb-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="px-2 py-0.5 bg-[#162742] border border-[#70B8D3]/70 text-[11px] font-mono font-bold text-[#70B8D3] truncate">
                  {currentStep.tag}
                </span>
                <span className="hidden sm:inline text-xs font-mono text-slate-400 truncate">
                  {dialogue.title}
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[11px] font-mono font-bold text-[#F2C879] tabular-nums">
                  {stepIdx + 1} / {sequentialSteps.length}
                </span>
                <button
                  type="button"
                  onClick={handleCloseClick}
                  title={t.dialogueClose}
                  aria-label={t.dialogueClose}
                  className="w-7 h-7 flex items-center justify-center bg-[#dc2626] hover:bg-[#ef4444] border border-[#fecaca] text-white cursor-pointer"
                >
                  <X className="w-3.5 h-3.5 stroke-[3]" />
                </button>
              </div>
            </div>

            <p className="text-sm sm:text-base md:text-lg text-slate-100 leading-relaxed min-h-[3.5rem]">
              “{visibleText}”
              {isTypingLocked && (
                <span className="inline-block w-2 h-4 ml-1 bg-[#F2C879] animate-pulse align-middle" />
              )}
            </p>

            {footerHint && !isTypingLocked && (
              <div className="bg-[#0f172a] border border-[#F2C879]/50 px-3 py-1.5 text-xs font-mono text-[#F2C879]">
                {footerHint}
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <span className="text-[11px] font-mono text-slate-400">
                {isTypingLocked
                  ? en
                    ? '⏳ Reading briefing text... Next unlocks when finished'
                    : '⏳ Đang hiển thị nội dung... Nút Tiếp theo sẽ mở sau khi chạy xong'
                  : isLastSeqStep
                    ? en
                      ? 'Ready to confirm orders'
                      : 'Đã sẵn sàng xác nhận nhiệm vụ'
                    : en
                      ? 'Click Next to continue'
                      : 'Nhấn Tiếp theo để qua bước kế tiếp'}
              </span>

              <button
                type="button"
                disabled={isTypingLocked}
                onClick={() => {
                  if (isTypingLocked) return;
                  soundEngine.playUiClick();
                  if (!isLastSeqStep) {
                    setStepIdx((prev) => prev + 1);
                  } else {
                    onContinue();
                  }
                }}
                className={`inline-flex items-center gap-2 px-6 py-2.5 text-sm sm:text-base font-bold border-2 transition-all ${
                  isTypingLocked
                    ? 'bg-slate-800 text-slate-500 border-slate-700 opacity-45 cursor-not-allowed'
                    : isLastSeqStep
                      ? 'text-[#101828] bg-[#6BAF83] hover:bg-[#7fc798] border-[#bbf7d0] shadow-[0_4px_0_#1e5631] cursor-pointer'
                      : 'text-[#101828] bg-[#F2C879] hover:bg-[#f7d691] border-[#fef3c7] shadow-[0_4px_0_#926c2a] cursor-pointer'
                }`}
              >
                <span>
                  {isLastSeqStep
                    ? dialogue.finalActionLabel || dialogue.continueLabel
                    : en
                      ? 'Next'
                      : 'Tiếp theo'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =====================================================
  // CINEMATIC 3-REGION VISUAL NOVEL HUD (CREW CHAT DIALOGUE)
  // =====================================================
  if (isCinematicNpc && dialogue.choices) {
    const portraitSpeaker: SpeakerId = dialogue.npcId || dialogue.turns[0]?.speaker || 'sam';
    const npcDisplayName =
      dialogue.turns.find((tr) => tr.speaker === portraitSpeaker)?.speakerName || dialogue.title;
    const isSam = portraitSpeaker === 'sam';

    return (
      <div className="fixed inset-0 z-40 flex flex-col justify-between p-4 sm:p-6 bg-[#070d1a]/86">
        {/* TOP ROW: TOP-LEFT NPC PORTRAIT & ROLE + TOP-RIGHT PLAYER CHOICE OPTIONS */}
        <div className="flex flex-col md:flex-row items-stretch md:items-start justify-between gap-4">
          {/* REGION 1: TOP-LEFT NPC PORTRAIT + NASA ROLE CARD */}
          <div className="pixel-panel-warm p-3.5 sm:p-4 flex items-center gap-3.5 max-w-md bg-[#0b1324]/95">
            <SpeakerPortrait speaker={portraitSpeaker} size="lg" />
            <div className="min-w-0 space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`text-base sm:text-lg font-bold tracking-tight ${
                    isSam ? 'text-[#fb923c]' : 'text-[#86efac]'
                  }`}
                >
                  {npcDisplayName}
                </span>
                {dialogue.mode === 'quest_accept' && (
                  <span className="px-2 py-0.5 bg-[#dc2626] border border-[#fecaca] text-[10px] font-mono font-bold text-white">
                    {t.dialogueQuestAccept}
                  </span>
                )}
              </div>
              {dialogue.npcRole && (
                <div className="text-xs font-mono text-[#70B8D3] leading-snug">
                  {dialogue.npcRole}
                </div>
              )}
              <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5 pt-0.5">
                <Sparkles className="w-3.5 h-3.5 text-[#F2C879] shrink-0" />
                <span className="truncate">{dialogue.title}</span>
              </div>
            </div>
          </div>

          {/* REGION 2: TOP-RIGHT PLAYER INTERACTIVE CHOICES */}
          <div className="pixel-panel p-3.5 w-full md:w-[390px] bg-[#0b1324]/95 border-2 border-[#70B8D3]/75 space-y-2">
            <div className="flex items-center justify-between border-b border-slate-700/80 pb-1.5">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#F2C879]">
                {t.vnPlayerOptionsTitle}
              </span>
              <button
                type="button"
                onClick={handleCloseClick}
                title={t.dialogueClose}
                aria-label={t.dialogueClose}
                className="w-6 h-6 flex items-center justify-center bg-[#dc2626] hover:bg-[#ef4444] border border-[#fecaca] text-white cursor-pointer"
              >
                <X className="w-3.5 h-3.5 stroke-[3]" />
              </button>
            </div>
            <div className="flex flex-col gap-2">
              {dialogue.choices.map((choice) => (
                <button
                  key={choice.id}
                  type="button"
                  onClick={() => {
                    if (onSelectChoice) {
                      onSelectChoice(choice);
                    } else if (choice.action === 'close') {
                      handleCloseClick();
                    } else {
                      onContinue();
                    }
                  }}
                  className={`w-full text-left px-3 py-2 text-xs sm:text-sm border-2 transition-transform active:translate-y-0.5 cursor-pointer ${choiceToneClasses(
                    choice.tone,
                  )}`}
                >
                  {choice.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* REGION 3: BOTTOM FULL-WIDTH DIALOGUE BOX */}
        <div className="w-full pixel-panel-warm p-4 sm:p-5 bg-[#0b1324]/96 border-2 border-[#F2C879] space-y-3 shadow-2xl">
          <div className="space-y-2.5 max-h-[34vh] overflow-y-auto pr-1">
            {dialogue.turns.map((turn, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 bg-[#132038]/95 border border-slate-700/90 px-3.5 py-2.5"
              >
                <SpeakerPortrait speaker={turn.speaker} />
                <div className="space-y-0.5 min-w-0">
                  <div className={`text-xs font-mono font-bold ${badgeColor(turn.speaker)}`}>
                    {turn.speakerName}
                  </div>
                  <p className="text-sm sm:text-base md:text-lg text-slate-100 leading-snug">
                    “{turn.text}”
                  </p>
                </div>
              </div>
            ))}
          </div>

          {dialogue.hintText && (
            <div className="bg-[#0f172a] border border-[#F2C879]/50 px-3.5 py-2 text-xs sm:text-sm font-mono text-[#F2C879]">
              {dialogue.hintText}
            </div>
          )}
        </div>
      </div>
    );
  }


  // =====================================================
  // STANDARD BLURRED DIALOGUE (POST-SHIFT / DEVICE / PROP)
  // =====================================================
  return (
    <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center p-4 bg-[#0b111e]/86">
      <div className="pixel-panel-warm max-w-2xl w-full p-5 space-y-4 relative">
        <div className="flex items-center justify-between gap-3 border-b border-slate-700 pb-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              type="button"
              onClick={handleCloseClick}
              title={t.dialogueClose}
              aria-label={t.dialogueClose}
              className="w-8 h-8 shrink-0 flex items-center justify-center bg-[#dc2626] hover:bg-[#ef4444] border-2 border-[#fecaca] text-white shadow-[0_2px_0_#7f1d1d] cursor-pointer"
            >
              <X className="w-4 h-4 stroke-[3]" />
            </button>
            <div className="flex items-center gap-2 text-sm sm:text-base font-bold text-[#F2C879] truncate">
              <MessageSquare className="w-4 h-4 text-[#70B8D3] shrink-0" />
              <span className="truncate">{dialogue.title}</span>
            </div>
          </div>
          <span
            className={`text-[11px] font-mono shrink-0 ${
              dialogue.mode === 'quest_accept'
                ? 'px-2 py-0.5 bg-[#dc2626] text-white font-bold'
                : 'text-slate-400'
            }`}
          >
            {dialogue.mode === 'post_shift'
              ? t.dialoguePostShift
              : dialogue.mode === 'device_status'
                ? t.dialogueDeviceStatus
                : dialogue.mode === 'quest_accept'
                  ? t.dialogueQuestAccept
                  : t.dialogueExplore}
          </span>
        </div>

        <div className="space-y-3">
          {dialogue.turns.map((turn, idx) => (
            <div
              key={idx}
              className="flex items-start gap-3 bg-[#152033] border border-slate-700 p-3"
            >
              <SpeakerPortrait speaker={turn.speaker} />
              <div className="space-y-0.5">
                <div className={`text-xs font-mono font-bold ${badgeColor(turn.speaker)}`}>
                  {turn.speakerName}
                </div>
                <p className="text-sm sm:text-base text-slate-100 leading-snug">
                  {dialogue.mode === 'device_status' ? turn.text : `“${turn.text}”`}
                </p>
              </div>
            </div>
          ))}
        </div>

        {dialogue.hintText && (
          <div className="bg-[#0f172a] border border-[#F2C879]/40 px-3 py-2 text-xs font-mono text-[#F2C879]">
            {dialogue.hintText}
          </div>
        )}

        <div className="flex justify-end pt-1">
          <button
            type="button"
            onClick={onContinue}
            className={`inline-flex items-center gap-2 px-6 py-2.5 font-bold border-2 cursor-pointer ${
              dialogue.mode === 'quest_accept'
                ? 'text-[#101828] bg-[#6BAF83] hover:bg-[#7fc798] border-[#bbf7d0] shadow-[0_4px_0_#1e5631]'
                : 'text-[#101828] bg-[#F2C879] hover:bg-[#f7d691] border-[#fef3c7] shadow-[0_4px_0_#926c2a]'
            }`}
          >
            {dialogue.continueLabel}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
