import { buildHomeEmbed, toComponentEmbedJson } from "@/lib/discord-component-embed";

export async function GET() {
  const card = buildHomeEmbed();
  const jsonStr = toComponentEmbedJson(card);

  return new Response(jsonStr, {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.discord.component-embed+json",
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "public, max-age=86400",
    },
  });
}

