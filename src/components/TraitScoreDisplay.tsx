
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Lightbulb, ClipboardCheck, Users, Handshake, Activity, LucideIcon, Info } from 'lucide-react';
import type { TraitKey } from '@/constants/ipip';
import type { Dictionary } from '@/lib/getDictionary';

interface PoleInfo {
  title: string;
  generalDescription: string;
  behavioralExamples: string[];
}

interface TraitScoreDisplayProps {
  traitKey: TraitKey;
  traitName: string;
  rawScore: number; // Keep for progress bar calculation
  percentileScore: number;
  userLevelDescription: string;
  lowPole: PoleInfo;
  highPole: PoleInfo;
  dictionary: Dictionary['ResultsPage']; // For "Behavioral Examples" title etc.
}

const traitIcons: Record<TraitKey, LucideIcon> = {
  openness: Lightbulb,
  conscientiousness: ClipboardCheck,
  extraversion: Users,
  agreeableness: Handshake,
  neuroticism: Activity,
};

// Constants for score range (from ipip.ts, duplicated here for simplicity or could be imported)
const MIN_RAW_SCORE_PER_TRAIT = 4;
const MAX_RAW_SCORE_PER_TRAIT = 20;
const RAW_SCORE_RANGE = MAX_RAW_SCORE_PER_TRAIT - MIN_RAW_SCORE_PER_TRAIT;

export default function TraitScoreDisplay({
  traitKey,
  traitName,
  rawScore,
  percentileScore,
  userLevelDescription,
  lowPole,
  highPole,
  dictionary
}: TraitScoreDisplayProps) {
  const IconComponent = traitIcons[traitKey];
  const progressPercentage = RAW_SCORE_RANGE > 0 ? ((rawScore - MIN_RAW_SCORE_PER_TRAIT) / RAW_SCORE_RANGE) * 100 : 0;

  const PoleDisplay = ({ pole, isUserLevel }: { pole: PoleInfo; isUserLevel?: boolean }) => (
    <div className={`mt-3 rounded-md p-3 ${isUserLevel ? 'bg-muted/70 border border-primary/50' : 'bg-muted/30'}`}>
      <h4 className="text-md font-semibold text-foreground/90">{pole.title}</h4>
      <p className="text-sm text-muted-foreground mt-1 mb-2 leading-relaxed">{pole.generalDescription}</p>
      <h5 className="text-sm font-medium text-foreground/80 mt-2">{dictionary.behavioralExamplesTitle}</h5>
      <ul className="list-disc list-inside pl-4 space-y-1 text-xs text-muted-foreground mt-1">
        {pole.behavioralExamples.map((example, index) => (
          <li key={index}>{example}</li>
        ))}
      </ul>
    </div>
  );

  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow w-full">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-xl font-semibold">{traitName}</CardTitle>
          <CardDescription className="text-primary font-medium pt-1">
            {dictionary.percentileScoreLabel.replace('{percentileValue}', percentileScore.toString())}
          </CardDescription>
        </div>
        <IconComponent className="h-7 w-7 text-accent flex-shrink-0" />
      </CardHeader>
      <CardContent>
        <Progress value={progressPercentage} className="w-full mt-1 h-2.5" />
        
        <div className="mt-4 p-3 bg-accent/10 rounded-md border border-accent/30">
            <p className="text-sm font-medium text-accent-foreground flex items-start">
                <Info size={18} className="mr-2 mt-0.5 flex-shrink-0 text-accent" />
                <span><strong className="text-accent">{dictionary.userLevelIntro}</strong> {userLevelDescription}</span>
            </p>
        </div>

        <Separator className="my-4" />
        
        <h3 className="text-lg font-semibold text-foreground mb-2">Understanding the Trait Poles:</h3>
        
        <PoleDisplay pole={lowPole} />
        <PoleDisplay pole={highPole} />

      </CardContent>
    </Card>
  );
}
