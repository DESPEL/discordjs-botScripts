const Discord = require('discord.js');


const maxAmount = 1000;
const exceedMaxAmount = 'No está permitido borrar más de ' + maxAmount + ' mensajes';

const roles = "admin"; //Modify for command execution depending of role

const errors = {
    noPermission: `You need the following roles to run the command: ${roles}`,
    exceedMaxAmount: `You can't delete more than ${maxAmount} messages`,
    noAmount: `The <value> argument needs to be a number`,

}

//Command that allows deleting infinite messages
module.exports.delete.description = "Delete some amount of messages"
module.exports.delete.args = "<amount>"
module.exports.delete = async function (message, bot, amount) {
    if (!hasRole(roles)) {
        sendErrorMSG(message, errors.noPermission);
        return;
    }
    if (isNaN(amount)) {
        sendErrorMSG(message, errors.noAmount);
        return;
    }
    if (amount > maxAmount) {
        sendErrorMSG(message, errors.exceedMaxAmount);
        return;
    }

    //Handler for massive deletes 
    let times = 0;
    times = parseInt(amount / 100);
    amount = amount % 100;
    //Sends repeated delete requests (For deleting n*100 messages)
    for (let i = 0; i < times; i++) {
        const fetched = await message.channel.fetchMessages({ limit: 100 });
        await message.channel.bulkDelete(fetched)
            .catch(error => message.channel.send(`Error: ${error}`));
    }

    //Deletes lasts messages (Not more than 100)
    const fetched = await message.channel.fetchMessages({ limit: amount });
    await message.channel.bulkDelete(fetched)
        .catch(error => message.channel.send(`Error: ${error}`));

    message.channel.send('Amount of messages deleted: ' + amount);
}

function hasRole(message /*Message object*/, roles /*String*/) {
    let ranks = roles.split(' ');
    let canRun = true;
    ranks.forEach(function (value, index) {
        if (!message.member.roles.find(r => r.name === value)) {
            canRun = false;
        };
    });
    return canRun;
}

function sendErrorMSG(message, errorText) {
    const embed = new Discord.RichEmbed()
        .setColor('0xFF0000')
        .setTitle('Error')
        .setDescription('La cantidad de mensajes debe de ser un número');
    message.channel.send(embed);
}