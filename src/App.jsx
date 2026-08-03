import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Home, Trophy, ShoppingBag, User, Calendar, MapPin, CheckCircle2, XCircle, Clock,
  FileText, Link2, Wallet, Coins as CoinsIcon, PartyPopper, Megaphone, Flame,
  Award, Medal, TrendingUp, TrendingDown, Minus, LogOut, RefreshCw, Eye, EyeOff, Gift, GraduationCap, Phone, PiggyBank, Info, Users, X,
} from "lucide-react";

/* ------------------------------ Настройка ------------------------------ */
const EDGE_FUNCTION_URL = "https://inswhfcwbybykwdthekg.supabase.co/functions/v1/mini-app-data";
const ANON_KEY = "sb_publishable_Lm1ZUwWhD_bq1IwpAFH8ZQ_OU2ph4W4";

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

/* -------------------------------- UI-атомы -------------------------------- */
function Card({ children, className = "", style = {} }) {
  return <div className={`rounded-3xl ${className}`} style={{ background: "var(--surface)", boxShadow: "0 1px 3px rgba(26,26,23,0.06), 0 1px 2px rgba(26,26,23,0.04)", ...style }}>{children}</div>;
}
function EmptyState({ text, icon: Icon = FileText }) {
  return (
    <div className="py-8 text-center">
      <Icon size={26} className="mx-auto mb-2 opacity-25" />
      <p className="text-[12.5px] opacity-45">{text}</p>
    </div>
  );
}
function Avatar({ name, size = 40 }) {
  const colors = [[RED, RED_D], [BLUE, "#1E40AF"], [PURPLE, "var(--soft-purple-fg)"], [GOLD, "#B45309"], [GREEN, GREEN_D], [BRICK, "#9A3412"]];
  let hash = 0;
  for (let i = 0; i < (name || "").length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  const [c1, c2] = colors[hash % colors.length];
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

function ProgressCard({ log, generalGrades = [], t }) {
  const total = log.length;
  const present = log.filter((r) => r.present).length;
  const pct = total ? Math.round((present / total) * 100) : 0;
  let streak = 0;
  for (const r of log) { if (r.present) streak++; else break; }

  // Светофор: красный / жёлтый / зелёный — понятно с одного взгляда
  const zone = total === 0 ? "none" : pct >= 90 ? "green" : pct >= 60 ? "yellow" : "red";
  const zoneColors = {
    green: { bg: "var(--soft-green-bg)", ring: GREEN_D, text: "var(--soft-green-fg)", label: t("progress_great") },
    yellow: { bg: "var(--soft-yellow-bg)", ring: GOLD, text: "var(--soft-yellow-fg)", label: t("progress_ok") },
    red: { bg: "var(--soft-red-bg)", ring: RED_D, text: "var(--soft-red-fg)", label: t("progress_bad") },
    none: { bg: PAPER, ring: "#D1D0C5", text: "#9C9A90", label: t("progress_none") },
  }[zone];

  const trend = trendArrow(log);
  const lessonGrades = log.filter((r) => r.grade).map((r) => r.grade);
  const allGrades = [...lessonGrades, ...generalGrades.map((g) => g.value)];
  const avgGrade = allGrades.length ? (allGrades.reduce((a, b) => a + b, 0) / allGrades.length).toFixed(1) : null;

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
            {avgGrade && (
              <div>
                <div className="text-[17px] font-extrabold leading-none">{avgGrade}</div>
                <div className="text-[10px] opacity-45 mt-1">{t("avg_grade")}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
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
function ConfettiOverlay({ amount, onDone, t }) {
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
        <div className="text-[52px] leading-none">🪙</div>
        <div className="text-[30px] font-extrabold mt-2" style={{ color: "#B45309" }}>+{amount} GC</div>
        <div className="text-[13px] opacity-50 mt-1.5">{t ? t("coins_awarded") : "Начислены GlobalCoins!"}</div>
      </div>
      <style>{`@keyframes confettiFall { to { transform: translateY(115vh) rotate(720deg); opacity: 0.4; } }`}</style>
    </div>
  );
}

function HomeTab({ student, notifications = [], t, lang }) {
  const locale = LOCALE_OF[lang] || "ru-RU";
  const [showCoinsInfo, setShowCoinsInfo] = useState(false);
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
            <button onClick={() => setShowCoinsInfo(true)} className="w-5 h-5 rounded-full flex items-center justify-center shrink-0" style={{ background: "rgba(255,255,255,0.25)" }}>
              <Info size={11} />
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

      <ProgressCard log={log} generalGrades={student.generalGrades || []} t={t} />

      {hasDebt && (
        <Card className="p-4" style={{ border: `1.5px solid ${RED_L}` }}>
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-[13.5px] font-bold flex items-center gap-1.5"><Wallet size={15} style={{ color: RED_D }} /> {t("month_breakdown")}</h3>
          </div>
          {student.discount > 0 && (
            <div className="text-[11.5px] font-semibold mt-1 mb-2 px-2.5 py-1 rounded-full inline-flex items-center gap-1" style={{ background: "var(--soft-yellow-bg)", color: "var(--soft-yellow-fg)" }}><PartyPopper size={12} /> {t("discount_label", { pct: student.discount })}</div>
          )}
          {(student.monthlyDebts || []).length > 0 && (
            <div className="mt-2 space-y-1.5">
              {[...student.monthlyDebts].sort((a, b) => a.month.localeCompare(b.month)).map((md) => (
                <div key={md.month} className="flex items-center justify-between text-[12.5px] px-3 py-2 rounded-xl" style={{ background: PAPER }}>
                  <span className="capitalize">{new Date(md.month + "-01").toLocaleDateString(locale, { month: "long", year: "numeric" })}</span>
                  <span className="font-semibold">{fmt(md.amount)} {lang === "ru" ? "сум" : lang === "uz" ? "so'm" : "UZS"}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Расписание — плашка градиентом */}
      {(student.groups || []).length === 0 ? (
        <div className="rounded-3xl p-5 text-white relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${RED}, ${RED_D})` }}>
          <p className="text-[13.5px] opacity-90">{t("no_group")}</p>
        </div>
      ) : (
        student.groups.map((g) => (
          <div key={g.id} className="rounded-3xl p-5 text-white relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${RED}, ${RED_D})` }}>
            <div className="absolute -right-6 -top-6 w-28 h-28 rounded-full" style={{ background: "rgba(255,255,255,0.08)" }} />
            <div className="absolute -right-2 bottom-2 w-16 h-16 rounded-full" style={{ background: "rgba(255,255,255,0.08)" }} />
            <p className="text-[11px] font-medium opacity-80 uppercase tracking-wide">{g.course}</p>
            <h2 className="text-[19px] font-bold mt-0.5">{g.name}</h2>
            <div className="flex items-center gap-3 mt-3 text-[12.5px]">
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-full" style={{ background: "rgba(255,255,255,0.18)" }}><Calendar size={12} className="inline mr-1 -mt-0.5" />{scheduleText(g, t("no_schedule"))}</span>
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-full" style={{ background: "rgba(255,255,255,0.18)" }}><MapPin size={12} className="inline mr-1 -mt-0.5" />{g.room}</span>
            </div>
            {g.teacherName && <p className="text-[12px] mt-2 opacity-90">{t("teacher_label")}: {g.teacherName}</p>}
          </div>
        ))
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
          <EmptyState text={t("no_attendance")} icon={FileText} />
        ) : (
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
        )}
      </Card>

      {/* ДЗ / материалы */}
      <Card className="p-4">
        <h3 className="text-[14.5px] font-bold mb-3 flex items-center gap-1.5"><FileText size={16} />{t("homework")}</h3>
        {materials.length === 0 ? (
          <EmptyState text={t("no_homework")} icon={FileText} />
        ) : (
          <div className="space-y-2">
            {materials.map((m) => (
              <div key={m.id} className="p-3 rounded-2xl" style={{ background: "var(--soft-yellow-bg-2)", border: "1px solid var(--soft-yellow-border)" }}>
                <div className="text-[11px] font-bold uppercase tracking-wide" style={{ color: "#B45309" }}>{new Date(m.date).toLocaleDateString(locale, { day: "2-digit", month: "long" })}</div>
                {m.text && <div className="text-[13px] mt-1 leading-snug">{m.text}</div>}
                {m.link && <a href={m.link} target="_blank" rel="noreferrer" className="text-[12.5px] mt-1.5 font-medium flex items-center gap-1" style={{ color: BLUE }}><Link2 size={13} className="inline mr-1 -mt-0.5" />{t("open_material")}</a>}
              </div>
            ))}
          </div>
        )}
      </Card>
      {showCoinsInfo && <CoinsInfoPopup onClose={() => setShowCoinsInfo(false)} t={t} />}
    </div>
  );
}

/* ------------------------------- Рейтинг ------------------------------- */
function RatingTab({ student, t }) {
  const groupmates = student.groupmates || [];
  const myGroups = student.groups || [];
  if (myGroups.length === 0) return <EmptyState text={t("rating_no_group")} icon={Trophy} />;
  const podiumBg = ["linear-gradient(135deg,#FCD34D,#F59E0B)", "linear-gradient(135deg,#D1D5DB,#9CA3AF)", "linear-gradient(135deg,#FCA5A5,#EA580C)"];
  return (
    <div className="space-y-3">
      <div className="rounded-3xl p-5 text-white text-center" style={{ background: `linear-gradient(135deg, ${GOLD}, #B45309)` }}>
        <Trophy size={26} className="mx-auto" />
        <h2 className="text-[16px] font-bold mt-1">{t("rating_title")}</h2>
        <p className="text-[12px] opacity-85 mt-0.5">{t("rating_subtitle", { name: myGroups.map((g) => g.name).join(", ") })}</p>
      </div>
      {groupmates.length === 0 ? (
        <EmptyState text={t("rating_empty")} icon={GraduationCap} />
      ) : (
        <Card className="p-2">
          {groupmates.map((m, i) => {
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
                <Avatar name={m.name} size={36} />
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
          <div className="flex items-center gap-1.5">
            <p className="text-[11px] font-medium opacity-80 uppercase tracking-wide">{t("your_balance")}</p>
            <button onClick={() => setShowCoinsInfo(true)} className="w-4.5 h-4.5 rounded-full flex items-center justify-center shrink-0" style={{ background: "rgba(255,255,255,0.25)", width: 18, height: 18 }}>
              <Info size={10} />
            </button>
          </div>
          <h2 className="text-[26px] font-extrabold mt-0.5">{student.coins} <span className="text-[15px] font-semibold opacity-90">GC</span></h2>
        </div>
        <CoinsIcon size={30} className="opacity-90" />
      </div>
      {showCoinsInfo && <CoinsInfoPopup onClose={() => setShowCoinsInfo(false)} t={t} />}
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

function ProfileTab({ student, onLogout, t, lang, changeLang, theme, changeTheme }) {
  const locale = LOCALE_OF[lang] || "ru-RU";
  return (
    <div className="space-y-3">
      <Card className="p-6 text-center">
        <Avatar name={student.name} size={72} />
        <h2 className="text-[17px] font-bold mt-3">{student.name}</h2>
        {student.phone && <p className="text-[13px] opacity-50 mt-0.5">{student.phone}</p>}
        <div className="flex items-center justify-center gap-2 mt-3">
          <span className="text-[13px] font-bold px-3 py-1.5 rounded-full" style={{ background: "var(--soft-yellow-bg)", color: "var(--soft-yellow-fg)" }}><CoinsIcon size={13} className="inline mr-1 -mt-0.5" />{student.coins} GC</span>
          {student.discount > 0 && <span className="text-[13px] font-bold px-3 py-1.5 rounded-full" style={{ background: "var(--soft-green-bg)", color: GREEN_D }}>−{student.discount}%</span>}
        </div>
      </Card>
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
          <div className="flex items-center justify-between py-1.5"><span className="opacity-50">{t("debt")}</span><span className="font-semibold" style={{ color: student.debt > 0 ? RED_D : GREEN_D }}>{fmt(student.debt)} {lang === "ru" ? "сум" : lang === "uz" ? "so'm" : "UZS"}</span></div>
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
      {(student.payments || []).length > 0 && (
        <Card className="p-4">
          <h3 className="text-[13.5px] font-bold mb-2.5">{t("recent_payments")}</h3>
          <div className="space-y-1.5">
            {[...student.payments].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 6).map((p, i) => (
              <div key={i} className="flex items-center justify-between text-[12.5px]">
                <span className="opacity-55 mono">{ruDate(p.date, locale)}</span>
                <span className="font-semibold" style={{ color: GREEN_D }}>+{fmt(p.amount)} {lang === "ru" ? "сум" : lang === "uz" ? "so'm" : "UZS"}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

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
    tab_home: "Главная", tab_rating: "Рейтинг", tab_shop: "Магазин", tab_profile: "Профиль",
    balance: "Баланс", debt: "Долг", debt_none: "Долгов нет", debt_credit_note: "В счёт след. месяца",
    coins: "GlobalCoins", credit_note: "На балансе {sum} сум — уменьшит следующее начисление",
    progress_title: "Мой прогресс", progress_none: "Пока нет данных",
    progress_great: "Отлично! Продолжай в том же духе", progress_ok: "Неплохо, но можно лучше",
    progress_bad: "Много пропусков — постарайся не пропускать",
    trend_up: "Растёт", trend_down: "Снижается", trend_same: "Стабильно",
    lessons_attended: "занятий посещено", streak_days: "подряд без пропусков", avg_grade: "средний балл",
    no_group: "Пока не закреплена группа", teacher_label: "Преподаватель",
    attendance_grades: "Посещаемость и оценки", no_attendance: "Пока нет отметок посещаемости",
    homework: "Домашнее задание", no_homework: "Пока нет домашних заданий", open_material: "Открыть материал",
    important_notice: "Важное уведомление",
    your_balance: "Ваш баланс", shop_empty: "Магазин пока пуст", buy: "Купить", buy_confirm: "Точно купить?",
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
    empty_student: "Ученик не найден", refresh: "Обновить",
    rating_title: "Рейтинг группы", rating_subtitle: "{name} · по GlobalCoins",
    rating_no_group: "Рейтинг появится, когда закрепят группу", rating_empty: "В группе пока никого нет",
    avg_grade_line: "Средний балл: {value}", you_suffix: " (вы)",
    info_title: "Информация", group_label: "Группа", course_label: "Курс",
    recent_payments: "Последние оплаты", teacher_fallback: "преподавателю",
    identity_error: "Не удалось подтвердить личность — откройте приложение заново и попробуйте снова.",
    order_sent: "Заявка отправлена! Дождитесь выдачи у администратора.",
    coins_awarded: "Начислены GlobalCoins!", no_schedule: "не задано",
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
    tab_home: "Home", tab_rating: "Rating", tab_shop: "Shop", tab_profile: "Profile",
    balance: "Balance", debt: "Debt", debt_none: "No debt", debt_credit_note: "Credit for next month",
    coins: "GlobalCoins", credit_note: "Balance: {sum} — will reduce your next charge",
    progress_title: "My progress", progress_none: "No data yet",
    progress_great: "Great! Keep it up", progress_ok: "Not bad, but could be better",
    progress_bad: "Too many absences — try not to miss classes",
    trend_up: "Improving", trend_down: "Declining", trend_same: "Stable",
    lessons_attended: "lessons attended", streak_days: "in a row, no misses", avg_grade: "average grade",
    no_group: "No group assigned yet", teacher_label: "Teacher",
    attendance_grades: "Attendance & grades", no_attendance: "No attendance records yet",
    homework: "Homework", no_homework: "No homework yet", open_material: "Open material",
    important_notice: "Important notice",
    your_balance: "Your balance", shop_empty: "Shop is empty for now", buy: "Buy", buy_confirm: "Confirm purchase?",
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
    empty_student: "Student not found", refresh: "Refresh",
    rating_title: "Group rating", rating_subtitle: "{name} · by GlobalCoins",
    rating_no_group: "Rating will appear once a group is assigned", rating_empty: "No one in the group yet",
    avg_grade_line: "Average grade: {value}", you_suffix: " (you)",
    info_title: "Information", group_label: "Group", course_label: "Course",
    recent_payments: "Recent payments", teacher_fallback: "the teacher",
    identity_error: "Could not verify your identity — please reopen the app and try again.",
    order_sent: "Request sent! Wait for the admin to hand over the reward.",
    coins_awarded: "GlobalCoins awarded!", no_schedule: "not set",
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
    tab_home: "Asosiy", tab_rating: "Reyting", tab_shop: "Do'kon", tab_profile: "Profil",
    balance: "Balans", debt: "Qarz", debt_none: "Qarz yo'q", debt_credit_note: "Keyingi oyga hisobga olinadi",
    coins: "GlobalCoins", credit_note: "Balansda {sum} so'm — keyingi to'lovni kamaytiradi",
    progress_title: "Mening natijam", progress_none: "Hozircha ma'lumot yo'q",
    progress_great: "Ajoyib! Shu tarzda davom eting", progress_ok: "Yomon emas, lekin yaxshiroq bo'lishi mumkin",
    progress_bad: "Ko'p qoldirilgan darslar — darslarni qoldirmaslikka harakat qiling",
    trend_up: "O'smoqda", trend_down: "Pasaymoqda", trend_same: "Barqaror",
    lessons_attended: "dars qatnashildi", streak_days: "ketma-ket, qoldirmasdan", avg_grade: "o'rtacha baho",
    no_group: "Hali guruh biriktirilmagan", teacher_label: "O'qituvchi",
    attendance_grades: "Davomat va baholar", no_attendance: "Hozircha davomat belgilari yo'q",
    homework: "Uyga vazifa", no_homework: "Hozircha uyga vazifa yo'q", open_material: "Materialni ochish",
    important_notice: "Muhim xabar",
    your_balance: "Balansingiz", shop_empty: "Do'kon hozircha bo'sh", buy: "Sotib olish", buy_confirm: "Rostdan sotib olasizmi?",
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
    empty_student: "O'quvchi topilmadi", refresh: "Yangilash",
    rating_title: "Guruh reytingi", rating_subtitle: "{name} · GlobalCoins bo'yicha",
    rating_no_group: "Guruh biriktirilgach reyting paydo bo'ladi", rating_empty: "Guruhda hali hech kim yo'q",
    avg_grade_line: "O'rtacha baho: {value}", you_suffix: " (siz)",
    info_title: "Ma'lumot", group_label: "Guruh", course_label: "Kurs",
    recent_payments: "So'nggi to'lovlar", teacher_fallback: "o'qituvchiga",
    identity_error: "Shaxsni tasdiqlab bo'lmadi — ilovani qayta oching va yana urinib ko'ring.",
    order_sent: "Ariza yuborildi! Administrator sovg'ani topshirishini kuting.",
    coins_awarded: "GlobalCoins berildi!", no_schedule: "belgilanmagan",
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
  const [showDebtPopup, setShowDebtPopup] = useState(false);
  const debtPopupShownRef = useRef(false); // чтобы не выскакивало повторно при каждом обновлении данных в течение сеанса
  const lastCoinsRef = useRef({}); // studentId -> последний известный баланс монет

  // Язык и тема — выбор запоминается на этом устройстве
  const [lang, setLang] = useState(() => { try { return localStorage.getItem("gu_lang") || "ru"; } catch { return "ru"; } });
  const [theme, setTheme] = useState(() => { try { return localStorage.getItem("gu_theme") || "light"; } catch { return "light"; } });
  const t = (key, vars) => translate(lang, key, vars);
  const changeLang = (l) => { setLang(l); try { localStorage.setItem("gu_lang", l); } catch {} };
  const changeTheme = (th) => { setTheme(th); try { localStorage.setItem("gu_theme", th); } catch {} };

  // Оборачивает setStudents: сравнивает баланс монет каждого ученика с прошлым разом
  // и, если он вырос (учитель/админ начислил), показывает конфетти с количеством монет.
  const applyStudents = (nextStudents) => {
    let gained = 0;
    (nextStudents || []).forEach((s) => {
      const prev = lastCoinsRef.current[s.id];
      if (prev !== undefined && s.coins > prev) gained += s.coins - prev;
      lastCoinsRef.current[s.id] = s.coins;
    });
    if (gained > 0) setCoinGain({ amount: gained });
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
        try { localStorage.setItem("gu_phone", phoneVal); localStorage.setItem("gu_password", passwordVal); } catch {}
      }
    } catch (e) {
      setErrorMsg(String(e?.message || e));
      setPhase("error");
    }
  };

  const [refreshing, setRefreshing] = useState(false);
  const silentRefresh = async () => {
    if (phase !== "ready") return;
    setRefreshing(true);
    try {
      const data = await fetchMyData(initData, phone.trim() || null, password.trim() || null);
      if (!data.error && data.linked) {
        applyStudents(data.students);
        setShopItems(data.shopItems || []);
      }
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
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
      let savedPhone = "", savedPassword = "";
      try { savedPhone = localStorage.getItem("gu_phone") || ""; savedPassword = localStorage.getItem("gu_password") || ""; } catch {}
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
    setPhone(""); setPassword(""); setLoginError("");
    try { localStorage.removeItem("gu_phone"); localStorage.removeItem("gu_password"); } catch {}
    setPhase("not_linked");
  };

  const student = students.find((s) => s.id === activeId);

  useEffect(() => {
    if (student && student.debt > 0 && !debtPopupShownRef.current) {
      debtPopupShownRef.current = true;
      setShowDebtPopup(true);
    }
  }, [student?.id, student?.debt]);

  const handleRedeem = async (itemId) => {
    if (!student) return;
    setRedeeming(true);
    try {
      const data = await fetchMyData(initData, phone.trim() || null, password.trim() || null, itemId, student.id);
      if (data.error) { setToast(data.error); setTimeout(() => setToast(""), 3000); return; }
      if (!data.linked) { setToast(t("identity_error")); setTimeout(() => setToast(""), 4000); return; }
      if (data.redeemed) {
        applyStudents(data.students);
        setToast(t("order_sent"));
        setTimeout(() => setToast(""), 3500);
      }
    } finally {
      setRedeeming(false);
    }
  };

  if (phase === "loading") {
    return (
      <div className={`theme-${theme} min-h-screen flex items-center justify-center`} style={{ background: PAPER }}>
        <style>{FONT_IMPORT}</style>
        <style>{THEME_VARS}</style>
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl mx-auto flex items-center justify-center text-white text-[16px] font-extrabold" style={{ background: `linear-gradient(135deg, ${RED}, ${RED_D})`, animation: "pulseLogo 1.1s ease-in-out infinite" }}>GU</div>
          <p className="text-[12.5px] opacity-45 mt-3" style={{ color: INK }}>{t("loading")}</p>
          <style>{`@keyframes pulseLogo { 0%,100% { transform: scale(1); opacity: 1; } 50% { transform: scale(0.92); opacity: 0.75; } }`}</style>
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

      {coinGain && <ConfettiOverlay amount={coinGain.amount} onDone={() => setCoinGain(null)} t={t} />}
      {showDebtPopup && student && (
        <DebtPopup amount={student.debt} adminTelegram={student.adminTelegram} lang={lang} onClose={() => setShowDebtPopup(false)} t={t} />
      )}

      {toast && (
        <div className="fixed top-4 left-4 right-4 z-50 px-4 py-3 rounded-2xl text-[13px] font-medium text-white text-center" style={{ background: RED_D, boxShadow: "0 4px 16px rgba(0,0,0,0.2)" }}>
          {toast}
        </div>
      )}

      <div className="px-4 pt-5 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Avatar name={student?.name || "?"} size={38} />
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
          {tab === "home" && <HomeTab student={student} notifications={student.notifications || []} t={t} lang={lang} />}
          {tab === "rating" && <RatingTab student={student} t={t} />}
          {tab === "shop" && <ShopTab student={student} shopItems={shopItems} onRedeem={handleRedeem} redeeming={redeeming} t={t} lang={lang} />}
          {tab === "profile" && <ProfileTab student={student} onLogout={handleLogout} t={t} lang={lang} changeLang={changeLang} theme={theme} changeTheme={changeTheme} />}
        </div>
      )}

      {/* Нижняя навигация */}
      <div className="fixed bottom-0 left-0 right-0 px-3 pb-3 pt-2 z-20" style={{ background: "linear-gradient(to top, var(--paper) 75%, rgba(0,0,0,0))" }}>
        <div className="flex items-center justify-around rounded-3xl px-1.5 py-1.5" style={{ background: "var(--surface)", boxShadow: "0 8px 28px rgba(26,26,23,0.14)", border: "1px solid var(--line)", backdropFilter: "blur(12px)" }}>
          {tabsFor(t).map((tabItem) => {
            const active = tab === tabItem.key;
            return (
              <button key={tabItem.key} onClick={() => setTab(tabItem.key)} className="flex-1 flex flex-col items-center gap-1 py-3 rounded-2xl transition-all duration-150 active:scale-95" style={{ background: active ? RED_L : "transparent" }}>
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
