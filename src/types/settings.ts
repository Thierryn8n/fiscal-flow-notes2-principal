export interface CompanyData {
  name: string;
  logo?: string;
  address?: {
    street?: string;
    number?: string;
    city?: string;
    state?: string;
    zipCode?: string;
  };
}

export interface InstallmentFee {
  installments: number;
  fee: number;
}

export interface DeliverySettings {
  delivery_radii: Array<{
    radius: number;
    fee: number;
  }>;
}

export interface PrinterSettings {
  enabled: boolean;
  default_printer?: string;
  auto_print: boolean;
  copies: number;
}

export interface EcommerceSettings {
  enabled: boolean;
  admin_panel_enabled: boolean;
  theme?: {
    primary_color?: string;
    secondary_color?: string;
    font_family?: string;
  };
}

export interface UserSettings {
  id: string;
  user_id: string;
  company_data: CompanyData;
  installment_fees: InstallmentFee[];
  delivery_settings: DeliverySettings;
  printer_settings: PrinterSettings;
  ecommerce_settings: EcommerceSettings;
  created_at?: string;
  updated_at?: string;
}

export const defaultSettings: UserSettings = {
  id: '',
  user_id: '',
  company_data: {
    name: '',
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
  ecommerce_settings: {
    enabled: false,
    admin_panel_enabled: false,
  },
  created_at: undefined,
  updated_at: undefined
}; 