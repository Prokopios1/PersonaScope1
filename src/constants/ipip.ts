
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
  { id: 17, trait: 'agreeableness', isReverseScored: false },
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

// Score interpretation based on raw scores (4-20 range)
// Low: 4-9, Medium: 10-15, High: 16-20
export function getScoreLevel(score: number): 'low' | 'medium' | 'high' {
  if (score <= 9) return 'low';
  if (score <= 15) return 'medium';
  return 'high';
}

export const LIKERT_SCALE_SIZE = 5;

export const MIN_RAW_SCORE_PER_TRAIT = 4; // 4 items * 1 point
export const MAX_RAW_SCORE_PER_TRAIT = 20; // 4 items * 5 points
const RAW_SCORE_RANGE = MAX_RAW_SCORE_PER_TRAIT - MIN_RAW_SCORE_PER_TRAIT; // 16

export function rawToPercentile(rawScore: number): number {
  let score = rawScore;
  if (score < MIN_RAW_SCORE_PER_TRAIT) score = MIN_RAW_SCORE_PER_TRAIT;
  if (score > MAX_RAW_SCORE_PER_TRAIT) score = MAX_RAW_SCORE_PER_TRAIT;
  const percentile = ((score - MIN_RAW_SCORE_PER_TRAIT) / RAW_SCORE_RANGE) * 99 + 1;
  return Math.round(percentile);
}
