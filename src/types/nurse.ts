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
  client_id: string;
  requestor_name: string;
  requestor_phone: string;
  requestor_email: string;
  relation_to_patient: string;
  patient_name: string;
  patient_age: string;
  patient_gender: string | null;
  patient_phone: string | null;
  complete_address: string | null;
  service_required: string;
  care_duration: string;
  start_date: string;
  preferred_caregiver_gender: string;
  requestor_profile_pic: string | null;
  patient_profile_pic: string | null;
  patient_address: string;
  patient_pincode: string;
  patient_district: string;
  patient_city: string;
  requestor_address: string;
  requestor_job_details: string | null;
  requestor_emergency_phone: string | null;
  requestor_pincode: string;
  requestor_district: string;
  requestor_city: string;
  requestor_state: string;
  patient_state: string | null;
  patient_location_link: string | null;
  requestor_location_link: string | null;
  patient_dob: string | null;
  requestor_dob: string | null;
}

export interface NursesResponse {
  message: string;
  data: Nurse[];
}

export interface ClientsResponse {
  message: string;
  data: Client[];
}
