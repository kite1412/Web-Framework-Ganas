// Simple API client using fetch. Adjust baseURL if needed.
const baseURL = "/api";
let authToken = null;

export function setToken(token) {
  authToken = token || null;
  try {
    if (authToken) {
      localStorage.setItem("auth_token", authToken);
    } else {
      localStorage.removeItem("auth_token");
    }
  } catch {}
}

export function getToken() {
  if (authToken) return authToken;
  try {
    return localStorage.getItem("auth_token");
  } catch {
    return null;
  }
}

async function request(path, { method = "GET", body, headers = {} } = {}) {
  const res = await fetch(`${baseURL}${path}`, {
    method,
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json",
      ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
    credentials: "include",
  });

  let data = null;
  const contentType = res.headers.get("content-type") || "";
  // Pre-clone before any body read so fallback is always possible
  const resClone = res.clone();
  if (contentType.includes("application/json")) {
    try {
      data = await res.json();
    } catch (e) {
      // Fallback in case server incorrectly labels HTML as JSON
      data = await resClone.text();
    }
  } else {
    data = await res.text();
  }

  if (!res.ok) {
    const message = typeof data === "string" ? data : data?.message || "Request failed";
    const error = new Error(message);
    error.status = res.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const api = {
  login: (payload) => request("/login", { method: "POST", body: payload }),
  register: (payload) => request("/register", { method: "POST", body: payload }),
  logout: () => request("/logout", { method: "POST" }),
  initCsrf: async () => {
    // Ensure Sanctum CSRF cookie for session-based auth
    // Sanctum endpoint is usually outside the /api prefix.
    await fetch(`/sanctum/csrf-cookie`, { credentials: "include" });
  },
  projects: {
    list: (params = {}) => {    
      const qs = new URLSearchParams(params).toString();
      return request(`/projects${qs ? `?${qs}` : ``}`);
    },
    create: (payload) => request("/projects", { method: "POST", body: payload }),
    update: (projectId, payload) => request(`/projects/${projectId}`, { method: "PUT", body: payload }),
    copy: (projectId) => request(`/projects/${projectId}/copy`, { method: "POST" }),
    share: (projectId) => request(`/projects/${projectId}/share`, { method: "POST" }),
    delete: (projectId) => request(`/projects/${projectId}`, { method: "DELETE" }),
  },
  tasks: {
    list: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return request(`/tasks${qs ? `?${qs}` : ``}`);
    },
    create: (payload) => request(`/tasks`, { method: "POST", body: payload }),
    update: (taskId, payload) => request(`/tasks/${taskId}`, { method: "PUT", body: payload }),
    delete: (taskId) => request(`/tasks/${taskId}`, { method: "DELETE" }),
    share: (taskId) => request(`/tasks/${taskId}/share`, { method: "POST" }),
  },
};

export default api;
