const { ActionRowBuilder, ButtonBuilder } = require("discord.js")
const fs = require("fs")
const { promisify } = require("util")

const readdir = promisify(fs.readdir)
const stat = promisify(fs.stat)

async function loadFiles(dirName) {
	const basePath = `${process.cwd().replace(/\\/g, "/")}/src/${dirName}`

	const files = []
	const items = await readdir(basePath)
	for (const item of items) {
		const itemPath = `${basePath}/${item}`
		const itemStat = await stat(itemPath)
		if (itemStat.isDirectory()) {
			const subFiles = await loadFiles(`${dirName}/${item}`)
			files.push(...subFiles)
		} else if (itemPath.endsWith(".js")) {
			files.push(itemPath)
			delete require.cache[require.resolve(itemPath)]
		}
	}

	return files
}

/**
 * @param {integer} ms
 * @description Converts milliseconds to a string with the format "1d 1h 1m"
 * @example msToTime(1000) // 1s
 * @returns {string}
 */
function msToTime(ms) {
	let time = ""

	let n = 0
	if (ms >= 86400000) {
		n = Math.floor(ms / 86400000)
		time += `${n}d `
		ms -= n * 86400000
	}

	if (ms >= 3600000) {
		n = Math.floor(ms / 3600000)
		time += `${n}h `
		ms -= n * 3600000
	}

	if (ms >= 60000) {
		n = Math.floor(ms / 60000)
		time += `${n}m `
		ms -= n * 60000
	}

	if (time === "") time += "1m"

	return time.trimEnd()
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
	return Math.floor(Math.random() * (high - low + 1) + low)
}

/**
 * @description Creates a paginator for embeds and components
 */
function paginate() {
	const __embeds = []
	const __components = []
	let cur = 0
	let traverser
	return {
		add(...embeds) {
			__embeds.push(...embeds)
			return this
		},
		addComponents(...components) {
			__components.push(...components)
			return this
		},
		setTraverser(tr) {
			traverser = tr
		},
		async next() {
			cur++
			if (cur >= __embeds.length) {
				cur = 0
			}
		},
		async back() {
			cur--
			if (cur <= -__embeds.length) {
				cur = 0
			}
		},
		components() {
			componentsToAdd = []

			if (__components.length > 0) {
				if (__components.length === __embeds.length && __components.at(cur) instanceof ButtonBuilder) {
					componentsToAdd.push(new ActionRowBuilder().addComponents(__components.at(cur)).addComponents(...traverser))
				} else {
					componentsToAdd.push(new ActionRowBuilder().addComponents(__components.at(cur)))
					if (__embeds.length > 1) componentsToAdd.push(new ActionRowBuilder().addComponents(...traverser))
				}
			}

			return {
				embeds: [__embeds.at(cur)],
				components: componentsToAdd,
				fetchReply: true,
			}
		},
	}
}

module.exports = {
	msToTime,
	randint,
	paginate,
	loadFiles,
}
