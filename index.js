const express=require("express");
const path=require("path");
const fs=require("fs");
const sqlite3=require("sqlite3").verbose();
const app=express();
const PORT=process.env.PORT||3000;
const dataDir=process.env.DATA_DIR||path.join(__dirname,"..","data");
fs.mkdirSync(dataDir,{recursive:true});
const db=new sqlite3.Database(path.join(dataDir,"clinic.db"));
app.use(express.json());
app.use(express.static(path.join(__dirname,"..","public")));
db.serialize(()=>db.run(`CREATE TABLE IF NOT EXISTS patients(
 id INTEGER PRIMARY KEY AUTOINCREMENT, queue_no TEXT NOT NULL, name TEXT NOT NULL,
 phone TEXT DEFAULT '', reason TEXT DEFAULT '', status TEXT NOT NULL DEFAULT 'Waiting',
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
)`));
const all=(sql,p=[])=>new Promise((ok,no)=>db.all(sql,p,(e,r)=>e?no(e):ok(r)));
const get=(sql,p=[])=>new Promise((ok,no)=>db.get(sql,p,(e,r)=>e?no(e):ok(r)));
const run=(sql,p=[])=>new Promise((ok,no)=>db.run(sql,p,function(e){e?no(e):ok({id:this.lastID,changes:this.changes})}));
app.get("/api/health",(_q,s)=>s.json({ok:true}));
app.get("/api/patients",async(_q,s)=>{try{s.json(await all("SELECT * FROM patients ORDER BY id DESC"));}catch(e){console.error(e);s.status(500).json({error:"Could not load patients."});}});
app.post("/api/patients",async(q,s)=>{try{
 const name=String(q.body.name||q.body.fullname||"").trim();
 if(!name)return s.status(400).json({error:"Patient name is required."});
 const phone=String(q.body.phone||"").trim(),reason=String(q.body.reason||"").trim();
 const count=await get("SELECT COUNT(*) AS total FROM patients WHERE date(created_at)=date('now','localtime')");
 const queueNo="A-"+String((count.total||0)+1).padStart(3,"0");
 const result=await run("INSERT INTO patients(queue_no,name,phone,reason,status) VALUES(?,?,?,?, 'Waiting')",[queueNo,name,phone,reason]);
 s.status(201).json(await get("SELECT * FROM patients WHERE id=?",[result.id]));
 }catch(e){console.error(e);s.status(500).json({error:"Could not register patient."});}});
app.patch("/api/patients/:id/status",async(q,s)=>{try{
 const status=q.body.status,allowed=["Waiting","In Consultation","Completed"];
 if(!allowed.includes(status))return s.status(400).json({error:"Invalid patient status."});
 const result=await run("UPDATE patients SET status=? WHERE id=?",[status,q.params.id]);
 if(!result.changes)return s.status(404).json({error:"Patient not found."});
 s.json(await get("SELECT * FROM patients WHERE id=?",[q.params.id]));
 }catch(e){console.error(e);s.status(500).json({error:"Could not update patient status."});}});
app.get("*",(_q,s)=>s.sendFile(path.join(__dirname,"..","public","index.html")));
app.listen(PORT,()=>console.log("Clinic app listening on "+PORT));
