/**
 * Activation functions
 */

const Activation = {
    /**
     * ReLU: max(0, x)
     */
    relu(x) {
        return Math.max(0, x);
    },

    /**
     * GELU: Gaussian Error Linear Unit
     */
    gelu(x) {
        return 0.5 * x * (1 + Math.tanh(Math.sqrt(2 / Math.PI) * (x + 0.044715 * Math.pow(x, 3))));
    },

    /**
     * Swish: x * sigmoid(x)
     */
    swish(x) {
        return x / (1 + Math.exp(-x));
    },

    /**
     * Sigmoid
     */
    sigmoid(x) {
        return 1 / (1 + Math.exp(-x));
    },

    /**
     * Tanh
     */
    tanh(x) {
        return Math.tanh(x);
    },

    /**
     * Softmax (array input)
     */
    softmax(arr) {
        const max = Math.max(...arr);
        const exp = arr.map(x => Math.exp(x - max));
        const sum = exp.reduce((a, b) => a + b, 0);
        return exp.map(x => x / sum);
    },

    /**
     * Softmax for matrix (row-wise)
     */
    softmaxMatrix(matrix) {
        const result = matrix.clone();
        const cols = matrix.cols;
        
        for (let i = 0; i < matrix.rows; i++) {
            // Get row
            const row = [];
            for (let j = 0; j < cols; j++) {
                row.push(matrix.get(i, j));
            }
            
            // Apply softmax
            const softmaxed = this.softmax(row);
            
            // Set back
            for (let j = 0; j < cols; j++) {
                result.set(i, j, softmaxed[j]);
            }
        }
        
        return result;
    }
};

module.exports = Activation;
