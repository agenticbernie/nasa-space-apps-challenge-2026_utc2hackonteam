import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { MusicContext, soundEngine } from './audio/soundEngine';
import { BotanyLabModal } from './components/BotanyLabModal';
import { DataPadTab } from './components/DataPadModal';
import { DebriefJournal } from './components/DebriefJournal';
import { DialogueOverlay } from './components/DialogueOverlay';
import { EventConsoleModal } from './components/EventConsoleModal';
import { CommsBannerPayload, HUD } from './components/HUD';
import { MedicalBayModal } from './components/MedicalBayModal';
import { MissionLogModal } from './components/MissionLogModal';
import { NasaScienceLibraryModal } from './components/NasaScienceLibraryModal';
import { OnboardingModals } from './components/OnboardingModals';
import {
  OutpostScene3D,
  RadarTelemetry,
} from './components/OutpostScene3D';
import { PauseModal } from './components/PauseModal';
import { RadarMiniMapHandle } from './components/RadarMiniMap';
import { RoverControlModal } from './components/RoverControlModal';
import { TitleOverlay } from './components/TitleOverlay';
import {
  getCommanderMedBayGuide,
  getCrewChatDialogue,
  getDeviceInspectionDialogue,
  getLockedConsoleDialogue,
  getLockedRoverDialogue,
  getNpcChatChoices,
  getNpcRole,
  getNpcSequentialQuestBriefing,
  getPostShiftDialogue,
  getPrimaryShiftNpcLabel,
  getPropFunFact,
  isNpcAssignedToShift,
} from './engine/dialogueData';
import { getUiCopy } from './engine/i18n';
import {
  acceptQuestExecution,
  advanceAfterConsequence,
  applyDecision,
  applyRoverHaul,
  careForCrop,
  cleanAirlockHepa,
  completeShiftRepairProcedure,
  createInitialState,
  dismissScienceCard,
  failQuestStepTriggerSalvage,
  finishPostShiftDialogue,
  getShiftScript,
  getUnlockedRoomFlags,
  markQuestKnowledgeRead,
  operateLifeSupport,
  repairEvaRover,
  runAredExercise,
  tickEclssAndTimeline,
  treatAilment,
  triggerRoverBreakdown,
  unlockEvaSector,
  upgradeBaseRadar,
} from './engine/simulationEngine';
import {
  ActiveDialogueOverlay,
  AirlockState,
  AstronautBadgeId,
  ChoiceId,
  DialogueChoiceOption,
  GameState,
  HoveredInteractable,
  Language,
  OutpostZoneId,
  PerformanceSettings,
  PerformanceTelemetry,
  RoomUnlockKey,
} from './engine/types';

type DataPadPhase = 'closed' | 'raising' | 'open' | 'lowering';

const INITIAL_AIRLOCKS: AirlockState = {
  solarControl: false,
  solarBay: false,
  greenhouseControl: false,
  greenhouseBay: false,
  habitatControl: false,
  habitatBay: false,
};

export default function App() {
  const [gameState, setGameState] = useState<GameState>(() => createInitialState());
  const [lang, setLang] = useState<Language>('vi');
  const [airlocks, setAirlocks] = useState<AirlockState>(INITIAL_AIRLOCKS);
  const [hoveredTarget, setHoveredTarget] = useState<HoveredInteractable | null>(null);
  const [pointerLocked, setPointerLocked] = useState(false);
  const [nearLockedDoor, setNearLockedDoor] = useState(false);
  const [lockedDoorBanner, setLockedDoorBanner] = useState(false);
  const [lockedDoorReason, setLockedDoorReason] = useState<'shift_unlock' | 'trolley' | undefined>(undefined);
  const [newlyUnlockedRoom, setNewlyUnlockedRoom] = useState<RoomUnlockKey | null>(null);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState<number>(() => soundEngine.getVolume());
  const [isPaused, setIsPaused] = useState(false);
  const [logOpen, setLogOpen] = useState(false);
  const [dataPadPhase, setDataPadPhase] = useState<DataPadPhase>('closed');
  const [dataPadTab, setDataPadTab] = useState<DataPadTab>('telemetry');
  const [cutsceneStage, setCutsceneStage] = useState(0);
  const [commsBanner, setCommsBanner] = useState<CommsBannerPayload | null>(null);
  const [scienceLibraryOpen, setScienceLibraryOpen] = useState(false);
  const [roverModalOpen, setRoverModalOpen] = useState(false);
  const [botanyModalOpen, setBotanyModalOpen] = useState(false);
  const [medBayModalOpen, setMedBayModalOpen] = useState(false);
  const [activeDialogue, setActiveDialogue] = useState<ActiveDialogueOverlay | null>(null);
  const [resetPoseNonce, setResetPoseNonce] = useState(0);
  const [perfSettings, setPerfSettings] = useState<PerformanceSettings>({
    qualityMode: 'auto',
    mouseSensitivity: 1.0,
  });
  const [perfTelemetry, setPerfTelemetry] = useState<PerformanceTelemetry>({
    fps: 60,
    activeTier: 'medium',
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
  });
  const radarRef = useRef<RadarMiniMapHandle | null>(null);
  const prevPointerLockedRef = useRef(false);
  const intentionalUnlockRef = useRef(false);
  const ctrlUnlockRef = useRef(false);
  const lastPauseViaUnlockAtRef = useRef(0);
  const dataPadTimerRef = useRef<number | null>(null);
  const lockedDoorTimerRef = useRef<number | null>(null);
  const commsTimerRef = useRef<number | null>(null);
  const roomUnlockFlashTimerRef = useRef<number | null>(null);
  const prevUnlockedRoomsRef = useRef<RoomUnlockKey[]>(['solar']);

  const t = getUiCopy(lang);
  const hasModalOpen =
    isPaused ||
    dataPadPhase !== 'closed' ||
    logOpen ||
    scienceLibraryOpen ||
    roverModalOpen ||
    botanyModalOpen ||
    medBayModalOpen ||
    activeDialogue !== null ||
    gameState.recent_achievement !== null ||
    gameState.phase !== 'playing';

  // Clean up pending timers & Web Audio engines on unmount
  useEffect(() => {
    return () => {
      if (dataPadTimerRef.current !== null) clearTimeout(dataPadTimerRef.current);
      if (lockedDoorTimerRef.current !== null) clearTimeout(lockedDoorTimerRef.current);
      if (commsTimerRef.current !== null) clearTimeout(commsTimerRef.current);
      if (roomUnlockFlashTimerRef.current !== null) clearTimeout(roomUnlockFlashTimerRef.current);
      soundEngine.stopRedAlertAlarm();
      soundEngine.setMusicContext('none');
    };
  }, []);

  // Unlock browser Web Audio cleanly on first user interaction anywhere in app
  useEffect(() => {
    const unlock = () => soundEngine.unlockAudio();
    window.addEventListener('pointerdown', unlock, { passive: true });
    window.addEventListener('keydown', unlock, { passive: true });
    return () => {
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
    };
  }, []);

  // Continuous 72h Timeline & Live NASA ECLSS Telemetry Ticker (1 Hz while actively playing)
  useEffect(() => {
    if (
      gameState.phase !== 'playing' ||
      !gameState.tutorial_completed ||
      hasModalOpen
    ) {
      return;
    }
    const timer = window.setInterval(() => {
      setGameState((prev) => tickEclssAndTimeline(prev, 1, lang));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [gameState.phase, gameState.tutorial_completed, hasModalOpen, lang]);

  // Sync Red Alert audio lifecycle & dynamic background music context
  useEffect(() => {
    if (!gameState.spe_active || gameState.phase === 'debrief' || gameState.phase === 'title') {
      soundEngine.stopRedAlertAlarm();
    } else {
      soundEngine.setRedAlertPaused(isPaused);
    }

    let nextMusic: MusicContext = 'station';
    if (
      gameState.phase === 'title' ||
      gameState.phase === 'callsign' ||
      gameState.phase === 'intro' ||
      gameState.phase === 'cutscene' ||
      gameState.phase === 'tutorial_npc'
    ) {
      nextMusic = 'title';
    } else if (gameState.phase === 'debrief') {
      nextMusic = 'none';
    } else if (gameState.spe_active) {
      nextMusic = 'red_alert';
    } else {
      nextMusic = 'station';
    }
    soundEngine.setMusicContext(nextMusic, isPaused && gameState.phase === 'playing');
  }, [gameState.spe_active, gameState.phase, isPaused]);

  // Progressive Room Unlocking Comms Toast + Mini-Map highlight pulse
  useEffect(() => {
    const prevRooms = prevUnlockedRoomsRef.current;
    const currentRooms = gameState.unlocked_rooms || ['solar'];
    const added = currentRooms.filter((r) => !prevRooms.includes(r));
    prevUnlockedRoomsRef.current = currentRooms;

    if (added.length > 0 && gameState.tutorial_completed) {
      const names = added.map((r) => t.roomUnlockNames[r]).join(' + ');
      const unlockMsg = t.roomUnlockNotice(names);
      soundEngine.playCommsMessage();
      setNewlyUnlockedRoom(added[added.length - 1]);
      setCommsBanner({ shift: gameState.shift, message: unlockMsg });
      if (commsTimerRef.current !== null) clearTimeout(commsTimerRef.current);
      commsTimerRef.current = window.setTimeout(() => {
        commsTimerRef.current = null;
        setCommsBanner(null);
      }, 6500);
      if (roomUnlockFlashTimerRef.current !== null) clearTimeout(roomUnlockFlashTimerRef.current);
      roomUnlockFlashTimerRef.current = window.setTimeout(() => {
        roomUnlockFlashTimerRef.current = null;
        setNewlyUnlockedRoom(null);
      }, 5200);
    }
  }, [gameState.unlocked_rooms, gameState.tutorial_completed, gameState.shift, t]);

  // Keep network status synced offline-first without interrupting gameplay
  useEffect(() => {
    const syncOnline = () =>
      setPerfTelemetry((prev) => ({
        ...prev,
        isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
      }));
    window.addEventListener('online', syncOnline);
    window.addEventListener('offline', syncOnline);
    return () => {
      window.removeEventListener('online', syncOnline);
      window.removeEventListener('offline', syncOnline);
    };
  }, []);

  const showShiftCommsBanner = useCallback(
    (targetState: GameState, targetLang: Language) => {
      const copy = getUiCopy(targetLang);
      const script = getShiftScript(targetState, targetLang);
      const npcName = getPrimaryShiftNpcLabel(targetState.shift, targetLang);
      const message =
        targetState.shift === 1
          ? copy.commsShift1Start(npcName)
          : copy.commsShiftStart(targetState.shift, script.hoursLabel, npcName);

      soundEngine.playCommsMessage();
      setCommsBanner({ shift: targetState.shift, message });
      if (commsTimerRef.current !== null) {
        clearTimeout(commsTimerRef.current);
      }
      commsTimerRef.current = window.setTimeout(() => {
        commsTimerRef.current = null;
        setCommsBanner(null);
      }, 6500);
    },
    [],
  );

  const unlockPointerSafely = useCallback(() => {
    prevPointerLockedRef.current = false;
    if (document.pointerLockElement) {
      intentionalUnlockRef.current = true;
      try {
        document.exitPointerLock();
      } catch {
        intentionalUnlockRef.current = false;
      }
      window.setTimeout(() => {
        intentionalUnlockRef.current = false;
      }, 140);
    }
  }, []);

  const requestPointerLockSoon = useCallback(() => {
    const canvas = document.querySelector<HTMLCanvasElement>('[data-outpost-canvas="true"]');
    if (canvas && document.pointerLockElement !== canvas) {
      try {
        const p = canvas.requestPointerLock?.() as unknown as Promise<void> | undefined;
        if (p && typeof p.catch === 'function') p.catch(() => {});
      } catch {
        // Cursor remains unlocked until left-click on canvas
      }
    }
  }, []);

  const openDataPad = useCallback(
    (tab: DataPadTab = 'telemetry') => {
      if (dataPadTimerRef.current !== null) {
        clearTimeout(dataPadTimerRef.current);
        dataPadTimerRef.current = null;
      }
      unlockPointerSafely();
      soundEngine.playBeep(620, 0.05, 'triangle', 0.05);
      setDataPadTab(tab);
      setDataPadPhase('raising');
      dataPadTimerRef.current = window.setTimeout(() => {
        dataPadTimerRef.current = null;
        setDataPadPhase('open');
      }, 350);
    },
    [unlockPointerSafely],
  );

  const closeDataPad = useCallback(
    (relock = true) => {
      if (dataPadTimerRef.current !== null) {
        clearTimeout(dataPadTimerRef.current);
        dataPadTimerRef.current = null;
      }
      soundEngine.playBeep(480, 0.05, 'triangle', 0.05);
      setDataPadPhase('lowering');
      dataPadTimerRef.current = window.setTimeout(() => {
        dataPadTimerRef.current = null;
        setDataPadPhase('closed');
        if (relock) {
          requestPointerLockSoon();
        }
      }, 350);
    },
    [requestPointerLockSoon],
  );

  const handleToggleInfo = useCallback(() => {
    if (dataPadPhase === 'closed' || dataPadPhase === 'lowering') {
      openDataPad('telemetry');
    } else {
      closeDataPad(true);
    }
  }, [closeDataPad, dataPadPhase, openDataPad]);

  const handleToggleProgressTree = useCallback(() => {
    if (dataPadPhase === 'closed' || dataPadPhase === 'lowering') {
      openDataPad('tree');
    } else if (dataPadTab === 'tree') {
      closeDataPad(true);
    } else {
      soundEngine.playBeep(600, 0.04, 'triangle', 0.04);
      setDataPadTab('tree');
    }
  }, [closeDataPad, dataPadPhase, dataPadTab, openDataPad]);

  const handleToggleMedicalProfile = useCallback(() => {
    if (dataPadPhase === 'closed' || dataPadPhase === 'lowering') {
      openDataPad('medical');
    } else if (dataPadTab === 'medical') {
      closeDataPad(true);
    } else {
      soundEngine.playBeep(600, 0.04, 'triangle', 0.04);
      setDataPadTab('medical');
    }
  }, [closeDataPad, dataPadPhase, dataPadTab, openDataPad]);

  const showLockedDoorBanner = useCallback((reason: 'shift_unlock' | 'trolley' = 'trolley') => {
    setLockedDoorReason(reason);
    setLockedDoorBanner(true);
    if (lockedDoorTimerRef.current !== null) {
      clearTimeout(lockedDoorTimerRef.current);
    }
    lockedDoorTimerRef.current = window.setTimeout(() => {
      lockedDoorTimerRef.current = null;
      setLockedDoorBanner(false);
    }, 3500);
  }, []);

  // Unlock pointer & play victory fanfare cleanly whenever a center achievement honor modal opens
  useEffect(() => {
    if (gameState.recent_achievement !== null) {
      unlockPointerSafely();
      soundEngine.playAchievementFanfare();
    }
  }, [gameState.recent_achievement, unlockPointerSafely]);

  const handlePointerLockChange = useCallback(
    (locked: boolean) => {
      setPointerLocked(locked);
      if (!locked) {
        if (intentionalUnlockRef.current) {
          intentionalUnlockRef.current = false;
        } else if (ctrlUnlockRef.current) {
          ctrlUnlockRef.current = false;
        } else if (
          prevPointerLockedRef.current &&
          gameState.phase === 'playing' &&
          dataPadPhase === 'closed' &&
          !logOpen &&
          !scienceLibraryOpen &&
          !roverModalOpen &&
          !botanyModalOpen &&
          !medBayModalOpen &&
          !activeDialogue &&
          !gameState.recent_achievement &&
          !isPaused
        ) {
          // ESC while locked exits PointerLock in browsers -> pause the game immediately
          lastPauseViaUnlockAtRef.current = performance.now();
          soundEngine.playBeep(520, 0.06, 'triangle', 0.06);
          setIsPaused(true);
        }
      } else {
        intentionalUnlockRef.current = false;
        ctrlUnlockRef.current = false;
      }
      prevPointerLockedRef.current = locked;
    },
    [
      activeDialogue,
      botanyModalOpen,
      dataPadPhase,
      gameState.phase,
      gameState.recent_achievement,
      isPaused,
      logOpen,
      medBayModalOpen,
      roverModalOpen,
      scienceLibraryOpen,
    ],
  );

  const handleToggleLanguage = useCallback((nextLang: Language) => {
    soundEngine.playBeep(680, 0.04, 'triangle', 0.04);
    setLang(nextLang);
    setActiveDialogue(null);
  }, []);

  const handleToggleMute = useCallback(() => {
    soundEngine.unlockAudio();
    setMuted((prev) => {
      const next = !prev;
      soundEngine.setMuted(next);
      return next;
    });
  }, []);

  const handleVolumeChange = useCallback((nextVol: number) => {
    soundEngine.unlockAudio();
    soundEngine.setVolume(nextVol);
    setVolume(nextVol);
    setMuted(nextVol <= 0);
  }, []);

  const handleStartMissionFromTitle = useCallback(
    (validCallsign: string, badge: AstronautBadgeId) => {
      soundEngine.unlockAudio();
      soundEngine.playDecisionConfirm();
      setCutsceneStage(0);
      setGameState((prev) => ({
        ...prev,
        astronaut_callsign: validCallsign,
        astronaut_badge: badge,
        phase: 'cutscene',
      }));
    },
    [],
  );

  const handleSubmitCallsign = useCallback((validCallsign: string) => {
    soundEngine.unlockAudio();
    soundEngine.playDecisionConfirm();
    setCutsceneStage(0);
    setGameState((prev) => ({
      ...prev,
      astronaut_callsign: validCallsign,
      phase: 'cutscene',
    }));
  }, []);

  const handleFinishCutscene = useCallback(() => {
    soundEngine.playConsoleOpen();
    setResetPoseNonce((n) => n + 1);
    setGameState((prev) => ({ ...prev, phase: 'tutorial_npc' }));
  }, []);

  const handleCutsceneStageChange = useCallback(
    (stage: number, finished?: boolean) => {
      if (finished) {
        handleFinishCutscene();
      } else {
        setCutsceneStage(stage);
      }
    },
    [handleFinishCutscene],
  );

  const handleCompleteTutorial = useCallback(() => {
    soundEngine.playDecisionConfirm();
    if (dataPadTimerRef.current !== null) {
      clearTimeout(dataPadTimerRef.current);
      dataPadTimerRef.current = null;
    }
    setDataPadPhase('closed');
    setResetPoseNonce((n) => n + 1);
    const nextState: GameState = {
      ...gameState,
      tutorial_completed: true,
      phase: 'playing',
    };
    setGameState(nextState);
    showShiftCommsBanner(nextState, lang);
    requestPointerLockSoon();
  }, [gameState, lang, requestPointerLockSoon, showShiftCommsBanner]);

  const handleBeginMission = useCallback(() => {
    handleCompleteTutorial();
  }, [handleCompleteTutorial]);

  const handleZoneChange = useCallback((zone: OutpostZoneId) => {
    setGameState((prev) =>
      prev.current_zone === zone ? prev : { ...prev, current_zone: zone },
    );
  }, []);

  const handleOpenConsole = useCallback(() => {
    unlockPointerSafely();
    soundEngine.playConsoleOpen();
    if (dataPadTimerRef.current !== null) {
      clearTimeout(dataPadTimerRef.current);
      dataPadTimerRef.current = null;
    }
    setDataPadPhase('closed');
    setLogOpen(false);
    setActiveDialogue(null);
    setGameState((prev) =>
      prev.phase === 'playing' ? { ...prev, phase: 'console' } : prev,
    );
  }, [unlockPointerSafely]);

  const handleInteractTarget = useCallback(
    (target: HoveredInteractable) => {
      // Commander NPC has ZERO interaction once tutorial_completed is true
      if (target.kind === 'commander_npc') {
        return;
      }

      // Grab or park the 3D Supply Trolley without breaking FPS pointer lock
      if (target.kind === 'supply_trolley') {
        soundEngine.playBeep(620, 0.07, 'triangle', 0.07);
        setGameState((prev) => ({ ...prev, trolley_attached: !prev.trolley_attached }));
        return;
      }

      if (target.kind === 'locked_door') {
        const unlocked = getUnlockedRoomFlags(gameState);
        soundEngine.playBeep(260, 0.08, 'square', 0.05);
        showLockedDoorBanner(!unlocked.warehouse ? 'shift_unlock' : 'trolley');
        return;
      }

      if (target.kind === 'med_bay' && !getUnlockedRoomFlags(gameState).med_bay) {
        soundEngine.playWarningAlarm();
        showLockedDoorBanner('shift_unlock');
        return;
      }

      unlockPointerSafely();
      if (target.kind === 'npc') {
        soundEngine.playConsoleOpen();
        const npcId = target.id === 'npc_maya' ? 'maya' : 'sam';
        const npcRole = getNpcRole(npcId, lang);
        if (
          !gameState.shift_mission_accepted &&
          isNpcAssignedToShift(npcId, gameState.shift)
        ) {
          const briefing = getNpcSequentialQuestBriefing(npcId, gameState.shift, lang);
          setActiveDialogue({
            mode: 'quest_accept',
            npcId,
            npcRole,
            title: briefing.title,
            turns: [],
            sequentialSteps: briefing.steps,
            finalActionLabel: briefing.finalActionLabel,
            hintText: briefing.hintText,
            continueLabel: briefing.finalActionLabel,
            acceptsShiftQuest: true,
          });
          return;
        }
        const chat = getCrewChatDialogue(npcId, gameState, lang);
        setActiveDialogue({
          mode: 'crew_chat',
          npcId,
          npcRole,
          title: chat.title,
          turns: chat.turns,
          continueLabel: t.dialogueClose,
          choices: getNpcChatChoices(npcId, gameState, lang),
        });
        return;
      }

      if (target.kind === 'rover_console') {
        if (!gameState.eva_rover_unlocked) {
          soundEngine.playBeep(320, 0.09, 'square', 0.06);
          const lockedRover = getLockedRoverDialogue(lang);
          setActiveDialogue({
            mode: 'device_status',
            title: lockedRover.title,
            turns: lockedRover.turns,
            hintText: lockedRover.hintText,
            continueLabel: t.dialogueGotIt,
          });
          return;
        }
        soundEngine.playConsoleOpen();
        setRoverModalOpen(true);
        return;
      }

      if (target.kind === 'botany_lab') {
        soundEngine.playConsoleOpen();
        setBotanyModalOpen(true);
        return;
      }

      if (target.kind === 'med_bay') {
        soundEngine.playConsoleOpen();
        if (!gameState.med_bay_tutorial_seen) {
          const sentences = getCommanderMedBayGuide(gameState.astronaut_callsign, lang);
          const commanderName = lang === 'en' ? 'Commander AI' : 'Chỉ Huy Trạm AI';
          setGameState((prev) => ({ ...prev, med_bay_tutorial_seen: true }));
          setActiveDialogue({
            mode: 'med_bay_guide',
            npcId: 'commander',
            npcRole:
              lang === 'en'
                ? 'Aurora Station AI Commander'
                : 'AI Điều Hành Trạm Aurora',
            title:
              lang === 'en'
                ? 'Medical Bay Orientation'
                : 'Hướng Dẫn Trạm Y Tế Không Gian',
            turns: [],
            sequentialSteps: sentences.map((sentence, idx) => ({
              tag:
                lang === 'en'
                  ? `MED BAY GUIDE ${idx + 1}/${sentences.length}`
                  : `HƯỚNG DẪN Y TẾ ${idx + 1}/${sentences.length}`,
              speaker: 'commander' as const,
              speakerName: commanderName,
              text: sentence,
              typewriterLock: false,
            })),
            finalActionLabel:
              lang === 'en' ? '🩺 Open Medical Bay' : '🩺 Mở Trạm Y Tế',
            continueLabel: lang === 'en' ? '🩺 Open Medical Bay' : '🩺 Mở Trạm Y Tế',
            onCompleteGuide: 'open_med_bay',
          });
          return;
        }
        setMedBayModalOpen(true);
        return;
      }

      if (target.kind === 'prop') {
        soundEngine.playBeep(700, 0.08, 'triangle', 0.07);
        const fact = getPropFunFact(target.id, lang);
        setActiveDialogue({
          mode: 'fun_fact',
          title: fact.title,
          turns: fact.turns,
          continueLabel: t.dialogueGotIt,
        });
        return;
      }

      if (target.isCurrentShiftTrigger) {
        if (!gameState.shift_mission_accepted) {
          soundEngine.playBeep(420, 0.09, 'square', 0.05);
          const lockedMsg = getLockedConsoleDialogue(gameState.shift, lang);
          setActiveDialogue({
            mode: 'device_status',
            title: lockedMsg.title,
            turns: lockedMsg.turns,
            hintText: lockedMsg.hintText,
            continueLabel: t.dialogueGotIt,
          });
          return;
        }
        handleOpenConsole();
        return;
      }

      // Inspecting another system's device outside its active shift shows real-time telemetry + objective hint
      const inspection = getDeviceInspectionDialogue(target.id, gameState, lang);
      soundEngine.playBeep(560, 0.07, 'triangle', 0.06);
      setActiveDialogue({
        mode: 'device_status',
        title: inspection.title,
        turns: inspection.turns,
        hintText: inspection.hintText,
        continueLabel: t.dialogueGotIt,
      });
    },
    [
      gameState,
      handleOpenConsole,
      lang,
      showLockedDoorBanner,
      t.dialogueClose,
      t.dialogueGotIt,
      unlockPointerSafely,
    ],
  );

  const handleCloseConsole = useCallback(() => {
    soundEngine.playBeep(400, 0.05);
    setGameState((prev) =>
      prev.phase === 'console' ? { ...prev, phase: 'playing' } : prev,
    );
    requestPointerLockSoon();
  }, [requestPointerLockSoon]);

  const handleSelectChoice = useCallback(
    (choiceId: ChoiceId) => {
      setGameState((prev) => {
        const next = applyDecision(prev, choiceId, lang);
        if (!next.spe_active) {
          soundEngine.stopRedAlertAlarm();
        }
        if (prev.shift === 3 && choiceId === 'A') {
          soundEngine.playAirlockDoor();
        } else {
          soundEngine.playDecisionConfirm();
        }
        return next;
      });
    },
    [lang],
  );

  const handleContinueAfterConsequence = useCallback(() => {
    setGameState((prev) => {
      const next = advanceAfterConsequence(prev);
      if (next.phase === 'science_card' || next.phase === 'post_dialogue') {
        soundEngine.playConsoleOpen();
      }
      return next;
    });
  }, []);

  const handleDismissScienceCard = useCallback(() => {
    soundEngine.playConsoleOpen();
    setGameState((prev) => dismissScienceCard(prev));
  }, []);

  const handleContinuePostDialogue = useCallback(() => {
    let returnedToPlaying = false;
    let nextEnteredState: GameState | null = null;
    setGameState((prev) => {
      const next = finishPostShiftDialogue(prev, lang);
      if (next.phase === 'playing') {
        returnedToPlaying = true;
        nextEnteredState = next;
        if (!next.spe_active) {
          soundEngine.stopRedAlertAlarm();
        } else {
          soundEngine.startRedAlertAlarm();
        }
        if (next.co2_haze_active) {
          soundEngine.playWarningAlarm();
        } else {
          soundEngine.playBeep(620, 0.07);
        }
      } else if (next.phase === 'debrief') {
        soundEngine.stopRedAlertAlarm();
        if (next.outcome === 'stable') {
          soundEngine.playSuccessChime();
        } else if (next.outcome === 'failure') {
          soundEngine.playWarningAlarm();
        } else {
          soundEngine.playDecisionConfirm();
        }
      }
      return next;
    });
    if (nextEnteredState) {
      showShiftCommsBanner(nextEnteredState, lang);
    }
    if (returnedToPlaying) {
      requestPointerLockSoon();
    }
  }, [lang, requestPointerLockSoon, showShiftCommsBanner]);

  const handleRadarTelemetry = useCallback((telemetry: RadarTelemetry) => {
    radarRef.current?.update(telemetry);
  }, []);

  const handlePerfTelemetry = useCallback((telemetry: PerformanceTelemetry) => {
    setPerfTelemetry(telemetry);
  }, []);

  const handleRetry = useCallback(() => {
    soundEngine.stopRedAlertAlarm();
    soundEngine.playDecisionConfirm();
    if (dataPadTimerRef.current !== null) {
      clearTimeout(dataPadTimerRef.current);
      dataPadTimerRef.current = null;
    }
    if (commsTimerRef.current !== null) {
      clearTimeout(commsTimerRef.current);
      commsTimerRef.current = null;
    }
    setIsPaused(false);
    setScienceLibraryOpen(false);
    setRoverModalOpen(false);
    setBotanyModalOpen(false);
    setMedBayModalOpen(false);
    setDataPadPhase('closed');
    setDataPadTab('telemetry');
    setCutsceneStage(0);
    setLogOpen(false);
    setActiveDialogue(null);
    setCommsBanner(null);
    setNearLockedDoor(false);
    setLockedDoorBanner(false);
    setLockedDoorReason(undefined);
    setNewlyUnlockedRoom(null);
    prevUnlockedRoomsRef.current = ['solar'];
    setAirlocks(INITIAL_AIRLOCKS);
    setResetPoseNonce((n) => n + 1);
    const fresh = createInitialState();
    fresh.astronaut_callsign = gameState.astronaut_callsign || 'Astronaut';
    fresh.astronaut_badge = gameState.astronaut_badge || 'rocket';
    fresh.tutorial_completed = true;
    fresh.phase = 'playing';
    setGameState(fresh);
    showShiftCommsBanner(fresh, lang);
    requestPointerLockSoon();
  }, [gameState.astronaut_callsign, gameState.astronaut_badge, lang, requestPointerLockSoon, showShiftCommsBanner]);

  // Build Post-Shift VN Dialogue payload dynamically in the active language
  const postShiftDialoguePayload = useMemo<ActiveDialogueOverlay | null>(() => {
    if (gameState.phase !== 'post_dialogue') return null;
    const lastDecision = gameState.decisions[gameState.decisions.length - 1];
    if (!lastDecision) return null;
    const turns = getPostShiftDialogue(lastDecision.shift, lastDecision.choiceId, lang);
    const isEnding = gameState.outcome !== 'active' || gameState.shift >= 9;
    return {
      mode: 'post_shift',
      title: t.dialogueShiftHeader(lastDecision.shift),
      turns,
      continueLabel: isEnding ? t.dialogueViewDebrief : t.dialogueNextShift,
    };
  }, [gameState, lang, t]);

  const setPausedClean = useCallback(
    (nextPaused: boolean, lockFromClick: boolean) => {
      soundEngine.playBeep(520, 0.06, 'triangle', 0.06);
      setIsPaused(nextPaused);
      if (nextPaused) {
        unlockPointerSafely();
      } else if (lockFromClick) {
        requestPointerLockSoon();
      }
    },
    [requestPointerLockSoon, unlockPointerSafely],
  );

  const handleTogglePause = useCallback(() => {
    setPausedClean(!isPaused, isPaused);
  }, [isPaused, setPausedClean]);

  // Keyboard shortcuts: Ctrl releases cursor; I/Tab iPad; B Med Profile; L iPad Tree; P/ESC Pause
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Tab' && gameState.phase === 'playing') {
        e.preventDefault();
      }

      // Pressing Ctrl releases PointerLock cleanly to show free cursor WITHOUT pausing the game
      const subModalOpen =
        scienceLibraryOpen || roverModalOpen || botanyModalOpen || medBayModalOpen || logOpen;

      if (
        (e.key === 'Control' || e.code === 'ControlLeft' || e.code === 'ControlRight') &&
        gameState.phase === 'playing' &&
        !isPaused &&
        dataPadPhase === 'closed' &&
        !subModalOpen &&
        !activeDialogue
      ) {
        if (document.pointerLockElement) {
          ctrlUnlockRef.current = true;
          try {
            document.exitPointerLock();
          } catch {
            ctrlUnlockRef.current = false;
          }
          window.setTimeout(() => {
            ctrlUnlockRef.current = false;
          }, 140);
        }
        return;
      }

      if (
        gameState.phase === 'playing' &&
        !isPaused &&
        !subModalOpen &&
        !activeDialogue &&
        e.code === 'KeyB'
      ) {
        e.preventDefault();
        handleToggleMedicalProfile();
        return;
      }

      if (
        gameState.phase === 'playing' &&
        !isPaused &&
        !subModalOpen &&
        !activeDialogue &&
        e.code === 'KeyL'
      ) {
        e.preventDefault();
        handleToggleProgressTree();
        return;
      }

      if (
        gameState.phase === 'playing' &&
        !isPaused &&
        !subModalOpen &&
        !activeDialogue &&
        (e.code === 'KeyI' || e.code === 'Tab')
      ) {
        e.preventDefault();
        handleToggleInfo();
        return;
      }

      if (
        gameState.phase === 'playing' &&
        !subModalOpen &&
        !activeDialogue &&
        dataPadPhase === 'closed' &&
        e.code === 'KeyP'
      ) {
        e.preventDefault();
        setPausedClean(!isPaused, false);
        return;
      }

      if (e.code !== 'Escape') return;
      // Guard against browser double-firing Escape right after pointerlockchange paused the game
      if (performance.now() - lastPauseViaUnlockAtRef.current < 160) {
        return;
      }

      if (gameState.recent_achievement) {
        setGameState((prev) => ({ ...prev, recent_achievement: null }));
      } else if (scienceLibraryOpen) {
        setScienceLibraryOpen(false);
      } else if (roverModalOpen) {
        setRoverModalOpen(false);
      } else if (botanyModalOpen) {
        setBotanyModalOpen(false);
      } else if (medBayModalOpen) {
        setMedBayModalOpen(false);
      } else if (activeDialogue) {
        setActiveDialogue(null);
      } else if (logOpen) {
        setLogOpen(false);
      } else if (dataPadPhase === 'open' || dataPadPhase === 'raising') {
        closeDataPad(false);
      } else if (isPaused) {
        setPausedClean(false, false);
      } else if (gameState.phase === 'console') {
        handleCloseConsole();
      } else if (gameState.phase === 'playing' && dataPadPhase === 'closed') {
        setPausedClean(true, false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [
    gameState.phase,
    gameState.recent_achievement,
    isPaused,
    logOpen,
    dataPadPhase,
    scienceLibraryOpen,
    roverModalOpen,
    botanyModalOpen,
    medBayModalOpen,
    activeDialogue,
    closeDataPad,
    handleCloseConsole,
    handleToggleInfo,
    handleToggleMedicalProfile,
    handleToggleProgressTree,
    setPausedClean,
  ]);

  const handleDialogueContinue = useCallback(() => {
    if (postShiftDialoguePayload) {
      handleContinuePostDialogue();
      return;
    }
    if (activeDialogue) {
      if (activeDialogue.onCompleteGuide === 'open_med_bay') {
        soundEngine.playConsoleOpen();
        setActiveDialogue(null);
        setMedBayModalOpen(true);
        return;
      }
      if (activeDialogue.acceptsShiftQuest) {
        soundEngine.playDecisionConfirm();
        setGameState((prev) => ({ ...prev, shift_mission_accepted: true }));
      }
      setActiveDialogue(null);
      requestPointerLockSoon();
    }
  }, [
    activeDialogue,
    handleContinuePostDialogue,
    postShiftDialoguePayload,
    requestPointerLockSoon,
  ]);

  const handleDialogueSelectChoice = useCallback(
    (choice: DialogueChoiceOption) => {
      if (choice.action === 'accept_quest') {
        soundEngine.playDecisionConfirm();
        setGameState((prev) => ({ ...prev, shift_mission_accepted: true }));
        setActiveDialogue(null);
        requestPointerLockSoon();
        return;
      }
      if (choice.action === 'open_science') {
        soundEngine.playConsoleOpen();
        setActiveDialogue(null);
        setScienceLibraryOpen(true);
        return;
      }
      if (choice.action === 'open_rover') {
        if (!gameState.eva_rover_unlocked) {
          soundEngine.playBeep(320, 0.09, 'square', 0.06);
          const lockedRover = getLockedRoverDialogue(lang);
          setActiveDialogue({
            mode: 'device_status',
            title: lockedRover.title,
            turns: lockedRover.turns,
            hintText: lockedRover.hintText,
            continueLabel: t.dialogueGotIt,
          });
          return;
        }
        soundEngine.playConsoleOpen();
        setActiveDialogue(null);
        setRoverModalOpen(true);
        return;
      }
      if (choice.action === 'close') {
        soundEngine.playBeep(440, 0.05);
        setActiveDialogue(null);
        requestPointerLockSoon();
        return;
      }
      if (choice.action === 'reply' && choice.replyTurns) {
        soundEngine.playBeep(620, 0.05, 'triangle', 0.05);
        setActiveDialogue((prev) =>
          prev
            ? {
                ...prev,
                turns: choice.replyTurns!,
                hintText: choice.hintText ?? prev.hintText,
              }
            : null,
        );
      }
    },
    [gameState.eva_rover_unlocked, lang, requestPointerLockSoon, t.dialogueGotIt],
  );

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-[#101828]">
      {/* Isolated 3D First-Person Lunar Outpost Viewport */}
      <OutpostScene3D
        gameState={gameState}
        lang={lang}
        dataPadRaised={dataPadPhase === 'raising' || dataPadPhase === 'open'}
        isPaused={isPaused}
        hasModalOpen={hasModalOpen}
        resetPoseNonce={resetPoseNonce}
        perfSettings={perfSettings}
        onZoneChange={handleZoneChange}
        onHoverTarget={setHoveredTarget}
        onInteractTarget={handleInteractTarget}
        onPointerLockChange={handlePointerLockChange}
        onAirlocksChange={setAirlocks}
        onNearLockedDoorChange={(near, reason) => {
          setNearLockedDoor(near);
          if (near && reason) {
            setLockedDoorReason(reason);
          } else if (!near && !lockedDoorBanner) {
            setLockedDoorReason(undefined);
          }
        }}
        onWarehouseBlocked={() => showLockedDoorBanner('trolley')}
        onCutsceneStageChange={handleCutsceneStageChange}
        onRadarTelemetry={handleRadarTelemetry}
        onPerfTelemetry={handlePerfTelemetry}
      />

      {/* Prologue & Onboarding Modals (Title + Junior Astronaut ID -> 3D Cutscene -> Commander Dialogue) */}
      <TitleOverlay
        phase={gameState.phase}
        lang={lang}
        initialCallsign={gameState.astronaut_callsign}
        initialBadge={gameState.astronaut_badge}
        muted={muted}
        onToggleMute={handleToggleMute}
        onToggleLanguage={handleToggleLanguage}
        onStartMission={handleStartMissionFromTitle}
        onBeginMission={handleBeginMission}
      />

      <OnboardingModals
        phase={gameState.phase}
        callsign={gameState.astronaut_callsign}
        lang={lang}
        cutsceneStage={cutsceneStage}
        onToggleLanguage={handleToggleLanguage}
        onBackToTitle={() => setGameState((prev) => ({ ...prev, phase: 'title' }))}
        onSubmitCallsign={handleSubmitCallsign}
        onFinishCutscene={handleFinishCutscene}
        onCompleteTutorial={handleCompleteTutorial}
      />

      {/* Minimalist HUD + Top-Middle 72h Timeline + Unified iPad + Center Achievement Modal */}
      <HUD
        gameState={gameState}
        lang={lang}
        airlocks={airlocks}
        isPaused={isPaused}
        hoveredTarget={hoveredTarget}
        hasModalOpen={hasModalOpen}
        infoOpen={dataPadPhase === 'open'}
        dataPadTab={dataPadTab}
        commsBanner={commsBanner}
        pointerLocked={pointerLocked}
        lockedDoorBannerActive={nearLockedDoor || lockedDoorBanner}
        lockedDoorBannerReason={lockedDoorReason}
        newlyUnlockedRoom={newlyUnlockedRoom}
        muted={muted}
        volume={volume}
        perfSettings={perfSettings}
        perfTelemetry={perfTelemetry}
        radarRef={radarRef}
        onToggleInfo={handleToggleInfo}
        onToggleMedicalProfile={handleToggleMedicalProfile}
        onToggleProgressTree={handleToggleProgressTree}
        onChangeDataPadTab={setDataPadTab}
        onDismissComms={() => setCommsBanner(null)}
        onDismissAchievement={() => {
          soundEngine.playBeep(560, 0.05, 'triangle', 0.05);
          setGameState((prev) => ({ ...prev, recent_achievement: null }));
          requestPointerLockSoon();
        }}
        onTogglePause={handleTogglePause}
        onToggleLanguage={handleToggleLanguage}
        onUpdatePerfSettings={setPerfSettings}
        onToggleMute={handleToggleMute}
        onVolumeChange={handleVolumeChange}
        onOpenLog={() => {
          unlockPointerSafely();
          soundEngine.playBeep(540, 0.06);
          setLogOpen(true);
        }}
      />

      {/* Strict 4-Step Quest / Repair / Decision Console */}
      <EventConsoleModal
        gameState={gameState}
        lang={lang}
        onSelectChoice={handleSelectChoice}
        onContinueAfterConsequence={handleContinueAfterConsequence}
        onDismissScienceCard={handleDismissScienceCard}
        onCloseConsole={handleCloseConsole}
        onOpenRoverConsole={() => {
          if (!gameState.eva_rover_unlocked) {
            soundEngine.playBeep(320, 0.09, 'square', 0.06);
            return;
          }
          setGameState((prev) =>
            prev.phase === 'console' ? { ...prev, phase: 'playing' } : prev,
          );
          setRoverModalOpen(true);
        }}
        onCompleteRepairStep={(shift) =>
          setGameState((prev) => completeShiftRepairProcedure(prev, shift))
        }
        onGoToKnowledgeStep={() =>
          setGameState((prev) => ({ ...prev, quest_step: 'knowledge' }))
        }
        onMarkKnowledgeRead={() =>
          setGameState((prev) => ({
            ...markQuestKnowledgeRead(prev),
            quest_step: 'accepted',
          }))
        }
        onAcceptExecution={() =>
          setGameState((prev) => acceptQuestExecution(prev))
        }
        onFailQuestTriggerSalvage={(neededPart) =>
          setGameState((prev) => failQuestStepTriggerSalvage(prev, neededPart))
        }
        onRetryFromSalvage={() =>
          setGameState((prev) => ({
            ...prev,
            quest_step: 'accepted',
            quest_failed_parts_needed: false,
            quest_salvage_target_item: null,
          }))
        }
      />

      {/* EVA Click-to-Move Fog-of-War & 3-Sector Remote Control Terminal */}
      {roverModalOpen && (
        <RoverControlModal
          gameState={gameState}
          lang={lang}
          onCompleteHaul={(collected) => {
            setGameState((prev) => applyRoverHaul(prev, collected));
            setRoverModalOpen(false);
            requestPointerLockSoon();
          }}
          onUpgradeRadar={() => setGameState((prev) => upgradeBaseRadar(prev))}
          onUnlockSector={(sectorId) =>
            setGameState((prev) => unlockEvaSector(prev, sectorId))
          }
          onTriggerBreakdown={() =>
            setGameState((prev) => triggerRoverBreakdown(prev))
          }
          onRepairRover={() =>
            setGameState((prev) => repairEvaRover(prev))
          }
          onClose={() => {
            setRoverModalOpen(false);
            requestPointerLockSoon();
          }}
        />
      )}

      {/* Space Botany, Veggie & Spirulina Algae Lab Terminal */}
      {botanyModalOpen && (
        <BotanyLabModal
          gameState={gameState}
          lang={lang}
          onCareCrop={(cropId, action) =>
            setGameState((prev) => careForCrop(prev, cropId, action))
          }
          onTreatWithCrop={(ailmentId, method) =>
            setGameState((prev) => treatAilment(prev, ailmentId, method))
          }
          onOperateLifeSupport={(action) =>
            setGameState((prev) => operateLifeSupport(prev, action))
          }
          onClose={() => {
            setBotanyModalOpen(false);
            requestPointerLockSoon();
          }}
        />
      )}

      {/* Space Medicine, ECLSS OGS/WRS & Crafting Workbench Terminal */}
      {medBayModalOpen && (
        <MedicalBayModal
          gameState={gameState}
          lang={lang}
          onRunAred={() => setGameState((prev) => runAredExercise(prev))}
          onCleanHepa={() => setGameState((prev) => cleanAirlockHepa(prev))}
          onTreatAilment={(ailmentId, method) =>
            setGameState((prev) => treatAilment(prev, ailmentId, method))
          }
          onOperateLifeSupport={(action) =>
            setGameState((prev) => operateLifeSupport(prev, action))
          }
          onClose={() => {
            setMedBayModalOpen(false);
            requestPointerLockSoon();
          }}
        />
      )}

      {/* Post-Shift VN Dialogue, Crew Visual Novel HUD (Sam/Maya), and Prop Fun-Facts */}
      <DialogueOverlay
        dialogue={postShiftDialoguePayload || activeDialogue}
        lang={lang}
        onContinue={handleDialogueContinue}
        onSelectChoice={handleDialogueSelectChoice}
        onClose={() => {
          setActiveDialogue(null);
          requestPointerLockSoon();
        }}
      />

      {/* Pause Menu Modal */}
      <PauseModal
        open={isPaused && !scienceLibraryOpen}
        lang={lang}
        onResume={() => setPausedClean(false, true)}
        onRestart={handleRetry}
        onOpenLibrary={() => {
          soundEngine.playConsoleOpen();
          setScienceLibraryOpen(true);
        }}
      />

      {/* Debrief Science Journal */}
      <DebriefJournal
        gameState={gameState}
        lang={lang}
        onToggleLanguage={handleToggleLanguage}
        onRetry={handleRetry}
        onOpenScienceLibrary={() => {
          soundEngine.playConsoleOpen();
          setScienceLibraryOpen(true);
        }}
      />

      {/* Mission Log Modal (accessible during gameplay) */}
      <MissionLogModal
        open={logOpen}
        lang={lang}
        decisions={gameState.decisions}
        onClose={() => {
          setLogOpen(false);
          requestPointerLockSoon();
        }}
      />

      {/* NASA Science Library (Educator / Judges Mode) */}
      <NasaScienceLibraryModal
        open={scienceLibraryOpen}
        lang={lang}
        onClose={() => setScienceLibraryOpen(false)}
      />
    </main>
  );
}
