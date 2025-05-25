'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { IPIP_QUESTIONS_SCORING_KEY, LIKERT_SCALE_SIZE, type TraitKey } from '@/constants/ipip';
import type { Locale } from '@/i18n-config';
// We need a way to get the dictionary client-side or pass it. For simplicity, we'll fetch it.
// In a real app, this might be passed via context or props if generated server-side.
import { type Dictionary } from '@/lib/getDictionary'; 
import { ChevronLeft, ChevronRight, HelpCircle } from 'lucide-react';


// Simplified getDictionary for client components (not recommended for RSC pattern, but for brevity here)
async function getClientDictionary(locale: Locale): Promise<Dictionary> {
  const mod = await import(`@/messages/${locale}.json`);
  return mod.default;
}


export default function QuestionnairePage({ params: { locale } }: { params: { locale: Locale } }) {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const router = useRouter();
  const [dictionary, setDictionary] = useState<Dictionary | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    getClientDictionary(locale).then(setDictionary);
  }, [locale]);

  const questionsContent = dictionary?.traitQuestionnaireItems || [];
  const totalQuestions = questionsContent.length;

  const handleAnswerChange = (questionId: number, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: parseInt(value, 10) }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = () => {
    // Basic check: ensure all questions are answered (optional, can be stricter)
    // if (Object.keys(answers).length !== totalQuestions) {
    //   alert(dictionary?.Common.error || "Please answer all questions.");
    //   return;
    // }

    const scores: Record<TraitKey, number> = {
      openness: 0,
      conscientiousness: 0,
      extraversion: 0,
      agreeableness: 0,
      neuroticism: 0,
    };

    IPIP_QUESTIONS_SCORING_KEY.forEach((q) => {
      let answerValue = answers[q.id];
      if (answerValue === undefined && q.id <= totalQuestions) { // Default to neutral if not answered (3)
        answerValue = Math.ceil(LIKERT_SCALE_SIZE / 2);
      } else if (answerValue === undefined) {
        return; // Skip if question ID is out of bounds of current content
      }
      
      const scoredValue = q.isReverseScored ? (LIKERT_SCALE_SIZE + 1) - answerValue : answerValue;
      scores[q.trait] += scoredValue;
    });
    
    if (isMounted) {
      localStorage.setItem('assessmentResults', JSON.stringify(scores));
    }
    router.push(`/${locale}/results`);
  };

  if (!isMounted || !dictionary) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
         <Card className="w-full max-w-2xl shadow-lg p-8 text-center">
            <HelpCircle className="h-12 w-12 mx-auto mb-4 text-primary animate-pulse" />
            <CardTitle className="text-3xl font-bold mb-2">{dictionary?.Common.loading || 'Loading...'}</CardTitle>
            <Progress value={0} className="w-full mt-4" />
         </Card>
      </div>
    );
  }
  
  const t = dictionary.QuestionnairePage;
  const tInstructions = dictionary.InstructionsPage;
  const currentQuestion = questionsContent[currentQuestionIndex];
  const progressValue = totalQuestions > 0 ? ((currentQuestionIndex + 1) / totalQuestions) * 100 : 0;

  return (
    <div className="flex flex-col items-center justify-center py-8">
      <Card className="w-full max-w-2xl shadow-xl">
        <CardHeader className="text-center">
          <HelpCircle className="h-12 w-12 mx-auto mb-4 text-primary" />
          <CardTitle className="text-3xl font-bold">{t.title}</CardTitle>
          <CardDescription className="text-muted-foreground pt-2">
            {t.questionProgress.replace('{current}', (currentQuestionIndex + 1).toString()).replace('{total}', totalQuestions.toString())}
          </CardDescription>
          <Progress value={progressValue} className="w-full mt-4" />
        </CardHeader>
        <CardContent className="min-h-[250px]">
          {currentQuestion && (
            <div key={currentQuestion.id} className="space-y-6">
              <p className="text-xl font-medium text-center text-foreground">
                {currentQuestion.text}
              </p>
              <RadioGroup
                value={answers[currentQuestion.id]?.toString()}
                onValueChange={(value) => handleAnswerChange(currentQuestion.id, value)}
                className="grid grid-cols-1 sm:grid-cols-5 gap-4 pt-4"
              >
                {[1, 2, 3, 4, 5].map((value) => (
                  <div key={value} className="flex flex-col items-center space-y-2">
                    <RadioGroupItem value={value.toString()} id={`q${currentQuestion.id}-v${value}`} className="h-6 w-6"/>
                    <Label htmlFor={`q${currentQuestion.id}-v${value}`} className="text-xs text-center text-muted-foreground">
                      {tInstructions.scale[value.toString() as keyof typeof tInstructions.scale]}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between items-center pt-6">
          <Button onClick={handlePrevious} disabled={currentQuestionIndex === 0} variant="outline">
            <ChevronLeft className="mr-2 h-4 w-4" /> Previous
          </Button>
          {currentQuestionIndex < totalQuestions - 1 ? (
            <Button onClick={handleNext} disabled={answers[currentQuestion.id] === undefined}>
              Next <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={answers[currentQuestion.id] === undefined} className="bg-accent hover:bg-accent/90">
              {t.submit}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
