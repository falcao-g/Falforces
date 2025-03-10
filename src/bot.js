const { Client, GatewayIntentBits, Collection, EmbedBuilder } = require("discord.js")
const { loadEvents } = require("./handlers/eventsHandler.js")
const { loadCommands } = require("./handlers/commandsHandler.js")
require("dotenv").config()

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

			this.client.events = new Collection()
			this.client.commands = new Collection()

			loadEvents(this, this.client)
			loadCommands(this, this.client)
		})

		this.client.login(process.env.TOKEN)
	}

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

	async getInsignias(handle) {
		const insignias = []
		const contests = this._contests

		for (const contest of contests) {
			if (contest.participantes.includes(handle)) {
				insignias.push(await this.client.application.emojis.fetch(contest.insignia))
			}
		}

		return insignias
	}

	createEmbed(color = "Random") {
		return new EmbedBuilder().setColor(color).setFooter({ text: "by Falcão ❤️" })
	}
}

Bot = new Bot()
