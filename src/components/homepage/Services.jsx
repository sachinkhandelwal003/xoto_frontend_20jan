import React from 'react'
import First from '../Service/First'
import Second from '../Service/Second'
import Third from '../Service/Third'
import  FOurth from '../Service/FOurth'
// import {  ChevronLeft, ChevronRight,  Star  } from 'lucide-react';
import  Buy6 from '../BuyRent/Buy6'
import Buy4 from '../BuyRent/Buy4'
import  Sixth from '../Service/Sixth'
const Service = () => {
  return (
    <div>
      {/* <h1>hello</h1> */}
      <First/>
      <Second/>
      <Third/>
      <Buy4 />
      {/* <FOurth/> */}
      <Buy6/>
       {/* <Fifth/> */}
           <Sixth/>
    </div>
  )
}

export default Service 
