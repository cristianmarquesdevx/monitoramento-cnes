import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://cptkatdswfyycsgedcte.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNwdGthdGRzd2Z5eWNzZ2VkY3RlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIxNDQ2MTcsImV4cCI6MjA5NzcyMDYxN30.MPxI1t1gyr1dpnqG-w_oM8FagnewLyxnojs9gZyIpfw';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
