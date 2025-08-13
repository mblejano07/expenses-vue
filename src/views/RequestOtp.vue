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
  <div class="p-6 max-w-md mx-auto mt-10">
    <h2 class="text-xl font-semibold mb-4">Request OTP</h2>
    <input
      v-model="email"
      type="email"
      placeholder="Enter your email"
      class="border p-2 rounded w-full mb-4"
    />
    <button
      @click="handleRequestOtp"
      class="bg-blue-500 text-white px-4 py-2 rounded w-full"
    >
      Request OTP
    </button>
    <p class="mt-4 text-red-600">{{ result }}</p>
  </div>
</template>
