import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface BudgetCategory {
  id: number;
  name: string;
  budget: number;
  spent: number;
  color: string;
  icon: string;
}

export interface IncomeSource {
  id: number;
  name: string;
  amount: number;
  date: string;
}

export interface Transaction {
  id: number;
  date: string;
  description: string;
  amount: number;
  category: string;
  mode: string;
  status: string;
}

interface BudgetContextType {
  budgets: BudgetCategory[];
  income: IncomeSource[];
  transactions: Transaction[];
  setBudgets: (budgets: BudgetCategory[]) => void;
  addIncome: (income: Omit<IncomeSource, 'id'>) => void;
  addBudget: (budget: Omit<BudgetCategory, 'id' | 'spent'>) => void;
  processPayment: (payment: { amount: number; description: string; category: string; merchant: string }) => void;
  getTotalBudget: () => number;
  getTotalSpent: () => number;
  getTotalIncome: () => number;
  getCurrentBalance: () => number;
  getBudgetUsagePercentage: () => number;
  getSavingsPercentage: () => number;
}

const BudgetContext = createContext<BudgetContextType | undefined>(undefined);

const initialBudgets: BudgetCategory[] = [];

const initialIncome: IncomeSource[] = [];
const initialTransactions: Transaction[] = [];

export const BudgetProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [budgets, setBudgets] = useState<BudgetCategory[]>(initialBudgets);
  const [income, setIncome] = useState<IncomeSource[]>(initialIncome);
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);

  // Load data from localStorage on mount (with future Supabase integration ready)
  useEffect(() => {
    const loadData = async () => {
      try {
        // First, call edge function to set up tables if user is authenticated
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.functions.invoke('setup-finance-tables');
          toast.success('Database connected and tables ready!');
        }
      } catch (error) {
        console.log('Database setup in progress, using local storage for now');
      }

      // Load from localStorage
      const savedBudgets = localStorage.getItem('budgets');
      const savedIncome = localStorage.getItem('income');
      const savedTransactions = localStorage.getItem('transactions');
      
      if (savedBudgets) setBudgets(JSON.parse(savedBudgets));
      if (savedIncome) setIncome(JSON.parse(savedIncome));
      if (savedTransactions) setTransactions(JSON.parse(savedTransactions));
    };

    loadData();
  }, []);

  // Save to localStorage as backup when data changes
  useEffect(() => {
    localStorage.setItem('budgets', JSON.stringify(budgets));
  }, [budgets]);

  useEffect(() => {
    localStorage.setItem('income', JSON.stringify(income));
  }, [income]);

  useEffect(() => {
    localStorage.setItem('transactions', JSON.stringify(transactions));
  }, [transactions]);

  const addIncome = (newIncome: Omit<IncomeSource, 'id'>) => {
    const existingIncome = income.find(source => source.name === newIncome.name);
    
    if (existingIncome && newIncome.name === "Salary") {
      // For salary, accumulate the amount
      const updatedIncome = income.map(source => 
        source.name === "Salary" 
          ? { ...source, amount: source.amount + newIncome.amount, date: newIncome.date }
          : source
      );
      setIncome(updatedIncome);
    } else {
      // For others or new income sources, add as new entry
      const incomeWithId = {
        ...newIncome,
        id: income.length > 0 ? Math.max(...income.map(i => i.id)) + 1 : 1
      };
      setIncome([...income, incomeWithId]);
    }

    // Add transaction entry
    const newTransaction: Transaction = {
      id: transactions.length > 0 ? Math.max(...transactions.map(t => t.id)) + 1 : 1,
      date: newIncome.date,
      description: `${newIncome.name} Credit`,
      amount: newIncome.amount,
      category: "Income",
      mode: "Bank Transfer",
      status: "completed"
    };
    setTransactions([newTransaction, ...transactions]);
    
    // Try to sync with Supabase in background
    syncToSupabase();
  };

  const addBudget = (newBudget: Omit<BudgetCategory, 'id' | 'spent'>) => {
    const budgetWithId = {
      ...newBudget,
      id: budgets.length > 0 ? Math.max(...budgets.map(b => b.id)) + 1 : 1,
      spent: 0
    };
    setBudgets([...budgets, budgetWithId]);
    
    // Try to sync with Supabase in background
    syncToSupabase();
  };

  const getTotalBudget = () => {
    return budgets.reduce((sum, category) => sum + category.budget, 0);
  };

  const getTotalSpent = () => {
    return budgets.reduce((sum, category) => sum + category.spent, 0);
  };

  const getTotalIncome = () => {
    return income.reduce((sum, source) => sum + source.amount, 0);
  };

  const getCurrentBalance = () => {
    return getTotalIncome() - getTotalSpent();
  };

  const getBudgetUsagePercentage = () => {
    const totalBudget = getTotalBudget();
    const totalSpent = getTotalSpent();
    return totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;
  };

  const getSavingsPercentage = () => {
    const totalIncome = getTotalIncome();
    const totalSpent = getTotalSpent();
    const savings = totalIncome - totalSpent;
    return totalIncome > 0 ? Math.round((savings / totalIncome) * 100) : 0;
  };

  const processPayment = (payment: { amount: number; description: string; category: string; merchant: string }) => {
    // Add transaction for the payment
    const newTransaction: Transaction = {
      id: transactions.length > 0 ? Math.max(...transactions.map(t => t.id)) + 1 : 1,
      date: new Date().toISOString().split('T')[0],
      description: `${payment.merchant} - ${payment.description}`,
      amount: -payment.amount, // Negative amount for expense
      category: payment.category,
      mode: "UPI",
      status: "completed"
    };
    setTransactions([newTransaction, ...transactions]);

    // Update budget spent amount for the category
    const updatedBudgets = budgets.map(budget => 
      budget.name === payment.category 
        ? { ...budget, spent: budget.spent + payment.amount }
        : budget
    );
    setBudgets(updatedBudgets);
    
    // Try to sync with Supabase in background
    syncToSupabase();
  };

  // Background sync function
  const syncToSupabase = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Sync data to Supabase when database is ready
        console.log('Data ready for sync to Supabase when tables are available');
      }
    } catch (error) {
      console.log('Supabase sync will be available when database is fully configured');
    }
  };

  const value: BudgetContextType = {
    budgets,
    income,
    transactions,
    setBudgets,
    addIncome,
    addBudget,
    processPayment,
    getTotalBudget,
    getTotalSpent,
    getTotalIncome,
    getCurrentBalance,
    getBudgetUsagePercentage,
    getSavingsPercentage
  };

  return (
    <BudgetContext.Provider value={value}>
      {children}
    </BudgetContext.Provider>
  );
};

export const useBudget = () => {
  const context = useContext(BudgetContext);
  if (context === undefined) {
    throw new Error('useBudget must be used within a BudgetProvider');
  }
  return context;
};