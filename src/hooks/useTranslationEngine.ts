import { useState, useCallback } from "react";
import { translationService } from "../services/TranslationService";

interface TranslationResult {
  text: string;
  dictionary?: any | null;
  error?: string;
}

interface UseTranslationEngineReturn {
  translateText: (
    text: string,
    context?: string,
    to?: string,
    from?: string
  ) => Promise<TranslationResult | null>;
  loading: boolean;
  error: string | null;
  getCachedTranslation: (text: string) => TranslationResult | null;
}

export const useTranslationEngine = (): UseTranslationEngineReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getCachedTranslation = useCallback((text: string) => {
    return translationService.getCached(text);
  }, []);

  const translateText = useCallback(
    async (
      text: string,
      context?: string,
      to?: string,
      from?: string
    ): Promise<TranslationResult | null> => {
      if (!text) return null;

      setLoading(true);
      setError(null);

      try {
        // Pass the target and source language if provided
        const result = await translationService.translate(
          text,
          to,
          context,
          from
        );
        return result;
      } catch (err: any) {
        setError(err.message);
        return { text: "Error", error: err.message };
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    translateText,
    loading,
    error,
    getCachedTranslation,
  };
};
