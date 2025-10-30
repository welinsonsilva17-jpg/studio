'use server';

/**
 * @fileOverview Implements a Genkit flow to suggest DOS commands based on user input.
 *
 * This file exports:
 * - `suggestDosCommands`: A function that takes a partial command as input and returns a list of suggested DOS commands.
 * - `SuggestDosCommandsInput`: The input type for the `suggestDosCommands` function.
 * - `SuggestDosCommandsOutput`: The output type for the `suggestDosCommands` function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestDosCommandsInputSchema = z.object({
  partialCommand: z
    .string()
    .describe('The partial DOS command entered by the user.'),
});
export type SuggestDosCommandsInput = z.infer<typeof SuggestDosCommandsInputSchema>;

const SuggestDosCommandsOutputSchema = z.object({
  suggestions: z
    .array(z.string())
    .describe('An array of suggested DOS commands based on the input.'),
});
export type SuggestDosCommandsOutput = z.infer<typeof SuggestDosCommandsOutputSchema>;

export async function suggestDosCommands(
  input: SuggestDosCommandsInput
): Promise<SuggestDosCommandsOutput> {
  return suggestDosCommandsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestDosCommandsPrompt',
  input: {schema: SuggestDosCommandsInputSchema},
  output: {schema: SuggestDosCommandsOutputSchema},
  prompt: `You are a helpful assistant designed to suggest DOS commands to users.

  Based on the partial command provided by the user, suggest a list of possible DOS commands that the user might be trying to type.

  Partial Command: {{{partialCommand}}}

  Suggestions:`,
});

const suggestDosCommandsFlow = ai.defineFlow(
  {
    name: 'suggestDosCommandsFlow',
    inputSchema: SuggestDosCommandsInputSchema,
    outputSchema: SuggestDosCommandsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
