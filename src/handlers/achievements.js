function format(number) {
	return number.toLocaleString("en-US")
}

const achievements = [
	{
		id: "first_blood",
		emoji: ":white_check_mark:",
		hasAchieved: (user) => user.solvedCount >= 1,
		progress: (user) => `${format(user.solvedCount ?? 0)}/1`,
	},
	{
		id: "journey_begins",
		emoji: ":tada:",
		hasAchieved: (user) => user.solvedCount >= 10,
		progress: (user) => `${format(user.solvedCount ?? 0)}/10`,
	},
	{
		id: "centurion",
		emoji: ":100:",
		hasAchieved: (user) => user.solvedCount >= 100,
		progress: (user) => `${format(user.solvedCount ?? 0)}/100`,
	},
	{
		id: "tourist_archenemy",
		emoji: ":brain:",
		hasAchieved: (user) => user.solvedCount >= 500,
		progress: (user) => `${format(user.solvedCount ?? 0)}/500`,
	},
	{
		id: "comfort_zone",
		emoji: ":green_circle:",
		hasAchieved: (user) =>
			user.submissions.filter((s) => s.verdict === "OK" && s.problem.rating && s.problem.rating <= 1000).length >= 20,
		progress: (user) => {
			const count = user.submissions.filter(
				(s) => s.verdict === "OK" && s.problem.rating && s.problem.rating <= 1000
			).length
			return `${format(count)}/20`
		},
	},
	{
		id: "getting_harder",
		emoji: ":yellow_circle:",
		hasAchieved: (user) => user.submissions.filter((s) => s.verdict === "OK" && s.problem.rating >= 1400).length >= 10,
		progress: (user) => {
			const count = user.submissions.filter((s) => s.verdict === "OK" && s.problem.rating >= 1400).length
			return `${format(count)}/10`
		},
	},
	{
		id: "breaking_barriers",
		emoji: ":red_circle:",
		hasAchieved: (user) => user.submissions.some((s) => s.verdict === "OK" && s.problem.rating >= 1800),
		progress: () => false,
	},
	{
		id: "greedy_master",
		emoji: ":gear:",
		//user tags is an array where each element is another array with the first element being the tag name and the second element being the count of problems solved with that tag
		hasAchieved: (user) => user.tags.find((t) => t[0] === "greedy")?.[1] >= 30,
		progress: (user) => {
			const count = user.tags.find((t) => t[0] === "greedy")?.[1] || 0
			return `${format(count)}/30`
		},
	},
	{
		id: "dp_apprentice",
		emoji: ":brain:",
		hasAchieved: (user) => user.tags.find((t) => t[0] === "dp")?.[1] >= 15,
		progress: (user) => {
			const count = user.tags.find((t) => t[0] === "dp")?.[1] || 0
			return `${format(count)}/15`
		},
	},
	{
		id: "tag_collector",
		emoji: ":world_map:",
		hasAchieved: (user) => user.tags.length >= 10,
		progress: (user) => {
			return `${format(user.tags.length)}/10`
		},
	},
	{
		id: "lucky_7",
		emoji: ":seven:",
		hasAchieved: (user) => user.maxDaysInRow >= 7,
		progress: (user) => `${format(user.maxDaysInRow ?? 0)}/7`,
	},
	{
		id: "pick_your_team",
		emoji: ":busts_in_silhouette:",
		hasAchieved: (user) => user.friendOfCount >= 10,
		progress: (user) => `${format(user.friendOfCount ?? 0)}/10`,
	},
	{
		id: "where_is_my_medal",
		emoji: ":medal:",
		hasAchieved: (user) => user.contestCount >= 10,
		progress: (user) => `${format(user.contestCount ?? 0)}/10`,
	},
	{
		id: "never_give_up",
		emoji: ":muscle:",
		hasAchieved: (user) => user.triedCount != 0 && user.triedCount != user.solvedCount,
		progress: () => false,
	},
	{
		id: "community_helper",
		emoji: ":handshake:",
		hasAchieved: (user) => user.contribution >= 1,
		progress: () => false,
	},
]

class Achievement {
	_achievements = new Map(achievements.map((a) => [a.id, a]))

	constructor() {
		this._achievements = new Map(achievements.map((a) => [a.id, a]))
	}

	all() {
		return this._achievements
	}

	getById(id) {
		return this._achievements.get(id) ?? null
	}

	getByName(name) {
		return Array.from(this._achievements.values()).find((a) => a.name.toLowerCase() === name.toLowerCase()) ?? null
	}

	hasAchievement(id, user) {
		return this._achievements.get(id)?.hasAchieved(user) ?? false
	}

	getProgress(id, user) {
		return this._achievements.get(id)?.progress(user) ?? ""
	}

	// async sendAchievementMessage(interaction, userId, achievement) {
	// 	if (!achievement) return

	// 	const user = await database.findOne(userId)
	// 	if (user.badges.includes(achievement.id)) return
	// 	if (!this.hasAchievement(achievement.id, user)) return

	// 	await User.findByIdAndUpdate(userId, { $push: { badges: achievement.id } })

	// 	const responses = {
	// 		"pt-BR": `:tada: ${interaction.member} você desbloqueou a conquista ${achievement.emoji} **${
	// 			achievement.name[interaction.locale]
	// 		}**!`,
	// 		"en-US": `:tada: ${interaction.member} you've unlocked the ${achievement.emoji} **${
	// 			achievement.name[interaction.locale]
	// 		}** achievement!`,
	// 		"es-ES": `:tada: ¡${interaction.member} has desbloqueado el logro ${achievement.emoji} **${
	// 			achievement.name[interaction.locale]
	// 		}**!`,
	// 	}

	// 	await interaction.channel.send({
	// 		content: responses[interaction.locale],
	// 	})
	// }
}

module.exports = new Achievement()
