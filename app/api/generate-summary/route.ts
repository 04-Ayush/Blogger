import { NextResponse } from 'next/server'
import { createHash } from 'crypto'

type GenerateSummaryRequest = {
  bodyText: string
}

type GenerateSummaryResponse = {
  summary: string | null
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
    'Write a brief, readable summary of the blog post.',
    'Length: 4–5 lines total (4–5 sentences).',
    'Target: ~90–140 words (do not exceed 200 words).',
    'Include the main topic, 2–4 key points, and the takeaway.',
    'Do NOT be overly short, vague, or generic.',
    'Format: plain text only; put each sentence on its own line; no title, no bullets.',
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

  const cappedBody =
    bodyText.length > 8000
      ? bodyText.slice(0, 8000)
      : bodyText

  const payload = {
    contents: [
      {
        role: 'user',
        parts: [{ text: buildPrompt(cappedBody) }],
      },
    ],
    generationConfig: {
      temperature: 0.4,
      maxOutputTokens: 1000,
    },
  }

  const url =
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 15000)

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify(payload),
    signal: controller.signal,
  })

  clearTimeout(timeout)

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(
      `Gemini API error (${res.status}): ${text || res.statusText}`
    )
  }

  const data: unknown = await res.json()
  const gemini = data as GeminiGenerateContentResponse

  const parts =
    gemini.candidates?.[0]?.content?.parts ?? []

  const summary = parts
    .map((p) => p.text ?? '')
    .join('')

  const cleaned = String(summary).trim()

  if (!cleaned) {
    throw new Error('Gemini returned an empty summary.')
  }

  return cleaned
}

declare global {
  // eslint-disable-next-line no-var
  var __geminiSummaryCache:
    | Map<string, string>
    | undefined
}

function getCache() {
  if (!globalThis.__geminiSummaryCache) {
    globalThis.__geminiSummaryCache = new Map()
  }

  return globalThis.__geminiSummaryCache
}

export async function POST(req: Request) {
  try {
    const body =
      (await req.json()) as GenerateSummaryRequest

    const bodyText = String(
      body?.bodyText ?? ''
    ).trim()

    if (!bodyText) {
      return NextResponse.json(
        { error: 'bodyText is required.' },
        { status: 400 }
      )
    }

    const key = createHash('sha256')
      .update(bodyText)
      .digest('hex')

    const cache = getCache()
    const cached = cache.get(key)

    if (cached) {
      const response: GenerateSummaryResponse = {
        summary: cached,
      }

      return NextResponse.json(response)
    }

    let summary: string | null = null

    try {
      summary = await generateWithGemini(bodyText)

      if (summary) {
        cache.set(key, summary)
      }
    } catch (geminiError) {
      const message =
        geminiError instanceof Error
          ? geminiError.message
          : 'Gemini failed'

      console.warn('Gemini unavailable:', message)

      summary = null
    }

    const response: GenerateSummaryResponse = {
      summary,
    }

    return NextResponse.json(response)
  } catch (err) {
    const message =
      err instanceof Error
        ? err.message
        : 'Failed to generate summary.'

    return NextResponse.json(
      { error: message },
      { status: 500 }
    )
  }
}