
import React from 'react';
import Image from 'next/image';

const Logo = () => (
  <Image
    src="/ayv_lg.svg"
    alt="A&V Alturas Logo"
    width={150}
    height={42}
    data-ai-hint="logo"
    priority
  />
);

export default Logo;
