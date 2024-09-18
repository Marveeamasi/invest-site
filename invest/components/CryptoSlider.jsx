'use client'
import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function CryptoSlider() {
  const [cryptoData, setCryptoData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCryptoData = async () => {
      try {
        const response = await axios.get('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=7d');
        setCryptoData(response.data);
      } catch (error) {
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    fetchCryptoData();
  }, []);

  if (loading) {
    return <div className='w-full flex items-center justify-center font-bold text-col dark-bg bg-[#000]'>Loading...</div>;
  }

  if (error) {
    return <div className='w-full flex items-center justify-center font-bold text-col dark-bg bg-[#000]'>Please check you internet connection</div>;
  }

  return (
    <div className='bg-[#000000e0]'>
    <marquee direction="left" scrollamount="5" loop="infinite" behavior="alternate">
      <div className='flex justify-center gap-10 items-center'>
      {cryptoData.map((coin) => (
        <div key={coin.id} className='p-3 flex justify-center bg-[#000000] items-center flex-col gap-4 shadow-glow-mild rounded-lg'>
          <img src={coin.image} alt={coin.name} className='w-8 rounded-full h-auto bg'/>
          <div className='text-sm text-col font-bold'>{coin.name}</div>
          <p>${coin.current_price}</p>
        </div>
      ))}
      </div>
    </marquee> 
    </div>
  );

}
