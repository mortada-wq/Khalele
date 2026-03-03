#!/usr/bin/env node
const { askClaude } = require('./agent');
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);

if (args.length === 0) {
  console.log("Usage: node cli.js <prompt> [context-file]");
  console.log("Example: node cli.js 'explain this code' components/GreetingModal.tsx");
  process.exit(1);
}

const prompt = args[0];
const contextFile = args[1];

let context = "";
if (contextFile) {
  const filePath = path.resolve(process.cwd(), contextFile);
  if (fs.existsSync(filePath)) {
    context = `File: ${contextFile}\n\n${fs.readFileSync(filePath, 'utf8')}`;
  } else {
    console.error(`File not found: ${contextFile}`);
    process.exit(1);
  }
}

console.log("🤖 Asking Claude...\n");

askClaude(prompt, context)
  .then(response => {
    console.log(response);
  })
  .catch(error => {
    console.error("Failed:", error.message);
    process.exit(1);
  });
