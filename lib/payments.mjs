// Server-only helpers for donation checkout. Secret keys never leave the server:
// the browser receives a hosted checkout link and returns through /api/donations/verify/.
import {randomBytes} from 'node:crypto';

export const providers=['paystack','flutterwave'];
export const supportAreas=['General Support','Election Integrity & NGElectionPolls','BSF & Sustainable Agriculture','Youth & Community Development'];
export const MIN_AMOUNT=100, MAX_AMOUNT=10_000_000;
const channels={
 paystack:{'Card Payment':['card'],'Bank Transfer':['bank_transfer','bank'],'USSD':['ussd'],'Mobile Money / Wallets':['mobile_money','qr']},
 flutterwave:{'Card Payment':'card','Bank Transfer':'banktransfer,account','USSD':'ussd','Mobile Money / Wallets':undefined},
};

export function validateDonation(body={}){
 const amount=Math.round(Number(body.amount)*100)/100;
 const email=String(body.email||'').trim();
 const name=String(body.name||'').trim().slice(0,100);
 const provider=String(body.provider||'');
 const support=supportAreas.includes(body.support)?body.support:'General Support';
 const method=channels.paystack[body.method]?body.method:'Card Payment';
 if(!providers.includes(provider))return {error:'Choose Paystack or Flutterwave.'};
 if(!Number.isFinite(amount)||amount<MIN_AMOUNT||amount>MAX_AMOUNT)return {error:`Enter an amount between ₦${MIN_AMOUNT} and ₦${MAX_AMOUNT.toLocaleString('en-NG')}.`};
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||email.length>254)return {error:'Enter a valid email address.'};
 return {donation:{amount,email,name,provider,support,method}};
}

export function siteUrl(req){
 if(process.env.SITE_URL)return process.env.SITE_URL.replace(/\/$/,'');
 const proto=req.headers['x-forwarded-proto']?.split(',')[0]||'http';
 return `${proto}://${req.headers['x-forwarded-host']||req.headers.host}`;
}

function secret(provider){
 const key=process.env[provider==='paystack'?'PAYSTACK_SECRET_KEY':'FLUTTERWAVE_SECRET_KEY'];
 if(!key)throw new Error(`${provider} secret key is not configured`);
 return key;
}

async function call(provider,path,init={}){
 const base=provider==='paystack'?'https://api.paystack.co':'https://api.flutterwave.com/v3';
 const response=await fetch(base+path,{...init,headers:{Authorization:`Bearer ${secret(provider)}`,'Content-Type':'application/json',...init.headers},signal:AbortSignal.timeout(20000)});
 const data=await response.json().catch(()=>({}));
 if(!response.ok||data.status===false||data.status==='error')throw new Error(data.message||`${provider} request failed (${response.status})`);
 return data.data;
}

export async function initializeDonation(donation,base){
 const reference=`ASIF-${Date.now()}-${randomBytes(4).toString('hex')}`;
 const callback=`${base}/api/donations/verify/${donation.provider}/`;
 const meta={donor_name:donation.name,support_area:donation.support,payment_method:donation.method};
 if(donation.provider==='paystack'){
  const data=await call('paystack','/transaction/initialize',{method:'POST',body:JSON.stringify({email:donation.email,amount:Math.round(donation.amount*100),currency:'NGN',reference,callback_url:callback,channels:channels.paystack[donation.method],metadata:{...meta,custom_fields:[{display_name:'Supporting',variable_name:'support_area',value:donation.support}]}})});
  return {url:data.authorization_url,reference};
 }
 const data=await call('flutterwave','/payments',{method:'POST',body:JSON.stringify({tx_ref:reference,amount:donation.amount,currency:'NGN',redirect_url:callback,payment_options:channels.flutterwave[donation.method],customer:{email:donation.email,name:donation.name||undefined},customizations:{title:'Actizens Social Impact Foundation',description:`Donation: ${donation.support}`,logo:`${base}/assets/f07f3.png`},meta})});
 return {url:data.link,reference};
}

// Always confirm with the provider; never trust the status in the redirect query string.
export async function verifyDonation(provider,reference){
 if(provider==='paystack'){
  const data=await call('paystack',`/transaction/verify/${encodeURIComponent(reference)}`);
  return {paid:data.status==='success'&&data.currency==='NGN',status:data.status,amount:data.amount/100,reference:data.reference,support:data.metadata?.support_area};
 }
 const data=await call('flutterwave',`/transactions/verify_by_reference?tx_ref=${encodeURIComponent(reference)}`);
 return {paid:data.status==='successful'&&data.currency==='NGN'&&data.tx_ref===reference,status:data.status,amount:data.amount,reference:data.tx_ref,support:data.meta?.support_area};
}
