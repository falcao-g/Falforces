const { SlashCommandBuilder } = require("discord.js")
const { msToTime } = require("../utils/functions.js")

module.exports = {
	data: new SlashCommandBuilder()
		.setName("upcoming")
		.setNameLocalizations({
			"pt-BR": "futuros",
			"es-ES": "próximos",
		})
		.setDescription("Use this command to see upcoming Codeforces and AtCoder contests")
		.setDescriptionLocalizations({
			"pt-BR": "Use esse comando para ver os próximos contests do Codeforces e AtCoder",
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

			const embed = await bot
				.createEmbed("#551976")
				.setTitle(bot.i18n.get(interaction, "commands.upcoming.embed.title"))

			for (const contest of upcomingContests) {
				embed.addFields({
					name: contest.name,
					value: bot.i18n.get(interaction, "commands.upcoming.embed.field_contest", {
						LINK: contest.data.url,
						START: `<t:${contest.data.startTimeSeconds}:F>`,
						DURATION: msToTime(contest.data.durationSeconds * 1000),
						TYPE: contest.type,
					}),
				})
			}

			if (upcomingContests.length === 0) {
				embed.setDescription(bot.i18n.get(interaction, "commands.upcoming.embed.field_no_contests"))
			}

			await interaction.editReply({
				embeds: [embed],
			})
		} catch (error) {
			console.error(`upcoming: ${error}`)
			interaction.editReply({
				content: bot.i18n.get(interaction, "errors.exception"),
			})
		}
	},
}
