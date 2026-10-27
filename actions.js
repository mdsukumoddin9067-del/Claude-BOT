const { goals, Movements } = require('mineflayer-pathfinder');
const { GoalNear, GoalFollow } = goals;

function setupMovements(bot) {
  bot.pathfinder.setMovements(new Movements(bot));
}

function stopAll(bot) {
  bot.pathfinder.setGoal(null);
  bot.clearControlStates();
  return 'সব কাজ থামানো হয়েছে';
}

function follow(bot, playerName) {
  const player = bot.players[playerName];
  if (!player || !player.entity) return `${playerName} কে কাছাকাছি দেখতে পাচ্ছি না`;
  bot.pathfinder.setGoal(new GoalFollow(player.entity, 2), true);
  return `${playerName} কে ফলো করছি`;
}

async function goTo(bot, x, y, z) {
  try {
    await bot.pathfinder.goto(new GoalNear(x, y, z, 1));
    return `পৌঁছে গেছি (${x}, ${y}, ${z})`;
  } catch (e) {
    return `যেতে পারিনি: ${e.message}`;
  }
}

async function collect(bot, blockName, count = 1) {
  const def = bot.registry.blocksByName[blockName];
  if (!def) return `"${blockName}" নামে কোনো ব্লক নেই`;
  let got = 0;
  for (let i = 0; i < count; i++) {
    const found = bot.findBlock({ matching: def.id, maxDistance: 48 });
    if (!found) break;
    try {
      const p = found.position;
      await bot.pathfinder.goto(new GoalNear(p.x, p.y, p.z, 3));
      const block = bot.blockAt(p);
      if (!block || block.name !== blockName) continue;
      await bot.dig(block);
      got++;
    } catch (e) {
      return `${got}/${count} টা সংগ্রহ করেছি, তারপর সমস্যা: ${e.message}`;
    }
  }
  return `${got}/${count} টা ${blockName} সংগ্রহ করেছি`;
}

function attack(bot, mobName) {
  const target = bot.nearestEntity((e) =>
    mobName ? e.name === mobName : e.type === 'hostile'
  );
  if (!target) return 'আশেপাশে টার্গেট পাইনি';
  bot.pathfinder.setGoal(new GoalFollow(target, 2), true);
  const timer = setInterval(() => {
    if (!target.isValid) {
      clearInterval(timer);
      bot.pathfinder.setGoal(null);
      return;
    }
    if (bot.entity.position.distanceTo(target.position) < 3.5) bot.attack(target);
  }, 600);
  setTimeout(() => clearInterval(timer), 30000);
  return `${target.name || target.type} কে আক্রমণ করছি`;
}

function status(bot) {
  const p = bot.entity.position;
  return {
    position: { x: Math.round(p.x), y: Math.round(p.y), z: Math.round(p.z) },
    health: bot.health,
    food: bot.food,
    inventory: bot.inventory.items().map((i) => `${i.name} x${i.count}`),
    nearby_players: Object.keys(bot.players).filter((n) => n !== bot.username),
  };
}

module.exports = { setupMovements, stopAll, follow, goTo, collect, attack, status };
