import "server-only";

import { neon } from "@neondatabase/serverless";

/**
 * Neon PostgreSQL client — CHỈ chạy server-side (API route).
 *
 * - Đọc connection string từ `process.env.DATABASE_URL` (KHÔNG dùng NEXT_PUBLIC).
 * - `import "server-only"` đảm bảo file này không bao giờ bị bundle vào client.
 * - `sql` là tagged-template function; tham số được parameter-hoá (chống SQL injection).
 */
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("Missing DATABASE_URL environment variable");
}

export const sql = neon(databaseUrl);
