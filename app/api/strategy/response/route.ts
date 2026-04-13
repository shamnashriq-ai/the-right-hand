export async function POST(request: Request) {
  const data = await request.json();

  const {
    attackDescription,
    severity,
    voterPerception,
    positioning,
    daysRemaining,
  } = data;

  const responses = generateResponseOptions({
    attackDescription,
    severity,
    voterPerception,
    positioning,
    daysRemaining,
  });

  return Response.json({ responses });
}

interface ResponseInput {
  attackDescription: string;
  severity: string;
  voterPerception: string;
  positioning: string;
  daysRemaining: number;
}

function generateResponseOptions(d: ResponseInput): { firm: string; pivot: string; elevate: string } {
  const attack = d.attackDescription.toLowerCase();
  const hasPositioning = d.positioning && d.positioning.length > 5;
  const positioningShort = d.positioning ? d.positioning.slice(0, 40) : "our proven track record";

  // Detect attack themes
  const isCharacterAttack = attack.includes("corrupt") || attack.includes("character") || attack.includes("moral") || attack.includes("scandal") || attack.includes("legal");
  const isCompetenceAttack = attack.includes("inexperienc") || attack.includes("young") || attack.includes("qualif") || attack.includes("capable") || attack.includes("can't");
  const isOutsiderAttack = attack.includes("outsider") || attack.includes("parachute") || attack.includes("not from") || attack.includes("don't belong") || attack.includes("luar");
  const isAssociationAttack = attack.includes("party") || attack.includes("associat") || attack.includes("linked") || attack.includes("connected to");

  let firm: string;
  let pivot: string;
  let elevate: string;

  if (isCharacterAttack) {
    firm = `The facts speak clearly — our record is documented, transparent, and open to scrutiny, and those making unsubstantiated character claims should be prepared to present evidence to match their volume.`;
    pivot = `While opponents focus on personal attacks, we're focused on what actually matters to voters in this constituency — ${hasPositioning ? positioningShort : "the real issues affecting families and livelihoods"}.`;
    elevate = `This constituency deserves a conversation about its future, not a campaign built on tearing people down — voters will judge us by what we build, not by what others try to destroy.`;
  } else if (isCompetenceAttack) {
    firm = `Our detailed policy positions, ground presence, and specific commitments to this constituency demonstrate more preparedness than years of empty incumbency — competence is measured in solutions delivered, not years served.`;
    pivot = `The question isn't how long someone has held a title — it's whether they've actually solved a single problem for the people in this constituency, and our track record of ${hasPositioning ? positioningShort : "real engagement"} answers that definitively.`;
    elevate = `Every transformative leader was once called inexperienced by those who confused longevity with leadership — this constituency is ready for someone who brings energy, ideas, and accountability rather than the comfort of the status quo.`;
  } else if (isOutsiderAttack) {
    firm = `We've walked every district, met hundreds of residents, and built a ground team of local volunteers — the real outsiders are those who visit only during elections and disappear after polling day.`;
    pivot = `Being from this community isn't just about geography — it's about showing up consistently, listening to what people actually need, and delivering on ${hasPositioning ? positioningShort : "commitments that matter to local families"}.`;
    elevate = `The people of this constituency don't need someone who was born here and left — they need someone who chose to be here and stays, which is exactly what this campaign represents.`;
  } else if (isAssociationAttack) {
    firm = `We stand on our own record and our own commitments to this constituency — voters will judge us by what we do here, not by the labels others try to attach.`;
    pivot = `While opponents play the association game, we're building something specific for this constituency — ${hasPositioning ? positioningShort : "real solutions for real people"} — and that's what voters actually care about.`;
    elevate = `Politics works best when candidates compete on ideas rather than guilt-by-association — we invite our opponents to match us policy for policy, commitment for commitment, instead of hiding behind innuendo.`;
  } else {
    // Generic response for unclassified attacks
    firm = `The claims being circulated are baseless and do not align with the documented facts of our work in this constituency — we welcome any scrutiny of our actual record and commitments.`;
    pivot = `While this distraction plays out, our team is on the ground today doing what we've done every day of this campaign — ${hasPositioning ? positioningShort : "working directly on the issues that affect people's daily lives"}.`;
    elevate = `Voters in this constituency are smarter than the tactics being used against us — they will choose the candidate who showed up with solutions over the one who showed up with attacks, and ${d.daysRemaining > 0 ? `in ${d.daysRemaining} days` : "on polling day"} that choice will be clear.`;
  }

  return { firm, pivot, elevate };
}
