/**
 * Weight initialization utilities
 */

const Random = {
    /**
     * Normal distribution (Box-Muller)
     */
    normal(mean = 0, std = 1) {
        const u1 = Math.random();
        const u2 = Math.random();
        const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
        return mean + z * std;
    },

    /**
     * Xavier/Glorot initialization
     */
    xavier(fanIn, fanOut) {
        const std = Math.sqrt(2.0 / (fanIn + fanOut));
        return this.normal(0, std);
    },

    /**
     * He initialization
     */
    he(fanIn) {
        const std = Math.sqrt(2.0 / fanIn);
        return this.normal(0, std);
    },

    /**
     * Random integer
     */
    randInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    /**
     * Random choice from array
     */
    choice(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    },
};

module.exports = Random;
