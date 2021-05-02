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

bot.onText(/\/stuck/, async (msg, match) => {

    const chatId = msg.chat.id;
    if (allowedChats.includes(chatId)) {
        const stuckCards = await getCardsFromList('8hEPRQe7','60856971f03ead7ba6455b73');

        let messageStuck = await prepareCardsToMessage(stuckCards);

        let message = `To proceed with following tasks I need input from your side:\n${messageStuck}`
        bot.sendMessage(chatId, message);
    } else {
        bot.sendMessage(chatId, 'This chat is not authorised to access Trello data.');
    }

});

bot.onText(/\/now/, async (msg, match) => {

    const chatId = msg.chat.id;
    if (allowedChats.includes(chatId)) {
        const inProcessCards = await getCardsFromList('8hEPRQe7','605b37f3a83d410f73a293c1');

        let messageProcess = await prepareCardsToMessage(inProcessCards);

        let message = `Following tasks are in work right now:\n${messageProcess}`
        bot.sendMessage(chatId, message);
    } else {
        bot.sendMessage(chatId, 'This chat is not authorised to access Trello data.');
    }

});

// TODO
// Webhook for integration with other services
// New command /now - shows all the tasks in process
// New command /report - sends all tasks from Done list
// Configration - configure bot in private conversation to set in which chats he can answer
// If a new person texts him - he provides chat id and bot owner can add this chat id to a list by sending it
// Must come up with a way of attaching some commmand to specific list
// Settings must be stored in a local json file, can be migrared instantly 