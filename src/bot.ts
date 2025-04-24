import { Telegraf } from "telegraf";
import axios from "axios";
import cron from "node-cron";
import * as dotenv from "dotenv";

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

cron.schedule("30 06 * * *", async () => {
  console.log("⏰ Время постить артик!");

  const image = await getRandomAnimeArt();
  if (!image) return console.log("❌ Не найдено изображение");

  try {
    await bot.telegram.sendPhoto(
      CHANNEL_ID,
      { url: image.imageUrl },
      { caption: image.title + " #fanart" },
    );
    console.log("✅ Арт успешно отправлен в канал");
  } catch (error) {
    console.error("❌ Ошибка при отправке:", error);
  }
});

bot.command("art", async (ctx) => {
  const image = await getRandomAnimeArt();
  if (!image) return ctx.reply("Не найдено изображение");

  ctx.replyWithPhoto({ url: image.imageUrl }, { caption: image.title });
});

bot.launch();
console.log("🤖 Бот запущен");
