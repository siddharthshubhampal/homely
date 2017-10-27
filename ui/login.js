console.log("login");
var user_id;
var Token;
function myfunc(){

  var request=new XMLHttpRequest;
   request.onreadystatechange=function(){
              if(request.readyState===XMLHttpRequest.DONE){

                  if(request.status===200){
                      console.log("user logged in");
                  				  user_id = JSON.stringify(request.responseText);
                  console.log(user_id);  
                 localStorage.setItem('u_id',user_id);
					
				 Token = JSON.parse(this.responseText).auth_token;
                 console.log(Token);  
                 window.localStorage.setItem('Token',Token);
                  request.cookie('randomcookiename',user_id, { maxAge: 345600000});
                      alert(" You are logged in successfully and your user id is"+ user_id);
                      window.location="/";
                      }
                      else{
                          alert("Error ");
                      }
                      
              }  
          }; 
    var username=document.getElementById("Username").value;
    var password=document.getElementById("Password").value;
    
     console.log(username);
   request.open('POST','https://auth.abscess47.hasura-app.io/login',true);
   request.setRequestHeader('Content-Type', 'application/json');
   request.send(JSON.stringify({username:username,password:password}));
   document.getElementById("submit_btn").value="Signning in";

 }
 
