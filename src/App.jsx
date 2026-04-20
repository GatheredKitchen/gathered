import { useState, useRef, useEffect } from "react";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ─── SUPABASE ─────────────────────────────────────────────────────────────────
const SUPABASE_URL = "https://bjbsprypxrmekottuqdg.supabase.co";
const SUPABASE_KEY = "sb_publishable_I7BGVOOAjXcPlLrLZfdsUw_UeuQIyNm";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

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
const parseFromImage = async (b64, mime) => {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method:"POST", headers:{"Content-Type":"application/json"},
    body: JSON.stringify({
      model:"claude-sonnet-4-20250514", max_tokens:1000,
      messages:[{ role:"user", content:[
        { type:"image", source:{ type:"base64", media_type:mime, data:b64 }},
        { type:"text", text:`Extract the recipe from this image. Return ONLY raw JSON, no markdown fences:\n{"title":"","category":"Breakfast|Lunch|Dinner|Dessert|Snacks|Drinks|Sides","tags":[],"servings":4,"prepTime":"","cookTime":"","image":"🍽️","ingredients":[],"instructions":[],"notes":""}` }
      ]}]
    })
  });
  const d = await res.json();
  const t = d.content?.find(b=>b.type==="text")?.text || "{}";
  return JSON.parse(t.replace(/```json|```/g,"").trim());
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
  const [copied, setCopied] = useState(false);
  const text = mode==="single" ? fmtSMS(recipe, user.name) : fmtCollection(user, allRecipes);
  const copy = () => { navigator.clipboard.writeText(text).then(()=>{ setCopied(true); setTimeout(()=>setCopied(false),2500); }); };
  const openSMS = () => window.location.href = `sms:?body=${encodeURIComponent(text)}`;
  const openEbook = () => { const h=makeEbook(user,allRecipes); window.open(URL.createObjectURL(new Blob([h],{type:"text/html"})),"_blank"); };

  return (
    <div style={S.overlay} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={S.shareBox}>
        <div style={S.modalTopBar}>
          <div style={S.modalHeading}>Share</div>
          <button style={S.xBtn} onClick={onClose}>✕</button>
        </div>
        {recipe && (
          <div style={{display:"flex",padding:"16px 24px 0",gap:8}}>
            {["single","collection"].map(m=>(
              <button key={m} onClick={()=>setMode(m)} style={{flex:1,padding:"9px 0",border:`1px solid ${mode===m?B.gold:B.smoke}`,background:mode===m?B.gold:"none",color:mode===m?B.black:B.silver,fontSize:"0.73rem",letterSpacing:"0.12em",textTransform:"uppercase",cursor:"pointer",borderRadius:2,fontFamily:"'Jost',sans-serif",fontWeight:mode===m?600:400}}>
                {m==="single" ? `${recipe.image} This Recipe` : `🗂 Full Collection (${allRecipes.length})`}
              </button>
            ))}
          </div>
        )}
        <div style={{margin:"16px 24px 0",background:B.graphite,border:`1px solid ${B.smoke}`,borderRadius:3,overflow:"hidden"}}>
          <div style={{padding:"8px 14px",fontSize:"0.6rem",letterSpacing:"0.25em",textTransform:"uppercase",color:B.mid,borderBottom:`1px solid ${B.smoke}`}}>Text / SMS Preview</div>
          <pre style={{padding:"14px",fontSize:"0.75rem",color:B.fog,fontFamily:"'Courier New',monospace",whiteSpace:"pre-wrap",maxHeight:210,overflowY:"auto",lineHeight:1.6}}>{text}</pre>
        </div>
        <div style={{display:"flex",gap:10,padding:"16px 24px"}}>
          <button style={S.goldBtn} onClick={openSMS}>💬 Open in Messages</button>
          <button style={{...S.outlineBtn,...(copied?{background:B.smoke,color:B.white,borderColor:B.smoke}:{})}} onClick={copy}>{copied?"✓ Copied":"📋 Copy Text"}</button>
        </div>
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
function RecipeModal({ recipe, onClose, onShare }) {
  return (
    <div style={S.overlay} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={S.recipeModal}>
        <div style={{background:B.graphite,padding:"28px 34px",display:"flex",alignItems:"flex-start",gap:20,borderBottom:`1px solid ${B.smoke}`,flexShrink:0}}>
          <div style={{fontSize:"3rem",flexShrink:0}}>{recipe.image}</div>
          <div style={{flex:1}}>
            <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"1.8rem",fontWeight:300,color:B.white,lineHeight:1.15,marginBottom:10}}>{recipe.title}</div>
            <div style={{display:"flex",gap:10,flexWrap:"wrap",marginBottom:8}}>
              {[`Prep ${recipe.prepTime}`,`Cook ${recipe.cookTime}`,`Serves ${recipe.servings}`].map(m=>(
                <span key={m} style={{fontSize:"0.73rem",color:B.silver,border:`1px solid ${B.smoke}`,padding:"4px 12px",borderRadius:2}}>{m}</span>
              ))}
            </div>
            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
              {recipe.tags?.map(t=><span key={t} style={{fontSize:"0.65rem",color:B.mid,letterSpacing:"0.08em"}}>#{t}</span>)}
            </div>
          </div>
          <div style={{display:"flex",gap:10,flexShrink:0}}>
            <button style={S.goldBtnSm} onClick={()=>onShare(recipe)}>Share</button>
            <button style={S.xBtn} onClick={onClose}>✕</button>
          </div>
        </div>
        <div style={{padding:"26px 34px 36px",overflowY:"auto"}}>
          <div style={{marginBottom:24}}>
            <div style={S.secLabel}>Ingredients</div>
            <ul style={{listStyle:"none"}}>
              {recipe.ingredients.map((ing,i)=>(
                <li key={i} style={{padding:"9px 0",borderBottom:`1px solid ${B.graphite}`,fontSize:"0.9rem",color:B.fog,display:"flex",alignItems:"center",gap:12,fontWeight:300}}>
                  <span style={{width:4,height:4,borderRadius:"50%",background:B.gold,flexShrink:0,display:"inline-block"}}/>
                  {ing}
                </li>
              ))}
            </ul>
          </div>
          <div style={{marginBottom:24}}>
            <div style={S.secLabel}>Instructions</div>
            <ol style={{listStyle:"none"}}>
              {recipe.instructions.map((step,i)=>(
                <li key={i} style={{display:"flex",gap:18,padding:"12px 0",borderBottom:`1px solid ${B.graphite}`,fontSize:"0.9rem",color:B.fog,fontWeight:300,lineHeight:1.65}}>
                  <span style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"1.3rem",color:B.gold,minWidth:22,lineHeight:1,flexShrink:0}}>{i+1}</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>
          {recipe.notes && (
            <div style={{borderLeft:`2px solid ${B.gold}`,padding:"12px 18px",fontSize:"0.88rem",color:B.silver,fontStyle:"italic",fontWeight:300}}>
              {recipe.notes}
            </div>
          )}
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
  const [recipes, setRecipes] = useState([]);
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
  };

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
    const file = e.target.files[0]; if (!file) return;
    setUploading(true);
    try {
      const b64 = await new Promise((res,rej)=>{ const r=new FileReader(); r.onload=()=>res(r.result.split(",")[1]); r.onerror=rej; r.readAsDataURL(file); });
      const parsed = await parseFromImage(b64, file.type);
      await saveRecipe(parsed);
    } catch { showToast("Couldn't read that image. Try a clearer photo.", "err"); }
    finally { setUploading(false); e.target.value=""; }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setSidebarOpen(false);
  };

  // ── Normalize recipe fields ────────────────────────────────────────────────
  const normalize = (r) => ({
    ...r,
    prepTime: r.prepTime || r.prep_time || "",
    cookTime: r.cookTime || r.cook_time || "",
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
              <button key={t} onClick={()=>setTab(t)} style={{padding:"7px 20px",background:tab===t?B.gold:"none",color:tab===t?B.black:B.silver,border:"none",fontSize:"0.72rem",letterSpacing:"0.12em",textTransform:"uppercase",cursor:"pointer",fontFamily:"'Jost',sans-serif",fontWeight:tab===t?600:400,transition:"all 0.15s"}}>{t}</button>
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
                <div style={{padding:"16px 14px 12px",borderBottom:`1px solid ${B.graphite}`,display:"flex",alignItems:"center",gap:10}}>
                  <div style={{width:28,height:28,borderRadius:"50%",border:`1px solid ${B.gold}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"0.65rem",color:B.gold,fontWeight:600,flexShrink:0}}>{user?.avatar}</div>
                  <div>
                    <div style={{color:B.white,fontSize:"0.82rem",fontWeight:500}}>{user?.name}</div>
                    <div style={{color:B.mid,fontSize:"0.64rem",marginTop:1}}>{recipes.length} recipe{recipes.length!==1?"s":""}</div>
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
                  <input type="file" accept="image/*" ref={fileRef} style={{display:"none"}} onChange={handleUpload}/>
                  <button onClick={()=>{ fileRef.current.click(); setSidebarOpen(false); }} disabled={uploading}
                    style={{width:"100%",padding:"9px 12px",background:B.gold,color:B.black,border:"none",borderRadius:3,fontSize:"0.74rem",fontWeight:600,letterSpacing:"0.08em",cursor:"pointer",marginBottom:7,display:"flex",alignItems:"center",gap:7,fontFamily:"'Jost',sans-serif"}}>
                    {uploading?<><span style={{display:"inline-block",width:11,height:11,border:`1.5px solid rgba(0,0,0,0.25)`,borderTopColor:B.black,borderRadius:"50%",animation:"spin 0.8s linear infinite"}}/>Scanning…</>:<>📷 Add from Photo</>}
                  </button>
                  <button onClick={()=>{ setShareTarget({collection:true}); setSidebarOpen(false); }} disabled={recipes.length===0}
                    style={{width:"100%",padding:"9px 12px",background:"none",color:B.silver,border:`1px solid ${B.smoke}`,borderRadius:3,fontSize:"0.74rem",letterSpacing:"0.06em",cursor:"pointer",marginBottom:7,fontFamily:"'Jost',sans-serif"}}>
                    💬 Share Collection
                  </button>
                  <button onClick={()=>{ const h=makeEbook(user,recipes.map(normalize)); window.open(URL.createObjectURL(new Blob([h],{type:"text/html"})),"_blank"); setSidebarOpen(false); }} disabled={recipes.length===0}
                    style={{width:"100%",padding:"9px 12px",background:"none",color:B.gold,border:`1px solid ${B.goldD}`,borderRadius:3,fontSize:"0.74rem",letterSpacing:"0.06em",cursor:"pointer",marginBottom:7,fontFamily:"'Jost',sans-serif"}}>
                    📚 Generate Ebook
                  </button>
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
                        <div style={{background:B.graphite,padding:"22px 18px",position:"relative",minHeight:92,display:"flex",alignItems:"center",justifyContent:"center"}}>
                          <span style={{fontSize:"2.6rem"}}>{r.image}</span>
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

      {selected && <RecipeModal recipe={selected} onClose={()=>setSelected(null)} onShare={r=>{ setShareTarget({recipe:r}); setSelected(null); }}/>}
      {shareTarget && <ShareModal recipe={shareTarget.recipe||null} user={user} allRecipes={recipes.map(normalize)} onClose={()=>setShareTarget(null)}/>}
      {toast && (
        <div style={{position:"fixed",bottom:24,right:24,background:toast.type==="err"?"#7A1515":B.gold,color:toast.type==="err"?B.white:B.black,padding:"12px 22px",borderRadius:3,fontSize:"0.8rem",fontWeight:600,letterSpacing:"0.08em",boxShadow:"0 8px 32px rgba(0,0,0,0.5)",zIndex:999,animation:"fadeUp 0.3s ease"}}>
          {toast.msg}
        </div>
      )}
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
