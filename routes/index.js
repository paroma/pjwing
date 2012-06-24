var request = require("request");
var querystring = require("querystring");
var TABLENAME = "usertable";
var azure = require("azure");
exports.index = function(req, res){
  res.render('index', { title: 'Express' })
};

exports.auth = function(req, res) {   
res.redirect('https://api.singly.com/oauth/authorize?client_id=b1f87900afe3a00ecd8a4396e9613565&redirect_uri=http://localhost:3000/authorized&service=facebook') 
};

exports.authorized = function(req, res) {
    Response = res;
    var data = { 
        client_id : 'b1f87900afe3a00ecd8a4396e9613565',
        client_secret : '18e9a6a0ab8fd151599b465b387e0741',
        code : req.param('code')
    };
    var authBody = '';
    request.post({uri:'https://api.singly.com/oauth/access_token',
                  body: querystring.stringify(data),
                  headers: {
                      'Content-Type': 'application/x-www-form-urlencoded'
                  }

    }, getAuthbody);
        
};
    function getAuthbody(err,resp,body) {
        try {
            var authBody = JSON.parse(body) 
        } catch(parseErr) {
            return res.send(parseErr,500);
        }
        
        request({uri:"https://api.singly.com/v0/services/facebook/self?access_token=" + authBody['access_token']}, function(err,response,body) {
        try { 
            var allInfo = JSON.parse(body);
            console.log(allInfo);
            allInfo['authBody'] = authBody;
            addOrUpdateUserTable(allInfo); 
        } catch(parseErr) {
        }
            
        });
        
    };

    function addOrUpdateUserTable(information) { 
        var tableService = azure.createTableService()
        var allInfo = {} 
        allInfo['RowKey'] = information['authBody']['account'];
        
        allInfo['PartitionKey'] = "users";
        allInfo['authBody'] = JSON.stringify(information['authBody']); 
        allInfo['info'] = JSON.stringify(information);
        console.log(information);
        tableService.insertEntity("usertable",allInfo, function(err, serverEntity) {
            if (err == null) {
                console.log("push successful");
             
            }
            else { 
                tableService.updateEntity("userTable", allInfo, function(err, serverEntity) { 
                    if (err == null) { 
                        console.log("push successful");
                        Response.render("userpage");
                        }
                    });
                };
            });


    };
               
                    
                    
                    

