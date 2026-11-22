// ─── Portfolio Data ──────────────────────────────────────────
export const DATA = {
  firstName: 'PRANAY',
  lastName: 'PATEL',
  fullName: 'Pranay Patel',
  role: 'FULL-STACK DEVELOPER',
  roleLine1: 'FULL-STACK',
  roleLine2: 'DEVELOPER.',

  greeting: "Hi, I'm Pranay Patel —",
  greetingGrey: "Hi, I'm",
  greetingInk: 'Pranay Patel —',

  tagline:
    'I build performant web apps, craft intuitive interfaces, and push pixels until every detail feels right. Code is my medium — the browser is my canvas.',

  manifesto:
    'I believe great software starts with *empathy* — understanding the people who will use it. I thrive at the intersection of *design* and *engineering*, turning complex problems into clean, elegant solutions. From architecting scalable back-ends to polishing micro-interactions on the front-end, I bring a *relentless* attention to detail and a bias for shipping. Every project is a chance to learn something *new* — and I never stop learning.',

  stats: [
    { label: 'CGPA', value: '7.18' },
    { label: 'PROJECTS BUILT', value: '4' },
    {
      label: 'EXTRA-CURRICULAR ACTIVITIES',
      value: '3',
      items: ['Event Organisation', 'Team Management', 'Basketball'],
    },
  ],

  projects: [
    {
      id: 1,
      category: 'WEB APP',
      name: 'CAREER CAFE',
      description:
        'A job application platform designed to help users discover career opportunities and submit applications, powered by Next.js, Supabase backend services, and Vercel hosting.',
      chips: ['Next.js', 'Supabase', 'Vercel'],
      github: '',
      visual: 'portal',
    },
    {
      id: 2,
      category: 'WEB APP',
      name: 'STUDENT PORTAL',
      description:
        'A comprehensive portal for managing student profiles, courses, schedules, and authentication.',
      chips: ['React', 'Firebase', 'Bootstrap', 'TypeScript'],
      github: 'https://github.com/pranay-1223',
      visual: 'gauge', // animated gauge mock
    },
    {
      id: 3,
      category: 'WEB APP',
      name: 'MEAL PLANNER',
      description:
        'An intuitive platform that plans meals based on dietary preferences with live recipe suggestions.',
      chips: ['React', 'REST APIs', 'Bootstrap', 'Node.js'],
      github: 'https://github.com/pranay-1223',
      visual: 'heatmap', // heatmap grid mock
    },
    {
      id: 4,
      category: 'AUTOMATION',
      name: 'PYTHON TOOLKIT',
      description:
        'Data-processing and automation scripts built during internships at CodTech and Vault of Codes.',
      chips: ['Python', 'Pandas', 'REST APIs', 'Automation'],
      github: 'https://github.com/pranay-1223',
      visual: 'chat', // chat bubbles mock
    },
  ],

  journey: [
    {
      year: '2024',
      title: 'PYTHON INTERN',
      org: 'CodTech & Vault of Codes',
    },
    {
      year: '2022',
      title: 'B.TECH CSE (AI-ML)',
      org: 'Vardhaman College of Engineering',
    },
    {
      year: '2020',
      title: 'INTERMEDIATE MPC',
      org: 'Resonance, Madhapur',
    },
  ],

  journeyStartYear: 2020,
  journeyEndYear: 2026,

  skills: [
    'React',
    'TypeScript',
    'Python',
    'Node.js',
    'Firebase',
    'HTML5',
    'CSS3',
    'JavaScript',
    'Git',
    'REST APIs',
    'Bootstrap',
    'C',
    'SQL',
    'Pandas',
    'DSA',
    'OOP',
  ],

  counters: [
    { value: 5, suffix: '', label: 'HACKATHONS', color: 'red' as const },
    { value: 3, suffix: '★', label: 'IIT-H RANK', color: 'black' as const },
    { value: 2, suffix: '+', label: 'INTERNSHIPS', color: 'black' as const },
    { value: 5, suffix: '+', label: 'PROJECTS', color: 'red' as const },
  ],

  certifications: [
    {
      title: 'Internship Completion',
      issuer: 'CodeTech',
      accent: false,
    },
    {
      title: 'Natural Language Processing',
      issuer: 'Great Learning',
      accent: false,
    },
    {
      title: 'I HACK Hackathon',
      issuer: 'Participant',
      accent: true,
    },
    {
      title: '1st Prize — Short Film',
      issuer: 'ORTUS',
      accent: false,
    },
    {
      title: '1st Prize — IT Saviskar',
      issuer: 'VCE',
      accent: false,
    },
    {
      title: 'Top 3 — Competition',
      issuer: 'IIT Hyderabad',
      accent: true,
    },
  ],

  email: 'padalapranay999@gmail.com',
  emailName: 'padalapranay999',
  emailDomain: '@gmail.com',
  github: 'https://github.com/pranay-1223',
  githubLabel: 'GitHub',
  linkedin: 'https://linkedin.com/in/pranay-patel',
  linkedinLabel: 'LinkedIn',
  resumeUrl: './resume.pdf',
  resumeLabel: 'Résumé',
  phone: '', // intentionally empty per spec
} as const;

export type ProjectData = (typeof DATA.projects)[number];
export type JourneyItem = (typeof DATA.journey)[number];
export type CertData = (typeof DATA.certifications)[number];
export type CounterData = (typeof DATA.counters)[number];
