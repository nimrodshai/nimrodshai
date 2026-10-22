// All page copy lives here, in English and Hebrew.
window.CONTENT = {
  // WhatsApp number in international format, digits only (e.g. 9725XXXXXXXX).
  whatsapp: "WHATSAPP_NUMBER",

  ui: {
    en: {
      skip: "Skip to content",
      name: "Nimrod Shai",
      navProjects: "Projects",
      navContact: "Contact",
      langLabel: "עברית",
      heroA: "I build AI products",
      heroB: "end to end.",
      heroC: "From the first conversation about the problem to the version real people use.",
      aboutLabel: "About",
      aboutTitles: ["13 years of mobile apps", "AI at the center", "Building with AI every day"],
      stats: [
        { big: "13 Years", label: "building and shipping products" },
        { big: "2 Years", label: "with AI at the center of my work" }
      ],
      heroBody: [
        "For thirteen years I built mobile apps for companies like LivePerson, Lemonade and Mixtiles, from customer chat and insurance to AI-made photo books. Along the way I learned that good code is only half the job; the other half is an experience that feels simple and natural.",
        "For the past two years AI has been at the center of my work. I turn AI ideas into products that work in the real world, and since March 2026 I've been helping businesses with AI while launching products of my own: a WhatsApp assistant for families, data tools, generative music and more.",
        "I build with AI every day. It lets me move fast, even into new areas, and my focus stays on what matters: solving the right problem with something that works reliably and that people actually enjoy using."
      ],
      ctaProjects: "See the projects",
      ctaContact: "Get in touch",
      portraitAlt: "Portrait of Nimrod Shai",
      projectsTitle: "Projects",
      projectsSub: "Products I designed, built and launched myself, most of them powered by AI.",
      behind: "Behind the project",
      behindShort: "Behind it",
      shotAlt: "Screenshot of {name}",
      visit: "Visit site",
      demo: "Open demo",
      moreTitle: "More tools and experiments",
      contactTitle: "Let's build something",
      contactSub: "I take on freelance projects: AI products and features, applications and websites, and getting a prototype all the way to production. Tell me what you're building and let's talk.",
      waTitle: "Message me on WhatsApp",
      waSub: "Usually the quickest reply",
      waBadge: "Fastest",
      waText: "Hi Nimrod, I saw your portfolio and I'd like to talk about a project.",
      mailTitle: "Send an email",
      footerNote: "Built with Claude Code."
    },
    he: {
      skip: "דילוג לתוכן",
      name: "נמרוד שי",
      navProjects: "פרויקטים",
      navContact: "יצירת קשר",
      langLabel: "English",
      heroA: "אני בונה מוצרי AI",
      heroB: "מקצה לקצה.",
      heroC: "מהשיחה הראשונה על הבעיה ועד לגרסה שאנשים אמיתיים משתמשים בה.",
      aboutLabel: "אודות",
      aboutTitles: ["13 שנים של אפליקציות", "AI במרכז העבודה", "בונה עם AI כל יום"],
      stats: [
        { big: "13 שנים", label: "של בניית מוצרים והשקתם" },
        { big: "2 שנים", label: "עם AI במרכז העבודה שלי" }
      ],
      heroBody: [
        "במשך שלוש עשרה שנים בניתי אפליקציות מובייל לחברות כמו LivePerson, Lemonade ו־Mixtiles, מצ׳אט עם לקוחות וביטוח ועד אלבומי תמונות שנוצרים ב־AI. בדרך למדתי שקוד טוב הוא רק חצי מהעבודה; החצי השני הוא חוויה שמרגישה פשוטה וטבעית.",
        "בשנתיים האחרונות AI נמצא במרכז העבודה שלי. אני הופך רעיונות מבוססי AI למוצרים שעובדים בעולם האמיתי, ומאז מרץ 2026 אני עוזר לעסקים עם AI ובמקביל משיק מוצרים משלי: עוזר וואטסאפ למשפחות, כלי דאטה, מוזיקה גנרטיבית ועוד.",
        "אני בונה עם AI כל יום. זה מאפשר לי להתקדם מהר, גם בתחומים חדשים, והפוקוס שלי נשאר על מה שחשוב: לפתור את הבעיה הנכונה, עם משהו שעובד באמינות ושאנשים באמת נהנים להשתמש בו."
      ],
      ctaProjects: "לצפייה בפרויקטים",
      ctaContact: "יצירת קשר",
      portraitAlt: "דיוקן של נמרוד שי",
      projectsTitle: "פרויקטים",
      projectsSub: "מוצרים שאפיינתי, בניתי והשקתי בעצמי, רובם מבוססי AI.",
      behind: "מאחורי הפרויקט",
      behindShort: "מאחורי הקלעים",
      shotAlt: "צילום מסך של {name}",
      visit: "לאתר",
      demo: "לדמו",
      moreTitle: "עוד כלים וניסויים",
      contactTitle: "בואו נבנה משהו",
      contactSub: "אני לוקח פרויקטים כפרילנסר: מוצרים ופיצ׳רים מבוססי AI, אפליקציות ואתרים, והבאה של אב־טיפוס עד לפרודקשן. ספרו לי מה אתם בונים ובואו נדבר.",
      waTitle: "שלחו לי הודעה בוואטסאפ",
      waSub: "בדרך כלל התשובה הכי מהירה",
      waBadge: "הכי מהיר",
      waText: "היי נמרוד, ראיתי את תיק העבודות שלך ואשמח לדבר על פרויקט.",
      mailTitle: "שליחת מייל",
      footerNote: "נבנה עם Claude Code."
    }
  },

  projects: [
    {
      id: "assistyca",
      label: "assistyca.com",
      url: "https://assistyca.com",
      tags: ["Python", "WhatsApp Cloud API", "OpenAI", "Agent tools", "OTP auth", "Render"],
      en: {
        kicker: "Flagship", status: "Live",
        name: "Assistyca",
        tagline: "Your family's week, running itself, inside WhatsApp.",
        desc: "An AI assistant that keeps a family's plans and everyday tasks in one WhatsApp chat: who's picking up whom, carpools, shopping lists and reminders. No new app to learn; you just send a message.",
        behind: [
          "Understands plain messages like \"add milk to our list\" or \"remind me to call the dentist at 10\" and turns them into lists, tasks and reminders.",
          "Keeps everyone in sync: activities, rides and last-minute changes are shared with the right people.",
          "Built on the WhatsApp Cloud API with one shared webhook that routes every message to the right account.",
          "A web portal with phone OTP sign-in for settings, and sensitive actions confirmed through WhatsApp approval links."
        ]
      },
      he: {
        kicker: "פרויקט הדגל", status: "באוויר",
        name: "Assistyca",
        tagline: "השבוע של המשפחה מנהל את עצמו, בתוך הוואטסאפ.",
        desc: "עוזר AI שמרכז את התוכניות והמשימות של המשפחה בצ׳אט וואטסאפ אחד: מי אוסף את מי, הסעות, רשימות קניות ותזכורות. בלי אפליקציה חדשה, פשוט שולחים הודעה.",
        behind: [
          "מבין הודעות רגילות כמו \"תוסיף חלב לרשימה\" או \"תזכיר לי להתקשר לרופא השיניים ב־10\" והופך אותן לרשימות, משימות ותזכורות.",
          "שומר על כולם מסונכרנים: חוגים, הסעות ושינויים של הרגע האחרון מגיעים לאנשים הנכונים.",
          "בנוי על WhatsApp Cloud API עם webhook משותף אחד שמנתב כל הודעה לחשבון הנכון.",
          "פורטל ווב עם כניסה ב־OTP לטלפון להגדרות, ופעולות רגישות מאושרות דרך קישורי אישור בוואטסאפ."
        ]
      }
    },
    {
      id: "yallachess",
      label: "Yalla Chess · home page",
      url: "demos/yallachess/",
      langShots: true,
      tags: ["Node.js", "SQLite", "Twilio Verify", "Resend", "Docker", "GitHub Actions"],
      en: {
        kicker: "Client product", status: "Built for a chess school",
        name: "Yalla Chess Academy",
        tagline: "A home for a chess school: classes, teachers and students.",
        desc: "The website and member portal for a chess school. Teachers manage their groups, schedules, Zoom links and students; families sign in with their phone number.",
        behind: [
          "Plain Node with the built-in SQLite module: no framework, few dependencies, easy for one person to maintain.",
          "Phone sign-in through Twilio Verify and transactional email through Resend.",
          "Hebrew and English throughout, with right-to-left layouts.",
          "Packaged in Docker for Render, with 27 automated tests running in CI on every push."
        ]
      },
      he: {
        kicker: "מוצר ללקוח", status: "נבנה לבית ספר לשחמט",
        name: "Yalla Chess Academy",
        tagline: "בית לבית ספר לשחמט: שיעורים, מורים ותלמידים.",
        desc: "האתר ופורטל החברים של בית ספר לשחמט. מורים מנהלים קבוצות, לוחות זמנים, קישורי Zoom ותלמידים, ומשפחות נכנסות עם מספר הטלפון.",
        behind: [
          "Node נקי עם מודול SQLite המובנה: בלי פריימוורק, מעט תלויות, קל לתחזוקה של אדם אחד.",
          "כניסה בטלפון דרך Twilio Verify ומיילים דרך Resend.",
          "עברית ואנגלית בכל המערכת, עם תצוגה מימין לשמאל.",
          "ארוז ב־Docker ל־Render, עם 27 בדיקות אוטומטיות ב־CI בכל push."
        ]
      }
    },
    {
      id: "musicball",
      label: "MusicBall",
      url: "demos/musicball/",
      tags: ["JavaScript", "Web Audio API", "Canvas", "Physics", "Generative music"],
      en: {
        kicker: "Creative coding", status: "Playable",
        name: "MusicBall",
        tagline: "Generative music from physics.",
        desc: "Balls bounce forever inside spinning rings. Every time a ball hits a colored part of a ring, it plays a note, strums a chord or changes the music, so the song keeps writing itself.",
        behind: [
          "Balls never lose energy, with a touch of randomness on each bounce so patterns never lock into a loop.",
          "Ten ring types: notes, chords, drums, and rings that change tempo, rhythm, key, scale, instrument, filter and echo.",
          "A 16-step background sequencer plays drums, bass and a pad on the current chord.",
          "Built with no libraries, on Canvas and the Web Audio API; drop or throw balls with the mouse, and a full touch UI on phones."
        ]
      },
      he: {
        kicker: "קוד יצירתי", status: "אפשר לשחק",
        name: "MusicBall",
        tagline: "מוזיקה גנרטיבית מפיזיקה.",
        desc: "כדורים קופצים בלי סוף בתוך טבעות מסתובבות. בכל פעם שכדור פוגע בחלק צבעוני של טבעת, הוא מנגן תו, פורט אקורד או משנה את המוזיקה, כך שהשיר ממשיך לכתוב את עצמו.",
        behind: [
          "הכדורים לא מאבדים אנרגיה, ומעט אקראיות בכל קפיצה מונעת מהדפוסים להיתקע בלופ.",
          "עשרה סוגי טבעות: תווים, אקורדים, תופים, וטבעות שמשנות טמפו, קצב, סולם, מפתח, כלי, פילטר והד.",
          "סקוונסר רקע של 16 צעדים מנגן תופים, בס ופד על האקורד הנוכחי.",
          "נבנה בלי ספריות, על Canvas ו־Web Audio API; מפילים או זורקים כדורים עם העכבר, וממשק מגע מלא בטלפון."
        ]
      }
    },
    {
      id: "freedom",
      label: "isfreedombetter.com",
      url: "https://isfreedombetter.com",
      tags: ["Python", "Statistics", "Data pipeline", "Interactive charts", "GitHub Pages", "GitHub Actions"],
      en: {
        kicker: "Data story", status: "Live",
        name: "Is Freedom Better?",
        tagline: "Which conditions help societies thrive? Five theories, one test.",
        desc: "An interactive study that puts economic freedom, democracy and three measures of equality up against 18 quality-of-life outcomes across 176 countries, from happiness and poverty to life expectancy, and shows which one actually predicts a better life.",
        behind: [
          "A Python pipeline joins 17 trusted sources and tests each theory against each outcome with Pearson correlation (p < 0.05).",
          "For every outcome, the theory with the strongest significant correlation takes the point, and the scoreboard shows the winner.",
          "Updated weekly: a scheduled job refreshes the data and rebuilds the site, with a raw-data view and a plain-language explanation.",
          "Born from one of my favorite hobbies: talking about economics."
        ]
      },
      he: {
        kicker: "סיפור בנתונים", status: "באוויר",
        name: "Is Freedom Better?",
        tagline: "אילו תנאים עוזרים לחברות לשגשג? חמש תיאוריות, מבחן אחד.",
        desc: "מחקר אינטראקטיבי שמעמיד חופש כלכלי, דמוקרטיה ושלושה מדדי שוויון מול 18 מדדי איכות חיים ב־176 מדינות, מאושר ועוני ועד תוחלת חיים, ומראה מה באמת מנבא חיים טובים יותר.",
        behind: [
          "צינור Python מחבר 17 מקורות אמינים ובודק כל תיאוריה מול כל מדד במתאם פירסון (p < 0.05).",
          "בכל מדד, התיאוריה עם המתאם המובהק החזק ביותר מקבלת נקודה, ולוח התוצאות מראה מי מנצחת.",
          "מתעדכן כל שבוע: משימה מתוזמנת מרעננת את הנתונים ובונה את האתר מחדש, עם תצוגת נתונים גולמיים והסבר בשפה פשוטה.",
          "נולד מאחד התחביבים האהובים עליי: לדבר על כלכלה."
        ]
      }
    },
    {
      id: "boommadad",
      label: "boommadad.com",
      url: "https://boommadad.com/",
      tags: ["Python", "Telegram Bot API", "GitHub Actions", "Cloudflare Workers", "Netlify"],
      en: {
        kicker: "Built for my dad", status: "Live",
        name: "Boom Madad",
        tagline: "An index strategy, backtested from a Telegram chat.",
        desc: "My father's investment strategy times the S&P 500 using a financial-conditions index. I turned his spreadsheet into a Telegram bot: ask for a backtest, get a PDF report back.",
        behind: [
          "Ported the Excel backtest to a Python engine that renders the results as a PDF.",
          "Runs on GitHub-hosted runners, so no machine has to stay on at home.",
          "A small Cloudflare Worker relays Telegram webhooks so replies arrive instantly.",
          "A Hebrew landing page explains the strategy to new readers."
        ]
      },
      he: {
        kicker: "נבנה בשביל אבא שלי", status: "באוויר",
        name: "בום מדד",
        tagline: "אסטרטגיית מדד, עם בדיקת עבר מתוך צ׳אט בטלגרם.",
        desc: "האסטרטגיה של אבא שלי מתזמנת השקעה ב־S&P 500 לפי מדד תנאים פיננסיים. הפכתי את הגיליון שלו לבוט טלגרם: מבקשים בדיקת עבר ומקבלים דוח PDF.",
        behind: [
          "העברתי את בדיקת העבר מ־Excel למנוע Python שמפיק את התוצאות כ־PDF.",
          "רץ על שרתים של GitHub, כך שאף מחשב לא צריך להישאר דלוק בבית.",
          "Cloudflare Worker קטן מעביר webhooks מטלגרם כדי שהתשובות יגיעו מיד.",
          "דף נחיתה בעברית מסביר את האסטרטגיה לקוראים חדשים."
        ]
      }
    },
    {
      id: "renters",
      label: "Aytemz · demo with sample data",
      url: "demos/aytemz/",
      tags: ["Python", "FastAPI", "MongoDB", "QR codes", "OTP auth", "LemonSqueezy", "Render"],
      en: {
        kicker: "SaaS", status: "Pre-launch",
        name: "Aytemz",
        tagline: "Equipment rentals and checkouts, tracked with a QR scan.",
        desc: "A web app for production houses and rental companies to manage their gear: scan an item to check it out or back in, book equipment ahead of time, and always know what's out, with whom and what's overdue.",
        behind: [
          "Every item gets its own QR code, and checkouts track quantities for gear you own more than one of.",
          "Reservations check overlapping bookings against what's in stock, so nothing gets double-booked.",
          "Passwordless sign-in with one-time codes sent by email, and separate roles for admins and staff.",
          "A free trial, monthly and yearly plans through LemonSqueezy, promo codes, and reports on usage, history and overdue items."
        ]
      },
      he: {
        kicker: "SaaS", status: "לפני השקה",
        name: "Aytemz",
        tagline: "השכרה והשאלה של ציוד, במעקב בסריקת QR.",
        desc: "אפליקציית ווב לבתי הפקה ולחברות השכרה לניהול הציוד: סורקים פריט כדי להוציא או להחזיר אותו, מזמינים ציוד מראש, ותמיד יודעים מה בחוץ, אצל מי ומה מאחר.",
        behind: [
          "לכל פריט קוד QR משלו, וההוצאות עוקבות אחרי כמויות לציוד שיש ממנו יותר מיחידה אחת.",
          "הזמנות נבדקות מול הזמנות חופפות ומול המלאי, כך שאין הזמנות כפולות.",
          "כניסה בלי סיסמה עם קוד חד־פעמי במייל, והרשאות נפרדות למנהלים ולצוות.",
          "תקופת ניסיון, מנוי חודשי ושנתי דרך LemonSqueezy, קודי הטבה ודוחות על שימוש, היסטוריה ופריטים באיחור."
        ]
      }
    }
  ],

  more: [
    {
      name: "Token Prices API", url: "https://token-prices-api.onrender.com/api/openai/prices",
      en: "A tiny public API that returns current OpenAI token prices as clean JSON.",
      he: "API ציבורי קטן שמחזיר את מחירי הטוקנים של OpenAI כ־JSON נקי.",
      tag: "API · Python"
    },
    {
      name: "Script Repetitive Work", url: null,
      en: "An open-source add-on that teaches AI assistants to turn repetitive manual work into automations.",
      he: "תוסף בקוד פתוח שמלמד עוזרי AI להפוך עבודה ידנית שחוזרת על עצמה לאוטומציות.",
      tag: "AI automation · Open source"
    },
    {
      name: "Mobile Browser", url: null,
      en: "A tool for trying out websites on a phone exactly as if they were installed apps.",
      he: "כלי לבדיקת אתרים בטלפון בדיוק כאילו היו אפליקציות מותקנות.",
      tag: "Mobile app"
    }
  ]
};
