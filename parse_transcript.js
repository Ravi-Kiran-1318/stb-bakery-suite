const fs = require('fs');
const readline = require('readline');

async function processLineByLine() {
  const fileStream = fs.createReadStream('/home/ravikiran/.gemini/antigravity-ide/brain/ded352cf-e6f8-4ca5-a05c-a9ee640f34ad/.system_generated/logs/transcript.jsonl');

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  for await (const line of rl) {
    if (line.trim()) {
      try {
        const parsed = JSON.parse(line);
        if (parsed.type === 'USER_INPUT') {
          console.log(`[USER_INPUT step ${parsed.step_index}] ${parsed.content.substring(0, 500)}`);
        }
        if (parsed.type === 'PLANNER_RESPONSE' && parsed.content && parsed.content.toLowerCase().includes('seo')) {
            console.log(`[MODEL_RESPONSE step ${parsed.step_index}] ${parsed.content.substring(0, 500)}`);
        }
      } catch(e) {}
    }
  }
}

processLineByLine();
