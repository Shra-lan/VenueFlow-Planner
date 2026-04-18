async function check(url) {
  const res = await fetch(url, { method: 'HEAD' });
  console.log(url, res.status);
}

async function run() {
  const titles = "File:Stamford_Bridge_-_West_Stand.jpg|File:Emirates_Stadium_interior.jpg|File:Camp_Nou_panorama.jpg|File:Santiago_Bernabeu_Stadium.jpg";
  const res = await fetch(`https://en.wikipedia.org/w/api.php?action=query&prop=imageinfo&iiprop=url&titles=${encodeURIComponent(titles)}&format=json`);
  const json = await res.json();
  const pages = json.query.pages;
  for (let p in pages) {
    if (pages[p].imageinfo) {
      console.log(pages[p].title, pages[p].imageinfo[0].url);
    }
  }
}
run();