var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({ extended: true })
var mysql = require('mysql');

'use strict';


const fs = require('fs');
const visited = []



module.exports = function(app, passport) {

    
var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "12345678",
    database: "soa"
});
con.connect(function (err) {
        if (err) throw err;
  
        WritePropertiesToJSON();
        app.get('/', function(req, res){
        res.render('index.ejs');
    });

    
    app.get('/urunekle', function(req, res){
        res.render('urunekle.ejs',);
    });

    app.post('/yerleriGoster', function(req, res){
 //res.render('map.ejs', {qs:req.querry});
 var x = 37.84440000;
 var y = 27.84580000;
 var newPark = {
     name: x, image: y
 };
 visited.push(newPark);
});

    app.post('/propertyEklendi',urlencodedParser, function(req, res){
        
        var id=req.body.updateID;
        let queryString ;          
      if(id>0)
            queryString ="UPDATE properties SET valid_id = '2' WHERE (id ="+ id+");";
        else
        queryString ="UPDATE properties SET valid_id = '3' WHERE (id ="+ Math.abs(id)+");";



        con.query(queryString, function (err, results) {
            if (err) throw err.message;
            console.log('Başarılı bir şekilde eklendi.');
          });
          WritePropertiesToJSON();
        res.render('profileSuccess.ejs', {
            user:req.user
           });
    });
    

    app.get('/profile', isLoggedIn, function(req, res){
        WritePropertiesToJSON();
        res.render('profile.ejs', {
         user:req.user
        });
       });


       app.get('/reddedilenler',isLoggedIn, function(req, res){
       
         
        WritePropertiesToJSON();
        res.render('showDeclinedProperties.ejs', {
            user:req.user
           });
    });

       app.get('/onaylananlar', isLoggedIn, function(req, res){
        res.render('showAcceptedProperties.ejs', {
         user:req.user
        });
       });

    app.get('/bekleyenler',isLoggedIn, function(req, res){
       
         
        WritePropertiesToJSON();
        res.render('showProperties.ejs', {
            user:req.user
           });
    });



    app.get('/iller', function(req, res){
        let jsonData2 = {}
        fs.readFile('iller.json', 'utf-8', (err, veriler) => {
            if (err) throw err

            jsonData2 = JSON.parse(veriler)
            res.json(jsonData2);
        })

    });

    app.get('/ilceler', function(req, res){
        let jsonData3 = {}
        fs.readFile('ilceler.json', 'utf-8', (err, verilerilce) => {
            if (err) throw err

            jsonData3 = JSON.parse(verilerilce)
            res.json(jsonData3);
        })

    });
    app.get('/Mekanlar', function(req, res){
        let jsonDataMekan = {}
        fs.readFile('mekanlar.json', 'utf-8', (err, verilerMekan) => {
            if (err) throw err

            jsonDataMekan = JSON.parse(verilerMekan)
            res.json(jsonDataMekan);
        })

    });


    
    app.get('/YerEkleme', function(req, res){
          

        res.render('addProperty.ejs');


    });


    app.post('/addProperty',urlencodedParser, function (req,res) {  
        var MekanAdi=req.body.propertyName,
         Plaka=req.body.propertyPlate,
         Ilce=req.body.propertyPlace,
         Telefon=req.body.propertyNumber,
         OwnerName=req.body.propertyOwner,
         Adress=req.body.propertyAdress,
         MailAdress=req.body.propertyMail,
         Enlem=req.body.propertyEnlem,Boylam,
         mContent=req.body.propertyContent,
         Boylam=req.body.propertyBoylam;

    
         var sql="INSERT INTO propertyiletisim(kisi,telefon,eposta) VALUES ('"+OwnerName+"','"+Telefon+"','"+MailAdress+"') "
         var sql2="INSERT INTO propertydetay (mekanadi,adresi,icerik,iletisim_id) VALUES ('"+MekanAdi+"','"+Adress+"','"+mContent+"',(SELECT MAX(id) FROM propertyiletisim))"
         var sql3 = "INSERT INTO properties (il_id, ilce_id, enlem,boylam,valid_id, detay_id) VALUES("+Plaka+",(SELECT ilce_id FROM pk_ilce WHERE ilce_adi='"+Ilce+"'),"+Enlem+","+Boylam+",1,(SELECT MAX(id) FROM propertydetay))";
       
         con.query(sql,function (err, result) {
            if (err) throw err;
            console.log("Number of records inserted: " + result.affectedRows);
        });
        con.query(sql2  ,function (err, result) {
            if (err) throw err;
            console.log("Number of records inserted: " + result.affectedRows);
        });
        con.query(sql3  ,function (err, result) {
            if (err) throw err;
            console.log("Number of records inserted: " + result.affectedRows);
        });


          res.render('uruneklesuccess.ejs',{data:req.body})  
       });





    app.get('/iletisim', function(req, res){
        res.render('iletisim.ejs',);
    });

    //register login 

    app.get('/login', function(req, res){
        res.render('login.ejs', {message:req.flash('loginMessage')});
       });
      
       app.post('/login', passport.authenticate('local-login', {
        successRedirect: '/profile',
        failureRedirect: '/login',
        failureFlash: true
       }),
        function(req, res){
         if(req.body.remember){
          req.session.cookie.maxAge = 1000 * 60 * 3;
         }else{
          req.session.cookie.expires = false;
         }
         res.redirect('/');
        });
    
      
       app.get('/profile', isLoggedIn, function(req, res){
        res.render('profile.ejs', {
         user:req.user
        });
       });


      
       app.get('/logout', function(req,res){
        req.logout();
        res.redirect('/');
       })



    function WritePropertiesToJSON (){ var obj = {
        Mekanlar: []
     };
     
      var queryString ="Select * FROM GET_PROPERTIES";
     
     
     con.query(queryString, function(err, rows, fields) {
         if (err) throw err;
     
         for (var i in rows) {    
    
            obj.Mekanlar.push(
                 {
                     id: rows[i].id, 
                     il:rows[i].il_adi,
                     ilce: rows[i].ilce_adi,
                     enlem: rows[i].enlem, 
                     boylam: rows[i].boylam,
                     durumu:rows[i].valid_id,
                     adi:rows[i].mekanadi,
                     icerik:rows[i].icerik,
                     adres:rows[i].adresi,
                     iletisimkisi:rows[i].kisi,
                     telefon:rows[i].telefon,
                     eposta:rows[i].eposta
     
                 });
         
         }
         var json = JSON.stringify(obj);
     
         
         fs.writeFileSync('mekanlar.json', json,'utf8');
     });
     
     // con.end();
      }



    //end register login
    });
};


function isLoggedIn(req, res, next){
    if(req.isAuthenticated())
     return next();
   
    res.redirect('/');
   }




