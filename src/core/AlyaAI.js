const fs = require('fs');
const path = require('path');
const CONFIG = require('../config');
const Embedding = require('../layers/Embedding');
const TransformerBlock = require('../layers/TransformerBlock');
const Dense = require('../layers/Dense');
const Tokenizer = require('./Tokenizer');

class AlyaAI {
    constructor(config = CONFIG) {
        this.config = config;
        this.tokenizer = new Tokenizer();
        this.embedding = new Embedding(config.architecture.vocabSize, config.architecture.embeddingDim);
        this.transformerBlocks = [];
        for (let i = 0; i < config.architecture.numLayers; i++) {
            this.transformerBlocks.push(new TransformerBlock(config.architecture.embeddingDim, config.architecture.numHeads, config.architecture.hiddenDim, config.architecture.dropout));
        }
        this.outputLayer = new Dense(config.architecture.embeddingDim, config.architecture.vocabSize, 'linear');
        this.isTrained = false;
        this.trainingMemory = {};
        this.qaMap = {};
        this.roleData = [];
    }

    async train(trainingData, epochs = null) {
        epochs = epochs || this.config.training.epochs;
        console.log(`\n[${this.config.model.name}] Training...`);
        this.tokenizer.train(trainingData, 10000);

        this.trainingMemory = {};
        this.qaMap = {};

        // Build memory dari semua teks
        const allTexts = [];
        for (const item of trainingData) {
            if (typeof item === 'object') {
                const text = item.text || item.prompt || '';
                const response = item.response || '';
                allTexts.push(text);
                allTexts.push(response);
                // Simpan QA pair
                if (text && response) {
                    const key = text.toLowerCase().trim();
                    if (!this.qaMap[key]) this.qaMap[key] = [];
                    this.qaMap[key].push(response);
                }
            } else {
                allTexts.push(String(item));
            }
        }

        for (const text of allTexts) {
            const words = String(text).toLowerCase().split(/\s+/).filter(w => w.length > 0);
            for (let j = 0; j < words.length - 1; j++) {
                const key = words[j];
                if (!this.trainingMemory[key]) this.trainingMemory[key] = [];
                this.trainingMemory[key].push(words[j + 1]);
            }
        }

        this.isTrained = true;
        console.log(`[+] Memory: ${Object.keys(this.trainingMemory).length} words, QA: ${Object.keys(this.qaMap).length} pairs`);
    }

    async chat(prompt) {
        if (!this.isTrained) return 'Model belum di-train.';
        const lower = prompt.toLowerCase().trim();

        // Exact QA match
        if (this.qaMap[lower]) return this.qaMap[lower][Math.floor(Math.random() * this.qaMap[lower].length)];

        // Partial QA match
        for (const [q, responses] of Object.entries(this.qaMap)) {
            if (q.length > 5 && (lower.includes(q) || q.includes(lower))) {
                return responses[Math.floor(Math.random() * responses.length)];
            }
        }

        // Generate
        const words = lower.split(/\s+/);
        let current = words[words.length - 1];
        const generated = [], used = new Set();
        for (let i = 0; i < 30; i++) {
            const candidates = this.trainingMemory[current];
            if (!candidates || !candidates.length) break;
            const next = candidates.filter(c => !used.has(c));
            const pick = next.length > 0 ? next[Math.floor(Math.random() * next.length)] : candidates[Math.floor(Math.random() * candidates.length)];
            if (used.has(pick) && generated.length > 5) break;
            used.add(pick);
            generated.push(pick);
            current = pick;
        }
        return generated.join(' ') || 'Maaf, aku belum mengerti.';
    }

    save(filepath = null) {
        const savePath = filepath || this.config.paths.savePath;
        const dir = path.dirname(savePath);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        const data = {
            config: this.config,
            tokenizer: this.tokenizer.save(),
            isTrained: this.isTrained,
            trainingMemory: Object.fromEntries(Object.entries(this.trainingMemory).map(([k, v]) => [k, [...new Set(v)].slice(0, 30)])),
            qaMap: Object.fromEntries(Object.entries(this.qaMap).map(([k, v]) => [k, v.slice(0, 3)])),
            savedAt: new Date().toISOString()
        };
        fs.writeFileSync(savePath, JSON.stringify(data));
        console.log(`[+] Saved: ${(fs.statSync(savePath).size / 1024).toFixed(1)} KB`);
    }

    static load(filepath) {
        const data = JSON.parse(fs.readFileSync(filepath, 'utf8'));
        const model = new AlyaAI(data.config);
        model.tokenizer = Tokenizer.load(data.tokenizer || {});
        model.isTrained = data.isTrained;
        model.trainingMemory = data.trainingMemory || {};
        model.qaMap = data.qaMap || {};
        return model;
    }
}
module.exports = AlyaAI;
