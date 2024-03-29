require('dotenv').config()
const axios = require('axios')
const { GoogleSpreadsheet } = require('google-spreadsheet')
const { JWT } = require('google-auth-library')
const qs = require('qs')
const { bulkData } = require('./bulk-data')
const voice = '21m00Tcm4TlvDq8ikWAM'

const spreadheetLogin = async (sheet = 0) => {
	const serviceAccountAuth = new JWT({
		// env var values here are copied from service account credentials generated by google
		// see "Authentication" section in docs for more info
		email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
		key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
		scopes: [
			'https://www.googleapis.com/auth/spreadsheets',
			'https://www.googleapis.com/auth/drive.file'
		],
	})
	const doc = new GoogleSpreadsheet(process.env.GOOGLE_SPREADSHEET_ID, serviceAccountAuth)
	await doc.loadInfo() // loads document properties and worksheets
	//console.log(doc.title)
	const spreadsheet = doc.sheetsByIndex[sheet]
	return spreadsheet
}

exports.bulkAdd = async () => {
	const sheet = await spreadheetLogin()
	
	for (let i = 0; i < bulkData.length; i++) {
		console.log('adding', i, '\t', bulkData[i])
		const data = bulkData[i]

		// check if data.jp + data.it already exists
		const rows = await sheet.getRows()
		console.log(rows)
		const exists = rows.find(row => row.jp === data.jp && row.it === data.it)

		if (exists) continue

		await sheet.addRow({ 
			id : Math.random().toString(36).substring(7),
			jp: data.jp,
			it : data.it,
			romaji: data.romaji,
			notes: data.notes
		})

		// wait 3 seconds to avoid rate limit
		await new Promise(resolve => setTimeout(resolve, 3000))
	}

}

exports.it2jp = async (word, showRomaji) => {
	const sheet = await spreadheetLogin()
	
	const rows = await sheet.getRows()
	
	const found = rows.find(row => row.get('it').toLowerCase() === word.toLowerCase())
	if (!found) return 'Word not found'

	const romaji = showRomaji ? ` (${found.get('romaji')})` : null
	return {
		jp: found.get('jp'),
		romaji: romaji
	}
}

exports.jp2it = async (word, isRomaji) => {
	const sheet = await spreadheetLogin()
	
	const rows = await sheet.getRows()

	if (isRomaji) {
		const found = rows.find(row => row.get('romaji').toLowerCase() === word.toLowerCase())
		if (!found) return 'Word not found'
		console.log(found)
		return {
			it : found.get('it'),
			jp : found.get('jp')
		}
	} else {
		const found = rows.find(row => row.get('jp') === word)
		if (!found) return 'Word not found'
		console.log(found)
		return {
			it : found.get('it'),
			jp : found.get('jp')
		}
	}
}

exports.get3words = async () => {
	const sheet = await spreadheetLogin()
	
	const rows = await sheet.getRows()
	const words = []

	// pick 3 random words without repeating
	const indexes = []
	while (indexes.length < 3) {
		const index = Math.floor(Math.random() * rows.length)
		if (!indexes.includes(index)) indexes.push(index)
	}

	for (const index of indexes) {
		const word = rows[index]
		words.push({
			jp: word.get('jp'),
			it: word.get('it'),
		})
	}
	return words
}
