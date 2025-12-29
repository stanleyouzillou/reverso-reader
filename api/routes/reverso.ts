import { Router, Request, Response } from "express";
// @ts-ignore
import Reverso from "reverso-api";

const router = Router();
const reverso = new Reverso();

// Manual mapping from reverso-api source
const languages: Record<string, string> = {
  arabic: "ara",
  german: "ger",
  spanish: "spa",
  french: "fra",
  hebrew: "heb",
  italian: "ita",
  japanese: "jpn",
  dutch: "dut",
  polish: "pol",
  portuguese: "por",
  romanian: "rum",
  russian: "rus",
  ukrainian: "ukr",
  turkish: "tur",
  chinese: "chi",
  english: "eng",
};

const TRANSLATION_URL = "https://api.reverso.net/translate/v1/translation";

router.post("/translation", async (req: Request, res: Response) => {
  try {
    const { text, from = "english", to = "french" } = req.body;

    if (!text) {
      return res.status(400).json({ error: "Text is required" });
    }

    // Manual implementation to bypass buggy reverso-api library
    const sourceLang = languages[from.toLowerCase()] || "eng";
    const targetLang = languages[to.toLowerCase()] || "fra";

    const payload = {
      format: "text",
      from: sourceLang,
      input: text,
      options: {
        contextResults: true,
        languageDetection: true,
        origin: "reversomobile",
        sentenceSplitter: false,
      },
      to: targetLang,
    };

    const response = await fetch(TRANSLATION_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "Reverso/2.5.0",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Reverso API returned ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.translation || !Array.isArray(data.translation)) {
      throw new Error("Invalid response format from Reverso API");
    }

    // Construct response compatible with reverso-api format
    const result = {
      ok: true,
      text: text,
      source: from,
      target: to,
      translations: data.translation,
      context: data.contextResults,
    };

    res.json(result);

  } catch (error: any) {
    console.error("Reverso Route Error:", error);
    res.status(500).json({ error: error.message || "Failed to fetch translation" });
  }
});

router.post("/context", async (req: Request, res: Response) => {
  try {
    const { text, from = "english", to = "french" } = req.body;

    if (!text) {
      return res.status(400).json({ error: "Text is required" });
    }

    reverso.getContext(text, from, to, (err: any, response: any) => {
      if (err) {
        console.error("Reverso Context API Error:", err);
        return res.status(500).json({ error: err.message });
      }
      res.json(response);
    });
  } catch (error: any) {
    console.error("Reverso Route Error:", error);
    res.status(500).json({ error: error.message });
  }
});

router.post("/synonyms", async (req: Request, res: Response) => {
  try {
    const { text, lang = "english" } = req.body;

    if (!text) {
      return res.status(400).json({ error: "Text is required" });
    }

    reverso.getSynonyms(text, lang, (err: any, response: any) => {
      if (err) {
        console.error("Reverso Synonyms API Error:", err);
        return res.status(500).json({ error: err.message });
      }
      res.json(response);
    });
  } catch (error: any) {
    console.error("Reverso Route Error:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
