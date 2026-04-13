export async function POST(request: Request) {
  const data = await request.json();

  const {
    seatType,
    classification,
    candidateStatus,
    previousResult,
    opponentStrength,
    candidatesContesting,
    topLocalIssue,
    partyBrand,
    daysUntilPolling,
    totalVoters,
  } = data;

  const assessment = generateAssessment({
    seatType,
    classification,
    candidateStatus,
    previousResult,
    opponentStrength,
    candidatesContesting,
    topLocalIssue,
    partyBrand,
    daysUntilPolling,
    totalVoters,
  });

  return Response.json({ assessment });
}

interface GroundInput {
  seatType: string;
  classification: string;
  candidateStatus: string;
  previousResult: string;
  opponentStrength: string;
  candidatesContesting: string;
  topLocalIssue: string;
  partyBrand: string;
  daysUntilPolling: number;
  totalVoters: number;
}

function generateAssessment(d: GroundInput): string {
  const sentences: string[] = [];

  // Sentence 1: Seat reality diagnosis
  const isHostile = d.partyBrand === "Headwind against us" && d.opponentStrength === "Strong — dominant incumbent";
  const isFavourable = d.partyBrand === "Strong tailwind" && d.opponentStrength === "Weak";
  const isChallenger = d.candidateStatus === "Challenger";
  const isFirstTime = d.previousResult === "First contest";
  const multiCorner = d.candidatesContesting === "4" || d.candidatesContesting === "5+";

  if (isHostile) {
    sentences.push(
      `This is a hostile seat — you're ${isChallenger ? "challenging" : "defending in"} a ${d.classification.toLowerCase()} ${d.seatType.toLowerCase()} constituency against a dominant incumbent with party headwind working against you, meaning every vote requires twice the effort and your margin for error is effectively zero.`
    );
  } else if (isFavourable) {
    sentences.push(
      `You have structural advantage in this ${d.classification.toLowerCase()} ${d.seatType.toLowerCase()} seat — party brand is a tailwind and your opponent is weak, but complacency in favourable seats has produced more upsets than hostile terrain; treat this as a seat to lock down, not coast through.`
    );
  } else if (isChallenger && d.opponentStrength === "Strong — dominant incumbent") {
    sentences.push(
      `You're challenging a dominant incumbent in a ${d.classification.toLowerCase()} ${d.seatType.toLowerCase()} seat${d.totalVoters > 0 ? ` with ${d.totalVoters.toLocaleString()} registered voters` : ""} — the data says this is an uphill fight, but incumbents are most vulnerable when they assume they're safe, and that's your strategic opening.`
    );
  } else {
    sentences.push(
      `This is genuinely contested ground — a ${d.classification.toLowerCase()} ${d.seatType.toLowerCase()} seat${isFirstTime ? " where you have no previous result to anchor against" : ""} with ${d.opponentStrength.toLowerCase()} opposition${multiCorner ? ` in a crowded ${d.candidatesContesting}-cornered fight where vote-splitting changes the arithmetic` : ""}, meaning campaign execution quality will determine the outcome.`
    );
  }

  // Sentence 2: Most dangerous variable
  if (d.daysUntilPolling <= 14) {
    sentences.push(
      `Your most dangerous variable is time — with only ${d.daysUntilPolling} days until polling, you are in the execution window where strategy changes become impossible and only ground-level contact velocity matters; every day from now must produce measurable voter touches or the numbers won't move.`
    );
  } else if (d.partyBrand === "Headwind against us") {
    sentences.push(
      `Your most dangerous variable is the party brand deficit — voters in this seat are predisposed against your party label, which means your candidate must establish a personal brand that transcends party association, and every piece of communication must lead with the candidate's track record, not the party flag.`
    );
  } else if (multiCorner) {
    sentences.push(
      `Your most dangerous variable is vote fragmentation — in a ${d.candidatesContesting}-cornered contest, the winning number drops but prediction accuracy collapses, and a single rival's withdrawal or tactical voting pact could reshape the arithmetic overnight, so you need both a primary strategy and a contingency for consolidation scenarios.`
    );
  } else if (isFirstTime) {
    sentences.push(
      `Your most dangerous variable is name recognition — as a first-time contestant, you're starting from zero voter awareness while your opponent has incumbency visibility built in, which means your first 10 days must be entirely about saturating the constituency with your name and face before pivoting to issues.`
    );
  } else {
    sentences.push(
      `Your most important variable is operational consistency — in a ${d.classification.toLowerCase()} seat with ${d.daysUntilPolling} days remaining, the candidate who maintains daily ground presence and systematic voter contact will outperform the one relying on sporadic rallies and social media bursts.`
    );
  }

  // Sentence 3: Strategic directive
  if (d.topLocalIssue) {
    sentences.push(
      `Strategic directive: own "${d.topLocalIssue}" as your signature issue — every speech, every WhatsApp forward, every door-knock should connect back to this because the candidate who is synonymous with the voters' top concern captures the default vote of every undecided citizen who walks into the booth thinking about their daily reality.`
    );
  } else if (d.classification === "Rural" && d.candidateStatus === "Challenger") {
    sentences.push(
      `Strategic directive: in rural seats, the challenger wins through community leader endorsements — identify the three most influential ketua kampung, surau leaders, or JKKK members and secure their visible support within the first week, because in rural constituencies one trusted voice converts more votes than a thousand posters.`
    );
  } else if (d.classification === "Urban") {
    sentences.push(
      `Strategic directive: urban voters respond to competence signals — lead with specific, measurable commitments rather than emotional appeals, and ensure your digital presence is polished because urban constituencies research candidates online before deciding, making your social media and press coverage your de facto campaign office.`
    );
  } else {
    sentences.push(
      `Strategic directive: with ${d.daysUntilPolling} days remaining, lock your campaign calendar to a daily rhythm of morning community walkabouts, afternoon targeted house visits, and evening ceramah or WhatsApp content drops — consistency of presence converts to familiarity, and familiarity is the gateway to trust.`
    );
  }

  return sentences.join(" ");
}
