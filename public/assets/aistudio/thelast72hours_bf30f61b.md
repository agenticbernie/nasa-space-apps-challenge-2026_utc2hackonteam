# THE LAST 72 HOURS — MASTER NARRATIVE DOCUMENT
*Tổng hợp toàn bộ nội dung đã thảo luận*

---

## 1. TỔNG QUAN DỰ ÁN

### Định danh
- **Tên game:** The Last 72 Hours (72 Giờ Cuối Cùng)
- **Cuộc thi:** NASA Space Apps Challenge 2026
- **Challenge:** Build a Junior Astronaut Mission Trainer
- **Nền tảng:** Web browser (React + Vite + TypeScript + Three.js + React Three Fiber)

### Mô tả một câu
> *First-person 3D educational outpost management game: người chơi là Mission Operator của trạm nghiên cứu Lunar South Pole, đưa ra quyết định về 4 hệ thống sống còn trong 72 giờ trước và trong cơn bão Mặt Trời.*

### Đối tượng kép
- **Người chơi chính:** Trẻ em 7–12 tuổi (ngôn ngữ trực quan, học qua hậu quả quan sát được)
- **Ban giám khảo NASA:** Cần thấy tính chính xác khoa học, nguồn dữ liệu NASA rõ ràng, giá trị giáo dục thực tiễn

---

## 2. ĐỀ BÀI & MAPPING

### Yêu cầu chính thức
Thiết kế và xây dựng interactive game/app cho phép học sinh điều hành lunar hoặc Martian outpost, cân bằng các yêu cầu cạnh tranh như life support, radiation shielding, power, và food production — để trải nghiệm trực tiếp các quyết định quyết định thành bại của nhiệm vụ.

### Mapping đề bài → game

| Yêu cầu đề bài | Giải pháp trong game | Trạng thái |
|---|---|---|
| Lunar or Martian outpost | Lunar South Pole — Trạm Aurora | ✅ Confirmed |
| Life support | EVT-02 (Water Recovery), EVT-05 (CO₂ Scrubber) | ✅ |
| Radiation shielding | EVT-03 (Solar Particle Event + Shelter) | ✅ |
| Power | EVT-01 (Solar Power Decline) | ✅ |
| Food production | EVT-04 (Greenhouse Stress) | ✅ |
| Experience firsthand decisions | 6-shift decision loop, observable consequences | ✅ |
| Fails or succeeds | 3 outcomes: Stable / Stress / Failure | ✅ |
| Young learners | ≤12 từ/câu, hình ảnh, hậu quả trực quan | ✅ Refined |

---

## 3. THIẾT KẾ GAME — CÁC QUYẾT ĐỊNH ĐÃ ĐƯỢC APPROVE (repo)

### Những constraint không được thay đổi
- **Không có NPC, không có AI companion** — "AI companion/operators: Excluded"
- **Bối cảnh Mặt Trăng** (Lunar South Pole), không phải trạm quỹ đạo
- **6 ca làm việc (shifts)**, mỗi ca đại diện 12 giờ gameplay
- **Nhân vật là Mission Operator** — không có crew được hiển thị ra ngoài
- **Game quản lý tài nguyên qua console/panel**, không phải action mini-game
- **Góc nhìn first-person**, WASD + mouse look + pointer lock + E để interact
- **Không có backend** — pure client-side, TypeScript simulation engine

### Cấu trúc world
Một môi trường first-person 3D compact, kết nối:
- **Habitat** — crew shelter, life support, radiation shelter
- **Solar Ridge** — tấm pin Mặt Trời, pin dự trữ, hệ thống phân phối điện
- **Greenhouse Module** — buồng trồng cây, ánh sáng, nước, dinh dưỡng
- **Mission Control / Operations** — console trạng thái, events, log quyết định

### Core Loop
Observe → Investigate → Decide → Consequence → Learn → Next shift

### Tech Stack
React / Vite / TypeScript, Three.js với React Three Fiber, pure TypeScript simulation, Vitest

### Visual Style
"Inviting, handcrafted 16-bit lunar outpost" — low-poly 3D, pixel-art textures, retro sci-fi atmosphere. Render target ứng viên: 320×180 (cần test). Palette 16 màu/scene.

---

## 4. BA NGUYÊN TẮC VÀNG NARRATIVE

### Nguyên tắc 1: "Môi trường là Giáo viên"
Vì không có AI companion, kiến trúc không gian của outpost gánh toàn bộ vai trò dẫn dắt giáo dục:
- **Solar Ridge** ngoài trời = bài học năng lượng Mặt Trời + bức xạ
- **Greenhouse** = bài học sinh học không gian; cây lá rũ khi thiếu điện → nhân quả tức thì
- **Habitat Shelter** = bài học che chắn bức xạ; phòng dày hơn, tối hơn → "nơi an toàn"

Mỗi không gian là một "bài học sống" — không cần lời giải thích thêm.

### Nguyên tắc 2: "Console là Cổng Khoa học"
Mỗi console được thiết kế như "nhật ký của phi hành gia thực" — hiển thị bằng chứng (evidence) trực quan trước khi đặt câu hỏi lựa chọn. Cấu trúc mỗi màn console:
1. Tên sự kiện (≤5 từ)
2. Mô tả tình huống (2–3 câu, mỗi câu ≤12 từ)
3. Hậu quả của từng lựa chọn (1 câu/option)
4. Nút lựa chọn (tối đa 2–3 options)

### Nguyên tắc 3: "Hậu quả có thể Quan sát"
Không có "game over" bí ẩn — chỉ có hậu quả có thể thấy và được giải thích:
- Vườn cây: lá chuyển vàng, cúi xuống, animation héo dần
- Điện: đèn tối đi từng vùng, thanh HUD chuyển màu
- Nước: thanh dự trữ tụt, biểu tượng bình nước mờ dần
- Bức xạ: icon phi hành gia nhấp nháy, màn debrief đánh dấu "at-risk"

---

## 5. BỘ QUY TẮC NGÔN NGỮ CHO TRẺ 7–12 TUỔI

### Quy tắc cứng
- Tối đa **12 từ/câu** trong cảnh báo và hướng dẫn
- **Một ý = một câu** — không dùng mệnh đề phức
- Dùng **so sánh cụ thể** thay số trừu tượng: "như một bình nước đầy" thay vì "100 đơn vị"
- **Nhân cách hoá hậu quả**: cây rũ lá, đèn tối đi, không khí ngột ngạt
- Mỗi màn quyết định bắt đầu bằng **1 câu hỏi duy nhất** dưới 10 từ
- Dùng emoji như icon hỗ trợ nhận diện nhanh: 🫁 🌱 💧 ⚡ ☢️

### Hai lớp nội dung song song
```
Lớp trẻ em  → Ngôn ngữ hình ảnh, cảm xúc, hậu quả trực quan
Lớp judges  → Nguồn NASA ẩn trong tooltip/educator mode, trích dẫn rõ ràng
```

---

## 6. KỊCH BẢN ĐẦY ĐỦ — 6 CA

### PROLOGUE (trước Ca 1)

**Màn hình tiêu đề:**
Nền bề mặt Mặt Trăng, bóng tối sâu, vài ngôi sao. Nhạc ambient trầm. Tiếng thở nhẹ.

**Text xuất hiện từng câu:**
> "Bạn là Người Điều hành Trạm Nghiên cứu Aurora."
> "Trạm đang hoạt động trên Cực Nam Mặt Trăng."
> "Một cơn bão Mặt Trời đang đến."

**Fade-in vào Mission Control.** Ánh đèn cam ấm. Console trước mặt nhấp nháy. Bên ngoài cửa kính dày: mặt đất Mặt Trăng màu xám, bầu trời đen tuyệt đối.

**[NÚT: BẮT ĐẦU NHIỆM VỤ]**

---

### CA 1 — "ÁNH SÁNG YẾU DẦN"
*(Shift 1 / Giờ 0–12 | EVT-01: Solar Power Decline)*

**Hình ảnh/Âm thanh:**
- Nhìn ra cửa sổ: tấm pin Mặt Trăng bị bụi che một nửa
- Thanh điện trên HUD tụt từ xanh → vàng
- Tiếng bíp cảnh báo ngắn từ console

**Console text — ngôn ngữ trẻ em:**
```
⚡ ĐIỆN ĐANG THIẾU!

Trạm cần 12 phần điện.
Hôm nay chỉ có 10 phần.

Hệ thống Sống cần: 6 phần  🫁
Vườn Cây cần: 6 phần       🌱

Bạn chọn ai được ăn trước?

[A] 🫁 Hệ thống Sống trước
[B] 🌱 Vườn Cây trước
```

**Hậu quả trực quan (chọn A):**
- Đèn vườn cây tối đi nhẹ → lá cây khẽ cúi xuống (animation)
- Text: *"Vườn cây thiếu điện. Cây có thể yếu hơn sau này."*
- Battery về 0. Vườn cây nhận được 4/6 phần điện.

**Hậu quả trực quan (chọn B):**
- Thanh Life Support tụt -10 điểm
- Text: *"Hệ thống sống thiếu điện. Không khí có thể xấu hơn."*

**NASA data ẩn sau cơ chế:**
```
BVAD (NASA/TP-2021-220419): Life support ưu tiên số 1 trong emergency
power allocation trên ISS.
Công thức approved: aL = min(L, S), aH = min(H, S−aL)
S=10, L=6, H=6 → Life-first: aL=6, aH=4; battery về 0.
```

---

### CA 2 — "NƯỚC BẮT ĐẦU CẠN"
*(Shift 2 / Giờ 12–24 | EVT-02: Water Recovery Degradation)*

**Hình ảnh/Âm thanh:**
- Màn hình Life Support nhấp nháy vàng
- Icon màng lọc nước: vạch đỏ "cần bảo trì"
- Tiếng vo ve máy lọc yếu hơn bình thường

**Console text — ngôn ngữ trẻ em:**
```
💧 MÁY LỌC NƯỚC BỊ BẨN!

Bình thường máy lọc được 4 bình nước mỗi ngày.
Bây giờ chỉ lọc được 1 bình.

Nếu không sửa ngay:
Trạm sẽ cạn nước sau 3 ngày nữa.

Nhưng sửa máy thì Vườn Cây không có nước hôm nay.

[A] 🔧 Sửa máy ngay  → Vườn cây khát 1 ngày
[B] ⏳ Để sau        → Nước dự trữ giảm dần
```

**Hậu quả trực quan (chọn A):**
- Water recovery mode trở lại "normal" (+4/shift từ ca 3–6)
- Cây trong greenhouse: lá khẽ rũ 1 ca nhưng phục hồi
- Text: *"Máy lọc sạch rồi. Nước sẽ đủ cho các ca sau."*

**Hậu quả trực quan (chọn B):**
- Water reserve tụt -3 mỗi ca tiếp theo
- Delayed effect: nếu không sửa đến ca 5, text: *"Nước còn rất ít! Phi hành gia khát rồi."*

**NASA data ẩn sau cơ chế:**
```
NASA ECLSS: ISS water recovery system (ICES-2023-142)
Màng lọc thực tế bị fouling sau ~100 ngày liên tục.
Recovery rate: từ 93% → ~40% khi không bảo trì.
BVAD: water demand = 2.5 kg/người/ngày
```

---

### CA 3 — "BÃO MẶT TRỜI"
*(Shift 3 / Giờ 24–36 | EVT-03: Solar Particle Event Warning)*

**Đây là ca có giá trị giáo dục cao nhất — tâm điểm của Space Radiation**

**Hình ảnh/Âm thanh:**
- Màn hình ngoài cửa sổ: vầng sáng bất thường ở chân trời phía Mặt Trời
- Cảnh báo đỏ flashing: "SPE DETECTED"
- Thanh "Bức xạ ngoài tàu" trên HUD tăng nhanh từ xanh → vàng → cam
- Tiếng cảnh báo tần số cao, kéo dài

**Console text — ngôn ngữ trẻ em:**
```
☢️ BÃO MẶT TRỜI ĐANG ĐẾN!

Mặt Trời vừa phóng ra triệu triệu hạt siêu nhỏ.
Chúng có thể làm hỏng cơ thể người.

Phi hành gia đang ở ngoài để dọn tấm pin.
Nếu ở ngoài thêm: pin sạch hơn, nhưng nguy hiểm.
Nếu vào trong Shelter ngay: an toàn, nhưng pin vẫn bẩn.

Shelter là phòng dày nhất trong trạm.
Tường dày che được phần lớn hạt bức xạ.

[A] 🏠 Vào Shelter ngay
[B] 🔧 Dọn pin xong rồi vào (thêm 2 tiếng)
```

**Hậu quả trực quan (chọn A):**
- Animation: icon phi hành gia di chuyển vào ô "SHELTER"
- Thanh bức xạ trong tàu tăng nhẹ nhưng không nguy hiểm
- Delayed effect: Ca 4 — tấm pin chưa dọn, solar generation giảm từ 12 → 8
- radiation_risk = 'protected-risk'

**Hậu quả trực quan (chọn B):**
- Animation phi hành gia ở ngoài trong "mưa hạt đỏ"
- Icon sức khoẻ nhấp nháy đỏ
- radiation_risk = 'at-risk' → ảnh hưởng outcome ở debrief
- Ca 4: tấm pin sạch, generation = 12 (nhưng crew bị đánh dấu at-risk)

**Màn Khoa học nhỏ — xuất hiện SAU khi chọn (cả 2 đáp án):**
```
🌟 BẠN VỪA HỌC ĐƯỢC:
Các hạt từ Mặt Trời di chuyển rất nhanh.
Chúng đi từ Mặt Trời đến Mặt Trăng chỉ trong 30 phút.
Trên Trái Đất, từ trường bảo vệ chúng ta.
Trên Mặt Trăng, không có gì bảo vệ cả.
Vì vậy phi hành gia cần phòng Shelter đặc biệt!
```

**NASA data ẩn sau cơ chế:**
```
NASA DONKI API: SPE events (Solar Energetic Particles)
Sự kiện thực: Halloween Storm 2003 — X17 flare (29/10/2003)
Phi hành gia ISS ngay lập tức vào module trú ẩn Zvezda/Harmony.
Liều bức xạ nếu không shelter: >100 mSv/event
NASA HRP: career limit ~600 mSv/10 năm
LRO CRaTER data: lunar surface GCR ~0.5 mSv/ngày
Nguồn: NASA OCHMO Radiation Protection Brief
```

---

### CA 4 — "CÂY KÊU CỨU"
*(Shift 4 / Giờ 36–48 | EVT-04: Greenhouse Stress)*

**Đây là ca làm nổi bật Space Biology — chủ đề cốt lõi thứ hai của game**

**Hình ảnh/Âm thanh:**
- Vườn cây: lá chuyển vàng, một số cây rũ hẳn (animation liên tục)
- Màn hình Greenhouse: 3 chỉ số: Ánh sáng ✗, Nước ✗, Nhiệt độ ✓
- Tiếng ting nhẹ khi đèn UV nhấp nháy yếu ớt

**Console text — ngôn ngữ trẻ em:**
```
🌱 CÂY ĐANG KÊU CỨU!

Vì thiếu điện và nước ở ca trước,
cây trong vườn đang yếu dần.

Cây không chỉ là thức ăn.
Cây còn tạo thêm oxy và lọc không khí!

Bạn có muốn dùng thêm điện và nước để cứu cây?

[A] 💪 Cứu cây ngay  → Tốn thêm 2 phần điện + 2 bình nước
[B] 📦 Giữ dự trữ   → Cây tiếp tục yếu, có thể chết
```

**Hậu quả trực quan (chọn A):**
- Lá cây dần dựng thẳng (animation phục hồi)
- Plant health +15
- Dự trữ điện và nước giảm — cần cân nhắc cho ca 5

**Hậu quả trực quan (chọn B):**
- Plant health tụt -25
- Nếu plant_health < 30 ở ca 6 → outcome "Mission Under Stress"
- Text: *"Cây đang chết dần. Oxy trong trạm có thể giảm sau này."*

**NASA data ẩn sau cơ chế:**
```
NASA Veggie Project (ISS, 2015–nay): rau diếp trồng trên ISS.
Phi hành gia Scott Kelly ăn rau tươi ngoài vũ trụ lần đầu 2015.
NASA GeneLab OSD-766: Tomato crops on ISS under different lighting.
OSDR: OSD-773 (XROOTS aeroponic and hydroponic plant growth system).
Vai trò kép của cây: food + bioregenerative life support.
BVAD: food demand = 0.62 kg dry food/người/ngày.
Cây trong vũ trụ nhận bức xạ cao gấp 50 lần dưới đất.
```

---

### CA 5 — "KHÔNG KHÍ NGỘT NGẠT"
*(Shift 5 / Giờ 48–60 | EVT-05: CO₂ Scrubber Warning)*

**Hình ảnh/Âm thanh:**
- Màn hình Habitat: chỉ số "CO₂" chuyển vàng, nhấp nháy
- Màn Life Support: icon bộ lọc không khí có dấu "!" đỏ
- Hiệu ứng visual nhẹ: màn hình hơi "mờ" hơn — ám chỉ không khí xấu

**Console text — ngôn ngữ trẻ em:**
```
😮‍💨 KHÔNG KHÍ ĐANG XẤU!

Máy lọc không khí đầy rồi.
CO₂ (khí thở ra) đang tăng lên trong phòng.

Nếu CO₂ quá nhiều, phi hành gia sẽ bị đau đầu.
Rồi sẽ không nghĩ được rõ ràng nữa.
Rồi rất nguy hiểm.

Sửa máy ngay tốn 3 phần điện và 1 bình nước.
Nhưng an toàn hơn.

[A] 🔧 Sửa ngay  → air_quality phục hồi về >85
[B] ⏳ Chờ thêm 1 ca → air_quality giảm thêm -25
```

**Hậu quả trực quan (chọn B):**
- Nếu air_quality < 30 → Mission Failure (threshold essential system)
- Text: *"Không khí quá xấu. Phi hành gia không thể tiếp tục."*

**NASA data ẩn sau cơ chế:**
```
NASA ECLSS: CO₂ partial pressure limit = 5.3 mmHg (ISS spec).
Trên 10 mmHg: cognitive impairment documented trong astronaut records.
NASA Life Sciences Data Archive: atmospheric revitalization data.
BVAD: CO₂ removal là ưu tiên emergency số 1 sau O₂.
ISS thực tế: máy lọc không khí hoạt động liên tục 24/7.
```

---

### CA 6 — "72 GIỜ CUỐI"
*(Shift 6 / Giờ 60–72 | EVT-06: Final Resource Allocation)*

**Hình ảnh/Âm thanh:**
- Ánh sáng cửa sổ trở lại bình thường hơn — bão đã qua
- Radio: *"Aurora Station, rescue craft ETA 12 hours."*
- Nhạc tăng dần, nhẹ nhàng

**Console text — ngôn ngữ trẻ em:**
```
🏁 CA CUỐI CÙNG!

Tàu cứu hộ sẽ đến sau 12 tiếng nữa.
Bạn còn: [X] phần điện, [Y] bình nước.

Dùng hết cho điều gì?

[A] 🫁 Tập trung giữ không khí sạch và an toàn
[B] ⚖️ Chia đều: vừa giữ sống, vừa cứu cây
```

**Hậu quả:** Lựa chọn ở ca 6 kết hợp với toàn bộ lịch sử 5 ca trước → xác định outcome cuối cùng theo Terminal Evaluation Hierarchy.

**NASA data ẩn sau cơ chế:**
```
EVT-06 final allocation: cumulative decisions determine safety margin.
Nguồn: SCI-03, SCI-04, SCI-05, GAME-01.
Outcome predicates:
- Failure: water ≤ 0, OR air_quality < 30, OR total power loss với life support demand.
- Stress: radiation_risk='at-risk', OR plant_health < 30, OR water < 3, OR air_quality < 60.
- Stable: neither Fail nor Stress.
```

---

## 7. HỆ THỐNG TERMINAL EVALUATION (D08)

### Thứ tự ưu tiên
Essential failure > Mission completion (kể cả sau ca 6)

### Essential Systems
- Life Support: Water và Air Quality
- Power: total unrecoverable blackout khi có life support demand

### Outcome Predicates
1. **Mission Failure:** water ≤ 0, OR air_quality_score < 30, OR S=0 khi có life support demand
2. **Mission Under Stress:** Fail=false VÀ ít nhất 1 trong: radiation_risk='at-risk', OR plant_health < 30, OR water < 3, OR battery < 2, OR air_quality < 60
3. **Stable Mission:** Fail=false VÀ Stress=false

### Unlimited retries — không có game over vĩnh viễn

---

## 8. DEBRIEF — MÀN TỔNG KẾT

**Thiết kế:** Như trang nhật ký phi hành gia thực thụ. Đây là màn quan trọng nhất với judges.

```
╔══════════════════════════════════════════════════════════════╗
║        🌕 NHẬT KÝ KHOA HỌC — TRẠM AURORA, 72 GIỜ           ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  KẾT QUẢ: [STABLE / STRESS / FAILURE]                       ║
║                                                              ║
║  ┌── CA 1: ĐIỆN ──────────────────────────────────────────┐  ║
║  │ Bạn chọn: [lựa chọn của người chơi]                   │  ║
║  │ PHI HÀNH GIA THỰC TẾ CŨNG VẬY:                        │  ║
║  │ Trên ISS, khi điện thiếu, NASA ưu tiên                 │  ║
║  │ ECLSS trước mọi hệ thống khác.                         │  ║
║  │          — BVAD, NASA/TP-2021-220419                   │  ║
║  └─────────────────────────────────────────────────────────┘  ║
║                                                              ║
║  ┌── CA 3: BÃO MẶT TRỜI ──────────────────────────────────┐  ║
║  │ Bạn chọn: [lựa chọn của người chơi]                   │  ║
║  │ BÃO THẬT ĐÃ XẢY RA:                                    │  ║
║  │ Ngày 29/10/2003 — "Halloween Storm" X17                │  ║
║  │ Phi hành gia ISS ngay lập tức vào module trú ẩn.       │  ║
║  │          — NASA DONKI historical record                 │  ║
║  └─────────────────────────────────────────────────────────┘  ║
║                                                              ║
║  ┌── CA 4: CÂY TRONG VŨ TRỤ ──────────────────────────────┐  ║
║  │ Bạn chọn: [lựa chọn của người chơi]                   │  ║
║  │ KHOA HỌC THẬT:                                         │  ║
║  │ NASA đã trồng rau diếp thành công trên ISS từ 2015.   │  ║
║  │ Phi hành gia Scott Kelly ăn rau tươi ngoài vũ trụ      │  ║
║  │ lần đầu tiên trong lịch sử!                            │  ║
║  │          — NASA Veggie Project / GeneLab OSDR           │  ║
║  └─────────────────────────────────────────────────────────┘  ║
║                                                              ║
║  ☢️ BỨC XẠ TỔNG CỘNG BẠN NHẬN: [X] đơn vị rủi ro           ║
║     Phi hành gia ISS mỗi năm: ~80 mSv (NASA HRP 2023)        ║
║     Trên Trái Đất mỗi năm: ~3 mSv                            ║
║                                                              ║
║      [🔄 CHƠI LẠI]      [📚 XEM NGUỒN NASA ĐẦY ĐỦ]          ║
╚══════════════════════════════════════════════════════════════╝
```

---

## 9. BỘ NASA DATA — PHÂN TẦNG SỬ DỤNG

### TIER 1 — Bắt buộc tích hợp (Core gameplay data)

| Dataset | Nguồn | Dùng ở ca nào | Truy cập |
|---|---|---|---|
| **BVAD** (NASA/TP-2021-220419) | NASA Technical Reports Server | Ca 1,2,5,6 — cơ sở cho tất cả gameplay credits | Không cần login |
| **DONKI SEP API** | NASA CCMC (Goddard) | Ca 3 — Halloween Storm 2003 (X17) làm scenario reference | Không cần login |
| **LRO LOLA / South Pole Illumination** | PGDA / Moon Trek WMTS | Bối cảnh Mặt Trăng, giải thích tại sao điện giảm | Không cần login |

**Giá trị BVAD thực tế làm nền tảng credit system:**
- O₂: 0.84 kg/người/ngày
- Nước: 2.5 kg/người/ngày
- Thực phẩm: 0.62 kg dry food/người/ngày
- CO₂ limit: 5.3 mmHg partial pressure

### TIER 2 — Tăng điểm mạnh với judges (Scientific depth)

| Dataset | Nguồn | Dùng ở ca nào | Truy cập |
|---|---|---|---|
| **NASA OSDR / GeneLab** | osdr.nasa.gov | Ca 4 — OSD-766 (tomatoes ISS), OSD-773 (XROOTS) | Không cần login |
| **LRO CRaTER data** | NASA PDS / Rad-Bio-App | Ca 3 debrief — GCR dose ~0.5 mSv/ngày | Không cần login |
| **NASA HRP Radiation Limits** | NASA OCHMO | Ca 3 + debrief — career limit 600 mSv | Không cần login |
| **NASA Life Sciences Data Archive** | nlsp.nasa.gov | Ca 2,5 — ECLSS water recovery và CO₂ scrubber data | Không cần login |
| **BioSentinel OSD-964** | NASA OSDR | Debrief — radiation effect on biological systems | Không cần login |

### TIER 3 — Educator mode / Science Library

| Dataset | Nguồn | Dùng ở đâu |
|---|---|---|
| **NASA Veggie Project** | NASA.gov | Ca 4 debrief — Scott Kelly eating lettuce 2015 |
| **NASA ECLSS docs** (ICES-2023-142) | NTRS | Science Library — vòng khép kín nước, không khí |
| **LROC Image Archive** | ASU / NASA LRO | Background art reference — lunar surface imagery |
| **NASA Image and Video Library API** | images-api.nasa.gov | Debrief visual assets |

### Cấu trúc tích hợp 3 lớp
```
Gameplay layer    → Synthetic credits (0–100, labeled as gameplay abstractions)
                       ↕  ánh xạ lên
Reference layer   → NASA BVAD values (gắn chú thích trong Educator Mode)
                       ↕  xác nhận bởi
Live data layer   → DONKI API (Ca 3 trigger dùng historical event thực)
```

---

## 10. STATE VARIABLE REGISTRY (đã được approve)

| Biến | Owner | Giá trị EVT-01 fixture | Ghi chú |
|---|---|---|---|
| `battery` | Power | 4 (capacity: 20) | Persistent reserve |
| `solar_supply` (G) | Power | 6 (normal: 12) | Derived per shift |
| `life_demand` (L) | Life Support | 6 | Per-transition |
| `green_demand` (H) | Food Production | 6 | Per-transition |
| `water` | Life Support | TBD | Persistent reserve |
| `recovery_condition` | Life Support | normal/degraded | EVT-02 |
| `filter_condition` | Life Support | normal/warning | EVT-05 |
| `air_quality_score` | Life Support | candidate 60–100 | Persistent |
| `plant_health` | Food Production | candidate 60–100 | Persistent |
| `radiation_risk` | Radiation Protection | unassessed/at-risk/protected-risk | EVT-03 |
| `shelter_state` | Radiation Protection | not-sheltered/sheltered | EVT-03 |
| `shift` | Shared mission | 1–6 | Persistent |
| `outcome` | Shared mission | active/stable/stress/failure | Terminal |

### EVT-01 Approved Energy Formulas
```
S = G + B
Life-first:       aL = min(L, S);    aH = min(H, S - aL)
Greenhouse-first: aH = min(H, S);    aL = min(L, S - aH)
P = aL + aH
D = max(0, P - G)          // battery discharge
U = max(0, G - P)          // unused generation
Q = min(U, C - B)          // charge from surplus
X = U - Q                  // curtailed generation
B_next = B - D + Q
life_shortfall = L - aL
greenhouse_shortfall = H - aH

Fixture: G=6, B=4, C=20, L=6, H=6, S=10
Life-first: (aL,aH)=(6,4), P=10, D=4, Q=0, X=0, B_next=0
```

### Emergency Allocation (khi S < L và S < H)
```
aL = S, aH = 0
```

---

## 11. UX FLOW — CÁC MÀN HÌNH

| Màn hình | Entry | Action chính | Thông tin hiển thị |
|---|---|---|---|
| Main menu | Initial entry | Start mission | Title, entry action |
| Mission introduction | Start | Continue | Operator role, 72h abstraction, 4 systems |
| Outpost dashboard | Intro / sau consequence | Open situation | 4 system statuses, shift progress, first-person view |
| Situation / decision | Current event | Choose + confirm | Evidence, choices, trade-offs rõ ràng |
| Consequence | Sau valid decision | Continue | Actual changes + causal explanation |
| Mission log | Dashboard / debrief | Return | Ordered events, choices, observed effects |
| Debrief | Completion / failure | Retry hoặc menu | Result, chain of choices, science sources |

---

## 12. ART DIRECTION TÓM TẮT

**Visual Identity:** "Inviting, handcrafted 16-bit lunar outpost where retro pixel art makes complex space engineering approachable."

**Màu sắc chính (Semantic palette):**
- Normal = Green + tên/check
- Attention = Amber + tam giác/tên
- Critical = Red + dấu chấm than/tên
- Informational = Blue + label
- Không bao giờ dùng màu sắc đơn độc để truyền tải thông tin

**Palette:**

| Role | Hex |
|---|---|
| Deep space | #101828 |
| Lunar mid | #677481 |
| Warm light (habitat) | #F2C879 |
| Green (normal) | #6BAF83 |
| Blue (power/info) | #70B8D3 |
| Warning | #F0B85D |
| Critical | #D76562 |

**Style:** Simple modular low-poly 3D, pixel-art textures, deliberate hard edges, first-person perspective, render target ứng viên 320×180.

---

## 13. ĐIỂM PHÂN BIỆT SO VỚI CÁC TEAM KHÁC

Dựa trên khảo sát các team tham gia challenge cùng:

| Yếu tố | Nhiều team khác | The Last 72 Hours |
|---|---|---|
| AI companion | Có (Astro AI, Gemini chatbot) | Không — môi trường tự dạy |
| Data integration | DONKI live API, hiển thị số liệu raw | DONKI làm narrative trigger, số liệu ẩn sau gameplay |
| Địa điểm | Moon + Mars (dual) | Lunar South Pole thuần nhất, sâu hơn |
| Gameplay | Resource bars, real-time | Turn-based shifts, decision-consequence-learn |
| Narrative | Scenario text | Hậu quả trực quan trong 3D environment |
| Age range | 9–18, broad | 7–12, thiết kế nghiêm túc cho group này |
| Scientific depth | Số liệu hiển thị trực tiếp | 3-tier data system, educator mode riêng |
| Story hook | Generic mission | "72 giờ" — tạo tension, bám đề bài về decisions |

---

## 14. ACCEPTANCE CRITERIA (theo repo)

- [ ] Đúng 4 hệ thống outpost hiển thị và ảnh hưởng lẫn nhau qua approved rules
- [ ] Mỗi ca có 1 quyết định có hậu quả nhìn thấy được và giải thích nhân quả
- [ ] 6 ca hoặc essential-system failure kết thúc mission; outcomes và retry rõ ràng
- [ ] Science references và simplifications có thể truy cập trong debrief
- [ ] Demo representative dùng actual mission transition và visible consequence, với concise learning point
- [ ] Mọi số liệu gameplay là labeled abstractions — không phải NASA measurements
- [ ] Mọi NASA data được trích dẫn nguồn cụ thể

---

## 15. NGUỒN TRÍCH DẪN NASA ĐẦY ĐỦ

```
SCI-01: NASA LOLA — Lunar Orbiter Laser Altimeter topography data
        → Lunar South Pole terrain and illumination context
        endpoint: pgda.gsfc.nasa.gov/products/69

SCI-02: Moon Trek South Pole Illumination Maps
        → Solar array placement and power availability modeling
        endpoint: trek.nasa.gov/tiles/Moon/SP/WAC_POLE_ILL_PCT...

SCI-03: NASA BVAD (Baseline Values and Assumptions Document)
        NASA/TP-2021-220419 (updated from 2015 version)
        → Crew O₂ (0.84 kg/day), water (2.5 kg/day), food (0.62 kg/day)
        → Life support priority protocols
        endpoint: ntrs.nasa.gov/citations/20210024855

SCI-04: NASA Veggie Project & Advanced Plant Habitat (APH)
        → Plant growth on ISS, bức xạ ảnh hưởng đến cây
        → GeneLab OSD-766 (tomatoes), OSD-773 (XROOTS)
        endpoint: osdr.nasa.gov/osdr/data/search

SCI-05: NASA DONKI (Database Of Notifications, Knowledge, Information)
        → Solar Energetic Particle events, historical SPE records
        → Halloween Storm 2003 (X17 flare, 29/10/2003)
        endpoint: ccmc.gsfc.nasa.gov/DONKI-API/get/SEP

SCI-06: NASA HRP (Human Research Program) Radiation Protection
        → Career limit ~600 mSv/10 năm
        → Acute radiation syndrome thresholds
        → NASA OCHMO Radiation Protection Brief

SCI-07: LRO CRaTER (Cosmic Ray Telescope for the Effects of Radiation)
        → Lunar surface GCR ~0.5 mSv/ngày
        → Radiation environment at lunar south pole
        → Rad-Bio-App for data exploration

SCI-08: NASA ECLSS (Environmental Control and Life Support System)
        → CO₂ partial pressure limit: 5.3 mmHg
        → Water recovery rate: 93–98%
        → ICES-2023-142: Exploration Water Recovery Architecture

SCI-09: NASA Open Science Data Repository (OSDR) / GeneLab
        → OSD-964: BioSentinel radiation effect on yeast biosensors
        → OSD-993: Space radiation senescent phenotypes
        → Space Biology datasets for plant and human radiation response
        endpoint: osdr.nasa.gov

GAME-01: Gameplay abstractions — all credit values (0–100 domain)
         are synthetic game-tuning proposals, not NASA measurements.
         Labels clearly distinguish gameplay indicators from physical units.
```