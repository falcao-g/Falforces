const { Client, GatewayIntentBits, Collection, EmbedBuilder, ActivityType } = require("discord.js")
const { loadEvents } = require("./handlers/eventsHandler.js")
const { loadCommands } = require("./handlers/commandsHandler.js")
require("dotenv").config()
const TEN_MINUTES = 10 * 60 * 1000

class Bot {
	config = require("./config.json")
	databaseHandler = require("./handlers/databaseHandler")
	_messages = require("./utils/json/messages.json")
	_contests = require("./utils/json/contests.json")
	userSchema = require("./schemas/user")
	profileSchema = require("./schemas/profile")
	guildSchema = require("./schemas/guild")
	client = new Client({
		shards: "auto",
		intents: [GatewayIntentBits.Guilds],
	})
	upcomingContests = new Set()

	constructor() {
		this.client.on("ready", () => {
			console.log("Bot online")
			this.client.on("error", console.error)

			this.client.events = new Collection()
			this.client.commands = new Collection()

			loadEvents(this, this.client)
			loadCommands(this, this.client)

			this.client.user.setPresence({
				status: "online",
				activities: [
					{
						type: ActivityType.Custom,
						name: "CustomStatus",
						state: `Promovendo a Programação Competitiva de forma divertida!`,
					},
				],
			})
		})

		this.client.login(process.env.TOKEN)
		this.databaseHandler.connect(process.env.MONGODB_URI)

		this.client.on("ready", async () => {
			const fetchContests = async () => {
				const response = await fetch("https://codeforces.com/api/contest.list")
				const data = await response.json()
				const contests = data.result.filter((contest) => contest.phase === "BEFORE")

				for (const contest of contests) {
					contest.reminded1day = false
					contest.reminded1hour = false
					this.upcomingContests.add(contest)
				}
				console.log("fetched contests")
			}

			const notifyContests = async () => {
				for (const contest of this.upcomingContests) {
					const timeRemaining = contest.startTimeSeconds * 1000 - Date.now()
					if (timeRemaining <= 1000 * 60 * 60 * 24) {
						if (!contest.reminded1day) {
							contest.reminded1day = true
						} else if (timeRemaining <= 1000 * 60 * 60 * 1 && !contest.reminded1hour) {
							contest.reminded1hour = true
						} else {
							this.upcomingContests.delete(contest)
							continue
						}

						console.log("i will try to inform about contest:", contest.name)
						const guilds = await this.guildSchema.find({ notificationChannel: { $ne: null } })
						guilds.forEach(async (guild) => {
							var notificationChannel = guild.notificationChannel
							guild = await this.client.guilds.fetch(guild.id)
							const channel = guild.channels.cache.get(notificationChannel)
							if (channel) {
								const embed = this.createEmbed("#C12127")
									.setTitle(`${contest.name}`)
									.setDescription(
										`O contest vai começar <t:${contest.startTimeSeconds}:R>!\n\n**Início:** <t:${
											contest.startTimeSeconds
										}:F>\n**Duração:** ${contest.durationSeconds / 60 / 60} horas\n**Tipo:** ${contest.type}`
									)
									.setURL(`https://codeforces.com/contests/${contest.id}`)

								channel.send({ embeds: [embed] })
							}
						})
					}
				}
			}

			await fetchContests()
			await notifyContests()
			setInterval(fetchContests, 1000 * 60 * 60 * 3)
			setInterval(notifyContests, 1000 * 60 * 30)
		})
	}

	getMessage(interaction, messageId, args = {}) {
		const message = this._messages[messageId]
		if (!message) {
			console.error(`Could not find the correct message to send for "${messageId}"`)
			return "Could not find the correct message to send. Please report this to the bot developer."
		}

		const locale = interaction.locale ?? "pt-BR"
		let result = message[locale] ?? message["en-US"]

		for (const key of Object.keys(args)) {
			const expression = new RegExp(`{${key}}`, "g")
			result = result.replace(expression, args[key])
		}

		return result
	}

	async editReply(interaction, { content, embeds, components, fetchReply = false }) {
		return await interaction
			.editReply({
				content,
				embeds,
				components,
				fetchReply,
			})
			.catch((err) => {
				console.error(err)
			})
	}

	async getInsignias(handle) {
		const insignias = []
		const contests = this._contests

		for (const contest of contests) {
			if (contest.participantes.includes(handle)) {
				insignias.push(await this.client.application.emojis.fetch(contest.insignia))
			}
		}

		return insignias
	}

	async fetchAndMerge(user) {
		var request = await fetch(
			`https://codeforces.com/api/user.info?handles=${user.handle}&checkHistoricHandles=false`,
			{
				method: "GET",
			}
		)

		var data = await request.json()
		Object.assign(user, data.result[0])

		const subRes = await fetch(`https://codeforces.com/api/user.status?handle=${user.handle}&from=1&count=1000000`)
		const allSubs = (await subRes.json()).result

		const triedProblems = new Set()
		const contests = new Set()
		const solvedProblems = new Set()
		const favoriteTags = new Map()

		var hardestSolvedRating = 0
		var hardestSolved = ``
		var languages = new Map()
		allSubs.forEach((submissao) => {
			triedProblems.add(submissao.problem.name)

			if (submissao.programmingLanguage && submissao.programmingLanguage !== "unknown") {
				languages.set(submissao.programmingLanguage, (languages.get(submissao.programmingLanguage) || 0) + 1)
			}

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

		user.triedCount = triedProblems.size
		user.solvedCount = solvedProblems.size
		user.hardestSolved = hardestSolved
		user.contestCount = contests.size
		user.topLanguage =
			Array.from(languages.entries())
				.sort((a, b) => b[1] - a[1])
				.map((lang) => lang[0])[0] || "Unknown"
		user.tags = Array.from(favoriteTags).sort((a, b) => b[1] - a[1])
		user.submissionCount = allSubs.length

		const cutoff = (Math.max(...user.submissions.map((s) => s.creationTimeSeconds)) * 1000) / 1000
		const newSubs = allSubs.filter((s) => s.creationTimeSeconds > cutoff)

		if (newSubs.length) {
			user.submissions.unshift(...newSubs)
		}

		user.lastFetched = Date.now()
		await user.save()
		return user
	}

	async loadUser(handle, platform) {
		let user = await this.profileSchema.findById(`${platform}:${handle}`)

		if (user && Date.now() - user.lastFetched < TEN_MINUTES) {
			return user
		}

		if (!user) {
			user = new this.profileSchema({
				_id: `${platform}:${handle}`,
				platform,
				handle,
			})
		}

		return await this.fetchAndMerge(user)
	}

	createEmbed(color = "Random") {
		return new EmbedBuilder().setColor(color).setFooter({ text: "by Falcão ❤️" })
	}
}

Bot = new Bot()
