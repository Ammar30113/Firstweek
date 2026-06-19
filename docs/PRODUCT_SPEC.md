# FirstWeek — Product Specification

## Product Overview

**FirstWeek** is a job-readiness simulation platform for job seekers who find a job posting but are unsure whether they can actually perform the role in real life.

The app lets a user paste a job posting URL or job description, upload their resume, and then generates realistic work simulations based on that specific role. The user completes those simulations, receives a readiness score, gets detailed feedback, identifies skill gaps, and downloads a professional report.

**The core question the product answers:**

> "Can I actually do this job?"

---

## What FirstWeek Is NOT

- ❌ Resume optimizer
- ❌ ATS keyword matcher
- ❌ Cover letter generator
- ❌ Job board
- ❌ Interview question bank
- ❌ Personality test

**What it IS:**

- ✅ Realistic job tryout
- ✅ Role simulation engine
- ✅ Work sample generator
- ✅ Self-assessment platform
- ✅ Career confidence tool
- ✅ (Eventually) Lightweight candidate assessment platform for employers

---

## The Problem

Job seekers look at job descriptions and feel unsure:

- Am I actually qualified?
- Am I underqualified or overthinking?
- Could I survive the first week?
- What would this job actually involve day to day?
- Are my past skills transferable?
- Should I apply or not?

Current tools help with resumes, cover letters, ATS optimization, and interview prep — but **none answer the deeper practical question**: "Can this person perform the actual work?"

This creates real problems:

1. Good candidates self-reject
2. Career switchers underestimate transferable skills
3. Applicants apply blindly without understanding the role
4. Resumes exaggerate but don't prove ability
5. Job descriptions are vague and abstract
6. Employers struggle to identify practical capability
7. Candidates waste time applying to roles they don't understand

---

## Core Product Principle

Turn this:

> "Customer Success Operations Analyst"

Into this:

> Here are 4 realistic tasks you would likely handle in this job:
> 1. Analyze churn-risk data
> 2. Diagnose onboarding delays
> 3. Write a customer escalation response
> 4. Recommend a process improvement to leadership

Then evaluate the user's work and say:

> You appear 78% ready for this role. Your strongest areas are operational reasoning and customer communication. Your weaker areas are SQL, SaaS metrics, and dashboard interpretation. You should still apply, but prepare around churn, retention, NRR, and reporting.

---

## Key Differentiator

| Resume Tools | FirstWeek |
|---|---|
| "How can I describe myself better?" | "Can I perform the work?" |
| Optimize words | Evaluate work |
| Keyword matching | Practical simulation |
| Self-reported skills | Demonstrated capability |

---

## Target User

### Primary: Job Seekers

People who are interested in roles but unsure whether they can perform them:

- Career switchers
- Recent graduates
- Immigrants/newcomers
- People with non-linear backgrounds
- Support → Operations transitions
- Operations → Analyst transitions
- Customer Support → Customer Success transitions
- Self-taught builders → Product/Ops roles
- People with impostor syndrome
- Candidates applying to startups or remote roles
- People who have ability but lack formal titles

### Secondary: Employers (Post-MVP)

- Candidate work sample assessments
- Pre-interview simulations
- Take-home task generation
- Role-fit reports
- Internal mobility assessments
- Upskilling recommendations

---

## Seed User Profile (For Testing)

**Candidate:** Ammar Bharmal

**Background:**
- Customer Support & Operations Specialist
- 3+ years in B2B SaaS/customer operations
- Experience with ResQ and Concentrix
- Skills: support, workflow management, vendor coordination, SLA tracking, quote handling, process improvement, customer communication, operational troubleshooting
- Tools: Zendesk, Kustomer, Retool, Looker, Excel, Slack, Linear, ChatGPT, Claude, Gemini, Codex
- Built AI/product projects: Rallio, QuoteStack, ContentOS
- Interested in: AI operations, workflow automation, customer success operations, startup roles

**Test Job:** Customer Success Operations Analyst

---

## Core User Flow

### Step 1: Landing Page

**Headline:** "Stop guessing if you're qualified. Simulate the job before you apply."

**Subheadline:** "Paste a job posting, complete realistic work tasks, and get a readiness report showing whether you can actually perform the role."

**Primary CTA:** "Start Job Simulation"
**Secondary CTA:** "See Example Report"

---

### Step 2: Job Input

User provides:
- Job URL (optional)
- Pasted job description text (required)
- Job title (optional, AI extracts)
- Company name (optional, AI extracts)
- Location (optional)
- Seniority level (optional)
- Role category (optional)

**Important:** URL parsing is not the only path. Pasted job descriptions must work perfectly.

---

### Step 3: Candidate Profile Input

User provides:
- Resume text (paste) or PDF upload
- LinkedIn URL (optional)
- Portfolio URL (optional)
- Current role
- Target role
- Years of experience
- Skills they want considered

**MVP:** Start with paste text. Add PDF parsing as enhancement.

---

### Step 4: Role Analysis

AI analyzes and displays:
- Role summary
- Core responsibilities
- Required skills
- Preferred skills
- Tools mentioned
- Business domain
- Seniority level
- Likely day-to-day work
- Success metrics
- Hidden expectations
- Possible red flags
- Likely interview focus areas
- Likely first 30-day tasks

**User feeling:** "Ah, now I understand what this job actually means."

---

### Step 5: Simulation Generation

AI generates 3–5 realistic tasks, each with:
- Scenario title
- Business context
- User instructions
- Expected deliverable
- Time estimate
- Competencies being tested
- Scoring rubric
- Difficulty level
- Role relevance

---

### Step 6: User Completes Simulation

MVP: Text box responses (long text input, optional bullet points).

Future: file uploads, spreadsheet tasks, voice answers, mock calls, coding editor, timed simulations.

---

### Step 7: Evaluation

AI evaluates each response using structured rubric. Every evaluation includes:
- Score (1–5 per competency, converted to 0–100)
- Competency tested
- What the user did well
- What the user missed
- Evidence from response
- What a stronger answer would include
- Confidence level
- Improvement recommendation

**Scoring bands:**
| Score | Band |
|---|---|
| 90–100 | Excellent Fit |
| 80–89 | Strong Fit |
| 70–79 | Viable Fit |
| 60–69 | Stretch Role |
| 40–59 | Needs Preparation |
| 0–39 | Not Recommended Yet |

---

### Step 8: Final Readiness Report

Professional, downloadable report with 15 sections:

1. Candidate Overview
2. Target Role Summary
3. Role Requirements Breakdown
4. Simulation Tasks Completed
5. Competency Scores
6. Strengths Demonstrated
7. Skill Gaps
8. Transferable Skills
9. Risk Factors
10. Learning Curve Estimate
11. Interview Preparation Focus
12. Recommended Learning Path
13. Application Recommendation
14. Hiring Manager Summary
15. Disclaimer

**Tone:** Professional, balanced, practical, credible. Not AI hype.

---

## Simulation Types by Role Family

### Customer Success
- Customer escalation response, churn-risk analysis, onboarding plan, renewal risk summary, customer health interpretation, QBR preparation

### Customer Success Operations
- Analyze onboarding bottlenecks, improve CSM workflow, inspect health metrics, create reporting recommendations, design segmentation, identify process inefficiencies

### Operations
- Workflow prioritization, bottleneck diagnosis, vendor coordination, SLA failure analysis, process redesign, escalation management

### Data Analyst
- Spreadsheet analysis, metric interpretation, anomaly detection, dashboard insights, SQL-style reasoning, executive summary

### Product Manager
- Prioritize roadmap, define MVP scope, write user stories, analyze tradeoffs, handle stakeholder conflict, interpret customer feedback

### Software Engineer
- Debug code, explain architecture, review pull request, design API, reason about edge cases, write test cases

### Sales
- Handle objection, qualify lead, write follow-up, analyze pipeline, prepare discovery questions

### Marketing
- Campaign critique, audience segmentation, copywriting test, performance analysis, positioning exercise

---

## Sample Simulation: Customer Success Operations Analyst

### Task 1: Diagnose Onboarding Delay

**Scenario:** Average onboarding time increased from 18 to 31 days last quarter. The CS Director wants to understand why.

**Data provided:**
- Enterprise: remained 21 days
- SMB: increased from 12 to 29 days
- First onboarding call: moved from 3 days to 13 days post-signup
- Support tickets during onboarding: up 22%
- CSMs: manually updating too many fields across tools

**Instructions:** Write analysis explaining: (1) likely cause, (2) data to check next, (3) immediate action, (4) longer-term process improvement.

### Task 2: Customer Health Risk Prioritization

**Scenario:** 5 customers, team can only reach 2 this week. Rank top 2 with explanation.

### Task 3: Workflow Automation Recommendation

**Scenario:** CSMs spend 5 hrs/week manually updating customer status in 3 tools. Write recommendation to manager.

---

## Legal/Ethical/Trust Requirements

**Do NOT claim:**
- Guaranteed hiring outcomes
- Psychological diagnosis
- Perfect objectivity
- Official certification
- Employer endorsement

**Use language like:**
- Readiness estimate
- Simulation-based assessment
- Role-fit signal
- Demonstrated strengths
- Observed gaps

**Mandatory disclaimer:**
> "This report is generated from a role-specific simulation and user-provided materials. It is intended for self-assessment and preparation. It does not guarantee job performance, interview selection, or employment outcomes."

**Avoid:** Protected characteristics, age/nationality-based judgments, disability assumptions, personality stereotypes, discriminatory scoring, hidden bias.

---

## Anti-Hallucination Requirements

- Never invent job details
- When information is missing: say so, infer carefully, mark confidence as low/medium
- Every evaluation must include evidence from the user's actual answer
- Distinguish: explicitly stated in job post vs. inferred from title vs. inferred from industry patterns vs. missing/uncertain
- Store these distinctions in structured JSON

---

## Revenue Model (Post-MVP)

- **Free tier:** 1 assessment
- **Pro ($19–29/mo):** Unlimited assessments, PDF reports, assessment history
- **Enterprise:** Employer-side candidate assessment tool, team features

---

## MVP Scope Summary

### Build
1. Landing page
2. Job description input
3. Resume/profile input
4. AI role analysis
5. AI simulation generation
6. User answer interface
7. AI evaluation
8. Readiness dashboard
9. Report preview
10. Export report (printable HTML → PDF)
11. Assessment history (if auth is included)

### Do NOT Build Yet
- Job board, employer portal, payment system, mobile app, browser extension, LinkedIn scraping, ATS integration, multi-user teams, recruiter marketplace, video interviews, voice simulations, proctoring, enterprise admin panel
