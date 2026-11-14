import React from 'react';
import { BookOpen, Pause, Play, RotateCcw } from 'lucide-react';
import { getUiCopy } from '../engine/i18n';
import { Language } from '../engine/types';

interface PauseModalProps {
  open: boolean;
  lang: Language;
  onResume: () => void;
  onRestart: () => void;
  onOpenLibrary: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  open,
  lang,
  onResume,
  onRestart,
  onOpenLibrary,
}) => {
  if (!open) return null;

  const t = getUiCopy(lang);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#070b14]/82">
      <div className="pixel-panel-warm max-w-md w-full p-6 space-y-5 text-center border-2 border-[#F2C879]">
        <div className="flex flex-col items-center gap-2 border-b border-slate-700 pb-4">
          <div className="w-12 h-12 rounded-full bg-[#1e3a5f] border-2 border-[#F2C879] flex items-center justify-center">
            <Pause className="w-6 h-6 text-[#F2C879]" />
          </div>
          <h2 className="text-2xl font-bold tracking-wide text-[#F2C879]">{t.pauseTitle}</h2>
          <p className="text-xs sm:text-sm text-slate-300">{t.pauseSubtitle}</p>
        </div>

        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={onResume}
            className="w-full py-3 px-4 font-bold text-sm sm:text-base text-[#101828] bg-[#6BAF83] hover:bg-[#82c499] border-2 border-[#bbf7d0] shadow-[0_4px_0_#1e5631] flex items-center justify-center gap-2 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" />
            {t.pauseResumeBtn}
          </button>

          <button
            type="button"
            onClick={onRestart}
            className="w-full py-3 px-4 font-bold text-sm sm:text-base text-[#101828] bg-[#F2C879] hover:bg-[#f7d691] border-2 border-[#fef3c7] shadow-[0_4px_0_#926c2a] flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            {t.pauseRestartBtn}
          </button>

          <button
            type="button"
            onClick={onOpenLibrary}
            className="w-full py-3 px-4 font-bold text-sm sm:text-base text-white bg-[#1e3a5f] hover:bg-[#284b7a] border-2 border-[#70B8D3] shadow-[0_4px_0_#0f2138] flex items-center justify-center gap-2 cursor-pointer"
          >
            <BookOpen className="w-4 h-4 text-[#70B8D3]" />
            {t.pauseLibraryBtn}
          </button>
        </div>
      </div>
    </div>
  );
};
