import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import {createClient} from "npm:@supabase/supabase-js@2"

const cors={"Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"authorization, x-client-info, apikey, content-type"}
const json=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers:{...cors,"Content-Type":"application/json"}})
const hash=async(value:string)=>Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256",new TextEncoder().encode(value)))).map(b=>b.toString(16).padStart(2,"0")).join("")
const token=()=>{const bytes=crypto.getRandomValues(new Uint8Array(32));return btoa(String.fromCharCode(...bytes)).replaceAll("+","-").replaceAll("/","_").replaceAll("=","")}
const normalizeUsername=(value:string)=>value.trim().toLowerCase()
const validUsername=(value:string)=>/^[a-zA-Z0-9._-]{3,30}$/.test(value)

Deno.serve(async req=>{
  if(req.method==="OPTIONS")return new Response("ok",{headers:cors})
  try{
    const url=Deno.env.get("SUPABASE_URL")!,anonKey=Deno.env.get("SUPABASE_ANON_KEY")!,serviceKey=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    const admin=createClient(url,serviceKey,{auth:{persistSession:false,autoRefreshToken:false}})
    const body=await req.json(),action=String(body?.action||"")

    if(action==="login"||action==="username-login"){
      let userId=""
      if(action==="username-login"){
        const username=normalizeUsername(String(body?.username||""))
        if(!username||!body?.password)return json({error:"Username e password sono obbligatori"},400)
        const {data:account}=await admin.from("login_usernames").select("user_id").eq("normalized_username",username).maybeSingle()
        if(!account)return json({error:"Username o password non corretti"},401)
        userId=account.user_id
      }else{
        const raw=String(body?.token||"").trim()
        if(!raw||!body?.password)return json({error:"QR e password sono obbligatori"},400)
        const {data:credential}=await admin.from("qr_credentials").select("user_id,active").eq("token_hash",await hash(raw)).maybeSingle()
        if(!credential?.active)return json({error:"QR non valido o disattivato"},401)
        userId=credential.user_id
      }
      const password=String(body?.password||""),since=new Date(Date.now()-15*60*1000).toISOString()
      const {count}=await admin.from("qr_login_attempts").select("id",{head:true,count:"exact"}).eq("user_id",userId).gte("attempted_at",since).eq("success",false)
      if((count||0)>=5)return json({error:"Troppi tentativi. Attendi 15 minuti o entra con e-mail e password."},429)
      const {data:targetProfile}=await admin.from("profiles").select("email,status").eq("id",userId).maybeSingle()
      if(!targetProfile||targetProfile.status!=="approved")return json({error:"Accesso non autorizzato"},403)
      const auth=createClient(url,anonKey,{auth:{persistSession:false,autoRefreshToken:false}})
      const {data:signed,error}=await auth.auth.signInWithPassword({email:targetProfile.email,password})
      await admin.from("qr_login_attempts").insert({user_id:userId,success:!error})
      if(error||!signed.session)return json({error:action==="username-login"?"Username o password non corretti":"Password non corretta"},401)
      if(action==="login")await admin.from("qr_credentials").update({last_used_at:new Date().toISOString()}).eq("user_id",userId)
      return json({access_token:signed.session.access_token,refresh_token:signed.session.refresh_token})
    }

    const authHeader=req.headers.get("Authorization")||"",jwt=authHeader.replace(/^Bearer\s+/i,"")
    const {data:{user},error:userError}=await admin.auth.getUser(jwt)
    if(userError||!user)return json({error:"Sessione non valida"},401)
    const {data:caller}=await admin.from("profiles").select("role,status").eq("id",user.id).maybeSingle()
    if(caller?.status!=="approved")return json({error:"Account non autorizzato"},403)
    const requestedTarget=String(body?.target_user_id||user.id),isSelf=requestedTarget===user.id
    if(!isSelf&&caller?.role!=="admin")return json({error:"Operazione riservata all’Amministratore"},403)
    if(!isSelf||caller?.role==="admin"){
      const {data:target}=await admin.from("profiles").select("status").eq("id",requestedTarget).maybeSingle()
      if(!target||target.status!=="approved")return json({error:"L’utente deve essere approvato prima di configurare l’accesso"},400)
    }

    if(action==="status"){
      const [{data:qr},{data:loginName},{data:target}]=await Promise.all([
        admin.from("qr_credentials").select("active,created_at,rotated_at,last_used_at").eq("user_id",requestedTarget).maybeSingle(),
        admin.from("login_usernames").select("username").eq("user_id",requestedTarget).maybeSingle(),
        admin.from("profiles").select("username,display_name,email").eq("id",requestedTarget).maybeSingle()
      ])
      return json({active:!!qr?.active,created_at:qr?.created_at||null,rotated_at:qr?.rotated_at||null,last_used_at:qr?.last_used_at||null,username:loginName?.username||target?.username||"",display_name:target?.display_name||target?.email||"Utente"})
    }
    if(action==="configure-username"){
      const username=String(body?.username||"").trim(),normalized=normalizeUsername(username)
      if(!validUsername(username))return json({error:"Usa da 3 a 30 caratteri: lettere, numeri, punto, trattino o underscore"},400)
      const {data:used}=await admin.from("login_usernames").select("user_id").eq("normalized_username",normalized).neq("user_id",requestedTarget).maybeSingle()
      if(used)return json({error:"Questo username è già utilizzato"},409)
      const stamp=new Date().toISOString()
      const {error}=await admin.from("login_usernames").upsert({user_id:requestedTarget,username,normalized_username:normalized,updated_at:stamp},{onConflict:"user_id"})
      if(error)throw error
      await admin.from("profiles").update({username}).eq("id",requestedTarget)
      return json({ok:true,username})
    }
    if(action==="generate"){
      const raw=token(),stamp=new Date().toISOString()
      const {data:loginName}=await admin.from("login_usernames").select("username").eq("user_id",requestedTarget).maybeSingle()
      if(!loginName?.username)return json({error:"Prima salva lo username dell’utente"},400)
      const {error}=await admin.from("qr_credentials").upsert({user_id:requestedTarget,token_hash:await hash(raw),active:true,created_at:stamp,rotated_at:stamp},{onConflict:"user_id"})
      if(error)throw error
      return json({token:raw,payload:`RL1:${raw}`,username:loginName.username})
    }
    if(action==="revoke"){
      await admin.from("qr_credentials").update({active:false,rotated_at:new Date().toISOString()}).eq("user_id",requestedTarget)
      return json({ok:true})
    }
    return json({error:"Azione non valida"},400)
  }catch(error){console.error(error);return json({error:"Servizio QR temporaneamente non disponibile"},500)}
})
