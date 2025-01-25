import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import { useEffect, useState } from "react";

function App() {
  const [price, setPrice] = useState(null);

  useEffect(() => {
    const ws = new WebSocket("wss://ws.kraken.com/");

    ws.onopen = () => {
      const subscribeMessage = {
        event: "subscribe",
        pair: ["XBT/USD"],
        subscription: { name: "ticker" },
      };
      ws.send(JSON.stringify(subscribeMessage));
      console.log("Subscribed to BTC/USD ticker");
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log(data);
      // Check if the message is a ticker update
      if (Array.isArray(data) && data[1] && data[1].c) {
        setPrice(data[1].c[0]); // Set the price to the current price
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket Error:", error);
    };

    ws.onclose = () => {
      console.log("WebSocket connection closed");
    };

    // Cleanup on unmount
    return () => {
      ws.close();
    };
  }, []);

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Rizzfeed, the feed with rizz, made for Rizzi</h1>
      <p>Current BTC/USD price is {price}</p>
    </>
  );
}

export default App;
