const AlyaB20DeepThink = require('./src/models/AlyaB20DeepThink');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const MODEL_PATH = path.join(process.cwd(), 'models', 'alya-b20-deepthink.json');
let model = null;
let trainingHistory = [];

// Load model
function loadModel() {
    if (fs.existsSync(MODEL_PATH)) {
        model = AlyaB20DeepThink.load(MODEL_PATH);
        return true;
    }
    return false;
}

// Save training history
function saveHistory(entry) {
    trainingHistory.push({
        ...entry,
        timestamp: new Date().toISOString()
    });
    const historyPath = './models/training_history.json';
    fs.writeFileSync(historyPath, JSON.stringify(trainingHistory, null, 2));
}

// Load training history
function loadHistory() {
    const historyPath = './models/training_history.json';
    if (fs.existsSync(historyPath)) {
        trainingHistory = JSON.parse(fs.readFileSync(historyPath, 'utf8'));
    }
}

// ========== COMMAND HANDLERS ==========

async function cmdAddName(args) {
    if (!model) return console.log('[!] Model not loaded. Load model dulu.\n');
    const name = args.slice(1).join(' ');
    if (!name) return console.log('[!] Usage: /addName <name>\n');

    if (!model.knowledgeBase) model.knowledgeBase = {};
    if (!model.knowledgeBase.userProfile) model.knowledgeBase.userProfile = { name: 'guest', history: [] };

    model.knowledgeBase.userProfile.name = name;
    model.save();
    console.log(`[+] Name set to: ${name}\n`);
}

async function cmdAddTrainingData(args) {
    if (!model) return console.log('[!] Model not loaded.\n');
    const fileName = args.slice(1).join(' ');
    if (!fileName) return console.log('[!] Usage: /addTrainingData <file.jsonl>\n');

    const filePath = path.join(process.cwd(), 'data', fileName);
    if (!fs.existsSync(filePath)) return console.log(`[!] File ${filePath} not found!\n`);

    console.log(`[~] Adding training data from ${fileName}...`);

    const lines = fs.readFileSync(filePath, 'utf8').split('\n').filter(l => l.trim());
    const newData = lines.map(l => {
        try { const p = JSON.parse(l); return p.text || p.prompt || l; } catch(e) { return l.trim(); }
    });

    console.log(`[+] Loaded ${newData.length} new samples`);
    console.log('[~] Training...');

    await model.train(newData, 3);
    model.save();

    saveHistory({ action: 'addTrainingData', file: fileName, samples: newData.length });
    console.log(`[+] Training complete! Model updated.\n`);
}

async function cmdLogChat() {
    if (!model) return console.log('[!] Model not loaded.\n');

    const logs = model.conversationContext || [];
    if (logs.length === 0) return console.log('[!] No chat logs yet.\n');

    console.log('\n╔════════════════════════════════╗');
    console.log(`║     CHAT LOG (${logs.length} entries)    ║`);
    console.log('╚════════════════════════════════╝\n');

    logs.slice(-20).forEach((log, i) => {
        console.log(`[${i+1}] You: ${log.user.substring(0, 60)}`);
        console.log(`    Alya: ${(log.bot || '').substring(0, 60)}`);
        console.log(`    Time: ${new Date(log.timestamp).toLocaleString('id-ID')}\n`);
    });
}

async function cmdStatusTrain() {
    loadHistory();

    console.log('\n╔════════════════════════════════╗');
    console.log('║      HISTORY TRAINING         ║');
    console.log('╚════════════════════════════════╝');

    if (trainingHistory.length === 0) {
        console.log('   (no training history)\n');
    } else {
        trainingHistory.slice(-10).forEach(h => {
            console.log(`   [${new Date(h.timestamp).toLocaleString('id-ID')}] ${h.action}: ${h.file || h.samples + ' samples'}`);
        });
        console.log('');
    }

    console.log('╔════════════════════════════════╗');
    console.log('║      TRAINING STATUS          ║');
    console.log('╚════════════════════════════════╝');

    if (model) {
        console.log(`   HasTraining: ${model.isTrained ? '✅ Yes' : '❌ No'}`);
        console.log(`   ModelContext: ${Object.keys(model.trainingMemory || {}).length.toLocaleString()} tokens`);
        console.log(`   Model-neural: ${model.config.architecture.embeddingDim * model.config.architecture.numLayers} connections`);
    } else {
        console.log('   HasTraining: ❌ Model not loaded');
        console.log('   ModelContext: N/A');
        console.log('   Model-neural: N/A');
    }

    console.log('\n╔════════════════════════════════╗');
    console.log('║        MODEL INFO             ║');
    console.log('╚════════════════════════════════╝');

    if (model) {
        console.log(`   Name: ${model.config.model.name}`);
        console.log(`   ID: 7296285271362-ALYA_Secured`);
        console.log(`   AdvancedStatus: medium`);
        console.log(`   ModeDeepThink: ${model.deepThink ? '✅ Active' : '❌ Inactive'}`);
        console.log(`   JS Snippets: ${Object.keys(model.jsSnippets || {}).length}`);
        console.log(`   QA Pairs: ${Object.keys(model.qaMap || {}).length}`);
        console.log(`   User: ${(model.knowledgeBase?.userProfile?.name) || 'guest'}`);
    } else {
        console.log('   Name: ALYA-B20-DEEPTHINK');
        console.log('   ID: 7296285271362-ALYA_Secured');
        console.log('   AdvancedStatus: medium');
        console.log('   ModeDeepThink: ❌ Not loaded');
    }
    console.log('');
}

async function cmdExportChat() {
    if (!model) return console.log('[!] Model not loaded.\n');
    const logs = model.conversationContext || [];
    if (logs.length === 0) return console.log('[!] No chat logs.\n');

    const exportPath = `./models/chat_export_${Date.now()}.json`;
    fs.writeFileSync(exportPath, JSON.stringify(logs, null, 2));
    console.log(`[+] Chat exported to: ${exportPath}\n`);
}

async function cmdClearMemory() {
    if (!model) return console.log('[!] Model not loaded.\n');
    model.conversationContext = [];
    model.save();
    console.log('[+] Conversation memory cleared!\n');
}

async function cmdShowSnippets() {
    if (!model) return console.log('[!] Model not loaded.\n');
    const keys = Object.keys(model.jsSnippets || {});
    console.log(`\n╔════════════════════════════════╗`);
    console.log(`║   JS SNIPPETS (${keys.length})          ║`);
    console.log('╚════════════════════════════════╝\n');
    keys.slice(0, 30).forEach((k, i) => {
        console.log(`   ${i+1}. ${k.substring(0, 60)}`);
    });
    if (keys.length > 30) console.log(`   ... and ${keys.length - 30} more`);
    console.log('');
}

// ========== MAIN ==========
async function main() {
console.log(" [ IRFAN - MODEL CONTROL ]");
console.log(` [ Model-Name: Alya-B20-DeepThink ]`);

    console.log('[~] Loading model...');
    if (loadModel()) {
        loadHistory();
        console.log(`[+] ${model.config.model.name} loaded!\n`);
    } else {
        console.log('[!] Model not found. Run node train-deepthink.js first.\n');
    }

    console.log('Commands:');
    console.log('  /addName <name>         - set name');
    console.log('  /addTrainingData <file> - add training-data');
    console.log('  /logChat                - show chat-logs');
    console.log('  /statusTrain            - training-status');
    console.log('  /exportChat             - export chat to json');
    console.log('  /clearMemory            - clear-conversation');
    console.log('  /showSnippets           - show-snippet');
    console.log('  /help                   - show commands');
    console.log('  exit                    - Quit\n');
    console.log('─'.repeat(40) + '\n');

    async function commandLoop() {
        const input = await new Promise(resolve => rl.question('Control> ', resolve));

        if (!input.trim()) return commandLoop();

        const args = input.trim().split(/\s+/);
        const cmd = args[0].toLowerCase();

        switch(cmd) {
            case '/addname': await cmdAddName(args); break;
            case '/addtrainingdata': await cmdAddTrainingData(args); break;
            case '/logchat': await cmdLogChat(); break;
            case '/statustrain': await cmdStatusTrain(); break;
            case '/exportchat': await cmdExportChat(); break;
            case '/clearmemory': await cmdClearMemory(); break;
            case '/showsnippets': await cmdShowSnippets(); break;
            case '/help':
                console.log('\nCommands: /addName /addTrainingData /logChat /statusTrain /exportChat /clearMemory /showSnippets /help exit\n');
                break;
            case 'exit':
                console.log('\nBye\n');
                rl.close();
                return;
            default:
                console.log(`[!] Unknown command: ${cmd}\n`);
        }

        commandLoop();
    }

    commandLoop();
}

main().catch(e => {
    console.error('[!] Error:', e.message);
    rl.close();
});
