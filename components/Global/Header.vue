<template>
	<v-app-bar
		color="teal-darken-4"
		image="https://picsum.photos/1920/1080?random"
	>
		<template v-slot:image>
			<v-img
				gradient="to top right, rgba(19,84,122,.8), rgba(128,208,199,.8)"
			></v-img>
		</template>

		<v-app-bar-title><v-btn text="EduChain" to="/"/></v-app-bar-title>

		<v-spacer></v-spacer>

		<v-btn
			rounded="xl"
			outlined
			class=" mx-2"
			v-if="isConnected"
			prepend-icon="mdi-wallet"
		>
			{{ shortAddress }}
		</v-btn>
		<v-btn text v-if="isConnected">{{ formattedBalance }} SOL</v-btn>
		<v-btn
			rounded outlined class="wallet-btn" @click="connectWallet" v-if="!isConnected"
		>Connect Wallet
		</v-btn>
		<v-btn to="/cursos">
			Mis Cursos
		</v-btn>
		<v-btn to="/marketplace">
			Marketplace
		</v-btn>
		<v-btn to="/listings">
			Listings
		</v-btn>
	</v-app-bar>
</template>


<script setup>
import {computed} from 'vue';
import {useShyft} from "~/composables/useShyft";

const {address,balance,isConnected,connectWallet} = useShyft();

const shortAddress = computed(() => {
	if (address.value) {
		return `${address.value.substring(0,3)}...${address.value.substring(address.value.length - 3)}`;
	}
	return '';
});

const formattedBalance = computed(() => {
	if (balance.value) {
		return balance.value.toFixed(2);
	}
	return '';
});

onMounted(async () => {
	await connectWallet();
});
</script>

<style scoped>
.gradient-theme {
	background: linear-gradient(45deg, #1a1a2e, #30336b);
}

.white-text {
	color: white;
}

.wallet-btn {
	border: 2px solid white;
	color: white;
	text-decoration: none !important;
	transition: all .3s ease-in-out;
}

.wallet-btn:hover {
	border-color: transparent;
	background-color: white;
	color: #1a1a2e;
}
</style>
