import { useState } from 'react';
import { Calendar, MoreVertical, Trash2, ArrowRight, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/services/api';

interface ProjectCardProps {
  project: any;
  onUpdate: () => void;
}

export function ProjectCard({ project, onUpdate }: ProjectCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete "${project.title}"?`)) return;
    
    setIsDeleting(true);
    try {
      await api.delete(`/projects/${project._id}`);
      toast.success('Project deleted');
      onUpdate();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete');
      setIsDeleting(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    setIsUpdating(true);
    try {
      await api.patch(`/projects/${project._id}`, { status: newStatus });
      onUpdate(); // Refresh board
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to move project');
      setIsUpdating(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className={`p-4 rounded-2xl border bg-card shadow-sm hover:shadow-md transition-all group relative ${isDeleting || isUpdating ? 'opacity-50 pointer-events-none' : ''}`}>
      <div className="flex justify-between items-start mb-3">
        <h4 className="font-bold text-foreground leading-tight">{project.title}</h4>
        
        {/* Simple delete button for now */}
        <button 
          onClick={handleDelete}
          className="text-muted-foreground/50 hover:text-red-500 transition-colors p-1"
          title="Delete Project"
        >
          <Trash2 size={16} />
        </button>
      </div>
      
      {project.description && (
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2 leading-relaxed">
          {project.description}
        </p>
      )}

      <div className="flex items-center justify-between mt-4 text-xs font-medium text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <Calendar size={14} className="text-primary/70" />
          <span>{formatDate(project.createdAt)}</span>
        </div>
        
        {/* Status Movers */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {project.status === 'IN_PROGRESS' && (
            <button 
              onClick={() => handleStatusChange('TODO')}
              className="p-1.5 bg-muted hover:bg-primary hover:text-primary-foreground rounded-lg transition-colors"
              title="Move to Todo"
            >
              <ArrowLeft size={14} />
            </button>
          )}
          {project.status === 'DONE' && (
            <button 
              onClick={() => handleStatusChange('IN_PROGRESS')}
              className="p-1.5 bg-muted hover:bg-primary hover:text-primary-foreground rounded-lg transition-colors"
              title="Move to In Progress"
            >
              <ArrowLeft size={14} />
            </button>
          )}

          {project.status === 'TODO' && (
            <button 
              onClick={() => handleStatusChange('IN_PROGRESS')}
              className="p-1.5 bg-muted hover:bg-primary hover:text-primary-foreground rounded-lg transition-colors"
              title="Move to In Progress"
            >
              <ArrowRight size={14} />
            </button>
          )}
          {project.status === 'IN_PROGRESS' && (
            <button 
              onClick={() => handleStatusChange('DONE')}
              className="p-1.5 bg-muted hover:bg-primary hover:text-primary-foreground rounded-lg transition-colors"
              title="Move to Done"
            >
              <ArrowRight size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
