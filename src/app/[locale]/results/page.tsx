
'use client';

import { useEffect, useState, useRef, use } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import TraitScoreDisplay from '@/components/TraitScoreDisplay';
import { getScoreLevel, TRAITS, type TraitKey, rawToPercentile, MIN_RAW_SCORE_PER_TRAIT, MAX_RAW_SCORE_PER_TRAIT } from '@/constants/ipip';
import { Download, BarChart3, UserCircle, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { type Dictionary } from '@/lib/getDictionary';
import type { Locale } from '@/i18n-config';
import { sendResultsToAdmin } from '@/app/actions'; 

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

async function getClientDictionary(locale: Locale): Promise<Dictionary> {
  // Use conditional imports to help the bundler resolve the files.
  if (locale === 'el') {
    return import('@/messages/el.json').then(module => module.default);
  }
  // Fallback to English
  return import('@/messages/en.json').then(module => module.default);
}

export default function ResultsPage(props: { params: Promise<{ locale: Locale }> }) {
  const { locale } = use(props.params); 

  const [name, setName] = useState<string | null>(null);
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

    const storedName = localStorage.getItem('userName');
    const storedResults = localStorage.getItem('assessmentResults');

    if (storedName && storedResults) {
      setName(storedName);
      setResults(JSON.parse(storedResults));
    } else {
      router.push(`/${locale}`);
    }
  }, [locale, router]);

  useEffect(() => {
    if (name && results && dictionary) {
      sendResultsToAdmin({ name, scores: results, locale })
        .then((response) => {
          toast({
            title: response.success ? (dictionary.ResultsPage.resultsSentTitle || "Success") : (dictionary.ResultsPage.resultsSentErrorTitle || "Error"),
            description: response.message, 
            variant: response.success ? "default" : "destructive",
            action: response.success ? <CheckCircle className="text-green-500" /> : <AlertCircle className="text-red-500" />,
          });
        })
        .catch((error) => { 
           toast({
            title: dictionary.ResultsPage.resultsSentErrorTitle || "Error",
            description: error.message || dictionary.Common.error || "An unexpected error occurred.",
            variant: "destructive",
            action: <AlertCircle className="text-red-500" />,
          });
        });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, results, locale, dictionary, toast]);


  const handleDownloadPdf = async () => {
    if (!resultsRef.current || !name || !dictionary) return;
    setIsGeneratingPdf(true);
    toast({ title: dictionary.ResultsPage.pdfGenerating || "Generating PDF..." });

    try {
      const pdfCaptureNameDiv = resultsRef.current.querySelector('[data-pdf-capture="true"]') as HTMLElement | null;
      if (pdfCaptureNameDiv) {
        pdfCaptureNameDiv.style.display = 'block';
      }

      const canvas = await html2canvas(resultsRef.current, { 
        scale: 4,
        logging: false, 
        useCORS: true, 
        windowWidth: resultsRef.current.scrollWidth,
        windowHeight: resultsRef.current.scrollHeight,
      });
      
      if (pdfCaptureNameDiv) {
        pdfCaptureNameDiv.style.display = 'none';
      }

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      
      const margin = 5; 
      const contentWidth = pdfWidth - (margin * 2);
      const contentHeight = pdfHeight - (margin * 2);

      const ratio = Math.min(contentWidth / imgWidth, contentHeight / imgHeight);
      
      const finalImgWidth = imgWidth * ratio;
      const finalImgHeight = imgHeight * ratio;

      const imgX = (pdfWidth - finalImgWidth) / 2;
      const imgY = margin; 
      
      pdf.addImage(imgData, 'PNG', imgX, imgY, finalImgWidth, finalImgHeight);
      const sanitizedName = name.replace(/\s+/g, '_');
      pdf.save(`PersonaScope_Mini-IPIP_Results_${sanitizedName}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({ title: dictionary.Common.error || "Error", description: "Could not generate PDF.", variant: "destructive" });
    } finally {
      setIsGeneratingPdf(false);
    }
  };
  

  if (!isMounted || !dictionary || !results || !name) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
         <Card className="w-full max-w-2xl shadow-lg p-8 text-center">
            <BarChart3 className="h-12 w-12 mx-auto mb-4 text-primary animate-pulse" />
            <CardTitle className="text-3xl font-bold mb-2">{dictionary?.Common.loading || 'Loading...'}</CardTitle>
         </Card>
      </div>
    );
  }
  
  const tResults = dictionary.ResultsPage;

  return (
    <div className="flex flex-col items-center justify-center py-8">
      <Card className="w-full max-w-5xl shadow-xl" id="results-content-wrapper">
        <CardHeader className="text-center">
          <BarChart3 className="h-12 w-12 mx-auto mb-4 text-primary" />
          <CardTitle className="text-3xl font-bold">{tResults.title}</CardTitle>
          <CardDescription className="text-muted-foreground pt-2 flex items-center justify-center gap-2">
            <UserCircle className="h-5 w-5" /> {tResults.userNameReport.replace('{name}', name)}
          </CardDescription>
        </CardHeader>
        <div ref={resultsRef} className="p-6">
            <div className="hidden text-center mb-4 border-b pb-2" data-pdf-capture="true">
                <h2 className="text-lg font-semibold">{tResults.title}</h2>
                <p className="text-sm text-muted-foreground">{tResults.userNameReport.replace('{name}', name)}</p>
            </div>
            <CardContent className="space-y-8 pt-0"> 
            {TRAITS.map((traitKey) => {
                const rawScore = results[traitKey];
                const percentileScore = rawToPercentile(rawScore);
                const level = getScoreLevel(rawScore);
                
                const traitData = tResults.traitDescriptions[traitKey];
                
                if (!traitData || !traitData.lowPole || !traitData.highPole || !traitData.userLevelMessages) {
                    console.warn(`Dictionary data missing for trait: ${traitKey}`);
                    return <div key={traitKey}>Error loading data for {traitKey}</div>;
                }

                return (
                <TraitScoreDisplay
                    key={traitKey}
                    traitKey={traitKey}
                    traitName={traitData.traitName}
                    rawScore={rawScore}
                    percentileScore={percentileScore}
                    userLevelDescription={traitData.userLevelMessages[level]}
                    lowPole={traitData.lowPole}
                    highPole={traitData.highPole}
                    dictionary={tResults}
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
            {isGeneratingPdf ? (dictionary.Common.loading || 'Loading...') : tResults.downloadPdf}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
