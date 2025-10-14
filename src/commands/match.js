const { SlashCommandBuilder } = require("discord.js")

module.exports = {
	data: new SlashCommandBuilder()
		.setName("match")
		.setDescription("Calcula a % de similaridade entre dois usuários do Codeforces")
		.addStringOption((string) =>
			string.setName("primeiro").setDescription("Primeiro usuário do Codeforces").setRequired(true)
		)
		.addStringOption((string) =>
			string.setName("segundo").setDescription("Segundo usuário do Codeforces").setRequired(true)
		),
	execute: async ({ interaction, instance }) => {
		try {
			await interaction.deferReply()

			const user1 = interaction.options.getString("primeiro")
			const user2 = interaction.options.getString("segundo")

			const p1 = await instance.loadUser(user1, "codeforces")
			const p2 = await instance.loadUser(user2, "codeforces")

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
					.join(", ") || "Nenhuma tag relevante em comum"

			await interaction.editReply({
				embeds: [
					{
						title: `:heart_hands: Match de estilo algorítmico: ${user1} × ${user2}`,
						description: `Baseado em **todas as submissões**`,
						fields: [
							{
								name: "Similaridade",
								value: `**${percentage.toFixed(2)}%**`,
							},
							{
								name: ":label: Principais tags em comum",
								value: sharedTags,
							},
						],
						color: 0xe0b029,
						footer: {
							text: "by Falcão ❤️",
						},
					},
				],
			})
		} catch (error) {
			console.error(`match: ${error}`)
			interaction.editReply({
				content: instance.getMessage(interaction, "EXCEPTION"),
			})
		}
	},
}
