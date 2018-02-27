const _ = require('lodash');

class SimulatedExchange {
    constructor() {
        this.book = {usd: 0, btc: 0};
        this.orders = [];
    }

    deposit(usd_amount, btc_amount) {
        this.book.usd += usd_amount;
        this.book.btc += btc_amount;
    }

    place_order(...orders) {
        orders.forEach(o => {
            this.orders.push(o);
            console.log(`Placed order ${JSON.stringify(o)}`);
        });
    }

    execute_order(candle_stick) {
        _(this.orders).filter(o => { return !o.executed; }).each(order => {
            if (order.type == 'buy') {
                if (this.book.usd < order.usd_amount) {
                    console.log(`Failed to execute ${JSON.stringify(order)}, ${JSON.stringify(this.book)}`)
                    throw new Error('Not enough usd to buy!');
                }

                if (order.usd_per_btc > candle_stick.low) {
                    // buy order executed.
                    console.log(`executed_order ${JSON.stringify(order)}`);
                    order.execution_time = candle_stick.time;
                    this.book.usd -= order.usd_amount;
                    this.book.btc += order.btc_amount;
                }
            }

            if (order.type == 'sell') {
                if (this.book.btc < order.btc_amount) {
                    throw new Error('Not enough btc to sell!');
                }

                if (order.usd_per_btc < candle_stick.high) {
                    // sell order executed.
                    console.log(`executed_order ${JSON.stringify(order)}`);
                    order.execution_time = candle_stick.time;
                    this.book.usd += order.usd_amount;
                    this.book.btc -= order.btc_amount;
                }
            }
        });
    }
}

module.exports = SimulatedExchange;