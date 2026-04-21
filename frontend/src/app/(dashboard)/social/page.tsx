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
  Quote,
  Link,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Heart,
  Rocket,
  Coffee,
  PartyPopper,
  XCircle
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
  
  // Comments state
  const [activeComments, setActiveComments] = useState<Record<string, Comment[]>>({});
  const [commentLoading, setCommentLoading] = useState<Record<string, boolean>>({});

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
      toast.success('Broadcast sent to the organization!');
      fetchPosts();
    } catch (error) {
      toast.error('Failed to post update');
    }
  };

  const handleToggleReaction = async (postId: string, type: string) => {
    try {
      await api.post(`/social/posts/${postId}/react/${type}`, {});
      // Optimistic update
      setPosts(prev => prev.map(p => {
        if (p._id === postId) {
          const currentReactions = { ...p.reactions };
          const userIds = currentReactions[type] || [];
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
    { type: 'LOVE', icon: Heart, label: 'Love', activeColor: 'text-red-500 bg-red-50' },
    { type: 'ROCKET', icon: Rocket, label: 'Win', activeColor: 'text-primary bg-primary/5' },
    { type: 'CLAP', icon: PartyPopper, label: 'Claps', activeColor: 'text-amber-500 bg-amber-50' },
    { type: 'COFFEE', icon: Coffee, label: 'Casual', activeColor: 'text-orange-500 bg-orange-50' },
  ];

  const renderMedia = (url: string) => {
    const isImage = /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(url);
    const isVideo = /\.(mp4|webm|ogg)$/i.test(url);

    if (isImage) {
      return (
        <a href={url} target="_blank" rel="noopener noreferrer" className="block relative group overflow-hidden rounded-2xl border border-divider">
           <img src={url} alt="Post media" className="w-full h-auto max-h-[500px] object-cover group-hover:scale-105 transition-transform duration-700" />
           <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <ExternalLink size={24} className="text-white" />
           </div>
        </a>
      );
    }
    if (isVideo) {
      return (
        <div className="rounded-2xl overflow-hidden border border-divider bg-black group relative">
          <video src={url} controls className="w-full max-h-[500px]" />
        </div>
      );
    }
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-4 bg-muted/20 border border-divider rounded-xl hover:bg-muted/30 transition-all">
         <div className="p-2 bg-primary/10 text-primary rounded-lg">
            <Link size={16} />
         </div>
         <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Resource Link</span>
            <span className="text-[11px] font-bold text-primary truncate max-w-[300px]">{url}</span>
         </div>
      </a>
    );
  };

  return (
    <div className="max-w-[700px] mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-5 px-1">
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-1">
             <span className="px-2 py-0.5 bg-primary/10 text-primary text-[9px] font-black uppercase tracking-widest rounded-md border border-primary/20">Cultural Stream</span>
          </div>
          <h1 className="text-2xl font-black text-foreground uppercase tracking-tight">
            Company <span className="text-primary">Social Wall</span>
          </h1>
          <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest opacity-40">Celebrate wins, share updates, and engage with the team.</p>
        </div>
      </div>

      {/* Post Creator */}
      <div className="bg-card border border-divider rounded-[32px] p-6 shadow-sm shadow-primary/5 group transition-all hover:border-primary/20">
         <form onSubmit={handleCreatePost} className="space-y-4">
            <div className="flex gap-4">
               <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-black border border-primary/20 shadow-lg shadow-primary/5 shrink-0">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
               </div>
               <div className="flex-1 space-y-4">
                  <textarea 
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    onFocus={() => setIsCreating(true)}
                    placeholder="Share an achievement or update with the team..."
                    className="w-full bg-transparent border-none text-[13px] font-medium resize-none focus:ring-0 placeholder:text-muted-foreground/30 min-h-[40px] pt-2"
                    rows={isCreating ? 4 : 1}
                  />
                  
                  {isCreating && (
                    <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
                       {showMediaInput && (
                         <div className="flex items-center gap-2 animate-in fade-in zoom-in-95 duration-200">
                            <div className="flex-1 relative">
                               <input 
                                 type="text" 
                                 placeholder="Paste Image/Video Link (https://...)"
                                 value={mediaLink}
                                 onChange={(e) => setMediaLink(e.target.value)}
                                 className="w-full pl-10 pr-4 py-2.5 bg-muted/20 border border-divider rounded-xl outline-none text-[11px] font-bold focus:border-primary/50"
                               />
                               <Link size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                            </div>
                            <Button type="button" variant="ghost" size="sm" onClick={() => setShowMediaInput(false)} className="rounded-lg h-10 w-10">
                               <XCircle size={18} className="text-muted-foreground" />
                            </Button>
                         </div>
                       )}

                       <div className="flex items-center justify-between pt-2 border-t border-divider/40">
                          <div className="flex gap-1">
                             <button 
                               type="button" 
                               onClick={() => setShowMediaInput(true)}
                               className="p-2.5 text-muted-foreground hover:bg-muted/10 hover:text-primary rounded-xl transition-all flex items-center gap-2"
                             >
                                <ImageIcon size={18} strokeWidth={2.5} />
                                <span className="text-[9px] font-black uppercase tracking-widest hidden sm:inline">Attach Media</span>
                             </button>
                             <button type="button" className="p-2.5 text-muted-foreground hover:bg-muted/10 hover:text-primary rounded-xl transition-all">
                                <Quote size={18} strokeWidth={2.5} />
                             </button>
                          </div>
                          <div className="flex gap-2">
                             <Button type="button" variant="ghost" onClick={() => setIsCreating(false)} className="text-[10px] font-black uppercase rounded-xl px-6">Cancel</Button>
                             <Button type="submit" disabled={!newContent.trim()} className="text-[10px] font-black uppercase rounded-xl px-8 shadow-lg shadow-primary/20">Post Broadcast</Button>
                          </div>
                       </div>
                    </div>
                  )}
               </div>
            </div>
         </form>
      </div>

      {/* Posts Feed */}
      <div className="space-y-6">
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center opacity-30 gap-4">
             <Loader2 className="w-10 h-10 animate-spin text-primary" />
             <span className="text-[10px] font-black uppercase tracking-widest">Streaming Feedback...</span>
          </div>
        ) : (
          posts.map((post) => (
            <div key={post._id} className={cn(
              "bg-card border rounded-[32px] overflow-hidden transition-all duration-500 hover:shadow-xl hover:shadow-primary/5",
              post.isPinned ? "border-primary/40 shadow-lg shadow-primary/5 ring-1 ring-primary/10" : "border-divider"
            )}>
               {/* Post Meta */}
               <div className="p-6 flex items-start justify-between">
                  <div className="flex gap-4">
                     <div className="w-12 h-12 rounded-2xl bg-muted border border-divider flex items-center justify-center font-black text-xs relative overflow-hidden group">
                        {post.authorId.avatar ? (
                          <img src={post.authorId.avatar} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-muted-foreground opacity-40">{post.authorId.firstName[0]}{post.authorId.lastName[0]}</span>
                        )}
                        <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                     </div>
                     <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                           <span className="text-[14px] font-black text-foreground">{post.authorId.firstName} {post.authorId.lastName}</span>
                           {post.type !== 'USER' && (
                             <span className="px-2 py-0.5 bg-primary/10 text-primary border border-primary/20 rounded-md text-[8px] font-black uppercase tracking-widest flex items-center gap-1">
                                <Sparkles size={8} /> {post.type}
                             </span>
                           )}
                           {post.isPinned && (
                              <Pin size={12} className="text-primary fill-primary animate-pulse" />
                           )}
                        </div>
                        <span className="text-[11px] font-medium text-muted-foreground opacity-40">
                           {post.authorId.role} • {formatDistanceToNow(parseISO(post.createdAt))} ago
                        </span>
                     </div>
                  </div>

                  <div className="flex items-center gap-1">
                     {isAdmin && (
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-muted/10 p-1 rounded-xl">
                           <button 
                             onClick={() => handleTogglePin(post._id)}
                             className={cn(
                               "p-2 rounded-lg transition-all",
                               post.isPinned ? "text-primary bg-primary/10" : "text-muted-foreground hover:bg-muted"
                             )}
                           >
                              <Pin size={16} strokeWidth={2.5} />
                           </button>
                           <button 
                             onClick={() => handleDeletePost(post._id)}
                             className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                           >
                              <Trash2 size={16} strokeWidth={2.5} />
                           </button>
                        </div>
                     )}
                     <button className="p-2 text-muted-foreground hover:bg-muted/10 rounded-lg transition-all">
                        <MoreHorizontal size={20} />
                     </button>
                  </div>
               </div>

               {/* Content */}
               <div className="px-6 pb-4 space-y-4">
                  <p className="text-[14px] leading-relaxed font-medium whitespace-pre-wrap selection:bg-primary/20">
                    {post.content}
                  </p>
                  
                  {post.mediaUrls.length > 0 && (
                    <div className="grid grid-cols-1 gap-4 pt-2">
                       {post.mediaUrls.map((url, i) => (
                         <div key={i}>{renderMedia(url)}</div>
                       ))}
                    </div>
                  )}
               </div>

               {/* Interactions */}
               <div className="p-4 border-t border-divider/40 flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                     <div className="flex items-center gap-1">
                        {reactionEmojis.map((emoji) => {
                           const userIds = post.reactions[emoji.type] || [];
                           const hasReacted = userIds.includes(user?.id || '');
                           const count = userIds.length;

                           return (
                             <button
                               key={emoji.type}
                               onClick={() => handleToggleReaction(post._id, emoji.type)}
                               className={cn(
                                 "flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all text-[11px] font-black group/btn",
                                 hasReacted 
                                   ? emoji.activeColor 
                                   : "text-muted-foreground/40 hover:bg-muted/10 hover:text-foreground"
                               )}
                             >
                                <emoji.icon size={14} strokeWidth={3} className={cn(hasReacted ? "" : "opacity-40 group-hover/btn:opacity-100 group-hover/btn:scale-110 transition-all")} />
                                {count > 0 && <span className={cn(hasReacted ? "text-current" : "text-muted-foreground opacity-60")}>{count}</span>}
                             </button>
                           );
                        })}
                     </div>

                     <button 
                       onClick={() => toggleComments(post._id)}
                       className={cn(
                         "flex items-center gap-2 px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest transition-all",
                         activeComments[post._id] ? "bg-muted text-foreground" : "text-muted-foreground/40 hover:bg-muted/10"
                       )}
                     >
                        <MessageCircle size={14} strokeWidth={3} />
                        {activeComments[post._id] ? 'Hide Discussion' : 'Join Discussion'}
                     </button>
                  </div>

                  {/* Dynamic Discussion Section */}
                  {activeComments[post._id] && (
                    <div className="space-y-4 animate-in slide-in-from-top-4 duration-500">
                       <div className="space-y-3 pt-2">
                          {commentLoading[post._id] ? (
                            <div className="py-8 flex justify-center opacity-20"><Loader2 className="animate-spin" /></div>
                          ) : (
                            activeComments[post._id].map((comment) => (
                              <div key={comment._id} className="flex gap-3 animate-in fade-in duration-300">
                                 <div className="w-8 h-8 rounded-xl bg-muted border border-divider flex items-center justify-center text-[10px] font-bold text-muted-foreground shrink-0 overflow-hidden">
                                    {comment.authorId.avatar ? <img src={comment.authorId.avatar} /> : comment.authorId.firstName[0]}
                                 </div>
                                 <div className="flex-1 bg-muted/20 p-3 rounded-2xl rounded-tl-none border border-divider/40">
                                    <div className="flex items-center justify-between mb-1">
                                       <span className="text-[10px] font-black leading-none">{comment.authorId.firstName} {comment.authorId.lastName}</span>
                                       <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground opacity-30">{formatDistanceToNow(parseISO(comment.createdAt))}</span>
                                    </div>
                                    <p className="text-[11px] font-medium leading-relaxed opacity-80">{comment.content}</p>
                                 </div>
                              </div>
                            ))
                          )}
                       </div>

                       <div className="flex gap-3 pt-2">
                          <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-[10px] font-black text-primary shrink-0">
                             {user?.firstName?.[0]}
                          </div>
                          <div className="flex-1 relative">
                             <input 
                               placeholder="Add your thoughts..."
                               className="w-full bg-muted/10 border border-divider rounded-2xl px-4 py-2 text-[11px] font-bold outline-none focus:border-primary/50"
                               onKeyDown={(e) => {
                                 if (e.key === 'Enter') {
                                   handleAddComment(post._id, e.currentTarget.value);
                                   e.currentTarget.value = '';
                                 }
                               }}
                             />
                             <Send size={12} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground opacity-30" />
                          </div>
                       </div>
                    </div>
                  )}
               </div>
            </div>
          ))
        )}
        
        {!loading && posts.length === 0 && (
          <div className="py-48 text-center opacity-20 flex flex-col items-center gap-6">
             <div className="p-8 bg-muted rounded-[40px] border border-divider animate-pulse">
                <PartyPopper size={64} strokeWidth={1} />
             </div>
             <div className="space-y-2">
                <p className="text-[14px] font-black uppercase tracking-widest">Quiet feed...</p>
                <p className="text-[10px] font-bold max-w-xs">Be the first to share a win or update with your colleagues on the Social Wall.</p>
             </div>
          </div>
        )}
      </div>
    </div>
  );
}
