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

    const templateParamsForAccept = {
      from_name: '4Elevenfxtrade',
      to_name: user? user?.substring(0,6) : '',
      reply_to: "amasimarvellous@gmail.com",
      plan_name: plan,
      to_email: user,
      message: `Your withdrawal of ${amount} has been approved, incase you haven't been credited in less than 23 hrs please contact our customer service: 4elevenfxtrade@gmail.com`,
    };
  
    const templateParamsForReject = {
      from_name: '4Elevenfxtrade',
      to_name: user? user?.substring(0,6) : '',
      reply_to: "amasimarvellous@gmail.com",
      plan_name: plan,
      to_email: user,
      message: `Your withdrawal of ${amount} failed, please contact our customer service: 4elevenfxtrade@gmail.com`,
    };
  

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

    const handleReject = async () => {
       try{ if (!selectedData) return;
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
      }catch(err){
        console.log(err)
      }
      };

      const handleAccept = async() => {
       try{ if (!selectedData) return;
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
          await deleteCurrent(userId, id);
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
      }catch(err){
        console.log(err)
      }
       }

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
