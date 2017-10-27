var http=require("http");
var express=require("express");
var bodyParser=require("body-parser");
var app=express();
var path = require('path');
var urlencodedParser=bodyParser.urlencoded({extended:false});
var  crypto= require('crypto');
var fs=require('fs');

//var session=require('express-session');
var cookieParser = require('cookie-parser');
var multer=require('multer');
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
app.use(cookieParser());
app.use(bodyParser.json());
//app.use(upload());
//var upload=multer({dest:'https://filestore.bowdlerization88.hasura-app.io/'});
/* app.use(session({
    secret: 'someRandomSecretValue',
    cookie:{maxAge:1000*60*60*24*30},
    saveUninitialized: true,
                 resave: true
}))*/
app.post("/signup",urlencodedParser,function(req,res){
  var username=req.body.Username;
  var password=req.body.password;
  var fullname=req.body.Fullname;
  var contactno=req.body.Contactinfo;
  console.log("Contactno is "+contactno);
  var location=req.body.location;
  var email=req.body.Email;
  if (contactno=="") {
    contactno=null;
  }
  var request = require("request");
  var options = {
     method: 'POST',
    url: 'https://auth.bowdlerization88.hasura-app.io/signup',
    headers:
     {
       'cache-control': 'no-cache',
       'content-type': 'application/json' },
    body: { username: username, password: password },
    json: true };
request(options, function (error, response, body) {
    
    console.log(body);
    code=response.statusCode;
    if(code==200){
     token= body.auth_token;
     //console.log("token is "+token);
     user_id=body.hasura_id;
     var temp = body;
     //console.log('here is my' +temp);
     res.cookie('randomcookiename',temp, { maxAge: 345600000});

     var request1 = require("request");

     var options = { method: 'POST',
       url: 'https://data.bowdlerization88.hasura-app.io/v1/query',
       headers:
        {
          'cache-control': 'no-cache',
          'Authorization': 'Bearer '+token,
          'content-type': 'application/json' },
       body:
        { type: 'insert',
          args:
           { table: 'Profile',
             objects:
              [ { user_id: user_id,
                  Fullname: fullname,
                  Contactinfo: contactno,
                  Email: email,
                  location: location,
                Username:username } ] } },
       json: true };

     request1(options, function (error, response, body) {
       //if (error) throw new Error(error);

       console.log('body '+body);
       console.log("code "+response.status_code);

   res.redirect('/home')

 })}
 else if(code==409){
   res.send("username already exists");
 }
 else{
   res.send("some error occurred");
 }
});
});



app.post("/login",urlencodedParser,function(req,res){

  var username=req.body.Username;
  var password=req.body.Password;
  var temp;
  console.log(username);
  console.log(password);
    var req = new XMLHttpRequest();
    req.open('POST', 'https://auth.bowdlerization88.hasura-app.io/login', true); // force XMLHttpRequest2
    req.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
    req.setRequestHeader('Accept', 'application/json');
    req.send(JSON.stringify({username: username, password:password}));
    req.withCredentials = true; // pass along cookies
    req.onload = function()  {
        // store token and redirect

        try {
            temp = JSON.parse(req.responseText);
            code=req.status;
            console.log(temp);
            console.log(code);
            if(code==200){
              res.cookie('randomcookiename',temp, { maxAge: 345600000});
		res.redirect('/');
            }
            else {
            res.status(code).send(temp);
            }
        } catch (error) {
            return error;
        }
    };

});





app.get('/logout', function (req, res) {
  if(req.cookies.randomcookiename==undefined){
  res.redirect('/');
}
else{
  var cookie_id = req.cookies.randomcookiename.auth_token;
  console.log(cookie_id);
  var request = require("request");

var options = { method: 'POST',
  url: 'https://auth.bowdlerization88.hasura-app.io/user/logout',
  headers:
   { //'postman-token': '4f090490-f215-5d4f-24a2-82bc4943be69',
     'cache-control': 'no-cache',
      authorization: 'Bearer '+cookie_id,
     'content-type': 'application/json' } };

request(options, function (error, response, body) {


  console.log(body);
});
if(res.statusCode == 200){
 res.sendFile(path.join(__dirname, 'ui', 'main.html'));

}
else if(req.status===500){
     res.send('Error on server side');
   }
res.clearCookie("randomcookiename");
}
});


var imgpath;
var storage = multer.diskStorage({
destination: function (req, file, cb) {
cb(null, path.join(__dirname,'filestore'))
},
filename: function (req, file, cb) {
  crypto.pseudoRandomBytes(16, function (err, raw) {
        if (err) return cb(err)
        imgpath=raw.toString('hex')+path.extname(file.originalname);
        cb(null, imgpath)
      })
    }
});

var upload = multer({ storage: storage });
app.post('/uploadfile',upload.single('Ad_pic'), function uploadImage(req,res) {
var cookie_id = req.cookies.randomcookiename.auth_token;
  var user_id = req.cookies.randomcookiename.hasura_id;
  var Ad_name=req.body.Ad_name;
  var Category=req.body.Category;
  var Desc=req.body.Desc;
  var location=req.body.location;
  var Price=req.body.Price;
  var imgtype=req.file.mimetype;
  var imge=fs.readFileSync(req.file.destination+'/'+imgpath);
  var request = require("request");

  var options = { method: 'POST',
    url: 'https://filestore.bowdlerization88.hasura-app.io/v1/file/'+imgpath,
    body: imge,
    headers:
     { //'postman-token': 'e76ccac6-1945-b495-8194-dfe7cc77bf59',
       //'cache-control': 'no-cache',
       authorization: 'Bearer '+cookie_id,
       'content-type': imgtype } };

  request(options, function (error, response, body) {
  
    console.log(body);
    if (response.statusCode==200){
    var request1 = require("request");

  var options = { method: 'POST',
    url: 'https://data.bowdlerization88.hasura-app.io/v1/query',
    headers:
     { //'postman-token': 'c8ae8374-69ce-0541-4d0d-8cb1e9f6d830',
       'cache-control': 'no-cache',
       authorization: 'Bearer '+cookie_id,
       'content-type': 'application/json' },
    body:
     { type: 'insert',
       args:
        { table: 'Ad_upload',
          objects:
           [ { 	Ad_id: imgpath ,
				User_id: user_id ,
				Ad_name: Ad_name,
				Desc: Desc,
				location:location,
				Category:Category,
				Price:Price} ] } },
    json: true };

  request1(options, function (error, response, body) {


    console.log(body);
    if(response.statusCode==200){
    res.redirect('/viewlisting.html');
  }
  });
}
  });
  });

app.get('/getimg',function(req,res){
    var cookie_id = req.cookies.randomcookiename.auth_token;
  var request = require("request");

var options = { method: 'POST',
  url: 'https://data.bowdlerization88.hasura-app.io/v1/query',
  headers:
   { //'postman-token': '8b55386b-1b05-dbef-6414-02b2e575203e',
     //'cache-control': 'no-cache',
     authorization: 'Bearer '+cookie_id,
     'content-type': 'application/json' },
  body:
   { type: 'select',
     args:
      { table: 'Ad_upload',
        columns: [ 'Ad_id', 'Ad_name', 'Category' ] } },
  json: true };

request(options, function (error, response, body) {
  var template=``;
  var idk=body;
    if(idk[0]==null){
    template=`<div style="text-align:center;display:block;width:100%;min-height:274px"><h2 style="width:100%;padding-top:100px"> No Listing found :( </h2></div>`;
  }
  else{
  for (var i = (idk.length)-1; i >=0; i--) {
    var Ad_id=idk[i].Ad_id;
    var Ad_name=idk[i].Ad_name;
    var Category=idk[i].Category;
    var template= template+createTemplate(Ad_id,Ad_name,Category);
  }
  }
 
  console.log(template);
  res.send(template);
});

});

  function createTemplate (Ad_id,Ad_name,Category){
          var dir=__dirname;
  var htmlTemplate=` 
        <div class="col-xs-12 col-sm-3" style="padding-bottom:50px;">
            <div class="cardx" Style=" border:1px solid #ccc">
          <a class="img-card"  href="javascript:myFunction('${Ad_id}')" >
            <img src="https://filestore.bowdlerization88.hasura-app.io/v1/file/${Ad_id}" style="height: 100%;">
          </a>
         <div class="card-content">
                    <h4 class="card-title">
                        <a href="javascript:myFunction('${Ad_id}')">${Ad_name}</a>
             </h4>
                    <div class="lcx">${Category}</div>
					</div>
                <div class="card-read-more">
                    <a class="btn btn-link btn-block" href="javascript:myFunction('${Ad_id}')" >
                        View Now
                    </a>
                </div>
            </div>
        </div>
           

   `;
      return htmlTemplate;
  }


function infotemplate(Ad_id,Ad_name,location,Desc,Category,Price){
	console.log(Desc);
  var newtemplate= `
 
					<div class="preview col-md-6">
						
						<div class="preview-pic tab-content">
						  <div class="tab-pane active" id="pic-1"><img style="width:700px" src="https://filestore.bowdlerization88.hasura-app.io/v1/file/${Ad_id}"></div>
						 
						</div>
						<ul class="preview-thumbnail nav nav-tabs">
						  <li class="active"><a data-target="#pic-1" data-toggle="tab"><img src="https://filestore.bowdlerization88.hasura-app.io/v1/file/${Ad_id}" /></a></li>
					
						</ul>
						
					</div>
					
					
					<div class="details col-md-6">
						<h3 class="product-title"> ${Ad_name}</h3>
					    	<p class="vote"><strong>Location: </strong>${location}</br>   
					         <strong>Type: </strong>${Category}</p>
						<p class="product-description">${Desc}</p>
						<h4 class="price">current price: <span>${Price}</span></h4>
					<div id="owner-show">
					</div>
					<h5 class="colors">
							<span style="color:teal"></span>
						
						</h5>
						<div class="action">
							<a class="add-to-cart btn btn-default" href="/viewlisting.html">Go Back</a>
							
						</div>
					</div>
				</div>
		
   
   
`;
  return newtemplate;
}

function infotemplate2(Fullname,Contactinfo) {
  var newtemplate= `
		<h5 class="sizes">Posted By:
							<span style="color:teal">${Fullname}</span>
							
						</h5>
						<h5 class="colors">Contact:
							<span style="color:teal">${Contactinfo}</span>
						
						</h5>
`;
  return newtemplate;
}


function infotemplate3(Fullname,Username,location,Contactinfo,Email) {
  var newtemplate= `
  <div class="hs-headline sidenav-profile" style="padding:1em;padding-top:2em">
					<img class="img-circle" src="https://api.flairyegg.com/images/profile.png" alt="" width="150" height="150">
				<div class="profile_info">
			<h4 style="padding-top:15px">${Username}</h4>
			<h5>${location},&nbsp;&nbsp;&nbsp;India</h5>
			</br>
		
			<p style="text-align:left;font-size:1em">Name:<span style="float:right">${Fullname}</span></p>
			<p style="text-align:left;font-size:1em">Contact:<span style="float:right">${Contactinfo}</span></p>
			<p style="text-align:left;font-size:1em">Email:<span style="float:right">${Email}</span></p>
	
			</div>
			<div style="clear: both;">
			</div>
			</div>
`;
  return newtemplate;
}



  app.get('/intro/:myMessage', function (req, res) {
    var Ad_game=req.params.myMessage;
    res.cookie('Ad_id',Ad_game);
    res.send('Success');
  });


  app.get('/sort/:myMessage/:myMessage2', function (req, res) {
    var Category=req.params.myMessage;
	var location=req.params.myMessage2;
    var cookie_id = req.cookies.randomcookiename.auth_token;
    console.log("Categ is"+ Category);
    console.log("SubCateg is"+ location);
    var request = require("request");
    var template=``;

var options = { method: 'POST',
  url: 'https://data.bowdlerization88.hasura-app.io/v1/query',
  headers:
   { //'postman-token': 'e6b1eb0f-02c6-7ec9-40e7-e4f86d1e093f',
     'cache-control': 'no-cache',
     'Authorization': 'Bearer '+cookie_id,
     'content-type': 'application/json' },
  body:
   { type: 'select',
     args:
      { table: 'Ad_upload',
        columns: [ 'Ad_id', 'Ad_name', 'Category', 'location' ],
        where: { Category: Category, location:location} } },
  json: true };

request(options, function (error, response, body) {


  console.log(body);
 
  if(body[0]==null){
    template=`<div style="text-align:center;display:block;width:100%;min-height:274px"><h2 style="width:100%;padding-top:100px"> No Listing found :( </h2></div>`;
    console.log(template);
    res.send(template);
  }
  else{
  res.send(Sort(body));
}
});
    //console.log("here"+template);
    //res.send(template);
  });



function Sort(idk) {
var template=``;
  for (var i = 0; i < idk.length; i++) {
    var Ad_id=idk[i].Ad_id;
    var Ad_name=idk[i].Ad_name;
    var Category=idk[i].Category;
    var location=idk[i].location;
	    
    var template= template+createTemplate(Ad_id,Ad_name,Category);
  }
  console.log(template);
  return template;
}

  app.get('/listingdetailfetch', function (req, res) {
    var cookie_id = req.cookies.randomcookiename.auth_token;
    var Ad_id = req.cookies.Ad_id;
    console.log(Ad_id);
    var request = require("request");

var options = { method: 'POST',
  url: 'https://data.bowdlerization88.hasura-app.io/v1/query',
  headers:
   { 'postman-token': 'd253c7ab-f4e9-2296-a5ca-060bc1818eb5',
     'cache-control': 'no-cache',
     authorization: 'Bearer '+cookie_id,
     'content-type': 'application/json' },
  body:
   { type: 'select',
     args:
      { table: 'Ad_upload',
        columns:
         [ 'User_id',
           'Ad_name',
           'location',
           'Desc',
           'Category',
           'Price' ],
        where: { Ad_id: Ad_id } } },
  json: true };

request(options, function (error, response, body) {


  console.log(body);
  Chomu_id=body[0].User_id;
  Ad_name=body[0].Ad_name;
  Desc=body[0].Desc;
  location=body[0].location;
  Category=body[0].Category;
  Price=body[0].Price;
  res.cookie('User_id',Chomu_id);
  console.log(Desc);
  res.send(infotemplate(Ad_id,Ad_name,location,Desc,Category,Price));
});
  

  });

app.get('/profiledetailfetch',function (req,res) {
  var cookie_id = req.cookies.randomcookiename.auth_token;
  var Chomu_id = req.cookies.User_id;
    var request11 = require("request");

  var options = { method: 'POST',
    url: 'https://data.bowdlerization88.hasura-app.io/v1/query',
    headers:
     { //'postman-token': 'ce0031d1-b102-489b-5f93-757fb6f5a5c9',
       //'cache-control': 'no-cache',
       authorization: 'Bearer '+cookie_id,
       'content-type': 'application/json' },
    body:
     { type: 'select',
       args:
        { table: 'Profile',
          columns: [ 'Fullname', 'Contactinfo' ],
          where: { user_id: Chomu_id } } },
    json: true };

  request11(options, function (error, response, body) {
  

    console.log(body);
    Fullname=body[0].Fullname;
    Contactinfo=body[0].Contactinfo;
      res.send(infotemplate2(Fullname,Contactinfo));
  });
});								 



app.get('/profiledetailfetch2',function (req,res) {
  var cookie_id = req.cookies.randomcookiename.auth_token;
  var User_id=req.cookies.randomcookiename.hasura_id;
    var request11 = require("request");

  var options = { method: 'POST',
    url: 'https://data.bowdlerization88.hasura-app.io/v1/query',
    headers:
     { //'postman-token': 'ce0031d1-b102-489b-5f93-757fb6f5a5c9',
       //'cache-control': 'no-cache',
       authorization: 'Bearer '+cookie_id,
       'content-type': 'application/json' },
    body:
     { type: 'select',
       args:
        { table: 'Profile',
          columns: [ 'Username', 'location', 'Contactinfo', 'Email','Fullname' ],
          where: { user_id: User_id } } },
    json: true };

  request11(options, function (error, response, body) {
   

    console.log(body);
    Username=body[0].Username;
    Fullname=body[0].Fullname;
    location=body[0].location;
    Contactinfo=body[0].Contactinfo;
    Email=body[0].Email;
      res.send(infotemplate3(Fullname,Username,location,Contactinfo,Email));

  });
});

app.get('/uploadedlistingsfetch', function (req, res) {
  var cookie_id = req.cookies.randomcookiename.auth_token;
  var User_id=req.cookies.randomcookiename.hasura_id;
  var request = require("request");

var options = { method: 'POST',
  url: 'https://data.bowdlerization88.hasura-app.io/v1/query',
  headers:
   { //'postman-token': '674432b9-f65d-120d-73b4-f0c600d6bee9',
     //'cache-control': 'no-cache',
     authorization: 'Bearer '+cookie_id,
     'content-type': 'application/json' },
  body:
   { type: 'select',
     args:
      { table: 'Ad_upload',
        columns: [ 'Ad_name','Ad_id' ],
        where: { User_id: User_id } } },
  json: true };

request(options, function (error, response, body) {


  //console.log(body);
  var array=body;
  console.log(array);
  if(body[0]==null){
	var tempx=`<h1 class="header-line text-center">Listings Posted</h1>
				<p style="padding-bottom:20px"> All your listings in one place </p>
				<p style="padding-top:80px"> No Listing posted yet </p>
				 <a href="/listdetailform"><button class="ui inverted blue button" style="
    height: 42px;
    width: 128px;
    margin: -20px -60px;
    position:relative;
    top:50%;
    left:50%;
    padding-bottom: 0px;
    padding-top: 0px;
    font-size: 14px;
    padding-left: 10px;
    padding-right: 10px;
    ">Post a listing</button></a>`
    res.send(tempx);
  }
  else {
  res.send(loop(array));
}
});
});


function loop(array) {
  var temptemplate=`<h1 class="header-line text-center">Listings Posted</h1>
				<p style="padding-bottom:20px"> All your listings in one place </p>`
  for (var i = 0; i < array.length; i++) {
    var Ad_id=array[i].Ad_id;
    var Ad_name=array[i].Ad_name;
    temptemplate=temptemplate+sharedAdtemplate(Ad_name,Ad_id);
  }
  console.log(temptemplate);
  return temptemplate
}

function sharedAdtemplate(Ad_name,Ad_id) {
var temp=
    `<div class="item" style="padding:5px; padding-right:7.5%;padding-left:7.5%">
						 
      <div> <a style="color:black" href="javascript:myFunction('${Ad_id}')">${Ad_name}</aa>
      <a href="javascript:remlisting('${Ad_id}')"><button class="ui right floated inverted blue button">Remove listing</button></a>
				</div>
			</div>
    `
    return temp;
}

app.get('/dellist/:dellistvalue', function (req, res) {
  var cookie_id = req.cookies.randomcookiename.auth_token;
  var dellistvalue=req.params.dellistvalue;
  console.log("Deleting listing "+dellistvalue);
  var request = require("request");

var options = { method: 'POST',
  url: 'https://data.bowdlerization88.hasura-app.io/v1/query',
  headers:
   { //'postman-token': 'c929f12b-c980-40f8-c72e-28f028204a87',
     //'cache-control': 'no-cache',
     'Authorization': 'Bearer '+cookie_id,
     'content-type': 'application/json' },
  body:
   { type: 'delete',
     args:
      { table: 'Ad_upload',
        where: { Ad_id: dellistvalue } } },
  json: true };

request(options, function (error, response, body) {


  console.log(body);
  res.send('success');
});
});

app.get('/home', function (req, res) {
  if(req.cookies.randomcookiename==undefined){
    res.redirect('/');
}
else{
  res.sendFile(path.join(__dirname, 'ui', 'home.html'));
}
});

app.get('/listinginfo', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'listinginfo.html'));
});


app.get('/profileinfo.html', function (req, res) {
  if(req.cookies.randomcookiename==undefined){
    res.redirect('/');
}
else{
  res.sendFile(path.join(__dirname, 'ui', 'profileinfo.html'));
}

});

app.get('/bkimg', function (req, res) {
  res.sendFile(path.join(__dirname, 'filestore', imgpath));
});

app.get('/signup.html', function (req, res) {
  if(req.cookies.randomcookiename!=undefined){
  res.redirect('/');
  }
  res.sendFile(path.join(__dirname, 'ui', 'signup.html'));
});
app.get('/ui/signup_style.css', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'signup_style.css'));
});
app.get('/ui/style.css', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'style.css'));
});

app.get('/ui/index_style.css', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'index_style.css'));
});
app.get('/ui/font-awesome.min.css', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'font-awesome.min.css'));
});

app.get('/fonts/fontawesome-webfont.ttf', function (req, res) {
  res.sendFile(path.join(__dirname, 'fonts', 'fontawesome-webfont.ttf'));
});



app.get('/', function (req, res) {
  if(req.cookies.randomcookiename==undefined){
  res.sendFile(path.join(__dirname, 'ui', 'main.html'));
}
else{
  res.redirect('/home');
}

});

app.get('/profileinfo', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'profileinfo.html'));
});


app.get('/listdetailform', function (req, res) {
  if(req.cookies.randomcookiename==undefined){
    res.redirect('/');
}
else{
res.sendFile(path.join(__dirname, 'ui', 'listdetailform.html'));
}

});


app.get('/viewlisting.html', function (req, res) {
  if(req.cookies.randomcookiename==undefined){
    res.redirect('/');
}
else{
res.sendFile(path.join(__dirname, 'ui', 'viewlisting.html'));
}

});


app.get('/info', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'info.html'));
});

app.get('/ui/backimg.jpg', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'backimg.jpg'));
});

app.get('/smoothscroll.js', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'smoothscroll.js'));
});

app.get('/dropdown.js', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'pg-custom.js'));
});

app.get('/jquery-1.11.3.min.js', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'jquery-1.11.3.min.js'));
});

app.get('/ui/images.png', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'images.png'));
});
app.get('/ui/Untitled.png', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'Untitled.png'));
});

app.get('/loginmobile', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'loginmobile.html'));
});

app.get('/ui/dp.png', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'dp.png'));
});

app.get('/overlay.jpg', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'overlay.jpg'));
});

var port = 8081; // Use 8080 for local development because you might already have apache running on 80
app.listen(8081, function () {
  console.log(`listening on port ${port}!`);
});
