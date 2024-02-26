const { SlashCommandBuilder } = require('discord.js')
const { bulkAdd } = require('../../utils')

module.exports = {
	cooldown: 5,
	data: new SlashCommandBuilder()
		.setName('bulk_add')
		.setDescription('Adds the new terms to the database.'),
	async execute(interaction) {
		if (!interaction.member.roles.cache.has('1210507767257899028')) {
			await interaction.reply('You are not allowed to use this command.')
			return
		}

		const response = await interaction.reply({ content: 'Adding terms...', ephemeral: true })

		try {
			await bulkAdd()
			await response.edit({ content : 'Done!', ephemeral: true })
		} catch (error) {
			console.error(error)
			await response.edit({ content: 'There was an error while adding the terms!', ephemeral: true })
		}
		
	}
}