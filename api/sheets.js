export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') return res.status(200).end();

  const SHEET_ID = "1Wt8Rg_PUY1nSg10JKbJlQQCgMgQ0dEGmEAW5V6vLUxA";
  const CLIENT_EMAIL = "inventario-app@steam-way-494102-p8.iam.gserviceaccount.com";
  const PRIVATE_KEY = "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCkUyvcZNYMQjlb\nFVcFc2lRUBdg4jHD4lkK+iS2hH4Cme/enpY3j734lsGEAuaIOKJXOZyXWDtWQ/jW\na7ihxWEWPizYIpJKpmDX/9Q6VnFdG1MZUXRMlxQk4FtOYo7hiy0EMj9+4dh8yVeM\nHCsqhg5opyLDisad90s3wRZVKPDfxjvdD3Tx3LoXTyG5sfAr9qw0SOD8CRLj7lVN\nm10RNDvy2LrfFpfWgOQKFHfV+IDTF/s1xd0aTV/aekGKhPZGgls82LwtcHUZQFtY\n8/jAMHPsSYdwd7bHqZ3CKt1I8QNixA/43SDUI91bkFdJXvkv6B0vcE8dvbJKXSQh\njUngLwKvAgMBAAECggEAQmN91XGBzvsUbBmfikq58omOoGxSWccBXX95RKobtNZX\nhFQC8Zin0h6qOTjoxYFICUBz5OtXMb+NcaectPLnChL9kCbLftBgUPQBXL5e15R6\nCsEPYQAquclQ6kbEXhgaDFd2sr7w9V1s+uTIhcoaWSqpT2IqY1itMW3XpXlAc89f\n0N5kqKz4Kkme4UA+IMlu6QvJnzmv+QazOkEy33Es5qH7fLM7OMRlHkRjG0sZw4MX\n+UH1gfk87C6NDdr/XamGZcMD97y73kxMN/uCjyCMUpCTqFotIRQFQJVDM6MgYvPL\nqw/k3lmUtrRWSS6VgoEM4KDHHOHpv2JZoz5ANcKESQKBgQDQezlpaMUVh3BNpXK/\n9ytaUWdBKNEILthOu3lnsSSNWBz1TtwwJ8N8q0RjMuR35i705kE3rWZ5ayfPN9P0\nwU4+VTiTM4BrSRSoQiGS3E/kkU7cqZuEpdS32zxCMZRvvDOKHp14LmtKMdH5RIX8\ntWVLfVMtpEU6XwroHlWXIxlrdwKBgQDJx3D27R9PwZ9I7NnaX4Et4q5kyKI3KpJ7\naofkpu08ASimBc+ADWEzTuwlGJaYFQ94z/JWrOfWyD1NzkApZtXpSoWH0p0SOD3k\nDs3tBtLA9ELWC15XC1sFty8ALWNph1fJU3387RIhKHKSCmOS68D11JNyoFBaKoYZ\n8cRQUS+AiQKBgDn8S/eZgFeAmCfAgK4L3S79vS5OX/VasicT1ayVhIkbnNJN4Mg0\nBxdBu3+rxAflKeJLuI/31qymtSfZa0aEDXMg2N94T5uHdAtoeVYTmNUF5V1Sf0Lh\nrMyGWbg/ef2p5tvfsAShRI4aVUBzYqDrAwWAEgZ7zhVyIeJ1rXCf/o35AoGBAMD6\nzTBsMpEd9lBRrj1rL+oJrY7YUESAo94DUfq+J5BG73BxiDXJFhhzN+h2rri/E7AQ\n+Y4qCgViNzdttfGi150qV7FCHlUpkw/FlO9HolNGiZGbB9wqESDTRNFfl397INt8\nzbcTqU4rGABSjU8byM2URHzRlGfX2a+AiafjLZI5AoGAa0Qfm7f5tmze1iyPsPzn\nkOcFVyJOz7RgPQ48bQ9axg1UTMTadjSMVVfSHWSh9GkuO9+zK5UbmqA/HeIPl1Xl\nrK9NTOkOO+CP7iLteplXASZoD3+Ki//En7x5YoWeIchEm3jP+GBOnoQT2yOe/ecn\niAa15juG1uODKeOzIs0kbrA=\n-----END PRIVATE KEY-----";

  async function getToken() {
    const { createSign } = await import('crypto');
    const b64u = s => Buffer.from(s).toString('base64').replace(/=/g,"").replace(/\+/g,"-").replace(/\//g,"_");
    const now = Math.floor(Date.now()/1000);
    const header = b64u(JSON.stringify({alg:"RS256",typ:"JWT"}));
    const claim = b64u(JSON.stringify({iss:CLIENT_EMAIL,scope:"https://www.googleapis.com/auth/spreadsheets",aud:"https://oauth2.googleapis.com/token",exp:now+3600,iat:now}));
    const sign = createSign('RSA-SHA256');
    sign.update(`${header}.${claim}`);
    const sig = sign.sign(PRIVATE_KEY,'base64').replace(/=/g,"").replace(/\+/g,"-").replace(/\//g,"_");
    const jwt = `${header}.${claim}.${sig}`;
    const r = await fetch("https://oauth2.googleapis.com/token",{
      method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},
      body:`grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${jwt}`
    });
    const data = await r.json();
    if(!data.access_token) throw new Error("Token failed: "+JSON.stringify(data));
    return data.access_token;
  }

  try {
    const token = await getToken();
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const { action, range, values } = body;
    const base = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}`;
    const headers = { Authorization:`Bearer ${token}`, "Content-Type":"application/json" };
    let result;
    if(action==="get") {
      const r = await fetch(`${base}/values/${encodeURIComponent(range)}`,{headers});
      result = await r.json();
    } else if(action==="put") {
      const r = await fetch(`${base}/values/${encodeURIComponent(range)}?valueInputOption=RAW`,{method:"PUT",headers,body:JSON.stringify({values})});
      result = await r.json();
    } else if(action==="append") {
      const r = await fetch(`${base}/values/${encodeURIComponent(range)}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`,{method:"POST",headers,body:JSON.stringify({values})});
      result = await r.json();
    } else if(action==="clear") {
      const r = await fetch(`${base}/values/${encodeURIComponent(range)}:clear`,{method:"POST",headers});
      result = await r.json();
    }
    res.status(200).json(result);
  } catch(e) {
    res.status(500).json({error: e.message});
  }
}
