import { Language, OutpostZoneId, QualityMode, ResolvedQualityTier } from './types';

export interface UiCopy {
  prologueTag: string;
  titleSubtitle: string;
  prologueLine1: string;
  prologueLine2: string;
  prologueLine3: string;
  startMissionBtn: string;
  controlsHint: string;
  introHeaderTag: string;
  introTitle: string;
  introShiftDuration: string;
  introDesc: string;
  sysPowerTitle: string;
  sysPowerDesc: string;
  sysWaterTitle: string;
  sysWaterDesc: string;
  sysGardenTitle: string;
  sysGardenDesc: string;
  sysShelterTitle: string;
  sysShelterDesc: string;
  introTip: string;
  enterShift1Btn: string;

  // Onboarding: Callsign + Cutscene + Commander
  callsignTag: string;
  callsignTitle: string;
  callsignDesc: string;
  callsignPlaceholder: string;
  callsignRuleHint: string;
  callsignConfirmBtn: string;
  callsignBackBtn: string;
  startIdCardTitle: string;
  startBadgeLabel: string;
  startLaunchCta: string;
  startAudioTip: string;
  startBadges: Record<'rocket' | 'moon' | 'planet' | 'star', { icon: string; label: string }>;
  cutsceneSkipBtn: string;
  cutsceneNextBtn: string;
  cutsceneStages: { tag: string; title: string; subtitle: string }[];

  zones: Record<OutpostZoneId, string>;
  zonesShort: Record<OutpostZoneId, string>;
  zonesDock: Record<OutpostZoneId, string>;

  objectiveLabel: string;
  speAlert: string;
  dustAlert: string;
  thermalAlert: string;
  statPower: string;
  statWater: string;
  waterUnit: string;
  statAir: string;
  statPlant: string;
  statRadiation: string;
  statHealth: string;
  ailmentsActive: (count: number) => string;
  healthyTag: string;
  radRisk: string;
  radSafe: string;
  radNormal: string;
  muteOn: string;
  muteOff: string;
  volumeLabel: string;
  promptOpenShift: (shift: number, label: string) => string;
  promptInteract: (label: string) => string;
  walkHint: string;
  dockShow: string;
  dockHide: string;
  walkToTarget: (label: string) => string;
  logBtn: (count: number) => string;

  radarTitle: string;
  radarShiftBadge: (shift: number) => string;
  radarShortShift: (shift: number) => string;
  radarYou: string;

  perfTitle: string;
  perfAutoLabel: string;
  perfSmooth: string;
  perfBalanced: string;
  perfEco: string;
  perfModes: Record<QualityMode, string>;
  perfModeHints: Record<QualityMode, string>;
  perfTierNames: Record<ResolvedQualityTier, string>;
  mouseSensLabel: string;
  networkOnline: string;
  networkOffline: string;

  consoleCloseTip: string;
  consequenceHeader: (eventId: string) => string;
  visualCuePrefix: string;
  btnScienceCard: string;
  btnCrewDialogue: string;
  btnContinueShift: (nextShift: number) => string;
  gameAbstractionShort: string;

  // 4-Step Quest UI
  questStepLabels: [string, string, string, string];
  questBriefingTag: string;
  questCauseLabel: string;
  questRiskLabel: string;
  questGoToKnowledgeBtn: string;
  questKnowledgeTag: string;
  questKnowledgeConfirmBtn: string;
  questExecuteTag: string;
  questConfirmExecuteBtn: string;
  questExecTimerLabel: (secs: number) => string;
  questSubQuestTag: string;
  questSubQuestRetryBtn: string;

  dialoguePostShift: string;
  dialogueDeviceStatus: string;
  dialogueQuestAccept: string;
  dialogueExplore: string;
  dialogueClose: string;
  dialogueGotIt: string;
  dialogueAcceptMission: string;
  dialogueNextShift: string;
  dialogueViewDebrief: string;
  dialogueShiftHeader: (shift: number) => string;
  vnPlayerOptionsTitle: string;
  vnLeaveOption: string;
  vnNextLine: string;

  infoPanelTitle: string;
  infoButtonTip: string;
  progressTreeButtonTip: string;
  pauseButtonTip: string;
  shiftBadgeLabel: (shift: number) => string;
  meetNpcAction: (npcName: string) => string;
  goToConsoleAction: (targetLabel: string) => string;
  promptAcceptQuest: (npcName: string) => string;
  promptLockedConsole: (shift: number) => string;
  promptOpenAirlock: (label: string) => string;
  promptCloseAirlock: (label: string) => string;
  promptTryLockedDoor: (label: string) => string;
  freeLookHint: string;
  escUnlockedHint: string;
  ctrlLockBarHint: string;
  lockedDoorNotice: string;
  lockedRoomShiftNotice: string;
  roomUnlockNotice: (roomNames: string) => string;
  roomUnlockNames: Record<'solar' | 'eclss' | 'shelter' | 'greenhouse' | 'med_bay' | 'warehouse', string>;
  airlockOpenTag: string;
  airlockLockedTag: string;
  doorSolarControl: string;
  doorSolarBay: string;
  doorGhControl: string;
  doorGhBay: string;
  doorHabControl: string;
  doorHabBay: string;
  doorMedBay: string;
  doorWarehouse: string;
  doorShelter: string;
  dataPadHeader: string;
  dataPadShortcutHint: string;
  tabTelemetry: string;
  tabMedical: string;
  tabTree: string;
  tabRadar: string;
  tabAchievements: string;
  medProfileHeader: string;
  medProfileReadOnlyBadge: string;
  medProfileHeartRate: string;
  medProfileSpo2: string;
  medProfileDustLevel: string;
  warehouseTrolleyBlocked: string;
  trolleyAttachedBadge: string;
  promptGrabTrolley: string;
  promptParkTrolley: string;
  achievementModalHeader: string;
  achievementCloseBtn: string;
  roverCooldownBanner: (secs: number) => string;
  roverMaintenanceTitle: string;
  roverMaintenanceDesc: string;
  roverBreakdownDesc: string;
  roverRepairBtn: (hasScrap: boolean) => string;
  roverLockedNotice: string;
  commsTitle: string;
  commsShiftStart: (shift: number, hours: string, npcName: string) => string;
  commsShift1Start: (npcName: string) => string;
  redAlertBanner: string;
  pauseTitle: string;
  pauseSubtitle: string;
  pauseResumeBtn: string;
  pauseRestartBtn: string;
  pauseLibraryBtn: string;

  treeTitle: string;
  treeSubtitle: string;
  treeShortcutHint: string;
  treeCloseBtn: string;
  treePrologueTitle: string;
  treePrologueDesc: string;
  treeDoneTag: string;
  treeActiveTag: string;
  treeLockedTag: string;
  treeWaitingNpc: (npcName: string) => string;
  treeGoConsole: (consoleName: string) => string;
  treeLockedHint: (topic: string) => string;

  logTitle: (count: number) => string;
  logEmpty: string;
  logPicked: (id: string) => string;
  logChoiceLabel: string;
  logOutcomeLabel: string;

  debriefTag: string;
  debriefTitle: string;
  debriefCompleted: (count: number) => string;
  debriefStableTitle: string;
  debriefStableSub: string;
  debriefStressTitle: string;
  debriefStressSub: string;
  debriefFailTitle: string;
  debriefFailDefault: string;
  debriefBattery: string;
  debriefWater: string;
  debriefAir: string;
  debriefGarden: string;
  debriefRad: string;
  powerUnit: string;
  radUnit: string;
  radBoxTitle: (units: number) => string;
  radBoxCompare: string;
  debriefDecisionsTitle: string;
  debriefShiftLabel: (shift: number, title: string) => string;
  debriefChosen: (id: string, label: string) => string;
  debriefResultLabel: string;
  debriefSourceLabel: string;
  debriefOpenLibrary: string;
  debriefRetry: string;

  libTag: string;
  libTitle: string;
  libMetricsLabel: string;
  libRefLabel: string;
  libCloseBtn: string;

  repairMissingTitle: string;
  repairMissingHint: string;
  repairOpenRoverBtn: string;
  repairStepPrompt: (stepNum: number) => string;
  repairMalfunctionBanner: (secs: number) => string;
  repairCompletedTag: string;
  roverTitle: string;
  roverSubtitle: string;
  roverControlsHint: string;
  roverShieldLabel: string;
  roverTargetLabel: string;
  roverSalvagedLabel: string;
  roverDockBtn: string;
  roverResetBtn: string;
  botanyTitle: string;
  botanySubtitle: string;
  botanyWaterBtn: string;
  botanyLedBtn: string;
  botanyPollinateBtn: string;
  botanyGrowthLabel: string;
  medTitle: string;
  medSubtitle: string;
  medAredBtn: string;
  medHepaBtn: string;
  medNoAilments: string;
  medTreatKitBtn: string;
  medTreatTomatoBtn: string;
  medTreatWheatBtn: string;
}

const VI_COPY: UiCopy = {
  prologueTag: 'Trạm Nghiên Cứu Cực Nam Aurora · Chương trình Artemis & Starship HLS',
  titleSubtitle: '72 GIỜ CUỐI CÙNG • TRẠM NGHIÊN CỨU AURORA',
  prologueLine1: 'Bạn điều hành Trạm Aurora tại Cực Nam Mặt Trăng.',
  prologueLine2: 'Sinh tồn 72 giờ (3 Ngày / 9 Ca) chờ SpaceX Starship HLS.',
  prologueLine3: 'Đêm -170°C, bão bụi regolith và bão proton đang ập tới.',
  startMissionBtn: 'BẮT ĐẦU NHIỆM VỤ',
  controlsHint: 'WASD Di chuyển · Chuột Nhìn · Ctrl Hiện chuột · ESC Tạm dừng',
  introHeaderTag: 'Hồ sơ Nhiệm vụ Artemis · Trạm Aurora',
  introTitle: 'Giữ vững Trạm 72 Giờ chờ Starship HLS (9 Ca)',
  introShiftDuration: '8 giờ / Ca · 3 Ngày Mặt Trăng',
  introDesc:
    'Tàu SpaceX Starship HLS sẽ hạ cánh đón đoàn sau 72 giờ. Quản lý 4 hệ thống sinh tồn ECLSS, lái EVA trên bản đồ sương mù và sửa sự cố 4 bước:',
  sysPowerTitle: '⚡ Điện Mặt Trời & Nhiệt',
  sysPowerDesc: 'Giữ sưởi thân nhiệt 37.0°C trong đêm cực -170°C và cấp bơm khí.',
  sysWaterTitle: '🫁 O₂ OGS & Nước WRS',
  sysWaterDesc: 'Giữ áp suất 21.3 kPa O₂, lọc nước 98% (2.5–3.0 L/ngày) & hút CO₂.',
  sysGardenTitle: '🌱 Vườn Veggie & Tảo Spirulina',
  sysGardenDesc: 'Quang hợp tạo 2500–3000 kcal/ngày, vitamin và bổ sung oxy.',
  sysShelterTitle: '☢️ Hầm Shelter, Y Tế & Chế Tạo',
  sysShelterDesc: 'Chặn bụi HEPA, chế tạo viên KI chống bức xạ & tập ARED.',
  introTip: 'Quy trình 4 bước: Đọc Sự cố → Học Kỹ thuật Trạm → Xác nhận Sửa → Mở 3 Khu EVA!',
  enterShift1Btn: 'VÀO CA 1 NGAY',

  callsignTag: 'Định danh Phi hành gia · Aurora Crew Registry',
  callsignTitle: 'Nhập Định Danh Phi Hành Gia (Callsign)',
  callsignDesc: 'Tên định danh của bạn sẽ được ghi vào Nhật ký Trạm Aurora và chứng nhận 72 giờ.',
  callsignPlaceholder: 'VD: Commander_An hoặc Minh_Nguyen',
  callsignRuleHint: 'Quy tắc bắt buộc: Chỉ dùng chữ cái không dấu (a-z, A-Z) và dấu gạch dưới (_).',
  callsignConfirmBtn: 'Xác nhận Định danh & Khởi hành',
  callsignBackBtn: 'Quay lại',
  startIdCardTitle: 'THẺ PHI HÀNH GIA NHÍ · AURORA ID',
  startBadgeLabel: 'Chọn huy hiệu phi hành đoàn',
  startLaunchCta: '🚀 KHỞI HÀNH LÊN MẶT TRĂNG!',
  startAudioTip: 'Bật loa để nghe nhạc nền vũ trụ & hiệu ứng Trạm Aurora!',
  startBadges: {
    rocket: { icon: '🚀', label: 'Tên lửa' },
    moon: { icon: '🌙', label: 'Mặt Trăng' },
    planet: { icon: '🪐', label: 'Hành tinh' },
    star: { icon: '⭐', label: 'Ngôi sao' },
  },
  cutsceneSkipBtn: 'Bỏ qua (Skip)',
  cutsceneNextBtn: 'Tiếp tục',
  cutsceneStages: [
    {
      tag: 'CHẶNG 1/3 · QUỸ ĐẠO TRÁI ĐẤT → MẶT TRĂNG',
      title: 'Khởi hành tới Cực Nam Mặt Trăng',
      subtitle: 'Rời quỹ đạo Trái Đất xanh thẳm, tàu đổ bộ Artemis hướng thẳng tới vành hố Cực Nam Mặt Trăng.',
    },
    {
      tag: 'CHẶNG 2/3 · ĐÁP XUỐNG CẠNH TRẠM AURORA',
      title: 'Hạ cánh dưới ánh nắng 3° Cực Nam',
      subtitle: 'Tàu đáp nhẹ xuống bãi đá đầy hố thiên thạch bên cạnh Trạm Nghiên Cứu Aurora.',
    },
    {
      tag: 'CHẶNG 3/3 · XUYÊN CỬA KÍNH VÀO TRẠM',
      title: 'Tiến vào Trung Tâm Điều Khiển Aurora',
      subtitle: 'Khoang điều khiển sáng đèn đón đoàn. Chỉ Huy Trạm AI đang đợi bàn giao sứ mệnh 72 giờ.',
    },
  ],

  zones: {
    control: 'Trung Tâm Điều Khiển',
    solar: 'Khu Pin Mặt Trời',
    greenhouse: 'Buồng Trồng Cây',
    habitat: 'Sinh Hoạt & Hầm Shelter',
  },
  zonesShort: {
    control: 'Trung Tâm Điều Khiển',
    solar: 'Khu Pin Mặt Trời',
    greenhouse: 'Buồng Trồng Cây',
    habitat: 'Khu Sinh Hoạt & Hầm Shelter',
  },
  zonesDock: {
    control: '🖥️ Trung tâm',
    solar: '☀️ Pin Mặt Trời',
    greenhouse: '🌱 Vườn cây',
    habitat: '🏠 Hầm Shelter',
  },

  objectiveLabel: 'Mục tiêu',
  speAlert: 'SPE DETECTED · BÃO BỨC XẠ MẶT TRỜI',
  dustAlert: 'DUST STORM · BÃO BỤI REGOLITH TĨNH ĐIỆN',
  thermalAlert: 'THERMAL DROP · ĐÊM CỰC NAM -170°C',
  statPower: '⚡ Điện:',
  statWater: '💧 Nước:',
  waterUnit: 'bình',
  statAir: '🫁 Khí:',
  statPlant: '🌱 Cây:',
  statRadiation: '☢️ Bức xạ:',
  statHealth: '🩺 Y tế:',
  ailmentsActive: (count) => `${count} bệnh`,
  healthyTag: 'Khỏe',
  radRisk: 'Rủi ro',
  radSafe: 'An toàn',
  radNormal: 'Bình thường',
  muteOn: 'Bật âm thanh',
  muteOff: 'Tắt âm thanh',
  volumeLabel: 'Âm lượng',
  promptOpenShift: (shift, label) => `[E] hoặc Click: Mở Ca ${shift}/9 — ${label}`,
  promptInteract: (label) => `[E] hoặc Click: ${label}`,
  walkHint: 'Đi theo cột sáng vàng · Click trái xoay góc nhìn · WASD di chuyển',
  dockShow: 'Hiện Bảng Điều Hướng [H]',
  dockHide: 'Ẩn Bảng Điều Hướng [H]',
  walkToTarget: (label) => `Đi bộ (WASD) tới ★ ${label} → [E] / Click`,
  logBtn: (count) => `Nhật ký (${count}/9)`,

  radarTitle: 'RADAR · AURORA',
  radarShiftBadge: (shift) => `CA ${shift}/9`,
  radarShortShift: (shift) => `CA ${shift}`,
  radarYou: 'Bạn',

  perfTitle: 'Hiệu năng & Điều khiển',
  perfAutoLabel: 'Auto',
  perfSmooth: 'Mượt',
  perfBalanced: 'Cân bằng',
  perfEco: 'Tiết kiệm',
  perfModes: {
    auto: 'Auto (Tự động)',
    low: 'Low (Máy yếu)',
    medium: 'Medium (Cân bằng)',
    high: 'High (Đẹp nhất)',
  },
  perfModeHints: {
    auto: 'Tự hạ đồ họa nếu FPS dưới 35 trong 3 giây.',
    low: 'Độ phân giải retro 0.75x, tắt bóng đổ, giảm 70% hạt.',
    medium: 'Cân bằng 1x DPR, hiệu ứng ánh sáng đầy đủ.',
    high: 'Sắc nét tối đa, toàn bộ hạt & bóng đổ.',
  },
  perfTierNames: {
    low: 'Tiết kiệm',
    medium: 'Cân bằng',
    high: 'Mượt',
  },
  mouseSensLabel: 'Độ nhạy chuột',
  networkOnline: 'Offline-first · Sẵn sàng',
  networkOffline: 'Mất mạng · Vẫn chạy 100% mượt',

  consoleCloseTip: 'Đóng để đi quan sát tiếp',
  consequenceHeader: (eventId) => `KẾT QUẢ QUYẾT ĐỊNH · ${eventId}`,
  visualCuePrefix: '👁️ Quan sát trạm 3D:',
  btnScienceCard: 'XEM THẺ KHOA HỌC 🌟',
  btnCrewDialogue: 'NGHE PHẢN HỒI PHI HÀNH ĐOÀN 💬',
  btnContinueShift: (nextShift) => `TIẾP TỤC SANG CA ${nextShift}`,
  gameAbstractionShort: 'Chỉ số mô phỏng chuẩn kỹ thuật ECLSS',

  questStepLabels: [
    '1. Mô tả sự cố',
    '2. Tài liệu Kỹ thuật',
    '3. Thực hiện sửa',
    '4. Cứu hộ vật tư',
  ],
  questBriefingTag: 'BƯỚC 1/4 · PHÂN TÍCH NGUYÊN NHÂN & RỦI RO',
  questCauseLabel: 'Nguyên nhân tại Cực Nam Mặt Trăng:',
  questRiskLabel: 'Hậu quả nếu bỏ qua:',
  questGoToKnowledgeBtn: '📖 Đọc Hướng dẫn Kỹ thuật Trạm (Bước 2)',
  questKnowledgeTag: 'BƯỚC 2/4 · HƯỚNG DẪN KỸ THUẬT SINH TỒN',
  questKnowledgeConfirmBtn: '✅ Đã nắm rõ quy trình → Mở khóa Bước 3',
  questExecuteTag: 'BƯỚC 3/4 · THỰC HIỆN NHIỆM VỤ CÓ THỜI HẠN',
  questConfirmExecuteBtn: '🛠️ Xác nhận thực hiện nhiệm vụ',
  questExecTimerLabel: (secs) => `Thời gian còn lại: ${secs}s`,
  questSubQuestTag: 'BƯỚC 4/4 · NHIỆM VỤ PHỤ: TÌM KIẾM VẬT TƯ THAY THẾ',
  questSubQuestRetryBtn: '🔄 Kiểm tra vật tư vừa thu hồi & Thử lại',

  dialoguePostShift: 'PHẢN HỒI PHI HÀNH ĐOÀN',
  dialogueDeviceStatus: 'KIỂM TRA THIẾT BỊ',
  dialogueQuestAccept: 'NHẬN NHIỆM VỤ MỚI [!]',
  dialogueExplore: 'KHÁM PHÁ TRẠM AURORA',
  dialogueClose: 'Đóng hội thoại',
  dialogueGotIt: 'Đã hiểu',
  dialogueAcceptMission: '✅ Nhận nhiệm vụ',
  dialogueNextShift: 'Tiếp tục ca tiếp theo',
  dialogueViewDebrief: 'Xem Nhật Ký Tổng Kết',
  dialogueShiftHeader: (shift) => `Trao đổi sau Ca ${shift}/9`,
  vnPlayerOptionsTitle: 'Phản hồi của bạn',
  vnLeaveOption: 'Rời đi / Đóng hội thoại',
  vnNextLine: 'Câu tiếp theo',

  infoPanelTitle: 'Thông Số Trạm Aurora',
  infoButtonTip: 'Mở Data Pad [Tab / I]',
  progressTreeButtonTip: 'Cây Tiến Trình Sứ Mệnh [L]',
  pauseButtonTip: 'Tạm dừng trò chơi [P]',
  shiftBadgeLabel: (shift) => `CA ${shift}/9`,
  meetNpcAction: (npcName) => `Gặp ${npcName} [!]`,
  goToConsoleAction: (targetLabel) => `Tới ${targetLabel}`,
  promptAcceptQuest: (npcName) => `[E] hoặc Click: Nhận nhiệm vụ từ ${npcName} [!]`,
  promptLockedConsole: (shift) => `[E] hoặc Click: Chờ lệnh nhiệm vụ Ca ${shift} (Gặp NPC [!])`,
  promptOpenAirlock: (label) => `[E] hoặc Click: Mở ${label}`,
  promptCloseAirlock: (label) => `[E] hoặc Click: Đóng ${label}`,
  promptTryLockedDoor: (label) => `[E] hoặc Click: Kiểm tra ${label}`,
  freeLookHint: 'Nhấn Ctrl để hiện chuột • Click trái vào màn hình để xoay góc nhìn • [L] Cây tiến trình',
  escUnlockedHint: 'Nhấn Ctrl để hiện chuột • Click trái vào màn hình để xoay góc nhìn • [L] Cây tiến trình',
  ctrlLockBarHint: 'Ctrl Hiện chuột • ESC Tạm dừng • Tab Data Pad • B Hồ sơ Y Tế • L Cây tiến trình',
  lockedDoorNotice: '🛒 Cần đẩy xe chở hàng đi cùng để vào Kho Chứa lấy vật tư!',
  lockedRoomShiftNotice: '🔒 Khu vực sẽ mở khóa ở ca nhiệm vụ tiếp theo!',
  roomUnlockNotice: (roomNames) => `🔓 Khu vực mới đã mở khóa: ${roomNames}!`,
  roomUnlockNames: {
    solar: 'Khu Pin Mặt Trời',
    eclss: 'Hệ Thống Nước & Oxy (ECLSS)',
    shelter: 'Hầm Trú Ẩn Bức Xạ (Shelter)',
    greenhouse: 'Buồng Trồng Cây Thủy Canh',
    med_bay: 'Trạm Y Tế Aurora',
    warehouse: 'Kho Chứa Vật Tư & Robot EVA',
  },
  airlockOpenTag: 'MỞ',
  airlockLockedTag: 'ĐÓNG',
  doorSolarControl: 'Cửa Control ↔ Hành lang Tây',
  doorSolarBay: 'Cửa Hành lang Tây ↔ Pin Mặt Trời',
  doorGhControl: 'Cửa Control ↔ Hành lang Đông',
  doorGhBay: 'Cửa Hành lang Đông ↔ Vườn Cây',
  doorHabControl: 'Cửa Control ↔ Hành lang Nam',
  doorHabBay: 'Cửa Hành lang Nam ↔ Hầm Shelter',
  doorMedBay: 'Cửa Buồng Y Tế (Med Bay)',
  doorWarehouse: 'Cửa Kho Chứa Vật Tư',
  doorShelter: 'Cửa Hầm Trú Ẩn Bức Xạ',
  dataPadHeader: 'AURORA OS // iPAD KỸ THUẬT',
  dataPadShortcutHint: '[Tab/I] Thông số · [B] Y Tế · [L] Cây Tiến Trình',
  tabTelemetry: 'Thông số ECLSS',
  tabMedical: 'Hồ sơ Y Tế [B]',
  tabTree: 'Cây 9 Ca',
  tabRadar: 'Radar Trạm',
  tabAchievements: 'Thành Tích',
  medProfileHeader: 'HỒ SƠ SỨC KHỎE CÁ NHÂN ĐỒNG BỘ TRẠM Y TẾ',
  medProfileReadOnlyBadge: 'CHỈ XEM · READ-ONLY',
  medProfileHeartRate: 'Nhịp tim (BPM)',
  medProfileSpo2: 'Bão hòa Oxy Máu (SpO₂)',
  medProfileDustLevel: 'Phơi nhiễm Bụi Regolith',
  warehouseTrolleyBlocked: '🛒 Cần đẩy xe chở hàng đi cùng để vào Kho Chứa lấy vật tư!',
  trolleyAttachedBadge: '🛒 Đang đẩy Xe Chở Hàng Kho Vật Tư [E gần xe để đặt]',
  promptGrabTrolley: '[E] hoặc Click: Nắm & đẩy Xe Chở Hàng vào Kho Chứa',
  promptParkTrolley: '[E] hoặc Click: Đặt lại Xe Chở Hàng trước cửa Kho',
  achievementModalHeader: '🎉 BẠN ĐÃ ĐẠT ĐƯỢC THÀNH TỰU!',
  achievementCloseBtn: 'Đóng thông báo (X)',
  roverCooldownBanner: (secs) => `⏳ Robot EVA đang hồi phục & đồng bộ trạm: chờ ${secs}s`,
  roverMaintenanceTitle: '🔧 ROBOT EVA CẦN BẢO DƯỠNG / SỬA CHỮA',
  roverMaintenanceDesc: 'Robot đã vận hành đủ 3 chuyến định kỳ và cần bảo dưỡng trước khi tiếp tục lái.',
  roverBreakdownDesc: 'Cảnh báo RAD! Robot đi vào vùng bức xạ đỏ và bị hỏng mạch điều khiển!',
  roverRepairBtn: (hasScrap) =>
    hasScrap
      ? '🔧 Sửa chữa & Bảo dưỡng Robot (-1 Kim loại phế liệu)'
      : '🔧 Hiệu chuẩn Khẩn cấp Tại chỗ (Phục hồi Robot)',
  roverLockedNotice: '🔒 Khu vực Robot EVA đang khóa — Nhận Ca 1 & kích hoạt sửa chữa ở Solar Ridge để mở!',
  commsTitle: '📩 TIN NHẮN TRẠM AURORA',
  commsShiftStart: (shift, hours, npcName) =>
    `Bắt đầu Ca ${shift}/9 (${hours}). Hãy tìm ${npcName} [!] để nhận nhiệm vụ!`,
  commsShift1Start: (npcName) =>
    `Bắt đầu Ca 1/9 (Giờ 00–08). Hãy tìm ${npcName} [!] để nhận nhiệm vụ!`,
  redAlertBanner: '⚠️ CẢNH BÁO ĐỎ: BÃO BỨC XẠ MẶT TRỜI (SPE) ĐANG DỘI TỚI!',
  pauseTitle: 'GAME PAUSED',
  pauseSubtitle: 'Trạm Nghiên Cứu Aurora đang tạm dừng.',
  pauseResumeBtn: '▶ Tiếp tục chơi',
  pauseRestartBtn: '🔄 Chơi lại từ đầu',
  pauseLibraryBtn: '📚 Thư viện Khoa học Không gian',

  treeTitle: 'Cây Tiến Trình Sứ Mệnh 72 Giờ (9 Ca)',
  treeSubtitle: 'Trạm Nghiên Cứu Aurora · 3 Ngày Mặt Trăng (Sols)',
  treeShortcutHint: 'Nhấn [L] hoặc [ESC] để đóng',
  treeCloseBtn: 'Đóng iPad',
  treePrologueTitle: 'Hạ cánh · Cực Nam Mặt Trăng (00:00)',
  treePrologueDesc: 'Tiếp quản Trạm Aurora trong 72 giờ (9 Ca × 8 giờ) chờ SpaceX Starship HLS.',
  treeDoneTag: 'Hoàn thành',
  treeActiveTag: 'Đang thực hiện',
  treeLockedTag: 'Chưa mở khóa',
  treeWaitingNpc: (npcName) => `Đang thực hiện: Gặp ${npcName} [!] để nhận nhiệm vụ`,
  treeGoConsole: (consoleName) => `Đang thực hiện: Tới ${consoleName} để xử lý sự cố`,
  treeLockedHint: (topic) => `Chưa mở · Chủ đề Kỹ thuật: ${topic}`,

  logTitle: (count) => `Nhật Ký Quyết Định Trạm Aurora (${count}/9 Ca)`,
  logEmpty: 'Chưa có quyết định nào được ghi lại. Hãy mở Console Ca 1 để bắt đầu!',
  logPicked: (id) => `Chọn [${id}]`,
  logChoiceLabel: 'Lựa chọn:',
  logOutcomeLabel: 'Hệ quả:',

  debriefTag: 'NHẬT KÝ KHOA HỌC — TRẠM AURORA, 72 GIỜ',
  debriefTitle: '🌕 Tổng Kết Sứ Mệnh & Dữ Liệu Khoa Học',
  debriefCompleted: (count) => `Đã hoàn thành ${count} / 9 Ca (72 Giờ)`,
  debriefStableTitle: 'STABLE MISSION — SỨ MỆNH ỔN ĐỊNH XUẤT SẮC',
  debriefStableSub: 'Phi hành đoàn và các hệ thống sinh tồn Trạm Aurora đã vượt qua 72 giờ an toàn!',
  debriefStressTitle: 'MISSION UNDER STRESS — VƯỢT QUA TRONG CĂNG THẲNG',
  debriefStressSub: 'Đội đã sống sót chờ Starship HLS tới, nhưng một số hệ thống bị tổn thương hoặc bức xạ cao.',
  debriefFailTitle: 'MISSION FAILURE — NHIỆM VỤ THẤT BẠI',
  debriefFailDefault: 'Một thông số sinh tồn ECLSS đã tụt dưới ngưỡng an toàn.',
  debriefBattery: '🔋 Pin còn lại',
  debriefWater: '💧 Nước sạch',
  debriefAir: '🫁 O₂ / Khí',
  debriefGarden: '🌱 Vườn cây',
  debriefRad: '☢️ Bức xạ mSv',
  powerUnit: 'phần',
  radUnit: 'mSv',
  radBoxTitle: (units) => `☢️ TỔNG LIỀU BỨC XẠ: ${units} mSv tích lũy (mô phỏng)`,
  radBoxCompare:
    'So sánh thực tế: Phi hành gia trên ISS nhận ~80 mSv/năm (Chương trình Nghiên cứu Con người HRP 2023) · Trên Trái Đất chỉ ~3 mSv/năm.',
  debriefDecisionsTitle: 'Chuỗi 9 Ca Quyết Định & Dữ Liệu Khoa Học Thực Tế',
  debriefShiftLabel: (shift, title) => `CA ${shift}: ${title}`,
  debriefChosen: (id, label) => `Bạn chọn [${id}]: ${label}`,
  debriefResultLabel: 'Kết quả:',
  debriefSourceLabel: 'Nguồn:',
  debriefOpenLibrary: '📚 Xem Thư Viện Khoa Học Đầy Đủ (Educator / Judges Mode)',
  debriefRetry: '🔄 CHƠI LẠI SỨ MỆNH',

  libTag: 'Educator & Judges Reference Library',
  libTitle: 'Thư Viện Tài Liệu Khoa Học Không Gian (SCI-01 → SCI-11)',
  libMetricsLabel: 'Đơn vị thực tế:',
  libRefLabel: 'Ref:',
  libCloseBtn: 'Đóng Thư Viện',

  repairMissingTitle: 'THIẾU VẬT TƯ SỬA CHỮA KỸ THUẬT',
  repairMissingHint: 'Cần mở bản đồ EVA Surface & Rover thu thập hoặc chế tạo linh kiện trước khi thao tác!',
  repairOpenRoverBtn: '🛸 Mở Bản Đồ EVA Surface & Rover',
  repairStepPrompt: (stepNum) => `Chọn đúng Bước ${stepNum}/3 theo quy trình kỹ sư trưởng:`,
  repairMalfunctionBanner: (secs) => `⚡ CHẬP MẠCH HỎNG LINH KIỆN (${secs}s) — Sai quy trình hoặc hết giờ!`,
  repairCompletedTag: '✅ Đã hoàn tất sửa chữa thiết bị 3 bước',
  roverTitle: 'EVA SURFACE & RADAR // BẢN ĐỒ THÁM HIỂM MẶT TRĂNG',
  roverSubtitle: 'Click chuột lên địa hình để lái Robot xuyên sương mù · Thu hồi vật tư & mở 3 khu vực!',
  roverControlsHint: 'Click chuột trái lên bản đồ hoặc dùng WASD · Nâng cấp Radar để phá sương mù',
  roverShieldLabel: 'Lá chắn Rover',
  roverTargetLabel: 'Vật tư mục tiêu của Ca này',
  roverSalvagedLabel: 'Khoang hàng đang mang',
  roverDockBtn: '📥 Đưa Robot Về Trạm & Lưu Vật Tư',
  roverResetBtn: '🔄 Đặt Lại Vị Trí Robot',
  botanyTitle: 'BUỒNG THỰC VẬT & TẢO SPIRULINA // VEGGIE LAB',
  botanySubtitle: 'Chăm sóc 4 loài thực vật không gian (Rau diếp, Cà chua, Lúa mì, Tảo Spirulina) cung cấp 2500–3000 kcal & O₂',
  botanyWaterBtn: '💧 Tưới thủy canh',
  botanyLedBtn: '💡 Đổi phổ LED',
  botanyPollinateBtn: '🌼 Kích thích / Thụ phấn',
  botanyGrowthLabel: 'Sinh trưởng',
  medTitle: 'TRẠM Y TẾ, OGS/WRS & BÀN CHẾ TẠO THIẾT BỊ',
  medSubtitle: 'Vận hành OGS (21.3 kPa O₂), WRS (2.8 L/d), chế tạo HEPA/thuốc KI & điều trị đoàn',
  medAredBtn: '🏋️ Tập Kháng Lực ARED (Chống teo cơ/xương 1/6G)',
  medHepaBtn: '🧹 Rửa Màng Lọc Bụi Regolith HEPA',
  medNoAilments: 'Phi hành đoàn hoàn toàn khỏe mạnh — Các chỉ số y tế bình thường!',
  medTreatKitBtn: '🩹 Dùng Med-Kit',
  medTreatTomatoBtn: '🍅 Dùng Cà Chua Chống Oxy Hóa',
  medTreatWheatBtn: '🌾 Tăng Quang Hợp Lúa Mì Hút CO₂',
};

const EN_COPY: UiCopy = {
  prologueTag: 'Aurora South Pole Outpost · Artemis Program & Starship HLS',
  titleSubtitle: 'THE LAST 72 HOURS • AURORA LUNAR STATION',
  prologueLine1: 'You command Aurora Station at the Lunar South Pole.',
  prologueLine2: 'Survive 72 hours (3 Sols / 9 Shifts) until SpaceX Starship HLS arrives.',
  prologueLine3: 'Polar nights (-170°C), regolith dust, and solar storms test every system.',
  startMissionBtn: 'START MISSION',
  controlsHint: 'WASD Move · Mouse Look · Ctrl Cursor · ESC Pause',
  introHeaderTag: 'Artemis Mission Briefing · Aurora Station',
  introTitle: 'Protect Aurora 72 Hours for Starship HLS (9 Shifts)',
  introShiftDuration: '8 hours / Shift · 3 Lunar Sols',
  introDesc:
    'SpaceX Starship HLS lands to resupply and dock in 72 hours. Manage real-time ECLSS life-support metrics, steer the Click-to-Move EVA map, and follow 4-step repairs:',
  sysPowerTitle: '⚡ Solar & Polar Thermal',
  sysPowerDesc: 'Hold crew body temp at 37.0°C during -170°C crater shadows.',
  sysWaterTitle: '🫁 OGS O₂ & WRS Water',
  sysWaterDesc: 'Keep 21.3 kPa O₂ (0.035 kg/hr), 98% water (2.5–3.0 L/day) & scrub CO₂.',
  sysGardenTitle: '🌱 Veggie & Spirulina Algae',
  sysGardenDesc: 'Grow fresh crops & Spirulina for 2500–3000 kcal/day and O₂.',
  sysShelterTitle: '☢️ Shelter, Med Bay & Crafting',
  sysShelterDesc: 'Craft HEPA filters & KI anti-radiation pills, run ARED workouts.',
  introTip: '4-Step Loop: Briefing → Tech Manual → Timed Execute → EVA Salvage if damaged!',
  enterShift1Btn: 'BEGIN SHIFT 1',

  callsignTag: 'Astronaut Identification · Aurora Crew Registry',
  callsignTitle: 'Enter Astronaut Callsign',
  callsignDesc: 'Your callsign will be logged in Aurora Station records and your 72-hour Mission Debrief.',
  callsignPlaceholder: 'e.g. Commander_Alex or Lunar_One',
  callsignRuleHint: 'Strict rule: English letters (a-z, A-Z) and underscore (_) only. No digits or spaces.',
  callsignConfirmBtn: 'Confirm Callsign & Launch',
  callsignBackBtn: 'Back',
  startIdCardTitle: 'JUNIOR ASTRONAUT ID · AURORA CREW',
  startBadgeLabel: 'Pick your crew badge',
  startLaunchCta: '🚀 LAUNCH TO THE MOON!',
  startAudioTip: 'Turn audio on for space music & Aurora Station SFX!',
  startBadges: {
    rocket: { icon: '🚀', label: 'Rocket' },
    moon: { icon: '🌙', label: 'Moon' },
    planet: { icon: '🪐', label: 'Planet' },
    star: { icon: '⭐', label: 'Star' },
  },
  cutsceneSkipBtn: 'Skip Cutscene',
  cutsceneNextBtn: 'Next',
  cutsceneStages: [
    {
      tag: 'STAGE 1/3 · EARTH ORBIT TO LUNAR TRANSIT',
      title: 'Departing Earth Orbit for the Moon',
      subtitle: 'Leaving Earth behind in deep black space, the Artemis vessel sets course for the Lunar South Pole.',
    },
    {
      tag: 'STAGE 2/3 · TOUCHDOWN BESIDE AURORA STATION',
      title: 'Landing Under 3° Grazing Sunlight',
      subtitle: 'Touchdown on the cratered lunar plateau beside Aurora Research Station.',
    },
    {
      tag: 'STAGE 3/3 · GLIDING INTO MISSION CONTROL',
      title: 'Entering Aurora Command Hub',
      subtitle: 'Passing directly through the observation viewport into Aurora. Station Commander AI awaits.',
    },
  ],

  zones: {
    control: 'Mission Control Hub',
    solar: 'Solar Ridge Bay',
    greenhouse: 'Greenhouse Module',
    habitat: 'Habitat & Radiation Shelter',
  },
  zonesShort: {
    control: 'Mission Control Hub',
    solar: 'Solar Ridge Bay',
    greenhouse: 'Greenhouse Module',
    habitat: 'Habitat & Radiation Shelter',
  },
  zonesDock: {
    control: '🖥️ Control',
    solar: '☀️ Solar Bay',
    greenhouse: '🌱 Garden',
    habitat: '🏠 Shelter',
  },

  objectiveLabel: 'Target',
  speAlert: 'SPE DETECTED · SOLAR PROTON STORM',
  dustAlert: 'DUST STORM · ELECTROSTATIC REGOLITH',
  thermalAlert: 'THERMAL DROP · POLAR NIGHT -170°C',
  statPower: '⚡ Power:',
  statWater: '💧 Water:',
  waterUnit: 'units',
  statAir: '🫁 Air:',
  statPlant: '🌱 Plants:',
  statRadiation: '☢️ Radiation:',
  statHealth: '🩺 Med:',
  ailmentsActive: (count) => `${count} active`,
  healthyTag: 'Healthy',
  radRisk: 'At-Risk',
  radSafe: 'Safe',
  radNormal: 'Normal',
  muteOn: 'Unmute audio',
  muteOff: 'Mute audio',
  volumeLabel: 'Volume',
  promptOpenShift: (shift, label) => `[E] or Click: Open Shift ${shift}/9 — ${label}`,
  promptInteract: (label) => `[E] or Click: ${label}`,
  walkHint: 'Follow the gold beacon · Left-click screen to look · WASD to walk',
  dockShow: 'Show Navigation Dock [H]',
  dockHide: 'Hide Navigation Dock [H]',
  walkToTarget: (label) => `Walk (WASD) to ★ ${label} → [E] / Click`,
  logBtn: (count) => `Log (${count}/9)`,

  radarTitle: 'RADAR · AURORA',
  radarShiftBadge: (shift) => `SH ${shift}/9`,
  radarShortShift: (shift) => `SH ${shift}`,
  radarYou: 'You',

  perfTitle: 'Performance & Controls',
  perfAutoLabel: 'Auto',
  perfSmooth: 'Smooth',
  perfBalanced: 'Balanced',
  perfEco: 'Eco',
  perfModes: {
    auto: 'Auto (Adaptive)',
    low: 'Low (Lite GPU)',
    medium: 'Medium (Balanced)',
    high: 'High (Sharp)',
  },
  perfModeHints: {
    auto: 'Lowers graphics if rolling FPS drops below 35 for 3s.',
    low: 'Retro 0.75x pixel scale, shadows off, 70% fewer particles.',
    medium: 'Balanced 1x DPR with full lighting and radar.',
    high: 'Crisp resolution with full particles and shadows.',
  },
  perfTierNames: {
    low: 'Eco',
    medium: 'Balanced',
    high: 'Smooth',
  },
  mouseSensLabel: 'Mouse Sensitivity',
  networkOnline: 'Offline-first · Ready',
  networkOffline: 'Offline · 100% Local Active',

  consoleCloseTip: 'Close to keep exploring',
  consequenceHeader: (eventId) => `DECISION RESULT · ${eventId}`,
  visualCuePrefix: '👁️ 3D Station Clue:',
  btnScienceCard: 'VIEW SCIENCE CARD 🌟',
  btnCrewDialogue: 'HEAR CREW REACTION 💬',
  btnContinueShift: (nextShift) => `CONTINUE TO SHIFT ${nextShift}`,
  gameAbstractionShort: 'Real-time ECLSS life-support simulation',

  questStepLabels: [
    '1. Incident Briefing',
    '2. Tech Manual',
    '3. Execute Repair',
    '4. Salvage Sub-Quest',
  ],
  questBriefingTag: 'STEP 1/4 · ROOT CAUSE & CONSEQUENCE BRIEFING',
  questCauseLabel: 'Why it happened at Lunar South Pole:',
  questRiskLabel: 'Consequence if ignored:',
  questGoToKnowledgeBtn: '📖 Open Station Technical Manual (Step 2)',
  questKnowledgeTag: 'STEP 2/4 · STATION ENGINEERING MANUAL',
  questKnowledgeConfirmBtn: '✅ Manual Read → Unlock Step 3 Execution',
  questExecuteTag: 'STEP 3/4 · TIMED MISSION EXECUTION',
  questConfirmExecuteBtn: '🛠️ Confirm Mission Execution',
  questExecTimerLabel: (secs) => `Time remaining: ${secs}s`,
  questSubQuestTag: 'STEP 4/4 · SUB-QUEST: SEARCH FOR REPLACEMENT PARTS',
  questSubQuestRetryBtn: '🔄 Verify Salvaged Parts & Retry Repair',

  dialoguePostShift: 'CREW FEEDBACK',
  dialogueDeviceStatus: 'SYSTEM DIAGNOSTIC',
  dialogueQuestAccept: 'NEW MISSION [!]',
  dialogueExplore: 'EXPLORE AURORA STATION',
  dialogueClose: 'Close chat',
  dialogueGotIt: 'Got it',
  dialogueAcceptMission: '✅ Accept Mission',
  dialogueNextShift: 'Continue to next shift',
  dialogueViewDebrief: 'View Mission Debrief',
  dialogueShiftHeader: (shift) => `Shift ${shift}/9 Crew Debrief`,
  vnPlayerOptionsTitle: 'Your Response',
  vnLeaveOption: 'Leave / Close',
  vnNextLine: 'Next line',

  infoPanelTitle: 'Aurora Station Status',
  infoButtonTip: 'Toggle Data Pad [Tab / I]',
  progressTreeButtonTip: 'Mission Progress Tree [L]',
  pauseButtonTip: 'Pause Game [P]',
  shiftBadgeLabel: (shift) => `SHIFT ${shift}/9`,
  meetNpcAction: (npcName) => `Meet ${npcName} [!]`,
  goToConsoleAction: (targetLabel) => `Go to ${targetLabel}`,
  promptAcceptQuest: (npcName) => `[E] or Click: Accept Mission from ${npcName} [!]`,
  promptLockedConsole: (shift) => `[E] or Click: Awaiting Shift ${shift} Orders (Meet NPC [!])`,
  promptOpenAirlock: (label) => `[E] or Click: Open ${label}`,
  promptCloseAirlock: (label) => `[E] or Click: Close ${label}`,
  promptTryLockedDoor: (label) => `[E] or Click: Inspect ${label}`,
  freeLookHint: 'Press Ctrl to show cursor • Left-click screen to rotate camera • [L] Quest Tree',
  escUnlockedHint: 'Press Ctrl to show cursor • Left-click screen to rotate camera • [L] Quest Tree',
  ctrlLockBarHint: 'Ctrl Cursor • ESC Pause • Tab Data Pad • B Med Profile • L Quest Tree',
  lockedDoorNotice: '🛒 You must push the Supply Trolley to enter the Storage Warehouse!',
  lockedRoomShiftNotice: '🔒 Area unlocks in the next mission shift!',
  roomUnlockNotice: (roomNames) => `🔓 New zone unlocked: ${roomNames}!`,
  roomUnlockNames: {
    solar: 'Solar Ridge Wing',
    eclss: 'Water & O₂ ECLSS Wing',
    shelter: 'Radiation Shelter Zone',
    greenhouse: 'Veggie Hydroponics Lab',
    med_bay: 'Aurora Medical Bay',
    warehouse: 'Supply Warehouse & EVA Rover',
  },
  airlockOpenTag: 'OPEN',
  airlockLockedTag: 'SEALED',
  doorSolarControl: 'Control ↔ West Corridor',
  doorSolarBay: 'West Corridor ↔ Solar Bay',
  doorGhControl: 'Control ↔ East Corridor',
  doorGhBay: 'East Corridor ↔ Greenhouse',
  doorHabControl: 'Control ↔ South Corridor',
  doorHabBay: 'South Corridor ↔ Habitat',
  doorMedBay: 'Medical Bay Door',
  doorWarehouse: 'Supply Warehouse Door',
  doorShelter: 'Radiation Shelter Bulkhead',
  dataPadHeader: 'AURORA OS // STATION iPAD',
  dataPadShortcutHint: '[Tab/I] Telemetry · [B] Med Profile · [L] Quest Tree',
  tabTelemetry: 'ECLSS Metrics',
  tabMedical: 'Med Profile [B]',
  tabTree: '9-Shift Tree',
  tabRadar: 'Radar Map',
  tabAchievements: 'Achievements',
  medProfileHeader: 'PERSONAL MEDICAL PROFILE · SYNCED WITH MED BAY',
  medProfileReadOnlyBadge: 'READ-ONLY',
  medProfileHeartRate: 'Heart Rate (BPM)',
  medProfileSpo2: 'Blood Oxygen (SpO₂)',
  medProfileDustLevel: 'Regolith Dust Exposure',
  warehouseTrolleyBlocked: '🛒 You must push the Supply Trolley to enter the Storage Warehouse!',
  trolleyAttachedBadge: '🛒 Pushing Supply Trolley [Press E / Click to Park]',
  promptGrabTrolley: '[E] or Click: Grab & Push Supply Trolley',
  promptParkTrolley: '[E] or Click: Park Supply Trolley outside Warehouse',
  achievementModalHeader: '🎉 ACHIEVEMENT UNLOCKED!',
  achievementCloseBtn: 'Close Notification (X)',
  roverCooldownBanner: (secs) => `⏳ EVA Rover Recharging & Syncing: Ready in ${secs}s`,
  roverMaintenanceTitle: '🔧 EVA ROVER REQUIRES MAINTENANCE / REPAIR',
  roverMaintenanceDesc: 'Rover completed 3 continuous salvage runs and requires scheduled maintenance.',
  roverBreakdownDesc: 'RAD HAZARD HIT! Rover entered a red radiation zone and shorted its drive bus!',
  roverRepairBtn: (hasScrap) =>
    hasScrap
      ? '🔧 Repair & Service Rover (-1 Scrap Metal)'
      : '🔧 Emergency Field Calibration (Restore Rover)',
  roverLockedNotice: '🔒 EVA Rover Locked — Accept Shift 1 & activate Solar Ridge repair to unlock!',
  commsTitle: '📩 AURORA COMMS',
  commsShiftStart: (shift, hours, npcName) =>
    `Shift ${shift}/9 begins (${hours}). Meet ${npcName} [!] for your mission!`,
  commsShift1Start: (npcName) =>
    `Shift 1/9 begins (Hours 00–08). Meet ${npcName} [!] for your mission!`,
  redAlertBanner: '⚠️ RED ALERT: SOLAR PARTICLE RADIATION STORM (SPE) SURGE!',
  pauseTitle: 'GAME PAUSED',
  pauseSubtitle: 'Aurora Station simulation is safely paused.',
  pauseResumeBtn: '▶ Resume Game',
  pauseRestartBtn: '🔄 Restart Mission',
  pauseLibraryBtn: '📚 Space Science Library',

  treeTitle: '72-Hour Mission Progress Tree (9 Shifts)',
  treeSubtitle: 'Aurora Research Station · 3 Lunar Sols',
  treeShortcutHint: 'Press [L] or [ESC] to close',
  treeCloseBtn: 'Close iPad',
  treePrologueTitle: 'Touchdown · Lunar South Pole (00:00)',
  treePrologueDesc: 'Hold Aurora Station for 72 hours (9 Shifts × 8h) until SpaceX Starship HLS docks.',
  treeDoneTag: 'Completed',
  treeActiveTag: 'In Progress',
  treeLockedTag: 'Locked',
  treeWaitingNpc: (npcName) => `Active: Meet ${npcName} [!] to receive orders`,
  treeGoConsole: (consoleName) => `Active: Walk to ${consoleName} to resolve event`,
  treeLockedHint: (topic) => `Locked · Topic: ${topic}`,

  logTitle: (count) => `Aurora Decision Log (${count}/9 Shifts)`,
  logEmpty: 'No decisions logged yet. Open Shift 1 Console to begin!',
  logPicked: (id) => `Choice [${id}]`,
  logChoiceLabel: 'Decision:',
  logOutcomeLabel: 'Outcome:',

  debriefTag: 'SCIENCE JOURNAL — AURORA STATION, 72 HOURS',
  debriefTitle: '🌕 Mission Debrief & Scientific Evidence',
  debriefCompleted: (count) => `Completed ${count} / 9 Shifts (72 Hours)`,
  debriefStableTitle: 'STABLE MISSION — ALL SYSTEMS SAFE',
  debriefStableSub: 'All crewmates and Aurora ECLSS systems survived 72 hours safely!',
  debriefStressTitle: 'MISSION UNDER STRESS — SURVIVED WITH RISKS',
  debriefStressSub:
    'The crew survived until Starship HLS arrived, though some systems suffered stress.',
  debriefFailTitle: 'MISSION FAILURE — CRITICAL LOSS',
  debriefFailDefault: 'An essential ECLSS life-support system dropped below safe limits.',
  debriefBattery: '🔋 Battery Left',
  debriefWater: '💧 Water Left',
  debriefAir: '🫁 O₂ / Air',
  debriefGarden: '🌱 Garden Health',
  debriefRad: '☢️ Radiation mSv',
  powerUnit: 'units',
  radUnit: 'mSv',
  radBoxTitle: (units) => `☢️ TOTAL RADIATION DOSE: ${units} mSv cumulative (simulated)`,
  radBoxCompare:
    'Real comparison: ISS astronauts receive ~80 mSv/year (Human Research Program 2023) · Earth surface ~3 mSv/year.',
  debriefDecisionsTitle: '9-Shift Decision Timeline & Space Science',
  debriefShiftLabel: (shift, title) => `SHIFT ${shift}: ${title}`,
  debriefChosen: (id, label) => `Picked [${id}]: ${label}`,
  debriefResultLabel: 'Result:',
  debriefSourceLabel: 'Source:',
  debriefOpenLibrary: '📚 Open Full Science Library (Educator / Judges Mode)',
  debriefRetry: '🔄 REPLAY MISSION',

  libTag: 'Educator & Judges Reference Library',
  libTitle: 'Space Science Reference Library (SCI-01 → SCI-11)',
  libMetricsLabel: 'Physical metrics:',
  libRefLabel: 'Ref:',
  libCloseBtn: 'Close Library',

  repairMissingTitle: 'MISSING SPARE PART FOR REPAIR',
  repairMissingHint: 'Use the Click-to-Move EVA Surface Map or craft the required spare part first!',
  repairOpenRoverBtn: '🛸 Open EVA Surface & Rover Terminal',
  repairStepPrompt: (stepNum) => `Select Step ${stepNum}/3 in correct engineering order:`,
  repairMalfunctionBanner: (secs) => `⚡ PART DAMAGED / MALFUNCTION (${secs}s) — Wrong sequence or timeout!`,
  repairCompletedTag: '✅ 3-Step Engineering Repair Complete',
  roverTitle: 'EVA SURFACE & RADAR // LUNAR FOG-OF-WAR MAP',
  roverSubtitle: 'Click terrain to steer Rover through Fog of War · Salvage parts & unlock 3 outer sectors!',
  roverControlsHint: 'Left-click terrain to move (or WASD) · Upgrade Base Radar to expand vision radius',
  roverShieldLabel: 'Rover Shield',
  roverTargetLabel: 'Priority Part for Current Shift',
  roverSalvagedLabel: 'Rover Cargo Bay',
  roverDockBtn: '📥 Dock Rover & Store Cargo',
  roverResetBtn: '🔄 Reset Rover Position',
  botanyTitle: 'SPACE BOTANY & SPIRULINA LAB // VEGGIE CHAMBERS',
  botanySubtitle: 'Care for 4 space crops (Lettuce, Tomato, Wheat & Spirulina) for 2500–3000 kcal & O₂',
  botanyWaterBtn: '💧 Water Hydroponics',
  botanyLedBtn: '💡 Cycle LED Spectrum',
  botanyPollinateBtn: '🌼 Pollinate / Aerate',
  botanyGrowthLabel: 'Growth',
  medTitle: 'SPACE MED BAY, OGS/WRS & CRAFTING BENCH',
  medSubtitle: 'Operate OGS (21.3 kPa O₂), WRS (2.8 L/d), craft HEPA/KI tablets & heal astronauts',
  medAredBtn: '🏋️ Run ARED Resistive Workout (1/6G Countermeasure)',
  medHepaBtn: '🧹 Clean Airlock Regolith HEPA Filter',
  medNoAilments: 'Crew vitals nominal — No active space medicine conditions!',
  medTreatKitBtn: '🩹 Use Space Med-Kit',
  medTreatTomatoBtn: '🍅 Harvest Red Robin Tomato Antioxidants',
  medTreatWheatBtn: '🌾 Boost Apogee Wheat CO₂ Scrubbing',
};

export function getUiCopy(lang: Language): UiCopy {
  return lang === 'en' ? EN_COPY : VI_COPY;
}
