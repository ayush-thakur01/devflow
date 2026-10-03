import env from '../config/env.js'
import OpenAIProvider from './ai/openai.provider.js'
import GeminiProvider from './ai/gemini.provider.js'

const providers = {
  openai: OpenAIProvider,
  gemini: GeminiProvider,
}

const providerName = (env.AI_PROVIDER || 'openai').toLowerCase()
const Provider = providers[providerName]

if (!Provider) {
  throw new Error(`Unsupported AI provider: ${providerName}`)
}

const provider = new Provider()

const generateRoadmap = async (goal, options = {}) => {
  return provider.generateRoadmap(goal, options)
}

const askMentorQuestion = async (question, context = {}) => {
  return provider.askMentorQuestion(question, context)
}

const askMentorQuestionStream = async function* (question, context = {}) {
  yield* provider.askMentorQuestionStream(question, context)
}

const summarizeNote = async (content) => {
  return provider.summarizeNote(content)
}

const suggestTasks = async (context) => {
  return provider.suggestTasks(context)
}

const generateQuiz = async (content) => {
  return provider.generateQuiz(content)
}

const reviewCode = async (code) => {
  return provider.reviewCode(code)
}

export default { generateRoadmap, askMentorQuestion, askMentorQuestionStream, summarizeNote, suggestTasks, generateQuiz, reviewCode }
