
'use client';

import { useEffect, useState, useRef, use } from 'react'; // Import use
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import TraitScoreDisplay from '@/components/TraitScoreDisplay';
import { getScoreLevel, TRAITS, type TraitKey } from '@/constants/ipip';
import { Download, BarChart3, UserCircle, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { type Dictionary } from '@/lib/getDictionary';
import type { Locale } from '@/i18n-config';
import { sendResultsToAdmin } from '@/app/actions'; // Server Action

// For client-side PDF generation
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Simplified getDictionary for client components
async function getClientDictionary(locale: Locale): Promise<Dictionary> {
  const mod = await import(`@/messages/${locale}.json`);
  return mod.default;
}

// Props for a page component where params is a dynamic segment
// Next.js 15 passes `params` as a Promise to page components.
export default function ResultsPage(props: { params: Promise<{ locale: Locale }> }) {
  const { locale } = use(props.params); // Unwrap the promise to get the actual params object

  const [email, setEmail] = useState<string | null>(null);
  const [results, setResults] = useState<Record<TraitKey, number> | null>(null);
  const router = useRouter();
  const { toast } = useToast();
  const [dictionary, setDictionary] = useState<Dictionary | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMounted(true);
    getClientDictionary(locale).then(setDictionary);

    const storedEmail = localStorage.getItem('userEmail');
    const storedResults = localStorage.getItem('assessmentResults');

    if (storedEmail && storedResults) {
      setEmail(storedEmail);
      setResults(JSON.parse(storedResults));
    } else {
      // Redirect if data is missing, perhaps to the start
      router.push(`/${locale}`);
    }
  }, [locale, router]);

  useEffect(() => {
    if (email && results && dictionary) {
      // Call server action to send results to admin
      sendResultsToAdmin({ email, scores: results, locale })
        .then(() => {
          toast({
            title: dictionary.ResultsPage.resultsSent,
            description: `Data for ${email} recorded.`,
            variant: "default",
            action: <CheckCircle className="text-green-500" />,
          });
        })
        .catch(_ => {
           toast({
            title: dictionary.ResultsPage.resultsSentError,
            variant: "destructive",
            action: <AlertCircle className="text-red-500" />,
          });
        });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email, results, locale, dictionary, toast]);


  const handleDownloadPdf = async () => {
    if (!resultsRef.current || !email || !dictionary) return;
    setIsGeneratingPdf(true);
    toast({ title: dictionary.ResultsPage.pdfGenerating || "Generating PDF..." });

    try {
      // Ensure the hidden email div is visible for PDF capture
      const pdfCaptureEmailDiv = resultsRef.current.querySelector('[data-pdf-capture="true"]') as HTMLElement | null;
      if (pdfCaptureEmailDiv) {
        pdfCaptureEmailDiv.style.display = 'block';
      }

      const canvas = await html2canvas(resultsRef.current, { scale: 2 });
      
      // Hide the div again after capture
      if (pdfCaptureEmailDiv) {
        pdfCaptureEmailDiv.style.display = 'none';
      }

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 10; 
      
      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
      pdf.save(`PersonaScope_Results_${email.split('@')[0]}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({ title: dictionary.Common.error || "Error", description: "Could not generate PDF.", variant: "destructive" });
    } finally {
      setIsGeneratingPdf(false);
    }
  };
  

  if (!isMounted || !dictionary || !results || !email) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
         <Card className="w-full max-w-2xl shadow-lg p-8 text-center">
            <BarChart3 className="h-12 w-12 mx-auto mb-4 text-primary animate-pulse" />
            <CardTitle className="text-3xl font-bold mb-2">{dictionary?.Common.loading || 'Loading...'}</CardTitle>
         </Card>
      </div>
    );
  }
  
  const t = dictionary.ResultsPage;
  const traitDescriptions = dictionary.ResultsPage.traitDescriptions;

  return (
    <div className="flex flex-col items-center justify-center py-8">
      <Card className="w-full max-w-3xl shadow-xl" id="results-content-wrapper">
        <CardHeader className="text-center">
          <BarChart3 className="h-12 w-12 mx-auto mb-4 text-primary" />
          <CardTitle className="text-3xl font-bold">{t.title}</CardTitle>
          <CardDescription className="text-muted-foreground pt-2 flex items-center justify-center gap-2">
            <UserCircle className="h-5 w-5" /> {t.userEmail.replace('{email}', email)}
          </CardDescription>
        </CardHeader>
        {/* This div is for PDF capture content */}
        <div ref={resultsRef} className="p-6">
            {/* This div is specifically for including email at the top of the PDF */}
            {/* It's hidden by default on screen, but made visible for PDF capture */}
            <div className="hidden text-center mb-4 border-b pb-2" data-pdf-capture="true">
                <h2 className="text-lg font-semibold">{t.title}</h2>
                <p className="text-sm text-muted-foreground">{t.userEmail.replace('{email}', email)}</p>
            </div>
            <CardContent className="space-y-6 pt-0"> 
            {TRAITS.map((traitKey) => {
                const score = results[traitKey];
                const level = getScoreLevel(score);
                const description = traitDescriptions[traitKey][level];
                return (
                <TraitScoreDisplay
                    key={traitKey}
                    traitKey={traitKey}
                    traitName={t[traitKey as keyof typeof t]}
                    score={score}
                    description={description}
                />
                );
            })}
            </CardContent>
        </div>
        <CardFooter>
          <Button 
            onClick={handleDownloadPdf} 
            disabled={isGeneratingPdf}
            className="w-full text-lg py-6 bg-accent hover:bg-accent/90"
          >
            <Download className="mr-2 h-5 w-5" />
            {isGeneratingPdf ? (dictionary.Common.loading || 'Loading...') : t.downloadPdf}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
