import { createClient } from "@supabase/supabase-js";

const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || "";
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || "";

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

if (!isSupabaseConfigured) {
  console.warn(
    "Supabase credentials are not configured in your environment variables. " +
    "The application will run in interactive local offline/demo mode."
  );
}

export const supabase = createClient(
  supabaseUrl || "https://placeholder-project-id.supabase.co",
  supabaseAnonKey || "placeholder-anon-key-placeholder-anon-key-placeholder-anon-key"
);
