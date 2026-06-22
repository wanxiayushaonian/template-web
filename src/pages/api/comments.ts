import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

const isDbReady = () => {
  const url = process.env.DATABASE_URL || "";
  return url.startsWith("postgresql://") || url.startsWith("postgres://");
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (!isDbReady()) {
    if (req.method === "GET") return res.status(200).json([]);
    return res.status(200).json({ message: "数据库未配置" });
  }

  try {
    if (req.method === "GET") {
      const comments = await prisma.comment.findMany({
        where: { parentId: null },
        include: {
          replies: { include: { replies: true } },
        },
        orderBy: { createdAt: "desc" },
      });
      res.status(200).json(comments);
    } else if (req.method === "POST") {
      const { nickname, contact, content, parentId } = req.body;
      if (!content || content.trim() === "") {
        return res.status(400).json({ error: "评论内容不能为空" });
      }
      const comment = await prisma.comment.create({
        data: {
          nickname: nickname || null,
          contact: contact || null,
          content: content.trim(),
          parentId: parentId || null,
        },
        include: { replies: true },
      });
      res.status(201).json(comment);
    } else {
      res.setHeader("Allow", ["GET", "POST"]);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error("评论API错误:", error);
    res.status(500).json({ error: "服务器内部错误" });
  }
}
