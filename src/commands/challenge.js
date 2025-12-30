const { SlashCommandBuilder } = require("discord.js")

function pickProblem({ problems, minRating, maxRating, preferTags = [], avoidTags = [] }) {
	const pool = problems.filter(
		(p) =>
			p.rating >= minRating &&
			p.rating <= maxRating &&
			(preferTags.length === 0 || p.tags.some((t) => preferTags.includes(t))) &&
			(avoidTags.length === 0 || !p.tags.some((t) => avoidTags.includes(t))) &&
			!p.tags.includes("*special")
	)

	return pool[Math.floor(Math.random() * pool.length)]
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName("desafio")
		.setNameLocalizations({ "en-US": "challenge", "es-ES": "desafío" })
		.setDescription("Cria um desafio personalizado para você no Codeforces")
		.setDescriptionLocalizations({
			"en-US": "Create a personalized Codeforces challenge for you",
			"es-ES": "Crea un desafío personalizado para ti en Codeforces",
		})
		.addStringOption((opt) =>
			opt
				.setName("usuario")
				.setNameLocalizations({ "en-US": "user", "es-ES": "usuario" })
				.setDescription("Seu usuario no Codeforces")
				.setDescriptionLocalizations({
					"en-US": "Your Codeforces handle",
					"es-ES": "Tu usuario de Codeforces",
				})
				.setRequired(true)
		),

	execute: async ({ interaction, bot }) => {
		try {
			await interaction.deferReply().catch(() => {})
			const handle = interaction.options.getString("usuario")
			const profile = await bot.loadUser(handle, "codeforces")

			const baseRating = profile.rating || profile.maxRating || 1200

			const tagFreq = {}
			const solvedSet = new Set()

			profile.submissions.forEach((s) => {
				if (s.verdict !== "OK") return
				solvedSet.add(`${s.contestId}${s.problem.index}`)
				s.problem.tags.forEach((tag) => {
					tagFreq[tag] = (tagFreq[tag] || 0) + 1
				})
			})

			const familiarTags = Object.entries(tagFreq)
				.sort((a, b) => b[1] - a[1])
				.slice(0, 5)
				.map(([tag]) => tag)

			const unfamiliarTags = Object.entries(tagFreq)
				.sort((a, b) => a[1] - b[1])
				.slice(0, 5)
				.map(([tag]) => tag)

			const res = await fetch("https://codeforces.com/api/problemset.problems")
			const problems = await res
				.json()
				.then((res) => res.result.problems.filter((p) => p.rating && !solvedSet.has(`${p.contestId}${p.index}`)))

			const pick = (opts) => pickProblem({ problems, ...opts })

			const easy = pick({
				minRating: baseRating - 400,
				maxRating: baseRating - 200,
				preferTags: familiarTags,
			})

			const medium = pick({
				minRating: baseRating - 200,
				maxRating: baseRating - 100,
			})

			const hard = pick({
				minRating: baseRating + 100,
				maxRating: baseRating + 500,
				preferTags: unfamiliarTags,
			})

			const fmt = (p) =>
				`**[${p.name}](https://codeforces.com/problemset/problem/${p.contestId}/${p.index})**  
				⭐ ${p.rating}\n🏷 ${p.tags.join(", ")}`

			const embed = bot
				.createEmbed("#551976")
				.setTitle(bot.i18n.get(interaction, "commands.challenge.embed.title"))
				.setAuthor({ name: profile.handle, iconURL: profile.titlePhoto })
				.addFields(
					{ name: bot.i18n.get(interaction, "commands.challenge.embed.field_easy"), value: fmt(easy), inline: true },
					{
						name: bot.i18n.get(interaction, "commands.challenge.embed.field_medium"),
						value: fmt(medium),
						inline: true,
					},
					{ name: bot.i18n.get(interaction, "commands.challenge.embed.field_hard"), value: fmt(hard), inline: true }
				)

			await interaction.editReply({ embeds: [embed] })
		} catch (error) {
			console.error(`challenge: ${error}`)
			interaction.editReply({
				content: bot.i18n.get(interaction, "errors.exception"),
			})
		}
	},
}
