import React from 'react';
import { ClipboardList, X } from 'lucide-react';
import { getUiCopy } from '../engine/i18n';
import { localizeDecisionEntry } from '../engine/simulationEngine';
import { DecisionLogEntry, Language } from '../engine/types';

interface MissionLogModalProps {
  open: boolean;
  lang: Language;
  decisions: DecisionLogEntry[];
  onClose: () => void;
}

export const MissionLogModal: React.FC<MissionLogModalProps> = ({
  open,
  lang,
  decisions,
  onClose,
}) => {
  if (!open) return null;

  const t = getUiCopy(lang);

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-[#101828]/85">
      <div className="pixel-panel max-w-2xl w-full max-h-[85vh] flex flex-col">
        <div className="px-5 py-3.5 border-b border-slate-700 flex items-center justify-between bg-[#152033]">
          <div className="flex items-center gap-2 font-bold text-[#F2C879]">
            <ClipboardList className="w-5 h-5 text-[#70B8D3]" />
            {t.logTitle(decisions.length)}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 bg-[#1e293b] hover:bg-[#334155] border border-slate-600 text-slate-200 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto custom-scroll space-y-3">
          {decisions.length === 0 ? (
            <div className="text-center py-8 text-sm text-slate-400">{t.logEmpty}</div>
          ) : (
            decisions.map((raw) => {
              const d = localizeDecisionEntry(raw, lang);
              return (
                <div
                  key={d.shift}
                  className="bg-[#152033] border border-slate-700 p-3.5 space-y-1.5"
                >
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-[#F2C879] font-bold">
                      {lang === 'en' ? 'SHIFT' : 'CA'} {d.shift}/9 · {d.eventId}
                    </span>
                    <span className="text-[#70B8D3]">{t.logPicked(d.choiceId)}</span>
                  </div>
                  <div className="text-sm font-bold text-white">{d.eventTitle}</div>
                  <div className="text-xs text-slate-300">
                    <strong>{t.logChoiceLabel}</strong> {d.choiceLabel}
                  </div>
                  <div className="text-xs text-[#6BAF83]">
                    <strong>{t.logOutcomeLabel}</strong> {d.consequenceSummary}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
