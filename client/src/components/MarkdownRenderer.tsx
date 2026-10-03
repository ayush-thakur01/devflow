import ReactMarkdown from 'react-markdown'

const MarkdownRenderer = ({ content }) => {
  if (!content) {
    return <p className="text-surface-500 italic text-sm">No content written yet.</p>
  }
  return (
    <div className="prose prose-invert prose-sm max-w-none prose-headings:text-white prose-headings:font-semibold prose-a:text-brand-400 prose-a:no-underline hover:prose-a:text-brand-300 prose-strong:text-white prose-code:text-brand-300 prose-code:bg-surface-800/50 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-xs prose-pre:bg-surface-900 prose-pre:border prose-pre:border-surface-800/50 prose-pre:rounded-xl prose-blockquote:border-brand-400/30 prose-blockquote:text-surface-400">
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  )
}

export default MarkdownRenderer
