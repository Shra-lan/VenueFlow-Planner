async function test() {
  try {
    const res = await fetch('http://localhost:3000/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: "Hello", history: [] })
    });
    console.log("Status:", res.status);
    console.log("Content-Type:", res.headers.get("content-type"));
    const text = await res.text();
    console.log("Body length:", text.length);
    try {
      console.log("JSON:", JSON.parse(text));
    } catch (e) {
      console.log("JSON Parse Error:", e.message);
      console.log("Raw text:", text.slice(0, 200));
    }
  } catch (e) {
    console.error("Fetch Error:", e);
  }
}

test();
