'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import React from 'react';
import { Languages } from 'lucide-react';

export default function LocaleSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const handleLocaleChange = (newLocale: string) => {
    // next-intl middleware handles redirection if we change the cookie or path
    // For now, let's just update the cookie and refresh if using specific middleware logic
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000`;
    router.refresh();
  };

  return (
    <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-xl">
      <Languages size={16} className="ml-2 text-gray-500" />
      <select
        value={locale}
        onChange={(e) => handleLocaleChange(e.target.value)}
        className="bg-transparent text-xs font-bold text-gray-700 dark:text-gray-300 focus:outline-none pr-2 py-1 cursor-pointer"
      >
        <option value="en">English</option>
        <option value="hi">हिंदी</option>
        <option value="gu">ગુજરાતી</option>
      </select>
    </div>
  );
}
