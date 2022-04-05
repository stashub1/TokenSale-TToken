import React, {useState, useEffect} from 'react';

function Container(props) {

const Loader = () => (
  <div id="loader">
        <p className="text-center">Loading...</p>
	</div>  
)

const onNumberChange = function (event) {
    props.onNumberChange(event.target.value);
}


const Main = () => (
   <div id="main"> 	
      <p> 
          Introducing TToken (TT).
          Token price is {props.tokenPrice} Ether. You currently have {props.yourBalance} TT. 
      </p>
      <br/>
      <form 
      	role="form">
        <div className="form-group">
          <div className="input-group">
            <input id="numberOfTokens" 
            	class="form-control input-lg" 
            	type="number"
            	value={props.numberOfTokensToBuy}
            	onChange={onNumberChange}
            	pattern="[1-9]"></input>
            <span className="input-group-button">
	          <button type="button"
	          	   onClick={(e) => {props.buyTokens(e)}}
	               className="btn btn-primary btn-lg">
	               Buy tokens
	       	  </button>
            </span>
          </div>
        </div>
      </form>
      <br/>
      <div class="progress">
		  <div class="progress-bar"
			   style={{width : props.progressPercent + '%' }} 
			   role="progressbar"
			    aria-valuenow={props.progressPercent}
			     aria-valuemin="0"
			      aria-valuemax="100">	
			</div>
	  </div>
      <p>
        {props.tokensSold} / {props.tokensAvailable} tokens sold.
       </p>
       <br/>
       <p id="account-address">Your account address is {props.yourAddress} </p>
	</div>

 )


  return (
    <div className="container">
        <div className="raw">
          <div className="col-lg-9"></div>
            <br/>
            <br/>
            <div id="content" className="text-center">
            	 {props.isLoading ? <Loader/> : <Main/> }
             </div>
          </div>
        </div>

  );

}

export default Container;
