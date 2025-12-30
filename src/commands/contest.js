const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js")

module.exports = {
	data: new SlashCommandBuilder()
		.setName("contest")
		.setDescription("Use this command to be notified about upcoming Codeforces and AtCoder contests")
		.setDescriptionLocalizations({
			"pt-BR": "Use este comando para ser avisado sobre contests futuros do Codeforces e AtCoder",
			"es-ES": "Usa este comando para recibir notificaciones sobre futuros concursos de Codeforces y AtCoder",
		})
		.addChannelOption((channel) =>
			channel
				.setName("channel")
				.setNameLocalizations({
					"pt-BR": "canal",
					"es-ES": "canal",
				})
				.setDescription("Channel where you want to receive notifications")
				.setDescriptionLocalizations({
					"pt-BR": "Canal onde você deseja receber as notificações",
					"es-ES": "Canal donde deseas recibir notificaciones",
				})
				.setRequired(true)
		)
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
	execute: async ({ interaction, bot }) => {
		try {
			await interaction.deferReply()

			const channel = interaction.options.getChannel("channel")

			await bot.guildSchema.findByIdAndUpdate(
				interaction.guild.id,
				{
					notificationChannel: channel.id,
				},
				{ upsert: true }
			)

			const embed = await bot
				.createEmbed("#551976")
				.setTitle(bot.i18n.get(interaction, "commands.contest.embed.title"))
				.setDescription(bot.i18n.get(interaction, "commands.contest.embed.description", { CHANNEL: channel }))
				.addFields({ name: "\u200B", value: bot.i18n.get(interaction, "commands.contest.embed.field_value") })
			await interaction.editReply({
				embeds: [embed],
			})
		} catch (error) {
			console.error(`contest: ${error}`)
			interaction.editReply({
				content: bot.i18n.get(interaction, "errors.exception"),
			})
		}
	},
}
