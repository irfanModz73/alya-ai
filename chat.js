const AlyaAI = require('./src/core/AlyaAI');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

async function main() {
    console.log('\n╔════════════════════════════════╗');
    console.log('║     ALYA-B20-BETA CHAT        ║');
    console.log('╚════════════════════════════════╝\n');

    const modelPath = path.join(process.cwd(), 'models', 'alya-b20-beta.json');
    
    if (!fs.existsSync(modelPath)) {
        console.log('[!] Model not found!');
        console.log('[!] Run: node train.js\n');
        rl.close();
        return;
    }

    console.log('[~] Loading model...');
    const model = AlyaAI.load(modelPath);
    console.log(`[+] Ready! Type "exit" to quit\n`);
    console.log('─'.repeat(40) + '\n');

    async function chat() {
        const prompt = await new Promise(resolve => rl.question('You: ', resolve));
        
        if (!prompt.trim()) return chat();
        if (prompt.toLowerCase() === 'exit') {
            console.log('\nBye!\n');
            rl.close();
            return;
        }
        
        process.stdout.write('Alya: ');
        const response = await model.chat(prompt);
        console.log(response + '\n');
        chat();
    }

    chat();
}

main().catch(e => {
    console.error('[!]', e.message);
    rl.close();
});
