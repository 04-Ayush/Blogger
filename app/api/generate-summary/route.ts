import { NextResponse } from 'next/server'
import { createHash } from 'crypto'

type GenerateSummaryRequest = {
  bodyText: string
}

type GenerateSummaryResponse = {
  summary: string
}

type GeminiGenerateContentResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>
    }
  }>
}

function buildPrompt(bodyText: string) {
  return [
    'You are a professional blog editor.',
    'Summarize the following blog content professionally.',
    'Keep it concise and readable.',
    'Focus on key ideas only.',
    'Max 200 words.',
    '',
    'BLOG CONTENT:',
    bodyText,
  ].join('\n')
}

async function generateWithGemini(bodyText: string) {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    throw new Error('Missing GEMINI_API_KEY environment variable.')
  }

  // Token optimization: cap input size while keeping meaning.
  // (Free tier friendly; prevents extremely long posts from burning tokens.)
  const cappedBody = bodyText.length > 8000 ? bodyText.slice(0, 8000) : bodyText

  // Keep the payload minimal for token/cost optimization.
  const payload = {
    contents: [
      {
        role: 'user',
        parts: [{ text: buildPrompt(cappedBody) }],
      },
    ],
    generationConfig: {
      temperature: 0.4,
      maxOutputTokens: 320,
    },
  }

  // Using the public Generative Language REST API (no extra dependency).
  // Model choice can be adjusted without changing the client flow.
  const url =
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${encodeURIComponent(apiKey)}`

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 15_000)

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
    signal: controller.signal,
  })

  clearTimeout(timeout)

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`Gemini API error (${res.status}): ${text || res.statusText}`)
  }

  const data: unknown = await res.json()
  const gemini = data as GeminiGenerateContentResponse
  const parts = gemini.candidates?.[0]?.content?.parts ?? []
  const summary = parts.map((p) => p.text ?? '').join('')

  const cleaned = String(summary).trim()
  if (!cleaned) {
    throw new Error('Gemini returned an empty summary.')
  }
  return cleaned
}

declare global {
  // eslint-disable-next-line no-var
  var __geminiSummaryCache: Map<string, string> | undefined
}

function getCache() {
  if (!globalThis.__geminiSummaryCache) {
    globalThis.__geminiSummaryCache = new Map<string, string>()
  }
  return globalThis.__geminiSummaryCache
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as GenerateSummaryRequest
    const bodyText = String(body?.bodyText ?? '').trim()

    if (!bodyText) {
      return NextResponse.json({ error: 'bodyText is required.' }, { status: 400 })
    }

    // Token optimization: only send body text, generate once, store result.
    const key = createHash('sha256').update(bodyText).digest('hex')
    const cache = getCache()
    const cached = cache.get(key)
    if (cached) {
      const response: GenerateSummaryResponse = { summary: cached }
      return NextResponse.json(response)
    }

    const summary = await generateWithGemini(bodyText)
    cache.set(key, summary)

    const response: GenerateSummaryResponse = { summary }
    return NextResponse.json(response)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to generate summary.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

