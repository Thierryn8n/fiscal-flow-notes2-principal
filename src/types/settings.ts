export interface CompanyData {
  name: string;
  cnpj: string;
  address: string;
  phone: string;
  email: string;
  logo_url?: string;
}

export interface PrinterSettings {
  enabled: boolean;
  auto_print: boolean;
  copies: number;
  default_printer?: string;
}

export interface DeliverySettings {
  delivery_radii: DeliveryRadius[];
}

export interface DeliveryRadius {
  id: string;
  radius: number;
  fee: number;
  center: {
    lat: number;
    lng: number;
  };
}

export interface InstallmentFee {
  installments: number;
  fee_percentage: number;
}

export interface UserSettings {
  id?: string;
  user_id: string;
  company_data: CompanyData;
  printer_settings: PrinterSettings;
  delivery_settings: DeliverySettings;
  installment_fees: InstallmentFee[];
  created_at?: string;
  updated_at?: string;
}

export const defaultSettings: UserSettings = {
  id: '',
  user_id: '',
  company_data: {
    name: '',
    cnpj: '',
    address: '',
    phone: '',
    email: '',
  },
  installment_fees: [],
  delivery_settings: {
    delivery_radii: []
  },
  printer_settings: {
    enabled: false,
    auto_print: false,
    copies: 1,
  },
  created_at: undefined,
  updated_at: undefined
}; 