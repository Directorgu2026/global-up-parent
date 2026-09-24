import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Home, Trophy, ShoppingBag, User, Calendar, MapPin, CheckCircle2, XCircle, Clock,
  FileText, Link2, Wallet, Coins as CoinsIcon, PartyPopper, Megaphone, Flame,
  Award, Medal, TrendingUp, TrendingDown, Minus, LogOut, RefreshCw, Eye, EyeOff, Gift, GraduationCap, Phone, PiggyBank, Info, Users, X,
  Upload, Paperclip, Loader2, MessageCircle, Image as ImageIcon, ChevronDown as ChevronDownIcon, Camera, LifeBuoy,
} from "lucide-react";

/* ------------------------------ Настройка ------------------------------ */
const EDGE_FUNCTION_URL = "https://inswhfcwbybykwdthekg.supabase.co/functions/v1/mini-app-data";
const ANON_KEY = "sb_publishable_Lm1ZUwWhD_bq1IwpAFH8ZQ_OU2ph4W4";

/* ------------------------- Надёжное хранилище -------------------------
   Внутри Telegram обычный localStorage иногда сбрасывается между сеансами
   (особенно на iPhone) — поэтому логин/пароль там ненадёжно запоминались.
   Telegram.WebApp.CloudStorage хранит данные на серверах Telegram, привязано
   к аккаунту пользователя и не подвержено такой очистке. Используем его как
   основное хранилище, а localStorage — как быстрый локальный кэш и запасной
   вариант вне Telegram (обычный браузер). */
function storageSet(key, value) {
  try {
    const tg = window.Telegram && window.Telegram.WebApp;
    if (tg && tg.CloudStorage) tg.CloudStorage.setItem(key, value, () => {});
  } catch {}
  try { localStorage.setItem(key, value); } catch {}
}
function storageGet(key) {
  return new Promise((resolve) => {
    let done = false;
    const finish = (val) => { if (done) return; done = true; resolve(val || ""); };
    let localVal = "";
    try { localVal = localStorage.getItem(key) || ""; } catch {}
    const tg = window.Telegram && window.Telegram.WebApp;
    if (tg && tg.CloudStorage) {
      try {
        tg.CloudStorage.getItem(key, (err, val) => { finish(!err && val ? val : localVal); });
        setTimeout(() => finish(localVal), 1500); // на случай, если Telegram не ответит
        return;
      } catch {}
    }
    finish(localVal);
  });
}
function storageRemove(key) {
  try {
    const tg = window.Telegram && window.Telegram.WebApp;
    if (tg && tg.CloudStorage) tg.CloudStorage.removeItem(key, () => {});
  } catch {}
  try { localStorage.removeItem(key); } catch {}
}

/* ------------------------------ Стиль/тема ------------------------------ */
const INK = "var(--ink)";
const PAPER = "var(--paper)";
const RED = "#DC2626";
const LANG_FLAGS = { ru: "🇷🇺", en: "🇬🇧", uz: "🇺🇿" };
const RED_D = "#991B1B";
const RED_L = "#FEE2E2";
const GOLD = "#EAB308";
const BRICK = "#EA580C";
const GREEN = "#16A34A";
const GREEN_D = "#15803D";
const BLUE = "#2563EB";
const PURPLE = "#7C3AED";
const LINE = "var(--line)";

const THEME_VARS = `
  html, body {
    touch-action: pan-x pan-y;
    -webkit-text-size-adjust: 100%;
    text-size-adjust: 100%;
    overscroll-behavior-y: contain;
  }
  input, textarea, select { font-size: 16px !important; }
  .theme-light {
    --paper: #F7F5F0; --ink: #1A1A17; --line: #EDEBE4; --surface: #FFFFFF;
    --surface-soft: #F6F7FB; --surface-alt: #EEEEE8;
    --soft-red-bg: #FEE2E2; --soft-red-fg: #991B1B;
    --soft-yellow-bg: #FEF9C3; --soft-yellow-bg-2: #FFFBEB; --soft-yellow-border: #FEF3C7; --soft-yellow-fg: #854D0E;
    --soft-green-bg: #DCFCE7; --soft-green-fg: #15803D;
    --soft-blue-bg: #DBEAFE; --soft-blue-fg: #1D4ED8;
    --soft-purple-bg: #EDE9FE; --soft-purple-bg-2: #EEECFD; --soft-purple-fg: #5B21B6;
    --soft-orange-bg: #FFF7ED; --notice-border: #FDE68A;
  }
  .theme-dark {
    --paper: #16171C; --ink: #EDECE6; --line: #2C2D33; --surface: #202127;
    --surface-soft: #23242B; --surface-alt: #2A2B32;
    --soft-red-bg: #3D2020; --soft-red-fg: #FCA5A5;
    --soft-yellow-bg: #3A3018; --soft-yellow-bg-2: #322A16; --soft-yellow-border: #453A1C; --soft-yellow-fg: #F3D28A;
    --soft-green-bg: #1B3327; --soft-green-fg: #86EFAC;
    --soft-blue-bg: #1D2A45; --soft-blue-fg: #93C5FD;
    --soft-purple-bg: #2B2140; --soft-purple-bg-2: #281F3C; --soft-purple-fg: #D8B4FE;
    --soft-orange-bg: #3A2C1C; --notice-border: #5C4A22;
  }
`;

const FONT_IMPORT = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
* { font-family: 'Inter', sans-serif; }
.mono { font-variant-numeric: tabular-nums; }
.anim-fade { animation: fadeIn 0.15s ease-out; }
.anim-pop { animation: popIn 0.18s cubic-bezier(0.34,1.56,0.64,1); }
.anim-info-pulse { animation: infoPulse 2.2s ease-in-out infinite; }
@keyframes infoPulse {
  0%, 100% { box-shadow: 0 2px 6px rgba(0,0,0,0.2), 0 0 0 0 rgba(255,255,255,0.6); }
  50% { box-shadow: 0 2px 6px rgba(0,0,0,0.2), 0 0 0 6px rgba(255,255,255,0); }
}
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes popIn { from { opacity: 0; transform: scale(0.92); } to { opacity: 1; transform: scale(1); } }
body { -webkit-tap-highlight-color: transparent; }
`;

/* -------------------------------- Утилиты -------------------------------- */
const fmt = (n) => Math.round(n || 0).toLocaleString("ru-RU");
function formatUzPhone(digits) {
  let out = "";
  if (digits.length > 0) out += digits.slice(0, 2);
  if (digits.length > 2) out += " " + digits.slice(2, 5);
  if (digits.length > 5) out += " " + digits.slice(5, 7);
  if (digits.length > 7) out += " " + digits.slice(7, 9);
  return out;
}
const ruDate = (iso, locale = "ru-RU") => new Date(iso).toLocaleDateString(locale, { day: "2-digit", month: "short" });
const scheduleText = (g, fallback = "не задано") => (g?.days && g.days.length ? `${g.days.join("/")} · ${g.start}–${g.end}` : fallback);
const initials = (name) => (name || "?").trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join("").toUpperCase();

// Цвет по названию курса/предмета — свой у каждого предмета (тот же принцип хэша, что и у
// цветных инициалов), чтобы карточки разных групп визуально различались, а не сливались в
// одинаковый повторяющийся красный блок, если предметов несколько.
function courseColor(course) {
  const palette = [[RED, RED_D], [BLUE, "#1E40AF"], [PURPLE, "#5B21B6"], [GOLD, "#A16207"], [GREEN, GREEN_D], [BRICK, "#9A3412"]];
  let hash = 0;
  for (let i = 0; i < (course || "").length; i++) hash = (hash * 31 + course.charCodeAt(i)) >>> 0;
  return palette[hash % palette.length];
}

// Лёгкая вибрация при нажатии — Telegram Mini Apps умеют это нативно, ощущается гораздо
// отзывчивее обычной кнопки. За пределами Telegram (или если функция недоступна) — тихо ничего
// не делает, никаких ошибок.
function haptic(style = "light") {
  try {
    const h = window.Telegram?.WebApp?.HapticFeedback;
    if (!h) return;
    if (style === "success" || style === "error" || style === "warning") h.notificationOccurred(style);
    else h.impactOccurred(style);
  } catch {}
}

async function fetchMyData(initData, phone, password, redeemItemId, redeemStudentId) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);
  let curLang = "ru";
  try { curLang = localStorage.getItem("gu_lang") || "ru"; } catch {}
  try {
    const res = await fetch(EDGE_FUNCTION_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", apikey: ANON_KEY, Authorization: `Bearer ${ANON_KEY}` },
      body: JSON.stringify({ initData, phone, password, redeemItemId, redeemStudentId }),
      signal: controller.signal,
    });
    return await res.json();
  } catch (e) {
    if (e.name === "AbortError") return { error: translate(curLang, "server_timeout") };
    return { error: translate(curLang, "server_unreachable", { msg: String(e?.message || e) }) };
  } finally {
    clearTimeout(timeout);
  }
}

// Сдача ДЗ — свой запрос, таймаут больше (загрузка файлов может занять чуть больше времени,
// особенно на медленном мобильном интернете).
async function submitHomeworkRequest(initData, phone, password, submitHomework) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 45000);
  let curLang = "ru";
  try { curLang = localStorage.getItem("gu_lang") || "ru"; } catch {}
  try {
    const res = await fetch(EDGE_FUNCTION_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", apikey: ANON_KEY, Authorization: `Bearer ${ANON_KEY}` },
      body: JSON.stringify({ initData, phone, password, submitHomework }),
      signal: controller.signal,
    });
    return await res.json();
  } catch (e) {
    if (e.name === "AbortError") return { error: translate(curLang, "server_timeout") };
    return { error: translate(curLang, "server_unreachable", { msg: String(e?.message || e) }) };
  } finally {
    clearTimeout(timeout);
  }
}

async function updateAvatarRequest(initData, phone, password, updateAvatar) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);
  let curLang = "ru";
  try { curLang = localStorage.getItem("gu_lang") || "ru"; } catch {}
  try {
    const res = await fetch(EDGE_FUNCTION_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", apikey: ANON_KEY, Authorization: `Bearer ${ANON_KEY}` },
      body: JSON.stringify({ initData, phone, password, updateAvatar }),
      signal: controller.signal,
    });
    return await res.json();
  } catch (e) {
    if (e.name === "AbortError") return { error: translate(curLang, "server_timeout") };
    return { error: translate(curLang, "server_unreachable", { msg: String(e?.message || e) }) };
  } finally {
    clearTimeout(timeout);
  }
}

async function requestServiceRequest(initData, phone, password, requestService) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);
  let curLang = "ru";
  try { curLang = localStorage.getItem("gu_lang") || "ru"; } catch {}
  try {
    const res = await fetch(EDGE_FUNCTION_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", apikey: ANON_KEY, Authorization: `Bearer ${ANON_KEY}` },
      body: JSON.stringify({ initData, phone, password, requestService }),
      signal: controller.signal,
    });
    return await res.json();
  } catch (e) {
    if (e.name === "AbortError") return { error: translate(curLang, "server_timeout") };
    return { error: translate(curLang, "server_unreachable", { msg: String(e?.message || e) }) };
  } finally {
    clearTimeout(timeout);
  }
}

// Сжимаем и обрезаем фото в квадрат под аватарку — небольшой размер (400×400) достаточен для
// круглой картинки в приложении, при этом файл получается совсем лёгким.
function imageFileToAvatarPayload(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();
    reader.onload = () => { img.src = reader.result; };
    reader.onerror = reject;
    img.onload = () => {
      const size = 400;
      const minSide = Math.min(img.width, img.height);
      const sx = (img.width - minSide) / 2, sy = (img.height - minSide) / 2;
      const canvas = document.createElement("canvas");
      canvas.width = size; canvas.height = size;
      canvas.getContext("2d").drawImage(img, sx, sy, minSide, minSide, 0, 0, size, size);
      resolve(canvas.toDataURL("image/jpeg", 0.85).split(",")[1]);
    };
    img.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Сжимаем фото перед отправкой — чтобы не грузить огромные снимки с телефона "как есть"
// (это было бы медленно и дорого по трафику). Уменьшаем до разумного размера и сохраняем в JPEG.
function fileToUploadPayload(file) {
  return new Promise((resolve, reject) => {
    const isImage = file.type.startsWith("image/");
    if (!isImage) {
      // Не картинка (PDF, Word и т.п.) — отправляем как есть, без сжатия.
      const reader = new FileReader();
      reader.onload = () => resolve({ name: file.name, type: file.type, dataBase64: reader.result.split(",")[1] });
      reader.onerror = reject;
      reader.readAsDataURL(file);
      return;
    }
    const img = new Image();
    const reader = new FileReader();
    reader.onload = () => { img.src = reader.result; };
    reader.onerror = reject;
    img.onload = () => {
      const maxDim = 1600;
      let { width, height } = img;
      if (width > maxDim || height > maxDim) {
        const scale = maxDim / Math.max(width, height);
        width = Math.round(width * scale);
        height = Math.round(height * scale);
      }
      const canvas = document.createElement("canvas");
      canvas.width = width; canvas.height = height;
      canvas.getContext("2d").drawImage(img, 0, 0, width, height);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.78);
      resolve({ name: file.name.replace(/\.\w+$/, ".jpg"), type: "image/jpeg", dataBase64: dataUrl.split(",")[1] });
    };
    img.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/* -------------------------------- UI-атомы -------------------------------- */
function Card({ children, className = "", style = {} }) {
  return <div className={`rounded-3xl ${className}`} style={{ background: "var(--surface)", boxShadow: "0 1px 3px rgba(26,26,23,0.06), 0 1px 2px rgba(26,26,23,0.04)", ...style }}>{children}</div>;
}
function EmptyState({ text, icon: Icon = FileText, emoji }) {
  return (
    <div className="py-9 text-center">
      <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3" style={{ background: "var(--soft-yellow-bg-2, var(--surface-soft))" }}>
        {emoji ? <span className="text-[24px]">{emoji}</span> : <Icon size={22} style={{ opacity: 0.35 }} />}
      </div>
      <p className="text-[12.5px] opacity-50 px-6">{text}</p>
    </div>
  );
}
function Avatar({ name, size = 40, avatarUrl }) {
  const colors = [[RED, RED_D], [BLUE, "#1E40AF"], [PURPLE, "var(--soft-purple-fg)"], [GOLD, "#B45309"], [GREEN, GREEN_D], [BRICK, "#9A3412"]];
  let hash = 0;
  for (let i = 0; i < (name || "").length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  const [c1, c2] = colors[hash % colors.length];
  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={name}
        className="rounded-full shrink-0 object-cover"
        style={{ width: size, height: size, boxShadow: `0 0 0 2px var(--surface), 0 1px 4px rgba(0,0,0,0.15)` }}
      />
    );
  }
  return (
    <div className="rounded-full flex items-center justify-center shrink-0 font-bold text-white" style={{ width: size, height: size, background: `linear-gradient(135deg, ${c1}, ${c2})`, fontSize: size * 0.38, boxShadow: `0 0 0 2px var(--surface), 0 1px 4px rgba(0,0,0,0.15)` }}>
      {initials(name)}
    </div>
  );
}

/* ------------------------------- Главная ------------------------------- */
function ProgressRing({ pct, size = 108, ringColor }) {
  const stroke = 11;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (Math.max(0, Math.min(100, pct)) / 100) * c;
  const color = ringColor || (pct >= 90 ? GREEN_D : pct >= 75 ? GOLD : pct >= 50 ? BRICK : RED_D);
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(255,255,255,0.6)" strokeWidth={stroke} fill="none" />
        <circle cx={size / 2} cy={size / 2} r={r} stroke={color} strokeWidth={stroke} fill="none" strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round" style={{ transition: "stroke-dashoffset 0.6s ease" }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[22px] font-extrabold" style={{ color }}>{pct}%</span>
      </div>
    </div>
  );
}
function trendArrow(log) {
  const N = 5;
  const recent = log.slice(0, N);
  const older = log.slice(N, N * 2);
  if (recent.length < 2 || older.length < 2) return null;
  const pctOf = (arr) => (arr.length ? arr.filter((r) => r.present).length / arr.length : 0);
  const diff = pctOf(recent) - pctOf(older);
  if (diff > 0.05) return "up";
  if (diff < -0.05) return "down";
  return "same";
}

function ProgressCard({ log, generalGrades = [], materials = [], homework = [], coins = 0, t }) {
  const total = log.length;
  const present = log.filter((r) => r.present).length;
  const attendancePct = total ? Math.round((present / total) * 100) : null;
  let streak = 0;
  for (const r of log) { if (r.present) streak++; else break; }

  const lessonGrades = log.filter((r) => r.grade).map((r) => r.grade);
  const homeworkGrades = homework.filter((h) => h.grade).map((h) => h.grade);
  const allGrades = [...lessonGrades, ...generalGrades.map((g) => g.value), ...homeworkGrades];
  const avgGrade = allGrades.length ? (allGrades.reduce((a, b) => a + b, 0) / allGrades.length) : null;
  const gradePct = avgGrade != null ? Math.round((avgGrade / 5) * 100) : null;

  // Сколько заданий из выданных хотя бы раз были сданы (не важно, проверены уже или нет).
  const submittedMaterialIds = new Set(homework.map((h) => h.materialId).filter(Boolean));
  const homeworkPct = materials.length ? Math.round((materials.filter((m) => submittedMaterialIds.has(m.id)).length / materials.length) * 100) : null;

  // Простой средний показатель: посещаемость + сданные ДЗ + оценки, без сложных весов —
  // берём среднее по тем показателям, по которым вообще есть данные (если задания ещё не
  // выдавались, например, показатель ДЗ просто не участвует, а не считается за 0).
  const parts = [attendancePct, homeworkPct, gradePct].filter((x) => x != null);
  const pct = parts.length ? Math.round(parts.reduce((a, b) => a + b, 0) / parts.length) : 0;

  // Светофор: красный / жёлтый / зелёный — понятно с одного взгляда
  const zone = parts.length === 0 ? "none" : pct >= 90 ? "green" : pct >= 60 ? "yellow" : "red";
  const zoneColors = {
    green: { bg: "var(--soft-green-bg)", ring: GREEN_D, text: "var(--soft-green-fg)", label: t("progress_great") },
    yellow: { bg: "var(--soft-yellow-bg)", ring: GOLD, text: "var(--soft-yellow-fg)", label: t("progress_ok") },
    red: { bg: "var(--soft-red-bg)", ring: RED_D, text: "var(--soft-red-fg)", label: t("progress_bad") },
    none: { bg: PAPER, ring: "#D1D0C5", text: "#9C9A90", label: t("progress_none") },
  }[zone];

  const trend = trendArrow(log);

  return (
    <Card className="p-4" style={{ background: zoneColors.bg, border: "none" }}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[14.5px] font-bold flex items-center gap-1.5"><TrendingUp size={16} />{t("progress_title")}</h3>
        {trend && (
          <span className="flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-full" style={{ background: "var(--surface)", color: trend === "up" ? GREEN_D : trend === "down" ? RED_D : "var(--ink)", opacity: trend === "same" ? 0.7 : 1 }}>
            {trend === "up" ? <TrendingUp size={12} /> : trend === "down" ? <TrendingDown size={12} /> : <Minus size={12} />}
            {trend === "up" ? t("trend_up") : trend === "down" ? t("trend_down") : t("trend_same")}
          </span>
        )}
      </div>
      <div className="flex items-center gap-4">
        <ProgressRing pct={pct} ringColor={zoneColors.ring} />
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-bold leading-snug" style={{ color: zoneColors.text }}>{zoneColors.label}</p>
          <div className="flex items-center gap-3 mt-2.5 flex-wrap">
            <div>
              <div className="text-[17px] font-extrabold leading-none">{present}<span className="text-[11px] font-medium opacity-45">/{total}</span></div>
              <div className="text-[10px] opacity-45 mt-1">{t("lessons_attended")}</div>
            </div>
            {streak > 0 && (
              <div>
                <div className="text-[17px] font-extrabold leading-none flex items-center gap-1">{streak} <Flame size={15} style={{ color: BRICK }} /></div>
                <div className="text-[10px] opacity-45 mt-1">{t("streak_days")}</div>
              </div>
            )}
            {avgGrade != null && (
              <div>
                <div className="text-[17px] font-extrabold leading-none">{avgGrade.toFixed(1)}</div>
                <div className="text-[10px] opacity-45 mt-1">{t("avg_grade")}</div>
              </div>
            )}
            {homeworkPct != null && (
              <div>
                <div className="text-[17px] font-extrabold leading-none">{homeworkPct}%</div>
                <div className="text-[10px] opacity-45 mt-1">{t("progress_homework")}</div>
              </div>
            )}
            <div>
              <div className="text-[17px] font-extrabold leading-none flex items-center gap-1">{coins} <CoinsIcon size={14} style={{ color: GOLD }} /></div>
              <div className="text-[10px] opacity-45 mt-1">{t("progress_coins")}</div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

// Иконка/подпись/нужно ли поле "тема" — зависит от типа заявки
const SERVICE_TYPES = {
  support_lesson: { icon: LifeBuoy, color: RED_D, needsTopic: false },
  topic_reexplain: { icon: RefreshCw, color: "#1D4ED8", needsTopic: true },
  materials_only: { icon: Paperclip, color: GREEN_D, needsTopic: true },
};
function ServiceRequestModal({ type, student, onClose, onSubmit, t }) {
  const groups = student.groups || [];
  const [groupId, setGroupId] = useState(groups.length === 1 ? groups[0].id : "");
  const [topic, setTopic] = useState("");
  const [sending, setSending] = useState(false);
  const meta = SERVICE_TYPES[type];
  const canSend = groupId && (!meta.needsTopic || topic.trim().length > 0) && !sending;
  const handleSend = async () => {
    if (!canSend) return;
    setSending(true);
    const ok = await onSubmit(groupId, topic);
    setSending(false);
    if (ok) onClose();
  };
  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-5" style={{ background: "rgba(0,0,0,0.45)" }} onClick={onClose}>
      <div className="anim-pop w-full sm:max-w-sm rounded-t-3xl sm:rounded-3xl p-6" style={{ background: "var(--surface)" }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[16px] font-bold flex items-center gap-2"><meta.icon size={20} style={{ color: meta.color }} />{t(`service_${type}_title`)}</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ background: "var(--surface-alt)" }}><X size={15} /></button>
        </div>
        <p className="text-[12.5px] opacity-55 mb-4">{t(`service_${type}_desc`)}</p>

        {groups.length > 1 && (
          <div className="mb-3">
            <label className="text-[12px] opacity-55 block mb-1.5">{t("service_group_label")}</label>
            <select value={groupId} onChange={(e) => setGroupId(e.target.value)} className="w-full text-[13.5px] px-3.5 py-2.5 rounded-xl outline-none" style={{ background: "var(--surface-soft)", border: `1px solid var(--line)` }}>
              <option value="">{t("service_group_placeholder")}</option>
              {groups.map((g) => <option key={g.id} value={g.id}>{g.name} · {g.course}</option>)}
            </select>
          </div>
        )}

        {meta.needsTopic && (
          <div className="mb-4">
            <label className="text-[12px] opacity-55 block mb-1.5">{t("service_topic_label")}</label>
            <textarea
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder={t("service_topic_placeholder")}
              rows={3}
              className="w-full text-[13.5px] px-3.5 py-2.5 rounded-xl outline-none resize-none"
              style={{ background: "var(--surface-soft)", border: `1px solid var(--line)` }}
            />
          </div>
        )}

        <button
          onClick={handleSend}
          disabled={!canSend}
          className="w-full py-3 rounded-full text-[14px] font-bold text-white transition-opacity"
          style={{ background: RED, opacity: canSend ? 1 : 0.4 }}
        >
          {sending ? <Loader2 size={16} className="inline animate-spin" /> : t("service_send_btn")}
        </button>
      </div>
    </div>
  );
}
function CoinsInfoPopup({ onClose, t }) {
  const items = [
    { icon: Users, bg: "var(--soft-yellow-bg)", fg: "var(--soft-yellow-fg)", title: t("coins_info_referral_title"), text: t("coins_info_referral_text"), highlight: true },
    { icon: GraduationCap, bg: "var(--soft-green-bg)", fg: GREEN_D, title: t("coins_info_grades_title"), text: t("coins_info_grades_text") },
    { icon: Flame, bg: "var(--soft-blue-bg)", fg: "#1D4ED8", title: t("coins_info_attendance_title"), text: t("coins_info_attendance_text") },
    { icon: Trophy, bg: "var(--soft-purple-bg)", fg: "var(--soft-purple-fg)", title: t("coins_info_achievements_title"), text: t("coins_info_achievements_text") },
  ];
  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-5" style={{ background: "rgba(0,0,0,0.45)" }} onClick={onClose}>
      <div className="anim-pop w-full sm:max-w-sm rounded-t-3xl sm:rounded-3xl p-6 max-h-[85vh] overflow-y-auto" style={{ background: "var(--surface)" }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[16px] font-bold flex items-center gap-2"><CoinsIcon size={18} style={{ color: GOLD }} />{t("coins_info_title")}</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ background: "var(--surface-alt)" }}><X size={15} /></button>
        </div>
        <div className="space-y-2.5">
          {items.map((item, i) => (
            <div key={i} className="p-3.5 rounded-2xl flex items-start gap-3" style={{ background: item.bg, border: item.highlight ? `1.5px solid ${GOLD}` : "none" }}>
              <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ background: "rgba(255,255,255,0.5)" }}>
                <item.icon size={16} style={{ color: item.fg }} />
              </div>
              <div className="min-w-0">
                <div className="text-[13px] font-bold" style={{ color: item.fg }}>{item.title}</div>
                <div className="text-[12px] mt-0.5 leading-snug opacity-80" style={{ color: item.fg }}>{item.text}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
function DebtPopup({ amount, adminTelegram, lang, onClose, t }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-5" style={{ background: "rgba(0,0,0,0.45)" }} onClick={onClose}>
      <div className="anim-pop w-full max-w-sm rounded-3xl p-6 text-center" style={{ background: "var(--surface)" }} onClick={(e) => e.stopPropagation()}>
        <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3" style={{ background: RED_L }}>
          <Wallet size={26} style={{ color: RED_D }} />
        </div>
        <h2 className="text-[17px] font-bold mb-2">{t("debt_popup_title")}</h2>
        <p className="text-[13.5px] opacity-70 leading-relaxed mb-5">
          {t("debt_popup_text", { sum: `${fmt(amount)} ${lang === "ru" ? "сум" : lang === "uz" ? "so'm" : "UZS"}` })}
        </p>
        {adminTelegram && (
          <a href={`https://t.me/${adminTelegram}`} target="_blank" rel="noreferrer" className="w-full flex items-center justify-center gap-1.5 text-[13px] font-semibold py-3 rounded-2xl mb-2.5" style={{ background: "var(--soft-purple-bg-2)", color: "var(--soft-purple-fg)" }}>
            <Megaphone size={15} /> {t("contact_admin")}
          </a>
        )}
        <button onClick={onClose} className="w-full text-[13px] font-medium py-3 rounded-2xl" style={{ background: "var(--surface-alt)", color: "var(--ink)" }}>
          {t("debt_popup_close")}
        </button>
      </div>
    </div>
  );
}
function ConfettiOverlay({ amount, grade, onDone, t }) {
  useEffect(() => { const timer = setTimeout(onDone, 2800); return () => clearTimeout(timer); }, []);
  const pieces = useMemo(() => Array.from({ length: 70 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 0.5,
    duration: 1.8 + Math.random() * 1.4,
    color: [RED, GOLD, GREEN, BLUE, PURPLE, BRICK][i % 6],
    rotate: Math.random() * 360,
    size: 6 + Math.random() * 8,
  })), []);
  const isGrade = grade !== undefined && grade !== null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden" style={{ background: "rgba(0,0,0,0.15)" }} onClick={onDone}>
      {pieces.map((p) => (
        <div key={p.id} style={{
          position: "absolute", top: -20, left: `${p.left}%`, width: p.size, height: p.size * 0.4,
          background: p.color, transform: `rotate(${p.rotate}deg)`,
          animation: `confettiFall ${p.duration}s ease-in ${p.delay}s forwards`,
        }} />
      ))}
      <div className="anim-pop rounded-3xl px-9 py-8 text-center shadow-2xl mx-6" style={{ background: "var(--surface)" }}>
        {isGrade ? (
          <>
            <div className="text-[52px] leading-none">⭐</div>
            <div className="text-[30px] font-extrabold mt-2" style={{ color: GREEN_D }}>{grade}</div>
            <div className="text-[13px] opacity-50 mt-1.5">{t ? t("new_grade_popup") : "Новая оценка!"}</div>
          </>
        ) : (
          <>
            <div className="text-[52px] leading-none">🪙</div>
            <div className="text-[30px] font-extrabold mt-2" style={{ color: "#B45309" }}>+{amount} GC</div>
            <div className="text-[13px] opacity-50 mt-1.5">{t ? t("coins_awarded") : "Начислены GlobalCoins!"}</div>
          </>
        )}
      </div>
      <style>{`@keyframes confettiFall { to { transform: translateY(115vh) rotate(720deg); opacity: 0.4; } }`}</style>
    </div>
  );
}

// Сдача ДЗ прямо под заданием: если уже отправлено — показываем статус и файлы;
// если ещё нет — маленькая форма (файлы + комментарий), разворачивается по кнопке.
function HomeworkSubmitBox({ material, student, onSubmitHomework, t, locale }) {
  const gradeColors = { 1: BRICK, 2: "#EA580C", 3: GOLD, 4: "#65A30D", 5: GREEN_D };
  const [expanded, setExpanded] = useState(false);
  const [files, setFiles] = useState([]);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const photoInputRef = useRef(null);
  const docInputRef = useRef(null);

  const mySubmissions = (student.homework || []).filter((h) => h.materialId === material.id);

  // Важно: на iPhone, если смешать типы "фото" и "документы" в ОДНОМ поле выбора файла
  // (accept="image/*,.pdf,..."), система иногда прячет вариант "Галерея" и показывает только
  // "Файлы". Поэтому — два отдельных, ясно подписанных поля вместо одного смешанного.
  const addFiles = (picked) => {
    setFiles((prev) => [...prev, ...Array.from(picked || [])].slice(0, 5));
  };
  const removeFile = (idx) => setFiles((prev) => prev.filter((_, i) => i !== idx));

  const handleSubmit = async () => {
    if (submitting) return;
    if (files.length === 0 && !note.trim()) return;
    setSubmitting(true);
    const res = await onSubmitHomework({ groupId: material.groupId, materialId: material.id, note, fileList: files });
    setSubmitting(false);
    if (res.ok) {
      setExpanded(false);
      setFiles([]);
      setNote("");
      if (photoInputRef.current) photoInputRef.current.value = "";
      if (docInputRef.current) docInputRef.current.value = "";
    }
  };

  return (
    <div className="mt-2.5 pt-2.5" style={{ borderTop: "1px dashed var(--soft-yellow-border)" }}>
      {mySubmissions.map((h) => (
        <div key={h.id} className="mb-2 p-2.5 rounded-xl" style={{ background: "var(--surface)" }}>
          <div className="flex items-center gap-1.5 text-[11.5px] font-semibold" style={{ color: h.status === "reviewed" ? GREEN_D : "#B45309" }}>
            {h.status === "reviewed" ? <CheckCircle2 size={13} /> : <Clock size={13} />}
            {h.status === "reviewed" ? t("homework_reviewed") : t("homework_pending")}
            {h.grade && (
              <span className="text-[11px] font-bold px-1.5 py-0.5 rounded-md text-white" style={{ background: gradeColors[h.grade] || GREEN_D }}>{h.grade}</span>
            )}
            <span className="opacity-50 font-normal ml-auto">{new Date(h.submittedAt).toLocaleDateString(locale, { day: "2-digit", month: "short" })}</span>
          </div>
          {h.note && <div className="text-[12.5px] mt-1 opacity-80">{h.note}</div>}
          {h.files?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {h.files.map((f, i) => (
                <a key={i} href={f.url} target="_blank" rel="noreferrer" className="text-[11px] font-medium px-2 py-1 rounded-lg flex items-center gap-1" style={{ background: "var(--surface-alt)" }}>
                  <Paperclip size={11} />{f.name.length > 16 ? f.name.slice(0, 14) + "…" : f.name}
                </a>
              ))}
            </div>
          )}
          {h.status === "reviewed" && h.teacherComment && (
            <div className="text-[12.5px] mt-1.5 p-2 rounded-lg flex items-start gap-1.5" style={{ background: "var(--soft-green-bg, #DCFCE7)" }}>
              <MessageCircle size={13} className="shrink-0 mt-0.5" />{h.teacherComment}
            </div>
          )}
        </div>
      ))}

      {!expanded ? (
        <button onClick={() => setExpanded(true)} className="w-full text-[12.5px] font-semibold py-2 rounded-xl flex items-center justify-center gap-1.5" style={{ background: "var(--surface)", color: BLUE }}>
          <Upload size={14} />{mySubmissions.length > 0 ? t("homework_submit_again") : t("homework_submit")}
        </button>
      ) : (
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <label className="text-[12.5px] font-semibold py-2.5 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer" style={{ background: "var(--surface)", border: "1px solid var(--line)" }}>
              <ImageIcon size={15} />{t("homework_pick_photo")}
              <input ref={photoInputRef} type="file" accept="image/*" multiple onChange={(e) => addFiles(e.target.files)} className="hidden" />
            </label>
            <label className="text-[12.5px] font-semibold py-2.5 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer" style={{ background: "var(--surface)", border: "1px solid var(--line)" }}>
              <Paperclip size={15} />{t("homework_pick_file")}
              <input ref={docInputRef} type="file" accept=".pdf,.doc,.docx" multiple onChange={(e) => addFiles(e.target.files)} className="hidden" />
            </label>
          </div>
          {files.length > 0 && (
            <div className="space-y-1">
              {files.map((f, i) => (
                <div key={i} className="flex items-center gap-1.5 text-[11.5px] px-2.5 py-1.5 rounded-lg" style={{ background: "var(--surface-alt)" }}>
                  <Paperclip size={11} className="shrink-0" />
                  <span className="truncate flex-1">{f.name}</span>
                  <button onClick={() => removeFile(i)} className="shrink-0 opacity-60"><X size={13} /></button>
                </div>
              ))}
            </div>
          )}
          <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder={t("homework_note_placeholder")} rows={2} className="w-full text-[12.5px] px-3 py-2 rounded-xl outline-none" style={{ background: "var(--surface)", border: "1px solid var(--line)" }} />
          <div className="flex gap-2">
            <button onClick={handleSubmit} disabled={submitting || (files.length === 0 && !note.trim())} className="flex-1 text-[12.5px] font-semibold py-2 rounded-xl flex items-center justify-center gap-1.5 text-white disabled:opacity-50" style={{ background: RED }}>
              {submitting ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}{t("homework_send")}
            </button>
            <button onClick={() => { setExpanded(false); setFiles([]); setNote(""); }} className="px-3.5 py-2 rounded-xl text-[12.5px] font-medium" style={{ background: "var(--surface)" }}>{t("cancel")}</button>
          </div>
        </div>
      )}
    </div>
  );
}

function HomeTab({ student, notifications = [], t, lang, onSubmitHomework, onRequestService }) {
  const locale = LOCALE_OF[lang] || "ru-RU";
  const [showCoinsInfo, setShowCoinsInfo] = useState(false);
  const [showOldHomework, setShowOldHomework] = useState(false);
  const [serviceModalType, setServiceModalType] = useState(null);
  const log = [...(student.attendanceLog || [])].sort((a, b) => new Date(b.date) - new Date(a.date));
  const total = log.length;
  const present = log.filter((r) => r.present).length;
  const pct = total ? Math.round((present / total) * 100) : null;
  const recent = log.slice(0, 8);
  const materials = [...(student.materials || [])].sort((a, b) => new Date(b.date) - new Date(a.date));
  const gradeColors = { 1: BRICK, 2: "#EA580C", 3: GOLD, 4: "#65A30D", 5: GREEN_D };
  const hasDebt = (student.debt || 0) > 0;
  const urgentNotifications = notifications.filter((n) => n.urgent);
  const normalNotifications = notifications.filter((n) => !n.urgent);
  const TODAY_DAY_NAMES = { 0: "Вс", 1: "Пн", 2: "Вт", 3: "Ср", 4: "Чт", 5: "Пт", 6: "Сб" };
  const todayDayName = TODAY_DAY_NAMES[new Date().getDay()];
  const todaysGroups = (student.groups || []).filter((g) => (g.days || []).includes(todayDayName));

  return (
    <div className="space-y-3">
      {urgentNotifications.map((n) => (
        <div key={n.id} className="rounded-3xl p-5 text-white relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${RED}, ${RED_D})`, boxShadow: "0 4px 20px rgba(220,38,38,0.35)" }}>
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ background: "rgba(255,255,255,0.2)" }}>
              <Megaphone size={18} />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-wide opacity-90">{t("important_notice")}</p>
              <p className="text-[15px] font-semibold leading-snug mt-1">{n.text}</p>
              <p className="text-[11px] opacity-75 mt-1.5">{n.senderName} · {ruDate(n.date, locale)}</p>
            </div>
          </div>
        </div>
      ))}
      {normalNotifications.length > 0 && (
        <div className="rounded-3xl p-4 space-y-2.5" style={{ background: "var(--soft-yellow-bg)", border: "1px solid var(--notice-border)" }}>
          {normalNotifications.map((n) => (
            <div key={n.id} className="flex items-start gap-2.5">
              <Megaphone size={18} className="shrink-0 mt-0.5" style={{ color: "#B45309" }} />
              <div className="min-w-0">
                <p className="text-[13px] font-medium leading-snug" style={{ color: "var(--soft-yellow-fg)" }}>{n.text}</p>
                <p className="text-[10.5px] opacity-60 mt-0.5" style={{ color: "var(--soft-yellow-fg)" }}>{n.senderName} · {ruDate(n.date, locale)}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {todaysGroups.length > 0 && (
        <div className="rounded-3xl p-4 text-white relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${BLUE}, #1E40AF)` }}>
          <div className="absolute -right-5 -bottom-5 w-20 h-20 rounded-full" style={{ background: "rgba(255,255,255,0.1)" }} />
          <p className="text-[10.5px] font-bold uppercase tracking-wide opacity-85 flex items-center gap-1.5"><Calendar size={13} />{t("today_lesson_label")}</p>
          <div className="mt-2 space-y-2">
            {todaysGroups.map((g) => (
              <div key={g.id} className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-[14px] font-bold truncate">{g.name}</div>
                  <div className="text-[11.5px] opacity-80 flex items-center gap-1 mt-0.5"><MapPin size={11} />{g.room}</div>
                </div>
                <div className="text-[15px] font-extrabold shrink-0">{g.start}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Баланс и GlobalCoins — рядом, в отдельных рамках. Баланс — это всегда конкретное число. */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-3xl p-4 text-white relative overflow-hidden" style={{ background: hasDebt ? `linear-gradient(135deg, ${RED}, ${RED_D})` : `linear-gradient(135deg, ${GREEN}, ${GREEN_D})` }}>
          <div className="absolute -right-4 -top-4 w-16 h-16 rounded-full" style={{ background: "rgba(255,255,255,0.1)" }} />
          <Wallet size={19} className="opacity-90" />
          <p className="text-[10.5px] font-medium opacity-85 uppercase tracking-wide mt-2">{hasDebt ? t("debt") : t("balance")}</p>
          <div className="text-[16px] font-extrabold mt-0.5 leading-tight">
            {fmt(hasDebt ? student.debt : (student.prepaidCredit || 0))}
            <span className="text-[10.5px] font-medium opacity-80 ml-1">{lang === "ru" ? "сум" : lang === "uz" ? "so'm" : "UZS"}</span>
          </div>
          {!hasDebt && (
            <div className="flex items-center gap-1 mt-1 text-[10.5px] opacity-90">
              <CheckCircle2 size={12} /> {(student.prepaidCredit || 0) > 0 ? t("debt_credit_note") : t("debt_none")}
            </div>
          )}
        </div>
        <div className="rounded-3xl p-4 text-white relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${GOLD}, #B45309)` }}>
          <div className="absolute -right-4 -top-4 w-16 h-16 rounded-full" style={{ background: "rgba(255,255,255,0.1)" }} />
          <div className="flex items-center justify-between">
            <CoinsIcon size={19} className="opacity-90" />
            <button onClick={() => setShowCoinsInfo(true)} className="anim-info-pulse w-8 h-8 rounded-full flex items-center justify-center shrink-0 active:scale-90 transition-transform" style={{ background: "#fff", boxShadow: "0 2px 6px rgba(0,0,0,0.2)" }}>
              <Info size={17} strokeWidth={2.5} style={{ color: "#B45309" }} />
            </button>
          </div>
          <p className="text-[10.5px] font-medium opacity-85 uppercase tracking-wide mt-2">{t("coins")}</p>
          <div className="text-[16px] font-extrabold mt-0.5 leading-tight">{student.coins}<span className="text-[10.5px] font-medium opacity-80 ml-1">GC</span></div>
        </div>
      </div>
      {hasDebt && (student.prepaidCredit || 0) > 0 && (
        <div className="rounded-2xl p-3 flex items-center gap-2" style={{ background: "var(--soft-green-bg)" }}>
          <PiggyBank size={16} style={{ color: GREEN_D }} />
          <p className="text-[12.5px] font-medium" style={{ color: GREEN_D }}>{t("credit_note", { sum: fmt(student.prepaidCredit) })}</p>
        </div>
      )}

      <ProgressCard log={log} generalGrades={student.generalGrades || []} materials={student.materials || []} homework={student.homework || []} coins={student.coins} t={t} />

      {/* Сервис — заявки учителю: суппорт-урок, повторное объяснение темы, только материалы */}
      <Card className="p-4">
        <h3 className="text-[13.5px] font-bold mb-3">{t("service_section_title")}</h3>
        <div className="grid grid-cols-3 gap-2.5">
          <button onClick={() => { haptic("light"); setServiceModalType("support_lesson"); }} className="flex flex-col items-center justify-center gap-2 p-3 rounded-2xl text-center active:scale-95 transition-transform aspect-square" style={{ background: "var(--soft-red-bg, #FEE2E2)" }}>
            <LifeBuoy size={22} style={{ color: RED_D }} />
            <span className="text-[11px] font-semibold leading-tight" style={{ color: RED_D }}>{t("service_support_lesson_title")}</span>
          </button>
          <button onClick={() => { haptic("light"); setServiceModalType("topic_reexplain"); }} className="flex flex-col items-center justify-center gap-2 p-3 rounded-2xl text-center active:scale-95 transition-transform aspect-square" style={{ background: "var(--soft-blue-bg, #DBEAFE)" }}>
            <RefreshCw size={22} style={{ color: "#1D4ED8" }} />
            <span className="text-[11px] font-semibold leading-tight" style={{ color: "#1D4ED8" }}>{t("service_topic_reexplain_title")}</span>
          </button>
          <button onClick={() => { haptic("light"); setServiceModalType("materials_only"); }} className="flex flex-col items-center justify-center gap-2 p-3 rounded-2xl text-center active:scale-95 transition-transform aspect-square" style={{ background: "var(--soft-green-bg, #DCFCE7)" }}>
            <Paperclip size={22} style={{ color: GREEN_D }} />
            <span className="text-[11px] font-semibold leading-tight" style={{ color: GREEN_D }}>{t("service_materials_only_title")}</span>
          </button>
        </div>
      </Card>
      {serviceModalType && (
        <ServiceRequestModal
          type={serviceModalType}
          student={student}
          onClose={() => setServiceModalType(null)}
          onSubmit={(groupId, topic) => onRequestService(serviceModalType, groupId, topic)}
          t={t}
        />
      )}

      {/* Расписание — своя карточка на группу, цвет зависит от предмета */}
      {(student.groups || []).length === 0 ? (
        <Card className="p-5">
          <p className="text-[13.5px] opacity-60">{t("no_group")}</p>
        </Card>
      ) : (
        student.groups.map((g) => {
          const [c1, c2] = courseColor(g.course);
          return (
            <Card key={g.id} className="p-0 overflow-hidden">
              <div className="h-1.5" style={{ background: `linear-gradient(90deg, ${c1}, ${c2})` }} />
              <div className="p-4">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ background: c1 }} />
                  <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: c1 }}>{g.course}</p>
                </div>
                <h2 className="text-[16.5px] font-bold mt-0.5">{g.name}</h2>
                <div className="flex items-center gap-2 mt-2.5 flex-wrap text-[12px]">
                  <span className="flex items-center gap-1 px-2.5 py-1 rounded-full" style={{ background: "var(--surface-soft)" }}><Calendar size={11} className="inline mr-0.5 -mt-0.5" />{scheduleText(g, t("no_schedule"))}</span>
                  <span className="flex items-center gap-1 px-2.5 py-1 rounded-full" style={{ background: "var(--surface-soft)" }}><MapPin size={11} className="inline mr-0.5 -mt-0.5" />{g.room}</span>
                </div>
                {g.teacherName && <p className="text-[12px] mt-2 opacity-55">{t("teacher_label")}: {g.teacherName}</p>}
              </div>
            </Card>
          );
        })
      )}

      {/* Посещаемость и оценки */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[14.5px] font-bold">{t("attendance_grades")}</h3>
          {pct !== null && (
            <span className="text-[13px] font-bold px-2.5 py-1 rounded-full" style={{ background: pct >= 90 ? "var(--soft-green-bg)" : pct >= 80 ? "var(--soft-yellow-bg)" : RED_L, color: pct >= 90 ? GREEN_D : pct >= 80 ? "var(--soft-yellow-fg)" : RED_D }}>
              {pct}%
            </span>
          )}
        </div>
        {recent.length === 0 ? (
          <EmptyState text={t("no_attendance")} emoji="📅" />
        ) : (
          <>
            {log.length >= 4 && (
              <div className="flex items-end gap-[3px] mb-3 h-8">
                {[...log].reverse().slice(0, 30).map((r, i) => (
                  <div
                    key={i}
                    title={ruDate(r.date, locale)}
                    className="flex-1 rounded-sm"
                    style={{
                      height: r.present ? "100%" : r.excused ? "55%" : "30%",
                      background: r.present ? GREEN_D : r.excused ? BLUE : BRICK,
                      opacity: 0.85,
                      minWidth: 2,
                    }}
                  />
                ))}
              </div>
            )}
            <div className="flex gap-2 overflow-x-auto pb-1">
            {recent.map((r, i) => (
              <div key={i} className="shrink-0 w-16 rounded-2xl p-2 text-center" style={{ background: r.present ? "var(--soft-green-bg)" : r.excused ? "var(--soft-blue-bg)" : "var(--soft-orange-bg)" }}>
                <div className="text-[10px] font-medium opacity-50 mono">{ruDate(r.date, locale)}</div>
                <div className="text-[16px] my-1">{r.present ? <CheckCircle2 size={16} style={{ color: GREEN_D, display: "inline" }} /> : r.excused ? <Clock size={16} style={{ color: BLUE, display: "inline" }} /> : <XCircle size={16} style={{ color: BRICK, display: "inline" }} />}</div>
                {r.grade ? (
                  <div className="text-[11px] font-bold text-white rounded-full px-1.5 py-0.5 inline-block" style={{ background: gradeColors[r.grade] }}>{r.grade}</div>
                ) : (
                  <div className="text-[10px] opacity-30">—</div>
                )}
              </div>
            ))}
            </div>
          </>
        )}
      </Card>

      {/* ДЗ / материалы */}
      <Card className="p-4">
        <h3 className="text-[14.5px] font-bold mb-3 flex items-center gap-1.5"><FileText size={16} />{t("homework")}</h3>
        {materials.length === 0 ? (
          <EmptyState text={t("no_homework")} emoji="🎉" />
        ) : (
          <div className="space-y-2">
            {(() => {
              const [latest, ...older] = materials;
              const renderItem = (m) => (
                <div key={m.id} className="p-3 rounded-2xl" style={{ background: "var(--soft-yellow-bg-2)", border: "1px solid var(--soft-yellow-border)" }}>
                  <div className="text-[11px] font-bold uppercase tracking-wide" style={{ color: "#B45309" }}>{new Date(m.date).toLocaleDateString(locale, { day: "2-digit", month: "long" })}</div>
                  {m.text && <div className="text-[13px] mt-1 leading-snug">{m.text}</div>}
                  {m.link && <a href={m.link} target="_blank" rel="noreferrer" className="text-[12.5px] mt-1.5 font-medium flex items-center gap-1" style={{ color: BLUE }}><Link2 size={13} className="inline mr-1 -mt-0.5" />{t("open_material")}</a>}
                  <HomeworkSubmitBox material={m} student={student} onSubmitHomework={onSubmitHomework} t={t} locale={locale} />
                </div>
              );
              return (
                <>
                  {renderItem(latest)}
                  {older.length > 0 && (
                    <>
                      <button onClick={() => setShowOldHomework((v) => !v)} className="w-full text-[12px] font-semibold py-2 rounded-xl flex items-center justify-center gap-1.5 opacity-60">
                        {showOldHomework ? t("homework_hide_old") : t("homework_show_old", { n: older.length })}
                        <ChevronDownIcon size={14} style={{ transform: showOldHomework ? "rotate(180deg)" : "none", transition: "transform .15s" }} />
                      </button>
                      {showOldHomework && older.map(renderItem)}
                    </>
                  )}
                </>
              );
            })()}
          </div>
        )}
      </Card>
      {showCoinsInfo && <CoinsInfoPopup onClose={() => setShowCoinsInfo(false)} t={t} />}
    </div>
  );
}

/* ------------------------------- Рейтинг ------------------------------- */
const WEEK_DAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
function ScheduleTab({ student, t, lang }) {
  const TODAY_DAY_NAMES = { 0: "Вс", 1: "Пн", 2: "Вт", 3: "Ср", 4: "Чт", 5: "Пт", 6: "Сб" };
  const todayDayName = TODAY_DAY_NAMES[new Date().getDay()];
  const dayLabels = { "Пн": t("mon"), "Вт": t("tue"), "Ср": t("wed"), "Чт": t("thu"), "Пт": t("fri"), "Сб": t("sat"), "Вс": t("sun") };
  const groups = student.groups || [];

  return (
    <div className="space-y-3">
      <h2 className="text-[15px] font-bold px-1">{t("tab_schedule")}</h2>
      {groups.length === 0 ? (
        <EmptyState text={t("no_group")} icon={Calendar} />
      ) : (
        WEEK_DAYS.map((day) => {
          const dayGroups = groups.filter((g) => (g.days || []).includes(day));
          const isToday = day === todayDayName;
          return (
            <div key={day}>
              <div className="flex items-center gap-2 px-1 mb-1.5">
                <span className="text-[12.5px] font-bold" style={{ color: isToday ? RED_D : "var(--ink)" }}>{dayLabels[day]}</span>
                {isToday && <span className="text-[9.5px] font-bold px-1.5 py-0.5 rounded-full text-white" style={{ background: RED }}>{t("today_badge")}</span>}
              </div>
              {dayGroups.length === 0 ? (
                <div className="px-3 py-2.5 rounded-xl text-[12px] opacity-40" style={{ background: "var(--surface-soft)" }}>{t("no_lessons_day")}</div>
              ) : (
                <div className="space-y-1.5">
                  {dayGroups.sort((a, b) => (a.start || "").localeCompare(b.start || "")).map((g) => {
                    const [c1] = courseColor(g.course);
                    return (
                      <div key={g.id} className="flex items-center gap-3 p-3 rounded-2xl" style={{ background: isToday ? "var(--soft-yellow-bg-2)" : "var(--surface)", border: `1px solid ${isToday ? "var(--soft-yellow-border)" : "var(--line)"}` }}>
                        <div className="text-center shrink-0 w-12">
                          <div className="text-[13px] font-extrabold" style={{ color: c1 }}>{g.start}</div>
                          <div className="text-[9.5px] opacity-45">{g.end}</div>
                        </div>
                        <div className="w-1 self-stretch rounded-full shrink-0" style={{ background: c1 }} />
                        <div className="min-w-0 flex-1">
                          <div className="text-[13.5px] font-semibold truncate">{g.name}</div>
                          <div className="text-[11px] opacity-50 flex items-center gap-1 mt-0.5"><MapPin size={10} />{g.room}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}

function FinanceTab({ student, t, lang }) {
  const locale = LOCALE_OF[lang] || "ru-RU";
  const hasDebt = (student.debt || 0) > 0;
  const currency = lang === "ru" ? "сум" : lang === "uz" ? "so'm" : "UZS";
  return (
    <div className="space-y-3">
      <div className="rounded-3xl p-5 text-white relative overflow-hidden" style={{ background: hasDebt ? `linear-gradient(135deg, ${RED}, ${RED_D})` : `linear-gradient(135deg, ${GREEN}, ${GREEN_D})` }}>
        <div className="absolute -right-6 -top-6 w-28 h-28 rounded-full" style={{ background: "rgba(255,255,255,0.08)" }} />
        <p className="text-[11px] font-medium opacity-85 uppercase tracking-wide flex items-center gap-1.5"><Wallet size={13} />{hasDebt ? t("debt_label") : t("no_debt")}</p>
        <div className="text-[26px] font-extrabold mt-1">{fmt(student.debt || 0)} <span className="text-[13px] font-medium opacity-80">{currency}</span></div>
        {student.discount > 0 && (
          <div className="text-[11.5px] font-semibold mt-2 px-2.5 py-1 rounded-full inline-flex items-center gap-1" style={{ background: "rgba(255,255,255,0.2)" }}><PartyPopper size={12} /> {t("discount_label", { pct: student.discount })}</div>
        )}
        {(student.prepaidCredit || 0) > 0 && (
          <div className="text-[11.5px] font-semibold mt-2 px-2.5 py-1 rounded-full inline-flex items-center gap-1" style={{ background: "rgba(255,255,255,0.2)" }}><PiggyBank size={12} /> {t("credit_note", { sum: fmt(student.prepaidCredit) })}</div>
        )}
      </div>

      <Card className="p-4">
        <h3 className="text-[13.5px] font-bold mb-2.5">{t("month_breakdown")}</h3>
        {(student.monthlyDebts || []).length === 0 ? (
          <EmptyState text={t("no_finance_data")} emoji="🧾" />
        ) : (
          <div className="space-y-1.5">
            {[...student.monthlyDebts].sort((a, b) => b.month.localeCompare(a.month)).map((md) => (
              <div key={md.month} className="flex items-center justify-between text-[12.5px] px-3 py-2 rounded-xl" style={{ background: "var(--surface-soft)" }}>
                <span className="capitalize">{new Date(md.month + "-01").toLocaleDateString(locale, { month: "long", year: "numeric" })}</span>
                <span className="font-semibold">{fmt(md.amount)} {currency}</span>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card className="p-4">
        <h3 className="text-[13.5px] font-bold mb-2.5">{t("recent_payments")}</h3>
        {(student.payments || []).length === 0 ? (
          <EmptyState text={t("no_payments_yet")} emoji="💳" />
        ) : (
          <div className="space-y-1.5">
            {[...student.payments].sort((a, b) => new Date(b.date) - new Date(a.date)).map((p, i) => (
              <div key={i} className="flex items-center justify-between text-[12.5px]">
                <span className="opacity-55 mono">{ruDate(p.date, locale)}</span>
                <span className="font-semibold" style={{ color: GREEN_D }}>+{fmt(p.amount)} {currency}</span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

function SingleGroupRating({ group, student, t }) {
  const list = group.students || [];
  const myIndex = list.findIndex((m) => m.id === student.id);
  // Место в рейтинге ИМЕННО в этой группе — своя запись в памяти телефона на каждую группу
  // отдельно (иначе смена места в одном предмете перепутывалась бы со сменой в другом).
  const [rankChange] = useState(() => {
    if (myIndex < 0) return null;
    try {
      const key = `gu_last_rank_${student.id}_${group.groupId}`;
      const prevRaw = localStorage.getItem(key);
      localStorage.setItem(key, String(myIndex));
      if (prevRaw === null) return null;
      const prevRank = Number(prevRaw);
      if (prevRank === myIndex) return "same";
      return prevRank > myIndex ? "up" : "down";
    } catch { return null; }
  });
  const podiumBg = ["linear-gradient(135deg,#FCD34D,#F59E0B)", "linear-gradient(135deg,#D1D5DB,#9CA3AF)", "linear-gradient(135deg,#FCA5A5,#EA580C)"];
  return (
    <div className="space-y-3">
      <div className="rounded-3xl p-5 text-white text-center" style={{ background: `linear-gradient(135deg, ${GOLD}, #B45309)` }}>
        <Trophy size={26} className="mx-auto" />
        <h2 className="text-[16px] font-bold mt-1">{group.groupName}</h2>
        <p className="text-[12px] opacity-85 mt-0.5">{group.course}</p>
        {rankChange && rankChange !== "same" && (
          <div className="inline-flex items-center gap-1 mt-2 px-2.5 py-1 rounded-full text-[11px] font-bold" style={{ background: "rgba(255,255,255,0.2)" }}>
            {rankChange === "up" ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {rankChange === "up" ? t("rank_up") : t("rank_down")}
          </div>
        )}
      </div>
      {list.length === 0 ? (
        <EmptyState text={t("rating_empty")} emoji="👥" />
      ) : (
        <Card className="p-2">
          {list.map((m, i) => {
            const isMe = m.id === student.id;
            return (
              <div key={m.id} className="flex items-center gap-3 px-2.5 py-2.5 rounded-2xl" style={{ background: isMe ? RED_L : "transparent" }}>
                <div className="w-7 text-center shrink-0">
                  {i < 3 ? (
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-[13px] font-bold text-white mx-auto" style={{ background: podiumBg[i] }}>{i + 1}</div>
                  ) : (
                    <span className="text-[13px] font-semibold opacity-40">{i + 1}</span>
                  )}
                </div>
                <Avatar name={m.name} size={36} avatarUrl={m.avatarUrl} />
                <div className="flex-1 min-w-0">
                  <div className="text-[13.5px] font-semibold truncate" style={{ color: isMe ? RED_D : INK }}>{m.name}{isMe && t("you_suffix")}</div>
                  {m.avgGrade !== null && m.avgGrade !== undefined && (
                    <div className="text-[11px] opacity-50 mt-0.5">{t("avg_grade_line", { value: m.avgGrade })}</div>
                  )}
                </div>
                <div className="text-[13.5px] font-bold px-2.5 py-1 rounded-full shrink-0 flex items-center gap-1" style={{ background: "var(--soft-yellow-bg)", color: "var(--soft-yellow-fg)" }}><CoinsIcon size={12} />{m.coins} GC</div>
              </div>
            );
          })}
        </Card>
      )}
    </div>
  );
}
function RatingTab({ student, t }) {
  const ratingByGroup = student.ratingByGroup || [];
  const [activeGroupId, setActiveGroupId] = useState(ratingByGroup[0]?.groupId || "");
  if (ratingByGroup.length === 0) return <EmptyState text={t("rating_no_group")} icon={Trophy} />;
  const activeGroup = ratingByGroup.find((g) => g.groupId === activeGroupId) || ratingByGroup[0];
  return (
    <div className="space-y-3">
      {ratingByGroup.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {ratingByGroup.map((g) => (
            <button
              key={g.groupId}
              onClick={() => { haptic("light"); setActiveGroupId(g.groupId); }}
              className="shrink-0 px-3.5 py-2 rounded-full text-[12.5px] font-semibold transition-colors"
              style={{ background: activeGroup.groupId === g.groupId ? RED : "var(--surface-soft)", color: activeGroup.groupId === g.groupId ? "#fff" : "var(--ink)" }}
            >
              {g.groupName}
            </button>
          ))}
        </div>
      )}
      <SingleGroupRating group={activeGroup} student={student} t={t} />
    </div>
  );
}

/* -------------------------------- Магазин -------------------------------- */
function ShopTab({ student, shopItems, onRedeem, redeeming, t, lang }) {
  const locale = LOCALE_OF[lang] || "ru-RU";
  const [confirmId, setConfirmId] = useState(null);
  const [showCoinsInfo, setShowCoinsInfo] = useState(false);
  const sorted = [...shopItems].sort((a, b) => (student.coins >= a.cost) === (student.coins >= b.cost) ? a.cost - b.cost : (student.coins >= a.cost ? -1 : 1));
  const orders = [...(student.myOrders || [])].sort((a, b) => new Date(b.date) - new Date(a.date));
  return (
    <div className="space-y-3">
      <div className="rounded-3xl p-5 text-white flex items-center justify-between" style={{ background: `linear-gradient(135deg, ${RED}, ${RED_D})` }}>
        <div>
          <p className="text-[11px] font-medium opacity-80 uppercase tracking-wide">{t("your_balance")}</p>
          <h2 className="text-[26px] font-extrabold mt-0.5">{student.coins} <span className="text-[15px] font-semibold opacity-90">GC</span></h2>
        </div>
        <div className="flex flex-col items-center gap-1.5">
          <CoinsIcon size={30} className="opacity-90" />
          <button onClick={() => setShowCoinsInfo(true)} className="anim-info-pulse w-8 h-8 rounded-full flex items-center justify-center shrink-0 active:scale-90 transition-transform" style={{ background: "#fff", boxShadow: "0 2px 6px rgba(0,0,0,0.2)" }}>
            <Info size={17} strokeWidth={2.5} style={{ color: RED_D }} />
          </button>
        </div>
      </div>
      {showCoinsInfo && <CoinsInfoPopup onClose={() => setShowCoinsInfo(false)} t={t} />}
      {(() => {
        const nextItem = [...shopItems].filter((i) => i.cost > student.coins).sort((a, b) => a.cost - b.cost)[0];
        if (!nextItem) return null;
        const pct = Math.min(100, Math.round((student.coins / nextItem.cost) * 100));
        return (
          <Card className="p-4">
            <div className="flex items-center justify-between text-[12.5px]">
              <span className="opacity-60">{t("next_reward_label")}</span>
              <span className="font-bold">{nextItem.name}</span>
            </div>
            <div className="h-2.5 rounded-full mt-2 overflow-hidden" style={{ background: "var(--surface-soft)" }}>
              <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${GOLD}, #B45309)` }} />
            </div>
            <div className="text-[11px] opacity-50 mt-1.5">{t("coins_left_to_go", { n: nextItem.cost - student.coins })}</div>
          </Card>
        );
      })()}
      {shopItems.length === 0 ? (
        <EmptyState text={t("shop_empty")} emoji="🛍️" />
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {sorted.map((item, i) => {
            const enough = student.coins >= item.cost;
            const missing = item.cost - student.coins;
            const colors = [["var(--soft-red-bg)", RED], ["var(--soft-blue-bg)", BLUE], ["var(--soft-yellow-bg)", "#B45309"], ["var(--soft-green-bg)", GREEN_D], ["var(--soft-purple-bg)", PURPLE]];
            const [bg, fg] = colors[i % colors.length];
            const confirming = confirmId === item.id;
            return (
              <div key={item.id} className="rounded-2xl overflow-hidden relative" style={{ background: "var(--surface)", boxShadow: "0 1px 3px rgba(26,26,23,0.07)" }}>
                <div className="aspect-square flex items-center justify-center relative" style={{ background: bg, opacity: enough ? 1 : 0.6 }}>
                  {item.image ? (
                    <img src={item.image} alt="" className="w-full h-full object-cover" onError={(e) => { e.target.style.display = "none"; }} />
                  ) : (
                    <Gift size={32} style={{ opacity: 0.55 }} />
                  )}
                </div>
                <div className="p-2.5">
                  <div className="text-[12.5px] font-semibold leading-tight line-clamp-2" style={{ minHeight: 32 }}>{item.name}</div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[13px] font-extrabold px-2 py-1 rounded-full" style={{ background: bg, color: fg }}>{item.cost} GC</span>
                  </div>
                  {!enough && <div className="text-[10px] font-medium mt-1.5" style={{ color: "#9C9A90" }}>{t("missing_gc", { sum: missing })}</div>}
                  {enough && (
                    confirming ? (
                      <button
                        onClick={() => { onRedeem(item.id); setConfirmId(null); }}
                        disabled={redeeming}
                        className="w-full mt-2.5 text-[12.5px] font-bold py-3 rounded-xl text-white active:scale-95 transition-transform"
                        style={{ background: RED_D, opacity: redeeming ? 0.6 : 1 }}
                      >
                        {redeeming ? "…" : t("buy_confirm")}
                      </button>
                    ) : (
                      <button onClick={() => setConfirmId(item.id)} className="w-full mt-2.5 text-[12.5px] font-bold py-3 rounded-xl text-white active:scale-95 transition-transform" style={{ background: RED }}>
                        {t("buy")}
                      </button>
                    )
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
      <p className="text-[11px] opacity-40 text-center px-4">{t("shop_hint")}</p>

      {orders.length > 0 && (
        <Card className="p-4">
          <h3 className="text-[14px] font-bold mb-2.5 flex items-center gap-1.5"><ShoppingBag size={16} />{t("my_orders")}</h3>
          <div className="space-y-1.5">
            {orders.map((o) => (
              <div key={o.id} className="flex items-center justify-between px-3 py-2.5 rounded-xl" style={{ background: PAPER }}>
                <div className="min-w-0">
                  <div className="text-[12.5px] font-medium truncate">{o.itemName}</div>
                  <div className="text-[10.5px] opacity-45 mt-0.5">{ruDate(o.date, locale)} · {o.cost} GC</div>
                </div>
                {o.status === "fulfilled" ? (
                  <span className="shrink-0 text-[10.5px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1" style={{ background: "var(--soft-green-bg)", color: GREEN_D }}><CheckCircle2 size={11} />{t("order_done")}</span>
                ) : (
                  <span className="shrink-0 text-[10.5px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1" style={{ background: "var(--soft-yellow-bg)", color: "var(--soft-yellow-fg)" }}><Clock size={11} />{t("order_pending")}</span>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

/* -------------------------------- Профиль -------------------------------- */
function FaqSection({ t }) {
  const [openId, setOpenId] = useState(null);
  const items = [1, 2, 3, 4, 5, 6].map((n) => ({ id: n, q: t(`faq_q${n}`), a: t(`faq_a${n}`) }));
  return (
    <Card className="p-4">
      <h3 className="text-[13.5px] font-bold mb-2.5">{t("faq_title")}</h3>
      <div className="space-y-1.5">
        {items.map((item) => {
          const open = openId === item.id;
          return (
            <div key={item.id} className="rounded-2xl overflow-hidden" style={{ background: "var(--surface-soft)" }}>
              <button onClick={() => setOpenId(open ? null : item.id)} className="w-full flex items-center justify-between gap-2 px-3.5 py-3 text-left">
                <span className="text-[12.5px] font-semibold leading-snug">{item.q}</span>
                <span className="text-[13px] opacity-40 shrink-0 transition-transform duration-150" style={{ transform: open ? "rotate(180deg)" : "none" }}>▾</span>
              </button>
              {open && <div className="px-3.5 pb-3 text-[12.5px] leading-relaxed opacity-70">{item.a}</div>}
            </div>
          );
        })}
      </div>
    </Card>
  );
}

// Значки считаются прямо из уже имеющихся данных — никаких новых полей в базе не нужно.
function computeAchievements(student) {
  const log = [...(student.attendanceLog || [])].sort((a, b) => new Date(b.date) - new Date(a.date));
  let streak = 0;
  for (const r of log) { if (r.present) streak++; else break; }
  const homeworkDone = (student.homework || []).length;
  const homeworkReviewed = (student.homework || []).filter((h) => h.status === "reviewed").length;
  const goodGrades = log.filter((r) => r.grade >= 4).length + (student.generalGrades || []).filter((g) => g.value >= 4).length;

  const list = [];
  if (streak >= 3) list.push({ emoji: "🔥", labelKey: "ach_streak", n: streak });
  if (homeworkDone >= 1) list.push({ emoji: "📚", labelKey: "ach_homework", n: homeworkDone });
  if (homeworkReviewed >= 3) list.push({ emoji: "✅", labelKey: "ach_reviewed", n: homeworkReviewed });
  if (goodGrades >= 3) list.push({ emoji: "⭐", labelKey: "ach_grades", n: goodGrades });
  if ((student.coins || 0) >= 100) list.push({ emoji: "💰", labelKey: "ach_coins", n: student.coins });
  return list;
}

function ProfileTab({ student, onLogout, t, lang, changeLang, theme, changeTheme, onUpdateAvatar }) {
  const locale = LOCALE_OF[lang] || "ru-RU";
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const avatarInputRef = useRef(null);
  const handleAvatarPicked = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    await onUpdateAvatar(file);
    setUploadingAvatar(false);
    if (avatarInputRef.current) avatarInputRef.current.value = "";
  };
  return (
    <div className="space-y-3">
      <Card className="p-6 text-center">
        <div className="relative inline-block">
          <Avatar name={student.name} size={72} avatarUrl={student.avatarUrl} />
          <button
            onClick={() => avatarInputRef.current?.click()}
            disabled={uploadingAvatar}
            className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center active:scale-90 transition-transform"
            style={{ background: RED, boxShadow: "0 2px 6px rgba(0,0,0,0.25)", border: "2px solid var(--surface)" }}
          >
            {uploadingAvatar ? <Loader2 size={13} className="text-white animate-spin" /> : <Camera size={13} className="text-white" />}
          </button>
          <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarPicked} />
        </div>
        <h2 className="text-[17px] font-bold mt-3">{student.name}</h2>
        {student.phone && <p className="text-[13px] opacity-50 mt-0.5">{student.phone}</p>}
        <div className="flex items-center justify-center gap-2 mt-3">
          <span className="text-[13px] font-bold px-3 py-1.5 rounded-full" style={{ background: "var(--soft-yellow-bg)", color: "var(--soft-yellow-fg)" }}><CoinsIcon size={13} className="inline mr-1 -mt-0.5" />{student.coins} GC</span>
          {student.discount > 0 && <span className="text-[13px] font-bold px-3 py-1.5 rounded-full" style={{ background: "var(--soft-green-bg)", color: GREEN_D }}>−{student.discount}%</span>}
        </div>
        {(() => {
          const log = student.attendanceLog || [];
          const totalLessons = log.filter((r) => r.present).length;
          if (totalLessons === 0) return null;
          return (
            <div className="flex items-center justify-center gap-6 mt-4 pt-4" style={{ borderTop: "1px solid var(--line)" }}>
              <div className="text-center">
                <div className="text-[18px] font-extrabold">{totalLessons}</div>
                <div className="text-[10.5px] opacity-45 mt-0.5">{t("profile_lessons_total")}</div>
              </div>
            </div>
          );
        })()}
      </Card>
      {(() => {
        const achievements = computeAchievements(student);
        if (achievements.length === 0) return null;
        return (
          <Card className="p-4">
            <h3 className="text-[13.5px] font-bold mb-2.5">{t("achievements_title")}</h3>
            <div className="flex flex-wrap gap-2">
              {achievements.map((a) => (
                <div key={a.labelKey} className="flex items-center gap-1.5 px-3 py-2 rounded-full" style={{ background: "var(--soft-yellow-bg-2, var(--surface-soft))" }}>
                  <span className="text-[15px]">{a.emoji}</span>
                  <span className="text-[11.5px] font-semibold">{t(a.labelKey, { n: a.n })}</span>
                </div>
              ))}
            </div>
          </Card>
        );
      })()}
      <div>
        <h3 className="text-[13.5px] font-bold mb-2.5 px-1">{t("tab_finance")}</h3>
        <FinanceTab student={student} t={t} lang={lang} />
      </div>
      <Card className="p-4">
        <h3 className="text-[13.5px] font-bold mb-2.5">{t("info_title")}</h3>
        <div className="space-y-2 text-[13px]">
          {(student.groups || []).length === 0 ? (
            <div className="flex items-center justify-between py-1.5"><span className="opacity-50">{t("group_label")}</span><span className="font-medium">—</span></div>
          ) : (
            student.groups.map((g) => (
              <div key={g.id} className="flex items-center justify-between py-1.5" style={{ borderBottom: `1px solid ${LINE}` }}>
                <span className="opacity-50">{g.course}</span>
                <span className="font-medium">{g.name}{g.teacherName ? ` · ${g.teacherName}` : ""}</span>
              </div>
            ))
          )}
        </div>
      </Card>

      {(() => {
        const uniqueTeachers = [...new Map((student.groups || []).filter((g) => g.teacherTelegram).map((g) => [g.teacherTelegram, g])).values()];
        if (!student.adminTelegram && uniqueTeachers.length === 0) return null;
        return (
          <Card className="p-4">
            <h3 className="text-[13.5px] font-bold mb-2.5">{t("contact")}</h3>
            <div className="space-y-2">
              {student.adminTelegram && (
                <a href={`https://t.me/${student.adminTelegram}`} target="_blank" rel="noreferrer" className="w-full flex items-center justify-between px-4 py-3 rounded-2xl" style={{ background: "var(--soft-purple-bg-2)" }}>
                  <span className="text-[13px] font-semibold" style={{ color: "var(--soft-purple-fg)" }}>{t("contact_admin")}</span>
                  <Megaphone size={16} style={{ color: "var(--soft-purple-fg)" }} />
                </a>
              )}
              {uniqueTeachers.map((g) => (
                <a key={g.teacherTelegram} href={`https://t.me/${g.teacherTelegram}`} target="_blank" rel="noreferrer" className="w-full flex items-center justify-between px-4 py-3 rounded-2xl" style={{ background: RED_L }}>
                  <span className="text-[13px] font-semibold" style={{ color: RED_D }}>{t("contact_teacher", { name: g.teacherName || t("teacher_fallback") })}</span>
                  <GraduationCap size={16} style={{ color: RED_D }} />
                </a>
              ))}
            </div>
          </Card>
        );
      })()}
      <FaqSection t={t} />

      <Card className="p-4">
        <h3 className="text-[13.5px] font-bold mb-3">{t("settings")}</h3>
        <div className="flex items-center justify-between py-2">
          <span className="text-[13px] opacity-60">{t("language")}</span>
          <div className="flex items-center gap-0.5 p-1 rounded-full" style={{ background: "var(--surface-alt)" }}>
            {["ru", "en", "uz"].map((l) => (
              <button
                key={l}
                onClick={() => changeLang(l)}
                className="w-9 h-9 rounded-full flex items-center justify-center text-[16px] transition-all duration-150"
                style={{ background: lang === l ? "var(--surface)" : "transparent", boxShadow: lang === l ? "0 2px 6px rgba(0,0,0,0.14)" : "none", transform: lang === l ? "scale(1.08)" : "scale(1)" }}
              >
                {LANG_FLAGS[l]}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-between py-2 mt-1">
          <span className="text-[13px] opacity-60">{t("theme")}</span>
          <div className="flex items-center gap-0.5 p-1 rounded-full" style={{ background: "var(--surface-alt)" }}>
            <button onClick={() => changeTheme("light")} className="px-3.5 py-1.5 rounded-full text-[12px] font-medium flex items-center gap-1 transition-all duration-150" style={{ background: theme === "light" ? "var(--surface)" : "transparent", boxShadow: theme === "light" ? "0 2px 6px rgba(0,0,0,0.14)" : "none", color: "var(--ink)" }}>☀️ {t("theme_light")}</button>
            <button onClick={() => changeTheme("dark")} className="px-3.5 py-1.5 rounded-full text-[12px] font-medium flex items-center gap-1 transition-all duration-150" style={{ background: theme === "dark" ? "var(--surface)" : "transparent", boxShadow: theme === "dark" ? "0 2px 6px rgba(0,0,0,0.14)" : "none", color: "var(--ink)" }}>🌙 {t("theme_dark")}</button>
          </div>
        </div>
      </Card>

      <button onClick={onLogout} className="w-full text-[13px] font-medium py-3 rounded-2xl flex items-center justify-center gap-1.5" style={{ background: "var(--surface-alt)", color: "var(--ink)", opacity: 0.75 }}><LogOut size={14} />{t("logout")}</button>
    </div>
  );
}

/* -------------------------------- Экран входа -------------------------------- */
function LoginScreen({ phone, setPhone, password, setPassword, loginError, loginLoading, onLogin, lang, changeLang, theme, changeTheme, t }) {
  return (
    <div className={`theme-${theme} min-h-screen flex items-center justify-center p-4`} style={{ background: PAPER }}>
      <style>{FONT_IMPORT}</style>
      <style>{THEME_VARS}</style>
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-2.5 mb-5">
          <div className="flex items-center gap-0.5 p-1 rounded-full" style={{ background: "var(--surface-alt)" }}>
            {["ru", "en", "uz"].map((l) => (
              <button
                key={l}
                onClick={() => changeLang(l)}
                className="w-9 h-9 rounded-full flex items-center justify-center text-[16px] transition-all duration-150"
                style={{ background: lang === l ? "var(--surface)" : "transparent", boxShadow: lang === l ? "0 2px 6px rgba(0,0,0,0.14)" : "none", transform: lang === l ? "scale(1.08)" : "scale(1)" }}
              >
                {LANG_FLAGS[l]}
              </button>
            ))}
          </div>
          <button
            onClick={() => changeTheme(theme === "light" ? "dark" : "light")}
            className="w-9 h-9 rounded-full flex items-center justify-center text-[15px]"
            style={{ background: "var(--surface-alt)" }}
          >
            {theme === "light" ? "🌙" : "☀️"}
          </button>
        </div>
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-3xl mx-auto flex items-center justify-center text-white text-[24px] font-extrabold" style={{ background: `linear-gradient(135deg, ${RED}, ${RED_D})` }}>GU</div>
          <h1 className="text-[19px] font-extrabold mt-3">Global Up</h1>
          <p className="text-[13px] opacity-50 mt-0.5">{t("login_title")}</p>
        </div>
        <Card className="p-6">
          <div className="space-y-3">
            <div>
              <label className="text-[12px] font-medium opacity-50 block mb-1.5">{t("login_phone")}</label>
              <div className="flex items-center gap-1.5">
                <span className="shrink-0 px-3.5 py-3 rounded-2xl text-[14px] font-semibold" style={{ background: "var(--surface-alt)" }}>+998</span>
                <input
                  inputMode="numeric"
                  value={formatUzPhone((phone || "").replace(/[^0-9]/g, "").replace(/^998/, "").slice(0, 9))}
                  onChange={(e) => setPhone("+998 " + formatUzPhone(e.target.value.replace(/[^0-9]/g, "").slice(0, 9)))}
                  placeholder="90 123 45 67"
                  className="w-full text-[15px] px-4 py-3 rounded-2xl outline-none"
                  style={{ border: `1.5px solid ${LINE}`, background: PAPER, color: INK }}
                />
              </div>
            </div>
            <div>
              <label className="text-[12px] font-medium opacity-50 block mb-1.5">{t("login_password")}</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full text-[15px] px-4 py-3 rounded-2xl outline-none" style={{ border: `1.5px solid ${LINE}`, background: PAPER, color: INK }} />
            </div>
            {loginError && <p className="text-[12px] break-words font-medium" style={{ color: RED_D }}>{loginError}</p>}
            <button onClick={onLogin} disabled={loginLoading} className="w-full text-[15px] font-bold py-3.5 rounded-2xl text-white" style={{ background: RED, opacity: loginLoading ? 0.6 : 1 }}>
              {loginLoading ? "…" : t("login_button")}
            </button>
          </div>
        </Card>
        <p className="text-[11px] opacity-40 mt-4 text-center px-4">{t("login_remember")}</p>
      </div>
    </div>
  );
}

/* ----------------------------------- Переводы ----------------------------------- */
const TRANSLATIONS = {
  ru: {
    tab_home: "Главная", tab_schedule: "Расписание", tab_finance: "Финансы", tab_rating: "Рейтинг", tab_shop: "Магазин", tab_profile: "Профиль",
    debt_label: "Задолженность", no_debt: "Долгов нет", no_finance_data: "Пока нет данных о начислениях", no_payments_yet: "Пока нет оплат",
    mon: "Понедельник", tue: "Вторник", wed: "Среда", thu: "Четверг", fri: "Пятница", sat: "Суббота", sun: "Воскресенье",
    today_badge: "Сегодня", no_lessons_day: "Занятий нет",
    balance: "Баланс", debt: "Долг", debt_none: "Долгов нет", debt_credit_note: "В счёт след. месяца",
    coins: "GlobalCoins", credit_note: "На балансе {sum} сум — уменьшит следующее начисление",
    progress_title: "Мой прогресс", progress_none: "Пока нет данных",
    progress_great: "Отлично! Продолжай в том же духе", progress_ok: "Неплохо, но можно лучше",
    progress_bad: "Много пропусков — постарайся не пропускать",
    trend_up: "Растёт", trend_down: "Снижается", trend_same: "Стабильно",
    lessons_attended: "занятий посещено", streak_days: "подряд без пропусков", avg_grade: "средний балл",
    progress_homework: "ДЗ сдано", progress_coins: "монет",
    homework_show_old: "Показать старые ({n})", homework_hide_old: "Скрыть старые",
    no_group: "Пока не закреплена группа", teacher_label: "Преподаватель",
    attendance_grades: "Посещаемость и оценки", no_attendance: "Пока нет отметок посещаемости",
    homework: "Домашнее задание", no_homework: "Пока нет домашних заданий", open_material: "Открыть материал",
    homework_submit: "Сдать работу", homework_submit_again: "Отправить ещё раз",
    homework_pending: "Отправлено — ожидает проверки", homework_reviewed: "Проверено",
    homework_pick_photo: "Фото", homework_pick_file: "Файл", homework_note_placeholder: "Комментарий (необязательно)",
    homework_send: "Отправить", cancel: "Отмена", homework_sent: "Домашнее задание отправлено", avatar_updated: "Фото обновлено",
    important_notice: "Важное уведомление",
    your_balance: "Ваш баланс", shop_empty: "Магазин пока пуст", buy: "Купить", buy_confirm: "Точно купить?",
    next_reward_label: "До следующей награды:", coins_left_to_go: "Осталось накопить: {n} GC",
    missing_gc: "Ещё {sum} GC", shop_hint: "После покупки заявка сразу видна администратору и директору — просто дождитесь, когда вам выдадут награду.",
    my_orders: "Мои заказы", order_done: "Выдано", order_pending: "В очереди",
    rank_you: "вы", place_label: "Ваше место", of_label: "из",
    contact: "Связаться", contact_admin: "Написать администрации", contact_teacher: "Написать {name}",
    logout: "Выйти из аккаунта", payment_history: "История оплат",
    login_title: "Вход в систему", login_phone: "Номер телефона", login_password: "Пароль",
    login_button: "Войти", login_error_generic: "Не удалось войти", login_remember: "После первого входа вход запомнится на этом устройстве.",
    loading: "Загрузка…", settings: "Настройки", language: "Язык", theme: "Тема",
    theme_light: "Светлая", theme_dark: "Тёмная",
    month_breakdown: "Разбивка по месяцам", discount_label: "Скидка −{pct}%",
    service_section_title: "Сервис",
    service_support_lesson_title: "Записаться на суппорт-урок",
    service_topic_reexplain_title: "Повторное объяснение темы",
    service_materials_only_title: "Нужны только материалы",
    service_support_lesson_desc: "Учитель получит заявку и свяжется с вами, чтобы назначить время.",
    service_topic_reexplain_desc: "Укажите, какую тему нужно объяснить ещё раз — заявка уйдёт учителю.",
    service_materials_only_desc: "Если полноценный урок не нужен, а нужны только презентация/материалы по теме.",
    service_group_label: "Предмет", service_group_placeholder: "Выберите предмет",
    service_topic_label: "Какая тема?", service_topic_placeholder: "Например: прошедшее время, тема 5",
    service_send_btn: "Отправить заявку", service_request_sent: "Заявка отправлена учителю",
    empty_student: "Ученик не найден", refresh: "Обновить",
    rating_title: "Рейтинг группы", rating_subtitle: "{name} · по GlobalCoins", rank_up: "Поднялись с прошлого раза", rank_down: "Опустились с прошлого раза",
    rating_no_group: "Рейтинг появится, когда закрепят группу", rating_empty: "В группе пока никого нет",
    avg_grade_line: "Средний балл: {value}", you_suffix: " (вы)",
    info_title: "Информация", group_label: "Группа", course_label: "Курс", profile_lessons_total: "занятий посещено",
    achievements_title: "Достижения",
    ach_streak: "{n} занятий подряд без пропусков", ach_homework: "Сдано ДЗ: {n}", ach_reviewed: "Проверено ДЗ: {n}",
    ach_grades: "Хороших оценок: {n}", ach_coins: "Накоплено {n} GC",
    recent_payments: "Последние оплаты", teacher_fallback: "преподавателю",
    identity_error: "Не удалось подтвердить личность — откройте приложение заново и попробуйте снова.",
    order_sent: "Заявка отправлена! Дождитесь выдачи у администратора.",
    coins_awarded: "Начислены GlobalCoins!", no_schedule: "не задано", today_lesson_label: "Сегодня у вас занятие", new_grade_popup: "Новая оценка!",
    server_timeout: "Сервер не ответил вовремя — проверьте интернет-соединение и попробуйте ещё раз.",
    server_unreachable: "Нет связи с сервером: {msg}",
    faq_title: "Вопросы и ответы",
    faq_q1: "Как начисляются GlobalCoins?",
    faq_a1: "Учитель начисляет монеты за оценки и активность на занятии, за хорошую посещаемость без пропусков, за успехи и достижения, а также 200 монет за каждого приведённого друга, который начал заниматься — подробнее смотрите на главном экране рядом с балансом монет (значок «i»).",
    faq_q2: "Что будет, если пропустить занятие без уважительной причины?",
    faq_a2: "Это отмечается в журнале посещаемости, но урок всё равно нужно оплатить — как за проведённый. Освобождает от оплаты только пропуск по уважительной причине, отмеченный учителем.",
    faq_q3: "Что делать, если заранее знаю, что пропущу занятие по болезни или другой уважительной причине?",
    faq_a3: "Нужно предупредить учителя или администрацию центра заранее — лично или в Telegram.",
    faq_q4: "Как изменить или узнать пароль входа?",
    faq_a4: "Логин и пароль выдаёт администрация центра — при необходимости обратитесь к ним лично или в Telegram, чтобы узнать текущий пароль или получить новый.",
    faq_q5: "Как оплатить за обучение?",
    faq_a5: "Оплата принимается администрацией центра — наличными, картой или переводом. После оплаты сумма сразу отражается в этом приложении.",
    faq_q6: "Что такое баланс и переплата?",
    faq_a6: "Если оплатили больше, чем был долг, разница сохраняется как баланс и автоматически уменьшает следующее начисление за обучение — деньги никогда не пропадают.",
    debt_popup_title: "Есть задолженность",
    debt_popup_text: "За обучение накопился долг — {sum}. Пожалуйста, оплатите его как можно скорее — оплата принимается администрацией центра наличными, картой или переводом.",
    debt_popup_close: "Понятно",
    coins_info_title: "Как заработать GlobalCoins",
    coins_info_referral_title: "Позовите друга — 200 GC",
    coins_info_referral_text: "За каждого друга, который придёт в Global Up по вашей рекомендации и начнёт заниматься — 200 GlobalCoins. Количество друзей не ограничено — приводите сколько угодно. Скажите администрации, кто вас позвал, когда друг придёт записываться.",
    coins_info_grades_title: "Оценки и активность",
    coins_info_grades_text: "Учитель начисляет монеты за хорошие оценки и активность на занятии.",
    coins_info_attendance_title: "Посещаемость",
    coins_info_attendance_text: "За хорошую посещаемость без пропусков.",
    coins_info_achievements_title: "Успехи и достижения",
    coins_info_achievements_text: "Победы на олимпиадах, высокие баллы на тестах и другие достижения.",
  },
  en: {
    tab_home: "Home", tab_schedule: "Schedule", tab_finance: "Finance", tab_rating: "Rating", tab_shop: "Shop", tab_profile: "Profile",
    debt_label: "Outstanding balance", no_debt: "No debt", no_finance_data: "No charges yet", no_payments_yet: "No payments yet",
    mon: "Monday", tue: "Tuesday", wed: "Wednesday", thu: "Thursday", fri: "Friday", sat: "Saturday", sun: "Sunday",
    today_badge: "Today", no_lessons_day: "No lessons",
    balance: "Balance", debt: "Debt", debt_none: "No debt", debt_credit_note: "Credit for next month",
    coins: "GlobalCoins", credit_note: "Balance: {sum} — will reduce your next charge",
    progress_title: "My progress", progress_none: "No data yet",
    progress_great: "Great! Keep it up", progress_ok: "Not bad, but could be better",
    progress_bad: "Too many absences — try not to miss classes",
    trend_up: "Improving", trend_down: "Declining", trend_same: "Stable",
    lessons_attended: "lessons attended", streak_days: "in a row, no misses", avg_grade: "average grade",
    progress_homework: "homework done", progress_coins: "coins",
    homework_show_old: "Show older ({n})", homework_hide_old: "Hide older",
    no_group: "No group assigned yet", teacher_label: "Teacher",
    attendance_grades: "Attendance & grades", no_attendance: "No attendance records yet",
    homework: "Homework", no_homework: "No homework yet", open_material: "Open material",
    homework_submit: "Submit work", homework_submit_again: "Submit again",
    homework_pending: "Submitted — awaiting review", homework_reviewed: "Reviewed",
    homework_pick_photo: "Photo", homework_pick_file: "File", homework_note_placeholder: "Comment (optional)",
    homework_send: "Send", cancel: "Cancel", homework_sent: "Homework submitted", avatar_updated: "Photo updated",
    important_notice: "Important notice",
    your_balance: "Your balance", shop_empty: "Shop is empty for now", buy: "Buy", buy_confirm: "Confirm purchase?",
    next_reward_label: "Next reward:", coins_left_to_go: "{n} GC to go",
    missing_gc: "{sum} GC more needed", shop_hint: "After purchase, the admin and director see your request right away — just wait for them to hand over the reward.",
    my_orders: "My orders", order_done: "Delivered", order_pending: "Pending",
    rank_you: "you", place_label: "Your place", of_label: "of",
    contact: "Contact", contact_admin: "Message admin", contact_teacher: "Message {name}",
    logout: "Log out", payment_history: "Payment history",
    login_title: "Sign in", login_phone: "Phone number", login_password: "Password",
    login_button: "Sign in", login_error_generic: "Sign-in failed", login_remember: "After your first sign-in this device will remember you.",
    loading: "Loading…", settings: "Settings", language: "Language", theme: "Theme",
    theme_light: "Light", theme_dark: "Dark",
    month_breakdown: "Breakdown by month", discount_label: "Discount −{pct}%",
    service_section_title: "Service",
    service_support_lesson_title: "Book a support lesson",
    service_topic_reexplain_title: "Re-explain a topic",
    service_materials_only_title: "Just need materials",
    service_support_lesson_desc: "Your teacher will get the request and reach out to arrange a time.",
    service_topic_reexplain_desc: "Tell us which topic needs re-explaining — the request goes to your teacher.",
    service_materials_only_desc: "If you don't need a full lesson, just the presentation/materials on a topic.",
    service_group_label: "Subject", service_group_placeholder: "Choose a subject",
    service_topic_label: "Which topic?", service_topic_placeholder: "E.g.: past tense, topic 5",
    service_send_btn: "Send request", service_request_sent: "Request sent to your teacher",
    empty_student: "Student not found", refresh: "Refresh",
    rating_title: "Group rating", rating_subtitle: "{name} · by GlobalCoins", rank_up: "Moved up since last time", rank_down: "Moved down since last time",
    rating_no_group: "Rating will appear once a group is assigned", rating_empty: "No one in the group yet",
    avg_grade_line: "Average grade: {value}", you_suffix: " (you)",
    info_title: "Information", group_label: "Group", course_label: "Course", profile_lessons_total: "lessons attended",
    achievements_title: "Achievements",
    ach_streak: "{n} lessons in a row, no misses", ach_homework: "Homework submitted: {n}", ach_reviewed: "Homework reviewed: {n}",
    ach_grades: "Good grades: {n}", ach_coins: "{n} GC saved up",
    recent_payments: "Recent payments", teacher_fallback: "the teacher",
    identity_error: "Could not verify your identity — please reopen the app and try again.",
    order_sent: "Request sent! Wait for the admin to hand over the reward.",
    coins_awarded: "GlobalCoins awarded!", no_schedule: "not set", today_lesson_label: "You have class today", new_grade_popup: "New grade!",
    server_timeout: "The server did not respond in time — check your connection and try again.",
    server_unreachable: "No connection to server: {msg}",
    faq_title: "Questions & answers",
    faq_q1: "How are GlobalCoins awarded?",
    faq_a1: "The teacher awards coins for grades and activity in class, for good attendance without misses, for achievements, and 200 coins for every friend you refer who starts studying — see details on the home screen next to the coins balance (the «i» icon).",
    faq_q2: "What happens if I miss a class without an excused reason?",
    faq_a2: "It is marked in the attendance log, but the lesson still has to be paid for, as if you attended. Only an excused absence, marked by the teacher, is free of charge.",
    faq_q3: "What should I do if I know in advance I will miss a class due to illness or another valid reason?",
    faq_a3: "Let the teacher or the center administration know in advance, in person or via Telegram.",
    faq_q4: "How do I change or find out my login password?",
    faq_a4: "The login and password are issued by the center administration. Contact them in person or via Telegram to find out your current password or get a new one.",
    faq_q5: "How do I pay for my classes?",
    faq_a5: "Payments are accepted by the center administration, in cash, by card, or by transfer. The amount is reflected in this app right after payment.",
    faq_q6: "What is the balance / overpayment?",
    faq_a6: "If you paid more than you owed, the difference is kept as a balance and automatically reduces your next charge. The money is never lost.",
    debt_popup_title: "You have an outstanding balance",
    debt_popup_text: "There is a debt of {sum} for your classes. Please pay it as soon as possible — payments are accepted by the center administration in cash, by card, or by transfer.",
    debt_popup_close: "Got it",
    coins_info_title: "How to earn GlobalCoins",
    coins_info_referral_title: "Invite a friend — 200 GC",
    coins_info_referral_text: "For every friend who joins Global Up on your recommendation and starts studying — 200 GlobalCoins. No limit on the number of friends — invite as many as you like. Tell the administration who invited you when your friend enrolls.",
    coins_info_grades_title: "Grades and activity",
    coins_info_grades_text: "The teacher awards coins for good grades and activity in class.",
    coins_info_attendance_title: "Attendance",
    coins_info_attendance_text: "For good attendance without missing classes.",
    coins_info_achievements_title: "Achievements",
    coins_info_achievements_text: "Wins at olympiads, high test scores, and other achievements.",
  },
  uz: {
    tab_home: "Asosiy", tab_schedule: "Dars jadvali", tab_finance: "Moliya", tab_rating: "Reyting", tab_shop: "Do'kon", tab_profile: "Profil",
    debt_label: "Qarzdorlik", no_debt: "Qarz yo'q", no_finance_data: "Hozircha hisoblar yo'q", no_payments_yet: "Hozircha to'lovlar yo'q",
    mon: "Dushanba", tue: "Seshanba", wed: "Chorshanba", thu: "Payshanba", fri: "Juma", sat: "Shanba", sun: "Yakshanba",
    today_badge: "Bugun", no_lessons_day: "Dars yo'q",
    balance: "Balans", debt: "Qarz", debt_none: "Qarz yo'q", debt_credit_note: "Keyingi oyga hisobga olinadi",
    coins: "GlobalCoins", credit_note: "Balansda {sum} so'm — keyingi to'lovni kamaytiradi",
    progress_title: "Mening natijam", progress_none: "Hozircha ma'lumot yo'q",
    progress_great: "Ajoyib! Shu tarzda davom eting", progress_ok: "Yomon emas, lekin yaxshiroq bo'lishi mumkin",
    progress_bad: "Ko'p qoldirilgan darslar — darslarni qoldirmaslikka harakat qiling",
    trend_up: "O'smoqda", trend_down: "Pasaymoqda", trend_same: "Barqaror",
    lessons_attended: "dars qatnashildi", streak_days: "ketma-ket, qoldirmasdan", avg_grade: "o'rtacha baho",
    progress_homework: "vazifa topshirildi", progress_coins: "tanga",
    homework_show_old: "Eskilarini ko'rsatish ({n})", homework_hide_old: "Eskilarini yashirish",
    no_group: "Hali guruh biriktirilmagan", teacher_label: "O'qituvchi",
    attendance_grades: "Davomat va baholar", no_attendance: "Hozircha davomat belgilari yo'q",
    homework: "Uyga vazifa", no_homework: "Hozircha uyga vazifa yo'q", open_material: "Materialni ochish",
    homework_submit: "Ishni topshirish", homework_submit_again: "Yana yuborish",
    homework_pending: "Yuborildi — tekshiruv kutilmoqda", homework_reviewed: "Tekshirildi",
    homework_pick_photo: "Foto", homework_pick_file: "Fayl", homework_note_placeholder: "Izoh (ixtiyoriy)",
    homework_send: "Yuborish", cancel: "Bekor qilish", homework_sent: "Uyga vazifa yuborildi", avatar_updated: "Rasm yangilandi",
    important_notice: "Muhim xabar",
    your_balance: "Balansingiz", shop_empty: "Do'kon hozircha bo'sh", buy: "Sotib olish", buy_confirm: "Rostdan sotib olasizmi?",
    next_reward_label: "Keyingi sovg'agacha:", coins_left_to_go: "Yana kerak: {n} GC",
    missing_gc: "Yana {sum} GC kerak", shop_hint: "Xarid qilingandan so'ng ariza darhol administrator va direktorga ko'rinadi — sovg'a topshirilishini kuting.",
    my_orders: "Mening buyurtmalarim", order_done: "Topshirildi", order_pending: "Navbatda",
    rank_you: "siz", place_label: "Sizning o'rningiz", of_label: "dan",
    contact: "Bog'lanish", contact_admin: "Administratsiyaga yozish", contact_teacher: "{name}ga yozish",
    logout: "Chiqish", payment_history: "To'lovlar tarixi",
    login_title: "Tizimga kirish", login_phone: "Telefon raqami", login_password: "Parol",
    login_button: "Kirish", login_error_generic: "Kirib bo'lmadi", login_remember: "Birinchi marta kirgandan so'ng bu qurilma sizni eslab qoladi.",
    loading: "Yuklanmoqda…", settings: "Sozlamalar", language: "Til", theme: "Mavzu",
    theme_light: "Yorug'", theme_dark: "Tungi",
    month_breakdown: "Oylar bo'yicha taqsimot", discount_label: "Chegirma −{pct}%",
    service_section_title: "Xizmat",
    service_support_lesson_title: "Qo'shimcha darsga yozilish",
    service_topic_reexplain_title: "Mavzuni qayta tushuntirish",
    service_materials_only_title: "Faqat materiallar kerak",
    service_support_lesson_desc: "O'qituvchingiz so'rovni oladi va vaqt belgilash uchun bog'lanadi.",
    service_topic_reexplain_desc: "Qaysi mavzuni qayta tushuntirish kerakligini yozing — so'rov o'qituvchiga boradi.",
    service_materials_only_desc: "To'liq dars kerak bo'lmasa, faqat taqdimot/materiallar kerak bo'lsa.",
    service_group_label: "Fan", service_group_placeholder: "Fanni tanlang",
    service_topic_label: "Qaysi mavzu?", service_topic_placeholder: "Masalan: o'tgan zamon, 5-mavzu",
    service_send_btn: "So'rovni yuborish", service_request_sent: "So'rov o'qituvchiga yuborildi",
    empty_student: "O'quvchi topilmadi", refresh: "Yangilash",
    rating_title: "Guruh reytingi", rating_subtitle: "{name} · GlobalCoins bo'yicha", rank_up: "Oldingi safardan ko'tarildi", rank_down: "Oldingi safardan pasaydi",
    rating_no_group: "Guruh biriktirilgach reyting paydo bo'ladi", rating_empty: "Guruhda hali hech kim yo'q",
    avg_grade_line: "O'rtacha baho: {value}", you_suffix: " (siz)",
    info_title: "Ma'lumot", group_label: "Guruh", course_label: "Kurs", profile_lessons_total: "dars qatnashildi",
    achievements_title: "Yutuqlar",
    ach_streak: "{n} darsda ketma-ket, qoldirmasdan", ach_homework: "Topshirilgan vazifa: {n}", ach_reviewed: "Tekshirilgan vazifa: {n}",
    ach_grades: "Yaxshi baholar: {n}", ach_coins: "{n} GC to'plandi",
    recent_payments: "So'nggi to'lovlar", teacher_fallback: "o'qituvchiga",
    identity_error: "Shaxsni tasdiqlab bo'lmadi — ilovani qayta oching va yana urinib ko'ring.",
    order_sent: "Ariza yuborildi! Administrator sovg'ani topshirishini kuting.",
    coins_awarded: "GlobalCoins berildi!", no_schedule: "belgilanmagan", today_lesson_label: "Bugun darsingiz bor", new_grade_popup: "Yangi baho!",
    server_timeout: "Server javob bermadi — internetni tekshirib, qayta urinib ko'ring.",
    server_unreachable: "Server bilan aloqa yo'q: {msg}",
    faq_title: "Savol-javoblar",
    faq_q1: "GlobalCoins qanday beriladi?",
    faq_a1: "O'qituvchi darsdagi baho va faollik uchun, qoldirilmagan davomat uchun, yutuqlar uchun, shuningdek taklif qilgan har bir do'stingiz o'qishni boshlasa 200 coin beradi — batafsil bosh ekranda coin balansi yonidagi «i» belgisida.",
    faq_q2: "Uzrli sababsiz darsni qoldirsam nima bo'ladi?",
    faq_a2: "Bu davomat jurnaliga qayd etiladi, lekin dars baribir to'lanishi kerak, xuddi qatnashgandek. Faqat o'qituvchi tomonidan uzrli deb belgilangan sabab to'lovdan ozod qiladi.",
    faq_q3: "Kasallik yoki boshqa uzrli sabab bilan darsni oldindan qoldirishimni bilsam, nima qilishim kerak?",
    faq_a3: "O'qituvchi yoki markaz ma'muriyatini oldindan ogohlantiring, shaxsan yoki Telegram orqali.",
    faq_q4: "Kirish parolimni qanday o'zgartirish yoki bilish mumkin?",
    faq_a4: "Login va parolni markaz ma'muriyati beradi. Joriy parolni bilish yoki yangisini olish uchun ular bilan shaxsan yoki Telegram orqali bog'laning.",
    faq_q5: "O'qish uchun qanday to'lov qilaman?",
    faq_a5: "To'lovlar markaz ma'muriyati tomonidan qabul qilinadi: naqd pul, karta yoki o'tkazma orqali. To'lovdan so'ng summa darhol shu ilovada ko'rinadi.",
    faq_q6: "Balans va ortiqcha to'lov nima?",
    faq_a6: "Agar qarzdan ko'proq to'lasangiz, farq balans sifatida saqlanadi va keyingi to'lovni avtomatik kamaytiradi. Pul hech qachon yo'qolmaydi.",
    debt_popup_title: "Sizda qarz bor",
    debt_popup_text: "O'qish uchun {sum} qarz yig'ildi. Iltimos, imkon qadar tezroq to'lang — to'lovlar markaz ma'muriyati tomonidan naqd pul, karta yoki o'tkazma orqali qabul qilinadi.",
    debt_popup_close: "Tushunarli",
    coins_info_title: "GlobalCoins qanday topiladi",
    coins_info_referral_title: "Do'stingizni taklif qiling — 200 GC",
    coins_info_referral_text: "Sizning tavsiyangiz bilan Global Up'ga kelib o'qishni boshlagan har bir do'stingiz uchun — 200 GlobalCoins. Do'stlar soni cheklanmagan — xohlagancha taklif qiling. Do'stingiz ro'yxatdan o'tayotganda kim taklif qilganini ma'muriyatga ayting.",
    coins_info_grades_title: "Baholar va faollik",
    coins_info_grades_text: "O'qituvchi darsda yaxshi baho va faollik uchun coin beradi.",
    coins_info_attendance_title: "Davomat",
    coins_info_attendance_text: "Darslarni qoldirmasdan yaxshi davomat uchun.",
    coins_info_achievements_title: "Yutuqlar",
    coins_info_achievements_text: "Olimpiadalardagi g'alabalar, testlardan yuqori ballar va boshqa yutuqlar.",
  },
};
function translate(lang, key, vars) {
  let str = (TRANSLATIONS[lang] && TRANSLATIONS[lang][key]) || TRANSLATIONS.ru[key] || key;
  if (vars) Object.keys(vars).forEach((k) => { str = str.replace(`{${k}}`, vars[k]); });
  return str;
}
const LOCALE_OF = { ru: "ru-RU", en: "en-US", uz: "uz-Latn" };

/* ----------------------------------- App ----------------------------------- */
function tabsFor(t) {
  return [
    { key: "home", label: t("tab_home"), icon: Home },
    { key: "schedule", label: t("tab_schedule"), icon: Calendar },
    { key: "rating", label: t("tab_rating"), icon: Trophy },
    { key: "shop", label: t("tab_shop"), icon: ShoppingBag },
    { key: "profile", label: t("tab_profile"), icon: User },
  ];
}

export default function ParentApp() {
  const [phase, setPhase] = useState("loading");
  const [errorMsg, setErrorMsg] = useState("");
  const [students, setStudents] = useState([]);
  const [shopItems, setShopItems] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [initData, setInitData] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [tab, setTab] = useState("home");
  const [redeeming, setRedeeming] = useState(false);
  const [toast, setToast] = useState("");
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [coinGain, setCoinGain] = useState(null); // { amount } — показывает конфетти, когда монеты выросли
  const lastCoinsRef = useRef({}); // studentId -> последний известный баланс монет

  // Язык и тема — выбор запоминается на этом устройстве
  const [lang, setLang] = useState(() => { try { return localStorage.getItem("gu_lang") || "ru"; } catch { return "ru"; } });
  const [theme, setTheme] = useState(() => { try { return localStorage.getItem("gu_theme") || "light"; } catch { return "light"; } });
  const t = (key, vars) => translate(lang, key, vars);
  const changeLang = (l) => { setLang(l); try { localStorage.setItem("gu_lang", l); } catch {} };
  const changeTheme = (th) => { setTheme(th); try { localStorage.setItem("gu_theme", th); } catch {} };

  // Оборачивает setStudents: сравнивает баланс монет каждого ученика с прошлым разом
  // и, если он вырос (учитель/админ начислил), показывает конфетти с количеством монет.
  // Так же отслеживаем появление новой хорошей оценки (4 или 5) — если поставили только что,
  // а не просто пришли исторические данные при первой загрузке (lastGradeCountRef ещё не задан).
  const lastGradeCountRef = useRef({});
  const applyStudents = (nextStudents) => {
    let gained = 0;
    let newGrade = null;
    (nextStudents || []).forEach((s) => {
      const prev = lastCoinsRef.current[s.id];
      if (prev !== undefined && s.coins > prev) gained += s.coins - prev;
      lastCoinsRef.current[s.id] = s.coins;

      const goodGrades = (s.attendanceLog || []).filter((r) => r.grade >= 4);
      const latestGrade = [...goodGrades].sort((a, b) => new Date(b.date) - new Date(a.date))[0];
      const prevCount = lastGradeCountRef.current[s.id];
      if (prevCount !== undefined && goodGrades.length > prevCount && latestGrade) newGrade = latestGrade.grade;
      lastGradeCountRef.current[s.id] = goodGrades.length;
    });
    if (gained > 0) setCoinGain({ amount: gained });
    else if (newGrade) setCoinGain({ grade: newGrade });
    setStudents(nextStudents || []);
  };

  const loadWithCreds = async (data0, phoneVal, passwordVal) => {
    try {
      const data = phoneVal ? await fetchMyData(data0, phoneVal, passwordVal) : await fetchMyData(data0);
      if (data.error) {
        const full = data.debug ? `${data.error} — ${JSON.stringify(data.debug)}` : data.error;
        if (phoneVal) { setLoginError(full); setPhase("not_linked"); return; }
        setErrorMsg(full); setPhase("error"); return;
      }
      if (!data.linked) {
        if (phoneVal) setLoginError(data.loginError || `Диагностика: ${JSON.stringify(data)}`);
        setPhase("not_linked");
        return;
      }
      applyStudents(data.students);
      setShopItems(data.shopItems || []);
      setActiveId(data.students[0]?.id || null);
      setPhase("ready");
      if (phoneVal && passwordVal) {
        storageSet("gu_phone", phoneVal); storageSet("gu_password", passwordVal);
      }
    } catch (e) {
      setErrorMsg(String(e?.message || e));
      setPhase("error");
    }
  };

  const [refreshing, setRefreshing] = useState(false);
  const pendingMutationsRef = useRef(0); // считает, идёт ли сейчас отправка ДЗ или покупка в магазине
  const lastMutationAppliedRef = useRef(0); // увеличивается каждый раз, когда такое действие реально применило новые данные
  const silentRefresh = async () => {
    if (phase !== "ready") return;
    setRefreshing(true);
    // Запоминаем "версию" действий ДО отправки запроса — если пока он летит, успеет применится
    // отправка ДЗ или покупка, этот снимок может быть сделан раньше них и уже устарел.
    const mutationVersionAtStart = lastMutationAppliedRef.current;
    try {
      const data = await fetchMyData(initData, phone.trim() || null, password.trim() || null);
      if (pendingMutationsRef.current > 0) return; // есть незавершённое действие — не затираем его своим (возможно устаревшим) снимком
      if (lastMutationAppliedRef.current !== mutationVersionAtStart) return; // за время ожидания уже применилось действие — пропускаем устаревший снимок
      if (!data.error && data.linked) {
        applyStudents(data.students);
        setShopItems(data.shopItems || []);
      }
    } finally {
      setRefreshing(false);
    }
  };

  // "Потянуть вниз, чтобы обновить" — привычный мобильный жест. Работает только если страница
  // уже прокручена ровно до самого верха (иначе это просто обычная прокрутка контента).
  const [pullDistance, setPullDistance] = useState(0);
  const pullStartYRef = useRef(null);
  const PULL_THRESHOLD = 64;
  useEffect(() => {
    const onTouchStart = (e) => {
      if (window.scrollY <= 0 && phase === "ready") pullStartYRef.current = e.touches[0].clientY;
    };
    const onTouchMove = (e) => {
      if (pullStartYRef.current === null) return;
      const diff = e.touches[0].clientY - pullStartYRef.current;
      if (diff > 0 && window.scrollY <= 0) setPullDistance(Math.min(diff * 0.5, PULL_THRESHOLD * 1.4));
      else { pullStartYRef.current = null; setPullDistance(0); }
    };
    const onTouchEnd = () => {
      if (pullStartYRef.current !== null && pullDistance >= PULL_THRESHOLD) {
        haptic("light");
        silentRefresh();
      }
      pullStartYRef.current = null;
      setPullDistance(0);
    };
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => {
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [pullDistance, phase]);

  useEffect(() => {
    // Запрещаем зум страницы (иначе на iPhone/Android при определённых жестах или при фокусе
    // на поле ввода экран мог неожиданно "приближаться" и увеличиваться) — правим тег viewport
    // прямо здесь в коде, чтобы не зависеть от отдельного файла index.html.
    let viewportTag = document.querySelector('meta[name="viewport"]');
    if (!viewportTag) {
      viewportTag = document.createElement("meta");
      viewportTag.name = "viewport";
      document.head.appendChild(viewportTag);
    }
    viewportTag.content = "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover";

    const tg = window.Telegram?.WebApp;
    if (tg) {
      tg.ready();
      tg.expand();
      if (tg.setHeaderColor) try { tg.setHeaderColor("#F7F5F0"); } catch {}
      if (tg.setBackgroundColor) try { tg.setBackgroundColor("#F7F5F0"); } catch {}
    }
    const data0 = tg?.initData || "";
    setInitData(data0);
    (async () => {
      // Сначала пробуем без пароля (сработает, если Telegram уже привязан).
      const first = await fetchMyData(data0);
      if (first.linked) {
        applyStudents(first.students);
        setShopItems(first.shopItems || []);
        setActiveId(first.students[0]?.id || null);
        setPhase("ready");
        return;
      }
      // Не привязан — пробуем логин/пароль, сохранённые с прошлого раза на этом устройстве.
      const savedPhone = await storageGet("gu_phone");
      const savedPassword = await storageGet("gu_password");
      if (savedPhone && savedPassword) {
        setPhone(savedPhone); setPassword(savedPassword);
        await loadWithCreds(data0, savedPhone, savedPassword);
        return;
      }
      setPhase("not_linked");
    })();
  }, []);

  // Обновляем данные сами: когда приложение снова становится видимым и каждые 25 секунд, пока открыто.
  useEffect(() => {
    const onVisible = () => { if (document.visibilityState === "visible") silentRefresh(); };
    document.addEventListener("visibilitychange", onVisible);
    const interval = setInterval(() => silentRefresh(), 25000);
    return () => { document.removeEventListener("visibilitychange", onVisible); clearInterval(interval); };
  }, [phase, initData, phone, password]);

  const handleLogin = async () => {
    if (!phone.trim() || !password.trim()) return;
    setLoginError("");
    setLoginLoading(true);
    try {
      await loadWithCreds(initData, phone.trim(), password.trim());
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    setStudents([]);
    lastCoinsRef.current = {};
    lastGradeCountRef.current = {};
    setPhone(""); setPassword(""); setLoginError("");
    storageRemove("gu_phone"); storageRemove("gu_password");
    setPhase("not_linked");
  };

  const student = students.find((s) => s.id === activeId);

  const handleRedeem = async (itemId) => {
    if (!student) return;
    setRedeeming(true);
    pendingMutationsRef.current++;
    try {
      const data = await fetchMyData(initData, phone.trim() || null, password.trim() || null, itemId, student.id);
      if (data.error) { haptic("error"); setToast(data.error); setTimeout(() => setToast(""), 3000); return; }
      if (!data.linked) { haptic("error"); setToast(t("identity_error")); setTimeout(() => setToast(""), 4000); return; }
      if (data.redeemed) {
        applyStudents(data.students);
        lastMutationAppliedRef.current++;
        haptic("success");
        setToast(t("order_sent"));
        setTimeout(() => setToast(""), 3500);
      }
    } finally {
      pendingMutationsRef.current--;
      setRedeeming(false);
    }
  };

  const handleSubmitHomework = async ({ groupId, materialId, note, fileList }) => {
    if (!student) return { ok: false };
    pendingMutationsRef.current++;
    try {
      const files = [];
      for (const f of fileList || []) files.push(await fileToUploadPayload(f));
      const data = await submitHomeworkRequest(initData, phone.trim() || null, password.trim() || null, {
        studentId: student.id, groupId, materialId, note, files,
      });
      if (data.error) { haptic("error"); setToast(data.error); setTimeout(() => setToast(""), 3500); return { ok: false }; }
      if (!data.linked) { haptic("error"); setToast(t("identity_error")); setTimeout(() => setToast(""), 4000); return { ok: false }; }
      if (data.submitted) {
        applyStudents(data.students);
        lastMutationAppliedRef.current++;
        haptic("success");
        setToast(t("homework_sent"));
        setTimeout(() => setToast(""), 3000);
        return { ok: true };
      }
      return { ok: false };
    } catch (e) {
      setToast(t("server_unreachable", { msg: String(e?.message || e) }));
      setTimeout(() => setToast(""), 3500);
      return { ok: false };
    } finally {
      pendingMutationsRef.current--;
    }
  };

  const handleUpdateAvatar = async (file) => {
    if (!student) return { ok: false };
    pendingMutationsRef.current++;
    try {
      const dataBase64 = await imageFileToAvatarPayload(file);
      const data = await updateAvatarRequest(initData, phone.trim() || null, password.trim() || null, {
        studentId: student.id, dataBase64,
      });
      if (data.error) { haptic("error"); setToast(data.error); setTimeout(() => setToast(""), 3500); return { ok: false }; }
      if (!data.linked) { haptic("error"); setToast(t("identity_error")); setTimeout(() => setToast(""), 4000); return { ok: false }; }
      if (data.avatarUpdated) {
        applyStudents(data.students);
        lastMutationAppliedRef.current++;
        haptic("success");
        setToast(t("avatar_updated"));
        setTimeout(() => setToast(""), 3000);
        return { ok: true };
      }
      return { ok: false };
    } catch (e) {
      setToast(t("server_unreachable", { msg: String(e?.message || e) }));
      setTimeout(() => setToast(""), 3500);
      return { ok: false };
    } finally {
      pendingMutationsRef.current--;
    }
  };

  const handleRequestService = async (type, groupId, topic) => {
    if (!student) return false;
    pendingMutationsRef.current++;
    try {
      const data = await requestServiceRequest(initData, phone.trim() || null, password.trim() || null, {
        studentId: student.id, groupId, type, topic,
      });
      if (data.error) { haptic("error"); setToast(data.error); setTimeout(() => setToast(""), 3500); return false; }
      if (!data.linked) { haptic("error"); setToast(t("identity_error")); setTimeout(() => setToast(""), 4000); return false; }
      if (data.requestSent) {
        applyStudents(data.students);
        haptic("success");
        setToast(t("service_request_sent"));
        setTimeout(() => setToast(""), 3500);
        return true;
      }
      return false;
    } catch (e) {
      setToast(t("server_unreachable", { msg: String(e?.message || e) }));
      setTimeout(() => setToast(""), 3500);
      return false;
    } finally {
      pendingMutationsRef.current--;
    }
  };

  if (phase === "loading") {
    return (
      <div className={`theme-${theme} min-h-screen pb-10`} style={{ background: PAPER }}>
        <style>{FONT_IMPORT}</style>
        <style>{THEME_VARS}</style>
        <style>{`@keyframes skeletonPulse { 0%,100% { opacity: 0.55; } 50% { opacity: 1; } }`}</style>
        <div className="px-4 pt-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full" style={{ background: "var(--surface-alt)", animation: "skeletonPulse 1.3s ease-in-out infinite" }} />
            <div className="flex-1">
              <div className="h-3.5 w-32 rounded-full" style={{ background: "var(--surface-alt)", animation: "skeletonPulse 1.3s ease-in-out infinite" }} />
              <div className="h-2.5 w-20 rounded-full mt-1.5" style={{ background: "var(--surface-alt)", animation: "skeletonPulse 1.3s ease-in-out infinite" }} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-5">
            <div className="h-24 rounded-3xl" style={{ background: "var(--surface-alt)", animation: "skeletonPulse 1.3s ease-in-out infinite" }} />
            <div className="h-24 rounded-3xl" style={{ background: "var(--surface-alt)", animation: "skeletonPulse 1.3s ease-in-out infinite" }} />
          </div>
          <div className="h-28 rounded-3xl mt-3" style={{ background: "var(--surface-alt)", animation: "skeletonPulse 1.3s ease-in-out infinite" }} />
          <div className="h-40 rounded-3xl mt-3" style={{ background: "var(--surface-alt)", animation: "skeletonPulse 1.3s ease-in-out infinite" }} />
          <div className="h-32 rounded-3xl mt-3" style={{ background: "var(--surface-alt)", animation: "skeletonPulse 1.3s ease-in-out infinite" }} />
        </div>
      </div>
    );
  }

  if (phase === "error") {
    return (
      <div className={`theme-${theme} min-h-screen flex items-center justify-center p-4`} style={{ background: PAPER, color: INK }}>
        <style>{FONT_IMPORT}</style>
        <style>{THEME_VARS}</style>
        <div className="max-w-sm text-center">
          <XCircle size={30} className="mx-auto mb-2" style={{ color: BRICK }} />
          <p className="text-[14px] font-bold mb-1.5">{t("login_error_generic")}</p>
          <p className="text-[12.5px] opacity-55 break-words">{errorMsg}</p>
        </div>
      </div>
    );
  }

  if (phase === "not_linked") {
    return <LoginScreen phone={phone} setPhone={setPhone} password={password} setPassword={setPassword} loginError={loginError} loginLoading={loginLoading} onLogin={handleLogin} lang={lang} changeLang={changeLang} theme={theme} changeTheme={changeTheme} t={t} />;
  }

  return (
    <div className={`theme-${theme} min-h-screen anim-fade pb-24`} style={{ background: PAPER, color: INK }}>
      <style>{FONT_IMPORT}</style>
      <style>{THEME_VARS}</style>

      {coinGain && <ConfettiOverlay amount={coinGain.amount} grade={coinGain.grade} onDone={() => setCoinGain(null)} t={t} />}

      {pullDistance > 0 && (
        <div className="fixed top-0 left-0 right-0 flex justify-center z-40 pointer-events-none" style={{ paddingTop: 10, opacity: Math.min(1, pullDistance / 40) }}>
          <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "var(--surface)", boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}>
            <RefreshCw size={15} style={{ color: RED, transform: `rotate(${pullDistance * 4}deg)`, opacity: pullDistance >= PULL_THRESHOLD ? 1 : 0.5 }} />
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed top-4 left-4 right-4 z-50 px-4 py-3 rounded-2xl text-[13px] font-medium text-white text-center" style={{ background: RED_D, boxShadow: "0 4px 16px rgba(0,0,0,0.2)" }}>
          {toast}
        </div>
      )}

      <div className="px-4 pt-5 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Avatar name={student?.name || "?"} size={38} avatarUrl={student?.avatarUrl} />
          <div>
            <div className="text-[15px] font-bold leading-none">{student?.name}</div>
            <div className="text-[11.5px] opacity-45 mt-1">{student?.group?.name || "Global Up"}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {student?.logoUrl && (
            <img src={student.logoUrl} alt="Global Up" className="w-9 h-9 rounded-full object-cover shrink-0" style={{ border: `1px solid ${LINE}` }} />
          )}
          <div className="relative">
            <button onClick={() => setLangMenuOpen((v) => !v)} className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-[16px] active:scale-90 transition-transform" style={{ background: "var(--surface)", border: `1px solid ${LINE}` }}>
              {LANG_FLAGS[lang]}
            </button>
            {langMenuOpen && (
              <>
                <button aria-label="close" className="fixed inset-0 z-30 cursor-default" onClick={() => setLangMenuOpen(false)} />
                <div className="absolute right-0 mt-2 p-2 rounded-2xl z-40" style={{ background: "var(--surface)", boxShadow: "0 8px 24px rgba(0,0,0,0.18)", border: `1px solid ${LINE}` }}>
                  <div className="flex items-center gap-1 mb-1.5">
                    {["ru", "en", "uz"].map((l) => (
                      <button key={l} onClick={() => { changeLang(l); }} className="w-9 h-9 rounded-full flex items-center justify-center text-[16px] transition-all duration-150" style={{ background: lang === l ? "var(--surface-alt)" : "transparent", transform: lang === l ? "scale(1.08)" : "scale(1)" }}>
                        {LANG_FLAGS[l]}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-1 pt-1.5" style={{ borderTop: `1px solid ${LINE}` }}>
                    <button onClick={() => changeTheme("light")} className="flex-1 text-[11px] font-medium py-1.5 rounded-full flex items-center justify-center gap-1" style={{ background: theme === "light" ? "var(--surface-alt)" : "transparent" }}>☀️</button>
                    <button onClick={() => changeTheme("dark")} className="flex-1 text-[11px] font-medium py-1.5 rounded-full flex items-center justify-center gap-1" style={{ background: theme === "dark" ? "var(--surface-alt)" : "transparent" }}>🌙</button>
                  </div>
                </div>
              </>
            )}
          </div>
          <button onClick={silentRefresh} disabled={refreshing} className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 active:scale-90 transition-transform" style={{ background: "var(--surface)", border: `1px solid ${LINE}` }} title={t("refresh")}>
            <RefreshCw size={15} style={{ animation: refreshing ? "spin 0.7s linear infinite" : "none" }} />
          </button>
          {students.length > 1 && (
            <select value={activeId} onChange={(e) => setActiveId(e.target.value)} className="text-[12px] font-medium px-2.5 py-1.5 rounded-full outline-none" style={{ background: "var(--surface)", border: `1px solid ${LINE}`, color: "var(--ink)" }}>
              {students.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          )}
        </div>
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      {!student ? (
        <div className="px-4"><EmptyState text={t("empty_student")} /></div>
      ) : (
        <div className="px-4">
          {tab === "home" && <HomeTab student={student} notifications={student.notifications || []} t={t} lang={lang} onSubmitHomework={handleSubmitHomework} onRequestService={handleRequestService} />}
          {tab === "schedule" && <ScheduleTab student={student} t={t} lang={lang} />}
          {tab === "rating" && <RatingTab student={student} t={t} />}
          {tab === "shop" && <ShopTab student={student} shopItems={shopItems} onRedeem={handleRedeem} redeeming={redeeming} t={t} lang={lang} />}
          {tab === "profile" && <ProfileTab student={student} onLogout={handleLogout} t={t} lang={lang} changeLang={changeLang} theme={theme} changeTheme={changeTheme} onUpdateAvatar={handleUpdateAvatar} />}
        </div>
      )}

      {/* Нижняя навигация */}
      <div className="fixed bottom-0 left-0 right-0 px-3 pb-3 pt-2 z-20" style={{ background: "linear-gradient(to top, var(--paper) 75%, rgba(0,0,0,0))" }}>
        <div className="flex items-center justify-around rounded-3xl px-1.5 py-1.5" style={{ background: "var(--surface)", boxShadow: "0 8px 28px rgba(26,26,23,0.14)", border: "1px solid var(--line)", backdropFilter: "blur(12px)" }}>
          {tabsFor(t).map((tabItem) => {
            const active = tab === tabItem.key;
            return (
              <button key={tabItem.key} onClick={() => { haptic("light"); setTab(tabItem.key); }} className="flex-1 flex flex-col items-center gap-1 py-3 rounded-2xl transition-all duration-150 active:scale-95" style={{ background: active ? RED_L : "transparent" }}>
                <tabItem.icon size={18} style={{ color: active ? RED_D : "#9C9A90", opacity: active ? 1 : 0.7 }} />
                <span className="text-[10px] font-semibold" style={{ color: active ? RED_D : "#9C9A90" }}>{tabItem.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
