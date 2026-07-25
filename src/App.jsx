import React, { useState, useEffect } from "react";

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
const ruDate = (iso) => new Date(iso).toLocaleDateString("ru-RU", { day: "2-digit", month: "short" });
const scheduleText = (g) => (g?.days && g.days.length ? `${g.days.join("/")} · ${g.start}–${g.end}` : "не задано");
const initials = (name) => (name || "?").trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join("").toUpperCase();

async function fetchMyData(initData, phone, password, redeemItemId, redeemStudentId) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);
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
function EmptyState({ text, emoji = "🗂️" }) {
  return (
    <div className="py-8 text-center">
      <div className="text-[28px] mb-1.5">{emoji}</div>
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
function HomeTab({ student }) {
  const log = [...(student.attendanceLog || [])].sort((a, b) => new Date(b.date) - new Date(a.date));
  const total = log.length;
  const present = log.filter((r) => r.present).length;
  const pct = total ? Math.round((present / total) * 100) : null;
  const recent = log.slice(0, 8);
  const materials = [...(student.materials || [])].sort((a, b) => new Date(b.date) - new Date(a.date));
  const gradeColors = { 1: BRICK, 2: "#EA580C", 3: GOLD, 4: "#65A30D", 5: GREEN_D };

  return (
    <div className="space-y-3">
      {/* Расписание — плашка градиентом */}
      <div className="rounded-3xl p-5 text-white relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${RED}, ${RED_D})` }}>
        <div className="absolute -right-6 -top-6 w-28 h-28 rounded-full" style={{ background: "rgba(255,255,255,0.08)" }} />
        <div className="absolute -right-2 bottom-2 w-16 h-16 rounded-full" style={{ background: "rgba(255,255,255,0.08)" }} />
        {student.group ? (
          <>
            <p className="text-[11px] font-medium opacity-80 uppercase tracking-wide">{student.group.course}</p>
            <h2 className="text-[19px] font-bold mt-0.5">{student.group.name}</h2>
            <div className="flex items-center gap-3 mt-3 text-[12.5px]">
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-full" style={{ background: "rgba(255,255,255,0.18)" }}>📅 {scheduleText(student.group)}</span>
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-full" style={{ background: "rgba(255,255,255,0.18)" }}>📍 {student.group.room}</span>
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
          <EmptyState text="Пока нет отметок посещаемости" emoji="📋" />
        ) : (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {recent.map((r, i) => (
              <div key={i} className="shrink-0 w-16 rounded-2xl p-2 text-center" style={{ background: r.present ? "#F0FDF4" : r.excused ? "#EFF6FF" : "#FFF7ED" }}>
                <div className="text-[10px] font-medium opacity-50 mono">{ruDate(r.date)}</div>
                <div className="text-[16px] my-1">{r.present ? "✅" : r.excused ? "🔵" : "❌"}</div>
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
        <h3 className="text-[14.5px] font-bold mb-3">📝 Домашнее задание</h3>
        {materials.length === 0 ? (
          <EmptyState text="Пока нет домашних заданий" emoji="📝" />
        ) : (
          <div className="space-y-2">
            {materials.map((m) => (
              <div key={m.id} className="p-3 rounded-2xl" style={{ background: "#FFFBEB", border: "1px solid #FEF3C7" }}>
                <div className="text-[11px] font-bold uppercase tracking-wide" style={{ color: "#B45309" }}>{new Date(m.date).toLocaleDateString("ru-RU", { day: "2-digit", month: "long" })}</div>
                {m.text && <div className="text-[13px] mt-1 leading-snug">{m.text}</div>}
                {m.link && <a href={m.link} target="_blank" rel="noreferrer" className="text-[12.5px] mt-1.5 font-medium flex items-center gap-1" style={{ color: BLUE }}>🔗 Открыть материал</a>}
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Долг — компактно */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-[14.5px] font-bold">💳 Долг за обучение</h3>
          <span className="text-[17px] font-extrabold" style={{ color: student.debt > 0 ? RED_D : GREEN_D }}>{fmt(student.debt)} <span className="text-[12px] font-medium opacity-60">сум</span></span>
        </div>
        {student.discount > 0 && (
          <div className="text-[11.5px] font-semibold mt-2 px-2.5 py-1 rounded-full inline-block" style={{ background: "#FEF9C3", color: "#854D0E" }}>🎉 Скидка −{student.discount}%</div>
        )}
        {(student.monthlyDebts || []).length > 0 && (
          <div className="mt-3 space-y-1.5">
            {[...student.monthlyDebts].sort((a, b) => a.month.localeCompare(b.month)).map((md) => (
              <div key={md.month} className="flex items-center justify-between text-[12.5px] px-3 py-2 rounded-xl" style={{ background: PAPER }}>
                <span className="capitalize">{new Date(md.month + "-01").toLocaleDateString("ru-RU", { month: "long", year: "numeric" })}</span>
                <span className="font-semibold">{fmt(md.amount)} сум</span>
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
  if (!student.group) return <EmptyState text="Рейтинг появится, когда закрепят группу" emoji="🏆" />;
  const podiumBg = ["linear-gradient(135deg,#FCD34D,#F59E0B)", "linear-gradient(135deg,#D1D5DB,#9CA3AF)", "linear-gradient(135deg,#FCA5A5,#EA580C)"];
  return (
    <div className="space-y-3">
      <div className="rounded-3xl p-5 text-white text-center" style={{ background: `linear-gradient(135deg, ${GOLD}, #B45309)` }}>
        <div className="text-[26px]">🏆</div>
        <h2 className="text-[16px] font-bold mt-1">Рейтинг группы</h2>
        <p className="text-[12px] opacity-85 mt-0.5">{student.group.name} · по GlobalCoins</p>
      </div>
      {groupmates.length === 0 ? (
        <EmptyState text="В группе пока никого нет" emoji="👥" />
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
                </div>
                <div className="text-[13.5px] font-bold px-2.5 py-1 rounded-full shrink-0" style={{ background: "#FEF9C3", color: "#854D0E" }}>{m.coins} GC</div>
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
  return (
    <div className="space-y-3">
      <div className="rounded-3xl p-5 text-white flex items-center justify-between" style={{ background: `linear-gradient(135deg, ${RED}, ${RED_D})` }}>
        <div>
          <p className="text-[11px] font-medium opacity-80 uppercase tracking-wide">Ваш баланс</p>
          <h2 className="text-[26px] font-extrabold mt-0.5">{student.coins} <span className="text-[15px] font-semibold opacity-90">GC</span></h2>
        </div>
        <div className="text-[34px]">🪙</div>
      </div>
      {shopItems.length === 0 ? (
        <EmptyState text="Магазин пока пуст" emoji="🛍️" />
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
                    <span className="text-[36px]">🎁</span>
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
                        className="w-full mt-2 text-[11px] font-bold py-2 rounded-xl text-white"
                        style={{ background: RED_D, opacity: redeeming ? 0.6 : 1 }}
                      >
                        {redeeming ? "…" : "Точно купить?"}
                      </button>
                    ) : (
                      <button onClick={() => setConfirmId(item.id)} className="w-full mt-2 text-[11px] font-bold py-2 rounded-xl text-white" style={{ background: RED }}>
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
          <span className="text-[13px] font-bold px-3 py-1.5 rounded-full" style={{ background: "#FEF9C3", color: "#854D0E" }}>🪙 {student.coins} GC</span>
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
      <button onClick={onLogout} className="w-full text-[13px] font-medium py-3 rounded-2xl" style={{ background: "#F3F1EA", color: "#6B6A60" }}>Выйти из аккаунта</button>
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
              <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+998 90 123 45 67" className="w-full text-[15px] px-4 py-3 rounded-2xl outline-none" style={{ border: `1.5px solid ${LINE}`, background: PAPER }} />
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
  { key: "home", label: "Главная", icon: "🏠" },
  { key: "rating", label: "Рейтинг", icon: "🏆" },
  { key: "shop", label: "Магазин", icon: "🛍️" },
  { key: "profile", label: "Профиль", icon: "👤" },
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
    } catch (e) {
      setErrorMsg(String(e?.message || e));
      setPhase("error");
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
    loadWithCreds(data0);
  }, []);

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
    setPhase("not_linked");
  };

  const student = students.find((s) => s.id === activeId);

  const handleRedeem = async (itemId) => {
    if (!student) return;
    setRedeeming(true);
    try {
      const data = await fetchMyData(initData, null, null, itemId, student.id);
      if (data.error) { setToast(data.error); setTimeout(() => setToast(""), 3000); return; }
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
          <div className="w-12 h-12 rounded-2xl mx-auto flex items-center justify-center text-white text-[16px] font-extrabold anim-pop" style={{ background: `linear-gradient(135deg, ${RED}, ${RED_D})` }}>GU</div>
          <p className="text-[12.5px] opacity-45 mt-3">Загрузка…</p>
        </div>
      </div>
    );
  }

  if (phase === "error") {
    return (
      <div style={{ background: PAPER }} className="min-h-screen flex items-center justify-center p-4">
        <style>{FONT_IMPORT}</style>
        <div className="max-w-sm text-center">
          <div className="text-[32px] mb-2">⚠️</div>
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
        {students.length > 1 && (
          <select value={activeId} onChange={(e) => setActiveId(e.target.value)} className="text-[12px] font-medium px-2.5 py-1.5 rounded-full outline-none" style={{ background: "#fff", border: `1px solid ${LINE}` }}>
            {students.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        )}
      </div>

      {!student ? (
        <div className="px-4"><EmptyState text="Ученик не найден" /></div>
      ) : (
        <div className="px-4">
          {tab === "home" && <HomeTab student={student} />}
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
              <button key={t.key} onClick={() => setTab(t.key)} className="flex-1 flex flex-col items-center gap-0.5 py-2 rounded-2xl transition-colors" style={{ background: active ? RED_L : "transparent" }}>
                <span className="text-[18px]" style={{ filter: active ? "none" : "grayscale(0.4) opacity(0.6)" }}>{t.icon}</span>
                <span className="text-[10px] font-semibold" style={{ color: active ? RED_D : "#9C9A90" }}>{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
