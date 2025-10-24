const { SlashCommandBuilder } = require("discord.js")

module.exports = {
	data: new SlashCommandBuilder()
		.setName("convite")
		.setNameLocalizations({
			"en-US": "invite",
			"es-ES": "invitación",
		})
		.setDescription("Gostou do Falforces? Adicione-o ao seu servidor!")
		.setDescriptionLocalizations({
			"en-US": "Like Falforces? Add it to your server!",
			"es-ES": "¿Te gusta Falforces? ¡Agrégalo a tu servidor!",
		}),
	execute: async ({ interaction, bot }) => {
		await interaction.deferReply().catch(() => {})
		try {
			await bot.editReply(interaction, {
				content: bot.i18n.get(interaction, "commands.convite.response"),
			})
		} catch (error) {
			console.error(`convite: ${error}`)
			bot.editReply(interaction, {
				content: bot.i18n.get(interaction, "errors.exception"),
			})
		}
	},
}
