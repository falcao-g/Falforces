const mongoose = require("mongoose")

const guildSchema = mongoose.Schema(
	{
		_id: { type: String, required: true },
		notificationChannel: { type: String, default: null },
	},
	{
		versionKey: false,
		timestamps: true,
	}
)

module.exports = mongoose.model("guilds", guildSchema)
