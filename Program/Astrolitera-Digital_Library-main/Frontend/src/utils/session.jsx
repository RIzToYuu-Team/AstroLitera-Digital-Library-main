const SESSION_KEY = "sessionUser";

export function getSessionUser() {
  return JSON.parse(localStorage.getItem(SESSION_KEY));
}

export function setSessionUser(user) {
  localStorage.setItem(
    SESSION_KEY,
    JSON.stringify(user)
  );

  window.dispatchEvent(
    new Event("session-changed")
  );
}

export function clearSessionUser() {
  localStorage.removeItem(SESSION_KEY);

  window.dispatchEvent(
    new Event("session-changed")
  );
}