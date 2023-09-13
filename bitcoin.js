import 'dotenv/config';
import { ECPairFactory } from 'ecpair';
import * as bitcoin from 'bitcoinjs-lib';
import * as ecc from 'tiny-secp256k1';

const generateKey = () => {
  const NETWORK = bitcoin.networks.testnet;
  const ECPair = ECPairFactory(ecc);
  const keyPair = ECPair.makeRandom({ network: NETWORK });
  const { address } = bitcoin.payments.p2pkh({
    pubkey: keyPair.publicKey,
    network: NETWORK
  });
  const publicKey = keyPair.publicKey.toString('hex');
  const privateKeyWif = keyPair.toWIF();
  return {
    address,
    publicKey,
    privateKeyWif
  };
};

const getTxUtho = async (address) => {
  console.log(address)
  try {
    const res = await fetch(`https://api.blockcypher.com/v1/btc/test3/addrs/${address}/full?includeHex=true`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    const account = await res.json()
    if (!!account.txs.length) {
      return {
        hash: account.txs[0].hash,
        hex: account.txs[0].hex
      };
    }
  } catch (error) {
    console.error('getTxUtho > Error', error);
  }
};

const sendTransactions = async (
  to,
  amount,
  from,
  privateKey,
) => {
  const network = bitcoin.networks.testnet;
  const ECPair = ECPairFactory(ecc);
  const senderKeyPair = ECPair.fromWIF(privateKey, network);

  const { hash, hex } = await getTxUtho(from);
  const psbt = new bitcoin.Psbt({ network });
  psbt.addInput({
    hash: hash, //txId
    index: 0,
    nonWitnessUtxo: Buffer.from(hex, 'hex'),
  });

  psbt.addOutput({
    address: to,
    value: amount,
  });

  psbt.signInput(0, senderKeyPair);
  psbt.finalizeAllInputs();
  const txRaw = psbt.extractTransaction(true); // max fee
  const txHash = await pushRawTransaction(txRaw.toHex());
  return txHash;
};

const pushRawTransaction = async (txHex) => {
  try {
    const res = await fetch(`https://api.blockcypher.com/v1/btc/test3/txs/push`, {
      method: 'POST',
      body: JSON.stringify({ tx: txHex }),
      headers: {
        'Content-Type': 'application/json'
      }
    });
    return res.hash;
  } catch (e) {
    console.error('pushRawTransaction > error', error);
  }
};

const main = async () => {
  const network = bitcoin.networks.testnet;
  const ECPair = ECPairFactory(ecc);
  const senderPriKeyWIF = process.env.BTC_SENDER_PRI_WIF;
  const senderKeyPair = ECPair.fromWIF(senderPriKeyWIF, network);
  const { address: senderAddress } = bitcoin.payments.p2pkh({
    pubkey: senderKeyPair.publicKey,
    network
  });

  const receiverAddress = process.env.BTC_RECEIVER_ADDRESS;

  sendTransactions(
    receiverAddress, // to
    10000, // amount
    senderAddress, // from
    senderPriKeyWIF, //private
  );
};

main();
