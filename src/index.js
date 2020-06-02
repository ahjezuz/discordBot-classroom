const fs = require('fs');
const readline = require('readline');
const Discord = require('discord.js');
const {google} = require('googleapis');
require('dotenv').config();

const Bot = new Discord.Client();
const BotToken = `${process.env.BOT_TOKEN}`;

let Users, Roles;

Bot.login(BotToken);

Bot.on('voiceStateUpdate', async (oldMember, newMember) => {
    let newID = newMember.channelID;
    let userID = newMember.id;

    if(newID === '717216420756193343'){ //Caso o professor entre no canal do professor então: 
        let channels = newMember.guild.channels;
        let name = Users.find(user => user.id === userID).name
        let member = newMember.guild.members.cache.get(userID) 

        let channel = await channels.create(`Sala de ${name}`, { type: 'voice', reason: 'New channel added for fun!' });
        member.voice.setChannel(channel)
    }
});

Bot.once('ready', () => {
    //Read
    let Users_To_Filter = Bot.guilds.cache.map(guild => {
        return guild.members.cache.map(member => {
            if(!member.user.bot)
                return ({
                    id: member.user.id,
                    name: `${member.user.username}`,
                    full_username: `${member.user.username}#${member.user.discriminator}`,
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
    Roles = Roles_To_Filter[0].filter(function (el) {
        return el != null;
    });
    Users = Users_To_Filter[0].filter(function (el) {
        return el != null;
    });
});



(async () => {
    //testa professores
    const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];
    const TOKEN_PATH = 'token.json';

    fs.readFile('credentials.json', (err, content) => {
    if (err) return console.log('Error loading client secret file:', err);
        authorize(JSON.parse(content), listUsers);
    });

    function authorize(credentials, callback) {
        const {client_secret, client_id, redirect_uris} = credentials.installed;
        const oAuth2Client = new google.auth.OAuth2(
            client_id, client_secret, redirect_uris[0]);
    
            fs.readFile(TOKEN_PATH, async (err, token) => {
                if (err) return getNewToken(oAuth2Client, callback);
                oAuth2Client.setCredentials(JSON.parse(token));
                callback(oAuth2Client);
            });
    }

    function getNewToken(oAuth2Client, callback) {
        const authUrl = oAuth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: SCOPES,
        });
        console.log('Authorize this app by visiting this url:', authUrl);
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });
        rl.question('Enter the code from that page here: ', (code) => {
            rl.close();
                oAuth2Client.getToken(code, (err, token) => {
                if (err) return console.error('Error while trying to retrieve access token', err);
                oAuth2Client.setCredentials(token);
                fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
                    if (err) return console.error(err);
                    console.log('Token stored to', TOKEN_PATH);
                });
                    callback(oAuth2Client);
            });
        });
    }

    async function listUsers(auth) {
        let filtrados = [];
        const sheets = google.sheets({version: 'v4', auth});
        let teste = await sheets.spreadsheets.values.get({
            spreadsheetId: '1nPcAjiP5CFzqDx60XoxjccWM1nHd4fIvxcZ1MAywPPo',
            range: 'A:C',
        }, (err, res) => {
            if (err) return console.log('The API returned an error: ' + err);
            const rows = res.data.values;
            if (rows.length) {
                let teachers = []
                rows.map((row, index) => {
                    if(index > 0 )
                        //row[0] = Data de criação
                        //row[1] = Nome de usuário
                        //row[2] = Instituição do professor
                        teachers.push({
                            full_username: row[1],
                            instituicao: row[2]
                        })
                });
                verifyTeacher(teachers);
            } else {
                console.log('No data found.');
            }
        });
    }
})();

const verifyTeacher = teachers => {
    console.log(teachers)
}