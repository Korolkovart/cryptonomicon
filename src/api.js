const API_KEY = "5e78a0db7bec62b410ec415e9b455387588da9787f43d68ca38bbffb450cf637";

const tickersHandlers = new Map();
const AGGREGATE_INDEX = "5";
const socket = new WebSocket(`wss://streamer.cryptocompare.com/v2?api_key=${API_KEY}`)

socket.addEventListener("message", (e) => {
    const {TYPE: type, FROMSYMBOL: currency, PRICE: newPrice} = JSON.parse(e.data);
    if(type !== AGGREGATE_INDEX || newPrice === undefined){
        return;
    } 
    const handlers = tickersHandlers.get(currency) ?? [];
    handlers.forEach(fn => fn(newPrice))
});

function sendToWebSocket(message){
    const stringifiedMessage = JSON.stringify(message)
    
    if(socket.readyState === WebSocket.OPEN){
        socket.send(stringifiedMessage);
        return;
    }
    socket.addEventListener("open", () => {
        socket.send(stringifiedMessage)
    }, {once: true})
     
}

function subscribeToTickerOnWS(ticker){
    sendToWebSocket({
        action: "SubAdd",
        subs: [`5~CCCAGG~${ticker}~USD`]
    })
}

function unsubscribeFromTickerOnWS(ticker){
    sendToWebSocket({
        action: "SubRemove",
        subs: [`5~CCCAGG~${ticker}~USD`]
    })
}

export const subscribeToTicker = (ticker, cb) => {
    const subscribers = tickersHandlers.get(ticker) || [];
    tickersHandlers.set(ticker, [...subscribers, cb]);
    subscribeToTickerOnWS(ticker);
}


export const unsubscribeToTicker = (ticker) => {
    tickersHandlers.delete(ticker)
    unsubscribeFromTickerOnWS(ticker)
}

window.tickers = tickersHandlers;

// FOR CONNECT ON HTTPS
// const loadTickers = async () => {
//     if(tickersHandlers.size === 0) return;
//     await fetch(
//         `https://min-api.cryptocompare.com/data/pricemulti?fsyms=${[...tickersHandlers.keys()].join(",")}&tsyms=USD&api_key=${API_KEY}`)
//         .then((res) => res.json())
//         .then(rawData => {
//             const updatedPrices = Object.fromEntries(
//                 Object.entries(rawData).map(([key, value]) => [key, value.USD]))

//                 Object.entries(updatedPrices).forEach(([currency, newPrice]) => {
//                     const handlers = tickersHandlers.get(currency) ?? [];
//                     handlers.forEach(fn => fn(newPrice))
//                 })
//         });
//     }