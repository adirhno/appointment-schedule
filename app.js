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
  host: "94.228.113.90",
  password: "2e5d1870",
  user: "hostman",
  database: "database",
});

conn.connect();

app.get("/groups", (req, res) => {
  let sql = "SELECT * FROM groups";
  conn.query(sql, (err, results, fields) => {
    res.send(`{"groups": ${JSON.stringify(results)}} `);
  });
});

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
