import "./App.css";
import { useEffect, useState } from "react";
import ReconnectingWebSocket from "reconnecting-websocket";

type Future = {
  ask: number;
  ask_size: number;
  bid: number;
  bid_size: number;
  change: number;
  dtm: number;
  feed: string;
  funding_rate: number;
  funding_rate_prediction: number;
  high: number;
  index: number;
  last: number;
  leverage: string;
  low: number;
  markPrice: number;
  maturityTime: number;
  next_funding_rate_time: number;
  open: number;
  openInterest: number;
  pair: string;
  post_only: boolean;
  premium: number;
  product_id: string;
  relative_funding_rate: number;
  relative_funding_rate_prediction: number;
  suspended: boolean;
  tag: string;
  time: number;
  volume: number;
  volumeQuote: number;
};

function App() {
  const [BTCprice, setBTCprice] = useState(null);
  const [ETHprice, setETHprice] = useState(null);
  const [futures, setFutures] = useState<{ [productId: string]: Future }>({});

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
      // console.log(data);
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
        setFutures((prevPrices) => ({
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
    <div className="rizz">
      <h3>Rizzfeed, the feed with rizz, made for Rizzi</h3>
      <table>
        <tr className="bold">
          <td className="big">Coin</td>
          <td className="big twocol">Contract</td>
          <td className="big threecol">Current Px</td>
          <td className="big twocol">Basis</td>
          <td className="big fivecol">Futures Info</td>
        </tr>

        <tr className="bold">
          <td>Ticker</td>
          <td>Name</td>
          <td>
            Open
            <br />
            Interest
          </td>
          <td>Bid</td>
          <td>Ask</td>
          <td>Mid</td>
          <td>Basis $</td>
          <td>Basis %</td>
          <td>Expiry</td>
          <td>
            Days
            <br />
            To <br />
            Expiry
          </td>
          <td>
            Hourly
            <br />
            Funding
          </td>
          <td>
            Funding
            <br />
            Predict
          </td>
          <td>
            Funding
            <br />
            Prediction
            <br />
            annualised
          </td>
        </tr>

        <tr>
          <td className="bold btc">BTC</td>
          <td className="bold">Spot</td>
          <td>n/a</td>
          <td className="big bold threecol">${BTCprice}</td>
          <td className="sevencol">n/a</td>
        </tr>

        <tr>
          <td className="bold btc">BTC</td>
          <td className="bold">Perp</td>
          <td>{futures["PI_XBTUSD"]?.openInterest}</td>
          <td>${futures["PI_XBTUSD"]?.bid}</td>
          <td>${futures["PI_XBTUSD"]?.ask}</td>
          <td>${(futures["PI_XBTUSD"]?.bid + futures["PI_XBTUSD"]?.ask) / 2}</td>
          <td>
            ${BTCprice ? (futures["PI_XBTUSD"]?.bid + futures["PI_XBTUSD"]?.ask) / 2 - BTCprice : "spot loading..."}
          </td>
          <td>%{futures["PI_XBTUSD"]?.funding_rate * 24 * 365}</td>
          <td>n/a</td>
          <td>n/a</td>
          <td>%{futures["PI_XBTUSD"]?.funding_rate}</td>
          <td>%{futures["PI_XBTUSD"]?.funding_rate_prediction}</td>
          <td>%{futures["PI_XBTUSD"]?.funding_rate_prediction * 24 * 365}</td>
        </tr>
        <tr>
          <td className="bold eth">ETH</td>
          <td className="bold">Spot</td>
          <td>n/a</td>
          <td className="big bold threecol">${ETHprice}</td>
          <td className="sevencol">n/a</td>
        </tr>
        <tr>
          <td className="bold eth">ETH</td>
          <td className="bold">Perp</td>
          <td>{futures["PI_ETHUSD"]?.openInterest}</td>
          <td>${futures["PI_ETHUSD"]?.bid}</td>
          <td>${futures["PI_ETHUSD"]?.ask}</td>
          <td>${(futures["PI_ETHUSD"]?.bid + futures["PI_ETHUSD"]?.ask) / 2}</td>
          <td>
            ${BTCprice ? (futures["PI_ETHUSD"]?.bid + futures["PI_ETHUSD"]?.ask) / 2 - BTCprice : "spot loading..."}
          </td>
          <td>%{futures["PI_ETHUSD"]?.funding_rate * 24 * 365}</td>
          <td>n/a</td>
          <td>n/a</td>
          <td>%{futures["PI_ETHUSD"]?.funding_rate}</td>
          <td>%{futures["PI_ETHUSD"]?.funding_rate_prediction}</td>
          <td>%{futures["PI_ETHUSD"]?.funding_rate_prediction * 24 * 365}</td>
        </tr>
      </table>
    </div>
  );
}

export default App;
