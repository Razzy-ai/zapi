const { Keypair } = require("@solana/web3.js");

const keypair = Keypair.generate();

console.log("PUBLIC KEY:", keypair.publicKey.toBase58());
console.log("PRIVATE KEY (copy this to .env):");
console.log(JSON.stringify(Array.from(keypair.secretKey)));
