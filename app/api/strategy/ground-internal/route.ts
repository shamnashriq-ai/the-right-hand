import { NextRequest, NextResponse } from "next/server";
import { selectInternalPrecedent } from "@/lib/intelligence/selectPrecedent";

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const {
      partyName,
      positionContested,
      electionLevel,
      totalDelegates,
      committedDelegates,
      leaningDelegates,
      uncommittedDelegates,
      hostileDelegates,
      factionAlignment,
      incumbentStatus,
      numberOfContestants,
      patronageCapacity,
      daysUntilElection,
    } = data;

    const commitRate =
      totalDelegates > 0
        ? Math.round((committedDelegates / totalDelegates) * 100)
        : 0;
    const winThreshold = totalDelegates > 0 ? Math.ceil(totalDelegates / 2) + 1 : 0;
    const delegatesNeeded = Math.max(0, winThreshold - committedDelegates);
    const leaningPath = committedDelegates + leaningDelegates >= winThreshold;

    // Build assessment sentences
    const sentences: string[] = [];

    // Sentence 1: Position assessment
    if (commitRate >= 60) {
      sentences.push(
        `You control ${commitRate}% of delegates for ${positionContested} in ${partyName} — a commanding position. The danger now is complacency: internal elections can flip in the final 48 hours through backroom deals.`
      );
    } else if (commitRate >= 45 && leaningPath) {
      sentences.push(
        `Your committed base of ${committedDelegates} delegates plus ${leaningDelegates} leaning gives you a viable path to the ${winThreshold} needed for ${positionContested}. But leaners are not votes — each one needs personal confirmation before polling day.`
      );
    } else if (commitRate >= 30) {
      sentences.push(
        `At ${commitRate}% commit rate, you have a base but not a majority for ${positionContested}. You need ${delegatesNeeded} more confirmed delegates to cross the threshold of ${winThreshold}. The uncommitted ${uncommittedDelegates} delegates are your battlefield.`
      );
    } else {
      sentences.push(
        `With only ${commitRate}% of delegates committed, your path to ${positionContested} requires a significant shift. You need ${delegatesNeeded} more delegates. This is not a ground game anymore — you need a bloc-level play through a kingmaker or faction broker.`
      );
    }

    // Sentence 2: Strategic context
    if (incumbentStatus === "Challenging incumbent") {
      sentences.push(
        `Challenging an incumbent in a party election means fighting against the machinery of patronage. The incumbent controls appointments, resources, and the loyalty infrastructure. Your advantage must come from either a reform narrative that resonates with enough delegates, or a faction alliance that delivers a bloc.`
      );
    } else if (incumbentStatus === "Defending position") {
      sentences.push(
        `As the defending incumbent, you have the advantage of machinery and patronage — but also the liability of fatigue. Any delegate who feels overlooked or unrewarded is a potential defector. Lock in your base first, then neutralise the challenger's narrative.`
      );
    } else {
      sentences.push(
        `An open contest without an incumbent creates a fluid dynamic where faction allegiances become the deciding factor. With ${numberOfContestants || "multiple"} contestants, the risk of vote-splitting is real. The candidate who consolidates one major faction first will likely win.`
      );
    }

    // Sentence 3: Time and action
    if (daysUntilElection <= 7) {
      sentences.push(
        `With ${daysUntilElection} days left, this is now a pure headcount operation. Stop all persuasion — focus exclusively on confirming committed delegates will physically show up to vote. One absent supporter costs more than one uncommitted delegate.`
      );
    } else if (daysUntilElection <= 21) {
      sentences.push(
        `${daysUntilElection} days gives you a narrow window for delegate cultivation. Prioritise one-on-one meetings with the ${uncommittedDelegates} uncommitted delegates — in internal elections, a personal visit from the candidate carries more weight than any proxy.`
      );
    } else {
      sentences.push(
        `With ${daysUntilElection} days remaining, you have time to build — but not to drift. Set a weekly conversion target of ${Math.max(1, Math.ceil(delegatesNeeded / Math.ceil(daysUntilElection / 7)))} delegates per week. Track every contact, every commitment, every shift in loyalty.`
      );
    }

    // Sentence 4: Faction/patronage
    if (factionAlignment === "Aligned with dominant faction") {
      sentences.push(
        `Your alignment with the dominant faction gives you structural backing — use it. But remember that faction support is transactional. Deliver on what the faction leaders expect, or they will redirect their delegates to someone who will.`
      );
    } else if (factionAlignment === "Building own faction") {
      sentences.push(
        `Building your own faction is the hardest path in internal politics, but it creates the most durable base. Focus on young delegates and those who feel excluded by existing power structures — they're the most recruitable.`
      );
    } else if (patronageCapacity === "Limited — running on credibility alone") {
      sentences.push(
        `Without patronage leverage, your campaign runs on personal credibility and narrative. This can win — but only if your message is sharp enough to create an emotional reason for delegates to break from their usual allegiances.`
      );
    }

    const assessment = sentences.join(" ");
    const { precedent, precedent_entry_id } = selectInternalPrecedent({
      numberOfContestants: numberOfContestants ? parseInt(numberOfContestants, 10) : 2,
      incumbentStatus,
      factionAlignment,
      commitRate,
    });
    return NextResponse.json({ assessment, precedent, precedent_entry_id });
  } catch {
    return NextResponse.json(
      { assessment: "Error generating assessment. Please try again.", precedent: null, precedent_entry_id: null },
      { status: 500 }
    );
  }
}
