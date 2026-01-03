import { useStore } from '../store/useStore';

export const useVocabulary = () => {
  const history = useStore((state) => state.history);
  const saved = useStore((state) => state.saved);
  const toLearn = useStore((state) => state.toLearn);
  const addToHistory = useStore((state) => state.addToHistory);
  const toggleSaved = useStore((state) => state.toggleSaved);
  const clearHistory = useStore((state) => state.clearHistory);

  return {
    history,
    saved,
    toLearn,
    addToHistory,
    toggleSaved,
    clearHistory,
  };
};
