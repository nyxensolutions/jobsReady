import { createClient } from "@supabase/supabase-js"

// Service-role client for server-side file uploads — bypasses RLS (server-only)
export const supabaseStorage = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)
