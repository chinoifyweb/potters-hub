import type {
  User,
  Account,
  Session,
  VerificationToken,
  ChurchProfile,
  ChurchBranch,
  Sermon,
  SermonCategory,
  Livestream,
  RadioChannel,
  BibleVersion,
  BibleBook,
  BibleChapter,
  BibleVerse,
  BibleBookmark,
  Event,
  EventRsvp,
  Group,
  GroupMember,
  DonationCategory,
  Donation,
  RecurringDonation,
  Post,
  PostComment,
  PostLike,
  Conversation,
  ConversationParticipant,
  Message,
  Devotional,
  Note,
  Notification,
  PushToken,
  Campaign,
  MemberList,
  MemberListEntry,
  BlogPost,
  GalleryAlbum,
  GalleryPhoto,
  PlatformSetting,
  UserRole,
  PostType,
  DonationStatus,
  DonationInterval,
  RecurringDonationStatus,
  CampaignType,
  CampaignStatus,
  StreamType,
  RsvpStatus,
  GroupMemberRole,
  Testament,
} from "@prisma/client"

// Re-export all Prisma types
export type {
  User,
  Account,
  Session,
  VerificationToken,
  ChurchProfile,
  ChurchBranch,
  Sermon,
  SermonCategory,
  Livestream,
  RadioChannel,
  BibleVersion,
  BibleBook,
  BibleChapter,
  BibleVerse,
  BibleBookmark,
  Event,
  EventRsvp,
  Group,
  GroupMember,
  DonationCategory,
  Donation,
  RecurringDonation,
  Post,
  PostComment,
  PostLike,
  Conversation,
  ConversationParticipant,
  Message,
  Devotional,
  Note,
  Notification,
  PushToken,
  Campaign,
  MemberList,
  MemberListEntry,
  BlogPost,
  GalleryAlbum,
  GalleryPhoto,
  PlatformSetting,
  UserRole,
  PostType,
  DonationStatus,
  DonationInterval,
  RecurringDonationStatus,
  CampaignType,
  CampaignStatus,
  StreamType,
  RsvpStatus,
  GroupMemberRole,
  Testament,
}

// ---- NextAuth type extensions ----

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      image?: string | null
      role: string
    }
  }

  interface User {
    role?: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: string
  }
}

// ---- UI & Navigation types ----

export interface NavItem {
  title: string
  href: string
  icon?: string
  badge?: string | number
  disabled?: boolean
  children?: NavItem[]
}

export interface SidebarNavItem extends NavItem {
  section?: string
}

export interface BreadcrumbItem {
  title: string
  href?: string
}

// ---- Dashboard stats ----

export interface DashboardStats {
  totalMembers: number
  totalSermons: number
  totalEvents: number
  totalDonations: number
  recentDonationsAmount: number
  activeGroups: number
  upcomingEvents: number
  pendingCampaigns: number
}

export interface DonationStats {
  totalAmount: number
  totalCount: number
  averageAmount: number
  byCategory: Array<{
    categoryName: string
    amount: number
    count: number
  }>
  byMonth: Array<{
    month: string
    amount: number
    count: number
  }>
}

export interface MemberStats {
  totalMembers: number
  newThisMonth: number
  activeMembers: number
  byRole: Record<string, number>
  byMonth: Array<{
    month: string
    count: number
  }>
}

// ---- API response types ----

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
  hasMore: boolean
}

export interface PaginationParams {
  page?: number
  pageSize?: number
  search?: string
  sortBy?: string
  sortOrder?: "asc" | "desc"
}

// ---- Sermon with relations ----

export interface SermonWithDetails extends Sermon {
  categories: Array<{
    category: SermonCategory
  }>
  notes: Note[]
  _count?: {
    notes: number
  }
}

// ---- Event with relations ----

export interface EventWithDetails extends Event {
  createdBy: Pick<User, "id" | "fullName" | "avatarUrl">
  rsvps: Array<EventRsvp & { user: Pick<User, "id" | "fullName" | "avatarUrl"> }>
  _count?: {
    rsvps: number
  }
}

// ---- Post with relations ----

export interface PostWithDetails extends Post {
  user: Pick<User, "id" | "fullName" | "avatarUrl" | "role">
  comments: Array<
    PostComment & {
      user: Pick<User, "id" | "fullName" | "avatarUrl">
    }
  >
  likes: PostLike[]
  _count?: {
    comments: number
    likes: number
  }
}

// ---- Group with relations ----

export interface GroupWithDetails extends Group {
  members: Array<
    GroupMember & {
      user: Pick<User, "id" | "fullName" | "avatarUrl">
    }
  >
  _count?: {
    members: number
  }
}

// ---- Conversation with relations ----

export interface ConversationWithDetails extends Conversation {
  participants: Array<
    ConversationParticipant & {
      user: Pick<User, "id" | "fullName" | "avatarUrl">
    }
  >
  messages: Array<
    Message & {
      sender: Pick<User, "id" | "fullName" | "avatarUrl">
    }
  >
}

// ---- Donation with relations ----

export interface DonationWithDetails extends Donation {
  user: Pick<User, "id" | "fullName" | "email"> | null
  category: DonationCategory | null
}

// ---- Blog post with author ----

export interface BlogPostWithAuthor extends BlogPost {
  author: Pick<User, "id" | "fullName" | "avatarUrl">
}

// ---- Gallery album with photos ----

export interface GalleryAlbumWithPhotos extends GalleryAlbum {
  photos: Array<
    GalleryPhoto & {
      uploadedBy: Pick<User, "id" | "fullName">
    }
  >
  _count?: {
    photos: number
  }
}

// ---- Bible reading types ----

export interface BibleReading {
  version: string
  book: string
  chapter: number
  verses: Array<{
    number: number
    text: string
  }>
}

// ---- Form state type ----

export interface FormState {
  isLoading: boolean
  error: string | null
  success: boolean
}

// ---- Select option type ----

export interface SelectOption {
  label: string
  value: string
}

// ---- File upload types ----

export interface UploadedFile {
  name: string
  size: number
  type: string
  url: string
  path: string
}

// ---- Paystack webhook event types ----

export interface PaystackWebhookEvent {
  event: string
  data: {
    id: number
    reference: string
    amount: number
    currency: string
    status: string
    customer: {
      id: number
      email: string
      first_name: string | null
      last_name: string | null
    }
    metadata: Record<string, any>
    plan?: {
      plan_code: string
    }
    subscription_code?: string
    [key: string]: any
  }
}
