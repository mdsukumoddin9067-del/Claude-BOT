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
    bot.chat('হ্যালো! আমি Gemini-চালিত বট। আমার নাম ধরে ডাকো।');
  });

  const handle = (username, message) => {
    if (username === bot.username) return;
    if (config.owner && username !== config.owner) return;
    const called =
      message.toLowerCase().includes(bot.username.toLowerCase()) || message.startsWith('!');
    if (called) think(bot, username, message);
  };

  bot.on('chat', handle);
  bot.on('whisper', (username, message) => {
    if (username === bot.username) return;
    if (config.owner && username !== config.owner) return;
    think(bot, username, message);
  });

  bot.on('kicked', (reason) => console.log('Kicked:', reason));
  bot.on('error', (err) => console.error('Error:', err.message));
  bot.on('end', () => {
    console.log('সংযোগ বিচ্ছিন্ন, ৫ সেকেন্ডে আবার চেষ্টা...');
    setTimeout(start, 5000);
  });
}

start();
