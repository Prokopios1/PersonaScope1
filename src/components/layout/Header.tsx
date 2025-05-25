import Link from 'next/link';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import type { Locale } from '@/i18n-config';
import type { Dictionary } from '@/lib/getDictionary';
import { Atom } from 'lucide-react';

interface HeaderProps {
  locale: Locale;
  dictionary: Dictionary['PersonaScope'];
}

export default function Header({ locale, dictionary }: HeaderProps) {
  return (
    <header className="bg-card border-b border-border shadow-sm">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href={`/${locale}`} className="flex items-center gap-2 text-2xl font-bold text-primary hover:opacity-80 transition-opacity">
          <Atom className="h-8 w-8" />
          <h1>{dictionary.appName}</h1>
        </Link>
        <LanguageSwitcher currentLocale={locale} />
      </div>
    </header>
  );
}
