import { useEffect, useState } from "react";
import React from "react";
import "./App.css";
import { BIBLE_IDS } from "./constants";
import bgImage from "./assets/img/bg.jpg";

import { createTheme, ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import "@fontsource/inter";

import Box from "@mui/material/Box";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import ListSubheader from "@mui/material/ListSubheader";

function App() {
  const theme = createTheme({
    typography: {
      fontFamily: "Inter, sans-serif",
    },
  });

  // const apiKey = "55f65f8622a4f2f35fea62e92d606a46";
  // const apiKey = "fac2182cab1f5f27c64d48b8ad9b7586";
  // const apiKey = "65b98596e723fff3449dcdb2c0830076";
  const apiKey = "f158bfe193d137b2cbac813876f710ef";

  const [bible, setBible] = useState(BIBLE_IDS[4] || { id: "", nameLocal: "" });
  const [bibleId, setBibleId] = useState(BIBLE_IDS[4]?.id || "");
  const [books, setBooks] = useState([]);
  const [selectedBook, setSelectedBook] = useState("");
  const [chapters, setChapters] = useState([]);
  const [error, setError] = useState(null);
  const [selectedPassage, setSelectedPassage] = useState('');
  const [text, setText] = useState("[1]Lorem ipsum dolor set amet consectetur adipiscing elit");
  const [verses, setVerses] = useState([]);

  const formatText = (text) => {
    return text.replace(/\[(\d+)\]/g, '<span class="superindex">$1</span>');
  };


  const handleChangeBible = (event) => {
    const selectedBible = BIBLE_IDS.find((b) => b.id === event.target.value);
    if (selectedBible) {
      setBible(selectedBible);
      setBibleId(selectedBible.id);
      setSelectedBook("");
      setBooks([]);
      setChapters([]);
      setVerses([]);
      setSelectedPassage("");
    }
  };

  const handleChangeBook = (event) => {
    setSelectedBook(event.target.value);
  };

  const handleChangePassage = (event) => {
    console.log(event.target.value)
    setSelectedPassage(event.target.value);
  };

  useEffect(() => {
    if (!bible.id) return;

    fetch(`https://api.scripture.api.bible/v1/bibles/${bibleId}/books`, {
      method: "GET",
      headers: {
        "api-key": apiKey,
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);
        return response.json();
      })
      .then((data) => {
        setBooks(data.data.map((book) => ({ id: book.id, name: book.name })));
        setSelectedBook(data.data[0].id);
      })
      .catch((error) => setError(error.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bibleId]);

  useEffect(() => {
    if (!selectedBook) return;

    fetch(`https://api.scripture.api.bible/v1/bibles/${bibleId}/books/${selectedBook}/chapters`, {
      method: "GET",
      headers: {
        "api-key": apiKey,
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);
        return response.json();
      })
      .then((data) => {
        const chapterIds = data.data.map((chapter) => chapter.id);
        chapterIds.shift();
        setChapters(chapterIds);
      })
      .catch((error) => setError(error.message));
  }, [bibleId, selectedBook]);


  useEffect(() => {
    if (!selectedBook || !Array.isArray(chapters) || chapters.length === 0) return;

    setVerses([]);
    setError(null);

    const allVerses = [];

    let promises = chapters.map((chapter) => {
      if (!chapter || typeof chapter !== "string" || !/\d+/.test(chapter)) {
        console.error("Capítulo inválido:", chapter);
        return Promise.resolve();
      }

      return fetch(
        `https://api.scripture.api.bible/v1/bibles/${bibleId}/chapters/${chapter}?content-type=json&include-notes=false&include-titles=false&include-chapter-numbers=false&include-verse-numbers=true&include-verse-spans=false`,
        {
          method: "GET",
          headers: {
            "api-key": apiKey,
            "Content-Type": "application/json",
          },
        }
      )
        .then((response) => {
          if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
          }
          return response.json();
        })
        .then(({ data }) => {
          // Crear un objeto para el capítulo
          let chapter = {
            id: data.id,
            verses: []
          };

          // Recorrer el contenido del capítulo
          data.content.forEach(para => {
            para.items.forEach(item => {
              if (item.name === 'verse') {
                // Extraer el número del versículo
                let verseNumber = item.attrs.number;

                // Buscar el texto del versículo en los siguientes items
                let verseText = '';
                let nextItem = para.items[para.items.indexOf(item) + 1];
                if (nextItem && nextItem.type === 'text') {
                  verseText = nextItem.text;
                }

                // Crear el objeto del versículo y agregarlo al array verses
                chapter.verses.push({
                  id: `${data.id}:${verseNumber}`,
                  verse: verseText
                });
              }
            });
          });

          // Agregar el objeto del capítulo al array allVerses
          allVerses.push(chapter);
        })
        .catch((fetchError) => {
          console.error("Error al obtener capítulos:", fetchError);
          setError(fetchError.message);
        });
    });

    Promise.all(promises)
      .then(() => setVerses(
        allVerses.sort((a, b) => {
          const numA = a.id.match(/\d+/) ? parseInt(a.id.match(/\d+/)[0], 10) : 0;
          const numB = b.id.match(/\d+/) ? parseInt(b.id.match(/\d+/)[0], 10) : 0;
          return numA - numB;
        })
      ))
      .catch((finalError) => {
        console.error("Error al procesar capítulos:", finalError);
        setError(finalError.message);
      });
  }, [bibleId, selectedBook, chapters]);

  console.log(selectedPassage)

  return (
    <>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <img src={bgImage} alt="background" />
        <div className="wrapper">
          <header>
            <div className="left">
              <Box sx={{ minWidth: 150, width: 200 }}>
                <FormControl variant="filled">
                  <InputLabel
                    id="bible-select-label"
                    shrink
                    sx={{
                      color: "white",
                      "&.Mui-focused": { color: "white" },
                    }}
                  >
                    Biblia
                  </InputLabel>
                  <Select
                    labelId="bible-select-label"
                    id="bible-select"
                    value={bible?.id || ""}
                    onChange={handleChangeBible}
                    displayEmpty
                    sx={{
                      color: "white",
                      background: "rgba(0, 0, 0, 0.5)",
                      borderRadius: "8px",
                      ".MuiOutlinedInput-notchedOutline": {
                        borderColor: "white",
                      },
                      ".MuiSelect-icon": {
                        color: "#FFFF",
                      },
                    }}
                  >
                    {BIBLE_IDS.map((bible) => (
                      <MenuItem key={bible.id} value={bible.id} sx={{ color: "black", fontWeight: "bold" }}>
                        {bible.nameLocal}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </div>
            <div className="right">
              <Box sx={{ minWidth: 150, width: 200 }}>
                <FormControl fullWidth variant="filled">
                  <InputLabel
                    id="book-select-label"
                    shrink
                    sx={{
                      color: "white",
                      "&.Mui-focused": { color: "white" },
                    }}
                  >
                    Libro
                  </InputLabel>
                  <Select
                    labelId="book-select-label"
                    id="book-select"
                    value={selectedBook || ""}
                    onChange={handleChangeBook}
                    displayEmpty
                    sx={{
                      color: "white",
                      background: "rgba(0, 0, 0, 0.5)",
                      borderRadius: "8px",
                      ".MuiOutlinedInput-notchedOutline": {
                        borderColor: "white",
                      },
                      ".MuiSelect-icon": {
                        color: "#FFFF",
                      },
                    }}
                  >
                    {books.map((b) => (
                      <MenuItem key={b.id} value={b.id} sx={{ color: "black", fontWeight: "bold" }}>
                        {b.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              <Box sx={{ minWidth: 150, width: 200 }}>
                <FormControl fullWidth variant="filled">
                  <InputLabel
                    htmlFor="grouped-select"
                    shrink
                    sx={{ color: "white", "&.Mui-focused": { color: "white" } }}
                  >
                    Pasaje
                  </InputLabel>
                  {verses.length > 0 && (
                    <Select
                      value={selectedPassage || ''} // Asegúrate de que selectedPassage sea válido o vacío
                      onChange={handleChangePassage}
                      id="grouped-select"
                      sx={{ color: "white", background: "rgba(0, 0, 0, 0.5)" }}
                    >
                      {verses.map((chapter) => (
                        <React.Fragment key={chapter.id}>
                          <ListSubheader sx={{ background: "rgba(0, 0, 0, 0.8)", color: "white" }}>
                            {chapter.id}
                          </ListSubheader>
                          {chapter.verses.map((verse) => (
                            <MenuItem key={verse.id} value={selectedBook+" "+verse.id.split('.')[1]}>
                              {selectedBook+" "+verse.id.split('.')[1]}
                            </MenuItem>
                          ))}
                        </React.Fragment>
                      ))}
                    </Select>
                  )}
                </FormControl>
              </Box>


            </div>
          </header>
          <main>
            {error ? <p style={{ color: "red" }}>Error: {error}</p> : null}
            <p dangerouslySetInnerHTML={{ __html: formatText(text) }}></p>
          </main>
        </div>
      </ThemeProvider>
    </>
  );
}

export default App;