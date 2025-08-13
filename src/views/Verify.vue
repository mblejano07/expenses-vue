<script setup lang="ts">
import { ref, onMounted } from "vue";
import { verifyOtp } from "../services/auth";
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();
const email = ref("");
const otpCode = ref("");
const result = ref<string>("");

onMounted(() => {
  // Catch the email from the URL query parameter and set it to the ref
  if (route.query.email) {
    email.value = route.query.email as string;
  }
});

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
      // Redirect to a success page or login page after successful verification
      // router.push({ name: 'Success' });
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
  <div class="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-sm">
      <img class="mx-auto h-10 w-auto" src="/images/blackpearl.png" alt="Blackpearl" />
      <h2 class="mt-10 text-center text-2xl/9 font-bold tracking-tight text-gray-900">Verify OTP</h2>
    </div>

    <div class="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
      <form class="space-y-6" @submit.prevent="handleVerify">
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
              readonly
              class="block w-full rounded-md border-0 bg-gray-100 px-3 py-1.5 text-base text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm/6 sm:leading-6"
            />
          </div>
        </div>

        <div>
          <div class="flex items-center justify-between">
            <label for="otp" class="block text-sm/6 font-medium text-gray-900">OTP Code</label>
          </div>
          <div class="mt-2">
            <input
              v-model="otpCode"
              type="text"
              name="otp"
              id="otp"
              autocomplete="one-time-code"
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
            Verify OTP
          </button>
        </div>
      </form>

      <p class="mt-4 text-center text-sm/6 text-red-600">{{ result }}</p>
    </div>
  </div>
</template>