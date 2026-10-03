import { OpenAI } from 'openai'
import AIProvider from './aiProvider.js'
import env from '../../config/env.js'
import logger from '../../utils/logger.js'

class OpenAIProvider extends AIProvider {
  client: any;

  constructor() {
    super()
    this.client = new OpenAI({ apiKey: env.OPENAI_API_KEY || 'mock_key' })
  }

  async generateRoadmap(goal, options = {}) {
    const opts: any = options
    const difficulty = opts.difficulty || 'beginner'
    const isMock = !env.OPENAI_API_KEY || env.OPENAI_API_KEY === 'your_openai_api_key_here' || env.OPENAI_API_KEY === 'mock_key'

    if (!isMock) {
      try {
        const prompt = `
Create a comprehensive, phased learning roadmap for the following goal: "${goal}".
The user difficulty level is "${difficulty}".

You must return a single JSON object (with no markdown, no backticks, no wrap, just the raw JSON) that strictly matches the following structure:
{
  "title": "Short Descriptive Title of the Roadmap",
  "description": "Overall summary of the learning path.",
  "difficulty": "beginner" | "intermediate" | "advanced",
  "estimatedHours": number,
  "modules": [
    {
      "title": "Module Title (e.g. Phase 1: Basics)",
      "description": "Short explanation of this module's objectives.",
      "order": 1,
      "estimatedHours": number,
      "difficulty": "beginner" | "intermediate" | "advanced",
      "topics": [
        {
          "title": "Topic Name",
          "description": "Brief description of what will be learned.",
          "priority": "low" | "medium" | "high",
          "estimatedMinutes": number,
          "resources": ["url_or_name_string"],
          "notes": ""
        }
      ]
    }
  ],
  "resources": ["general_resource_string"],
  "projects": ["suggested_project_idea_string"]
}
        `
        const response = await this.client.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: 'You are an AI mentor that returns ONLY raw, valid JSON matching the requested schema. No markdown formatting.' },
            { role: 'user', content: prompt },
          ],
          max_tokens: 1500,
          response_format: { type: 'json_object' },
        })

        const content = response.choices?.[0]?.message?.content || ''
        return JSON.parse(content)
      } catch (error) {
        logger.warn(`OpenAI generateRoadmap failed: ${error.message}. Falling back to mock generator.`)
      }
    }

    return this.generateMockRoadmap(goal, difficulty)
  }

  async summarizeNote(content) {
    const isMock = !env.OPENAI_API_KEY || env.OPENAI_API_KEY === 'your_openai_api_key_here' || env.OPENAI_API_KEY === 'mock_key'
    if (!isMock) {
      try {
        const response = await this.client.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: 'You summarize notes concisely, capturing key points. Output in markdown.' },
            { role: 'user', content: `Summarize this note:\n\n${content}` },
          ],
          max_tokens: 300,
        })
        return response.choices?.[0]?.message?.content || ''
      } catch (error) {
        logger.warn(`OpenAI summarizeNote failed: ${error.message}. Falling back to mock.`)
      }
    }
    return this.generateMockSummary(content)
  }

  async askMentorQuestion(question, context = {}) {
    const isMock = !env.OPENAI_API_KEY || env.OPENAI_API_KEY === 'your_openai_api_key_here' || env.OPENAI_API_KEY === 'mock_key'

    if (!isMock) {
      try {
        const prompt = `
Learner Question: "${question}"
Learner Context (active roadmap/goals): ${JSON.stringify(context)}

Provide a supportive, constructive, and action-oriented mentorship-style response. Focus on giving practical steps and encouraging the learner. Keep it under 300 words.
        `
        const response = await this.client.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: 'You are a supportive and expert AI mentor for software engineers and college students.' },
            { role: 'user', content: prompt },
          ],
          max_tokens: 500,
        })

        return response.choices?.[0]?.message?.content || ''
      } catch (error) {
        logger.warn(`OpenAI askMentorQuestion failed: ${error.message}. Falling back to mock answer.`)
      }
    }

    return this.generateMockMentorReply(question, context)
  }

  async *askMentorQuestionStream(question, context = {}) {
    const isMock = !env.OPENAI_API_KEY || env.OPENAI_API_KEY === 'your_openai_api_key_here' || env.OPENAI_API_KEY === 'mock_key'

    if (!isMock) {
      try {
        const prompt = `
Learner Question: "${question}"
Learner Context (active roadmap/goals): ${JSON.stringify(context)}

Provide a supportive, constructive, and action-oriented mentorship-style response. Focus on giving practical steps and encouraging the learner. Keep it under 300 words.
        `
        const stream = await this.client.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: 'You are a supportive and expert AI mentor for software engineers and college students.' },
            { role: 'user', content: prompt },
          ],
          max_tokens: 500,
          stream: true,
        })

        for await (const chunk of stream) {
          const content = chunk.choices?.[0]?.delta?.content || ''
          if (content) yield content
        }
        return
      } catch (error) {
        logger.warn(`OpenAI askMentorQuestionStream failed: ${error.message}. Falling back to mock streaming.`)
      }
    }

    yield* super.askMentorQuestionStream(question, context)
  }
}

export default OpenAIProvider
