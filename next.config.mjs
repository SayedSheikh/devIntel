/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
        // GitHub avatar images
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        // Google profile images
      },
      {
        protocol: "https",
        hostname: "*.supabase.co",
        // Supabase storage images
      },
    ],
  },
};

export default nextConfig;
