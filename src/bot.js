const { Client, GatewayIntentBits, Collection, EmbedBuilder, ActivityType } = require("discord.js")
const { loadEvents } = require("./handlers/events.js")
const { loadCommands } = require("./handlers/commands.js")
const { fetchUpcomingContests } = require("@qatadaazzeh/atcoder-api")
const I18n = require("./handlers/i18n.js")
const TEN_MINUTES = 10 * 60 * 1000
const ONE_HOUR = 60 * 60 * 1000
const ONE_DAY = 24 * 60 * 60 * 1000
class Bot {
	config = require("./config.json")
	databaseHandler = require("./handlers/database.js")
	i18n = new I18n({ defaultLocale: "pt-BR" })
	_contests = require("./utils/json/contests.json")
	userSchema = require("./schemas/user")
	profileSchema = require("./schemas/profile")
	guildSchema = require("./schemas/guild")
	notificationSchema = require("./schemas/notification")
	scheduler = new (require("./handlers/scheduler.js"))(this)
	client = new Client({
		shards: "auto",
		intents: [GatewayIntentBits.Guilds],
	})

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
			const contests = await this.notificationSchema.find()
			this.scheduler.loadContests(contests)

			const fetchContests = async () => {
				const responseCodeforces = await fetch("https://codeforces.com/api/contest.list")
				const atCoderData = await fetchUpcomingContests()
				const codeforcesData = (await responseCodeforces.json()).result.filter((c) => c.phase === "BEFORE")
				const everyContest = [...atCoderData, ...codeforcesData]

				for (const c of everyContest) {
					if (!(await this.notificationSchema.findById(c.contestId ?? c.id))) {
						var startTimeSeconds = Math.floor(new Date(c.contestTime).getTime() / 1000)
						const contest = {
							_id: c.id ?? c.contestId,
							name: c.contestName ?? c.name,
							type: c.contestType ?? c.type,
							data: {
								startTimeSeconds: c.startTimeSeconds ?? startTimeSeconds,
								durationSeconds: c.durationSeconds ?? parseDuration(c.contestDuration),
								url: c.contestUrl ?? `https://codeforces.com/contest/${c.id}`,
							},
							notificationTimes: [
								{ timestamp: c.startTimeSeconds ?? startTimeSeconds - ONE_DAY / 1000, sent: false },
								{ timestamp: c.startTimeSeconds ?? startTimeSeconds - ONE_HOUR / 1000, sent: false },
							],
						}
						await this.notificationSchema.create(contest)
						this.scheduler.addContest(contest)
					}
				}
				console.log("fetched contests")
			}

			const parseDuration = (str) => {
				const parts = str.split(":").map(Number)
				if (parts.length === 2) return parts[0] * 3600 + parts[1] * 60
				if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2]
				return Number(str) * 60
			}

			await fetchContests()
			setInterval(fetchContests, 1000 * 60 * 60 * 3)
		})
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
		allSubs.sort((a, b) => a.creationTimeSeconds - b.creationTimeSeconds)

		const triedProblems = new Set()
		const contests = new Set()
		const solvedProblems = new Set()
		const favoriteTags = new Map()

		var hardestSolvedRating = 0
		var hardestSolved = ``
		var languages = new Map()

		var lastDay = null
		var currentStreak = 0
		var maxDaysInRow = 0
		allSubs.forEach((submissao) => {
			triedProblems.add(submissao.problem.name)

			if (submissao.programmingLanguage && submissao.programmingLanguage !== "unknown") {
				languages.set(submissao.programmingLanguage, (languages.get(submissao.programmingLanguage) || 0) + 1)
			}

			if (submissao.verdict === "OK") {
				solvedProblems.add(submissao.problem.name)

				const day = Math.floor(submissao.creationTimeSeconds / 86400)
				if (lastDay === null) {
					currentStreak = 1
				} else if (day === lastDay + 1) {
					currentStreak += 1
				} else if (day !== lastDay) {
					currentStreak = 1
				}
				lastDay = day
				maxDaysInRow = Math.max(maxDaysInRow, currentStreak)

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
		user.maxDaysInRow = maxDaysInRow
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

		var request = await fetch(`https://codeforces.com/api/user.info?handles=${handle}&checkHistoricHandles=false`, {
			method: "GET",
		})

		if (!request.ok) {
			throw new Error(`Failed to fetch user info: ${request.status} ${request.statusText}`)
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

	async sendContestReminder(contest) {
		console.log("[sendReminder] Sending reminder for contest:", contest)
		const guilds = await this.guildSchema.find({ notificationChannel: { $ne: null } })

		for (const g of guilds) {
			try {
				const guild = await this.client.guilds.fetch(g.id)
				const channel = guild.channels.cache.get(g.notificationChannel)
				if (!channel) continue

				const embed = this.createEmbed("#C12127")
					.setTitle(contest.name)
					.setDescription(
						this.i18n.get(null, "events.contest_notification", {
							TEMPO: `<t:${contest.data.startTimeSeconds}:R>`,
							INICIO: `<t:${contest.data.startTimeSeconds}:F>`,
							DURACAO: (contest.data.durationSeconds / 3600).toFixed(1),
							TIPO: contest.type,
						})
					)
					.setURL(contest.data.url)

				await channel.send({ embeds: [embed] })
			} catch (err) {
				console.error("[sendReminder] Error:", err)
			}
		}
	}

	createEmbed(color = "Random") {
		return new EmbedBuilder().setColor(color).setFooter({ text: "by Falcão ❤️" })
	}
}

Bot = new Bot()
