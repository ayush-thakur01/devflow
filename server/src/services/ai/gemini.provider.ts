import AIProvider from './aiProvider.js'
import env from '../../config/env.js'
import logger from '../../utils/logger.js'

class GeminiProvider extends AIProvider {
  apiKey: string | null;
  model: string;
  baseUrl: string;

  constructor() {
    super()
    this.apiKey = env.GEMINI_API_KEY || null
    const requestedModel = env.GEMINI_MODEL || 'gemini-2.0-flash'
    const oldPaLMModels = ['chat-bison-001', 'chat-bison', 'text-bison-001', 'text-bison']
    this.model = oldPaLMModels.includes(requestedModel) ? 'gemini-2.0-flash' : requestedModel
    this.baseUrl = env.GEMINI_API_URL || `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent`
  }

  async callGemini(prompt, { temperature = 0.3, maxOutputTokens = 500 } = {}) {
    const url = `${this.baseUrl}?key=${this.apiKey}`
    const resp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature, maxOutputTokens },
      }),
    })

    if (!resp.ok) {
      const err: any = await resp.json().catch(() => ({}))
      throw new Error(err?.error?.message || `Gemini API error ${resp.status}`)
    }

    const data: any = await resp.json()
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || ''
    if (!text) throw new Error('Empty response from Gemini')
    return text
  }

  async generateRoadmap(goal, options = {}) {
    const opts: any = options
    const difficulty = opts.difficulty || 'beginner'
    const isMock = !this.apiKey

    if (!isMock) {
      try {
        const prompt = `Create a comprehensive, phased learning roadmap for the following goal: "${goal}". The user difficulty level is "${difficulty}". Respond with a single raw JSON object matching this schema: { "title": string, "description": string, "difficulty": string, "estimatedHours": number, "modules": [{ "title": string, "description": string, "order": number, "estimatedHours": number, "difficulty": string, "topics": [{ "title": string, "description": string, "priority": "low"|"medium"|"high", "estimatedMinutes": number, "resources": [string], "notes": "" }] }], "resources": [string], "projects": [string] }`
        const text = await this.callGemini(prompt, { temperature: 0.2, maxOutputTokens: 1500 })
        try {
          return JSON.parse(text)
        } catch {
          const jsonMatch = text.match(/\{[\s\S]*\}/)
          if (jsonMatch) return JSON.parse(jsonMatch[0])
          logger.warn('Gemini returned non-JSON for roadmap; falling back to mock')
        }
      } catch (error) {
        logger.warn(`Gemini generateRoadmap failed: ${error.message}. Falling back to mock generator.`)
      }
    }

    return this.generateMockRoadmap(goal, difficulty)
  }

  async summarizeNote(content) {
    const isMock = !this.apiKey
    if (!isMock) {
      try {
        const text = await this.callGemini(`Summarize the following note concisely, capturing the key points:\n\n${content}`, { temperature: 0.2, maxOutputTokens: 300 })
        return text
      } catch (error) {
        logger.warn(`Gemini summarizeNote failed: ${error.message}. Falling back to mock.`)
      }
    }
    return this.generateMockSummary(content)
  }

  async askMentorQuestion(question, context = {}) {
    const isMock = !this.apiKey
    if (!isMock) {
      try {
        const prompt = `You are a supportive and expert AI mentor for software engineers and students.\n\nLearner Question: "${question}"\nLearner Context: ${JSON.stringify(context)}\n\nProvide a supportive, constructive, action-oriented mentorship-style response under 300 words.`
        return await this.callGemini(prompt, { temperature: 0.3, maxOutputTokens: 500 })
      } catch (error) {
        logger.warn(`Gemini askMentorQuestion failed: ${error.message}. Falling back to mock answer.`)
      }
    }

    return this.generateMockMentorReply(question, context)
  }

  async suggestTasks(context) {
    const isMock = !this.apiKey
    if (!isMock) {
      try {
        const prompt = `Based on this learner's data, suggest 3-5 specific actionable tasks they should do next. Return a JSON array of objects with fields: title (string), reason (string), priority ("low"|"medium"|"high"), type ("task"|"learning"|"review"|"exploration").\n\nData: ${JSON.stringify(context)}`
        const text = await this.callGemini(prompt, { temperature: 0.3, maxOutputTokens: 500 })
        try { return JSON.parse(text) } catch {
          const match = text.match(/\[[\s\S]*\]/)
          if (match) return JSON.parse(match[0])
        }
      } catch (error) {
        logger.warn(`Gemini suggestTasks failed: ${error.message}. Falling back to mock.`)
      }
    }
    return this.generateMockSuggestions(context)
  }

  async generateQuiz(content) {
    const isMock = !this.apiKey
    if (!isMock) {
      try {
        const prompt = `Generate 3-5 quiz questions from this content. Return a JSON array of objects with fields: question (string), options (array of 4 strings), correctIndex (number 0-3), explanation (string).\n\nContent:\n${content}`
        const text = await this.callGemini(prompt, { temperature: 0.3, maxOutputTokens: 800 })
        try { return JSON.parse(text) } catch {
          const match = text.match(/\[[\s\S]*\]/)
          if (match) return JSON.parse(match[0])
        }
      } catch (error) {
        logger.warn(`Gemini generateQuiz failed: ${error.message}. Falling back to mock.`)
      }
    }
    return this.generateMockQuiz(content)
  }

  async reviewCode(code) {
    const isMock = !this.apiKey
    if (!isMock) {
      try {
        const prompt = `Review this code for issues, bugs, and improvements. Return a JSON object with fields: summary (string), issues (array of objects with fields: line (string), severity ("error"|"warning"|"info"), message (string)).\n\nCode:\n${code}`
        const text = await this.callGemini(prompt, { temperature: 0.2, maxOutputTokens: 600 })
        try { return JSON.parse(text) } catch {
          const match = text.match(/\{[\s\S]*\}/)
          if (match) return JSON.parse(match[0])
        }
      } catch (error) {
        logger.warn(`Gemini reviewCode failed: ${error.message}. Falling back to mock.`)
      }
    }
    return this.generateMockCodeReview(code)
  }

  async *askMentorQuestionStream(question, context = {}) {
    const isMock = !this.apiKey
    if (!isMock) {
      try {
        const prompt = `You are a supportive and expert AI mentor for software engineers and students.\n\nLearner Question: "${question}"\nLearner Context: ${JSON.stringify(context)}\n\nProvide a supportive, constructive, action-oriented mentorship-style response under 300 words.`
        const url = `${this.baseUrl}?key=${this.apiKey}`
        const resp = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.3, maxOutputTokens: 500 },
          }),
        })

        if (!resp.ok) throw new Error(`Gemini API error ${resp.status}`)

        const reader = resp.body.getReader()
        const decoder = new TextDecoder()
        let buffer = ''

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() || ''

          for (const line of lines) {
            const trimmed = line.trim()
            if (!trimmed.startsWith('data: ')) continue
            try {
              const data = JSON.parse(trimmed.slice(6))
              const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || ''
              if (text) yield text
            } catch {
              /* skip malformed */
            }
          }
        }

        if (buffer.trim().startsWith('data: ')) {
          try {
            const data = JSON.parse(buffer.trim().slice(6))
            const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || ''
            if (text) yield text
          } catch {
            /* skip malformed */
          }
        }

        return
      } catch (error) {
        logger.warn(`Gemini askMentorQuestionStream failed: ${error.message}. Falling back to mock streaming.`)
      }
    }

    yield* super.askMentorQuestionStream(question, context)
  }
}

export default GeminiProvider
