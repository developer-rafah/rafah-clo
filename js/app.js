/* إخفاء نافذة الدخول */
setTimeout(()=>document.getElementById("entryPopup").style.display="none",2600);

/* Scroll Reveal */
const obs=new IntersectionObserver(e=>e.forEach(i=>i.isIntersecting&&i.target.classList.add("show")),{threshold:.15});
document.querySelectorAll(".reveal").forEach(el=>obs.observe(el));

/* عبارات الأثر */
const impactTexts=["أثرك مستمر","دفء يصل","سترٌ يدوم","خيرٌ يتضاعف"];
let idx=0;
setInterval(()=>{
  idx=(idx+1)%impactTexts.length;
  document.getElementById("impactText").textContent=impactTexts[idx];
},2600);

/* النوافذ */
function openForm(){
  document.getElementById("formModal").style.display="flex";
  restoreDraft();       // 🔒 استرجاع الحفظ التلقائي عند فتح النموذج
  validateAll();        // تحديث الحالات
}

/* ====== إضافات: حفظ تلقائي + تحقق + تفعيل زر الإرسال ====== */
const STORAGE_KEY = "rafah_donation_draft_v1";

const nameInput  = document.querySelector('#formModal input[placeholder="الاسم"]');
const phoneInput = document.querySelector('#formModal input[placeholder="رقم الجوال"]');
const areaInput  = document.querySelector('#formModal input[placeholder="الحي"]');

const errName  = document.getElementById("errName");
const errPhone = document.getElementById("errPhone");
const errArea  = document.getElementById("errArea");

const submitBtn = document.getElementById("submitBtn");

function shakeEl(el){
  el.classList.add("shake");
  setTimeout(()=>el.classList.remove("shake"),350);
}
function showErr(inputEl, box, msg){
  box.textContent = msg;
  box.style.display = "block";
  inputEl.classList.add("invalid");
  inputEl.classList.remove("valid");
  shakeEl(inputEl);
}
function clearErr(inputEl, box){
  box.style.display = "none";
  inputEl.classList.remove("invalid");
}

/* ✅ Toast */
function showToast(text){
  const t = document.getElementById("toast");
  if(!t) return;
  t.textContent = text;
  t.classList.add("show");
  clearTimeout(showToast._tmr);
  showToast._tmr = setTimeout(()=>t.classList.remove("show"), 1800);
}

/* حفظ تلقائي */
function saveDraft(){
  const draft = {
    name: nameInput.value,
    phone: phoneInput.value,
    area: areaInput.value,
    lat: lat,
    lng: lng
  };
  try{
    localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  }catch(e){}
}
function restoreDraft(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    if(!raw) return;
    const draft = JSON.parse(raw);
    if(draft && typeof draft === "object"){
      if(typeof draft.name === "string") nameInput.value = draft.name;
      if(typeof draft.phone === "string") phoneInput.value = draft.phone;
      if(typeof draft.area === "string") areaInput.value = draft.area;
      if(typeof draft.lat === "number") lat = draft.lat;
      if(typeof draft.lng === "number") lng = draft.lng;

      if(lat && lng){
        document.getElementById("locationStatus").textContent="✔️ تم تحديد موقع الاستلام بدقة";
      }
    }
  }catch(e){}
}

/* قواعد التحقق */
function isArabicText(s){
  const v = (s || "").trim();
  return v.length > 0 && /^[ء-ي\s]+$/.test(v);
}
function isSaudiMobile(s){
  const v = (s || "").trim();
  return /^05\d{8}$/.test(v);
}

/* تلوين الحقول + أيقونة ✔️ (باستخدام background-image في CSS) */
function setValid(inputEl, box){
  inputEl.classList.add("valid");
  inputEl.classList.remove("invalid");
  if(box) box.style.display="none";
}
function setInvalid(inputEl){
  inputEl.classList.remove("valid");
}

/* تحديث زر الإرسال */
function updateSubmitState(){
  const phoneClean = phoneInput.value.replace(/\D/g,''); // لضمان متصل
  const ok =
    isArabicText(nameInput.value) &&
    isSaudiMobile(phoneClean) &&
    isArabicText(areaInput.value) &&
    !!lat && !!lng;

  submitBtn.disabled = !ok;
}

/* تحقق شامل */
function validateAll(){
  // الاسم
  if(nameInput.value.trim() === ""){
    clearErr(nameInput, errName);
    setInvalid(nameInput);
  }else if(!isArabicText(nameInput.value)){
    showErr(nameInput, errName, "الاسم يجب أن يكون حروف عربية فقط");
  }else{
    clearErr(nameInput, errName);
    setValid(nameInput, errName);
  }

  // الجوال (بدون مسافات - متصل)
  const cleanedPhone = phoneInput.value.replace(/\D/g,'').slice(0,10);
  phoneInput.value = cleanedPhone; // ✅ متصل دائماً بدون مسافات
  if(cleanedPhone === ""){
    clearErr(phoneInput, errPhone);
    setInvalid(phoneInput);
  }else if(cleanedPhone.length >= 2 && !cleanedPhone.startsWith("05")){
    showErr(phoneInput, errPhone, "رقم الجوال يجب أن يبدأ بـ 05");
  }else if(cleanedPhone.length === 10 && isSaudiMobile(cleanedPhone)){
    clearErr(phoneInput, errPhone);
    setValid(phoneInput, errPhone);
  }else{
    // لا نعتبره خطأ قوي أثناء الكتابة إلا إذا اكتمل 10 وخطأ
    clearErr(phoneInput, errPhone);
    setInvalid(phoneInput);
  }

  // الحي
  if(areaInput.value.trim() === ""){
    clearErr(areaInput, errArea);
    setInvalid(areaInput);
  }else if(!isArabicText(areaInput.value)){
    showErr(areaInput, errArea, "الحي يجب أن يكون حروف عربية فقط");
  }else{
    clearErr(areaInput, errArea);
    setValid(areaInput, errArea);
  }

  updateSubmitState();
  saveDraft();
}

/* الاسم: حروف عربية ومسافات فقط */
nameInput.addEventListener("input", function(){
  const cleaned = this.value.replace(/[^ء-ي\s]/g,"");
  if(this.value !== cleaned) this.value = cleaned;
  validateAll();
});

/* الحي: حروف عربية ومسافات فقط */
areaInput.addEventListener("input", function(){
  const cleaned = this.value.replace(/[^ء-ي\s]/g,"");
  if(this.value !== cleaned) this.value = cleaned;
  validateAll();
});

/* الجوال: أرقام فقط + 10 + يبدأ 05 + بدون مسافات */
phoneInput.addEventListener("input", function(){
  let raw = this.value.replace(/\D/g,"");
  if(raw.length > 10) raw = raw.slice(0,10);
  this.value = raw; // ✅ متصل بدون مسافات
  validateAll();
});

let map,marker,lat,lng;

/* ======= إضافة مساعدة للدقة (جديدة) ======= */
function getAccuracyLabel(accMeters){
  if(typeof accMeters !== "number") return "ℹ️ الدقة غير متاحة";
  if(accMeters <= 20) return "🎯 دقة عالية";
  if(accMeters <= 50) return "📍 دقة متوسطة";
  return "⚠️ دقة منخفضة";
}
function setAccuracyUI(accMeters){
  const el = document.getElementById("accuracyInfo");
  if(!el) return;
  if(typeof accMeters === "number"){
    el.textContent = `${getAccuracyLabel(accMeters)} (±${Math.round(accMeters)} متر)`;
  }else{
    el.textContent = getAccuracyLabel(accMeters);
  }
}
/* ======= نهاية الإضافة ======= */

/* ======= تطوير openMap لتحميل الموقع تلقائيًا + السماح بالتعديل ======= */
function openMap(){
  document.getElementById("mapModal").style.display="flex";

  setTimeout(()=>{
    // لو الخريطة موجودة: فقط حدّث الحجم وركز على أحدث إحداثيات
    if(map){
      map.invalidateSize();
      if(lat && lng && marker){
        map.setView([lat,lng],16);
        marker.setLatLng([lat,lng]);
      }
      return;
    }

    // تحديد مركز البداية: لو محفوظ lat/lng نبدأ به، وإلا الرياض
    const defaultCenter = [24.7136,46.6753];
    const startCenter = (lat && lng) ? [lat,lng] : defaultCenter;
    const startZoom   = (lat && lng) ? 16 : 13;

    map=L.map('map').setView(startCenter,startZoom);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19}).addTo(map);

    marker=L.marker(map.getCenter(),{draggable:true}).addTo(map);

    // ✅ السماح بالتعديل اليدوي دائماً
    marker.on("dragend", ()=>{
      const p = marker.getLatLng();
      lat = p.lat; lng = p.lng;
      document.getElementById("locationStatus").textContent="📍 تم تحديث الموقع بعد التعديل";
      setAccuracyUI(undefined); // عند التحريك اليدوي لا يوجد accuracy من GPS
      saveDraft();
      updateSubmitState();
    });

    // ✅ محاولة التقاط الموقع تلقائيًا إذا ما عندنا موقع محفوظ
    if(!(lat && lng)){
      locateNow();
    }else{
      document.getElementById("locationStatus").textContent="📍 تم تحميل موقعك المحفوظ — يمكنك تعديل الدبوس إذا لزم";
      setAccuracyUI(undefined);
    }
  },200);
}

/* ======= دالة جديدة: إعادة تحديد الموقع عند الضغط على زر "استخدم موقعي الآن" ======= */
function locateNow(){
  if(!("geolocation" in navigator)){
    document.getElementById("locationStatus").textContent="❌ المتصفح لا يدعم تحديد الموقع";
    setAccuracyUI(undefined);
    return;
  }

  document.getElementById("locationStatus").textContent="⏳ جاري تحديد موقعك تلقائيًا...";
  setAccuracyUI(undefined);

  navigator.geolocation.getCurrentPosition(
    (pos)=>{
      lat = pos.coords.latitude;
      lng = pos.coords.longitude;

      const acc = pos.coords.accuracy;

      // لو الخريطة/المؤشر موجودين
      if(map){
        map.setView([lat,lng],16);
      }
      if(marker){
        marker.setLatLng([lat,lng]);
      }

      document.getElementById("locationStatus").textContent="✔️ تم تحديد موقعك تلقائيًا — يمكنك تعديل الدبوس إذا لزم";
      setAccuracyUI(acc);

      saveDraft();
      updateSubmitState();
    },
    (err)=>{
      console.warn("Geolocation error:", err && err.message ? err.message : err);
      document.getElementById("locationStatus").textContent="⚠️ لم نتمكن من تحديد موقعك، يرجى تحديده يدويًا";
      setAccuracyUI(undefined);
    },
    {
      enableHighAccuracy:true,
      timeout:10000,
      maximumAge:0
    }
  );
}
/* ======= نهاية الإضافة ======= */

function confirmLocation(){
  const p=marker.getLatLng();
  lat=p.lat; lng=p.lng;
  document.getElementById("locationStatus").textContent="✔️ تم تحديد موقع الاستلام بدقة";
  document.getElementById("mapModal").style.display="none";
  saveDraft();         // 🔒 حفظ الموقع
  updateSubmitState(); // ✅ تفعيل زر الإرسال إذا اكتملت البيانات
}

/* =========================================================
   ✅ تحسين بعد الإرسال: عرض رقم الطلب + أزرار (بدون حذف الأساسي)
   ========================================================= */
const AUTO_REDIRECT_AFTER_SUCCESS = false; // ← لو تبغى ترجعه "true" يشتغل التحويل التلقائي
let LAST_REQUEST_ID = "";

function openSuccessModal(requestId){
  LAST_REQUEST_ID = String(requestId || "").trim() || "";
  document.getElementById("sRequestId").textContent = LAST_REQUEST_ID || "غير متاح";
  document.getElementById("successModal").style.display = "flex";
}
function closeSuccess(){
  document.getElementById("successModal").style.display = "none";
}
async function copyRequestId(){
  if(!LAST_REQUEST_ID){ showToast("رقم الطلب غير متاح"); return; }
  try{
    if(navigator.clipboard && window.isSecureContext){
      await navigator.clipboard.writeText(LAST_REQUEST_ID);
    }else{
      const ta = document.createElement("textarea");
      ta.value = LAST_REQUEST_ID;
      ta.style.position="fixed";
      ta.style.opacity="0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    showToast("تم نسخ رقم الطلب ✅");
  }catch(e){
    console.error(e);
    showToast("تعذر النسخ — انسخ يدويًا");
  }
}
function printRequestId(){
  if(!LAST_REQUEST_ID){ alert("رقم الطلب غير متاح للطباعة"); return; }
  const w = window.open("", "_blank", "width=520,height=420");
  if(!w){ alert("المتصفح منع فتح نافذة الطباعة"); return; }
  w.document.write(`
    <html lang="ar" dir="rtl">
    <head>
      <meta charset="utf-8" />
      <title>طباعة رقم الطلب</title>
      <style>
        body{font-family:Tajawal,Arial;padding:24px; background:#fff; color:#111}
        .box{border:1px solid #ddd;border-radius:14px;padding:18px}
        h2{margin:0 0 10px}
        .id{direction:ltr;text-align:left;font-size:20px;font-weight:900;padding:12px;border-radius:12px;background:#f7f7fb;border:1px dashed #b88fcf}
        .muted{color:#555;font-size:13px;line-height:1.7;margin-top:10px}
        button{margin-top:14px;padding:10px 14px;border:0;border-radius:12px;background:#7a5ea8;color:#fff;font-weight:800;cursor:pointer}
      </style>
    </head>
    <body>
      <div class="box">
        <h2>رقم طلب التبرع</h2>
        <div class="id">${String(LAST_REQUEST_ID).replace(/</g,"&lt;")}</div>
        <div class="muted">احتفظ برقم الطلب للمتابعة عند الحاجة.</div>
        <button onclick="window.print()">🖨️ طباعة</button>
      </div>
    </body>
    </html>
  `);
  w.document.close();
}
function goToRafahSite(){
  window.open("https://rafah.org.sa", "_blank");
}

function tryClosePage(){
  // ✅ تأكيد المستخدم
  const ok = confirm("هل تريد إغلاق هذه الصفحة الآن؟");
  if(!ok) return;

  // محاولة إغلاق التبويب
  window.close();

  // ✅ إذا المتصفح منع الإغلاق، نظهر تنبيه أنيق للمستخدم
  setTimeout(()=>{
    // إذا ما زالت الصفحة موجودة، غالبًا لم تُغلق
    showToast("قد يمنع المتصفح إغلاق الصفحة تلقائيًا. يمكنك إغلاقها يدويًا ✨");
  }, 250);
}

function submitForm(){

  const inputs = document.querySelectorAll("#formModal input");

  const data = {
    name: inputs[0].value.trim(),
    phone: inputs[1].value.trim(),
    area: inputs[2].value.trim(),
    lat: lat,
    lng: lng,
    source: "الموقع",
    notes: ""
  };

  // ✅ تأكيد أن رقم الجوال متصل بدون مسافات
  data.phone = data.phone.replace(/\D/g,'').slice(0,10);

  // تحقق بسيط (نفس منطقك الأصلي موجود - لم يُحذف)
  if(!data.name || !data.phone || !data.area){
    validateAll();
    return;
  }

  const phoneRegex = /^05\d{8}$/;
  if(!phoneRegex.test(data.phone)){
    validateAll();
    showErr(phoneInput, errPhone, "رقم الجوال غير صحيح، يجب أن يبدأ بـ 05 ويتكون من 10 أرقام");
    return;
  }

  if(!data.lat || !data.lng){
    alert("الرجاء تحديد موقع الاستلام على الخريطة");
    return;
  }

  // رابط Web App (نفس الذي استخدمته في Postman)
  const WEB_APP_URL = "/api/donate";

  // ✅ عطّل فقط أزرار النوافذ الخاصة بالإرسال (ولا تشمل نافذة النجاح)
  const btns = document.querySelectorAll("#formModal .submit, #mapModal .submit, #confirmModal .submit");
  btns.forEach(b => b.disabled = true);

  fetch(WEB_APP_URL, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify(data)
  })
  .then(res => res.json())
  .then(res => {
    if(!res.success){
      throw new Error(res.error || "فشل الإرسال");
    }

    // ✅ استخراج رقم الطلب من رد السيرفر
    const requestId =
      res.requestId ||
      res.requestID ||
      res.id ||
      (res.data && (res.data.requestId || res.data.id)) ||
      "";

    // تنظيف الحفظ بعد نجاح الإرسال
    try{ localStorage.removeItem(STORAGE_KEY); }catch(e){}

    // ✅ بدل الاستبدال النصي القديم، نظهر نافذة نجاح أجمل (مع الاحتفاظ بكودك الأساسي)
    document.getElementById("formModal").style.display = "none";
    openSuccessModal(requestId);

    // 🎯 توجيه تلقائي بعد الإرسال (موجود لكن متحكم فيه)
    if(AUTO_REDIRECT_AFTER_SUCCESS){
      setTimeout(()=>{
        window.location.href = "https://rafah.org.sa";
      }, 2000);
    }
  })
  .catch(err => {
    alert("حدث خطأ أثناء الإرسال، الرجاء المحاولة مرة أخرى");
    console.error(err);
    btns.forEach(b => b.disabled = false);
    updateSubmitState();
  });
}

/* ===== نافذة تأكيد البيانات ===== */
function openConfirmModal(){
  // تعبئة بيانات التأكيد
  document.getElementById("cName").textContent  = nameInput.value;
  document.getElementById("cPhone").textContent = phoneInput.value;
  document.getElementById("cArea").textContent  = areaInput.value;

  document.getElementById("confirmModal").style.display = "flex";
}

function closeConfirm(){
  document.getElementById("confirmModal").style.display = "none";
}

/* الإرسال الفعلي بعد التأكيد */
function confirmSubmit(){
  closeConfirm();
  submitForm(); // نفس دالة الإرسال الأصلية بدون تغيير
}
