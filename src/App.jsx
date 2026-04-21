import { useState, useRef, useEffect } from "react";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ─── SUPABASE ─────────────────────────────────────────────────────────────────
const SUPABASE_URL = "https://bjbsprypxrmekottuqdg.supabase.co";
const SUPABASE_KEY = "sb_publishable_I7BGVOOAjXcPlLrLZfdsUw_UeuQIyNm";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ─── ANTHROPIC ───────────────────────────────────────────────────────────────
// API key is used server-side only in /api/scan.js — never exposed to browser

// ─── BRAND ───────────────────────────────────────────────────────────────────
const B = {
  black:"#0A0A0A", charcoal:"#111111", graphite:"#1C1C1C", smoke:"#2A2A2A",
  mid:"#555555", silver:"#999999", fog:"#D0D0D0", white:"#FFFFFF",
  gold:"#C9A84C", goldL:"#E2C97E", goldD:"#6B5010",
  goldBg:"rgba(201,168,76,0.08)", goldBd:"rgba(201,168,76,0.22)",
};

const APP_NAME    = "Gathered";
const SMS_FOOTER  = "Shared via Gathered · usegathered.app";
const EBOOK_FOOTER = "Gathered · usegathered.app";

const CATEGORIES = ["All","Breakfast","Lunch","Dinner","Dessert","Snacks","Drinks","Sides"];
const TABS = ["Collection","Meal Planner"];
const FREE_RECIPE_LIMIT = 10;

// ─── FORMATTERS ───────────────────────────────────────────────────────────────
const fmtSMS = (r, senderName) =>
`${r.image} ${r.title.toUpperCase()}
From ${senderName}'s Gathered collection

Prep: ${r.prepTime}  |  Cook: ${r.cookTime}  |  Serves: ${r.servings}

INGREDIENTS
${r.ingredients.map(i => "  - " + i).join("\n")}

INSTRUCTIONS
${r.instructions.map((s,i) => `  ${i+1}. ${s}`).join("\n")}${r.notes ? `\n\nNote: ${r.notes}` : ""}

────────────────
${SMS_FOOTER}`;

const fmtCollection = (user, recipes) =>
`${user.name.toUpperCase()}'S GATHERED COLLECTION
${recipes.length} recipes worth keeping

` + recipes.map((r,i) =>
`━━━ ${i+1}. ${r.image} ${r.title} ━━━
${r.category}  ·  Serves ${r.servings}  ·  ${r.prepTime} prep

INGREDIENTS
${r.ingredients.map(x => "  - " + x).join("\n")}

INSTRUCTIONS
${r.instructions.map((x,j) => `  ${j+1}. ${x}`).join("\n")}${r.notes ? `\n\nNote: ${r.notes}` : ""}`
).join("\n\n") + `\n\n────────────────\n${SMS_FOOTER}`;

// ─── EBOOK ────────────────────────────────────────────────────────────────────
const makeEbook = (user, recipes) => {
  const cats = {};
  recipes.forEach(r => { if (!cats[r.category]) cats[r.category]=[]; cats[r.category].push(r); });
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8">
<title>${user.name}'s Gathered Collection</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,600;1,300&family=Jost:wght@300;400;500&display=swap');
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Jost',sans-serif;background:#0A0A0A;color:#F5F5F5}
.cover{min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:80px;border-bottom:1px solid #C9A84C}
.g-wordmark{font-family:'Cormorant Garamond',serif;font-size:0.85rem;letter-spacing:0.5em;text-transform:uppercase;color:#C9A84C;margin-bottom:48px}
.mono{width:90px;height:90px;border-radius:50%;border:1px solid #C9A84C;display:flex;align-items:center;justify-content:center;font-family:'Cormorant Garamond',serif;font-size:2rem;color:#C9A84C;margin:0 auto 28px}
.cover-name{font-size:0.72rem;letter-spacing:0.3em;text-transform:uppercase;color:#999;margin-bottom:10px}
.cover h1{font-family:'Cormorant Garamond',serif;font-size:3.8rem;font-weight:300;color:#F5F5F5;margin-bottom:10px}
.cover-tag{font-size:0.7rem;letter-spacing:0.25em;text-transform:uppercase;color:#C9A84C;margin-top:6px}
.cover-count{font-size:0.78rem;color:#555;margin-top:14px}
.toc{padding:70px 80px;border-bottom:1px solid #1C1C1C}
.toc h2{font-family:'Cormorant Garamond',serif;font-size:1.3rem;font-weight:300;color:#C9A84C;letter-spacing:0.25em;text-transform:uppercase;margin-bottom:36px}
.toc-row{display:flex;justify-content:space-between;align-items:center;padding:13px 0;border-bottom:1px solid #1C1C1C}
.toc-row span:first-child{font-size:0.9rem;color:#D0D0D0}
.toc-row span:last-child{font-size:0.68rem;letter-spacing:0.15em;text-transform:uppercase;color:#C9A84C}
.ch{padding:50px 80px 20px;border-bottom:1px solid #1C1C1C}
.ch h2{font-family:'Cormorant Garamond',serif;font-size:1.15rem;font-weight:300;color:#C9A84C;letter-spacing:0.3em;text-transform:uppercase}
.recipe{padding:50px 80px;border-bottom:1px solid #1C1C1C}
.rh{display:flex;align-items:flex-start;gap:24px;margin-bottom:40px}
.re{font-size:52px}
.rt{font-family:'Cormorant Garamond',serif;font-size:2.2rem;font-weight:300;color:#F5F5F5;margin-bottom:12px}
.rm{display:flex;gap:14px;flex-wrap:wrap}
.rm span{font-size:0.68rem;letter-spacing:0.15em;text-transform:uppercase;color:#C9A84C;border:1px solid rgba(201,168,76,0.3);padding:4px 12px;border-radius:2px}
.grid{display:grid;grid-template-columns:1fr 2fr;gap:50px}
.lbl{font-size:0.6rem;letter-spacing:0.3em;text-transform:uppercase;color:#C9A84C;margin-bottom:18px;padding-bottom:10px;border-bottom:1px solid rgba(201,168,76,0.25)}
.ings{list-style:none}.ings li{padding:9px 0;border-bottom:1px solid #1C1C1C;font-size:0.88rem;color:#D0D0D0;font-weight:300}
.steps{list-style:none;counter-reset:s}
.steps li{counter-increment:s;display:flex;gap:18px;padding:12px 0;border-bottom:1px solid #1C1C1C;font-size:0.88rem;color:#D0D0D0;font-weight:300;line-height:1.65}
.steps li::before{content:counter(s);font-family:'Cormorant Garamond',serif;font-size:1.3rem;color:#C9A84C;min-width:20px;line-height:1}
.notes{margin-top:24px;border-left:2px solid #C9A84C;padding:12px 18px;font-style:italic;font-size:0.85rem;color:#777;font-weight:300}
.footer{padding:50px;text-align:center}
.footer-brand{font-family:'Cormorant Garamond',serif;font-size:1rem;letter-spacing:0.4em;text-transform:uppercase;color:#2A2A2A;margin-bottom:6px}
.footer-tag{font-size:0.65rem;letter-spacing:0.2em;text-transform:uppercase;color:#1C1C1C}
</style></head><body>
<div class="cover">
  <div class="g-wordmark">Gathered</div>
  <div class="mono">${user.avatar}</div>
  <div class="cover-name">${user.name}</div>
  <h1>Recipe Collection</h1>
  <div class="cover-tag">Every recipe worth keeping.</div>
  <div class="cover-count">${recipes.length} curated recipes</div>
</div>
<div class="toc">
  <h2>Contents</h2>
  ${recipes.map(r=>`<div class="toc-row"><span>${r.image}&nbsp;&nbsp;${r.title}</span><span>${r.category}</span></div>`).join("")}
</div>
${Object.entries(cats).map(([c,rs])=>`
<div class="ch"><h2>${c}</h2></div>
${rs.map(r=>`
<div class="recipe">
  <div class="rh">
    <div class="re">${r.image}</div>
    <div>
      <div class="rt">${r.title}</div>
      <div class="rm"><span>Prep&nbsp;${r.prepTime}</span><span>Cook&nbsp;${r.cookTime}</span><span>Serves&nbsp;${r.servings}</span></div>
    </div>
  </div>
  <div class="grid">
    <div><div class="lbl">Ingredients</div><ul class="ings">${r.ingredients.map(i=>`<li>${i}</li>`).join("")}</ul></div>
    <div><div class="lbl">Instructions</div><ol class="steps">${r.instructions.map(s=>`<li>${s}</li>`).join("")}</ol>${r.notes?`<div class="notes">${r.notes}</div>`:""}</div>
  </div>
</div>`).join("")}`).join("")}
<div class="footer">
  <div class="footer-brand">Gathered</div>
  <div class="footer-tag">${EBOOK_FOOTER} · ${new Date().getFullYear()}</div>
</div>
</body></html>`;
};

// ─── AI PARSE ─────────────────────────────────────────────────────────────────
const parseFromImages = async (files) => {
  // Convert files to base64
  const images = await Promise.all(files.map(async (file) => {
    const b64 = await new Promise((res,rej)=>{ const r=new FileReader(); r.onload=()=>res(r.result.split(",")[1]); r.onerror=rej; r.readAsDataURL(file); });
    return { b64, mime: file.type };
  }));

  // Call our secure Vercel serverless function — no CORS, no exposed keys
  const res = await fetch("/api/scan", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ images }),
  });

  if (!res.ok) {
    const err = await res.json().catch(()=>({}));
    throw new Error(err?.error || `Error ${res.status}`);
  }

  const data = await res.json();
  return data.recipe;
};


// ─── SPRIG MARK ───────────────────────────────────────────────────────────────
function SprigMark({ size=32, color="#C9A84C" }) {
  return (
    <svg width={size} height={Math.round(size*1.4)} viewBox="0 0 48 67" fill="none">
      <line x1="24" y1="65" x2="24" y2="8" stroke={color} strokeWidth="2"/>
      <path d="M24 52 Q6 42 4 28" stroke={color} strokeWidth="2" fill="none"/>
      <path d="M24 38 Q4 28 2 14" stroke={color} strokeWidth="2" fill="none"/>
      <path d="M24 52 Q42 42 44 28" stroke={color} strokeWidth="2" fill="none"/>
      <path d="M24 38 Q44 28 46 14" stroke={color} strokeWidth="2" fill="none"/>
      <ellipse cx="24" cy="8" rx="6" ry="9" fill={color}/>
      <ellipse cx="15" cy="13" rx="5" ry="7" fill={color} opacity="0.8" transform="rotate(-22 15 13)"/>
      <ellipse cx="33" cy="13" rx="5" ry="7" fill={color} opacity="0.8" transform="rotate(22 33 13)"/>
    </svg>
  );
}

// ─── AUTH SCREEN ──────────────────────────────────────────────────────────────
function AuthScreen({ onAuth }) {
  const [mode, setMode] = useState("login"); // login | signup | reset
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setSuccess(""); setLoading(true);
    try {
      if (mode === "signup") {
        if (!name.trim()) { setError("Please enter your name."); setLoading(false); return; }
        const { data, error: err } = await supabase.auth.signUp({
          email, password,
          options: { data: { full_name: name.trim() } }
        });
        if (err) throw err;
        if (data.user) {
          setSuccess("Account created! Check your email to confirm, then sign in.");
          setMode("login");
        }
      } else if (mode === "login") {
        const { data, error: err } = await supabase.auth.signInWithPassword({ email, password });
        if (err) throw err;
        if (data.user) onAuth(data.user);
      } else if (mode === "reset") {
        const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: "https://usegathered.app"
        });
        if (err) throw err;
        setSuccess("Password reset email sent! Check your inbox.");
      }
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally { setLoading(false); }
  };

  return (
    <>
      <style>{CSS}</style>
      <div style={{minHeight:"100vh",display:"flex",background:B.black}}>
        {/* Left panel */}
        <div style={{flex:1,padding:"80px 64px",display:"flex",flexDirection:"column",justifyContent:"center",borderRight:`1px solid ${B.graphite}`}}>
          <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:32}}>
            <SprigMark size={36} color={B.gold}/>
            <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"0.85rem",letterSpacing:"0.45em",textTransform:"uppercase",color:B.gold}}>Gathered</div>
          </div>
          <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"4rem",fontWeight:300,color:B.white,lineHeight:1.05,marginBottom:20}}>
            Every recipe<br/>worth keeping.
          </div>
          <div style={{fontSize:"0.95rem",color:B.silver,fontWeight:300,lineHeight:1.8,marginBottom:44}}>
            Scan, save, and share the recipes that matter —<br/>then turn them into a beautiful ebook.
          </div>
          <div style={{width:36,height:1,background:B.gold,marginBottom:40}}/>
          <div style={{display:"flex",flexDirection:"column",gap:13}}>
            {[
              "AI recipe scanning from any photo",
              "Personalized ebook you can print or share",
              "SMS sharing in one tap",
              "Meal planning calendar — coming soon",
            ].map(f=>(
              <div key={f} style={{display:"flex",alignItems:"center",gap:12,fontSize:"0.87rem",color:B.fog,fontWeight:300}}>
                <span style={{color:B.gold,fontSize:"0.65rem"}}>✦</span>{f}
              </div>
            ))}
          </div>
        </div>

        {/* Right panel */}
        <div style={{width:460,padding:"80px 56px",display:"flex",alignItems:"center",justifyContent:"center"}}>
          <div style={{width:"100%"}}>
            {/* Mode toggle */}
            <div style={{display:"flex",gap:0,border:`1px solid ${B.graphite}`,borderRadius:3,overflow:"hidden",marginBottom:36}}>
              {["login","signup"].map(m=>(
                <button key={m} onClick={()=>{ setMode(m); setError(""); setSuccess(""); }}
                  style={{flex:1,padding:"10px 0",background:mode===m?B.gold:"none",color:mode===m?B.black:B.silver,border:"none",fontSize:"0.75rem",letterSpacing:"0.14em",textTransform:"uppercase",cursor:"pointer",fontFamily:"'Jost',sans-serif",fontWeight:mode===m?600:400,transition:"all 0.15s"}}>
                  {m==="login"?"Sign In":"Create Account"}
                </button>
              ))}
            </div>

            {mode==="reset" ? (
              <>
                <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"1.8rem",fontWeight:300,color:B.white,marginBottom:8}}>Reset Password</div>
                <div style={{fontSize:"0.82rem",color:B.mid,marginBottom:28,fontWeight:300}}>Enter your email and we'll send a reset link.</div>
              </>
            ) : (
              <>
                <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"2rem",fontWeight:300,color:B.white,marginBottom:8,lineHeight:1.1}}>
                  {mode==="login"?"Welcome back.":"Join Gathered."}
                </div>
                <div style={{fontSize:"0.82rem",color:B.mid,marginBottom:28,fontWeight:300}}>
                  {mode==="login"?"Sign in to your collection.":"Create your free account."}
                </div>
              </>
            )}

            {error && (
              <div style={{background:"rgba(139,26,26,0.15)",border:"1px solid rgba(139,26,26,0.4)",borderRadius:3,padding:"10px 14px",fontSize:"0.82rem",color:"#E88080",marginBottom:18}}>
                {error}
              </div>
            )}
            {success && (
              <div style={{background:"rgba(107,124,92,0.15)",border:"1px solid rgba(107,124,92,0.4)",borderRadius:3,padding:"10px 14px",fontSize:"0.82rem",color:"#A8C49A",marginBottom:18}}>
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {mode==="signup" && (
                <>
                  <label style={LS.lbl}>Your Name</label>
                  <input style={LS.inp} placeholder="CaLee" value={name} onChange={e=>setName(e.target.value)} autoFocus/>
                </>
              )}
              <label style={LS.lbl}>Email Address</label>
              <input style={LS.inp} type="email" placeholder="hello@usegathered.app" value={email} onChange={e=>setEmail(e.target.value)} autoFocus={mode!=="signup"}/>
              {mode!=="reset" && (
                <>
                  <label style={LS.lbl}>Password</label>
                  <input style={LS.inp} type="password" placeholder={mode==="signup"?"Create a strong password":"Your password"} value={password} onChange={e=>setPassword(e.target.value)}/>
                </>
              )}
              <button style={{...LS.btn, opacity:loading?0.7:1}} type="submit" disabled={loading}>
                {loading ? "Please wait…" : mode==="login" ? "Enter My Collection →" : mode==="signup" ? "Create My Account →" : "Send Reset Link →"}
              </button>
            </form>

            {mode==="login" && (
              <button onClick={()=>{ setMode("reset"); setError(""); setSuccess(""); }}
                style={{background:"none",border:"none",color:B.mid,fontSize:"0.78rem",cursor:"pointer",marginTop:16,fontFamily:"'Jost',sans-serif",display:"block",width:"100%",textAlign:"center"}}>
                Forgot your password?
              </button>
            )}
            {mode==="reset" && (
              <button onClick={()=>{ setMode("login"); setError(""); setSuccess(""); }}
                style={{background:"none",border:"none",color:B.mid,fontSize:"0.78rem",cursor:"pointer",marginTop:16,fontFamily:"'Jost',sans-serif",display:"block",width:"100%",textAlign:"center"}}>
                ← Back to sign in
              </button>
            )}

            <div style={{marginTop:24,fontSize:"0.72rem",color:B.mid,textAlign:"center",fontWeight:300,lineHeight:1.7}}>
              By creating an account you agree to our{" "}
              <span style={{color:B.gold,cursor:"pointer"}}>Terms of Service</span>
              {" "}and{" "}
              <span style={{color:B.gold,cursor:"pointer"}}>Privacy Policy</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── SHARE MODAL ──────────────────────────────────────────────────────────────
function ShareModal({ recipe, user, allRecipes, onClose }) {
  const [mode, setMode] = useState(recipe ? "single" : "collection");
  const [shareFormat, setShareFormat] = useState("card"); // "card" or "text"
  const [copied, setCopied] = useState(false);
  const [generating, setGenerating] = useState(false);
  const canvasRef = useRef(null);

  const text = mode==="single" ? fmtSMS(recipe, user.name) : fmtCollection(user, allRecipes);
  const copy = () => { navigator.clipboard.writeText(text).then(()=>{ setCopied(true); setTimeout(()=>setCopied(false),2500); }); };
  const openSMS = () => window.location.href = `sms:?body=${encodeURIComponent(text)}`;
  const openEbook = () => { const h=makeEbook(user,allRecipes); window.open(URL.createObjectURL(new Blob([h],{type:"text/html"})),"_blank"); };

  // Generate branded recipe card image using Canvas
  const generateCardImage = async (downloadOnly=false) => {
    if (!recipe) return null;
    setGenerating(true);

    const W = 1080, H = 2400;
    const canvas = document.createElement("canvas");
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext("2d");

    // Black background
    ctx.fillStyle = "#0A0A0A";
    ctx.fillRect(0, 0, W, H);

    // Gold border
    ctx.strokeStyle = "#C9A84C";
    ctx.lineWidth = 2;
    ctx.strokeRect(40, 40, W - 80, H - 80);
    ctx.strokeStyle = "rgba(201,168,76,0.3)";
    ctx.lineWidth = 1;
    ctx.strokeRect(56, 56, W - 112, H - 112);

    // Corner marks
    const cm = 70, cl = 120;
    ctx.strokeStyle = "#C9A84C";
    ctx.lineWidth = 3;
    for (const [x, y, dx, dy] of [[cm,cm,1,1],[W-cm,cm,-1,1],[cm,H-cm,1,-1],[W-cm,H-cm,-1,-1]]) {
      ctx.beginPath(); ctx.moveTo(x,y); ctx.lineTo(x+dx*cl, y); ctx.moveTo(x,y); ctx.lineTo(x, y+dy*cl); ctx.stroke();
    }

    // Sprig at top center (simplified)
    const sprigCx = W/2, sprigCy = 200;
    ctx.strokeStyle = "#C9A84C"; ctx.fillStyle = "#C9A84C"; ctx.lineWidth = 5;
    // Stem
    ctx.beginPath(); ctx.moveTo(sprigCx, sprigCy+90); ctx.lineTo(sprigCx, sprigCy-40); ctx.stroke();
    // Three grain ovals at top
    for (const offset of [-30, 0, 30]) {
      ctx.beginPath();
      ctx.ellipse(sprigCx + offset, sprigCy - 55, 15, 22, 0, 0, Math.PI*2);
      ctx.fill();
    }
    // Branches (curves)
    const drawBranch = (startY, length, side) => {
      ctx.beginPath();
      ctx.moveTo(sprigCx, startY);
      ctx.quadraticCurveTo(sprigCx + side*length*0.5, startY - 10, sprigCx + side*length, startY + 25);
      ctx.stroke();
    };
    drawBranch(sprigCy + 10, 45, -1);
    drawBranch(sprigCy + 10, 45, 1);
    drawBranch(sprigCy + 45, 60, -1);
    drawBranch(sprigCy + 45, 60, 1);
    drawBranch(sprigCy + 80, 75, -1);
    drawBranch(sprigCy + 80, 75, 1);

    // "FROM THE KITCHEN OF"
    ctx.fillStyle = "#C9A84C";
    ctx.font = "300 28px serif";
    ctx.textAlign = "center";
    ctx.fillText("FROM THE KITCHEN OF", W/2, 380);

    // User name (large script-style)
    ctx.fillStyle = "#F5F5F0";
    ctx.font = "300 68px serif";
    ctx.fillText(user.name, W/2, 460);

    // Gold rule
    ctx.strokeStyle = "rgba(201,168,76,0.5)"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(W/2 - 120, 500); ctx.lineTo(W/2 + 120, 500); ctx.stroke();

    // Recipe title (big)
    ctx.fillStyle = "#F5F5F0";
    ctx.font = "300 64px serif";
    const titleLines = wrapText(ctx, recipe.title, W - 240);
    let titleY = 600;
    titleLines.forEach(line => { ctx.fillText(line, W/2, titleY); titleY += 80; });

    // Meta info
    ctx.fillStyle = "#999999";
    ctx.font = "300 24px sans-serif";
    const meta = [`Serves ${recipe.servings}`, recipe.prepTime ? `Prep ${recipe.prepTime}` : null, recipe.cookTime ? `Cook ${recipe.cookTime}` : null].filter(Boolean).join("  ·  ");
    ctx.fillText(meta, W/2, titleY + 20);

    let y = titleY + 90;

    // INGREDIENTS section
    ctx.fillStyle = "#C9A84C";
    ctx.font = "400 20px sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("INGREDIENTS", 100, y);
    ctx.strokeStyle = "rgba(201,168,76,0.3)"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(100, y + 15); ctx.lineTo(W - 100, y + 15); ctx.stroke();
    y += 55;

    ctx.fillStyle = "#D0D0D0";
    ctx.font = "300 24px sans-serif";
    const maxIng = 12;
    const ingList = recipe.ingredients.slice(0, maxIng);
    ingList.forEach(ing => {
      const lines = wrapText(ctx, "\u2022 " + ing, W - 200);
      lines.forEach(l => { ctx.fillText(l, 100, y); y += 36; });
    });
    if (recipe.ingredients.length > maxIng) {
      ctx.fillStyle = "#999999";
      ctx.font = "italic 300 20px sans-serif";
      ctx.fillText(`+ ${recipe.ingredients.length - maxIng} more ingredients`, 100, y);
      y += 38;
    }

    // INSTRUCTIONS section
    y += 30;
    ctx.fillStyle = "#C9A84C";
    ctx.font = "400 20px sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("INSTRUCTIONS", 100, y);
    ctx.strokeStyle = "rgba(201,168,76,0.3)"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(100, y + 15); ctx.lineTo(W - 100, y + 15); ctx.stroke();
    y += 50;

    ctx.fillStyle = "#D0D0D0";
    ctx.font = "300 22px sans-serif";
    const maxSteps = 8;
    const stepList = recipe.instructions.slice(0, maxSteps);
    stepList.forEach((step, i) => {
      // Draw step number in gold
      ctx.fillStyle = "#C9A84C";
      ctx.font = "300 28px serif";
      ctx.fillText(`${i + 1}.`, 100, y);
      // Draw step text in light
      ctx.fillStyle = "#D0D0D0";
      ctx.font = "300 22px sans-serif";
      const lines = wrapText(ctx, step, W - 240);
      lines.forEach((l, li) => {
        ctx.fillText(l, 150, y);
        y += 32;
      });
      y += 8; // extra spacing between steps
    });
    if (recipe.instructions.length > maxSteps) {
      ctx.fillStyle = "#999999";
      ctx.font = "italic 300 20px sans-serif";
      ctx.fillText(`+ ${recipe.instructions.length - maxSteps} more steps \u2014 full recipe at usegathered.app`, 100, y);
      y += 38;
    }

    // Footer
    ctx.fillStyle = "#C9A84C";
    ctx.font = "300 22px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("GATHERED", W/2, H - 160);
    ctx.strokeStyle = "rgba(201,168,76,0.5)";
    ctx.beginPath(); ctx.moveTo(W/2 - 80, H - 140); ctx.lineTo(W/2 + 80, H - 140); ctx.stroke();
    ctx.fillStyle = "#999999";
    ctx.font = "300 20px sans-serif";
    ctx.fillText("usegathered.app  ·  @ByGathered", W/2, H - 105);
    ctx.fillStyle = "#555555";
    ctx.font = "italic 300 18px serif";
    ctx.fillText("Every recipe worth keeping.", W/2, H - 75);

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        if (downloadOnly) {
          const a = document.createElement("a");
          a.href = url;
          a.download = `${recipe.title.replace(/[^a-z0-9]/gi,"-").toLowerCase()}-gathered.png`;
          a.click();
        }
        setGenerating(false);
        resolve({ blob, url });
      }, "image/png");
    });
  };

  // Helper to wrap text on canvas
  function wrapText(ctx, text, maxWidth) {
    const words = text.split(" ");
    const lines = [];
    let current = "";
    for (const word of words) {
      const test = current ? current + " " + word : word;
      if (ctx.measureText(test).width <= maxWidth) {
        current = test;
      } else {
        if (current) lines.push(current);
        current = word;
      }
    }
    if (current) lines.push(current);
    return lines;
  }

  const downloadCard = () => { generateCardImage(true); };

  const shareCardNative = async () => {
    try {
      const result = await generateCardImage(false);
      if (result && navigator.share && navigator.canShare) {
        const file = new File([result.blob], `${recipe.title}-gathered.png`, { type: "image/png" });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({ files: [file], title: recipe.title, text: `From the Kitchen of ${user.name} · via Gathered` });
          return;
        }
      }
      // Fallback: download
      downloadCard();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={S.overlay} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{...S.shareBox, maxHeight:"90vh", overflowY:"auto"}}>
        <div style={S.modalTopBar}>
          <div style={S.modalHeading}>Share</div>
          <button style={S.xBtn} onClick={onClose}>✕</button>
        </div>

        {recipe && (
          <div style={{display:"flex",padding:"16px 24px 0",gap:8}}>
            {["single","collection"].map(m=>(
              <button key={m} onClick={()=>setMode(m)} style={{flex:1,padding:"9px 0",border:`1px solid ${mode===m?B.gold:B.smoke}`,background:mode===m?B.gold:"none",color:mode===m?B.black:B.silver,fontSize:"0.72rem",letterSpacing:"0.12em",textTransform:"uppercase",cursor:"pointer",borderRadius:3,fontFamily:"'Jost',sans-serif",fontWeight:mode===m?600:400}}>
                {m==="single" ? `${recipe.image} This Recipe` : `🗂 Full Collection (${allRecipes.length})`}
              </button>
            ))}
          </div>
        )}

        {/* Format toggle — Card vs Text (only for single recipe) */}
        {mode === "single" && recipe && (
          <div style={{display:"flex", gap:8, padding:"14px 24px 0"}}>
            <button onClick={()=>setShareFormat("card")} style={{flex:1, padding:"10px 0", border:`1px solid ${shareFormat==="card"?B.gold:B.smoke}`, background:shareFormat==="card"?"rgba(201,168,76,0.1)":"none", color:shareFormat==="card"?B.gold:B.silver, fontSize:"0.72rem", letterSpacing:"0.1em", cursor:"pointer", borderRadius:3, fontFamily:"'Jost',sans-serif", fontWeight:shareFormat==="card"?600:400}}>
              🌾 Branded Card
            </button>
            <button onClick={()=>setShareFormat("text")} style={{flex:1, padding:"10px 0", border:`1px solid ${shareFormat==="text"?B.gold:B.smoke}`, background:shareFormat==="text"?"rgba(201,168,76,0.1)":"none", color:shareFormat==="text"?B.gold:B.silver, fontSize:"0.72rem", letterSpacing:"0.1em", cursor:"pointer", borderRadius:3, fontFamily:"'Jost',sans-serif", fontWeight:shareFormat==="text"?600:400}}>
              💬 Text Message
            </button>
          </div>
        )}

        {/* CARD MODE — Branded image share */}
        {mode === "single" && shareFormat === "card" && recipe && (
          <div style={{padding:"18px 24px"}}>
            <div style={{background:B.graphite, border:`1px solid ${B.smoke}`, borderRadius:4, padding:"22px 20px", textAlign:"center"}}>
              <div style={{fontSize:"0.62rem", letterSpacing:"0.2em", textTransform:"uppercase", color:B.gold, marginBottom:10}}>Preview</div>
              <div style={{fontFamily:"'Cormorant Garamond',serif", color:B.white, fontSize:"1.3rem", fontWeight:300, marginBottom:4}}>From the Kitchen of {user.name}</div>
              <div style={{width:60, height:1, background:B.gold, margin:"10px auto", opacity:0.5}}/>
              <div style={{fontFamily:"'Cormorant Garamond',serif", color:B.gold, fontSize:"1.6rem", fontWeight:300, marginBottom:12}}>{recipe.title}</div>
              <div style={{fontSize:"0.7rem", color:B.silver, marginBottom:6}}>Serves {recipe.servings} · {recipe.ingredients.length} ingredients</div>
              <div style={{fontSize:"0.65rem", color:B.mid, fontStyle:"italic"}}>Beautifully branded card with Gathered mark · perfect for sharing</div>
            </div>

            <div style={{display:"flex", gap:10, marginTop:16}}>
              <button style={S.goldBtn} onClick={shareCardNative} disabled={generating}>
                {generating ? "Generating..." : "📲 Share Card"}
              </button>
              <button style={S.outlineBtn} onClick={downloadCard} disabled={generating}>
                {generating ? "..." : "⬇ Download"}
              </button>
            </div>
            <div style={{fontSize:"0.68rem", color:B.mid, textAlign:"center", marginTop:10, fontStyle:"italic"}}>
              Shares a beautiful image people can save · spreads Gathered with every share
            </div>
          </div>
        )}

        {/* TEXT MODE — original SMS text share */}
        {(mode === "collection" || shareFormat === "text") && (
          <>
            <div style={{margin:"16px 24px 0",background:B.graphite,border:`1px solid ${B.smoke}`,borderRadius:3,overflow:"hidden"}}>
              <div style={{padding:"8px 14px",fontSize:"0.6rem",letterSpacing:"0.25em",textTransform:"uppercase",color:B.mid,borderBottom:`1px solid ${B.smoke}`}}>Text / SMS Preview</div>
              <pre style={{padding:"14px",fontSize:"0.75rem",color:B.fog,fontFamily:"'Courier New',monospace",whiteSpace:"pre-wrap",maxHeight:210,overflowY:"auto",lineHeight:1.6}}>{text}</pre>
            </div>
            <div style={{display:"flex",gap:10,padding:"16px 24px"}}>
              <button style={S.goldBtn} onClick={openSMS}>💬 Open in Messages</button>
              <button style={{...S.outlineBtn,...(copied?{background:B.smoke,color:B.white,borderColor:B.smoke}:{})}} onClick={copy}>{copied?"✓ Copied":"📋 Copy Text"}</button>
            </div>
          </>
        )}

        {mode==="collection" && (
          <div style={{borderTop:`1px solid ${B.smoke}`,padding:"12px 24px 20px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <span style={{fontSize:"0.78rem",color:B.silver}}>Want a polished, printable version?</span>
            <button style={{background:"none",border:"none",color:B.gold,fontSize:"0.8rem",cursor:"pointer",fontFamily:"'Jost',sans-serif"}} onClick={openEbook}>Generate Ebook →</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── RECIPE MODAL ─────────────────────────────────────────────────────────────
function RecipeModal({ recipe, onClose, onShare, onEdit, onDelete, onPhotoUpload, servingMultiplier, setServingMultiplier, scaleIngredient, uploadingPhoto }) {
  const photoInputRef = useRef(null);
  const scaledServings = Math.round(recipe.servings * servingMultiplier * 10) / 10;

  return (
    <div style={S.overlay} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={S.recipeModal}>
        {recipe.photo_url && (
          <div style={{width:"100%", height:220, background:`url(${recipe.photo_url}) center/cover`, position:"relative", borderBottom:`1px solid ${B.smoke}`}}>
            <div style={{position:"absolute", inset:0, background:"linear-gradient(to bottom, transparent 40%, rgba(17,17,17,0.7) 100%)"}} />
          </div>
        )}

        <div style={{background:B.graphite,padding:"24px 28px 20px",display:"flex",alignItems:"flex-start",gap:16,borderBottom:`1px solid ${B.smoke}`,flexWrap:"wrap"}}>
          <div style={{fontSize:"2.6rem",flexShrink:0}}>{recipe.image}</div>
          <div style={{flex:1, minWidth:200}}>
            <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"1.7rem",fontWeight:300,color:B.white,lineHeight:1.1,marginBottom:10}}>{recipe.title}</div>
            <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:8}}>
              {recipe.prepTime && <span style={{fontSize:"0.7rem",color:B.silver,border:`1px solid ${B.smoke}`,padding:"4px 10px",borderRadius:2}}>Prep {recipe.prepTime}</span>}
              {recipe.cookTime && <span style={{fontSize:"0.7rem",color:B.silver,border:`1px solid ${B.smoke}`,padding:"4px 10px",borderRadius:2}}>Cook {recipe.cookTime}</span>}
              <span style={{fontSize:"0.7rem",color:B.silver,border:`1px solid ${B.smoke}`,padding:"4px 10px",borderRadius:2}}>Serves {scaledServings}</span>
            </div>
            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
              {recipe.tags?.map(t=><span key={t} style={{fontSize:"0.62rem",color:B.mid,letterSpacing:"0.08em"}}>#{t}</span>)}
            </div>
          </div>
          <div style={{display:"flex",gap:6,flexShrink:0,flexWrap:"wrap"}}>
            <button style={S.goldBtnSm} onClick={()=>onShare(recipe)}>Share</button>
            <button onClick={()=>onEdit(recipe)} style={{...S.goldBtnSm, background:"none", color:B.gold, border:`1px solid ${B.gold}`}}>Edit</button>
            <button onClick={()=>onDelete(recipe)} style={{...S.goldBtnSm, background:"none", color:"#C66", border:`1px solid #7A1515`}}>🗑</button>
            <button style={S.xBtn} onClick={onClose}>✕</button>
          </div>
        </div>

        {!recipe.photo_url && (
          <div style={{padding:"14px 28px", background:B.charcoal, borderBottom:`1px solid ${B.smoke}`, textAlign:"center"}}>
            <input type="file" accept="image/*" ref={photoInputRef} style={{display:"none"}} onChange={(e)=>{ if(e.target.files[0]) onPhotoUpload(recipe.id, e.target.files[0]); e.target.value=""; }} />
            <button onClick={()=>photoInputRef.current?.click()} disabled={uploadingPhoto} style={{padding:"8px 20px", background:"none", color:B.gold, border:`1px dashed ${B.goldBd}`, borderRadius:3, fontSize:"0.74rem", cursor:"pointer", fontFamily:"'Jost',sans-serif", letterSpacing:"0.08em"}}>
              {uploadingPhoto ? "Uploading..." : "📸 Add Finished Dish Photo"}
            </button>
          </div>
        )}

        <div style={{padding:"20px 28px 32px",overflowY:"auto"}}>
          <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:22, paddingBottom:16, borderBottom:`1px solid ${B.graphite}`, gap:10, flexWrap:"wrap"}}>
            <div style={{fontSize:"0.66rem", letterSpacing:"0.14em", textTransform:"uppercase", color:B.gold}}>Scale Recipe</div>
            <div style={{display:"flex", gap:4, background:B.charcoal, borderRadius:4, padding:3}}>
              {[0.5, 1, 2, 3].map(m => (
                <button key={m} onClick={()=>setServingMultiplier(m)} style={{padding:"6px 14px", background:servingMultiplier===m?B.gold:"transparent", color:servingMultiplier===m?B.black:B.silver, border:"none", borderRadius:3, fontSize:"0.72rem", fontWeight:servingMultiplier===m?600:400, cursor:"pointer", fontFamily:"'Jost',sans-serif", transition:"all 0.15s"}}>
                  {m === 0.5 ? "½×" : `${m}×`}
                </button>
              ))}
            </div>
          </div>

          <div style={{marginBottom:24}}>
            <div style={S.secLabel}>Ingredients</div>
            <ul style={{listStyle:"none"}}>
              {recipe.ingredients.map((ing,i)=>(
                <li key={i} style={{padding:"9px 0",borderBottom:`1px solid ${B.graphite}`,fontSize:"0.9rem",color:B.fog,display:"flex",gap:14,alignItems:"center"}}>
                  <span style={{width:4,height:4,borderRadius:"50%",background:B.gold,flexShrink:0,display:"inline-block"}}></span>
                  {scaleIngredient(ing, servingMultiplier)}
                </li>
              ))}
            </ul>
          </div>
          <div style={{marginBottom:24}}>
            <div style={S.secLabel}>Instructions</div>
            <ol style={{listStyle:"none"}}>
              {recipe.instructions.map((step,i)=>(
                <li key={i} style={{display:"flex",gap:18,padding:"12px 0",borderBottom:`1px solid ${B.graphite}`,fontSize:"0.92rem",color:B.fog,lineHeight:1.7}}>
                  <span style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"1.3rem",color:B.gold,minWidth:22,lineHeight:1}}>{i+1}</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>
          {recipe.notes && (
            <div style={{borderLeft:`2px solid ${B.gold}`,padding:"12px 18px",fontSize:"0.88rem",color:B.silver,fontStyle:"italic",background:"rgba(201,168,76,0.04)"}}>
              {recipe.notes}
            </div>
          )}

          {recipe.photo_url && (
            <div style={{marginTop:22, textAlign:"center"}}>
              <input type="file" accept="image/*" ref={photoInputRef} style={{display:"none"}} onChange={(e)=>{ if(e.target.files[0]) onPhotoUpload(recipe.id, e.target.files[0]); e.target.value=""; }} />
              <button onClick={()=>photoInputRef.current?.click()} disabled={uploadingPhoto} style={{padding:"8px 20px", background:"none", color:B.mid, border:`1px solid ${B.graphite}`, borderRadius:3, fontSize:"0.72rem", cursor:"pointer", fontFamily:"'Jost',sans-serif"}}>
                {uploadingPhoto ? "Uploading..." : "Replace Photo"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── EDIT RECIPE MODAL ────────────────────────────────────────────────────────
function EditRecipeModal({ recipe, onClose, onSave }) {
  const [form, setForm] = useState({
    title: recipe.title || "",
    category: recipe.category || "Dinner",
    tags: (recipe.tags || []).join(", "),
    servings: recipe.servings || 4,
    prepTime: recipe.prepTime || recipe.prep_time || "",
    cookTime: recipe.cookTime || recipe.cook_time || "",
    image: recipe.image || "🍽️",
    ingredients: (recipe.ingredients || []).join("\n"),
    instructions: (recipe.instructions || []).join("\n"),
    notes: recipe.notes || "",
  });

  const handleSave = () => {
    const updates = {
      title: form.title.trim(),
      category: form.category,
      tags: form.tags.split(",").map(t => t.trim()).filter(Boolean),
      servings: parseInt(form.servings) || 4,
      prepTime: form.prepTime,
      cookTime: form.cookTime,
      image: form.image || "🍽️",
      ingredients: form.ingredients.split("\n").map(s => s.trim()).filter(Boolean),
      instructions: form.instructions.split("\n").map(s => s.trim()).filter(Boolean),
      notes: form.notes,
    };
    onSave(recipe.id, updates);
  };

  const inputStyle = {
    width:"100%", padding:"10px 12px", background:B.charcoal, color:B.fog,
    border:`1px solid ${B.smoke}`, borderRadius:3, fontSize:"0.86rem",
    fontFamily:"'Jost',sans-serif", boxSizing:"border-box", outline:"none"
  };
  const labelStyle = {
    display:"block", fontSize:"0.64rem", letterSpacing:"0.14em",
    textTransform:"uppercase", color:B.gold, marginBottom:6, fontWeight:500
  };

  return (
    <div style={S.overlay} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{...S.shareBox, maxWidth:600, maxHeight:"90vh", overflowY:"auto"}}>
        <div style={{padding:"20px 28px", borderBottom:`1px solid ${B.smoke}`, display:"flex", justifyContent:"space-between", alignItems:"center", position:"sticky", top:0, background:B.graphite, zIndex:1}}>
          <div style={{color:B.white, fontFamily:"'Cormorant Garamond',serif", fontSize:"1.4rem", fontWeight:300}}>Edit Recipe</div>
          <button onClick={onClose} style={{background:"none", border:"none", color:B.silver, fontSize:"1.4rem", cursor:"pointer"}}>×</button>
        </div>
        <div style={{padding:"24px 28px"}}>
          <div style={{marginBottom:14}}>
            <label style={labelStyle}>Title</label>
            <input style={inputStyle} value={form.title} onChange={e=>setForm({...form,title:e.target.value})} />
          </div>
          <div style={{display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12, marginBottom:14}}>
            <div>
              <label style={labelStyle}>Emoji</label>
              <input style={inputStyle} value={form.image} onChange={e=>setForm({...form,image:e.target.value})} maxLength={2} />
            </div>
            <div>
              <label style={labelStyle}>Category</label>
              <select style={inputStyle} value={form.category} onChange={e=>setForm({...form,category:e.target.value})}>
                {CATEGORIES.filter(c=>c!=="All").map(c=><option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Servings</label>
              <input style={inputStyle} type="number" value={form.servings} onChange={e=>setForm({...form,servings:e.target.value})} />
            </div>
          </div>
          <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:14}}>
            <div>
              <label style={labelStyle}>Prep Time</label>
              <input style={inputStyle} value={form.prepTime} onChange={e=>setForm({...form,prepTime:e.target.value})} placeholder="15 minutes" />
            </div>
            <div>
              <label style={labelStyle}>Cook Time</label>
              <input style={inputStyle} value={form.cookTime} onChange={e=>setForm({...form,cookTime:e.target.value})} placeholder="30 minutes" />
            </div>
          </div>
          <div style={{marginBottom:14}}>
            <label style={labelStyle}>Tags (comma separated)</label>
            <input style={inputStyle} value={form.tags} onChange={e=>setForm({...form,tags:e.target.value})} placeholder="cookies, bars, family favorite" />
          </div>
          <div style={{marginBottom:14}}>
            <label style={labelStyle}>Ingredients (one per line)</label>
            <textarea style={{...inputStyle, minHeight:140, resize:"vertical", fontFamily:"'Jost',sans-serif"}} value={form.ingredients} onChange={e=>setForm({...form,ingredients:e.target.value})} />
          </div>
          <div style={{marginBottom:14}}>
            <label style={labelStyle}>Instructions (one step per line)</label>
            <textarea style={{...inputStyle, minHeight:140, resize:"vertical", fontFamily:"'Jost',sans-serif"}} value={form.instructions} onChange={e=>setForm({...form,instructions:e.target.value})} />
          </div>
          <div style={{marginBottom:18}}>
            <label style={labelStyle}>Notes</label>
            <textarea style={{...inputStyle, minHeight:70, resize:"vertical", fontFamily:"'Jost',sans-serif"}} value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} placeholder="Any special notes..." />
          </div>
          <div style={{display:"flex", gap:10}}>
            <button onClick={onClose} style={{flex:1, padding:"12px", background:"none", color:B.silver, border:`1px solid ${B.smoke}`, borderRadius:3, fontSize:"0.8rem", letterSpacing:"0.08em", cursor:"pointer", fontFamily:"'Jost',sans-serif"}}>Cancel</button>
            <button onClick={handleSave} style={{flex:1, padding:"12px", background:B.gold, color:B.black, border:"none", borderRadius:3, fontSize:"0.8rem", fontWeight:600, letterSpacing:"0.08em", cursor:"pointer", fontFamily:"'Jost',sans-serif"}}>Save Changes</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── DELETE CONFIRMATION MODAL ────────────────────────────────────────────────
function DeleteRecipeModal({ recipe, onClose, onConfirm }) {
  return (
    <div style={S.overlay} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{...S.shareBox, maxWidth:420}}>
        <div style={{padding:"32px 28px 20px", textAlign:"center"}}>
          <div style={{fontSize:"2.5rem", marginBottom:12}}>🗑️</div>
          <div style={{color:B.white, fontFamily:"'Cormorant Garamond',serif", fontSize:"1.6rem", fontWeight:300, marginBottom:10}}>
            Delete Recipe?
          </div>
          <div style={{color:B.silver, fontSize:"0.88rem", lineHeight:1.5, marginBottom:6}}>
            This will permanently remove <strong style={{color:B.white}}>{recipe.title}</strong> from your collection.
          </div>
          <div style={{color:B.mid, fontSize:"0.76rem", fontStyle:"italic"}}>
            This action cannot be undone.
          </div>
        </div>
        <div style={{padding:"0 28px 28px", display:"flex", gap:10}}>
          <button onClick={onClose} style={{flex:1, padding:"12px", background:"none", color:B.silver, border:`1px solid ${B.smoke}`, borderRadius:3, fontSize:"0.8rem", letterSpacing:"0.08em", cursor:"pointer", fontFamily:"'Jost',sans-serif"}}>Cancel</button>
          <button onClick={()=>onConfirm(recipe)} style={{flex:1, padding:"12px", background:"#7A1515", color:B.white, border:"none", borderRadius:3, fontSize:"0.8rem", fontWeight:600, letterSpacing:"0.08em", cursor:"pointer", fontFamily:"'Jost',sans-serif"}}>Delete</button>
        </div>
      </div>
    </div>
  );
}

// ─── UPGRADE MODAL ────────────────────────────────────────────────────────────
function UpgradeModal({ onClose, onUpgrade, recipeCount }) {
  return (
    <div style={S.overlay} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{...S.shareBox,maxWidth:440}}>
        <div style={{padding:"36px 32px 28px",textAlign:"center",borderBottom:`1px solid ${B.smoke}`}}>
          <div style={{display:"flex",justifyContent:"center",marginBottom:18}}>
            <SprigMark size={44} color={B.gold}/>
          </div>
          <div style={{fontSize:"0.6rem",letterSpacing:"0.3em",textTransform:"uppercase",color:B.gold,marginBottom:10}}>Gathered Pro</div>
          <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"2rem",fontWeight:300,color:B.white,lineHeight:1.15,marginBottom:12}}>
            Every recipe<br/>worth keeping.
          </div>
          <div style={{fontSize:"0.84rem",color:B.silver,fontWeight:300,lineHeight:1.7}}>
            {recipeCount >= FREE_RECIPE_LIMIT
              ? `You've gathered all ${FREE_RECIPE_LIMIT} of your free recipes. Upgrade to keep building your collection.`
              : "Unlock unlimited recipes, your personalized ebook, meal planning and more."}
          </div>
        </div>

        <div style={{padding:"24px 32px"}}>
          <div style={{display:"flex",alignItems:"baseline",justifyContent:"center",gap:6,marginBottom:22}}>
            <span style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"3rem",color:B.gold,lineHeight:1,fontWeight:300}}>$9.99</span>
            <span style={{fontSize:"0.82rem",color:B.mid}}>/month</span>
          </div>

          <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:24}}>
            {[
              "Unlimited recipes + AI scanning",
              "Personalized ebook generation",
              "SMS sharing & export",
              "Meal planner + grocery list (V2)",
              "Cancel anytime",
            ].map(f=>(
              <div key={f} style={{display:"flex",alignItems:"center",gap:11,fontSize:"0.86rem",color:B.fog,fontWeight:300}}>
                <span style={{color:B.gold,fontSize:"0.7rem"}}>✦</span>{f}
              </div>
            ))}
          </div>

          <button onClick={onUpgrade}
            style={{width:"100%",padding:"14px",background:B.gold,color:B.black,border:"none",borderRadius:3,fontSize:"0.84rem",fontWeight:600,letterSpacing:"0.12em",textTransform:"uppercase",cursor:"pointer",marginBottom:10,fontFamily:"'Jost',sans-serif"}}>
            Upgrade to Pro →
          </button>
          <button onClick={onClose}
            style={{width:"100%",padding:"10px",background:"none",color:B.mid,border:"none",fontSize:"0.76rem",cursor:"pointer",fontFamily:"'Jost',sans-serif"}}>
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── MEAL PLANNER TAB ─────────────────────────────────────────────────────────
function MealPlannerTab({ recipes }) {
  const today = new Date();
  const dow = ["SUN","MON","TUE","WED","THU","FRI","SAT"];
  const sow = new Date(today); sow.setDate(today.getDate()-today.getDay());
  const week = Array.from({length:7},(_,i)=>{ const d=new Date(sow); d.setDate(sow.getDate()+i); return d; });

  const groceryPreview = {
    "🥩 Meat & Seafood": ["3 lb chuck roast","1 lb ground chicken"],
    "🥬 Produce": ["4 carrots","4 potatoes","1 onion","3 Thai chilies","1 cup Thai basil","1 lemon"],
    "🧀 Dairy & Refrigerated": ["3/4 cup heavy cream","6 tbsp butter"],
    "🥫 Pantry & Dry Goods": ["2 cups all-purpose flour","1/3 cup sugar","2 cups beef broth","2 tbsp oyster sauce","1 tbsp soy sauce","1 tsp fish sauce","2 tbsp Worcestershire sauce"],
    "🧂 Spices & Staples": ["Salt & pepper","1 tbsp baking powder","1 tsp sugar","2 tbsp oil"],
  };

  return (
    <div style={{padding:"40px",maxWidth:1400,margin:"0 auto"}}>
      <div style={{background:B.charcoal,border:`1px solid ${B.goldBd}`,borderRadius:6,marginBottom:44}}>
        <div style={{padding:"36px 44px"}}>
          <div style={{display:"inline-block",fontSize:"0.6rem",letterSpacing:"0.3em",color:B.gold,border:`1px solid ${B.goldD}`,padding:"4px 14px",borderRadius:2,marginBottom:16,textTransform:"uppercase"}}>Coming in V2</div>
          <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"2.5rem",fontWeight:300,color:B.white,marginBottom:10}}>Meal Planner + Smart Grocery List</div>
          <div style={{fontSize:"0.88rem",color:B.silver,fontWeight:300,lineHeight:1.8,marginBottom:30,maxWidth:640}}>
            Plan your week by dropping recipes onto any day. Gathered builds your grocery list automatically — ingredients combined, quantities scaled, grouped by aisle — then sends it straight to your phone.
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(270px,1fr))",gap:10}}>
            {[
              ["📅","Drag & drop recipes onto any day or week"],
              ["📲","Export meal plan to Apple or Google Calendar"],
              ["🔗","Deep link opens full recipe inside Gathered"],
              ["🛒","AI grocery list — combined, scaled & aisle-sorted"],
              ["📋","Send list to phone Reminders or via SMS"],
              ["🔔","Optional meal reminder notifications"],
            ].map(([icon,txt])=>(
              <div key={txt} style={{display:"flex",alignItems:"center",gap:14,background:B.graphite,padding:"12px 18px",borderRadius:3}}>
                <span style={{fontSize:"1.15rem"}}>{icon}</span>
                <span style={{fontSize:"0.83rem",color:B.fog,fontWeight:300}}>{txt}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 320px",gap:28,marginBottom:36}}>
        <div>
          <div style={{fontSize:"0.6rem",letterSpacing:"0.28em",textTransform:"uppercase",color:B.mid,marginBottom:14}}>
            Preview — Week of {today.toLocaleDateString("en-US",{month:"long",day:"numeric"}).toUpperCase()}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:6,marginBottom:20}}>
            {week.map((d,i)=>{
              const isT = d.toDateString()===today.toDateString();
              return (
                <div key={i} style={{background:B.charcoal,border:`1px solid ${isT?B.goldD:B.smoke}`,borderRadius:3,overflow:"hidden",opacity:isT?1:0.6}}>
                  <div style={{padding:"8px 6px",borderBottom:`1px solid ${B.smoke}`,textAlign:"center"}}>
                    <div style={{fontSize:"0.52rem",letterSpacing:"0.18em",textTransform:"uppercase",color:isT?B.gold:B.mid,marginBottom:3}}>{dow[i]}</div>
                    <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"1.3rem",color:isT?B.white:B.silver,lineHeight:1}}>{d.getDate()}</div>
                  </div>
                  <div style={{padding:"6px 5px"}}>
                    {["Breakfast","Lunch","Dinner"].map(m=>(
                      <div key={m} style={{marginBottom:4}}>
                        <div style={{fontSize:"0.48rem",letterSpacing:"0.12em",textTransform:"uppercase",color:B.mid,marginBottom:2}}>{m}</div>
                        {isT && m==="Dinner" ? (
                          <div style={{background:"rgba(201,168,76,0.08)",border:`1px solid ${B.goldD}`,borderRadius:2,padding:"4px 5px",fontSize:"0.62rem",color:B.gold,lineHeight:1.3}}>🥩 Pot Roast</div>
                        ) : (
                          <div style={{background:B.graphite,borderRadius:2,height:28,display:"flex",alignItems:"center",justifyContent:"center",border:`1px dashed ${B.smoke}`}}>
                            <span style={{color:B.smoke,fontSize:"0.75rem"}}>+</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{marginBottom:8}}>
            <div style={{fontSize:"0.6rem",letterSpacing:"0.28em",textTransform:"uppercase",color:B.mid,marginBottom:10}}>Your Recipes — Drag to Calendar</div>
            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
              {recipes.map(r=>(
                <div key={r.id} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 14px",background:B.charcoal,border:`1px solid ${B.smoke}`,borderRadius:3,opacity:0.65,cursor:"not-allowed"}}>
                  <span style={{fontSize:"1.2rem"}}>{r.image}</span>
                  <div>
                    <div style={{fontSize:"0.82rem",color:B.fog}}>{r.title}</div>
                    <div style={{fontSize:"0.68rem",color:B.mid,marginTop:1}}>{r.category} · {r.prepTime}</div>
                  </div>
                </div>
              ))}
              {recipes.length===0 && <div style={{fontSize:"0.82rem",color:B.mid,padding:"10px 0"}}>Add recipes to your collection first</div>}
            </div>
          </div>
        </div>

        <div>
          <div style={{fontSize:"0.6rem",letterSpacing:"0.28em",textTransform:"uppercase",color:B.mid,marginBottom:14}}>AI Grocery List — Preview</div>
          <div style={{background:B.charcoal,border:`1px solid ${B.smoke}`,borderRadius:6,overflow:"hidden"}}>
            <div style={{padding:"14px 18px",borderBottom:`1px solid ${B.smoke}`,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <div>
                <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"1.05rem",color:B.white}}>This Week's List</div>
                <div style={{fontSize:"0.68rem",color:B.mid,marginTop:2}}>3 recipes · 21 items</div>
              </div>
              <div style={{fontSize:"0.6rem",letterSpacing:"0.15em",textTransform:"uppercase",color:B.gold,border:`1px solid ${B.goldD}`,padding:"3px 10px",borderRadius:2}}>Demo</div>
            </div>
            <div style={{maxHeight:340,overflowY:"auto"}}>
              {Object.entries(groceryPreview).map(([aisle,items])=>(
                <div key={aisle} style={{borderBottom:`1px solid ${B.graphite}`}}>
                  <div style={{padding:"8px 18px 4px",fontSize:"0.65rem",letterSpacing:"0.15em",textTransform:"uppercase",color:B.gold,background:B.graphite}}>{aisle}</div>
                  {items.map((item,i)=>(
                    <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"7px 18px",borderBottom:`1px solid ${B.graphite}`}}>
                      <div style={{width:14,height:14,border:`1px solid ${B.smoke}`,borderRadius:2,flexShrink:0}}/>
                      <span style={{fontSize:"0.82rem",color:B.fog,fontWeight:300}}>{item}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
            <div style={{padding:"12px 14px",borderTop:`1px solid ${B.smoke}`,display:"flex",gap:8}}>
              <div style={{flex:1,padding:"9px 0",background:B.gold,color:B.black,borderRadius:3,fontSize:"0.72rem",fontWeight:600,letterSpacing:"0.08em",textAlign:"center",opacity:0.5,cursor:"not-allowed"}}>📲 Send to Phone</div>
              <div style={{flex:1,padding:"9px 0",background:"none",color:B.silver,border:`1px solid ${B.smoke}`,borderRadius:3,fontSize:"0.72rem",letterSpacing:"0.06em",textAlign:"center",opacity:0.5,cursor:"not-allowed"}}>💬 Send via SMS</div>
            </div>
            <div style={{padding:"10px 14px",background:B.graphite,borderTop:`1px solid ${B.smoke}`}}>
              <div style={{fontSize:"0.7rem",color:B.mid,textAlign:"center",lineHeight:1.6}}>✦ AI combines quantities · removes duplicates · sorts by aisle</div>
            </div>
          </div>
        </div>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
        <div style={{display:"flex",gap:18,background:B.graphite,border:`1px solid ${B.smoke}`,borderRadius:4,padding:"22px 24px"}}>
          <div style={{fontSize:"1.6rem",flexShrink:0,marginTop:2}}>📲</div>
          <div>
            <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"1.05rem",color:B.white,marginBottom:8}}>Phone Calendar Integration</div>
            <div style={{fontSize:"0.82rem",color:B.silver,fontWeight:300,lineHeight:1.8}}>Drop a recipe on a day and Gathered creates a calendar event with a deep link — <span style={{color:B.gold,fontFamily:"monospace",fontSize:"0.78rem"}}>gathered://recipe/123</span> — that opens the full recipe in-app. One tap from your reminder straight to the recipe.</div>
          </div>
        </div>
        <div style={{display:"flex",gap:18,background:B.graphite,border:`1px solid ${B.smoke}`,borderRadius:4,padding:"22px 24px"}}>
          <div style={{fontSize:"1.6rem",flexShrink:0,marginTop:2}}>🛒</div>
          <div>
            <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"1.05rem",color:B.white,marginBottom:8}}>AI Grocery List</div>
            <div style={{fontSize:"0.82rem",color:B.silver,fontWeight:300,lineHeight:1.8}}>Gathered reads every recipe in your meal plan, combines duplicate ingredients, scales quantities, and groups everything by grocery store aisle. One tap sends the list to your phone's Reminders app or via SMS.</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [subscription, setSubscription] = useState({ tier: "free", status: "free" });
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [recipes, setRecipes] = useState([]);
  const [editingRecipe, setEditingRecipe] = useState(null);
  const [deletingRecipe, setDeletingRecipe] = useState(null);
  const [servingMultiplier, setServingMultiplier] = useState(1);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [loadingRecipes, setLoadingRecipes] = useState(false);
  const [tab, setTab] = useState("Collection");
  const [cat, setCat] = useState("All");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [shareTarget, setShareTarget] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState(null);
  const fileRef = useRef();

  const showToast = (msg, type="ok") => { setToast({msg,type}); setTimeout(()=>setToast(null),3200); };

  // ── Auth listener ──────────────────────────────────────────────────────────
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) loadUser(session.user);
      setLoadingAuth(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) { loadUser(session.user); }
      else { setUser(null); setRecipes([]); }
    });
    return () => subscription.unsubscribe();
  }, []);

  const loadUser = async (authUser) => {
    const name = authUser.user_metadata?.full_name || authUser.email.split("@")[0];
    const avatar = name.slice(0,2).toUpperCase();
    setUser({ id: authUser.id, name, avatar, email: authUser.email });
    loadRecipes(authUser.id);
    loadSubscription(authUser.id);
  };

  const loadSubscription = async (userId) => {
    const { data } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();
    if (data) setSubscription({ tier: data.tier || "free", status: data.status || "free", customerId: data.stripe_customer_id });
    else setSubscription({ tier: "free", status: "free" });
  };

  const isPro = subscription.tier === "pro" && (subscription.status === "active" || subscription.status === "trialing");

  const handleUpgrade = async () => {
    try {
      const res = await fetch("/api/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, userEmail: user.email }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else showToast("Couldn\'t open checkout. Please try again.", "err");
    } catch {
      showToast("Something went wrong. Please try again.", "err");
    }
  };

  const handleManageBilling = async () => {
    if (!subscription.customerId) return showToast("No billing info found.", "err");
    try {
      const res = await fetch("/api/customer-portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerId: subscription.customerId }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch {
      showToast("Couldn\'t open billing portal.", "err");
    }
  };

  // Check for upgrade success in URL after Stripe redirect
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("upgraded") === "true") {
      showToast("Welcome to Gathered Pro! 🌾", "ok");
      setTimeout(() => { if (user) loadSubscription(user.id); }, 2000);
      window.history.replaceState({}, "", "/");
    }
    if (params.get("upgrade_canceled") === "true") {
      window.history.replaceState({}, "", "/");
    }
  }, [user]);

  // ── Recipes CRUD ───────────────────────────────────────────────────────────
  const loadRecipes = async (userId) => {
    setLoadingRecipes(true);
    const { data, error } = await supabase
      .from("recipes")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (!error && data) setRecipes(data);
    setLoadingRecipes(false);
  };

  const saveRecipe = async (parsed) => {
    const recipe = {
      user_id: user.id,
      title: parsed.title,
      category: parsed.category,
      tags: parsed.tags,
      servings: parsed.servings,
      prep_time: parsed.prepTime,
      cook_time: parsed.cookTime,
      image: parsed.image,
      ingredients: parsed.ingredients,
      instructions: parsed.instructions,
      notes: parsed.notes || "",
    };
    const { data, error } = await supabase.from("recipes").insert([recipe]).select();
    if (!error && data) {
      setRecipes(prev => [{ ...data[0], prepTime: data[0].prep_time, cookTime: data[0].cook_time }, ...prev]);
      showToast("Recipe added to your Gathered collection");
    } else {
      showToast("Failed to save recipe. Please try again.", "err");
    }
  };

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setUploading(true);
    try {
      const parsed = await parseFromImages(files);
      if (!parsed.title) throw new Error("No recipe found");
      await saveRecipe(parsed);
    } catch (err) {
      const msg = err.message?.includes("No recipe")
        ? "No recipe found in those photos. Try clearer images."
        : err.message?.includes("API error")
        ? "Service unavailable. Please try again in a moment."
        : "Couldn't read that image. Try a brighter, less cropped photo.";
      showToast(msg, "err");
    }
    finally { setUploading(false); e.target.value=""; }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setSidebarOpen(false);
  };

  const handleDeleteRecipe = async (recipe) => {
    const { error } = await supabase.from("recipes").delete().eq("id", recipe.id);
    if (!error) {
      setRecipes(prev => prev.filter(r => r.id !== recipe.id));
      setDeletingRecipe(null);
      setSelected(null);
      showToast("Recipe deleted");
    } else {
      showToast("Couldn\'t delete recipe. Try again.", "err");
    }
  };

  const handleUpdateRecipe = async (recipeId, updates) => {
    // Convert camelCase to snake_case for Supabase columns
    const dbUpdates = {
      title: updates.title,
      category: updates.category,
      tags: updates.tags,
      servings: updates.servings,
      prep_time: updates.prepTime,
      cook_time: updates.cookTime,
      image: updates.image,
      ingredients: updates.ingredients,
      instructions: updates.instructions,
      notes: updates.notes,
    };
    const { data, error } = await supabase.from("recipes").update(dbUpdates).eq("id", recipeId).select();
    if (!error && data) {
      setRecipes(prev => prev.map(r => r.id === recipeId ? { ...data[0], prepTime: data[0].prep_time, cookTime: data[0].cook_time } : r));
      setEditingRecipe(null);
      if (selected && selected.id === recipeId) {
        setSelected({ ...data[0], prepTime: data[0].prep_time, cookTime: data[0].cook_time });
      }
      showToast("Recipe updated");
    } else {
      showToast("Couldn\'t update recipe. Try again.", "err");
    }
  };

  const handlePhotoUpload = async (recipeId, file) => {
    if (!file || !user) return;
    setUploadingPhoto(true);
    try {
      const ext = file.name.split(".").pop();
      const fileName = `${user.id}/${recipeId}-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("recipe-photos").upload(fileName, file, { upsert: true });
      if (upErr) throw upErr;
      const { data: urlData } = supabase.storage.from("recipe-photos").getPublicUrl(fileName);
      const photoUrl = urlData.publicUrl;
      const { error: updErr } = await supabase.from("recipes").update({ photo_url: photoUrl }).eq("id", recipeId);
      if (updErr) throw updErr;
      setRecipes(prev => prev.map(r => r.id === recipeId ? { ...r, photo_url: photoUrl } : r));
      if (selected && selected.id === recipeId) {
        setSelected(prev => ({ ...prev, photo_url: photoUrl }));
      }
      showToast("Photo added");
    } catch (err) {
      console.error(err);
      showToast("Couldn\'t upload photo. Try again.", "err");
    } finally {
      setUploadingPhoto(false);
    }
  };

  // Scale ingredient amounts for serving size toggle
  const scaleIngredient = (ingredient, multiplier) => {
    if (multiplier === 1 || !ingredient) return ingredient;
    // Match leading number, fraction, or mixed number (e.g. "2", "1/2", "1 1/2", "2.5")
    return ingredient.replace(/^(\d+\s+\d+\/\d+|\d+\/\d+|\d*\.\d+|\d+)/, (match) => {
      let value;
      if (match.includes(" ")) {
        // Mixed number like "1 1/2"
        const [whole, frac] = match.split(" ");
        const [num, den] = frac.split("/");
        value = parseInt(whole) + parseInt(num) / parseInt(den);
      } else if (match.includes("/")) {
        const [num, den] = match.split("/");
        value = parseInt(num) / parseInt(den);
      } else {
        value = parseFloat(match);
      }
      const scaled = value * multiplier;
      // Format nicely — use fractions for common values
      if (scaled === Math.floor(scaled)) return String(scaled);
      // Check for common fractions
      const rounded = Math.round(scaled * 100) / 100;
      const whole = Math.floor(rounded);
      const decimal = rounded - whole;
      const fractions = { 0.25: "1/4", 0.33: "1/3", 0.5: "1/2", 0.67: "2/3", 0.75: "3/4" };
      for (const [dec, frac] of Object.entries(fractions)) {
        if (Math.abs(decimal - parseFloat(dec)) < 0.05) {
          return whole > 0 ? `${whole} ${frac}` : frac;
        }
      }
      return rounded.toString();
    });
  };

  // ── Normalize recipe fields ────────────────────────────────────────────────
  const normalize = (r) => ({
    ...r,
    prepTime: r.prepTime || r.prep_time || "",
    cookTime: r.cookTime || r.cook_time || "",
    photo_url: r.photo_url || null,
  });

  const filtered = recipes.map(normalize).filter(r => {
    const mc = cat==="All" || r.category===cat;
    const mq = !search || r.title?.toLowerCase().includes(search.toLowerCase()) || r.tags?.some(t=>t?.toLowerCase().includes(search.toLowerCase()));
    return mc && mq;
  });

  // ── Loading auth ───────────────────────────────────────────────────────────
  if (loadingAuth) return (
    <>
      <style>{CSS}</style>
      <div style={{minHeight:"100vh",background:B.black,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:20}}>
        <SprigMark size={48} color={B.gold}/>
        <div style={{fontSize:"0.7rem",letterSpacing:"0.3em",textTransform:"uppercase",color:B.mid}}>Loading Gathered…</div>
      </div>
    </>
  );

  // ── Not logged in ──────────────────────────────────────────────────────────
  if (!session) return <AuthScreen onAuth={loadUser}/>;

  // ── App ────────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{CSS}</style>
      <div style={{minHeight:"100vh",display:"flex",flexDirection:"column",background:B.black}}>

        {/* NAV */}
        <header style={{height:58,borderBottom:`1px solid ${B.graphite}`,display:"flex",alignItems:"center",padding:"0 24px",flexShrink:0,gap:16}}>
          <button onClick={()=>setSidebarOpen(o=>!o)}
            style={{background:"none",border:"none",cursor:"pointer",padding:"6px 8px",display:"flex",flexDirection:"column",gap:5,flexShrink:0}}
            aria-label="Menu">
            <span style={{display:"block",width:20,height:1.5,background:sidebarOpen?B.gold:B.silver,transition:"all 0.25s",transform:sidebarOpen?"rotate(45deg) translate(4px,4.5px)":"none"}}/>
            <span style={{display:"block",width:20,height:1.5,background:sidebarOpen?B.gold:B.silver,transition:"all 0.25s",opacity:sidebarOpen?0:1}}/>
            <span style={{display:"block",width:20,height:1.5,background:sidebarOpen?B.gold:B.silver,transition:"all 0.25s",transform:sidebarOpen?"rotate(-45deg) translate(4px,-4.5px)":"none"}}/>
          </button>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <SprigMark size={26} color={B.gold}/>
            <span style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"1.1rem",letterSpacing:"0.06em",color:B.white}}>{APP_NAME}</span>
          </div>
          <div style={{display:"flex",border:`1px solid ${B.graphite}`,borderRadius:3,overflow:"hidden",marginLeft:"auto"}}>
            {TABS.map(t=>(
              <button key={t} onClick={()=>setTab(t)} style={{padding:"7px 14px",background:tab===t?B.gold:"none",color:tab===t?B.black:B.silver,border:"none",fontSize:"0.7rem",letterSpacing:"0.1em",textTransform:"uppercase",cursor:"pointer",fontFamily:"'Jost',sans-serif",fontWeight:tab===t?600:400,transition:"all 0.15s",whiteSpace:"nowrap",flexShrink:0}}>{t}</button>
            ))}
          </div>
          <div style={{display:"flex",alignItems:"center",gap:10,marginLeft:16}}>
            <div style={{width:30,height:30,borderRadius:"50%",border:`1px solid ${B.gold}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"0.68rem",color:B.gold,fontWeight:600}}>{user?.avatar}</div>
            <div style={{fontSize:"0.8rem",color:B.silver}}>{user?.name}</div>
          </div>
        </header>

        <div style={{flex:1,display:"flex",overflow:"hidden",position:"relative"}}>
          {tab==="Collection" ? (
            <>
              {sidebarOpen && (
                <div onClick={()=>setSidebarOpen(false)}
                  style={{position:"fixed",inset:0,top:58,background:"rgba(0,0,0,0.6)",zIndex:40,backdropFilter:"blur(2px)"}}/>
              )}
              <aside style={{
                position:"fixed",top:58,left:0,bottom:0,width:196,
                background:B.charcoal,borderRight:`1px solid ${B.graphite}`,
                display:"flex",flexDirection:"column",zIndex:50,
                transform:sidebarOpen?"translateX(0)":"translateX(-100%)",
                transition:"transform 0.28s cubic-bezier(0.4,0,0.2,1)",
                overflowY:"auto",
                boxShadow:sidebarOpen?"4px 0 28px rgba(0,0,0,0.5)":"none",
              }}>
                <div style={{padding:"16px 14px 12px",borderBottom:`1px solid ${B.graphite}`}}>
                  <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
                    <div style={{width:28,height:28,borderRadius:"50%",border:`1px solid ${B.gold}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"0.65rem",color:B.gold,fontWeight:600,flexShrink:0}}>{user?.avatar}</div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{color:B.white,fontSize:"0.82rem",fontWeight:500}}>{user?.name}</div>
                      <div style={{color:B.mid,fontSize:"0.64rem",marginTop:1}}>
                        {recipes.length}{!isPro?`/${FREE_RECIPE_LIMIT}`:""} recipe{recipes.length!==1?"s":""}
                      </div>
                    </div>
                  </div>
                  <div style={{display:"inline-block",fontSize:"0.56rem",letterSpacing:"0.18em",textTransform:"uppercase",padding:"3px 9px",borderRadius:2,background:isPro?B.gold:"transparent",color:isPro?B.black:B.mid,border:isPro?"none":`1px solid ${B.smoke}`,fontWeight:600}}>
                    {isPro ? "✦ Pro" : "Free"}
                  </div>
                </div>
                <div style={{padding:"14px 12px 8px"}}>
                  <div style={{fontSize:"0.56rem",letterSpacing:"0.28em",textTransform:"uppercase",color:B.mid,marginBottom:8}}>Categories</div>
                  {CATEGORIES.map(c=>(
                    <button key={c} onClick={()=>{ setCat(c); setSidebarOpen(false); }}
                      style={{display:"block",width:"100%",textAlign:"left",padding:"7px 10px",background:cat===c?"rgba(201,168,76,0.08)":"none",border:"none",fontSize:"0.82rem",color:cat===c?B.gold:B.silver,cursor:"pointer",borderRadius:3,marginBottom:1,fontFamily:"'Jost',sans-serif",borderLeft:cat===c?`2px solid ${B.gold}`:"2px solid transparent",paddingLeft:cat===c?8:10,transition:"all 0.15s"}}>
                      {c}
                    </button>
                  ))}
                </div>
                <div style={{height:1,background:B.graphite,margin:"6px 12px 12px"}}/>
                <div style={{padding:"0 12px 12px"}}>
                  <div style={{fontSize:"0.56rem",letterSpacing:"0.28em",textTransform:"uppercase",color:B.mid,marginBottom:8}}>Actions</div>
                  <input type="file" accept="image/*" multiple ref={fileRef} style={{display:"none"}} onChange={handleUpload}/>
                  <button onClick={()=>{ fileRef.current.click(); setSidebarOpen(false); }} disabled={uploading}
                    style={{width:"100%",padding:"9px 12px",background:B.gold,color:B.black,border:"none",borderRadius:3,fontSize:"0.74rem",fontWeight:600,letterSpacing:"0.08em",cursor:"pointer",marginBottom:7,display:"flex",alignItems:"center",gap:7,fontFamily:"'Jost',sans-serif"}}>
                    {uploading?<><span style={{display:"inline-block",width:11,height:11,border:`1.5px solid rgba(0,0,0,0.25)`,borderTopColor:B.black,borderRadius:"50%",animation:"spin 0.8s linear infinite"}}/>Scanning…</>:<>📷 Add Recipe Photo(s)</>}
                  </button>
                  <button onClick={()=>{ setShareTarget({collection:true}); setSidebarOpen(false); }} disabled={recipes.length===0}
                    style={{width:"100%",padding:"9px 12px",background:"none",color:B.silver,border:`1px solid ${B.smoke}`,borderRadius:3,fontSize:"0.74rem",letterSpacing:"0.06em",cursor:"pointer",marginBottom:7,fontFamily:"'Jost',sans-serif"}}>
                    💬 Share Collection
                  </button>
                  <button onClick={()=>{ const h=makeEbook(user,recipes.map(normalize)); window.open(URL.createObjectURL(new Blob([h],{type:"text/html"})),"_blank"); setSidebarOpen(false); }} disabled={recipes.length===0}
                    style={{width:"100%",padding:"9px 12px",background:"none",color:B.gold,border:`1px solid ${B.goldD}`,borderRadius:3,fontSize:"0.74rem",letterSpacing:"0.06em",cursor:"pointer",marginBottom:7,fontFamily:"'Jost',sans-serif"}}>
                    📚 Generate Ebook
                  </button>
                  {isPro ? (
                    <button onClick={()=>{ handleManageBilling(); setSidebarOpen(false); }}
                      style={{width:"100%",padding:"9px 12px",background:"none",color:B.silver,border:`1px solid ${B.smoke}`,borderRadius:3,fontSize:"0.74rem",letterSpacing:"0.06em",cursor:"pointer",marginBottom:7,fontFamily:"'Jost',sans-serif"}}>
                      ⚙ Manage Billing
                    </button>
                  ) : (
                    <button onClick={()=>{ setSidebarOpen(false); setShowUpgrade(true); }}
                      style={{width:"100%",padding:"9px 12px",background:B.gold,color:B.black,border:"none",borderRadius:3,fontSize:"0.74rem",fontWeight:600,letterSpacing:"0.08em",cursor:"pointer",marginBottom:7,fontFamily:"'Jost',sans-serif"}}>
                      ✦ Upgrade to Pro
                    </button>
                  )}
                  <button onClick={handleSignOut}
                    style={{width:"100%",padding:"9px 12px",background:"none",color:B.mid,border:`1px solid ${B.graphite}`,borderRadius:3,fontSize:"0.74rem",letterSpacing:"0.06em",cursor:"pointer",fontFamily:"'Jost',sans-serif"}}>
                    Sign Out
                  </button>
                </div>
                <div style={{marginTop:"auto",padding:"12px 14px",borderTop:`1px solid ${B.graphite}`,display:"flex",alignItems:"center",justifyContent:"center"}}>
                  <div style={{textAlign:"center",flex:1}}>
                    <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"1.7rem",color:B.white,lineHeight:1}}>{recipes.length}</div>
                    <div style={{fontSize:"0.55rem",letterSpacing:"0.14em",textTransform:"uppercase",color:B.mid,marginTop:3}}>Gathered</div>
                  </div>
                  <div style={{width:1,height:26,background:B.graphite,margin:"0 10px"}}/>
                  <div style={{textAlign:"center",flex:1}}>
                    <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"1.7rem",color:B.white,lineHeight:1}}>{[...new Set(recipes.map(r=>r.category))].length}</div>
                    <div style={{fontSize:"0.55rem",letterSpacing:"0.14em",textTransform:"uppercase",color:B.mid,marginTop:3}}>Categories</div>
                  </div>
                </div>
              </aside>

              {/* Main */}
              <main style={{flex:1,overflowY:"auto",padding:"34px 38px"}}>
                <div style={{display:"flex",alignItems:"flex-end",justifyContent:"space-between",marginBottom:28,gap:20}}>
                  <div>
                    <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"2rem",fontWeight:300,color:B.white}}>{cat==="All"?"My Collection":cat}</div>
                    <div style={{fontSize:"0.73rem",color:B.mid,letterSpacing:"0.08em",marginTop:4}}>{filtered.length} recipe{filtered.length!==1?"s":""} gathered</div>
                  </div>
                  <input style={{padding:"10px 18px",background:B.graphite,border:`1px solid ${B.smoke}`,borderRadius:30,fontSize:"0.84rem",color:B.white,outline:"none",width:230,fontFamily:"'Jost',sans-serif"}} placeholder="Search recipes, tags…" value={search} onChange={e=>setSearch(e.target.value)}/>
                </div>

                {loadingRecipes ? (
                  <div style={{textAlign:"center",padding:"100px 20px"}}>
                    <SprigMark size={40} color={B.gold} />
                    <div style={{fontSize:"0.78rem",color:B.mid,marginTop:16,letterSpacing:"0.1em"}}>Loading your collection…</div>
                  </div>
                ) : filtered.length===0 ? (
                  <div style={{textAlign:"center",padding:"100px 20px"}}>
                    <div style={{marginBottom:18,opacity:0.3,display:"flex",justifyContent:"center"}}><SprigMark size={40} color={B.gold}/></div>
                    <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"1.7rem",color:B.silver,fontWeight:300,marginBottom:10}}>Nothing gathered yet</div>
                    <div style={{fontSize:"0.84rem",color:B.mid,fontWeight:300}}>Tap the menu ☰ then "Add from Photo" to begin</div>
                  </div>
                ) : (
                  <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(218px,1fr))",gap:14}}>
                    {filtered.map(r=>(
                      <div key={r.id} onClick={()=>setSelected(normalize(r))}
                        onMouseEnter={e=>{ e.currentTarget.style.borderColor=B.gold; e.currentTarget.style.transform="translateY(-2px)"; }}
                        onMouseLeave={e=>{ e.currentTarget.style.borderColor=B.smoke; e.currentTarget.style.transform="none"; }}
                        style={{background:B.charcoal,border:`1px solid ${B.smoke}`,borderRadius:4,overflow:"hidden",cursor:"pointer",transition:"all 0.2s"}}>
                        <div style={{background: r.photo_url ? `url(${r.photo_url}) center/cover` : B.graphite, padding:"22px 18px", position:"relative", minHeight: r.photo_url ? 140 : 92, display:"flex", alignItems:"center", justifyContent:"center"}}>
                          {!r.photo_url && <span style={{fontSize:"2.6rem"}}>{r.image}</span>}
                          {r.photo_url && <div style={{position:"absolute", inset:0, background:"linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(17,17,17,0.6) 100%)"}}/>}
                          <div style={{position:"absolute",top:10,right:10,fontSize:"0.58rem",letterSpacing:"0.18em",textTransform:"uppercase",color:B.gold,border:`1px solid ${B.goldD}`,padding:"3px 8px",borderRadius:2}}>{r.category}</div>
                        </div>
                        <div style={{padding:"14px 16px"}}>
                          <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"1.08rem",color:B.white,marginBottom:6,lineHeight:1.25}}>{r.title}</div>
                          <div style={{fontSize:"0.72rem",color:B.mid,marginBottom:7}}>{r.prep_time||r.prepTime} prep · Serves {r.servings}</div>
                          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                            {r.tags?.slice(0,2).map(t=><span key={t} style={{fontSize:"0.62rem",color:B.silver,letterSpacing:"0.07em"}}>#{t}</span>)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </main>
            </>
          ) : (
            <div style={{flex:1,overflowY:"auto"}}>
              <MealPlannerTab recipes={recipes.map(normalize)}/>
            </div>
          )}
        </div>
      </div>

      {selected && <RecipeModal
        recipe={selected}
        onClose={()=>{setSelected(null); setServingMultiplier(1);}}
        onShare={r=>{ setShareTarget({recipe:r}); setSelected(null); }}
        onEdit={r=>{ setEditingRecipe(r); setSelected(null); }}
        onDelete={r=>setDeletingRecipe(r)}
        onPhotoUpload={handlePhotoUpload}
        servingMultiplier={servingMultiplier}
        setServingMultiplier={setServingMultiplier}
        scaleIngredient={scaleIngredient}
        uploadingPhoto={uploadingPhoto}
      />}
      {editingRecipe && <EditRecipeModal recipe={editingRecipe} onClose={()=>setEditingRecipe(null)} onSave={handleUpdateRecipe}/>}
      {deletingRecipe && <DeleteRecipeModal recipe={deletingRecipe} onClose={()=>setDeletingRecipe(null)} onConfirm={handleDeleteRecipe}/>}
      {shareTarget && <ShareModal recipe={shareTarget.recipe||null} user={user} allRecipes={recipes.map(normalize)} onClose={()=>setShareTarget(null)}/>}
      {toast && (
        <div style={{position:"fixed",bottom:24,right:24,background:toast.type==="err"?"#7A1515":B.gold,color:toast.type==="err"?B.white:B.black,padding:"12px 22px",borderRadius:3,fontSize:"0.8rem",fontWeight:600,letterSpacing:"0.08em",boxShadow:"0 8px 32px rgba(0,0,0,0.5)",zIndex:999,animation:"fadeUp 0.3s ease"}}>
          {toast.msg}
        </div>
      )}
      {showUpgrade && <UpgradeModal onClose={()=>setShowUpgrade(false)} onUpgrade={handleUpgrade} recipeCount={recipes.length}/>}
    </>
  );
}

// ─── STYLES ───────────────────────────────────────────────────────────────────
const LS = {
  lbl:{ display:"block",fontSize:"0.65rem",letterSpacing:"0.22em",textTransform:"uppercase",color:"#999999",marginBottom:10 },
  inp:{ width:"100%",padding:"14px 18px",background:"#1C1C1C",border:"1px solid #2A2A2A",borderRadius:3,fontSize:"0.95rem",color:"#FFFFFF",outline:"none",marginBottom:20,fontFamily:"'Jost',sans-serif",transition:"border-color 0.2s" },
  btn:{ width:"100%",padding:"15px",background:"#C9A84C",color:"#0A0A0A",border:"none",borderRadius:3,fontSize:"0.82rem",fontWeight:600,letterSpacing:"0.14em",textTransform:"uppercase",cursor:"pointer",fontFamily:"'Jost',sans-serif",transition:"opacity 0.2s" },
};

const S = {
  overlay:{ position:"fixed",inset:0,background:"rgba(0,0,0,0.88)",zIndex:100,display:"flex",alignItems:"center",justifyContent:"center",padding:24,backdropFilter:"blur(8px)" },
  shareBox:{ background:"#111111",border:"1px solid #2A2A2A",borderRadius:6,maxWidth:480,width:"100%",overflow:"hidden",animation:"fadeUp 0.25s ease" },
  recipeModal:{ background:"#111111",border:"1px solid #2A2A2A",borderRadius:6,maxWidth:680,width:"100%",maxHeight:"88vh",overflow:"hidden",display:"flex",flexDirection:"column",animation:"fadeUp 0.25s ease" },
  modalTopBar:{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"20px 24px",borderBottom:"1px solid #2A2A2A" },
  modalHeading:{ fontFamily:"'Cormorant Garamond',serif",fontSize:"1.3rem",color:"#FFFFFF" },
  xBtn:{ background:"none",border:"none",color:"#999999",cursor:"pointer",fontSize:"1rem",padding:4 },
  goldBtn:{ flex:1,padding:"12px 0",background:"#C9A84C",color:"#0A0A0A",border:"none",borderRadius:2,fontWeight:600,fontSize:"0.78rem",letterSpacing:"0.1em",textTransform:"uppercase",cursor:"pointer",fontFamily:"'Jost',sans-serif" },
  goldBtnSm:{ padding:"8px 18px",background:"#C9A84C",color:"#0A0A0A",border:"none",borderRadius:2,fontSize:"0.72rem",fontWeight:600,letterSpacing:"0.1em",textTransform:"uppercase",cursor:"pointer",fontFamily:"'Jost',sans-serif" },
  outlineBtn:{ flex:1,padding:"12px 0",background:"none",color:"#999999",border:"1px solid #2A2A2A",borderRadius:2,fontSize:"0.78rem",letterSpacing:"0.08em",cursor:"pointer",fontFamily:"'Jost',sans-serif",transition:"all 0.2s" },
  secLabel:{ fontSize:"0.6rem",letterSpacing:"0.3em",textTransform:"uppercase",color:"#C9A84C",marginBottom:14,paddingBottom:10,borderBottom:"1px solid #2A2A2A" },
};

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300&family=Jost:wght@300;400;500;600&display=swap');
  * { box-sizing:border-box; margin:0; padding:0; }
  body { font-family:'Jost',sans-serif; background:#0A0A0A; }
  input, button { font-family:'Jost',sans-serif; }
  @keyframes spin { to { transform:rotate(360deg); } }
  @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
  @keyframes slideIn { from { transform:translateX(-100%); } to { transform:translateX(0); } }
`;
