import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { updateId, targetLang } = await request.json();

    if (!updateId || !targetLang) {
      return NextResponse.json(
        { error: "updateId and targetLang are required" },
        { status: 400 }
      );
    }

    const langCode = targetLang.toLowerCase(); // "en", "ko", "ja", "zh"

    // 1. Check existing cached translation in DB
    const existing = await prisma.updateTranslation.findUnique({
      where: {
        updateId_language: {
          updateId,
          language: langCode,
        },
      },
    });

    if (existing) {
      return NextResponse.json({
        translated: true,
        source: "database_cache",
        title: existing.title,
        summary: existing.summary,
        bodyMarkdown: existing.bodyMarkdown,
      });
    }

    // 2. Fetch original update
    const update = await prisma.update.findUnique({
      where: { id: updateId },
    });

    if (!update) {
      return NextResponse.json({ error: "Update not found" }, { status: 404 });
    }

    // If target language is already Korean and original is in Korean, return as is
    if (langCode === "ko") {
      return NextResponse.json({
        translated: true,
        source: "original",
        title: update.title,
        summary: update.summary,
        bodyMarkdown: update.bodyMarkdown,
      });
    }

    // 3. Map language to DeepL target_lang
    const deeplLangMap: Record<string, string> = {
      en: "EN-US",
      ja: "JA",
      zh: "ZH",
      ko: "KO",
    };
    const deeplTarget = deeplLangMap[langCode] || "EN-US";

    const deeplApiKey = process.env.DEEPL_API_KEY;
    if (!deeplApiKey) {
      return NextResponse.json({ error: "DEEPL_API_KEY is not configured" }, { status: 500 });
    }
    const endpoint = deeplApiKey.endsWith(":fx")
      ? "https://api-free.deepl.com/v2/translate"
      : "https://api.deepl.com/v2/translate";

    // DeepL call for title and bodyMarkdown
    const textsToTranslate = [
      update.title,
      update.summary || "",
      update.bodyMarkdown,
    ];

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `DeepL-Auth-Key ${deeplApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: textsToTranslate,
        target_lang: deeplTarget,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("DeepL translation failed:", response.status, errText);
      return NextResponse.json(
        { error: "Translation provider error", detail: errText },
        { status: 502 }
      );
    }

    const data = await response.json();
    const translatedTitle = data.translations[0]?.text || update.title;
    const translatedSummary = data.translations[1]?.text || update.summary;
    const translatedBody = data.translations[2]?.text || update.bodyMarkdown;

    // 4. Cache translation in database
    await prisma.updateTranslation.create({
      data: {
        updateId,
        language: langCode,
        title: translatedTitle,
        summary: translatedSummary,
        bodyMarkdown: translatedBody,
        translatedBy: "AI_DEEPL",
      },
    });

    return NextResponse.json({
      translated: true,
      source: "deepl_api",
      title: translatedTitle,
      summary: translatedSummary,
      bodyMarkdown: translatedBody,
    });
  } catch (error: any) {
    console.error("Translation API error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: error.message },
      { status: 500 }
    );
  }
}
