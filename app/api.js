import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

export const API_BASE_URL =
  // process.env.EXPO_PUBLIC_API_URL || "https://veeturusi.qtechx.com/api"; 
  process.env.EXPO_PUBLIC_API_URL || "http://192.168.1.4:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

const MAX_RETRIES = 1;
let cachedToken = null;

export function clearTokenCache() {
  cachedToken = null;
}

export async function setAuthToken(token) {
  if (token) {
    cachedToken = token;
    await AsyncStorage.setItem("userToken", token);
  } else {
    cachedToken = null;
    await AsyncStorage.removeItem("userToken");
  }
}

export async function getStoredToken() {
  const storageToken = await AsyncStorage.getItem("userToken");
  return storageToken || cachedToken || null;
}

function getNestedValue(obj, ...keys) {
  for (const key of keys) {
    if (!key) continue;
    const value = obj?.[key];
    if (value !== undefined && value !== null && value !== "") {
      return value;
    }
  }
  return undefined;
}

export function normalizeProfileData(profile) {
  if (!profile || typeof profile !== "object") {
    return {};
  }

  const normalized = { ...profile };

  const firstName = getNestedValue(
    profile,
    "first_name",
    "firstName",
    "firstname",
    "given_name",
    "givenName",
  );
  const lastName = getNestedValue(
    profile,
    "last_name",
    "lastName",
    "lastname",
    "family_name",
    "familyName",
  );
  const fullName = getNestedValue(
    profile,
    "full_name",
    "fullName",
    "display_name",
    "displayName",
    "name",
  );

  normalized.name =
    normalized.name ||
    [firstName, lastName].filter(Boolean).join(" ").trim() ||
    fullName ||
    "";

  normalized.email =
    normalized.email ||
    getNestedValue(profile, "email", "email_address", "emailAddress") ||
    "";

  normalized.mobile =
    normalized.mobile ||
    getNestedValue(
      profile,
      "mobile",
      "mobile_number",
      "mobileNumber",
      "phone",
      "phone_number",
      "phoneNumber",
      "contact_number",
      "contactNumber",
      "mobileNo",
      "phoneNo",
    ) ||
    "";

  normalized.phone =
    normalized.phone || normalized.mobile || normalized.phone_number || "";

  normalized.whatsapp_number =
    normalized.whatsapp_number ||
    getNestedValue(
      profile,
      "whatsapp_number",
      "whatsappNumber",
      "whatsapp_no",
      "whatsappNo",
      "whatsapp",
    ) ||
    "";

  normalized.alt_mobile =
    normalized.alt_mobile ||
    getNestedValue(
      profile,
      "alt_mobile",
      "alternate_mobile",
      "alternateMobile",
      "alternate_phone",
      "alternatePhone",
    ) ||
    "";

  normalized.gender =
    normalized.gender || getNestedValue(profile, "gender", "sex") || "";
  normalized.date_of_birth =
    normalized.date_of_birth ||
    getNestedValue(profile, "date_of_birth", "dob", "birth_date", "birthDate") ||
    "";
  normalized.age =
    normalized.age ?? getNestedValue(profile, "age", "age_years", "ageYears");
  normalized.blood_group =
    normalized.blood_group ||
    getNestedValue(profile, "blood_group", "bloodGroup", "blood_group_name") ||
    "";
  normalized.marital_status =
    normalized.marital_status ||
    getNestedValue(profile, "marital_status", "maritalStatus") ||
    "";
  normalized.father_husband_name =
    normalized.father_husband_name ||
    getNestedValue(
      profile,
      "father_husband_name",
      "father_husband",
      "guardian_name",
      "guardianName",
      "father_name",
      "fatherName",
      "husband_name",
      "husbandName",
    ) ||
    "";

  normalized.door_number =
    normalized.door_number ||
    getNestedValue(
      profile,
      "door_number",
      "doorNo",
      "door_no",
      "house_number",
      "houseNumber",
      "house_no",
      "address_line_1",
    ) ||
    "";
  normalized.street_name =
    normalized.street_name ||
    getNestedValue(profile, "street_name", "streetName", "street") || "";
  normalized.area_name =
    normalized.area_name ||
    getNestedValue(profile, "area_name", "areaName", "area") || "";
  normalized.landmark =
    normalized.landmark || getNestedValue(profile, "landmark") || "";
  normalized.city = normalized.city || getNestedValue(profile, "city") || "";
  normalized.district =
    normalized.district || getNestedValue(profile, "district") || "";
  normalized.state = normalized.state || getNestedValue(profile, "state") || "";
  normalized.pincode =
    normalized.pincode || getNestedValue(profile, "pincode", "postal_code") || "";
  normalized.country =
    normalized.country || getNestedValue(profile, "country") || "";
  normalized.current_address =
    normalized.current_address ||
    getNestedValue(profile, "current_address", "currentAddress") ||
    "";
  normalized.permanent_address =
    normalized.permanent_address ||
    getNestedValue(profile, "permanent_address", "permanentAddress") ||
    "";

  normalized.delivery_partner_code =
    normalized.delivery_partner_code ||
    getNestedValue(profile, "delivery_partner_code", "partner_code", "partnerCode") ||
    "";
  normalized.account_status =
    normalized.account_status ||
    getNestedValue(profile, "account_status", "accountStatus") ||
    "";
  normalized.login_status =
    normalized.login_status ||
    getNestedValue(profile, "login_status", "loginStatus") ||
    "";

  normalized.emergency_contact_name =
    normalized.emergency_contact_name ||
    getNestedValue(
      profile,
      "emergency_contact_name",
      "emergencyName",
      "emergency_contact",
      "emergencyContactName",
    ) ||
    "";
  normalized.emergency_contact_relationship =
    normalized.emergency_contact_relationship ||
    getNestedValue(
      profile,
      "emergency_contact_relationship",
      "emergencyRelationship",
      "emergency_contact_relation",
    ) ||
    "";
  normalized.emergency_contact_mobile =
    normalized.emergency_contact_mobile ||
    getNestedValue(
      profile,
      "emergency_contact_mobile",
      "emergencyMobile",
      "emergency_contact_number",
      "emergencyContactNumber",
    ) ||
    "";

  normalized.vehicle_brand =
    normalized.vehicle_brand ||
    getNestedValue(profile, "vehicle_brand", "vehicleBrand", "brand") ||
    "";
  normalized.vehicle_model =
    normalized.vehicle_model ||
    getNestedValue(profile, "vehicle_model", "vehicleModel", "model") ||
    "";
  normalized.vehicle_number =
    normalized.vehicle_number ||
    getNestedValue(profile, "vehicle_number", "vehicleNumber") ||
    "";
  normalized.vehicle_color =
    normalized.vehicle_color ||
    getNestedValue(profile, "vehicle_color", "vehicleColor", "color") ||
    "";

  normalized.license_number =
    normalized.license_number ||
    getNestedValue(profile, "license_number", "licenseNumber") ||
    "";
  normalized.license_holder_name =
    normalized.license_holder_name ||
    getNestedValue(profile, "license_holder_name", "licenseHolderName") ||
    "";
  normalized.license_issue_date =
    normalized.license_issue_date ||
    getNestedValue(profile, "license_issue_date", "licenseIssueDate") ||
    "";
  normalized.license_expiry_date =
    normalized.license_expiry_date ||
    getNestedValue(profile, "license_expiry_date", "licenseExpiryDate") ||
    "";

  normalized.rc_book_number =
    normalized.rc_book_number ||
    getNestedValue(profile, "rc_book_number", "rcBookNumber") ||
    "";
  normalized.insurance_number =
    normalized.insurance_number ||
    getNestedValue(profile, "insurance_number", "insuranceNumber") ||
    "";
  normalized.insurance_expiry_date =
    normalized.insurance_expiry_date ||
    getNestedValue(profile, "insurance_expiry_date", "insuranceExpiryDate") ||
    "";
  normalized.pollution_certificate_number =
    normalized.pollution_certificate_number ||
    getNestedValue(
      profile,
      "pollution_certificate_number",
      "pollutionCertificateNumber",
    ) ||
    "";

  normalized.preferred_distance =
    normalized.preferred_distance ||
    getNestedValue(profile, "preferred_distance", "preferredDistance") ||
    "";
  normalized.delivery_radius =
    normalized.delivery_radius ||
    getNestedValue(profile, "delivery_radius", "deliveryRadius") ||
    "";
  normalized.driving_experience =
    normalized.driving_experience ||
    getNestedValue(profile, "driving_experience", "drivingExperience") ||
    "";
  normalized.available_areas =
    normalized.available_areas ||
    getNestedValue(profile, "available_areas", "availableAreas") ||
    "";
  normalized.online_status =
    normalized.online_status ||
    getNestedValue(profile, "online_status", "onlineStatus") ||
    "";
  normalized.current_location =
    normalized.current_location ||
    getNestedValue(profile, "current_location", "currentLocation") ||
    "";
  normalized.shift_timing =
    normalized.shift_timing ||
    getNestedValue(profile, "shift_timing", "shiftTiming") ||
    "";
  normalized.working_days =
    normalized.working_days ||
    getNestedValue(profile, "working_days", "workingDays") ||
    "";

  normalized.wallet_balance =
    normalized.wallet_balance ??
    getNestedValue(profile, "wallet_balance", "walletBalance", "balance") ??
    0;
  normalized.account_holder_name =
    normalized.account_holder_name ||
    getNestedValue(
      profile,
      "account_holder_name",
      "accountHolderName",
      "account_name",
      "accountName",
    ) ||
    "";
  normalized.bank_account_number =
    normalized.bank_account_number ||
    getNestedValue(
      profile,
      "bank_account_number",
      "bankAccountNumber",
      "account_number",
      "accountNumber",
    ) ||
    "";
  normalized.bank_name =
    normalized.bank_name ||
    getNestedValue(profile, "bank_name", "bankName", "bank") ||
    "";
  normalized.ifsc_code =
    normalized.ifsc_code ||
    getNestedValue(profile, "ifsc_code", "ifscCode", "ifsc") ||
    "";
  normalized.branch_name =
    normalized.branch_name ||
    getNestedValue(profile, "branch_name", "branchName") ||
    "";
  normalized.upi_id =
    normalized.upi_id || getNestedValue(profile, "upi_id", "upiId") || "";

  normalized.kyc_verification_status =
    normalized.kyc_verification_status ||
    getNestedValue(
      profile,
      "kyc_verification_status",
      "kycVerificationStatus",
      "kyc_status",
      "kycStatus",
    ) ||
    "Pending";
  normalized.background_verification_status =
    normalized.background_verification_status ||
    getNestedValue(
      profile,
      "background_verification_status",
      "backgroundVerificationStatus",
      "background_status",
      "backgroundStatus",
    ) ||
    "Pending";

  normalized.aadhaar_number =
    normalized.aadhaar_number ||
    getNestedValue(profile, "aadhaar_number", "aadhaarNumber") ||
    "";
  normalized.pan_number =
    normalized.pan_number || getNestedValue(profile, "pan_number", "panNumber") || "";

  return normalized;
}

export async function getStoredUser() {
  const storedUser = await AsyncStorage.getItem("userProfile");
  return storedUser ? normalizeProfileData(JSON.parse(storedUser)) : null;
}

export async function getProfileData() {
  const [profileResult, referralResult, partnerResult] = await Promise.all([
    api.get("/auth/profile"),
    api.get("/referrals/dashboard").catch(() => ({ data: {} })),
    api.get("/delivery/profile").catch(() => ({ data: null })),
  ]);

  const profile = normalizeProfileData(
    profileResult.data?.user || profileResult.data || {},
  );
  const referral = referralResult.data || {};
  const partner = partnerResult.data || null;

  await AsyncStorage.setItem("userProfile", JSON.stringify(profile));

  return { profile, referral, partner };
}

export async function updateUserProfile(profile) {
  const normalizedProfile = normalizeProfileData(profile);
  const response = await api.put("/auth/profile", normalizedProfile);
  const updatedUser = normalizeProfileData(
    response.data?.user || response.data || {},
  );

  if (updatedUser) {
    await AsyncStorage.setItem("userProfile", JSON.stringify(updatedUser));
  }

  return response.data;
}

export async function changeUserPassword(currentPassword, newPassword) {
  const response = await api.put("/auth/profile/password", {
    currentPassword,
    newPassword,
  });
  return response.data;
}

api.interceptors.request.use(async (config) => {
  const activeToken = await getStoredToken();

  if (activeToken) {
    cachedToken = activeToken;
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${activeToken}`;
  } else {
    delete config.headers?.Authorization;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const retryCount = originalRequest?._retryCount || 0;
    const isNetworkError =
      !error.response && (error.code || error.message === "Network Error");

    if (isNetworkError && originalRequest && retryCount < MAX_RETRIES) {
      originalRequest._retryCount = retryCount + 1;
      return api(originalRequest);
    }

    if (error.response) {
      const message =
        error.response.data?.message ||
        error.response.data?.error ||
        "Server error";

      return Promise.reject({
        status: error.response.status,
        message,
        data: error.response.data,
      });
    }

    return Promise.reject({
      status: "network_error",
      message: `Network connection failed. Check that ${API_BASE_URL} is reachable.`,
    });
  },
);

export async function loginWithIdentifier(identifier, password) {
  const response = await api.post("/auth/login", {
    identifier: String(identifier || "").trim(),
    password: String(password || ""),
  });

  const { token, accessToken, access_token, user, message } =
    response.data || {};
  const authToken = token || accessToken || access_token;

  if (authToken) {
    await setAuthToken(authToken);
  }

  if (user) {
    await AsyncStorage.setItem("userProfile", JSON.stringify(user));
  }

  return {
    ...response.data,
    token: authToken,
    message: message || "Login successful",
  };
}

export async function getMyOrders(status = "All") {
  const query =
    status && status !== "All" ? `?status=${encodeURIComponent(status)}` : "";
  const response = await api.get(`/delivery/orders${query}`);
  return response.data;
}

export async function updateOrderStatus(orderId, status) {
  const response = await api.patch(`/delivery/orders/${orderId}/status`, {
    status,
  });
  return response.data;
}

export async function getAvailableOrders() {
  try {
    const response = await api.get("/delivery/orders/available");
    return response.data;
  } catch (error) {
    console.error("=== GET AVAILABLE ORDERS ERROR ===");
    console.error("Endpoint:", "/delivery/orders/available");
    console.error("Base URL:", API_BASE_URL);
    console.error("Status Code:", error.status);
    console.error("Error Message:", error.message);
    console.error("Full Error:", JSON.stringify(error, null, 2));
    console.error("==================================");
    throw error;
  }
}

export async function assignOrder(orderId, payload) {
  const response = await api.patch(
    `/delivery/orders/${orderId}/assign`,
    payload,
  );
  return response.data;
}

export async function cancelOrder(orderId, reason, notes) {
  const response = await api.post(`/user-food-orders/cancel/${orderId}`, {
    cancellation_reason: reason,
    cancellation_notes: notes,
  });
  return response.data;
}

export async function logoutUser() {
  await AsyncStorage.multiRemove(["userToken", "userProfile"]);
  clearTokenCache();
}

export default api;
