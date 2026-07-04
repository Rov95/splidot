export interface Group {
  group_id: string;
  name: string | null;
  total_expense: number | string;
  created_at: string;
}

export interface Participant {
  user_id: string;
  name: string | null;
  totalPaid: number;
  icon: string;
}

export interface LocalExpense {
  payerName: string;
  amount: number;
  category: string;
  expenseName: string;
}

export interface Settlement {
  from: string | null;
  to: string | null;
  amount: number;
}
