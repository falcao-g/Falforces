const { SlashCommandBuilder } = require("discord.js")

module.exports = {
	data: new SlashCommandBuilder()
		.setName("perfil")
		.setDescription("Acesse informações como rating, problemas resolvidos e mais de um usuário do codeforces")
		.setDMPermission(false)
		.addStringOption((string) =>
			string.setName("usuario").setDescription("Nome do usuário no codeforces").setRequired(true)
		),
	execute: async ({ interaction, instance }) => {
		await interaction.deferReply().catch(() => {})
		const user = interaction.options.getString("usuario")

		let data = await instance.loadUser(user, "codeforces")

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
		estatisticas += `🌐 Linguagem mais usada: ${data.topLanguage}\n`
		estatisticas += `🖥️ Número de submissões: ${data.submissionCount}`

		var insignias = await instance.getInsignias(data.handle)

		if (insignias.length > 0) {
			embed.addFields({
				name: "Insígnias",
				value: insignias.join(", "),
			})
		}

		const embed = instance
			.createEmbed(colors[data.rank ?? "newbie"])
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

		await interaction.editReply({
			embeds: [embed],
		})
	},
}
