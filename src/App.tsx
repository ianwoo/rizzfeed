import "./App.css";
import { useEffect, useState } from "react";

function App() {
  const [BTCprice, setBTCprice] = useState(null);
  const [ETHprice, setETHprice] = useState(null);

  useEffect(() => {
    const ws = new WebSocket("wss://ws.kraken.com/");

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

    // Cleanup on unmount
    return () => {
      ws.close();
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
    </>
  );
}

export default App;
