const { GoogleGenerativeAI } = require("@google/generative-ai");
const Blog = require("../models/Blog");

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "YOUR_API_KEY_HERE");

const aiService = {
    /**
     * Generate a new AI Blog Post
     */
    generateTrendingPost: async () => {
        try {
            if (!process.env.GEMINI_API_KEY) {
                console.log("Skipping AI generation: No GEMINI_API_KEY found.");
                return;
            }

            const model = genAI.getGenerativeModel({ model: "gemini-pro" });

            // 1. Generate a Trending Topic
            const promptTopic = "Generate one catchy, trending, and creative blog post topic title regarding Technology, Lifestyle, or Future. Just the title.";
            const resultTopic = await model.generateContent(promptTopic);
            const title = resultTopic.response.text().replace(/['"]/g, "").trim();

            console.log("AI Generated Topic:", title);

            // 2. Generate Content
            const promptContent = `Write a creative, engaging, and thought-provoking blog post about "${title}". 
            It should be around 300-400 words. 
            Format the output with HTML tags (e.g., <p>, <h3>) but NO markdown code blocks (\`\`\`).
            Don't include the title in the body.`;

            const resultContent = await model.generateContent(promptContent);
            const content = resultContent.response.text();

            // 3. Generate Image (Using Pollinations.ai for free AI images)
            // Encode title for URL
            const safeTitle = encodeURIComponent(title);
            const imageUrl = `https://image.pollinations.ai/prompt/${safeTitle}?width=800&height=600&nologo=true`;

            // 4. Cleanup Old AI Blogs (Keep only latest 5 to avoid DB bloat)
            const aiBlogCount = await Blog.countDocuments({ isAiGenerated: true });
            if (aiBlogCount >= 5) {
                const oldestAiBlogs = await Blog.find({ isAiGenerated: true })
                    .sort({ createdAt: 1 })
                    .limit(aiBlogCount - 4); // Keep 4, allow space for 1 new

                await Blog.deleteMany({ _id: { $in: oldestAiBlogs.map(b => b._id) } });
            }

            // 5. Save to Database
            const newBlog = new Blog({
                title: title,
                content: content,
                author: "AI Trending",
                thumbnail: imageUrl,
                date: Date.now(),
                isAiGenerated: true,
                like: Math.floor(Math.random() * 100) + 50 // Trending posts usually have high likes
            });

            await newBlog.save();
            console.log("AI Blog Created:", title);
            return newBlog;

        } catch (error) {
            console.error("AI Generation Error:", error);
        }
    }
};

module.exports = aiService;
