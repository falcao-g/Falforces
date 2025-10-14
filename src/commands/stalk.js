const { SlashCommandBuilder } = require("discord.js")

module.exports = {
	data: new SlashCommandBuilder()
		.setName("stalkear")
		.setDescription("Veja os últimos problemas que seu amigo resolveu sem você no codeforces")
		.addStringOption((string) => string.setName("voce").setDescription("Seu nome no codeforces").setRequired(true))
		.addStringOption((string) =>
			string.setName("usuario").setDescription("Nome do seu amigo no codeforces").setRequired(true)
		),
	execute: async ({ interaction, instance }) => {
		try {
			await interaction.deferReply().catch(() => {})
			const user = interaction.options.getString("voce")
			const friend = interaction.options.getString("usuario")

			var profile = await fetch(`https://codeforces.com/api/user.info?handles=${user}&checkHistoricHandles=false`, {
				method: "GET",
			})

			profile = await profile.json()
			profile = profile.result[0]

			var friend_profile = await fetch(
				`https://codeforces.com/api/user.info?handles=${friend}&checkHistoricHandles=false`,
				{
					method: "GET",
				}
			)

			friend_profile = await friend_profile.json()
			friend_profile = friend_profile.result[0]

			var submissoes = await fetch(`https://codeforces.com/api/user.status?handle=${user}&from=1&count=1000000`, {
				method: "GET",
			})

			submissoes = await submissoes.json()
			submissoes = submissoes.result

			request_amigo = await fetch(`https://codeforces.com/api/user.status?handle=${friend}&from=1&count=1000000`, {
				method: "GET",
			})

			submissoes_amigo = await request_amigo.json()
			submissoes_amigo = submissoes_amigo.result

			const solvedProblems = new Set()

			submissoes.forEach((submissao) => {
				if (submissao.verdict === "OK") {
					solvedProblems.add(submissao.problem.name)
				}
			})

			const diff = new Set()
			const without = []
			submissoes_amigo.every((submissao) => {
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
