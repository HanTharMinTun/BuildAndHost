import Renderer from "./renderer/Renderer";

import website from "./generated_website.json";

import {validateNode}
from "./renderer/validator";


function App(){



if(!validateNode(website)){


return (

<h1>
Invalid Website Configuration
</h1>

);


}



return (

<Renderer

node={website}

/>

);


}


export default App;