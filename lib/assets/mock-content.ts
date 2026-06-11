// Mock content generators for each product category.
// Content is injected with real product details to feel personalized.
// AI INTEGRATION POINT: replace each generator with a Gemini call
// using the same function signature. The orchestrator and UI are unaffected.

import type { GeneratedAsset, AssetType } from "./types";
import type { ProductAgentOutput, ResearchAgentOutput } from "@/lib/types/agents";
import type { BusinessFormData } from "@/types";

// ── Helpers ───────────────────────────────────────────────────────────────────

let assetCounter = 0;

function makeAsset(
  name: string,
  type: AssetType,
  category: string,
  description: string,
  content: string,
): GeneratedAsset {
  const wordCount = content.split(/\s+/).filter(Boolean).length;
  return {
    id: `asset_${++assetCounter}_${Date.now()}`,
    name,
    type,
    category,
    description,
    content,
    wordCount,
    estimatedPages: Math.max(1, Math.round(wordCount / 250)),
  };
}

// ── Ebook / Guide generators ──────────────────────────────────────────────────

export function generateEbookAssets(
  product: ProductAgentOutput,
  research: ResearchAgentOutput,
  _form: BusinessFormData,
): GeneratedAsset[] {
  const { productName, targetAudience, description, deliverables } = product;
  const { niche, marketGaps } = research;

  const toc = makeAsset(
    "Table of Contents",
    "table-of-contents",
    "Structure",
    "Complete chapter breakdown with sub-sections and page estimates",
    `# ${productName}
### Complete Table of Contents

---

## Introduction: The Opportunity in ${niche}
*Pages 1–8*

---

## Part I: Foundation

### Chapter 1: Why This Changes Everything
- 1.1 The Problem With How Most People Approach ${niche.split(" ")[0]}
- 1.2 The Framework That Actually Works
- 1.3 What You Will Be Able to Do by the End of This Book
- *Case Study: How One Person Went From Zero to Results in 60 Days*

### Chapter 2: Understanding ${targetAudience.split(" ").slice(0, 4).join(" ")}
- 2.1 Who This Book Is Really For
- 2.2 Common Mistakes That Keep People Stuck
- 2.3 The Mindset Shift That Changes Everything
- 2.4 Setting Realistic Milestones

---

## Part II: The Core System

### Chapter 3: Building Your Foundation
- 3.1 The Essential Starting Point
- 3.2 Tools and Resources You Actually Need (Free vs. Paid)
- 3.3 Your First 7-Day Action Plan
- *Template: Foundation Checklist*

### Chapter 4: ${deliverables[0] ?? "Core Strategy Implementation"}
- 4.1 Step-by-Step Walkthrough
- 4.2 The Most Common Stumbling Blocks
- 4.3 How to Know It's Working
- 4.4 Advanced Variations

### Chapter 5: ${deliverables[1] ?? "Scaling and Optimization"}
- 5.1 When You're Ready to Scale
- 5.2 The 80/20 of What Actually Drives Results
- 5.3 Delegation and Automation Strategies
- *Template: Progress Tracker*

---

## Part III: Growth and Monetization

### Chapter 6: Turning Knowledge Into Income
- 6.1 The Three Monetization Models That Work
- 6.2 Pricing Psychology for ${niche} Products
- 6.3 Building a Waiting List Before You Launch
- 6.4 Your 90-Day Revenue Roadmap

### Chapter 7: Common Pitfalls and How to Avoid Them
- 7.1 ${marketGaps[0] ?? "The Gap Nobody Talks About"}
- 7.2 What Successful People Do Differently
- 7.3 When to Pivot vs. When to Persist

### Chapter 8: Your Next 90 Days
- 8.1 Week-by-Week Action Plan
- 8.2 Tracking What Matters
- 8.3 Building Your Support System
- 8.4 Advanced Resources

---

## Appendices
- Appendix A: Recommended Tools and Resources
- Appendix B: Templates and Checklists
- Appendix C: Glossary of Key Terms
- Appendix D: Further Reading

---

*Total estimated length: 180–220 pages*
*Includes 12 templates, 8 checklists, 5 case studies*`,
  );

  const introduction = makeAsset(
    "Introduction",
    "introduction",
    "Content",
    "Full book introduction ready to publish",
    `# ${productName}

## Introduction: The Opportunity in ${niche}

---

**Before you read another word, I need to ask you something.**

How many times have you looked at someone succeeding in ${niche} and thought: *"That could be me — if only I knew exactly how to start"?*

If that question hit close to home, this book was written for you.

I'm not going to tell you this is easy. It isn't. But I am going to show you that it is *simpler* than the industry wants you to believe. There's a reason the people profiting most from the ${niche} space rarely share the real framework — because complexity is profitable for them, and simplicity is profitable for you.

### Why This Book Exists

This book exists because ${description.slice(0, 150)}...

The problem I kept seeing was this: ${targetAudience} had all the raw materials they needed to succeed — motivation, intelligence, even the right skills — but nobody had given them a coherent system to follow. They were piecing together advice from blog posts, YouTube videos, and Reddit threads, and ending up with a Frankenstein strategy that worked for nobody.

This book is the coherent system.

### What Makes This Different

Most resources in the ${niche} space are built around one of two failure modes:

**Failure Mode #1: Too theoretical.** Long explanations of *why* things work, with no concrete guidance on *how* to implement them. You finish the book feeling educated but no closer to taking action.

**Failure Mode #2: Too tactical.** A list of steps with no underlying framework. Works in the exact moment you read it, useless the moment anything changes.

This book operates at the intersection: a framework you can internalize once and apply forever, plus concrete tactics that generate results now.

### How to Use This Book

Read **Part I** (Chapters 1–2) in a single sitting. These chapters reframe how you think about ${niche.split(" ")[0]}, and that mental model shapes everything that follows.

Work through **Part II** (Chapters 3–5) with your laptop open. Every chapter ends with an implementation exercise. Do them. The readers who skip the exercises finish the book feeling inspired and do nothing. The readers who complete them finish the book with actual momentum.

Use **Part III** (Chapters 6–8) as an ongoing reference. Return to these chapters as your situation evolves.

### What You Will Have When You Finish

By the time you reach the final chapter, you will have:

${deliverables.map((d, i) => `${i + 1}. ${d}`).join("\n")}

These are not abstract outcomes. They are concrete artifacts you will have built, tested, and refined by working through this book.

### One Last Thing Before We Begin

The biggest differentiator between people who succeed with this material and people who don't is deceptively simple: **they start before they feel ready.**

Readiness is a myth. You don't become ready and then start. You start, and readiness follows.

Let's begin.

---

*— Chapter 1 starts on the next page*`,
  );

  const chapter1 = makeAsset(
    "Chapter 1 — Full Text",
    "chapter",
    "Content",
    "Complete first chapter with exercises and key takeaways",
    `# Chapter 1: Why This Changes Everything

---

> *"The people who are best at ${niche.split(" ")[0]} are not the most talented. They are the most systematic."*

---

## The Real Problem

Let's start with an uncomfortable truth.

The reason most ${targetAudience} never achieve meaningful results in ${niche} is not a lack of information. If anything, there's too much information. The real problem is the absence of a **decision-making framework** — a clear mental model for determining what to do, when, and why.

Without that framework, you're not building. You're reacting.

Every new tactic that appears on your timeline gets evaluated in isolation: *"Is this worth trying?"* And because you have no framework, the answer is always either "probably" or "I don't know." You try things, some work partially, most don't, and you conclude that you're either missing something or that you're not cut out for this.

You're not missing anything. You're missing a **system**.

## The Framework

After working with hundreds of ${targetAudience}, I've identified that those who succeed share a single structural advantage: they operate within a system that makes their decisions for them.

Here's what that system looks like at the highest level:

### Layer 1: Foundation (Weeks 1–2)
Before doing anything else, you establish your foundation. This means:
- Defining your specific target outcome (not "I want to succeed in ${niche}" but a quantified, time-bound goal)
- Auditing your current assets: time, skills, resources, relationships
- Identifying your one unfair advantage — the thing you can do better than 95% of competitors

Most people skip this layer. They're eager to get to the "real" work. This is why most people plateau.

### Layer 2: Execution (Weeks 3–8)
With your foundation set, you enter the execution phase. This is the longest phase, and the one where most frameworks fail you — because they assume execution is linear. It isn't.

Real execution looks like this:
1. **Sprint** — focused effort on one lever for 2 weeks
2. **Measure** — what actually moved? What didn't?
3. **Adjust** — double down on what worked, cut what didn't
4. **Repeat**

This cycle — Sprint, Measure, Adjust, Repeat — is the engine of everything in Part II of this book.

### Layer 3: Scale (Weeks 9+)
Once you have a working model, you scale it. Not before. Scaling a broken system just produces more broken results, faster.

Scaling looks different depending on your situation, but the principle is consistent: identify the highest-leverage input (the thing that produces the most output per unit of effort), then systematically increase your investment in that input while reducing everything else.

## The Mental Model Shift

Here's the shift that separates people who read books like this and feel inspired from people who read books like this and get results:

**From:** "What should I try next?"
**To:** "Does this fit my system? If yes, when? If no, why not?"

When you operate from the second question, your to-do list stops growing. Your results start compounding.

## Chapter 1 Implementation Exercise

Don't read Chapter 2 until you've completed this exercise. I'm serious.

**Step 1:** Write your specific target outcome for the next 90 days. Format: *"By [date], I will [measurable result] by [key action]."*

Example: *"By [date 90 days from now], I will have my first paying customer in ${niche} by completing and selling my first product."*

**Step 2:** List your three strongest assets. These can be skills, relationships, experience, or unique knowledge. For each one, write one sentence explaining how it connects to ${niche}.

**Step 3:** Identify your one unfair advantage. This is the thing you can do or know that your competitors in ${niche} cannot easily copy. Write it down in one sentence.

---

**Take 20 minutes and do this now. I'll see you in Chapter 2.**

---

## Key Takeaways

- The gap between people who succeed and people who don't in ${niche} is a framework, not talent or information
- The three-layer system (Foundation → Execution → Scale) provides the structure everything else plugs into
- The Sprint-Measure-Adjust-Repeat cycle is the engine of real progress
- No framework works if you skip the implementation exercises

---

*Chapter 2: Understanding ${targetAudience.split(" ").slice(0, 4).join(" ")} →*`,
  );

  const resources = makeAsset(
    "Resource Library",
    "resource-list",
    "Reference",
    "Curated tools, communities, and further reading for your journey",
    `# ${productName}
## Resource Library

*All resources have been vetted. Recommendations are based on what works, not affiliate relationships.*

---

## Essential Tools

### Getting Started (Free)
- **Notion** — note-taking, project management, and knowledge base (notion.so)
- **Canva** — design work, covers, social graphics (canva.com)
- **Gumroad** — sell digital products with zero upfront cost (gumroad.com)
- **ConvertKit Free** — email list up to 1,000 subscribers (convertkit.com)
- **Google Workspace** — docs, sheets, slides for collaboration (workspace.google.com)

### When You're Ready to Invest ($0–50/month)
- **Beehiiv** — newsletter platform with growth tools (beehiiv.com)
- **Loom** — async video communication and tutorials (loom.com)
- **Ahrefs Webmaster Tools** — SEO and content research (ahrefs.com/webmaster-tools)
- **Typefully** — social media scheduling (typefully.com)

---

## Communities Worth Your Time

- **${niche} subreddit** — peer support and market research
- **Indie Hackers** — product builders sharing real revenue numbers (indiehackers.com)
- **Creator Economy Facebook Group** — 50K+ creators discussing what works
- **Trends.vc** — weekly deep-dives on emerging market opportunities

---

## Books That Actually Matter

${deliverables.slice(0, 3).map((d, i) => `**${i + 1}. "${d.slice(0, 40)}"** — Directly applicable to building your ${niche} business`).join("\n")}

**4. "The $100 Startup" by Chris Guillebeau** — The definitive guide to launching on minimal resources
**5. "Obviously Awesome" by April Dunford** — Product positioning for non-marketers
**6. "Traction" by Gabriel Weinberg** — 19 channels for customer acquisition, tested systematically

---

## Templates Included With This Book

All templates are available in your downloads folder:

| Template | Format | Use Case |
|----------|--------|----------|
| 90-Day Action Plan | Notion / PDF | Weekly planning and tracking |
| Customer Avatar Worksheet | PDF | Define your ideal buyer |
| Pricing Calculator | Google Sheet | Set prices with confidence |
| Launch Checklist | Notion / PDF | Pre-launch validation steps |
| Content Calendar | Google Sheet | 12-week content plan |
| Revenue Tracker | Google Sheet | Monthly income tracking |

---

## Courses and Further Learning

- **"Write Once, Sell Forever"** — productizing knowledge
- **"The Last Content Strategy Course You'll Need"** — content that compounds
- **"Freelance to Agency"** — if you're building a service business

---

*Last updated: ${new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}*
*Resources are checked quarterly for relevance and availability.*`,
  );

  return [toc, introduction, chapter1, resources];
}

// ── Study Guide generators ────────────────────────────────────────────────────

export function generateStudyGuideAssets(
  product: ProductAgentOutput,
  research: ResearchAgentOutput,
  _form: BusinessFormData,
): GeneratedAsset[] {
  const { productName, targetAudience, deliverables } = product;
  const { niche } = research;

  const lesson = makeAsset(
    "Lesson 1 — Complete Outline",
    "lesson-outline",
    "Curriculum",
    "Full lesson with objectives, content outline, and activities",
    `# ${productName}
## Lesson 1: Foundations of ${niche.split(" ").slice(0, 3).join(" ")}

**Duration:** 45–60 minutes
**Level:** Beginner
**Prerequisites:** None

---

## Learning Objectives

By the end of this lesson, students will be able to:

1. Explain the core principles of ${niche} in plain language
2. Identify the three most common misconceptions that hold ${targetAudience} back
3. Complete the Foundation Assessment and know their starting point
4. Create their first 7-day action plan using the provided template

---

## Lesson Content

### Part 1: Why This Matters (10 min)

**Core Concept:** ${niche} is not a destination — it's a compounding system. The earlier you understand the fundamentals, the faster everything else accelerates.

**Key Points to Cover:**
- The difference between people who see results and people who don't (it's not talent)
- The three phases every successful practitioner moves through
- What "success" actually looks like in this space (realistic benchmarks)

**Discussion Prompt:** *"Before we go further: what does success in ${niche} look like for you specifically? Write it down — we'll come back to this in Lesson 8."*

---

### Part 2: The Core Framework (20 min)

**Framework Name:** The ${niche.split(" ")[0]} Success Stack

**Layer 1 — Mindset:** Understanding that ${niche} rewards consistency over intensity. Sporadic excellence loses to consistent adequacy every time.

**Layer 2 — Foundation:** The non-negotiable starting points. ${deliverables[0] ?? "Building your core system"} must happen before anything else.

**Layer 3 — Execution:** The daily/weekly habits that compound. ${deliverables[1] ?? "Ongoing implementation and optimization"}.

**Layer 4 — Scale:** Only relevant once Layers 1–3 are solid. Scaling a broken system produces broken results faster.

**Visual Aid:** Draw the stack on a whiteboard or share the included slide. Have students identify which layer they're currently operating in.

---

### Part 3: Common Mistakes (10 min)

**The Three Traps:**

**Trap #1: Starting at Layer 4**
Most people want to skip to "scale" before their foundation is solid. This is the #1 cause of plateau. *Example: Spending money on ads before you know your offer converts.*

**Trap #2: Optimization Addiction**
Constantly tweaking instead of executing. If you've adjusted the same thing more than twice without collecting real data, you're procrastinating with extra steps.

**Trap #3: Shiny Object Syndrome**
Every new tactic looks like a shortcut. Most aren't. Use the framework to evaluate: *"Does this strengthen one of my four layers? If not, it can wait."*

---

### Part 4: Application Exercise (15 min)

**Foundation Assessment (complete individually):**

1. Rate your current knowledge of ${niche} fundamentals: 1–10
2. What is your single biggest obstacle right now?
3. What have you already tried? What worked? What didn't?
4. What does success look like for you in 90 days?

**7-Day Quick-Start Plan:**
- Day 1–2: Complete the Foundation Assessment above
- Day 3–4: Read the recommended resource list (see Appendix A)
- Day 5–6: Complete the Starter Template (included in your materials)
- Day 7: Share your plan with an accountability partner

---

## Assessment

**Formative (during lesson):**
- Discussion response: 2–3 sentences on their current starting point
- Layer identification: Which layer are they in?

**Summative (before Lesson 2):**
- Foundation Assessment completed and submitted
- 7-Day plan written out

---

## Resources for This Lesson

- Lesson 1 Slides (included)
- Foundation Assessment Worksheet (included)
- 7-Day Quick-Start Template (included)
- Recommended Reading: See Resource Library

---

*Lesson 2: ${deliverables[0] ?? "Building Your Core System"} →*`,
  );

  const flashcards = makeAsset(
    "Flashcard Deck — 20 Cards",
    "flashcard-deck",
    "Study Tools",
    "20 study flashcards covering core concepts and terminology",
    `# ${productName}
## Flashcard Deck — Core Concepts

*Print and cut, or import into Anki for spaced repetition*

---

**Card 1**
**Q:** What is the single most important factor separating successful ${niche} practitioners from those who plateau?
**A:** Consistency of execution within a clear framework — not talent, resources, or luck. Consistent mediocrity outperforms sporadic excellence.

---

**Card 2**
**Q:** Define the "Foundation Layer" in the ${niche.split(" ")[0]} Success Stack.
**A:** The non-negotiable prerequisites that must be in place before any other layer can function. Skipping this causes 80% of observed failures.

---

**Card 3**
**Q:** What is "Optimization Addiction" and why is it harmful?
**A:** The habit of constantly adjusting a system before collecting meaningful data. It produces the feeling of work without the results of work.

---

**Card 4**
**Q:** At what point should you focus on scaling?
**A:** Only when Layers 1–3 (Mindset, Foundation, Execution) are producing consistent, measurable results. Scaling before then amplifies problems.

---

**Card 5**
**Q:** What is the Sprint-Measure-Adjust-Repeat cycle?
**A:** A 2-week focused effort on one lever (Sprint), followed by analysis of what moved (Measure), followed by doubling down on what worked and cutting what didn't (Adjust), then repeating.

---

**Card 6**
**Q:** What is "${niche}" at its core?
**A:** ${research.opportunitySummary.slice(0, 120)}...

---

**Card 7**
**Q:** Who is the ideal person for ${productName}?
**A:** ${targetAudience}

---

**Card 8**
**Q:** Name three things that must be in place before focusing on customer acquisition.
**A:** (1) A validated offer that people want to pay for, (2) A delivery system that can fulfill without you personally managing every step, (3) A clear value proposition that differentiates you from alternatives.

---

**Card 9**
**Q:** What does "unfair advantage" mean in the context of ${niche}?
**A:** The specific combination of skills, experience, relationships, or knowledge you possess that competitors cannot easily replicate. Your job is to identify it and build around it.

---

**Card 10**
**Q:** What is "Shiny Object Syndrome" and how do you protect against it?
**A:** The tendency to abandon a working system in favor of new tactics. Protection: run every new tactic through the framework test — "Does this strengthen one of my four layers?" If not, defer it.

---

**Card 11**
**Q:** What is the difference between a tactic and a strategy?
**A:** A tactic is a specific action (e.g., posting on LinkedIn 3x/week). A strategy is the framework that determines which tactics to use and when. Having tactics without a strategy is the #1 cause of wasted effort.

---

**Card 12**
**Q:** ${deliverables[0] ?? "What is the first deliverable in the core curriculum?"}
**A:** The implementation system that produces your first measurable results within the first 30 days of the program.

---

**Card 13**
**Q:** What is the 80/20 rule as applied to ${niche}?
**A:** In almost every case, 20% of actions produce 80% of results. Your job is to identify your 20% through experimentation and ruthlessly focus on it.

---

**Card 14**
**Q:** Name the three types of assets every ${niche.split(" ")[0]} practitioner should build.
**A:** (1) Knowledge assets — documented systems and frameworks, (2) Relationship assets — people who can refer, collaborate, or amplify, (3) Distribution assets — owned audiences that don't depend on platforms.

---

**Card 15**
**Q:** When is the right time to pivot vs. persist?
**A:** Pivot when you've run at least three Sprint cycles with consistent measurement and the core metric has not moved. Persist when results are directionally correct but not yet at target — patience here is often misidentified as the problem.

---

**Card 16**
**Q:** What is "market gap" and why does it matter?
**A:** A need that exists in a market that current offerings don't adequately address. Identified gaps: ${research.marketGaps.slice(0, 2).join("; ")}.

---

**Card 17**
**Q:** What is the difference between a product and a solution?
**A:** A product is what you sell. A solution is what the customer experiences as a result of buying it. Successful businesses sell the product and market the solution.

---

**Card 18**
**Q:** How do you price a digital product?
**A:** Start with the value delivered (what outcome is the buyer getting?), research comparable products in the market, and test. Never price based on time spent creating — price based on transformation delivered.

---

**Card 19**
**Q:** What are the three most important metrics to track in the first 90 days?
**A:** (1) Number of conversations with potential customers, (2) Conversion rate from conversation to sale, (3) Customer satisfaction score after delivery.

---

**Card 20**
**Q:** What is the single most common reason people quit before seeing results?
**A:** They set unrealistic timelines. Real results in ${niche} typically emerge at 60–90 days of consistent effort. Most people quit at day 30–45, just before the compounding begins.

---

*Import into Anki: copy Q&A pairs into Anki's text import format for optimal spaced repetition*`,
  );

  const quiz = makeAsset(
    "Module 1 Quiz — 10 Questions",
    "quiz",
    "Assessment",
    "Complete quiz with questions, answer key, and explanations",
    `# ${productName}
## Module 1 Assessment Quiz

**Instructions:** Answer each question before checking the answer key. Score yourself at the end — 8+/10 means you're ready for Module 2.

---

**Question 1**
What is the primary reason most ${targetAudience} plateau in ${niche}?

a) Lack of talent
b) Insufficient resources
c) Absence of a clear framework
d) Too much competition

**Answer: C**
*Explanation: Resources and talent are rarely the limiting factor. The framework determines how effectively everything else gets deployed.*

---

**Question 2**
In the ${niche.split(" ")[0]} Success Stack, which layer should be established first?

a) Scale
b) Execution
c) Foundation
d) Mindset

**Answer: C**
*Explanation: While mindset is foundational philosophically, the Foundation layer contains the concrete non-negotiables that must be in place before execution begins.*

---

**Question 3**
A student runs a 2-week sprint, measures results, and sees no meaningful improvement. What should they do?

a) Scale up their effort immediately
b) Pivot to a completely different approach
c) Run a second sprint with one variable changed
d) Consider that ${niche} isn't right for them

**Answer: C**
*Explanation: One data point is insufficient. Change one variable and run another sprint before drawing conclusions.*

---

**Question 4**
Which of the following is an example of "Optimization Addiction"?

a) Spending 2 weeks testing pricing before launching
b) Adjusting your sales page copy for the third time in a week without new traffic data
c) Running a sprint on a new customer acquisition channel
d) Updating your product based on customer feedback

**Answer: B**
*Explanation: Without new data, the third adjustment is procrastination dressed as productivity.*

---

**Question 5**
What is the correct definition of "unfair advantage"?

a) Having more money than competitors
b) Starting earlier than competitors
c) A specific combination of assets that competitors cannot easily replicate
d) Having a better product

**Answer: C**
*Explanation: Money and timing are advantages but not unfair advantages — they can be replicated. True unfair advantage comes from unique combinations of knowledge, relationships, and experience.*

---

**Question 6**
When evaluating a new tactic, the correct framework question is:

a) "Is this working for other people?"
b) "Does this strengthen one of my four layers?"
c) "Is this free to implement?"
d) "Will this scale?"

**Answer: B**
*Explanation: Other people's results are irrelevant to your system. The only question that matters is whether the tactic strengthens your specific framework.*

---

**Question 7**
What percentage of actions typically produce 80% of results?

a) 50%
b) 30%
c) 20%
d) 10%

**Answer: C**
*Explanation: The Pareto Principle — 20% of inputs drive 80% of outputs — applies consistently across ${niche} contexts.*

---

**Question 8**
A practitioner has run three consecutive Sprint cycles with consistent measurement. Core metrics have not moved. The correct action is:

a) Run a fourth identical sprint
b) Take a break
c) Pivot — the data justifies it
d) Increase budget

**Answer: C**
*Explanation: Three cycles is sufficient data to conclude a core assumption is wrong. Continuing is not persistence — it's ignoring evidence.*

---

**Question 9**
${deliverables[0] ?? "The first key deliverable"} is most important because:

a) It generates the most revenue
b) It produces the first measurable results that validate the system
c) It's the easiest to complete
d) It impresses potential customers

**Answer: B**
*Explanation: First results build confidence and provide the data needed to make informed decisions about everything that follows.*

---

**Question 10**
At what point does the typical practitioner in ${niche} begin to see compounding results?

a) Week 1–2
b) Week 3–4
c) Day 30–45
d) Day 60–90

**Answer: D**
*Explanation: Compounding requires sufficient repetitions to show directional trends. Most practitioners quit at day 30–45, just before the compounding begins.*

---

## Scoring

| Score | Interpretation |
|-------|---------------|
| 10/10 | Ready for Module 2 — excellent foundation |
| 8–9/10 | Ready for Module 2 — review missed questions |
| 6–7/10 | Revisit Lessons 1–3 before continuing |
| <6/10 | Complete all lesson exercises before retaking |

---

*Module 2 Quiz unlocks after completing the Module 2 exercises*`,
  );

  const worksheet = makeAsset(
    "Foundation Worksheet",
    "worksheet",
    "Study Tools",
    "Printable worksheet with exercises for Lessons 1–3",
    `# ${productName}
## Foundation Worksheet — Lessons 1–3

*Complete this worksheet before moving to Module 2. Keep it — you'll reference it in Lesson 8.*

---

## Section 1: Your Starting Point

**Exercise 1.1 — Current State Assessment**

Rate yourself honestly on each dimension (1 = completely new, 10 = expert-level):

| Dimension | Your Rating | Notes |
|-----------|-------------|-------|
| Knowledge of ${niche} fundamentals | ___ / 10 | |
| Current consistency of effort | ___ / 10 | |
| Clarity on your target outcome | ___ / 10 | |
| Strength of your foundation | ___ / 10 | |

**Your lowest score is your first priority.** Write it here: _______________

---

**Exercise 1.2 — Your 90-Day Outcome Statement**

Using the format below, write your specific outcome for the next 90 days.

*"By [date: ___________], I will [measurable result: ___________] by [key action: ___________]."*

Your statement:

> _______________________________________________________________
> _______________________________________________________________

---

## Section 2: Your Unfair Advantage

**Exercise 2.1 — Asset Inventory**

List your three strongest assets. For each, write one sentence connecting it to ${niche}.

| Asset (skill, knowledge, relationship, experience) | How it connects to ${niche} |
|-----------------------------------------------------|------------------------------|
| 1. | |
| 2. | |
| 3. | |

**Exercise 2.2 — Unfair Advantage**

Your unfair advantage is the combination of assets that competitors cannot easily copy. Looking at your inventory above, complete this sentence:

*"My unfair advantage in ${niche} is: _______________________________________________"*

---

## Section 3: Framework Application

**Exercise 3.1 — Layer Identification**

Which layer of the ${niche.split(" ")[0]} Success Stack are you currently operating in?

☐ Layer 1 — Mindset (I understand the principles but haven't applied them consistently)
☐ Layer 2 — Foundation (I'm building the non-negotiable prerequisites)
☐ Layer 3 — Execution (I have a foundation and am running consistent sprints)
☐ Layer 4 — Scale (I have a working model and I'm increasing inputs)

**What does moving to the next layer require from you?**

_______________________________________________________________
_______________________________________________________________

---

**Exercise 3.2 — Sprint Planning**

Plan your first 2-week sprint using the format below:

**Sprint Start Date:** _______________
**Sprint End Date:** _______________

**The one lever I'm focusing on:** _______________________________________________

**How I'll measure success:** _______________________________________________

**What "success" looks like at the end of 2 weeks:** _______________________________________________

**Potential obstacles:** _______________________________________________

**How I'll overcome them:** _______________________________________________

---

## Section 4: Commitment

Write 2–3 sentences on why succeeding with ${niche} matters to you. Be specific — vague answers produce vague motivation.

_______________________________________________________________
_______________________________________________________________
_______________________________________________________________

---

**Sign and date this worksheet.** Sounds old-fashioned. Works.

Name: ___________________________ Date: ___________________

---

*Submit this worksheet to [instructor/accountability partner] before accessing Lesson 4.*`,
  );

  return [lesson, flashcards, quiz, worksheet];
}

// ── Agency Service generators ─────────────────────────────────────────────────

export function generateAgencyAssets(
  product: ProductAgentOutput,
  research: ResearchAgentOutput,
  _form: BusinessFormData,
): GeneratedAsset[] {
  const { productName, targetAudience, description, suggestedPrice } = product;
  const { niche } = research;

  const proposal = makeAsset(
    "Client Proposal Template",
    "proposal-template",
    "Templates",
    "Professional proposal template, fully editable for each client",
    `# ${productName}
## Client Proposal

---

**Prepared for:** [Client Name]
**Prepared by:** [Your Name / Company]
**Date:** [Date]
**Proposal Valid Until:** [Date + 14 days]

---

## Executive Summary

[Client Name] is [1–2 sentences about the client and their situation]. This proposal outlines how ${productName} will help [client name] achieve [their specific goal] through ${description.slice(0, 100)}...

Based on our initial conversation, we understand your primary objectives are:
1. [Objective 1 from discovery call]
2. [Objective 2 from discovery call]
3. [Objective 3 from discovery call]

This proposal addresses each of these directly.

---

## About ${productName}

We specialize in ${niche} for ${targetAudience}. Unlike generalist agencies, we focus exclusively on this space — which means:

- **Deeper expertise.** We understand your market, your customers, and your competitive landscape better than any generalist could.
- **Faster time-to-results.** No learning curve. We've solved this problem before.
- **Proven systems.** Everything we deliver has been tested with clients who started exactly where you are now.

---

## Scope of Work

### Phase 1: Discovery and Foundation (Week 1–2)
- Initial strategy session (90 min)
- Market and competitor analysis
- Current-state audit: [specific deliverable]
- Foundation document delivered by end of Week 2

### Phase 2: Implementation (Weeks 3–8)
- [Deliverable 1]: completed by Week 4
- [Deliverable 2]: completed by Week 6
- [Deliverable 3]: completed by Week 8
- Weekly 30-min check-in calls throughout

### Phase 3: Optimization and Handoff (Weeks 9–12)
- Results analysis and optimization
- Documentation of all systems
- Team training session (2 hours)
- 30-day post-project support

---

## Investment

| Package | Includes | Investment |
|---------|----------|------------|
| **Foundation** | Phase 1 only | [Price] |
| **Complete** | Phases 1–3 | ${suggestedPrice} |
| **Ongoing Retainer** | Monthly optimization | [Price/mo] |

**Payment terms:**
- 50% due upon signing to begin work
- 50% due at Phase 2 completion
- Net-15 invoicing for retainer

---

## Timeline

| Milestone | Date |
|-----------|------|
| Contract signed | [Day 0] |
| Phase 1 kickoff | [Day 1] |
| Foundation document delivered | [Day 14] |
| Phase 2 complete | [Day 56] |
| Final delivery | [Day 84] |

---

## Why Work With Us

**[Client Reference 1]** — [Industry, 1-sentence result]
*"[Short testimonial quote]"*

**[Client Reference 2]** — [Industry, 1-sentence result]
*"[Short testimonial quote]"*

**[Client Reference 3]** — [Industry, 1-sentence result]
*"[Short testimonial quote]"*

---

## Terms and Conditions

- All deliverables are clearly defined in the Scope of Work above
- Additional scope requires a written change order
- Client is responsible for providing timely feedback (within 48 hours of delivery)
- Intellectual property for custom work transfers to client upon final payment
- Either party may terminate with 30 days written notice; work completed to date is billed

---

## Next Steps

1. Review this proposal and note any questions
2. Reply to this email confirming acceptance, or request a call to discuss
3. We'll send the contract and invoice for 50% deposit
4. Kickoff scheduled within 3 business days of contract signing

---

*Questions? Reply to this email or schedule a call: [your calendar link]*

---

**Accepted by:**

Client: ___________________________ Date: ___________________

Provider: ___________________________ Date: ___________________`,
  );

  const onboarding = makeAsset(
    "Client Onboarding Checklist",
    "onboarding-checklist",
    "Operations",
    "Complete onboarding workflow from signed contract to project kickoff",
    `# ${productName}
## Client Onboarding Checklist

*Complete all items in order. Do not skip steps — each builds on the previous.*

---

## Phase 1: Pre-Kickoff (Days 1–3 after contract signing)

### Administrative
☐ Send signed contract to client (within 2 hours of receiving theirs)
☐ Send deposit invoice (within 24 hours of contract)
☐ Confirm deposit received before scheduling kickoff
☐ Add client to your CRM with all contact details
☐ Create client folder in project management system
☐ Set up shared communication channel (Slack / email thread)

### Information Gathering
☐ Send Welcome Email with Client Intake Form (see template)
☐ Request access to: [list specific assets — e.g., analytics, ad accounts, social profiles]
☐ Schedule kickoff call (90 min) within 3 days of deposit
☐ Confirm kickoff call via calendar invitation with agenda

### Internal Setup
☐ Assign internal team lead
☐ Schedule internal briefing for team
☐ Create project timeline in PM tool
☐ Set up billing schedule reminders

---

## Phase 2: Kickoff Call (Day 3–5)

### Before the Call
☐ Review all intake form responses
☐ Research client's current situation (website, social, competitors)
☐ Prepare agenda and share with client 24 hours in advance
☐ Test video call link 30 minutes before

### During the Call
☐ Introduce team members and roles
☐ Confirm understanding of client's goals
☐ Walk through project timeline milestone by milestone
☐ Clarify communication expectations: response times, check-in frequency, escalation path
☐ Confirm access to all needed assets
☐ Schedule next check-in call

### After the Call
☐ Send call summary email within 4 hours
☐ Confirm all outstanding access requests
☐ Begin Phase 1 work

---

## Phase 3: First Deliverable (Week 2)

☐ Complete Phase 1 discovery work
☐ Send first deliverable for review
☐ Allow 48-hour review window
☐ Incorporate feedback
☐ Deliver revised version
☐ Get written approval before proceeding to Phase 2

---

## Welcome Email Template

**Subject:** Welcome to ${productName} — let's get started

Hi [Name],

We're excited to begin working with you. Here's what happens next:

**Immediate next step:** Complete the Client Intake Form: [link]
This takes about 15 minutes and ensures our kickoff call is as productive as possible.

**Your kickoff call** is confirmed for [date/time]. You'll receive a calendar invite shortly.

**Communication:** [Explain your preferred channel and response time commitment]

Please don't hesitate to reach out with any questions before our kickoff.

Looking forward to it,
[Your name]

---

## Client Intake Form Questions

1. What does success look like for this engagement in specific, measurable terms?
2. What have you already tried? What worked? What didn't?
3. Who else internally will be involved in this project?
4. What's your biggest concern about this project?
5. Are there any deadlines, constraints, or sensitivities we should know about?
6. How do you prefer to receive feedback — directly or diplomatically?
7. What does a great working relationship look like to you?`,
  );

  const sop = makeAsset(
    "SOP — Delivery Process",
    "sop-document",
    "Operations",
    "Standard operating procedure for consistent, repeatable client delivery",
    `# ${productName}
## Standard Operating Procedure: Client Delivery

**SOP Version:** 1.0
**Effective Date:** ${new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
**Owner:** Operations Lead
**Review Cycle:** Quarterly

---

## Purpose

This SOP ensures that every client receives a consistent, high-quality experience regardless of which team member is leading their project. Consistency is the foundation of reputation.

---

## Scope

Applies to all active client engagements in the ${niche} service category.

---

## The Delivery Framework

### Step 1: Discovery (Week 1)

**Objective:** Understand the client's situation deeply enough to produce accurate, relevant recommendations.

**Actions:**
1. Review all intake form responses before any work begins
2. Conduct market research: analyze top 3 competitors in client's specific niche
3. Audit current assets: [list what you audit — e.g., website, social profiles, ad accounts]
4. Document findings in the Discovery Report template
5. Identify 3–5 specific opportunities and 2–3 potential risks

**Output:** Discovery Report delivered by end of Day 5

**Quality check:** Has another team member reviewed the report for gaps or errors?

---

### Step 2: Strategy (Week 2)

**Objective:** Translate discoveries into a concrete, prioritized action plan.

**Actions:**
1. Map findings to client objectives from kickoff call
2. Build 90-day roadmap: what happens, in what order, why
3. Identify success metrics for each initiative
4. Present strategy to client in 60-min session
5. Get written approval before execution begins

**Output:** Strategy Document + approved project plan

**Quality check:** Does every recommended action connect directly to a client objective?

---

### Step 3: Execution (Weeks 3–10)

**Objective:** Deliver against the approved plan, maintaining quality and communication at every step.

**Weekly Rhythm:**
- Monday: Review week's deliverables, assign tasks
- Wednesday: Internal check-in — are we on track?
- Thursday: Prepare client-facing update
- Friday: Send weekly progress update to client

**Communication Standards:**
- Respond to client messages within 4 business hours
- Send weekly progress updates every Friday by 5pm
- Flag problems proactively — never let the client discover an issue before you've raised it

**Deliverable Standards:**
- Every deliverable gets a second review before client sees it
- Include "how to use this" instructions with every document
- Request written approval before proceeding to next phase

---

### Step 4: Optimization (Weeks 9–12)

**Objective:** Measure, learn, and improve before handoff.

**Actions:**
1. Compile performance data for all executed initiatives
2. Identify what worked, what didn't, and why
3. Adjust and optimize based on data
4. Document all systems for client's team to maintain
5. Conduct training session with client team

**Output:** Final Report + System Documentation

---

### Step 5: Offboarding

**Objective:** Leave the client in a stronger position than they started, with everything they need to sustain results.

**Checklist:**
☐ Final Report delivered and approved
☐ All assets transferred to client
☐ All credentials returned or revoked
☐ Team training complete
☐ 30-day support window communicated
☐ Testimonial requested
☐ Referral conversation had
☐ Case study permission requested
☐ Client folder archived

---

## Quality Standards

**Response Time:** Maximum 4 business hours for client messages
**Deliverable Turnaround:** As committed, or proactively communicated in advance
**Review Requirement:** Every external deliverable reviewed by second team member
**Escalation:** Any risk to timeline or quality flagged within 24 hours of identification

---

## Continuous Improvement

At the end of every engagement, the team lead completes a retrospective:
1. What went well? (What should we repeat?)
2. What didn't go well? (What needs to change?)
3. What did the client specifically praise?
4. What would we do differently?

Retrospective findings feed into quarterly SOP reviews.`,
  );

  const outreach = makeAsset(
    "Outreach Scripts",
    "outreach-script",
    "Sales",
    "Cold email, LinkedIn DM, and follow-up templates for client acquisition",
    `# ${productName}
## Outreach Scripts — Client Acquisition

*Personalize every script. These are frameworks, not copy-paste templates.*

---

## Cold Email Script A — Direct Value Offer

**Subject:** [Specific observation] about [Company Name]

Hi [First Name],

I noticed [specific, genuine observation about their business — a gap, an opportunity, something they're doing well that you can help them do better].

We help ${targetAudience} [specific result we get them]. Most clients see [specific outcome] within [realistic timeframe].

I think there's a specific opportunity for [Company Name] with [one specific thing related to your observation].

Would a 20-minute call this week be worth it? I'll show you exactly what I'm seeing.

[Your name]

---

**P.S.** Not a fit? Reply and tell me what's actually on your radar — I may know someone who can help.

---

## Cold Email Script B — Case Study Driven

**Subject:** How we helped [Similar Company] [achieve result]

Hi [First Name],

We recently helped [Company Name] — a ${niche} business similar to yours — [achieve specific result] in [timeframe].

The core thing we did: [one-sentence explanation of the approach].

I took a look at [their company] and I think a similar approach could work for you, specifically because [specific reason].

Interested in seeing the full case study + a breakdown of how it might apply to you?

[Your name]

---

## LinkedIn Connection Message (300 chars max)

Hi [Name] — I work with ${targetAudience} on ${niche}. Noticed [specific observation about their profile/company]. Would love to connect — might have something useful for you.

---

## LinkedIn DM (After Connection)

Hi [Name], thanks for connecting.

Quick context on why I reached out: [genuine specific reason].

We specialize in [specific thing] for [specific type of company]. Recently worked with [name-drop or description] on [result].

Not sure if timing is right for you, but if [specific problem you solve] is on your radar, I'd love to have a quick conversation.

Worth a 20-min call?

---

## Follow-Up Sequence

**Follow-Up 1 (Day 3 after no response):**

Subject: Re: [original subject]

Just bumping this up — easy to miss.

Happy to share the [case study / specific resource] regardless of whether we work together.

Worth a quick call?

---

**Follow-Up 2 (Day 7):**

Subject: Last note from me

Hi [Name],

I know your inbox is a warzone.

I'll make this simple: if [specific pain point] is something you're dealing with, we can probably help. If not, no worries at all.

Either way — good luck with [something specific about their business you noticed].

[Your name]

---

## The "Break-Up" Email (Day 14)

Subject: Closing the loop

Hi [Name],

I've sent a couple of notes and haven't heard back — totally understand, timing might just be off.

I'm going to stop following up so I'm not cluttering your inbox. If ${niche} ever becomes a priority and you'd like to explore what we do, I'm easy to find.

Good luck with everything,
[Your name]

---

## Script Notes

- **Personalization is non-negotiable.** A generic email is worse than no email.
- **Short is better.** Every extra sentence is a reason to stop reading.
- **One clear CTA per email.** "Would a 20-min call work?" Not "let me know your thoughts/questions/availability."
- **Test, measure, iterate.** Track open rate, reply rate, meeting booking rate for each script.`,
  );

  return [proposal, onboarding, sop, outreach];
}

// ── Notion System generators ──────────────────────────────────────────────────

export function generateNotionAssets(
  product: ProductAgentOutput,
  research: ResearchAgentOutput,
  _form: BusinessFormData,
): GeneratedAsset[] {
  const { productName, targetAudience, deliverables } = product;
  const { niche } = research;

  const dbSchema = makeAsset(
    "Database Architecture",
    "database-schema",
    "Structure",
    "Complete database schema with all properties, relations, and rollups",
    `# ${productName}
## Database Architecture

*Build these databases in the order listed. Databases 1–3 are the core. 4–6 extend functionality.*

---

## Database 1: Projects

**Purpose:** Central hub for all active and archived projects.

| Property | Type | Values / Notes |
|----------|------|----------------|
| Name | Title | Project name |
| Status | Select | Planning / Active / On Hold / Complete / Archived |
| Priority | Select | Critical / High / Medium / Low |
| Owner | Person | Assigned team member |
| Due Date | Date | Target completion date |
| Progress | Number | % complete (0–100) |
| Budget | Number | Allocated budget |
| Spent | Rollup | Sum from Expenses database |
| Tasks | Relation | → Tasks database |
| Notes | Text | Free-form project notes |
| Created | Created time | Auto |

**Views to create:**
- All Projects (default table)
- My Projects (filter: Owner = Me)
- Active Board (kanban by Status)
- Timeline (by Due Date)
- Priority Queue (sort by Priority + Due Date)

---

## Database 2: Tasks

**Purpose:** All action items, linked to projects.

| Property | Type | Values / Notes |
|----------|------|----------------|
| Task | Title | What needs to be done |
| Project | Relation | → Projects database |
| Status | Select | To Do / In Progress / Review / Done / Cancelled |
| Priority | Select | Urgent / High / Normal / Low |
| Assigned | Person | Who owns this task |
| Due Date | Date | When it's due |
| Time Estimate | Number | Hours estimated |
| Time Logged | Number | Hours actually spent |
| Blocked By | Relation | → Tasks (self-referential) |
| Notes | Text | Additional context |
| Created | Created time | Auto |

**Views to create:**
- My Tasks Today (filter: Assigned = Me, Due = Today)
- Sprint Board (kanban by Status)
- Overdue (filter: Due Date < Today, Status ≠ Done)
- By Project (group by Project)

---

## Database 3: ${niche.split(" ")[0]} Tracker

**Purpose:** Track ${niche}-specific metrics and progress.

| Property | Type | Values / Notes |
|----------|------|----------------|
| Entry | Title | What you're tracking |
| Date | Date | When |
| Category | Select | ${deliverables.slice(0, 4).map((d) => d.split(" ").slice(0, 2).join(" ")).join(" / ")} |
| Status | Select | Active / Completed / Paused |
| Metric | Number | Primary performance metric |
| Notes | Text | Context and learnings |
| Linked Project | Relation | → Projects database |

---

## Database 4: Contacts / CRM

| Property | Type | Values / Notes |
|----------|------|----------------|
| Name | Title | Full name |
| Company | Text | Organization |
| Role | Text | Job title |
| Email | Email | Primary email |
| Phone | Phone | Primary phone |
| Status | Select | Lead / Prospect / Client / Partner / Archived |
| Source | Select | Referral / Outbound / Inbound / Event / Social |
| Last Contact | Date | Most recent interaction |
| Next Action | Text | What happens next |
| Notes | Text | Relationship notes |
| Projects | Relation | → Projects database |

---

## Database 5: Resources / Knowledge Base

| Property | Type | Values / Notes |
|----------|------|----------------|
| Title | Title | Resource name |
| Type | Select | Article / Video / Template / Tool / Book / Course |
| Category | Select | [match your ${niche} categories] |
| URL | URL | Source link |
| Rating | Select | ★ / ★★ / ★★★ |
| Status | Select | To Review / Reviewed / Archived |
| Summary | Text | Key takeaways |
| Tags | Multi-select | Flexible tagging |

---

## Relations Map

\`\`\`
Projects ←→ Tasks (one-to-many)
Projects ←→ Contacts (many-to-many)
Projects ←→ Resources (many-to-many)
Tasks ←→ Tasks (self-referential: blocked-by)
\`\`\`

---

## Setup Order

1. Create Tasks database first (no relations needed)
2. Create Projects — add relation to Tasks
3. Create ${niche.split(" ")[0]} Tracker — add relation to Projects
4. Create Contacts — add relation to Projects
5. Create Resources (standalone, no required relations)
6. Build the Dashboard page (see Page Template document)`,
  );

  const dashboard = makeAsset(
    "Dashboard Page Template",
    "page-template",
    "Templates",
    "Main workspace dashboard with all key views and navigation",
    `# ${productName}
## Dashboard — Setup Guide

*This page becomes your daily home base. Build it once, use it forever.*

---

## Page Structure

\`\`\`
🏠 Dashboard (main page)
├── 📊 Overview Section
│   ├── Active Projects (filtered view)
│   ├── My Tasks Today (filtered view)
│   └── Key Metrics (linked database views)
├── 📅 Weekly Focus
│   ├── This Week's Priorities
│   └── Sprint Goals
├── 🔗 Quick Links
│   ├── → All Projects
│   ├── → Task Board
│   ├── → ${niche.split(" ")[0]} Tracker
│   └── → Knowledge Base
└── 📝 Recent Notes
    └── (linked from Journals/Notes database)
\`\`\`

---

## Section 1: Overview

**Header:** Use Heading 1 — "Dashboard" with a relevant emoji

**Active Projects widget:**
- Embed: Projects database
- Filter: Status = Active
- View: Gallery or Board
- Properties shown: Name, Status, Progress, Due Date, Owner

**My Tasks Today widget:**
- Embed: Tasks database
- Filter: Assigned = Me AND Due Date = Today
- Sort: Priority descending
- View: List

---

## Section 2: Weekly Focus

**This section resets every Monday.**

Template to fill in each week:

### Week of [Date]

**3 priorities this week:**
1.
2.
3.

**Sprint goal:** [one sentence]

**Potential blockers:**
-

**Energy/bandwidth this week:** High / Medium / Low

---

## Section 3: Metrics Dashboard

*Create gallery or list views of your ${niche.split(" ")[0]} Tracker database.*

**Key metrics to surface:**
- Total active projects: [rollup]
- Tasks completed this week: [filtered view count]
- [${deliverables[0] ?? "Primary metric"}]: [linked tracker view]
- [${deliverables[1] ?? "Secondary metric"}]: [linked tracker view]

---

## Section 4: Quick Navigation

Create a simple link grid using Notion's columns feature:

| | | |
|-|-|-|
| 📋 All Projects | ✅ Task Board | 📊 ${niche.split(" ")[0]} Tracker |
| 👥 Contacts | 📚 Resources | 📝 Notes |

---

## Daily Use Workflow

**Morning (5 min):**
1. Open Dashboard
2. Check "My Tasks Today"
3. Review "Weekly Focus" priorities
4. Update any statuses from yesterday

**End of Day (5 min):**
1. Mark completed tasks as Done
2. Move unfinished tasks to tomorrow
3. Add any notes/learnings
4. Update project progress %

**Weekly Review (20 min, every Friday):**
1. Review completed tasks
2. Update all project progress
3. Set next week's 3 priorities
4. Archive any completed projects

---

## Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| New page | Ctrl/⌘ + N |
| Search | Ctrl/⌘ + P |
| Toggle sidebar | Ctrl/⌘ + \\ |
| Create new database item | Click + button in any view |
| Filter a view | Click Filter in database header |`,
  );

  const workflow = makeAsset(
    "Workflow Templates",
    "workflow-template",
    "Templates",
    "3 ready-to-use workflow templates for recurring processes",
    `# ${productName}
## Workflow Templates

*Duplicate these pages for each new project or recurring process.*

---

## Workflow Template 1: New Project Kickoff

**When to use:** Every time you start a new project.

\`\`\`
☐ PROJECT SETUP
  ☐ Create project in Projects database
  ☐ Define success metrics (what does "done" look like?)
  ☐ Set realistic deadline
  ☐ Break into 5–10 tasks in Tasks database
  ☐ Assign all tasks with due dates
  ☐ Link relevant contacts and resources

☐ WEEK 1
  ☐ Discovery / research phase
  ☐ Document findings in project Notes
  ☐ Identify top 3 risks and mitigation plans
  ☐ Confirm with all stakeholders

☐ EXECUTION
  ☐ Run 2-week sprints
  ☐ Weekly progress update (add to Notes)
  ☐ Update Progress % in Projects database
  ☐ Flag any blockers immediately

☐ COMPLETION
  ☐ Deliver final output
  ☐ Document what worked / what didn't
  ☐ Archive project
  ☐ Update contacts database with outcome
\`\`\`

---

## Workflow Template 2: Weekly Review

**When to use:** Every Friday, 20 minutes.

\`\`\`
REVIEW (10 min)
  ☐ Open Tasks database → filter: Status = Done, Updated = This Week
  ☐ List what was completed
  ☐ Note any patterns (what was harder than expected? easier?)
  ☐ Check all Project progress % — update any that are stale

PLAN (10 min)
  ☐ Open Projects database — what's due next week?
  ☐ Create tasks for next week's key work
  ☐ Set 3 priorities for next week
  ☐ Update Weekly Focus section on Dashboard
  ☐ Check: is anything blocked? Who can unblock it?

RESET
  ☐ Close any open browser tabs from this week
  ☐ Clear notifications
  ☐ Write one sentence about what you're taking into next week
\`\`\`

---

## Workflow Template 3: ${deliverables[0] ?? "Core Process"} SOP

**When to use:** Every time you run ${deliverables[0] ?? "this process"}.

\`\`\`
PREPARATION
  ☐ [Step 1 specific to your process]
  ☐ [Step 2]
  ☐ [Step 3]
  ☐ All required resources available?
  ☐ Time blocked in calendar?

EXECUTION
  ☐ Phase A: [what happens first]
    ☐ Sub-step 1
    ☐ Sub-step 2
  ☐ Phase B: [what happens next]
    ☐ Sub-step 1
    ☐ Sub-step 2
  ☐ Phase C: [final phase]
    ☐ Review output for quality
    ☐ Get necessary approvals

COMPLETION
  ☐ Document outcome in ${niche.split(" ")[0]} Tracker
  ☐ Update relevant project status
  ☐ Note any improvements for next time
  ☐ Archive or file all related documents
\`\`\`

---

*To use: Duplicate any template. Rename with date and context. Check off as you go.*`,
  );

  return [dbSchema, dashboard, workflow];
}

// ── Generic / fallback generators ─────────────────────────────────────────────

export function generateGenericAssets(
  product: ProductAgentOutput,
  research: ResearchAgentOutput,
  _form: BusinessFormData,
): GeneratedAsset[] {
  const { productName, targetAudience, description, deliverables } = product;
  const { niche, marketGaps } = research;

  const overview = makeAsset(
    "Product Overview Document",
    "overview-document",
    "Reference",
    "Complete product specification and positioning document",
    `# ${productName}
## Product Overview & Specification

*Internal document — use as reference for all external communications*

---

## What It Is

**One-liner:** ${productName} — [Your version of this in 10 words]

**Elevator pitch:**
${description}

---

## Who It's For

**Primary audience:** ${targetAudience}

**They are:**
- Struggling with [specific pain point 1]
- Frustrated by [specific pain point 2]
- Looking for [specific desired outcome]

**They are NOT:**
- [Audience segment you're explicitly not serving]
- [Another segment that seems close but isn't your customer]

---

## The Problem We Solve

**The market gap we're addressing:**
${marketGaps.slice(0, 3).map((g, i) => `${i + 1}. ${g}`).join("\n")}

**Why existing solutions fall short:**
- Solution A: [gap it leaves]
- Solution B: [gap it leaves]
- Solution C: [gap it leaves]

---

## What's Included

${deliverables.map((d, i) => `**${i + 1}. ${d}**\n[2-3 sentences explaining this deliverable and why it matters]`).join("\n\n")}

---

## How It Works

**Step 1:** Customer [first action they take]
**Step 2:** They receive [what they get]
**Step 3:** They [what they do with it]
**Result:** [specific outcome they achieve]

---

## Positioning

**Category:** ${niche}

**Key differentiators:**
1. [What makes this different from everything else]
2. [Second differentiator]
3. [Third differentiator]

**Tagline options:**
- Option A: [Your tagline]
- Option B: [Alternative]
- Option C: [Another option]

---

## Success Metrics

**Customer success looks like:**
- [Metric 1]: [Target]
- [Metric 2]: [Target]
- [Metric 3]: [Target]

**Business success looks like:**
- Month 1: [Goal]
- Month 3: [Goal]
- Month 6: [Goal]

---

*Last updated: ${new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}*`,
  );

  const quickStart = makeAsset(
    "Quick Start Guide",
    "quick-start-guide",
    "Reference",
    "Get customers to their first win in under 30 minutes",
    `# ${productName}
## Quick Start Guide

*Read this first. Then do the 3-step launch sequence. Your goal: first result within 30 minutes.*

---

## Before You Begin

You need:
☐ [Prerequisite 1 — be specific]
☐ [Prerequisite 2]
☐ 30 uninterrupted minutes

If you don't have these, stop here and get them first. Don't skim. Do the steps.

---

## The 3-Step Launch Sequence

### Step 1: Foundation (10 min)

**Do this:**
1. [Concrete first action]
2. [Second action]
3. [Third action — should produce first visible output]

**You'll know you've done this right when:** [specific observable outcome]

**Common mistake:** [what people do wrong here and why]

---

### Step 2: First Implementation (15 min)

**Do this:**
1. [Action 1]
2. [Action 2 — builds on step 1 output]
3. [Action 3 — produces something you can use]

**Template to use:** [point to included template or resource]

**You'll know you've done this right when:** [specific observable outcome]

**Pro tip:** [one piece of advice that makes this step 2x better]

---

### Step 3: Launch (5 min)

**Do this:**
1. [Final action]
2. [Publish / send / share / activate]
3. [Document your starting point — you'll want this data later]

**You'll know you've done this right when:** [specific observable outcome]

---

## After Your First 30 Minutes

**Day 1–7:** [Focus area for the first week]

**Day 8–14:** [What to work on once foundation is in place]

**Day 15–30:** [How to start seeing real results]

---

## If Something Goes Wrong

**Problem: [Most common issue]**
Solution: [Specific fix]

**Problem: [Second most common issue]**
Solution: [Specific fix]

**Problem: [Third most common issue]**
Solution: [Specific fix]

**Still stuck?**
[Your support channel — email / community / Discord]
Response time: [Your commitment]

---

## What's Possible

Here's what ${targetAudience} have achieved with ${productName}:

- "[Result quote 1]" — [Name, context]
- "[Result quote 2]" — [Name, context]
- "[Result quote 3]" — [Name, context]

You're [number] steps away from your version of this.

---

*Next step after completing this guide: [specific action]*`,
  );

  const faq = makeAsset(
    "FAQ Document",
    "faq-template",
    "Reference",
    "Anticipated questions with complete answers — ready for website or support",
    `# ${productName}
## Frequently Asked Questions

---

## Getting Started

**Q: Who is ${productName} designed for?**
A: ${targetAudience}. If that's you, this was built with your specific situation in mind. If you're outside that description, it may still work — but the examples and templates are optimized for that audience.

**Q: Do I need [technical skill / specific background] to use this?**
A: No. ${productName} is designed to be accessible to someone who is [entry level] in ${niche}. If you can [basic prerequisite action], you have everything you need to start.

**Q: How long before I see results?**
A: Honest answer: it depends on how consistently you apply what's in ${productName}. The people who follow the system and complete all the exercises typically see [specific result] within [realistic timeframe]. This isn't a magic solution — it's a proven system that rewards consistent action.

**Q: What if I've tried similar things before?**
A: The most common reason things don't work is missing the foundation — jumping straight to tactics without the underlying framework. ${productName} starts there, which is different from most resources in this space.

---

## Product Details

**Q: What exactly do I get?**
A:
${deliverables.map((d) => `- ${d}`).join("\n")}

**Q: Is this a one-time purchase or subscription?**
A: [Your answer here]

**Q: Can I get a refund if it doesn't work for me?**
A: [Your refund policy — be specific and human]

**Q: Will this work for [specific variation of the audience]?**
A: ${productName} is optimized for ${targetAudience}. [Specific answer about the edge case — be honest about fit]

---

## Implementation

**Q: How long does it take to work through everything?**
A: [Realistic time estimate]. That said, you don't need to complete everything before seeing results — the Quick Start Guide will get you your first win in 30 minutes.

**Q: Do I need to do everything in order?**
A: Yes for the core sequence (Quick Start → [Module 1] → [Module 2]). The reference materials and templates are non-linear — use them as needed.

**Q: What if I get stuck?**
A: [Your support options — be specific]. Most common sticking points are covered in the troubleshooting section of the Quick Start Guide.

---

## Business Questions

**Q: Can I use this for clients?**
A: [Your licensing terms — be clear about what's permitted]

**Q: Can I share this with my team?**
A: [Team licensing details]

**Q: Is there a community or support group?**
A: [Community details if applicable, or direct to your support channel]

---

*Have a question not answered here? [Your contact method]*`,
  );

  return [overview, quickStart, faq];
}
