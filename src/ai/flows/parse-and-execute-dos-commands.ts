'use server';

/**
 * @fileOverview This file defines a Genkit flow to parse and execute DOS commands by translating them into modern OS equivalents.
 *
 * - parseAndExecuteDosCommand - A function that takes a DOS command as input, translates it, executes it, and returns the output.
 * - ParseAndExecuteDosCommandInput - The input type for the parseAndExecuteDosCommand function.
 * - ParseAndExecuteDosCommandOutput - The return type for the parseAndExecuteDosCommand function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {executeCommand} from '@/services/command-executor';

const ParseAndExecuteDosCommandInputSchema = z.object({
  dosCommand: z.string().describe('The DOS command to parse and execute.'),
});
export type ParseAndExecuteDosCommandInput = z.infer<typeof ParseAndExecuteDosCommandInputSchema>;

const ParseAndExecuteDosCommandOutputSchema = z.object({
  executedCommand: z.string().describe('The translated and executed command.'),
  output: z.string().describe('The output of the executed command.'),
});
export type ParseAndExecuteDosCommandOutput = z.infer<typeof ParseAndExecuteDosCommandOutputSchema>;

export async function parseAndExecuteDosCommand(input: ParseAndExecuteDosCommandInput): Promise<ParseAndExecuteDosCommandOutput> {
  return parseAndExecuteDosCommandFlow(input);
}

const translateDosCommandPrompt = ai.definePrompt({
  name: 'translateDosCommandPrompt',
  input: {schema: ParseAndExecuteDosCommandInputSchema},
  output: {schema: z.string().describe('The translated command to execute.')},
  prompt: `You are a command line translator. The user will provide a DOS command that they want to run, but their operating system might not support DOS commands. Translate the DOS command into the appropriate command for their operating system.

DOS command: {{{dosCommand}}}`,
});

const parseAndExecuteDosCommandFlow = ai.defineFlow(
  {
    name: 'parseAndExecuteDosCommandFlow',
    inputSchema: ParseAndExecuteDosCommandInputSchema,
    outputSchema: ParseAndExecuteDosCommandOutputSchema,
  },
  async input => {
    const {output: translatedCommand} = await translateDosCommandPrompt(input);

    if (!translatedCommand) {
      throw new Error('Failed to translate DOS command.');
    }

    const {output} = await executeCommand(translatedCommand);

    return {
      executedCommand: translatedCommand,
      output: output,
    };
  }
);
