import {
  awardAchievement,
  checkAndAwardEndgameAchievement,
  EVA_SECTORS_META,
  QUEST_DEFINITIONS,
  SHIFT_TIMELINE_META,
} from './questAndAchievements';
import {
  ChoiceId,
  ConsequenceData,
  CropId,
  CropState,
  DecisionLogEntry,
  EnergyAllocationResult,
  EvaSectorId,
  GameState,
  Language,
  MissionOutcome,
  RepairProcedureDef,
  RoomUnlockKey,
  ScienceCardData,
  ShiftNumber,
  ShiftScript,
  SpaceAilmentId,
  SupplyInventory,
  SupplyItemId,
} from './types';

export function computeUnlockedRooms(state: {
  shift: ShiftNumber;
  decisions: DecisionLogEntry[];
  eva_rover_unlocked: boolean;
  quest_step: GameState['quest_step'];
  repaired_shifts: number[];
}): RoomUnlockKey[] {
  const rooms: RoomUnlockKey[] = ['solar'];
  const completedCount = state.decisions.length;
  const hasShift = (n: number) =>
    state.decisions.some((d) => d.shift === n) || state.shift > n;

  if (completedCount >= 1 || hasShift(1)) {
    rooms.push('eclss');
  }
  if (completedCount >= 2 || hasShift(2)) {
    rooms.push('shelter');
  }
  if (completedCount >= 3 || hasShift(3)) {
    rooms.push('greenhouse', 'med_bay');
  }
  if (
    state.eva_rover_unlocked ||
    state.quest_step === 'executing' ||
    state.quest_step === 'salvage_subquest' ||
    state.repaired_shifts.length > 0
  ) {
    rooms.push('warehouse');
  }
  return rooms;
}

export function getUnlockedRoomFlags(
  state: Pick<
    GameState,
    | 'unlocked_rooms'
    | 'shift'
    | 'decisions'
    | 'eva_rover_unlocked'
    | 'quest_step'
    | 'repaired_shifts'
  >,
): Record<RoomUnlockKey, boolean> {
  const list =
    Array.isArray(state.unlocked_rooms) && state.unlocked_rooms.length > 0
      ? state.unlocked_rooms
      : computeUnlockedRooms(state);
  return {
    solar: list.includes('solar'),
    eclss: list.includes('eclss'),
    shelter: list.includes('shelter'),
    greenhouse: list.includes('greenhouse'),
    med_bay: list.includes('med_bay'),
    warehouse: list.includes('warehouse'),
  };
}

export function clamp(val: number, min: number, max: number): number {
  if (!Number.isFinite(val)) return min;
  return Math.max(min, Math.min(max, val));
}

export function computeEnergyAllocation(params: {
  G: number;
  B: number;
  C: number;
  L: number;
  H: number;
  priority: 'life-first' | 'greenhouse-first';
}): EnergyAllocationResult {
  const G = Math.max(0, params.G);
  const B = Math.max(0, params.B);
  const C = Math.max(0, params.C);
  const L = Math.max(0, params.L);
  const H = Math.max(0, params.H);

  const S = G + B;
  let aL = 0;
  let aH = 0;

  if (S < L && S < H) {
    aL = S;
    aH = 0;
  } else if (params.priority === 'life-first') {
    aL = Math.min(L, S);
    aH = Math.min(H, Math.max(0, S - aL));
  } else {
    aH = Math.min(H, S);
    aL = Math.min(L, Math.max(0, S - aH));
  }

  const P = aL + aH;
  const D = Math.max(0, P - G);
  const U = Math.max(0, G - P);
  const Q = Math.min(U, Math.max(0, C - B));
  const X = Math.max(0, U - Q);
  const B_next = clamp(B - D + Q, 0, C);

  return {
    S,
    aL,
    aH,
    P,
    D,
    U,
    Q,
    X,
    B_next,
    life_shortfall: Math.max(0, L - aL),
    greenhouse_shortfall: Math.max(0, H - aH),
  };
}

export const REPAIR_PROCEDURES: Record<1 | 2 | 3 | 4 | 5 | 6 | 7 | 8, RepairProcedureDef> = {
  1: {
    shift: 1,
    requiredPart: 'solar_cell',
    titleVi: 'Quy trình 3 bước: Lắp Tấm Pin Phụ Solar Ridge',
    titleEn: '3-Step Procedure: Aux Solar Cell Installation',
    steps: [
      {
        id: 's1_step1',
        orderIndex: 1,
        labelVi: 'Ngắt cầu dao pin phụ để tránh đoản mạch',
        labelEn: 'Isolate auxiliary power bus to prevent arc fault',
        wrongHintVi: 'Sai quy trình! Chưa ngắt cầu dao điện mà lắp pin gây chập mạch làm hỏng tấm pin!',
        wrongHintEn: 'Unsafe sequence! Installing solar cells on a live bus shorted and destroyed the part!',
      },
      {
        id: 's1_step2',
        orderIndex: 2,
        labelVi: 'Lắp Tấm pin phụ (Aux Cell) thu hồi từ khoang EVA',
        labelEn: 'Mount salvaged Aux Solar Cell into array rack',
        wrongHintVi: 'Sai quy trình! Phải ngắt cầu dao trước rồi mới gắn tấm pin mới!',
        wrongHintEn: 'Wrong order! Isolate the bus before mounting the Aux Solar Cell!',
      },
      {
        id: 's1_step3',
        orderIndex: 3,
        labelVi: 'Bật lại cầu dao & kiểm tra cân bằng tải BVAD',
        labelEn: 'Re-enable power bus & balance BVAD load',
        wrongHintVi: 'Bật cầu dao khi chưa gắn xong tấm pin làm sụt áp và cháy cầu chì!',
        wrongHintEn: 'Closing the breaker before mounting the cell blew the fuse!',
      },
    ],
  },
  2: {
    shift: 2,
    requiredPart: 'water_filter',
    titleVi: 'Quy trình 3 bước: Bảo Trì Máy Điện Phân Oxy OGS',
    titleEn: '3-Step Procedure: OGS Oxygen Electrolysis Filter Swap',
    steps: [
      {
        id: 's2_step1',
        orderIndex: 1,
        labelVi: 'Khóa van giảm áp đường nước cấp vào buồng OGS',
        labelEn: 'Close & depressurize OGS feed water loop valve',
        wrongHintVi: 'Áp suất cao làm vỡ lõi lọc! Phải khóa van giảm áp trước.',
        wrongHintEn: 'High feed pressure ruptured the housing! Close and depressurize first.',
      },
      {
        id: 's2_step2',
        orderIndex: 2,
        labelVi: 'Thay Lõi lọc nước sạch để bảo vệ màng điện phân',
        labelEn: 'Insert clean Water Filter cartridge for OGS stack',
        wrongHintVi: 'Cần khóa van giảm áp trước rồi mới tháo lắp lõi lọc!',
        wrongHintEn: 'Depressurize the housing before swapping the water filter cartridge!',
      },
      {
        id: 's2_step3',
        orderIndex: 3,
        labelVi: 'Khởi động bơm & kiểm tra O₂ đạt chuẩn 21.3 kPa',
        labelEn: 'Restart pump & verify O₂ reaches 21.3 kPa',
        wrongHintVi: 'Chưa lắp lõi sạch mà bật bơm làm hỏng màng điện phân!',
        wrongHintEn: 'Starting the pump before installing the clean filter fouled OGS!',
      },
    ],
  },
  3: {
    shift: 3,
    requiredPart: 'rad_shield',
    titleVi: 'Quy trình 3 bước: Cách Nhiệt Đêm Cực Lạnh -170°C',
    titleEn: '3-Step Procedure: Polar Night -170°C Thermal Shielding',
    steps: [
      {
        id: 's3_step1',
        orderIndex: 1,
        labelVi: 'Đóng chặt gioăng áp suất cửa hầm giữ nhiệt',
        labelEn: 'Seal outer bulkhead thermal gasket tightly',
        wrongHintVi: 'Không khí lạnh lọt vào làm nứt tấm chắn! Hãy khóa kín gioăng trước.',
        wrongHintEn: 'Freeze shock cracked the plate! Lock the thermal gasket first.',
      },
      {
        id: 's3_step2',
        orderIndex: 2,
        labelVi: 'Ốp Tấm chắn nhiệt & túi nước lên vách khoang ở',
        labelEn: 'Mount Thermal/Rad Shield Plate along water-wall',
        wrongHintVi: 'Hãy đóng gioăng áp suất trước rồi mới cố định tấm chắn!',
        wrongHintEn: 'Seal the pressure gasket before mounting the barrier plate!',
      },
      {
        id: 's3_step3',
        orderIndex: 3,
        labelVi: 'Kích hoạt sưởi ổn định thân nhiệt 37.0°C',
        labelEn: 'Activate thermal bus & hold crew temp at 37.0°C',
        wrongHintVi: 'Bật sưởi trước khi ốp cách nhiệt làm thất thoát nhiệt và cháy rơ-le!',
        wrongHintEn: 'Powering heaters before insulating tripped the thermal relay!',
      },
    ],
  },
  4: {
    shift: 4,
    requiredPart: 'water_filter',
    titleVi: 'Quy trình 3 bước: Phục Hồi Vòng Tái Chế Nước WRS 98%',
    titleEn: '3-Step Procedure: 98% WRS Water Loop Recovery',
    steps: [
      {
        id: 's4_step1',
        orderIndex: 1,
        labelVi: 'Ngắt bơm tuần hoàn WRS để xả áp an toàn',
        labelEn: 'Power down & depressurize WRS circulation loop',
        wrongHintVi: 'Áp suất ngược làm bung ống lọc! Cần ngắt bơm xả áp trước.',
        wrongHintEn: 'Backpressure blew the cartridge! Depressurize the loop first.',
      },
      {
        id: 's4_step2',
        orderIndex: 2,
        labelVi: 'Thay Lõi lọc WRS mới đạt chuẩn uống 2.5–3.0 L/ngày',
        labelEn: 'Lock fresh WRS Filter for 2.5–3.0 L/day hydration',
        wrongHintVi: 'Phải xả áp đường ống trước khi tháo thay lõi lọc WRS!',
        wrongHintEn: 'Depressurize the loop before inserting the new WRS filter!',
      },
      {
        id: 's4_step3',
        orderIndex: 3,
        labelVi: 'Mở bơm & kiểm tra độ tinh khiết nước tái chế',
        labelEn: 'Restart pump & confirm 98% water purity',
        wrongHintVi: 'Chưa lắp lõi lọc mới mà bật bơm khiến nước đục tràn bồn!',
        wrongHintEn: 'Restarting without the fresh filter contaminated the clean tank!',
      },
    ],
  },
  5: {
    shift: 5,
    requiredPart: 'hepa_filter',
    titleVi: 'Quy trình 3 bước: Chặn Bão Bụi Regolith & Thay HEPA',
    titleEn: '3-Step Procedure: Regolith Storm & HEPA Replacement',
    steps: [
      {
        id: 's5_step1',
        orderIndex: 1,
        labelVi: 'Khóa kín cửa Airlock ngoài chặn bụi tĩnh điện',
        labelEn: 'Seal outer Airlock hatch against static dust',
        wrongHintVi: 'Cửa Airlock vẫn hở khiến bão bụi xé rách màng lọc HEPA mới!',
        wrongHintEn: 'Open Airlock let storm dust shred the HEPA filter!',
      },
      {
        id: 's5_step2',
        orderIndex: 2,
        labelVi: 'Lắp Bộ lọc bụi HEPA 99.97% vào họng hút gió',
        labelEn: 'Mount 99.97% HEPA Regolith Filter into intake',
        wrongHintVi: 'Hãy khóa cửa Airlock ngoài trước khi lắp màng lọc HEPA!',
        wrongHintEn: 'Seal the outer Airlock before mounting the HEPA filter!',
      },
      {
        id: 's5_step3',
        orderIndex: 3,
        labelVi: 'Bật quạt tuần hoàn lọc sạch bụi mịn (<0.3 µm)',
        labelEn: 'Engage cabin air scrubbers to clear <0.3 µm dust',
        wrongHintVi: 'Chưa gắn lọc HEPA mà bật quạt làm bụi regolith thổi khắp trạm!',
        wrongHintEn: 'Running fans without HEPA blew sharp regolith across the cabin!',
      },
    ],
  },
  6: {
    shift: 6,
    requiredPart: 'hardy_seeds',
    titleVi: 'Quy trình 3 bước: Phục Hồi Veggie & Tảo Spirulina',
    titleEn: '3-Step Procedure: Veggie & Spirulina Algae Recovery',
    steps: [
      {
        id: 's6_step1',
        orderIndex: 1,
        labelVi: 'Chỉnh phổ đèn LED Đỏ–Xanh lam / Toàn phần cho tảo',
        labelEn: 'Calibrate Red–Blue & Full-Bright photosynthesis LEDs',
        wrongHintVi: 'Thiếu chuẩn quang phổ LED khiến hạt giống & tảo không nảy mầm!',
        wrongHintEn: 'Wrong light spectrum ruined seed activation! Set LEDs first.',
      },
      {
        id: 's6_step2',
        orderIndex: 2,
        labelVi: 'Cấy Hạt giống chịu bức xạ & nuôi Tảo Spirulina',
        labelEn: 'Plant Hardy Space Seeds & inoculate Spirulina',
        wrongHintVi: 'Hãy bật đúng phổ đèn LED trước khi cấy hạt giống mới!',
        wrongHintEn: 'Calibrate LED spectrum before planting hardy space seeds!',
      },
      {
        id: 's6_step3',
        orderIndex: 3,
        labelVi: 'Bật sương dinh dưỡng tăng sản lượng Calo & O₂',
        labelEn: 'Start nutrient mist for kcal nutrition & O₂ output',
        wrongHintVi: 'Bật phun sương trước khi gieo hạt làm ngập úng khay giống!',
        wrongHintEn: 'Starting mist before seeding flooded and spoiled the pillows!',
      },
    ],
  },
  7: {
    shift: 7,
    requiredPart: 'lioh_filter',
    titleVi: 'Quy trình 3 bước: Thay Bộ Lọc Khí CO₂ LiOH',
    titleEn: '3-Step Procedure: LiOH CO₂ Scrubber Swap',
    steps: [
      {
        id: 's7_step1',
        orderIndex: 1,
        labelVi: 'Tắt quạt hút tuần hoàn CDRA đang quá tải',
        labelEn: 'Power down saturated CDRA circulation blower',
        wrongHintVi: 'Quạt đang hút mạnh làm bụi LiOH bắn ra và hỏng hộp lọc!',
        wrongHintEn: 'Live blower damaged the LiOH seal! Power down fan first.',
      },
      {
        id: 's7_step2',
        orderIndex: 2,
        labelVi: 'Lắp Bộ lọc CO₂ LiOH mới vào đúng rãnh khóa',
        labelEn: 'Lock fresh LiOH CO₂ Canister into scrubber slot',
        wrongHintVi: 'Hãy tắt quạt hút CDRA trước khi lắp hộp lọc LiOH mới!',
        wrongHintEn: 'Power down the circulation fan before inserting LiOH!',
      },
      {
        id: 's7_step3',
        orderIndex: 3,
        labelVi: 'Khởi động lại luồng khí & hạ CO₂ < 5.3 mmHg',
        labelEn: 'Restart air loop & drop CO₂ below 5.3 mmHg',
        wrongHintVi: 'Chưa lắp hộp LiOH mới mà bật quạt chỉ thổi CO₂ quay vòng!',
        wrongHintEn: 'Restarting without a fresh LiOH canister recirculates CO₂!',
      },
    ],
  },
  8: {
    shift: 8,
    requiredPart: 'ki_pills',
    titleVi: 'Quy trình 3 bước: Phòng Chống Bão Bức Xạ Cực Đại',
    titleEn: '3-Step Procedure: Solar Radiation Storm Defense',
    steps: [
      {
        id: 's8_step1',
        orderIndex: 1,
        labelVi: 'Đóng sập cửa hầm trú ẩn Shelter ốp túi nước',
        labelEn: 'Seal water-walled Radiation Shelter blast door',
        wrongHintVi: 'Phải khóa kín cửa hầm Shelter trước khi cấp phát liều chống xạ!',
        wrongHintEn: 'Seal the Radiation Shelter blast door before distributing meds!',
      },
      {
        id: 's8_step2',
        orderIndex: 2,
        labelVi: 'Cấp phát Viên Potassium Iodide (KI) cho phi hành đoàn',
        labelEn: 'Distribute Potassium Iodide (KI) tablets to crew',
        wrongHintVi: 'Đóng cửa hầm trú ẩn xong rồi mới phát thuốc KI bảo vệ tế bào!',
        wrongHintEn: 'Lock the shelter door first, then distribute Potassium Iodide!',
      },
      {
        id: 's8_step3',
        orderIndex: 3,
        labelVi: 'Bật cảm biến LRO CRaTER kiểm tra liều mSv an toàn',
        labelEn: 'Monitor CRaTER dosimeter to keep mSv controlled',
        wrongHintVi: 'Chỉ kiểm tra cảm biến CRaTER sau khi đóng hầm & uống KI!',
        wrongHintEn: 'Verify the CRaTER dosimeter only after sealing & taking KI!',
      },
    ],
  },
};

export function getRepairProcedureForShift(shift: ShiftNumber): RepairProcedureDef | null {
  if (shift === 9) return null;
  return REPAIR_PROCEDURES[shift];
}

export function createInitialState(): GameState {
  const crops: Record<CropId, CropState> = {
    lettuce: { id: 'lettuce', growth: 62, watered: true, ledMode: 'red_blue', pollinated: true },
    tomato: { id: 'tomato', growth: 55, watered: true, ledMode: 'red_blue', pollinated: false },
    wheat: { id: 'wheat', growth: 68, watered: true, ledMode: 'full_bright', pollinated: true },
    spirulina: { id: 'spirulina', growth: 64, watered: true, ledMode: 'full_bright', pollinated: true },
  };

  return {
    astronaut_callsign: '',
    astronaut_badge: 'rocket',
    tutorial_completed: false,

    mission_hours: 0,
    shift: 1,
    outcome: 'active',

    battery: 5,
    battery_capacity: 20,
    solar_supply: 6,
    life_demand: 6,
    green_demand: 6,
    water: 9,
    recovery_condition: 'normal',
    filter_condition: 'normal',
    air_quality_score: 92,
    plant_health: 82,
    radiation_risk: 'unassessed',
    shelter_state: 'not-sheltered',

    eclss: {
      o2_kpa: 21.3,
      o2_consume_kg_hr: 0.035,
      water_l_day: 2.8,
      calories_kcal: 2780,
      radiation_msv: 0.5,
      body_temp_c: 37.0,
    },

    quest_step: 'briefing',
    quest_knowledge_read: false,
    quest_exec_deadline_ms: null,
    quest_failed_parts_needed: false,
    quest_salvage_target_item: null,

    eva_radar_level: 1,
    unlocked_sectors: [],
    unlocked_rooms: ['solar'],
    unlocked_achievements: [],
    recent_achievement: null,

    solar_panels_dusty: true,
    greenhouse_lights_dimmed: false,
    greenhouse_water_paused: false,
    radiation_units: 2,
    spe_active: false,
    dust_storm_active: false,
    thermal_drop_active: false,
    co2_haze_active: false,
    shift_mission_accepted: false,
    handover_to_shift: null,
    failure_reason: null,
    stress_reasons: [],
    phase: 'title',
    current_zone: 'control',
    decisions: [],
    last_consequence: null,
    pending_science_card: null,

    inventory: {
      solar_cell: 1,
      water_filter: 1,
      rad_shield: 1,
      hardy_seeds: 1,
      lioh_filter: 1,
      med_kit: 1,
      scrap_metal: 2,
      electronic_parts: 1,
      hepa_filter: 1,
      ki_pills: 1,
      spirulina_ration: 1,
    },
    repaired_shifts: [],
    malfunction_until: 0,
    rover_runs_completed: 0,
    eva_rover_unlocked: false,
    med_bay_tutorial_seen: false,
    trolley_attached: false,
    rover_cooldown_until: 0,
    rover_runs_since_maintenance: 0,
    rover_needs_maintenance: false,
    crew_health: 100,
    active_ailments: [],
    cured_ailments: [],
    ared_exercised_shifts: [],
    airlock_hepa_cleaned: false,
    crops,
  };
}

export function evaluateTerminalOutcome(
  state: GameState,
  lang: Language = 'vi',
): {
  outcome: MissionOutcome;
  failureReason: string | null;
  stressReasons: string[];
} {
  const en = lang === 'en';
  if (state.water <= 0 || state.eclss.water_l_day <= 0.4) {
    return {
      outcome: 'failure',
      failureReason: en
        ? 'Aurora Station ran completely out of water reserves before Starship HLS arrived.'
        : 'Trạm đã cạn sạch nước dự trữ trước khi tàu SpaceX Starship HLS kịp hạ cánh.',
      stressReasons: [],
    };
  }
  if (state.air_quality_score < 28 || state.eclss.o2_kpa < 16.0) {
    return {
      outcome: 'failure',
      failureReason: en
        ? 'Cabin O₂ partial pressure dropped critically low / CO₂ became unsafe.'
        : 'Áp suất O₂ tụt ngưỡng nguy hiểm hoặc CO₂ quá cao. Trạm mất an toàn sự sống.',
      stressReasons: [],
    };
  }
  if (state.solar_supply + state.battery <= 0 && state.life_demand > 0) {
    return {
      outcome: 'failure',
      failureReason: en
        ? 'Total power blackout while Life Support needed energy.'
        : 'Mất điện hoàn toàn khi Hệ thống Sống đang cần năng lượng.',
      stressReasons: [],
    };
  }
  if (state.crew_health <= 18 || state.eclss.body_temp_c <= 34.0) {
    return {
      outcome: 'failure',
      failureReason: en
        ? 'Crew health collapsed from untreated space hazards or hypothermia.'
        : 'Sức khỏe phi hành đoàn suy kiệt nặng do bệnh lý vũ trụ hoặc hạ thân nhiệt.',
      stressReasons: [],
    };
  }

  if (state.shift < 9 && state.decisions.length < 9) {
    return { outcome: 'active', failureReason: null, stressReasons: [] };
  }

  const stressReasons: string[] = [];
  if (state.radiation_risk === 'at-risk' || state.eclss.radiation_msv > 80) {
    stressReasons.push(
      en
        ? `Cumulative radiation reached ${state.eclss.radiation_msv.toFixed(1)} mSv (At-Risk).`
        : `Liều bức xạ tích lũy đạt ${state.eclss.radiation_msv.toFixed(1)} mSv (At-Risk).`,
    );
  }
  if (state.plant_health < 35) {
    stressReasons.push(
      en
        ? 'Botany & Spirulina output fell critically low (< 35).'
        : 'Vườn cây & Tảo Spirulina suy kiệt (< 35 điểm).',
    );
  }
  if (state.eclss.calories_kcal < 2200) {
    stressReasons.push(
      en
        ? `Crew caloric nutrition ended low (${Math.round(state.eclss.calories_kcal)} kcal/day).`
        : `Năng lượng dinh dưỡng xuống thấp (${Math.round(state.eclss.calories_kcal)} kcal/ngày).`,
    );
  }
  if (state.water < 3) {
    stressReasons.push(
      en
        ? 'Water reserve dropped dangerously low (< 3 units).'
        : 'Nước dự trữ xuống quá thấp (< 3 bình).',
    );
  }
  if (state.battery < 2) {
    stressReasons.push(
      en
        ? 'Battery reserve dropped critically low (< 2 units).'
        : 'Pin dự trữ cạn kiệt (< 2 phần điện).',
    );
  }
  if (state.air_quality_score < 60 || state.eclss.o2_kpa < 19.5) {
    stressReasons.push(
      en
        ? `Cabin atmosphere ended stressed (Air ${state.air_quality_score}/100, O₂ ${state.eclss.o2_kpa.toFixed(1)} kPa).`
        : `Chất lượng khí & O₂ ở mức báo động (${state.air_quality_score}/100, ${state.eclss.o2_kpa.toFixed(1)} kPa).`,
    );
  }
  if (state.crew_health < 70 || state.active_ailments.length > 0) {
    stressReasons.push(
      en
        ? `Crew health ended at ${state.crew_health}/100 with ${state.active_ailments.length} untreated condition(s).`
        : `Sức khỏe phi hành đoàn còn ${state.crew_health}/100 (${state.active_ailments.length} bệnh lý chưa chữa dứt).`,
    );
  }

  if (stressReasons.length > 0) {
    return {
      outcome: 'stress',
      failureReason: null,
      stressReasons,
    };
  }

  return {
    outcome: 'stable',
    failureReason: null,
    stressReasons: [],
  };
}

/**
 * Continuous 72-Hour Timeline & Real-Time NASA ECLSS Tick
 * Runs smoothly during active gameplay (`phase === 'playing'`) when no modal/pause is open.
 */
export function tickEclssAndTimeline(
  prevState: GameState,
  dtSeconds: number,
  lang: Language = 'vi',
): GameState {
  if (prevState.phase !== 'playing' || !prevState.tutorial_completed) {
    return prevState;
  }

  // Advance mission hours continuously (~0.16 game hours per real second), capped slightly before shift boundary
  // so player gets live clock ticking within each 8-hour shift until completing the shift's mission
  const meta = SHIFT_TIMELINE_META[prevState.shift];
  const shiftCapHour = meta.endHour - 0.08;
  const hourDelta = dtSeconds * 0.16;
  const nextHours = Math.min(shiftCapHour, Math.max(meta.startHour, prevState.mission_hours + hourDelta));

  const nextEclss = { ...prevState.eclss };

  // O2 partial pressure drift (kPa, target 21.3 kPa, consumes 0.035 kg/hr)
  const wheatBonus = (prevState.crops.wheat.growth + prevState.crops.spirulina.growth) / 200;
  const o2DriftPerSec =
    (prevState.co2_haze_active ? -0.025 : -0.008) +
    wheatBonus * 0.012 +
    (prevState.recovery_condition === 'degraded' ? -0.007 : 0);
  nextEclss.o2_kpa = clamp(nextEclss.o2_kpa + o2DriftPerSec * dtSeconds, 15.2, 22.8);

  // Water L/day slight drift
  const waterRate = prevState.recovery_condition === 'degraded' ? -0.022 : -0.004;
  nextEclss.water_l_day = clamp(nextEclss.water_l_day + waterRate * dtSeconds, 0.3, 3.4);

  // Energy calories burn slowly over time
  nextEclss.calories_kcal = clamp(nextEclss.calories_kcal - 1.8 * dtSeconds, 1200, 3200);

  // Radiation mSv accumulation (higher during Solar Storm Shift 8 if unsheltered)
  const radPerSec = prevState.spe_active && prevState.shelter_state !== 'sheltered' ? 0.18 : 0.003;
  nextEclss.radiation_msv = Math.round((nextEclss.radiation_msv + radPerSec * dtSeconds) * 100) / 100;

  // Body temperature responds to Polar Night Thermal Drop (Shifts 3 & 6)
  const isColdShift = prevState.thermal_drop_active || prevState.shift === 3 || prevState.shift === 6;
  const targetTemp = isColdShift && prevState.battery <= 1 ? 35.6 : isColdShift ? 36.6 : 37.0;
  nextEclss.body_temp_c =
    nextEclss.body_temp_c + (targetTemp - nextEclss.body_temp_c) * Math.min(1, dtSeconds * 0.08);

  // Passive crew health warning if O2, calories, or active ailments are severe
  let nextHealth = prevState.crew_health;
  if (nextEclss.o2_kpa < 18.5 || nextEclss.calories_kcal < 1700) {
    nextHealth = clamp(nextHealth - 0.18 * dtSeconds, 15, 100);
  }

  const nextState: GameState = {
    ...prevState,
    mission_hours: nextHours,
    eclss: nextEclss,
    crew_health: Math.round(nextHealth * 10) / 10,
  };

  return nextState;
}

// =====================================================
// 4-STEP QUEST STATE MACHINE REDUCERS
// =====================================================
export function markQuestKnowledgeRead(prevState: GameState): GameState {
  return {
    ...prevState,
    quest_knowledge_read: true,
    quest_step: 'knowledge',
  };
}

export function acceptQuestExecution(prevState: GameState): GameState {
  const def = QUEST_DEFINITIONS[prevState.shift];
  const nextBase = {
    ...prevState,
    eva_rover_unlocked: true,
    quest_knowledge_read: true,
    quest_step: 'executing' as const,
    quest_exec_deadline_ms: Date.now() + def.execDurationSec * 1000,
    quest_failed_parts_needed: false,
    quest_salvage_target_item: null,
  };
  return {
    ...nextBase,
    unlocked_rooms: computeUnlockedRooms(nextBase),
  };
}

export function failQuestStepTriggerSalvage(
  prevState: GameState,
  neededPart?: SupplyItemId | null,
): GameState {
  const def = QUEST_DEFINITIONS[prevState.shift];
  const partToFind = neededPart ?? def.requiredPart ?? 'scrap_metal';
  const nextInv = { ...prevState.inventory };
  // Component destroyed upon wrong procedure or timeout!
  if ((nextInv[partToFind] ?? 0) > 0) {
    nextInv[partToFind] = Math.max(0, nextInv[partToFind] - 1);
  }
  const nextBase = {
    ...prevState,
    eva_rover_unlocked: true,
    inventory: nextInv,
    quest_step: 'salvage_subquest' as const,
    quest_exec_deadline_ms: null,
    quest_failed_parts_needed: true,
    quest_salvage_target_item: partToFind,
    malfunction_until: Date.now() + 5000,
  };
  return {
    ...nextBase,
    unlocked_rooms: computeUnlockedRooms(nextBase),
  };
}

// =====================================================
// 9-SHIFT DECISION SCRIPTS (SOL 1-3, 8H PER SHIFT)
// =====================================================
export function getShiftScript(state: GameState, lang: Language = 'vi'): ShiftScript {
  const en = lang === 'en';
  const meta = SHIFT_TIMELINE_META[state.shift];
  const hoursStr = `${String(meta.startHour).padStart(2, '0')}–${String(meta.endHour).padStart(2, '0')}h`;

  if (en) {
    switch (state.shift) {
      case 1:
        return {
          shift: 1,
          eventId: 'EVT-01',
          hoursLabel: `Shift 1 / 9 · Sol 1 (${hoursStr})`,
          zone: 'solar',
          title: 'SOLAR RIDGE VOLTAGE DROP',
          alertBadge: '⚡ POWER SHORTAGE!',
          alertStatus: 'warning',
          question: 'Which system receives Solar Ridge power first?',
          lines: [
            'Low 3° sunlight and lunar dust shade half of Solar Ridge.',
            `Aurora needs ${state.life_demand + state.green_demand} power. Only ${state.solar_supply + state.battery} units available.`,
            `Life Support needs ${state.life_demand} 🫁. Veggie Garden needs ${state.green_demand} 🌱.`,
          ],
          evidence: [
            { icon: '☀️', label: 'Solar Ridge', value: `${state.solar_supply} u`, status: 'warning' },
            { icon: '🔋', label: 'Battery', value: `${state.battery} u`, status: 'info' },
            { icon: '🫁', label: 'O₂ Pressure', value: `${state.eclss.o2_kpa.toFixed(1)} kPa`, status: 'normal' },
            { icon: '🌱', label: 'Botany', value: `${state.plant_health}/100`, status: 'normal' },
          ],
          options: [
            {
              id: 'A',
              label: '🫁 Life Support first',
              preview: 'Keeps O₂ blowers & heaters at 6/6. Garden dims slightly.',
              badgeColor: 'blue',
            },
            {
              id: 'B',
              label: '🌱 Greenhouse first',
              preview: 'Full grow lights (6/6). Cabin O₂ air drops -10 points.',
              badgeColor: 'green',
            },
          ],
          nasaHintTag: 'BVAD (TP-2021-220419): Life-first priority',
        };
      case 2:
        return {
          shift: 2,
          eventId: 'EVT-02',
          hoursLabel: `Shift 2 / 9 · Sol 1 (${hoursStr})`,
          zone: 'habitat',
          title: 'OGS OXYGEN ELECTROLYSIS DROP',
          alertBadge: '🫁 OGS PRESSURE LOW!',
          alertStatus: 'warning',
          question: 'Purge and swap the OGS water feed filter now?',
          lines: [
            'The Oxygen Generation System (OGS) splits H₂O into breathable O₂.',
            'Mineral dust fouled the feed filter, threatening 21.3 kPa O₂.',
            'Flushing OGS takes 1 water unit now or risks hypoxia later.',
          ],
          evidence: [
            { icon: '🫁', label: 'O₂ Partial', value: `${state.eclss.o2_kpa.toFixed(1)} kPa`, status: 'warning' },
            { icon: '💧', label: 'Water Tank', value: `${state.water} u`, status: 'normal' },
            { icon: '⚙️', label: 'OGS Burn', value: '0.035 kg/hr', status: 'info' },
          ],
          options: [
            {
              id: 'A',
              label: '🔧 Flush & restore OGS',
              preview: 'Costs 1 water. Boosts O₂ to 21.3 kPa & cleans loop.',
              badgeColor: 'blue',
            },
            {
              id: 'B',
              label: '⏳ Keep running dirty',
              preview: 'Saves water now, but O₂ drops to 19.6 kPa & air -12.',
              badgeColor: 'amber',
            },
          ],
          nasaHintTag: 'ECLSS OGS: 2H₂O → 2H₂ + O₂ (21.3 kPa)',
        };
      case 3:
        return {
          shift: 3,
          eventId: 'EVT-03',
          hoursLabel: `Shift 3 / 9 · Sol 1 (${hoursStr})`,
          zone: 'habitat',
          title: 'FIRST POLAR NIGHT (-170°C)',
          alertBadge: '❄️ THERMAL DROP!',
          alertStatus: 'critical',
          question: 'Seal thermal bulkheads & heat crew or power exterior floodlights?',
          lines: [
            'Crater rim shadow just blocked sunlight for 8 freezing hours.',
            'Outside temperature fell to -170°C. Crew body temp must stay 37.0°C!',
            'Full interior thermal heating uses 2 battery units.',
          ],
          evidence: [
            { icon: '🌡️', label: 'Body Temp', value: `${state.eclss.body_temp_c.toFixed(1)}°C`, status: 'warning' },
            { icon: '🔋', label: 'Battery', value: `${state.battery} u`, status: 'info' },
            { icon: '❄️', label: 'Outside Hull', value: '-170°C', status: 'critical' },
          ],
          options: [
            {
              id: 'A',
              label: '🔥 Full Cabin Heating & Insulation',
              preview: 'Costs 2 battery. Holds body temp at 37.0°C safely.',
              badgeColor: 'blue',
            },
            {
              id: 'B',
              label: '🔋 Conserve Battery',
              preview: 'Saves power, but crew temp drops (-1.1°C) & health -10.',
              badgeColor: 'red',
            },
          ],
          nasaHintTag: 'LOLA Polar Shadow Thermal Management',
        };
      case 4:
        return {
          shift: 4,
          eventId: 'EVT-04',
          hoursLabel: `Shift 4 / 9 · Sol 2 (${hoursStr})`,
          zone: 'habitat',
          title: 'WRS 98% WATER LOOP FOULING',
          alertBadge: '💧 WRS CLOGGED!',
          alertStatus: 'warning',
          question: 'Repair the WRS 98% water loop now or postpone?',
          lines: [
            'Normally WRS recycles 98% of crew water (2.5–3.0 L/day).',
            'Clogged filters cut recovery in half and drain reserve tanks.',
            'Delaying repair leaks -3 water units every single shift!',
          ],
          evidence: [
            { icon: '💧', label: 'Water Tank', value: `${state.water} u`, status: 'warning' },
            { icon: '🚰', label: 'Hydration', value: `${state.eclss.water_l_day.toFixed(1)} L/d`, status: 'warning' },
            { icon: '🌱', label: 'Botany', value: `${state.plant_health}/100`, status: 'normal' },
          ],
          options: [
            {
              id: 'A',
              label: '🔧 Fix WRS Filter now',
              preview: 'Garden pauses water 1 shift (-8), WRS recovers to 98%.',
              badgeColor: 'blue',
            },
            {
              id: 'B',
              label: '⏳ Delay WRS repair',
              preview: 'Plants stay wet now, but water drops -3 each shift!',
              badgeColor: 'amber',
            },
          ],
          nasaHintTag: 'ECLSS ICES-2023-142: 98% Water Recovery Assembly',
        };
      case 5:
        return {
          shift: 5,
          eventId: 'EVT-05',
          hoursLabel: `Shift 5 / 9 · Sol 2 (${hoursStr})`,
          zone: 'solar',
          title: 'ELECTROSTATIC REGOLITH DUST STORM',
          alertBadge: '🌪️ DUST STORM!',
          alertStatus: 'critical',
          question: 'Seal Airlock & replace HEPA 99.97% filter or rush outside?',
          lines: [
            'Charged lunar regolith dust shards are swirling across the crater!',
            'Sharp regolith tears spacesuit seals and causes Regolith Dust Lung.',
            'Sealing Airlock & running HEPA protects lungs; leaves solar dusty.',
          ],
          evidence: [
            { icon: '🌪️', label: 'Dust Index', value: 'HIGH STATIC', status: 'critical' },
            { icon: '🌬️', label: 'HEPA Filters', value: `${state.inventory.hepa_filter} in stock`, status: 'normal' },
            { icon: '🩺', label: 'Crew Health', value: `${Math.round(state.crew_health)}/100`, status: 'normal' },
          ],
          options: [
            {
              id: 'A',
              label: '🌬️ Seal Airlock & Run HEPA Rinse',
              preview: 'Prevents Dust Lung & cleans air (+8). Panels stay dusty.',
              badgeColor: 'blue',
            },
            {
              id: 'B',
              label: '☀️ EVA Sweep Solar Panels in Storm',
              preview: 'Cleans panels (12 power), but triggers Dust Lung (-16 health)!',
              badgeColor: 'red',
            },
          ],
          nasaHintTag: 'Space Medicine SCI-11: HEPA <0.3 µm Filtration',
        };
      case 6:
        return {
          shift: 6,
          eventId: 'EVT-06',
          hoursLabel: `Shift 6 / 9 · Sol 2 (${hoursStr})`,
          zone: 'greenhouse',
          title: 'VEGGIE & SPIRULINA NIGHT RECOVERY',
          alertBadge: '🌱 CALORIE & O₂ DIP!',
          alertStatus: 'warning',
          question: 'Boost LED arrays & Spirulina bioreactors through Night 2?',
          lines: [
            'Crew caloric reserves and Spirulina algae need Red-Blue LED care.',
            'Spirulina + Veggie greens supply 2500–3000 kcal/day and bio-O₂.',
            'Full botany boost uses 2 battery + 1 water unit.',
          ],
          evidence: [
            { icon: '🥗', label: 'Calories', value: `${Math.round(state.eclss.calories_kcal)} kcal`, status: state.eclss.calories_kcal < 2300 ? 'warning' : 'normal' },
            { icon: '🌱', label: 'Plant Health', value: `${state.plant_health}/100`, status: state.plant_health < 65 ? 'warning' : 'normal' },
            { icon: '🔋', label: 'Battery', value: `${state.battery} u`, status: 'info' },
          ],
          options: [
            {
              id: 'A',
              label: '💪 Power Spirulina & Veggie LEDs',
              preview: 'Costs 2 battery + 1 water. Plants +18 & +450 kcal!',
              badgeColor: 'green',
            },
            {
              id: 'B',
              label: '📦 Conserve Power & Water',
              preview: 'Saves reserves. Plants drop -20 & kcal dips.',
              badgeColor: 'amber',
            },
          ],
          nasaHintTag: 'Veggie & CELSS Spirulina Bio-Regeneration',
        };
      case 7:
        return {
          shift: 7,
          eventId: 'EVT-07',
          hoursLabel: `Shift 7 / 9 · Sol 3 (${hoursStr})`,
          zone: 'habitat',
          title: 'CDRA / LiOH CO₂ SCRUBBER SURGE',
          alertBadge: '😮‍💨 HIGH CO₂!',
          alertStatus: 'critical',
          question: 'Swap saturated LiOH canisters now or wait?',
          lines: [
            'Cabin CO₂ climbed past 5.3 mmHg as LiOH beds saturated.',
            'High CO₂ triggers hypercapnia headaches and foggy reflexes.',
            'Replacing the scrubber uses 2 battery + 1 water.',
          ],
          evidence: [
            { icon: '🫁', label: 'Air Score', value: `${state.air_quality_score}/100`, status: state.air_quality_score < 70 ? 'critical' : 'warning' },
            { icon: '🔋', label: 'Battery', value: `${state.battery} u`, status: 'info' },
            { icon: '💧', label: 'Water', value: `${state.water} u`, status: 'normal' },
          ],
          options: [
            {
              id: 'A',
              label: '🔧 Swap LiOH Scrubber now',
              preview: 'Costs 2 battery + 1 water. Air clears > 88 & O₂ steady.',
              badgeColor: 'blue',
            },
            {
              id: 'B',
              label: '⏳ Wait one more shift',
              preview: 'Saves power/water. Air drops -25 & risk Hypercapnia!',
              badgeColor: 'red',
            },
          ],
          nasaHintTag: 'ECLSS CDRA: Cabin CO₂ < 5.3 mmHg limit',
        };
      case 8:
        return {
          shift: 8,
          eventId: 'EVT-08',
          hoursLabel: `Shift 8 / 9 · Sol 3 (${hoursStr})`,
          zone: 'control',
          title: 'SOLAR PARTICLE RADIATION STORM (SPE)',
          alertBadge: '☢️ RED ALERT: SPE!',
          alertStatus: 'critical',
          question: 'Seal Radiation Shelter + issue Potassium Iodide (KI) or work outside?',
          lines: [
            'An X-class solar flare blasted high-energy protons toward the Moon!',
            'Without Earth’s magnetic field, outdoor exposure spikes mSv rapidly.',
            'Entering Shelter with Potassium Iodide protects every crewmate.',
          ],
          evidence: [
            { icon: '☢️', label: 'Cumulative', value: `${state.eclss.radiation_msv.toFixed(1)} mSv`, status: 'critical' },
            { icon: '💊', label: 'KI Tablets', value: `${state.inventory.ki_pills} doses`, status: 'info' },
            { icon: '🏠', label: 'Shelter', value: 'Water-Wall Ready', status: 'normal' },
          ],
          options: [
            {
              id: 'A',
              label: '🏠 Shelter + Take Potassium Iodide',
              preview: 'Crew stays Protected (low mSv). Solar dusty for Shift 9.',
              badgeColor: 'blue',
            },
            {
              id: 'B',
              label: '⚡ Keep Full Outdoor Dish Active',
              preview: 'Max Shift 9 solar (12 u), but radiation spikes +45 mSv!',
              badgeColor: 'red',
            },
          ],
          nasaHintTag: 'DONKI Halloween Storm & HRP Radiation Limits',
        };
      case 9:
      default:
        return {
          shift: 9,
          eventId: 'EVT-09',
          hoursLabel: `Shift 9 / 9 · Sol 3 (${hoursStr})`,
          zone: 'control',
          title: 'SPACEX STARSHIP HLS TOUCHDOWN',
          alertBadge: '🚀 FINAL 8 HOURS!',
          alertStatus: 'info',
          question: 'SpaceX Starship HLS is on final approach! Final reserve plan?',
          lines: [
            'The radiation storm cleared. Starship HLS landing engines ignite!',
            `Reserves: ${state.battery} battery · ${state.water} water · ${state.eclss.o2_kpa.toFixed(1)} kPa O₂.`,
            'Lock Aurora Station’s final allocation for Artemis rendezvous!',
          ],
          evidence: [
            { icon: '🫁', label: 'O₂ Pressure', value: `${state.eclss.o2_kpa.toFixed(1)} kPa`, status: state.eclss.o2_kpa < 19.5 ? 'warning' : 'normal' },
            { icon: '💧', label: 'Hydration', value: `${state.eclss.water_l_day.toFixed(1)} L/d`, status: 'normal' },
            { icon: '🥗', label: 'Calories', value: `${Math.round(state.eclss.calories_kcal)} kcal`, status: 'normal' },
            { icon: '🧭', label: 'EVA Sectors', value: `${state.unlocked_sectors.length}/3`, status: 'info' },
          ],
          options: [
            {
              id: 'A',
              label: '🫁 Lock Life Support & HLS Beacon',
              preview: 'Full O₂ (+10 air, 21.3 kPa) & clean Starship landing beacon.',
              badgeColor: 'blue',
            },
            {
              id: 'B',
              label: '⚖️ Share with Botany & Fresh Rations',
              preview: 'Uses 1 battery + 1 water for +10 plants, +300 kcal & +5 air.',
              badgeColor: 'green',
            },
          ],
          nasaHintTag: 'Artemis Operations & SpaceX Starship HLS Docking Protocol',
        };
    }
  }

  // Vietnamese 9-Shift Scripts
  switch (state.shift) {
    case 1:
      return {
        shift: 1,
        eventId: 'EVT-01',
        hoursLabel: `Ca 1 / 9 · Ngày 1 (${hoursStr})`,
        zone: 'solar',
        title: 'SỤT ÁP PIN SOLAR RIDGE',
        alertBadge: '⚡ ĐIỆN ĐANG THIẾU!',
        alertStatus: 'warning',
        question: 'Bạn chọn hệ thống nào được cấp điện trước?',
        lines: [
          'Nắng Cực Nam góc 3° yếu dần và bụi regolith che một nửa tấm pin.',
          `Trạm cần ${state.life_demand + state.green_demand} phần điện. Hiện có ${state.solar_supply + state.battery} phần.`,
          `Hệ thống Sống cần ${state.life_demand} 🫁. Vườn Cây cần ${state.green_demand} 🌱.`,
        ],
        evidence: [
          { icon: '☀️', label: 'Pin Solar', value: `${state.solar_supply} phần`, status: 'warning' },
          { icon: '🔋', label: 'Pin Dự Trữ', value: `${state.battery} phần`, status: 'info' },
          { icon: '🫁', label: 'Áp suất O₂', value: `${state.eclss.o2_kpa.toFixed(1)} kPa`, status: 'normal' },
          { icon: '🌱', label: 'Vườn Cây', value: `${state.plant_health}/100`, status: 'normal' },
        ],
        options: [
          {
            id: 'A',
            label: '🫁 Hệ thống Sống trước',
            preview: 'Giữ máy bơm O₂ & sưởi 6/6. Đèn vườn cây tối nhẹ.',
            badgeColor: 'blue',
          },
          {
            id: 'B',
            label: '🌱 Vườn Cây trước',
            preview: 'Cây đủ sáng (6/6). Điểm không khí giảm -10.',
            badgeColor: 'green',
          },
        ],
        nasaHintTag: 'BVAD (TP-2021-220419): Ưu tiên sự sống',
      };
    case 2:
      return {
        shift: 2,
        eventId: 'EVT-02',
        hoursLabel: `Ca 2 / 9 · Ngày 1 (${hoursStr})`,
        zone: 'habitat',
        title: 'SỤT ÁP ĐIỆN PHÂN OXY OGS',
        alertBadge: '🫁 OGS GIẢM ÁP!',
        alertStatus: 'warning',
        question: 'Xả rửa & thay lọc cấp nước máy điện phân OGS ngay?',
        lines: [
          'Máy OGS tách H₂O thành khí O₂ duy trì áp suất 21.3 kPa (0.035 kg/giờ).',
          'Bụi mịn làm nghẹt ống cấp nước, khiến sản lượng O₂ suy giảm.',
          'Xả sạch ngay tốn 1 bình nước hoặc rủi ro thiếu oxy ở ca sau.',
        ],
        evidence: [
          { icon: '🫁', label: 'Áp suất O₂', value: `${state.eclss.o2_kpa.toFixed(1)} kPa`, status: 'warning' },
          { icon: '💧', label: 'Nước Dự Trữ', value: `${state.water} bình`, status: 'normal' },
          { icon: '⚙️', label: 'Tiêu thụ O₂', value: '0.035 kg/h', status: 'info' },
        ],
        options: [
          {
            id: 'A',
            label: '🔧 Xả rửa & khôi phục OGS',
            preview: 'Tốn 1 bình nước. Đưa O₂ về chuẩn 21.3 kPa an toàn.',
            badgeColor: 'blue',
          },
          {
            id: 'B',
            label: '⏳ Tiếp tục chạy tạm',
            preview: 'Giữ nước ngay lúc này, nhưng O₂ tụt còn 19.6 kPa & khí -12.',
            badgeColor: 'amber',
          },
        ],
        nasaHintTag: 'ECLSS OGS: 2H₂O → 2H₂ + O₂ (21.3 kPa)',
      };
    case 3:
      return {
        shift: 3,
        eventId: 'EVT-03',
        hoursLabel: `Ca 3 / 9 · Ngày 1 (${hoursStr})`,
        zone: 'habitat',
        title: 'ĐÊM CỰC NAM ĐẦU TIÊN (-170°C)',
        alertBadge: '❄️ SỤT NHIỆT -170°C!',
        alertStatus: 'critical',
        question: 'Bật sưởi ấm toàn phần giữ 37.0°C hay tiết kiệm pin?',
        lines: [
          'Bóng hố thiên thạch che khuất Mặt Trời suốt 8 giờ đêm lạnh -170°C.',
          'Thân nhiệt phi hành đoàn phải giữ ổn định ở 37.0°C.',
          'Bật hệ thống sưởi đa lớp tiêu tốn 2 phần điện pin dự trữ.',
        ],
        evidence: [
          { icon: '🌡️', label: 'Thân nhiệt', value: `${state.eclss.body_temp_c.toFixed(1)}°C`, status: 'warning' },
          { icon: '🔋', label: 'Pin Dự Trữ', value: `${state.battery} phần`, status: 'info' },
          { icon: '❄️', label: 'Vỏ Trạm Ngoài', value: '-170°C', status: 'critical' },
        ],
        options: [
          {
            id: 'A',
            label: '🔥 Bật Sưởi Ấm & Cách Nhiệt',
            preview: 'Tốn 2 pin. Giữ thân nhiệt ổn định 37.0°C suốt đêm.',
            badgeColor: 'blue',
          },
          {
            id: 'B',
            label: '🔋 Tiết Kiệm Pin',
            preview: 'Giữ điện pin, nhưng thân nhiệt tụt -1.1°C & sức khỏe -10.',
            badgeColor: 'red',
          },
        ],
        nasaHintTag: 'LOLA Polar Shadow: Chống sụt nhiệt đêm Mặt Trăng',
      };
    case 4:
      return {
        shift: 4,
        eventId: 'EVT-04',
        hoursLabel: `Ca 4 / 9 · Ngày 2 (${hoursStr})`,
        zone: 'habitat',
        title: 'TẮC VÒNG TÁI CHẾ NƯỚC WRS 98%',
        alertBadge: '💧 MÁY LỌC WRS NGHẸN!',
        alertStatus: 'warning',
        question: 'Sửa bộ lọc tái chế nước WRS ngay hay để sau?',
        lines: [
          'Bình thường WRS thu hồi 98% nước (2.5–3.0 L/ngày cho mỗi người).',
          'Màng lọc nghẹt bụi làm lượng nước tái chế sụt mạnh.',
          'Nếu trì hoãn, mỗi ca tiếp theo trạm mất -3 bình nước!',
        ],
        evidence: [
          { icon: '💧', label: 'Nước Dự Trữ', value: `${state.water} bình`, status: 'warning' },
          { icon: '🚰', label: 'Khẩu phần', value: `${state.eclss.water_l_day.toFixed(1)} L/ng`, status: 'warning' },
          { icon: '🌱', label: 'Vườn Cây', value: `${state.plant_health}/100`, status: 'normal' },
        ],
        options: [
          {
            id: 'A',
            label: '🔧 Sửa lọc WRS ngay',
            preview: 'Vườn cây nhịn nước 1 ca (-8), vòng WRS hồi phục 98%.',
            badgeColor: 'blue',
          },
          {
            id: 'B',
            label: '⏳ Để ca sau sửa',
            preview: 'Cây đủ nước ngay, nhưng bồn nước giảm -3 mỗi ca!',
            badgeColor: 'amber',
          },
        ],
        nasaHintTag: 'ECLSS ICES-2023-142: Tái chế nước khép kín WRS 98%',
      };
    case 5:
      return {
        shift: 5,
        eventId: 'EVT-05',
        hoursLabel: `Ca 5 / 9 · Ngày 2 (${hoursStr})`,
        zone: 'solar',
        title: 'BÃO BỤI TĨNH ĐIỆN REGOLITH',
        alertBadge: '🌪️ BÃO BỤI REGOLITH!',
        alertStatus: 'critical',
        question: 'Đóng Airlock xả lọc HEPA 99.97% hay ra ngoài quét pin?',
        lines: [
          'Bão bụi Mặt Trăng mang hạt silicat sắc như thủy tinh vụn đang quét qua!',
          'Hít bụi regolith làm rách gioăng suit và gây bệnh Phổi Bụi Mặt Trăng.',
          'Đóng Airlock & chạy HEPA bảo vệ phổi, nhưng pin ngoài trời còn bụi.',
        ],
        evidence: [
          { icon: '🌪️', label: 'Cảnh báo Bụi', value: 'TĨNH ĐIỆN CAO', status: 'critical' },
          { icon: '🌬️', label: 'Lọc HEPA', value: `${state.inventory.hepa_filter} bộ`, status: 'normal' },
          { icon: '🩺', label: 'Sức Khỏe', value: `${Math.round(state.crew_health)}/100`, status: 'normal' },
        ],
        options: [
          {
            id: 'A',
            label: '🌬️ Đóng Airlock & Chạy Lọc HEPA',
            preview: 'Chặn Phổi Bụi & lọc khí sạch (+8). Pin ngoài còn bụi.',
            badgeColor: 'blue',
          },
          {
            id: 'B',
            label: '☀️ Ra Ngoài Quét Pin Trong Bão',
            preview: 'Pin sạch (12 điện), nhưng mắc Phổi Bụi (-16 sức khỏe)!',
            badgeColor: 'red',
          },
        ],
        nasaHintTag: 'Space Medicine SCI-11: Lọc HEPA <0.3 µm',
      };
    case 6:
      return {
        shift: 6,
        eventId: 'EVT-06',
        hoursLabel: `Ca 6 / 9 · Ngày 2 (${hoursStr})`,
        zone: 'greenhouse',
        title: 'PHỤC HỒI VƯỜN VEGGIE & SPIRULINA',
        alertBadge: '🌱 GIẢM CALO & O₂!',
        alertStatus: 'warning',
        question: 'Cấp điện nước cứu Tảo Spirulina & Rau thủy canh qua Đêm 2?',
        lines: [
          'Tảo xoắn Spirulina & rau Veggie cung cấp 2500–3000 kcal/ngày và O₂.',
          'Sau bão bụi và đêm lạnh, hệ thống đèn quang hợp cần bổ sung điện.',
          'Cấp đủ cho Buồng Thực Vật cần 2 phần điện và 1 bình nước.',
        ],
        evidence: [
          { icon: '🥗', label: 'Năng lượng', value: `${Math.round(state.eclss.calories_kcal)} kcal`, status: state.eclss.calories_kcal < 2300 ? 'warning' : 'normal' },
          { icon: '🌱', label: 'Sức khỏe cây', value: `${state.plant_health}/100`, status: state.plant_health < 65 ? 'warning' : 'normal' },
          { icon: '🔋', label: 'Pin Dự Trữ', value: `${state.battery} phần`, status: 'info' },
        ],
        options: [
          {
            id: 'A',
            label: '💪 Cấp đèn LED & Tảo Spirulina',
            preview: 'Tốn 2 pin + 1 nước. Cây +18 điểm & thu +450 kcal!',
            badgeColor: 'green',
          },
          {
            id: 'B',
            label: '📦 Giữ Dự Trữ Khẩn Cấp',
            preview: 'Tiết kiệm điện nước. Cây yếu đi -20 & calo giảm.',
            badgeColor: 'amber',
          },
        ],
        nasaHintTag: 'Veggie & CELSS: Tảo Spirulina sinh khối cao',
      };
    case 7:
      return {
        shift: 7,
        eventId: 'EVT-07',
        hoursLabel: `Ca 7 / 9 · Ngày 3 (${hoursStr})`,
        zone: 'habitat',
        title: 'QUÁ TẢI LỌC KHÍ CO₂ (CDRA / LiOH)',
        alertBadge: '😮‍💨 CO₂ TĂNG CAO!',
        alertStatus: 'critical',
        question: 'Thay hộp hóa chất lọc CO₂ LiOH ngay hay chờ?',
        lines: [
          'Khí CO₂ vượt ngưỡng 5.3 mmHg do hộp LiOH đã bão hòa hoàn toàn.',
          'Tích tụ CO₂ gây đau đầu, chóng mặt và hội chứng Hypercapnia.',
          'Thay bộ lọc ngay tiêu tốn 2 phần điện và 1 bình nước.',
        ],
        evidence: [
          { icon: '🫁', label: 'Chất lượng khí', value: `${state.air_quality_score}/100`, status: state.air_quality_score < 70 ? 'critical' : 'warning' },
          { icon: '🔋', label: 'Pin Dự Trữ', value: `${state.battery} phần`, status: 'info' },
          { icon: '💧', label: 'Nước', value: `${state.water} bình`, status: 'normal' },
        ],
        options: [
          {
            id: 'A',
            label: '🔧 Thay hộp lọc LiOH ngay',
            preview: 'Tốn 2 pin + 1 nước. Khí sạch phục hồi > 88.',
            badgeColor: 'blue',
          },
          {
            id: 'B',
            label: '⏳ Chờ thêm 1 ca',
            preview: 'Không tốn pin/nước. Khí tụt -25 & nguy cơ Hypercapnia!',
            badgeColor: 'red',
          },
        ],
        nasaHintTag: 'ECLSS CDRA: Giới hạn CO₂ < 5.3 mmHg',
      };
    case 8:
      return {
        shift: 8,
        eventId: 'EVT-08',
        hoursLabel: `Ca 8 / 9 · Ngày 3 (${hoursStr})`,
        zone: 'control',
        title: 'BÃO BỨC XẠ MẶT TRỜI CỰC ĐẠI (SPE)',
        alertBadge: '☢️ BÁO ĐỘNG ĐỎ SPE!',
        alertStatus: 'critical',
        question: 'Vào hầm Shelter + uống Potassium Iodide (KI) hay giữ trạm ngoài?',
        lines: [
          'Bùng phát Mặt Trời cấp X phóng dòng hạt proton tới Mặt Trăng sau 30 phút!',
          'Không có từ trường bảo vệ, làm việc ngoài hầm sẽ nhận liều mSv rất cao.',
          'Vào Shelter kết hợp viên KI giúp che chắn an toàn tuyệt đối.',
        ],
        evidence: [
          { icon: '☢️', label: 'Bức xạ tích lũy', value: `${state.eclss.radiation_msv.toFixed(1)} mSv`, status: 'critical' },
          { icon: '💊', label: 'Thuốc KI', value: `${state.inventory.ki_pills} viên`, status: 'info' },
          { icon: '🏠', label: 'Hầm Shelter', value: 'Vách Nước Sẵn Sàng', status: 'normal' },
        ],
        options: [
          {
            id: 'A',
            label: '🏠 Vào Shelter + Uống Potassium Iodide',
            preview: 'Bảo vệ an toàn (mSv thấp). Pin còn bụi sang Ca 9.',
            badgeColor: 'blue',
          },
          {
            id: 'B',
            label: '⚡ Giữ Ăng-ten & Pin Ngoài Trời',
            preview: 'Pin Ca 9 đạt tối đa 12, nhưng nhiễm xạ tăng +45 mSv!',
            badgeColor: 'red',
          },
        ],
        nasaHintTag: 'DONKI Halloween Storm & Thuốc chống xạ KI',
      };
    case 9:
    default:
      return {
        shift: 9,
        eventId: 'EVT-09',
        hoursLabel: `Ca 9 / 9 · Ngày 3 (${hoursStr})`,
        zone: 'control',
        title: 'ĐÓN TÀU SPACEX STARSHIP HLS',
        alertBadge: '🚀 8 GIỜ CUỐI CÙNG!',
        alertStatus: 'info',
        question: 'Starship HLS đang hạ cánh! Phương án phân bổ 8 giờ cuối?',
        lines: [
          'Bão bức xạ đã tan. Tàu SpaceX Starship HLS chuẩn bị đáp xuống bãi Bắc!',
          `Dự trữ hiện có: ${state.battery} pin · ${state.water} nước · ${state.eclss.o2_kpa.toFixed(1)} kPa O₂.`,
          'Hãy khóa phương án cuối cùng để hoàn tất 72 giờ sứ mệnh Artemis!',
        ],
        evidence: [
          { icon: '🫁', label: 'Áp suất O₂', value: `${state.eclss.o2_kpa.toFixed(1)} kPa`, status: state.eclss.o2_kpa < 19.5 ? 'warning' : 'normal' },
          { icon: '💧', label: 'Nước/ngày', value: `${state.eclss.water_l_day.toFixed(1)} L/d`, status: 'normal' },
          { icon: '🥗', label: 'Năng lượng', value: `${Math.round(state.eclss.calories_kcal)} kcal`, status: 'normal' },
          { icon: '🧭', label: 'Khu EVA mở', value: `${state.unlocked_sectors.length}/3`, status: 'info' },
        ],
        options: [
          {
            id: 'A',
            label: '🫁 Bảo vệ Khí Sạch & Đèn Dẫn Đường HLS',
            preview: 'Đưa O₂ về 21.3 kPa (+10 khí sạch) & bật hải đăng đáp tàu.',
            badgeColor: 'blue',
          },
          {
            id: 'B',
            label: '⚖️ Chia đều cho Hệ Sống & Vườn Spirulina',
            preview: 'Dùng 1 pin + 1 nước cho +10 cây, +300 kcal & +5 khí sạch.',
            badgeColor: 'green',
          },
        ],
        nasaHintTag: 'Artemis Operations & SpaceX Starship HLS Docking Protocol',
      };
  }
}

export function getLocalizedScienceCard(lang: Language): ScienceCardData {
  if (lang === 'en') {
    return {
      title: '🌟 YOU JUST LEARNED:',
      lines: [
        'Solar particles travel from the Sun to the Moon in ~30 minutes.',
        'Without a thick atmosphere or magnetic field, lunar crews face sharp radiation.',
        'Water-filled Shelter walls and Potassium Iodide (KI) protect astronauts safely!',
      ],
      nasaReference: 'DONKI SPE & LRO CRaTER Lunar Radiation Data (SCI-05, SCI-07)',
    };
  }
  return {
    title: '🌟 BẠN VỪA HỌC ĐƯỢC:',
    lines: [
      'Các hạt năng lượng Mặt Trời bay tới Mặt Trăng chỉ trong khoảng 30 phút.',
      'Mặt Trăng không có khí quyển dày hay từ trường bảo vệ như Trái Đất.',
      'Tường túi nước hầm Shelter và thuốc Potassium Iodide (KI) bảo vệ phi hành gia!',
    ],
    nasaReference: 'DONKI SPE & LRO CRaTER Lunar Radiation Data (SCI-05, SCI-07)',
  };
}

export function localizeDecisionEntry(entry: DecisionLogEntry, lang: Language): DecisionLogEntry {
  if (lang === 'vi') return entry;
  return {
    ...entry,
    eventTitle: `${entry.eventId} · Shift ${entry.shift}`,
  };
}

function addAilment(list: SpaceAilmentId[], id: SpaceAilmentId, cured: SpaceAilmentId[]): SpaceAilmentId[] {
  if (list.includes(id) || cured.includes(id)) return list;
  return [...list, id];
}

export function applyDecision(
  prevState: GameState,
  choiceId: ChoiceId,
  lang: Language = 'vi',
): GameState {
  const s: GameState = {
    ...prevState,
    decisions: [...prevState.decisions],
    stress_reasons: [...prevState.stress_reasons],
    active_ailments: [...prevState.active_ailments],
    cured_ailments: [...prevState.cured_ailments],
    repaired_shifts: [...prevState.repaired_shifts],
    ared_exercised_shifts: [...prevState.ared_exercised_shifts],
    unlocked_sectors: [...prevState.unlocked_sectors],
    unlocked_achievements: [...prevState.unlocked_achievements],
    eclss: { ...prevState.eclss },
    inventory: { ...prevState.inventory },
    crops: {
      lettuce: { ...prevState.crops.lettuce },
      tomato: { ...prevState.crops.tomato },
      wheat: { ...prevState.crops.wheat },
      spirulina: { ...prevState.crops.spirulina },
    },
  };

  let consequence: ConsequenceData;
  let scienceCard: ScienceCardData | null = null;
  let logEntry: DecisionLogEntry;

  const en = lang === 'en';
  const curShift = s.shift;

  if (curShift === 1) {
    const alloc = computeEnergyAllocation({
      G: s.solar_supply,
      B: s.battery,
      C: s.battery_capacity,
      L: s.life_demand,
      H: s.green_demand,
      priority: choiceId === 'A' ? 'life-first' : 'greenhouse-first',
    });
    s.battery = alloc.B_next;
    if (choiceId === 'A') {
      s.greenhouse_lights_dimmed = true;
      s.plant_health = clamp(s.plant_health - 6, 0, 100);
      consequence = {
        shift: 1,
        eventId: 'EVT-01',
        title: en ? 'SOLAR RIDGE VOLTAGE DROP' : 'SỤT ÁP PIN SOLAR RIDGE',
        choiceId: 'A',
        choiceLabel: en ? '🫁 Life Support first' : '🫁 Hệ thống Sống trước',
        lines: en
          ? ['Life Support held 6/6 power. O₂ stayed steady.', 'Garden got reduced power; lights dimmed slightly.']
          : ['Hệ thống Sống nhận đủ 6/6 phần điện. O₂ ổn định.', 'Vườn cây nhận điện giảm nhẹ, đèn hơi tối.'],
        deltas: [
          { icon: '🫁', label: en ? 'Life Support' : 'Hệ thống Sống', change: '6/6', tone: 'normal' },
          { icon: '🌱', label: en ? 'Botany' : 'Vườn Cây', change: `${s.plant_health}/100 (-6)`, tone: 'warning' },
          { icon: '🔋', label: en ? 'Battery' : 'Pin', change: `${s.battery}`, tone: 'info' },
        ],
        visualCue: en ? 'Garden LED strips dimmed slightly.' : 'Đèn trồng cây dịu nhẹ để giữ điện sinh hoạt.',
      };
      logEntry = {
        shift: 1,
        eventId: 'EVT-01',
        eventTitle: 'Sụt Áp Pin Solar Ridge',
        choiceId: 'A',
        choiceLabel: 'Ưu tiên Hệ thống Sống trước',
        consequenceSummary: 'Giữ vững oxy & sưởi; vườn cây giảm nhẹ ánh sáng.',
        nasaTitle: 'QUY TẮC ƯU TIÊN HỆ THỐNG SỐNG BVAD',
        nasaFact: 'Trên ISS khi thiếu điện, hệ thống bơm O₂ và điều áp luôn được cấp nguồn trước tiên.',
        nasaSourceId: 'BVAD TP-2021-220419 (SCI-03)',
      };
    } else {
      s.greenhouse_lights_dimmed = false;
      s.air_quality_score = clamp(s.air_quality_score - 10, 0, 100);
      s.eclss.o2_kpa = clamp(s.eclss.o2_kpa - 0.6, 15, 22.5);
      consequence = {
        shift: 1,
        eventId: 'EVT-01',
        title: en ? 'SOLAR RIDGE VOLTAGE DROP' : 'SỤT ÁP PIN SOLAR RIDGE',
        choiceId: 'B',
        choiceLabel: en ? '🌱 Greenhouse first' : '🌱 Vườn Cây trước',
        lines: en
          ? ['Garden lights stayed bright, but Life Support lost 2 power.', 'Cabin air dropped -10 points.']
          : ['Đèn trồng cây sáng rực, nhưng Hệ thống Sống thiếu 2 điện.', 'Không khí trạm giảm -10 điểm.'],
        deltas: [
          { icon: '🌱', label: en ? 'Botany' : 'Vườn Cây', change: '6/6', tone: 'normal' },
          { icon: '🫁', label: en ? 'Air Score' : 'Không khí', change: `${s.air_quality_score}/100 (-10)`, tone: 'warning' },
        ],
        visualCue: en ? 'Life Support console beacons turned amber.' : 'Đèn Hệ thống Sống chuyển vàng cảnh báo.',
      };
      logEntry = {
        shift: 1,
        eventId: 'EVT-01',
        eventTitle: 'Sụt Áp Pin Solar Ridge',
        choiceId: 'B',
        choiceLabel: 'Ưu tiên Vườn Cây trước',
        consequenceSummary: 'Vườn cây đủ sáng nhưng không khí giảm -10 điểm.',
        nasaTitle: 'NGUYÊN TẮC CÂN BẰNG TẢI BVAD',
        nasaFact: 'Cắt điện bơm khí làm CO₂ tăng nhanh trong phòng kín.',
        nasaSourceId: 'BVAD TP-2021-220419 (SCI-03)',
      };
    }
    s.solar_supply = 11;
    s.battery = clamp(s.battery + 4, 0, s.battery_capacity);
  } else if (curShift === 2) {
    if (choiceId === 'A') {
      s.water = Math.max(1, s.water - 1);
      s.eclss.o2_kpa = 21.3;
      s.air_quality_score = clamp(s.air_quality_score + 4, 0, 100);
      s.battery = clamp(s.battery + 2, 0, s.battery_capacity);
      consequence = {
        shift: 2,
        eventId: 'EVT-02',
        title: en ? 'OGS OXYGEN ELECTROLYSIS DROP' : 'SỤT ÁP ĐIỆN PHÂN OXY OGS',
        choiceId: 'A',
        choiceLabel: en ? '🔧 Flush & restore OGS' : '🔧 Xả rửa & khôi phục OGS',
        lines: en
          ? ['Clean water restored the OGS electrolysis stack.', 'Cabin O₂ stabilized at 21.3 kPa!']
          : ['Nước sạch giúp màng điện phân OGS chạy êm trở lại.', 'Áp suất O₂ đạt chuẩn 21.3 kPa!'],
        deltas: [
          { icon: '🫁', label: 'O₂', change: '21.3 kPa', tone: 'normal' },
          { icon: '💧', label: en ? 'Water' : 'Nước', change: `${s.water} (-1)`, tone: 'warning' },
        ],
        visualCue: en ? 'OGS oxygen chamber glows bright cyan.' : 'Buồng điện phân Oxy OGS phát sáng xanh ổn định.',
      };
      logEntry = {
        shift: 2,
        eventId: 'EVT-02',
        eventTitle: 'Sụt Áp Điện Phân Oxy OGS',
        choiceId: 'A',
        choiceLabel: 'Xả rửa & khôi phục OGS',
        consequenceSummary: 'Tốn 1 bình nước, giữ chuẩn O₂ 21.3 kPa an toàn.',
        nasaTitle: 'ĐIỆN PHÂN NƯỚC TẠO OXY (OGS)',
        nasaFact: 'Hệ thống dùng điện Mặt Trời tách nước (2H₂O → 2H₂ + O₂) với tốc độ tiêu thụ 0.035 kg O₂/giờ/người.',
        nasaSourceId: 'ECLSS (SCI-08)',
      };
    } else {
      s.eclss.o2_kpa = clamp(s.eclss.o2_kpa - 1.7, 16.5, 22);
      s.air_quality_score = clamp(s.air_quality_score - 12, 0, 100);
      consequence = {
        shift: 2,
        eventId: 'EVT-02',
        title: en ? 'OGS OXYGEN ELECTROLYSIS DROP' : 'SỤT ÁP ĐIỆN PHÂN OXY OGS',
        choiceId: 'B',
        choiceLabel: en ? '⏳ Keep running dirty' : '⏳ Tiếp tục chạy tạm',
        lines: en
          ? ['O₂ output slowed! Partial pressure dropped to ' + s.eclss.o2_kpa.toFixed(1) + ' kPa.']
          : [`Sản lượng O₂ giảm! Áp suất riêng phần hạ còn ${s.eclss.o2_kpa.toFixed(1)} kPa.`],
        deltas: [
          { icon: '🫁', label: 'O₂', change: `${s.eclss.o2_kpa.toFixed(1)} kPa`, tone: 'critical' },
          { icon: '🌬️', label: en ? 'Air' : 'Khí', change: `${s.air_quality_score}/100 (-12)`, tone: 'warning' },
        ],
        visualCue: en ? 'Oxygen indicator beacons flash amber.' : 'Đèn báo áp suất O₂ nhấp nháy cam.',
      };
      logEntry = {
        shift: 2,
        eventId: 'EVT-02',
        eventTitle: 'Sụt Áp Điện Phân Oxy OGS',
        choiceId: 'B',
        choiceLabel: 'Trì hoãn vệ sinh OGS',
        consequenceSummary: 'Tiết kiệm nước nhưng O₂ giảm dưới 20 kPa.',
        nasaTitle: 'ÁP SUẤT OXY TRONG KHOANG TÀU',
        nasaFact: 'Duy trì O₂ quanh 21.3 kPa giúp phi hành gia tỉnh táo và tránh thiếu oxy (Hypoxia).',
        nasaSourceId: 'ECLSS & BVAD (SCI-03, SCI-08)',
      };
    }
  } else if (curShift === 3) {
    if (choiceId === 'A') {
      const bCost = Math.min(s.battery, 2);
      s.battery = Math.max(0, s.battery - bCost);
      s.eclss.body_temp_c = 37.0;
      s.shelter_state = 'sheltered';
      consequence = {
        shift: 3,
        eventId: 'EVT-03',
        title: en ? 'FIRST POLAR NIGHT (-170°C)' : 'ĐÊM CỰC NAM ĐẦU TIÊN (-170°C)',
        choiceId: 'A',
        choiceLabel: en ? '🔥 Full Cabin Heating & Insulation' : '🔥 Bật Sưởi Ấm & Cách Nhiệt',
        lines: en
          ? ['Multi-layer thermal blankets & heaters held cabin cozy against -170°C!']
          : ['Lớp cách nhiệt và máy sưởi giữ thân nhiệt ổn định 37.0°C bất chấp -170°C bên ngoài!'],
        deltas: [
          { icon: '🌡️', label: en ? 'Body Temp' : 'Thân nhiệt', change: '37.0°C', tone: 'normal' },
          { icon: '🔋', label: en ? 'Battery' : 'Pin', change: `${s.battery} (-${bCost})`, tone: 'warning' },
        ],
        visualCue: en ? 'Thermal shield doors sealed during polar night.' : 'Hầm cách nhiệt đóng kín bảo vệ đoàn qua đêm đầu tiên.',
      };
      logEntry = {
        shift: 3,
        eventId: 'EVT-03',
        eventTitle: 'Đêm Cực Nam Đầu Tiên (-170°C)',
        choiceId: 'A',
        choiceLabel: 'Bật sưởi & đóng vách cách nhiệt',
        consequenceSummary: 'Thân nhiệt giữ vững 37.0°C; tiêu hao 2 phần điện pin.',
        nasaTitle: 'CHÊNH LỆCH NHIỆT ĐỘ CỰC ĐOAN MẶT TRĂNG',
        nasaFact: 'Ban đêm trong bóng miệng hố Mặt Trăng tụt xuống -170°C do không có khí quyển giữ nhiệt.',
        nasaSourceId: 'LOLA Polar Illumination (SCI-01)',
      };
    } else {
      s.eclss.body_temp_c = clamp(s.eclss.body_temp_c - 1.1, 34.8, 37.2);
      s.crew_health = clamp(s.crew_health - 10, 0, 100);
      consequence = {
        shift: 3,
        eventId: 'EVT-03',
        title: en ? 'FIRST POLAR NIGHT (-170°C)' : 'ĐÊM CỰC NAM ĐẦU TIÊN (-170°C)',
        choiceId: 'B',
        choiceLabel: en ? '🔋 Conserve Battery' : '🔋 Tiết Kiệm Pin',
        lines: en
          ? ['Crew shivered in the chill! Body temp dipped to ' + s.eclss.body_temp_c.toFixed(1) + '°C.']
          : [`Phi hành đoàn rét run trong đêm lạnh! Thân nhiệt hạ còn ${s.eclss.body_temp_c.toFixed(1)}°C.`],
        deltas: [
          { icon: '🌡️', label: en ? 'Body Temp' : 'Thân nhiệt', change: `${s.eclss.body_temp_c.toFixed(1)}°C`, tone: 'critical' },
          { icon: '🩺', label: en ? 'Health' : 'Sức khỏe', change: `${Math.round(s.crew_health)}/100 (-10)`, tone: 'warning' },
        ],
        visualCue: en ? 'Blue frost glow chilled the corridors.' : 'Hành lang trạm phủ ánh xanh giá lạnh.',
      };
      logEntry = {
        shift: 3,
        eventId: 'EVT-03',
        eventTitle: 'Đêm Cực Nam Đầu Tiên (-170°C)',
        choiceId: 'B',
        choiceLabel: 'Tiết kiệm pin giảm sưởi',
        consequenceSummary: 'Thân nhiệt tụt và sức khỏe giảm -10.',
        nasaTitle: 'BẢO VỆ THÂN NHIỆT PHI HÀNH GIA',
        nasaFact: 'Áo phi hành gia và trạm Artemis phải cách nhiệt đa lớp (MLI) chống sốc nhiệt -170°C.',
        nasaSourceId: 'HRP & Artemis Thermal (SCI-10)',
      };
    }
    s.battery = clamp(s.battery + 3, 0, s.battery_capacity);
    s.solar_supply = 10;
  } else if (curShift === 4) {
    if (choiceId === 'A') {
      s.recovery_condition = 'normal';
      s.greenhouse_water_paused = true;
      s.plant_health = clamp(s.plant_health - 8, 0, 100);
      s.eclss.water_l_day = 2.9;
      consequence = {
        shift: 4,
        eventId: 'EVT-04',
        title: en ? 'WRS 98% WATER LOOP FOULING' : 'TẮC VÒNG TÁI CHẾ NƯỚC WRS 98%',
        choiceId: 'A',
        choiceLabel: en ? '🔧 Fix WRS Filter now' : '🔧 Sửa lọc WRS ngay',
        lines: en
          ? ['WRS water loop restored to 98% recovery!', 'Plants paused watering 1 shift (-8).']
          : ['Hệ thống WRS đã tái chế 98% nước sạch trở lại!', 'Vườn cây tạm khát 1 ca (-8).'],
        deltas: [
          { icon: '💧', label: 'WRS', change: '98% (2.9 L/d)', tone: 'normal' },
          { icon: '🌱', label: en ? 'Botany' : 'Vườn Cây', change: `${s.plant_health}/100 (-8)`, tone: 'warning' },
        ],
        visualCue: en ? 'WRS Water Tank column glows clear cyan.' : 'Cột nước tái chế WRS trong suốt ổn định trở lại.',
      };
      logEntry = {
        shift: 4,
        eventId: 'EVT-04',
        eventTitle: 'Tắc Vòng Tái Chế Nước WRS 98%',
        choiceId: 'A',
        choiceLabel: 'Sửa bộ lọc WRS ngay',
        consequenceSummary: 'Khôi phục tái chế nước 98%; vườn cây giảm nhẹ -8.',
        nasaTitle: 'TÁI CHẾ NƯỚC 98% TRÊN TRẠM VŨ TRỤ',
        nasaFact: 'Hệ thống WRS giúp trạm vũ trụ tái sử dụng tới 98% nước, giảm phụ thuộc tiếp tế từ Trái Đất.',
        nasaSourceId: 'ECLSS ICES-2023-142 (SCI-08)',
      };
    } else {
      s.recovery_condition = 'degraded';
      s.water = Math.max(0, s.water - 3);
      s.eclss.water_l_day = clamp(s.eclss.water_l_day - 0.6, 0.5, 3.0);
      consequence = {
        shift: 4,
        eventId: 'EVT-04',
        title: en ? 'WRS 98% WATER LOOP FOULING' : 'TẮC VÒNG TÁI CHẾ NƯỚC WRS 98%',
        choiceId: 'B',
        choiceLabel: en ? '⏳ Delay WRS repair' : '⏳ Để ca sau sửa',
        lines: en
          ? ['Dirty WRS drains water reserves -3 units!']
          : ['Máy lọc bẩn khiến bình nước dự trữ tụt ngay -3 bình!'],
        deltas: [
          { icon: '💧', label: en ? 'Water' : 'Nước', change: `${s.water} (-3)`, tone: 'critical' },
          { icon: '🚰', label: en ? 'Hydration' : 'Khẩu phần', change: `${s.eclss.water_l_day.toFixed(1)} L/d`, tone: 'warning' },
        ],
        visualCue: en ? 'Water indicators flash amber.' : 'Đèn bồn nước nhấp nháy cam.',
      };
      logEntry = {
        shift: 4,
        eventId: 'EVT-04',
        eventTitle: 'Tắc Vòng Tái Chế Nước WRS 98%',
        choiceId: 'B',
        choiceLabel: 'Trì hoãn sửa WRS',
        consequenceSummary: 'Nước tụt -3 bình và tiếp tục hao hụt.',
        nasaTitle: 'NHU CẦU NƯỚC HÀNG NGÀY BVAD',
        nasaFact: 'Phi hành gia cần 2.5–3.0 lít nước/ngày; mất tái chế làm cạn nước chỉ sau vài ca.',
        nasaSourceId: 'BVAD (SCI-03)',
      };
    }
    s.dust_storm_active = true;
    s.battery = clamp(s.battery + 2, 0, s.battery_capacity);
  } else if (curShift === 5) {
    if (s.recovery_condition === 'degraded') {
      s.water = Math.max(0, s.water - 3);
    }
    if (choiceId === 'A') {
      s.airlock_hepa_cleaned = true;
      s.solar_panels_dusty = true;
      s.solar_supply = 8;
      s.air_quality_score = clamp(s.air_quality_score + 8, 0, 100);
      if ((s.inventory.hepa_filter ?? 0) > 0) s.inventory.hepa_filter -= 1;
      consequence = {
        shift: 5,
        eventId: 'EVT-05',
        title: en ? 'ELECTROSTATIC REGOLITH DUST STORM' : 'BÃO BỤI TĨNH ĐIỆN REGOLITH',
        choiceId: 'A',
        choiceLabel: en ? '🌬️ Seal Airlock & Run HEPA Rinse' : '🌬️ Đóng Airlock & Chạy Lọc HEPA',
        lines: en
          ? ['99.97% HEPA filters trapped sharp regolith shards!', 'Lungs stayed safe; outdoor solar panels need cleaning later.']
          : ['Bộ lọc HEPA 99.97% chặn sạch bụi regolith sắc nhọn!', 'Phổi đoàn an toàn, tấm pin ngoài hơi bám bụi.'],
        deltas: [
          { icon: '🌬️', label: 'HEPA', change: en ? 'Lungs Protected' : 'Chặn bụi 99.97%', tone: 'normal' },
          { icon: '☀️', label: 'Solar', change: '8 (dusty)', tone: 'warning' },
        ],
        visualCue: en ? 'Dust motes settled safely inside HEPA traps.' : 'Hạt bụi được hút sạch qua màng lọc HEPA.',
      };
      logEntry = {
        shift: 5,
        eventId: 'EVT-05',
        eventTitle: 'Bão Bụi Tĩnh Điện Regolith',
        choiceId: 'A',
        choiceLabel: 'Đóng Airlock & chạy lọc HEPA 99.97%',
        consequenceSummary: 'Bảo vệ phổi khỏi bụi regolith; pin ngoài còn bụi (8 điện).',
        nasaTitle: 'HIỂM HỌA BỤI MẶT TRĂNG REGOLITH',
        nasaFact: 'Bụi Mặt Trăng không bị gió mài nên sắc như thủy tinh và nhiễm tĩnh điện, cần lọc HEPA < 0.3 µm.',
        nasaSourceId: 'Space Medicine (SCI-11)',
      };
    } else {
      s.solar_panels_dusty = false;
      s.solar_supply = 12;
      s.active_ailments = addAilment(s.active_ailments, 'lunar_dust_pneumonia', s.cured_ailments);
      s.crew_health = clamp(s.crew_health - 16, 0, 100);
      consequence = {
        shift: 5,
        eventId: 'EVT-05',
        title: en ? 'ELECTROSTATIC REGOLITH DUST STORM' : 'BÃO BỤI TĨNH ĐIỆN REGOLITH',
        choiceId: 'B',
        choiceLabel: en ? '☀️ EVA Sweep Solar Panels in Storm' : '☀️ Ra Ngoài Quét Pin Trong Bão',
        lines: en
          ? ['Solar panels are spotless (12 power), but static regolith triggered Dust Lung!']
          : ['Tấm pin sạch bong (12 điện), nhưng bụi mịn chui qua suit gây Phổi Bụi Mặt Trăng!'],
        deltas: [
          { icon: '☀️', label: 'Solar', change: '12 (Clean)', tone: 'normal' },
          { icon: '🩺', label: en ? 'Health' : 'Sức khỏe', change: `${Math.round(s.crew_health)}/100 (-16 Dust Lung)`, tone: 'critical' },
        ],
        visualCue: en ? 'Medical bay warning alarm triggered.' : 'Cảnh báo Phổi Bụi tại Khoang Y Tế!',
        delayedWarning: en ? 'Craft or use HEPA filter in Medical Bay!' : 'Chế tạo lọc HEPA tại Khoang Y Tế để chữa trị!',
      };
      logEntry = {
        shift: 5,
        eventId: 'EVT-05',
        eventTitle: 'Bão Bụi Tĩnh Điện Regolith',
        choiceId: 'B',
        choiceLabel: 'Ra ngoài quét pin giữa bão bụi',
        consequenceSummary: 'Pin sạch (12 điện) nhưng mắc Phổi Bụi (-16 sức khỏe).',
        nasaTitle: 'VIÊM PHỔI BỤI MẶT TRĂNG',
        nasaFact: 'Bụi regolith dính lên đồ phi hành gia có thể làm xước phổi nếu không dùng bộ lọc HEPA.',
        nasaSourceId: 'Space Medicine (SCI-11)',
      };
    }
    s.dust_storm_active = false;
    s.thermal_drop_active = true;
    s.battery = clamp(s.battery + 3, 0, s.battery_capacity);
  } else if (curShift === 6) {
    if (s.recovery_condition === 'degraded') {
      s.water = Math.max(0, s.water - 3);
    }
    if (choiceId === 'A') {
      const bCost = Math.min(s.battery, 2);
      s.battery = Math.max(0, s.battery - bCost);
      s.water = Math.max(1, s.water - 1);
      s.plant_health = clamp(s.plant_health + 18, 0, 100);
      s.eclss.calories_kcal = clamp(s.eclss.calories_kcal + 450, 1500, 3100);
      s.crops.spirulina.growth = clamp(s.crops.spirulina.growth + 22, 0, 100);
      s.greenhouse_lights_dimmed = false;
      s.greenhouse_water_paused = false;
      consequence = {
        shift: 6,
        eventId: 'EVT-06',
        title: en ? 'VEGGIE & SPIRULINA NIGHT RECOVERY' : 'PHỤC HỒI VƯỜN VEGGIE & SPIRULINA',
        choiceId: 'A',
        choiceLabel: en ? '💪 Power Spirulina & Veggie LEDs' : '💪 Cấp đèn LED & Tảo Spirulina',
        lines: en
          ? ['Spirulina & Veggie crops thrived! Calories boosted +450 kcal and bio-O₂ rose.']
          : ['Tảo xoắn Spirulina & rau thủy canh bùng nổ! Bổ sung +450 kcal & tăng O₂ sinh học.'],
        deltas: [
          { icon: '🌱', label: en ? 'Botany' : 'Vườn Cây', change: `${s.plant_health}/100 (+18)`, tone: 'normal' },
          { icon: '🥗', label: 'Calories', change: `${Math.round(s.eclss.calories_kcal)} kcal (+450)`, tone: 'normal' },
        ],
        visualCue: en ? 'Spirulina bioreactors & Veggie trays glow vivid green!' : 'Buồng Veggie và bồn tảo Spirulina rực xanh!',
      };
      logEntry = {
        shift: 6,
        eventId: 'EVT-06',
        eventTitle: 'Phục Hồi Vườn Veggie & Spirulina',
        choiceId: 'A',
        choiceLabel: 'Cấp đèn LED & nuôi tảo Spirulina',
        consequenceSummary: 'Cây hồi +18 điểm và nạp thêm +450 kcal cho đoàn.',
        nasaTitle: 'NÔNG NGHIỆP TẢO & THỰC VẬT KHÔNG GIAN',
        nasaFact: 'Tảo Spirulina và vườn Veggie tạo protein nhanh, bổ sung calo (2500–3000 kcal/ngày) và oxy.',
        nasaSourceId: 'Veggie & CELSS (SCI-04)',
      };
    } else {
      s.plant_health = clamp(s.plant_health - 20, 0, 100);
      s.eclss.calories_kcal = clamp(s.eclss.calories_kcal - 260, 1400, 3100);
      s.greenhouse_lights_dimmed = true;
      consequence = {
        shift: 6,
        eventId: 'EVT-06',
        title: en ? 'VEGGIE & SPIRULINA NIGHT RECOVERY' : 'PHỤC HỒI VƯỜN VEGGIE & SPIRULINA',
        choiceId: 'B',
        choiceLabel: en ? '📦 Conserve Power & Water' : '📦 Giữ Dự Trữ Khẩn Cấp',
        lines: en
          ? ['Reserves stayed untouched, but garden wilted (-20) and kcal dipped.']
          : ['Tiết kiệm điện nước nhưng vườn cây úa (-20) và khẩu phần calo giảm.'],
        deltas: [
          { icon: '🌱', label: en ? 'Botany' : 'Vườn Cây', change: `${s.plant_health}/100 (-20)`, tone: 'critical' },
          { icon: '🥗', label: 'Calories', change: `${Math.round(s.eclss.calories_kcal)} kcal`, tone: 'warning' },
        ],
        visualCue: en ? 'Botany tray leaves drooped under dim lights.' : 'Lá cây rũ xuống dưới ánh đèn yếu.',
      };
      logEntry = {
        shift: 6,
        eventId: 'EVT-06',
        eventTitle: 'Phục Hồi Vườn Veggie & Spirulina',
        choiceId: 'B',
        choiceLabel: 'Giữ dự trữ điện nước',
        consequenceSummary: 'Tiết kiệm dự trữ nhưng cây tụt -20 và calo giảm.',
        nasaTitle: 'DINH DƯỠNG & CALO PHI HÀNH GIA',
        nasaFact: 'Phi hành gia cần 2500–3000 kcal/ngày; thiếu rau tươi & tảo làm giảm sức bền.',
        nasaSourceId: 'BVAD & GeneLab (SCI-03, SCI-04)',
      };
    }
    s.thermal_drop_active = false;
    s.co2_haze_active = true;
    s.filter_condition = 'warning';
    s.battery = clamp(s.battery + 3, 0, s.battery_capacity);
  } else if (curShift === 7) {
    if (s.recovery_condition === 'degraded') {
      s.water = Math.max(0, s.water - 3);
    }
    if (choiceId === 'A') {
      const bCost = Math.min(s.battery, 2);
      s.battery = Math.max(0, s.battery - bCost);
      s.water = Math.max(1, s.water - 1);
      s.filter_condition = 'normal';
      s.co2_haze_active = false;
      s.air_quality_score = Math.max(88, clamp(s.air_quality_score + 20, 0, 100));
      s.eclss.o2_kpa = clamp(s.eclss.o2_kpa + 0.8, 17, 21.6);
      consequence = {
        shift: 7,
        eventId: 'EVT-07',
        title: en ? 'CDRA / LiOH CO₂ SCRUBBER SURGE' : 'QUÁ TẢI LỌC KHÍ CO₂ (CDRA / LiOH)',
        choiceId: 'A',
        choiceLabel: en ? '🔧 Swap LiOH Scrubber now' : '🔧 Thay hộp lọc LiOH ngay',
        lines: en
          ? ['Fresh LiOH canister locked! Cabin air scrubbed clean (>88/100).']
          : ['Đã thay hộp lọc LiOH mới! Không khí trong lành trở lại (>88/100).'],
        deltas: [
          { icon: '🫁', label: en ? 'Clean Air' : 'Không khí', change: `${s.air_quality_score}/100`, tone: 'normal' },
          { icon: '🔋', label: en ? 'Battery' : 'Pin', change: `${s.battery} (-${bCost})`, tone: 'warning' },
        ],
        visualCue: en ? 'Amber CO₂ haze cleared from Habitat.' : 'Sương mờ CO₂ trong khu Sinh hoạt tan hết.',
      };
      logEntry = {
        shift: 7,
        eventId: 'EVT-07',
        eventTitle: 'Quá Tải Lọc Khí CO₂ (CDRA / LiOH)',
        choiceId: 'A',
        choiceLabel: 'Thay hộp lọc LiOH ngay',
        consequenceSummary: 'Tiêu hao 2 pin + 1 nước; không khí sạch >88/100.',
        nasaTitle: 'GIỚI HẠN CO₂ TRÊN TRẠM VŨ TRỤ',
        nasaFact: 'Trạm vũ trụ giữ CO₂ dưới 5.3 mmHg bằng CDRA và hộp LiOH để tránh đau đầu, lú lẫn.',
        nasaSourceId: 'ECLSS (SCI-08)',
      };
    } else {
      s.co2_haze_active = true;
      s.air_quality_score = Math.max(0, s.air_quality_score - 25);
      s.active_ailments = addAilment(s.active_ailments, 'hypercapnia', s.cured_ailments);
      s.crew_health = clamp(s.crew_health - 15, 0, 100);
      consequence = {
        shift: 7,
        eventId: 'EVT-07',
        title: en ? 'CDRA / LiOH CO₂ SCRUBBER SURGE' : 'QUÁ TẢI LỌC KHÍ CO₂ (CDRA / LiOH)',
        choiceId: 'B',
        choiceLabel: en ? '⏳ Wait one more shift' : '⏳ Chờ thêm 1 ca',
        lines: en
          ? ['CO₂ pooled in the habitat! Crew suffered Hypercapnia (-15 health).']
          : ['Khí CO₂ tích tụ gây ngộ độc Hypercapnia (-15 sức khỏe)!'],
        deltas: [
          { icon: '🫁', label: en ? 'Air Score' : 'Không khí', change: `${s.air_quality_score}/100 (-25)`, tone: 'critical' },
          { icon: '🩺', label: en ? 'Health' : 'Sức khỏe', change: `${Math.round(s.crew_health)}/100 (-15)`, tone: 'critical' },
        ],
        visualCue: en ? 'Air pipes glow amber warning.' : 'Ống khí trong trạm báo động màu cam.',
      };
      logEntry = {
        shift: 7,
        eventId: 'EVT-07',
        eventTitle: 'Quá Tải Lọc Khí CO₂ (CDRA / LiOH)',
        choiceId: 'B',
        choiceLabel: 'Trì hoãn thay lọc CO₂',
        consequenceSummary: 'Không khí giảm -25; đoàn mắc ngộ độc CO₂ Hypercapnia.',
        nasaTitle: 'HỘI CHỨNG NGỘ ĐỘC CO₂ HYPERCAPNIA',
        nasaFact: 'CO₂ vượt 10 mmHg làm phi hành gia suy giảm nhận thức và nhức đầu.',
        nasaSourceId: 'Space Medicine (SCI-08, SCI-11)',
      };
    }
    // Activate Solar Storm Alert entering Shift 8!
    s.spe_active = true;
    s.battery = clamp(s.battery + 3, 0, s.battery_capacity);
  } else if (curShift === 8) {
    if (s.recovery_condition === 'degraded') {
      s.water = Math.max(0, s.water - 3);
    }
    if (choiceId === 'A') {
      s.shelter_state = 'sheltered';
      s.radiation_risk = 'protected-risk';
      s.radiation_units += 4;
      s.eclss.radiation_msv = Math.round((s.eclss.radiation_msv + 3.2) * 10) / 10;
      if ((s.inventory.ki_pills ?? 0) > 0) s.inventory.ki_pills -= 1;
      s.solar_panels_dusty = true;
      s.solar_supply = 9;
      consequence = {
        shift: 8,
        eventId: 'EVT-08',
        title: en ? 'SOLAR PARTICLE RADIATION STORM (SPE)' : 'BÃO BỨC XẠ MẶT TRỜI CỰC ĐẠI (SPE)',
        choiceId: 'A',
        choiceLabel: en ? '🏠 Shelter + Take Potassium Iodide' : '🏠 Vào Shelter + Uống Potassium Iodide',
        lines: en
          ? ['Blast door sealed and KI tablets shielded cells from solar protons!']
          : ['Cửa hầm Shelter đóng kín & viên Potassium Iodide bảo vệ tế bào an toàn!'],
        deltas: [
          { icon: '☢️', label: 'mSv', change: `${s.eclss.radiation_msv} mSv (Safe)`, tone: 'normal' },
          { icon: '🏠', label: 'Shelter', change: 'Protected', tone: 'normal' },
        ],
        visualCue: en ? 'Heavy radiation shelter door locked shut.' : 'Cửa hầm Shelter thép dày đóng sập chắn bão.',
      };
      logEntry = {
        shift: 8,
        eventId: 'EVT-08',
        eventTitle: 'Bão Bức Xạ Mặt Trời Cực Đại (SPE)',
        choiceId: 'A',
        choiceLabel: 'Vào hầm Shelter & dùng thuốc KI',
        consequenceSummary: 'Bức xạ giữ thấp an toàn khỏi cơn bão proton SPE.',
        nasaTitle: 'CƠN BÃO HẠT MẶT TRỜI & THUỐC KI',
        nasaFact: 'Cơn bão Halloween 2003 buộc phi hành gia ISS trú ẩn module Zvezda tránh >100 mSv.',
        nasaSourceId: 'DONKI & HRP (SCI-05, SCI-06)',
      };
    } else {
      s.shelter_state = 'sheltered';
      s.radiation_risk = 'at-risk';
      s.radiation_units += 42;
      s.eclss.radiation_msv = Math.round((s.eclss.radiation_msv + 45.0) * 10) / 10;
      s.solar_panels_dusty = false;
      s.solar_supply = 12;
      s.active_ailments = addAilment(s.active_ailments, 'radiation_sickness', s.cured_ailments);
      s.crew_health = clamp(s.crew_health - 22, 0, 100);
      consequence = {
        shift: 8,
        eventId: 'EVT-08',
        title: en ? 'SOLAR PARTICLE RADIATION STORM (SPE)' : 'BÃO BỨC XẠ MẶT TRỜI CỰC ĐẠI (SPE)',
        choiceId: 'B',
        choiceLabel: en ? '⚡ Keep Full Outdoor Dish Active' : '⚡ Giữ Ăng-ten & Pin Ngoài Trời',
        lines: en
          ? ['Solar arrays hit 12 power, but +45 mSv solar radiation struck the crew!']
          : ['Pin đạt 12 phần điện, nhưng +45 mSv bức xạ gây Say bức xạ vũ trụ!'],
        deltas: [
          { icon: '☢️', label: 'mSv', change: `${s.eclss.radiation_msv} mSv (+45 At-Risk)`, tone: 'critical' },
          { icon: '🩺', label: en ? 'Health' : 'Sức khỏe', change: `${Math.round(s.crew_health)}/100 (-22)`, tone: 'critical' },
        ],
        visualCue: en ? 'Red radiation streaks swept the sky.' : 'Cảnh báo Say Bức Xạ bật đỏ toàn trạm.',
        delayedWarning: en ? 'Treat Radiation Sickness in Medical Bay or Botany!' : 'Dùng thuốc KI hoặc Cà chua lùn để điều trị!',
      };
      logEntry = {
        shift: 8,
        eventId: 'EVT-08',
        eventTitle: 'Bão Bức Xạ Mặt Trời Cực Đại (SPE)',
        choiceId: 'B',
        choiceLabel: 'Ở ngoài giữ pin trong bão SPE',
        consequenceSummary: 'Đầy pin (12 điện) nhưng liều bức xạ vọt +45 mSv.',
        nasaTitle: 'GIỚI HẠN BỨC XẠ TRÊN MẶT TRĂNG',
        nasaFact: 'Dữ liệu LRO CRaTER cho thấy phơi nhiễm SPE trực tiếp gây Say bức xạ cấp tính.',
        nasaSourceId: 'LRO CRaTER & HRP (SCI-06, SCI-07)',
      };
    }
    scienceCard = getLocalizedScienceCard(lang);
    s.spe_active = false;
  } else {
    // Shift 9 (64-72h): SpaceX Starship HLS Final Touchdown
    if (s.recovery_condition === 'degraded') {
      s.water = Math.max(0, s.water - 3);
    }
    if (choiceId === 'A') {
      s.air_quality_score = clamp(s.air_quality_score + 10, 0, 100);
      s.eclss.o2_kpa = 21.3;
      s.co2_haze_active = false;
      consequence = {
        shift: 9,
        eventId: 'EVT-09',
        title: en ? 'SPACEX STARSHIP HLS TOUCHDOWN' : 'ĐÓN TÀU SPACEX STARSHIP HLS',
        choiceId: 'A',
        choiceLabel: en ? '🫁 Lock Life Support & HLS Beacon' : '🫁 Bảo vệ Khí Sạch & Đèn Dẫn Đường HLS',
        lines: en
          ? ['O₂ stabilized at 21.3 kPa! SpaceX Starship HLS landed safely at Pad Alpha!']
          : ['Áp suất O₂ ổn định 21.3 kPa! Tàu SpaceX Starship HLS đã đáp an toàn xuống bãi Bắc!'],
        deltas: [
          { icon: '🫁', label: 'O₂', change: '21.3 kPa (+10 Air)', tone: 'normal' },
          { icon: '🚀', label: 'Starship HLS', change: en ? 'Touchdown!' : 'Hạ cánh an toàn!', tone: 'normal' },
        ],
        visualCue: en ? 'Starship HLS landing pad beacon shines bright green!' : 'Hải đăng bãi đáp Starship HLS bật xanh rực!',
      };
      logEntry = {
        shift: 9,
        eventId: 'EVT-09',
        eventTitle: 'Đón Tàu SpaceX Starship HLS',
        choiceId: 'A',
        choiceLabel: 'Giữ chuẩn O₂ & bật hải đăng Starship HLS',
        consequenceSummary: 'Hoàn tất 72 giờ an toàn đón tàu SpaceX Starship HLS hạ cánh.',
        nasaTitle: 'SỨ MỆNH CỰC NAM & STARSHIP HLS',
        nasaFact: 'SpaceX Starship HLS vận chuyển phi hành đoàn & vật tư xuống Cực Nam Mặt Trăng phục vụ Trạm Aurora.',
        nasaSourceId: 'Lunar Surface Ops & SpaceX HLS (SCI-10)',
      };
    } else {
      const bCost = Math.min(s.battery, 1);
      s.battery = Math.max(0, s.battery - bCost);
      s.water = Math.max(0, s.water - 1);
      s.air_quality_score = clamp(s.air_quality_score + 5, 0, 100);
      s.plant_health = clamp(s.plant_health + 10, 0, 100);
      s.eclss.calories_kcal = clamp(s.eclss.calories_kcal + 300, 1500, 3100);
      s.greenhouse_lights_dimmed = false;
      consequence = {
        shift: 9,
        eventId: 'EVT-09',
        title: en ? 'SPACEX STARSHIP HLS TOUCHDOWN' : 'ĐÓN TÀU SPACEX STARSHIP HLS',
        choiceId: 'B',
        choiceLabel: en ? '⚖️ Share with Botany & Fresh Rations' : '⚖️ Chia đều cho Hệ Sống & Vườn Spirulina',
        lines: en
          ? ['Fresh Veggie & Spirulina rations prepped for incoming Starship HLS astronauts!']
          : ['Rau tươi & tảo Spirulina sẵn sàng đón đoàn phi hành gia từ tàu Starship HLS!'],
        deltas: [
          { icon: '🌱', label: en ? 'Botany' : 'Vườn Cây', change: `${s.plant_health}/100 (+10)`, tone: 'normal' },
          { icon: '🥗', label: 'Calories', change: `${Math.round(s.eclss.calories_kcal)} kcal (+300)`, tone: 'normal' },
          { icon: '🚀', label: 'Starship HLS', change: en ? 'Touchdown!' : 'Hạ cánh an toàn!', tone: 'normal' },
        ],
        visualCue: en ? 'Habitat, Botany Lab & HLS Pad glow together.' : 'Toàn trạm Aurora và bãi đáp Starship HLS rực sáng.',
      };
      logEntry = {
        shift: 9,
        eventId: 'EVT-09',
        eventTitle: 'Đón Tàu SpaceX Starship HLS',
        choiceId: 'B',
        choiceLabel: 'Chia dự trữ giữ sống & vườn Spirulina',
        consequenceSummary: 'Vườn cây +10, calo +300 kcal khi Starship HLS hạ cánh.',
        nasaTitle: 'CĂN CỨ BỀN VỮNG ARTEMIS',
        nasaFact: 'Kết hợp hàng tiếp tế từ Starship HLS với vườn sinh thái Veggie giúp căn cứ Mặt Trăng tự chủ lâu dài.',
        nasaSourceId: 'Lunar Surface Ops & Veggie (SCI-04, SCI-10)',
      };
    }
  }

  s.decisions.push(logEntry);
  s.last_consequence = consequence;
  s.pending_science_card = scienceCard;
  s.mission_hours = SHIFT_TIMELINE_META[curShift].endHour;
  s.quest_step = 'resolved';
  s.quest_exec_deadline_ms = null;

  // Award Shift Milestone Achievement if mission didn't fail critically
  const evalCheck = evaluateTerminalOutcome(s, lang);
  s.outcome = evalCheck.outcome;
  s.failure_reason = evalCheck.failureReason;
  s.stress_reasons = evalCheck.stressReasons;

  let finalState = s;
  if (evalCheck.outcome !== 'failure') {
    finalState = awardAchievement(finalState, SHIFT_TIMELINE_META[curShift].milestoneAchievement);
    if (curShift === 9) {
      finalState = checkAndAwardEndgameAchievement(finalState);
    }
  }
  finalState.unlocked_rooms = computeUnlockedRooms(finalState);
  finalState.phase = 'consequence';
  return finalState;
}

export function localizeConsequence(c: ConsequenceData, _state: GameState, _lang: Language): ConsequenceData {
  return c;
}

export function advanceAfterConsequence(prevState: GameState): GameState {
  if (prevState.pending_science_card) {
    return { ...prevState, phase: 'science_card' };
  }
  return { ...prevState, phase: 'post_dialogue' };
}

export function dismissScienceCard(prevState: GameState): GameState {
  return { ...prevState, pending_science_card: null, phase: 'post_dialogue' };
}

export function finishPostShiftDialogue(prevState: GameState, lang: Language = 'vi'): GameState {
  if (prevState.outcome !== 'active' || prevState.shift >= 9) {
    const evalFinal = evaluateTerminalOutcome(prevState, lang);
    let finalState: GameState = {
      ...prevState,
      spe_active: false,
      handover_to_shift: null,
      mission_hours: Math.max(prevState.mission_hours, prevState.shift >= 9 ? 72 : prevState.mission_hours),
      outcome: evalFinal.outcome === 'active' ? 'stable' : evalFinal.outcome,
      failure_reason: evalFinal.failureReason,
      stress_reasons: evalFinal.stressReasons,
      phase: 'debrief',
    };
    finalState = checkAndAwardEndgameAchievement(finalState);
    return finalState;
  }

  // Transition immediately into next Shift (no inter-shift wait)
  const nextShift = Math.min(9, prevState.shift + 1) as ShiftNumber;
  const meta = SHIFT_TIMELINE_META[nextShift];
  const nextState: GameState = {
    ...prevState,
    shift: nextShift,
    mission_hours: Math.max(prevState.mission_hours, meta.startHour),
    handover_to_shift: null,
    last_consequence: null,
    shift_mission_accepted: false,
    quest_step: 'briefing',
    quest_knowledge_read: false,
    quest_exec_deadline_ms: null,
    quest_failed_parts_needed: false,
    quest_salvage_target_item: null,
    spe_active: nextShift === 8,
    dust_storm_active: nextShift === 5,
    thermal_drop_active: nextShift === 3 || nextShift === 6,
    phase: 'playing',
  };
  nextState.unlocked_rooms = computeUnlockedRooms(nextState);
  return nextState;
}

export function completeShiftHandover(prevState: GameState): GameState {
  if (!prevState.handover_to_shift) return prevState;
  const nextShift = prevState.handover_to_shift;
  const meta = SHIFT_TIMELINE_META[nextShift];
  const nextState: GameState = {
    ...prevState,
    shift: nextShift,
    mission_hours: Math.max(prevState.mission_hours, meta.startHour),
    handover_to_shift: null,
    shift_mission_accepted: false,
    quest_step: 'briefing',
    quest_knowledge_read: false,
    quest_exec_deadline_ms: null,
    quest_failed_parts_needed: false,
    quest_salvage_target_item: null,
    spe_active: nextShift === 8,
    dust_storm_active: nextShift === 5,
    thermal_drop_active: nextShift === 3 || nextShift === 6,
    phase: 'playing',
  };
  nextState.unlocked_rooms = computeUnlockedRooms(nextState);
  return nextState;
}

export function applyRoverHaul(prevState: GameState, collected: Partial<SupplyInventory>): GameState {
  const nextInv = { ...prevState.inventory };
  let totalAdded = 0;
  (Object.keys(collected) as (keyof SupplyInventory)[]).forEach((k) => {
    const qty = collected[k] ?? 0;
    if (qty > 0) {
      nextInv[k] = (nextInv[k] ?? 0) + qty;
      totalAdded += qty;
    }
  });

  // Resolve Step 4 Salvage Sub-Quest automatically if player now has the replacement part!
  const targetPart = prevState.quest_salvage_target_item;
  const salvagedTarget =
    prevState.quest_failed_parts_needed &&
    targetPart !== null &&
    (nextInv[targetPart] ?? 0) > 0;

  const nextRunsSinceMaint =
    totalAdded > 0 ? prevState.rover_runs_since_maintenance + 1 : prevState.rover_runs_since_maintenance;

  return {
    ...prevState,
    inventory: nextInv,
    rover_runs_completed: totalAdded > 0 ? prevState.rover_runs_completed + 1 : prevState.rover_runs_completed,
    rover_cooldown_until: totalAdded > 0 ? Date.now() + 10000 : prevState.rover_cooldown_until,
    rover_runs_since_maintenance: nextRunsSinceMaint,
    rover_needs_maintenance: prevState.rover_needs_maintenance || nextRunsSinceMaint >= 3,
    quest_failed_parts_needed: salvagedTarget ? false : prevState.quest_failed_parts_needed,
    quest_salvage_target_item: salvagedTarget ? null : prevState.quest_salvage_target_item,
    quest_step: salvagedTarget ? 'accepted' : prevState.quest_step,
  };
}

export function triggerRoverBreakdown(prevState: GameState): GameState {
  return {
    ...prevState,
    rover_needs_maintenance: true,
  };
}

export function repairEvaRover(prevState: GameState): GameState {
  const nextInv = { ...prevState.inventory };
  if ((nextInv.scrap_metal ?? 0) > 0) {
    nextInv.scrap_metal -= 1;
  }
  return {
    ...prevState,
    inventory: nextInv,
    rover_needs_maintenance: false,
    rover_runs_since_maintenance: 0,
  };
}

export function completeShiftRepairProcedure(
  prevState: GameState,
  shift: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8,
): GameState {
  const proc = REPAIR_PROCEDURES[shift];
  const nextInv = { ...prevState.inventory };
  const part = proc.requiredPart;
  if ((nextInv[part] ?? 0) > 0) {
    nextInv[part] -= 1;
  }
  const nextRepaired = prevState.repaired_shifts.includes(shift)
    ? prevState.repaired_shifts
    : [...prevState.repaired_shifts, shift];
  return {
    ...prevState,
    inventory: nextInv,
    repaired_shifts: nextRepaired,
    malfunction_until: 0,
    quest_exec_deadline_ms: null,
    quest_failed_parts_needed: false,
    quest_salvage_target_item: null,
  };
}

export function triggerShiftMalfunction(prevState: GameState, durationMs = 10000): GameState {
  return {
    ...prevState,
    malfunction_until: Date.now() + durationMs,
  };
}

export function upgradeBaseRadar(prevState: GameState): GameState {
  if (prevState.eva_radar_level >= 3) return prevState;
  const scrapNeed = prevState.eva_radar_level === 1 ? 2 : 3;
  const elecNeed = prevState.eva_radar_level === 1 ? 1 : 2;
  if (
    (prevState.inventory.scrap_metal ?? 0) < scrapNeed ||
    (prevState.inventory.electronic_parts ?? 0) < elecNeed
  ) {
    return prevState;
  }
  return {
    ...prevState,
    eva_radar_level: (prevState.eva_radar_level + 1) as 1 | 2 | 3,
    inventory: {
      ...prevState.inventory,
      scrap_metal: prevState.inventory.scrap_metal - scrapNeed,
      electronic_parts: prevState.inventory.electronic_parts - elecNeed,
    },
  };
}

export function unlockEvaSector(prevState: GameState, sectorId: EvaSectorId): GameState {
  if (prevState.unlocked_sectors.includes(sectorId)) return prevState;
  const meta = EVA_SECTORS_META[sectorId];
  if (prevState.eva_radar_level < meta.minRadarLevel) return prevState;
  if (
    (prevState.inventory.scrap_metal ?? 0) < meta.scrapCost ||
    (prevState.inventory.electronic_parts ?? 0) < meta.elecCost
  ) {
    return prevState;
  }

  let nextState: GameState = {
    ...prevState,
    unlocked_sectors: [...prevState.unlocked_sectors, sectorId],
    inventory: {
      ...prevState.inventory,
      scrap_metal: prevState.inventory.scrap_metal - meta.scrapCost,
      electronic_parts: prevState.inventory.electronic_parts - meta.elecCost,
    },
  };
  nextState = awardAchievement(nextState, meta.achievementId);
  return nextState;
}

export function operateLifeSupport(
  prevState: GameState,
  action: 'ogs' | 'wrs' | 'craft_hepa' | 'craft_ki' | 'harvest_spirulina' | 'eat_ration',
): GameState {
  const nextInv = { ...prevState.inventory };
  const nextEclss = { ...prevState.eclss };
  let nextWater = prevState.water;
  let nextAir = prevState.air_quality_score;
  let nextBattery = prevState.battery;
  let nextHealth = prevState.crew_health;
  let nextRad = prevState.radiation_risk;

  if (action === 'ogs') {
    if (nextWater <= 1 || nextBattery <= 0) return prevState;
    nextWater -= 1;
    nextBattery = Math.max(0, nextBattery - 1);
    nextEclss.o2_kpa = clamp(nextEclss.o2_kpa + 1.4, 15, 22.0);
    nextAir = clamp(nextAir + 8, 0, 100);
  } else if (action === 'wrs') {
    if (nextBattery <= 0) return prevState;
    nextBattery = Math.max(0, nextBattery - 1);
    nextWater = Math.min(12, nextWater + 2);
    nextEclss.water_l_day = clamp(nextEclss.water_l_day + 0.5, 0.5, 3.2);
  } else if (action === 'craft_hepa') {
    if ((nextInv.scrap_metal ?? 0) < 2) return prevState;
    nextInv.scrap_metal -= 2;
    nextInv.hepa_filter = (nextInv.hepa_filter ?? 0) + 1;
  } else if (action === 'craft_ki') {
    if ((nextInv.electronic_parts ?? 0) < 1 || (nextInv.scrap_metal ?? 0) < 1) return prevState;
    nextInv.electronic_parts -= 1;
    nextInv.scrap_metal -= 1;
    nextInv.ki_pills = (nextInv.ki_pills ?? 0) + 1;
  } else if (action === 'harvest_spirulina') {
    if (prevState.crops.spirulina.growth < 40) return prevState;
    nextInv.spirulina_ration = (nextInv.spirulina_ration ?? 0) + 1;
    return {
      ...prevState,
      inventory: nextInv,
      eclss: {
        ...nextEclss,
        o2_kpa: clamp(nextEclss.o2_kpa + 0.3, 15, 22.0),
      },
      crops: {
        ...prevState.crops,
        spirulina: {
          ...prevState.crops.spirulina,
          growth: Math.max(25, prevState.crops.spirulina.growth - 30),
        },
      },
    };
  } else if (action === 'eat_ration') {
    if ((nextInv.spirulina_ration ?? 0) <= 0) return prevState;
    nextInv.spirulina_ration -= 1;
    nextEclss.calories_kcal = clamp(nextEclss.calories_kcal + 450, 1500, 3150);
    nextHealth = clamp(nextHealth + 4, 0, 100);
  }

  return {
    ...prevState,
    inventory: nextInv,
    eclss: nextEclss,
    water: nextWater,
    battery: nextBattery,
    air_quality_score: nextAir,
    crew_health: nextHealth,
    radiation_risk: nextRad,
  };
}

export function careForCrop(
  prevState: GameState,
  cropId: CropId,
  action: 'water' | 'led' | 'pollinate',
): GameState {
  const prevCrop = prevState.crops[cropId];
  const nextCrop: CropState = { ...prevCrop };
  let plantBoost = 0;
  let airBoost = 0;
  let o2Boost = 0;

  if (action === 'water') {
    nextCrop.watered = true;
    nextCrop.growth = clamp(nextCrop.growth + 12, 0, 100);
    plantBoost = 4;
  } else if (action === 'led') {
    const nextMode =
      prevCrop.ledMode === 'red_blue'
        ? 'full_bright'
        : prevCrop.ledMode === 'full_bright'
          ? 'off'
          : 'red_blue';
    nextCrop.ledMode = nextMode;
    const isOptimal =
      (cropId === 'wheat' || cropId === 'spirulina'
        ? nextMode === 'full_bright'
        : nextMode === 'red_blue');
    if (isOptimal) {
      nextCrop.growth = clamp(nextCrop.growth + 10, 0, 100);
      plantBoost = 5;
      if (cropId === 'wheat' || cropId === 'spirulina') {
        airBoost = 3;
        o2Boost = 0.25;
      }
    }
  } else if (action === 'pollinate') {
    nextCrop.pollinated = true;
    nextCrop.growth = clamp(nextCrop.growth + 12, 0, 100);
    plantBoost = 6;
  }

  return {
    ...prevState,
    plant_health: clamp(prevState.plant_health + plantBoost, 0, 100),
    air_quality_score: clamp(prevState.air_quality_score + airBoost, 0, 100),
    eclss: {
      ...prevState.eclss,
      o2_kpa: clamp(prevState.eclss.o2_kpa + o2Boost, 15, 22.0),
    },
    crops: {
      ...prevState.crops,
      [cropId]: nextCrop,
    },
  };
}

function cureSpecificAilment(
  prevState: GameState,
  ailmentId: SpaceAilmentId,
  healthBonus: number,
): {
  crew_health: number;
  active_ailments: SpaceAilmentId[];
  cured_ailments: SpaceAilmentId[];
} {
  const wasActive = prevState.active_ailments.includes(ailmentId);
  const nextActive = prevState.active_ailments.filter((a) => a !== ailmentId);
  const nextCured =
    wasActive && !prevState.cured_ailments.includes(ailmentId)
      ? [...prevState.cured_ailments, ailmentId]
      : prevState.cured_ailments;
  return {
    crew_health: clamp(prevState.crew_health + healthBonus, 0, 100),
    active_ailments: nextActive,
    cured_ailments: nextCured,
  };
}

export function runAredExercise(prevState: GameState): GameState {
  const alreadyThisShift = prevState.ared_exercised_shifts.includes(prevState.shift);
  const nextShifts = alreadyThisShift
    ? prevState.ared_exercised_shifts
    : [...prevState.ared_exercised_shifts, prevState.shift];
  const healed = cureSpecificAilment(prevState, 'muscle_bone_loss', alreadyThisShift ? 2 : 8);
  return {
    ...prevState,
    ared_exercised_shifts: nextShifts,
    ...healed,
  };
}

export function cleanAirlockHepa(prevState: GameState): GameState {
  const healed = cureSpecificAilment(prevState, 'lunar_dust_pneumonia', prevState.airlock_hepa_cleaned ? 2 : 12);
  return {
    ...prevState,
    airlock_hepa_cleaned: true,
    ...healed,
  };
}

export function treatAilment(
  prevState: GameState,
  ailmentId: SpaceAilmentId,
  method: 'med_kit' | 'botany_tomato' | 'botany_wheat' | 'hepa' | 'ared' | 'ki_pills',
): GameState {
  if (method === 'hepa') return cleanAirlockHepa(prevState);
  if (method === 'ared') return runAredExercise(prevState);

  const nextInv = { ...prevState.inventory };
  if (method === 'med_kit') {
    if ((nextInv.med_kit ?? 0) <= 0) return prevState;
    nextInv.med_kit -= 1;
  } else if (method === 'ki_pills') {
    if ((nextInv.ki_pills ?? 0) <= 0) return prevState;
    nextInv.ki_pills -= 1;
  }

  const healed = cureSpecificAilment(prevState, ailmentId, 16);
  return {
    ...prevState,
    inventory: nextInv,
    radiation_risk:
      method === 'ki_pills' && prevState.radiation_risk === 'at-risk'
        ? 'protected-risk'
        : prevState.radiation_risk,
    air_quality_score:
      method === 'botany_wheat'
        ? clamp(prevState.air_quality_score + 6, 0, 100)
        : prevState.air_quality_score,
    ...healed,
  };
}
