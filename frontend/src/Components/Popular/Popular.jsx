import React, { useEffect, useState } from 'react'
import './Popular.css'
// import data_product from '../Assets/data'
import Item from '../Item/Item'
import { getApiUrl } from '../../config'

const Popular = () => {

    const [popularProducts,setPopularProducts]=useState([]);
    useEffect(()=>{
        fetch(getApiUrl('/popularinwomen'))
        .then((response)=>{
            if (!response.ok) throw new Error(`Popular products request failed (${response.status}).`);
            return response.json();
        })
        .then((data)=>setPopularProducts(data))
        .catch((error)=>console.error("Could not load popular products:", error));

    },[])
    return (
        <div className='popular'>
            <h1>POPULAR IN WOMEN</h1>
            <hr />
            <div className="popular-item">
                {popularProducts.map((item,i)=>{
                    return <Item key={i} id={item.id} name={item.name}  image={item.image} new_price={item.new_price} old_price={item.old_price}/>
                })}
            </div>
            
        </div>
    )
}

export default Popular
