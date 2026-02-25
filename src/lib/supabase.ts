import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://vbokuabjpbadczglpxfj.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZib2t1YWJqcGJhZGN6Z2xweGZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIwMTY4MzYsImV4cCI6MjA4NzU5MjgzNn0.emGSzOo3f_d52qGz3AyRwalsyOmvuQhFin6xMHPKTC4";

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export interface Budget {
  id: string;
  user_id: string;
  month: string;
  category: string;
  amount: number;
  tags: string[];
}

export interface Expense {
  id: string;
  user_id: string;
  month: string;
  category: string;
  amount: number;
  date: string;
  note: string;
}

export interface Income {
  user_id: string;
  month: string;
  amount: number;
}

export interface UserData {
  income: number;
  budgets: Budget[];
  expenses: Expense[];
}
