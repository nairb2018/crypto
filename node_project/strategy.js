const _ = require('lodash');
const Order = require('./order');

class Strategy {
    constructor(params, simulated_exchange) {
        this.params = params;
        this.simulated_exchange = simulated_exchange;
        this.order_book = [];
        this.cycle_waited = 0;
    }

    execute(current_usd_per_btc, nth_minute) {
        if (nth_minute % this.params.trading_cycle_minutes) {
            // not a multiple of trading_cycle_minutes, wait until market builds enough volatility
            // NOTE: this is a convenience check for simulated run given we have minute resolution data
            //       in real life, we need to probably check system time, or the time we last examined the market.
            return;
        }

        let last_order_pair = _.last(this.order_book);

        // should we place an order?
        // do we have enough bitcoins or USD to proceed.
        let should_place_order = false;

        // are both of the last order executed? If so, we can place order
        // N.B. _.every(undefined, f) always evalutes to true.
        if(_.every(last_order_pair, o => o.executed)) {
            should_place_order = true;
        }

        // if latest order pair has only executed one side, but we have waited enough cycles,
        // we can also place the orde.
        let waited_long_enough = this.cycle_waited > this.params.max_wait_cycle_for_partial_order
         
        if (partial_executed(last_order_pair) && waited_long_enough) {
            should_place_order = true;
        }

        if (should_place_order) {
            this.place_order(current_usd_per_btc);
            this.cycle_waited = 0;
        }

        if (partial_executed(last_order_pair) && !waited_long_enough) {
            this.cycle_waited++;
        }

        function partial_executed(order_pair) {
            return order_pair && order_pair[0].executed != order_pair[1].executed;
        }
    }

    place_order(current_usd_per_btc) {
        // use the closing price at each tick because we pretend our strategy is called at the end of the tick.
        let buy_price = current_usd_per_btc * (1 - this.params.basis_point_delta / 10000);
        let sell_price = current_usd_per_btc * (1 + this.params.basis_point_delta / 10000);

        let buy_order = new Order('buy', this.params.usd_quantity_per_order, buy_price, 'USD');
        let btc_purchased = buy_order.btc_amount;
        let sell_order = new Order('sell', btc_purchased, sell_price, 'BTC');

        // now, check balance whether we can afford those orders.
        let outstanding_btc_sell_total = _(this.order_book).flatten()
            .filter(o => {return (o.type == 'sell' && !o.executed) })
            .sumBy(o => { return o.btc_amount });
        let outstanding_usd_buy_total = _(this.order_book).flatten()
            .filter(o => { return (o.type == 'buy' && !o.executed); })
            .sumBy(o => { return o.usd_amount });

        let enough_btc = (this.simulated_exchange.book.btc - outstanding_btc_sell_total - sell_order.btc_amount > 0);
        let enough_usd = (this.simulated_exchange.book.usd - outstanding_usd_buy_total - buy_order.usd_amount > 0);

        if (enough_btc && enough_usd) {
            // now place the order
            this.simulated_exchange.place_order(buy_order, sell_order);
            this.order_book.push([buy_order, sell_order]);
        }
    }
}
module.exports = Strategy;


