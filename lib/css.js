const S = {
  // Reds
  red:        "#E8192C",
  redDeep:    "#B01020",
  redGlow:    "#FF3347",
  redDim:     "#8B0F1A",
  redFaint:   "#3A0A0F",
  redSubtle:  "#220608",

  // Golds
  gold:       "#D4AF37",
  goldLight:  "#F0D060",
  goldDim:    "#8A7020",

  // Blacks & surfaces
  black:      "#070608",
  surface0:   "#0D0B0C",
  surface1:   "#131114",
  surface2:   "#1A171A",
  surface3:   "#231F24",
  surface4:   "#2E2930",

  // Borders
  border0:    "#1E1A1F",
  border1:    "#2E282F",
  border2:    "#3E3640",
  borderRed:  "#5A1520",

  // Text
  text:       "#F5F0F0",
  textSoft:   "#C8B8BB",
  textMuted:  "#7A6870",
  textFaint:  "#4A3E42",
};

export { S };

export const css = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;0,900;1,400&family=Inter:wght@300;400;500;600&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  body { background: ${S.black}; }

  /* ── Suit decorations ── */
  @keyframes flicker { 0%,100%{opacity:1} 92%{opacity:0.92} 96%{opacity:0.97} }
  @keyframes fadeUp  { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }

  /* ── Root & layout ── */
  .jkt-root      { font-family:'Inter',sans-serif; color:${S.text}; background:${S.black}; min-height:100vh; }
  .jkt-container { max-width:580px; margin:0 auto; padding:0 1.25rem 5rem; }

  /* ── Header ── */
  .jkt-header {
    background: ${S.surface0};
    border-bottom: 1px solid ${S.border1};
    padding: 2.5rem 1.25rem 2.2rem;
    text-align: center;
    position: relative;
    overflow: hidden;
  }
  /* Decorative suit pattern */
  .jkt-header::before {
    content: '♠ ♥ ♦ ♣ ♠ ♥ ♦ ♣ ♠ ♥ ♦ ♣ ♠ ♥ ♦ ♣';
    position: absolute;
    top: 8px; left: 0; right: 0;
    font-size: 11px; letter-spacing: 8px;
    color: ${S.redFaint};
    text-align: center;
    pointer-events: none;
  }
  .jkt-header::after {
    content: '';
    position: absolute;
    bottom: 0; left: 0; right: 0;
    height: 2px;
    background: linear-gradient(90deg, transparent, ${S.red}, ${S.gold}, ${S.red}, transparent);
  }
  .jkt-header-inner { max-width: 580px; margin: 0 auto; position: relative; }

  .jkt-title {
    font-family: 'Playfair Display', serif;
    font-size: clamp(28px, 6vw, 46px);
    font-weight: 900;
    letter-spacing: 1px;
    line-height: 1.1;
    color: ${S.text};
  }
  .jkt-title-accent {
    display: block;
    color: ${S.red};
    font-style: italic;
    font-size: 0.65em;
    letter-spacing: 6px;
    text-transform: uppercase;
    font-weight: 600;
    margin-bottom: 4px;
  }
  .jkt-subtitle   { font-size: 11px; color: ${S.gold}; margin-top: 10px; letter-spacing: 4px; text-transform: uppercase; font-weight: 500; }
  .jkt-subtitle-2 { font-size: 10px; color: ${S.textMuted}; margin-top: 6px; letter-spacing: 1px; }

  /* ── Section label ── */
  .jkt-section-label {
    font-size: 10px; letter-spacing: 4px; text-transform: uppercase;
    color: ${S.gold}; font-weight: 600;
    margin-bottom: 16px;
    display: flex; align-items: center; gap: 10px;
  }
  .jkt-section-label::before { content: '♦'; color: ${S.red}; font-size: 8px; }
  .jkt-section-label::after  { content: ''; flex: 1; height: 1px; background: linear-gradient(90deg, ${S.border1}, transparent); }

  /* ── Question cards ── */
  .jkt-card {
    background: ${S.surface1};
    border: 1px solid ${S.border1};
    border-radius: 6px;
    padding: 18px 20px;
    margin-bottom: 10px;
    transition: border-color 0.15s, background 0.15s;
    position: relative;
  }
  .jkt-card::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, ${S.border2}, transparent);
    border-radius: 6px 6px 0 0;
  }
  .jkt-card:hover    { border-color: ${S.border2}; background: ${S.surface2}; }
  .jkt-card.answered {
    border-color: ${S.borderRed};
    background: ${S.surface2};
    box-shadow: inset 3px 0 0 ${S.red};
  }
  .jkt-q-label { font-size: 13.5px; line-height: 1.65; color: ${S.textSoft}; margin-bottom: 14px; font-weight: 400; }

  /* ── Likert ── */
  .jkt-likert { display: flex; gap: 5px; flex-wrap: wrap; }
  .jkt-likert-btn {
    flex: 1; min-width: 78px; padding: 8px 5px;
    border-radius: 4px; border: 1px solid ${S.border1};
    background: ${S.surface0}; color: ${S.textMuted};
    font-family: 'Inter', sans-serif; font-size: 11.5px;
    cursor: pointer; transition: all 0.12s; text-align: center; letter-spacing: 0.3px;
  }
  .jkt-likert-btn:hover { border-color: ${S.red}; color: ${S.text}; background: ${S.redSubtle}; }
  .jkt-likert-btn.sel   {
    background: ${S.red}; border-color: ${S.redGlow};
    color: ${S.text}; font-weight: 600;
    box-shadow: 0 0 12px ${S.red}55;
  }

  /* ── Bipolar ── */
  .jkt-bipolar        { display: flex; flex-direction: column; gap: 12px; }
  .jkt-bipolar-labels { display: flex; justify-content: space-between; font-size: 11px; color: ${S.textMuted}; font-weight: 500; letter-spacing: 0.5px; }
  .jkt-bipolar-track  { display: flex; gap: 8px; justify-content: center; align-items: center; }
  .jkt-bipolar-dot {
    border-radius: 50%; border: 1.5px solid ${S.border1};
    background: ${S.surface0}; cursor: pointer; transition: all 0.12s; flex-shrink: 0;
  }
  .jkt-bipolar-dot:hover    { border-color: ${S.red}; background: ${S.redSubtle}; }
  .jkt-bipolar-dot.left-sel  { background: ${S.redFaint}; border-color: ${S.red}; box-shadow: 0 0 8px ${S.red}44; }
  .jkt-bipolar-dot.right-sel { background: ${S.redFaint}; border-color: ${S.red}; box-shadow: 0 0 8px ${S.red}44; }
  .jkt-bipolar-dot.mid-sel   { background: ${S.surface3}; border-color: ${S.border2}; }

  /* ── Choice grid ── */
  .jkt-choice-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 7px; }
  .jkt-choice-btn {
    padding: 10px 12px; border-radius: 4px;
    border: 1px solid ${S.border1};
    background: ${S.surface0}; color: ${S.textSoft};
    font-family: 'Inter', sans-serif; font-size: 12.5px;
    cursor: pointer; transition: all 0.12s; text-align: left; line-height: 1.4;
  }
  .jkt-choice-btn:hover    { border-color: ${S.red}; color: ${S.text}; background: ${S.redSubtle}; }
  .jkt-choice-btn.sel      {
    background: ${S.red}; border-color: ${S.redGlow};
    color: ${S.text}; font-weight: 500;
    box-shadow: 0 0 10px ${S.red}44;
  }
  .jkt-choice-btn.disabled { opacity: 0.3; cursor: not-allowed; }

  /* ── Multiselect tags ── */
  .jkt-multisel-grid { display: flex; flex-wrap: wrap; gap: 7px; }
  .jkt-tag {
    padding: 6px 13px; border-radius: 20px;
    border: 1px solid ${S.border1};
    background: ${S.surface0}; color: ${S.textMuted};
    font-family: 'Inter', sans-serif; font-size: 12px;
    cursor: pointer; transition: all 0.12s;
  }
  .jkt-tag:hover    { border-color: ${S.red}; color: ${S.text}; background: ${S.redSubtle}; }
  .jkt-tag.sel      {
    background: ${S.red}; border-color: ${S.redGlow};
    color: ${S.text}; box-shadow: 0 0 8px ${S.red}44;
  }
  .jkt-tag.disabled { opacity: 0.3; cursor: not-allowed; }

  /* ── Yes / No ── */
  .jkt-yesno { display: flex; gap: 8px; }
  .jkt-yesno-btn {
    flex: 1; padding: 11px; border-radius: 4px;
    border: 1px solid ${S.border1}; background: ${S.surface0}; color: ${S.textSoft};
    font-family: 'Inter', sans-serif; font-size: 14px; cursor: pointer; transition: all 0.12s;
  }
  .jkt-yesno-btn:hover       { border-color: ${S.red}; background: ${S.redSubtle}; }
  .jkt-yesno-btn.yes.sel     { background: ${S.red}; border-color: ${S.redGlow}; color: ${S.text}; font-weight: 600; box-shadow: 0 0 10px ${S.red}44; }
  .jkt-yesno-btn.no.sel      { background: ${S.surface4}; border-color: ${S.border2}; color: ${S.text}; font-weight: 600; }

  /* ── Max hint ── */
  .jkt-max-hint      { font-size: 11px; color: ${S.textMuted}; margin-top: 10px; }
  .jkt-max-hint span { color: ${S.gold}; font-weight: 600; }

  /* ── Navigation ── */
  .jkt-nav { display: flex; justify-content: space-between; align-items: center; margin-top: 28px; }
  .jkt-btn-ghost {
    padding: 10px 22px; border-radius: 4px;
    border: 1px solid ${S.border2}; background: transparent; color: ${S.textMuted};
    font-family: 'Inter', sans-serif; font-size: 13px; cursor: pointer; transition: all 0.12s;
  }
  .jkt-btn-ghost:hover   { border-color: ${S.textMuted}; color: ${S.text}; }
  .jkt-btn-primary {
    padding: 11px 30px; border-radius: 4px;
    border: 1px solid ${S.redGlow};
    background: ${S.red}; color: ${S.text};
    font-family: 'Inter', sans-serif; font-size: 13.5px; font-weight: 600;
    cursor: pointer; transition: all 0.15s;
    box-shadow: 0 0 16px ${S.red}44;
    letter-spacing: 0.5px;
  }
  .jkt-btn-primary:hover { background: ${S.redGlow}; box-shadow: 0 0 24px ${S.red}66; }

  /* ── Progress bar ── */
  .jkt-progress-bar  { height: 2px; background: ${S.border0}; margin-bottom: 28px; overflow: hidden; }
  .jkt-progress-fill {
    height: 100%;
    background: linear-gradient(90deg, ${S.redDim}, ${S.red}, ${S.gold});
    transition: width 0.4s ease;
  }

  /* ── Team selector ── */
  .jkt-team-grid { display: flex; flex-direction: column; gap: 8px; }
  .jkt-team-card {
    padding: 14px 18px; border-radius: 6px;
    border: 1px solid ${S.border1}; background: ${S.surface1};
    cursor: pointer; transition: all 0.15s;
    display: flex; justify-content: space-between; align-items: center;
  }
  .jkt-team-card:hover { border-color: ${S.border2}; background: ${S.surface2}; }
  .jkt-team-card.sel   {
    border-color: ${S.red};
    background: ${S.redSubtle};
    box-shadow: inset 0 0 20px ${S.red}18;
  }
  .jkt-check {
    width: 20px; height: 20px; border-radius: 50%;
    border: 1.5px solid ${S.border2};
    display: flex; align-items: center; justify-content: center;
    font-size: 10px; transition: all 0.12s; flex-shrink: 0; color: transparent;
  }
  .jkt-check.on { background: ${S.red}; border-color: ${S.redGlow}; color: ${S.text}; box-shadow: 0 0 8px ${S.red}55; }

  /* ── User info form ── */
  .jkt-form-card  { background: ${S.surface1}; border: 1px solid ${S.border1}; border-radius: 6px; padding: 22px; margin-bottom: 16px; }
  .jkt-form-row   { display: flex; flex-direction: column; gap: 6px; margin-bottom: 18px; }
  .jkt-form-row:last-child { margin-bottom: 0; }
  .jkt-form-label { font-size: 10px; color: ${S.gold}; letter-spacing: 2px; text-transform: uppercase; font-weight: 600; }
  .jkt-form-label span { font-size: 10px; color: ${S.textMuted}; margin-left: 6px; text-transform: none; letter-spacing: 0; font-weight: 400; }
  .jkt-form-input {
    background: ${S.surface0}; border: 1px solid ${S.border1};
    border-radius: 4px; padding: 10px 14px; color: ${S.text};
    font-family: 'Inter', sans-serif; font-size: 13.5px;
    outline: none; transition: border-color 0.15s; width: 100%;
  }
  .jkt-form-input::placeholder { color: ${S.textFaint}; }
  .jkt-form-input:focus        { border-color: ${S.red}; box-shadow: 0 0 0 2px ${S.red}22; }
  .jkt-gender-grid { display: flex; gap: 7px; }
  .jkt-gender-btn {
    flex: 1; padding: 10px; border-radius: 4px;
    border: 1px solid ${S.border1}; background: ${S.surface0}; color: ${S.textMuted};
    font-family: 'Inter', sans-serif; font-size: 13px; cursor: pointer; transition: all 0.12s;
  }
  .jkt-gender-btn:hover { border-color: ${S.red}; color: ${S.text}; background: ${S.redSubtle}; }
  .jkt-gender-btn.sel   { background: ${S.red}; border-color: ${S.redGlow}; color: ${S.text}; font-weight: 600; }

  /* ── Result hero ── */
  .result-hero {
    background: ${S.surface1};
    border: 1px solid ${S.borderRed};
    border-radius: 8px;
    padding: 28px 24px;
    text-align: center;
    margin-bottom: 16px;
    position: relative;
    overflow: hidden;
  }
  .result-hero::before {
    content: '';
    position: absolute; inset: 0;
    background: radial-gradient(ellipse at 50% 0%, ${S.redFaint} 0%, transparent 65%);
    pointer-events: none;
  }
  .result-hero::after {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 2px;
    background: linear-gradient(90deg, transparent, ${S.red}, ${S.gold}, ${S.red}, transparent);
  }
  .result-greeting        { font-size: 13px; color: ${S.textMuted}; margin-bottom: 8px; line-height: 1.6; position: relative; }
  .result-greeting strong { color: ${S.gold}; font-weight: 600; }
  .result-avatar {
    width: 84px; height: 84px; border-radius: 50%;
    object-fit: cover;
    border: 2px solid ${S.red};
    margin: 0 auto 14px; display: block; background: ${S.surface3};
    box-shadow: 0 0 20px ${S.red}44;
    position: relative;
  }
  .result-name  { font-family: 'Playfair Display', serif; font-size: 24px; font-weight: 700; color: ${S.text}; letter-spacing: 0.5px; position: relative; }
  .result-score {
    font-size: 52px; font-weight: 900;
    font-family: 'Playfair Display', serif;
    color: ${S.red};
    line-height: 1;
    text-shadow: 0 0 30px ${S.red}66;
    position: relative;
  }
  .result-tag {
    display: inline-block; font-size: 11px; padding: 3px 10px;
    border-radius: 3px; border: 1px solid ${S.border2};
    color: ${S.textMuted}; margin: 2px; background: ${S.surface3};
    font-family: 'Inter', sans-serif;
  }
  .result-tag.gen-match {
    background: ${S.redFaint}; border-color: ${S.red};
    color: ${S.red}; font-weight: 600;
  }

  /* ── Result list ── */
  .result-list-item {
    display: flex; align-items: center; gap: 12px;
    padding: 12px 14px; border-radius: 6px;
    background: ${S.surface1}; border: 1px solid ${S.border1};
    margin-bottom: 7px; transition: all 0.12s;
  }
  .result-list-item:hover        { border-color: ${S.border2}; background: ${S.surface2}; }
  .result-list-item.top-result   { border-color: ${S.borderRed}; background: ${S.surface2}; }
  .result-list-item.gen-match    { border-left: 3px solid ${S.red}; }
  .result-list-item.gen-mismatch { opacity: 0.45; }
  .result-rank {
    width: 26px; height: 26px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 11px; font-weight: 700; flex-shrink: 0;
    background: ${S.surface3}; color: ${S.textMuted}; border: 1px solid ${S.border2};
    font-family: 'Playfair Display', serif;
  }
  .result-rank.top1 { background: ${S.red}; color: ${S.text}; border-color: ${S.redGlow}; box-shadow: 0 0 10px ${S.red}66; }
  .result-rank.top2 { background: ${S.surface4}; color: ${S.gold}; border-color: ${S.goldDim}; }
  .result-rank.top3 { background: ${S.surface3}; color: ${S.textSoft}; border-color: ${S.border2}; }
  .result-avatar-sm { width: 38px; height: 38px; border-radius: 50%; object-fit: cover; background: ${S.surface3}; flex-shrink: 0; }
  .score-bar-bg   { height: 3px; background: ${S.border0}; border-radius: 2px; overflow: hidden; margin-top: 5px; }
  .score-bar-fill { height: 100%; border-radius: 2px; transition: width 0.8s ease; }

  /* ── Filter bar ── */
  .filter-bar {
    display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
    padding: 10px 14px; background: ${S.redSubtle};
    border: 1px solid ${S.borderRed}; border-radius: 6px; margin-bottom: 14px;
  }
  .filter-bar-label { font-size: 10px; color: ${S.gold}; font-weight: 600; letter-spacing: 2px; text-transform: uppercase; }
  .filter-badge {
    font-size: 11px; padding: 3px 10px; border-radius: 3px;
    background: ${S.red}; color: ${S.text}; font-weight: 600;
    box-shadow: 0 0 8px ${S.red}44;
  }

  /* ── Divider ── */
  .result-divider {
    font-size: 10px; letter-spacing: 2px; text-transform: uppercase;
    color: ${S.textFaint}; text-align: center; padding: 10px 0 12px;
    border-top: 1px solid ${S.border1}; margin: 4px 0 8px;
    font-family: 'Inter', sans-serif;
  }

  /* ── Footer ── */
  .jkt-footer {
    margin-top: 48px; padding: 22px 1.25rem 36px;
    border-top: 1px solid ${S.border1};
    text-align: center; background: ${S.surface0};
    position: relative;
  }
  .jkt-footer::before {
    content: '♠   ♥   ♦   ♣';
    display: block; font-size: 12px; letter-spacing: 12px;
    color: ${S.border2}; margin-bottom: 16px;
  }
  .jkt-footer-label  { font-size: 10px; letter-spacing: 3px; text-transform: uppercase; color: ${S.textMuted}; margin-bottom: 12px; }
  .jkt-footer-links  { display: flex; justify-content: center; gap: 10px; flex-wrap: wrap; }
  .jkt-footer-link   {
    display: inline-flex; align-items: center; gap: 7px;
    padding: 8px 16px; border-radius: 4px;
    border: 1px solid ${S.border2}; background: ${S.surface2}; color: ${S.textMuted};
    font-family: 'Inter', sans-serif; font-size: 12px; text-decoration: none; transition: all 0.15s;
  }
  .jkt-footer-link:hover { border-color: ${S.red}; color: ${S.red}; }
  .jkt-footer-copy   { font-size: 10px; color: ${S.textFaint}; margin-top: 14px; letter-spacing: 1px; }
`;