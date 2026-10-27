import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from 'npm:@supabase/supabase-js@2'
import webpush from 'npm:web-push@3.6.7'

const cors={
  'Access-Control-Allow-Origin':'*',
  'Access-Control-Allow-Headers':'authorization, x-client-info, apikey, content-type',
}

export default {
async fetch(req:Request){
  if(req.method==='OPTIONS')return new Response('ok',{headers:cors})
  try{
    const url=Deno.env.get('SUPABASE_URL')!,anon=Deno.env.get('SUPABASE_ANON_KEY')!,serviceKey=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const authorization=req.headers.get('Authorization')||''
    const userClient=createClient(url,anon,{global:{headers:{Authorization:authorization}}})
    const {data:{user},error:userError}=await userClient.auth.getUser()
    if(userError||!user)return new Response('Non autorizzato',{status:401,headers:cors})

    const {events=[]}=await req.json()
    if(!Array.isArray(events)||!events.length)return Response.json({sent:0},{headers:cors})
    const event=events[events.length-1],extra=events.length>1?` (+${events.length-1})`:'',recipientUserId=String(event.recipientUserId||'')
    const admin=createClient(url,serviceKey)
    const {data:sender}=await admin.from('profiles').select('status,role,display_name').eq('id',user.id).single()
    const accessRequest=events.length===1&&event.kind==='access-request'
    if(accessRequest){
      if(sender?.status!=='pending')return new Response('Richiesta non valida',{status:403,headers:cors})
      const recentCutoff=new Date(Date.now()-10*60*1000).toISOString()
      const {data:alreadySent,error:historyError}=await admin.from('activity_log').select('id').eq('user_id',user.id).eq('event_kind','access-request').gte('created_at',recentCutoff).limit(1)
      if(historyError)throw historyError
      if(alreadySent?.length)return Response.json({sent:0,reason:'recently-notified'},{headers:cors})
    }else if(sender?.status!=='approved')return new Response('Accesso non approvato',{status:403,headers:cors})

    const text=String(event.text||'')
    const newBottle=text.includes('Produzione iniziata')||text.includes('Inizio carico codice')||text.includes('Codice cambiato')
    const ctPriority=newBottle||text.includes('Pre-raclage chiamato')||text.includes('Raclage chiamato')||text.includes('Scarico linea in corso')||text.includes('Linea riportata a riposo')
    const operatorPriority=text.includes('preso in carico')||text.includes('Disponibilità:')||text.includes('Big bag aggiuntivo caricato')||text.includes('pezzi avanzati')||text.includes('Linea completamente pulita')||text.includes('Obiettivo raggiunto')||text.includes('Passaggio consegne')
    const isManagement=['admin','ct','vice_ct','processista','direttore'].includes(sender.role),canAssign=['admin','ct','vice_ct','direttore'].includes(sender.role)
    if(recipientUserId&&(!canAssign||event.kind!=='assignment'))return new Response('Destinatario non autorizzato',{status:403,headers:cors})
    const adminOnly=!accessRequest&&!recipientUserId&&!newBottle&&!(isManagement?ctPriority:operatorPriority)

    const [{data:approved,error:profilesError},{data:settings,error:settingsError}]=await Promise.all([
      admin.from('profiles').select('id,role').eq('status','approved'),
      admin.from('shared_state').select('payload').eq('id',1).single(),
    ])
    if(profilesError)throw profilesError
    if(settingsError)throw settingsError
    const notificationUsers=(settings?.payload as {notificationUsers?:Record<string,boolean>}|null)?.notificationUsers||{}
    const managementRoles=['admin','ct','vice_ct','processista','direttore']
    const candidates=(approved||[]).filter((p:{id:string,role:string})=>p.id!==user.id).filter((p:{id:string,role:string})=>{
      if(accessRequest)return p.role==='admin'
      if(recipientUserId)return p.id===recipientUserId||p.role==='admin'
      if(adminOnly)return p.role==='admin'
      if(!isManagement&&!newBottle)return managementRoles.includes(p.role)
      return true
    })
    const ids=[...new Set(candidates.filter((p:{id:string,role:string})=>p.role==='admin'||notificationUsers[p.id]!==false).map((p:{id:string})=>p.id))]
    if(!ids.length)return Response.json({sent:0},{headers:cors})
    const {data:subscriptions,error:subscriptionsError}=await admin.from('push_subscriptions').select('*').in('user_id',ids)
    if(subscriptionsError)throw subscriptionsError

    webpush.setVapidDetails('mailto:andreafalzone91@live.it',Deno.env.get('VAPID_PUBLIC_KEY')!,Deno.env.get('VAPID_PRIVATE_KEY')!)
    const who=sender.display_name||'Nuovo utente'
    const notificationTag=accessRequest?`access-${event.id||crypto.randomUUID()}`:`event-${event.id||crypto.randomUUID()}`
    const payload=JSON.stringify(accessRequest
      ?{title:'SerioFlow · Richiesta di accesso',body:`${who} chiede di accedere all’app`,line:'Accessi',tag:notificationTag,url:'./'}
      :{title:`SerioFlow · Linea ${event.line}`,body:`${who}: ${event.text}${extra}`,line:event.line,tag:notificationTag,url:'./'})
    const expired:number[]=[]
    const results=await Promise.allSettled((subscriptions||[]).map(async(s:any)=>{
      try{await webpush.sendNotification({endpoint:s.endpoint,keys:{p256dh:s.p256dh,auth:s.auth}},payload)}
      catch(error:any){if(error?.statusCode===404||error?.statusCode===410)expired.push(s.id);else throw error}
    }))
    if(expired.length)await admin.from('push_subscriptions').delete().in('id',expired)
    const sent=results.filter(r=>r.status==='fulfilled').length,failed=results.filter(r=>r.status==='rejected').length
    if(accessRequest&&sent)await admin.from('activity_log').insert({id:crypto.randomUUID(),line:'Accessi',event_text:'Richiesta di accesso notificata all’Amministratore',actor_name:who,event_kind:'access-request',created_at:new Date().toISOString(),user_id:user.id})
    return Response.json({sent,failed},{headers:cors})
  }catch(error){return Response.json({error:String(error)},{status:500,headers:cors})}
}
}
