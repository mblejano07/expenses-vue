<script setup lang="ts">
import { ref } from "vue";
import { requestOtp } from "../services/auth"; // your API call
import { useRouter } from "vue-router"; 

const router = useRouter(); 
const email = ref("");
const result = ref<string>("");

async function handleRequestOtp() {
  if (!email.value) {
    result.value = "Email is required";
    return;
  }

  try {
    const res = await requestOtp(email.value);

    if (res.success) {
      result.value = res.message || "OTP sent";

      // Redirect to Verify page and pass email as query param
      router.push({ name: "Verify", query: { email: email.value } });
      
    } else if (res.errors) {
      result.value = Object.values(res.errors).join(", ");
    } else {
      result.value = res.message || "Failed to request OTP";
    }
  } catch (err: any) {
    try {
      const parsed = JSON.parse(err.message);
      if (parsed.errors) {
        result.value = Object.values(parsed.errors).join(", ");
      } else {
        result.value = parsed.message || "Unknown error";
      }
    } catch {
      result.value = `Error: ${err.message || "Unknown error"}`;
    }
  }
}

</script>

<template>
  <div class="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-sm">
      <img class="mx-auto h-10 w-auto" src="/images/blackpearl.png" alt="Blackpearl" />
      <h2 class="mt-10 text-center text-2xl/9 font-bold tracking-tight text-gray-900">WELCOME</h2>
    </div>

    <div class="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
      <form class="space-y-6" @submit.prevent="handleRequestOtp">
        <div>
          <label for="email" class="block text-sm/6 font-medium text-gray-900">Email address</label>
          <div class="mt-2">
            <input
              v-model="email"
              type="email"
              name="email"
              id="email"
              autocomplete="email"
              required
              class="block w-full rounded-md border-0 bg-white px-3 py-1.5 text-base text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm/6 sm:leading-6"
            />
          </div>
        </div>

        <div>
          <button
            type="submit"
            class="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Request OTP
          </button>
        </div>
      </form>
      
      <p class="mt-4 text-center text-sm/6 text-red-600">{{ result }}</p>
    </div>
  </div>
</template>