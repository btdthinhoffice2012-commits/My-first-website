# Bùi Trần Đức Thịnh | Personal Portfolio & Tech Lab

Chào mừng bạn đến với repository của trang web portfolio cá nhân của **Bùi Trần Đức Thịnh** - Lập trình viên C++, đam mê Linux workflow và phát triển web.

Trang web được thiết kế theo phong cách giao diện điều khiển (Command Center / Tech Station) với các tính năng tương tác cao, chế độ tối ưu hóa hiệu năng, mini-terminal mô phỏng, bảng điều khiển cấu hình và hệ thống phản hồi (Feedback) đồng bộ qua Supabase Cloud.

---

## 🛠️ Công Nghệ Sử Dụng (Tech Stack)

- **Frontend**: HTML5, Vanilla CSS3 (Custom Variables & Modern Layouts), Vanilla JavaScript (ES6+).
- **Interactive Visuals**: HTML5 Canvas API (hiệu ứng Aurora, sao băng và luồng code bay động).
- **Backend / Database**: [Supabase](https://supabase.com/) (Dùng cho lưu trữ tài khoản người dùng, bình luận & đánh giá).
- **Deployment**: [Vercel](https://vercel.com/) (Hỗ trợ cấu hình Routing & Analytics Insights).

---

## ✨ Tính Năng Nổi Bật

1. **Interactive Canvas Background**: Nền động mô phỏng ánh cực quang (Aurora), các chòm sao băng (Comet) và luồng ký tự code (`{}`, `[]`, `()`) trôi theo hướng chuột di chuyển.
2. **Mini Terminal Emulator**:
   - Gõ lệnh để tương tác thực tế.
   - Lệnh được hỗ trợ: `help`, `whoami`, `skills`, `projects`, `contact`, `feedback`, `neofetch`, `clear`, `hello`.
   - Trò chơi rắn săn mồi (**Snake Game**) tích hợp trực tiếp ngay trong cửa sổ Terminal (`snake` hoặc `game`).
3. **Chế Độ Hiệu Năng (Performance Mode)**: Hỗ trợ tắt toàn bộ Canvas Animation để tối ưu hóa CPU/GPU cho các thiết bị cấu hình yếu.
4. **Hệ Thống Xác Thực (Mock & Cloud Auth)**:
   - Cho phép người dùng Đăng ký / Đăng nhập / Chỉnh sửa hồ sơ (bao gồm tải ảnh đại diện Base64 tối đa 1MB).
   - Tự động đồng bộ hóa với cơ sở dữ liệu Supabase hoặc lưu trữ cục bộ (`localStorage`) nếu không kết nối được Cloud.
5. **Hệ Thống Đánh Giá (Feedback System)**:
   - Bình luận trực tiếp, đánh giá số sao (Rating) kèm theo huy hiệu Xác minh (Verified Badge) dành cho thành viên đã đăng nhập.
   - Chức năng Admin Reply dành riêng cho tài khoản quản trị viên để phản hồi bình luận.
6. **Music Player (Sơn Tùng M-TP, Low G, MCK)**: Trình phát nhạc lấy thumbnail và điều phối link nhạc trực tiếp từ YouTube.

---

## 💻 Hướng Dẫn Chạy Cục Bộ (Local Development)

Vì đây là ứng dụng Web tĩnh (Static Web App), bạn không cần cài đặt Node.js hay các thư viện phức tạp. Chỉ cần một máy chủ HTTP đơn giản:

### Cách 1: Sử dụng Python (Khuyên dùng)
Nếu máy bạn đã cài sẵn Python (như trên Arch Linux / Ubuntu):
```bash
python3 -m http.server 8000 --bind 127.0.0.1
```
Sau đó truy cập địa chỉ: [http://127.0.0.1:8000](http://127.0.0.1:8000)

### Cách 2: Sử dụng Live Server trên VS Code
Nhấp chuột phải vào file `index.html` và chọn **Open with Live Server**.

---

## 🗄️ Cấu Trúc Cơ Sở Dữ Liệu Supabase (Database Setup)

Để đồng bộ các tính năng Đăng nhập & Đánh giá, bạn hãy tạo hai bảng sau trong mục **SQL Editor** trên Supabase Dashboard:

### 1. Tạo các bảng dữ liệu (Tables)

```sql
-- Bảng lưu trữ người dùng
CREATE TABLE IF NOT EXISTS public.portfolio_users (
    username TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    "classSchool" TEXT,
    role TEXT DEFAULT 'member',
    avatar TEXT, -- Lưu ảnh đại diện dạng Base64
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bảng lưu trữ phản hồi & đánh giá
CREATE TABLE IF NOT EXISTS public.portfolio_feedbacks (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    class TEXT,
    school TEXT,
    rating NUMERIC NOT NULL,
    message TEXT NOT NULL,
    date TEXT NOT NULL,
    verified BOOLEAN DEFAULT FALSE,
    reply TEXT,
    "replyDate" TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 2. Tạo các hàm Database (RPC Functions)

Để mã nguồn Javascript ở Client gọi được các tác vụ xử lý an toàn mà không bị lộ mật khẩu, bạn cần định nghĩa 3 hàm SQL sau:

#### Hàm `get_public_users` (Lấy thông tin người dùng công khai, ẩn mật khẩu)
```sql
CREATE OR REPLACE FUNCTION public.get_public_users()
RETURNS TABLE (
  name TEXT,
  username TEXT,
  email TEXT,
  "classSchool" TEXT,
  role TEXT,
  avatar TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.name,
    u.username,
    u.email,
    u."classSchool",
    u.role,
    u.avatar
  FROM public.portfolio_users u;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

#### Hàm `login_user` (Xác thực đăng nhập bảo mật)
```sql
CREATE OR REPLACE FUNCTION public.login_user(p_username_or_email TEXT, p_password TEXT)
RETURNS TABLE (
  name TEXT,
  username TEXT,
  email TEXT,
  "classSchool" TEXT,
  role TEXT,
  avatar TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.name,
    u.username,
    u.email,
    u."classSchool",
    u.role,
    u.avatar
  FROM public.portfolio_users u
  WHERE (LOWER(u.username) = LOWER(p_username_or_email) OR LOWER(u.email) = LOWER(p_username_or_email))
    AND u.password = p_password;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

#### Hàm `update_user_profile` (Cập nhật thông tin tài khoản cá nhân)
```sql
CREATE OR REPLACE FUNCTION public.update_user_profile(
  p_username TEXT,
  p_name TEXT,
  p_class_school TEXT,
  p_avatar TEXT,
  p_password TEXT
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE public.portfolio_users
  SET 
    name = p_name,
    "classSchool" = p_class_school,
    avatar = CASE WHEN p_avatar <> '' THEN p_avatar ELSE avatar END,
    password = CASE WHEN p_password <> '' THEN p_password ELSE password END
  WHERE username = p_username;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## 🎨 Cấu hình Supabase trong mã nguồn Client

Mở file [script.js](file:///home/thinh/Projects/portfolio/script.js) và cập nhật hai hằng số ở đầu trang bằng thông tin dự án Supabase của bạn:

```javascript
const SUPABASE_URL = 'YOUR_SUPABASE_PROJECT_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';
```

Nếu để trống hoặc giữ nguyên giá trị mặc định, hệ thống sẽ tự động chuyển sang chế độ **Local Mock Mode** lưu trữ qua `localStorage` trên trình duyệt để bạn vẫn có thể test đầy đủ giao diện.