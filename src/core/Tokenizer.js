class Tokenizer {
    constructor() {
        this.wordToId = {};
        this.idToWord = {};
        this.vocabSize = 0;
        this.specialTokens = { '<PAD>': 0, '<UNK>': 1, '<BOS>': 2, '<EOS>': 3 };
        this._initSpecialTokens();
    }

    _initSpecialTokens() {
        for (const [token, id] of Object.entries(this.specialTokens)) {
            this.wordToId[token] = id;
            this.idToWord[id] = token;
        }
        this.vocabSize = Object.keys(this.specialTokens).length;
    }

    train(texts, vocabSize = 10000) {
        const wordFreq = {};
        for (const item of texts) {
            const text = typeof item === 'object' ? (item.text || item.prompt || '') : String(item);
            const words = text.toLowerCase().replace(/[^\w\s]/g, ' ').split(/\s+/).filter(w => w.length > 0);
            for (const word of words) wordFreq[word] = (wordFreq[word] || 0) + 1;
        }
        const sorted = Object.entries(wordFreq).sort((a, b) => b[1] - a[1]).slice(0, vocabSize - this.vocabSize);
        for (const [word] of sorted) {
            if (!this.wordToId[word]) {
                this.wordToId[word] = this.vocabSize;
                this.idToWord[this.vocabSize] = word;
                this.vocabSize++;
            }
        }
        console.log(`[Tokenizer] Vocab: ${this.vocabSize} words`);
    }

    encode(text) { return [this.specialTokens['<BOS>'], ...text.toLowerCase().split(/\s+/).map(w => this.wordToId[w] || this.specialTokens['<UNK>']), this.specialTokens['<EOS>']]; }
    decode(ids) { return ids.map(id => this.idToWord[id]).filter(w => w && !w.startsWith('<')).join(' '); }

    save() { return { wordToId: this.wordToId, idToWord: this.idToWord, vocabSize: this.vocabSize }; }
    static load(config) {
        const t = new Tokenizer();
        t.wordToId = config.wordToId || {};
        t.idToWord = config.idToWord || {};
        t.vocabSize = config.vocabSize || 0;
        return t;
    }
}
module.exports = Tokenizer;
