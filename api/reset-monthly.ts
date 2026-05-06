import { createClient } from '@supabase/supabase-js';

// Vercel serverless function — called by Vercel Cron on the 1st of each month
export default async function handler(
  req: { method: string; headers: Record<string, string | string[] | undefined> },
  res: { status: (code: number) => { json: (body: unknown) => void } }
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Verify Vercel Cron secret (automatically provided by Vercel Cron)
  const authHeader = req.headers.authorization;
  const expectedToken = `Bearer ${process.env.CRON_SECRET}`;

  if (!expectedToken || authHeader !== expectedToken) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase environment variables');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    const { data, error } = await supabase.rpc('reset_monthly_usage');

    if (error) {
      console.error('reset_monthly_usage RPC failed:', error);
      return res.status(500).json({ error: error.message });
    }

    console.log('Monthly usage reset successful:', data);

    return res.status(200).json({
      success: true,
      message: 'Monthly usage reset successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('Unexpected error in reset-monthly:', message);
    return res.status(500).json({ error: message });
  }
}
