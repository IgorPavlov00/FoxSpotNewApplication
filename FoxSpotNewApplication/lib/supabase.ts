import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://azdqawzjboriyfnjryrr.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF6ZHFhd3pqYm9yaXlmbmpyeXJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyNjI4NTAsImV4cCI6MjA2ODgzODg1MH0.skF7TbeIn-GVc3cCoHXL0ZIan71NusdlQ2BHMnoqRD4'; // full anon key from the screen

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
