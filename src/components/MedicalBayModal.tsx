import React from 'react';
import {
  Activity,
  Droplets,
  Dumbbell,
  Hammer,
  HeartPulse,
  Pill,
  ShieldCheck,
  Wind,
  X,
} from 'lucide-react';
import { soundEngine } from '../audio/soundEngine';
import { getUiCopy } from '../engine/i18n';
import { SPACE_AILMENTS_META } from '../engine/nasaData';
import { GameState, Language, SpaceAilmentId } from '../engine/types';

interface MedicalBayModalProps {
  gameState: GameState;
  lang: Language;
  onRunAred: () => void;
  onCleanHepa: () => void;
  onTreatAilment: (
    ailmentId: SpaceAilmentId,
    method: 'med_kit' | 'botany_tomato' | 'botany_wheat' | 'hepa' | 'ared' | 'ki_pills',
  ) => void;
  onOperateLifeSupport: (
    action: 'ogs' | 'wrs' | 'craft_hepa' | 'craft_ki' | 'harvest_spirulina' | 'eat_ration',
  ) => void;
  onClose: () => void;
}

export const MedicalBayModal: React.FC<MedicalBayModalProps> = ({
  gameState,
  lang,
  onRunAred,
  onCleanHepa,
  onTreatAilment,
  onOperateLifeSupport,
  onClose,
}) => {
  const copy = getUiCopy(lang);
  const en = lang === 'en';
  const aredDoneThisShift = gameState.ared_exercised_shifts.includes(gameState.shift);
  const medKits = gameState.inventory.med_kit ?? 0;
  const kiPills = gameState.inventory.ki_pills ?? 0;
  const hepaCount = gameState.inventory.hepa_filter ?? 0;
  const scrapCount = gameState.inventory.scrap_metal ?? 0;
  const elecCount = gameState.inventory.electronic_parts ?? 0;

  const canRunOgs = gameState.water > 1 && gameState.battery > 0;
  const canRunWrs = gameState.battery > 0 && gameState.water < 12;
  const canCraftHepa = scrapCount >= 2;
  const canCraftKi = scrapCount >= 1 && elecCount >= 1;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#060b14]/90 p-3 sm:p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-4xl max-h-[94vh] overflow-y-auto custom-scroll rounded-xl border-2 border-[#ef4444]/55 bg-[#0d1626] p-4 sm:p-5 shadow-2xl">
        {/* Header */}
        <div className="mb-4 flex items-start justify-between gap-4 border-b border-[#1e293b] pb-3">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-rose-400">
              <HeartPulse className="h-4 w-4" />
              <span>{copy.medTitle}</span>
            </div>
            <p className="mt-1 text-xs text-slate-300">{copy.medSubtitle}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-700 bg-slate-800/80 p-1.5 text-slate-300 hover:bg-slate-700 hover:text-white cursor-pointer"
            aria-label="Close Medical Bay"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Crew Health Bar + Countermeasure Buttons */}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="rounded-xl border border-slate-700/80 bg-[#111c30] p-3.5">
            <div className="flex items-center justify-between text-xs text-slate-300">
              <span className="flex items-center gap-1.5 font-semibold">
                <Activity className="h-4 w-4 text-rose-400" />
                {en ? 'Crew Health' : 'Sức khỏe Đoàn'}
              </span>
              <span className="font-mono text-base font-bold tabular-nums text-white">
                {Math.round(gameState.crew_health)}/100
              </span>
            </div>
            <div className="mt-2 h-2.5 w-full overflow-hidden rounded bg-slate-800">
              <div
                className="h-full transition-all"
                style={{
                  width: `${gameState.crew_health}%`,
                  backgroundColor:
                    gameState.crew_health >= 75
                      ? '#6baf83'
                      : gameState.crew_health >= 45
                        ? '#f0b85d'
                        : '#ef4444',
                }}
              />
            </div>
            <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 font-mono tabular-nums">
              <span>🩺 Med-Kit: {medKits}</span>
              <span>💊 KI: {kiPills}</span>
              <span>🌬️ HEPA: {hepaCount}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              soundEngine.playMedHeal();
              onRunAred();
            }}
            className="flex flex-col justify-between rounded-xl border border-[#38bdf8]/45 bg-[#12233b] p-3.5 text-left transition hover:bg-[#193050] cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <Dumbbell className="h-5 w-5 text-[#38bdf8]" />
              <span className="rounded bg-slate-900/80 px-2 py-0.5 text-[10px] font-mono text-[#70b8d3]">
                {aredDoneThisShift
                  ? en
                    ? `SHIFT ${gameState.shift} DONE`
                    : `CA ${gameState.shift} XONG`
                  : '1/6G ARED'}
              </span>
            </div>
            <div className="mt-2 text-xs font-bold text-white">{copy.medAredBtn}</div>
          </button>

          <button
            type="button"
            onClick={() => {
              soundEngine.playMedHeal();
              onCleanHepa();
            }}
            className="flex flex-col justify-between rounded-xl border border-[#6baf83]/45 bg-[#122625] p-3.5 text-left transition hover:bg-[#183533] cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <Wind className="h-5 w-5 text-[#6baf83]" />
              <span className="rounded bg-slate-900/80 px-2 py-0.5 text-[10px] font-mono text-[#86efac]">
                {gameState.airlock_hepa_cleaned
                  ? en
                    ? 'HEPA CLEAN'
                    : 'HEPA SẠCH'
                  : 'REGOLITH'}
              </span>
            </div>
            <div className="mt-2 text-xs font-bold text-white">{copy.medHepaBtn}</div>
          </button>
        </div>

        {/* NASA ECLSS OGS / WRS Controls + Medical Crafting Workbench */}
        <div className="mt-4 rounded-xl border border-[#70B8D3]/45 bg-[#0f1a2d] p-3.5 space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
            <span className="font-bold text-[#70B8D3] flex items-center gap-1.5">
              <Hammer className="w-4 h-4" />
              {en
                ? 'ECLSS O₂/H₂O CONSOLE & MEDICAL CRAFTING'
                : 'BẢNG ĐIỀU KHIỂN OGS/WRS & CHẾ TẠO Y TẾ'}
            </span>
            <span className="text-slate-300 tabular-nums">
              🔩 {scrapCount} · 🔌 {elecCount} · 🫁 {gameState.eclss.o2_kpa.toFixed(1)} kPa · 💧 {gameState.water}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            <button
              type="button"
              disabled={!canRunOgs}
              onClick={() => {
                soundEngine.playDecisionConfirm();
                onOperateLifeSupport('ogs');
              }}
              className={`rounded-lg border p-2.5 text-left text-xs space-y-1 ${
                canRunOgs
                  ? 'border-[#38bdf8]/60 bg-[#122a45] hover:bg-[#19385b] text-white cursor-pointer'
                  : 'border-slate-700 bg-slate-800/70 text-slate-500 cursor-not-allowed'
              }`}
            >
              <div className="font-bold text-[#70B8D3] flex items-center gap-1">
                <Wind className="w-3.5 h-3.5" />
                <span>{en ? 'Run OGS Electrolysis' : 'Chạy Điện Phân OGS'}</span>
              </div>
              <div className="text-[11px] opacity-85">+1.4 kPa O₂ · -1 💧 -1 ⚡</div>
            </button>

            <button
              type="button"
              disabled={!canRunWrs}
              onClick={() => {
                soundEngine.playDecisionConfirm();
                onOperateLifeSupport('wrs');
              }}
              className={`rounded-lg border p-2.5 text-left text-xs space-y-1 ${
                canRunWrs
                  ? 'border-[#70B8D3]/60 bg-[#10263b] hover:bg-[#173652] text-white cursor-pointer'
                  : 'border-slate-700 bg-slate-800/70 text-slate-500 cursor-not-allowed'
              }`}
            >
              <div className="font-bold text-[#bae6fd] flex items-center gap-1">
                <Droplets className="w-3.5 h-3.5" />
                <span>{en ? 'Recycle Water (WRS)' : 'Tái Chế Nước WRS'}</span>
              </div>
              <div className="text-[11px] opacity-85">+2 💧 (+0.5 L/d) · -1 ⚡</div>
            </button>

            <button
              type="button"
              disabled={!canCraftHepa}
              onClick={() => {
                soundEngine.playDecisionConfirm();
                onOperateLifeSupport('craft_hepa');
              }}
              className={`rounded-lg border p-2.5 text-left text-xs space-y-1 ${
                canCraftHepa
                  ? 'border-[#6BAF83]/60 bg-[#132b24] hover:bg-[#1b3d33] text-white cursor-pointer'
                  : 'border-slate-700 bg-slate-800/70 text-slate-500 cursor-not-allowed'
              }`}
            >
              <div className="font-bold text-[#86efac] flex items-center gap-1">
                <Wind className="w-3.5 h-3.5" />
                <span>{en ? 'Craft HEPA Filter' : 'Chế Tạo Lọc HEPA'}</span>
              </div>
              <div className="text-[11px] opacity-85">+1 HEPA · {en ? 'Cost' : 'Cần'}: 2 🔩</div>
            </button>

            <button
              type="button"
              disabled={!canCraftKi}
              onClick={() => {
                soundEngine.playDecisionConfirm();
                onOperateLifeSupport('craft_ki');
              }}
              className={`rounded-lg border p-2.5 text-left text-xs space-y-1 ${
                canCraftKi
                  ? 'border-[#F2C879]/65 bg-[#292012] hover:bg-[#3a2d18] text-white cursor-pointer'
                  : 'border-slate-700 bg-slate-800/70 text-slate-500 cursor-not-allowed'
              }`}
            >
              <div className="font-bold text-[#F2C879] flex items-center gap-1">
                <Pill className="w-3.5 h-3.5" />
                <span>{en ? 'Craft KI Pills' : 'Chế Tạo Thuốc KI'}</span>
              </div>
              <div className="text-[11px] opacity-85">+1 KI · {en ? 'Cost' : 'Cần'}: 1 🔩 + 1 🔌</div>
            </button>
          </div>
        </div>

        {/* Active Space Medicine Ailments */}
        <div className="mt-4 space-y-2.5">
          {gameState.active_ailments.length === 0 ? (
            <div className="flex items-center gap-3 rounded-xl border border-[#6baf83]/40 bg-[#102420] p-4 text-sm font-medium text-[#bbf7d0]">
              <ShieldCheck className="h-5 w-5 shrink-0 text-[#6baf83]" />
              <span>{copy.medNoAilments}</span>
            </div>
          ) : (
            gameState.active_ailments.map((aid) => {
              const meta = SPACE_AILMENTS_META[aid];
              return (
                <div
                  key={aid}
                  className="rounded-xl border border-rose-500/50 bg-[#1a1626] p-3.5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="max-w-lg">
                      <div className="flex items-center gap-2 text-sm font-bold text-rose-200">
                        <span>{meta.icon}</span>
                        <span>{en ? meta.nameEn : meta.nameVi}</span>
                      </div>
                      <p className="mt-1 text-xs text-slate-200">
                        {en ? meta.symptomEn : meta.symptomVi}
                      </p>
                      <p className="mt-1 text-[11px] text-[#70b8d3]">
                        🔬 {en ? meta.nasaFactEn : meta.nasaFactVi}
                      </p>
                      <p className="mt-1 text-[11px] text-[#f2c879]">
                        💊 {en ? meta.cureGuideEn : meta.cureGuideVi}
                      </p>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      {aid === 'muscle_bone_loss' && (
                        <button
                          type="button"
                          onClick={() => {
                            soundEngine.playMedHeal();
                            onTreatAilment(aid, 'ared');
                          }}
                          className="rounded-lg bg-[#38bdf8] px-3 py-1.5 text-xs font-bold text-slate-950 hover:bg-[#7dd3fc] cursor-pointer"
                        >
                          🏋️ {en ? 'Run ARED Now' : 'Tập ARED ngay'}
                        </button>
                      )}
                      {aid === 'lunar_dust_pneumonia' && (
                        <button
                          type="button"
                          onClick={() => {
                            soundEngine.playMedHeal();
                            onTreatAilment(aid, 'hepa');
                          }}
                          className="rounded-lg bg-[#6baf83] px-3 py-1.5 text-xs font-bold text-slate-950 hover:bg-[#86efac] cursor-pointer"
                        >
                          🧹 {en ? 'Rinse HEPA Filter' : 'Rửa lọc HEPA'}
                        </button>
                      )}
                      {aid === 'radiation_sickness' && kiPills > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            soundEngine.playMedHeal();
                            onTreatAilment(aid, 'ki_pills');
                          }}
                          className="rounded-lg bg-[#F2C879] px-3 py-1.5 text-xs font-bold text-slate-950 hover:bg-[#f7d794] cursor-pointer"
                        >
                          💊 {en ? `Take Potassium Iodide (${kiPills})` : `Uống thuốc KI (${kiPills})`}
                        </button>
                      )}
                      {aid === 'radiation_sickness' && (
                        <button
                          type="button"
                          onClick={() => {
                            soundEngine.playMedHeal();
                            onTreatAilment(aid, 'botany_tomato');
                          }}
                          className="rounded-lg bg-[#6baf83] px-3 py-1.5 text-xs font-bold text-slate-950 hover:bg-[#86efac] cursor-pointer"
                        >
                          {copy.medTreatTomatoBtn}
                        </button>
                      )}
                      {aid === 'hypercapnia' && (
                        <button
                          type="button"
                          onClick={() => {
                            soundEngine.playMedHeal();
                            onTreatAilment(aid, 'botany_wheat');
                          }}
                          className="rounded-lg bg-[#6baf83] px-3 py-1.5 text-xs font-bold text-slate-950 hover:bg-[#86efac] cursor-pointer"
                        >
                          {copy.medTreatWheatBtn}
                        </button>
                      )}
                      {medKits > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            soundEngine.playMedHeal();
                            onTreatAilment(aid, 'med_kit');
                          }}
                          className="rounded-lg border border-rose-400/50 bg-rose-950/70 px-3 py-1.5 text-xs font-bold text-rose-100 hover:bg-rose-900 cursor-pointer"
                        >
                          {copy.medTreatKitBtn} ({medKits})
                        </button>
                      )}
                    </div>
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
