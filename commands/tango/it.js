const { SlashCommandBuilder } = require('discord.js')
const { jp2it } = require('../../utils')

module.exports = {
	cooldown: 5,
	data: new SlashCommandBuilder()
		.setName('it')
		.setDescription('japanese 2 italian')
		.addStringOption(option =>
			option.setName('word')
				.setDescription('The word to translate')
				.setRequired(true))
		.addBooleanOption(option =>
			option.setName('is_romaji')
				.setDescription('If the query is written in romaji')
				.setRequired(false)),
	async execute(interaction) {
		const query = interaction.options.getString('word')
		const isRomaji = interaction.options.getBoolean('is_romaji') || false

		await interaction.reply({ content: '...', /* ephemeral: true */ })

		const word = await jp2it(query, isRomaji)

		await interaction.editReply({ content: `${ word.jp }${ isRomaji ? ' — ' + query : '' } — ${ word.it }` })
		
	}
}