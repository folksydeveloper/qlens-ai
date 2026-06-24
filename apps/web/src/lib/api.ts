const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export async function apiFetch(path: string, options: RequestInit & { skipAuth?: boolean } = {}) {
  const { skipAuth, ...rest } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...rest.headers as Record<string, string>,
  };

  if (!skipAuth) {
    const token = typeof window !== 'undefined' ? localStorage.getItem('qlens-access-token') : null;
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, { ...rest, headers });

  if (res.status === 401 && !skipAuth) {
    // Token expired
    if (typeof window !== 'undefined') {
      localStorage.removeItem('qlens-access-token');
      localStorage.removeItem('qlens-refresh-token');
      window.location.href = '/login';
    }
  }

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || data.error || `HTTP ${res.status}`);
  }
  return data;
}

export const api = {
  // Auth
  login: (email: string, password: string) =>
    apiFetch('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }), skipAuth: true }),
  register: (email: string, password: string) =>
    apiFetch('/auth/register', { method: 'POST', body: JSON.stringify({ email, password }), skipAuth: true }),
  refresh: (refreshToken: string) =>
    apiFetch('/auth/refresh', { method: 'POST', body: JSON.stringify({ refreshToken }), skipAuth: true }),

  // Users
  me: () => apiFetch('/users/me'),
  updateProfile: (data: { firstName?: string; lastName?: string; timezone?: string }) =>
    apiFetch('/users/me', { method: 'PATCH', body: JSON.stringify(data) }),
  changePassword: (current: string, newPass: string) =>
    apiFetch('/users/me/change-password', { method: 'POST', body: JSON.stringify({ currentPassword: current, newPassword: newPass }) }),
  deleteAccount: () => apiFetch('/users/me', { method: 'DELETE' }),

  // API Keys
  listKeys: () => apiFetch('/api-keys'),
  createKey: (name: string) => apiFetch('/api-keys', { method: 'POST', body: JSON.stringify({ name }) }),
  updateKey: (id: string, data: { name?: string; status?: string }) =>
    apiFetch(`/api-keys/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  revokeKey: (id: string) => apiFetch(`/api-keys/${id}`, { method: 'DELETE' }),

  // Billing
  listPlans: () => apiFetch('/billing/plans', { skipAuth: true }),
  getSubscription: () => apiFetch('/billing/subscription'),
  changePlan: (planId: string) => apiFetch('/billing/subscription', { method: 'POST', body: JSON.stringify({ planId }) }),
  getTopUpPackages: () => apiFetch('/billing/top-up-packages'),
  createTopUp: (packageId: string) => apiFetch('/billing/top-up', { method: 'POST', body: JSON.stringify({ packageId }) }),
  getInvoices: () => apiFetch('/billing/invoices'),

  // Usage
  getUsageSummary: () => apiFetch('/usage/summary'),
  getUsageLogs: (params?: { page?: number; limit?: number }) => {
    const qs = new URLSearchParams(params as any).toString();
    return apiFetch(`/usage/logs?${qs}`);
  },
  getModels: () => apiFetch('/usage/models', { skipAuth: true }),

  // Admin
  adminOverview: () => apiFetch('/admin/overview'),
  adminUsers: (params?: { page?: number; limit?: number }) => {
    const qs = new URLSearchParams(params as any).toString();
    return apiFetch(`/admin/users?${qs}`);
  },
  adminUserDetail: (id: string) => apiFetch(`/admin/users/${id}`),
  adminChangePlan: (id: string, planId: string) => apiFetch(`/admin/users/${id}/plan`, { method: 'PATCH', body: JSON.stringify({ planId }) }),
  adminChangeStatus: (id: string, status: string) => apiFetch(`/admin/users/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  adminAddCredit: (id: string, amount: number) => apiFetch(`/admin/users/${id}/credit`, { method: 'POST', body: JSON.stringify({ amount }) }),
  adminPayments: () => apiFetch('/admin/payments'),
  adminUsageLogs: () => apiFetch('/admin/usage-logs'),
  adminAbuseAlerts: () => apiFetch('/admin/abuse-alerts'),
  adminModels: () => apiFetch('/admin/models'),
  adminAddModel: (data: any) => apiFetch('/admin/models', { method: 'POST', body: JSON.stringify(data) }),
  adminEditModel: (id: string, data: any) => apiFetch(`/admin/models/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  adminPlans: () => apiFetch('/admin/plans'),
  adminCreatePlan: (data: any) => apiFetch('/admin/plans', { method: 'POST', body: JSON.stringify(data) }),
  adminEditPlan: (id: string, data: any) => apiFetch(`/admin/plans/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  adminAuditLogs: () => apiFetch('/admin/audit-logs'),
  adminModelHealth: () => apiFetch('/admin/model-health'),

  // Public
  publicModels: () => apiFetch('/public/models', { skipAuth: true }),
  publicPricing: () => apiFetch('/public/pricing', { skipAuth: true }),
  health: () => apiFetch('/health', { skipAuth: true }),
};
