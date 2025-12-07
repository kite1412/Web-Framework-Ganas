import { Head } from '@inertiajs/react';
import 'flatpickr/dist/flatpickr.css';
import {
  Bell,
  CheckCircle,
  Clock,
  Edit2,
  Folder,
  FolderOpen,
  Globe,
  Lock,
  LogOut,
  Moon,
  MoreVertical,
  Plus,
  Search,
  Share2,
  Sun,
  Trash2,
  User,
  X
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import Profile from '../Components/Profile';
import ShareModal from '../Components/ShareModal';
import api from '../api/client';

export default function Dashboard() {
  // Normalize incoming props into internal handlers and values
  const navigate = (path) => {
    if (typeof window !== 'undefined') {
      // Fallback to hard navigation for SPA routes
      window.location.href = path === 'home' ? '/' : `/${path}`;
    }
  };

  const logout = async () => {
    try { await api.logout(); } catch {}
    try {
      localStorage.removeItem('auth_user');
      localStorage.removeItem('auth_token');
      localStorage.removeItem('projects');
      localStorage.removeItem('tasks');
      localStorage.removeItem('notifications');
    } catch {}
    navigate('home');
  };

  const resolvedUser = (() => {
    try {
      const authUserStr = localStorage.getItem('auth_user');
      if (authUserStr) {
        const authUser = JSON.parse(authUserStr);
        return authUser?.email || authUser?.name || '';
      }
    } catch {}
    return '';
  })();
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [editingProject, setEditingProject] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [openProjectMenuId, setOpenProjectMenuId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showNotification, setShowNotification] = useState(false);
  const [theme, setTheme] = useState('light');
  const [showProfile, setShowProfile] = useState(false);
  const [displayName, setDisplayName] = useState(() => {
    try {
      const authUserStr = localStorage.getItem('auth_user');
      if (authUserStr) {
        const authUser = JSON.parse(authUserStr);
        return authUser?.name || authUser?.email || 'User';
      }
    } catch {}
    return localStorage.getItem('userName') || (resolvedUser ? (resolvedUser.split('@')[0] || resolvedUser) : 'User');
  });
  const [notifications, setNotifications] = useState([]);
  const [shareModal, setShareModal] = useState({ isOpen: false, item: null, itemType: null });
  // Holds per-project total task counts so badges show real numbers immediately
  const [taskCounts, setTaskCounts] = useState({});

  const [projectFormData, setProjectFormData] = useState({
    title: '',
    description: '',
    is_private: true
  });

  const [taskFormData, setTaskFormData] = useState({
    title: '',
    description: '',
    deadline: '',
    reminderTime: '',
    priority: 'medium',
    completed: false
  });

  const deadlinePickerRef = useRef(null);
  const reminderPickerRef = useRef(null);
  const [deadlineTemp, setDeadlineTemp] = useState(null);
  const [reminderTemp, setReminderTemp] = useState(null);

  useEffect(() => {
    if (taskFormData.deadline) {
      const [date, time] = taskFormData.deadline.split('T');
      // Only create a Date when the time portion is present and non-empty.
      if (time && time.length > 0) {
        const parsed = new Date(`${date}T${time}`);
        setDeadlineTemp(isNaN(parsed.getTime()) ? null : parsed);
      } else {
        setDeadlineTemp(null);
      }
    } else {
      setDeadlineTemp(null);
    }
  }, [taskFormData.deadline]);

  useEffect(() => {
    if (taskFormData.reminderTime) {
      const [date, time] = taskFormData.reminderTime.split('T');
      // Only create a Date when the time portion is present and non-empty.
      if (time && time.length > 0) {
        const parsed = new Date(`${date}T${time}`);
        setReminderTemp(isNaN(parsed.getTime()) ? null : parsed);
      } else {
        setReminderTemp(null);
      }
    } else {
      setReminderTemp(null);
    }
  }, [taskFormData.reminderTime]);

  useEffect(() => {
    // Redirect to login if not authenticated
    try {
      const token = localStorage.getItem('auth_token');
      const authUserStr = localStorage.getItem('auth_user');
      const hasUserInfo = !!authUserStr && authUserStr !== 'null' && authUserStr !== 'undefined';
      if (!token || !hasUserInfo) {
        // Navigate to Home when not logged in
        navigate('home');
        return;
      }
    } catch {}

    // Update displayName from stored auth_user when the app mounts
    try {
      const authUserStr = localStorage.getItem('auth_user');
      if (authUserStr) {
        const authUser = JSON.parse(authUserStr);
        const inferred = authUser?.name || (authUser?.email ? authUser.email.split('@')[0] : null) || localStorage.getItem('userName');
        if (inferred) setDisplayName(inferred);
      } else {
        const fallbackName = localStorage.getItem('userName');
        if (fallbackName) setDisplayName(fallbackName);
      }
    } catch {};

    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    document.documentElement.classList.toggle('dark', savedTheme === 'dark');

    // Fetch authenticated profile and sync user info
    (async () => {
      try {
        const token = localStorage.getItem('auth_token');
        if (token) {
          const res = await fetch('/api/profile', { headers: { 'Authorization': `Bearer ${token}` } });
          if (res.ok) {
            const user = await res.json();
            const name = user?.name || '';
            const email = user?.email || '';
            if (email) {
              // store id, name, and email so other flows (create task, projects) can use user_id
              localStorage.setItem('auth_user', JSON.stringify({ id: user?.id, name: name, email: email }));
              localStorage.setItem('userEmail', email);
            }
            if (name) {
              localStorage.setItem('userName', name);
            }
            setDisplayName(name || email || (resolvedUser ? (resolvedUser.split('@')[0] || resolvedUser) : 'User'));
          }
        }
      } catch (err) {}
    })();

    // Fetch projects from API
    (async () => {
      try {
        const authUserStr = localStorage.getItem('auth_user');
        const authUser = authUserStr ? JSON.parse(authUserStr) : null;
        const data = await api.projects.list(authUser?.id ? { user_id: authUser.id } : {});
        setProjects(data || []);
      } catch (err) {
        // Fallback to local data if API fails
        const savedProjects = localStorage.getItem('projects');
        if (savedProjects) setProjects(JSON.parse(savedProjects));
      }
    })();

    // Sync displayName when localStorage changes in other tabs
    const onStorage = (e) => {
      if (!e) return;
      if (e.key === 'auth_user' || e.key === 'userName') {
        try {
          const authUserStr = localStorage.getItem('auth_user');
          if (authUserStr) {
            const authUser = JSON.parse(authUserStr);
            const inferred = authUser?.name || (authUser?.email ? authUser.email.split('@')[0] : null) || localStorage.getItem('userName');
            setDisplayName(inferred || 'User');
          } else {
            setDisplayName(localStorage.getItem('userName') || 'User');
          }
        } catch {
          setDisplayName(localStorage.getItem('userName') || 'User');
        }
      }
    };
    if (typeof window !== 'undefined' && window.addEventListener) {
      window.addEventListener('storage', onStorage);
    }

    // Initial tasks will be fetched per selected project below
    
    setTimeout(() => setIsLoading(false), 800);

    const savedNotifications = localStorage.getItem('notifications');
    if (savedNotifications) {
      setNotifications(JSON.parse(savedNotifications));
    }

    return () => {
      if (typeof window !== 'undefined' && window.removeEventListener) {
        window.removeEventListener('storage', onStorage);
      }
    };
  }, []);

  // Also watch for immediate local changes in the same tab that may update auth_user
  useEffect(() => {
    try {
      const authUserStr = localStorage.getItem('auth_user');
      if (authUserStr) {
        const authUser = JSON.parse(authUserStr);
        const inferred = authUser?.name || (authUser?.email ? authUser.email.split('@')[0] : null) || localStorage.getItem('userName');
        if (inferred) setDisplayName(inferred);
      }
    } catch {}
  }, [/* runs on mount; kept empty intentionally to perform a single check */]);

  useEffect(() => {
    if (tasks.length > 0 && !isLoading) {
      const upcomingTasks = tasks
        .filter(task => {
          if (task.completed) return false;
          const deadline = new Date(task.deadline);
          const now = new Date();
          const diff = deadline.getTime() - now.getTime();
          const hours = diff / (1000 * 60 * 60);
          return hours <= 24 && hours > 0;
        })
        .map(task => ({
          id: task.id,
          title: task.title,
          message: `"${task.title}" is due ${getTimeRemaining(task.deadline)}`,
          time: new Date().toISOString(),
          read: false
        }));

      if (upcomingTasks.length > 0) {
        setNotifications(upcomingTasks);
        localStorage.setItem('notifications', JSON.stringify(upcomingTasks));
      }
    }
  }, [tasks, isLoading]);

  // Fetch tasks when a project is selected
  useEffect(() => {
    (async () => {
      try {
        if (selectedProject?.id) {
          const token = localStorage.getItem('auth_token');
          const headers = { Accept: 'application/json' };
          if (token) headers['Authorization'] = `Bearer ${token}`;
          const res = await fetch(`/api/tasks?project_id=${encodeURIComponent(selectedProject.id)}`, { headers });
          if (!res.ok) throw new Error('Failed to fetch tasks');
          const payload = await res.json();
          const list = Array.isArray(payload) ? payload : (payload.data || []);
          setTasks(list);
        }
      } catch (err) {
        // keep existing tasks if API fails
      }
    })();
  }, [selectedProject?.id]);

  // Fetch per-project task counts so sidebar shows accurate totals on first load
  useEffect(() => {
    (async () => {
      try {
        if (!projects || projects.length === 0) return;
        // Fetch counts in parallel per project; fall back to 0 on failure
        const results = await Promise.all(
          projects.map(async (p) => {
            try {
              const list = await api.tasks.list({ project_id: p.id });
              return { id: p.id, count: Array.isArray(list) ? list.length : 0 };
            } catch {
              return { id: p.id, count: 0 };
            }
          })
        );
        const next = {};
        results.forEach(({ id, count }) => { next[id] = count; });
        setTaskCounts(next);
      } catch {}
    })();
  }, [projects]);

  useEffect(() => {
    if (projects.length > 0 || !isLoading) {
      localStorage.setItem('projects', JSON.stringify(projects));
    }
  }, [projects, isLoading]);

  useEffect(() => {
    if (tasks.length > 0 || !isLoading) {
      localStorage.setItem('tasks', JSON.stringify(tasks));
    }
  }, [tasks, isLoading]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  const handleAddProject = async (projectData) => {
    try {
      const authUserStr = localStorage.getItem('auth_user');
      const authUser = authUserStr ? JSON.parse(authUserStr) : null;
      const payload = {
        title: projectData.title,
        description: projectData.description,
        is_private: projectData.is_private,
      };
      const created = await api.projects.create(payload);
      setProjects([created, ...projects]);
      setIsProjectModalOpen(false);
      resetProjectForm();
    } catch (err) {
      alert(err?.data?.message || err.message || 'Failed to create project');
    }
  };

  const handleEditProject = (projectData) => {
    if (editingProject) {
      (async () => {
        try {
          const payload = {
            title: projectData.title,
            description: projectData.description,
            is_private: projectData.is_private,
          };
          const updated = await api.projects.update(editingProject.id, payload);
          setProjects(projects.map(p => 
            p.id === editingProject.id 
              ? { ...p, ...updated }
              : p
          ));
          setEditingProject(null);
          setIsProjectModalOpen(false);
          resetProjectForm();
        } catch (err) {
          alert(err?.data?.message || err.message || 'Failed to update project');
        }
      })();
    }
  };

  const handleDeleteProject = (id) => {
    // Verify delete action
    const confirmed = typeof window !== 'undefined'
      ? window.confirm('Hapus proyek ini? Semua tugas akan dihapus. Tindakan ini tidak dapat dibatalkan.')
      : true;
    if (!confirmed) {
      setOpenProjectMenuId(null);
      return;
    }
    const prevProjects = projects;
    const prevTasks = tasks;
    // Optimistic remove project and its tasks from UI
    setProjects(projects.filter(p => p.id !== id));
    setTasks(tasks.filter(t => t.project_id !== id));
    // Drop associated count badge
    setTaskCounts(prev => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    if (selectedProject?.id === id) {
      setSelectedProject(null);
    }
    setOpenProjectMenuId(null);
    (async () => {
      try {
        await api.projects.delete(id);
      } catch (err) {
        // Revert on failure
        setProjects(prevProjects);
        setTasks(prevTasks);
        setTaskCounts(prev => ({ ...prev, [id]: prev[id] ?? prevTasks.filter(t => t.project_id === id).length }));
        alert(err?.data?.message || err.message || 'Failed to delete project');
      }
    })();
  };

  const openEditProjectModal = (project) => {
    setEditingProject(project);
    setProjectFormData({
      title: project.title,
      description: project.description,
      is_private: project.is_private
    });
    setIsProjectModalOpen(true);
    setOpenProjectMenuId(null);
  };

  const openAddProjectModal = () => {
    setEditingProject(null);
    resetProjectForm();
    setIsProjectModalOpen(true);
  };

  const resetProjectForm = () => {
    setProjectFormData({
      title: '',
      description: '',
      is_private: true
    });
  };

  const handleProjectSubmit = (e) => {
    e.preventDefault();
    if (editingProject) {
      handleEditProject(projectFormData);
    } else {
      handleAddProject(projectFormData);
    }
  };

  const handleAddTask = async (taskData) => {
    if (!selectedProject) {
      alert('Please select a project first!');
      return;
    }
    try {
      const authUserStr = localStorage.getItem('auth_user');
      const authUser = authUserStr ? JSON.parse(authUserStr) : null;
      const finalDeadline = taskData.deadline && String(taskData.deadline).endsWith('T') ? null : (taskData.deadline || null);
      const reminders = taskData.reminderTime && !String(taskData.reminderTime).endsWith('T') ? [taskData.reminderTime] : [];
      const payload = {
        project_id: selectedProject.id,
        user_id: authUser?.id,
        title: taskData.title,
        description: taskData.description,
        deadline: finalDeadline,
        priority: taskData.priority,
        status: 'pending',
        reminders,
      };
      const created = await api.tasks.create(payload);
      console.log('Created task:', created);
      console.log('Payload: ', payload);
      setTasks([created, ...tasks]);
      // Update per-project count badge
      setTaskCounts(prev => ({
        ...prev,
        [selectedProject.id]: (prev[selectedProject.id] ?? 0) + 1
      }));
      setIsTaskModalOpen(false);
      resetTaskForm();
    } catch (err) {
      alert(err?.data?.message || err.message || 'Failed to create task');
    }
  };

  const handleEditTask = (taskData) => {
    if (editingTask) {
      (async () => {
        try {
          const authUserStr = localStorage.getItem('auth_user');
          const authUser = authUserStr ? JSON.parse(authUserStr) : null;
          const finalDeadline = taskData.deadline && String(taskData.deadline).endsWith('T') ? null : (taskData.deadline || null);
          const reminders = taskData.reminderTime && !String(taskData.reminderTime).endsWith('T') ? [taskData.reminderTime] : undefined;
          const payload = {
            project_id: editingTask.project_id,
            user_id: authUser?.id,
            title: taskData.title,
            description: taskData.description,
            deadline: finalDeadline,
            priority: taskData.priority,
            status: taskData.completed ? 'completed' : undefined,
            reminders,
          };
          const updated = await api.tasks.update(editingTask.id, payload);
          setTasks(tasks.map(t => t.id === editingTask.id ? { ...t, ...updated } : t));
          setEditingTask(null);
          setIsTaskModalOpen(false);
          resetTaskForm();
        } catch (err) {
          alert(err?.data?.message || err.message || 'Failed to update task');
        }
      })();
    }
  };

  const handleDeleteTask = (id) => {
    // Verify delete action
    const confirmed = typeof window !== 'undefined' ? window.confirm('Hapus tugas ini? Tindakan ini tidak dapat dibatalkan.') : true;
    if (!confirmed) return;
    const target = tasks.find(t => t.id === id);
    const prevTasks = tasks;
    // Optimistic removal
    setTasks(tasks.filter(t => t.id !== id));
    // Adjust per-project count badge
    if (target?.project_id) {
      setTaskCounts(prev => ({
        ...prev,
        [target.project_id]: Math.max(0, (prev[target.project_id] ?? 0) - 1)
      }));
    }
    setOpenMenuId(null);
    (async () => {
      try {
        await api.tasks.delete(id);
      } catch (err) {
        // Revert on failure
        setTasks(prevTasks);
        if (target?.project_id) {
          setTaskCounts(prev => ({
            ...prev,
            [target.project_id]: (prev[target.project_id] ?? 0) + 1
          }));
        }
        alert(err?.data?.message || err.message || 'Failed to delete task');
      }
    })();
  };

  const handleToggleComplete = (id) => {
    const target = tasks.find(t => t.id === id);
    if (!target) return;
    const toggledCompleted = !target.completed;
    // Optimistic UI update
    setTasks(tasks.map(t => (t.id === id ? { ...t, completed: toggledCompleted } : t)));
    // Persist status when marking as completed
    if (toggledCompleted) {
      (async () => {
        try {
          const updated = await api.tasks.update(id, { status: 'completed' });
          setTasks(prev => prev.map(t => (t.id === id ? { ...t, ...updated } : t)));
        } catch (err) {
          // Revert on failure
          setTasks(prev => prev.map(t => (t.id === id ? { ...t, completed: !toggledCompleted } : t)));
          alert(err?.data?.message || err.message || 'Failed to update task status');
        }
      })();
    }
  };

  const handleShareTask = (taskId) => {
    const task = tasks.find(t => t.id === taskId);
    setShareModal({ isOpen: true, item: task, itemType: 'task' });
    setOpenMenuId(null);
  };

  const handleShareProject = (projectId) => {
    const project = projects.find(p => p.id === projectId);
    setShareModal({ isOpen: true, item: project, itemType: 'project' });
    setOpenProjectMenuId(null);
  };

  const handleClearNotification = (id) => {
    const updatedNotifications = notifications.filter(notif => notif.id !== id);
    setNotifications(updatedNotifications);
    localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
  };

  const handleClearAllNotifications = () => {
    setNotifications([]);
    localStorage.setItem('notifications', JSON.stringify([]));
    setShowNotification(false);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const openEditTaskModal = (task) => {
    const toLocalInput = (value) => {
      if (!value) return '';
      try {
        const d = new Date(value);
        const pad = (n) => String(n).padStart(2, '0');
        const yyyy = d.getFullYear();
        const mm = pad(d.getMonth() + 1);
        const dd = pad(d.getDate());
        const hh = pad(d.getHours());
        const mi = pad(d.getMinutes());
        return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
      } catch {
        return '';
      }
    };

    const getReminderTime = (t) => {
      // Prefer a direct field if present
      if (t && t.reminderTime) return t.reminderTime;
      // Handle reminders as array of strings
      if (Array.isArray(t?.reminders) && t.reminders.length > 0) {
        const first = t.reminders[0];
        if (typeof first === 'string') return first;
        // Handle array of objects with possible keys
        if (typeof first === 'object' && first) {
          // Support backend schema: remind_at
          return first.remind_at || first.reminder_time || first.reminderTime || first.time || first.datetime || '';
        }
      }
      // Some backends may expose reminderTime at task level via different key
      return t?.reminder_time || '';
    };

    setEditingTask(task);
    setTaskFormData({
      title: task.title || '',
      description: task.description || '',
      deadline: toLocalInput(task.deadline),
      reminderTime: toLocalInput(getReminderTime(task)),
      priority: task.priority || 'medium',
      completed: !!task.completed
    });
    setIsTaskModalOpen(true);
    setOpenMenuId(null);
  };

  const openAddTaskModal = () => {
    if (!selectedProject) {
      alert('Please select a project first!');
      return;
    }
    setEditingTask(null);
    resetTaskForm();
    setIsTaskModalOpen(true);
  };

  const resetTaskForm = () => {
    setTaskFormData({
      title: '',
      description: '',
      deadline: '',
      reminderTime: '',
      priority: 'medium',
      completed: false
    });
  };

  const handleTaskSubmit = (e) => {
    e.preventDefault();
    if (editingTask) {
      handleEditTask(taskFormData);
    } else {
      handleAddTask(taskFormData);
    }
  };

  // Minimum selectable datetime for inputs (prevent past selection)
  const getMinLocalDateTime = () => {
    try {
      const d = new Date();
      // round down to nearest minute
      d.setSeconds(0, 0);
      const pad = (n) => String(n).padStart(2, '0');
      const yyyy = d.getFullYear();
      const mm = pad(d.getMonth() + 1);
      const dd = pad(d.getDate());
      const hh = pad(d.getHours());
      const mi = pad(d.getMinutes());
      return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
    } catch {
      return '';
    }
  };

  const getTodayDate = () => {
    try {
      const d = new Date();
      const pad = (n) => String(n).padStart(2, '0');
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    } catch {
      return '';
    }
  };

  const getMinTimeForDate = (dateStr) => {
    try {
      const min = getMinLocalDateTime();
      if (!min) return undefined;
      const [minDate, minTime] = min.split('T');
      return dateStr === minDate ? minTime : undefined;
    } catch {
      return undefined;
    }
  };

  const getTimeRemaining = (deadline) => {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diff = deadlineDate.getTime() - now.getTime();
    
    if (diff < 0) return 'Terlambat';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `Jatuh tempo dalam ${days} hari`;
    if (hours > 0) return `Jatuh tempo dalam ${hours} jam`;
    return 'Segera jatuh tempo';
  };

  const projectTasks = selectedProject 
    ? tasks.filter(task => task.project_id === selectedProject.id)
    : [];

  const filteredTasks = projectTasks.filter(task => {
    if (searchQuery && !task.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    switch (activeFilter) {
      case 'pending':
        return !task.completed;
      case 'completed':
        return task.completed;
      case 'high':
        return task.priority === 'high';
      case 'deadline':
        const deadline = new Date(task.deadline);
        const now = new Date();
        const diff = deadline.getTime() - now.getTime();
        const hours = diff / (1000 * 60 * 60);
        return hours <= 24 && hours > 0;
      default:
        return true;
    }
  });

  const stats = {
    total: projectTasks.length,
    pending: projectTasks.filter(t => !t.completed).length,
    completed: projectTasks.filter(t => t.completed).length,
    high: projectTasks.filter(t => t.priority === 'high' && !t.completed).length
  };

  if (showProfile) {
    return <>
      <Head title="Profil" />
      <Profile
        currentUser={resolvedUser}
        onLogout={logout}
        onBack={() => {
          const updatedName = localStorage.getItem('userName') || (resolvedUser ? (resolvedUser.split('@')[0] || resolvedUser) : 'User');
          setDisplayName(updatedName);
          setShowProfile(false);
        }}
      />
    </>;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] dark:bg-[#1A1A1A] flex items-center justify-center transition-colors">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#4CAF50]/20 border-t-[#4CAF50] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#1A1A1A]/60 dark:text-white/60">Memuat tugas Anda...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-[#F5F5F5] dark:from-[#0F0F0F] dark:to-[#1A1A1A] transition-colors">
      {/* Header */}
      <Head title="Dashboard" />
      <header className="border-b border-[#E8E8E8] dark:border-white/10 bg-white/80 dark:bg-black/30 backdrop-blur-sm sticky top-0 z-40 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#4CAF50] rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <span className="text-[#1A1A1A] dark:text-white hidden sm:block font-medium">Semi Tugas</span>
            </div>

            <div className="flex items-center gap-3">
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
              <button
                onClick={() => setShowNotification(!showNotification)}
                className="p-2 hover:bg-[#F5F5F5] dark:hover:bg-white/10 rounded-lg transition-colors relative"
              >
                <Bell className="w-5 h-5 text-[#1A1A1A] dark:text-white" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-5 h-5 bg-[#4CAF50] rounded-full flex items-center justify-center text-white text-xs font-medium">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 p-2 hover:bg-[#F5F5F5] dark:hover:bg-white/10 rounded-lg transition-colors"
                >
                  <div className="w-8 h-8 bg-[#4CAF50]/10 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-[#4CAF50]" />
                  </div>
                  <span className="text-[#1A1A1A] dark:text-white text-sm hidden md:block">
                    {displayName}
                  </span>
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#2A2A2A] rounded-xl shadow-lg border border-[#E8E8E8] dark:border-[#333] py-2">
                    <div className="px-4 py-2 border-b border-[#E8E8E8] dark:border-[#333]">
                      <p className="text-[#1A1A1A] dark:text-white text-sm truncate">{resolvedUser || displayName || 'pengguna@contoh.com'}</p>
                    </div>
                    <button
                      onClick={() => {
                        setShowProfile(true);
                        setShowUserMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-[#1A1A1A] dark:text-white hover:bg-[#F5F5F5] dark:hover:bg-white/10 flex items-center gap-2 text-sm"
                    >
                      <User className="w-4 h-4" />
                      Profil
                    </button>
                    <button
                      onClick={async () => {
                        try {
                          await logout();
                        } catch {}
                      }}
                      className="w-full px-4 py-2 text-left text-[#1A1A1A] dark:text-white hover:bg-[#F5F5F5] dark:hover:bg-white/10 flex items-center gap-2 text-sm"
                    >
                      <LogOut className="w-4 h-4" />
                      Keluar
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Notification Panel */}
      {showNotification && (
        <div className="fixed top-20 right-4 z-50 w-96 bg-white dark:bg-[#2A2A2A] rounded-xl shadow-2xl border border-[#E8E8E8] dark:border-[#333] animate-slide-in max-h-[500px] flex flex-col">
          <div className="p-4 border-b border-[#E8E8E8] dark:border-[#333] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-[#4CAF50]" />
              <h3 className="text-[#1A1A1A] dark:text-white font-semibold">Notifikasi</h3>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 bg-[#4CAF50] text-white text-xs rounded-full">
                  {unreadCount}
                </span>
              )}
            </div>
            <button
              onClick={() => setShowNotification(false)}
              className="p-1 hover:bg-[#F5F5F5] dark:hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-4 h-4 text-[#1A1A1A]/60 dark:text-white/60" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-[#F5F5F5] dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Bell className="w-8 h-8 text-[#1A1A1A]/20 dark:text-white/20" />
                </div>
                <p className="text-[#1A1A1A] dark:text-white font-medium mb-1">Tidak ada notifikasi</p>
                <p className="text-[#1A1A1A]/60 dark:text-white/60 text-sm">
                  Semua sudah diperbarui!
                </p>
              </div>
            ) : (
              <div className="divide-y divide-[#E8E8E8] dark:divide-[#333]">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className="p-4 hover:bg-[#F5F5F5] dark:hover:bg-white/5 transition-colors group"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-[#4CAF50]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Clock className="w-5 h-5 text-[#4CAF50]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-[#1A1A1A] dark:text-white font-medium mb-1 truncate">
                          {notif.title}
                        </h4>
                        <p className="text-[#1A1A1A]/60 dark:text-white/60 text-sm mb-1">
                          {notif.message}
                        </p>
                        {/* Vertical arrangement for status and deadline */}
                        <div className="flex flex-col gap-0.5 mt-2">
                          <span className="text-[#1A1A1A]/40 dark:text-white/40 text-xs">
                            Status: {notif.completed ? 'Selesai' : (notif.deadline && new Date(notif.deadline) < new Date() ? 'Terlambat' : 'Tertunda')}
                          </span>
                          <span className="text-[#1A1A1A]/40 dark:text-white/40 text-xs">
                            Deadline: {notif.deadline ? new Date(notif.deadline).toLocaleString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false }) : '-'}
                          </span>
                          <span className="text-[#1A1A1A]/40 dark:text-white/40 text-xs">
                            {new Date(notif.time).toLocaleTimeString('id-ID', {
                              hour: '2-digit',
                              minute: '2-digit',
                              hour12: false
                            })}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleClearNotification(notif.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-50 dark:hover:bg-red-600/10 rounded transition-all"
                      >
                        <X className="w-4 h-4 text-red-600 dark:text-red-400" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {notifications.length > 0 && (
            <div className="p-3 border-t border-[#E8E8E8] dark:border-[#333]">
              <button
                onClick={handleClearAllNotifications}
                className="w-full px-4 py-2 text-center text-[#4CAF50] hover:bg-[#4CAF50]/10 rounded-lg transition-colors text-sm font-medium"
              >
                Hapus Semua Notifikasi
              </button>
            </div>
          )}
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Projects Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-[#2A2A2A] rounded-xl border border-[#E8E8E8] dark:border-[#333] p-4 transition-colors sticky top-24">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-[#1A1A1A] dark:text-white font-semibold flex items-center gap-2">
                  <Folder className="w-5 h-5" />
                  Proyek
                </h2>
                <button
                  onClick={openAddProjectModal}
                  className="p-2 bg-[#4CAF50] text-white rounded-lg hover:bg-[#45a049] transition-all"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2">
                {projects.length === 0 ? (
                  <p className="text-[#1A1A1A]/60 dark:text-white/60 text-sm text-center py-8">
                    Belum ada proyek. Buat satu!
                  </p>
                ) : (
                  projects.map((project) => (
                    <div
                      key={project.id}
                      className={`p-3 rounded-lg border transition-all cursor-pointer ${
                        selectedProject?.id === project.id
                          ? 'bg-[#4CAF50]/10 border-[#4CAF50]'
                          : 'border-[#E8E8E8] dark:border-[#333] hover:border-[#4CAF50]/50'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <button
                          onClick={() => setSelectedProject(project)}
                          className="flex-1 text-left"
                        >
                          <div className="flex items-center gap-2 mb-1">
                            {project.is_private ? (
                              <Lock className="w-4 h-4 text-[#1A1A1A]/60 dark:text-white/60" />
                            ) : (
                              <Globe className="w-4 h-4 text-[#4CAF50]" />
                            )}
                            <h3 className="text-[#1A1A1A] dark:text-white font-medium text-sm truncate flex items-center gap-2">
                              {project.title}
                              {/* Actual total tasks badge */}
                              <span className="ml-1 px-2 py-0.5 rounded-full text-xs bg-[#F5F5F5] dark:bg-white/5 text-[#1A1A1A]/70 dark:text-white/70 border border-[#E8E8E8] dark:border-[#333]">
                                {taskCounts[project.id] ?? tasks.filter(t => t.project_id === project.id).length}
                              </span>
                            </h3>
                          </div>
                          <p className="text-[#1A1A1A]/60 dark:text-white/60 text-xs truncate">
                            {(taskCounts[project.id] ?? tasks.filter(t => t.project_id === project.id).length)} tugas
                          </p>
                        </button>
                        <div className="relative">
                          <button
                            onClick={() => setOpenProjectMenuId(openProjectMenuId === project.id ? null : project.id)}
                            className="p-1 hover:bg-[#F5F5F5] dark:hover:bg-white/10 rounded transition-colors"
                          >
                            <MoreVertical className="w-4 h-4 text-[#1A1A1A] dark:text-white" />
                          </button>

                          {openProjectMenuId === project.id && (
                            <div className="absolute right-0 mt-2 w-32 bg-white dark:bg-[#2A2A2A] rounded-xl shadow-lg border border-[#E8E8E8] dark:border-[#333] py-2 z-10">
                              <button
                                onClick={() => openEditProjectModal(project)}
                                className="w-full px-4 py-2 text-left text-[#1A1A1A] dark:text-white hover:bg-[#F5F5F5] dark:hover:bg-white/10 flex items-center gap-2 text-sm"
                              >
                                <Edit2 className="w-4 h-4" />
                                Ubah
                              </button>
                              <button
                                onClick={() => handleShareProject(project.id)}
                                className="w-full px-4 py-2 text-left text-[#1A1A1A] dark:text-white hover:bg-[#F5F5F5] dark:hover:bg-white/10 flex items-center gap-2 text-sm"
                              >
                                <Share2 className="w-4 h-4" />
                                Bagikan
                              </button>
                              <button
                                onClick={() => handleDeleteProject(project.id)}
                                className="w-full px-4 py-2 text-left text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-600/10 flex items-center gap-2 text-sm"
                              >
                                <Trash2 className="w-4 h-4" />
                                Hapus
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Tasks Area */}
          <div className="lg:col-span-3">
            {!selectedProject ? (
              <div className="bg-white dark:bg-[#2A2A2A] rounded-xl p-12 text-center border border-[#E8E8E8] dark:border-[#333] transition-colors">
                <div className="w-16 h-16 bg-[#F5F5F5] dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FolderOpen className="w-8 h-8 text-[#1A1A1A]/20 dark:text-white/20" />
                </div>
                <p className="text-[#1A1A1A] dark:text-white mb-2 font-medium">Tidak ada proyek yang dipilih</p>
                <p className="text-[#1A1A1A]/60 dark:text-white/60 text-sm mb-6">
                  Pilih proyek dari sidebar atau buat yang baru
                </p>
                <button
                  onClick={openAddProjectModal}
                  className="px-6 py-2 bg-[#4CAF50] text-white rounded-lg hover:bg-[#45a049] transition-all"
                >
                  Buat Proyek
                </button>
              </div>
            ) : (
              <>
                {/* Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div className="bg-white dark:bg-[#2A2A2A] rounded-xl p-4 border border-[#E8E8E8] dark:border-[#333] transition-colors">
                    <p className="text-[#1A1A1A]/60 dark:text-white/60 text-sm mb-1">Total Tugas</p>
                    <p className="text-[#1A1A1A] dark:text-white text-2xl font-semibold">{stats.total}</p>
                  </div>
                  <div className="bg-white dark:bg-[#2A2A2A] rounded-xl p-4 border border-[#E8E8E8] dark:border-[#333] transition-colors">
                    <p className="text-[#1A1A1A]/60 dark:text-white/60 text-sm mb-1">Tertunda</p>
                    <p className="text-[#1A1A1A] dark:text-white text-2xl font-semibold">{stats.pending}</p>
                  </div>
                  <div className="bg-white dark:bg-[#2A2A2A] rounded-xl p-4 border border-[#E8E8E8] dark:border-[#333] transition-colors">
                    <p className="text-[#1A1A1A]/60 dark:text-white/60 text-sm mb-1">Selesai</p>
                    <p className="text-[#4CAF50] text-2xl font-semibold">{stats.completed}</p>
                  </div>
                  <div className="bg-white dark:bg-[#2A2A2A] rounded-xl p-4 border border-[#E8E8E8] dark:border-[#333] transition-colors">
                    <p className="text-[#1A1A1A]/60 dark:text-white/60 text-sm mb-1">Prioritas Tinggi</p>
                    <p className="text-red-500 text-2xl font-semibold">{stats.high}</p>
                  </div>
                </div>

                {/* Actions Bar */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#1A1A1A]/40 dark:text-white/40" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Cari tugas..."
                      className="w-full pl-11 pr-4 py-3 bg-white dark:bg-[#2A2A2A] border border-[#E8E8E8] dark:border-[#333] rounded-xl text-[#1A1A1A] dark:text-white placeholder:text-[#1A1A1A]/40 dark:placeholder:text-white/40 focus:outline-none focus:border-[#4CAF50] transition-all"
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={openAddTaskModal}
                      className="px-6 py-3 bg-[#4CAF50] text-white rounded-xl hover:bg-[#45a049] transition-all flex items-center gap-2 shadow-lg shadow-[#4CAF50]/20"
                    >
                      <Plus className="w-5 h-5" />
                      <span>Tambah Tugas</span>
                    </button>
                  </div>
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                  {[
                    { key: 'all', label: 'Semua Tugas', count: projectTasks.length },
                    { key: 'pending', label: 'Tertunda', count: stats.pending },
                    { key: 'completed', label: 'Selesai', count: stats.completed },
                    { key: 'high', label: 'Prioritas Tinggi', count: stats.high },
                  ].map((filter) => (
                    <button
                      key={filter.key}
                      onClick={() => setActiveFilter(filter.key)}
                      className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap transition-all ${
                        activeFilter === filter.key
                          ? 'bg-[#4CAF50] text-white shadow-lg shadow-[#4CAF50]/20'
                          : 'bg-white dark:bg-[#2A2A2A] text-[#1A1A1A] dark:text-white border border-[#E8E8E8] dark:border-[#333] hover:border-[#4CAF50]'
                      }`}
                    >
                      {filter.label}
                      <span className={`ml-2 ${activeFilter === filter.key ? 'text-white/80' : 'text-[#1A1A1A]/60 dark:text-white/60'}`}>
                        ({filter.count})
                      </span>
                    </button>
                  ))}
                </div>

                {/* Task List */}
                <div className="space-y-3">
                  {filteredTasks.length === 0 ? (
                    <div className="bg-white dark:bg-[#2A2A2A] rounded-xl p-12 text-center border border-[#E8E8E8] dark:border-[#333] transition-colors">
                      <div className="w-16 h-16 bg-[#F5F5F5] dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-8 h-8 text-[#1A1A1A]/20 dark:text-white/20" />
                      </div>
                      <p className="text-[#1A1A1A] dark:text-white mb-2 font-medium">Tidak ada tugas</p>
                      <p className="text-[#1A1A1A]/60 dark:text-white/60 text-sm mb-6">
                        {searchQuery ? 'Coba ubah kata pencarian' : 'Buat tugas pertama Anda untuk mulai'}
                      </p>
                      {!searchQuery && (
                        <button
                          onClick={openAddTaskModal}
                          className="px-6 py-2 bg-[#4CAF50] text-white rounded-lg hover:bg-[#45a049] transition-all"
                        >
                          Tambah Tugas
                        </button>
                      )}
                    </div>
                  ) : (
                    filteredTasks.map((task) => (
                      <div
                        key={task.id}
                        className="bg-white dark:bg-[#2A2A2A] rounded-xl p-4 border border-[#E8E8E8] dark:border-[#333] hover:border-[#4CAF50]/50 hover:shadow-md transition-all"
                      >
                        <div className="flex items-start gap-4">
                          <button
                            onClick={() => handleToggleComplete(task.id)}
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${
                              task.completed
                                ? 'bg-[#4CAF50] border-[#4CAF50]'
                                : 'border-[#E8E8E8] dark:border-[#333] hover:border-[#4CAF50]'
                            }`}
                          >
                            {task.completed && <CheckCircle className="w-4 h-4 text-white" />}
                          </button>

                            <div className="flex-1 min-w-0">
                              <h3 className={`text-[#1A1A1A] dark:text-white mb-1 font-medium ${task.completed ? 'line-through opacity-50' : ''}`}>{task.title}</h3>
                              <p className={`text-[#1A1A1A]/60 dark:text-white/60 text-sm mb-3 ${task.completed ? 'line-through opacity-50' : ''}`}>{task.description}</p>
                              <div className="flex flex-col gap-2">
                                <span className={`inline-flex w-max whitespace-nowrap px-2 py-0.5 rounded-md text-xs ${
                                  task.priority === 'high' ? 'bg-red-100 text-red-600 dark:bg-red-600/20 dark:text-red-400' :
                                  task.priority === 'medium' ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-600/20 dark:text-yellow-300' :
                                  'bg-blue-100 text-blue-600 dark:bg-blue-600/20 dark:text-blue-300'
                                }`}>
                                  {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                                </span>
                                <div className="flex flex-col gap-2">
                                  <div className="flex items-center gap-2">
                                    <div className="flex items-center gap-1 text-[#1A1A1A]/60 dark:text-white/60 text-sm">
                                      <Clock className="w-4 h-4" />
                                      <span>{getTimeRemaining(task.deadline)}</span>
                                    </div>
                                  </div>

                                  <div className="flex flex-col gap-1 text-[#1A1A1A]/40 dark:text-white/40 text-xs">
                                    <span>
                                      <strong className="font-medium">Deadline:</strong>{' '}
                                      {task.deadline ? new Date(task.deadline).toLocaleString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false }) : '-'}
                                    </span>

                                    <span>
                                      <strong className="font-medium">Status:</strong>{' '}
                                      {task.completed ? 'Selesai' : (task.deadline && new Date(task.deadline) < new Date() ? 'Terlambat' : 'Tertunda')}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>

                          <div className="relative">
                            <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === task.id ? null : task.id); }}
                              className="p-2 hover:bg-[#F5F5F5] dark:hover:bg-white/10 rounded-lg transition-colors"
                            >
                              <MoreVertical className="w-5 h-5 text-[#1A1A1A] dark:text-white" />
                            </button>

                              {openMenuId === task.id && (
                                <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-[#2A2A2A] rounded-xl shadow-lg border border-[#E8E8E8] dark:border-[#333] py-2 z-20">
                                  <button
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); openEditTaskModal(task); }}
                                  className="w-full px-4 py-2 text-left text-[#1A1A1A] dark:text-white hover:bg-[#F5F5F5] dark:hover:bg-white/10 flex items-center gap-2 text-sm"
                                >
                                  <Edit2 className="w-4 h-4" />
                                  Ubah
                                </button>
                                  <button
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); handleDeleteTask(task.id); }}
                                  className="w-full px-4 py-2 text-left text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-600/10 flex items-center gap-2 text-sm"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  Hapus
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </main>

      {/* Add/Edit Project Modal */}
      {isProjectModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#2A2A2A] rounded-2xl w-full max-w-lg p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-[#1A1A1A] dark:text-white text-xl font-semibold">
                {editingProject ? 'Ubah Proyek' : 'Buat Proyek Baru'}
              </h2>
              <button
                onClick={() => {
                  setIsProjectModalOpen(false);
                  setEditingProject(null);
                  resetProjectForm();
                }}
                className="p-2 hover:bg-[#F5F5F5] dark:hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-[#1A1A1A] dark:text-white" />
              </button>
            </div>

            <form onSubmit={handleProjectSubmit} className="space-y-4">
              <div>
                <label className="block text-[#1A1A1A] dark:text-white text-sm font-medium mb-2">
                  Judul Proyek *
                </label>
                <input
                  type="text"
                  value={projectFormData.title}
                  onChange={(e) => setProjectFormData({ ...projectFormData, title: e.target.value })}
                  placeholder="Masukkan judul proyek"
                  required
                  className="w-full px-4 py-3 bg-[#F5F5F5] dark:bg-white/5 border border-[#E8E8E8] dark:border-[#333] rounded-xl text-[#1A1A1A] dark:text-white placeholder:text-[#1A1A1A]/40 dark:placeholder:text-white/40 focus:outline-none focus:border-[#4CAF50] transition-all"
                />
              </div>

              <div>
                <label className="block text-[#1A1A1A] dark:text-white text-sm font-medium mb-2">
                  Deskripsi
                </label>
                <textarea
                  value={projectFormData.description}
                  onChange={(e) => setProjectFormData({ ...projectFormData, description: e.target.value })}
                  placeholder="Tambahkan deskripsi proyek"
                  rows="3"
                  className="w-full px-4 py-3 bg-[#F5F5F5] dark:bg-white/5 border border-[#E8E8E8] dark:border-[#333] rounded-xl text-[#1A1A1A] dark:text-white placeholder:text-[#1A1A1A]/40 dark:placeholder:text-white/40 focus:outline-none focus:border-[#4CAF50] transition-all resize-none"
                />
              </div>

              <div>
                <label className="block text-[#1A1A1A] dark:text-white text-sm font-medium mb-2">
                  Visibilitas
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setProjectFormData({ ...projectFormData, is_private: true })}
                    className={`px-4 py-3 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                      projectFormData.is_private
                        ? 'bg-[#4CAF50] text-white'
                        : 'bg-[#F5F5F5] dark:bg-white/5 text-[#1A1A1A] dark:text-white border border-[#E8E8E8] dark:border-[#333]'
                    }`}
                  >
                    <Lock className="w-4 h-4" />
                    Privat
                  </button>
                  <button
                    type="button"
                    onClick={() => setProjectFormData({ ...projectFormData, is_private: false })}
                    className={`px-4 py-3 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                      !projectFormData.is_private
                        ? 'bg-[#4CAF50] text-white'
                        : 'bg-[#F5F5F5] dark:bg-white/5 text-[#1A1A1A] dark:text-white border border-[#E8E8E8] dark:border-[#333]'
                    }`}
                  >
                    <Globe className="w-4 h-4" />
                    Publik
                  </button>
                </div>
                <p className="text-xs text-[#1A1A1A]/60 dark:text-white/60 mt-2">
                  {projectFormData.is_private 
                    ? 'Hanya Anda yang bisa melihat proyek ini. Tugas tidak dapat dibagikan.' 
                    : 'Siapa pun dapat melihat proyek ini. Tugas bisa dibagikan.'}
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsProjectModalOpen(false);
                    setEditingProject(null);
                    resetProjectForm();
                  }}
                  className="flex-1 px-6 py-3 bg-[#F5F5F5] dark:bg-white/5 text-[#1A1A1A] dark:text-white border border-[#E8E8E8] dark:border-[#333] rounded-xl hover:bg-[#E8E8E8] dark:hover:bg-white/10 transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-[#4CAF50] text-white rounded-xl hover:bg-[#45a049] transition-all shadow-lg shadow-[#4CAF50]/20"
                >
                  {editingProject ? 'Perbarui' : 'Buat'} Proyek
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add/Edit Task Modal */}
      {isTaskModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#2A2A2A] rounded-2xl w-full max-w-lg p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-[#1A1A1A] dark:text-white text-xl font-semibold">
                {editingTask ? 'Ubah Tugas' : 'Tambah Tugas Baru'}
              </h2>
              <button
                onClick={() => {
                  setIsTaskModalOpen(false);
                  setEditingTask(null);
                  resetTaskForm();
                }}
                className="p-2 hover:bg-[#F5F5F5] dark:hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-[#1A1A1A] dark:text-white" />
              </button>
            </div>

            <form onSubmit={handleTaskSubmit} className="space-y-4">
              <div>
                <label className="block text-[#1A1A1A] dark:text-white text-sm font-medium mb-2">
                  Judul Tugas *
                </label>
                <input
                  type="text"
                  value={taskFormData.title}
                  onChange={(e) => setTaskFormData({ ...taskFormData, title: e.target.value })}
                  placeholder="Masukkan judul tugas"
                  required
                  className="w-full px-4 py-3 bg-[#F5F5F5] dark:bg-white/5 border border-[#E8E8E8] dark:border-[#333] rounded-xl text-[#1A1A1A] dark:text-white placeholder:text-[#1A1A1A]/40 dark:placeholder:text-white/40 focus:outline-none focus:border-[#4CAF50] transition-all"
                />
              </div>

              <div>
                <label className="block text-[#1A1A1A] dark:text-white text-sm font-medium mb-2">
                  Deskripsi
                </label>
                <textarea
                  value={taskFormData.description}
                  onChange={(e) => setTaskFormData({ ...taskFormData, description: e.target.value })}
                  placeholder="Tambahkan deskripsi tugas"
                  rows="3"
                  className="w-full px-4 py-3 bg-[#F5F5F5] dark:bg-white/5 border border-[#E8E8E8] dark:border-[#333] rounded-xl text-[#1A1A1A] dark:text-white placeholder:text-[#1A1A1A]/40 dark:placeholder:text-white/40 focus:outline-none focus:border-[#4CAF50] transition-all resize-none"
                />
              </div>

              <div>
                <label className="block text-[#1A1A1A] dark:text-white text-sm font-medium mb-2">
                  Tenggat Waktu *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    value={(taskFormData.deadline || '').split('T')[0] || ''}
                    onChange={(e) => {
                      const date = e.target.value;
                      const time = (taskFormData.deadline || '').split('T')[1] || '00:00';
                      setTaskFormData({ ...taskFormData, deadline: date ? `${date}T${time}` : '' });
                    }}
                    required
                    min={getTodayDate()}
                    className="w-full px-4 py-3 bg-[#F5F5F5] dark:bg-white/5 border border-[#E8E8E8] dark:border-[#333] rounded-xl text-[#1A1A1A] dark:text-white focus:outline-none focus:border-[#4CAF50] transition-all"
                  />

                  <div className="flex items-center gap-2">
                    <div className="flex items-center">
                      <div className="flex flex-col items-center mr-2">
                        <span className="text-xs text-[#1A1A1A]/60 dark:text-white/60 mb-1">Jam</span>
                        <input
                          type="number"
                          min="0"
                          max="23"
                          value={deadlineTemp ? deadlineTemp.getHours() : ((taskFormData.deadline && ((taskFormData.deadline || '').split('T')[1] || '') !== '' && (((taskFormData.deadline || '').split('T')[1] || '').split(':')[0] !== '') ) ? Number(((taskFormData.deadline || '').split('T')[1] || '').split(':')[0]) : '')}
                          onChange={(e) => {
                            const raw = e.target.value;
                            const date = (taskFormData.deadline || '').split('T')[0] || getTodayDate();
                            if (raw === '' || raw === null) {
                              const miPart = (taskFormData.deadline || '').split('T')[1] || '';
                              const mi = miPart && miPart.split(':')[1] !== undefined ? miPart.split(':')[1] : '';
                              setDeadlineTemp(null);
                              setTaskFormData({ ...taskFormData, deadline: date ? `${date}T:${mi}` : '' });
                              return;
                            }
                            const num = Number(raw);
                            const hh = Number.isNaN(num) ? 0 : Math.max(0, Math.min(23, num));
                            const miVal = deadlineTemp ? deadlineTemp.getMinutes() : ((taskFormData.deadline && ((taskFormData.deadline || '').split('T')[1] || '').length > 0) ? Number(((taskFormData.deadline || '').split('T')[1] || '').split(':')[1]) : 0);
                            const hhStr = String(hh).padStart(2, '0');
                            const miStr = String(miVal).padStart(2, '0');
                            const d = new Date(`${date}T${hhStr}:${miStr}`);
                            setDeadlineTemp(d);
                            setTaskFormData({ ...taskFormData, deadline: `${date}T${hhStr}:${miStr}` });
                          }}
                          className="w-20 px-2 py-2 border rounded-xl text-sm bg-white dark:bg-[#1A1A1A] text-[#1A1A1A] dark:text-white border-[#E8E8E8] dark:border-[#333]"
                        />
                      </div>
                      <span className="text-sm mt-6">:</span>
                      <div className="flex flex-col items-center ml-2">
                        <span className="text-xs text-[#1A1A1A]/60 dark:text-white/60 mb-1">Menit</span>
                        <input
                          type="number"
                          min="0"
                          max="59"
                          value={deadlineTemp ? deadlineTemp.getMinutes() : ((taskFormData.deadline && ((taskFormData.deadline || '').split('T')[1] || '') !== '' && (((taskFormData.deadline || '').split('T')[1] || '').split(':')[1] !== undefined && ((taskFormData.deadline || '').split('T')[1] || '').split(':')[1] !== '') ) ? Number(((taskFormData.deadline || '').split('T')[1] || '').split(':')[1]) : '')}
                          onChange={(e) => {
                            const raw = e.target.value;
                            const date = (taskFormData.deadline || '').split('T')[0] || getTodayDate();
                            if (raw === '' || raw === null) {
                              const hhPart = (taskFormData.deadline || '').split('T')[1] || '';
                              const hh = hhPart && hhPart.split(':')[0] !== undefined ? hhPart.split(':')[0] : '';
                              setDeadlineTemp(null);
                              setTaskFormData({ ...taskFormData, deadline: date ? `${date}T${hh}:` : '' });
                              return;
                            }
                            const num = Number(raw);
                            const mi = Number.isNaN(num) ? 0 : Math.max(0, Math.min(59, num));
                            const hhVal = deadlineTemp ? deadlineTemp.getHours() : ((taskFormData.deadline && ((taskFormData.deadline || '').split('T')[1] || '').length > 0) ? Number(((taskFormData.deadline || '').split('T')[1] || '').split(':')[0]) : 0);
                            const hhStr = String(hhVal).padStart(2, '0');
                            const miStr = String(mi).padStart(2, '0');
                            const d = new Date(`${date}T${hhStr}:${miStr}`);
                            setDeadlineTemp(d);
                            setTaskFormData({ ...taskFormData, deadline: `${date}T${hhStr}:${miStr}` });
                          }}
                          className="w-20 px-2 py-2 border rounded-xl text-sm bg-white dark:bg-[#1A1A1A] text-[#1A1A1A] dark:text-white border-[#E8E8E8] dark:border-[#333]"
                        />
                      </div>
                    </div>
                    {/* Confirm button removed — time commits on change */}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[#1A1A1A] dark:text-white text-sm font-medium mb-2">
                  Waktu Pengingat
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    value={(taskFormData.reminderTime || '').split('T')[0] || ''}
                    onChange={(e) => {
                      const date = e.target.value;
                      const time = (taskFormData.reminderTime || '').split('T')[1] || '00:00';
                      setTaskFormData({ ...taskFormData, reminderTime: date ? `${date}T${time}` : '' });
                    }}
                    min={getTodayDate()}
                    className="w-full px-4 py-3 bg-[#F5F5F5] dark:bg-white/5 border border-[#E8E8E8] dark:border-[#333] rounded-xl text-[#1A1A1A] dark:text-white focus:outline-none focus:border-[#4CAF50] transition-all"
                  />

                  <div className="flex items-center gap-2">
                    <div className="flex items-center">
                      <div className="flex flex-col items-center mr-2">
                        <span className="text-xs text-[#1A1A1A]/60 dark:text-white/60 mb-1">Jam</span>
                        <input
                          type="number"
                          min="0"
                          max="23"
                          value={reminderTemp ? reminderTemp.getHours() : ((taskFormData.reminderTime && ((taskFormData.reminderTime || '').split('T')[1] || '') !== '' && (((taskFormData.reminderTime || '').split('T')[1] || '').split(':')[0] !== '') ) ? Number(((taskFormData.reminderTime || '').split('T')[1] || '').split(':')[0]) : '')}
                          onChange={(e) => {
                            const raw = e.target.value;
                            const date = (taskFormData.reminderTime || '').split('T')[0] || getTodayDate();
                            if (raw === '' || raw === null) {
                              const miPart = (taskFormData.reminderTime || '').split('T')[1] || '';
                              const mi = miPart && miPart.split(':')[1] !== undefined ? miPart.split(':')[1] : '';
                              setReminderTemp(null);
                              setTaskFormData({ ...taskFormData, reminderTime: date ? `${date}T:${mi}` : '' });
                              return;
                            }
                            const num = Number(raw);
                            const hh = Number.isNaN(num) ? 0 : Math.max(0, Math.min(23, num));
                            const miVal = reminderTemp ? reminderTemp.getMinutes() : ((taskFormData.reminderTime && ((taskFormData.reminderTime || '').split('T')[1] || '').length > 0) ? Number(((taskFormData.reminderTime || '').split('T')[1] || '').split(':')[1]) : 0);
                            const hhStr = String(hh).padStart(2, '0');
                            const miStr = String(miVal).padStart(2, '0');
                            const d = new Date(`${date}T${hhStr}:${miStr}`);
                            setReminderTemp(d);
                            setTaskFormData({ ...taskFormData, reminderTime: `${date}T${hhStr}:${miStr}` });
                          }}
                          className="w-20 px-2 py-2 border rounded-xl text-sm bg-white dark:bg-[#1A1A1A] text-[#1A1A1A] dark:text-white border-[#E8E8E8] dark:border-[#333]"
                        />
                      </div>
                      <span className="text-sm mt-6">:</span>
                      <div className="flex flex-col items-center ml-2">
                        <span className="text-xs text-[#1A1A1A]/60 dark:text-white/60 mb-1">Menit</span>
                        <input
                          type="number"
                          min="0"
                          max="59"
                          value={reminderTemp ? reminderTemp.getMinutes() : ((taskFormData.reminderTime && ((taskFormData.reminderTime || '').split('T')[1] || '') !== '' && (((taskFormData.reminderTime || '').split('T')[1] || '').split(':')[1] !== undefined && ((taskFormData.reminderTime || '').split('T')[1] || '').split(':')[1] !== '') ) ? Number(((taskFormData.reminderTime || '').split('T')[1] || '').split(':')[1]) : '')}
                          onChange={(e) => {
                            const raw = e.target.value;
                            const date = (taskFormData.reminderTime || '').split('T')[0] || getTodayDate();
                            if (raw === '' || raw === null) {
                              const hhPart = (taskFormData.reminderTime || '').split('T')[1] || '';
                              const hh = hhPart && hhPart.split(':')[0] !== undefined ? hhPart.split(':')[0] : '';
                              setReminderTemp(null);
                              setTaskFormData({ ...taskFormData, reminderTime: date ? `${date}T${hh}:` : '' });
                              return;
                            }
                            const num = Number(raw);
                            const mi = Number.isNaN(num) ? 0 : Math.max(0, Math.min(59, num));
                            const hhVal = reminderTemp ? reminderTemp.getHours() : ((taskFormData.reminderTime && ((taskFormData.reminderTime || '').split('T')[1] || '').length > 0) ? Number(((taskFormData.reminderTime || '').split('T')[1] || '').split(':')[0]) : 0);
                            const hhStr = String(hhVal).padStart(2, '0');
                            const miStr = String(mi).padStart(2, '0');
                            const d = new Date(`${date}T${hhStr}:${miStr}`);
                            setReminderTemp(d);
                            setTaskFormData({ ...taskFormData, reminderTime: `${date}T${hhStr}:${miStr}` });
                          }}
                          className="w-20 px-2 py-2 border rounded-xl text-sm bg-white dark:bg-[#1A1A1A] text-[#1A1A1A] dark:text-white border-[#E8E8E8] dark:border-[#333]"
                        />
                      </div>
                    </div>
                    {/* Confirm button removed — reminder commits on change */}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[#1A1A1A] dark:text-white text-sm font-medium mb-2">
                  Prioritas *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['low', 'medium', 'high'].map((priority) => (
                    <button
                      key={priority}
                      type="button"
                      onClick={() => setTaskFormData({ ...taskFormData, priority })}
                      className={`px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                        taskFormData.priority === priority
                          ? priority === 'high' 
                            ? 'bg-red-500 text-white' 
                            : priority === 'medium' 
                            ? 'bg-yellow-500 text-white' 
                            : 'bg-blue-500 text-white'
                          : 'bg-[#F5F5F5] dark:bg-white/5 text-[#1A1A1A] dark:text-white border border-[#E8E8E8] dark:border-[#333]'
                      }`}
                    >
                      {priority.charAt(0).toUpperCase() + priority.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsTaskModalOpen(false);
                    setEditingTask(null);
                    resetTaskForm();
                  }}
                  className="flex-1 px-6 py-3 bg-[#F5F5F5] dark:bg-white/5 text-[#1A1A1A] dark:text-white border border-[#E8E8E8] dark:border-[#333] rounded-xl hover:bg-[#E8E8E8] dark:hover:bg-white/10 transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-[#4CAF50] text-white rounded-xl hover:bg-[#45a049] transition-all shadow-lg shadow-[#4CAF50]/20"
                >
                  {editingTask ? 'Perbarui' : 'Buat'} Tugas
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Share Modal */}
      <ShareModal
        isOpen={shareModal.isOpen}
        onClose={() => setShareModal({ isOpen: false, item: null, itemType: null })}
        item={shareModal.item}
        itemType={shareModal.itemType}
        theme={theme}
      />
    </div>
  );
}
