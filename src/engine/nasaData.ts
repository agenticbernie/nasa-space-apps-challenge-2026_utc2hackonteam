import { CropId, Language, LedSpectrumMode, SpaceAilmentId, SupplyItemId } from './types';

export interface NasaCitation {
  id: string;
  code: string;
  title: string;
  dataset: string;
  usedIn: string;
  summary: string;
  physicalMetrics: string;
  endpoint: string;
}

const NASA_CITATIONS_VI: NasaCitation[] = [
  {
    id: 'SCI-01',
    code: 'SCI-01',
    title: 'LOLA — Lunar Orbiter Laser Altimeter',
    dataset: 'Lunar South Pole Topography & Illumination Context',
    usedIn: 'Bối cảnh Trạm Aurora (Cực Nam Mặt Trăng) & Địa hình 3D',
    summary:
      'Dữ liệu độ cao laser xác định các miệng hố tối vĩnh viễn và các đỉnh núi đón nắng gần Cực Nam Mặt Trăng.',
    physicalMetrics: 'Độ cao cực đại, góc nghiêng mặt trời thấp (~1.5°–5°)',
    endpoint: 'PDS Geosciences / LOLA Elevation Dataset',
  },
  {
    id: 'SCI-02',
    code: 'SCI-02',
    title: 'Bản Đồ Chiếu Sáng Cực Nam Mặt Trăng',
    dataset: 'Solar Array Placement & Power Availability Modeling',
    usedIn: 'Ca 1 (EVT-01) & Khu vực Solar Ridge',
    summary:
      'Bản đồ chiếu sáng WAC Polar giải thích vì sao điện Mặt Trời tại Cực Nam Mặt Trăng có thể sụt giảm khi góc nắng thấp hoặc bụi bám.',
    physicalMetrics: 'Tỷ lệ phần trăm thời gian chiếu sáng (% illumination)',
    endpoint: 'LROC WAC Polar Illumination Archive',
  },
  {
    id: 'SCI-03',
    code: 'SCI-03',
    title: 'BVAD (Baseline Values & Assumptions Document)',
    dataset: 'TP-2021-220419 — Life Support Priority Protocols',
    usedIn: 'Ca 1, Ca 2, Ca 5, Ca 6 — Cơ sở hệ thống tín chỉ tài nguyên',
    summary:
      'Tài liệu kỹ thuật quy định nhu cầu sinh tồn hàng ngày của phi hành gia và quy tắc ưu tiên ECLSS khi thiếu điện khẩn cấp.',
    physicalMetrics: 'O₂: 0.84 kg/người/ngày · Nước: 2.5 kg/người/ngày · Thực phẩm khô: 0.62 kg/ngày',
    endpoint: 'NTRS Technical Report 20210024855',
  },
  {
    id: 'SCI-04',
    code: 'SCI-04',
    title: 'Dự Án Veggie & Buồng Thực Vật Tiên Tiến (APH)',
    dataset: 'GeneLab OSD-766 (Red Robin Tomato), Outredgeous Lettuce & Apogee Wheat',
    usedIn: 'Ca 4 (EVT-04) & Buồng Trồng Cây Space Botany Lab',
    summary:
      'Ba loài cây trồng không gian thực tế: Rau diếp đỏ (ISS 2015), Cà chua lùn OSD-766 (giàu chất chống oxy hóa) và Lúa mì lùn Apogee (tạo O₂ mạnh nhất).',
    physicalMetrics: 'Bức xạ vũ trụ lên cây cao gấp ~50× Trái Đất · Cần LED đỏ-xanh lam 660/450 nm',
    endpoint: 'OSDR / GeneLab Bio-Archive',
  },
  {
    id: 'SCI-05',
    code: 'SCI-05',
    title: 'DONKI (Space Weather Notification Database)',
    dataset: 'Solar Energetic Particle (SEP) Historical Records',
    usedIn: 'Ca 3 (EVT-03) — Bão Mặt Trời & Hầm Shelter',
    summary:
      'Sự kiện tham chiếu thực tế: "Halloween Storm" (29/10/2003, bùng phát X17). Phi hành gia ISS phải lập tức vào module trú ẩn Zvezda/Harmony.',
    physicalMetrics: 'Hạt năng lượng cao đến Mặt Trăng chỉ sau ~30 phút; liều >100 mSv nếu không che chắn',
    endpoint: 'CCMC DONKI SEP Historical Catalog',
  },
  {
    id: 'SCI-06',
    code: 'SCI-06',
    title: 'HRP (Human Research Program) Radiation Protection',
    dataset: 'OCHMO Radiation Protection Brief',
    usedIn: 'Ca 3 & Nhật ký Tổng kết (Debrief)',
    summary:
      'Giới hạn phơi nhiễm bức xạ nghề nghiệp của phi hành gia và ngưỡng rủi ro cấp tính khi làm việc ngoài tàu.',
    physicalMetrics: 'Giới hạn sự nghiệp ~600 mSv/10 năm · ISS trung bình ~80 mSv/năm · Trái Đất ~3 mSv/năm',
    endpoint: 'HRP Occupational Radiation Standards',
  },
  {
    id: 'SCI-07',
    code: 'SCI-07',
    title: 'LRO CRaTER (Cosmic Ray Telescope for the Effects of Radiation)',
    dataset: 'PDS / Rad-Bio-App Lunar Surface Radiation',
    usedIn: 'Ca 3 & Mô hình môi trường bức xạ Mặt Trăng',
    summary:
      'Đo trực tiếp tia vũ trụ thiên hà (GCR) và bão hạt Mặt Trời trên bề mặt Mặt Trăng — nơi không có từ trường hay khí quyển bảo vệ.',
    physicalMetrics: 'GCR bề mặt Mặt Trăng nền ~0.5 mSv/ngày · Che chắn bằng túi nước & regolith',
    endpoint: 'crater.sr.unh.edu',
  },
  {
    id: 'SCI-08',
    code: 'SCI-08',
    title: 'ECLSS (Environmental Control and Life Support System)',
    dataset: 'ICES-2023-142 Exploration Water Recovery, OGS & CDRA CO₂ Scrubber',
    usedIn: 'Ca 2 (EVT-02), Ca 5 (EVT-05) & Hai buồng ECLSS',
    summary:
      'Hệ thống tái chế nước thu hồi tới 98% trên ISS, máy điện phân OGS tách nước thành oxy và bộ lọc CDRA/LiOH hấp thụ khí CO₂.',
    physicalMetrics: 'Giới hạn CO₂ trên ISS: 5.3 mmHg (trên 10 mmHg gây đau đầu & rối loạn nhận thức)',
    endpoint: 'ICES-2023-142 Exploration ECLSS Brief',
  },
  {
    id: 'SCI-09',
    code: 'SCI-09',
    title: 'Open Science Data Repository (OSDR / GeneLab)',
    dataset: 'OSD-964 (BioSentinel) & OSD-993 (Space Radiation Phenotypes)',
    usedIn: 'Nhật ký Tổng kết — Tác động sinh học của bức xạ vũ trụ',
    summary:
      'Dữ liệu sinh học vũ trụ về phản ứng tế bào và thực vật trước bức xạ không gian sâu ngoài vùng từ quyển Trái Đất.',
    physicalMetrics: 'BioSentinel đo tổn thương DNA theo thời gian thực ngoài quỹ đạo Trái Đất tầm thấp',
    endpoint: 'OSDR BioSentinel OSD-964 Archive',
  },
  {
    id: 'SCI-10',
    code: 'SCI-10',
    title: 'Tàu Đổ Bộ Mặt Trăng Artemis-Class & Starship HLS',
    dataset: 'Lunar South Pole Surface Operations & Logistics',
    usedIn: 'Cốt truyện 72 giờ chờ Starship HLS hạ cánh & tiếp tế',
    summary:
      'Starship HLS là tàu đổ bộ Mặt Trăng tải trọng lớn thuộc chương trình thám hiểm Cực Nam Mặt Trăng, đưa phi hành gia và hàng tiếp tế xuống trạm.',
    physicalMetrics: 'Trọng lực Mặt Trăng: 1/6G (~1.62 m/s²) · Bụi regolith sắc nhọn bám tĩnh điện',
    endpoint: 'South Pole Surface Operations Protocol',
  },
  {
    id: 'SCI-11',
    code: 'SCI-11',
    title: 'Y Học Không Gian & Bảo Vệ Sức Khỏe Phi Hành Đoàn',
    dataset: 'ARED Resistance Exercise, Regolith Dust Mitigation & Hypercapnia Care',
    usedIn: 'Khoang Y Tế Vũ Trụ & Sức khỏe Phi hành đoàn (Crew Health)',
    summary:
      'Bốn bệnh lý không gian: Say bức xạ vũ trụ, Viêm phổi do bụi regolith, Ngộ độc CO₂ (Hypercapnia) và Teo cơ-giảm xương ở trọng lực 1/6G (phòng bằng máy ARED).',
    physicalMetrics: 'Tập ARED ~2h/ngày giảm mất xương · Bộ lọc HEPA 99.97% chặn bụi Mặt Trăng <0.3 µm',
    endpoint: 'Space Medicine & ARED Clinical Brief',
  },
];

const NASA_CITATIONS_EN: NasaCitation[] = [
  {
    id: 'SCI-01',
    code: 'SCI-01',
    title: 'LOLA — Lunar Orbiter Laser Altimeter',
    dataset: 'Lunar South Pole Topography & Illumination Context',
    usedIn: 'Aurora Station Setting (Lunar South Pole) & 3D Terrain',
    summary:
      'Laser elevation maps reveal permanently shadowed craters and sunlit ridge peaks near the Lunar South Pole.',
    physicalMetrics: 'High terrain relief, very low Sun grazing angle (~1.5°–5°)',
    endpoint: 'PDS Geosciences / LOLA Elevation Dataset',
  },
  {
    id: 'SCI-02',
    code: 'SCI-02',
    title: 'Lunar South Pole Illumination Maps',
    dataset: 'Solar Array Placement & Power Availability Modeling',
    usedIn: 'Shift 1 (EVT-01) & Solar Ridge Bay',
    summary:
      'WAC Polar illumination maps show why Lunar South Pole solar power drops when Sun angles dip or dust settles.',
    physicalMetrics: 'Illumination percentage (% sunlit hours per lunar day)',
    endpoint: 'LROC WAC Polar Illumination Archive',
  },
  {
    id: 'SCI-03',
    code: 'SCI-03',
    title: 'BVAD (Baseline Values & Assumptions Document)',
    dataset: 'TP-2021-220419 — Life Support Priority Protocols',
    usedIn: 'Shifts 1, 2, 5, 6 — Resource credit calibration',
    summary:
      'Engineering reference standard defining daily astronaut life-support needs and emergency ECLSS power priority rules.',
    physicalMetrics: 'O₂: 0.84 kg/person/day · Water: 2.5 kg/person/day · Dry food: 0.62 kg/day',
    endpoint: 'NTRS Technical Report 20210024855',
  },
  {
    id: 'SCI-04',
    code: 'SCI-04',
    title: 'Veggie Project & Advanced Plant Habitat (APH)',
    dataset: 'GeneLab OSD-766 (Red Robin Tomato), Outredgeous Lettuce & Apogee Wheat',
    usedIn: 'Shift 4 (EVT-04) & Space Botany Lab',
    summary:
      'Three real orbital space crops: Red Romaine Lettuce (ISS 2015), Red Robin Dwarf Tomato (antioxidants), and Apogee Dwarf Wheat (top O₂ producer).',
    physicalMetrics: 'Cosmic radiation impact ~50× Earth · Red-Blue LED peak 660/450 nm',
    endpoint: 'OSDR / GeneLab Bio-Archive',
  },
  {
    id: 'SCI-05',
    code: 'SCI-05',
    title: 'DONKI (Space Weather Notification Database)',
    dataset: 'Solar Energetic Particle (SEP) Historical Records',
    usedIn: 'Shift 3 (EVT-03) — Solar Particle Event & Radiation Shelter',
    summary:
      'Historical benchmark: the 2003 Halloween Storm (X17 flare). ISS crews immediately sheltered inside shielded Zvezda/Harmony modules.',
    physicalMetrics: 'High-energy solar particles reach the Moon in ~30 min; >100 mSv if unshielded',
    endpoint: 'CCMC DONKI SEP Historical Catalog',
  },
  {
    id: 'SCI-06',
    code: 'SCI-06',
    title: 'HRP (Human Research Program) Radiation Protection',
    dataset: 'OCHMO Radiation Protection Brief',
    usedIn: 'Shift 3 & Mission Debrief Journal',
    summary:
      'Defines astronaut career radiation limits and acute exposure risks during unshielded EVA work outside a habitat.',
    physicalMetrics: 'Career limit ~600 mSv/10 yr · ISS average ~80 mSv/yr · Earth ~3 mSv/yr',
    endpoint: 'HRP Occupational Radiation Standards',
  },
  {
    id: 'SCI-07',
    code: 'SCI-07',
    title: 'LRO CRaTER (Cosmic Ray Telescope for the Effects of Radiation)',
    dataset: 'PDS / Rad-Bio-App Lunar Surface Radiation',
    usedIn: 'Shift 3 & Lunar Surface Radiation Model',
    summary:
      'Measures Galactic Cosmic Rays (GCR) and Solar Particle Events directly on the Moon, which lacks a magnetic field or thick air.',
    physicalMetrics: 'Baseline lunar surface GCR ~0.5 mSv/day · Water walls & regolith block rays',
    endpoint: 'crater.sr.unh.edu',
  },
  {
    id: 'SCI-08',
    code: 'SCI-08',
    title: 'ECLSS (Environmental Control and Life Support System)',
    dataset: 'ICES-2023-142 Water Recovery (98%), OGS Electrolysis & CDRA CO₂ Scrubber',
    usedIn: 'Shift 2 (EVT-02), Shift 5 (EVT-05) & Dual ECLSS Chambers',
    summary:
      'ISS water loops recycle up to 98% of water, OGS splits water into breathable O₂, and CDRA/LiOH canisters scrub exhaled CO₂.',
    physicalMetrics: 'ISS CO₂ limit: 5.3 mmHg (above 10 mmHg causes headaches & fuzzy thinking)',
    endpoint: 'ICES-2023-142 Exploration ECLSS Brief',
  },
  {
    id: 'SCI-09',
    code: 'SCI-09',
    title: 'Open Science Data Repository (OSDR / GeneLab)',
    dataset: 'OSD-964 (BioSentinel) & OSD-993 (Space Radiation Phenotypes)',
    usedIn: 'Debrief Journal — Biological Effects of Deep Space Radiation',
    summary:
      'Space biology datasets tracking cellular and plant responses to deep-space radiation beyond Earth’s protective magnetosphere.',
    physicalMetrics: 'BioSentinel measures real-time DNA damage beyond Low Earth Orbit',
    endpoint: 'OSDR BioSentinel OSD-964 Archive',
  },
  {
    id: 'SCI-10',
    code: 'SCI-10',
    title: 'Artemis-Class Lunar Lander & SpaceX Starship HLS',
    dataset: 'Lunar South Pole Surface Operations & Cargo Logistics',
    usedIn: '72-Hour Outpost Survival Narrative & Starship HLS Landing',
    summary:
      'SpaceX Starship HLS serves as a heavy lunar lander delivering crew, science gear, and cargo resupply to the Lunar South Pole.',
    physicalMetrics: 'Lunar gravity: 1/6G (~1.62 m/s²) · Sharp electrostatically charged regolith dust',
    endpoint: 'South Pole Surface Operations Protocol',
  },
  {
    id: 'SCI-11',
    code: 'SCI-11',
    title: 'Space Medicine & Crew Health Countermeasures',
    dataset: 'ARED Resistance Exercise, HEPA Regolith Filtration & Hypercapnia Care',
    usedIn: 'Habitat Medical & ARED Bay + Crew Health Monitoring',
    summary:
      'Tracks 4 space health conditions: Radiation sickness, Lunar regolith pneumonia, CO₂ hypercapnia, and 1/6G muscle/bone loss countered via ARED.',
    physicalMetrics: 'ARED ~2h/day protects bone mass · HEPA 99.97% traps sharp lunar dust <0.3 µm',
    endpoint: 'Space Medicine & ARED Clinical Brief',
  },
];

export const NASA_CITATIONS = NASA_CITATIONS_VI;

export function getNasaCitations(lang: Language): NasaCitation[] {
  return lang === 'en' ? NASA_CITATIONS_EN : NASA_CITATIONS_VI;
}

export const GAME_ABSTRACTION_NOTE = {
  code: 'GAME-01',
  title: 'Phân biệt Chỉ số Mô phỏng Game vs. Đơn vị Vật lý Vũ trụ',
  description:
    'Tất cả các chỉ số trong game (Phần điện 0–20, Bình nước, Điểm không khí 0–100, Sức khỏe cây 0–100, Sức khỏe đoàn 0–100, Đơn vị bức xạ) là các đơn vị quy đổi giáo dục (synthetic gameplay credits) giúp trẻ 7–12 tuổi trực quan hóa sự đánh đổi. Chúng KHÔNG phải số đo vật lý thô (kg, kWh, mmHg, mSv), nhưng được hiệu chỉnh theo tỷ lệ và thứ tự ưu tiên từ tài liệu chuẩn BVAD, ECLSS, DONKI, Artemis & HRP.',
};

export function getGameAbstractionNote(lang: Language) {
  if (lang === 'en') {
    return {
      code: 'GAME-01',
      title: 'Simulation Credits vs. Raw Spaceflight Physical Units',
      description:
        'All numbers in the game (Power units 0–20, Water units, Air score 0–100, Plant health 0–100, Crew Health 0–100, Radiation risk units) are synthetic educational gameplay credits designed to help ages 7–12 visualize trade-offs. They are NOT raw physical measurements (kg, kWh, mmHg, mSv), yet are calibrated proportionally from BVAD, ECLSS, DONKI, Artemis, and HRP datasets.',
    };
  }
  return GAME_ABSTRACTION_NOTE;
}

export interface SupplyItemMeta {
  id: SupplyItemId;
  icon: string;
  nameVi: string;
  nameEn: string;
  descVi: string;
  descEn: string;
  usedForShift?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
}

export const SUPPLY_ITEMS_META: Record<SupplyItemId, SupplyItemMeta> = {
  solar_cell: {
    id: 'solar_cell',
    icon: '🔆',
    nameVi: 'Tấm pin phụ (Aux Cell)',
    nameEn: 'Aux Solar Cell',
    descVi: 'Thu từ tàu khảo sát cũ, lắp cho Bảng điện Solar Ridge (Ca 1).',
    descEn: 'Salvaged from legacy lander, installs into Solar Ridge panel (Shift 1).',
    usedForShift: 1,
  },
  water_filter: {
    id: 'water_filter',
    icon: '🧪',
    nameVi: 'Lõi lọc nước WRS/OGS',
    nameEn: 'WRS/OGS Water Filter',
    descVi: 'Thay thế lõi tắc bụi trong buồng Điện phân & Nước ECLSS (Ca 2 & 4).',
    descEn: 'Replaces dust-clogged cartridge inside OGS/WRS Water Recovery (Shifts 2 & 4).',
    usedForShift: 2,
  },
  rad_shield: {
    id: 'rad_shield',
    icon: '🛡️',
    nameVi: 'Tấm chắn nhiệt & bức xạ',
    nameEn: 'Thermal/Rad Shield Plate',
    descVi: 'Gia cố vách hầm trú ẩn chống lạnh -170°C & hạt bão Mặt Trời (Ca 3).',
    descEn: 'Reinforces Shelter wall against -170°C drops & solar particles (Shift 3).',
    usedForShift: 3,
  },
  hardy_seeds: {
    id: 'hardy_seeds',
    icon: '🌱',
    nameVi: 'Hạt giống chịu bức xạ',
    nameEn: 'Hardy Space Seeds',
    descVi: 'Hạt rau, lúa mì & tảo Spirulina tăng cường cho Buồng Cây (Ca 6).',
    descEn: 'Radiation-hardy crop & Spirulina seeds for Botany Lab (Shift 6).',
    usedForShift: 6,
  },
  lioh_filter: {
    id: 'lioh_filter',
    icon: '🫧',
    nameVi: 'Bộ lọc CO₂ LiOH',
    nameEn: 'LiOH CO₂ Canister',
    descVi: 'Hộp hóa chất Lithium Hydroxide hút sạch khí CO₂ độc hại (Ca 7).',
    descEn: 'Lithium Hydroxide canister that scrubs excess cabin CO₂ (Shift 7).',
    usedForShift: 7,
  },
  med_kit: {
    id: 'med_kit',
    icon: '🩺',
    nameVi: 'Bộ Kit Y Tế Vũ Trụ',
    nameEn: 'Space Med-Kit',
    descVi: 'Chữa trị ngay các bệnh vũ trụ tại Khoang Y Tế & ARED.',
    descEn: 'Treats space medicine conditions in the Habitat Medical Bay.',
  },
  scrap_metal: {
    id: 'scrap_metal',
    icon: '🔩',
    nameVi: 'Phế liệu hợp kim',
    nameEn: 'Alloy Scrap Metal',
    descVi: 'Tháo từ xác Robot/Drone cũ ngoài trạm. Dùng nâng cấp Radar & chế tạo lọc HEPA.',
    descEn: 'Dismantled from derelict EVA drones. Used to upgrade Radar & craft HEPA filters.',
  },
  electronic_parts: {
    id: 'electronic_parts',
    icon: '🔌',
    nameVi: 'Linh kiện điện tử',
    nameEn: 'Electronic Parts',
    descVi: 'Bo mạch & cảm biến thu hồi. Dùng mở khóa khu vực & tổng hợp thuốc KI.',
    descEn: 'Salvaged avionics & sensors. Unlocks outer sectors & synthesizes KI tablets.',
  },
  hepa_filter: {
    id: 'hepa_filter',
    icon: '🌬️',
    nameVi: 'Bộ lọc bụi HEPA 99.97%',
    nameEn: 'HEPA Regolith Filter',
    descVi: 'Lọc bụi regolith sắc nhọn (<0.3 µm), trị Phổi bụi & sửa Ca 5.',
    descEn: 'Traps razor-sharp regolith dust (<0.3 µm); cures Dust Lung & repairs Shift 5.',
    usedForShift: 5,
  },
  ki_pills: {
    id: 'ki_pills',
    icon: '💊',
    nameVi: 'Viên Potassium Iodide (KI)',
    nameEn: 'Potassium Iodide (KI)',
    descVi: 'Thuốc bảo vệ tế bào & tuyến giáp trước bão bức xạ Mặt Trời (Ca 8).',
    descEn: 'Radioprotective tablets shielding crew during Solar Particle Storms (Shift 8).',
    usedForShift: 8,
  },
  spirulina_ration: {
    id: 'spirulina_ration',
    icon: '🥗',
    nameVi: 'Khẩu phần Tảo Spirulina',
    nameEn: 'Spirulina Energy Ration',
    descVi: 'Thu hoạch từ Buồng Veggie: bổ sung +450 kcal & tinh thần cho phi hành gia.',
    descEn: 'Harvested from Veggie Lab: restores +450 kcal nutrition & crew stamina.',
  },
};

export interface NasaCropMeta {
  id: CropId;
  icon: string;
  nameVi: string;
  nameEn: string;
  nasaCode: string;
  bestLed: LedSpectrumMode;
  roleVi: string;
  roleEn: string;
  careTipVi: string;
  careTipEn: string;
}

export const NASA_CROPS_META: Record<CropId, NasaCropMeta> = {
  lettuce: {
    id: 'lettuce',
    icon: '🥬',
    nameVi: 'Rau diếp đỏ (Outredgeous)',
    nameEn: 'Outredgeous Red Romaine Lettuce',
    nasaCode: 'ISS Veggie (2015)',
    bestLed: 'red_blue',
    roleVi: 'Cung cấp vitamin tươi, chất xơ & tinh thần lạc quan cho phi hành gia.',
    roleEn: 'Supplies fresh vitamins, crisp nutrition & crew morale.',
    careTipVi: 'Cần ánh sáng đèn LED Đỏ–Xanh lam và tưới ẩm đều đặn.',
    careTipEn: 'Thrives under Red–Blue LED light with steady hydroponic moisture.',
  },
  tomato: {
    id: 'tomato',
    icon: '🍅',
    nameVi: 'Cà chua lùn (Red Robin)',
    nameEn: 'Red Robin Dwarf Tomato',
    nasaCode: 'GeneLab OSD-766',
    bestLed: 'red_blue',
    roleVi: 'Giàu chất chống oxy hóa lycopene giúp giảm hại tế bào từ bức xạ vũ trụ!',
    roleEn: 'Rich in antioxidants that help protect cells from space radiation!',
    careTipVi: 'Cần thụ phấn nhân tạo (rung hoa thay gió/ong) và LED Đỏ–Xanh lam.',
    careTipEn: 'Needs hand pollination (replacing wind & bees) plus Red–Blue LED.',
  },
  wheat: {
    id: 'wheat',
    icon: '🌾',
    nameVi: 'Lúa mì lùn (Apogee Wheat)',
    nameEn: 'Apogee Dwarf Wheat',
    nasaCode: 'APH Bio-Regenerative',
    bestLed: 'full_bright',
    roleVi: 'Quang hợp cực mạnh: tạo nhiều Oxy nhất (+kPa) & hút sạch khí CO₂ trong trạm!',
    roleEn: 'Highest photosynthesis: boosts O₂ (+kPa) & scrubs cabin CO₂!',
    careTipVi: 'Chịu được cường độ đèn LED Sáng toàn phần (Full Bright) công suất cao.',
    careTipEn: 'Loves high-intensity Full-Bright LED lighting and steady water.',
  },
  spirulina: {
    id: 'spirulina',
    icon: '🟢',
    nameVi: 'Tảo Xoắn (Spirulina Bioreactor)',
    nameEn: 'Spirulina Algae Bioreactor',
    nasaCode: 'CELSS / Melissa',
    bestLed: 'full_bright',
    roleVi: 'Siêu thực phẩm vũ trụ: tạo protein (+kcal) nhanh gấp 10× cây cạn & sinh O₂ liên tục!',
    roleEn: 'Space superfood: yields +kcal protein 10× faster & generates O₂ continuously!',
    careTipVi: 'Chiếu LED Sáng Toàn Phần & khuấy thủy canh để thu hoạch khẩu phần calo.',
    careTipEn: 'Uses Full-Bright LED & nutrient agitation to harvest dense energy rations.',
  },
};

export interface SpaceAilmentMeta {
  id: SpaceAilmentId;
  icon: string;
  nameVi: string;
  nameEn: string;
  symptomVi: string;
  symptomEn: string;
  nasaFactVi: string;
  nasaFactEn: string;
  cureGuideVi: string;
  cureGuideEn: string;
}

export const SPACE_AILMENTS_META: Record<SpaceAilmentId, SpaceAilmentMeta> = {
  radiation_sickness: {
    id: 'radiation_sickness',
    icon: '☢️',
    nameVi: 'Say bức xạ vũ trụ',
    nameEn: 'Acute Radiation Sickness',
    symptomVi: 'Mệt mỏi, buồn nôn do phơi nhiễm bão hạt Mặt Trời ngoài không gian.',
    symptomEn: 'Fatigue & nausea from unshielded Solar Particle Event exposure.',
    nasaFactVi: 'Mặt Trăng không có từ trường bảo vệ nên hạt năng lượng cao xuyên rất mạnh.',
    nasaFactEn: 'Without a magnetic shield, solar protons damage cells rapidly.',
    cureGuideVi: 'Chữa bằng Cà chua lùn chống oxy hóa (Buồng Cây) hoặc Bộ Kit Y Tế.',
    cureGuideEn: 'Treat with antioxidant Red Robin Tomatoes or a Space Med-Kit.',
  },
  lunar_dust_pneumonia: {
    id: 'lunar_dust_pneumonia',
    icon: '🌫️',
    nameVi: 'Viêm phổi bụi Mặt Trăng',
    nameEn: 'Lunar Regolith Pneumonia',
    symptomVi: 'Ho & kích ứng phổi do hít bụi regolith sắc như thủy tinh vụn.',
    symptomEn: 'Coughing from sharp, static-charged lunar regolith dust.',
    nasaFactVi: 'Bụi Mặt Trăng chưa từng bị gió mài mòn nên cực kỳ sắc bén!',
    nasaFactEn: 'Lunar dust is never weathered by wind, leaving razor-sharp edges.',
    cureGuideVi: 'Xả rửa lọc HEPA Airlock tại Khoang Y Tế hoặc dùng Bộ Kit Y Tế.',
    cureGuideEn: 'Run Airlock HEPA Rinse in Medical Bay or use a Space Med-Kit.',
  },
  hypercapnia: {
    id: 'hypercapnia',
    icon: '😮‍💨',
    nameVi: 'Ngộ độc khí CO₂ (Hypercapnia)',
    nameEn: 'CO₂ Hypercapnia',
    symptomVi: 'Đau đầu, chóng mặt, chậm phản xạ khi CO₂ vượt ngưỡng 5.3 mmHg.',
    symptomEn: 'Headaches & foggy thinking when cabin CO₂ exceeds 5.3 mmHg.',
    nasaFactVi: 'Trên trạm kín không có gió đối lưu, khí CO₂ dễ tụ thành túi khí ngạt.',
    nasaFactEn: 'In microgravity & closed bases, exhaled CO₂ pools near crewmates.',
    cureGuideVi: 'Tăng quang hợp Lúa mì lùn (Buồng Cây) + sửa lọc CO₂ hoặc dùng Kit Y Tế.',
    cureGuideEn: 'Boost Apogee Wheat O₂ output + fix scrubber, or use a Med-Kit.',
  },
  muscle_bone_loss: {
    id: 'muscle_bone_loss',
    icon: '🦴',
    nameVi: 'Teo cơ & Giảm xương (1/6G)',
    nameEn: '1/6G Muscle & Bone Loss',
    symptomVi: 'Chân tay yếu đi do sống lâu trong trọng lực Mặt Trăng chỉ bằng 1/6 Trái Đất.',
    symptomEn: 'Weakened muscles & bone density from prolonged 1/6G gravity.',
    nasaFactVi: 'Phi hành gia tập máy kháng lực ARED mỗi ngày trên trạm để giữ xương chắc khỏe.',
    nasaFactEn: 'Astronauts use the ARED resistance trainer daily in space to keep bones strong.',
    cureGuideVi: 'Bấm Kích hoạt lịch tập ARED cho Sam & Maya tại Khoang Y Tế!',
    cureGuideEn: 'Activate the ARED Exercise Session for Sam & Maya in Medical Bay!',
  },
};
