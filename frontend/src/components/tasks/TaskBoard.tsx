'use client';

import { useState, useCallback, useEffect } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
  defaultAnnouncements,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import { Task, TaskStatus } from '@/types/task';
import { TaskColumn } from './TaskColumn';
import { TaskCard } from './TaskCard';
import { TaskDetailDrawer } from './TaskDetailDrawer';
import api from '@/services/api';
import toast from 'react-hot-toast';

interface TaskBoardProps {
  initialTasks: Task[];
  allTasks?: Task[];
  projectMembers?: any[];
  onTaskUpdate?: () => void;
}

export function TaskBoard({ initialTasks, allTasks, projectMembers, onTaskUpdate }: TaskBoardProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Sync tasks when parent re-fetches (e.g. after creating a new task)
  useEffect(() => {
    setTasks(initialTasks);
  }, [initialTasks]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const findColumn = (id: string | number) => {
    if (id in TaskStatus) return id as TaskStatus;
    const task = tasks.find((t) => t._id === id);
    return task ? task.status : null;
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = tasks.find((t) => t._id === active.id);
    if (task) setActiveTask(task);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const activeColumn = findColumn(activeId);
    const overColumn = findColumn(overId);

    if (!activeColumn || !overColumn || activeColumn === overColumn) return;

    setTasks((prev) => {
      const activeIndex = prev.findIndex((t) => t._id === activeId);
      const newTasks = [...prev];
      newTasks[activeIndex] = { ...newTasks[activeIndex], status: overColumn };
      return newTasks;
    });
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    const taskBeforeDrag = activeTask;
    setActiveTask(null);

    if (!over || !taskBeforeDrag) return;

    const activeId = active.id as string;
    const overId = over.id as string;
    
    // Determine target status
    const targetStatus = findColumn(overId);
    
    // Check if it actually moved to a different column from where it started
    if (targetStatus && taskBeforeDrag.status !== targetStatus) {
      try {
        await api.patch(`/tasks/${activeId}`, { status: targetStatus });
        toast.success(`Task moved to ${targetStatus.replace('_', ' ')}`);
        onTaskUpdate?.();
      } catch (error) {
        toast.error('Failed to update task status');
        onTaskUpdate?.();
      }
    }
  };

  const tasksByStatus = (status: TaskStatus) => tasks.filter((t) => t.status === status);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-6 h-full pb-10 min-h-[700px] overflow-x-auto w-full scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent pr-8">
        <TaskColumn 
          id={TaskStatus.BACKLOG} 
          title="Backlog" 
          tasks={tasksByStatus(TaskStatus.BACKLOG)}
          allTasks={allTasks || tasks}
          onTaskClick={(task) => { setSelectedTask(task); setIsDrawerOpen(true); }}
        />
        <TaskColumn 
          id={TaskStatus.TODO} 
          title="To Do" 
          tasks={tasksByStatus(TaskStatus.TODO)}
          allTasks={allTasks || tasks}
          onTaskClick={(task) => { setSelectedTask(task); setIsDrawerOpen(true); }}
        />
        <TaskColumn 
          id={TaskStatus.IN_PROGRESS} 
          title="In Progress" 
          tasks={tasksByStatus(TaskStatus.IN_PROGRESS)}
          allTasks={allTasks || tasks}
          onTaskClick={(task) => { setSelectedTask(task); setIsDrawerOpen(true); }}
        />
        <TaskColumn 
          id={TaskStatus.IN_REVIEW} 
          title="In Review" 
          tasks={tasksByStatus(TaskStatus.IN_REVIEW)}
          allTasks={allTasks || tasks}
          onTaskClick={(task) => { setSelectedTask(task); setIsDrawerOpen(true); }}
        />
        <TaskColumn 
          id={TaskStatus.TESTING} 
          title="Testing" 
          tasks={tasksByStatus(TaskStatus.TESTING)}
          allTasks={allTasks || tasks}
          onTaskClick={(task) => { setSelectedTask(task); setIsDrawerOpen(true); }}
        />
        <TaskColumn 
          id={TaskStatus.DONE} 
          title="Done" 
          tasks={tasksByStatus(TaskStatus.DONE)}
          allTasks={allTasks || tasks}
          onTaskClick={(task) => { setSelectedTask(task); setIsDrawerOpen(true); }}
        />
      </div>

      <TaskDetailDrawer 
        task={selectedTask}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onUpdate={() => {
          onTaskUpdate?.();
        }}
        projectMembers={projectMembers || []}
      />

      <DragOverlay>
        {activeTask ? (
          <div className="w-[340px] rotate-3 scale-110 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] transition-transform duration-500">
            <TaskCard task={activeTask} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
