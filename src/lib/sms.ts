import twilio from "twilio";
const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);

export async function sendSMSAlert(phone: string, message: string) {
  await client.messages.create({ body: message, from: "+123456789", to: phone });
}