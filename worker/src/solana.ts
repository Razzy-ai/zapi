import {
  Keypair,
  LAMPORTS_PER_SOL,
  SystemProgram,
  Transaction,
  PublicKey,
  sendAndConfirmTransaction,
  Connection
} from "@solana/web3.js";


const connection = new Connection(
//   "https://solana-mainnet.g.alchemy.com/v2/IP4vVzxBk7ZIWStHXY8s0"
 "https://api.devnet.solana.com"
);

export async function sendSol(to: string, amount: string) {
  if (!process.env.SOL_PRIVATE_KEY) {
    throw new Error("SOL_PRIVATE_KEY not set");
  }

  const solAmount = Number(amount);
  if (isNaN(solAmount) || solAmount <= 0) {
    throw new Error("Invalid SOL amount");
  }

  const secretKey = Uint8Array.from(
  JSON.parse(process.env.SOL_PRIVATE_KEY!)
);

const keypair = Keypair.fromSecretKey(secretKey);


  const transaction = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: keypair.publicKey,
      toPubkey: new PublicKey(to),
      lamports: solAmount * LAMPORTS_PER_SOL,
    })
  );

  const signature = await sendAndConfirmTransaction(
    connection,
    transaction,
    [keypair]
  );

  console.log("✅ SOL sent. Tx signature:", signature);

  console.log(keypair.publicKey.toBase58());

}
