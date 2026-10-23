/* ==========================================================================
   Lumen Physiotherapy — interactions
   - Bilingual EN / HE with RTL flip (copy dictionary + localStorage)
   - Sticky nav, mobile menu, active-section highlighting
   - Scroll reveal (respects prefers-reduced-motion)
   - Multi-step booking widget with custom calendar (client-side only)
   - Testimonials carousel, accessible FAQ accordion
   ========================================================================== */
(function () {
  'use strict';

  var html = document.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var STORAGE_KEY = 'lumen-lang';

  /* ------------------------------------------------------------------
     1. Copy dictionary
     English static copy is harvested from the HTML itself (single source
     of truth); dynamic English strings are defined here. Hebrew is complete.
     ------------------------------------------------------------------ */
  var I18N = {
    en: {
      'meta.title': 'Lumen Physiotherapy · Haifa',
      'lang.label': 'עברית',
      'lang.aria': 'Switch to Hebrew',
      'nav.open': 'Open menu',
      'nav.close': 'Close menu',
      'book.next': 'Continue',
      'book.confirm': 'Confirm booking',
      'book.step': 'Step {n} of 3: {label}',
      'err.treatment': 'Please choose a treatment to continue.',
      'err.slot': 'Please choose a date and a time.',
      'err.name': 'Please enter your full name.',
      'err.phone': 'Please enter a valid Israeli mobile number (e.g. 050-123-4567).',
      'err.email': "That email address doesn't look quite right.",
      'cal.closed': 'closed',
      'cal.unavailable': 'not available',
      'slots.empty': 'Choose a date to see available times.',
      'slots.none': 'No free times on this day — please try another date.',
      'slot.taken': '{t}, already booked',
      'done.lead': "Thanks, {name}. Your spot is reserved and we'll text a confirmation to {phone}.",
      'sum.treatment': 'Treatment',
      'sum.when': 'When',
      'sum.therapist': 'Therapist',
      'sum.hmo': 'Health fund',
      'sum.where': 'Where',
      'sum.whenFmt': '{date} at {time}',
      'rev.slide': '{n} of {total}',
      'rev.goto': 'Show testimonial {n}',
      'booked': 'Booking confirmed.'
    },
    he: {
      'meta.title': 'לומן פיזיותרפיה · חיפה',
      'skip': 'דילוג לתוכן',
      'brand.name': 'לומן',
      'brand.tag': 'פיזיותרפיה',
      'lang.label': 'English',
      'lang.aria': 'מעבר לאנגלית',
      'nav.label': 'ניווט ראשי',
      'nav.treatments': 'טיפולים',
      'nav.process': 'איך זה עובד',
      'nav.team': 'הצוות',
      'nav.reviews': 'המלצות',
      'nav.faq': 'שאלות נפוצות',
      'nav.contact': 'צור קשר',
      'nav.open': 'פתיחת תפריט',
      'nav.close': 'סגירת תפריט',
      'cta.book': 'קביעת תור',
      'cta.bookShort': 'לקביעת תור',
      'cta.explore': 'לכל הטיפולים',

      'hero.eyebrow': 'פיזיותרפיה ושיקום ספורט · חיפה',
      'hero.title': 'לנוע בלי כאב.<br><em>לחיות בלי גבולות.</em>',
      'hero.lead': 'פיזיותרפיה מבוססת מחקר בקליניקה שקטה ומוארת על הכרמל. טיפולים אישיים של 45 דקות, תוכנית שנבנית סביב החיים שלכם, וצוות שבאמת מקשיב.',
      'hero.alt': 'פיזיותרפיסטית מדריכה מטופל בתרגיל שיקום לברך בקליניקה מוארת',
      'hero.nextLabel': 'התור הפנוי הבא',
      'hero.nextValue': 'מחר · 08:30',
      'hero.years': 'שנים שאנחנו עוזרים לחיפה לזוז',
      'trust.label': 'למה מטופלים סומכים עלינו',
      'trust.rating': 'מתוך יותר מ-380 ביקורות בגוגל',
      'trust.hmo': 'כל קופות החולים והביטוחים הפרטיים',
      'trust.week': 'תורים פנויים כבר השבוע',

      'partners.title': 'מוכרים בכל קופות החולים',
      'partners.clalit': 'כללית',
      'partners.maccabi': 'מכבי',
      'partners.meuhedet': 'מאוחדת',
      'partners.leumit': 'לאומית',
      'partners.private': '+ ביטוחים פרטיים',

      'treat.eyebrow': 'במה אנחנו מטפלים',
      'treat.title': 'ליווי בכל שלב של ההחלמה',
      'treat.lead': 'מהכאב הראשון ועד חזרה מלאה לספורט — כל תוכנית מתחילה באבחון יסודי ומתעדכנת ככל שאתם מתקדמים.',
      't.sports.title': 'פציעות ספורט',
      't.sports.text': 'נקעים, כאבי גידים, קרעים ברצועה הצולבת ופציעות ריצה — שיקום שמחזיר אתכם למגרש חזקים יותר משהייתם.',
      't.sports.meta': '45 דק׳ · טיפול אישי',
      't.back.title': 'כאבי גב וצוואר',
      't.back.text': 'טיפול ידני, שיפור דפוסי תנועה וארגונומיה מעשית לימים ארוכים מול המחשב או מאחורי ההגה.',
      't.back.meta': '45 דק׳ · טיפול אישי',
      't.surgery.title': 'שיקום אחרי ניתוח',
      't.surgery.text': 'החלמה מובנית אחרי ניתוחי ברך, ירך, כתף ועמוד שדרה, בתיאום צמוד עם המנתח שלכם.',
      't.surgery.meta': '45–60 דק׳ · טיפול אישי',
      't.pelvic.title': 'רצפת אגן',
      't.pelvic.text': 'טיפול מקצועי ודיסקרטי בהיריון, אחרי לידה, בבעיות שליטה ובכאבי אגן — בחדר פרטי ושקט.',
      't.pelvic.meta': '50 דק׳ · חדר פרטי',
      't.hydro.title': 'הידרותרפיה',
      't.hydro.text': 'תרגול עדין בבריכה הטיפולית שלנו, במים של 34 מעלות — מצוין לדלקות מפרקים, לשלבים הראשונים אחרי ניתוח ולכאב כרוני.',
      't.hydro.meta': '40 דק׳ · בריכה מחוממת',
      't.kids.title': 'פיזיותרפיה לילדים',
      't.kids.text': 'מפגשים משחקיים בשיתוף ההורים, להתפתחות מוטורית, יציבה, קואורדינציה ופציעות ספורט.',
      't.kids.meta': '40 דק׳ · גילאי 2–16',

      'proc.eyebrow': 'איך זה עובד',
      'proc.title': 'שלושה צעדים רגועים בחזרה לתנועה',
      'proc.1.title': 'אבחון מעמיק',
      'proc.1.text': 'פגישה ראשונה של 60 דקות: ההיסטוריה שלכם, המטרות שלכם וניתוח תנועה מלא. תצאו כשאתם מבינים בדיוק מה קורה.',
      'proc.2.title': 'תוכנית אישית',
      'proc.2.text': 'טיפול ידני לצד תוכנית תרגול קצרה לבית שנשלחת לטלפון, עם סרטוני הדגמה שאפשר לתרגל איתם בכל מקום.',
      'proc.3.title': 'מחלימים וחוזרים לשגרה',
      'proc.3.text': 'אנחנו מודדים את ההתקדמות בכל מפגש ומרווחים את הטיפולים ככל שאתם מתחזקים — המטרה היא עצמאות, לא תלות.',

      'team.eyebrow': 'הצוות שלנו',
      'team.title': 'מומחים שמקדישים לכם זמן',
      'team.lead': 'כל המטפלים בלומן מחזיקים ברישיון משרד הבריאות ובהתמחות קלינית מתקדמת.',
      'team.1.name': 'ד״ר מאיה לוין',
      'team.1.role': 'מנהלת הקליניקה · ספורט ואורתופדיה',
      'team.1.bio': 'דוקטורט במדעי השיקום, לשעבר הפיזיותרפיסטית של מחלקת הנוער של מכבי חיפה. ברך עקשנית? בדיוק בשבילה.',
      'team.1.alt': 'דיוקן של ד״ר מאיה לוין',
      'team.2.name': 'יואב ברק',
      'team.2.role': 'עמוד שדרה וטיפול ידני',
      'team.2.bio': 'מוסמך בשיטות מקנזי ומייטלנד. עוזר לעובדי משרד ולנהגים להיפרד סוף־סוף מכאבי גב כרוניים.',
      'team.2.alt': 'דיוקן של יואב ברק',
      'team.3.name': 'טיגיסט אלמו',
      'team.3.role': 'רצפת אגן וילדים',
      'team.3.bio': 'תואר שני בפיזיותרפיה לבריאות האישה. סבלנית, חמה ויודעת להפוך כל תרגיל למשחק.',
      'team.3.alt': 'דיוקן של טיגיסט אלמו',

      'book.eyebrow': 'קביעת תור אונליין',
      'book.title': 'קובעים תור בפחות מדקה',
      'book.lead': 'בוחרים טיפול ושעה שנוחה לכם, ואנחנו נאשר ב־SMS. לטיפול פרטי לא צריך הפניה.',
      'book.perk1': 'ביטול ללא עלות עד 24 שעות מראש',
      'book.perk2': 'תזכורת ב־SMS יום לפני הטיפול',
      'book.perk3': 'יש לכם הפניה מהקופה? הביאו אותה איתכם',
      'book.progress': 'שלבי ההזמנה',
      'book.s1': 'טיפול',
      'book.s2': 'תאריך ושעה',
      'book.s3': 'פרטים',
      'book.s1.title': 'איזה טיפול תרצו לקבוע?',
      'book.s2.title': 'בחרו תאריך ושעה',
      'book.s3.title': 'איך נוכל ליצור איתכם קשר?',
      'book.back': 'חזרה',
      'book.next': 'המשך',
      'book.confirm': 'אישור התור',
      'book.step': 'שלב {n} מתוך 3: {label}',
      'cal.prev': 'החודש הקודם',
      'cal.next': 'החודש הבא',
      'cal.note': 'סגור בשבת · בימי שישי עד 13:00',
      'cal.closed': 'סגור',
      'cal.unavailable': 'לא זמין',
      'slots.title': 'שעות פנויות',
      'slots.empty': 'בחרו תאריך כדי לראות את השעות הפנויות.',
      'slots.none': 'אין שעות פנויות ביום הזה — נסו תאריך אחר.',
      'slot.taken': '{t}, תפוס',
      'f.name': 'שם מלא',
      'f.phone': 'טלפון נייד',
      'f.email': 'אימייל',
      'f.optional': '(לא חובה)',
      'f.hmo': 'קופת חולים',
      'f.hmoPrivate': 'פרטי / אחר',
      'f.notes': 'משהו שחשוב שנדע?',
      'f.notesPh': 'למשל: כאב בברך ימין אחרי ריצה, כבר שבועיים',
      'err.treatment': 'בחרו טיפול כדי להמשיך.',
      'err.slot': 'בחרו תאריך ושעה.',
      'err.name': 'נא להזין שם מלא.',
      'err.phone': 'נא להזין מספר נייד תקין (למשל 050-123-4567).',
      'err.email': 'כתובת האימייל לא נראית תקינה.',
      'done.title': 'התור נקבע!',
      'done.lead': 'תודה, {name}. שריינו לכם את התור ונשלח הודעת אישור למספר {phone}.',
      'done.note': 'זהו אתר הדגמה — שום מידע לא נשלח לשום מקום.',
      'done.again': 'לקביעת תור נוסף',
      'sum.treatment': 'טיפול',
      'sum.when': 'מתי',
      'sum.therapist': 'מטפל/ת',
      'sum.hmo': 'קופת חולים',
      'sum.where': 'איפה',
      'sum.whenFmt': '{date} בשעה {time}',
      'booked': 'התור אושר.',

      'rev.eyebrow': 'סיפורי מטופלים',
      'rev.title': 'מילים של אנשים שחזרו לזוז',
      'rev.label': 'המלצות מטופלים',
      'rev.prev': 'ההמלצה הקודמת',
      'rev.next': 'ההמלצה הבאה',
      'rev.slide': '{n} מתוך {total}',
      'rev.goto': 'הצגת המלצה {n}',

      'faq.eyebrow': 'טוב לדעת',
      'faq.title': 'שאלות נפוצות',
      'faq.lead': 'לא מצאתם תשובה? התקשרו או שלחו הודעה בוואטסאפ — אדם אמיתי יחזור אליכם תוך שעה.',
      'faq.1.q': 'צריך הפניה מרופא?',
      'faq.1.a': 'לטיפול פרטי — לא, אפשר לקבוע ישירות. אם תרצו שהקופה תכסה את הטיפול, הביאו לפגישה הראשונה הפניה מרופא המשפחה או מאורתופד.',
      'faq.2.q': 'הטיפול מכוסה על ידי קופת החולים?',
      'faq.2.a': 'אנחנו עובדים עם הביטוחים המשלימים של כללית, מכבי, מאוחדת ולאומית, וגם עם רוב חברות הביטוח הפרטיות. עם הפניה בתוקף משלמים רק את ההשתתפות העצמית הרגילה של הקופה.',
      'faq.3.q': 'מה כדאי ללבוש לטיפול?',
      'faq.3.a': 'בגדים נוחים שמאפשרים לראות ולהזיז את האזור המטופל — מכנסיים קצרים לטיפול בברך, גופייה לטיפול בכתף. להידרותרפיה הביאו בגד ים וכפכפים; את המגבות אנחנו מספקים.',
      'faq.4.q': 'כמה טיפולים אצטרך?',
      'faq.4.a': 'זה תלוי בבעיה, אבל רוב האנשים מרגישים שינוי ברור תוך 3–4 מפגשים. אחרי האבחון נותנים לכם הערכה כנה — ולעולם לא נקבע יותר טיפולים ממה שצריך.',
      'faq.5.q': 'יש חניה? המקום נגיש?',
      'faq.5.a': 'כן. יש חניה חינם למטופלים מתחת לבניין, כניסה ללא מדרגות מהרחוב, מעלית לכל הקומות וחדר הלבשה נגיש ליד הבריכה.',

      'contact.eyebrow': 'בואו לבקר',
      'contact.title': 'פינה שקטה על הכרמל',
      'contact.addrLabel': 'כתובת',
      'contact.addr': 'דרך הים 112, קומה 3, חיפה',
      'contact.phoneLabel': 'טלפון ווואטסאפ',
      'contact.emailLabel': 'אימייל',
      'contact.mapAlt': 'מפה מאוירת שמראה את הקליניקה בדרך הים, על מורדות הכרמל',
      'contact.sea': 'הים התיכון',
      'contact.carmel': 'הכרמל',
      'contact.directions': 'הוראות הגעה',
      'hours.title': 'שעות פעילות',
      'hours.week': 'ראשון – חמישי',
      'hours.fri': 'שישי',
      'hours.sat': 'שבת',
      'hours.closed': 'סגור',
      'ctaBand.title': 'מוכנים להרגיש שוב כמו עצמכם?',

      'footer.top': 'לומן פיזיותרפיה — חזרה לראש העמוד',
      'footer.blurb': 'פיזיותרפיה ושיקום ספורט מודרניים על הכרמל, בחיפה.',
      'footer.navLabel': 'ניווט תחתון',
      'footer.rights': 'לומן פיזיותרפיה. קליניקה בדיונית.',
      'footer.credit': 'אתר לדוגמה מאת נמרוד שי'
    }
  };

  var TESTIMONIALS = [
    {
      initials: { en: 'NR', he: 'נ' },
      text: {
        en: 'Eight months after my ACL surgery I ran the Haifa half-marathon. Maya planned every phase with me and somehow made even the hard days feel doable.',
        he: 'שמונה חודשים אחרי ניתוח הרצועה הצולבת רצתי את חצי המרתון של חיפה. מאיה תכננה איתי כל שלב, ואיכשהו גרמה גם לימים הקשים להרגיש אפשריים.'
      },
      name: { en: 'Noa R.', he: 'נועה ר.' },
      meta: { en: '34 · ACL reconstruction', he: '34 · שחזור רצועה צולבת' }
    },
    {
      initials: { en: 'AM', he: 'א' },
      text: {
        en: "After years of back pain I'd almost given up. Yoav explained what was actually going on, gave me ten minutes of exercises a day — and I'm back in my garden.",
        he: 'אחרי שנים של כאבי גב כמעט התייאשתי. יואב הסביר לי מה בעצם קורה, נתן לי עשר דקות של תרגילים ביום — ואני שוב עובד בגינה.'
      },
      name: { en: 'Avi M.', he: 'אבי מ.' },
      meta: { en: '58 · Chronic lower-back pain', he: '58 · כאבי גב תחתון כרוניים' }
    },
    {
      initials: { en: 'DK', he: 'ד' },
      text: {
        en: 'Itai actually asks when his next session with Tigist is. His balance and confidence have completely changed in three months.',
        he: 'איתי ממש שואל מתי הטיפול הבא אצל טיגיסט. שיווי המשקל והביטחון שלו השתנו לגמרי בתוך שלושה חודשים.'
      },
      name: { en: 'Dana K.', he: 'דנה ק.' },
      meta: { en: "Itai's mum (age 6)", he: 'אמא של איתי (בן 6)' }
    },
    {
      initials: { en: 'SH', he: 'ס' },
      text: {
        en: 'Professional, warm and always on time. The warm pool was a game-changer in the first weeks after my shoulder surgery.',
        he: 'מקצועיים, חמים ותמיד בזמן. הבריכה הטיפולית שינתה לי את התמונה בשבועות הראשונים אחרי ניתוח הכתף.'
      },
      name: { en: 'Samir H.', he: 'סמיר ח.' },
      meta: { en: '41 · Shoulder surgery', he: '41 · ניתוח כתף' }
    }
  ];

  /* Booking treatments: map to existing card copy keys + assigned therapist */
  var TREATMENTS = [
    { id: 'sports', therapist: 1 },
    { id: 'back', therapist: 2 },
    { id: 'surgery', therapist: 1 },
    { id: 'pelvic', therapist: 3 },
    { id: 'hydro', therapist: 2 },
    { id: 'kids', therapist: 3 }
  ];

  var lang = 'en';

  function t(key, vars) {
    var str = (I18N[lang] && I18N[lang][key] != null) ? I18N[lang][key] : I18N.en[key];
    if (str == null) return key;
    if (vars) {
      Object.keys(vars).forEach(function (k) { str = str.split('{' + k + '}').join(vars[k]); });
    }
    return str;
  }
  function locale() { return lang === 'he' ? 'he-IL' : 'en-GB'; }
  function escapeHTML(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $all(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }

  /* Harvest English copy from the markup */
  function harvestEnglish() {
    $all('[data-i18n]').forEach(function (el) {
      var key = el.getAttribute('data-i18n');
      if (I18N.en[key] == null) I18N.en[key] = el.innerHTML.trim();
    });
    $all('[data-i18n-attr]').forEach(function (el) {
      parseAttrSpec(el).forEach(function (pair) {
        if (I18N.en[pair[1]] == null) I18N.en[pair[1]] = el.getAttribute(pair[0]) || '';
      });
    });
  }
  function parseAttrSpec(el) {
    return el.getAttribute('data-i18n-attr').split(';').map(function (p) { return p.trim().split('|'); });
  }

  function applyStaticCopy() {
    $all('[data-i18n]').forEach(function (el) {
      var val = t(el.getAttribute('data-i18n'));
      if (/[<&]/.test(val)) el.innerHTML = val; else el.textContent = val;
    });
    $all('[data-i18n-attr]').forEach(function (el) {
      parseAttrSpec(el).forEach(function (pair) { el.setAttribute(pair[0], t(pair[1])); });
    });
    var toggleLabel = $('#lang-toggle [data-i18n="lang.label"]');
    if (toggleLabel) toggleLabel.setAttribute('lang', lang === 'en' ? 'he' : 'en');
    document.title = t('meta.title');
    var burger = $('#burger');
    if (burger) burger.setAttribute('aria-label', t(burger.getAttribute('aria-expanded') === 'true' ? 'nav.close' : 'nav.open'));
  }

  function setLanguage(next, opts) {
    opts = opts || {};
    lang = next === 'he' ? 'he' : 'en';
    html.lang = lang;
    html.dir = lang === 'he' ? 'rtl' : 'ltr';
    applyStaticCopy();
    // dynamic components
    renderTreatmentChoices();
    renderCalendar();
    renderSlots();
    updateNextLabel();
    if (booking.step === 4) renderSummary();
    renderCarousel();
    if (!opts.initial) {
      try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) { /* storage unavailable */ }
    }
  }

  function initLanguage() {
    harvestEnglish();
    var saved = null;
    // A ?lang=he or ?lang=en link wins over the saved choice.
    var linked = (location.search.match(/[?&]lang=(en|he)\b/) || [])[1];
    try { saved = linked || localStorage.getItem(STORAGE_KEY); } catch (e) { saved = linked || null; }
    setLanguage(saved === 'he' ? 'he' : 'en', { initial: true });

    var toggle = $('#lang-toggle');
    toggle.addEventListener('click', function () {
      var next = lang === 'en' ? 'he' : 'en';
      if (reduceMotion.matches) { setLanguage(next); return; }
      document.body.classList.add('is-switching');
      setTimeout(function () {
        setLanguage(next);
        requestAnimationFrame(function () { document.body.classList.remove('is-switching'); });
      }, 220);
    });
  }

  /* ------------------------------------------------------------------
     2. Header: sticky state, mobile menu, active section
     ------------------------------------------------------------------ */
  function initNav() {
    var header = $('.site-header');
    var burger = $('#burger');
    var menu = $('#nav-menu');

    function onScroll() { header.classList.toggle('is-scrolled', window.scrollY > 8); }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    function setMenu(open) {
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', t(open ? 'nav.close' : 'nav.open'));
      menu.classList.toggle('is-open', open);
      document.body.classList.toggle('menu-open', open);
      if (open) { var first = menu.querySelector('a'); if (first) first.focus(); }
    }
    burger.addEventListener('click', function () { setMenu(burger.getAttribute('aria-expanded') !== 'true'); });
    menu.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.classList.contains('is-open')) { setMenu(false); burger.focus(); }
    });
    window.matchMedia('(min-width: 961px)').addEventListener('change', function (mq) { if (mq.matches) setMenu(false); });

    // Active section highlighting
    if (!('IntersectionObserver' in window)) return;
    var links = $all('.nav__links a');
    var map = {};
    links.forEach(function (a) { map[a.getAttribute('href').slice(1)] = a; });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting && map[en.target.id]) {
          links.forEach(function (a) { a.classList.remove('is-current'); a.removeAttribute('aria-current'); });
          map[en.target.id].classList.add('is-current');
          map[en.target.id].setAttribute('aria-current', 'true');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    Object.keys(map).forEach(function (id) { var s = document.getElementById(id); if (s) io.observe(s); });
  }

  /* ------------------------------------------------------------------
     3. Scroll reveal
     ------------------------------------------------------------------ */
  function initReveal() {
    var items = $all('.reveal');
    // Stagger siblings in the same parent
    items.forEach(function (el) {
      var sibs = $all(':scope > .reveal', el.parentElement);
      var i = sibs.indexOf(el);
      if (i > 0) el.style.setProperty('--d', Math.min(i * 0.09, 0.45) + 's');
    });
    if (reduceMotion.matches || !('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-visible'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    items.forEach(function (el) { io.observe(el); });
  }

  /* ------------------------------------------------------------------
     4. Booking widget
     ------------------------------------------------------------------ */
  var booking = {
    step: 1,
    treatment: null,
    date: null,     // Date (local midnight)
    slot: null,     // "HH:MM"
    viewYear: 0,
    viewMonth: 0,
    details: null
  };
  var today = new Date(); today.setHours(0, 0, 0, 0);
  var maxDate = new Date(today); maxDate.setDate(maxDate.getDate() + 75);

  var WEEKDAY_SLOTS = ['08:00', '09:00', '10:00', '11:30', '12:30', '14:00', '15:00', '16:30', '17:30', '18:30'];
  var FRIDAY_SLOTS = ['08:00', '09:00', '10:00', '11:00', '12:00'];

  function sameDay(a, b) { return a && b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate(); }
  function isoDate(d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
  function isClosed(d) { return d.getDay() === 6; }
  function isBookable(d) { return d >= today && d <= maxDate && !isClosed(d); }

  /* Deterministic "already booked" slots so the demo feels real */
  function isTaken(d, i) {
    var seed = d.getFullYear() * 372 + d.getMonth() * 31 + d.getDate();
    return ((seed * 7 + i * 13) % 11) < 3;
  }
  function slotsFor(d) {
    var list = d.getDay() === 5 ? FRIDAY_SLOTS : WEEKDAY_SLOTS;
    var now = new Date();
    return list.map(function (time, i) {
      var parts = time.split(':');
      var past = sameDay(d, now) && (now.getHours() * 60 + now.getMinutes() + 60) > (+parts[0] * 60 + +parts[1]);
      return { time: time, taken: past || isTaken(d, i) };
    });
  }

  function treatmentIcon(id) {
    var idx = TREATMENTS.findIndex(function (x) { return x.id === id; });
    var svg = $all('.treat-card__icon svg')[idx];
    return svg ? svg.outerHTML : '';
  }

  function renderTreatmentChoices() {
    var wrap = $('#treatment-choices');
    if (!wrap) return;
    wrap.innerHTML = TREATMENTS.map(function (tr) {
      var checked = booking.treatment === tr.id ? ' checked' : '';
      return '<div class="choice">' +
        '<input type="radio" name="treatment" id="tr-' + tr.id + '" value="' + tr.id + '"' + checked + '>' +
        '<label for="tr-' + tr.id + '">' +
          '<span class="choice__icon" aria-hidden="true">' + treatmentIcon(tr.id) + '</span>' +
          '<span class="choice__text"><span class="choice__name">' + t('t.' + tr.id + '.title') + '</span>' +
          '<span class="choice__meta">' + t('t.' + tr.id + '.meta') + '</span></span>' +
        '</label></div>';
    }).join('');
  }

  function renderCalendar() {
    var grid = $('#cal-grid');
    if (!grid) return;
    var y = booking.viewYear, m = booking.viewMonth;
    var first = new Date(y, m, 1);
    var daysInMonth = new Date(y, m + 1, 0).getDate();

    $('#cal-month').textContent = new Intl.DateTimeFormat(locale(), { month: 'long', year: 'numeric' }).format(first);

    // Week starts on Sunday (Israeli convention) in both languages
    var dowFmt = new Intl.DateTimeFormat(locale(), { weekday: lang === 'he' ? 'narrow' : 'short' });
    var dow = '';
    for (var i = 0; i < 7; i++) dow += '<span>' + dowFmt.format(new Date(2024, 0, 7 + i)) + '</span>';
    $('#cal-dow').innerHTML = dow;

    var fullFmt = new Intl.DateTimeFormat(locale(), { weekday: 'long', day: 'numeric', month: 'long' });
    var cells = '';
    for (var b = 0; b < first.getDay(); b++) cells += '<span class="cal-day cal-day--blank" aria-hidden="true"></span>';

    var focusTarget = null;
    for (var d = 1; d <= daysInMonth; d++) {
      var date = new Date(y, m, d);
      var ok = isBookable(date);
      var label = fullFmt.format(date) + (ok ? '' : ', ' + t(isClosed(date) && date >= today ? 'cal.closed' : 'cal.unavailable'));
      var selected = sameDay(date, booking.date);
      cells += '<button type="button" class="cal-day' + (sameDay(date, today) ? ' is-today' : '') + '"' +
        ' data-date="' + isoDate(date) + '"' +
        ' aria-label="' + escapeHTML(label) + '"' +
        ' aria-pressed="' + selected + '"' +
        (sameDay(date, today) ? ' aria-current="date"' : '') +
        (ok ? '' : ' disabled') + ' tabindex="-1">' + d + '</button>';
      if (ok && (selected || (!focusTarget && !booking.date))) focusTarget = focusTarget || isoDate(date);
      if (selected) focusTarget = isoDate(date);
    }
    grid.innerHTML = cells;

    // Roving tabindex: exactly one focusable day
    var tabbable = (focusTarget && grid.querySelector('[data-date="' + focusTarget + '"]')) || grid.querySelector('.cal-day:not(:disabled):not(.cal-day--blank)');
    if (tabbable) tabbable.tabIndex = 0;

    $('#cal-prev').disabled = (y === today.getFullYear() && m === today.getMonth());
    $('#cal-next').disabled = new Date(y, m + 1, 1) > maxDate;
  }

  function renderSlots() {
    var wrap = $('#slots');
    if (!wrap) return;
    var title = $('#slots-title');
    if (!booking.date) {
      title.textContent = t('slots.title');
      wrap.innerHTML = '<p class="slots__empty">' + t('slots.empty') + '</p>';
      return;
    }
    var dateLabel = new Intl.DateTimeFormat(locale(), { weekday: 'long', day: 'numeric', month: 'long' }).format(booking.date);
    title.innerHTML = escapeHTML(t('slots.title')) + '<span class="slots__date">' + escapeHTML(dateLabel) + '</span>';
    var slots = slotsFor(booking.date);
    if (slots.every(function (s) { return s.taken; })) {
      wrap.innerHTML = '<p class="slots__empty">' + t('slots.none') + '</p>';
      return;
    }
    wrap.innerHTML = slots.map(function (s, i) {
      return '<button type="button" class="slot" data-time="' + s.time + '" dir="ltr"' +
        ' aria-pressed="' + (booking.slot === s.time) + '"' +
        (s.taken ? ' disabled aria-label="' + escapeHTML(t('slot.taken', { t: s.time })) + '"' : '') +
        ' style="animation-delay:' + (i * 0.025) + 's">' + s.time + '</button>';
    }).join('');
  }

  function moveCalendarFocus(fromIso, delta) {
    var p = fromIso.split('-');
    var d = new Date(+p[0], +p[1] - 1, +p[2]);
    var step = delta > 0 ? 1 : -1;
    var target = new Date(d); target.setDate(target.getDate() + delta);
    // Skip non-bookable days in the direction of travel
    var guard = 0;
    while (!isBookable(target) && guard < 90) {
      if (target < today || target > maxDate) return;
      target.setDate(target.getDate() + (Math.abs(delta) === 7 ? delta : step));
      guard++;
    }
    if (!isBookable(target)) return;
    if (target.getMonth() !== booking.viewMonth || target.getFullYear() !== booking.viewYear) {
      booking.viewYear = target.getFullYear(); booking.viewMonth = target.getMonth();
      renderCalendar();
    }
    var grid = $('#cal-grid');
    $all('.cal-day', grid).forEach(function (b) { b.tabIndex = -1; });
    var btn = grid.querySelector('[data-date="' + isoDate(target) + '"]');
    if (btn) { btn.tabIndex = 0; btn.focus(); }
  }

  function showError(id, msg) {
    var el = document.getElementById(id);
    if (el) el.textContent = msg || '';
  }

  function updateStepper() {
    $all('.stepper__item').forEach(function (li) {
      var n = +li.getAttribute('data-step-ind');
      li.classList.toggle('is-active', n === booking.step);
      li.classList.toggle('is-done', n < booking.step);
      if (n === booking.step) li.setAttribute('aria-current', 'step'); else li.removeAttribute('aria-current');
    });
    $('.stepper').classList.toggle('is-complete', booking.step === 4);
  }

  function updateNextLabel() {
    var lbl = $('#btn-next-label');
    if (lbl) lbl.textContent = t(booking.step === 3 ? 'book.confirm' : 'book.next');
  }

  function goToStep(n) {
    booking.step = n;
    $all('.bstep').forEach(function (fs) { fs.hidden = +fs.getAttribute('data-step') !== n; });
    $('#btn-back').hidden = n === 1 || n === 4;
    $('#booking-nav').hidden = n === 4;
    updateStepper();
    updateNextLabel();

    var active = $('.bstep[data-step="' + n + '"]');
    var heading = active.querySelector('.bstep__title');
    if (heading) heading.focus({ preventScroll: true });
    var card = $('#booking-widget');
    var rect = card.getBoundingClientRect();
    if (rect.top < 0 || rect.top > window.innerHeight * 0.6) {
      card.scrollIntoView({ behavior: reduceMotion.matches ? 'auto' : 'smooth', block: 'start' });
    }
    if (n < 4) {
      var labels = { 1: t('book.s1'), 2: t('book.s2'), 3: t('book.s3') };
      $('#booking-status').textContent = t('book.step', { n: n, label: labels[n] });
    } else {
      $('#booking-status').textContent = t('booked');
    }
  }

  function validateDetails() {
    var name = $('#f-name'), phone = $('#f-phone'), email = $('#f-email');
    var firstBad = null;
    function mark(input, errId, bad, msgKey) {
      input.setAttribute('aria-invalid', String(bad));
      showError(errId, bad ? t(msgKey) : '');
      if (bad && !firstBad) firstBad = input;
    }
    mark(name, 'err-name', name.value.trim().length < 2, 'err.name');
    var digits = phone.value.replace(/\D/g, '');
    if (digits.indexOf('972') === 0) digits = '0' + digits.slice(3);
    mark(phone, 'err-phone', !/^05\d{8}$/.test(digits), 'err.phone');
    var ev = email.value.trim();
    mark(email, 'err-email', ev !== '' && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(ev), 'err.email');
    if (firstBad) firstBad.focus();
    return !firstBad;
  }

  function renderSummary() {
    var d = booking.details;
    if (!d) return;
    var tr = TREATMENTS.find(function (x) { return x.id === booking.treatment; });
    var dateStr = new Intl.DateTimeFormat(locale(), { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(booking.date);
    var hmoKey = d.hmo === 'private' ? 'f.hmoPrivate' : 'partners.' + d.hmo;
    var rows = [
      [t('sum.treatment'), t('t.' + tr.id + '.title')],
      [t('sum.when'), t('sum.whenFmt', { date: dateStr, time: '<span dir="ltr">' + booking.slot + '</span>' })],
      [t('sum.therapist'), t('team.' + tr.therapist + '.name')],
      [t('sum.hmo'), t(hmoKey)],
      [t('sum.where'), t('contact.addr')]
    ];
    $('#summary').innerHTML = rows.map(function (r) { return '<div><dt>' + r[0] + '</dt><dd>' + r[1] + '</dd></div>'; }).join('');
    $('#done-lead').innerHTML = t('done.lead', {
      name: escapeHTML(d.name.split(' ')[0]),
      phone: '<span dir="ltr">' + escapeHTML(d.phone) + '</span>'
    });
  }

  function initBooking() {
    var form = $('#booking-form');
    if (!form) return;
    booking.viewYear = today.getFullYear();
    booking.viewMonth = today.getMonth();
    // If today is past bookable range of this month (e.g., last day is Saturday), still fine.

    form.addEventListener('change', function (e) {
      if (e.target.name === 'treatment') { booking.treatment = e.target.value; showError('err-treatment', ''); }
    });

    $('#cal-prev').addEventListener('click', function () {
      booking.viewMonth--; if (booking.viewMonth < 0) { booking.viewMonth = 11; booking.viewYear--; }
      renderCalendar();
    });
    $('#cal-next').addEventListener('click', function () {
      booking.viewMonth++; if (booking.viewMonth > 11) { booking.viewMonth = 0; booking.viewYear++; }
      renderCalendar();
    });

    var grid = $('#cal-grid');
    grid.addEventListener('click', function (e) {
      var btn = e.target.closest('.cal-day');
      if (!btn || btn.disabled || !btn.dataset.date) return;
      var p = btn.dataset.date.split('-');
      booking.date = new Date(+p[0], +p[1] - 1, +p[2]);
      booking.slot = null;
      showError('err-slot', '');
      renderCalendar();
      renderSlots();
      var again = grid.querySelector('[data-date="' + btn.dataset.date + '"]');
      if (again) again.focus();
    });
    grid.addEventListener('keydown', function (e) {
      var btn = e.target.closest('.cal-day');
      if (!btn) return;
      var rtl = html.dir === 'rtl';
      var map = { ArrowRight: rtl ? -1 : 1, ArrowLeft: rtl ? 1 : -1, ArrowDown: 7, ArrowUp: -7 };
      if (map[e.key] != null) { e.preventDefault(); moveCalendarFocus(btn.dataset.date, map[e.key]); }
    });

    $('#slots').addEventListener('click', function (e) {
      var btn = e.target.closest('.slot');
      if (!btn || btn.disabled) return;
      booking.slot = btn.dataset.time;
      showError('err-slot', '');
      $all('.slot', this).forEach(function (s) { s.setAttribute('aria-pressed', String(s === btn)); });
    });

    $('#btn-back').addEventListener('click', function () { if (booking.step > 1) goToStep(booking.step - 1); });

    // Clear field errors as the user types
    ['f-name', 'f-phone', 'f-email'].forEach(function (id) {
      var input = document.getElementById(id);
      input.addEventListener('input', function () {
        if (input.getAttribute('aria-invalid') === 'true') { input.removeAttribute('aria-invalid'); showError('err-' + id.slice(2), ''); }
      });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (booking.step === 1) {
        if (!booking.treatment) { showError('err-treatment', t('err.treatment')); var r = form.querySelector('input[name="treatment"]'); if (r) r.focus(); return; }
        goToStep(2);
      } else if (booking.step === 2) {
        if (!booking.date || !booking.slot) { showError('err-slot', t('err.slot')); return; }
        goToStep(3);
      } else if (booking.step === 3) {
        if (!validateDetails()) return;
        booking.details = {
          name: $('#f-name').value.trim(),
          phone: $('#f-phone').value.trim(),
          email: $('#f-email').value.trim(),
          hmo: $('#f-hmo').value
        };
        renderSummary();
        goToStep(4);
      }
    });

    $('#book-again').addEventListener('click', function () {
      form.reset();
      booking.treatment = null; booking.date = null; booking.slot = null; booking.details = null;
      booking.viewYear = today.getFullYear(); booking.viewMonth = today.getMonth();
      $all('[aria-invalid]', form).forEach(function (el) { el.removeAttribute('aria-invalid'); });
      renderTreatmentChoices(); renderCalendar(); renderSlots();
      goToStep(1);
    });

    renderTreatmentChoices();
    renderCalendar();
    renderSlots();
  }

  /* ------------------------------------------------------------------
     5. Testimonials carousel
     ------------------------------------------------------------------ */
  var carousel = { index: 0, timer: null, paused: false };
  var STAR = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3.5 2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.9L12 3.5Z" fill="currentColor"/></svg>';

  function renderCarousel() {
    var track = $('#carousel-track');
    if (!track) return;
    var total = TESTIMONIALS.length;
    track.innerHTML = TESTIMONIALS.map(function (q, i) {
      return '<figure class="slide" role="group" aria-roledescription="slide" aria-label="' + t('rev.slide', { n: i + 1, total: total }) + '">' +
        '<div class="slide__stars" role="img" aria-label="5/5">' + STAR + STAR + STAR + STAR + STAR + '</div>' +
        '<blockquote class="slide__text">' + escapeHTML(q.text[lang]) + '</blockquote>' +
        '<figcaption class="slide__person"><span class="slide__avatar" aria-hidden="true">' + escapeHTML(q.initials[lang]) + '</span>' +
        '<span><span class="slide__name">' + escapeHTML(q.name[lang]) + '</span><span class="slide__meta">' + escapeHTML(q.meta[lang]) + '</span></span></figcaption>' +
        '</figure>';
    }).join('');
    $('#carousel-dots').innerHTML = TESTIMONIALS.map(function (_, i) {
      return '<button type="button" class="carousel__dot" data-index="' + i + '" aria-label="' + escapeHTML(t('rev.goto', { n: i + 1 })) + '"></button>';
    }).join('');
    goToSlide(carousel.index, true);
  }

  function goToSlide(i, instant) {
    var total = TESTIMONIALS.length;
    carousel.index = (i + total) % total;
    var track = $('#carousel-track');
    var dir = html.dir === 'rtl' ? 1 : -1;
    if (instant) track.style.transition = 'none';
    track.style.transform = 'translateX(' + (dir * 100 * carousel.index) + '%)';
    if (instant) { track.offsetWidth; track.style.transition = ''; } // force reflow
    $all('.slide', track).forEach(function (s, idx) {
      var active = idx === carousel.index;
      s.setAttribute('aria-hidden', String(!active));
      if ('inert' in s) s.inert = !active;
    });
    $all('.carousel__dot').forEach(function (d, idx) {
      if (idx === carousel.index) d.setAttribute('aria-current', 'true'); else d.removeAttribute('aria-current');
    });
  }

  function initCarousel() {
    var root = $('#carousel');
    if (!root) return;
    var track = $('#carousel-track');
    renderCarousel();

    $('#car-prev').addEventListener('click', function () { goToSlide(carousel.index - 1); });
    $('#car-next').addEventListener('click', function () { goToSlide(carousel.index + 1); });
    $('#carousel-dots').addEventListener('click', function (e) {
      var d = e.target.closest('.carousel__dot');
      if (d) goToSlide(+d.dataset.index);
    });

    // Swipe
    var startX = null;
    track.addEventListener('pointerdown', function (e) { startX = e.clientX; });
    window.addEventListener('pointerup', function (e) {
      if (startX == null) return;
      var dx = e.clientX - startX; startX = null;
      if (Math.abs(dx) < 50) return;
      var forward = dx < 0;
      if (html.dir === 'rtl') forward = !forward;
      goToSlide(carousel.index + (forward ? 1 : -1));
    });

    // Autoplay (off for reduced motion; paused on hover / focus / hidden tab)
    function tick() { if (!carousel.paused && !document.hidden) goToSlide(carousel.index + 1); }
    function start() {
      stop();
      if (reduceMotion.matches) return;
      track.setAttribute('aria-live', 'off');
      carousel.timer = setInterval(tick, 7000);
    }
    function stop() { clearInterval(carousel.timer); carousel.timer = null; }
    root.addEventListener('mouseenter', function () { carousel.paused = true; });
    root.addEventListener('mouseleave', function () { carousel.paused = false; });
    root.addEventListener('focusin', function () { carousel.paused = true; track.setAttribute('aria-live', 'polite'); });
    root.addEventListener('focusout', function (e) {
      if (!root.contains(e.relatedTarget)) { carousel.paused = false; track.setAttribute('aria-live', 'off'); }
    });
    reduceMotion.addEventListener('change', start);
    start();
  }

  /* ------------------------------------------------------------------
     6. FAQ accordion
     ------------------------------------------------------------------ */
  function initAccordion() {
    $all('.acc__btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var open = btn.getAttribute('aria-expanded') === 'true';
        btn.setAttribute('aria-expanded', String(!open));
        btn.closest('.acc').classList.toggle('is-open', !open);
      });
    });
  }

  /* ------------------------------------------------------------------
     Boot
     ------------------------------------------------------------------ */
  function init() {
    var y = document.getElementById('year');
    if (y) y.textContent = String(new Date().getFullYear());
    harvestEnglish();   // English copy comes from the markup
    initBooking();
    initCarousel();
    initLanguage();
    initNav();
    initAccordion();
    initReveal();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
