export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  title: string;
  company: string;
  location: string;
  bio: string;
  expertise: string[];
  joinDate: string;
  isVerified: boolean;
}

export interface PostAttachment {
  id: string;
  type: 'image' | 'chart' | 'graph' | 'document';
  url: string;
  name: string;
  size?: number;
}

export interface ChartData {
  type: 'line' | 'bar' | 'pie' | 'area';
  title: string;
  data: any[];
  xAxis?: string;
  yAxis?: string;
  description?: string;
}

export interface Post {
  id: string;
  author: UserProfile;
  content: string;
  type: 'method' | 'question' | 'graph' | 'general' | 'discussion';
  tags: string[];
  attachments: PostAttachment[];
  chartData?: ChartData;
  likes: number;
  comments: number;
  views: number;
  bookmarks: number;
  shares: number;
  timestamp: string;
  isLiked: boolean;
  isBookmarked: boolean;
  replies: Reply[];
  isAnonymous: boolean;
  location?: string;
  temperature?: number;
  dyeingMethod?: string;
  fabricType?: string;
  likedBy?: string[];
  bookmarkedBy?: string[];
}

export interface Reply {
  id: string;
  author: UserProfile;
  content: string;
  timestamp: string;
  likes: number;
  isLiked: boolean;
  attachments?: PostAttachment[];
  isAnonymous: boolean;
}

export interface CommunityStats {
  totalPosts: number;
  totalMembers: number;
  activeToday: number;
  totalLikes: number;
  totalShares: number;
  topContributors: UserProfile[];
  trendingTags: { tag: string; count: number }[];
}

export const POST_TYPES = [
  { value: 'general', label: 'General Discussion', icon: 'MessageCircle' },
  { value: 'method', label: 'Dyeing Method', icon: 'Lightbulb' },
  { value: 'question', label: 'Question/Help', icon: 'HelpCircle' },
  { value: 'graph', label: 'Data/Analytics', icon: 'BarChart3' },
  { value: 'discussion', label: 'Technical Discussion', icon: 'Users' },
] as const;

export const EXPERTISE_AREAS = [
  'Reactive Dyeing',
  'Disperse Dyeing',
  'Acid Dyeing',
  'Direct Dyeing',
  'Vat Dyeing',
  'Pigment Dyeing',
  'Cotton Processing',
  'Polyester Processing',
  'Silk Processing',
  'Wool Processing',
  'Color Matching',
  'Quality Control',
  'Sustainability',
  'Process Optimization',
  'Chemical Analysis',
  'Textile Testing',
  'Production Management',
  'Research & Development',
] as const;