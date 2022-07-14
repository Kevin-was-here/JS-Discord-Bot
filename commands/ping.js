const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Replies with Pong!'),
	run: async ({ client, interaction }) => {
		await interaction.editReply('Pong!');
	},
};