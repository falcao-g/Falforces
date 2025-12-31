const { paginate } = require("../utils/functions.js")
const { SlashCommandBuilder, ButtonBuilder } = require("discord.js")

module.exports = {
	data: new SlashCommandBuilder()
		.setName("achievements")
		.setNameLocalizations({
			"pt-BR": "conquistas",
			"es-ES": "logros",
		})
		.setDescription("View your achievements")
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

			let user = await bot.loadUser(interaction.options.getString("user"), "codeforces").catch(async (error) => {
				throw new Error("User not found", { cause: interaction.options.getString("user") })
			})
			const createList = (user, page, itemsPerPage = 7) => {
				const achievements = Array.from(bot.achievements.all().values()).splice(page * itemsPerPage, itemsPerPage)

				let returnValue = ""
				for (const achievement of achievements) {
					const progress = achievement.progress(user)
					const name = achievement.hasAchieved(user)
						? `~~${bot.i18n.get(interaction, `achievements.${achievement.id}.name`)}~~`
						: bot.i18n.get(interaction, `achievements.${achievement.id}.name`)
					returnValue += `${achievement.emoji} **${name}**${
						progress !== false && !achievement.hasAchieved(user) ? ` (${progress})` : ""
					}\n> ${bot.i18n.get(interaction, `achievements.${achievement.id}.description`)}\n\n`
				}

				return returnValue.trim()
			}

			const embeds = []
			let page = 0
			const total = Math.ceil(bot.achievements.all().size / 7)
			let achievements = createList(user, page)
			while (achievements) {
				const embed = bot
					.createEmbed("#551976")
					.setTitle(
						bot.i18n.get(interaction, "commands.achievements.embed.title", {
							HANDLE: user.handle,
							PAGE: page + 1,
							TOTAL: total,
						})
					)
					.setDescription(achievements)
				embeds.push(embed)
				page++
				achievements = createList(user, page)
				console.log("a")
			}

			const paginator = paginate()
			paginator.add(...embeds)
			const ids = [`${Date.now()}__left`, `${Date.now()}__right`]
			paginator.setTraverser([
				new ButtonBuilder().setEmoji("⬅️").setCustomId(ids[0]).setStyle("Secondary"),
				new ButtonBuilder().setEmoji("➡️").setCustomId(ids[1]).setStyle("Secondary"),
			])
			const message = await bot.editReply(interaction, paginator.components())
			message.channel.createMessageComponentCollector().on("collect", async (i) => {
				if (i.customId === ids[0]) {
					await paginator.back()
					await i.update(paginator.components())
				} else if (i.customId === ids[1]) {
					await paginator.next()
					await i.update(paginator.components())
				}
			})
		} catch (error) {
			if (error.message === "User not found") {
				return interaction.editReply({
					content: bot.i18n.get(interaction, "errors.handle_not_found", { HANDLE: error.cause }),
				})
			}
			console.error(`achievements: ${error}`)
			interaction.editReply({
				content: bot.i18n.get(interaction, "errors.exception"),
			})
		}
	},
}
