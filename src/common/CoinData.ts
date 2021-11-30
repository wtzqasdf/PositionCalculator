export default class CoinData {
    private _price: string;
    private _coin: string;

    constructor(price: string, coin: string) {
        this._price = price;
        this._coin = coin;
    }

    get price(): string {
        return this._price;
    }

    get coin(): string {
        return this._coin;
    }
}