import React, { useState } from 'react'
import './AddProduct.css'
import upload_area from '../../assets/upload_area.svg'
import { getApiUrl } from '../../config'

const AddProduct = () => {
    const [image,setImage]=useState(false);
    const [error,setError]=useState("");
    const [productDetails,setProductDetals]=useState({
        name:"",
        image:"",
        category:"women",
        new_price:"",
        old_price:""
    })


    const imageHandler=(e)=>{
        setImage(e.target.files[0]);

    }
    const changeHandler=(e)=>{
        setProductDetals({...productDetails,[e.target.name]:e.target.value})
    }

    const Add_Product=async ()=>{
        setError("");
        if (!image) {
            setError("Choose a product image before adding the product.");
            return;
        }
        try {
            const formData=new FormData();
            formData.append('image',image);
            const uploadResponse = await fetch(getApiUrl('/upload'),{
                method:'POST',
                credentials:'include',
                body:formData,
            });
            const responseData = await uploadResponse.json();
            if (!uploadResponse.ok) {
                throw new Error(responseData.errors || `Image upload failed (${uploadResponse.status}).`);
            }
            if(responseData.success) {
                const addResponse = await fetch(getApiUrl('/addproduct'),{
                    method:'POST',
                    credentials:'include',
                    headers:{
                        Accept:'application/json',
                        'Content-Type':'application/json',
                    },
                    body:JSON.stringify({ ...productDetails, image: responseData.image_url }),
                });
                const data = await addResponse.json();
                if (!addResponse.ok || !data.success) {
                    throw new Error(data.errors || `Product creation failed (${addResponse.status}).`);
                }
                alert("Product Added");
            }
        } catch (requestError) {
            console.error("Could not add product:", requestError);
            setError(requestError.message || "Could not add the product.");
        }
    }
    return (
        <div className='add-product'>
            <div className="addproduct-itemfield">
                <p>Product title</p>
                <input value={productDetails.name} onChange={changeHandler} type="text " name='name' placeholder='Type here' />
            </div>
            <div className="addproduct-price">
                <div className="addproduct-itemfield">
                    <p>Price</p>
                    <input value={productDetails.old_price} onChange={changeHandler} type="text" name="old_price" placeholder='Type here' id="" />
                </div>
                 <div className="addproduct-itemfield">
                    <p>Offer Price</p>
                    <input value={productDetails.new_price} onChange={changeHandler} type="text" name="new_price" placeholder='Type here' id="" />
                </div>
            </div>
            <div className="addproduct-itemfield">
                <p>Product Category</p>
                <select value={productDetails.category} onChange={changeHandler} name="category" className='add-product-selector' id="">
                    <option value="women">Women</option>
                    <option value="men">Men</option>
                    <option value="kid">Kid</option>
                </select>
            </div>
            <div className="addproduct-itemfield">
                <label htmlFor="file-input">
                    <img src={image?URL.createObjectURL(image):upload_area} className='addproduct-thumnail-img' alt="" />
                   
                </label>
                 <input onChange={imageHandler} type="file" name='image' id='file-input' hidden />
            </div>
            <button onClick={()=>Add_Product()} className='addproduct-btn'>ADD</button>
            {error && <p role="alert">{error}</p>}
        </div>
    )
}

export default AddProduct
