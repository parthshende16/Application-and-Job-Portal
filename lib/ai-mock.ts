// lib/ai-mock.ts
// Simulated AI interview engine — no API key required.
// Contains curated question banks and context-aware feedback generation.

export type InterviewRole = 'SDE' | 'PM' | 'Data Science' | 'HR' | 'DevOps';

interface Question {
  text: string;
  followUps: string[];
  topic: string;
}

const questionBank: Record<InterviewRole, Question[]> = {
  SDE: [
    {
      text: "Let's start with a warm-up. Can you walk me through your most recent project and the key technical decisions you made?",
      followUps: ["What were the trade-offs?", "How did you handle scalability?", "What would you do differently?"],
      topic: 'experience'
    },
    {
      text: "Explain the difference between REST and GraphQL. When would you choose one over the other?",
      followUps: ["How does caching differ?", "What about real-time use cases?"],
      topic: 'system-design'
    },
    {
      text: "You're tasked with designing a URL shortener (like bit.ly). Walk me through your approach.",
      followUps: ["How would you handle 1 million concurrent users?", "What database would you pick and why?", "How do you generate short URLs?"],
      topic: 'system-design'
    },
    {
      text: "Explain the time and space complexity of your favorite sorting algorithm and when you'd use it.",
      followUps: ["When would QuickSort outperform MergeSort?", "What's a stable sort and when does it matter?"],
      topic: 'algorithms'
    },
    {
      text: "How does a HashMap work internally? What happens during a hash collision?",
      followUps: ["What's the worst-case time complexity?", "How does Java's HashMap resize?"],
      topic: 'data-structures'
    },
    {
      text: "Describe a situation where you had to debug a production issue under pressure. What was your process?",
      followUps: ["How did you prevent it from happening again?", "How did you communicate with stakeholders?"],
      topic: 'behavioral'
    },
    {
      text: "What are SOLID principles? Give me a real example of applying one in your code.",
      followUps: ["Which one do you find hardest to follow?", "How do microservices relate to SOLID?"],
      topic: 'oop'
    },
    {
      text: "How would you implement a rate limiter for an API? Walk me through different strategies.",
      followUps: ["How does token bucket differ from leaky bucket?", "How do you handle distributed rate limiting?"],
      topic: 'system-design'
    },
  ],
  PM: [
    {
      text: "Tell me about a product you worked on that failed. What did you learn from it?",
      followUps: ["How did you communicate the failure to stakeholders?", "What KPIs were you tracking?"],
      topic: 'behavioral'
    },
    {
      text: "How would you prioritize features when you have 10 requests and time for only 3?",
      followUps: ["What frameworks do you use? (RICE, MoSCoW?)", "How do you handle pushback from engineering?"],
      topic: 'prioritization'
    },
    {
      text: "Walk me through how you'd design a notification feature for a social media app.",
      followUps: ["How do you determine what's worth notifying?", "How do you measure success?"],
      topic: 'product-design'
    },
    {
      text: "A key metric drops 15% overnight. Walk me through your investigation process.",
      followUps: ["What would you check first?", "How do you rule out a data pipeline issue?"],
      topic: 'metrics'
    },
    {
      text: "How do you approach user research? Give me a specific example.",
      followUps: ["When is qualitative research better than quantitative?", "How do you synthesize conflicting feedback?"],
      topic: 'research'
    },
    {
      text: "Tell me about a time you had to say no to a stakeholder request. How did you handle it?",
      followUps: ["What was the outcome?", "What would you do differently?"],
      topic: 'communication'
    },
  ],
  'Data Science': [
    {
      text: "Explain the bias-variance tradeoff in machine learning. How do you handle it in practice?",
      followUps: ["Can you give a concrete example?", "How does regularization help?"],
      topic: 'ml-fundamentals'
    },
    {
      text: "Walk me through how you'd build a churn prediction model from scratch.",
      followUps: ["What features would you engineer?", "How would you handle class imbalance?"],
      topic: 'ml-project'
    },
    {
      text: "Explain gradient descent. What are the differences between batch, mini-batch, and stochastic?",
      followUps: ["When might SGD outperform batch GD?", "What is the learning rate and how do you tune it?"],
      topic: 'deep-learning'
    },
    {
      text: "How would you A/B test a new recommendation algorithm? What metrics would you track?",
      followUps: ["How long would you run the test?", "What are common pitfalls in A/B testing?"],
      topic: 'experimentation'
    },
    {
      text: "A dataset has 30% missing values. Walk me through your approach.",
      followUps: ["When would you drop vs impute?", "How does the type of missingness affect your strategy?"],
      topic: 'data-cleaning'
    },
  ],
  HR: [
    {
      text: "Tell me about yourself and why you're interested in this role.",
      followUps: ["What specifically excites you about our company?", "How does this align with your 5-year plan?"],
      topic: 'introduction'
    },
    {
      text: "Describe a time when you had a conflict with a coworker. How did you resolve it?",
      followUps: ["What was the root cause?", "What would you do differently?"],
      topic: 'conflict'
    },
    {
      text: "What is your greatest professional weakness? How are you addressing it?",
      followUps: ["Give me a specific example where it affected your work.", "What progress have you made?"],
      topic: 'self-awareness'
    },
    {
      text: "Give me an example of when you led a project under tight deadlines. How did you manage it?",
      followUps: ["How did you prioritize?", "How did you communicate progress?"],
      topic: 'leadership'
    },
    {
      text: "Where do you see yourself in 5 years?",
      followUps: ["How does this role help you get there?", "What skills do you want to develop?"],
      topic: 'growth'
    },
  ],
  DevOps: [
    {
      text: "Walk me through a CI/CD pipeline you've built or improved significantly.",
      followUps: ["What tools did you use?", "How did you measure the improvement?"],
      topic: 'ci-cd'
    },
    {
      text: "Explain the difference between Docker and Kubernetes. When do you need Kubernetes?",
      followUps: ["What is a pod?", "How do you handle stateful apps in K8s?"],
      topic: 'containers'
    },
    {
      text: "How would you ensure zero-downtime deployments for a critical service?",
      followUps: ["What's blue-green vs canary deployment?", "How do you handle database migrations?"],
      topic: 'deployment'
    },
  ],
};

// Feedback templates based on answer length and content
const feedbackTemplates = {
  great: [
    "Excellent answer! You covered the key points clearly. {specific}",
    "Strong response! Your explanation shows solid understanding. {specific}",
    "Very well articulated. {specific} Let's dive a bit deeper.",
  ],
  good: [
    "Good answer overall. {specific} You could also mention {missing}.",
    "Solid foundation. {specific} One thing to add: {missing}.",
    "You're on the right track. {specific} Consider also discussing {missing}.",
  ],
  needsWork: [
    "Decent start, but let's refine this. {specific} Think about {missing}.",
    "You've touched on some points, but {missing} is important to mention.",
    "I see what you're going for. Let me help — {specific}. Also consider {missing}.",
  ],
};

const specificFeedback: Record<string, string[]> = {
  'system-design': [
    "Your scalability thinking is strong.",
    "Good mention of trade-offs.",
    "You correctly identified the bottleneck.",
  ],
  'algorithms': [
    "Your complexity analysis is accurate.",
    "Good intuition on when to apply this.",
    "Nice real-world connection.",
  ],
  'behavioral': [
    "Strong use of the STAR method.",
    "Good self-awareness in your reflection.",
    "Clear communication of impact.",
  ],
  'ml-fundamentals': [
    "Your intuition on the math is solid.",
    "Good practical application.",
    "Nice connection to real-world problems.",
  ],
  default: [
    "Clear and structured response.",
    "Good depth of explanation.",
    "Well-organized thoughts.",
  ],
};

const missingPoints: Record<string, string[]> = {
  'system-design': [
    "the CAP theorem implications",
    "caching strategies",
    "load balancing",
    "database sharding",
  ],
  'algorithms': [
    "edge cases",
    "space complexity",
    "alternative approaches",
    "real-world constraints",
  ],
  'behavioral': [
    "the specific outcome/metrics",
    "what you learned",
    "how you'd approach it differently",
  ],
  default: [
    "specific examples",
    "potential trade-offs",
    "alternative perspectives",
  ],
};

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateFeedback(userAnswer: string, question: Question): string {
  const wordCount = userAnswer.split(' ').filter(w => w.length > 0).length;
  const topic = question.topic;
  
  const specifics = specificFeedback[topic] || specificFeedback.default;
  const missing = missingPoints[topic] || missingPoints.default;
  
  let template: string;
  let prefix: string;
  
  if (wordCount > 60) {
    template = pickRandom(feedbackTemplates.great);
    prefix = "✅ ";
  } else if (wordCount > 25) {
    template = pickRandom(feedbackTemplates.good);
    prefix = "👍 ";
  } else {
    template = pickRandom(feedbackTemplates.needsWork);
    prefix = "💡 ";
  }
  
  const feedback = template
    .replace('{specific}', pickRandom(specifics))
    .replace('{missing}', pickRandom(missing));
  
  // Add a follow-up question
  const followUp = question.followUps.length > 0
    ? `\n\n**Follow-up:** ${pickRandom(question.followUps)}`
    : '';
  
  return prefix + feedback + followUp;
}

// ─── Main AI Engine ───────────────────────────────────────────────────────────

export interface Message {
  role: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

export interface InterviewState {
  role: InterviewRole;
  currentQuestionIndex: number;
  questions: Question[];
  messages: Message[];
  isComplete: boolean;
}

export function createInterview(role: InterviewRole): InterviewState {
  const allQuestions = questionBank[role] || questionBank.SDE;
  // Shuffle and pick 5-6 questions
  const shuffled = [...allQuestions].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, Math.min(6, shuffled.length));
  
  const greeting = getGreeting(role);
  
  return {
    role,
    currentQuestionIndex: 0,
    questions: selected,
    messages: [{
      role: 'ai',
      content: greeting,
      timestamp: new Date(),
    }],
    isComplete: false,
  };
}

function getGreeting(role: InterviewRole): string {
  const greetings: Record<InterviewRole, string> = {
    SDE: `👋 **Welcome to your SDE Interview!**\n\nI'm your AI interviewer today. We'll cover topics like system design, data structures, algorithms, and behavioral questions.\n\nThis session has about 5-6 questions. Answer as you would in a real interview — there's no rush. Take your time to think before responding.\n\nLet's begin! 🚀`,
    PM: `👋 **Welcome to your Product Manager Interview!**\n\nI'm your AI interviewer. Today we'll explore your product thinking, prioritization skills, and past experiences.\n\nExpect questions on product design, metrics, and stakeholder management. Answer honestly — I'm here to help you improve.\n\nLet's get started! 🎯`,
    'Data Science': `👋 **Welcome to your Data Science Interview!**\n\nI'm your AI interviewer. We'll cover machine learning concepts, statistics, data wrangling, and real-world ML projects.\n\nBe specific with your answers and use examples where possible. This will make your responses much stronger.\n\nAlright, let's dive in! 📊`,
    HR: `👋 **Welcome to your HR/Behavioral Interview!**\n\nI'm your AI interviewer. We'll focus on behavioral questions, communication style, and cultural fit.\n\nUse the **STAR method** (Situation, Task, Action, Result) for your answers. It'll help you structure your thoughts clearly.\n\nLet's begin! 💼`,
    DevOps: `👋 **Welcome to your DevOps Interview!**\n\nI'm your AI interviewer. We'll cover CI/CD, containerization, cloud infrastructure, and deployment strategies.\n\nFeel free to reference specific tools and real projects you've worked on.\n\nLet's start! ⚙️`,
  };
  
  const intro = greetings[role];
  return intro;
}

export function processUserAnswer(
  state: InterviewState,
  userAnswer: string
): { updatedState: InterviewState; aiResponse: string } {
  const currentQuestion = state.questions[state.currentQuestionIndex];
  
  // Generate feedback on the answer
  const feedback = generateFeedback(userAnswer, currentQuestion);
  
  const nextIndex = state.currentQuestionIndex + 1;
  const isComplete = nextIndex >= state.questions.length;
  
  let aiResponse = feedback;
  
  if (!isComplete) {
    const nextQuestion = state.questions[nextIndex];
    aiResponse += `\n\n---\n\n**Question ${nextIndex + 1} of ${state.questions.length}:** ${nextQuestion.text}`;
  } else {
    const score = Math.floor(Math.random() * 25) + 70; // 70-95 range
    aiResponse += `\n\n---\n\n🎉 **Interview Complete!**\n\nYou've answered all ${state.questions.length} questions. Your estimated performance score: **${score}/100**\n\n**What to focus on next:**\n- Review your answers and expand on areas that felt weak\n- Practice more questions in the ${state.role} track\n- Consider doing a company-specific prep session\n\nGreat work today! 💪`;
  }
  
  const aiMessage: Message = {
    role: 'ai',
    content: aiResponse,
    timestamp: new Date(),
  };
  
  const userMessage: Message = {
    role: 'user',
    content: userAnswer,
    timestamp: new Date(),
  };
  
  const updatedMessages = [...state.messages, userMessage, aiMessage];
  
  // First message is greeting, then ask first question if this is first answer
  let updatedQuestionIndex = nextIndex;
  
  const updatedState: InterviewState = {
    ...state,
    currentQuestionIndex: updatedQuestionIndex,
    messages: updatedMessages,
    isComplete,
  };
  
  return { updatedState, aiResponse };
}

export function getFirstQuestion(state: InterviewState): string {
  if (state.questions.length === 0) return "No questions available.";
  return `**Question 1 of ${state.questions.length}:** ${state.questions[0].text}`;
}

export { questionBank };
