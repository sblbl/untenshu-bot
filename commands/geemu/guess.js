const { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js')
const { get3words } = require('../../utils')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('guess')
		.setDescription('Guess the meaning of a word'),
	async execute(interaction) {
		interaction.deferReply()

		const words = await get3words()

		// pick a random word
		const correctIdx = Math.floor(Math.random() * words.length)
		const options = []

		for (const word of words) {
			options.push(word.it)
		}
		const correct = words[correctIdx].it
		
		//console.log(correct)
		let selects = []

		options.forEach((option, i) => {
			console.log(option)
			selects.push({
				label: option,
				value: option,
			})
		})

		const row = new ActionRowBuilder().addComponents(
			new StringSelectMenuBuilder()
				.setCustomId('select')
				.setPlaceholder('Choose one')
            	.addOptions(selects),
		)

		const response = await interaction.editReply({
			content: `what is the meaning of ${words[correctIdx].jp}?`,
			components: [row],
		})

		const collector = response.createMessageComponentCollector({ /* componentType: ComponentType.StringSelect, */ time: 3_600_000 });

		collector.on('collect', async i => {
			const selection = i.values[0]
			if (selection === correct) {
				await interaction.editReply({content : `Correct! «${words[correctIdx].jp}» means «${correct}»`, components: []})
				//  stop the collector
				collector.stop()
				// make the  response unclickable
				
			} else {
				await interaction.editReply({content : `Nop, «${words[correctIdx].jp}» means «${correct}»`, components : []})
				collector.stop()
			
			}
		})
	}
}