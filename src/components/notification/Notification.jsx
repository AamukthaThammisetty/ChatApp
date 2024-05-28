import React from 'react'

import { ToastContainer} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
function Notification() {
  return (
    <div className=''>
      <ToastContainer
position="bottom-right"
autoClose={3000}
hideProgressBar={false}
newestOnTop={false}
closeOnClick
rtl={false}
pauseOnFocusLoss
draggable
pauseOnHover
theme="light"
transition: Bounce
/>
{/* Same as */}
<ToastContainer />
    </div>
  )
}

export default Notification
