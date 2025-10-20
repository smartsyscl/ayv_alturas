'use server';

/**
 * @fileOverview This file defines a Genkit flow for suggesting relevant pricing parameters based on a service description.
 *
 * The flow takes a service description as input and returns a list of suggested parameters.
 * - suggestParametersFromDescription - The main function that triggers the flow.
 * - SuggestParametersFromDescriptionInput - The input type for the suggestParametersFromDescription function.
 * - SuggestParametersFromDescriptionOutput - The return type for the suggestParametersFromDescription function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestParametersFromDescriptionInputSchema = z.object({
  description: z
    .string()
    .describe('A detailed description of the service offered.'),
});
export type SuggestParametersFromDescriptionInput = z.infer<
  typeof SuggestParametersFromDescriptionInputSchema
>;

const SuggestParametersFromDescriptionOutputSchema = z.object({
  suggestedParameters: z
    .array(z.string())
    .describe(
      'A list of parameters that would be relevant for pricing this service.'
    ),
});
export type SuggestParametersFromDescriptionOutput = z.infer<
  typeof SuggestParametersFromDescriptionOutputSchema
>;

export async function suggestParametersFromDescription(
  input: SuggestParametersFromDescriptionInput
): Promise<SuggestParametersFromDescriptionOutput> {
  return suggestParametersFromDescriptionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestParametersFromDescriptionPrompt',
  input: {schema: SuggestParametersFromDescriptionInputSchema},
  output: {schema: SuggestParametersFromDescriptionOutputSchema},
  prompt: `You are an expert in service pricing.
  Given the following service description, suggest a list of parameters that would be relevant for pricing this service.
  The parameters should be specific and measurable.

  Description: {{{description}}}

  Parameters:`, // Removed 'Consider parameters such as' as it overly constrained the model.
});

const suggestParametersFromDescriptionFlow = ai.defineFlow(
  {
    name: 'suggestParametersFromDescriptionFlow',
    inputSchema: SuggestParametersFromDescriptionInputSchema,
    outputSchema: SuggestParametersFromDescriptionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
