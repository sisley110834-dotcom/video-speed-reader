/** @type {import('next').NextConfig} */
const nextConfig = {
  // Preserve M0's "build doesn't gate on types" behavior. (Next 16 no longer runs ESLint
  // during `next build`, so the old `eslint.ignoreDuringBuilds` key is gone.)
  typescript: { ignoreBuildErrors: true },
  // The app's auth pages live at /signin and /signup (M0 URLs, already in Supabase's
  // redirect allow-list). Keep the hyphenated spellings working too.
  async redirects() {
    return [
      { source: '/sign-in', destination: '/signin', permanent: false },
      { source: '/sign-up', destination: '/signup', permanent: false },
    ];
  },
};
export default nextConfig;
