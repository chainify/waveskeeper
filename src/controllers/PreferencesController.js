import ObservableStore from 'obs-store';
import log from 'loglevel'
import EventEmitter from 'events';

export class PreferencesController extends EventEmitter{
    constructor(options = {}) {
        super();

        const defaults = {
            currentLocale: options.initLangCode || 'en',
            accounts: [],
            currentNetworkAccounts: [],
            selectedAccount: undefined
        };
        this.getNetworkConfig = options.getNetworkConfig;
        const initState = Object.assign({}, defaults, options.initState);
        this.store = new ObservableStore(initState);

        this.getNetwork = options.getNetwork
    }


    setCurrentLocale(key) {
        this.store.updateState({currentLocale: key})
    }

    // addAccount(account) {
    //     const accounts = this.store.getState().accounts;
    //     if (!this._getAccountByAddress(account.address)) {
    //         accounts.push(Object.assign({name: `Account ${accounts.length + 1}`}, account));
    //         this.store.updateState({accounts})
    //     } else {
    //         log.log(`Account with address key ${account.address} already exists`)
    //     }
    // }

    syncAccounts(fromKeyrings) {
        const oldAccounts = this.store.getState().accounts;
        const accounts = fromKeyrings.map((account, i) => {
            return Object.assign(
                {name: `Account ${i + 1}`},
                account,
                oldAccounts.find(oldAcc => oldAcc.address === account.address),
            )
        });
        this.store.updateState({accounts});

        this.syncCurrentNetworkAccounts();
    }

    syncCurrentNetworkAccounts(){
        const accounts = this.store.getState().accounts;
        const currentNetworkAccounts = accounts.filter(account => account.networkCode === this.getNetworkConfig()[this.getNetwork()].code);
        this.store.updateState({currentNetworkAccounts});

        // Ensure we have selected account from current network
        let selectedAccount = this.store.getState().selectedAccount;
        if (!selectedAccount || !currentNetworkAccounts.find(account => account.address === selectedAccount.address)){
            const addressToSelect = currentNetworkAccounts.length > 0 ? currentNetworkAccounts[0].address : undefined;
            this.selectAccount(addressToSelect)
        }
    }

    addLabel(address, label) {
        const accounts = this.store.getState().accounts;
        const index = accounts.findIndex(current => current.address === address);
        if (index === -1){
            throw new Error(`Account with address "${address}" not found`)
        }
        accounts[index].name = label;
        this.store.updateState({accounts})
    }

    selectAccount(address) {
        let selectedAccount = this.store.getState().selectedAccount;
        if (!selectedAccount || selectedAccount.address !== address) {
            selectedAccount = this._getAccountByAddress(address);
            this.store.updateState({selectedAccount});
            this.emit('accountChange');
        }
    }

    _getAccountByAddress(address) {
        const accounts = this.store.getState().accounts;
        return accounts.find(account => account.address === address)
    }
}
