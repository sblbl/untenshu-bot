require('dotenv').config()
const Discord = require('discord.js')
const { Collection,  Events } = require('discord.js')
const cors = require('cors')
const fs = require('node:fs')
const path = require('node:path')
const express = require('express')
const app = express()

app.use(cors())

const PORT = process.env.PORT || 3000

const client = new Discord.Client({
	intents: [
		Discord.GatewayIntentBits.Guilds,
		Discord.GatewayIntentBits.GuildMessages,
		Discord.GatewayIntentBits.MessageContent,
		Discord.GatewayIntentBits.GuildMessageReactions,
		Discord.GatewayIntentBits.GuildMessageTyping,
	],
})

client.commands = new Collection()

const foldersPath = path.join(__dirname, 'commands')
const commandFolders = fs.readdirSync(foldersPath)

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder)
	console.log(`Loading commands from ${commandsPath}`)
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'))
	console.log(`Found ${commandFiles.length} commands in ${commandFiles}`)
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file)
		const command = require(filePath)
		// Set a new item in the Collection with the key as the command name and the value as the exported module
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command)
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required 'data' or 'execute' property.`)
		}
	}
}

client.login(process.env.DISCORD_TOKEN)

const devChannel = process.env.DEV_CHANNEL_ID
//const devChannel = 1210508966405349376

app.get('/', (req, res) => {
	res.send('Hello World!')
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

const keepAlive = async () => {
	// ping the bot to keep it alive
	const response = await fetch('https://untenshu-bot.onrender.com')
}
 
let lastTime = -Infinity

client.on(Events.ClientReady, async readyClient => {
	console.log(`Ready! Logged in as ${readyClient.user.tag}`)
	const checkInterval = 1000 * 60 // check every 58 seconds
	const pingInterval = 1000 * 60 * 5 // ping every 58 minutes
	setInterval(async () => {
		if (Date.now() - lastTime < pingInterval) return
		lastTime = Date.now()
		await keepAlive()
	}, checkInterval)
}) 

// check for text messages

client.on(Events.MessageCreate, async message => {
	if (message.author.bot) return
	/* if (message.content === 'ping') {
		message.reply('pong')
	} */
})

client.on(Events.InteractionCreate, async interaction => {
	console.log(`Received interaction ${interaction.id} from ${interaction.user.tag}`)
	if (!interaction.isChatInputCommand()) return
	const command = interaction.client.commands.get(interaction.commandName)

	// delete this
	//if (interaction.channelId !== devChannel) return

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`)
		return
	}

	try {
		await command.execute(interaction)
	} catch (error) {
		console.error(error)
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true })
		} else {
			await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true })
		}
	}
})