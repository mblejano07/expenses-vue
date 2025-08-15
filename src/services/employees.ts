import { apiFetch } from "./api";

// Define the interface for a single employee record
// Possible values for access_role include: "admin", "accounting_budget", "approver", "standard"
export interface Employee {
    employee_id: string;
    first_name: string;
    last_name: string;
    email: string;
    account_number: string;
    access_role: string[]; 
}

export interface ListEmployeesResponse {
    success: boolean;
    message?: string;
    data?: {
        employees: Employee[];
    };
    errors?: Record<string, string>;
}

// Function to fetch the list of all employees
export async function listEmployees(): Promise<ListEmployeesResponse> {
    try {
        const res = await apiFetch<ListEmployeesResponse>("/employees", {
            method: "GET",
        });

        return {
            success: res.success ?? false,
            message: res.message,
            data: res.data,
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
