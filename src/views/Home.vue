<template>
    <div class="container-fluid mt-4">
        <div class="row justify-content-center">
            <div class="col-xl-4 col-lg-4 col-6">
                <input class="form-control" type="text" placeholder="交易對，BTCUSDT，大小寫皆可" v-model="inputTradeCoin" />
            </div>
            <div class="col-xl-4 col-lg-4 col-6">
                <div class="d-flex justify-content-center">
                    <button type="button" class="btn btn-success" style="width: 40%;" @click="addCoin()">新增</button>
                    <button type="button" class="btn btn-danger ms-1" style="width: 40%;" @click="removeCoin()">刪除</button>
                </div>
            </div>
        </div>
        <div class="row justify-content-center">
            <div class="col-12">
                <button class="coin" v-for="(coin, index) in coins" :key="index" @click="coinSelected(coin)">{{ coin }}</button>
            </div>
        </div>
        <!-- underline -->
        <div class="underline"></div>
        <div class="row justify-content-center mt-2">
            <div class="col-xl-2 col-lg-3 col-6 text-center mt-2">
                <h3 title="總倉位計算後與現價比較，得知目前的盈虧比">盈虧(百分比)</h3>
                <div class="text" :class="[ isPOL ? 'text-success' : 'text-danger' ]">{{ palPercentText }}</div>
            </div>
            <div class="col-xl-2 col-lg-3 col-6 text-center mt-2">
                <h3 title="總倉位計算後與現價比較，得知目前的盈虧金額">盈虧</h3>
                <div class="text" :class="[ isPOL ? 'text-success' : 'text-danger' ]">{{ palPriceText }}</div>
            </div>
            <div class="col-xl-2 col-lg-3 col-6 text-center mt-2">
                <h3 title="花了多少金額買進所有倉位">總成本</h3>
                <div class="text">{{ totalCostText }}</div>
            </div>
            <div class="col-xl-2 col-lg-3 col-6 text-center mt-2">
                <h3 title="總倉位計算後，如果要一次賣出所有倉位，需要高於這個價格才不會產生虧損(預估會再高於0.5%)">平倉目標價</h3>
                <div class="text">{{ sellTargetPrice }}</div>
            </div>
            <div class="col-xl-2 col-lg-3 col-6 text-center mt-2">
                <h3 title="指定交易對的目前價格">最新價格</h3>
                <div class="text">{{ currentPrice }}</div>
            </div>
        </div>
        <div class="row mt-2">
            <div class="col-12">
                <table class="table table-striped table-sm table-bordered table-hover table-responsive">
                    <thead class="thead-default">
                        <tr>
                            <th>價格</th>
                            <th>數量</th>
                            <th>手續費</th>
                            <th>成本</th>
                            <th>盈虧</th>
                            <th>動作</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(data,index) in positionContainer.positions" :key="index">
                            <td>
                                <input class="form-control" type="number" v-model="data.price" @input="calcAll(); savePositions()" />
                            </td>
                            <td>
                                <input class="form-control" type="number" v-model="data.count" @input="calcAll(); savePositions()" />
                            </td>
                            <td>
                                <input class="form-control" type="number" v-model="data.fee" @input="calcAll(); savePositions()" />
                            </td>
                            <td>{{ data.costText }}</td>
                            <td>
                                <span class="font-bold" :class="[ data.isPOL ? 'text-success' : 'text-danger' ]">{{ data.palText }}</span>
                            </td>
                            <td>
                                <button type="button" class="btn btn-danger" @click="removePosition(index)">刪除</button>
                            </td>
                        </tr>
                    </tbody>
                </table>
                <div class="d-grid gap-2 mt-2">
                    <button type="button" class="btn btn-primary btn-sm" @click="addPosition()">新增</button>
                </div>
            </div>
        </div>
        <div class="row mt-2">
            <div class="col-12 text-center">
                <div class="font-bold text-danger">(請注意，本程式僅供用於參考計算，不代表任何交易立場或動作，如產生買賣之虧損情況，皆與本程式無關)</div>
                <div class="font-bold text-danger">(切換貨幣時，需等待價格回傳後才會計算，故停頓幾秒無資料是正常的)</div>
                <div class="font-bold">(資料來源: Binance)</div>
            </div>
        </div>
    </div>
    <Donate></Donate>
</template>

<script lang="ts">
import { ref } from '@vue/reactivity';
import { Options, Vue } from 'vue-class-component';
import Binance from '../common/BinanceWebSocket';
import CoinData from '../common/CoinData';
import Donate from '../components/Donate.vue';

@Options({
    components: { Donate },
})
export default class Home extends Vue {
    positionContainer: InstanceType<typeof PositionContainer> | null = ref<any>(null);

    inputTradeCoin: InstanceType<typeof String> | null = ref<any>(null);
    coins: InstanceType<typeof String>[] | null = ref<any>(null);
    currentCoin: InstanceType<typeof String> | null = ref<any>(null);

    totalCostText: InstanceType<typeof String> | null = ref<any>(null);
    palPrice: InstanceType<typeof Number> | null = ref<any>(null);
    palPriceText: InstanceType<typeof String> | null = ref<any>(null);
    palPercentText: InstanceType<typeof String> | null = ref<any>(null);
    isPOL: InstanceType<typeof Boolean> | null = ref<any>(null);
    sellTargetPrice: InstanceType<typeof String> | null = ref<any>(null);
    currentPrice: InstanceType<typeof Number> | null = ref<any>(null);

    binanceSocket!: Binance;

    created() {
        this.positionContainer = new PositionContainer();
        this.totalCostText = '0';
        this.palPrice = 0;
        this.palPriceText = '0.0000';
        this.palPercentText = '0.00%';
        this.sellTargetPrice = '0';
        this.inputTradeCoin = '';
        this.currentPrice = 0;
        this.currentCoin = '';
        this.isPOL = false;
        this.coins = [];
    }
    mounted() {
        this.loadCoins();
        this.binanceSocket = new Binance();
        this.binanceSocket.onMessage = this.onMessage;
    }

    onMessage(data: CoinData) {
        this.currentPrice = parseFloat(data.price);
        this.calcAll();
    }

    coinSelected(nextCoin: string) {
        //sub / unsub channel of websocket
        if (this.currentCoin?.length !== 0) {
            this.binanceSocket.unSubscribe(this.currentCoin as string);
        }
        this.binanceSocket.subscribe(nextCoin);
        //load positions
        this.currentCoin = nextCoin;
        this.loadPositions();
        this.calcAll();
    }

    calcAll() {
        //calc profit and less for positions
        this.positionContainer?.calcPALOfPos(this.currentPrice as number);
        //show cost to element
        this.totalCostText = (this.positionContainer?.totalCost as number).toFixed(4);

        let expectCost = this.positionContainer!.totalCount * (this.currentPrice as number);
        //is profit or less
        if (expectCost > this.positionContainer!.totalCost) {
            this.isPOL = true;
        } else {
            this.isPOL = false;
        }

        this.palPrice = expectCost - this.positionContainer!.totalCost;
        this.palPriceText = this.palPrice.toFixed(4);
        this.palPercentText = (expectCost / this.positionContainer!.totalCost - 1).toFixed(4) + '%';
        this.sellTargetPrice = ((this.positionContainer!.totalCost / this.positionContainer!.totalCount) * 1.005).toFixed(4) + '(+0.5%)';
    }

    //---IO Actions---
    addCoin() {
        this.inputTradeCoin = this.inputTradeCoin?.toUpperCase() as string;
        if (this.coinExists(this.inputTradeCoin as string)) {
            return;
        }
        this.coins!.push(this.inputTradeCoin as string);
        this.saveCoins();
        this.inputTradeCoin = '';
    }
    saveCoins() {
        localStorage.setItem('coins', JSON.stringify(this.coins));
    }
    loadCoins() {
        const json = localStorage.getItem('coins');
        if (json) {
            this.coins = JSON.parse(json);
        }
    }
    removeCoin() {
        this.inputTradeCoin = this.inputTradeCoin?.toUpperCase() as string;
        if (!this.coinExists(this.inputTradeCoin as string)) {
            return;
        }
        for (let i = 0; i < this.coins!.length; i++) {
            if (this.coins![i] === this.inputTradeCoin) {
                this.coins!.splice(i, 1);
                break;
            }
        }
        this.saveCoins();
        this.removeStoragePositions(this.inputTradeCoin as string);
        this.inputTradeCoin = '';
    }
    coinExists(coin: string): boolean {
        for (let i = 0; i < this.coins!.length; i++) {
            if (this.coins![i] === coin) {
                return true;
            }
        }
        return false;
    }

    addPosition() {
        this.positionContainer?.addPosition(0, 0, 0);
        this.savePositions();
        this.calcAll();
    }
    savePositions() {
        localStorage.setItem(this.currentCoin as string, JSON.stringify(this.positionContainer?.positions));
    }
    loadPositions() {
        this.positionContainer!.positions.splice(0, this.positionContainer!.positions.length);
        let positions = localStorage.getItem(this.currentCoin as string);
        if (positions !== null) {
            JSON.parse(positions).forEach((f: any) => {
                f._pal = 0;
                this.positionContainer!.positions.push(Object.assign(new Position(0, 0, 0), f));
            });
        }
    }
    removePosition(index: number) {
        this.positionContainer?.removePosition(index);
        this.savePositions();
        this.calcAll();
    }
    removeStoragePositions(coin: string) {
        localStorage.removeItem(coin);
    }
}

class PositionContainer {
    private _positions: Position[];
    constructor() {
        this._positions = [];
    }

    addPosition(price: number, count: number, fee: number) {
        this._positions.push(new Position(price, count, fee));
    }

    removePosition(index: number) {
        this._positions.splice(index, 1);
    }

    calcPALOfPos(currentPrice: number) {
        this._positions.forEach((f) => {
            f.pal = currentPrice * f.count - f.cost;
        });
    }

    get totalCost(): number {
        let total = 0;
        for (let i = 0; i < this.positions.length; i++) {
            let p = this.positions[i];
            total += p.cost;
        }
        return total;
    }

    get totalCount(): number {
        let count = 0;
        for (let i = 0; i < this.positions.length; i++) {
            let p = this.positions[i];
            count += p.count;
        }
        return count;
    }

    get positions(): Position[] {
        return this._positions;
    }
}
class Position {
    private _price: number;
    private _count: number;
    private _fee: number;
    private _pal: number;

    constructor(price: number, count: number, fee: number) {
        this._price = price;
        this._count = count;
        this._fee = fee;
        this._pal = 0;
    }

    //price of position
    get price(): number {
        return this._price;
    }

    set price(p: number) {
        this._price = p;
    }

    //count of position
    get count(): number {
        return this._count;
    }

    set count(c: number) {
        this._count = c;
    }

    //fee of position
    get fee(): number {
        return this._fee;
    }

    set fee(f: number) {
        this._fee = f;
    }

    //profit and less of position
    get pal(): number {
        return this._pal;
    }

    set pal(p: number) {
        this._pal = p;
    }

    get palText(): string {
        return this._pal.toFixed(4);
    }

    //is profit or less
    get isPOL(): boolean {
        return this._pal >= 0;
    }

    get cost(): number {
        let c = this._price * this._count;
        let f = c * this._fee;
        return c + f;
    }

    get costText(): string {
        return this.cost.toFixed(4);
    }
}
</script>

<style scoped>
h3 {
    cursor: help;
}
h3:hover {
    background-color: lightblue;
}
.text {
    font-size: 18px;
    font-weight: bold;
}
.underline {
    background-color: rgba(0, 0, 0, 0.3);
    width: 100%;
    height: 2px;
    margin: 0.2rem 0;
}
.font-bold {
    font-weight: bold;
}

.coin {
    border: 2px solid black;
    border-radius: 10px;
    padding: 0.5rem;
    cursor: pointer;
    font-weight: bold;
    background-color: white;
    margin: 0.5rem 0.1rem;
}
.coin:hover {
    background-color: lightblue;
}
.coin:active {
    background-color: rgb(138, 138, 255);
}
</style>