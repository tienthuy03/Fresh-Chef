# 🗺️ BẢN ĐỒ TOÀN DIỆN HỆ THỐNG FRESH CHEF (BE + FE SPECIFICATION)

Chào bạn, đây là tài liệu **đầy đủ và chi tiết nhất** bao quát toàn bộ ứng dụng **Fresh Chef** từ trước đến nay, mô tả từng tính năng, chức năng của chúng, cấu trúc cơ sở dữ liệu và danh sách API (Backend) cùng màn hình (Frontend) tương ứng.

---

## 💾 PHẦN 1: CẤU TRÚC CƠ SỞ DỮ LIỆU (DATABASE SCHEMA)
Hệ thống sử dụng **SQLite** và **Sequelize ORM** để quản lý các thực thể liên quan chặt chẽ với nhau:

* **User (Người dùng):** Lưu trữ thông tin đăng nhập, họ tên, bio, avatar, sở thích ăn uống.
* **UserNutrition (Dinh dưỡng):** Lưu trữ chỉ số cân nặng, chiều cao, tuổi, giới tính, mức vận động, mục tiêu calo, đạm, tinh bột, béo.
* **Recipe (Món ăn):** Lưu trữ tiêu đề, nguyên liệu (JSON), các bước nấu (JSON), ảnh, thời gian, số phần ăn, phân loại, đánh giá rating trung bình.
* **Comment & Review (Cộng đồng):** Đánh giá món ăn kèm số sao, bình luận thảo luận dưới bài viết của người khác.
* **MealPlan (Lịch trình ăn):** Lên thực đơn tuần cho từng bữa sáng/trưa/tối.
* **SavedShoppingList (Mẫu đi chợ):** Lưu trữ các giỏ nguyên liệu đi chợ thành template để khôi phục nhanh.
* **ShoppingItem (Giỏ chợ):** Các nguyên liệu cần mua hiện tại của người dùng.

---

## 📊 PHẦN 2: BẢN ĐỒ CHI TIẾT TÍNH NĂNG & DANH SÁCH API

### 1. Hệ thống Xác thực & Người dùng (Authentication & User Profile)
* **Chức năng:** Đăng ký, đăng nhập bảo mật bằng Token JWT, lấy thông tin cá nhân, cập nhật ảnh đại diện, tiểu sử (bio), thay đổi mật khẩu và xem các số liệu thống kê cá nhân (số người theo dõi, số công thức đã viết).
* **Màn hình Frontend:** `Login`, `Register`, `Profile`.
* **Danh sách API Backend (`/api/auth`):**
  * `POST /register`: Đăng ký tài khoản mới.
  * `POST /login`: Đăng nhập nhận JWT Token.
  * `GET /me` (Yêu cầu Token): Lấy thông tin tài khoản hiện tại kèm thống kê số follower/following.
  * `PUT /profile` (Yêu cầu Token): Chỉnh sửa họ tên, tiểu sử (bio) hoặc tải lên ảnh đại diện mới.
  * `PUT /change-password` (Yêu cầu Token): Đổi mật khẩu tài khoản.

---

### 2. Trợ lý Đầu bếp Chef AI & Offline Fallback Engine
* **Chức năng:** Chatbot tư vấn nấu ăn thông minh thời gian thực tích hợp **Gemini 2.5 Flash**; hỗ trợ các câu hỏi khẩn cấp bằng 20 kịch bản mẹo vặt offline cực kỳ hữu dụng.
* **Màn hình Frontend:** Modal Chat AI trôi nổi ở tất cả các trang chính.
* **Danh sách API Backend (`/api/ai-assistant`):**
  * `POST /chat` (Yêu cầu Token): Nhận tin nhắn của người dùng, phân tích và trả về câu trả lời thông minh của Gemini AI. Nếu có lỗi mạng hoặc hết token, hệ thống tự động lọc từ khóa và kích hoạt kịch bản **Offline Fallback Engine** tương ứng.

---

### 3. Kế hoạch Dinh dưỡng Cá nhân (Personalized Nutrition Planner)
* **Chức năng:** Nhập chỉ số cơ thể, tự động tính toán chỉ số BMR/TDEE & lượng Calo/Macro (Đạm, Carb, Chất béo) đích hàng ngày. Đề xuất thực đơn khớp Calo (Sáng, Trưa, Tối) với tối đa 20 món ăn Việt ngon miệng và cho phép thêm vào lịch ăn 1 chạm.
* **Màn hình Frontend:** `NutritionPlanner` (Màn hình Dashboard, Progress Bars & tabs bữa ăn).
* **Danh sách API Backend (`/api/nutrition`):**
  * `GET /profile` (Yêu cầu Token): Lấy hồ sơ thông số cơ thể hiện tại của người dùng.
  * `POST /setup` (Yêu cầu Token): Thiết lập/Cập nhật cân nặng, chiều cao, tuổi, giới tính, mức vận động, mục tiêu và tính toán lượng Calo/Macro mục tiêu.
  * `GET /plan` (Yêu cầu Token): Trả về thực đơn dinh dưỡng cá nhân hóa, lọc và sắp xếp tối đa 20 món ăn khớp calo nhất cho bữa Sáng/Trưa/Tối.

---

### 4. Quản lý Công thức & Đồng bộ Dữ liệu (Recipes)
* **Chức năng:** Hiển thị danh mục món ăn phong phú, món ăn thịnh hành (Trending), tìm kiếm món ăn nhanh chóng, đánh dấu món ăn yêu thích, xem chi tiết công thức nấu (nguyên liệu, các bước nấu, đánh giá, dinh dưỡng calo/đạm/carb/béo). Cho phép cào công thức từ Cookpad.
* **Màn hình Frontend:** `Explore`, `AllRecipes`, `RecipeDetail`, tab Yêu thích trong `Cookbook`.
* **Danh sách API Backend (`/api/recipes`):**
  * `GET /`: Lấy toàn bộ danh sách công thức có trong hệ thống (kèm chỉ số dinh dưỡng ảo).
  * `GET /search?q=...`: Tìm kiếm công thức theo tiêu đề hoặc danh mục.
  * `GET /categories`: Lấy danh sách các danh mục món ăn (ví dụ: món bò, gà, cá, salad...).
  * `GET /trending`: Lấy ngẫu nhiên 20 món ăn thịnh hành.
  * `GET /favorites` (Yêu cầu Token): Lấy danh sách món ăn đã thả tim (yêu thích) của người dùng.
  * `POST /favorite` (Yêu cầu Token): Bật/Tắt trạng thái yêu thích (thả tim) cho món ăn.
  * `GET /:id`: Xem thông tin chi tiết một món ăn (nguyên liệu, các bước nấu chi tiết, điểm đánh giá).
  * `POST /sync`: Cào dữ liệu món ăn trực tiếp từ Cookpad theo từ khóa ở chế độ chạy nền.

---

### 5. Lên Kế Hoạch Ăn Uống Tuần (Meal Planner)
* **Chức năng:** Lên lịch nấu nướng cho các ngày trong tuần theo bữa Sáng/Trưa/Tối, theo dõi thực đơn ăn uống khoa học, tự động gom tất cả nguyên liệu của thực đơn tuần để xuất ra Danh sách đi chợ.
* **Màn hình Frontend:** Tab Lên lịch trong màn hình `Cookbook`.
* **Danh sách API Backend (`/api/meal-plans`):**
  * `GET /?startDate=...&endDate=...` (Yêu cầu Token): Lấy danh sách lịch ăn trong khoảng thời gian xác định.
  * `POST /` (Yêu cầu Token): Thêm một món ăn vào lịch ăn tại một ngày và một bữa xác định (`breakfast`, `lunch`, `dinner`).
  * `DELETE /:id` (Yêu cầu Token): Xóa món ăn khỏi lịch ăn.
  * `GET /shopping-list?startDate=...&endDate=...` (Yêu cầu Token): Tự động tổng hợp và tính tổng toàn bộ nguyên liệu của các món có trong lịch ăn tuần để xuất ra giỏ chợ.

---

### 6. Quản lý Giỏ Chợ & Mẫu Đi Chợ Đã Lưu (Shopping List & Templates)
* **Chức năng:** Danh sách ghi nhớ nguyên liệu đi chợ, đánh dấu đã mua/chưa mua, xóa sạch giỏ chợ, lưu trữ giỏ chợ hiện tại thành các Mẫu template đi chợ cố định và khôi phục nhanh chỉ bằng 1 chạm.
* **Màn hình Frontend:** `ShoppingList`, `SmartShoppingList` (Mẫu đi chợ đã lưu).
* **Danh sách API Backend:**
  * **Giỏ chợ thường (`/api/shopping-list`):**
    * `GET /` (Yêu cầu Token): Lấy danh sách nguyên liệu trong giỏ chợ của bạn.
    * `POST /toggle` (Yêu cầu Token): Thêm/Bật tắt trạng thái đã mua của nguyên liệu.
    * `DELETE /` (Yêu cầu Token): Xóa sạch giỏ chợ.
  * **Mẫu đi chợ đã lưu (`/api/saved-shopping-lists`):**
    * `GET /` (Yêu cầu Token): Liệt kê danh sách các mẫu template đi chợ bạn đã lưu.
    * `POST /` (Yêu cầu Token): Lưu giỏ chợ hiện tại thành mẫu template với tên tùy chọn.
    * `POST /:id/apply` (Yêu cầu Token): Áp dụng (khôi phục) nhanh toàn bộ nguyên liệu từ template vào giỏ chợ chính thức.
    * `DELETE /:id` (Yêu cầu Token): Xóa mẫu template.

---

### 7. Cộng đồng Ẩm thực & Đánh giá (Community & Social Feed)
* **Chức năng:** Theo dõi/Hủy theo dõi các đầu bếp khác, đăng bài viết đánh giá kèm hình ảnh và điểm rating cho món ăn, thích/thả tim các bài đánh giá, bình luận thảo luận bên dưới các bài viết.
* **Màn hình Frontend:** `Community` (Feed mạng xã hội), `AllChefs`.
* **Danh sách API Backend (`/api/community`):**
  * `GET /feed` (Yêu cầu Token): Lấy bảng tin mạng xã hội ẩm thực chứa các bài review mới nhất từ những người bạn theo dõi.
  * `POST /review` (Yêu cầu Token): Đăng bài đánh giá/review một món ăn (kèm hình ảnh, số sao rating, và nội dung).
  * `POST /review/:id/like` (Yêu cầu Token): Thả tim bài đánh giá.
  * `POST /comment` (Yêu cầu Token): Viết bình luận thảo luận dưới bài đánh giá.
  * `POST /follow` (Yêu cầu Token): Theo dõi/Hủy theo dõi một đầu bếp/người dùng khác.

---

### 8. Khảo sát Sở thích Ăn uống (Preference Quiz)
* **Chức năng:** Khảo sát sở thích ăn uống lúc mới đăng ký tài khoản (Onboarding) hoặc cập nhật bất cứ lúc nào (chế độ ăn kiêng, số lượng người trong gia đình, giới hạn thời gian đứng bếp) để ứng dụng tối ưu hóa trải nghiệm hiển thị.
* **Màn hình Frontend:** `Onboarding`, `PreferenceQuiz`.
* **Danh sách API Backend (`/api/preferences`):**
  * `GET /` (Yêu cầu Token): Lấy thông tin sở thích hiện tại của người dùng.
  * `POST /` (Yêu cầu Token): Cập nhật thông tin sở thích ăn uống mới.

---

### 9. Hệ thống Cấp bậc & Thử thách (Gamification - Chef Level)
* **Chức năng:** Khuyến khích người dùng nấu ăn thông qua cơ chế tích lũy điểm kinh nghiệm (XP), nhận Huy hiệu (Badges) và vượt Thử thách tuần (Challenges). Tự động thăng cấp danh hiệu dựa trên thuật toán tích lũy XP.
* **Quy mô điểm (Cấp độ = √(XP / 50) + 1):**
  * **Tập sự 🍳 (Cấp 1 - 5):** Từ 0 XP đến dưới 1,250 XP *(Vd: Lv.2 cần 50 XP, Lv.3 cần 200 XP)*.
  * **Trợ lý đầu bếp 🔪 (Cấp 6 - 15):** Từ 1,250 XP đến dưới 11,250 XP.
  * **Đầu bếp chính 👨‍🍳 (Cấp 16 - 30):** Từ 11,250 XP đến dưới 45,000 XP.
  * **Bếp trưởng huyền thoại 👑 (Cấp 31+):** Trên 45,000 XP.
* **Màn hình Frontend:** `Profile` (Hiển thị thẻ danh hiệu, cấp bậc và thanh tiến trình màu cam cực bắt mắt).
* **Danh sách API Backend (`/api/gamification`):**
  * `GET /profile` (Yêu cầu Token): Trả về hồ sơ điểm XP hiện tại, danh hiệu, % tiến độ lên cấp và các huy hiệu đã đạt được.
  * *Tự động cộng XP ẩn thông qua các module khác (VD: `POST /community/reviews` tự động cộng 30 XP).*

---

## 📱 PHẦN 3: KIẾN TRÚC & THƯ MỤC CHI TIẾT FRONTEND (FE ARCHITECTURE)

Hệ thống Frontend được viết trên nền tảng **React Native**, tổ chức thư mục vô cùng khoa học và chuẩn hóa:

### 1. Phân hệ Điều hướng (fe/src/navigation/)
Quản lý các luồng chuyển màn hình linh hoạt:
* **`AppNavigator.js` (Stack Navigator):** Xử lý chuyển đổi giữa luồng **Auth Stack** (Onboarding, Login, Register, PreferenceQuiz) khi chưa đăng nhập và **App Stack** (Main Tab, RecipeDetail, NutritionPlanner, SmartShoppingList, AllChefs) khi đã đăng nhập thành công.
* **`MainTabNavigator.js` (Bottom Tab Navigator):** Định nghĩa 4 tab điều hướng chính dưới chân màn hình:
  1. **Explore (Khám phá):** Màn hình chính tìm kiếm món ăn, xem danh mục và món ăn thịnh hành.
  2. **Community (Cộng đồng):** Feed mạng xã hội chia sẻ công thức, review và theo dõi các đầu bếp khác.
  3. **Cookbook (Sổ tay bếp):** Quản lý Lịch ăn tuần (Meal Plan), Danh sách món ăn yêu thích, và Mẫu đi chợ đã lưu.
  4. **Profile (Cá nhân):** Quản lý tài khoản, thay đổi thông tin cá nhân và **Kế hoạch dinh dưỡng cá nhân**.

---

### 2. Quản lý State & RTK Query (fe/src/redux/)
Đóng vai trò là "mạch máu" quản lý dữ liệu và đồng bộ hóa với Backend:
* **`apiService.js`:** Cấu hình chung cho cuộc gọi API của RTK Query, tự động đính kèm Token JWT vào Header của tất cả request và quản lý cơ chế tự động làm mới giao diện khi dữ liệu thay đổi bằng **Tags** (`Favorites`, `ShoppingList`, `MealPlans`, `Nutrition`...).
* **`slices/authSlice.js`:** Quản lý trạng thái Đăng nhập/Đăng xuất và lưu trữ thông tin User, Token trong bộ nhớ Redux Store.
* **Các dịch vụ API thành phần (fe/src/redux/api/):**
  * `Auth/index.js`: Đăng nhập, đăng ký, cập nhật thông tin cá nhân.
  * `Recipes/index.js`: Lấy danh sách công thức, tìm kiếm, cào Cookpad, Hỏi AI Assistant, và **Bộ ba API Dinh dưỡng (profile, setup, plan)**.
  * `MealPlans/index.js`: Thêm, xóa món ăn vào lịch tuần, tổng hợp nguyên liệu đi chợ từ lịch ăn.
  * `ShoppingList/index.js`: Thêm/bớt/đánh dấu đã mua các nguyên liệu đi chợ.
  * `Community/index.js`: Tương tác thả tim review, bình luận, theo dõi đầu bếp khác.

---

### 3. Chi tiết 13 Màn hình Giao diện (fe/src/screens/)
* **`Login` / `Register`:** Đăng nhập, đăng ký tài khoản với hiệu ứng nhập liệu đẹp mắt.
* **`Onboarding`:** Giới thiệu ngắn gọn các tính năng chính của ứng dụng cho người dùng mới.
* **`PreferenceQuiz`:** Trắc nghiệm sở thích ăn uống lúc ban đầu.
* **`Home` / `Explore`:** Hiển thị thanh tìm kiếm nổi bật, danh mục món ăn dạng nằm ngang, và 20 món ăn thịnh hành ngẫu nhiên.
* **`AllRecipes`:** Hiển thị toàn bộ kho công thức phong phú trong ứng dụng.
* **`RecipeDetail`:** Trang chi tiết món ăn (ảnh lớn, bảng thông số calo, nguyên liệu dạng checklist đi chợ, các bước nấu có ảnh/video và mục đánh giá review của cộng đồng).
* **`NutritionPlanner` [Mới]:** Giao diện tính TDEE, theo dõi thanh tiến trình macro Đạm/Carb/Béo và đề xuất thực đơn khớp Calo 3 bữa kèm nút thêm vào lịch nhanh.
* **`ShoppingList`:** Giỏ chợ thông minh hiển thị checklist nguyên liệu cần mua.
* **`SmartShoppingList`:** Quản lý các mẫu đi chợ đã lưu giúp khôi phục giỏ chợ chỉ trong 1 chạm.
* **`Community`:** Bảng tin mạng xã hội hiển thị bài review của các đầu bếp.
* **`AllChefs`:** Danh sách các đầu bếp trong hệ thống giúp người dùng dễ dàng theo dõi (Follow).
* **`Profile`:** Quản lý thông tin tài khoản, thống kê số liệu và liên kết trực tiếp tới trang Dinh dưỡng.

---

### 4. Hệ thống Đa ngôn ngữ & Tiêu chuẩn giao diện (i18n & constants)
* **`fe/src/i18n/`:** Sử dụng thư viện `react-i18next` để hỗ trợ hiển thị song ngữ **Tiếng Việt & Tiếng Anh** mượt mà cho toàn bộ ứng dụng.
* **`fe/src/constants/Colors.js`:** Cấu hình bảng màu cao cấp chuẩn thương hiệu:
  * `Colors.primary`: Màu cam san hô tươi mát kích thích vị giác (`#FF6B6B` hoặc tương đương).
  * `Colors.background`: Màu kem/trắng sữa sang trọng nhã nhặn (`#FAF9F6`).
  * `Colors.white`, `Colors.text`, `Colors.border`, `Colors.error`.
* **`fe/src/components/GlobalUI/`:** Chứa các Component dùng chung được thiết kế bo góc, đổ bóng bóng bẩy như `PrimaryButton` và `SectionHeader`.

---

## ⚙️ PHẦN 4: KIẾN TRÚC & THƯ MỤC CHI TIẾT BACKEND (BE ARCHITECTURE)

Hệ thống Backend được xây dựng bằng **Node.js** và **Express.js**, quản lý cơ sở dữ liệu qua **Sequelize ORM** (với SQLite), tổ chức theo mô hình MVC (Model-Route-Controller) tối giản:

### 1. Phân hệ Cơ sở dữ liệu & Models (`be/src/models/`)
* **`index.js`:** Trái tim của Database. Khởi tạo kết nối Sequelize tới SQLite, nạp toàn bộ các Models và thiết lập các mối quan hệ (Associations) như `hasOne`, `hasMany`, `belongsTo`.
* **Các Models cốt lõi:**
  * `User.js`, `UserNutrition.js` (Hồ sơ & Dinh dưỡng người dùng)
  * `Recipe.js` (Kho công thức món ăn)
  * `Review.js`, `ReviewLike.js`, `Comment.js` (Tương tác mạng xã hội)
  * `ShoppingItem.js`, `SavedShoppingList.js` (Quản lý giỏ chợ)
  * `MealPlan.js` (Lịch ăn uống)

### 2. Phân hệ API & Logic định tuyến (`be/src/routes/`)
Nơi xử lý mọi luồng logic (Controllers) và định tuyến (Routing) cho hệ thống:
* **`auth.js`:** Quản lý xác thực JWT, mã hóa mật khẩu bcrypt, xử lý đăng ký/đăng nhập.
* **`recipes.js`:** API truy xuất công thức, đánh dấu yêu thích, và **tích hợp scraper tự động** lấy dữ liệu từ nguồn ngoài.
* **`aiAssistant.js`:** Tích hợp SDK của Google Generative AI (Gemini) và kịch bản tĩnh (Fallback Engine) xử lý logic chat thông minh.
* **`nutrition.js` [Mới]:** Chứa thuật toán Mifflin-St Jeor, phân bổ Macro (Protein/Carb/Fat) theo mục tiêu, và logic lọc 20 món ăn khớp calo.
* **`community.js`, `mealPlans.js`, `shoppingList.js`, `savedShoppingLists.js`:** Xử lý nghiệp vụ cho từng module tương ứng.

### 3. Tiện ích & Middleware (`be/src/utils/` & `be/src/middleware/`)
* **`middleware/auth.js`:** Middleware chặn các request không có JWT Token hợp lệ, giải mã Token và gán thông tin `req.user` cho các route bảo mật.
* **`utils/nutritionHelper.js`:** Chứa thuật toán giả lập dữ liệu dinh dưỡng (Zero-migration). Phân tích tiêu đề và danh mục món ăn (vd: Gà, Bò, Salad) để gán lượng Calo và Macro nhất quán trên toàn hệ thống mà không cần sửa bảng Database cũ.

### 4. Máy chủ & Khởi chạy (`be/src/index.js`)
* Entry point của toàn bộ Backend.
* Cấu hình **Express**, **CORS**, khai báo tĩnh (`express.static`) để phục vụ hình ảnh (nếu có).
* Đăng ký toàn bộ các Routes (vd: `app.use('/api/nutrition', nutritionRoutes)`).
* Gọi `sequelize.sync()` để tự động tạo bảng (auto-migration) và khởi chạy Server. Kích hoạt cơ chế cào (scrape) công thức mặc định nếu cơ sở dữ liệu trống.
