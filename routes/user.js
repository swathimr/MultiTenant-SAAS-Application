/*
 * GET users listing.
 */



exports.authenticate = function(req, res) {
	var tenantIdVal =null;
	var userIdVal=null;
	var input = JSON.parse(JSON.stringify(req.body));

	req.getConnection(function(err, connection) {
		if(err){
			console.log("connection error");
		}
		else{
		console.log(req.body.user);

		var userId = input.user;
		console.log(userId);
		var query = connection.query('select * from userTable where userName=?',
				userId, function(err, rows)
				{

			if (err)
				{
				console.log("Error inserting : %s ", err);
				}
			else
				{
					tenantIdVal=null;
					if (rows.length > 0) {
						
						for ( var i = 0; i < rows.length; i++) {
		        			console.log(rows[i].count);
		        			tenantIdVal =rows[i].tenantId;
		        		//	userIdVal=;
		        			req.session.userIdSession = rows[i].userId ;
		        			break;
		        		}
					}
					
				}
			console.log("tenant is:::"+tenantIdVal);
			console.log("userId is:::"+req.session.userIdSession);
			if(tenantIdVal ===1)
	        {
				req.session.tenantIdSession="1";
				res.redirect('/sdlc');
	        }
	        else if(tenantIdVal ===2){
	        	req.session.tenantIdSession="2";
	        	res.redirect('/sdlc');

	        }
	        else if(tenantIdVal ===3)
	        {
	        	req.session.tenantIdSession="3";
	        	res.redirect('/sdlc');
	        }
	        else
	        {
	        	res.redirect('/');
	        }      

		});
		console.log(query.sql); 
		}
	});

};

exports.register = function(req, res) {
    
	var input = JSON.parse(JSON.stringify(req.body));
    
	req.getConnection(function(err, connection) {
	    if(err){
	        console.log("error in connection");
	    }	
	    else{
		var username = input.firstname;
		var email=input.email;
		var password=input.password;
		var tenantType;
		if(input.sdlctype == "Water Fall")
			{
			tenantType=1;
			}
		else if(input.sdlctype == "Scrum"){
			tenantType=2;
		}
		else
			{
			tenantType=3;
			}
		
		console.log(username+email+password+tenantType);
		var values=[username,password,tenantType];
		var query = connection.query('insert into userTable(userName,password,tenantId) values (?,?,?)',
				values, function(err, rows)
				{

			if (err)
				{
				console.log("Error inserting : %s ", err);
				}
			
			console.log("tenant is:::"+tenantType);
/*			if(tenantType ===1)
	        {
				req.session.tenantIdSession="1";
				res.render('sdlc',{page_title:"Scrum - Node.js",data:rows});
				//res.redirect('/waterfall');
	        }
	        else if(tenantType ===2){
	        	req.session.tenantIdSession="2";
	        	res.render('scrum',{page_title:"Scrum - Node.js",data:rows});
	        }
	        else if(tenantType ===3)
	        {
	        	req.session.tenantIdSession="3";
	        	res.render('kanban',{page_title:"Kanban - Node.js",data:rows});
	        }
	        else
	        {
*/
	        	res.redirect('/');//res.render('index',{page_title:"index",data:rows});
//}     

				});

		console.log(query.sql); // get raw query
	    }
	});

};