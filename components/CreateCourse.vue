<template>
      <v-btn @click="dialog = true">Crear un nuevo video curso</v-btn>
	  <div>
      <v-dialog v-model="dialog" max-width="800px">
        <v-card>
          <v-card-title>
            <span class="text-h5">Fill the details</span>
          </v-card-title>
          <v-card-text>
            <v-form ref="form" @submit="submit">
              <v-text-field v-model="data.name" label="Name"></v-text-field>
              <v-text-field v-model="data.symbol" label="Symbol"></v-text-field>
              <v-text-field v-model="data.description" label="Description"></v-text-field>
              <v-text-field v-model="data.external_url" label="External URL"></v-text-field>
				<v-file-input v-model="data.file" label="File input"></v-file-input>
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="blue darken-1" text @click="dialog = false">Close</v-btn>
            <v-btn color="blue darken-1" text @click="submit">Save</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
	  </div>
  </template>

  <script setup>
  const { createCourseNft } = useShyft();

  const dialog = ref(false)
  const valid = ref(false)
  const data = ref({
    name: '',
    symbol: '',
    description: '',
    attributes: '',
    external_url: '',
    max_supply: '',
    royalty: '',
    file: null,
    nft_receiver: '',
    service_charge: ''
  })

  const submit = async () => {
		  const res = await createCourseNft(data.value)
		  dialog.value = false
  }
  </script>
