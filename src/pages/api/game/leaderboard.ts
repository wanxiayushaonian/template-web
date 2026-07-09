import type { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    // 获取排行榜
    try {
      const { mode, limit = '50' } = req.query
      
      const where = mode ? { gameMode: mode as string } : {}
      
      const records = await prisma.gameRecord.findMany({
        where,
        orderBy: { score: 'desc' },
        take: Math.min(parseInt(limit as string), 100),
        select: {
          id: true,
          nickname: true,
          score: true,
          moves: true,
          maxTile: true,
          maxCombo: true,
          gameMode: true,
          levelId: true,
          duration: true,
          createdAt: true
        }
      })
      
      return res.status(200).json({ records })
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error)
      return res.status(500).json({ error: 'Failed to fetch leaderboard' })
    }
  }
  
  if (req.method === 'POST') {
    // 提交新记录
    try {
      const { nickname, score, moves, maxTile, maxCombo, gameMode, levelId, duration } = req.body
      
      if (!nickname || !score || !moves || !maxTile || !gameMode) {
        return res.status(400).json({ error: 'Missing required fields' })
      }
      
      // 检查是否已存在相同记录（防止重复提交）
      const existing = await prisma.gameRecord.findFirst({
        where: {
          nickname,
          score,
          moves,
          gameMode,
          createdAt: {
            gte: new Date(Date.now() - 60000) // 1分钟内
          }
        }
      })
      
      if (existing) {
        return res.status(200).json({ record: existing, duplicate: true })
      }
      
      const record = await prisma.gameRecord.create({
        data: {
          nickname: nickname.slice(0, 20), // 限制昵称长度
          score,
          moves,
          maxTile,
          maxCombo: maxCombo || 0,
          gameMode,
          levelId: levelId || null,
          duration: duration || null
        }
      })
      
      return res.status(201).json({ record })
    } catch (error) {
      console.error('Failed to create record:', error)
      return res.status(500).json({ error: 'Failed to create record' })
    }
  }
  
  if (req.method === 'DELETE') {
    // 删除记录（管理员功能）
    try {
      const { id } = req.query
      
      if (!id) {
        return res.status(400).json({ error: 'Missing record id' })
      }
      
      await prisma.gameRecord.delete({
        where: { id: parseInt(id as string) }
      })
      
      return res.status(200).json({ success: true })
    } catch (error) {
      console.error('Failed to delete record:', error)
      return res.status(500).json({ error: 'Failed to delete record' })
    }
  }
  
  return res.status(405).json({ error: 'Method not allowed' })
}
