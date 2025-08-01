import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, user_id } = await req.json();
    
    if (!message || !user_id) {
      throw new Error('Message and user_id are required');
    }

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OPENAI_API_KEY is not configured');
    }

    // Initialize Supabase client
    const supabaseUrl = `https://mtldnjtcnlululyfhghj.supabase.co`;
    const supabaseKey = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10bGRuanRjbmx1bHVseWZoZ2hqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM4NDU0NDAsImV4cCI6MjA2OTQyMTQ0MH0.TIc3MdIvIN3IrEvnxH9_wCd_oBOy-79UKxZmSHuKriA`;
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user's financial data
    const { data: transactions, error: transactionsError } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user_id)
      .order('date', { ascending: false });

    if (transactionsError) {
      console.error('Error fetching transactions:', transactionsError);
    }

    const { data: budgetCategories, error: budgetError } = await supabase
      .from('budget_categories')
      .select('*')
      .eq('user_id', user_id);

    if (budgetError) {
      console.error('Error fetching budget categories:', budgetError);
    }

    const { data: incomeData, error: incomeError } = await supabase
      .from('income_sources')
      .select('*')
      .eq('user_id', user_id);

    if (incomeError) {
      console.error('Error fetching income data:', incomeError);
    }

    // Prepare financial context for OpenAI
    const financialContext = {
      transactions: transactions || [],
      budgetCategories: budgetCategories || [],
      incomeData: incomeData || [],
      totalTransactions: transactions?.length || 0,
      totalBudgetCategories: budgetCategories?.length || 0
    };

    // Analyze transaction patterns for intelligent categorization
    const transactionPatterns = transactions?.reduce((acc, transaction) => {
      const category = transaction.category;
      const description = transaction.description.toLowerCase();
      
      if (!acc[category]) {
        acc[category] = {
          count: 0,
          totalAmount: 0,
          descriptions: [],
          avgAmount: 0
        };
      }
      
      acc[category].count += 1;
      acc[category].totalAmount += Number(transaction.amount);
      acc[category].descriptions.push(description);
      acc[category].avgAmount = acc[category].totalAmount / acc[category].count;
      
      return acc;
    }, {}) || {};

    const systemPrompt = `You are FinPilot, an AI financial assistant specializing in personal finance analysis and intelligent transaction categorization. Your primary capabilities include:

INTELLIGENT TRANSACTION CATEGORIZATION:
- Analyze transaction descriptions and amounts to suggest better categorization
- Learn from user's spending patterns to provide personalized category recommendations
- Identify recurring transactions and suggest automatic categorization rules
- Detect potential miscategorized transactions based on description patterns

SPENDING ANALYSIS WORKFLOW:
1. FIRST, ask for specific details if not provided:
   - Start date of the period (format: YYYY-MM-DD)
   - End date of the period (format: YYYY-MM-DD) 
   - Specific category to analyze (if not mentioned)

2. THEN, perform intelligent analysis:
   - Filter transactions by the specified date range and category
   - Calculate total spent in that category during the period
   - Compare against budget (if available)
   - Identify spending patterns, trends, and anomalies
   - Suggest better categorization for transactions that seem misplaced

3. FINALLY, provide:
   - Clear summary with total amount spent
   - Budget comparison and variance analysis
   - Category optimization suggestions
   - Personalized spending insights based on user's behavior
   - Recommendations for improving financial tracking

CATEGORIZATION INTELLIGENCE:
- Current transaction patterns: ${JSON.stringify(transactionPatterns, null, 2)}
- Available categories: ${[...new Set(transactions?.map(t => t.category) || [])].join(', ')}
- Total transactions analyzed: ${financialContext.totalTransactions}
- Budget categories: ${financialContext.totalBudgetCategories}

USER'S FINANCIAL DATA:
${JSON.stringify(financialContext, null, 2)}

When users ask about categorization, provide specific suggestions based on transaction descriptions and amounts. Be proactive in identifying patterns and suggesting improvements to their financial tracking system.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: systemPrompt
          },
          { 
            role: 'user', 
            content: message 
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const assistantMessage = data.choices[0].message.content;

    return new Response(JSON.stringify({ 
      message: assistantMessage,
      financialSummary: {
        totalTransactions: financialContext.totalTransactions,
        availableCategories: [...new Set(transactions?.map(t => t.category) || [])],
        budgetCategories: budgetCategories?.map(bc => ({ name: bc.name, budget: bc.budget, spent: bc.spent })) || []
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in AI financial assistant:', error);
    return new Response(JSON.stringify({ 
      error: 'An error occurred while processing your request',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});