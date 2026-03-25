import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";

function authOk(req: NextRequest): boolean {
    const secret = process.env.CRM_AGENT_SECRET;
    if (!secret) return true;
    return req.headers.get("x-crm-secret") === secret;
}

const ANGLES = `# EMOTIONAL CORE
The moment everything changed
Before they knew it would get this bad
What the doctors didn't tell us
The night we almost lost them
When hope felt impossible
The face behind the fundraiser
What they fight for every morning
The thing they miss most
The last normal day we remember
What their laughter used to sound like

# URGENCY & DEADLINE
24 hours left to make a difference
The deadline no one talks about
What happens if we don't reach the goal
Time is the one thing we can't buy
Every hour without treatment costs us
The window is closing fast
This week could change everything
They can't wait for next month
Racing against their own body
The countdown nobody wanted

# TRANSFORMATION & HOPE
Who they were before this happened
The version of them we're fighting to get back
What recovery actually looks like
The first day they smiled again
What winning looks like for this family
The life waiting on the other side
Small progress, massive meaning
What one donation made possible
The moment they turned a corner
Hope isn't free — but it's worth it

# SOCIAL PROOF & COMMUNITY
Thousands have already shown up
A stranger's kindness changed their trajectory
What happens when a community rallies
The ripple effect of one share
Every donor has a story
This is what solidarity looks like
They didn't expect this outpouring
When strangers become family
The town that showed up
Nobody fights alone

# SPECIFICITY & DETAIL
The exact cost of one day of treatment
What $50 actually buys them
The number that keeps the family awake
Breaking down where every dollar goes
The bill that arrived last Tuesday
What their insurance refuses to cover
The specific thing your donation funds
One procedure, one chance
The medication that changes everything
The surgery date is set — funds aren't

# GUILT-FREE ASK
You don't have to fix everything
Even $5 adds up to something real
Skip one coffee — fund one hour
What you'd spend on lunch could help
No amount is too small here
Give what you can, when you can
This isn't about obligation — it's about impact
You've already helped just by sharing
No pressure — but this is real
A small act with an outsized effect

# IDENTITY & VALUES
The kind of person who shows up
What you'd want if it were your family
Imagine needing help and finding it
This is the world you want to live in
People like us take care of each other
What we do for the most vulnerable says everything
Your values in action
Being part of something bigger
The legacy of a single generous act
Choosing compassion in a hard moment

# BEFORE/AFTER CONTRAST
Life before the diagnosis
The morning routine they had to abandon
Activities they can no longer do
The job they had to leave
What used to be ordinary is now impossible
From independence to total reliance
The future they planned vs. the one they face
What they've already given up
The gap between then and now
How fast everything changed

# FAMILY & RELATIONSHIPS
What this has done to the whole family
The sibling who doesn't understand why
The parent sleeping in a hospital chair
The partner holding it together barely
What children shouldn't have to witness
The family holiday that won't happen
Keeping it normal for the kids
The spouse who became the caregiver
Grandparents watching helplessly
The family portrait that tells the story

# ANIMAL/PET SPECIFIC
The bond between owner and pet
What pets give us that humans can't
The vet bill that broke the family
Unconditional love deserves a fighting chance
They rescued him — now he needs rescuing
She's been there through everything
The family member with four legs
How a pet holds a grieving family together
The diagnosis nobody was ready for
Fighting for the one who can't speak for themselves

# MEDICAL SPECIFICITY
The rare condition most people haven't heard of
When standard treatment isn't enough
The experimental option insurance won't cover
What living with chronic pain costs
The specialist three states away
The clinical trial that could change everything
Managing a condition with no cure
The medication that works — if you can afford it
Between diagnoses and answers
The second opinion that changed the plan

# FINANCIAL REALITY
The medical debt compounding daily
Choosing between bills and treatment
The savings account that's now empty
What crowdfunding shouldn't have to be for
Nobody budgets for a catastrophic diagnosis
The financial side nobody talks about
When income stops but bills don't
The second job they took to cover it
One emergency away from losing everything
The financial wound beneath the physical one

# RESILIENCE & CHARACTER
How they've handled this with grace
The attitude that defies what they're going through
Still fighting despite everything
What this person is made of
The strength of character on display
Refusing to give up despite the odds
The smile that shouldn't be possible
How they inspire everyone around them
Dignity in impossible circumstances
What real courage looks like up close

# DIRECT ADDRESS
If you're reading this, you can help
This is why we share things like this
You stumbled on this for a reason
Three minutes of your time could matter
One click, real impact
You've been thinking about it — here's your sign
Don't scroll past this one
This is the one worth pausing for
It costs nothing to share — but everything to them
You already care — that's why you're still reading`;

export async function POST(req: NextRequest) {
    if (!authOk(req)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = (prisma as any).creativeBrain;
    if (!db) return NextResponse.json({ error: "creativeBrain model not available" }, { status: 500 });

    const existing = await db.findUnique({ where: { scope: "fundraiser" } });
    const newAngleLines = ANGLES.split("\n").map((s: string) => s.trim()).filter(Boolean);

    if (existing) {
        const existingLines = (existing.anglesList || "").split("\n").map((s: string) => s.trim()).filter(Boolean);
        const allLines = [...existingLines];
        let added = 0;

        for (const line of newAngleLines) {
            const norm = line.toLowerCase().replace(/\s+/g, " ");
            const exists = allLines.some((a) => a.toLowerCase().replace(/\s+/g, " ") === norm);
            if (!exists) { allLines.push(line); added++; }
        }

        await db.update({
            where: { scope: "fundraiser" },
            data: { anglesList: allLines.join("\n") },
        });

        const totalAngles = allLines.filter((l: string) => l && !l.startsWith("#")).length;
        return NextResponse.json({ ok: true, added, totalAngles });
    } else {
        await db.create({
            data: {
                scope: "fundraiser",
                anglesList: ANGLES,
                previousWinningPrompts: "",
                additionalInfo: "",
            },
        });
        const totalAngles = newAngleLines.filter((l) => !l.startsWith("#")).length;
        return NextResponse.json({ ok: true, added: totalAngles, totalAngles });
    }
}
