import { apiFetch } from "./api";

// --------------------- Verify OTP ---------------------
export interface VerifyOTPResponse {
  success: boolean;
  message?: string;
  errors?: Record<string, string>;
}

export async function verifyOtp(email: string, otp_code: string): Promise<VerifyOTPResponse> {
  try {
    const res = await apiFetch<VerifyOTPResponse>("/auth/verify_otp", {
      method: "POST",
      body: JSON.stringify({ email, otp_code }),
    });

    return {
      success: res.success ?? false,
      message: res.message,
      errors: res.errors,
    };
  } catch (err: any) {
    return {
      success: false,
      message: err.message || "Network error",
      errors: undefined,
    };
  }
}

// --------------------- Request OTP ---------------------
export interface RequestOTPResponse {
  success: boolean;
  message?: string;
  errors?: Record<string, string>;
}

export async function requestOtp(email: string): Promise<RequestOTPResponse> {
  if (!email) {
    return { success: false, message: "Email is required", errors: { email: "Required" } };
  }

  try {
    const res = await apiFetch<RequestOTPResponse>("/auth/request_otp", {
      method: "POST",
      body: JSON.stringify({ email }),
    });

    return {
      success: res.success ?? false,
      message: res.message,
      errors: res.errors,
    };
  } catch (err: any) {
    return {
      success: false,
      message: err.message || "Network error",
      errors: undefined,
    };
  }
}
