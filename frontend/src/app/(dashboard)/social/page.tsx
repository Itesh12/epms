'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Plus, 
  MoreHorizontal, 
  Pin, 
  Trash2, 
  Image as ImageIcon, 
  Video, 
  MessageCircle, 
  Send,
  Loader2,
  Sparkles,
  Trophy,
  PartyPopper,
  Quote,
  Link,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  ExternalLink,
  Heart,
  Rocket,
  Coffee,
  XCircle,
  Hash,
  AtSign,
  TrendingUp,
  Cake,
  Calendar,
  Zap,
  Globe,
  Bell
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store/useAuthStore';
import api from '@/services/api';
import { toast } from 'react-hot-toast';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';

type SocialPostType = 'USER' | 'WIN' | 'ANNIVERSARY' | 'NEW_HIRE';

interface Post {
  _id: string;
  authorId: {
    _id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
    role: string;
  };
  content: string;
  type: SocialPostType;
  mediaUrls: string[];
  isPinned: boolean;
  reactions: Record<string, string[]>;
  createdAt: string;
}

interface Comment {
  _id: string;
  authorId: {
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  content: string;
  createdAt: string;
}

export default function SocialWallPage() {
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === 'ADMIN';

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newContent, setNewContent] = useState('');
  const [mediaLink, setMediaLink] = useState('');
  const [showMediaInput, setShowMediaInput] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'MENTIONS' | 'PINNED'>('ALL');
  
  // Tagging State
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentionType, setMentionType] = useState<'USER' | 'PROJECT' | null>(null);
  const [mentionResults, setMentionResults] = useState<any[]>([]);
  const [mentionIndex, setMentionIndex] = useState(0);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  // Comments state
  const [activeComments, setActiveComments] = useState<Record<string, Comment[]>>({});
  const [commentLoading, setCommentLoading] = useState<Record<string, boolean>>({});

  // Audio refs
  const audioRefs = useRef<Record<string, HTMLAudioElement | null>>({});

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/social/posts');
      setPosts(res.data);
    } catch (error) {
      toast.error('Could not sync social feed');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
    // Preload audio
    const sounds = {
      LOVE: 'https://assets.mixkit.co/sfx/preview/mixkit-bright-button-tone-2555.mp3',
      ROCKET: 'https://assets.mixkit.co/sfx/preview/mixkit-fast-rocket-whoosh-1714.mp3',
      CLAP: 'https://assets.mixkit.co/sfx/preview/mixkit-clapping-male-crowd-495.mp3',
      COFFEE: 'https://assets.mixkit.co/sfx/preview/mixkit-cup-mug-on-saucer-hit-2190.mp3'
    };
    Object.entries(sounds).forEach(([k, v]) => {
      audioRefs.current[k] = new Audio(v);
      audioRefs.current[k]!.volume = 0.3;
    });
  }, [fetchPosts]);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim()) return;

    try {
      const data = {
        content: newContent,
        mediaUrls: mediaLink ? [mediaLink] : [],
        type: 'USER'
      };
      await api.post('/social/posts', data);
      setNewContent('');
      setMediaLink('');
      setShowMediaInput(false);
      setIsCreating(false);
      toast.success('Broadcast manifested successfully');
      fetchPosts();
    } catch (error) {
      toast.error('Failed to post update');
    }
  };

  const playReactionSound = (type: string) => {
    const audio = audioRefs.current[type];
    if (audio) {
      audio.currentTime = 0;
      audio.play().catch(() => {});
    }
  };

  const handleToggleReaction = async (postId: string, type: string) => {
    try {
      playReactionSound(type);
      await api.post(`/social/posts/${postId}/react/${type}`, {});
      // Optimistic update
      setPosts(prev => prev.map(p => {
        if (p._id === postId) {
          const currentReactions = { ...p.reactions };
          const userIds = [...(currentReactions[type] || [])];
          const index = userIds.indexOf(user?.id || '');
          if (index > -1) {
             userIds.splice(index, 1);
          } else {
             userIds.push(user?.id || '');
          }
          currentReactions[type] = userIds;
          return { ...p, reactions: currentReactions };
        }
        return p;
      }));
    } catch (error) {
      toast.error('Reaction failed');
    }
  };

  const handleMentionInput = async (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setNewContent(val);
    
    const cursor = e.target.selectionStart;
    const textBeforeCursor = val.slice(0, cursor);
    const lastAt = textBeforeCursor.lastIndexOf('@');
    const lastHash = textBeforeCursor.lastIndexOf('#');
    
    const relevantTag = Math.max(lastAt, lastHash);
    if (relevantTag > -1 && relevantTag >= textBeforeCursor.lastIndexOf(' ')) {
      const type = textBeforeCursor[relevantTag] === '@' ? 'USER' : 'PROJECT';
      const query = textBeforeCursor.slice(relevantTag + 1);
      setMentionType(type);
      setMentionQuery(query);
      
      const endpoint = type === 'USER' ? '/social/search/users' : '/social/search/projects';
      try {
        const res = await api.get(`${endpoint}?q=${query}`);
        setMentionResults(res.data);
      } catch (err) {}
    } else {
      setMentionType(null);
      setMentionResults([]);
    }
  };

  const completeMention = (selected: any) => {
    const name = mentionType === 'USER' ? `${selected.firstName} ${selected.lastName}` : selected.name;
    const textBeforeMention = newContent.slice(0, newContent.lastIndexOf(mentionType === 'USER' ? '@' : '#'));
    const textAfterMention = newContent.slice(textAreaRef.current?.selectionStart || 0);
    
    setNewContent(`${textBeforeMention}${mentionType === 'USER' ? '@' : '#'}${name} ${textAfterMention}`);
    setMentionType(null);
    setMentionResults([]);
    textAreaRef.current?.focus();
  };

  const handleDeletePost = async (id: string) => {
    if (!confirm('Permanently remove this update?')) return;
    try {
      await api.delete(`/social/posts/${id}`);
      toast.success('Post removed');
      fetchPosts();
    } catch (error) {
      toast.error('Delete failed');
    }
  };

  const handleTogglePin = async (id: string) => {
    try {
      await api.patch(`/social/posts/${id}/pin`, {});
      toast.success('Priority status updated');
      fetchPosts();
    } catch (error) {
      toast.error('Pin operation failed');
    }
  };

  const toggleComments = async (postId: string) => {
    if (activeComments[postId]) {
      const newComments = { ...activeComments };
      delete newComments[postId];
      setActiveComments(newComments);
      return;
    }

    setCommentLoading(prev => ({ ...prev, [postId]: true }));
    try {
      const res = await api.get(`/social/posts/${postId}/comments`);
      setActiveComments(prev => ({ ...prev, [postId]: res.data }));
    } catch (error) {
       toast.error('Failed to load comments');
    } finally {
       setCommentLoading(prev => ({ ...prev, [postId]: false }));
    }
  };

  const handleAddComment = async (postId: string, content: string) => {
    if (!content.trim()) return;
    try {
      const res = await api.post(`/social/posts/${postId}/comments`, { content });
      setActiveComments(prev => ({
        ...prev,
        [postId]: [...(prev[postId] || []), res.data]
      }));
      toast.success('Comment added');
    } catch (error) {
      toast.error('Failed to comment');
    }
  };

  const reactionEmojis = [
    { type: 'LOVE', icon: Heart, label: 'Love', activeColor: 'text-red-500 bg-red-500/10' },
    { type: 'ROCKET', icon: Rocket, label: 'Win', activeColor: 'text-primary bg-primary/10' },
    { type: 'CLAP', icon: PartyPopper, label: 'Claps', activeColor: 'text-amber-500 bg-amber-500/10' },
    { type: 'COFFEE', icon: Coffee, label: 'Casual', activeColor: 'text-orange-500 bg-orange-500/10' },
  ];

  const renderMedia = (url: string) => {
    const isImage = /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(url);
    const isVideo = /\.(mp4|webm|ogg)$/i.test(url);

    if (isImage) {
      return (
        <a href={url} target="_blank" rel="noopener noreferrer" className="block relative group overflow-hidden rounded-3xl border border-divider/50 shadow-xl shadow-black/10">
           <img src={url} alt="Post media" className="w-full h-auto max-h-[500px] object-cover group-hover:scale-105 transition-transform duration-[1000ms]" />
           <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
              <span className="text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                 <ExternalLink size={14} /> Open High-Res Original
              </span>
           </div>
        </a>
      );
    }
    if (isVideo) {
      return (
        <div className="rounded-3xl overflow-hidden border border-divider/50 bg-black group relative shadow-2xl">
          <video src={url} controls className="w-full max-h-[500px]" />
        </div>
      );
    }
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-5 bg-card/50 backdrop-blur-md border border-divider/40 rounded-2xl hover:bg-muted/30 transition-all group shadow-sm">
         <div className="p-3 bg-primary/10 text-primary rounded-xl group-hover:scale-110 transition-transform">
            <Link size={18} />
         </div>
         <div className="flex flex-col flex-1 truncate">
            <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-60">Shared Resource</span>
            <span className="text-[12px] font-bold text-primary truncate">{url}</span>
         </div>
         <ChevronRight size={16} className="text-muted-foreground opacity-20" />
      </a>
    );
  };

  return (
    <div className="mx-auto grid grid-cols-1 lg:grid-cols-[260px_1fr_300px] gap-8 animate-in fade-in duration-700 max-w-[1500px]">
      
      {/* Left Column: Mini Profile */}
      <aside className="hidden lg:flex flex-col gap-6 sticky top-0 h-fit pt-4">
         <div className="bg-card/40 backdrop-blur-xl border border-divider/50 rounded-[32px] p-8 space-y-6 shadow-sm overflow-hidden relative group">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-all" />
            <div className="flex flex-col items-center text-center space-y-4">
               <div className="w-20 h-20 rounded-3xl bg-primary/20 border-2 border-primary/30 flex items-center justify-center text-2xl font-black text-primary shadow-xl shadow-primary/10 overflow-hidden">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
               </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-black tracking-tight">{user?.firstName} {user?.lastName}</h3>
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">{user?.role}</p>
               </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2 pt-2">
               <div className="p-3 bg-muted/20 rounded-2xl text-center">
                  <p className="text-sm font-black">{posts.filter(p => p.authorId._id === user?.id).length}</p>
                  <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/60">Posts</p>
               </div>
               <div className="p-3 bg-muted/20 rounded-2xl text-center">
                  <p className="text-sm font-black text-primary">0</p>
                  <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/60">Kudos</p>
               </div>
            </div>
         </div>

         <div className="space-y-3 px-4">
            <h5 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60 px-2 flex items-center gap-2">
               <Zap size={12} className="text-primary" /> Active Feed
            </h5>
            <nav className="space-y-1">
               <button 
                 onClick={() => setActiveFilter('ALL')}
                 className={cn(
                   "w-full flex items-center gap-3 p-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all",
                   activeFilter === 'ALL' ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "text-muted-foreground hover:bg-muted/20"
                 )}
               >
                  <Globe size={16} /> All Channels
               </button>
               <button 
                 onClick={() => setActiveFilter('MENTIONS')}
                 className={cn(
                   "w-full flex items-center gap-3 p-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all",
                   activeFilter === 'MENTIONS' ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "text-muted-foreground hover:bg-muted/20"
                 )}
               >
                  <Bell size={16} /> Mentions
               </button>
               <button 
                 onClick={() => setActiveFilter('PINNED')}
                 className={cn(
                   "w-full flex items-center gap-3 p-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all",
                   activeFilter === 'PINNED' ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "text-muted-foreground hover:bg-muted/20"
                 )}
               >
                  <Pin size={16} /> Pinned Updates
               </button>
            </nav>
         </div>
      </aside>

      {/* Center Column: Feed */}
      <main className="space-y-8 min-w-0">
        <div className="bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-2xl border border-divider/60 rounded-[40px] p-8 shadow-xl shadow-black/5 relative overflow-hidden group">
           <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
           <form onSubmit={handleCreatePost} className="space-y-6">
              <div className="flex gap-5">
                 <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-black shadow-lg shadow-primary/5 shrink-0">
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                 </div>
                 <div className="flex-1 relative">
                    <textarea 
                      ref={textAreaRef}
                      value={newContent}
                      onChange={handleMentionInput}
                      onFocus={() => setIsCreating(true)}
                      placeholder="Celebrate a win or share a thought with the team..."
                      className="w-full bg-transparent border-none text-[15px] font-semibold resize-none focus:ring-0 placeholder:text-muted-foreground/50 min-h-[500px] pt-2"
                      rows={isCreating ? 5 : 1}
                    />

                    {/* Mentions Dropdown */}
                    {mentionType && mentionResults.length > 0 && (
                      <div className="absolute left-0 bottom-full mb-2 w-64 bg-card border border-divider rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 z-[100]">
                         <div className="p-1.5 flex flex-col gap-1">
                            {mentionResults.map((result, idx) => (
                              <button 
                                key={result._id}
                                type="button"
                                onClick={() => completeMention(result)}
                                className={cn(
                                   "flex items-center gap-3 p-2 rounded-xl transition-all text-left group",
                                   mentionIndex === idx ? "bg-primary text-white" : "hover:bg-muted"
                                )}
                              >
                                 <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center text-[10px] font-black">
                                    {mentionType === 'USER' ? result.firstName[0] : '#'}
                                 </div>
                                 <div className="flex flex-col">
                                    <span className="text-[11px] font-black uppercase tracking-tight">
                                       {mentionType === 'USER' ? `${result.firstName} ${result.lastName}` : result.name}
                                    </span>
                                    {mentionType === 'USER' && (
                                       <span className={cn("text-[8px] font-black tracking-widest uppercase opacity-40", mentionIndex === idx ? "text-white/60" : "")}>{result.role}</span>
                                    )}
                                 </div>
                              </button>
                            ))}
                         </div>
                      </div>
                    )}
                 </div>
              </div>
              
              {isCreating && (
                <div className="space-y-6 animate-in slide-in-from-top-4 duration-300">
                   {showMediaInput && (
                     <div className="flex items-center gap-3 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex-1 relative flex items-center">
                           <input 
                             type="text" 
                             placeholder="Paste Image/Video Link (https://...)"
                             value={mediaLink}
                             onChange={(e) => setMediaLink(e.target.value)}
                             className="w-full pl-12 pr-4 py-3.5 bg-muted/20 border border-divider/40 rounded-2xl outline-none text-[12px] font-bold focus:border-primary/50 transition-all"
                           />
                           <Link size={16} className="absolute left-4 text-muted-foreground" />
                        </div>
                        <Button type="button" variant="ghost" size="sm" onClick={() => setShowMediaInput(false)} className="rounded-xl h-12 w-12 bg-muted/20">
                           <XCircle size={20} className="text-muted-foreground" />
                        </Button>
                     </div>
                   )}

                   <div className="flex items-center justify-between pt-4 border-t border-divider/40">
                      <div className="flex gap-2">
                         <button 
                           type="button" 
                           onClick={() => setShowMediaInput(true)}
                           className="p-3 text-muted-foreground hover:bg-primary/10 hover:text-primary rounded-2xl transition-all flex items-center gap-3 border border-transparent hover:border-primary/20"
                         >
                            <ImageIcon size={20} strokeWidth={2.5} />
                            <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">Add Media</span>
                         </button>
                         <button type="button" className="p-3 text-muted-foreground hover:bg-primary/10 hover:text-primary rounded-2xl transition-all border border-transparent hover:border-primary/20">
                            <AtSign size={20} strokeWidth={2.5} />
                         </button>
                         <button type="button" className="p-3 text-muted-foreground hover:bg-primary/10 hover:text-primary rounded-2xl transition-all border border-transparent hover:border-primary/20">
                            <Hash size={20} strokeWidth={2.5} />
                         </button>
                      </div>
                      <div className="flex gap-3">
                         <Button type="button" variant="ghost" onClick={() => setIsCreating(false)} className="text-[10px] font-black uppercase rounded-[18px] px-8 py-3">Dismiss</Button>
                         <Button type="submit" disabled={!newContent.trim()} className="text-[10px] font-black uppercase rounded-[18px] px-10 py-3 shadow-2xl shadow-primary/30 gap-2">
                           Manifest Update
                           <Sparkles size={14} />
                         </Button>
                      </div>
                   </div>
                </div>
              )}
           </form>
        </div>

        {/* Posts Feed */}
        <div className="space-y-10 pb-20">
          {loading ? (
            <div className="py-24 flex flex-col items-center justify-center opacity-30 gap-4">
               <Loader2 className="w-12 h-12 animate-spin text-primary" />
               <span className="text-[11px] font-black uppercase tracking-widest">Streaming Cultural Insights...</span>
            </div>
          ) : (
            posts
              .filter(post => {
                if (activeFilter === 'PINNED') return post.isPinned;
                if (activeFilter === 'MENTIONS') {
                  // Basic mention check: post content contains @First Last or user id
                  const userMention = `@${user?.firstName} ${user?.lastName}`;
                  return post.content.includes(userMention);
                }
                return true;
              })
              .map((post) => (
              <div key={post._id} className={cn(
                "group bg-card/60 backdrop-blur-lg border rounded-[48px] overflow-hidden transition-all duration-700 hover:shadow-2xl hover:shadow-primary/5",
                post.isPinned ? "border-primary/40 shadow-xl shadow-primary/10 ring-1 ring-primary/20" : "border-divider/50 shadow-sm"
              )}>
                 {/* Post Meta */}
                 <div className="p-8 flex items-start justify-between relative">
                    {post.isPinned && (
                       <div className="absolute top-0 right-20 px-4 py-1 bg-primary text-white text-[8px] font-black uppercase tracking-[0.2em] rounded-b-xl shadow-lg animate-pulse">FEATURED UPDATE</div>
                    )}
                    <div className="flex gap-5">
                       <div className="w-14 h-14 rounded-3xl bg-muted border border-divider/60 flex items-center justify-center font-black text-sm relative overflow-hidden group/avatar shadow-lg shadow-black/10">
                          {post.authorId.avatar ? (
                            <img src={post.authorId.avatar} alt="Avatar" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-muted-foreground opacity-40">{post.authorId.firstName[0]}{post.authorId.lastName[0]}</span>
                          )}
                          <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover/avatar:opacity-100 transition-opacity" />
                       </div>
                       <div className="flex flex-col justify-center">
                          <div className="flex items-center gap-3">
                             <span className="text-[15px] font-black text-foreground tracking-tight">{post.authorId.firstName} {post.authorId.lastName}</span>
                             {post.type !== 'USER' && (
                               <span className="px-3 py-1 bg-primary/10 text-primary border border-primary/20 rounded-full text-[8px] font-black uppercase tracking-widest flex items-center gap-1.5">
                                  <Sparkles size={10} /> {post.type}
                               </span>
                             )}
                          </div>
                          <span className="text-[11px] font-bold text-muted-foreground/70 uppercase tracking-widest">
                             {post.authorId.role} • {formatDistanceToNow(parseISO(post.createdAt))}
                          </span>
                       </div>
                    </div>

                    <div className="flex items-center gap-2">
                       {isAdmin && (
                          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                             <button 
                               onClick={() => handleTogglePin(post._id)}
                               className={cn(
                                 "w-10 h-10 rounded-2xl transition-all flex items-center justify-center border border-divider hover:shadow-lg",
                                 post.isPinned ? "text-primary bg-primary/10 border-primary/30" : "text-muted-foreground hover:bg-muted"
                               )}
                             >
                                <Pin size={18} strokeWidth={2.5} />
                             </button>
                             <button 
                               onClick={() => handleDeletePost(post._id)}
                               className="w-10 h-10 rounded-2xl text-muted-foreground hover:text-red-500 hover:bg-red-500/10 border border-divider hover:border-red-500/30 transition-all flex items-center justify-center"
                             >
                                <Trash2 size={18} strokeWidth={2.5} />
                             </button>
                          </div>
                       )}
                       <button className="w-10 h-10 text-muted-foreground hover:bg-muted rounded-2xl transition-all flex items-center justify-center border border-transparent hover:border-divider">
                          <MoreHorizontal size={24} />
                       </button>
                    </div>
                 </div>

                 {/* Content */}
                 <div className="px-10 pb-6 space-y-6">
                    <p className="text-[16px] leading-[1.6] font-medium whitespace-pre-wrap selection:bg-primary/20 text-foreground/90">
                      {post.content.split(/([@#][\w\s]+)/g).map((part, i) => {
                         if (part.startsWith('@')) return <span key={i} className="text-primary font-black cursor-pointer hover:underline">{part}</span>;
                         if (part.startsWith('#')) return <span key={i} className="text-primary font-bold cursor-pointer hover:opacity-70 transition-opacity bg-primary/5 px-2 py-0.5 rounded-lg">{part}</span>;
                         return part;
                      })}
                    </p>
                    
                    {post.mediaUrls.length > 0 && (
                      <div className="grid grid-cols-1 gap-6 pt-4">
                         {post.mediaUrls.map((url, i) => (
                           <div key={i} className="animate-in zoom-in-95 duration-700 delay-150">{renderMedia(url)}</div>
                         ))}
                      </div>
                    )}
                 </div>

                 {/* Interactions */}
                 <div className="px-8 pb-8 flex flex-col gap-6">
                    <div className="flex items-center justify-between pt-4 border-t border-divider/30">
                       <div className="flex items-center gap-2">
                          {reactionEmojis.map((emoji) => {
                             const userIds = post.reactions[emoji.type] || [];
                             const hasReacted = userIds.includes(user?.id || '');
                             const count = userIds.length;

                             return (
                               <button
                                 key={emoji.type}
                                 onClick={() => handleToggleReaction(post._id, emoji.type)}
                                 className={cn(
                                   "flex items-center gap-2 px-5 py-2.5 rounded-2xl transition-all text-[11px] font-black group/btn border border-transparent shadow-sm",
                                   hasReacted 
                                     ? emoji.activeColor + " border-divider"
                                     : "text-muted-foreground/60 hover:bg-muted hover:text-foreground hover:border-divider focus:text-foreground"
                                 )}
                               >
                                  <emoji.icon size={hasReacted ? 18 : 16} strokeWidth={hasReacted ? 3 : 2} className={cn(hasReacted ? "" : "group-hover/btn:scale-125 transition-all")} />
                                  {count > 0 && <span className={cn("tracking-tighter", hasReacted ? "text-current" : "text-muted-foreground")}>{count}</span>}
                               </button>
                             );
                          })}
                       </div>

                       <button 
                         onClick={() => toggleComments(post._id)}
                         className={cn(
                           "flex items-center gap-3 px-6 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all shadow-sm border",
                           activeComments[post._id] ? "bg-muted border-divider text-foreground" : "text-muted-foreground opacity-30 hover:opacity-100 hover:bg-muted border-transparent hover:border-divider"
                         )}
                       >
                          <MessageCircle size={16} strokeWidth={3} />
                          {activeComments[post._id] ? 'Minimize' : 'Engage'}
                       </button>
                    </div>

                    {/* Dynamic Discussion Section */}
                    {activeComments[post._id] && (
                      <div className="space-y-6 pt-4 animate-in slide-in-from-top-6 duration-700">
                         <div className="space-y-4">
                            {commentLoading[post._id] ? (
                              <div className="py-12 flex justify-center opacity-20"><Loader2 className="animate-spin text-primary w-8 h-8" /></div>
                            ) : (
                              activeComments[post._id].map((comment) => (
                                <div key={comment._id} className="flex gap-4 animate-in fade-in slide-in-from-left-4 duration-300">
                                   <div className="w-10 h-10 rounded-2xl bg-muted border border-divider/60 flex items-center justify-center text-[11px] font-bold text-muted-foreground shrink-0 overflow-hidden shadow-sm">
                                      {comment.authorId.avatar ? <img src={comment.authorId.avatar} /> : comment.authorId.firstName[0]}
                                   </div>
                                   <div className="flex-1 bg-muted/20 p-5 rounded-[24px] rounded-tl-none border border-divider/20 shadow-sm">
                                      <div className="flex items-center justify-between mb-2">
                                         <span className="text-[11px] font-black tracking-tight">{comment.authorId.firstName} {comment.authorId.lastName}</span>
                                         <span className="text-[9px] font-black uppercase tracking-[0.1em] text-muted-foreground opacity-30">{formatDistanceToNow(parseISO(comment.createdAt))}</span>
                                      </div>
                                      <p className="text-[13px] font-medium leading-relaxed opacity-90 text-foreground/80">{comment.content}</p>
                                   </div>
                                </div>
                              ))
                            )}
                         </div>

                         <div className="flex gap-4 pt-2">
                            <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-[11px] font-black text-primary shrink-0 shadow-lg shadow-primary/5">
                               {user?.firstName?.[0]}
                            </div>
                            <div className="flex-1 relative">
                               <input 
                                 placeholder="Craft a thoughtful response..."
                                 className="w-full bg-muted/20 border border-divider/50 rounded-2xl px-6 py-4 text-[13px] font-bold outline-none focus:border-primary/50 transition-all placeholder:text-muted-foreground/30"
                                 onKeyDown={(e) => {
                                   if (e.key === 'Enter') {
                                     handleAddComment(post._id, e.currentTarget.value);
                                     e.currentTarget.value = '';
                                   }
                                 }}
                               />
                               <Send size={16} className="absolute right-5 top-1/2 -translate-y-1/2 text-primary opacity-40" />
                            </div>
                         </div>
                      </div>
                    )}
                 </div>
              </div>
            ))
          )}
          
          {!loading && posts.length === 0 && (
            <div className="py-48 text-center opacity-10 flex flex-col items-center gap-8">
               <div className="p-10 bg-muted rounded-[60px] border border-divider animate-pulse shadow-inner">
                  <PartyPopper size={84} strokeWidth={1} />
               </div>
               <div className="space-y-3">
                  <p className="text-[18px] font-black uppercase tracking-widest">Eerily Silent Wall...</p>
                  <p className="text-[11px] font-bold max-w-sm mx-auto">This organization is waiting for its first spark of engagement. Share a win or celebrate a peer to get started.</p>
               </div>
            </div>
          )}
        </div>
      </main>

      {/* Right Column: Pulse */}
      <aside className="hidden lg:flex flex-col gap-8 sticky top-0 h-fit pt-4">
         <div className="bg-card/30 backdrop-blur-3xl border border-divider/40 rounded-[32px] p-8 space-y-6 shadow-sm overflow-hidden relative">
            <div className="flex items-center justify-between mb-4">
               <h5 className="text-[11px] font-black uppercase tracking-[0.15em] text-emerald-500 flex items-center gap-2">
                  <Cake size={16} /> Celebrations
               </h5>
            </div>
            <div className="space-y-5">
               <div className="flex items-start gap-4 opacity-50">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
                     <Calendar size={18} />
                  </div>
                  <div className="flex flex-col flex-1">
                     <span className="text-[11px] font-black tracking-tight leading-tight">No events today</span>
                     <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest opacity-40">Check back tomorrow</span>
                  </div>
               </div>
            </div>
         </div>
      </aside>

    </div>
  );
}
