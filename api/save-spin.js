import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return res.status(500).json({ error: 'Missing Supabase Environment Variables in Vercel' });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const { name, email, prize } = req.body;

    const { data, error } = await supabase
      .from('spin_results')
      .insert([{ name, email, prize }]);

    if (error) {
      console.error('Supabase Insert Error:', error);
      return res.status(400).json({ error: error.message });
    }

    return res.status(200).json({ success: true, data });
  } catch (err) {
    console.error('Server Execution Error:', err);
    return res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
}
