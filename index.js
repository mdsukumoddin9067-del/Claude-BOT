const mineflayer = require('mineflayer');
const { pathfinder } = require('mineflayer-pathfinder');
const config = require('./config');
const { setupMovements } = require('./actions');
const { think } = require('./brain');

if (!config.apiKey) {
  console.error('GEMINI_API_KEY সেট করা নেই!');
  process.exit(1);
}

function start() {
  const bot = mineflayer.createBot({
    host: config.host,
    port: config.port,
    username: config.username,
    version: config.version,
    auth: config.auth,
  });

  bot.loadPlugin(pathfinder);

  bot.once('spawn', () => {
    setupMovements(bot);
    console.log(`${bot.username} সার্ভারে ঢুকেছে`);
    bot.chat('Hello! I am a Gemini bot. Call my name.');
