import { Telegraf } from "telegraf";
import axios from "axios";
import * as dotenv from "dotenv";
import { generateReview } from "./generateReview";

dotenv.config();

const bot = new Telegraf(process.env.BOT_TOKEN!);
const CHANNEL_ID = process.env.CHANNEL_ID!;

async function getRandomAnimeArt(): Promise<{
  title: string;
  imageUrl: string;
} | null> {
  const url = "https://www.reddit.com/r/AnimeART/.json?limit=50";

  const res = await axios.get(url, {
    headers: { "User-Agent": "reddit-anime-bot" },
  });

  const posts = res.data.data.children;
  const images = posts
    .map((p: any) => p.data)
    .filter((p: any) => p.post_hint === "image" && !p.over_18);

  if (images.length === 0) return null;

  const random = images[Math.floor(Math.random() * images.length)];
  return { title: random.title, imageUrl: random.url };
}

(async () => {
  const image = await getRandomAnimeArt();
  if (!image) {
    console.error("❌ Не удалось найти изображение");
    return;
  }

  try {
    await bot.telegram.sendPhoto(
      CHANNEL_ID,
      { url: image.imageUrl },
      { caption: image.title },
    );
    console.log("✅ Успешно отправлено в канал");
  } catch (error) {
    console.error("❌ Ошибка при отправке:", error);
  }
})();
