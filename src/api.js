/**
 * Public API helpers for contact, quote, and consultation submissions.
 * Uses VITE_API_URL in production if set; otherwise same-origin (dev proxy).
 */
const getBaseUrl = () => {
  const env = typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_API_URL;
  return env ? String(env).replace(/\/$/, "") : "";
};

/**
 * Submit Contact Us form (public).
 * @param {{ fullName: string, email: string, phone?: string, serviceType?: string, message: string }} body
 * @returns {Promise<{ success: boolean, message?: string, data?: { id: string } }>}
 */
export async function postContact(body) {
  const base = getBaseUrl();
  const res = await fetch(`${base}/api/contact`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) {
    const err = new Error(data.message || "Failed to send message");
    err.response = res;
    err.data = data;
    throw err;
  }
  return data;
}

/**
 * Submit Get Quotation form (public).
 * @param {{ projectType: string, location: string, scaleOfOperation: string, expectedOutcomes: string, service?: string }} body
 * @returns {Promise<{ success: boolean, message?: string, data?: { id: string } }>}
 */
export async function postQuote(body) {
  const base = getBaseUrl();
  const res = await fetch(`${base}/api/quote`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) {
    const err = new Error(data.message || "Failed to submit quote request");
    err.response = res;
    err.data = data;
    throw err;
  }
  return data;
}

/**
 * Submit Book Consultation form (public).
 * @param {{ fullName: string, email: string, phone: string, consultationType: string, preferredDate?: string, preferredTime?: string, message?: string }} body
 * @returns {Promise<{ success: boolean, message?: string, data?: { id: string } }>}
 */
export async function postConsultation(body) {
  const base = getBaseUrl();
  const res = await fetch(`${base}/api/consultation`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) {
    const err = new Error(data.message || "Failed to book consultation");
    err.response = res;
    err.data = data;
    throw err;
  }
  return data;
}

/**
 * Submit a service request from a service card (public).
 * @param {{ serviceId: string, fullName: string, email: string, phone: string, message?: string }} body
 * @returns {Promise<{ success: boolean, message?: string, data?: { id: string } }>}
 */
export async function postServiceRequest(body) {
  const base = getBaseUrl();
  const res = await fetch(`${base}/api/service-request`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) {
    const err = new Error(data.message || "Failed to submit service request");
    err.response = res;
    err.data = data;
    throw err;
  }
  return data;
}

/**
 * Subscribe to newsletter (public).
 * @param {{ email: string, source?: string }} body
 * @returns {Promise<{ success: boolean, message?: string, data?: { id: string } }>}
 */
export async function postNewsletter(body) {
  const base = getBaseUrl();
  const res = await fetch(`${base}/api/newsletter`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) {
    const err = new Error(data.message || "Failed to subscribe");
    err.response = res;
    err.data = data;
    throw err;
  }
  return data;
}

function getMarketplaceAuthHeaders() {
  const token = typeof localStorage !== "undefined" ? localStorage.getItem("marketplace_token") : null;
  const headers = { "Content-Type": "application/json", Accept: "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

/**
 * Register marketplace user (minimal: email, phone, password, fullName, termsAccepted, privacyAccepted).
 */
export async function registerMarketplaceUser(body) {
  const base = getBaseUrl();
  const res = await fetch(`${base}/api/marketplace/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) {
    const err = new Error(data.message || "Registration failed");
    err.response = res;
    err.data = data;
    throw err;
  }
  return data;
}

/**
 * Parent/student login for the public school site (same `users` table as admin).
 * POST /api/users/login with portal restriction on the server.
 */
export async function loginMarketplaceUser(body) {
  const base = getBaseUrl();
  const res = await fetch(`${base}/api/users/login`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      email: body.email,
      password: body.password,
      portal: "public",
    }),
  });
  const data = await res.json();
  if (!res.ok) {
    const err = new Error(data.message || "Login failed");
    err.response = res;
    err.data = data;
    throw err;
  }
  return data;
}

/** Absolute URL for profile images when API is on another origin (`VITE_API_URL`). */
export function schoolPortalMediaUrl(path) {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  const base = getBaseUrl();
  const p = path.startsWith("/") ? path : `/${path}`;
  return base ? `${base}${p}` : p;
}

export async function fetchSchoolPortalUser() {
  const base = getBaseUrl();
  const res = await fetch(`${base}/api/users/me`, {
    headers: getMarketplaceAuthHeaders(),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Session expired. Please sign in again.");
  return data.data;
}

export async function fetchSchoolPortalParentProfile() {
  const base = getBaseUrl();
  const res = await fetch(`${base}/api/parents/me`, {
    headers: getMarketplaceAuthHeaders(),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Could not load parent profile.");
  return data.data;
}

export async function fetchSchoolPortalStudentProfile() {
  const base = getBaseUrl();
  const res = await fetch(`${base}/api/students/me`, {
    headers: getMarketplaceAuthHeaders(),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Could not load student profile.");
  return data.data;
}

export function clearSchoolPortalSession() {
  if (typeof localStorage === "undefined") return;
  localStorage.removeItem("marketplace_token");
  localStorage.removeItem("marketplace_user");
  localStorage.removeItem("portal_login_role");
}

/**
 * Get current marketplace user + profile (requires token).
 */
export async function getMarketplaceMe() {
  const base = getBaseUrl();
  const res = await fetch(`${base}/api/marketplace/me`, {
    method: "GET",
    headers: getMarketplaceAuthHeaders(),
  });
  const data = await res.json();
  if (!res.ok) {
    const err = new Error(data.message || "Failed to fetch profile");
    err.response = res;
    err.data = data;
    throw err;
  }
  return data;
}

/**
 * Upload marketplace profile photo. Returns { profilePhotoUrl }. Requires token.
 * @param {File} file - Image file (e.g. from input type="file")
 */
export async function uploadMarketplaceProfilePhoto(file) {
  const base = getBaseUrl();
  const token = typeof localStorage !== "undefined" ? localStorage.getItem("marketplace_token") : null;
  const formData = new FormData();
  formData.append("profile_photo", file);
  const res = await fetch(`${base}/api/marketplace/upload-photo`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });
  const data = await res.json();
  if (!res.ok) {
    const err = new Error(data.message || "Failed to upload profile photo");
    err.response = res;
    err.data = data;
    throw err;
  }
  return data;
}

/**
 * Complete marketplace profile (role + common + role-specific). Requires token.
 */
export async function completeMarketplaceProfile(body) {
  const base = getBaseUrl();
  const res = await fetch(`${base}/api/marketplace/complete`, {
    method: "PUT",
    headers: getMarketplaceAuthHeaders(),
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) {
    const err = new Error(data.message || "Failed to complete profile");
    err.response = res;
    err.data = data;
    throw err;
  }
  return data;
}

/**
 * Apply for a grant (requires marketplace auth).
 * Sends POST /api/grant-applications with body: { grantId, applicationData }.
 * @param {string} grantId - ID of the grant
 * @param {object} [applicationData] - Optional application form data (default {})
 * @returns {Promise<{ success: boolean, message?: string, data?: object }>}
 */
export async function applyForGrant(grantId, applicationData = {}) {
  const base = getBaseUrl();
  const res = await fetch(`${base}/api/grant-applications`, {
    method: "POST",
    headers: getMarketplaceAuthHeaders(),
    body: JSON.stringify({ grantId, applicationData }),
  });
  const data = await res.json();
  if (!res.ok) {
    const err = new Error(data.message || "Application failed");
    err.response = res;
    err.data = data;
    throw err;
  }
  return data;
}

/**
 * Register for a training event (requires marketplace auth).
 * Sends POST /api/training-registrations with body: { trainingEventId }.
 * @param {string} trainingEventId - ID of the training event
 * @returns {Promise<{ success: boolean, message?: string, data?: object }>}
 */
export async function registerForTrainingEvent(trainingEventId) {
  const base = getBaseUrl();
  const res = await fetch(`${base}/api/training-registrations`, {
    method: "POST",
    headers: getMarketplaceAuthHeaders(),
    body: JSON.stringify({ trainingEventId }),
  });
  const data = await res.json();
  if (!res.ok) {
    const err = new Error(data.message || "Registration failed");
    err.response = res;
    err.data = data;
    throw err;
  }
  return data;
}

// ——— Marketplace Listings ———

/**
 * Get current user's listings (requires marketplace auth).
 */
export async function getMyListings() {
  const base = getBaseUrl();
  const res = await fetch(`${base}/api/marketplace/listings/my`, {
    headers: getMarketplaceAuthHeaders(),
  });
  const data = await res.json();
  if (!res.ok) {
    const err = new Error(data.message || "Failed to fetch your listings");
    err.response = res;
    err.data = data;
    throw err;
  }
  return data;
}

/**
 * Get public (approved) listings. No auth required.
 */
export async function getPublicListings() {
  const base = getBaseUrl();
  const res = await fetch(`${base}/api/marketplace/listings/public`);
  const data = await res.json();
  if (!res.ok) {
    const err = new Error(data.message || "Failed to fetch listings");
    err.response = res;
    err.data = data;
    throw err;
  }
  return data;
}

/**
 * Get a single listing by id (optional auth for owner visibility).
 */
export async function getListingById(id) {
  const base = getBaseUrl();
  const res = await fetch(`${base}/api/marketplace/listings/${id}`, {
    headers: getMarketplaceAuthHeaders(),
  });
  const data = await res.json();
  if (!res.ok) {
    const err = new Error(data.message || "Failed to fetch listing");
    err.response = res;
    err.data = data;
    throw err;
  }
  return data;
}

/**
 * Create a new listing (requires marketplace auth). Use formData when uploading an image file.
 * @param {FormData|{ title: string, description?: string, category?: string, price?: number, priceUnit?: string, quantity?: number, quantityUnit?: string, location?: string }} bodyOrFormData - FormData (with listing_image file) or JSON body
 */
export async function createListing(bodyOrFormData) {
  const base = getBaseUrl();
  const isFormData = bodyOrFormData instanceof FormData;
  const headers = { Accept: "application/json" };
  if (typeof localStorage !== "undefined" && localStorage.getItem("marketplace_token")) {
    headers.Authorization = `Bearer ${localStorage.getItem("marketplace_token")}`;
  }
  if (!isFormData) headers["Content-Type"] = "application/json";
  const res = await fetch(`${base}/api/marketplace/listings`, {
    method: "POST",
    headers,
    body: isFormData ? bodyOrFormData : JSON.stringify(bodyOrFormData),
  });
  const data = await res.json();
  if (!res.ok) {
    const err = new Error(data.message || "Failed to create listing");
    err.response = res;
    err.data = data;
    throw err;
  }
  return data;
}

/**
 * Update a listing (requires marketplace auth, owner only). Use formData when uploading an image file.
 * @param {string} id - Listing ID
 * @param {FormData|{ title?: string, description?: string, category?: string, price?: number, priceUnit?: string, quantity?: number, quantityUnit?: string, location?: string, delete_image?: string }} bodyOrFormData - FormData (with listing_image file) or JSON body
 */
export async function updateListing(id, bodyOrFormData) {
  const base = getBaseUrl();
  const isFormData = bodyOrFormData instanceof FormData;
  const headers = { Accept: "application/json" };
  if (typeof localStorage !== "undefined" && localStorage.getItem("marketplace_token")) {
    headers.Authorization = `Bearer ${localStorage.getItem("marketplace_token")}`;
  }
  if (!isFormData) headers["Content-Type"] = "application/json";
  const res = await fetch(`${base}/api/marketplace/listings/${id}`, {
    method: "PATCH",
    headers,
    body: isFormData ? bodyOrFormData : JSON.stringify(bodyOrFormData),
  });
  const data = await res.json();
  if (!res.ok) {
    const err = new Error(data.message || "Failed to update listing");
    err.response = res;
    err.data = data;
    throw err;
  }
  return data;
}

/**
 * Delete a listing (requires marketplace auth, owner only).
 */
export async function deleteListing(id) {
  const base = getBaseUrl();
  const res = await fetch(`${base}/api/marketplace/listings/${id}`, {
    method: "DELETE",
    headers: getMarketplaceAuthHeaders(),
  });
  const data = await res.json();
  if (!res.ok) {
    const err = new Error(data.message || "Failed to delete listing");
    err.response = res;
    err.data = data;
    throw err;
  }
  return data;
}
