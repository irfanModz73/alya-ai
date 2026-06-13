const Matrix = require('../utils/matrix');
const Activation = require('../utils/activation');

class MultiHeadAttention {
    constructor(dim, numHeads) {
        this.dim = dim;
        this.numHeads = numHeads;
        this.headDim = Math.floor(dim / numHeads);
        this.Wq = new Matrix(dim, dim, true);
        this.Wk = new Matrix(dim, dim, true);
        this.Wv = new Matrix(dim, dim, true);
        this.Wo = new Matrix(dim, dim, true);
    }

    forward(x) {
        const q = x.matmul(this.Wq);
        const k = x.matmul(this.Wk);
        const v = x.matmul(this.Wv);
        const scores = q.matmul(k.transpose());
        const scale = Math.sqrt(this.headDim);
        const scaled = scores.apply(s => s / scale);
        const attn = Activation.softmaxMatrix(scaled);
        return attn.matmul(v).matmul(this.Wo);
    }

    save() {
        return {
            type: 'MultiHeadAttention',
            dim: this.dim,
            numHeads: this.numHeads,
            Wq: this.Wq.save(),
            Wk: this.Wk.save(),
            Wv: this.Wv.save(),
            Wo: this.Wo.save()
        };
    }

    static load(config) {
        const attn = new MultiHeadAttention(config.dim, config.numHeads);
        attn.Wq = Matrix.load(config.Wq);
        attn.Wk = Matrix.load(config.Wk);
        attn.Wv = Matrix.load(config.Wv);
        attn.Wo = Matrix.load(config.Wo);
        return attn;
    }
}

module.exports = MultiHeadAttention;
