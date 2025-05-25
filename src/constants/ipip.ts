export type TraitKey = 'openness' | 'conscientiousness' | 'extraversion' | 'agreeableness' | 'neuroticism';

export interface IPIPQuestion {
  id: number;
  trait: TraitKey;
  isReverseScored: boolean;
}

export const IPIP_QUESTIONS_SCORING_KEY: IPIPQuestion[] = [
  // Extraversion
  { id: 1, trait: 'extraversion', isReverseScored: false },
  { id: 6, trait: 'extraversion', isReverseScored: true },
  { id: 11, trait: 'extraversion', isReverseScored: false },
  { id: 16, trait: 'extraversion', isReverseScored: true },
  // Agreeableness
  { id: 2, trait: 'agreeableness', isReverseScored: false },
  { id: 7, trait: 'agreeableness', isReverseScored: true },
  { id: 12, trait: 'agreeableness', isReverseScored: true },
  { id: 17, trait: 'agreeableness', isReverseScored: false }, // Corrected from example: standard scoring is item text based. Some sources differ slightly, using most common.
  // Conscientiousness
  { id: 3, trait: 'conscientiousness', isReverseScored: false },
  { id: 8, trait: 'conscientiousness', isReverseScored: true },
  { id: 13, trait: 'conscientiousness', isReverseScored: false },
  { id: 18, trait: 'conscientiousness', isReverseScored: true },
  // Neuroticism
  { id: 4, trait: 'neuroticism', isReverseScored: false },
  { id: 9, trait: 'neuroticism', isReverseScored: true },
  { id: 14, trait: 'neuroticism', isReverseScored: false },
  { id: 19, trait: 'neuroticism', isReverseScored: true },
  // Openness
  { id: 5, trait: 'openness', isReverseScored: false },
  { id: 10, trait: 'openness', isReverseScored: true },
  { id: 15, trait: 'openness', isReverseScored: false },
  { id: 20, trait: 'openness', isReverseScored: true },
];

export const TRAITS: TraitKey[] = ['openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism'];

export interface ScoreInterpretation {
  level: 'low' | 'medium' | 'high';
  descriptionKey: string; // Key to look up in dictionary
}

// Max score per item is 5. Min is 1. Total 4 items per trait.
// Trait score range: 4 (4*1) to 20 (4*5).
// Low: 4-9, Medium: 10-15, High: 16-20
export function getScoreLevel(score: number): 'low' | 'medium' | 'high' {
  if (score <= 9) return 'low';
  if (score <= 15) return 'medium';
  return 'high';
}

export const LIKERT_SCALE_SIZE = 5;
