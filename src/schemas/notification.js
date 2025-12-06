const mongoose = require("mongoose")

const guildSchema = mongoose.Schema(
	{
		_id: { type: String, required: true },
		type: { type: String, required: true },
		name: { type: String, required: true },
		data: { type: mongoose.Schema.Types.Mixed, required: true },
		notificationTimes: { type: [{ timestamp: Number, sent: Boolean }], default: [] },
	},
	{
		versionKey: false,
		timestamps: true,
	}
)

module.exports = mongoose.model("notifications", guildSchema)
