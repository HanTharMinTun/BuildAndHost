import { Routes, Route } from "react-router-dom";

import Home from "./pages/home";
import Editor from "./pages/editor";
import Login from "./pages/login";
import Register from "./pages/register";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/editor" element={<Editor />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
    </Routes>
  );
}



// import Renderer from "./renderer/Renderer";

// import website from "./generated_website.json";
// import Home from "./pages/home";

// import {validateNode}
// from "./renderer/validator";


// function App(){


    

// // if(!validateNode(website)){


// // return (

// // <h1>
// // Invalid Website Configuration
// // </h1>

// // );


// // }



// // return (

// // <Renderer

// // node={website}

// // />

// // );


// }


// export default App;


