import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

const REACTION_TYPES = [
  "like",
  "cheer",
  "celebrate",
  "appreciate",
  "smile",
] as const;
type ReactionType = (typeof REACTION_TYPES)[number];

const isDbReady = () => {
  const url = process.env.DATABASE_URL || "";
  return url.startsWith("postgresql://") || url.startsWith("postgres://");
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (!isDbReady()) {
    if (req.method === "GET") {
      return res.status(200).json({
        like: 0, cheer: 0, celebrate: 0, appreciate: 0, smile: 0,
      });
    }
    return res.status(200).json({ message: "数据库未配置" });
  }

  try {
    if (req.method === "GET") {
      const reactions = await prisma.reaction.findMany({
        select: { type: true, count: true },
      });
      const reactionMap: Record<ReactionType, number> = {
        like: 0, cheer: 0, celebrate: 0, appreciate: 0, smile: 0,
      };
      reactions.forEach((reaction) => {
        if (REACTION_TYPES.includes(reaction.type as ReactionType)) {
          reactionMap[reaction.type as ReactionType] = reaction.count;
        }
      });
      res.status(200).json(reactionMap);
    } else if (req.method === "POST") {
      const { type } = req.body;
      if (!type || !REACTION_TYPES.includes(type)) {
        return res.status(400).json({ error: "无效的点赞类型" });
      }
      const reaction = await prisma.reaction.upsert({
        where: { type },
        update: { count: { increment: 1 } },
        create: { type, count: 1 },
      });
      res.status(200).json({ type: reaction.type, count: reaction.count });
    } else {
      res.setHeader("Allow", ["GET", "POST"]);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error("点赞API错误:", error);
    res.status(500).json({ error: "服务器内部错误" });
  }
}
