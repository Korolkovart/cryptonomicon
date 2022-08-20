const API_KEY = "5e78a0db7bec62b410ec415e9b455387588da9787f43d68ca38bbffb450cf637";

export const loadTicker = async tickerName =>
    await fetch(
        `https://min-api.cryptocompare.com/data/price?fsym=${tickerName}&tsyms=USD&api_key=${API_KEY}`)
        .then((res) => res.json());