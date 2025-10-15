const { SlashCommandBuilder } = require("discord.js")

module.exports = {
	data: new SlashCommandBuilder()
		.setName("contest")
		.setDescription("Use esse comando para ser avisado sobre contests futuros do Codeforces")
		.addChannelOption((channel) =>
			channel.setName("canal").setDescription("Canal onde você deseja receber as notificações").setRequired(true)
		),
	execute: async ({ interaction, instance }) => {
		try {
			await interaction.deferReply()

			const channel = interaction.options.getChannel("canal")

			await instance.guildSchema.findByIdAndUpdate(
				interaction.guild.id,
				{
					notificationChannel: channel.id,
				},
				{ upsert: true }
			)

			const embed = await instance
				.createEmbed("#551976")
				.setTitle(`:bell: Notificações Ativadas!`)
				.setDescription(
					`Você receberá notificações um dia e uma hora antes de cada contest do Codeforces no canal ${channel}`
				)
				.addFields({ name: "\u200B", value: "**Para desativar as notificações, use o comando `/parar`**" })
			await interaction.editReply({
				embeds: [embed],
			})
		} catch (error) {
			console.error(`contest: ${error}`)
			interaction.editReply({
				content: instance.getMessage(interaction, "EXCEPTION"),
			})
		}
	},
}
