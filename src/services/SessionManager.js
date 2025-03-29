class SessionManager {
  static SESSION_KEY = 'user_session';
  static TOKEN_KEY = 'access_token';

  static setSession(userData, token) {
    // Session bilgilerini oluştur
    const session = {
      user: userData,
      token: token,
      timestamp: new Date().getTime(),
      expiresIn: 24 * 60 * 60 * 1000 // 24 saat
    };

    // Session'ı şifreleyerek sakla
    try {
      const sessionString = JSON.stringify(session);
      sessionStorage.setItem(this.SESSION_KEY, sessionString);
      localStorage.setItem(this.TOKEN_KEY, token);
    } catch (error) {
      console.error('Session storage error:', error);
    }
  }

  static getSession() {
    try {
      const sessionString = sessionStorage.getItem(this.SESSION_KEY);
      if (!sessionString) return null;

      const session = JSON.parse(sessionString);
      
      // Session süresini kontrol et
      const now = new Date().getTime();
      if (now - session.timestamp > session.expiresIn) {
        this.clearSession();
        return null;
      }

      return session;
    } catch (error) {
      console.error('Session retrieval error:', error);
      return null;
    }
  }

  static clearSession() {
    sessionStorage.removeItem(this.SESSION_KEY);
    localStorage.removeItem(this.TOKEN_KEY);
  }

  static isAuthenticated() {
    const session = this.getSession();
    return session !== null && session.token !== null;
  }

  static getToken() {
    const session = this.getSession();
    return session ? session.token : null;
  }

  static getUser() {
    const session = this.getSession();
    return session ? session.user : null;
  }

  static updateSession(updates) {
    const currentSession = this.getSession();
    if (currentSession) {
      const updatedSession = {
        ...currentSession,
        ...updates,
        timestamp: new Date().getTime()
      };
      sessionStorage.setItem(this.SESSION_KEY, JSON.stringify(updatedSession));
    }
  }
}

export default SessionManager; 