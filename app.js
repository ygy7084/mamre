var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var fs = require('fs');
//mysql 접속
var mysql = require('mysql');
var conn = mysql.createConnection({
  host : 'localhost',
  user : 'root',
  password :'',
  database : 'mamre', // TODO : database connection, DB create,
});
conn.connect();
app.use(bodyParser.urlencoded({extended: false}));
app.locals.pretty = true;
app.set('views','./views');
app.set('view engine','jade');

//add로 들어오면
app.get('/member/add',function(req,res){
  var sql= 'select ID, phone, point from customer';
  conn.query(sql, function(err, members, fields){
    if(err){
      console.log(err);
      res.status(500).send('Internal Server Error');
    }
    else{
      res.render('add',{members:members});
    }
  })
});

// member/add 에서 post방식으로 제출 버튼 누르면..(회원추가)
app.post('/member/add', function(req,res){
  var phone = req.body.phone;
  var point = 1;
  var sql = 'insert into customer (phone, point) values (?,?)';
  conn.query(sql, [phone, point],function(err,result,fields){
    if(err){
      console.log(err);
      res.status(500).send('Internal Server Error');
    }
    else{
      res.redirect('/member/'+result.insertID)
    }
  });
});
//포인트 적립 눌러서 들어오면
app.get('/member/:phone/addpoint',function(req,res){
  var phone=req.params.phone;
  var sql='update customer set point = point + 1 where phone = ?';
  conn.query(sql,[phone],function(err,result,fieids){
    if(err){
      console.log(err);
      res.status(500).send('Internal Server Error');
    }
    else{
      res.redirect('/member/'+phone);
    }
  });
});

// 처음화면, phone 번호눌렀을때
app.get(['/member','/member/:phone'],function(req,res){
  var sql = 'select ID, phone, point from customer';
  conn.query(sql, function(err,members,fields){
    var phone = req.params.phone;
    if(phone){
      var sql='select * from customer where phone=?';
      conn.query(sql,[phone],function(err,member,fields){
        if(err){
          console.log(err);
          res.status(500).send('Internal Server Error');
        }
        else{
          res.render('view',{members:members, member:member[0]});
        }
      });
    }
    else{
      res.render('view',{members:members});
    }
  })
});

// 수정(edit)
app.get(['/member/:phone/edit'],function(req,res){
  var sql = 'select ID, phone, point from customer';
  conn.query(sql,function(err,members,fields){
    var phone=req.params.phone;
    if(phone){
      var sql='select * from customer where phone=?';
      conn.query(sql,[phone],function(err,member,fields){
        if(err){
          console.log(err);
          res.status(500).send('Internar Server Error');
        }
        else{
          res.render('edit',{members:members, member:member[0]});
        }
      })
    }
    else{
      console.log('There is no phone number.');
      res.status(500).send('Internal Server Error');
    }
  });
});
//edit에서 post형식으로 날라온 정보 처리
app.post('/member/:phone/edit', function(req,res){
  var phone_after = req.body.phone;
  var phone_before = req.params.phone;
  //var point = 1;
  var sql = 'update customer set phone = ? where phone = ?';
  conn.query(sql, [phone_after, phone_before],function(err,result,fields){
    if(err){
      console.log(err);
      res.status(500).send('Internal Server Error');
    }
    else{
      res.redirect('/member/'+result.insertID)
    }
  });
});

// delete 누르면
app.get('/member/:phone/delete',function(req,res){
  var sql = 'select ID, phone, point from customer';
  var phone = req.params.phone;
  conn.query(sql, function(err,members,fields){
    var sql='select * from customer where phone=?';
    conn.query(sql,[phone],function(err, member){
      if(err){
        console.log(err);
        res.status(500).send('Internal Server Error');
      }
      else{
        if(member.length===0){
          console.log('There is no record.');
          res.status(500).send('Internal Server Error');
        }
        else{
          res.render('delete',{members:members, member:member[0]});
        }
      }
    })
  })
})
// delete 신호 post로 받았을 때
app.post('/member/:phone/delete',function(req,res){
  var phone=req.params.phone;
  var sql='delete from customer where phone=?';
  conn.query(sql,[phone],function(err,result){
    res.redirect('/member/');
  });
});



app.listen(3000, function(){
  console.log('Connected, port 3000');
})
