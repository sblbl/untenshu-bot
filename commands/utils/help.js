const { SlashCommandBuilder } = require('discord.js')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('help')
		.setDescription('How to use the bot.'),
	async execute(interaction) {
		let commands = interaction.client.commands
		commands = commands.map(command => command)
		console.log(commands)

		let fields = commands.map(command => {
			return {
				name: '/' + command.data.name,
				value: command.data.description,
			}
		})

		fields = fields.filter(field => field.name !== '/bulk_add')

		const embed = {
			color: 0xfeda32,
			title: 'まるちゃん',
			description: 'command list for まるちゃん',
			fields: fields,
		}

		await interaction.reply({ embeds: [embed] })
	}
}