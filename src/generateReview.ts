import axios from "axios";
import * as dotenv from "dotenv";

dotenv.config();

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY!;

export async function generateReview(
  title: string,
  description: string,
): Promise<string | null> {
  try {
    const prompt = `Напиши красивую, эмоциональную рецензию на аниме под названием "${title}".
Используй живой язык, добавь немного поэтичности, но без спойлеров. Вот краткое описание тайтла:

${description}`;

    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "openrouter/gpt-3.5-turbo",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://t.me/anigurt",
          "X-Title": "RedditAnimeArtBot",
        },
      },
    );

    return response.data.choices[0].message.content.trim();
  } catch (err: any) {
    console.error(
      "Ошибка генерации рецензии:",
      err.response?.data || err.message,
    );
    return null;
  }
}
