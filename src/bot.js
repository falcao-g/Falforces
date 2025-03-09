const { Client, GatewayIntentBits, Collection } = require("discord.js")
const { loadEvents } = require("./handlers/eventsHandler.js")
const { loadCommands } = require("./handlers/commandsHandler.js")
require("dotenv").config()

// this is the main class for the bot, it handles all aspects of the bot
// you can add more things to this class if you want
class Bot {
	config = require("./config.json")
	databaseHandler = require("./handlers/databaseHandler")
	_messages = require("./utils/json/messages.json")
	_contests = require("./utils/json/contests.json")
	client = new Client({
		shards: "auto",
		intents: [GatewayIntentBits.Guilds],
	})

	constructor() {
		this.client.on("ready", () => {
			console.log("Bot online")
			this.client.on("error", console.error)

			this.databaseHandler.connect()

			this.client.events = new Collection()
			this.client.commands = new Collection()

			loadEvents(this, this.client)
			loadCommands(this, this.client)
		})

		this.client.login(process.env.TOKEN)
	}

	// this is the main function for sending messages
	// you pass the interaction, the name of the message and the arguments, it will return the message localized
	// if the message is not found, it will return an error message
	// if the locale is not found, it will default to en-US
	getMessage(interaction, messageId, args = {}) {
		const message = this._messages[messageId]
		if (!message) {
			console.error(`Could not find the correct message to send for "${messageId}"`)
			return "Could not find the correct message to send. Please report this to the bot developer."
		}

		const locale = interaction.locale ?? "pt-BR"
		let result = message[locale] ?? message["en-US"]

		for (const key of Object.keys(args)) {
			const expression = new RegExp(`{${key}}`, "g")
			result = result.replace(expression, args[key])
		}

		return result
	}

	// this is a simple function to edit replies
	// it already has some error handling built in
	async editReply(interaction, { content, embeds, components, fetchReply = false }) {
		return await interaction
			.editReply({
				content,
				embeds,
				components,
				fetchReply,
			})
			.catch((err) => {
				console.error(err)
			})
	}

	getInsignias(handle) {
		const insignias = []
		const contests = this._contests

		for (const contest of contests) {
			if (contest.participantes.includes(handle)) {
				insignias.push(contest.insignia)
			}
		}

		return insignias
	}
}

Bot = new Bot()
