export interface PrintRequest {
  id: string;
  created_at: string;
  created_by: string;
  device_id: string | null;
  error_message: string | null;
  note_data: any;
  note_id: string;
  print_settings_id: string | null;
  print_type: string;
  printer_id: string | null;
  printer_name: string;
  status: string;
  copies: number | null;
  updated_at: string | null;
  updated_by: string | null;
  printed_by?: string | null;
  printed_at?: string | null;
} 