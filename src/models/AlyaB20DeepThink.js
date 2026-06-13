const fs = require('fs');
const path = require('path');
const AlyaAI = require('../core/AlyaAI');
const DeepThink = require('../layers/DeepThink');
const CONFIG = require('../config');

class AlyaB20DeepThink extends AlyaAI {
    constructor(config = null) {
        const deepConfig = config || {
            ...CONFIG,
            model: { name: 'ALYA-B20-DEEPTHINK', version: '1.0.0', author: 'irfan', parameters: 25000000 },
            architecture: { ...CONFIG.architecture, thinkSteps: 4, memorySize: 10000 }
        };
        super(deepConfig);
        this.deepThink = new DeepThink(deepConfig.architecture.embeddingDim, deepConfig.architecture.thinkSteps || 4);
        this.conversationContext = [];
        this.jsSnippets = {};
        this.knowledgeBase = { 
            facts: new Map(), 
            patterns: new Map(),
            userProfile: { name: 'guest', preferences: {}, history: [] }
        };
    }

    async train(trainingData, epochs = null) {
        epochs = epochs || this.config.training.epochs;
        console.log(`\n[${this.config.model.name}] Deep Training...`);
        console.log(`[Model] Data: ${trainingData.length} samples\n`);

        // Build all texts
        const allTexts = [];
        this.qaMap = {};
        this.jsSnippets = {};

        for (const item of trainingData) {
            if (typeof item === 'object') {
                const text = (item.text || item.prompt || '').toLowerCase().trim();
                const response = item.response || '';
                
                if (text && response) {
                    allTexts.push(text);
                    allTexts.push(response);
                    
                    // QA Map
                    if (!this.qaMap[text]) this.qaMap[text] = [];
                    this.qaMap[text].push(response);

                    // JS Snippets
                    if (text.includes('buat') || text.includes('contoh') || text.includes('function') || text.includes('code')) {
                        if (!this.jsSnippets[text]) this.jsSnippets[text] = [];
                        this.jsSnippets[text].push({ code: response, explanation: item.explanation || '' });
                    }
                }
            } else {
                allTexts.push(String(item).toLowerCase());
            }
        }

        // Train tokenizer & memory
        this.tokenizer.train(allTexts, 10000);
        this.trainingMemory = {};

        for (const text of allTexts) {
            const words = text.split(/\s+/).filter(w => w.length > 0);
            for (let j = 0; j < words.length - 1; j++) {
                if (!this.trainingMemory[words[j]]) this.trainingMemory[words[j]] = [];
                this.trainingMemory[words[j]].push(words[j + 1]);
            }
        }

        this.isTrained = true;
        console.log(`[+] Memory: ${Object.keys(this.trainingMemory).length} words`);
        console.log(`[+] QA Map: ${Object.keys(this.qaMap).length} pairs`);
        console.log(`[+] JS Snippets: ${Object.keys(this.jsSnippets).length} functions`);
    }

    async chat(prompt, options = {}) {
        if (!this.isTrained) return 'Model belum di-train.';
        if (!prompt || !prompt.trim()) return 'Silakan ketik sesuatu.';

        const thinkMode = options.thinkMode !== false;
        if (!thinkMode) return super.chat(prompt);

        return this._deepChat(prompt, options);
    }

    async _deepChat(prompt, options = {}) {
        const lower = prompt.toLowerCase().trim();

        // 1. Run DeepThink reasoning
        const memMap = new Map(Object.entries(this.trainingMemory || {}));
        this.deepThink.think(prompt, memMap);

        // 2. Exact QA match
        if (this.qaMap[lower]) {
            return this.qaMap[lower][Math.floor(Math.random() * this.qaMap[lower].length)];
        }

        // 3. Partial QA match
        for (const [q, responses] of Object.entries(this.qaMap)) {
            if (q.length > 5 && (lower.includes(q) || q.includes(lower))) {
                return responses[Math.floor(Math.random() * responses.length)];
            }
        }

        // 4. Coding request
        const codeKeywords = ['buat', 'tulis', 'generate', 'bikinin', 'contoh', 'kode', 'script', 'function', 'javascript', 'js', 'coding', 'bikin'];
        const isCoding = codeKeywords.some(k => lower.includes(k));
        
        if (isCoding && Object.keys(this.jsSnippets).length > 0) {
            for (const [key, snippets] of Object.entries(this.jsSnippets)) {
                const matchCount = key.split(/\s+/).filter(w => w.length > 2 && lower.includes(w)).length;
                if (matchCount >= 2) {
                    return snippets[Math.floor(Math.random() * snippets.length)].code;
                }
            }
            // Random snippet
            const keys = Object.keys(this.jsSnippets);
            const randomKey = keys[Math.floor(Math.random() * keys.length)];
            return this.jsSnippets[randomKey][0].code;
        }

        // 5. Generate from memory
        const words = lower.split(/\s+/);
        let current = words[words.length - 1];
        const generated = [];
        const used = new Set();

        for (let i = 0; i < 30; i++) {
            const candidates = this.trainingMemory[current];
            if (!candidates || candidates.length === 0) break;
            const next = candidates.filter(c => !used.has(c));
            const pick = next.length > 0 ? next[Math.floor(Math.random() * next.length)] : candidates[Math.floor(Math.random() * candidates.length)];
            if (used.has(pick) && generated.length > 5) break;
            used.add(pick);
            generated.push(pick);
            current = pick;
        }

        const response = generated.join(' ') || 'Maaf, aku belum mengerti.';

        // Store context
        this.conversationContext.push({ user: prompt, bot: response, timestamp: Date.now() });
        if (this.conversationContext.length > 50) this.conversationContext = this.conversationContext.slice(-50);
        
        this._updateUserProfile(prompt);

        return response;
    }

    _updateUserProfile(prompt) {
        if (!this.knowledgeBase.userProfile) this.knowledgeBase.userProfile = { name: 'guest', history: [] };
        const words = prompt.toLowerCase().split(/\s+/);
        if (words.includes('nama') && words.includes('saya')) {
            const idx = words.indexOf('saya') + 1;
            if (idx < words.length && words[idx].length > 2) {
                this.knowledgeBase.userProfile.name = words[idx];
            }
        }
        this.knowledgeBase.userProfile.history.push({ prompt, time: Date.now() });
        if (this.knowledgeBase.userProfile.history.length > 100) {
            this.knowledgeBase.userProfile.history = this.knowledgeBase.userProfile.history.slice(-100);
        }
    }

    showThinking() {
        if (!this.deepThink?.reasoningChain?.length) return '(no active thinking)';
        return this.deepThink.reasoningChain;
    }

    save(filepath = null) {
        const savePath = filepath || './models/alya-b20-deepthink.json';
        if (!fs.existsSync(path.dirname(savePath))) fs.mkdirSync(path.dirname(savePath), { recursive: true });
        const data = {
            config: this.config,
            tokenizer: this.tokenizer.save(),
            isTrained: this.isTrained,
            trainingMemory: Object.fromEntries(Object.entries(this.trainingMemory).map(([k, v]) => [k, [...new Set(v)].slice(0, 30)])),
            qaMap: Object.fromEntries(Object.entries(this.qaMap).map(([k, v]) => [k, v.slice(0, 3)])),
            jsSnippets: Object.fromEntries(Object.entries(this.jsSnippets).map(([k, v]) => [k, v.slice(0, 2)])),
            deepThink: this.deepThink.save(),
            conversationContext: (this.conversationContext || []).slice(-20),
            knowledgeBase: { userProfile: this.knowledgeBase?.userProfile || { name: 'guest', history: [] } },
            savedAt: new Date().toISOString()
        };
        fs.writeFileSync(savePath, JSON.stringify(data, null, 2));
        console.log(`[+] Saved: ${(fs.statSync(savePath).size / 1024).toFixed(1)} KB`);
    }

    static load(filepath) {
        const data = JSON.parse(fs.readFileSync(filepath, 'utf8'));
        const model = new AlyaB20DeepThink(data.config);
        model.tokenizer = require('../core/Tokenizer').load(data.tokenizer || {});
        model.isTrained = data.isTrained;
        model.trainingMemory = data.trainingMemory || {};
        model.qaMap = data.qaMap || {};
        model.jsSnippets = data.jsSnippets || {};
        model.deepThink = DeepThink.load(data.deepThink || { dim: 256, thinkSteps: 4 });
        model.conversationContext = data.conversationContext || [];
        model.knowledgeBase = data.knowledgeBase || { userProfile: { name: 'guest', history: [] } };
        if (!model.knowledgeBase.userProfile) model.knowledgeBase.userProfile = { name: 'guest', history: [] };
        console.log(`[+] Loaded: ${data.config.model.name}`);
        return model;
    }
}

module.exports = AlyaB20DeepThink;
