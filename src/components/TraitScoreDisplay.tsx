'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Lightbulb, ClipboardCheck, Users, Handshake, Activity, LucideIcon } from 'lucide-react';
import type { TraitKey } from '@/constants/ipip';

interface TraitScoreDisplayProps {
  traitKey: TraitKey;
  traitName: string;
  score: number;
  maxScore?: number;
  description: string;
}

const traitIcons: Record<TraitKey, LucideIcon> = {
  openness: Lightbulb,
  conscientiousness: ClipboardCheck,
  extraversion: Users,
  agreeableness: Handshake,
  neuroticism: Activity,
};

export default function TraitScoreDisplay({ traitKey, traitName, score, maxScore = 20, description }: TraitScoreDisplayProps) {
  const IconComponent = traitIcons[traitKey];
  const percentage = (score / maxScore) * 100;

  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-semibold">{traitName}</CardTitle>
        <IconComponent className="h-6 w-6 text-accent" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-primary">{score}/{maxScore}</div>
        <Progress value={percentage} className="w-full mt-2 h-3" />
        <p className="text-sm text-muted-foreground mt-3 leading-relaxed">{description}</p>
      </CardContent>
    </Card>
  );
}
