const { ShardingManager } = require("discord.js") // imports the sharding manager
require("dotenv").config()

// this is the sharding manager, it is setup to spawn a single shard
// but you can change it to spawn more shards if you want
// if your bot goes down for some reason, this will automatically restart it
const manager = new ShardingManager("./src/bot.js", {
	token: process.env.TOKEN,
	respawn: true,
	totalShards: 1,
	shardList: "auto",
})

manager.on("shardCreate", (shard) => {
	shard.on("ready", () => {
		console.log(`Shard ${shard.id} connected`)
	})
})

manager
	.spawn({ amount: manager.totalShards, delay: null, timeout: -1 })
	.then((shards) => {
		console.log(`${shards.size} shard(s) spawned.`)
	})
	.catch((err) => {
		console.log("An error has occurred :", err)
	})
