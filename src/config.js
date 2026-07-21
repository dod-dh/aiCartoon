// 환경설정 + 경로 + 캐릭터 바이블 로더
import 'dotenv/config';
import path from 'node:path';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.resolve(__dirname, '..');

export const paths = {
  root: ROOT,
  scripts: path.join(ROOT, 'scripts'),
  outputs: path.join(ROOT, 'outputs'),
  prompts: path.join(ROOT, 'prompts'),
  characters: path.join(ROOT, 'characters'),
  referenceSheet: path.join(ROOT, 'characters', 'characters.png'),
  charactersJson: path.join(ROOT, 'characters', 'characters.json'),
};

const scriptProvider = process.env.SCRIPT_PROVIDER || 'gemini'; // gemini | anthropic | manual
const scriptModelDefault = scriptProvider === 'anthropic' ? 'claude-sonnet-5' : 'gemini-flash-latest';

export const env = {
  geminiApiKey: process.env.GEMINI_API_KEY,
  imageModel: process.env.IMAGE_MODEL || 'gemini-3.1-flash-image',
  imageProvider: process.env.IMAGE_PROVIDER || 'auto', // auto | gemini | pollinations
  anthropicApiKey: process.env.ANTHROPIC_API_KEY,
  scriptProvider,
  scriptModel: process.env.SCRIPT_MODEL || scriptModelDefault,
  fallbackImageProvider: process.env.FALLBACK_IMAGE_PROVIDER || null,
};

// 1080x1350 (4:5) 인스타 세로 규격
export const CANVAS = { width: 1080, height: 1350 };

let _bible = null;
export function loadBible() {
  if (_bible) return _bible;
  _bible = JSON.parse(readFileSync(paths.charactersJson, 'utf8'));
  return _bible;
}
