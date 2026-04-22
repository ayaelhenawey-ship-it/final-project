# 📚 وثيقة الربط (API Documentation) لمشروع رابطة

**الرابط الأساسي للسيرفر (Base URL):** `http://localhost:5000/api/v1`
**طريقة المصادقة:** إرسال التوكن في الـ Headers `Authorization: Bearer <your_token>`

---

## 1️⃣ مسارات المصادقة (Authentication)

### 🟢 1. إنشاء حساب جديد (Register)

- **المسار:** `POST /auth/register`
- **الوصف:** لإنشاء حساب جديد كطالب، مستقل، أو صاحب عمل.
- **البيانات المطلوبة (Body):**

````json
{
  "fullName": "Menna ITI",
  "email": "menna@example.com",
  "phoneNumber": "01012345678",
  "password": "password123",
  "role": "student", // يجب أن يكون: 'student' أو 'freelancer' أو 'employer'
  "professionalTitle": "Front-End Developer", // تخصص الطالب أو مجال الشركة
  "location": "Aswan, Egypt",
  "bio": "شغوف بتطوير واجهات المستخدم"
}
الرد الناجح (201 Created): يرجع بيانات المستخدم + token.

🟢 2. تسجيل الدخول (Login)
المسار: POST /auth/login

البيانات المطلوبة (Body):

JSON

{
  "email": "menna@example.com",
  "password": "password123"
}
الرد الناجح (200 OK): يرجع token.

2️⃣ إدارة الملف الشخصي (Profile Management)
🔵 1. تحديث بيانات المستخدم (Update Profile)
المسار: PATCH /users/updateMe

التصريح (Auth): مطلوب (Bearer Token)

البيانات المطلوبة (Body): (ترسل فقط الحقول المراد تحديثها بناءً على دور المستخدم)

مثال لطالب / مستقل (Student/Freelancer):

JSON

{
  "professionalTitle": "Senior React Developer",
  "location": "Cairo, Egypt",
  "bio": "نبذة قصيرة عني",
  "about": "تفاصيل أكثر عن مسيرتي المهنية...",
  "skills": ["react", "node.js", "tailwind"],
  "socialLinks": {
    "github": "[https://github.com/](https://github.com/)...",
    "linkedin": "[https://linkedin.com/in/](https://linkedin.com/in/)...",
    "mostaql": ""
  },
  "featuredProjects": [
    {
      "title": "Rabta Platform",
      "description": "Telegram for techies",
      "link": "[https://rabta.app](https://rabta.app)"
    }
  ]
}
مثال لصاحب عمل / شركة (Employer):

JSON

{
  "professionalTitle": "Software Development Agency",
  "location": "Alexandria, Egypt",
  "bio": "نبذة عن شركتنا",
  "about": "نحن شركة رائدة في مجال التكنولوجيا...",
  "targetTalents": ["frontend", "backend", "ui/ux"]
}

3️⃣ البحث والاستكشاف (Search & Discovery)
🟣 1. البحث عن المستخدمين مع التقسيم لصفحات (Search Users & Pagination)
المسار: GET /users/search

التصريح (Auth): مطلوب (Bearer Token)

المعاملات (Query Parameters):

page (اختياري): رقم الصفحة (الافتراضي 1).

limit (اختياري): عدد النتائج في الصفحة (الافتراضي 10).

role (اختياري): للفلترة بنوع الحساب (student, employer).

keyword (اختياري): للبحث في الاسم، التخصص (professionalTitle)، أو المهارات.

مثال للطلب (Request): /users/search?role=student&keyword=react&page=1&limit=10

الرد الناجح (200 OK):

JSON

{
  "status": "success",
  "results": 10,
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalUsers": 48
  },
  "data": {
    "users": [ ... مصفوفة المستخدمين ... ]
  }
}

4️⃣ دليل المكالمات في الوقت الفعلي (Socket.io Real-time Calls)
للربط بخدمة المكالمات، يجب الاتصال بالرابط الأساسي للسيرفر http://localhost:5000.

📤 أحداث الإرسال (Events emitted from Frontend to Backend):
register-user: يتم إرساله فور فتح الموقع مع الـ userId لربط المتصفح بخط الاتصال.

call-user: لإجراء مكالمة. يُرسل مع البيانات التالية: { userToCall, signalData, from, callerName }.

answer-call: للرد على المكالمة. يُرسل مع البيانات التالية: { to, signal, callId }.

end-call: لإنهاء المكالمة. يُرسل مع البيانات التالية: { to }.

📥 أحداث الاستقبال (Events listened to by Frontend):
incoming-call: عندما يتصل بك شخص ما. تستقبل: { signal, from, callerName, callId }.

call-accepted: يتم استقبالها عند موافقة الطرف الآخر على المكالمة للبدء في نقل الفيديو.

user-offline: للرد بأن المستخدم غير متصل حالياً.

call-ended: يتم استقبالها عندما ينهي الطرف الآخر المكالمة.

🛑 توحيد شكل الردود (Standard Response Format)
جميع الردود من الخادم ستتبع هذا النمط ليسهل التعامل معها في الواجهة الأمامية:

في حالة النجاح (Success):

JSON

{
  "status": "success",
  "data": { ... }
}
في حالة الخطأ (Error):

JSON

{
  "status": "error",
  "message": "وصف الخطأ هنا",
  "errors": [ ... ] // تظهر فقط في حالة أخطاء التحقق من البيانات (Validation)
}


// --------------- Week number 3 Youssef -------------------

* **تجهيز الـ APIdog (أو Postman):** تظبط الريكويستات اللي عملناها (زي إنشاء المجتمع، وجلب الرسائل) وتعملها Export في فايل، بحيث أي حد في التيم يعملها Import عنده ويشوف اللينكات وشكل الـ Body والـ Headers جاهزة قدامه بدل ما يكتبها من الصفر.
* **توثيق السوكيت (Socket Events Docs):** الـ REST API سهل يتفهم، بس السوكيت بيلخبط الفرونت إند. محتاج تكتبلهم نوت سريعة فيها أسماء الـ Events المظبوطة (`join-room`, `send-message`, `receive-message`) وشكل الـ JSON اللي المفروض يبعتوه ويستقبلوه.
* **تعليمات تشغيل السيرفر اللوكال:** وإنت بتكتب دوكيومنت التشغيل للتيم، ضروري جداً تحط خطوة إنهم يقفلوا أي برامج شغالة في الخلفية زي Ollama قبل ما يقوموا المشروع، عشان يتجنبوا أي مشكلة في تداخل البورتات (Port conflicts) السيرفر يضرب معاهم.

---

# 🚀 Rabta Project - Chat & Socket.io Handover Docs

## ⚠️ تعليمات هامة قبل التشغيل (Local Setup)
برجاء التأكد من إغلاق أي برامج تعمل في الخلفية وتستهلك الـ Ports (مثل برنامج Ollama أو أي سيرفر آخر) لتجنب حدوث Port Conflicts أثناء تشغيل سيرفر الباك إند.

---

## 1️⃣ REST APIs (HTTP)

### A. Create Community (إنشاء مجتمع متخصص)
- **Method:** `POST`
- **Endpoint:** `/api/v1/chats/communities`
- **Headers:** `Authorization: Bearer <Your_Token>`
- **Body (JSON):**
  ```json
  {
    "name": "React ITI 2026",
    "description": "أفضل مجتمع لمطوري رياكت",
    "category": "frontend",
    "tags": ["react", "javascript"]
  }
````

- **Note:** الحقل `category` يجب أن يكون Unique. إذا تم إرسال قسم موجود مسبقاً، سيرد السيرفر بـ Status `400` مع الرسالة التالية:
  `"A community for this category already exists. Please join it instead of creating a new one."`

### B. Get Message History (جلب الرسائل السابقة للشات)

- **Method:** `GET`
- **Endpoint:** `/api/v1/chats/:chatId/messages` _(قم باستبدال `:chatId` بـ ID الشات وليس ID المجتمع)_
- **Headers:** `Authorization: Bearer <Your_Token>`

---

## 2️⃣ Socket.io (Real-time Chat)

### A. Connection (الاتصال بالسيرفر)

- **URL:** `http://localhost:5000`
- **Auth:** السيرفر محمي. يجب إرسال الـ Token الصافي (بدون كلمة Bearer) في الـ Query.
- **مثال للفرونت إند:**
  ```javascript
  const socket = io("http://localhost:5000", {
    query: { token: "eyJhbGciOiJIUzI1..." },
  });
  ```

### B. Events (أحداث السوكيت)

**1. Join Room (دخول غرفة الشات):**

- **Event Name:** `join-room`
- **Payload:** `chatId` (String)
- **الوصف:** يجب إرسال هذا الحدث بمجرد فتح المستخدم لأي شات حتى يتمكن من إرسال واستقبال الرسائل الخاصة بهذه الغرفة.

**2. Send Message (إرسال رسالة):**

- **Event Name:** `send-message`
- **Payload (JSON Object):**
  ```json
  {
    "chatId": "65f1a2b3c4d5e...",
    "content": "محتوى الرسالة هنا"
  }
  ```

**3. Receive Message (استقبال رسالة):**

- **Event Name:** `receive-message`
- **الوصف:** يجب عمل `socket.on` لهذا الحدث. سيقوم السيرفر بإرسال كائن (Object) الرسالة كاملاً (يحتوي على بيانات المرسل والتاريخ) فور إرسال أي رسالة داخل الغرفة.
