const { SlashCommandBuilder } = require("discord.js")

module.exports = {
	data: new SlashCommandBuilder()
		.setName("stalkear")
		.setNameLocalizations({
			"en-US": "stalk",
		})
		.setDescription("Veja os últimos problemas que seu amigo resolveu sem você no codeforces")
		.setDescriptionLocalizations({
			"en-US": "See the latest problems your friend solved without you on codeforces",
			"es-ES": "Vea los últimos problemas que su amigo resolvió sin usted en codeforces",
		})
		.addStringOption((string) =>
			string
				.setName("voce")
				.setNameLocalizations({
					"en-US": "you",
					"es-ES": "usted",
				})
				.setDescription("Seu nome no codeforces")
				.setDescriptionLocalizations({
					"en-US": "Your codeforces username",
					"es-ES": "Su nombre de usuario en codeforces",
				})
				.setRequired(true)
		)
		.addStringOption((string) =>
			string
				.setName("usuario")
				.setNameLocalizations({
					"en-US": "user",
					"es-ES": "usuario",
				})
				.setDescription("Nome do seu amigo no codeforces")
				.setDescriptionLocalizations({
					"en-US": "Your friend's codeforces username",
					"es-ES": "El nombre de usuario de su amigo en codeforces",
				})
				.setRequired(true)
		),
	execute: async ({ interaction, bot }) => {
		try {
			await interaction.deferReply().catch(() => {})
			const user = interaction.options.getString("voce")
			const friend = interaction.options.getString("usuario")

			let profile = await bot.loadUser(user, "codeforces")
			let friend_profile = await bot.loadUser(friend, "codeforces")

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

				var embed = bot
					.createEmbed("#551976")
					.setTitle(bot.i18n.get(interaction, "commands.stalk.response_diff", { AMIGO: friend_profile.handle }))
					.setAuthor({
						name: profile.handle,
						iconURL: profile.titlePhoto,
					})
					.setThumbnail(friend_profile.titlePhoto)
					.addFields({
						name: bot.i18n.get(interaction, "words.problemas"),
						value: problems.join("\n"),
					})
			} else {
				var embed = bot
					.createEmbed("#551976")
					.setTitle(bot.i18n.get(interaction, "commands.stalk.response_none", { AMIGO: friend_profile.handle }))
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
				content: bot.i18n.get(interaction, "errors.exception"),
			})
		}
	},
}
