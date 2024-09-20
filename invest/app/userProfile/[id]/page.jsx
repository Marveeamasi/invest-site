'use client'
import React, { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { auth, db } from '@/firebase';
import { updateProfile, deleteUser } from 'firebase/auth';
import moment from 'moment';

export default function page({ params }) {
  const userId = params.id;
  const [tempInitial, setTempInitial] = useState('');
  const [userData, setUserData] = useState({});
  const [currents, setCurrents] = useState([]);
  const [reward, setReward] = useState(0);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingReward, setIsEditingReward] = useState(false);
  const [isEditingCurrent, setIsEditingCurrent] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch user data and userCurrents, userReward collections
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', userId));
        const userCurrentsDoc = await getDoc(doc(db, 'userCurrents', userId));
        const userRewardDoc = await getDoc(doc(db, 'userRewards', userId));

        if (userDoc.exists()) setUserData(userDoc.data());
        if (userDoc.exists()) console.log(userDoc.data());
        if (userCurrentsDoc.exists()) setCurrents(userCurrentsDoc.data().currents || []);
        if (userCurrentsDoc.exists()) console.log(userCurrentsDoc.data().currents || []);
        if (userRewardDoc.exists()) setReward(userRewardDoc.data().rewards || 0);
        if (userRewardDoc.exists()) console.log(userRewardDoc.data().rewards || 0);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, [userId]);

  // Handle profile update
  const handleUpdateProfile = async () => {
    setLoading(true);
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, userData);
      await updateProfile(auth.currentUser, {
        displayName: userData.displayName,
        email: userData.email,
        phoneNumber: userData.phoneNumber,
        country: userData.country,
      });
      setIsEditingProfile(false);
      setLoading(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      setLoading(false);
    }
  };

  // Handle current update
  const handleUpdateCurrent = async (index) => {
    const updatedCurrents = [...currents];
    updatedCurrents[index] = {
      ...updatedCurrents[index], // Keep other properties unchanged
      initial: tempInitial, // Update only the 'initial' property
    };
    setCurrents(updatedCurrents);
  

    try {
        const userCurrentsRef = doc(db, 'userCurrents', userId);
        await updateDoc(userCurrentsRef, { currents: updatedCurrents });
        setIsEditingCurrent(null); // Close editing state
      } catch (error) {
        console.error('Error updating current:', error);
      }
    };

  // Handle reward update
  const handleUpdateReward = async () => {
    setLoading(true);
    try {
      const userRewardRef = doc(db, 'userRewards', userId);
      await updateDoc(userRewardRef, { rewards: reward });
      setIsEditingReward(false);
      setLoading(false);
    } catch (error) {
      console.error('Error updating reward:', error);
      setLoading(false);
    }
  };

  // Delete a current object from the currents array
  const handleDeleteCurrent = async (current) => {
    const updatedCurrents = currents.filter(c => c !== current);
    setCurrents(updatedCurrents);

    try {
      const userCurrentsRef = doc(db, 'userCurrents', userId);
      await updateDoc(userCurrentsRef, { currents: updatedCurrents });
    } catch (error) {
      console.error('Error deleting current:', error);
    }
  };

  // Delete user and associated collections
  const handleDeleteAccount = async () => {
    setLoading(true);
    try {
      await deleteDoc(doc(db, 'users', userId));
      await deleteDoc(doc(db, 'userCurrents', userId));
      await deleteDoc(doc(db, 'userWithdrawals', userId));
      await deleteDoc(doc(db, 'userTransactions', userId));
      await deleteDoc(doc(db, 'userRewards', userId));
      await deleteUser(auth.currentUser);
      console.log('User and all data deleted successfully');
      setLoading(false);
      window.location.href = '/'; // Redirect after delete
    } catch (error) {
      console.error('Error deleting account:', error);
      setLoading(false);
    }
  };

  return (
    <div>
         <div className='w-full flex justify-between items-center p-5 backdrop-blur-sm sticky top-0 sm:right-0'>
        <div className='flex flex-col gap-4'>
        <div className='flex gap-3 items-center'>
        <img src="/logo.png" alt="logo" className='sm:hidden w-6 h-auto rounded-full logo-glow' />
        <div className='capitalize font-extralight'>User Profile</div>
        </div>
        <hr className='w-20 h-[1px] bg-[#00eaff] opacity-[.2] max-sm:hidden'/>
        </div>
        <div className='cursor-pointer hover:opacity-75 rounded-lg border border-[#00eaff] text-col w-[70px] h-[30px] flex justify-center items-center text-sm font-bold'>Go Back</div>

    </div>
    <div className='p-5'>
      <div>
        <h2 className='text-col mb-5'>Profile</h2>
        {isEditingProfile ? (
          <div className='grid grid-cols-1 gap-2'>
            <input className='outline-none h-[40px] p-2 hover:bg-[#00eaff20] border border-[#00eaff20] rounded-md bg-transparent' placeholder='Username'
              type="text"
              value={userData.displayName}
              onChange={(e) => setUserData({ ...userData, displayName: e.target.value })}
            />
            <input className='outline-none h-[40px] p-2 hover:bg-[#00eaff20] border border-[#00eaff20] rounded-md bg-transparent' placeholder='Email'
              type="email"
              value={userData.email}
              onChange={(e) => setUserData({ ...userData, email: e.target.value })}
            />
            <input className='outline-none h-[40px] p-2 hover:bg-[#00eaff20] border border-[#00eaff20] rounded-md bg-transparent' placeholder='Phone'
              type="text"
              value={userData.phoneNumber}
              onChange={(e) => setUserData({ ...userData, phoneNumber: e.target.value })}
            />
             <input className='outline-none h-[40px] p-2 hover:bg-[#00eaff20] border border-[#00eaff20] rounded-md bg-transparent' placeholder='Country'
              type="text"
              value={userData.country}
              onChange={(e) => setUserData({ ...userData, country: e.target.value })}
            />
            <button className='p-2 hover:opacity-75 font-bold rounded-md text-black bg-[#00ffff80]' onClick={handleUpdateProfile}>Save</button>
            <button className='p-2 hover:opacity-75 font-bold rounded-md text-white border border-[#00ffff80]' onClick={() => setIsEditingProfile(false)}>Cancel</button>
          </div>
        ) : (
          <>
            <p>Username: <span className='text-[#a2a1ab]'>{userData.displayName}</span></p>
            <p>Email: <span className='text-[#a2a1ab]'>{userData.email}</span></p>
            <p>Phone: <span className='text-[#a2a1ab]'>{userData.phoneNumber}</span></p>
            <p>Country: <span className='text-[#a2a1ab]'>{userData.country}</span></p>
            <button className='p-2 hover:opacity-75 font-bold rounded-md text-black bg-[#00ffff80]' onClick={() => setIsEditingProfile(true)}>Edit Profile</button>
          </>
        )}
      </div>
      <div className='mt-10'>
        <h2 className='text-col mb-5'>User Currents</h2>
        <div className='grid sm:grid-cols-2 grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-2'>
        {currents.map((current, index) => (
          <div key={index}>
            {isEditingCurrent === index ? (
              <>
                <input className='outline-none h-[40px] p-2 hover:bg-[#00eaff20] border border-[#00eaff20] rounded-md bg-transparent' placeholder='New amount'
                  type="text"
                  value={tempInitial}
                  onChange={(e) => setTempInitial(e.target.value)}
                />
                <button className='p-2 hover:opacity-75 font-bold rounded-md text-black bg-[#00ffff80] ml-2' onClick={() => handleUpdateCurrent(index, currents[index].initial)}>Save</button>
                <button className='p-2 hover:opacity-75 font-bold rounded-md text-white border border-[#ffff0080] ml-2' onClick={() => setIsEditingCurrent(null)}>Cancel</button>
              </>
            ) : (
              < div className='p-2 rounded-md bg-[#00eaff05]'>
                 <p>User: <span className='text-[#a2a1ab]'>{current.user}</span></p>
                 <p>Plan: <span className='text-[#a2a1ab]'>{current.plan}</span></p>
                 <p>Date: <span className='text-[#a2a1ab]'>{moment(current.date.toDate()).calendar()}</span></p>
                 <p>Initial: <span className='text-[#a2a1ab]'>{current.initial}</span></p>
                <button className='p-2 hover:opacity-75 font-bold rounded-md text-black bg-[#00ffff80]' onClick={() => setIsEditingCurrent(index)}>Edit</button>
                <button className='p-2 hover:opacity-75 font-bold rounded-md text-black bg-[#ff00ff80] ml-2' onClick={() => handleDeleteCurrent(current)}>Delete</button>
              </div>
            )}
          </div>
        ))}
        </div>
      </div>
      <div className='mt-10'>
        <h2 className='text-col mb-5'>User Rewards</h2>
        {isEditingReward ? (
          <>
            <input className='outline-none h-[40px] p-2 hover:bg-[#00eaff20] border border-[#00eaff20] rounded-md bg-transparent' placeholder=''
              type="number"
              value={reward}
              onChange={(e) => setReward(e.target.value)}
            />
            <button className='p-2 hover:opacity-75 font-bold rounded-md text-black bg-[#00ffff80] ml-2' onClick={handleUpdateReward}>Save</button>
            <button className='p-2 hover:opacity-75 font-bold rounded-md text-white border border-[#00ffff80] ml-2' onClick={() => setIsEditingReward(false)}>Cancel</button>
          </>
        ) : (
          <>
            <p>Reward: <span className='text-[#a2a1ab]'>{reward}</span></p>
            <button className='p-2 hover:opacity-75 font-bold rounded-md text-black bg-[#00ffff80]' onClick={() => setIsEditingReward(true)}>Edit Reward</button>
          </>
        )}
      </div>
      <div>
        <button className='p-2 hover:bg-[#ff00ff] hover:animate-none font-bold rounded-md text-black bg-[#ff00ff80] mt-40 animate-pulse' onClick={handleDeleteAccount}>Delete This User's Account</button>
      </div>
      </div>
      {loading && <div className='w-screen h-screen fixed z-[1111] flex justify-center items-center bg-[#000000ea]'>
        <img src="/loader.svg" alt="loading.."/></div>}
    </div>
  );
}
