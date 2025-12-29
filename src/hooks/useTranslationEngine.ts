import { useState, useCallback } from "react";
import { translationService } from "../services/TranslationService";

interface TranslationResult {
  text: string;
  error?: string;
}

interface UseTranslationEngineReturn {
  translateText: (text: string, context?: string) => Promise<TranslationResult | null>;
  loading: boolean;
  error: string | null;
  getCachedTranslation: (text: string) => string | null;
}

export const useTranslationEngine = (): UseTranslationEngineReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getCachedTranslation = useCallback((text: string) => {
    return translationService.getCached(text);
  }, []);

  const translateText = useCallback(
    async (text: string, context?: string): Promise<TranslationResult | null> => {
      if (!text) return null;

      setLoading(true);
      setError(null);

      try {
        const result = await translationService.translate(text, "fr", context);
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
