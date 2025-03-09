const { SlashCommandBuilder, EmbedBuilder } = require("discord.js")

module.exports = {
	data: new SlashCommandBuilder()
		.setName("perfil")
		.setDescription("Verifica o perfil de um usuário no Codeforces.")
		.setDMPermission(false)
		.addStringOption((string) => string.setName("user").setDescription("Nome do usuário").setRequired(true)),
	execute: async ({ interaction, instance }) => {
		try {
			await interaction.deferReply().catch(() => {})
			const user = interaction.options.getString("user")

			var request = await fetch(`https://codeforces.com/api/user.info?handles=${user}&checkHistoricHandles=false`, {
				method: "GET",
			})

			var data = await request.json()

			if (data.status === "OK") {
				data = data.result[0]
			} else {
				throw new Error("User not found")
			}

			request = await fetch(`https://codeforces.com/api/user.status?handle=${user}&from=1&count=1000000`, {
				method: "GET",
			})

			submissoes = await request.json()

			if (submissoes.status === "OK") {
				submissoes = submissoes.result
			} else {
				throw new Error("User not found")
			}

			const triedProblems = new Set()
			const contests = new Set()
			const solvedProblems = new Set()
			const favoriteTags = new Map()

			var hardestSolvedRating = 0
			var hardestSolved = ``
			submissoes.forEach((submissao) => {
				triedProblems.add(submissao.problem.name)

				if (submissao.verdict === "OK") {
					solvedProblems.add(submissao.problem.name)

					if (submissao.problem.rating > hardestSolvedRating) {
						hardestSolved = `${submissao.problem.name} | ${submissao.problem.rating}`
						hardestSolvedRating = submissao.problem.rating
					}

					submissao.problem.tags.forEach((tag) => {
						if (favoriteTags.has(tag)) {
							favoriteTags.set(tag, favoriteTags.get(tag) + 1)
						} else {
							favoriteTags.set(tag, 1)
						}
					})
				}

				if (submissao.author.participantType === "CONTESTANT") {
					contests.add(submissao.contestId)
				}
			})
			data.triedCount = triedProblems.size
			data.solvedCount = solvedProblems.size
			data.hardestSolved = hardestSolved
			data.contestCount = contests.size
			data.tags = Array.from(favoriteTags).sort((a, b) => b[1] - a[1])
			data.submissionCount = submissoes.length

			const colors = {
				newbie: "#808080",
				pupil: "#88CC23",
				apprentice: "#008002",
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
			informacoes += data.country != undefined ? `🗺️ País: ${data.country}\n` : ""
			informacoes += data.city != undefined ? `🏙️ Cidade: ${data.city}\n` : ""
			informacoes += data.organization != undefined ? `🏛️ Organização: ${data.organization}\n` : ""
			informacoes += `⭐ Número de amigos: ${data.friendOfCount}\n`
			informacoes += `✍️ Contribuição: ${data.contribution}`

			var estatisticas = ``
			estatisticas += `🧠 Problemas tentados: ${data.triedCount}\n`
			estatisticas += `🎈 Problemas resolvidos: ${data.solvedCount}\n`
			estatisticas += data.solvedCount > 0 ? `🔥 Problema mais difícil: ${data.hardestSolved}\n` : ""
			estatisticas += `🏆 Contests participados: ${data.contestCount}\n`
			estatisticas +=
				data.solvedCount > 0 ? `🏷️ Tags favoritas: ${data.tags[0][0]}, ${data.tags[1][0]}, ${data.tags[2][0]}\n` : ""
			estatisticas += `🖥️ Número de submissões: ${data.submissionCount}`

			var insignias = instance.getInsignias(data.handle)

			const embed = new EmbedBuilder()
				.setColor(colors[data.rank ?? "newbie"])
				.setTitle(`${data.handle}` + nome)
				.setDescription(
					`🚀 Rating atual: ${data.rating ?? 0} | Máximo: ${data.maxRating ?? 0}\n👑 Rank atual: ${
						data.rank ?? "newbie"
					} | Máximo: ${data.maxRank ?? "newbie"}`
				)
				.setThumbnail(data.titlePhoto)
				.addFields(
					{
						name: "Estatísticas",
						value: estatisticas,
						inline: true,
					},
					{
						name: "Informações",
						value: informacoes,
						inline: true,
					}
				)
				.setFooter({
					text: `
							📸 Visto por último em: ${new Date(
								data.lastOnlineTimeSeconds * 1000
							).toLocaleDateString()} | 📋 Registrado em: ${new Date(
						data.registrationTimeSeconds * 1000
					).toLocaleDateString()}\nby Falcão ❤️`,
				})

			if (insignias.length > 0) {
				embed.addFields({
					name: "Insígnias",
					value: insignias.join(", "),
				})
			}

			await interaction.editReply({
				embeds: [embed],
			})
		} catch (error) {
			console.error(`perfil: ${error}`)
			interaction.editReply({
				content: instance.getMessage(interaction, "EXCEPTION"),
			})
		}
	},
}
