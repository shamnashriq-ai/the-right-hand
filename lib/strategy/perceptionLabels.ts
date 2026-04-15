// Labels switch between external-campaign (constituency) and internal-election framing.
// Backend may extend this; keep getPerceptionLabels signature stable.

export type PerceptionLabels = {
  // Core nouns
  electorateNoun: string;
  opponentNoun: string;
  constituencyNoun: string;

  // Phase subtexts
  phaseSubtexts: {
    discover: string;
    define: string;
    idea: string;
    develop: string;
    measure: string;
  };

  // DISCOVER input labels (5 blocks)
  dominantEmotion: string;
  problemStatements: string;
  whoTheyBlame: string;
  whatTheyWant: string;
  currentPerception: string;

  // DEFINE input labels (5 blocks)
  iAmThe: string;
  contrast: string;
  positioningStatement: string;
  theOneThing: string;
  vulnerability: string;

  // IDEA input labels (4 blocks)
  credibleAdvantages: string;
  threePromises: string;
  constituencyPledge: string;
  whyNow: string;

  // DEVELOP section labels
  developSections: {
    visionStatement: string;
    whoIAm: string;
    pledge1: string;
    pledge2: string;
    pledge3: string;
    constituencyPromise: string;
    callToAction: string;
    commitment: string;
    accountability: string;
  };

  // MEASURE section labels
  measureSections: {
    defenseClaims: string;
    attackSurface: string;
    inoculationStatements: string;
    narrativeAssessment: string;
  };

  // Placeholder text
  placeholders: {
    dominantEmotion: string;
    problemStatement: string;
    whoTheyBlame: string;
    whatTheyWant: string;
    currentPerception: string;
    iAmThe: string;
    contrast: string;
    positioningStatement: string;
    theOneThing: string;
    vulnerability: string;
    vulnerabilityCounter: string;
    credibleAdvantage: string;
    promise: string;
    constituencyPledge: string;
    whyNow: string;
    attack: string;
    defense: string;
  };
};

export const constituencyLabels: PerceptionLabels = {
  electorateNoun: "voters",
  opponentNoun: "opponent",
  constituencyNoun: "constituency",

  phaseSubtexts: {
    discover:
      "Understand the voter before building the candidate's story — the emotional register beneath the policy demands.",
    define:
      "Position the candidate relative to voter needs and opponent framing — claim distinct territory.",
    idea:
      "Audit the value propositions before they become manifesto commitments — pressure-test every promise.",
    develop:
      "Build the manifesto architecture — vision, identity, pledges, and a call to action grounded in constituency reality.",
    measure:
      "Stress-test the narrative — surface attack vectors and deploy inoculation statements before the opponent does.",
  },

  dominantEmotion: "Dominant Voter Emotion",
  problemStatements: "Top 3 Problem Statements",
  whoTheyBlame: "Who Voters Blame",
  whatTheyWant: "What Voters Want Most",
  currentPerception: "Current Perception of Candidate",

  iAmThe: "I am the candidate who ___",
  contrast: "Contrast Against Opponent",
  positioningStatement: "Positioning Statement",
  theOneThing: "The One Thing",
  vulnerability: "Biggest Vulnerability",

  credibleAdvantages: "Credible Advantages",
  threePromises: "Three Signature Promises",
  constituencyPledge: "Constituency-Specific Pledge",
  whyNow: "Why Now",

  developSections: {
    visionStatement: "Vision Statement",
    whoIAm: "Who I Am",
    pledge1: "Pledge 1",
    pledge2: "Pledge 2",
    pledge3: "Pledge 3",
    constituencyPromise: "Promise to the Constituency",
    callToAction: "Call to Action",
    commitment: "Commitment",
    accountability: "Accountability Mechanism",
  },

  measureSections: {
    defenseClaims: "Defense Claims",
    attackSurface: "Most Likely Attack",
    inoculationStatements: "Inoculation Statements",
    narrativeAssessment: "Narrative Intelligence Assessment",
  },

  placeholders: {
    dominantEmotion:
      "e.g. Frustration with stagnant development after years of broken promises",
    problemStatement:
      "e.g. Youth unemployment in the constituency has doubled in 3 years",
    whoTheyBlame: "e.g. Incumbent MP and party leadership",
    whatTheyWant:
      "e.g. Concrete job opportunities and visible infrastructure delivery",
    currentPerception:
      "e.g. Known but not yet trusted — seen as promising but unproven",
    iAmThe:
      "e.g. I am the candidate who lived this problem before I ran on solving it",
    contrast:
      "e.g. Unlike my opponent, I deliver in weeks what has been promised for years",
    positioningStatement:
      "e.g. The working-class candidate who knows the ground because they walk it every day",
    theOneThing: "e.g. Delivery before drama",
    vulnerability: "e.g. First-time candidate with limited political track record",
    vulnerabilityCounter:
      "e.g. Every incumbent was once a first-timer — what matters is who actually delivers",
    credibleAdvantage:
      "e.g. 10 years running community programmes in this constituency",
    promise:
      "e.g. A functioning youth employment centre in every district within 12 months",
    constituencyPledge:
      "e.g. Rebuild the old market square as a night-market jobs hub within the first 100 days",
    whyNow:
      "e.g. The window to reverse three years of decline is closing — another term wasted cannot be recovered",
    attack: "e.g. Opponent will claim you are too inexperienced to govern",
    defense:
      "e.g. Experience without results is just time served — here is what I've actually delivered",
  },
};

export const internalLabels: PerceptionLabels = {
  electorateNoun: "delegates",
  opponentNoun: "rival",
  constituencyNoun: "branch",

  phaseSubtexts: {
    discover:
      "Understand the delegate before building the contender's story — read the emotional register inside the party.",
    define:
      "Position the contender relative to delegate concerns and rival framing — claim distinct territory inside the party.",
    idea:
      "Audit the internal commitments before they become public positions — pressure-test every pledge to the base.",
    develop:
      "Build the contender's manifesto — vision, identity, commitments, and a call to the delegate base.",
    measure:
      "Stress-test the internal narrative — surface attack vectors inside the party and deploy inoculation statements early.",
  },

  dominantEmotion: "Dominant Delegate Emotion",
  problemStatements: "Top 3 Party Grievances",
  whoTheyBlame: "Who Delegates Blame",
  whatTheyWant: "What Delegates Want Most",
  currentPerception: "Current Perception Within Party",

  iAmThe: "I am the contender who ___",
  contrast: "Contrast Against Rival",
  positioningStatement: "Internal Positioning Statement",
  theOneThing: "The One Thing",
  vulnerability: "Biggest Vulnerability",

  credibleAdvantages: "Credible Internal Advantages",
  threePromises: "Three Signature Commitments",
  constituencyPledge: "Branch-Specific Commitment",
  whyNow: "Why Now",

  developSections: {
    visionStatement: "Vision Statement",
    whoIAm: "Who I Am",
    pledge1: "Commitment 1",
    pledge2: "Commitment 2",
    pledge3: "Commitment 3",
    constituencyPromise: "Promise to the Base",
    callToAction: "Call to the Delegate Base",
    commitment: "Commitment",
    accountability: "Accountability Mechanism",
  },

  measureSections: {
    defenseClaims: "Defense Claims",
    attackSurface: "Most Likely Internal Attack",
    inoculationStatements: "Inoculation Statements",
    narrativeAssessment: "Narrative Intelligence Assessment",
  },

  placeholders: {
    dominantEmotion:
      "e.g. Disillusionment with current leadership's drift from the party's roots",
    problemStatement:
      "e.g. Branches have been sidelined in national decision-making for two terms",
    whoTheyBlame: "e.g. Central leadership and its inner circle",
    whatTheyWant:
      "e.g. Restored branch authority and leaders who have served on the ground",
    currentPerception:
      "e.g. Respected inside the party but not yet seen as a top-tier contender",
    iAmThe:
      "e.g. I am the contender who rebuilt this branch when nobody else would",
    contrast:
      "e.g. Unlike my rival, I earned this seat by serving, not by inheriting it",
    positioningStatement:
      "e.g. The grassroots contender who has never forgotten whose votes built this party",
    theOneThing: "e.g. The branches come first",
    vulnerability: "e.g. Limited exposure to the national media stage",
    vulnerabilityCounter:
      "e.g. Leadership is earned through service, not cultivated in press rooms",
    credibleAdvantage:
      "e.g. 15 years of unbroken branch leadership and demonstrable loyalty",
    promise:
      "e.g. Rotating branch seats at the national council table every quarter",
    constituencyPledge:
      "e.g. A dedicated branch empowerment fund within the first 90 days in role",
    whyNow:
      "e.g. Another term of centralised drift will cost us the branches permanently",
    attack: "e.g. Rival will claim you cannot unite the national party",
    defense:
      "e.g. Unity comes from leaders who listen first — that is exactly how I have always led",
  },
};

export function getPerceptionLabels(
  electionType?: "constituency" | "internal" | string | null
): PerceptionLabels {
  if (!electionType) return constituencyLabels;
  const t = String(electionType).toLowerCase();
  if (t.includes("internal") || t.includes("party") || t.includes("branch")) {
    return internalLabels;
  }
  return constituencyLabels;
}
