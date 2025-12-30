const { SlashCommandBuilder } = require("discord.js")

module.exports = {
	data: new SlashCommandBuilder()
		.setName("invite")
		.setNameLocalizations({
			"pt-BR": "convite",
			"es-ES": "invitación",
		})
		.setDescription("Like Falforces? Add it to your server!")
		.setDescriptionLocalizations({
			"pt-BR": "Gostou do Falforces? Adicione-o ao seu servidor!",
			"es-ES": "¿Te gusta Falforces? ¡Agrégalo a tu servidor!",
		}),
	execute: async ({ interaction, bot }) => {
		await interaction.deferReply().catch(() => {})
		try {
			await bot.editReply(interaction, {
				content: bot.i18n.get(interaction, "commands.invite.response"),
			})
		} catch (error) {
			console.error(`invite: ${error}`)
			bot.editReply(interaction, {
				content: bot.i18n.get(interaction, "errors.exception"),
			})
		}
	},
}
