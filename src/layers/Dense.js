const Matrix = require('../utils/matrix');

class Dense {
    constructor(inputSize, outputSize, activation = 'relu') {
        this.inputSize = inputSize;
        this.outputSize = outputSize;
        this.activation = activation;
        this.weights = new Matrix(outputSize, inputSize, true);
        this.bias = new Matrix(outputSize, 1);
        this.input = null;
        this.output = null;
    }

    forward(input) {
        this.input = input.clone();
        let output = input.matmul(this.weights.transpose());
        for (let i = 0; i < output.rows; i++) {
            for (let j = 0; j < output.cols; j++) {
                output.set(i, j, output.get(i, j) + this.bias.get(j, 0));
            }
        }
        output = this._applyActivation(output);
        this.output = output;
        return output;
    }

    _applyActivation(matrix) {
        const Activation = require('../utils/activation');
        const func = {
            'relu': Activation.relu,
            'gelu': Activation.gelu,
            'swish': Activation.swish,
            'sigmoid': Activation.sigmoid,
            'tanh': Activation.tanh,
            'linear': (x) => x,
        }[this.activation] || Activation.relu;
        return matrix.apply(func);
    }

    save() {
        return {
            type: 'Dense',
            inputSize: this.inputSize,
            outputSize: this.outputSize,
            activation: this.activation,
            weights: this.weights.save(),
            bias: this.bias.save()
        };
    }

    static load(config) {
        const layer = new Dense(config.inputSize, config.outputSize, config.activation);
        layer.weights = Matrix.load(config.weights);
        layer.bias = Matrix.load(config.bias);
        return layer;
    }
}

module.exports = Dense;
