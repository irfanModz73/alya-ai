/**
 * Alya-B20-Beta Configuration
 * 20M parameter transformer-like model
 */

const CONFIG = {
    // Model info
    model: {
        name: 'Alya-B20-Beta',
        version: '0.1.0',
        author: 'irfan',
        parameters: 20000000, // 20M params
    },

    // Architecture
    architecture: {
        vocabSize: 32000,          // Vocabulary size
        embeddingDim: 256,         // Embedding dimension
        hiddenDim: 512,            // Hidden layer dimension
        numLayers: 6,              // Transformer blocks
        numHeads: 8,               // Attention heads
        maxSeqLen: 512,            // Max sequence length
        dropout: 0.1,              // Dropout rate
    },

    // Training
    training: {
        batchSize: 32,
        epochs: 10,
        learningRate: 0.0001,
        warmupSteps: 1000,
        weightDecay: 0.01,
        gradClip: 1.0,
    },

    // Inference
    inference: {
        temperature: 0.7,
        topP: 0.9,
        topK: 50,
        maxTokens: 256,
        repetitionPenalty: 1.1,
    },

    // Paths
    paths: {
        modelDir: './models',
        dataDir: './data',
        savePath: './models/alya-b20-beta.json',
        tokenizerPath: './models/tokenizer.json',
    }
};

module.exports = CONFIG;
