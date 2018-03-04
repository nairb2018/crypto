class CandleStick {
    //  [ time, low, high, open, close, volume ]
    constructor(candle_stick_array) {
        this.candle_stick_array = candle_stick_array;
    }

    get time() {
        return this.candle_stick_array[0];
    }

    get low() {
        return this.candle_stick_array[1];
    }

    get high() {
        return this.candle_stick_array[2];
    }

    get open() {
        return this.candle_stick_array[3];
    }

    get close() {
        return this.candle_stick_array[4];
    }

    get volume() {
        return this.candle_stick_array[5];
    }
}

module.exports = CandleStick;