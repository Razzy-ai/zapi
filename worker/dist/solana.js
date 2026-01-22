"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendSol = sendSol;
const web3_js_1 = require("@solana/web3.js");
const connection = new web3_js_1.Connection(
//   "https://solana-mainnet.g.alchemy.com/v2/IP4vVzxBk7ZIWStHXY8s0"
"https://api.devnet.solana.com");
function sendSol(to, amount) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!process.env.SOL_PRIVATE_KEY) {
            throw new Error("SOL_PRIVATE_KEY not set");
        }
        const solAmount = Number(amount);
        if (isNaN(solAmount) || solAmount <= 0) {
            throw new Error("Invalid SOL amount");
        }
        const secretKey = Uint8Array.from(JSON.parse(process.env.SOL_PRIVATE_KEY));
        const keypair = web3_js_1.Keypair.fromSecretKey(secretKey);
        const transaction = new web3_js_1.Transaction().add(web3_js_1.SystemProgram.transfer({
            fromPubkey: keypair.publicKey,
            toPubkey: new web3_js_1.PublicKey(to),
            lamports: solAmount * web3_js_1.LAMPORTS_PER_SOL,
        }));
        const signature = yield (0, web3_js_1.sendAndConfirmTransaction)(connection, transaction, [keypair]);
        console.log("✅ SOL sent. Tx signature:", signature);
        console.log(keypair.publicKey.toBase58());
    });
}
