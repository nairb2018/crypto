const fs = require('fs');
const Promise = require('bluebird');
const _ = require('lodash');
const CandleStick = require('./candle_stick');
const SimulatedExchange = require('./simulated_exchange');
const Strategy = require('./strategy');


const initial_usd_deposit = 1000;
const initial_btc_deposit = 0.1;

// magic copied from https://stackoverflow.com/questions/12303989/cartesian-product-of-multiple-arrays-in-javascript
// understanding this may cause brain damage, but if you write that during interview, you'll impress your interviewer.
const f = (a, b) => [].concat(...a.map(d => b.map(e => [].concat(d, e))));
const cartesian = (a, b, ...c) => (b ? cartesian(f(a, b), ...c) : a);

const stategry_param_space = {
    // if the latest order pair is only partially executed (i.e. if only the buy order or the sell order is executed),
    // how many more cycles should we wait until we place another order pair
    max_wait_cycle_for_partial_order: [3],

    // the length between we place any orders. It should be an integer.
    // We wait trading_cycle_width minutes in between each order placement.
    trading_cycle_width : [1],

    // the number of basis point for the spread between our order pair. 
    // n means the sell price should be n basis point above current price and buy order should be
    // n basis point below current price.
    basis_point_delta: [1],

    usd_quantity_per_order: [100]
}

const values = _.values(stategry_param_space);
const keys = _.keys(stategry_param_space);
const all_params_combination = _.map(cartesian(...values), param_values => { return _.zipObject(keys, param_values); });

async function read_historical_data() {
    let readFile = Promise.promisify(fs.readFile, 'utf8');

    return JSON.parse(await readFile('../data_1month.json'));
}

function simulate(historial_data, strategy_param) {
    let simulated_exchange = new SimulatedExchange();
    simulated_exchange.deposit(initial_usd_deposit, initial_btc_deposit);
    let strategy = new Strategy(strategy_param, simulated_exchange);

    historial_data.forEach((candle_stick_array, nth_minute) => {
        let candle_stick = new CandleStick(candle_stick_array)

        // simulate the exchange behavior first so that our orders may be executed.
        simulated_exchange.execute_order(candle_stick);

        // we pretend the strategy is called at the closing of each tick.
        strategy.execute(candle_stick.close, nth_minute);

    });

    console.log(simulated_exchange.book);
}

read_historical_data().then(historial_data => {
    console.log(historial_data[0]);
    all_params_combination.forEach(param => simulate(historial_data, param));
}).catch(e => {
    console.log(e);
});
