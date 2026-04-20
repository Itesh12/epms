'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  Book, 
  Search, 
  Plus, 
  ChevronRight, 
  Clock, 
  User as UserIcon, 
  Edit3, 
  Trash2, 
  ArrowLeft,
  BookOpen,
  FileText,
  Shield,
  HelpCircle,
  Database,
  Terminal,
  Save,
  Eye,
  History as HistoryIcon,
  Loader2,
  Tag
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { CustomSelect, SelectOption } from '@/components/ui/CustomSelect';
import { useAuthStore } from '@/store/useAuthStore';
import api from '@/services/api';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

type ViewMode = 'LATEST' | 'CATEGORY' | 'VIEW' | 'EDIT' | 'CREATE';

export default function WikiPage() {
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === 'ADMIN';

  const [viewMode, setViewMode] = useState<ViewMode>('LATEST');
  const [categories, setCategories] = useState<any[]>([]);
  const [articles, setArticles] = useState<any[]>([]);
  const [currentArticle, setCurrentArticle] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Editor State
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editCategoryId, setEditCategoryId] = useState('');
  const [editTags, setEditTags] = useState('');
  const [isPreview, setIsPreview] = useState(false);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await api.get('/wiki/categories');
      setCategories(res.data);
    } catch (error) {
      console.error('Failed to fetch categories', error);
    }
  }, []);

  const fetchArticles = useCallback(async (catId?: string, query?: string) => {
    setLoading(true);
    try {
      let url = '/wiki/articles';
      const params = new URLSearchParams();
      if (catId) params.append('category', catId);
      if (query) params.append('q', query);
      if (params.toString()) url += `?${params.toString()}`;
      
      const res = await api.get(url);
      setArticles(res.data);
    } catch (error) {
      toast.error('Failed to fetch articles');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
    fetchArticles();
  }, [fetchCategories, fetchArticles]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setViewMode('LATEST');
    fetchArticles(undefined, searchQuery);
  };

  const handleSelectCategory = (cat: any) => {
    setSelectedCategory(cat);
    setViewMode('CATEGORY');
    fetchArticles(cat._id);
  };

  const handleViewArticle = async (id: string) => {
    setLoading(true);
    try {
      const res = await api.get(`/wiki/articles/${id}`);
      setCurrentArticle(res.data);
      setViewMode('VIEW');
    } catch (error) {
      toast.error('Article not found');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditTitle('');
    setEditContent('');
    setEditCategoryId(selectedCategory?._id || categories[0]?._id || '');
    setEditTags('');
    setViewMode('CREATE');
  };

  const handleEdit = (article: any) => {
    setEditTitle(article.title);
    setEditContent(article.content);
    setEditCategoryId(article.categoryId._id);
    setEditTags(article.tags?.join(', ') || '');
    setCurrentArticle(article);
    setViewMode('EDIT');
  };

  const handleSave = async () => {
    if (!editTitle || !editContent || !editCategoryId) {
      return toast.error('Please fill all required fields');
    }

    setLoading(true);
    const data = {
      title: editTitle,
      content: editContent,
      categoryId: editCategoryId,
      tags: editTags.split(',').map(t => t.trim()).filter(Boolean),
    };

    try {
      if (viewMode === 'CREATE') {
        const res = await api.post('/wiki/articles', data);
        toast.success('Article created');
        handleViewArticle(res.data._id);
      } else {
        await api.patch(`/wiki/articles/${currentArticle._id}`, data);
        toast.success('Article updated');
        handleViewArticle(currentArticle._id);
      }
      fetchArticles();
    } catch (error) {
      toast.error('Failed to save article');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this article?')) return;
    try {
      await api.delete(`/wiki/articles/${id}`);
      toast.success('Article deleted');
      fetchArticles();
      setViewMode('LATEST');
    } catch (error) {
      toast.error('Deletion failed');
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto flex flex-col h-[calc(100vh-120px)] animate-in fade-in duration-500">
      {/* Search & Global Actions Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6 bg-card border border-divider p-4 rounded-2xl shadow-sm">
         <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="p-2 bg-primary/10 rounded-xl text-primary">
               <BookOpen size={20} />
            </div>
            <h1 className="text-xl font-black uppercase tracking-tight">EPMS <span className="text-primary">Wiki</span></h1>
         </div>

         <form onSubmit={handleSearch} className="relative flex-1 max-w-xl group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
            <input 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search SOPs, help guides, documentation..." 
              className="w-full pl-12 pr-4 py-2.5 bg-muted/30 border border-divider rounded-xl outline-none focus:border-primary/50 transition-all text-sm font-medium"
            />
         </form>

         <div className="flex items-center gap-3">
            <Button 
              onClick={handleCreate}
              className="h-10 px-6 rounded-xl text-[10px] font-black uppercase tracking-widest gap-2 shadow-lg shadow-primary/20"
            >
              <Plus size={16} strokeWidth={3} />
              New Article
            </Button>
         </div>
      </div>

      <div className="flex-1 flex gap-6 overflow-hidden">
        {/* Navigation Sidebar */}
        <aside className="w-64 flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar">
           <div className="space-y-1">
              <button 
                onClick={() => { setViewMode('LATEST'); fetchArticles(); setSelectedCategory(null); }}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-[11px] font-bold uppercase transition-all",
                  viewMode === 'LATEST' ? "bg-primary text-white shadow-md shadow-primary/10" : "text-muted-foreground hover:bg-muted/50"
                )}
              >
                <Clock size={16} /> Latest Updates
              </button>
           </div>

           <div className="mt-4">
              <p className="px-4 text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-3 opacity-50">Documentation Tree</p>
              <div className="space-y-1">
                 {categories.map((cat) => (
                   <button 
                     key={cat._id}
                     onClick={() => handleSelectCategory(cat)}
                     className={cn(
                       "w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-[11px] font-bold uppercase transition-all group",
                       selectedCategory?._id === cat._id ? "bg-card border border-divider shadow-sm text-primary" : "text-muted-foreground hover:bg-muted/50"
                     )}
                   >
                     <div className="flex items-center gap-3">
                        <span className="opacity-60 group-hover:opacity-100 transition-opacity">
                           {/* Mapping icons dynamically - helper function could be used or just a generic icon */}
                           <FileText size={16} />
                        </span>
                        {cat.name}
                     </div>
                     <ChevronRight size={14} className={cn("opacity-0 transition-all", selectedCategory?._id === cat._id ? "opacity-100 translate-x-0" : "group-hover:opacity-40 group-hover:translate-x-1")} />
                   </button>
                 ))}
              </div>
           </div>

           {isAdmin && (
             <Button variant="ghost" className="mt-auto border border-dashed border-divider rounded-xl h-10 text-[9px] font-black uppercase opacity-40 hover:opacity-100">
               Manage Categories
             </Button>
           )}
        </aside>

        {/* Dynamic Content Area */}
        <main className="flex-1 bg-card border border-divider rounded-[32px] shadow-sm overflow-hidden flex flex-col">
           {loading ? (
             <div className="flex-1 flex flex-col items-center justify-center opacity-30 gap-3">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
                <span className="text-[10px] font-black uppercase tracking-widest">Accessing Index...</span>
             </div>
           ) : (
             <>
               {/* List View (Latest or Category) */}
               {(viewMode === 'LATEST' || viewMode === 'CATEGORY') && (
                 <div className="flex-1 flex flex-col overflow-hidden">
                    <div className="p-8 border-b border-divider bg-muted/5">
                       <h2 className="text-2xl font-black uppercase tracking-tight">
                         {viewMode === 'LATEST' ? 'Recent Documentation' : selectedCategory?.name}
                       </h2>
                       <p className="text-[11px] font-black text-muted-foreground uppercase tracking-widest opacity-40 mt-1">
                         {articles.length} articles found in this segment
                       </p>
                    </div>
                    <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-4 custom-scrollbar">
                       {articles.map((art) => (
                         <button 
                           key={art._id}
                           onClick={() => handleViewArticle(art._id)}
                           className="group text-left p-6 bg-muted/10 border border-divider rounded-2xl hover:border-primary/50 hover:bg-muted/20 transition-all flex flex-col gap-4 relative overflow-hidden"
                         >
                            <div className="flex items-start justify-between relative z-10">
                               <div className="p-2 bg-primary/10 rounded-xl text-primary group-hover:scale-110 transition-transform">
                                  <FileText size={20} />
                               </div>
                               <div className="flex items-center gap-2">
                                  <span className="px-2 py-0.5 bg-muted/50 rounded-lg text-[8px] font-black uppercase border border-divider opacity-50">{art.categoryId?.name}</span>
                               </div>
                            </div>
                            <div className="relative z-10">
                               <h3 className="text-sm font-black uppercase tracking-tight group-hover:text-primary transition-colors">{art.title}</h3>
                               <p className="text-xs text-muted-foreground mt-2 line-clamp-2 leading-relaxed opacity-60">
                                 {art.content.replace(/[#*`]/g, '').substring(0, 120)}...
                               </p>
                            </div>
                            <div className="mt-auto flex items-center justify-between relative z-10 pt-4 border-t border-divider/40">
                               <div className="flex items-center gap-2">
                                  <div className="w-5 h-5 rounded-full bg-muted border border-divider flex items-center justify-center text-[8px] font-black">
                                    {art.authorId?.firstName?.[0]}
                                  </div>
                                  <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest opacity-40">{art.authorId?.firstName}</span>
                               </div>
                               <span className="text-[9px] font-black text-muted-foreground opacity-30">{format(new Date(art.updatedAt), 'MMM dd, yyyy')}</span>
                            </div>
                         </button>
                       ))}
                    </div>
                 </div>
               )}

               {/* Article Reader View */}
               {viewMode === 'VIEW' && currentArticle && (
                 <div className="flex-1 flex flex-col overflow-hidden animate-in slide-in-from-right duration-300">
                    <div className="px-8 py-6 border-b border-divider flex items-center justify-between bg-muted/5">
                       <button 
                         onClick={() => setViewMode('LATEST')}
                         className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground transition-all"
                       >
                         <ArrowLeft size={16} /> Back to Library
                       </button>
                       <div className="flex items-center gap-3">
                          <Button variant="ghost" onClick={() => handleEdit(currentArticle)} className="h-9 px-4 rounded-xl text-[9px] font-black uppercase tracking-widest border border-divider hover:bg-muted/50 gap-2">
                             <Edit3 size={14} /> Edit Mode
                          </Button>
                          {isAdmin && (
                            <Button variant="ghost" onClick={() => handleDelete(currentArticle._id)} className="h-9 px-4 rounded-xl text-[9px] font-black uppercase tracking-widest text-red-500 hover:bg-red-500/10 gap-2 opacity-40 hover:opacity-100">
                               <Trash2 size={14} /> Remove
                            </Button>
                          )}
                       </div>
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                       <div className="max-w-4xl mx-auto px-8 py-10">
                          <div className="flex items-center gap-3 mb-4 opacity-50">
                             <span className="px-2 py-0.5 bg-primary/10 text-primary text-[9px] font-black uppercase tracking-widest rounded border border-primary/20">
                               {currentArticle.categoryId?.name}
                             </span>
                             <span className="text-divider">|</span>
                             <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest">
                                <HistoryIcon size={12} /> Version v{currentArticle.currentVersion}
                             </div>
                          </div>
                          <h1 className="text-4xl font-black uppercase tracking-tight text-foreground leading-tight mb-8">
                            {currentArticle.title}
                          </h1>
                          <div className="prose prose-sm prose-invert max-w-none dark-markdown">
                             <ReactMarkdown remarkPlugins={[remarkGfm]}>
                               {currentArticle.content}
                             </ReactMarkdown>
                          </div>
                          
                          <div className="mt-20 pt-10 border-t border-divider flex flex-col md:flex-row justify-between items-center gap-4 opacity-40">
                             <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-xl bg-muted border border-divider flex items-center justify-center text-xs font-black">
                                   {currentArticle.authorId?.firstName?.[0]}
                                </div>
                                <div>
                                   <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Original Curator</p>
                                   <p className="text-[11px] font-bold text-foreground truncate">{currentArticle.authorId?.firstName} {currentArticle.authorId?.lastName}</p>
                                </div>
                             </div>
                             <div className="text-right">
                                <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Last Synchronization</p>
                                <p className="text-[11px] font-bold text-foreground">{format(new Date(currentArticle.updatedAt), 'MMMM dd, yyyy HH:mm')}</p>
                             </div>
                          </div>
                       </div>
                    </div>
                 </div>
               )}

               {/* Editor View (Create or Edit) */}
               {(viewMode === 'EDIT' || viewMode === 'CREATE') && (
                 <div className="flex-1 flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-500">
                    <div className="px-8 py-4 border-b border-divider flex items-center justify-between bg-muted/5">
                        <div className="flex items-center gap-4">
                           <button 
                             onClick={() => setViewMode(viewMode === 'CREATE' ? 'LATEST' : 'VIEW')}
                             className="p-2 hover:bg-muted/50 rounded-xl transition-all"
                           >
                             <ArrowLeft size={18} />
                           </button>
                           <h2 className="text-sm font-black uppercase tracking-widest">{viewMode === 'CREATE' ? 'Draft New Article' : 'Revision Mode'}</h2>
                        </div>
                        <div className="flex items-center gap-2 bg-muted/20 p-1 rounded-xl border border-divider">
                           <button 
                             onClick={() => setIsPreview(false)}
                             className={cn("px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all", !isPreview ? "bg-card text-foreground shadow-sm shadow-black/20" : "text-muted-foreground")}
                           >
                             Editor
                           </button>
                           <button 
                             onClick={() => setIsPreview(true)}
                             className={cn("px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all", isPreview ? "bg-card text-foreground shadow-sm shadow-black/20" : "text-muted-foreground")}
                           >
                             Preview
                           </button>
                        </div>
                        <Button 
                          onClick={handleSave}
                          disabled={loading}
                          className="h-9 px-8 rounded-xl text-[10px] font-black uppercase tracking-widest gap-2 shadow-lg shadow-primary/20"
                        >
                          {loading ? <Loader2 className="animate-spin" size={14}/> : <Save size={14} />}
                          Commit Changes
                        </Button>
                    </div>

                    <div className="flex-1 flex overflow-hidden">
                       <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
                          {isPreview ? (
                            <div className="max-w-4xl mx-auto prose prose-sm prose-invert dark-markdown">
                               <h1 className="text-4xl font-black uppercase tracking-tight mb-8">{editTitle || 'No Title'}</h1>
                               <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                 {editContent || '*No content provided*'}
                               </ReactMarkdown>
                            </div>
                          ) : (
                            <div className="max-w-4xl mx-auto space-y-8">
                               <div className="space-y-2">
                                  <input 
                                    value={editTitle}
                                    onChange={(e) => setEditTitle(e.target.value)}
                                    placeholder="Enter Article Title..."
                                    className="w-full text-4xl font-black uppercase tracking-tight bg-transparent border-none outline-none placeholder:opacity-20 text-foreground"
                                  />
                                  <div className="flex items-center gap-4">
                                     <div className="flex-1 max-w-[200px]">
                                        <CustomSelect 
                                          value={editCategoryId} 
                                          onChange={setEditCategoryId} 
                                          options={categories.map(c => ({ value: c._id, label: c.name }))}
                                          className="py-1.5 rounded-xl bg-muted/20 text-[10px] font-black uppercase"
                                        />
                                     </div>
                                     <div className="flex-1 flex items-center gap-2 bg-muted/20 px-3 py-1.5 rounded-xl border border-divider">
                                        <Tag size={14} className="text-muted-foreground" />
                                        <input 
                                          value={editTags}
                                          onChange={(e) => setEditTags(e.target.value)}
                                          placeholder="Tags (comma separated)"
                                          className="bg-transparent border-none outline-none text-[10px] font-black uppercase tracking-widest w-full"
                                        />
                                     </div>
                                  </div>
                               </div>
                               <textarea 
                                 value={editContent}
                                 onChange={(e) => setEditContent(e.target.value)}
                                 placeholder="Start documenting with Markdown..."
                                 className="w-full min-h-[500px] bg-transparent border-none outline-none resize-none text-base font-medium leading-relaxed placeholder:opacity-20 custom-scrollbar"
                               />
                            </div>
                          )}
                       </div>
                       {!isPreview && (
                          <div className="w-64 border-l border-divider p-6 bg-muted/5 space-y-6 overflow-y-auto hidden xl:block">
                             <div className="space-y-4">
                                <h4 className="text-[9px] font-black uppercase tracking-widest text-primary opacity-60">Markdown Guide</h4>
                                <div className="space-y-3 opacity-40">
                                   <div className="text-[10px] space-y-1">
                                      <p className="font-black text-foreground"># Header 1</p>
                                      <p className="font-black text-foreground">## Header 2</p>
                                      <p className="font-black text-foreground">**Bold Text**</p>
                                      <p className="font-black text-foreground">*Italic Text*</p>
                                      <p className="font-black text-foreground">- List Item</p>
                                      <p className="font-black text-foreground">`Inline Code`</p>
                                   </div>
                                </div>
                             </div>
                             <div className="pt-6 border-t border-divider">
                                <h4 className="text-[9px] font-black uppercase tracking-widest text-primary opacity-60">Publishing Rules</h4>
                                <p className="text-[10px] font-medium leading-relaxed text-muted-foreground mt-2">
                                   Articles are immediately visible to the organization. All modifications are tracked globally.
                                </p>
                             </div>
                          </div>
                       )}
                    </div>
                 </div>
               )}
             </>
           )}
        </main>
      </div>

      <style jsx global>{`
        .dark-markdown h1 { font-size: 2.25rem; font-weight: 900; text-transform: uppercase; letter-spacing: -0.025em; border-bottom: 2px solid var(--divider); padding-bottom: 1rem; margin-bottom: 2rem; }
        .dark-markdown h2 { font-size: 1.5rem; font-weight: 900; text-transform: uppercase; letter-spacing: -0.025em; margin-top: 2.5rem; margin-bottom: 1rem; color: var(--primary); }
        .dark-markdown h3 { font-size: 1.125rem; font-weight: 900; text-transform: uppercase; margin-top: 2rem; margin-bottom: 0.75rem; }
        .dark-markdown p { line-height: 1.8; margin-bottom: 1.5rem; color: rgba(255,255,255,0.8); font-weight: 500; font-size: 0.9375rem; }
        .dark-markdown ul { list-style-type: none; margin-bottom: 1.5rem; padding-left: 1.5rem; }
        .dark-markdown li { position: relative; margin-bottom: 0.75rem; line-height: 1.6; font-weight: 500; color: rgba(255,255,255,0.7); }
        .dark-markdown li::before { content: ""; position: absolute; left: -1.25rem; top: 0.625rem; width: 0.5rem; height: 1px; background: var(--primary); }
        .dark-markdown code { background: rgba(var(--primary-rgb), 0.1); color: var(--primary); padding: 0.2rem 0.4rem; rounded: 0.375rem; font-family: monospace; font-size: 0.875rem; }
        .dark-markdown blockquote { border-left: 4px solid var(--primary); padding-left: 1.5rem; font-style: italic; opacity: 0.7; margin-bottom: 1.5rem; }
      `}</style>
    </div>
  );
}
