const MultiHeadAttention = require('./Attention');
const Dense = require('./Dense');

class TransformerBlock {
    constructor(dim, numHeads, ffDim, dropout = 0.1) {
        this.dim = dim;
        this.dropout = dropout;
        this.attention = new MultiHeadAttention(dim, numHeads);
        this.ln1 = new Dense(dim, dim, 'linear');
        this.ln2 = new Dense(dim, dim, 'linear');
        this.ff1 = new Dense(dim, ffDim, 'gelu');
        this.ff2 = new Dense(ffDim, dim, 'linear');
    }

    forward(x) {
        let attnOutput = this.attention.forward(x);
        let x1 = x.add(attnOutput);
        x1 = this.ln1.forward(x1);
        let ffOutput = this.ff1.forward(x1);
        ffOutput = this.ff2.forward(ffOutput);
        let x2 = x1.add(ffOutput);
        x2 = this.ln2.forward(x2);
        return x2;
    }

    save() {
        return {
            type: 'TransformerBlock',
            dim: this.dim,
            dropout: this.dropout,
            attention: this.attention.save(),
            ln1: this.ln1.save(),
            ln2: this.ln2.save(),
            ff1: this.ff1.save(),
            ff2: this.ff2.save()
        };
    }

    static load(config) {
        const block = new TransformerBlock(config.dim, config.attention.numHeads, config.ff1.outputSize, config.dropout);
        block.attention = MultiHeadAttention.load(config.attention);
        block.ln1 = Dense.load(config.ln1);
        block.ln2 = Dense.load(config.ln2);
        block.ff1 = Dense.load(config.ff1);
        block.ff2 = Dense.load(config.ff2);
        return block;
    }
}

module.exports = TransformerBlock;
