import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  ChevronLeft, ChevronRight, ChevronDown, Coins, CheckCircle2, AlertTriangle,
  UserCircle2, LogOut, Loader2, Printer, X, RefreshCw,
} from "lucide-react";

/* ------------------------------ Стиль/тема ------------------------------ */
const INK = "var(--ink)";
const PAPER = "var(--paper)";
const TEAL = "#DC2626";
const TEAL_D = "#991B1B";
const GOLD = "#EAB308";
const BRICK = "#EA580C";
const GREEN = "#16A34A";
const GREEN_D = "#15803D";
const LINE = "var(--line)";
const LANG_FLAGS = { ru: "🇷🇺", en: "🇬🇧", uz: "🇺🇿" };
const LOCALE_OF = { ru: "ru-RU", en: "en-US", uz: "uz-Latn" };

const THEME_VARS = `
  .theme-light {
    --paper: #FAFAF7; --ink: #1A1A17; --line: #E7E5DC; --surface: #FFFFFF;
    --surface-soft: #F6F7FB; --surface-alt: #EEEEE8;
    --soft-yellow-bg: #FEF9C3; --soft-yellow-fg: #854D0E;
    --soft-purple-bg: #EEECFD;
  }
  .theme-dark {
    --paper: #16171C; --ink: #EDECE6; --line: #2C2D33; --surface: #202127;
    --surface-soft: #23242B; --surface-alt: #2A2B32;
    --soft-yellow-bg: #3A3018; --soft-yellow-fg: #F3D28A;
    --soft-purple-bg: #2B2140;
  }
`;

const FONT_IMPORT = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
.disp { font-family: 'Inter', sans-serif; font-weight: 700; }
.mono { font-variant-numeric: tabular-nums; }
.app-bg { background: var(--paper); }
.card-surface { box-shadow: 0 1px 2px rgba(19,36,54,0.04), 0 1px 1px rgba(19,36,54,0.03); }
.anim-pop { animation: popIn 0.16s ease-out; }
.anim-fade { animation: fadeIn 0.15s ease-out; }
.anim-slide { animation: slideIn 0.2s ease-out; }
@keyframes popIn { from { opacity: 0; transform: scale(0.97) translateY(2px); } to { opacity: 1; transform: scale(1) translateY(0); } }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes slideIn { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }
`;

const DAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
const DAY_INDEX = { "Вс": 0, "Пн": 1, "Вт": 2, "Ср": 3, "Чт": 4, "Пт": 5, "Сб": 6 };
const DAY_LABEL = {
  ru: { "Пн": "Пн", "Вт": "Вт", "Ср": "Ср", "Чт": "Чт", "Пт": "Пт", "Сб": "Сб", "Вс": "Вс" },
  en: { "Пн": "Mon", "Вт": "Tue", "Ср": "Wed", "Чт": "Thu", "Пт": "Fri", "Сб": "Sat", "Вс": "Sun" },
  uz: { "Пн": "Dush", "Вт": "Sesh", "Ср": "Chor", "Чт": "Pay", "Пт": "Jum", "Сб": "Shan", "Вс": "Yak" },
};
const dayLabel = (day, lang) => (DAY_LABEL[lang] && DAY_LABEL[lang][day]) || day;

/* -------------------------------- Утилиты -------------------------------- */
const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
const fmt = (n) => Math.round(n || 0).toLocaleString("ru-RU");
const ruDate = (iso, locale = "ru-RU") => new Date(iso).toLocaleDateString(locale, { day: "2-digit", month: "short" });
const toDateKey = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const monthKeyOf = (y, m) => `${y}-${String(m + 1).padStart(2, "0")}`;
const toMinutes = (hhmm) => { const [h, mnt] = (hhmm || "0:0").split(":").map(Number); return h * 60 + mnt; };
const scheduleText = (g, fallback = "не задано") => (g.days && g.days.length ? `${g.days.join("/")} · ${g.start}–${g.end}` : fallback);

/* ------------------------------ Переводы ------------------------------ */
const TRANSLATIONS = {
  ru: {
    login_title: "Глобал Ап",
    login_subtitle: "Кабинет учителя",
    phone_label: "Номер телефона",
    password_label: "Пароль",
    login_btn: "Войти",
    login_remember_note: "После первого входа вход запомнится на этом устройстве.",
    loading: "Загрузка…",
    load_error_title: "Не удалось загрузить данные",
    reload_btn: "Обновить страницу",
    logout: "Выйти",
    refresh: "Обновить",
    hello: "Здравствуйте, {name}",
    group_word_one: "группа", group_word_few: "групп",
    notification_btn: "Уведомление",
    salary_btn: "Моя зарплата",
    tab_groups: "Мои группы", tab_schedule: "Расписание", tab_ranking: "Рейтинг",
    important_notice: "Важное уведомление",
    settings: "Настройки", language: "Язык", theme: "Тема",
    theme_light: "Светлая", theme_dark: "Тёмная",
    no_groups: "Пока нет ни одной группы",
    students_count: "учеников",
    open_journal: "Открыть журнал",
    today: "Сегодня", no_lessons_today: "Сегодня занятий нет",
    ranking_title: "Рейтинг моих учеников",
    avg_grade: "Средний балл", attendance: "Посещаемость",
    journal_title: "Журнал: {name}",
    mark_all_present: "Отметить всех как «Был»",
    materials_title: "Материалы / ДЗ",
    add_material: "Добавить материал",
    material_text_placeholder: "Текст задания",
    material_link_placeholder: "Ссылка (необязательно)",
    save: "Сохранить", cancel: "Отмена", delete: "Удалить",
    no_materials: "Пока нет материалов",
    award_coins_placeholder: "Кол-во монет",
    award: "Начислить",
    salary_title: "Моя зарплата",
    revenue_label: "Выручка по группам", rate_label: "Ставка",
    advance_label: "Аванс", already_paid_label: "Уже выплачено", net_label: "К выплате",
    announcement_title: "Уведомление родителям/ученикам",
    announcement_hint: "Увидят только те, кому адресовано — в личном кабинете. Директору и администратору это уведомление не показывается.",
    announcement_target: "Кому отправить",
    announcement_all: "Всем моим ученикам (все мои группы)",
    announcement_only_group: "Только группа: {name}",
    announcement_text_placeholder: "Например: Завтра занятия не будет — праздничный день",
    announcement_urgent: "Важное — показать крупно, красным, наверху",
    send: "Отправить",
    no_student_found: "Ваш номер телефона не найден среди учителей в базе. Обратитесь к администратору.",
    width_label: "Ширина ленты:",
    print_receipt: "Печать чека",
    days_left: "{n} дн. до конца курса", course_finished: "курс завершён",
    mark_attendance_btn: "Отметить посещаемость",
    no_groups_assigned: "Пока нет ни одной закреплённой группы — обратитесь к администратору.",
    no_groups_schedule: "Пока нет групп в расписании.",
    no_lessons: "Занятий нет.", today_pill: "сегодня",
    no_students_ranking: "Пока нет учеников для рейтинга.",
    attendance_pct: "{pct}% посещ.",
    students_suffix: "учеников",
    add_students_first: "Сначала добавьте учеников в группу.",
    prev_month: "Предыдущий месяц", next_month: "Следующий месяц", current_month_btn: "Текущий",
    legend_no_mark: "нет отметки, кликните", legend_present: "Был", legend_absent: "Не был", legend_excused: "Уваж. причина", legend_future: "Ещё не было",
    grade_hint: "Под отметкой посещения — кнопка «оц.»: нажмите, чтобы выбрать оценку 1–5 одним касанием.",
    no_lessons_month: "В этом месяце по расписанию группы занятий нет.",
    name_col: "Имя", mark_all_tooltip: "Отметить всех как «Был»", mark_all_short: "все ✓",
    present_label: "Был", absent_label: "Нет", excused_short: "Ув.",
    mark_click_hint: "Клик: Был → Не был → Не был (уваж. причина) → снять отметку",
    grade_short: "оц.", grade_tooltip: "Поставить оценку", grade_title: "Оценка: {name}", remove_grade: "Снять оценку",
    group_composition: "Состав группы", no_students_in_group: "В группе пока нет учеников.",
    unpaid_month: "не оплачено за месяц", paid_status: "оплачено",
    journal_footer_note: "Клик по ячейке: «Был» → «Не был» → «Не был (уваж. причина)» → снять отметку. GlobalCoins — максимум 25 за раз. Статус оплаты показывает только оплачено/нет — суммы и долги видит только администрация.",
    fixed_rate: "Фиксированная ставка", percent_rate: "{pct}% от выручки", percent_bonus_rate: "{pct}% + бонус",
    no_groups_period: "Пока нет групп.", students_short: "уч.", lessons_month_short: "уроков в месяце",
    revenue_total: "Выручка всего", formula_label: "Формула", advance_given: "Уже выдан аванс",
    remainder_to_pay: "Остаток к выплате",
    no_schedule: "не задано",
    server_timeout: "Сервер не ответил вовремя — проверьте интернет-соединение.",
    server_unreachable: "Нет связи с сервером: {msg}",
    login_failed_generic: "Не удалось войти",
    session_error: "Ошибка входа — попробуйте перезайти",
  },
  en: {
    login_title: "Global Up",
    login_subtitle: "Teacher portal",
    phone_label: "Phone number",
    password_label: "Password",
    login_btn: "Log in",
    login_remember_note: "After the first login this device will stay signed in.",
    loading: "Loading…",
    load_error_title: "Could not load data",
    reload_btn: "Reload page",
    logout: "Log out",
    refresh: "Refresh",
    hello: "Hello, {name}",
    group_word_one: "group", group_word_few: "groups",
    notification_btn: "Notification",
    salary_btn: "My salary",
    tab_groups: "My groups", tab_schedule: "Schedule", tab_ranking: "Ranking",
    important_notice: "Important notice",
    settings: "Settings", language: "Language", theme: "Theme",
    theme_light: "Light", theme_dark: "Dark",
    no_groups: "No groups yet",
    students_count: "students",
    open_journal: "Open journal",
    today: "Today", no_lessons_today: "No lessons today",
    ranking_title: "My students' ranking",
    avg_grade: "Average grade", attendance: "Attendance",
    journal_title: "Journal: {name}",
    mark_all_present: "Mark everyone as Present",
    materials_title: "Materials / Homework",
    add_material: "Add material",
    material_text_placeholder: "Assignment text",
    material_link_placeholder: "Link (optional)",
    save: "Save", cancel: "Cancel", delete: "Delete",
    no_materials: "No materials yet",
    award_coins_placeholder: "Amount of coins",
    award: "Award",
    salary_title: "My salary",
    revenue_label: "Revenue from my groups", rate_label: "Rate",
    advance_label: "Advance", already_paid_label: "Already paid", net_label: "Net to pay",
    announcement_title: "Notification to parents/students",
    announcement_hint: "Seen only by those it's addressed to — in their personal account. Not shown to the director or admin.",
    announcement_target: "Send to",
    announcement_all: "All my students (all my groups)",
    announcement_only_group: "Only group: {name}",
    announcement_text_placeholder: "e.g.: No classes tomorrow — public holiday",
    announcement_urgent: "Important — show big and red, at the top",
    send: "Send",
    no_student_found: "Your phone number was not found among teachers in the database. Contact the administrator.",
    width_label: "Tape width:",
    print_receipt: "Print receipt",
    days_left: "{n} days left in the course", course_finished: "course finished",
    mark_attendance_btn: "Mark attendance",
    no_groups_assigned: "No groups assigned yet — contact the administrator.",
    no_groups_schedule: "No groups in the schedule.",
    no_lessons: "No lessons.", today_pill: "today",
    no_students_ranking: "No students for ranking yet.",
    attendance_pct: "{pct}% attend.",
    students_suffix: "students",
    add_students_first: "Add students to the group first.",
    prev_month: "Previous month", next_month: "Next month", current_month_btn: "Current",
    legend_no_mark: "no mark, click", legend_present: "Present", legend_absent: "Absent", legend_excused: "Excused", legend_future: "Not yet held",
    grade_hint: "Under the attendance mark — the \"gr.\" button: tap to pick a grade 1–5 in one touch.",
    no_lessons_month: "No lessons scheduled for the group this month.",
    name_col: "Name", mark_all_tooltip: "Mark everyone as Present", mark_all_short: "all ✓",
    present_label: "Present", absent_label: "Absent", excused_short: "Exc.",
    mark_click_hint: "Click: Present → Absent → Absent (excused) → clear mark",
    grade_short: "gr.", grade_tooltip: "Set a grade", grade_title: "Grade: {name}", remove_grade: "Remove grade",
    group_composition: "Group roster", no_students_in_group: "No students in the group yet.",
    unpaid_month: "unpaid this month", paid_status: "paid",
    journal_footer_note: "Click a cell: Present → Absent → Absent (excused) → clear mark. GlobalCoins — max 25 at a time. Payment status only shows paid/unpaid — amounts and debts are visible to administration only.",
    fixed_rate: "Fixed rate", percent_rate: "{pct}% of revenue", percent_bonus_rate: "{pct}% + bonus",
    no_groups_period: "No groups yet.", students_short: "st.", lessons_month_short: "lessons this month",
    revenue_total: "Total revenue", formula_label: "Formula", advance_given: "Advance already paid",
    remainder_to_pay: "Remaining to pay",
    no_schedule: "not set",
    server_timeout: "The server did not respond in time — check your connection.",
    server_unreachable: "No connection to server: {msg}",
    login_failed_generic: "Could not log in",
    session_error: "Login error — try signing in again",
  },
  uz: {
    login_title: "Global Up",
    login_subtitle: "O'qituvchi kabineti",
    phone_label: "Telefon raqami",
    password_label: "Parol",
    login_btn: "Kirish",
    login_remember_note: "Birinchi kirishdan so'ng bu qurilmada kirish saqlanadi.",
    loading: "Yuklanmoqda…",
    load_error_title: "Ma'lumotlarni yuklab bo'lmadi",
    reload_btn: "Sahifani yangilash",
    logout: "Chiqish",
    refresh: "Yangilash",
    hello: "Assalomu alaykum, {name}",
    group_word_one: "guruh", group_word_few: "guruh",
    notification_btn: "Xabar",
    salary_btn: "Mening maoshim",
    tab_groups: "Mening guruhlarim", tab_schedule: "Dars jadvali", tab_ranking: "Reyting",
    important_notice: "Muhim xabar",
    settings: "Sozlamalar", language: "Til", theme: "Mavzu",
    theme_light: "Yorug'", theme_dark: "Tungi",
    no_groups: "Hozircha birorta ham guruh yo'q",
    students_count: "o'quvchi",
    open_journal: "Jurnalni ochish",
    today: "Bugun", no_lessons_today: "Bugun dars yo'q",
    ranking_title: "O'quvchilarim reytingi",
    avg_grade: "O'rtacha baho", attendance: "Davomat",
    journal_title: "Jurnal: {name}",
    mark_all_present: "Hammani \"Keldi\" deb belgilash",
    materials_title: "Materiallar / Uy vazifasi",
    add_material: "Material qo'shish",
    material_text_placeholder: "Vazifa matni",
    material_link_placeholder: "Havola (ixtiyoriy)",
    save: "Saqlash", cancel: "Bekor qilish", delete: "O'chirish",
    no_materials: "Hozircha materiallar yo'q",
    award_coins_placeholder: "Coinlar soni",
    award: "Berish",
    salary_title: "Mening maoshim",
    revenue_label: "Guruhlarim bo'yicha tushum", rate_label: "Stavka",
    advance_label: "Avans", already_paid_label: "Allaqachon to'langan", net_label: "To'lanadigan summa",
    announcement_title: "Ota-onalar/o'quvchilarga xabar",
    announcement_hint: "Faqat kimga yo'llangan bo'lsa, o'sha ko'radi — shaxsiy kabinetida. Direktor va administratorga bu xabar ko'rinmaydi.",
    announcement_target: "Kimga yuborish",
    announcement_all: "Barcha o'quvchilarimga (barcha guruhlarim)",
    announcement_only_group: "Faqat guruh: {name}",
    announcement_text_placeholder: "Masalan: Ertaga dars bo'lmaydi — bayram kuni",
    announcement_urgent: "Muhim — katta va qizil rangda, yuqorida ko'rsatish",
    send: "Yuborish",
    no_student_found: "Telefon raqamingiz o'qituvchilar bazasida topilmadi. Administratorga murojaat qiling.",
    width_label: "Lenta kengligi:",
    print_receipt: "Chekni chop etish",
    days_left: "Kursgacha {n} kun qoldi", course_finished: "kurs tugadi",
    mark_attendance_btn: "Davomatni belgilash",
    no_groups_assigned: "Hozircha birorta guruh biriktirilmagan. Administratorga murojaat qiling.",
    no_groups_schedule: "Dars jadvalida guruhlar yo'q.",
    no_lessons: "Darslar yo'q.", today_pill: "bugun",
    no_students_ranking: "Reyting uchun hozircha o'quvchilar yo'q.",
    attendance_pct: "{pct}% davomat",
    students_suffix: "o'quvchi",
    add_students_first: "Avval guruhga o'quvchilarni qo'shing.",
    prev_month: "Oldingi oy", next_month: "Keyingi oy", current_month_btn: "Joriy",
    legend_no_mark: "belgi yo'q, bosing", legend_present: "Keldi", legend_absent: "Kelmadi", legend_excused: "Uzrli sabab", legend_future: "Hali bo'lmagan",
    grade_hint: "Davomat belgisi ostida \"bh.\" tugmasi bor: bir bosishda 1–5 baho qo'yish uchun bosing.",
    no_lessons_month: "Bu oyda guruh jadvali bo'yicha darslar yo'q.",
    name_col: "Ism", mark_all_tooltip: "Hammani \"Keldi\" deb belgilash", mark_all_short: "hammasi ✓",
    present_label: "Keldi", absent_label: "Kelmadi", excused_short: "Uzr.",
    mark_click_hint: "Bosish: Keldi → Kelmadi → Kelmadi (uzrli) → belgini olib tashlash",
    grade_short: "bh.", grade_tooltip: "Baho qo'yish", grade_title: "Baho: {name}", remove_grade: "Bahoni olib tashlash",
    group_composition: "Guruh tarkibi", no_students_in_group: "Guruhda hali o'quvchilar yo'q.",
    unpaid_month: "bu oy uchun to'lanmagan", paid_status: "to'langan",
    journal_footer_note: "Katakchani bosish: Keldi → Kelmadi → Kelmadi (uzrli) → belgini olib tashlash. GlobalCoins — bir safarda maksimal 25. To'lov holati faqat to'langan/to'lanmaganini ko'rsatadi — summalar va qarzlarni faqat ma'muriyat ko'radi.",
    fixed_rate: "Belgilangan stavka", percent_rate: "Tushumning {pct}%i", percent_bonus_rate: "{pct}% + bonus",
    no_groups_period: "Hozircha guruhlar yo'q.", students_short: "o'q.", lessons_month_short: "bu oyda darslar",
    revenue_total: "Umumiy tushum", formula_label: "Formula", advance_given: "Avans allaqachon berilgan",
    remainder_to_pay: "To'lanadigan qoldiq",
    no_schedule: "belgilanmagan",
    server_timeout: "Server javob bermadi — internetni tekshiring.",
    server_unreachable: "Server bilan aloqa yo'q: {msg}",
    login_failed_generic: "Kirib bo'lmadi",
    session_error: "Kirishda xatolik — qayta urinib ko'ring",
  },
};
function translate(lang, key, vars) {
  let str = (TRANSLATIONS[lang] && TRANSLATIONS[lang][key]) || TRANSLATIONS.ru[key] || key;
  if (vars) Object.keys(vars).forEach((k) => { str = str.replace(`{${k}}`, vars[k]); });
  return str;
}

function countLessonsInMonth(days, year, month, fromDay = 1) {
  const wanted = new Set((days || []).map((d) => DAY_INDEX[d]));
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  let count = 0;
  for (let day = fromDay; day <= daysInMonth; day++) {
    if (wanted.has(new Date(year, month, day).getDay())) count++;
  }
  return count;
}
function lessonDatesInMonth(days, year, month) {
  const wanted = new Set((days || []).map((d) => DAY_INDEX[d]));
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const out = [];
  for (let day = 1; day <= daysInMonth; day++) {
    const dt = new Date(year, month, day);
    if (wanted.has(dt.getDay())) out.push(dt);
  }
  return out;
}
function attendanceStats(student, groupId) {
  const log = (student.attendanceLog || []).filter((r) => r.groupId === groupId);
  const total = log.length;
  const present = log.filter((r) => r.present).length;
  return { total, present, pct: total ? Math.round((present / total) * 100) : null };
}
function monthlyCharge(group, student, year, month) {
  const totalLessons = countLessonsInMonth(group.days, year, month, 1);
  if (totalLessons === 0) return { amount: 0, lessons: 0 };
  const pricePerLesson = group.price / totalLessons;
  const joined = student.joinedAt ? new Date(student.joinedAt) : null;
  const fromDay = (joined && joined.getFullYear() === year && joined.getMonth() === month) ? joined.getDate() : 1;
  const scheduledLessons = countLessonsInMonth(group.days, year, month, fromDay);
  const excusedCount = (student.attendanceLog || []).filter((r) => {
    if (r.present !== false || !r.excused) return false;
    const d = new Date(r.date);
    return d.getFullYear() === year && d.getMonth() === month && d.getDate() >= fromDay;
  }).length;
  const billableLessons = Math.max(0, scheduledLessons - excusedCount);
  const discountPct = student.discount || 0;
  const gross = pricePerLesson * billableLessons;
  return { amount: Math.round(gross * (1 - discountPct / 100)), lessons: billableLessons, discountPct };
}

const COURSE_COLORS = {
  "Английский язык": "#B91C1C", "Немецкий язык": "#B45309", "Русский язык": "#1D4ED8",
  "Узбекский язык": "#15803D", "Корейский язык": "#7E22CE", "Китайский язык": "#C2410C",
};
const FALLBACK_COURSE_PALETTE = ["#0F766E", "#9333EA", "#0369A1", "#B45309", "#4D7C0F", "#BE185D"];
function courseColor(course) {
  if (COURSE_COLORS[course]) return COURSE_COLORS[course];
  let hash = 0;
  for (let i = 0; i < (course || "").length; i++) hash = (hash * 31 + course.charCodeAt(i)) >>> 0;
  return FALLBACK_COURSE_PALETTE[hash % FALLBACK_COURSE_PALETTE.length];
}
function CourseDot({ course }) {
  return <span className="inline-block w-2 h-2 rounded-full shrink-0" style={{ background: courseColor(course) }} />;
}

/* -------------------------------- UI-атомы -------------------------------- */
const inputCls = "w-full text-[13.5px] px-3 py-2.5 rounded-xl bg-[#FAFAF7] outline-none transition-shadow focus:shadow-[0_0_0_3px_rgba(220,38,38,0.12)]";
const inputStyle = { border: `1px solid ${LINE}` };

function Card({ children, className = "", hover }) {
  return (
    <div className={`card-surface bg-white rounded-2xl ${hover ? "transition-shadow hover:shadow-md" : ""} ${className}`} style={{ border: `1px solid ${LINE}` }}>
      {children}
    </div>
  );
}
function PrimaryBtn({ children, onClick, type = "button", full, disabled }) {
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`flex items-center justify-center gap-1.5 text-[13px] font-medium px-4 py-2.5 rounded-full text-white ${full ? "w-full" : ""}`} style={{ background: TEAL, opacity: disabled ? 0.6 : 1, cursor: disabled ? "default" : "pointer" }}>
      {children}
    </button>
  );
}
function IconBtn({ icon: Icon, onClick, label, disabled }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled} title={label} aria-label={label} className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ background: "#EEEEE8", color: "#5B5B54", opacity: disabled ? 0.4 : 1 }}>
      <Icon size={15} />
    </button>
  );
}
function EmptyState({ text }) {
  return <div className="py-8 text-center text-[13px] opacity-45">{text}</div>;
}
function Pill({ children, tone = "teal" }) {
  const map = { teal: ["#FEE2E2", TEAL_D], gold: ["#FEF9C3", "#854D0E"], brick: ["#FFEDD5", BRICK], green: ["#DCFCE7", GREEN_D] };
  const [bg, fg] = map[tone] || map.teal;
  return <span className="text-[11.5px] font-medium px-2.5 py-1 rounded-full" style={{ background: bg, color: fg }}>{children}</span>;
}
function Field({ label, children }) {
  return <label className="block"><span className="text-[12px] opacity-50 block mb-1.5">{label}</span>{children}</label>;
}
function Row({ label, value }) {
  return <div className="flex items-center justify-between py-2" style={{ borderBottom: `1px solid ${LINE}` }}><span className="opacity-50">{label}</span><span className="font-medium">{value}</span></div>;
}
function Modal({ title, onClose, children, wide, huge }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/40 anim-fade" onClick={onClose} />
      <div className={`anim-pop relative bg-white rounded-2xl shadow-2xl w-full ${huge ? "max-w-6xl" : wide ? "max-w-4xl" : "max-w-sm"} p-6 ${huge ? "h-[94vh]" : "max-h-[92vh]"} overflow-y-auto`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="disp text-[17px] font-semibold">{title}</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "#EEEEE8" }}><X size={16} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

/* ----------------------------- Таблица посещаемости ----------------------------- */
function AttendanceTable({ group, students, onMark, onMarkAll, onGrade, t, lang }) {
  const locale = LOCALE_OF[lang] || "ru-RU";
  const [viewDate, setViewDate] = useState(() => { const d = new Date(); d.setDate(1); d.setHours(0, 0, 0, 0); return d; });
  const year = viewDate.getFullYear(), month = viewDate.getMonth();
  const createdAt = group.createdAt ? new Date(group.createdAt) : null;
  const dates = lessonDatesInMonth(group.days, year, month).filter((d) => !createdAt || d >= new Date(createdAt.getFullYear(), createdAt.getMonth(), createdAt.getDate()));
  const dateInfo = dates.map((d) => ({ d, str: toDateKey(d) }));
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;
  const changeMonth = (delta) => setViewDate(new Date(year, month + delta, 1));
  const studentIds = students.map((s) => s.id);
  const [gradePicker, setGradePicker] = useState(null); // { studentId, studentName, dateStr, dateLabel, current }

  if (students.length === 0) return <EmptyState text={t("add_students_first")} />;

  return (
    <div>
      <div className="flex items-center gap-1.5 mb-2.5">
        <IconBtn icon={ChevronLeft} label={t("prev_month")} onClick={() => changeMonth(-1)} />
        {!isCurrentMonth && (
          <button onClick={() => { const d = new Date(); d.setDate(1); d.setHours(0, 0, 0, 0); setViewDate(d); }} className="text-[11.5px] font-medium px-2.5 py-1 rounded-full" style={{ background: "var(--soft-purple-bg)", color: TEAL_D }}>{t("current_month_btn")}</button>
        )}
        <span className="text-[13px] font-medium capitalize">{viewDate.toLocaleDateString(locale, { month: "long", year: "numeric" })}</span>
        <IconBtn icon={ChevronRight} label={t("next_month")} onClick={() => changeMonth(1)} />
      </div>
      <div className="flex flex-wrap items-center gap-3 mb-2.5 text-[11px]">
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full inline-block" style={{ background: "var(--surface-alt)" }} /> — {t("legend_no_mark")}</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full inline-block" style={{ background: "var(--soft-green-bg, #DCFCE7)" }} /> {t("legend_present")}</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full inline-block" style={{ background: "#FFEDD5" }} /> {t("legend_absent")}</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full inline-block" style={{ background: "#DBEAFE" }} /> {t("legend_excused")}</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full inline-block" style={{ background: "var(--surface)", border: `1px solid ${LINE}` }} /> {t("legend_future")}</span>
      </div>
      <p className="text-[11px] opacity-40 mb-2">{t("grade_hint")}</p>
      {dateInfo.length === 0 ? <EmptyState text={t("no_lessons_month")} /> : (
        <div className="overflow-x-auto rounded-xl" style={{ border: `1px solid ${LINE}`, maxHeight: "70vh", overflowY: "auto" }}>
          <table className="text-[12px] border-collapse">
            <thead>
              <tr>
                <th className="sticky left-0 top-0 text-left px-3 py-2 font-medium z-10" style={{ borderBottom: `1px solid ${LINE}`, borderRight: `1px solid ${LINE}`, background: "var(--surface)" }}>{t("name_col")}</th>
                {dateInfo.map(({ d, str }) => {
                  const future = d > today;
                  return (
                    <th key={str} className="sticky top-0 px-1.5 py-1.5 font-medium text-center whitespace-nowrap" style={{ borderBottom: `1px solid ${LINE}`, color: d.toDateString() === today.toDateString() ? TEAL : INK, background: "var(--surface)" }}>
                      <div>{d.getDate()} {d.toLocaleDateString(locale, { month: "short" })}</div>
                      {!future && (
                        <button onClick={() => onMarkAll(studentIds, str, true, group.id)} title={t("mark_all_tooltip")} className="mt-0.5 text-[9.5px] font-medium px-1.5 py-0.5 rounded-full" style={{ background: "var(--soft-green-bg, #DCFCE7)", color: GREEN_D }}>
                          {t("mark_all_short")}
                        </button>
                      )}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {students.map((s) => {
                const logMap = new Map((s.attendanceLog || []).filter((r) => r.groupId === group.id).map((r) => [r.date, r]));
                return (
                <tr key={s.id}>
                  <td className="sticky left-0 px-3 py-1.5 font-medium truncate max-w-[140px]" style={{ borderRight: `1px solid ${LINE}`, borderTop: `1px solid ${LINE}`, background: "var(--surface)" }}>{s.name}</td>
                  {dateInfo.map(({ d, str: dateStr }) => {
                    const rec = logMap.get(dateStr);
                    const future = d > today;
                    let bg = "var(--surface-alt)", fg = "var(--ink)", label = "—";
                    if (rec) {
                      if (rec.present) { bg = "var(--soft-green-bg, #DCFCE7)"; fg = GREEN_D; label = t("present_label"); }
                      else if (rec.excused) { bg = "#DBEAFE"; fg = "#1D4ED8"; label = t("excused_short"); }
                      else { bg = "#FFEDD5"; fg = BRICK; label = t("absent_label"); }
                    }
                    if (future) { bg = "var(--surface)"; fg = "#C9C6BA"; label = "·"; }
                    const grade = rec?.grade;
                    const gradeColors = { 1: BRICK, 2: "#EA580C", 3: "#CA8A04", 4: "#65A30D", 5: GREEN_D };
                    return (
                      <td key={dateStr} className="px-1.5 py-1.5 text-center" style={{ borderTop: `1px solid ${LINE}` }}>
                        <button
                          disabled={future}
                          onClick={() => onMark(s.id, dateStr, group.id)}
                          title={t("mark_click_hint")}
                          className="w-14 py-1 rounded-full text-[10.5px] font-medium"
                          style={{ background: bg, color: fg, cursor: future ? "default" : "pointer" }}
                        >
                          {label}
                        </button>
                        {!future && (
                          <button
                            onClick={() => setGradePicker({ studentId: s.id, studentName: s.name, dateStr, dateLabel: `${d.getDate()} ${d.toLocaleDateString(locale, { month: "long" })}`, current: grade || null })}
                            title={t("grade_tooltip")}
                            className="mt-1 w-14 py-0.5 rounded-full text-[10px] font-semibold"
                            style={{ background: grade ? gradeColors[grade] : "var(--surface-soft)", color: grade ? "#fff" : "#B0AFA4" }}
                          >
                            {grade || t("grade_short")}
                          </button>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );})}
            </tbody>
          </table>
        </div>
      )}
      {gradePicker && (
        <Modal title={t("grade_title", { name: gradePicker.studentName })} onClose={() => setGradePicker(null)}>
          <p className="text-[12.5px] opacity-50 mb-3">{gradePicker.dateLabel}</p>
          <div className="grid grid-cols-5 gap-2">
            {[1, 2, 3, 4, 5].map((n) => {
              const gradeColors = { 1: BRICK, 2: "#EA580C", 3: "#CA8A04", 4: "#65A30D", 5: GREEN_D };
              const active = gradePicker.current === n;
              return (
                <button
                  key={n}
                  onClick={() => { onGrade(gradePicker.studentId, gradePicker.dateStr, group.id, n); setGradePicker(null); }}
                  className="aspect-square rounded-xl text-[20px] font-semibold flex items-center justify-center"
                  style={{ background: active ? gradeColors[n] : "var(--surface-soft)", color: active ? "#fff" : INK, border: active ? "none" : `1px solid ${LINE}` }}
                >
                  {n}
                </button>
              );
            })}
          </div>
          {gradePicker.current && (
            <button onClick={() => { onGrade(gradePicker.studentId, gradePicker.dateStr, group.id, null); setGradePicker(null); }} className="w-full mt-3 text-[12.5px] font-medium py-2.5 rounded-full" style={{ background: "var(--surface-alt)", color: "var(--ink)" }}>
              {t("remove_grade")}
            </button>
          )}
        </Modal>
      )}
    </div>
  );
}

/* ----------------------------- Материалы к уроку ----------------------------- */
function MaterialsSection({ db, group, onSave, onDelete, t, lang }) {
  const locale = LOCALE_OF[lang] || "ru-RU";
  const now = new Date();
  const monthDates = lessonDatesInMonth(group.days, now.getFullYear(), now.getMonth());
  const [dateStr, setDateStr] = useState(() => toDateKey(now));
  const [text, setText] = useState("");
  const [link, setLink] = useState("");
  const materials = (db.lessonMaterials || []).filter((m) => m.groupId === group.id).sort((a, b) => (a.date < b.date ? 1 : -1));

  const save = () => {
    if (!text.trim() && !link.trim()) return;
    onSave({ groupId: group.id, date: dateStr, text: text.trim(), link: link.trim() });
    setText(""); setLink("");
  };

  return (
    <div>
      <h4 className="text-[13px] font-semibold mb-2">{t("materials_title")}</h4>
      <div className="p-3 rounded-xl space-y-2" style={{ background: "var(--surface-soft)" }}>
        <div className="flex gap-2 flex-wrap">
          <select className="text-[12.5px] px-2.5 py-2 rounded-lg" style={{ ...inputStyle, background: "var(--surface)" }} value={dateStr} onChange={(e) => setDateStr(e.target.value)}>
            {monthDates.map((d) => { const key = toDateKey(d); return <option key={key} value={key}>{d.toLocaleDateString(locale, { day: "2-digit", month: "long" })}</option>; })}
          </select>
        </div>
        <textarea rows={2} className="w-full text-[12.5px] px-3 py-2 rounded-lg outline-none" style={{ ...inputStyle, background: "var(--surface)" }} value={text} onChange={(e) => setText(e.target.value)} placeholder={t("material_text_placeholder")} />
        <input className="w-full text-[12.5px] px-3 py-2 rounded-lg outline-none" style={{ ...inputStyle, background: "var(--surface)" }} value={link} onChange={(e) => setLink(e.target.value)} placeholder={t("material_link_placeholder")} />
        <button onClick={save} className="text-[12px] font-medium px-3.5 py-2 rounded-full text-white" style={{ background: TEAL }}>{t("save")}</button>
      </div>
      {materials.length > 0 && (
        <div className="mt-3 space-y-2">
          {materials.map((m) => (
            <div key={m.id} className="p-2.5 rounded-xl flex items-start justify-between gap-2" style={{ border: `1px solid ${LINE}` }}>
              <div className="min-w-0">
                <div className="text-[11.5px] font-medium opacity-60">{new Date(m.date).toLocaleDateString(locale, { day: "2-digit", month: "long" })}</div>
                {m.text && <div className="text-[12.5px] mt-0.5">{m.text}</div>}
                {m.link && <a href={m.link} target="_blank" rel="noreferrer" className="text-[12px] mt-0.5 block truncate" style={{ color: TEAL_D }}>{m.link}</a>}
              </div>
              <button onClick={() => onDelete(m.id)} className="w-7 h-7 rounded-full flex items-center justify-center shrink-0" style={{ background: "var(--surface-alt)" }}><X size={13} /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ----------------------------- Журнал группы (для учителя) ----------------------------- */
function GroupJournalModal({ group, db, onClose, onMark, onMarkAll, onAward, onGrade, onSaveMaterial, onDeleteMaterial, t, lang }) {
  const students = db.students.filter((s) => s.groupId === group.id);
  const [coinAmounts, setCoinAmounts] = useState({});

  return (
    <Modal title={t("journal_title", { name: group.name })} onClose={onClose} huge>
      <div className="space-y-4">
        {group.curriculum && (
          <div className="p-3 rounded-xl text-[12.5px] flex items-start gap-2" style={{ background: "var(--surface-soft)" }}>
            <span className="opacity-70">{group.curriculum}</span>
          </div>
        )}
        <div>
          <h4 className="text-[13px] font-semibold mb-2">{t("attendance_grades")}</h4>
          <AttendanceTable group={group} students={students} onMark={onMark} onMarkAll={onMarkAll} onGrade={onGrade} t={t} lang={lang} />
        </div>
        <MaterialsSection db={db} group={group} onSave={onSaveMaterial} onDelete={onDeleteMaterial} t={t} lang={lang} />
        <div>
          <h4 className="text-[13px] font-semibold mb-2">{t("group_composition")}</h4>
          <div className="space-y-2">
            {students.length === 0 && <EmptyState text={t("no_students_in_group")} />}
            {students.map((s) => (
              <div key={s.id} className="flex items-center gap-2 p-2.5 rounded-xl flex-wrap" style={{ border: `1px solid ${LINE}` }}>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-medium truncate flex items-center gap-1.5">
                    {s.name}
                    {s.debt > 0
                      ? <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full" style={{ background: "#FFEDD5", color: BRICK }}>{t("unpaid_month")}</span>
                      : <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full" style={{ background: "var(--soft-green-bg, #DCFCE7)", color: GREEN_D }}>{t("paid_status")}</span>}
                  </div>
                  <div className="text-[11px] opacity-45 flex items-center gap-1"><Coins size={11} /> {s.coins} GC</div>
                </div>
                <input type="number" min={0} max={25} value={coinAmounts[s.id] || ""} onChange={(e) => setCoinAmounts({ ...coinAmounts, [s.id]: e.target.value })} placeholder="GC" className="w-14 text-[12px] px-2 py-1.5 rounded-lg" style={{ ...inputStyle, background: "var(--surface)" }} />
                <button onClick={() => { onAward(s.id, coinAmounts[s.id]); setCoinAmounts({ ...coinAmounts, [s.id]: "" }); }} className="text-[11px] font-medium px-2 py-1.5 rounded-full" style={{ background: "var(--soft-yellow-bg)", color: "var(--soft-yellow-fg)" }}>+GC</button>
              </div>
            ))}
          </div>
        </div>
        <p className="text-[11px] opacity-40">{t("journal_footer_note")}</p>
      </div>
    </Modal>
  );
}

/* ----------------------------- Моя зарплата ----------------------------- */
function computeMySalary(db, teacher, t, locale) {
  const now = new Date();
  const y = now.getFullYear(), m = now.getMonth();
  const tGroups = db.groups.filter((g) => g.teacherId === teacher.id);
  const rows = tGroups.map((g) => {
    const totalLessons = countLessonsInMonth(g.days, y, m, 1);
    const students = db.students.filter((s) => s.groupId === g.id);
    const revenue = students.reduce((sum, s) => {
      if (!totalLessons) return sum;
      const joined = s.joinedAt ? new Date(s.joinedAt) : null;
      const fromDay = (joined && joined.getFullYear() === y && joined.getMonth() === m) ? joined.getDate() : 1;
      const lessonsForStudent = countLessonsInMonth(g.days, y, m, fromDay);
      return sum + g.price * (lessonsForStudent / totalLessons);
    }, 0);
    return { group: g, students: students.length, totalLessons, revenue };
  });
  const totalRevenue = rows.reduce((a, r) => a + r.revenue, 0);
  let salary = 0, label = "";
  if (teacher.rateType === "fixed") { salary = teacher.rateValue; label = t("fixed_rate"); }
  else if (teacher.rateType === "percent") { salary = Math.round(totalRevenue * (teacher.rateValue / 100)); label = t("percent_rate", { pct: teacher.rateValue }); }
  else { salary = Math.round(totalRevenue * (teacher.rateValue / 100)) + 200000; label = t("percent_bonus_rate", { pct: teacher.rateValue }); }
  const monthKey = monthKeyOf(y, m);
  const advance = (db.advances || []).filter((a) => a.teacherId === teacher.id && a.month === monthKey).reduce((s, a) => s + a.amount, 0);
  const alreadyPaid = (db.payrollHistory || []).filter((p) => p.teacherId === teacher.id && p.month === monthKey).reduce((s, p) => s + p.net, 0);
  const net = Math.max(0, salary - advance - alreadyPaid);
  return { rows, totalRevenue, salary, label, advance, alreadyPaid, net, periodLabel: now.toLocaleDateString(locale || "ru-RU", { month: "long", year: "numeric" }) };
}
function SalaryModal({ db, teacher, onClose, t, lang }) {
  const locale = LOCALE_OF[lang] || "ru-RU";
  const s = computeMySalary(db, teacher, t, locale);
  return (
    <Modal title={t("salary_title")} onClose={onClose}>
      <div className="space-y-3">
        <p className="text-[12px] opacity-45 capitalize">{s.periodLabel}</p>
        <div className="space-y-2">
          {s.rows.length === 0 && <p className="text-[12.5px] opacity-45">{t("no_groups_period")}</p>}
          {s.rows.map((r) => (
            <div key={r.group.id} className="p-2.5 rounded-lg" style={{ background: "var(--surface-soft)" }}>
              <div className="flex items-center justify-between text-[13px] font-medium"><span>{r.group.name}</span><span className="mono">{fmt(Math.round(r.revenue))} {lang === "ru" ? "сум" : lang === "uz" ? "so'm" : "UZS"}</span></div>
              <div className="text-[11.5px] opacity-50 mt-0.5">{r.students} {t("students_short")} · {r.totalLessons} {t("lessons_month_short")}</div>
            </div>
          ))}
        </div>
        <Row label={t("revenue_total")} value={`${fmt(Math.round(s.totalRevenue))} ${lang === "ru" ? "сум" : lang === "uz" ? "so'm" : "UZS"}`} />
        <Row label={t("formula_label")} value={s.label} />
        {s.advance > 0 && <Row label={t("advance_given")} value={`− ${fmt(s.advance)} ${lang === "ru" ? "сум" : lang === "uz" ? "so'm" : "UZS"}`} />}
        {s.alreadyPaid > 0 && <Row label={t("already_paid_label")} value={`− ${fmt(s.alreadyPaid)} ${lang === "ru" ? "сум" : lang === "uz" ? "so'm" : "UZS"}`} />}
        <div className="flex items-center justify-between pt-2" style={{ borderTop: `1px solid ${LINE}` }}>
          <span className="text-[13px] font-semibold">{t("remainder_to_pay")}</span>
          <span className="disp text-[20px] font-semibold">{fmt(s.net)} {lang === "ru" ? "сум" : lang === "uz" ? "so'm" : "UZS"}</span>
        </div>
      </div>
    </Modal>
  );
}

/* ----------------------------- Главный кабинет учителя ----------------------------- */
function AnnouncementModal({ myGroups, myTeacherName, onClose, onSend, t }) {
  const [text, setText] = useState("");
  const [targetGroupId, setTargetGroupId] = useState("");
  const [urgent, setUrgent] = useState(false);
  return (
    <Modal title={t("announcement_title")} onClose={onClose}>
      <p className="text-[12px] opacity-50 mb-3">{t("announcement_hint")}</p>
      <div className="mb-3">
        <label className="text-[12px] opacity-50 block mb-1.5">{t("announcement_target")}</label>
        <select value={targetGroupId} onChange={(e) => setTargetGroupId(e.target.value)} className="w-full text-[13.5px] px-3.5 py-2.5 rounded-xl outline-none" style={{ border: `1px solid ${LINE}`, background: "var(--surface-soft)" }}>
          <option value="">{t("announcement_all")}</option>
          {myGroups.map((g) => <option key={g.id} value={g.id}>{t("announcement_only_group", { name: g.name })}</option>)}
        </select>
      </div>
      <textarea
        rows={3}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={t("announcement_text_placeholder")}
        className="w-full text-[13.5px] px-3.5 py-2.5 rounded-xl outline-none"
        style={{ border: `1px solid ${LINE}`, background: "var(--surface-soft)" }}
      />
      <label className="flex items-center gap-2 mt-3 text-[12.5px] cursor-pointer">
        <input type="checkbox" checked={urgent} onChange={(e) => setUrgent(e.target.checked)} />
        {t("announcement_urgent")}
      </label>
      <button
        onClick={() => { if (text.trim()) onSend({ text: text.trim(), groupId: targetGroupId || null, urgent, senderName: myTeacherName }); }}
        disabled={!text.trim()}
        className="w-full mt-3.5 text-[13.5px] font-medium py-2.5 rounded-full text-white"
        style={{ background: TEAL, opacity: text.trim() ? 1 : 0.5 }}
      >
        {t("send")}
      </button>
    </Modal>
  );
}

function TeacherPortal({ db, onAction, notify, myTeacher, t, lang }) {
  const locale = LOCALE_OF[lang] || "ru-RU";
  const [journalGroup, setJournalGroup] = useState(null);
  const [showSalary, setShowSalary] = useState(false);
  const myGroups = db.groups;

  const markAttendanceDate = (studentId, dateStr, groupId) => {
    onAction("markAttendance", { studentId, dateStr, groupId });
  };
  const markAllAttendance = (studentIds, dateStr, present, groupId) => {
    onAction("markAllAttendance", { studentIds, dateStr, present, groupId });
    notify(`✓ ${ruDate(dateStr, locale)}`);
  };
  const setGrade = (studentId, dateStr, groupId, value) => {
    onAction("setGrade", { studentId, dateStr, groupId, value });
  };
  const saveMaterial = (material) => {
    onAction("saveMaterial", material);
    notify(t("save"));
  };
  const deleteMaterial = (id) => {
    onAction("deleteMaterial", { materialId: id });
    notify(t("delete"), "gold");
  };
  const awardCoins = (studentId, amount) => {
    const capped = Math.max(0, Math.min(25, Number(amount) || 0));
    if (capped <= 0) return;
    onAction("awardCoins", { studentId, amount: capped });
    notify(`+${capped} GlobalCoins`);
  };

  const [section, setSection] = useState("groups");
  const [showAnnouncement, setShowAnnouncement] = useState(false);
  const myGroupIds = myGroups.map((g) => g.id);
  const myStudents = db.students;
  const ranking = myStudents.map((s) => {
    const myLog = (s.attendanceLog || []).filter((r) => myGroupIds.includes(r.groupId));
    const grades = myLog.filter((r) => r.grade).map((r) => r.grade);
    const avgGrade = grades.length ? grades.reduce((a, b) => a + b, 0) / grades.length : null;
    const total = myLog.length, present = myLog.filter((r) => r.present).length;
    const pct = total ? Math.round((present / total) * 100) : null;
    const group = myGroups.find((g) => g.id === s.groupId);
    return { student: s, group, avgGrade, pct };
  }).sort((a, b) => (b.avgGrade || 0) - (a.avgGrade || 0));

  const myNotifications = db.notifications || [];

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      {myNotifications.length > 0 && (
        <div className="space-y-2">
          {myNotifications.map((n) => (
            <div key={n.id} className="rounded-2xl p-3.5 flex items-start gap-2.5" style={{ background: n.urgent ? `linear-gradient(135deg, ${TEAL}, ${TEAL_D})` : "var(--soft-yellow-bg)", color: n.urgent ? "#fff" : "var(--soft-yellow-fg)" }}>
              <span className="text-[16px] leading-none">{n.urgent ? "🔴" : "📣"}</span>
              <div className="min-w-0">
                <p className="text-[13px] font-medium leading-snug">{n.text}</p>
                <p className="text-[10.5px] opacity-75 mt-0.5">{n.senderName} · {new Date(n.date).toLocaleDateString(locale, { day: "2-digit", month: "short" })}</p>
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h2 className="disp text-[20px] font-semibold">{t("hello", { name: myTeacher.name })}</h2>
          <p className="text-[13px] opacity-55 mt-1">{myTeacher.subject} · {myGroups.length} {myGroups.length === 1 ? t("group_word_one") : t("group_word_few")}</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowAnnouncement(true)} className="text-[12.5px] font-medium px-4 py-2 rounded-full" style={{ background: "var(--soft-yellow-bg)", color: "var(--soft-yellow-fg)" }}>📣 {t("notification_btn")}</button>
          <button onClick={() => setShowSalary(true)} className="text-[12.5px] font-medium px-4 py-2 rounded-full" style={{ background: "var(--soft-purple-bg)", color: TEAL_D }}>{t("salary_btn")}</button>
        </div>
      </div>
      {showAnnouncement && (
        <AnnouncementModal
          myGroups={myGroups}
          myTeacherName={myTeacher.name}
          t={t}
          onClose={() => setShowAnnouncement(false)}
          onSend={(n) => {
            onAction("sendNotification", n);
            notify(t("send"));
            setShowAnnouncement(false);
          }}
        />
      )}

      <div className="flex gap-1.5">
        {[["groups", t("tab_groups")], ["schedule", t("tab_schedule")], ["ranking", t("tab_ranking")]].map(([key, label]) => (
          <button key={key} onClick={() => setSection(key)} className="text-[12.5px] font-medium px-3.5 py-1.5 rounded-full" style={{ background: section === key ? TEAL : "var(--surface-alt)", color: section === key ? "#fff" : "var(--ink)" }}>{label}</button>
        ))}
      </div>

      {section === "groups" && (
        myGroups.length === 0 ? (
          <EmptyState text={t("no_groups_assigned")} />
        ) : (
          <div className="space-y-3">
            {myGroups.map((g) => {
              const count = db.students.filter((s) => s.groupId === g.id).length;
              const daysLeft = g.courseEndDate ? Math.ceil((new Date(g.courseEndDate) - new Date()) / 86400000) : null;
              return (
                <Card key={g.id} className="p-5">
                  <div className="flex items-start justify-between flex-wrap gap-2">
                    <div>
                      <h3 className="disp text-[16px] font-semibold flex items-center gap-1.5"><CourseDot course={g.course} />{g.name}</h3>
                      <p className="text-[12.5px] opacity-55 mt-0.5">{g.course} · {scheduleText(g, t("no_schedule"))} · {g.room}</p>
                    </div>
                    <Pill tone="teal">{count}/{g.capacity} {t("students_suffix")}</Pill>
                  </div>
                  {daysLeft !== null && <p className="text-[11.5px] mt-2" style={{ color: daysLeft <= 14 ? BRICK : undefined, opacity: daysLeft <= 14 ? 1 : 0.5 }}>{daysLeft > 0 ? t("days_left", { n: daysLeft }) : t("course_finished")}</p>}
                  <button onClick={() => setJournalGroup(g)} className="mt-3 w-full text-[13.5px] font-medium py-2.5 px-4 rounded-full text-white" style={{ background: TEAL }}>{t("mark_attendance_btn")}</button>
                </Card>
              );
            })}
          </div>
        )
      )}

      {section === "schedule" && (
        myGroups.length === 0 ? (
          <EmptyState text={t("no_groups_schedule")} />
        ) : (
          <div className="space-y-3">
            {DAYS.map((day) => {
              const todayName = DAYS[(new Date().getDay() + 6) % 7];
              const dayGroups = myGroups.filter((g) => (g.days || []).includes(day)).sort((a, b) => a.start.localeCompare(b.start));
              const isToday = day === todayName;
              return (
                <Card key={day} className="p-4" style={isToday ? { border: `1.5px solid ${TEAL}` } : {}}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="disp text-[14px] font-semibold">{dayLabel(day, lang)}</span>
                    {isToday && <Pill tone="teal">{t("today_pill")}</Pill>}
                  </div>
                  {dayGroups.length === 0 ? (
                    <p className="text-[12px] opacity-40">{t("no_lessons")}</p>
                  ) : (
                    <div className="space-y-1.5">
                      {dayGroups.map((g) => (
                        <div key={g.id} className="flex items-center justify-between text-[12.5px] px-2.5 py-2 rounded-lg" style={{ background: "var(--surface-soft)" }}>
                          <span className="flex items-center gap-1.5"><CourseDot course={g.course} />{g.name}</span>
                          <span className="opacity-55">{g.start}–{g.end} · {g.room}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )
      )}

      {section === "ranking" && (
        ranking.length === 0 ? (
          <EmptyState text={t("no_students_ranking")} />
        ) : (
          <Card className="p-4">
            <div className="space-y-1.5">
              {ranking.map((r, i) => (
                <div key={r.student.id} className="flex items-center gap-3 px-2.5 py-2 rounded-lg" style={{ background: i < 3 ? "var(--soft-yellow-bg)" : "var(--surface-soft)" }}>
                  <span className="text-[13px] font-semibold w-5 text-center opacity-60">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-medium truncate">{r.student.name}</div>
                    <div className="text-[11px] opacity-50">{r.group?.name || "—"}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-[13px] font-semibold" style={{ color: r.avgGrade === null ? "#B0AFA4" : r.avgGrade >= 4.5 ? GREEN_D : r.avgGrade >= 3.5 ? "#CA8A04" : BRICK }}>{r.avgGrade === null ? "—" : r.avgGrade.toFixed(1)}</div>
                    <div className="text-[10.5px] opacity-45">{r.pct === null ? "" : t("attendance_pct", { pct: r.pct })}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )
      )}

      {journalGroup && (
        <GroupJournalModal
          group={journalGroup}
          db={db}
          t={t}
          lang={lang}
          onClose={() => setJournalGroup(null)}
          onMark={markAttendanceDate}
          onMarkAll={markAllAttendance}
          onAward={awardCoins}
          onGrade={setGrade}
          onSaveMaterial={saveMaterial}
          onDeleteMaterial={deleteMaterial}
        />
      )}
      {showSalary && <SalaryModal db={db} teacher={myTeacher} onClose={() => setShowSalary(false)} t={t} lang={lang} />}
    </div>
  );
}

/* -------------------------------- Экран входа -------------------------------- */
function formatUzPhone(digits) {
  let out = "";
  if (digits.length > 0) out += digits.slice(0, 2);
  if (digits.length > 2) out += " " + digits.slice(2, 5);
  if (digits.length > 5) out += " " + digits.slice(5, 7);
  if (digits.length > 7) out += " " + digits.slice(7, 9);
  return out;
}
function LoginScreen({ phone, setPhone, password, setPassword, onLogin, loading, error, t, lang, changeLang, theme, changeTheme }) {
  const phoneDigits = phone.replace(/[^0-9]/g, "").replace(/^998/, "").slice(0, 9);
  return (
    <div className={`theme-${theme} app-bg min-h-screen w-full flex items-center justify-center p-4`} style={{ fontFamily: "'Inter', sans-serif", background: PAPER }}>
      <style>{FONT_IMPORT}</style>
      <style>{THEME_VARS}</style>
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-2.5 mb-5">
          <div className="flex items-center gap-0.5 p-1 rounded-full" style={{ background: "var(--surface-alt)" }}>
            {["ru", "en", "uz"].map((l) => (
              <button key={l} onClick={() => changeLang(l)} className="w-9 h-9 rounded-full flex items-center justify-center text-[16px] transition-all duration-150" style={{ background: lang === l ? "var(--surface)" : "transparent", boxShadow: lang === l ? "0 2px 6px rgba(0,0,0,0.14)" : "none", transform: lang === l ? "scale(1.08)" : "scale(1)" }}>
                {LANG_FLAGS[l]}
              </button>
            ))}
          </div>
          <button onClick={() => changeTheme(theme === "light" ? "dark" : "light")} className="w-9 h-9 rounded-full flex items-center justify-center text-[15px]" style={{ background: "var(--surface-alt)" }}>
            {theme === "light" ? "🌙" : "☀️"}
          </button>
        </div>
        <div className="card-surface rounded-2xl w-full p-7" style={{ border: `1px solid ${LINE}`, background: "var(--surface)", color: INK }}>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: "var(--soft-yellow-bg)", boxShadow: "0 0 0 3px rgba(19,36,54,0.05)" }}>
              <span className="disp text-[14px] font-semibold" style={{ color: TEAL_D }}>GU</span>
            </div>
            <div>
              <div className="disp text-[18px] font-semibold leading-none">{t("login_title")}</div>
              <div className="text-[11px] opacity-45 mt-1">{t("login_subtitle")}</div>
            </div>
          </div>
          <form onSubmit={(e) => { e.preventDefault(); onLogin(); }} className="space-y-3.5">
            <Field label={t("phone_label")}>
              <div className="flex items-center gap-1.5">
                <span className="shrink-0 px-3 py-2.5 rounded-lg text-[13px] font-medium" style={{ background: "var(--surface-alt)", border: `1px solid ${LINE}` }}>+998</span>
                <input
                  inputMode="numeric"
                  className={inputCls}
                  style={inputStyle}
                  value={formatUzPhone(phoneDigits)}
                  onChange={(e) => setPhone("+998 " + formatUzPhone(e.target.value.replace(/[^0-9]/g, "").slice(0, 9)))}
                  placeholder="90 123 45 67"
                  autoFocus
                />
              </div>
            </Field>
            <Field label={t("password_label")}>
              <input type="password" className={inputCls} style={inputStyle} value={password} onChange={(e) => setPassword(e.target.value)} />
            </Field>
            {error && <p className="text-[12.5px] break-words" style={{ color: BRICK }}>{error}</p>}
            <PrimaryBtn type="submit" full onClick={onLogin}>
              {loading ? <Loader2 size={15} className="animate-spin" /> : t("login_btn")}
            </PrimaryBtn>
          </form>
          <p className="text-[11px] opacity-40 mt-4 text-center px-4">{t("login_remember_note")}</p>
        </div>
      </div>
    </div>
  );
}

/* ----------------------------------- App ----------------------------------- */
const EDGE_FUNCTION_URL = "https://inswhfcwbybykwdthekg.supabase.co/functions/v1/teacher-portal";
const ANON_KEY = "sb_publishable_Lm1ZUwWhD_bq1IwpAFH8ZQ_OU2ph4W4";

async function callTeacherPortal(phone, password, action, payload) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);
  let curLang = "ru";
  try { curLang = localStorage.getItem("gu_teacher_lang") || "ru"; } catch {}
  try {
    const res = await fetch(EDGE_FUNCTION_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", apikey: ANON_KEY, Authorization: `Bearer ${ANON_KEY}` },
      body: JSON.stringify({ phone, password, action, payload }),
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

export default function TeacherApp() {
  const [phase, setPhase] = useState("loading"); // loading | not_linked | ready | error
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [data, setData] = useState(null);
  const [toast, setToast] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [lang, setLang] = useState(() => { try { return localStorage.getItem("gu_teacher_lang") || "ru"; } catch { return "ru"; } });
  const [theme, setTheme] = useState(() => { try { return localStorage.getItem("gu_teacher_theme") || "light"; } catch { return "light"; } });
  const changeLang = (l) => { setLang(l); try { localStorage.setItem("gu_teacher_lang", l); } catch {} };
  const changeTheme = (th) => { setTheme(th); try { localStorage.setItem("gu_teacher_theme", th); } catch {} };
  const t = useCallback((key, vars) => translate(lang, key, vars), [lang]);

  const notify = useCallback((text, tone = "teal") => setToast({ text, tone, key: uid() }), []);
  useEffect(() => { if (!toast) return; const t = setTimeout(() => setToast(null), 3200); return () => clearTimeout(t); }, [toast]);

  // Первая загрузка — пробуем сохранённые на этом устройстве телефон/пароль
  useEffect(() => {
    (async () => {
      let savedPhone = "", savedPassword = "";
      try { savedPhone = localStorage.getItem("gu_teacher_phone") || ""; savedPassword = localStorage.getItem("gu_teacher_password") || ""; } catch {}
      if (savedPhone && savedPassword) {
        const res = await callTeacherPortal(savedPhone, savedPassword);
        if (res.error) { setErrorMsg(res.error); setPhase("error"); return; }
        if (res.linked) { setPhone(savedPhone); setPassword(savedPassword); setData(res); setPhase("ready"); return; }
      }
      setPhase("not_linked");
    })();
  }, []);

  const handleLogin = async () => {
    if (!phone.trim() || !password.trim()) return;
    setLoginError(""); setLoginLoading(true);
    const res = await callTeacherPortal(phone.trim(), password.trim());
    setLoginLoading(false);
    if (res.error) { setLoginError(res.error); return; }
    if (!res.linked) { setLoginError(res.loginError || t("login_failed_generic")); return; }
    setPhone(phone.trim()); setPassword(password.trim());
    try { localStorage.setItem("gu_teacher_phone", phone.trim()); localStorage.setItem("gu_teacher_password", password.trim()); } catch {}
    setData(res);
    setPhase("ready");
  };

  const handleLogout = () => {
    try { localStorage.removeItem("gu_teacher_phone"); localStorage.removeItem("gu_teacher_password"); } catch {}
    setPhone(""); setPassword(""); setData(null); setLoginError("");
    setPhase("not_linked");
  };

  // Любое действие (отметить посещение, поставить оценку и т.д.) идёт сюда — сервер сам проверяет
  // телефон+пароль заново и возвращает обновлённые данные.
  const doAction = async (action, payload) => {
    const res = await callTeacherPortal(phone, password, action, payload);
    if (res.error) { notify(res.error, "brick"); return; }
    if (!res.linked) { notify(res.loginError || t("session_error"), "brick"); return; }
    setData(res);
  };

  const silentRefresh = async () => {
    if (phase !== "ready") return;
    setRefreshing(true);
    try {
      const res = await callTeacherPortal(phone, password);
      if (res.linked) setData(res);
    } finally {
      setRefreshing(false);
    }
  };

  // Автообновление — раз в 25 секунд и при возврате в приложение
  useEffect(() => {
    const onVisible = () => { if (document.visibilityState === "visible") silentRefresh(); };
    document.addEventListener("visibilitychange", onVisible);
    const interval = setInterval(() => silentRefresh(), 25000);
    return () => { document.removeEventListener("visibilitychange", onVisible); clearInterval(interval); };
  }, [phase, phone, password]);

  if (phase === "loading") {
    return (
      <div className={`theme-${theme} min-h-screen flex items-center justify-center`} style={{ background: PAPER, fontFamily: "'Inter', sans-serif" }}>
        <style>{FONT_IMPORT}</style>
        <style>{THEME_VARS}</style>
        <div className="flex items-center gap-2 text-[13px] opacity-60" style={{ color: INK }}><Loader2 size={16} className="animate-spin" /> {t("loading")}</div>
      </div>
    );
  }

  if (phase === "error") {
    return (
      <div className={`theme-${theme} min-h-screen flex items-center justify-center p-4`} style={{ background: PAPER, fontFamily: "'Inter', sans-serif" }}>
        <style>{FONT_IMPORT}</style>
        <style>{THEME_VARS}</style>
        <div className="max-w-sm rounded-2xl p-6 text-center" style={{ border: `1px solid ${LINE}`, background: "var(--surface)", color: INK }}>
          <AlertTriangle size={22} style={{ color: BRICK }} className="mx-auto mb-3" />
          <p className="text-[14px] font-medium mb-1.5">{t("load_error_title")}</p>
          <p className="text-[12.5px] opacity-60 mb-4 break-words">{errorMsg}</p>
          <PrimaryBtn full onClick={() => window.location.reload()}>{t("reload_btn")}</PrimaryBtn>
        </div>
      </div>
    );
  }

  if (phase === "not_linked" || !data) {
    return <LoginScreen phone={phone} setPhone={setPhone} password={password} setPassword={setPassword} onLogin={handleLogin} loading={loginLoading} error={loginError} t={t} lang={lang} changeLang={changeLang} theme={theme} changeTheme={changeTheme} />;
  }

  const myTeacher = data.teacher;

  return (
    <div className={`theme-${theme} app-bg min-h-screen w-full`} style={{ fontFamily: "'Inter', sans-serif", background: PAPER, color: INK }}>
      <style>{FONT_IMPORT}</style>
      <style>{THEME_VARS}</style>
      <header style={{ boxShadow: `0 1px 0 ${LINE}` }} className="flex items-center justify-between gap-3 px-4 py-4 md:px-8 backdrop-blur sticky top-0 z-20" >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ background: "var(--soft-yellow-bg)" }}><span className="disp text-[12px] font-semibold" style={{ color: TEAL_D }}>GU</span></div>
          <span className="disp text-[15px] font-semibold">Global Up · {t("login_subtitle")}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <button onClick={() => setLangMenuOpen((v) => !v)} className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-[15px]" style={{ background: "var(--surface)", border: `1px solid ${LINE}` }}>
              {LANG_FLAGS[lang]}
            </button>
            {langMenuOpen && (
              <>
                <button aria-label="close" className="fixed inset-0 z-30 cursor-default" onClick={() => setLangMenuOpen(false)} />
                <div className="absolute right-0 mt-2 p-2 rounded-2xl z-40" style={{ background: "var(--surface)", boxShadow: "0 8px 24px rgba(0,0,0,0.18)", border: `1px solid ${LINE}` }}>
                  <div className="flex items-center gap-1 mb-1.5">
                    {["ru", "en", "uz"].map((l) => (
                      <button key={l} onClick={() => changeLang(l)} className="w-9 h-9 rounded-full flex items-center justify-center text-[15px] transition-all duration-150" style={{ background: lang === l ? "var(--surface-alt)" : "transparent", transform: lang === l ? "scale(1.08)" : "scale(1)" }}>
                        {LANG_FLAGS[l]}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-1 pt-1.5" style={{ borderTop: `1px solid ${LINE}` }}>
                    <button onClick={() => changeTheme("light")} className="flex-1 text-[11px] font-medium py-1.5 rounded-full" style={{ background: theme === "light" ? "var(--surface-alt)" : "transparent" }}>☀️</button>
                    <button onClick={() => changeTheme("dark")} className="flex-1 text-[11px] font-medium py-1.5 rounded-full" style={{ background: theme === "dark" ? "var(--surface-alt)" : "transparent" }}>🌙</button>
                  </div>
                </div>
              </>
            )}
          </div>
          <button onClick={silentRefresh} disabled={refreshing} className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ background: "var(--surface)", border: `1px solid ${LINE}` }} title={t("refresh")}>
            <RefreshCw size={15} style={{ animation: refreshing ? "spin 0.7s linear infinite" : "none" }} />
          </button>
          <div className="relative">
            <button onClick={() => setMenuOpen((o) => !o)} className="flex items-center gap-2 pl-3 pr-2.5 py-2 rounded-full text-[13px]" style={{ border: `1px solid ${LINE}`, background: "var(--surface)" }}>
              <UserCircle2 size={16} style={{ color: TEAL }} /><span className="font-medium">{myTeacher?.name || t("settings")}</span><ChevronDown size={14} className="opacity-50" />
            </button>
            {menuOpen && (
              <>
                <button aria-label="close menu" className="fixed inset-0 z-10 cursor-default" onClick={() => setMenuOpen(false)} />
                <div className="anim-pop absolute right-0 mt-2 w-44 rounded-xl shadow-lg py-1.5 z-20" style={{ border: `1px solid ${LINE}`, background: "var(--surface)" }}>
                  <button onClick={handleLogout} className="w-full text-left px-3.5 py-2.5 text-[13px] hover:opacity-70 transition-colors flex items-center gap-2" style={{ color: BRICK }}>
                    <LogOut size={14} /> {t("logout")}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      {toast && (
        <div className="anim-slide fixed top-4 left-4 right-4 sm:left-auto sm:right-6 z-50 px-4 py-2.5 rounded-xl text-[13px] font-medium shadow-lg flex items-center gap-2"
          style={{ background: toast.tone === "brick" ? BRICK : toast.tone === "gold" ? GOLD : GREEN, color: "#fff" }}>
          <CheckCircle2 size={14} className="shrink-0" /> {toast.text}
        </div>
      )}
      <main className="px-4 py-6 md:px-8">
        {myTeacher ? (
          <TeacherPortal db={data} onAction={doAction} notify={notify} myTeacher={myTeacher} t={t} lang={lang} />
        ) : (
          <div className="max-w-md mx-auto">
            <EmptyState text={t("no_student_found")} />
          </div>
        )}
      </main>
    </div>
  );
}
