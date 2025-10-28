const { SlashCommandBuilder } = require("discord.js")

module.exports = {
	data: new SlashCommandBuilder()
		.setName("stalkear")
		.setNameLocalizations({
			"en-US": "stalk",
		})
		.setDescription("Veja os últimos problemas que seu amigo resolveu no codeforces")
		.setDescriptionLocalizations({
			"en-US": "See the latest problems your friend solved on codeforces",
			"es-ES": "Vea los últimos problemas que su amigo resolvió en codeforces",
		})
		.addStringOption((string) =>
			string
				.setName("usuario")
				.setNameLocalizations({
					"en-US": "user",
					"es-ES": "usuario",
				})
				.setDescription("Handle do seu amigo no codeforces")
				.setDescriptionLocalizations({
					"en-US": "Your friend's codeforces handle",
					"es-ES": "El handle de su amigo en codeforces",
				})
				.setRequired(true)
		),
	execute: async ({ interaction, bot }) => {
		try {
			await interaction.deferReply().catch(() => {})
			const friend = interaction.options.getString("usuario")
			let profile = await bot.loadUser(friend, "codeforces").catch(async (error) => {
				throw new Error("Usuário não encontrado", { cause: friend })
			})

			const solvedProblems = []

			profile.submissions.every((submissao) => {
				if (submissao.verdict === "OK") {
					solvedProblems.push({
						name: submissao.problem.name,
						rating: submissao.problem.rating,
						tags: submissao.problem.tags,
						contestId: submissao.contestId,
						index: submissao.problem.index,
					})
				}

				return solvedProblems.length < 6
			})

			if (solvedProblems.length > 0) {
				const emoji = {
					1: ":one:",
					2: ":two:",
					3: ":three:",
					4: ":four:",
					5: ":five:",
					6: ":six:",
				}

				var index = 0
				var problems = solvedProblems.map((problem) => {
					index += 1
					return `${emoji[index]} **[${problem.name}](https://codeforces.com/problemset/problem/${problem.contestId}/${
						problem.index
					})** - ${problem.rating} | :label: ${problem.tags.join(", ")}`
				})

				var embed = bot
					.createEmbed("#551976")
					.setTitle(bot.i18n.get(interaction, "commands.stalk.response", { AMIGO: profile.handle }))
					.setAuthor({
						name: profile.handle,
						iconURL: profile.titlePhoto,
					})
					.setThumbnail(profile.titlePhoto)
					.addFields({
						name: bot.i18n.get(interaction, "words.problemas"),
						value: problems.join("\n"),
					})
			} else {
				var embed = bot
					.createEmbed("#551976")
					.setTitle(bot.i18n.get(interaction, "commands.stalk.response_none", { AMIGO: profile.handle }))
					.setAuthor({
						name: profile.handle,
						iconURL: profile.titlePhoto,
					})
					.setThumbnail(profile.titlePhoto)
			}

			await interaction.editReply({
				embeds: [embed],
			})
		} catch (error) {
			if (error.message === "Usuário não encontrado") {
				return interaction.editReply({
					content: bot.i18n.get(interaction, "errors.handle_not_found", { HANDLE: error.cause }),
				})
			}
			console.error(`stalk: ${error}`)
			interaction.editReply({
				content: bot.i18n.get(interaction, "errors.exception"),
			})
		}
	},
}
