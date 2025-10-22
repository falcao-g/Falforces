const { SlashCommandBuilder } = require("discord.js")

module.exports = {
	data: new SlashCommandBuilder().setName("ping").setDescription("Verifica o ping do bot").setDescriptionLocalizations({
		"en-US": "Check the bot's ping",
		"es-ES": "Verifica el ping del bot",
	}),
	execute: async ({ interaction, bot }) => {
		try {
			await interaction.deferReply().catch(() => {})

			answer = await bot.editReply(interaction, {
				content: bot.i18n.get(interaction, "commands.ping.response", { PING: bot.client.ws.ping }),
			})
		} catch (error) {
			console.error(`ping: ${error}`)
			bot.editReply(interaction, {
				content: bot.i18n.get(interaction, "errors.exception"),
			})
		}
	},
}
