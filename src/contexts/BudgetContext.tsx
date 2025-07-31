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

  // Load data from Supabase on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          // Load budgets
          const { data: budgetData } = await supabase
            .from('budget_categories')
            .select('*')
            .order('created_at', { ascending: false });
          
          // Load income
          const { data: incomeData } = await supabase
            .from('income_sources')
            .select('*')
            .order('created_at', { ascending: false });
          
          // Load transactions
          const { data: transactionData } = await supabase
            .from('transactions')
            .select('*')
            .order('created_at', { ascending: false });
          
          if (budgetData) setBudgets(budgetData);
          if (incomeData) setIncome(incomeData);
          if (transactionData) setTransactions(transactionData);
          
          toast.success('Data loaded from database!');
        } else {
          // Load from localStorage if not authenticated
          const savedBudgets = localStorage.getItem('budgets');
          const savedIncome = localStorage.getItem('income');
          const savedTransactions = localStorage.getItem('transactions');
          
          if (savedBudgets) setBudgets(JSON.parse(savedBudgets));
          if (savedIncome) setIncome(JSON.parse(savedIncome));
          if (savedTransactions) setTransactions(JSON.parse(savedTransactions));
        }
      } catch (error) {
        console.error('Error loading data:', error);
        // Fallback to localStorage
        const savedBudgets = localStorage.getItem('budgets');
        const savedIncome = localStorage.getItem('income');
        const savedTransactions = localStorage.getItem('transactions');
        
        if (savedBudgets) setBudgets(JSON.parse(savedBudgets));
        if (savedIncome) setIncome(JSON.parse(savedIncome));
        if (savedTransactions) setTransactions(JSON.parse(savedTransactions));
      }
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

  const addIncome = async (newIncome: Omit<IncomeSource, 'id'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Save to Supabase
        const { data: incomeData } = await supabase
          .from('income_sources')
          .insert([{ ...newIncome, user_id: user.id }])
          .select()
          .single();

        if (incomeData) {
          setIncome([incomeData, ...income]);
        }

        // Add transaction entry
        const { data: transactionData } = await supabase
          .from('transactions')
          .insert([{
            user_id: user.id,
            date: newIncome.date,
            description: `${newIncome.name} Credit`,
            amount: newIncome.amount,
            category: "Income",
            mode: "Bank Transfer",
            status: "completed"
          }])
          .select()
          .single();

        if (transactionData) {
          setTransactions([transactionData, ...transactions]);
        }
        
        toast.success('Income added successfully!');
      } else {
        // Fallback to localStorage logic
        const existingIncome = income.find(source => source.name === newIncome.name);
        
        if (existingIncome && newIncome.name === "Salary") {
          const updatedIncome = income.map(source => 
            source.name === "Salary" 
              ? { ...source, amount: source.amount + newIncome.amount, date: newIncome.date }
              : source
          );
          setIncome(updatedIncome);
        } else {
          const incomeWithId = {
            ...newIncome,
            id: income.length > 0 ? Math.max(...income.map(i => i.id)) + 1 : 1
          };
          setIncome([...income, incomeWithId]);
        }

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
      }
    } catch (error) {
      console.error('Error adding income:', error);
      toast.error('Failed to add income');
    }
  };

  const addBudget = async (newBudget: Omit<BudgetCategory, 'id' | 'spent'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('budget_categories')
          .insert([{ ...newBudget, user_id: user.id, spent: 0 }])
          .select()
          .single();

        if (data) {
          setBudgets([...budgets, data]);
          toast.success('Budget category added successfully!');
        }
      } else {
        // Fallback to localStorage logic
        const budgetWithId = {
          ...newBudget,
          id: budgets.length > 0 ? Math.max(...budgets.map(b => b.id)) + 1 : 1,
          spent: 0
        };
        setBudgets([...budgets, budgetWithId]);
      }
    } catch (error) {
      console.error('Error adding budget:', error);
      toast.error('Failed to add budget category');
    }
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

  const processPayment = async (payment: { amount: number; description: string; category: string; merchant: string }) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Add transaction for the payment
        const { data: transactionData } = await supabase
          .from('transactions')
          .insert([{
            user_id: user.id,
            date: new Date().toISOString().split('T')[0],
            description: `${payment.merchant} - ${payment.description}`,
            amount: -payment.amount,
            category: payment.category,
            mode: "UPI",
            status: "completed"
          }])
          .select()
          .single();

        if (transactionData) {
          setTransactions([transactionData, ...transactions]);
        }

        // Update budget spent amount for the category
        const budgetToUpdate = budgets.find(b => b.name === payment.category);
        if (budgetToUpdate) {
          const { data: updatedBudget } = await supabase
            .from('budget_categories')
            .update({ spent: budgetToUpdate.spent + payment.amount })
            .eq('id', budgetToUpdate.id)
            .select()
            .single();

          if (updatedBudget) {
            const updatedBudgets = budgets.map(budget => 
              budget.id === updatedBudget.id ? updatedBudget : budget
            );
            setBudgets(updatedBudgets);
          }
        }
        
        toast.success('Payment processed successfully!');
      } else {
        // Fallback to localStorage logic
        const newTransaction: Transaction = {
          id: transactions.length > 0 ? Math.max(...transactions.map(t => t.id)) + 1 : 1,
          date: new Date().toISOString().split('T')[0],
          description: `${payment.merchant} - ${payment.description}`,
          amount: -payment.amount,
          category: payment.category,
          mode: "UPI",
          status: "completed"
        };
        setTransactions([newTransaction, ...transactions]);

        const updatedBudgets = budgets.map(budget => 
          budget.name === payment.category 
            ? { ...budget, spent: budget.spent + payment.amount }
            : budget
        );
        setBudgets(updatedBudgets);
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      toast.error('Failed to process payment');
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