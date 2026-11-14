import { QUEST_DEFINITIONS } from './questAndAchievements';
import {
  ChoiceId,
  DialogueChoiceOption,
  DialogueTurn,
  GameState,
  Language,
  OutpostZoneId,
  SequentialBriefingStep,
  ShiftNumber,
} from './types';

export interface ShiftTriggerMeta {
  shift: ShiftNumber;
  zone: OutpostZoneId;
  targetId: string;
  label: string;
  x: number;
  z: number;
}

export const SHIFT_TRIGGER_MAP: Record<ShiftNumber, ShiftTriggerMeta> = {
  1: {
    shift: 1,
    zone: 'solar',
    targetId: 'shift1_solar',
    label: 'Bảng Điện Solar Ridge (Ca 1)',
    x: -20.2,
    z: 0,
  },
  2: {
    shift: 2,
    zone: 'habitat',
    targetId: 'shift2_water',
    label: 'Trạm Điện Phân OGS & Nước (Ca 2)',
    x: -3.55,
    z: 17.5,
  },
  3: {
    shift: 3,
    zone: 'habitat',
    targetId: 'shift5_air',
    label: 'Hệ Thống Nhiệt & Khí Sinh Hoạt (Ca 3)',
    x: 3.55,
    z: 17.8,
  },
  4: {
    shift: 4,
    zone: 'habitat',
    targetId: 'shift2_water',
    label: 'Trạm Tái Chế Nước WRS 98% (Ca 4)',
    x: -3.55,
    z: 17.5,
  },
  5: {
    shift: 5,
    zone: 'solar',
    targetId: 'shift1_solar',
    label: 'Cụm Airlock & Lọc Bụi Solar (Ca 5)',
    x: -20.2,
    z: 0,
  },
  6: {
    shift: 6,
    zone: 'greenhouse',
    targetId: 'shift4_greenhouse',
    label: 'Bảng Vườn Veggie & Tảo Spirulina (Ca 6)',
    x: 21.5,
    z: 0,
  },
  7: {
    shift: 7,
    zone: 'habitat',
    targetId: 'shift5_air',
    label: 'Bộ Lọc Không Khí CO₂ CDRA/LiOH (Ca 7)',
    x: 3.55,
    z: 17.8,
  },
  8: {
    shift: 8,
    zone: 'control',
    targetId: 'shift3_radar',
    label: 'Radar Bão Bức Xạ Mặt Trời (Ca 8)',
    x: 0,
    z: -3.1,
  },
  9: {
    shift: 9,
    zone: 'control',
    targetId: 'shift3_radar',
    label: 'Console Điều Phối Starship HLS (Ca 9)',
    x: 0,
    z: -3.1,
  },
};

const SHIFT_TRIGGER_LABELS_EN: Record<ShiftNumber, string> = {
  1: 'Solar Ridge Power Panel (Shift 1)',
  2: 'OGS Oxygen & Water Unit (Shift 2)',
  3: 'Thermal & Cabin Air Desk (Shift 3)',
  4: 'WRS 98% Water Recovery Unit (Shift 4)',
  5: 'Solar Bay Dust & HEPA Lock (Shift 5)',
  6: 'Veggie & Spirulina Monitor (Shift 6)',
  7: 'CO₂ Scrubber CDRA/LiOH Unit (Shift 7)',
  8: 'Solar Radiation Radar Desk (Shift 8)',
  9: 'Starship HLS Command Console (Shift 9)',
};

export function getShiftTriggerMeta(
  shift: ShiftNumber,
  lang: Language = 'vi',
): ShiftTriggerMeta {
  const base = SHIFT_TRIGGER_MAP[shift];
  if (lang === 'en') {
    return {
      ...base,
      label: SHIFT_TRIGGER_LABELS_EN[shift],
    };
  }
  return base;
}

export function getNpcName(
  npcId: 'sam' | 'maya' | 'commander',
  lang: Language = 'vi',
): string {
  if (npcId === 'commander') {
    return lang === 'en' ? 'Station Commander AI' : 'Chỉ Huy Trạm AI';
  }
  if (lang === 'en') {
    return npcId === 'sam' ? 'Engineer Sam' : 'Dr. Maya';
  }
  return npcId === 'sam' ? 'Kỹ sư Sam' : 'Tiến sĩ Maya';
}

export function getNpcRole(
  npcId: 'sam' | 'maya' | 'commander',
  lang: Language = 'vi',
): string {
  if (npcId === 'commander') {
    return lang === 'en'
      ? 'Artemis Outpost Onboarding Officer'
      : 'Sĩ quan Hướng dẫn Tiền trạm Artemis';
  }
  if (lang === 'en') {
    return npcId === 'sam'
      ? 'ECLSS & Power Systems Engineer'
      : 'Space Botanist · Veggie/APH';
  }
  return npcId === 'sam'
    ? 'Kỹ sư Hệ thống Sống (ECLSS) & Năng lượng'
    : 'Tiến sĩ Thực vật học Không gian (Veggie/APH)';
}

export function isNpcAssignedToShift(
  npcId: 'sam' | 'maya',
  shift: ShiftNumber,
): boolean {
  if (shift === 9) return true;
  if (npcId === 'sam') {
    return shift === 1 || shift === 2 || shift === 4 || shift === 5 || shift === 7;
  }
  return shift === 3 || shift === 6 || shift === 8;
}

export function getPrimaryShiftNpcLabel(
  shift: ShiftNumber,
  lang: Language = 'vi',
): string {
  if (shift === 9) {
    return lang === 'en' ? 'Sam or Maya' : 'Sam hoặc Maya';
  }
  if (shift === 3 || shift === 6 || shift === 8) {
    return getNpcName('maya', lang);
  }
  return getNpcName('sam', lang);
}

export function getCommanderTutorialDialogue(
  callsign: string,
  lang: Language = 'vi',
): {
  title: string;
  role: string;
  turns: DialogueTurn[];
  checklist: { icon: string; title: string; desc: string }[];
  confirmLabel: string;
} {
  const safeName = callsign || 'Astronaut';
  if (lang === 'en') {
    return {
      title: `Welcome to Aurora Station, ${safeName}`,
      role: getNpcRole('commander', 'en'),
      turns: [
        {
          speaker: 'commander',
          speakerName: 'Station Commander AI',
          text: `Touchdown confirmed at the Lunar South Pole! Welcome aboard, ${safeName}.`,
        },
        {
          speaker: 'commander',
          speakerName: 'Station Commander AI',
          text: 'Your crew must survive 72 hours (3 Sols / 9 Shifts) until SpaceX Starship HLS lands.',
        },
        {
          speaker: 'commander',
          speakerName: 'Station Commander AI',
          text: 'I am returning to routine station patrol now. Meet Sam or Maya [!] to begin Shift 1!',
        },
      ],
      checklist: [
        {
          icon: '🖥️',
          title: 'Mission Control Hub (Center)',
          desc: 'Storm Radar, Starship HLS Landing Desk & Click-to-Move EVA Surface Terminal.',
        },
        {
          icon: '🫁',
          title: 'O₂ / H₂O ECLSS & Med Bay (South)',
          desc: '21.3 kPa O₂ Electrolysis, 98% Water Loop, CO₂ Scrubber & Radiation Shelter.',
        },
        {
          icon: '🌱',
          title: 'Hydroponic Veggie Garden (East)',
          desc: 'Red Lettuce, Dwarf Tomato, Wheat & Spirulina Algae for calories & O₂.',
        },
        {
          icon: '☀️',
          title: 'Solar Ridge & Outer Airlock (West)',
          desc: '3° grazing sunlight arrays and sealed Airlocks guarding against regolith dust.',
        },
      ],
      confirmLabel: 'Start 72-Hour Survival (Shift 1)',
    };
  }

  return {
    title: `Chào mừng tới Trạm Aurora, ${safeName}`,
    role: getNpcRole('commander', 'vi'),
    turns: [
      {
        speaker: 'commander',
        speakerName: 'Chỉ Huy Trạm AI',
        text: `Đã hạ cánh chính xác tại Cực Nam Mặt Trăng! Chào mừng phi hành gia ${safeName}.`,
      },
      {
        speaker: 'commander',
        speakerName: 'Chỉ Huy Trạm AI',
        text: 'Nhiệm vụ của bạn: sinh tồn trọn 72 giờ (3 Ngày / 9 Ca) chờ tàu tiếp tế SpaceX Starship HLS.',
      },
      {
        speaker: 'commander',
        speakerName: 'Chỉ Huy Trạm AI',
        text: 'Tôi sẽ chuyển sang tuần tra tự động giữ trạm. Hãy tìm Sam hoặc Maya [!] để nhận lệnh Ca 1!',
      },
    ],
    checklist: [
      {
        icon: '🖥️',
        title: 'Phòng Điều Khiển Trung Tâm',
        desc: 'Radar Bão Mặt Trời, Bàn đón Starship HLS & Máy tính bản đồ Robot EVA.',
      },
      {
        icon: '🫁',
        title: 'Hệ thống Oxy / Nước & Y Tế (Phía Nam)',
        desc: 'Điện phân O₂ 21.3 kPa, Tái chế Nước 98%, Lọc CO₂ & Hầm Shelter.',
      },
      {
        icon: '🌱',
        title: 'Vườn Thủy Canh Veggie (Phía Đông)',
        desc: 'Trồng Rau diếp, Cà chua, Lúa mì & Tảo Spirulina tạo Calo và Oxy.',
      },
      {
        icon: '☀️',
        title: 'Khu Pin Mặt Trời & Cửa Airlock (Phía Tây)',
        desc: 'Đón nắng 3° Cực Nam và khóa cửa Airlock chống bão bụi Mặt Trăng.',
      },
    ],
    confirmLabel: 'Bắt đầu sinh tồn 72 giờ (Ca 1)',
  };
}

export function getLocalizedTargetLabel(
  targetId: string,
  shift: ShiftNumber,
  lang: Language,
): string {
  if (lang === 'en') {
    switch (targetId) {
      case 'shift1_solar':
        return shift === 5 ? 'Solar Bay Dust & HEPA Lock' : 'Solar Ridge Power Panel';
      case 'shift2_water':
        return shift === 4 ? 'WRS 98% Water Recovery Unit' : 'OGS Oxygen & Water Unit';
      case 'shift3_radar':
        return shift === 9 ? 'Starship HLS Command Console' : 'Solar Radiation Radar & Command Desk';
      case 'shift4_greenhouse':
        return 'Veggie & Spirulina Plant Monitor';
      case 'shift5_air':
        return shift === 3 ? 'Thermal & Cabin Air Desk' : 'CO₂ Scrubber CDRA/LiOH Unit';
      case 'npc_sam':
        return '👨‍🔧 Engineer Sam';
      case 'npc_maya':
        return '👩‍🌾 Dr. Maya';
      case 'npc_commander':
        return '🧑‍🚀 Station Commander';
      case 'prop_earth_window':
        return '🔭 Earth Observation Scope';
      case 'prop_maya_journal':
        return "📓 Maya's Plant Journal";
      case 'prop_rad_meter':
        return '☢️ Outdoor Radiation Meter';
      case 'locked_glass_door':
        return 'Supply Storage Warehouse Door';
      case 'supply_trolley':
        return '🛒 Warehouse Supply Trolley (Grab / Park)';
      case 'rover_console':
        return '🛸 EVA Surface & Rover Control Terminal';
      case 'botany_lab':
        return '🌱 Space Botany Care Terminal (Veggie & Spirulina)';
      case 'med_bay':
        return '🩺 Space Medicine, OGS/WRS & Crafting Bay';
      case 'chamber_water':
        return '💧 Water Recovery & Radiation Wall Chamber';
      case 'chamber_oxygen':
        return '🫁 Oxygen Electrolysis & Air Pipes Chamber';
      default:
        return targetId;
    }
  }

  switch (targetId) {
    case 'shift1_solar':
      return shift === 5 ? 'Cụm Airlock & Lọc Bụi Solar' : 'Bảng Điện Solar Ridge';
    case 'shift2_water':
      return shift === 4 ? 'Trạm Tái Chế Nước WRS 98%' : 'Trạm Điện Phân OGS & Nước';
    case 'shift3_radar':
      return shift === 9 ? 'Console Điều Phối Starship HLS' : 'Radar Bão Bức Xạ & Bàn Chỉ Huy';
    case 'shift4_greenhouse':
      return 'Bảng Vườn Veggie & Tảo Spirulina';
    case 'shift5_air':
      return shift === 3 ? 'Hệ Thống Nhiệt & Khí Sinh Hoạt' : 'Bộ Lọc Không Khí CO₂ CDRA/LiOH';
    case 'npc_sam':
      return '👨‍🔧 Kỹ sư Sam';
    case 'npc_maya':
      return '👩‍🌾 Tiến sĩ Maya';
    case 'npc_commander':
      return '🧑‍🚀 Chỉ Huy Trạm';
    case 'prop_earth_window':
      return '🔭 Cửa Sổ Quan Sát Trái Đất';
    case 'prop_maya_journal':
      return '📓 Nhật Ký Trồng Rau Của Maya';
    case 'prop_rad_meter':
      return '☢️ Đồng Hồ Đo Bức Xạ Ngoài Trời';
    case 'locked_glass_door':
      return 'Cửa Kho Chứa Vật Tư';
    case 'supply_trolley':
      return '🛒 Xe Đẩy Hàng Kho Vật Tư (Lấy / Đặt)';
    case 'rover_console':
      return '🛸 Máy Tính Điều Khiển EVA Surface & Rover';
    case 'botany_lab':
      return '🌱 Buồng Thực Vật & Tảo Spirulina (Botany Lab)';
    case 'med_bay':
      return '🩺 Trạm Y Tế, OGS/WRS & Bàn Chế Tạo';
    case 'chamber_water':
      return '💧 Buồng Tái Chế Nước & Vách Chắn Bức Xạ';
    case 'chamber_oxygen':
      return '🫁 Buồng Điện Phân Oxy & Đường Ống Khí';
    default:
      return targetId;
  }
}

export function getPostShiftDialogue(
  shift: ShiftNumber,
  choiceId: ChoiceId,
  lang: Language = 'vi',
): DialogueTurn[] {
  if (lang === 'en') {
    switch (shift) {
      case 1:
        return choiceId === 'A'
          ? [
              { speaker: 'sam', speakerName: 'Engineer Sam', text: 'Air pumps and O₂ blowers are locked on steady power!' },
              { speaker: 'maya', speakerName: 'Dr. Maya', text: 'Grow lights dimmed slightly, so I will monitor the leaves.' },
            ]
          : [
              { speaker: 'maya', speakerName: 'Dr. Maya', text: 'Thank you! The Veggie grow lights are glowing bright!' },
              { speaker: 'sam', speakerName: 'Engineer Sam', text: 'Watch out! Cabin O₂ dipped slightly while saving plants.' },
            ];
      case 2:
        return choiceId === 'A'
          ? [
              { speaker: 'sam', speakerName: 'Engineer Sam', text: 'OGS oxygen electrolysis is holding steady at 21.3 kPa!' },
              { speaker: 'maya', speakerName: 'Dr. Maya', text: 'Every liter of pure water keeps both crew and lungs safe.' },
            ]
          : [
              { speaker: 'maya', speakerName: 'Dr. Maya', text: 'Battery reserve stayed intact, though O₂ pressure dipped!' },
              { speaker: 'sam', speakerName: 'Engineer Sam', text: 'Let us boost OGS at Medical Bay if O₂ drops further.' },
            ];
      case 3:
        return choiceId === 'A'
          ? [
              { speaker: 'maya', speakerName: 'Dr. Maya', text: 'Thermal bulkheads held 37.0°C right through -170°C polar cold!' },
              { speaker: 'sam', speakerName: 'Engineer Sam', text: 'Batteries spent 2 units, so watch solar recharging at dawn.' },
            ]
          : [
              { speaker: 'sam', speakerName: 'Engineer Sam', text: 'Battery cells held charge, but the crew is shivering!' },
              { speaker: 'maya', speakerName: 'Dr. Maya', text: 'Body temp dropped—check crew health in Medical Bay!' },
            ];
      case 4:
        return choiceId === 'A'
          ? [
              { speaker: 'sam', speakerName: 'Engineer Sam', text: '98% WRS water recycling loop is spotless and steady!' },
              { speaker: 'maya', speakerName: 'Dr. Maya', text: 'Hydroponics paused briefly, but hydration stays at 2.8 L/day.' },
            ]
          : [
              { speaker: 'maya', speakerName: 'Dr. Maya', text: 'Plants stayed hydrated, yet reserve tanks are leaking fast!' },
              { speaker: 'sam', speakerName: 'Engineer Sam', text: 'Clogged WRS filters drain precious water every shift.' },
            ];
      case 5:
        return choiceId === 'A'
          ? [
              { speaker: 'sam', speakerName: 'Engineer Sam', text: 'Airlocks sealed and HEPA 99.97% trapped every regolith shard!' },
              { speaker: 'maya', speakerName: 'Dr. Maya', text: 'Lunar dust stays outside where it belongs. Lungs are safe!' },
            ]
          : [
              { speaker: 'sam', speakerName: 'Engineer Sam', text: 'Solar arrays are clean, but regolith slipped into our lungs!' },
              { speaker: 'maya', speakerName: 'Dr. Maya', text: 'Visit Medical Bay for HEPA air rinse and treatment right away.' },
            ];
      case 6:
        return choiceId === 'A'
          ? [
              { speaker: 'maya', speakerName: 'Dr. Maya', text: 'Spirulina algae and Veggie trays are thriving! +450 kcal ready!' },
              { speaker: 'sam', speakerName: 'Engineer Sam', text: 'Fresh oxygen from plants also gave cabin air a real lift.' },
            ]
          : [
              { speaker: 'sam', speakerName: 'Engineer Sam', text: 'Power and water stayed banked for tomorrow.' },
              { speaker: 'maya', speakerName: 'Dr. Maya', text: 'Spirulina dimmed—harvest calories in Botany Lab soon.' },
            ];
      case 7:
        return choiceId === 'A'
          ? [
              { speaker: 'sam', speakerName: 'Engineer Sam', text: 'Fresh LiOH canister locked! Cabin CO₂ dropped safely.' },
              { speaker: 'maya', speakerName: 'Dr. Maya', text: 'Thinking feels sharp again! One more day until Starship HLS.' },
            ]
          : [
              { speaker: 'maya', speakerName: 'Dr. Maya', text: 'Cabin air feels heavy with rising CO₂.' },
              { speaker: 'sam', speakerName: 'Engineer Sam', text: 'Keep vents clear and prepare for the incoming solar flare!' },
            ];
      case 8:
        return choiceId === 'A'
          ? [
              { speaker: 'maya', speakerName: 'Dr. Maya', text: 'Water-walls and Potassium Iodide kept radiation safe!' },
              { speaker: 'sam', speakerName: 'Engineer Sam', text: 'Proton storm is fading. Prepare for Starship HLS final shift!' },
            ]
          : [
              { speaker: 'sam', speakerName: 'Engineer Sam', text: 'Solar arrays hit peak output, though radiation mSv spiked!' },
              { speaker: 'maya', speakerName: 'Dr. Maya', text: 'Check Medical Bay for KI tablets before landing!' },
            ];
      case 9:
      default:
        return [
          { speaker: 'sam', speakerName: 'Engineer Sam', text: 'SpaceX Starship HLS touched down! Every crewmate survived 72 hours!' },
          { speaker: 'maya', speakerName: 'Dr. Maya', text: 'Open your Debrief Journal to inspect achievements and space science!' },
        ];
    }
  }

  switch (shift) {
    case 1:
      return choiceId === 'A'
        ? [
            { speaker: 'sam', speakerName: 'Kỹ sư Sam', text: 'Máy bơm O₂ và sưởi ấm đã nhận nguồn điện ổn định!' },
            { speaker: 'maya', speakerName: 'Tiến sĩ Maya', text: 'Đèn vườn cây giảm nhẹ một chút, mình sẽ theo dõi lá.' },
          ]
        : [
            { speaker: 'maya', speakerName: 'Tiến sĩ Maya', text: 'Cảm ơn nhé! Đèn LED vườn cây sáng rực rồi.' },
            { speaker: 'sam', speakerName: 'Kỹ sư Sam', text: 'Cẩn thận nhé! Áp suất khí trong trạm vừa giảm nhẹ.' },
          ];
    case 2:
      return choiceId === 'A'
        ? [
            { speaker: 'sam', speakerName: 'Kỹ sư Sam', text: 'Máy điện phân OGS đã ổn định trở lại mức 21.3 kPa O₂!' },
            { speaker: 'maya', speakerName: 'Tiến sĩ Maya', text: 'Nước tinh khiết giúp cả trạm hít thở nhẹ nhàng.' },
          ]
        : [
            { speaker: 'maya', speakerName: 'Tiến sĩ Maya', text: 'Pin dự trữ còn nhiều, nhưng áp suất O₂ đang tụt!' },
            { speaker: 'sam', speakerName: 'Kỹ sư Sam', text: 'Nhớ kích hoạt điện phân OGS thêm tại Khoang Y Tế nhé.' },
          ];
    case 3:
      return choiceId === 'A'
        ? [
            { speaker: 'maya', speakerName: 'Tiến sĩ Maya', text: 'Cách nhiệt tốt! Thân nhiệt đoàn giữ vững 37.0°C giữa đêm -170°C!' },
            { speaker: 'sam', speakerName: 'Kỹ sư Sam', text: 'Tốn 2 phần pin, ca tới nhớ chú ý nạp lại điện nhé.' },
          ]
        : [
            { speaker: 'sam', speakerName: 'Kỹ sư Sam', text: 'Pin vẫn được giữ lại, nhưng khoang ở lạnh buốt quá!' },
            { speaker: 'maya', speakerName: 'Tiến sĩ Maya', text: 'Thân nhiệt đoàn vừa giảm, cần kiểm tra y tế ngay!' },
          ];
    case 4:
      return choiceId === 'A'
        ? [
            { speaker: 'sam', speakerName: 'Kỹ sư Sam', text: 'Chu trình tái chế nước WRS 98% chạy êm ru rồi!' },
            { speaker: 'maya', speakerName: 'Tiến sĩ Maya', text: 'Cây tạm nhịn tưới 1 ca, nhưng nước uống 2.8 L/ngày rất an toàn.' },
          ]
        : [
            { speaker: 'maya', speakerName: 'Tiến sĩ Maya', text: 'Vườn cây tươi tắn, nhưng bồn nước sạch đang rò rỉ nhanh!' },
            { speaker: 'sam', speakerName: 'Kỹ sư Sam', text: 'Màng lọc bẩn sẽ làm hao nước dự trữ qua mỗi ca đấy.' },
          ];
    case 5:
      return choiceId === 'A'
        ? [
            { speaker: 'sam', speakerName: 'Kỹ sư Sam', text: 'Cửa Airlock đóng kín và màng lọc HEPA 99.97% đã chặn sạch bụi!' },
            { speaker: 'maya', speakerName: 'Tiến sĩ Maya', text: 'Không hạt bụi regolith nào lọt vào phổi đoàn. Tuyệt vời!' },
          ]
        : [
            { speaker: 'sam', speakerName: 'Kỹ sư Sam', text: 'Tấm pin sạch bóng nhưng bụi Mặt Trăng tràn vào khoang rồi!' },
            { speaker: 'maya', speakerName: 'Tiến sĩ Maya', text: 'Hãy vào Trạm Y Tế lọc khí HEPA và chữa phổi cho đoàn ngay!' },
          ];
    case 6:
      return choiceId === 'A'
        ? [
            { speaker: 'maya', speakerName: 'Tiến sĩ Maya', text: 'Tảo Spirulina và vườn Veggie bùng nổ! Có thêm +450 kcal dinh dưỡng!' },
            { speaker: 'sam', speakerName: 'Kỹ sư Sam', text: 'Lượng oxy sinh học từ vườn cây giúp không khí rất dễ chịu.' },
          ]
        : [
            { speaker: 'sam', speakerName: 'Kỹ sư Sam', text: 'Điện và nước dự trữ đã được giữ cho ngày cuối.' },
            { speaker: 'maya', speakerName: 'Tiến sĩ Maya', text: 'Vườn tảo hơi yếu, nhớ vào Buồng Thực Vật bổ sung dưỡng chất.' },
          ];
    case 7:
      return choiceId === 'A'
        ? [
            { speaker: 'sam', speakerName: 'Kỹ sư Sam', text: 'Hộp LiOH mới đã hút sạch CO₂ dư thừa trong cabin!' },
            { speaker: 'maya', speakerName: 'Tiến sĩ Maya', text: 'Đầu óc tỉnh táo hẳn! Chỉ còn 16 tiếng trước khi đón tàu!' },
          ]
        : [
            { speaker: 'maya', speakerName: 'Tiến sĩ Maya', text: 'Không khí ngột ngạt khiến cả đội hơi đau đầu.' },
            { speaker: 'sam', speakerName: 'Kỹ sư Sam', text: 'Cảnh giác! Radar đang báo bão bức xạ Mặt Trời sắp ập tới!' },
          ];
    case 8:
      return choiceId === 'A'
        ? [
            { speaker: 'maya', speakerName: 'Tiến sĩ Maya', text: 'Hầm Shelter ốp nước và thuốc KI đã chắn bão bức xạ an toàn!' },
            { speaker: 'sam', speakerName: 'Kỹ sư Sam', text: 'Bão đang tan dần. Chuẩn bị đón tàu SpaceX Starship HLS!' },
          ]
        : [
            { speaker: 'sam', speakerName: 'Kỹ sư Sam', text: 'Nguồn điện đạt mức tối đa, nhưng chỉ số mSv bức xạ tăng vọt!' },
            { speaker: 'maya', speakerName: 'Tiến sĩ Maya', text: 'Vào Trạm Y Tế uống thuốc Potassium Iodide ngay trước Ca cuối!' },
          ];
    case 9:
    default:
      return [
        { speaker: 'sam', speakerName: 'Kỹ sư Sam', text: 'Tàu SpaceX Starship HLS đã hạ cánh! Cả đội sống sót 72 giờ!' },
        { speaker: 'maya', speakerName: 'Tiến sĩ Maya', text: 'Mở Nhật Ký Tổng Kết xem thành tích & dữ liệu khoa học ngay!' },
      ];
  }
}

export function getCrewChatDialogue(
  npcId: 'sam' | 'maya',
  state: GameState,
  lang: Language = 'vi',
): { title: string; turns: DialogueTurn[] } {
  if (lang === 'en') {
    if (npcId === 'sam') {
      if (state.spe_active) {
        return {
          title: 'Chat with Engineer Sam',
          turns: [
            { speaker: 'sam', speakerName: 'Engineer Sam', text: 'A Solar Particle Event is blasting radiation outside!' },
            { speaker: 'sam', speakerName: 'Engineer Sam', text: 'Water-walled Shelter and KI tablets block cosmic rays.' },
          ],
        };
      }
      if (state.eclss.o2_kpa < 19.5 || state.water < 4) {
        return {
          title: 'Chat with Engineer Sam',
          turns: [
            { speaker: 'sam', speakerName: 'Engineer Sam', text: `O₂ is ${state.eclss.o2_kpa.toFixed(1)} kPa and Water tank holds ${state.water} units.` },
            { speaker: 'sam', speakerName: 'Engineer Sam', text: 'Run OGS Electrolysis or WRS Recycling in Medical Bay!' },
          ],
        };
      }
      return {
        title: 'Chat with Engineer Sam',
        turns: [
          { speaker: 'sam', speakerName: 'Engineer Sam', text: `ECLSS nominal: ${state.eclss.o2_kpa.toFixed(1)} kPa O₂, ${state.battery} battery units.` },
          { speaker: 'sam', speakerName: 'Engineer Sam', text: 'Use Click-to-Move on the EVA Map to unlock outer sectors!' },
        ],
      };
    }

    if (state.eclss.calories_kcal < 2350 || state.plant_health < 60) {
      return {
        title: 'Chat with Dr. Maya',
        turns: [
          { speaker: 'maya', speakerName: 'Dr. Maya', text: `Calories (${Math.round(state.eclss.calories_kcal)} kcal) or plants (${state.plant_health}/100) need care!` },
          { speaker: 'maya', speakerName: 'Dr. Maya', text: 'Harvest Spirulina Algae in the Botany Lab to boost crew nutrition.' },
        ],
      };
    }
    return {
      title: 'Chat with Dr. Maya',
      turns: [
        { speaker: 'maya', speakerName: 'Dr. Maya', text: `Botany crops & Spirulina are healthy (${state.plant_health}/100)!` },
        { speaker: 'maya', speakerName: 'Dr. Maya', text: 'Fresh space greens recycle CO₂ and keep morale strong.' },
      ],
    };
  }

  if (npcId === 'sam') {
    if (state.spe_active) {
      return {
        title: 'Trò chuyện cùng Kỹ sư Sam',
        turns: [
          { speaker: 'sam', speakerName: 'Kỹ sư Sam', text: 'Bão proton Mặt Trời đang dội thẳng xuống Cực Nam!' },
          { speaker: 'sam', speakerName: 'Kỹ sư Sam', text: 'Hầm Shelter ốp nước và viên Potassium Iodide giúp cản bức xạ.' },
        ],
      };
    }
    if (state.eclss.o2_kpa < 19.5 || state.water < 4) {
      return {
        title: 'Trò chuyện cùng Kỹ sư Sam',
        turns: [
          { speaker: 'sam', speakerName: 'Kỹ sư Sam', text: `O₂ hiện tại ${state.eclss.o2_kpa.toFixed(1)} kPa, Nước còn ${state.water} bình.` },
          { speaker: 'sam', speakerName: 'Kỹ sư Sam', text: 'Có thể kích hoạt OGS & WRS tại Trạm Y Tế để bù ngay!' },
        ],
      };
    }
    return {
      title: 'Trò chuyện cùng Kỹ sư Sam',
      turns: [
        { speaker: 'sam', speakerName: 'Kỹ sư Sam', text: `ECLSS ổn định: ${state.eclss.o2_kpa.toFixed(1)} kPa O₂, ${state.battery} phần pin.` },
        { speaker: 'sam', speakerName: 'Kỹ sư Sam', text: 'Dùng bản đồ EVA click chuột để mở rộng cả 3 khu vực ngoài trạm!' },
      ],
    };
  }

  if (state.eclss.calories_kcal < 2350 || state.plant_health < 60) {
    return {
      title: 'Trò chuyện cùng Tiến sĩ Maya',
      turns: [
        { speaker: 'maya', speakerName: 'Tiến sĩ Maya', text: `Calo (${Math.round(state.eclss.calories_kcal)} kcal) hoặc cây (${state.plant_health}/100) đang giảm!` },
        { speaker: 'maya', speakerName: 'Tiến sĩ Maya', text: 'Hãy vào Buồng Thực Vật thu hoạch Tảo Spirulina nhé.' },
      ],
    };
  }

  return {
    title: 'Trò chuyện cùng Tiến sĩ Maya',
    turns: [
      { speaker: 'maya', speakerName: 'Tiến sĩ Maya', text: `Vườn rau & Tảo Spirulina rất xanh tốt (${state.plant_health}/100)!` },
      { speaker: 'maya', speakerName: 'Tiến sĩ Maya', text: 'Cây xanh giúp hấp thụ CO₂ và nhả thêm oxy thở tự nhiên.' },
    ],
  };
}

export function getPropFunFact(
  propId: string,
  lang: Language = 'vi',
): { title: string; turns: DialogueTurn[] } {
  if (lang === 'en') {
    switch (propId) {
      case 'prop_earth_window':
        return {
          title: '🔭 Earth Observation Scope',
          turns: [
            { speaker: 'system', speakerName: 'Aurora Station Note', text: 'From the Moon, Earth looks like a glowing blue marble!' },
            { speaker: 'system', speakerName: 'Space Science Fact', text: 'Light takes over one second to travel from Earth.' },
          ],
        };
      case 'prop_maya_journal':
        return {
          title: "📓 Maya's Plant Journal",
          turns: [
            { speaker: 'maya', speakerName: "Maya's Note", text: 'Space habitats grow Red Lettuce, Dwarf Tomato, Wheat, and Spirulina!' },
            { speaker: 'maya', speakerName: "Maya's Note", text: 'Plants supply fresh nutrition (2500–3000 kcal) and clean O₂.' },
          ],
        };
      case 'prop_rad_meter':
      default:
        return {
          title: '☢️ Outdoor Radiation Meter',
          turns: [
            { speaker: 'sam', speakerName: "Sam's Note", text: 'The Moon has no thick air or magnetic shield!' },
            { speaker: 'sam', speakerName: "Sam's Note", text: 'Water walls and Potassium Iodide (KI) protect astronauts during flares.' },
          ],
        };
    }
  }

  switch (propId) {
    case 'prop_earth_window':
      return {
        title: '🔭 Cửa Sổ Quan Sát Trái Đất',
        turns: [
          { speaker: 'system', speakerName: 'Ghi chú Trạm Aurora', text: 'Từ Mặt Trăng, Trái Đất trông như viên bi xanh lơ lửng!' },
          { speaker: 'system', speakerName: 'Khoa học Không gian', text: 'Ánh sáng đi từ Trái Đất tới đây mất hơn 1 giây.' },
        ],
      };
    case 'prop_maya_journal':
      return {
        title: '📓 Nhật Ký Trồng Rau Của Maya',
        turns: [
          { speaker: 'maya', speakerName: 'Ghi chú của Maya', text: 'Buồng Veggie trồng Rau diếp, Cà chua lùn, Lúa mì & Tảo Spirulina!' },
          { speaker: 'maya', speakerName: 'Ghi chú của Maya', text: 'Cây cung cấp Calo (2500–3000 kcal/ngày) và nhả oxy thở!' },
        ],
      };
    case 'prop_rad_meter':
    default:
      return {
        title: '☢️ Đồng Hồ Đo Bức Xạ Ngoài Trời',
        turns: [
          { speaker: 'sam', speakerName: 'Ghi chú của Sam', text: 'Mặt Trăng không có khí quyển dày hay từ trường che chắn.' },
          { speaker: 'sam', speakerName: 'Ghi chú của Sam', text: 'Vách túi nước Shelter & viên Potassium Iodide bảo vệ đoàn khỏi bão!' },
        ],
      };
  }
}

const ZONE_SHORT_VI: Record<OutpostZoneId, string> = {
  control: 'Trung Tâm Điều Khiển',
  solar: 'Khu Pin Mặt Trời',
  greenhouse: 'Buồng Trồng Cây',
  habitat: 'Khu Sinh Hoạt & Hầm Shelter',
};

const ZONE_SHORT_EN: Record<OutpostZoneId, string> = {
  control: 'Mission Control Hub',
  solar: 'Solar Ridge Bay',
  greenhouse: 'Greenhouse Module',
  habitat: 'Habitat & Radiation Shelter',
};

export function getDeviceInspectionDialogue(
  targetId: string,
  state: GameState,
  lang: Language = 'vi',
): { title: string; turns: DialogueTurn[]; hintText: string } {
  const currentMeta = getShiftTriggerMeta(state.shift, lang);
  const zoneNames = lang === 'en' ? ZONE_SHORT_EN : ZONE_SHORT_VI;

  if (lang === 'en') {
    const hintText = `📍 Shift ${state.shift}/9 Target: Walk to ${currentMeta.label} in ${zoneNames[currentMeta.zone]}.`;

    switch (targetId) {
      case 'shift1_solar':
        return {
          title: '⚡ Solar Ridge Power Panel',
          turns: [
            {
              speaker: 'sam',
              speakerName: 'Power Sensor',
              text: `⚡ Supply: ${state.solar_supply + state.battery} units (${state.solar_supply}+${state.battery}). Dust storm: ${state.dust_storm_active ? 'ACTIVE' : 'Clear'}.`,
            },
          ],
          hintText,
        };
      case 'shift2_water':
        return {
          title: '💧 ECLSS OGS & Water Recovery',
          turns: [
            {
              speaker: 'sam',
              speakerName: 'ECLSS Sensor',
              text: `💧 Water: ${state.water} tanks (${state.eclss.water_l_day.toFixed(1)} L/day) · O₂: ${state.eclss.o2_kpa.toFixed(1)} kPa.`,
            },
          ],
          hintText,
        };
      case 'shift4_greenhouse':
        return {
          title: '🌱 Veggie & Spirulina Monitor',
          turns: [
            {
              speaker: 'maya',
              speakerName: "Maya's Sensor",
              text: `🌱 Plants: ${state.plant_health}/100 · Crew Energy: ${Math.round(state.eclss.calories_kcal)} kcal/day.`,
            },
          ],
          hintText,
        };
      case 'shift5_air':
        return {
          title: '🫁 Thermal & CO₂ Scrubber Unit',
          turns: [
            {
              speaker: 'sam',
              speakerName: 'Cabin Sensor',
              text: `🫁 Air Score: ${state.air_quality_score}/100 · Body Temp: ${state.eclss.body_temp_c.toFixed(1)}°C.`,
            },
          ],
          hintText,
        };
      case 'rover_console':
        return {
          title: '🛸 EVA Surface & Rover Control Terminal',
          turns: [
            {
              speaker: 'sam',
              speakerName: 'EVA Telemetry',
              text: `🛸 Radar Lv${state.eva_radar_level} · Unlocked Sectors: ${state.unlocked_sectors.length}/3. Click terrain to steer & salvage!`,
            },
          ],
          hintText,
        };
      case 'botany_lab':
        return {
          title: '🌱 Space Botany & Spirulina Lab',
          turns: [
            {
              speaker: 'maya',
              speakerName: 'Botany Monitor',
              text: `🌱 Growing Lettuce, Tomato, Wheat & Spirulina Algae (${state.plant_health}/100).`,
            },
          ],
          hintText,
        };
      case 'med_bay':
        return {
          title: '🩺 Space Med, OGS/WRS & Crafting Bay',
          turns: [
            {
              speaker: 'maya',
              speakerName: 'Medical Sensor',
              text: `🩺 Crew Health: ${Math.round(state.crew_health)}/100 · O₂ ${state.eclss.o2_kpa.toFixed(1)} kPa · Craft HEPA & KI tablets here.`,
            },
          ],
          hintText,
        };
      case 'chamber_water':
        return {
          title: '💧 Water Recovery & Radiation Wall',
          turns: [
            {
              speaker: 'sam',
              speakerName: 'ECLSS Water Shield',
              text: '💧 Blue water bladders block solar protons while recycling 98% water!',
            },
          ],
          hintText,
        };
      case 'chamber_oxygen':
        return {
          title: '🫁 OGS Oxygen & Air Pipes Chamber',
          turns: [
            {
              speaker: 'sam',
              speakerName: 'ECLSS OGS & CDRA',
              text: `🫁 Electrolysis maintains 21.3 kPa O₂ at 0.035 kg/hr burn. Current: ${state.eclss.o2_kpa.toFixed(1)} kPa.`,
            },
          ],
          hintText,
        };
      case 'shift3_radar':
      default: {
        const hoursLeft = Math.max(0, 72 - state.mission_hours).toFixed(1);
        return {
          title: '📡 Radar & Starship HLS Command Desk',
          turns: [
            {
              speaker: 'system',
              speakerName: 'Aurora Station System',
              text: `📡 Radiation: ${state.eclss.radiation_msv.toFixed(1)} mSv · Starship HLS lands in ${hoursLeft} hours.`,
            },
          ],
          hintText,
        };
      }
    }
  }

  const hintText = `📍 Nhiệm vụ Ca ${state.shift}/9: Hãy đi tới ${currentMeta.label} tại ${zoneNames[currentMeta.zone]}.`;

  switch (targetId) {
    case 'shift1_solar':
      return {
        title: '⚡ Bảng Điện Solar Ridge',
        turns: [
          {
            speaker: 'sam',
            speakerName: 'Cảm biến Năng lượng',
            text: `⚡ Nguồn điện: ${state.solar_supply + state.battery} phần (${state.solar_supply}+${state.battery}). Bão bụi: ${state.dust_storm_active ? 'ĐANG HOẠT ĐỘNG' : 'Yên tĩnh'}.`,
          },
        ],
        hintText,
      };
    case 'shift2_water':
      return {
        title: '💧 Trạm Điện Phân OGS & Nước ECLSS',
        turns: [
          {
            speaker: 'sam',
            speakerName: 'Cảm biến ECLSS',
            text: `💧 Nước sạch: ${state.water} bình (${state.eclss.water_l_day.toFixed(1)} L/ngày) · O₂: ${state.eclss.o2_kpa.toFixed(1)} kPa.`,
          },
        ],
        hintText,
      };
    case 'shift4_greenhouse':
      return {
        title: '🌱 Bảng Vườn Veggie & Tảo Spirulina',
        turns: [
          {
            speaker: 'maya',
            speakerName: 'Cảm biến Sinh học',
            text: `🌱 Cây xanh: ${state.plant_health}/100 · Dinh dưỡng: ${Math.round(state.eclss.calories_kcal)} kcal/ngày.`,
          },
        ],
        hintText,
      };
    case 'shift5_air':
      return {
        title: '🫁 Hệ Thống Nhiệt & Lọc Khí CO₂',
        turns: [
          {
            speaker: 'sam',
            speakerName: 'Cảm biến Cabin',
            text: `🫁 Không khí: ${state.air_quality_score}/100 · Thân nhiệt đoàn: ${state.eclss.body_temp_c.toFixed(1)}°C.`,
          },
        ],
        hintText,
      };
    case 'rover_console':
      return {
        title: '🛸 Máy Tính Điều Khiển EVA Surface & Rover',
        turns: [
          {
            speaker: 'sam',
            speakerName: 'Trạm Radar EVA',
            text: `🛸 Radar Cấp ${state.eva_radar_level} · Khu vực đã mở: ${state.unlocked_sectors.length}/3. Click chuột lên bản đồ để điều khiển Robot thu vật tư!`,
          },
        ],
        hintText,
      };
    case 'botany_lab':
      return {
        title: '🌱 Phòng Thực Vật & Tảo Spirulina',
        turns: [
          {
            speaker: 'maya',
            speakerName: 'Cảm biến Vườn Cây Veggie',
            text: `🌱 Đang nuôi Rau diếp, Cà chua, Lúa mì & Tảo Spirulina (${state.plant_health}/100).`,
          },
        ],
        hintText,
      };
    case 'med_bay':
      return {
        title: '🩺 Trạm Y Tế, OGS/WRS & Bàn Chế Tạo',
        turns: [
          {
            speaker: 'maya',
            speakerName: 'Cảm biến Y Tế',
            text: `🩺 Sức khỏe đoàn: ${Math.round(state.crew_health)}/100 · O₂ ${state.eclss.o2_kpa.toFixed(1)} kPa · Có thể chế tạo HEPA & thuốc KI tại đây.`,
          },
        ],
        hintText,
      };
    case 'chamber_water':
      return {
        title: '💧 Buồng Tái Chế Nước & Vách Chắn Bức Xạ',
        turns: [
          {
            speaker: 'sam',
            speakerName: 'Hệ thống Nước ECLSS',
            text: '💧 Túi nước xanh ốp tường vừa tái chế 98% nước, vừa chắn proton bức xạ!',
          },
        ],
        hintText,
      };
    case 'chamber_oxygen':
      return {
        title: '🫁 Buồng Điện Phân Oxy & Đường Ống Khí',
        turns: [
          {
            speaker: 'sam',
            speakerName: 'Hệ thống Oxy OGS',
            text: `🫁 Điện phân giữ chuẩn 21.3 kPa (0.035 kg/giờ). Hiện tại: ${state.eclss.o2_kpa.toFixed(1)} kPa.`,
          },
        ],
        hintText,
      };
    case 'shift3_radar':
    default: {
      const hoursLeft = Math.max(0, 72 - state.mission_hours).toFixed(1);
      return {
        title: '📡 Radar & Console Đón Tàu Starship HLS',
        turns: [
          {
            speaker: 'system',
            speakerName: 'Hệ thống Trạm Aurora',
            text: `📡 Bức xạ tích lũy: ${state.eclss.radiation_msv.toFixed(1)} mSv · Tàu Starship HLS hạ cánh sau ${hoursLeft} giờ.`,
          },
        ],
        hintText,
      };
    }
  }
}

export function getNpcQuestDialogue(
  npcId: 'sam' | 'maya',
  shift: ShiftNumber,
  lang: Language = 'vi',
): { title: string; turns: DialogueTurn[]; hintText: string } {
  const trigger = getShiftTriggerMeta(shift, lang);
  const speakerName = getNpcName(npcId, lang);

  if (lang === 'en') {
    const hintText = `📍 After accepting, walk to ${trigger.label}.`;
    const lineMap: Record<ShiftNumber, [string, string]> = {
      1: ['Sunlight on Solar Ridge dropped to 3 degrees!', 'Check the Solar Panel to prioritize Life Support!'],
      2: ['OGS oxygen electrolysis pressure is dropping!', 'Inspect the ECLSS Oxygen & Water Unit right away!'],
      3: ['First polar night just hit -170°C outside!', 'Seal thermal bulkheads at the Cabin Air & Heat Desk!'],
      4: ['WRS 98% water recycling filter got clogged!', 'Check the WRS Water Unit before tanks drain!'],
      5: ['Electrostatic lunar dust storm is slamming Aurora!', 'Lock Airlocks & swap HEPA at Solar Bay console!'],
      6: ['Polar night dimmed our Spirulina & Veggie trays!', 'Open the Greenhouse Monitor to restore calories & O₂!'],
      7: ['Cabin CO₂ crossed 5.3 mmHg as LiOH saturated!', 'Swap the CO₂ Scrubber canister right now!'],
      8: ['An X-class Solar Proton Storm is inbound!', 'Rush to Storm Radar at Mission Control immediately!'],
      9: ['SpaceX Starship HLS is on final approach!', 'Guide Artemis docking at Mission Control Console!'],
    };
    return {
      title: `Shift ${shift}/9 Briefing · ${speakerName}`,
      turns: [
        { speaker: npcId, speakerName, text: lineMap[shift][0] },
        { speaker: npcId, speakerName, text: lineMap[shift][1] },
      ],
      hintText,
    };
  }

  const hintText = `📍 Sau khi nhận, hãy đi tới ${trigger.label}.`;
  const lineMapVi: Record<ShiftNumber, [string, string]> = {
    1: ['Nắng góc 3° trên Solar Ridge yếu đi nhiều rồi!', 'Hãy tới Bảng Điện Solar Ridge để chia nguồn ngay!'],
    2: ['Áp suất máy điện phân Oxy OGS đang tụt xuống!', 'Hãy kiểm tra Trạm OGS & Nước ECLSS ngay!'],
    3: ['Đêm Cực Nam lạnh -170°C vừa ập xuống trạm!', 'Hãy tới Hệ Thống Nhiệt & Khí để đóng kín cách nhiệt!'],
    4: ['Bộ lọc tái chế nước WRS 98% bị nghẹt bụi rồi!', 'Hãy sửa Trạm Tái Chế Nước WRS ngay kẻo cạn nước!'],
    5: ['Bão bụi tĩnh điện regolith đang cào vào cửa trạm!', 'Hãy ra cụm Airlock Solar để khóa cửa & thay lọc HEPA!'],
    6: ['Đêm lạnh làm tảo Spirulina và vườn Veggie yếu đi!', 'Hãy tới Bảng Vườn Cây khôi phục đèn quang hợp ngay!'],
    7: ['Khí CO₂ vượt ngưỡng 5.3 mmHg do hộp LiOH bão hòa!', 'Hãy thay Bộ Lọc Không Khí CO₂ ngay lập tức!'],
    8: ['Bão bức xạ Mặt Trời cấp X-Class sắp ập tới!', 'Hãy mở Radar Bão Mặt Trời tại Trung Tâm Điều Khiển!'],
    9: ['Tàu SpaceX Starship HLS đang hạ độ cao đón đoàn!', 'Hãy tới Console Điều Phối điều hành hạ cánh cuối!'],
  };
  return {
    title: `Nhiệm vụ Ca ${shift}/9 · ${speakerName}`,
    turns: [
      { speaker: npcId, speakerName, text: lineMapVi[shift][0] },
      { speaker: npcId, speakerName, text: lineMapVi[shift][1] },
    ],
    hintText,
  };
}

export function getShiftScienceBrief(
  shift: ShiftNumber,
  npcId: 'sam' | 'maya',
  lang: Language = 'vi',
): DialogueTurn[] {
  const speakerName = getNpcName(npcId, lang);
  if (lang === 'en') {
    const enMap: Record<ShiftNumber, string[]> = {
      1: [
        'BVAD engineering rules put breathing O₂ and water pumps first.',
        'At the Lunar South Pole, 3° grazing sunlight makes dust shading severe.',
      ],
      2: [
        'OGS splits pure H₂O via electrolysis into 21.3 kPa breathable oxygen.',
        'Each astronaut consumes roughly 0.035 kg O₂ per hour.',
      ],
      3: [
        'Crater rim shadows plunge outside temperatures to -170°C.',
        'Multi-layer insulation and heating hold human body temp at 37.0°C.',
      ],
      4: [
        'ISS & Aurora WRS recycle 98% of crew moisture into 2.5–3.0 L/day drinking water.',
        'Dirty cartridges double water loss every 8-hour shift.',
      ],
      5: [
        'Lunar regolith dust is razor-sharp silicate glass that damages lungs.',
        'HEPA 99.97% filters capture dust smaller than 0.3 micrometers.',
      ],
      6: [
        'Spirulina algae and Veggie greens convert CO₂ into edible calories and O₂.',
        'Astronauts need 2500–3000 kcal/day to sustain energy in 1/6G.',
      ],
      7: [
        'Without natural wind, exhaled CO₂ pools inside sealed cabins.',
        'LiOH chemical scrubbers keep CO₂ below the safe 5.3 mmHg ceiling.',
      ],
      8: [
        'The Moon has no magnetic field against fast solar proton flares.',
        'Thick water bladders and Potassium Iodide shield cells from radiation.',
      ],
      9: [
        'SpaceX Starship HLS lands astronauts & cargo near South Pole sunlit rims.',
        'Steady O₂, water, and beacons ensure a safe Artemis-class rendezvous.',
      ],
    };
    return [
      { speaker: 'operator', speakerName: 'You (Commander)', text: `What space science drives Shift ${shift}?` },
      { speaker: npcId, speakerName, text: enMap[shift][0] },
      { speaker: npcId, speakerName, text: enMap[shift][1] },
    ];
  }

  const viMap: Record<ShiftNumber, string[]> = {
    1: [
      'Chuẩn kỹ thuật BVAD luôn ưu tiên điện cho khí O₂ và nước sạch số 1.',
      'Tại Cực Nam Mặt Trăng, nắng góc 3° dễ bị bụi tĩnh điện che khuất pin.',
    ],
    2: [
      'Máy OGS tách nước H₂O bằng điện phân tạo áp suất chuẩn 21.3 kPa O₂.',
      'Mỗi phi hành gia tiêu thụ khoảng 0.035 kg khí oxy mỗi giờ.',
    ],
    3: [
      'Khi bóng hố thiên thạch che khuất nắng, vỏ trạm tụt xuống -170°C.',
      'Cách nhiệt đa lớp & sưởi giúp giữ thân nhiệt người ổn định 37.0°C.',
    ],
    4: [
      'Hệ thống WRS tái chế tới 98% nước thải đáp ứng 2.5–3.0 L/ngày cho mỗi người.',
      'Nếu lõi lọc nghẹt, lượng nước dự trữ sẽ thất thoát cực nhanh.',
    ],
    5: [
      'Bụi regolith Mặt Trăng sắc như thủy tinh vụn và bám tĩnh điện rất dai.',
      'Bộ lọc HEPA 99.97% chặn được hạt bụi siêu mịn nhỏ hơn 0.3 micromet.',
    ],
    6: [
      'Tảo Spirulina & vườn Veggie chuyển hóa CO₂ thành oxy và 2500–3000 kcal/ngày.',
      'Đèn LED Đỏ–Xanh lam (660/450 nm) tối ưu hiệu suất quang hợp trong vũ trụ.',
    ],
    7: [
      'Trong phòng kín không gió, khí CO₂ thở ra dễ tích tụ gây đau đầu.',
      'Hộp hóa chất LiOH giữ nồng độ CO₂ dưới ngưỡng an toàn 5.3 mmHg.',
    ],
    8: [
      'Mặt Trăng không có từ trường chắn dòng proton từ bão Mặt Trời.',
      'Tường túi nước hầm Shelter kết hợp thuốc Potassium Iodide giúp giảm liều mSv.',
    ],
    9: [
      'Tàu SpaceX Starship HLS cần bãi đáp sáng rõ và thông số O₂ ổn định.',
      'Giữ vững ECLSS tới giờ thứ 72 là chìa khóa hoàn tất sứ mệnh Artemis.',
    ],
  };

  return [
    { speaker: 'operator', speakerName: 'Bạn (Điều hành)', text: `Nguyên lý khoa học nào đứng sau sự cố Ca ${shift}?` },
    { speaker: npcId, speakerName, text: viMap[shift][0] },
    { speaker: npcId, speakerName, text: viMap[shift][1] },
  ];
}

export function getNpcQuestChoices(
  npcId: 'sam' | 'maya',
  state: GameState,
  lang: Language = 'vi',
): DialogueChoiceOption[] {
  const trigger = getShiftTriggerMeta(state.shift, lang);
  const chat = getCrewChatDialogue(npcId, state, lang);
  if (lang === 'en') {
    return [
      {
        id: 'accept',
        label: `✅ Accept Shift ${state.shift}/9 Mission (Go to ${trigger.label})`,
        tone: 'primary',
        action: 'accept_quest',
      },
      {
        id: 'science',
        label: `🔬 Ask space science behind Shift ${state.shift}`,
        tone: 'science',
        action: 'reply',
        replyTurns: getShiftScienceBrief(state.shift, npcId, 'en'),
        hintText: '📍 Open the EVA Surface Terminal to steer & salvage spare parts!',
      },
      {
        id: 'open_lib',
        label: '📚 Open Knowledge Cards on iPad',
        tone: 'science',
        action: 'open_science',
      },
      {
        id: 'rover',
        label: '🛸 Launch Click-to-Move EVA Surface & Radar Map',
        tone: 'info',
        action: 'open_rover',
      },
      {
        id: 'status',
        label: '📊 Ask about ECLSS telemetry & crew health',
        tone: 'info',
        action: 'reply',
        replyTurns: chat.turns,
        hintText: `📍 Accept the briefing to unlock Shift ${state.shift} console.`,
      },
      {
        id: 'leave',
        label: '🚪 Leave / Close',
        tone: 'exit',
        action: 'close',
      },
    ];
  }

  return [
    {
      id: 'accept',
      label: `✅ Nhận nhiệm vụ Ca ${state.shift}/9 (Tới ${trigger.label})`,
      tone: 'primary',
      action: 'accept_quest',
    },
    {
      id: 'science',
      label: `🔬 Hỏi nguyên lý khoa học về Ca ${shiftLabel(state.shift)}`,
      tone: 'science',
      action: 'reply',
      replyTurns: getShiftScienceBrief(state.shift, npcId, 'vi'),
      hintText: '📍 Cần tìm linh kiện hoặc mở khu vực mới? Mở bản đồ EVA Surface!',
    },
    {
      id: 'open_lib',
      label: '📚 Mở Thẻ Kiến Thức Khoa học (iPad)',
      tone: 'science',
      action: 'open_science',
    },
    {
      id: 'rover',
      label: '🛸 Mở Bản Đồ Thám Hiểm EVA & Radar Sương Mù',
      tone: 'info',
      action: 'open_rover',
    },
    {
      id: 'status',
      label: '📊 Hỏi thông số ECLSS & sức khỏe phi hành đoàn',
      tone: 'info',
      action: 'reply',
      replyTurns: chat.turns,
      hintText: `📍 Nhận nhiệm vụ để mở khóa ${trigger.label}.`,
    },
    {
      id: 'leave',
      label: '🚪 Rời đi / Đóng',
      tone: 'exit',
      action: 'close',
    },
  ];
}

function shiftLabel(shift: ShiftNumber): string {
  return String(shift);
}

export function getNpcChatChoices(
  npcId: 'sam' | 'maya',
  state: GameState,
  lang: Language = 'vi',
): DialogueChoiceOption[] {
  const trigger = getShiftTriggerMeta(state.shift, lang);
  const speakerName = getNpcName(npcId, lang);
  const chat = getCrewChatDialogue(npcId, state, lang);
  if (lang === 'en') {
    return [
      {
        id: 'status',
        label: '📊 Check live ECLSS systems with me',
        tone: 'info',
        action: 'reply',
        replyTurns: chat.turns,
      },
      {
        id: 'science',
        label: `🔬 Ask space science for Shift ${state.shift}`,
        tone: 'science',
        action: 'reply',
        replyTurns: getShiftScienceBrief(state.shift, npcId, 'en'),
      },
      {
        id: 'open_lib',
        label: '📚 Open Knowledge Cards (iPad)',
        tone: 'science',
        action: 'open_science',
      },
      {
        id: 'rover',
        label: '🛸 Open EVA Surface & Radar Map',
        tone: 'info',
        action: 'open_rover',
      },
      {
        id: 'objective',
        label: '📍 Remind me of our current objective',
        tone: 'info',
        action: 'reply',
        replyTurns: [
          {
            speaker: npcId,
            speakerName,
            text: state.shift_mission_accepted
              ? `Head to ${trigger.label} right now to resolve Shift ${state.shift}/9!`
              : `Find ${getPrimaryShiftNpcLabel(state.shift, 'en')} [!] to accept Shift ${state.shift}/9!`,
          },
        ],
      },
      {
        id: 'leave',
        label: '🚪 Leave / Close',
        tone: 'exit',
        action: 'close',
      },
    ];
  }

  return [
    {
      id: 'status',
      label: '📊 Hỏi tình trạng hệ thống ECLSS hiện tại',
      tone: 'info',
      action: 'reply',
      replyTurns: chat.turns,
    },
    {
      id: 'science',
      label: `🔬 Hỏi nguyên lý khoa học Ca ${state.shift}`,
      tone: 'science',
      action: 'reply',
      replyTurns: getShiftScienceBrief(state.shift, npcId, 'vi'),
    },
    {
      id: 'open_lib',
      label: '📚 Mở Thẻ Kiến Thức Khoa học (iPad)',
      tone: 'science',
      action: 'open_science',
    },
    {
      id: 'rover',
      label: '🛸 Mở Bản Đồ EVA Surface & Radar',
      tone: 'info',
      action: 'open_rover',
    },
    {
      id: 'objective',
      label: '📍 Nhắc lại mục tiêu nhiệm vụ hiện tại',
      tone: 'info',
      action: 'reply',
      replyTurns: [
        {
          speaker: npcId,
          speakerName,
          text: state.shift_mission_accepted
            ? `Hãy tới ${trigger.label} ngay để xử lý sự cố Ca ${state.shift}/9!`
            : `Hãy gặp ${getPrimaryShiftNpcLabel(state.shift, 'vi')} [!] để nhận lệnh Ca ${state.shift}/9!`,
        },
      ],
    },
    {
      id: 'leave',
      label: '🚪 Rời đi / Đóng',
      tone: 'exit',
      action: 'close',
    },
  ];
}

export function getShiftPreviewTopic(
  shift: ShiftNumber,
  lang: Language = 'vi',
): { title: string; hours: string; topic: string } {
  if (lang === 'en') {
    const map: Record<ShiftNumber, { title: string; hours: string; topic: string }> = {
      1: { title: 'Shift 1 · Solar Ridge Touchdown', hours: '00–08h (Sol 1)', topic: 'BVAD Power Priority' },
      2: { title: 'Shift 2 · OGS Oxygen Split', hours: '08–16h (Sol 1)', topic: '21.3 kPa O₂ Electrolysis' },
      3: { title: 'Shift 3 · First Polar Night -170°C', hours: '16–24h (Sol 1)', topic: 'Crater Shadow Thermal Seal' },
      4: { title: 'Shift 4 · WRS 98% Water Loop', hours: '24–32h (Sol 2)', topic: '2.5–3.0 L/day Water Recovery' },
      5: { title: 'Shift 5 · Regolith Dust Storm', hours: '32–40h (Sol 2)', topic: 'HEPA 99.97% Dust Mitigation' },
      6: { title: 'Shift 6 · Veggie & Spirulina Night', hours: '40–48h (Sol 2)', topic: '2500–3000 kcal & Bio-O₂' },
      7: { title: 'Shift 7 · CO₂ Scrubber Surge', hours: '48–56h (Sol 3)', topic: 'CDRA / LiOH < 5.3 mmHg' },
      8: { title: 'Shift 8 · Solar Radiation Storm', hours: '56–64h (Sol 3)', topic: 'Water Shelter & KI Shield' },
      9: { title: 'Shift 9 · Starship HLS Docking', hours: '64–72h (Sol 3)', topic: 'Artemis III Rescue Linkup' },
    };
    return map[shift];
  }
  const map: Record<ShiftNumber, { title: string; hours: string; topic: string }> = {
    1: { title: 'Ca 1 · Chạm đất Solar Ridge', hours: '00–08h (Ngày 1)', topic: 'Ưu tiên Nguồn BVAD' },
    2: { title: 'Ca 2 · Điện phân Oxy OGS', hours: '08–16h (Ngày 1)', topic: 'Áp suất O₂ 21.3 kPa' },
    3: { title: 'Ca 3 · Đêm Cực Lạnh -170°C', hours: '16–24h (Ngày 1)', topic: 'Cách nhiệt Thân nhiệt 37.0°C' },
    4: { title: 'Ca 4 · Vòng Nước WRS 98%', hours: '24–32h (Ngày 2)', topic: 'Tái chế 2.5–3.0 L/ngày' },
    5: { title: 'Ca 5 · Bão Bụi Regolith', hours: '32–40h (Ngày 2)', topic: 'Lọc HEPA 99.97% Chống Bụi' },
    6: { title: 'Ca 6 · Vườn Veggie & Spirulina', hours: '40–48h (Ngày 2)', topic: '2500–3000 kcal & Oxy Sinh học' },
    7: { title: 'Ca 7 · Lọc Khí CO₂ CDRA', hours: '48–56h (Ngày 3)', topic: 'Thay Hộp LiOH < 5.3 mmHg' },
    8: { title: 'Ca 8 · Bão Bức Xạ Mặt Trời', hours: '56–64h (Ngày 3)', topic: 'Hầm Nước & Thuốc KI' },
    9: { title: 'Ca 9 · Đón Tàu Starship HLS', hours: '64–72h (Ngày 3)', topic: 'Cập bến Artemis III' },
  };
  return map[shift];
}

export function getLockedConsoleDialogue(
  shift: ShiftNumber,
  lang: Language = 'vi',
): { title: string; turns: DialogueTurn[]; hintText: string } {
  const npcLabel = getPrimaryShiftNpcLabel(shift, lang);
  if (lang === 'en') {
    return {
      title: `🔒 Console Locked · Shift ${shift}/9`,
      turns: [
        {
          speaker: 'system',
          speakerName: 'Aurora Command',
          text: `Meet ${npcLabel} [!] first to receive Shift ${shift} orders.`,
        },
      ],
      hintText: `❗ Follow the red [!] beacon on the Radar or in the 3D station to talk to ${npcLabel}.`,
    };
  }
  return {
    title: `🔒 Thiết bị đang khóa · Ca ${shift}/9`,
    turns: [
      {
        speaker: 'system',
        speakerName: 'Hệ thống Trạm Aurora',
        text: `Hãy gặp ${npcLabel} [!] trước để nhận lệnh Ca ${shift}.`,
      },
    ],
    hintText: `❗ Đi theo biểu tượng [!] màu đỏ trên Radar hoặc trong trạm để gặp ${npcLabel}.`,
  };
}

export function getLockedRoverDialogue(
  lang: Language = 'vi',
): { title: string; turns: DialogueTurn[]; hintText: string } {
  if (lang === 'en') {
    return {
      title: '🔒 EVA Rover Terminal Locked',
      turns: [
        {
          speaker: 'system',
          speakerName: 'Aurora Security Protocol',
          text: 'The EVA Rover Console is locked until you accept Shift 1 and start the Solar Ridge repair procedure!',
        },
      ],
      hintText: '📍 Meet Engineer Sam [!], accept Shift 1, walk to Solar Ridge Panel, and begin the repair procedure to unlock EVA Rover.',
    };
  }
  return {
    title: '🔒 Khu Vực Robot EVA Đang Khóa',
    turns: [
      {
        speaker: 'system',
        speakerName: 'Giao Thức An Ninh Aurora',
        text: 'Máy tính điều khiển Robot EVA hiện đang khóa! Chỉ mở khóa sau khi bạn nhận nhiệm vụ Ca 1 và kích hoạt quy trình sửa chữa tại Bảng Điện Solar Ridge.',
      },
    ],
    hintText: '📍 Gặp Kỹ sư Sam [!] để nhận Ca 1, đi tới Bảng Điện Solar Ridge và kích hoạt bước thực hiện sửa chữa đầu tiên.',
  };
}

export function getCommanderWelcomeSentences(
  callsign: string,
  lang: Language = 'vi',
): string[] {
  const safeName = callsign || (lang === 'en' ? 'Astronaut' : 'Phi hành gia');
  if (lang === 'en') {
    return [
      `Touchdown confirmed at the Lunar South Pole! Welcome aboard Aurora Research Station, Commander ${safeName}.`,
      'Your mission: survive all 72 hours (3 Lunar Sols / 9 Shifts) until the SpaceX Starship HLS resupply lander touches down.',
      'Zone 1 — Mission Control Hub (Center): Monitor Solar Storm Radar, Starship HLS Docking, and the EVA Rover Terminal (unlocks once Shift 1 repair begins).',
      'Zone 2 — Solar Ridge & Outer Airlocks (West): Capture 3° grazing polar sunlight and keep Airlocks sealed against sharp electrostatic regolith dust.',
      'Zone 3 — Hydroponic Veggie Garden (East): Grow Red Lettuce, Dwarf Tomato, Wheat, and Spirulina Algae for 2500–3000 kcal/day and biological O₂.',
      'Zone 4 — Habitat, ECLSS, Med Bay & Supply Warehouse (South): Maintain 21.3 kPa O₂, 98% Water Loop, Water Shelter, and grab the Supply Trolley outside to enter the Warehouse!',
      'I am switching to autonomous station patrol now. Walk to Engineer Sam [!] or Dr. Maya [!] to receive your Shift 1 orders!',
    ];
  }
  return [
    `Đã hạ cánh chính xác xuống Cực Nam Mặt Trăng! Chào mừng phi hành gia ${safeName} tới Trạm Nghiên Cứu Aurora.`,
    'Sứ mệnh của bạn: sinh tồn trọn vẹn 72 giờ (3 Ngày Mặt Trăng / 9 Ca trực) cho tới khi tàu tiếp tế SpaceX Starship HLS hạ cánh đón đoàn.',
    'Khu vực 1 — Trung Tâm Điều Khiển (Giữa): Theo dõi Radar Bão Mặt Trời, bàn đón Starship HLS và máy tính Robot EVA (mở khóa khi bắt đầu sửa Ca 1).',
    'Khu vực 2 — Khu Pin Mặt Trời & Cửa Airlock (Phía Tây): Đón ánh nắng góc thấp 3° Cực Nam và khóa cửa Airlock chống bụi regolith tĩnh điện.',
    'Khu vực 3 — Buồng Thực Vật Thủy Canh Veggie (Phía Đông): Nuôi Rau diếp, Cà chua, Lúa mì & Tảo Spirulina tạo 2500–3000 kcal/ngày và oxy sinh học.',
    'Khu vực 4 — Sinh Hoạt, Hầm Shelter, Y Tế & Kho Chứa Vật Tư (Phía Nam): Giữ 21.3 kPa O₂, tái chế nước 98%, và nhớ đẩy xe chở hàng ở cửa trước khi vào Kho Chứa!',
    'Tôi sẽ chuyển sang tuần tra tự động bảo vệ trạm. Hãy tìm gặp Kỹ sư Sam [!] hoặc Tiến sĩ Maya [!] ngay để nhận lệnh Ca 1!',
  ];
}

export function getCommanderMedBayGuide(
  callsign: string,
  lang: Language = 'vi',
): string[] {
  const safeName = callsign || (lang === 'en' ? 'Astronaut' : 'Phi hành gia');
  if (lang === 'en') {
    return [
      `Welcome to the Aurora Space Medical, ECLSS & Crafting Bay, ${safeName}.`,
      'Here you track crew health, 37.0°C thermal stability, radiation mSv exposure, HEPA dust rinsing, and ARED workouts against 1/6G bone loss.',
      'You can also boost OGS Oxygen Electrolysis (21.3 kPa), run WRS 98% Water Recovery, or craft HEPA filters and Potassium Iodide (KI) tablets.',
      'Press [B] anytime on your iPad to view your read-only Personal Medical Profile synced live with this station. Opening Medical Bay now!',
    ];
  }
  return [
    `Chào mừng ${safeName} tới Trạm Y Tế Không Gian, ECLSS & Bàn Chế Tạo Aurora.`,
    'Tại đây bạn theo dõi sức khỏe đoàn, thân nhiệt 37.0°C, liều bức xạ mSv, rửa lọc bụi phổi HEPA và tập kháng lực ARED chống teo cơ 1/6G.',
    'Bạn còn có thể vận hành điện phân Oxy OGS (21.3 kPa), tái chế nước WRS 98% và chế tạo màng HEPA hoặc thuốc chống xạ Potassium Iodide (KI).',
    'Mẹo nhanh: Nhấn phím [B] bất cứ lúc nào để mở Hồ sơ Y Tế Cá Nhân (chỉ xem) trên iPad đồng bộ trực tiếp với trạm này. Đang mở Trạm Y Tế!',
  ];
}

export function getNpcSequentialQuestBriefing(
  npcId: 'sam' | 'maya',
  shift: ShiftNumber,
  lang: Language = 'vi',
): {
  title: string;
  steps: SequentialBriefingStep[];
  finalActionLabel: string;
  hintText: string;
} {
  const def = QUEST_DEFINITIONS[shift];
  const trigger = getShiftTriggerMeta(shift, lang);
  const speakerName = getNpcName(npcId, lang);

  if (lang === 'en') {
    return {
      title: `Shift ${shift}/9 Mission Briefing · ${speakerName}`,
      steps: [
        {
          tag: 'STEP 1/3 · MISSION CONTEXT',
          speaker: npcId,
          speakerName,
          text: `[${def.briefingTitleEn}] ${def.briefingCauseEn} ${def.briefingRiskEn}`,
          typewriterLock: true,
        },
        {
          tag: `STEP 2/3 · TECHNICAL KNOWLEDGE (${def.nasaModuleCode})`,
          speaker: npcId,
          speakerName,
          text: `${def.nasaModuleTitleEn}: ${def.nasaFactsEn.join(' ')}`,
          typewriterLock: true,
        },
        {
          tag: 'STEP 3/3 · CONFIRM MISSION ORDERS',
          speaker: npcId,
          speakerName,
          text: `Your target is ${trigger.label}. Confirm below to unlock the terminal and begin repairs immediately!`,
          hintText: `📍 After accepting, walk to ${trigger.label}.`,
          typewriterLock: false,
        },
      ],
      finalActionLabel: '✅ Accept Mission',
      hintText: `📍 After accepting, walk to ${trigger.label}.`,
    };
  }

  return {
    title: `Giao Nhiệm Vụ Ca ${shift}/9 · ${speakerName}`,
    steps: [
      {
        tag: 'BƯỚC 1/3 · NGỮ CẢNH VỀ NHIỆM VỤ',
        speaker: npcId,
        speakerName,
        text: `[${def.briefingTitleVi}] ${def.briefingCauseVi} ${def.briefingRiskVi}`,
        typewriterLock: true,
      },
      {
        tag: `BƯỚC 2/3 · KIẾN THỨC KỸ THUẬT TRẠM (${def.nasaModuleCode})`,
        speaker: npcId,
        speakerName,
        text: `${def.nasaModuleTitleVi}: ${def.nasaFactsVi.join(' ')}`,
        typewriterLock: true,
      },
      {
        tag: 'BƯỚC 3/3 · NHẬN NHIỆM VỤ',
        speaker: npcId,
        speakerName,
        text: `Thiết bị cần xử lý: ${trigger.label}. Hãy bấm xác nhận bên dưới để mở khóa bảng điều khiển và tiến hành sửa chữa!`,
        hintText: `📍 Sau khi nhận nhiệm vụ, hãy đi tới ${trigger.label}.`,
        typewriterLock: false,
      },
    ],
    finalActionLabel: '✅ Nhận nhiệm vụ',
    hintText: `📍 Sau khi nhận nhiệm vụ, hãy đi tới ${trigger.label}.`,
  };
}
