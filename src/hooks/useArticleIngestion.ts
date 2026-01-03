import { useMemo } from "react";
import { DEMO_ARTICLE } from "../constants/demoContent";
import { articleService } from "../services/ArticleService";

export const useArticleIngestion = () => {
  // Memoize the processed data so it's only computed once (or when article changes)
  const result = useMemo(() => {
    const processed = articleService.process(DEMO_ARTICLE);

    const getContext = (start: number, end: number) => {
      return articleService.getContext(processed.allTokens, start, end);
    };

    const res = {
      ...processed,
      getContext,
      sourceLanguage: DEMO_ARTICLE.l2_language, // The language of the main text
      targetLanguage: DEMO_ARTICLE.l1_language, // The default translation language
    };

    return res;
  }, []);

  return result;
};
