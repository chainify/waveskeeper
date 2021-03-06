import ObservableStore from 'obs-store';

const WAVESKEEPER_DEBUG = process.env.NODE_ENV !== 'production';


export class NetworkController {
    constructor(options = {}) {
        const defaults = {
            currentNetwork: WAVESKEEPER_DEBUG ? 'testnet' : 'mainnet',
            customNodes: {
                mainnet: null,
                testnet: null
            },
            customMatchers: {
                mainnet: null,
                testnet: null
            }
        };

        const {initState, getNetworkConfig, getNetworks} = options;
        this.store = new ObservableStore({...defaults, ...initState});
        this.configApi = {getNetworkConfig, getNetworks};
    }

    getNetworkCode() {
        return this.configApi.getNetworkConfig()[this.getNetwork()].code;
    }

    getNetworks() {
        const networks = this.configApi.getNetworkConfig();
        return this.configApi.getNetworks().map(name => ({ ...networks[name], name }));
    }

    setNetwork(network) {
        this.store.updateState({currentNetwork: network});
    }

    getNetwork() {
        return this.store.getState().currentNetwork
    }

    setCustomNode(url, network = 'mainnet') {
        let {customNodes} = this.store.getState();
        customNodes[network] = url;
        this.store.updateState({customNodes});
    }

    setCustomMatcher(url, network = 'mainnet') {
        let {customMatchers} = this.store.getState();
        customMatchers[network] = url;
        this.store.updateState({customMatchers});
    }

    getCustomNodes() {
        return this.store.getState().customNodes;
    }

    getNode() {
        const networks = this.configApi.getNetworkConfig();
        const network = this.getNetwork();
        return this.getCustomNodes()[network] || networks[network].server;
    }

    getCustomMatchers() {
        return this.store.getState().customMatchers;
    }

    getMather() {
        const network = this.getNetwork();
        return this.getCustomMatchers()[network] || this.configApi.getNetworkConfig()[network].matcher;
    }

    async getMatcherPublicKey() {
        const keyMap = {};
        const url = new URL('/matcher', this.getMather()).toString();
        if (keyMap[url] == null) {
            const resp = await fetch(url);

            keyMap[url] = await resp.text()
        }
        return keyMap[url];
    }

    async broadcast(message) {
        const {result, type} = message;
        let API_BASE, url;

        switch (type) {
            case 'transaction':
                API_BASE = this.getNode();
                url = new URL('transactions/broadcast', API_BASE).toString();
                break;
            case 'order':
                API_BASE = this.getMather();
                if (!API_BASE) {
                    throw new Error('Matcher not set. Cannot send order')
                }
                url = new URL('matcher/orderbook', API_BASE).toString();
                break;
            case 'cancelOrder':
                const {amountId, priceId} = message;
                API_BASE = this.getMather();
                if (!API_BASE) {
                    throw new Error('Matcher not set. Cannot send order')
                }
                url = new URL(`matcher/orderbook/${amountId}/${priceId}/cancel`, API_BASE).toString();
                break;
            default:
                throw new Error(`Unknown message type: ${type}`)
        }

        const resp = await fetch(url, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json; charset=utf-8"
            },
            body: result
        });

        switch (resp.status) {
            case 200:
                return await resp.text();
            case 400:
                const error = await resp.json();
                throw new Error(error.message);
            default:
                throw new Error(await resp.text())
        }
    }

}

