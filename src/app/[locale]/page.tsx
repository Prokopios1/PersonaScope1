import { getDictionary } from '@/lib/getDictionary';
import type { Locale } from '@/i18n-config';
import EmailForm from '@/components/EmailForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Atom } from 'lucide-react';

export default async function LandingPage({ params: { locale } }: { params: { locale: Locale } }) {
  const dictionary = await getDictionary(locale);
  const t = dictionary.LandingPage;

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] py-12">
      <Card className="w-full max-w-2xl shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <Atom size={48} className="text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold">{t.title}</CardTitle>
          <CardDescription className="text-muted-foreground pt-2">{dictionary.PersonaScope.tagline}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-foreground/80 leading-relaxed mb-8 whitespace-pre-line text-justify">
            {t.explanation}
          </p>
          <EmailForm dictionary={t} locale={locale} />
        </CardContent>
      </Card>
    </div>
  );
}
