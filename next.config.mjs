/** @type {import('next').NextConfig} */
// Cấu hình cho deploy trên VERCEL (Next.js server, có API routes).
// LƯU Ý: bản cũ dùng cho GitHub Pages — `output: 'export'` + `basePath`/`assetPrefix = '/property-nextjs'`
// khiến Vercel (serve ở root '/') load sai đường dẫn CSS/JS/ảnh → giao diện mất style, và static
// export chặn API route. Đã gỡ các mục đó để Vercel chạy chuẩn và bật được `/api/survey/submit`.
const nextConfig = {
  images: {
    // Ảnh local; giữ unoptimized để không đổi hành vi hiển thị ảnh hiện tại.
    unoptimized: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
