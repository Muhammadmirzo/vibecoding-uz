# Naqsh Mobile API — ilova dasturchisi uchun qo'llanma (v1)

Baza URL: `https://master-2-jade.vercel.app`. Barcha endpointlar `/api/v1/...` ostida.
Interaktiv hujjat: [`/api/v1/docs`](https://master-2-jade.vercel.app/api/v1/docs) (Scalar),
mashina o'qyidigani: `/api/v1/openapi.json` (OpenAPI 3.1, Zod kontraktlardan generatsiya).

Expo / React Native tavsiya etiladi. Quyida Swift (URLSession + Keychain) va
Kotlin (OkHttp + EncryptedSharedPreferences) uchun ham ko'rsatmalar bor.

## 1. Javob formati

Muvaffaqiyat (200/201): `{ "data": {...}, "meta"?: { "nextCursor"?, "total"? } }`
Xatolik: `{ "error": { "code": "snake_case", "message": "o'zbekcha", "details"? } }`

Statuslar: 400 validatsiya, 401 avtorizatsiya, 403 ruxsat, 404 topilmadi,
409 konflikt, 422 qayta ishlanmas, 429 limit (`Retry-After` bilan),
503 provayder/DB o'chgan.

Har bir v1 javobda: `X-Request-Id` (bag'ni yuborishda shu id'ni qo'shing),
`X-Api-Version: v1`, `Content-Language: uz|ru|en`.

## 2. Auth oqimlari

### 2a. Telefon + parol (asosiy)

```
App                      API
 | POST /api/v1/auth/token {phone,password,deviceId,deviceName,platform,appVersion} |
 | -------------------------------------------------------------------------------> |
 |                         |  login lockout + rate-limit (web bilan bir xil)       |
 | 201 {accessToken (15 daq), refreshToken (30 kun), user}                           |
 | <------------------------------------------------------------------------------- |
```

- `accessToken` — har bir so'rovda `Authorization: Bearer <token>`.
- `refreshToken` — faqat `/auth/refresh`'ga yuboriladi, **hech qachon logga yozmang**.
- Access 401 bersa → refresh → yangi juftlikni saqlab, so'rovni **bir marta** takrorlang.

Saqlash: iOS Keychain (`kSecClassGenericPassword`, `accessibleAfterFirstUnlock`),
Android EncryptedSharedPreferences / Keystore. AsyncStorage — taqiqlanadi.

### 2b. Telegram deep-link

```
App                                  API                          Telegram
 | POST /auth/telegram/start          |                               |
 | ---------------------------------> | id + deepLink + token (5 daq) |
 | <--------------------------------- |                               |
 | deepLink'ni ochadi ───────────────────────────────────────────────> |
 | (foydalanuvchi botda "Ha" ni bosadi)                               |
 | POST /auth/telegram/status {id, token, device...}                  |
 | --->  {state:"pending"} ... {state:"approved", tokens:{...}}        |
```

Status'ni 2 soniyada bir, jami 5 daqiqa so'rang. `token`'ni cookie o'rniga
body'da oladi — uni ham Keychain'da saqlang, keyin o'chiring.

### 2c. Refresh rotatsiyasi

Har bir refresh **bir marta** ishlaydi: eski o'ladi, yangisi tug'iladi.
O'g'irlangan token qayta ishlatilsa → butun qurilma oilasi yopiladi
(`TOKEN_REUSED`) → foydalanuvchini login ekraniga qaytaring va
barchasini o'chiring.

## 3. Push ro'yxatdan o'tkazish

Login'dan keyin Expo push token'ni oling → `POST /push-devices`
`{platform:"expo", pushToken, appVersion, locale}`. Logout'da
`DELETE /push-devices/{id}`. Token yangilansa — qayta POST (upsert).

## 4. Deep linklar

- Kurs: `/kurs/{slug}` → app'da kurs ekrani (`applinks` + `assetlinks` ulangan).
- Kabinet: `/kabinet`. - Referal: `/ref/{code}` → `GET /me/referral`'dagi `code`.

## 5. Xatolar, sahifalash, offline

- 429 → `Retry-After` soniya kuting, exponential backoff (1s, 2s, 4s).
- 503 (`retryable: true`) → keshlangan ekranni ko'rsating, keyin qayta urining.
- Ro'yxatlar: `?cursor=...&limit=20` (max 100), javobdagi `meta.nextCursor` bilan yuring.
- Offline: `GET /courses`, `/courses/{slug}`, ko'rilgan darslar va `app/config`
  60–300 soniya `Cache-Control` + `ETag` bilan keladi — ularni Disk'da keshlang.
  Progress va homework — navbatga qo'yib, tarmoq qaytganda yuboring.
- Eskirish: o'chiriladigan endpoint kamida 90 kun oldin `Sunset` sarlavhasini oladi.

## 6. Curl misollar

```bash
BASE=https://master-2-jade.vercel.app/api/v1

# Token olish
curl -X POST $BASE/auth/token -H 'Content-Type: application/json' -d \
 '{"phone":"+998901234567","password":"MaxfiyParol123","deviceId":"iphone-15-A1","deviceName":"iPhone 15","platform":"ios","appVersion":"1.0.0"}'

# Profil
curl $BASE/me -H "Authorization: Bearer ACCESS"
curl -X PATCH $BASE/me -H "Authorization: Bearer ACCESS" -H 'Content-Type: application/json' -d '{"fullName":"Aziza Karimova","city":"Toshkent"}'

# Yozuvlarim / kurslar / darslar
curl $BASE/me/enrollments -H "Authorization: Bearer ACCESS"
curl "$BASE/courses" -H "Authorization: Bearer ACCESS"
curl $BASE/courses/ai-mahsulot -H "Authorization: Bearer ACCESS"
curl $BASE/courses/ai-mahsulot/lessons -H "Authorization: Bearer ACCESS"
curl $BASE/lessons/LESSON_ID -H "Authorization: Bearer ACCESS"

# Progress
curl -X POST $BASE/lessons/LESSON_ID/progress -H "Authorization: Bearer ACCESS" \
 -H 'Content-Type: application/json' -d '{"positionSec":320,"completed":true}'

# Vazifalar
curl "$BASE/homework?limit=20" -H "Authorization: Bearer ACCESS"
curl -X POST $BASE/homework -H "Authorization: Bearer ACCESS" -H 'Content-Type: application/json' -d \
 '{"assignmentId":"ASSIGN_ID","fileUrls":["https://.../ish.pdf"],"note":"Tayyor"}'

# To'lovlar / sertifikat / referal
curl $BASE/me/payments -H "Authorization: Bearer ACCESS"
curl $BASE/me/certificates -H "Authorization: Bearer ACCESS"
curl $BASE/me/referral -H "Authorization: Bearer ACCESS"

# Push
curl -X POST $BASE/push-devices -H "Authorization: Bearer ACCESS" -H 'Content-Type: application/json' -d \
 '{"platform":"expo","pushToken":"ExponentPushToken[xxxx]","appVersion":"1.0.0","locale":"uz"}'
curl -X DELETE $BASE/push-devices/DEVICE_ID -H "Authorization: Bearer ACCESS"

# Refresh / logout / sessiyalar
curl -X POST $BASE/auth/refresh -H 'Content-Type: application/json' -d '{"refreshToken":"mrt_..."}'
curl -X POST $BASE/auth/logout -H "Authorization: Bearer ACCESS" -H 'Content-Type: application/json' -d '{"refreshToken":"mrt_..."}'
curl $BASE/auth/sessions -H "Authorization: Bearer ACCESS"
curl -X DELETE $BASE/auth/sessions/SESSION_ID -H "Authorization: Bearer ACCESS"

# Telegram login
curl -X POST $BASE/auth/telegram/start
curl -X POST $BASE/auth/telegram/status -H 'Content-Type: application/json' -d \
 '{"id":"REQ_ID","token":"CLAIM_TOKEN","deviceId":"iphone-15-A1","platform":"ios"}'

# Konfig / hujjat
curl $BASE/app/config -H 'X-App-Platform: ios' -H 'X-App-Version: 1.0.0'
curl $BASE/openapi.json
```

## 7. Swift / Kotlin eslatma

- Swift: `URLSession` + `AuthInterceptor` (401 → refresh → retry ×1), Keychain via
  `Security` framework, push — `APNs deviceToken → POST /push-devices {platform:"ios"}`.
- Kotlin: OkHttp `Authenticator` (bir xil retry), `EncryptedSharedPreferences`,
  FCM token → `{platform:"android"}`. Deep linklar — `assetlinks.json`'dagi
  `package_name` + SHA-256 bilan `intent-filter (autoVerify=true)`.
