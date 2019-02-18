import {getAdapterByType} from '@waves/signature-adapter'
import {BigNumber} from '@waves/data-entities';
import create from 'parse-json-bignumber';
import wc from 'waves-crypto';
import { encryptMessage, decryptMessage } from './cipherUtils';
const {stringify, parse} = create({BigNumber});


export class Wallet {
    constructor(user) {
        if (!user) throw new Error('user required');
        this.user = user
    }

    get _adapter(){
        const Adapter = getAdapterByType(this.user.type);

        Adapter.initOptions({networkCode: this.user.networkCode.charCodeAt(0)});

        //Todo: temporary for seed
        let params = this.user;
        if (this.user.type === 'seed'){
            params = this.user.seed;
        }
        return new Adapter(params)
    }

    getAccount() {
        let account = Object.assign({}, this.user);
        delete account['id'];
        delete account['seed'];
        return account;
    }

    serialize() {
        return this.user
    }

    getSecret() {
        return this.user.seed
    }

    async encrypt(message, recieverPublicKey) {
        const privateKey = await this._adapter.getPrivateKey();
        return encryptMessage(message, privateKey, recieverPublicKey); 
    }

    async decrypt(message, senderPublicKey) {
        const privateKey = await this._adapter.getPrivateKey();
        return decryptMessage(message, privateKey, senderPublicKey); 
    }

    async signTx(tx){
        const signable = this._adapter.makeSignable(tx);
        return stringify(await signable.getDataForApi());
    }

    async signBytes(bytes){
        return await this._adapter.signData(Uint8Array.from(bytes))
    }

    async signRequest(request){
        const signable = this._adapter.makeSignable(request);
        return await signable.getSignature()
    }
}
