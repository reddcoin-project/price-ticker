const express = require('express');
const CoinGecko = require('coingecko-api');
const cache = require('memory-cache');
const morgan = require('morgan');

const app = express();
app.use(morgan('combined'));
const port = 3001;
const CoinGeckoClient = new CoinGecko();

// configure cache middleware
let memCache = new cache.Cache();
let cacheMiddleware = (duration) => {
  return (req, res, next) => {
    let key =  '__express__' + req.originalUrl || req.url
    let cacheContent = memCache.get(key);
    if(cacheContent){
      res.send( cacheContent );
      return
    }else{
      res.sendResponse = res.send
      res.send = (body) => {
        memCache.put(key,body,duration*1000);
        res.sendResponse(body)
      }
      next()
    }
  }
}

app.get('/price-ticker', cacheMiddleware(30), async (req, res) => {
  let data = await CoinGeckoClient.simple.price({
    ids: ['reddcoin'],
    vs_currencies: ["ars", "aud", "brl", "cny", "eur", "gbp", "hrk", "inr", "ppc", "ron", "rub", 'usd', 'krw'],
  });

  const newObj = Object.fromEntries(
      Object.entries(data.data.reddcoin).map(([k, v]) => [k.toUpperCase(), v])
  );

  res.json(newObj)
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})