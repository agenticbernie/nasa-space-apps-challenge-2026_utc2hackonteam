import React from 'react';
import { Droplets, Flame, Flower2, Lightbulb, Sprout, Utensils, X } from 'lucide-react';
import { soundEngine } from '../audio/soundEngine';
import { getUiCopy } from '../engine/i18n';
import { NASA_CROPS_META } from '../engine/nasaData';
import { CropId, GameState, Language, LedSpectrumMode, SpaceAilmentId } from '../engine/types';

interface BotanyLabModalProps {
  gameState: GameState;
  lang: Language;
  onCareCrop: (cropId: CropId, action: 'water' | 'led' | 'pollinate') => void;
  onTreatWithCrop: (ailmentId: SpaceAilmentId, method: 'botany_tomato' | 'botany_wheat') => void;
  onOperateLifeSupport: (
    action: 'ogs' | 'wrs' | 'craft_hepa' | 'craft_ki' | 'harvest_spirulina' | 'eat_ration',
  ) => void;
  onClose: () => void;
}

function getLedLabel(mode: LedSpectrumMode, lang: Language): string {
  if (lang === 'en') {
    if (mode === 'red_blue') return 'Red–Blue LED (660/450nm)';
    if (mode === 'full_bright') return 'Full-Bright LED';
    return 'LED Off';
  }
  if (mode === 'red_blue') return 'LED Đỏ–Xanh lam (660/450nm)';
  if (mode === 'full_bright') return 'LED Sáng Toàn Phần';
  return 'Đang Tắt LED';
}

export const BotanyLabModal: React.FC<BotanyLabModalProps> = ({
  gameState,
  lang,
  onCareCrop,
  onTreatWithCrop,
  onOperateLifeSupport,
  onClose,
}) => {
  const copy = getUiCopy(lang);
  const en = lang === 'en';
  const cropIds: CropId[] = ['lettuce', 'tomato', 'wheat', 'spirulina'];

  const hasRadSick = gameState.active_ailments.includes('radiation_sickness');
  const hasHypercapnia = gameState.active_ailments.includes('hypercapnia');
  const rationsOwned = gameState.inventory.spirulina_ration ?? 0;
  const spirulinaReady = gameState.crops.spirulina.growth >= 40;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#060b14]/90 p-3 sm:p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-5xl max-h-[94vh] overflow-y-auto custom-scroll rounded-xl border-2 border-[#6baf83]/60 bg-[#0d1626] p-4 sm:p-5 shadow-2xl">
        {/* Header */}
        <div className="mb-4 flex flex-wrap items-start justify-between gap-4 border-b border-[#1e293b] pb-3">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-[#6baf83]">
              <Sprout className="h-4 w-4" />
              <span>{copy.botanyTitle}</span>
            </div>
            <p className="mt-1 text-xs text-slate-300">{copy.botanySubtitle}</p>
          </div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="rounded-lg border border-[#F2C879]/45 bg-[#1b1912] px-3 py-1 text-xs font-mono font-bold tabular-nums text-[#F2C879] flex items-center gap-1.5">
              <Flame className="h-3.5 w-3.5" />
              <span>{Math.round(gameState.eclss.calories_kcal)} kcal</span>
            </div>
            <div className="rounded-lg border border-[#6baf83]/40 bg-[#122620] px-3 py-1 text-xs font-mono font-bold tabular-nums text-[#86efac]">
              🌱 {gameState.plant_health}/100
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-700 bg-slate-800/80 p-1.5 text-slate-300 hover:bg-slate-700 hover:text-white cursor-pointer"
              aria-label="Close Botany Lab"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Spirulina Ration Production & Consumption Bar */}
        <div className="mb-4 rounded-xl border border-[#6baf83]/45 bg-[#102221] p-3 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs space-y-0.5">
            <div className="font-bold text-[#86efac]">
              🟢 {en ? 'Spirulina Bio-Nutrition & O₂ Loop' : 'Khẩu Phần Dinh Dưỡng Tảo Spirulina & Oxy'}
            </div>
            <div className="text-slate-300 font-mono tabular-nums">
              {en
                ? `In Stock: ${rationsOwned} ration(s) · Target Energy: 2500–3000 kcal/day`
                : `Dự trữ khẩu phần: ${rationsOwned} suất · Chuẩn năng lượng: 2500–3000 kcal/ngày`}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={!spirulinaReady}
              onClick={() => {
                soundEngine.playBotanyCare();
                onOperateLifeSupport('harvest_spirulina');
              }}
              className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-bold ${
                spirulinaReady
                  ? 'border-[#6baf83] bg-[#16382b] text-[#bbf7d0] hover:bg-[#1e4d3b] cursor-pointer'
                  : 'border-slate-700 bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <Sprout className="h-3.5 w-3.5" />
              <span>
                {en ? 'Harvest Spirulina (+1 Ration)' : 'Thu hoạch Tảo (+1 Suất ăn)'}
              </span>
            </button>

            <button
              type="button"
              disabled={rationsOwned <= 0}
              onClick={() => {
                soundEngine.playMedHeal();
                onOperateLifeSupport('eat_ration');
              }}
              className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-bold ${
                rationsOwned > 0
                  ? 'border-[#fef3c7] bg-[#F2C879] text-[#101828] hover:bg-[#f7d794] cursor-pointer'
                  : 'border-slate-700 bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <Utensils className="h-3.5 w-3.5" />
              <span>
                {en ? `Eat Ration (+450 kcal) [${rationsOwned}]` : `Ăn Suất Tảo (+450 kcal) [${rationsOwned}]`}
              </span>
            </button>
          </div>
        </div>

        {/* 4 Real NASA Crops Grid (Lettuce, Tomato, Wheat, Spirulina) */}
        <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2 lg:grid-cols-4">
          {cropIds.map((cid) => {
            const meta = NASA_CROPS_META[cid];
            const st = gameState.crops[cid];
            const optimalLed = st.ledMode === meta.bestLed;

            return (
              <div
                key={cid}
                className="flex flex-col justify-between rounded-xl border border-slate-700/80 bg-[#111c30] p-3.5"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-2xl">{meta.icon}</span>
                    <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-mono text-[#70b8d3]">
                      {meta.nasaCode}
                    </span>
                  </div>
                  <h3 className="mt-2 text-sm font-bold text-white">
                    {en ? meta.nameEn : meta.nameVi}
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-slate-300">
                    {en ? meta.roleEn : meta.roleVi}
                  </p>
                  <p className="mt-1.5 rounded bg-[#0c1524] p-2 text-[11px] text-[#f2c879]">
                    💡 {en ? meta.careTipEn : meta.careTipVi}
                  </p>

                  {/* Growth Progress */}
                  <div className="mt-3">
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="text-slate-300">{copy.botanyGrowthLabel}</span>
                      <span className="font-mono font-bold tabular-nums text-[#6baf83]">
                        {st.growth}%
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded bg-slate-800">
                      <div
                        className="h-full bg-[#6baf83] transition-all"
                        style={{ width: `${st.growth}%` }}
                      />
                    </div>
                  </div>

                  {/* Spectrum + Pollination tags */}
                  <div className="mt-2.5 flex flex-wrap gap-1.5 text-[11px]">
                    <span
                      className={`rounded px-2 py-0.5 font-medium ${
                        optimalLed
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/60'
                          : 'bg-amber-950 text-amber-300 border border-amber-700/60'
                      }`}
                    >
                      {getLedLabel(st.ledMode, lang)}
                    </span>
                    {cid === 'tomato' && (
                      <span
                        className={`rounded px-2 py-0.5 font-medium ${
                          st.pollinated
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/60'
                            : 'bg-rose-950 text-rose-300 border border-rose-700/60'
                        }`}
                      >
                        {st.pollinated
                          ? en
                            ? '🌼 Pollinated'
                            : '🌼 Đã thụ phấn'
                          : en
                            ? '🌼 Needs Pollination'
                            : '🌼 Cần thụ phấn'}
                      </span>
                    )}
                  </div>
                </div>

                {/* Care Controls */}
                <div className="mt-3.5 space-y-1.5 border-t border-slate-800 pt-3">
                  <button
                    type="button"
                    onClick={() => {
                      soundEngine.playBotanyCare();
                      onCareCrop(cid, 'water');
                    }}
                    className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-[#38bdf8]/40 bg-[#152942] px-2.5 py-1.5 text-xs font-semibold text-[#bae6fd] hover:bg-[#1e3a5c] cursor-pointer"
                  >
                    <Droplets className="h-3.5 w-3.5" />
                    <span>{copy.botanyWaterBtn}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      soundEngine.playBotanyCare();
                      onCareCrop(cid, 'led');
                    }}
                    className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-purple-400/40 bg-purple-950/60 px-2.5 py-1.5 text-xs font-semibold text-purple-200 hover:bg-purple-900/70 cursor-pointer"
                  >
                    <Lightbulb className="h-3.5 w-3.5" />
                    <span>{copy.botanyLedBtn}</span>
                  </button>
                  {cid === 'tomato' && (
                    <button
                      type="button"
                      onClick={() => {
                        soundEngine.playBotanyCare();
                        onCareCrop(cid, 'pollinate');
                      }}
                      className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-amber-400/40 bg-amber-950/60 px-2.5 py-1.5 text-xs font-semibold text-amber-200 hover:bg-amber-900/70 cursor-pointer"
                    >
                      <Flower2 className="h-3.5 w-3.5" />
                      <span>{copy.botanyPollinateBtn}</span>
                    </button>
                  )}

                  {cid === 'tomato' && hasRadSick && (
                    <button
                      type="button"
                      onClick={() => {
                        soundEngine.playMedHeal();
                        onTreatWithCrop('radiation_sickness', 'botany_tomato');
                      }}
                      className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#6baf83] px-2.5 py-1.5 text-xs font-bold text-slate-950 hover:bg-[#82c99a] cursor-pointer"
                    >
                      <span>{copy.medTreatTomatoBtn}</span>
                    </button>
                  )}

                  {cid === 'wheat' && hasHypercapnia && (
                    <button
                      type="button"
                      onClick={() => {
                        soundEngine.playMedHeal();
                        onTreatWithCrop('hypercapnia', 'botany_wheat');
                      }}
                      className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#6baf83] px-2.5 py-1.5 text-xs font-bold text-slate-950 hover:bg-[#82c99a] cursor-pointer"
                    >
                      <span>{copy.medTreatWheatBtn}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
