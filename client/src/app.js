const express = require('express')
const app = express();
const path = require('path')
const hbs = require('hbs');
const port = process.env.PORT || 8080;
const templatepath = path.join(__dirname, "../templates/views");

app.set('view engine', 'hbs');
app.set('views', templatepath);

console.log(path.join(__dirname, "..", "public"));
app.use('/' , express.static(path.join(__dirname, "..", "public")));

app.get('/', (req,res) => {
    res.render("index");
})

app.listen(port, () => {
    console.log(`you are listening to the port ${port}`);
})
