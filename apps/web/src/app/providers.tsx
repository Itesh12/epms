'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { useState, useEffect } from 'react';
import { SocketProvider } from '@/components/realtime/SocketProvider';
import { NextIntlClientProvider } from 'next-intl';
import { useLocale } from 'next-intl';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
      },
    },
  }));

  const [messages, setMessages] = useState<any>(null);
  const locale = 'en'; // Default or from cookie

  useEffect(() => {
    // Simple client-side message loader for demo/scaling
    import(`../messages/en.json`).then(m => setMessages(m.default));
  }, []);

  if (!messages) return null;

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <QueryClientProvider client={queryClient}>
        <SocketProvider>
          {children}
        </SocketProvider>
      </QueryClientProvider>
    </NextIntlClientProvider>
  );
}
