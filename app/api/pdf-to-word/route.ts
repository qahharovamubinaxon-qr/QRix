import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { imageBase64, pageNum, totalPages } = await req.json();

    if (!imageBase64) {
      return NextResponse.json({ success: false, error: "No image data" }, { status: 400 });
    }

    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 4096,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: "image/png",
                data: imageBase64,
              },
            },
            {
              type: "text",
              text: `Bu PDF sahifasining rasmi (${pageNum}/${totalPages}).
Sahifadagi BARCHA matnni aniq va to'liq ko'chir.
Qoidalar:
- Matn tartibini saqlang (yuqoridan pastga)
- Sarlavhalarni ### bilan belgilang
- Bo'sh qatorlarni saqlang
- Faqat matnni qaytaring, hech qanday izoh qo'shmang
- Agar sahifada matn bo'lmasa, "EMPTY PAGE" deb yozing`,
            },
          ],
        },
      ],
    });

    console.log("Claude response:", JSON.stringify(message.content, null, 2));

    const text = message.content
      .filter((block) => block.type === "text")
      .map((block) => (block as any).text)
      .join("\n");

    console.log("Extracted text length:", text.length);
    console.log("Extracted text preview:", text.substring(0, 200));

    if (!text || text.trim().length === 0) {
      return NextResponse.json({
        success: false,
        error: "Claude returned empty text",
      }, { status: 500 });
    }

    return NextResponse.json({ success: true, text });
  } catch (error) {
    console.error("PDF to Word error:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}