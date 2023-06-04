import {Connection,Keypair,LAMPORTS_PER_SOL,PublicKey,SystemProgram,Transaction} from '@solana/web3.js';
import {SolflareWalletAdapter} from '@solana/wallet-adapter-solflare';
import {ref} from 'vue';
import {Buffer} from 'buffer';
// import env
export const useShyft = () => {
	const adapter = new SolflareWalletAdapter();
	const balance = ref(null);
	const address = ref(null);
	const isConnected = ref(false);
	const config = useRuntimeConfig();
	// shyftKey is the key to access the shyft api is in config.public.shyftKey
	const connection = new Connection(config.public.solanaRPC,'confirmed');
	const {$api} = useNuxtApp();

	const connectWallet = async function() {
		try {
			const version = await connection.getVersion();
			console.log('Connection to cluster established:',version);

			await adapter.connect();
			if (adapter.connected) {
				console.log('Wallet connected');
				address.value = adapter.publicKey?.toString();
				isConnected.value = true;
				await getBalance();
			} else {
				console.log('Please connect your wallet');
			}
		} catch (err) {
			console.error(err);
		}
	};

	const createAccount = async function() {
		const newAccount = Keypair.generate();
		const publicKeyBase58 = newAccount.publicKey.toBase58();  // Convert to base58
		const secretKeyBase58 = newAccount.secretKey.reduce(
			(secretKeyString,byte) => secretKeyString + byte.toString(16).padStart(2,"0"),
			""
		);  // Convert to hexadecimal string

		const htmlBeauty = `<p>La cuenta fue creada con exito! <br> Public key (base58): ${publicKeyBase58}</p><p>Private key (hexadecimal): ${secretKeyBase58}</p><br><p>Guarda tu private key en un lugar seguro, no la compartas con nadie!</p>`;
		console.log(htmlBeauty);
		return htmlBeauty;
	};

	const getBalance = async function() {
		try {
			if (isConnected.value && address.value) {
				balance.value = await connection.getBalance(new PublicKey(address.value));
				// parse balance to SOL
				const parsedBalance = balance.value / LAMPORTS_PER_SOL;
				balance.value = parsedBalance;
			}
		} catch (err) {
			console.error(err);
		}
	};

	const createTransaction = async function(transactionJSON) {
		try {
			console.log("transactionJSON: ",transactionJSON);
			window.Buffer = Buffer;
			if (!isConnected.value) {
				await connectWallet();
			}
			const senderPubicKey = address.value;
			const {action,details} = transactionJSON;
			switch (action) {
				case 'transfer':
					// convert amount to Solana bigInt  (1 SOL = 10^9 lamports)
					const detailsParse = details.amount * LAMPORTS_PER_SOL

					/*  console log all variables that i will send as transzaction */
					console.log("senderPubicKey: ",senderPubicKey);
					console.log("details.receiver: ",details.receiver);
					console.log("detailsParse: ",detailsParse);

					const transaction = new Transaction().add(
						SystemProgram.transfer({
							fromPubkey:new PublicKey(senderPubicKey),
							toPubkey:new PublicKey(details.receiver),
							lamports:detailsParse.toString(),
						})
					);
					const {blockhash} = await connection.getRecentBlockhash();
					transaction.recentBlockhash = blockhash;
					transaction.feePayer = new PublicKey(senderPubicKey);
					let signed;
					try {
						signed = await adapter.signTransaction(transaction);
					} catch (err) {
						console.error('Transaction signing was cancelled by the user');
						return 'Transaction cancelled';
					}
					const txid = await connection.sendRawTransaction(signed.serialize());
					// retorna el id de la transacción como un link a solscan
					// https://solscan.io/
					const finalLink = `Transaccion exitosa: puedes ver el estado de tu transaccion aqui: <a href="https://solscan.io/tx/${txid}">https://solscan.io/tx/${txid}<a/>`;
					return finalLink;
					break;
				case 'create_account':
					return await createAccount();
					break;

				case 'check_balance':
					const accountId = details.accountId
					balance.value = await connection.getBalance(new PublicKey(accountId));
					console.log("Balance: ",balance.value);
					const parsedBalance = balance.value / LAMPORTS_PER_SOL;
					const htmlBeauty = `<p>Balance: ${parsedBalance} SOL</p>`;
					return htmlBeauty;
					break;
			}
		} catch (err) {
			console.error(err);
		}
	};

	const createCourseNft = async function(data) {
		window.Buffer = Buffer;

		try {
			if (!isConnected.value) {
				await connectWallet();
			}

			var myHeaders = new Headers();
			myHeaders.append("x-api-key",config.public.shyftKey);

			const blob = new Blob([data.file],{type:"image/png"});
			var formdata = new FormData();
			console.log("RED: ",config.public.network)
			formdata.append("network", "devnet");
			formdata.append("creator_wallet", address.value);
			formdata.append("name", data.name);
			formdata.append("symbol", data.symbol);
			formdata.append("description", data.description);
			formdata.append("attributes", "[ {    \"trait_type\": \"taste\",    \"value\": \"wow\"  }]");
			formdata.append("external_url", data.external_url);
			formdata.append("max_supply", "1");
			formdata.append("royalty", "5");
			formdata.append("fee_payer", address.value);

			var requestOptions = {
				method:'POST',
				headers:myHeaders,
				body:formdata,
				redirect:'follow'
			};
			const res =	await fetch("https://api.shyft.to/sol/v2/nft/create",requestOptions)
			const resJson = await res.json();
			console.log("resJson: ",resJson.result.encoded_transaction);
			const decodedTransaction = Transaction.from(Buffer.from(resJson.result.encoded_transaction, 'base64'));


			let signed;
			try {
				signed = await adapter.signTransaction(decodedTransaction);
			} catch (err) {
				console.log("err: ",err)
				console.error('Transaction signing was cancelled by the user');
				return 'Transaction cancelled';
			}

			const txid = await connection.sendRawTransaction(signed.serialize());
			console.log("Mint address: ", resJson.result.mint_address);
			console.log("Transaction ID: ", txid);
		} catch (err) {
			console.error(err);
		}
	};


	const createMarketPlace = async function(data) {
		window.Buffer = Buffer;
		var myHeaders = new Headers();
		myHeaders.append("x-api-key",config.public.shyftKey);
		myHeaders.append("Content-Type","application/json");
		// Get current connect address
		if (!address.value) {
			await connectWallet();
		}
		// print the current address
		console.log("address.value: ",address.value);
		var raw = JSON.stringify({
			"network":config.public.network,
			"transaction_fee":10,
			"creator_wallet":address.value.toString(),
		});

		// convert to json object raw


		var requestOptions = {
			method:'POST',
			headers:myHeaders,
			body:raw,
			redirect:'follow'
		};

		// print data to send
		console.log("data: ",raw);
		// send data to shyft api
		const res = await fetch("https://api.shyft.to/sol/v1/marketplace/create",requestOptions)
		const resJson = await res.json();
		const decodedTransaction = Transaction.from(Buffer.from(resJson.result.encoded_transaction, 'base64'));
		let signed;
		try {
			signed = await adapter.signTransaction(decodedTransaction);
		} catch (err) {
			console.log("err: ",err)
			console.error('Transaction signing was cancelled by the user');
			return 'Transaction cancelled';
		}

		const txid = await connection.sendRawTransaction(signed.serialize());
		// wait for transaction to be confirmed
		const r = await connection.confirmTransaction(txid);

	}

	const readAllNFTs = async function(type) {
		var myHeaders = new Headers();
		myHeaders.append("x-api-key",config.public.shyftKey);
		var requestOptions = {
			method:'GET',
			headers: myHeaders,
			redirect:'follow',
		};
		if (!address.value) {
			await connectWallet();
		}
		// print the current address
		let query;
		if (type === 'market') {
			query = `https://api.shyft.to/sol/v1/marketplace/active_listings?network=${config.public.network}&marketplace_address=${config.public.mkt}"`;
		} else if (type === 'me') {
			query = `https://api.shyft.to/sol/v2/nft/read_all?network=${config.public.network}&address=${address.value}&page=1&size=32`;
		} else if (type === 'listings') {
			query = `https://api.shyft.to/sol/v1/marketplace/seller_listings?network=devnet&marketplace_address=${config.public.mkt}&seller_address=${address.value}`;
		}
		const response = await fetch(query, requestOptions);
		const data = await response.json();
		console.log("data: ",data);
		return data
	}

	const buyNft = async function(data) {
		var myHeaders = new Headers();
		myHeaders.append("Content-Type","application/json");
		myHeaders.append("x-api-key",config.public.shyftKey);

		if (!address.value) {
			await connectWallet();
		}
		var raw = JSON.stringify({
			"network":config.public.network,
			"marketplace_address":config.public.mkt,
			"nft_address":data.nft,
			"price":data.price,
			"seller_address":data.seller,
			"buyer_wallet":address.value
		});

		var requestOptions = {
			method:'POST',
			headers:myHeaders,
			body:raw,
			redirect:'follow'
		};

		const response = await fetch("https://api.shyft.to/sol/v1/marketplace/buy",requestOptions)
		const res = await response.json();
		console.log("response: ",res);
		return res;

	}

	const listNft = async function(mint, price) {
		console.log("mint: ",mint);
		console.log("price: ",price);
		window.Buffer = Buffer;
		var myHeaders = new Headers();
		myHeaders.append("x-api-key",config.public.shyftKey);
		myHeaders.append("Content-Type","application/json");
		if (!address.value) {
			await connectWallet();
		}
		// convert price to solana lamports
		var raw = JSON.stringify({
			"network": "devnet",
			"marketplace_address": config.public.mkt,
			"nft_address": mint,
			"price": parseInt(price),
			"seller_wallet": new PublicKey(address.value).toBase58(),
		});


		var requestOptions = {
			method:'POST',
			headers:myHeaders,
			body:raw,
			redirect:'follow'
		};

		const res = await fetch("https://api.shyft.to/sol/v1/marketplace/list",requestOptions)
		const resJson = await res.json();
		const decodedTransaction = Transaction.from(Buffer.from(resJson.result.encoded_transaction, 'base64'));


		let signed;
		try {
			signed = await adapter.signTransaction(decodedTransaction);
		} catch (err) {
			console.log("err: ",err)
			console.error('Transaction signing was cancelled by the user');
			return 'Transaction cancelled';
		}

		const txid = await connection.sendRawTransaction(signed.serialize());
		return txid
	}

	const signEncodedTransaction = async function(encodedTransaction) {
		window.Buffer = Buffer;
		const decodedTransaction = Transaction.from(Buffer.from(encodedTransaction, 'base64'));
		let signed;
		try {
			signed = await adapter.signTransaction(decodedTransaction);
		} catch (err) {
			console.log("err: ",err)
			console.error('Transaction signing was cancelled by the user');
			return 'Transaction cancelled';
		}

		const txid = await connection.sendRawTransaction(signed.serialize());
		// wait for transaction to be confirmed
		return txid
	}
	return {
		connectWallet,
		getBalance,
		createMarketPlace,
		readAllNFTs,
		createCourseNft,
		createTransaction,
		balance,
		address,
		listNft,
		buyNft,
		isConnected,
	};
};


