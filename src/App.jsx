import React, { useState, useEffect } from "react";

/* ------------------------------ Настройка ------------------------------ */
// Тот же проект Supabase, что и у остальных сайтов центра.
const EDGE_FUNCTION_URL = "https://inswhfcwbybykwdthekg.supabase.co/functions/v1/mini-app-data";
const ANON_KEY = "sb_publishable_Lm1ZUwWhD_bq1IwpAFH8ZQ_0U2ph4W4"; // тот же публичный ключ, что в остальных сайтах

/* ------------------------------ Стиль/тема ------------------------------ */
const INK = "#1A1A17";
const PAPER = "#FAFAF7";
const TEAL = "#DC2626";
const TEAL_D = "#991B1B";
const GOLD = "#EAB308";
const BRICK = "#EA580C";
const GREEN = "#16A34A";
const GREEN_D = "#15803D";
const LINE = "#E7E5DC";

const FONT_IMPORT = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
* { font-family: 'Inter', sans-serif; }
.mono { font-variant-numeric: tabular-nums; }
.anim-fade { animation: fadeIn 0.15s ease-out; }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
`;

/* -------------------------------- Утилиты -------------------------------- */
const fmt = (n) => Math.round(n || 0).toLocaleString("ru-RU");
const ruDate = (iso) => new Date(iso).toLocaleDateString("ru-RU", { day: "2-digit", month: "short" });
const scheduleText = (g) => (g?.days && g.days.length ? `${g.days.join("/")} · ${g.start}–${g.end}` : "не задано");

async function fetchMyData(initData) {
  const res = await fetch(EDGE_FUNCTION_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: ANON_KEY, Authorization: `Bearer ${ANON_KEY}` },
    body: JSON.stringify({ initData }),
  });
  return res.json();
}

/* -------------------------------- UI-атомы -------------------------------- */
function Card({ children, className = "" }) {
  return <div className={`bg-white rounded-2xl ${className}`} style={{ border: `1px solid ${LINE}` }}>{children}</div>;
}
function SectionTitle({ children }) {
  return <h3 className="text-[14px] font-semibold mb-2">{children}</h3>;
}
function EmptyState({ text }) {
  return <div className="py-6 text-center text-[12.5px] opacity-45">{text}</div>;
}

/* -------------------------------- Расписание -------------------------------- */
function ScheduleCard({ student }) {
  if (!student.group) return <Card className="p-4"><EmptyState text="Пока не закреплена группа." /></Card>;
  const g = student.group;
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[15px] font-semibold">{g.name}</div>
          <div className="text-[12.5px] opacity-55 mt-0.5">{g.course}</div>
        </div>
      </div>
      <div className="mt-3 space-y-1.5 text-[13px]">
        <div className="flex items-center justify-between"><span className="opacity-50">Дни и время</span><span className="font-medium">{scheduleText(g)}</span></div>
        <div className="flex items-center justify-between"><span className="opacity-50">Кабинет</span><span className="font-medium">{g.room}</span></div>
        {student.teacherName && <div className="flex items-center justify-between"><span className="opacity-50">Преподаватель</span><span className="font-medium">{student.teacherName}</span></div>}
      </div>
    </Card>
  );
}

/* -------------------------------- Посещаемость и оценки -------------------------------- */
function AttendanceCard({ student }) {
  const log = [...(student.attendanceLog || [])].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 20);
  const total = log.length;
  const present = log.filter((r) => r.present).length;
  const pct = total ? Math.round((present / total) * 100) : null;
  const gradeColors = { 1: BRICK, 2: "#EA580C", 3: "#CA8A04", 4: "#65A30D", 5: GREEN_D };

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-2">
        <SectionTitle>Посещаемость и оценки</SectionTitle>
        {pct !== null && <span className="text-[13px] font-semibold" style={{ color: pct >= 90 ? GREEN_D : pct >= 80 ? "#854D0E" : BRICK }}>{pct}%</span>}
      </div>
      {log.length === 0 ? (
        <EmptyState text="Пока нет отметок посещаемости." />
      ) : (
        <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
          {log.map((r, i) => (
            <div key={i} className="flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[12.5px]" style={{ background: r.present ? "#DCFCE7" : r.excused ? "#DBEAFE" : "#FFEDD5" }}>
              <span className="mono">{ruDate(r.date)}</span>
              <div className="flex items-center gap-2">
                {r.grade && <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full text-white" style={{ background: gradeColors[r.grade] }}>{r.grade}</span>}
                <span className="font-medium" style={{ color: r.present ? GREEN_D : r.excused ? "#1D4ED8" : BRICK }}>
                  {r.present ? "Был" : r.excused ? "Уваж. причина" : "Не был"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

/* -------------------------------- Долг и оплаты (только «Родитель») -------------------------------- */
function DebtCard({ student }) {
  const monthlyDebts = [...(student.monthlyDebts || [])].sort((a, b) => a.month.localeCompare(b.month));
  const payments = [...(student.payments || [])].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10);

  return (
    <Card className="p-4">
      <SectionTitle>Долг и оплаты</SectionTitle>
      <div className="flex items-center justify-between mb-2">
        <span className="text-[13px] opacity-60">Текущий долг</span>
        <span className="text-[16px] font-semibold" style={{ color: student.debt > 0 ? BRICK : GREEN_D }}>{fmt(student.debt)} сум</span>
      </div>
      {student.discount > 0 && (
        <div className="text-[12px] mb-2 px-2.5 py-1.5 rounded-lg inline-block" style={{ background: "#FEF9C3", color: "#854D0E" }}>Скидка: −{student.discount}%</div>
      )}
      {monthlyDebts.length > 0 && (
        <div className="space-y-1 mb-3">
          {monthlyDebts.map((md) => (
            <div key={md.month} className="flex items-center justify-between text-[12.5px] px-2.5 py-1.5 rounded-lg" style={{ background: "#F6F7FB" }}>
              <span>{new Date(md.month + "-01").toLocaleDateString("ru-RU", { month: "long", year: "numeric" })}</span>
              <span className="font-medium">{fmt(md.amount)} сум</span>
            </div>
          ))}
        </div>
      )}
      {payments.length > 0 && (
        <div>
          <div className="text-[11.5px] opacity-45 uppercase tracking-wide mb-1.5">Последние оплаты</div>
          <div className="space-y-1">
            {payments.map((p, i) => (
              <div key={i} className="flex items-center justify-between text-[12.5px]">
                <span className="opacity-55 mono">{ruDate(p.date)}</span>
                <span className="font-medium" style={{ color: GREEN_D }}>{fmt(p.amount)} сум</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}

/* -------------------------------- GlobalCoins и магазин -------------------------------- */
function CoinsCard({ student, shopItems }) {
  return (
    <Card className="p-4">
      <SectionTitle>GlobalCoins</SectionTitle>
      <div className="flex items-center justify-between mb-3">
        <span className="text-[13px] opacity-60">Баланс</span>
        <span className="text-[20px] font-bold" style={{ color: "#854D0E" }}>{student.coins} GC</span>
      </div>
      {shopItems.length === 0 ? (
        <EmptyState text="Магазин пока пуст." />
      ) : (
        <div className="space-y-1.5">
          {shopItems.map((item) => {
            const enough = student.coins >= item.cost;
            return (
              <div key={item.id} className="flex items-center justify-between px-2.5 py-2 rounded-lg" style={{ background: "#F6F7FB", opacity: enough ? 1 : 0.5 }}>
                <span className="text-[13px] font-medium">{item.name}</span>
                <span className="text-[12px] font-semibold px-2 py-1 rounded-full" style={{ background: "#FEF9C3", color: "#854D0E" }}>{item.cost} GC</span>
              </div>
            );
          })}
        </div>
      )}
      <p className="text-[11px] opacity-40 mt-2">Обменять награду можно у администратора центра.</p>
    </Card>
  );
}

/* -------------------------------- Материалы к урокам -------------------------------- */
function MaterialsCard({ student }) {
  const materials = [...(student.materials || [])].sort((a, b) => new Date(b.date) - new Date(a.date));
  return (
    <Card className="p-4">
      <SectionTitle>Материалы к урокам</SectionTitle>
      {materials.length === 0 ? (
        <EmptyState text="Пока нет материалов от преподавателя." />
      ) : (
        <div className="space-y-2">
          {materials.map((m) => (
            <div key={m.id} className="p-2.5 rounded-lg" style={{ background: "#F6F7FB" }}>
              <div className="text-[11.5px] font-medium opacity-55">{new Date(m.date).toLocaleDateString("ru-RU", { day: "2-digit", month: "long" })}</div>
              {m.text && <div className="text-[13px] mt-1">{m.text}</div>}
              {m.link && <a href={m.link} target="_blank" rel="noreferrer" className="text-[12.5px] mt-1 block truncate" style={{ color: TEAL_D }}>{m.link}</a>}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

/* ----------------------------------- App ----------------------------------- */
export default function ParentApp() {
  const [phase, setPhase] = useState("loading"); // loading | error | not_linked | ready
  const [errorMsg, setErrorMsg] = useState("");
  const [students, setStudents] = useState([]);
  const [shopItems, setShopItems] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [view, setView] = useState("parent"); // parent | child

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (tg) {
      tg.ready();
      tg.expand();
      if (tg.setHeaderColor) try { tg.setHeaderColor("#FAFAF7"); } catch {}
    }
    const initData = tg?.initData || "";

    (async () => {
      try {
        const data = await fetchMyData(initData);
        if (data.error) { setErrorMsg(data.error); setPhase("error"); return; }
        if (!data.linked) { setPhase("not_linked"); return; }
        setStudents(data.students);
        setShopItems(data.shopItems || []);
        setActiveId(data.students[0]?.id || null);
        setPhase("ready");
      } catch (e) {
        setErrorMsg(String(e?.message || e));
        setPhase("error");
      }
    })();
  }, []);

  const student = students.find((s) => s.id === activeId);

  if (phase === "loading") {
    return (
      <div style={{ background: PAPER }} className="min-h-screen flex items-center justify-center">
        <style>{FONT_IMPORT}</style>
        <p className="text-[13px] opacity-50">Загрузка…</p>
      </div>
    );
  }

  if (phase === "error") {
    return (
      <div style={{ background: PAPER }} className="min-h-screen flex items-center justify-center p-4">
        <style>{FONT_IMPORT}</style>
        <div className="max-w-sm text-center">
          <p className="text-[14px] font-medium mb-1.5">Не удалось загрузить данные</p>
          <p className="text-[12.5px] opacity-55">{errorMsg}</p>
        </div>
      </div>
    );
  }

  if (phase === "not_linked") {
    return (
      <div style={{ background: PAPER }} className="min-h-screen flex items-center justify-center p-4">
        <style>{FONT_IMPORT}</style>
        <div className="max-w-sm text-center">
          <p className="text-[14px] font-medium mb-1.5">Ваш Telegram пока не привязан к ученику</p>
          <p className="text-[12.5px] opacity-55">Обратитесь к администратору центра — он привяжет ваш номер телефона к профилю ученика, и данные появятся здесь.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: PAPER, color: INK }} className="min-h-screen anim-fade pb-8">
      <style>{FONT_IMPORT}</style>

      <div className="sticky top-0 z-10 px-4 pt-4 pb-3" style={{ background: PAPER, borderBottom: `1px solid ${LINE}` }}>
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="disp text-[16px] font-bold">Global Up</div>
          <div className="flex rounded-full p-0.5" style={{ background: "#EEEEE8" }}>
            <button onClick={() => setView("parent")} className="text-[12px] font-medium px-3 py-1.5 rounded-full" style={{ background: view === "parent" ? "#fff" : "transparent", color: view === "parent" ? INK : "#5B5B54" }}>Родитель</button>
            <button onClick={() => setView("child")} className="text-[12px] font-medium px-3 py-1.5 rounded-full" style={{ background: view === "child" ? "#fff" : "transparent", color: view === "child" ? INK : "#5B5B54" }}>Ребёнок</button>
          </div>
        </div>
        {students.length > 1 && (
          <div className="flex gap-1.5 overflow-x-auto">
            {students.map((s) => (
              <button key={s.id} onClick={() => setActiveId(s.id)} className="shrink-0 text-[12.5px] font-medium px-3 py-1.5 rounded-full" style={{ background: activeId === s.id ? TEAL : "#EEEEE8", color: activeId === s.id ? "#fff" : "#5B5B54" }}>
                {s.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {!student ? (
        <div className="p-4"><EmptyState text="Ученик не найден." /></div>
      ) : (
        <div className="p-4 space-y-3">
          {view === "child" ? (
            <>
              <CoinsCard student={student} shopItems={shopItems} />
              <AttendanceCard student={student} />
              <ScheduleCard student={student} />
              <MaterialsCard student={student} />
            </>
          ) : (
            <>
              <ScheduleCard student={student} />
              <AttendanceCard student={student} />
              <DebtCard student={student} />
              <CoinsCard student={student} shopItems={shopItems} />
              <MaterialsCard student={student} />
            </>
          )}
        </div>
      )}
    </div>
  );
}
