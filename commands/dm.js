const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
  data: new SlashCommandBuilder().setName('dmashie').setDescription('Messages Ashie with go to sleep'),
  run: async ({ client, interaction }) => {
		client.users.fetch('189076285257940992').then((user) => {
      user.send('Go sleep dummy')
    })
    interaction.editReply('Message sent')
	},
}