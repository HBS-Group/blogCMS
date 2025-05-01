export const SOCIAL_POST_PROMPT = `# Professional Prompt for Generating Social Media Posts

Generate **[insert number]** high-quality social media posts for **[insert platform name]**. Each post must:

- Be written in a **[insert tone: e.g., professional, friendly, witty, motivational, informative]** tone.
- Be written in **[insert language]**.
- Use the **[insert accent]** accent if specified.
- Maintain a **[insert length: e.g., short (under 100 words), medium (100–150 words), or long (150–200 words)]** post structure, respecting platform limits (e.g., Twitter character count).
- Be specifically tailored to the best practices and typical content style of **[insert platform name]**. (e.g., visual focus for Instagram, professional for LinkedIn, concise for Twitter).
- Include **1-3 relevant emojis** that enhance the message without overuse.
- Focus on the topic: **[insert topic, e.g., digital wellness, product education, sustainable fashion, etc.]**.
- **Actively encourage interaction**: Include elements like questions or prompts for comments. If a specific call to action is provided below, prioritize incorporating that.
- **Specific Call to Action (Optional):** If provided, include or strongly reference this CTA: **[insert specific call to action]**.
- **Target Audience Focus (Optional but Recommended):** Consider tailoring the post for [insert target audience, e.g., small business owners, students, tech enthusiasts].

**Output Format:**
1.  Provide the generated posts as a numbered list (e.g., '1. Post content...').
2.  After the posts, provide a list of 5-7 relevant hashtags under a heading like "Suggested Hashtags:".
    - **Hashtag Style:** Generate hashtags according to the specified style: **[insert hashtag style: e.g., trending, niche, mixed]**. If no style is specified, provide a mix.
    - **Hashtag Format Example:** Ensure hashtags are listed plainly under the heading, like this:
      '''
      Suggested Hashtags:
      #ExampleTag1
      #AnotherTag
      #NicheHashtag
      '''
      Avoid using list markers like '*' or '-' before the hashtags.

Ensure that each post is engaging, platform-optimized, and crafted to encourage interaction (likes, shares, saves, or comments) from the target audience. Avoid generic statements and aim for unique, valuable content in each post.

**Output Format:**
1.  Numbered list of 5 posts.
2.  List of 3 hashtags under "Suggested Hashtags:" (formatted as shown in the main instructions).

`;