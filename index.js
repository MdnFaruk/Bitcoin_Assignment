const express = require('express')
const path = require('path')
const app = express()

app.use(express.static(__dirname + '/public'))

app.get(('/'), function (req, res) {
  res.sendFile(path.join(__dirname + '/bitcoin_data.html'))
})


const port = 3000
app.listen(process.env.PORT || 3000, () => {
  console.log(`Server is running on port ${port}.`);
});  
