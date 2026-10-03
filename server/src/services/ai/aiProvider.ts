class AIProvider {
  async summarizeNote(content) {
    throw new Error('summarizeNote is not implemented')
  }

  async generateRoadmap(goal, _options = {}) {
    throw new Error('generateRoadmap is not implemented')
  }

  async askMentorQuestion(question, _context = {}) {
    throw new Error('askMentorQuestion is not implemented')
  }

  async *askMentorQuestionStream(question, context = {}) {
    const response: any = await this.askMentorQuestion(question, context)
    const full = response || ''
    const words = full.split(' ')
    for (let i = 0; i < words.length; i++) {
      yield (i > 0 ? ' ' : '') + words[i]
      await new Promise((r) => setTimeout(r, 25))
    }
  }

  generateMockRoadmap(goal, difficulty) {
    const cleanGoal = goal.trim()
    return {
      title: `Mastering ${cleanGoal}`,
      description: `A structured learning journey designed to take you from a ${difficulty} to advanced proficiency in ${cleanGoal}.`,
      difficulty,
      estimatedHours: 42,
      modules: [
        {
          title: `Phase 1: Foundations of ${cleanGoal}`,
          description: `Getting started with core concepts, initial setup, and basic syntax of ${cleanGoal}.`,
          order: 1,
          estimatedHours: 12,
          difficulty,
          topics: [
            { title: `Introduction to ${cleanGoal}`, description: `Understanding why we use ${cleanGoal}, the main ecosystem, and setting up the environment.`, priority: 'high', estimatedMinutes: 45, resources: ['Official documentation', 'Crash course tutorial video'], notes: '' },
            { title: 'Core Syntax & Principles', description: 'Working with the basic building blocks, variables, operations, and basic functions.', priority: 'high', estimatedMinutes: 90, resources: ['Interactive code exercise', 'Syntax cheatsheet'], notes: '' },
            { title: 'Creating Your First Demo', description: 'Putting it all together by building a minimal hello-world style project.', priority: 'medium', estimatedMinutes: 120, resources: ['Step-by-step tutorial repo'], notes: '' },
          ],
        },
        {
          title: 'Phase 2: Deep Dive & Intermediate Features',
          description: 'Exploring standard features, state management, asynchronous operations, and best practices.',
          order: 2,
          estimatedHours: 18,
          difficulty: 'intermediate',
          topics: [
            { title: 'Asynchronous Logic & APIs', description: 'How to handle data retrieval, error catching, and connecting to external modules.', priority: 'high', estimatedMinutes: 120, resources: ['MDN Guide', 'API integration walk-through'], notes: '' },
            { title: 'Design Patterns & Organization', description: 'Structuring your application correctly to ensure readability and easy refactoring.', priority: 'medium', estimatedMinutes: 90, resources: ['Clean Code handbook excerpt'], notes: '' },
          ],
        },
        {
          title: 'Phase 3: Advanced Optimization & Deployment',
          description: 'Testing, performance tuning, security considerations, and production deployment.',
          order: 3,
          estimatedHours: 12,
          difficulty: 'advanced',
          topics: [
            { title: 'Unit Testing & Quality Assurance', description: 'Writing tests to confirm logic validity and building CI/CD test gates.', priority: 'medium', estimatedMinutes: 90, resources: ['Testing library docs', 'Mocking cheat sheet'], notes: '' },
            { title: 'Deployment & Live Hosting', description: 'Configuring production build, hosting on cloud platforms, and setting up monitoring.', priority: 'high', estimatedMinutes: 120, resources: ['Vercel deployment guide', 'Netlify / Render tutorial'], notes: '' },
          ],
        },
      ],
      resources: ['GitHub Roadmap Repository', 'Developer Roadmap Community Guide'],
      projects: [`Build a responsive ${cleanGoal} dashboard tracker.`, `Develop a custom API integrating ${cleanGoal} with database systems.`],
    }
  }

  generateMockSummary(content) {
    const words = content.split(/\s+/)
    if (words.length <= 50) return content
    const summary = words.slice(0, 40).join(' ') + '...'
    return `**Summary:** ${summary}\n\n> *Auto-generated summary (mock mode). For a better summary, configure an AI provider.*`
  }

  generateMockSuggestions(context) {
    const { tasks, notes, roadmap } = context
    const suggestions = []
    const pendingTasks = (tasks || []).filter(t => t.status !== 'completed')
    const uncompletedTopics = []

    if (roadmap?.modules) {
      roadmap.modules.forEach(mod => {
        mod.topics?.forEach(topic => {
          if (!topic.completed) uncompletedTopics.push({ module: mod.title, topic: topic.title })
        })
      })
    }

    if (pendingTasks.length === 0) {
      suggestions.push({ title: 'Create a daily learning task', reason: 'You have no pending tasks. Stay consistent!', priority: 'medium', type: 'task' })
    }
    if (uncompletedTopics.length > 0) {
      const next = uncompletedTopics[0]
      suggestions.push({ title: `Study: ${next.topic}`, reason: `Next up in your "${next.module}" module`, priority: 'high', type: 'learning' })
    }
    if ((notes || []).length > 0) {
      const recentNote = notes[0]
      suggestions.push({ title: `Review notes: ${recentNote.title}`, reason: 'Reinforce what you recently learned', priority: 'low', type: 'review' })
    }
    if (suggestions.length === 0) {
      suggestions.push({ title: 'Start a new learning roadmap', reason: 'Explore a new topic to grow your skills', priority: 'medium', type: 'exploration' })
    }
    return suggestions
  }

  generateMockQuiz(content) {
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 10)
    const questions = sentences.slice(0, 3).map((s, i) => ({
      question: `What is the key point of: "${s.trim().substring(0, 80)}..."?`,
      options: ['Correct understanding', 'Common misconception', 'Related concept', 'Unrelated topic'],
      correctIndex: 0,
      explanation: `Based on the content, the correct answer relates to: ${s.trim().substring(0, 60)}.`,
    }))
    if (questions.length === 0) {
      questions.push({ question: 'No content available to generate questions from.', options: ['Add more content'], correctIndex: 0, explanation: 'Please provide content first.' })
    }
    return questions
  }

  generateMockCodeReview(code) {
    const issues = []
    if (code.includes('var ')) issues.push({ line: 'N/A', severity: 'warning', message: 'Use `const` or `let` instead of `var` for better scoping.' })
    if (code.includes('==') && !code.includes('===')) issues.push({ line: 'N/A', severity: 'warning', message: 'Prefer strict equality `===` over loose equality `==`.' })
    if (code.length > 500) issues.push({ line: 'N/A', severity: 'info', message: 'Consider breaking this into smaller functions for readability.' })
    if (code.includes('console.log')) issues.push({ line: 'N/A', severity: 'info', message: 'Remove console.log statements before production.' })
    if (issues.length === 0) issues.push({ line: 'N/A', severity: 'info', message: 'Code looks clean! No major issues found.' })
    return { summary: `Reviewed ${code.split('\n').length} lines of code. Found ${issues.length} suggestion(s).`, issues }
  }

  generateMockMentorReply(question, _context) {
    const q = question.toLowerCase()
    if (q.includes('burnout') || q.includes('tired') || q.includes('motivation')) {
      return `Hey there! It's completely normal to feel fatigued or hit a wall. Learning complex skills is a marathon, not a sprint. Here are three quick actions to help:

1. **Step away for 24 hours**: Give your brain time to consolidate what you've learned.
2. **Reduce your session time**: Focus on just 20 minutes of active learning per day using the Pomodoro technique.
3. **Celebrate small wins**: Complete a single, tiny topic today and check it off.

You're making progress. Let me know if you want to break your next module into even smaller pieces!`
    }
    if (q.includes('project') || q.includes('portfolio') || q.includes('build')) {
      return `Projects are the single best way to cement your knowledge! Since you're working towards your goals, I recommend building a project that solves a personal problem.

For instance, you could build a custom tracker or a developer portfolio containing small, interactive utility apps. Focus on these steps:
1. Outline the core features first (keep it minimal!).
2. Code the layout and structural components.
3. Add user interaction and store persistent state.

Would you like me to help draft a technical specification for a starter project?`
    }
    return `Great question! When learning new concepts, I highly recommend adopting a active-recall approach:

1. **Summarize in your own words**: After reading documentation, write down a 2-sentence summary without looking.
2. **Build a sandbox**: Open up a blank environment and try to implement the concept from scratch.
3. **Compare and refine**: Go back to the docs to see what details you missed.

Let's keep pushing forward on your roadmap! Let me know if you need clarification on any specific sub-topics.`
  }
}

export default AIProvider
