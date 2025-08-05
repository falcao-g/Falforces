const { msToTime } = require("../utils/functions")
const { SlashCommandBuilder } = require("discord.js")

module.exports = {
	data: new SlashCommandBuilder()
		.setName("botinfo")
		.setDescription("Check some bot stats")
		.setDescriptionLocalizations({
			"pt-BR": "Veja algumas estatísticas do bot",
			"es-ES": "Mira algunas estadísticas del bot",
		})
		.setDMPermission(false),
	execute: async ({ client, interaction, instance }) => {
		await interaction.deferReply().catch(() => {})
		try {
			const embed = instance.createEmbed(3426654).addFields({
				name: "Falforces",
				value: `:house: Servidores: ${client.guilds.cache.size}\n:zap: Online por: ${msToTime(client.uptime)}`,
			})
			await instance.editReply(interaction, { embeds: [embed] })
		} catch (error) {
			console.error(`botinfo: ${error}`)
			instance.editReply(interaction, {
				content: instance.getMessage(interaction, "EXCEPTION"),
				embeds: [],
			})
		}
	},
}
