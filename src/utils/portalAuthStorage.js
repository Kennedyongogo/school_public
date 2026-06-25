/**
 * Portal auth: one stored session per user (localStorage), active tab session (sessionStorage).
 * Lets two students use the same browser in different tabs without overwriting each other's JWT.
 */

const AUTH_KEY_PREFIX = "portal_auth_v1_";
const ACTIVE_SESSION_KEY = "portal_active_auth_key";
const LEGACY_TOKEN = "marketplace_token";
const LEGACY_USER = "marketplace_user";
const LEGACY_ROLE = "portal_login_role";

function safeJsonParse(raw, fallback = null) {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

/** Stable storage id per account (user id preferred). */
export function portalSessionIdForUser(user) {
  if (!user) return "";
  const id = user.id != null ? String(user.id).trim() : "";
  if (id) return id;
  const email = user.email != null ? String(user.email).trim().toLowerCase() : "";
  if (email) return `email_${email.replace(/[^a-z0-9@._-]+/gi, "_")}`;
  const username = user.username != null ? String(user.username).trim().toLowerCase() : "";
  if (username) return `user_${username.replace(/[^a-z0-9._-]+/gi, "_")}`;
  return "";
}

function authStorageKey(sessionId) {
  return `${AUTH_KEY_PREFIX}${sessionId}`;
}

function displayLabelForUser(user) {
  if (!user) return "Portal user";
  const name = user.full_name != null ? String(user.full_name).trim() : "";
  if (name) return name;
  const email = user.email != null ? String(user.email).trim() : "";
  if (email) return email;
  const username = user.username != null ? String(user.username).trim() : "";
  return username || "Portal user";
}

function readSessionBlob(sessionId) {
  if (!sessionId || typeof localStorage === "undefined") return null;
  return safeJsonParse(localStorage.getItem(authStorageKey(sessionId)));
}

function writeSessionBlob(sessionId, blob) {
  if (!sessionId || typeof localStorage === "undefined") return;
  localStorage.setItem(authStorageKey(sessionId), JSON.stringify(blob));
}

function getActiveSessionId() {
  if (typeof sessionStorage === "undefined") return "";
  return String(sessionStorage.getItem(ACTIVE_SESSION_KEY) || "").trim();
}

function setActiveSessionId(sessionId) {
  if (typeof sessionStorage === "undefined") return;
  if (sessionId) sessionStorage.setItem(ACTIVE_SESSION_KEY, sessionId);
  else sessionStorage.removeItem(ACTIVE_SESSION_KEY);
}

function migrateLegacySessionIfNeeded() {
  if (typeof localStorage === "undefined") return;
  if (getActiveSessionId()) return;

  const legacyToken = localStorage.getItem(LEGACY_TOKEN);
  const legacyUser = safeJsonParse(localStorage.getItem(LEGACY_USER));
  if (!legacyToken || !legacyUser) return;

  const sessionId = portalSessionIdForUser(legacyUser);
  if (!sessionId) return;

  writeSessionBlob(sessionId, {
    token: legacyToken,
    user: legacyUser,
    portalLoginRole: localStorage.getItem(LEGACY_ROLE) || legacyUser.role || null,
    displayName: displayLabelForUser(legacyUser),
    updatedAt: new Date().toISOString(),
  });
  setActiveSessionId(sessionId);

  localStorage.removeItem(LEGACY_TOKEN);
  localStorage.removeItem(LEGACY_USER);
  localStorage.removeItem(LEGACY_ROLE);
}

/**
 * Save login for this user and bind it to the current browser tab.
 */
export function savePortalSession({ token, user, portalLoginRole = null }) {
  if (!token || !user || typeof localStorage === "undefined") return null;
  const sessionId = portalSessionIdForUser(user);
  if (!sessionId) return null;

  const blob = {
    token: String(token),
    user,
    portalLoginRole: portalLoginRole || user.role || null,
    displayName: displayLabelForUser(user),
    updatedAt: new Date().toISOString(),
  };
  writeSessionBlob(sessionId, blob);
  setActiveSessionId(sessionId);

  localStorage.removeItem(LEGACY_TOKEN);
  localStorage.removeItem(LEGACY_USER);
  localStorage.removeItem(LEGACY_ROLE);

  return sessionId;
}

export function getPortalActiveSessionId() {
  migrateLegacySessionIfNeeded();
  return getActiveSessionId();
}

export function getPortalAuthToken() {
  migrateLegacySessionIfNeeded();
  const sessionId = getActiveSessionId();
  if (!sessionId) return null;
  const blob = readSessionBlob(sessionId);
  return blob?.token ? String(blob.token) : null;
}

export function getPortalAuthUser() {
  migrateLegacySessionIfNeeded();
  const sessionId = getActiveSessionId();
  if (!sessionId) return null;
  return readSessionBlob(sessionId)?.user || null;
}

export function getPortalLoginRole() {
  migrateLegacySessionIfNeeded();
  const sessionId = getActiveSessionId();
  if (!sessionId) return null;
  const blob = readSessionBlob(sessionId);
  return blob?.portalLoginRole || blob?.user?.role || null;
}

export function hasPortalSession() {
  return !!getPortalAuthToken();
}

/** Update cached user profile for the active tab's session. */
export function updatePortalSessionUser(user) {
  const sessionId = getActiveSessionId();
  if (!sessionId || !user) return;
  const blob = readSessionBlob(sessionId);
  if (!blob) return;
  writeSessionBlob(sessionId, {
    ...blob,
    user,
    displayName: displayLabelForUser(user),
    updatedAt: new Date().toISOString(),
  });
}

/** Log out only the account in this tab (other tabs / saved accounts stay). */
export function clearSchoolPortalSession() {
  const sessionId = getActiveSessionId();
  if (sessionId && typeof localStorage !== "undefined") {
    localStorage.removeItem(authStorageKey(sessionId));
  }
  setActiveSessionId("");
  if (typeof localStorage !== "undefined") {
    localStorage.removeItem(LEGACY_TOKEN);
    localStorage.removeItem(LEGACY_USER);
    localStorage.removeItem(LEGACY_ROLE);
  }
}

/** List other saved portal accounts on this device (for debugging / future switcher). */
export function listSavedPortalSessions() {
  if (typeof localStorage === "undefined") return [];
  migrateLegacySessionIfNeeded();
  const active = getActiveSessionId();
  const out = [];
  for (let i = 0; i < localStorage.length; i += 1) {
    const key = localStorage.key(i);
    if (!key || !key.startsWith(AUTH_KEY_PREFIX)) continue;
    const sessionId = key.slice(AUTH_KEY_PREFIX.length);
    const blob = readSessionBlob(sessionId);
    if (!blob?.token) continue;
    out.push({
      sessionId,
      displayName: blob.displayName || displayLabelForUser(blob.user),
      role: blob.portalLoginRole || blob.user?.role,
      isActive: sessionId === active,
    });
  }
  return out;
}
