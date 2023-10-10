const Revolt = require("revolt.js");
const { token, prefix } = require('./config.json');
const { readFileSync, writeFileSync } = require("fs")

let client = new Revolt.Client();
exports.client = client;
let data = require("./data.json");
const { GrapeInfo, CommandError } = require("./functions.js");

client.on("ready", async () => {
	console.info(`Logged in as ${client.user.username}!`);
	client.api.patch("/users/@me", { status: { text: "Counting grapes...", presence: "Focus" } });
});

client.on("messageCreate", async (message) => {
	if (message.author.id == client.id) return
	data = JSON.parse(readFileSync("./data.json"))
	let channelList = data.channelConfig[message.channel.server.id.toString()]
	if (channelList == undefined) {
		data.channelConfig[message.channel.server.id.toString()] = []
		channelList = []
	}
	if (message.content && message.content.startsWith(prefix)) {
		const args = message.content.slice(prefix.length).trim().split(/ +/)
		const command = args.shift().toLowerCase()
		if (command == "help") {
			const helpEmbed = new Revolt.MessageEmbed(type = "Text")
			helpEmbed.title = "GrapeBot help"
			helpEmbed.description =
				`For an explanation of the :grapes: economy, check out the bot's profile.

				\`${prefix}grape\` - See your current :grapes: count
				\`${prefix}channel\` - See the channels where the :grapes: economy is active
				\`${prefix}channel add <channel>\` - Activate the :grapes: economy in a channel
				\`${prefix}channel remove <channel>\` - Disable the :grapes: economy in a channel`
			helpEmbed.colour = "#9266cc"
			message.reply({ embeds: [helpEmbed] })
		}
		else if (command == "grape") {
			const balanceEmbed = new Revolt.MessageEmbed(type = "Text")
			balanceEmbed.colour = "#9266cc";
			if (!(message.author.id in data.grapeBalance)) {
				balanceEmbed.title = "No Grapes?"
				balanceEmbed.description = "You don't have any :grapes: because you haven't joined the :grapes: economy!\nSend a message in a :grapes: channel (type `g!channel` to find some) to get started!"
			}
			else {
				balanceEmbed.title = `${message.author.username}'s balance`
				balanceEmbed.description = `${data.grapeBalance[message.author.id]} :grapes:`
			}
			message.reply({ embeds: [balanceEmbed] })
		}
		else if (command == "channel") {
			if (args[0] == "add" || args[0] == "remove") {
				message.channel.server.fetchMember(message.author).then(member => {
					if (!member.hasPermission(message.channel.server, "ManageChannel")) {
						CommandError("missingPermission", message, "You must have the `Manage Channels` permission to use this command.")
						return
					}
				})
				if (!args[1]) {
					CommandError("missingArgument", message,
						`**Correct Usage**
						${prefix}channel ${args[0]} <channel>`)
					return
				}
				let channel = args[1].slice(2, -1)
				if (!message.server.channelIds.has(channel)) {
					CommandError("invalidArgument", message,
						`**Correct Usage**
						${prefix}channel ${args[0]} <channel mention>`)
					return
				}
				switch (args[0]) {
					case "add":
						if (channelList.includes(channel)) {
							message.reply(`The :grapes: economy is already active in ${args[1]}!`)
							return
						}
						channelList.push(channel)
						message.reply(`The :grapes: economy is now active in ${args[1]}!`)
						break
					case "remove":
						if (!channelList.includes(channel)) {
							message.reply(`The :grapes: economy isn't active in ${args[1]}!`)
							return
						}
						channelList.splice(channelList.indexOf(channel), 1)
						message.reply(`The :grapes: economy has been disabled in ${args[1]}!`)
						break
				}
			}
			else {
				if (channelList.length == 0) {
					message.reply("This server has no :grapes: channels")
					return
				}
				let grapeChannelList = ""
				channelList.forEach(channel => {
					grapeChannelList += `<#${channel}>\n`
				});
				grapeChannelList = grapeChannelList.slice(0, -1)
				const channelEmbed = new Revolt.MessageEmbed(type = "Text")
				channelEmbed.title = `Grape channels for ${message.channel.server.name}`
				channelEmbed.description = grapeChannelList
				channelEmbed.colour = "#9266cc"
				message.reply({ embeds: [channelEmbed] })
			}
			writeFileSync("./data.json", JSON.stringify(data))
		}
	}
	else if (channelList.includes(message.channel.id) && message.content) {
		if (!(message.author.id in data.grapeBalance)) {
			GrapeInfo(message, "start", message.author, 10)
		}
		else if (data.grapeBalance[message.author.id] <= 0 && message.content != ".") {
			GrapeInfo(message, "noGrapes", message.author, 0)
		}
		else if (message.attachments) {
			GrapeInfo(message, "loseGrape", message.author, 2, "attachment")
		}
		else {
			GrapeInfo(message, "loseGrape", message.author, 1, "message")
		}
	}
});

client.on("messageReactionAdd", async (message, reacterId, emoji) => {
	client.users.fetch(reacterId).then(reacter => {
		if (emoji == "🥗") GrapeInfo(message, "loseGrape", reacter, 1, "salad", reacter);
		if (message.author == reacter) return;
		switch (emoji) {
			case "🍇":
				GrapeInfo(message, "gainGrape", message.author, 1, "grape", reacter);
				break
			case "🫒":
				GrapeInfo(message, "gainGrape", message.author, 0.5, "olive", reacter);
				break
			case "🐟":
				GrapeInfo(message, "loseGrape", message.author, 1, "fish", reacter);
				break
		}
	})
});

client.loginBot(token);