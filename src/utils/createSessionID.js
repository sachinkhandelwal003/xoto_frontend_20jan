const SESSION_KEY = "xoto_chat_session";
const SESSION_TTL = 30 * 60 * 1000; // 30 minutes

// Generate UUID v4
function generateSessionId() {
  return "xoto_guest_" + crypto.randomUUID();
}

// Create & store new session
function createNewSession() {
  const newSession = {
    sessionId: generateSessionId(),
    createdAt: Date.now(),
    expiresAt: Date.now() + SESSION_TTL
  };

  localStorage.setItem(SESSION_KEY, JSON.stringify(newSession));
  return newSession.sessionId;
}

export function getChatSessionId() {
  const stored = localStorage.getItem(SESSION_KEY);

  if (stored) {
    try {
      const parsed = JSON.parse(stored);


      if (Date.now() > parsed.expiresAt) {
        localStorage.removeItem(SESSION_KEY);
        return createNewSession();
      }

      if (parsed.sessionId) {
        return parsed.sessionId;
      }
    } catch (err) {
      // Corrupted data → regenerate
      localStorage.removeItem(SESSION_KEY);
      return createNewSession();
    }
  }


  return createNewSession();
}


export function resetChatSession() {
  localStorage.removeItem(SESSION_KEY);
}
