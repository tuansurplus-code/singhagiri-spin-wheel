import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { name, email, prize } = req.body;

  try {
    // 1. Upsert User
    let { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (!user) {
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert([{ name, email }])
        .select()
        .single();

      if (createError) throw createError;
      user = newUser;
    }

    // 2. Record Spin Result
    const { error: spinError } = await supabase
      .from('spin_results')
      .insert([{ user_id: user.id, prize_name: prize }]);

    if (spinError) throw spinError;

    return res.status(200).json({ status: 'success', message: 'Spin recorded!' });
  } catch (error) {
    return res.status(500).json({ status: 'error', message: error.message });
  }
}