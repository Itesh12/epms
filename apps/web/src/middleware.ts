import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  locales: ['en', 'hi', 'gu'],
  defaultLocale: 'en'
});

export const config = {
  matcher: ['/', '/(hi|en|gu)/:path*']
};
