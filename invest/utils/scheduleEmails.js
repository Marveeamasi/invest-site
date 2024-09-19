import { db } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import nodemailer from 'nodemailer';

// Email sending logic using Nodemailer
async function sendEmail(userEmail, currentAmount) {
  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'amasimarvellous@gmail.com', // Your email
      pass: 'vee120!!!' // Your email password
    }
  });

  let mailOptions = {
    from: 'amasimarvellous@gmail.com',
    to: userEmail,
    subject: '4Elevenfxtrade update',
    text: `Your current investment amount is: $${currentAmount.toFixed(2)}`
  };

  await transporter.sendMail(mailOptions);
}

// Schedule the weekly emails based on the plan
export default function scheduleEmails({ initialAmount, userEmail, plan, investmentId }) {
  let weeks = 0;
  let totalWeeks = 0;
  let interestRate = 0;

  switch (plan) {
    case 'student':
      totalWeeks = 2;
      interestRate = 0.10;
      break;
    case 'worker':
      totalWeeks = 4;
      interestRate = 0.12;
      break;
    case 'platinium':
      totalWeeks = 12;
      interestRate = 0.15;
      break;
    case 'retirement':
      totalWeeks = 52;
      interestRate = 0.20;
      break;
    default:
      totalWeeks = 0;
  }

  const intervalId = setInterval(async () => {
    if (weeks >= totalWeeks) {
      clearInterval(intervalId); // Stop the interval when the plan duration ends
      await updateDoc(doc(db, 'investments', investmentId), { durationElapsed: true });
      return;
    }

    weeks++;
    const newAmount = initialAmount * (1 + interestRate * weeks);

    // Update currentAmount in Firestore
    await updateDoc(doc(db, 'investments', investmentId), { currentAmount: newAmount });

    // Send an email with the updated currentAmount
    sendEmail(userEmail, newAmount);

    console.log(`Email sent to ${userEmail} with updated amount: ${newAmount}`);
  }, 7 * 24 * 60 * 60 * 1000); // 7 days in milliseconds
}
