<template>
    <div class="donate">
        <div class="donate-bar">如果對你很實用的話，可以考慮支持本程式</div>
        <div class="donate-buttons">
            <button @click="btnUSDT_TRC20()">USDT - TRC20<br>Exchange</button>
            <button @click="btnUSDT_BEP20()">USDT - BEP20<br>Exchange</button>
            <button @click="btnBUSD_BEP20()">BUSD - BEP20<br>Exchange</button>
        </div>
        <div class="donate-text">{{ hashKey }}</div>
    </div>
</template>

<script lang="ts">
import { ref } from '@vue/reactivity';
import { Vue } from 'vue-class-component';

export default class Donate extends Vue {
    hashKey: InstanceType<typeof String> | null = ref<any>(null);

    created() {
        this.hashKey = '';
    }

    btnUSDT_TRC20() {
        this.hashKey = 'TEa3v8bBz8kRW6arq4LjrEpfywMKpyUPP8';
    }

    btnUSDT_BEP20() {
        this.hashKey = '0x293a3c7aeadb14b93b73d7ffd40343b0081cd16a';
    }

    btnBUSD_BEP20() {
        this.hashKey = '0x293a3c7aeadb14b93b73d7ffd40343b0081cd16a';
    }
}
</script>

<style scoped>
.donate {
    bottom: 0px;
    width: 100%;
    text-align: center;
    margin-top: 10rem;
    background-color: rgb(231, 231, 231);
    padding: 0.3rem 0;
}
.donate-bar {
    font-weight: bold;
    font-size: 16px;
}
.donate-buttons {
    margin-top: 0.5rem;
}
.donate-text {
    font-weight: bold;
}

button {
    border: none;
    background-color: rgb(125, 255, 125);
    font-size: 14px;
    border-radius: 10px;
    padding: 0.3rem 0.5rem;
    margin: 0.2rem 0.2rem;
    font-weight: bold;
    transition-duration: 0.2s;
    transition-property: 'backgroun-color';
    transition-timing-function: linear;
}
button:hover {
    background-color: rgb(6, 233, 6);
}
button:active {
    background-color: rgb(0, 170, 0);
}
</style>