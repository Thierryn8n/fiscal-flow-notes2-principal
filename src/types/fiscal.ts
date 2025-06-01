export type Note = {
  id: string;
  note_number: string;
  date: string;
  customer_data: Record<string, any>;
  products: Record<string, any>;
  payment_data: Record<string, any>;
  total_value: number;
  status: 'draft' | 'pending' | 'finalized' | 'cancelled';
  owner_id: string;
  printed_at: string | null;
  created_at: string | null;
  updated_at: string | null;
};

export type PrinterSettings = {
  id: string;
  name: string;
  ip_address: string;
  port: number;
  model: string;
  owner_id: string;
  created_at: string | null;
  updated_at: string | null;
};

export type PrintRequest = {
  id: string;
  note_id: string;
  print_settings_id: string | null;
  device_id: string | null;
  copies: number | null;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error_message: string | null;
  created_by: string;
  created_at: string;
  updated_at: string | null;
  note_data: Record<string, any>;
}; 