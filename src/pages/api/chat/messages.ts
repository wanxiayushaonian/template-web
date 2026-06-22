import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import pusher from "@/lib/pusher";

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

  if (req.method === "GET") {
    try {
      const { roomId, page = "1", limit = "50" } = req.query;
      const messages = await prisma.message.findMany({
        where: { roomId: roomId as string },
        orderBy: { createdAt: "desc" },
        take: parseInt(limit as string),
        skip: (parseInt(page as string) - 1) * parseInt(limit as string),
      });
      res.status(200).json(messages.reverse());
    } catch {
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  } else if (req.method === "POST") {
    try {
      const { content, userId, userName, userAvatar, roomId } = req.body;
      const message = await prisma.message.create({
        data: { content, userId, userName, userAvatar, roomId },
      });
      await prisma.chatRoom.update({
        where: { id: roomId },
        data: { updatedAt: new Date() },
      });
      await pusher.trigger(`presence-chat-room-${roomId}`, "new-message", {
        id: message.id,
        content: message.content,
        userId: message.userId,
        userName: message.userName,
        userAvatar: message.userAvatar,
        createdAt: message.createdAt,
      });
      res.status(201).json(message);
    } catch (error) {
      console.error("Error sending message:", error);
      res.status(500).json({ error: "Failed to send message" });
    }
  } else {
    res.setHeader("Allow", ["GET", "POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
