const express = require("express");
const app = express();
const MongoClient = require("mongodb").MongoClient,
  f = require("util").format;

const uri =
  "mongodb+srv://Pragyna:NavyBlue2016@mlathletedataset.lhiuy.mongodb.net/<dbname>?retryWrites=true&w=majority";
__dirname = "/Users/pragynanaik/Desktop/MLAthlete/MLAthleteDatasets/WebsiteTry";
const filteringInput = {};

let converter = require("json-2-csv");
const fs = require("fs");

var bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static("public"));

function connectMongo() {
  MongoClient.connect(
    uri,
    { useNewUrlParser: true },
    {
      // retry to connect for 60 times
      reconnectTries: 60,
      // wait 1 second before retrying
      reconnectInterval: 1000,
    },
    {
      db: {
        native_parser: false,
        retryMiliSeconds: 100000,
        numberOfRetries: 100,
      },
      server: {
        reconnectTries: Number.MAX_VALUE,
        autoReconnect: true,
      },
    },

    (err, database) => {
      if (err) return console.log(err);
      db = database;
    }
  );
}

app.listen(3000, () => {
  console.log("connected to mongoDB successfully. now listening on port 3000 ");
});

MongoClient.connect(
  uri,
  { useNewUrlParser: true },
  {
    // retry to connect for 60 times
    reconnectTries: 60,
    // wait 1 second before retrying
    reconnectInterval: 1000,
  },
  {
    db: {
      native_parser: false,
      retryMiliSeconds: 100000,
      numberOfRetries: 100,
    },
    server: {
      reconnectTries: Number.MAX_VALUE,
      autoReconnect: true,
    },
  },

  (err, database) => {
    if (err) return console.log(err);
    db = database;
  }
);

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/index.html");
  filteringInput = {};
});

app.post("/clickedGender", function (request, response) {
  connectMongo();

  if (request.body.Gender == "Both") {
    delete filteringInput["Gender"];
  } else {
    filteringInput["Gender"] = request.body.Gender;
  }

  var dbo = db.db("allData");

  dbo
    .collection("allYear")
    .find(filteringInput)
    .toArray(function (err, result) {
      if (err) return console.log(err);
      response.send({ Gender: result.length });
      db.close();
    });
});

app.post("/clickedRound", function (request, response) {
  connectMongo();
  if (request.body["Round Number"] == "Any Round") {
    delete filteringInput["Round Number"];
  } else {
    filteringInput["Round Number"] = request.body["Round Number"];
  }

  var dbo = db.db("allData");

  dbo
    .collection("allYear")
    .find(filteringInput)
    .toArray(function (err, result) {
      if (err) return console.log(err);

      response.send({ "Round Number": result.length });
      db.close();
    });
});

app.post("/clickedMatch", function (request, response) {
  connectMongo();
  if (request.body["Match Type"] == "Any type of Match") {
    delete filteringInput["MatchType"];
  } else {
    filteringInput["MatchType"] = request.body["Match Type"];
  }

  var dbo = db.db("allData");

  dbo
    .collection("allYear")
    .find(filteringInput)
    .toArray(function (err, result) {
      if (err) return console.log(err);

      response.send({ "Match Type": result.length });
      db.close();
    });
});

app.post("/clickedDate", function (request, response) {
  connectMongo();
  const constraints = request.body["Date"];

  if (constraints.length == 0) {
    delete filteringInput["Date"];
  } else {
    const dateConstraint = {};
    dateConstraint["$in"] = constraints;
    filteringInput["Date"] = dateConstraint;
  }

  var dbo = db.db("allData");

  dbo
    .collection("allYear")
    .find(filteringInput)
    .toArray(function (err, result) {
      if (err) return console.log(err);
      response.send({ Date: result.length });
      db.close();
    });
});

app.post("/clickedPlayer", function (request, response) {
  connectMongo();
  const constraintsP = request.body["Player"];

  if (constraintsP.length == 0) {
    delete filteringInput["$or"];
  } else {
    const playerConstraint = {};
    const players = {};
    const players2 = {};

    playerConstraint["$in"] = constraintsP;
    players["Player/Team 1 Name"] = playerConstraint;
    players2["Player/Team 2 Name"] = playerConstraint;

    filteringInput["$or"] = [players, players2];
  }

  var dbo = db.db("allData");

  dbo
    .collection("allYear")
    .find(filteringInput)
    .toArray(function (err, result) {
      if (err) return console.log(err);
      response.send({ Player: result.length });
    });
});

app.post("/clickedDownload", function (request, response) {
  connectMongo();

  var dbo = db.db("allData");

  dbo
    .collection("allYear")
    .find(filteringInput)
    .toArray(function (err, result) {
      if (err) return console.log(err);
      response.send({ Download: result.length });
      const arrayObjects = JSON.parse(JSON.stringify(result));

      converter.json2csv(arrayObjects, (err, csv) => {
        if (err) {
          throw err;
        }

        // write CSV to a file
        fs.writeFileSync("matches.csv", csv);
        console.log("downloaded");
      });

      db.close();
    });
});

app.post("/clickedSubmit", function (request, response) {
  connectMongo();

  var dbo = db.db("allData");

  dbo
    .collection("allYear")
    .find(filteringInput)
    .toArray(function (err, result) {
      if (err) return console.log(err);
      response.send({ Submit: result.length });
      db.close();
    });
});
