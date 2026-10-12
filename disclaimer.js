// disclaimer.js - MedSearch Yemen
// وحدة إخلاء المسؤولية الطبي

(function() {
  if (localStorage.getItem('disclaimerAccepted') === 'true') {
    return;
  }

  function showDisclaimer() {
    const disclaimerHTML = `
      <div id="medical-disclaimer" style="
        position:fixed; top:0; left:0; width:100%; height:100%;
        background:rgba(0,0,0,0.85); z-index:99999;
        display:flex; align-items:center; justify-content:center; padding:20px;
        direction:rtl; font-family:'Tajawal', sans-serif;
      ">
        <div style="
          background:#1a1a2e; color:#fff; max-width:500px;
          padding:25px; border-radius:16px; border:2px solid #0d7377;
          text-align:right; box-shadow: 0 10px 40px rgba(0,0,0,0.5);
        ">
          <h2 style="color:#ffcc00; margin-top:0; text-align:center;">
            ⚠️ إخلاء المسؤولية الطبي
          </h2>
          <p style="line-height:1.8; font-size:15px;">
            هذا التطبيق <strong>محرك بحث طبي</strong> يهدف إلى توفير المعلومات الطبية للأغراض <strong>التعليمية والمعلوماتية فقط</strong>.
          </p>
          <p style="line-height:1.8; font-size:15px;">
            المعلومات الموجودة فيه <strong>لا تُغني بأي حال من الأحوال عن استشارة الطبيب المختص أو الصيدلي</strong>، ولا يجب استخدامها لتشخيص أو علاج أي حالة طبية.
          </p>
          <p style="line-height:1.8; font-size:15px;">
            في حالة الطوارئ الطبية، يرجى الاتصال بالجهات المختصة فوراً.
          </p>
          <button id="disclaimer-accept-btn" style="
            background:#0d7377; color:#fff; border:none;
            padding:12px 30px; border-radius:8px; font-size:16px;
            cursor:pointer; width:100%; margin-top:15px; font-weight:bold;
            transition: background 0.3s;
          ">
            أوافق وأفهم
          </button>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', disclaimerHTML);

    const acceptBtn = document.getElementById('disclaimer-accept-btn');
    acceptBtn.addEventListener('click', function() {
      localStorage.setItem('disclaimerAccepted', 'true');
      document.getElementById('medical-disclaimer').remove();
    });

    acceptBtn.addEventListener('mouseenter', function() {
      acceptBtn.style.background = '#0a5c5f';
    });
    acceptBtn.addEventListener('mouseleave', function() {
      acceptBtn.style.background = '#0d7377';
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', showDisclaimer);
  } else {
    showDisclaimer();
  }
})();
