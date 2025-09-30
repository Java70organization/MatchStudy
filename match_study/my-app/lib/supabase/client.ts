//import { createBrowserClient } from "@supabase/ssr";
/*import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
const supabaseUrl = 'https://lksruyrnhqwvkwaacwjq.supabase.co'
const supabaseKey = process.env.SUPABASE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)
);

*/
/*
"use client";

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl) throw new Error("Falta NEXT_PUBLIC_SUPABASE_URL en .env.local");
if (!supabaseKey) throw new Error("Falta NEXT_PUBLIC_SUPABASE_ANON_KEY en .env.local");

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
});
*/

"use client";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY; // fallback si lo usaste antes

if (!supabaseUrl) throw new Error("Falta NEXT_PUBLIC_SUPABASE_URL en .env.local");
if (!supabaseKey) throw new Error("Falta NEXT_PUBLIC_SUPABASE_ANON_KEY en .env.local");

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
});