const AlyaB20DeepThink = require('./src/models/AlyaB20DeepThink');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

async function main() {
    console.log('\n╔════════════════════════════════╗');
    console.log('║  ALYA-B20-DEEPTHINK CHAT      ║');
    console.log('║      Reasoning Mode           ║');
    console.log('║      by irfan                 ║');
    console.log('╚════════════════════════════════╝\n');

    const modelPath = path.join(process.cwd(), 'models', 'alya-b20-deepthink.json');
    
    if (!fs.existsSync(modelPath)) {
        console.log('[!] Model not found!');
        console.log('[!] Run: node train-deepthink.js\n');
        rl.close();
        return;
    }

    console.log('[~] Loading DeepThink model...');
    const model = AlyaB20DeepThink.load(modelPath);
    console.log(`[+] ${model.config.model.name} ready!`);
    console.log('[+] Commands:');
    console.log('    /think   - Show thinking detail');
    console.log('    /fast    - Toggle fast mode (no reasoning)');
    console.log('    /profile - Show user profile');
    console.log('    /clear   - Clear screen');
    console.log('    exit     - Quit\n');
    console.log('─'.repeat(40) + '\n');

    let fastMode = false;
    let lastThinking = null;

    if (!model.knowledgeBase) model.knowledgeBase = {};
    if (!model.knowledgeBase.userProfile) {
        model.knowledgeBase.userProfile = { name: 'guest', preferences: {}, history: [] };
    }

    function showDeepThink(reasoning, prompt) {
        if (!reasoning || reasoning.length === 0) return '';
        
        let out = '\n╭─── 🧠 *DEEPTHINK PROCESS* ───╮\n';
        out += `│ Input: "${prompt.substring(0, 50)}..."\n`;
        out += '├─────────────────────────────┤\n';
        
        for (const step of reasoning) {
            out += `│ 📝 Step ${step.step}:\n`;
            out += `│    Thought: ${step.thought.substring(0, 40)}...\n`;
            out += `│    😊 Sentiment: ${step.analysis?.sentiment || 'neutral'}\n`;
            out += `│    🎯 Intent: ${step.analysis?.intent || 'unknown'}\n`;
            if (step.analysis?.keywords?.length > 0) {
                out += `│    🔑 Keywords: ${step.analysis.keywords.map(k => k.word).join(', ')}\n`;
            }
            if (step.connections?.size > 0) {
                out += `│    🔗 Connections: ${step.connections.size} found\n`;
            }
            out += `│    💡 Insight: ${step.insight?.summary?.substring(0, 50) || 'processing...'}\n`;
            out += `│    📊 Confidence: ${((step.insight?.confidence || 0.5) * 100).toFixed(0)}%\n`;
            if (step.step < reasoning.length) out += '├─────────────────────────────┤\n';
        }
        
        out += '╰─────────────────────────────╯';
        return out;
    }

    async function chat() {
        const prompt = await new Promise(resolve => rl.question('You: ', resolve));
        
        if (!prompt.trim()) return chat();
        
        if (prompt === '/think') {
            if (lastThinking) {
                console.log(showDeepThink(lastThinking, lastThinking[0]?.thought || '') + '\n');
            } else {
                console.log('(no thinking yet, chat dulu)\n');
            }
            return chat();
        }
        if (prompt === '/fast') {
            fastMode = !fastMode;
            console.log(`[!] Fast mode: ${fastMode ? 'ON (no reasoning)' : 'OFF (with reasoning)'}\n`);
            return chat();
        }
        if (prompt === '/profile') {
            const p = model.knowledgeBase?.userProfile || { name: 'guest', history: [] };
            console.log(`\n👤 Profile:`);
            console.log(`   Name: ${p.name || 'guest'}`);
            console.log(`   History: ${(p.history || []).length} messages`);
            console.log(`   Context: ${(model.conversationContext || []).length} turns\n`);
            return chat();
        }
        if (prompt === '/clear') {
            console.clear();
            console.log('╔════════════════════════════════╗');
            console.log('║  ALYA-B20-DEEPTHINK CHAT      ║');
            console.log('╚════════════════════════════════╝\n');
            return chat();
        }
        if (prompt.toLowerCase() === 'exit') {
            console.log('\n👋 Bye! Sampai jumpa!\n');
            rl.close();
            return;
        }
        
        const startTime = Date.now();
        
        try {
            const response = await model.chat(prompt, { 
                thinkMode: !fastMode, 
                showThinking: true 
            });
            
            const elapsed = Date.now() - startTime;
            
            // Show DeepThink
            if (!fastMode && model.deepThink && model.deepThink.reasoningChain) {
                lastThinking = model.deepThink.reasoningChain;
                console.log(showDeepThink(lastThinking, prompt));
            }
            
            console.log('\n💬 *Alya:* ' + response);
            
            if (!fastMode) {
                const p = model.knowledgeBase?.userProfile || {};
                console.log(`   ⏱️ ${(elapsed/1000).toFixed(1)}s | 🧠 ${model.deepThink?.reasoningChain?.length || 0} steps | 👤 ${p.name || 'guest'}`);
            }
            console.log('');
        } catch(e) {
            console.log('❌ Error: ' + e.message + '\n');
        }
        
        chat();
    }

    chat();
}

main().catch(e => {
    console.error('[!] Fatal error:', e.message);
    rl.close();
    process.exit(1);
});
