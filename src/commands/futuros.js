const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js")

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
			// upcomingContests is a map, so we need to convert it to an array and sort it by startTime
			const sortedContests = Array.from(bot.upcomingContests.values()).sort(
				(a, b) => a.startTimeSeconds - b.startTimeSeconds
			)
			for (const contest of sortedContests) {
				if (upcomingContests.length >= 3) break
				upcomingContests.push(contest)
			}

			const embed = await bot.createEmbed("#551976").setTitle(bot.i18n.get(interaction, "commands.futuros.embed.title"))

			for (const contest of upcomingContests) {
				embed.addFields({
					name: contest.name,
					value: bot.i18n.get(interaction, "commands.futuros.embed.field_contest", {
						LINK: contest.url,
						INICIO: `<t:${contest.startTimeSeconds}:F>`,
						DURACAO: (contest.durationSeconds / 3600).toFixed(2),
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
