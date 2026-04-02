import type { VercelRequest, VercelResponse } from '@vercel/node'
import Groq from 'groq-sdk'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const { message, locationContext } = req.body as {
    message: string
    locationContext?: { name: string; description: string; category: string }
  }

  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  res.setHeader('Access-Control-Allow-Origin', '*')

  const systemPrompt = locationContext
    ? `Ты AI-ассистент для анализа городских локаций Москвы.
Сейчас выбрана локация: ${locationContext.name} (${locationContext.category}).
Описание: ${locationContext.description}.
Отвечай на русском языке, кратко и по делу. Не более 3-4 предложений.`
    : 'Ты AI-ассистент для анализа городских локаций на карте Москвы. Отвечай на русском языке.'

  try {
    const stream = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 512,
      stream: true,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message },
      ],
    })

    for await (const chunk of stream) {
      const text = chunk.choices[0]?.delta?.content ?? ''
      if (text) {
        res.write(`data: ${JSON.stringify({ text })}\n\n`)
      }
    }

    res.write('data: [DONE]\n\n')
    res.end()
  } catch {
    res.write(`data: ${JSON.stringify({ error: 'Ошибка API' })}\n\n`)
    res.end()
  }
}
