
'use client';

import { useState, useEffect, use } from 'react'; // Added 'use'
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { IPIP_QUESTIONS_SCORING_KEY, LIKERT_SCALE_SIZE, type TraitKey } from '@/constants/ipip';
import type { Locale } from '@/i18n-config';
import { type Dictionary } from '@/lib/getDictionary'; 
import { ChevronLeft, ChevronRight, HelpCircle } from 'lucide-react';

async function getClientDictionary(locale: Locale): Promise<Dictionary> {
  const mod = await import(`@/messages/${locale}.json`);
  return mod.default;
}

const QUESTIONS_PER_PAGE = 10;

// Updated props type
export default function QuestionnairePage(props: { params: Promise<{ locale: Locale }> }) {
  const { locale } = use(props.params); // Unwrap params

  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [currentPage, setCurrentPage] = useState(0);
  const router = useRouter();
  const [dictionary, setDictionary] = useState<Dictionary | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    getClientDictionary(locale).then(setDictionary);
  }, [locale]);

  const questionsContent = dictionary?.traitQuestionnaireItems || [];
  const totalQuestions = questionsContent.length;
  const totalPages = Math.ceil(totalQuestions / QUESTIONS_PER_PAGE);

  const startIndex = currentPage * QUESTIONS_PER_PAGE;
  const endIndex = Math.min(startIndex + QUESTIONS_PER_PAGE, totalQuestions);
  const currentQuestionsBatch = questionsContent.slice(startIndex, endIndex);

  const handleAnswerChange = (questionId: number, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: parseInt(value, 10) }));
  };

  const areAllQuestionsOnPageAnswered = () => {
    if (!currentQuestionsBatch || currentQuestionsBatch.length === 0) return true; // No questions, so all "answered"
    return currentQuestionsBatch.every(q => answers[q.id] !== undefined);
  };

  const handleNext = () => {
    if (areAllQuestionsOnPageAnswered() && currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
      window.scrollTo(0, 0); 
    }
  };

  const handlePrevious = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
      window.scrollTo(0, 0);
    }
  };

  const handleSubmit = () => {
    if (!areAllQuestionsOnPageAnswered()) {
      alert(dictionary?.Common.errorAllFieldsRequired || "Please answer all questions on this page.");
      return;
    }

    const allPresentedQuestionIds = questionsContent.map(q => q.id);
    const allAnswered = allPresentedQuestionIds.every(id => answers[id] !== undefined);

    if (!allAnswered) {
      alert(dictionary?.Common.errorAllFieldsRequired || "It seems some questions from previous pages were missed. Please ensure all questions are answered.");
      // Potentially find the first unanswered page and navigate there
      // For simplicity, just alerting for now.
      const firstUnansweredPage = questionsContent.reduce((acc, q, index) => {
        if (answers[q.id] === undefined && acc === -1) {
          return Math.floor(index / QUESTIONS_PER_PAGE);
        }
        return acc;
      }, -1);

      if (firstUnansweredPage !== -1 && firstUnansweredPage !== currentPage) {
        setCurrentPage(firstUnansweredPage);
        window.scrollTo(0, 0);
      }
      return;
    }

    const scores: Record<TraitKey, number> = {
      openness: 0,
      conscientiousness: 0,
      extraversion: 0,
      agreeableness: 0,
      neuroticism: 0,
    };

    questionsContent.forEach(displayedQuestion => {
      const scoringInfo = IPIP_QUESTIONS_SCORING_KEY.find(keyItem => keyItem.id === displayedQuestion.id);
      if (!scoringInfo) {
        console.warn(`Scoring key not found for question ID ${displayedQuestion.id}. This question will not be scored.`);
        return;
      }

      const answerValue = answers[displayedQuestion.id];
      // `allAnswered` check ensures answerValue is defined
      const scoredValue = scoringInfo.isReverseScored ? (LIKERT_SCALE_SIZE + 1) - answerValue! : answerValue!;
      scores[scoringInfo.trait] += scoredValue;
    });
    
    if (isMounted) {
      localStorage.setItem('assessmentResults', JSON.stringify(scores));
    }
    router.push(`/${locale}/results`);
  };

  if (!isMounted || !dictionary || questionsContent.length === 0) {
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
  const tCommon = dictionary.Common;
  
  const answeredQuestionsCount = Object.keys(answers).length;
  const progressValue = totalQuestions > 0 ? (answeredQuestionsCount / totalQuestions) * 100 : 0;

  return (
    <div className="flex flex-col items-center justify-center py-8">
      <Card className="w-full max-w-2xl shadow-xl">
        <CardHeader className="text-center">
          <HelpCircle className="h-12 w-12 mx-auto mb-4 text-primary" />
          <CardTitle className="text-3xl font-bold">{t.title}</CardTitle>
          {totalQuestions > 0 && (
            <CardDescription className="text-muted-foreground pt-2">
              {t.questionRange
                .replace('{start}', (startIndex + 1).toString())
                .replace('{end}', endIndex.toString())
                .replace('{total}', totalQuestions.toString())
              }
            </CardDescription>
          )}
          <Progress value={progressValue} className="w-full mt-4" />
        </CardHeader>
        <CardContent className="min-h-[500px] space-y-8">
          {currentQuestionsBatch.map((question) => (
            <div key={question.id} className="space-y-4 border-b border-border pb-6 last:border-b-0 last:pb-0">
              <p className="text-lg font-medium text-left text-foreground">
                {question.text}
              </p>
              <RadioGroup
                value={answers[question.id]?.toString()}
                onValueChange={(value) => handleAnswerChange(question.id, value)}
                className="grid grid-cols-1 sm:grid-cols-5 gap-x-4 gap-y-2 pt-2"
              >
                {[1, 2, 3, 4, 5].map((value) => (
                  <div key={value} className="flex flex-col items-center space-y-1">
                    <RadioGroupItem value={value.toString()} id={`q${question.id}-v${value}`} className="h-5 w-5"/>
                    <Label htmlFor={`q${question.id}-v${value}`} className="text-xs text-center text-muted-foreground px-1">
                      {tInstructions.scale[value.toString() as keyof typeof tInstructions.scale]}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          ))}
        </CardContent>
        <CardFooter className="flex justify-between items-center pt-6">
          <Button onClick={handlePrevious} disabled={currentPage === 0} variant="outline">
            <ChevronLeft className="mr-2 h-4 w-4" /> {tCommon.previous}
          </Button>
          {currentPage < totalPages - 1 ? (
            <Button onClick={handleNext} disabled={!areAllQuestionsOnPageAnswered()}>
              {tCommon.next} <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={!areAllQuestionsOnPageAnswered()} className="bg-accent hover:bg-accent/90">
              {t.submit}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
