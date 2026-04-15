"use client";
import { useState } from "react";
import Image from "next/image.js";
import { members, ALL_TEAMS, SECTIONS } from "@/lib/data.js";
import { css, S } from "@/lib/css.js";

// ─── GENERATION HELPERS ───────────────────────────────────────────────────────
function memberMatchesGeneration(member, genAns) {
  if (genAns === null || genAns === undefined) return true;
  const gen = parseInt(member.generation);
  switch (genAns) {
    case 0: return gen <= 9;
    case 1: return gen >= 10 && gen <= 11;
    case 2: return gen >= 12;
    case 3: return true;
    default: return true;
  }
}

const GEN_LABELS = ["Gen 3–9", "Gen 10–11", "Gen 12+", "Semua Generasi"];

// ─── SCORING ─────────────────────────────────────────────────────────────────
function scoreMember(member, answers) {
  let total = 0, maxPossible = 0;

  SECTIONS.forEach((sec) => {
    sec.questions.forEach((q) => {
      if (q.key === "generationPref") return;

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
          total -= maxPossible * 0.5;
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
  "Team Love":    S.red,
  "Team Dream":   "#4A7EC8",
  "Team Passion": "#C87830",
  "Trainee":      "#3A9A60",
};

const GENDERS = [
  { value: "male",   label: "Laki-laki" },
  { value: "female", label: "Perempuan" },
  { value: "other",  label: "Lainnya" },
];

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
      <div style={{ textAlign: "center", fontSize: 11, color: S.textMuted, marginTop: 5 }}>{hint}</div>
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
        const color = TEAM_COLORS[t] || S.red;
        const count = members.filter((m) => m.team === t).length;
        return (
          <div key={t} className={`jkt-team-card${isActive ? " sel" : ""}`}
            style={{ borderColor: isActive ? color : "" }}
            onClick={() => { if (allSelected) onChange([t]); else toggleTeam(t); }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: color, flexShrink: 0,
                boxShadow: isActive ? `0 0 6px ${color}` : "none" }} />
              <div>
                <div style={{ fontWeight: 500, fontSize: 14, color: S.text }}>{t}</div>
                <div style={{ fontSize: 11, color: S.textMuted, marginTop: 1 }}>{count} member</div>
              </div>
            </div>
            <div className={`jkt-check${isActive ? " on" : ""}`}
              style={{ background: isActive ? color : "", borderColor: isActive ? color : "",
                boxShadow: isActive ? `0 0 8px ${color}66` : "none" }}>✓</div>
          </div>
        );
      })}
      {/* All members option */}
      <div className={`jkt-team-card${allSelected ? " sel" : ""}`}
        style={{ borderColor: allSelected ? S.gold : "" }} onClick={toggleAll}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ fontSize: 10, color: allSelected ? S.gold : S.textFaint, letterSpacing: 2 }}>♠♥♦♣</div>
          <div>
            <div style={{ fontWeight: 500, fontSize: 14, color: S.text }}>Semua Member</div>
            <div style={{ fontSize: 11, color: S.textMuted, marginTop: 1 }}>{members.length} member dari semua tim</div>
          </div>
        </div>
        <div className={`jkt-check${allSelected ? " on" : ""}`}
          style={{ background: allSelected ? S.gold : "", borderColor: allSelected ? S.gold : "",
            boxShadow: allSelected ? `0 0 8px ${S.gold}66` : "none" }}>✓</div>
      </div>
    </div>
  );
}

// ─── FOOTER ───────────────────────────────────────────────────────────────────
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
      <div className="jkt-footer-label">Made with ♥ by</div>
      <div className="jkt-footer-links">
        {CREATOR_LINKS.map((l) => (
          <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer"
            className="jkt-footer-link">
            {l.icon}{l.label}
          </a>
        ))}
      </div>
      <div className="jkt-footer-copy">JKT48 Oshi Selector · Fanmade, just for fun.</div>
    </footer>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function Home() {
  const [step, setStep]                   = useState("teams");
  const [selectedTeams, setSelectedTeams] = useState([...ALL_TEAMS]);
  const [sectionIdx, setSectionIdx]       = useState(0);
  const [answers, setAnswers]             = useState({});
  const [results, setResults]             = useState([]);
  const [userName,   setUserName]         = useState("");
  const [userGender, setUserGender]       = useState(null);

  const pool          = members.filter((m) => selectedTeams.includes(m.team));
  const curSection    = SECTIONS[sectionIdx];
  const totalSections = SECTIONS.length;
  const totalQ        = SECTIONS.reduce((s, sec) => s + sec.questions.length, 0);
  const answeredCount = Object.keys(answers).length;

  function setAnswer(key, val) {
    setAnswers((prev) => ({ ...prev, [key]: val }));
  }

  function compute() {
    const genAns = answers["generationPref"] ?? null;
    const scored = pool
      .map((m) => ({
        ...m,
        score:      scoreMember(m, answers),
        genMatches: memberMatchesGeneration(m, genAns),
      }))
      .sort((a, b) => {
        if (a.genMatches !== b.genMatches) return a.genMatches ? -1 : 1;
        return b.score - a.score;
      });
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

  const activeGenLabel = answers["generationPref"] !== undefined && answers["generationPref"] !== null
    ? GEN_LABELS[answers["generationPref"]] : null;
  const hasGenFilter  = activeGenLabel && activeGenLabel !== "Semua Generasi";
  const firstMismatch = hasGenFilter ? results.findIndex((m) => !m.genMatches) : -1;

  return (
    <>
      <style>{css}</style>
      <div className="jkt-root">

        {/* ── HEADER ── */}
        <div className="jkt-header">
          <div className="jkt-header-inner">
            <div className="jkt-title">
              <span className="jkt-title-accent">♠ ♥  JKT48  ♦ ♣</span>
              Oshi Selector
            </div>
            <div className="jkt-subtitle">Temukan oshi-mu!</div>
            <div className="jkt-subtitle-2">Masih beta — mohon maklum kalau hasilnya rada ngawur 🙏</div>
          </div>
        </div>

        <div className="jkt-container" style={{ paddingTop: "1.75rem" }}>

          {/* ── TEAM SELECTION ── */}
          {step === "teams" && (
            <>
              <div className="jkt-section-label">Langkah 1 — Pilih Tim</div>
              <p style={{ fontSize: 13, color: S.textMuted, marginBottom: 18, lineHeight: 1.7 }}>
                Pilih tim mana yang ingin kamu masukkan ke dalam pencarian.
              </p>
              <TeamSelector selectedTeams={selectedTeams} onChange={setSelectedTeams} />
              <div style={{ marginTop: 24, textAlign: "center" }}>
                <button className="jkt-btn-primary" onClick={() => setStep("quiz")}>
                  Mulai Kuis →
                </button>
                <div style={{ fontSize: 11, color: S.textMuted, marginTop: 10 }}>
                  {pool.length} member terpilih
                </div>
              </div>
            </>
          )}

          {/* ── QUIZ ── */}
          {step === "quiz" && (
            <>
              <div className="jkt-progress-bar">
                <div className="jkt-progress-fill"
                  style={{ width: `${((sectionIdx + 1) / totalSections) * 100}%` }} />
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
                <div className="jkt-section-label" style={{ margin: 0, flex: 1 }}>
                  <span style={{ fontSize: 15 }}>{curSection.emoji}</span> {curSection.title}
                </div>
                <div style={{ fontSize: 11, color: S.textMuted, marginLeft: 12, whiteSpace: "nowrap" }}>
                  {sectionIdx + 1} / {totalSections}
                </div>
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
                <div style={{ fontSize: 11, color: S.textMuted }}>{answeredCount} / {totalQ} dijawab</div>
                {sectionIdx < totalSections - 1
                  ? <button className="jkt-btn-primary" onClick={() => setSectionIdx((i) => i + 1)}>Lanjut →</button>
                  : <button className="jkt-btn-primary" onClick={() => setStep("userinfo")}>Hampir selesai →</button>
                }
              </div>
              <p style={{ textAlign: "center", fontSize: 11, color: S.textFaint, marginTop: 14, lineHeight: 1.6 }}>
                Pertanyaan yang dilewati tidak mempengaruhi skor
              </p>
            </>
          )}

          {/* ── USER INFO FORM ── */}
          {step === "userinfo" && (
            <>
              <div className="jkt-section-label">Terakhir — Tentang Kamu</div>
              <p style={{ fontSize: 13, color: S.textMuted, marginBottom: 16, lineHeight: 1.7 }}>
                Opsional — hasil tetap muncul kalau kamu skip bagian ini.
              </p>
              <div className="jkt-form-card">
                <div className="jkt-form-row">
                  <label className="jkt-form-label">Nama <span>(opsional)</span></label>
                  <input className="jkt-form-input" type="text"
                    placeholder="Nama atau nickname kamu..." maxLength={40}
                    value={userName} onChange={(e) => setUserName(e.target.value)} />
                </div>
                <div className="jkt-form-row">
                  <label className="jkt-form-label">Gender <span>(opsional)</span></label>
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
                <button className="jkt-btn-ghost" onClick={() => setStep("quiz")}>← Kembali</button>
                <button className="jkt-btn-primary" onClick={compute}>Lihat Hasil ♠</button>
              </div>
            </>
          )}

          {/* ── RESULTS ── */}
          {step === "results" && results.length > 0 && (
            <>
              <div className="jkt-section-label">Hasil</div>

              {/* Generation filter bar */}
              {hasGenFilter && (
                <div className="filter-bar">
                  <span className="filter-bar-label">♦ Filter Generasi</span>
                  <span className="filter-badge">{activeGenLabel}</span>
                  <span style={{ fontSize: 11, color: S.textMuted, marginLeft: "auto" }}>
                    Member {activeGenLabel} ditampilkan lebih dulu
                  </span>
                </div>
              )}

              {/* Hero card */}
              <div className="result-hero">
                {(userName?.trim() || userGender) && (
                  <div className="result-greeting">
                    <strong>{userName?.trim() || "Kamu"}</strong>{", oshi kamu adalah:"}
                  </div>
                )}
                {!userName?.trim() && (
                  <div style={{ fontSize: 10, letterSpacing: 4, color: S.textMuted, marginBottom: 14,
                    textTransform: "uppercase", position: "relative" }}>
                    ♠ Oshi-mu Adalah ♠
                  </div>
                )}

                <Image height={100} width={100} className="result-avatar"
                  src={results[0].photo} alt={results[0].name}
                  onError={(e) => { e.target.style.display = "none"; }} />

                <div className="result-name">{results[0].name}</div>
                <div style={{ fontSize: 12, color: S.textMuted, margin: "5px 0 14px", position: "relative" }}>
                  {results[0].team} · Gen {results[0].generation}
                </div>

                <div className="result-score">{results[0].score}%</div>
                <div style={{ fontSize: 11, color: S.textMuted, marginBottom: 12, position: "relative" }}>
                  skor kecocokan
                </div>

                <div style={{ position: "relative" }}>
                  {hasGenFilter && results[0].genMatches && (
                    <span className="result-tag gen-match">♦ {activeGenLabel}</span>
                  )}
                 
                 
                </div>

                <div style={{ fontSize: 9, color: S.textFaint, marginTop: 12, position: "relative" }}>
                  Disclaimer: kembali lagi ke kepercayaan masing-masing 🙏
                </div>
              </div>

              {/* Ranking list */}
              <div className="jkt-section-label" style={{ marginTop: 6 }}>
                Rekomendasi Oshi Untukmu
              </div>

              {results.map((m, i) => {
                const showDivider = hasGenFilter && i === firstMismatch && firstMismatch > 0;
                const rankCls = i === 0 ? " top1" : i === 1 ? " top2" : i === 2 ? " top3" : "";
                const isTop   = i === 0;
                const barColor = i === 0 ? S.red
                  : i === 1 ? S.goldDim
                  : i === 2 ? S.border2
                  : S.border1;

                return (
                  <div key={m.id}>
                    {showDivider && (
                      <div className="result-divider">
                        ♣ — Di luar filter {activeGenLabel} — ♣
                      </div>
                    )}
                    <div className={`result-list-item${isTop ? " top-result" : ""}${m.genMatches && hasGenFilter ? " gen-match" : ""}${!m.genMatches && hasGenFilter ? " gen-mismatch" : ""}`}>
                      <div className={`result-rank${rankCls}`}>{i + 1}</div>
                      <Image className="result-avatar-sm" width={40} height={40}
                        src={m.photo} alt={m.name}
                        onError={(e) => { e.target.style.background = S.surface3; }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13.5, fontWeight: 500, color: S.text,
                          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {m.name}
                        </div>
                        <div style={{ fontSize: 11, color: S.textMuted }}>
                          {m.team} · Gen {m.generation}
                          {hasGenFilter && m.genMatches && (
                            <span style={{ marginLeft: 6, color: S.red, fontWeight: 700 }}>♦</span>
                          )}
                        </div>
                        <div className="score-bar-bg">
                          <div className="score-bar-fill" style={{ width: `${m.score}%`, background: barColor,
                            boxShadow: i === 0 ? `0 0 6px ${S.red}88` : "none" }} />
                        </div>
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 700,
                        color: i === 0 ? S.red : i === 1 ? S.gold : S.textMuted,
                        minWidth: 38, textAlign: "right",
                        textShadow: i === 0 ? `0 0 10px ${S.red}88` : "none" }}>
                        {m.score}%
                      </div>
                    </div>
                  </div>
                );
              })}

              <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 28 }}>
                <button className="jkt-btn-ghost" onClick={() => { setSectionIdx(0); setStep("quiz"); }}>
                  ← Ulangi Kuis
                </button>
                <button className="jkt-btn-primary" onClick={resetAll}>Mulai Ulang ♠</button>
              </div>
            </>
          )}

        </div>

        <Footer />
      </div>
    </>
  );
}