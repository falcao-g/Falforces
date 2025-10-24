const { SlashCommandBuilder } = require("discord.js")

module.exports = {
	data: new SlashCommandBuilder()
		.setName("match")
		.setDescription("Calcula a % de similaridade entre dois usuários do Codeforces")
		.setDescriptionLocalizations({
			"en-US": "Calculates the % of similarity between two Codeforces users",
			"es-ES": "Calcula el % de similitud entre dos usuarios de Codeforces",
		})
		.addStringOption((string) =>
			string
				.setName("primeiro")
				.setNameLocalizations({
					"en-US": "first",
					"es-ES": "primero",
				})
				.setDescription("Primeiro usuário do Codeforces")
				.setDescriptionLocalizations({
					"en-US": "First Codeforces user",
					"es-ES": "Primer usuario de Codeforces",
				})
				.setRequired(true)
		)
		.addStringOption((string) =>
			string
				.setName("segundo")
				.setNameLocalizations({
					"en-US": "second",
					"es-ES": "segundo",
				})
				.setDescription("Segundo usuário do Codeforces")
				.setDescriptionLocalizations({
					"en-US": "Second Codeforces user",
					"es-ES": "Segundo usuario de Codeforces",
				})
				.setRequired(true)
		),
	execute: async ({ interaction, bot }) => {
		try {
			await interaction.deferReply()

			const user1 = interaction.options.getString("primeiro")
			const user2 = interaction.options.getString("segundo")

			const p1 = await bot.loadUser(user1, "codeforces")
			const p2 = await bot.loadUser(user2, "codeforces")

			const tagFreq1 = {}
			const tagFreq2 = {}

			function addTags(freq, problems) {
				for (const { problem } of problems) {
					const weight = problem.rating ? problem.rating / 3500 : 0.3
					for (const tag of problem.tags || []) {
						freq[tag] = (freq[tag] || 0) + weight
					}
				}
			}

			addTags(tagFreq1, p1.submissions)
			addTags(tagFreq2, p2.submissions)

			const allTags = new Set([...Object.keys(tagFreq1), ...Object.keys(tagFreq2)])

			const v1 = []
			const v2 = []
			for (const tag of allTags) {
				v1.push(tagFreq1[tag] || 0)
				v2.push(tagFreq2[tag] || 0)
			}

			const dot = v1.reduce((acc, x, i) => acc + x * v2[i], 0)
			const mag1 = Math.sqrt(v1.reduce((acc, x) => acc + x * x, 0))
			const mag2 = Math.sqrt(v2.reduce((acc, x) => acc + x * x, 0))
			const cosineSim = mag1 && mag2 ? dot / (mag1 * mag2) : 0
			const percentage = Math.round(cosineSim * 10000) / 100

			const sharedTags =
				[...allTags]
					.map((t) => ({
						tag: t,
						count: Math.min(tagFreq1[t] || 0, tagFreq2[t] || 0),
					}))
					.filter((t) => t.count > 0)
					.sort((a, b) => b.count - a.count)
					.slice(0, 5)
					.map((t) => t.tag)
					.join(", ") || bot.i18n.get(interaction, "commands.match.no_matches")

			const embed = await bot
				.createEmbed("#e0b029")
				.setTitle(bot.i18n.get(interaction, "commands.match.embed.title", { USER1: user1, USER2: user2 }))
				.setDescription(bot.i18n.get(interaction, "commands.match.embed.description"))
				.addFields([
					{
						name: bot.i18n.get(interaction, "commands.match.embed.field_similarity"),
						value: `**${percentage.toFixed(2)}%**`,
					},
					{
						name: bot.i18n.get(interaction, "commands.match.embed.field_top_tags"),
						value: sharedTags,
					},
				])

			await interaction.editReply({
				embeds: [embed],
			})
		} catch (error) {
			console.error(`match: ${error}`)
			interaction.editReply({
				content: bot.i18n.get(interaction, "errors.exception"),
			})
		}
	},
}
