const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js")

module.exports = {
	data: new SlashCommandBuilder()
		.setName("parar")
		.setNameLocalizations({
			"en-US": "stop",
		})
		.setDescription("Use esse comando para parar de receber notificações sobre contests")
		.setDescriptionLocalizations({
			"en-US": "Use this command to stop receiving notifications about contests",
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
				.setTitle(bot.i18n.get(interaction, "commands.parar.embed.title"))
				.setDescription(bot.i18n.get(interaction, "commands.parar.embed.description"))
			await interaction.editReply({
				embeds: [embed],
			})
		} catch (error) {
			console.error(`parar: ${error}`)
			interaction.editReply({
				content: bot.i18n.get(interaction, "errors.exception"),
			})
		}
	},
}
