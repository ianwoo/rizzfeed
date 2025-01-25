import "./App.css";
import { useEffect, useState } from "react";
import ReconnectingWebSocket from "reconnecting-websocket";

function App() {
  const [BTCprice, setBTCprice] = useState(null);
  const [ETHprice, setETHprice] = useState(null);
  const [futuresPrices, setFuturesPrices] = useState<{ [productId: string]: { price: string; volume: string } }>({});

  useEffect(() => {
    //SPOT
    const ws = new ReconnectingWebSocket("wss://ws.kraken.com/");

    ws.onopen = () => {
      const subscribeMessage = {
        event: "subscribe",
        pair: ["BTC/USD", "ETH/USD"],
        subscription: { name: "ticker" },
      };
      ws.send(JSON.stringify(subscribeMessage));
      console.log("Subscribed to BTC/USD ticker");
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log(data);
      // Check if the message is a ticker update
      if (data[3] === "ETH/USD") {
        setETHprice(data[1].c[0]); // Assuming the message structure contains the price at data[1].c[0]
      } else if (data[3] === "XBT/USD") {
        setBTCprice(data[1].c[0]); // Assuming the message structure contains the price at data[1].c[0]
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket Error:", error);
    };

    ws.onclose = () => {
      console.log("WebSocket connection closed");
    };

    //FUTURES
    // Define the WebSocket URL for Kraken's public futures prices
    const fws = new ReconnectingWebSocket("wss://futures.kraken.com/ws/v1");

    // Open WebSocket connection and subscribe to the ticker channel for ETH and BTC futures
    fws.onopen = () => {
      fws.send(
        JSON.stringify({
          event: "subscribe",
          feed: "ticker",
          product_ids: ["PI_XBTUSD", "PI_ETHUSD"],
        })
      );
    };

    // Handle incoming WebSocket messages
    fws.onmessage = (event) => {
      const message = JSON.parse(event.data);

      // Check if the message is a ticker update
      if (message.feed === "ticker") {
        setFuturesPrices((prevPrices) => ({
          ...prevPrices,
          [message.product_id]: message,
        }));
      }
    };

    // Handle WebSocket errors
    ws.onerror = (err) => {
      console.error("WebSocket error:", err);
      // setError("WebSocket error");
    };

    // Cleanup on unmount
    return () => {
      ws.close();
      fws.close();
    };
  }, []);

  return (
    <>
      <h1>Rizzfeed, the feed with rizz, made for Rizzi</h1>
      <table>
        <tr>
          <td>BTC/USD</td>
          <td>ETH/USD</td>
        </tr>
        <tr>
          <td>{BTCprice}</td>
          <td>{ETHprice}</td>
        </tr>
      </table>
      <div>
        {Object.keys(futuresPrices).map((productId) => (
          <div key={productId}>
            <h2>{productId}</h2>
            <p>Price: {futuresPrices[productId].price}</p>
            <p>Volume: {futuresPrices[productId].volume}</p>
          </div>
        ))}
      </div>
    </>
  );
}

export default App;
