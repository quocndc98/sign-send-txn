import 'dotenv/config';
import { ethers } from 'ethers';

const providerUrl = process.env.ETH_PROVIDER_URL;
const provider = new ethers.getDefaultProvider(providerUrl);

const privateKey = process.env.ETH_PRIVATE_KEY;
const signer = new ethers.Wallet(privateKey, provider);

const account1 = '0x8ab2e21FE1D4A22C5c3372c5eaD091CEe9834828';
const account2 = '0x8bbBA3408Af5bAF37710E90d62238f60e8f27C89';

const main = async () => {
  try {
    const senderBalanceBefore = await provider.getBalance(account1);
    const receiverBalanceBefore = await provider.getBalance(account2);

    console.log('Sender balance before', ethers.formatEther(senderBalanceBefore));
    console.log('Receiver balance before', ethers.formatEther(receiverBalanceBefore));

    const { chainId } = await provider.getNetwork();
    const nonce = await signer.getNonce();

    const rawTransaction = {
      to: account2,
      value: ethers.parseEther('0.5'),
      nonce,
      data: '0x',
      chainId
    };
    const estimateGas = await provider.estimateGas(rawTransaction);
    rawTransaction.gasLimit = estimateGas;
    console.log('rawTransaction:', rawTransaction);

    const signedTransaction = await signer.signTransaction(rawTransaction);
    console.log('signedTransaction:', signedTransaction);

    const transaction = await signer.sendTransaction(rawTransaction);
    console.log('transaction:', transaction.hash);

    const senderBalanceAfter = await provider.getBalance(account1);
    const receiverBalanceAfter = await provider.getBalance(account2);

    console.log('Sender balance after', ethers.formatEther(senderBalanceAfter));
    console.log('Receiver balance after', ethers.formatEther(receiverBalanceAfter));
  } catch (error) {
    console.log('Error', error);
  }
};

main();
