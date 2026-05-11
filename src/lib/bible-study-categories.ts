export const BIBLE_STUDY_CATEGORIES = [
  { key: "weekly", label: "Weekly Study", icon: "📅", description: "Pastor's curated weekly Bible study" },
  { key: "old_testament", label: "Old Testament", icon: "📜", description: "Genesis through Malachi" },
  { key: "new_testament", label: "New Testament", icon: "✝️", description: "Matthew through Revelation" },
  { key: "doctrine", label: "Doctrine & Theology", icon: "📖", description: "Deep dives on faith fundamentals" },
  { key: "qa", label: "Q&A", icon: "❓", description: "Ask the church family" },
  { key: "testimonies", label: "Testimonies", icon: "🙏", description: "Share what God has done" },
  { key: "prayer_requests", label: "Prayer Requests", icon: "🕊️", description: "Bear one another's burdens" },
  { key: "general", label: "General", icon: "💬", description: "Open discussion" },
];

export const BIBLE_STUDY_CATEGORY_KEYS = BIBLE_STUDY_CATEGORIES.map((c) => c.key);

export function getCategoryLabel(key: string): string {
  return BIBLE_STUDY_CATEGORIES.find((c) => c.key === key)?.label || key;
}

export function getCategoryIcon(key: string): string {
  return BIBLE_STUDY_CATEGORIES.find((c) => c.key === key)?.icon || "💬";
}
