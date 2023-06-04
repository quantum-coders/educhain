<script setup lang="ts">
	const { createMarketPlace } = useShyft()
	const create = async () => {
		const res = await createMarketPlace()
		console.log(res)
	}
</script>

<template>
	<v-main>
		<v-container>
			<h1>Marketplace: He2axJZ8gBso1XYXvB4kjff5aLpqEq9SDbzJESF5D97a</h1>
<!-- 			<v-btn @click="create">
				crear marketplace
			</v-btn> -->
		</v-container>
	</v-main>

</template>

<style scoped>

</style>
