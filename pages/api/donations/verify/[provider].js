import {providers,verifyDonation} from '../../../../lib/payments.mjs';

// Paystack returns ?reference=…; Flutterwave returns ?tx_ref=…&status=….
export default async function handler(req,res){
 const {provider}=req.query;
 const reference=String(req.query.reference||req.query.trxref||req.query.tx_ref||'');
 const back=params=>res.redirect(303,'/donate/?'+new URLSearchParams({provider,...params}));
 if(!providers.includes(provider)||!/^ASIF-[\w-]{1,60}$/.test(reference))return back({payment:'failed'});
 if(req.query.status==='cancelled')return back({payment:'cancelled',reference});
 try{
  const result=await verifyDonation(provider,reference);
  return back(result.paid?{payment:'success',reference,amount:String(result.amount),...(result.support?{support:result.support}:{})}:{payment:'failed',reference});
 }catch(e){
  console.error('Donation verify failed:',provider,reference,e.message);
  return back({payment:'pending',reference});
 }
}
