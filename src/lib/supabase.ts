// API client for Lighthouse App — replaces Supabase client
// Communicates with PHP backend at /api/

const API_BASE = '/api';

export interface HealthReportRow {
  id: string;
  user_id: string | null;
  symptom: string;
  note: string;
  city: string;
  lat: number;
  lng: number;
  created_at: string;
}

export const api = {
  healthReports: {
    async list(): Promise<HealthReportRow[]> {
      try {
        const res = await fetch(`${API_BASE}/health-reports.php`);
        if (!res.ok) return [];
        return await res.json();
      } catch {
        console.warn('Failed to fetch health reports');
        return [];
      }
    },

    async insert(report: {
      user_id?: string | null;
      symptom: string;
      note: string;
      city: string;
      lat: number;
      lng: number;
    }): Promise<{ data: HealthReportRow | null; error: string | null }> {
      try {
        const res = await fetch(`${API_BASE}/health-reports.php`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(report),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({ error: 'Unknown error' }));
          return { data: null, error: err.error || 'Failed to insert' };
        }
        const data = await res.json();
        return { data, error: null };
      } catch (e) {
        return { data: null, error: String(e) };
      }
    },
  },

  chatMessages: {
    async insert(message: {
      user_id?: string | null;
      session_id: string;
      role: string;
      content: string;
    }): Promise<void> {
      try {
        await fetch(`${API_BASE}/chat-messages.php`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(message),
        });
      } catch {
        console.warn('Failed to persist chat message');
      }
    },
  },
};
