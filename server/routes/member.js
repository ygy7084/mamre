'use strict';

import express from 'express';
import {mysql} from '../modules';

const router = express.Router();

const conn = mysql.getConnection;


// 번호 입력후 가입 or 포인트 적립
router.post('/',function(req,res){
    console.log('a');
    let phone = req.body.phone;
    let yesno = 0;
    let sql = 'select * from customer where phone=?';
    conn().query(sql, [phone],function(err, member, fields){
        if(err){
            console.log(err);
            res.status(500).send('Internar Server Error');
        }
        // 폰 번호가 DB에 있으면 포인트 추가
        else {
            if(member.length===1){
                let sql='update customer set point = point + 1 where phone = ?';
                conn().query(sql,[phone],function(err, result, fields){
                    if(err){
                        console.log(err);
                        res.status(500).send('Internal Server Error');
                    }
                });
            }
            // 폰 번호가 DB에 없으면 회원 등록, 포인트 1 적립
            else{
                let point = 1;
                let sql = 'insert into customer (phone, point) values (?,?)';
                conn().query(sql, [phone, point],function(err,result,fields){
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

// 전화번호 정보 전체 조회
router.get('/all',(req,res) => {

    let sql = 'select * from customer';
    conn().query(sql, function(err,members,fields){
        if(err){
            console.log(err);
            res.status(500).send('Internal Server Error');
        }
        else{
            res.json(members);
        }
    })


});

// 삭제
router.post('/delete',function(req,res){
    let phone=req.body.phone;
    let sql='delete from customer where phone=?';
    conn().query(sql,[phone],function(err,result){
        //삭제완료
        res.send('삭제완료');
    });
});

// 포인트 변경
router.post('/edit',function(req,res){
    let point = req.body.point;
    let phone = req.body.phone;

    let sql = 'update customer set point = ? where phone = ?';
    conn().query(sql,[point, phone],function(err, result, fields){
        if(err){
            console.log(err);
            res.status(500).send('Internal Server Error');
        }
        else{
            res.send('edit complete');
        }
    });
});

// 전화번호 정보 개별 조회
router.get('/:phone',function(req,res){
    let phone = req.params.phone;
    let sql='select * from customer where phone=?';
    conn().query(sql,[phone],function(err,member,fields){
        if(err){
            console.log(err);
            res.status(500).send('Internal Server Error');
        }
        else{
            res.json(member[0]);
        }
    })
});

export default router;