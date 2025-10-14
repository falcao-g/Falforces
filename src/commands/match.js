// commands/match.js
const { SlashCommandBuilder } = require("discord.js")

module.exports = {
	data: new SlashCommandBuilder()
		.setName("match")
		.setDescription("Calcule a % de similiridade entre dois usuários do Codeforces")
		.addStringOption((string) =>
			string.setName("primeiro").setDescription("Primeiro usuário do Codeforces").setRequired(true)
		)
		.addStringOption((string) =>
			string.setName("segundo").setDescription("Segundo usuário do Codeforces").setRequired(true)
		),
	execute: async ({ interaction, instance }) => {
		const user1 = interaction.options.getString("primeiro")
		const user2 = interaction.options.getString("segundo")

		let p1 = await instance.loadUser(user1, "codeforces")
		let p2 = await instance.loadUser(user2, "codeforces")

		const set1 = new Set(
			p1.submissions.filter((s) => s.verdict === "OK").map((s) => `${s.contestId}/${s.problem.index}`)
		)
		const set2 = new Set(
			p2.submissions.filter((s) => s.verdict === "OK").map((s) => `${s.contestId}/${s.problem.index}`)
		)

		const intersectionSize = [...set1].filter((x) => set2.has(x)).length
		const unionSize = new Set([...set1, ...set2]).size

		const similarity = unionSize > 0 ? Math.round((intersectionSize / unionSize) * 10000) / 100 : 0

		await interaction.reply({
			embeds: [
				{
					title: `:heart_hands: Match: ${user1} e ${user2}`,
					description: `Vocês tem **${intersectionSize}** problemas em comum de **${unionSize}** problemas únicos resolvidos.`,
					fields: [
						{
							name: "Porcentagem de match",
							value: `**${similarity}%**`,
							inline: false,
						},
					],
					color: 0x1e90ff,
				},
			],
		})
	},
}
