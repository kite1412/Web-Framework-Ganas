import { Head } from "@inertiajs/react";
import { CheckCircle, Clock, FolderOpen } from "lucide-react";
import { useEffect, useState } from "react";
import useTheme from "../Components/useTheme";
import api from "../api/client";

export default function ProjectPage(props) {
  const { theme, mounted } = useTheme();
  const projectId = props.projectId || props.id || (typeof window !== 'undefined' ? (window.location.pathname.split('/').pop()) : null);

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copying, setCopying] = useState(false);

  const getTimeRemaining = (deadline) => {
    if (!deadline) return 'Segera';
    try {
      const now = new Date();
      const deadlineDate = new Date(deadline);
      const diff = deadlineDate.getTime() - now.getTime();
      if (diff < 0) return 'Terlambat';
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const days = Math.floor(hours / 24);
      if (days > 0) return `${days} hari`;
      if (hours > 0) return `${hours} jam`;
      return 'Segera jatuh tempo';
    } catch (e) {
      return '-';
    }
  };

  useEffect(() => {
    if (!projectId) return;

    (async () => {
      setIsLoading(true);
      try {
        // Use the centralized API client
        try {
          const proj = await api.projects.get(projectId);
          setProject(proj);

          if (!proj?.is_private) {
            try {
              const data = await api.tasks.list({ project_id: proj.id });
              setTasks(Array.isArray(data) ? data : (data?.data ?? data) || []);
            } catch (e) {
              setTasks([]);
            }
          } else {
            setTasks([]);
          }
        } catch (e) {
          setProject(null);
          setTasks([]);
        }
      } catch (e) {
        setProject(null);
        setTasks([]);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [projectId]);

  const handleCopyProject = async () => {
    if (!project) return;
    try {
      setCopying(true);
      const created = await api.projects.copy(project.id);
      // Redirect to the newly created copy
      if (created && created.id) {
        window.location.href = `/project/${created.id}`;
      } else {
        // fallback: reload
        window.location.reload();
      }
    } catch (err) {
      alert(err?.data?.message || err.message || 'Gagal menyalin proyek');
    } finally {
      setCopying(false);
    }
  };

  if (!mounted) return <div style={{ visibility: 'hidden' }} />;

  return (
    <div className={`min-h-screen bg-gradient-to-br from-white to-[#F5F5F5] dark:from-[#0F0F0F] dark:to-[#1A1A1A] transition-colors`}>
      <Head title={project?.title ? `${project.title} · Proyek` : 'Proyek'} />

      <header className="border-b border-[#E8E8E8] dark:border-white/10 bg-white/80 dark:bg-black/30 backdrop-blur-sm sticky top-0 z-40 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <a href="/" className="flex items-center gap-2 hover:opacity-90">
              <div className="w-8 h-8 bg-[#4CAF50] rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <span className="text-[#1A1A1A] dark:text-white hidden sm:block font-medium">Proyek Dibagikan</span>
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
          <div className="bg-white dark:bg-[#2A2A2A] rounded-xl p-6 border border-[#E8E8E8] dark:border-[#333] transition-colors">
            {isLoading ? (
              <p className="text-[#1A1A1A] dark:text-white">Memuat proyek...</p>
            ) : !project ? (
              <div className="text-center py-8">
                <p className="text-[#1A1A1A] dark:text-white font-medium">Proyek tidak ditemukan</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h1 className="text-[#1A1A1A] dark:text-white text-2xl font-semibold">{project.title}</h1>
                    <p className="text-[#1A1A1A]/60 dark:text-white/60 text-sm">{project.description}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-sm text-[#1A1A1A]/60 dark:text-white/60">{project.is_private ? 'Privat' : 'Publik'}</div>
                    {(() => {
                      try {
                        const authUserStr = localStorage.getItem('auth_user');
                        const authUser = authUserStr ? JSON.parse(authUserStr) : null;
                        const canCopy = authUser && authUser.id && authUser.id !== project.user_id;
                        if (canCopy) {
                          return (
                            <button
                              onClick={handleCopyProject}
                              disabled={copying}
                              className="px-4 py-2 bg-[#4CAF50] text-white rounded-lg hover:bg-[#45a049] transition-all text-sm"
                            >
                              {copying ? 'Menyalin...' : 'Salin Proyek'}
                            </button>
                          );
                        }
                      } catch (e) {}
                      return null;
                    })()}
                  </div>
                </div>

                {project.is_private ? (
                  <div className="p-8 text-center">
                    <FolderOpen className="w-12 h-12 text-[#1A1A1A]/20 dark:text-white/20 mx-auto mb-4" />
                    <p className="text-[#1A1A1A] dark:text-white font-medium mb-1">Proyek ini bersifat privat</p>
                    <p className="text-[#1A1A1A]/60 dark:text-white/60 text-sm">Tugas hanya dapat dilihat oleh pemilik proyek.</p>
                  </div>
                ) : (
                  <div>
                    {tasks.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-[#1A1A1A] dark:text-white font-medium">Tidak ada tugas di proyek ini</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {tasks.map((task) => (
                          <div key={task.id} className="bg-white dark:bg-[#2A2A2A] rounded-xl p-4 border border-[#E8E8E8] dark:border-[#333] hover:border-[#4CAF50]/50 hover:shadow-md transition-all">
                            <div className="flex items-start gap-4">
                              <div className="flex-1 min-w-0">
                                <h3 className={`text-[#1A1A1A] dark:text-white mb-1 font-medium ${task.completed ? 'line-through opacity-50' : ''}`}>{task.title}</h3>
                                <div className="flex items-center gap-3 mb-2">
                                  <span className={`inline-flex w-max whitespace-nowrap px-2 py-0.5 rounded-md text-xs ${
                                    task.priority === 'high' ? 'bg-red-100 text-red-600 dark:bg-red-600/20 dark:text-red-400' :
                                    task.priority === 'medium' ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-600/20 dark:text-yellow-300' :
                                    'bg-blue-100 text-blue-600 dark:bg-blue-600/20 dark:text-blue-300'
                                  }`}> {task.priority ? (task.priority.charAt(0).toUpperCase() + task.priority.slice(1)) : 'Medium'} </span>
                                  <div className="flex items-center gap-2 text-sm text-[#1A1A1A]/60 dark:text-white/60">
                                    <Clock className="w-4 h-4" />
                                    <span>{getTimeRemaining(task.deadline)}</span>
                                  </div>
                                </div>
                                <p className="text-[#1A1A1A]/60 dark:text-white/60 text-sm mb-2">{task.description}</p>
                                <div className="text-xs text-[#1A1A1A]/40 dark:text-white/40">
                                  <strong>Jatuh Tempo:</strong> {task.deadline ? new Date(task.deadline).toLocaleString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false }) : '-'}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
