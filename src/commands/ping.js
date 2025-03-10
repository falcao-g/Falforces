const { SlashCommandBuilder } = require("discord.js")

module.exports = {
	data: new SlashCommandBuilder().setName("ping").setDescription("Verifica o ping do bot").setDMPermission(false),
	execute: async ({ interaction, instance }) => {
		try {
			// i recommend always deferring the reply so you have more time to answer
			await interaction.deferReply().catch(() => {})

			answer = await instance.editReply(interaction, {
				content: `Pong! ${instance.client.ws.ping}ms`,
			})
		} catch (error) {
			console.error(`ping: ${error}`)
			instance.editReply(interaction, {
				content: instance.getMessage(interaction, "EXCEPTION"),
			})
		}
	},
}
