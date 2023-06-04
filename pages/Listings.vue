<template>
	<v-main><v-container>
		<v-alert v-if="listings.length === 0">
			Aun no tienes Cursos listados en el marketplace!
		</v-alert>
	</v-container></v-main>
		<v-row>
			<v-col cols="12" sm="6" md="4" v-for="(nft, index) in listings" :key="index">
				<v-card class="mx-auto" outlined>
					<v-img :src="nft.image_uri" :alt="nft.name" class="white--text" height="200px">
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
					</v-card-text>
				</v-card>
			</v-col>
		</v-row>
</template>

<script setup>

const {readAllNFTs} = useShyft()
const listings = ref([])

// onMounted hook

onMounted(async () => {
	const res = await readAllNFTs('listings')
	listings.value = res.result
});

</script>
