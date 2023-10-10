const Revolt = require("revolt.js");
const { setTimeout } = require("node:timers/promises");
let data = require("./data.json");
const { readFileSync, writeFileSync } = require("fs");
const { client } = require("./index");

async function GrapeInfo(message, infoType, user, amount, reason = "", reacter = undefined) {
	data = JSON.parse(readFileSync("./data.json"))
	const grapeEmbed = new Revolt.MessageEmbed(type = "Text");
	grapeEmbed.title = "Grape Info";
	switch (infoType) {
		case "start":
			grapeEmbed.description = `**${user.username}** joins the :grapes: economy!`;
			data.grapeBalance[user.id] = amount;
			break;
		case "gainGrape":
			grapeEmbed.description = `**${user.username}** has recovered **${amount}** :grapes:`;
			data.grapeBalance[user.id] += amount;
			break;
		case "loseGrape":
			grapeEmbed.description = `**${user.username}** has lost **${amount}** :grapes:`;
			data.grapeBalance[user.id] -= amount;
			break;
		case "noGrapes":
			grapeEmbed.description = `**${user.username}**, you have no :grapes:! You can't send any messages!`;
			data.grapeBalance[user.id] -= amount;
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
		case "grape":
			grapeEmbed.description += ` thanks to a :grapes: reaction by ${reacter.username}`;
			break;
		case "olive":
			grapeEmbed.description += ` thanks to an :olive: reaction by ${reacter.username}`;
			break;
		case "fish":
			grapeEmbed.description += ` because of a :fish: reaction by ${reacter.username}`;
			break;
		case "salad":
			grapeEmbed.description += ` because they reacted with :green_salad:`;
			break;
	}
	if (infoType != "noGrapes") {
		grapeEmbed.description += `\n**${user.username}** now has **${data.grapeBalance[user.id]}** :grapes:`;
	}
	grapeEmbed.colour = "#9266cc";
	message.reply({ embeds: [grapeEmbed] }, false).then(async (msg) => {
		if (infoType == "noGrapes") {
			message.delete();
		}
		if (infoType == "gainGrape" || infoType == "loseGrape" || infoType == "noGrapes") {
			await setTimeout(5000);
			msg.delete();
		}
	});
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

