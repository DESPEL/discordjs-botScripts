const axios = require('axios');
const cheerio = require('cheerio');
const Discord = require('discord.js');

const url = "https://www.crunchyroll.com/random/anime";

module.exports.randomanime.description = "Sends random anime by chat";
module.exports.randomanime.args = "";
module.exports.randomanime = function (message, bot) {
    //Load random anime page from crunchyroll
    axios.get(url).then(function (result) {
        $ = cheerio.load(result.data);
        //Select objects with url
        let animeURL = $("[itemprop*='url']");
        //Select anime url and send it;
        message.channel.send($(animeURL[6]).attr('href'));
    });
}