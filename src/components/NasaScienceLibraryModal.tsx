import React from 'react';
import { BookOpen, Info, X } from 'lucide-react';
import { getUiCopy } from '../engine/i18n';
import { getGameAbstractionNote, getNasaCitations } from '../engine/nasaData';
import { Language } from '../engine/types';

interface NasaScienceLibraryModalProps {
  open: boolean;
  lang: Language;
  onClose: () => void;
}

export const NasaScienceLibraryModal: React.FC<NasaScienceLibraryModalProps> = ({
  open,
  lang,
  onClose,
}) => {
  if (!open) return null;

  const t = getUiCopy(lang);
  const citations = getNasaCitations(lang);
  const note = getGameAbstractionNote(lang);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-6 bg-[#090e1a]/92">
      <div className="pixel-panel max-w-4xl w-full max-h-[90vh] flex flex-col border-[#70B8D3]">
        <div className="px-6 py-4 border-b border-slate-700 bg-[#152033] flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <BookOpen className="w-6 h-6 text-[#70B8D3]" />
            <div>
              <div className="text-xs font-mono uppercase tracking-wider text-[#70B8D3]">
                {t.libTag}
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white">{t.libTitle}</h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 bg-[#1e293b] hover:bg-[#334155] border border-slate-600 text-slate-200 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 sm:p-6 overflow-y-auto custom-scroll space-y-4">
          {/* GAME-01 Abstraction Disclaimer */}
          <div className="bg-[#1e3a5f]/50 border-2 border-[#70B8D3] p-4 flex items-start gap-3">
            <Info className="w-5 h-5 text-[#70B8D3] shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs sm:text-sm">
              <div className="font-mono font-bold text-[#70B8D3]">
                {note.code}: {note.title}
              </div>
              <p className="text-slate-100 leading-relaxed">{note.description}</p>
            </div>
          </div>

          {/* SCI-01 to SCI-09 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {citations.map((cite) => (
              <div
                key={cite.id}
                className="bg-[#152033] border border-slate-700 p-4 flex flex-col justify-between gap-2"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2 py-0.5 text-xs font-mono font-bold bg-[#101828] border border-[#F2C879]/60 text-[#F2C879]">
                      {cite.code}
                    </span>
                    <span className="text-[11px] font-mono text-[#70B8D3] text-right">
                      {cite.usedIn}
                    </span>
                  </div>
                  <h3 className="font-bold text-sm text-white">{cite.title}</h3>
                  <div className="text-xs text-[#6BAF83] font-medium">{cite.dataset}</div>
                  <p className="text-xs text-slate-300 leading-relaxed">{cite.summary}</p>
                </div>

                <div className="pt-2 border-t border-slate-700/70 space-y-1 text-[11px] font-mono">
                  <div className="text-[#F0B85D]">
                    {t.libMetricsLabel} {cite.physicalMetrics}
                  </div>
                  <div className="text-slate-400">
                    {t.libRefLabel} {cite.endpoint}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="px-6 py-3 border-t border-slate-700 bg-[#152033] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-sm font-bold bg-[#70B8D3] hover:bg-[#8ecae0] text-[#101828] cursor-pointer"
          >
            {t.libCloseBtn}
          </button>
        </div>
      </div>
    </div>
  );
};
