const AlyaAI = require('./src/core/AlyaAI');
const fs = require('fs');

async function main() {
    console.log('\n╔════════════════════════════════╗');
    console.log('║     ALYA-B20-BETA TRAINER     ║');
    console.log('╚════════════════════════════════╝\n');
    ['models', 'data'].forEach(d => { if (!fs.existsSync(d)) fs.mkdirSync(d); });
    const lines = fs.readFileSync('./data/training.jsonl', 'utf8').split('\n').filter(l => l.trim());
    const trainingData = lines.map(l => { try { return JSON.parse(l); } catch(e) { return l; } });
    console.log(`[+] ${trainingData.length} samples\n`);
    const model = new AlyaAI();
    await model.train(trainingData, 3);
    model.save('./models/alya-b20-beta.json');
    console.log('[+] Run: node chat.js\n');
}
main().catch(e => { console.error(e.message); process.exit(1); });
