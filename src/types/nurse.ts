export interface Nurse {
  nurse_id: number;
  created_at: string;
  first_name: string;
  last_name: string;
  gender: string;
  date_of_birth: string;
  address: string;
  city: string;
  taluk: string;
  state: string;
  pin_code: number;
  phone_number: string;
  languages: string[];
  noc_status: string;
  service_type: string;
  shift_pattern: string;
  category: string;
  experience: number;
  marital_status: string;
  religion: string;
  mother_tongue: string;
  email: string;
  status: string;
  nurse_reg_no: string;
  admitted_type: string;
  nurse_prev_reg_no: string | null;
  joining_date: string | null;
  salary_per_month: number | null;
  full_name: string;
}

export interface Client {
  id: string;
  client_type: string;
  client_category: string;
  status: string;
  general_notes: string;
  created_at: string;
  updated_at: string;
  rejection_reason: string | null;
  otp_preference: string | null;
  duty_period: string;
  duty_period_reason: string;
  registration_number: string;
  prev_registration_number: string | null;
}

export interface NursesResponse {
  message: string;
  data: Nurse[];
}

export interface ClientsResponse {
  message: string;
  data: Client[];
}
