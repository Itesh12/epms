import React, { useState } from 'react';
import { Users, UserPlus, ShieldAlert, FileText, Key, RefreshCcw } from 'lucide-react';

const ActionCard = ({ label, description, icon: Icon, color, onClick }: any) => (
  <div 
    onClick={onClick}
    className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer group"
  >
    <div className={`${color} w-12 h-12 rounded-xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform`}>
      <Icon size={24} />
    </div>
    <h3 className="text-lg font-bold text-gray-900 mb-2">{label}</h3>
    <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
  </div>
);

export default function HRDashboard() {
  const [showResetModal, setShowResetModal] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);

  const handleGenerateCode = () => {
    // Mocking API call for now to show UI flow
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedCode(code);
    setShowResetModal(true);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Workforce Management</h1>
        <p className="text-sm text-gray-500">Manage employee onboarding, security requests, and compliance.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <ActionCard 
          label="Onboard Talent" 
          description="Send invite codes to new hires." 
          icon={UserPlus} 
          color="bg-blue-600" 
        />
        <ActionCard 
          label="Security Tool" 
          description="Quick generate user reset codes." 
          icon={Key} 
          color="bg-red-500"
          onClick={handleGenerateCode}
        />
        <ActionCard 
          label="Employee Records" 
          description="View and update personnel files." 
          icon={Users} 
          color="bg-purple-600" 
        />
        <ActionCard 
          label="Reports" 
          description="Generate workforce compliance reports." 
          icon={FileText} 
          color="bg-orange-500" 
        />
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50 bg-gray-50/30 flex items-center justify-between">
          <h3 className="font-bold text-gray-900">Recent Security Requests</h3>
          <span className="px-2 py-1 rounded-md bg-red-50 text-red-600 text-xs font-bold">Action Required</span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 text-[10px] uppercase tracking-widest text-gray-400 font-bold">
              <tr>
                <th className="px-6 py-4">Employee</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Requested</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              <tr className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">JD</div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">John Doe</p>
                      <p className="text-[10px] text-gray-400">john@doe.com</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 rounded-full bg-orange-50 text-orange-600 text-[10px] font-bold">RE-AUTH PENDING</span>
                </td>
                <td className="px-6 py-4 text-xs text-gray-500 font-medium">2 hours ago</td>
                <td className="px-6 py-4 text-right">
                  <button 
                    onClick={handleGenerateCode}
                    className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors group"
                    title="Generate Reset Code"
                  >
                    <RefreshCcw size={16} className="group-active:rotate-180 transition-transform" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Security Code Modal */}
      {showResetModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
          <div className="bg-white rounded-[2rem] max-w-sm w-full p-8 shadow-2xl relative overflow-hidden">
            <div className="relative z-10 text-center">
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <ShieldAlert size={32} />
              </div>
              <h2 className="text-2xl font-black text-gray-900 mb-2">Reset Code Generated</h2>
              <p className="text-sm text-gray-500 mb-8 px-4">Provide this code to the employee. It will expire in 2 hours.</p>
              
              <div className="bg-gray-50 rounded-2xl p-6 mb-8 border-2 border-dashed border-gray-200">
                <span className="text-4xl font-black text-blue-600 tracking-[0.5em] ml-4">{generatedCode}</span>
              </div>

              <button 
                onClick={() => setShowResetModal(false)}
                className="w-full bg-gray-900 text-white font-bold py-4 rounded-xl hover:bg-black transition-all"
              >
                Done
              </button>
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-50 rounded-full blur-3xl -mr-16 -mt-16 opacity-50" />
          </div>
        </div>
      )}
    </div>
  );
}
