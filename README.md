# alya-ai

> custom ai model built from scratch in javascript

---

## about

| field | value |
|-------|-------|
| name | alya-ai |
| author | irfan |
| mode | deepthink, basic |
| token-context | 238 |
| language | javascript (node.js) |
| license | mit |

alya-ai adalah model ai custom yang dibangun dari nol menggunakan javascript murni. tidak menggunakan api eksternal, semua neural network diimplementasikan secara manual.

model ini memiliki dua mode:
- **basic** - model chat standar dengan qa mapping
- **deepthink** - model dengan reasoning berlapis dan code generation

---

## struktur folder
alya-ai/
├── src/
│ ├── core/
│ │ ├── alyaai.js # model utama
│ │ ├── tokenizer.js # tokenizer teks
│ │ └── reasoner.js # reasoning engine
│ ├── layers/
│ │ ├── dense.js # fully connected layer
│ │ ├── embedding.js # word embedding
│ │ ├── attention.js # multi-head attention
│ │ ├── transformerblock.js # transformer block
│ │ └── deepthink.js # deep thinking layer
│ ├── models/
│ │ └── alyab20deepthink.js # model deepthink
│ ├── utils/
│ │ ├── matrix.js # operasi matriks
│ │ ├── activation.js # fungsi aktivasi
│ │ └── random.js # weight initialization
│ └── config.js # konfigurasi model
├── data/
│ ├── training.jsonl # data training basic
│ └── deepthink.jsonl # data training deepthink
├── models/
│ ├── alya-b20-beta.json # saved model basic
│ └── alya-b20-deepthink.json # saved model deepthink
├── generate-training.js # generator data basic
├── generate-deepthink.js # generator data deepthink
├── train.js # script training basic
├── train-deepthink.js # script training deepthink
├── chat.js # chat terminal basic
├── chat-deepthink.js # chat terminal deepthink
├── control-command.js # panel kontrol model
├── index.js # entry point
├── package.json
└── readme.md
---
## requirements
- node.js >= 16.0.0
- npm
===============
tidak ada dependency tambahan. semua murni javascript native.
---

## quick start

### 1. clone atau download

```bash
cd alya-ai
2. generate data training
bash
# basic model
node generate-training.js

# deepthink model
node generate-deepthink.js
3. training model
bash
# training basic
node train.js

# training deepthink
node train-deepthink.js
4. chat dengan model
bash
# chat basic
node chat.js

# chat deepthink dengan reasoning
node chat-deepthink.js
5. panel kontrol (opsional)
bash
node control-command.js
commands chat
basic chat
text
/help    - tampilkan bantuan
/clear   - bersihkan layar
exit     - keluar
deepthink chat
text
/think   - lihat proses deep thinking
/fast    - mode cepat tanpa reasoning
/profile - lihat profil user
/clear   - bersihkan layar
exit     - keluar
control panel
text
/addname <nama>              - set nama user
/addtrainingdata <file>      - tambah data training
/logchat                     - lihat log chat
/statustrain                 - status training
/exportchat                  - export chat ke json
/clearmemory                 - hapus memori percakapan
/showsnippets                - lihat javascript snippets
exit                            - keluar

# cara kerja
basic model
tokenizer mengubah teks menjadi token
model menyimpan pola kata dalam memory map
qa map menyimpan pasangan tanya-jawab
saat chat, cek qa map dulu, lalu generate dari memory
deepthink model
menerima input dari user
deep think layer menganalisis:
sentiment (positif/negatif/netral)
intent (pertanyaan/sapaan/pernyataan)
keywords dan connections
reasoning chain memproses 4 langkah berpikir
cek qa map untuk jawaban exact
cek js snippets untuk permintaan kode
fallback generate dari memory pattern

# model-info
model info
properti	basic	deepthink
name	alya-b20-beta	alya-b20-deepthink
parameters	20m	25m
think steps	-	4
embedding dim	256	256
hidden dim	512	512
transformer layers	6	6
attention heads	8	8
custom training
menambah data basic
======================
edit data/training.jsonl:
json
{"text": "pertanyaan", "response": "jawaban"}
lalu training ulang:
node train.js
menambah data deepthink
=====================
edit data/deepthink.jsonl:
json
{"text": "pertanyaan", "response": "jawaban", "category": "javascript"}
======================
lalu training ulang:
node train-deepthink.js
tech stack
pure javascript (node.js) 
# list
float32array matrix operations
self-attention mechanism
transformer architecture
bpe-like tokenizer
chain-of-thought reasoning

# notes
model disimpan dalam format json
tidak memerlukan koneksi internet
tidak mengirim data ke server manapun
semua proses berjalan lokal
model belajar dari data training yang diberikan

copyright
text
© irfan - 2026 all rights reserved.

kode ini bebas digunakan untuk pembelajaran dan pengembangan.
dilarang menggunakan kode ini untuk hal yang melanggar hukum.
segala bentuk modifikasi dan redistribusi harus menyertakan
kredit kepada author asli.
contact
github: irfanModz73
email: stockahli221@gmail.com
built with ❤️ by irfan

# note - ahkir
"ai bukan untuk menggantikan manusia, tapi untuk membantu"
