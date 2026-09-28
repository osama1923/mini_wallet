import { User, RecipientUser, Transaction, AuditLog, SecurityTestReport, StorageInspectionResponse } from '../types';

let authToken: string | null = localStorage.getItem('fintech_wallet_token');

export const setAuthToken = (token: string | null) => {
  authToken = token;
  if (token) {
    localStorage.setItem('fintech_wallet_token', token);
  } else {
    localStorage.removeItem('fintech_wallet_token');
  }
};

export const getAuthToken = () => authToken;

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');

  if (authToken) {
    headers.set('Authorization', `Bearer ${authToken}`);
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data.error || data.message || `Request failed with status ${response.status}`;
    const err = new Error(errorMsg) as Error & { status: number; data: any };
    err.status = response.status;
    err.data = data;
    throw err;
  }

  return data as T;
}

export const api = {
  // Auth
  async register(name: string, email: string, password: string): Promise<{ token: string; user: User; message: string }> {
    const res = await request<{ token: string; user: User; message: string }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
    setAuthToken(res.token);
    return res;
  },

  async login(email: string, password: string): Promise<{ token: string; user: User; message: string }> {
    const res = await request<{ token: string; user: User; message: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setAuthToken(res.token);
    return res;
  },

  async logout(): Promise<void> {
    try {
      await request('/api/auth/logout', { method: 'POST' });
    } finally {
      setAuthToken(null);
    }
  },

  async getCurrentUser(): Promise<{ user: User }> {
    return request<{ user: User }>('/api/auth/me');
  },

  // Users Directory
  async getRecipients(): Promise<{ users: RecipientUser[] }> {
    return request<{ users: RecipientUser[] }>('/api/users');
  },

  // Wallet
  async getWallet(): Promise<{ wallet: { userId: string; balance: number; currency: string; accountNumber: string; updatedAt: string } }> {
    return request('/api/wallet');
  },

  async deposit(amount: number): Promise<{ message: string; transaction: Transaction; updatedBalance: number }> {
    return request('/api/wallet/deposit', {
      method: 'POST',
      body: JSON.stringify({ amount }),
    });
  },

  // Transfer
  async transfer(receiverId: string, amount: number, note?: string): Promise<{
    message: string;
    transaction: Transaction;
    updatedBalance: number;
    currency: string;
  }> {
    return request('/api/transfer', {
      method: 'POST',
      body: JSON.stringify({ receiverId, amount, note }),
    });
  },

  // Transactions
  async getTransactions(): Promise<{ transactions: Transaction[] }> {
    return request<{ transactions: Transaction[] }>('/api/transactions');
  },

  async verifyTransaction(id: string): Promise<{
    transactionId: string;
    isCryptographicallyValid: boolean;
    signature: string;
    algorithm: string;
    verifiedAt: string;
    transaction: Transaction;
  }> {
    return request(`/api/transactions/${id}/verify`);
  },

  // Audit Logs
  async getAuditLogs(): Promise<{ logs: AuditLog[] }> {
    return request<{ logs: AuditLog[] }>('/api/audit-logs');
  },

  // Security Attack Test Simulation
  async runSecurityTest(testType: string, payload: any = {}): Promise<SecurityTestReport> {
    return request<SecurityTestReport>('/api/security-test/attack', {
      method: 'POST',
      body: JSON.stringify({ testType, ...payload }),
    });
  },

  // Security Storage Inspection
  async inspectStorage(): Promise<StorageInspectionResponse> {
    return request<StorageInspectionResponse>('/api/security/storage-inspection');
  },

  // Demo Controls
  async resetDemo(): Promise<{ message: string; accounts: any[] }> {
    return request('/api/demo/reset', { method: 'POST' });
  },

  async switchUser(target: 'sara' | 'ali'): Promise<{ token: string; user: User; message: string }> {
    const res = await request<{ token: string; user: User; message: string }>('/api/demo/switch-user', {
      method: 'POST',
      body: JSON.stringify({ target }),
    });
    setAuthToken(res.token);
    return res;
  },
};
