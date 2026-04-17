import React, { useState } from 'react'
import { useEffect } from 'react'
import { useLocation } from "react-router-dom";
// import React from 'react'
import Buy1 from '../BuyRent/Buy1'
import Buy3 from '../BuyRent/Buy3'
import Buy4 from '../BuyRent/Buy4'
import Buy5 from '../BuyRent/Buy5'
import Buy6 from '../BuyRent/Buy6'
// import Buy2 from '../BuyRent/Buy2'
import Buy2 from '../BuyRent/Buy2'
import HeroRent from "./../../component/Rent/HeroRent"

import Buy7 from '../BuyRent/Buy7'
const Buy = () => {
    const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const el = document.getElementById(location.hash.replace("#", ""));
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [location]);
  const [openSellModal, setOpenSellModal] = useState(false);
  return (
    <div>
      <Buy1 
  openSellModal={openSellModal} 
  setOpenSellModal={setOpenSellModal}
/>
      {/* <Buy2/> */}
         <Buy3/>
         <HeroRent onSellClick={() => setOpenSellModal(true)} />
                  <Buy4/>
                  <Buy5/>
                  <Buy6/>
                   <Buy7/>
  
   </div>
  )
}

export default Buy
