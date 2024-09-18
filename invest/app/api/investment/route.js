import { db } from '@/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { NextResponse } from 'next/server';
import scheduleEmails from '@/utils/scheduleEmails';

export async function POST(request) {
  const { initialAmount, createdAtDate, userEmail, plan } = await request.json();

  try {
    // Save the investment data in Firestore
    const investmentRef = await addDoc(collection(db, 'investments'), {
      initialAmount: parseFloat(initialAmount),
      currentAmount: parseFloat(initialAmount), // Initially the same as initialAmount
      createdAtDate,
      userEmail,
      plan,
      durationElapsed: false // Track if the plan duration is complete
    });

    // Schedule weekly email updates
    scheduleEmails({
      initialAmount,
      createdAtDate,
      userEmail,
      plan,
      investmentId: investmentRef.id // Pass the Firestore ID to track the investment
    });

    return NextResponse.json({ message: 'Investment created and emails scheduled.' }, { status: 200 });
  } catch (error) {
    console.error('Error creating investment:', error);
    return NextResponse.json({ message: 'Error creating investment.' }, { status: 500 });
  }
}
