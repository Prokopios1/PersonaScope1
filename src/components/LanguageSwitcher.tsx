'use client';

import { usePathname, useRouter } from 'next/navigation';
import { i18n, type Locale } from '@/i18n-config';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Languages } from 'lucide-react';

interface LanguageSwitcherProps {
  currentLocale: Locale;
}

export default function LanguageSwitcher({ currentLocale }: LanguageSwitcherProps) {
  const pathName = usePathname();
  const router = useRouter();

  const redirectedPathName = (locale: Locale) => {
    if (!pathName) return '/';
    const segments = pathName.split('/');
    segments[1] = locale;
    return segments.join('/');
  };

  const handleLocaleChange = (newLocale: Locale) => {
    document.cookie = `NEXT_LOCALE=${newLocale};path=/;max-age=31536000`; // 1 year
    router.push(redirectedPathName(newLocale));
  };
  
  const languageNames: Record<Locale, string> = {
    en: 'English',
    el: 'Ελληνικά',
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Languages className="h-5 w-5" />
          <span className="sr-only">Change language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {i18n.locales.map((locale) => (
          <DropdownMenuItem
            key={locale}
            onClick={() => handleLocaleChange(locale)}
            disabled={currentLocale === locale}
            className="cursor-pointer"
          >
            {languageNames[locale]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
