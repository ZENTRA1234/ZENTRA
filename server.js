const express = require("express");
const session = require("express-session");
const bcrypt = require("bcryptjs");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const Database = require("better-sqlite3");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const { GoogleGenAI } = require("@google/genai");

require("dotenv").config({
  path: path.join(__dirname, ".env")
});

console.log("Gemini API anahtarı yüklendi:", Boolean(process.env.GEMINI_API_KEY));
console.log("ENV dosyası mevcut mu:", fs.existsSync(path.join(__dirname, ".env")));
console.log("Gemini API anahtarı uzunluğu:", process.env.GEMINI_API_KEY?.length || 0);
console.log("Çalışma klasörü:", __dirname);
console.log("ZENTRA TEST: BU DOSYA ÇALIŞIYOR");

const app = express();
const PORT = process.env.PORT || 3000;

// GEMINI AI BAĞLANTISI
const gemini = process.env.GEMINI_API_KEY
  ? new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY
    })
  : null;

const GEMINI_MODEL =
  process.env.GEMINI_MODEL || "gemini-3.5-flash-lite";

// ÖZEL VERİLER
const PRIVATE_DIR = path.join(__dirname, "..", "zentra-private");

fs.mkdirSync(PRIVATE_DIR, { recursive: true });

const db = new Database(
  path.join(PRIVATE_DIR, "zentra.db")
);

db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT NOT NULL COLLATE NOCASE UNIQUE,
    email TEXT NOT NULL COLLATE NOCASE UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS sessions (
    sid TEXT PRIMARY KEY,
    sess TEXT NOT NULL,
    expires_at INTEGER NOT NULL
  );
`);

// OTURUM GİZLİ ANAHTARI
function getSessionSecret() {
  if (process.env.SESSION_SECRET) {
    return process.env.SESSION_SECRET;
  }

  const secretFile = path.join(PRIVATE_DIR, "session-secret");

  if (fs.existsSync(secretFile)) {
    return fs.readFileSync(secretFile, "utf8").trim();
  }

  const secret = crypto.randomBytes(64).toString("hex");

  fs.writeFileSync(secretFile, secret);

  return secret;
}

// SQLITE OTURUM DEPOSU
class SQLiteSessionStore extends session.Store {
  constructor(database) {
    super();
    this.db = database;
  }

  get(sid, callback) {
    try {
      const row = this.db.prepare(
        "SELECT sess, expires_at FROM sessions WHERE sid = ?"
      ).get(sid);

      if (!row) return callback(null, null);

      if (row.expires_at <= Date.now()) {
        this.destroy(sid, () => callback(null, null));
        return;
      }

      callback(null, JSON.parse(row.sess));
    } catch (error) {
      callback(error);
    }
  }

  set(sid, sess, callback = () => {}) {
    try {
      const expiresAt = sess.cookie?.expires
        ? new Date(sess.cookie.expires).getTime()
        : Date.now() + 86400000;

      this.db.prepare(`
        INSERT INTO sessions (sid, sess, expires_at)
        VALUES (?, ?, ?)
        ON CONFLICT(sid) DO UPDATE SET
          sess = excluded.sess,
          expires_at = excluded.expires_at
      `).run(sid, JSON.stringify(sess), expiresAt);

      callback(null);
    } catch (error) {
      callback(error);
    }
  }

  destroy(sid, callback = () => {}) {
    try {
      this.db.prepare(
        "DELETE FROM sessions WHERE sid = ?"
      ).run(sid);

      callback(null);
    } catch (error) {
      callback(error);
    }
  }

  touch(sid, sess, callback = () => {}) {
    this.set(sid, sess, callback);
  }
}

app.disable("x-powered-by");

app.use(helmet({
  contentSecurityPolicy: false
}));

app.use(express.json({
  limit: "8mb"
}));

// GİZLİ DOSYALARI KORU
app.use((req, res, next) => {
  const blocked =
    /^\/(?:server\.js|package(?:-lock)?\.json|\.env|.*\.(?:db|sqlite|sqlite3))$/i;

  if (
    blocked.test(req.path) ||
    req.path.startsWith("/node_modules/")
  ) {
    return res.sendStatus(404);
  }

  next();
});

// OTURUM SİSTEMİ
app.use(session({
  name: "zentra.sid",
  secret: getSessionSecret(),
  store: new SQLiteSessionStore(db),
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 24 * 60 * 60 * 1000
  }
}));

// WEB SAYFALARI
app.use(express.static(__dirname, {
  index: false,
  dotfiles: "deny"
}));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// CSRF GÜVENLİĞİ
app.get("/api/csrf-token", (req, res) => {
  if (!req.session.csrfToken) {
    req.session.csrfToken =
      crypto.randomBytes(32).toString("hex");
  }

  res.json({
    csrfToken: req.session.csrfToken
  });
});

app.use("/api", (req, res, next) => {
  if (!["POST", "PUT", "PATCH", "DELETE"].includes(req.method)) {
    return next();
  }

  const token = req.get("x-csrf-token");
  const expected = req.session.csrfToken;

  if (
    typeof token !== "string" ||
    typeof expected !== "string" ||
    !/^[a-f0-9]{64}$/i.test(token) ||
    !crypto.timingSafeEqual(
      Buffer.from(token),
      Buffer.from(expected)
    )
  ) {
    return res.status(403).json({
      message: "Güvenlik doğrulaması başarısız."
    });
  }

  next();
});

// İSTEK SINIRLARI
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false
});

const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false
});

// KULLANICI SORGULARI
const findUserByEmail = db.prepare(
  "SELECT * FROM users WHERE email = ?"
);

const findUserById = db.prepare(
  "SELECT id, username, email FROM users WHERE id = ?"
);

const insertUser = db.prepare(`
  INSERT INTO users
  (id, username, email, password_hash, created_at)
  VALUES (?, ?, ?, ?, ?)
`);

function regenerateSession(req) {
  return new Promise((resolve, reject) => {
    req.session.regenerate(error => {
      if (error) return reject(error);
      resolve();
    });
  });
}

function saveSession(req) {
  return new Promise((resolve, reject) => {
    req.session.save(error => {
      if (error) return reject(error);
      resolve();
    });
  });
}

// KULLANICI KAYDI
app.post("/api/register", registerLimiter, async (req, res) => {
  try {
    const username = String(req.body.username || "").trim();
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = req.body.password;

    if (
      username.length < 3 ||
      username.length > 24 ||
      !/^[\p{L}\p{N}_-]+$/u.test(username)
    ) {
      return res.status(400).json({
        message: "Kullanıcı adı 3-24 karakter olmalı."
      });
    }

    if (
      email.length > 254 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
      return res.status(400).json({
        message: "Geçerli bir e-posta gir."
      });
    }

    if (
      typeof password !== "string" ||
      password.length < 10 ||
      Buffer.byteLength(password, "utf8") > 72
    ) {
      return res.status(400).json({
        message: "Şifre en az 10 karakter olmalı."
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const id = crypto.randomUUID();

    try {
      insertUser.run(
        id,
        username,
        email,
        passwordHash,
        new Date().toISOString()
      );
    } catch (error) {
      if (error.code === "SQLITE_CONSTRAINT_UNIQUE") {
        return res.status(409).json({
          message: "Bu kullanıcı adı veya e-posta zaten kayıtlı."
        });
      }

      throw error;
    }

    await regenerateSession(req);

    req.session.userId = id;
    req.session.csrfToken =
      crypto.randomBytes(32).toString("hex");

    await saveSession(req);

    res.status(201).json({
      message: "Kayıt başarılı.",
      csrfToken: req.session.csrfToken,
      user: { id, username, email }
    });

  } catch (error) {
    console.error("Kayıt hatası:", error.message);

    res.status(500).json({
      message: "Kayıt sırasında sunucu hatası oluştu."
    });
  }
});

// KULLANICI GİRİŞİ
app.post("/api/login", loginLimiter, async (req, res) => {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = req.body.password;

    const user = findUserByEmail.get(email);

    if (
      !user ||
      typeof password !== "string" ||
      !(await bcrypt.compare(password, user.password_hash))
    ) {
      return res.status(401).json({
        message: "E-posta veya şifre hatalı."
      });
    }

    await regenerateSession(req);

    req.session.userId = user.id;
    req.session.csrfToken =
      crypto.randomBytes(32).toString("hex");

    await saveSession(req);

    res.json({
      message: "Giriş başarılı.",
      csrfToken: req.session.csrfToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    });

  } catch (error) {
    console.error("Giriş hatası:", error.message);

    res.status(500).json({
      message: "Giriş sırasında sunucu hatası oluştu."
    });
  }
});

// OTURUM KONTROLÜ
app.get("/api/me", (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({
      message: "Giriş yapılmamış."
    });
  }

  const user = findUserById.get(req.session.userId);

  if (!user) {
    return res.status(401).json({
      message: "Kullanıcı bulunamadı."
    });
  }

  res.json({ user });
});

// GİRİŞ KONTROLÜ
function requireLogin(req, res, next) {
  if (!req.session.userId) {
    return res.status(401).json({
      message: "AI kullanmak için giriş yapmalısın."
    });
  }

  next();
}

// GEMINI YARDIMCI FONKSİYONU
function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getErrorStatus(error) {
  return Number(
    error.status ||
    error.code ||
    error.response?.status ||
    0
  );
}

// ZENTRA GEMINI AI - SOHBET
app.post(
  "/api/chat",
  aiLimiter,
  requireLogin,
  async (req, res) => {
    try {
      if (!gemini) {
        return res.status(503).json({
          message: "ZENTRA Gemini AI henüz yapılandırılmadı."
        });
      }

      const messages = req.body.messages;

      if (
        !Array.isArray(messages) ||
        messages.length === 0 ||
        messages.length > 12
      ) {
        return res.status(400).json({
          message: "Geçersiz sohbet mesajları."
        });
      }

      const safeMessages = [];

      for (const message of messages) {
        if (!message || !["user", "assistant"].includes(message.role)) {
          return res.status(400).json({ message: "Mesaj biçimi geçersiz." });
        }

        const content = typeof message.content === "string" ? message.content.trim() : "";
        if (content.length > 3000 || (!content && !message.image)) {
          return res.status(400).json({ message: "Mesaj metni geçersiz." });
        }

        const parts = [];
        if (content) parts.push({ text: content });

        if (message.image) {
          const { mimeType, data } = message.image;
          if (
            message.role !== "user" ||
            !["image/jpeg", "image/png", "image/webp"].includes(mimeType) ||
            typeof data !== "string" ||
            data.length > 5_600_000 ||
            !/^[A-Za-z0-9+/]+={0,2}$/.test(data)
          ) {
            return res.status(400).json({ message: "Görsel biçimi geçersiz veya çok büyük." });
          }
          parts.push({ inlineData: { mimeType, data } });
        }

        safeMessages.push({
          role: message.role === "assistant" ? "model" : "user",
          parts
        });
      }

      if (
        safeMessages[safeMessages.length - 1].role !== "user"
      ) {
        return res.status(400).json({
          message: "Son mesaj kullanıcıdan gelmeli."
        });
      }

      // GEMINI API - 3 DENEME
      let response = null;
      let lastError = null;

      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          response = await gemini.models.generateContent({
            model: GEMINI_MODEL,
            contents: safeMessages,
            config: {
              systemInstruction:
                "Sen ZENTRA AI adlı yardımcı bir yapay zekâ asistanısın. " +
                "Türkçe konuş. Açık, nazik ve faydalı cevaplar ver. " +
                "Kullanıcıya yazılım, projeler, görevler ve fikirler " +
                "konusunda yardımcı ol.",
              maxOutputTokens: 600
            }
          });

          break;

        } catch (error) {
          lastError = error;

          const status = getErrorStatus(error);

          
           console.error(`Gemini deneme ${attempt + 1} başarısız:`, {
            status, message: error.message, code: error.code
          });
       

          const retryableStatuses = [
            408, 429, 500, 502, 503, 504
          ];

          if (
            !retryableStatuses.includes(status) ||
            attempt === 2
          ) {
            throw error;
          }

          const delay = 1000 * Math.pow(2, attempt);

          console.log(
            `Gemini ${delay} ms sonra yeniden denenecek.`
          );

          await wait(delay);
        }
      }

      if (!response) {
        throw lastError || new Error("Gemini yanıt vermedi.");
      }

      const reply = response.text;

      if (!reply) {
        throw new Error("Gemini boş yanıt döndürdü.");
      }

      res.json({
        reply: reply
      });

    } catch (error) {
      const status = getErrorStatus(error);

      console.error("ZENTRA GEMINI TAM HATA:", error);

      if (status === 503 || status === 429) {
        return res.status(status).json({
          message: "Gemini şu anda yoğun. Biraz bekleyip tekrar dene."
        });
      }

      res.status(500).json({
        message: "Gemini AI yanıt oluşturamadı. Biraz sonra tekrar dene."
      });
    }
  }
);

// ÇIKIŞ
app.post("/api/logout", (req, res) => {
  req.session.destroy(error => {
    if (error) {
      return res.status(500).json({
        message: "Çıkış yapılamadı."
      });
    }

    res.clearCookie("zentra.sid", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production"
    });

    res.json({
      message: "Çıkış başarılı."
    });
  });
});

// SUNUCU DURUMU
app.get("/api/status", (req, res) => {
  res.json({
    name: "ZENTRA Intelligence",
    status: "online",
    database: "connected",
    ai: gemini ? "gemini_configured" : "not_configured",
    model: gemini ? GEMINI_MODEL : null
  });
});

// BİLİNMEYEN API ADRESLERİ
app.use("/api", (req, res) => {
  res.status(404).json({
    message: "API adresi bulunamadı."
  });
});

// SUNUCUYU BAŞLAT
app.listen(PORT, () => {
  console.log(
    `ZENTRA sunucusu ${PORT} numaralı portta çalışıyor.`
  );

  console.log(
    `ZENTRA Gemini AI: ${gemini ? "HAZIR" : "API ANAHTARI BEKLENİYOR"}`
  );

  console.log(
    `Gemini modeli: ${GEMINI_MODEL}`
  );
});