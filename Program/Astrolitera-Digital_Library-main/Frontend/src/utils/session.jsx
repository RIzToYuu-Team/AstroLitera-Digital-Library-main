export function getSessionUser() {
  try {
    return JSON.parse(localStorage.getItem("sessionUser") || "null");
  } catch {
    return null;
  }
}

export function setSessionUser(user) {
  localStorage.setItem("sessionUser", JSON.stringify(user));
}

export function clearSessionUser() {
  localStorage.removeItem("sessionUser");
}