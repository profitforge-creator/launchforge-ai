/**
 * Asset Generation Engine
 *
 * Input:  AssetGenerationInput  { productType, businessIdea, targetAudience, productName }
 * Output: GeneratedAsset[]      5 complete assets per business type, no placeholders
 *
 * AI INTEGRATION POINT: replace each pack generator with a Gemini call
 * that receives the same ctx object and returns the same GeneratedAsset[].
 */

import type { GeneratedAsset, AssetType, AssetDownloadMetadata, ExportFormat } from "./types";
import type { AssetPackId } from "./asset-registry";

// ── Input / context ───────────────────────────────────────────────────────────

export interface AssetGenerationInput {
  productType: AssetPackId;
  businessIdea: string;
  targetAudience: string;
  productName: string;
}

interface GenerationContext {
  productName: string;
  subject: string;          // core topic distilled from businessIdea
  audienceRole: string;     // who the audience is, stripped of qualifiers
  businessIdea: string;
  targetAudience: string;
  slug: string;             // kebab-case productName for filenames
}

// ── Helpers ───────────────────────────────────────────────────────────────────

let counter = 0;

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60);
}

function extractSubject(idea: string): string {
  const cuts = [" for ", " that ", " to help ", " helping ", " about ", " targeted at ", " focused on ", " aimed at "];
  const lower = idea.toLowerCase();
  for (const cut of cuts) {
    const idx = lower.indexOf(cut);
    if (idx > 6) return idea.slice(0, idx).trim();
  }
  return idea.split(" ").slice(0, 5).join(" ");
}

function extractAudienceRole(audience: string): string {
  const cuts = [" who ", " that ", " wanting ", " trying ", " looking ", " interested ", " with "];
  const lower = audience.toLowerCase();
  for (const cut of cuts) {
    const idx = lower.indexOf(cut);
    if (idx > 2) return audience.slice(0, idx).trim();
  }
  return audience.split(" ").slice(0, 4).join(" ");
}

function buildContext(input: AssetGenerationInput): GenerationContext {
  return {
    productName: input.productName,
    subject: extractSubject(input.businessIdea),
    audienceRole: extractAudienceRole(input.targetAudience),
    businessIdea: input.businessIdea,
    targetAudience: input.targetAudience,
    slug: slugify(input.productName),
  };
}

function makeDownloadMeta(
  slug: string,
  type: AssetType,
  wordCount: number,
): AssetDownloadMetadata {
  const filename = `${slug}-${type}.md`;
  const sizeEstimateKb = Math.max(1, Math.round((wordCount * 6) / 1024));
  const availableFormats: ExportFormat[] = ["markdown", "json"];
  return {
    filename,
    primaryFormat: "markdown",
    mimeType: "text/markdown",
    sizeEstimateKb,
    availableFormats,
  };
}

function asset(
  type: AssetType,
  name: string,
  category: string,
  description: string,
  content: string,
  slug: string,
): GeneratedAsset {
  const wordCount = content.split(/\s+/).filter(Boolean).length;
  return {
    id: `ga_${++counter}_${Date.now()}`,
    name,
    type,
    category,
    description,
    content,
    wordCount,
    estimatedPages: Math.max(1, Math.round(wordCount / 250)),
    downloadMetadata: makeDownloadMeta(slug, type, wordCount),
  };
}

// ── Study Guide Pack ──────────────────────────────────────────────────────────

function generateStudyGuidePack(ctx: GenerationContext): GeneratedAsset[] {
  const { productName, subject, audienceRole, targetAudience, slug } = ctx;

  const studyGuide = asset(
    "study-guide-doc",
    `${productName} — Complete Study Guide`,
    "Learning",
    `Structured guide with 5 lessons, objectives, and application exercises for ${audienceRole}`,
    `# ${productName}
## Complete Study Guide

**Who this is for:** ${targetAudience}

**What you'll master:** A practical, end-to-end understanding of ${subject} — from foundational concepts to real-world application.

**How to use this guide:** Work through the lessons in order. Each builds on the previous. Don't rush — read each section, then complete the exercise before moving on.

---

## Lesson 1: Why ${subject} Matters

Most ${audienceRole} underestimate how much leverage a solid understanding of ${subject} gives them. The difference between people who succeed with this and those who don't isn't talent — it's framework.

Here's the core insight: ${subject} is not a tactic you apply once. It's a repeatable system that compounds over time. Every iteration you complete teaches you something the next iteration gets right automatically.

The people who treat it this way build something durable. The people who treat it as a one-time effort find themselves starting over every few months.

**The three-layer model:**

1. **Foundation** — Understanding the underlying principles that never change regardless of tools or trends.
2. **System** — Building a repeatable workflow that produces consistent results without constant reinvention.
3. **Optimization** — Iterating on what works, cutting what doesn't, and compounding your gains.

Everything in this guide fits into one of these three layers.

**Lesson 1 Exercise:** Before you continue, write down in one paragraph what you currently do in this area and where the biggest gap is. Be honest. That gap is exactly what this guide addresses.

---

## Lesson 2: The Foundation Principles

### Principle 1: Clarity Before Action

The most common mistake ${audienceRole} make is moving too fast. They pick up tactics before they've defined what success actually looks like for them. This creates a loop of activity that doesn't compound.

Before you build anything, define the specific outcome you want. Not "I want to grow" or "I want more revenue" — something measurable. What does winning look like in 90 days? In 12 months?

### Principle 2: Constraints Drive Quality

Unlimited resources don't produce the best outcomes. Constraints — of time, money, audience size, or scope — force prioritization. The most effective approaches in ${subject} are almost always the ones that were constrained into elegance.

Work with your constraints rather than against them. A small, highly engaged audience is more valuable than a large, passive one. A focused offer is more profitable than a broad one.

### Principle 3: Systems Beat Willpower

Any workflow that depends on motivation will eventually fail. ${audienceRole} who succeed long-term don't rely on willpower — they build systems where the right action is also the easiest action.

This means: set up your environment, your tools, and your schedule so that doing the work requires less friction than not doing it.

**Lesson 2 Exercise:** Write down the three constraints you're working within right now (time per week, budget, current skills). Then write one sentence about how each constraint might actually be an advantage.

---

## Lesson 3: Building Your Core System

### Step 1: Define Your Input and Output

Every effective system has a clear input (what goes in) and a clear output (what comes out). For ${subject}, your input is likely time, attention, and a specific workflow. Your output is the result your ${audienceRole} target audience cares about.

Write both down explicitly. If you can't define them clearly, your system will be vague and hard to improve.

### Step 2: Map the Process

Between input and output are steps. List every step you currently take, including the informal ones ("check email," "decide what to work on," "redo last week's work because it wasn't good enough"). Make the invisible visible.

Now look at that list. There are almost certainly:
- Steps you do that aren't necessary
- Steps you skip that are critical
- Steps that could be done once and templated

### Step 3: Remove, Automate, Delegate

Once the process is mapped, apply this filter to each step:
- **Remove:** Does this step contribute to the output? If not, eliminate it.
- **Automate:** Can this step be done by a tool, template, or system? If yes, build it once.
- **Delegate:** Could this step be done by someone else? If yes, document it well enough that it could be handed off.

What remains is your core system — the minimum viable workflow that consistently produces the output you defined.

**Lesson 3 Exercise:** Map your current process for one week of work in this area. Identify two steps to remove, one to automate or template, and one to standardize with a checklist.

---

## Lesson 4: Advanced Techniques

### Technique 1: The 80/20 Audit

Every 90 days, audit your results. Which 20% of your inputs are producing 80% of your outcomes? Double down on those inputs. Reduce or eliminate the rest.

This is not a one-time exercise — it's a quarterly discipline. The specific 20% will shift as your situation changes.

### Technique 2: Build Flywheels, Not Funnels

A funnel requires constant input to keep producing output. A flywheel builds momentum — each rotation makes the next one easier. For ${audienceRole} working in ${subject}, flywheels look like:

- Content that drives discovery that builds an audience that buys from you
- Skills that open opportunities that fund more skill development
- Systems that save time that you reinvest into higher-leverage activities

Ask yourself: is what I'm building a funnel or a flywheel? Funnels are fine for short-term campaigns. Flywheels are what creates long-term leverage.

### Technique 3: Stacking Feedback Loops

The fastest way to improve is to reduce the time between action and feedback. Long feedback loops (you create something, release it, wait 6 weeks to see results) are slow and demoralizing. Short feedback loops (you test a hypothesis in 48 hours) let you iterate faster.

Look for ways to compress feedback loops in your work. Run smaller tests more frequently. Share work earlier. Ask better questions. The goal is to fail fast on bad ideas and double down on good ones before you've over-invested.

**Lesson 4 Exercise:** Identify one flywheel you could start building in your work with ${subject}. Write out the three-to-four step loop that makes it self-reinforcing.

---

## Lesson 5: Turning This Into Revenue

### Phase 1: Validate Before You Scale

Before you invest significant time or money into any direction, validate it. Validation doesn't mean a survey or asking friends. It means finding 10 real people who would pay for the result you're offering, and proving they'd pay before you've built it.

For ${audienceRole}, this often looks like: an offer described in a few sentences, shared with the right audience, with a simple way to say yes. If you can't get 10 people to say yes to the idea, you shouldn't build the full thing yet.

### Phase 2: Build the Minimum Valuable Version

Once validated, build the smallest version that delivers the core value. Not the polished, fully-featured version you imagine — the version that solves the problem you promised to solve.

This is typically 20% of what you originally planned to build. Release it. Charge real money. Get real feedback.

### Phase 3: Optimize Based on Real Data

Now you have something real to work with. You know what customers actually want (which is often different from what they said they wanted). You know which parts of your system are producing value and which aren't.

Use this data to guide your next build cycle. Each cycle, the thing gets closer to what the market actually wants, and further from what you assumed at the start.

**Lesson 5 Exercise:** Write out the minimum version of your offer. What is the one problem it solves? Who is the one person it's for? How would they pay for it and how much? What's the first step to validating it in the next 7 days?

---

## Summary

You now have a complete framework for working with ${subject}:

1. **Foundation** — Clarity before action, constraints as leverage, systems over willpower
2. **System** — Define inputs/outputs, map and simplify the process
3. **Advanced** — 80/20 audits, flywheels, compressed feedback loops
4. **Revenue** — Validate, build minimum, optimize with real data

The gap between reading this and getting results is implementation. The people who get results are the ones who pick up the exercises and do them, not the ones who read and move on.

**Your next action:** Complete the Lesson 1 exercise if you haven't already. Everything builds from there.`,
    slug,
  );

  const flashcards = asset(
    "flashcard-deck",
    `${productName} — Flashcard Deck`,
    "Learning",
    `20 Q&A flashcards covering the core concepts — formatted for Anki or manual review`,
    `# ${productName}
## Flashcard Deck — 20 Cards

*Format: Q on front, A on back. Import into Anki by copying each card block.*

---

**Card 1**
Q: What are the three layers of the core model for ${subject}?
A: Foundation (underlying principles), System (repeatable workflow), Optimization (compounding iterations).

---

**Card 2**
Q: What is the most common mistake ${audienceRole} make when starting with ${subject}?
A: Moving too fast — applying tactics before defining what success looks like. Clarity must come before action.

---

**Card 3**
Q: What does "constraints drive quality" mean in practice?
A: Working with limited resources (time, budget, audience size) forces prioritization and produces more focused, effective solutions than unlimited resources.

---

**Card 4**
Q: Why do systems beat willpower?
A: Willpower is finite and unreliable. A good system makes the right action the easiest action — no motivation required.

---

**Card 5**
Q: What is the first step to building a core system for ${subject}?
A: Define the input (what goes in) and the output (what comes out) with complete clarity before mapping any steps.

---

**Card 6**
Q: What three filters should you apply to each step in your process?
A: Remove (is it necessary?), Automate (can a tool or template do it?), Delegate (can someone else do it?).

---

**Card 7**
Q: What is an 80/20 audit and how often should it be done?
A: A quarterly review identifying which 20% of inputs produce 80% of outcomes — then doubling down on those inputs.

---

**Card 8**
Q: What is the difference between a funnel and a flywheel?
A: A funnel requires constant input to produce output. A flywheel builds momentum — each rotation makes the next easier and more self-sustaining.

---

**Card 9**
Q: How do you compress a feedback loop?
A: Run smaller, more frequent tests. Share work earlier. Ask better questions. The goal is to reduce time between action and insight.

---

**Card 10**
Q: What does validation mean in the context of ${subject}?
A: Finding 10 real people who would pay for your result before you build it — not a survey, not friends' opinions.

---

**Card 11**
Q: What is the minimum valuable version of a product?
A: The smallest version that delivers the core promised value — typically 20% of the original plan, released fast with real pricing.

---

**Card 12**
Q: What question should you ask to determine if something is a flywheel?
A: "Does each rotation make the next rotation easier and more valuable?" If yes, it's a flywheel.

---

**Card 13**
Q: What is the 90-day principle for ${subject}?
A: Define a measurable outcome you want to achieve in 90 days. This specific timeframe balances urgency with realistic progress.

---

**Card 14**
Q: What is the biggest risk of long feedback loops?
A: Over-investment in bad ideas, slow learning, and demoralization — you discover something doesn't work after you've already committed too much to it.

---

**Card 15**
Q: What should you do before you invest significant time in a direction?
A: Validate it with real potential buyers — find 10 people who would pay for the result before building the full solution.

---

**Card 16**
Q: How does the "map your process" exercise improve your system?
A: Making the invisible visible reveals unnecessary steps, skipped critical steps, and steps that could be templated — enabling targeted improvement.

---

**Card 17**
Q: What does "stacking feedback loops" mean?
A: Designing your workflow so that multiple short feedback loops run simultaneously — accelerating learning across different aspects of your work.

---

**Card 18**
Q: What is the key difference between an offer validated by data and one assumed to be good?
A: Data-validated offers are built around what customers actually want. Assumed offers are built around what you think they want — and are usually wrong in important ways.

---

**Card 19**
Q: What happens if you skip the validation phase and build first?
A: You risk building the wrong thing for the wrong audience at the wrong price — wasting months of effort on something the market doesn't want.

---

**Card 20**
Q: What is the single most important action to take after completing this course?
A: Implement the Lesson 1 exercise immediately — define your current process and identify your biggest gap. Nothing else compounds until you do this.`,
    slug,
  );

  const quiz = asset(
    "quiz",
    `${productName} — Knowledge Quiz`,
    "Assessment",
    `10-question multiple-choice quiz with explanations — assess understanding before and after study`,
    `# ${productName}
## Knowledge Assessment Quiz

**Instructions:** Choose the best answer for each question. Explanations follow each question to reinforce learning.

---

**Question 1:** What is the first thing to do before taking action on ${subject}?

A) Research competitors
B) Define a measurable outcome
C) Choose your tools
D) Find a mentor

**Correct Answer: B**
Clarity before action is the foundational principle. Without a specific, measurable outcome defined upfront, all activity risks being disconnected from what you actually want to achieve.

---

**Question 2:** A ${audienceRole} has a large audience but very few of them engage or buy. This is an example of:

A) A flywheel that needs more fuel
B) A funnel that's too wide
C) A quantity-over-quality problem
D) Both B and C

**Correct Answer: D**
A large, passive audience is the result of optimizing for reach over engagement. Both the funnel structure and the quality-over-quantity principle apply here.

---

**Question 3:** You discover that 3 of your 15 activities produce 90% of your results. The correct response is:

A) Expand to more activities to diversify
B) Cut the 12 low-performing activities and invest more in the 3
C) Balance all 15 activities equally
D) Wait to see if the pattern holds next quarter

**Correct Answer: B**
The 80/20 principle says to double down on what's working. Diversifying by adding more activities dilutes your best-performing inputs. Act on the data now — waiting reduces compounding time.

---

**Question 4:** Which of the following best describes a flywheel in the context of ${subject}?

A) A tool that automates repetitive tasks
B) A self-reinforcing loop where each cycle makes the next more valuable
C) A content strategy that drives traffic
D) A system that scales with paid advertising

**Correct Answer: B**
A flywheel is defined by self-reinforcement — each rotation builds momentum that makes the next rotation easier and more productive. It is not tool-dependent or ad-dependent.

---

**Question 5:** What is the minimum requirement for validating an idea before building it?

A) A detailed business plan
B) A survey of 100 people
C) 10 real potential buyers indicating they would pay
D) A working prototype

**Correct Answer: C**
Real validation means real people with real money indicating real intent. Surveys and plans don't count — only actual commitment from your target audience does.

---

**Question 6:** A ${audienceRole} redesigns their entire system every few months and never feels like they're making progress. The most likely root cause is:

A) Their niche is too competitive
B) They lack the right tools
C) They have long feedback loops and no validation discipline
D) Their audience is too small

**Correct Answer: C**
Without short feedback loops, you can't learn fast enough to improve. Without validation, you keep building things the market doesn't want. The redesign cycle is a symptom of both problems.

---

**Question 7:** The "minimum valuable version" of a product should:

A) Include all planned features to maximize value
B) Be polished and fully designed before release
C) Solve one core problem for one specific audience at real pricing
D) Be free to maximize early adoption

**Correct Answer: C**
The minimum valuable version strips everything to the one problem, one person, real price. Features, polish, and free tiers come after validation — never before.

---

**Question 8:** Which of the following best describes a constraint working as an advantage?

A) A larger budget allowing more experimentation
B) A narrow audience forcing more precise positioning
C) More time allowing more thorough research
D) A bigger team enabling faster execution

**Correct Answer: B**
Constraints force specificity. A narrow audience prevents the vague, broad positioning that serves no one well — and produces a more compelling, differentiated offer.

---

**Question 9:** When mapping your process, you should include:

A) Only the formal, documented steps
B) Only the steps that directly produce output
C) Every step, including informal decisions and habits
D) Only the steps that take more than 30 minutes

**Correct Answer: C**
Informal steps — the ones you do without thinking — are often the ones with the most waste and the most opportunity. They have to be visible before they can be improved.

---

**Question 10:** What makes Phase 3 (optimize) of the revenue framework more reliable than Phase 1 (validate)?

A) You've raised more money to test with
B) You have real customer data instead of assumptions
C) Your product is better designed
D) You have more credibility in the market

**Correct Answer: B**
Phase 3 is informed by real purchase data, real feedback, and real usage patterns — none of which exist in Phase 1. This is why the sequence matters: validate first, then build, then optimize with facts.`,
    slug,
  );

  const answerKey = asset(
    "answer-key",
    `${productName} — Answer Key`,
    "Assessment",
    `Scoring rubric, correct answers, and guidance for borderline responses`,
    `# ${productName}
## Answer Key & Scoring Rubric

---

### Correct Answers

| Q | Answer | Key Concept |
|---|--------|-------------|
| 1 | B | Clarity before action |
| 2 | D | Quality over quantity |
| 3 | B | 80/20 principle |
| 4 | B | Flywheel definition |
| 5 | C | Real validation standard |
| 6 | C | Feedback loop discipline |
| 7 | C | Minimum valuable version |
| 8 | B | Constraints as advantage |
| 9 | C | Process mapping completeness |
| 10 | B | Data-informed optimization |

---

### Scoring

- **9–10 correct:** Strong conceptual foundation. Focus on application — pick one exercise from the study guide and complete it this week.
- **7–8 correct:** Solid understanding with 1–2 gaps. Re-read the lessons covering your missed questions before moving to implementation.
- **5–6 correct:** Review the full guide before attempting implementation. Pay special attention to the lessons on systems and validation.
- **0–4 correct:** Work through the study guide once more, completing each lesson exercise before progressing.

---

### Common Wrong Answers & Why

**Q1 — Common wrong answer: A (research competitors)**
Competitor research is valuable but secondary. You must define your outcome first — otherwise you won't know what to look for in competitor research. Clarity is always the first step.

**Q3 — Common wrong answer: D (wait to see if the pattern holds)**
Waiting reduces compounding time without adding meaningful certainty. One quarter of data is sufficient to act on. Waiting another quarter means losing another quarter of compounding.

**Q5 — Common wrong answer: B (survey of 100 people)**
Surveys reveal stated preferences, not real behavior. People routinely say they would pay for things they never actually buy. Only real intent signals (pre-orders, waitlist signups with payment, verbal commitment with a follow-up step) count as validation.

**Q7 — Common wrong answer: A (include all planned features)**
Feature completeness before release is the most common reason products take too long and miss the market. Real customers tell you what features matter. Your assumptions before release are almost always wrong in ways you won't discover until release.`,
    slug,
  );

  const cheatSheet = asset(
    "cheat-sheet",
    `${productName} — Quick Reference Cheat Sheet`,
    "Reference",
    `One-page summary of the most important concepts, frameworks, and decision rules`,
    `# ${productName}
## Quick Reference Cheat Sheet

---

### The Three Layers
| Layer | Focus | Question to Ask |
|-------|-------|-----------------|
| Foundation | Principles | What never changes? |
| System | Workflow | What's my repeatable process? |
| Optimization | Iteration | What do I do more/less of? |

---

### Core Principles (Never Forget)
1. **Clarity before action** — define the measurable outcome first
2. **Constraints drive quality** — work with limits, not against them
3. **Systems beat willpower** — make the right action the easiest action

---

### Process Improvement Filters
Apply to every step in your workflow:
- **Remove** — does this produce output?
- **Automate** — can a template/tool do this?
- **Delegate** — can someone else do this?

---

### Flywheel vs. Funnel
| Flywheel | Funnel |
|----------|--------|
| Self-reinforcing | Input-dependent |
| Gets easier over time | Constant effort required |
| Compounds value | Linear return |
| Build for long-term | Use for campaigns |

---

### The Validation Standard
**Not valid:** surveys, friends' opinions, "people said they'd pay"
**Valid:** 10 real potential buyers who indicate real purchase intent

---

### Revenue Phases
1. **Validate** → find 10 buyers before building
2. **Build** → minimum valuable version only (20% of original plan)
3. **Optimize** → use real data, not assumptions

---

### Feedback Loop Rule
**Slow loop (weeks/months):** fine for strategic decisions
**Fast loop (hours/days):** required for tactical iteration
Goal: make feedback loops as short as possible without losing signal quality

---

### 90-Day Discipline
- Every 90 days: run an 80/20 audit
- Identify the 20% of inputs producing 80% of results
- Double down; cut the rest
- Repeat

---

### For ${audienceRole}: The Priority Stack
1. Define your outcome (Lesson 1)
2. Map and simplify your process (Lesson 3)
3. Validate before building (Lesson 5)
4. Build flywheels, not funnels (Lesson 4)
5. Run 80/20 audits quarterly (Lesson 4)`,
    slug,
  );

  return [studyGuide, flashcards, quiz, answerKey, cheatSheet];
}

// ── Ebook Pack ────────────────────────────────────────────────────────────────

function generateEbookPack(ctx: GenerationContext): GeneratedAsset[] {
  const { productName, subject, audienceRole, targetAudience, slug } = ctx;

  const ebook = asset(
    "ebook-doc",
    `${productName} — Complete Ebook`,
    "Content",
    `Full-length ebook with introduction, 6 chapters, and resource appendix`,
    `# ${productName}

*The definitive guide for ${targetAudience}*

---

## Table of Contents

- Introduction: Why This Changes Everything
- Chapter 1: The Framework — How to Think About ${subject}
- Chapter 2: Your Starting Point — Honest Assessment
- Chapter 3: Building the Foundation
- Chapter 4: The System That Scales
- Chapter 5: Common Mistakes (and How to Skip Them)
- Chapter 6: Your First 90 Days
- Appendix: Tools, Resources, and Next Steps

---

## Introduction: Why This Changes Everything

There's a reason most ${audienceRole} stay stuck at the same level for years. It's not that they're not smart, not working hard, or not trying. It's that they're optimizing the wrong thing.

They're optimizing for activity instead of outcome. For effort instead of leverage. For doing more instead of doing the right things better.

${subject} — done correctly — is a leverage multiplier. It doesn't just add to what you're already doing. It changes the economics of your work fundamentally. The people who understand this operate at a different level from the ones who don't.

This ebook is for ${targetAudience}. It's not for people who want to dabble. It's for people who've decided to take this seriously and want a clear, honest framework for doing it right.

By the time you finish, you'll have: a clear mental model for how ${subject} actually works, a system you can implement immediately, and a 90-day plan that's specific enough to act on.

Let's get into it.

---

## Chapter 1: The Framework — How to Think About ${subject}

Most people approach ${subject} the wrong way because they've absorbed the wrong mental model from shallow content. The shallow model says: do these steps in this order and you'll get results.

The real model is more nuanced. ${subject} is a dynamic system, not a checklist. It responds to inputs, adapts to constraints, and compounds over time — but only if you understand the underlying logic.

**The underlying logic:**

Everything in ${subject} is fundamentally about the relationship between input quality and output consistency. You can have a high-effort approach that produces erratic results, or a disciplined approach that produces reliable ones. The difference is almost never about talent — it's about whether your inputs are the right ones, applied consistently.

**What this means in practice:**

Before you optimize anything, you need to know what you're optimizing for. And before you know what to optimize for, you need to understand what output you actually want — not in vague terms, but specifically.

"More success" is not a target. "Generating $8,000 per month from a digital product serving ${audienceRole} by the end of Q3" is a target. The more specific the target, the more obvious the path to it becomes.

**The three questions that shape everything:**

1. What specific outcome do I want in the next 90 days?
2. What inputs are most directly connected to that outcome?
3. What is currently consuming time and energy that isn't connected to that outcome?

Answer these three questions honestly, and you already have the beginning of a strategy.

---

## Chapter 2: Your Starting Point — Honest Assessment

You cannot improve what you don't measure, and you cannot measure what you haven't defined. Most ${audienceRole} skip the honest assessment phase and go straight to implementation. This is why most implementation fails.

**The honest assessment has three parts:**

**Part 1: Where are you actually?**
Not where you think you are or where you'd like to be — where are you right now? What are your numbers (revenue, audience size, time invested, results produced)? What has worked so far and what hasn't? Write this down. It matters.

**Part 2: What's your biggest constraint?**
Not constraints in general — your single biggest one. The constraint that, if removed, would most directly unblock your progress. For most ${audienceRole}, this is one of: clarity on offer, access to audience, time for execution, or belief in the outcome.

**Part 3: What have you already tried?**
This is the most underrated part of the assessment. Every failed attempt taught you something. What did you learn? Where specifically did things break down? The failure pattern usually points directly at the real constraint.

**How to use your assessment:**
Once you've completed it honestly, you'll notice that the path forward is much clearer than it was before. Most people avoid the assessment because it requires honesty. But that honesty is the most valuable input in the entire process.

---

## Chapter 3: Building the Foundation

The foundation has three components that must be in place before anything else can scale.

**Component 1: The Core Offer**

Your core offer is not your product or service. It's the transformation it creates — specifically, what your ${audienceRole} is able to do or have after engaging with it that they couldn't before.

A strong core offer answers: Who is it for? What problem does it solve? What does life look like after? Why are you the right person to deliver it?

Weak offers fail on the last question. If you can't answer "why you," your positioning is indistinguishable from competitors and you'll compete on price rather than value.

**Component 2: The Delivery System**

The best offer in the world fails if it's delivered inconsistently. Your delivery system is the process that takes a new customer or client from beginning to successful outcome reliably.

Map this process out. Where are the moments of delight — where do customers feel like they're getting more than expected? Where are the friction points — where do they feel confused, delayed, or unsupported? The delivery system you want is the one that maximizes delight and minimizes friction.

**Component 3: The Feedback Mechanism**

You need a way to know how well your system is working without having to ask for it manually. This could be a simple satisfaction question at the end of delivery, a Net Promoter Score check-in, or usage data from a platform.

The mechanism matters less than the discipline of actually using the data. Most people collect feedback and don't act on it. The ones who win act on it within one iteration cycle.

---

## Chapter 4: The System That Scales

Scaling is not doing more of what you're already doing. Scaling is building systems that allow your business to grow without proportional growth in your time and attention.

For ${audienceRole}, scaling almost always requires solving two problems simultaneously: the delivery problem (how to serve more people without burning out) and the acquisition problem (how to reach more people without constantly starting over).

**On the delivery side:**
The key lever is documentation. Every time you do something manually that you might do again, document it. Not for efficiency's sake — for optionality. Once it's documented, it can be templated. Once templated, it can be delegated or automated. The barrier to scale is almost always undocumented process.

**On the acquisition side:**
The key lever is owned distribution. Algorithms change, platforms change, CPMs change. What doesn't change is your direct relationship with an audience who has opted into hearing from you. Email lists, SMS lists, community memberships — any channel where you own the relationship is more valuable long-term than any channel you rent.

**The scaling sequence:**
1. Document everything you do manually
2. Identify the top 3 manual tasks consuming your time
3. Template the most repetitive one
4. Build or buy owned distribution
5. Hire or automate the second-most-repetitive task
6. Repeat

This sequence works. It's not glamorous, but it compounds.

---

## Chapter 5: Common Mistakes (and How to Skip Them)

These aren't theoretical mistakes. These are the ones that appear most frequently in the work of ${audienceRole} who plateau.

**Mistake 1: Optimizing too early**
Starting to optimize a system before you understand whether the core offer is actually working. If your offer is wrong, optimizing its delivery just makes you wrong faster and more efficiently.

*How to skip it: Run at least 10 real transactions before you touch the delivery system.*

**Mistake 2: Building in public before validating in private**
Sharing your work before you know it's valuable is backwards. The feedback you get from a public audience before validation is noise — most people are either politely supportive or reflexively critical, and neither is useful for product development.

*How to skip it: Validate with 10 real customers in private before announcing publicly.*

**Mistake 3: Competing on price**
Price competition is a signal that you haven't differentiated your offer clearly enough. ${audienceRole} who compete on price are the ones who haven't articulated their specific advantage in terms that matter to buyers.

*How to skip it: Raise your price and improve your offer. The two moves reinforce each other.*

**Mistake 4: Building before distributing**
Building a great product without an audience is the most common trap in this space. You can't sell to an audience you don't have.

*How to skip it: Build your audience 6 months before you plan to launch anything.*

**Mistake 5: Stopping too soon**
Most things work eventually if done right and done consistently. Most ${audienceRole} stop before "eventually" arrives. They try something for 60 days, see limited results, and conclude it doesn't work — when in fact it needed 120 days.

*How to skip it: Commit to a 90-day run before evaluating any new strategy.*

---

## Chapter 6: Your First 90 Days

This is where the framework becomes a plan.

**Days 1–30: Foundation**
- Complete your honest assessment (Chapter 2)
- Define your core offer with a one-paragraph positioning statement
- Map your current delivery system end-to-end
- Identify your single biggest constraint

**Days 31–60: System**
- Reach out to 10 potential buyers with your offer (validation)
- Document your delivery process in a format that could be handed off
- Set up or strengthen your primary owned distribution channel
- Complete your first 80/20 audit on your time usage

**Days 61–90: Optimization**
- Run at least 3 real transactions (adjust the offer based on what you learn)
- Begin one automation or delegation to reduce delivery time
- Audit your content or marketing — cut what isn't working
- Define your next 90-day target based on what you've learned

By day 90, you'll have: a validated offer, a documented system, a growing owned audience, and a clear view of what the next 90 days should focus on. That is a compounding foundation.

---

## Appendix: Tools, Resources, and Next Steps

**For productivity and process:**
- Use a project management tool to track your 90-day plan (Notion, Linear, or Asana all work)
- Create a simple daily dashboard: one metric that matters, one task that moves it

**For owned distribution:**
- Email: ConvertKit, Beehiiv, or Substack depending on your format
- Community: Circle or Discord depending on your audience's preference

**For validation:**
- Use Loom for personalized outreach (video converts better than text in cold outreach)
- Use Calendly to reduce friction in scheduling validation calls

**Your next action:**
Don't close this ebook and move on. Pick one action from Chapter 6's Day 1–30 plan and do it today. Specifically: complete your honest assessment. Everything else builds from there.`,
    slug,
  );

  const landingPage = asset(
    "landing-page",
    `${productName} — Landing Page Copy`,
    "Marketing",
    `Conversion-optimized sales page — headline, subhead, benefits, proof section, FAQ, and CTA`,
    `# ${productName} — Sales Page Copy

---

## HERO SECTION

**Headline:**
Everything ${audienceRole} Need to Master ${subject} — In One Complete Guide

**Subheadline:**
Stop piecing together scattered advice. ${productName} gives you the complete framework, proven system, and step-by-step plan that actually works.

**CTA Button:** Get Instant Access →

**Trust line:** Immediate download · Yours forever · No fluff, no filler

---

## THE PROBLEM

You've probably read dozens of articles on ${subject}. Watched the YouTube videos. Maybe bought a course or two.

And yet — you still feel like something's missing.

That's because most content on ${subject} gives you tactics without context. It tells you *what* to do, but not *why* it works or *how* to adapt it when things don't go to plan.

If you're a ${audienceRole}, you need something more solid than tips. You need a framework.

---

## WHAT YOU'LL GET

**Inside ${productName}:**

✓ The complete framework for understanding how ${subject} actually works — not just surface-level advice

✓ An honest assessment tool to identify your real starting point (most people skip this and wonder why nothing sticks)

✓ A step-by-step system for building on a foundation that scales

✓ The 5 most common mistakes ${audienceRole} make — and exactly how to avoid them

✓ A concrete 90-day action plan, broken into weekly milestones

✓ A resource appendix with the tools and templates that make execution faster

---

## WHO THIS IS FOR

${productName} is for ${targetAudience}.

It's specifically designed for people who are past the "I don't know where to start" phase and into "I'm doing things but not getting the traction I expected."

If that's you — this is your guide.

---

## WHAT'S INSIDE

| Section | What You'll Learn |
|---------|-------------------|
| Framework | How to think about ${subject} correctly |
| Assessment | Your honest starting point |
| Foundation | The three components that must come first |
| System | How to scale without burning out |
| Mistakes | The 5 patterns that hold ${audienceRole} back |
| 90-Day Plan | Exactly what to do, week by week |

---

## PRICING

**${productName}**

One-time payment · Instant access · No subscription

**$47**

[Get Instant Access →]

*30-day satisfaction guarantee. If you don't find the framework useful, email for a full refund — no questions asked.*

---

## FAQ

**Is this a course or a PDF?**
It's a complete written guide — readable in 2–3 hours, designed to be referenced repeatedly. No video, no drip schedule, no waiting.

**I've read a lot about ${subject} already. Will I learn anything new?**
Probably. Most content covers tactics. This covers the underlying framework and how to build a system — which is different from knowing what to do.

**Is there a guarantee?**
Yes. 30 days, full refund, no questions.

**Who is this not for?**
People looking for a quick shortcut or a one-step solution. This guide requires real implementation to produce real results.`,
    slug,
  );

  const emailSeq = asset(
    "sales-email",
    `${productName} — Launch Email Sequence`,
    "Marketing",
    `5-email launch sequence — announcement, value, objection handling, urgency, and close`,
    `# ${productName}
## 5-Email Launch Sequence

---

### Email 1: Announcement (Send: Day 1)

**Subject line:** Finally finished this one

Hey [First Name],

I've been working on something for the past few months, and it's finally ready.

It's called **${productName}** — and it's the complete guide to ${subject} I wish I'd had when I was starting out as a ${audienceRole}.

Here's what's inside:
- The framework that makes everything else make sense
- An honest assessment tool to find your real starting point
- The 5 mistakes that hold most ${audienceRole} back (and how to skip them)
- A concrete 90-day plan

I'll share more about what makes it different over the next few days.

For now — it's live and available here: [LINK]

Talk soon,
[Name]

---

### Email 2: The Core Value (Send: Day 2)

**Subject line:** The thing most guides miss

Hey [First Name],

Quick follow-up on ${productName}.

Most content on ${subject} tells you *what* to do. The tactics. The steps. The checklist.

What it doesn't tell you is *why* those steps work — or what to do when they don't.

That's the gap ${productName} fills.

It's not another list of tactics. It's a framework — one that helps you understand the underlying logic well enough to adapt when circumstances change (which they always do).

Inside, you'll find:
- The three-layer model for how ${subject} actually works
- Why constraints are an advantage, not a disadvantage
- How to build a system that works without relying on motivation

If you're ${targetAudience}, this was built specifically for you.

Get it here: [LINK] — $47, immediate download.

[Name]

---

### Email 3: Handle the Objection (Send: Day 4)

**Subject line:** "I already know the basics"

Hey [First Name],

I've gotten a few replies from people saying something like: "I already know the basics of ${subject} — will this teach me anything new?"

Honest answer: maybe.

If you've already built a repeatable system that produces consistent results — you probably don't need this.

But if you're in a position where you know the tactics but feel like something isn't quite clicking — that's exactly who ${productName} is for.

The issue isn't usually knowledge of *what* to do. It's having a framework that tells you *why* the pieces connect and *how* to adapt when things don't go to plan.

That's the gap this fills.

Still $47. Still comes with a 30-day guarantee. Available here: [LINK]

[Name]

---

### Email 4: Urgency (Send: Day 6)

**Subject line:** Closing this out soon

Hey [First Name],

Just a heads up — I'm closing out the launch pricing on ${productName} in 48 hours.

After that, the price goes up. (I do this with every launch — it's not fake urgency, it's just how I structure pricing.)

If you've been thinking about it, now's the time.

What you're getting:
✓ Complete framework for ${subject}
✓ 90-day action plan (week by week)
✓ The 5 mistakes to avoid
✓ 30-day satisfaction guarantee

$47 here: [LINK]

[Name]

---

### Email 5: Final Close (Send: Day 7)

**Subject line:** Last chance

Hey [First Name],

Today's the last day to get ${productName} at launch pricing.

After today: price increases.

If you're ${targetAudience} and you've been looking for a complete, honest framework for ${subject} — this is it.

$47 right now: [LINK]

After tonight, the price goes up and I stop promoting this specific offer.

Either way — I appreciate you being here.

[Name]`,
    slug,
  );

  const upsell = asset(
    "upsell-offer",
    `${productName} — Upsell Offer Copy`,
    "Marketing",
    `One-click upsell for a premium tier — copy for the offer page and thank-you page upgrade`,
    `# ${productName}
## Upsell Offer: Premium Bundle

---

### UPSELL PAGE (shown immediately after purchase)

**Headline:**
Wait — Upgrade Your Order for 60% Off

**Subheadline:**
You just got the complete guide. Now get everything you need to implement it faster.

---

**The Premium Bundle adds:**

**1. Implementation Workbook** ($27 value)
A fillable workbook that walks you through every exercise in the guide — so you don't just read it, you complete it. Includes the assessment tool, the process mapping worksheet, and the 90-day planner with weekly checkboxes.

**2. Swipe File: 15 Templates** ($37 value)
Ready-to-use templates for the most common scenarios in ${subject} — so you're not starting from scratch. Includes positioning statement template, delivery system map, and the 90-day planning doc.

**3. Private Community Access (90 days)** ($47 value)
Access to a private community of ${audienceRole} using the same framework. Weekly threads, feedback on your work, and direct access to ask questions.

---

**Total value: $111**
**Your upgrade price: $27**

[Yes — Upgrade My Order →]
[No thanks, I'll stick with the guide only]

---

### THANK YOU PAGE (for those who upgrade)

**Headline:** You're all set — here's what happens next.

**Body:**
Your complete bundle is available immediately. Check your email for the download link — it was sent to the same address you used at checkout.

Your 90-day community access starts today. You'll receive a separate email with your invitation link within the next few minutes.

**Your next step:** Open the Implementation Workbook and complete the assessment on page 3 before you do anything else. Everything in the bundle builds from there.

Welcome. Let's get to work.`,
    slug,
  );

  const faq = asset(
    "faq-doc",
    `${productName} — Pre-Sale FAQ`,
    "Marketing",
    `10 objections answered for the sales page — ready to paste directly`,
    `# ${productName}
## Frequently Asked Questions

---

**1. Who exactly is this for?**
${productName} is for ${targetAudience}. If that describes you, this guide was built with you specifically in mind — the frameworks, examples, and 90-day plan all reflect that context.

---

**2. I've read a lot about ${subject}. Will this actually be different?**
Most content on this topic focuses on tactics — what to do. This guide focuses on the underlying framework — why things work and how to adapt them to your specific situation. If you've consumed a lot of tactics without getting the clarity you're looking for, the framework approach is what's been missing.

---

**3. How long will it take to read?**
The guide is designed to be read in 2–3 focused hours. It's not padded — every section earns its place. Most people read it once quickly, then return to specific chapters as they implement.

---

**4. Is there a money-back guarantee?**
Yes. 30 days, full refund, no questions asked. Email the support address on your receipt and you'll be refunded within 24 hours.

---

**5. I'm not very far along yet. Is this too advanced?**
No. The guide is structured to meet you at your current level — Chapter 2 is specifically designed to help you identify your honest starting point, regardless of where that is. The 90-day plan in Chapter 6 scales to beginners and people further along.

---

**6. Do I need special tools or software to use this?**
No. The framework works regardless of your current toolset. The appendix includes tool recommendations, but none of them are required to implement the core system.

---

**7. Is this a video course or a written guide?**
Written guide. No videos, no drip schedule, no waiting for modules to unlock. Instant access to the full document. Read it at your pace, reference it whenever you need to.

---

**8. Will this work for my specific situation?**
The framework is built to generalize across the range of situations that ${audienceRole} face. Chapter 2's honest assessment is specifically designed to help you identify what to apply first given your specific starting point.

---

**9. How is this different from free content online?**
Free content optimizes for reach — it covers general, broadly-applicable points that appeal to the widest possible audience. This guide is built for a specific person (${audienceRole}) with a specific set of challenges — and goes deep rather than broad.

---

**10. Can I share this with my team?**
Single-user license. If you'd like a team or group license, reach out — there are discounts for 5+ copies.`,
    slug,
  );

  return [ebook, landingPage, emailSeq, upsell, faq];
}

// ── Notion Pack ───────────────────────────────────────────────────────────────

function generateNotionPack(ctx: GenerationContext): GeneratedAsset[] {
  const { productName, subject, audienceRole, targetAudience, slug } = ctx;

  const workspaceStructure = asset(
    "workspace-structure",
    `${productName} — Workspace Structure`,
    "Structure",
    `Full page hierarchy, navigation map, and naming conventions for the Notion system`,
    `# ${productName}
## Workspace Structure & Navigation Map

---

### Overview

This document defines the complete page hierarchy, naming conventions, and navigation structure for the **${productName}** Notion system. Every database, page, and view referenced in the setup guide maps to a node in this document.

---

### Top-Level Structure

\`\`\`
${productName}/
├── 🏠 Home Dashboard
├── 📋 Quick Capture
├── 🗂️ Projects
│   ├── Active Projects
│   ├── On Hold
│   └── Completed Archive
├── 📅 Planning
│   ├── Weekly Review Template
│   ├── Monthly Planning
│   └── 90-Day Goals
├── 📚 Knowledge Base
│   ├── Resources & References
│   ├── Notes & Ideas
│   └── SOPs & Templates
├── 📊 Tracking
│   ├── Metrics Dashboard
│   ├── Habit Tracker
│   └── Weekly Check-In Log
└── ⚙️ System Settings
    ├── About This System
    ├── Changelog
    └── Setup Guide
\`\`\`

---

### Database Index

| Database | Purpose | Relations |
|----------|---------|-----------|
| Projects DB | Track all work items from idea to done | → Tasks, Resources |
| Tasks DB | Individual action items linked to projects | → Projects |
| Resources DB | Reference materials, links, files | → Projects, Notes |
| Weekly Review DB | Weekly planning and retrospective records | — |
| Metrics DB | Key numbers tracked over time | — |

---

### Naming Conventions

**Pages:** Title Case for all top-level pages and databases.
**Templates:** Prefix with "Template: " (e.g., "Template: Weekly Review").
**Archive pages:** Prefix with year (e.g., "2025 Completed Projects").
**Database views:** Verb + noun format (e.g., "Active Projects," "Due This Week," "Completed Archive").

---

### Navigation Design Principles

1. **Home Dashboard is the entry point** — all daily work begins here. No hunting for pages.
2. **Quick Capture at the top** — every new idea, task, or resource goes here first, sorted later.
3. **Projects and Tasks are the core engine** — everything else supports these two databases.
4. **Knowledge Base is pull, not push** — resources go here when they're needed, not by default.
5. **System Settings stays at the bottom** — configuration is not a daily action.

---

### For ${audienceRole}: How to Use This Map

When you duplicate the template, this structure is pre-built. Use this document to:
- Understand why each section exists before you customize it
- Know where to add new sections without breaking the navigation
- Reference naming conventions when you add your own pages

The system is designed for ${targetAudience} — the structure reflects the workflow patterns most common in this context.`,
    slug,
  );

  const dbSchema = asset(
    "database-schema",
    `${productName} — Database Schema`,
    "Structure",
    `Schema definitions for all databases — properties, types, relations, and rollup configurations`,
    `# ${productName}
## Database Schema Definitions

---

### Database 1: Projects

**Purpose:** Central tracking for all projects, from active to archived.

| Property | Type | Options / Notes |
|----------|------|-----------------|
| Name | Title | Project name — be specific |
| Status | Select | Active · On Hold · Completed · Cancelled |
| Priority | Select | High · Medium · Low |
| Start Date | Date | Date project was started |
| Target Date | Date | Deadline or target completion |
| Owner | Person | Assignee (for team use) |
| Category | Multi-select | Custom to your work type |
| Progress | Number | 0–100 (manual or rollup) |
| Related Tasks | Relation | → Tasks DB |
| Related Resources | Relation | → Resources DB |
| Notes | Text | Long-form project notes |
| Completion Date | Date | Set when status = Completed |

**Key Views:**
- **Active Projects** — filter: Status = Active, sort by Priority
- **Due This Week** — filter: Target Date is this week
- **Completed Archive** — filter: Status = Completed, sort by Completion Date desc

---

### Database 2: Tasks

**Purpose:** Individual action items linked to projects.

| Property | Type | Options / Notes |
|----------|------|-----------------|
| Task | Title | Specific, actionable description |
| Project | Relation | → Projects DB (required) |
| Status | Select | To Do · In Progress · Done · Blocked |
| Priority | Select | High · Medium · Low |
| Due Date | Date | When this task must be done |
| Estimated Time | Number | In hours (helps with planning) |
| Context | Select | Deep Work · Admin · Communication · Creative |
| Done | Checkbox | Quick toggle for daily task views |
| Notes | Text | Anything relevant to this task |

**Key Views:**
- **Today's Tasks** — filter: Due Date = today, group by Priority
- **This Week** — filter: Due Date is this week
- **By Project** — group by Project
- **Blocked** — filter: Status = Blocked

---

### Database 3: Resources

**Purpose:** Reference materials, bookmarks, notes, and files.

| Property | Type | Options / Notes |
|----------|------|-----------------|
| Title | Title | Descriptive name |
| Type | Select | Article · Book · Tool · Template · Video · Course |
| URL | URL | Source link |
| Status | Select | To Review · Reviewed · Applied · Archived |
| Tags | Multi-select | Topic-based categorization |
| Related Project | Relation | → Projects DB |
| Summary | Text | Your takeaways, not just the title |
| Date Added | Created Time | Auto-populated |

**Key Views:**
- **To Review** — filter: Status = To Review
- **By Type** — group by Type
- **Applied** — filter: Status = Applied (your most valuable references)

---

### Database 4: Weekly Review

**Purpose:** Structured weekly planning and retrospective records.

| Property | Type | Options / Notes |
|----------|------|-----------------|
| Week | Title | Format: "Week of [Month DD, YYYY]" |
| Date | Date | Monday of the review week |
| Top 3 Wins | Text | What went well |
| Top 3 Challenges | Text | What was hard |
| Next Week Priorities | Text | Top 3–5 focus areas |
| Energy Level | Select | High · Medium · Low |
| Completion Rate | Number | % of tasks completed |
| Notes | Text | Anything else worth capturing |

**Note:** This database works best as a journal — don't delete old entries. The pattern over time is the value.

---

### Rollup Configurations

**Projects → Task Count:**
Rollup property on Projects DB → Tasks relation → Count
Displays how many tasks are linked to each project.

**Projects → Completed Task Count:**
Rollup → Tasks relation → Count values where Done = checked
Use this with Task Count to calculate progress % manually.

**Projects → Overdue Tasks:**
Rollup → Tasks relation → Count values where Due Date < today AND Done ≠ checked
Useful for identifying projects that need attention.`,
    slug,
  );

  const dashboard = asset(
    "dashboard-layout",
    `${productName} — Dashboard Layout`,
    "Structure",
    `Home page structure with embedded views, quick links, and daily workflow sections`,
    `# ${productName}
## Home Dashboard Layout

---

### Purpose

The Home Dashboard is the first page you open every day. Its job is to answer three questions in under 30 seconds:

1. What are my priorities for today?
2. What's due or overdue?
3. What needs my attention that I might have forgotten?

Everything else in the system feeds this page — not the other way around.

---

### Section Layout (Top to Bottom)

---

#### Section 1: Quick Capture (Top of Page)

A single-row, simple database view of your Quick Capture inbox.

**View settings:**
- Database: Tasks DB
- Filter: Status = "To Do" AND Project = "Quick Capture"
- Layout: List (compact)
- Visible properties: Task name, Due Date, Priority
- Sort: Date Added (newest first)

**Purpose:** Anything you captured and haven't processed yet appears here. Clear this daily by either assigning to a project or deleting.

---

#### Section 2: Today's Priorities

**View settings:**
- Database: Tasks DB
- Filter: Due Date = Today AND Done ≠ checked
- Layout: List
- Visible properties: Task name, Project, Context, Priority
- Group by: Priority (High first)

**Purpose:** Your non-negotiable list for the day. If you complete nothing else, complete what's here.

---

#### Section 3: Active Projects Snapshot

**View settings:**
- Database: Projects DB
- Filter: Status = Active
- Layout: Board grouped by Priority
- Visible card properties: Target Date, Task Count (rollup)
- Max items shown: 10

**Purpose:** A bird's-eye view of what's running. Doesn't need to be reviewed daily — weekly is sufficient.

---

#### Section 4: Due This Week

**View settings:**
- Database: Tasks DB
- Filter: Due Date = this week AND Done ≠ checked
- Layout: List
- Sort: Due Date (ascending)

**Purpose:** Everything on the near horizon. Check this Monday morning when planning the week.

---

#### Section 5: Quick Links (Callout Block)

A simple callout block with your most-used pages:

📋 Quick Capture | 📅 This Week's Review | 📊 Metrics Dashboard | 📚 Resources

---

#### Section 6: Weekly Reflection Prompt (Bottom)

A rotating daily prompt using a simple text block. Update weekly during your review.

*Example prompts:*
- "What's the one thing that would make this week a success?"
- "What are you putting off that deserves attention?"
- "What did you learn last week that should change how you work this week?"

---

### Mobile Optimization

For mobile access, hide Sections 3 and 6. The Today's Priorities view and Quick Capture are the only ones you need to interact with on the go.

---

### For ${audienceRole}: Customization Notes

This layout is designed for ${targetAudience}. The section order reflects the workflow priority for this context — start with capture, move to today, then look ahead.

If your work is more project-heavy than task-heavy, expand Section 3 and collapse Section 2. If your work is task-heavy, do the reverse.`,
    slug,
  );

  const setupGuide = asset(
    "setup-guide",
    `${productName} — Buyer Setup Guide`,
    "Onboarding",
    `Step-by-step buyer onboarding — duplicate, configure, and launch in under 30 minutes`,
    `# ${productName}
## Setup Guide — Get Running in 30 Minutes

---

### Before You Start

**You'll need:**
- A Notion account (free plan works; Plus plan recommended for larger use)
- 30 uninterrupted minutes
- This guide open on a second screen or device

**What this guide does:**
Takes you from "just downloaded the template" to "actively using the system" in a single session.

---

### Step 1: Duplicate the Template (2 minutes)

1. Click the template link in your purchase confirmation email.
2. In the top-right corner of the Notion page, click **"Duplicate"**.
3. Select your Notion workspace from the dropdown.
4. Click **"Duplicate"** again to confirm.

The system will appear in your workspace sidebar under **"Private"** pages.

---

### Step 2: Move to the Right Location (1 minute)

1. In your Notion sidebar, find the duplicated template.
2. Right-click and select **"Move to..."**
3. Move it to the root of your workspace (not inside another page) so it has its own sidebar section.
4. Rename it from "${productName} - Copy" to just **"${productName}"** (or whatever you prefer).

---

### Step 3: Configure Your Databases (10 minutes)

**Projects Database:**
1. Open the Projects database.
2. Click **"+ New"** to add your first 3 active projects.
3. Set Status, Priority, and Target Date for each.
4. Add any relevant tags or categories for your work type.

**Tasks Database:**
1. Open the Tasks database.
2. Add 5–10 tasks you're actively working on.
3. Link each task to a project using the Project relation.
4. Set due dates and priority levels.

**Don't overthink this step.** The goal is to get real data into the system, not perfect data. You'll refine as you use it.

---

### Step 4: Set Up Your Dashboard (5 minutes)

1. Open the **Home Dashboard** page.
2. Verify that each embedded view is showing data (if you added tasks in Step 3, they should appear).
3. If a view shows "0 items" when you expect to see data, check the view filter — adjust if needed.
4. Update the Quick Links section with the pages you'll actually use most.

---

### Step 5: Do Your First Weekly Review (10 minutes)

1. Open the **Weekly Review** database.
2. Click **"+ New"** to create this week's entry.
3. Fill in: Top 3 Wins (from last week), Top 3 Challenges, Next Week Priorities.
4. Set the Date property to this Monday.

This doesn't need to be perfect. The discipline of the weekly review is the most valuable part of the system — and it starts now, not later.

---

### Step 6: Archive the Setup Guide

Once you're up and running, move this Setup Guide to the **System Settings** section of the workspace. You won't need it often, but it's there for reference.

---

### Troubleshooting

**Views show "0 items" despite having data:**
Check the view filter — a filter may be excluding your data. Click the filter icon and adjust or remove the filter temporarily to verify data is loading.

**Can't see the duplicate button:**
Make sure you're viewing the template on Notion's web or desktop app, not mobile. The duplicate option is not available on mobile.

**Relations not connecting:**
Make sure both databases are in the same workspace. Cross-workspace relations aren't supported on the free plan.

---

### You're All Set

Welcome to your ${productName} workspace. The system is now live.

For ${audienceRole} like you, the most impactful first week habit is simple: open the Home Dashboard at the start of every day. Everything else builds from that one habit.`,
    slug,
  );

  const salesPage = asset(
    "sales-page",
    `${productName} — Gumroad Sales Page`,
    "Marketing",
    `Complete Gumroad-ready sales page with features, social proof section, and pricing`,
    `# ${productName}
## Gumroad Sales Page Copy

---

**Product Title:** ${productName}

**Short Description (shown in previews):**
The complete Notion system for ${targetAudience}. Pre-built databases, home dashboard, templates, and a setup guide. Duplicate and launch in 30 minutes.

---

### MAIN DESCRIPTION

Stop building your Notion workspace from scratch.

**${productName}** is a fully pre-built Notion system designed specifically for ${targetAudience} — with every database, view, template, and dashboard already configured.

You duplicate it to your workspace, spend 30 minutes customizing, and you're running.

---

### What's Included

**🏠 Home Dashboard**
Your daily command center. Today's priorities, active projects, due-this-week view, and quick links — all visible at a glance.

**🗂️ Projects Database**
Track everything from idea to done. Status, priority, target dates, and linked tasks — with pre-built views for Active, Due This Week, and Completed Archive.

**✅ Tasks Database**
Linked to projects. Filtered by context (Deep Work, Admin, Communication, Creative). Views for today, this week, and blocked items.

**📚 Resources Database**
Bookmark articles, tools, templates, and references. Tag, categorize, and link to projects so you can find things when you actually need them.

**📅 Weekly Review System**
A structured template for weekly planning and retrospective. Pre-built prompts, entry log, and a discipline that takes 10 minutes and pays for itself every week.

**📋 Setup Guide**
Step-by-step instructions to go from download to running system in under 30 minutes.

---

### Who This Is For

${productName} is for ${targetAudience}.

If you've been meaning to build a Notion system but haven't gotten around to it — or if you've built one that's become cluttered and inconsistent — this is the solution.

---

### What You Get

✓ Fully pre-built Notion workspace (duplicate instantly)
✓ 5 interconnected databases with pre-configured views
✓ Home Dashboard with embedded views
✓ Weekly Review template and log
✓ Complete setup guide
✓ Lifetime access — any updates are free

---

**Price: $37**

*Instant delivery. Notion account required (free plan works).*`,
    slug,
  );

  return [workspaceStructure, dbSchema, dashboard, setupGuide, salesPage];
}

// ── Agency Pack ───────────────────────────────────────────────────────────────

function generateAgencyPack(ctx: GenerationContext): GeneratedAsset[] {
  const { productName, subject, audienceRole, targetAudience, slug } = ctx;

  const proposal = asset(
    "proposal-template",
    `${productName} — Client Proposal Template`,
    "Sales",
    `Full client proposal with executive summary, scope, timeline, pricing, and terms`,
    `# ${productName}
## Client Proposal Template

---

**[YOUR AGENCY NAME]**
Proposal for: [CLIENT NAME]
Prepared by: [YOUR NAME]
Date: [DATE]

---

## Executive Summary

Thank you for the opportunity to propose a solution for [CLIENT NAME]. Based on our discovery conversation, I understand that your primary challenge is [PROBLEM STATED BY CLIENT] — and that the outcome you're looking for is [DESIRED RESULT].

This proposal outlines how we'll work together to achieve that outcome, what the engagement includes, and what you can expect at each stage.

We specialize in helping ${targetAudience} with ${subject}. Our approach is [BRIEF DIFFERENTIATOR — e.g., "systematic, data-informed, and focused on outcomes rather than deliverables"].

---

## The Problem We're Solving

[Restate the client's problem in their own language — pulled from discovery notes. This section should make the client feel understood, not sold to.]

In our conversation, you mentioned [SPECIFIC PAIN POINT]. This typically results in [DOWNSTREAM CONSEQUENCE] — which is exactly what this engagement is designed to address.

---

## Our Approach

We will approach this engagement in three phases:

### Phase 1: Discovery & Audit (Week 1–2)
- Review existing [materials / systems / processes] relevant to the engagement
- Identify the 2–3 highest-leverage areas for improvement
- Deliver: Discovery Report with prioritized findings and recommended approach

### Phase 2: Build & Implement (Week 3–6)
- Execute on the agreed scope (detailed below)
- Weekly check-in calls (30 min) to review progress and adjust
- Deliver: [Primary deliverable] complete and reviewed

### Phase 3: Review & Handoff (Week 7–8)
- Final review round with up to 2 revision cycles
- Handoff documentation so you can maintain and adapt the work
- Deliver: Final deliverable + maintenance guide

---

## Scope of Work

The following is included in this engagement:

**Included:**
- [Deliverable 1] — description
- [Deliverable 2] — description
- [Deliverable 3] — description
- [X] revision cycles per deliverable
- Weekly progress updates via [communication channel]
- Final handoff documentation

**Not included:**
- [Exclusion 1 — e.g., "paid advertising spend or platform fees"]
- [Exclusion 2 — e.g., "copywriting for pages not listed above"]
- Work outside the agreed scope (billed separately at $[RATE]/hr with prior approval)

---

## Timeline

| Milestone | Target Date |
|-----------|-------------|
| Proposal accepted | [DATE] |
| Discovery kick-off call | [DATE + 3 days] |
| Discovery Report delivered | [DATE + 2 weeks] |
| Phase 2 begins | [DATE + 2 weeks + 1 day] |
| First draft delivered | [DATE + 5 weeks] |
| Revisions complete | [DATE + 6.5 weeks] |
| Final delivery | [DATE + 8 weeks] |

*Timeline assumes prompt feedback (within 48 hours) at each review stage.*

---

## Investment

**Option A: Full Engagement**
Everything described in this proposal.
**$[PRICE]** — 50% due at signing, 50% due at final delivery.

**Option B: Phase 1 Only**
Discovery & Audit only — ideal if you want to validate fit before committing to the full engagement.
**$[PRICE]** — 100% due at signing.

**Payment methods:** Bank transfer, Stripe (credit card). Invoices issued via [TOOL].

---

## Terms

- This proposal is valid for 14 days from the date above.
- Work begins within 3 business days of signed agreement and initial payment.
- Revisions beyond the included cycles are billed at $[RATE]/hr.
- Client is responsible for providing materials, access, and feedback within the agreed timelines. Delays on the client side may extend the project timeline.
- Either party may terminate with 14 days written notice. Client is invoiced for work completed to date.

---

## Next Steps

If this proposal looks right, here's how we proceed:

1. Reply to confirm acceptance
2. I'll send a formal agreement via [TOOL] for signature
3. Invoice for the first payment follows immediately after
4. Discovery kick-off call is scheduled within 48 hours of payment

Questions? I'm available at [EMAIL] or [PHONE].

Looking forward to working together.

[YOUR NAME]
[YOUR TITLE]
[AGENCY NAME]`,
    slug,
  );

  const sop = asset(
    "onboarding-sop",
    `${productName} — Client Onboarding SOP`,
    "Operations",
    `Standard operating procedure for client onboarding — from signed contract to kickoff`,
    `# ${productName}
## Client Onboarding Standard Operating Procedure

**Version:** 1.0
**Owner:** [AGENCY OWNER NAME]
**Applies to:** All new client engagements

---

### Purpose

This SOP ensures every new client experiences a consistent, professional onboarding process — from the moment they sign the contract to the moment their first project phase begins. A strong onboarding reduces client anxiety, sets clear expectations, and prevents the miscommunications that derail projects.

---

### Trigger

This SOP is initiated when: a client signs the engagement agreement AND the initial payment clears.

---

### Step 1: Send Welcome Package (Within 24 Hours of Payment)

**Owner:** Account manager / agency owner

**Actions:**
1. Send the Welcome Email (template: "Client Welcome — [SERVICE TYPE]")
   - Thank them for choosing to work together
   - Confirm the engagement scope in 2–3 bullet points
   - Preview what happens next (this SOP, in friendly language)
   - Attach a PDF copy of the signed agreement for their records

2. Create the client folder in [your project management tool]
   - Folder name: "[CLIENT NAME] — [MONTH YEAR]"
   - Sub-folders: /Contracts, /Discovery, /Deliverables, /Communication

3. Send the client portal invite (if applicable)

**Checklist:**
- [ ] Welcome email sent
- [ ] Client folder created
- [ ] Portal invite sent (if applicable)
- [ ] Payment receipt sent by accounting tool

---

### Step 2: Send Onboarding Questionnaire (Day 1)

**Owner:** Account manager

**Actions:**
1. Send the onboarding questionnaire via [Typeform / Google Form / Notion form]
   - Questions should cover: current situation, goals, relevant background, communication preferences, stakeholders involved
   - Set deadline: "Please complete within 48 hours so we can maximize our kickoff call"

2. Log questionnaire send date in project management tool

**If not received within 48 hours:**
- Send one follow-up reminder
- If still not received 24 hours after reminder, call the primary contact

**Checklist:**
- [ ] Questionnaire sent
- [ ] Deadline communicated
- [ ] Follow-up scheduled if not received

---

### Step 3: Internal Preparation (Day 2–3)

**Owner:** Project lead

**Actions:**
1. Review the completed questionnaire
2. Research the client's business, competition, and context (30-minute research block)
3. Prepare the kickoff call agenda (template: "Kickoff Call Agenda")
4. Brief any team members who will be on the call

**Kickoff Call Agenda (template):**

*Duration: 60 minutes*

- Introductions (5 min)
- Recap: why they came to us and what success looks like (10 min)
- Review of scope: confirm what's included and what's not (10 min)
- Discovery phase: what we'll need from them and when (10 min)
- Communication preferences and response time expectations (5 min)
- Q&A (15 min)
- Next steps and schedule (5 min)

**Checklist:**
- [ ] Questionnaire reviewed
- [ ] Research completed
- [ ] Kickoff agenda prepared
- [ ] Team briefed

---

### Step 4: Schedule and Run Kickoff Call (Day 3–5)

**Owner:** Account manager

**Actions:**
1. Send Calendly link (or equivalent) with the kickoff call invite
   - Preferred: within the first 5 business days of payment
   - Duration: 60 minutes
   - Platform: [Zoom / Google Meet / preference stated in agreement]

2. Send agenda 24 hours before the call

3. Run the kickoff call per the agenda

4. Record the call (with client permission — confirm on the call, not by assumption)

5. Send a call summary within 24 hours:
   - What we discussed
   - Key decisions made
   - Next steps and who owns each

**Checklist:**
- [ ] Kickoff call scheduled
- [ ] Agenda sent 24 hours before
- [ ] Call completed and recorded (with permission)
- [ ] Summary sent within 24 hours

---

### Step 5: Begin Discovery Phase (Day 6+)

At this point, the onboarding SOP is complete and the project-specific workflow (see: Client Workflow document) takes over.

**Handoff actions:**
1. Update project status in project management tool to "Discovery — Active"
2. Assign all project tasks with due dates
3. Confirm first check-in call date with client

---

### Quality Standards

- Welcome package sent within 24 hours: **non-negotiable**
- Kickoff call within 5 business days: **target**
- Call summary within 24 hours of kickoff: **non-negotiable**
- Client should never have to chase us for status: **always**

---

### Version History

| Date | Change | Owner |
|------|--------|-------|
| [DATE] | Initial version | [NAME] |`,
    slug,
  );

  const workflow = asset(
    "client-workflow",
    `${productName} — Client Delivery Workflow`,
    "Operations",
    `End-to-end delivery process from discovery through offboarding`,
    `# ${productName}
## Client Delivery Workflow

---

### Overview

This document describes the complete client delivery workflow from discovery through offboarding. It covers every interaction, decision point, and deliverable in a standard engagement.

For onboarding (before this workflow begins), see: Client Onboarding SOP.

---

### Phase 1: Discovery (Weeks 1–2)

**Goal:** Understand the client's situation well enough to produce a Discovery Report with clear, prioritized recommendations.

**Week 1 Actions:**
- Review all materials shared in onboarding
- Run the discovery audit checklist (see: [your specific audit template])
- Identify 5–7 potential areas for improvement; prioritize by impact and effort
- Draft initial findings (internal only — not shared yet)

**Week 2 Actions:**
- Package the top 3 findings into the Discovery Report
- Frame each finding as: Observation → Impact → Recommendation
- Share draft internally for review before sending to client
- Send Discovery Report to client; schedule review call

**Discovery Report Review Call (30 minutes):**
- Walk through findings
- Confirm priorities with client
- Adjust scope if findings reveal a different need than originally proposed
- Agree on Phase 2 plan

**Phase 1 Deliverable:** Discovery Report

**Phase 1 Exit Criteria:**
- Report delivered
- Client has reviewed and confirmed priorities
- Phase 2 scope is agreed (or amendment signed if scope has changed)

---

### Phase 2: Build & Implement (Weeks 3–6)

**Goal:** Execute the agreed scope, delivering quality work on schedule with appropriate client feedback loops.

**Weekly Rhythm:**
- Monday: Review weekly task list; confirm priorities
- Wednesday (or agreed day): Weekly check-in call (30 min) with client
  - What was completed last week?
  - What's happening this week?
  - Any blockers or questions from the client?
- Friday: Update project status in project management tool

**Feedback Process:**
1. Share draft deliverable with specific review questions: "Please focus feedback on [X]. We'll address [Y] in the next round."
2. Client has 48 hours to provide feedback
3. Revisions completed within 48 hours of receiving feedback
4. Maximum [X] revision rounds per deliverable (as agreed in proposal)

**Escalation Protocol:**
- If feedback is not received within 48 hours: send one reminder
- If not received within 72 hours: call the primary contact; document the delay
- If scope disagreement arises: pause work; escalate to a scope alignment call before proceeding

**Phase 2 Deliverables:** [Primary deliverables as agreed in proposal]

**Phase 2 Exit Criteria:**
- All deliverables delivered and approved by client
- Revisions complete
- Ready for Phase 3

---

### Phase 3: Review & Handoff (Weeks 7–8)

**Goal:** Finalize the work, ensure the client can use and maintain it independently, and close the engagement cleanly.

**Week 7 Actions:**
- Final quality check: review all deliverables against the original scope
- Prepare handoff documentation (see template: "Handoff Package Checklist")
- Deliver final versions to client

**Handoff Package Includes:**
- All deliverables in agreed formats
- Maintenance guide: how to update, adapt, or extend each deliverable
- Contact information for post-engagement questions (if included in agreement)
- Invoice for final payment (if on 50/50 structure)

**Final Call (30–45 minutes):**
- Walk through handoff package
- Answer questions
- Gather testimonial (see below)

**Gathering the Testimonial:**
Ask during the final call: "Would you be willing to share a few sentences about your experience for our website? I can draft something based on what you've shared, or you can write your own."

Draft if they agree: keep it specific and outcome-focused. Send for their approval before publishing.

**Phase 3 Exit Criteria:**
- Handoff package delivered
- Final invoice paid
- Testimonial gathered (or declined)
- Client transitioned to post-engagement status in CRM

---

### Post-Engagement

**Within 7 days of project close:**
- Send a short follow-up email: "How are things going with [the work]?"
- Add client to your referral follow-up sequence (90-day check-in)
- Log lessons learned in your internal retro document

**90-Day Check-In:**
- Brief email: "It's been 90 days — curious how [the work] has been performing. Are there any questions I can help with?"
- Opens the door to additional work without being pushy`,
    slug,
  );

  const outreach = asset(
    "outreach-script",
    `${productName} — Outreach Scripts`,
    "Sales",
    `6 outreach templates — cold email, LinkedIn DM, referral ask, and follow-up sequences`,
    `# ${productName}
## Outreach Scripts — 6 Templates

---

### Script 1: Cold Email — Problem-First

**Subject:** Quick question about [SPECIFIC THING AT THEIR COMPANY]

Hi [FIRST NAME],

I noticed [SPECIFIC OBSERVATION — something real about their business, not generic flattery].

We work with ${targetAudience} to help them [SPECIFIC OUTCOME RELEVANT TO THEM]. Most of the people we work with come to us after [COMMON TRIGGER EVENT — e.g., "a launch that didn't go as planned" or "scaling past a point where their current system couldn't keep up"].

If that's resonant, I'd love to share how we approach it — no pitch, just a 20-minute conversation.

Worth a quick call?

[YOUR NAME]

---

### Script 2: Cold LinkedIn DM — Short & Direct

Hi [FIRST NAME] — I work with ${audienceRole} on ${subject}. I came across your profile and noticed [SPECIFIC THING]. I have one idea that might be relevant to what you're working on. Mind if I share it?

---

### Script 3: Warm Introduction Request

**Subject:** Quick intro request

Hey [MUTUAL CONNECTION],

Hope you're well. I'm reaching out because I've been following [PROSPECT NAME]'s work with [THEIR COMPANY] and think we might be able to help them with [SPECIFIC PROBLEM].

Would you be comfortable making a brief introduction? I'll keep it short on their end — just a 15-minute call to see if it's relevant.

Happy to draft the intro email if that makes it easier.

Thanks,
[YOUR NAME]

---

### Script 4: Referral Ask (From Current Client)

Hi [CLIENT FIRST NAME],

Really glad the [PROJECT/DELIVERABLE] has been working well for you.

I wanted to ask — do you know anyone else in your network who might benefit from similar help? We specifically work well with ${targetAudience} who are dealing with [COMMON PROBLEM].

If anyone comes to mind, I'd love an introduction. Even a "you should talk to [your name]" in Slack works.

Thanks,
[YOUR NAME]

---

### Script 5: Follow-Up After No Response (Day 5)

**Subject:** Re: [ORIGINAL SUBJECT]

Hi [FIRST NAME],

Just bumping this to the top of your inbox. Happy to skip it if the timing isn't right.

If you are thinking about [TOPIC], I have [ONE SPECIFIC, GENUINELY USEFUL RESOURCE] I could share — no strings attached.

Either way, no worries.

[YOUR NAME]

---

### Script 6: Re-Engagement (Cold Lead from 60+ Days Ago)

**Subject:** Different question

Hi [FIRST NAME],

We talked [X months] ago about [TOPIC] — timing wasn't right then. Just checking in.

I've since worked with a few ${audienceRole} on [SPECIFIC OUTCOME] and thought of you.

Still dealing with [ORIGINAL PROBLEM]? If so, happy to reconnect. If not — great, and no need to respond.

[YOUR NAME]

---

### Usage Notes

- Personalize every template before sending — the placeholders in brackets are research prompts, not mail-merge fields
- Track open rates and reply rates by template to identify which performs best in your market
- A/B test subject lines before optimizing the body copy
- Never send more than 3 touches per prospect before moving them to a dormant list`,
    slug,
  );

  const salesPageAgency = asset(
    "agency-sales-page",
    `${productName} — Service Sales Page`,
    "Marketing",
    `Full service sales page — problem, process, outcomes, and pricing section`,
    `# ${productName}
## Service Sales Page Copy

---

### HERO

**Headline:**
${subject} for ${audienceRole} — Done Right, the First Time

**Subheadline:**
We help ${targetAudience} get [SPECIFIC RESULT] without [COMMON FRUSTRATION]. Structured process, clear deliverables, results you can measure.

**CTA:** See How It Works →

---

### THE PROBLEM

If you're ${targetAudience}, you've probably run into one of these:

- You know you need to improve your ${subject} but don't have the time or expertise to do it internally
- You've tried before and it was either too generic, too slow, or didn't produce what you actually needed
- You're getting to a scale where doing it yourself doesn't make sense anymore, but you're not sure who to trust

These aren't skill problems. They're structural problems — and they have a structural solution.

---

### THE PROCESS

We've refined our approach across [X] engagements with ${audienceRole} like you. It works in three phases:

**Phase 1: Discovery (Weeks 1–2)**
We learn your situation before we recommend anything. Discovery includes a detailed audit and a written report with prioritized findings. You'll leave Phase 1 knowing exactly what to fix and in what order — even if we never work together beyond this.

**Phase 2: Build & Implement (Weeks 3–6)**
We execute the agreed scope with weekly check-in calls and a clear revision process. You always know where things stand.

**Phase 3: Handoff (Weeks 7–8)**
Final delivery includes a maintenance guide so you can update and adapt the work independently. We don't keep you dependent on us.

---

### WHO THIS IS FOR

This service is built specifically for ${targetAudience}.

It is not for: people who need something in 48 hours, organizations that haven't defined what they want, or anyone who's looking for the cheapest option available.

If you want fast and cheap, we're not your agency. If you want right — we probably are.

---

### OUTCOMES

Here's what a typical engagement produces:

- [OUTCOME 1 — specific and measurable]
- [OUTCOME 2 — specific and measurable]
- [OUTCOME 3 — specific and measurable]

*Results vary based on starting point and implementation. These reflect typical outcomes across our client base.*

---

### PRICING

**Discovery Only — $[PRICE]**
Perfect for organizations that want to understand the landscape before committing to a full engagement.

**Full Engagement — $[PRICE]**
Everything: Discovery through final delivery and handoff. 50% at signing, 50% at delivery.

**Retainer — $[PRICE]/month**
For organizations that want ongoing support after the initial engagement.

---

### NEXT STEP

The first step is a 30-minute intro call — no pitch, no pressure. I'll ask you what you're trying to solve and tell you honestly whether we're the right fit.

[Book a Call →]

Or email directly: [EMAIL]`,
    slug,
  );

  return [proposal, sop, workflow, outreach, salesPageAgency];
}

// ── Creator Pack ──────────────────────────────────────────────────────────────

function generateCreatorPack(ctx: GenerationContext): GeneratedAsset[] {
  const { productName, subject, audienceRole, targetAudience, slug } = ctx;

  const contentCalendar = asset(
    "content-calendar",
    `${productName} — 30-Day Content Calendar`,
    "Content",
    `30-day plan with platform, format, hook, and goal for every post`,
    `# ${productName}
## 30-Day Content Calendar

**Theme:** ${subject} for ${targetAudience}
**Posting cadence:** 5x/week (adjust to fit your schedule)
**Primary platforms:** [Your primary platform] + repurpose to [secondary]

---

### Week 1: Establish Credibility

| Day | Platform | Format | Hook | Goal |
|-----|----------|--------|------|------|
| 1 | Primary | Carousel / Thread | "I spent [X] time learning ${subject} so you don't have to. Here's what I found:" | Introduce your POV |
| 2 | Primary | Short video | "The thing nobody tells ${audienceRole} about ${subject}:" | Problem awareness |
| 3 | Primary | Text post | "Hot take: most advice on ${subject} is wrong. Here's why:" | Engagement / controversy |
| 4 | Secondary | Story / Short | "The #1 mistake I see ${audienceRole} make with ${subject}" | Top-of-funnel |
| 5 | Primary | Long-form | "Complete beginner's guide to ${subject} — everything you need in one post" | SEO / saves / shares |

---

### Week 2: Share Your Framework

| Day | Platform | Format | Hook | Goal |
|-----|----------|--------|------|------|
| 6 | Primary | Carousel | "The 3-step framework I use for ${subject} (swipe →)" | Saves and shares |
| 7 | Primary | Text post | "Most ${audienceRole} overcomplicate ${subject}. It's actually just:" | Simplicity positioning |
| 8 | Primary | Short video | "Watch me [demonstrate the process] in real time" | Trust / transparency |
| 9 | Primary | Poll / Question | "What's your biggest challenge with ${subject}?" | Research + engagement |
| 10 | Secondary | Story / Short | "Day in the life of a ${audienceRole} who has ${subject} figured out" | Aspiration |

---

### Week 3: Objections and Depth

| Day | Platform | Format | Hook | Goal |
|-----|----------|--------|------|------|
| 11 | Primary | Text post | "I know what you're thinking: '${subject} doesn't work for me because __.' Here's my response:" | Objection handling |
| 12 | Primary | Carousel | "Before and after: what ${subject} looks like when it's working" | Social proof |
| 13 | Primary | Short video | "[Counterintuitive thing about ${subject}] — and why it matters" | Differentiation |
| 14 | Primary | Long-form | "Why ${audienceRole} fail at ${subject} (and the 3 things that fix it)" | SEO + authority |
| 15 | Secondary | Story | "Behind the scenes: how I structure my approach to ${subject}" | Trust |

---

### Week 4: Convert and Close

| Day | Platform | Format | Hook | Goal |
|-----|----------|--------|------|------|
| 16 | Primary | Text post | "If I were starting with ${subject} today, here's exactly what I'd do in the first 30 days:" | Value + CTA |
| 17 | Primary | Carousel | "The tools I actually use for ${subject} (and the ones I stopped using)" | Practical value |
| 18 | Primary | Short video | "[Personal story about ${subject}] — what I learned and what I'd do differently" | Humanize |
| 19 | Primary | Q&A post | "Ask me anything about ${subject}" | Engagement |
| 20 | Primary | Promotional | "I built [product/service] specifically for ${audienceRole} who want [outcome]. Here's what's inside:" | Direct offer |

---

### Evergreen Posts (Rotate Throughout the Month)

These posts work at any point and can be repeated with slight variations:

1. **"[Number] things I wish I'd known about ${subject} when I started"**
   — Always performs well. Update the number and list occasionally.

2. **"The truth about ${subject} that most people don't want to hear:"**
   — Works for any insight that goes against the grain.

3. **"If you're ${targetAudience} and you struggle with ${subject}, this is for you:"**
   — Specific audience call-out. High engagement from the right people.

4. **"Stop doing [common bad advice about ${subject}]. Start doing this instead:"**
   — Strong hook, easy format, easy to write.

---

### Repurposing Map

| Original Format | Repurpose To |
|----------------|-------------|
| Long-form post (Day 5) | 5 separate short posts |
| Carousel (Day 6) | Script for a short video |
| Q&A post (Day 19) | FAQ section for your sales page |
| Framework post (Day 7) | Email newsletter issue |
| Before/after (Day 12) | Testimonial-format case study |

---

### Metrics to Track Weekly

- Reach / impressions per post
- Saves (best indicator of actual value)
- Profile visits from posts
- New followers from content
- Link clicks / DMs from content`,
    slug,
  );

  const brandGuide = asset(
    "brand-guide",
    `${productName} — Brand Guide`,
    "Brand",
    `Voice, tone, visual direction, and positioning — everything needed to stay on-brand`,
    `# ${productName}
## Brand Guide

---

### 1. Brand Foundation

**What we do:**
Help ${targetAudience} with ${subject}.

**Who we're for:**
${targetAudience}. Specifically, people who are past the "I don't know where to start" stage and into "I'm doing things but not getting the traction I expected."

**What we stand for:**
Clarity over complexity. Systems over tactics. Results that compound.

**What we stand against:**
Vague advice, filler content, and strategies that work in theory but not in practice.

**Our positioning in one sentence:**
We're the [${subject}] resource for ${audienceRole} who want a real framework, not another list of tips.

---

### 2. Voice & Tone

**Overall voice:** Direct, knowledgeable, and honest. We write the way a trusted colleague talks — not how a brand speaks.

**Tone adjustments by context:**

| Context | Tone Shift |
|---------|------------|
| Educational content | Authoritative but approachable — explain clearly, don't condescend |
| Personal stories | Candid and specific — real failures and real wins, not vague lessons |
| Sales copy | Confident, not pushy — state the value clearly and let the reader decide |
| Replies and DMs | Warm and personal — use their name, engage with their specific situation |
| Controversy / opinion | Strong but grounded — have a point of view, back it with reasoning |

**Words we use:**
systematic, practical, compound, clarity, leverage, framework, specific, honest, real

**Words we avoid:**
game-changer, revolutionary, passive income, hack, secret, exclusive (as a filler), amazing, simply (when it isn't simple), just (minimizing word)

---

### 3. Content Voice Examples

**We write this:**
"The most common mistake ${audienceRole} make with ${subject} is skipping the validation step. They build, then ask if anyone wants it. The sequence matters."

**Not this:**
"Are you making this HUGE mistake with ${subject}?! Most people don't realize this game-changing secret that could TRANSFORM your results!"

---

**We write this:**
"This is what I'd do if I were starting with ${subject} today. Not what I tried first — what I'd do knowing what I know now."

**Not this:**
"Here's my proven step-by-step blueprint for crushing it with ${subject} using my proprietary system."

---

### 4. Visual Direction

**Overall aesthetic:** Clean, dark-mode friendly, high contrast. No stock photos of people smiling at laptops. No gradients that look like 2014.

**Color palette:**
- Primary: [YOUR BRAND COLOR — HEX]
- Secondary: [ACCENT COLOR — HEX]
- Neutral dark: #111111 or #0F0F0F
- Neutral light: #F5F5F5 or #EEEEEE
- Text primary: #FFFFFF (on dark) / #111111 (on light)
- Text secondary: #888888

**Typography:**
- Headlines: [FONT — e.g., Inter Bold, Satoshi Bold]
- Body: [FONT — e.g., Inter Regular]
- Monospace / code: [FONT — e.g., JetBrains Mono]

**Graphic elements:**
- Carousels: dark background, white text, minimal decoration
- Quote cards: large type, attribution clearly marked
- Data/charts: minimal, high contrast, labeled clearly

**Photography style (if used):**
Real environments, not staged. Real work being done, not posed. Tools visible, people optional.

---

### 5. Audience Understanding

**Who they are:** ${targetAudience}

**What they want:** A clear path to [CORE DESIRED OUTCOME]. They don't want to figure out the theory — they want to know what to do and why it works.

**What they're afraid of:** Wasting time on another approach that doesn't work. Being sold another course that teaches what they already know. Looking incompetent in their space.

**What makes them trust us:** Specificity. When we reference the exact problems they face — not the generic version — they know we understand them. Generic content loses them instantly.

---

### 6. Do / Don't Quick Reference

| Do | Don't |
|----|-------|
| Use specific numbers and examples | Use vague generalizations |
| Name the problem before offering the solution | Lead with the offer |
| Write shorter than you think you need to | Pad content to hit a word count |
| Share what didn't work and why | Only share wins |
| Have a clear point of view | Both-sides everything |
| Reference ${audienceRole} by name | Write for "everyone" |`,
    slug,
  );

  const hookLibrary = asset(
    "hook-library",
    `${productName} — Hook Library`,
    "Content",
    `30+ proven opening hooks organized by type, platform, and emotional driver`,
    `# ${productName}
## Hook Library — 30+ Tested Openers

*Replace bracketed items with your specific context. These hooks are designed for ${subject} content targeting ${targetAudience}.*

---

### Category 1: The Mistake Hook (Highest Engagement)

These work because they trigger recognition — the reader sees themselves in the mistake.

1. "The biggest mistake ${audienceRole} make with ${subject} — and how to fix it in one afternoon:"
2. "I made every mistake possible with ${subject}. Here's what I learned:"
3. "Stop doing this with ${subject}. It's slowing you down more than you realize:"
4. "Nobody told me this when I started with ${subject}. I had to learn it the hard way:"
5. "If you're ${targetAudience}, this ${subject} mistake is probably costing you [TIME/MONEY/RESULTS]:"

---

### Category 2: The Counterintuitive Hook (High Shares)

These challenge assumptions. Readers share them because they feel smart for knowing the counterintuitive thing.

6. "Hot take: everything you've been told about ${subject} is optimizing for the wrong thing."
7. "The conventional wisdom on ${subject} is backwards. Here's what the data actually shows:"
8. "Less ${subject} work, better ${subject} results. Sounds wrong. Here's why it's right:"
9. "The ${audienceRole} I know who get the best results with ${subject} all do one thing differently. It's not what you'd expect:"
10. "I used to think ${subject} required [COMMON BELIEF]. I was wrong. Here's what it actually requires:"

---

### Category 3: The Specific Number Hook (High Trust)

Specificity signals credibility. "7 things" outperforms "some things" every time.

11. "The 3 things that separate ${audienceRole} who succeed with ${subject} from those who don't:"
12. "I analyzed [X] examples of ${subject}. These 5 patterns showed up in every successful one:"
13. "After [X years / X clients / X attempts] with ${subject}, here are the only 4 principles that actually matter:"
14. "7 things I'd tell a ${audienceRole} starting with ${subject} today:"
15. "The 2-minute ${subject} audit that reveals exactly where you're leaving results on the table:"

---

### Category 4: The Story Hook (Highest Retention)

Stories keep people reading. These require more personalization but outperform all other formats in comments and saves.

16. "[SPECIFIC EVENT] changed how I think about ${subject}. Here's what happened:"
17. "Three years ago, I was a ${audienceRole} who couldn't figure out ${subject}. This is what changed:"
18. "I almost quit [this niche] because of ${subject}. Then I discovered [THING]. Here's the story:"
19. "My best result with ${subject} came from the thing I almost didn't try:"
20. "The client / project / attempt that taught me more about ${subject} than anything else:"

---

### Category 5: The Direct Value Hook (High Saves)

No preamble. Just the thing they came for. Works best for how-to content.

21. "How to [CORE OUTCOME] with ${subject} — step by step:"
22. "The exact process I use for ${subject} (copy it):"
23. "A complete beginner's guide to ${subject} in [X] minutes:"
24. "Everything you need to get started with ${subject}, in one place:"
25. "My ${subject} system, documented. Take what's useful:"

---

### Category 6: The Audience Call-Out Hook (High Targeting Precision)

These underperform on raw reach but overperform on conversion. The right people stop scrolling.

26. "If you're ${targetAudience} and ${subject} feels harder than it should, this is for you:"
27. "For ${audienceRole} who are tired of generic advice about ${subject}:"
28. "This is specifically for ${audienceRole} who [SPECIFIC SITUATION — e.g., 'have tried X but aren't getting Y']:"
29. "${audienceRole}: if you're at the stage where [SPECIFIC MILESTONE], this matters:"
30. "Not for everyone. For ${targetAudience} who want [SPECIFIC OUTCOME], not just [GENERIC RESULT]:"

---

### Bonus: Platform-Specific Variations

**Twitter/X:** Open with the conclusion, not the buildup. "The ${subject} mistake costing ${audienceRole} the most: [DIRECT ANSWER]. Here's why and how to fix it:"

**LinkedIn:** First sentence must stand alone — it's all most people see before clicking "see more." Make it a bold statement or a specific observation.

**Instagram:** The visual IS the hook — text hooks support the image. "This is what ${subject} actually looks like when it's working →" (image shows the result).

**Newsletter:** Subject line IS the hook. Best format: "[Specific topic] — [what they'll walk away with]" e.g., "My ${subject} framework — and why I almost didn't share it"`,
    slug,
  );

  const sponsorshipPitch = asset(
    "sponsorship-pitch",
    `${productName} — Sponsorship Pitch`,
    "Brand",
    `Outreach email and one-page pitch deck template for brand partnerships`,
    `# ${productName}
## Sponsorship Pitch Templates

---

### Part 1: Cold Outreach Email

**Subject:** ${productName} x [BRAND NAME] — sponsorship inquiry

Hi [BRAND CONTACT NAME],

I run **${productName}** — a [content type: newsletter / channel / podcast / community] for ${targetAudience} focused on ${subject}.

I'm reaching out because [BRAND NAME]'s product is something I genuinely use and recommend to my audience — and I think a partnership would be valuable for both sides.

**Quick numbers:**
- Audience: [SIZE] ${audienceRole}
- Platform: [PRIMARY PLATFORM]
- Engagement rate: [%] (industry average for this niche: [benchmark])
- Average [open rate / views / listens]: [NUMBER]

**Why your audience and mine overlap:**
My audience is [SPECIFIC AUDIENCE DESCRIPTION]. They're the exact profile of someone who would benefit from [BRAND'S PRODUCT] because [SPECIFIC REASON].

I'm proposing [SPECIFIC PLACEMENT — e.g., "a 2-issue newsletter sponsorship" or "a dedicated video"]. Here's what that looks like and what I charge: [LINK TO RATE CARD or brief description].

Would you be open to a 20-minute call to see if it makes sense?

[YOUR NAME]
[LINK TO MEDIA KIT]

---

### Part 2: One-Page Sponsorship Deck (Text Version)

---

**${productName}**
Sponsorship Overview

---

**WHO WE ARE**

${productName} is [FORMAT] for ${targetAudience} focused on ${subject}.

We've built [NUMBER] [subscribers / followers / members] who are [SPECIFIC CHARACTERISTIC — e.g., "actively building businesses" or "senior professionals in X industry"].

---

**OUR AUDIENCE**

| Metric | Number |
|--------|--------|
| Total audience | [NUMBER] |
| Primary platform | [PLATFORM] |
| Avg. engagement rate | [%] |
| Avg. [opens / views / listens] | [NUMBER] |
| Audience growth (last 90 days) | [%] |

**Audience profile:**
- Role: ${audienceRole}
- Primary challenge: ${subject}
- What they're looking to achieve: [DESIRED OUTCOME]
- Tools they actively use: [RELEVANT TOOLS]

---

**WHAT WE OFFER**

| Package | Format | Price |
|---------|--------|-------|
| Solo send / Dedicated video | Your brand is the only sponsor | $[PRICE] |
| Primary placement | Top-of-[newsletter/video], 2–3 week run | $[PRICE] |
| Secondary placement | Mid-content mention | $[PRICE] |
| Bundle (4-week) | 4 placements across a month | $[PRICE] |

All packages include: custom integration (not a copy-paste ad), honest presentation to the audience, and a performance report within 7 days of campaign close.

---

**PAST PARTNERSHIPS**

[If applicable: Brand name, format, outcome / testimonial quote]
[If not yet: "We're selective about our first partners — we only work with brands we genuinely use and recommend."]

---

**CONTACT**

[YOUR NAME]
[EMAIL]
[WEBSITE]
[LINK TO BOOK A CALL]`,
    slug,
  );

  const mediaKit = asset(
    "media-kit",
    `${productName} — Media Kit`,
    "Brand",
    `Complete media kit — about, audience demographics, platform stats, rates, and past partnerships`,
    `# ${productName}
## Media Kit

*Last updated: [DATE]*

---

### About ${productName}

${productName} is [FORMAT] for ${targetAudience}. We cover ${subject} — with a focus on practical, actionable content that produces real results.

We started in [YEAR / MONTH] because [ORIGIN STORY — 1–2 sentences about why you started this and for whom]. Since then, we've grown to [NUMBER] [subscribers / followers / members] who [SPECIFIC THING ABOUT YOUR AUDIENCE — e.g., "open every issue" or "tune in every week without missing one"].

**Our mission in one sentence:**
Help ${targetAudience} master ${subject} — without the filler, the hype, or the vague advice.

---

### Audience Profile

**Who they are:** ${targetAudience}

**Demographics (estimated):**
- Primary age range: [AGE RANGE]
- Geography: [TOP 3 COUNTRIES / regions]
- Professional stage: [e.g., "early-to-mid career," "founders/operators," "freelancers"]
- Income range: [if known]

**Psychographics:**
- Actively working on [TOPIC AREA]
- Willing to invest in [PRODUCTS / TOOLS / EDUCATION] that help them improve
- Skeptical of generic advice — respond well to specific, honest content
- [ADDITIONAL CHARACTERISTIC specific to your audience]

**What they buy:**
[List 3–5 categories of products/services your audience purchases — tools, courses, services, etc. This helps brands understand fit.]

---

### Platform Stats

| Platform | Audience Size | Engagement | Avg. [Opens / Views / Listens] |
|----------|--------------|------------|-------------------------------|
| [Primary platform] | [NUMBER] | [%] | [NUMBER] |
| [Secondary platform] | [NUMBER] | [%] | [NUMBER] |
| [Third platform] | [NUMBER] | [%] | [NUMBER] |

**Growth rate (last 90 days):** +[%] or +[NUMBER]

*Note: All stats updated monthly. Verified data available on request.*

---

### Content Formats

| Format | Frequency | Avg. Performance |
|--------|-----------|-----------------|
| [Primary format — e.g., newsletter] | [FREQUENCY] | [METRIC] |
| [Secondary format] | [FREQUENCY] | [METRIC] |
| [Ad hoc format — e.g., deep-dive] | [FREQUENCY] | [METRIC] |

---

### Sponsorship Packages

**Solo Send / Dedicated Feature**
Your brand is the only topic in that [issue / episode / video]. Full attention, maximum real estate.
Price: $[PRICE]

**Primary Sponsor**
Top placement in [FORMAT]. Your brand is featured first, with the longest mention.
Price: $[PRICE] per [issue / episode / month]

**Secondary Sponsor**
Mid-content placement. Strong exposure without the Solo commitment.
Price: $[PRICE] per [issue / episode / month]

**Custom**
Affiliate arrangement, product review, or multi-month bundle — let's talk.

*All sponsorships include honest, native integration — not copy-paste ad reads. We only work with products we genuinely use or would recommend.*

---

### Testimonials

[QUOTE FROM PAST SPONSOR — e.g., "Working with ${productName} was one of the most efficient marketing decisions we made last year. The audience is exactly who we needed to reach, and the results reflected that." — [NAME, TITLE, COMPANY]]

[If no past sponsors yet: Remove this section or replace with audience testimonials about the content itself.]

---

### Past Partnerships

[Brand Name] — [Format] — [Brief outcome or "Ongoing partner"]
[Brand Name] — [Format] — [Brief outcome]

*First-time partner? We'd love to talk about what that looks like.*

---

### Contact

**For sponsorship inquiries:**
[YOUR NAME]
[EMAIL]
[LINK TO BOOK A CALL — Calendly or equivalent]

**Response time:** Within 48 hours on business days.`,
    slug,
  );

  return [contentCalendar, brandGuide, hookLibrary, sponsorshipPitch, mediaKit];
}

// ── Main dispatcher ───────────────────────────────────────────────────────────

export function generateAssets(input: AssetGenerationInput): GeneratedAsset[] {
  const ctx = buildContext(input);

  switch (input.productType) {
    case "study-guide-pack":
      return generateStudyGuidePack(ctx);
    case "ebook-pack":
      return generateEbookPack(ctx);
    case "notion-pack":
      return generateNotionPack(ctx);
    case "agency-pack":
      return generateAgencyPack(ctx);
    case "creator-pack":
      return generateCreatorPack(ctx);
    default:
      return generateEbookPack(ctx);
  }
}
