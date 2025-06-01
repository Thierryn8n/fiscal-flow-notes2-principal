export interface Seller {
  id: string;
  full_name: string;
  email: string | null;
  phone: string;
  image_path: string | null;
  active: boolean | null;
  auth_user_id: string | null;
  owner_id: string;
  created_at: string | null;
  updated_at: string | null;
}

export interface SellerStats {
  totalSales: number;
  averageTicket: number;
  notesCount: number;
  lastSaleDate: string | null;
} 