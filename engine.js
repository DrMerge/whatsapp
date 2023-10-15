require("dotenv").config();
const qrcode = require("qrcode");
const fs = require("fs");
const path = require("path");
const { Client } = require("whatsapp-web.js");
const client = new Client();
const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

const engine = () => {
  const prompt = fs.readFileSync(path.join(__dirname, "prompt3.txt"), "utf8");
  const character = fs.readFileSync(
    path.join(__dirname, "character.txt"),
    "utf8"
  );

  client.on("qr", (qr) => {
    qrcode.toFile(
      path.join(__dirname, "public", "qr.png"),
      qr,
      {
        errorCorrectionLevel: "H",
        type: "png",
        width: 500, // The width of the QR code image in pixels
      },
      function (err) {
        if (err) throw err;
        console.log("QR code image saved");
      }
    );
    res.sendFile(path.join(__dirname, "public", "qr.png")).status(200);
  });

  client.on("message", async (message) => {
    if (message.body != "") {
      try {
        const response1 = await openai.createCompletion({
          model: "text-davinci-003",
          prompt: `Decide whether a Tweet\'s sentiment is a question.\n\nTweet:You dey crase?\nAnswer:Yes\nTweet:Have you fucked\nAnswer:Yes\nTweet:Who did you fuck\nAnswer:Yes\nTweet:You dey crase?\nAnswer:Yes\nTweet:I am a boy\nAnswer:No\nTweet: ${message.body}\nAnswer: `,
          temperature: 0,
          max_tokens: 60,
          top_p: 1,
          frequency_penalty: 0.5,
          presence_penalty: 0,
        });
        const data1 = response1.data.choices[0].text;
        console.log(data1);
        if (data1.includes("Yes") === true) {
          const formatedMsg = `${message.body}?`;
          try {
            const response = await openai.createCompletion({
              model: "text-davinci-003",
              prompt: ` ${prompt},\nYou: ${formatedMsg}`,
              temperature: 0.3,
              max_tokens: 60,
              top_p: 0.3,
              frequency_penalty: 0.5,
              presence_penalty: 0,
            });

            const data = response.data.choices[0].text;
            message.reply(data);
            console.log(message.body);
          } catch (err) {
            console.log("Problem parsing data from AI");
          }
        } else {
          const formatedMsg = `${message.body}.`;
          try {
            const response = await openai.createCompletion({
              model: "text-davinci-003",
              prompt: `${prompt},\nYou: ${formatedMsg}`,
              temperature: 0.3,
              max_tokens: 60,
              top_p: 0.3,
              frequency_penalty: 0.5,
              presence_penalty: 0,
            });

            const data = response.data.choices[0].text;
            message.reply(data);
            console.log(message.body);
          } catch (err) {
            console.log("Problem parsing data from AI");
          }
        }
      } catch (err) {
        console.log("Problem loading sentiment");
      }
    }
  });

  client.initialize();
};

module.exports = engine;
