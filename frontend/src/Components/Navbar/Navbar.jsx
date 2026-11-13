import React, { useContext, useEffect, useRef, useState } from "react";
import "./Navbar.css";
import logo from "../Assets/logo.png";
import cart_icon from "../Assets/cart_icon.png";
import { Link } from "react-router-dom";
import { ShopContext } from "../../Context/ShopContext";
import nav_dropdown from "../Assets/nav_dropdown.png";
import { useNavigate } from 'react-router-dom';
import { getApiUrl } from "../../config";

const Navbar = () => {
  const [menu, setMenu] = useState("shop");
  const { getTotalCartItems } = useContext(ShopContext);
  const menuRef = useRef();





  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    fetch(getApiUrl("/auth/status"), { credentials: "include" })
      .then((response) => {
        if (response.ok) setAuthenticated(true);
      })
      .catch((error) => console.error("Could not check login status:", error));
  }, []);

  const logout = async () => {
    try {
      const response = await fetch(getApiUrl("/logout"), {
        method: "POST",
        credentials: "include",
      });
      if (!response.ok) throw new Error(`Logout failed (${response.status}).`);
      window.location.replace("/");
    } catch (error) {
      console.error("Logout request failed:", error);
    }
  };
  const handleSearch = () => {
    if(search.trim() !== ""){
         navigate(`/search?query=${search}`);
        
    }
}

  const dropdown_toggle = (e) => {
    menuRef.current.classList.toggle("nav-menu-visible");
    e.target.classList.toggle("open");
  };

  return (
    <div className="navbar">
      <div className="nav-logo">
        <img src={logo} alt="" width={100} height={50} />
        <span>PERFUMES</span>
      </div>
      <img
        className="nav-dropdown"
        onClick={dropdown_toggle}
        src={nav_dropdown}
        alt=""
      />
      <ul ref={menuRef} className="nav-menu">
        <li
          onClick={() => {
            setMenu("shop");
          }}
        >
          <Link style={{ textDecoration: "none" }} to="/">
            Shop
          </Link>{" "}
          {menu === "shop" ? <hr /> : <></>}
        </li>
        <li
          onClick={() => {
            setMenu("mens");
          }}
        >
          <Link style={{ textDecoration: "none" }} to="/mens">
            Mens
          </Link>
          {menu === "mens" ? <hr /> : <></>}
        </li>
        <li
          onClick={() => {
            setMenu("womens");
          }}
        >
          <Link style={{ textDecoration: "none" }} to="/womens ">
            Women
          </Link>
          {menu === "womens" ? <hr /> : <></>}
        </li>
        <li
          onClick={() => {
            setMenu("kids");
          }}
        >
          <Link style={{ textDecoration: "none" }} to="/kids">
            Kids
          </Link>
          {menu === "kids" ? <hr /> : <></>}
        </li>
      </ul>
      <div className="nav-search" onClick={handleSearch}>
        <input
          type="text"
          placeholder="Search perfumes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button onClick={handleSearch}>🔍</button>
      </div>
      
      <div className="nav-login-cart">
        {authenticated ? (
          <button onClick={logout}>
            Logout
          </button>
        ) : (
          <Link to="/login">
            {" "}
            <button>Login</button>
          </Link>
        )}

        <Link to="/cart">
          <img src={cart_icon} alt="" />
        </Link>
        <div className="nav-cart-count">{getTotalCartItems()}</div>
      </div>
    </div>
  );
};

export default Navbar;
