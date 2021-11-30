import CoinData from './CoinData'

export default class BinanceWebSocket {
    private _socket: WebSocket;

    constructor() {
        this._socket = new WebSocket('wss://stream.binance.com:9443/ws');
        this._socket.onmessage = (msg) => {
            const data = JSON.parse(msg.data);
            this.onMessage(new CoinData(data.p, data.s));
        };
    }

    subscribe(coin: string) {
        const sub: any = {};
        sub['method'] = 'SUBSCRIBE';
        sub['params'] = [coin.toLowerCase() + '@trade'];
        sub['id'] = 1;
        const json = JSON.stringify(sub);
        this._socket.send(json);
    }

    unSubscribe(coin: string) {
        const sub: any = {};
        sub['method'] = 'UNSUBSCRIBE';
        sub['params'] = [coin.toLowerCase() + '@trade'];
        sub['id'] = 312;
        const json = JSON.stringify(sub);
        this._socket.send(json);
    }

    private _z!: number;
    onMessage(data: CoinData) {
        this._z = 1;
    }
}

