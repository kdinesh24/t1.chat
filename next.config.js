/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        hostname: 'avatar.vercel.sh',
      },
    ],
  },
  transpilePackages: ['shiki'],
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Handle ESM packages that need to be bundled
      config.externals = config.externals || [];

      // Filter out problematic ESM packages from externals
      config.externals = config.externals.filter((external) => {
        if (typeof external === 'string') {
          return !['shiki', 'bcrypt-ts'].includes(external);
        }
        if (typeof external === 'function') {
          return (context, callback) => {
            if (['shiki', 'bcrypt-ts'].some((pkg) => context.includes(pkg))) {
              return callback();
            }
            return external(context, callback);
          };
        }
        return true;
      });
    }
    return config;
  },
};

module.exports = nextConfig;
