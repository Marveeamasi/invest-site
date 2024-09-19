'use client'
import { db } from '@/firebase';
import {doc, getDoc, onSnapshot, Timestamp, updateDoc} from 'firebase/firestore';
import moment from 'moment';
import React, { useEffect, useState } from 'react'
import { IoMdThumbsUp } from "react-icons/io";
import { IoHandLeft } from "react-icons/io5";
import { IoMdThumbsDown } from "react-icons/io";
import emailjs from '@emailjs/browser';

export default function With({plan, status,amount,date,id,userId,user,address,payOption, setLoading}) {
    const [textCol, setTextCol] = useState('')
    useEffect(()=>{
        if(status==='approved'){
            setTextCol("text-[#00ffff80]");
        }else if(status==='pending'){
             setTextCol("text-[#ffff0080]");
        }else if(status==='failed'){
            setTextCol("text-[#ff00ff80]");
        }
    },[status])

    const selectedData = {
      plan: plan,
      status: status,
      amount: amount,
      date: date,
      userId: userId,
      id:id,
      address: address,
      payOption: payOption,
      user: user,
  }

    const templateParamsForAccept = {
        from_name: '4Elevenfxtrade',
        reply_to: 'amasimarvellous@gmail.com',
        to_email: user? user : 'amasimarvellous@gmail.com',
        page_to: 'dashboard',
        type: 'notification from 4Elevenfxtrade',
        message: `Your withdrawal of ${amount} from ${plan} has been approved, incase you haven't been credited in less than 23 hrs please contact our customer service: 4elevenfxtrade@gmail.com`, 
    };
  
    const templateParamsForReject = {
      from_name: '4Elevenfxtrade',
        reply_to: 'amasimarvellous@gmail.com',
        to_email: user? user : 'amasimarvellous@gmail.com',
        page_to: 'dashboard',
        type: 'notification from 4Elevenfxtrade',
        message: `Your withdrawal of ${amount} from ${plan} failed, please contact our customer service: 4elevenfxtrade@gmail.com`, 
     };
  
    const handleReject = async () => {
      if (!selectedData) return;
      setLoading(true);
      
      // Update Firestore first
      try {
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
        
        await updateDoc(requestRef, { withdrawals: updatedRequests });
        console.log('Firestore updated successfully');
      } catch (error) {
        setLoading(false);
        alert('Error updating Firestore for rejecting withdrawal:', error);
        return; // Stop execution if Firestore update fails
      }
    
      // Send email
      try {
        await emailjs.send(
          'service_ao75urn',
        'template_tdpbxb7', 
        templateParamsForReject,
        'MIRKY7yUv_4VJdUdi' 
        );
        console.log('Email sent successfully');
      } catch (error) {
        alert('Error sending rejection email:', error);
      } finally {
        setLoading(false);
        alert('Withdrawal rejected successfully');
      }
    };
    
    const handleAccept = async () => {
      if (!selectedData) return;
      setLoading(true);
    
      // Update Firestore
      try {
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
        
        await updateDoc(requestRef, { withdrawals: updatedRequests });
        
        async function deleteCurrent(userId, currentId) {
          const currentRef = doc(db, 'userCurrents', userId);
          const userCurrents = await getDoc(currentRef);
          const currents = userCurrents.data().currents;
          const updatedCurrents = currents.filter(c => c.id !== currentId);
          await updateDoc(currentRef, { currents: updatedCurrents });
        }
        await deleteCurrent(userId, id);
        
        console.log('Firestore updated and current deleted successfully');
      } catch (error) {
        setLoading(false);
        alert('Error updating Firestore for accepting withdrawal:', error);
        return; // Stop execution if Firestore update fails
      }
    
      // Send email
      try {
        await emailjs.send(
          'service_ao75urn',
          'template_tdpbxb7', 
          templateParamsForAccept,
          'MIRKY7yUv_4VJdUdi' 
        );
        console.log('Email sent successfully');
      } catch (error) {
        alert('Error sending approval email:', error);
      } finally {
        setLoading(false);
        alert('Withdrawal accepted successfully');
      }
    };
    
  return (
    <div className='grid grid-cols-4 p-3 text-sm gap-2 font-[200] bg-[rgb(0,234,255,0.01)] rounded-lg max-xsm:text-[11px]'>
        <a href={"mailto:" + user + "?subject=" + encodeURIComponent("Update from 4Elevenfxtrade") + "&body=" + encodeURIComponent("Hi"+user?.substring(0,6))}>{user}</a>
        <div>{plan.substring(0,7)}</div>
        <div>${amount.toLocaleString()}</div>
       {address && <div>{address}</div>}
        {payOption && <div>{payOption}</div>}
       {status==='approved' && <IoMdThumbsUp className={`${textCol} text-xl`}/>}
       {status==='pending' && <IoHandLeft className={`${textCol}  text-xl`}/>}
       {status==='failed' && <IoMdThumbsDown className={`${textCol}  text-xl`}/>}
       <div>{moment(date.toDate()).calendar()}</div>
      {status === 'pending' && <div className='p-5 flex justify-start items-center gap-5'>
       <button className='p-2 w-20 rounded-md accept-btn text-black hover:opacity-75 font-bold' onClick={handleAccept}>Accept</button>
       <button className='p-2 w-20 rounded-md reject-btn text-black hover:opacity-75 font-bold' onClick={handleReject}>Reject</button>
       </div>}
    </div>
  )
}
