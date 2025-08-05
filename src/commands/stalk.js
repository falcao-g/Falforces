const { SlashCommandBuilder } = require("discord.js")

module.exports = {
	data: new SlashCommandBuilder()
		.setName("stalkear")
		.setDescription("Veja os últimos problemas que seu amigo resolveu sem você no codeforces")
		.setDMPermission(false)
		.addStringOption((string) => string.setName("voce").setDescription("Seu nome no codeforces").setRequired(true))
		.addStringOption((string) =>
			string.setName("usuario").setDescription("Nome do seu amigo no codeforces").setRequired(true)
		),
	execute: async ({ interaction, instance }) => {
		try {
			await interaction.deferReply().catch(() => {})
			const user = interaction.options.getString("voce")
			const friend = interaction.options.getString("usuario")

			let profile = await instance.loadUser(user, "codeforces")
			let friend_profile = await instance.loadUser(friend, "codeforces")

			const solvedProblems = new Set()

			profile.submissions.forEach((submissao) => {
				if (submissao.verdict === "OK") {
					solvedProblems.add(submissao.problem.name)
				}
			})

			const diff = new Set()
			const without = []
			friend_profile.submissions.every((submissao) => {
				if (submissao.verdict === "OK") {
					if (!solvedProblems.has(submissao.problem.name)) {
						var temp = diff.size
						diff.add(submissao.problem.name)
						if (diff.size > temp) {
							without.push({
								name: submissao.problem.name,
								rating: submissao.problem.rating,
								tags: submissao.problem.tags,
								contestId: submissao.problem.contestId,
								index: submissao.problem.index,
							})
						}
					}
				}

				if (without.length >= 6) {
					return false
				}
				return true
			})

			if (without.length > 0) {
				const emoji = {
					1: ":one:",
					2: ":two:",
					3: ":three:",
					4: ":four:",
					5: ":five:",
					6: ":six:",
				}

				var index = 0
				var problems = without.map((problem) => {
					index += 1
					return `${emoji[index]} **[${problem.name}](https://codeforces.com/problemset/problem/${problem.contestId}/${
						problem.index
					})** - ${problem.rating} | :label: ${problem.tags.join(", ")}`
				})

				var embed = instance
					.createEmbed("#551976")
					.setTitle(`Últimos problemas que ${friend_profile.handle} fez sem você... :worried:`)
					.setAuthor({
						name: profile.handle,
						iconURL: profile.titlePhoto,
					})
					.setThumbnail(friend_profile.titlePhoto)
					.addFields({
						name: "Problemas",
						value: problems.join("\n"),
					})
			} else {
				var embed = instance
					.createEmbed("#551976")
					.setTitle(`${friend_profile.handle} não fez nenhum problema sem você, wow! :heart_hands:`)
					.setAuthor({
						name: profile.handle,
						iconURL: profile.titlePhoto,
					})
					.setThumbnail(friend_profile.titlePhoto)
			}

			await interaction.editReply({
				embeds: [embed],
			})
		} catch (error) {
			console.error(`stalk: ${error}`)
			interaction.editReply({
				content: instance.getMessage(interaction, "EXCEPTION"),
			})
		}
	},
}
