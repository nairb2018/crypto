class Order {

    constructor(type, quantity, usd_per_btc, unit = 'USD') {
        this.type = type;
        this.quantity = quantity;
        this.usd_per_btc = usd_per_btc;
        this.unit = unit;
        this.execution_time = undefined;
    }


    get usd_amount() {
        if (!this.quantity || !this.usd_per_btc || !this.unit) {
            return undefined;
        } else if (this.unit == 'USD') {
            return this.quantity;
        } else if (this.unit == 'BTC') {
            return this.quantity * this.usd_per_btc;
        }
    }

    get btc_amount() {
        if (!this.quantity || !this.usd_per_btc || !this.unit) {
            return undefined;
        } else if (this.unit == 'BTC') {
            return this.quantity;
        } else if (this.unit == 'USD') {
            return this.quantity / this.usd_per_btc;
        }
    }

    get executed() {
        return this.execution_time != undefined;
    }
}

module.exports = Order;