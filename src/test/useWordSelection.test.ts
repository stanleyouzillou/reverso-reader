import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useWordSelection } from "../hooks/useWordSelection";
import { useReaderSettings } from "../hooks/useReaderSettings";

// Mock useReaderSettings
vi.mock("../hooks/useReaderSettings", () => ({
  useReaderSettings: {
    getState: vi.fn(() => ({
      translationGranularity: "chunk",
    })),
  },
}));

describe("useWordSelection", () => {
  const allTokens = ["This", " ", "is", " ", "a", " ", "test", "."];
  const tokenToSentenceMap = [0, 0, 0, 0, 0, 0, 0, 0];

  it("selects a single word and sets clickedIndex", () => {
    const { result } = renderHook(() => useWordSelection());

    act(() => {
      result.current.handleWordSelection(0, allTokens, tokenToSentenceMap);
    });

    expect(result.current.selection).not.toBeNull();
    expect(result.current.selection?.start).toBe(0);
    expect(result.current.selection?.clickedIndex).toBe(0);
    expect(result.current.selection?.text).toBe("This ");
  });

  it("expands selection in chunk mode and preserves clickedIndex", () => {
    const { result } = renderHook(() => useWordSelection());

    // First click on "This"
    act(() => {
      result.current.handleWordSelection(0, allTokens, tokenToSentenceMap);
    });

    // Second click on "is"
    act(() => {
      result.current.handleWordSelection(2, allTokens, tokenToSentenceMap);
    });

    expect(result.current.selection?.start).toBe(0);
    expect(result.current.selection?.end).toBe(3); // Expanded to include the space after "is"
    expect(result.current.selection?.clickedIndex).toBe(2); // The last clicked word
    expect(result.current.selection?.isChunkActive).toBe(true);
  });
});
