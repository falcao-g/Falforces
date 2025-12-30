const { SlashCommandBuilder } = require("discord.js")

module.exports = {
	data: new SlashCommandBuilder()
		.setName("profile")
		.setNameLocalizations({
			"pt-BR": "perfil",
			"es-ES": "perfil",
		})
		.setDescription("Access information such as rating, solved problems and more of a codeforces user")
		.setDescriptionLocalizations({
			"pt-BR": "Acesse informações como rating, problemas resolvidos e mais de um usuário do codeforces",
			"es-ES": "Accede a información como calificación, problemas resueltos y más de un usuario de codeforces",
		})
		.addStringOption((string) =>
			string
				.setName("user")
				.setNameLocalizations({
					"pt-BR": "usuario",
					"es-ES": "usuario",
				})
				.setDescription("Name of the user on codeforces")
				.setDescriptionLocalizations({
					"pt-BR": "Nome do usuário no codeforces",
					"es-ES": "Nombre del usuario en codeforces",
				})
				.setRequired(true)
		),
	execute: async ({ interaction, bot }) => {
		try {
			await interaction.deferReply().catch(() => {})
			const user = interaction.options.getString("user")

			let data = await bot.loadUser(user, "codeforces").catch(async (error) => {
				throw new Error("User not found", { cause: user })
			})

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

			var name = ``
			if (data.firstName != undefined && data.lastName != undefined) {
				name = ` (${data.firstName} ${data.lastName})`
			} else if (data.firstName != undefined) {
				name = ` (${data.firstName})`
			} else {
				name += data.lastName != undefined ? ` (${data.lastName})` : ""
			}

			var info = ``
			info +=
				data.country != undefined
					? bot.i18n.get(interaction, "commands.profile.country", { COUNTRY: data.country })
					: ""
			info += data.city != undefined ? bot.i18n.get(interaction, "commands.profile.city", { CITY: data.city }) : ""
			info +=
				data.organization != undefined
					? bot.i18n.get(interaction, "commands.profile.organization", { ORGANIZATION: data.organization })
					: ""
			info += bot.i18n.get(interaction, "commands.profile.friends", { FRIENDS: data.friendOfCount })
			info += bot.i18n.get(interaction, "commands.profile.contribution", { CONTRIBUTION: data.contribution })
			info +=
				data.solvedCount > 0
					? bot.i18n.get(interaction, "commands.profile.hardest", { HARDEST: data.hardestSolved })
					: ""

			var stats = ``
			stats += bot.i18n.get(interaction, "commands.profile.tries", { TRIES: data.triedCount })
			stats += bot.i18n.get(interaction, "commands.profile.solved", { SOLVED: data.solvedCount })
			stats += bot.i18n.get(interaction, "commands.profile.contests", { CONTESTS: data.contestCount })
			stats +=
				data.solvedCount > 0
					? bot.i18n.get(interaction, "commands.profile.tags", {
							TAG1: data.tags[0][0],
							TAG2: data.tags[1][0],
							TAG3: data.tags[2][0],
					  })
					: ""
			stats += bot.i18n.get(interaction, "commands.profile.top_language", { TOP_LANGUAGE: data.topLanguage })
			stats += bot.i18n.get(interaction, "commands.profile.submissions", { SUBMISSIONS: data.submissionCount })
			stats += bot.i18n.get(interaction, "commands.profile.days_in_row", { DAYS_IN_ROW: data.maxDaysInRow })

			var badges = await bot.getBadges(data.handle)

			const embed = bot
				.createEmbed(colors[data.rank ?? "newbie"])
				.setTitle(`${data.handle}` + name)
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
						name: bot.i18n.get(interaction, "words.statistics"),
						value: stats,
						inline: true,
					},
					{
						name: bot.i18n.get(interaction, "words.information"),
						value: info,
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

			if (badges.length > 0) {
				embed.addFields({
					name: bot.i18n.get(interaction, "words.badges"),
					value: badges.join(", "),
				})
			}

			await interaction.editReply({
				embeds: [embed],
			})
		} catch (error) {
			if (error.message === "User not found") {
				return interaction.editReply({
					content: bot.i18n.get(interaction, "errors.handle_not_found", {
						HANDLE: error.cause,
					}),
				})
			}
			console.error(`profile: ${error}`)
			interaction.editReply({
				content: bot.i18n.get(interaction, "errors.exception"),
			})
		}
	},
}
