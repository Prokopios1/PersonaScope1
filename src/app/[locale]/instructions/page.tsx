import Link from 'next/link';
import { getDictionary } from '@/lib/getDictionary';
import type { Locale } from '@/i18n-config';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ListChecks, Clock } from 'lucide-react';

export default async function InstructionsPage({ params: { locale } }: { params: { locale: Locale } }) {
  const dictionary = await getDictionary(locale);
  const t = dictionary.InstructionsPage;

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Card className="w-full max-w-2xl shadow-lg">
        <CardHeader className="text-center">
          <ListChecks className="h-12 w-12 mx-auto mb-4 text-primary" />
          <CardTitle className="text-3xl font-bold">{t.title}</CardTitle>
          <CardDescription className="text-muted-foreground pt-2 flex items-center justify-center gap-2">
            <Clock className="h-5 w-5" /> {t.duration}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 text-foreground/80">
          <p className="leading-relaxed">{t.instructions}</p>
          <div>
            <h3 className="font-semibold text-foreground mb-2">{t.likertScale}</h3>
            <ul className="list-disc list-inside space-y-1 pl-4 bg-muted/50 p-4 rounded-md">
              <li><strong>1:</strong> {t.scale['1']}</li>
              <li><strong>2:</strong> {t.scale['2']}</li>
              <li><strong>3:</strong> {t.scale['3']}</li>
              <li><strong>4:</strong> {t.scale['4']}</li>
              <li><strong>5:</strong> {t.scale['5']}</li>
            </ul>
          </div>
        </CardContent>
        <CardFooter>
          <Button asChild className="w-full text-lg py-6">
            <Link href={`/${locale}/questionnaire`}>{t.beginTest}</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
