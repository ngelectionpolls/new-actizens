import {validateDonation,initializeDonation,siteUrl} from '../../../lib/payments.mjs';

export default async function handler(req,res){
 if(req.method!=='POST'){res.setHeader('Allow','POST');return res.status(405).json({error:'Method not allowed'});}
 const {donation,error}=validateDonation(req.body);
 if(error)return res.status(400).json({error});
 try{
  const {url,reference}=await initializeDonation(donation,siteUrl(req));
  return res.status(200).json({url,reference});
 }catch(e){
  console.error('Donation initialize failed:',donation.provider,e.message);
  return res.status(502).json({error:'We couldn’t reach the payment provider. Please try again or choose the other provider.'});
 }
}
