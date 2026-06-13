/**
 * DeepThink Layer - Chain-of-thought reasoning
 */
class DeepThink {
    constructor(dim, thinkSteps = 3) {
        this.dim = dim;
        this.thinkSteps = thinkSteps;
        this.reasoningChain = [];
        this.knowledgeGraph = new Map();
    }

    think(input, memory) {
        this.reasoningChain = [];
        let currentThought = input;
        
        const memMap = memory instanceof Map ? memory : new Map(Object.entries(memory || {}));
        
        for (let step = 0; step < this.thinkSteps; step++) {
            const analysis = this._analyze(currentThought, memMap);
            const connections = this._findConnections(analysis, memMap);
            const insight = this._generateInsight(analysis, connections);
            
            this.reasoningChain.push({
                step: step + 1,
                thought: currentThought,
                analysis: analysis,
                connections: connections,
                insight: insight
            });
            
            currentThought = insight.summary;
        }
        
        return this.reasoningChain;
    }

    _analyze(input, memory) {
        const words = input.toLowerCase().split(/\s+/);
        const keywords = [];
        const memMap = memory instanceof Map ? memory : new Map(Object.entries(memory || {}));
        
        for (const word of words) {
            if (memMap.has(word)) {
                const associations = memMap.get(word) || [];
                keywords.push({
                    word: word,
                    associations: Array.isArray(associations) ? associations.slice(0, 10) : [],
                    weight: Array.isArray(associations) ? associations.length : 1
                });
            }
        }
        
        return {
            original: input,
            words: words,
            keywords: keywords,
            sentiment: this._detectSentiment(words),
            intent: this._detectIntent(words),
            complexity: words.length > 5 ? 'high' : 'low'
        };
    }

    _findConnections(analysis, memory) {
        const connections = new Map();
        const memMap = memory instanceof Map ? memory : new Map(Object.entries(memory || {}));
        
        for (const kw of analysis.keywords) {
            const related = [];
            for (const [key, values] of memMap) {
                const vals = Array.isArray(values) ? values : [];
                if (vals.includes(kw.word)) related.push(key);
                if (kw.associations.includes(key)) related.push(key);
            }
            if (related.length > 0) {
                connections.set(kw.word, [...new Set(related)].slice(0, 5));
            }
        }
        
        return connections;
    }

    _generateInsight(analysis, connections) {
        const insights = [];
        
        if (analysis.keywords.length > 3) insights.push('multi_topic_detected');
        if (analysis.sentiment === 'negative') insights.push('user_may_be_upset');
        if (analysis.sentiment === 'positive') insights.push('user_is_happy');
        if (analysis.intent === 'question') insights.push('need_to_provide_answer');
        if (analysis.intent === 'greeting') insights.push('casual_conversation');
        if (connections.size > 0) insights.push('has_related_knowledge');
        if (insights.length === 0) insights.push('general_conversation');
        
        return {
            insights: insights,
            confidence: Math.min(0.9, insights.length * 0.2 + 0.3),
            summary: this._summarizeInsights(insights)
        };
    }

    _detectSentiment(words) {
        const positive = ['baik', 'senang', 'suka', 'keren', 'mantap', 'good', 'great', 'love', 'happy', 'thanks', 'terima', 'makasih', 'bahagia', 'asyik', 'gembira', 'cinta', 'indah', 'cerah'];
        const negative = ['sedih', 'buruk', 'jelek', 'marah', 'bosan', 'capek', 'lelah', 'bad', 'hate', 'sorry', 'maaf', 'kecewa', 'sakit', 'stress', 'sendiri', 'galau'];
        
        let pos = 0, neg = 0;
        for (const word of words) {
            if (positive.some(p => word.includes(p))) pos++;
            if (negative.some(n => word.includes(n))) neg++;
        }
        
        if (pos > neg) return 'positive';
        if (neg > pos) return 'negative';
        return 'neutral';
    }

    _detectIntent(words) {
        const questionWords = ['apa', 'siapa', 'bagaimana', 'kenapa', 'dimana', 'kapan', 'apakah', 'how', 'what', 'who', 'why', 'where', 'when', 'gimana', 'mengapa', 'berapa', 'bisa', 'kok'];
        const greetingWords = ['halo', 'hai', 'hi', 'pagi', 'siang', 'malam', 'hey', 'hello', 'assalamualaikum', 'selamat'];
        
        for (const word of words) {
            if (questionWords.some(q => word.includes(q))) return 'question';
            if (greetingWords.some(g => word.includes(g))) return 'greeting';
        }
        
        return 'statement';
    }

    _summarizeInsights(insights) {
        const labels = {
            'multi_topic_detected': 'Beberapa topik terdeteksi',
            'user_may_be_upset': 'User tampak sedih, beri empati',
            'user_is_happy': 'Percakapan positif, tetap ramah',
            'need_to_provide_answer': 'User bertanya, beri jawaban jelas',
            'casual_conversation': 'Obrolan santai',
            'has_related_knowledge': 'Ada informasi terkait',
            'general_conversation': 'Percakapan umum'
        };
        return insights.map(i => labels[i] || i).join('. ');
    }

    save() {
        return {
            type: 'DeepThink',
            dim: this.dim,
            thinkSteps: this.thinkSteps,
            knowledgeGraph: Array.from(this.knowledgeGraph.entries()).slice(0, 500)
        };
    }

    static load(config) {
        const think = new DeepThink(config.dim || 256, config.thinkSteps || 3);
        think.knowledgeGraph = new Map(config.knowledgeGraph || []);
        return think;
    }
}

module.exports = DeepThink;
