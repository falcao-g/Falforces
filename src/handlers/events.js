async function loadEvents(bot, client) {
	const { loadFiles } = require("../utils/functions")

	await client.events.clear()

	const Files = await loadFiles("events")

	Files.forEach((file) => {
		const event = require(file)

		const execute = (...args) => event.execute(...args, bot, client)
		client.events.set(event.name, execute)

		if (event.once) {
			client.once(event.name, execute)
		} else {
			client.on(event.name, execute)
		}

		console.log(`Event: ${event.name} ✅`)
	})
}

module.exports = { loadEvents }
