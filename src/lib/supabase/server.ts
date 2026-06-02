import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Supabase client dùng SERVICE ROLE — CHỈ chạy server-side (API route).
 *
 * - Đọc env `SUPABASE_URL` và `SUPABASE_SERVICE_ROLE_KEY` (KHÔNG dùng NEXT_PUBLIC).
 * - `import "server-only"` đảm bảo file này không bao giờ bị bundle vào client.
 * - Service role bỏ qua RLS, nên endpoint phải tự validate input trước khi insert.
 */
export function getSupabaseAdmin(): SupabaseClient {
  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url) {
    throw new Error("Thiếu env SUPABASE_URL (server-side).");
  }
  if (!serviceRoleKey) {
    throw new Error("Thiếu env SUPABASE_SERVICE_ROLE_KEY (server-side).");
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
