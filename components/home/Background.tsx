import React from 'react';

export const Background: React.memo(() => (
  <>
    <div className="absolute top-0 left-0 w-full h-[50vh] bg-gradient-to-b from-primary-50/80 via-cream to-cream pointer-events-none" />
    <div className="absolute top-[-5%] right-[-10%] w-64 h-64 bg-pink-100 rounded-full blur-3xl opacity-40 animate-breathe pointer-events-none" />
    <div className="absolute top-[20%] left-[-10%] w-48 h-48 bg-mint-100 rounded-full blur-3xl opacity-30 animate-float pointer-events-none" />
  </>
));



