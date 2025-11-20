/// <reference types="vite/client" />

import { createClient } from '@supabase/supabase-js';

// Use Vite environment variables instead of process.env to prevent build errors
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Initialize the Supabase client only if the environment variables are available.
export const supabase = (supabaseUrl && supabaseKey)
  ? createClient(supabaseUrl, supabaseKey)
  : null;
