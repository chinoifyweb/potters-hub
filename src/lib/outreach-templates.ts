// ============================================================
// THE POTTER'S HUB — Outreach Message Templates
// Warm, pastoral, Nigerian-context messages for every occasion
// ============================================================

const CHURCH = "The Potter's Hub";
const PASTOR_SIGN = `— Pastor Arthur Ifeanyi & the ${CHURCH} family`;
const SIGN = `— ${CHURCH} family`;

export interface TemplateMeta {
  value: string;
  label: string;
  group: string;
  icon: string;
}

// UI grouping so the dropdown is scannable
export const TEMPLATE_OPTIONS: TemplateMeta[] = [
  // ───── Personal Care ─────
  { value: "welcome", label: "Welcome New Member", group: "Personal Care", icon: "🌿" },
  { value: "first_time_visitor", label: "First-Time Visitor Follow-up", group: "Personal Care", icon: "🙋" },
  { value: "absence", label: "Missed You at Church", group: "Personal Care", icon: "💛" },
  { value: "welcome_back", label: "Welcome Back", group: "Personal Care", icon: "🤗" },
  { value: "get_well", label: "Get Well Soon", group: "Personal Care", icon: "🙏" },
  { value: "bereavement", label: "Condolence / Bereavement", group: "Personal Care", icon: "🕊️" },
  { value: "encouragement", label: "Words of Encouragement", group: "Personal Care", icon: "✨" },
  { value: "prayer_followup", label: "Prayer Request Follow-up", group: "Personal Care", icon: "🕯️" },
  { value: "appreciation", label: "Appreciation / Thank You", group: "Personal Care", icon: "💝" },

  // ───── Celebrations ─────
  { value: "birthday", label: "Happy Birthday", group: "Celebrations", icon: "🎂" },
  { value: "anniversary", label: "Wedding Anniversary", group: "Celebrations", icon: "💍" },
  { value: "new_baby", label: "New Baby / Dedication", group: "Celebrations", icon: "👶" },
  { value: "wedding", label: "Wedding Congratulations", group: "Celebrations", icon: "💒" },
  { value: "graduation", label: "Graduation", group: "Celebrations", icon: "🎓" },
  { value: "promotion", label: "Job / Promotion", group: "Celebrations", icon: "🏆" },
  { value: "thanksgiving", label: "Answered Prayer / Testimony", group: "Celebrations", icon: "🙌" },

  // ───── Services & Events ─────
  { value: "sunday_reminder", label: "Sunday Service Reminder", group: "Services & Events", icon: "⛪" },
  { value: "midweek_reminder", label: "Bible Study Reminder", group: "Services & Events", icon: "📖" },
  { value: "friday_prayer", label: "Friday Prayer Reminder", group: "Services & Events", icon: "🔥" },
  { value: "vigil", label: "Night Vigil", group: "Services & Events", icon: "🌙" },
  { value: "fasting", label: "Fasting Announcement", group: "Services & Events", icon: "🕊️" },
  { value: "youth_event", label: "Youth Event", group: "Services & Events", icon: "🎉" },
  { value: "women_meeting", label: "Women's Fellowship", group: "Services & Events", icon: "👭" },
  { value: "men_meeting", label: "Men's Fellowship", group: "Services & Events", icon: "🤝" },
  { value: "event_general", label: "General Event Invitation", group: "Services & Events", icon: "📣" },

  // ───── Seasonal ─────
  { value: "new_year", label: "New Year Blessing", group: "Seasonal", icon: "🎊" },
  { value: "christmas", label: "Christmas Greeting", group: "Seasonal", icon: "🎄" },
  { value: "easter", label: "Easter Greeting", group: "Seasonal", icon: "✝️" },

  // ───── General ─────
  { value: "broadcast", label: "General Announcement", group: "General", icon: "📢" },
  { value: "apology", label: "Apology / Reconciliation", group: "General", icon: "🤍" },
  { value: "custom", label: "Custom Message", group: "General", icon: "✍️" },
];

// ============================================================
// TEMPLATES — personalized with {name}
// ============================================================
export const templates: Record<string, (name: string) => string> = {
  // ───── PERSONAL CARE ─────

  welcome: (name) =>
    `Praise the Lord ${name}! 🙏\n\nOn behalf of our Senior Pastor and the entire ${CHURCH} family, I want to warmly welcome you into the House of God. We are truly grateful that the Lord has brought you our way, and we believe this is the beginning of beautiful things in your life.\n\nYou are not a visitor here — you are family. 💛\n\nService times:\n⛪ Sunday: 8:00 AM\n📖 Tuesday Bible Study: 5:30 PM\n🔥 Friday Prayer: 6:00 PM\n\nIf there is anything you need — prayer, counsel, or just someone to talk to — please do not hesitate to reach out.\n\nWelcome home!\n\n${PASTOR_SIGN}`,

  first_time_visitor: (name) =>
    `Hello ${name}, 🌟\n\nIt was such a joy having you with us on Sunday! Thank you for honouring us with your presence — it truly meant a lot.\n\nWe are praying specifically for you and everything on your heart this week. We believe that as you continue to fellowship with us, you will see God's hand move in wonderful ways in your life and family.\n\nWe would love to see you again this Sunday by 8:00 AM. Please feel free to come as you are.\n\nBe blessed!\n\n${PASTOR_SIGN}`,

  absence: (name) =>
    `Hello ${name}, 💛\n\nWe noticed you have not been in service lately, and I just want you to know that you have been sorely missed. The ${CHURCH} family is simply not complete without you.\n\nI am lifting you and your family up in prayer today. Whatever the situation may be — health, work, family, or anything else — please know that God sees you, and we are here for you too.\n\nDo let me know if there is any way we can support you. We are trusting God to see you in church this coming Sunday.\n\nStay blessed and highly favoured!\n\n${PASTOR_SIGN}`,

  welcome_back: (name) =>
    `Welcome back home, ${name}! 🤗\n\nIt was so refreshing to see you in service again. You were truly missed, and the joy on our faces when we saw you was not a small matter at all!\n\n"There is rejoicing in the presence of the angels of God…" — Luke 15:10\n\nMay the Lord continue to draw you closer and keep you rooted in His love. We are here for you, always.\n\n${PASTOR_SIGN}`,

  get_well: (name) =>
    `Dear ${name}, 🙏\n\nI heard that you are not feeling too well, and I just had to reach out. Please know that you are not going through this alone — the entire ${CHURCH} family is praying fervently for your complete healing.\n\n"I will restore you to health and heal your wounds, declares the Lord." — Jeremiah 30:17\n\nI speak total healing, restoration, and renewed strength over your body in Jesus' name. Every trace of sickness must go, and the joy of the Lord will be your strength.\n\nGet well soon, beloved. We love you. ❤️\n\n${PASTOR_SIGN}`,

  bereavement: (name) =>
    `Dearly beloved ${name}, 🕊️\n\nMy heart is heavy as I reach out to you during this very painful time. Please accept my deepest condolences on behalf of the entire ${CHURCH} family.\n\n"Blessed are those who mourn, for they will be comforted." — Matthew 5:4\n\nThere are no words that can fully express what we feel, but please know that we are standing with you in prayer. May the God of all comfort wrap you in His peace, strengthen your heart, and grant you the grace to bear this loss.\n\nYou are not alone. If you need anything at all — prayer, a listening ear, or practical help — please reach out.\n\nWith love and prayers,\n\n${PASTOR_SIGN}`,

  encouragement: (name) =>
    `Hello ${name}, ✨\n\nThe Holy Spirit laid it on my heart to reach out to you today. I want you to know that God has not forgotten you. He sees every tear, every prayer, and every quiet moment of faith.\n\n"For I know the plans I have for you, declares the Lord — plans to prosper you and not to harm you, plans to give you hope and a future." — Jeremiah 29:11\n\nHold on. What He has started, He will finish. Keep your eyes on Him.\n\nI am praying for you. Have a beautifully blessed day!\n\n${PASTOR_SIGN}`,

  prayer_followup: (name) =>
    `Hello ${name}, 🕯️\n\nI just wanted to check in on you regarding the prayer request you shared. How are things going? I have been praying and I am believing God with you for a testimony that will shake the foundations.\n\nPlease share with me whenever you can — whether it is an update, a fresh concern, or good news. I am here.\n\nGod bless you, dear.\n\n${PASTOR_SIGN}`,

  appreciation: (name) =>
    `Dear ${name}, 💝\n\nOn behalf of the ${CHURCH} family, I want to personally say THANK YOU. Your love, support, and commitment have not gone unnoticed — heaven is recording every single thing.\n\n"God is not unjust; He will not forget your work and the love you have shown Him…" — Hebrews 6:10\n\nMay every seed you have sown return to you in multiplied blessings. We truly appreciate you!\n\n${PASTOR_SIGN}`,

  // ───── CELEBRATIONS ─────

  birthday: (name) =>
    `🎉 Happy Birthday ${name}! 🎂\n\nOn behalf of our Senior Pastor and the entire ${CHURCH} family, I wish you a glorious new age filled with God's favour, peace, and unstoppable breakthroughs!\n\n"The Lord bless you and keep you; the Lord make His face shine on you and be gracious to you; the Lord turn His face toward you and give you peace." — Numbers 6:24-26\n\nThis new year of your life shall be your best yet. Fresh anointing. New levels. Unspeakable joy. Supernatural favour. Long life and good health in Jesus' name!\n\nEnjoy your special day. We love you! 🙏❤️\n\n${PASTOR_SIGN}`,

  anniversary: (name) =>
    `💍 Happy Wedding Anniversary ${name}! 💒\n\nWhat a beautiful milestone! On behalf of the ${CHURCH} family, I celebrate you and your spouse on this special day. The Lord has been your foundation, and He will continue to be your covering.\n\n"Therefore what God has joined together, let no one separate." — Mark 10:9\n\nMay your love grow sweeter, your home richer in peace, and your union be a shining example for generations. Many more fruitful years together in Jesus' name!\n\nCelebrate big!\n\n${PASTOR_SIGN}`,

  new_baby: (name) =>
    `👶 Congratulations ${name}! 🎊\n\nWe join you in thanking God for the beautiful gift of a new baby! Truly, "children are a heritage from the Lord" (Psalm 127:3), and this child is a sign of God's continued favour on your family.\n\nMay this little one grow in wisdom, stature, and in favour with God and man (Luke 2:52). Long life, good health, divine destiny, and abundant grace are the portion of this child in Jesus' name.\n\nWe are already looking forward to the dedication! Blessings upon blessings!\n\n${PASTOR_SIGN}`,

  wedding: (name) =>
    `💒 Congratulations ${name}! 🎉\n\nWhat a beautiful day the Lord has made! On behalf of the ${CHURCH} family, we celebrate with you as you begin this beautiful journey of marriage.\n\n"He who finds a wife finds a good thing and obtains favour from the Lord." — Proverbs 18:22\n\nMay your home be filled with love, laughter, and the presence of God. May your union be fruitful in every sense of the word. We are cheering you on and praying for you always!\n\nEnjoy every moment!\n\n${PASTOR_SIGN}`,

  graduation: (name) =>
    `🎓 Congratulations ${name}! 🌟\n\nWhat a testimony! We are so proud of you. All those long nights, sacrifices, and prayers have paid off — to God be the glory!\n\n"Commit to the Lord whatever you do, and He will establish your plans." — Proverbs 16:3\n\nThis is just the beginning. May doors of opportunity open wide for you, may you find favour in high places, and may your career be crowned with excellence in Jesus' name.\n\nCelebrate well — you earned it!\n\n${PASTOR_SIGN}`,

  promotion: (name) =>
    `🏆 Congratulations ${name}! 🎊\n\nWe heard the wonderful news and we cannot stop praising God with you! This is not a small thing — this is the Lord's doing and it is marvellous in our eyes.\n\n"Promotion comes neither from the east, nor from the west, nor from the south. But God is the judge: He puts down one, and sets up another." — Psalm 75:6-7\n\nMay this be the first of many promotions. May you shine in this new role and bring God glory in every boardroom and every decision. We are celebrating with you!\n\n${PASTOR_SIGN}`,

  thanksgiving: (name) =>
    `🙌 Hallelujah ${name}! 🎉\n\nThank you for sharing that beautiful testimony! God has done it again — what shall we say unto the Lord? All we have to say is THANK YOU JESUS!\n\n"Oh give thanks to the Lord, for He is good; for His steadfast love endures forever!" — Psalm 107:1\n\nWhat He has done is just the beginning. Bigger testimonies are on the way. Keep shouting His praise!\n\nCelebrating with you,\n\n${PASTOR_SIGN}`,

  // ───── SERVICES & EVENTS ─────

  sunday_reminder: (name) =>
    `Hello ${name}, ⛪\n\nJust a gentle reminder — we look forward to seeing you in church tomorrow (Sunday) by 8:00 AM. The Lord has a fresh word for you, and your seat is waiting!\n\n"I was glad when they said unto me, let us go into the house of the Lord." — Psalm 122:1\n\nCome expecting a powerful encounter. Bring someone along if you can!\n\nSee you in service!\n\n${SIGN}`,

  midweek_reminder: (name) =>
    `Hello ${name}, 📖\n\nDon't forget — Bible Study is today/tomorrow at 5:30 PM. We are going deeper into the Word and you don't want to miss it!\n\n"Your word is a lamp to my feet and a light to my path." — Psalm 119:105\n\nCome ready to learn, to share, and to be transformed. See you there!\n\n${SIGN}`,

  friday_prayer: (name) =>
    `Hello ${name}, 🔥\n\nFriday Prayer is on today at 6:00 PM. Come with your Bible, come with your burdens, come expecting God to move. We are contending in prayer together!\n\n"The effective, fervent prayer of a righteous man avails much." — James 5:16\n\nSomething must break. See you in the prayer room!\n\n${SIGN}`,

  vigil: (name) =>
    `Hello ${name}, 🌙\n\nWe are gathering for a Night Vigil this [DATE] from 10:00 PM. Heaven will shake as we pray through the night! Come prepared — this one is for the record books.\n\n"At midnight Paul and Silas prayed and sang hymns to God…" — Acts 16:25\n\nBring a friend. See you in the presence of the Lord!\n\n${SIGN}`,

  fasting: (name) =>
    `Hello ${name}, 🕊️\n\nThe church is entering into a season of fasting and prayer from [DATE] to [DATE]. We are seeking God's face together for breakthrough, direction, and His glory to be revealed.\n\n"Is not this the kind of fasting I have chosen: to loose the chains of injustice… to set the oppressed free?" — Isaiah 58:6\n\nPrepare your heart. Whatever chain is in your life must break in this season. Details will follow.\n\n${SIGN}`,

  youth_event: (name) =>
    `Hey ${name}! 🎉\n\nHeads up — the Youth are doing something BIG on [DATE]! Games, worship, Word, food, friends — you name it. We want YOU there!\n\nIt's going to be lit 🔥 and you don't want to miss it.\n\nSee you there, fam!\n\n${SIGN}`,

  women_meeting: (name) =>
    `Dear ${name}, 👭\n\nThis is a warm reminder — Women's Fellowship is holding on [DATE] at [TIME]. Come for a powerful time of sisterhood, Word, and prayer.\n\n"She is clothed with strength and dignity; she can laugh at the days to come." — Proverbs 31:25\n\nYou belong here. See you there!\n\n${SIGN}`,

  men_meeting: (name) =>
    `Brother ${name}, 🤝\n\nMen's Fellowship is holding on [DATE] at [TIME]. We are praying, learning, and sharpening one another. Your brothers need you there.\n\n"As iron sharpens iron, so one man sharpens another." — Proverbs 27:17\n\nSee you there, Mighty Man!\n\n${SIGN}`,

  event_general: (name) =>
    `Hello ${name}, 📣\n\nYou are cordially invited to [EVENT NAME] holding on [DATE] at [TIME], at [VENUE]. It promises to be a time of refreshing and blessing.\n\nCome, and bring someone with you! Your presence is important to us.\n\nSee you there!\n\n${SIGN}`,

  // ───── SEASONAL ─────

  new_year: (name) =>
    `🎊 Happy New Year ${name}! 🎉\n\nWelcome to a year of divine acceleration, open doors, and supernatural breakthrough! Whatever delayed you last year, this year will advance you beyond your wildest expectations in Jesus' name.\n\n"See, I am doing a new thing! Now it springs up; do you not perceive it?" — Isaiah 43:19\n\nIt is your year. It is your season. Step into it boldly!\n\nMany happy returns!\n\n${PASTOR_SIGN}`,

  christmas: (name) =>
    `🎄 Merry Christmas ${name}! ✨\n\nFrom my family and the entire ${CHURCH} family to yours — we wish you a Christmas full of laughter, peace, and the tangible presence of Jesus.\n\n"For unto us a child is born, unto us a son is given…" — Isaiah 9:6\n\nHe came so that we might live. Celebrate Him well, and enjoy every moment with your loved ones.\n\nMerry Christmas! 🎁\n\n${PASTOR_SIGN}`,

  easter: (name) =>
    `✝️ Happy Easter ${name}! 🌅\n\nHE IS RISEN — He is risen indeed! Today we celebrate the greatest victory in the history of mankind: Jesus conquered death so that you and I could live forever.\n\n"Because I live, you also will live." — John 14:19\n\nWhatever the enemy thought was buried in your life, let the power of the resurrection raise it up today! Happy Easter, beloved!\n\n${PASTOR_SIGN}`,

  // ───── GENERAL ─────

  broadcast: (name) =>
    `Hello ${name}, 📢\n\nGreetings from the ${CHURCH} family! 🙏\n\nWe have an important announcement to share: [YOUR ANNOUNCEMENT HERE]\n\nKindly take note, and please share with other members so no one is left out.\n\nGod bless you!\n\n${SIGN}`,

  apology: (name) =>
    `Dear ${name}, 🤍\n\nI want to personally reach out and say I am sorry. If anything I said or did offended or hurt you, please forgive me. You are loved and valued here, and I never want you to feel otherwise.\n\n"If it is possible, as far as it depends on you, live at peace with everyone." — Romans 12:18\n\nI would love for us to talk whenever you are ready. Thank you for your grace.\n\n${PASTOR_SIGN}`,

  custom: (name) =>
    `Hello ${name},\n\n[Your custom message here]\n\n${SIGN}`,
};

// ============================================================
// Render a template with a name + optional custom override
// ============================================================
export function renderTemplate(type: string, name?: string | null, customMessage?: string | null): string {
  const safeName = (name && name.trim()) || "Beloved";
  if (type === "custom" && customMessage && customMessage.trim()) {
    return customMessage.replace(/\{name\}/gi, safeName);
  }
  const fn = templates[type] || templates.broadcast;
  return fn(safeName);
}

// ============================================================
// Phone normalization (Nigerian format → 234xxxxxxxxxx)
// ============================================================
export function normalizePhone(raw: string | null | undefined): string | null {
  if (!raw) return null;
  let digits = String(raw).replace(/\D/g, "");
  if (digits.startsWith("00")) digits = digits.substring(2);
  if (digits.startsWith("0")) digits = "234" + digits.substring(1);
  if (digits.length === 10) digits = "234" + digits;
  if (!digits.startsWith("234")) {
    if (!(digits.length >= 10 && digits.length <= 13)) return null;
  }
  if (digits.length < 12 || digits.length > 15) return null;
  return digits;
}

export function toWaLink(phone: string, message: string): string | null {
  const digits = normalizePhone(phone);
  if (!digits) return null;
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

export function toSmsNumber(phone: string): string | null {
  const digits = normalizePhone(phone);
  if (!digits) return null;
  return `+${digits}`;
}
