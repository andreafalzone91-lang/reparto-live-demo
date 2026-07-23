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

    const admin=createClient(url,serviceKey)
    const {data:sender}=await admin.from('profiles').select('status,role,display_name').eq('id',user.id).single()
    if(sender?.status!=='approved')return new Response('Accesso non approvato',{status:403,headers:cors})

    const {events=[]}=await req.json()
    if(!Array.isArray(events)||!events.length)return Response.json({sent:0},{headers:cors})
    const event=events[events.length-1],extra=events.length>1?` (+${events.length-1})`:''
    const text=String(event.text||'')
    const newBottle=text.includes('Produzione iniziata')||text.includes('Inizio carico codice')||text.includes('Codice cambiato')
    const ctPriority=newBottle||text.includes('Pre-raclage chiamato')||text.includes('Raclage chiamato')||text.includes('Scarico linea in corso')||text.includes('Linea riportata a riposo')
    const operatorPriority=text.includes('preso in carico')||text.includes('Disponibilità:')||text.includes('Big bag aggiuntivo caricato')||text.includes('pezzi avanzati')||text.includes('Linea completamente pulita')||text.includes('Obiettivo raggiunto')||text.includes('Passaggio consegne')
    const isManagement=['admin','ct','vice_ct'].includes(sender.role)
    if(!(newBottle||(isManagement?ctPriority:operatorPriority)))return Response.json({sent:0,reason:'non-priority'},{headers:cors})

    let recipients=admin.from('profiles').select('id').eq('status','approved').neq('id',user.id)
    if(!isManagement&&!newBottle)recipients=recipients.in('role',['ct','vice_ct','admin'])
    const [{data:approved,error:profilesError},{data:settings,error:settingsError}]=await Promise.all([
      recipients,
      admin.from('shared_state').select('payload').eq('id',1).single(),
    ])
    if(profilesError)throw profilesError
    if(settingsError)throw settingsError
    const notificationUsers=(settings?.payload as {notificationUsers?:Record<string,boolean>}|null)?.notificationUsers||{}
    const ids=(approved||[]).map((p:{id:string})=>p.id).filter((id:string)=>notificationUsers[id]!==false)
    if(!ids.length)return Response.json({sent:0},{headers:cors})
    const {data:subscriptions,error:subscriptionsError}=await admin.from('push_subscriptions').select('*').in('user_id',ids)
    if(subscriptionsError)throw subscriptionsError

    webpush.setVapidDetails('mailto:andreafalzone91@live.it',Deno.env.get('VAPID_PUBLIC_KEY')!,Deno.env.get('VAPID_PRIVATE_KEY')!)
    const who=sender.display_name||'Utente'
    const payload=JSON.stringify({title:`Reparto Live · Linea ${event.line}`,body:`${who}: ${event.text}${extra}`,line:event.line})
    const expired:number[]=[]
    const results=await Promise.allSettled((subscriptions||[]).map(async(s:any)=>{
      try{await webpush.sendNotification({endpoint:s.endpoint,keys:{p256dh:s.p256dh,auth:s.auth}},payload)}
      catch(error:any){if(error?.statusCode===404||error?.statusCode===410)expired.push(s.id);else throw error}
    }))
    if(expired.length)await admin.from('push_subscriptions').delete().in('id',expired)
    return Response.json({sent:results.filter(r=>r.status==='fulfilled').length,failed:results.filter(r=>r.status==='rejected').length},{headers:cors})
  }catch(error){return Response.json({error:String(error)},{status:500,headers:cors})}
}
}
