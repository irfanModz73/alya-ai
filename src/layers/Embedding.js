const Matrix = require('../utils/matrix');

class Embedding {
    constructor(vocabSize, embeddingDim) {
        this.vocabSize = vocabSize;
        this.embeddingDim = embeddingDim;
        this.weights = new Matrix(vocabSize, embeddingDim, true);
    }

    forward(tokenIds) {
        const result = new Matrix(tokenIds.length, this.embeddingDim);
        for (let i = 0; i < tokenIds.length; i++) {
            const tokenId = Math.min(tokenIds[i], this.vocabSize - 1);
            for (let j = 0; j < this.embeddingDim; j++) {
                result.set(i, j, this.weights.get(tokenId, j));
            }
        }
        return result;
    }

    save() {
        return {
            type: 'Embedding',
            vocabSize: this.vocabSize,
            embeddingDim: this.embeddingDim,
            weights: this.weights.save()
        };
    }

    static load(config) {
        const layer = new Embedding(config.vocabSize, config.embeddingDim);
        layer.weights = Matrix.load(config.weights);
        return layer;
    }
}

module.exports = Embedding;
