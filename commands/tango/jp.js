const { SlashCommandBuilder } = require('discord.js')
const { it2jp } = require('../../utils')

module.exports = {
	cooldown: 5,
	data: new SlashCommandBuilder()
		.setName('jp')
		.setDescription('italian 2 japanese')
		.addStringOption(option =>
			option.setName('word')
				.setDescription('The word to translate')
				.setRequired(true))
		.addBooleanOption(option =>
			option.setName('show_romaji')
				.setDescription('Show romaji')
				.setRequired(false)),
	async execute(interaction) {
		const query = interaction.options.getString('word')
		const showRomaji = interaction.options.getBoolean('show_romaji') || false

		await interaction.reply({ content: '...', /* ephemeral: true */ })

		const word = await it2jp(query, showRomaji)

		await interaction.editReply({ content: `${word.jp}${showRomaji ? ' — ' + word.romaji : ''} — ${query}` })
		
	}
}