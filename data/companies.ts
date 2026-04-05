// data/companies.ts
// Static company interview question database

export interface CompanyQuestion {
  id: string;
  text: string;
  category: 'behavioral' | 'technical' | 'system-design' | 'culture';
  difficulty: 'easy' | 'medium' | 'hard';
  tip?: string;
}

export interface Company {
  id: string;
  name: string;
  logo: string;
  color: string;
  tagline: string;
  culture: string;
  interviewStyle: string;
  questions: CompanyQuestion[];
}

export const companies: Company[] = [
  {
    id: 'google',
    name: 'Google',
    logo: '🔍',
    color: '#4285f4',
    tagline: 'Organize the world\'s information',
    culture: 'Data-driven, innovation-focused, engineering excellence',
    interviewStyle: 'Heavy on algorithms and system design. Googliness (culture fit) rounds.',
    questions: [
      { id: 'g1', text: 'Design Google Search. How does it index the web and serve results in milliseconds?', category: 'system-design', difficulty: 'hard', tip: 'Focus on crawling, indexing (inverted index), ranking (PageRank), and serving infrastructure.' },
      { id: 'g2', text: 'How would you design YouTube\'s recommendation algorithm?', category: 'system-design', difficulty: 'hard', tip: 'Think about collaborative filtering, content-based filtering, and real-time personalization.' },
      { id: 'g3', text: 'Given an array of integers, find all pairs that sum to a target. Optimize for time and space.', category: 'technical', difficulty: 'medium', tip: 'HashMap approach gives O(n) time, O(n) space. Discuss trade-offs with two-pointer.' },
      { id: 'g4', text: 'Tell me about a time you had to convince a team to change direction. How did you do it?', category: 'behavioral', difficulty: 'medium', tip: 'Use STAR method. Emphasize data-driven persuasion.' },
      { id: 'g5', text: 'Implement LRU (Least Recently Used) cache with O(1) get and put operations.', category: 'technical', difficulty: 'hard', tip: 'Combine HashMap + Doubly Linked List for O(1) operations.' },
      { id: 'g6', text: 'If you were a product manager for Google Maps, what new feature would you prioritize next year?', category: 'culture', difficulty: 'medium', tip: 'Think about user impact, technical feasibility, and alignment with Google\'s mission.' },
      { id: 'g7', text: 'Design a distributed key-value store like Google Bigtable.', category: 'system-design', difficulty: 'hard', tip: 'Cover consistent hashing, replication, compaction, and read/write paths.' },
      { id: 'g8', text: 'What does "Don\'t be evil" mean to you in the context of AI products?', category: 'culture', difficulty: 'easy' },
    ],
  },
  {
    id: 'amazon',
    name: 'Amazon',
    logo: '📦',
    color: '#ff9900',
    tagline: 'Earth\'s most customer-centric company',
    culture: '16 Leadership Principles — every question maps to one.',
    interviewStyle: 'STAR-format behavioral + system design. LP alignment is critical.',
    questions: [
      { id: 'a1', text: 'Tell me about a time you dove deep into a problem to find the root cause.', category: 'behavioral', difficulty: 'medium', tip: 'LP: Dive Deep. Show how you went beyond surface-level symptoms.' },
      { id: 'a2', text: 'Describe a time you disagreed with your manager. What did you do?', category: 'behavioral', difficulty: 'medium', tip: 'LP: Have Backbone; Disagree and Commit. Show respectful, data-backed disagreement.' },
      { id: 'a3', text: 'Design Amazon\'s product recommendation system.', category: 'system-design', difficulty: 'hard', tip: 'Cover collaborative filtering, real-time personalization, A/B testing, and metrics.' },
      { id: 'a4', text: 'Tell me about a time you took ownership of a project that wasn\'t yours to solve.', category: 'behavioral', difficulty: 'medium', tip: 'LP: Ownership. Show end-to-end accountability.' },
      { id: 'a5', text: 'Design Amazon\'s order fulfillment system (from click to delivery).', category: 'system-design', difficulty: 'hard', tip: 'Inventory management, warehouse routing, logistics optimization, tracking.' },
      { id: 'a6', text: 'A critical service goes down on Black Friday. Walk me through your response.', category: 'technical', difficulty: 'hard', tip: 'Incident response: detection, triage, immediate mitigation, root cause, post-mortem.' },
      { id: 'a7', text: 'How would you improve customer experience for Amazon Prime members?', category: 'culture', difficulty: 'medium', tip: 'LP: Customer Obsession. Start with customer pain points, not product ideas.' },
      { id: 'a8', text: 'Tell me about the most innovative project you\'ve worked on.', category: 'behavioral', difficulty: 'medium', tip: 'LP: Invent and Simplify. Focus on the simplification/innovation aspect.' },
    ],
  },
  {
    id: 'microsoft',
    name: 'Microsoft',
    logo: '🪟',
    color: '#00a4ef',
    tagline: 'Empower every person on the planet',
    culture: 'Growth mindset, collaboration, inclusive culture',
    interviewStyle: 'Mix of coding, system design, and culture-fit. Growth mindset questions common.',
    questions: [
      { id: 'm1', text: 'Design a collaborative document editing system like Google Docs.', category: 'system-design', difficulty: 'hard', tip: 'Focus on OT (Operational Transformation) or CRDT, conflict resolution, real-time sync.' },
      { id: 'm2', text: 'Tell me about a time you had to learn something completely new in a short time frame.', category: 'behavioral', difficulty: 'medium', tip: 'Growth mindset. Show your learning process and how you applied it quickly.' },
      { id: 'm3', text: 'Implement a function to check if a binary tree is a valid BST.', category: 'technical', difficulty: 'medium', tip: 'Use in-order traversal or recursive bounds checking. Beware of the common mistake with just comparing parent/child.' },
      { id: 'm4', text: 'How would you design Azure\'s auto-scaling infrastructure?', category: 'system-design', difficulty: 'hard', tip: 'Cover metrics collection, threshold policies, horizontal/vertical scaling, cool-down periods.' },
      { id: 'm5', text: 'Describe a situation where you had to collaborate across teams with conflicting priorities.', category: 'behavioral', difficulty: 'medium', tip: 'Emphasize empathy, communication, and finding shared goals.' },
      { id: 'm6', text: 'How would you debug a memory leak in a production application?', category: 'technical', difficulty: 'hard', tip: 'Profiling tools, heap dumps, GC logs, reference tracking. Show systematic elimination.' },
      { id: 'm7', text: 'What would you improve about Microsoft Teams if you were the PM?', category: 'culture', difficulty: 'medium' },
    ],
  },
  {
    id: 'meta',
    name: 'Meta',
    logo: '🌐',
    color: '#0866ff',
    tagline: 'Connect the world',
    culture: 'Move fast, focus on impact, direct communication',
    interviewStyle: 'Heavy coding (2 rounds), system design, behavioral. Speed matters.',
    questions: [
      { id: 'me1', text: 'Design Facebook\'s News Feed ranking algorithm.', category: 'system-design', difficulty: 'hard', tip: 'Content scoring, candidate generation, re-ranking, personalization signals, engagement prediction.' },
      { id: 'me2', text: 'Find the longest substring without repeating characters.', category: 'technical', difficulty: 'medium', tip: 'Sliding window + HashMap. O(n) time, O(k) space where k is charset size.' },
      { id: 'me3', text: 'Tell me about a project where you had direct, measurable impact.', category: 'behavioral', difficulty: 'medium', tip: 'Meta values impact. Quantify everything: users affected, latency reduced, revenue generated.' },
      { id: 'me4', text: 'Design Instagram\'s photo storage and retrieval system for billions of photos.', category: 'system-design', difficulty: 'hard', tip: 'Object storage (CDN + S3-like), thumbnail generation pipeline, metadata DB, geo-distribution.' },
      { id: 'me5', text: 'How would you detect fake accounts on Facebook at scale?', category: 'system-design', difficulty: 'hard', tip: 'ML signals (behavior patterns, device fingerprint, social graph anomalies), rule-based + model ensemble.' },
      { id: 'me6', text: 'Serialize and deserialize a binary tree.', category: 'technical', difficulty: 'medium', tip: 'BFS or DFS with null markers. Avoid ambiguous representations.' },
      { id: 'me7', text: 'Tell me about a time you moved fast and it led to a mistake. What did you do?', category: 'behavioral', difficulty: 'medium', tip: 'Meta values moving fast. Show that you learned, fixed it, and built safeguards.' },
    ],
  },
  {
    id: 'apple',
    name: 'Apple',
    logo: '🍎',
    color: '#555555',
    tagline: 'Think Different',
    culture: 'Secrecy, perfection, user experience over all',
    interviewStyle: 'Deep dives on past work, design sensibility, attention to detail.',
    questions: [
      { id: 'ap1', text: 'Describe a time you insisted on quality when others wanted to ship faster.', category: 'behavioral', difficulty: 'medium', tip: 'Apple values getting it right over speed. Show passion for craft.' },
      { id: 'ap2', text: 'Design the health data sync system for Apple Watch and iPhone.', category: 'system-design', difficulty: 'hard', tip: 'Privacy-first architecture, on-device processing, minimal cloud sync, encryption.' },
      { id: 'ap3', text: 'How would you improve the iPhone accessibility features?', category: 'culture', difficulty: 'medium' },
      { id: 'ap4', text: 'Explain how you would implement smooth scrolling in a list with 10,000 items.', category: 'technical', difficulty: 'medium', tip: 'Virtual scrolling/windowing. Only render visible items + buffer. RecyclerView pattern.' },
      { id: 'ap5', text: 'Tell me about the last time you advocated for the user against a business decision.', category: 'behavioral', difficulty: 'hard' },
      { id: 'ap6', text: 'Design Siri\'s personal recommendation engine while preserving privacy.', category: 'system-design', difficulty: 'hard', tip: 'On-device ML, federated learning, differential privacy, minimal data collection.' },
    ],
  },
  {
    id: 'netflix',
    name: 'Netflix',
    logo: '🎬',
    color: '#e50914',
    tagline: 'Entertain the world',
    culture: 'Freedom and Responsibility, radical transparency, talent density',
    interviewStyle: 'Culture fit heavily weighted. 7 Netflix values. Keeper test.',
    questions: [
      { id: 'n1', text: 'Design Netflix\'s video streaming pipeline from upload to playback.', category: 'system-design', difficulty: 'hard', tip: 'Transcoding at upload, CDN (Open Connect), adaptive bitrate streaming (ABR), client-side player.' },
      { id: 'n2', text: 'How would you build Netflix\'s recommendation engine?', category: 'system-design', difficulty: 'hard', tip: 'Collaborative filtering, content-based signals, viewing history, A/B tested ranking models.' },
      { id: 'n3', text: 'Tell me about a time you made a high-judgment decision with incomplete information.', category: 'behavioral', difficulty: 'hard', tip: 'Netflix expects senior engineers to make judgment calls independently.' },
      { id: 'n4', text: 'A 5% drop in play rate is observed in South Asia. How do you investigate?', category: 'technical', difficulty: 'hard', tip: 'Segment by device, ISP, content type, time of day. Rule out CDN, A/B experiment, content issues.' },
      { id: 'n5', text: 'Describe a time you acted against the "safe" choice because you believed you were right.', category: 'behavioral', difficulty: 'medium', tip: 'Netflix values courageous integrity. Show outcome and reasoning.' },
      { id: 'n6', text: 'How do you decide what NOT to work on?', category: 'culture', difficulty: 'medium', tip: 'Opportunity cost, leverage, alignment with company goals.' },
    ],
  },
  {
    id: 'flipkart',
    name: 'Flipkart',
    logo: '🛒',
    color: '#2874f0',
    tagline: 'India\'s e-commerce leader',
    culture: 'Scale-focused, customer-first, fast execution',
    interviewStyle: 'System design for scale (Indian market), DSA, past project deep-dives.',
    questions: [
      { id: 'f1', text: 'Design Flipkart\'s flash sale system for events like Big Billion Day.', category: 'system-design', difficulty: 'hard', tip: 'Traffic spike handling, queue-based fairness, inventory reservation, payment gateway throttling.' },
      { id: 'f2', text: 'How would you build a search autocomplete for Flipkart\'s product catalog of 500M items?', category: 'system-design', difficulty: 'hard', tip: 'Trie data structure, Elasticsearch prefix queries, popularity-based ranking, caching top results.' },
      { id: 'f3', text: 'Tell me about a time you scaled a system to 10x load.', category: 'behavioral', difficulty: 'hard' },
      { id: 'f4', text: 'Design a coupon/voucher management system at scale.', category: 'system-design', difficulty: 'medium', tip: 'Unique code generation, validation pipeline, fraud detection, atomicity on redemption.' },
      { id: 'f5', text: 'Implement a function to find the k-th largest element in a stream.', category: 'technical', difficulty: 'medium', tip: 'Min-heap of size k. Maintain invariant on each new element.' },
      { id: 'f6', text: 'How would you reduce cart abandonment on Flipkart?', category: 'culture', difficulty: 'medium' },
    ],
  },
  {
    id: 'startups',
    name: 'Startup (General)',
    logo: '🚀',
    color: '#7c3aed',
    tagline: 'Move fast, break things, build the future',
    culture: 'Ownership, generalism, impact over process, resourcefulness',
    interviewStyle: 'Practical tasks, culture fit, ability to wear multiple hats, past impact.',
    questions: [
      { id: 's1', text: 'Tell me about the most impactful thing you\'ve built with limited resources.', category: 'behavioral', difficulty: 'medium', tip: 'Startups love resourcefulness. Show creativity under constraints.' },
      { id: 's2', text: 'How would you design the MVP architecture for a food delivery app?', category: 'system-design', difficulty: 'medium', tip: 'Focus on what to build first. Monolith is usually right for MVP. Identify first scaling bottleneck.' },
      { id: 's3', text: 'What\'s a product decision you disagreed with? What did you do instead?', category: 'behavioral', difficulty: 'medium' },
      { id: 's4', text: 'Design a notification system for a B2B SaaS product.', category: 'system-design', difficulty: 'medium', tip: 'In-app, email, webhook delivery. User preferences, retry logic, delivery guarantees.' },
      { id: 's5', text: 'How do you stay current with technology trends while still shipping product?', category: 'culture', difficulty: 'easy' },
      { id: 's6', text: 'What would you do in your first 30 days joining our team?', category: 'behavioral', difficulty: 'easy', tip: 'Show curiosity, structured onboarding, quick wins, longer-term vision.' },
    ],
  },
];

export const aiGeneratedPool: Record<string, string[]> = {
  google: [
    "How would you improve Google Maps for users in rural areas with poor connectivity?",
    "Design a system to detect and prevent distributed denial-of-service (DDoS) attacks at Google scale.",
    "How would you build a feature to detect copied content in Google Docs?",
    "Walk me through indexing a newly published web page in Google Search within seconds.",
    "How would you design Google Pay's fraud detection system?",
  ],
  amazon: [
    "Design Amazon's delivery prediction system — how do you tell customers 'Arrives by Tuesday'?",
    "How would you build a real-time inventory management system across 1000+ warehouses?",
    "Design the return and refund workflow at Amazon scale.",
    "How would you improve seller onboarding on the Amazon Marketplace?",
    "Tell me about a time you raised the bar for your team.",
  ],
  microsoft: [
    "How would you design Excel's collaborative editing feature?",
    "Design a system to detect software license violations at scale.",
    "How does Azure handle multi-region failover for critical workloads?",
    "How would you improve Microsoft 365 for remote-first teams?",
    "Design a real-time code collaboration feature for VS Code.",
  ],
  meta: [
    "How would you build a system to detect coordinated inauthentic behavior on Facebook?",
    "Design Meta's ad auction system — how do you pick which ad to show?",
    "How would you measure the 'health' of a Facebook Group community?",
    "Design WhatsApp's end-to-end encryption key exchange system.",
    "How would you build a real-time AR face filter pipeline for Instagram?",
  ],
  apple: [
    "How would you design iCloud's photo sync architecture ensuring privacy?",
    "Design an on-device Siri that learns your habits without sending data to Apple's servers.",
    "How would you improve the Apple Watch's battery life through software optimizations?",
    "Design the AirDrop discovery and transfer protocol.",
    "How would you implement the iPhone's 'stolen device protection' feature?",
  ],
  netflix: [
    "Design Netflix's A/B testing infrastructure for UI experiments.",
    "How would you reduce buffering for users on slow connections?",
    "Design a system to predict when a Netflix subscriber will churn.",
    "How would you build Netflix's download feature for offline viewing?",
    "Design caption/subtitle delivery for Netflix's global audience.",
  ],
  flipkart: [
    "How would you implement a real-time bidding system for Flipkart ads?",
    "Design Flipkart's hyperlocal delivery system for 2-hour delivery.",
    "How would you build a dynamic pricing engine for Flipkart products?",
    "Design Flipkart's seller rating and trust score system.",
    "How would you handle payment failures gracefully in the Flipkart checkout flow?",
  ],
  startups: [
    "How would you validate a new product idea with zero budget?",
    "Design a SaaS billing system supporting multiple pricing models.",
    "How do you decide when to refactor vs. rewrite a legacy codebase?",
    "How would you build a viral referral program into your product?",
    "How do you make technical decisions when you're both the engineer and the product owner?",
  ],
};

export default companies;
