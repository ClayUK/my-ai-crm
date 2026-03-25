import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";

function authOk(req: NextRequest): boolean {
    const secret = process.env.CRM_AGENT_SECRET;
    if (!secret) return true;
    return req.headers.get("x-crm-secret") === secret;
}

// Quality over quantity — each angle is specific, distinct, and maps to a real donor emotion
const ANGLES = `# THE MOMENT ANGLES (visceral, specific time)
The night everything changed
The morning the vet called with results
The moment the doctor said "we need to talk"
The last normal day before the diagnosis
The exact moment they knew they needed help
The day the bills arrived
The hour before surgery — waiting
The day they had to tell the kids

# FINANCIAL REALITY ANGLES (triggers practical empathy)
The bill that arrived after insurance said no
What $50 actually pays for — broken down
The savings account that hit zero last Tuesday
Choosing between rent and treatment this month
The GoFundMe nobody thought they'd ever make
What one month of medication actually costs
The second job that still isn't enough
The number on the invoice circled in red

# IDENTITY OF SUBJECT (makes them real)
Who she was before this happened
The athlete who can't walk right now
The mother who put everyone else first
The rescue dog that saved her from depression
The father who worked 30 years without missing a day
The kid who just wanted to graduate
The pet who's been there through every hard thing
The person who always helped others — now needing it

# RELATIONSHIP ANGLES (donor sees themselves)
What it's like to watch someone you love suffer
The spouse sleeping in a hospital chair every night
The child asking why mummy isn't coming home yet
The best friend who started the fundraiser out of desperation
The sibling who flew across the country
The owner who can't imagine life without them
The parent who would trade places in a heartbeat
The community that showed up without being asked

# TIME PRESSURE ANGLES (urgency without manipulation)
The surgery is scheduled — the funds aren't there yet
72 hours left to reach the goal
Every day without treatment costs more
The window for this treatment closes Friday
They've been waiting 3 weeks — help close the gap
The specialist has one opening left this month
Time is the one thing money can actually buy here

# TRANSFORMATION ANGLES (hope, forward-looking)
What recovery actually looks like — day by day
The version of them we're fighting to get back
The first walk outside after 6 weeks in hospital
What life looks like when this is over
The goal: just to get home
One surgery away from a completely different life
What "thank you" sounds like when it really means it
The milestone nobody thought they'd see

# CONTRAST ANGLES (before/after, then/now)
Then: trail running every weekend. Now: bed rest.
The photo from last Christmas vs. right now
Same person, completely different life, 90 days apart
What independence looks like and what it felt like to lose it
From "fine" to "critical" in less than a week
The trip they had planned for this summer
The job they had to quit to become a caregiver
A year ago this week versus today

# COMMUNITY PROOF ANGLES (social, shareable)
Over 200 people have already shown up
A stranger's $25 kept the lights on
What happens when a small community rallies
The share that started a chain reaction
People who've never met her are rooting for her
Every donor has their own reason for giving
When strangers become part of the story
The comment that made the family cry

# CREATIVE FORMAT ANGLES (format-first storytelling)
The vet bill that tells the whole story
A timeline in 4 panels — before, during, after, goal
The notes app entry nobody was meant to see
The text thread that went viral for the right reasons
A Spotify Wrapped — but for a year of fighting
The missing poster that became a movement
The flyer on every pole in the neighbourhood
A receipt for what love actually costs

# SPECIFICITY ANGLES (details that make it real)
47 days in hospital and counting
3 surgeries down, one more to go
She's been eating hospital food for 6 weeks
The drive to the specialist is 3 hours each way
He's missed 4 months of school already
The wheelchair that costs more than their car
8 medications, twice daily, none of them cheap
The GoFundMe goal represents exactly 3 months of treatment

# DONOR IDENTITY ANGLES (makes giving feel like self-expression)
The kind of person who doesn't scroll past
What you'd want if your family was in this position
People like us show up for people like this
One small act — real, immediate, traceable impact
Your $20 does something specific and measurable here
This is the world you want to live in — help build it
Skip one thing today. Fund one day of their recovery.
Being part of this story costs less than you think

# ANIMAL SPECIFIC ANGLES
The unconditional love that deserves a fighting chance
She sat with him through every panic attack — now it's our turn
The rescue who became the one who rescued her
A dog doesn't understand why he's in pain — but we do
The cat that's been her therapy animal for 11 years
He survived the shelter — he can survive this too
The vet said he has a chance — if we act now
What pets give us that nothing else does
`.trim();

export async function POST(req: NextRequest) {
    if (!authOk(req)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = (prisma as any).creativeBrain;
    if (!db) return NextResponse.json({ error: "creativeBrain not available" }, { status: 500 });

    const body = await req.json().catch(() => ({}));
    const replace = body?.replace === true; // Pass { replace: true } to reset angles

    const existing = await db.findUnique({ where: { scope: "fundraiser" } });
    const newLines = ANGLES.split("\n").map((s: string) => s.trim()).filter(Boolean);

    if (existing && !replace) {
        const existingLines = (existing.anglesList || "").split("\n").map((s: string) => s.trim()).filter(Boolean);
        const allLines = [...existingLines];
        let added = 0;
        for (const line of newLines) {
            const norm = line.toLowerCase().replace(/\s+/g, " ");
            if (!allLines.some((a) => a.toLowerCase().replace(/\s+/g, " ") === norm)) {
                allLines.push(line);
                added++;
            }
        }
        await db.update({ where: { scope: "fundraiser" }, data: { anglesList: allLines.join("\n") } });
        const totalAngles = allLines.filter((l: string) => l && !l.startsWith("#")).length;
        return NextResponse.json({ ok: true, added, totalAngles });
    } else if (existing && replace) {
        await db.update({ where: { scope: "fundraiser" }, data: { anglesList: ANGLES } });
        const totalAngles = newLines.filter((l) => !l.startsWith("#")).length;
        return NextResponse.json({ ok: true, replaced: true, totalAngles });
    } else {
        await db.create({ data: { scope: "fundraiser", anglesList: ANGLES, previousWinningPrompts: "", additionalInfo: "" } });
        const totalAngles = newLines.filter((l) => !l.startsWith("#")).length;
        return NextResponse.json({ ok: true, created: true, totalAngles });
    }
}
