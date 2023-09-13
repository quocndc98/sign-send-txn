import 'dotenv/config';
import web3 from '@solana/web3.js';

const solProviderUrl = process.env.SOL_PROVIDER_URL;
const connection = new web3.Connection(solProviderUrl, 'confirmed');

const secret = JSON.parse(process.env.SOL_PRIVATE_KEY);
const from = web3.Keypair.fromSecretKey(new Uint8Array(secret));

// Generate a random address to send to
const to = web3.Keypair.generate();

const main = async () => {
  try {
    const senderBalanceBefore = await connection.getBalance(from.publicKey);
    const receiverBalanceBefore = await connection.getBalance(to.publicKey);
    console.log(`Sender balance before ${senderBalanceBefore / web3.LAMPORTS_PER_SOL} SOL`);
    console.log(`Receiver balance before ${receiverBalanceBefore / web3.LAMPORTS_PER_SOL} SOL`);

    const transaction = new web3.Transaction().add(
      web3.SystemProgram.transfer({
        fromPubkey: from.publicKey,
        toPubkey: to.publicKey,
        lamports: web3.LAMPORTS_PER_SOL / 10
      })
    );

    // Sign and send transaction
    const signature = await web3.sendAndConfirmTransaction(connection, transaction, [from]);
    console.log('signature', signature);

    const senderBalanceAfter = await connection.getBalance(from.publicKey);
    const receiverBalanceAfter = await connection.getBalance(to.publicKey);
    console.log(`Sender balance after ${senderBalanceAfter / web3.LAMPORTS_PER_SOL} SOL`);
    console.log(`Receiver balance after ${receiverBalanceAfter / web3.LAMPORTS_PER_SOL} SOL`);

  } catch (error) {
    console.log('Error', error);
  }
};

main();
