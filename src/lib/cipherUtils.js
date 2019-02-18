import CryptoJS from 'crypto-js';
import base58 from './base58';
import axlsign from './axlsign';


function getSharedKey(secretKey, publicKey) {
	return base58.encode(axlsign.sharedKey(base58.decode(secretKey), base58.decode(publicKey)));
}

export function encryptMessage(message, privateKey, publicKey) {
	return CryptoJS.AES.encrypt(message, getSharedKey(privateKey, publicKey)).toString();
}

export function decryptMessage(message, privateKey, publicKey) {
	const bytes = CryptoJS.AES.decrypt(message, getSharedKey(privateKey, publicKey));
	return bytes.toString(CryptoJS.enc.Utf8);
}
