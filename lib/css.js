 // ─── GLOBAL CSS ───────────────────────────────────────────────────────────────
 const S = {
  pink: "#ff4d8d",
  coral: "#ff6b6b",
  gold: "#ffd166",
  dark: "#0d0d0f",
  card: "#141418",
  cardBorder: "#2a2a35",
  muted: "#666680",
  text: "#f0eeff",
  textSoft: "#b0aac8",
};
export const css = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@300;400;500&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: ${S.dark}; }
  .jkt-root { font-family: 'DM Sans', sans-serif; color: ${S.text}; background: ${S.dark}; min-height: 100vh; padding: 0 0 4rem; }
  .jkt-header { text-align: center; padding: 3rem 1rem 2rem; position: relative; }
  .jkt-header::after { content:''; position:absolute; bottom:0; left:50%; transform:translateX(-50%); width:60px; height:2px;  border-radius:2px; }
  .jkt-title { font-family:'Playfair Display',serif; font-size:clamp(28px,6vw,48px); font-weight:900; letter-spacing:-1px; background: linear-gradient(135deg,#fff 30%,${S.pink}); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; line-height:1.1; }
  .jkt-subtitle { font-size:13px; color:${S.muted}; margin-top:8px; letter-spacing:3px; text-transform:uppercase; }
  .jkt-subtitle-2 { font-size:10px; color:${S.muted}; margin-top:8px; letter-spacing:3px; }
  .jkt-container { max-width:600px; margin:0 auto; padding:0 1rem; }
  .jkt-section-label { font-size:11px; letter-spacing:4px; text-transform:uppercase; color:${S.pink}; margin-bottom:16px; display:flex; align-items:center; gap:8px; }
  .jkt-section-label::after { content:''; flex:1; height:1px; background:${S.cardBorder}; }
  .jkt-card { background:${S.card}; border:1px solid ${S.cardBorder}; border-radius:16px; padding:20px; margin-bottom:12px; transition: border-color 0.2s; }
  .jkt-card:hover { border-color:#3a3a50; }
  .jkt-card.answered { border-color:#2d2040; }
  .jkt-q-label { font-size:14px; line-height:1.6; color:${S.textSoft}; margin-bottom:14px; }
  .jkt-likert { display:flex; gap:6px; flex-wrap:wrap; }
  .jkt-likert-btn { flex:1; min-width:70px; padding:8px 4px; border-radius:10px; border:1px solid ${S.cardBorder}; background:transparent; color:${S.muted}; font-family:'DM Sans',sans-serif; font-size:12px; cursor:pointer; transition:all 0.15s; text-align:center; }
  .jkt-likert-btn:hover { border-color:${S.pink}; color:${S.text}; }
  .jkt-likert-btn.sel { background: linear-gradient(135deg,#3d1040,#1d1035); border-color:${S.pink}; color:${S.text}; font-weight:500; }
  .jkt-bipolar { display:flex; flex-direction:column; gap:10px; }
  .jkt-bipolar-labels { display:flex; justify-content:space-between; font-size:11px; color:${S.muted}; }
  .jkt-bipolar-track { display:flex; gap:5px; justify-content:center; align-items:center; }
  .jkt-bipolar-dot { border-radius:50%; border:1.5px solid ${S.cardBorder}; background:transparent; cursor:pointer; transition:all 0.15s; flex-shrink:0; }
  .jkt-bipolar-dot:hover { border-color:${S.pink}; }
  .jkt-bipolar-dot.left-sel { background: linear-gradient(135deg,#ff6b6b55,#ff4d8d44); border-color:${S.coral}; }
  .jkt-bipolar-dot.right-sel { background: linear-gradient(135deg,#4d4dff55,#9b87e844); border-color:#9b87e8; }
  .jkt-bipolar-dot.mid-sel { background:#1d1035; border-color:${S.muted}; }
  .jkt-choice-grid { display:grid; grid-template-columns:1fr 1fr; gap:8px; }
  .jkt-choice-btn { padding:10px 12px; border-radius:10px; border:1px solid ${S.cardBorder}; background:transparent; color:${S.textSoft}; font-family:'DM Sans',sans-serif; font-size:13px; cursor:pointer; transition:all 0.15s; text-align:left; line-height:1.4; }
  .jkt-choice-btn:hover { border-color:${S.pink}50; color:${S.text}; }
  .jkt-choice-btn.sel { background: linear-gradient(135deg,#3d1040,#1d1035); border-color:${S.pink}; color:${S.text}; }
  .jkt-choice-btn.disabled { opacity:0.35; cursor:not-allowed; }
  .jkt-multisel-grid { display:flex; flex-wrap:wrap; gap:8px; }
  .jkt-tag { padding:7px 14px; border-radius:20px; border:1px solid ${S.cardBorder}; background:transparent; color:${S.muted}; font-family:'DM Sans',sans-serif; font-size:12px; cursor:pointer; transition:all 0.15s; }
  .jkt-tag:hover { border-color:${S.pink}50; color:${S.text}; }
  .jkt-tag.sel { background: linear-gradient(135deg,#3d1040,#1d1035); border-color:${S.pink}; color:${S.text}; }
  .jkt-tag.disabled { opacity:0.35; cursor:not-allowed; }
  .jkt-yesno { display:flex; gap:10px; }
  .jkt-yesno-btn { flex:1; padding:12px; border-radius:12px; border:1px solid ${S.cardBorder}; background:transparent; color:${S.textSoft}; font-family:'DM Sans',sans-serif; font-size:14px; cursor:pointer; transition:all 0.15s; }
  .jkt-yesno-btn.yes.sel { background: linear-gradient(135deg,#1a3a1a,#0d200d); border-color:#4caf50; color:#81c784; }
  .jkt-yesno-btn.no.sel  { background: linear-gradient(135deg,#3a1a1a,#200d0d); border-color:#f44336; color:#e57373; }
  .jkt-max-hint { font-size:11px; color:${S.muted}; margin-top:10px; }
  .jkt-max-hint span { color:${S.pink}; font-weight:500; }
  .jkt-nav { display:flex; justify-content:space-between; align-items:center; margin-top:28px; }
  .jkt-btn-ghost { padding:10px 24px; border-radius:40px; border:1px solid ${S.cardBorder}; background:transparent; color:${S.muted}; font-family:'DM Sans',sans-serif; font-size:13px; cursor:pointer; transition:all 0.15s; }
  .jkt-btn-ghost:hover { border-color:${S.muted}; color:${S.text}; }
  .jkt-btn-primary { padding:12px 32px; border-radius:40px; border:none; background: linear-gradient(135deg,${S.pink},${S.coral}); color:white; font-family:'DM Sans',sans-serif; font-size:14px; font-weight:500; cursor:pointer; transition:transform 0.15s; }
  .jkt-btn-primary:hover { transform:scale(1.03); }
  .jkt-progress-bar { height:3px; background:#1e1e2a; border-radius:3px; margin-bottom:32px; overflow:hidden; }
  .jkt-progress-fill { height:100%; background:linear-gradient(90deg,${S.pink},${S.coral}); border-radius:3px; transition:width 0.5s ease; }
  .jkt-team-grid { display:flex; flex-direction:column; gap:10px; }
  .jkt-team-card { padding:16px 20px; border-radius:14px; border:1px solid ${S.cardBorder}; background:${S.card}; cursor:pointer; transition:all 0.2s; display:flex; justify-content:space-between; align-items:center; }
  .jkt-team-card:hover { border-color:${S.pink}60; }
  .jkt-team-card.sel { border-color:${S.pink}; background: linear-gradient(135deg,#2d1040,#16102a); }
  .jkt-check { width:22px; height:22px; border-radius:50%; border:1.5px solid ${S.cardBorder}; display:flex; align-items:center; justify-content:center; font-size:12px; transition:all 0.2s; flex-shrink:0; }
  .jkt-check.on { background:${S.pink}; border-color:${S.pink}; color:white; }
  .result-hero { background: linear-gradient(135deg,#2a1040,#141040); border:1px solid ${S.pink}60; border-radius:20px; padding:28px 24px; text-align:center; margin-bottom:20px; position:relative; overflow:hidden; }
  .result-hero::before { content:''; position:absolute; top:-30px; right:-30px; width:150px; height:150px; border-radius:50%; background:${S.pink}15; }
  .result-avatar { width:80px; height:80px; border-radius:50%; object-fit:cover; border:3px solid ${S.pink}; margin:0 auto 12px; display:block; background:#2a2a35; }
  .result-name { font-family:'Playfair Display',serif; font-size:24px; font-weight:700; }
  .result-score { font-size:42px; font-weight:900; font-family:'Playfair Display',serif; background:linear-gradient(135deg,${S.pink},${S.coral}); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
  .result-tag { display:inline-block; font-size:11px; padding:3px 10px; border-radius:12px; border:1px solid ${S.cardBorder}; color:${S.muted}; margin:2px; }
  .result-list-item { display:flex; align-items:center; gap:12px; padding:12px 14px; border-radius:12px; background:${S.card}; border:1px solid ${S.cardBorder}; margin-bottom:8px; }
  .result-rank { width:28px; height:28px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:12px; font-weight:700; flex-shrink:0; }
  .result-avatar-sm { width:38px; height:38px; border-radius:50%; object-fit:cover; background:#2a2a35; flex-shrink:0; }
  .score-bar-bg { height:5px; background:#1e1e2a; border-radius:4px; overflow:hidden; margin-top:4px; }
  .score-bar-fill { height:100%; border-radius:4px; transition: width 0.8s ease; }
`;