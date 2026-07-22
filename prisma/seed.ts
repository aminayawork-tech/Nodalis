import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { slugify, uniqueSlug } from "../src/lib/slug";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./prisma/dev.db",
});
const db = new PrismaClient({ adapter });

interface SeedStory {
  headline: string;
  whyNow: string;
  trend: "rising" | "steady" | "fading";
  whatHappened: string;
  background: string;
  whoInvolved: string[];
  whatsNext: string;
  talkingPoints: string[];
  themes: string[];
  threadTitle: string;
  daysAgo: number;
}

const stories: SeedStory[] = [
  {
    headline: "States move to license AI \"companion\" apps after teen safety lawsuits",
    whyNow:
      "Three state attorneys general opened parallel investigations this week after a wrongful-death suit named a chatbot app directly.",
    trend: "rising",
    whatHappened:
      "Lawmakers in three states introduced bills requiring AI companion apps to verify user age, disclose that responses are AI-generated, and route self-harm language to a human-monitored crisis line.",
    background:
      "AI companion apps — chatbots designed for ongoing, emotionally intimate conversation rather than task completion — grew quickly on engagement-first mobile app stores with almost no content-moderation obligations distinct from general social apps. Existing child-safety law was written for static content and human-to-human chat, not a system generating personalized responses in real time, which is why regulators are reaching for new bills rather than existing statutes.",
    whoInvolved: [
      "State attorneys general in the three filing states — driving the investigations",
      "Character.ai and Replika-style companion app makers — the direct targets of the bills",
      "Federal Trade Commission — separately reviewing whether existing consumer-protection authority already covers this",
    ],
    whatsNext:
      "Expect a patchwork of state-level rules before any federal standard, since Congress has not moved companion-app-specific legislation out of committee. App makers will likely respond with age-gating and crisis-line integrations proactively, ahead of enforcement, to avoid becoming the test case.",
    talkingPoints: [
      "This is regulation catching up to a category — companion apps — that didn't exist when the underlying child-safety statutes were written, which is why states are legislating instead of enforcing.",
      "The crisis-line-routing requirement is the real design constraint: it forces these products to detect intent, not just filter keywords, which is a much harder engineering problem than it sounds.",
      "Watch whether the bills apply to the model provider or the app wrapper — that boundary determines whether this becomes a burden on OpenAI/Anthropic-style API providers or stays scoped to consumer app companies.",
    ],
    themes: ["AI regulation", "child safety policy", "platform liability"],
    threadTitle: "AI companion app regulation",
    daysAgo: 0,
  },
  {
    headline: "Red Sea shipping reroutes are quietly adding weeks to European retail restocks",
    whyNow:
      "A fresh round of shipping-lane attacks this month pushed more carriers to commit to the longer Cape of Good Hope route through at least Q3.",
    trend: "steady",
    whatHappened:
      "Major container lines extended their diversion around the Cape of Good Hope rather than the Suez Canal, adding 10-14 days to Asia-Europe transit times, with several retailers now publicly flagging restock delays.",
    background:
      "The Suez diversions began over a year ago in response to regional shipping-lane attacks and were initially treated as temporary. Carriers have since re-optimized fleet schedules around the longer route, which means reversing it isn't just a security decision anymore — it's a scheduling and contract one, so the diversion has become the default even when the security situation fluctuates.",
    whoInvolved: [
      "Major container shipping alliances — set the routing that determines transit time industry-wide",
      "European retailers with thin inventory buffers — first to feel and report the delay",
      "Egyptian Suez Canal Authority — loses transit revenue with every rerouted ship",
    ],
    whatsNext:
      "Expect retailers to start pricing the longer transit time into seasonal planning (ordering earlier) rather than waiting for the route to normalize, since the operational shift is now embedded in carrier schedules rather than being a week-to-week decision.",
    talkingPoints: [
      "The interesting part isn't the security situation, it's that carriers have re-optimized schedules around the detour — reverting now would itself be logistically disruptive, so the 'temporary' reroute is becoming structural.",
      "This is a slow-moving supply chain story hiding inside a geopolitical one — the shipping delay shows up as a retail inventory problem months later, not as breaking news.",
      "It's a useful test case for how brittle 'just in time' inventory strategies are to a single chokepoint — most of the fix so far has been schedule buffers, not diversified routing.",
    ],
    themes: ["supply chain", "shipping and logistics", "geopolitical risk"],
    threadTitle: "Red Sea shipping disruption",
    daysAgo: 1,
  },
  {
    headline: "Four-day workweek pilots move from tech startups to hospital systems",
    whyNow:
      "Two regional hospital networks announced compressed-week pilots this week, citing nurse retention data from earlier pilots as the deciding factor.",
    trend: "rising",
    whatHappened:
      "Two hospital systems began piloting four-day, compressed-hour schedules for nursing staff, following earlier pilots in white-collar and tech settings, marking the idea's first serious test in a 24/7 clinical environment.",
    background:
      "Four-day-week pilots started in knowledge-work settings where hours are flexible and coverage gaps are low-stakes. Healthcare staffing is a much harder test because care can't pause — any schedule change has to solve a coverage puzzle, not just a productivity one, which is why hospital adoption has lagged years behind tech and finance.",
    whoInvolved: [
      "Hospital system HR and nursing leadership — designing the coverage model",
      "Nurses' unions — generally supportive, using it as a retention-focused bargaining point",
      "Earlier tech-sector pilot organizers — the data hospitals are citing to justify trying it",
    ],
    whatsNext:
      "If retention numbers hold over the pilot period, expect other short-staffed clinical fields (emergency medicine, long-term care) to follow, since staffing shortage — not ideology — is the actual driver here.",
    talkingPoints: [
      "This isn't really a labor-culture story, it's a staffing-shortage story — hospitals are trying compressed weeks because retention costs less than the alternative, not out of any broader four-day-week movement.",
      "The interesting design problem is coverage math, not culture: compressed hours only work in 24/7 settings if you can restructure shift overlap, which is a much bigger operational lift than in an office.",
      "Watch for this to spread to other short-staffed shift-work fields (emergency services, warehousing) faster than it spreads within white-collar work, because the retention pressure is more acute there.",
    ],
    themes: ["labor shortage", "generational shift", "workplace policy"],
    threadTitle: "Compressed workweek adoption",
    daysAgo: 2,
  },
  {
    headline: "Export controls on advanced chips tighten again, this time targeting packaging",
    whyNow:
      "New rules closing a packaging-technology loophole took effect this week after officials found it was being used to route restricted chips around existing controls.",
    trend: "rising",
    whatHappened:
      "Regulators expanded export restrictions to cover advanced chip packaging techniques, closing a route that had let restricted-tier chips be finished and shipped through intermediary countries.",
    background:
      "Chip export controls have targeted fabrication technology and finished chips since they began, but advanced packaging — which combines multiple chip dies into one module — turned out to be an effective way to route around restrictions, since packaging happens at different facilities than fabrication, often in different countries. Closing this gap required a new category of control entirely.",
    whoInvolved: [
      "U.S. Commerce Department Bureau of Industry and Security — wrote and enforces the new rule",
      "Chip packaging and assembly firms in intermediary countries — directly affected by the new scope",
      "Chinese chip design firms — the intended target, now facing a narrower set of legal fabrication paths",
    ],
    whatsNext:
      "Expect the next loophole to show up in whichever adjacent process isn't yet covered — export control rounds have consistently been reactive to newly discovered routing methods rather than comprehensive from the start.",
    talkingPoints: [
      "This round is notable for what it targets: not the chip itself, but a manufacturing step (packaging) that sits outside the traditional fab-centric control framework — a sign controls are maturing past their initial blind spots.",
      "Every round of chip controls has been followed by a new workaround discovered within months — the real story is the cat-and-mouse cadence, not any single rule.",
      "This directly affects packaging hubs in third countries that aren't the intended target of the policy but absorb the compliance cost anyway.",
    ],
    themes: ["AI regulation", "supply chain", "geopolitical risk"],
    threadTitle: "Advanced chip export controls",
    daysAgo: 3,
  },
  {
    headline: "First-time homebuyer age climbs again as starter-home construction stays flat",
    whyNow:
      "New housing data released this week shows the median first-time buyer age hit another record, with builders confirming starter-home construction hasn't kept pace with entry-level demand.",
    trend: "steady",
    whatHappened:
      "New data shows the median age of first-time homebuyers rose again this year, continuing a decade-long trend, while builder surveys show entry-level ('starter') home construction remains a small share of new supply.",
    background:
      "Starter-home construction became less profitable for builders relative to larger homes over the past two decades — land, permitting, and labor costs scale less favorably for smaller units, so builders shifted toward move-up and luxury inventory. That supply shift, not just buyer preference or income, is a structural reason first-time buyers are entering the market later.",
    whoInvolved: [
      "National homebuilders — control what gets built and have shifted away from entry-level inventory",
      "First-time buyer cohort (increasingly late-30s rather than late-20s) — absorbing the delay",
      "Local zoning boards — set the density and lot-size rules that make small starter homes harder to build profitably",
    ],
    whatsNext:
      "Expect the buyer-age trend to continue unless zoning reform meaningfully changes starter-home construction economics — buyer income growth alone hasn't been enough to offset the supply shift.",
    talkingPoints: [
      "The standard explanation is affordability, but the supply side matters just as much: builders have economically rational reasons to build fewer starter homes, independent of what buyers want.",
      "This connects zoning policy directly to a generational milestone — the age people first own homes — in a way that's easy to miss if you only look at mortgage rates.",
      "It's a useful example of a demographic trend (delayed homeownership) that's driven as much by upstream industry economics as by the generation itself.",
    ],
    themes: ["generational shift", "housing policy", "labor and construction economics"],
    threadTitle: "First-time homebuyer age trend",
    daysAgo: 4,
  },
  {
    headline: "A wave of small-city downtowns are converting empty office towers to housing",
    whyNow:
      "Two mid-size cities approved streamlined office-to-residential conversion permits this month, following a pilot program's early results.",
    trend: "rising",
    whatHappened:
      "Several mid-size U.S. cities streamlined permitting for converting vacant office buildings into residential units, citing sustained post-pandemic office vacancy and a parallel housing shortage as the twin drivers.",
    background:
      "Office vacancy rose sharply as remote and hybrid work reduced downtown office demand, while housing shortages in the same cities persisted independently. Office-to-residential conversion has technical challenges (plumbing, window placement, floor depth) that make older, narrower office buildings far easier to convert than modern deep-floorplate towers — which is why this wave is concentrated in cities with older downtown stock.",
    whoInvolved: [
      "Mid-size city planning departments — writing the streamlined permitting pathways",
      "Commercial real estate owners sitting on vacant office towers — the ones with an incentive to convert",
      "Local housing advocates — pushing conversions toward including affordable-unit requirements",
    ],
    whatsNext:
      "Expect this to spread fastest in cities with older, narrower prewar office stock, and much more slowly in cities dominated by deep-floorplate 1980s-2000s towers, which are far more expensive to convert.",
    talkingPoints: [
      "The buildings that convert easiest are old and narrow, not new and shiny — this quietly favors cities with older downtown stock over newer Sun Belt office parks.",
      "It's a rare case where two separate crises — office vacancy and housing shortage — partially solve each other, which is why it's spreading faster than a typical zoning reform would.",
      "The technical conversion constraint (floorplate depth) is a better predictor of where this trend spreads than any political or economic factor.",
    ],
    themes: ["housing policy", "generational shift", "urban policy"],
    threadTitle: "Office-to-residential conversion wave",
    daysAgo: 5,
  },
];

async function main() {
  const existing = await db.story.count();
  if (existing > 0) {
    console.log(`Database already has ${existing} stories — skipping seed.`);
    return;
  }

  console.log("Seeding Nodalis with mock data...");

  for (const s of stories) {
    const { id: threadId } = await db.thread.upsert({
      where: { id: slugify(s.threadTitle) },
      update: {},
      create: { id: slugify(s.threadTitle), title: s.threadTitle },
    });

    const themes = [];
    for (const name of s.themes) {
      const slug = slugify(name);
      const theme = await db.theme.upsert({
        where: { slug },
        update: {},
        create: { name, slug },
      });
      themes.push(theme);
    }

    const createdAt = new Date(Date.now() - s.daysAgo * 24 * 60 * 60 * 1000);

    await db.story.create({
      data: {
        headline: s.headline,
        slug: uniqueSlug(s.headline),
        whyNow: s.whyNow,
        trend: s.trend,
        whatHappened: s.whatHappened,
        background: s.background,
        whoInvolved: JSON.stringify(s.whoInvolved),
        whatsNext: s.whatsNext,
        talkingPoints: JSON.stringify(s.talkingPoints),
        origin: "manual",
        threadId,
        createdAt,
        updatedAt: createdAt,
        themes: { create: themes.map((t) => ({ themeId: t.id })) },
        threadEntry: {
          create: { threadId, summary: s.whatHappened, occurredAt: createdAt, createdAt },
        },
      },
    });
  }

  // Give the first thread ("AI companion app regulation") a second, earlier
  // timeline entry so the Thread view has more than one point to show.
  const aiThread = await db.thread.findUnique({
    where: { id: slugify("AI companion app regulation") },
  });
  if (aiThread) {
    await db.threadEntry.create({
      data: {
        threadId: aiThread.id,
        summary:
          "A wrongful-death lawsuit named a companion-app maker directly, alleging its chatbot engaged with a minor's self-harm ideation without escalation.",
        occurredAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000),
      },
    });
  }

  // One saved story with a personal note, to demo the knowledge-base feature.
  const firstStory = await db.story.findFirst({ orderBy: { createdAt: "desc" } });
  if (firstStory) {
    await db.savedItem.create({
      data: {
        type: "story",
        storyId: firstStory.id,
        notes:
          "Good one to bring up with Sam — he works in ed-tech and has strong opinions on age verification.",
      },
    });
  }

  console.log(`Seeded ${stories.length} stories.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    // better-sqlite3 connections close synchronously; nothing to await.
  });
