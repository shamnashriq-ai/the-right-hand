export async function POST(request: Request) {
  const data = await request.json();

  const {
    voterPerception,
    positioning,
    negativeNarratives,
    digitalPlatform,
    mediaAccess,
    communityChannels,
    activeAttack,
    attackDescription,
    attackSeverity,
    daysRemaining,
    phase,
    channelCount,
  } = data;

  const assessment = generatePerceptionAssessment({
    voterPerception,
    positioning,
    negativeNarratives,
    digitalPlatform,
    mediaAccess,
    communityChannels,
    activeAttack,
    attackDescription,
    attackSeverity,
    daysRemaining,
    phase,
    channelCount,
  });

  return Response.json({ assessment });
}

interface AssessmentInput {
  voterPerception: string;
  positioning: string;
  negativeNarratives: string;
  digitalPlatform: string;
  mediaAccess: string;
  communityChannels: string[];
  activeAttack: boolean;
  attackDescription: string;
  attackSeverity: string;
  daysRemaining: number;
  phase: string;
  channelCount: number;
}

function generatePerceptionAssessment(d: AssessmentInput): string {
  const sentences: string[] = [];

  // Sentence 1: Current perception reality
  if (d.voterPerception.includes("Unknown")) {
    sentences.push(
      `Your candidate is invisible to the electorate with ${d.daysRemaining} days remaining — voters cannot support someone they don't recognise, and every day without name recognition is a day your opponent consolidates their narrative advantage unchallenged.`
    );
  } else if (d.voterPerception.includes("not fully trusted")) {
    sentences.push(
      `Voters know your name but haven't crossed the trust threshold — with ${d.daysRemaining} days left, you're in the dangerous middle ground where recognition exists but commitment doesn't, making you vulnerable to any narrative that confirms existing doubts${d.negativeNarratives ? ` around "${d.negativeNarratives.split(",")[0].trim()}"` : ""}.`
    );
  } else if (d.voterPerception.includes("inexperienced")) {
    sentences.push(
      `You have goodwill but not gravity — voters like you but question whether you can deliver, and with ${d.daysRemaining} days remaining, the gap between being liked and being trusted with power is the single biggest conversion barrier in your campaign.`
    );
  } else if (d.voterPerception.includes("Established")) {
    sentences.push(
      `Your brand foundation is solid — voters respect you and trust your capability, but with ${d.daysRemaining} days to go, the risk shifts from perception to complacency; established candidates lose when they stop earning votes and start expecting them.`
    );
  } else if (d.voterPerception.includes("Under attack")) {
    sentences.push(
      `You are under active fire${d.attackSeverity ? ` at ${d.attackSeverity.toLowerCase()} level` : ""} and every hour without a response allows the attack narrative to harden into accepted truth — with ${d.daysRemaining} days remaining, perception defence is now more urgent than perception building.`
    );
  } else {
    sentences.push(
      `Perception data incomplete — without knowing where voters currently place you, any narrative strategy risks talking past the audience rather than to them.`
    );
  }

  // Sentence 2: Most dangerous narrative gap
  if (d.activeAttack && d.attackSeverity.includes("Severe")) {
    sentences.push(
      `The most dangerous gap right now is the viral attack — "${d.attackDescription.slice(0, 60)}${d.attackDescription.length > 60 ? "..." : ""}" is spreading faster than your response infrastructure can contain, and within 48 hours this becomes the default story voters tell about you unless you deploy a coordinated counter-narrative across ${d.digitalPlatform ? d.digitalPlatform.toLowerCase() : "all channels"}.`
    );
  } else if (d.activeAttack && d.attackSeverity.includes("Moderate")) {
    sentences.push(
      `The attack gaining traction — "${d.attackDescription.slice(0, 50)}${d.attackDescription.length > 50 ? "..." : ""}" — is your most urgent perception risk because moderate threats become severe when ignored; you have a 48-hour window to redirect this narrative before it compounds into something your ${d.channelCount || 0} community channels cannot offset.`
    );
  } else if (d.negativeNarratives && d.negativeNarratives.length > 5) {
    sentences.push(
      `The circulating narratives — "${d.negativeNarratives.slice(0, 80)}${d.negativeNarratives.length > 80 ? "..." : ""}" — represent the most dangerous perception gap because unanswered negative framing compounds daily, and ${d.mediaAccess?.includes("Weak") ? "with weak media access, you lack the earned media channels to counter this at scale" : "your response must use your media access strategically rather than defensively"}.`
    );
  } else if (d.channelCount < 2) {
    sentences.push(
      `Your most dangerous gap is channel diversity — with ${d.channelCount || "no"} community channel${d.channelCount === 1 ? "" : "s"} and ${d.digitalPlatform ? d.digitalPlatform.toLowerCase() : "undefined digital"} as primary platform, you're one algorithm change or platform disruption away from losing your entire voter communication pipeline.`
    );
  } else if (d.mediaAccess?.includes("Weak")) {
    sentences.push(
      `Your weakest flank is media access — without regular coverage, you're fighting entirely on digital and community channels, which means your narrative reaches supporters but struggles to cross into undecided voter spaces where elections are actually won.`
    );
  } else {
    sentences.push(
      `With no active threats detected and ${d.channelCount || 0} community channels operational, your perception risk is strategic drift — the danger isn't what opponents say, it's that your own narrative loses sharpness as the campaign grinds forward without a clear, repeatable message architecture.`
    );
  }

  // Sentence 3: Specific narrative action
  if (d.phase === "SEED") {
    sentences.push(
      `Immediate action: ${d.positioning ? `lock "${d.positioning.slice(0, 50)}${d.positioning.length > 50 ? "..." : ""}" as your core positioning and` : ""} deploy it through ${d.digitalPlatform ? d.digitalPlatform.toLowerCase() : "your primary channel"} with three pieces of content this week — each one answering a different voter doubt with a specific, verifiable proof point rather than a general promise.`
    );
  } else if (d.phase === "BUILD") {
    sentences.push(
      `Build-phase priority: increase content cadence to twice daily on ${d.digitalPlatform ? d.digitalPlatform.toLowerCase() : "your primary platform"}, activate your ${d.channelCount || 0} community channels for in-person narrative reinforcement, and ensure every piece of content this week ends with a specific ask — attendance, share, or commitment — that converts passive awareness into active support.`
    );
  } else {
    sentences.push(
      `Final-phase directive: stop introducing new ideas — repeat your single strongest message on every platform, through every channel, in every room for the next ${d.daysRemaining} days; at this stage, message discipline wins more votes than message creativity, and your ${d.channelCount || 0} community channels should be delivering the same talking points as your ${d.digitalPlatform ? d.digitalPlatform.toLowerCase() : "digital"} content.`
    );
  }

  return sentences.join(" ");
}
