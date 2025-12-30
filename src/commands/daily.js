const { SlashCommandBuilder } = require("discord.js")
const crypto = require("crypto")

module.exports = {
	data: new SlashCommandBuilder()
		.setName("daily")
		.setNameLocalizations({
			"pt-BR": "diario",
			"es-ES": "diario",
		})
		.setDescription("Shows the Codeforces problem of the day")
		.setDescriptionLocalizations({
			"pt-BR": "Mostra o problema do Codeforces do dia",
			"es-ES": "Muestra el problema del día de Codeforces",
		}),

	execute: async ({ interaction, bot }) => {
		try {
			await interaction.deferReply().catch(() => {})

			const res = await fetch("https://codeforces.com/api/problemset.problems")
			const problems = (await res.json()).result.problems

			const filtered = problems.filter((p) => p.rating && p.rating >= 800 && p.rating <= 1400)

			if (filtered.length === 0) {
				throw new Error("No problems found")
			}

			// daily seed (YYYY-MM-DD)
			const today = new Date().toISOString().slice(0, 10)
			const hash = crypto.createHash("md5").update(today).digest("hex")
			const index = parseInt(hash.slice(0, 8), 16) % filtered.length

			const problem = filtered[index]

			const link = `https://codeforces.com/problemset/problem/${problem.contestId}/${problem.index}`

			const embed = bot
				.createEmbed("#551976")
				.setTitle(bot.i18n.get(interaction, "commands.daily.title"))
				.setDescription(`**[${problem.name}](${link})**`)
				.addFields(
					{
						name: "Rating",
						value: problem.rating.toString(),
						inline: true,
					},
					{
						name: "Tags",
						value: problem.tags.length > 0 ? problem.tags.join(", ") : "—",
						inline: true,
					}
				)
				.setFooter({
					text: bot.i18n.get(interaction, "commands.daily.footer", {
						DATE: today,
					}),
				})

			await interaction.editReply({
				embeds: [embed],
			})
		} catch (error) {
			console.error(`daily: ${error}`)
			await interaction.editReply({
				content: bot.i18n.get(interaction, "errors.exception"),
			})
		}
	},
}
