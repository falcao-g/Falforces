const { SlashCommandBuilder } = require("discord.js")

module.exports = {
	data: new SlashCommandBuilder()
		.setName("parar")
		.setDescription("Use esse comando para parar de receber notificações sobre contests"),
	execute: async ({ interaction, instance }) => {
		try {
			await interaction.deferReply()

			await instance.guildSchema.findByIdAndUpdate(
				interaction.guild.id,
				{
					notificationChannel: null,
				},
				{ upsert: true }
			)

			const embed = await instance
				.createEmbed("#551976")
				.setTitle(`:mega: Notificações Desativadas!`)
				.setDescription(`Você não receberá mais notificações sobre contests do Codeforces.`)
			await interaction.editReply({
				embeds: [embed],
			})
		} catch (error) {
			console.error(`parar: ${error}`)
			interaction.editReply({
				content: instance.getMessage(interaction, "EXCEPTION"),
			})
		}
	},
}
