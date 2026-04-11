'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProjects, createProject } from '@/services/projects';
import { Plus, Briefcase, ChevronRight, Clock, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Project } from '@epms/shared';
import { format } from 'date-fns';

export default function ProjectsPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', description: '' });

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: getProjects,
  });

  const createMutation = useMutation({
    mutationFn: (data: Partial<Project>) => createProject(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setIsModalOpen(false);
      setNewProject({ name: '', description: '' });
    },
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProject.name) return;
    createMutation.mutate(newProject);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <span className="p-2 bg-blue-100 text-blue-600 rounded-xl">
              <Briefcase size={24} />
            </span>
            Projects
          </h1>
          <p className="text-gray-500 mt-1">Manage your team's projects and tasks</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
        >
          <Plus size={20} />
          New Project
        </button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project: Project) => (
            <Link key={project.id || (project as any)._id} href={`/projects/${project.id || (project as any)._id}`}>
              <motion.div
                whileHover={{ y: -4, scale: 1.01 }}
                className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 cursor-pointer h-full flex flex-col transition-all hover:shadow-md"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-bold text-gray-900 line-clamp-1">{project.name}</h3>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                    project.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                    project.status === 'COMPLETED' ? 'bg-purple-100 text-purple-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {project.status}
                  </span>
                </div>
                
                <p className="text-gray-500 text-sm line-clamp-2 mb-6 flex-1">
                  {project.description || 'No description provided.'}
                </p>
                
                <div className="flex items-center justify-between text-sm text-gray-400 mt-auto pt-4 border-t border-gray-50">
                  <div className="flex flex-col gap-1.5">
                    <span className="flex items-center gap-1.5"><Clock size={14}/> {format(new Date(project.createdAt!), 'MMM d, yyyy')}</span>
                    <span className="flex items-center gap-1.5"><Users size={14}/> {project.members?.length || 0} Members</span>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                    <ChevronRight size={18} />
                  </div>
                </div>
              </motion.div>
            </Link>
          ))}
          {projects.length === 0 && (
            <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-gray-100">
              <p className="text-gray-500">No projects found. Create one to get started!</p>
            </div>
          )}
        </div>
      )}

      {/* Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Create New Project</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                &times;
              </button>
            </div>
            
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
                <input
                  type="text"
                  required
                  value={newProject.name}
                  onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  placeholder="E.g. Website Redesign"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all h-24 resize-none"
                  placeholder="What is this project about?"
                />
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 inline-flex items-center justify-center gap-2"
                >
                  {createMutation.isPending ? 'Creating...' : 'Create Project'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
