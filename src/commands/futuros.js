const { SlashCommandBuilder } = require("discord.js")

module.exports = {
	data: new SlashCommandBuilder()
		.setName("futuros")
		.setNameLocalizations({
			"en-US": "upcoming",
		})
		.setDescription("Use esse comando para ver os próximos contests do Codeforces e AtCoder")
		.setDescriptionLocalizations({
			"en-US": "Use this command to see upcoming Codeforces and AtCoder contests",
			"es-ES": "Utiliza este comando para ver los próximos concursos de Codeforces y AtCoder",
		}),
	execute: async ({ interaction, bot }) => {
		try {
			await interaction.deferReply()

			const upcomingContests = []
			const addedContests = new Set()
			for (const c of bot.scheduler.all()) {
				if (upcomingContests.length >= 3) break
				if (!addedContests.has(c.contest._id)) {
					upcomingContests.push(c.contest)
					addedContests.add(c.contest._id)
				}
			}
			upcomingContests.sort((a, b) => a.data.startTimeSeconds - b.data.startTimeSeconds)

			const embed = await bot.createEmbed("#551976").setTitle(bot.i18n.get(interaction, "commands.futuros.embed.title"))

			for (const contest of upcomingContests) {
				embed.addFields({
					name: contest.name,
					value: bot.i18n.get(interaction, "commands.futuros.embed.field_contest", {
						LINK: contest.data.url,
						INICIO: `<t:${contest.data.startTimeSeconds}:F>`,
						DURACAO: (contest.data.durationSeconds / 3600).toFixed(2),
						TIPO: contest.type,
					}),
				})
			}

			if (upcomingContests.length === 0) {
				embed.setDescription(bot.i18n.get(interaction, "commands.futuros.embed.field_no_contests"))
			}

			await interaction.editReply({
				embeds: [embed],
			})
		} catch (error) {
			console.error(`futuros: ${error}`)
			interaction.editReply({
				content: bot.i18n.get(interaction, "errors.exception"),
			})
		}
	},
}
