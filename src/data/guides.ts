// SEO content hub. Each guide is genuinely useful, honestly written, and
// structured for featured snippets (concise definitional opener + scannable
// sections + verbatim FAQ questions). The "prove you can do the work" angle
// appears only where it's the real answer — never bolted on.

export interface GuideSection {
  heading: string;
  body: string[];
  list?: { ordered?: boolean; items: string[] };
}
export interface GuideFaq {
  q: string;
  a: string;
}
export interface GuideSource {
  label: string;
  url: string;
}
export interface Guide {
  slug: string;
  category: string;
  title: string;
  description: string;
  keywords: string[];
  datePublished: string;
  readingMins: number;
  dek: string; // snippet-optimized direct answer, sits under the H1
  sections: GuideSection[];
  faqs: GuideFaq[];
  sources: GuideSource[];
}

export const AUTHOR = {
  name: "Ammar, founder of FirstWeek",
  bio: "I was laid off and have no formal credentials. I built FirstWeek so capable people can prove they can do a job — instead of being filtered out by the paper they don't have.",
};

export const GUIDES: Guide[] = [
  {
    slug: "beat-ai-resume-screeners",
    category: "AI & hiring",
    title: "How to Beat AI Resume Screeners in 2026 (Real Tactics)",
    description:
      "AI screens 70%+ of resumes before a human sees them. Here's how ATS actually works in 2026 — and the honest tactics that get you past it.",
    keywords: [
      "beat AI resume screeners",
      "how to get past ATS 2026",
      "ATS resume optimization",
      "applicant tracking system tips",
    ],
    datePublished: "2026-06-21",
    readingMins: 6,
    dek: "To beat AI resume screeners in 2026, mirror the job description's real keywords to land around a 65–75% match, use a single-column layout with standard headings, and drop the old hacks (white text, keyword stuffing) that parsers now flag. The screener only gets you a seat — you still have to do the job.",
    sections: [
      {
        heading: "How AI resume screeners actually work in 2026",
        body: [
          "Most mid-to-large employers run every application through an applicant tracking system (ATS) before a recruiter reads a word. In 2026 those systems do three things in order: parse your resume into structured fields, score it against the job description's keywords and requirements, then rank you against everyone else in the pile.",
          "The important shift is that ranking is now relative. You're not passing a fixed bar — you're competing for the top slots in a stack that's bigger than ever, because AI auto-apply tools have flooded postings with applications. Being \"good enough\" no longer surfaces you; being a clear match does.",
        ],
      },
      {
        heading: "The 65–75% keyword-match sweet spot",
        body: [
          "Aim to match roughly two-thirds to three-quarters of the role's core skills and responsibilities in your own words. Counterintuitively, a 100% match can hurt — it reads as keyword-mirroring and, more importantly, sets you up for an interview about work you can't actually do.",
          "Pull the keywords straight from the posting: the tools, skills, and outcomes it repeats. Use them where they're true for you, in the context of results you actually delivered.",
        ],
      },
      {
        heading: "Formatting that survives the parser",
        body: ["Parsers still choke on fancy layouts. Keep it boring and machine-readable:"],
        list: {
          items: [
            "One column. Multi-column layouts scramble the reading order.",
            "Standard section headings (\"Experience\", \"Skills\", \"Education\") — not clever labels.",
            "No tables, text boxes, headers/footers, or images for critical info.",
            "A common font and a .docx or text-based PDF (not a scanned/exported image).",
          ],
        },
      },
      {
        heading: "Dead hacks to stop using",
        body: [
          "White-text keywords, invisible keyword blocks, and stuffing the same term ten times are now actively detected and can flag your application as manipulative. They were never a good idea; in 2026 they're a liability. Modern parsers read semantics, not just exact strings, so honest, well-phrased relevance beats tricks.",
        ],
      },
      {
        heading: "The screener you can't game",
        body: [
          "Here's the uncomfortable part: passing the bot only gets you in the room. The real screen is the interview and the first 90 days, where you have to actually do the work. Plenty of keyword-optimized candidates get the interview and then can't answer how they'd approach the actual job.",
          "That's the gap worth closing before you apply. If you can do a realistic slice of the role — and see where you're strong and where you're shaky — you walk in able to talk about the work concretely, which no amount of resume tuning fakes.",
        ],
      },
    ],
    faqs: [
      {
        q: "Can AI detect keyword stuffing on a resume?",
        a: "Yes. Modern ATS and AI screeners read semantic context, not just exact matches, and many flag obvious stuffing, repeated terms, and hidden white text as manipulative. Use keywords honestly, in the context of real results.",
      },
      {
        q: "What keyword match percentage do you need to pass ATS?",
        a: "Aim for roughly 65–75% of the job description's core skills and requirements, phrased in your own words. A near-100% match reads as mirroring and risks an interview about work you can't actually do.",
      },
      {
        q: "Does a PDF or Word resume work better for ATS?",
        a: "Either works if it's text-based, not a scanned image. A simple, single-column .docx is the safest; a text-based PDF is fine. Avoid tables, columns, and graphics that confuse the parser.",
      },
    ],
    sources: [
      { label: "vBeyond — ATS resume optimization 2026", url: "https://www.vbeyond.com/blog/ats-resume-optimization-strategies-to-beat-the-bot-and-get-seen-by-recruiters/" },
    ],
  },

  {
    slug: "get-rehired-after-tech-layoff",
    category: "Layoffs",
    title: "Laid Off in Tech? How to Get Rehired in 2026",
    description:
      "Tech layoffs are running over 1,000/day in 2026 — yet hundreds of thousands of roles sit open. A direct, no-fluff playbook for getting rehired faster.",
    keywords: [
      "how to get a job after being laid off",
      "get rehired after layoff tech 2026",
      "tech layoffs 2026",
      "rehired after layoff",
    ],
    datePublished: "2026-06-21",
    readingMins: 7,
    dek: "To get rehired after a 2026 tech layoff: handle the first 72 hours (unemployment, severance, COBRA) without panic-applying, pick one AI-adjacent target role instead of spraying applications, rebuild your resume around outcomes, and prove you're still sharp by doing a slice of the target job — not just claiming you can.",
    sections: [
      {
        heading: "The first 72 hours: stabilize, don't panic-apply",
        body: [
          "Before you touch the job boards, lock down the basics: file for unemployment, read your severance and any non-compete carefully, sort out health coverage, and get your last paychecks and equity details in writing. Applying from a place of panic produces 200 generic applications and zero offers.",
          "Give yourself 48–72 hours to reset. The market is hard right now, but it is moving — clarity beats speed.",
        ],
      },
      {
        heading: "Understand the two-speed 2026 market",
        body: [
          "The 2026 market is split. Roles that are easy to automate are shrinking fast, while AI-adjacent roles — people who can direct, audit, and build on top of AI — are still hiring, sometimes urgently. Layoffs and large numbers of open roles are happening at the same time because the demand has shifted, not disappeared.",
          "Your job is to aim at the side that's hiring, using the experience you already have.",
        ],
      },
      {
        heading: "Pick one adjacent target early",
        body: [
          "Candidates who choose a direction get rehired faster than those who spray applications across unrelated roles. Pick one target role that's a half-step from what you did — same domain, more AI-leverage — and concentrate there.",
        ],
      },
      {
        heading: "Rebuild the resume around outcomes, not titles",
        body: [
          "Titles travel badly between companies; outcomes don't. Rewrite each role as the problem you owned, what you did, and the measurable result. \"Cut onboarding time 30%\" lands; \"responsible for onboarding\" doesn't.",
        ],
      },
      {
        heading: "Close the \"are they rusty?\" doubt",
        body: [
          "The quiet worry every hiring manager has about a laid-off candidate is whether you've kept your edge. You can't fix that by saying \"I'm a fast learner.\" You fix it by showing it.",
          "Doing a realistic simulation of the target role — the actual tasks, not trivia — gives you something concrete to talk about and proves your judgment is current. It turns \"trust me\" into \"here's how I'd approach your week one.\"",
        ],
      },
    ],
    faqs: [
      {
        q: "How long does it take to find a job after being laid off in 2026?",
        a: "It varies widely, but candidates who focus on one adjacent target role and lead with proof of ability tend to move faster than those who mass-apply. Expect a competitive market and plan for a focused, multi-week search rather than a quick rebound.",
      },
      {
        q: "Should you mention being laid off in an interview?",
        a: "Yes, briefly and without shame. Layoffs in 2026 are widely understood to be about budgets and AI shifts, not performance. State it in one neutral sentence and pivot to what you can do for this role.",
      },
      {
        q: "What tech jobs are still hiring despite layoffs?",
        a: "AI-adjacent roles — people who can direct, audit, integrate, and build on top of AI — plus security, data, and cloud roles remain in demand even as easily-automated positions shrink.",
      },
    ],
    sources: [
      { label: "TechTimes — Tech layoffs hit 1,115/day in 2026", url: "https://www.techtimes.com/articles/318466/20260616/tech-layoffs-hit-1115-day-2026-companies-cite-ai-cuts-fail-boost-returns.htm" },
      { label: "CBS News — AI layoffs and entry-level workers", url: "https://www.cbsnews.com/news/ai-layoffs-hiring-entry-level-workers/" },
    ],
  },

  {
    slug: "will-ai-take-my-job",
    category: "AI & work",
    title: "Will AI Take My Job? An Honest 2026 Answer",
    description:
      "Tens of thousands of jobs were cut to AI in 2026 — but execs admit some is \"AI washing.\" Here's what the data really says about your role, and what to do now.",
    keywords: [
      "will AI take my job",
      "is AI replacing jobs 2026",
      "what jobs will AI replace",
      "jobs safe from AI",
    ],
    datePublished: "2026-06-21",
    readingMins: 7,
    dek: "Will AI take your job? In 2026 the honest answer is: it depends which side of the line your work sits on. AI is automating predictable, rules-based tasks and hitting entry-level roles hardest, while augmenting work that needs human judgment. The hedge isn't predicting — it's being able to prove the judgment a role needs.",
    sections: [
      {
        heading: "The 2026 numbers, straight",
        body: [
          "AI is genuinely reshaping hiring: companies have attributed tens of thousands of cuts to automation, and entry-level postings have dropped sharply. But read the numbers with a skeptical eye — some executives have admitted to \"AI washing,\" using AI as the public reason for layoffs that were really about budgets, over-hiring, or returns that didn't materialize.",
          "So the truth is messier than \"AI is taking the jobs.\" Some roles are genuinely being automated; others are being cut and blamed on AI.",
        ],
      },
      {
        heading: "Why entry-level got hit hardest",
        body: [
          "The clearest casualty is the bottom rung. Junior and entry-level postings have fallen because the routine, well-defined tasks that used to train new hires are exactly what AI does cheaply. The result is \"experience creep\" — roles that used to be entry-level now ask for two or three years, which makes breaking in harder.",
        ],
      },
      {
        heading: "Automated vs. augmented: where's the line?",
        body: [
          "The fault line isn't \"technical vs. non-technical\" — it's predictable vs. judgment-heavy.",
        ],
        list: {
          items: [
            "More automatable: repetitive, rules-based, single-output tasks (basic data entry, templated first-draft writing, routine support replies).",
            "More augmented: work needing context, trade-offs, persuasion, and accountability (prioritization, stakeholder calls, ambiguous problems, anything where being wrong is costly).",
          ],
        },
      },
      {
        heading: "A quick self-audit",
        body: [
          "Ask of your role: how much of it is one predictable input producing one predictable output? If most of your day is that, the task (not necessarily you) is exposed — and your move is to climb toward the judgment work. If most of your day is ambiguous calls and tradeoffs, AI is more likely a tool that makes you faster than a replacement.",
        ],
      },
      {
        heading: "Proof beats prediction",
        body: [
          "Nobody can tell you with certainty whether your specific job survives. What you can control is being demonstrably able to do the judgment-heavy version of your work — the part AI can't take.",
          "That's the real hedge against automation anxiety: not a prediction, but evidence. Being able to sit down with a realistic version of the role you want and show your reasoning is worth more than any forecast about the future of work.",
        ],
      },
    ],
    faqs: [
      {
        q: "What jobs will AI replace first?",
        a: "Roles built on predictable, rules-based tasks with a single clear output — basic data entry, routine first-draft content, and templated support — are most exposed. Work requiring judgment, context, and accountability is being augmented rather than replaced.",
      },
      {
        q: "Is AI actually causing layoffs or are companies blaming it?",
        a: "Both. AI is genuinely automating some tasks, but executives have admitted to \"AI washing\" — citing AI as the reason for cuts that were really about budgets and over-hiring. Treat any single headline number with healthy skepticism.",
      },
      {
        q: "What jobs are safe from AI?",
        a: "No job is fully \"safe,\" but roles centered on judgment, ambiguity, persuasion, and accountability are far more resilient. The durable skill is being able to demonstrate that human judgment, not just claim it.",
      },
    ],
    sources: [
      { label: "CBS News — AI layoffs and entry-level workers", url: "https://www.cbsnews.com/news/ai-layoffs-hiring-entry-level-workers/" },
      { label: "Washington Monthly — How AI broke the entry-level job", url: "https://washingtonmonthly.com/2026/05/29/ai-entry-level-jobs-college-graduates/" },
    ],
  },

  {
    slug: "stand-out-when-ai-floods-job-applications",
    category: "Job search",
    title: "How to Stand Out When AI Floods Every Job",
    description:
      "Auto-apply tools mean thousands of near-identical applications per role. Here's how to actually stand out in 2026 when everyone sounds the same.",
    keywords: [
      "how to stand out in job applications 2026",
      "too many applicants AI",
      "stand out job application",
      "auto apply job tools",
    ],
    datePublished: "2026-06-21",
    readingMins: 6,
    dek: "To stand out when AI floods every job posting, stop competing on the same channel as the bots. Lead with evidence instead of adjectives, build a small portfolio of real work, use warm intros to skip the queue, and do an unprompted slice of the actual job — the one signal AI-generated applications can't fake.",
    sections: [
      {
        heading: "Why every applicant now looks identical",
        body: [
          "AI auto-apply tools and resume generators have made it trivial to fire off hundreds of polished, keyword-perfect applications. The predictable result: recruiters open a role and see a wall of near-identical, AI-written submissions. When everyone optimizes the same way, optimization stops being a differentiator.",
        ],
      },
      {
        heading: "Authenticity is the new scarce signal",
        body: [
          "The thing AI can't manufacture is specific, lived evidence that you can do this particular job. Recruiters in 2026 are actively hunting for signals that a human who actually understands the work is behind the application — because most of the pile doesn't clear that bar.",
        ],
      },
      {
        heading: "Show, don't claim",
        body: [
          "Adjectives are free, so they're worthless: \"detail-oriented,\" \"results-driven,\" and \"passionate\" appear on every AI-written resume. Evidence is expensive, so it stands out. Replace claims with artifacts and numbers wherever you can.",
        ],
      },
      {
        heading: "Build a 3–5 piece proof portfolio",
        body: [
          "You don't need formal experience to have proof. Assemble a handful of concrete pieces that show the work: a teardown, a sample analysis, a mock plan, a small project, or a worked solution to a problem the role faces. Even three strong pieces beat a perfect resume.",
        ],
      },
      {
        heading: "Do a slice of the actual job — unprompted",
        body: [
          "The strongest move is also the rarest: show up having already done a piece of the real work. Drafted the launch plan, modeled the cohort, triaged the support queue, written the spec — whatever the role actually does.",
          "This is exactly what FirstWeek produces: a simulation of the real tasks in a specific posting, scored honestly, that you can reference or attach. In a sea of identical applications, \"I already did a version of your week one — here's how I thought about it\" is the thing recruiters remember.",
        ],
      },
    ],
    faqs: [
      {
        q: "How do you stand out when hundreds of people apply for the same job?",
        a: "Compete on a different signal than the bots. Lead with concrete evidence and numbers, build a small portfolio of real work, get a warm introduction to skip the queue, and show up having already done a slice of the actual job.",
      },
      {
        q: "Do recruiters notice when you use AI to write your resume?",
        a: "Increasingly, yes — AI-written applications share a recognizable, generic voice, and recruiters are pattern-matching against it. Using AI to draft is fine; relying on it for specific, lived evidence of ability is what gives you away.",
      },
      {
        q: "What makes a job application stand out in 2026?",
        a: "Specific proof of ability for that exact role — artifacts, numbers, and evidence you can do the work — plus a human, non-generic voice and, ideally, a referral. Authenticity and demonstrated capability are the scarce signals.",
      },
    ],
    sources: [
      { label: "Fortune — Candidates bailing on AI interviews", url: "https://fortune.com/2026/05/04/4-in-10-job-candidates-bailed-hiring-rounds-required-ai-interview/" },
    ],
  },

  {
    slug: "tech-jobs-without-a-degree-2026",
    category: "No degree",
    title: "Tech Jobs Without a Degree: 2026 Real Guide",
    description:
      "Most tech roles no longer require a degree. Here's how skills-based hiring works in 2026 — and how to prove ability without the paper.",
    keywords: [
      "tech jobs no degree 2026",
      "skills based hiring no degree",
      "get a tech job without a degree",
      "no degree tech jobs",
    ],
    datePublished: "2026-06-21",
    readingMins: 7,
    dek: "You can get a tech job without a degree in 2026 because hiring has shifted to skills: a majority of employers now use skills assessments, and a shrinking share of tech roles require a degree. The catch is that you have to prove ability directly — with skills, projects, and demonstrated work instead of a diploma.",
    sections: [
      {
        heading: "Skills-based hiring is the 2026 story",
        body: [
          "The degree requirement has been quietly falling for years, and in 2026 a large majority of employers use some form of skills assessment in hiring. Many tech roles have dropped the four-year-degree filter entirely, because the degree turned out to be a weak predictor of who can actually do the work.",
          "That's good news if you can demonstrate ability — and harder if your whole plan was the credential.",
        ],
      },
      {
        heading: "Roles most open to no-degree candidates",
        body: ["Some paths have always been more skills-first than credential-first:"],
        list: {
          items: [
            "Support, success, and operations roles that reward judgment and communication.",
            "Data and analytics, where a portfolio of real analyses speaks loudest.",
            "Security, cloud, and IT, where certifications carry real weight.",
            "Software and automation roles, where shipped projects beat transcripts.",
          ],
        },
      },
      {
        heading: "Skills that actually open doors",
        body: [
          "Across all of these, a few skills move the needle in 2026: practical AI literacy (using AI tools well), scripting/automation, working with data, and the cloud/security fundamentals. You don't need all of them — you need provable competence in the ones your target role uses.",
        ],
      },
      {
        heading: "Certs and bootcamps employers respect",
        body: [
          "Not all credentials are equal. Recognized cloud and security certifications, and bootcamps with real project portfolios and hiring outcomes, are treated as legitimate signals. Vague \"certificates of completion\" are not. Pick the ones your target employers actually mention.",
        ],
      },
      {
        heading: "When you have no credential and no title",
        body: [
          "This is the hardest spot — and it's the exact reason FirstWeek exists. When you can't show a diploma or a past title, the most persuasive thing you can offer is evidence that you can do the work right now.",
          "Doing a realistic simulation of the target role, and getting an honest readout of where you stand, is a credential you can build in an afternoon. It's the founder's whole reason for building this: ability is real even when the paper isn't.",
        ],
      },
    ],
    faqs: [
      {
        q: "Can you get a tech job without a degree in 2026?",
        a: "Yes. A majority of employers now hire on skills, and many tech roles have dropped the degree requirement. You need to prove ability directly — through skills, certifications, projects, and demonstrated work.",
      },
      {
        q: "What tech jobs pay the most without a degree?",
        a: "Cloud, security, data, and software/automation roles tend to pay best for no-degree candidates, especially when backed by recognized certifications and a portfolio of real work.",
      },
      {
        q: "Do employers still care about degrees in 2026?",
        a: "Fewer do. Skills-based hiring is now mainstream and most tech employers use assessments. Some companies and roles still prefer degrees, but for many, demonstrated ability outweighs the credential.",
      },
    ],
    sources: [
      { label: "iMocha — Skills-based hiring trends 2026", url: "https://www.imocha.io/blog/skills-based-hiring-trends" },
      { label: "NACE — Employer use of skills-based hiring grows", url: "https://www.naceweb.org/job-market/trends-and-predictions/employer-use-of-skills-based-hiring-practices-grows" },
      { label: "Nucamp — Entry-level tech skills without a degree (2026)", url: "https://www.nucamp.co/blog/top-10-entry-level-tech-skills-to-get-hired-without-a-degree-in-2026" },
    ],
  },

  {
    slug: "career-change-no-experience-2026",
    category: "Career change",
    title: "Career Change in 2026: Pivot Without Starting Over",
    description:
      "Pivoting careers in 2026? Your problem isn't missing experience — it's untranslated experience. How to reframe skills and prove fit fast.",
    keywords: [
      "career change no experience 2026",
      "transferable skills career pivot",
      "how to change careers",
      "career pivot",
    ],
    datePublished: "2026-06-21",
    readingMins: 6,
    dek: "To change careers with no direct experience in 2026, stop treating your background as a blank and start translating it: map your outcomes, decisions, and tools to the new role, target a pivot with 70–80% skill overlap, and close the credibility gap by proving you can do the new work before anyone hires you for it.",
    sections: [
      {
        heading: "The real blocker isn't experience",
        body: [
          "Most people trying to switch careers think their problem is a lack of experience. Usually it's untranslated experience — you've done relevant things, but you're describing them in the language of your old industry, so hiring managers in the new one can't see the fit.",
          "Translation, not starting over, is the work.",
        ],
      },
      {
        heading: "Pick a pivot with real overlap",
        body: [
          "The fastest pivots reuse most of what you already have. Before you commit, estimate the overlap between your current skills and the target role. Roughly: 70–80% overlap is a fast, realistic pivot; 40–60% is a longer rebuild; below that, you're effectively starting a new career, which is fine but slow.",
        ],
      },
      {
        heading: "Map transferable skills the right way",
        body: ["Translate along four axes, not job titles:"],
        list: {
          items: [
            "Outcomes you've driven (revenue, time saved, risk reduced).",
            "Decisions you've owned (what you prioritized and why).",
            "Tools and systems you've actually used.",
            "Scope and stakes (who depended on your work, how costly being wrong was).",
          ],
        },
      },
      {
        heading: "Close the credibility gap",
        body: [
          "Even with perfect translation, you'll hit the \"but you've never held this title\" doubt. You close it the same way no-degree candidates do: with proof. A small portfolio, a sample of the new work, or a worked version of a real task in the target role gives a hiring manager something concrete to believe.",
        ],
      },
      {
        heading: "Prove you can do the new role first",
        body: [
          "The single most convincing thing in a pivot is showing you can already do a slice of the job you've never officially held. That's exactly what a FirstWeek simulation does: it drops you into realistic tasks from a specific posting and scores how you actually perform — turning \"I think my skills transfer\" into evidence the hiring manager can see.",
        ],
      },
    ],
    faqs: [
      {
        q: "How do you change careers with no experience in the new field?",
        a: "Translate your existing experience into the new field's language — outcomes, decisions, and tools rather than titles — target a role with high skill overlap, and prove fit with a small portfolio or a worked sample of the actual job.",
      },
      {
        q: "What are the easiest careers to switch to in 2026?",
        a: "The easiest pivots are ones with 70–80% overlap with your current skills — usually an adjacent role in your domain that adds new tools or AI-leverage, rather than a complete industry change.",
      },
      {
        q: "How do I prove I can do a job I've never done before?",
        a: "Do a realistic slice of it. Build a small portfolio, complete a sample of the role's real work, or run a simulation of the target job and share how you approached it. Demonstrated ability beats an unproven claim every time.",
      },
    ],
    sources: [
      { label: "CrawlJobs — Career change roadmap 2026", url: "https://www.crawljobs.com/blog/career-change-roadmap" },
      { label: "iMocha — Skills-based hiring trends 2026", url: "https://www.imocha.io/blog/skills-based-hiring-trends" },
    ],
  },

  {
    slug: "land-a-remote-job-2026",
    category: "Remote work",
    title: "How to Land a Remote Job in 2026 (Without the Scams)",
    description:
      "Remote roles draw hundreds of applicants and a flood of fake listings. How to find legit remote jobs in 2026 — and prove you can actually do the work from anywhere.",
    keywords: [
      "how to get a remote job 2026",
      "legit remote jobs",
      "remote jobs no experience",
      "find remote work",
    ],
    datePublished: "2026-06-21",
    readingMins: 6,
    dek: "To land a remote job in 2026, target companies that are remote-first (not just \"remote-friendly\"), filter hard for scams (never pay to apply), and prove the two things remote employers worry you lack: self-direction and the ability to do the actual work without anyone looking over your shoulder.",
    sections: [
      {
        heading: "The 2026 remote market: more applicants, more fakes",
        body: [
          "Remote roles get many times the applications of on-site ones, so the bar to stand out is higher. Worse, the surge in demand has been matched by a surge in fake and scam \"remote\" listings designed to harvest your data or money. The two problems compound: you're competing harder and wading through noise.",
          "The fix is to be deliberate about where you apply and ruthless about red flags.",
        ],
      },
      {
        heading: "Remote-first beats remote-friendly",
        body: [
          "There's a real difference between companies built around remote work and companies that merely tolerate it. Remote-first companies have the documentation, async culture, and trust that make a remote hire succeed — and they're used to hiring people they've never met in person, which works in your favor.",
          "Prioritize employers and job boards that are explicitly remote-first.",
        ],
      },
      {
        heading: "Spot and skip the scams",
        body: ["Walk away the moment you see any of these:"],
        list: {
          items: [
            "Any request for money, \"equipment fees,\" or your bank details before you're hired.",
            "Offers with no interview, or interviews only over text/Telegram.",
            "Vague company with no verifiable website, team, or domain email.",
            "Pay that's wildly above market for little work.",
            "A check mailed to you with instructions to buy things or wire money back.",
          ],
        },
      },
      {
        heading: "What remote employers are really screening for",
        body: [
          "Beyond the skills, remote hiring managers are nervous about two things: can you manage yourself without a manager hovering, and can you communicate clearly in writing? A remote hire who needs constant supervision is a net negative. Show evidence of autonomy and crisp written communication everywhere you can.",
        ],
      },
      {
        heading: "Prove you can do the work from day one",
        body: [
          "The strongest signal you can send a remote employer is that you can already do the role's real work, unsupervised. That's exactly what a FirstWeek simulation produces: you complete realistic tasks from the actual posting on your own, and get an honest readout — proof of self-directed capability, which is the whole thing remote employers are betting on.",
        ],
      },
    ],
    faqs: [
      {
        q: "How do I find legit remote jobs in 2026?",
        a: "Target remote-first companies and reputable remote job boards, verify the company has a real website and domain email, and never pay to apply. Apply to fewer roles with stronger, tailored proof rather than mass-applying.",
      },
      {
        q: "Can you get a remote job with no experience?",
        a: "Yes, but you have to substitute proof for a track record: a small portfolio, clear written communication, and evidence you can do the role's real tasks autonomously. Remote employers care most about self-direction and demonstrated ability.",
      },
      {
        q: "Why is it so hard to get a remote job?",
        a: "Remote roles get far more applicants than on-site ones, and the listings are polluted with scams. Standing out requires targeting remote-first employers and proving self-directed capability, not just applying widely.",
      },
    ],
    sources: [],
  },

  {
    slug: "ai-proof-jobs-2026",
    category: "AI & work",
    title: "AI-Proof Jobs in 2026: What's Actually Safe",
    description:
      "Which jobs are safe from AI in 2026? The honest answer isn't a list of titles — it's a set of traits. Here's what makes work durable, and how to move toward it.",
    keywords: [
      "AI proof jobs 2026",
      "jobs safe from AI",
      "AI resistant careers",
      "future proof career",
    ],
    datePublished: "2026-06-21",
    readingMins: 6,
    dek: "The most AI-proof jobs in 2026 aren't defined by title but by traits: work that demands judgment under ambiguity, human trust and accountability, physical presence, or responsibility for outcomes when being wrong is costly. The durable move is shifting toward that work — and being able to prove you can do it.",
    sections: [
      {
        heading: "Stop thinking in job titles",
        body: [
          "\"Is my job AI-proof?\" is the wrong question, because AI doesn't replace jobs — it replaces tasks. Almost every role is a bundle of tasks, some automatable and some not. The durable question is: how much of my work is the kind AI can't own?",
        ],
      },
      {
        heading: "The traits that make work durable",
        body: ["Work tends to resist automation when it has these traits:"],
        list: {
          items: [
            "Judgment under ambiguity — no clean inputs, real tradeoffs, context that isn't written down.",
            "Accountability — someone has to own the outcome and answer for it being wrong.",
            "Human trust — persuasion, care, negotiation, relationships.",
            "Physical presence — hands-on work in the real world.",
            "Novelty — problems that haven't been solved a thousand times before for the model to learn from.",
          ],
        },
      },
      {
        heading: "Roles heavy in those traits",
        body: [
          "In 2026, the resilient roles cluster around skilled trades, healthcare and care work, complex sales and relationship roles, leadership and coordination, and the senior end of knowledge work where judgment and accountability dominate. Note the pattern: it's the judgment-and-trust end of every field, not a separate set of \"safe\" industries.",
        ],
      },
      {
        heading: "Become AI-adjacent, not AI-replaceable",
        body: [
          "You don't have to abandon your field. The move is to climb toward the judgment work within it and to use AI as leverage rather than competing with it. People who direct, audit, and build on top of AI are in demand precisely because someone still has to own the result.",
        ],
      },
      {
        heading: "Proof beats a safe-list",
        body: [
          "No title is permanently safe, so chasing a \"safe job\" list is a losing game. What's durable is being demonstrably good at the judgment-heavy work AI can't own. Being able to sit down with a realistic version of a role and show that judgment — which is what a FirstWeek simulation surfaces — is worth more than betting on any title.",
        ],
      },
    ],
    faqs: [
      {
        q: "What jobs are safe from AI in 2026?",
        a: "No job is fully safe, but work heavy in judgment, accountability, human trust, physical presence, and novelty is most resilient — skilled trades, care work, complex sales, leadership, and the senior end of knowledge work.",
      },
      {
        q: "How do I make my career AI-proof?",
        a: "Shift toward the judgment-and-accountability parts of your field, use AI as leverage instead of competing with it, and be able to demonstrate the human judgment a role needs rather than just claim it.",
      },
      {
        q: "Will AI replace all jobs eventually?",
        a: "AI replaces tasks, not whole jobs, and work requiring judgment, trust, and accountability is far harder to automate. The realistic outcome is roles reshaping around the human parts, not disappearing wholesale.",
      },
    ],
    sources: [
      { label: "CBS News — AI layoffs and entry-level workers", url: "https://www.cbsnews.com/news/ai-layoffs-hiring-entry-level-workers/" },
      { label: "Washington Monthly — How AI broke the entry-level job", url: "https://washingtonmonthly.com/2026/05/29/ai-entry-level-jobs-college-graduates/" },
    ],
  },
];

export function getGuide(slug: string): Guide | undefined {
  return GUIDES.find((g) => g.slug === slug);
}
