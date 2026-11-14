export type Language = 'vi' | 'en';
export type QualityMode = 'auto' | 'low' | 'medium' | 'high';
export type ResolvedQualityTier = 'low' | 'medium' | 'high';

export type ShiftNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export interface PerformanceSettings {
  qualityMode: QualityMode;
  mouseSensitivity: number;
}

export interface PerformanceTelemetry {
  fps: number;
  activeTier: ResolvedQualityTier;
  isOnline: boolean;
}

export type RecoveryCondition = 'normal' | 'degraded';
export type FilterCondition = 'normal' | 'warning';
export type RadiationRisk = 'unassessed' | 'at-risk' | 'protected-risk';
export type ShelterState = 'not-sheltered' | 'sheltered';
export type MissionOutcome = 'active' | 'stable' | 'stress' | 'failure';

export type GamePhase =
  | 'title'
  | 'callsign'
  | 'cutscene'
  | 'tutorial_npc'
  | 'intro'
  | 'playing'
  | 'console'
  | 'consequence'
  | 'science_card'
  | 'post_dialogue'
  | 'debrief';

export type QuestStepPhase =
  | 'briefing'
  | 'knowledge'
  | 'accepted'
  | 'executing'
  | 'salvage_subquest'
  | 'resolved';

export type EvaSectorId = 'sector_easy' | 'sector_medium' | 'sector_hard';

export type AchievementId =
  | 'shift_1_touchdown'
  | 'shift_2_electrolysis'
  | 'shift_3_first_night'
  | 'shift_4_water_loop'
  | 'shift_5_dust_storm'
  | 'shift_6_veggie_bloom'
  | 'shift_7_co2_balance'
  | 'shift_8_solar_shield'
  | 'shift_9_hls_rendezvous'
  | 'sector_easy_unlocked'
  | 'sector_medium_unlocked'
  | 'sector_hard_unlocked'
  | 'grand_72h_survivor';

export interface EclssTelemetry {
  o2_kpa: number; // Nominal 21.3 kPa
  o2_consume_kg_hr: number; // 0.035 kg/hr
  water_l_day: number; // 2.5 - 3.0 L/day
  calories_kcal: number; // 2500 - 3000 kcal/day
  radiation_msv: number; // Cumulative mSv
  body_temp_c: number; // Nominal 37.0 C
}

export type OutpostZoneId = 'control' | 'solar' | 'greenhouse' | 'habitat';

export type ChoiceId = 'A' | 'B';

export type SpeakerId = 'operator' | 'sam' | 'maya' | 'commander' | 'system';

export type SupplyItemId =
  | 'solar_cell'
  | 'water_filter'
  | 'rad_shield'
  | 'hardy_seeds'
  | 'lioh_filter'
  | 'med_kit'
  | 'scrap_metal'
  | 'electronic_parts'
  | 'hepa_filter'
  | 'ki_pills'
  | 'spirulina_ration';

export type SupplyInventory = Record<SupplyItemId, number>;

export type SpaceAilmentId =
  | 'radiation_sickness'
  | 'lunar_dust_pneumonia'
  | 'hypercapnia'
  | 'muscle_bone_loss';

export type CropId = 'lettuce' | 'tomato' | 'wheat' | 'spirulina';

export type LedSpectrumMode = 'red_blue' | 'full_bright' | 'off';

export interface CropState {
  id: CropId;
  growth: number; // 0-100
  watered: boolean;
  ledMode: LedSpectrumMode;
  pollinated: boolean;
}

export interface RepairStepOption {
  id: string;
  orderIndex: number; // 1, 2, 3
  labelVi: string;
  labelEn: string;
  wrongHintVi: string;
  wrongHintEn: string;
}

export interface RepairProcedureDef {
  shift: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
  requiredPart: SupplyItemId;
  titleVi: string;
  titleEn: string;
  steps: RepairStepOption[]; // ordered 1, 2, 3
}

export interface DialogueTurn {
  speaker: SpeakerId;
  speakerName: string;
  text: string;
}

export interface DialogueChoiceOption {
  id: string;
  label: string;
  tone?: 'primary' | 'science' | 'info' | 'exit';
  action: 'accept_quest' | 'reply' | 'open_science' | 'open_rover' | 'close';
  replyTurns?: DialogueTurn[];
  hintText?: string;
}

export interface SequentialBriefingStep {
  tag: string;
  speaker: SpeakerId;
  speakerName: string;
  text: string;
  hintText?: string;
  typewriterLock?: boolean;
}

export interface ActiveDialogueOverlay {
  mode:
    | 'post_shift'
    | 'crew_chat'
    | 'fun_fact'
    | 'device_status'
    | 'quest_accept'
    | 'med_bay_guide';
  title: string;
  npcId?: 'sam' | 'maya' | 'commander';
  npcRole?: string;
  turns: DialogueTurn[];
  choices?: DialogueChoiceOption[];
  sequentialSteps?: SequentialBriefingStep[];
  finalActionLabel?: string;
  hintText?: string;
  continueLabel: string;
  acceptsShiftQuest?: boolean;
  onCompleteGuide?: 'open_med_bay';
}

export type AirlockId =
  | 'solarControl'
  | 'solarBay'
  | 'greenhouseControl'
  | 'greenhouseBay'
  | 'habitatControl'
  | 'habitatBay';
export type AirlockState = Record<AirlockId, boolean>;

export type InteractableKind =
  | 'shift_trigger'
  | 'npc'
  | 'commander_npc'
  | 'prop'
  | 'airlock'
  | 'locked_door'
  | 'supply_trolley'
  | 'rover_console'
  | 'botany_lab'
  | 'med_bay'
  | 'chamber_info';

export interface HoveredInteractable {
  kind: InteractableKind;
  id: string;
  zone: OutpostZoneId;
  label: string;
  isCurrentShiftTrigger: boolean;
}

export interface EnergyAllocationResult {
  S: number;
  aL: number;
  aH: number;
  P: number;
  D: number;
  U: number;
  Q: number;
  X: number;
  B_next: number;
  life_shortfall: number;
  greenhouse_shortfall: number;
}

export interface DecisionLogEntry {
  shift: ShiftNumber;
  eventId: string;
  eventTitle: string;
  choiceId: ChoiceId;
  choiceLabel: string;
  consequenceSummary: string;
  nasaTitle: string;
  nasaFact: string;
  nasaSourceId: string;
}

export type AstronautBadgeId = 'rocket' | 'moon' | 'planet' | 'star';

export type RoomUnlockKey =
  | 'solar'
  | 'eclss'
  | 'shelter'
  | 'greenhouse'
  | 'med_bay'
  | 'warehouse';

export interface GameState {
  // Onboarding & Identity
  astronaut_callsign: string;
  astronaut_badge: AstronautBadgeId;
  tutorial_completed: boolean;

  // 72-Hour Continuous Timeline (0.0 -> 72.0 across 3 Sols & 9 Shifts of 8h)
  mission_hours: number;
  shift: ShiftNumber;
  outcome: MissionOutcome;

  // Approved State Variable Registry
  battery: number; // Power reserve, capacity 20
  solar_supply: number;
  life_demand: number;
  green_demand: number;
  water: number;
  recovery_condition: RecoveryCondition;
  filter_condition: FilterCondition;
  air_quality_score: number; // 0-100 domain
  plant_health: number; // 0-100 domain
  radiation_risk: RadiationRisk;
  shelter_state: ShelterState;

  // Real-Time NASA ECLSS Telemetry
  eclss: EclssTelemetry;

  // 4-Step Quest State Machine
  quest_step: QuestStepPhase;
  quest_knowledge_read: boolean;
  quest_exec_deadline_ms: number | null;
  quest_failed_parts_needed: boolean;
  quest_salvage_target_item: SupplyItemId | null;

  // Radar Fog-of-War & 3 Outer Sectors + Achievements
  eva_radar_level: 1 | 2 | 3;
  unlocked_sectors: EvaSectorId[];
  unlocked_rooms: RoomUnlockKey[];
  unlocked_achievements: AchievementId[];
  recent_achievement: AchievementId | null;

  // Derived / Gameplay Visual Flags
  battery_capacity: number; // C = 20
  solar_panels_dusty: boolean;
  greenhouse_lights_dimmed: boolean;
  greenhouse_water_paused: boolean;
  radiation_units: number;
  spe_active: boolean;
  dust_storm_active: boolean;
  thermal_drop_active: boolean;
  co2_haze_active: boolean;
  shift_mission_accepted: boolean;
  handover_to_shift: ShiftNumber | null;
  failure_reason: string | null;
  stress_reasons: string[];
  phase: GamePhase;
  current_zone: OutpostZoneId;
  decisions: DecisionLogEntry[];
  last_consequence: ConsequenceData | null;
  pending_science_card: ScienceCardData | null;

  // EVA Rover Supplies, Repair, Botany Crops & Space Medicine
  inventory: SupplyInventory;
  repaired_shifts: number[];
  malfunction_until: number;
  rover_runs_completed: number;
  eva_rover_unlocked: boolean;
  med_bay_tutorial_seen: boolean;
  trolley_attached: boolean;
  rover_cooldown_until: number;
  rover_runs_since_maintenance: number;
  rover_needs_maintenance: boolean;
  crew_health: number; // 0-100
  active_ailments: SpaceAilmentId[];
  cured_ailments: SpaceAilmentId[];
  ared_exercised_shifts: number[];
  airlock_hepa_cleaned: boolean;
  crops: Record<CropId, CropState>;
}

export interface ShiftOption {
  id: ChoiceId;
  label: string;
  preview: string;
  badgeColor: 'blue' | 'green' | 'amber' | 'red';
}

export interface EvidencePill {
  icon: string;
  label: string;
  value: string;
  status: 'normal' | 'warning' | 'critical' | 'info';
}

export interface ShiftScript {
  shift: ShiftNumber;
  eventId: string;
  hoursLabel: string;
  zone: OutpostZoneId;
  title: string;
  alertBadge: string;
  alertStatus: 'warning' | 'critical' | 'info';
  question: string;
  lines: string[];
  evidence: EvidencePill[];
  options: [ShiftOption, ShiftOption];
  nasaHintTag: string;
}

export interface ConsequenceData {
  shift: ShiftNumber;
  eventId: string;
  title: string;
  choiceId: ChoiceId;
  choiceLabel: string;
  lines: string[];
  deltas: {
    icon: string;
    label: string;
    change: string;
    tone: 'normal' | 'warning' | 'critical' | 'info';
  }[];
  visualCue: string;
  delayedWarning?: string;
}

export interface ScienceCardData {
  title: string;
  lines: string[];
  nasaReference: string;
}
