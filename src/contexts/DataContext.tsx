import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { supabase, UserData } from '../lib/supabase';
import { useAuth } from './AuthContext';

interface DataContextType {
  activeMonth: string;
  data: UserData;
  loading: boolean;
  setActiveMonth: (month: string) => void;
  loadData: () => Promise<void>;
  addIncome: (amount: number) => Promise<void>;
  addBudget: (category: string, amount: number, tags: string[]) => Promise<void>;
  deleteBudget: (id: string) => Promise<void>;
  addExpense: (category: string, amount: number, date: string, note: string) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  resetMonth: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DEFAULT_CATEGORIES = [
  "Food", "Clothing", "House Rent", "Transport", "Subscription",
  "Giving", "Utilities", "Education", "Healthcare", "Savings",
];

function getMonthKey(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

function createId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

export function DataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [activeMonth, setActiveMonth] = useState(getMonthKey(new Date()));
  const [data, setData] = useState<UserData>({ income: 0, budgets: [], expenses: [] });
  const [loading, setLoading] = useState(false);

  const loadData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [incomeRes, budgetsRes, expensesRes] = await Promise.all([
        supabase.from('income').select('amount').eq('month', activeMonth).maybeSingle(),
        supabase.from('budgets').select('*').eq('month', activeMonth),
        supabase.from('expenses').select('*').eq('month', activeMonth)
      ]);
      setData({
        income: incomeRes.data?.amount || 0,
        budgets: budgetsRes.data || [],
        expenses: expensesRes.data || [],
      });
    } finally {
      setLoading(false);
    }
  }, [user, activeMonth]);

  const addIncome = async (amount: number) => {
    if (!user) return;
    await supabase.from('income').upsert({ user_id: user.id, month: activeMonth, amount });
    await loadData();
  };

  const addBudget = async (category: string, amount: number, tags: string[]) => {
    if (!user) return;
    await supabase.from('budgets').upsert({
      user_id: user.id, id: createId(), month: activeMonth,
      category, amount, tags
    });
    await loadData();
  };

  const deleteBudget = async (id: string) => {
    await supabase.from('budgets').delete().eq('id', id);
    await loadData();
  };

  const addExpense = async (category: string, amount: number, date: string, note: string) => {
    if (!user) return;
    await supabase.from('expenses').insert({
      user_id: user.id, id: createId(), month: activeMonth,
      category, amount, date, note
    });
    await loadData();
  };

  const deleteExpense = async (id: string) => {
    await supabase.from('expenses').delete().eq('id', id);
    await loadData();
  };

  const resetMonth = async () => {
    if (!user || !confirm("Reset all data for this month?")) return;
    await supabase.from('expenses').delete().eq('month', activeMonth).eq('user_id', user.id);
    await supabase.from('budgets').delete().eq('month', activeMonth).eq('user_id', user.id);
    await supabase.from('income').delete().eq('month', activeMonth).eq('user_id', user.id);
    await loadData();
  };

  return (
    <DataContext.Provider value={{
      activeMonth, data, loading, setActiveMonth, loadData,
      addIncome, addBudget, deleteBudget, addExpense, deleteExpense, resetMonth
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within DataProvider');
  return context;
}
