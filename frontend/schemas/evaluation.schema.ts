// schemas/evaluation.schema.ts
import { z } from 'zod';

// Schema for a single criterion score input
export const criterionScoreSchema = z.object({
  criterionId: z.string(),
  score: z.number().min(0).max(100, 'Score must be between 0 and 100'),
  comment: z.string().min(1, 'Comment is required'),
});

// Schema for technical evaluation
export const technicalEvaluationSchema = z.object({
  scores: z.array(criterionScoreSchema),
});

// Schema for financial evaluation
export const financialEvaluationSchema = z.object({
  scores: z.array(criterionScoreSchema),
});

// Schema for submitting the complete evaluation
export const evaluationSubmitSchema = z.object({
  technical: technicalEvaluationSchema,
  financial: financialEvaluationSchema,
  bidderId: z.string(),
  tenderId: z.string(),
});

// Export TypeScript types from the schemas
export type CriterionScoreInput = z.infer<typeof criterionScoreSchema>;
export type EvaluationSubmitInput = z.infer<typeof evaluationSubmitSchema>;