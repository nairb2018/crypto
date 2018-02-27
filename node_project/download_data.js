const Gdax = require('gdax');
const publicClient = new Gdax.PublicClient();
const fs = require('fs');
const Promise = require('bluebird');
const moment = require('moment');
const sleep = require('sleep');
const _= require('lodash');

let writeFile = Promise.promisify(fs.writeFile);

let historical_rates = [];

async function getRate(start) {
    try {
        console.log('downloading data for period ' + start.toString());
        const rates = await publicClient.getProductHistoricRates('BTC-USD', { start: start.toISOString(), end: start.add(5, 'hour').toISOString(), granularity: 60 });
        historical_rates = historical_rates.concat(rates);
        return rates[0][0];
    } catch (error) {
        console.log(error);
    }
}

async function download() {
   let start = moment().subtract(1, 'month');

    while (start < moment().subtract(1, 'hour')) {
        start = moment((await getRate(start)) * 1000);
        sleep.sleep(1);
    }

    try {
        historical_rates = _.uniqBy(historical_rates, (data) => { return data[0]; });
        writeFile('./data.json', JSON.stringify(historical_rates));
    } catch (error) {
        console.log(error);
    } 
}

download();