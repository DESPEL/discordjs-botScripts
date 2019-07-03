const axios = require('axios');
const cheerio = require('cheerio');
const Discord = require('discord.js');

const errors = {
    noArgs: 'The name of the manga is required',
    noLastSearch: `There's no more results`,
    noName: `Is required to provide an manga name`,
}

//Modify for changing the length of the results message
const maxResults = 3;

let lastMangaSearch = undefined;

module.exports.manga.args = "<name/more>";
module.exports.manga.description = "Searchs a manga in myanimelist.net an sends the results";

//Function caller must be manga(message, bot, ...arguments);
//Where the arguments are strings with certain parts of the name
module.exports.manga = async function (message, bot, ...name) {
    if (!name) {
        sendErrorMSG(message, errors.noArgs);
        return;
    }

    if (name.length == 0) {
        sendErrorMSG(message, errors.noName);
        return;
    }

    message = await message.channel.send('Buscando...');

    //Handle looking for more results (The max results length is 10 due to the scraping method)
    if (name == "more") {
        if (!lastMangaSearch || lastMangaSearch.length == 0) {
            lastMangaSearch = undefined;
            sendErrorMSG(message, errors.noLastSearch);
            return;
        }

        let embed = new Discord.RichEmbed()
            .setColor(config.botColor)
            .setTitle('Siguientes resultados')
            .setThumbnail(lastMangaSearch[0].thumbnail);

        let nRes = lastMangaSearch.length > maxResults ? maxResults : lastMangaSearch.length;

        for (let i = 0; i < nRes; i++) {
            let data = lastMangaSearch.shift();
            embed.addField(data.name, data.link);
        }
        message.edit(embed);
        return;
    }

    //If the name isn't an array, is transformed
    if (!name instanceof Array) {
        let item = name;
        name = new Array();
        name.push(item);
    }

    //Execute the search
    lastMangaSearch = await MALSearch(name);
    //Create and send message
    let embed = new Discord.RichEmbed()
        .setColor(config.botColor)
        .setTitle('Resultados de la búsqueda')
        .setThumbnail(lastMangaSearch[0].thumbnail);

    let nRes = lastMangaSearch.length > maxResults ? maxResults : lastMangaSearch.length;

    for (let i = 0; i < nRes; i++) {
        let data = lastMangaSearch.shift();
        embed.addField(data.name, data.link);
    }
    message.edit(embed);
}

function sendErrorMSG(message, errorText) {
    const embed = new Discord.RichEmbed()
        .setColor('0xFF0000')
        .setTitle('Error')
        .setDescription(errorText);
    message.channel.send(embed);
}


async function MALSearch(name) {
    const pageURL = 'https://myanimelist.net'
    const searchURL = pageURL + '/search/all?q=';

    //Adapts string
    if (name instanceof Array) {
        name = name.toString().replace(/,/g, '%20');
    }

    //Get data and save it to resultsData
    let resultsData = new Array();
    await axios.get(searchURL + name).then(function (result) {
        const $ = cheerio.load(result.data);
        let results = $($('#manga')[0]).next().children();
        results.each(function (index, element) {
            let thumbnail = $(element).find('img').attr('src');
            let name = $(element).find('img').attr('alt');
            let link = $(element).find('div.information a').attr('href');

            let data = {
                thumbnail: thumbnail,
                name: name,
                link: link
            }
            if (!thumbnail) return;
            resultsData.push(data);
        });
    });

    return resultsData;
}