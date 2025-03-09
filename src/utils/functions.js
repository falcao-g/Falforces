const { ActionRowBuilder } = require('discord.js');

/**
 * @param {integer} ms
 * @description Converts milliseconds to a string with the format "1m 1d 1h 1m 1s"
 * @example msToTime(1000) // 1s
 * @returns {string}
 */
function msToTime(ms) {
	let time = '';

	let n = 0;
	if (ms >= 2592000000) {
		n = Math.floor(ms / 2592000000);
		time += `${n}m `;
		ms -= n * 2592000000;
	}

	if (ms >= 86400000) {
		n = Math.floor(ms / 86400000);
		time += `${n}d `;
		ms -= n * 86400000;
	}

	if (ms >= 3600000) {
		n = Math.floor(ms / 3600000);
		time += `${n}h `;
		ms -= n * 3600000;
	}

	if (ms >= 60000) {
		n = Math.floor(ms / 60000);
		time += `${n}m `;
		ms -= n * 60000;
	}

	if (time === '') time += '1m';

	return time.trimEnd();
}

/**
 *
 * @param {integer} falcoins
 * @description Format a number to a string with the format "1.000.000"
 * @example format(1000000) // 1.000.000
 * @returns {string}
 */
function format(falcoins) {
	if (parseInt(falcoins) < 0) {
		falcoins = falcoins.toString();
		pop = falcoins.slice(1);
	} else {
		pop = falcoins.toString();
	}
	pop_reverse = pop.split('').reverse().join('');
	pop_2 = '';
	for (c in pop_reverse) {
		if (c / 3 == parseInt(c / 3) && c / 3 != 0) {
			pop_2 += '.';
			pop_2 += pop_reverse[c];
		} else {
			pop_2 += pop_reverse[c];
		}
	}
	return pop_2.split('').reverse().join('');
}

/**
 *
 * @param {integer} low
 * @param {integer} high
 * @description Generates a random integer between low and high, both included
 * @example randint(1, 10) // 5
 * @returns {integer}
 */
function randint(low, high) {
	return Math.floor(Math.random() * (high - low + 1) + low);
}

/**
 * @description Creates a pagination system
 */
function paginate() {
	const __embeds = [];
	let cur = 0;
	let traverser;
	return {
		add(...embeds) {
			__embeds.push(...embeds);
			return this;
		},
		setTraverser(tr) {
			traverser = tr;
		},
		async next() {
			cur++;
			if (cur >= __embeds.length) {
				cur = 0;
			}
		},
		async back() {
			cur--;
			if (cur <= -__embeds.length) {
				cur = 0;
			}
		},
		components() {
			return {
				embeds: [__embeds.at(cur)],
				components: [new ActionRowBuilder().addComponents(...traverser)],
				fetchReply: true,
			};
		},
	};
}

/**
 *
 * @param {Array<string, number>} data
 * @description Picks a random element from an array based on its weight
 * @example pick([['a', 0.5], ['b', 0.3], ['c', 0.2]]) // 'a'
 * @returns {string}
 */
function pick(data) {
	// Split input into two separate arrays of values and weights.
	const values = data.map((d) => d[0]);
	const weights = data.map((d) => d[1]);

	let acc = 0;
	const sum = weights.reduce((acc, element) => acc + element, 0);
	const weightsSum = weights.map((element) => {
		acc = element + acc;
		return acc;
	});
	const rand = Math.random() * sum;

	return values[weightsSum.filter((element) => element <= rand).length];
}

/**
 *
 * @param {DiscordID} id
 * @param {string} command
 * @param {integer} cooldown
 * @description Sets a cooldown for a command
 * @async
 * @example setCooldown(id, 'explore', 60) // Sets a 60s cooldown for the explore command
 * @returns {Promise<void>}
 */
async function setCooldown(id, command, cooldown) {
	const { cooldowns } = await userSchema.findById(id);
	cooldowns.set(command, Date.now() + cooldown * 1000);
	await changeDB(id, 'cooldowns', cooldowns, true);
}

/**
 *
 * @param {DiscordID} id
 * @param {string} command
 * @description Resolves a cooldown for a command
 * @async
 * @example resolveCooldown(id, 'explore') // Returns 0 if the cooldown is over, or the remaining time if it isn't
 * @returns {integer}
 */
async function resolveCooldown(id, command) {
	const { cooldowns } = await userSchema.findById(id);
	const commandField = cooldowns.get(command);
	if (commandField != undefined) {
		if (commandField > Date.now()) {
			return commandField - Date.now();
		}
		cooldowns.set(command, 0);
		await changeDB(id, 'cooldowns', cooldowns, true);
	}
	return 0;
}

module.exports = {
	msToTime,
	format,
	randint,
	paginate,
	pick,
	setCooldown,
	resolveCooldown,
};
