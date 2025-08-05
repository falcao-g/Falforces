const mongoose = require("mongoose")

const submissionSchema = mongoose.Schema({
	_id: false,
	contestId: { type: Number, default: 0 },
	creationTimeSeconds: { type: Number, default: 0 },
	problem: {
		index: { type: String, default: "" },
		name: { type: String, default: "" },
		type: { type: String, default: "" },
		rating: { type: Number, default: 0 },
		tags: { type: Array, default: [] },
	},
	programmingLanguage: { type: String, default: "" },
	verdict: { type: String, default: "" },
})

const profileSchema = new mongoose.Schema(
	{
		_id: String, // e.g. "codeforces:tourist"
		platform: { type: String, required: true }, // "codeforces", "leetcode", etc.
		handle: { type: String, required: true }, // the user’s handle on that platform
		submissions: { type: [submissionSchema], default: [] },
		firstName: { type: String, default: "" },
		lastName: { type: String, default: "" },
		country: { type: String, default: "" },
		city: { type: String, default: "" },
		organization: { type: String, default: "" },
		contribution: { type: Number, default: 0 },
		rank: { type: String, default: "" },
		rating: { type: Number, default: 0 },
		maxRank: { type: String, default: "" },
		maxRating: { type: Number, default: 0 },
		lastOnlineTimeSeconds: { type: Number, default: 0 },
		registrationTimeSeconds: { type: Number, default: 0 },
		friendOfCount: { type: Number, default: 0 },
		avatar: { type: String, default: "" },
		titlePhoto: { type: String, default: "" },
		discordId: { type: String, default: null },
		triedCount: { type: Number, default: 0 },
		solvedCount: { type: Number, default: 0 },
		hardestSolved: { type: String, default: "" },
		contestCount: { type: Number, default: 0 },
		tags: { type: Array, default: [] },
		submissionCount: { type: Number, default: 0 },
		lastFetched: { type: Number, default: 0 },
	},
	{
		versionKey: false,
	}
)

profileSchema.index({ platform: 1, handle: 1 }, { unique: true })

module.exports = mongoose.model("profiles", profileSchema)
