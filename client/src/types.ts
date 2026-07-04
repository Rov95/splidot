export interface Group {
  group_id: string;
  name: string | null;
  total_expense: number | string;
  created_at: string;
}

export interface Participant {
  user_id: string;
  name: string | null;
  icon: string;
}

export interface LocalExpense {
  payerName: string;
  amount: number;
  category: string;
  expenseName: string;
}

export interface Expense {
  expense_id: string;
  group_id: string;
  user_id: string;
  payer_name: string | null;
  amount: number;
  description: string | null;
  category: string | null;
  created_at: string;
}

export interface Balance {
  user_id: string;
  name: string | null;
  total_paid: number;
}

export interface Settlement {
  settlement_id: string;
  group_id: string;
  from_user_id: string;
  from_name: string | null;
  to_user_id: string;
  to_name: string | null;
  amount: number;
  is_paid: boolean;
  created_at: string;
}
