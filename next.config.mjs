/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [ new URL('https://jkt48.com/api/v1/storages/media/jkt48-member/**')]
  }
};

export default nextConfig;
