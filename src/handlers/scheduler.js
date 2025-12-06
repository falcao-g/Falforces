const MinHeap = require("../utils/minHeap")

class ReminderScheduler {
	constructor(bot) {
		this.bot = bot
		this.heap = new MinHeap()
		this.timer = null
	}

	all() {
		return this.heap.heap
	}

	loadContests(contests) {
		for (const contest of contests) {
			this.addContest(contest, false)
		}
		this.scheduleNext()
	}

	addContest(contest, schedule = true) {
		const now = Math.floor(Date.now() / 1000)

		for (const reminder of contest.notificationTimes) {
			if (!reminder.sent && reminder.timestamp > now) {
				this.heap.push({
					timestamp: reminder.timestamp,
					contest: contest,
				})
			}
		}
		if (schedule) this.scheduleNext()
	}

	removeContest(contestId) {
		this.heap.remove(contestId)
	}

	scheduleNext() {
		if (this.timer) clearTimeout(this.timer)

		const next = this.heap.peek()
		if (!next) {
			console.log("[ReminderScheduler] No events scheduled.")
			return
		}

		const now = Math.floor(Date.now() / 1000)
		const ms = Math.max(0, (next.timestamp - now) * 1000)

		console.log(`[ReminderScheduler] Next event in ${ms / 1000}s`)

		this.timer = setTimeout(() => this.executeNext(), ms)
	}

	async executeNext() {
		const job = this.heap.pop()
		if (!job) return

		const contest = job.contest
		if (!contest) return this.scheduleNext()

		const now = Math.floor(Date.now() / 1000)

		if (now >= contest.data.startTimeSeconds) {
			await this.bot.notificationSchema.deleteOne({ _id: contest._id })
			this.bot.notifications.delete(contest._id)
			return this.scheduleNext()
		}

		const reminder = contest.notificationTimes.find((r) => r.timestamp === job.timestamp && !r.sent)

		if (!reminder) return this.scheduleNext()

		await this.bot.sendContestReminder(contest)

		reminder.sent = true
		await this.bot.notificationSchema.updateOne(
			{ _id: contest._id },
			{ $set: { notificationTimes: contest.notificationTimes } }
		)

		this.scheduleNext()
	}
}

module.exports = ReminderScheduler
