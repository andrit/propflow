export const INDUSTRY_TYPES = ['tech', 'creative', 'trades', 'professional', 'events', 'marketing'] as const
export type IndustryType = typeof INDUSTRY_TYPES[number]

export interface IndustryConfig {
  label: string
  icon: string
  sectionLabels: {
    clientInfo: string
    scope: string
    deliverables: string
    pricing: string
    terms: string
  }
  pricingLabel: string
  placeholders: {
    scope: string
    deliverables: string
    pricing: string
    terms: string
    clientInfo?: string
  }
  defaultTerms: string
  optionalSection: {
    id: string
    label: string
    prompt: string
  }
  defaultTemplate: 'clean' | 'executive' | 'studio'
}

export const INDUSTRY_CONFIG: Record<IndustryType, IndustryConfig> = {
  tech: {
    label: 'Technology & Digital',
    icon: '💻',
    sectionLabels: {
      clientInfo: 'Client Info',
      scope: 'Project Scope',
      deliverables: 'Deliverables',
      pricing: 'Pricing',
      terms: 'Terms',
    },
    pricingLabel: 'Pricing',
    placeholders: {
      scope: "Describe the problem you're solving and your technical approach. Include the stack, integrations, or infrastructure involved if relevant.",
      deliverables: 'List the specific outputs: features, pages, APIs, components, or repositories. Include acceptance criteria if you have them.',
      pricing: 'Fixed fee, hourly rate, or milestone-based payments. Note any assumptions that affect the estimate (e.g., client provides API access, content is provided by client).',
      terms: 'Include IP ownership, who owns the code at delivery, testing/QA responsibility, and what triggers final payment.',
    },
    defaultTerms: `**Payment.** A 50% deposit is due upon proposal acceptance. The remaining balance is due upon delivery of final work. All payments are due within 7 days of invoice.

**Revisions.** Each deliverable includes two rounds of revisions. Additional revisions are billed at the agreed hourly rate. Revisions do not include scope changes.

**Intellectual Property.** Full ownership of all code and deliverables transfers upon receipt of final payment. I retain the right to display this work in my portfolio unless otherwise agreed.

**Cancellation.** If the project is cancelled after work begins, I retain the deposit and deliver work completed to date.`,
    optionalSection: {
      id: 'hosting',
      label: 'Hosting & Maintenance',
      prompt: "Is post-delivery hosting, monitoring, or support in scope? If yes, describe the arrangement and monthly cost. If not, note this explicitly.",
    },
    defaultTemplate: 'clean',
  },

  creative: {
    label: 'Creative & Media',
    icon: '🎨',
    sectionLabels: {
      clientInfo: 'Client Info',
      scope: 'Creative Brief',
      deliverables: 'Deliverables & Format',
      pricing: 'Fees & Rights',
      terms: 'Terms',
    },
    pricingLabel: 'Fees & Rights',
    placeholders: {
      scope: "Describe the project: what you're making, the tone and vision, and what the client will use it for. Include audience, platform, and any existing brand direction.",
      deliverables: 'List what you\'ll deliver: word count, image count, video duration, file formats, resolution. Note revision rounds included.',
      pricing: 'Your fee for this work. Note whether this covers one-time use, unlimited use, or exclusive rights — and for how long.',
      terms: 'Include revision policy (how many rounds, what counts as a round), kill fee (what you\'re owed if the project is canceled), and credit/attribution requirements.',
    },
    defaultTerms: `**Fees.** Full payment is due within 14 days of delivery of final files. A 50% deposit is required before work begins.

**Revisions.** This proposal includes two rounds of revisions. Additional revisions are billed at my standard rate. A revision is a change to agreed work — a change to the brief is a scope change.

**Kill Fee.** If the project is cancelled after work begins, I retain the deposit and charge 25% of the remaining fee for work completed to date.

**Rights.** Intellectual property and usage rights are as described in the Fees & Rights section above. All rights revert to me if the full fee is not paid.

**Credit.** I reserve the right to credit this work in my portfolio unless we agree otherwise in writing.`,
    optionalSection: {
      id: 'rights',
      label: 'Rights & Licensing',
      prompt: 'Detail the exact usage rights being transferred: platform, duration, territory, exclusivity. If you retain copyright and are granting a license, state that clearly. If the client is buying full ownership, state that too.',
    },
    defaultTemplate: 'studio',
  },

  trades: {
    label: 'Trades & Property',
    icon: '🔧',
    sectionLabels: {
      clientInfo: 'Client & Site Info',
      scope: 'Scope of Work',
      deliverables: "What's Included",
      pricing: 'Estimate',
      terms: 'Terms & Conditions',
    },
    pricingLabel: 'Estimate',
    placeholders: {
      clientInfo: 'Include the client\'s name and the property address or site location. Note any site access considerations (gated entry, dogs, parking).',
      scope: 'Describe the work to be done. Include site conditions, existing features being removed or retained, and any structural or preparation work required.',
      deliverables: "List what you'll provide when the job is complete. Materials, labor, finish specifications. Be specific about what's included and what the client supplies.",
      pricing: 'Break down labor and materials if possible. Note what can change this estimate (site conditions, material cost fluctuations, additional work discovered during the job).',
      terms: 'Include payment schedule (deposit, progress payments, final payment), warranty on workmanship, what happens if the client requests changes mid-project, and who is responsible for permits.',
    },
    defaultTerms: `**Payment Schedule.** A 30% deposit is required before work begins. Progress payments as outlined in the Estimate. Final payment is due on the day of completion.

**Variations.** Any work not described in this proposal will be quoted separately before proceeding. No variation work will begin without written approval.

**Warranty.** Workmanship is warranted for 12 months from completion. Materials are subject to manufacturer warranty only.

**Permits.** Unless otherwise stated in this proposal, the client is responsible for obtaining all necessary permits and approvals before work begins.

**Cancellation.** If the project is cancelled after work begins, the client is responsible for materials ordered and work completed to date.`,
    optionalSection: {
      id: 'materials',
      label: 'Materials Breakdown',
      prompt: 'Itemize materials separately from labor: product name, supplier, unit cost, quantity, and total. Useful when materials make up a significant share of the budget or when the client wants to verify pricing.',
    },
    defaultTemplate: 'clean',
  },

  professional: {
    label: 'Professional Services',
    icon: '💼',
    sectionLabels: {
      clientInfo: 'Client & Engagement Info',
      scope: 'Engagement Objectives',
      deliverables: 'Deliverables & Methodology',
      pricing: 'Investment',
      terms: 'Terms',
    },
    pricingLabel: 'Investment',
    placeholders: {
      clientInfo: "Include the client's name, company, and the name of the person you'll be working with directly if different from the billing contact.",
      scope: "Describe the situation you're being brought in to address and what success looks like. Include the problem statement, key constraints, and any background context.",
      deliverables: "What the client will receive: reports, recommendations, sessions, workshops, or frameworks. Include your methodology or approach if it's relevant to why they hired you.",
      pricing: "Retainer, project fee, or daily/hourly rate. Note what's included and what would be billed separately (travel, additional sessions, report revisions).",
      terms: "Include confidentiality provisions, who owns any work product, termination terms, and what happens if the scope changes.",
    },
    defaultTerms: `**Payment.** Invoices are due within 14 days of issue. Retainer fees are due at the start of each billing period.

**Confidentiality.** I will treat all information shared during this engagement as confidential and will not disclose it to third parties without your written consent.

**Work Product.** Unless otherwise agreed, all deliverables produced under this engagement become your property upon receipt of full payment.

**Termination.** Either party may terminate this engagement with 14 days written notice. You are responsible for fees incurred up to the termination date.

**Scope Changes.** Changes to the scope of this engagement will be agreed in writing before additional work begins.`,
    optionalSection: {
      id: 'not-in-scope',
      label: "What's Not In Scope",
      prompt: "Explicitly list what this engagement does not include. This is one of the most protective things you can put in a professional services proposal — it prevents scope creep and manages expectations before the engagement starts.",
    },
    defaultTemplate: 'executive',
  },

  events: {
    label: 'Events & Experiences',
    icon: '🎉',
    sectionLabels: {
      clientInfo: 'Client & Event Info',
      scope: 'Event Overview',
      deliverables: "What's Included",
      pricing: 'Package & Pricing',
      terms: 'Terms & Cancellation Policy',
    },
    pricingLabel: 'Package & Pricing',
    placeholders: {
      clientInfo: 'Client name and contact. Note the event name or type (wedding, corporate dinner, product launch, workshop) and the expected guest count.',
      scope: "Describe the event: date, venue, duration, and what you're responsible for. If you're coordinating with other vendors, note which parts of the event you own vs. coordinate.",
      deliverables: "List everything included in this proposal: staff, equipment, setup/teardown, catering items, entertainment hours, coordination services. Be specific — vague inclusions become disputes.",
      pricing: 'Package price or itemized breakdown. Note deposit required, payment milestones, and what triggers each payment (e.g., 50% on signing, 50% one week before event).',
      terms: 'Include your cancellation policy (what the client keeps vs. forfeits at different notice periods), force majeure terms, and what happens if the event date changes.',
    },
    defaultTerms: `**Deposit.** A 50% non-refundable deposit is required to secure the date. The remaining balance is due 7 days before the event.

**Cancellation.** Cancellations with more than 30 days notice forfeit the deposit only. Cancellations within 30 days forfeit 75% of the total fee. Cancellations within 7 days forfeit the full fee.

**Date Changes.** A date change request is subject to availability. If the new date is not available, standard cancellation terms apply.

**Force Majeure.** Neither party will be liable for cancellation caused by circumstances beyond reasonable control (natural disaster, government restriction, venue closure). In such cases, a credit will be offered toward a future date.

**Additional Costs.** Any costs incurred on your behalf (venue fees, third-party suppliers, permits) will be billed at cost plus a coordination fee as agreed.`,
    optionalSection: {
      id: 'event-details',
      label: 'Event Details',
      prompt: 'A quick-reference summary: Event date, venue address, setup time, event start/end time, guest count, and any confirmed vendors or special requirements. Useful as a shared reference for both parties.',
    },
    defaultTemplate: 'studio',
  },

  marketing: {
    label: 'Marketing & Communications',
    icon: '📣',
    sectionLabels: {
      clientInfo: 'Client & Brand Info',
      scope: 'Campaign / Engagement Scope',
      deliverables: 'Deliverables',
      pricing: 'Fees',
      terms: 'Terms',
    },
    pricingLabel: 'Fees',
    placeholders: {
      clientInfo: "Client name and primary contact. Note the product, service, or brand this engagement is for — especially if the client has multiple brands or business units.",
      scope: "Describe the goal: what the client is trying to achieve, the audience they're trying to reach, and the channels or tactics in scope. Include what you're NOT doing to set clear expectations.",
      deliverables: 'List the specific outputs: number of posts, articles, emails, campaigns, audits, reports. Include format and frequency where relevant.',
      pricing: "Monthly retainer, project fee, or per-deliverable pricing. Note what's included in the base fee and what would be charged additionally (paid media, tools, rush fees).",
      terms: "Include content ownership (does the client own what you produce?), approval workflow (how many revisions, turnaround time), and what happens if a deadline slips on either side.",
    },
    defaultTerms: `**Payment.** Retainer fees are due at the start of each billing period. Project fees are due within 14 days of invoice.

**Content Ownership.** All content produced under this engagement becomes your property upon receipt of full payment. I retain the right to reference this work in my portfolio.

**Approvals.** You agree to provide feedback or approval within 3 business days of receiving a deliverable. Delays on your side do not extend my deadlines.

**Revisions.** Each deliverable includes two rounds of revisions. Additional revisions are billed at my standard hourly rate.

**Termination.** Either party may terminate a retainer engagement with 30 days written notice. Project engagements may not be terminated once work has begun without forfeiting the full fee.`,
    optionalSection: {
      id: 'kpis',
      label: 'KPIs & Reporting',
      prompt: 'Define the metrics that will be tracked and reported: reach, engagement, leads generated, search rankings, email open rates, etc. Note the reporting cadence and format. Having agreed KPIs in the proposal sets expectations before the engagement begins.',
    },
    defaultTemplate: 'clean',
  },
}
