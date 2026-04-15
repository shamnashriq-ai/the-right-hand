export type FrameworkTag = "F1" | "F2" | "F3" | "F4" | "F5" | "ALL";
export type EntryType = "campaign" | "scholar" | "tactician";

export interface IntelligenceEntry {
  id: string;
  type: EntryType;
  name: string;
  source: string;
  year: number;
  origin: string;
  framework_tags: FrameworkTag[];
  core_insight: string;
  trigger_conditions: string[];
  platform_application: string;
  brief: {
    context: string;
    the_lesson: string;
    the_proof: string;
    the_warning: string;
    malaysian_parallel: string;
  };
  citation_line: string;
}

export const library: IntelligenceEntry[] = [
  {
    id: "reagan-1980",
    type: "campaign",
    name: "Reagan 1980 Presidential Campaign",
    source: "Reagan–Carter presidential contest",
    year: 1980,
    origin: "United States",
    framework_tags: ["F2", "F5"],
    core_insight:
      "When voters know the candidate but do not trust them, the strategic task is not more exposure — it is reframing the meaning of what they already see.",
    trigger_conditions: [
      "Candidate has high name recognition but low trust scores",
      "Opponent has defined the candidate in hostile terms before the candidate defined themselves",
      "Incumbent is weakened by economic anxiety and voter fatigue",
    ],
    platform_application:
      "Use when DEFINE phase reveals a 'known but not trusted' perception gap — the candidate must seize the symbolic frame before the opponent's definition hardens.",
    brief: {
      context:
        "By 1980, Ronald Reagan was a former governor and two-time presidential aspirant — known to every American household, but dismissed by elites as a B-movie actor and by moderates as a right-wing caricature. Carter's team believed Reagan's familiarity was his weakness, and spent months painting him as reckless.",
      the_lesson:
        "Familiarity without trust is more dangerous than obscurity. Reagan did not try to become better known — he became differently understood. He substituted the 'dangerous ideologue' frame with the 'optimistic grandfather' frame through a single televised debate performance: 'There you go again.'",
      the_proof:
        "Reagan entered October 1980 trailing or tied. After one debate and one reframing question — 'Are you better off than you were four years ago?' — he won 44 states and 489 electoral votes in a landslide that realigned American politics for a generation.",
      the_warning:
        "Reframing only works when the new frame is already latent in the voter's mind. Reagan did not invent optimism — he gave voters permission to feel what they already wanted to feel. A forced or invented frame will be rejected as performance.",
      malaysian_parallel:
        "Anwar Ibrahim's 2022 rehabilitation followed the same logic: decades of name recognition, but trust was the variable. He did not run harder — he ran differently, shifting the frame from 'reformasi firebrand' to 'elder statesman who waited.'",
    },
    citation_line:
      "Reagan 1980 · Presidential Campaign · 1980 · The candidate who reframes a known-but-distrusted perception can win without increasing exposure.",
  },
  {
    id: "mahathir-1981",
    type: "campaign",
    name: "Mahathir UMNO Presidency Contest",
    source: "UMNO internal succession",
    year: 1981,
    origin: "Malaysia",
    framework_tags: ["F1", "F4", "F5"],
    core_insight:
      "In internal party contests, the candidate who maps and activates the obligation network — who owes whom, who appointed whom — controls the outcome before a single delegate vote is cast.",
    trigger_conditions: [
      "Party internal election where delegates are tied to patronage chains",
      "Candidate has institutional history that can be converted into loyalty obligations",
      "The contest is decided at division or branch level, not the public stage",
    ],
    platform_application:
      "Use when running in a F1 internal delegate contest — the ground intelligence layer must map faction lines and obligation chains before persuasion begins.",
    brief: {
      context:
        "Mahathir rose to UMNO's presidency in 1981 not by public charisma alone, but by years of patient machinery-building. He understood that UMNO was not an electorate — it was an interlocking set of division chiefs, branch heads, and patronage dependents.",
      the_lesson:
        "Internal elections are won by architecture, not argument. Mahathir did not campaign to delegates — he secured the leaders who controlled them. Every branch chief who owed him a favour, an appointment, or a contract became a node in a distributed vote-delivery machine.",
      the_proof:
        "Mahathir held uninterrupted UMNO presidency from 1981 to 2003 — the longest tenure in the party's history — and then returned in 2018 to win a general election on the strength of the same machinery logic, now deployed against his successors.",
      the_warning:
        "Machinery decays the moment the candidate stops feeding it. Mahathir's own downfall in 1998, and the Najib and Zahid challenges later, all followed breakdowns in obligation maintenance — not failures of public messaging.",
      malaysian_parallel:
        "This is the Malaysian precedent. Every UMNO internal contest since — Khairy 2009, Zahid 2018, the 2023 division wars — has been decided by whose obligation network was still paying out at the moment of the vote.",
    },
    citation_line:
      "Mahathir 1981 · UMNO Presidency · 1981 · Internal contests are won by obligation architecture, not by delegate persuasion.",
  },
  {
    id: "obama-2008",
    type: "campaign",
    name: "Obama 2008 Presidential Campaign",
    source: "Obama–McCain presidential contest",
    year: 2008,
    origin: "United States",
    framework_tags: ["F1", "F3", "F4"],
    core_insight:
      "The campaign that invests in ground intelligence and coverage mapping before media spend wins the precinct-level arithmetic that decides close states.",
    trigger_conditions: [
      "Competing in a state with granular precinct-level data available",
      "Resources allow a volunteer-driven ground operation at scale",
      "Opponent is relying on broadcast media and traditional endorsements",
    ],
    platform_application:
      "Use when the F1 ground phase reveals coverage gaps — the Obama model says fill the map before you fill the airwaves.",
    brief: {
      context:
        "In 2008, the Obama campaign built what strategists still call the most data-driven ground operation in American political history. Every field office knew which precincts were under-contacted and deployed volunteers to close gaps before spending another dollar on TV.",
      the_lesson:
        "Media spend without ground coverage is wasted. Obama's team ran the arithmetic: a door knock was worth more than a television spot in any precinct under 60% contacted. They built a machine that told organisers exactly where the next volunteer hour should go.",
      the_proof:
        "Obama won Indiana and North Carolina — two states no Democrat had carried in decades — on the strength of ground coverage in precincts the McCain campaign had written off. The precinct-level margins in those states exceeded the total media spend differential.",
      the_warning:
        "The ground model requires infrastructure that takes months to build. Campaigns that try to replicate Obama 2008 in the last 30 days fail — the data pipelines, volunteer training, and trust with local leaders must already exist.",
      malaysian_parallel:
        "PH's GE14 ground machinery in Johor and Selangor mirrored this logic: granular polling-district contact tracking, volunteer assignment by coverage gap, and suppression of media spend in over-saturated areas.",
    },
    citation_line:
      "Obama 2008 · Presidential Campaign · 2008 · Ground coverage before media spend — the precinct-level arithmetic decides close seats.",
  },
  {
    id: "mamdani-2025",
    type: "campaign",
    name: "Mamdani NYC Mayoral Primary",
    source: "New York City Democratic primary",
    year: 2025,
    origin: "United States",
    framework_tags: ["F2", "F3", "F4", "F5"],
    core_insight:
      "An outspent underdog wins by monopolising a single issue with volunteer depth, not by spreading across the full policy spectrum.",
    trigger_conditions: [
      "Candidate is significantly outspent by the establishment opponent",
      "Volunteer base is larger or more motivated than the opponent's paid staff",
      "One issue dominates the dominant voter emotion identified in DISCOVER",
    ],
    platform_application:
      "Use when F2 shows an emotional dominant issue and F4 reveals volunteer depth exceeds paid staff — concentrate the narrative on one pillar and run it into the ground.",
    brief: {
      context:
        "Zohran Mamdani won the 2025 NYC Democratic mayoral primary against a field of better-funded establishment candidates by monopolising the affordability issue — rent, transit, groceries — and refusing to be drawn into the full policy spectrum.",
      the_lesson:
        "Outspent candidates cannot win on breadth — only on depth. Mamdani's volunteer army knocked more doors than the paid canvassers of any opponent, and every door-knock carried the same three-word message. One issue, repeated, by believers.",
      the_proof:
        "Mamdani was outspent by multiples yet won by double digits in a crowded primary field. Post-vote analysis showed his margins were strongest in neighbourhoods with the highest volunteer-to-voter ratios — depth compounded.",
      the_warning:
        "The single-issue monopoly only works if the issue is genuinely dominant in the voter's life. If DISCOVER shows multiple competing emotions, single-issue strategy becomes single-issue irrelevance.",
      malaysian_parallel:
        "MUDA's early Muar campaign in 2022 attempted the same logic — volunteer depth over media spend, youth issues as the monopoly — and the mechanics, though not the outcome, followed the Mamdani template.",
    },
    citation_line:
      "Mamdani 2025 · NYC Mayoral Primary · 2025 · Outspent candidates win by monopolising one issue with volunteer depth, not by spreading the message.",
  },
  {
    id: "syed-saddiq-2022",
    type: "campaign",
    name: "Syed Saddiq Muar Defence",
    source: "Malaysian GE15 Muar contest",
    year: 2022,
    origin: "Malaysia",
    framework_tags: ["F1", "F2", "F3", "F4", "F5"],
    core_insight:
      "A candidate under simultaneous legal and political attack defends successfully by making constituency service so visible that the attacks become background noise.",
    trigger_conditions: [
      "Candidate faces external attacks (legal, reputational) during a campaign",
      "Local constituency service can be demonstrated concretely",
      "The attack narrative is disconnected from voters' daily experience",
    ],
    platform_application:
      "Use when F5 reveals a vulnerability that is real but not local — the defence is not denial, it is substitution of voter experience for media narrative.",
    brief: {
      context:
        "In GE15, Syed Saddiq defended Muar while simultaneously facing a criminal trial and being abandoned by most national media narratives. He did not fight the attack on its own terms — he made Muar feel serviced in a way the attacks could not touch.",
      the_lesson:
        "When the attack is national and the vote is local, the defence is local service, not national rebuttal. Every repaired drain, every funded school bus, every visible constituency presence became a counter-argument that voters felt rather than read.",
      the_proof:
        "Syed Saddiq retained Muar in a year when his party MUDA won almost nothing else and his personal legal situation was at its most dangerous. The Muar margin held because his service network held.",
      the_warning:
        "Service-as-defence requires multi-year infrastructure. A candidate who tries to build constituency machinery only after an attack begins will be too late — voters can tell the difference between sustained service and panic service.",
      malaysian_parallel:
        "This IS the Malaysian precedent for defending under attack. It is the closest modern template for any Malaysian candidate facing reputational pressure during a campaign.",
    },
    citation_line:
      "Syed Saddiq 2022 · Muar · 2022 · When the attack is national and the vote is local, service is the strongest defence.",
  },
  {
    id: "khairy-2009",
    type: "campaign",
    name: "Khairy UMNO Youth Chief Contest",
    source: "UMNO Youth wing leadership contest",
    year: 2009,
    origin: "Malaysia",
    framework_tags: ["F1", "F2", "F3", "F4", "F5"],
    core_insight:
      "In a three-cornered internal contest, the winning candidate is the one who architects the vote split rather than tries to overcome it.",
    trigger_conditions: [
      "Three or more candidates contesting a delegate election",
      "One opponent is perceived as the frontrunner",
      "The candidate can shape the perception of the second-place opponent to split the frontrunner's base",
    ],
    platform_application:
      "Use when F1 shows a multi-cornered internal contest — the arithmetic is the strategy, and the strategy is to shape the distribution of the opposition vote.",
    brief: {
      context:
        "In 2009, Khairy Jamaluddin won the UMNO Youth Chief contest against Mukhriz Mahathir and Khir Toyo in a three-way race that every commentator said he could not win. He was the most attacked candidate in the field, and yet he finished first.",
      the_lesson:
        "Three-cornered contests are not won by being everyone's first choice — they are won by making sure the other two candidates split the vote you cannot win. Khairy's team did not try to consolidate — they ensured the anti-Khairy vote stayed divided.",
      the_proof:
        "Khairy won the Youth Chief position by a margin smaller than the vote for third place — which means a consolidation of the other two candidates would have beaten him. The split was the win.",
      the_warning:
        "Engineering a vote split is publicly deniable only if done entirely through faction brokers. Any fingerprint of manipulation becomes a delegate-level trust collapse in the next cycle.",
      malaysian_parallel:
        "This IS the Malaysian precedent for UMNO internal three-cornered contests. Every subsequent Youth Chief and division-level contest has been read through this template.",
    },
    citation_line:
      "Khairy 2009 · UMNO Youth Chief · 2009 · Three-cornered internal contests are won by architecting the vote split, not by overcoming it.",
  },
  {
    id: "sun-tzu",
    type: "tactician",
    name: "Sun Tzu — Art of War",
    source: "The Art of War",
    year: -500,
    origin: "China",
    framework_tags: ["F1", "F4"],
    core_insight:
      "Victory is decided before the battle — through terrain knowledge, force concentration, and refusing to fight on ground that does not favour you.",
    trigger_conditions: [
      "Campaign is spread thin across multiple fronts",
      "Ground intelligence is incomplete at the precinct or district level",
      "Candidate is tempted to contest every issue rather than concentrate",
    ],
    platform_application:
      "Use when F1 or F4 reveals forces spread too thin — Sun Tzu says concentrate on the decisive ground, refuse the rest.",
    brief: {
      context:
        "Sun Tzu's Art of War, written roughly 500 BC, remains the foundational text on asymmetric contest. Its principles have been adapted by every serious strategist — military, corporate, and political — for two and a half thousand years.",
      the_lesson:
        "Know the ground before you march. Concentrate force at the decisive point. Refuse battle on terrain that does not favour you. In political terms: map the constituency before spending, focus on the swing districts, and do not let opponents choose your battleground.",
      the_proof:
        "Every successful insurgent political campaign — from Obama 2008's precinct targeting to Mamdani's volunteer concentration — is a variation of Sun Tzu's concentration principle applied to modern electoral terrain.",
      the_warning:
        "Concentration requires discipline to ignore the rest. Campaigns that try to be strong everywhere end up strong nowhere. The hardest strategic act is choosing what not to contest.",
      malaysian_parallel:
        "PH's 2018 state-level concentration — choosing Johor, Selangor, and Penang as the decisive battlegrounds and not over-investing in hostile northern seats — is the clearest Malaysian application of Sun Tzu's concentration principle.",
    },
    citation_line:
      "Sun Tzu · The Art of War · c.500 BC · Concentrate force at the decisive point — refuse battle on ground that does not favour you.",
  },
  {
    id: "machiavelli",
    type: "scholar",
    name: "Niccolò Machiavelli",
    source: "The Prince",
    year: 1532,
    origin: "Italy",
    framework_tags: ["F2", "F5"],
    core_insight:
      "Appearance must be managed as rigorously as substance — voters judge what they see, and what they see is curated by the candidate or by the opponent.",
    trigger_conditions: [
      "Candidate has substance but weak public presentation",
      "Opponent is controlling the visual and symbolic narrative",
      "Perception gap is widening between reality and what voters perceive",
    ],
    platform_application:
      "Use when F2 or F5 reveals a mismatch between what the candidate is and what voters see — Machiavelli says close the gap deliberately, not accidentally.",
    brief: {
      context:
        "Machiavelli, writing in 1513 and published in 1532, produced in The Prince the first clear articulation of politics as a craft of appearance management. He argued that a prince must not only be virtuous but be seen to be virtuous — and that the seeing matters more.",
      the_lesson:
        "Substance without visible symbol is inert. Every policy, every act of service, every principled stand must be converted into a visible, repeatable symbol that voters can carry in their heads. The candidate who leaves appearance to chance is handing it to the opponent.",
      the_proof:
        "Every successful political brand in the modern era — from De Gaulle's silhouette to Obama's poster to Mahathir's glasses — is a Machiavellian construction: deliberate, rigorous, and designed for voter memory.",
      the_warning:
        "Appearance divorced from substance collapses the moment a crisis demands real action. Machiavelli was not advocating fakery — he was warning that substance without appearance gets you destroyed.",
      malaysian_parallel:
        "The 'Bossku' reinvention of Najib Razak is the textbook Malaysian application — visual, symbolic, repeatable, and entirely Machiavellian in its construction. Whether the substance matched the appearance is a separate question.",
    },
    citation_line:
      "Machiavelli · The Prince · 1532 · Appearance must be managed as rigorously as substance — voters judge what they see.",
  },
  {
    id: "alinsky",
    type: "tactician",
    name: "Saul Alinsky",
    source: "Rules for Radicals",
    year: 1971,
    origin: "United States",
    framework_tags: ["F3", "F4", "F5"],
    core_insight:
      "Power is not what you have — it is what the opponent thinks you have. An organised minority can project the power of a majority through disciplined visible action.",
    trigger_conditions: [
      "Candidate is the underdog in resources, incumbency, or media coverage",
      "Volunteer base is motivated but numerically smaller than the opposition",
      "Opponent is vulnerable to being forced outside its comfort zone",
    ],
    platform_application:
      "Use when F3 or F4 reveals the candidate as the resource-disadvantaged player — Alinsky says project power through discipline and visibility, not scale.",
    brief: {
      context:
        "Saul Alinsky's Rules for Radicals, published in 1971, remains the operational manual for underdog mobilisation. It shaped every grassroots campaign from the civil rights movement to Obama's early organising to contemporary European insurgent parties.",
      the_lesson:
        "A promise creates expectation and expectation creates leverage. An organised volunteer base, visible and disciplined, can force an opponent's media and response to shift — and every shift validates the underdog's frame.",
      the_proof:
        "Obama's 2008 field operation, Sanders' 2016 volunteer army, and Mamdani's 2025 door-knock machine all draw directly from Alinsky's operational playbook — the same rules, applied to new terrain.",
      the_warning:
        "Alinsky tactics generate backlash. A candidate who uses disruption as visibility must calculate whether the backlash is usable — Alinsky's own rule: the threat is usually more terrifying than the thing itself.",
      malaysian_parallel:
        "Bersih's mobilisation tactics — the yellow shirts, the rally choreography, the disciplined visible minority acting as if they were the majority — are a direct Malaysian application of Alinsky's power projection principle.",
    },
    citation_line:
      "Alinsky · Rules for Radicals · 1971 · Power is not what you have — it is what the opponent thinks you have.",
  },
  {
    id: "edelman",
    type: "scholar",
    name: "Murray Edelman",
    source: "The Symbolic Uses of Politics",
    year: 1964,
    origin: "United States",
    framework_tags: ["F2", "F5"],
    core_insight:
      "Voters respond to symbols, rituals, and emotional cues before they evaluate policy content. The candidate who enters the right emotional register first wins the perception battle.",
    trigger_conditions: [
      "Voter base is emotionally activated by an identifiable dominant feeling",
      "Policy detail is losing traction to symbolic framing",
      "A rival is establishing symbolic dominance of the campaign",
    ],
    platform_application:
      "Use when F2 DISCOVER reveals a dominant voter emotion — Edelman says the emotional register is the first battle, and policy is a secondary layer on top of it.",
    brief: {
      context:
        "Murray Edelman's The Symbolic Uses of Politics, published in 1964, overturned decades of rational-voter political science by demonstrating that symbols precede policy in voter cognition. The candidate who owns the symbol owns the outcome.",
      the_lesson:
        "Emotional register is chosen before policy is evaluated. Voters do not compare manifestos — they compare feelings, and then rationalise a policy preference consistent with the feeling. The candidate who strikes the right emotional key first locks in the rationalisation.",
      the_proof:
        "Every successful modern campaign — Reagan's 'Morning in America,' Obama's 'Hope,' Trump's 'Make America Great Again' — succeeded as symbolic registers first and policy platforms second. Edelman predicted this in 1964.",
      the_warning:
        "Symbolic dominance is unstable. A symbol that stops resonating with the lived experience of voters becomes a liability faster than a policy position does — the collapse is emotional and total.",
      malaysian_parallel:
        "'Reformasi' is the most durable Malaysian political symbol of the last three decades — it has outlasted governments, parties, and leaders because it operated at the Edelman layer, not the policy layer.",
    },
    citation_line:
      "Edelman · The Symbolic Uses of Politics · 1964 · Voters respond to symbols before policy — the candidate who enters the right emotional register first wins.",
  },
  {
    id: "lasswell",
    type: "scholar",
    name: "Harold Lasswell",
    source: "Psychopathology and Politics",
    year: 1930,
    origin: "United States",
    framework_tags: ["F1", "F2", "F5"],
    core_insight:
      "Political behaviour is driven by private motives displaced onto public objects and rationalised in the public interest. Symbol management precedes and shapes all political reality.",
    trigger_conditions: [
      "Voter anxiety is diffuse, emotional, and not tied to a clear policy cause",
      "Campaign messaging is failing to diagnose what voters are actually afraid of",
      "Symbolic confusion is letting the opponent define the emotional meaning of the race",
    ],
    platform_application:
      "Use when F1 and F2 reveal diffuse voter anxiety — Lasswell says diagnose the private motive beneath the stated concern before building the message.",
    brief: {
      context:
        "Harold Lasswell's Psychopathology and Politics, published in 1930, was the first systematic attempt to apply psychoanalytic frameworks to political behaviour. Lasswell argued that political actors — voters and candidates alike — displace private anxieties onto public symbols and call the result a political preference.",
      the_lesson:
        "What voters say they want is rarely what they actually want. Behind every stated policy demand is a private anxiety — about status, belonging, loss, or futures denied. The candidate who diagnoses the anxiety and offers symbolic resolution wins even when the policy response is modest.",
      the_proof:
        "Every populist wave of the last century — from 1930s European mass politics to 2010s right-populism to 2020s left-populism — succeeded by diagnosing anxieties the established parties had dismissed as irrational.",
      the_warning:
        "Anxiety diagnosis that becomes anxiety amplification without resolution becomes nihilism. Lasswell's framework was diagnostic, not exploitative — a candidate who only activates anxiety without offering symbolic closure creates a voter base that eventually turns on them.",
      malaysian_parallel:
        "Malay economic anxiety — the private fear of status loss, framed publicly as a policy argument about quotas and preferences — is the Lasswell case study of Malaysian politics. Every major shift since 1969 has been a displacement of that anxiety onto a new symbolic vehicle.",
    },
    citation_line:
      "Lasswell · Psychopathology and Politics · 1930 · Political behaviour is private motive displaced onto public symbol — diagnose the anxiety, not the stated demand.",
  },
  {
    id: "vo-key",
    type: "scholar",
    name: "V. O. Key Jr.",
    source: "The Responsible Electorate",
    year: 1966,
    origin: "United States",
    framework_tags: ["F1", "F5"],
    core_insight:
      "Voters are not fools — they respond to real performance and real risks. The campaign that inoculates against predictable attacks before they land holds its coalition intact through the final week.",
    trigger_conditions: [
      "Candidate has a known vulnerability that the opponent is expected to exploit",
      "Media cycle is long enough to allow proactive framing",
      "The vulnerability cannot be hidden, only reframed",
    ],
    platform_application:
      "Use when F5 MEASURE reveals a predictable attack vector — V. O. Key's inoculation principle says the candidate who acknowledges first controls the frame.",
    brief: {
      context:
        "V. O. Key Jr.'s The Responsible Electorate, published posthumously in 1966, rebutted decades of elite condescension by demonstrating that voters process risk and performance rationally when given clear information. His inoculation principle became the foundation of modern defensive campaign strategy.",
      the_lesson:
        "Voters punish surprise more than they punish weakness. A vulnerability acknowledged early and reframed becomes a signal of honesty; the same vulnerability revealed by an opponent becomes a signal of deceit. The arithmetic favours proactive disclosure.",
      the_proof:
        "Modern inoculation research — from the McGuire experiments onward — has repeatedly confirmed Key's intuition: voters exposed to a weakened version of an attack are significantly more resistant to the full-strength version when it arrives.",
      the_warning:
        "Inoculation works only if the reframe is credible. A pre-emptive disclosure paired with a weak or insincere counter-frame becomes worse than silence — it pre-validates the opponent's attack.",
      malaysian_parallel:
        "Anwar Ibrahim's repeated pre-emptive framing of the sodomy charges as political persecution, beginning in 1998 and maintained through every subsequent cycle, is the most sustained Malaysian application of the V. O. Key inoculation principle.",
    },
    citation_line:
      "V. O. Key Jr. · The Responsible Electorate · 1966 · Voters punish surprise more than weakness — inoculate against predictable attacks before they land.",
  },
  {
    id: "downs",
    type: "scholar",
    name: "Anthony Downs",
    source: "An Economic Theory of Democracy",
    year: 1957,
    origin: "United States",
    framework_tags: ["F1", "F3"],
    core_insight:
      "In multi-candidate contests, distinct positional territory matters more than ideological purity — candidates who crowd the same spatial position cannibalise each other's vote share.",
    trigger_conditions: [
      "Three or more candidates contesting the same seat",
      "Multiple candidates occupying similar ideological or demographic territory",
      "The winning number drops below 40% because of fragmentation",
    ],
    platform_application:
      "Use when F1 and F3 reveal a crowded contest — Downs says the candidate who occupies distinct spatial territory wins, not the one with the 'best' position.",
    brief: {
      context:
        "Anthony Downs's An Economic Theory of Democracy, published in 1957, formalised the spatial theory of voting — candidates positioned along an ideological or demographic axis, voters choosing the nearest candidate. His framework remains the foundation of modern multi-candidate contest analysis.",
      the_lesson:
        "In crowded fields, do not fight for the centre — fight for distinct territory. Two candidates in the same spatial position split that position's vote; a candidate with a clearly differentiated position captures their segment unopposed. The arithmetic rewards difference, not optimality.",
      the_proof:
        "Every three- and four-cornered Malaysian contest since 1990 has followed Downs's prediction: the candidate with the most distinct positioning wins even with a plurality smaller than the combined vote of the crowded position.",
      the_warning:
        "Distinct territory only wins if the territory contains enough voters. A candidate who differentiates into a space with no demand is unique and irrelevant at the same time.",
      malaysian_parallel:
        "PAS's consistent refusal to shift toward the political centre — despite decades of advice — is a textbook Downs play: own distinct territory, accept a ceiling, but never lose the floor.",
    },
    citation_line:
      "Downs · An Economic Theory of Democracy · 1957 · In multi-candidate contests, distinct positional territory beats ideological optimality.",
  },
  {
    id: "lees-marshment",
    type: "scholar",
    name: "Jennifer Lees-Marshment",
    source: "Political Marketing and British Political Parties",
    year: 2001,
    origin: "United Kingdom",
    framework_tags: ["ALL"],
    core_insight:
      "The market-oriented party listens to voter intelligence first and designs the product around it — the product-oriented party designs first and tries to persuade voters afterward. The first wins; the second loses.",
    trigger_conditions: [
      "Candidate or party is tempted to lead with preferred policy rather than voter demand",
      "Voter intelligence data is available but being ignored",
      "Campaign is optimising for internal coherence at the expense of voter resonance",
    ],
    platform_application:
      "Use across all five frameworks — Lees-Marshment is the meta-frame: the strategy must be built outward from voter intelligence, not inward from candidate preference.",
    brief: {
      context:
        "Jennifer Lees-Marshment's Political Marketing and British Political Parties, published in 2001, systematised the distinction between product-oriented, sales-oriented, and market-oriented political parties — and demonstrated that only the market-oriented model wins consistently in competitive multi-party systems.",
      the_lesson:
        "Voter intelligence precedes product design. A candidate who defines positions, promises, and narrative before understanding voter demand is running a product-oriented campaign in a market-oriented world — and will lose to the candidate who builds outward from diagnosed voter need.",
      the_proof:
        "Tony Blair's New Labour transformation between 1994 and 1997, built explicitly on voter intelligence rather than party preference, is Lees-Marshment's paradigmatic case. Every subsequent professionalised political party in the UK, Australia, and increasingly Malaysia has followed the market-oriented template.",
      the_warning:
        "Market-orientation without principle becomes opportunism. Lees-Marshment's framework required that the candidate deliver what was promised — market intelligence that only drives positioning, not delivery, produces short-term wins and long-term coalition collapse.",
      malaysian_parallel:
        "PH's 2018 Buku Harapan was an attempted market-oriented product — built from voter intelligence, delivered in written commitments. The subsequent governance failure to deliver is Lees-Marshment's warning made manifest: market orientation without delivery discipline is lethal.",
    },
    citation_line:
      "Lees-Marshment · Political Marketing and British Political Parties · 2001 · The market-oriented campaign listens first and designs the product around voter intelligence.",
  },
];

export function getEntry(id: string): IntelligenceEntry | undefined {
  return library.find((entry) => entry.id === id);
}

export function getEntriesByFramework(tag: FrameworkTag): IntelligenceEntry[] {
  if (tag === "ALL") return library.slice();
  return library.filter(
    (entry) =>
      entry.framework_tags.includes(tag) || entry.framework_tags.includes("ALL")
  );
}
