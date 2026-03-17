"use client";
import { useState } from "react";
import Image from "next/image.js";
import { members, ALL_TEAMS, SECTIONS } from "@/lib/data.js";
import { css, S } from "@/lib/css.js";

// ─── SCORING ─────────────────────────────────────────────────────────────────
function scoreMember(member, answers) {
  let total = 0, maxPossible = 0;

  SECTIONS.forEach((sec) => {
    sec.questions.forEach((q) => {
      const ans = answers[q.key];
      if (ans === undefined || ans === null) return;

      if (q.type === "likert") {
        const w = ans;
        if (w > 0) {
          total += (member[q.key] ?? 0) * w;
          maxPossible += 10 * w;
        }
      } else if (q.type === "bipolar") {
        if (ans < 0) {
          total += (member[q.leftKey] ?? 0) * Math.abs(ans);
          maxPossible += 10 * Math.abs(ans);
        } else if (ans > 0) {
          total += (member[q.rightKey] ?? 0) * ans;
          maxPossible += 10 * ans;
        }
      } else if (q.type === "multichoice") {
        const opt = q.options[ans];
  if (opt?.filter && !opt.filter(member)) {
    total -= maxPossible * 0.5; // 50% of ceiling — always forces to bottom half
  }
  if (opt?.scoreMap) {
    Object.entries(opt.scoreMap).forEach(([k, w]) => {
      total += (member[k] ?? 0) * w;
      maxPossible += 10 * w;
    });
        }
      } else if (q.type === "multiselect-scoremap") {
        if (!Array.isArray(ans) || ans.length === 0) return;
        const selectedOpts = ans.map((i) => q.options[i]).filter(Boolean);
        const optWeightSums = q.options.map((o) =>
          Object.values(o.scoreMap ?? {}).reduce((s, w) => s + w, 0)
        );
        const maxOptWeight = Math.max(...optWeightSums);
        selectedOpts.forEach((opt) => {
          if (opt.scoreMap) {
            Object.entries(opt.scoreMap).forEach(([k, w]) => {
              total += (member[k] ?? 0) * w;
            });
          }
        });
        maxPossible += maxOptWeight * 10 * selectedOpts.length;
      } else if (q.type === "multiselect") {
        if (!Array.isArray(ans) || ans.length === 0) return;
        if (q.key === "contentPref") {
          const CONTENT_BASE            = 6;
          const CONTENT_DIVERSITY_BONUS = 3;
          const CONTENT_ZERO_PENALTY    = 10;
          const selected = ans.map((i) => q.options[i]?.value).filter(Boolean);
          const overlap  = selected.filter((v) => member.contentType?.includes(v)).length;
          if (overlap === 0) {
            total -= CONTENT_ZERO_PENALTY;
          } else {
            total += overlap * CONTENT_BASE;
            total += Math.max(0, overlap - 1) * CONTENT_DIVERSITY_BONUS;
          }
          maxPossible += selected.length * CONTENT_BASE
            + Math.max(0, selected.length - 1) * CONTENT_DIVERSITY_BONUS;
        } else if (q.key === "engagementPref") {
          const ENG_BASE         = 6;
          const ENG_FULL_BONUS   = 8;
          const ENG_ZERO_PENALTY = 8;
          const selected = ans.map((i) => q.options[i]?.value).filter(Boolean);
          const overlap  = selected.filter((v) => member.engagement?.includes(v)).length;
          if (overlap === 0) {
            total -= ENG_ZERO_PENALTY;
          } else {
            total += overlap * ENG_BASE;
            if (overlap === selected.length) total += ENG_FULL_BONUS;
          }
          maxPossible += selected.length * ENG_BASE + ENG_FULL_BONUS;
        } else {
          ans.forEach((i) => {
            const opt = q.options[i];
            if (opt?.scoreKey) {
              total += (member[opt.scoreKey] ?? 0) * opt.bonus;
              maxPossible += 10 * opt.bonus;
            }
          });
        }
      } else if (q.type === "yesno") {
        if (q.invert) {
          if (ans === false) {
            total += (10 - (member[q.yesKey] ?? 0)) * 2;
            maxPossible += 10 * 2;
          }
        } else {
          const k = ans ? q.yesKey : q.noKey;
          total += (member[k] ?? 0) * 2;
          maxPossible += 10 * 2;
        }
      }
    });
  });

  const raw = maxPossible > 0 ? (total / maxPossible) * 100 : 0;
  return Math.max(0, Math.min(100, Math.round(raw)));
}

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const TEAM_COLORS = {
  "Team Love":    S.pink,
  "Team Dream":   "#7490e8",
  "Team Passion": "#f9a825",
};

const GENDERS = [
  { value: "male",   label: "Laki-laki" },
  { value: "female", label: "Perempuan" },
  { value: "other",  label: "Lainnya" },
];

// Greeting copy varies slightly by gender
function buildGreeting(name, gender, memberName) {
  const display = name?.trim() || null;
  if (!display) return `Oshi-mu adalah ${memberName}!`;
  if (gender === "female") return `${display}, oshi kamu adalah ${memberName}!`;
  return `${display}, oshi kamu adalah ${memberName}!`;
}

// ─── QUESTION COMPONENTS ──────────────────────────────────────────────────────
const LIKERT_OPTS = [
  { v: 0, label: "Tidak penting" },
  { v: 1, label: "Kurang penting" },
  { v: 2, label: "Lumayan" },
  { v: 3, label: "Penting" },
  { v: 4, label: "Sangat penting" },
];

function LikertQ({ answer, onChange }) {
  return (
    <div className="jkt-likert">
      {LIKERT_OPTS.map((o) => (
        <button key={o.v} className={`jkt-likert-btn${answer === o.v ? " sel" : ""}`}
          onClick={() => onChange(o.v)}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

function BipolarQ({ q, answer, onChange }) {
  const dots = [
    { val: -2, size: 36, side: "left" },
    { val: -1, size: 28, side: "left" },
    { val:  0, size: 22, side: "mid"  },
    { val:  1, size: 28, side: "right" },
    { val:  2, size: 36, side: "right" },
  ];
  function selClass(d) {
    if (answer !== d.val) return "";
    return d.side === "left" ? " left-sel" : d.side === "right" ? " right-sel" : " mid-sel";
  }
  const hint = answer === null || answer === undefined ? "Pilih preferensimu"
    : answer === 0 ? "Tidak ada preferensi"
    : answer < 0 ? `${q.leftLabel} (${Math.abs(answer) === 2 ? "sangat" : "agak"})`
    : `${q.rightLabel} (${answer === 2 ? "sangat" : "agak"})`;
  return (
    <div className="jkt-bipolar">
      <div className="jkt-bipolar-labels"><span>{q.leftLabel}</span><span>{q.rightLabel}</span></div>
      <div className="jkt-bipolar-track">
        {dots.map((d) => (
          <button key={d.val} className={`jkt-bipolar-dot${selClass(d)}`}
            style={{ width: d.size, height: d.size }} onClick={() => onChange(d.val)} />
        ))}
      </div>
      <div style={{ textAlign: "center", fontSize: 11, color: S.muted, marginTop: 4 }}>{hint}</div>
    </div>
  );
}

function MultiChoiceQ({ q, answer, onChange }) {
  return (
    <div className="jkt-choice-grid">
      {q.options.map((o, i) => (
        <button key={i} className={`jkt-choice-btn${answer === i ? " sel" : ""}`}
          onClick={() => onChange(i)}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

function MultiSelectScoreMapQ({ q, answer = [], onChange }) {
  const max = q.max ?? 2;
  function toggle(i) {
    if (answer.includes(i)) onChange(answer.filter((x) => x !== i));
    else if (answer.length < max) onChange([...answer, i]);
  }
  const atLimit = answer.length >= max;
  return (
    <div>
      <div className="jkt-choice-grid">
        {q.options.map((o, i) => {
          const selected = answer.includes(i);
          const disabled = !selected && atLimit;
          return (
            <button key={i}
              className={`jkt-choice-btn${selected ? " sel" : ""}${disabled ? " disabled" : ""}`}
              onClick={() => !disabled && toggle(i)}>
              {o.label}
            </button>
          );
        })}
      </div>
      <div className="jkt-max-hint">
        Pilih maks. <span>{max}</span> opsi ({answer.length}/{max})
      </div>
    </div>
  );
}

function MultiSelectQ({ q, answer = [], onChange }) {
  function toggle(i) {
    if (answer.includes(i)) onChange(answer.filter((x) => x !== i));
    else if (!q.max || answer.length < q.max) onChange([...answer, i]);
  }
  const atLimit = q.max && answer.length >= q.max;
  return (
    <div>
      <div className="jkt-multisel-grid">
        {q.options.map((o, i) => {
          const selected = answer.includes(i);
          const disabled = !selected && atLimit;
          return (
            <button key={i}
              className={`jkt-tag${selected ? " sel" : ""}${disabled ? " disabled" : ""}`}
              onClick={() => !disabled && toggle(i)}>
              {o.label}
            </button>
          );
        })}
      </div>
      {q.max && (
        <div className="jkt-max-hint">
          Pilih maks. <span>{q.max}</span> opsi ({answer.length}/{q.max})
        </div>
      )}
    </div>
  );
}

function YesNoQ({ answer, onChange }) {
  return (
    <div className="jkt-yesno">
      <button className={`jkt-yesno-btn yes${answer === true  ? " sel" : ""}`} onClick={() => onChange(true)}>Ya</button>
      <button className={`jkt-yesno-btn no${answer  === false ? " sel" : ""}`} onClick={() => onChange(false)}>Tidak</button>
    </div>
  );
}

function QuestionCard({ q, answer, onChange }) {
  const isAnswered = answer !== undefined && answer !== null
    && !(Array.isArray(answer) && answer.length === 0);
  return (
    <div className={`jkt-card${isAnswered ? " answered" : ""}`}>
      <div className="jkt-q-label">{q.label}</div>
      {q.type === "likert"               && <LikertQ               answer={answer}             onChange={onChange} />}
      {q.type === "bipolar"              && <BipolarQ              q={q} answer={answer}        onChange={onChange} />}
      {q.type === "multichoice"          && <MultiChoiceQ          q={q} answer={answer}        onChange={onChange} />}
      {q.type === "multiselect-scoremap" && <MultiSelectScoreMapQ  q={q} answer={answer ?? []}  onChange={onChange} />}
      {q.type === "multiselect"          && <MultiSelectQ          q={q} answer={answer ?? []}  onChange={onChange} />}
      {q.type === "yesno"                && <YesNoQ                     answer={answer}         onChange={onChange} />}
    </div>
  );
}

// ─── TEAM SELECTOR ────────────────────────────────────────────────────────────
function TeamSelector({ selectedTeams, onChange }) {
  const allSelected = selectedTeams.length === ALL_TEAMS.length;
  function toggleAll() { onChange(allSelected ? [ALL_TEAMS[0]] : [...ALL_TEAMS]); }
  function toggleTeam(t) {
    if (selectedTeams.includes(t)) {
      if (selectedTeams.length > 1) onChange(selectedTeams.filter((x) => x !== t));
    } else {
      onChange([...selectedTeams, t]);
    }
  }
  return (
    <div className="jkt-team-grid">
      {ALL_TEAMS.map((t) => {
        const isActive = selectedTeams.includes(t) && !allSelected;
        const color = TEAM_COLORS[t] || S.pink;
        const count = members.filter((m) => m.team === t).length;
        return (
          <div key={t} className={`jkt-team-card${isActive ? " sel" : ""}`}
            style={{ borderColor: isActive ? color : "" }}
            onClick={() => { if (allSelected) onChange([t]); else toggleTeam(t); }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: color, flexShrink: 0 }} />
              <div>
                <div style={{ fontWeight: 500, fontSize: 15 }}>{t}</div>
                <div style={{ fontSize: 12, color: S.muted, marginTop: 2 }}>{count} member</div>
              </div>
            </div>
            <div className={`jkt-check${isActive ? " on" : ""}`}
              style={{ background: isActive ? color : "", borderColor: isActive ? color : "" }}>✓</div>
          </div>
        );
      })}
      <div className={`jkt-team-card${allSelected ? " sel" : ""}`}
        style={{ borderColor: allSelected ? S.gold : "" }} onClick={toggleAll}>
        <div>
          <div style={{ fontWeight: 500, fontSize: 15 }}>Semua Member</div>
          <div style={{ fontSize: 12, color: S.muted, marginTop: 2 }}>{members.length} member dari semua tim</div>
        </div>
        <div className={`jkt-check${allSelected ? " on" : ""}`}
          style={{ background: allSelected ? S.gold : "", borderColor: allSelected ? S.gold : "" }}>✓</div>
      </div>
    </div>
  );
}

// ─── FOOTER ───────────────────────────────────────────────────────────────────
// Replace the href values below with the actual creator accounts
const CREATOR_LINKS = [
  {
    label: "@raihanlail07",
    href: "https://www.instagram.com/raihanlail07/",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
        <circle cx="12" cy="12" r="4"/>
        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
      </svg>
    ),
  },
 
];

function Footer() {
  return (
    <footer className="jkt-footer">
      <div className="jkt-footer-label">Made with ❤️ by </div> 
      <div className="jkt-footer-links">
        {CREATOR_LINKS.map((l) => (
          <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer"
            className="jkt-footer-link">
            {l.icon}
            {l.label}
          </a>
        ))}
      </div>
      <div className="jkt-footer-copy">JKT48 Oshi Selector · Fanmade, just for fun.</div>
    </footer>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function Home() {
  // step: "teams" | "quiz" | "userinfo" | "results"
  const [step, setStep]                   = useState("teams");
  const [selectedTeams, setSelectedTeams] = useState([...ALL_TEAMS]);
  const [sectionIdx, setSectionIdx]       = useState(0);
  const [answers, setAnswers]             = useState({});
  const [results, setResults]             = useState([]);

  // User info form state
  const [userName,   setUserName]   = useState("");
  const [userGender, setUserGender] = useState(null); // null = not chosen

  const pool          = members.filter((m) => selectedTeams.includes(m.team));
  const curSection    = SECTIONS[sectionIdx];
  const totalSections = SECTIONS.length;
  const totalQ        = SECTIONS.reduce((s, sec) => s + sec.questions.length, 0);
  const answeredCount = Object.keys(answers).length;

  function setAnswer(key, val) {
    setAnswers((prev) => ({ ...prev, [key]: val }));
  }

  // Called after user info form — compute and go to results
  function compute() {
    const scored = pool
      .map((m) => ({ ...m, score: scoreMember(m, answers) }))
      .sort((a, b) => b.score - a.score);
    setResults(scored);
    setStep("results");
  }

  function resetAll() {
    setAnswers({});
    setSectionIdx(0);
    setUserName("");
    setUserGender(null);
    setStep("teams");
    setResults([]);
  }

  return (
    <>
      <style>{css}</style>
      <div className="jkt-root">

        {/* ── HEADER ── */}
        <div className="jkt-header">
          <div className="jkt-title">JKT48<br />Oshi Selector (BETA)</div>
          <div className="jkt-subtitle">Temukan oshi-mu!</div>
          <div className="jkt-subtitle-2">Karena ini masih beta jadi mohon maap klo rada ngawur dikit.</div>
        </div>

        <div className="jkt-container">

          {/* ── STEP: TEAM SELECTION ── */}
          {step === "teams" && (
            <>
              <div className="jkt-section-label">
                Langkah 1 <span style={{ color: S.muted }}>— Pilih Tim</span>
              </div>
              <p style={{ fontSize: 13, color: S.muted, marginBottom: 20, lineHeight: 1.7 }}>
                Pilih tim mana yang ingin kamu masukkan ke dalam pencarian.
              </p>
              <TeamSelector selectedTeams={selectedTeams} onChange={setSelectedTeams} />
              <div style={{ marginTop: 28, textAlign: "center" }}>
                <button className="jkt-btn-primary" onClick={() => setStep("quiz")}>
                  Mulai Kuis →
                </button>
                <div style={{ fontSize: 12, color: S.muted, marginTop: 10 }}>
                  {pool.length} member terpilih
                </div>
              </div>
            </>
          )}

          {/* ── STEP: QUIZ ── */}
          {step === "quiz" && (
            <>
              <div className="jkt-progress-bar">
                <div className="jkt-progress-fill"
                  style={{ width: `${((sectionIdx + 1) / totalSections) * 100}%` }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <div className="jkt-section-label" style={{ margin: 0 }}>
                  <span style={{ fontSize: 18 }}>{curSection.emoji}</span> {curSection.title}
                </div>
                <div style={{ fontSize: 12, color: S.muted }}>{sectionIdx + 1} / {totalSections}</div>
              </div>

              {curSection.questions.map((q) => (
                <QuestionCard key={q.key} q={q} answer={answers[q.key]}
                  onChange={(v) => setAnswer(q.key, v)} />
              ))}

              <div className="jkt-nav">
                <button className="jkt-btn-ghost"
                  onClick={() => sectionIdx > 0 ? setSectionIdx((i) => i - 1) : setStep("teams")}>
                  ← Kembali
                </button>
                <div style={{ fontSize: 11, color: S.muted }}>{answeredCount} / {totalQ} dijawab</div>
                {sectionIdx < totalSections - 1
                  ? <button className="jkt-btn-primary" onClick={() => setSectionIdx((i) => i + 1)}>Lanjut →</button>
                  : <button className="jkt-btn-primary" onClick={() => setStep("userinfo")}>Hampir selesai →</button>
                }
              </div>
              <p style={{ textAlign: "center", fontSize: 11, color: S.muted, marginTop: 16, lineHeight: 1.6 }}>
                Pertanyaan yang dilewati tidak akan mempengaruhi skor
              </p>
            </>
          )}

          {/* ── STEP: USER INFO FORM ── */}
          {step === "userinfo" && (
            <>
              <div className="jkt-section-label">
                Terakhir ✦ <span style={{ color: S.muted }}>— Tentang Kamu</span>
              </div>
              <p style={{ fontSize: 13, color: S.muted, marginBottom: 20, lineHeight: 1.7 }}>
                Opsional — hasil tetap muncul kalau kamu skip bagian ini.
              </p>

              <div className="jkt-form-card">
                {/* Name */}
                <div className="jkt-form-row">
                  <label className="jkt-form-label">
                    Nama <span>(opsional)</span>
                  </label>
                  <input
                    className="jkt-form-input"
                    type="text"
                    placeholder="Nama atau nickname kamu..."
                    maxLength={40}
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                  />
                </div>

                {/* Gender */}
                <div className="jkt-form-row">
                  <label className="jkt-form-label">
                    Gender <span>(opsional)</span>
                  </label>
                  <div className="jkt-gender-grid">
                    {GENDERS.map((g) => (
                      <button key={g.value}
                        className={`jkt-gender-btn${userGender === g.value ? " sel" : ""}`}
                        onClick={() => setUserGender(prev => prev === g.value ? null : g.value)}>
                        {g.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="jkt-nav">
                <button className="jkt-btn-ghost" onClick={() => setStep("quiz")}>
                  ← Kembali
                </button>
                <button className="jkt-btn-primary" onClick={compute}>
                  Lihat Hasil ✦
                </button>
              </div>
            </>
          )}

          {/* ── STEP: RESULTS ── */}
          {step === "results" && results.length > 0 && (
            <>
              <div className="jkt-section-label">Hasil ✦</div>

              {/* Hero card */}
              <div className="result-hero">
                {/* Personalised greeting */}
                {(userName?.trim() || userGender) && (
                  <div className="result-greeting">
                    <strong>{userName?.trim() || (userGender === "female" ? "Kamu" : "Kamu")}</strong>
                    {userGender && !userName?.trim() && null}
                    {", oshi kamu adalah:"}
                  </div>
                )}
                <div style={{ fontSize: 11, letterSpacing: 3, color: S.muted, marginBottom: 12, textTransform: "uppercase" }}>
                  {userName?.trim() ? "" : "Oshi-mu Adalah"}
                </div>

                <Image height={100} width={100} className="result-avatar"
                  src={results[0].photo} alt={results[0].name}
                  onError={(e) => { e.target.style.display = "none"; }} />
                <div className="result-name">{results[0].name}</div>
                <div style={{ fontSize: 12, color: S.muted, margin: "4px 0 10px" }}>
                  {results[0].team} · Gen {results[0].generation}
                </div>
                <div className="result-score">{results[0].score}%</div>
                <div style={{ fontSize: 11, color: S.muted, marginBottom: 4 }}>skor kecocokan</div>
                 <div style={{ fontSize: 9, color: S.muted, marginBottom: 4 }}>Disclaimer: kembali lagi ke kepercayaan masing-masing 🙏</div>

               
              </div>

              {/* Full ranking */}
              <div style={{ fontSize: 11, letterSpacing: 4, color: S.muted, textTransform: "uppercase", marginBottom: 14 }}>
                Rekomendasi Oshi Untukmu:
              </div>
              {results.map((m, i) => {
                const rankColor = i === 0 ? S.pink : i === 1 ? S.coral : i === 2 ? S.gold : S.muted;
                const barColor  = i === 0 ? `linear-gradient(90deg,${S.pink},${S.coral})`
                  : i < 3 ? `linear-gradient(90deg,${S.coral},${S.gold})` : `#3a3a50`;
                return (
                  <div key={m.id} className="result-list-item">
                    <div className="result-rank"
                      style={{ background: `${rankColor}22`, color: rankColor, border: `1px solid ${rankColor}44` }}>
                      {i + 1}
                    </div>
                    <Image className="result-avatar-sm" width={40} height={40}
                      src={m.photo} alt={m.name}
                      onError={(e) => { e.target.style.background = "#2a2a35"; }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {m.name}
                      </div>
                      <div style={{ fontSize: 11, color: S.muted }}>{m.team} · Gen {m.generation}</div>
                      <div className="score-bar-bg">
                        <div className="score-bar-fill" style={{ width: `${m.score}%`, background: barColor }} />
                      </div>
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: rankColor, minWidth: 38, textAlign: "right" }}>
                      {m.score}%
                    </div>
                  </div>
                );
              })}

              <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 24 }}>
                <button className="jkt-btn-ghost" onClick={() => { setSectionIdx(0); setStep("quiz"); }}>
                  ← Ulangi Kuis
                </button>
                <button className="jkt-btn-primary" onClick={resetAll}>Mulai Ulang</button>
              </div>
            </>
          )}

        </div>

        {/* ── FOOTER ── */}
        <Footer />

      </div>
    </>
  );
}