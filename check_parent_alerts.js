const { createClient } = require('@supabase/supabase-js');
const url = process.env.VITE_SUPABASE_URL || 'https://jnszhhfzwtovvdqxrmvo.supabase.co';
const key = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'eyJhbGci...';
const supabase = createClient(url,key);
(async ()=>{
  const { data, error } = await supabase.from('parent_alerts').select('*').limit(5);
  console.log('error', error);
  console.log('data', data);
  const { data: countData, error: countError } = await supabase.from('parent_alerts').select('*',{ count: 'exact', head: false });
  console.log('countData', countData ? countData.length : null, 'countError', countError);
})();
