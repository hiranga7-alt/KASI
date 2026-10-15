"use strict";

/* ================= Constants ================= */
const VIEWS=[["dashboard","Dashboard"],["salary","Salary & planner"],["transactions","Transactions"],["accounts","Bank Accounts"],["cards","Credit Cards"],["bills","Bills"],["food","Food & Groceries"],["vehicles","Vehicles"],["fuel","Fuel"],["budget","Budget"],["savings","Savings"],["assets","Assets"],["shares","Shares"],["reports","Reports"],["settings","Settings"]];
const CATS={
  Groceries:["Supermarket","Household items","Vegetables","Meat & fish","General groceries"],
  Food:["Restaurants","Takeaway","Coffee","Delivery","Lunch","Dinner","Snacks"],
  Vehicle:["Service","Repairs","Insurance","Revenue licence","Tyres","Battery","Parking","Highway toll","Washing","Accessories","Leasing/loan","Other"],
  Shopping:["Clothing","Electronics","Home","Online","Gifts","Other"],
  Entertainment:["Movies","Events","Travel","Hobbies","Other"],
  Bills:["Electricity","Water","Internet","Mobile","Insurance","Rent","Loan","School/Education","Streaming subscriptions","TV","Maintenance","Other"],
  Family:["Children","Parents","Household help","Donations","Other"],
  Medical:["Doctor","Pharmacy","Lab tests","Hospital","Other"],
  Education:["Fees","Books","Classes","Other"],
  Personal:["Salon","Fitness","Personal care","Other"],
  "Bank charges":["Transfer fee","Card fee","Interest","Other"],
  Other:["Other"]
};
const BILL_CATS=CATS.Bills;
const BUDGET_CATS=["Groceries","Food","Fuel","Vehicle","Shopping","Entertainment","Bills","Family","Medical","Other"];
const METHODS=["Cash","Bank Account","Debit Card","Credit Card","Bank Transfer","Digital Wallet"];
const ACCT_TYPES=["Salary","Current","Savings","Fixed Deposit","Investment","Cash","Digital Wallet"];
const SAVING_TYPES=["Savings","Fixed Deposit","Investment"];
const SPENDABLE=["Salary","Current","Cash","Digital Wallet"];
const FUEL_TYPES=["Petrol 92","Petrol 95","Auto Diesel","Super Diesel","Electric charge"];
const FREQ={Monthly:1,Quarterly:3,"Every 6 months":6,Annually:12,Once:0};
const MAINT=["Service","Repairs","Tyres","Battery","Washing","Accessories"];
const TYPE_LABEL={income:"Income",expense:"Expense",cc_purchase:"Credit card purchase",cc_payment:"Credit card payment",bill:"Bill payment",fuel:"Fuel",transfer:"Transfer",refund:"Refund",asset_buy:"Asset purchase",asset_sell:"Asset sale",share_buy:"Share purchase",share_sell:"Share sale",dividend:"Dividend",share_adjust:"Bonus or split"};
const SECTORS=["Banks","Diversified Financials","Insurance","Capital Goods","Consumer Services","Food, Beverage & Tobacco","Materials","Energy","Utilities","Telecommunication","Real Estate","Health Care","Retailing","Transportation","Consumer Durables","Other"];
const CSE_SUGGEST=[["JKH.N0000","John Keells Holdings","Capital Goods"],["COMB.N0000","Commercial Bank of Ceylon","Banks"],["HNB.N0000","Hatton National Bank","Banks"],["SAMP.N0000","Sampath Bank","Banks"],["SEYB.N0000","Seylan Bank","Banks"],["NDB.N0000","National Development Bank","Banks"],["DIAL.N0000","Dialog Axiata","Telecommunication"],["SLTL.N0000","Sri Lanka Telecom","Telecommunication"],["LOLC.N0000","LOLC Holdings","Diversified Financials"],["HAYL.N0000","Hayleys","Capital Goods"],["CTC.N0000","Ceylon Tobacco Company","Food, Beverage & Tobacco"],["DIST.N0000","Distilleries Company of Sri Lanka","Food, Beverage & Tobacco"],["MELS.N0000","Melstacorp","Food, Beverage & Tobacco"],["CARG.N0000","Cargills (Ceylon)","Food, Beverage & Tobacco"],["CCS.N0000","Ceylon Cold Stores","Food, Beverage & Tobacco"],["LIOC.N0000","Lanka IOC","Energy"],["HHL.N0000","Hemas Holdings","Capital Goods"],["AEL.N0000","Access Engineering","Capital Goods"],["TJL.N0000","Teejay Lanka","Consumer Durables"],["RCL.N0000","Royal Ceramics Lanka","Capital Goods"],["SUN.N0000","Sunshine Holdings","Capital Goods"],["VONE.N0000","Vallibel One","Capital Goods"],["EXPO.N0000","Expolanka Holdings","Transportation"]];
const ASSET_CATS=["Land & property","Vehicle","Gold & jewellery","Shares & unit trusts","Electronics","Furniture & appliances","Business","Collectibles","Other"];

/* ================= Utilities ================= */
const $=s=>document.querySelector(s);
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,8);
const nf0=new Intl.NumberFormat("en-LK",{maximumFractionDigits:0});
const nf2=new Intl.NumberFormat("en-LK",{minimumFractionDigits:2,maximumFractionDigits:2});
function rs(n,dec){n=+n||0;const s=(dec||(!Number.isInteger(n)&&Math.abs(n)<1e5)?nf2:nf0).format(Math.abs(n));return (n<0?"−":"")+"Rs. "+s}
const rs0=n=>rs(Math.round(+n||0));
const pad=n=>String(n).padStart(2,"0");
const ymd=d=>d.getFullYear()+"-"+pad(d.getMonth()+1)+"-"+pad(d.getDate());
const parse=s=>{const [y,m,d]=s.split("-").map(Number);return new Date(y,m-1,d||1)};
const today=()=>ymd(new Date());
const dim=(y,m)=>new Date(y,m+1,0).getDate();
function onDay(y,m,day){const d=new Date(y,m,1);const yy=d.getFullYear(),mm=d.getMonth();return new Date(yy,mm,Math.min(day,dim(yy,mm)))}
function addMonths(s,n,day){const d=parse(s);return ymd(onDay(d.getFullYear(),d.getMonth()+n,day||d.getDate()))}
const addDays=(s,n)=>{const d=parse(s);d.setDate(d.getDate()+n);return ymd(d)};
const daysBetween=(a,b)=>Math.round((parse(b)-parse(a))/864e5);
const mkey=s=>s.slice(0,7);
const monthName=(k,short)=>{const [y,m]=k.split("-").map(Number);return new Date(y,m-1,1).toLocaleDateString("en-GB",{month:short?"short":"long",year:short?"2-digit":"numeric"})};
const fdate=(s,opt)=>parse(s).toLocaleDateString("en-GB",opt||{day:"numeric",month:"short",year:"numeric"});
const fday=s=>parse(s).toLocaleDateString("en-GB",{weekday:"short",day:"numeric",month:"short"});
function lastMonths(n,endKey){const out=[];let d=parse((endKey||mkey(today()))+"-01");for(let i=n-1;i>=0;i--){const x=new Date(d.getFullYear(),d.getMonth()-i,1);out.push(x.getFullYear()+"-"+pad(x.getMonth()+1))}return out}
function toast(msg){const t=document.createElement("div");t.className="toast";t.textContent=msg;t.setAttribute("role","status");document.body.appendChild(t);setTimeout(()=>t.remove(),2600)}
const sum=(arr,f)=>arr.reduce((a,x)=>a+(f?f(x):x),0);

/* ================= Server API & storage ================= */
const API={
  async req(method,path,body){
    let r;
    try{r=await fetch("/api"+path,{method,headers:{"Content-Type":"application/json","X-Kasi":"1"},body:body===undefined?undefined:JSON.stringify(body),credentials:"same-origin",cache:"no-store"})}
    catch(e){const x=new Error("You're offline.");x.code="offline";throw x}
    let data=null;try{data=await r.json()}catch(e){}
    if(!r.ok){const x=new Error((data&&data.error)||("Request failed ("+r.status+")"));x.code=(data&&data.code)||("http_"+r.status);x.status=r.status;
      if(x.code==="auth"&&Store.user&&path!=="/me")onSignedOut();throw x}
    return data;
  }
};
// Every change goes into an outbox first (kept on the device), then syncs to the server one at a time.
// If the phone is offline the outbox waits and syncs when the connection returns.
const Store={mode:"cloud",user:null,docs:{},ob:{},seq:0,flushing:false,
  key(k){return"kasi:"+k+":"+(this.user||"")},
  loadOb(){try{this.ob=JSON.parse(localStorage.getItem(this.key("outbox"))||"{}")}catch(e){this.ob={}}},
  persistOb(){try{localStorage.setItem(this.key("outbox"),JSON.stringify(this.ob))}catch(e){try{const o={};for(const k in this.ob)if(!k.startsWith("rc-"))o[k]=this.ob[k];localStorage.setItem(this.key("outbox"),JSON.stringify(o))}catch(e2){}}},
  saveSnap(){try{localStorage.setItem(this.key("snap"),JSON.stringify(this.docs))}catch(e){}},
  saveSnapLater(){clearTimeout(this._snapT);this._snapT=setTimeout(()=>this.saveSnap(),400)},
  readSnap(){try{return JSON.parse(localStorage.getItem(this.key("snap"))||"null")}catch(e){return null}},
  clearLocal(){for(const k of ["outbox","snap"])try{localStorage.removeItem(this.key(k))}catch(e){}this.ob={};this.docs={}},
  async getAll(){const r=await API.req("GET","/all");this.docs=(r&&r.docs)||{};this.saveSnap();return JSON.parse(JSON.stringify(this.docs))},
  async get(name){if(this.ob[name])return this.ob[name].d;const r=await API.req("GET","/doc/"+name);return r?r.data:null},
  put(name,data){
    if(!name.startsWith("rc-")){if(data===null)delete this.docs[name];else this.docs[name]=data;this.saveSnapLater()}
    this.ob[name]={s:(++this.seq)+"-"+Date.now(),d:data===null?null:JSON.parse(JSON.stringify(data))};this.persistOb();renderStatus();this.flush();
  },
  pending(){return Object.keys(this.ob).length},
  async flush(){
    if(this.flushing||!this.user)return;this.flushing=true;
    try{
      while(true){
        const names=Object.keys(this.ob);if(!names.length)break;
        const name=names[0],e=this.ob[name];
        try{
          if(e.d===null)await API.req("DELETE","/doc/"+name);else await API.req("PUT","/doc/"+name,e.d);
          if(this.ob[name]&&this.ob[name].s===e.s)delete this.ob[name];this.persistOb();
          if(this.mode!=="cloud"){this.mode="cloud"}
        }catch(x){
          if(x.code==="offline"||x.status>=500){this.mode="offline";clearTimeout(this._rt);this._rt=setTimeout(()=>this.flush(),15000);break}
          if(x.code==="auth")break;
          if(this.ob[name]&&this.ob[name].s===e.s)delete this.ob[name];this.persistOb();
          toast(x.code==="too_large"?"That entry is too large to save. Try a smaller receipt photo.":"A change couldn't be saved: "+x.message);
        }
        renderStatus();
      }
    }finally{this.flushing=false;renderStatus()}
  }
};
window.addEventListener("online",()=>Store.flush());
function renderStatus(){
  const n=Store.pending();const off=Store.mode==="offline";
  const txt=off?(n?`Offline. ${n} change${n===1?"":"s"} will sync when you're back online.`:"Offline. Showing your last synced data."):(n?"Saving…":"All changes saved");
  const st=$("#storeStatus");if(st)st.textContent=Store.user?txt:"";
  const bar=$("#netbar");if(bar){bar.hidden=!off;bar.textContent=txt}
}

/* ================= State ================= */
let S=null;       // settings + entities
let TX={};        // month -> [tx]
let UI={view:"dashboard",filters:{},reportMonth:mkey(today()),budgetMonth:mkey(today()),foodMonth:mkey(today())};

function freshState(){return{v:1,accounts:[{id:"cash",bank:"",name:"Cash in hand",type:"Cash",opening:0,nick:"",currency:"LKR"}],cards:[],vehicles:[],bills:[],assets:[],stocks:[],budgets:{},settings:{salaryDay:25,expectedSalary:0,plannedSavings:0,dueSoon:5,lastMethod:"Bank Account",lastAcct:"",theme:"auto"},months:[]}}
function saveState(){Store.put("state",S)}
function saveMonth(m){Store.put("tx-"+m,{items:TX[m]||[]})}
function allTx(){const out=[];for(const m of Object.keys(TX))out.push(...TX[m]);return out.sort((a,b)=>a.date<b.date?-1:a.date>b.date?1:(a.ts||0)-(b.ts||0))}
let _cache=null; const invalidate=()=>{_cache=null};
function L(){if(!_cache)_cache={all:allTx()};return _cache}

function upsertTx(t,old){
  if(old){const om=mkey(old.date);TX[om]=(TX[om]||[]).filter(x=>x.id!==old.id);saveMonth(om)}
  const m=mkey(t.date);(TX[m]=TX[m]||[]).push(t);
  if(!S.months.includes(m)){S.months.push(m);S.months.sort();saveState()}
  saveMonth(m);invalidate();
}
function deleteTx(t){
  if(t.type==="asset_sell"){const a=asset(t.assetId);if(a&&a.sold&&a.sold.txId===t.id){delete a.sold;saveState()}}
  if(t.type==="share_buy"){const st=stock(t.stockId);if(st&&st.createdBy===t.id&&!(st.prices||[]).length&&!L().all.some(x=>x.stockId===st.id&&x.id!==t.id)){S.stocks=S.stocks.filter(x=>x!==st);saveState()}}
  if(t.type==="asset_buy"){const a=asset(t.assetId);if(a&&a.createdBy===t.id&&!(a.values||[]).length&&!(+a.initCost)&&!L().all.some(x=>x.assetId===a.id&&x.id!==t.id)){S.assets=S.assets.filter(x=>x!==a);saveState()}}
  const m=mkey(t.date);TX[m]=(TX[m]||[]).filter(x=>x.id!==t.id);saveMonth(m);if(t.receipt)Store.put("rc-"+t.id,null);invalidate()}
const findTx=id=>L().all.find(t=>t.id===id);
const acct=id=>S.accounts.find(a=>a.id===id);
const card=id=>S.cards.find(c=>c.id===id);
const veh=id=>S.vehicles.find(v=>v.id===id);
const bill=id=>S.bills.find(b=>b.id===id);
const asset=id=>(S.assets||[]).find(a=>a.id===id);
function assetBuys(a,upto){return L().all.filter(t=>t.type==="asset_buy"&&t.assetId===a.id&&(!upto||t.date<=upto))}
function assetCost(a,upto){return(+a.initCost||0)+sum(assetBuys(a,upto),t=>+t.amount)}
function assetStart(a){const d=[a.initDate,...(a.values||[]).map(v=>v.date),...assetBuys(a).map(t=>t.date)].filter(Boolean).sort();return d[0]||null}
// Value = latest valuation (or what you paid), grown by the yearly rate, plus purchases added since.
function assetValue(a,date){date=date||today();if(a.sold&&a.sold.date<=date)return 0;const st=assetStart(a);if(!st||st>date)return 0;
  const p=(+a.yearly||0)/100;const grow=(amt,from)=>p&&from?amt*Math.pow(1+p,Math.max(0,daysBetween(from,date))/365.25):amt;
  let val=null,vd=null;for(const v of(a.values||[]))if(v.date<=date){val=+v.value;vd=v.date}
  const buys=assetBuys(a,date);
  if(val!==null)return grow(val,vd)+sum(buys.filter(t=>t.date>vd),t=>grow(+t.amount,t.date));
  return(+a.initCost?grow(+a.initCost,a.initDate||st):0)+sum(buys,t=>grow(+t.amount,t.date))}
function netWorth(date){date=date||today();let n=0;for(const a of S.accounts)if(isLKR(a))n+=acctBal(a.id,date);for(const c of S.cards)n-=cardOut(c.id,date);for(const a of(S.assets||[]))n+=assetValue(a,date);return n+portfolioValue(date)}
/* ---- Shares: average-cost positions ---- */
const stock=id=>(S.stocks||[]).find(x=>x.id===id);
const stockLabel=st=>st?st.symbol+(st.name?", "+st.name:""):"(removed company)";
const fq=n=>{n=+n||0;return Number.isInteger(n)?nf0.format(n):n.toLocaleString("en-LK",{maximumFractionDigits:4})};
function positions(upto,excludeId){const P={};for(const t of L().all){if(upto&&t.date>upto)break;if(!t.stockId||t.id===excludeId)continue;
  const p=P[t.stockId]||(P[t.stockId]={qty:0,cost:0,realized:0,divs:0,lastPrice:null,lastDate:null});
  if(t.type==="share_buy"){p.qty+=+t.qty;p.cost+=+t.amount;p.lastPrice=+t.price;p.lastDate=t.date}
  else if(t.type==="share_sell"){const q=Math.min(+t.qty,p.qty);const avg=p.qty?p.cost/p.qty:0;const c=avg*q;p.cost-=c;p.qty-=q;p.realized+=(+t.amount)-c;p.lastPrice=+t.price;p.lastDate=t.date;if(p.qty<1e-9){p.qty=0;p.cost=0}}
  else if(t.type==="share_adjust"){p.qty=Math.max(0,p.qty+(+t.qty))}
  else if(t.type==="dividend"){p.divs+=+t.amount}}
  return P}
function stockPrice(st,date,p){date=date||today();let pr=null,pd="";for(const x of(st.prices||[]))if(x.date<=date&&x.date>=pd){pr=+x.price;pd=x.date}
  if(p&&p.lastDate&&p.lastDate>pd&&p.lastDate<=date){pr=p.lastPrice;pd=p.lastDate}return{price:pr,date:pd}}
function holdingValue(st,p,date){if(!p||p.qty<=0)return 0;const pr=stockPrice(st,date,p).price;return p.qty*(pr!=null?pr:(p.qty?p.cost/p.qty:0))}
function portfolioValue(date){const P=positions(date);let v=0;for(const st of(S.stocks||[]))v+=holdingValue(st,P[st.id],date);return v}
function defaultInvestAcct(){return(S.accounts.find(a=>a.type==="Investment")||S.accounts.find(a=>a.type==="Savings")||S.accounts.find(a=>a.type==="Salary")||S.accounts[0]||{}).id}
const acctLabel=a=>a?(a.bank?a.bank+" ":"")+a.name:"(removed account)";
const cardLabel=c=>c?c.name:"(removed card)";

/* ================= Accounting engine ================= */
// Each transaction produces account deltas, card-outstanding deltas, spending and income.
function eff(t){
  const amt=+t.amount||0,fee=+t.fee||0,d=[];let spend=0,income=0,cat=t.cat||"Other";
  const pay=sign=>{if(t.card)d.push(["c",t.card,sign*amt]);else if(t.acct)d.push(["a",t.acct,-sign*amt])};
  switch(t.type){
    case "income":d.push(["a",t.acct,amt]);income=amt;break;
    case "expense":case "cc_purchase":pay(1);spend=amt;break;
    case "fuel":pay(1);spend=amt;cat="Fuel";break;
    case "bill":cat="Bills";if(!t.already){pay(1);spend=amt}break;
    case "transfer":d.push(["a",t.acct,-(amt+fee)]);d.push(["a",t.toAcct,amt]);if(fee){spend=fee;cat="Bank charges"}break;
    case "cc_payment":d.push(["a",t.acct,-(amt+fee)]);d.push(["c",t.card,-amt]);if(fee){spend=fee;cat="Bank charges"}break;
    case "refund":pay(-1);spend=-amt;break;
    case "asset_buy":pay(1);if(t.countSpend){spend=amt;cat=t.cat||"Shopping"}break;
    case "asset_sell":d.push(["a",t.acct,amt]);break;
    case "share_buy":if(t.acct&&!t.noCash)d.push(["a",t.acct,-amt]);break;
    case "share_sell":d.push(["a",t.acct,amt]);break;
    case "dividend":d.push(["a",t.acct,amt]);income=amt;break;
  }
  return{d,spend,income,cat};
}
const budgetCat=c=>BUDGET_CATS.includes(c)?c:"Other";
function inRange(t,from,to){return t.date>=from&&t.date<=to}
function monthRange(k){const [y,m]=k.split("-").map(Number);return[k+"-01",k+"-"+pad(dim(y,m-1))]}
function acctBal(id,upto){const a=acct(id);let b=+(a&&a.opening)||0;for(const t of L().all){if(upto&&t.date>upto)break;for(const [k,i,v] of eff(t).d)if(k==="a"&&i===id)b+=v}return b}
function cardOut(id,upto){const c=card(id);let b=+(c&&c.opening)||0;for(const t of L().all){if(upto&&t.date>upto)break;for(const [k,i,v] of eff(t).d)if(k==="c"&&i===id)b+=v}return b}
function isLKR(a){return !a.currency||a.currency==="LKR"}
function totals(from,to){
  const r={income:0,salary:0,otherIncome:0,spend:0,byCat:{},bySub:{},savingsIn:0,transfers:0,ccPay:0,ccPurch:0,assetBuy:0,assetSell:0,shareBuy:0,shareSell:0,dividends:0};
  for(const t of L().all){if(!inRange(t,from,to))continue;const e=eff(t);
    r.income+=e.income;if(t.type==="income"){if(t.sub==="Salary")r.salary+=e.income;else r.otherIncome+=e.income}
    if(e.spend){r.spend+=e.spend;r.byCat[e.cat]=(r.byCat[e.cat]||0)+e.spend;const sk=e.cat+"|"+(t.type==="fuel"?(t.fuelType||"Fuel"):(t.sub||"Other"));r.bySub[sk]=(r.bySub[sk]||0)+e.spend}
    if(t.type==="transfer"){r.transfers+=+t.amount;const to=acct(t.toAcct),fr=acct(t.acct);
      if(to&&SAVING_TYPES.includes(to.type)&&!(fr&&SAVING_TYPES.includes(fr.type)))r.savingsIn+=+t.amount;
      if(fr&&SAVING_TYPES.includes(fr.type)&&!(to&&SAVING_TYPES.includes(to.type)))r.savingsIn-=+t.amount;}
    if(t.type==="cc_payment")r.ccPay+=+t.amount;
    if(t.type==="share_buy"&&!t.noCash)r.shareBuy+=+t.amount;if(t.type==="share_sell")r.shareSell+=+t.amount;if(t.type==="dividend"){r.dividends+=+t.amount;r.otherIncome+=+t.amount}
    if(t.type==="asset_buy")r.assetBuy+=+t.amount;if(t.type==="asset_sell")r.assetSell+=+t.amount;
    if(t.card&&(t.type==="cc_purchase"||t.type==="fuel"||t.type==="bill")&&!t.already)r.ccPurch+=+t.amount;
  }
  return r;
}
function transferKind(fromId,toId){const f=acct(fromId),t=acct(toId);if(!f||!t)return"Bank transfer";
  if(SAVING_TYPES.includes(t.type)&&!SAVING_TYPES.includes(f.type))return t.type==="Investment"?"To investment":"Savings transfer";
  if(SAVING_TYPES.includes(f.type)&&!SAVING_TYPES.includes(t.type))return"From savings";
  if(t.type==="Cash"&&f.type!=="Cash")return"Cash withdrawal";
  if(f.type==="Cash"&&t.type!=="Cash")return"Cash deposit";
  return"Bank transfer"}

/* Salary cycle */
function cycle(ref){ref=ref||today();const day=+S.settings.salaryDay||25;const d=parse(ref);
  let start=onDay(d.getFullYear(),d.getMonth(),day);if(ymd(start)>ref)start=onDay(d.getFullYear(),d.getMonth()-1,day);
  const next=onDay(start.getFullYear(),start.getMonth()+1,day);
  return{start:ymd(start),next:ymd(next),end:addDays(ymd(next),-1),daysLeft:Math.max(1,daysBetween(ref,ymd(next))),length:daysBetween(ymd(start),ymd(next))}}

/* Credit card statements */
function cardStatus(c,ref){ref=ref||today();const d=parse(ref);const sd=+c.stmtDay||1,dd=+c.dueDay||sd;
  let stmt=onDay(d.getFullYear(),d.getMonth(),sd);if(ymd(stmt)>ref)stmt=onDay(d.getFullYear(),d.getMonth()-1,sd);
  const stmtS=ymd(stmt);let due=onDay(stmt.getFullYear(),stmt.getMonth(),dd);if(ymd(due)<=stmtS)due=onDay(stmt.getFullYear(),stmt.getMonth()+1,dd);
  const dueS=ymd(due);const outstanding=cardOut(c.id);const stmtBal=Math.max(0,cardOut(c.id,stmtS));
  let paidSince=0,purch=0;for(const t of L().all){if(t.date>stmtS&&t.date<=ref){if(t.type==="cc_payment"&&t.card===c.id)paidSince+=+t.amount}}
  const amountDue=Math.max(0,stmtBal-paidSince);
  const minPay=Math.min(amountDue,Math.max(stmtBal*(+c.minPct||5)/100,+c.minFixed||0)-Math.min(paidSince,stmtBal));
  const days=daysBetween(ref,dueS);let status,cls;
  if(stmtBal<=0){status="Nothing due";cls="b-paid"}
  else if(amountDue<=0){status="Paid";cls="b-paid"}
  else if(days<0){status="Overdue";cls="b-over"}
  else if(paidSince>0){status="Partially paid";cls="b-part"}
  else{status=days<=(+S.settings.dueSoon||5)?"Due soon":"Unpaid";cls=days<=(+S.settings.dueSoon||5)?"b-soon":"b-up"}
  const limit=+c.limit||0;
  return{stmt:stmtS,due:dueS,stmtBal,paidSince,amountDue,minPay:Math.max(0,minPay),days,status,cls,outstanding,available:limit-outstanding,limit,nextStmt:ymd(onDay(stmt.getFullYear(),stmt.getMonth()+1,sd))}}

/* Bills */
function billOccurrences(b,from,to){const out=[];if(!b.firstDue)return out;const step=FREQ[b.freq]??1;const day=+parse(b.firstDue).getDate();
  if(step===0){if(b.firstDue>=from&&b.firstDue<=to)out.push(b.firstDue);return out}
  let i=0,d=b.firstDue;while(d<=to&&i<600){if(d>=from)out.push(d);i++;d=addMonths(b.firstDue,step*i,day)}return out}
function billPaidTx(b,due){return L().all.find(t=>t.type==="bill"&&t.billId===b.id&&t.billDue===due)}
function billItems(from,to){const items=[];const t0=today();const soon=+S.settings.dueSoon||5;
  for(const b of S.bills){if(b.active===false)continue;for(const due of billOccurrences(b,from,to)){const p=billPaidTx(b,due);let status,cls;
    if(p){status="Paid";cls="b-paid"}else if(due<t0){status="Overdue";cls="b-over"}else if(daysBetween(t0,due)<=soon){status="Due soon";cls="b-soon"}else{status="Upcoming";cls="b-up"}
    items.push({b,due,paid:p,status,cls,amount:p?+p.amount:+b.amount||0})}}
  return items.sort((a,b)=>a.due<b.due?-1:1)}
function upcomingBills(){const t0=today();return billItems(addMonths(t0,-3),addDays(t0,40)).filter(i=>!i.paid||mkey(i.paid.date)===mkey(t0))}

/* Vehicle costs */
function vehBucket(t){if(t.type==="fuel")return"fuel";const s=t.sub||"";if(t.type==="bill"){if(s==="Insurance")return"ins";if(s==="Loan")return"loan";if(s==="Maintenance")return"maint";return"other"}
  if(MAINT.includes(s))return"maint";if(s==="Insurance")return"ins";if(s==="Leasing/loan")return"loan";return"other"}
function vehCosts(id,from,to){const r={fuel:0,maint:0,ins:0,loan:0,other:0,total:0,litres:0,fills:0};for(const t of L().all){if(t.vehicle!==id)continue;if(from&&!inRange(t,from,to))continue;const e=eff(t);if(!e.spend)continue;const k=vehBucket(t);r[k]+=e.spend;r.total+=e.spend;if(t.type==="fuel"){r.litres+=+t.litres||0;r.fills++}}return r}
function vehOdo(v){let o=+v.odometer||0;for(const t of L().all)if(t.vehicle===v.id&&+t.odo>o)o=+t.odo;return o}
function fuelStats(id){const f=L().all.filter(t=>t.type==="fuel"&&t.vehicle===id&&+t.odo>0).sort((a,b)=>+a.odo-+b.odo);
  if(f.length<2)return null;const km=+f[f.length-1].odo-+f[0].odo;if(km<=0)return null;const later=f.slice(1);
  const cost=sum(later,t=>+t.amount),lit=sum(later,t=>+t.litres||0);return{km,perKm:cost/km,kmpl:lit>0?km/lit:null}}

/* Planner */
function planner(){const c=cycle();const t0=today();const tt=totals(c.start,t0);
  const salaryRecv=tt.salary;const expected=+S.settings.expectedSalary||0;const salary=salaryRecv||expected;
  const bills=billItems(c.start,c.end);const fixed=sum(bills.filter(i=>i.b.category!=="Loan"),i=>i.amount);const loans=sum(bills.filter(i=>i.b.category==="Loan"),i=>i.amount);
  let ccDue=0,ccDueLeft=0;for(const cd of S.cards){const st=cardStatus(cd);if(st.due>=c.start&&st.due<c.next){ccDue+=st.stmtBal;ccDueLeft+=st.amountDue}else if(st.amountDue>0&&st.due<c.start){ccDue+=st.amountDue;ccDueLeft+=st.amountDue}}
  const bud=S.budgets||{};const exp={Groceries:+bud.Groceries||0,Food:+bud.Food||0,Fuel:+bud.Fuel||0,Vehicle:+bud.Vehicle||0};
  const savingsPlan=+S.settings.plannedSavings||0;
  const available=salary-fixed-ccDue-loans-savingsPlan-exp.Groceries-exp.Food-exp.Fuel-exp.Vehicle;
  const planned=["Bills","Groceries","Food","Fuel","Vehicle"];
  let discretionary=0,overrun=0;for(const [k,v] of Object.entries(tt.byCat)){if(!planned.includes(k))discretionary+=v}
  for(const k of ["Groceries","Food","Fuel","Vehicle"])overrun+=Math.max(0,(tt.byCat[k]||0)-exp[k]);
  // Card purchases on non-planned categories reduce the envelope the same way; card payments do not (no double counting).
  const remainingPlan=available-discretionary-overrun;
  // Cash reality check
  let liquid=0;for(const a of S.accounts)if(SPENDABLE.includes(a.type)&&isLKR(a))liquid+=acctBal(a.id);
  const unpaidBills=sum(bills.filter(i=>!i.paid&&!(i.b.payCard)),i=>i.amount);
  const savingsLeft=Math.max(0,savingsPlan-Math.max(0,tt.savingsIn));
  let budLeft=0;for(const k of ["Groceries","Food","Fuel","Vehicle"])budLeft+=Math.max(0,exp[k]-(tt.byCat[k]||0));
  // card spend within cycle not yet paid is covered by ccDue of the next cycle; we only reserve what's due before next salary
  const cashCheck=liquid-unpaidBills-ccDueLeft-savingsLeft-budLeft;
  const safe=cashCheck;
  return{c,salary,salaryRecv,expected,fixed,loans,ccDue,ccDueLeft,savingsPlan,exp,available,dailyPlan:available/c.length,discretionary,overrun,remainingPlan,liquid,unpaidBills,savingsLeft,budLeft,cashCheck,safe,daily:safe/c.daysLeft}}

/* ================= Charts (SVG) ================= */
function niceMax(v){if(v<=0)return 1;const p=Math.pow(10,Math.floor(Math.log10(v)));const n=v/p;return(n<=1?1:n<=2?2:n<=5?5:10)*p}
const short=n=>{const a=Math.abs(n);return(n<0?"−":"")+(a>=1e6?(a/1e6).toFixed(a>=1e7?0:1)+"M":a>=1e3?(a/1e3).toFixed(0)+"k":String(Math.round(a)))};
function barChart(labels,series){const W=640,H=200,L0=40,B=24,T=10;const max=niceMax(Math.max(1,...series.flatMap(s=>s.values)));const n=labels.length;const gw=(W-L0)/n;const bw=Math.min(22,gw*.72/series.length);
  let g="";for(let i=0;i<=4;i++){const y=T+(H-T-B)*(1-i/4);g+=`<line x1="${L0}" x2="${W}" y1="${y}" y2="${y}" stroke="var(--line)"/><text x="${L0-6}" y="${y+4}" text-anchor="end">${short(max*i/4)}</text>`}
  labels.forEach((lab,i)=>{const cx=L0+gw*i+gw/2;series.forEach((s,j)=>{const v=Math.max(0,s.values[i]);const h=(H-T-B)*v/max;const x=cx-(bw*series.length)/2+j*bw;g+=`<rect x="${x+1}" y="${H-B-h}" width="${bw-2}" height="${h}" rx="3" fill="${s.color}"><title>${esc(s.name)} ${esc(lab)}: ${rs0(s.values[i])}</title></rect>`});g+=`<text x="${cx}" y="${H-6}" text-anchor="middle">${esc(lab)}</text>`});
  return`<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Bar chart">${g}</svg><div class="legend">${series.map(s=>`<span><i style="background:${s.color}"></i>${esc(s.name)}</span>`).join("")}</div>`}
function lineChart(labels,series){const W=640,H=190,L0=44,B=24,T=12;const vals=series.flatMap(s=>s.values);let mx=niceMax(Math.max(1,...vals));let mn=Math.min(0,...vals);if(mn<0)mn=-niceMax(-mn);const n=labels.length;const X=i=>L0+(W-L0-10)*(n<2?.5:i/(n-1));const Y=v=>T+(H-T-B)*(1-(v-mn)/(mx-mn));
  let g="";for(let i=0;i<=4;i++){const v=mn+(mx-mn)*i/4;const y=Y(v);g+=`<line x1="${L0}" x2="${W}" y1="${y}" y2="${y}" stroke="var(--line)"${Math.abs(v)<1e-9?' stroke-width="1.5"':""}/><text x="${L0-6}" y="${y+4}" text-anchor="end">${short(v)}</text>`}
  labels.forEach((l,i)=>{if(n<=12||i%2===0)g+=`<text x="${X(i)}" y="${H-6}" text-anchor="middle">${esc(l)}</text>`});
  for(const s of series){const pts=s.values.map((v,i)=>X(i)+","+Y(v)).join(" ");g+=`<polyline points="${pts}" fill="none" stroke="${s.color}" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>`;s.values.forEach((v,i)=>{g+=`<circle cx="${X(i)}" cy="${Y(v)}" r="3.5" fill="var(--surface)" stroke="${s.color}" stroke-width="2"><title>${esc(s.name)} ${esc(labels[i])}: ${rs0(v)}</title></circle>`})}
  return`<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Line chart">${g}</svg>${series.length>1?`<div class="legend">${series.map(s=>`<span><i style="background:${s.color}"></i>${esc(s.name)}</span>`).join("")}</div>`:""}`}
function hbars(items,opt){opt=opt||{};items=items.filter(i=>Math.abs(i.value)>0||opt.keepZero);if(!items.length)return`<p class="faint small">${opt.empty||"Nothing recorded yet."}</p>`;const max=Math.max(1,...items.map(i=>Math.abs(i.max||i.value)));
  return`<div class="hbars">${items.map(i=>{const pct=Math.min(100,Math.abs(i.value)/max*100);return`<div class="hbar"><span class="lab" title="${esc(i.label)}">${esc(i.label)}</span><div class="bar"><i style="width:${pct}%;${i.color?"background:"+i.color:""}"></i></div><span class="num small">${i.text||rs0(i.value)}</span></div>`}).join("")}</div>`}
const pctCls=p=>p>=100?"w100":p>=90?"w90":p>=75?"w75":"";

/* ================= Rendering ================= */
const ICON={home:'<path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>',
  list:'<path d="M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
  pie:'<path d="M12 3v9h9A9 9 0 1 1 12 3z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M15 3.5A9 9 0 0 1 20.5 9H15z" fill="currentColor"/>',
  more:'<circle cx="5" cy="12" r="1.8" fill="currentColor"/><circle cx="12" cy="12" r="1.8" fill="currentColor"/><circle cx="19" cy="12" r="1.8" fill="currentColor"/>',
  plus:'<path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>'};
const svg=(p,s)=>`<svg viewBox="0 0 24 24" width="${s||22}" height="${s||22}" aria-hidden="true">${p}</svg>`;

function renderNav(){
  $("#sidenav").innerHTML=VIEWS.map(([k,l])=>`<button class="nav" data-act="nav" data-v="${k}" ${UI.view===k?'aria-current="page"':""}>${l}</button>`).join("");
  const b=[["dashboard","Home","home"],["add","Add","plus"],["transactions","Transactions","list"],["budget","Budget","pie"],["more","More","more"]];
  const moreActive=!["dashboard","transactions","budget"].includes(UI.view);
  $("#bottomnav").innerHTML=b.map(([k,l,i])=>k==="add"?`<button class="plus" data-act="add" aria-label="Add transaction"><span class="circle">${svg(ICON.plus,26)}</span></button>`:`<button data-act="${k==="more"?"more":"nav"}" data-v="${k}" ${(UI.view===k||(k==="more"&&moreActive))?'aria-current="page"':""}>${svg(ICON[i])}<span>${l}</span></button>`).join("");
  renderStatus();
}
function render(){renderNav();const v=$("#view");const fn=VIEW_FN[UI.view]||VIEW_FN.dashboard;v.innerHTML=fn();if(POST[UI.view])POST[UI.view]()}
function go(v){UI.view=v;render();window.scrollTo(0,0)}
const head=(title,sub,btns)=>`<div class="topline"><div><h1>${title}</h1>${sub?`<p class="muted" style="margin-top:4px">${sub}</p>`:""}</div><div style="display:flex;gap:8px;flex-wrap:wrap">${btns||""}</div></div>`;
const monthPicker=(key,val)=>`<select class="btn" data-change="${key}" aria-label="Month">${lastMonths(18).reverse().map(m=>`<option value="${m}" ${m===val?"selected":""}>${monthName(m)}</option>`).join("")}</select>`;

function txTitle(t){if(t.stockId){const st=stock(t.stockId),sym=st?st.symbol:"shares";if(t.type==="share_buy")return`Bought ${fq(t.qty)} ${sym}`;if(t.type==="share_sell")return`Sold ${fq(t.qty)} ${sym}`;if(t.type==="dividend")return"Dividend, "+sym;if(t.type==="share_adjust")return`${+t.qty>=0?"+":""}${fq(t.qty)} ${sym} shares`}if(t.type==="asset_buy")return"Bought "+((asset(t.assetId)||{}).name||"asset");if(t.type==="asset_sell")return"Sold "+((asset(t.assetId)||{}).name||"asset");if(t.type==="transfer")return t.kind||"Transfer";if(t.type==="cc_payment")return"Payment to "+cardLabel(card(t.card));if(t.type==="bill"){const b=bill(t.billId);return(b?b.name:t.desc)||"Bill"}
  if(t.type==="fuel")return(t.merchant||"Fuel")+(t.litres?", "+(+t.litres).toFixed(1)+" L":"");if(t.type==="income")return t.desc||t.sub||"Income";return t.merchant||t.desc||t.sub||t.cat}
function txMeta(t){const parts=[];if(t.stockId){const st=stock(t.stockId);if(t.type==="share_buy"||t.type==="share_sell"){parts.push(`at ${rs(t.price,true)}`);if(t.fee)parts.push(`fees ${rs(t.fee)}`)}if(t.type==="share_adjust")parts.push(t.desc||"Bonus or split");if(t.type==="dividend"&&t.wht)parts.push(`tax withheld ${rs(t.wht)}`);if(t.noCash)parts.push("already owned");else if(t.acct)parts.push(acctLabel(acct(t.acct)));if(st&&st.name&&t.type!=="dividend")parts.push(st.name);return parts.join(", ")}if(t.type==="asset_buy"||t.type==="asset_sell"){const a=asset(t.assetId);parts.push(a?a.category:"Asset");if(t.card)parts.push(cardLabel(card(t.card)));else if(t.acct)parts.push(acctLabel(acct(t.acct)));if(t.countSpend)parts.push("counted as spending");return parts.join(", ")}if(t.type==="transfer")parts.push(acctLabel(acct(t.acct))+" to "+acctLabel(acct(t.toAcct)));
  else if(t.type==="cc_payment")parts.push("from "+acctLabel(acct(t.acct)));
  else{if(t.type==="fuel")parts.push("Fuel");else if(t.type!=="income")parts.push(t.cat+(t.sub?" / "+t.sub:""));if(t.card)parts.push(cardLabel(card(t.card)));else if(t.acct)parts.push(acctLabel(acct(t.acct)))}
  if(t.vehicle){const v=veh(t.vehicle);if(v)parts.push(v.name)}if(t.already)parts.push("marked paid");return parts.join(", ")}
function txGlyph(t){if(t.type==="dividend")return["gl-inc","Dv"];if(t.type&&t.type.startsWith("share_"))return["gl-asset","Sh"];if(t.type==="asset_buy"||t.type==="asset_sell")return["gl-asset","As"];if(t.type==="income")return["gl-inc","In"];if(t.type==="transfer"||t.type==="cc_payment")return["gl-xfer","⇄"];if(t.type==="refund")return["gl-ref","Rf"];if(t.card)return["gl-card","CC"];if(t.type==="fuel")return["gl-exp","F"];if(t.type==="bill")return["gl-exp","B"];return["gl-exp",(t.cat||"?").slice(0,2)]}
function txAmount(t){const a=+t.amount;if(t.type==="dividend")return`<span class="num pos">+${rs(a)}</span>`;if(t.type==="share_adjust")return`<span class="num faint">${+t.qty>=0?"+":""}${fq(t.qty)} sh</span>`;if(t.type==="share_sell")return`<span class="num xfer">+${rs(a)}</span>`;if(t.type==="share_buy")return`<span class="num ${t.noCash?"faint":"xfer"}">−${rs(a)}</span>`;if(t.type==="asset_sell")return`<span class="num xfer">+${rs(a)}</span>`;if(t.type==="asset_buy"&&!t.countSpend)return`<span class="num xfer">−${rs(a)}</span>`;if(t.type==="income")return`<span class="num pos">+${rs(a)}</span>`;if(t.type==="refund")return`<span class="num pos">+${rs(a)}</span>`;if(t.type==="transfer"||t.type==="cc_payment")return`<span class="num xfer">${rs(a)}</span>`;if(t.already)return`<span class="num faint">${rs(a)}</span>`;return`<span class="num">−${rs(a)}</span>`}
function txRow(t){const [c,g]=txGlyph(t);return`<div class="row click" data-act="tx" data-id="${t.id}" tabindex="0"><div class="glyph ${c}">${esc(g)}</div><div class="grow"><div class="t">${esc(txTitle(t))}</div><div class="s">${esc(txMeta(t))}</div></div>${txAmount(t)}${t.receipt?'<span class="faint small" title="Has receipt">📎</span>':""}</div>`}
function txList(list,grouped){if(!list.length)return`<div class="empty"><b>No transactions here yet</b>Use + Add Transaction to record one. It takes a few seconds.</div>`;
  if(!grouped)return`<div class="rows">${list.map(txRow).join("")}</div>`;let out="",d="";for(const t of list){if(t.date!==d){d=t.date;out+=`<div class="dayhead">${fday(d)}</div>`}out+=txRow(t)}return`<div class="rows">${out}</div>`}

/* ---------- Dashboard ---------- */
function vDashboard(){
  if(!S.accounts.some(a=>a.type!=="Cash")&&!L().all.length)return vWelcome();
  const k=mkey(today());const [f,t]=monthRange(k);const T=totals(f,t);const P=planner();
  let bank=0;for(const a of S.accounts)if(isLKR(a))bank+=acctBal(a.id);
  const cardOutTot=sum(S.cards,c=>cardOut(c.id));
  const cardSt=S.cards.map(c=>({c,st:cardStatus(c)}));
  const upB=upcomingBills().filter(i=>!i.paid).slice(0,6);
  const bud=S.budgets||{};
  const months=lastMonths(6);const mt=months.map(m=>{const [a,b]=monthRange(m);return totals(a,b)});
  const m12=lastMonths(12);const t12=m12.map(m=>{const [a,b]=monthRange(m);return totals(a,b)});
  const catItems=Object.entries(T.byCat).sort((a,b)=>b[1]-a[1]).map(([c,v])=>({label:c,value:v}));
  const heroWarn=P.safe<0;
  const catTile=(c)=>{const v=T.byCat[c]||0,b=+bud[c]||0,p=b?v/b*100:0;return`<div class="stat"><span>${c}</span><b>${rs0(v)}</b>${b?`<div class="bar" style="margin-top:6px"><i class="${pctCls(p)}" style="width:${Math.min(100,p)}%"></i></div><em>${Math.round(p)}% of ${rs0(b)}</em>`:`<em>No budget set</em>`}</div>`};
  return`${head("Good "+greet(),fdate(today(),{weekday:"long",day:"numeric",month:"long"}),`<button class="btn" data-act="nav" data-v="reports">Reports</button>`)}
  <section class="hero ${heroWarn?"warn":""}" aria-label="Safe to spend">
    <div>
      <p class="lead">${heroWarn?"You're over plan until next salary by":"You can safely spend"}</p>
      <div class="big"><small>Rs.</small>${nf0.format(Math.abs(Math.round(heroWarn?P.safe:P.daily)))}</div>
      <p class="per">${heroWarn?`in total, with ${P.c.daysLeft} days to salary`:`a day for the next ${P.c.daysLeft} days`}</p>
      <button class="link" data-act="nav" data-v="salary">See how this is worked out</button>
    </div>
    <div class="side-facts">
      <div class="fact"><b>${rs0(Math.max(0,P.safe))}</b><span>Safe until salary</span></div>
      <div class="fact"><b>${fdate(P.c.next,{day:"numeric",month:"short"})}</b><span>Next salary</span></div>
      <div class="fact"><b>${rs0(P.ccDueLeft+P.unpaidBills)}</b><span>Still to pay before then</span></div>
    </div>
  </section>
  <div class="section stats">
    <div class="stat"><span>Income this month</span><b class="pos">${rs0(T.income)}</b><em>Salary ${rs0(T.salary)}</em></div>
    <div class="stat"><span>Spending this month</span><b>${rs0(T.spend)}</b><em>Transfers not counted</em></div>
    <div class="stat"><span>Remaining</span><b class="${T.income-T.spend<0?"neg":""}">${rs0(T.income-T.spend)}</b><em>Income minus spending</em></div>
    <div class="stat"><span>Moved to savings</span><b>${rs0(T.savingsIn)}</b><em>This month</em></div>
    <div class="stat"><span>Bank & cash balance</span><b>${rs0(bank)}</b><em>${S.accounts.length} accounts</em></div>
    <div class="stat"><span>Card outstanding</span><b class="${cardOutTot>0?"neg":""}">${rs0(cardOutTot)}</b><em>${S.cards.length} cards</em></div>
    <div class="stat"><span>Net worth</span><b class="${netWorth()<0?"neg":""}">${rs0(netWorth())}</b><em>${(S.assets||[]).length?"Money and assets, minus card debt":"Add assets to include them"}</em></div>
  </div>
  <div class="section stats">${["Groceries","Food","Fuel","Vehicle"].map(catTile).join("")}</div>
  <div class="section grid g2">
    <div class="panel"><div class="panel-head"><h2>Card payments</h2><button class="btn sm ghost" data-act="nav" data-v="cards">All cards</button></div>
      ${cardSt.length?`<div class="rows">${cardSt.map(({c,st})=>`<div class="row"><div class="grow"><div class="t">${esc(c.name)}</div><div class="s">${st.amountDue>0?`Due ${fdate(st.due,{day:"numeric",month:"short"})}, ${st.days>=0?st.days+" days left":Math.abs(st.days)+" days late"}`:`Next statement ${fdate(st.nextStmt,{day:"numeric",month:"short"})}`}</div></div><span class="badge ${st.cls}">${st.status}</span><span class="num">${rs0(st.amountDue)}</span>${st.amountDue>0?`<button class="btn sm" data-act="add" data-type="cc_payment" data-card="${c.id}">Pay</button>`:""}</div>`).join("")}</div>`:`<div class="empty"><b>No credit cards added</b><button class="btn sm" data-act="edit-card">Add a card</button></div>`}
    </div>
    <div class="panel"><div class="panel-head"><h2>Bills due next</h2><button class="btn sm ghost" data-act="nav" data-v="bills">All bills</button></div>
      ${upB.length?`<div class="rows">${upB.map(billRow).join("")}</div>`:`<div class="empty"><b>Nothing due</b>${S.bills.length?"All current bills are paid.":"Add your recurring bills to see them here."}</div>`}
    </div>
  </div>
  <div class="section grid g2">
    <div class="panel"><div class="panel-head"><h2>Income vs spending</h2><span class="faint small">Last 6 months</span></div>${barChart(months.map(m=>monthName(m,true)),[{name:"Income",color:"var(--tea)",values:mt.map(x=>x.income)},{name:"Spending",color:"var(--saffron)",values:mt.map(x=>x.spend)}])}</div>
    <div class="panel"><div class="panel-head"><h2>Spending by category</h2><span class="faint small">${monthName(k)}</span></div>${hbars(catItems,{empty:"No spending recorded this month."})}</div>
  </div>
  <div class="section grid g3">
    <div class="panel"><h2 style="margin-bottom:12px">Account balances</h2>${hbars(S.accounts.map(a=>({label:a.name,value:acctBal(a.id),text:(isLKR(a)?"":a.currency+" ")+rs0(acctBal(a.id)).replace(isLKR(a)?"":"Rs. ","")})),{empty:"Add a bank account to begin."})}</div>
    <div class="panel"><h2 style="margin-bottom:12px">Credit card balances</h2>${hbars(cardSt.map(({c,st})=>({label:c.name,value:st.outstanding,max:st.limit||st.outstanding,color:st.limit&&st.outstanding/st.limit>.75?"var(--clay)":"var(--saffron)",text:rs0(st.outstanding)+(st.limit?` of ${short(st.limit)}`:"")})),{empty:"No card balances."})}</div>
    <div class="panel"><h2 style="margin-bottom:12px">Vehicle spending</h2>${hbars(S.vehicles.map(v=>({label:v.name,value:vehCosts(v.id,f,t).total})),{empty:S.vehicles.length?"No vehicle costs this month.":"Add a vehicle to track its costs."})}</div>
  </div>
  <div class="section grid g2">
    <div class="panel"><div class="panel-head"><h2>Monthly spending</h2><span class="faint small">12 months</span></div>${lineChart(m12.map(m=>monthName(m,true)),[{name:"Spending",color:"var(--saffron)",values:t12.map(x=>x.spend)}])}</div>
    <div class="panel"><div class="panel-head"><h2>Savings trend</h2><span class="faint small">12 months</span></div>${lineChart(m12.map(m=>monthName(m,true)),[{name:"Income minus spending",color:"var(--tea)",values:t12.map(x=>x.income-x.spend)},{name:"Moved to savings",color:"var(--sky)",values:t12.map(x=>x.savingsIn)}])}</div>
  </div>
  <div class="section panel"><div class="panel-head"><h2>Recent transactions</h2><button class="btn sm ghost" data-act="nav" data-v="transactions">See all</button></div>${txList(L().all.slice(-8).reverse())}</div>`;
}
function greet(){const h=new Date().getHours();return h<12?"morning":h<17?"afternoon":"evening"}
function vWelcome(){return`<div class="welcome"><h1>Know what's safe to spend, every day until salary.</h1>
  <p class="muted">Start by adding the bank account your salary goes into. Then add your cards, bills and vehicles as you go. Transfers between your own accounts and card repayments are never counted as spending.</p>
  <div class="acts"><button class="btn primary" data-act="edit-account">Add a bank account</button><button class="btn" data-act="demo">Try it with example data</button></div>
  <p class="hint" style="margin-top:14px">Your data is stored privately under your sign-in and syncs between your phone and computer.</p></div>`}
function billRow(i){const pm=i.b.payCard?cardLabel(card(i.b.payCard)):i.b.payAcct?acctLabel(acct(i.b.payAcct)):"";return`<div class="row"><div class="grow"><div class="t">${esc(i.b.name)}</div><div class="s">${esc(i.b.category)}${i.b.provider?", "+esc(i.b.provider):""}, due ${fdate(i.due,{day:"numeric",month:"short"})}${pm?", "+esc(pm):""}</div></div><span class="badge ${i.cls}">${i.status}</span><span class="num">${rs0(i.amount)}</span>${i.paid?"":`<button class="btn sm" data-act="add" data-type="bill" data-bill="${i.b.id}" data-due="${i.due}">Pay</button>`}</div>`}

/* ---------- Salary & planner ---------- */
function vSalary(){const P=planner();const inc=L().all.filter(t=>t.type==="income"&&t.sub==="Salary").slice().reverse();
  const line=(l,v,sign)=>`<div><span>${sign||"−"} ${l}</span><span class="num">${rs0(v)}</span></div>`;
  return`${head("Salary & planner",`Salary cycle ${fdate(P.c.start,{day:"numeric",month:"short"})} to ${fdate(P.c.end,{day:"numeric",month:"short"})}, ${P.c.daysLeft} days left`,`<button class="btn primary" data-act="add" data-type="income" data-sub="Salary">Record salary</button>`)}
  <div class="grid g2">
    <div class="panel"><h2 style="margin-bottom:10px">Salary day plan</h2>
      <div class="formula">
        <div><span>Salary ${P.salaryRecv?"received":"expected"}</span><span class="num">${rs0(P.salary)}</span></div>
        ${line("Fixed bills this cycle",P.fixed)}${line("Credit card amount due",P.ccDue)}${line("Loan payments",P.loans)}${line("Planned savings",P.savingsPlan)}
        ${line("Expected groceries",P.exp.Groceries)}${line("Expected food",P.exp.Food)}${line("Expected fuel",P.exp.Fuel)}${line("Vehicle costs",P.exp.Vehicle)}
        <div class="eq"><span>Available spending money</span><span class="num ${P.available<0?"neg":""}">${rs0(P.available)}</span></div>
      </div>
      <p class="muted" style="margin-top:10px">Daily safe spending at payday: <b class="num">${rs0(P.dailyPlan)}</b> for ${P.c.length} days.</p>
      <p class="hint" style="margin-top:6px">Card purchases made this cycle are paid from next salary, so if you put most groceries, food or fuel on a card this plan will look tighter than your cash really is.</p>
      ${!P.salaryRecv&&!P.expected?`<p class="info" style="margin-top:10px">Record this cycle's salary, or set an expected salary below, to fill in the plan.</p>`:""}
    </div>
    <div class="panel"><h2 style="margin-bottom:10px">Where you are today</h2>
      <div class="formula">
        <div><span>Available spending money</span><span class="num">${rs0(P.available)}</span></div>
        ${line("Other spending since salary",P.discretionary)}${line("Overspend on planned categories",P.overrun)}
        <div class="eq"><span>Left on plan</span><span class="num ${P.remainingPlan<0?"neg":""}">${rs0(P.remainingPlan)}</span></div>
      </div>
      <div class="formula" style="margin-top:16px">
        <div><span>Money in spendable accounts</span><span class="num">${rs0(P.liquid)}</span></div>
        ${line("Unpaid bills before salary",P.unpaidBills)}${line("Card payments due before salary",P.ccDueLeft)}${line("Savings still to move",P.savingsLeft)}${line("Grocery, food, fuel and vehicle budget left",P.budLeft)}
        <div class="eq"><span>Cash check</span><span class="num ${P.cashCheck<0?"neg":""}">${rs0(P.cashCheck)}</span></div>
      </div>
      <p style="margin-top:12px">Safe to spend until salary is the cash check: <b class="num">${rs0(P.safe)}</b>, which is <b class="num">${rs0(P.daily)}</b> a day. This is the figure on your dashboard.</p>
      <p class="hint" style="margin-top:4px">It's real money in your spendable accounts after everything due before your next salary, so it never counts a card purchase twice.</p>
    </div>
  </div>
  <div class="section panel"><h2 style="margin-bottom:12px">Planner settings</h2>
    <form class="f" data-form="salset"><div class="fr">
      <label class="fld"><span>Salary day of month</span><input type="number" name="salaryDay" min="1" max="31" value="${S.settings.salaryDay||25}"></label>
      <label class="fld"><span>Expected net salary (Rs.)</span><input type="number" name="expectedSalary" min="0" step="any" value="${S.settings.expectedSalary||""}"></label>
      <label class="fld"><span>Planned savings each month (Rs.)</span><input type="number" name="plannedSavings" min="0" step="any" value="${S.settings.plannedSavings||""}"></label>
      <div class="hint" style="align-self:end">Expected groceries, food, fuel and vehicle amounts come from your <a href="#" data-act="nav" data-v="budget">budget</a>.</div>
    </div><div class="actions"><button class="btn primary">Save settings</button></div></form></div>
  <div class="section panel"><h2 style="margin-bottom:12px">Salary history</h2>
    ${inc.length?`<div class="table-wrap"><table><thead><tr><th>Date</th><th>Account</th><th class="r">Basic</th><th class="r">Allowances</th><th class="r">Bonus</th><th class="r">Other</th><th class="r">Deductions</th><th class="r">Net</th></tr></thead><tbody>${inc.map(t=>{const b=t.sal||{};return`<tr data-act="tx" data-id="${t.id}" style="cursor:pointer"><td>${fdate(t.date)}</td><td>${esc(acctLabel(acct(t.acct)))}</td><td class="r num">${b.basic?rs0(b.basic):"–"}</td><td class="r num">${b.allow?rs0(b.allow):"–"}</td><td class="r num">${b.bonus?rs0(b.bonus):"–"}</td><td class="r num">${b.other?rs0(b.other):"–"}</td><td class="r num">${b.deduct?"−"+rs0(b.deduct):"–"}</td><td class="r num"><b>${rs0(t.amount)}</b></td></tr>`}).join("")}</tbody></table></div>`:`<div class="empty"><b>No salary recorded yet</b>Record your salary to see the breakdown here.</div>`}
    <p class="hint" style="margin-top:8px">Total salary received this year: <b>${rs0(sum(inc.filter(t=>t.date.slice(0,4)===today().slice(0,4)),t=>+t.amount))}</b></p></div>`}

/* ---------- Transactions ---------- */
function filtered(){const F=UI.filters;return L().all.filter(t=>{
  if(F.from&&t.date<F.from)return false;if(F.to&&t.date>F.to)return false;
  if(F.min&&+t.amount<+F.min)return false;if(F.max&&+t.amount>+F.max)return false;
  if(F.type){if(F.type==="recurring"){if(!t.recurring)return false}else if(t.type!==F.type)return false}
  if(F.cat){const c=t.type==="fuel"?"Fuel":t.type==="bill"?"Bills":t.cat;if(c!==F.cat)return false}
  if(F.acct&&t.acct!==F.acct&&t.toAcct!==F.acct)return false;if(F.card&&t.card!==F.card)return false;if(F.veh&&t.vehicle!==F.veh)return false;
  if(F.method&&t.method!==F.method)return false;
  if(F.q){const q=F.q.toLowerCase();if(!((t.merchant||"")+" "+(t.desc||"")+" "+(t.notes||"")+" "+(t.ref||"")+" "+txTitle(t)).toLowerCase().includes(q))return false}
  return true}).reverse()}
function vTransactions(){const F=UI.filters;const list=filtered();const on=Object.values(F).some(Boolean);
  const T={spend:0,income:0,xfer:0};for(const t of list){const e=eff(t);T.spend+=e.spend;T.income+=e.income;if(t.type==="transfer"||t.type==="cc_payment")T.xfer+=+t.amount}
  const opt=(arr,val)=>arr.map(([v,l])=>`<option value="${esc(v)}" ${v===val?"selected":""}>${esc(l)}</option>`).join("");
  return`${head("Transactions",`${list.length} shown`,`<button class="btn" data-act="export-csv">Export CSV</button>`)}
  <div class="panel"><form class="filters" data-form="filters">
    <label class="fld"><span>Search</span><input name="q" value="${esc(F.q||"")}" placeholder="Merchant, note, reference"></label>
    <label class="fld"><span>From</span><input type="date" name="from" value="${F.from||""}"></label>
    <label class="fld"><span>To</span><input type="date" name="to" value="${F.to||""}"></label>
    <label class="fld"><span>Type</span><select name="type"><option value="">Any</option>${opt([...Object.entries(TYPE_LABEL),["recurring","Recurring only"]],F.type)}</select></label>
    <label class="fld"><span>Category</span><select name="cat"><option value="">Any</option>${opt([...Object.keys(CATS),"Fuel"].map(c=>[c,c]),F.cat)}</select></label>
    <label class="fld"><span>Bank account</span><select name="acct"><option value="">Any</option>${opt(S.accounts.map(a=>[a.id,acctLabel(a)]),F.acct)}</select></label>
    <label class="fld"><span>Credit card</span><select name="card"><option value="">Any</option>${opt(S.cards.map(c=>[c.id,c.name]),F.card)}</select></label>
    <label class="fld"><span>Vehicle</span><select name="veh"><option value="">Any</option>${opt(S.vehicles.map(v=>[v.id,v.name]),F.veh)}</select></label>
    <label class="fld"><span>Payment method</span><select name="method"><option value="">Any</option>${opt(METHODS.map(m=>[m,m]),F.method)}</select></label>
    <label class="fld"><span>Min amount</span><input type="number" name="min" value="${F.min||""}"></label>
    <label class="fld"><span>Max amount</span><input type="number" name="max" value="${F.max||""}"></label>
    <div style="align-self:end">${on?`<button type="button" class="btn ghost" data-act="clear-filters">Clear filters</button>`:""}</div>
  </form>
  <div class="stats" style="margin-bottom:8px"><div class="stat"><span>Spending</span><b>${rs0(T.spend)}</b></div><div class="stat"><span>Income</span><b class="pos">${rs0(T.income)}</b></div><div class="stat"><span>Transfers & card payments</span><b class="xfer">${rs0(T.xfer)}</b></div></div>
  ${txList(list.slice(0,400),true)}${list.length>400?`<p class="hint">Showing the latest 400. Narrow the filters to see older ones.</p>`:""}</div>`}

/* ---------- Accounts ---------- */
function vAccounts(){const k=mkey(today());const [f,t]=monthRange(k);
  const rows=S.accounts.map(a=>{let inn=0,out=0;for(const x of L().all){if(!inRange(x,f,t))continue;for(const [kk,i,v] of eff(x).d)if(kk==="a"&&i===a.id){if(v>0)inn+=v;else out-=v}}return{a,bal:acctBal(a.id),inn,out}});
  const tot=sum(rows.filter(r=>isLKR(r.a)),r=>r.bal);
  return`${head("Bank accounts",`Total ${rs0(tot)} across ${rows.length} accounts`,`<button class="btn" data-act="add" data-type="transfer">Transfer</button><button class="btn primary" data-act="edit-account">Add account</button>`)}
  <div class="grid g2">${rows.map(({a,bal,inn,out})=>`<div class="panel"><div class="panel-head"><div><h2>${esc(a.name)}</h2><p class="faint small">${esc([a.bank,a.type,a.nick].filter(Boolean).join(", "))}</p></div><button class="btn sm" data-act="edit-account" data-id="${a.id}">Edit</button></div>
    <div style="font:800 1.9rem var(--display)" class="num ${bal<0?"neg":""}">${isLKR(a)?rs0(bal):esc(a.currency)+" "+nf2.format(bal)}</div>
    <div class="stats" style="margin-top:12px"><div class="stat"><span>In this month</span><b class="pos">${rs0(inn)}</b></div><div class="stat"><span>Out this month</span><b>${rs0(out)}</b></div></div>
    <div class="actions" style="justify-content:flex-start;margin-top:10px"><button class="btn sm ghost" data-act="filter-acct" data-id="${a.id}">View transactions</button></div></div>`).join("")}</div>`}

/* ---------- Cards ---------- */
function vCards(){const k=mkey(today());const [f,t]=monthRange(k);
  return`${head("Credit cards","Purchases are counted as spending when you buy. Paying the card is a transfer, never spending again.",`<button class="btn primary" data-act="edit-card">Add card</button>`)}
  ${S.cards.length?`<div class="grid g2">${S.cards.map(c=>{const st=cardStatus(c);let purch=0,pays=0;for(const x of L().all){if(!inRange(x,f,t))continue;if(x.card===c.id){if(x.type==="cc_payment")pays+=+x.amount;else if(x.type==="refund")purch-=+x.amount;else if(!x.already)purch+=+x.amount}}
    const util=st.limit?st.outstanding/st.limit*100:0;
    return`<div class="panel"><div class="panel-head"><div><h2>${esc(c.name)}</h2><p class="faint small">${esc(c.bank||"")}${c.limit?`, limit ${rs0(c.limit)}`:""}</p></div><button class="btn sm" data-act="edit-card" data-id="${c.id}">Edit</button></div>
      <div style="display:flex;justify-content:space-between;align-items:end;gap:10px"><div><span class="faint small">Outstanding</span><div style="font:800 1.9rem var(--display)" class="num">${rs0(st.outstanding)}</div></div><div style="text-align:right"><span class="faint small">Available credit</span><div class="num" style="font:700 1.1rem var(--display)">${rs0(st.available)}</div></div></div>
      ${st.limit?`<div class="bar" style="margin:10px 0 4px"><i class="${pctCls(util)}" style="width:${Math.min(100,Math.max(0,util))}%"></i></div><p class="hint">${Math.round(util)}% of limit used</p>`:""}
      <div class="table-wrap" style="margin-top:10px"><table><tbody>
        <tr><td>Statement date</td><td class="r">${fdate(st.stmt)}</td></tr>
        <tr><td>Statement balance</td><td class="r num">${rs0(st.stmtBal)}</td></tr>
        <tr><td>Minimum payment</td><td class="r num">${rs0(st.minPay)}</td></tr>
        <tr><td>Paid since statement</td><td class="r num">${rs0(st.paidSince)}</td></tr>
        <tr><td>Amount due</td><td class="r num"><b>${rs0(st.amountDue)}</b></td></tr>
        <tr><td>Payment due</td><td class="r">${fdate(st.due)} ${st.amountDue>0?`<span class="faint">(${st.days>=0?st.days+" days":Math.abs(st.days)+" days late"})</span>`:""}</td></tr>
        <tr><td>Status</td><td class="r"><span class="badge ${st.cls}">${st.status}</span></td></tr>
        <tr><td>Purchases this month</td><td class="r num">${rs0(purch)}</td></tr>
        <tr><td>Payments this month</td><td class="r num">${rs0(pays)}</td></tr>
      </tbody></table></div>
      <div class="actions" style="justify-content:flex-start;margin-top:10px"><button class="btn primary sm" data-act="add" data-type="cc_payment" data-card="${c.id}">Pay card</button><button class="btn sm" data-act="add" data-type="cc_purchase" data-card="${c.id}">Add purchase</button><button class="btn sm ghost" data-act="filter-card" data-id="${c.id}">View transactions</button></div></div>`}).join("")}</div>`:`<div class="panel empty"><b>No credit cards yet</b>Add a card with its limit, statement date and due date to track what you owe.<div style="margin-top:10px"><button class="btn primary" data-act="edit-card">Add card</button></div></div>`}`}

/* ---------- Bills ---------- */
function vBills(){const t0=today();const items=billItems(addMonths(t0,-2),addDays(t0,45));const open=items.filter(i=>!i.paid);const paidM=items.filter(i=>i.paid&&mkey(i.paid.date)===mkey(t0));
  const totDue=sum(open.filter(i=>i.due<=addDays(t0,31)),i=>i.amount);
  return`${head("Bills",`${rs0(totDue)} due in the next 30 days`,`<button class="btn" data-act="add" data-type="bill">Pay a one-off bill</button><button class="btn primary" data-act="edit-bill">Add bill</button>`)}
  <div class="grid g2"><div class="panel"><h2 style="margin-bottom:8px">To pay</h2>${open.length?`<div class="rows">${open.map(billRow).join("")}</div>`:`<div class="empty"><b>Nothing to pay</b>You're up to date.</div>`}</div>
  <div class="panel"><h2 style="margin-bottom:8px">Paid this month</h2>${paidM.length?`<div class="rows">${paidM.map(billRow).join("")}</div>`:`<p class="faint small">No bills paid yet this month.</p>`}</div></div>
  <div class="section panel"><h2 style="margin-bottom:8px">All bills</h2>${S.bills.length?`<div class="table-wrap"><table><thead><tr><th>Bill</th><th>Category</th><th>Provider</th><th>Repeats</th><th>Pay from</th><th class="r">Amount</th><th></th></tr></thead><tbody>${S.bills.map(b=>`<tr><td><b>${esc(b.name)}</b>${b.active===false?' <span class="badge b-up">Paused</span>':""}</td><td>${esc(b.category)}</td><td>${esc(b.provider||"")}</td><td>${esc(b.freq)}${b.freq!=="Once"?", day "+parse(b.firstDue).getDate():", "+fdate(b.firstDue)}</td><td>${esc(b.payCard?cardLabel(card(b.payCard)):b.payAcct?acctLabel(acct(b.payAcct)):"")}</td><td class="r num">${rs0(b.amount)}</td><td class="r"><button class="btn sm" data-act="edit-bill" data-id="${b.id}">Edit</button></td></tr>`).join("")}</tbody></table></div>`:`<div class="empty"><b>No bills yet</b>Add electricity, water, internet, rent, loans and subscriptions so you never miss a due date.</div>`}</div>`}

/* ---------- Food & groceries ---------- */
function vFood(){const k=UI.foodMonth;const [f,t]=monthRange(k);const T=totals(f,t);const bud=S.budgets||{};
  const list=L().all.filter(x=>inRange(x,f,t)&&(x.cat==="Food"||x.cat==="Groceries")&&(x.type==="expense"||x.type==="cc_purchase"||x.type==="refund")).reverse();
  const merch=c=>{const m={};for(const x of list)if(x.cat===c){const e=eff(x);const n=x.merchant||"Unnamed";m[n]=(m[n]||0)+e.spend}return Object.entries(m).sort((a,b)=>b[1]-a[1]).slice(0,6).map(([l,v])=>({label:l,value:v}))};
  const subs=c=>CATS[c].map(s=>({label:s,value:T.bySub[c+"|"+s]||0}));
  const block=c=>{const v=T.byCat[c]||0,b=+bud[c]||0,p=b?v/b*100:0;return`<div class="panel"><div class="panel-head"><h2>${c}</h2><button class="btn sm" data-act="add" data-type="expense" data-cat="${c}">Add ${c.toLowerCase()}</button></div>
    <div style="font:800 1.9rem var(--display)" class="num">${rs0(v)}</div>${b?`<div class="bar" style="margin:8px 0 4px"><i class="${pctCls(p)}" style="width:${Math.min(100,p)}%"></i></div><p class="hint">${Math.round(p)}% of ${rs0(b)} budget, ${rs0(Math.max(0,b-v))} left</p>`:`<p class="hint">No budget set</p>`}
    <h3 style="margin:16px 0 8px">By type</h3>${hbars(subs(c))}<h3 style="margin:16px 0 8px">Top places</h3>${hbars(merch(c))}</div>`};
  return`${head("Food & groceries","Eating out and groceries are tracked separately.",monthPicker("foodMonth",k))}<div class="grid g2">${block("Groceries")}${block("Food")}</div>
  <div class="section panel"><h2 style="margin-bottom:6px">${monthName(k)} entries</h2>${txList(list,true)}</div>`}

/* ---------- Vehicles ---------- */
function vVehicles(){const k=mkey(today());const [f,t]=monthRange(k);const y=today().slice(0,4);
  return`${head("Vehicles","Every fuel fill and vehicle expense is linked to a vehicle.",`<button class="btn primary" data-act="edit-vehicle">Add vehicle</button>`)}
  ${S.vehicles.length?`<div class="grid g2">${S.vehicles.map(v=>{const m=vehCosts(v.id,f,t),yr=vehCosts(v.id,y+"-01-01",y+"-12-31"),all=vehCosts(v.id);const fs=fuelStats(v.id);
    return`<div class="panel"><div class="panel-head"><div><h2>${esc(v.name)}</h2><p class="faint small">${esc([v.reg,[v.make,v.model].filter(Boolean).join(" "),v.year,v.fuel].filter(Boolean).join(", "))}</p></div><button class="btn sm" data-act="edit-vehicle" data-id="${v.id}">Edit</button></div>
      <div class="stats"><div class="stat"><span>This month</span><b>${rs0(m.total)}</b></div><div class="stat"><span>This year</span><b>${rs0(yr.total)}</b></div><div class="stat"><span>Total ownership</span><b>${rs0(all.total)}</b></div></div>
      <div class="table-wrap" style="margin-top:10px"><table><thead><tr><th>This year</th><th class="r">Amount</th></tr></thead><tbody>
        <tr><td>Fuel</td><td class="r num">${rs0(yr.fuel)}</td></tr><tr><td>Maintenance & repairs</td><td class="r num">${rs0(yr.maint)}</td></tr><tr><td>Insurance</td><td class="r num">${rs0(yr.ins)}</td></tr><tr><td>Leasing / loan</td><td class="r num">${rs0(yr.loan)}</td></tr><tr><td>Other (licence, parking, tolls…)</td><td class="r num">${rs0(yr.other)}</td></tr></tbody></table></div>
      <p class="hint" style="margin-top:8px">Odometer ${nf0.format(vehOdo(v))} km${fs?`, running cost ${rs(fs.perKm,true)} per km on fuel${fs.kmpl?`, ${fs.kmpl.toFixed(1)} km/L`:""}`:""}</p>
      <div class="actions" style="justify-content:flex-start;margin-top:10px"><button class="btn primary sm" data-act="add" data-type="fuel" data-veh="${v.id}">Add fuel</button><button class="btn sm" data-act="add" data-type="expense" data-cat="Vehicle" data-veh="${v.id}">Add vehicle expense</button><button class="btn sm ghost" data-act="filter-veh" data-id="${v.id}">View transactions</button></div></div>`}).join("")}</div>`:`<div class="panel empty"><b>No vehicles yet</b>Add each vehicle to see its fuel, maintenance, insurance and total cost.<div style="margin-top:10px"><button class="btn primary" data-act="edit-vehicle">Add vehicle</button></div></div>`}`}

/* ---------- Fuel ---------- */
function vFuel(){const k=mkey(today());const [f,t]=monthRange(k);const fuel=L().all.filter(x=>x.type==="fuel");
  const months=lastMonths(6);const perMonth=months.map(m=>{const [a,b]=monthRange(m);return sum(fuel.filter(x=>inRange(x,a,b)),x=>+x.amount)});
  const withFuel=perMonth.filter(v=>v>0);const avgM=withFuel.length?sum(withFuel)/withFuel.length:0;const avgFill=fuel.length?sum(fuel,x=>+x.amount)/fuel.length:0;
  const thisM=fuel.filter(x=>inRange(x,f,t));
  return`${head("Fuel",`${rs0(sum(thisM,x=>+x.amount))} this month`,`<button class="btn primary" data-act="add" data-type="fuel">Add fuel</button>`)}
  <div class="stats"><div class="stat"><span>This month</span><b>${rs0(sum(thisM,x=>+x.amount))}</b><em>${thisM.length} fills, ${sum(thisM,x=>+x.litres||0).toFixed(1)} L</em></div><div class="stat"><span>Average per month</span><b>${rs0(avgM)}</b><em>Last 6 months</em></div><div class="stat"><span>Average per fill</span><b>${rs0(avgFill)}</b></div></div>
  <div class="section grid g2"><div class="panel"><h2 style="margin-bottom:10px">Fuel cost per month</h2>${barChart(months.map(m=>monthName(m,true)),[{name:"Fuel",color:"var(--saffron)",values:perMonth}])}</div>
  <div class="panel"><h2 style="margin-bottom:10px">By vehicle</h2>${S.vehicles.length?`<div class="table-wrap"><table><thead><tr><th>Vehicle</th><th class="r">This month</th><th class="r">Litres</th><th class="r">Per km</th></tr></thead><tbody>${S.vehicles.map(v=>{const c=vehCosts(v.id,f,t),fs=fuelStats(v.id);return`<tr><td>${esc(v.name)}</td><td class="r num">${rs0(c.fuel)}</td><td class="r num">${c.litres.toFixed(1)}</td><td class="r num">${fs?rs(fs.perKm,true):'<span class="faint">needs 2+ fills with odometer</span>'}</td></tr>`}).join("")}</tbody></table></div>`:`<p class="faint small">Add a vehicle first.</p>`}</div></div>
  <div class="section panel"><h2 style="margin-bottom:6px">Fuel log</h2>${fuel.length?`<div class="table-wrap"><table><thead><tr><th>Date</th><th>Vehicle</th><th>Station</th><th>Fuel</th><th class="r">Litres</th><th class="r">Per litre</th><th class="r">Odometer</th><th class="r">Amount</th></tr></thead><tbody>${fuel.slice().reverse().slice(0,200).map(x=>`<tr data-act="tx" data-id="${x.id}" style="cursor:pointer"><td>${fdate(x.date,{day:"numeric",month:"short"})}</td><td>${esc((veh(x.vehicle)||{}).name||"")}</td><td>${esc(x.merchant||"")}</td><td>${esc(x.fuelType||"")}</td><td class="r num">${x.litres?(+x.litres).toFixed(2):"–"}</td><td class="r num">${x.ppl?rs(x.ppl,true):"–"}</td><td class="r num">${x.odo?nf0.format(x.odo):"–"}</td><td class="r num">${rs(x.amount)}</td></tr>`).join("")}</tbody></table></div>`:`<div class="empty"><b>No fuel recorded</b>Add a fill with litres and odometer to see cost per kilometre.</div>`}</div>`}

/* ---------- Budget ---------- */
function vBudget(){const k=UI.budgetMonth;const [f,t]=monthRange(k);const T=totals(f,t);const bud=S.budgets||{};
  const rows=BUDGET_CATS.map(c=>{const b=+bud[c]||0,a=Math.max(0,T.byCat[c]||0);const other=c==="Other"?sum(Object.entries(T.byCat).filter(([kk])=>!BUDGET_CATS.includes(kk)),([,v])=>v):0;const act=a+other;return{c,b,a:act,p:b?act/b*100:0}});
  const warns=rows.filter(r=>r.b&&r.p>=75).sort((a,b)=>b.p-a.p);const tb=sum(rows,r=>r.b),ta=sum(rows,r=>r.a);
  return`${head("Monthly budget",`${rs0(ta)} spent of ${rs0(tb)} budgeted`,monthPicker("budgetMonth",k))}
  ${warns.length?`<div class="panel" style="border-color:var(--saffron)"><h3 style="margin-bottom:6px">Heads up</h3>${warns.map(r=>`<p>${r.p>=100?`<b class="neg">${r.c}</b> is over budget by ${rs0(r.a-r.b)}.`:r.p>=90?`<b>${r.c}</b> has used ${Math.round(r.p)}%, only ${rs0(r.b-r.a)} left.`:`<b>${r.c}</b> has reached ${Math.round(r.p)}% of its budget.`}</p>`).join("")}</div>`:""}
  <div class="panel${warns.length?" section":""}"><div class="table-wrap"><table><thead><tr><th>Category</th><th class="r">Budget</th><th class="r">Actual</th><th class="r">Remaining</th><th style="min-width:140px">Used</th></tr></thead><tbody>
  ${rows.map(r=>`<tr><td><b>${r.c}</b></td><td class="r"><input type="number" min="0" step="any" data-budget="${r.c}" value="${r.b||""}" placeholder="0" aria-label="${r.c} budget" style="width:110px;text-align:right;padding:6px 8px;border:1px solid var(--line);border-radius:8px;background:var(--paper)"></td><td class="r num">${rs0(r.a)}</td><td class="r num ${r.b&&r.b-r.a<0?"neg":""}">${r.b?rs0(r.b-r.a):"–"}</td><td>${r.b?`<div style="display:flex;gap:8px;align-items:center"><div class="bar" style="flex:1"><i class="${pctCls(r.p)}" style="width:${Math.min(100,r.p)}%"></i></div><span class="small num">${Math.round(r.p)}%</span></div>`:'<span class="faint small">Set a budget</span>'}</td></tr>`).join("")}
  <tr class="total"><td>Total</td><td class="r num">${rs0(tb)}</td><td class="r num">${rs0(ta)}</td><td class="r num">${rs0(tb-ta)}</td><td></td></tr></tbody></table></div>
  <p class="hint" style="margin-top:8px">Budgets apply to every month. "Other" includes education, personal care and bank charges. Refunds reduce the category they belong to.</p></div>`}

/* ---------- Savings ---------- */
function vSavings(){const accs=S.accounts.filter(a=>SAVING_TYPES.includes(a.type));const tot=sum(accs.filter(isLKR),a=>acctBal(a.id));
  const m12=lastMonths(12);const t12=m12.map(m=>{const [a,b]=monthRange(m);return totals(a,b)});const cur=t12[t12.length-1];
  const bal=m12.map(m=>{const e=monthRange(m)[1];return sum(accs.filter(isLKR),a=>acctBal(a.id,e))});
  const rate=cur.income?(cur.income-cur.spend)/cur.income*100:0;
  return`${head("Savings",`${rs0(tot)} in savings and investment accounts`,`<button class="btn primary" data-act="add" data-type="transfer" data-tosav="1">Move to savings</button>`)}
  <div class="stats"><div class="stat"><span>Moved to savings this month</span><b>${rs0(cur.savingsIn)}</b><em>Planned ${rs0(S.settings.plannedSavings||0)}</em></div><div class="stat"><span>Actually saved this month</span><b class="${cur.income-cur.spend<0?"neg":"pos"}">${rs0(cur.income-cur.spend)}</b><em>Income minus spending</em></div><div class="stat"><span>Savings rate</span><b>${cur.income?Math.round(rate)+"%":"–"}</b><em>of income</em></div><div class="stat"><span>12-month average saved</span><b>${rs0(sum(t12,x=>x.income-x.spend)/12)}</b></div></div>
  <div class="section grid g2"><div class="panel"><h2 style="margin-bottom:10px">Savings balance</h2>${lineChart(m12.map(m=>monthName(m,true)),[{name:"Balance",color:"var(--sky)",values:bal}])}</div>
  <div class="panel"><h2 style="margin-bottom:10px">Saved each month</h2>${barChart(m12.map(m=>monthName(m,true)),[{name:"Income minus spending",color:"var(--tea)",values:t12.map(x=>x.income-x.spend)},{name:"Moved to savings",color:"var(--sky)",values:t12.map(x=>x.savingsIn)}])}</div></div>
  <div class="section panel"><h2 style="margin-bottom:8px">Savings accounts</h2>${accs.length?`<div class="rows">${accs.map(a=>`<div class="row"><div class="grow"><div class="t">${esc(a.name)}</div><div class="s">${esc([a.bank,a.type].filter(Boolean).join(", "))}</div></div><span class="num"><b>${rs0(acctBal(a.id))}</b></span></div>`).join("")}</div>`:`<div class="empty"><b>No savings accounts yet</b>Add an account with type Savings, Fixed Deposit or Investment. Money you move there counts as saved, not spent.</div>`}</div>`}

/* ---------- Reports ---------- */
function vReports(){const k=UI.reportMonth;const [f,t]=monthRange(k);const T=totals(f,t);const prevEnd=addDays(f,-1);
  // Cash flow across all LKR accounts
  const CF={open:0,salary:0,other:0,cashExp:0,bankExp:0,bills:0,xout:0,xin:0,refunds:0,assetBuy:0,assetSell:0,close:0};
  const lk=S.accounts.filter(isLKR);const lkIds=new Set(lk.map(a=>a.id));CF.open=sum(lk,a=>acctBal(a.id,prevEnd));
  for(const x of L().all){if(!inRange(x,f,t))continue;const a=acct(x.acct);const isCash=a&&a.type==="Cash";
    if(x.type==="dividend"&&lkIds.has(x.acct))CF.other+=+x.amount;
    else if(x.type==="share_buy"&&!x.noCash&&lkIds.has(x.acct))CF.shareBuy=(CF.shareBuy||0)+(+x.amount);
    else if(x.type==="share_sell"&&lkIds.has(x.acct))CF.shareSell=(CF.shareSell||0)+(+x.amount);
    else if(x.type==="income"&&lkIds.has(x.acct)){if(x.sub==="Salary")CF.salary+=+x.amount;else CF.other+=+x.amount}
    else if((x.type==="expense"||x.type==="fuel")&&x.acct&&lkIds.has(x.acct)){if(isCash)CF.cashExp+=+x.amount;else CF.bankExp+=+x.amount}
    else if(x.type==="bill"&&x.acct&&!x.already&&lkIds.has(x.acct))CF.bills+=+x.amount;
    else if(x.type==="refund"&&x.acct&&lkIds.has(x.acct))CF.refunds+=+x.amount;
    else if(x.type==="asset_buy"&&x.acct&&lkIds.has(x.acct))CF.assetBuy+=+x.amount;
    else if(x.type==="asset_sell"&&lkIds.has(x.acct))CF.assetSell+=+x.amount;
    if(x.type==="transfer"){if(lkIds.has(x.acct)){CF.xout+=+x.amount;CF.bankExp+=+x.fee||0}if(lkIds.has(x.toAcct))CF.xin+=+x.amount}
    if(x.type==="cc_payment"&&lkIds.has(x.acct)){CF.xout+=+x.amount;CF.bankExp+=+x.fee||0}}
  CF.close=sum(lk,a=>acctBal(a.id,t));
  const accRows=S.accounts.map(a=>{let inn=0,out=0,xi=0,xo=0;for(const x of L().all){if(!inRange(x,f,t))continue;const isX=x.type==="transfer"||x.type==="cc_payment";for(const [kk,i,v] of eff(x).d)if(kk==="a"&&i===a.id){if(isX){if(v>0)xi+=v;else xo-=v}else{if(v>0)inn+=v;else out-=v}}}return{a,open:acctBal(a.id,prevEnd),inn,out,xi,xo,close:acctBal(a.id,t)}});
  const cardRows=S.cards.map(c=>{let p=0,pay=0;for(const x of L().all){if(!inRange(x,f,t)||x.card!==c.id)continue;if(x.type==="cc_payment")pay+=+x.amount;else if(x.type==="refund")p-=+x.amount;else if(!x.already)p+=+x.amount}const o=cardOut(c.id,t);return{c,p,pay,o,av:(+c.limit||0)-o}});
  const catRows=[...BUDGET_CATS.filter(c=>c!=="Other"),"Other"].map(c=>({c,v:c==="Other"?sum(Object.entries(T.byCat).filter(([kk])=>!BUDGET_CATS.includes(kk)||kk==="Other"),([,v])=>v):(T.byCat[c]||0)}));
  const cf=(l,v,s)=>`<div><span>${s} ${l}</span><span class="num">${rs0(v)}</span></div>`;
  return`${head("Reports",monthName(k),monthPicker("reportMonth",k)+`<button class="btn" data-act="export-csv" data-month="${k}">Export month CSV</button>`)}
  <div class="grid g2"><div class="panel"><h2 style="margin-bottom:10px">Monthly spending</h2><div class="formula">
    <div><span>Income</span><span class="num pos">${rs0(T.income)}</span></div><div><span>Expenses (actual spending)</span><span class="num">${rs0(T.spend)}</span></div><div><span>Moved to savings</span><span class="num">${rs0(T.savingsIn)}</span></div>
    <div class="eq"><span>Remaining (income minus spending)</span><span class="num ${T.income-T.spend<0?"neg":""}">${rs0(T.income-T.spend)}</span></div></div>
    <p class="hint" style="margin-top:8px">Transfers between your accounts (${rs0(T.transfers)}) and card repayments (${rs0(T.ccPay)}) are excluded from spending.${T.assetBuy?` So are asset purchases (${rs0(T.assetBuy)}), unless you chose to count them.`:""}</p></div>
  <div class="panel"><h2 style="margin-bottom:10px">Cash flow</h2><div class="formula">
    <div><span>Opening bank & cash balance</span><span class="num">${rs0(CF.open)}</span></div>${cf("Salary",CF.salary,"+")}${cf("Other income",CF.other,"+")}${cf("Refunds",CF.refunds,"+")}${cf("Cash expenses",CF.cashExp,"−")}${cf("Bank-paid expenses and fees",CF.bankExp,"−")}${cf("Bill payments",CF.bills,"−")}${cf("Transfers out (incl. card payments)",CF.xout,"−")}${cf("Transfers in",CF.xin,"+")}${CF.assetBuy?cf("Asset purchases",CF.assetBuy,"−"):""}${CF.assetSell?cf("Asset sales",CF.assetSell,"+"):""}${CF.shareBuy?cf("Share purchases",CF.shareBuy,"−"):""}${CF.shareSell?cf("Share sales",CF.shareSell,"+"):""}
    <div class="eq"><span>Closing balance</span><span class="num">${rs0(CF.close)}</span></div></div>
    <p class="hint" style="margin-top:8px">Card purchases don't touch your bank until you pay the card, so they appear here as card payments, and in spending when you bought.</p></div></div>
  <div class="section panel"><h2 style="margin-bottom:10px">Bank accounts</h2><div class="table-wrap"><table><thead><tr><th>Account</th><th class="r">Opening</th><th class="r">Money in</th><th class="r">Money out</th><th class="r">Transfers in</th><th class="r">Transfers out</th><th class="r">Closing</th></tr></thead><tbody>${accRows.map(r=>`<tr><td>${esc(acctLabel(r.a))}</td><td class="r num">${rs0(r.open)}</td><td class="r num">${rs0(r.inn)}</td><td class="r num">${rs0(r.out)}</td><td class="r num">${rs0(r.xi)}</td><td class="r num">${rs0(r.xo)}</td><td class="r num"><b>${rs0(r.close)}</b></td></tr>`).join("")}</tbody></table></div></div>
  <div class="section panel"><h2 style="margin-bottom:10px">Credit cards</h2>${cardRows.length?`<div class="table-wrap"><table><thead><tr><th>Card</th><th class="r">Purchases</th><th class="r">Payments</th><th class="r">Outstanding at month end</th><th class="r">Available credit</th></tr></thead><tbody>${cardRows.map(r=>`<tr><td>${esc(r.c.name)}</td><td class="r num">${rs0(r.p)}</td><td class="r num">${rs0(r.pay)}</td><td class="r num">${rs0(r.o)}</td><td class="r num">${rs0(r.av)}</td></tr>`).join("")}<tr class="total"><td>Total</td><td class="r num">${rs0(sum(cardRows,r=>r.p))}</td><td class="r num">${rs0(sum(cardRows,r=>r.pay))}</td><td class="r num">${rs0(sum(cardRows,r=>r.o))}</td><td class="r num">${rs0(sum(cardRows,r=>r.av))}</td></tr></tbody></table></div>`:`<p class="faint small">No cards.</p>`}</div>
  <div class="section grid g2"><div class="panel"><h2 style="margin-bottom:10px">Vehicles</h2>${S.vehicles.length?`<div class="table-wrap"><table><thead><tr><th>Vehicle</th><th class="r">Fuel</th><th class="r">Repairs & maintenance</th><th class="r">Insurance</th><th class="r">Other</th><th class="r">Total</th></tr></thead><tbody>${S.vehicles.map(v=>{const c=vehCosts(v.id,f,t);return`<tr><td>${esc(v.name)}</td><td class="r num">${rs0(c.fuel)}</td><td class="r num">${rs0(c.maint)}</td><td class="r num">${rs0(c.ins)}</td><td class="r num">${rs0(c.loan+c.other)}</td><td class="r num"><b>${rs0(c.total)}</b></td></tr>`}).join("")}</tbody></table></div>`:`<p class="faint small">No vehicles.</p>`}</div>
  <div class="panel"><h2 style="margin-bottom:10px">Spending categories</h2>${hbars(catRows.map(r=>({label:r.c,value:r.v})),{keepZero:true})}</div></div>`}

/* ---------- Settings ---------- */
function vSettings(){const n=L().all.length;
  return`${head("Settings","")}
  <div class="grid g2"><div class="panel"><h2 style="margin-bottom:10px">General</h2><form class="f" data-form="settings">
    <label class="fld"><span>Due soon means within (days)</span><input type="number" name="dueSoon" min="1" max="30" value="${S.settings.dueSoon||5}"></label>
    <label class="fld"><span>Appearance</span><select name="theme">${[["auto","Match my device"],["light","Light"],["dark","Dark"]].map(([v,l])=>`<option value="${v}" ${S.settings.theme===v?"selected":""}>${l}</option>`).join("")}</select></label>
    <p class="hint">Salary day, expected salary and planned savings are in <a href="#" data-act="nav" data-v="salary">Salary & planner</a>. Currency is Sri Lankan Rupees (Rs.).</p>
    <div class="actions"><button class="btn primary">Save</button></div></form></div>
  <div class="panel"><h2 style="margin-bottom:10px">Your data</h2>
    <p class="muted">Signed in as <b>${esc(Store.user||"")}</b>. Your data is stored privately in your Kasi database and syncs to every device you sign in on.</p>
    <p class="faint small" style="margin-top:6px">${n} transactions, ${S.accounts.length} accounts, ${S.cards.length} cards, ${S.vehicles.length} vehicles, ${S.bills.length} bills.</p>
    <div class="actions" style="justify-content:flex-start;margin-top:12px"><button class="btn" data-act="export-json">Download backup</button><button class="btn" data-act="import-json">Restore from backup</button><button class="btn" data-act="export-csv">Export transactions CSV</button></div>
    <div class="actions" style="justify-content:flex-start;margin-top:12px"><button class="btn" data-act="demo">Load example data</button><button class="btn danger" data-act="wipe">Delete all data</button></div>
    <div class="actions" style="justify-content:flex-start;margin-top:12px"><button class="btn" data-act="logout">Sign out</button><button class="btn" data-act="chpw">Change password</button><button class="btn danger" data-act="delacct">Delete account</button></div>
    <input type="file" id="importFile" accept="application/json,.json" hidden></div></div>
  <div class="section panel"><h2 style="margin-bottom:8px">How Kasi counts money</h2><div class="muted" style="max-width:70ch;display:grid;gap:6px">
    <p>Card purchases are spending on the day you buy. Paying the card from your bank moves money, so it's never counted again.</p>
    <p>Transfers between your own accounts, into savings and back out of savings are never income or spending. A transfer fee is counted as a bank charge.</p>
    <p>A bill payment is spending, unless you mark it as already recorded, in which case it only marks the bill paid.</p>
    <p>Buying shares isn't spending and selling them isn't income; Kasi tracks your gain or loss on each holding using average cost. Dividends are income.</p>
    <p>Buying an asset such as land, gold or a laptop moves money into something you own, so it isn't spending unless you choose to count it. Selling an asset isn't income.</p>
    <p>Refunds reduce the category they belong to. Fuel and vehicle costs always belong to a vehicle.</p></div></div>
  <div class="section panel"><h2 style="margin-bottom:8px">Install on your phone</h2>${isStandalone()?`<p class="muted">Kasi is installed on this device. Open it from your Home Screen.</p>`:window._installPrompt?`<p class="muted" style="margin-bottom:10px">Install Kasi so it opens full screen from your Home Screen and works offline.</p><button class="btn primary" data-act="install">Install Kasi</button>`:isIOS()?`<p class="muted" style="max-width:70ch">In Safari, tap the Share button, then <b>Add to Home Screen</b>. Kasi then opens full screen like an app and keeps working when you're offline.</p>`:`<p class="muted" style="max-width:70ch">On Android, open this site in Chrome, tap the ⋮ menu, then <b>Install app</b> (or Add to Home screen). On iPhone, use Safari's Share button, then <b>Add to Home Screen</b>.</p>`}</div>`}

function vAssets(){const t0=today();const all=S.assets||[];const held=all.filter(a=>!a.sold),sold=all.filter(a=>a.sold);
  const val=sum(held,a=>assetValue(a)),cost=sum(held,a=>assetCost(a));const known=held.filter(a=>assetCost(a)>0);
  const gain=sum(known,a=>assetValue(a)-assetCost(a)),gainBase=sum(known,a=>assetCost(a));
  let cash=0;for(const a of S.accounts)if(isLKR(a))cash+=acctBal(a.id);const debt=sum(S.cards,c=>cardOut(c.id));const shv=portfolioValue();const nw=cash+val+shv-debt;
  const m12=lastMonths(12);const nwT=m12.map(m=>{const e=monthRange(m)[1];return netWorth(e>t0?t0:e)});
  const byCat={};for(const a of held)byCat[a.category]=(byCat[a.category]||0)+assetValue(a);if(shv)byCat["Shares & unit trusts"]=(byCat["Shares & unit trusts"]||0)+shv;
  const row=a=>{const v=a.sold?+a.sold.amount:assetValue(a),c=assetCost(a);const ch=c>0?(v-c)/c*100:null;
    return`<div class="row click" data-act="asset" data-id="${a.id}" tabindex="0"><div class="glyph gl-asset">${esc((a.category||"As").slice(0,2))}</div><div class="grow"><div class="t">${esc(a.name)}</div><div class="s">${esc(a.category)}${c>0?`, paid ${rs0(c)}`:""}${a.sold?`, sold ${fdate(a.sold.date)}`:""}</div></div>${ch===null?"":`<span class="badge ${ch>=0?"b-paid":"b-over"}">${ch>=0?"+":"−"}${Math.abs(ch).toFixed(Math.abs(ch)<10?1:0)}%</span>`}<span class="num"><b>${rs0(v)}</b></span></div>`};
  return`${head("Assets",`Net worth ${rs0(nw)}`,`<button class="btn" data-act="edit-asset">Add an asset you own</button><button class="btn primary" data-act="add" data-type="asset_buy">Record a purchase</button>`)}
  <div class="stats"><div class="stat"><span>Net worth</span><b class="${nw<0?"neg":""}">${rs0(nw)}</b><em>Money and assets, minus card debt</em></div><div class="stat"><span>Assets value</span><b>${rs0(val+shv)}</b><em>${held.length} asset${held.length===1?"":"s"}${shv?", plus shares":""}</em></div><div class="stat"><span>Bank & cash</span><b>${rs0(cash)}</b></div><div class="stat"><span>Card debt</span><b class="${debt>0?"neg":""}">${rs0(debt)}</b></div><div class="stat"><span>Paid for assets</span><b>${rs0(cost)}</b></div><div class="stat"><span>Gain or loss</span><b class="${gain<0?"neg":"pos"}">${gain<0?"":"+"}${rs0(gain)}</b><em>${gainBase?`${(gain/gainBase*100).toFixed(1)}% on what you paid`:"Add what you paid to see this"}</em></div></div>
  <div class="section grid g2"><div class="panel"><div class="panel-head"><h2>Net worth</h2><span class="faint small">12 months</span></div>${lineChart(m12.map(m=>monthName(m,true)),[{name:"Net worth",color:"var(--tea)",values:nwT}])}</div>
  <div class="panel"><h2 style="margin-bottom:12px">By type</h2>${hbars(Object.entries(byCat).sort((a,b)=>b[1]-a[1]).map(([l,v])=>({label:l,value:v})),{empty:"No assets yet."})}</div></div>
  <div class="section panel"><h2 style="margin-bottom:6px">What you own</h2>${shv?`<div class="rows"><div class="row click" data-act="nav" data-v="shares" tabindex="0"><div class="glyph gl-asset">Sh</div><div class="grow"><div class="t">Share portfolio</div><div class="s">See holdings on the Shares page</div></div><span class="num"><b>${rs0(shv)}</b></span></div></div>`:""}${held.length?`<div class="rows">${held.slice().sort((a,b)=>assetValue(b)-assetValue(a)).map(row).join("")}</div>`:`<div class="empty"><b>No assets yet</b>Add land, a house, gold, shares or anything valuable you own, or record a purchase when you make one.</div>`}</div>
  ${sold.length?`<div class="section panel"><h2 style="margin-bottom:6px">Sold</h2><div class="rows">${sold.map(row).join("")}</div></div>`:""}
  <p class="hint section">Values are your own estimates. Update them when you get a valuation, and Kasi uses each asset's yearly rate in between. Loans such as vehicle leasing aren't counted as debts yet.</p>`}
function assetDetail(a){const v=assetValue(a),c=assetCost(a),now=a.sold?+a.sold.amount:v;
  const hist=[...(a.values||[]).map(x=>({date:x.date,label:"Valuation"+(x.note?": "+x.note:""),amt:x.value})),...assetBuys(a).map(t=>({date:t.date,label:"Purchase"+(t.desc?": "+t.desc:""),amt:t.amount,id:t.id})),...(+a.initCost?[{date:a.initDate||"",label:"Original price",amt:a.initCost}]:[]),...(a.sold?[{date:a.sold.date,label:"Sold",amt:a.sold.amount,id:a.sold.txId}]:[])].sort((x,y)=>x.date<y.date?1:-1);
  const rows=[["Type",a.category],["What you paid",c?rs0(c):"Not recorded"],[a.sold?"Sold for":"Estimated value today",rs0(now)],c?[a.sold?"Gain or loss":"Change",(now-c>=0?"+":"")+rs0(now-c)+` (${((now-c)/c*100).toFixed(1)}%)`]:null,+a.yearly?["Yearly change",(a.yearly>0?"+":"")+a.yearly+"%"]:null,a.vehicle&&veh(a.vehicle)?["Vehicle",veh(a.vehicle).name]:null,a.notes?["Notes",a.notes]:null].filter(Boolean);
  openSheet(a.name,`<div class="table-wrap"><table><tbody>${rows.map(([k,x])=>`<tr><td class="muted">${esc(k)}</td><td class="r" style="white-space:normal">${esc(x)}</td></tr>`).join("")}</tbody></table></div>
  <h3 style="margin:16px 0 4px">History</h3>${hist.length?`<div class="rows">${hist.map(h=>`<div class="row ${h.id?"click":""}" ${h.id?`data-act="tx" data-id="${h.id}" tabindex="0"`:""}><div class="grow"><div class="t">${esc(h.label)}</div><div class="s">${h.date?fdate(h.date):"Date not recorded"}</div></div><span class="num">${rs0(h.amt)}</span></div>`).join("")}</div>`:'<p class="faint small">No history yet.</p>'}
  <div class="actions">${a.sold?"":`<button class="btn" data-act="sell-asset" data-id="${a.id}">Sell</button><button class="btn" data-act="add" data-type="asset_buy" data-asset="${a.id}">Add purchase</button>`}<button class="btn" data-act="edit-asset" data-id="${a.id}">Edit</button>${a.sold?"":`<button class="btn primary" data-act="value-asset" data-id="${a.id}">Update value</button>`}</div>`)}
function assetForm(a){a=a||{};const isEdit=!!a.id;
  openSheet(isEdit?"Edit asset":"Add an asset you own",`<form class="f" data-form="asset" data-id="${a.id||""}">
  <div class="fr">${fld("Asset name",`<input name="name" required value="${esc(a.name||"")}" autofocus placeholder="e.g. House in Nugegoda">`)}${fld("Type",`<select name="category">${opt(ASSET_CATS.map(c=>[c,c]),a.category||"Land & property")}</select>`)}</div>
  ${isEdit?"":`<div class="fr">${fld("Current value (Rs.)",`<input type="number" step="any" min="0" name="value" required inputmode="decimal">`)}${fld("Value as of",`<input type="date" name="valueDate" value="${today()}" required>`)}</div>`}
  <div class="fr">${fld("What you paid (optional)",`<input type="number" step="any" min="0" name="initCost" value="${a.initCost||""}" inputmode="decimal">`)}${fld("When you bought it (optional)",`<input type="date" name="initDate" value="${a.initDate||""}">`)}</div>
  <div class="fr">${fld("Value changes each year (%)",`<input type="number" step="any" name="yearly" value="${a.yearly||""}" placeholder="e.g. 8 or -15">`)}${S.vehicles.length?fld("Linked vehicle",`<select name="vehicle"><option value="">None</option>${opt(S.vehicles.map(v=>[v.id,v.name]),a.vehicle||"")}</select>`):"<div></div>"}</div>
  <p class="hint">Use a minus for things that lose value, like vehicles and electronics. Leave it blank to keep the value the same until you update it.</p>
  ${fld("Notes",`<textarea name="notes" rows="2">${esc(a.notes||"")}</textarea>`)}
  ${isEdit?"":`<p class="info">This adds something you already own without moving any money. To record buying something now, use Asset purchase.</p>`}
  <div class="actions">${isEdit?`<button type="button" class="btn danger" data-act="del-asset" data-id="${a.id}">Delete</button>`:""}<button type="button" class="btn" data-act="close">Cancel</button><button class="btn primary">${isEdit?"Save changes":"Add asset"}</button></div></form>`)}
function valueForm(a){openSheet("Update value",`<form class="f" data-form="assetval" data-id="${a.id}"><p class="muted">${esc(a.name)} is estimated at ${rs0(assetValue(a))} today.</p>
  <div class="fr">${fld("Value (Rs.)",`<input type="number" step="any" min="0" name="value" required autofocus inputmode="decimal" value="${Math.round(assetValue(a))}">`)}${fld("As of",`<input type="date" name="date" value="${today()}" required>`)}</div>
  ${fld("Source (optional)",`<input name="note" placeholder="e.g. Bank valuation, jeweller's quote">`)}
  <div class="actions"><button type="button" class="btn" data-act="close">Cancel</button><button class="btn primary">Save value</button></div></form>`)}
function shareRows(){const P=positions();const t0=today();return(S.stocks||[]).map(st=>{const p=P[st.id]||{qty:0,cost:0,realized:0,divs:0};const pr=stockPrice(st,t0,p);const price=pr.price!=null?pr.price:(p.qty?p.cost/p.qty:0);const val=p.qty>0?p.qty*price:0;return{st,p,price,pd:pr.date,val,gain:val-p.cost,avg:p.qty?p.cost/p.qty:0}})}
function vShares(){const t0=today(),y=t0.slice(0,4);const rows=shareRows();const held=rows.filter(r=>r.p.qty>0).sort((a,b)=>b.val-a.val),closed=rows.filter(r=>r.p.qty<=0&&(r.p.realized||r.p.divs));
  const mv=sum(held,r=>r.val),cost=sum(held,r=>r.p.cost),ug=mv-cost;
  const Pprev=positions((+y-1)+"-12-31");const realY=sum(rows,r=>r.p.realized-((Pprev[r.st.id]||{}).realized||0));const realAll=sum(rows,r=>r.p.realized);
  const divY=sum(L().all.filter(t=>t.type==="dividend"&&t.date.slice(0,4)===y),t=>+t.amount);const divAll=sum(rows,r=>r.p.divs);
  const m12=lastMonths(12);const trend=m12.map(m=>{const e=monthRange(m)[1];return portfolioValue(e>t0?t0:e)});
  const bySector={};for(const r of held){const k=r.st.sector||"Other";bySector[k]=(bySector[k]||0)+r.val}
  const pct=(a,b)=>b?`${a>=0?"+":"−"}${Math.abs(a/b*100).toFixed(1)}%`:"";
  const stale=held.filter(r=>!r.pd||daysBetween(r.pd,t0)>7).length;
  const trades=L().all.filter(t=>t.stockId).slice(-12).reverse();
  return`${head("Shares",`Portfolio ${rs0(mv)}`,`${held.length?`<button class="btn" data-act="prices">Update prices</button>`:""}<button class="btn" data-act="add" data-type="dividend">Dividend</button>${held.length?`<button class="btn" data-act="add" data-type="share_sell">Sell</button>`:""}<button class="btn primary" data-act="add" data-type="share_buy">Buy shares</button>`)}
  ${stale?`<div class="panel" style="border-color:var(--saffron);margin-bottom:16px"><p>${stale} holding${stale===1?" has a price":"s have prices"} more than a week old. <a href="#" data-act="prices">Update prices</a> to see today's value.</p></div>`:""}
  <div class="stats"><div class="stat"><span>Market value</span><b>${rs0(mv)}</b><em>${held.length} holding${held.length===1?"":"s"}</em></div><div class="stat"><span>Cost of holdings</span><b>${rs0(cost)}</b><em>Including fees</em></div><div class="stat"><span>Unrealised gain</span><b class="${ug<0?"neg":"pos"}">${ug<0?"":"+"}${rs0(ug)}</b><em>${pct(ug,cost)}</em></div><div class="stat"><span>Realised gain ${y}</span><b class="${realY<0?"neg":"pos"}">${realY<0?"":"+"}${rs0(realY)}</b><em>All time ${rs0(realAll)}</em></div><div class="stat"><span>Dividends ${y}</span><b class="pos">${rs0(divY)}</b><em>All time ${rs0(divAll)}</em></div><div class="stat"><span>Total return</span><b class="${ug+realAll+divAll<0?"neg":"pos"}">${ug+realAll+divAll<0?"":"+"}${rs0(ug+realAll+divAll)}</b><em>Gains plus dividends</em></div></div>
  <div class="section panel"><h2 style="margin-bottom:8px">Holdings</h2>${held.length?`<div class="table-wrap"><table><thead><tr><th>Company</th><th class="r">Shares</th><th class="r">Avg cost</th><th class="r">Price</th><th class="r">Value</th><th class="r">Gain</th><th class="r">Weight</th></tr></thead><tbody>${held.map(r=>`<tr data-act="stock" data-id="${r.st.id}" style="cursor:pointer"><td><b>${esc(r.st.symbol)}</b><div class="faint small">${esc(r.st.name||"")}</div></td><td class="r num">${fq(r.p.qty)}</td><td class="r num">${rs(r.avg,true)}</td><td class="r num">${rs(r.price,true)}<div class="faint small">${r.pd?fdate(r.pd,{day:"numeric",month:"short"}):"no price"}</div></td><td class="r num"><b>${rs0(r.val)}</b></td><td class="r num ${r.gain<0?"neg":"pos"}">${r.gain<0?"":"+"}${rs0(r.gain)}<div class="small">${pct(r.gain,r.p.cost)}</div></td><td class="r num">${mv?Math.round(r.val/mv*100):0}%</td></tr>`).join("")}<tr class="total"><td>Total</td><td></td><td></td><td></td><td class="r num">${rs0(mv)}</td><td class="r num ${ug<0?"neg":"pos"}">${ug<0?"":"+"}${rs0(ug)}</td><td class="r">100%</td></tr></tbody></table></div>`:`<div class="empty"><b>No shares yet</b>Record a purchase with Buy shares. For shares you owned before using Kasi, tick "I already owned these" so no money leaves your accounts.</div>`}</div>
  <div class="section grid g2"><div class="panel"><div class="panel-head"><h2>Portfolio value</h2><span class="faint small">12 months</span></div>${lineChart(m12.map(m=>monthName(m,true)),[{name:"Portfolio",color:"var(--sky)",values:trend}])}</div>
  <div class="panel"><h2 style="margin-bottom:12px">By sector</h2>${hbars(Object.entries(bySector).sort((a,b)=>b[1]-a[1]).map(([l,v])=>({label:l,value:v,text:rs0(v)+(mv?` (${Math.round(v/mv*100)}%)`:"")})),{empty:"No holdings yet."})}</div></div>
  <div class="section grid g2"><div class="panel"><h2 style="margin-bottom:6px">Recent activity</h2>${txList(trades)}</div>
  <div class="panel"><h2 style="margin-bottom:12px">Dividends by company, ${y}</h2>${hbars(rows.map(r=>({label:r.st.symbol,value:sum(L().all.filter(t=>t.type==="dividend"&&t.stockId===r.st.id&&t.date.slice(0,4)===y),t=>+t.amount)})).sort((a,b)=>b.value-a.value),{empty:"No dividends recorded this year."})}</div></div>
  ${closed.length?`<div class="section panel"><h2 style="margin-bottom:8px">Sold holdings</h2><div class="table-wrap"><table><thead><tr><th>Company</th><th class="r">Realised gain</th><th class="r">Dividends received</th></tr></thead><tbody>${closed.map(r=>`<tr data-act="stock" data-id="${r.st.id}" style="cursor:pointer"><td>${esc(stockLabel(r.st))}</td><td class="r num ${r.p.realized<0?"neg":"pos"}">${r.p.realized<0?"":"+"}${rs0(r.p.realized)}</td><td class="r num">${rs0(r.p.divs)}</td></tr>`).join("")}</tbody></table></div></div>`:""}
  <p class="hint section">Prices are entered by you. Gains use the average cost method, with brokerage fees added to the cost when you buy and taken off what you receive when you sell.</p>`}
function stockDetail(st){const r=shareRows().find(x=>x.st.id===st.id);const p=r.p;const hist=L().all.filter(t=>t.stockId===st.id).slice().reverse();
  const rows=[["Sector",st.sector||"Other"],["Shares held",fq(p.qty)],p.qty?["Average cost",rs(r.avg,true)]:null,p.qty?["Cost of holding",rs0(p.cost)]:null,["Latest price",r.pd?`${rs(r.price,true)} on ${fdate(r.pd)}`:"Not entered yet"],p.qty?["Market value",rs0(r.val)]:null,p.qty?["Unrealised gain",(r.gain<0?"":"+")+rs0(r.gain)+(p.cost?` (${(r.gain/p.cost*100).toFixed(1)}%)`:"")]:null,["Realised gain",(p.realized<0?"":"+")+rs0(p.realized)],["Dividends received",rs0(p.divs)],st.notes?["Notes",st.notes]:null].filter(Boolean);
  openSheet(stockLabel(st),`<div class="table-wrap"><table><tbody>${rows.map(([k,x])=>`<tr><td class="muted">${esc(k)}</td><td class="r" style="white-space:normal">${esc(x)}</td></tr>`).join("")}</tbody></table></div>
  <h3 style="margin:16px 0 4px">History</h3>${txList(hist)}
  <div class="actions" style="flex-wrap:wrap"><button class="btn" data-act="edit-stock" data-id="${st.id}">Edit</button><button class="btn" data-act="add" data-type="share_adjust" data-stock="${st.id}">Bonus or split</button><button class="btn" data-act="add" data-type="dividend" data-stock="${st.id}">Dividend</button>${p.qty?`<button class="btn" data-act="add" data-type="share_sell" data-stock="${st.id}">Sell</button>`:""}<button class="btn primary" data-act="add" data-type="share_buy" data-stock="${st.id}">Buy more</button></div>`)}
function stockForm(st){openSheet("Edit company",`<form class="f" data-form="stock" data-id="${st.id}"><div class="fr">${fld("Symbol",`<input name="symbol" required value="${esc(st.symbol)}" autocapitalize="characters">`)}${fld("Company name",`<input name="sname" value="${esc(st.name||"")}">`)}</div>
  ${fld("Sector",`<select name="sector">${opt(SECTORS.map(x=>[x,x]),st.sector||"Other")}</select>`)}${fld("Notes",`<textarea name="notes" rows="2">${esc(st.notes||"")}</textarea>`)}
  <div class="actions"><button type="button" class="btn danger" data-act="del-stock" data-id="${st.id}">Delete</button><button type="button" class="btn" data-act="close">Cancel</button><button class="btn primary">Save changes</button></div></form>`)}
function pricesForm(){const rows=shareRows().filter(r=>r.p.qty>0);
  openSheet("Update share prices",`<form class="f" data-form="prices">${fld("Prices as of",`<input type="date" name="date" value="${today()}" required>`)}
  ${rows.map(r=>`<div class="fr" style="align-items:end">${fld(`${esc(r.st.symbol)} <span class="faint">(${fq(r.p.qty)} shares, last ${rs(r.price,true)})</span>`,`<input type="number" name="p_${r.st.id}" step="0.01" min="0" inputmode="decimal" placeholder="${r.price||""}">`)}<div class="hint" style="padding-bottom:12px">${r.st.name?esc(r.st.name):""}</div></div>`).join("")}
  <p class="hint">Leave a price blank to keep the last one. Closing prices are on the CSE website or your broker's app.</p>
  <div class="actions"><button type="button" class="btn" data-act="close">Cancel</button><button class="btn primary">Save prices</button></div></form>`)}
const VIEW_FN={dashboard:vDashboard,salary:vSalary,transactions:vTransactions,accounts:vAccounts,cards:vCards,bills:vBills,food:vFood,vehicles:vVehicles,fuel:vFuel,budget:vBudget,savings:vSavings,assets:vAssets,shares:vShares,reports:vReports,settings:vSettings};
const POST={};

/* ================= Modal ================= */
function openSheet(title,body,mount){const m=$("#modal");m.innerHTML=`<div class="scrim" data-scrim><div class="sheet" role="dialog" aria-modal="true" aria-label="${esc(title)}"><div class="sheet-head"><h2>${esc(title)}</h2><button class="x" data-act="close" aria-label="Close">×</button></div><div id="sheetBody">${body}</div></div></div>`;
  if(mount)mount($("#sheetBody"));const first=m.querySelector("[autofocus]")||m.querySelector("input,select,button:not(.x)");if(first)setTimeout(()=>first.focus(),30)}
function closeSheet(){$("#modal").innerHTML=""}

function chooser(){openSheet("Add transaction",`<div class="types">
  ${[["expense","Expense","Cash, bank or debit"],["income","Income","Salary or other"],["transfer","Transfer","Between your accounts"],["cc_purchase","Credit card purchase","Spent on a card"],["cc_payment","Credit card payment","Pay a card from bank"],["bill","Bill payment","Electricity, rent, loans"],["fuel","Fuel","Linked to a vehicle"],["refund","Refund","Money back"],["asset_buy","Asset purchase","Land, gold, laptop"],["share_buy","Buy shares","CSE share purchase"]].map(([k,l,s])=>`<button data-act="add" data-type="${k}"><div class="glyph ${k==="income"?"gl-inc":k==="transfer"||k==="cc_payment"?"gl-xfer":k==="cc_purchase"?"gl-card":k==="refund"?"gl-ref":k==="asset_buy"||k==="share_buy"?"gl-asset":"gl-exp"}">${{expense:"Ex",income:"In",transfer:"⇄",cc_purchase:"CC",cc_payment:"⇄",bill:"B",fuel:"F",refund:"Rf",asset_buy:"As",share_buy:"Sh"}[k]}</div><div>${l}<small>${s}</small></div></button>`).join("")}</div>
  <div class="more-types chips"><button class="chip" data-act="add" data-type="transfer" data-tosav="1">Savings transfer</button><button class="chip" data-act="add" data-type="transfer" data-preset="withdraw">Cash withdrawal</button><button class="chip" data-act="add" data-type="transfer" data-preset="deposit">Cash deposit</button><button class="chip" data-act="add" data-type="asset_sell">Asset sale</button><button class="chip" data-act="add" data-type="share_sell">Sell shares</button><button class="chip" data-act="add" data-type="dividend">Dividend</button></div>`)}
function moreMenu(){openSheet("More",`<div class="types">${VIEWS.filter(([k])=>!["dashboard","transactions","budget"].includes(k)).map(([k,l])=>`<button data-act="nav" data-v="${k}"><div>${l}</div></button>`).join("")}</div>`)}

/* ---------- Transaction form ---------- */
const opt=(arr,val)=>arr.map(([v,l])=>`<option value="${esc(v)}" ${String(v)===String(val??"")?"selected":""}>${esc(l)}</option>`).join("");
const fld=(label,inner,cls)=>`<label class="fld ${cls||""}"><span>${label}</span>${inner}</label>`;
const acctsFor=method=>S.accounts.filter(a=>method==="Cash"?a.type==="Cash":method==="Digital Wallet"?a.type==="Digital Wallet":a.type!=="Cash"&&a.type!=="Digital Wallet");
function merchantList(){const s=new Set();for(const t of L().all)if(t.merchant)s.add(t.merchant);return[...s].slice(-200)}
function lastUsed(field,cat){const all=L().all;for(let i=all.length-1;i>=0;i--){const t=all[i];if((!cat||t.cat===cat)&&t[field])return t[field]}return""}

function payBlock(t,allowCard){const method=t.method||(t.card?"Credit Card":S.settings.lastMethod||"Bank Account");const methods=allowCard?METHODS:METHODS.filter(m=>m!=="Credit Card");
  return`<div class="fr">${fld("Paid with",`<select name="method" data-paymethod>${opt(methods.map(m=>[m,m]),allowCard?method:(method==="Credit Card"?"Bank Account":method))}</select>`)}
  <div data-acctwrap>${fld("Account",`<select name="acct"></select>`)}</div><div data-cardwrap hidden>${fld("Credit card",`<select name="card">${opt(S.cards.map(c=>[c.id,c.name]),t.card)}</select>`)}</div></div>`}
function mountPay(root,t){const ms=root.querySelector("[data-paymethod]");if(!ms)return;const as=root.querySelector("select[name=acct]");
  const upd=()=>{const m=ms.value;const isCard=m==="Credit Card";root.querySelector("[data-acctwrap]").hidden=isCard;root.querySelector("[data-cardwrap]").hidden=!isCard;
    if(!isCard){const list=acctsFor(m);const cur=as.value||t.acct||(m===S.settings.lastMethod?S.settings.lastAcct:"");as.innerHTML=list.length?opt(list.map(a=>[a.id,acctLabel(a)]),list.some(a=>a.id===cur)?cur:list[0].id):`<option value="">No ${m==="Cash"?"cash":m==="Digital Wallet"?"wallet":"bank"} account yet</option>`}};
  ms.addEventListener("change",upd);upd()}

function txForm(type,t,preset){preset=preset||{};t=t||{};const isEdit=!!t.id;const d=t.date||today();
  const amountF=(label)=>fld(label||"Amount (Rs.)",`<input type="number" name="amount" inputmode="decimal" step="0.01" min="0" required value="${t.amount??""}" ${isEdit?"":"autofocus"} placeholder="0">`,"amt");
  const dateF=fld("Date",`<input type="date" name="date" required value="${d}">`);
  const notesF=fld("Notes",`<textarea name="notes" rows="2">${esc(t.notes||"")}</textarea>`);
  const refF=fld("Reference",`<input name="ref" value="${esc(t.ref||"")}">`);
  const vehF=(req)=>S.vehicles.length?fld("Vehicle"+(req?"":" (if applicable)"),`<select name="vehicle" ${req?"required":""}>${req?"":'<option value="">None</option>'}${opt(S.vehicles.map(v=>[v.id,v.name+(v.reg?" ("+v.reg+")":"")]),t.vehicle||preset.veh||(req?S.vehicles[0].id:""))}</select>`):req?`<p class="info">Add a vehicle first in Vehicles.</p>`:"";
  const receiptF=`<label class="fld"><span>Receipt photo ${t.receipt?"(attached, choose a new one to replace)":"(optional)"}</span><input type="file" name="receipt" accept="image/*" capture="environment"></label>`;
  const recurF=`<label class="chk"><input type="checkbox" name="recurring" ${t.recurring?"checked":""}> Recurring expense</label>`;
  const catSel=(cat,sub)=>{cat=cat||preset.cat||"Groceries";return`<div><span class="hint">Category</span><div class="chips" data-catchips style="margin-top:4px">${[...Object.keys(CATS).filter(c=>c!=="Bank charges"),...(type==="expense"||type==="cc_purchase"?["Fuel"]:[])].map(c=>`<button type="button" class="chip" data-cat="${esc(c)}" aria-pressed="${c===cat}">${esc(c)}</button>`).join("")}</div><input type="hidden" name="cat" value="${esc(cat)}"></div>
    <div class="fr">${fld("Subcategory",`<select name="sub" data-sub>${opt((CATS[cat]||["Other"]).map(s=>[s,s]),sub)}</select>`)}${fld("Merchant / store",`<input name="merchant" list="merchants" value="${esc(t.merchant||"")}" placeholder="e.g. Keells, Uber Eats">`)}</div><datalist id="merchants">${merchantList().map(m=>`<option value="${esc(m)}">`).join("")}</datalist><div data-vehwrap>${vehF(false)}</div>`};
  let body="",title=(isEdit?"Edit ":"")+TYPE_LABEL[type];
  if(type==="expense"||type==="cc_purchase"){
    if(type==="cc_purchase"&&!S.cards.length)return openSheet(title,`<p class="info">Add a credit card first.</p><div class="actions"><button class="btn primary" data-act="edit-card">Add card</button></div>`);
    body=`${amountF()}<div class="fr">${dateF}${fld("Description",`<input name="desc" value="${esc(t.desc||"")}">`)}</div>${catSel(t.cat,t.sub)}
    ${type==="cc_purchase"?fld("Credit card",`<select name="card">${opt(S.cards.map(c=>[c.id,c.name]),t.card||preset.card)}</select>`)+`<input type="hidden" name="method" value="Credit Card">`:payBlock(t,true)}
    ${receiptF}${notesF}${recurF}`;
  }else if(type==="income"){
    const sub=t.sub||preset.sub||"Salary";const s=t.sal||{};const salAcct=t.acct||lastUsed("acct")||(S.accounts.find(a=>a.type==="Salary")||S.accounts[0]||{}).id;
    body=`<div class="chips" data-incchips>${["Salary","Bonus","Other income","Interest","Rental income"].map(x=>`<button type="button" class="chip" data-inc="${x}" aria-pressed="${x===sub}">${x}</button>`).join("")}</div><input type="hidden" name="sub" value="${esc(sub)}">
    <div data-salwrap ${sub==="Salary"?"":"hidden"}><div class="fr">${fld("Basic salary",`<input type="number" step="any" min="0" name="basic" data-sal value="${s.basic||""}">`)}${fld("Allowances",`<input type="number" step="any" min="0" name="allow" data-sal value="${s.allow||""}">`)}${fld("Bonus",`<input type="number" step="any" min="0" name="bonus" data-sal value="${s.bonus||""}">`)}${fld("Other income",`<input type="number" step="any" min="0" name="other" data-sal value="${s.other||""}">`)}${fld("Deductions (EPF, tax, loans)",`<input type="number" step="any" min="0" name="deduct" data-sal value="${s.deduct||""}">`)}</div><p class="hint" style="margin:4px 0 8px">Net salary fills in from the breakdown. You can also type it directly.</p></div>
    ${amountF("Net amount received (Rs.)")}<div class="fr">${dateF}${fld("Received into",`<select name="acct">${opt(S.accounts.map(a=>[a.id,acctLabel(a)]),salAcct)}</select>`)}</div>${fld("Description",`<input name="desc" value="${esc(t.desc||"")}" placeholder="e.g. September salary">`)}${notesF}`;
  }else if(type==="transfer"){
    let from=t.acct,to=t.toAcct;const sav=S.accounts.find(a=>SAVING_TYPES.includes(a.type)),cash=S.accounts.find(a=>a.type==="Cash"),bank=S.accounts.find(a=>a.type==="Salary")||S.accounts.find(a=>a.type!=="Cash");
    if(!isEdit){if(preset.tosav){from=bank&&bank.id;to=sav&&sav.id}else if(preset.preset==="withdraw"){from=bank&&bank.id;to=cash&&cash.id}else if(preset.preset==="deposit"){from=cash&&cash.id;to=bank&&bank.id}else{from=bank&&bank.id}}
    const targets=[...S.accounts.map(a=>[a.id,acctLabel(a)+", "+a.type]),...S.cards.map(c=>["card:"+c.id,c.name+", credit card"])];
    body=`${amountF()}<div class="fr">${fld("From",`<select name="acct" required>${opt(S.accounts.map(a=>[a.id,acctLabel(a)+", "+a.type]),from)}</select>`)}${fld("To",`<select name="toAcct" required>${opt(targets,to||"")}</select>`)}</div>
    <div class="fr">${dateF}${fld("Transfer fee (Rs.)",`<input type="number" step="any" min="0" name="fee" value="${t.fee||""}" placeholder="0">`)}</div>${refF}${notesF}
    <p class="info">Moving money between your own accounts is not income or spending. Choosing a credit card here records a card payment. Only the fee counts as a bank charge.</p>`;
    title=isEdit?"Edit transfer":preset.tosav?"Move to savings":preset.preset==="withdraw"?"Cash withdrawal":preset.preset==="deposit"?"Cash deposit":"Transfer";
  }else if(type==="cc_payment"){
    if(!S.cards.length)return openSheet(title,`<p class="info">Add a credit card first.</p><div class="actions"><button class="btn primary" data-act="edit-card">Add card</button></div>`);
    const cid=t.card||preset.card||S.cards[0].id;
    body=`${fld("Credit card",`<select name="card" data-ccsel>${opt(S.cards.map(c=>[c.id,c.name]),cid)}</select>`)}<div data-ccinfo></div>${amountF("Payment amount (Rs.)")}
    <div class="chips" data-ccquick></div>
    <div class="fr">${fld("Paying bank account",`<select name="acct" required>${opt(S.accounts.filter(a=>a.type!=="Cash"||true).map(a=>[a.id,acctLabel(a)]),t.acct||(S.accounts.find(a=>a.type==="Salary")||S.accounts[0]||{}).id)}</select>`)}${dateF}</div>${refF}${notesF}
    <p class="info">A card payment moves money from your bank to the card. It's not spending, because the purchases were already counted.</p>`;
  }else if(type==="bill"){
    const items=billItems(addMonths(today(),-3),addDays(today(),45)).filter(i=>!i.paid||(isEdit&&i.paid.id===t.id));
    const key=t.billId?t.billId+"|"+t.billDue:preset.bill?preset.bill+"|"+preset.due:(items[0]?items[0].b.id+"|"+items[0].due:"");
    const b0=t.billId?bill(t.billId):preset.bill?bill(preset.bill):items[0]&&items[0].b;
    t=Object.assign({},t,{amount:t.amount??(b0?b0.amount:"")});if(!isEdit&&b0){if(b0.payCard){t.card=b0.payCard;t.method="Credit Card"}else if(b0.payAcct){t.acct=b0.payAcct;const a=acct(b0.payAcct);t.method=a&&a.type==="Cash"?"Cash":a&&a.type==="Digital Wallet"?"Digital Wallet":"Bank Transfer"}}
    const opts=[...items.map(i=>[i.b.id+"|"+i.due,`${i.b.name}, due ${fdate(i.due,{day:"numeric",month:"short"})} (${i.status})`]),...(isEdit&&t.billId&&!items.some(i=>i.b.id===t.billId&&i.due===t.billDue)?[[t.billId+"|"+t.billDue,(bill(t.billId)||{}).name+", "+t.billDue]]:[]),["|","One-off bill"]];
    body=`${fld("Bill",`<select name="billKey" data-billsel>${opt(opts,key||"|")}</select>`)}
    <div data-oneoff ${key&&key!=="|"?"hidden":""}><div class="fr">${fld("Bill name",`<input name="desc" value="${esc(t.desc||"")}">`)}${fld("Category",`<select name="sub">${opt(BILL_CATS.map(c=>[c,c]),t.sub||"Other")}</select>`)}</div></div>
    ${amountF()}<div class="fr">${dateF}${refF}</div>${payBlock(t,true)}<div data-vehwrap>${vehF(false)}</div>${receiptF}${notesF}
    <label class="chk"><input type="checkbox" name="already" ${t.already?"checked":""}> Already recorded as an expense (only mark this bill paid)</label>`;
  }else if(type==="fuel"){
    if(!S.vehicles.length)return openSheet(title,`<p class="info">Fuel is linked to a vehicle. Add your vehicle first.</p><div class="actions"><button class="btn primary" data-act="edit-vehicle">Add vehicle</button></div>`);
    const vid=t.vehicle||preset.veh||S.vehicles[0].id;const v=veh(vid);
    body=`${fld("Vehicle",`<select name="vehicle" required data-fuelveh>${opt(S.vehicles.map(x=>[x.id,x.name+(x.reg?" ("+x.reg+")":"")]),vid)}</select>`)}
    <div class="fr">${fld("Litres",`<input type="number" step="0.01" min="0" name="litres" data-fcalc value="${t.litres||""}" ${isEdit?"":"autofocus"}>`)}${fld("Price per litre",`<input type="number" step="0.01" min="0" name="ppl" data-fcalc value="${t.ppl||lastUsed("ppl")||""}">`)}</div>
    ${amountF()}<div class="fr">${dateF}${fld("Fuel type",`<select name="fuelType">${opt(FUEL_TYPES.map(f=>[f,f]),t.fuelType||lastUsed("fuelType")||(v&&v.fuel&&FUEL_TYPES.find(f=>f.toLowerCase().includes(v.fuel.toLowerCase().split(" ")[0])))||"Petrol 92")}</select>`)}</div>
    <div class="fr">${fld("Fuel station",`<input name="merchant" list="stations" value="${esc(t.merchant||lastUsed("merchant","Fuel")||"")}" placeholder="e.g. Ceypetco, IOC">`)}${fld("Odometer (km)",`<input type="number" name="odo" min="0" value="${t.odo||""}" placeholder="Last ${nf0.format(v?vehOdo(v):0)}">`)}</div>
    <datalist id="stations">${[...new Set(L().all.filter(x=>x.type==="fuel"&&x.merchant).map(x=>x.merchant))].map(m=>`<option value="${esc(m)}">`).join("")}</datalist>
    ${payBlock(t,true)}${receiptF}${notesF}`;
  }else if(type==="asset_buy"){
    const held=(S.assets||[]).filter(a=>!a.sold||a.id===t.assetId);const sel=t.assetId||preset.asset||"new";
    body=`${fld("Asset",`<select name="assetId" data-assetsel>${opt([["new","New asset"],...held.map(a=>[a.id,a.name+", "+a.category])],sel)}</select>`)}
    <div data-newasset ${sel==="new"?"":"hidden"}><div class="fr">${fld("Asset name",`<input name="assetName" placeholder="e.g. Land in Kandy, gold chain, laptop">`)}${fld("Type",`<select name="assetCat">${opt(ASSET_CATS.map(c=>[c,c]),"Land & property")}</select>`)}</div>
    <div class="fr">${fld("Value changes each year (%)",`<input type="number" step="any" name="yearly" placeholder="e.g. 8 or -15">`)}${S.vehicles.length?fld("Linked vehicle",`<select name="assetVeh"><option value="">None</option>${opt(S.vehicles.map(v=>[v.id,v.name]),"")}</select>`):"<div></div>"}</div>
    <p class="hint" style="margin-bottom:6px">Use a minus for things that lose value. Leave it blank to keep the value until you update it.</p></div>
    ${amountF("Amount paid (Rs.)")}<div class="fr">${dateF}${refF}</div>${payBlock(t,true)}${fld("Description",`<input name="desc" value="${esc(t.desc||"")}" placeholder="e.g. Including deed and transfer costs">`)}${receiptF}${notesF}
    <label class="chk"><input type="checkbox" name="countSpend" ${t.countSpend?"checked":""}> Also count this as spending</label>
    <p class="info">Buying an asset turns money into something you own, so by default it isn't counted as spending. Tick the box for things you'd rather treat as spending, like a phone.</p>`;
  }else if(type==="share_buy"||type==="share_sell"){
    const sell=type==="share_sell";const P=positions(null,isEdit?t.id:null);
    const list=(S.stocks||[]).filter(x=>!sell||((P[x.id]||{}).qty>0)||x.id===t.stockId);
    if(sell&&!list.length)return openSheet(title,`<p class="info">You don't hold any shares to sell yet.</p>`);
    const sel=t.stockId||preset.stock||(list.length?list[0].id:"new");
    body=`${fld("Company",`<select name="stockId" data-stocksel>${opt([...(sell?[]:[["new","New company"]]),...list.map(x=>[x.id,stockLabel(x)])],sel)}</select>`)}
    ${sell?"":`<div data-newstock ${sel==="new"?"":"hidden"}><div class="fr">${fld("Symbol",`<input name="symbol" list="cseList" placeholder="e.g. JKH.N0000" autocapitalize="characters" autocomplete="off">`)}${fld("Company name",`<input name="sname" placeholder="e.g. John Keells Holdings">`)}</div>${fld("Sector",`<select name="sector">${opt(SECTORS.map(x=>[x,x]),"Other")}</select>`)}<datalist id="cseList">${CSE_SUGGEST.map(([a,b])=>`<option value="${a}">${esc(b)}</option>`).join("")}</datalist></div>`}
    <div data-stockinfo></div>
    <div class="fr">${fld("Number of shares",`<input type="number" name="qty" min="0" step="any" required inputmode="decimal" value="${t.qty||""}" data-tcalc>`)}${fld("Price per share (Rs.)",`<input type="number" name="price" min="0" step="0.01" required inputmode="decimal" value="${t.price||""}" data-tcalc>`)}</div>
    <div class="fr">${fld("Brokerage and fees (Rs.)",`<input type="number" name="fee" min="0" step="0.01" inputmode="decimal" value="${t.fee||""}" data-tcalc>`)}${dateF}</div>
    <input type="hidden" name="amount" value="${t.amount||""}"><div class="info" data-ttotal></div>
    ${sell?"":`<label class="chk"><input type="checkbox" name="noCash" data-nocash ${t.noCash?"checked":""}> I already owned these (don't take money from an account)</label>`}
    <div class="fr"><div data-acctbox>${fld(sell?"Received into":"Paid from",`<select name="acct">${opt(S.accounts.map(a=>[a.id,acctLabel(a)]),t.acct||defaultInvestAcct())}</select>`)}</div>${fld("Contract note number",`<input name="ref" value="${esc(t.ref||"")}">`)}</div>${notesF}
    <p class="hint">Your broker's contract note shows the price and total fees. ${sell?"A share sale isn't counted as income; your gain or loss shows on the Shares page.":"Buying shares isn't counted as spending. Fees are added to the cost of your shares."}</p>`;
  }else if(type==="dividend"||type==="share_adjust"){
    const list=S.stocks||[];if(!list.length)return openSheet(title,`<p class="info">Record a share purchase first, then you can add ${type==="dividend"?"dividends":"bonus shares"} for it.</p><div class="actions"><button class="btn primary" data-act="add" data-type="share_buy">Buy shares</button></div>`);
    const sel=t.stockId||preset.stock||list[0].id;const csel=fld("Company",`<select name="stockId">${opt(list.map(x=>[x.id,stockLabel(x)]),sel)}</select>`);
    body=type==="dividend"?`${csel}${amountF("Amount received (Rs.)")}<div class="fr">${dateF}${fld("Into account",`<select name="acct">${opt(S.accounts.map(a=>[a.id,acctLabel(a)]),t.acct||defaultInvestAcct())}</select>`)}</div>
      ${fld("Tax withheld (optional)",`<input type="number" name="wht" min="0" step="0.01" inputmode="decimal" value="${t.wht||""}">`)}${notesF}<p class="info">Dividends count as income. Enter the amount that reached your account after tax.</p>`
     :`${csel}<div class="fr">${fld("Extra shares received",`<input type="number" name="qty" step="any" required inputmode="decimal" value="${t.qty||""}" autofocus>`)}${dateF}</div>${fld("Description",`<input name="desc" value="${esc(t.desc||"")}" placeholder="e.g. Bonus issue 1 for 10, or 2-for-1 split">`)}${notesF}
      <p class="info">Bonus issues and splits add shares at no cost, so your average cost per share goes down. For a split, enter the extra shares you received.</p>`;
  }else if(type==="asset_sell"){
    const held=(S.assets||[]).filter(a=>!a.sold||a.id===t.assetId);
    if(!held.length)return openSheet(title,`<p class="info">You don't have any assets to sell yet.</p><div class="actions"><button class="btn primary" data-act="nav" data-v="assets">Go to Assets</button></div>`);
    const sel=t.assetId||preset.asset||held[0].id;
    body=`${fld("Asset",`<select name="assetId" data-sellsel>${opt(held.map(a=>[a.id,a.name]),sel)}</select>`)}<div data-sellinfo></div>${amountF("Sale amount received (Rs.)")}
    <div class="fr">${dateF}${fld("Received into",`<select name="acct">${opt(S.accounts.map(a=>[a.id,acctLabel(a)]),t.acct||(S.accounts.find(a=>a.type==="Salary")||S.accounts[0]||{}).id)}</select>`)}</div>${refF}${notesF}
    <p class="info">Selling turns the asset back into money, so it isn't counted as income. Your gain or loss shows on the Assets page.</p>`;
  }else if(type==="refund"){
    body=`${amountF()}<div class="fr">${dateF}${fld("Merchant",`<input name="merchant" list="merchants" value="${esc(t.merchant||"")}">`)}</div>${catSel(t.cat,t.sub)}
    ${fld("Refunded to",`<select name="dest">${opt([...S.accounts.map(a=>["a:"+a.id,acctLabel(a)]),...S.cards.map(c=>["c:"+c.id,c.name])],t.card?"c:"+t.card:t.acct?"a:"+t.acct:"")}</select>`)}${notesF}
    <p class="info">A refund reduces spending in its category.</p>`;
  }
  const html=`<form class="f" data-form="tx" data-type="${type}" data-id="${t.id||""}">${body}<div class="actions">${isEdit?`<button type="button" class="btn danger" data-act="del-tx" data-id="${t.id}">Delete</button>`:""}<button type="button" class="btn" data-act="close">Cancel</button><button class="btn primary" type="submit">${isEdit?"Save changes":"Save"}</button></div></form>`;
  openSheet(title,html,root=>mountTxForm(root,type,t));
}
function mountTxForm(root,type,t){
  mountPay(root,t);
  const cc=root.querySelector("[data-catchips]");
  if(cc){const hid=root.querySelector("input[name=cat]"),sub=root.querySelector("[data-sub]"),vw=root.querySelector("[data-vehwrap]");
    const upd=()=>{const c=hid.value;const vs=vw&&vw.querySelector("select");if(vw){vw.hidden=!(c==="Vehicle"||S.vehicles.length&&vs&&vs.value);if(c==="Vehicle"&&vs){vw.hidden=false;vs.required=true;if(!vs.value&&S.vehicles[0])vs.value=S.vehicles[0].id}else if(vs)vs.required=false}};
    cc.addEventListener("click",e=>{const b=e.target.closest("[data-cat]");if(!b)return;const c=b.dataset.cat;
      if(c==="Fuel"){const amt=root.querySelector("input[name=amount]").value;closeSheet();txForm("fuel",{amount:amt||undefined,card:type==="cc_purchase"?root.querySelector("[name=card]").value:undefined,method:type==="cc_purchase"?"Credit Card":undefined});return}
      hid.value=c;cc.querySelectorAll(".chip").forEach(x=>x.setAttribute("aria-pressed",x===b));sub.innerHTML=opt((CATS[c]||["Other"]).map(s=>[s,s]),"");upd()});
    if(vw){vw.hidden=!(hid.value==="Vehicle"||t.vehicle);const vs=vw.querySelector("select");if(vs&&hid.value==="Vehicle"){vs.required=true;if(!vs.value&&S.vehicles[0])vs.value=S.vehicles[0].id}}
    // show vehicle picker for any category if user wants: toggled by category Vehicle; also keep visible when set
  }
  const ic=root.querySelector("[data-incchips]");
  if(ic){const hid=root.querySelector("input[name=sub]"),sw=root.querySelector("[data-salwrap]");ic.addEventListener("click",e=>{const b=e.target.closest("[data-inc]");if(!b)return;hid.value=b.dataset.inc;ic.querySelectorAll(".chip").forEach(x=>x.setAttribute("aria-pressed",x===b));sw.hidden=hid.value!=="Salary"});
    root.querySelectorAll("[data-sal]").forEach(i=>i.addEventListener("input",()=>{const g=n=>+root.querySelector(`[name=${n}]`).value||0;const net=g("basic")+g("allow")+g("bonus")+g("other")-g("deduct");if(net>0)root.querySelector("[name=amount]").value=Math.round(net*100)/100}))}
  const fc=root.querySelectorAll("[data-fcalc]");
  if(fc.length){const L_=root.querySelector("[name=litres]"),P=root.querySelector("[name=ppl]"),A=root.querySelector("[name=amount]");let manualAmt=!!t.amount&&!t.litres;
    const calc=()=>{const l=+L_.value,p=+P.value;if(l>0&&p>0&&!manualAmt)A.value=Math.round(l*p*100)/100;else if(l>0&&!p&&+A.value>0)P.value=(+A.value/l).toFixed(2)};
    L_.addEventListener("input",calc);P.addEventListener("input",()=>{manualAmt=false;calc()});A.addEventListener("input",()=>{manualAmt=true;const l=+L_.value;if(l>0&&+A.value>0)P.value=(+A.value/l).toFixed(2)})}
  const ccs=root.querySelector("[data-ccsel]");
  if(ccs){const upd=()=>{const c=card(ccs.value);if(!c)return;const st=cardStatus(c);root.querySelector("[data-ccinfo]").innerHTML=`<div class="info">Outstanding <b>${rs0(st.outstanding)}</b>. Statement balance ${rs0(st.stmtBal)}, minimum ${rs0(st.minPay)}, amount due <b>${rs0(st.amountDue)}</b> by ${fdate(st.due,{day:"numeric",month:"short"})} <span class="badge ${st.cls}">${st.status}</span></div>`;
      const q=root.querySelector("[data-ccquick]");q.innerHTML=[["Amount due",st.amountDue],["Minimum",st.minPay],["Full outstanding",st.outstanding]].filter(([,v])=>v>0).map(([l,v])=>`<button type="button" class="chip" data-quick="${Math.round(v*100)/100}">${l} ${rs0(v)}</button>`).join("");
      const A=root.querySelector("[name=amount]");if(!t.id&&!A.value&&st.amountDue>0)A.value=Math.round(st.amountDue*100)/100};
    ccs.addEventListener("change",()=>{root.querySelector("[name=amount]").value="";upd()});root.querySelector("[data-ccquick]").addEventListener("click",e=>{const b=e.target.closest("[data-quick]");if(b)root.querySelector("[name=amount]").value=b.dataset.quick});upd()}
  const ssel2=root.querySelector("[data-stocksel]");
  if(ssel2){const box=root.querySelector("[data-newstock]"),sym=root.querySelector("[name=symbol]"),sn=root.querySelector("[name=sname]"),sec=root.querySelector("[name=sector]");const sell=type==="share_sell";
    const info=root.querySelector("[data-stockinfo]"),tot=root.querySelector("[data-ttotal]"),amt=root.querySelector("[name=amount]");
    const Q=root.querySelector("[name=qty]"),Pr=root.querySelector("[name=price]"),Fe=root.querySelector("[name=fee]");
    const calc=()=>{const q=+Q.value,pr=+Pr.value,fe=+Fe.value||0;if(q>0&&pr>0){const v=sell?q*pr-fe:q*pr+fe;amt.value=Math.round(v*100)/100;let x=`${sell?"You receive":"Total cost"} <b>${rs(v)}</b>`;
        if(sell){const p=positions(null,t.id)[ssel2.value];if(p&&p.qty){const c=p.cost/p.qty*Math.min(q,p.qty);const g=v-c;x+=`. Gain on this sale <b class="${g<0?"neg":"pos"}">${g<0?"":"+"}${rs0(g)}</b>`}}
        else x+=`, so ${rs(v/q,true)} a share including fees`;tot.innerHTML=x;tot.hidden=false}else{tot.hidden=true;amt.value=""}};
    const upd=()=>{const isNew=ssel2.value==="new";if(box){box.hidden=!isNew;sym.required=isNew}const p=positions(null,t.id)[ssel2.value];const st=stock(ssel2.value);
      info.innerHTML=st&&p&&p.qty?`<p class="info">You hold ${fq(p.qty)} shares at an average ${rs(p.cost/p.qty,true)}${stockPrice(st,today(),p).price!=null?`, last price ${rs(stockPrice(st,today(),p).price,true)}`:""}.</p>`:"";calc()};
    if(sym)sym.addEventListener("change",()=>{const m=CSE_SUGGEST.find(x=>x[0]===sym.value.trim().toUpperCase());if(m){sym.value=m[0];if(!sn.value)sn.value=m[1];sec.value=m[2]}});
    ssel2.addEventListener("change",upd);[Q,Pr,Fe].forEach(i=>i.addEventListener("input",calc));
    const nc=root.querySelector("[data-nocash]");if(nc){const ab=root.querySelector("[data-acctbox]");const u2=()=>{ab.hidden=nc.checked};nc.addEventListener("change",u2);u2()}
    upd()}
  const asel=root.querySelector("[data-assetsel]");
  if(asel){const box=root.querySelector("[data-newasset]"),nm=root.querySelector("[name=assetName]");const upd=()=>{const isNew=asel.value==="new";box.hidden=!isNew;nm.required=isNew};asel.addEventListener("change",upd);upd()}
  const ssel=root.querySelector("[data-sellsel]");
  if(ssel){const upd=()=>{const a=asset(ssel.value);if(!a)return;const c=assetCost(a);root.querySelector("[data-sellinfo]").innerHTML=`<div class="info">Estimated value ${rs0(assetValue(a))}${c?`. You paid ${rs0(c)}`:""}.</div>`};ssel.addEventListener("change",upd);upd()}
  const bs=root.querySelector("[data-billsel]");
  if(bs){bs.addEventListener("change",()=>{const [bid]=bs.value.split("|");root.querySelector("[data-oneoff]").hidden=!!bid;const b=bill(bid);if(b){root.querySelector("[name=amount]").value=b.amount||"";const ms=root.querySelector("[data-paymethod]");if(b.payCard){ms.value="Credit Card";ms.dispatchEvent(new Event("change"));root.querySelector("[name=card]").value=b.payCard}else if(b.payAcct){const a=acct(b.payAcct);ms.value=a&&a.type==="Cash"?"Cash":a&&a.type==="Digital Wallet"?"Digital Wallet":"Bank Transfer";ms.dispatchEvent(new Event("change"));root.querySelector("[name=acct]").value=b.payAcct}
      const vs=root.querySelector("[name=vehicle]");if(vs)vs.value=b.vehicle||""}})}
}

async function compressImage(file){const url=URL.createObjectURL(file);try{const img=await new Promise((res,rej)=>{const i=new Image();i.onload=()=>res(i);i.onerror=rej;i.src=url});
  let max=1200,q=.7,data="";for(let k=0;k<6;k++){const s=Math.min(1,max/Math.max(img.width,img.height));const c=document.createElement("canvas");c.width=Math.round(img.width*s);c.height=Math.round(img.height*s);c.getContext("2d").drawImage(img,0,0,c.width,c.height);data=c.toDataURL("image/jpeg",q);if(data.length<200000)break;max*=.8;q-=.08}
  return data.length<240000?data:null}finally{URL.revokeObjectURL(url)}}

async function submitTx(form){const type=form.dataset.type;const id=form.dataset.id;const fd=new FormData(form);const g=k=>(fd.get(k)??"").toString().trim();const old=id?findTx(id):null;
  const t={id:id||uid(),ts:old?old.ts:Date.now(),date:g("date")||today(),amount:Math.round((+g("amount")||0)*100)/100,notes:g("notes")||undefined,ref:g("ref")||undefined};
  if(type==="share_buy"||type==="share_sell"){const q=+g("qty"),pr=+g("price"),fe=+g("fee")||0;t.amount=Math.round((type==="share_buy"?q*pr+fe:q*pr-fe)*100)/100}
  if(!(t.amount>0)&&!(type==="bill"&&fd.get("already"))&&type!=="share_adjust"){toast("Enter an amount greater than zero.");return}
  const payFrom=()=>{const m=g("method");t.method=m;if(m==="Credit Card"){t.card=g("card");if(!t.card){toast("Choose a credit card.");return false}}else{t.acct=g("acct");if(!t.acct){toast("Add or choose an account for "+m+".");return false}}S.settings.lastMethod=m;if(t.acct)S.settings.lastAcct=t.acct;return true};
  if(type==="expense"||type==="cc_purchase"){t.cat=g("cat");t.sub=g("sub");t.merchant=g("merchant")||undefined;t.desc=g("desc")||undefined;t.recurring=!!fd.get("recurring")||undefined;
    if(type==="cc_purchase"){t.method="Credit Card";t.card=g("card")}else if(!payFrom())return;t.type=t.card?"cc_purchase":"expense";t.vehicle=g("vehicle")||undefined;if(t.cat==="Vehicle"&&!t.vehicle){toast("Choose the vehicle for this expense.");return}}
  else if(type==="income"){t.type="income";t.sub=g("sub");t.acct=g("acct");t.desc=g("desc")||undefined;t.method="Bank Account";if(t.sub==="Salary"){const n=k=>+g(k)||0;const s={basic:n("basic"),allow:n("allow"),bonus:n("bonus"),other:n("other"),deduct:n("deduct")};if(Object.values(s).some(Boolean))t.sal=s}if(!t.acct){toast("Add a bank account first.");return}}
  else if(type==="transfer"){t.acct=g("acct");const to=g("toAcct");t.fee=+g("fee")||undefined;if(to.startsWith("card:")){t.type="cc_payment";t.card=to.slice(5)}else{t.type="transfer";t.toAcct=to;if(to===t.acct){toast("From and To must be different accounts.");return}t.kind=transferKind(t.acct,to)}t.method="Bank Transfer"}
  else if(type==="cc_payment"){t.type="cc_payment";t.card=g("card");t.acct=g("acct");t.method="Bank Transfer";const st=cardStatus(card(t.card));t.full=t.amount>=st.amountDue-0.01}
  else if(type==="bill"){t.type="bill";const [bid,due]=g("billKey").split("|");t.already=!!fd.get("already")||undefined;if(bid){t.billId=bid;t.billDue=due;const b=bill(bid);t.sub=b?b.category:"Other";t.desc=b?b.name:undefined;t.merchant=b&&b.provider||undefined}else{t.desc=g("desc")||"Bill";t.sub=g("sub")||"Other"}
    t.cat="Bills";if(!payFrom())return;t.vehicle=g("vehicle")||(bid&&bill(bid)&&bill(bid).vehicle)||undefined}
  else if(type==="fuel"){t.type="fuel";t.cat="Fuel";t.vehicle=g("vehicle");t.litres=+g("litres")||undefined;t.ppl=+g("ppl")||undefined;t.odo=+g("odo")||undefined;t.fuelType=g("fuelType");t.merchant=g("merchant")||undefined;if(!payFrom())return}
  else if(type==="asset_buy"){t.type="asset_buy";if(!payFrom())return;t.countSpend=!!fd.get("countSpend")||undefined;t.desc=g("desc")||undefined;let aid=g("assetId");
    if(aid==="new"){const name=g("assetName");if(!name){toast("Give the asset a name.");return}const na={id:uid(),name,category:g("assetCat"),yearly:+g("yearly")||0,vehicle:g("assetVeh")||"",values:[],initCost:0,createdBy:t.id};S.assets=S.assets||[];S.assets.push(na);aid=na.id}
    t.assetId=aid;const a=asset(aid);if(t.countSpend){t.cat="Shopping";t.sub=a?a.category:"Other"}}
  else if(type==="share_buy"||type==="share_sell"){t.type=type;let sid=g("stockId");const qty=+g("qty"),price=+g("price"),fee=+g("fee")||0;
    if(!(qty>0)||!(price>0)){toast("Enter the number of shares and the price per share.");return}
    if(sid==="new"){const sym=g("symbol").toUpperCase();if(!sym){toast("Enter the company's symbol.");return}let ex=(S.stocks||[]).find(x=>x.symbol===sym);
      if(!ex){ex={id:uid(),symbol:sym,name:g("sname"),sector:g("sector"),prices:[],createdBy:t.id};S.stocks=S.stocks||[];S.stocks.push(ex)}sid=ex.id}
    if(type==="share_sell"){const held=(positions(t.date,old&&old.id)[sid]||{}).qty||0;if(qty>held+1e-9){toast(`You hold ${fq(held)} shares on that date, so you can't sell ${fq(qty)}.`);return}}
    t.stockId=sid;t.qty=qty;t.price=price;if(fee)t.fee=fee;t.method="Bank Transfer";
    if(type==="share_buy"&&fd.get("noCash"))t.noCash=true;else{t.acct=g("acct");if(!t.acct){toast("Choose an account.");return}}}
  else if(type==="dividend"){t.type="dividend";t.stockId=g("stockId");t.acct=g("acct");t.method="Bank Account";const w=+g("wht");if(w)t.wht=w}
  else if(type==="share_adjust"){t.type="share_adjust";t.stockId=g("stockId");t.qty=+g("qty");t.amount=0;t.desc=g("desc")||undefined;if(!t.qty){toast("Enter the number of shares.");return}
    if(t.qty<0){const held=(positions(t.date,old&&old.id)[t.stockId]||{}).qty||0;if(-t.qty>held){toast(`You hold ${fq(held)} shares on that date.`);return}}}
  else if(type==="asset_sell"){t.type="asset_sell";t.assetId=g("assetId");t.acct=g("acct");t.method="Bank Account";const a=asset(t.assetId);if(!a){toast("Choose an asset.");return}
    if(old&&old.assetId&&old.assetId!==t.assetId){const oa=asset(old.assetId);if(oa&&oa.sold&&oa.sold.txId===old.id)delete oa.sold}
    a.sold={date:t.date,amount:t.amount,txId:t.id}}
  else if(type==="refund"){t.type="refund";t.cat=g("cat");t.sub=g("sub");t.merchant=g("merchant")||undefined;const d=g("dest");if(d.startsWith("c:"))t.card=d.slice(2);else t.acct=d.slice(2);t.method=t.card?"Credit Card":"Bank Account"}
  Object.keys(t).forEach(k=>t[k]===undefined&&delete t[k]);
  const file=fd.get("receipt");if(file&&file.size){const img=await compressImage(file).catch(()=>null);if(img){t.receipt=true;Store.put("rc-"+t.id,{img})}else toast("That photo couldn't be attached. Try a smaller image.")}else if(old&&old.receipt)t.receipt=true;
  upsertTx(t,old);saveState();closeSheet();render();toast(old?"Changes saved":TYPE_LABEL[t.type]+" saved");}

function txDetail(t){const e=eff(t);const rows=[["Type",TYPE_LABEL[t.type]+(t.kind?", "+t.kind:"")],t.assetId?["Asset",(asset(t.assetId)||{}).name||"(removed asset)"]:null,t.stockId?["Company",stockLabel(stock(t.stockId))]:null,t.stockId&&t.qty?["Shares",fq(t.qty)]:null,t.stockId&&t.price?["Price per share",rs(t.price,true)]:null,t.wht?["Tax withheld",rs(t.wht)]:null,t.noCash?["Money moved","No, shares already owned"]:null,["Date",fdate(t.date)],["Amount",rs(t.amount)],t.fee?["Fee",rs(t.fee)]:null,t.cat&&t.type!=="income"?["Category",t.cat+(t.sub?" / "+t.sub:"")]:null,t.type==="income"?["Kind",t.sub]:null,t.merchant?[t.type==="fuel"?"Station":"Merchant",t.merchant]:null,t.desc?["Description",t.desc]:null,t.method?["Payment method",t.method]:null,t.acct?[t.type==="income"?"Into":"From account",acctLabel(acct(t.acct))]:null,t.toAcct?["To account",acctLabel(acct(t.toAcct))]:null,t.card?["Credit card",cardLabel(card(t.card))]:null,t.vehicle?["Vehicle",(veh(t.vehicle)||{}).name]:null,t.litres?["Litres",(+t.litres).toFixed(2)]:null,t.ppl?["Price per litre",rs(t.ppl,true)]:null,t.odo?["Odometer",nf0.format(t.odo)+" km"]:null,t.fuelType?["Fuel type",t.fuelType]:null,t.type==="cc_payment"?["Payment",t.full?"Full payment":"Partial payment"]:null,t.billDue?["Bill due date",fdate(t.billDue)]:null,t.ref?["Reference",t.ref]:null,t.recurring?["Recurring","Yes"]:null,t.notes?["Notes",t.notes]:null,["Counts as spending",e.spend?rs(e.spend):"No"]].filter(Boolean);
  openSheet(txTitle(t),`<div class="table-wrap"><table><tbody>${rows.map(([a,b])=>`<tr><td class="muted">${esc(a)}</td><td class="r" style="white-space:normal">${esc(b)}</td></tr>`).join("")}</tbody></table></div><div id="rcBox"></div>
  <div class="actions"><button class="btn danger" data-act="del-tx" data-id="${t.id}">Delete</button><button class="btn" data-act="dup-tx" data-id="${t.id}">Repeat today</button><button class="btn primary" data-act="edit-tx" data-id="${t.id}">Edit</button></div>`,
  async root=>{if(t.receipt){root.querySelector("#rcBox").innerHTML='<p class="faint small" style="margin:10px 0">Loading receipt…</p>';try{const r=await Store.get("rc-"+t.id);root.querySelector("#rcBox").innerHTML=r&&r.img?`<img class="receipt-img" style="margin-top:10px" src="${r.img}" alt="Receipt">`:'<p class="faint small">Receipt not found.</p>'}catch(e){root.querySelector("#rcBox").innerHTML='<p class="faint small">Receipt could not be loaded.</p>'}}})}

/* ---------- Entity forms ---------- */
function accountForm(a){a=a||{};const isEdit=!!a.id;const cur=isEdit?acctBal(a.id):"";
  openSheet(isEdit?"Edit account":"Add bank account",`<form class="f" data-form="account" data-id="${a.id||""}">
  <div class="fr">${fld("Bank name",`<input name="bank" value="${esc(a.bank||"")}" placeholder="e.g. Commercial Bank" list="banks">`)}${fld("Account name",`<input name="name" required value="${esc(a.name||"")}" placeholder="e.g. Salary Account" autofocus>`)}</div>
  <datalist id="banks">${["Commercial Bank","Sampath Bank","HNB","Bank of Ceylon","People's Bank","NSB","Seylan Bank","NDB","DFCC Bank","Nations Trust Bank","Pan Asia Bank","Union Bank","Amana Bank","Cargills Bank"].map(b=>`<option value="${b}">`).join("")}</datalist>
  <div class="fr">${fld("Account type",`<select name="type">${opt(ACCT_TYPES.map(x=>[x,x]),a.type||"Salary")}</select>`)}${fld("Account number nickname",`<input name="nick" value="${esc(a.nick||"")}" placeholder="e.g. ending 4521">`)}</div>
  <div class="fr">${fld("Opening balance",`<input type="number" step="any" name="opening" value="${a.opening??0}">`)}${fld("Currency",`<select name="currency">${opt(["LKR","USD","EUR","GBP","AUD","AED","INR"].map(c=>[c,c]),a.currency||"LKR")}</select>`)}</div>
  ${isEdit?fld("Current balance",`<input type="number" step="any" name="current" value="${Math.round(cur*100)/100}">`)+`<p class="hint">Calculated from the opening balance and every transaction. If it doesn't match your bank, type the real balance and Kasi adjusts the opening balance to match.</p>`:""}
  <div class="actions">${isEdit&&a.id!=="cash"?`<button type="button" class="btn danger" data-act="del-account" data-id="${a.id}">Delete</button>`:""}<button type="button" class="btn" data-act="close">Cancel</button><button class="btn primary">${isEdit?"Save changes":"Add account"}</button></div></form>`)}
function cardForm(c){c=c||{};const isEdit=!!c.id;const cur=isEdit?cardOut(c.id):"";
  openSheet(isEdit?"Edit credit card":"Add credit card",`<form class="f" data-form="card" data-id="${c.id||""}">
  <div class="fr">${fld("Card name",`<input name="name" required value="${esc(c.name||"")}" placeholder="e.g. Commercial Bank Visa" autofocus>`)}${fld("Bank",`<input name="bank" value="${esc(c.bank||"")}">`)}</div>
  <div class="fr">${fld("Credit limit",`<input type="number" step="any" min="0" name="limit" value="${c.limit||""}">`)}${fld(isEdit?"Current outstanding":"Outstanding today",`<input type="number" step="any" name="${isEdit?"current":"opening"}" value="${isEdit?Math.round(cur*100)/100:(c.opening||0)}">`)}</div>
  <div class="fr">${fld("Statement date (day of month)",`<input type="number" min="1" max="31" name="stmtDay" required value="${c.stmtDay||""}">`)}${fld("Payment due date (day of month)",`<input type="number" min="1" max="31" name="dueDay" required value="${c.dueDay||""}">`)}</div>
  <div class="fr">${fld("Minimum payment (% of statement)",`<input type="number" step="any" min="0" max="100" name="minPct" value="${c.minPct??5}">`)}${fld("Minimum payment floor (Rs.)",`<input type="number" step="any" min="0" name="minFixed" value="${c.minFixed??1000}">`)}</div>
  <p class="hint">Statement balance, amount due, available credit and status are calculated from your purchases and payments.</p>
  <div class="actions">${isEdit?`<button type="button" class="btn danger" data-act="del-card" data-id="${c.id}">Delete</button>`:""}<button type="button" class="btn" data-act="close">Cancel</button><button class="btn primary">${isEdit?"Save changes":"Add card"}</button></div></form>`)}
function vehicleForm(v){v=v||{};const isEdit=!!v.id;
  openSheet(isEdit?"Edit vehicle":"Add vehicle",`<form class="f" data-form="vehicle" data-id="${v.id||""}">
  <div class="fr">${fld("Vehicle name",`<input name="name" required value="${esc(v.name||"")}" placeholder="e.g. Toyota Aqua" autofocus>`)}${fld("Registration number",`<input name="reg" value="${esc(v.reg||"")}" placeholder="e.g. CAB-1234">`)}</div>
  <div class="fr">${fld("Make",`<input name="make" value="${esc(v.make||"")}">`)}${fld("Model",`<input name="model" value="${esc(v.model||"")}">`)}</div>
  <div class="fr">${fld("Year",`<input type="number" name="year" min="1950" max="2100" value="${v.year||""}">`)}${fld("Fuel type",`<select name="fuel">${opt(["Petrol","Diesel","Hybrid (petrol)","Electric"].map(x=>[x,x]),v.fuel||"Petrol")}</select>`)}</div>
  ${fld("Current odometer (km)",`<input type="number" name="odometer" min="0" value="${v.odometer||""}">`)}
  <div class="actions">${isEdit?`<button type="button" class="btn danger" data-act="del-vehicle" data-id="${v.id}">Delete</button>`:""}<button type="button" class="btn" data-act="close">Cancel</button><button class="btn primary">${isEdit?"Save changes":"Add vehicle"}</button></div></form>`)}
function billForm(b){b=b||{};const isEdit=!!b.id;const payv=b.payCard?"c:"+b.payCard:b.payAcct?"a:"+b.payAcct:"";
  openSheet(isEdit?"Edit bill":"Add bill",`<form class="f" data-form="bill" data-id="${b.id||""}">
  <div class="fr">${fld("Bill name",`<input name="name" required value="${esc(b.name||"")}" placeholder="e.g. Electricity" autofocus>`)}${fld("Category",`<select name="category">${opt(BILL_CATS.map(c=>[c,c]),b.category||"Electricity")}</select>`)}</div>
  <div class="fr">${fld("Provider",`<input name="provider" value="${esc(b.provider||"")}" placeholder="e.g. CEB, NWSDB, SLT, Dialog">`)}${fld("Usual amount (Rs.)",`<input type="number" step="any" min="0" name="amount" required value="${b.amount||""}">`)}</div>
  <div class="fr">${fld("Next due date",`<input type="date" name="firstDue" required value="${b.firstDue||today()}">`)}${fld("Repeats",`<select name="freq">${opt(Object.keys(FREQ).map(f=>[f,f]),b.freq||"Monthly")}</select>`)}</div>
  <div class="fr">${fld("Pay from",`<select name="pay"><option value="">Choose when paying</option>${opt([...S.accounts.map(a=>["a:"+a.id,acctLabel(a)]),...S.cards.map(c=>["c:"+c.id,c.name])],payv)}</select>`)}${fld("Reference / account number",`<input name="ref" value="${esc(b.ref||"")}">`)}</div>
  ${S.vehicles.length?fld("Vehicle (for vehicle insurance, leasing, licence)",`<select name="vehicle"><option value="">None</option>${opt(S.vehicles.map(v=>[v.id,v.name]),b.vehicle)}</select>`):""}
  ${isEdit?`<label class="chk"><input type="checkbox" name="paused" ${b.active===false?"checked":""}> Paused (hide from upcoming)</label>`:""}
  <div class="actions">${isEdit?`<button type="button" class="btn danger" data-act="del-bill" data-id="${b.id}">Delete</button>`:""}<button type="button" class="btn" data-act="close">Cancel</button><button class="btn primary">${isEdit?"Save changes":"Add bill"}</button></div></form>`)}

function submitEntity(form){const kind=form.dataset.form,id=form.dataset.id;const fd=new FormData(form);const g=k=>(fd.get(k)??"").toString().trim();
  if(kind==="account"){const a=id?acct(id):{id:uid()};Object.assign(a,{bank:g("bank"),name:g("name"),type:g("type"),nick:g("nick"),currency:g("currency")||"LKR",opening:+g("opening")||0});
    if(id&&fd.has("current")){const cur=+g("current")||0;const calc=acctBal(id);if(Math.abs(cur-calc)>0.004){a.opening=Math.round((a.opening+(cur-calc))*100)/100}}
    if(!id)S.accounts.push(a);}
  else if(kind==="card"){const c=id?card(id):{id:uid(),opening:+g("opening")||0};Object.assign(c,{name:g("name"),bank:g("bank"),limit:+g("limit")||0,stmtDay:+g("stmtDay")||1,dueDay:+g("dueDay")||1,minPct:+g("minPct")||5,minFixed:+g("minFixed")||0});
    if(id&&fd.has("current")){const cur=+g("current")||0;const calc=cardOut(id);if(Math.abs(cur-calc)>0.004)c.opening=Math.round(((+c.opening||0)+(cur-calc))*100)/100}if(!id)S.cards.push(c)}
  else if(kind==="vehicle"){const v=id?veh(id):{id:uid()};Object.assign(v,{name:g("name"),reg:g("reg"),make:g("make"),model:g("model"),year:+g("year")||"",fuel:g("fuel"),odometer:+g("odometer")||0});if(!id)S.vehicles.push(v)}
  else if(kind==="stock"){const st=stock(id);if(st)Object.assign(st,{symbol:g("symbol").toUpperCase(),name:g("sname"),sector:g("sector"),notes:g("notes")})}
  else if(kind==="prices"){const d=g("date")||today();let n=0;for(const st of(S.stocks||[])){const v=+g("p_"+st.id);if(v>0){st.prices=(st.prices||[]).filter(x=>x.date!==d);st.prices.push({date:d,price:v});st.prices.sort((a,b)=>a.date<b.date?-1:1);n++}}if(!n){toast("Enter at least one price.");return}}
  else if(kind==="asset"){const a=id?asset(id):{id:uid(),values:[]};Object.assign(a,{name:g("name"),category:g("category"),initCost:+g("initCost")||0,initDate:g("initDate")||"",yearly:+g("yearly")||0,vehicle:g("vehicle")||"",notes:g("notes")});
    if(!id){a.values=[{date:g("valueDate")||today(),value:+g("value")||0}];S.assets=S.assets||[];S.assets.push(a)}}
  else if(kind==="assetval"){const a=asset(id);if(a){const d=g("date")||today();a.values=(a.values||[]).filter(v=>v.date!==d);a.values.push({date:d,value:+g("value")||0,...(g("note")?{note:g("note")}:{})});a.values.sort((x,y)=>x.date<y.date?-1:1)}}
  else if(kind==="bill"){const b=id?bill(id):{id:uid()};const p=g("pay");Object.assign(b,{name:g("name"),category:g("category"),provider:g("provider"),amount:+g("amount")||0,firstDue:g("firstDue"),freq:g("freq"),ref:g("ref"),vehicle:g("vehicle")||"",payAcct:p.startsWith("a:")?p.slice(2):"",payCard:p.startsWith("c:")?p.slice(2):"",active:!fd.get("paused")});if(!id)S.bills.push(b)}
  saveState();invalidate();closeSheet();render();toast("Saved")}

/* ================= Events ================= */
document.addEventListener("click",async e=>{
  if(e.target.matches("[data-scrim]")){closeSheet();return}
  const el=e.target.closest("[data-act]");if(!el)return;const a=el.dataset.act,ds=el.dataset;
  if(el.tagName==="A")e.preventDefault();
  switch(a){
    case "nav":closeSheet();go(ds.v);break;
    case "more":moreMenu();break;
    case "close":closeSheet();break;
    case "add":if(!ds.type){chooser();break}closeSheet();
      if(!S.accounts.length){accountForm();break}
      txForm(ds.type,{},{card:ds.card,bill:ds.bill,due:ds.due,veh:ds.veh,cat:ds.cat,sub:ds.sub,tosav:ds.tosav,preset:ds.preset,asset:ds.asset,stock:ds.stock});
      if(ds.type==="expense"&&ds.cat==="Vehicle"&&ds.veh){}break;
    case "tx":{const t=findTx(ds.id);if(t)txDetail(t);break}
    case "edit-tx":{const t=findTx(ds.id);if(t){closeSheet();txForm(t.type==="cc_purchase"&&!t.cat?"cc_purchase":t.type==="cc_payment"?"cc_payment":t.type,t)}break}
    case "dup-tx":{const t=findTx(ds.id);if(t){const n=Object.assign({},t,{id:uid(),ts:Date.now(),date:today(),receipt:undefined});delete n.receipt;if(n.type==="bill"){delete n.billDue;delete n.billId}upsertTx(n);saveState();closeSheet();render();toast("Repeated for today")}break}
    case "del-tx":{const t=findTx(ds.id);if(t&&confirm("Delete this transaction? Balances will update.")){deleteTx(t);closeSheet();render();toast("Deleted")}break}
    case "edit-account":closeSheet();accountForm(ds.id?acct(ds.id):null);break;
    case "edit-card":closeSheet();cardForm(ds.id?card(ds.id):null);break;
    case "edit-vehicle":closeSheet();vehicleForm(ds.id?veh(ds.id):null);break;
    case "edit-bill":closeSheet();billForm(ds.id?bill(ds.id):null);break;
    case "del-account":{const used=L().all.some(t=>t.acct===ds.id||t.toAcct===ds.id);if(used){toast("This account has transactions. Delete or move them first.");break}if(confirm("Delete this account?")){S.accounts=S.accounts.filter(x=>x.id!==ds.id);saveState();invalidate();closeSheet();render()}break}
    case "del-card":{const used=L().all.some(t=>t.card===ds.id);if(used){toast("This card has transactions. Delete them first.");break}if(confirm("Delete this card?")){S.cards=S.cards.filter(x=>x.id!==ds.id);saveState();closeSheet();render()}break}
    case "del-vehicle":{if(confirm("Delete this vehicle? Its past expenses stay, without a vehicle link.")){S.vehicles=S.vehicles.filter(x=>x.id!==ds.id);saveState();closeSheet();render()}break}
    case "del-bill":{if(confirm("Delete this bill? Past payments stay in your transactions.")){S.bills=S.bills.filter(x=>x.id!==ds.id);saveState();closeSheet();render()}break}
    case "stock":{const st=stock(ds.id);if(st)stockDetail(st);break}
    case "edit-stock":{const st=stock(ds.id);closeSheet();if(st)stockForm(st);break}
    case "prices":closeSheet();pricesForm();break;
    case "del-stock":{const n=L().all.filter(t=>t.stockId===ds.id).length;if(n){toast(`This company has ${n} transaction${n===1?"":"s"}. Delete those first.`);break}if(confirm("Delete this company?")){S.stocks=S.stocks.filter(x=>x.id!==ds.id);saveState();invalidate();closeSheet();render()}break}
    case "asset":{const a=asset(ds.id);if(a)assetDetail(a);break}
    case "edit-asset":closeSheet();assetForm(ds.id?asset(ds.id):null);break;
    case "value-asset":{const a=asset(ds.id);closeSheet();if(a)valueForm(a);break}
    case "sell-asset":closeSheet();txForm("asset_sell",{},{asset:ds.id});break;
    case "del-asset":{const n=L().all.filter(t=>t.assetId===ds.id).length;if(confirm(n?`Delete this asset? Its ${n} purchase or sale transaction${n===1?"":"s"} stay in your records.`:"Delete this asset?")){S.assets=S.assets.filter(x=>x.id!==ds.id);saveState();invalidate();closeSheet();render();toast("Asset deleted")}break}
    case "filter-acct":UI.filters={acct:ds.id};go("transactions");break;
    case "filter-card":UI.filters={card:ds.id};go("transactions");break;
    case "filter-veh":UI.filters={veh:ds.id};go("transactions");break;
    case "clear-filters":UI.filters={};render();break;
    case "export-csv":exportCSV(ds.month);break;
    case "export-json":saveFile("kasi-backup-"+today()+".json",JSON.stringify({kasi:1,exported:new Date().toISOString(),state:S,tx:TX},null,1),"application/json");break;
    case "import-json":$("#importFile").click();break;
    case "demo":if(L().all.length&&!confirm("Replace your current data with example data?"))break;loadDemo();break;
    case "wipe":if(confirm("Delete all accounts, cards, bills, vehicles and transactions? This can't be undone.")&&confirm("Are you sure? Download a backup first if you might need it.")){try{await API.req("POST","/wipe");Store.ob={};Store.persistOb();Store.docs={};Store.saveSnap();TX={};S=freshState();saveState();invalidate();UI.view="dashboard";render();toast("All data deleted")}catch(x){toast(x.code==="offline"?"Connect to the internet to delete your data.":x.message)}}break;
  }
});
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&$("#modal").innerHTML)closeSheet();if(e.key==="Enter"&&e.target.matches(".row.click")){e.target.click()}});
document.addEventListener("submit",e=>{const f=e.target;if(!f.dataset.form)return;e.preventDefault();const k=f.dataset.form;
  if(k==="tx")submitTx(f);
  else if(["account","card","vehicle","bill","asset","assetval","stock","prices"].includes(k))submitEntity(f);
  else if(k==="salset"){const fd=new FormData(f);S.settings.salaryDay=Math.min(31,Math.max(1,+fd.get("salaryDay")||25));S.settings.expectedSalary=+fd.get("expectedSalary")||0;S.settings.plannedSavings=+fd.get("plannedSavings")||0;saveState();render();toast("Planner updated")}
  else if(k==="settings"){const fd=new FormData(f);S.settings.dueSoon=+fd.get("dueSoon")||5;S.settings.theme=fd.get("theme");applyTheme();saveState();render();toast("Settings saved")}
  else if(k==="filters")applyFilters(f)});
let fT;function applyFilters(f){const fd=new FormData(f);const F={};for(const [k,v] of fd.entries())if(v)F[k]=v;UI.filters=F;const pos=f.querySelector(":focus");const name=pos&&pos.name;render();if(name){const el=document.querySelector(`[data-form=filters] [name=${name}]`);if(el){el.focus();if(el.setSelectionRange&&el.type==="text"){const l=el.value.length;el.setSelectionRange(l,l)}}}}
document.addEventListener("input",e=>{const f=e.target.closest("[data-form=filters]");if(f){clearTimeout(fT);fT=setTimeout(()=>applyFilters(f),e.target.name==="q"?300:0)}});
document.addEventListener("change",e=>{const el=e.target;
  if(el.dataset.change){UI[el.dataset.change]=el.value;render();return}
  if(el.dataset.budget!==undefined){S.budgets=S.budgets||{};S.budgets[el.dataset.budget]=+el.value||0;saveState();invalidate();render();return}
  if(el.id==="importFile"&&el.files[0]){const r=new FileReader();r.onload=()=>{try{const d=JSON.parse(r.result);if(!d.state||!d.tx)throw 0;if(!confirm("Replace all current data with this backup?"))return;for(const m of S.months)if(!d.tx[m])Store.put("tx-"+m,null);S=Object.assign(freshState(),d.state);TX=d.tx;S.months=Object.keys(TX).sort();saveState();for(const m of S.months)saveMonth(m);invalidate();render();toast("Backup restored")}catch(x){toast("That file isn't a Kasi backup.")}};r.readAsText(el.files[0]);el.value=""}});

async function saveFile(name,text,mime){
  try{const file=new File([text],name,{type:mime});
    if(isStandalone()&&navigator.canShare&&navigator.canShare({files:[file]})){await navigator.share({files:[file],title:name});return}}catch(e){if(e&&e.name==="AbortError")return}
  try{const b=new Blob([text],{type:mime});const a=document.createElement("a");a.href=URL.createObjectURL(b);a.download=name;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},1500)}catch(e){toast("Downloads aren't available here.")}}
function exportCSV(month){let list=month?L().all.filter(t=>mkey(t.date)===month):(UI.view==="transactions"?filtered().slice().reverse():L().all);
  const cols=["Date","Type","Category","Subcategory","Merchant","Description","Amount","Fee","Counts as spending","Payment method","Account","To account","Credit card","Vehicle","Litres","Price per litre","Odometer","Reference","Notes"];
  const q=v=>{v=v==null?"":String(v);return/[",\n]/.test(v)?'"'+v.replace(/"/g,'""')+'"':v};
  const lines=[cols.join(",")].concat(list.map(t=>[t.date,TYPE_LABEL[t.type]+(t.kind?" ("+t.kind+")":""),t.type==="fuel"?"Fuel":t.cat||"",t.sub||t.fuelType||"",t.merchant,t.desc,t.amount,t.fee||"",eff(t).spend,t.method,t.acct?acctLabel(acct(t.acct)):"",t.toAcct?acctLabel(acct(t.toAcct)):"",t.card?cardLabel(card(t.card)):"",t.vehicle?(veh(t.vehicle)||{}).name:"",t.litres,t.ppl,t.odo,t.ref,t.notes].map(q).join(",")));
  saveFile("kasi-transactions-"+(month||today())+".csv",lines.join("\n"),"text/csv")}

/* ================= Example data ================= */
function loadDemo(){let seed=7;const rnd=()=>{seed=(seed*16807)%2147483647;return(seed-1)/2147483646};const R=(a,b)=>Math.round((a+rnd()*(b-a))/10)*10;const pick=a=>a[Math.floor(rnd()*a.length)];
  for(const m of S.months)Store.put("tx-"+m,null);
  S=freshState();const A=(id,bank,name,type,opening,nick)=>({id,bank,name,type,opening,nick,currency:"LKR"});
  S.accounts=[A("sal","Commercial Bank","Salary Account","Salary",62000,"ending 4521"),A("sav","Sampath Bank","Savings Account","Savings",240000,"ending 0917"),A("cur","HNB","Current Account","Current",35000,"ending 2230"),A("cash","","Cash in hand","Cash",6500,"")];
  S.cards=[{id:"visa",name:"Commercial Bank Visa",bank:"Commercial Bank",limit:300000,opening:0,stmtDay:5,dueDay:25,minPct:5,minFixed:1000},{id:"mc",name:"Sampath Mastercard",bank:"Sampath Bank",limit:200000,opening:0,stmtDay:20,dueDay:10,minPct:5,minFixed:1000}];
  S.vehicles=[{id:"aqua",name:"Toyota Aqua",reg:"CAB-1234",make:"Toyota",model:"Aqua",year:2015,fuel:"Hybrid (petrol)",odometer:84200},{id:"vezel",name:"Honda Vezel",reg:"CBK-5678",make:"Honda",model:"Vezel",year:2017,fuel:"Petrol",odometer:61800}];
  const start=addMonths(today(),-3,1);
  const B=(id,name,category,provider,amount,day,pay,veh,freq)=>({id,name,category,provider,amount,firstDue:ymd(onDay(parse(start).getFullYear(),parse(start).getMonth(),day)),freq:freq||"Monthly",payAcct:pay.startsWith("c:")?"":pay,payCard:pay.startsWith("c:")?pay.slice(2):"",vehicle:veh||"",ref:"",active:true});
  S.bills=[B("elec","Electricity","Electricity","CEB",8600,10,"sal"),B("water","Water","Water","NWSDB",1850,15,"sal"),B("net","Home fibre","Internet","SLT-Mobitel",4990,12,"sal"),B("mob","Mobile","Mobile","Dialog",2400,18,"c:visa"),B("stream","Netflix","Streaming subscriptions","Netflix",2300,3,"c:visa"),B("lease","Vezel leasing","Loan","LOLC Finance",46500,5,"cur","vezel"),B("school","School fees","School/Education","Wycherley International",18000,7,"sal")];
  S.stocks=[{id:"comb",symbol:"COMB.N0000",name:"Commercial Bank of Ceylon",sector:"Banks",prices:[{date:addDays(today(),-1),price:131.75}]},
    {id:"jkh",symbol:"JKH.N0000",name:"John Keells Holdings",sector:"Capital Goods",prices:[{date:addDays(today(),-1),price:212.5}]},
    {id:"dial",symbol:"DIAL.N0000",name:"Dialog Axiata",sector:"Telecommunication",prices:[{date:addDays(today(),-12),price:13.4}]}];
  S.assets=[
    {id:"land",name:"Land in Kandy (20 perches)",category:"Land & property",initCost:4500000,initDate:"2019-06-15",yearly:6,vehicle:"",values:[{date:addMonths(today(),-4,1),value:9200000,note:"Bank valuation"}],notes:""},
    {id:"gold",name:"Gold jewellery",category:"Gold & jewellery",initCost:850000,initDate:"2021-03-10",yearly:10,vehicle:"",values:[{date:addMonths(today(),-2,1),value:1650000,note:"Jeweller's quote"}],notes:""},
    {id:"aquaA",name:"Toyota Aqua",category:"Vehicle",initCost:5800000,initDate:"2021-08-01",yearly:-8,vehicle:"aqua",values:[],notes:""},
    {id:"mac",name:"MacBook Air",category:"Electronics",initCost:0,initDate:"",yearly:-20,vehicle:"",values:[],notes:""}];
  S.budgets={Groceries:55000,Food:35000,Fuel:55000,Vehicle:15000,Shopping:20000,Entertainment:10000,Bills:40000,Family:15000,Medical:10000,Other:10000};
  S.settings.expectedSalary=392000;S.settings.plannedSavings=50000;S.settings.salaryDay=25;
  TX={};const add=t=>{t.id=uid()+Math.floor(rnd()*1e6).toString(36);t.ts=Date.now()+Math.floor(rnd()*1e6);const m=mkey(t.date);(TX[m]=TX[m]||[]).push(t)};
  const t0=today();let odo={aqua:84200,vezel:61800};
  for(let d=start;d<=t0;d=addDays(d,1)){const dd=parse(d),day=dd.getDate(),dow=dd.getDay();
    if(day===Math.min(25,dim(dd.getFullYear(),dd.getMonth())))add({type:"income",sub:"Salary",date:d,amount:392000,acct:"sal",method:"Bank Account",desc:dd.toLocaleDateString("en-GB",{month:"long"})+" salary",sal:{basic:340000,allow:65000,bonus:0,other:15000,deduct:28000}});
    if(day===26)add({type:"transfer",kind:"Savings transfer",date:d,amount:50000,acct:"sal",toAcct:"sav",method:"Bank Transfer",ref:"Monthly savings"});
    if(day===27)add({type:"transfer",kind:"Bank transfer",date:d,amount:50000,acct:"sal",toAcct:"cur",method:"Bank Transfer",fee:30});
    if(day===1||day===15)add({type:"transfer",kind:"Cash withdrawal",date:d,amount:15000,acct:"sal",toAcct:"cash",method:"Bank Transfer"});
    if(dow===6||(dow===3&&rnd()<.5)){const c=rnd()<.55;add({type:c?"cc_purchase":"expense",cat:"Groceries",sub:pick(["Supermarket","General groceries","Vegetables","Meat & fish","Household items"]),merchant:pick(["Keells","Cargills Food City","Arpico Supercentre","Glomark","Laugfs Super"]),date:d,amount:R(3500,14500),method:c?"Credit Card":pick(["Debit Card","Cash"]),...(c?{card:"visa"}:{})});const last=TX[mkey(d)][TX[mkey(d)].length-1];if(last.method==="Debit Card")last.acct="sal";if(last.method==="Cash")last.acct="cash"}
    if(rnd()<.33){const m=pick(["Uber Eats","PickMe Food","Barista","Java Lounge","Ministry of Crab","Perera & Sons","Burger King","Pizza Hut","Rio Coffee","Paan Paan"]);const c=rnd()<.4;const t={type:c?"cc_purchase":"expense",cat:"Food",sub:m.includes("Eats")||m.includes("PickMe")?"Delivery":m.includes("Barista")||m.includes("Java")||m.includes("Rio")?"Coffee":pick(["Lunch","Dinner","Takeaway","Snacks","Restaurants"]),merchant:m,date:d,amount:R(900,5200),method:c?"Credit Card":pick(["Cash","Digital Wallet","Debit Card"])};if(c)t.card="mc";else t.acct=t.method==="Cash"?"cash":t.method==="Digital Wallet"?"sal":"sal";if(t.method==="Digital Wallet")t.method="Debit Card";add(t)}
    if(day%9===2){const l=+(22+rnd()*12).toFixed(2);odo.aqua+=R(380,520);add({type:"fuel",cat:"Fuel",vehicle:"aqua",date:d,litres:l,ppl:299,amount:Math.round(l*299),fuelType:"Petrol 92",merchant:pick(["Ceypetco Borella","IOC Rajagiriya","Sinopec Nugegoda"]),odo:odo.aqua,method:"Credit Card",card:"visa"})}
    if(day%11===5){const l=+(28+rnd()*14).toFixed(2);odo.vezel+=R(300,460);add({type:"fuel",cat:"Fuel",vehicle:"vezel",date:d,litres:l,ppl:299,amount:Math.round(l*299),fuelType:"Petrol 92",merchant:pick(["Ceypetco Borella","IOC Rajagiriya"]),odo:odo.vezel,method:"Debit Card",acct:"sal"})}
    if(rnd()<.12)add({type:"expense",cat:"Vehicle",sub:pick(["Parking","Highway toll","Washing"]),vehicle:pick(["aqua","vezel"]),merchant:pick(["Southern Expressway","One Galle Face parking","Auto Miraj"]),date:d,amount:R(300,1800),method:"Cash",acct:"cash"});
    if(rnd()<.06)add({type:rnd()<.5?"cc_purchase":"expense",cat:pick(["Shopping","Entertainment","Medical","Family"]),sub:"Other",merchant:pick(["Odel","Daraz","Scope Cinemas","Healthguard Pharmacy","Softlogic"]),date:d,amount:R(2500,12000),method:"Credit Card",card:"mc"});
  }
  // fix card sources for random expenses
  for(const m in TX)for(const t of TX[m]){if(t.type==="expense"&&t.method==="Credit Card"){t.type="cc_purchase"}if(t.type==="cc_purchase"&&!t.card)t.card="mc";if((t.type==="expense")&&!t.acct)t.acct="cash"}
  add({type:"expense",cat:"Vehicle",sub:"Service",vehicle:"aqua",merchant:"Toyota Lanka",date:addMonths(t0,-1,12),amount:28500,method:"Credit Card",card:"visa"});
  add({type:"share_buy",stockId:"comb",date:addMonths(t0,-3,4),qty:1000,price:118,fee:1322,amount:119322,acct:"sav",method:"Bank Transfer",ref:"CN-10432"});
  add({type:"share_buy",stockId:"jkh",date:addMonths(t0,-2,11),qty:500,price:195,fee:1092,amount:98592,acct:"sav",method:"Bank Transfer",ref:"CN-10877"});
  add({type:"share_buy",stockId:"dial",date:addMonths(t0,-2,18),qty:5000,price:12.4,fee:694,amount:62694,acct:"sav",method:"Bank Transfer"});
  add({type:"share_sell",stockId:"dial",date:addMonths(t0,-1,20),qty:2000,price:13.1,fee:293,amount:25907,acct:"sav",method:"Bank Transfer"});
  add({type:"dividend",stockId:"comb",date:addMonths(t0,-1,15),amount:4250,wht:750,acct:"sav",method:"Bank Account"});
  add({type:"asset_buy",assetId:"mac",date:addMonths(t0,-1,8),amount:329000,method:"Bank Transfer",acct:"sav",desc:"For work"});
  add({type:"expense",cat:"Vehicle",sub:"Insurance",vehicle:"vezel",merchant:"Ceylinco Insurance",date:addMonths(t0,-2,8),amount:62000,method:"Bank Transfer",acct:"cur"});
  S.months=Object.keys(TX).sort();invalidate();
  // Pay bills that are due up to today, and card statements from past cycles
  for(const b of S.bills)for(const due of billOccurrences(b,start,t0)){if(due>=addDays(t0,-2)&&b.id!=="elec")continue;const t={type:"bill",billId:b.id,billDue:due,cat:"Bills",sub:b.category,desc:b.name,merchant:b.provider,date:due,amount:b.amount+(b.category==="Electricity"?R(-900,900):0),vehicle:b.vehicle||undefined};if(b.payCard){t.card=b.payCard;t.method="Credit Card"}else{t.acct=b.payAcct;t.method="Bank Transfer"}if(due>t0)continue;if(b.id==="elec"&&due>addDays(t0,-2))continue;Object.keys(t).forEach(k=>t[k]===undefined&&delete t[k]);add(t)}
  S.months=Object.keys(TX).sort();invalidate();
  for(const c of S.cards){for(let i=3;i>=1;i--){const ref=addMonths(t0,-i);const st=cardStatus(c,ref);if(st.stmtBal>0&&st.due<=t0&&st.due>=start){add({type:"cc_payment",card:c.id,acct:"sal",date:addDays(st.due,-2),amount:st.stmtBal,method:"Bank Transfer",full:true});S.months=Object.keys(TX).sort();invalidate()}}}
  S.months=Object.keys(TX).sort();saveState();for(const m of S.months)saveMonth(m);invalidate();UI.view="dashboard";closeSheet();render();toast("Example data loaded. Delete it any time in Settings.")}

/* ================= Boot, sign-in, install ================= */
function applyTheme(){const t=S&&S.settings.theme;if(t==="light"||t==="dark")document.documentElement.setAttribute("data-theme",t);else document.documentElement.removeAttribute("data-theme")}
function loadFromDocs(docs){
  const st=docs.state;S=st?Object.assign(freshState(),st,{settings:Object.assign(freshState().settings,st.settings||{})}):freshState();
  if(!S.accounts.some(a=>a.type==="Cash"))S.accounts.push({id:"cash",bank:"",name:"Cash in hand",type:"Cash",opening:0,nick:"",currency:"LKR"});
  TX={};for(const [k,v] of Object.entries(docs))if(/^tx-\d{4}-\d{2}$/.test(k))TX[k.slice(3)]=(v&&v.items)||[];
  S.months=Object.keys(TX).sort();invalidate();applyTheme();
}
function overlayOutbox(docs){for(const [k,v] of Object.entries(Store.ob))if(!k.startsWith("rc-")){if(v.d===null)delete docs[k];else docs[k]=v.d}return docs}
function showApp(){$("#auth").hidden=true;$(".app").hidden=false;$("#bottomnav").hidden=false}
async function signedIn(email){
  Store.user=email;try{localStorage.setItem("kasi:lastUser",email)}catch(e){}
  Store.loadOb();await Store.flush();
  let docs;
  try{docs=await Store.getAll();Store.mode="cloud"}
  catch(e){if(e.code==="offline"||e.status>=500){docs=Store.readSnap()||{};Store.docs=JSON.parse(JSON.stringify(docs));Store.mode="offline"}else throw e}
  loadFromDocs(overlayOutbox(docs));showApp();render();renderStatus();
  if(new URLSearchParams(location.search).has("add")){history.replaceState(null,"","/");chooser()}
}
function onSignedOut(msg){
  closeSheet();const u=Store.user;Store.user=null;S=null;TX={};invalidate();
  renderAuth("login",msg||"Your session ended. Sign in again to continue.",u);
}
let AUTH_CFG=null;
async function renderAuth(mode,msg,email){
  $(".app").hidden=true;$("#bottomnav").hidden=true;const box=$("#auth");box.hidden=false;
  if(!AUTH_CFG){try{AUTH_CFG=await API.req("GET","/config")}catch(e){AUTH_CFG={signupOpen:true,codeRequired:false,firstUser:false,err:e.message}}}
  if(AUTH_CFG.firstUser&&mode==="login")mode="signup";
  const isUp=mode==="signup";
  box.innerHTML=`<div class="auth-card">
    <div class="brand"><b>Kasi</b><span>salary to salary</span></div>
    <h1>${isUp?(AUTH_CFG.firstUser?"Create your account":"Create an account"):"Sign in"}</h1>
    <p class="muted">${isUp?(AUTH_CFG.firstUser?"You're the first person here, so this account becomes the owner. After this, new accounts need a sign-up code.":"Ask the owner of this Kasi for the sign-up code."):"Your salary, accounts and cards, in one private place."}</p>
    ${msg?`<p class="info" role="status">${esc(msg)}</p>`:""}
    <form class="f" data-form="auth" data-mode="${mode}">
      ${fld("Email",`<input type="email" name="email" required autocomplete="email" inputmode="email" value="${esc(email||"")}" autofocus>`)}
      ${fld("Password",`<input type="password" name="password" required minlength="${isUp?10:1}" autocomplete="${isUp?"new-password":"current-password"}">`)}
      ${isUp?`<p class="hint">At least 10 characters. A short phrase is easiest to remember.</p>`:""}
      ${isUp&&AUTH_CFG.codeRequired?fld("Sign-up code",`<input name="code" required autocomplete="off">`):""}
      <button class="btn primary" type="submit" style="padding:12px">${isUp?"Create account":"Sign in"}</button>
    </form>
    ${isUp?(AUTH_CFG.firstUser?"":`<p class="small" style="margin-top:14px">Already have an account? <a href="#" data-auth="login">Sign in</a></p>`):(AUTH_CFG.signupOpen?`<p class="small" style="margin-top:14px">New here? <a href="#" data-auth="signup">Create an account</a></p>`:"")}
  </div>`;
  const f=box.querySelector("input[autofocus]");if(f&&!email)setTimeout(()=>f.focus(),30);else{const p=box.querySelector("input[name=password]");if(p)setTimeout(()=>p.focus(),30)}
}
document.addEventListener("click",e=>{const a=e.target.closest("[data-auth]");if(a){e.preventDefault();renderAuth(a.dataset.auth)}});
document.addEventListener("submit",async e=>{const f=e.target;const k=f.dataset&&f.dataset.form;
  if(k==="auth"){e.preventDefault();const fd=new FormData(f);const btn=f.querySelector("button[type=submit]");btn.disabled=true;const label=btn.textContent;btn.textContent="Please wait…";
    try{const r=await API.req("POST","/"+f.dataset.mode,{email:fd.get("email"),password:fd.get("password"),code:fd.get("code")||undefined});AUTH_CFG=null;await signedIn(r.email)}
    catch(x){btn.disabled=false;btn.textContent=label;let p=f.parentNode.querySelector(".info");if(!p){p=document.createElement("p");p.className="info";p.setAttribute("role","alert");f.parentNode.insertBefore(p,f)}p.textContent=x.code==="offline"?"You're offline. Connect to the internet to sign in.":x.message}}
  else if(k==="chpw"){e.preventDefault();const fd=new FormData(f);if(fd.get("next")!==fd.get("next2")){toast("The new passwords don't match.");return}
    try{await API.req("POST","/password",{current:fd.get("current"),next:fd.get("next")});closeSheet();toast("Password changed. Other devices have been signed out.")}catch(x){toast(x.message)}}
  else if(k==="delacct"){e.preventDefault();const fd=new FormData(f);
    try{await API.req("POST","/delete-account",{password:fd.get("password")});Store.clearLocal();try{localStorage.removeItem("kasi:lastUser")}catch(_){}Store.user=null;closeSheet();AUTH_CFG=null;renderAuth("login","Your account and all its data have been deleted.")}catch(x){toast(x.message)}}
},true);
document.addEventListener("click",async e=>{const el=e.target.closest("[data-act]");if(!el)return;const a=el.dataset.act;
  if(a==="logout"){if(Store.pending()&&!confirm("Some changes haven't synced yet and will be lost if you sign out. Sign out anyway?"))return;
    try{await API.req("POST","/logout")}catch(x){}Store.clearLocal();try{localStorage.removeItem("kasi:lastUser")}catch(_){}const u=Store.user;Store.user=null;S=null;TX={};invalidate();renderAuth("login","You've signed out.",u)}
  else if(a==="chpw")openSheet("Change password",`<form class="f" data-form="chpw">${fld("Current password",`<input type="password" name="current" required autocomplete="current-password" autofocus>`)}${fld("New password",`<input type="password" name="next" required minlength="10" autocomplete="new-password">`)}${fld("Repeat new password",`<input type="password" name="next2" required minlength="10" autocomplete="new-password">`)}<p class="hint">You'll stay signed in here. Other devices will need to sign in again.</p><div class="actions"><button type="button" class="btn" data-act="close">Cancel</button><button class="btn primary">Change password</button></div></form>`);
  else if(a==="delacct")openSheet("Delete account",`<form class="f" data-form="delacct"><p>This permanently deletes your account and every account, card, bill, vehicle, transaction and receipt in it. Download a backup first if you might need it.</p>${fld("Enter your password to confirm",`<input type="password" name="password" required autocomplete="current-password" autofocus>`)}<div class="actions"><button type="button" class="btn" data-act="close">Cancel</button><button class="btn danger">Delete my account</button></div></form>`);
  else if(a==="install"&&window._installPrompt){window._installPrompt.prompt();try{await window._installPrompt.userChoice}catch(x){}window._installPrompt=null;if(UI.view==="settings")render()}
});
window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();window._installPrompt=e;if(S&&UI.view==="settings")render()});
window.addEventListener("appinstalled",()=>{window._installPrompt=null;toast("Kasi is installed")});
const isStandalone=()=>(!!window.matchMedia&&window.matchMedia("(display-mode: standalone)").matches)||window.navigator.standalone===true;
const isIOS=()=>/iphone|ipad|ipod/i.test(navigator.userAgent)||(navigator.platform==="MacIntel"&&navigator.maxTouchPoints>1);

(async function boot(){
  if("serviceWorker" in navigator&&location.protocol==="https:")navigator.serviceWorker.register("/sw.js").catch(()=>{});
  let me=null;
  try{me=await API.req("GET","/me")}
  catch(e){
    if(e.code==="no_db"){$("#auth").hidden=false;$(".app").hidden=true;$("#auth").innerHTML=`<div class="auth-card"><div class="brand"><b>Kasi</b></div><h1>Almost there</h1><p class="muted">The app is online, but its database isn't connected yet. In Vercel, open your project's <b>Storage</b> tab, create a <b>Neon</b> database and connect it to this project, then redeploy.</p></div>`;return}
    if(e.code==="offline"||e.status>=500){
      let last=null;try{last=localStorage.getItem("kasi:lastUser")}catch(_){}
      if(last){Store.user=last;Store.loadOb();const snap=Store.readSnap();if(snap){Store.docs=JSON.parse(JSON.stringify(snap));Store.mode="offline";loadFromDocs(overlayOutbox(snap));showApp();render();renderStatus();return}}
      $("#auth").hidden=false;$(".app").hidden=true;$("#auth").innerHTML=`<div class="auth-card"><div class="brand"><b>Kasi</b></div><h1>You're offline</h1><p class="muted">Connect to the internet and open Kasi again to sign in.</p></div>`;return}
    if(e.code==="auth"){renderAuth("login");return}
    $("#auth").hidden=false;$("#auth").innerHTML=`<div class="auth-card"><h1>Kasi couldn't start</h1><p class="muted">${esc(e.message)}</p></div>`;return}
  try{await signedIn(me.email)}catch(e){$("#view").innerHTML=`<div class="panel"><h2>Couldn't load your data</h2><p class="muted">${esc(e.message)} Reload to try again. Nothing has been changed.</p></div>`;showApp();renderNav()}
  document.addEventListener("visibilitychange",async()=>{
    if(document.visibilityState!=="visible"||!Store.user)return;
    await Store.flush();
    if(Store.pending()||$("#modal").innerHTML||document.activeElement&&document.activeElement.matches("input,select,textarea"))return;
    try{const docs=await Store.getAll();Store.mode="cloud";loadFromDocs(overlayOutbox(docs));render();renderStatus()}catch(e){if(e.code==="offline"){Store.mode="offline";renderStatus()}}
  });
})();
