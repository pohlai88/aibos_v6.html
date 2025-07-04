import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    const { organizationId, asOfDate } = await req.json()

    // Generate trial balance
    const { data: ledgerEntries, error } = await supabaseClient
      .from('ledger_entries')
      .select('*')
      .eq('organization_id', organizationId)
      .lte('transaction_date', asOfDate)

    if (error) {
      throw error
    }

    // Calculate trial balance
    const trialBalance = ledgerEntries.reduce((acc: any, entry: any) => {
      const accountCode = entry.account_code
      
      if (!acc[accountCode]) {
        acc[accountCode] = {
          account_code: accountCode,
          account_name: entry.account_name,
          total_debit: 0,
          total_credit: 0,
          balance: 0
        }
      }
      
      acc[accountCode].total_debit += entry.debit_amount || 0
      acc[accountCode].total_credit += entry.credit_amount || 0
      acc[accountCode].balance = acc[accountCode].total_debit - acc[accountCode].total_credit
      
      return acc
    }, {})

    return new Response(
      JSON.stringify({
        trial_balance: Object.values(trialBalance),
        as_of_date: asOfDate,
        organization_id: organizationId
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
}) 