import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, 
  Heart, 
  Share2, 
  Send, 
  UserPlus, 
  Search, 
  TrendingUp, 
  Hash, 
  Image as ImageIcon, 
  Video, 
  Smile,
  Plus,
  Filter,
  Bookmark,
  BookmarkCheck,
  Eye,
  MoreHorizontal,
  Loader2,
  Users,
  BarChart3,
  Lightbulb,
  HelpCircle,
  Clock
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { CreatePostDialog } from '../components/CreatePostDialog';
import { ChartVisualization } from '../components/ChartVisualization';
import { Post, UserProfile, POST_TYPES, Reply } from '../types/social';
import { db } from '../lib/firebaseConfig';
import { 
  collection, 
  addDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  updateDoc, 
  doc, 
  arrayUnion, 
  arrayRemove, 
  increment,
  serverTimestamp,
  where,
  limit
} from 'firebase/firestore';
import { useToast } from '../components/ui/ToastProvider';
import * as Select from '@radix-ui/react-select';

interface SocialPortalProps {
  user?: any;
}

export function SocialPortal({ user }: SocialPortalProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'popular'>('recent');
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [trendingTags, setTrendingTags] = useState<{ tag: string; count: number }[]>([]);
  const [communityStats, setCommunityStats] = useState({
    totalPosts: 0,
    totalMembers: 0,
    activeToday: 0
  });

  const { showToast } = useToast();

  // Create user profile from Firebase auth user
  const userProfile: UserProfile = user ? {
    id: user.uid,
    name: user.displayName || user.email?.split('@')[0] || 'Anonymous User',
    email: user.email || '',
    avatar: user.photoURL || `https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face`,
    title: 'Community Member',
    company: '',
    location: '',
    bio: '',
    expertise: [],
    joinDate: user.metadata?.creationTime || new Date().toISOString(),
    isVerified: false
  } : {
    id: 'guest',
    name: 'Guest User',
    email: '',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face',
    title: 'Guest',
    company: '',
    location: '',
    bio: '',
    expertise: [],
    joinDate: new Date().toISOString(),
    isVerified: false
  };

  // Fetch posts from global collection
  useEffect(() => {
    const postsRef = collection(db, 'socialPosts');
    const q = query(postsRef, orderBy('timestamp', 'desc'), limit(50));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedPosts: Post[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate?.()?.toISOString() || doc.data().timestamp
      })) as Post[];
      
      setPosts(fetchedPosts);
      setLoading(false);
      
      // Calculate community stats
      setCommunityStats({
        totalPosts: fetchedPosts.length,
        totalMembers: new Set(fetchedPosts.map(p => p.author.id)).size,
        activeToday: fetchedPosts.filter(p => {
          const postDate = new Date(p.timestamp);
          const today = new Date();
          return postDate.toDateString() === today.toDateString();
        }).length
      });

      // Calculate trending tags
      const tagCounts: Record<string, number> = {};
      fetchedPosts.forEach(post => {
        post.tags.forEach(tag => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      });
      
      const trending = Object.entries(tagCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([tag, count]) => ({ tag, count }));
      
      setTrendingTags(trending);
    }, (error) => {
      console.error('Error fetching posts:', error);
      showToast({
        message: 'Error loading posts. Please try again.',
        type: 'error'
      });
      setLoading(false);
    });

    return () => unsubscribe();
  }, [showToast]);

  // Filter and sort posts
  const filteredPosts = posts
    .filter(post => {
      const matchesSearch = searchTerm === '' || 
        post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.author.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesType = filterType === 'all' || post.type === filterType;
      
      return matchesSearch && matchesType;
    })
    .sort((a, b) => {
      if (sortBy === 'popular') {
        return (b.likes + b.comments + b.shares) - (a.likes + a.comments + a.shares);
      }
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });

  const handleCreatePost = async (postData: Omit<Post, 'id' | 'timestamp' | 'likes' | 'comments' | 'views' | 'bookmarks' | 'shares' | 'isLiked' | 'isBookmarked' | 'replies'>) => {
    if (!user && !postData.isAnonymous) {
      showToast({
        message: 'Please log in to create posts',
        type: 'error'
      });
      return;
    }

    try {
      const newPost = {
        ...postData,
        timestamp: serverTimestamp(),
        likes: 0,
        comments: 0,
        views: 0,
        bookmarks: 0,
        shares: 0,
        isLiked: false,
        isBookmarked: false,
        replies: [],
        likedBy: [],
        bookmarkedBy: []
      };

      await addDoc(collection(db, 'socialPosts'), newPost);
      
      showToast({
        message: 'Post created successfully!',
        type: 'success'
      });
    } catch (error) {
      console.error('Error creating post:', error);
      showToast({
        message: 'Error creating post. Please try again.',
        type: 'error'
      });
    }
  };

  const handleLikePost = async (postId: string, isCurrentlyLiked: boolean) => {
    if (!user) {
      showToast({
        message: 'Please log in to like posts',
        type: 'error'
      });
      return;
    }

    try {
      const postRef = doc(db, 'socialPosts', postId);
      
      if (isCurrentlyLiked) {
        await updateDoc(postRef, {
          likes: increment(-1),
          likedBy: arrayRemove(user.uid)
        });
      } else {
        await updateDoc(postRef, {
          likes: increment(1),
          likedBy: arrayUnion(user.uid)
        });
      }
    } catch (error) {
      console.error('Error updating like:', error);
      showToast({
        message: 'Error updating like. Please try again.',
        type: 'error'
      });
    }
  };

  const handleBookmarkPost = async (postId: string, isCurrentlyBookmarked: boolean) => {
    if (!user) {
      showToast({
        message: 'Please log in to bookmark posts',
        type: 'error'
      });
      return;
    }

    try {
      const postRef = doc(db, 'socialPosts', postId);
      
      if (isCurrentlyBookmarked) {
        await updateDoc(postRef, {
          bookmarks: increment(-1),
          bookmarkedBy: arrayRemove(user.uid)
        });
      } else {
        await updateDoc(postRef, {
          bookmarks: increment(1),
          bookmarkedBy: arrayUnion(user.uid)
        });
      }
    } catch (error) {
      console.error('Error updating bookmark:', error);
      showToast({
        message: 'Error updating bookmark. Please try again.',
        type: 'error'
      });
    }
  };

  const handleReply = async (postId: string) => {
    if (!user) {
      showToast({
        message: 'Please log in to reply to posts',
        type: 'error'
      });
      return;
    }

    if (!replyContent.trim()) return;

    try {
      const reply: Reply = {
        id: Date.now().toString(),
        author: userProfile,
        content: replyContent,
        timestamp: new Date().toISOString(),
        likes: 0,
        isLiked: false,
        isAnonymous: false
      };

      const postRef = doc(db, 'socialPosts', postId);
      await updateDoc(postRef, {
        replies: arrayUnion(reply),
        comments: increment(1)
      });

      setReplyContent('');
      setReplyingTo(null);
      
      showToast({
        message: 'Reply added successfully!',
        type: 'success'
      });
    } catch (error) {
      console.error('Error adding reply:', error);
      showToast({
        message: 'Error adding reply. Please try again.',
        type: 'error'
      });
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInHours * 60);
      return `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  const getPostTypeIcon = (type: string) => {
    switch (type) {
      case 'method': return <Lightbulb className="h-4 w-4" />;
      case 'question': return <HelpCircle className="h-4 w-4" />;
      case 'graph': return <BarChart3 className="h-4 w-4" />;
      case 'discussion': return <Users className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  const PostCard = ({ post }: { post: Post }) => {
    const isLiked = user && post.likedBy?.includes(user.uid);
    const isBookmarked = user && post.bookmarkedBy?.includes(user.uid);

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-xl shadow-sm border border-border p-6 mb-6 hover:shadow-md transition-all duration-300"
      >
        {/* Post Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Avatar className="h-12 w-12 border-2 border-primary/20">
              <AvatarImage src={post.author.avatar} alt={post.author.name} />
              <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-semibold text-foreground">{post.author.name}</p>
                {post.author.isVerified && (
                  <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                    <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>{post.author.title}</span>
                <span>•</span>
                <span>{formatTimestamp(post.timestamp)}</span>
                <span>•</span>
                <div className="flex items-center gap-1">
                  {getPostTypeIcon(post.type)}
                  <span className="capitalize">{post.type}</span>
                </div>
              </div>
            </div>
          </div>
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>

        {/* Post Content */}
        <div className="mb-4">
          <p className="text-foreground leading-relaxed whitespace-pre-wrap">{post.content}</p>
          
          {/* Additional Method Details */}
          {post.type === 'method' && (
            <div className="mt-4 p-4 bg-muted/30 rounded-lg border border-border">
              <div className="grid grid-cols-2 gap-4 text-sm">
                {post.temperature && (
                  <div>
                    <span className="font-medium text-muted-foreground">Temperature:</span>
                    <span className="ml-2 text-foreground">{post.temperature}°C</span>
                  </div>
                )}
                {post.location && (
                  <div>
                    <span className="font-medium text-muted-foreground">Location:</span>
                    <span className="ml-2 text-foreground">{post.location}</span>
                  </div>
                )}
                {post.dyeingMethod && (
                  <div>
                    <span className="font-medium text-muted-foreground">Method:</span>
                    <span className="ml-2 text-foreground">{post.dyeingMethod}</span>
                  </div>
                )}
                {post.fabricType && (
                  <div>
                    <span className="font-medium text-muted-foreground">Fabric:</span>
                    <span className="ml-2 text-foreground">{post.fabricType}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {post.tags.map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary cursor-pointer hover:bg-primary/20 transition-colors"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Attachments */}
        {post.attachments.length > 0 && (
          <div className="mb-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {post.attachments.map((attachment) => (
                <div key={attachment.id} className="relative group">
                  {attachment.type === 'image' ? (
                    <img
                      src={attachment.url}
                      alt={attachment.name}
                      className="w-full h-32 object-cover rounded-lg border border-border cursor-pointer hover:opacity-90 transition-opacity"
                    />
                  ) : (
                    <div className="w-full h-32 bg-muted rounded-lg border border-border flex items-center justify-center">
                      <div className="text-center">
                        <ImageIcon className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-xs text-muted-foreground">{attachment.name}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Chart Visualization */}
        {post.chartData && (
          <div className="mb-4">
            <ChartVisualization chartData={post.chartData} />
          </div>
        )}

        {/* Post Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div className="flex items-center space-x-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleLikePost(post.id, isLiked || false)}
              className={`flex items-center gap-2 ${isLiked ? 'text-red-500' : 'text-muted-foreground hover:text-red-500'} transition-colors`}
            >
              <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
              <span>{post.likes}</span>
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setReplyingTo(replyingTo === post.id ? null : post.id)}
              className="flex items-center gap-2 text-muted-foreground hover:text-blue-500 transition-colors"
            >
              <MessageSquare className="h-4 w-4" />
              <span>{post.comments}</span>
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-2 text-muted-foreground hover:text-green-500 transition-colors"
            >
              <Share2 className="h-4 w-4" />
              <span>{post.shares}</span>
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleBookmarkPost(post.id, isBookmarked || false)}
              className={`flex items-center gap-2 ${isBookmarked ? 'text-yellow-500' : 'text-muted-foreground hover:text-yellow-500'} transition-colors`}
            >
              {isBookmarked ? <BookmarkCheck className="h-4 w-4 fill-current" /> : <Bookmark className="h-4 w-4" />}
            </Button>
          </div>
          
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Eye className="h-3 w-3" />
            <span>{post.views} views</span>
          </div>
        </div>

        {/* Reply Section */}
        <AnimatePresence>
          {replyingTo === post.id && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 pt-4 border-t border-border"
            >
              <div className="flex gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={userProfile.avatar} alt={userProfile.name} />
                  <AvatarFallback>{userProfile.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <textarea
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="Write a reply..."
                    className="w-full p-3 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 resize-none"
                    rows={3}
                  />
                  <div className="flex justify-end gap-2 mt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setReplyingTo(null);
                        setReplyContent('');
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleReply(post.id)}
                      disabled={!replyContent.trim()}
                    >
                      <Send className="h-3 w-3 mr-1" />
                      Reply
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Existing Replies */}
        {post.replies && post.replies.length > 0 && (
          <div className="mt-4 pt-4 border-t border-border space-y-3">
            {post.replies.slice(0, 3).map((reply) => (
              <div key={reply.id} className="flex gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={reply.author.avatar} alt={reply.author.name} />
                  <AvatarFallback>{reply.author.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 bg-muted/30 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm text-foreground">{reply.author.name}</span>
                    <span className="text-xs text-muted-foreground">{formatTimestamp(reply.timestamp)}</span>
                  </div>
                  <p className="text-sm text-foreground">{reply.content}</p>
                </div>
              </div>
            ))}
            {post.replies.length > 3 && (
              <Button variant="ghost" size="sm" className="text-primary">
                View {post.replies.length - 3} more replies
              </Button>
            )}
          </div>
        )}
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Textile Social Portal</h1>
              <p className="text-sm text-muted-foreground">Connect, share, and learn with textile professionals worldwide</p>
            </div>
            <Button
              onClick={() => setIsCreatePostOpen(true)}
              className="bg-primary hover:bg-primary/90 text-primary-foreground flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Create Post
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Filters and Search */}
            <div className="bg-card rounded-lg border border-border p-4 mb-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    type="text"
                    placeholder="Search posts, users, or topics..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Select.Root value={filterType} onValueChange={setFilterType}>
                  <Select.Trigger className="flex items-center justify-between w-48 rounded-md border border-border shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20 bg-background text-foreground py-2 px-3">
                    <Select.Value placeholder="All Types" />
                    <Select.Icon>
                      <Filter className="h-4 w-4" />
                    </Select.Icon>
                  </Select.Trigger>
                  <Select.Portal>
                    <Select.Content className="overflow-hidden rounded-lg bg-card border border-border shadow-lg z-50">
                      <Select.Viewport className="p-1">
                        <Select.Item value="all" className="relative flex items-center rounded-md py-2 pl-3 pr-9 text-foreground text-sm outline-none data-[highlighted]:bg-primary/20">
                          <Select.ItemText>All Types</Select.ItemText>
                        </Select.Item>
                        {POST_TYPES.map(type => (
                          <Select.Item key={type.value} value={type.value} className="relative flex items-center rounded-md py-2 pl-3 pr-9 text-foreground text-sm outline-none data-[highlighted]:bg-primary/20">
                            <Select.ItemText>{type.label}</Select.ItemText>
                          </Select.Item>
                        ))}
                      </Select.Viewport>
                    </Select.Content>
                  </Select.Portal>
                </Select.Root>

                <Select.Root value={sortBy} onValueChange={(value) => setSortBy(value as 'recent' | 'popular')}>
                  <Select.Trigger className="flex items-center justify-between w-32 rounded-md border border-border shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20 bg-background text-foreground py-2 px-3">
                    <Select.Value />
                    <Select.Icon>
                      <TrendingUp className="h-4 w-4" />
                    </Select.Icon>
                  </Select.Trigger>
                  <Select.Portal>
                    <Select.Content className="overflow-hidden rounded-lg bg-card border border-border shadow-lg z-50">
                      <Select.Viewport className="p-1">
                        <Select.Item value="recent" className="relative flex items-center rounded-md py-2 pl-3 pr-9 text-foreground text-sm outline-none data-[highlighted]:bg-primary/20">
                          <Select.ItemText>Recent</Select.ItemText>
                        </Select.Item>
                        <Select.Item value="popular" className="relative flex items-center rounded-md py-2 pl-3 pr-9 text-foreground text-sm outline-none data-[highlighted]:bg-primary/20">
                          <Select.ItemText>Popular</Select.ItemText>
                        </Select.Item>
                      </Select.Viewport>
                    </Select.Content>
                  </Select.Portal>
                </Select.Root>
              </div>
            </div>

            {/* Posts Feed */}
            <div>
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                  <p className="text-lg font-medium text-foreground">Loading posts...</p>
                  <p className="text-sm text-muted-foreground">Connecting to the textile community</p>
                </div>
              ) : filteredPosts.length === 0 ? (
                <div className="text-center py-12">
                  <MessageSquare className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <p className="text-lg font-medium text-foreground">
                    {searchTerm || filterType !== 'all' ? 'No posts found' : 'No posts yet'}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {searchTerm || filterType !== 'all' 
                      ? 'Try adjusting your search or filters' 
                      : 'Be the first to share something with the community!'
                    }
                  </p>
                  {!searchTerm && filterType === 'all' && (
                    <Button
                      onClick={() => setIsCreatePostOpen(true)}
                      className="mt-4 bg-primary hover:bg-primary/90 text-primary-foreground"
                    >
                      Create First Post
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  {filteredPosts.map((post) => (
                    <PostCard key={post.id} post={post} />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Community Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card rounded-lg border border-border p-6"
            >
              <h3 className="font-semibold text-lg text-foreground mb-4 flex items-center">
                <BarChart3 className="h-5 w-5 mr-2 text-primary" />
                Community Stats
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Posts</span>
                  <span className="font-medium text-foreground">{communityStats.totalPosts}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Members</span>
                  <span className="font-medium text-foreground">{communityStats.totalMembers}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Active Today</span>
                  <span className="font-medium text-foreground">{communityStats.activeToday}</span>
                </div>
              </div>
            </motion.div>

            {/* Trending Topics */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-card rounded-lg border border-border p-6"
            >
              <h3 className="font-semibold text-lg text-foreground mb-4 flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-orange-500" />
                Trending Topics
              </h3>
              <div className="space-y-3">
                {trendingTags.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No trending topics yet</p>
                ) : (
                  trendingTags.slice(0, 8).map((topic) => (
                    <div
                      key={topic.tag}
                      className="flex justify-between items-center cursor-pointer hover:bg-muted/30 p-2 rounded transition-colors"
                      onClick={() => setSearchTerm(topic.tag)}
                    >
                      <span className="text-sm font-medium text-foreground flex items-center">
                        <Hash className="h-3 w-3 mr-1 text-muted-foreground" />
                        {topic.tag}
                      </span>
                      <span className="text-xs text-muted-foreground">{topic.count}</span>
                    </div>
                  ))
                )}
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-card rounded-lg border border-border p-6"
            >
              <h3 className="font-semibold text-lg text-foreground mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Button
                  onClick={() => setIsCreatePostOpen(true)}
                  variant="outline"
                  className="w-full justify-start"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Post
                </Button>
                <Button
                  onClick={() => setFilterType('method')}
                  variant="outline"
                  className="w-full justify-start"
                >
                  <Lightbulb className="h-4 w-4 mr-2" />
                  Browse Methods
                </Button>
                <Button
                  onClick={() => setFilterType('question')}
                  variant="outline"
                  className="w-full justify-start"
                >
                  <HelpCircle className="h-4 w-4 mr-2" />
                  View Questions
                </Button>
                <Button
                  onClick={() => setFilterType('graph')}
                  variant="outline"
                  className="w-full justify-start"
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Data & Analytics
                </Button>
              </div>
            </motion.div>

            {/* Recent Activity */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-card rounded-lg border border-border p-6"
            >
              <h3 className="font-semibold text-lg text-foreground mb-4 flex items-center">
                <Clock className="h-5 w-5 mr-2 text-blue-500" />
                Recent Activity
              </h3>
              <div className="space-y-3">
                {posts.slice(0, 5).map((post) => (
                  <div key={post.id} className="text-sm">
                    <p className="text-foreground font-medium truncate">{post.author.name}</p>
                    <p className="text-muted-foreground text-xs truncate">{post.content.substring(0, 50)}...</p>
                    <p className="text-muted-foreground text-xs">{formatTimestamp(post.timestamp)}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Create Post Dialog */}
      <CreatePostDialog
        isOpen={isCreatePostOpen}
        onClose={() => setIsCreatePostOpen(false)}
        onCreatePost={handleCreatePost}
        userProfile={userProfile}
      />
    </div>
  );
}