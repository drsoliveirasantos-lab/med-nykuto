#!/usr/bin/env node
/* Build the Semester 4 guided respiratory case runtime from its reviewed source. */
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const sourceFile = path.join(root, 'content', 'class', 's4-guided-respiratory-cases.json');
const outputFile = path.join(root, 'data', 's4-guided-clinical-cases-v177.js');

function build() {
  if (!fs.existsSync(sourceFile)) {
    throw new Error(`Missing source: ${path.relative(root, sourceFile)}`);
  }

  const data = JSON.parse(fs.readFileSync(sourceFile, 'utf8'));
  const banner = [
    '/* AUTO-GENERATED FILE — DO NOT EDIT MANUALLY.',
    '   Source: content/class/s4-guided-respiratory-cases.json',
    '   Build command: npm run build:s4-guided-cases',
    '*/'
  ].join('\n');
  const output = `${banner}\nwindow.MedNykutoS4GuidedCaseData=${JSON.stringify(data)};\n`;

  fs.mkdirSync(path.dirname(outputFile), { recursive: true });
  fs.writeFileSync(outputFile, output, 'utf8');
  console.log(
    `Built ${path.relative(root, outputFile)}: ${data.cases.length} cases, ` +
    `${data.cases.reduce((total, item) => total + item.questions.length, 0)} guided steps`
  );
}

try {
  build();
} catch (error) {
  console.error('S4 guided-case build failed:', error.message);
  process.exit(1);
}
