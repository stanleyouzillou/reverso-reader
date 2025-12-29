import { useMemo } from "react";
import { DEMO_ARTICLE } from "../constants/demoContent";
import { articleService } from "../services/ArticleService";

export const useArticleIngestion = () => {
  // Memoize the processed data so it's only computed once (or when article changes)
  const processedData = useMemo(() => {
    return articleService.process(DEMO_ARTICLE);
  }, []);

  const getContext = (start: number, end: number) => {
    return articleService.getContext(processedData.allTokens, start, end);
  };

  return {
    ...processedData,
    getContext,
  };
};
