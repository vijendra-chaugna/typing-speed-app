import { useState, useCallback } from 'react'

const TEXTS = {
  15: [
    "The quick brown fox jumps over the lazy dog by the riverbank.",
    "Speed is nothing without control and precision in your work.",
    "Practice makes perfect when you focus on accuracy above all.",
    "Every keystroke matters when the clock is ticking down fast.",
  ],
  30: [
    "Programming is the art of telling another human what one wants the computer to do. It requires clarity, logic, and a deep understanding of the problem at hand.",
    "The best way to predict the future is to invent it. Start building your ideas today and never wait for the perfect moment to begin your journey.",
    "Simplicity is the soul of efficiency. Remove everything that does not serve the user directly and focus only on what truly matters in your design.",
    "A good programmer looks both ways before crossing a one-way street. Always test your assumptions and never trust that things will just work out.",
  ],
  60: [
    "The difference between a good developer and a great one is not the tools they use but the way they think through problems. Great developers break complex challenges into smaller pieces, tackle each one methodically, and always keep the end user in mind. They write code that is easy to read, easy to maintain, and easy to extend.",
    "Typing speed is a skill that improves with consistent daily practice. The key is not to rush but to build muscle memory through repetition. Focus on accuracy first and let speed follow naturally over time. Many professional typists started slowly and built up to over one hundred words per minute through patient and deliberate effort.",
    "In the world of software engineering, communication is just as important as coding ability. The best engineers can explain their ideas clearly to both technical and non-technical audiences. They write documentation that others can follow, give feedback that helps their team grow, and always seek to understand before being understood.",
    "Every great product starts with a clear understanding of the user's needs. Designers and developers who obsess over the user experience create products that people love to use. They test early, iterate often, and are never afraid to throw away work that does not serve the people they are building for.",
  ],
  120: [
    "The history of computing is a story of remarkable human ingenuity and relentless curiosity. From the earliest mechanical calculators to modern artificial intelligence, each generation of engineers and scientists has built upon the work of those who came before. The transistor replaced the vacuum tube, the microprocessor replaced the room-sized computer, and today we carry more computing power in our pockets than existed in the entire world just fifty years ago. This progress did not happen by accident. It was driven by people who refused to accept the limitations of their time and dared to imagine a different future.",
    "Touch typing is one of the most valuable skills you can develop as a knowledge worker. When you type without looking at the keyboard, your fingers move on instinct and your mind is free to focus entirely on the ideas you are trying to express. Learning this skill takes time and patience. You will make many mistakes at first and your speed will drop before it rises. But if you commit to the practice and trust the process, you will eventually reach a point where your thoughts flow directly from your mind to the screen without any friction slowing you down.",
    "Open source software has transformed the technology industry in ways that few could have predicted. What began as a movement of idealistic programmers sharing code freely has become the foundation upon which much of the modern internet is built. Companies that once viewed open source as a threat now contribute millions of lines of code to public repositories. The collaborative model has proven that given enough eyes, all bugs are shallow, and that the collective intelligence of a global community of developers can produce software of extraordinary quality and reliability.",
    "The most important quality in a software engineer is not the ability to write clever code but the ability to solve real problems for real people. Technology is only valuable insofar as it improves someone's life or makes some task easier or more enjoyable. Engineers who lose sight of this and become focused purely on technical elegance often build systems that are impressive to other engineers but useless or frustrating to the people who are supposed to benefit from them. Always start with the problem, not the solution.",
  ],
}

export function useRandomText(duration = 60) {
  const getRandomText = useCallback((dur) => {
    const options = TEXTS[dur] || TEXTS[60]
    return options[Math.floor(Math.random() * options.length)]
  }, [])

  const [text, setText] = useState(() => getRandomText(duration))

  const refresh = useCallback(() => {
    setText(prev => {
      const options = TEXTS[duration] || TEXTS[60]
      // Pick a different text than current
      const others = options.filter(t => t !== prev)
      return others[Math.floor(Math.random() * others.length)]
    })
  }, [duration])

  const switchDuration = useCallback((dur) => {
    setText(getRandomText(dur))
  }, [getRandomText])

  return { text, refresh, switchDuration }
}