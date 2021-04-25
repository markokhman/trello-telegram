const dotenv = require('dotenv');
dotenv.config();

const Trello = require('trello-node-api')(process.env.TRELLO_API_KEY, process.env.TRELLO_TOKEN);
const TelegramBot = require('node-telegram-bot-api');
const token = process.env.TELEGRAM_TOKEN;
const bot = new TelegramBot(token, {polling: true});
const allowedChats = [ 59608113, -480533377 ]

var express = require('express');
var packageInfo = require('./package.json');

var app = express();

app.get('/', function (req, res) {
  res.json({ version: packageInfo.version });
});

var server = app.listen(process.env.PORT, function () {
    var host = server.address().address;
    var port = server.address().port;
  
    console.log('Web server started at http://%s:%s', host, port);
});

async function getCardsFromList(boardId, listId) {
    let cards = await Trello.board.searchCards(boardId);
    let listCards = []
    cards.forEach(card => {
        if (card.idList === listId) listCards.push(card)
    });
    return listCards;
}

async function prepareCardsToMessage(cards){
    let message = ``

    for await (let [i, card] of cards.entries()) {
        message = `${message}${i+1}. ${card.name} ${card.shortUrl}\n`
    }

    return message;
}

bot.onText(/\/daily/, async (msg, match) => {

    const chatId = msg.chat.id;
    if (allowedChats.includes(chatId)) {
        const toDoCards = await getCardsFromList('8hEPRQe7','605b37ec694943106e574913');
        const inProcessCards = await getCardsFromList('8hEPRQe7','605b37f3a83d410f73a293c1');

        let messageTodo = await prepareCardsToMessage(toDoCards);
        let messageInProcess = await prepareCardsToMessage(inProcessCards);

        let message = `TODO (${toDoCards.length}) In Progress (${inProcessCards.length})\n\n\nTODO:\n${messageTodo}\n\nIn Progress:\n${messageInProcess}`
        bot.sendMessage(chatId, message);
    }

    // Check

});