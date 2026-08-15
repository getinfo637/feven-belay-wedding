const $=s=>document.querySelector(s);
const $$=s=>document.querySelectorAll(s);
const cfg=window.WEDDING_CONFIG||{};
let lang="am";

window.addEventListener("load",()=>{
  setTimeout(()=>$("#loader")?.classList.add("fade"),900);
  setTimeout(()=>$("#loader")?.remove(),1700);
});

$("#openInvite")?.addEventListener("click",()=>{
  $("#envelope")?.classList.add("hidden");
  $("#app")?.classList.remove("hidden");
  document.body.classList.add("opened");
});

function setLanguage(next){
  lang=next;
  document.documentElement.lang=next;
  $$("[data-am]").forEach(el=>{
    const value=el.dataset[next];
    if(value!==undefined) el.textContent=value;
  });
  const langBtn=$("#langBtn");
  if(langBtn) langBtn.textContent=next==="am"?"EN":"አማ";
  const name=$("#guestName");
  if(name) name.placeholder=next==="am"?"ሙሉ ስምዎን ያስገቡ":"Enter your full name";
}
$("#langBtn")?.addEventListener("click",()=>setLanguage(lang==="am"?"en":"am"));

const target=new Date(cfg.weddingDateISO||"2027-05-23T18:00:00+03:00").getTime();
function tick(){
  let d=Math.max(0,target-Date.now());
  const days=Math.floor(d/86400000); d%=86400000;
  const hours=Math.floor(d/3600000); d%=3600000;
  const minutes=Math.floor(d/60000); d%=60000;
  const seconds=Math.floor(d/1000);
  $("#days").textContent=String(days).padStart(2,"0");
  $("#hours").textContent=String(hours).padStart(2,"0");
  $("#minutes").textContent=String(minutes).padStart(2,"0");
  $("#seconds").textContent=String(seconds).padStart(2,"0");
}
tick(); setInterval(tick,1000);

const audio=$("#weddingAudio");
$("#musicBtn")?.addEventListener("click",async()=>{
  try{
    if(audio.paused){await audio.play();$("#musicBtn").textContent="❚❚";}
    else{audio.pause();$("#musicBtn").textContent="♫";}
  }catch(e){
    alert(lang==="am"?"እባክዎ እንደገና የሙዚቃ ቁልፉን ይጫኑ።":"Tap the music button again to start the song.");
  }
});

$$(".gallery-item").forEach(btn=>btn.addEventListener("click",()=>{
  $("#lightboxImg").src=btn.dataset.full;
  $("#lightbox").classList.remove("hidden");
}));
$("#closeLightbox")?.addEventListener("click",()=>$("#lightbox").classList.add("hidden"));
$("#lightbox")?.addEventListener("click",e=>{
  if(e.target.id==="lightbox") $("#lightbox").classList.add("hidden");
});

function getSupabaseRestUrl(){
  let base=(cfg.supabaseUrl||"").trim().replace(/\/+$/,"");
  if(base.endsWith("/rest/v1")) return base+"/rsvps";
  if(base.endsWith("/rest")) return base+"/v1/rsvps";
  return base+"/rest/v1/rsvps";
}

async function submitToSupabase(name,status){
  if(!cfg.supabaseUrl || !cfg.supabaseAnonKey){
    throw new Error("Supabase configuration is missing.");
  }

  const url=getSupabaseRestUrl();
  const payload={
    guest_name:name.trim(),
    attendance_status:status,
    number_attending:status==="accepted"?1:0
  };

  let res;
  try{
    res=await fetch(url,{
      method:"POST",
      mode:"cors",
      headers:{
        "Content-Type":"application/json",
        "apikey":cfg.supabaseAnonKey,
        "Authorization":"Bearer "+cfg.supabaseAnonKey,
        "Prefer":"return=minimal"
      },
      body:JSON.stringify(payload)
    });
  }catch(networkError){
    throw new Error("NETWORK_ERROR: "+networkError.message);
  }

  if(!res.ok){
    let detail="";
    try{ detail=await res.text(); }catch(_){}

    const errorMessage =
        `SUPABASE_${res.status}: ${detail || res.statusText}`;

    console.error("RSVP ERROR:", errorMessage);

    const debugBox = document.createElement("div");
    debugBox.style.cssText =
        "position:fixed;left:12px;right:12px;bottom:12px;z-index:99999;" +
        "background:#fff;color:#7b102b;padding:16px;border:2px solid #7b102b;" +
        "border-radius:10px;font:14px Arial;word-break:break-word;";

    debugBox.textContent = errorMessage;

    document.body.appendChild(debugBox);

    throw new Error(errorMessage);
}
  }

  return {saved:true};
}

function showRsvpError(err){
  console.error("Wedding RSVP error:",err);
  const message=$("#rsvpMessage");
  const form=$("#rsvpForm");
  if(message){
    message.classList.remove("hidden");
    message.textContent=lang==="am"
      ?"RSVP ማስገባት አልተቻለም። እባክዎ እንደገና ይሞክሩ።"
      :"Unable to submit RSVP. Please try again.";
  }else{
    alert(lang==="am"
      ?"RSVP ማስገባት አልተቻለም። እባክዎ እንደገና ይሞክሩ።"
      :"Unable to submit RSVP. Please try again.");
  }
  if(form) form.classList.remove("hidden");
}

$("#rsvpForm")?.addEventListener("submit",async e=>{
  e.preventDefault();

  const form=e.currentTarget;
  const name=$("#guestName").value.trim();
  const status=document.querySelector('input[name="attendance"]:checked')?.value;

  if(!name || !status) return;

  const btn=form.querySelector('button[type="submit"]');
  btn.disabled=true;
  btn.dataset.originalText=btn.textContent;
  btn.textContent=lang==="am"?"በመላክ ላይ…":"Submitting…";

  try{
    await submitToSupabase(name,status);

    const msg=status==="accepted"
      ?"ስለ ምላሽዎ እናመሰግናለን! በልዩ ቀናችን ከእኛ ጋር ስለሚሆኑ ደስተኞች ነን። ❤️"
      :"ስለ ምላሽዎ እናመሰግናለን። ❤️";

    form.classList.add("hidden");
    const message=$("#rsvpMessage");
    message.textContent=msg;
    message.classList.remove("hidden");
  }catch(err){
    showRsvpError(err);
    btn.disabled=false;
    btn.textContent=btn.dataset.originalText;
  }
});
