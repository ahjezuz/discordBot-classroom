const Discord = require('discord.js');
require('dotenv').config();
const ProfessorController = require("./datasheet_prof");

const Bot = new Discord.Client();
const BotToken = `${process.env.BOT_TOKEN}`;

Bot.login(BotToken);

Bot.once('ready', () => {
    //Read
    let Users_To_Filter = Bot.guilds.cache.map(guild => {
        return guild.members.cache.map(member => {
            if(!member.user.bot)
                return ({
                    username: `${member.user.username}#${member.user.discriminator}`,
                    roles: member._roles
                })
            return
        })
    });
    let Roles_To_Filter = Bot.guilds.cache.map(guild => {
        return guild.roles.cache.map(roles => {
            return ({
                id: roles.id,
                name: roles.name
            })
        })
    });
    //Clear
    var Roles = Roles_To_Filter[0].filter(function (el) {
        return el != null;
    });
    var Users = Users_To_Filter[0].filter(function (el) {
        return el != null;
    });
});



(async () => {
    await ProfessorController.ReadDataSheet();
})();
