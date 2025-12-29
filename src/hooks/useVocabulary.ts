import { useStore } from '../store/useStore';

export const useVocabulary = () => {
  const {
    history,
    saved,
    toLearn,
    addToHistory,
    toggleSaved,
    clearHistory,
  } = useStore();

  return {
    history,
    saved,
    toLearn,
    addToHistory,
    toggleSaved,
    clearHistory,
  };
};
