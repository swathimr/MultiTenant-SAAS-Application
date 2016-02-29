exports.index = function(req, res){
  res.render('index', { title: 'Express' });
};

exports.register = function(req, res){
  res.render('register', { title: 'register' });
};

exports.list = function(req, res){
  req.getConnection(function(err,connection){
  	if(err){
  		console.log("Connection error")	;
  	}
  	else{
	   // ******************* CHANGE TENANT ID ******************
	   console.log("----------------------");
	   var tenantId = req.session.tenantIdSession; // var tenantId = session.getAttribute('tenantId');
	   var userId = req.session.userIdSession;
	   console.log("tenantId:"+tenantId);
	   console.log("userId:"+userId);
	   
	   // *******************************************************
       var fieldQuery = "SELECT columnId, columnLabel FROM multi_tenant_db.tenantFields where tenantId="+tenantId;
	   connection.query(fieldQuery,function(err, columns){
        if(err){
           console.log("Error Selecting : %s ",err );
        }
		else{
			//console.log("Got tenant field");
			console.log(columns);
			var dataQuery = "SELECT recordId, columnId, tenantData FROM multi_tenant_db.tenantData D where userId="+userId+" order by recordId, columnId";
			console.log(dataQuery);
			   connection.query(dataQuery,function(err, data){
		        if(err){
		           console.log("Error Selecting : %s ", err);
		        }
				else{
					//console.log("Got data"+data.length);
					console.log(data);
					
					var matrix = [];
					var matrixRowCount = 0;
					var columnIdsRow = []; columnIdsRow[0] = "-999";
					var columnLabelsRow = []; columnLabelsRow[0] = "-999";
					for(var i=0; i<columns.length; i++){
						columnIdsRow[i+1] = columns[i].columnId;
						columnLabelsRow[i+1] = columns[i].columnLabel;
					}
					matrix[matrixRowCount++] = columnIdsRow;
					matrix[matrixRowCount++] = columnLabelsRow;
					//console.log(matrix[0]);
					//console.log(matrix[1]);
					var recordId = data[0].recordId;
					var valuesRow = []; 
					var valuesRowCount = 0;
					valuesRow[valuesRowCount++] = recordId;
					for(var i=0; i<data.length; i++){
						if(recordId == data[i].recordId){
							//console.log(data[i].recordId);
							valuesRow[valuesRowCount++] = data[i].tenantData;
						}else{
							recordId = data[i].recordId;
							matrix[matrixRowCount++] = valuesRow;
							valuesRowCount = 0;
							valuesRow = [];
							valuesRow[valuesRowCount++] = recordId;
							valuesRow[valuesRowCount++] = data[i].tenantData;
						}
					}
					matrix[matrixRowCount++] = valuesRow;
					
					if(tenantId == 1){
						res.render('waterfall',{page_title:"Waterfall Lifecycle",data:matrix});
					}else if(tenantId == 2){
						res.render('scrum',{page_title:"Scrum Lifecycle",data:matrix});
					}else if(tenantId ==3){
						res.render('kanban',{page_title:"Kanban Lifecycle",data:matrix});
					}
					else{
						res.render('index', { title: 'Index Page' });
					}
					
				}
			});
        }    
      });
  	}
	  
      });
      
  		      
  
    };


exports.edit = function(req, res){
	var id = req.params.id;
	console.log("Edit request received from"+id);
	req.getConnection(function(err,connection){
		if(err){
			console.log("Error in connection");	
		}
		else{
		   // ******************* CHANGE TENANT ID ******************
		   var tenantId = req.session.tenantIdSession;
		   var userId = req.session.userIdSession;
		   // *******************************************************
	       var fieldQuery = "SELECT columnId, columnLabel FROM multi_tenant_db.tenantFields where tenantId="+tenantId;
		   connection.query(fieldQuery,function(err, columns){
	        if(err){
	           console.log("Error Selecting : %s ",err );
	        }
			else{
				console.log("Got tenant field");
				//console.log(columns);
				// ******************* CHANGE USER ID******************
				var dataQuery = "SELECT recordId, columnId, tenantData FROM multi_tenant_db.tenantData D where userId="+userId+" and recordId="+id+" order by recordId, columnId";
				console.log(dataQuery);
				   connection.query(dataQuery,function(err, data){
			        if(err){
			           console.log("Error Selecting : %s ", err);
			        }
					else{
						//console.log("Got data"+data.length);
						//console.log(data);
						
						var matrix = [];
						var matrixRowCount = 0;
						var columnIdsRow = []; columnIdsRow[0] = "-999";
						var columnLabelsRow = []; columnLabelsRow[0] = "-999";
						for(var i=0; i<columns.length; i++){
							columnIdsRow[i+1] = columns[i].columnId;
							columnLabelsRow[i+1] = columns[i].columnLabel;
						}
						matrix[matrixRowCount++] = columnIdsRow;
						matrix[matrixRowCount++] = columnLabelsRow;
						//console.log(matrix[0]);
						//console.log(matrix[1]);
						var recordId = data[0].recordId;
						var valuesRow = []; 
						var valuesRowCount = 0;
						valuesRow[valuesRowCount++] = recordId;
						for(var i=0; i<data.length; i++){
							if(recordId == data[i].recordId){
								console.log("----"+data[i].tenantData);
								valuesRow[valuesRowCount++] = data[i].tenantData;
							}else{
								
								recordId = data[i].recordId;
								matrix[matrixRowCount++] = valuesRow;
								valuesRowCount = 0;
								valuesRow = [];
								valuesRow[valuesRowCount++] = recordId;
								valuesRow[valuesRowCount++] = data[i].tenantData;
							}
						}
						matrix[matrixRowCount++] = valuesRow;
						
						console.log("got data for "+id);
						if(tenantId == 1){
							res.render('edit_waterfall',{page_title:"Waterfall Lifecycle",data:matrix, recordId:id});
						}else if(tenantId == 2){
							res.render('edit_scrum',{page_title:"Scrum Lifecycle",data:matrix, recordId:id});
						}else if(tenantId == 3){
							res.render('edit_kanban',{page_title:"Kanban Lifecycle",data:matrix, recordId:id});
						}
					}
				});
	        }    
	      });
		}
	      });
	
	};




exports.save_edit = function(req,res){
	var recordId = req.params.id;
	// ******************* CHANGE TENANT ID ******************
    var tenantId = req.session.tenantIdSession;
    var userId = req.session.userIdSession;
    var query="";
    // *******************************************************
	console.log("Save Request Received for "+recordId);
	console.log(req.body);
	var input = JSON.parse(JSON.stringify(req.body));
	
    console.log("adsd----------");
    console.log(typeof(input));
    
    req.getConnection(function (err, connection) {
    	if(err)
    	{
    		console.log("Error in connection");		
    	}
    	else{
    	query = "";
    	var endColumnId = "";
    	for (var columnId in input){
    		endColumnId = columnId;
    	}
    	
    	
    	for (columnId in input){
    		console.log("adding"+columnId+" "+input[columnId]);
    query += "UPDATE tenantData set tenantData= \""+input[columnId]+"\" WHERE userId = "+userId+" AND columnId = "+columnId+" AND recordId = "+recordId+"; "
    	//query += "INSERT INTO tenantData (recordId, userId, columnId, tenantData) VALUES("+recordId+", "+userId+", "+columnId+", \""+input[columnId]+"\") ON DUPLICATE KEY  UPDATE tenantData= \""+input[columnId]+"\" AND userId = "+userId+" AND columnId = "+columnId+" AND recordId = "+recordId+"; ";
    //	query += "INSERT INTO tenantData (recordId, userId, columnId, tenantData) VALUES("+recordId+", "+userId+", "+columnId+", \""+input[columnId]+"\") ON DUPLICATE KEY  UPDATE tenantData= \""+input[columnId]+"\"; ";
    	}
    	console.log("query:"+query);
    	
    	connection.query(query, function(err, rows)
        {
			if (err){
              console.log("Error Updating : %s ",err );
        	}
			res.redirect("/sdlc");
        });
    	}
    });
};



exports.stats_kanban = function(req,res){
			var card=null;
			var priority=null;
			var cardType=null;
			var input = JSON.parse(JSON.stringify(req.body));
			var userId = req.params.id;
		    console.log("adsd----------");
		    req.getConnection(function (err, connection) {
		    	if(err){
		    		console.log("getConnection error");
		    	}
		    	else{
		    	console.log(req.body);
		    	//var dateTime = new Date();
		    	console.log("--input-----"+input);
		    
		    	
		        var data = { 	
		            recordId    : input.recordId,
		            userId    : input.userId,
		            columnId    : input.columnId,
		            tenantData	 : input.tenantData
		        };
		        console.log("Data:"+JSON.stringify(input));
		        //Lane stats
		        var query = connection.query("SELECT tenantData, count(*) as count FROM multi_tenant_db.tenantData where columnId=32 group by tenantData;", function(err, rows)
		        {
		  
		          if (err){
		              console.log("Error Updating : %s ",err );
		          }
		          else{
		        	  console.log("Got card:"+rows);
		        	  card=rows;
		        	  //Stats for priority
		        	  query = connection.query("SELECT tenantData, count(*) as count FROM multi_tenant_db.tenantData where columnId=36 group by tenantData;", function(err, rows)
		        			  {
		        		  if (err){
		        			  console.log("Error Updating : %s ",err );
		        		  }
		        		  else{
		        			  priority = rows;
		        			  console.log("Got card type:"+rows);
		        			  //Stats for card type
		        			  query = connection.query("SELECT tenantData, count(*) as count FROM multi_tenant_db.tenantData where columnId=35 group by tenantData;", function(err, rows)
		        					  {
		        				  if (err){
		        					  console.log("Error Updating : %s ",err );
		        				  }
		        				  else{
		        					  console.log("Got card type:"+rows);
		        					  cardType= rows;
		        				  }
		        					  });
		        			  
		        		  }
		        		   res.render('stats_kanban',{page_title:"Kanban Stats",card:card,priority:priority,cardType:cardType});

		        			  });
		        	 		          }
			    });
		    	}
		    });
	 };
	 
//Code to build the Scrum charts

exports.scrumChart = function(req, res){
  req.getConnection(function(err,connection){
  	if(err){
  		console.log("Connection error")	;
  	}
  	else{
	   // ******************* CHANGE TENANT ID ******************
	   var tenantId = req.session.tenantIdSession; // var tenantId = session.getAttribute('tenantId');
	   var userId = req.session.userIdSession;
	   // *******************************************************
       var fieldQuery = "SELECT columnId, columnLabel FROM multi_tenant_db.tenantFields where tenantId="+tenantId;
	   connection.query(fieldQuery,function(err, columns_chart){
        if(err){
           console.log("Error Selecting : %s ",err );
        }
		else{
			//console.log("Got tenant field");
			//console.log(columns);
			var dataQuery = "SELECT recordId, columnId, tenantData FROM multi_tenant_db.tenantData D where userId="+userId+" order by recordId, columnId";
			   connection.query(dataQuery,function(err, data_chart){
		        if(err){
		           console.log("Error Selecting : %s ", err);
		        }
				else{
					//console.log("Got data"+data_chart.length);
					console.log(data_chart);
					
					var matrix = [];
					var matrixRowCount = 0;
					var columnIdsRow = []; columnIdsRow[0] = "-999";
					var columnLabelsRow = []; columnLabelsRow[0] = "-999";
					for(var i=0; i<columns_chart.length; i++){
						columnIdsRow[i+1] = columns_chart[i].columnId;
						columnLabelsRow[i+1] = columns_chart[i].columnLabel;
					}
					matrix[matrixRowCount++] = columnIdsRow;
					matrix[matrixRowCount++] = columnLabelsRow;
					//console.log(matrix[0]);
					//console.log(matrix[1]);
					var recordId = data_chart[0].recordId;
					var valuesRow = []; 
					var valuesRowCount = 0;
					valuesRow[valuesRowCount++] = recordId;
					for(var i=0; i<data_chart.length; i++){
						if(recordId == data_chart[i].recordId){
							//console.log(data_chart[i].recordId);
							valuesRow[valuesRowCount++] = data_chart[i].tenantData;
						}else{
							recordId = data_chart[i].recordId;
							matrix[matrixRowCount++] = valuesRow;
							valuesRowCount = 0;
							valuesRow = [];
							valuesRow[valuesRowCount++] = recordId;
							valuesRow[valuesRowCount++] = data_chart[i].tenantData;
						}
					}
					matrix[matrixRowCount++] = valuesRow;
					
					var day_total = [0, 0, 0, 0, 0, 0, 0, 0];
				    for(var ii=2; ii<matrix.length; ii++){
				          var valuesRow1 = matrix[ii];
				          for(var j = 3; j<=10; j++){
				            day_total[j-3] += parseInt(valuesRow1[j]);
				            //console.log("%%%%%%%%%%%%%%");
				            //console.log(valuesRow1[j]);
				          }
				      }
				      
				    console.log("******************");
				    console.log(day_total);
				    var x = [];
				    x[0] = 31;
				    x[1] = 26;
						res.render('scrumChart',{page_title:"Burn Down Charts for Scrum Lifecycle",matrix:matrix, x:day_total});
					
					
				}
			});
        }    
      });
  	}
	  
      });
      
  		      
  
    };