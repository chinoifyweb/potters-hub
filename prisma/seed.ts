import { PrismaClient, UserRole, Testament } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // ============================================
  // 1. Create Admin User
  // ============================================
  const adminPassword = await hash("admin123", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@mychurchapp.com" },
    update: {},
    create: {
      email: "admin@mychurchapp.com",
      passwordHash: adminPassword,
      fullName: "Church Admin",
      role: UserRole.admin,
      isVerified: true,
      isActive: true,
    },
  });
  console.log("Admin user created:", admin.email);

  // Create Pastor
  const pastorPassword = await hash("pastor123", 12);
  const pastor = await prisma.user.upsert({
    where: { email: "pastor@mychurchapp.com" },
    update: {},
    create: {
      email: "pastor@mychurchapp.com",
      passwordHash: pastorPassword,
      fullName: "Pastor David Johnson",
      role: UserRole.pastor,
      isVerified: true,
      isActive: true,
      phone: "+2348012345678",
    },
  });

  // Create sample members
  const memberPassword = await hash("member123", 12);
  const members = [];
  const memberData = [
    { email: "john@example.com", fullName: "John Adeyemi", phone: "+2348023456789" },
    { email: "sarah@example.com", fullName: "Sarah Okonkwo", phone: "+2348034567890" },
    { email: "michael@example.com", fullName: "Michael Eze", phone: "+2348045678901" },
    { email: "grace@example.com", fullName: "Grace Nnamdi", phone: "+2348056789012" },
    { email: "peter@example.com", fullName: "Peter Abubakar", phone: "+2348067890123" },
  ];

  for (const data of memberData) {
    const member = await prisma.user.upsert({
      where: { email: data.email },
      update: {},
      create: {
        ...data,
        passwordHash: memberPassword,
        role: UserRole.member,
        isVerified: true,
        isActive: true,
      },
    });
    members.push(member);
  }
  console.log(`${members.length} sample members created`);

  // ============================================
  // 2. Church Profile
  // ============================================
  const church = await prisma.churchProfile.create({
    data: {
      name: "Grace Community Church",
      about: "A vibrant community of believers dedicated to worship, fellowship, and service. We believe in the transforming power of God's love and seek to share it with everyone.",
      seniorPastorName: "Pastor David Johnson",
      phone: "+234-801-234-5678",
      email: "info@gracecommunity.church",
      website: "https://gracecommunity.church",
      address: "123 Faith Avenue, Lekki, Lagos, Nigeria",
      foundedYear: 2005,
      socialLinks: {
        facebook: "https://facebook.com/gracecommunity",
        instagram: "https://instagram.com/gracecommunity",
        youtube: "https://youtube.com/gracecommunity",
        twitter: "https://twitter.com/gracecommunity",
      },
    },
  });

  // Branches
  await prisma.churchBranch.createMany({
    data: [
      {
        churchId: church.id,
        name: "Main Campus - Lekki",
        address: "123 Faith Avenue, Lekki",
        city: "Lagos",
        state: "Lagos",
        country: "Nigeria",
        lat: 6.4541,
        lng: 3.4218,
        pastorName: "Pastor David Johnson",
        pastorEmail: "pastor@mychurchapp.com",
        serviceTimes: { sunday: ["8:00 AM", "10:30 AM"], wednesday: ["6:30 PM"] },
      },
      {
        churchId: church.id,
        name: "Ikeja Campus",
        address: "45 Worship Street, Ikeja",
        city: "Lagos",
        state: "Lagos",
        country: "Nigeria",
        lat: 6.6018,
        lng: 3.3515,
        pastorName: "Pastor Samuel Okafor",
        serviceTimes: { sunday: ["9:00 AM"], wednesday: ["6:00 PM"] },
      },
      {
        churchId: church.id,
        name: "Abuja Campus",
        address: "78 Grace Road, Wuse II",
        city: "Abuja",
        state: "FCT",
        country: "Nigeria",
        lat: 9.0579,
        lng: 7.4951,
        pastorName: "Pastor Mary Bello",
        serviceTimes: { sunday: ["9:00 AM", "11:00 AM"] },
      },
    ],
  });
  console.log("Church profile and branches created");

  // ============================================
  // 3. Sermon Categories
  // ============================================
  const categories = await Promise.all(
    [
      { name: "Faith & Belief", slug: "faith-belief" },
      { name: "Prayer", slug: "prayer" },
      { name: "Family & Relationships", slug: "family-relationships" },
      { name: "Leadership", slug: "leadership" },
      { name: "Worship", slug: "worship" },
      { name: "Youth", slug: "youth" },
      { name: "Evangelism", slug: "evangelism" },
      { name: "Christian Living", slug: "christian-living" },
      { name: "Healing & Deliverance", slug: "healing-deliverance" },
      { name: "Financial Stewardship", slug: "financial-stewardship" },
    ].map((cat) =>
      prisma.sermonCategory.create({ data: cat })
    )
  );
  console.log("Sermon categories created");

  // ============================================
  // 4. Sermons
  // ============================================
  const sermons = await Promise.all(
    [
      {
        title: "Walking in Faith",
        slug: "walking-in-faith",
        description: "A powerful message about stepping out in faith even when the path ahead is uncertain.",
        speaker: "Pastor David Johnson",
        seriesName: "Faith Forward",
        scriptureReference: "Hebrews 11:1-6",
        sermonDate: new Date("2026-03-08"),
        videoUrl: "https://www.youtube.com/embed/example1",
        audioUrl: "/sermons/audio/walking-in-faith.mp3",
        durationSeconds: 3420,
        viewCount: 245,
        isFeatured: true,
        isPublished: true,
      },
      {
        title: "The Power of Prayer",
        slug: "the-power-of-prayer",
        description: "Discover how prayer transforms our lives and connects us with God's purpose.",
        speaker: "Pastor David Johnson",
        seriesName: "Prayer Warriors",
        scriptureReference: "Philippians 4:6-7",
        sermonDate: new Date("2026-03-01"),
        videoUrl: "https://www.youtube.com/embed/example2",
        audioUrl: "/sermons/audio/power-of-prayer.mp3",
        durationSeconds: 2880,
        viewCount: 189,
        isFeatured: false,
        isPublished: true,
      },
      {
        title: "Building Strong Families",
        slug: "building-strong-families",
        description: "God's blueprint for building and maintaining strong, loving families.",
        speaker: "Pastor Mary Bello",
        seriesName: "Family Matters",
        scriptureReference: "Ephesians 5:25-33",
        sermonDate: new Date("2026-02-23"),
        durationSeconds: 3180,
        viewCount: 312,
        isPublished: true,
      },
      {
        title: "Living with Purpose",
        slug: "living-with-purpose",
        description: "Understanding your God-given purpose and walking in it daily.",
        speaker: "Pastor Samuel Okafor",
        scriptureReference: "Jeremiah 29:11",
        sermonDate: new Date("2026-02-16"),
        durationSeconds: 2640,
        viewCount: 156,
        isPublished: true,
      },
      {
        title: "Grace Upon Grace",
        slug: "grace-upon-grace",
        description: "Exploring the depths of God's unmerited grace in our lives.",
        speaker: "Pastor David Johnson",
        seriesName: "Amazing Grace",
        scriptureReference: "John 1:16",
        sermonDate: new Date("2026-02-09"),
        durationSeconds: 3060,
        viewCount: 198,
        isFeatured: true,
        isPublished: true,
      },
    ].map((sermon) => prisma.sermon.create({ data: sermon }))
  );
  console.log(`${sermons.length} sermons created`);

  // ============================================
  // 5. Events
  // ============================================
  await prisma.event.createMany({
    data: [
      {
        title: "Sunday Worship Service",
        description: "Join us for a powerful time of worship, praise, and the Word.",
        location: "Main Campus - Lekki",
        startDate: new Date("2026-03-15T08:00:00"),
        endDate: new Date("2026-03-15T10:30:00"),
        isRecurring: true,
        recurrenceRule: "FREQ=WEEKLY;BYDAY=SU",
        createdById: admin.id,
        isPublished: true,
      },
      {
        title: "Youth Conference 2026",
        description: "A 3-day conference for young people to encounter God and discover their purpose.",
        location: "Main Campus - Lekki",
        startDate: new Date("2026-04-10T09:00:00"),
        endDate: new Date("2026-04-12T18:00:00"),
        createdById: admin.id,
        isPublished: true,
      },
      {
        title: "Marriage Enrichment Retreat",
        description: "A weekend retreat for married couples to strengthen their bond and grow together in Christ.",
        location: "La Campagne Tropicana, Ibeju-Lekki",
        startDate: new Date("2026-04-25T10:00:00"),
        endDate: new Date("2026-04-27T16:00:00"),
        createdById: pastor.id,
        isPublished: true,
      },
      {
        title: "Wednesday Bible Study",
        description: "In-depth study of the book of Romans. All are welcome!",
        location: "All Campuses",
        startDate: new Date("2026-03-18T18:30:00"),
        endDate: new Date("2026-03-18T20:00:00"),
        isRecurring: true,
        recurrenceRule: "FREQ=WEEKLY;BYDAY=WE",
        createdById: admin.id,
        isPublished: true,
      },
      {
        title: "Community Outreach Day",
        description: "Join us as we serve our community through food distribution and free medical checkups.",
        location: "Lekki Community Center",
        startDate: new Date("2026-03-29T08:00:00"),
        endDate: new Date("2026-03-29T14:00:00"),
        createdById: admin.id,
        isPublished: true,
      },
    ],
  });
  console.log("Events created");

  // ============================================
  // 6. Groups
  // ============================================
  const groups = await Promise.all(
    [
      {
        name: "Young Adults Fellowship",
        description: "A community for young professionals and students to grow in faith together.",
        category: "Fellowship",
        meetingDay: "Saturday",
        meetingTime: "5:00 PM",
        location: "Main Campus Room 201",
        address: "123 Faith Avenue, Lekki",
        isActive: true,
      },
      {
        name: "Women of Purpose",
        description: "Empowering women to discover and walk in their God-given purpose.",
        category: "Women",
        meetingDay: "Thursday",
        meetingTime: "10:00 AM",
        location: "Main Campus Hall B",
        isActive: true,
      },
      {
        name: "Men of Valor",
        description: "Building men of character, integrity, and spiritual strength.",
        category: "Men",
        meetingDay: "Saturday",
        meetingTime: "7:00 AM",
        location: "Main Campus Hall A",
        isActive: true,
      },
      {
        name: "Prayer Warriors",
        description: "Dedicated to corporate prayer and intercession for the church and nation.",
        category: "Prayer",
        meetingDay: "Tuesday",
        meetingTime: "6:00 AM",
        location: "Prayer Room",
        isActive: true,
      },
      {
        name: "Couples Connect",
        description: "Supporting married couples in building Christ-centered homes.",
        category: "Family",
        meetingDay: "Friday",
        meetingTime: "6:00 PM",
        location: "Main Campus Room 102",
        isActive: true,
      },
    ].map((group) => prisma.group.create({ data: group }))
  );
  console.log(`${groups.length} groups created`);

  // ============================================
  // 7. Donation Categories
  // ============================================
  await prisma.donationCategory.createMany({
    data: [
      { name: "Tithes", description: "Your faithful tithe of 10%" },
      { name: "Offerings", description: "General church offerings" },
      { name: "Building Fund", description: "Contributions towards the new church building" },
      { name: "Missions", description: "Support for missionary work" },
      { name: "Youth Ministry", description: "Funding for youth programs and events" },
      { name: "Benevolence", description: "Help for those in need in our community" },
      { name: "Special Projects", description: "Support for special church projects" },
    ],
  });
  console.log("Donation categories created");

  // ============================================
  // 8. Devotionals
  // ============================================
  await prisma.devotional.createMany({
    data: [
      {
        title: "Trust in the Lord",
        scripture: "Proverbs 3:5-6",
        content: "Trust in the LORD with all your heart and lean not on your own understanding; in all your ways submit to Him, and He will make your paths straight.\n\nToday, let us remember that God's wisdom far surpasses our own. When we face difficult decisions or uncertain circumstances, we can rest in the knowledge that our Father sees the bigger picture. He knows the end from the beginning.\n\nPractical steps for today:\n1. Start your morning by surrendering your plans to God\n2. When faced with a difficult decision, pause and pray before acting\n3. Thank God for His faithfulness in past situations where you trusted Him",
        author: "Pastor David Johnson",
        date: new Date("2026-03-12"),
        isPublished: true,
      },
      {
        title: "Strength in Weakness",
        scripture: "2 Corinthians 12:9-10",
        content: "But He said to me, 'My grace is sufficient for you, for my power is made perfect in weakness.'\n\nGod doesn't call the equipped — He equips the called. Your weakness is not a disqualification; it's an invitation for God's power to work through you.\n\nToday, instead of hiding your struggles, bring them to God. Let His strength be perfected in your weakness.",
        author: "Pastor Mary Bello",
        date: new Date("2026-03-11"),
        isPublished: true,
      },
      {
        title: "Joy in the Journey",
        scripture: "James 1:2-4",
        content: "Consider it pure joy, my brothers and sisters, whenever you face trials of many kinds, because you know that the testing of your faith produces perseverance.\n\nJoy is not the absence of trouble but the presence of God in the midst of it. Every challenge you face is an opportunity for growth and a testimony in the making.\n\nReflection: What trial are you facing today that God might be using to build your character?",
        author: "Pastor Samuel Okafor",
        date: new Date("2026-03-10"),
        isPublished: true,
      },
    ],
  });
  console.log("Devotionals created");

  // ============================================
  // 9. Blog Posts
  // ============================================
  await prisma.blogPost.createMany({
    data: [
      {
        title: "5 Ways to Strengthen Your Prayer Life",
        slug: "5-ways-strengthen-prayer-life",
        content: "Prayer is the foundation of our relationship with God. Here are five practical ways to deepen your prayer life:\n\n1. Set a consistent time and place\n2. Use a prayer journal\n3. Pray Scripture\n4. Practice listening prayer\n5. Pray with others\n\nRemember, prayer is not about perfection — it's about connection with our heavenly Father.",
        excerpt: "Practical tips to deepen your connection with God through prayer.",
        authorId: pastor.id,
        isPublished: true,
        publishedAt: new Date("2026-03-10"),
      },
      {
        title: "Youth Conference 2026: What to Expect",
        slug: "youth-conference-2026-preview",
        content: "We are excited to announce our upcoming Youth Conference! This year's theme is 'Unshakeable' and we have an incredible lineup of speakers, workshops, and worship sessions planned.\n\nDates: April 10-12, 2026\nVenue: Main Campus, Lekki\n\nRegister today!",
        excerpt: "Everything you need to know about our upcoming Youth Conference.",
        authorId: admin.id,
        isPublished: true,
        publishedAt: new Date("2026-03-08"),
      },
    ],
  });
  console.log("Blog posts created");

  // ============================================
  // 10. Bible Versions (just version entries — actual verses would be loaded from an API or file)
  // ============================================
  await prisma.bibleVersion.createMany({
    data: [
      { name: "King James Version", abbreviation: "KJV" },
      { name: "New King James Version", abbreviation: "NKJV" },
      { name: "Amplified Bible", abbreviation: "AMP" },
      { name: "New Living Translation", abbreviation: "NLT" },
      { name: "New International Version", abbreviation: "NIV" },
      { name: "The Message", abbreviation: "MSG" },
      { name: "New Revised Standard Version", abbreviation: "NRSV" },
    ],
  });
  console.log("Bible versions created");

  // ============================================
  // 11. Platform Settings
  // ============================================
  const settings = [
    { key: "church_name", value: "Grace Community Church", description: "Church display name" },
    { key: "default_currency", value: "NGN", description: "Default currency for donations" },
    { key: "min_donation_amount", value: "100", description: "Minimum donation amount in main currency unit" },
    { key: "paystack_live_mode", value: "false", description: "Whether to use Paystack live keys" },
    { key: "enable_livestream", value: "true", description: "Enable/disable livestream feature" },
    { key: "enable_radio", value: "true", description: "Enable/disable radio feature" },
    { key: "enable_social_wall", value: "true", description: "Enable/disable community social wall" },
    { key: "enable_private_messaging", value: "true", description: "Enable/disable private messaging" },
    { key: "max_upload_size_mb", value: "100", description: "Maximum file upload size in MB" },
    { key: "supported_audio_formats", value: JSON.stringify(["mp3", "aac", "m4a"]), description: "Supported audio formats" },
    { key: "announcement_banner", value: "", description: "Homepage announcement banner text" },
  ];

  for (const setting of settings) {
    await prisma.platformSetting.upsert({
      where: { key: setting.key },
      update: { value: setting.value as any },
      create: {
        key: setting.key,
        value: setting.value as any,
        description: setting.description,
      },
    });
  }
  console.log("Platform settings created");

  // ============================================
  // 12. Sample Gallery
  // ============================================
  const album = await prisma.galleryAlbum.create({
    data: {
      title: "Sunday Service - March 2026",
      description: "Photos from our Sunday worship services in March 2026.",
    },
  });
  console.log("Gallery album created");

  // ============================================
  // 13. Sample Livestream
  // ============================================
  await prisma.livestream.create({
    data: {
      title: "Sunday Worship Service",
      description: "Join us live every Sunday for our worship service.",
      streamUrl: "https://www.youtube.com/embed/live_stream?channel=YOUR_CHANNEL",
      streamType: "youtube",
      isLive: false,
    },
  });
  console.log("Livestream configured");

  // ============================================
  // 14. Radio Channels
  // ============================================
  await prisma.radioChannel.createMany({
    data: [
      {
        name: "Grace FM",
        description: "24/7 worship music and sermons",
        streamUrl: "https://stream.example.com/gracefm",
        isActive: true,
      },
      {
        name: "Prayer Radio",
        description: "Continuous prayer and intercession broadcasts",
        streamUrl: "https://stream.example.com/prayerradio",
        isActive: true,
      },
    ],
  });
  console.log("Radio channels created");

  console.log("\n✅ Database seeded successfully!");
  console.log("\n📧 Login credentials:");
  console.log("  Admin: admin@mychurchapp.com / admin123");
  console.log("  Pastor: pastor@mychurchapp.com / pastor123");
  console.log("  Member: john@example.com / member123");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
