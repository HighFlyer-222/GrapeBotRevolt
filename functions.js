const Revolt = require("revolt.js");
const { setTimeout } = require("node:timers/promises");
let data = require("./data.json");
const { readFileSync, writeFileSync } = require("fs");
const { client } = require("./index");

async function GrapeInfo(message, infoType, user1, amount, reason = "", delay = 0, user2 = undefined) {
	data = JSON.parse(readFileSync("./data.json"))
	if (user1 && !(user1.id in data.grapeData)) data.grapeData[user1.id] = {}
	if (user2 && !(user2.id in data.grapeData)) data.grapeData[user2.id] = {}
	const grapeEmbed = new Revolt.MessageEmbed(type = "Text");
	grapeEmbed.title = "Grape Info";
	switch (infoType) {
		case "start":
			grapeEmbed.description = `**${user1.username}** joins the :grapes: economy!`;
			data.grapeData[user1.id].balance = amount;
			break;
		case "gainGrape":
			grapeEmbed.description = `**${user1.username}** has recovered **${amount}** :grapes:`;
			data.grapeData[user1.id].balance += amount;
			break;
		case "loseGrape":
			grapeEmbed.description = `**${user1.username}** has lost **${amount}** :grapes:`;
			data.grapeData[user1.id].balance -= amount;
			break;
		case "stealGrape":
			grapeEmbed.description = `**${user1.username}** has stolen **${amount}** :grapes: from ${user2.username}!`;
			data.grapeData[user1.id].balance += amount;
			data.grapeData[user2.id].balance -= amount;
			break;
		case "noGrapes":
			grapeEmbed.description = `**${user1.username}**, you can't send or edit any messages! You have **${data.grapeData[user1.id].balance}** :grapes:!`;
			data.grapeData[user1.id].balance -= amount;
			break;
		default:
			grapeEmbed.description = `This message should not appear, so there's something wrong with infoType ${infoType}`;
			break;
	}
	switch (reason) {
		case "message":
			grapeEmbed.description += " for sending a message";
			break;
		case "attachment":
			grapeEmbed.description += " for sending a message with an attachment";
			break;
		case "edit":
			grapeEmbed.description += " for editing a message";
			break;
		case "grape":
			grapeEmbed.description += ` thanks to a :grapes: reaction by ${user2.username}`;
			break;
		case "olive":
			grapeEmbed.description += ` thanks to an :olive: reaction by ${user2.username}`;
			break;
		case "fish":
			grapeEmbed.description += ` because of a :fish: reaction by ${user2.username}`;
			break;
		case "steal":
			grapeEmbed.description += ` because they got caught stealing from ${user2.username}!`;
			break;
	}
	if (infoType != "noGrapes") grapeEmbed.description += `\n**${user1.username}** now has **${data.grapeData[user1.id].balance}** :grapes:`;
	if (infoType == "stealGrape") grapeEmbed.description += `\n**${user2.username}** now has **${data.grapeData[user2.id].balance}** :grapes:`;
	grapeEmbed.colour = "#9266cc";
	if (infoType == "noGrapes") {
		message.channel.sendMessage({ embeds: [grapeEmbed] }).then(async (msg) => {
			message.channel.server.fetchMember(client.user.id).then(member => {
				if (!member.hasPermission(message.channel.server, "ManageMessages")) {
					message.channel.sendMessage("I am missing the `Manage Messages` permission. This is required for me to delete messages from people with no :grapes:!")
				} else {
					message.delete()
				}
			})
			if (delay != 0) {
				await setTimeout(delay);
				msg.delete();
			}
		});
	}
	else {
		message.reply({ embeds: [grapeEmbed] }, false).then(async (msg) => {
			if (delay != 0) {
				await setTimeout(delay);
				msg.delete();
			}
		});
	}
	writeFileSync("./data.json", JSON.stringify(data))
}
exports.GrapeInfo = GrapeInfo;
function CommandError(errorType, message, desc) {
	const errorEmbed = new Revolt.MessageEmbed(type = "Text");
	switch (errorType) {
		case "missingArgument":
			errorEmbed.title = "Error - Missing argument";
			break;
		case "invalidArgument":
			errorEmbed.title = "Error - Invalid argument";
			break;
		case "missingPermission":
			errorEmbed.title = "Error - Missing Permission";
			break;
		default:
			errorEmbed.title = "Error";
			break;
	}
	errorEmbed.description = desc;
	errorEmbed.colour = "#9266cc";
	message.reply({ embeds: [errorEmbed] });
}
exports.CommandError = CommandError;

