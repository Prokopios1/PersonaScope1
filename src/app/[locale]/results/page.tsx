
'use client';

import { useEffect, useState, useRef, use } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import TraitScoreDisplay from '@/components/TraitScoreDisplay';
import { getScoreLevel, TRAITS, type TraitKey } from '@/constants/ipip';
import { Download, BarChart3, UserCircle, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { type Dictionary } from '@/lib/getDictionary';
import type { Locale } from '@/i18n-config';
import { sendResultsToAdmin } from '@/app/actions'; 

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

async function getClientDictionary(locale: Locale): Promise<Dictionary> {
  const mod = await import(`@/messages/${locale}.json`);
  return mod.default;
}

export default function ResultsPage(props: { params: Promise<{ locale: Locale }> }) {
  const { locale } = use(props.params); 

  const [name, setName] = useState<string | null>(null); // Changed from email to name
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

    const storedName = localStorage.getItem('userName'); // Changed from userEmail to userName
    const storedResults = localStorage.getItem('assessmentResults');

    if (storedName && storedResults) {
      setName(storedName); // Changed from setEmail to setName
      setResults(JSON.parse(storedResults));
    } else {
      router.push(`/${locale}`);
    }
  }, [locale, router]);

  useEffect(() => {
    if (name && results && dictionary) { // Changed from email to name
      sendResultsToAdmin({ name, scores: results, locale }) // Changed from email to name
        .then(() => {
          toast({
            title: dictionary.ResultsPage.resultsSent.replace('{name}', name),
            description: `Data for ${name} recorded.`, 
            variant: "default",
            action: <CheckCircle className="text-green-500" />,
          });
        })
        .catch(_ => {
           toast({
            title: dictionary.ResultsPage.resultsSentError.replace('{name}', name),
            variant: "destructive",
            action: <AlertCircle className="text-red-500" />,
          });
        });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, results, locale, dictionary, toast]); // Changed email to name in dependencies


  const handleDownloadPdf = async () => {
    if (!resultsRef.current || !name || !dictionary) return; // Changed from email to name
    setIsGeneratingPdf(true);
    toast({ title: dictionary.ResultsPage.pdfGenerating || "Generating PDF..." });

    try {
      const pdfCaptureNameDiv = resultsRef.current.querySelector('[data-pdf-capture="true"]') as HTMLElement | null;
      if (pdfCaptureNameDiv) {
        pdfCaptureNameDiv.style.display = 'block';
      }

      const canvas = await html2canvas(resultsRef.current, { scale: 2 });
      
      if (pdfCaptureNameDiv) {
        pdfCaptureNameDiv.style.display = 'none';
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
      const sanitizedName = name.replace(/\s+/g, '_');
      pdf.save(`PersonaScope_Mini-IPIP_Results_${sanitizedName}.pdf`); // Updated filename
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({ title: dictionary.Common.error || "Error", description: "Could not generate PDF.", variant: "destructive" });
    } finally {
      setIsGeneratingPdf(false);
    }
  };
  

  if (!isMounted || !dictionary || !results || !name) { // Changed from email to name
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
          <CardTitle className="text-3xl font-bold">{t.title}</CardTitle> {/* Title updated via dictionary */}
          <CardDescription className="text-muted-foreground pt-2 flex items-center justify-center gap-2">
            <UserCircle className="h-5 w-5" /> {t.userNameReport.replace('{name}', name)} {/* Updated to use userNameReport and name */}
          </CardDescription>
        </CardHeader>
        <div ref={resultsRef} className="p-6">
            <div className="hidden text-center mb-4 border-b pb-2" data-pdf-capture="true">
                <h2 className="text-lg font-semibold">{t.title}</h2>
                <p className="text-sm text-muted-foreground">{t.userNameReport.replace('{name}', name)}</p>
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
                    traitName={t[traitKey as keyof typeof t]} // Trait names like "Openness", "Conscientiousness" etc.
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
