const fs = require("fs");
const http = require("http");
const https = require("https");
const url = require("url");

const credentials = require("./auth/credentials.json");

const port = 3000;
const server = http.createServer();

server.on("listening", listen_handler);
server.listen(port);

function listen_handler() {
    console.log(`Now Listening on Port ${port}`);
}

server.on("request", request_handler);

function request_handler(req, res) {
    console.log(`New Request from ${req.socket.remoteAddress} for ${req.url}`);
    if (req.url === "/") {
        const form = fs.createReadStream("html/index.html");
        res.writeHead(200, { "Content-Type": "text/html" })
        form.pipe(res);
    } else if (req.url.startsWith("/v1/questions")) {
        let { difficulty } = url.parse(req.url, true).query;
        get_quiz_information(difficulty, res);
        // setTimeout(() => get_job_information.end(), 5000);
    } else {
        res.writeHead(404, { "Content-Type": "text/html" });
        res.end(`<h1>404 Not Found</h1>`);
    }
}

function get_quiz_information(difficulty, res) {
    const quiz_endpoint = `https://quizapi.io/api/v1/questions?difficulty=${difficulty}`;
    const quiz_request = https.get(quiz_endpoint, { method: "GET", headers: credentials });
    quiz_request.once("response", stream => process_stream(stream, parse_results));

    function process_stream(quiz_stream) {
        let quiz_data = "";
        quiz_stream.on("data", chunk => quiz_data += chunk);
        quiz_stream.on("end", () => parse_results(quiz_data, res));
    }




}

function boreapi(quiz_value, res) {


    https
        .get("https://www.boredapi.com/api/activity/", (resp) => {
            let data = "";
            resp.on("data", (chunk) => {
                data += chunk;
            });
            resp.on("end", () => {
                const parsedData = JSON.parse(data);
                const fun_activity = parsedData.activity;

                res.end(`<div style="width:49%; float:left;"><h1>Quiz question:</h1>${quiz_value}</div><div style="width:39%; float:right;"><h2>Are you bored? Try this:</h2>${fun_activity}</div>`);

            })
        })

}


function parse_results(quiz_data, res) {
    let quiz_object = JSON.parse(quiz_data);
    let quiz_str = JSON.stringify(quiz_object[1]);
    let quiz_obj = JSON.parse(quiz_str);
    let quiz_value = quiz_obj.question;

    //setTimeout(() => serve_results.end(), 5000);
    // Adds 5s delay swap out line above this

    boreapi(quiz_value, res);

}