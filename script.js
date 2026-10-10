const WA='918128177882',UPI='iftekhar1708@okhdfcbank',PW_HASH='75e0508b35227f4c0972bfdb8a7bf6605767c8d6d22c5cb962c9279e02284654',QR='images/upi-qr.jpg';
const SV=[
 {k:'Shopping Helper',i:'🛍️',d:'Bag carrying and bargaining help while you shop.'},
 {k:'Luggage Helper',i:'🧳',d:'Lift, carry and load luggage at stations and homes.'},
 {k:'Personal Assistant',i:'📋',d:'Queues, pickups, errands and small tasks done for you.'},
 {k:'Elder Care',i:'🧓',d:'A patient companion for walks, visits and clinic trips.'}];
const PR={30:49,60:75,120:130},DUR=[30,60,120],EXT=25; // EXT = price for each +15 min
const $=s=>document.querySelector(s),rs=n=>'₹'+n.toLocaleString('en-IN');
const dl=m=>m>=120?(m/60)+' hours':m==60?'1 hour':m+' min';
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const go=id=>document.getElementById(id).scrollIntoView();
const waUrl=(t,n=WA)=>'https://wa.me/'+n+'?text='+encodeURIComponent(t);
let bk=[],admin=false,cart={},step=1,filt='all',fm={name:'',mob:'',gen:'',loc:'',pay:'Cash'};
const load=()=>{try{bk=JSON.parse(localStorage.getItem('cm_bk3')||'[]')}catch(e){bk=[]}};load();
try{admin=sessionStorage.getItem('cm_adm')=='1'}catch(e){}
const save=()=>{try{localStorage.setItem('cm_bk3',JSON.stringify(bk))}catch(e){}};
const cartItems=()=>Object.entries(cart).map(([svc,dur])=>({svc,dur,price:PR[dur]}));
const cartTotal=()=>cartItems().reduce((a,i)=>a+i.price,0);

$('#svcGrid').innerHTML=SV.map(s=>`<div class="svc"><div class="ic">${s.i}</div><h3>${s.k}</h3><p>${s.d}</p><div class="pl">${DUR.map(d=>`<div><span>${dl(d)}</span><b>${rs(PR[d])}</b></div>`).join('')}</div><button class="btn" onclick="openOrder('${s.k}')">Select</button></div>`).join('');

// ---- order sheet (WhatsApp style)
function openOrder(k){if(k&&!cart[k])cart[k]=30;step=1;$('#sheet').classList.add('open');drawOrder()}
function closeOrder(){$('#sheet').classList.remove('open')}
function tog(k,d){cart[k]==d?delete cart[k]:cart[k]=d;const y=$('#shb').scrollTop;drawOrder();$('#shb').scrollTop=y}
function drawOrder(){
 const n=cartItems().length;
 if(step==1){
  $('#shs').textContent='Step 1 · Select services';
  $('#shb').innerHTML=`<div class="bub">👋 Welcome to <b>CarryMan+</b>! Choose one or more services and the time you need for each.</div>`+SV.map(s=>`<div class="bub"><div class="svh"><span>${s.i}</span><div><b>${s.k}</b><small>${s.d}</small></div></div><div class="opts">${DUR.map(d=>`<button class="op" aria-pressed="${cart[s.k]==d}" onclick="tog('${s.k}',${d})"><b>${dl(d)}</b>${rs(PR[d])}</button>`).join('')}</div></div>`).join('');
  $('#shf').innerHTML=`<div><b>${rs(cartTotal())}</b><small>${n} service${n==1?'':'s'} selected</small></div><button class="btn" ${n?'':'disabled'} onclick="step=2;drawOrder()">Continue →</button>`;
 }else{
  $('#shs').textContent='Step 2 · Your details';
  $('#shb').innerHTML=`<div class="bub"><div class="fld"><label for="f1">Name</label><input id="f1" value="${esc(fm.name)}" autocomplete="name" placeholder="Your full name" oninput="fm.name=this.value"></div>
  <div class="fld"><label for="f2">Mobile number</label><input id="f2" value="${esc(fm.mob)}" inputmode="numeric" maxlength="10" autocomplete="tel" placeholder="10-digit number" oninput="fm.mob=this.value"></div>
  <div class="fld"><label for="f3">Gender</label><select id="f3" onchange="fm.gen=this.value">${['','Male','Female','Other'].map(g=>`<option value="${g}" ${fm.gen==g?'selected':''}>${g||'Select gender'}</option>`).join('')}</select></div>
  <div class="fld"><label for="f4">Location</label><input id="f4" value="${esc(fm.loc)}" autocomplete="street-address" placeholder="Area, landmark, city" oninput="fm.loc=this.value"></div>
  <div class="fld"><label>Payment option</label><div class="seg">${['Cash','UPI'].map(p=>`<button aria-pressed="${fm.pay==p}" onclick="setPay('${p}')">${p=='Cash'?'💵 Cash':'📲 UPI'}</button>`).join('')}</div></div></div>
  <div class="bub sum"><b>Price summary</b>${cartItems().map(i=>`<div><span>${i.svc}</span><span>${rs(i.price)}</span></div>`).join('')}<div class="t"><span>Total</span><span>${rs(cartTotal())}</span></div></div>
  <div class="err" id="err" role="alert"></div>`;
  $('#shf').innerHTML=`<button class="btn ghost" onclick="step=1;drawOrder()">← Back</button><button class="btn" style="flex:1" id="book">${bookLabel()}</button>`;
  $('#book').onclick=submit;
 }
}
const bookLabel=()=>fm.pay=='UPI'?'Book & pay '+rs(cartTotal()):'Book now';
function setPay(p){fm.pay=p;document.querySelectorAll('.seg button').forEach(b=>b.setAttribute('aria-pressed',b.textContent.includes(p)));$('#book').textContent=bookLabel()}

function submit(){
 const name=fm.name.trim(),mob=fm.mob.trim(),loc=fm.loc.trim();let e='';
 if(name.length<2)e='Enter your name.';else if(!/^[6-9]\d{9}$/.test(mob))e='Enter a valid 10-digit mobile number.';
 else if(!fm.gen)e='Select your gender.';else if(loc.length<3)e='Enter your location.';
 $('#err').textContent=e;if(e)return;
 const f={items:cartItems(),price:cartTotal(),name,mob,gen:fm.gen,loc,pay:fm.pay};
 if(f.pay=='Cash'){done(create(f,false));return}
 const link=`upi://pay?pa=${UPI}&pn=CarryMan%2B&am=${f.price}&cu=INR&tn=CarryMan%2B%20order`;
 openModal(`<h3>Pay ${rs(f.price)} by UPI</h3><p class="note" style="margin:4px 0 0">Scan the QR with any UPI app, or tap Open UPI app.</p>
 <img class="qr" src="${QR}" alt="UPI QR code"><p style="text-align:center;margin:0 0 10px"><b>${UPI}</b></p>
 <a class="btn" style="width:100%" href="${link}">Open UPI app</a>
 <button class="btn g" style="width:100%;margin-top:8px" id="paid">I have paid ${rs(f.price)}</button>
 <button class="btn ghost" style="width:100%;margin-top:8px" onclick="closeModal()">Cancel</button>`);
 $('#paid').onclick=()=>done(create(f,true));
}
function create(f,paid){
 const b={...f,id:'CM'+Math.floor(100000+Math.random()*900000),mins:f.items.reduce((a,i)=>a+i.dur,0),extra:0,ext:[],paid,status:'pending',run:'idle',at:Date.now()};
 load();bk.unshift(b);save();drawDash();return b;
}
const lines=b=>b.items.map(i=>`- ${i.svc}: ${dl(i.dur)} - ${rs(i.price)}`).join('\n');
function done(b){
 const msg=`NEW BOOKING ${b.id}\n\nServices:\n${lines(b)}\nTotal: ${rs(b.price)}\nName: ${b.name}\nMobile: ${b.mob}\nGender: ${b.gen}\nLocation: ${b.loc}\nPayment: ${b.pay} ${b.paid?'- PAID by UPI, payment confirmed':'- pay cash to helper'}\n\nPlease confirm my booking.`;
 const mine=`Hi ${b.name}, your CarryMan+ booking ${b.id} is received.\n\n${lines(b)}\nTotal: ${rs(b.price)}\nPayment: ${b.pay}${b.paid?' (paid)':''}\n\nOur team will confirm shortly.`;
 const u=waUrl(msg);window.open(u,'_blank');
 cart={};fm={name:'',mob:'',gen:'',loc:'',pay:'Cash'};closeOrder();
 openModal(`<div class="ok"><div class="big">✅</div><h3>Booking ${b.paid?'paid &amp; ':''}placed</h3><p>Booking ID <b>${b.id}</b></p>
 <p class="note">WhatsApp is opening to confirm your order. If it did not open, tap below.${b.paid?' Please attach your payment screenshot.':''}</p>
 <a class="btn wa2" style="width:100%" href="${u}" target="_blank" rel="noopener">Confirm on WhatsApp</a>
 <a class="btn ghost" style="width:100%;margin-top:8px" href="${waUrl(mine,'91'+b.mob)}" target="_blank" rel="noopener">Send copy to my WhatsApp</a>
 <button class="btn ghost" style="width:100%;margin-top:8px" onclick="closeModal()">Close</button></div>`);
}
function openModal(h){$('#mbody').innerHTML=h;$('#modal').classList.add('open')}
const closeModal=()=>$('#modal').classList.remove('open');
$('#modal').onclick=e=>{if(e.target.id=='modal')closeModal()};
document.onkeydown=e=>{if(e.key=='Escape'){closeModal();closeOrder()}};

// ---- helper login + dashboard
async function sha(s){const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s));return[...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('')}
$('#loginBtn').onclick=()=>{
 if(admin){showDash();return}
 openModal(`<h3>Helper login</h3><p class="note" style="margin:4px 0 14px">Enter the helper password.</p>
 <div class="fld"><input id="pw" type="password" autocomplete="current-password" placeholder="Password"></div><div class="err" id="pwe"></div>
 <button class="btn" style="width:100%" id="pwgo">Open dashboard</button>`);
 const t=async()=>{let ok=false;try{ok=(await sha($('#pw').value))===PW_HASH}catch(e){}
  if(ok){admin=true;try{sessionStorage.setItem('cm_adm','1')}catch(e){}closeModal();showDash()}else $('#pwe').textContent='Wrong password.'};
 $('#pwgo').onclick=t;$('#pw').onkeydown=e=>{if(e.key=='Enter')t()};$('#pw').focus();
};
$('#logout').onclick=()=>{admin=false;try{sessionStorage.removeItem('cm_adm')}catch(e){}$('#dash').hidden=true;window.scrollTo(0,0)};
function showDash(){$('#dash').hidden=false;drawDash();go('dash')}
const find=id=>bk.find(b=>b.id==id);
const tot=b=>b.mins+b.extra;
const left=b=>b.run=='running'?(b.endsAt-Date.now())/1000:tot(b)*60;
const mm=s=>{s=Math.max(0,Math.ceil(s));return String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0')};
const ot=t=>new Date(t).toLocaleString('en-IN',{day:'2-digit',month:'short',hour:'numeric',minute:'2-digit',hour12:true});
function drawDash(){
 if(!admin)return;
 const c=s=>bk.filter(b=>b.status==s).length,np=c('pending');
 $('#newbar').innerHTML=np?`<div class="newbar">🔔 ${np} NEW ORDER${np>1?'S':''} waiting for approval</div>`:'';
 $('#stats').innerHTML=`<div>Total orders<b>${bk.length}</b></div><div>Pending<b>${np}</b></div><div>Approved<b>${c('approved')}</b></div><div>Rejected<b>${c('rejected')}</b></div>`;
 $('#fl').innerHTML=[['all','All'],['pending','Pending'],['approved','Approved'],['rejected','Rejected']].map(([k,l])=>`<button aria-pressed="${filt==k}" onclick="filt='${k}';drawDash()">${l}</button>`).join('');
 const rows=bk.filter(b=>filt=='all'||b.status==filt);
 if(!rows.length){$('#tbl').innerHTML='<div class="empty">No orders here yet. New orders appear automatically.</div>';return}
 $('#tbl').innerHTML=`<div class="tw"><table><thead><tr><th>Order time</th><th>Order ID</th><th>Customer</th><th>Mobile</th><th>Gender</th><th>Location</th><th>Services (time · price)</th><th>Total time</th><th>Amount</th><th>Payment</th><th>Status</th><th>Timer</th><th>Actions</th></tr></thead><tbody>${rows.map(b=>{
  const a=[];
  if(b.status!='approved')a.push(`<button class="btn g sm" onclick="setS('${b.id}','approved')">Approve</button>`);
  if(b.status!='rejected')a.push(`<button class="btn r sm" onclick="setS('${b.id}','rejected')">Reject</button>`);
  if(b.status=='approved'&&b.run=='idle')a.push(`<button class="btn sm" onclick="runS('${b.id}','start')">Start</button>`);
  if(b.run=='running')a.push(`<button class="btn sm" onclick="runS('${b.id}','done')">Finish</button>`);
  if(b.status=='approved'&&b.run!='done')a.push(`<button class="btn ghost sm" onclick="addT('${b.id}')">+15 min ${rs(EXT)}</button>`);
  if(!b.paid)a.push(`<button class="btn ghost sm" onclick="paidS('${b.id}')">Mark paid</button>`);
  a.push(`<button class="btn ghost sm" onclick="bill('${b.id}')">Bill</button>`,`<a class="btn wa2 sm" target="_blank" rel="noopener" href="${waUrl(`Hello ${b.name}, your CarryMan+ order ${b.id} is ${b.status.toUpperCase()}.`,'91'+b.mob)}">WhatsApp</a>`,`<button class="btn ghost sm" onclick="del('${b.id}')">Delete</button>`);
  return `<tr class="${b.status=='pending'?'new':''}"><td data-l="Order time">${b.status=='pending'?'<div class="newtag">NEW ORDER</div><br>':''}<span class="otime">${ot(b.at)}</span></td><td data-l="Order ID"><b>${b.id}</b></td><td data-l="Customer">${esc(b.name)}</td><td data-l="Mobile" class="green">${esc(b.mob)}</td><td data-l="Gender" class="red">${esc(b.gen)}</td><td data-l="Location" class="red">${esc(b.loc)}</td><td data-l="Services">${b.items.map(i=>`${i.svc}<br><small>${dl(i.dur)} · ${rs(i.price)}</small>`).join('<br>')}</td><td data-l="Total time">${dl(tot(b))}</td><td data-l="Amount"><b>${rs(b.price)}</b></td><td data-l="Payment">${b.pay}<br><small>${b.paid?'Paid':'Unpaid'}</small></td><td data-l="Status"><span class="pill ${b.status}">${b.status[0].toUpperCase()+b.status.slice(1)}</span></td><td data-l="Timer"><span class="clk" data-id="${b.id}">${b.run=='done'?'Done':b.run=='idle'?'-':mm(left(b))}</span></td><td><div class="acts">${a.join('')}</div></td></tr>`}).join('')}</tbody></table></div>`;
}
const setS=(id,s)=>{find(id).status=s;save();drawDash()};
const paidS=id=>{find(id).paid=true;save();drawDash()};
const del=id=>{if(confirm('Delete this order?')){bk=bk.filter(b=>b.id!=id);save();drawDash()}};
function runS(id,a){const b=find(id);if(a=='start'){b.run='running';b.asked=false;b.endsAt=Date.now()+tot(b)*60000}else{b.run='done'}save();drawDash()}
function addT(id){const b=find(id);b.extra+=15;b.price+=EXT;b.ext.push(EXT);b.asked=false;if(b.run=='running')b.endsAt+=15*60000;save();drawDash()}
function bill(id,title){
 const b=find(id),x=b.ext.length;
 const txt=`CarryMan+ BILL ${b.id}\n${lines(b)}${x?`\n- Extra time: ${x*15} min - ${rs(x*EXT)}`:''}\nTotal: ${rs(b.price)}\nPayment: ${b.pay} (${b.paid?'paid':'unpaid'})\nThank you!`;
 openModal(`<h3>${title||'Bill'}</h3><p class="note" style="margin:2px 0 10px">${b.id} · ${esc(b.name)} · ${ot(Date.now())}</p><div class="bill">${b.items.map(i=>`<div><span>${i.svc} (${dl(i.dur)})</span><span>${rs(i.price)}</span></div>`).join('')}${x?`<div><span>Extra time (${x*15} min)</span><span>${rs(x*EXT)}</span></div>`:''}<div class="t"><span>Total</span><span>${rs(b.price)}</span></div><div><span>Payment</span><span>${b.pay} · ${b.paid?'Paid':'Collect cash'}</span></div></div>
 <a class="btn wa2" style="width:100%;margin-top:14px" target="_blank" rel="noopener" href="${waUrl(txt,'91'+b.mob)}">Send bill on WhatsApp</a>
 <button class="btn ghost" style="width:100%;margin-top:8px" onclick="closeModal()">Close</button>`);
}
function askExtend(b){
 openModal(`<div class="ok"><div class="big">⏰</div><h3>Time finishing in 1 minute</h3><p class="note">${esc(b.name)} · ${b.items.map(i=>i.svc).join(', ')}</p>
 <p><b>Time extend 15 minutes?</b><br>Extra charge ${rs(EXT)} will be added to the bill.</p>
 <button class="btn g" style="width:100%" id="yes">Yes, extend 15 min (+${rs(EXT)})</button>
 <button class="btn r" style="width:100%;margin-top:8px;box-shadow:none" id="no">No, finish &amp; bill</button></div>`);
 $('#yes').onclick=()=>{addT(b.id);bill(b.id,'Updated bill (time extended)')};
 $('#no').onclick=()=>{runS(b.id,'done');bill(b.id,'Final bill')};
}
setInterval(()=>{
 if(!admin)return;
 bk.forEach(b=>{if(b.run!='running')return;
  const l=left(b),el=document.querySelector(`.clk[data-id="${b.id}"]`);if(el)el.textContent=l<=0?'Time up':mm(l);
  if(l<=60&&!b.asked&&!$('#modal').classList.contains('open')){b.asked=true;save();askExtend(b)}});
},1000);
addEventListener('storage',e=>{if(e.key=='cm_bk3'){load();drawDash()}});
if(admin){$('#dash').hidden=false;drawDash()}
