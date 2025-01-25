import "./App.css";
import { useEffect, useState } from "react";

function App() {
  const [price, setPrice] = useState(null);

  useEffect(() => {
    const ws = new WebSocket("wss://ws.kraken.com/");

    ws.onopen = () => {
      const subscribeMessage = {
        event: "subscribe",
        pair: ["BTC/USD"],
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
      <h1>Rizzfeed, the feed with rizz, made for Rizzi</h1>
      <p>Current BTC/USD price is {price}</p>
      <table>
        <thead>BTC/USD</thead>
        <tr>
          <td>{price}</td>
        </tr>
      </table>
    </>
  );
}

export default App;
