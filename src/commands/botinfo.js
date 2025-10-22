const { msToTime } = require("../utils/functions")
const { SlashCommandBuilder } = require("discord.js")

module.exports = {
	data: new SlashCommandBuilder()
		.setName("botinfo")
		.setDescription("Veja algumas estatísticas do bot")
		.setDescriptionLocalizations({
			"en-US": "Check some bot stats",
			"es-ES": "Mira algunas estadísticas del bot",
		}),
	execute: async ({ client, interaction, bot }) => {
		await interaction.deferReply().catch(() => {})
		try {
			const embed = bot.createEmbed(3426654).addFields({
				name: "Falforces",
				value: bot.i18n.get(interaction, "commands.botinfo.response", {
					SERVIDORES: client.guilds.cache.size,
					TEMPO: msToTime(client.uptime),
				}),
				inline: false,
			})
			await bot.editReply(interaction, { embeds: [embed] })
		} catch (error) {
			console.error(`botinfo: ${error}`)
			bot.editReply(interaction, {
				content: bot.i18n.get(interaction, "errors.exception"),
				embeds: [],
			})
		}
	},
}
