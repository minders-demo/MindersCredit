export interface UserProfile {
  auth_uid: string;
  customer_id: string;
  rut: string; // Stored securely internally, NEVER sent to Amplitude events
  first_name: string;
  last_name: string;
  created_at: string;
  updated_at: string;
  es_socio?: boolean;
  region?: string;
  comuna?: string;
  pensionada?: boolean;
  transactions?: any[];
}

export interface AuthState {
  user: UserProfile | null;
  loading: boolean;
  error: string | null;
}
