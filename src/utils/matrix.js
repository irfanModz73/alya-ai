/**
 * Matrix operations for neural network
 */
class Matrix {
    constructor(rows, cols, random = false) {
        this.rows = rows;
        this.cols = cols;
        this.data = new Float32Array(rows * cols);
        
        if (random) {
            const scale = Math.sqrt(2.0 / (rows + cols));
            for (let i = 0; i < this.data.length; i++) {
                this.data[i] = (Math.random() * 2 - 1) * scale;
            }
        }
    }

    get(row, col) {
        return this.data[row * this.cols + col];
    }

    set(row, col, value) {
        this.data[row * this.cols + col] = value;
    }

    matmul(B) {
        if (this.cols !== B.rows) throw new Error(`Shape mismatch: (${this.rows},${this.cols}) x (${B.rows},${B.cols})`);
        const result = new Matrix(this.rows, B.cols);
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < B.cols; j++) {
                let sum = 0;
                for (let k = 0; k < this.cols; k++) {
                    sum += this.get(i, k) * B.get(k, j);
                }
                result.set(i, j, sum);
            }
        }
        return result;
    }

    add(B) {
        const result = new Matrix(this.rows, this.cols);
        for (let i = 0; i < this.data.length; i++) {
            result.data[i] = this.data[i] + (B.data ? B.data[i] : B);
        }
        return result;
    }

    multiply(B) {
        const result = new Matrix(this.rows, this.cols);
        for (let i = 0; i < this.data.length; i++) {
            result.data[i] = this.data[i] * (B.data ? B.data[i] : B);
        }
        return result;
    }

    transpose() {
        const result = new Matrix(this.cols, this.rows);
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                result.set(j, i, this.get(i, j));
            }
        }
        return result;
    }

    apply(fn) {
        const result = new Matrix(this.rows, this.cols);
        for (let i = 0; i < this.data.length; i++) {
            result.data[i] = fn(this.data[i]);
        }
        return result;
    }

    sum() {
        return this.data.reduce((a, b) => a + b, 0);
    }

    clone() {
        const result = new Matrix(this.rows, this.cols);
        result.data = new Float32Array(this.data);
        return result;
    }

    /**
     * Save matrix as base64 string (compact)
     */
    save() {
        return {
            rows: this.rows,
            cols: this.cols,
            data: Buffer.from(this.data.buffer).toString('base64')
        };
    }

    /**
     * Load matrix from saved config
     */
    static load(config) {
        const matrix = new Matrix(config.rows, config.cols);
        const buffer = Buffer.from(config.data, 'base64');
        matrix.data = new Float32Array(buffer.buffer, buffer.byteOffset, buffer.length / 4);
        return matrix;
    }
}

module.exports = Matrix;
