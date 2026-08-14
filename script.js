const $=s=>document.querySelector(s);
const $$=s=>document.querySelectorAll(s);
const cfg=window.WEDDING_CONFIG||{};
let lang="am";

window.addEventListener("load",()=>{
  setTimeout(()=>$("#loader").classList.add("fade"),900);
  setTimeout(()=>$("#loader").remove(),1700);
});

$("#openInvite").addEventListener("click",()=>{
  $("#envelope").classList.add("hidden");
  $("#app").classList.remove("hidden");
  document.body.classList.add("opened");
});

function setLanguage(next){
  lang=next;
  document.documentElement.lang=next;
  $$("[data-am]").forEach(el=>{
    el.textContent=el.dataset[next];
  });
  $("#langBtn").textContent=next==="am"?"EN":"አማ";
  const name=$("#guestName");
  if(name) name.placeholder=next==="am"?"ሙሉ ስምዎን ያስገቡ":"Enter your full name";
}
$("#langBtn").addEventListener("click",()=>setLanguage(lang==="am"?"en":"am"));

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
tick();setInterval(tick,1000);

const audio=$("#weddingAudio");
$("#musicBtn").addEventListener("click",async()=>{
  try{
    if(audio.paused){await audio.play();$("#musicBtn").textContent="❚❚";}
    else{audio.pause();$("#musicBtn").textContent="♫";}
  }catch(e){
    alert(lang==="am"?"እባክዎ መጀመሪያ ሙዚቃውን በስልክዎ ያስጀምሩ።":"Tap again to start the music.");
  }
});

$$(".gallery-item").forEach(btn=>btn.addEventListener("click",()=>{
  $("#lightboxImg").src=btn.dataset.full;
  $("#lightbox").classList.remove("hidden");
}));
$("#closeLightbox").addEventListener("click",()=>$("#lightbox").classList.add("hidden"));
$("#lightbox").addEventListener("click",e=>{if(e.target.id==="lightbox")$("#lightbox").classList.add("hidden")});

async function submitToSupabase(name,status){
  if(!cfg.supabaseUrl||!cfg.supabaseAnonKey) return {local:true};
  const url=cfg.supabaseUrl.replace(/\/$/,"")+"/rest/v1/rsvps";
  const res=await fetch(url,{
    method:"POST",
    headers:{
      "Content-Type":"application/json",
      "apikey":cfg.supabaseAnonKey,
      "Authorization":"Bearer "+cfg.supabaseAnonKey,
      "Prefer":"return=minimal"
    },
    body:JSON.stringify({
      guest_name:name.trim(),
      attendance_status:status,
      number_attending:status==="accepted"?1:0
    })
  });
  if(!res.ok){
    const text=await res.text();
    throw new Error(text||"RSVP failed");
  }
  return {saved:true};
}

$("#rsvpForm").addEventListener("submit",async e=>{
  e.preventDefault();
  const name=$("#guestName").value.trim();
  const status=document.querySelector('input[name="attendance"]:checked')?.value;
  if(!name||!status)return;
  const btn=e.target.querySelector("button[type=submit]");
  btn.disabled=true;
  try{
    await submitToSupabase(name,status);
    const msg=status==="accepted"
      ?"ስለ ምላሽዎ እናመሰግናለን! በልዩ ቀናችን ከእኛ ጋር ስለሚሆኑ ደስተኞች ነን። ❤️"
      :"ስለ ምላሽዎ እናመሰግናለን። ❤️";
    $("#rsvpForm").classList.add("hidden");
    $("#rsvpMessage").textContent=msg;
    $("#rsvpMessage").classList.remove("hidden");
  }catch(err){
    console.error(err);
    alert(lang==="am"?"RSVP ማስገባት አልተቻለም። እባክዎ እንደገና ይሞክሩ።":"Unable to submit RSVP. Please try again.");
    btn.disabled=false;
  }
});
