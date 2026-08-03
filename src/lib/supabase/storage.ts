import { createClient } from "@supabase/supabase-js"

// Minimal Supabase client for file storage only — no auth
export const supabaseStorage = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
