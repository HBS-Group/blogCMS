// src/types/text-readability.d.ts

/**
 * Declares the module 'text-readability' for TypeScript,
 * assuming it uses a default export containing the API functions.
 */
declare module 'text-readability' {
    interface TextReadabilityAPI {
      /**
       * Calculates the Flesch Reading Ease score.
       * Higher scores indicate easier readability.
       * @param text The text content to analyze.
       * @returns The Flesch Reading Ease score (typically 0-100).
       */
      fleschReadingEase(text: string): number;
  
      // Add type signatures for other functions from the library if you use them:
      // fleschKincaidGrade(text: string): number;
      // colemanLiauIndex(text: string): number;
      // automatedReadabilityIndex(text: string): number;
      // daleChallReadabilityScore(text: string): number;
      // difficultWords(text: string): number;
      // linsearWriteFormula(text: string): number;
      // gunningFog(text: string): number;
      // textStandard(text: string, float_output?: boolean): string | number;
      // syllableCount(text: string, lang?: string): number;
      // lexiconCount(text: string, removepunct?: boolean): number;
      // sentenceCount(text: string): number;
    }
  
    // Declare that the default export is an object matching the interface
    const api: TextReadabilityAPI;
    export default api;
  }