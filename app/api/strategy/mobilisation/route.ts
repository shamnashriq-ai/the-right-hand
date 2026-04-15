import { selectMobilisationPrecedent } from "@/lib/intelligence/selectPrecedent";

export async function POST(request: Request) {
  const data = await request.json();

  const {
    volunteers,
    coveredDistricts,
    totalDistricts,
    daysRemaining,
    contactsYesterday,
    coveragePercent,
    uncoveredDistricts,
    volunteersPerDistrict,
    dailyContactsRequired,
    paceStatus,
    gapPercent,
    ageProfile,
    mobilisationChannel,
    branches,
    roadshowsThisWeek,
    leadersActivated,
    newDistrictsThisWeek,
    votesNeeded,
  } = data;

  // Build a deterministic assessment without external AI calls
  // This generates a sharp, contextual 3-sentence assessment
  const assessment = generateAssessment({
    volunteers,
    coveredDistricts,
    totalDistricts,
    daysRemaining,
    contactsYesterday,
    coveragePercent: parseFloat(coveragePercent),
    uncoveredDistricts,
    volunteersPerDistrict: parseFloat(volunteersPerDistrict),
    dailyContactsRequired,
    paceStatus,
    gapPercent: parseFloat(gapPercent),
    ageProfile,
    mobilisationChannel,
    branches,
    roadshowsThisWeek,
    leadersActivated,
    newDistrictsThisWeek,
    votesNeeded,
  });

  const { precedent, precedent_entry_id } = selectMobilisationPrecedent({
    coveragePercent: parseFloat(coveragePercent),
    paceStatus,
    volunteers,
    gapPercent: parseFloat(gapPercent),
    mobilisationChannel,
  });

  return Response.json({ assessment, precedent, precedent_entry_id });
}

interface AssessmentInput {
  volunteers: number;
  coveredDistricts: number;
  totalDistricts: number;
  daysRemaining: number;
  contactsYesterday: number;
  coveragePercent: number;
  uncoveredDistricts: number;
  volunteersPerDistrict: number;
  dailyContactsRequired: number;
  paceStatus: string;
  gapPercent: number;
  ageProfile: string;
  mobilisationChannel: string;
  branches: number;
  roadshowsThisWeek: number;
  leadersActivated: number;
  newDistrictsThisWeek: number;
  votesNeeded: number;
}

function generateAssessment(d: AssessmentInput): string {
  const sentences: string[] = [];

  // Sentence 1: Current ground reality
  if (d.coveragePercent >= 80 && d.paceStatus !== "BEHIND") {
    sentences.push(
      `Your machinery is in strong position — ${d.volunteers} volunteers covering ${d.coveragePercent.toFixed(0)}% of polling districts with ${d.volunteersPerDistrict.toFixed(1)} volunteers per district, and your contact rate is ${d.paceStatus === "AHEAD" ? "ahead of" : "matching"} the required pace of ${d.dailyContactsRequired} contacts per day.`
    );
  } else if (d.coveragePercent >= 50) {
    sentences.push(
      `You have ${d.volunteers} volunteers across ${d.coveredDistricts} of ${d.totalDistricts} districts (${d.coveragePercent.toFixed(0)}% coverage) with ${d.daysRemaining} days remaining — machinery is building but ${d.uncoveredDistricts} districts remain exposed and your daily contact rate of ${d.contactsYesterday} is ${d.paceStatus === "BEHIND" ? `below the required ${d.dailyContactsRequired}` : "meeting targets"}.`
    );
  } else {
    sentences.push(
      `Critical exposure: only ${d.coveragePercent.toFixed(0)}% ground coverage with ${d.volunteers} volunteers across ${d.coveredDistricts} of ${d.totalDistricts} districts — ${d.uncoveredDistricts} polling districts have zero machinery with just ${d.daysRemaining} days to polling day.`
    );
  }

  // Sentence 2: Most urgent operational gap
  if (d.gapPercent > 40) {
    sentences.push(
      `Your most urgent gap is geographic — ${d.uncoveredDistricts} districts (${d.gapPercent.toFixed(0)}% of the seat) have no presence at all, and every day without coverage in these areas is compounding votes you cannot recover in the final stretch.`
    );
  } else if (d.paceStatus === "BEHIND" && d.dailyContactsRequired > 0) {
    const deficit = d.dailyContactsRequired - d.contactsYesterday;
    sentences.push(
      `Your most urgent gap is contact velocity — you need ${d.dailyContactsRequired} voter touches per day but delivered only ${d.contactsYesterday} yesterday, a deficit of ${deficit} contacts that accumulates into unrecoverable lost ground if not corrected in the next 48 hours.`
    );
  } else if (d.volunteersPerDistrict < 3 && d.coveredDistricts > 0) {
    sentences.push(
      `Your most pressing concern is volunteer density — at ${d.volunteersPerDistrict.toFixed(1)} volunteers per district, your teams are spread too thin to achieve meaningful depth, risking surface-level contact that doesn't convert to committed votes.`
    );
  } else if (d.roadshowsThisWeek === 0 && d.daysRemaining <= 21) {
    sentences.push(
      `With ${d.daysRemaining} days remaining and zero roadshows this week, your ground presence lacks the momentum events that drive organic volunteer recruitment and voter buzz — this visibility gap becomes harder to close with each passing day.`
    );
  } else {
    sentences.push(
      `While your core metrics are stable, watch for operational fatigue — ${d.volunteers} volunteers sustaining ${d.contactsYesterday} daily contacts need rotation and motivation to maintain pace through the final ${d.daysRemaining} days without burnout-driven attrition.`
    );
  }

  // Sentence 3: Specific tactical recommendation
  if (d.gapPercent > 30 && d.branches > 0) {
    sentences.push(
      `Immediate action: redeploy ${Math.max(1, Math.floor(d.volunteers * 0.15))} volunteers from your ${d.branches} existing operations rooms into the ${Math.min(3, d.uncoveredDistricts)} highest-density uncovered districts — even a skeleton crew of 2-3 establishes presence and starts generating contact data that your main force can build on.`
    );
  } else if (d.paceStatus === "BEHIND") {
    sentences.push(
      `Tactical fix: shift to a WhatsApp-first contact blitz today — each volunteer sends personalised voice notes to 20 voters in their assigned district, which can triple your effective contact rate from ${d.contactsYesterday} to ${d.contactsYesterday * 3} within 24 hours without requiring more boots on the ground.`
    );
  } else if (d.newDistrictsThisWeek === 0 && d.uncoveredDistricts > 0) {
    sentences.push(
      `Priority move: assign your ${d.leadersActivated > 0 ? d.leadersActivated + " activated community leaders" : "strongest volunteers"} to scout ${Math.min(2, d.uncoveredDistricts)} new district${d.uncoveredDistricts > 1 ? "s" : ""} this week — even informal presence starts the clock on voter familiarity, which compounds into trust by polling day.`
    );
  } else {
    sentences.push(
      `Consolidation play: with ${d.coveragePercent.toFixed(0)}% coverage and pace ${d.paceStatus === "AHEAD" ? "ahead" : "on track"}, double down on your ${d.mobilisationChannel || "primary channel"} in the ${Math.min(3, d.coveredDistricts)} districts with the lowest contact-to-voter ratios — depth in swing districts wins more votes than breadth in safe ones.`
    );
  }

  return sentences.join(" ");
}
