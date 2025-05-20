/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['cdn3.iconfinder.com', 'lh3.googleusercontent.com', 'www.gstatic.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn3.iconfinder.com',
      },
    ],
  },
};

export default nextConfig;
