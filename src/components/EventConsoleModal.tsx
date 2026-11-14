import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock,
  PackageSearch,
  Sparkles,
  Wrench,
  X,
  Zap,
} from 'lucide-react';
import { soundEngine } from '../audio/soundEngine';
import { getUiCopy } from '../engine/i18n';
import { SUPPLY_ITEMS_META } from '../engine/nasaData';
import { QUEST_DEFINITIONS } from '../engine/questAndAchievements';
import {
  getLocalizedScienceCard,
  getRepairProcedureForShift,
  getShiftScript,
  localizeConsequence,
} from '../engine/simulationEngine';
import { ChoiceId, GameState, Language, RepairStepOption, SupplyItemId } from '../engine/types';

interface EventConsoleModalProps {
  gameState: GameState;
  lang: Language;
  onSelectChoice: (choiceId: ChoiceId) => void;
  onContinueAfterConsequence: () => void;
  onDismissScienceCard: () => void;
  onCloseConsole: () => void;
  onOpenRoverConsole: () => void;
  onCompleteRepairStep: (shift: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8) => void;
  onGoToKnowledgeStep: () => void;
  onMarkKnowledgeRead: () => void;
  onAcceptExecution: () => void;
  onFailQuestTriggerSalvage: (neededPart?: SupplyItemId | null) => void;
  onRetryFromSalvage: () => void;
}

export const EventConsoleModal: React.FC<EventConsoleModalProps> = ({
  gameState,
  lang,
  onSelectChoice,
  onContinueAfterConsequence,
  onDismissScienceCard,
  onCloseConsole,
  onOpenRoverConsole,
  onCompleteRepairStep,
  onGoToKnowledgeStep,
  onMarkKnowledgeRead,
  onAcceptExecution,
  onFailQuestTriggerSalvage,
  onRetryFromSalvage,
}) => {
  const [repairStepProgress, setRepairStepProgress] = useState<number>(1);
  const [wrongHint, setWrongHint] = useState<string | null>(null);
  const [nowMs, setNowMs] = useState<number>(() => Date.now());
  const timeoutTriggeredRef = useRef(false);

  // Reset local step hints cleanly on shift/phase change
  useEffect(() => {
    setRepairStepProgress(1);
    setWrongHint(null);
    timeoutTriggeredRef.current = false;
  }, [gameState.shift, gameState.phase, gameState.quest_step]);

  // Live ticker for Timed Execution Countdown + Malfunction Cooldown
  useEffect(() => {
    const hasExecTimer =
      gameState.phase === 'console' &&
      gameState.quest_step === 'executing' &&
      gameState.quest_exec_deadline_ms !== null;
    const hasMalf = gameState.malfunction_until > Date.now();
    if (!hasExecTimer && !hasMalf) return;

    setNowMs(Date.now());
    const timer = window.setInterval(() => {
      setNowMs(Date.now());
    }, 250);
    return () => window.clearInterval(timer);
  }, [gameState.phase, gameState.quest_step, gameState.quest_exec_deadline_ms, gameState.malfunction_until]);

  const proc = getRepairProcedureForShift(gameState.shift);
  const orderedRepairButtons = useMemo<RepairStepOption[]>(() => {
    if (!proc) return [];
    const s = proc.steps;
    if (s.length < 3) return s;
    return gameState.shift % 2 === 1 ? [s[1], s[2], s[0]] : [s[2], s[0], s[1]];
  }, [proc, gameState.shift]);

  // Trigger Step 4 salvage sub-quest automatically if timed execution runs out!
  useEffect(() => {
    if (
      gameState.phase === 'console' &&
      gameState.quest_step === 'executing' &&
      gameState.quest_exec_deadline_ms !== null &&
      !timeoutTriggeredRef.current &&
      nowMs >= gameState.quest_exec_deadline_ms
    ) {
      timeoutTriggeredRef.current = true;
      soundEngine.playSparkError();
      onFailQuestTriggerSalvage(proc ? proc.requiredPart : 'scrap_metal');
    }
  }, [
    gameState.phase,
    gameState.quest_step,
    gameState.quest_exec_deadline_ms,
    nowMs,
    onFailQuestTriggerSalvage,
    proc,
  ]);

  if (
    gameState.phase !== 'console' &&
    gameState.phase !== 'consequence' &&
    gameState.phase !== 'science_card'
  ) {
    return null;
  }

  const t = getUiCopy(lang);
  const en = lang === 'en';
  const questDef = QUEST_DEFINITIONS[gameState.shift];

  // 1. MANDATORY SCIENCE CARD (After Shift 8 SPE Storm)
  if (gameState.phase === 'science_card' && gameState.pending_science_card) {
    const card = getLocalizedScienceCard(lang);
    const nextShift = Math.min(9, gameState.shift + 1);
    return (
      <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-[#101828]/90">
        <div className="pixel-panel-warm max-w-xl w-full p-6 space-y-5">
          <div className="flex items-center gap-3 border-b border-[#F2C879]/30 pb-3">
            <button
              type="button"
              onClick={onDismissScienceCard}
              title={t.consoleCloseTip}
              aria-label={t.consoleCloseTip}
              className="w-8 h-8 shrink-0 flex items-center justify-center bg-[#dc2626] hover:bg-[#ef4444] border-2 border-[#fecaca] text-white shadow-[0_2px_0_#7f1d1d] cursor-pointer"
            >
              <X className="w-4 h-4 stroke-[3]" />
            </button>
            <div className="p-2 bg-[#F2C879]/20 border border-[#F2C879]">
              <Sparkles className="w-6 h-6 text-[#F2C879]" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#F2C879]">{card.title}</h2>
              <p className="text-xs font-mono text-[#70B8D3]">{card.nasaReference}</p>
            </div>
          </div>

          <div className="bg-[#152033] border border-slate-700 p-4 space-y-2.5 text-base text-slate-100 leading-relaxed">
            {card.lines.map((line, i) => (
              <p key={i} className="flex items-start gap-2">
                <span className="text-[#F2C879] font-bold">•</span>
                <span>{line}</span>
              </p>
            ))}
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={onDismissScienceCard}
              className="inline-flex items-center gap-2 px-6 py-3 font-bold text-[#101828] bg-[#6BAF83] hover:bg-[#82c499] border-2 border-[#bbf7d0] shadow-[0_4px_0_#2b5c3c] cursor-pointer"
            >
              {t.btnContinueShift(nextShift)}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. CONSEQUENCE SCREEN
  if (gameState.phase === 'consequence' && gameState.last_consequence) {
    const c = localizeConsequence(gameState.last_consequence, gameState, lang);
    const toneClass = (tone: 'normal' | 'warning' | 'critical' | 'info') => {
      if (tone === 'critical') return 'border-[#D76562] bg-[#D76562]/15 text-[#fecaca]';
      if (tone === 'warning') return 'border-[#F0B85D] bg-[#F0B85D]/15 text-[#fde68a]';
      if (tone === 'info') return 'border-[#70B8D3] bg-[#70B8D3]/15 text-[#bae6fd]';
      return 'border-[#6BAF83] bg-[#6BAF83]/15 text-[#bbf7d0]';
    };

    const btnText = gameState.pending_science_card ? t.btnScienceCard : t.btnCrewDialogue;

    return (
      <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-[#101828]/88">
        <div className="pixel-panel max-w-xl w-full p-6 space-y-5 max-h-[92vh] overflow-y-auto custom-scroll">
          <div className="flex items-center gap-3 border-b border-slate-700 pb-3">
            <button
              type="button"
              onClick={onContinueAfterConsequence}
              title={t.consoleCloseTip}
              aria-label={t.consoleCloseTip}
              className="w-8 h-8 shrink-0 flex items-center justify-center bg-[#dc2626] hover:bg-[#ef4444] border-2 border-[#fecaca] text-white shadow-[0_2px_0_#7f1d1d] cursor-pointer"
            >
              <X className="w-4 h-4 stroke-[3]" />
            </button>
            <div>
              <div className="text-xs font-mono text-[#70B8D3]">
                {t.consequenceHeader(c.eventId)}
              </div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-[#6BAF83]" />
                {c.choiceLabel}
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {c.deltas.map((d, idx) => (
              <div key={idx} className={`p-3 border ${toneClass(d.tone)}`}>
                <div className="text-xs opacity-90">
                  {d.icon} {d.label}
                </div>
                <div className="text-sm font-bold mt-1 tabular-nums">{d.change}</div>
              </div>
            ))}
          </div>

          <div className="bg-[#152033] border border-slate-700 p-4 space-y-2 text-sm sm:text-base text-slate-100">
            {c.lines.map((line, idx) => (
              <p key={idx}>{line}</p>
            ))}
            <p className="text-xs text-[#F2C879] pt-2 border-t border-slate-700/70">
              {t.visualCuePrefix} {c.visualCue}
            </p>
          </div>

          {c.delayedWarning && (
            <div className="p-3 bg-[#7f1d1d]/50 border border-[#D76562] text-sm font-semibold text-[#fecaca]">
              ⚠️ {c.delayedWarning}
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="button"
              onClick={onContinueAfterConsequence}
              className="inline-flex items-center gap-2 px-6 py-3 font-bold text-[#101828] bg-[#F2C879] hover:bg-[#f7d691] border-2 border-[#fef3c7] shadow-[0_4px_0_#926c2a] cursor-pointer"
            >
              {btnText}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. STRICT 4-STEP QUEST WORKFLOW + TIMED REPAIR + DECISION CONSOLE
  const script = getShiftScript(gameState, lang);
  const badgeColor =
    script.alertStatus === 'critical'
      ? 'bg-[#7f1d1d] border-[#D76562] text-[#fecaca]'
      : script.alertStatus === 'warning'
        ? 'bg-[#78350f] border-[#F0B85D] text-[#fde68a]'
        : 'bg-[#1e3a5f] border-[#70B8D3] text-[#bae6fd]';

  const evColor = (s: 'normal' | 'warning' | 'critical' | 'info') => {
    if (s === 'critical') return 'border-[#D76562] text-[#fca5a5]';
    if (s === 'warning') return 'border-[#F0B85D] text-[#fde68a]';
    if (s === 'info') return 'border-[#70B8D3] text-[#bae6fd]';
    return 'border-[#6BAF83] text-[#bbf7d0]';
  };

  const optStyle = (color: 'blue' | 'green' | 'amber' | 'red') => {
    if (color === 'blue') return 'border-[#70B8D3] hover:bg-[#1e3a5f]/70';
    if (color === 'green') return 'border-[#6BAF83] hover:bg-[#1b4332]/70';
    if (color === 'red') return 'border-[#D76562] hover:bg-[#7f1d1d]/50';
    return 'border-[#F0B85D] hover:bg-[#78350f]/50';
  };

  const stepIndex =
    gameState.quest_step === 'briefing'
      ? 1
      : gameState.quest_step === 'knowledge'
        ? gameState.quest_knowledge_read
          ? 2
          : 2
        : gameState.quest_step === 'accepted' || gameState.quest_step === 'executing'
          ? 3
          : gameState.quest_step === 'salvage_subquest'
            ? 4
            : 3;

  const needsRepair =
    proc !== null &&
    gameState.shift <= 8 &&
    !gameState.repaired_shifts.includes(gameState.shift);
  const salvageItem: SupplyItemId | null =
    gameState.quest_salvage_target_item ?? (proc ? proc.requiredPart : null);
  const hasRequiredPart = proc ? (gameState.inventory[proc.requiredPart] ?? 0) > 0 : true;
  const partMeta = salvageItem ? SUPPLY_ITEMS_META[salvageItem] : null;
  const malfunctionSecondsLeft = Math.max(0, Math.ceil((gameState.malfunction_until - nowMs) / 1000));
  const isMalfunctioning = malfunctionSecondsLeft > 0;
  const execSecondsLeft =
    gameState.quest_exec_deadline_ms !== null
      ? Math.max(0, Math.ceil((gameState.quest_exec_deadline_ms - nowMs) / 1000))
      : questDef.execDurationSec;

  const handleClickRepairStep = (step: RepairStepOption) => {
    if (!proc || isMalfunctioning || step.orderIndex < repairStepProgress) return;
    if (step.orderIndex === repairStepProgress) {
      setWrongHint(null);
      if (repairStepProgress < 3) {
        soundEngine.playBeep(740, 0.06, 'triangle', 0.06);
        setRepairStepProgress((prev) => prev + 1);
      } else {
        soundEngine.playRepairSuccess();
        setRepairStepProgress(1);
        onCompleteRepairStep(proc.shift);
      }
    } else {
      soundEngine.playSparkError();
      setWrongHint(en ? step.wrongHintEn : step.wrongHintVi);
      setRepairStepProgress(1);
      // Wrong engineering order destroys the spare part & opens Step 4 Salvage Sub-Quest!
      onFailQuestTriggerSalvage(proc.requiredPart);
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-[#101828]/88">
      <div className="pixel-panel-warm max-w-2xl w-full p-5 sm:p-6 space-y-4 max-h-[92vh] overflow-y-auto custom-scroll">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-slate-700 pb-3">
          <div className="flex items-start gap-3">
            <button
              type="button"
              onClick={onCloseConsole}
              title={t.consoleCloseTip}
              aria-label={t.consoleCloseTip}
              className="mt-0.5 w-8 h-8 shrink-0 flex items-center justify-center bg-[#dc2626] hover:bg-[#ef4444] border-2 border-[#fecaca] text-white shadow-[0_2px_0_#7f1d1d] cursor-pointer"
            >
              <X className="w-4 h-4 stroke-[3]" />
            </button>
            <div>
              <div className="text-xs font-mono text-[#70B8D3]">
                {script.hoursLabel} · {script.eventId}
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#F2C879]">
                {script.title}
              </h2>
            </div>
          </div>

          <span className={`px-2.5 py-1 border text-xs font-mono font-bold shrink-0 ${badgeColor}`}>
            {script.alertBadge}
          </span>
        </div>

        {/* 4-STEP STRICT QUEST STATE MACHINE PROGRESS BAR */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-[11px] font-mono">
          {t.questStepLabels.map((label, idx) => {
            const num = idx + 1;
            const active = num === stepIndex;
            const done = num < stepIndex && stepIndex !== 4;
            const isSub = num === 4 && gameState.quest_step === 'salvage_subquest';
            return (
              <div
                key={label}
                className={`px-2 py-1.5 border font-bold text-center truncate ${
                  isSub
                    ? 'bg-[#7f1d1d] border-[#ef4444] text-[#fecaca]'
                    : active
                      ? 'bg-[#1e3a5f] border-[#F2C879] text-[#F2C879]'
                      : done
                        ? 'bg-[#122620] border-[#6BAF83] text-[#bbf7d0]'
                        : 'bg-[#0f172a] border-slate-700 text-slate-400'
                }`}
              >
                {done ? `✓ ${label}` : label}
              </div>
            );
          })}
        </div>

        {/* Evidence Telemetry Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {script.evidence.map((ev, i) => (
            <div
              key={i}
              className={`bg-[#111827] border px-2.5 py-2 text-xs ${evColor(ev.status)}`}
            >
              <div className="text-slate-300">
                {ev.icon} {ev.label}
              </div>
              <div className="font-mono font-bold text-sm mt-0.5 tabular-nums">
                {ev.value}
              </div>
            </div>
          ))}
        </div>

        {/* STEP 1: PROBLEM BRIEFING (Root Cause & Risk) */}
        {gameState.quest_step === 'briefing' && (
          <div className="bg-[#152033] border-2 border-[#70B8D3]/70 p-4 space-y-3.5">
            <div className="text-xs font-mono font-bold text-[#70B8D3]">
              {t.questBriefingTag}
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white">
              {en ? questDef.briefingTitleEn : questDef.briefingTitleVi}
            </h3>
            <div className="bg-[#0e1729] border border-slate-700 p-3 space-y-2 text-sm">
              <p className="text-slate-100">
                <strong className="text-[#F2C879]">{t.questCauseLabel}</strong>{' '}
                {en ? questDef.briefingCauseEn : questDef.briefingCauseVi}
              </p>
              <p className="text-[#fca5a5]">
                <strong>{t.questRiskLabel}</strong>{' '}
                {en ? questDef.briefingRiskEn : questDef.briefingRiskVi}
              </p>
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => {
                  soundEngine.playConsoleOpen();
                  onGoToKnowledgeStep();
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 font-bold text-[#101828] bg-[#F2C879] hover:bg-[#f7d691] border-2 border-[#fef3c7] shadow-[0_3px_0_#926c2a] cursor-pointer"
              >
                <BookOpen className="w-4 h-4" />
                <span>{t.questGoToKnowledgeBtn}</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: MANDATORY NASA KNOWLEDGE MANUAL */}
        {gameState.quest_step === 'knowledge' && (
          <div className="bg-[#122036] border-2 border-[#6BAF83] p-4 space-y-3.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-mono font-bold text-[#6BAF83]">
                {t.questKnowledgeTag}
              </span>
              <span className="text-[11px] font-mono text-[#70B8D3]">
                {questDef.nasaModuleCode}
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-[#F2C879]">
              {en ? questDef.nasaModuleTitleEn : questDef.nasaModuleTitleVi}
            </h3>
            <div className="bg-[#0a1322] border border-slate-700 p-3.5 space-y-2 text-sm text-slate-100">
              {(en ? questDef.nasaFactsEn : questDef.nasaFactsVi).map((line, i) => (
                <p key={i} className="leading-relaxed">
                  {line}
                </p>
              ))}
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => {
                  soundEngine.playDecisionConfirm();
                  onMarkKnowledgeRead();
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 font-bold text-[#101828] bg-[#6BAF83] hover:bg-[#82c499] border-2 border-[#bbf7d0] shadow-[0_3px_0_#2c5e3e] cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{t.questKnowledgeConfirmBtn}</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 3A: READY FOR EXECUTION (Click "Xác nhận thực hiện nhiệm vụ" to start timer) */}
        {gameState.quest_step === 'accepted' && (
          <div className="bg-[#152033] border-2 border-[#F2C879] p-4 space-y-3.5">
            <div className="text-xs font-mono font-bold text-[#F2C879]">
              {t.questExecuteTag}
            </div>
            <p className="text-sm text-slate-200 leading-relaxed">
              {en
                ? `You have reviewed standard engineering procedures (${questDef.nasaModuleCode}). Press confirm to begin the timed ${questDef.execDurationSec}-second repair & command sequence!`
                : `Bạn đã đọc xong quy trình kỹ thuật tiêu chuẩn (${questDef.nasaModuleCode}). Hãy bấm xác nhận để mở khóa đồng hồ ${questDef.execDurationSec} giây thực hiện sửa chữa & ra quyết định!`}
            </p>
            <div className="flex items-center justify-between gap-3 flex-wrap pt-1">
              <button
                type="button"
                onClick={() => {
                  soundEngine.playBeep(520, 0.05);
                  onGoToKnowledgeStep();
                }}
                className="px-3.5 py-2 text-xs font-mono border border-slate-600 bg-[#0e1729] hover:bg-slate-800 text-slate-300 cursor-pointer"
              >
                ← {en ? 'Re-read Tech Guide' : 'Đọc lại tài liệu kỹ thuật'}
              </button>
              <button
                type="button"
                onClick={() => {
                  soundEngine.playConsoleOpen();
                  onAcceptExecution();
                }}
                className="inline-flex items-center gap-2 px-6 py-3 font-bold text-[#101828] bg-[#F2C879] hover:bg-[#f7d691] border-2 border-[#fef3c7] shadow-[0_4px_0_#926c2a] cursor-pointer"
              >
                <Wrench className="w-4 h-4" />
                <span>{t.questConfirmExecuteBtn}</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: FAILED / MISSING PART -> SALVAGE SUB-QUEST ("Tìm kiếm vật tư thay thế") */}
        {gameState.quest_step === 'salvage_subquest' && (
          <div className="bg-[#231218] border-2 border-[#ef4444] p-4 space-y-3">
            <div className="flex items-center gap-2 text-[#fca5a5] font-mono font-bold text-xs">
              <PackageSearch className="w-5 h-5 shrink-0" />
              <span>{t.questSubQuestTag}</span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white">
              {en ? questDef.subQuestTitleEn : questDef.subQuestTitleVi}
            </h3>
            <p className="text-sm text-slate-200">
              {en ? questDef.subQuestDescEn : questDef.subQuestDescVi}
            </p>
            {partMeta && salvageItem && (
              <div className="bg-[#101828] border border-slate-700 p-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{partMeta.icon}</span>
                  <div>
                    <div className="font-bold text-white text-sm">
                      {en ? partMeta.nameEn : partMeta.nameVi}
                    </div>
                    <div className="text-xs text-slate-300">
                      {en ? partMeta.descEn : partMeta.descVi}
                    </div>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold px-2 py-1 bg-[#1e293b] border border-slate-600 text-[#F2C879] tabular-nums shrink-0">
                  x{gameState.inventory[salvageItem] ?? 0}
                </span>
              </div>
            )}
            <div className="flex flex-wrap items-center justify-end gap-2.5 pt-1">
              {salvageItem && (gameState.inventory[salvageItem] ?? 0) > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playDecisionConfirm();
                    onRetryFromSalvage();
                  }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 font-bold text-[#101828] bg-[#6BAF83] hover:bg-[#82c499] border-2 border-[#bbf7d0] shadow-[0_3px_0_#2c5e3e] cursor-pointer"
                >
                  {t.questSubQuestRetryBtn}
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  soundEngine.playConsoleOpen();
                  onOpenRoverConsole();
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 font-bold text-[#101828] bg-[#38bdf8] hover:bg-[#7dd3fc] border-2 border-[#e0f2fe] shadow-[0_3px_0_#0369a1] cursor-pointer"
              >
                {t.repairOpenRoverBtn}
              </button>
            </div>
          </div>
        )}

        {/* STEP 3B: ACTIVE TIMED EXECUTION (REPAIR SEQUENCE + TACTICAL A/B) */}
        {gameState.quest_step === 'executing' && (
          <>
            {/* Live Execution Countdown Banner */}
            <div
              className={`px-3.5 py-2 border flex items-center justify-between gap-2 text-xs font-mono font-bold tabular-nums ${
                execSecondsLeft <= 12
                  ? 'bg-[#7f1d1d]/85 border-[#ef4444] text-[#fecaca]'
                  : 'bg-[#101c30] border-[#F2C879]/70 text-[#F2C879]'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 shrink-0" />
                {t.questExecTimerLabel(execSecondsLeft)}
              </span>
              <span className="text-[11px] text-slate-300">
                {en ? 'Complete before timer expires!' : 'Hoàn thành trước khi hết giờ!'}
              </span>
            </div>

            {needsRepair && proc ? (
              !hasRequiredPart && partMeta ? (
                <div className="bg-[#182032] border-2 border-[#F0B85D] p-4 space-y-3">
                  <div className="flex items-center gap-2 text-[#F0B85D] font-bold text-base">
                    <PackageSearch className="w-5 h-5 shrink-0" />
                    <span>{t.repairMissingTitle}</span>
                  </div>
                  <p className="text-sm text-slate-200">{t.repairMissingHint}</p>
                  <div className="bg-[#101828] border border-slate-700 p-3 flex items-center gap-3">
                    <span className="text-2xl">{partMeta.icon}</span>
                    <div>
                      <div className="font-bold text-white text-sm">
                        {en ? partMeta.nameEn : partMeta.nameVi}
                      </div>
                      <div className="text-xs text-slate-300">
                        {en ? partMeta.descEn : partMeta.descVi}
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        soundEngine.playConsoleOpen();
                        onOpenRoverConsole();
                      }}
                      className="inline-flex items-center gap-2 px-5 py-2.5 font-bold text-[#101828] bg-[#38bdf8] hover:bg-[#7dd3fc] border-2 border-[#e0f2fe] shadow-[0_3px_0_#0369a1] cursor-pointer"
                    >
                      {t.repairOpenRoverBtn}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-[#152033] border-2 border-[#70B8D3]/70 p-4 space-y-3">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2 text-[#F2C879] font-bold text-base">
                      <Wrench className="w-5 h-5 text-[#70B8D3]" />
                      <span>{en ? proc.titleEn : proc.titleVi}</span>
                    </div>
                    {partMeta && (
                      <span className="px-2 py-0.5 text-xs font-mono bg-[#122620] border border-[#6BAF83]/60 text-[#bbf7d0]">
                        {partMeta.icon} {en ? partMeta.nameEn : partMeta.nameVi} (✓)
                      </span>
                    )}
                  </div>

                  {/* 3-Step progress indicator */}
                  <div className="flex items-center gap-2 text-xs font-mono">
                    {[1, 2, 3].map((stepNum) => {
                      const done = stepNum < repairStepProgress;
                      const active = stepNum === repairStepProgress;
                      return (
                        <div
                          key={stepNum}
                          className={`flex-1 py-1 px-2 border text-center font-bold ${
                            done
                              ? 'bg-[#14532d] border-[#6BAF83] text-[#bbf7d0]'
                              : active
                                ? 'bg-[#1e3a5f] border-[#F2C879] text-[#F2C879]'
                                : 'bg-[#0f172a] border-slate-700 text-slate-500'
                          }`}
                        >
                          {done ? `✓ ${stepNum}/3` : `${stepNum}/3`}
                        </div>
                      );
                    })}
                  </div>

                  <p className="text-sm font-semibold text-[#bae6fd]">
                    {t.repairStepPrompt(repairStepProgress)}
                  </p>

                  {isMalfunctioning && (
                    <div className="p-3 bg-[#7f1d1d]/85 border-2 border-[#ef4444] text-white space-y-1 animate-pulse">
                      <div className="flex items-center gap-2 font-mono font-bold text-sm text-[#fde047] tabular-nums">
                        <Zap className="w-4 h-4 shrink-0" />
                        <span>{t.repairMalfunctionBanner(malfunctionSecondsLeft)}</span>
                      </div>
                      {wrongHint && <p className="text-xs text-[#fecaca]">{wrongHint}</p>}
                    </div>
                  )}

                  {!isMalfunctioning && wrongHint && (
                    <div className="p-2.5 bg-[#78350f]/60 border border-[#F0B85D] text-xs text-[#fde68a] flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-[#F0B85D]" />
                      <span>{wrongHint}</span>
                    </div>
                  )}

                  <div className="space-y-2">
                    {orderedRepairButtons.map((step) => {
                      const isDone = step.orderIndex < repairStepProgress;
                      return (
                        <button
                          key={step.id}
                          type="button"
                          disabled={isMalfunctioning || isDone}
                          onClick={() => handleClickRepairStep(step)}
                          className={`w-full text-left p-3 border-2 transition-colors flex items-center justify-between gap-3 ${
                            isDone
                              ? 'bg-[#122620] border-[#6BAF83]/70 text-[#86efac] opacity-85 cursor-default'
                              : isMalfunctioning
                                ? 'bg-[#1a1520] border-slate-700 text-slate-500 cursor-not-allowed'
                                : 'bg-[#182235] hover:bg-[#1e3a5f] border-[#70B8D3]/75 hover:border-[#F2C879] text-slate-100 cursor-pointer'
                          }`}
                        >
                          <span className="text-sm font-semibold">
                            {en ? step.labelEn : step.labelVi}
                          </span>
                          {isDone && <CheckCircle2 className="w-4 h-4 text-[#6BAF83] shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )
            ) : (
              <>
                {gameState.shift <= 8 && gameState.repaired_shifts.includes(gameState.shift) && (
                  <div className="px-3 py-1.5 bg-[#122620] border border-[#6BAF83]/70 text-xs font-mono font-bold text-[#bbf7d0]">
                    {t.repairCompletedTag}
                  </div>
                )}

                <div className="bg-[#152033] border border-slate-700 p-4 space-y-2 text-sm sm:text-base text-slate-100">
                  {script.lines.map((line, i) => (
                    <p key={i}>{line}</p>
                  ))}
                  <p className="pt-2 font-bold text-[#F2C879] text-base sm:text-lg">
                    ❓ {script.question}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {script.options.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => onSelectChoice(opt.id)}
                      className={`text-left p-4 bg-[#182235] border-2 transition-colors cursor-pointer flex flex-col justify-between gap-2 ${optStyle(opt.badgeColor)}`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 text-xs font-mono font-bold bg-[#101828] border border-slate-500 text-white">
                          {opt.id}
                        </span>
                        <span className="font-bold text-base text-white">{opt.label}</span>
                      </div>
                      <div className="text-xs sm:text-sm text-slate-300 leading-snug">
                        → {opt.preview}
                      </div>
                    </button>
                  ))}
                </div>
              </>
            )}
          </>
        )}

        <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-slate-400 pt-1">
          <span>{script.nasaHintTag}</span>
          <span>{t.gameAbstractionShort}</span>
        </div>
      </div>
    </div>
  );
};
