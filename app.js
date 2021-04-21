const dotenv = require('dotenv');
dotenv.config();

var Trello = require('trello-node-api')(process.env.TRELLO_API_KEY, process.env.TRELLO_TOKEN);

async function start() {
    let cards = await Trello.board.searchCards('8hEPRQe7');
    cards.forEach(card => {
        if (card.idList === '605b37ec694943106e574913') {
            console.log(card)
        }
    });
    console.log();
}

start()