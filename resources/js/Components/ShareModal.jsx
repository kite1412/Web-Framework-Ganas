import { useState } from 'react';
import { X, Copy, Check, Link2, Lock, Globe } from 'lucide-react';

export default function ShareModal({ isOpen, onClose, item, itemType, theme }) {
  const [copied, setCopied] = useState(false);
  
  if (!isOpen || !item) return null;

  // Check if item is public
  const isPublic = itemType === 'project' ? !item.is_private : true;
  
  // Get project for task if itemType is task
  const getProject = () => {
    if (itemType === 'task') {
      const projects = JSON.parse(localStorage.getItem('projects') || '[]');
      return projects.find(p => p.id === item.project_id);
    }
    return null;
  };

  const project = getProject();
  const canShare = itemType === 'project' ? isPublic : (project && !project.is_private);

  // Generate share link
  const shareLink = `${window.location.origin}/${itemType}/${item.id}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-[#2A2A2A] rounded-2xl w-full max-w-md p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-[#1A1A1A] dark:text-white text-xl font-semibold flex items-center gap-2">
            <Link2 className="w-5 h-5" />
            Share {itemType === 'project' ? 'Project' : 'Task'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#F5F5F5] dark:hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-[#1A1A1A] dark:text-white" />
          </button>
        </div>

        {!canShare ? (
          <div className="space-y-4">
            <div className="p-4 bg-red-50 dark:bg-red-600/10 border border-red-200 dark:border-red-600/20 rounded-xl">
              <div className="flex items-start gap-3">
                <Lock className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-red-600 dark:text-red-400 font-medium mb-1">
                    Cannot Share
                  </h3>
                  <p className="text-red-600/80 dark:text-red-400/80 text-sm">
                    {itemType === 'project' 
                      ? 'This project is private. Change it to public to enable sharing.'
                      : 'The project containing this task is private. Change the project visibility to public first.'}
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full px-6 py-3 bg-[#F5F5F5] dark:bg-white/5 text-[#1A1A1A] dark:text-white border border-[#E8E8E8] dark:border-[#333] rounded-xl hover:bg-[#E8E8E8] dark:hover:bg-white/10 transition-all"
            >
              Close
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Item Preview */}
            <div className="p-4 bg-[#F5F5F5] dark:bg-white/5 rounded-xl border border-[#E8E8E8] dark:border-[#333]">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-[#4CAF50]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Globe className="w-5 h-5 text-[#4CAF50]" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-[#1A1A1A] dark:text-white font-medium mb-1 truncate">
                    {item.title}
                  </h3>
                  <p className="text-[#1A1A1A]/60 dark:text-white/60 text-sm truncate">
                    {item.description || 'No description'}
                  </p>
                </div>
              </div>
            </div>

            {/* Share Link */}
            <div>
              <label className="block text-[#1A1A1A] dark:text-white text-sm font-medium mb-2">
                Share Link
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={shareLink}
                  readOnly
                  className="flex-1 px-4 py-3 bg-[#F5F5F5] dark:bg-white/5 border border-[#E8E8E8] dark:border-[#333] rounded-xl text-[#1A1A1A] dark:text-white text-sm"
                />
                <button
                  onClick={handleCopyLink}
                  className={`px-6 py-3 rounded-xl transition-all flex items-center gap-2 ${
                    copied
                      ? 'bg-[#4CAF50] text-white'
                      : 'bg-[#4CAF50] text-white hover:bg-[#45a049]'
                  }`}
                >
                  {copied ? (
                    <>
                      <Check className="w-5 h-5" />
                      <span className="hidden sm:inline">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-5 h-5" />
                      <span className="hidden sm:inline">Copy</span>
                    </>
                  )}
                </button>
              </div>
              <p className="text-[#1A1A1A]/60 dark:text-white/60 text-xs mt-2">
                Anyone with this link can view this {itemType}.
              </p>
            </div>

            <button
              onClick={onClose}
              className="w-full px-6 py-3 bg-[#F5F5F5] dark:bg-white/5 text-[#1A1A1A] dark:text-white border border-[#E8E8E8] dark:border-[#333] rounded-xl hover:bg-[#E8E8E8] dark:hover:bg-white/10 transition-all"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
