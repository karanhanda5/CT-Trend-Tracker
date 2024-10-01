
const cryptoInfluencers = [
    "CryptoCobain", "TheBlock__", "Uniswap", "VitalikButerin", "SBF_FTX"
];

// Function to fetch tweets from Crypto Twitter influencers
async function fetchCryptoTweets() {
    let tweetsData = [];

    for (const account of cryptoInfluencers) {
        const response = await fetch(`https://api.twitter.com/2/tweets/search/recent?query=from:${account}&tweet.fields=public_metrics`, {
            headers: {
                "Authorization": `AAAAAAAAAAAAAAAAAAAAAHZ6wAEAAAAA6%2FENAkLm%2Bu7WBj3%2B4sgggWBuhV4%3D82zfvmd4JLL1vV9SV8VpY55NrLyDElC9PsLSXTtg3RhpPQQyd1`
            }
        });

        const data = await response.json();
        if (data && data.data) {
            tweetsData = tweetsData.concat(data.data);
        }
    }

    return tweetsData;
}

// Sentiment analysis
function analyzeSentiment(text) {
    const positiveWords = ["good", "great", "amazing", "awesome", "positive", "profit", "win"];
    const negativeWords = ["bad", "terrible", "loss", "negative", "fail", "fear", "dump"];

    let score = 0;
    positiveWords.forEach(word => {
        if (text.includes(word)) {
            score++;
        }
    });

    negativeWords.forEach(word => {
        if (text.includes(word)) {
            score--;
        }
    });

    if (score > 0) return "Positive";
    if (score < 0) return "Negative";
    return "Neutral";
}

// Extract keywords and track trends
function extractEmergingKeywords(tweets) {
    const wordFrequency = {};
    const ignoreWords = ["the", "and", "to", "is", "in", "for", "of", "#Crypto", "#DeFi", "#NFT"];

    tweets.forEach(tweet => {
        const words = tweet.text.split(/\W+/);
        words.forEach(word => {
            const lowerWord = word.toLowerCase();
            if (!ignoreWords.includes(lowerWord)) {
                wordFrequency[lowerWord] = (wordFrequency[lowerWord] || 0) + 1;
            }
        });
    });

    const sortedWords = Object.keys(wordFrequency).sort((a, b) => wordFrequency[b] - wordFrequency[a]);
    return sortedWords.slice(0, 10); // Top 10 keywords
}

// Track trends and store data
async function trackCryptoTrends() {
    const tweets = await fetchCryptoTweets();
    const emergingKeywords = extractEmergingKeywords(tweets);
    const now = new Date().getTime();

    const trendingData = emergingKeywords.map(keyword => {
        const totalMentions = tweets.filter(tweet => tweet.text.includes(keyword)).length;
        const engagement = tweets.reduce((sum, tweet) => tweet.text.includes(keyword) ? sum + tweet.public_metrics.like_count + tweet.public_metrics.retweet_count : sum, 0);

        const sentiments = tweets.filter(tweet => tweet.text.includes(keyword)).map(tweet => analyzeSentiment(tweet.text));
        const sentimentScore = sentiments.reduce((acc, sentiment) => acc + (sentiment === "Positive" ? 1 : (sentiment === "Negative" ? -1 : 0)), 0);
        const sentiment = sentimentScore > 0 ? "Positive" : sentimentScore < 0 ? "Negative" : "Neutral";

        return { keyword, totalMentions, engagement, sentiment, timestamp: now };
    });

    // Store data in local storage
    chrome.storage.local.get(["trendingData"], (result) => {
        const existingData = result.trendingData || [];
        const updatedData = existingData.concat(trendingData);
        chrome.storage.local.set({ trendingData: updatedData });
    });

    // Trigger real-time notifications if a keyword gains significant traction
    trendingData.forEach(trend => {
        if (trend.engagement > 1000) { // Example threshold
            chrome.notifications.create({
                type: 'basic',
                iconUrl: 'icons/icon48.png',
                title: 'New Crypto Trend!',
                message: `Keyword "${trend.keyword}" is trending with ${trend.engagement} engagements.`
            });
        }
    });
}

// Fetch trends every 30 minutes
chrome.alarms.create('fetchTrends', { periodInMinutes: 30 });
chrome.alarms.onAlarm.addListener(() => {
    trackCryptoTrends();
});

