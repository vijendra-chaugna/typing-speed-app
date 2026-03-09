import { useRef, useEffect } from 'react'

export default function TypingArea({ targetText, charStates, input, onInput, finished }) {
  const taRef = useRef(null)

  useEffect(() => {
    if (!finished) taRef.current?.focus()
  }, [finished, targetText])

  return (
    <div
      className="relative cursor-text select-none"
      onClick={() => taRef.current?.focus()}
    >
      {/* Character display — larger text, better line height */}
      <p className="font-mono text-2xl leading-[2.6rem] tracking-wide break-words">
        {targetText.split('').map((ch, i) => {
          const state    = charStates[i]
          const isCursor = i === input.length

          let color = 'text-muted'
          if (state === 'correct') color = 'text-correct'
          if (state === 'wrong')   color = 'text-wrong bg-wrong/10 rounded-sm'

          return (
            <span key={i} className="relative">
              {isCursor && !finished && (
                <span className="caret absolute -left-px top-1 w-0.5 h-8 bg-accent rounded" />
              )}
              <span className={`${color} transition-colors duration-75`}>
                {ch === ' ' ? '\u00a0' : ch}
              </span>
            </span>
          )
        })}
      </p>

      {/* Hidden textarea */}
      <textarea
        ref={taRef}
        value={input}
        onChange={e => onInput(e.target.value)}
        disabled={finished}
        className="absolute inset-0 opacity-0 resize-none w-full h-full cursor-text"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck="false"
        autoComplete="off"
        aria-label="Typing area"
      />
    </div>
  )
}