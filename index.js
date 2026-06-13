const AlyaAI = require('./src/core/AlyaAI');
const AlyaB20DeepThink = require('./src/models/AlyaB20DeepThink');
const Tokenizer = require('./src/core/Tokenizer');
const Matrix = require('./src/utils/matrix');
const Activation = require('./src/utils/activation');
const CONFIG = require('./src/config');

module.exports = {
    AlyaAI,
    AlyaB20DeepThink,
    Tokenizer,
    Matrix,
    Activation,
    CONFIG,
    models: {
        Beta: AlyaAI,
        DeepThink: AlyaB20DeepThink
    },
    version: '1.0.0',
    name: 'Alya-AI Framework'
};
