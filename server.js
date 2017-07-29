var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var fs = require('fs');
var cors = require('cors');
var mysql = require('mysql');

// var conn = mysql.createConnection(mysql_info.uri);


// var conn = mysql.createConnection(mysql_info.uri);

// conn.connect(function(err) {
//     if (err) {
//       console.error('error connecting: ' + err.stack);
//       return;
//     }
//       console.log('connected as id ' + conn.threadId);
//       var sql = 'select * from customer';
  
//       conn.query(sql, function(err,members,fields){
//           if(err){
//               console.log(err);
//               res.status(500).send('Internal Server Error');
//           }
//           else{
//             console.log(members);
//           }
//         })
// })
var conn;

function handleDisconnect() {
                                                  // the old one cannot be reused.
// conn = mysql.createConnection({
//   host : '220.230.112.62',
//   user : 'root',
//   password :'M6YT6T3iM!t',
//   database : 'mamre', // TODO : database connection, DB create,
// });
conn = mysql.createConnection('mysql://root:M6YT6T3iM!t@220.230.112.62/mamre');
  conn.connect(function(err) {              // The server is either down
    if(err) {                                     // or restarting (takes a while sometimes).
      console.log('error when connecting to db:', err);
      setTimeout(handleDisconnect, 2000); // We introduce a delay before attempting to reconnect,
    }                                     // to avoid a hot loop, and to allow our node script to
  });                                     // process asynchronous requests in the meantime.
                                          // If you're also serving http, display a 503 error.
  conn.on('error', function(err) {
    console.log('db error', err);
    if(err.code === 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is usually
      handleDisconnect();                         // lost due to either server restart, or a
    } else {                                      // connnection idle timeout (the wait_timeout
      throw err;                                  // server variable configures this)
    }
  });
}

handleDisconnect();

app.use(bodyParser.urlencoded({extended: false}));
app.locals.pretty = true;
app.set('views','./views');
app.set('view engine','jade');

// 번호 입력후 가입 or 포인트 적립
app.post('/api/member',function(req,res){
  var phone = req.body.phone;
  var yesno = 0;
  var sql = 'select * from customer where phone=?';
  conn.query(sql, [phone],function(err, member, fields){
    if(err){
        console.log(err);
        res.status(500).send('Internar Server Error');
    }
    // 폰 번호가 DB에 있으면 포인트 추가
    else {
      if(member.length===1){
        var sql='update customer set point = point + 1 where phone = ?';
        conn.query(sql,[phone],function(err, result, fields){
          if(err){
            console.log(err);
            res.status(500).send('Internal Server Error');
          }
        });
      }
        // 폰 번호가 DB에 없으면 회원 등록, 포인트 1 적립
      else{
        var point = 1;
        var sql = 'insert into customer (phone, point) values (?,?)';
        conn.query(sql, [phone, point],function(err,result,fields){
          if(err){
            console.log(err);
            res.status(500).send('Internal Server Error');
          }
          else{
            // 적립 완료
            res.send(적립);
          }
        });
      }
    }
  });
});

// 전화번호 정보 개별 조회
app.get('/api/member/:phone',function(req,res){
  var phone = req.params.phone;
  var sql='select * from customer where phone=?';
  conn.query(sql,[phone],function(err,member,fields){
    if(err){
      console.log(err);
      res.status(500).send('Internal Server Error');
    }
    else{
      res.json(member[0]);
    }
  })
})
// 전화번호 정보 전체 조회
app.get('/api/all',function(req,res){
  var sql = 'select * from customer';
  
      conn.query(sql, function(err,members,fields){
          if(err){
              console.log(err);
              res.status(500).send('Internal Server Error');
          }
          else{
            res.json(members);
          }
        })

  
})

// 삭제
app.post('/api/member/delete',function(req,res){
  var phone=req.body.phone;
  var sql='delete from customer where phone=?';
  conn.query(sql,[phone],function(err,result){
    //삭제완료
    res.send(삭제완료);
  });
});

// 포인트 변경
app.post('/api/member/edit',function(req,res){
  var point = req.body.point;
  var phone = req.body.phone;

  var sql = 'update customer set point = ? where phone = ?';
  conn.query(sql,[point, phone],function(err, result, fields){
    if(err){
      console.log(err);
      res.status(500).send('Internal Server Error');
    }
    else{
      res.send('edit complete');
    }
  });
});


app.listen(process.env.PORT || 3000, function(){
  console.log('Connected, port '+(process.env.PORT || 3000));
})
