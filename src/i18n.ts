/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { getRequestConfig } from 'next-intl/server';
import { cookies } from 'next/headers';

// Can be imported from a shared config
export const locales = ['en', 'es'] as const;
export type Locale = (typeof locales)[number];

export default getRequestConfig(async () => {
  // Get locale from cookie or default to 'en'
  const cookieStore = await cookies();
  const localeCookie = cookieStore.get('NEXT_LOCALE');
  const locale = localeCookie?.value && locales.includes(localeCookie.value as Locale) 
    ? localeCookie.value as Locale 
    : 'en';

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default
  };
});