const actions = require('./actions');

const definitions = [
  {
    name: 'get_status',
    description: 'বটের বর্তমান অবস্থান, হেলথ, খাবার, ইনভেন্টরি ও কাছের প্লেয়ারদের তথ্য দেখো।',
    input_schema: { type: 'object', properties: {} },
  },
  {
    name: 'follow_player',
    description: 'কোনো প্লেয়ারকে ফলো করো।',
    input_schema: {
      type: 'object',
      properties: { player_name: { type: 'string' } },
      required: ['player_name'],
    },
  },
  {
    name: 'go_to',
    description: 'নির্দিষ্ট কোঅর্ডিনেটে হেঁটে যাও।',
    input_schema: {
      type: 'object',
      properties: { x: { type: 'number' }, y: { type: 'number' }, z: { type: 'number' } },
      required: ['x', 'y', 'z'],
    },
  },
  {
    name: 'collect_block',
    description: 'কাছাকাছি থেকে ব্লক ভেঙে সংগ্রহ করো। block_name হবে Minecraft এর ইংরেজি আইডি, যেমন oak_log, stone, coal_ore।',
    input_schema: {
      type: 'object',
      properties: { block_name: { type: 'string' }, count: { type: 'integer', minimum: 1, maximum: 20 } },
      required: ['block_name'],
    },
  },
  {
    name: 'attack_mob',
    description: 'কাছের মব আক্রমণ করো। mob_name না দিলে কাছের শত্রু মব টার্গেট হবে (যেমন zombie, skeleton)।',
    input_schema: { type: 'object', properties: { mob_name: { type: 'string' } } },
  },
  {
    name: 'stop',
    description: 'চলমান সব কাজ (হাঁটা, ফলো, আক্রমণ) থামাও।',
    input_schema: { type: 'object', properties: {} },
  },
];

async function run(bot, name, input = {}) {
  switch (name) {
    case 'get_status': return actions.status(bot);
    case 'follow_player': return actions.follow(bot, input.player_name);
    case 'go_to': return await actions.goTo(bot, input.x, input.y, input.z);
    case 'collect_block': return await actions.collect(bot, input.block_name, input.count || 1);
    case 'attack_mob': return actions.attack(bot, input.mob_name);
    case 'stop': return actions.stopAll(bot);
    default: return `অজানা টুল: ${name}`;
  }
}

module.exports = { definitions, run };
