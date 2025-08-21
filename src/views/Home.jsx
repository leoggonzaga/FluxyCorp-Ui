import React, { useState } from "react"
import DrawnTeste from "./DrawnTeste"
import ImageMapper from 'react-img-mapper'
import FaceChart from "./FaceChart"

const Home = () => {

    return (
        <div>Home
            
            <FaceChart/>

            {/* <div className='bg-gray-200'>
                <DrawnTeste className='h-[500px] w-[500px]'/>
            </div> */}

        </div>
    )
}

export default Home
