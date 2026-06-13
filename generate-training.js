const fs = require('fs');
const data = [];
const qa = [
    ['halo alya', 'Halo! Ada yang bisa aku bantu?'],
    ['siapa kamu', 'Aku Alya Queen, AI asisten buatan Irfan.'],
    ['buat function hello world', 'function helloWorld() {\n  console.log("Hello World!");\n}'],
    ['buat function tambah', 'function tambah(a, b) {\n  return a + b;\n}'],
    ['contoh array javascript', 'const arr = [1, 2, 3];\nconsole.log(arr.map(x => x * 2));'],
    ['apa itu variable', 'Variable adalah tempat menyimpan data. Contoh: let x = 5;'],
    ['cara bikin function', 'function namaFunction() {\n  // kode\n}'],
    ['contoh if else', 'if (x > 5) {\n  console.log("Besar");\n} else {\n  console.log("Kecil");\n}'],
    ['terima kasih', 'Sama-sama! Senang bisa membantu.'],
    ['apa kabar', 'Baik nih, kamu gimana?'],
];
for (let i = 0; i < 500; i++) {
    const pair = qa[i % qa.length];
    data.push({ text: pair[0] + (i >= qa.length ? ` v${Math.floor(i/qa.length)}` : ''), response: pair[1] });
}
fs.writeFileSync('./data/training.jsonl', data.map(d => JSON.stringify(d)).join('\n'));
console.log(`[+] Generated ${data.length} training data`);
