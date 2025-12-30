const mongoose = require("mongoose")

class databaseHandler {
	async connect() {
		try {
			mongoose.set("strictQuery", false)
			mongoose.connect(process.env.MONGODB_URI, {
				keepAlive: true,
			})
		} catch {
			console.log("There was an error connecting to the database. Reconnecting...")
			mongoose.connect(process.env.MONGODB_URI)
		}

		mongoose.connection.on("error", (err) => {
			console.log(`Error connecting to database: ${err}`)
			mongoose.connect(process.env.MONGODB_URI)
		})

		mongoose.connection.on("disconnected", () => {
			console.log("Database disconnected. Reconnecting...")
			mongoose.connect(process.env.MONGODB_URI)
		})

		mongoose.connection.on("disconnecting", () => {
			console.log("Database disconnecting. Reconnecting...")
			mongoose.connect(process.env.MONGODB_URI)
		})

		mongoose.connection.on("MongoNetworkError", () => {
			console.log("MongoNetworkError occurred. Reconnecting...")
			mongoose.connect(process.env.MONGODB_URI)
		})

		mongoose.connection.on("MongooseServerSelectionError", () => {
			console.log("MongooseServerSelectionError occurred. Reconnecting...")
			mongoose.connect(process.env.MONGODB_URI)
		})
	}
}

module.exports = new databaseHandler()
