import { useState } from 'react';
import { 
  User, 
  Mail, 
  Calendar, 
  Settings, 
  Bell, 
  Shield, 
  LogOut,
  CheckCircle,
  ArrowLeft,
  Edit2,
  X,
  Sun,
  Moon
} from 'lucide-react';

export default function Profile({ currentUser, onLogout, onBack }) {
  const [theme, setTheme] = useState(
    localStorage.getItem('theme') || 'light'
  );
  const [isEditMode, setIsEditMode] = useState(false);
  const [userName, setUserName] = useState(
    localStorage.getItem('userName') || (currentUser ? currentUser.split('@')[0] : 'User')
  );
  const [tempUserData, setTempUserData] = useState({
    name: userName,
    phone_number: currentUser || localStorage.getItem('userPhone') || '081234567890',
    bio: localStorage.getItem('userBio') || 'Task management enthusiast'
  });

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  const handleSaveProfile = () => {
    setUserName(tempUserData.name);
    localStorage.setItem('userName', tempUserData.name);
    localStorage.setItem('userPhone', tempUserData.phone_number);
    localStorage.setItem('userBio', tempUserData.bio);
    setIsEditMode(false);
  };

  const handleCancelEdit = () => {
    setTempUserData({
      name: userName,
      phone_number: currentUser || localStorage.getItem('userPhone') || '081234567890',
      bio: localStorage.getItem('userBio') || 'Task management enthusiast'
    });
    setIsEditMode(false);
  };

  const joinDate = new Date(2025, 0, 1).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  });

  const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.completed).length,
    pending: tasks.filter(t => !t.completed).length,
    high: tasks.filter(t => t.priority === 'high' && !t.completed).length
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-[#F5F5F5] dark:from-[#0F0F0F] dark:to-[#1A1A1A] transition-colors">
      {/* Header */}
      <header className="border-b border-[#E8E8E8] dark:border-white/10 bg-white/80 dark:bg-black/30 backdrop-blur-sm sticky top-0 z-40 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="p-2 hover:bg-[#F5F5F5] dark:hover:bg-white/10 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-[#1A1A1A] dark:text-white" />
              </button>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[#4CAF50] rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <span className="text-[#1A1A1A] dark:text-white hidden sm:block font-medium">
                  Profile Settings
                </span>
              </div>
            </div>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 hover:bg-[#F5F5F5] dark:hover:bg-white/10 rounded-lg transition-colors"
            >
              {theme === 'light' ? (
                <Moon className="w-5 h-5 text-[#1A1A1A]" />
              ) : (
                <Sun className="w-5 h-5 text-yellow-300" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Card */}
        <div className="bg-white dark:bg-[#2A2A2A] rounded-2xl p-8 border border-[#E8E8E8] dark:border-[#333] mb-6 transition-colors">
          <div className="flex flex-col sm:flex-row items-center gap-6 mb-8">
            {/* Avatar */}
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-br from-[#4CAF50] to-[#45a049] rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                {userName.charAt(0).toUpperCase()}
              </div>
              <button className="absolute bottom-0 right-0 w-8 h-8 bg-white dark:bg-[#2A2A2A] border-2 border-[#E8E8E8] dark:border-[#333] rounded-full flex items-center justify-center hover:bg-[#F5F5F5] dark:hover:bg-white/10 transition-colors">
                <Edit2 className="w-4 h-4 text-[#1A1A1A] dark:text-white" />
              </button>
            </div>

            {/* User Info */}
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-2xl font-bold text-[#1A1A1A] dark:text-white mb-2">
                {userName}
              </h1>
              <div className="flex items-center gap-2 text-[#1A1A1A]/60 dark:text-white/60 mb-1 justify-center sm:justify-start">
                <Mail className="w-4 h-4" />
                <span className="text-sm">{tempUserData.phone_number}</span>
              </div>
              <div className="flex items-center gap-2 text-[#1A1A1A]/60 dark:text-white/60 justify-center sm:justify-start">
                <Calendar className="w-4 h-4" />
                <span className="text-sm">Joined {joinDate}</span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-[#F5F5F5] dark:bg-white/5 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-[#1A1A1A] dark:text-white mb-1">
                {stats.total}
              </p>
              <p className="text-xs text-[#1A1A1A]/60 dark:text-white/60">Total Tasks</p>
            </div>
            <div className="bg-[#F5F5F5] dark:bg-white/5 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-[#4CAF50] mb-1">
                {stats.completed}
              </p>
              <p className="text-xs text-[#1A1A1A]/60 dark:text-white/60">Completed</p>
            </div>
            <div className="bg-[#F5F5F5] dark:bg-white/5 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-yellow-500 mb-1">
                {stats.pending}
              </p>
              <p className="text-xs text-[#1A1A1A]/60 dark:text-white/60">Pending</p>
            </div>
            <div className="bg-[#F5F5F5] dark:bg-white/5 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-red-500 mb-1">
                {stats.high}
              </p>
              <p className="text-xs text-[#1A1A1A]/60 dark:text-white/60">High Priority</p>
            </div>
          </div>
        </div>

        {/* Settings Sections */}
        <div className="space-y-4">
          {/* Edit Profile Section */}
          <div className="bg-white dark:bg-[#2A2A2A] rounded-xl border border-[#E8E8E8] dark:border-[#333] transition-colors overflow-hidden">
            <div className="p-4 border-b border-[#E8E8E8] dark:border-[#333] flex items-center justify-between">
              <h2 className="text-[#1A1A1A] dark:text-white font-semibold flex items-center gap-2">
                <User className="w-5 h-5" />
                Edit Profile
              </h2>
              {!isEditMode && (
                <button
                  onClick={() => setIsEditMode(true)}
                  className="px-4 py-2 bg-[#4CAF50] text-white rounded-lg hover:bg-[#45a049] transition-colors text-sm flex items-center gap-2"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit
                </button>
              )}
            </div>
            
            <div className="p-6 space-y-4">
              {/* Name Field */}
              <div>
                <label className="block text-[#1A1A1A] dark:text-white text-sm font-medium mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={tempUserData.name}
                  onChange={(e) => setTempUserData({ ...tempUserData, name: e.target.value })}
                  disabled={!isEditMode}
                  className={`w-full px-4 py-3 bg-[#F5F5F5] dark:bg-white/5 border border-[#E8E8E8] dark:border-[#333] rounded-xl text-[#1A1A1A] dark:text-white focus:outline-none focus:border-[#4CAF50] transition-all ${
                    !isEditMode ? 'opacity-60 cursor-not-allowed' : ''
                  }`}
                />
              </div>

              {/* Phone Number Field (Primary identifier) */}
              <div>
                <label className="block text-[#1A1A1A] dark:text-white text-sm font-medium mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={tempUserData.phone_number}
                  onChange={(e) => setTempUserData({ ...tempUserData, phone_number: e.target.value })}
                  disabled={!isEditMode}
                  className={`w-full px-4 py-3 bg-[#F5F5F5] dark:bg-white/5 border border-[#E8E8E8] dark:border-[#333] rounded-xl text-[#1A1A1A] dark:text-white focus:outline-none focus:border-[#4CAF50] transition-all ${
                    !isEditMode ? 'opacity-60 cursor-not-allowed' : ''
                  }`}
                />
                <p className="text-xs text-[#1A1A1A]/60 dark:text-white/60 mt-1">
                  Used for login and authentication
                </p>
              </div>

              {/* Bio Field */}
              <div>
                <label className="block text-[#1A1A1A] dark:text-white text-sm font-medium mb-2">
                  Bio
                </label>
                <textarea
                  value={tempUserData.bio}
                  onChange={(e) => setTempUserData({ ...tempUserData, bio: e.target.value })}
                  disabled={!isEditMode}
                  rows="3"
                  className={`w-full px-4 py-3 bg-[#F5F5F5] dark:bg-white/5 border border-[#E8E8E8] dark:border-[#333] rounded-xl text-[#1A1A1A] dark:text-white focus:outline-none focus:border-[#4CAF50] transition-all resize-none ${
                    !isEditMode ? 'opacity-60 cursor-not-allowed' : ''
                  }`}
                />
              </div>

              {/* Action Buttons */}
              {isEditMode && (
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={handleCancelEdit}
                    className="flex-1 px-6 py-3 bg-[#F5F5F5] dark:bg-white/5 text-[#1A1A1A] dark:text-white border border-[#E8E8E8] dark:border-[#333] rounded-xl hover:bg-[#E8E8E8] dark:hover:bg-white/10 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveProfile}
                    className="flex-1 px-6 py-3 bg-[#4CAF50] text-white rounded-xl hover:bg-[#45a049] transition-all shadow-lg shadow-[#4CAF50]/20"
                  >
                    Save Changes
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Account Settings */}
          <div className="bg-white dark:bg-[#2A2A2A] rounded-xl border border-[#E8E8E8] dark:border-[#333] transition-colors overflow-hidden">
            <div className="p-4 border-b border-[#E8E8E8] dark:border-[#333]">
              <h2 className="text-[#1A1A1A] dark:text-white font-semibold flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Account Settings
              </h2>
            </div>
            <div className="divide-y divide-[#E8E8E8] dark:divide-[#333]">
              <button className="w-full px-4 py-3 flex items-center justify-between hover:bg-[#F5F5F5] dark:hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-[#1A1A1A]/60 dark:text-white/60" />
                  <span className="text-[#1A1A1A] dark:text-white">Privacy & Security</span>
                </div>
              </button>
            </div>
          </div>

          {/* Preferences */}
          <div className="bg-white dark:bg-[#2A2A2A] rounded-xl border border-[#E8E8E8] dark:border-[#333] transition-colors overflow-hidden">
            <div className="p-4 border-b border-[#E8E8E8] dark:border-[#333]">
              <h2 className="text-[#1A1A1A] dark:text-white font-semibold flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Preferences
              </h2>
            </div>
            <div className="divide-y divide-[#E8E8E8] dark:divide-[#333]">
              <div className="px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {theme === 'light' ? (
                    <Moon className="w-5 h-5 text-[#1A1A1A]/60 dark:text-white/60" />
                  ) : (
                    <Sun className="w-5 h-5 text-yellow-300" />
                  )}
                  <span className="text-[#1A1A1A] dark:text-white">Dark Mode</span>
                </div>
                <button
                  onClick={toggleTheme}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    theme === 'dark' ? 'bg-[#4CAF50]' : 'bg-[#E8E8E8]'
                  }`}
                >
                  <div
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                      theme === 'dark' ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
              <button className="w-full px-4 py-3 flex items-center justify-between hover:bg-[#F5F5F5] dark:hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-[#1A1A1A]/60 dark:text-white/60" />
                  <span className="text-[#1A1A1A] dark:text-white">Notifications</span>
                </div>
              </button>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={onLogout}
            className="w-full bg-red-50 dark:bg-red-600/10 hover:bg-red-100 dark:hover:bg-red-600/20 text-red-600 dark:text-red-400 rounded-xl p-4 flex items-center justify-center gap-2 transition-colors border border-red-200 dark:border-red-600/20"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </main>
    </div>
  );
}
