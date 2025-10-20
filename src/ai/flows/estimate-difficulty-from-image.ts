'use server';
/**
 * @fileOverview Estimates the difficulty of a job based on an uploaded image of the service location.
 *
 * - estimateDifficultyFromImage - A function that handles the image analysis and difficulty estimation process.
 * - EstimateDifficultyFromImageInput - The input type for the estimateDifficultyFromImage function.
 * - EstimateDifficultyFromImageOutput - The return type for the estimateDifficultyFromImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EstimateDifficultyFromImageInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of the service location, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type EstimateDifficultyFromImageInput = z.infer<typeof EstimateDifficultyFromImageInputSchema>;

const EstimateDifficultyFromImageOutputSchema = z.object({
  difficultyEstimate: z
    .string()
    .describe(
      'An estimation of the difficulty of the job, considering factors visible in the image, such as the height, accessibility, and potential obstacles.'
    ),
  priceAdjustmentPercentage: z
    .number()
    .describe(
      'A percentage value (e.g., 0.1 for 10%) indicating the price adjustment based on the estimated difficulty.'
    ),
});
export type EstimateDifficultyFromImageOutput = z.infer<typeof EstimateDifficultyFromImageOutputSchema>;

export async function estimateDifficultyFromImage(
  input: EstimateDifficultyFromImageInput
): Promise<EstimateDifficultyFromImageOutput> {
  return estimateDifficultyFromImageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'estimateDifficultyFromImagePrompt',
  input: {schema: EstimateDifficultyFromImageInputSchema},
  output: {schema: EstimateDifficultyFromImageOutputSchema},
  prompt: `You are an expert estimator for A&V Alturas, a company specializing in vertical services. Given an image of the service location, analyze the image to estimate the difficulty of the job.

Consider factors such as:
- Height of the location
- Accessibility (e.g., are there obstacles?)
- Potential safety hazards

Based on your analysis, provide:
1.  A textual difficulty estimate (e.g., "Relatively easy", "Moderately difficult due to height and limited access", "Very difficult due to significant height and many obstacles").
2.  A price adjustment percentage, reflecting the increased cost due to the difficulty.  This should be a decimal value (e.g., 0.1 for 10%).

Ensure that the output can be parsed as valid JSON.

Image: {{media url=photoDataUri}}
`,
});

const estimateDifficultyFromImageFlow = ai.defineFlow(
  {
    name: 'estimateDifficultyFromImageFlow',
    inputSchema: EstimateDifficultyFromImageInputSchema,
    outputSchema: EstimateDifficultyFromImageOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
