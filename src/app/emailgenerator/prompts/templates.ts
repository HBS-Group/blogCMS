export const EMAIL_GENERATION_PROMPT = `
Generate [numberOfVariations] email variation(s) based on the following requirements:

**Email Type:** [emailType]
**Recipient Context:** [recipientContext]
**Main Objective:** [objective]
**Key Information/Points to Include:**
[keyInfo]

**Optional Details:**
*   **Sender Name:** [senderName]
*   **Sender Position:** [senderPosition]
*   **Company Name:** [companyName]
*   **Call to Action:** [callToAction]

**Style & Formatting:**
*   **Tone:** [tone]
*   **Length:** [length]
*   **Language:** [language]
*   **Accent/Dialect (if applicable):** [accent]

**Output Format:**
For each variation, provide the output strictly in the following format, with no extra text or explanations before or after each variation block:

Variation [variation number]:
Subject: [Generated Subject Line]
Body:
[Generated Email Body, including sender name, position, and company if provided in the signature]

--- End Variation [variation number] ---

---
Example (Do not include this example in the final output):
Variation 1:
Subject: Following Up on Our Meeting
Body:
Hi [Recipient Name],

It was great connecting with you yesterday...
[Rest of the email body]

Best regards,
[Sender Name]
[Sender Position, if provided]
[Company Name, if provided]
--- End Variation 1 ---
---
`;
export const feedback_request_PROMPT =`Generate [numberOfVariations] feedback request email(s) based on the following details:

**Email Type:** Feedback Request
**Recipient Context:** [recipientContext] (e.g., Customer after purchase, User after service, Event attendee)
**Main Objective:** [objective] (e.g., Gather product feedback, Improve service quality, Collect event feedback)
**Key Information/Points to Include:**
[keyInfo] (e.g., Specific aspects to provide feedback on, How feedback will be used, Estimated time to complete feedback)
**Desired Tone:** [tone] (e.g., Friendly, Appreciative, Professional)
**Desired Length:** [length]
**Language:** [language] ([accent], if applicable)
**Call to Action (Optional):** [callToAction] (e.g., Complete survey, Reply with thoughts, Schedule feedback call)
**Sender Name (Optional):** [senderName]
**Sender Position (Optional):** [senderPosition]
**Company Name (Optional):** [companyName]

Instructions:
- Craft a clear subject line indicating the feedback request.
- Express appreciation for the recipient's time/business.
- Clearly explain why their feedback is valuable.
- Specify what kind of feedback you're looking for.
- Mention how long the feedback process will take.
- Maintain the specified tone.
- Adhere to the desired length.
- Include a clear Call to Action.
- Sign off appropriately.
- Write in [language] ([accent] accent, if applicable).
**Output Format:**
For each variation, provide the output strictly in the following format, with no extra text or explanations before or after each variation block:

Variation [variation number]:
Subject: [Generated Subject Line]
Body:
[Generated Email Body, including sender name, position, and company if provided in the signature]

--- End Variation [variation number] ---

---
Example (Do not include this example in the final output):
Variation 1:
Subject: Following Up on Our Meeting
Body:
Hi [Recipient Name],

It was great connecting with you yesterday...
[Rest of the email body]

Best regards,
[Sender Name]
[Sender Position, if provided]
[Company Name, if provided]
--- End Variation 1 ---
---`;
export const welcome_PROMPT =`Generate [numberOfVariations] welcome email(s) based on the following details:

**Email Type:** Welcome Email
**Recipient Context:** [recipientContext] (e.g., New user/subscriber, New customer, New employee)
**Main Objective:** [objective] (e.g., Welcome and express appreciation, Set expectations, Guide next steps, Provide key resources/links)
**Key Information/Points to Include:**
[keyInfo] (e.g., Confirmation of signup/purchase/joining, Brief overview of what to expect, Links to getting started guides/tutorials/important docs, Contact info for support)
**Desired Tone:** [tone] (e.g., Friendly, Enthusiastic, Helpful, Informative)
**Desired Length:** [length]
**Language:** [language] ([accent], if applicable)
**Call to Action (Optional):** [callToAction] (e.g., Complete your profile, Check out this feature, Join our community, Schedule onboarding)
**Sender Name (Optional):** [senderName] (e.g., CEO, Founder, The Team at [Company])
**Sender Position (Optional):** [senderPosition]
**Company Name (Optional):** [companyName]

Instructions:
- Craft a warm and welcoming subject line (e.g., "Welcome to [Product/Company]!", "Getting Started with [Service]").
- Express genuine appreciation for the recipient joining/signing up.
- Briefly reiterate the value proposition or what they've signed up for.
- Provide clear next steps or essential information to get started.
- Include links to important resources.
- Maintain an engaging and helpful tone.
- Adhere to the desired length.
- Include a primary Call to Action to encourage engagement.
- Sign off warmly.
- Write in [language] ([accent] accent, if applicable).
**Output Format:**
For each variation, provide the output strictly in the following format, with no extra text or explanations before or after each variation block:

Variation [variation number]:
Subject: [Generated Subject Line]
Body:
[Generated Email Body, including sender name, position, and company if provided in the signature]

--- End Variation [variation number] ---

---
Example (Do not include this example in the final output):
Variation 1:
Subject: Following Up on Our Meeting
Body:
Hi [Recipient Name],

It was great connecting with you yesterday...
[Rest of the email body]

Best regards,
[Sender Name]
[Sender Position, if provided]
[Company Name, if provided]
--- End Variation 1 ---
---`;
export const internal_announcement_PROMPT =`Generate [numberOfVariations] internal announcement email(s) based on the following details:

**Email Type:** Internal Announcement
**Recipient Context:** [recipientContext] (e.g., All employees, Specific department, Project team)
**Main Objective:** [objective] (e.g., Announce company news/changes, Share project updates, Announce an internal event, Communicate policy updates)
**Key Information/Points to Include:**
[keyInfo] (e.g., The core announcement, Effective date, Reasons for change (if applicable), Required actions (if any), Contact person for questions)
**Desired Tone:** [tone] (e.g., Professional, Formal, Informative, Enthusiastic (for positive news))
**Desired Length:** [length]
**Language:** [language] ([accent], if applicable)
**Call to Action (Optional):** [callToAction] (e.g., Register for event, Read full policy document, Contact [person/dept] with questions)
**Sender Name (Optional):** [senderName] (e.g., CEO, HR Department, Project Lead)
**Sender Position (Optional):** [senderPosition]
**Company Name (Optional):** [companyName]

Instructions:
- Craft a clear and informative subject line stating the announcement's topic (e.g., "Important Update: New WFH Policy", "Team Update: Project Alpha Launch").
- Get straight to the point with the main announcement.
- Provide necessary context, details, and dates.
- Clearly outline any actions required from the recipients.
- Specify who to contact for questions.
- Maintain the appropriate internal tone.
- Adhere to the desired length.
- Include a clear Call to Action if applicable.
- Sign off from the appropriate sender/department.
- Write in [language] ([accent] accent, if applicable).
**Output Format:**
For each variation, provide the output strictly in the following format, with no extra text or explanations before or after each variation block:

Variation [variation number]:
Subject: [Generated Subject Line]
Body:
[Generated Email Body, including sender name, position, and company if provided in the signature]

--- End Variation [variation number] ---

---
Example (Do not include this example in the final output):
Variation 1:
Subject: Following Up on Our Meeting
Body:
Hi [Recipient Name],

It was great connecting with you yesterday...
[Rest of the email body]

Best regards,
[Sender Name]
[Sender Position, if provided]
[Company Name, if provided]
--- End Variation 1 ---
---`;
export const inquiry_response_PROMPT =`Generate [numberOfVariations] inquiry response email(s) based on the following details:

**Email Type:** Inquiry Response
**Recipient Context:** [recipientContext] (e.g., Potential customer asking about pricing, User asking for support, Person requesting information)
**Main Objective:** [objective] (e.g., Answer questions accurately, Provide requested information, Guide user to resources, Schedule a follow-up call)
**Key Information/Points to Include:**
[keyInfo] (e.g., Reference the original inquiry, Direct answers to questions, Links to relevant resources/documentation, Additional helpful context)
**Desired Tone:** [tone] (e.g., Helpful, Professional, Clear, Friendly)
**Desired Length:** [length]
**Language:** [language] ([accent], if applicable)
**Call to Action (Optional):** [callToAction] (e.g., Ask if further questions, Invite to a demo, Point to support channels)
**Sender Name (Optional):** [senderName]
**Sender Position (Optional):** [senderPosition]
**Company Name (Optional):** [companyName]

Instructions:
- Craft a subject line that references the original inquiry (e.g., "Re: Your Question About X", "Information Regarding Your Inquiry").
- Acknowledge receipt of the inquiry.
- Provide clear, accurate, and concise answers to the questions asked.
- Structure the information logically, using bullet points or numbering if helpful.
- Include any additional relevant information or links.
- Maintain the specified helpful and professional tone.
- Adhere to the desired length.
- Offer further assistance or include a relevant Call to Action.
- Sign off with sender/company details.
- Write in [language] ([accent] accent, if applicable).
**Output Format:**
For each variation, provide the output strictly in the following format, with no extra text or explanations before or after each variation block:

Variation [variation number]:
Subject: [Generated Subject Line]
Body:
[Generated Email Body, including sender name, position, and company if provided in the signature]

--- End Variation [variation number] ---

---
Example (Do not include this example in the final output):
Variation 1:
Subject: Following Up on Our Meeting
Body:
Hi [Recipient Name],

It was great connecting with you yesterday...
[Rest of the email body]

Best regards,
[Sender Name]
[Sender Position, if provided]
[Company Name, if provided]
--- End Variation 1 ---
---`;
export const apology_PROMPT =`Generate [numberOfVariations] apology email(s) based on the following details:

**Email Type:** Apology
**Recipient Context:** [recipientContext] (e.g., Customer experiencing an issue, Colleague affected by mistake, Missed deadline recipient)
**Main Objective:** [objective] (e.g., Apologize for an error/issue, Explain the situation, Offer resolution, Rebuild trust)
**Key Information/Points to Include:**
[keyInfo] (e.g., Specific issue being apologized for, Acknowledgment of impact, Explanation (brief, if appropriate), Steps taken/proposed for resolution)
**Desired Tone:** [tone] (e.g., Empathetic, Sincere, Professional, Regretful)
**Desired Length:** [length]
**Language:** [language] ([accent], if applicable)
**Call to Action (Optional):** [callToAction] (e.g., Offer direct contact for follow-up, Confirm resolution acceptance, Provide tracking info)
**Sender Name (Optional):** [senderName]
**Sender Position (Optional):** [senderPosition]
**Company Name (Optional):** [companyName]

Instructions:
- Craft a subject line that clearly indicates an apology or addresses the issue (e.g., "Regarding Order #123", "Apology for the inconvenience").
- State the apology clearly and take responsibility where appropriate.
- Acknowledge the recipient's frustration or the impact of the issue.
- Briefly explain what happened (optional, avoid making excuses).
- Outline the resolution or next steps.
- Incorporate all key information.
- Ensure the tone is sincere and empathetic.
- Adhere to the desired length.
- Include a relevant Call to Action if needed for resolution.
- Sign off appropriately.
- Write in [language] ([accent] accent, if applicable).
**Output Format:**
For each variation, provide the output strictly in the following format, with no extra text or explanations before or after each variation block:

Variation [variation number]:
Subject: [Generated Subject Line]
Body:
[Generated Email Body, including sender name, position, and company if provided in the signature]

--- End Variation [variation number] ---

---
Example (Do not include this example in the final output):
Variation 1:
Subject: Following Up on Our Meeting
Body:
Hi [Recipient Name],

It was great connecting with you yesterday...
[Rest of the email body]

Best regards,
[Sender Name]
[Sender Position, if provided]
[Company Name, if provided]
--- End Variation 1 ---
---`;
export const thank_you_PROMPT =`Generate [numberOfVariations] thank you email(s) based on the following details:

**Email Type:** Thank You
**Recipient Context:** [recipientContext] (e.g., After a purchase, After attending an event, After an interview, After receiving help/feedback)
**Main Objective:** [objective] (e.g., Express gratitude, Reinforce relationship, Provide next steps, Request feedback)
**Key Information/Points to Include:**
[keyInfo] (e.g., Specific reason for thanks, Mention a positive aspect of the interaction, Reference order/event details if applicable)
**Desired Tone:** [tone] (e.g., Sincere, Friendly, Professional, Appreciative)
**Desired Length:** [length] (Often short to medium)
**Language:** [language] ([accent], if applicable)
**Call to Action (Optional):** [callToAction] (e.g., Ask for a review, Invite to connect on LinkedIn, Mention future contact)
**Sender Name (Optional):** [senderName]
**Sender Position (Optional):** [senderPosition]
**Company Name (Optional):** [companyName]

Instructions:
- Craft a simple and clear subject line indicating thanks.
- Express gratitude sincerely and specifically.
- Reference the context clearly.
- Incorporate any other key points mentioned.
- Maintain the specified tone.
- Adhere to the desired length.
- Include a subtle Call to Action if appropriate, but prioritize the 'thank you'.
- Sign off warmly/professionally.
- Write in [language] ([accent] accent, if applicable).
**Output Format:**
For each variation, provide the output strictly in the following format, with no extra text or explanations before or after each variation block:

Variation [variation number]:
Subject: [Generated Subject Line]
Body:
[Generated Email Body, including sender name, position, and company if provided in the signature]

--- End Variation [variation number] ---

---
Example (Do not include this example in the final output):
Variation 1:
Subject: Following Up on Our Meeting
Body:
Hi [Recipient Name],

It was great connecting with you yesterday...
[Rest of the email body]

Best regards,
[Sender Name]
[Sender Position, if provided]
[Company Name, if provided]
--- End Variation 1 ---
---`;
export const newsletter_PROMPT =`Generate [numberOfVariations] newsletter snippet(s) based on the following details:

**Email Type:** Newsletter Snippet
**Recipient Context:** [recipientContext] (e.g., Newsletter subscribers, Community members)
**Main Objective:** [objective] (e.g., Share blog post summary, Announce company news, Highlight upcoming event, Provide industry insight)
**Key Information/Points to Include:**
[keyInfo] (e.g., Main topic/headline, Key takeaways or summary points, Link to full content/resource)
**Desired Tone:** [tone] (e.g., Informative, Engaging, Friendly, Enthusiastic)
**Desired Length:** [length] (Usually short to medium per snippet)
**Language:** [language] ([accent], if applicable)
**Call to Action (Optional):** [callToAction] (e.g., Read More, Register Now, View Details)
**Sender Name (Optional):** [senderName] (Often the company/publication name)
**Sender Position (Optional):** [senderPosition]
**Company Name (Optional):** [companyName]

Instructions:
- Craft an engaging headline/subject for the snippet (or assume it's part of a larger newsletter).
- Summarize the key information concisely and compellingly.
- Make it clear what the snippet is about and why the reader should care.
- Ensure the tone matches the overall newsletter style.
- Adhere to the desired length for a snippet.
- Include a clear Call to Action, usually linking to more details.
- Write in [language] ([accent] accent, if applicable).
*Note: This generates the content for one section/snippet within a larger newsletter.*
**Output Format:**
For each variation, provide the output strictly in the following format, with no extra text or explanations before or after each variation block:

Variation [variation number]:
Subject: [Generated Subject Line]
Body:
[Generated Email Body, including sender name, position, and company if provided in the signature]

--- End Variation [variation number] ---

---
Example (Do not include this example in the final output):
Variation 1:
Subject: Following Up on Our Meeting
Body:
Hi [Recipient Name],

It was great connecting with you yesterday...
[Rest of the email body]

Best regards,
[Sender Name]
[Sender Position, if provided]
[Company Name, if provided]
--- End Variation 1 ---
---`;
export const cold_outreach_PROMPT =`Generate [numberOfVariations] cold outreach email(s) based on the following details:

**Email Type:** Cold Outreach
**Recipient Context:** [recipientContext] (e.g., Potential client in X industry, Hiring manager for Y role, Potential partner)
**Main Objective:** [objective] (e.g., Schedule an introductory call, Introduce product/service, Explore partnership, Request information)
**Key Information/Points to Include:**
[keyInfo] (e.g., Reason for reaching out, Brief intro of sender/company, Value proposition relevant to recipient, Specific question or request)
**Desired Tone:** [tone] (e.g., Professional, Concise, Persuasive, Respectful)
**Desired Length:** [length] (Often short to medium)
**Language:** [language] ([accent], if applicable)
**Call to Action (Optional):** [callToAction] (e.g., Ask for a brief call, Suggest sharing more info, Ask a relevant question)
**Sender Name (Optional):** [senderName]
**Sender Position (Optional):** [senderPosition]
**Company Name (Optional):** [companyName]

Instructions:
- Craft a personalized and intriguing subject line to maximize open rates.
- Briefly explain why you are contacting *this specific* recipient.
- Clearly articulate the value or opportunity for the recipient.
- Keep the email concise and focused.
- Incorporate key information smoothly.
- Maintain a professional and respectful tone.
- Adhere to the desired length.
- Include a low-friction Call to Action.
- Sign off with relevant sender details.
- Write in [language] ([accent] accent, if applicable).
**Output Format:**
For each variation, provide the output strictly in the following format, with no extra text or explanations before or after each variation block:

Variation [variation number]:
Subject: [Generated Subject Line]
Body:
[Generated Email Body, including sender name, position, and company if provided in the signature]

--- End Variation [variation number] ---

---
Example (Do not include this example in the final output):
Variation 1:
Subject: Following Up on Our Meeting
Body:
Hi [Recipient Name],

It was great connecting with you yesterday...
[Rest of the email body]

Best regards,
[Sender Name]
[Sender Position, if provided]
[Company Name, if provided]
--- End Variation 1 ---
---`;
export const follow_up_PROMPT =`Generate [numberOfVariations] follow-up email(s) based on the following details:

**Email Type:** Follow-up
**Recipient Context:** [recipientContext] (e.g., After a meeting, After sending a proposal, After no response to previous email)
**Main Objective:** [objective] (e.g., Schedule a meeting/call, Request information, Nudge for a decision, Reiterate value)
**Key Information/Points to Include:**
[keyInfo] (e.g., Reference previous interaction/date, Key discussion points, Next steps proposed, Question needing answer)
**Desired Tone:** [tone] (e.g., Professional, Friendly, Concise, Helpful)
**Desired Length:** [length]
**Language:** [language] ([accent], if applicable)
**Call to Action (Optional):** [callToAction] (e.g., Suggest specific times to talk, Ask for feedback, Request confirmation)
**Sender Name (Optional):** [senderName]
**Sender Position (Optional):** [senderPosition]
**Company Name (Optional):** [companyName]

Instructions:
- Craft a clear subject line referencing the previous interaction or purpose of the follow-up.
- Briefly remind the recipient of the context.
- State the purpose of the follow-up clearly and concisely.
- Incorporate all key information.
- Maintain the specified tone.
- Adhere to the desired length (follow-ups are often best kept short).
- Include a clear Call to Action if applicable.
- Sign off professionally.
- Write in [language] ([accent] accent, if applicable).
**Output Format:**
For each variation, provide the output strictly in the following format, with no extra text or explanations before or after each variation block:

Variation [variation number]:
Subject: [Generated Subject Line]
Body:
[Generated Email Body, including sender name, position, and company if provided in the signature]

--- End Variation [variation number] ---

---
Example (Do not include this example in the final output):
Variation 1:
Subject: Following Up on Our Meeting
Body:
Hi [Recipient Name],

It was great connecting with you yesterday...
[Rest of the email body]

Best regards,
[Sender Name]
[Sender Position, if provided]
[Company Name, if provided]
--- End Variation 1 ---
---`;
export const marketing_PROMPT =`Generate [numberOfVariations] marketing/promotional email(s) based on the following details:

**Email Type:** Marketing/Promotion
**Recipient Context:** [recipientContext] (e.g., Existing customer, Newsletter subscriber, Lead from webinar)
**Main Objective:** [objective] (e.g., Promote a product/service, Announce a sale, Drive traffic to landing page)
**Key Information/Points to Include:**
[keyInfo] (e.g., Product features/benefits, Discount details, Offer deadline, Unique selling points)
**Desired Tone:** [tone] (e.g., Persuasive, Enthusiastic, Urgent)
**Desired Length:** [length]
**Language:** [language] ([accent], if applicable)
**Call to Action (Optional):** [callToAction] (e.g., Shop Now, Learn More, Register Here)
**Sender Name (Optional):** [senderName]
**Sender Position (Optional):** [senderPosition]
**Company Name (Optional):** [companyName]

Instructions:
- Craft a compelling subject line designed to grab attention and encourage opens.
- Write persuasive email body copy highlighting the value proposition and benefits.
- Clearly state the offer or promotion details.
- Incorporate all key information naturally.
- Ensure the tone is engaging and aligns with the marketing goal.
- Adhere to the desired length.
- Make the Call to Action clear, prominent, and easy to follow.
- Sign off appropriately, using sender/company details if provided.
- Write in [language] ([accent] accent, if applicable).
**Output Format:**
For each variation, provide the output strictly in the following format, with no extra text or explanations before or after each variation block:

Variation [variation number]:
Subject: [Generated Subject Line]
Body:
[Generated Email Body, using <h1>, <h2>, <h3> for headings, <p> for paragraphs, <s> for strikethrough text, and Font Awesome icons (e.g., <i class="fas fa-icon-name"></i> or <i class="fab fa-brand-name"></i>) where appropriate. Include sender name, position, and company if provided in the signature]

--- End Variation [variation number] ---

---
Example (Do not include this example in the final output):
Variation 1:
Subject: Following Up on Our Meeting
Body:
Hi [Recipient Name],

It was great connecting with you yesterday...
[Rest of the email body]
Add button CTA in the body use it with the same style
<p>
    <a style="background-color: #00d285; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;" href="https://hbs-group.xyz/contact" class="button-cta">S</a>
</p> 
Best regards,
[Sender Name]
[Sender Position, if provided]
[Company Name, if provided]

--- End Variation 1 ---
---`;
