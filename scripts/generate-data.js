import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as deepl from 'deepl-node';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MODELS_DIR = path.resolve(__dirname, '../../100PlusMentalModels/Mental_Models');
const OUTPUT_FILE = path.resolve(__dirname, '../src/data.json');

const DEEPL_API_KEY = process.env.DEEPL_API_KEY;

if (!DEEPL_API_KEY) {
  console.error('Error: DEEPL_API_KEY environment variable is not set. Please set it before running the script.');
  console.error('You can get an API key from https://www.deepl.com/pro-api');
  process.exit(1);
}

const translator = new deepl.Translator(DEEPL_API_KEY);

async function translateText(text) {
  if (!text || text.trim() === '') return text;
  try {
    const result = await translator.translateText(text, null, 'es');
    return result.text;
  } catch (error) {
    console.error(`Error translating text: "${text.substring(0, 50)}...". Error: ${error.message}`);
    return `(Translation Error) ${text}`;
  }
}

async function parseMarkdown(content) {
  const lines = content.split('\n');
  const model = {};
  let currentKey = '';
  let currentValue = [];
  let rawTitle = '';

  for (const line of lines) {
    if (line.startsWith('Mental Model = ')) {
      rawTitle = line.trim();
      model.title = line.replace('Mental Model = ', '').trim();
      model.title_es = await translateText(model.title);
    } else if (line.startsWith('Category = ')) {
      model.category = line.replace('Category = ', '').trim();
      model.category_es = await translateText(model.category);
    } else if (line.includes(':') && !line.startsWith('- ')) {
      if (currentKey) {
        const fieldName = currentKey.toLowerCase().replace(/ /g, '_');
        model[fieldName] = currentValue.join('\n').trim();
        model[`${fieldName}_es`] = await translateText(model[fieldName]);
      }

      const parts = line.split(':');
      currentKey = parts[0].trim();
      currentValue = [parts.slice(1).join(':').trim()];
    } else {
      if (currentKey) {
        currentValue.push(line);
      }
    }
  }

  if (currentKey) {
    const fieldName = currentKey.toLowerCase().replace(/ /g, '_');
    model[fieldName] = currentValue.join('\n').trim();
    model[`${fieldName}_es`] = await translateText(model[fieldName]);
  }

  return model;
}

async function generateAllModels() {
  const categories = fs
    .readdirSync(MODELS_DIR)
    .filter(f => fs.statSync(path.join(MODELS_DIR, f)).isDirectory());

  const allModels = [];

  console.log(`Starting translation of mental models...`);

  for (const categoryDir of categories) {
    const fullCategoryPath = path.join(MODELS_DIR, categoryDir);
    const files = fs.readdirSync(fullCategoryPath).filter(f => f.endsWith('.md'));

    console.log(`Processing category: ${categoryDir} (${files.length} models)`);

    for (const file of files) {
      const content = fs.readFileSync(path.join(fullCategoryPath, file), 'utf-8');
      const parsed = await parseMarkdown(content);
      parsed.categoryDir = categoryDir;
      allModels.push(parsed);
      process.stdout.write('.'); // Progress indicator
    }
    console.log('\n');
  }

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(allModels, null, 2));
  console.log(`Generated ${allModels.length} models to ${OUTPUT_FILE}`);
}

generateAllModels().catch(err => {
  console.error('Fatal error during generation:', err);
  process.exit(1);
});
