<template>
	<client-only>
	<v-main>
		<v-container>
		<v-alert  class="mb-5" v-if="cursos.length === 0">
			No tienes cursos aun! Crea el primero!
		</v-alert>
		<create-course class="mt-4 pt-4" v-if="cursos.length === 0" />
		<v-row>
			<v-col cols="12" sm="6" md="4" v-for="(nft, index) in cursos" :key="index">
				<v-card class="mx-auto" outlined>
					<v-img :src="`https://img.youtube.com/vi/${nft.external_url.split('v=')[1]}/0.jpg`" :alt="nft.name" class="white--text" height="200px">
						<v-card-title class="fill-height align-end">{{ nft.name }}</v-card-title>
					</v-img>
					<v-card-subtitle>{{ nft.description }}</v-card-subtitle>
					<v-card-text>
						<div>Symbol: {{ nft.symbol }}</div>
						<div>Royalty: {{ nft.royalty }}</div>
						<div>External URL: <a :href="nft.external_url">{{ nft.external_url }}</a></div>
						<div v-if="nft.creators && nft.creators.length">
							<div>Creators:</div>
							<ul>
								<li v-for="(creator, creatorIndex) in nft.creators" :key="creatorIndex">
									{{ creator.address }} - Verified: {{ creator.verified }} - Share: {{ creator.share }}
								</li>
							</ul>
						</div>
						<v-btn @click="openDialog(nft)">Listar NFT</v-btn>
					</v-card-text>
				</v-card>
			</v-col>
		</v-row>
		<div>
		<v-dialog v-model="dialog" persistent max-width="290">
			<v-card>
				<v-card-title class="headline">Especificar Precio</v-card-title>
				<v-card-text>
					<v-text-field v-model="precio" label="Precio" type="number"></v-text-field>
				</v-card-text>
				<v-card-actions>
					<v-spacer></v-spacer>
					<v-btn color="green darken-1" text @click="listNftWithPrice()">Listar</v-btn>
					<v-btn color="green darken-1" text @click="dialog = false">Cancelar</v-btn>
				</v-card-actions>
			</v-card>
		</v-dialog>
		</div>
		</v-container>
	</v-main>
	</client-only>
</template>

<script setup>

const { readAllNFTs, listNft } = useShyft()
const cursos = ref([])
const dialog = ref(false)
const nftToBeListed = ref(null)
const precio = ref(0)

onMounted(async () => {
	const res = await readAllNFTs('me')
	console.log(res.result.nfts)
	cursos.value = res.result.nfts
});

const openDialog = (nft) => {
	nftToBeListed.value = nft
	dialog.value = true
}

const listNftWithPrice = async () => {
	const res = await listNft(nftToBeListed.value.mint, precio.value)
	dialog.value = false
}

// get youtube thumbnail from url:
</script>
