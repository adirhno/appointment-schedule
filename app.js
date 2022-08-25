/** @format */
let bodyParser = require("body-parser");
let express = require("express");
let Joi = require("joi");

const cors = require("cors");
const mysql = require("mysql");
const { config } = require("nodemon");

let app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const conn = mysql.createConnection({
  host: "eu-cdbr-west-03.cleardb.net",
  password: "b83ce3c0",
  user: "b716cb656f53c5",
  database: "heroku_13d18506e7b1061",
});
//b716cb656f53c5:b83ce3c0@eu-cdbr-west-03.cleardb.net/heroku_13d18506e7b1061?reconnect=true

conn.connect();

app.get("/", (req, res) => {
  let sql = "SELECT * FROM groups";
  conn.query(sql, (err, results, fields) => {
    res.send(`{"groups": ${JSON.stringify(results)}} `);
  });
});

// app.get("/groups", (req, res) => {
//   let sql = "SELECT * FROM groups";
//   conn.query(sql, (err, results, fields) => {
//     res.send(`{"groups": ${JSON.stringify(results)}} `);
//   });
// });

app.get("/meetings", (req, res) => {
  let sql = `SELECT * FROM meetings WHERE group_id=${req.query.id}`;

  conn.query(sql, (err, results, fields) => {
    res.send(`{"meeting": ${JSON.stringify(results)}} `);
  });
});

app.get("/check", (req, res) => {
  let start = req.query.start;

  conn.query(
    `SELECT * FROM meetings WHERE group_id= ${req.query.id}`,
    (err, results, fields) => {
      results.forEach((element, index) => {
        let startDate = new Date(element.start_time);

        results[index].start_time = `${startDate.getFullYear()}/${
          startDate.getMonth() + 1
        }/${startDate.getDay()}  ${startDate.getHours()}:00`;
        if (start === results[index].start_time) {
          res.send({
            err: "choose another date, meeting already assigned at this date",
          });
        }
      });
    }
  );
});

app.post("/add", (req, res) => {
  let start = req.body.start;
  let finish = req.body.finish;
  let room = req.body.room;
  let des = req.body.des;
  let group_id = req.body.group_id;

  const vali = {
    start: start,
    finish: finish,
    room: room,
    description: des,
    group_id: group_id,
  };

  const schema = Joi.object().keys({
    start: Joi.date().required(),
    finish: Joi.date().required(),
    room: Joi.string().required(),
    description: Joi.string().required(),
    group_id: Joi.number().required(),
  });

  const checkValid = schema.validate(vali);
  if (checkValid.error) {
    res.send({ err: checkValid.error.details[0].message });
  } else {
    let sql = `INSERT INTO meetings (id, group_id, start_time, finish_time, description, room) VALUES ('','${group_id}','${start}','${finish}','${des}','${room}')`;
    conn.query(sql, (err, results, fields) => {});
  }
});

const po = process.env.PORT || 3333;
app.listen(po, console.log("Listening to port 9999-task-3"));
