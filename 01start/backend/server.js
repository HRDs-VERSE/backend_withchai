// import 'dotenv/config'
import express from "express"
const app = express()
const port = process.env.PORT || 3000

app.get('/api/jokes', (req, res) => {
  const jokes = [
    {
      id: 1,
      title: 'joke 1',
      joke: 'nikal laude'
    }
  ];
  res.send(jokes);
})

app.listen(port , () => {
  console.log(`Example app listening on port ${port}`)
})