const { SlashCommandBuilder } = require("discord.js")

module.exports = {
	data: new SlashCommandBuilder()
		.setName("convite")
		.setDescription("Gostou do Falforces? Adicione-o ao seu servidor!")
		.setDMPermission(false),
	execute: async ({ interaction, instance }) => {
		await interaction.deferReply().catch(() => {})
		try {
			await instance.editReply(interaction, {
				content:
					":pushpin: Adicione o Falforces agora mesmo no seu servidor e vire um mestre da programação competitiva: [Clique Aqui](https://discord.com/oauth2/authorize?client_id=1348139773658796073)",
			})
		} catch (error) {
			console.error(`convite: ${error}`)
			instance.editReply(interaction, {
				content: instance.getMessage(interaction, "EXCEPTION"),
			})
		}
	},
}
