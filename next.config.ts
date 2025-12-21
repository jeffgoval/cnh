import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = config.externals || []
      config.externals.push({
        '@supabase/supabase-js': 'commonjs @supabase/supabase-js',
      })
    }
    return config
  },
  serverExternalPackages: ['@supabase/supabase-js']
}

export default nextConfig



