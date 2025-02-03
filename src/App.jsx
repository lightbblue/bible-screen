import { useEffect, useState } from 'react'
import './App.css'
import { BIBLE_IDS } from './constants'

function App() {
  // https://api.scripture.api.bible/v1/bibles?language=spa
  const apiKey = "fac2182cab1f5f27c64d48b8ad9b7586"
  
  const [bible, setBible] = useState(BIBLE_IDS[0])
  const [bibleId, setBibleId] = useState(bible.id)
  const [bibleName, setBibleName] = useState(bible.nameLocal)
  const [chapters, setChapters] = useState([])
  
  useEffect(() => {
    setBibleId(bible.id)
    setBibleName(bible.nameLocal)
    fetch(`https://api.scripture.api.bible/v1/bibles/${bibleId}/books`, {
      method: "GET",
      headers: {
        "api-key" : apiKey,
        "Content-Type": "application/json"
      }
    })
      .then(response => response.json())
      .then(data => setChapters(data.data.map(book => book.id)))
      .catch(error => console.error("Error fetching data:", error));
  }, [bible, bibleId]);

  console.log(chapters)
  
  return (
    <>
      <img src="src\assets\img\bg.jpg"/>
      <div className='wrapper'>
        <header>
          <div className='mid'>
            <h2>Apocalipsis</h2>
            <h2>1:10</h2>
          </div>
          <h2 className='bibleType'>{bibleName}</h2>
        </header>
        <main>
          <h1>Lorem, ipsum dolor sit amet consectetur adipisicing elit. Quo commodi molestiae eum fugit atque facilis qui quia unde vero voluptas praesentium, placeat autem voluptates quam asperiores saepe, omnis vitae doloremque!Lorem</h1>
        </main>
      </div>
    </>
    
  )
}

export default App
