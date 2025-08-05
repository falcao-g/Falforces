const mongoose = require("mongoose")

const userSchema = mongoose.Schema(
	{
		_id: { type: String, required: true },
		profiles: [{ type: "String", ref: "profiles" }],
	},
	{
		versionKey: false,
		timestamps: true,
	}
)

module.exports = mongoose.model("users", userSchema)
