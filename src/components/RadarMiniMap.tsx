import React, { useImperativeHandle, useRef } from 'react';
import { isNpcAssignedToShift, SHIFT_TRIGGER_MAP } from '../engine/dialogueData';
import { getUiCopy } from '../engine/i18n';
import { AirlockState, Language, RoomUnlockKey, ShiftNumber } from '../engine/types';
import { RadarTelemetry } from './OutpostScene3D';

export interface RadarMiniMapHandle {
  update: (t: RadarTelemetry) => void;
}

interface RadarMiniMapProps {
  shift: ShiftNumber;
  lang: Language;
  isCriticalAlert: boolean;
  shiftMissionAccepted: boolean;
  handoverActive?: boolean;
  airlocks: AirlockState;
  unlockedRooms: Record<RoomUnlockKey, boolean>;
  newlyUnlockedRoom?: RoomUnlockKey | null;
}

// Map doubled outpost world coordinates (x: -24.2..24.5, z: -6.8..29.4) -> SVG viewBox (0..180, 0..136)
function toSvgX(worldX: number): number {
  return ((worldX + 24.2) / 48.7) * 180;
}
function toSvgY(worldZ: number): number {
  return ((worldZ + 6.8) / 36.2) * 136;
}

export const RadarMiniMap = React.forwardRef<RadarMiniMapHandle, RadarMiniMapProps>(
  (
    {
      shift,
      lang,
      isCriticalAlert,
      shiftMissionAccepted,
      handoverActive = false,
      airlocks,
      unlockedRooms,
      newlyUnlockedRoom = null,
    },
    ref,
  ) => {
    const playerRef = useRef<SVGGElement | null>(null);
    const samGroupRef = useRef<SVGGElement | null>(null);
    const mayaGroupRef = useRef<SVGGElement | null>(null);
    const t = getUiCopy(lang);

    useImperativeHandle(ref, () => ({
      update: (telemetry: RadarTelemetry) => {
        if (playerRef.current) {
          const px = toSvgX(telemetry.playerX).toFixed(1);
          const py = toSvgY(telemetry.playerZ).toFixed(1);
          const deg = ((-telemetry.playerYaw * 180) / Math.PI).toFixed(1);
          playerRef.current.setAttribute('transform', `translate(${px}, ${py}) rotate(${deg})`);
        }
        if (samGroupRef.current) {
          const sx = toSvgX(telemetry.samX).toFixed(1);
          const sy = toSvgY(telemetry.samZ).toFixed(1);
          samGroupRef.current.setAttribute('transform', `translate(${sx}, ${sy})`);
        }
        if (mayaGroupRef.current) {
          const mx = toSvgX(telemetry.mayaX).toFixed(1);
          const my = toSvgY(telemetry.mayaZ).toFixed(1);
          mayaGroupRef.current.setAttribute('transform', `translate(${mx}, ${my})`);
        }
      },
    }));

    const trigger = SHIFT_TRIGGER_MAP[shift];
    const objX = toSvgX(trigger.x);
    const objY = toSvgY(trigger.z);
    const beaconColor = isCriticalAlert ? '#D76562' : '#F2C879';
    const samHasQuest = !handoverActive && !shiftMissionAccepted && isNpcAssignedToShift('sam', shift);
    const mayaHasQuest = !handoverActive && !shiftMissionAccepted && isNpcAssignedToShift('maya', shift);

    return (
      <div className="pixel-panel p-2 w-[184px] bg-[#0a1322]/95 border-2 border-[#70B8D3]/70 pointer-events-none select-none">
        <div className="flex items-center justify-between text-[10px] font-mono text-[#70B8D3] pb-1 border-b border-slate-700/80 mb-1">
          <span>{t.radarTitle}</span>
          <span className="text-[#F2C879] font-bold">{t.radarShiftBadge(shift)}</span>
        </div>

        <svg
          viewBox="0 0 180 136"
          className="w-full h-auto bg-[#070e19] border border-slate-800 block"
          aria-label="Station Radar Mini-Map"
        >
          <defs>
            <pattern id="crtGrid" width="18" height="18" patternUnits="userSpaceOnUse">
              <path d="M 18 0 L 0 0 0 18" fill="none" stroke="#16253b" strokeWidth="0.7" />
            </pattern>
          </defs>
          <rect width="180" height="136" fill="url(#crtGrid)" />

          {/* 8.4m Extended Connecting Corridors */}
          <rect
            x={toSvgX(-14.0)}
            y={toSvgY(-1.8)}
            width={toSvgX(-5.6) - toSvgX(-14.0)}
            height={toSvgY(1.8) - toSvgY(-1.8)}
            fill="#162235"
            stroke="#475569"
            strokeWidth="1"
          />
          <rect
            x={toSvgX(5.6)}
            y={toSvgY(-1.8)}
            width={toSvgX(14.0) - toSvgX(5.6)}
            height={toSvgY(1.8) - toSvgY(-1.8)}
            fill="#162235"
            stroke="#475569"
            strokeWidth="1"
          />
          <rect
            x={toSvgX(-1.8)}
            y={toSvgY(5.6)}
            width={toSvgX(1.8) - toSvgX(-1.8)}
            height={toSvgY(14.0) - toSvgY(5.6)}
            fill="#162235"
            stroke="#475569"
            strokeWidth="1"
          />

          {/* West: Solar Bay (-22.6..-14.0) */}
          <rect
            x={toSvgX(-22.6)}
            y={toSvgY(-4.4)}
            width={toSvgX(-14.0) - toSvgX(-22.6)}
            height={toSvgY(4.4) - toSvgY(-4.4)}
            fill="#17253d"
            stroke="#70B8D3"
            strokeWidth="1.2"
          />
          <text x={toSvgX(-21.8)} y={toSvgY(-2.3)} fill="#70B8D3" fontSize="6" fontFamily="monospace">
            SOLAR
          </text>

          {/* Center: Mission Control (-5.6..5.6) */}
          <rect
            x={toSvgX(-5.6)}
            y={toSvgY(-5.6)}
            width={toSvgX(5.6) - toSvgX(-5.6)}
            height={toSvgY(5.6) - toSvgY(-5.6)}
            fill="#1c2a42"
            stroke="#94a3b8"
            strokeWidth="1.2"
          />
          <text x={toSvgX(-4.6)} y={toSvgY(-3.5)} fill="#e2e8f0" fontSize="6" fontFamily="monospace">
            CONTROL
          </text>

          {/* East: Greenhouse (14.0..23.2) */}
          <rect
            x={toSvgX(14.0)}
            y={toSvgY(-4.4)}
            width={toSvgX(23.2) - toSvgX(14.0)}
            height={toSvgY(4.4) - toSvgY(-4.4)}
            fill={!unlockedRooms.greenhouse ? '#121520' : '#142d27'}
            stroke={
              newlyUnlockedRoom === 'greenhouse'
                ? '#4ade80'
                : !unlockedRooms.greenhouse
                  ? '#dc2626'
                  : '#6BAF83'
            }
            strokeWidth={newlyUnlockedRoom === 'greenhouse' ? '2.2' : '1.2'}
            strokeDasharray={!unlockedRooms.greenhouse ? '3 2' : undefined}
          />
          <text
            x={toSvgX(14.8)}
            y={toSvgY(-2.3)}
            fill={!unlockedRooms.greenhouse ? '#f87171' : '#6BAF83'}
            fontSize="6"
            fontFamily="monospace"
          >
            {unlockedRooms.greenhouse ? 'GARDEN' : '🔒GARDEN'}
          </text>

          {/* South: Expanded Habitat, Shelter & Supply Storage Warehouse (z = 14.0..28.0) */}
          <rect
            x={toSvgX(-5.8)}
            y={toSvgY(14.0)}
            width={toSvgX(5.8) - toSvgX(-5.8)}
            height={toSvgY(20.6) - toSvgY(14.0)}
            fill={!unlockedRooms.eclss ? '#16141c' : '#27241a'}
            stroke={
              newlyUnlockedRoom === 'eclss' || newlyUnlockedRoom === 'shelter'
                ? '#4ade80'
                : !unlockedRooms.eclss
                  ? '#dc2626'
                  : '#F0B85D'
            }
            strokeWidth={
              newlyUnlockedRoom === 'eclss' || newlyUnlockedRoom === 'shelter' ? '2.2' : '1.2'
            }
            strokeDasharray={!unlockedRooms.eclss ? '3 2' : undefined}
          />
          <rect
            x={toSvgX(-5.8)}
            y={toSvgY(20.6)}
            width={toSvgX(5.8) - toSvgX(-5.8)}
            height={toSvgY(28.0) - toSvgY(20.6)}
            fill={!unlockedRooms.warehouse ? '#161218' : '#261e16'}
            stroke={
              newlyUnlockedRoom === 'warehouse'
                ? '#4ade80'
                : !unlockedRooms.warehouse
                  ? '#dc2626'
                  : '#fdba74'
            }
            strokeWidth={newlyUnlockedRoom === 'warehouse' ? '2.2' : '1.2'}
            strokeDasharray={!unlockedRooms.warehouse ? '3 2' : undefined}
          />
          <text
            x={toSvgX(-4.6)}
            y={toSvgY(19.2)}
            fill={!unlockedRooms.eclss ? '#f87171' : unlockedRooms.shelter ? '#4ade80' : '#F0B85D'}
            fontSize="5.2"
            fontFamily="monospace"
          >
            {unlockedRooms.eclss ? (unlockedRooms.shelter ? 'SHELTER' : 'ECLSS') : '🔒ECLSS'}
          </text>
          <text
            x={toSvgX(-4.6)}
            y={toSvgY(25.2)}
            fill={!unlockedRooms.warehouse ? '#f87171' : '#fdba74'}
            fontSize="5.2"
            fontFamily="monospace"
          >
            {unlockedRooms.warehouse ? 'WAREHOUSE' : '🔒WAREHOUSE'}
          </text>

          {/* 6 Live Proximity Auto-Door Indicators (Green = Open, Red = Locked Shift, Orange = Closed) */}
          <line
            x1={toSvgX(-6.05)}
            y1={toSvgY(-1.6)}
            x2={toSvgX(-6.05)}
            y2={toSvgY(1.6)}
            stroke={airlocks.solarControl ? '#4ade80' : '#f59e0b'}
            strokeWidth="2.2"
            strokeDasharray={airlocks.solarControl ? '2 3' : undefined}
          />
          <line
            x1={toSvgX(-13.55)}
            y1={toSvgY(-1.6)}
            x2={toSvgX(-13.55)}
            y2={toSvgY(1.6)}
            stroke={airlocks.solarBay ? '#4ade80' : '#f59e0b'}
            strokeWidth="2.2"
            strokeDasharray={airlocks.solarBay ? '2 3' : undefined}
          />
          <line
            x1={toSvgX(6.05)}
            y1={toSvgY(-1.6)}
            x2={toSvgX(6.05)}
            y2={toSvgY(1.6)}
            stroke={!unlockedRooms.greenhouse ? '#ef4444' : airlocks.greenhouseControl ? '#4ade80' : '#f59e0b'}
            strokeWidth="2.2"
            strokeDasharray={airlocks.greenhouseControl ? '2 3' : undefined}
          />
          <line
            x1={toSvgX(13.55)}
            y1={toSvgY(-1.6)}
            x2={toSvgX(13.55)}
            y2={toSvgY(1.6)}
            stroke={!unlockedRooms.greenhouse ? '#ef4444' : airlocks.greenhouseBay ? '#4ade80' : '#f59e0b'}
            strokeWidth="2.2"
            strokeDasharray={airlocks.greenhouseBay ? '2 3' : undefined}
          />
          <line
            x1={toSvgX(-1.6)}
            y1={toSvgY(6.05)}
            x2={toSvgX(1.6)}
            y2={toSvgY(6.05)}
            stroke={!unlockedRooms.eclss ? '#ef4444' : airlocks.habitatControl ? '#4ade80' : '#f59e0b'}
            strokeWidth="2.2"
            strokeDasharray={airlocks.habitatControl ? '2 3' : undefined}
          />
          <line
            x1={toSvgX(-1.6)}
            y1={toSvgY(13.55)}
            x2={toSvgX(1.6)}
            y2={toSvgY(13.55)}
            stroke={!unlockedRooms.eclss ? '#ef4444' : airlocks.habitatBay ? '#4ade80' : '#f59e0b'}
            strokeWidth="2.2"
            strokeDasharray={airlocks.habitatBay ? '2 3' : undefined}
          />

          {/* Specialized Station Terminals: Rover (R), Botany (B), Med Bay (M) */}
          <rect
            x={toSvgX(-3.6) - 2.4}
            y={toSvgY(-2.6) - 2.4}
            width="4.8"
            height="4.8"
            fill={unlockedRooms.warehouse ? '#38bdf8' : '#7f1d1d'}
            stroke="#0f172a"
            strokeWidth="0.7"
          />
          <rect
            x={toSvgX(15.1) - 2.4}
            y={toSvgY(-3.1) - 2.4}
            width="4.8"
            height="4.8"
            fill={unlockedRooms.greenhouse ? '#4ade80' : '#7f1d1d'}
            stroke="#0f172a"
            strokeWidth="0.7"
          />
          <rect
            x={toSvgX(-2.85) - 2.4}
            y={toSvgY(14.85) - 2.4}
            width="4.8"
            height="4.8"
            fill={unlockedRooms.med_bay ? '#fb7185' : '#7f1d1d'}
            stroke={newlyUnlockedRoom === 'med_bay' ? '#4ade80' : '#0f172a'}
            strokeWidth="0.8"
          />

          {/* Flashing Objective Beacon (active after accepting quest from [!] NPC) */}
          {!handoverActive && shiftMissionAccepted ? (
            <g transform={`translate(${objX}, ${objY})`}>
              <circle r="8.5" fill="none" stroke={beaconColor} strokeWidth="1.4" opacity="0.85">
                <animate attributeName="r" values="5;10;5" dur="1.4s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.95;0.25;0.95" dur="1.4s" repeatCount="indefinite" />
              </circle>
              <circle r="2.8" fill={beaconColor} />
              <text
                x="0"
                y="-9"
                textAnchor="middle"
                fill={beaconColor}
                fontSize="7"
                fontWeight="bold"
                fontFamily="monospace"
              >
                {t.radarShortShift(shift)}
              </text>
            </g>
          ) : !handoverActive ? (
            <g transform={`translate(${objX}, ${objY})`} opacity="0.4">
              <circle r="4" fill="none" stroke="#94a3b8" strokeWidth="1" strokeDasharray="2 2" />
            </g>
          ) : null}

          {/* Sam (Orange) with live [!] badge */}
          <g ref={samGroupRef} transform={`translate(${toSvgX(-17.8)}, ${toSvgY(2.2)})`}>
            {samHasQuest && (
              <>
                <circle r="8.5" fill="none" stroke="#ef4444" strokeWidth="1.5">
                  <animate attributeName="r" values="5;10;5" dur="1.1s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="1;0.3;1" dur="1.1s" repeatCount="indefinite" />
                </circle>
                <circle cx="0" cy="-8.5" r="4.6" fill="#dc2626" stroke="#fecaca" strokeWidth="0.9" />
                <text x="0" y="-6.2" textAnchor="middle" fill="#ffffff" fontSize="6.5" fontWeight="bold" fontFamily="monospace">
                  !
                </text>
              </>
            )}
            <circle r="3.2" fill="#f97316" stroke="#fff" strokeWidth="0.8" />
          </g>

          {/* Maya (Green) with live [!] badge */}
          <g ref={mayaGroupRef} transform={`translate(${toSvgX(18.2)}, ${toSvgY(0)})`}>
            {mayaHasQuest && (
              <>
                <circle r="8.5" fill="none" stroke="#ef4444" strokeWidth="1.5">
                  <animate attributeName="r" values="5;10;5" dur="1.1s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="1;0.3;1" dur="1.1s" repeatCount="indefinite" />
                </circle>
                <circle cx="0" cy="-8.5" r="4.6" fill="#dc2626" stroke="#fecaca" strokeWidth="0.9" />
                <text x="0" y="-6.2" textAnchor="middle" fill="#ffffff" fontSize="6.5" fontWeight="bold" fontFamily="monospace">
                  !
                </text>
              </>
            )}
            <circle r="3.2" fill="#4ade80" stroke="#fff" strokeWidth="0.8" />
          </g>

          {/* Real-time Player Arrow */}
          <g ref={playerRef} transform={`translate(${toSvgX(0)}, ${toSvgY(1.4)})`}>
            <polygon points="0,-5.5 4,4 0,1.8 -4,4" fill="#ffffff" stroke="#38bdf8" strokeWidth="1" />
          </g>
        </svg>

        <div className="flex items-center justify-between text-[9px] font-mono text-slate-300 pt-1">
          <span className="flex items-center gap-1">
            <span className="inline-block w-2 h-2 bg-white border border-[#38bdf8]" /> {t.radarYou}
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-2 h-2 rounded-full bg-[#f97316]" /> Sam
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-2 h-2 rounded-full bg-[#4ade80]" /> Maya
          </span>
          {handoverActive ? (
            <span className="font-bold text-[#70B8D3]">● FREE</span>
          ) : !shiftMissionAccepted ? (
            <span className="font-bold text-[#f87171]">[!] {t.radarShortShift(shift)}</span>
          ) : (
            <span style={{ color: beaconColor }} className="font-bold">
              ● {t.radarShortShift(shift)}
            </span>
          )}
        </div>
      </div>
    );
  },
);
RadarMiniMap.displayName = 'RadarMiniMap';
