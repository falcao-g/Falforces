const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js")

module.exports = {
	data: new SlashCommandBuilder()
		.setName("stop")
		.setNameLocalizations({
			"pt-BR": "parar",
			"es-ES": "detener",
		})
		.setDescription("Use this command to stop receiving notifications about contests")
		.setDescriptionLocalizations({
			"pt-BR": "Use esse comando para parar de receber notificações sobre contests",
			"es-ES": "Use este comando para dejar de recibir notificaciones sobre concursos",
		})
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
	execute: async ({ interaction, bot }) => {
		try {
			await interaction.deferReply()

			await bot.guildSchema.findByIdAndUpdate(
				interaction.guild.id,
				{
					notificationChannel: null,
				},
				{ upsert: true }
			)

			const embed = await bot
				.createEmbed("#551976")
				.setTitle(bot.i18n.get(interaction, "commands.stop.embed.title"))
				.setDescription(bot.i18n.get(interaction, "commands.stop.embed.description"))
			await interaction.editReply({
				embeds: [embed],
			})
		} catch (error) {
			console.error(`stop: ${error}`)
			interaction.editReply({
				content: bot.i18n.get(interaction, "errors.exception"),
			})
		}
	},
}
