// Marketing skills (MK1-MK15), weighted to brand work.

import type { BankerSkill } from './types';
import { SKILLS_REVIEW_BY, SKILLS_VERIFIED_ON } from './meta';

const dates = { version: 1, verifiedOn: SKILLS_VERIFIED_ON, reviewBy: SKILLS_REVIEW_BY } as const;

export const MARKETING_SKILLS: readonly BankerSkill[] = [
  {
    id: 'MK1',
    slug: 'apply-our-brand-voice',
    name: 'Apply our brand voice',
    group: 'marketing',
    family: 'Role',
    apps: ['Word', 'Outlook', 'Chat'],
    useWhen: 'A draft from a vendor, a colleague or a template does not sound like your bank.',
    youGet: 'The same draft in your brand voice, every fact and disclosure intact, plus a list of what changed and why.',
    fields: [
      { key: 'draft', label: 'The draft to rewrite', example: 'Unlock the power of next-level banking! Our revolutionary new debit card rewards program is here and it is a total game-changer for your wallet...', kind: 'long', required: true },
      { key: 'voice_guide_path', label: 'Your brand voice guide', example: 'Marketing/Brand/Prairie State Bank Voice Guide v3.docx', kind: 'file', required: true },
    ],
    instructions: `ROLE
You are the brand writer at a community bank. You make copy sound like the bank without changing what it says.

CONTEXT
Draft:
"""
{{draft}}
"""
Brand voice guide: {{voice_guide_path}} (read the file before you write)

TASK
1. Read the voice guide. Note its voice words, the words it bans or prefers, what we call the people we serve (customers or members), how product names are written, and any rules on punctuation, contractions and capitalization.
2. Mark everything in the draft that must not change: rates, APYs, APRs, fees, dates, dollar amounts, product names, disclosures, legal lines and the official advertising statement (for example "Member FDIC" or "Federally insured by NCUA").
3. Rewrite the rest to match the guide: word choice, sentence length, person ("you" and "we"), level of formality.
4. Replace hype and banned words with plain, specific language the guide allows.
5. Keep the draft's purpose, call to action and channel. Keep it about the same length or shorter.

OUTPUT
Rewritten draft:
<the full rewritten text>

Voice notes:
- <one line per change that matters, naming the guide rule behind it>

Left exactly as written:
- <each rate, term, disclosure or legal line you did not touch>

RULES
- Do not invent facts, numbers, dates, benefits or names that are not in the draft or the guide.
- Never change disclosure text, rates, terms or the official advertising statement, even if they sound stiff.
- Do not add superlatives or promises ("best", "lowest", "guaranteed", "free") that the draft does not already support.
- No exclamation points unless the guide allows them.
- If the draft states a rate or other credit or deposit terms, add a final line: "Compliance must review this before it runs."

IF SOMETHING IS MISSING
If you cannot open the voice guide, or it has no voice words, stop and ask me for three to five voice words and one piece of copy we consider on-brand. If the draft contains a claim the guide or the draft gives you no basis for, keep it but flag it under Voice notes as "Needs support or removal".`,
    checks: [
      'Every rate, fee, date and disclosure matches the original draft word for word.',
      'The banned words in your voice guide are gone.',
      'Nothing new was promised or claimed.',
      'Compliance still reviews it if it mentions a product term.',
    ],
    neverPaste: 'Customer or member names, account details, or unreleased rate sheets.',
    example: {
      inputs: {
        draft: 'Unlock the power of next-level banking! Our revolutionary new debit card rewards program is here and it is a total game-changer for your wallet. Earn points on every swipe and redeem them for awesome stuff. Sign up today! Rewards terms apply. See prairiestatebank.example/rewards for details. Member FDIC.',
        voice_guide_path: 'Marketing/Brand/Prairie State Bank Voice Guide v3.docx',
      },
      output: `Rewritten draft:
Your Prairie State Bank debit card now earns rewards points. Use it for groceries, gas or a night out, and the points add up. Trade them in for gift cards and more.

Turn on rewards in online banking, or ask us at any branch.

Rewards terms apply. See prairiestatebank.example/rewards for details. Member FDIC.

Voice notes:
- Cut "unlock the power", "next-level", "revolutionary" and "game-changer". The guide bans hype words.
- Replaced "every swipe" with everyday examples. The guide prefers concrete over clever.
- "Awesome stuff" became "gift cards and more". The guide asks for specific rewards; check that gift cards are offered.
- Removed the exclamation points. The guide does not allow them.
- Changed "Sign up today" to the two ways to enroll, per the guide's rule that every call to action says how.

Left exactly as written:
- "Rewards terms apply. See prairiestatebank.example/rewards for details."
- "Member FDIC."`,
    },
    tests: [
      {
        name: 'Vendor hype',
        inputs: {
          draft: 'Say hello to the future of home equity! Our crazy-low rates will blow your mind. Tap into your home\'s value today with Prairie State Bank. Equal Housing Lender. Member FDIC.',
          voice_guide_path: 'Marketing/Brand/Prairie State Bank Voice Guide v3.docx',
        },
        rubric: [
          'Removes "crazy-low" and "blow your mind" without inventing a rate.',
          'Keeps "Equal Housing Lender" and "Member FDIC" exactly.',
          'Adds the line that compliance must review it.',
          'Uses no exclamation points.',
        ],
      },
      {
        name: 'No voice guide',
        inputs: {
          draft: 'Our new mobile app is live. Download it now and bank anywhere.',
          voice_guide_path: '',
        },
        rubric: [
          'Asks for voice words and an on-brand sample instead of guessing a voice.',
          'Does not invent app features.',
        ],
      },
    ],
    ...dates,
  },
  {
    id: 'MK2',
    slug: 'write-a-brand-style-card',
    name: 'Write a brand style card',
    group: 'marketing',
    family: 'Role',
    apps: ['Word', 'PowerPoint', 'Chat'],
    useWhen: 'Staff, branches or vendors keep using the logo, colors or tone a little wrong.',
    youGet: 'One page: logo use, colors with their codes, fonts, voice words, and the mistakes to avoid.',
    fields: [
      { key: 'brand_assets_path', label: 'Your brand files or guide', example: 'Marketing/Brand/Prairie State Bank Brand Guide 2025.pdf and the /Logos folder', kind: 'file', required: true },
      { key: 'brand_colors', label: 'Brand colors and codes', example: 'Prairie Green #2E5E3A, Wheat #E8D9A8, Slate #3B4650, White #FFFFFF', kind: 'text', required: true },
      { key: 'fonts', label: 'Fonts', example: 'Headlines: Merriweather Bold. Body: Source Sans 3. Office fallback: Georgia and Arial.', kind: 'text', required: true },
      { key: 'voice_words', label: 'Voice words', example: 'Plain, neighborly, steady. Never: cheap, hip, pushy.', kind: 'text', required: true },
    ],
    instructions: `ROLE
You are the marketing lead at a community bank, writing the one-page brand card that sits next to every staff member's keyboard and goes to every vendor.

CONTEXT
Brand files: {{brand_assets_path}} (read them)
Colors and codes: {{brand_colors}}
Fonts: {{fonts}}
Voice words: {{voice_words}}

TASK
1. Read the brand files. Pull out the logo versions, when to use each, clear space and minimum size rules, and what never to do with the logo. Use only rules the files state.
2. List each color with its name, its job (headline, background, accent) and the codes exactly as given. If the files give other codes (CMYK, Pantone), include those exactly too.
3. List the fonts for print and web, and the fallback for Word and PowerPoint.
4. Turn each voice word into a short "Sounds like / Not like" pair using bank examples.
5. Add the always-include reminders: the official advertising statement where our policy requires it, and the Equal Housing logo or wording on housing-related credit ads, both as compliance directs.
6. List the five most likely mistakes a busy employee or vendor would make.

OUTPUT
A single page with these headings in order: Logo, Colors (a table: name, use, codes), Type, Voice (a table: word, sounds like, not like), Always and never, Who to ask. Fit it on one printed page.

RULES
- Do not invent a color code, a font, a size, a measurement or a rule that is not in what I gave you.
- If the files and my fields disagree, show both and flag the conflict. Do not pick one.
- Do not state when the official advertising statement is or is not required. Say "per compliance".
- Plain words. No design jargon without a short explanation.

IF SOMETHING IS MISSING
If the files have no logo rules, write "Logo rules: not in the files provided" and ask me who owns the logo. If a color has no code, list it as "code needed" and ask. If I gave no fallback fonts, ask what staff should use in Word and PowerPoint.`,
    checks: [
      'Every color code matches your brand guide exactly.',
      'Logo rules come from your files, not from general advice.',
      'The "Who to ask" line names a real person or inbox.',
      'Compliance has seen the always-include reminders.',
    ],
    neverPaste: 'Vendor contracts, licensing keys for fonts, or anything marked confidential.',
    example: {
      inputs: {
        brand_assets_path: 'Marketing/Brand/Prairie State Bank Brand Guide 2025.pdf and the /Logos folder',
        brand_colors: 'Prairie Green #2E5E3A, Wheat #E8D9A8, Slate #3B4650, White #FFFFFF',
        fonts: 'Headlines: Merriweather Bold. Body: Source Sans 3. Office fallback: Georgia and Arial.',
        voice_words: 'Plain, neighborly, steady. Never: cheap, hip, pushy.',
      },
      output: `PRAIRIE STATE BANK: BRAND CARD

Logo
- Full-color logo on white or Wheat. White logo on Prairie Green or photos.
- Keep clear space equal to the height of the "P" on all sides (Brand Guide, p. 4).
- Never stretch, recolor, add a shadow or put it on a busy photo.

Colors
| Name | Use | Codes |
| Prairie Green | Headlines, buttons, logo | #2E5E3A |
| Wheat | Backgrounds, callouts | #E8D9A8 |
| Slate | Body text | #3B4650 |
| White | Backgrounds | #FFFFFF |

Type
Headlines: Merriweather Bold. Body: Source Sans 3. In Word and PowerPoint: Georgia for headlines, Arial for body.

Voice
| Word | Sounds like | Not like |
| Plain | "Your card works at any ATM in town." | "Enjoy seamless access." |
| Neighborly | "Stop by. We'll sort it out together." | "Visit a branch location." |
| Steady | "Rates change. Here's today's." | "Don't miss out!" |

Always and never
- Always: the official advertising statement and the Equal Housing logo where compliance requires them.
- Never: exclamation points, "cheap", "hip", clip art.

Who to ask
Brand questions: Dana Ruiz, Marketing. Ad review: Compliance inbox.

Flag: the guide lists Wheat as #E9D9A6; your field says #E8D9A8. Confirm which is correct.`,
    },
    tests: [
      {
        name: 'Normal card',
        inputs: {
          brand_assets_path: 'Brand/Lakeview Community CU Guide.pdf',
          brand_colors: 'Lake Blue #1F4E79, Sand #F2E6D0',
          fonts: 'Lato for everything; Calibri in Office',
          voice_words: 'Helpful, honest, local',
        },
        rubric: [
          'Uses the color codes exactly as given.',
          'Has Logo, Colors, Type, Voice, Always and never, and Who to ask sections in order.',
          'Gives a sounds-like and not-like example for each voice word.',
        ],
      },
      {
        name: 'Missing codes and logo rules',
        inputs: {
          brand_assets_path: '',
          brand_colors: 'Navy and a gold accent',
          fonts: 'Whatever is in Word',
          voice_words: 'Friendly',
        },
        rubric: [
          'Marks the color codes as needed instead of inventing hex values.',
          'Says logo rules are not provided and asks who owns the logo.',
          'Does not invent a font name.',
        ],
      },
    ],
    ...dates,
  },
  {
    id: 'MK3',
    slug: 'write-a-campaign-brief',
    name: 'Write a campaign brief',
    group: 'marketing',
    family: 'Role',
    apps: ['Word', 'Chat'],
    useWhen: 'You have a product to push and need one page that lines up leadership, compliance and your designer.',
    youGet: 'A campaign brief: audience, goal, one message, channels, budget split, timeline, review steps and open questions.',
    fields: [
      { key: 'product', label: 'Product or offer', example: 'New Prairie Small Business Checking, launching February 2', kind: 'text', required: true },
      { key: 'audience', label: 'Who it is for', example: 'Sole proprietors and small shops in Dallas and Polk counties who bank elsewhere or use a personal account for business', kind: 'long', required: true },
      { key: 'goal', label: 'What success looks like', example: 'Open 60 new small business checking accounts by March 31', kind: 'text', required: true },
      { key: 'budget', label: 'Budget', example: '$8,500 for paid media and print', kind: 'text', required: false },
    ],
    instructions: `ROLE
You are the marketing manager at a community bank, often a team of one or two. You write campaign briefs that a CEO can approve in five minutes.

CONTEXT
Product or offer: {{product}}
Audience:
"""
{{audience}}
"""
Goal: {{goal}}
Budget: {{budget}} (if blank, write "Budget: to be set" and plan channels without dollar amounts)

TASK
1. Restate the goal exactly as given. If it is not measurable, propose a measurable version and label it "Proposed".
2. Describe the audience by need, situation and place. Name what they care about and what might stop them from switching.
3. Write one key message in one sentence, and up to three reasons to believe, using only facts in the product description.
4. Recommend three to five channels a small bank team can actually run. For each, say why it fits this audience.
5. If there is a budget, split it across channels in dollars that add up to the total.
6. Lay out a simple timeline: draft, compliance review, launch, check-in, wrap-up.
7. List the review steps: compliance review of every ad; Regulation DD (Truth in Savings) for deposit ads, or Regulation Z for credit ads; UDAAP; the official advertising statement.

OUTPUT
Campaign brief: <product>
Goal | Audience | Key message | Reasons to believe | Channels (table: channel, why, dollars) | Timeline | Review steps | How we will measure | Open questions

RULES
- Do not invent facts, rates, features, dates, results or response rates that are not in what I gave you. No industry benchmarks.
- For any credit product, do not define or exclude an audience by a protected characteristic (race, color, religion, national origin, sex, marital status, age and others) or by neighborhoods in a way that tracks them. Flag any targeting choice for compliance.
- Keep it to one page.

IF SOMETHING IS MISSING
If the product has no clear features or launch date, ask before writing the message. If the goal has no number or date, propose one and mark it "Proposed, needs approval".`,
    checks: [
      'The goal is the one leadership actually agreed to.',
      'Every reason to believe is true of the product today.',
      'Channel dollars add up to your budget.',
      'Targeting has been reviewed for fair lending if it is a credit product.',
    ],
    neverPaste: 'Customer lists, account data, or prospect names and addresses.',
    example: {
      inputs: {
        product: 'New Prairie Small Business Checking, launching February 2. No monthly fee with $2,500 average balance; free mobile deposit; local business banker assigned.',
        audience: 'Sole proprietors and small shops in Dallas and Polk counties who bank elsewhere or run business through a personal account.',
        goal: 'Open 60 new small business checking accounts by March 31',
        budget: '$8,500 for paid media and print',
      },
      output: `Campaign brief: Prairie Small Business Checking

Goal: Open 60 new small business checking accounts by March 31.

Audience: Sole proprietors and small shop owners in Dallas and Polk counties. Many run the business through a personal account and know it is messy at tax time. What stops them: the hassle of switching and fear of fees.

Key message: A business account with a banker who knows your name, and no monthly fee when you keep $2,500 on average.

Reasons to believe:
- A local business banker is assigned to every account.
- Mobile deposit is included.
- No monthly fee with a $2,500 average balance.

Channels
| Channel | Why | Dollars |
| Chamber newsletter ad | Reaches owners where they read local news | $1,500 |
| Facebook and Instagram, two-county area | Owners scroll in the evening | $3,000 |
| Direct mail to commercial addresses | Tangible, local | $3,000 |
| Lobby and teller mention | Free, reaches owners banking personally with us | $0 |
| Local radio sponsorship | Familiar voice | $1,000 |
Total: $8,500

Timeline: Drafts Jan 5; compliance review Jan 12-16; launch Feb 2; check-in Feb 27; wrap-up April 7.

Review steps: Compliance reviews every ad. Regulation DD applies to the fee and balance terms. UDAAP review of "no monthly fee" wording. Official advertising statement per policy.

How we will measure: New accounts opened by March 31, by source code.

Open questions: Who is the business banker contact on the ads? Is there an opening deposit minimum?`,
    },
    tests: [
      {
        name: 'Deposit campaign',
        inputs: {
          product: 'Holiday Club savings account, opens October 1',
          audience: 'Existing checking customers with young families',
          goal: 'Open 150 holiday club accounts by November 15',
          budget: '$2,000',
        },
        rubric: [
          'Restates the goal exactly.',
          'Channel dollars add up to $2,000.',
          'Names Regulation DD and compliance review.',
          'Invents no rate or feature.',
        ],
      },
      {
        name: 'Fuzzy goal and targeting trap',
        inputs: {
          product: 'Used auto loans',
          audience: 'Young people, but not the east side of town',
          goal: 'More auto loans',
        },
        rubric: [
          'Proposes a measurable goal and labels it as proposed.',
          'Flags excluding the east side and targeting by age as fair lending concerns for compliance.',
          'Writes "Budget: to be set" instead of inventing a budget.',
        ],
      },
    ],
    ...dates,
  },
  {
    id: 'MK4',
    slug: 'draft-three-ad-variations',
    name: 'Draft three ad variations',
    group: 'marketing',
    family: 'Role',
    apps: ['Chat', 'Word'],
    useWhen: 'You need ad copy for one offer and want real choices, not three versions of the same line.',
    youGet: 'Three ads on one offer, each from a different angle, with headline, body, call to action and review flags.',
    fields: [
      { key: 'product', label: 'Product', example: 'Prairie State Bank home equity line of credit', kind: 'text', required: true },
      { key: 'channel', label: 'Where it runs', example: 'Facebook and Instagram feed', kind: 'choice', options: ['Facebook and Instagram feed', 'Search ad', 'Newspaper print', 'Radio (30 seconds)', 'Billboard', 'Lobby screen or poster'], required: true },
      { key: 'offer', label: 'The offer, exactly as approved', example: 'No closing costs on lines opened by December 31. Conditions apply; see approved disclosure.', kind: 'long', required: true },
      { key: 'audience', label: 'Who you want to reach', example: 'Homeowners in Ames planning a kitchen or roof project', kind: 'text', required: false },
    ],
    instructions: `ROLE
You are the copywriter for a community bank's small marketing team. You write honest ads that people in town actually notice.

CONTEXT
Product: {{product}}
Channel: {{channel}}
Offer, exactly as approved:
"""
{{offer}}
"""
Audience: {{audience}} (if blank, write for current customers and neighbors in our market)

TASK
1. Pull out the facts of the offer: what it is, any deadline, any condition. These are the only facts you may use.
2. Write three ads, each from a different angle:
   A. Practical: what you get and how to get it.
   B. Local and personal: the people, the town, the banker who answers the phone.
   C. Problem first: the project or worry the product helps with.
3. Fit each ad to the channel. A search ad is short and literal. A radio spot is read aloud in about 30 seconds. A billboard is a few words. A feed post has a short headline and a few lines.
4. Give each ad one clear call to action.
5. Check each ad for words that could trigger extra disclosure rules (a rate, a payment amount, a number of payments, a down payment, a bonus, "free") and flag them.

OUTPUT
For each of A, B and C:
Angle: <name>
Headline:
Body:
Call to action:
Disclosure placeholder: [Approved disclosure per compliance]
Review flags: <trigger terms or claims compliance must check, or "none found">

Then one line: which ad you would test first and why.

RULES
- Do not invent rates, payments, terms, deadlines or features that are not in the offer. Rates and terms are fields, never guesses.
- No superlatives or comparisons ("best", "lowest", "beats the big banks") unless the offer includes proof compliance has approved.
- Do not use "free" unless the offer says it and the product has no fee that could apply.
- Credit ads that state a rate must state it as an APR; a payment or term triggers more disclosures under Regulation Z. Deposit ads that state a rate must use APY under Regulation DD. Flag either; do not write the disclosures yourself.
- Compliance reviews every ad before it runs.

IF SOMETHING IS MISSING
If the offer is vague ("great rates"), ask me for the approved offer wording. If I ask for a claim you cannot support, write the ads without it and explain why in one line.`,
    checks: [
      'Every fact in each ad is in the approved offer.',
      'The three angles are actually different.',
      'Flagged trigger terms go to compliance with the ad.',
      'The call to action matches how people really apply.',
    ],
    neverPaste: 'Customer names, testimonials without signed permission, or unapproved rates.',
    example: {
      inputs: {
        product: 'Prairie State Bank home equity line of credit',
        channel: 'Facebook and Instagram feed',
        offer: 'No closing costs on lines opened by December 31. Conditions apply; see approved disclosure.',
        audience: 'Homeowners in Ames planning a kitchen or roof project',
      },
      output: `A. Practical
Headline: Open a home equity line with no closing costs
Body: Open your line by December 31 and we cover the closing costs. Draw what you need, when you need it.
Call to action: Start your application at a branch or online.
Disclosure placeholder: [Approved disclosure per compliance]
Review flags: "no closing costs" must match the approved conditions.

B. Local and personal
Headline: Your roof. Your banker. Right here in Ames.
Body: Talk to a lender who lives down the road. Open a home equity line by December 31 with no closing costs.
Call to action: Call Prairie State Bank and ask for a lender.
Disclosure placeholder: [Approved disclosure per compliance]
Review flags: "no closing costs". Equal Housing Lender logo per policy.

C. Problem first
Headline: The kitchen won't wait forever.
Body: A home equity line lets you pay for the project as it happens. No closing costs on lines opened by December 31.
Call to action: See if a line fits your project.
Disclosure placeholder: [Approved disclosure per compliance]
Review flags: "no closing costs".

Test B first: the local banker angle is the one other lenders in your market cannot copy.`,
    },
    tests: [
      {
        name: 'Search ad, deposit offer',
        inputs: {
          product: 'Prairie Kids Savings',
          channel: 'Search ad',
          offer: 'Open a Kids Savings account with $10 and get a piggy bank. While supplies last.',
        },
        rubric: [
          'Writes three different angles.',
          'Keeps search ads short and literal.',
          'Flags the piggy bank as a possible bonus for compliance review.',
        ],
      },
      {
        name: 'Best rate trap',
        inputs: {
          product: '12-month CD',
          channel: 'Newspaper print',
          offer: 'Say we have the best CD rate in town. Rate is great this month.',
        },
        rubric: [
          'Does not claim "best rate in town" and explains it needs support compliance has approved.',
          'Does not invent a rate or an APY.',
          'Asks for the approved offer wording.',
        ],
      },
    ],
    ...dates,
  },
  {
    id: 'MK5',
    slug: 'write-a-rate-promo',
    name: 'Write a rate promo',
    group: 'marketing',
    family: 'Role',
    apps: ['Word', 'Chat'],
    useWhen: 'Treasury set a promotional rate and you need copy with the rate, terms and disclosures in the right places.',
    youGet: 'Promo copy with the APY stated correctly, terms placed near the rate, disclosures intact, and a placement map for compliance.',
    fields: [
      { key: 'product', label: 'Product', example: '9-month CD special', kind: 'text', required: true },
      { key: 'rate', label: 'Rate, exactly as approved', example: '4.10% APY (interest rate 4.02%), accurate as of November 1', kind: 'text', required: true },
      { key: 'terms', label: 'Terms', example: 'Minimum opening deposit $1,000. Penalty for early withdrawal. Offer ends November 30. New money only.', kind: 'long', required: true },
      { key: 'disclosures', label: 'Approved disclosure text', example: 'APY accurate as of 11/1. Minimum deposit of $1,000 to open and earn the APY. A penalty may be imposed for early withdrawal. Fees could reduce earnings. Offer may be withdrawn at any time.', kind: 'long', required: true },
      { key: 'channel', label: 'Where it runs', example: 'Lobby poster and website banner', kind: 'text', required: false },
    ],
    instructions: `ROLE
You are the marketing writer at a community bank or credit union. You write deposit rate promotions that are clear to customers and easy for compliance to approve.

CONTEXT
Product: {{product}}
Rate, exactly as approved: {{rate}}
Terms:
"""
{{terms}}
"""
Approved disclosure text:
"""
{{disclosures}}
"""
Channel: {{channel}} (if blank, write for a lobby poster and a website banner)

TASK
1. Confirm the rate is stated as an annual percentage yield (APY). Regulation DD (Truth in Savings; for credit unions, NCUA's Truth in Savings rule) requires that an advertised rate of return be stated as the APY. An interest rate or dividend rate may appear only alongside the APY and never more prominently.
2. Write a headline and a short body that state the product, the APY and the main condition.
3. Put the key terms close to the rate. When an ad states an APY, Regulation DD calls for related information, such as the period the APY is offered or the date it was accurate, the minimum balance to earn it, the minimum to open, that fees could reduce earnings, and for CDs the term and that an early withdrawal penalty may apply. Use only what is in my terms and disclosures.
4. Copy the disclosure text word for word into a disclosure block.
5. Add a place for the official advertising statement ("Member FDIC" or "Federally insured by NCUA") per our policy.
6. Build a placement map so compliance can see where every required item sits.

OUTPUT
Headline:
Body:
Terms near the rate:
Disclosure block: <verbatim>
Official advertising statement: [per policy]
Placement map (table: item | where it appears | source line in my inputs)
For compliance: <anything unclear, missing or worth a second look>

RULES
- Never invent, round, recalculate or convert a rate. Do not calculate an APY from an interest rate.
- Do not invent facts, terms, dates or conditions that are not in what I gave you.
- Never call the interest rate more prominent than the APY: not bigger, not bolder, not first.
- No "best rate in town", "guaranteed", or comparisons to other banks.
- Do not use "free" or "profit" in a deposit ad.
- Some media have different rules. Compliance decides; say so.

IF SOMETHING IS MISSING
If the rate is not stated as an APY, stop and ask me for the approved APY. If there is no "as of" date or offer period, no minimum balance, or (for a CD) no term or penalty statement, list it under "For compliance" and ask before finalizing.`,
    checks: [
      'The APY matches the approved rate sheet digit for digit.',
      'The interest rate is never larger or earlier than the APY.',
      'The disclosure block is word for word.',
      'Compliance signs off before it prints or posts.',
    ],
    neverPaste: 'Unapproved rates, internal pricing models, or customer account data.',
    example: {
      inputs: {
        product: '9-month CD special',
        rate: '4.10% APY (interest rate 4.02%), accurate as of November 1',
        terms: 'Minimum opening deposit $1,000. Penalty for early withdrawal. Offer ends November 30. New money only.',
        disclosures: 'APY accurate as of 11/1. Minimum deposit of $1,000 to open and earn the APY. A penalty may be imposed for early withdrawal. Fees could reduce earnings. Offer may be withdrawn at any time.',
        channel: 'Lobby poster and website banner',
      },
      output: `Headline: 9-month CD: 4.10% APY

Body: Lock in a 9-month rate on new money through November 30. Open it at any Prairie State Bank branch with $1,000 or more.

Terms near the rate: 4.10% annual percentage yield (APY), accurate as of November 1. Interest rate 4.02%. 9-month term. $1,000 minimum to open and earn the APY. New money only. Offer ends November 30.

Disclosure block: APY accurate as of 11/1. Minimum deposit of $1,000 to open and earn the APY. A penalty may be imposed for early withdrawal. Fees could reduce earnings. Offer may be withdrawn at any time.

Official advertising statement: [Member FDIC, per policy]

Placement map
| Item | Where | Source |
| APY | Headline and terms line | Rate field |
| Interest rate | Terms line, after APY, same size | Rate field |
| Term | Headline and terms line | Product field |
| Minimum to open and earn APY | Body and terms line | Terms and disclosure |
| Early withdrawal penalty | Disclosure block | Disclosure |
| Fees could reduce earnings | Disclosure block | Disclosure |
| As-of date | Terms line | Rate field |

For compliance: "New money only" is not defined. Does the banner have room for the full terms line, or will it link to them?`,
    },
    tests: [
      {
        name: 'Clean CD promo',
        inputs: {
          product: '13-month CD',
          rate: '3.85% APY, accurate as of March 3',
          terms: '$500 minimum to open. Early withdrawal penalty applies. Ends March 31.',
          disclosures: 'APY accurate as of 3/3. $500 minimum to open and earn APY. Penalty may be imposed for early withdrawal. Fees could reduce earnings.',
        },
        rubric: [
          'States the rate as 3.85% APY exactly.',
          'Copies the disclosure text word for word.',
          'Includes a placement map.',
          'Leaves a placeholder for the official advertising statement.',
        ],
      },
      {
        name: 'Rate with no APY',
        inputs: {
          product: 'Money market special',
          rate: '4.25% interest rate',
          terms: 'Tiered. Rate may change.',
          disclosures: '',
        },
        rubric: [
          'Stops and asks for the approved APY instead of calculating or inventing one.',
          'Does not present 4.25% as an APY.',
          'Lists the missing disclosures for compliance.',
        ],
      },
      {
        name: 'Best rate request',
        inputs: {
          product: '6-month CD',
          rate: '4.00% APY as of June 1',
          terms: '$1,000 minimum. Ends June 30. Tell people it is the best rate in town.',
          disclosures: 'APY accurate as of 6/1. $1,000 minimum to open and earn APY. Penalty for early withdrawal. Fees could reduce earnings.',
        },
        rubric: [
          'Does not use "best rate in town".',
          'Explains in one line that the claim needs approved support.',
        ],
      },
    ],
    ...dates,
  },
  {
    id: 'MK6',
    slug: 'check-disclosures-before-review',
    name: 'Check disclosures before review',
    group: 'marketing',
    family: 'Role',
    apps: ['Word', 'Chat'],
    useWhen: 'An ad is ready and you want to catch missing or misplaced disclosures before compliance sees it.',
    youGet: 'A list of missing, misplaced or risky items, each with the rule behind it and a suggested fix.',
    fields: [
      { key: 'ad', label: 'The ad copy', example: 'Earn 4.02% on our new 12-month CD! Open today with just $500. Prairie State Bank.', kind: 'long', required: true },
      { key: 'product_type', label: 'Type of product', example: 'Deposit account', kind: 'choice', options: ['Deposit account', 'Consumer credit', 'Mortgage or home equity', 'Investment or insurance', 'Brand only, no product terms'], required: true },
      { key: 'channel', label: 'Where it runs', example: 'Newspaper print', kind: 'text', required: false },
    ],
    instructions: `ROLE
You are a careful marketing coordinator at a community bank who pre-checks ads before they go to compliance. You are not compliance, and you say so.

CONTEXT
Ad:
"""
{{ad}}
"""
Product type: {{product_type}}
Channel: {{channel}} (if blank, treat it as print or web)

TASK
1. Read the ad and list every rate, number, fee, condition and claim in it.
2. Check the items that apply to the product type:
   - Deposit account (Regulation DD, or NCUA's Truth in Savings rule for credit unions): any rate is stated as an annual percentage yield; an interest rate appears only with the APY and not more prominently; when an APY is stated, the related information is present (such as the as-of date or offer period, minimum balance to earn it, minimum to open, that fees could reduce earnings, and term and early withdrawal penalty for time accounts); bonus terms are explained; "free" is not used if a fee could apply; "profit" is not used for interest.
   - Consumer credit, mortgage or home equity (Regulation Z): any rate is stated as an APR; trigger terms (a payment amount, number of payments or repayment period, down payment, or finance charge) bring in the additional disclosures; "fixed" is used accurately; the Equal Housing logo or wording appears on housing-related ads per policy.
   - Investment or insurance: deposit insurance is not implied; the not-insured, not-guaranteed, may-lose-value statements per policy are present.
   - Every ad: the official advertising statement where our policy requires it, and not placed so it implies coverage of a non-deposit product; no claim that is unsupported, misleading or contradicted by fine print (UDAAP); offer dates are clear.
3. For each problem, say where it is, which rule it touches, and a suggested fix that does not invent terms.

OUTPUT
Issues (table: # | what | where in the ad | rule | suggested fix | priority: Fix before review / Ask compliance)
Present and well placed: <list>
Questions for compliance: <list>
Last line: "This is a pre-check. Compliance approval is still required."

RULES
- Do not invent rates, terms, dates or disclosure wording. Point to "approved disclosure text" instead of writing it.
- Do not state numeric thresholds, type-size rules or deadlines. If a rule depends on one, say "confirm with compliance".
- Do not say an ad is compliant or approved.

IF SOMETHING IS MISSING
If the product type does not match the ad (a CD ad marked "Brand only"), say so and check it as the product it describes. If the ad is an image description without the actual text, ask for the exact words.`,
    checks: [
      'Every flagged item really appears in the ad.',
      'Fixes point to approved disclosure text, not new wording.',
      'You still send the ad to compliance.',
    ],
    neverPaste: 'Customer data, exam findings, or internal compliance memos.',
    example: {
      inputs: {
        ad: 'Earn 4.02% on our new 12-month CD! Open today with just $500. Free online banking. Prairie State Bank.',
        product_type: 'Deposit account',
        channel: 'Newspaper print',
      },
      output: `Issues
| # | What | Where | Rule | Suggested fix | Priority |
| 1 | Rate shown is not stated as an APY | Headline | Regulation DD | Replace with the approved APY from the rate sheet; show the interest rate only beside it, not larger | Fix before review |
| 2 | No as-of date or offer period | Whole ad | Regulation DD | Add the approved as-of date or offer end date | Fix before review |
| 3 | No early withdrawal penalty statement | Whole ad | Regulation DD (time account) | Add the approved penalty line | Fix before review |
| 4 | "Just $500" reads as the minimum to open; unclear if it is also the minimum to earn the APY | Body | Regulation DD | Use the approved minimum-balance wording | Fix before review |
| 5 | No "fees could reduce earnings" line | Whole ad | Regulation DD | Add from approved disclosure text | Ask compliance |
| 6 | "Free online banking" | Body | Regulation DD and UDAAP | Confirm no fee applies; otherwise remove "free" | Ask compliance |
| 7 | No official advertising statement | Footer | FDIC rules | Add "Member FDIC" per policy | Ask compliance |
| 8 | Exclamation point | Headline | House style | Remove | Fix before review |

Present and well placed: Product and term are clear. Bank name is present.

Questions for compliance: Does the print size we plan meet our standard for the disclosure block?

This is a pre-check. Compliance approval is still required.`,
    },
    tests: [
      {
        name: 'Auto loan with trigger term',
        inputs: {
          ad: 'New truck? Payments as low as $389 a month at Prairie State Bank. Apply today.',
          product_type: 'Consumer credit',
        },
        rubric: [
          'Flags the payment amount as a Regulation Z trigger term needing additional disclosures.',
          'Notes no APR is stated.',
          'Does not invent an APR or term.',
          'Ends by saying compliance approval is still required.',
        ],
      },
      {
        name: 'Investment ad implying insurance',
        inputs: {
          ad: 'Grow your retirement safely with Prairie Investments. Member FDIC.',
          product_type: 'Investment or insurance',
        },
        rubric: [
          'Flags "Member FDIC" placement as possibly implying deposit insurance on an investment product.',
          'Flags "safely" as a possible misleading claim.',
          'Notes the not-insured, may-lose-value statements are missing, per policy.',
        ],
      },
    ],
    ...dates,
  },
  {
    id: 'MK7',
    slug: 'turn-specs-into-member-language',
    name: 'Turn specs into member language',
    group: 'marketing',
    family: 'Role',
    apps: ['Word', 'Chat'],
    useWhen: 'Product or operations hands you a spec sheet and you need to explain it to customers or members.',
    youGet: 'Each feature in plain words, with every number kept exact and a list of questions the spec did not answer.',
    fields: [
      { key: 'spec_sheet', label: 'The spec sheet', example: 'Product: eStatement Checking. Min open: $50. MSC: $6/mo, waived w/ eStmt enrollment + 1 DD/cycle. ATM: 4 non-network refunds/cycle...', kind: 'long', required: true },
      { key: 'reading_level', label: 'Reading level', example: 'Everyday plain language', kind: 'choice', options: ['Everyday plain language', 'General adult', 'Business owners'], required: false },
    ],
    instructions: `ROLE
You are a marketing writer at a community bank or credit union. You turn internal product specs into words a customer understands on first read.

CONTEXT
Spec sheet:
"""
{{spec_sheet}}
"""
Reading level: {{reading_level}} (if blank, use everyday plain language)

TASK
1. List every feature, fee, limit, condition and exception in the spec.
2. Expand every abbreviation and internal term (MSC, DD, cycle, NSF, non-network). If you are not sure what one means, do not guess; list it as a question.
3. For each line, write what it means for the customer, starting with "you". Keep the number exactly as in the spec.
4. Keep conditions attached to the benefit they limit ("no monthly fee when you ...", not "no monthly fee" with the condition elsewhere).
5. Write a short plain summary of the product: who it fits and what to watch for.

OUTPUT
Feature table: Spec line | In plain words | Number kept exactly (yes/no)
Plain summary: <three to five sentences>
Questions I could not answer from the spec: <list>

RULES
- Do not invent features, fees, limits, rates or dates that are not in the spec.
- Never soften a fee or a limit, and never drop a condition. "May" stays "may"; "up to" stays "up to".
- If the spec includes a rate, keep it exactly as written and note that any advertised rate must be stated as an APY for deposits or an APR for credit, and compliance reviews it.
- Use "member" for a credit union and "customer" for a bank, as the spec does.
- Short sentences. No jargon without a plain explanation.

IF SOMETHING IS MISSING
If an abbreviation or term is unclear, ask what it means instead of explaining it. If a fee has no amount, write "amount not in spec" and ask.`,
    checks: [
      'Every number matches the spec exactly.',
      'Every condition sits next to the benefit it limits.',
      'Product or operations confirms the open questions.',
    ],
    neverPaste: 'Internal pricing models, profitability notes, or customer data.',
    example: {
      inputs: {
        spec_sheet: 'Product: eStatement Checking. Min open: $50. MSC: $6/mo, waived w/ eStmt enrollment + 1 DD/cycle. ATM: 4 non-network refunds/cycle. Paper stmt fee: $3. OD: per Courtesy Pay policy.',
        reading_level: 'Everyday plain language',
      },
      output: `Feature table
| Spec line | In plain words | Number kept exactly |
| Min open: $50 | You need $50 to open the account. | Yes |
| MSC: $6/mo, waived w/ eStmt enrollment + 1 DD/cycle | There is a $6 monthly service charge. You won't pay it in any statement cycle where you get e-statements and have at least one direct deposit. | Yes |
| ATM: 4 non-network refunds/cycle | We refund fees for up to 4 uses of ATMs outside our network each statement cycle. | Yes |
| Paper stmt fee: $3 | Paper statements cost $3. | Yes |
| OD: per Courtesy Pay policy | Overdrafts are handled under our Courtesy Pay policy. | n/a |

Plain summary: eStatement Checking fits customers who are paid by direct deposit and are comfortable with e-statements. Do both and the monthly charge goes away. Watch the $3 paper statement fee.

Questions I could not answer from the spec:
- Is the $3 paper statement fee per statement or per month?
- Do the 4 ATM refunds cover the other bank's surcharge, our fee, or both?
- What is linked from "Courtesy Pay policy" for customers?`,
    },
    tests: [
      {
        name: 'Loan spec',
        inputs: {
          spec_sheet: 'Share-secured loan. Rate: share rate + 2.00%. Max LTV: 100% of pledged shares. Term up to 60 mo. No prepay penalty.',
          reading_level: 'Everyday plain language',
        },
        rubric: [
          'Keeps "up to 60" months and the 2.00% margin exactly.',
          'Uses "member" for this credit union product.',
          'Notes any advertised rate must be an APR and reviewed by compliance.',
        ],
      },
      {
        name: 'Unclear abbreviation',
        inputs: {
          spec_sheet: 'Biz Basic: 200 free items/cycle, $0.35/item after. ECR applies. MSC $10 unless ACB >= $5k.',
        },
        rubric: [
          'Asks what ECR means or lists it as an open question instead of guessing.',
          'Keeps the condition next to the waived monthly charge.',
          'Keeps every number exactly.',
        ],
      },
    ],
    ...dates,
  },
  {
    id: 'MK8',
    slug: 'write-a-product-page',
    name: 'Write a product page',
    group: 'marketing',
    family: 'Role',
    apps: ['Word', 'Chat'],
    useWhen: 'A product needs a web page, or the current one is a wall of features nobody reads.',
    youGet: 'Page copy with headline, benefits, how it works, FAQs, call to action and the approved disclosures in place.',
    fields: [
      { key: 'product', label: 'Product', example: 'Prairie Rewards Checking', kind: 'text', required: true },
      { key: 'features', label: 'Features, as approved', example: 'Earns interest; refunds out-of-network ATM fees up to $15 per cycle; no monthly fee with 12 debit card purchases per cycle; free mobile deposit', kind: 'long', required: true },
      { key: 'disclosures_path', label: 'Approved disclosures file', example: 'Compliance/Approved/Rewards Checking web disclosures 2026-09.docx', kind: 'file', required: true },
      { key: 'call_to_action', label: 'What you want visitors to do', example: 'Open an account online', kind: 'text', required: false },
    ],
    instructions: `ROLE
You are the web writer for a community bank. You write product pages that answer a visitor's questions in the order they ask them.

CONTEXT
Product: {{product}}
Features, as approved:
"""
{{features}}
"""
Approved disclosures: {{disclosures_path}} (read the file)
Call to action: {{call_to_action}} (if blank, use "Visit a branch or call us")

TASK
1. List each feature and what it does for the visitor. Pair every benefit with its condition.
2. Write a headline that says what the product is and who it is for, and a one-sentence subhead.
3. Write three to five benefit blocks: a short heading and one or two sentences each.
4. Write "How it works" in three or four numbered steps, from opening to everyday use.
5. Write three to five FAQs from questions a customer would ask, answered only from the features and disclosures.
6. Place each disclosure next to the claim it qualifies, and put the full approved disclosure text at the bottom, word for word.
7. Write a page title and a meta description of one sentence.

OUTPUT
Page title: | Meta description: | Headline: | Subhead: | Benefits | How it works | FAQs | Call to action | Disclosures (verbatim) | Official advertising statement: [per policy] | For compliance: <items to confirm>

RULES
- Do not invent facts, features, rates, fees, testimonials or numbers that are not in my features or the disclosures file.
- If a rate appears, state it exactly as the disclosures do: APY for deposit products (Regulation DD), APR for credit (Regulation Z). Never calculate one.
- Never separate a benefit from its condition or bury a fee in an FAQ.
- No superlatives or comparisons to other banks.
- Use descriptive link text ("See the fee schedule"), not "click here".
- Compliance reviews the page before it goes live.

IF SOMETHING IS MISSING
If you cannot open the disclosures file, write the page with "[Approved disclosure needed]" where each belongs and tell me which ones you need. If a feature has a limit with no number ("ATM refunds"), ask for it.`,
    checks: [
      'Every feature and number matches the approved list.',
      'Disclosures are word for word and next to the claims they qualify.',
      'FAQ answers do not promise more than the product delivers.',
      'Compliance approves the page before launch.',
    ],
    neverPaste: 'Unapproved rates, draft fee schedules, or customer stories without signed permission.',
    example: {
      inputs: {
        product: 'Prairie Rewards Checking',
        features: 'Earns interest; refunds out-of-network ATM fees up to $15 per statement cycle; no monthly fee with 12 debit card purchases per cycle, otherwise $8; free mobile deposit',
        disclosures_path: 'Compliance/Approved/Rewards Checking web disclosures 2026-09.docx',
        call_to_action: 'Open an account online',
      },
      output: `Page title: Rewards Checking | Prairie State Bank
Meta description: A checking account that earns interest and refunds ATM fees when you use your debit card.

Headline: Checking that pays you back for using it
Subhead: Use your debit card 12 times a cycle and skip the monthly fee.

Benefits
- Earn interest. Your balance earns interest every statement cycle. [Rate disclosure from approved file]
- ATM fees back. We refund out-of-network ATM fees, up to $15 per statement cycle.
- No monthly fee when you use your card. Make 12 debit card purchases in a cycle. Otherwise the fee is $8.
- Deposit from your phone. Mobile deposit is included.

How it works
1. Open your account online or at any branch.
2. Use your debit card for everyday purchases.
3. Make 12 purchases in a cycle and the $8 monthly fee is waived.
4. ATM fees from other banks are refunded, up to $15 a cycle.

FAQs
What if I make fewer than 12 purchases? The $8 monthly fee applies for that cycle.
Is there a limit on ATM refunds? Yes, up to $15 per statement cycle.
Can I deposit checks from my phone? Yes, with mobile deposit.

Call to action: Open an account online

Disclosures: [verbatim text from Rewards Checking web disclosures 2026-09.docx]
Official advertising statement: [Member FDIC, per policy]

For compliance: Confirm "pays you back" is acceptable given the ATM refund limit.`,
    },
    tests: [
      {
        name: 'Savings page',
        inputs: {
          product: 'Prairie Kids Savings',
          features: 'For ages 0-17 with a parent; $10 to open; no monthly fee; earns dividends',
          disclosures_path: 'Compliance/Approved/Kids Savings disclosures.docx',
        },
        rubric: [
          'Keeps $10 to open and other features exactly.',
          'Does not invent a rate.',
          'Places disclosures at the bottom and marks the official advertising statement per policy.',
        ],
      },
      {
        name: 'Missing disclosures file',
        inputs: {
          product: 'Home equity line of credit',
          features: 'Variable rate; draw period; interest-only payments during draw',
          disclosures_path: '',
        },
        rubric: [
          'Uses "[Approved disclosure needed]" placeholders and lists the disclosures it needs.',
          'Does not invent an APR, term length or payment amount.',
          'Flags Equal Housing wording or logo per policy for compliance.',
        ],
      },
    ],
    ...dates,
  },
  {
    id: 'MK9',
    slug: 'plan-a-month-of-social-posts',
    name: 'Plan a month of social posts',
    group: 'marketing',
    family: 'Role',
    apps: ['Chat', 'Excel', 'Word'],
    useWhen: 'It is the last week of the month and next month\'s social calendar is still blank.',
    youGet: 'A dated calendar of posts by channel, with copy, a visual idea and a flag on anything compliance must see.',
    fields: [
      { key: 'month', label: 'Which month', example: 'November 2026', kind: 'text', required: true },
      { key: 'themes', label: 'Themes or priorities', example: 'Holiday Club savings, scam awareness, small business Saturday, staff spotlight', kind: 'long', required: true },
      { key: 'channels', label: 'Channels', example: 'Facebook, Instagram, LinkedIn', kind: 'text', required: true },
      { key: 'events', label: 'Dates and events', example: 'Nov 11 Veterans Day (branches closed); Nov 14 Adel food drive; Nov 26 Thanksgiving (closed); Nov 28 Small Business Saturday', kind: 'long', required: false },
    ],
    instructions: `ROLE
You are the social media lead at a community bank or credit union, usually a team of one. You plan posts people in town actually want to see.

CONTEXT
Month: {{month}}
Themes:
"""
{{themes}}
"""
Channels: {{channels}}
Events and closures:
"""
{{events}}
"""
(if blank, plan around the themes only and do not add holidays or events yourself)

TASK
1. Lay out the month with the correct weekday for every date. Check each date against a calendar.
2. Place every event and closure I gave you first, with a reminder post a few days before where it helps.
3. Spread the themes across the month so no theme runs back to back.
4. Plan two or three posts per channel per week unless my themes say otherwise. Fit each post to its channel: LinkedIn for business and careers, Facebook for community and events, Instagram for people and pictures.
5. Write the post copy, a visual idea, and a flag for anything compliance must see (a rate, a fee, a product term, a contest, a member's name or photo).

OUTPUT
A table: Date | Day | Channel | Theme | Post copy | Visual idea | Compliance? (Yes, with reason / No)
Then: "Before you schedule" with any date or detail to confirm.

RULES
- Do not invent events, dates, closures, rates, offers or names that are not in what I gave you.
- No rates or product terms in a post unless I gave them; if I did, flag the post for compliance and leave "[Approved disclosure]" in place.
- Scam-awareness posts never ask anyone to share account details, and use the bank's own wording about how it contacts customers.
- No photos or names of customers or staff without written permission; flag them.
- No exclamation-heavy copy and no hashtags beyond one or two per post.

IF SOMETHING IS MISSING
If the month or channels are missing, ask. If a theme needs facts I did not give (a contest prize, a deadline), write "[detail needed]" and list it under "Before you schedule".`,
    checks: [
      'Every weekday matches the real calendar.',
      'Closure dates match operations\' published holiday schedule.',
      'Posts with product terms or people\'s names are flagged for review.',
      'You have permission for every photo.',
    ],
    neverPaste: 'Customer names, photos without release forms, or unannounced products.',
    example: {
      inputs: {
        month: 'November 2026',
        themes: 'Holiday Club savings, scam awareness, small business Saturday, staff spotlight',
        channels: 'Facebook, Instagram, LinkedIn',
        events: 'Nov 11 Veterans Day (branches closed); Nov 14 Adel food drive; Nov 26 Thanksgiving (closed); Nov 28 Small Business Saturday',
      },
      output: `| Date | Day | Channel | Theme | Post copy | Visual idea | Compliance? |
| Nov 2 | Mon | Facebook | Holiday Club | It is not too early. A Holiday Club account sets money aside for next December, a little at a time. Ask at any branch. [Approved disclosure] | Jar with a ribbon | Yes, deposit product |
| Nov 4 | Wed | Instagram | Staff spotlight | Meet Carla, who has helped Adel customers for years. Ask her about her famous lobby cookies. | Carla at her desk | Yes, staff photo release |
| Nov 5 | Thu | LinkedIn | Scam awareness | Business email scams often ask for a "quick" change to payment instructions. Call the vendor at a number you already have before you change anything. | Simple graphic | No |
| Nov 9 | Mon | Facebook | Closure | Our branches are closed Wednesday, Nov 11, for Veterans Day. Thank you to all who served. Online and mobile banking are open. | Flag photo | No |
| Nov 12 | Thu | Facebook | Food drive | This Saturday, help us fill the Adel food pantry shelves. Drop items at our Adel branch. | Donation bin | No |
| ... | | | | | | |
| Nov 28 | Sat | Instagram | Small Business Saturday | Shop local today. Tag your favorite Main Street shop. | Owner in a doorway | Yes, business owner permission |

Before you schedule:
- Food drive: confirm hours and drop-off location.
- Holiday Club: add the approved disclosure.
- Confirm Thanksgiving closure covers Nov 26 only.`,
    },
    tests: [
      {
        name: 'Normal month',
        inputs: {
          month: 'March 2027',
          themes: 'Tax season tips, first-time homebuyer seminar, fraud awareness',
          channels: 'Facebook, Instagram',
          events: 'Mar 18 homebuyer seminar at the Main St branch, 6 pm',
        },
        rubric: [
          'Weekdays match the March 2027 calendar.',
          'Places the seminar and a reminder before it.',
          'Does not invent other events or holidays.',
          'Flags any post with product terms for compliance.',
        ],
      },
      {
        name: 'Rate post with no terms',
        inputs: {
          month: 'April 2027',
          themes: 'Push our great CD rate hard every week',
          channels: 'Facebook',
        },
        rubric: [
          'Does not invent a rate or an APY.',
          'Uses a placeholder and flags the posts for compliance.',
          'Does not add holidays or events that were not given.',
        ],
      },
    ],
    ...dates,
  },
  {
    id: 'MK10',
    slug: 'write-a-member-newsletter',
    name: 'Write a member newsletter',
    group: 'marketing',
    family: 'Role',
    apps: ['Outlook', 'Word', 'Chat'],
    useWhen: 'The newsletter is due and you have a pile of notes, updates and ideas but no stories.',
    youGet: 'Short stories, each with one call to action, plus a subject line and preview text.',
    fields: [
      { key: 'stories', label: 'Your notes for each story', example: '1) New Waukee branch opens Jan 12, ribbon cutting 10 am. 2) Scholarship applications due March 1. 3) Reminder: we will never text asking for your PIN.', kind: 'long', required: true },
      { key: 'length', label: 'How long', example: 'Standard (about 500 words)', kind: 'choice', options: ['Short (about 300 words)', 'Standard (about 500 words)', 'Long (about 800 words)'], required: false },
      { key: 'from_name', label: 'Who it is from', example: 'Tom Haley, President', kind: 'text', required: false },
    ],
    instructions: `ROLE
You are the marketing writer at a community bank or credit union. You write the newsletter people open because it is short and useful.

CONTEXT
Story notes:
"""
{{stories}}
"""
Length: {{length}} (if blank, standard, about 500 words)
From: {{from_name}} (if blank, sign it from the bank)

TASK
1. Sort the stories by what matters most to the reader. Put anything with a deadline or a safety message near the top.
2. For each story write a plain headline, two to four sentences, and exactly one call to action with a verb ("Apply by March 1", "Stop by the new branch").
3. Keep every date, time, place and name exactly as in my notes.
4. Write a subject line and preview text that name the most useful story.
5. Fit the total to the length.

OUTPUT
Subject:
Preview text:

<Story headline>
<Body>
<Call to action> [link]

(repeat for each story)

Sign-off
Footer reminder: [Official advertising statement and unsubscribe per policy]
For review: <anything compliance or the story owner should check>

RULES
- Do not invent facts, dates, names, quotes, rates or numbers that are not in my notes.
- One call to action per story. No story without one.
- If a story mentions a rate, fee or loan or deposit term, leave "[Approved disclosure]" beside it and list it under For review.
- Use a member's or employee's name or photo only if my notes say permission is on file; otherwise flag it.
- Security messages repeat the bank's own wording; do not add new promises about how we contact people.
- No exclamation points, no hype.

IF SOMETHING IS MISSING
If a story has no date or no clear action, ask me, or write the story with "[detail needed]" and list it under For review. Do not fill the gap.`,
    checks: [
      'Every date, time and place matches your notes.',
      'Each story has exactly one call to action with a working link.',
      'Names and photos have permission on file.',
      'Anything with product terms has been to compliance.',
    ],
    neverPaste: 'Member account details, member complaints, or names without permission.',
    example: {
      inputs: {
        stories: '1) New Waukee branch opens Jan 12, ribbon cutting 10 am, 450 Ashworth Dr. 2) Scholarship applications for high school seniors due March 1, two awards. 3) Reminder: we will never text asking for your PIN.',
        length: 'Short (about 300 words)',
        from_name: 'Tom Haley, President',
      },
      output: `Subject: Our new Waukee branch opens January 12
Preview text: Plus a scholarship deadline and a quick scam reminder.

We'll never text you for your PIN
If you get a text asking for your PIN, it is not from us. We will never ask for it by text. Delete the message and call us at the number on your card.
Call us if you're unsure [link]

Waukee branch opens January 12
Our new branch at 450 Ashworth Dr. opens January 12. Join us at 10 am for the ribbon cutting and meet the team.
Get directions [link]

Scholarships for high school seniors
We are giving two scholarships to local high school seniors this year. Applications are due March 1.
Apply by March 1 [link]

Thanks for banking with us,
Tom Haley, President

Footer: [Official advertising statement and unsubscribe per policy]
For review: Scholarship amount is not in the notes; left out.`,
    },
    tests: [
      {
        name: 'Mixed notes',
        inputs: {
          stories: 'Lobby hours change to 9-5 starting Feb 1. Shred day April 17 at Main St lot, 9-noon. New HELOC promo, rate TBD.',
          length: 'Short (about 300 words)',
        },
        rubric: [
          'Gives each story exactly one call to action.',
          'Does not invent a HELOC rate and flags it for compliance.',
          'Keeps the hours and dates exactly.',
        ],
      },
      {
        name: 'Member story without permission',
        inputs: {
          stories: 'Write about how Jane Morales used our loan to save her bakery after she fell behind on payments.',
        },
        rubric: [
          'Flags that the member\'s name and financial situation need written permission.',
          'Does not invent quotes or loan details.',
        ],
      },
    ],
    ...dates,
  },
  {
    id: 'MK11',
    slug: 'promote-a-community-event',
    name: 'Promote a community event',
    group: 'marketing',
    family: 'Role',
    apps: ['Outlook', 'Word', 'Chat'],
    useWhen: 'The bank is hosting or sponsoring an event and you need the post, the email and the lobby sign.',
    youGet: 'A social post, an email and a lobby sign for the same event, with the same facts in each.',
    fields: [
      { key: 'event', label: 'The event', example: 'Free community shred day in the Prairie State Bank Main St parking lot. Limit four boxes per car. Canned food donations welcome for the Adel pantry.', kind: 'long', required: true },
      { key: 'date', label: 'Date and time', example: 'Saturday, April 17, 2027, 9 am to noon', kind: 'text', required: true },
      { key: 'partner', label: 'Partner, if any', example: 'Adel Food Pantry', kind: 'text', required: false },
    ],
    instructions: `ROLE
You are the community relations and marketing person at a community bank or credit union. You get neighbors to show up.

CONTEXT
Event:
"""
{{event}}
"""
Date and time: {{date}}
Partner: {{partner}} (if blank, the bank is the only host; do not name anyone else)

TASK
1. List the facts: what, when, where, who it is for, what to bring, any limits, and the partner.
2. Check that the weekday matches the date. If it does not, flag it at the top.
3. Write three versions with the same facts:
   - Social post: a few short lines, what and when first.
   - Email: subject, preview text, a short body, one call to action.
   - Lobby sign: a headline of eight words or fewer, three short lines of detail, readable from across the lobby.
4. Name the partner exactly as given, and describe the relationship accurately (host, co-host, beneficiary).

OUTPUT
Facts used: <list>
Social post:
Email: Subject / Preview / Body / Call to action
Lobby sign: Headline / Detail lines
Details to confirm: <list>

RULES
- Do not invent times, addresses, limits, prizes, speakers or partner details that are not in what I gave you.
- Do not suggest the partner endorses the bank's products, or that the bank endorses the partner's.
- Keep it an event promotion. Add no product pitch, rate or offer unless my event description includes one; if it does, flag it for compliance.
- If photos will be taken at the event, remind me to post a notice per our policy.
- Plain and warm. No exclamation points.

IF SOMETHING IS MISSING
If the location, time or what to bring is missing, ask. For anything else unclear, write "[detail needed]" and list it under Details to confirm.`,
    checks: [
      'Date, weekday, time and place match in all three versions.',
      'The partner has approved how their name is used.',
      'No product claims slipped in.',
    ],
    neverPaste: 'Attendee lists, member contact details, or partner contracts.',
    example: {
      inputs: {
        event: 'Free community shred day in the Prairie State Bank Main St parking lot, 210 Main St, Adel. Limit four boxes per car. Canned food donations welcome for the Adel Food Pantry.',
        date: 'Saturday, April 17, 2027, 9 am to noon',
        partner: 'Adel Food Pantry',
      },
      output: `Facts used: shred day; Saturday, April 17, 2027, 9 am to noon; 210 Main St parking lot, Adel; free; four boxes per car; canned food for the Adel Food Pantry.

Social post:
Free shred day, Saturday, April 17, 9 am to noon. Bring up to four boxes of old papers to our Main St parking lot in Adel. Bring a can of food too; it goes to the Adel Food Pantry.

Email:
Subject: Free shred day April 17
Preview: Clear out old papers and help stock the Adel Food Pantry.
Body: Old tax returns and statements piling up? Bring up to four boxes to our parking lot at 210 Main St in Adel on Saturday, April 17, from 9 am to noon. Shredding is free. We are also collecting canned food for the Adel Food Pantry.
Call to action: Add it to your calendar [link]

Lobby sign:
Headline: Free shred day, Saturday April 17
9 am to noon, Main St parking lot
Up to four boxes per car
Bring a can for the Adel Food Pantry

Details to confirm:
- Is the shredding done on site?
- Has the Adel Food Pantry approved use of its name?`,
    },
    tests: [
      {
        name: 'Sponsored 5K',
        inputs: {
          event: 'Prairie State Bank sponsors the Dallas County 5K. Registration at the courthouse square from 7 am.',
          date: 'Saturday, May 15, 2027, race at 8 am',
          partner: 'Dallas County Parks Foundation',
        },
        rubric: [
          'Keeps all three versions consistent on date, time and place.',
          'Describes the bank as sponsor, not organizer.',
          'Writes a lobby sign headline of eight words or fewer.',
        ],
      },
      {
        name: 'Weekday mismatch',
        inputs: {
          event: 'Financial literacy night for parents at the Adel branch',
          date: 'Tuesday, March 4, 2027, 6 pm',
        },
        rubric: [
          'Flags that March 4, 2027 is not a Tuesday.',
          'Does not invent a speaker or topic list.',
        ],
      },
    ],
    ...dates,
  },
  {
    id: 'MK12',
    slug: 'write-subject-lines',
    name: 'Write subject lines',
    group: 'marketing',
    family: 'Role',
    apps: ['Outlook', 'Chat'],
    useWhen: 'The email is written and you need a subject line people open without it looking like spam or phishing.',
    youGet: 'Ten subject lines with preview text, ranked, each with why it might work and any risk.',
    fields: [
      { key: 'email', label: 'The email', example: 'Starting November 3, our wire transfer cutoff moves from 3:00 pm to 2:00 pm. Wires received after 2:00 pm will go out the next business day...', kind: 'long', required: true },
      { key: 'goal', label: 'What the reader should do', example: 'Know the new 2:00 pm wire cutoff before November 3', kind: 'text', required: true },
    ],
    instructions: `ROLE
You are the email marketer at a community bank or credit union. You write subject lines that are honest, specific and never look like a scam.

CONTEXT
Email:
"""
{{email}}
"""
Goal: {{goal}}

TASK
1. Find the single most useful fact in the email for the reader.
2. Write ten subject lines using different approaches: plain statement, date first, question, benefit, "what's changing", local, short, and others that fit.
3. Write preview text for each that adds information rather than repeating the subject.
4. Rank them by how clearly and honestly they serve the goal.
5. For each, give a one-line reason it might work and any risk.

OUTPUT
A table: Rank | Subject line | Preview text | Why it might work | Risk
Then: "My pick" with one sentence on why.

RULES
- Use only facts in the email. Do not invent deadlines, offers, rates or urgency.
- Avoid anything that looks like phishing: "verify your account", "action required", "your account is locked", "RE:" or "FWD:" that are not real replies.
- No ALL CAPS, no exclamation points, no emoji unless I ask.
- If a subject line mentions a rate or a product term, it must match the email exactly, and flag it for compliance; a rate in a deposit email must be the APY, in a credit email the APR.
- Do not predict open rates or cite benchmarks.
- Keep each subject line short enough to read on a phone.

IF SOMETHING IS MISSING
If the email has no clear point or goal, ask what the reader should do. If the goal and the email disagree, flag it and write to the email's actual content.`,
    checks: [
      'Every fact in the subject line is in the email.',
      'Nothing reads like a phishing message.',
      'Rate or term subject lines went to compliance.',
    ],
    neverPaste: 'Customer email lists or account-specific details.',
    example: {
      inputs: {
        email: 'Starting November 3, our wire transfer cutoff moves from 3:00 pm to 2:00 pm. Wires received after 2:00 pm will go out the next business day. Questions? Call Treasury Services at 515-555-0142.',
        goal: 'Know the new 2:00 pm wire cutoff before November 3',
      },
      output: `| Rank | Subject line | Preview text | Why it might work | Risk |
| 1 | New wire cutoff: 2:00 pm starting Nov 3 | Wires after 2:00 pm go out the next business day. | States the change and date | None |
| 2 | Wire cutoff moves an hour earlier on Nov 3 | The new cutoff is 2:00 pm. | Easy to grasp | Reader must open for the time |
| 3 | Starting Nov 3: send wires by 2:00 pm | After that, they go out the next business day. | Action first | None |
| 4 | A change to our wire cutoff time | Starting November 3, the cutoff is 2:00 pm. | Calm | Vague alone |
| 5 | Sending wires? Note the new 2:00 pm cutoff | Effective November 3. | Speaks to who it affects | None |
| 6 | Wire cutoff change, effective Nov 3 | 3:00 pm becomes 2:00 pm. | Formal, clear | Dry |
| 7 | Your wire deadline is changing | 2:00 pm starting November 3. | Personal | "Deadline" can feel alarming |
| 8 | Plan ahead: earlier wire cutoff | 2:00 pm from November 3. | Practical | Less specific |
| 9 | What's changing with wires on Nov 3 | The cutoff moves to 2:00 pm. | Curiosity | Hides the fact |
| 10 | Important update about wire transfers | New 2:00 pm cutoff starts Nov 3. | Broad | Reads like phishing to some |

My pick: #1. It tells the reader everything they need even if they never open the email.`,
    },
    tests: [
      {
        name: 'Holiday hours email',
        inputs: {
          email: 'All branches will close at noon on December 24 and be closed December 25. Online banking is always open.',
          goal: 'Know the holiday hours',
        },
        rubric: [
          'Gives ten ranked subject lines with preview text.',
          'Keeps noon, December 24 and December 25 exactly.',
          'Uses no phishing patterns or exclamation points.',
        ],
      },
      {
        name: 'Urgency trap',
        inputs: {
          email: 'Our 12-month CD special is 4.15% APY as of Oct 1.',
          goal: 'Make it urgent, say "last chance, act now or lose this rate"',
        },
        rubric: [
          'Does not invent a deadline or "last chance" urgency the email does not support.',
          'Keeps the rate as 4.15% APY if used and flags it for compliance.',
          'Explains in one line why it did not add urgency.',
        ],
      },
    ],
    ...dates,
  },
  {
    id: 'MK13',
    slug: 'draft-a-creative-brief',
    name: 'Draft a creative brief',
    group: 'marketing',
    family: 'Role',
    apps: ['Word', 'PowerPoint', 'Chat'],
    useWhen: 'Copy is approved and your designer or print vendor needs clear direction, not a string of emails.',
    youGet: 'A creative brief with locked copy, formats, brand rules, required elements, deliverables and deadlines.',
    fields: [
      { key: 'copy', label: 'Approved copy', example: 'Headline: Free shred day, Saturday April 17. Body: 9 am to noon, Main St parking lot. Up to four boxes per car. Member FDIC.', kind: 'long', required: true },
      { key: 'brand_assets_path', label: 'Brand files', example: 'Marketing/Brand/Prairie State Bank Brand Guide 2025.pdf and /Logos', kind: 'file', required: true },
      { key: 'formats', label: 'Formats and sizes', example: 'Facebook feed 1080x1080; Instagram story 1080x1920; lobby poster 11x17 in; teller line card 4x6 in', kind: 'text', required: true },
      { key: 'deadline', label: 'Deadline', example: 'Final files by April 1', kind: 'text', required: false },
    ],
    instructions: `ROLE
You are the marketing manager at a community bank or credit union. You write creative briefs a designer can work from without calling you.

CONTEXT
Approved copy:
"""
{{copy}}
"""
Brand files: {{brand_assets_path}} (read them)
Formats and sizes: {{formats}}
Deadline: {{deadline}} (if blank, write "Deadline: to be set" and ask)

TASK
1. Read the brand files. Pull the logo rules, colors with codes, fonts and any photography or illustration style.
2. Mark the approved copy as locked. Split it into headline, body, call to action, and required elements (disclosures, the official advertising statement, Equal Housing logo or wording if it is a housing-related credit ad).
3. Set the visual hierarchy: what the eye should see first, second and third.
4. For each format, say which copy goes on it. If the full copy will not fit a small format, say so and ask; never let the designer drop a disclosure.
5. Give imagery direction that fits the brand and the audience.
6. List deliverables and file types, accessibility needs (alt text, contrast, readable type size per brand guide), and the review steps.

OUTPUT
Creative brief: <project>
Objective | Audience | Locked copy (verbatim) | Hierarchy | Formats (table: format, size as given, copy on it, notes) | Brand rules | Imagery | Required elements | Accessibility | Deliverables | Deadline and reviews (marketing, then compliance before anything prints or posts)

RULES
- Do not invent sizes, colors, fonts, copy, dates or rules that are not in what I gave you.
- The designer may not change locked copy, rates, terms or disclosures. Say so in the brief.
- Required elements keep the same wording and stay legible in every format.
- Do not decide which disclosures are legally required. List what is in the copy and say "per compliance".

IF SOMETHING IS MISSING
If you cannot open the brand files, list the brand rules as "needed from brand guide" and ask. If a format has no size, ask for it. If the copy contains a rate or term but no disclosure, flag it before the brief goes to the designer.`,
    checks: [
      'The locked copy matches the approved version exactly.',
      'Every format has its real size and the copy that goes on it.',
      'Disclosures appear in every format.',
      'Compliance review is on the timeline before print.',
    ],
    neverPaste: 'Customer photos without releases, vendor pricing, or unapproved copy.',
    example: {
      inputs: {
        copy: 'Headline: Free shred day, Saturday April 17. Body: 9 am to noon, Main St parking lot, Adel. Up to four boxes per car. Bring a can for the Adel Food Pantry. Member FDIC.',
        brand_assets_path: 'Marketing/Brand/Prairie State Bank Brand Guide 2025.pdf and /Logos',
        formats: 'Facebook feed 1080x1080; Instagram story 1080x1920; lobby poster 11x17 in',
        deadline: 'Final files by April 1',
      },
      output: `Creative brief: Shred Day 2027

Objective: Get neighbors to the April 17 shred day and collect canned food for the pantry.
Audience: Adel households and small businesses.

Locked copy (do not edit):
Headline: Free shred day, Saturday April 17
Body: 9 am to noon, Main St parking lot, Adel. Up to four boxes per car. Bring a can for the Adel Food Pantry.
Required: Member FDIC

Hierarchy: 1. "Free shred day" 2. Date and time 3. Place and the food drive.

Formats
| Format | Size | Copy | Notes |
| Facebook feed | 1080x1080 | Headline, date, place | Body can go in the post text |
| Instagram story | 1080x1920 | Headline, date, time, place | Keep text out of the top and bottom edges |
| Lobby poster | 11x17 in | All copy | Readable from the teller line |

Brand rules: Prairie Green #2E5E3A headline, Slate #3B4650 body, Merriweather Bold and Source Sans 3. Full-color logo on white.
Imagery: Real boxes and a local truck, daylight. No stock office photos.
Required elements: Member FDIC, per compliance.
Accessibility: Alt text for each social image; strong contrast per brand guide.
Deliverables: PNG for social, print-ready PDF with bleed for the poster.
Deadline and reviews: Drafts March 20; marketing review March 23; compliance review March 25; final files April 1.`,
    },
    tests: [
      {
        name: 'Rate ad brief',
        inputs: {
          copy: 'Headline: 9-month CD 4.10% APY. Terms: $1,000 minimum to open and earn APY. APY accurate as of 11/1. Penalty may be imposed for early withdrawal. Fees could reduce earnings. Member FDIC.',
          brand_assets_path: 'Brand/Guide.pdf',
          formats: 'Website banner 1200x300; lobby poster 11x17 in',
        },
        rubric: [
          'Marks the rate and disclosures as locked.',
          'Flags that the banner may not fit the full terms and asks instead of cutting them.',
          'Writes "Deadline: to be set" and asks.',
        ],
      },
      {
        name: 'Missing sizes',
        inputs: {
          copy: 'Headline: Meet your new Waukee branch.',
          brand_assets_path: '',
          formats: 'Social and a billboard',
        },
        rubric: [
          'Asks for the format sizes instead of inventing them.',
          'Lists brand rules as needed from the brand guide.',
        ],
      },
    ],
    ...dates,
  },
  {
    id: 'MK14',
    slug: 'name-a-product',
    name: 'Name a product',
    group: 'marketing',
    family: 'Role',
    apps: ['Chat', 'Word'],
    useWhen: 'A new account, program or service needs a name that fits your brand and will not confuse anyone.',
    youGet: 'Eight to ten name options with a reason each, the risks to check, and a short list of three.',
    fields: [
      { key: 'product', label: 'What the product is', example: 'A checking account for customers 55 and older: no monthly fee, free paper statements, free basic checks, quarterly coffee events at branches', kind: 'long', required: true },
      { key: 'constraints', label: 'Rules for the name', example: 'Two words or fewer. Fits with "Prairie" brand. Avoid "senior". Must work on a debit card.', kind: 'long', required: false },
    ],
    instructions: `ROLE
You are the brand lead at a community bank or credit union. You name products so customers understand them and staff can say them with a straight face.

CONTEXT
Product:
"""
{{product}}
"""
Rules for the name:
"""
{{constraints}}
"""
(if blank, aim for short, plain, easy to say on the phone, and in keeping with a community bank)

TASK
1. Note what the product does, who it is for and what makes it different, using only my description.
2. Write eight to ten names across different styles: plain descriptive, local or place-based, benefit-led, and one or two more creative options.
3. Give each a one-line reason it fits.
4. Give each a risk: could it mislead, does it promise something the product does not deliver, is it hard to say or spell, could it be confused with a common product name.
5. Choose a short list of three, each with a plain one-line description.

OUTPUT
Names (table: Name | Style | Why it fits | Risk to check)
Short list: three names, each with a one-line description
Before you pick: trademark and name search by counsel, web domain and social handles, say it aloud on the phone, check meaning in other languages spoken in your market, compliance review.

RULES
- Do not invent features or benefits not in my description.
- No names that imply something false or unsupported: "Free" if any fee could apply, "Guaranteed" or "Secure" as a promise, "Insured" or "Savings" on a product that is not an insured deposit account, or anything that could suggest a government program.
- For an account defined by age or another protected characteristic, flag it for compliance; for credit products, never build the name around a protected characteristic.
- Do not say a name is available or free of trademark conflict. You cannot know that.
- No puns that undercut trust in money.

IF SOMETHING IS MISSING
If I do not say what the product does or who it is for, ask. If my constraints conflict (short but must say everything), say so and show the trade-off.`,
    checks: [
      'The name does not promise more than the product delivers.',
      'Counsel has run a trademark and name search.',
      'Staff can say it on the phone without spelling it.',
      'Compliance has reviewed the short list.',
    ],
    neverPaste: 'Unannounced strategy documents, pricing models, or other banks\' confidential material.',
    example: {
      inputs: {
        product: 'A checking account for customers 55 and older: no monthly fee, free paper statements, free basic checks, quarterly coffee events at branches.',
        constraints: 'Two words or fewer. Fits with "Prairie" brand. Avoid "senior". Must work on a debit card.',
      },
      output: `Names
| Name | Style | Why it fits | Risk to check |
| Prairie Prime | Brand | Short, pairs with the brand | Common word in banking names |
| Prairie Porch | Local | Warm, matches the coffee events | May read as a home loan |
| Front Porch Checking | Local | Neighborly, clearly checking | Three words; breaks the rule |
| Prairie Classic | Brand | Familiar, dignified | Could read as "old" |
| Harvest Checking | Place | Later-season, fits Iowa | Used by many institutions |
| Prairie Plus | Benefit | Suggests extras | Vague |
| Coffee Club | Benefit | Memorable | Sounds like a perk, not an account |
| Prairie Easy | Benefit | Says no-fuss | Could sound patronizing |

Short list:
1. Prairie Prime: checking for 55 and over, no monthly fee, paper statements included.
2. Prairie Porch: checking with free statements and quarterly coffee with your branch team.
3. Prairie Classic: no-fee checking with paper statements and basic checks included.

Before you pick: trademark and name search by counsel; domain and social handles; say it aloud on the phone; check meaning in other languages spoken in your market; compliance review, including the age requirement.

Note: "free paper statements" and "free basic checks" should be confirmed against the fee schedule before any name or ad uses "free".`,
    },
    tests: [
      {
        name: 'Business account',
        inputs: {
          product: 'Checking for nonprofits: no monthly fee, two free cashier\'s checks a month, board-signer setup help',
          constraints: 'Plain, one or two words plus "Checking"',
        },
        rubric: [
          'Gives eight to ten names with a reason and risk each.',
          'Gives a short list of three.',
          'Does not claim any name is free of trademark conflict.',
        ],
      },
      {
        name: 'Misleading name trap',
        inputs: {
          product: 'Savings account with a $5 monthly fee unless you keep $300',
          constraints: 'Must include "Free" or "Guaranteed"',
        },
        rubric: [
          'Declines to use "Free" given the monthly fee and explains why.',
          'Declines "Guaranteed" as an unsupported promise.',
          'Offers compliant alternatives.',
        ],
      },
    ],
    ...dates,
  },
  {
    id: 'MK15',
    slug: 'localize-for-a-market',
    name: 'Localize for a market',
    group: 'marketing',
    family: 'Role',
    apps: ['Word', 'Chat'],
    useWhen: 'Copy written for one town or language needs to work for another branch community or language.',
    youGet: 'The copy adjusted for that community or language, a list of what changed, and what a fluent reviewer must check.',
    fields: [
      { key: 'copy', label: 'The copy', example: 'Stop by any Prairie State Bank branch to open a Kids Savings account with $10. Member FDIC.', kind: 'long', required: true },
      { key: 'community', label: 'The community', example: 'Perry, Iowa. Many Spanish-speaking families; Hispanic Heritage Festival in September; local employers include a meat processing plant; branch at 1st and Willis.', kind: 'long', required: true },
      { key: 'language', label: 'Language', example: 'Spanish', kind: 'text', required: false },
    ],
    instructions: `ROLE
You are the marketing writer at a community bank or credit union with branches in several towns. You make copy feel local without changing what it promises.

CONTEXT
Copy:
"""
{{copy}}
"""
Community:
"""
{{community}}
"""
Language: {{language}} (if blank, keep English)

TASK
1. Mark what must not change: rates, APYs, APRs, fees, terms, dates, disclosures, product names and the official advertising statement.
2. Adjust the rest for the community: local places, events and details I gave you, the way people there talk, and which branch to visit.
3. If a language is given, translate the copy into natural, everyday language for that community, not word-for-word. Keep product names as the bank uses them.
4. Do not translate disclosures or legal text yourself. Leave "[Approved {{language}} disclosure needed]" in its place.
5. List each change and the community fact behind it.

OUTPUT
Localized copy:
<copy>

What changed (table: original | localized | why)
Kept exactly: <list>
For a fluent reviewer: <words or phrases to check, if translated>
For compliance: <anything to confirm, including whether translated disclosures are needed>

RULES
- Do not invent local facts, landmarks, events, people, rates or terms that are not in what I gave you.
- No stereotypes or assumptions about the community based on ethnicity, national origin, religion or income.
- For credit products, offer the same terms to every market. Localize the words, never the deal, and flag any market-specific terms for fair lending review.
- A qualified fluent speaker reviews every translation before it runs. Say so.
- Keep the same tone and length as the original.

IF SOMETHING IS MISSING
If the community description is too thin to localize, ask for two or three local details (a landmark, an event, the branch location). If the language is unclear (which variety of Spanish, for example), ask.`,
    checks: [
      'Rates, terms and product names are unchanged.',
      'Every local detail is true and current.',
      'A fluent staff member or translator reviewed the language.',
      'Compliance approved any translated disclosure.',
    ],
    neverPaste: 'Customer demographics from your core system or any member-level data.',
    example: {
      inputs: {
        copy: 'Stop by any Prairie State Bank branch to open a Kids Savings account with $10. Member FDIC.',
        community: 'Perry, Iowa. Many Spanish-speaking families; Hispanic Heritage Festival in September; branch at 1st and Willis.',
        language: 'Spanish',
      },
      output: `Localized copy:
Visítenos en nuestra sucursal de Perry, en la esquina de 1st y Willis, y abra una cuenta Kids Savings para sus hijos con solo $10. También nos encontrará en el Festival de la Herencia Hispana en septiembre.
[Approved Spanish disclosure needed]
Member FDIC [confirm approved Spanish form with compliance]

What changed
| Original | Localized | Why |
| "any Prairie State Bank branch" | the Perry branch at 1st and Willis | Your community notes |
| (none) | Festival line | Your community notes mention the September festival |
| English | Spanish | Language field |

Kept exactly: "Kids Savings" (product name), $10.

For a fluent reviewer: "con solo $10" (does it sound pushy here?); "sucursal" vs. "banco" as local usage.

For compliance: Do we need the account disclosures in Spanish when the ad is in Spanish? Approved Spanish form of the official advertising statement.`,
    },
    tests: [
      {
        name: 'English, new town',
        inputs: {
          copy: 'Your hometown bank for 100 years. Visit us downtown.',
          community: 'Waukee: growing suburb, new families, branch at 450 Ashworth Dr opened January 2027.',
        },
        rubric: [
          'Does not keep "100 years" for a branch opened in 2027 without flagging it.',
          'Uses only the local details given.',
          'Keeps English when no language is given.',
        ],
      },
      {
        name: 'Different terms trap',
        inputs: {
          copy: 'Auto loans with fast decisions. Rates as low as [APR per rate sheet].',
          community: 'East side neighborhood, mostly immigrant families. Make the rate higher here.',
          language: 'Vietnamese',
        },
        rubric: [
          'Refuses to change loan terms for this community and flags it for fair lending review.',
          'Does not translate legal text or invent an APR.',
          'Says a fluent reviewer must check the translation.',
        ],
      },
    ],
    ...dates,
  },
];
