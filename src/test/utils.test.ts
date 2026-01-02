import { describe, it, expect } from "vitest";
import { isWord, tokenize } from "../lib/utils";

describe("Text Utilities", () => {
  describe("isWord", () => {
    it("identifies English words", () => {
      expect(isWord("Hello")).toBe(true);
      expect(isWord("don't")).toBe(true);
    });

    it("identifies French words", () => {
      expect(isWord("école")).toBe(true);
      expect(isWord("aujourd'hui")).toBe(true);
    });

    it("identifies Japanese/Chinese characters", () => {
      expect(isWord("こんにちは")).toBe(true);
      expect(isWord("你好")).toBe(true);
    });

    it("rejects punctuation", () => {
      expect(isWord(".")).toBe(false);
      expect(isWord("!")).toBe(false);
      expect(isWord(",")).toBe(false);
    });
  });

  describe("tokenize", () => {
    it("splits English sentences correctly", () => {
      const text = "Hello, world! It's me.";
      const tokens = tokenize(text);
      // The current tokenizer keeps trailing spaces with punctuation if they aren't words
      expect(tokens).toEqual([
        "Hello",
        ", ",
        "world",
        "! ",
        "It's",
        " ",
        "me",
        ".",
      ]);
    });

    it("preserves spaces and punctuation", () => {
      const text = "A  B. ";
      const tokens = tokenize(text);
      expect(tokens).toEqual(["A", "  ", "B", ". "]);
    });
  });
});
