export interface User {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  ipay_id: string;
  balance: number;
  is_active: boolean;
  created_at: string;
}

export interface PaymentMethod {
  id: number;
  user_id: number;
  type: 'ewallet' | 'bank' | 'ipay';
  provider: string;
  identifier: string | null;
  is_active: boolean;
}

export interface Transaction {
  id: number;
  transaction_code: string;
  type: 'payment' | 'transfer' | 'topup' | 'request_payment';
  sender_id: number | null;
  receiver_id: number | null;
  amount: number;
  payment_method_id: number | null;
  description: string | null;
  status: 'pending' | 'success' | 'failed' | 'cancelled' | 'expired' | 'used';
  otp_code: string | null;
  expires_at: string | null;
  completed_at: string | null;
  created_at: string;
  direction?: 'in' | 'out';
  sender?: Partial<User>;
  receiver?: Partial<User>;
}

export interface PaymentRequest {
  id: number;
  requester_id: number;
  payer_id: number;
  amount: number;
  description: string | null;
  notes: string | null;
  status: 'pending' | 'accepted' | 'rejected' | 'expired' | 'cancelled';
  transaction_id: number | null;
  payment_code?: string | null;
  expires_at: string | null;
  created_at: string;
  requester?: Partial<User>;
  payer?: Partial<User>;
  transaction?: Partial<Transaction>;
}
