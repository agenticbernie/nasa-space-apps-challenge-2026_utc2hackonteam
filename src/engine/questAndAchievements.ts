import {
  AchievementId,
  EvaSectorId,
  GameState,
  Language,
  ShiftNumber,
  SupplyItemId,
} from './types';

// =====================================================
// 1. ASTRONAUT CALLSIGN VALIDATOR (STRICT REGEX)
// =====================================================
export const CALLSIGN_REGEX = /^[a-zA-Z_]+$/;

export interface CallsignValidationResult {
  valid: boolean;
  errorMessage: string | null;
}

export function validateAstronautCallsign(
  raw: string,
  lang: Language = 'vi',
): CallsignValidationResult {
  const en = lang === 'en';
  if (!raw || raw.length === 0) {
    return {
      valid: false,
      errorMessage: en
        ? 'Enter your Astronaut Callsign (letters a-z, A-Z and underscore _ only).'
        : 'Vui lòng nhập định danh Phi hành gia (chỉ gồm chữ cái a-z, A-Z và dấu gạch dưới _).',
    };
  }
  if (!CALLSIGN_REGEX.test(raw)) {
    return {
      valid: false,
      errorMessage: en
        ? 'Invalid format! Only English letters (a-z, A-Z) and underscore (_) are allowed. No numbers, spaces, or symbols.'
        : 'Sai định dạng! Chỉ cho phép chữ cái không dấu (a-z, A-Z) và dấu gạch dưới (_). Không được chứa số, khoảng trắng hay ký tự đặc biệt.',
    };
  }
  if (raw.length < 2) {
    return {
      valid: false,
      errorMessage: en
        ? 'Callsign must be at least 2 characters long.'
        : 'Định danh phải có ít nhất 2 ký tự.',
    };
  }
  if (raw.length > 24) {
    return {
      valid: false,
      errorMessage: en
        ? 'Callsign cannot exceed 24 characters.'
        : 'Định danh không được dài quá 24 ký tự.',
    };
  }
  return { valid: true, errorMessage: null };
}

// =====================================================
// 2. 9-SHIFT / 72-HOUR TIMELINE MANAGER (3 SOLS x 3 SHIFTS)
// =====================================================
export interface ShiftTimelineMeta {
  shift: ShiftNumber;
  sol: 1 | 2 | 3;
  startHour: number;
  endHour: number;
  hazardKind: 'none' | 'thermal_drop' | 'dust_storm' | 'radiation_storm' | 'hls_landing';
  labelVi: string;
  labelEn: string;
  milestoneAchievement: AchievementId;
}

export const SHIFT_TIMELINE_META: Record<ShiftNumber, ShiftTimelineMeta> = {
  1: {
    shift: 1,
    sol: 1,
    startHour: 0,
    endHour: 8,
    hazardKind: 'none',
    labelVi: 'Ca 1 · Chạm đất Cực Nam',
    labelEn: 'Shift 1 · South Pole Touchdown',
    milestoneAchievement: 'shift_1_touchdown',
  },
  2: {
    shift: 2,
    sol: 1,
    startHour: 8,
    endHour: 16,
    hazardKind: 'none',
    labelVi: 'Ca 2 · Điện phân Oxy OGS',
    labelEn: 'Shift 2 · OGS Oxygen Split',
    milestoneAchievement: 'shift_2_electrolysis',
  },
  3: {
    shift: 3,
    sol: 1,
    startHour: 16,
    endHour: 24,
    hazardKind: 'thermal_drop',
    labelVi: 'Ca 3 · Đêm Cực Lạnh -170°C',
    labelEn: 'Shift 3 · First Night -170°C',
    milestoneAchievement: 'shift_3_first_night',
  },
  4: {
    shift: 4,
    sol: 2,
    startHour: 24,
    endHour: 32,
    hazardKind: 'none',
    labelVi: 'Ca 4 · Tái chế Nước WRS',
    labelEn: 'Shift 4 · WRS Water Loop',
    milestoneAchievement: 'shift_4_water_loop',
  },
  5: {
    shift: 5,
    sol: 2,
    startHour: 32,
    endHour: 40,
    hazardKind: 'dust_storm',
    labelVi: 'Ca 5 · Bão Bụi Regolith',
    labelEn: 'Shift 5 · Regolith Dust Storm',
    milestoneAchievement: 'shift_5_dust_storm',
  },
  6: {
    shift: 6,
    sol: 2,
    startHour: 40,
    endHour: 48,
    hazardKind: 'thermal_drop',
    labelVi: 'Ca 6 · Vườn Thủy Canh Veggie',
    labelEn: 'Shift 6 · Veggie Algae Night',
    milestoneAchievement: 'shift_6_veggie_bloom',
  },
  7: {
    shift: 7,
    sol: 3,
    startHour: 48,
    endHour: 56,
    hazardKind: 'none',
    labelVi: 'Ca 7 · Lọc Khí CO₂ CDRA',
    labelEn: 'Shift 7 · CO₂ Scrubber Surge',
    milestoneAchievement: 'shift_7_co2_balance',
  },
  8: {
    shift: 8,
    sol: 3,
    startHour: 56,
    endHour: 64,
    hazardKind: 'radiation_storm',
    labelVi: 'Ca 8 · Bão Bức Xạ Mặt Trời',
    labelEn: 'Shift 8 · Solar Proton Storm',
    milestoneAchievement: 'shift_8_solar_shield',
  },
  9: {
    shift: 9,
    sol: 3,
    startHour: 64,
    endHour: 72,
    hazardKind: 'hls_landing',
    labelVi: 'Ca 9 · Đón Tàu Starship HLS',
    labelEn: 'Shift 9 · Starship HLS Docking',
    milestoneAchievement: 'shift_9_hls_rendezvous',
  },
};

export function formatMissionClock(hours: number): string {
  const clamped = Math.max(0, Math.min(72, hours));
  const wholeHours = Math.floor(clamped);
  const mins = Math.min(59, Math.floor((clamped - wholeHours) * 60));
  return `${String(wholeHours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}

export function getSolFromShift(shift: ShiftNumber): 1 | 2 | 3 {
  return SHIFT_TIMELINE_META[shift].sol;
}

// =====================================================
// 3. STRICT 4-STEP QUEST STATE MACHINE DEFINITIONS
// =====================================================
export interface QuestDefinition {
  shift: ShiftNumber;
  requiredPart: SupplyItemId | null;
  execDurationSec: number;
  briefingTitleVi: string;
  briefingTitleEn: string;
  briefingCauseVi: string;
  briefingCauseEn: string;
  briefingRiskVi: string;
  briefingRiskEn: string;
  nasaModuleTitleVi: string;
  nasaModuleTitleEn: string;
  nasaModuleCode: string;
  nasaFactsVi: string[];
  nasaFactsEn: string[];
  subQuestTitleVi: string;
  subQuestTitleEn: string;
  subQuestDescVi: string;
  subQuestDescEn: string;
}

export const QUEST_DEFINITIONS: Record<ShiftNumber, QuestDefinition> = {
  1: {
    shift: 1,
    requiredPart: 'solar_cell',
    execDurationSec: 55,
    briefingTitleVi: 'Sụt áp Mảng Pin Mặt Trời Solar Ridge',
    briefingTitleEn: 'Solar Ridge Array Voltage Drop',
    briefingCauseVi:
      'Góc Mặt Trời Cực Nam chỉ ~3° kết hợp bụi tĩnh điện regolith che khuất 50% cell quang điện.',
    briefingCauseEn:
      'Low 3° Lunar South Pole grazing sunlight and electrostatic regolith dust shaded 50% of solar cells.',
    briefingRiskVi: 'Nếu bỏ qua: Bơm khí O₂ & sưởi ấm mất điện khi trạm bước vào bóng tối.',
    briefingRiskEn: 'If ignored: O₂ blowers and thermal heaters brown out as shadows lengthen.',
    nasaModuleTitleVi: 'Hướng dẫn Kỹ thuật BVAD: Quy trình Ưu tiên Điện & Lắp Pin Phụ',
    nasaModuleTitleEn: 'BVAD Engineering Guide: Power Priority & Aux Cell Mounting',
    nasaModuleCode: 'BVAD TP-2021-220419 · Polar Solar',
    nasaFactsVi: [
      '1. Luôn ngắt cầu dao mạch phụ trước khi gắn tấm pin quang điện để tránh hồ quang điện.',
      '2. Lắp Tấm pin phụ (Aux Cell) thu hồi từ tàu khảo sát vào thanh nối.',
      '3. Đóng lại cầu dao và ưu tiên nguồn cho Hệ thống Sống (ECLSS) trước tải phụ.',
    ],
    nasaFactsEn: [
      '1. Always isolate the auxiliary breaker before mounting photovoltaic cells to prevent arc faults.',
      '2. Mount the salvaged Aux Solar Cell cleanly into the array bus.',
      '3. Re-close the breaker and allocate power to Life Support (ECLSS) first.',
    ],
    subQuestTitleVi: 'Nhiệm vụ phụ: Tìm kiếm vật tư thay thế (Tấm pin phụ)',
    subQuestTitleEn: 'Sub-Quest: Search for Replacement Parts (Aux Solar Cell)',
    subQuestDescVi:
      'Thao tác sai hoặc hết giờ đã làm hỏng tế bào pin! Hãy mở Bản đồ EVA để thu hồi Tấm pin phụ từ xác Rover/tàu cũ.',
    subQuestDescEn:
      'Procedure error or timeout destroyed the solar cell! Open the EVA Surface Map to salvage a replacement Aux Solar Cell.',
  },
  2: {
    shift: 2,
    requiredPart: 'water_filter',
    execDurationSec: 60,
    briefingTitleVi: 'Áp suất Máy Điện Phân Oxy OGS Suy Giảm',
    briefingTitleEn: 'OGS Oxygen Electrolysis Pressure Drop',
    briefingCauseVi:
      'Cặn khoáng và bụi mịn làm nghẹt buồng cấp nước cất cho máy điện phân OGS (tách H₂O thành O₂).',
    briefingCauseEn:
      'Mineral fouling and fine dust clogged the clean water feed supplying the OGS oxygen generator.',
    briefingRiskVi: 'Nếu bỏ qua: Áp suất riêng phần O₂ tụt dưới ngưỡng an toàn 19.5 kPa.',
    briefingRiskEn: 'If ignored: Cabin O₂ partial pressure drops below the safe 19.5 kPa limit.',
    nasaModuleTitleVi: 'Hướng dẫn Kỹ thuật ECLSS: Điện phân Nước OGS & Thay Lõi Lọc',
    nasaModuleTitleEn: 'ECLSS Engineering Guide: OGS Water Electrolysis & Filter Swap',
    nasaModuleCode: 'ECLSS ICES-2023-142',
    nasaFactsVi: [
      '1. Khóa van giảm áp đường ống trước khi mở khoang lõi lọc để tránh văng nước áp suất cao.',
      '2. Thay lõi lọc nước sạch nhằm bảo vệ màng điện phân OGS (2H₂O → 2H₂ + O₂).',
      '3. Khởi động bơm áp suất và kiểm tra oxy đạt chuẩn 21.3 kPa (tiêu thụ 0.035 kg/giờ).',
    ],
    nasaFactsEn: [
      '1. Depressurize the water feed valve before opening the filter housing.',
      '2. Insert a clean water cartridge to protect the OGS electrolysis stack (2H₂O → 2H₂ + O₂).',
      '3. Restart the circulation pump and verify cabin O₂ returns to 21.3 kPa (0.035 kg/hr burn).',
    ],
    subQuestTitleVi: 'Nhiệm vụ phụ: Tìm kiếm vật tư thay thế (Lõi lọc nước)',
    subQuestTitleEn: 'Sub-Quest: Search for Replacement Parts (Water Filter)',
    subQuestDescVi:
      'Lõi lọc đã vỡ do sai áp suất! Điều khiển đội EVA trên bản đồ bề mặt Mặt Trăng để tháo lõi lọc thay thế.',
    subQuestDescEn:
      'Filter cartridge ruptured! Use the Click-to-Move EVA Surface Map to salvage a spare Water Filter.',
  },
  3: {
    shift: 3,
    requiredPart: 'rad_shield',
    execDurationSec: 60,
    briefingTitleVi: 'Đêm Cực Nam Lạnh -170°C & Giảm Nhiệt Bus',
    briefingTitleEn: 'First Polar Shadow Drop (-170°C Thermal Crisis)',
    briefingCauseVi:
      'Bóng miệng hố thiên thạch che khuất Mặt Trời 8 giờ, nhiệt độ vỏ ngoài tụt xuống -170°C.',
    briefingCauseEn:
      'Crater rim shadow plunges outside hull temperatures to -170°C across the 8-hour shift.',
    briefingRiskVi: 'Nếu bỏ qua: Thân nhiệt phi hành đoàn giảm dưới 35.5°C, pin mất dung lượng.',
    briefingRiskEn: 'If ignored: Crew body temperature drops toward hypothermia and batteries freeze.',
    nasaModuleTitleVi: 'Hướng dẫn Kỹ thuật Nhiệt: Cách Nhiệt Đa Lớp & Vách Chắn',
    nasaModuleTitleEn: 'Thermal Engineering Guide: Multi-Layer Insulation & Bulkhead Seal',
    nasaModuleCode: 'HRP & LOLA Crater Illumination',
    nasaFactsVi: [
      '1. Đóng chặt gioăng áp suất cửa hầm giữ nhiệt trước khi lắp tấm chắn.',
      '2. Ốp tấm chắn cách nhiệt & túi nước lên vách khoang sinh hoạt để ổn định 37.0°C.',
      '3. Kích hoạt cảm biến nhiệt và theo dõi mức sưởi ấm an toàn suốt đêm.',
    ],
    nasaFactsEn: [
      '1. Lock the outer bulkhead pressure gasket tightly before mounting thermal plates.',
      '2. Mount insulation/water-wall barrier plates to stabilize cabin and crew at 37.0°C.',
      '3. Activate thermal sensors and verify steady heat retention.',
    ],
    subQuestTitleVi: 'Nhiệm vụ phụ: Tìm kiếm vật tư thay thế (Tấm chắn nhiệt/bức xạ)',
    subQuestTitleEn: 'Sub-Quest: Search for Replacement Parts (Shield Plate)',
    subQuestDescVi:
      'Tấm cách nhiệt bị nứt! Hãy ra bản đồ EVA ngoài trạm thu hồi tấm chắn thay thế ngay.',
    subQuestDescEn:
      'Barrier plate cracked! Salvage a replacement Shield Plate on the EVA Surface Map.',
  },
  4: {
    shift: 4,
    requiredPart: 'water_filter',
    execDurationSec: 60,
    briefingTitleVi: 'Tắc Nghẽn Hệ Thống Tái Chế Nước WRS (98%)',
    briefingTitleEn: 'WRS Water Recovery System Fouling',
    briefingCauseVi:
      'Nước ngưng tụ và hơi thở đoàn có lẫn vi bụi tĩnh điện làm nghẽn vòng tái chế WRS.',
    briefingCauseEn:
      'Condensed cabin humidity mixed with static regolith dust fouled the 98% WRS recycling loop.',
    briefingRiskVi: 'Nếu bỏ qua: Khẩu phần nước tụt dưới mức tối thiểu 2.5 L/ngày.',
    briefingRiskEn: 'If ignored: Daily hydration falls below the 2.5 L/day life-support minimum.',
    nasaModuleTitleVi: 'Hướng dẫn Kỹ thuật WRS: Duy Trì Chu Trình Nước 98%',
    nasaModuleTitleEn: 'WRS Engineering Guide: Sustaining 98% Water Recovery',
    nasaModuleCode: 'ECLSS Water Recovery Assembly',
    nasaFactsVi: [
      '1. Ngắt bơm tuần hoàn WRS để xả áp an toàn trước khi mở khoang lọc.',
      '2. Thay lõi lọc nước tinh khiết mới đạt chuẩn uống cho phi hành gia (2.5–3.0 L/ngày).',
      '3. Khởi động lại cảm biến độ tinh khiết trước khi cấp nước lại cho khoang ở.',
    ],
    nasaFactsEn: [
      '1. Depressurize the WRS loop valve before opening the filter housing.',
      '2. Install a clean water cartridge to sustain 2.5–3.0 L/day crew hydration.',
      '3. Restart pump sensors and verify 98% recovery purity.',
    ],
    subQuestTitleVi: 'Nhiệm vụ phụ: Tìm kiếm vật tư thay thế (Lõi lọc nước WRS)',
    subQuestTitleEn: 'Sub-Quest: Search for Replacement Parts (WRS Filter)',
    subQuestDescVi:
      'Linh kiện lọc bị hỏng! Dùng bản đồ EVA tìm kiếm lõi lọc dự phòng từ xác thiết bị cũ.',
    subQuestDescEn:
      'Filter unit damaged! Salvage a replacement Water Filter from derelict EVA probes.',
  },
  5: {
    shift: 5,
    requiredPart: 'hepa_filter',
    execDurationSec: 65,
    briefingTitleVi: 'Bão Bụi Tĩnh Điện Regolith & Hư Hỏng Lọc HEPA',
    briefingTitleEn: 'Electrostatic Regolith Dust Storm & HEPA Breach',
    briefingCauseVi:
      'Bão bụi Mặt Trăng mang hạt silicat sắc như thủy tinh vụn lọt qua gioăng Airlock làm rách màng lọc.',
    briefingCauseEn:
      'Electrostatically levitated lunar regolith shards slipped through the Airlock seal, tearing HEPA media.',
    briefingRiskVi: 'Nếu bỏ qua: Đoàn mắc bệnh Phổi Bụi Mặt Trăng (Regolith Dust Lung).',
    briefingRiskEn: 'If ignored: Crew suffers severe Lunar Regolith Dust Lung inhalation.',
    nasaModuleTitleVi: 'Hướng dẫn Lọc Bụi Vũ Trụ: Thay Bộ Lọc HEPA 99.97%',
    nasaModuleTitleEn: 'Lunar Dust Guide: 99.97% HEPA Filter Replacement',
    nasaModuleCode: 'Space Medicine · SCI-11',
    nasaFactsVi: [
      '1. Khóa kín cửa Airlock ngoài để chặn luồng bụi tĩnh điện từ bề mặt Mặt Trăng.',
      '2. Lắp Bộ lọc HEPA mới (chặn hạt < 0.3 micromet) hoặc chế tạo tại Khoang Y Tế từ phế liệu.',
      '3. Bật quạt tuần hoàn sạch bụi trong khoang trước khi mở mũ bảo hộ.',
    ],
    nasaFactsEn: [
      '1. Seal the outer Airlock hatch to block electrostatically charged lunar dust.',
      '2. Insert a fresh HEPA Filter (<0.3 µm capture; craftable in Medical Bay from scrap).',
      '3. Purge cabin particulate air before unsealing helmets.',
    ],
    subQuestTitleVi: 'Nhiệm vụ phụ: Tìm kiếm vật tư thay thế (Bộ lọc HEPA)',
    subQuestTitleEn: 'Sub-Quest: Search for Replacement Parts (HEPA Filter)',
    subQuestDescVi:
      'Màng lọc HEPA bị xé rách! Hãy tìm kiếm vật tư trên bản đồ EVA hoặc thu gom phế liệu về chế tạo.',
    subQuestDescEn:
      'HEPA filter torn! Salvage a HEPA Filter or scrap metal via the Click-to-Move EVA Map.',
  },
  6: {
    shift: 6,
    requiredPart: 'hardy_seeds',
    execDurationSec: 60,
    briefingTitleVi: 'Suy Thoái Vườn Thực Vật Veggie & Tảo Spirulina',
    briefingTitleEn: 'Veggie Hydroponics & Spirulina Bio-Drop',
    briefingCauseVi:
      'Đêm Cực Nam thứ hai và sụt ánh sáng làm tảo Spirulina & rau thủy canh giảm tốc độ quang hợp.',
    briefingCauseEn:
      'Second polar cold shift reduced LED photosynthesis in Spirulina bioreactors and Veggie trays.',
    briefingRiskVi: 'Nếu bỏ qua: Năng lượng dự trữ tụt dưới 2500 kcal/ngày và giảm sản lượng O₂ sinh học.',
    briefingRiskEn: 'If ignored: Crew energy drops below 2500 kcal/day and bio-O₂ output stalls.',
    nasaModuleTitleVi: 'Hướng dẫn Sinh Học Veggie: Tảo Spirulina & Quang hợp Đèn LED',
    nasaModuleTitleEn: 'Veggie Botany Guide: Spirulina Algae & Red-Blue LED',
    nasaModuleCode: 'GeneLab OSD-766 & Bio-Regenerative',
    nasaFactsVi: [
      '1. Hiệu chỉnh phổ đèn LED Đỏ–Xanh lam (660/450 nm) tối ưu cho diệp lục.',
      '2. Gieo bổ sung Hạt giống chịu bức xạ & cấy giống tảo Spirulina giàu protein.',
      '3. Bật sương thủy canh tuần hoàn để phục hồi sản lượng calo (2500–3000 kcal/ngày) và O₂.',
    ],
    nasaFactsEn: [
      '1. Calibrate Red–Blue LED spectrum (660/450 nm) for peak chlorophyll absorption.',
      '2. Reseed hardy Veggie crops and Spirulina algae trays.',
      '3. Start nutrient misting to restore 2500–3000 kcal/day nutrition and O₂.',
    ],
    subQuestTitleVi: 'Nhiệm vụ phụ: Tìm kiếm vật tư thay thế (Hạt giống không gian)',
    subQuestTitleEn: 'Sub-Quest: Search for Replacement Parts (Hardy Seeds)',
    subQuestDescVi:
      'Khay giống bị úng hỏng! Hãy lái robot thu hồi ống hạt giống dự phòng từ tàu khảo sát ngoài trạm.',
    subQuestDescEn:
      'Seed pillows flooded! Salvage replacement Hardy Space Seeds via the EVA Surface Map.',
  },
  7: {
    shift: 7,
    requiredPart: 'lioh_filter',
    execDurationSec: 60,
    briefingTitleVi: 'Quá Tải Hộp Hấp Thụ Khí CO₂ (CDRA / LiOH)',
    briefingTitleEn: 'CDRA / LiOH CO₂ Scrubber Saturation',
    briefingCauseVi:
      'Hộp hóa chất Lithium Hydroxide (LiOH) đã bão hòa, nồng độ CO₂ trong cabin vượt 5.3 mmHg.',
    briefingCauseEn:
      'Lithium Hydroxide CO₂ canisters saturated, pushing cabin CO₂ above the safe 5.3 mmHg limit.',
    briefingRiskVi: 'Nếu bỏ qua: Phi hành đoàn đau đầu, chóng mặt và suy giảm nhận thức.',
    briefingRiskEn: 'If ignored: Crew develops CO₂ hypercapnia, headaches, and impaired judgment.',
    nasaModuleTitleVi: 'Hướng dẫn Kỹ thuật ECLSS: Thay Hộp Hấp Thụ LiOH An Toàn',
    nasaModuleTitleEn: 'ECLSS Engineering Guide: Safe LiOH Canister Replacement',
    nasaModuleCode: 'Life Support · CO₂ < 5.3 mmHg',
    nasaFactsVi: [
      '1. Tắt quạt hút tuần hoàn CDRA đang chạy tốc độ cao trước khi mở khoang chứa.',
      '2. Lắp hộp hóa chất LiOH mới (2LiOH + CO₂ → Li₂CO₃ + H₂O) vào đúng rãnh khóa.',
      '3. Khởi động lại luồng khí và kiểm tra chỉ số không khí vượt 85/100.',
    ],
    nasaFactsEn: [
      '1. Power down the high-speed CDRA air blower before unlatching the bay.',
      '2. Lock a fresh LiOH canister (2LiOH + CO₂ → Li₂CO₃ + H₂O) into the scrubber slot.',
      '3. Restart airflow and confirm clean air rises above 85/100.',
    ],
    subQuestTitleVi: 'Nhiệm vụ phụ: Tìm kiếm vật tư thay thế (Bộ lọc CO₂ LiOH)',
    subQuestTitleEn: 'Sub-Quest: Search for Replacement Parts (LiOH Canister)',
    subQuestDescVi:
      'Hộp lọc LiOH bị biến dạng! Cần tìm kiếm hộp LiOH thay thế trên bản đồ EVA trước khi thử lại.',
    subQuestDescEn:
      'LiOH canister damaged! Locate a spare LiOH Canister on the EVA Surface Map.',
  },
  8: {
    shift: 8,
    requiredPart: 'ki_pills',
    execDurationSec: 65,
    briefingTitleVi: 'Bão Bức Xạ Hạt Mặt Trời Cực Đại (SPE X-Class)',
    briefingTitleEn: 'Extreme Solar Particle Radiation Storm (SPE)',
    briefingCauseVi:
      'Vụ nổ X-Class trên Mặt Trời phóng dòng proton tốc độ cao thẳng tới Cực Nam Mặt Trăng sau 30 phút.',
    briefingCauseEn:
      'X-class solar flare launches high-energy protons reaching the unshielded Moon in 30 minutes.',
    briefingRiskVi: 'Nếu bỏ qua: Liều bức xạ mSv tăng vọt gây Say Bức Xạ cấp tính.',
    briefingRiskEn: 'If ignored: Cumulative mSv spikes sharply, causing acute Radiation Sickness.',
    nasaModuleTitleVi: 'Hướng dẫn An Toàn Bức Xạ DONKI: Hầm Trú Ẩn & Thuốc KI',
    nasaModuleTitleEn: 'DONKI & Space Med Guide: Radiation Shelter & Potassium Iodide',
    nasaModuleCode: 'DONKI SEP & HRP SCI-05/06',
    nasaFactsVi: [
      '1. Đóng kín cửa hầm Shelter ốp túi nước dày để hấp thụ proton năng lượng cao.',
      '2. Chuẩn bị Viên Potassium Iodide (KI) bảo vệ tuyến giáp & tế bào (chế tạo tại Khoang Y Tế).',
      '3. Kích hoạt máy đo liều CRaTER theo dõi tổng bức xạ mSv trong suốt cơn bão.',
    ],
    nasaFactsEn: [
      '1. Seal the water-walled Radiation Shelter blast door to block high-energy protons.',
      '2. Prepare Potassium Iodide (KI) tablets to shield crew health (craftable in Medical Bay).',
      '3. Monitor the CRaTER dosimeter to keep cumulative mSv controlled.',
    ],
    subQuestTitleVi: 'Nhiệm vụ phụ: Tìm linh kiện điện tử để chế tạo/thu hồi KI',
    subQuestTitleEn: 'Sub-Quest: Salvage Parts for Potassium Iodide (KI)',
    subQuestDescVi:
      'Thiếu liều Potassium Iodide (KI)! Hãy ra bản đồ EVA thu hồi thuốc hoặc linh kiện điện tử để chế tạo tại Khoang Y Tế.',
    subQuestDescEn:
      'Potassium Iodide (KI) depleted! Salvage KI pills or electronic parts on the EVA Map to craft in Medical Bay.',
  },
  9: {
    shift: 9,
    requiredPart: null,
    execDurationSec: 75,
    briefingTitleVi: 'Điều Phối Tiếp Cận & Hạ Cánh SpaceX Starship HLS',
    briefingTitleEn: 'SpaceX Starship HLS Final Approach & Touchdown',
    briefingCauseVi:
      'Chỉ còn 8 giờ cuối trước khi tàu tiếp tế Starship HLS khai hỏa đáp xuống bãi Bắc Trạm Aurora.',
    briefingCauseEn:
      'Final 8 hours before SpaceX Starship HLS fires landing engines for Aurora North Pad touchdown.',
    briefingRiskVi: 'Nếu bỏ qua: Thiếu biên độ dự trữ khí thở hoặc điện cho đèn dẫn đường.',
    briefingRiskEn: 'If ignored: Landing beacon or Life Support safety margin fails during docking.',
    nasaModuleTitleVi: 'Hướng dẫn Giao Thức Artemis: Đón Tàu Đổ Bộ Starship HLS',
    nasaModuleTitleEn: 'Artemis Docking Guide: Starship HLS Touchdown Protocol',
    nasaModuleCode: 'Artemis Operations & HLS SCI-10',
    nasaFactsVi: [
      '1. Duy trì áp suất O₂ gần 21.3 kPa, nước > 2.5 L/ngày và thân nhiệt 37.0°C.',
      '2. Đóng các van cách ly chống bụi từ luồng phản lực hạ cánh của Starship HLS.',
      '3. Phân bổ nốt điện pin để bật đèn hiệu dẫn đường và sẵn sàng bàn giao.',
    ],
    nasaFactsEn: [
      '1. Maintain cabin O₂ near 21.3 kPa, water > 2.5 L/day, and body temp at 37.0°C.',
      '2. Seal exterior vents against rocket plume regolith ejecta during Starship touchdown.',
      '3. Allocate final battery margin to landing beacons and Life Support.',
    ],
    subQuestTitleVi: 'Kiểm tra dự trữ cuối cùng',
    subQuestTitleEn: 'Final Reserve Check',
    subQuestDescVi: 'Kiểm tra hệ thống Oxy, Nước và Vườn cây trước khi Starship hạ cánh.',
    subQuestDescEn: 'Verify O₂, Water, and Botany reserves prior to Starship touchdown.',
  },
};

// =====================================================
// 4. ACHIEVEMENT SYSTEM (9 SHIFTS + 3 SECTORS + 72H SURVIVOR)
// =====================================================
export interface AchievementMeta {
  id: AchievementId;
  category: 'shift' | 'sector' | 'grand';
  icon: string;
  titleVi: string;
  titleEn: string;
  descVi: string;
  descEn: string;
}

export const ACHIEVEMENTS_META: Record<AchievementId, AchievementMeta> = {
  shift_1_touchdown: {
    id: 'shift_1_touchdown',
    category: 'shift',
    icon: '🛬',
    titleVi: 'Ca 1: Chạm đất an toàn',
    titleEn: 'Shift 1: Safe Touchdown',
    descVi: 'Hoàn thành Ca 1 (00–08h) và cân bằng nguồn Solar Ridge.',
    descEn: 'Complete Shift 1 (00–08h) and stabilize Solar Ridge power.',
  },
  shift_2_electrolysis: {
    id: 'shift_2_electrolysis',
    category: 'shift',
    icon: '🫁',
    titleVi: 'Ca 2: Thợ điện phân OGS',
    titleEn: 'Shift 2: OGS Oxygen Split',
    descVi: 'Vượt qua Ca 2 (08–16h) và bảo vệ áp suất 21.3 kPa O₂.',
    descEn: 'Survive Shift 2 (08–16h) and keep O₂ near 21.3 kPa.',
  },
  shift_3_first_night: {
    id: 'shift_3_first_night',
    category: 'shift',
    icon: '❄️',
    titleVi: 'Ca 3: Vượt qua đêm đầu tiên',
    titleEn: 'Shift 3: First Polar Night',
    descVi: 'Chống chọi đợt sụt nhiệt -170°C an toàn ở Ca 3 (16–24h).',
    descEn: 'Endure the -170°C thermal drop cleanly in Shift 3 (16–24h).',
  },
  shift_4_water_loop: {
    id: 'shift_4_water_loop',
    category: 'shift',
    icon: '💧',
    titleVi: 'Ca 4: Dòng nước 98%',
    titleEn: 'Shift 4: 98% Water Loop',
    descVi: 'Giữ vững vòng tuần hoàn nước WRS qua Ca 4 (24–32h).',
    descEn: 'Preserve the 98% WRS water recycling loop in Shift 4 (24–32h).',
  },
  shift_5_dust_storm: {
    id: 'shift_5_dust_storm',
    category: 'shift',
    icon: '🌪️',
    titleVi: 'Ca 5: Chống chọi bão bụi',
    titleEn: 'Shift 5: Dust Storm Shield',
    descVi: 'Chặn đứng bụi tĩnh điện regolith với lọc HEPA ở Ca 5 (32–40h).',
    descEn: 'Defeat the electrostatic regolith dust storm in Shift 5 (32–40h).',
  },
  shift_6_veggie_bloom: {
    id: 'shift_6_veggie_bloom',
    category: 'shift',
    icon: '🌱',
    titleVi: 'Ca 6: Vườn tảo xanh tươi',
    titleEn: 'Shift 6: Spirulina Bloom',
    descVi: 'Phục hồi Veggie & tảo Spirulina xuyên đêm Ca 6 (40–48h).',
    descEn: 'Revive Veggie crops & Spirulina algae across Shift 6 (40–48h).',
  },
  shift_7_co2_balance: {
    id: 'shift_7_co2_balance',
    category: 'shift',
    icon: '🫧',
    titleVi: 'Ca 7: Kiểm soát khí CO₂',
    titleEn: 'Shift 7: CO₂ Scrubber Ace',
    descVi: 'Giữ CO₂ dưới ngưỡng nguy hiểm qua Ca 7 (48–56h).',
    descEn: 'Hold CO₂ safely below 5.3 mmHg across Shift 7 (48–56h).',
  },
  shift_8_solar_shield: {
    id: 'shift_8_solar_shield',
    category: 'shift',
    icon: '☢️',
    titleVi: 'Ca 8: Kiên cường trước bức xạ',
    titleEn: 'Shift 8: Radiation Resilient',
    descVi: 'Vượt qua bão proton Mặt Trời cực đại ở Ca 8 (56–64h).',
    descEn: 'Survive the peak Solar Particle Event in Shift 8 (56–64h).',
  },
  shift_9_hls_rendezvous: {
    id: 'shift_9_hls_rendezvous',
    category: 'shift',
    icon: '🚀',
    titleVi: 'Ca 9: Hội ngộ Starship HLS',
    titleEn: 'Shift 9: Starship HLS Linkup',
    descVi: 'Hoàn tất 72 giờ chờ SpaceX Starship HLS hạ cánh thành công.',
    descEn: 'Complete all 72 hours for SpaceX Starship HLS touchdown.',
  },
  sector_easy_unlocked: {
    id: 'sector_easy_unlocked',
    category: 'sector',
    icon: '🧭',
    titleVi: 'Thám hiểm Vành Hố Sáng (Dễ)',
    titleEn: 'Explorer: Crater Rim (Easy)',
    descVi: 'Mở khóa khu vực ngoài trạm Cấp Dễ trên bản đồ Radar EVA.',
    descEn: 'Unlock the Easy outer Crater Rim sector on the EVA Radar.',
  },
  sector_medium_unlocked: {
    id: 'sector_medium_unlocked',
    category: 'sector',
    icon: '🛸',
    titleVi: 'Thám hiểm Rãnh Regolith (Trung bình)',
    titleEn: 'Explorer: Regolith Trench (Medium)',
    descVi: 'Mở khóa khu vực ngoài trạm Cấp Trung bình để thu hồi linh kiện.',
    descEn: 'Unlock the Medium outer Regolith Trench sector for parts.',
  },
  sector_hard_unlocked: {
    id: 'sector_hard_unlocked',
    category: 'sector',
    icon: '🌑',
    titleVi: 'Chinh phục Vực Bóng Vĩnh Cửu (Khó)',
    titleEn: 'Explorer: Eternal Shadow Fault (Hard)',
    descVi: 'Mở khóa khu vực ngoài trạm Cấp Khó có mật độ phóng xạ cao.',
    descEn: 'Unlock the Hard outer Eternal Shadow Fault high-yield sector.',
  },
  grand_72h_survivor: {
    id: 'grand_72h_survivor',
    category: 'grand',
    icon: '🏆',
    titleVi: 'HUYỀN THOẠI CỰC NAM MẶT TRĂNG (72H SURVIVOR)',
    titleEn: 'LUNAR SOUTH POLE LEGEND (72H SURVIVOR)',
    descVi: 'Sống sót trọn vẹn 72 giờ qua cả 9 Ca VÀ mở khóa đủ cả 3 khu vực ngoài trạm!',
    descEn: 'Survive all 72 hours across 9 Shifts AND unlock all 3 outer Lunar sectors!',
  },
};

export interface EvaSectorMeta {
  id: EvaSectorId;
  tier: 'easy' | 'medium' | 'hard';
  nameVi: string;
  nameEn: string;
  descVi: string;
  descEn: string;
  minRadarLevel: 1 | 2 | 3;
  scrapCost: number;
  elecCost: number;
  achievementId: AchievementId;
}

export const EVA_SECTORS_META: Record<EvaSectorId, EvaSectorMeta> = {
  sector_easy: {
    id: 'sector_easy',
    tier: 'easy',
    nameVi: 'Vành Hố Sáng (Dễ)',
    nameEn: 'Sunlit Crater Rim (Easy)',
    descVi: 'Gần trạm Aurora, ít hố sâu. Có xác Drone & phế liệu cơ bản.',
    descEn: 'Close to Aurora Station. Low hazard, holds derelict drones & basic scrap.',
    minRadarLevel: 1,
    scrapCost: 1,
    elecCost: 0,
    achievementId: 'sector_easy_unlocked',
  },
  sector_medium: {
    id: 'sector_medium',
    tier: 'medium',
    nameVi: 'Rãnh Regolith (Trung bình)',
    nameEn: 'Regolith Trench (Medium)',
    descVi: 'Bụi dày & vùng bức xạ rải rác. Nhiều linh kiện điện tử & bộ lọc.',
    descEn: 'Deeper craters & scattered rad pockets. Rich electronics & filter parts.',
    minRadarLevel: 2,
    scrapCost: 2,
    elecCost: 1,
    achievementId: 'sector_medium_unlocked',
  },
  sector_hard: {
    id: 'sector_hard',
    tier: 'hard',
    nameVi: 'Vực Bóng Vĩnh Cửu (Khó)',
    nameEn: 'Eternal Shadow Fault (Hard)',
    descVi: 'Nhiệt độ cực thấp & bão bức xạ. Có tấm chắn nặng, hạt giống & thuốc KI.',
    descEn: 'Extreme cold & radiation pockets. High-value shield plates, seeds & KI.',
    minRadarLevel: 3,
    scrapCost: 3,
    elecCost: 2,
    achievementId: 'sector_hard_unlocked',
  },
};

export function awardAchievement(
  state: GameState,
  id: AchievementId,
): GameState {
  if (state.unlocked_achievements.includes(id)) return state;
  return {
    ...state,
    unlocked_achievements: [...state.unlocked_achievements, id],
    recent_achievement: id,
  };
}

export function checkAndAwardEndgameAchievement(state: GameState): GameState {
  const survivedAll9 =
    state.outcome !== 'failure' &&
    (state.decisions.length >= 9 || state.mission_hours >= 72);
  const all3Sectors = state.unlocked_sectors.length >= 3;
  if (survivedAll9 && all3Sectors) {
    return awardAchievement(state, 'grand_72h_survivor');
  }
  return state;
}
