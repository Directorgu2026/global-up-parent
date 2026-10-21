import React, { useState, useEffect, useRef, useMemo } from "react";
import { createPortal } from "react-dom";
import {
  Home, Trophy, ShoppingBag, User, Calendar, MapPin, CheckCircle2, XCircle, Clock,
  FileText, Link2, Wallet, Coins as CoinsIcon, PartyPopper, Megaphone, Flame,
  Award, Medal, TrendingUp, TrendingDown, Minus, LogOut, RefreshCw, Eye, EyeOff, Gift, GraduationCap, Phone, PiggyBank, Info, Users, X,
  Upload, Paperclip, Loader2, MessageCircle, Image as ImageIcon, ChevronDown as ChevronDownIcon, Camera, LifeBuoy,
} from "lucide-react";

/* ----------------------- Иконки, встроенные прямо в файл -----------------------
   Новые иконки (добавленные при смене дизайна) нарисованы здесь же, а не берутся из пакета
   lucide-react. Причина: в разных версиях пакета часть иконок называется по-разному или
   отсутствует — тогда Vercel не может собрать сайт и на телефоне остаётся старая версия.
   Эти иконки — те же самые рисунки Lucide (лицензия ISC), просто без зависимости от версии пакета. */
const ICON_NODES = {
  BookOpen: [["path",{"d":"M12 7v14"}],["path",{"d":"M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"}]],
  ClipboardList: [["rect",{"width":"8","height":"4","x":"8","y":"2","rx":"1","ry":"1"}],["path",{"d":"M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"}],["path",{"d":"M12 11h4"}],["path",{"d":"M12 16h4"}],["path",{"d":"M8 11h.01"}],["path",{"d":"M8 16h.01"}]],
  Bell: [["path",{"d":"M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"}],["path",{"d":"M10.3 21a1.94 1.94 0 0 0 3.4 0"}]],
  Globe: [["circle",{"cx":"12","cy":"12","r":"10"}],["path",{"d":"M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"}],["path",{"d":"M2 12h20"}]],
  AlertTriangle: [["path",{"d":"m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"}],["path",{"d":"M12 9v4"}],["path",{"d":"M12 17h.01"}]],
  Lock: [["rect",{"width":"18","height":"11","x":"3","y":"11","rx":"2","ry":"2"}],["path",{"d":"M7 11V7a5 5 0 0 1 10 0v4"}]],
  Bot: [["path",{"d":"M12 8V4H8"}],["rect",{"width":"16","height":"12","x":"4","y":"8","rx":"2"}],["path",{"d":"M2 14h2"}],["path",{"d":"M20 14h2"}],["path",{"d":"M15 13v2"}],["path",{"d":"M9 13v2"}]],
  Lightbulb: [["path",{"d":"M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"}],["path",{"d":"M9 18h6"}],["path",{"d":"M10 22h4"}]],
  Pin: [["path",{"d":"M12 17v5"}],["path",{"d":"M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z"}]],
  MessageSquare: [["path",{"d":"M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"}]],
  Pencil: [["path",{"d":"M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"}],["path",{"d":"m15 5 4 4"}]],
  RotateCcw: [["path",{"d":"M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"}],["path",{"d":"M3 3v5h5"}]],
  Sun: [["circle",{"cx":"12","cy":"12","r":"4"}],["path",{"d":"M12 2v2"}],["path",{"d":"M12 20v2"}],["path",{"d":"m4.93 4.93 1.41 1.41"}],["path",{"d":"m17.66 17.66 1.41 1.41"}],["path",{"d":"M2 12h2"}],["path",{"d":"M20 12h2"}],["path",{"d":"m6.34 17.66-1.41 1.41"}],["path",{"d":"m19.07 4.93-1.41 1.41"}]],
  Moon: [["path",{"d":"M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"}]],
  Star: [["path",{"d":"M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"}]],
  Ban: [["circle",{"cx":"12","cy":"12","r":"10"}],["path",{"d":"m4.9 4.9 14.2 14.2"}]],
  DoorOpen: [["path",{"d":"M13 4h3a2 2 0 0 1 2 2v14"}],["path",{"d":"M2 20h3"}],["path",{"d":"M13 20h9"}],["path",{"d":"M10 12v.01"}],["path",{"d":"M13 4.562v16.157a1 1 0 0 1-1.242.97L5 20V5.562a2 2 0 0 1 1.515-1.94l4-1A2 2 0 0 1 13 4.561Z"}]],
  Hourglass: [["path",{"d":"M5 22h14"}],["path",{"d":"M5 2h14"}],["path",{"d":"M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22"}],["path",{"d":"M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2"}]],
  Search: [["circle",{"cx":"11","cy":"11","r":"8"}],["path",{"d":"m21 21-4.3-4.3"}]],
  Receipt: [["path",{"d":"M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"}],["path",{"d":"M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"}],["path",{"d":"M12 17.5v-11"}]],
  CreditCard: [["rect",{"width":"20","height":"14","x":"2","y":"5","rx":"2"}],["line",{"x1":"2","x2":"22","y1":"10","y2":"10"}]],
  BarChart3: [["path",{"d":"M3 3v16a2 2 0 0 0 2 2h16"}],["path",{"d":"M18 17V9"}],["path",{"d":"M13 17V5"}],["path",{"d":"M8 17v-3"}]],
  Dumbbell: [["path",{"d":"M14.4 14.4 9.6 9.6"}],["path",{"d":"M18.657 21.485a2 2 0 1 1-2.829-2.828l-1.767 1.768a2 2 0 1 1-2.829-2.829l6.364-6.364a2 2 0 1 1 2.829 2.829l-1.768 1.767a2 2 0 1 1 2.828 2.829z"}],["path",{"d":"m21.5 21.5-1.4-1.4"}],["path",{"d":"M3.9 3.9 2.5 2.5"}],["path",{"d":"M6.404 12.768a2 2 0 1 1-2.829-2.829l1.768-1.767a2 2 0 1 1-2.828-2.829l2.828-2.828a2 2 0 1 1 2.829 2.828l1.767-1.768a2 2 0 1 1 2.829 2.829z"}]],
  ChevronRight: [["path",{"d":"m9 18 6-6-6-6"}]],
  ChevronLeft: [["path",{"d":"m15 18-6-6 6-6"}]],
  Check: [["path",{"d":"M20 6 9 17l-5-5"}]],
};
function makeIcon(nodes) {
  return function Icon({ size = 24, strokeWidth = 2, color = "currentColor", fill = "none", className = "", style, ...rest }) {
    return React.createElement(
      "svg",
      { xmlns: "http://www.w3.org/2000/svg", width: size, height: size, viewBox: "0 0 24 24", fill, stroke: color, strokeWidth, strokeLinecap: "round", strokeLinejoin: "round", className, style, "aria-hidden": true, ...rest },
      nodes.map(([tag, attr], i) => React.createElement(tag, { key: i, ...attr }))
    );
  };
}
const {
  BookOpen, ClipboardList, Bell, Globe, AlertTriangle, Lock, Bot, Lightbulb, Pin, MessageSquare, Pencil, RotateCcw,
  Sun, Moon, Star, Ban, DoorOpen, Hourglass, Search, Receipt, CreditCard, BarChart3, Dumbbell, ChevronRight, ChevronLeft, Check,
} = Object.fromEntries(Object.entries(ICON_NODES).map(([name, nodes]) => [name, makeIcon(nodes)]));

/* ------------------------------ Настройка ------------------------------ */
// Номер версии приложения — виден внизу вкладки «Профиль». По нему легко проверить, что обновление дошло.
const APP_VERSION = "v20";
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
const LANG_FLAGS = { ru: "RU", en: "EN", uz: "UZ" }; // коды языков вместо флажков-эмодзи
const RED_D = "#991B1B";
const RED_L = "#FEE2E2";
const GOLD = "#EAB308";
const BRICK = "#EA580C";
const GREEN = "#16A34A";
const GREEN_D = "#15803D";
const BLUE = "#2563EB";
const PURPLE = "#7C3AED";
const LINE = "var(--line)";
// «Стеклянные» круглые кнопки на красной шапке.
const GLASS_BTN = { background: "rgba(255,255,255,0.16)", border: "1px solid rgba(255,255,255,0.24)", color: "#fff", backdropFilter: "blur(8px)" };

const THEME_VARS = `
  html, body {
    touch-action: pan-x pan-y;
    -webkit-text-size-adjust: 100%;
    text-size-adjust: 100%;
    overscroll-behavior-y: contain;
  }
  input, textarea, select { font-size: 16px !important; }
  .theme-light {
    --paper: #F5F4F0; --ink: #1C1B18; --ink-2: #6B6960; --ink-3: #A19F95; --ink-sub: #ABA99F; --line: #EFEDE7; --surface: #FFFFFF;
    --surface-soft: #F6F7FB; --surface-alt: #EEEEE8;
    --soft-red-bg: #FEE2E2; --soft-red-fg: #991B1B;
    --soft-yellow-bg: #FEF9C3; --soft-yellow-bg-2: #FFFBEB; --soft-yellow-border: #FEF3C7; --soft-yellow-fg: #854D0E;
    --soft-green-bg: #DCFCE7; --soft-green-fg: #15803D;
    --soft-blue-bg: #DBEAFE; --soft-blue-fg: #1D4ED8;
    --soft-purple-bg: #EDE9FE; --soft-purple-bg-2: #EEECFD; --soft-purple-fg: #5B21B6;
    --soft-orange-bg: #FFF7ED; --notice-border: #FDE68A;
  }
  .theme-dark {
    --paper: #16171C; --ink: #F1F0EA; --ink-2: #A9A8A0; --ink-3: #75746D; --ink-sub: #7A7972; --line: #2C2D33; --surface: #202127;
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

async function submitQuizRequest(initData, phone, password, submitQuiz) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);
  let curLang = "ru";
  try { curLang = localStorage.getItem("gu_lang") || "ru"; } catch {}
  try {
    const res = await fetch(EDGE_FUNCTION_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", apikey: ANON_KEY, Authorization: `Bearer ${ANON_KEY}` },
      body: JSON.stringify({ initData, phone, password, submitQuiz }),
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
function ProgressRing({ pct, size = 108, ringColor, track = "rgba(255,255,255,0.6)", stroke = 11 }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (Math.max(0, Math.min(100, pct)) / 100) * c;
  const color = ringColor || (pct >= 90 ? GREEN_D : pct >= 75 ? GOLD : pct >= 50 ? BRICK : RED_D);
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} stroke={track} strokeWidth={stroke} fill="none" />
        <circle cx={size / 2} cy={size / 2} r={r} stroke={color} strokeWidth={stroke} fill="none" strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round" style={{ transition: "stroke-dashoffset 0.6s ease" }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-extrabold" style={{ color, fontSize: Math.round(size * 0.22) }}>{pct}%</span>
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
  // Считаем ЗАКРЫТЫЕ ДЗ (сдано и, если был мини-тест, тест сдан). Для старых записей без поля closed — как раньше, по факту сдачи.
  const submittedMaterialIds = new Set(homework.filter((h) => h.closed !== false).map((h) => h.materialId).filter(Boolean));
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

  const attendanceBar = attendancePct ?? 0;
  const tiles = [
    { icon: Calendar, tile: "var(--soft-green-bg)", fg: GREEN_D, value: <>{present}<span className="text-[11px] font-semibold opacity-45">/{total}</span></>, label: t("lessons_attended"), bar: attendanceBar },
    { icon: Star, tile: "var(--soft-yellow-bg)", fg: "#B45309", value: avgGrade != null ? avgGrade.toFixed(1) : "—", label: t("avg_grade"), bar: gradePct ?? 0 },
    { icon: BookOpen, tile: "var(--soft-purple-bg)", fg: PURPLE, value: homeworkPct != null ? `${homeworkPct}%` : "—", label: t("progress_homework"), bar: homeworkPct ?? 0 },
  ];
  return (
    <div className="rounded-[26px] p-4" style={{ background: "var(--surface)", boxShadow: "0 6px 20px rgba(26,26,23,0.07)" }}>
      <div className="flex items-center gap-3.5">
        <ProgressRing pct={pct} ringColor={zoneColors.ring} track="var(--surface-alt)" size={76} stroke={9} />
        <div className="min-w-0 flex-1">
          <h3 className="text-[15px] font-extrabold flex items-center gap-1.5">{t("progress_title")}</h3>
          <p className="text-[12.5px] font-bold leading-snug mt-0.5" style={{ color: zoneColors.text }}>{zoneColors.label}</p>
          <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
            {trend && (
              <span className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full" style={{ background: trend === "up" ? "var(--soft-green-bg)" : trend === "down" ? "var(--soft-red-bg)" : "var(--surface-alt)", color: trend === "up" ? GREEN_D : trend === "down" ? RED_D : "var(--ink)" }}>
                {trend === "up" ? <TrendingUp size={12} /> : trend === "down" ? <TrendingDown size={12} /> : <Minus size={12} />}
                {trend === "up" ? t("trend_up") : trend === "down" ? t("trend_down") : t("trend_same")}
              </span>
            )}
            {streak > 0 && <span className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full" style={{ background: "var(--soft-orange-bg)", color: BRICK }}><Flame size={12} />{streak} · {t("streak_days")}</span>}
            <span className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full" style={{ background: "var(--soft-yellow-bg)", color: "var(--soft-yellow-fg)" }}><CoinsIcon size={12} />{coins} · {t("progress_coins")}</span>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 mt-3.5">
        {tiles.map((x, i) => (
          <div key={i} className="rounded-[18px] p-2.5" style={{ background: "var(--surface-soft)" }}>
            <div className="w-7 h-7 rounded-[9px] flex items-center justify-center" style={{ background: x.tile }}><x.icon size={15} style={{ color: x.fg }} /></div>
            <div className="text-[17px] font-black leading-none mt-2">{x.value}</div>
            <div className="text-[10px] opacity-55 mt-1 leading-tight min-h-[24px]">{x.label}</div>
            <div className="h-1 rounded-full mt-1.5 overflow-hidden" style={{ background: "var(--surface-alt)" }}><div className="h-full rounded-full" style={{ width: `${Math.max(0, Math.min(100, x.bar))}%`, background: x.fg }} /></div>
          </div>
        ))}
      </div>
    </div>
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
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-5" style={{ background: "rgba(0,0,0,0.45)", paddingTop: "var(--gu-safe-top, 0px)" }} onClick={onClose}>
      <div className="anim-pop w-full sm:max-w-sm rounded-t-3xl sm:rounded-3xl p-6" style={{ background: "var(--surface)", paddingBottom: "calc(24px + var(--gu-safe-bottom, 0px))" }} onClick={(e) => e.stopPropagation()}>
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
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-5" style={{ background: "rgba(0,0,0,0.45)", paddingTop: "var(--gu-safe-top, 0px)" }} onClick={onClose}>
      <div className="anim-pop w-full sm:max-w-sm rounded-t-3xl sm:rounded-3xl p-6 max-h-[85vh] overflow-y-auto" style={{ background: "var(--surface)", paddingBottom: "calc(24px + var(--gu-safe-bottom, 0px))" }} onClick={(e) => e.stopPropagation()}>
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-5" style={{ background: "rgba(0,0,0,0.45)", paddingTop: "var(--gu-safe-top, 0px)", paddingBottom: "var(--gu-safe-bottom, 0px)" }} onClick={onClose}>
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
            <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center" style={{ background: "var(--soft-yellow-bg)" }}><Star size={34} fill={GOLD} style={{ color: GOLD }} /></div>
            <div className="text-[30px] font-extrabold mt-2" style={{ color: GREEN_D }}>{grade}</div>
            <div className="text-[13px] opacity-50 mt-1.5">{t ? t("new_grade_popup") : "Новая оценка!"}</div>
          </>
        ) : (
          <>
            <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center" style={{ background: "var(--soft-yellow-bg)" }}><CoinsIcon size={34} style={{ color: "#B45309" }} /></div>
            <div className="text-[30px] font-extrabold mt-2" style={{ color: "#B45309" }}>+{amount} GC</div>
            <div className="text-[13px] opacity-50 mt-1.5">{t ? t("coins_awarded") : "Начислены GlobalCoins!"}</div>
          </>
        )}
      </div>
      <style>{`@keyframes confettiFall { to { transform: translateY(115vh) rotate(720deg); opacity: 0.4; } }`}</style>
    </div>
  );
}

// ----------------------------- Повторение темы + мини-тест («закрытие» ДЗ) -----------------------------
// Экран на весь телефон: 1) объяснение (правило, схема, примеры, разбор своих ошибок, совет) — тест
// открывается, только когда ученик дочитал до конца → 2) тест: 5 вопросов по одному на экран, у каждого
// 4 варианта → 3) результат. Не сдал (меньше 4 из 5) — видит правильные ответы, заново читает объяснение
// и получает НОВЫЕ вопросы. Пока тест не сдан, ДЗ не закрыто и оценка за него не выставляется.
function lessonState(h) {
  const lesson = h.aiLesson;
  if (!lesson) return null;
  const r = h.quizResult || null;
  const attempts = r?.attempts || 0;
  const max = lesson.maxAttempts || 10;
  return {
    lesson, result: r, attempts, passed: !!r?.passed,
    regenerating: h.aiLessonStatus === "regenerating",
    outOfAttempts: !r?.passed && attempts >= max && !h.quizWaived,
    waived: !!h.quizWaived,
    done: !!r?.passed || !!h.quizWaived,
  };
}

function LessonCta({ h, t, onOpen }) {
  if (h.aiLessonStatus === "generating") {
    return (
      <div className="mt-2 p-3 rounded-2xl flex items-center gap-2 text-[12.5px]" style={{ background: "var(--soft-purple-bg)", color: "var(--soft-purple-fg)" }}>
        <Loader2 size={15} className="animate-spin shrink-0" />{t("lesson_generating")}
      </div>
    );
  }
  const st = lessonState(h);
  if (!st) return null;
  const topics = st.lesson.topics.map((x) => x.topic).join(", ");
  const r = st.result;
  let title, desc, tone = "purple", action = t("lesson_start");
  if (st.done) { title = t("lesson_closed_title"); desc = st.waived ? t("lesson_waived") : t("lesson_passed_desc", { s: `${r.bestScore}/${r.total}` }); tone = "green"; action = null; }
  else if (st.outOfAttempts) { title = t("lesson_out_title"); desc = t("lesson_out_desc"); tone = "red"; action = null; }
  else if (st.regenerating) { title = t("lesson_failed_title", { s: `${r.lastScore}/${r.total}` }); desc = t("lesson_new_questions_wait"); tone = "red"; action = t("lesson_reread"); }
  else if (r) { title = t("lesson_failed_title", { s: `${r.lastScore}/${r.total}` }); desc = t("lesson_failed_desc"); tone = "red"; action = t("lesson_reread"); }
  else { title = t("lesson_cta_title"); desc = t("lesson_cta_desc", { topics, n: 5 }); }
  const colors = { purple: { bg: "var(--soft-purple-bg)", fg: "var(--soft-purple-fg)" }, green: { bg: "var(--soft-green-bg)", fg: "var(--soft-green-fg)" }, red: { bg: "var(--soft-red-bg)", fg: "var(--soft-red-fg)" } }[tone];
  return (
    <button onClick={onOpen} className="mt-2 w-full p-3.5 rounded-2xl text-left flex items-center gap-3 active:scale-[0.99] transition-transform" style={{ background: colors.bg, color: colors.fg, border: action ? "2px solid currentColor" : "none" }}>
      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-white" style={{ background: colors.fg }}>{st.done ? <CheckCircle2 size={20} /> : r ? <RotateCcw size={20} /> : <BookOpen size={20} />}</div>
      <div className="flex-1 min-w-0">
        <div className="text-[13.5px] font-bold">{title}</div>
        <div className="text-[11.5px] opacity-85 mt-0.5">{desc}</div>
      </div>
      {action && <div className="text-[12px] font-bold px-3 py-1.5 rounded-full text-white shrink-0" style={{ background: colors.fg }}>{action}</div>}
    </button>
  );
}

// Прогресс мини-теста (что прочитано, на каком вопросе, какие ответы выбраны) хранится на телефоне
// и в облаке Telegram — если ученик закрыл приложение посреди теста, при входе всё продолжится с того же места.
// Ключ привязан к конкретной сдаче ДЗ и номеру набора вопросов: после неудачной попытки вопросы новые — и прогресс начинается заново.
const quizProgressKey = (h) => `gu_quiz_${h.id}_${h.aiLesson?.setNumber || 1}`;
function readLocalJson(key) { try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : null; } catch { return null; } }
function cleanQuizProgress(p, h) {
  if (!p || typeof p !== "object") return null;
  const st = lessonState(h);
  if (!st || st.done || st.outOfAttempts) return null;
  const quiz = st.lesson.quiz || [];
  const ids = new Set(quiz.map((q) => q.id));
  const answers = {};
  Object.entries(p.answers || {}).forEach(([k, v]) => { if (ids.has(k) && Number.isInteger(v) && v >= 0 && v < 4) answers[k] = v; });
  const canQuiz = !st.regenerating && quiz.length > 0;
  const step = p.step === "quiz" && canQuiz && p.readDone ? "quiz" : "learn";
  return { step, qi: Math.max(0, Math.min(quiz.length - 1, Number(p.qi) || 0)), answers, readDone: !!p.readDone };
}

function TopicReviewSheet({ h, t, onClose, onSubmitQuiz }) {
  const st = lessonState(h);
  const progressKey = quizProgressKey(h);
  const saved0 = useMemo(() => cleanQuizProgress(readLocalJson(progressKey), h), []);
  const [step, setStep] = useState(() => saved0 ? saved0.step : (st && (st.done || st.result) ? "result" : "learn"));
  const [qi, setQi] = useState(saved0 ? saved0.qi : 0);
  const [answers, setAnswers] = useState(saved0 ? saved0.answers : {});
  const [submitting, setSubmitting] = useState(false);
  const [readDone, setReadDone] = useState(saved0 ? saved0.readDone : false);
  const hydratedRef = useRef(!!saved0);
  // На iPhone память телефона внутри Telegram иногда очищается — тогда берём прогресс из облака Telegram.
  useEffect(() => {
    if (hydratedRef.current) return;
    let cancelled = false;
    storageGet(progressKey).then((raw) => {
      if (cancelled || hydratedRef.current || !raw) return;
      let p = null; try { p = JSON.parse(raw); } catch {}
      const c = cleanQuizProgress(p, h);
      if (!c) return;
      hydratedRef.current = true;
      setStep(c.step); setQi(c.qi); setAnswers(c.answers); setReadDone(c.readDone);
    });
    return () => { cancelled = true; };
  }, []);
  // Сохраняем прогресс при каждом изменении (пока тест не сдан).
  useEffect(() => {
    if (!st || st.done || st.outOfAttempts || step === "result") return;
    if (!hydratedRef.current && step === "learn" && !readDone && Object.keys(answers).length === 0) return; // ещё нечего сохранять
    hydratedRef.current = true;
    storageSet(progressKey, JSON.stringify({ step, qi, answers, readDone, at: Date.now() }));
  }, [step, qi, answers, readDone]);
  useEffect(() => { if (st?.done) storageRemove(progressKey); }, [st?.done]);
  const scrollRef = useRef(null);
  const endRef = useRef(null);
  useEffect(() => { scrollRef.current?.scrollTo?.(0, 0); }, [step, qi]);
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);
  // Тест открывается, только когда ученик долистал объяснение до конца.
  useEffect(() => {
    if (step !== "learn" || readDone || !endRef.current) return;
    if (typeof IntersectionObserver === "undefined") { setReadDone(true); return; }
    const obs = new IntersectionObserver((entries) => { if (entries.some((e) => e.isIntersecting)) setReadDone(true); }, { root: scrollRef.current, threshold: 0.5 });
    obs.observe(endRef.current);
    return () => obs.disconnect();
  }, [step, readDone]);
  if (!st) return null;
  const { lesson } = st;
  const quiz = lesson.quiz || [];
  const q = quiz[qi];
  const answered = (qq) => answers[qq.id] !== undefined;
  const steps = [["learn", t("step_learn")], ["quiz", t("step_quiz")], ["result", t("step_result")]];
  const review = st.result?.lastReview || [];
  const canTakeQuiz = !st.done && !st.outOfAttempts && !st.regenerating && quiz.length > 0;

  const finish = async () => {
    if (submitting) return;
    setSubmitting(true);
    const res = await onSubmitQuiz(h.id, answers);
    setSubmitting(false);
    if (res) { storageRemove(progressKey); setAnswers({}); setQi(0); setStep("result"); }
  };
  const restudy = () => { setReadDone(false); setAnswers({}); setQi(0); setStep("learn"); };

  return createPortal(
    <div className={`${document.querySelector(".theme-dark") ? "theme-dark" : "theme-light"} fixed inset-0 z-[120] flex flex-col`} style={{ background: "var(--paper)", color: "var(--ink)" }}>
      <div className="shrink-0 px-4 pb-3" style={{ background: "var(--surface)", borderBottom: "1px solid var(--line)", paddingTop: "calc(16px + var(--gu-safe-top, env(safe-area-inset-top, 0px)))" }}>
        <div className="flex items-center justify-between gap-2 max-w-md mx-auto">
          <h2 className="text-[16px] font-extrabold flex items-center gap-2"><BookOpen size={18} style={{ color: BLUE }} />{t("lesson_title")}</h2>
          <button onClick={onClose} className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ background: "var(--surface-alt)" }}><X size={16} /></button>
        </div>
        <div className="flex gap-1.5 mt-3 max-w-md mx-auto">
          {steps.map(([key, label], i) => {
            const idx = steps.findIndex((s) => s[0] === step);
            return (
              <div key={key} className="flex-1">
                <div className="h-1.5 rounded-full" style={{ background: i <= idx ? BLUE : "var(--surface-alt)" }} />
                <div className="text-[10.5px] mt-1 font-semibold" style={{ opacity: i === idx ? 1 : 0.45 }}>{label}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4">
        <div className="max-w-md mx-auto space-y-3">
          {step === "learn" && (
            <>
              {st.result && !st.done && (
                <div className="p-3 rounded-2xl text-[12.5px] font-semibold" style={{ background: "var(--soft-red-bg)", color: "var(--soft-red-fg)" }}><RotateCcw size={14} className="inline -mt-0.5 mr-1" />{t("lesson_reread_note")}</div>
              )}
              {lesson.topics.map((tp, i) => (
                <div key={i} className="rounded-3xl p-4" style={{ background: "var(--surface)", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
                  <div className="text-[11px] font-bold uppercase tracking-wide opacity-50">{t("lesson_topic")} {lesson.topics.length > 1 ? `${i + 1}/${lesson.topics.length}` : ""}</div>
                  <div className="text-[19px] font-extrabold mt-0.5">{tp.topic}</div>
                  <div className="mt-3 p-3 rounded-2xl" style={{ background: "var(--soft-blue-bg)" }}>
                    <div className="text-[11px] font-bold mb-1" style={{ color: "var(--soft-blue-fg)" }}><Pin size={12} className="inline -mt-0.5 mr-1" />{t("lesson_rule")}</div>
                    <div className="text-[14px] leading-relaxed">{tp.rule}</div>
                    {tp.formula && <div className="mt-2 text-[14px] font-bold px-3 py-2 rounded-xl" style={{ background: "var(--surface)" }}>{tp.formula}</div>}
                  </div>
                  {tp.examples?.length > 0 && (
                    <div className="mt-3">
                      <div className="text-[11px] font-bold mb-1.5 opacity-60"><MessageSquare size={12} className="inline -mt-0.5 mr-1" />{t("lesson_examples")}</div>
                      <div className="space-y-1.5">
                        {tp.examples.map((ex, j) => (
                          <div key={j} className="p-2.5 rounded-xl" style={{ background: "var(--surface-soft)" }}>
                            <div className="text-[14px] font-semibold">{ex.text}</div>
                            {ex.note && <div className="text-[12px] opacity-60 mt-0.5">{ex.note}</div>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {tp.yourMistakes?.length > 0 && (
                    <div className="mt-3">
                      <div className="text-[11px] font-bold mb-1.5 opacity-60"><Pencil size={12} className="inline -mt-0.5 mr-1" />{t("lesson_your_mistakes")}</div>
                      <div className="space-y-1.5">
                        {tp.yourMistakes.map((m, j) => (
                          <div key={j} className="p-2.5 rounded-xl" style={{ background: "var(--soft-orange-bg)" }}>
                            <div className="text-[13.5px]">
                              <span className="line-through opacity-70" style={{ color: BRICK }}>{m.wrong}</span>
                              <span className="mx-1.5">→</span>
                              <b style={{ color: GREEN_D }}>{m.right}</b>
                            </div>
                            {m.why && <div className="text-[12px] opacity-70 mt-0.5">{m.why}</div>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {tp.tip && <div className="mt-3 p-2.5 rounded-xl text-[12.5px]" style={{ background: "var(--soft-yellow-bg)", color: "var(--soft-yellow-fg)" }}><Lightbulb size={14} className="inline -mt-0.5 mr-1" /><b>{t("lesson_tip")}:</b> {tp.tip}</div>}
                </div>
              ))}
              <div ref={endRef} className="h-2" />
            </>
          )}

          {step === "quiz" && q && (
            <div className="rounded-3xl p-4" style={{ background: "var(--surface)", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
              <div className="flex items-center justify-between text-[11.5px] font-semibold opacity-60">
                <span>{t("quiz_question", { i: qi + 1, n: quiz.length })}</span>
                <span>{t("quiz_need", { n: Math.ceil(quiz.length * 0.8), t: quiz.length })}</span>
              </div>
              <div className="flex gap-1 mt-2">
                {quiz.map((qq, i) => (
                  <button key={qq.id} onClick={() => setQi(i)} className="flex-1 h-1.5 rounded-full" style={{ background: i === qi ? BLUE : answered(qq) ? "var(--soft-blue-fg)" : "var(--surface-alt)", opacity: i === qi ? 1 : answered(qq) ? 0.5 : 1 }} />
                ))}
              </div>
              <div className="text-[17px] font-bold leading-snug mt-4">{q.question}</div>
              <div className="mt-4 space-y-2">
                {q.options.map((opt, oi) => {
                  const sel = answers[q.id] === oi;
                  return (
                    <button key={oi} onClick={() => { haptic("light"); setAnswers((a) => ({ ...a, [q.id]: oi })); }} className="w-full text-left px-4 py-3.5 rounded-2xl text-[15px] font-medium flex items-center gap-3 transition-colors" style={{ background: sel ? "var(--soft-blue-bg)" : "var(--surface-soft)", border: `2px solid ${sel ? BLUE : "transparent"}` }}>
                      <span className="w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-bold shrink-0" style={{ background: sel ? BLUE : "var(--surface-alt)", color: sel ? "#fff" : "var(--ink)" }}>{String.fromCharCode(65 + oi)}</span>
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {step === "result" && st.result && (
            <>
              <div className="rounded-3xl p-5 text-center" style={{ background: st.done ? "var(--soft-green-bg)" : "var(--soft-orange-bg)" }}>
                <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center" style={{ background: st.done ? "var(--soft-green-bg)" : "var(--soft-purple-bg)" }}>{st.done ? <PartyPopper size={32} style={{ color: GREEN_D }} /> : <Dumbbell size={32} style={{ color: PURPLE }} />}</div>
                <div className="text-[18px] font-extrabold mt-2">{st.done ? t("quiz_passed_title") : t("quiz_failed_title")}</div>
                <div className="text-[30px] font-black mt-1" style={{ color: st.done ? GREEN_D : BRICK }}>{st.result.lastScore}/{st.result.total}</div>
                <div className="text-[12px] opacity-75 mt-1">{st.done ? t("quiz_closed_note") : t("quiz_failed_note", { n: Math.ceil(st.result.total * 0.8), t: st.result.total })}</div>
              </div>
              {review.map((rq, i) => (
                <div key={rq.id} className="rounded-2xl p-3.5" style={{ background: "var(--surface)", borderLeft: `4px solid ${rq.correct ? GREEN_D : BRICK}` }}>
                  <div className="text-[12px] font-semibold opacity-60">{rq.correct ? <CheckCircle2 size={13} className="inline -mt-0.5 mr-1" style={{ color: GREEN_D }} /> : <XCircle size={13} className="inline -mt-0.5 mr-1" style={{ color: BRICK }} />}{t("quiz_question", { i: i + 1, n: review.length })}</div>
                  <div className="text-[14px] font-semibold mt-1">{rq.question}</div>
                  <div className="text-[13px] mt-1.5">{t("quiz_your_answer")}: <b style={{ color: rq.correct ? GREEN_D : BRICK }}>{rq.given === null || rq.given === undefined ? t("quiz_no_answer") : rq.options[rq.given]}</b></div>
                  {!rq.correct && <div className="text-[13px] mt-0.5">{t("quiz_correct_answer")}: <b style={{ color: GREEN_D }}>{rq.options[rq.correctIndex]}</b></div>}
                  {!rq.correct && rq.hint && <div className="text-[12px] mt-1.5 p-2 rounded-lg" style={{ background: "var(--soft-yellow-bg)", color: "var(--soft-yellow-fg)" }}><Lightbulb size={13} className="inline -mt-0.5 mr-1" />{rq.hint}</div>}
                </div>
              ))}
              {st.outOfAttempts && <div className="p-3 rounded-2xl text-[12.5px]" style={{ background: "var(--soft-red-bg)", color: "var(--soft-red-fg)" }}>{t("lesson_out_desc")}</div>}
            </>
          )}
        </div>
      </div>

      <div className="shrink-0 px-4 pt-3" style={{ background: "var(--surface)", borderTop: "1px solid var(--line)", paddingBottom: "calc(14px + var(--gu-safe-bottom, env(safe-area-inset-bottom, 0px)))" }}>
        <div className="max-w-md mx-auto">
          {step === "learn" && (st.done || st.outOfAttempts ? (
            <button onClick={() => (st.result ? setStep("result") : onClose())} className="w-full py-3.5 rounded-2xl text-[15px] font-bold text-white" style={{ background: BLUE }}>{st.result ? t("quiz_back_to_result") : t("quiz_done")}</button>
          ) : st.regenerating ? (
            <div className="w-full py-3.5 rounded-2xl text-[14px] font-semibold text-center flex items-center justify-center gap-2" style={{ background: "var(--surface-alt)" }}><Loader2 size={15} className="animate-spin" />{t("lesson_new_questions_wait")}</div>
          ) : (
            <>
              {!readDone && <div className="text-[11.5px] text-center opacity-60 mb-2">{t("lesson_read_to_unlock")}</div>}
              <button onClick={() => { setStep("quiz"); setQi(0); }} disabled={!readDone || !canTakeQuiz} className="w-full py-3.5 rounded-2xl text-[15px] font-bold text-white disabled:opacity-40" style={{ background: BLUE }}>
                {readDone ? <>{t("lesson_go_quiz", { n: quiz.length })} <ChevronRight size={16} className="inline -mt-0.5" /></> : <><Lock size={14} className="inline -mt-0.5 mr-1" />{t("lesson_go_quiz", { n: quiz.length })}</>}
              </button>
            </>
          ))}
          {step === "quiz" && (
            <div className="flex gap-2">
              <button onClick={() => (qi === 0 ? setStep("learn") : setQi(qi - 1))} className="px-4 py-3.5 rounded-2xl text-[14px] font-semibold" style={{ background: "var(--surface-alt)" }}>←</button>
              {qi < quiz.length - 1 ? (
                <button onClick={() => setQi(qi + 1)} disabled={!answered(q)} className="flex-1 py-3.5 rounded-2xl text-[15px] font-bold text-white disabled:opacity-40" style={{ background: BLUE }}>{t("quiz_next")} →</button>
              ) : (
                <button onClick={finish} disabled={submitting || !quiz.every(answered)} className="flex-1 py-3.5 rounded-2xl text-[15px] font-bold text-white disabled:opacity-40 flex items-center justify-center gap-2" style={{ background: GREEN_D }}>
                  {submitting && <Loader2 size={16} className="animate-spin" />}{submitting ? t("quiz_checking") : t("quiz_finish")}
                </button>
              )}
            </div>
          )}
          {step === "result" && (st.done || st.outOfAttempts ? (
            <button onClick={onClose} className="w-full py-3.5 rounded-2xl text-[15px] font-bold text-white" style={{ background: GREEN_D }}>{t("quiz_done")}</button>
          ) : (
            <button onClick={restudy} className="w-full py-3.5 rounded-2xl text-[15px] font-bold text-white" style={{ background: BLUE }}><BookOpen size={16} className="inline -mt-0.5 mr-1.5" />{t("lesson_restudy_btn")}</button>
          ))}
        </div>
      </div>
    </div>,
    document.body
  );
}

// Предупреждения о допуске к уроку (правило «3 незакрытых ДЗ подряд — нет допуска»).
function AdmissionBanner({ student, t, locale }) {
  const list = (student.admission || []).filter((a) => a.mode !== "off" && a.streak >= Math.max(1, a.limit - 1));
  if (list.length === 0) return null;
  return (
    <div className="space-y-2">
      {list.map((a) => {
        const date = a.lessonStart ? new Date(a.lessonStart).toLocaleDateString(locale, { weekday: "long", day: "numeric", month: "long" }) : "";
        const blocked = a.blocked;
        const atLimit = a.streak >= a.limit;
        const bg = blocked ? "var(--soft-red-bg)" : "var(--soft-yellow-bg)";
        const fg = blocked ? "var(--soft-red-fg)" : "var(--soft-yellow-fg)";
        return (
          <div key={a.groupId} className="p-3.5 rounded-2xl" style={{ background: bg, color: fg, border: blocked ? "2px solid currentColor" : "none" }}>
            <div className="text-[14px] font-extrabold flex items-start gap-1.5">
              <span className="shrink-0 mt-0.5">{blocked ? <Ban size={16} /> : a.overridden && atLimit ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}</span>
              <span>{blocked ? t("adm_blocked_title", { date }) : a.overridden && atLimit ? t("adm_overridden", { date }) : atLimit ? t("adm_warn_mode", { n: a.streak }) : t("adm_warning", { n: a.streak })}</span>
            </div>
            <div className="text-[12px] mt-1 opacity-90">{a.groupName} · {blocked ? t("adm_blocked_desc", { n: a.streak }) : t("adm_how_to_close")}</div>
            <div className="mt-2 space-y-1">
              {a.items.slice(0, 5).map((it) => (
                <div key={it.materialId} className="text-[12px] px-2.5 py-1.5 rounded-lg" style={{ background: "var(--surface)", color: "var(--ink)" }}>
                  <b>{new Date(it.date + "T12:00:00").toLocaleDateString(locale, { day: "numeric", month: "short" })}</b> · {it.text ? (it.text.length > 60 ? it.text.slice(0, 58) + "…" : it.text) : t("homework")} · <span className="opacity-60">{it.submitted ? t("adm_item_not_closed") : t("adm_item_not_sent")}</span>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Одна строка разбора по упражнению: «Упр. 2 — ⚠️ 7/10» и под ней ошибки именно этого упражнения.
function AiExerciseRow({ ex, t, defaultOpen, accent }) {
  const [open, setOpen] = useState(defaultOpen);
  const icon = { ok: <CheckCircle2 size={13} style={{ color: GREEN_D }} />, errors: <AlertTriangle size={13} style={{ color: BRICK }} />, not_done: <XCircle size={13} style={{ color: RED }} />, unreadable: <Search size={13} style={{ color: BLUE }} /> }[ex.status] || "•";
  const score = ex.total && ex.status !== "not_done" && ex.status !== "unreadable" ? `${ex.correct ?? "?"}/${ex.total}` : "";
  const label = ex.status === "ok" ? t("ex_ok") : ex.status === "not_done" ? t("ex_not_done") : ex.status === "unreadable" ? t("ex_unreadable") : "";
  return (
    <div className="text-[12px]">
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="shrink-0 flex">{icon}</span><b>{ex.name}</b>
        {score && <span className="font-semibold" style={{ color: ex.status === "ok" ? GREEN_D : BRICK }}>{score}</span>}
        {label && <span className="opacity-60">· {label}</span>}
        {ex.notes?.length > 0 && (
          <button onClick={() => setOpen((v) => !v)} className="text-[11.5px] font-semibold ml-auto" style={{ color: accent }}>
            {open ? t("ex_hide_errors") : t("ex_errors_btn", { n: ex.notes.length })}
          </button>
        )}
      </div>
      {open && ex.notes?.length > 0 && (
        <ol className="mt-1 mb-1 space-y-1 list-decimal pl-6">
          {ex.notes.map((n, i) => (
            <li key={i}>
              {n.where && <span className="opacity-60">{n.where}: </span>}
              <span style={{ color: BRICK }}>{n.problem}</span>{n.fix && <> → <b style={{ color: GREEN_D }}>{n.fix}</b></>}
              {n.topic && <span className="opacity-50"> [{n.topic}]</span>}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

// Карточка одной сдачи ДЗ: статус, разбор нейросети, комментарий учителя.
// Статусы: reviewed — проверил учитель; auto_accepted — принято нейросетью; pending — ждёт учителя
// или нужно доработать (поле attention объясняет почему); aiStatus "checking" — нейросеть проверяет.
const HW_REDO_REASONS = ["not_readable", "irrelevant", "not_done", "partial", "teacher_redo", "duplicate", "duplicate_other"];
function HomeworkStatusCard({ h, isLatest, t, locale, onOpenLesson }) {
  const gradeColors = { 1: BRICK, 2: "#EA580C", 3: GOLD, 4: "#65A30D", 5: GREEN_D };
  const [showNotes, setShowNotes] = useState(isLatest);
  const isRedo = h.status === "pending" && HW_REDO_REASONS.includes(h.attention) && h.aiStatus !== "checking";
  let color = "#B45309", icon = <Clock size={13} />, label = t("homework_pending");
  if (h.status === "reviewed") { color = GREEN_D; icon = <CheckCircle2 size={13} />; label = t("homework_reviewed"); }
  else if (h.status === "auto_accepted") { color = GREEN_D; icon = <CheckCircle2 size={13} />; label = t("hw_accepted"); }
  else if (h.aiStatus === "checking") { color = BLUE; icon = <Loader2 size={13} className="animate-spin" />; label = t("ai_checking"); }
  else if (isRedo) { color = BRICK; icon = <AlertTriangle size={13} />; label = t("hw_needs_redo"); }
  const notes = h.aiReview?.notes || [];
  const exercises = h.aiReview?.exercises || [];
  return (
    <div className="mb-2 p-2.5 rounded-xl" style={{ background: "var(--surface)", opacity: isLatest ? 1 : 0.65, border: isRedo && isLatest ? `1px solid ${BRICK}` : "none" }}>
      {!isLatest && <div className="text-[10.5px] font-semibold opacity-60 mb-1">{t("hw_previous_attempt")}</div>}
      <div className="flex items-center gap-1.5 text-[11.5px] font-semibold" style={{ color }}>
        {icon}{label}
        {h.grade && (h.status === "reviewed" || h.status === "auto_accepted") && (
          <span className="text-[11px] font-bold px-1.5 py-0.5 rounded-md text-white" style={{ background: gradeColors[h.grade] || GREEN_D }}>{h.grade}</span>
        )}
        <span className="opacity-50 font-normal ml-auto">{new Date(h.submittedAt).toLocaleDateString(locale, { day: "2-digit", month: "short" })}</span>
      </div>
      {h.gradeLocked && <div className="text-[12px] mt-1.5 font-semibold" style={{ color: "var(--soft-purple-fg)" }}><Lock size={12} className="inline -mt-0.5 mr-1" />{t("hw_grade_locked")}</div>}
      {isRedo && (
        <div className="text-[12.5px] mt-1.5">
          {h.attention === "teacher_redo" ? <>{t("hw_redo_teacher_redo")} <b>{h.teacherComment}</b></> : t(`hw_redo_${h.attention}`)}
        </div>
      )}
      {h.status === "pending" && h.attention === "mostly_done" && <div className="text-[12px] mt-1.5 opacity-80">{t("hw_mostly_done_note")}</div>}
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
      {h.aiStatus === "done" && h.aiReview && (h.aiReview.summary || notes.length > 0 || exercises.length > 0) && (
        <div className="mt-1.5 p-2.5 rounded-lg" style={{ background: "var(--soft-blue-bg, #DBEAFE)" }}>
          <div className="text-[11.5px] font-bold mb-1 flex items-center gap-1"><Bot size={13} />{t("ai_title")}</div>
          {h.aiReview.summary && <div className="text-[12.5px]">{h.aiReview.summary}</div>}
          {exercises.length > 0 && (
            <div className="mt-2 space-y-1.5">
              <div className="text-[11px] opacity-60">{t("hw_checked_exercises", { n: exercises.length })}</div>
              {exercises.map((ex, i) => <AiExerciseRow key={i} ex={ex} t={t} defaultOpen={isLatest && ex.status === "errors"} accent={BLUE} />)}
            </div>
          )}
          {exercises.length === 0 && notes.length > 0 && (showNotes ? (
            <ol className="mt-2 space-y-1.5 list-decimal pl-4">
              {notes.map((n, i) => (
                <li key={i} className="text-[12px]">
                  {n.where && <span className="opacity-60">{n.where}: </span>}
                  <span style={{ color: BRICK }}>{n.problem}</span>
                  {n.fix && <> → <b style={{ color: GREEN_D }}>{n.fix}</b></>}
                </li>
              ))}
            </ol>
          ) : (
            <button onClick={() => setShowNotes(true)} className="text-[11.5px] font-semibold mt-1" style={{ color: BLUE }}>{t("hw_show_notes", { n: notes.length })}</button>
          ))}
          <div className="text-[10.5px] opacity-50 mt-1.5">{t("ai_disclaimer")}</div>
        </div>
      )}
      {onOpenLesson && <LessonCta h={h} t={t} onOpen={() => onOpenLesson(h)} />}
    </div>
  );
}

// Сдача ДЗ прямо под заданием: если уже отправлено — показываем статус и файлы;
// если ещё нет — маленькая форма (файлы + комментарий), разворачивается по кнопке.
function HomeworkSubmitBox({ material, student, onSubmitHomework, onOpenLesson, autoOpen, onAutoOpened, t, locale }) {
  const gradeColors = { 1: BRICK, 2: "#EA580C", 3: GOLD, 4: "#65A30D", 5: GREEN_D };
  const [expanded, setExpanded] = useState(false);
  const [files, setFiles] = useState([]);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const photoInputRef = useRef(null);
  const docInputRef = useRef(null);
  const boxRef = useRef(null);
  // Кнопка «Сдать» на главной: раскрываем форму сдачи этого задания и плавно прокручиваем к ней.
  useEffect(() => {
    if (!autoOpen) return;
    setExpanded(true);
    setTimeout(() => { try { boxRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }); } catch {} }, 60);
    onAutoOpened && onAutoOpened();
  }, [autoOpen]);

  const mySubmissions = (student.homework || []).filter((h) => h.materialId === material.id);
  const aiOn = !!student.features?.aiHomework;
  // Если хотя бы одна попытка по этому заданию уже принята — задание сделано, красная кнопка «переделать» не нужна.
  const alreadyAccepted = mySubmissions.some((h) => h.status === "reviewed" || h.status === "auto_accepted");
  const latestNeedsRedo = !alreadyAccepted && mySubmissions.length > 0 && mySubmissions[0].status === "pending" && HW_REDO_REASONS.includes(mySubmissions[0].attention) && mySubmissions[0].aiStatus !== "checking";

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
    <div ref={boxRef} className="mt-2.5 pt-2.5" style={{ borderTop: "1px dashed var(--soft-yellow-border)" }}>
      {mySubmissions.map((h, i) => (
        <HomeworkStatusCard key={h.id} h={h} isLatest={i === 0} t={t} locale={locale} onOpenLesson={onOpenLesson} />
      ))}

      {!expanded ? (
        <button onClick={() => setExpanded(true)} className="w-full text-[12.5px] font-semibold py-2 rounded-xl flex items-center justify-center gap-1.5" style={latestNeedsRedo ? { background: RED, color: "#fff" } : { background: "var(--surface)", color: BLUE }}>
          <Upload size={14} />{latestNeedsRedo ? t("hw_submit_fixed") : mySubmissions.length > 0 ? t("homework_submit_again") : t("homework_submit")}
        </button>
      ) : (
        <div className="space-y-2">
          {aiOn && <div className="text-[11.5px] p-2 rounded-lg" style={{ background: "var(--soft-blue-bg, #DBEAFE)" }}><Bot size={13} className="inline -mt-0.5 mr-1" />{t("ai_submit_hint")}</div>}
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

// ------------------------------- Главная (дизайн «вариант 2») -------------------------------
// Красная фирменная шапка с балансом и монетами → белая карточка урока (заходит на шапку) →
// объявления → «Домашнее задание» (что сделать сейчас + все задания) → прогресс → сервис →
// мои группы → посещаемость и оценки. Вся прежняя логика сохранена, поменялся только вид и порядок.
const DAY_BY_INDEX = { 0: "Вс", 1: "Пн", 2: "Вт", 3: "Ср", 4: "Чт", 5: "Пт", 6: "Сб" };
function atTime(date, hhmm) {
  const [h, m] = String(hhmm || "00:00").split(":").map(Number);
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), h || 0, m || 0);
}
// Ближайшие уроки: все сегодняшние (если ещё не закончились) или самый близкий следующий.
function upcomingLessons(groups, now = new Date()) {
  const list = [];
  for (const g of groups || []) {
    for (let i = 0; i < 14; i++) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i);
      if (!(g.days || []).includes(DAY_BY_INDEX[d.getDay()])) continue;
      if (i === 0 && now >= atTime(d, g.end || g.start)) continue;
      list.push({ group: g, date: d, start: atTime(d, g.start), isToday: i === 0 });
      break;
    }
  }
  list.sort((a, b) => a.start - b.start);
  const today = list.filter((x) => x.isToday);
  return today.length ? today : list.slice(0, 1);
}
// Что ученику нужно сделать по ДЗ прямо сейчас (последние 3 недели): сдать, переделать, пройти мини-тест.
function computeHomeworkTasks(student) {
  const since = Date.now() - 21 * 24 * 3600 * 1000;
  const allMaterials = student.materials || [];
  const materials = [...allMaterials].filter((m) => new Date(m.date).getTime() >= since).sort((a, b) => new Date(b.date) - new Date(a.date));
  const subsOf = (mid) => (student.homework || []).filter((h) => h.materialId === mid).sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
  const isClosed = (h) => (h.closed !== undefined ? !!h.closed : (h.status === "reviewed" || h.status === "auto_accepted") && (!h.aiLesson || lessonState(h)?.done));
  const tasks = [];
  const seen = new Set();
  // 1) Мини-тесты, которые ещё не сданы (по любому ДЗ, даже старому) — это «закрыть ДЗ».
  for (const h of [...(student.homework || [])].sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))) {
    if (seen.has(h.materialId)) continue;
    const st = lessonState(h);
    if (st && !st.done && !st.outOfAttempts) {
      seen.add(h.materialId);
      const m = allMaterials.find((x) => x.id === h.materialId) || { id: h.materialId, date: h.submittedAt, text: "" };
      tasks.push({ kind: "quiz", m, h });
    }
  }
  // 2) Свежие задания (3 недели): не сдано / переделать / проверяется / готовится повторение.
  for (const m of materials) {
    if (seen.has(m.id)) continue;
    const subs = subsOf(m.id);
    if (subs.some(isClosed)) continue;
    const latest = subs[0];
    if (!latest) tasks.push({ kind: "submit", m });
    else if (latest.aiStatus === "checking") tasks.push({ kind: "checking", m });
    else if (latest.aiLessonStatus === "generating" || latest.aiLessonStatus === "regenerating") tasks.push({ kind: "preparing", m, h: latest });
    else if (latest.status === "pending" && HW_REDO_REASONS.includes(latest.attention)) tasks.push({ kind: "redo", m });
  }
  const order = { quiz: 0, redo: 1, submit: 2, preparing: 3, checking: 4 };
  return tasks.sort((a, b) => order[a.kind] - order[b.kind]);
}
function homeBadgeCount(student) {
  if (!student) return 0;
  const tasks = computeHomeworkTasks(student).filter((x) => x.kind === "submit" || x.kind === "redo" || x.kind === "quiz").length;
  const blocked = (student.admission || []).filter((a) => a.blocked).length;
  return tasks + blocked;
}

function IconTile({ icon: Icon, bg, color, size = 38, iconSize = 19, radius = 13 }) {
  return (
    <div className="flex items-center justify-center shrink-0" style={{ width: size, height: size, borderRadius: radius, background: bg }}>
      <Icon size={iconSize} style={{ color }} strokeWidth={2.2} />
    </div>
  );
}
function SectionCard({ icon, iconBg, iconColor, title, right, children, id }) {
  return (
    <div id={id} className="rounded-[26px] p-4" style={{ background: "var(--surface)", boxShadow: "0 6px 20px rgba(26,26,23,0.07)" }}>
      <div className="flex items-center gap-2.5 mb-3">
        <IconTile icon={icon} bg={iconBg} color={iconColor} size={32} iconSize={17} radius={10} />
        <h3 className="text-[15px] font-extrabold flex-1 min-w-0">{title}</h3>
        {right}
      </div>
      {children}
    </div>
  );
}

// Строка-ссылка в минималистичных списках: иконка, заголовок, подпись, справа значок/стрелка.
function ListRow({ icon, tile, color, title, sub, right, onClick, last }) {
  return (
    <button onClick={() => { haptic("light"); onClick && onClick(); }} className="w-full flex items-center gap-3 py-3 text-left active:opacity-70 transition-opacity" style={{ borderBottom: last ? "none" : "1px solid var(--line)" }}>
      <IconTile icon={icon} bg={tile} color={color} size={38} iconSize={19} radius={12} />
      <div className="min-w-0 flex-1">
        <div className="text-[14.5px] font-bold leading-tight" style={{ color: "var(--ink)" }}>{title}</div>
        {sub && <div className="text-[11.5px] mt-0.5 truncate" style={{ color: "var(--ink-sub)" }}>{sub}</div>}
      </div>
      {right}
      <ChevronRight size={17} style={{ color: "var(--ink-3)" }} className="shrink-0" />
    </button>
  );
}
function Chip({ children, tone = "neutral" }) {
  const c = {
    neutral: ["var(--surface-alt)", "var(--ink-2)"], red: ["var(--soft-red-bg)", "var(--soft-red-fg)"], green: ["var(--soft-green-bg)", "var(--soft-green-fg)"],
    blue: ["var(--soft-blue-bg)", "var(--soft-blue-fg)"], purple: ["var(--soft-purple-bg)", "var(--soft-purple-fg)"], yellow: ["var(--soft-yellow-bg)", "var(--soft-yellow-fg)"],
  }[tone];
  return <span className="text-[11.5px] font-bold px-2.5 py-1 rounded-full shrink-0 inline-flex items-center gap-1" style={{ background: c[0], color: c[1] }}>{children}</span>;
}
function PlainCard({ children, className = "", style = {}, id }) {
  return <div id={id} className={`rounded-[24px] px-4 ${className}`} style={{ background: "var(--surface)", boxShadow: "0 4px 16px rgba(26,26,23,0.06)", ...style }}>{children}</div>;
}
function CardTitle({ children, right }) {
  return (
    <div className="flex items-center justify-between pt-4 pb-1">
      <h3 className="text-[12px] font-bold uppercase tracking-[0.06em]" style={{ color: "var(--ink-3)" }}>{children}</h3>
      {right}
    </div>
  );
}

// Квадратная плитка: иконка сверху, справа сверху — счётчик, внизу — название и короткая подпись.
function SquareTile({ icon, tile, color, title, sub, badge, onClick }) {
  return (
    <button onClick={() => { haptic("light"); onClick && onClick(); }} className="aspect-square rounded-[22px] p-3 flex flex-col justify-between text-left active:scale-[0.96] transition-transform" style={{ background: "var(--surface)", boxShadow: "0 4px 16px rgba(26,26,23,0.06)" }}>
      <div className="flex items-start justify-between w-full gap-1">
        <IconTile icon={icon} bg={tile} color={color} size={38} iconSize={19} radius={12} />
        {badge}
      </div>
      <div className="min-w-0 w-full">
        <div className="text-[13.5px] font-bold leading-tight" style={{ color: "var(--ink)" }}>{title}</div>
        {sub && <div className="text-[11px] mt-0.5 truncate" style={{ color: "var(--ink-sub)" }}>{sub}</div>}
      </div>
    </button>
  );
}
function SectionLabel({ children }) {
  return <div className="text-[12px] font-bold uppercase tracking-[0.06em] px-1 pt-1.5 -mb-0.5" style={{ color: "var(--ink-3)" }}>{children}</div>;
}

// ------------------------------- Главная (минималистичная) -------------------------------
// На главной — только самое нужное: деньги, ближайший урок, срочное, «Учёба» (ДЗ и прогресс — открываются
// отдельным экраном) и «Сервис». Всё подробное (задания, посещаемость, группы, объявления) — на своих экранах.
function HomeTab({ student, notifications = [], t, lang, onRequestService, onOpenScreen }) {
  const locale = LOCALE_OF[lang] || "ru-RU";
  const [showCoinsInfo, setShowCoinsInfo] = useState(false);
  const [showDebt, setShowDebt] = useState(false);
  const [serviceModalType, setServiceModalType] = useState(null);
  const hasDebt = (student.debt || 0) > 0;
  const currency = lang === "ru" ? "сум" : lang === "uz" ? "so'm" : "UZS";
  const urgent = notifications.filter((n) => n.urgent);
  const normal = notifications.filter((n) => !n.urgent);
  const [now, setNow] = useState(() => new Date());
  useEffect(() => { const id = setInterval(() => setNow(new Date()), 30000); return () => clearInterval(id); }, []);
  const lessons = upcomingLessons(student.groups, now);
  const admissionOf = (gid) => (student.admission || []).find((a) => a.groupId === gid);
  const tasks = computeHomeworkTasks(student);
  const actionable = tasks.filter((x) => x.kind !== "checking" && x.kind !== "preparing");
  const inProgress = tasks.length - actionable.length;
  const blocked = (student.admission || []).filter((a) => a.blocked);
  const warned = (student.admission || []).filter((a) => !a.blocked && a.mode !== "off" && a.streak >= Math.max(1, a.limit - 1));
  const log = student.attendanceLog || [];
  const attPct = log.length ? Math.round((log.filter((r) => r.present).length / log.length) * 100) : null;
  const grades = [...log.filter((r) => r.grade).map((r) => r.grade), ...(student.generalGrades || []).map((g) => g.value)];
  const avg = grades.length ? (grades.reduce((a, b) => a + b, 0) / grades.length).toFixed(1) : null;
  const hwSub = actionable.length ? t("hw_sub_todo") : inProgress ? t("hw_sub_checking") : (student.materials || []).length ? t("hw_sub_done") : null;
  const progSub = [attPct != null && `${attPct}%`, avg && `${t("avg_short")} ${avg}`].filter(Boolean).join(" · ") || null;
  const glass = { background: "rgba(255,255,255,0.14)", border: "1px solid rgba(255,255,255,0.2)", backdropFilter: "blur(8px)" };

  return (
    <div className="space-y-3">
      {/* Ближайший урок — крупно прямо на красной шапке (вариант D) */}
      <div className="text-white pt-4 pb-1">
        {(student.groups || []).length === 0 || lessons.length === 0 ? (
          <div className="py-3">
            <div className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: "rgba(255,255,255,0.72)" }}>{t("next_lesson_label")}</div>
            <div className="text-[17px] font-extrabold mt-1">{(student.groups || []).length === 0 ? t("no_group") : t("no_schedule")}</div>
          </div>
        ) : (() => {
          const { group: g, date, isToday, start } = lessons[0];
          const adm = admissionOf(g.id);
          const isBlocked = !!adm?.blocked;
          const end = atTime(date, g.end || g.start);
          const mins = Math.round((start - now) / 60000);
          const when = now >= start && now < end ? t("lesson_now") : mins <= 0 ? "" : mins < 60 ? t("lesson_in_min", { m: mins }) : isToday ? t("lesson_in_hm", { h: Math.floor(mins / 60), m: mins % 60 }) : null; // отсчёт — только для сегодняшнего урока
          const dayLabel = isToday ? t("today_short") : date.toLocaleDateString(locale, { weekday: "long", day: "numeric", month: "short" });
          return (
            <>
              <div className="flex items-end justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-[11px] font-bold uppercase tracking-wide truncate" style={{ color: "rgba(255,255,255,0.75)" }}>{dayLabel} · {g.name}</div>
                  <div className="text-[46px] font-black leading-none mt-1.5" style={{ letterSpacing: "-1px" }}>{g.start}</div>
                  <div className="text-[12px] mt-1.5 truncate" style={{ color: "rgba(255,255,255,0.8)" }}>{[g.room && `${t("room_short")} ${g.room}`, g.teacherName, when].filter(Boolean).join(" · ")}</div>
                </div>
                {adm && adm.mode !== "off" && (
                  <span className="text-[11.5px] font-bold px-2.5 py-1 rounded-full shrink-0 inline-flex items-center gap-1 mb-1" style={{ background: "#fff", color: isBlocked ? RED_D : GREEN_D }}>
                    {isBlocked ? <Ban size={12} /> : <Check size={12} />}{isBlocked ? t("adm_chip_no") : t("adm_chip_yes")}
                  </span>
                )}
              </div>
              {lessons.length > 1 && (
                <div className="text-[11.5px] mt-2 truncate" style={{ color: "rgba(255,255,255,0.75)" }}>
                  {t("lesson_also")}: {lessons.slice(1).map((x) => `${x.group.start} ${x.group.name}`).join(", ")}
                </div>
              )}
            </>
          );
        })()}
      </div>

      {/* Деньги — белые карточки, наполовину заходят на шапку */}
      <div className="grid grid-cols-2 gap-2.5 pt-3">
        <button onClick={() => (hasDebt ? setShowDebt(true) : null)} className="rounded-[20px] p-3 flex items-center gap-2.5 text-left active:scale-[0.98] transition-transform" style={{ background: "var(--surface)", boxShadow: "0 8px 24px rgba(26,26,23,0.10)" }}>
          <IconTile icon={Wallet} bg={hasDebt ? "var(--soft-red-bg)" : "var(--soft-green-bg)"} color={hasDebt ? RED_D : GREEN_D} size={38} iconSize={18} radius={12} />
          <div className="min-w-0">
            <div className="text-[10.5px] font-semibold uppercase tracking-wide" style={{ color: "var(--ink-3)" }}>{hasDebt ? t("debt") : t("balance")}</div>
            <div className="text-[16px] font-extrabold leading-tight truncate" style={{ color: hasDebt ? RED_D : "var(--ink)" }}>{fmt(hasDebt ? student.debt : (student.prepaidCredit || 0))} <span className="text-[11px] font-semibold" style={{ color: "var(--ink-3)" }}>{currency}</span></div>
          </div>
        </button>
        <button onClick={() => setShowCoinsInfo(true)} className="rounded-[20px] p-3 flex items-center gap-2.5 text-left active:scale-[0.98] transition-transform" style={{ background: "var(--surface)", boxShadow: "0 8px 24px rgba(26,26,23,0.10)" }}>
          <IconTile icon={CoinsIcon} bg="var(--soft-orange-bg)" color="#C2410C" size={38} iconSize={18} radius={12} />
          <div className="min-w-0 flex-1">
            <div className="text-[10.5px] font-semibold uppercase tracking-wide" style={{ color: "var(--ink-3)" }}>GlobalCoins</div>
            <div className="text-[16px] font-extrabold leading-tight" style={{ color: "var(--ink)" }}>{student.coins} <span className="text-[11px] font-semibold" style={{ color: "var(--ink-3)" }}>GC</span></div>
          </div>
          <Info size={15} className="shrink-0" style={{ color: "var(--ink-3)" }} />
        </button>
      </div>

      {/* Срочное — коротко, по нажатию открывается подробно */}
      {(blocked.length > 0 || warned.length > 0 || urgent.length > 0) && (
        <div className="space-y-2">
          {blocked.map((a) => (
            <button key={"b" + a.groupId} onClick={() => onOpenScreen("homework")} className="w-full rounded-[18px] px-3.5 py-3 flex items-center gap-3 text-left" style={{ background: "var(--soft-red-bg)", color: "var(--soft-red-fg)" }}>
              <Ban size={18} className="shrink-0" />
              <div className="min-w-0 flex-1"><div className="text-[13.5px] font-bold">{t("adm_home_blocked")}</div><div className="text-[11.5px] opacity-60">{t("adm_home_blocked_short")}</div></div>
              <ChevronRight size={16} className="shrink-0 opacity-70" />
            </button>
          ))}
          {warned.map((a) => (
            <button key={"w" + a.groupId} onClick={() => onOpenScreen("homework")} className="w-full rounded-[18px] px-3.5 py-3 flex items-center gap-3 text-left" style={{ background: "var(--soft-yellow-bg)", color: "var(--soft-yellow-fg)" }}>
              <AlertTriangle size={18} className="shrink-0" />
              <div className="min-w-0 flex-1"><div className="text-[13.5px] font-bold">{a.overridden && a.streak >= a.limit ? t("adm_home_override") : t("adm_home_warn", { n: a.streak })}</div><div className="text-[11.5px] opacity-60">{t("adm_home_warn_short")}</div></div>
              <ChevronRight size={16} className="shrink-0 opacity-70" />
            </button>
          ))}
          {urgent.slice(0, 1).map((n) => (
            <button key={n.id} onClick={() => onOpenScreen("notices")} className="w-full rounded-[18px] px-3.5 py-3 flex items-center gap-3 text-left text-white" style={{ background: `linear-gradient(135deg, ${RED}, ${RED_D})` }}>
              <Megaphone size={18} className="shrink-0" />
              <div className="min-w-0 flex-1"><div className="text-[10.5px] font-bold uppercase tracking-wide" style={{ color: "rgba(255,255,255,0.75)" }}>{t("important_notice")}</div><div className="text-[13.5px] font-semibold leading-snug truncate">{n.text}</div></div>
              <ChevronRight size={16} className="shrink-0 opacity-80" />
            </button>
          ))}
        </div>
      )}

      {/* Учёба: квадратные плитки — каждая открывает свой экран */}
      <SectionLabel>{t("study_title")}</SectionLabel>
      <div className="grid grid-cols-3 gap-2.5">
        <SquareTile icon={BookOpen} tile="var(--soft-purple-bg)" color={PURPLE} title={t("homework_short")} sub={hwSub} onClick={() => onOpenScreen("homework")}
          badge={actionable.length > 0 ? <Chip tone="red">{actionable.length}</Chip> : inProgress > 0 ? <Loader2 size={15} className="animate-spin" style={{ color: BLUE }} /> : (student.materials || []).length ? <CheckCircle2 size={17} style={{ color: GREEN_D }} /> : null} />
        <SquareTile icon={TrendingUp} tile="var(--soft-green-bg)" color={GREEN_D} title={t("progress_short")} sub={progSub} onClick={() => onOpenScreen("progress")} />
        <SquareTile icon={Bell} tile="var(--soft-yellow-bg)" color="#B45309" title={t("notices_title")} sub={notifications.length ? null : t("notices_none_short")} onClick={() => onOpenScreen("notices")}
          badge={notifications.length > 0 ? <Chip tone="yellow">{notifications.length}</Chip> : null} />
      </div>

      {/* Сервис — тоже квадратные плитки */}
      <SectionLabel>{t("service_section_title")}</SectionLabel>
      <div className="grid grid-cols-3 gap-2.5">
        {[
          { type: "support_lesson", icon: LifeBuoy, tile: "var(--soft-red-bg)", color: RED_D },
          { type: "topic_reexplain", icon: RefreshCw, tile: "var(--soft-blue-bg)", color: BLUE },
          { type: "materials_only", icon: Paperclip, tile: "var(--soft-green-bg)", color: GREEN_D },
        ].map((x) => (
          <SquareTile key={x.type} icon={x.icon} tile={x.tile} color={x.color} title={t(`service_${x.type}_short`)} onClick={() => setServiceModalType(x.type)} />
        ))}
      </div>

      {serviceModalType && (
        <ServiceRequestModal type={serviceModalType} student={student} onClose={() => setServiceModalType(null)} onSubmit={(groupId, topic) => onRequestService(serviceModalType, groupId, topic)} t={t} />
      )}
      {showCoinsInfo && <CoinsInfoPopup onClose={() => setShowCoinsInfo(false)} t={t} />}
      {showDebt && <DebtPopup amount={student.debt} adminTelegram={student.adminTelegram} lang={lang} onClose={() => setShowDebt(false)} t={t} />}
    </div>
  );
}

// ------------------------------- Экран «Домашнее задание» -------------------------------
function HomeworkScreen({ student, t, lang, onSubmitHomework, onSubmitQuiz }) {
  // Открытый тест запоминаем: если ученик вышел из приложения посреди теста, при входе он откроется снова.
  const openKey = `gu_open_lesson_${student.id}`;
  const restoredRef = useRef(false); // true — тест открыт автоматически при входе, а не нажатием
  const [lessonSubId, setLessonSubIdRaw] = useState(() => { try { const v = localStorage.getItem(openKey) || null; if (v) restoredRef.current = true; return v; } catch { return null; } });
  const setLessonSubId = (id) => { restoredRef.current = false; setLessonSubIdRaw(id); if (id) storageSet(openKey, id); else storageRemove(openKey); };
  useEffect(() => {
    if (lessonSubId) return;
    let cancelled = false;
    storageGet(openKey).then((id) => { if (!cancelled && id) { restoredRef.current = true; setLessonSubIdRaw(id); } });
    return () => { cancelled = true; };
  }, [openKey]);
  const lessonSub0 = lessonSubId ? (student.homework || []).find((h) => h.id === lessonSubId) : null;
  // При входе заново открываем только НЕзавершённый тест. Решаем один раз — в момент восстановления.
  const restoredButFinished = restoredRef.current && lessonSub0 && (() => { const x = lessonState(lessonSub0); return !x || x.done || x.outOfAttempts; })();
  if (restoredRef.current && lessonSub0 && !restoredButFinished) restoredRef.current = false;
  const lessonSub = lessonSub0 && lessonSub0.aiLesson && !restoredButFinished ? lessonSub0 : null;
  useEffect(() => { if (restoredButFinished) setLessonSubId(null); }, [restoredButFinished]);

  const locale = LOCALE_OF[lang] || "ru-RU";
  const [showOld, setShowOld] = useState(false);
  const [openMaterialId, setOpenMaterialId] = useState(null);
  const materials = [...(student.materials || [])].sort((a, b) => new Date(b.date) - new Date(a.date));
  const tasks = computeHomeworkTasks(student);
  const openTask = (task) => {
    haptic("light");
    if (task.kind === "quiz") { setLessonSubId(task.h.id); return; }
    if (materials[0] && materials[0].id !== task.m.id) setShowOld(true);
    setOpenMaterialId(task.m.id);
  };
  const [latest, ...older] = materials;
  const renderItem = (m) => (
    <PlainCard key={m.id} className="py-3.5">
      <div className="text-[11.5px] font-semibold flex items-center gap-1.5" style={{ color: "var(--ink-3)" }}><Calendar size={12} />{new Date(m.date).toLocaleDateString(locale, { weekday: "short", day: "numeric", month: "long" })}</div>
      {m.text && <div className="text-[14.5px] font-semibold mt-1 leading-snug" style={{ color: "var(--ink)" }}>{m.text}</div>}
      {m.link && <a href={m.link} target="_blank" rel="noreferrer" className="text-[12.5px] mt-1.5 font-semibold inline-flex items-center gap-1" style={{ color: BLUE }}><Link2 size={13} />{t("open_material")}</a>}
      <HomeworkSubmitBox material={m} student={student} onSubmitHomework={onSubmitHomework} onOpenLesson={(h) => setLessonSubId(h.id)} autoOpen={openMaterialId === m.id} onAutoOpened={() => setOpenMaterialId(null)} t={t} locale={locale} />
    </PlainCard>
  );
  return (
    <div className="space-y-3">
      <AdmissionBanner student={student} t={t} locale={locale} />
      {tasks.length > 0 ? (
        <PlainCard>
          <CardTitle right={<Chip tone="red">{tasks.filter((x) => x.kind !== "checking" && x.kind !== "preparing").length}</Chip>}>{t("hw_todo_now")}</CardTitle>
          {tasks.map((task, i) => {
            const meta = {
              submit: { icon: Camera, tile: "var(--soft-red-bg)", color: RED, btn: t("hw_btn_submit"), sub: t("hw_task_submit_sub") },
              redo: { icon: RotateCcw, tile: "var(--soft-orange-bg)", color: BRICK, btn: t("hw_btn_redo"), sub: t("hw_task_redo_sub") },
              quiz: { icon: ClipboardList, tile: "var(--soft-purple-bg)", color: PURPLE, btn: t("hw_btn_quiz"), sub: t("hw_task_quiz_sub") },
              checking: { icon: Bot, tile: "var(--soft-blue-bg)", color: BLUE, btn: null, sub: t("hw_task_checking_sub") },
              preparing: { icon: Hourglass, tile: "var(--soft-blue-bg)", color: BLUE, btn: null, sub: t("hw_task_preparing_sub") },
            }[task.kind];
            const title = task.kind === "quiz" && task.h?.aiLesson ? `${t("hw_task_quiz_title")}: ${task.h.aiLesson.topics.map((x) => x.topic).join(", ")}` : (task.m.text || t("homework"));
            return (
              <div key={task.kind + task.m.id} className="flex items-center gap-3 py-3" style={{ borderBottom: i === tasks.length - 1 ? "none" : "1px solid var(--line)" }}>
                <IconTile icon={meta.icon} bg={meta.tile} color={meta.color} size={38} iconSize={18} radius={12} />
                <div className="min-w-0 flex-1">
                  <div className="text-[14px] font-bold truncate" style={{ color: "var(--ink)" }}>{title}</div>
                  <div className="text-[11.5px] truncate" style={{ color: "var(--ink-sub)" }}>{new Date(task.m.date).toLocaleDateString(locale, { day: "numeric", month: "short" })}</div>
                </div>
                {meta.btn ? <button onClick={() => openTask(task)} className="text-[12.5px] font-bold text-white px-3.5 py-2 rounded-xl shrink-0 active:scale-95 transition-transform" style={{ background: meta.color }}>{meta.btn}</button> : <Loader2 size={17} className="animate-spin shrink-0" style={{ color: BLUE }} />}
              </div>
            );
          })}
        </PlainCard>
      ) : materials.length > 0 && (
        <PlainCard className="py-3.5 flex items-center gap-3">
          <IconTile icon={Trophy} bg="var(--soft-green-bg)" color={GREEN_D} />
          <div><div className="text-[14px] font-bold" style={{ color: "var(--ink)" }}>{t("hw_all_closed_title")}</div><div className="text-[11.5px]" style={{ color: "var(--ink-sub)" }}>{t("hw_all_closed_sub_short")}</div></div>
        </PlainCard>
      )}
      {lessonSub && lessonSub.aiLesson && <TopicReviewSheet key={lessonSub.id} h={lessonSub} t={t} onClose={() => setLessonSubId(null)} onSubmitQuiz={onSubmitQuiz} />}
      {materials.length === 0 ? (
        <PlainCard><EmptyState text={t("no_homework")} icon={PartyPopper} /></PlainCard>
      ) : (
        <>
          <div className="text-[12px] font-bold uppercase tracking-[0.06em] px-1 pt-2" style={{ color: "var(--ink-3)" }}>{t("hw_all_tasks")}</div>
          {renderItem(latest)}
          {older.length > 0 && (
            <>
              <button onClick={() => setShowOld((v) => !v)} className="w-full text-[12.5px] font-semibold py-2 flex items-center justify-center gap-1.5" style={{ color: "var(--ink-2)" }}>
                {showOld ? t("homework_hide_old") : t("homework_show_old", { n: older.length })}
                <ChevronDownIcon size={14} style={{ transform: showOld ? "rotate(180deg)" : "none", transition: "transform .15s" }} />
              </button>
              {showOld && older.map(renderItem)}
            </>
          )}
        </>
      )}
    </div>
  );
}

// ------------------------------- Экран «Мой прогресс» -------------------------------
function ProgressScreen({ student, t, lang }) {
  const locale = LOCALE_OF[lang] || "ru-RU";
  const [showAll, setShowAll] = useState(false);
  const log = [...(student.attendanceLog || [])].sort((a, b) => new Date(b.date) - new Date(a.date));
  const pct = log.length ? Math.round((log.filter((r) => r.present).length / log.length) * 100) : null;
  const recent = log.slice(0, showAll ? 30 : 8);
  const gradeColors = { 1: BRICK, 2: "#EA580C", 3: GOLD, 4: "#65A30D", 5: GREEN_D };
  return (
    <div className="space-y-3">
      <ProgressCard log={log} generalGrades={student.generalGrades || []} materials={student.materials || []} homework={student.homework || []} coins={student.coins} t={t} />
      <PlainCard className="pb-4">
        <CardTitle right={pct !== null && <Chip tone={pct >= 90 ? "green" : pct >= 80 ? "yellow" : "red"}>{pct}%</Chip>}>{t("attendance_grades")}</CardTitle>
        {recent.length === 0 ? <EmptyState text={t("no_attendance")} icon={Calendar} /> : (
          <>
            {log.length >= 4 && (
              <div className="flex items-end gap-[3px] my-3 h-8">
                {[...log].reverse().slice(-30).map((r, i) => (
                  <div key={i} className="flex-1 rounded-sm" style={{ height: r.present ? "100%" : r.excused ? "55%" : "30%", background: r.present ? GREEN_D : r.excused ? BLUE : BRICK, opacity: 0.85, minWidth: 2 }} />
                ))}
              </div>
            )}
            <div className="flex gap-2 overflow-x-auto pb-1">
              {recent.map((r, i) => (
                <div key={i} className="shrink-0 w-16 rounded-2xl p-2 text-center" style={{ background: r.present ? "var(--soft-green-bg)" : r.excused ? "var(--soft-blue-bg)" : "var(--soft-orange-bg)" }}>
                  <div className="text-[10px] font-semibold mono" style={{ color: "var(--ink-2)" }}>{ruDate(r.date, locale)}</div>
                  <div className="my-1">{r.present ? <CheckCircle2 size={16} style={{ color: GREEN_D, display: "inline" }} /> : r.excused ? <Clock size={16} style={{ color: BLUE, display: "inline" }} /> : <XCircle size={16} style={{ color: BRICK, display: "inline" }} />}</div>
                  {r.grade ? <div className="text-[11px] font-bold text-white rounded-full px-1.5 py-0.5 inline-block" style={{ background: gradeColors[r.grade] }}>{r.grade}</div> : <div className="text-[10px]" style={{ color: "var(--ink-3)" }}>—</div>}
                </div>
              ))}
            </div>
            {log.length > 8 && (
              <button onClick={() => setShowAll((v) => !v)} className="w-full mt-2 text-[12.5px] font-semibold py-1.5 flex items-center justify-center gap-1" style={{ color: "var(--ink-2)" }}>
                {showAll ? t("attendance_less") : t("attendance_more")}<ChevronDownIcon size={14} style={{ transform: showAll ? "rotate(180deg)" : "none" }} />
              </button>
            )}
          </>
        )}
      </PlainCard>
      {(student.groups || []).length > 0 && (
        <PlainCard className="pb-2">
          <CardTitle>{t("my_groups_title")}</CardTitle>
          {student.groups.map((g, i) => {
            const [c1] = courseColor(g.course);
            return (
              <div key={g.id} className="flex items-center gap-3 py-3" style={{ borderBottom: i === student.groups.length - 1 ? "none" : "1px solid var(--line)" }}>
                <div className="w-1.5 self-stretch rounded-full" style={{ background: c1 }} />
                <div className="min-w-0 flex-1">
                  <div className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: c1 }}>{g.course}</div>
                  <div className="text-[14.5px] font-bold" style={{ color: "var(--ink)" }}>{g.name}</div>
                  <div className="text-[11.5px] mt-0.5" style={{ color: "var(--ink-sub)" }}>{[scheduleText(g, t("no_schedule")), g.room && `${t("room_short")} ${g.room}`, g.teacherName].filter(Boolean).join(" · ")}</div>
                </div>
              </div>
            );
          })}
        </PlainCard>
      )}
    </div>
  );
}

// ------------------------------- Экран «Объявления» -------------------------------
function NoticesScreen({ notifications = [], t, lang }) {
  const locale = LOCALE_OF[lang] || "ru-RU";
  if (notifications.length === 0) return <PlainCard><EmptyState text={t("notices_none")} icon={Bell} /></PlainCard>;
  return (
    <div className="space-y-2.5">
      {notifications.map((n) => (
        <PlainCard key={n.id} className="py-3.5" style={n.urgent ? { borderLeft: `4px solid ${RED}` } : {}}>
          {n.urgent && <div className="text-[10.5px] font-bold uppercase tracking-wide mb-1 flex items-center gap-1" style={{ color: RED }}><Megaphone size={12} />{t("important_notice")}</div>}
          <div className="text-[14px] font-medium leading-snug" style={{ color: "var(--ink)" }}>{n.text}</div>
          <div className="text-[11.5px] mt-1.5" style={{ color: "var(--ink-3)" }}>{n.senderName} · {ruDate(n.date, locale)}</div>
        </PlainCard>
      ))}
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
          <EmptyState text={t("no_finance_data")} icon={Receipt} />
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
          <EmptyState text={t("no_payments_yet")} icon={CreditCard} />
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
        <EmptyState text={t("rating_empty")} icon={Users} />
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
        <EmptyState text={t("shop_empty")} icon={ShoppingBag} />
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
  const homeworkReviewed = (student.homework || []).filter((h) => h.status === "reviewed" || h.status === "auto_accepted").length;
  const goodGrades = log.filter((r) => r.grade >= 4).length + (student.generalGrades || []).filter((g) => g.value >= 4).length;

  const list = [];
  if (streak >= 3) list.push({ icon: Flame, color: BRICK, labelKey: "ach_streak", n: streak });
  if (homeworkDone >= 1) list.push({ icon: BookOpen, color: PURPLE, labelKey: "ach_homework", n: homeworkDone });
  if (homeworkReviewed >= 3) list.push({ icon: CheckCircle2, color: GREEN_D, labelKey: "ach_reviewed", n: homeworkReviewed });
  if (goodGrades >= 3) list.push({ icon: Star, color: GOLD, labelKey: "ach_grades", n: goodGrades });
  if ((student.coins || 0) >= 100) list.push({ icon: CoinsIcon, color: "#B45309", labelKey: "ach_coins", n: student.coins });
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
                  <a.icon size={15} style={{ color: a.color }} />
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
                className="w-9 h-9 rounded-full flex items-center justify-center text-[12px] font-extrabold transition-all duration-150"
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
            <button onClick={() => changeTheme("light")} className="px-3.5 py-1.5 rounded-full text-[12px] font-medium flex items-center gap-1 transition-all duration-150" style={{ background: theme === "light" ? "var(--surface)" : "transparent", boxShadow: theme === "light" ? "0 2px 6px rgba(0,0,0,0.14)" : "none", color: "var(--ink)" }}><Sun size={13} />{t("theme_light")}</button>
            <button onClick={() => changeTheme("dark")} className="px-3.5 py-1.5 rounded-full text-[12px] font-medium flex items-center gap-1 transition-all duration-150" style={{ background: theme === "dark" ? "var(--surface)" : "transparent", boxShadow: theme === "dark" ? "0 2px 6px rgba(0,0,0,0.14)" : "none", color: "var(--ink)" }}><Moon size={13} />{t("theme_dark")}</button>
          </div>
        </div>
      </Card>

      <button onClick={onLogout} className="w-full text-[13px] font-medium py-3 rounded-2xl flex items-center justify-center gap-1.5" style={{ background: "var(--surface-alt)", color: "var(--ink)", opacity: 0.75 }}><LogOut size={14} />{t("logout")}</button>
      <p className="text-center text-[11px] pt-1" style={{ color: "var(--ink-3)" }}>Global Up · {APP_VERSION}</p>
    </div>
  );
}

/* -------------------------------- Экран входа -------------------------------- */
function LoginScreen({ phone, setPhone, password, setPassword, loginError, loginLoading, onLogin, lang, changeLang, theme, changeTheme, t }) {
  return (
    <div className={`theme-${theme} min-h-screen flex items-center justify-center p-4`} style={{ paddingTop: "calc(16px + var(--gu-safe-top, 0px))", background: PAPER }}>
      <style>{FONT_IMPORT}</style>
      <style>{THEME_VARS}</style>
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-2.5 mb-5">
          <div className="flex items-center gap-0.5 p-1 rounded-full" style={{ background: "var(--surface-alt)" }}>
            {["ru", "en", "uz"].map((l) => (
              <button
                key={l}
                onClick={() => changeLang(l)}
                className="w-9 h-9 rounded-full flex items-center justify-center text-[12px] font-extrabold transition-all duration-150"
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
            {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
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
    lesson_now: "идёт сейчас", lesson_in_min: "через {m} мин", lesson_in_hm: "через {h} ч {m} мин", lesson_also: "Ещё сегодня",
    homework_short: "Домашка", progress_short: "Прогресс", service_support_lesson_short: "Суппорт-урок", service_topic_reexplain_short: "Объяснить тему", service_materials_only_short: "Материалы",
    hw_sub_todo: "Есть несданные", hw_sub_checking: "Проверяется", hw_sub_done: "Всё сдано", avg_short: "балл", notices_none_short: "Нет новых",
    adm_home_blocked_short: "Закрой ДЗ, чтобы вернуть", adm_home_warn_short: "Закрой ДЗ до урока", hw_all_closed_sub_short: "Отлично!",
    study_title: "Учёба", hw_row_sub_todo: "Нужно: {what}", prog_row_att: "посещаемость {n}%", prog_row_avg: "средний балл {n}", notices_none: "Новых объявлений нет",
    service_support_lesson_sub: "Отдельный урок с учителем", service_topic_reexplain_sub: "Если тема осталась непонятной", service_materials_only_sub: "Презентация или материалы по теме",
    adm_home_blocked: "Нет допуска на урок", adm_home_blocked_sub: "Не закрыто ДЗ подряд: {n}. Нажми, чтобы закрыть", adm_home_warn: "Не закрыто ДЗ подряд: {n}", adm_home_warn_sub: "Закрой ДЗ, чтобы сохранить допуск", adm_home_override: "Учитель допустил тебя к уроку",
    today_lesson_short: "Сегодня", room_short: "каб.", hw_todo_now: "Сделать сейчас", hw_all_tasks: "Все задания", back: "Назад",
    hello_name: "Привет, {name}", next_lesson_label: "Следующий урок", today_short: "сегодня", adm_no_access_short: "Нет допуска на урок", adm_chip_yes: "Допуск", adm_chip_no: "Нет допуска",
    debt_tap_hint: "Нажмите, чтобы узнать, как оплатить", coins_how: "Как получить?", notices_title: "Объявления",
    hw_tasks_count: "дел: {n}", hw_all_closed_short: "Всё закрыто", hw_all_closed_title: "Все ДЗ закрыты", hw_all_closed_sub: "Отлично! Новое задание появится после урока.",
    hw_btn_submit: "Сдать", hw_btn_redo: "Переделать", hw_btn_quiz: "Пройти", hw_task_submit_sub: "нужно сдать", hw_task_redo_sub: "нужно исправить и отправить заново",
    hw_task_quiz_sub: "повтори тему и сдай мини-тест", hw_task_quiz_title: "Мини-тест", hw_task_checking_sub: "нейросеть проверяет…", hw_task_preparing_sub: "готовим повторение темы…", hw_more_tasks: "и ещё {n} — смотрите ниже",
    service_section_hint: "Нужна помощь учителя? Оставьте заявку", my_groups_title: "Мои группы", attendance_more: "Показать больше", attendance_less: "Свернуть",
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
    ai_checking: "Нейросеть проверяет работу… обычно 10–30 секунд", ai_title: "Разбор от нейросети", ai_disclaimer: "Нейросеть может ошибаться. Если не согласны — напишите учителю.", hw_accepted: "Принято ✓", hw_needs_redo: "Нужно доработать", hw_previous_attempt: "Предыдущая попытка", hw_show_notes: "Показать пометки ({n})", hw_submit_fixed: "Отправить исправленную работу", hw_mostly_done_note: "Почти всё сделано. Работу посмотрит учитель.", ai_submit_hint: "Работу сразу проверит нейросеть. Снимайте весь лист целиком, ровно, при хорошем свете, без бликов.", hw_redo_not_readable: "Фото не получилось разобрать. Переснимите ближе, при хорошем свете, весь лист целиком.", hw_redo_irrelevant: "Похоже, на фото не это задание. Проверьте и отправьте фото нужной работы.", hw_redo_not_done: "Задание не выполнено. Сделайте его и отправьте фото.", hw_redo_partial: "Выполнена только часть задания. Доделайте и отправьте ещё раз.", hw_redo_duplicate: "Это фото уже отправлялось раньше. Отправьте фото именно этой работы.", hw_redo_duplicate_other: "Такое фото уже отправлялось. Отправьте фото своей работы.", hw_redo_teacher_redo: "Учитель просит доработать:",
    lesson_cta_title: "Закрой ДЗ: повтори тему и сдай мини-тест", lesson_cta_desc: "{topics} · {n} вопросов · нужно 4 из 5", lesson_start: "Начать", lesson_generating: "Готовим для тебя объяснение темы и мини-тест…", lesson_closed_title: "ДЗ закрыто ✓", lesson_passed_desc: "Мини-тест сдан: {s}", lesson_waived: "Учитель закрыл ДЗ без теста", lesson_out_title: "Попытки закончились", lesson_out_desc: "Тест не сдан за все попытки. Подойди к учителю — он поможет разобраться и закроет ДЗ.", lesson_failed_title: "Тест не сдан ({s})", lesson_failed_desc: "Изучи материал ещё раз — будут новые вопросы", lesson_new_questions_wait: "Готовим новые вопросы…", lesson_reread: "Изучить", lesson_reread_note: "Прочитай объяснение ещё раз внимательно — дальше будет тест с новыми вопросами.", lesson_read_to_unlock: "Дочитай объяснение до конца, чтобы открыть тест", lesson_restudy_btn: "Изучить материал заново", hw_grade_locked: "Оценка появится, когда сдашь мини-тест", quiz_need: "нужно {n} из {t}", quiz_closed_note: "ДЗ закрыто. Оценка выставлена.", quiz_failed_note: "Нужно минимум {n} из {t}. Посмотри правильные ответы, изучи материал заново — и пройди тест с новыми вопросами.", lesson_title: "Повторение темы", lesson_topic: "Тема", step_learn: "Объяснение", step_quiz: "Тест", step_result: "Результат", lesson_rule: "Правило", lesson_examples: "Примеры", lesson_your_mistakes: "Твои ошибки", lesson_tip: "Совет", lesson_go_quiz: "К тесту ({n} вопросов)", quiz_question: "Вопрос {i} из {n}", quiz_next: "Далее", quiz_finish: "Проверить ответы", quiz_checking: "Проверяем…", quiz_passed_title: "Отлично! Тема усвоена", quiz_failed_title: "Пока не получилось", quiz_your_answer: "Твой ответ", quiz_correct_answer: "Правильно", quiz_no_answer: "нет ответа", quiz_done: "Готово", quiz_back_to_result: "К результату теста", lesson_banner: "Закрой ДЗ: повтори тему и сдай мини-тест", lesson_open: "Открыть", adm_blocked_title: "Нет допуска к уроку ({date})", adm_blocked_desc: "не закрыто ДЗ подряд: {n}. Закрой хотя бы одно — допуск вернётся.", adm_warning: "Не закрыто ДЗ подряд: {n}. Ещё одно — и не будет допуска к уроку", adm_warn_mode: "Не закрыто ДЗ подряд: {n}", adm_overridden: "Учитель допустил тебя к уроку ({date})", adm_how_to_close: "Закрыть ДЗ = сдать работу и сдать мини-тест (если он выдан)", adm_item_not_closed: "сдано, но не закрыто", adm_item_not_sent: "не сдано",
    ex_ok: "без ошибок", ex_not_done: "не выполнено", ex_unreadable: "не разобрать", ex_errors_btn: "ошибки ({n})", ex_hide_errors: "скрыть", hw_checked_exercises: "Проверено упражнений: {n}",
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
    lesson_now: "in progress", lesson_in_min: "in {m} min", lesson_in_hm: "in {h} h {m} min", lesson_also: "Also today",
    homework_short: "Homework", progress_short: "Progress", service_support_lesson_short: "Support lesson", service_topic_reexplain_short: "Explain a topic", service_materials_only_short: "Materials",
    hw_sub_todo: "Not submitted yet", hw_sub_checking: "Being checked", hw_sub_done: "All done", avg_short: "avg", notices_none_short: "Nothing new",
    adm_home_blocked_short: "Close your homework to get it back", adm_home_warn_short: "Close homework before class", hw_all_closed_sub_short: "Great job!",
    study_title: "Study", hw_row_sub_todo: "To do: {what}", prog_row_att: "attendance {n}%", prog_row_avg: "average {n}", notices_none: "No new announcements",
    service_support_lesson_sub: "A separate lesson with a teacher", service_topic_reexplain_sub: "If a topic is still unclear", service_materials_only_sub: "Slides or materials on a topic",
    adm_home_blocked: "Not admitted to class", adm_home_blocked_sub: "Homework not closed in a row: {n}. Tap to close it", adm_home_warn: "Homework not closed in a row: {n}", adm_home_warn_sub: "Close your homework to keep access", adm_home_override: "Your teacher admitted you to class",
    today_lesson_short: "Today", room_short: "room", hw_todo_now: "To do now", hw_all_tasks: "All tasks", back: "Back",
    hello_name: "Hi, {name}", next_lesson_label: "Next lesson", today_short: "today", adm_no_access_short: "Not admitted to class", adm_chip_yes: "Admitted", adm_chip_no: "Not admitted",
    debt_tap_hint: "Tap to see how to pay", coins_how: "How to earn?", notices_title: "Announcements",
    hw_tasks_count: "to do: {n}", hw_all_closed_short: "All closed", hw_all_closed_title: "All homework closed", hw_all_closed_sub: "Great! A new task will appear after class.",
    hw_btn_submit: "Submit", hw_btn_redo: "Redo", hw_btn_quiz: "Start", hw_task_submit_sub: "needs to be submitted", hw_task_redo_sub: "fix it and send again",
    hw_task_quiz_sub: "review the topic and pass the mini-test", hw_task_quiz_title: "Mini-test", hw_task_checking_sub: "the AI is checking…", hw_task_preparing_sub: "preparing the topic review…", hw_more_tasks: "and {n} more — see below",
    service_section_hint: "Need help from a teacher? Send a request", my_groups_title: "My groups", attendance_more: "Show more", attendance_less: "Show less",
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
    ai_checking: "The AI is checking your work… usually 10–30 seconds", ai_title: "AI review", ai_disclaimer: "The AI can make mistakes. If you disagree, message your teacher.", hw_accepted: "Accepted ✓", hw_needs_redo: "Needs more work", hw_previous_attempt: "Previous attempt", hw_show_notes: "Show notes ({n})", hw_submit_fixed: "Send the corrected work", hw_mostly_done_note: "Almost done. Your teacher will take a look.", ai_submit_hint: "The AI will check your work right away. Photograph the whole page, straight, in good light, without glare.", hw_redo_not_readable: "We couldn't read the photo. Retake it closer, in good light, with the whole page.", hw_redo_irrelevant: "This doesn't look like this task. Check and send a photo of the right work.", hw_redo_not_done: "The task isn't done. Do it and send a photo.", hw_redo_partial: "Only part of the task is done. Finish it and send again.", hw_redo_duplicate: "This photo was already sent before. Please send a photo of this work.", hw_redo_duplicate_other: "This photo was already sent. Please send a photo of your own work.", hw_redo_teacher_redo: "Your teacher asks you to improve it:",
    lesson_cta_title: "Close your homework: review and pass a mini-test", lesson_cta_desc: "{topics} · {n} questions · need 4 of 5", lesson_start: "Start", lesson_generating: "Preparing a topic review and mini-test for you…", lesson_closed_title: "Homework closed ✓", lesson_passed_desc: "Mini-test passed: {s}", lesson_waived: "Your teacher closed it without the test", lesson_out_title: "No attempts left", lesson_out_desc: "The test wasn't passed in all attempts. Talk to your teacher — they'll help and close the homework.", lesson_failed_title: "Test not passed ({s})", lesson_failed_desc: "Study the material again — new questions are coming", lesson_new_questions_wait: "Preparing new questions…", lesson_reread: "Study", lesson_reread_note: "Read the explanation carefully again — the next test will have new questions.", lesson_read_to_unlock: "Read the explanation to the end to unlock the test", lesson_restudy_btn: "Study the material again", hw_grade_locked: "Your grade appears after you pass the mini-test", quiz_need: "need {n} of {t}", quiz_closed_note: "Homework closed. Grade is set.", quiz_failed_note: "You need at least {n} of {t}. Check the correct answers, study again — then take a test with new questions.", lesson_title: "Topic review", lesson_topic: "Topic", step_learn: "Explanation", step_quiz: "Test", step_result: "Result", lesson_rule: "Rule", lesson_examples: "Examples", lesson_your_mistakes: "Your mistakes", lesson_tip: "Tip", lesson_go_quiz: "To the test ({n} questions)", quiz_question: "Question {i} of {n}", quiz_next: "Next", quiz_finish: "Check answers", quiz_checking: "Checking…", quiz_passed_title: "Great! You've got it", quiz_failed_title: "Not yet", quiz_your_answer: "Your answer", quiz_correct_answer: "Correct", quiz_no_answer: "no answer", quiz_done: "Done", quiz_back_to_result: "Back to test result", lesson_banner: "Close your homework: review and pass a mini-test", lesson_open: "Open", adm_blocked_title: "Not admitted to the lesson ({date})", adm_blocked_desc: "homework not closed in a row: {n}. Close at least one to be admitted again.", adm_warning: "Homework not closed in a row: {n}. One more and you won't be admitted", adm_warn_mode: "Homework not closed in a row: {n}", adm_overridden: "Your teacher admitted you to the lesson ({date})", adm_how_to_close: "Close homework = submit the work and pass the mini-test (if given)", adm_item_not_closed: "sent, not closed", adm_item_not_sent: "not sent",
    ex_ok: "no mistakes", ex_not_done: "not done", ex_unreadable: "unreadable", ex_errors_btn: "mistakes ({n})", ex_hide_errors: "hide", hw_checked_exercises: "Exercises checked: {n}",
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
    lesson_now: "hozir davom etmoqda", lesson_in_min: "{m} daqiqadan keyin", lesson_in_hm: "{h} soat {m} daqiqadan keyin", lesson_also: "Bugun yana",
    homework_short: "Uy vazifa", progress_short: "Natijalar", service_support_lesson_short: "Qo'shimcha dars", service_topic_reexplain_short: "Mavzuni tushuntirish", service_materials_only_short: "Materiallar",
    hw_sub_todo: "Topshirilmagan bor", hw_sub_checking: "Tekshirilmoqda", hw_sub_done: "Hammasi topshirildi", avg_short: "baho", notices_none_short: "Yangi yo'q",
    adm_home_blocked_short: "Qaytarish uchun vazifani yoping", adm_home_warn_short: "Darsgacha vazifani yoping", hw_all_closed_sub_short: "Ajoyib!",
    study_title: "O'qish", hw_row_sub_todo: "Kerak: {what}", prog_row_att: "davomat {n}%", prog_row_avg: "o'rtacha {n}", notices_none: "Yangi e'lonlar yo'q",
    service_support_lesson_sub: "O'qituvchi bilan alohida dars", service_topic_reexplain_sub: "Mavzu tushunarsiz qolgan bo'lsa", service_materials_only_sub: "Mavzu bo'yicha taqdimot yoki materiallar",
    adm_home_blocked: "Darsga ruxsat yo'q", adm_home_blocked_sub: "Ketma-ket yopilmagan vazifa: {n}. Yopish uchun bosing", adm_home_warn: "Ketma-ket yopilmagan vazifa: {n}", adm_home_warn_sub: "Ruxsatni saqlash uchun vazifani yoping", adm_home_override: "O'qituvchi sizni darsga qo'ydi",
    today_lesson_short: "Bugun", room_short: "xona", hw_todo_now: "Hozir qilish kerak", hw_all_tasks: "Barcha vazifalar", back: "Orqaga",
    hello_name: "Salom, {name}", next_lesson_label: "Keyingi dars", today_short: "bugun", adm_no_access_short: "Darsga ruxsat yo'q", adm_chip_yes: "Ruxsat bor", adm_chip_no: "Ruxsat yo'q",
    debt_tap_hint: "Qanday to'lashni bilish uchun bosing", coins_how: "Qanday olinadi?", notices_title: "E'lonlar",
    hw_tasks_count: "vazifa: {n}", hw_all_closed_short: "Hammasi yopildi", hw_all_closed_title: "Barcha vazifalar yopildi", hw_all_closed_sub: "Ajoyib! Yangi vazifa darsdan keyin chiqadi.",
    hw_btn_submit: "Topshirish", hw_btn_redo: "Qayta qilish", hw_btn_quiz: "Boshlash", hw_task_submit_sub: "topshirish kerak", hw_task_redo_sub: "tuzatib, qayta yuboring",
    hw_task_quiz_sub: "mavzuni takrorlab, mini-testdan o'ting", hw_task_quiz_title: "Mini-test", hw_task_checking_sub: "sun'iy intellekt tekshirmoqda…", hw_task_preparing_sub: "mavzu takrori tayyorlanmoqda…", hw_more_tasks: "yana {n} ta — pastda",
    service_section_hint: "O'qituvchi yordami kerakmi? Ariza qoldiring", my_groups_title: "Mening guruhlarim", attendance_more: "Ko'proq ko'rsatish", attendance_less: "Yig'ish",
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
    ai_checking: "Sun'iy intellekt ishni tekshirmoqda… odatda 10–30 soniya", ai_title: "Sun'iy intellekt tahlili", ai_disclaimer: "Sun'iy intellekt xato qilishi mumkin. Rozi bo'lmasangiz — o'qituvchiga yozing.", hw_accepted: "Qabul qilindi ✓", hw_needs_redo: "Qayta ishlash kerak", hw_previous_attempt: "Oldingi urinish", hw_show_notes: "Belgilarni ko'rsatish ({n})", hw_submit_fixed: "Tuzatilgan ishni yuborish", hw_mostly_done_note: "Deyarli hammasi bajarilgan. Ishni o'qituvchi ko'radi.", ai_submit_hint: "Ishni darhol sun'iy intellekt tekshiradi. Butun varaqni to'g'ri, yorug'da, yaltiramasdan suratga oling.", hw_redo_not_readable: "Rasmni o'qib bo'lmadi. Yaqinroq, yorug'da, butun varaqni qayta suratga oling.", hw_redo_irrelevant: "Rasmda bu vazifa emasga o'xshaydi. Tekshirib, kerakli ish rasmini yuboring.", hw_redo_not_done: "Vazifa bajarilmagan. Bajaring va rasmini yuboring.", hw_redo_partial: "Vazifaning faqat bir qismi bajarilgan. Tugatib, qayta yuboring.", hw_redo_duplicate: "Bu rasm avval yuborilgan. Aynan shu ish rasmini yuboring.", hw_redo_duplicate_other: "Bu rasm avval yuborilgan. O'z ishingiz rasmini yuboring.", hw_redo_teacher_redo: "O'qituvchi qayta ishlashni so'rayapti:",
    lesson_cta_title: "Vazifani yoping: mavzuni takrorlab, mini-testdan o'ting", lesson_cta_desc: "{topics} · {n} savol · 5 tadan 4 tasi kerak", lesson_start: "Boshlash", lesson_generating: "Siz uchun mavzu izohi va mini-test tayyorlanmoqda…", lesson_closed_title: "Vazifa yopildi ✓", lesson_passed_desc: "Mini-test topshirildi: {s}", lesson_waived: "O'qituvchi vazifani testsiz yopdi", lesson_out_title: "Urinishlar tugadi", lesson_out_desc: "Test barcha urinishlarda topshirilmadi. O'qituvchiga murojaat qiling — u yordam beradi va vazifani yopadi.", lesson_failed_title: "Test topshirilmadi ({s})", lesson_failed_desc: "Materialni qayta o'rganing — yangi savollar bo'ladi", lesson_new_questions_wait: "Yangi savollar tayyorlanmoqda…", lesson_reread: "O'rganish", lesson_reread_note: "Izohni yana diqqat bilan o'qing — keyingi testda yangi savollar bo'ladi.", lesson_read_to_unlock: "Testni ochish uchun izohni oxirigacha o'qing", lesson_restudy_btn: "Materialni qayta o'rganish", hw_grade_locked: "Baho mini-testni topshirgach paydo bo'ladi", quiz_need: "{t} tadan {n} ta kerak", quiz_closed_note: "Vazifa yopildi. Baho qo'yildi.", quiz_failed_note: "Kamida {t} tadan {n} ta kerak. To'g'ri javoblarni ko'ring, qayta o'rganing — so'ng yangi savollar bilan testdan o'ting.", lesson_title: "Mavzu takrori", lesson_topic: "Mavzu", step_learn: "Izoh", step_quiz: "Test", step_result: "Natija", lesson_rule: "Qoida", lesson_examples: "Misollar", lesson_your_mistakes: "Xatolaringiz", lesson_tip: "Maslahat", lesson_go_quiz: "Testga ({n} savol)", quiz_question: "{n} tadan {i}-savol", quiz_next: "Keyingi", quiz_finish: "Javoblarni tekshirish", quiz_checking: "Tekshirilmoqda…", quiz_passed_title: "Ajoyib! Mavzu o'zlashtirildi", quiz_failed_title: "Hozircha bo'lmadi", quiz_your_answer: "Javobingiz", quiz_correct_answer: "To'g'ri javob", quiz_no_answer: "javob yo'q", quiz_done: "Tayyor", quiz_back_to_result: "Test natijasiga", lesson_banner: "Vazifani yoping: mavzuni takrorlab, mini-testdan o'ting", lesson_open: "Ochish", adm_blocked_title: "Darsga ruxsat yo'q ({date})", adm_blocked_desc: "ketma-ket yopilmagan vazifalar: {n}. Bittasini yoping — ruxsat qaytadi.", adm_warning: "Ketma-ket yopilmagan vazifalar: {n}. Yana bittasi — darsga ruxsat bo'lmaydi", adm_warn_mode: "Ketma-ket yopilmagan vazifalar: {n}", adm_overridden: "O'qituvchi sizni darsga ruxsat berdi ({date})", adm_how_to_close: "Vazifani yopish = ishni topshirish va mini-testdan o'tish (agar berilgan bo'lsa)", adm_item_not_closed: "topshirilgan, yopilmagan", adm_item_not_sent: "topshirilmagan",
    ex_ok: "xatosiz", ex_not_done: "bajarilmagan", ex_unreadable: "o'qib bo'lmaydi", ex_errors_btn: "xatolar ({n})", ex_hide_errors: "yashirish", hw_checked_exercises: "Tekshirilgan mashqlar: {n}",
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
  const [tab, setTabRaw] = useState("home");
  // Отдельные экраны, открываемые с главной: "homework" | "progress" | "notices" (как вкладка, со стрелкой «назад»).
  const [screen, setScreen] = useState(null);
  const setTab = (k) => { setScreen(null); setTabRaw(k); };
  const openScreen = (sc) => { haptic("light"); setTabRaw("home"); setScreen(sc); try { window.scrollTo({ top: 0 }); } catch {} };
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

  // Цвет шапки/фона Telegram под тему приложения — в полноэкранном режиме от него зависит, будут ли
  // видны часы и значки телефона сверху (светлые на тёмном фоне, тёмные на светлом).
  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (!tg) return;
    const color = theme === "dark" ? "#16171C" : "#F7F5F0";
    // Сверху теперь красная фирменная шапка — красим под неё и полосу Telegram (часы будут светлыми).
    const headerColor = theme === "dark" ? "#5B1414" : "#DC2626";
    try { tg.setHeaderColor && tg.setHeaderColor(headerColor); } catch {}
    try { tg.setBackgroundColor && tg.setBackgroundColor(color); } catch {}
    try { tg.setBottomBarColor && tg.setBottomBarColor(color); } catch {}
  }, [theme]);

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
      // Отступы под системные элементы: в полноэкранном режиме сверху лежат часы телефона и кнопки
      // Telegram («Закрыть», «⋯»), снизу — полоска «домой». Telegram сообщает их размеры, а мы кладём
      // их в CSS-переменные --gu-safe-top / --gu-safe-bottom, на которые опирается весь интерфейс.
      const applySafeArea = () => {
        const sa = tg.safeAreaInset || {};
        const ca = tg.contentSafeAreaInset || {};
        const root = document.documentElement.style;
        root.setProperty("--gu-safe-top", `${(sa.top || 0) + (ca.top || 0)}px`);
        root.setProperty("--gu-safe-bottom", `${(sa.bottom || 0) + (ca.bottom || 0)}px`);
      };
      applySafeArea();
      ["safeAreaChanged", "contentSafeAreaChanged", "fullscreenChanged", "viewportChanged"].forEach((ev) => { try { tg.onEvent(ev, applySafeArea); } catch {} });
      // Полноэкранный режим — только на телефонах (на компьютере он растянул бы окно Telegram на весь монитор).
      const isPhone = ["ios", "android", "android_x"].includes(tg.platform);
      const supports = (v) => { try { return !!tg.isVersionAtLeast && tg.isVersionAtLeast(v); } catch { return false; } };
      if (isPhone && supports("8.0") && tg.requestFullscreen && !tg.isFullscreen) { try { tg.requestFullscreen(); } catch {} }
      // Чтобы приложение не закрывалось случайным свайпом вниз (особенно при «потянуть, чтобы обновить»).
      if (supports("7.7") && tg.disableVerticalSwipes) { try { tg.disableVerticalSwipes(); } catch {} }
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

  // Пока нейросеть проверяет чью-то работу — обновляем данные чаще (раз в 5 секунд), чтобы разбор
  // появился почти сразу. Как только проверок «в процессе» нет, возвращаемся к обычным 25 секундам.
  const hasChecking = (students || []).some((st) => (st.homework || []).some((h) => h.aiStatus === "checking" || h.aiLessonStatus === "generating" || h.aiLessonStatus === "regenerating"));
  useEffect(() => {
    if (!hasChecking) return;
    const fast = setInterval(() => silentRefresh(), 5000);
    return () => clearInterval(fast);
  }, [hasChecking, phase, initData, phone, password]);

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

  // Системная кнопка «Назад» Telegram на отдельных экранах.
  useEffect(() => {
    const bb = window.Telegram?.WebApp?.BackButton;
    if (!bb) return;
    const back = () => setScreen(null);
    try { if (screen) { bb.show(); bb.onClick(back); } else bb.hide(); } catch {}
    return () => { try { bb.offClick(back); } catch {} };
  }, [screen]);
  // Если ученик вышел посреди мини-теста — при входе сразу открываем экран ДЗ (а там и сам тест).
  const restoredScreenRef = useRef(false);
  useEffect(() => {
    if (!student || restoredScreenRef.current) return;
    restoredScreenRef.current = true;
    const key = `gu_open_lesson_${student.id}`;
    let local = null; try { local = localStorage.getItem(key); } catch {}
    if (local) { setScreen("homework"); return; }
    storageGet(key).then((v) => { if (v) setScreen((cur) => cur || "homework"); });
  }, [student?.id]);

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
        studentId: student.id, groupId, materialId, note, files, lang,
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

  // Сдача мини-теста после повторения темы — проверяет сервер, сюда приходит результат.
  const handleSubmitQuiz = async (submissionId, answers) => {
    if (!student) return null;
    pendingMutationsRef.current++;
    try {
      const data = await submitQuizRequest(initData, phone.trim() || null, password.trim() || null, { studentId: student.id, submissionId, answers });
      if (data.error) { haptic("error"); setToast(data.error); setTimeout(() => setToast(""), 3500); return null; }
      if (!data.linked) { haptic("error"); setToast(t("identity_error")); setTimeout(() => setToast(""), 4000); return null; }
      applyStudents(data.students);
      lastMutationAppliedRef.current++;
      haptic(data.quiz?.passed ? "success" : "warning");
      return data.quiz;
    } catch (e) {
      setToast(t("server_unreachable", { msg: String(e?.message || e) }));
      setTimeout(() => setToast(""), 3500);
      return null;
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
      <div className={`theme-${theme} min-h-screen pb-10`} style={{ paddingTop: "var(--gu-safe-top, 0px)", background: PAPER }}>
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
      <div className={`theme-${theme} min-h-screen flex items-center justify-center p-4`} style={{ paddingTop: "calc(16px + var(--gu-safe-top, 0px))", background: PAPER, color: INK }}>
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
    <div className={`theme-${theme} min-h-screen anim-fade relative`} style={{ background: PAPER, color: INK, paddingBottom: "calc(100px + var(--gu-safe-bottom, env(safe-area-inset-bottom, 0px)))" }}>
      <style>{FONT_IMPORT}</style>
      <style>{THEME_VARS}</style>

      {coinGain && <ConfettiOverlay amount={coinGain.amount} grade={coinGain.grade} onDone={() => setCoinGain(null)} t={t} />}

      {pullDistance > 0 && (
        <div className="fixed top-0 left-0 right-0 flex justify-center z-40 pointer-events-none" style={{ paddingTop: "calc(10px + var(--gu-safe-top, 0px))", opacity: Math.min(1, pullDistance / 40) }}>
          <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "var(--surface)", boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}>
            <RefreshCw size={15} style={{ color: RED, transform: `rotate(${pullDistance * 4}deg)`, opacity: pullDistance >= PULL_THRESHOLD ? 1 : 0.5 }} />
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed left-4 right-4 z-50 px-4 py-3 rounded-2xl text-[13px] font-medium text-white text-center" style={{ top: "calc(16px + var(--gu-safe-top, 0px))", background: RED_D, boxShadow: "0 4px 16px rgba(0,0,0,0.2)" }}>
          {toast}
        </div>
      )}

      {/* Красная фирменная шапка: на главной она выше — на ней лежат баланс и монеты, а карточка урока «заходит» на неё. */}
      <div aria-hidden className="absolute left-0 right-0 top-0 overflow-hidden pointer-events-none" style={{ height: tab === "home" && !screen ? "calc(var(--gu-safe-top, 0px) + 236px)" : "calc(var(--gu-safe-top, 0px) + 92px)", background: theme === "dark" ? "linear-gradient(160deg, #7F1D1D, #5B1414 55%, #3B0D0D)" : "linear-gradient(160deg, #EF4444, #B91C1C 60%, #7F1D1D)", borderRadius: "0 0 32px 32px", transition: "height .25s ease" }}>
        <div className="absolute rounded-full" style={{ width: 220, height: 220, right: -70, top: -60, background: "rgba(255,255,255,0.08)" }} />
        <div className="absolute rounded-full" style={{ width: 140, height: 140, left: -50, bottom: -50, background: "rgba(255,255,255,0.06)" }} />
      </div>

      <div className="relative px-4 pb-3 flex items-center justify-between gap-2 text-white" style={{ paddingTop: "calc(18px + var(--gu-safe-top, 0px))" }}>
        {screen ? (
          <div className="flex items-center gap-2.5 min-w-0">
            <button onClick={() => { haptic("light"); setScreen(null); }} className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 active:scale-90 transition-transform" style={GLASS_BTN} aria-label={t("back")}><ChevronLeft size={20} /></button>
            <div className="text-[18px] font-extrabold truncate">{screen === "homework" ? t("homework") : screen === "progress" ? t("progress_title") : t("notices_title")}</div>
          </div>
        ) : (
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="rounded-full shrink-0" style={{ boxShadow: "0 0 0 2.5px rgba(255,255,255,0.85)", borderRadius: 999 }}>
            <Avatar name={student?.name || "?"} size={42} avatarUrl={student?.avatarUrl} />
          </div>
          <div className="min-w-0">
            <div className="text-[16.5px] font-extrabold leading-tight truncate">{tab === "home" ? t("hello_name", { name: (student?.name || "").split(" ")[0] }) : student?.name}</div>
            {students.length > 1 ? (
              <div className="relative inline-flex items-center mt-0.5">
                <select value={activeId} onChange={(e) => setActiveId(e.target.value)} className="appearance-none text-[12px] font-semibold pl-2.5 pr-6 py-0.5 rounded-full outline-none text-white" style={{ background: "rgba(255,255,255,0.18)", border: "1px solid rgba(255,255,255,0.25)", fontSize: 12 }}>
                  {students.map((s) => <option key={s.id} value={s.id} style={{ color: "#1A1A17" }}>{s.name}</option>)}
                </select>
                <ChevronDownIcon size={13} className="absolute right-1.5 pointer-events-none" />
              </div>
            ) : (
              <div className="text-[11.5px] mt-0.5 truncate" style={{ color: "rgba(255,255,255,0.75)" }}>{(student?.groups || []).map((g) => g.name).join(" · ") || student?.group?.name || "Global Up"}</div>
            )}
          </div>
        </div>
        )}
        <div className="flex items-center gap-1.5 shrink-0">
          {student?.logoUrl && (
            <img src={student.logoUrl} alt="Global Up" className="w-9 h-9 rounded-full object-cover shrink-0" style={{ border: "2px solid rgba(255,255,255,0.6)" }} />
          )}
          {!screen && (student?.notifications || []).length > 0 && (
            <button onClick={() => openScreen("notices")} className="relative w-9 h-9 rounded-full flex items-center justify-center active:scale-90 transition-transform" style={GLASS_BTN} aria-label={t("notices_title")}>
              <Bell size={17} />
              <span className="absolute -top-1 -right-1 min-w-[17px] h-[17px] px-1 rounded-full text-[10px] font-black flex items-center justify-center" style={{ background: "#fff", color: RED_D }}>{student.notifications.length}</span>
            </button>
          )}
          <div className="relative" style={{ display: screen ? "none" : "block" }}>
            <button onClick={() => setLangMenuOpen((v) => !v)} className="h-9 px-2.5 rounded-full flex items-center justify-center gap-1 text-[11.5px] font-extrabold active:scale-90 transition-transform" style={GLASS_BTN}>
              <Globe size={15} />{LANG_FLAGS[lang]}
            </button>
            {langMenuOpen && (
              <>
                <button aria-label="close" className="fixed inset-0 z-30 cursor-default" onClick={() => setLangMenuOpen(false)} />
                <div className="absolute right-0 mt-2 p-2 rounded-2xl z-40 w-[176px]" style={{ background: "var(--surface)", color: "var(--ink)", boxShadow: "0 8px 24px rgba(0,0,0,0.18)", border: `1px solid ${LINE}` }}>
                  {[["ru", "Русский"], ["en", "English"], ["uz", "O'zbekcha"]].map(([l, name]) => (
                    <button key={l} onClick={() => { changeLang(l); setLangMenuOpen(false); }} className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-[13px] font-semibold" style={{ background: lang === l ? "var(--surface-alt)" : "transparent" }}>
                      <span className="w-7 h-5 rounded-md text-[10px] font-black flex items-center justify-center" style={{ background: lang === l ? RED : "var(--surface-alt)", color: lang === l ? "#fff" : "var(--ink)" }}>{LANG_FLAGS[l]}</span>{name}
                    </button>
                  ))}
                  <div className="flex items-center gap-1 pt-1.5 mt-1" style={{ borderTop: `1px solid ${LINE}` }}>
                    <button onClick={() => changeTheme("light")} className="flex-1 text-[11.5px] font-semibold py-1.5 rounded-full flex items-center justify-center gap-1" style={{ background: theme === "light" ? "var(--surface-alt)" : "transparent" }}><Sun size={13} />{t("theme_light")}</button>
                    <button onClick={() => changeTheme("dark")} className="flex-1 text-[11.5px] font-semibold py-1.5 rounded-full flex items-center justify-center gap-1" style={{ background: theme === "dark" ? "var(--surface-alt)" : "transparent" }}><Moon size={13} />{t("theme_dark")}</button>
                  </div>
                </div>
              </>
            )}
          </div>
          <button onClick={silentRefresh} disabled={refreshing} className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 active:scale-90 transition-transform" style={GLASS_BTN} title={t("refresh")}>
            <RefreshCw size={15} style={{ animation: refreshing ? "spin 0.7s linear infinite" : "none" }} />
          </button>
        </div>
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      {!student ? (
        <div className="relative px-4"><EmptyState text={t("empty_student")} /></div>
      ) : (
        <div className="relative px-4" style={{ paddingTop: tab === "home" && !screen ? 0 : 26 }}>
          {tab === "home" && !screen && <HomeTab student={student} notifications={student.notifications || []} t={t} lang={lang} onRequestService={handleRequestService} onOpenScreen={openScreen} />}
          {tab === "home" && screen === "homework" && <HomeworkScreen student={student} t={t} lang={lang} onSubmitHomework={handleSubmitHomework} onSubmitQuiz={handleSubmitQuiz} />}
          {tab === "home" && screen === "progress" && <ProgressScreen student={student} t={t} lang={lang} />}
          {tab === "home" && screen === "notices" && <NoticesScreen notifications={student.notifications || []} t={t} lang={lang} />}
          {tab === "schedule" && <ScheduleTab student={student} t={t} lang={lang} />}
          {tab === "rating" && <RatingTab student={student} t={t} />}
          {tab === "shop" && <ShopTab student={student} shopItems={shopItems} onRedeem={handleRedeem} redeeming={redeeming} t={t} lang={lang} />}
          {tab === "profile" && <ProfileTab student={student} onLogout={handleLogout} t={t} lang={lang} changeLang={changeLang} theme={theme} changeTheme={changeTheme} onUpdateAvatar={handleUpdateAvatar} />}
        </div>
      )}

      {/* Нижняя навигация — тёмная «таблетка» по центру; активная вкладка красная и с подписью. */}
      {(() => {
        const badge = homeBadgeCount(student);
        return (
          <div className="fixed left-0 right-0 z-20 flex justify-center px-3 pointer-events-none" style={{ bottom: "calc(14px + var(--gu-safe-bottom, env(safe-area-inset-bottom, 0px)))" }}>
            <nav className="pointer-events-auto flex items-center gap-1 p-1.5 rounded-full" style={{ background: theme === "dark" ? "#2E2F36" : "#1A1A17", boxShadow: "0 10px 30px rgba(0,0,0,0.28)" }}>
              {tabsFor(t).map((tabItem) => {
                const active = tab === tabItem.key;
                return (
                  <button key={tabItem.key} onClick={() => { haptic("light"); setTab(tabItem.key); try { window.scrollTo({ top: 0 }); } catch {} }} aria-label={tabItem.label} className="relative h-12 rounded-full flex items-center justify-center gap-1.5 transition-all duration-200 active:scale-95" style={{ background: active ? RED : "transparent", padding: active ? "0 16px" : "0", width: active ? "auto" : 48 }}>
                    <tabItem.icon size={20} style={{ color: active ? "#fff" : "#9a9a94" }} strokeWidth={active ? 2.4 : 2} />
                    {active && <span className="text-[12.5px] font-bold text-white whitespace-nowrap">{tabItem.label}</span>}
                    {tabItem.key === "home" && badge > 0 && !active && (
                      <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 px-1 rounded-full text-[9.5px] font-black text-white flex items-center justify-center" style={{ background: RED, boxShadow: "0 0 0 2px " + (theme === "dark" ? "#2E2F36" : "#1A1A17") }}>{badge}</span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        );
      })()}
    </div>
  );
}
