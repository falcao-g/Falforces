const { SlashCommandBuilder } = require("discord.js")

module.exports = {
	data: new SlashCommandBuilder()
		.setName("perfil")
		.setDescription("Acesse informações como rating, problemas resolvidos e mais de um usuário do codeforces")
		.setDescriptionLocalizations({
			"en-US": "Access information such as rating, solved problems and more of a codeforces user",
			"es-ES": "Accede a información como calificación, problemas resueltos y más de un usuario de codeforces",
		})
		.addStringOption((string) =>
			string.setName("usuario").setDescription("Nome do usuário no codeforces").setRequired(true)
		),
	execute: async ({ interaction, bot }) => {
		try {
			await interaction.deferReply().catch(() => {})
			const user = interaction.options.getString("usuario")

			let data = await bot.loadUser(user, "codeforces")

			const colors = {
				newbie: "#808080",
				pupil: "#008002",
				specialist: "#05A89F",
				expert: "#0000FF",
				"candidate master": "#AA01AA",
				master: "#FF8C00",
				"international master": "#FF8C00",
				grandmaster: "#FF0000",
				"international grandmaster": "#FF0000",
				"legendary grandmaster": "#FF0000",
			}

			var nome = ``
			if (data.firstName != undefined && data.lastName != undefined) {
				nome = ` (${data.firstName} ${data.lastName})`
			} else if (data.firstName != undefined) {
				nome = ` (${data.firstName})`
			} else {
				nome += data.lastName != undefined ? ` (${data.lastName})` : ""
			}

			var informacoes = ``
			informacoes +=
				data.country != undefined ? bot.i18n.get(interaction, "commands.profile.country", { PAIS: data.country }) : ""
			informacoes +=
				data.city != undefined ? bot.i18n.get(interaction, "commands.profile.city", { CIDADE: data.city }) : ""
			informacoes +=
				data.organization != undefined
					? bot.i18n.get(interaction, "commands.profile.organization", { ORGANIZATION: data.organization })
					: ""
			informacoes += bot.i18n.get(interaction, "commands.profile.friends", { FRIENDS: data.friendOfCount })
			informacoes += bot.i18n.get(interaction, "commands.profile.contribution", { CONTRIBUTION: data.contribution })

			var estatisticas = ``
			estatisticas += bot.i18n.get(interaction, "commands.profile.tries", { TRIES: data.triedCount })
			estatisticas += bot.i18n.get(interaction, "commands.profile.solved", { SOLVED: data.solvedCount })
			estatisticas +=
				data.solvedCount > 0
					? bot.i18n.get(interaction, "commands.profile.hardest", { HARDEST: data.hardestSolved })
					: ""
			estatisticas += bot.i18n.get(interaction, "commands.profile.contests", { CONTESTS: data.contestCount })
			estatisticas +=
				data.solvedCount > 0
					? bot.i18n.get(interaction, "commands.profile.tags", {
							TAG1: data.tags[0][0],
							TAG2: data.tags[1][0],
							TAG3: data.tags[2][0],
					  })
					: ""
			estatisticas += bot.i18n.get(interaction, "commands.profile.top_language", { TOP_LANGUAGE: data.topLanguage })
			estatisticas += bot.i18n.get(interaction, "commands.profile.submissions", { SUBMISSIONS: data.submissionCount })

			var insignias = await bot.getInsignias(data.handle)

			const embed = bot
				.createEmbed(colors[data.rank ?? "newbie"])
				.setTitle(`${data.handle}` + nome)
				.setDescription(
					bot.i18n.get(interaction, "commands.profile.embed.description", {
						RANK: data.rank ?? "newbie",
						MAXRANK: data.maxRank ?? "newbie",
						RATING: data.rating ?? "0",
						MAXRATING: data.maxRating ?? "0",
					})
				)
				.setThumbnail(data.titlePhoto)
				.addFields(
					{
						name: bot.i18n.get(interaction, "words.estatisticas"),
						value: estatisticas,
						inline: true,
					},
					{
						name: bot.i18n.get(interaction, "words.informacoes"),
						value: informacoes,
						inline: true,
					}
				)
				.setFooter({
					text:
						bot.i18n.get(interaction, "commands.profile.embed.footer", {
							LAST_SEEN: new Date(data.lastOnlineTimeSeconds * 1000).toLocaleDateString(),
							REGISTERED: new Date(data.registrationTimeSeconds * 1000).toLocaleDateString(),
						}) + "\nby Falcão ❤️",
				})

			if (insignias.length > 0) {
				embed.addFields({
					name: bot.i18n.get(interaction, "words.insignias"),
					value: insignias.join(", "),
				})
			}

			await interaction.editReply({
				embeds: [embed],
			})
		} catch (error) {
			console.error(`profile: ${error}`)
			interaction.editReply({
				content: bot.i18n.get(interaction, "errors.exception"),
			})
		}
	},
}
