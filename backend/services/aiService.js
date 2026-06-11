/**
 * Simulates AI-powered transcript and summary generation based on consultation metadata
 * @param {string} title - Recording Title
 * @param {string} clientName - Associated Client's Name
 * @param {string} consultantName - Associated Consultant's Name
 * @param {string[]} tags - Associated Tags
 * @returns {Promise<{transcript: string, summary: string, discussionPoints: string[], actionItems: string[]}>}
 */
export const generateAIInsights = async (
  title,
  clientName,
  consultantName,
  tags = []
) => {
  // Simulate API processing delay (1.5 seconds)
  await new Promise((resolve) => setTimeout(resolve, 1500));

  const tagContext = tags.length > 0 ? tags.join(', ') : 'general review';

  const conversations = [
    {
      transcript: `Consultant (${consultantName}): Hello, thanks for joining today's session. Let's review the updates regarding ${tagContext}.
Client (${clientName}): Thanks. I have been following the strategy we outlined, but we encountered some unexpected integration friction.
Consultant (${consultantName}): Tell me more about the integration friction. Is it data sync latency?
Client (${clientName}): Precisely. The system locks when writing high-volume updates. We need to speed it up.
Consultant (${consultantName}): I recommend setting up Redis caching for hot paths and optimizing the database indexes. That will drop the read-write latency.
Client (${clientName}): Sounds great. I will have the developer team review it. We also need to finalise our launch timeline.
Consultant (${consultantName}): I will draft a deployment checklist. Let's aim for a staging release next Tuesday.`,
      summary: `The session addressed data sync latencies and integration friction during high-volume updates. Consultant ${consultantName} recommended implementing Redis caching and database indexing.`,
      discussionPoints: [
        `Identified data sync friction in production environment.`,
        `Discussed caching architectures using Redis.`,
        `Reviewed the release timeline for staging and deployment.`,
      ],
      actionItems: [
        `Consultant (${consultantName}) to draft staging deployment checklist by Friday.`,
        `Client (${clientName}) to set up developer team sync on Redis requirements.`,
        `Optimize high-volume write index parameters on database.`,
      ],
    },
    {
      transcript: `Consultant (${consultantName}): Welcome back. Let's dive into our analysis of ${tagContext} and see what metrics changed.
Client (${clientName}): The user onboarding numbers look better, but the dropoff on the payment page is still high.
Consultant (${consultantName}): Let's look at the UX. Is the payment modal slow to load?
Client (${clientName}): Yes, and we lack local payment integrations, which causes user abandonment.
Consultant (${consultantName}): Understood. We must integrate Stripe Elements to keep user focus, and set up Apple Pay. That should boost checkout conversions.
Client (${clientName}): Agreed. Can we get this implemented before the end of the month?
Consultant (${consultantName}): Yes. Let's get the payment designs finalised by Friday, then build it out.`,
      summary: `The discussion centered on reducing user dropoff rates on the payment screen. Consultant ${consultantName} recommended integrating Stripe Elements and Apple Pay to boost checkout page conversions.`,
      discussionPoints: [
        `Analyzed funnel statistics and payment dropoff rates.`,
        `Evaluated payment gateway alternatives for local support.`,
        `Reviewed onboarding flow enhancements.`,
      ],
      actionItems: [
        `Consultant (${consultantName}) to provide Stripe API reference details.`,
        `Client (${clientName}) to approve checkout screen layout wireframes.`,
        `Set up payment testing keys in sandbox.`,
      ],
    },
  ];

  // Pick a conversation template based on title hashing
  const hash = title.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const selectedIdx = Math.abs(hash) % conversations.length;

  return conversations[selectedIdx];
};
