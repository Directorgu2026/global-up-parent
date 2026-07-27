import React, { useState, useEffect } from "react";
import {
  Home, Trophy, ShoppingBag, User, Calendar, MapPin, CheckCircle2, XCircle, Clock,
  FileText, Link2, Wallet, Coins as CoinsIcon, PartyPopper, Megaphone, Flame,
  Award, Medal, TrendingUp, TrendingDown, Minus, LogOut, RefreshCw, Eye, EyeOff, Gift, GraduationCap, Phone,
} from "lucide-react";

/* ------------------------------ Настройка ------------------------------ */
const EDGE_FUNCTION_URL = "https://inswhfcwbybykwdthekg.supabase.co/functions/v1/mini-app-data";
const ANON_KEY = "sb_publishable_Lm1ZUwWhD_bq1IwpAFH8ZQ_OU2ph4W4";

/* ------------------------------ Стиль/тема ------------------------------ */
const INK = "#1A1A17";
const PAPER = "#F7F5F0";
const RED = "#DC2626";
const RED_D = "#991B1B";
const RED_L = "#FEE2E2";
const GOLD = "#EAB308";
const BRICK = "#EA580C";
const GREEN = "#16A34A";
const GREEN_D = "#15803D";
const BLUE = "#2563EB";
const PURPLE = "#7C3AED";
const LINE = "#EDEBE4";

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
const ruDate = (iso) => new Date(iso).toLocaleDateString("ru-RU", { day: "2-digit", month: "short" });
const scheduleText = (g) => (g?.days && g.days.length ? `${g.days.join("/")} · ${g.start}–${g.end}` : "не задано");
const initials = (name) => (name || "?").trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join("").toUpperCase();

async function fetchMyData(initData, phone, password, redeemItemId, redeemStudentId) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);
  try {
    const res = await fetch(EDGE_FUNCTION_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", apikey: ANON_KEY, Authorization: `Bearer ${ANON_KEY}` },
      body: JSON.stringify({ initData, phone, password, redeemItemId, redeemStudentId }),
      signal: controller.signal,
    });
    return await res.json();
  } catch (e) {
    if (e.name === "AbortError") return { error: "Сервер не ответил вовремя — проверьте интернет-соединение и попробуйте ещё раз." };
    return { error: "Нет связи с сервером: " + String(e?.message || e) };
  } finally {
    clearTimeout(timeout);
  }
}

/* -------------------------------- UI-атомы -------------------------------- */
function Card({ children, className = "", style = {} }) {
  return <div className={`bg-white rounded-3xl ${className}`} style={{ boxShadow: "0 1px 3px rgba(26,26,23,0.06), 0 1px 2px rgba(26,26,23,0.04)", ...style }}>{children}</div>;
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
  const colors = [RED, BLUE, PURPLE, GOLD, GREEN, BRICK];
  let hash = 0;
  for (let i = 0; i < (name || "").length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  const bg = colors[hash % colors.length];
  return (
    <div className="rounded-full flex items-center justify-center shrink-0 font-bold text-white" style={{ width: size, height: size, background: bg, fontSize: size * 0.38 }}>
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

function ProgressCard({ log, generalGrades = [] }) {
  const total = log.length;
  const present = log.filter((r) => r.present).length;
  const pct = total ? Math.round((present / total) * 100) : 0;
  let streak = 0;
  for (const r of log) { if (r.present) streak++; else break; }

  // Светофор: красный / жёлтый / зелёный — понятно с одного взгляда
  const zone = total === 0 ? "none" : pct >= 90 ? "green" : pct >= 60 ? "yellow" : "red";
  const zoneColors = {
    green: { bg: "linear-gradient(135deg, #DCFCE7, #F0FDF4)", ring: GREEN_D, text: GREEN_D, label: "Отлично! Продолжай в том же духе" },
    yellow: { bg: "linear-gradient(135deg, #FEF9C3, #FFFBEB)", ring: GOLD, text: "#854D0E", label: "Неплохо, но можно лучше" },
    red: { bg: "linear-gradient(135deg, #FEE2E2, #FEF2F2)", ring: RED_D, text: RED_D, label: "Много пропусков — постарайся не пропускать" },
    none: { bg: PAPER, ring: "#D1D0C5", text: "#9C9A90", label: "Пока нет данных" },
  }[zone];

  const trend = trendArrow(log);
  const lessonGrades = log.filter((r) => r.grade).map((r) => r.grade);
  const allGrades = [...lessonGrades, ...generalGrades.map((g) => g.value)];
  const avgGrade = allGrades.length ? (allGrades.reduce((a, b) => a + b, 0) / allGrades.length).toFixed(1) : null;

  return (
    <Card className="p-4" style={{ background: zoneColors.bg, border: "none" }}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[14.5px] font-bold flex items-center gap-1.5"><TrendingUp size={16} />Мой прогресс</h3>
        {trend && (
          <span className="flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-full" style={{ background: "rgba(255,255,255,0.7)", color: trend === "up" ? GREEN_D : trend === "down" ? RED_D : "#6B6A60" }}>
            {trend === "up" ? <TrendingUp size={12} /> : trend === "down" ? <TrendingDown size={12} /> : <Minus size={12} />}
            {trend === "up" ? "Растёт" : trend === "down" ? "Снижается" : "Стабильно"}
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
              <div className="text-[10px] opacity-45 mt-1">занятий посещено</div>
            </div>
            {streak > 0 && (
              <div>
                <div className="text-[17px] font-extrabold leading-none flex items-center gap-1">{streak} <Flame size={15} style={{ color: BRICK }} /></div>
                <div className="text-[10px] opacity-45 mt-1">подряд без пропусков</div>
              </div>
            )}
            {avgGrade && (
              <div>
                <div className="text-[17px] font-extrabold leading-none">{avgGrade}</div>
                <div className="text-[10px] opacity-45 mt-1">средний балл</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

function HomeTab({ student, notifications = [] }) {
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
              <p className="text-[11px] font-bold uppercase tracking-wide opacity-90">Важное уведомление</p>
              <p className="text-[15px] font-semibold leading-snug mt-1">{n.text}</p>
              <p className="text-[11px] opacity-75 mt-1.5">{n.senderName} · {ruDate(n.date)}</p>
            </div>
          </div>
        </div>
      ))}
      {normalNotifications.length > 0 && (
        <div className="rounded-3xl p-4 space-y-2.5" style={{ background: "linear-gradient(135deg, #FEF9C3, #FEE2E2)", border: "1px solid #FDE68A" }}>
          {normalNotifications.map((n) => (
            <div key={n.id} className="flex items-start gap-2.5">
              <Megaphone size={18} className="shrink-0 mt-0.5" style={{ color: "#B45309" }} />
              <div className="min-w-0">
                <p className="text-[13px] font-medium leading-snug" style={{ color: "#854D0E" }}>{n.text}</p>
                <p className="text-[10.5px] opacity-60 mt-0.5" style={{ color: "#854D0E" }}>{n.senderName} · {ruDate(n.date)}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Баланс и GlobalCoins — рядом, в отдельных рамках */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-3xl p-4 text-white relative overflow-hidden" style={{ background: hasDebt ? `linear-gradient(135deg, ${RED}, ${RED_D})` : `linear-gradient(135deg, ${GREEN}, ${GREEN_D})` }}>
          <div className="absolute -right-4 -top-4 w-16 h-16 rounded-full" style={{ background: "rgba(255,255,255,0.1)" }} />
          <Wallet size={19} className="opacity-90" />
          <p className="text-[10.5px] font-medium opacity-85 uppercase tracking-wide mt-2">{hasDebt ? "Долг" : "Баланс"}</p>
          {hasDebt ? (
            <div className="text-[16px] font-extrabold mt-0.5 leading-tight">{fmt(student.debt)}<span className="text-[10.5px] font-medium opacity-80 ml-1">сум</span></div>
          ) : (
            <div className="flex items-center gap-1 mt-1.5 text-[12px] font-semibold"><CheckCircle2 size={14} /> Долгов нет</div>
          )}
        </div>
        <div className="rounded-3xl p-4 text-white relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${GOLD}, #B45309)` }}>
          <div className="absolute -right-4 -top-4 w-16 h-16 rounded-full" style={{ background: "rgba(255,255,255,0.1)" }} />
          <CoinsIcon size={19} className="opacity-90" />
          <p className="text-[10.5px] font-medium opacity-85 uppercase tracking-wide mt-2">GlobalCoins</p>
          <div className="text-[16px] font-extrabold mt-0.5 leading-tight">{student.coins}<span className="text-[10.5px] font-medium opacity-80 ml-1">GC</span></div>
        </div>
      </div>

      <ProgressCard log={log} generalGrades={student.generalGrades || []} />

      {hasDebt && (
        <Card className="p-4" style={{ border: `1.5px solid ${RED_L}` }}>
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-[13.5px] font-bold flex items-center gap-1.5"><Wallet size={15} style={{ color: RED_D }} /> Разбивка по месяцам</h3>
          </div>
          {student.discount > 0 && (
            <div className="text-[11.5px] font-semibold mt-1 mb-2 px-2.5 py-1 rounded-full inline-flex items-center gap-1" style={{ background: "#FEF9C3", color: "#854D0E" }}><PartyPopper size={12} /> Скидка −{student.discount}%</div>
          )}
          {(student.monthlyDebts || []).length > 0 && (
            <div className="mt-2 space-y-1.5">
              {[...student.monthlyDebts].sort((a, b) => a.month.localeCompare(b.month)).map((md) => (
                <div key={md.month} className="flex items-center justify-between text-[12.5px] px-3 py-2 rounded-xl" style={{ background: PAPER }}>
                  <span className="capitalize">{new Date(md.month + "-01").toLocaleDateString("ru-RU", { month: "long", year: "numeric" })}</span>
                  <span className="font-semibold">{fmt(md.amount)} сум</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Расписание — плашка градиентом */}
      <div className="rounded-3xl p-5 text-white relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${RED}, ${RED_D})` }}>
        <div className="absolute -right-6 -top-6 w-28 h-28 rounded-full" style={{ background: "rgba(255,255,255,0.08)" }} />
        <div className="absolute -right-2 bottom-2 w-16 h-16 rounded-full" style={{ background: "rgba(255,255,255,0.08)" }} />
        {student.group ? (
          <>
            <p className="text-[11px] font-medium opacity-80 uppercase tracking-wide">{student.group.course}</p>
            <h2 className="text-[19px] font-bold mt-0.5">{student.group.name}</h2>
            <div className="flex items-center gap-3 mt-3 text-[12.5px]">
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-full" style={{ background: "rgba(255,255,255,0.18)" }}><Calendar size={12} className="inline mr-1 -mt-0.5" />{scheduleText(student.group)}</span>
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-full" style={{ background: "rgba(255,255,255,0.18)" }}><MapPin size={12} className="inline mr-1 -mt-0.5" />{student.group.room}</span>
            </div>
            {student.teacherName && <p className="text-[12px] mt-2 opacity-90">Преподаватель: {student.teacherName}</p>}
          </>
        ) : (
          <p className="text-[13.5px] opacity-90">Пока не закреплена группа</p>
        )}
      </div>

      {/* Посещаемость и оценки */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[14.5px] font-bold">Посещаемость и оценки</h3>
          {pct !== null && (
            <span className="text-[13px] font-bold px-2.5 py-1 rounded-full" style={{ background: pct >= 90 ? "#DCFCE7" : pct >= 80 ? "#FEF9C3" : RED_L, color: pct >= 90 ? GREEN_D : pct >= 80 ? "#854D0E" : RED_D }}>
              {pct}%
            </span>
          )}
        </div>
        {recent.length === 0 ? (
          <EmptyState text="Пока нет отметок посещаемости" icon={FileText} />
        ) : (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {recent.map((r, i) => (
              <div key={i} className="shrink-0 w-16 rounded-2xl p-2 text-center" style={{ background: r.present ? "#F0FDF4" : r.excused ? "#EFF6FF" : "#FFF7ED" }}>
                <div className="text-[10px] font-medium opacity-50 mono">{ruDate(r.date)}</div>
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
        <h3 className="text-[14.5px] font-bold mb-3 flex items-center gap-1.5"><FileText size={16} />Домашнее задание</h3>
        {materials.length === 0 ? (
          <EmptyState text="Пока нет домашних заданий" icon={FileText} />
        ) : (
          <div className="space-y-2">
            {materials.map((m) => (
              <div key={m.id} className="p-3 rounded-2xl" style={{ background: "#FFFBEB", border: "1px solid #FEF3C7" }}>
                <div className="text-[11px] font-bold uppercase tracking-wide" style={{ color: "#B45309" }}>{new Date(m.date).toLocaleDateString("ru-RU", { day: "2-digit", month: "long" })}</div>
                {m.text && <div className="text-[13px] mt-1 leading-snug">{m.text}</div>}
                {m.link && <a href={m.link} target="_blank" rel="noreferrer" className="text-[12.5px] mt-1.5 font-medium flex items-center gap-1" style={{ color: BLUE }}><Link2 size={13} className="inline mr-1 -mt-0.5" />Открыть материал</a>}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

/* ------------------------------- Рейтинг ------------------------------- */
function RatingTab({ student }) {
  const groupmates = student.groupmates || [];
  if (!student.group) return <EmptyState text="Рейтинг появится, когда закрепят группу" icon={Trophy} />;
  const podiumBg = ["linear-gradient(135deg,#FCD34D,#F59E0B)", "linear-gradient(135deg,#D1D5DB,#9CA3AF)", "linear-gradient(135deg,#FCA5A5,#EA580C)"];
  return (
    <div className="space-y-3">
      <div className="rounded-3xl p-5 text-white text-center" style={{ background: `linear-gradient(135deg, ${GOLD}, #B45309)` }}>
        <Trophy size={26} className="mx-auto" />
        <h2 className="text-[16px] font-bold mt-1">Рейтинг группы</h2>
        <p className="text-[12px] opacity-85 mt-0.5">{student.group.name} · по GlobalCoins</p>
      </div>
      {groupmates.length === 0 ? (
        <EmptyState text="В группе пока никого нет" icon={GraduationCap} />
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
                  <div className="text-[13.5px] font-semibold truncate" style={{ color: isMe ? RED_D : INK }}>{m.name}{isMe && " (вы)"}</div>
                  {m.avgGrade !== null && m.avgGrade !== undefined && (
                    <div className="text-[11px] opacity-50 mt-0.5">Средний балл: {m.avgGrade}</div>
                  )}
                </div>
                <div className="text-[13.5px] font-bold px-2.5 py-1 rounded-full shrink-0 flex items-center gap-1" style={{ background: "#FEF9C3", color: "#854D0E" }}><CoinsIcon size={12} />{m.coins} GC</div>
              </div>
            );
          })}
        </Card>
      )}
    </div>
  );
}

/* -------------------------------- Магазин -------------------------------- */
function ShopTab({ student, shopItems, onRedeem, redeeming }) {
  const [confirmId, setConfirmId] = useState(null);
  const sorted = [...shopItems].sort((a, b) => (student.coins >= a.cost) === (student.coins >= b.cost) ? a.cost - b.cost : (student.coins >= a.cost ? -1 : 1));
  const orders = [...(student.myOrders || [])].sort((a, b) => new Date(b.date) - new Date(a.date));
  return (
    <div className="space-y-3">
      <div className="rounded-3xl p-5 text-white flex items-center justify-between" style={{ background: `linear-gradient(135deg, ${RED}, ${RED_D})` }}>
        <div>
          <p className="text-[11px] font-medium opacity-80 uppercase tracking-wide">Ваш баланс</p>
          <h2 className="text-[26px] font-extrabold mt-0.5">{student.coins} <span className="text-[15px] font-semibold opacity-90">GC</span></h2>
        </div>
        <CoinsIcon size={30} className="opacity-90" />
      </div>
      {shopItems.length === 0 ? (
        <EmptyState text="Магазин пока пуст" icon={ShoppingBag} />
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {sorted.map((item, i) => {
            const enough = student.coins >= item.cost;
            const missing = item.cost - student.coins;
            const colors = [["#FEE2E2", RED], ["#DBEAFE", BLUE], ["#FEF9C3", "#B45309"], ["#DCFCE7", GREEN_D], ["#EDE9FE", PURPLE]];
            const [bg, fg] = colors[i % colors.length];
            const confirming = confirmId === item.id;
            return (
              <div key={item.id} className="bg-white rounded-2xl overflow-hidden relative" style={{ boxShadow: "0 1px 3px rgba(26,26,23,0.07)" }}>
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
                  {!enough && <div className="text-[10px] font-medium mt-1.5" style={{ color: "#9C9A90" }}>Ещё {missing} GC</div>}
                  {enough && (
                    confirming ? (
                      <button
                        onClick={() => { onRedeem(item.id); setConfirmId(null); }}
                        disabled={redeeming}
                        className="w-full mt-2.5 text-[12.5px] font-bold py-3 rounded-xl text-white active:scale-95 transition-transform"
                        style={{ background: RED_D, opacity: redeeming ? 0.6 : 1 }}
                      >
                        {redeeming ? "…" : "Точно купить?"}
                      </button>
                    ) : (
                      <button onClick={() => setConfirmId(item.id)} className="w-full mt-2.5 text-[12.5px] font-bold py-3 rounded-xl text-white active:scale-95 transition-transform" style={{ background: RED }}>
                        Купить
                      </button>
                    )
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
      <p className="text-[11px] opacity-40 text-center px-4">После покупки заявка сразу видна администратору и директору — просто дождитесь, когда вам выдадут награду.</p>

      {orders.length > 0 && (
        <Card className="p-4">
          <h3 className="text-[14px] font-bold mb-2.5 flex items-center gap-1.5"><ShoppingBag size={16} />Мои заказы</h3>
          <div className="space-y-1.5">
            {orders.map((o) => (
              <div key={o.id} className="flex items-center justify-between px-3 py-2.5 rounded-xl" style={{ background: PAPER }}>
                <div className="min-w-0">
                  <div className="text-[12.5px] font-medium truncate">{o.itemName}</div>
                  <div className="text-[10.5px] opacity-45 mt-0.5">{ruDate(o.date)} · {o.cost} GC</div>
                </div>
                {o.status === "fulfilled" ? (
                  <span className="shrink-0 text-[10.5px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1" style={{ background: "#DCFCE7", color: GREEN_D }}><CheckCircle2 size={11} />Выдано</span>
                ) : (
                  <span className="shrink-0 text-[10.5px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1" style={{ background: "#FEF9C3", color: "#854D0E" }}><Clock size={11} />В очереди</span>
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
function ProfileTab({ student, onLogout }) {
  return (
    <div className="space-y-3">
      <Card className="p-6 text-center">
        <Avatar name={student.name} size={72} />
        <h2 className="text-[17px] font-bold mt-3">{student.name}</h2>
        {student.phone && <p className="text-[13px] opacity-50 mt-0.5">{student.phone}</p>}
        <div className="flex items-center justify-center gap-2 mt-3">
          <span className="text-[13px] font-bold px-3 py-1.5 rounded-full" style={{ background: "#FEF9C3", color: "#854D0E" }}><CoinsIcon size={13} className="inline mr-1 -mt-0.5" />{student.coins} GC</span>
          {student.discount > 0 && <span className="text-[13px] font-bold px-3 py-1.5 rounded-full" style={{ background: "#DCFCE7", color: GREEN_D }}>−{student.discount}%</span>}
        </div>
      </Card>
      <Card className="p-4">
        <h3 className="text-[13.5px] font-bold mb-2.5">Информация</h3>
        <div className="space-y-2 text-[13px]">
          <div className="flex items-center justify-between py-1.5" style={{ borderBottom: `1px solid ${LINE}` }}><span className="opacity-50">Группа</span><span className="font-medium">{student.group?.name || "—"}</span></div>
          <div className="flex items-center justify-between py-1.5" style={{ borderBottom: `1px solid ${LINE}` }}><span className="opacity-50">Курс</span><span className="font-medium">{student.group?.course || "—"}</span></div>
          <div className="flex items-center justify-between py-1.5" style={{ borderBottom: `1px solid ${LINE}` }}><span className="opacity-50">Преподаватель</span><span className="font-medium">{student.teacherName || "—"}</span></div>
          <div className="flex items-center justify-between py-1.5"><span className="opacity-50">Долг</span><span className="font-semibold" style={{ color: student.debt > 0 ? RED_D : GREEN_D }}>{fmt(student.debt)} сум</span></div>
        </div>
      </Card>

      {(student.adminTelegram || student.teacherTelegram) && (
        <Card className="p-4">
          <h3 className="text-[13.5px] font-bold mb-2.5">Связаться</h3>
          <div className="space-y-2">
            {student.adminTelegram && (
              <a href={`https://t.me/${student.adminTelegram}`} target="_blank" rel="noreferrer" className="w-full flex items-center justify-between px-4 py-3 rounded-2xl" style={{ background: "#EEECFD" }}>
                <span className="text-[13px] font-semibold" style={{ color: "#5B21B6" }}>Написать администрации</span>
                <Megaphone size={16} style={{ color: "#5B21B6" }} />
              </a>
            )}
            {student.teacherTelegram && (
              <a href={`https://t.me/${student.teacherTelegram}`} target="_blank" rel="noreferrer" className="w-full flex items-center justify-between px-4 py-3 rounded-2xl" style={{ background: RED_L }}>
                <span className="text-[13px] font-semibold" style={{ color: RED_D }}>Написать {student.teacherName || "преподавателю"}</span>
                <GraduationCap size={16} style={{ color: RED_D }} />
              </a>
            )}
          </div>
        </Card>
      )}
      {(student.payments || []).length > 0 && (
        <Card className="p-4">
          <h3 className="text-[13.5px] font-bold mb-2.5">Последние оплаты</h3>
          <div className="space-y-1.5">
            {[...student.payments].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 6).map((p, i) => (
              <div key={i} className="flex items-center justify-between text-[12.5px]">
                <span className="opacity-55 mono">{ruDate(p.date)}</span>
                <span className="font-semibold" style={{ color: GREEN_D }}>+{fmt(p.amount)} сум</span>
              </div>
            ))}
          </div>
        </Card>
      )}
      <button onClick={onLogout} className="w-full text-[13px] font-medium py-3 rounded-2xl flex items-center justify-center gap-1.5" style={{ background: "#F3F1EA", color: "#6B6A60" }}><LogOut size={14} />Выйти из аккаунта</button>
    </div>
  );
}

/* -------------------------------- Экран входа -------------------------------- */
function LoginScreen({ phone, setPhone, password, setPassword, loginError, loginLoading, onLogin }) {
  return (
    <div style={{ background: PAPER }} className="min-h-screen flex items-center justify-center p-4">
      <style>{FONT_IMPORT}</style>
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-3xl mx-auto flex items-center justify-center text-white text-[24px] font-extrabold" style={{ background: `linear-gradient(135deg, ${RED}, ${RED_D})` }}>GU</div>
          <h1 className="text-[19px] font-extrabold mt-3">Global Up</h1>
          <p className="text-[13px] opacity-50 mt-0.5">Личный кабинет ученика</p>
        </div>
        <Card className="p-6">
          <p className="text-[12.5px] opacity-55 mb-4">Введите номер телефона и пароль — те же, что выдал администратор центра.</p>
          <div className="space-y-3">
            <div>
              <label className="text-[12px] font-medium opacity-50 block mb-1.5">Номер телефона</label>
              <div className="flex items-center gap-1.5">
                <span className="shrink-0 px-3.5 py-3 rounded-2xl text-[14px] font-semibold" style={{ background: "#F3F1EA" }}>+998</span>
                <input
                  inputMode="numeric"
                  value={formatUzPhone((phone || "").replace(/[^0-9]/g, "").replace(/^998/, "").slice(0, 9))}
                  onChange={(e) => setPhone("+998 " + formatUzPhone(e.target.value.replace(/[^0-9]/g, "").slice(0, 9)))}
                  placeholder="90 123 45 67"
                  className="w-full text-[15px] px-4 py-3 rounded-2xl outline-none"
                  style={{ border: `1.5px solid ${LINE}`, background: PAPER }}
                />
              </div>
            </div>
            <div>
              <label className="text-[12px] font-medium opacity-50 block mb-1.5">Пароль</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full text-[15px] px-4 py-3 rounded-2xl outline-none" style={{ border: `1.5px solid ${LINE}`, background: PAPER }} />
            </div>
            {loginError && <p className="text-[12px] break-words font-medium" style={{ color: RED_D }}>{loginError}</p>}
            <button onClick={onLogin} disabled={loginLoading} className="w-full text-[15px] font-bold py-3.5 rounded-2xl text-white" style={{ background: RED, opacity: loginLoading ? 0.6 : 1 }}>
              {loginLoading ? "Проверяем…" : "Войти"}
            </button>
          </div>
        </Card>
        <p className="text-[11px] opacity-40 mt-4 text-center px-4">После первого входа вход запомнится сам.</p>
      </div>
    </div>
  );
}

/* ----------------------------------- App ----------------------------------- */
const TABS = [
  { key: "home", label: "Главная", icon: Home },
  { key: "rating", label: "Рейтинг", icon: Trophy },
  { key: "shop", label: "Магазин", icon: ShoppingBag },
  { key: "profile", label: "Профиль", icon: User },
];

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
      setStudents(data.students);
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
        setStudents(data.students);
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
        setStudents(first.students);
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
    setPhone(""); setPassword(""); setLoginError("");
    try { localStorage.removeItem("gu_phone"); localStorage.removeItem("gu_password"); } catch {}
    setPhase("not_linked");
  };

  const student = students.find((s) => s.id === activeId);

  const handleRedeem = async (itemId) => {
    if (!student) return;
    setRedeeming(true);
    try {
      const data = await fetchMyData(initData, phone.trim() || null, password.trim() || null, itemId, student.id);
      if (data.error) { setToast(data.error); setTimeout(() => setToast(""), 3000); return; }
      if (!data.linked) { setToast("Не удалось подтвердить личность — откройте приложение заново и попробуйте снова."); setTimeout(() => setToast(""), 4000); return; }
      if (data.redeemed) {
        setStudents(data.students);
        setToast("Заявка отправлена! Дождитесь выдачи у администратора.");
        setTimeout(() => setToast(""), 3500);
      }
    } finally {
      setRedeeming(false);
    }
  };

  if (phase === "loading") {
    return (
      <div style={{ background: PAPER }} className="min-h-screen flex items-center justify-center">
        <style>{FONT_IMPORT}</style>
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl mx-auto flex items-center justify-center text-white text-[16px] font-extrabold" style={{ background: `linear-gradient(135deg, ${RED}, ${RED_D})`, animation: "pulseLogo 1.1s ease-in-out infinite" }}>GU</div>
          <p className="text-[12.5px] opacity-45 mt-3">Загрузка…</p>
          <style>{`@keyframes pulseLogo { 0%,100% { transform: scale(1); opacity: 1; } 50% { transform: scale(0.92); opacity: 0.75; } }`}</style>
        </div>
      </div>
    );
  }

  if (phase === "error") {
    return (
      <div style={{ background: PAPER }} className="min-h-screen flex items-center justify-center p-4">
        <style>{FONT_IMPORT}</style>
        <div className="max-w-sm text-center">
          <XCircle size={30} className="mx-auto mb-2" style={{ color: BRICK }} />
          <p className="text-[14px] font-bold mb-1.5">Не удалось загрузить данные</p>
          <p className="text-[12.5px] opacity-55 break-words">{errorMsg}</p>
        </div>
      </div>
    );
  }

  if (phase === "not_linked") {
    return <LoginScreen phone={phone} setPhone={setPhone} password={password} setPassword={setPassword} loginError={loginError} loginLoading={loginLoading} onLogin={handleLogin} />;
  }

  return (
    <div style={{ background: PAPER, color: INK }} className="min-h-screen anim-fade pb-24">
      <style>{FONT_IMPORT}</style>

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
          <button onClick={silentRefresh} disabled={refreshing} className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 active:scale-90 transition-transform" style={{ background: "#fff", border: `1px solid ${LINE}` }} title="Обновить">
            <RefreshCw size={15} style={{ animation: refreshing ? "spin 0.7s linear infinite" : "none" }} />
          </button>
          {students.length > 1 && (
            <select value={activeId} onChange={(e) => setActiveId(e.target.value)} className="text-[12px] font-medium px-2.5 py-1.5 rounded-full outline-none" style={{ background: "#fff", border: `1px solid ${LINE}` }}>
              {students.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          )}
        </div>
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      {!student ? (
        <div className="px-4"><EmptyState text="Ученик не найден" /></div>
      ) : (
        <div className="px-4">
          {tab === "home" && <HomeTab student={student} notifications={student.notifications || []} />}
          {tab === "rating" && <RatingTab student={student} />}
          {tab === "shop" && <ShopTab student={student} shopItems={shopItems} onRedeem={handleRedeem} redeeming={redeeming} />}
          {tab === "profile" && <ProfileTab student={student} onLogout={handleLogout} />}
        </div>
      )}

      {/* Нижняя навигация */}
      <div className="fixed bottom-0 left-0 right-0 px-3 pb-3 pt-2 z-20" style={{ background: "linear-gradient(to top, #F7F5F0 70%, rgba(247,245,240,0))" }}>
        <div className="flex items-center justify-around bg-white rounded-3xl px-1.5 py-1.5" style={{ boxShadow: "0 4px 20px rgba(26,26,23,0.12)" }}>
          {TABS.map((t) => {
            const active = tab === t.key;
            return (
              <button key={t.key} onClick={() => setTab(t.key)} className="flex-1 flex flex-col items-center gap-1 py-3 rounded-2xl transition-colors active:scale-95" style={{ background: active ? RED_L : "transparent" }}>
                <t.icon size={18} style={{ color: active ? RED_D : "#9C9A90", opacity: active ? 1 : 0.7 }} />
                <span className="text-[10px] font-semibold" style={{ color: active ? RED_D : "#9C9A90" }}>{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
