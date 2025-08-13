<script setup lang="ts">
import { ref } from "vue";
import { verifyOtp } from "../services/auth";

const email = ref("");
const otpCode = ref("");
const result = ref<string>("");

async function handleVerify() {
  // Frontend validation
  const missingFields = [];
  if (!email.value) missingFields.push("Email");
  if (!otpCode.value) missingFields.push("OTP code");

  if (missingFields.length) {
    result.value = `${missingFields.join(", ")} required`;
    return;
  }

  try {
    const res = await verifyOtp(email.value, otpCode.value);

    if (res.success) {
      result.value = res.message || "Verification successful";
    } else if (res.errors) {
      // Combine all field-level errors into a readable string
      result.value = Object.values(res.errors).join(", ");
    } else {
      result.value = res.message || "Verification failed";
    }

  } catch (err: any) {
    // If API returns raw JSON string, try to parse it
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
  <div class="p-6 max-w-md mx-auto">
    <input
      v-model="email"
      placeholder="Enter email"
      class="border p-2 rounded w-full mb-4"
    />
    <input
      v-model="otpCode"
      placeholder="Enter OTP"
      class="border p-2 rounded w-full mb-4"
    />
    <button
      @click="handleVerify"
      class="bg-blue-500 text-white px-4 py-2 rounded"
    >
      Verify OTP
    </button>
    <p class="mt-4 text-red-600">{{ result }}</p>
  </div>
</template>
