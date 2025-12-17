import { createClient } from '@supabase/supabase-js';

// IMPORTANTE:
// - Esta é a chave ANON pública (segura para uso no frontend).
// - Nunca use aqui a chave service_role.

const supabaseUrl = 'https://kevcojbguvqqoeiasdlj.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtldmNvamJndXZxcW9laWFzZGxqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU0ODI4MDcsImV4cCI6MjA4MTA1ODgwN30.Znef1OUR0nQZ9ER3wJBnkDpxLCeuIdejcX5GnOGkSIU';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
