'use client'
import { db } from '@/firebase';
import {doc, getDoc, onSnapshot, Timestamp, updateDoc} from 'firebase/firestore';
import React, { useEffect, useState } from 'react'
import moment from 'moment';
import emailjs from '@emailjs/browser';

export default function page({params}) {
    const userId = params.id.split("__")[1];
    const currentId = params.id.split("__")[0];
    const[loading, setLoading] = useState(false);
    const [selectedData, setSelectedData] = useState(null);

  useEffect(() => {
    const unSub = onSnapshot(doc(db, 'userWithdrawals', userId), (doc) => {
      if (doc.exists()) {
        const requests = doc.data().withdrawals; 
        const selected = requests.filter((r) => r.id === currentId)[0];
        setSelectedData(selected);
      } else {
        console.error("User withdrawal document not found");
      }
    }, (error) => {
      console.error("Error fetching withdrawals data:", error);
    });

    return () => unSub();
  }, [userId, currentId]);

  const templateParamsForAccept = {
    from_name: '4Elevenfxtrade',
    to_name: selectedData?.user.substring(0,6),
    reply_to: "amasimarvellous@gmail.com",
    plan_name: selectedData?.plan,
    to_email: selectedData?.user,
    message: `Your withdrawal of ${selectedData?.amount} has been approved, incase you haven't been credited in less than 23 hrs please contact our customer service: 4elevenfxtrade@gmail.com`,
  };

  const templateParamsForReject = {
    from_name: '4Elevenfxtrade',
    to_name: selectedData?.user.substring(0,6),
    reply_to: "amasimarvellous@gmail.com",
    plan_name: selectedData?.plan,
    to_email: selectedData?.user,
    message: `Your withdrawal of ${selectedData?.amount} failed, please contact our customer service: 4elevenfxtrade@gmail.com`,
  };

  const handleReject = async () => {
    if (!selectedData) return;
    setLoading(true);
    const updatedRequest = {
      ...selectedData,
      status: 'failed',
      date: Timestamp.now(),
    };
  
    const requestRef = doc(db, 'userWithdrawals', userId);
    const userTransaction = await getDoc(requestRef);
    const requests = userTransaction.data().withdrawals;
    const updatedRequests = requests.map((request) =>
      request.id === selectedData.id ? updatedRequest : request
    ); 
  
    try {
      await updateDoc(requestRef, { withdrawals: updatedRequests });
      await emailjs.send(
        'service_fdte8n3',
        'template_2b020nd', 
        templateParamsForReject,
        'GxMdpSXPSUwGus6Ls' 
      )
      setLoading(false);
      alert('Withdrawal rejected successfully');
    } catch (error) {
      setLoading(false);
      alert('Error rejecting withdrawal:', error);
    }
  };

   const handleAccept = async() => {
    if (!selectedData) return;
    setLoading(true);
    const updatedRequest = {
      ...selectedData,
      status: 'approved',
      date: Timestamp.now(),
    };
  
    const requestRef = doc(db, 'userWithdrawals', userId);
    const userTransaction = await getDoc(requestRef);
    const requests = userTransaction.data().withdrawals;
    const updatedRequests = requests.map((request) =>
      request.id === selectedData.id ? updatedRequest : request
    ); 
  
    try {
      await updateDoc(requestRef, { withdrawals: updatedRequests });
      async function deleteCurrent(userId, currentId) {
        const currentRef = doc(db, 'userCurrents', userId);
        const userCurrents = await getDoc(currentRef);
        const currents = userCurrents.data().currents;
        const updatedCurrents = currents.filter(c=> c.id !== currentId);
        await updateDoc(currentRef, { currents: updatedCurrents });
      }
      await deleteCurrent(userId, currentId);
      await emailjs.send(
        'service_fdte8n3',
        'template_2b020nd', 
        templateParamsForAccept,
        'GxMdpSXPSUwGus6Ls' 
      )
      setLoading(false);
      alert('Withdrawal accepted successfully');
      
    } catch (error) {
      setLoading(false);
      alert('Error accepting withdrawal:', error);
      console.log(error)
    } 
   }

  return (
    <div className='flex flex-col gap-5 p-10 max-sm:items-center w-full'>
      <h1 className='text-2xl mb-10'>Withdrawal by {selectedData?.user ? selectedData?.user : '...'}</h1>
      <div className='flex flex-col gap-5 max-sm:items-center p-10 rounded-lg'>
       <div className='w-full text-[#eee]'><b>Plan:</b> <i className='capitalize'>{selectedData?.plan ? selectedData?.plan : '...'}</i></div>
       <div className='w-full text-[#eee]'><b>Status:</b> <i className='capitalize'>{selectedData?.status ? selectedData?.status : '...'}</i></div>
       <div className='w-full text-[#eee]'><b>Amount:</b> <i className=''>${selectedData?.amount ? selectedData?.amount : '...'}</i></div>
       <div className='w-full text-[#eee]'><b>Date:</b> <i className=''>{selectedData?.date ? moment(selectedData?.date.toDate()).calendar() : '...'}</i></div>
      </div>
   {selectedData?.status === 'pending' && <div className='grid grid-cols-2 gap-5'>
    <button onClick={handleReject} className='text-col border border-[#00eaff] font-bold rounded-lg p-5 hover:opacity-75'>Reject</button>
    <button onClick={handleAccept} className='text-black bg-col font-bold rounded-lg p-5 hover:opacity-75'>Accept</button>
   </div>

   }
     {loading && <div className='w-screen h-screen fixed z-[1111] flex justify-center items-center bg-[#000000ea]'>
      <img src="/loader.svg" alt="loading.."/></div>}
    </div>
  )
}
