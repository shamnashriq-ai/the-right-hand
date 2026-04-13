export async function POST(request: Request) {
  const data = await request.json();

  const {
    opponentMove,
    severity,
    groundCoverage,
    numbersPace,
    perceptionMomentum,
    daysRemaining,
  } = data;

  // Calculate Strategic Position Score (0-100)
  const groundScore = Math.min(100, Math.max(0, groundCoverage || 50));
  const numbersScore = Math.min(100, Math.max(0, numbersPace || 50));
  const perceptionScore = Math.min(100, Math.max(0, perceptionMomentum || 50));
  const daysBuffer = Math.min(100, Math.max(0, ((daysRemaining || 30) / 60) * 100));

  const baseScore = Math.round(
    groundScore * 0.25 +
    numbersScore * 0.35 +
    perceptionScore * 0.25 +
    daysBuffer * 0.15
  );

  // Severity multipliers
  const severityImpact: Record<string, number> = {
    minor: 0.85,
    significant: 0.65,
    critical: 0.45,
  };

  // Move-to-framework impact mapping
  const moveImpacts = generateMoveImpacts(opponentMove, severity);
  const impactMultiplier = severityImpact[severity] || 0.65;
  const adjustedScore = Math.round(baseScore * impactMultiplier);

  // Generate the war room briefing
  const briefing = generateBriefing(opponentMove, severity, baseScore, adjustedScore, daysRemaining, moveImpacts);

  return Response.json({
    baseScore,
    adjustedScore,
    moveImpacts,
    briefing,
  });
}

interface FrameworkImpact {
  framework: string;
  label: string;
  level: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  impact: string;
  adaptation: string;
}

function generateMoveImpacts(move: string, severity: string): FrameworkImpact[] {
  const isCritical = severity === "critical";
  const isSignificant = severity === "significant";

  const impactMaps: Record<string, FrameworkImpact[]> = {
    "Flooded your swing districts": [
      {
        framework: "F1", label: "Know Your Ground",
        level: isCritical ? "CRITICAL" : isSignificant ? "HIGH" : "MEDIUM",
        impact: "Your territorial advantage in swing districts is being directly contested — opponent machinery now matches or exceeds your ground presence.",
        adaptation: "Immediately audit which specific polling streams are now contested and redeploy your strongest operators to hold the 3 highest-value streams.",
      },
      {
        framework: "F2", label: "Know Your Voters",
        level: isCritical ? "HIGH" : "MEDIUM",
        impact: "Voter contact data in flooded areas becomes unreliable as opponent messaging creates confusion and competing narratives.",
        adaptation: "Switch to direct personal contact in affected districts — WhatsApp voice notes from known community figures to revalidate voter sentiment.",
      },
      {
        framework: "F3", label: "Game of Numbers",
        level: isCritical ? "CRITICAL" : isSignificant ? "HIGH" : "MEDIUM",
        impact: "Your vote projections in target streams are now at risk — the numbers model assumed uncontested ground that no longer exists.",
        adaptation: "Recalculate win path excluding contested streams and identify 2 replacement streams where you still hold clear advantage.",
      },
      {
        framework: "F4", label: "Art of Mobilisation",
        level: isCritical ? "CRITICAL" : "HIGH",
        impact: "Volunteer morale drops when they see opponent presence matching theirs — machinery fatigue accelerates in directly contested zones.",
        adaptation: "Deploy a visible surge — even 5 extra volunteers in one contested area creates a morale-boosting 'we showed up stronger' narrative.",
      },
      {
        framework: "F5", label: "Managing Perceptions",
        level: isSignificant ? "MEDIUM" : "LOW",
        impact: "Voters seeing heavy opponent presence may interpret it as momentum shifting — perception of inevitability is a weapon.",
        adaptation: "Counter with hyperlocal content showing your candidate's existing deep roots in these areas — familiarity beats machinery in voters' minds.",
      },
    ],
    "Launched a negative campaign": [
      {
        framework: "F1", label: "Know Your Ground",
        level: "LOW",
        impact: "Ground intelligence becomes more critical — you need real-time reporting on where the negative messaging is landing hardest.",
        adaptation: "Task ground teams to report which specific areas and demographics are repeating the negative narrative back to you.",
      },
      {
        framework: "F2", label: "Know Your Voters",
        level: isCritical ? "HIGH" : "MEDIUM",
        impact: "Undecided voters who were leaning your way may freeze — negative campaigns don't convert opponents but they paralyse swing voters.",
        adaptation: "Prioritise direct outreach to your 'soft supporters' list within 24 hours before the narrative hardens into accepted fact.",
      },
      {
        framework: "F3", label: "Game of Numbers",
        level: isCritical ? "HIGH" : isSignificant ? "MEDIUM" : "LOW",
        impact: "Your swing voter conversion rate drops — the negative campaign creates doubt that slows your momentum toward target numbers.",
        adaptation: "Shift focus to turnout of confirmed supporters rather than conversion of undecided — lock in what you have before chasing what you don't.",
      },
      {
        framework: "F4", label: "Art of Mobilisation",
        level: "MEDIUM",
        impact: "Volunteers may face hostile reception in affected areas — morale impact if ground teams encounter voters repeating attack lines.",
        adaptation: "Brief all ground teams with a simple 2-sentence rebuttal they can deliver confidently — armed volunteers don't retreat.",
      },
      {
        framework: "F5", label: "Managing Perceptions",
        level: isCritical ? "CRITICAL" : "HIGH",
        impact: "This is a direct assault on your narrative — every hour without response allows the attack framing to become the default voter perception.",
        adaptation: "Deploy your pre-prepared response within 4 hours using the Response Engine — speed matters more than perfection in narrative warfare.",
      },
    ],
    "Co-opted your dominant issue": [
      {
        framework: "F1", label: "Know Your Ground",
        level: isCritical ? "HIGH" : "MEDIUM",
        impact: "The issue that defined your ground advantage is no longer exclusively yours — your differentiation in local positioning is weakened.",
        adaptation: "Pivot ground messaging to your second-strongest local issue or add a specific, tangible local commitment the opponent can't match.",
      },
      {
        framework: "F2", label: "Know Your Voters",
        level: isCritical ? "CRITICAL" : "HIGH",
        impact: "Voters who supported you primarily because of this issue now have a reason to reconsider — your unique selling proposition just got copied.",
        adaptation: "Immediately segment voters who chose you for this specific issue and deliver a deeper, more specific version of your commitment.",
      },
      {
        framework: "F3", label: "Game of Numbers",
        level: isCritical ? "HIGH" : "MEDIUM",
        impact: "Single-issue voters in your column are now genuinely swing — your numbers model overestimates support from this cohort.",
        adaptation: "Run a scenario with 30% of issue-driven supporters moving to undecided and plan a retention strategy for the rest.",
      },
      {
        framework: "F4", label: "Art of Mobilisation",
        level: "MEDIUM",
        impact: "Ground teams lose their strongest talking point — volunteers who led with this issue need a new script immediately.",
        adaptation: "Distribute updated canvassing talking points within 12 hours that position your commitment as deeper, earlier, and more credible.",
      },
      {
        framework: "F5", label: "Managing Perceptions",
        level: isCritical ? "CRITICAL" : isSignificant ? "HIGH" : "MEDIUM",
        impact: "The narrative shifts from 'your issue' to 'everyone's issue' — you lose ownership of the conversation you started.",
        adaptation: "Release a specific, measurable commitment with a timeline that the opponent's vague promise cannot match — specificity beats imitation.",
      },
    ],
    "Built a coalition": [
      {
        framework: "F1", label: "Know Your Ground",
        level: isCritical ? "CRITICAL" : "HIGH",
        impact: "Coalition opponents can split resources strategically — one partner attacks while the other consolidates, creating a two-front war.",
        adaptation: "Map the coalition's likely resource allocation and identify which areas each partner is strongest — find the seam between them.",
      },
      {
        framework: "F2", label: "Know Your Voters",
        level: isCritical ? "HIGH" : "MEDIUM",
        impact: "Vote-splitting dynamics shift — voters who wouldn't support either opponent alone may see the coalition as a viable alternative.",
        adaptation: "Identify which voter segments each coalition partner attracts and target the overlap with messaging that exposes coalition contradictions.",
      },
      {
        framework: "F3", label: "Game of Numbers",
        level: isCritical ? "CRITICAL" : "HIGH",
        impact: "Your win math fundamentally changes — combined opponent votes that were previously split now consolidate against you.",
        adaptation: "Recalculate assuming coalition votes merge and identify the new margin you need to overcome — adjust target streams accordingly.",
      },
      {
        framework: "F4", label: "Art of Mobilisation",
        level: isCritical ? "HIGH" : "MEDIUM",
        impact: "Coalition opponents can combine machinery — their joint ground coverage may now exceed yours in previously comfortable areas.",
        adaptation: "Focus machinery density over breadth — better to dominate 60% of districts than thinly cover 90% against a combined force.",
      },
      {
        framework: "F5", label: "Managing Perceptions",
        level: "MEDIUM",
        impact: "The coalition creates a 'change momentum' narrative — voters perceive that others are uniting against the current path.",
        adaptation: "Expose the coalition's internal contradictions publicly — alliances of convenience fracture under scrutiny of incompatible promises.",
      },
    ],
    "Activated community leaders": [
      {
        framework: "F1", label: "Know Your Ground",
        level: isCritical ? "CRITICAL" : "HIGH",
        impact: "Community leaders carry outsized influence in local politics — their endorsement reshapes ground reality faster than any machinery can.",
        adaptation: "Identify which specific leaders switched and map their influence zones — then activate your own community leader network in adjacent areas.",
      },
      {
        framework: "F2", label: "Know Your Voters",
        level: isCritical ? "HIGH" : isSignificant ? "HIGH" : "MEDIUM",
        impact: "Voters who trust these leaders will follow their guidance — this is organic influence that advertising cannot counter.",
        adaptation: "Deploy respected figures from your own network to the same communities — credibility contests are won by trusted faces, not louder messages.",
      },
      {
        framework: "F3", label: "Game of Numbers",
        level: isCritical ? "HIGH" : "MEDIUM",
        impact: "Each activated community leader can shift 50-200 voters in their immediate sphere — multiply by leaders activated for total impact.",
        adaptation: "Quantify the likely vote shift and identify whether your current margin can absorb it — if not, find replacement votes elsewhere.",
      },
      {
        framework: "F4", label: "Art of Mobilisation",
        level: isCritical ? "CRITICAL" : isSignificant ? "HIGH" : "MEDIUM",
        impact: "Opponent now has organic volunteer recruitment channels through these leaders — machinery growth becomes self-sustaining in those areas.",
        adaptation: "Counter-activate your own community leaders immediately — a personal visit from the candidate to your key leaders reinforces loyalty.",
      },
      {
        framework: "F5", label: "Managing Perceptions",
        level: "MEDIUM",
        impact: "Community leader endorsements carry authenticity that paid media cannot replicate — this shifts perception at the trust level.",
        adaptation: "Amplify your own community endorsements with authentic, unscripted content — a genuine video from a village elder outweighs any ad.",
      },
    ],
    "Made a popular promise": [
      {
        framework: "F1", label: "Know Your Ground",
        level: "MEDIUM",
        impact: "The promise creates buzz that temporarily shifts local conversation — your ground intelligence needs to measure how deep it penetrates.",
        adaptation: "Task ground teams to assess within 48 hours: are voters actually talking about this promise, or was it a media-only moment?",
      },
      {
        framework: "F2", label: "Know Your Voters",
        level: isCritical ? "HIGH" : "MEDIUM",
        impact: "Voters respond to tangible, specific promises — if it directly addresses their top concern, it creates real movement.",
        adaptation: "Counter with an equally specific promise that is more credible, backed by your track record or specific implementation plan.",
      },
      {
        framework: "F3", label: "Game of Numbers",
        level: isCritical ? "HIGH" : isSignificant ? "MEDIUM" : "LOW",
        impact: "Popular promises create short-term polling bumps — your vote model may not capture this transient shift.",
        adaptation: "Wait 72 hours before adjusting numbers — most promise-driven bumps fade unless reinforced by ground follow-through.",
      },
      {
        framework: "F4", label: "Art of Mobilisation",
        level: "LOW",
        impact: "Minimal direct impact on machinery unless the promise triggers volunteer recruitment for the opponent.",
        adaptation: "Stay the course — machinery wins come from consistency, not reactions to opponent announcements.",
      },
      {
        framework: "F5", label: "Managing Perceptions",
        level: isCritical ? "CRITICAL" : isSignificant ? "HIGH" : "MEDIUM",
        impact: "The narrative temporarily shifts to the opponent's initiative — you're reacting instead of setting the agenda.",
        adaptation: "Don't counter the promise directly — instead, launch your own initiative that puts the spotlight back on your agenda within 24 hours.",
      },
    ],
    "Attacked your credibility": [
      {
        framework: "F1", label: "Know Your Ground",
        level: "MEDIUM",
        impact: "Credibility attacks land hardest in areas where voters don't know you personally — your weakest ground becomes most vulnerable.",
        adaptation: "Prioritise candidate presence in low-familiarity areas within the next 48 hours — personal contact is the best credibility defence.",
      },
      {
        framework: "F2", label: "Know Your Voters",
        level: isCritical ? "HIGH" : "MEDIUM",
        impact: "Voters who were considering you but haven't committed will pause — credibility doubt is the single biggest conversion killer.",
        adaptation: "Activate your strongest endorsers to personally vouch in their networks — third-party credibility repairs faster than self-defence.",
      },
      {
        framework: "F3", label: "Game of Numbers",
        level: isCritical ? "HIGH" : isSignificant ? "MEDIUM" : "LOW",
        impact: "Conversion rate of undecided voters drops — your pipeline of 'leaning your way' voters stalls until credibility is restored.",
        adaptation: "Temporarily shift strategy from conversion to consolidation — secure what you have while you address the credibility gap.",
      },
      {
        framework: "F4", label: "Art of Mobilisation",
        level: isCritical ? "HIGH" : "MEDIUM",
        impact: "Volunteers may face awkward questions they can't answer — some may quietly reduce activity if they feel the attack has substance.",
        adaptation: "Hold an emergency volunteer briefing with the full truth and a clear response line — informed volunteers are loyal volunteers.",
      },
      {
        framework: "F5", label: "Managing Perceptions",
        level: isCritical ? "CRITICAL" : "HIGH",
        impact: "Your entire narrative is undermined if voters question whether you're who you say you are — credibility is the foundation of all messaging.",
        adaptation: "Deploy proof points immediately — documents, endorsements, visible actions that directly contradict the attack with evidence, not words.",
      },
    ],
  };

  return impactMaps[move] || impactMaps["Launched a negative campaign"]!;
}

function generateBriefing(
  move: string,
  severity: string,
  baseScore: number,
  adjustedScore: number,
  daysRemaining: number,
  impacts: FrameworkImpact[]
): string {
  const sentences: string[] = [];
  const drop = baseScore - adjustedScore;
  const criticalFramework = impacts.reduce((worst, current) => {
    const levels = { LOW: 1, MEDIUM: 2, HIGH: 3, CRITICAL: 4 };
    return levels[current.level] > levels[worst.level] ? current : worst;
  });

  // Sentence 1: Threat assessment
  if (severity === "critical") {
    sentences.push(
      `This is a ${drop}-point hit to your strategic position, dropping you from ${baseScore} to ${adjustedScore} — the opponent's move to "${move.toLowerCase()}" is a direct assault on your winning path that, if unanswered, rewrites the race dynamics in their favour within 72 hours.`
    );
  } else if (severity === "significant") {
    sentences.push(
      `Your position drops ${drop} points to ${adjustedScore} — the opponent's move is not yet decisive but it's gaining oxygen, and in a ${daysRemaining}-day campaign, allowing a ${severity} threat to compound unchecked turns manageable pressure into structural damage.`
    );
  } else {
    sentences.push(
      `A ${drop}-point position adjustment to ${adjustedScore} — this move has limited immediate reach but watch for escalation signals in the next 48 hours, because minor provocations are often test runs for larger operations.`
    );
  }

  // Sentence 2: Most damaged framework
  if (criticalFramework.level === "CRITICAL") {
    sentences.push(
      `${criticalFramework.label} (${criticalFramework.framework}) takes the heaviest damage — ${criticalFramework.impact.toLowerCase().replace(/\.$/, "")} — and without intervention in the next 48 hours, the cascade effect will drag your numbers, mobilisation capacity, and narrative coherence down with it.`
    );
  } else if (criticalFramework.level === "HIGH") {
    sentences.push(
      `${criticalFramework.label} (${criticalFramework.framework}) is most exposed — ${criticalFramework.impact.toLowerCase().replace(/\.$/, "")} — and if left unaddressed for more than 48 hours, this vulnerability becomes a compounding liability that your opponent will exploit repeatedly.`
    );
  } else {
    sentences.push(
      `The damage is distributed rather than concentrated, with ${criticalFramework.label} (${criticalFramework.framework}) taking the sharpest edge — ${criticalFramework.impact.toLowerCase().replace(/\.$/, "")} — but the overall structural integrity of your campaign remains intact if you act within 48 hours.`
    );
  }

  // Sentence 3: Counter-move
  sentences.push(criticalFramework.adaptation);

  return sentences.join(" ");
}
