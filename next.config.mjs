/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [ new URL('https://jkt48.com/profile/**')]
  }
};

export default nextConfig;
