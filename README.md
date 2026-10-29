# Labdock User Portal

Nền tảng Next.js 15 theo Feature First, minh họa đầy đủ luồng public SEO, Authentication phía Client, Dashboard và cập nhật Profile.

## Yêu cầu môi trường

- Node.js 20 trở lên.
- Backend hỗ trợ Bearer JWT và các endpoint trong phần API contract.

Sao chép `.env.example` thành `.env.local` và cấu hình:

```dotenv
NEXT_PUBLIC_API_BASE_URL=https://uat-api-labdock.365studio.vn/api/public/v1
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

`NEXT_PUBLIC_SITE_URL` phải là origin public thực tế ở production để canonical, robots và sitemap chính xác.
`NEXT_PUBLIC_API_BASE_URL` không có dấu `/` ở cuối; ứng dụng sẽ tự chuẩn hóa nếu biến môi trường có dấu `/`.

## Chạy dự án

```bash
npm install
npm run dev
```

Các quality gates:

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

## Kiến trúc

```text
src/app                 Route, layout, metadata và composition
src/i18n                Locale contract, navigation và request configuration
messages                Bản dịch theo namespace cho từng locale
src/features/auth       Login/logout service, mutation và form
src/features/categories Category API phía Server, runtime schema và cây nhiều cấp
src/features/products   Product API phía Server, runtime schema và Product UI
src/features/profile    Current User query, profile mutation và Dashboard UI
src/components/ui       Primitive theo Shadcn UI convention
src/components/shared   Composition không chứa nghiệp vụ
src/lib                 Axios instance, error normalization và utility
src/providers           React Query provider tại boundary cần thiết
```

Các route nằm dưới segment `[locale]`; locale mặc định `en` giữ URL không tiền tố, còn tiếng Việt dùng `/vi`. Nội dung public vẫn được render phía Server; chỉ language switcher và các interaction cần thiết mới hydrate phía Client.

## Đa ngôn ngữ

Dự án dùng `next-intl` với source of truth tại `src/i18n/routing.ts`. Hiện hỗ trợ:

- English: `/products` (locale mặc định, không có prefix).
- Tiếng Việt: `/vi/products`.

File message nằm tại `messages/en.json` và `messages/vi.json`. Khi thêm message, phải thêm cùng key cho mọi locale; không đưa câu hiển thị dùng chung trực tiếp vào shared component. Link và điều hướng phía Client dùng wrapper trong `src/i18n/navigation.ts` để giữ locale hiện tại.

Khi thêm locale mới:

1. Thêm locale vào `src/i18n/routing.ts`.
2. Tạo file `messages/<locale>.json` có cấu trúc key tương ứng.
3. Thêm nhãn/flag vào language switcher.
4. Cập nhật locale OpenGraph trong metadata nếu locale có region riêng.
5. Chạy test, kiểm tra sitemap alternates và production build.

## UI và form

Source tuân theo nguyên tắc **Shadcn-first**. Feature phải dùng primitive trong `src/components/ui` trước khi tạo UI mới:

- Form validation: `Form`, `FormField`, `FormItem`, `FormLabel`, `FormControl`, `FormMessage` cùng React Hook Form và Zod.
- Text: `Input`; ngày: `DatePicker`; lựa chọn: `Select`; boolean: `Checkbox`; action: `Button`.
- `DatePicker` được compose từ `Popover` và `Calendar`; `Select`, `Checkbox`, `Label` dùng Radix để giữ keyboard/focus/accessibility behavior.
- Icon dùng duy nhất `iconsax-reactjs`; icon trang trí có `aria-hidden="true"`, còn icon-only action phải có accessible name.

Native form control chỉ nằm trong implementation của UI primitive. Feature không dùng trực tiếp `<input>`, `<select>` hoặc `<button>` khi đã có component Shadcn tương ứng.

## API contract

Tất cả request phía Client dùng axios instance tại `src/lib/http-client.ts`, có timeout, cancellation, Bearer header và refresh single-flight.

### Authentication

`POST /auth/login`

```json
{
  "email": "user@company.vn",
  "password": "a-secure-password"
}
```

Response thành công:

```json
{
  "accessToken": "<jwt>",
  "refreshToken": "<jwt>",
  "expiresAt": "2099-08-21T12:00:00+00:00",
  "mustChangePassword": false
}
```

- Token được giữ trong memory và đồng bộ vào cookie phiên `SameSite=Lax`, thêm `Secure` khi chạy HTTPS; không ghi vào local/session storage, URL hoặc log. Cookie được đọc lại khi mở tab mới và bị xóa khi logout hoặc session không còn hợp lệ.
- Request sau login tự gắn `Authorization: Bearer <accessToken>`.
- Khi request trả `401`, `POST /auth/refresh` nhận `{ "refreshToken": "<jwt>" }`; các lỗi `401` đồng thời dùng chung một refresh request rồi retry với token mới.
- Refresh thất bại hoặc logout sẽ xóa token và private React Query Cache.
- Vì backend hiện trả JWT trong response body và frontend gọi Public API trực tiếp bằng Bearer header, cookie này phải đọc được phía Client nên không tương đương cookie `HttpOnly`. Khi backend hỗ trợ `Set-Cookie`/BFF, nên chuyển token sang `HttpOnly` để giảm rủi ro từ XSS.

### Sign up

Đăng ký tài khoản là luồng ba bước. `challengeId` chỉ được giữ trong state của form để liên kết các request; OTP và password không được đưa vào URL, Cache hay persistent storage.

1. `POST /auth/signup/start`

```json
{
  "organization": "Example Name",
  "fullName": "Example Name",
  "phone": "+84901234567",
  "email": "user@labdock.local",
  "country": "VN",
  "region": "HCM",
  "address": "1 Nguyen Hue"
}
```

Response trả `challengeId` và `expiresAt`. Đồng hồ OTP dùng chính `expiresAt` từ backend; thao tác gửi lại sẽ khởi tạo challenge mới.

2. `POST /auth/signup/verify-otp` nhận `{ "challengeId": "<guid>", "code": "123456" }` và chỉ chuyển bước khi response có `{ "verified": true }`.

3. `POST /auth/signup/complete` nhận:

```json
{
  "challengeId": "<guid>",
  "password": "Passw0rd!",
  "confirmPassword": "Passw0rd!"
}
```

Response trả `userId` và `email`. Các mutation signup không tự retry để tránh gửi lặp OTP hoặc hoàn tất tài khoản nhiều lần.

### Forgot password

Khôi phục mật khẩu dùng luồng public ba bước tại route `/forgot-password`. `challengeId` chỉ nằm trong state của form; OTP và password mới không được ghi vào URL, persistent storage hoặc log. Các endpoint này không gửi Bearer token và không kích hoạt refresh token khi backend trả `401`.

1. `POST /auth/forgot-password/start` nhận `{ "email": "user@labdock.local" }`, trả `challengeId` và `expiresAt`. Đồng hồ OTP và thao tác resend dùng cùng cách xử lý với sign up; resend luôn thay thế bằng challenge mới.
2. `POST /auth/forgot-password/verify-otp` nhận `{ "challengeId": "<guid>", "code": "123456" }`. UI chỉ chuyển sang bước đặt mật khẩu khi response có `{ "verified": true }`.
3. `POST /auth/forgot-password/reset` nhận:

```json
{
  "challengeId": "<guid>",
  "newPassword": "Passw0rd!",
  "confirmPassword": "Passw0rd!"
}
```

Sau response thành công, form xóa hai trường password khỏi state mutation/form và hiển thị link quay lại login. Các mutation không tự retry để tránh gửi OTP hoặc reset mật khẩu lặp ngoài ý muốn.

Dữ liệu chọn quốc gia dùng chung nằm tại:

- `src/constants/countries.json`: danh sách 249 quốc gia/vùng lãnh thổ với mã ISO alpha-2.
- `src/constants/calling-codes.json`: mapping mã quốc gia với mã gọi điện thoại.
- `src/constants/flag.json`: ảnh cờ và tên hiển thị. `country-options.ts` đối chiếu mã ISO từ tên file ảnh Twemoji vì một số trường `code` trong dữ liệu cờ bị thiếu, trùng hoặc sai.

`src/components/shared/country-select.tsx` compose Shadcn Popover, Button và Command (`cmdk`) để dùng trong đăng ký, hồ sơ, checkout, liên hệ và yêu cầu báo giá. Menu hiển thị ảnh cờ + tên, tìm theo tên, mã ISO hoặc mã gọi; hỗ trợ phím mũi tên, Enter và Escape. Ảnh tải lỗi sẽ thay bằng mã ISO và giữ tên quốc gia.

`valueFormat` giữ định dạng theo form: `code` mặc định cho quốc gia, `name` cho khu vực trong báo giá, `dialCode` cho mã gọi signup và `dialDigits` cho liên hệ/báo giá. `display="callingCode"` hiển thị cờ + mã gọi trên trigger, còn menu giữ đầy đủ tên quốc gia. Các quốc gia cùng mã gọi vẫn là các lựa chọn riêng; `countryCodes` giới hạn danh sách khi form đã có phạm vi hỗ trợ cụ thể. Dữ liệu hồ sơ cũ lưu tên quốc gia vẫn được nhận diện để hiển thị.

### Current User

Sau `POST /auth/login` thành công, frontend khởi chạy prefetch `GET /me/profile` và điều hướng về Home mà không biến lỗi profile thành lỗi đăng nhập. Profile được validate, map và lưu tại private React Query key `['session', 'profile', 'current']`. Provider đặt tại locale root nên request/cache được dùng tiếp khi chuyển từ route Auth sang Home, không tạo request thứ hai.

Khi mở tab mới, token được khôi phục từ cookie phiên; `useAuthSessionQuery` xác định lại session và `useCurrentUserQuery` gọi mới `GET /me/profile`, không persist PII của profile vào cookie hoặc Web Storage.

Khi đã đăng nhập, vùng tài khoản trên header mở account popup bằng click/keyboard với liên kết “My profile” và nút “Logout”. Popover đóng khi click ra ngoài hoặc nhấn Escape. Logout xóa token cùng toàn bộ private React Query Cache, cập nhật session thành unauthenticated và chuyển về `/login`.

`GET /me/profile` trả:

```json
{
  "fullName": "Example Name",
  "phoneNumber": "+84901234567",
  "email": "user@labdock.local",
  "companyName": "Example Company",
  "companyPhone": "+84987654321",
  "businessRegistrationNumber": "0123456789",
  "deliveryAddress": { "address": "1 Nguyen Hue", "postalCode": "700000", "country": "VN" },
  "sameAsDeliveryAddress": true,
  "billingAddress": { "address": "1 Nguyen Hue", "postalCode": "700000", "country": "VN" },
  "profilePictureUrl": "/media/public/profile.jpg",
  "passwordChangedAt": "2026-08-21T10:00:00+00:00",
  "memberSince": "2026-08-21T10:00:00+00:00"
}
```

Transport fields được map sang `CurrentUser`: `phoneNumber -> phone`, `profilePictureUrl -> avatarUrl`, `memberSince -> joinedAt`; delivery và billing address vẫn được giữ đầy đủ. Các field hồ sơ chưa hoàn thiện có thể là `null` và được chuẩn hóa sang giá trị rỗng/fallback an toàn. API chưa trả role/last activity nên domain dùng `unknown`/`null`, không suy diễn quyền hạn từ UI.

Form Profile cập nhật qua `PUT /me/profile` bằng axios instance chung nên tự gắn Bearer token và dùng refresh-token single-flight. Form values được map về transport fields (`phone -> phoneNumber`, `billingSameAsDelivery -> sameAsDeliveryAddress`); khi billing giống delivery, request gửi cùng address object, nếu không thì giữ billing address hiện tại. Mutation không retry, validate response bằng cùng schema với `GET`, rồi thay trực tiếp private Cache `['session', 'profile', 'current']` bằng response mới nhất.

Form Security đổi mật khẩu qua `POST /auth/change-password` với `currentPassword`, `newPassword` và `confirmPassword`. Request dùng Bearer token, không tự retry và không đưa password vào URL, log hoặc Cache. Sau thành công, form xóa toàn bộ password khỏi state và invalidate riêng profile hiện tại để tải lại `passwordChangedAt`.

Backend luôn phải kiểm tra Authentication và Authorization. Việc ẩn UI không được xem là kiểm soát quyền.

### Categories

`GET /categories` trên Public API trả cây nhiều cấp qua trường `children`. Frontend validate đệ quy toàn bộ response bằng Zod rồi truyền dữ liệu đã kiểm tra vào menu “All Categories”.

Category được tải trong Server Component bằng native `fetch`. Nếu request có cookie access token, frontend gửi `Authorization: Bearer <token>` và dùng `cache: 'no-store'`; nếu không có token, response public được cache/revalidate mỗi 5 phút. Request thất bại sẽ hiển thị trạng thái không tải được category thay vì làm hỏng header.

Menu và thanh danh mục dùng `productCount` từ API nếu có, kể cả giá trị `0`. Khi thiếu, server bổ sung số đếm bằng `GET /products?page=1&pageSize=1&CategoryIds={id}`, dùng lại cache policy của catalog. Các cấp trong cây được tải song song; lỗi đếm riêng lẻ vẫn giữ liên kết danh mục và không thay số chưa biết bằng `0`.

### Product catalog

Route `/products` tải song song `GET /products`, `GET /categories`, `GET /brands` và `GET /origins` ở Server Component. Thanh category phía trên và bộ lọc Brand giữ lựa chọn đơn qua `categoryId`, `brandId`; nhóm Origin dưới Brand dùng checkbox chọn nhiều, lưu trong URL qua `origins=SG,DE`. Phân trang và sắp xếp dùng `page`, `sort`. Mỗi lần đổi bộ lọc hoặc sort, trang được đưa về page đầu và Server Component request lại `GET /products` với `pageSize=20`. Server chuyển danh sách ID và origin thành chuỗi phân cách bằng dấu phẩy với tên tham số API `CategoryIds`, `brandIds`, `Origins`; các tham số còn lại là `page`, `pageSize`, `Sort`, `IsNew`, `IsOutstanding`. Trang `/products/category/[slug]` dùng cùng bộ lọc Brand/Origin với category lấy từ route.

Category tree được flatten nhưng vẫn giữ độ sâu để hiển thị phân cấp. Các request có thể lỗi độc lập: lỗi products không khóa bộ lọc, còn lỗi categories, brands hoặc origins không làm mất danh sách products. `GET /origins` được validate theo mảng string; danh sách rỗng, lỗi tải và tìm kiếm không khớp có thông báo riêng. Origin hiển thị tối đa 5 lựa chọn ban đầu, hỗ trợ xem thêm và tìm kiếm toàn bộ danh sách. Request ẩn danh dùng Next Data Cache revalidate 5 phút; URL request khác nhau được cache riêng, còn tag chung hỗ trợ invalidation theo resource (`origins` cho danh sách xuất xứ). Khi có access token trong cookie, các request gắn Bearer token và dùng `no-store` để không chia sẻ response theo người dùng.

### Product detail contract

Route `/products/[slug]` gọi `GET /products/{slug}` phía Server và dùng cùng payload cho metadata, JSON-LD và nội dung hiển thị. Response `404` được map sang trang Not Found; lỗi HTTP hoặc payload không hợp lệ được chuyển cho error boundary. Request ẩn danh được cache 5 phút với tags `products` và `product:{slug}`; request có access token gửi Bearer token và dùng `no-store`.

Payload đầy đủ được định nghĩa bởi type `Product` tại `src/features/products/products.types.ts` và validate bằng `publicProductDetailSchema`. Contract gồm thông tin cơ bản, trạng thái, flags yêu cầu đặc biệt/hạn chế, CAS, specifications, variants và selections, media, documents, related products và certificates. UAT có thể trả giá variant và `related` là `null` khi dữ liệu không công khai; Zod boundary chuẩn hóa giá về `0` và related về mảng rỗng để domain type không chứa nullable ngoài contract.

Detail UI dùng trực tiếp `Product`: gallery lấy media primary/sort order, purchase panel dùng variant và stock thực, References dùng documents, badges chứng nhận dùng certificates, còn shelf related được map từ `related`. Response product list rút gọn cũng được map vào cùng contract trước khi truyền xuống `ProductCard`; `ProductViewModel` chỉ còn phục vụ dữ liệu demo cũ.

### Homepage

`GET /homepage` là request public duy nhất cho nội dung Home, trả về `banners`, `topBrands`, `topCategories`, `newestProducts`, `personalizedOffers` và `testimonials`. Frontend validate các section đang sử dụng bằng Zod rồi map sang view model; trường `topBrands` được bỏ qua:

- `banners` cấp ảnh, link, title, description, CTA, badge, thời gian và địa điểm cho Hero. `type` chỉ nhận `Left | Right`: banner `Left` chiếm hai cột, banner `Right` chiếm một cột; description chỉ render khi `showDescription=true`.
- Research Leaders dùng cố định 12 logo SVG local tại `public/home/research-leaders/`, export từ Figma frame `106:4453`; không dùng hoặc validate `topBrands` từ API. Thứ tự và kích thước logo nằm trong `src/features/home/research-leaders.ts`. Mobile dưới 640px dùng Swiper một hàng với autoplay mỗi 5 giây, kéo vuốt và nút trước/sau. Autoplay tiếp tục sau khi bấm nút điều hướng, tạm dừng khi hover trên vùng slide; từ 640px dừng autoplay và hiển thị grid 3 cột, từ 1024px hiển thị grid 6 cột. Khi trở về mobile, autoplay tự bật lại.
- `topCategories` cấp tên/slug cho Top Categories.
- `newestProducts` cấp New Products và dùng các item có `isOutstanding=true` cho Outstanding Products.
- `personalizedOffers` cấp Personalized offer.
- `testimonials` cấp nội dung/author cho testimonial carousel.

Request dùng native `fetch` phía Server. Nếu không có access token, Next Data Cache dùng `revalidate` 5 phút và tag `homepage`; nếu cookie có token, request gắn Bearer token và dùng `no-store`. Nếu request lỗi hoặc payload không hợp lệ, Home nhận các section rỗng và không thực hiện các request products/brands riêng. Request `/categories` vẫn được giữ cho menu “All Categories” nhiều cấp dùng chung ở header.

### Cart

`GET /cart` là dữ liệu riêng theo phiên đăng nhập, được gọi phía Client qua axios instance chung để tự gắn Bearer token và dùng refresh-token single-flight. `useCartQuery` truyền AbortSignal, giữ kết quả tại private React Query key `['cart', 'detail']` trong 30 giây và Cache bị xóa khi logout hoặc phiên hết hạn.

Response được validate bằng `cartResponseSchema` trước khi map các field transport (`productName`, `sku`, `variantId`, `productId`, `currency`, `lineTotal`, `stockQty`) sang model mà Cart, Checkout và header đang dùng. Cart UI giới hạn quantity theo `stockQty` và format theo currency của item. Hiện chỉ `GET /cart` dùng backend; add, update và remove vẫn dùng implementation local hiện có cho đến khi có contract endpoint tương ứng.

### Checkout sessions

`checkoutService.create` dùng Axios để gửi `POST /checkout/sessions` với `cartItemIds` của các dòng được chọn, `recipientName` từ tên người nhận, `phone` dạng quốc tế không chứa khoảng trắng/dấu gạch, `addressLine1`, `city`, `country` dạng ISO alpha-2 và `notes` (chuỗi rỗng nếu không nhập). Form có thêm City bắt buộc và Notes tùy chọn. Email, company, postal code, billing và phương thức thanh toán trên form không nằm trong request này. Postal code giao hàng là tùy chọn, không còn giới hạn 6 chữ số.

Response được validate bằng `checkoutSessionSchema`, gồm `orderId`, `orderNumber`, `checkoutUrl`. Khi thành công, trình duyệt chuyển đến URL HTTP/HTTPS do backend trả về; không tạo payment reference hoặc tính amount giả lập. Mutation không tự retry và nút submit bị khóa khi pending. Trang `/payment` cũ và thao tác `completePayment` vẫn là mock local; chúng không được dùng trong luồng tạo checkout mới.

## Cache và session

- Public content không dùng React Query.
- Mọi server request tới `/homepage`, `/categories`, `/brands`, `/origins` và `/products...` đọc cookie `labdock_access_token`. Khi có token, request gắn `Authorization: Bearer <token>` và dùng `cache: 'no-store'` để response theo phiên không đi vào shared Cache.
- Marketing/Auth layouts chờ request context trước khi tải dữ liệu server để cookie luôn khả dụng theo từng request; response ẩn danh của từng API vẫn có thể dùng shared Data Cache.
- Khi không có token, Categories, Brands, Origins, Homepage và Products dùng Next Data Cache với `revalidate` 5 phút cùng resource tags tương ứng; filter, sort và page của Product catalog nằm trong URL request.
- Product detail ẩn danh dùng tags `products` và `product:{slug}`, revalidate 5 phút.
- Products và Brands standalone vẫn có thể dùng các server service riêng khi các màn hình khác cần chúng; Home không gọi các service này.
- Cart dùng private React Query Cache với key `['cart', 'detail']`, `staleTime` 30 giây và không đi qua Next public Cache.
- Profile dùng key `['session', 'profile', 'current']`, `staleTime` 60 giây và không tự retry; user có thể retry có chủ đích tại màn Profile.
- Login và logout xóa private React Query Cache để ngăn dữ liệu vượt phiên.
- Token không được lưu vào localStorage, sessionStorage, query string hoặc log; cookie phiên bị xóa cùng private Cache khi logout/refresh thất bại.

## Thêm feature mới

Đọc `.codex/AGENTS.md`, sau đó phân loại API theo `.codex/docs/api-convention.md`. Tìm implementation tương tự trước khi tạo service, Hook hoặc component mới.
