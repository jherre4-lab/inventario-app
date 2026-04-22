import { useState, useEffect, useMemo } from "react";

const SHEET_ID = "1Wt8Rg_PUY1nSg10JKbJlQQCgMgQ0dEGmEAW5V6vLUxA";
const CLIENT_EMAIL = "inventario-app@steam-way-494102-p8.iam.gserviceaccount.com";
const PRIVATE_KEY = "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCkUyvcZNYMQjlb\nFVcFc2lRUBdg4jHD4lkK+iS2hH4Cme/enpY3j734lsGEAuaIOKJXOZyXWDtWQ/jW\na7ihxWEWPizYIpJKpmDX/9Q6VnFdG1MZUXRMlxQk4FtOYo7hiy0EMj9+4dh8yVeM\nHCsqhg5opyLDisad90s3wRZVKPDfxjvdD3Tx3LoXTyG5sfAr9qw0SOD8CRLj7lVN\nm10RNDvy2LrfFpfWgOQKFHfV+IDTF/s1xd0aTV/aekGKhPZGgls82LwtcHUZQFtY\n8/jAMHPsSYdwd7bHqZ3CKt1I8QNixA/43SDUI91bkFdJXvkv6B0vcE8dvbJKXSQh\njUngLwKvAgMBAAECggEAQmN91XGBzvsUbBmfikq58omOoGxSWccBXX95RKobtNZX\nhFQC8Zin0h6qOTjoxYFICUBz5OtXMb+NcaectPLnChL9kCbLftBgUPQBXL5e15R6\nCsEPYQAquclQ6kbEXhgaDFd2sr7w9V1s+uTIhcoaWSqpT2IqY1itMW3XpXlAc89f\n0N5kqKz4Kkme4UA+IMlu6QvJnzmv+QazOkEy33Es5qH7fLM7OMRlHkRjG0sZw4MX\n+UH1gfk87C6NDdr/XamGZcMD97y73kxMN/uCjyCMUpCTqFotIRQFQJVDM6MgYvPL\nqw/k3lmUtrRWSS6VgoEM4KDHHOHpv2JZoz5ANcKESQKBgQDQezlpaMUVh3BNpXK/\n9ytaUWdBKNEILthOu3lnsSSNWBz1TtwwJ8N8q0RjMuR35i705kE3rWZ5ayfPN9P0\nwU4+VTiTM4BrSRSoQiGS3E/kkU7cqZuEpdS32zxCMZRvvDOKHp14LmtKMdH5RIX8\ntWVLfVMtpEU6XwroHlWXIxlrdwKBgQDJx3D27R9PwZ9I7NnaX4Et4q5kyKI3KpJ7\naofkpu08ASimBc+ADWEzTuwlGJaYFQ94z/JWrOfWyD1NzkApZtXpSoWH0p0SOD3k\nDs3tBtLA9ELWC15XC1sFty8ALWNph1fJU3387RIhKHKSCmOS68D11JNyoFBaKoYZ\n8cRQUS+AiQKBgDn8S/eZgFeAmCfAgK4L3S79vS5OX/VasicT1ayVhIkbnNJN4Mg0\nBxdBu3+rxAflKeJLuI/31qymtSfZa0aEDXMg2N94T5uHdAtoeVYTmNUF5V1Sf0Lh\nrMyGWbg/ef2p5tvfsAShRI4aVUBzYqDrAwWAEgZ7zhVyIeJ1rXCf/o35AoGBAMD6\nzTBsMpEd9lBRrj1rL+oJrY7YUESAo94DUfq+J5BG73BxiDXJFhhzN+h2rri/E7AQ\n+Y4qCgViNzdttfGi150qV7FCHlUpkw/FlO9HolNGiZGbB9wqESDTRNFfl397INt8\nzbcTqU4rGABSjU8byM2URHzRlGfX2a+AiafjLZI5AoGAa0Qfm7f5tmze1iyPsPzn\nkOcFVyJOz7RgPQ48bQ9axg1UTMTadjSMVVfSHWSh9GkuO9+zK5UbmqA/HeIPl1Xl\nrK9NTOkOO+CP7iLteplXASZoD3+Ki//En7x5YoWeIchEm3jP+GBOnoQT2yOe/ecn\niAa15juG1uODKeOzIs0kbrA=\n-----END PRIVATE KEY-----";

const TABS = { P: "Productos", PR: "Proveedores", M: "Movimientos" };

async function getToken() {
  const b64u = s => btoa(s).replace(/=/g,"").replace(/\+/g,"-").replace(/\//g,"_");
  const header = b64u(JSON.stringify({ alg:"RS256", typ:"JWT" }));
  const now = Math.floor(Date.now()/1000);
  const claim = b64u(JSON.stringify({ iss:CLIENT_EMAIL, scope:"https://www.googleapis.com/auth/spreadsheets",
    aud:"https://oauth2.googleapis.com/token", exp:now+3600, iat:now }));
  const pem = PRIVATE_KEY.replace(/-----BEGIN PRIVATE KEY-----|-----END PRIVATE KEY-----|\n/g,"");
  const der = Uint8Array.from(atob(pem), c=>c.charCodeAt(0));
  const key = await crypto.subtle.importKey("pkcs8", der, { name:"RSASSA-PKCS1-v1_5", hash:"SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", key, new TextEncoder().encode(`${header}.${claim}`));
  const sigB64 = b64u(btoa(String.fromCharCode(...new Uint8Array(sig))));
  const jwt = `${header}.${claim}.${sigB64}`;
  const r = await fetch("https://oauth2.googleapis.com/token", {
    method:"POST", headers:{"Content-Type":"application/x-www-form-urlencoded"},
    body:`grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${jwt}`
  });
  return (await r.json()).access_token;
}

const api = (token, method, path, body) => fetch(
  `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}${path}`,
  { method, headers:{ Authorization:`Bearer ${token}`, "Content-Type":"application/json" },
    body: body ? JSON.stringify(body) : undefined }
).then(r=>r.json());

const getRange  = (t,r) => api(t,"GET",`/values/${encodeURIComponent(r)}`);
const putRange  = (t,r,v) => api(t,"PUT",`/values/${encodeURIComponent(r)}?valueInputOption=RAW`,{values:v});
const appendRange=(t,r,v) => api(t,"POST",`/values/${encodeURIComponent(r)}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`,{values:v});
const clearRange= (t,r) => api(t,"POST",`/values/${encodeURIComponent(r)}:clear`);

const INIT_PROVS = [
  {id:"primestmart",nombre:"Primestmart"},{id:"super_riba",nombre:"Super Riba"},
  {id:"gago",nombre:"Gago"},{id:"chocolatisimo",nombre:"Chocolatísimo"},
  {id:"plasticos",nombre:"Plásticos Arenales"},{id:"pedersen",nombre:"Pedersen"},
  {id:"sysco",nombre:"Sysco"},{id:"milov",nombre:"Milov"},
  {id:"tzanetato",nombre:"Tzanetato"},{id:"organica",nombre:"Orgánica"},{id:"amazon",nombre:"Amazon"},
];
const INIT_PRODS = [
  {id:"P001",nombre:"Aceite",prov:"primestmart",stock:2,min:2,max:6},
  {id:"P002",nombre:"Azúcar morena",prov:"primestmart",stock:2,min:2,max:6},
  {id:"P003",nombre:"Bolsa de Basura",prov:"primestmart",stock:2,min:2,max:6},
  {id:"P004",nombre:"Bolsas Ciploc",prov:"primestmart",stock:2,min:2,max:6},
  {id:"P005",nombre:"Cacao",prov:"primestmart",stock:2,min:2,max:6},
  {id:"P006",nombre:"Canela en polvo",prov:"primestmart",stock:2,min:2,max:6},
  {id:"P007",nombre:"Chocolate Chips",prov:"primestmart",stock:2,min:2,max:6},
  {id:"P008",nombre:"Confetis/Nomparelis",prov:"primestmart",stock:2,min:2,max:6},
  {id:"P009",nombre:"Crema Agria",prov:"primestmart",stock:2,min:2,max:6},
  {id:"P010",nombre:"Crema de leche",prov:"primestmart",stock:2,min:2,max:6},
  {id:"P011",nombre:"Crema Tartar",prov:"primestmart",stock:2,min:2,max:6},
  {id:"P012",nombre:"Galleta María",prov:"primestmart",stock:2,min:2,max:6},
  {id:"P013",nombre:"Harina de Almendras",prov:"primestmart",stock:2,min:2,max:6},
  {id:"P014",nombre:"Helado Bonlac",prov:"primestmart",stock:2,min:2,max:6},
  {id:"P015",nombre:"Jabón Lava Platos",prov:"primestmart",stock:2,min:2,max:6},
  {id:"P016",nombre:"Lata de Melocotón",prov:"primestmart",stock:2,min:2,max:6},
  {id:"P017",nombre:"Leche condensada",prov:"primestmart",stock:2,min:2,max:6},
  {id:"P018",nombre:"Leche entera Nevada",prov:"primestmart",stock:2,min:2,max:6},
  {id:"P019",nombre:"Leche evaporada",prov:"primestmart",stock:2,min:2,max:6},
  {id:"P020",nombre:"Manteca",prov:"primestmart",stock:2,min:2,max:6},
  {id:"P021",nombre:"Nueces Walnut",prov:"primestmart",stock:2,min:2,max:6},
  {id:"P022",nombre:"Nutella",prov:"primestmart",stock:2,min:2,max:6},
  {id:"P023",nombre:"PAM sprite",prov:"primestmart",stock:2,min:2,max:6},
  {id:"P024",nombre:"Papel aluminio 12x1000",prov:"primestmart",stock:2,min:2,max:6},
  {id:"P025",nombre:"Papel Toalla",prov:"primestmart",stock:2,min:2,max:6},
  {id:"P026",nombre:"Pecan Halves",prov:"primestmart",stock:2,min:2,max:6},
  {id:"P027",nombre:"Plastic wrap",prov:"primestmart",stock:2,min:2,max:6},
  {id:"P028",nombre:"Queso crema",prov:"primestmart",stock:2,min:2,max:6},
  {id:"P029",nombre:"Vinagre",prov:"primestmart",stock:2,min:2,max:6},
  {id:"R001",nombre:"Avena Quaker",prov:"super_riba",stock:2,min:2,max:6},
  {id:"R002",nombre:"Azúcar Estevia",prov:"super_riba",stock:2,min:2,max:6},
  {id:"R003",nombre:"Bicarbonato",prov:"super_riba",stock:2,min:2,max:6},
  {id:"R004",nombre:"Guayaba",prov:"super_riba",stock:2,min:2,max:6},
  {id:"R005",nombre:"Harina Amarilla",prov:"super_riba",stock:2,min:2,max:6},
  {id:"R006",nombre:"Harina Gluten Free",prov:"super_riba",stock:2,min:2,max:6},
  {id:"R007",nombre:"Harina Todo uso",prov:"super_riba",stock:2,min:2,max:6},
  {id:"R008",nombre:"Lata dulce de leche",prov:"super_riba",stock:2,min:2,max:6},
  {id:"R009",nombre:"Maicena",prov:"super_riba",stock:2,min:2,max:6},
  {id:"R010",nombre:"Manteca",prov:"super_riba",stock:2,min:2,max:6},
  {id:"R011",nombre:"Nevazucar",prov:"super_riba",stock:2,min:2,max:6},
  {id:"R012",nombre:"Polvo de Hornear",prov:"super_riba",stock:2,min:2,max:6},
  {id:"R013",nombre:"Vainilla",prov:"super_riba",stock:2,min:2,max:6},
  {id:"R014",nombre:"Xanthan polvo",prov:"super_riba",stock:2,min:2,max:6},
  {id:"R015",nombre:"Vinagre Heinz",prov:"super_riba",stock:2,min:2,max:6},
  {id:"R016",nombre:"Sirop Karo",prov:"super_riba",stock:2,min:2,max:6},
  {id:"R017",nombre:"Aceite de coco La palmita",prov:"super_riba",stock:2,min:2,max:6},
  {id:"G001",nombre:"Fresas congeladas",prov:"gago",stock:2,min:2,max:6},
  {id:"G002",nombre:"Guineos",prov:"gago",stock:2,min:2,max:6},
  {id:"G003",nombre:"Limón",prov:"gago",stock:2,min:2,max:6},
  {id:"G004",nombre:"Manzanas",prov:"gago",stock:2,min:2,max:6},
  {id:"G005",nombre:"Maracuyá",prov:"gago",stock:2,min:2,max:6},
  {id:"C001",nombre:"Bolsas Kraft",prov:"chocolatisimo",stock:2,min:2,max:6},
  {id:"C002",nombre:"Discos / Platos",prov:"chocolatisimo",stock:2,min:2,max:6},
  {id:"C003",nombre:"Envases redondos",prov:"chocolatisimo",stock:2,min:2,max:6},
  {id:"C004",nombre:"Harina de Saco",prov:"chocolatisimo",stock:2,min:2,max:6},
  {id:"C005",nombre:"Potes",prov:"chocolatisimo",stock:2,min:2,max:6},
  {id:"C006",nombre:"Diulce de leche",prov:"chocolatisimo",stock:2,min:2,max:6},
  {id:"C007",nombre:"Avellanas",prov:"chocolatisimo",stock:2,min:2,max:6},
  {id:"C008",nombre:"Capacillos",prov:"chocolatisimo",stock:2,min:2,max:6},
  {id:"C009",nombre:"Envase 25 guayabitas",prov:"chocolatisimo",stock:2,min:2,max:6},
  {id:"C010",nombre:"Colorantes",prov:"chocolatisimo",stock:2,min:2,max:6},
  {id:"C011",nombre:"Cajas de Pie y tres leches",prov:"chocolatisimo",stock:2,min:2,max:6},
  {id:"C012",nombre:"Mangas",prov:"chocolatisimo",stock:2,min:2,max:6},
  {id:"C013",nombre:"Bandejas grandes",prov:"chocolatisimo",stock:2,min:2,max:6},
  {id:"C014",nombre:"Envases de Cupcake",prov:"chocolatisimo",stock:2,min:2,max:6},
  {id:"A001",nombre:"Domos para Dulces",prov:"plasticos",stock:2,min:2,max:6},
  {id:"A002",nombre:"Envases de Aluminio",prov:"plasticos",stock:2,min:2,max:6},
  {id:"A003",nombre:"Envases PEP",prov:"plasticos",stock:2,min:2,max:6},
  {id:"D001",nombre:"Crema de batir Payson",prov:"pedersen",stock:2,min:2,max:6},
  {id:"D002",nombre:"Mantequilla Lurpak",prov:"pedersen",stock:2,min:2,max:6},
  {id:"S001",nombre:"Bandeja aluminio redonda",prov:"sysco",stock:2,min:2,max:6},
  {id:"S002",nombre:"Bolsas Kraft",prov:"sysco",stock:2,min:2,max:6},
  {id:"S003",nombre:"Papel Encerado",prov:"sysco",stock:2,min:2,max:6},
  {id:"M001",nombre:"Crema Bravo",prov:"milov",stock:2,min:2,max:6},
  {id:"T001",nombre:"Mantequilla Blue River",prov:"tzanetato",stock:2,min:2,max:6},
  {id:"T002",nombre:"Azúcar blanca",prov:"tzanetato",stock:2,min:2,max:6},
  {id:"O001",nombre:"Chispas sugar free",prov:"organica",stock:2,min:2,max:6},
  {id:"O002",nombre:"Endulzante Monk",prov:"organica",stock:2,min:2,max:6},
  {id:"AM01",nombre:"Sirop Choc Zero",prov:"amazon",stock:2,min:2,max:6},
];

function estado(s,m){ if(s<=0)return"AGOTADO"; if(s<=m)return"URGENTE"; if(s<=m*1.5)return"PRONTO"; return"OK"; }
const EST={
  AGOTADO:{label:"🔴 Agotado", dot:"#C0392B",bg:"#FFEBEB",txt:"#C0392B",pill:"#C0392B",pt:"#fff"},
  URGENTE:{label:"⚠️ Pedir ya",dot:"#E67E22",bg:"#FFF4E6",txt:"#7A4500",pill:"#E67E22",pt:"#fff"},
  PRONTO: {label:"🔔 Pronto",  dot:"#F1C40F",bg:"#FFFDF0",txt:"#7A6000",pill:"#F1C40F",pt:"#333"},
  OK:     {label:"✅ OK",      dot:"#27AE60",bg:"#F0FBF5",txt:"#0A5C36",pill:"#27AE60",pt:"#fff"},
};
function Pill({e}){const c=EST[e];return<span style={{background:c.pill,color:c.pt,borderRadius:99,padding:"2px 10px",fontSize:11,fontWeight:700,whiteSpace:"nowrap"}}>{c.label}</span>;}
function Stepper({v,on}){return(<div style={{display:"flex",alignItems:"center",gap:4}}><button onClick={()=>on(Math.max(0,v-1))} style={{width:26,height:26,borderRadius:6,border:"none",background:"#FFEBEB",color:"#C0392B",fontWeight:700,cursor:"pointer",fontSize:16}}>−</button><span style={{minWidth:28,textAlign:"center",fontWeight:700,fontSize:14}}>{v}</span><button onClick={()=>on(v+1)} style={{width:26,height:26,borderRadius:6,border:"none",background:"#E8F5E9",color:"#27AE60",fontWeight:700,cursor:"pointer",fontSize:16}}>+</button></div>);}
function Modal({children,onClose}){return<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.45)",zIndex:100,display:"flex",alignItems:"center",justifyContent:"center",padding:16}} onClick={onClose}><div style={{background:"#fff",borderRadius:16,padding:22,width:"100%",maxWidth:400,boxShadow:"0 8px 40px rgba(0,0,0,0.2)",maxHeight:"90vh",overflowY:"auto"}} onClick={e=>e.stopPropagation()}>{children}</div></div>;}
function Field({label,children}){return<div style={{marginBottom:10}}><div style={{fontSize:11,fontWeight:600,color:"#667085",marginBottom:3,textTransform:"uppercase",letterSpacing:"0.5px"}}>{label}</div>{children}</div>;}

export default function App() {
  const [prods,setProds]=useState([]);
  const [provs,setProvs]=useState([]);
  const [movs,setMovs]=useState([]);
  const [tok,setTok]=useState(null);
  const [loading,setLoading]=useState(true);
  const [saving,setSaving]=useState(false);
  const [err,setErr]=useState(null);
  const [tab,setTab]=useState("alertas");
  const [search,setSearch]=useState("");
  const [filtP,setFiltP]=useState("todos");
  const [user,setUser]=useState("Jose");
  const [mProd,setMProd]=useState(false);
  const [mProv,setMProv]=useState(false);
  const [mEdit,setMEdit]=useState(null);
  const [nProd,setNProd]=useState({nombre:"",prov:"primestmart",stock:0,min:2,max:6});
  const [nProv,setNProv]=useState({nombre:""});

  useEffect(()=>{
    (async()=>{
      try{
        const t=await getToken(); setTok(t);
        const [rP,rPr,rM]=await Promise.all([
          getRange(t,`${TABS.P}!A2:F1000`),
          getRange(t,`${TABS.PR}!A2:B1000`),
          getRange(t,`${TABS.M}!A2:I1000`),
        ]);
        // Check if sheets have headers, init if not
        const hP=await getRange(t,`${TABS.P}!A1`);
        if(!hP.values){
          await appendRange(t,`${TABS.P}!A1`,[["id","nombre","prov","stock","min","max"]]);
          await appendRange(t,`${TABS.P}!A1`,INIT_PRODS.map(p=>[p.id,p.nombre,p.prov,p.stock,p.min,p.max]));
          await appendRange(t,`${TABS.PR}!A1`,[["id","nombre"]]);
          await appendRange(t,`${TABS.PR}!A1`,INIT_PROVS.map(p=>[p.id,p.nombre]));
          await appendRange(t,`${TABS.M}!A1`,[["fecha","hora","producto","proveedor","tipo","cantidad","stock_anterior","stock_nuevo","usuario"]]);
          setProds(INIT_PRODS); setProvs(INIT_PROVS);
        } else {
          if(rP.values?.length) setProds(rP.values.map(r=>({id:r[0],nombre:r[1],prov:r[2],stock:+r[3],min:+r[4],max:+r[5]})));
          else setProds(INIT_PRODS);
          if(rPr.values?.length) setProvs(rPr.values.map(r=>({id:r[0],nombre:r[1]})));
          else setProvs(INIT_PROVS);
          if(rM.values?.length) setMovs(rM.values.map(r=>({fecha:r[0],hora:r[1],producto:r[2],proveedor:r[3],tipo:r[4],cantidad:r[5],sa:r[6],sn:r[7],usuario:r[8]})));
        }
      }catch(e){setErr("Error conectando Sheets: "+e.message);}
      finally{setLoading(false);}
    })();
  },[]);

  async function saveProds(p){
    if(!tok)return; setSaving(true);
    try{ await clearRange(tok,`${TABS.P}!A2:F1000`); if(p.length) await putRange(tok,`${TABS.P}!A2`,p.map(x=>[x.id,x.nombre,x.prov,x.stock,x.min,x.max])); }
    finally{setSaving(false);}
  }
  async function saveProvs(p){
    if(!tok)return;
    await clearRange(tok,`${TABS.PR}!A2:B1000`); if(p.length) await putRange(tok,`${TABS.PR}!A2`,p.map(x=>[x.id,x.nombre]));
  }
  async function logMov(prod,tipo,cant,sa,sn){
    if(!tok)return;
    const d=new Date(); const fecha=d.toLocaleDateString("es-PA"); const hora=d.toLocaleTimeString("es-PA",{hour:"2-digit",minute:"2-digit"});
    const pnom=provs.find(p=>p.id===prod.prov)?.nombre||prod.prov;
    await appendRange(tok,`${TABS.M}!A1`,[[fecha,hora,prod.nombre,pnom,tipo,cant,sa,sn,user]]);
    setMovs(prev=>[...prev,{fecha,hora,producto:prod.nombre,proveedor:pnom,tipo,cantidad:cant,sa,sn,usuario:user}]);
  }

  async function updateStock(id,nv){
    const prod=prods.find(p=>p.id===id); if(!prod||nv===prod.stock)return;
    const tipo=nv>prod.stock?"Entrada":"Salida"; const diff=Math.abs(nv-prod.stock);
    const upd=prods.map(p=>p.id===id?{...p,stock:nv}:p);
    setProds(upd); await saveProds(upd); await logMov(prod,tipo,diff,prod.stock,nv);
  }
  async function saveEdit(){
    const upd=prods.map(p=>p.id===mEdit.id?{...p,...mEdit}:p);
    setProds(upd); await saveProds(upd); setMEdit(null);
  }
  async function delProd(id){
    const upd=prods.filter(p=>p.id!==id); setProds(upd); await saveProds(upd); setMEdit(null);
  }
  async function addProd(){
    if(!nProd.nombre.trim())return;
    const p={...nProd,id:"X"+Date.now(),stock:+nProd.stock,min:+nProd.min,max:+nProd.max};
    const upd=[...prods,p]; setProds(upd); await saveProds(upd);
    setNProd({nombre:"",prov:provs[0]?.id||"",stock:0,min:2,max:6}); setMProd(false);
  }
  async function addProv(){
    if(!nProv.nombre.trim())return;
    const p={id:"prov_"+Date.now(),nombre:nProv.nombre};
    const upd=[...provs,p]; setProvs(upd); await saveProvs(upd);
    setNProv({nombre:""}); setMProv(false);
  }

  const enriched=useMemo(()=>prods.map(p=>({...p,est:estado(p.stock,p.min)})),[prods]);
  const alertas=useMemo(()=>enriched.filter(p=>p.est!=="OK"),[enriched]);
  const byProv=useMemo(()=>{const m={};alertas.forEach(p=>{(m[p.prov]=m[p.prov]||[]).push(p);});return m;},[alertas]);
  const filtered=useMemo(()=>enriched.filter(p=>p.nombre.toLowerCase().includes(search.toLowerCase())&&(filtP==="todos"||p.prov===filtP)),[enriched,search,filtP]);
  const pn=id=>provs.find(p=>p.id===id)?.nombre||id;
  const urgN=alertas.filter(p=>["URGENTE","AGOTADO"].includes(p.est)).length;
  const prN=alertas.filter(p=>p.est==="PRONTO").length;

  if(loading)return<div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"100vh",background:"#1B2838",gap:16}}><div style={{fontSize:48}}>🧁</div><div style={{color:"#fff",fontSize:16,fontWeight:600}}>Conectando con Google Sheets…</div><div style={{color:"rgba(255,255,255,0.4)",fontSize:13}}>Cargando tu inventario</div></div>;
  if(err)return<div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"100vh",background:"#1B2838",gap:12,padding:24,textAlign:"center"}}><div style={{fontSize:40}}>⚠️</div><div style={{color:"#FF6B6B",fontSize:14}}>{err}</div></div>;

  return(
    <div style={{fontFamily:"'Segoe UI',system-ui,sans-serif",background:"#F0F2F7",minHeight:"100vh",maxWidth:900,margin:"0 auto"}}>
      {/* HEADER */}
      <div style={{background:"linear-gradient(135deg,#1B2838,#2C3E50)",padding:"16px 20px",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:12}}>
        <div>
          <div style={{fontSize:22,fontWeight:800,color:"#fff"}}>🧁 Inventario</div>
          <div style={{fontSize:12,color:"rgba(255,255,255,0.5)",marginTop:2}}>
            {prods.length} productos · {provs.length} proveedores
            {saving&&<span style={{color:"#F1C40F",marginLeft:8}}>💾 Guardando…</span>}
          </div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:12,flexWrap:"wrap"}}>
          <select value={user} onChange={e=>setUser(e.target.value)} style={{padding:"5px 10px",borderRadius:8,border:"1.5px solid rgba(255,255,255,0.2)",background:"transparent",color:"#fff",fontSize:13}}>
            {["Jose","Encargada","Otro"].map(u=><option key={u} style={{color:"#000"}}>{u}</option>)}
          </select>
          <div style={{display:"flex",gap:10}}>
            {[["Productos",prods.length,"#fff"],["⚠ Urgentes",urgN,"#FF6B6B"],["🔔 Pronto",prN,"#F1C40F"]].map(([l,v,c])=>(
              <div key={l} style={{border:"1.5px solid rgba(255,255,255,0.2)",borderRadius:10,padding:"5px 12px",textAlign:"center"}}>
                <div style={{fontSize:20,fontWeight:800,color:c}}>{v}</div>
                <div style={{fontSize:10,color:"rgba(255,255,255,0.5)",textTransform:"uppercase",letterSpacing:"0.5px"}}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* TABS */}
      <div style={{background:"#fff",borderBottom:"2px solid #E8ECF0",display:"flex",padding:"0 16px",position:"sticky",top:0,zIndex:10,overflowX:"auto"}}>
        {[["alertas","🚨 Alertas"],["inventario","📦 Inventario"],["movimientos","📋 Movimientos"],["proveedores","🏢 Proveedores"]].map(([k,l])=>(
          <button key={k} onClick={()=>setTab(k)} style={{padding:"12px 14px",border:"none",background:"none",cursor:"pointer",fontSize:13,fontWeight:600,color:tab===k?"#2C3E50":"#667085",borderBottom:tab===k?"3px solid #2C3E50":"3px solid transparent",display:"flex",alignItems:"center",gap:6,whiteSpace:"nowrap"}}>
            {l}{k==="alertas"&&alertas.length>0&&<span style={{background:"#E74C3C",color:"#fff",borderRadius:99,padding:"1px 7px",fontSize:10,fontWeight:700}}>{alertas.length}</span>}
          </button>
        ))}
      </div>

      <div style={{padding:16}}>
        {/* ALERTAS */}
        {tab==="alertas"&&(
          alertas.length===0
            ?<div style={{textAlign:"center",padding:40,color:"#0A5C36",fontSize:15,fontWeight:600,background:"#D4F4E2",borderRadius:12}}>✅ Todo el inventario está sobre el nivel mínimo</div>
            :Object.entries(byProv).map(([pid,ps])=>(
              <div key={pid} style={{background:"#fff",borderRadius:12,overflow:"hidden",boxShadow:"0 1px 3px rgba(0,0,0,0.07)",marginBottom:16}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 16px",background:"#2C3E50"}}>
                  <span style={{fontWeight:700,color:"#fff",fontSize:15}}>{pn(pid)}</span>
                  <span style={{fontSize:12,color:"rgba(255,255,255,0.6)"}}>{ps.length} producto{ps.length>1?"s":""} a pedir</span>
                </div>
                {ps.map(p=>(
                  <div key={p.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 16px",borderBottom:"1px solid rgba(0,0,0,0.04)",background:EST[p.est].bg,gap:10}}>
                    <div style={{flex:1}}>
                      <div style={{fontWeight:600,fontSize:14}}>{p.nombre}</div>
                      <div style={{fontSize:12,color:"#888",marginTop:2}}>Stock: <b style={{color:EST[p.est].txt}}>{p.stock}</b> · Mín: {p.min} · Pedir: <b>{p.max-p.stock}</b></div>
                    </div>
                    <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:6}}>
                      <Pill e={p.est}/><Stepper v={p.stock} on={v=>updateStock(p.id,v)}/>
                    </div>
                  </div>
                ))}
                <div style={{padding:"10px 16px",background:"#F8F9FA",fontSize:12,color:"#667085",borderTop:"1px solid #E8ECF0",fontStyle:"italic"}}>
                  Ordenar {ps.reduce((s,p)=>s+(p.max-p.stock),0)} unidades en total
                </div>
              </div>
            ))
        )}

        {/* INVENTARIO */}
        {tab==="inventario"&&(
          <div>
            <div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap"}}>
              <input style={{flex:1,minWidth:160,padding:"8px 12px",borderRadius:8,border:"1.5px solid #D0D5DD",fontSize:13,outline:"none"}} placeholder="🔍 Buscar producto…" value={search} onChange={e=>setSearch(e.target.value)}/>
              <select style={{padding:"8px 10px",borderRadius:8,border:"1.5px solid #D0D5DD",fontSize:13,background:"#fff",outline:"none"}} value={filtP} onChange={e=>setFiltP(e.target.value)}>
                <option value="todos">Todos los proveedores</option>
                {provs.map(p=><option key={p.id} value={p.id}>{p.nombre}</option>)}
              </select>
              <button onClick={()=>setMProd(true)} style={{padding:"8px 16px",borderRadius:8,background:"#2C3E50",color:"#fff",border:"none",fontWeight:700,fontSize:13,cursor:"pointer"}}>+ Producto</button>
            </div>
            {provs.map(prov=>{
              const ps=filtered.filter(p=>p.prov===prov.id); if(!ps.length)return null;
              return(
                <div key={prov.id} style={{marginBottom:20}}>
                  <div style={{fontSize:12,fontWeight:700,color:"#667085",textTransform:"uppercase",letterSpacing:"0.8px",marginBottom:6,paddingLeft:4}}>{prov.nombre}</div>
                  <div style={{background:"#fff",borderRadius:12,overflow:"hidden",boxShadow:"0 1px 3px rgba(0,0,0,0.07)"}}>
                    {ps.map((p,i)=>(
                      <div key={p.id} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 14px",borderBottom:"1px solid #F0F0F0",background:i%2===0?"#fff":"#FAFBFC"}}>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{fontWeight:600,fontSize:13,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.nombre}</div>
                          <div style={{fontSize:11,color:"#aaa"}}>Mín: {p.min} · Máx: {p.max}</div>
                        </div>
                        <Stepper v={p.stock} on={v=>updateStock(p.id,v)}/>
                        <Pill e={p.est}/>
                        <button onClick={()=>setMEdit({...p})} style={{background:"none",border:"none",cursor:"pointer",fontSize:16,padding:"2px 4px"}}>⚙️</button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* MOVIMIENTOS */}
        {tab==="movimientos"&&(
          <div>
            <div style={{marginBottom:12,fontSize:13,color:"#667085"}}>{movs.length} movimientos · Guardado automático en Google Sheets</div>
            <div style={{background:"#fff",borderRadius:12,overflow:"hidden",boxShadow:"0 1px 3px rgba(0,0,0,0.07)"}}>
              {movs.length===0
                ?<div style={{padding:32,textAlign:"center",color:"#aaa"}}>Sin movimientos aún.<br/>Cada cambio de stock quedará registrado aquí.</div>
                :[...movs].reverse().map((m,i)=>(
                  <div key={i} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 16px",borderBottom:"1px solid #F0F0F0",background:i%2===0?"#fff":"#FAFBFC"}}>
                    <div style={{borderRadius:8,padding:"4px 10px",fontSize:12,fontWeight:700,whiteSpace:"nowrap",background:m.tipo==="Entrada"?"#E8F5E9":"#FFEBEB",color:m.tipo==="Entrada"?"#27AE60":"#C0392B"}}>
                      {m.tipo==="Entrada"?"↑":"↓"} {m.tipo}
                    </div>
                    <div style={{flex:1}}>
                      <div style={{fontWeight:600,fontSize:13}}>{m.producto}</div>
                      <div style={{fontSize:11,color:"#888"}}>{m.proveedor}</div>
                    </div>
                    <div style={{textAlign:"center"}}>
                      <div style={{fontWeight:700,fontSize:14}}>{m.tipo==="Entrada"?"+":"-"}{m.cantidad}</div>
                      <div style={{fontSize:11,color:"#aaa"}}>{m.sa}→{m.sn}</div>
                    </div>
                    <div style={{textAlign:"right",fontSize:11,color:"#aaa"}}>
                      <div>{m.fecha}</div><div>{m.hora}</div>
                      <div style={{color:"#667085",fontWeight:600}}>{m.usuario}</div>
                    </div>
                  </div>
                ))
              }
            </div>
          </div>
        )}

        {/* PROVEEDORES */}
        {tab==="proveedores"&&(
          <div>
            <div style={{display:"flex",justifyContent:"flex-end",marginBottom:14}}>
              <button onClick={()=>setMProv(true)} style={{padding:"8px 16px",borderRadius:8,background:"#2C3E50",color:"#fff",border:"none",fontWeight:700,fontSize:13,cursor:"pointer"}}>+ Proveedor</button>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:14}}>
              {provs.map(prov=>{
                const sus=enriched.filter(p=>p.prov===prov.id);
                const alts=sus.filter(p=>p.est!=="OK");
                return(
                  <div key={prov.id} style={{background:"#fff",borderRadius:12,overflow:"hidden",boxShadow:"0 1px 3px rgba(0,0,0,0.07)"}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 14px",background:"#2C3E50"}}>
                      <span style={{fontWeight:700,fontSize:15,color:"#fff"}}>{prov.nombre}</span>
                      {alts.length>0&&<span style={{background:"#E74C3C",color:"#fff",borderRadius:99,padding:"2px 8px",fontSize:11,fontWeight:700}}>{alts.length} alerta{alts.length>1?"s":""}</span>}
                    </div>
                    <div style={{padding:"10px 14px"}}>
                      <div style={{fontSize:12,color:"#888",marginBottom:8}}>{sus.length} productos</div>
                      {sus.map(p=>(
                        <div key={p.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"3px 0",borderBottom:"1px solid #F5F5F5",fontSize:12}}>
                          <span style={{color:p.est!=="OK"?EST[p.est].txt:"#333"}}>{p.nombre}</span>
                          <span style={{width:8,height:8,borderRadius:"50%",background:EST[p.est].dot,display:"inline-block"}}/>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* MODALES */}
      {mProd&&<Modal onClose={()=>setMProd(false)}>
        <div style={{fontSize:17,fontWeight:700,marginBottom:16,color:"#1B2838"}}>+ Nuevo Producto</div>
        <Field label="Nombre"><input style={{width:"100%",padding:"7px 10px",borderRadius:8,border:"1.5px solid #D0D5DD",fontSize:13,outline:"none",boxSizing:"border-box"}} value={nProd.nombre} onChange={e=>setNProd(p=>({...p,nombre:e.target.value}))}/></Field>
        <Field label="Proveedor"><select style={{width:"100%",padding:"7px 10px",borderRadius:8,border:"1.5px solid #D0D5DD",fontSize:13,outline:"none",boxSizing:"border-box"}} value={nProd.prov} onChange={e=>setNProd(p=>({...p,prov:e.target.value}))}>{provs.map(p=><option key={p.id} value={p.id}>{p.nombre}</option>)}</select></Field>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
          <Field label="Stock"><input type="number" style={{width:"100%",padding:"7px 10px",borderRadius:8,border:"1.5px solid #D0D5DD",fontSize:13,outline:"none",boxSizing:"border-box"}} value={nProd.stock} onChange={e=>setNProd(p=>({...p,stock:e.target.value}))}/></Field>
          <Field label="Mínimo"><input type="number" style={{width:"100%",padding:"7px 10px",borderRadius:8,border:"1.5px solid #D0D5DD",fontSize:13,outline:"none",boxSizing:"border-box"}} value={nProd.min} onChange={e=>setNProd(p=>({...p,min:e.target.value}))}/></Field>
          <Field label="Máximo"><input type="number" style={{width:"100%",padding:"7px 10px",borderRadius:8,border:"1.5px solid #D0D5DD",fontSize:13,outline:"none",boxSizing:"border-box"}} value={nProd.max} onChange={e=>setNProd(p=>({...p,max:e.target.value}))}/></Field>
        </div>
        <div style={{display:"flex",gap:8,marginTop:16}}>
          <button onClick={addProd} style={{padding:"8px 16px",borderRadius:8,background:"#2C3E50",color:"#fff",border:"none",fontWeight:700,fontSize:13,cursor:"pointer"}}>Guardar</button>
          <button onClick={()=>setMProd(false)} style={{padding:"8px 16px",borderRadius:8,background:"#F0F2F7",color:"#444",border:"none",fontWeight:600,fontSize:13,cursor:"pointer"}}>Cancelar</button>
        </div>
      </Modal>}

      {mProv&&<Modal onClose={()=>setMProv(false)}>
        <div style={{fontSize:17,fontWeight:700,marginBottom:16,color:"#1B2838"}}>+ Nuevo Proveedor</div>
        <Field label="Nombre"><input style={{width:"100%",padding:"7px 10px",borderRadius:8,border:"1.5px solid #D0D5DD",fontSize:13,outline:"none",boxSizing:"border-box"}} value={nProv.nombre} onChange={e=>setNProv({nombre:e.target.value})}/></Field>
        <div style={{display:"flex",gap:8,marginTop:16}}>
          <button onClick={addProv} style={{padding:"8px 16px",borderRadius:8,background:"#2C3E50",color:"#fff",border:"none",fontWeight:700,fontSize:13,cursor:"pointer"}}>Guardar</button>
          <button onClick={()=>setMProv(false)} style={{padding:"8px 16px",borderRadius:8,background:"#F0F2F7",color:"#444",border:"none",fontWeight:600,fontSize:13,cursor:"pointer"}}>Cancelar</button>
        </div>
      </Modal>}

      {mEdit&&<Modal onClose={()=>setMEdit(null)}>
        <div style={{fontSize:17,fontWeight:700,marginBottom:16,color:"#1B2838"}}>⚙️ Editar Producto</div>
        <Field label="Nombre"><input style={{width:"100%",padding:"7px 10px",borderRadius:8,border:"1.5px solid #D0D5DD",fontSize:13,outline:"none",boxSizing:"border-box"}} value={mEdit.nombre} onChange={e=>setMEdit(p=>({...p,nombre:e.target.value}))}/></Field>
        <Field label="Proveedor"><select style={{width:"100%",padding:"7px 10px",borderRadius:8,border:"1.5px solid #D0D5DD",fontSize:13,outline:"none",boxSizing:"border-box"}} value={mEdit.prov} onChange={e=>setMEdit(p=>({...p,prov:e.target.value}))}>{provs.map(p=><option key={p.id} value={p.id}>{p.nombre}</option>)}</select></Field>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
          <Field label="Stock"><input type="number" style={{width:"100%",padding:"7px 10px",borderRadius:8,border:"1.5px solid #D0D5DD",fontSize:13,outline:"none",boxSizing:"border-box"}} value={mEdit.stock} onChange={e=>setMEdit(p=>({...p,stock:+e.target.value}))}/></Field>
          <Field label="Mínimo"><input type="number" style={{width:"100%",padding:"7px 10px",borderRadius:8,border:"1.5px solid #D0D5DD",fontSize:13,outline:"none",boxSizing:"border-box"}} value={mEdit.min} onChange={e=>setMEdit(p=>({...p,min:+e.target.value}))}/></Field>
          <Field label="Máximo"><input type="number" style={{width:"100%",padding:"7px 10px",borderRadius:8,border:"1.5px solid #D0D5DD",fontSize:13,outline:"none",boxSizing:"border-box"}} value={mEdit.max} onChange={e=>setMEdit(p=>({...p,max:+e.target.value}))}/></Field>
        </div>
        <div style={{display:"flex",gap:8,marginTop:16}}>
          <button onClick={saveEdit} style={{padding:"8px 16px",borderRadius:8,background:"#2C3E50",color:"#fff",border:"none",fontWeight:700,fontSize:13,cursor:"pointer"}}>Guardar</button>
          <button onClick={()=>delProd(mEdit.id)} style={{padding:"8px 16px",borderRadius:8,background:"#FFEBEB",color:"#C0392B",border:"none",fontWeight:600,fontSize:13,cursor:"pointer"}}>Eliminar</button>
          <button onClick={()=>setMEdit(null)} style={{padding:"8px 16px",borderRadius:8,background:"#F0F2F7",color:"#444",border:"none",fontWeight:600,fontSize:13,cursor:"pointer"}}>Cancelar</button>
        </div>
      </Modal>}
    </div>
  );
}
