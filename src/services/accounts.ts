import { apiFetch } from "./api";

// This file contains the API interfaces and functions for handling account data.

/**
 * Interface for the response from the listAccounts API call.
 * @interface
 */
export interface ListAccountsResponse {
  success: boolean;
  message?: string;
  data?: string[];
  errors?: Record<string, string>;
}

/**
 * Function to fetch the list of all available accounts from the API.
 * The endpoint is expected to return an array of strings (account names).
 * @returns {Promise<ListAccountsResponse>} - The API response.
 */
export async function listAccounts(): Promise<ListAccountsResponse> {
  try {
    const res = await apiFetch<ListAccountsResponse>("/accounts", {
      method: "GET",
    });

    return {
      success: res.success ?? false,
      message: res.message,
      data: res.data,
      errors: res.errors,
    };
  } catch (err: any) {
    // Return a standardized error response on network or other issues
    return {
      success: false,
      message: err.message || "Network error",
      errors: undefined,
    };
  }
}
