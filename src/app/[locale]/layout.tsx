import type { ReactNode } from 'react';
import { Locale, i18n } from '@/i18n-config';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { getDictionary } from '@/lib/getDictionary';

export async function generateStaticParams() {
  return i18n.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: { locale: Locale };
}) {
  const dictionary = await getDictionary(params.locale);
  return (
    <div className="flex flex-col min-h-screen">
      <Header locale={params.locale} dictionary={dictionary.PersonaScope} />
      <main className="flex-grow container mx-auto px-4 py-8">
        {children}
      </main>
      <Footer dictionary={dictionary.PersonaScope} />
    </div>
  );
}

// Update metadata generation for dynamic title if needed
export async function generateMetadata({ params }: { params: { locale: Locale } }) {
  const dictionary = await getDictionary(params.locale);
  return {
    title: `${dictionary.PersonaScope.appName} - ${dictionary.PersonaScope.tagline}`,
    description: dictionary.LandingPage.explanation.substring(0, 160) + "...",
  };
}
