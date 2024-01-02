import React, { useEffect, useState } from 'react'
import "./App.css"
import axios from 'axios'

function App() {
  const [jokes, setjokes]  = useState([])

  useEffect(() => {
    axios.get('/api/jokes')
    .then((res) => setjokes(res.data))
    .catch((error) =>{
      console.log(error)
    })
  }, [])
  return (
    <div>

      <h1>Jokes</h1>

      {jokes.map((joke) =>(
        <div key={joke.id}>
          <h1>{joke.title}</h1>
          <p>{joke.joke}</p>
        </div>
      ))}
    </div>
  )
}

export default App
