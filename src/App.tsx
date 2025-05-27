import "./App.css";
import { useCallback, useEffect, useState } from "react";
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

const coins: { symbol: string }[] = [
  { symbol: "XBT" },
  { symbol: "ETH" },
  { symbol: "SOL" },
  { symbol: "XRP" },
  { symbol: "ADA" },
  { symbol: "LTC" },
  { symbol: "BCH" },
  { symbol: "UNI" },
  { symbol: "TRUMP" },
  { symbol: "JUP" },
  { symbol: "SUI" },
  { symbol: "POPCAT" },
  { symbol: "WIF" },
  { symbol: "RUNE" },
  { symbol: "LINK" },
];

const oneDay = 24 * 60 * 60 * 1000;

function App() {
  //due to the nature of websockets vs. react hooks, we have to manually insert these with a function:
  const [BTCprice, setBTCprice] = useState<number | undefined>(undefined);
  const [ETHprice, setETHprice] = useState<number | undefined>(undefined);
  const [SOLprice, setSOLprice] = useState<number | undefined>(undefined);
  const [XRPprice, setXRPprice] = useState<number | undefined>(undefined);
  const [ADAprice, setADAprice] = useState<number | undefined>(undefined);
  const [LTCprice, setLTCprice] = useState<number | undefined>(undefined);
  const [BCHprice, setBCHprice] = useState<number | undefined>(undefined);
  const [UNIprice, setUNIprice] = useState<number | undefined>(undefined);
  const [TRUMPprice, setTRUMPprice] = useState<number | undefined>(undefined);
  const [JUPprice, setJUPprice] = useState<number | undefined>(undefined);
  const [SUIprice, setSUIprice] = useState<number | undefined>(undefined);
  const [POPCATprice, setPOPCATprice] = useState<number | undefined>(undefined);
  const [WIFprice, setWIFprice] = useState<number | undefined>(undefined);
  const [RUNEprice, setRUNEprice] = useState<number | undefined>(undefined);
  const [LINKprice, setLINKprice] = useState<number | undefined>(undefined);

  const [futures, setFutures] = useState<{ [productId: string]: Future }>({});

  useEffect(() => {
    //SPOT
    const ws = new ReconnectingWebSocket("wss://ws.kraken.com/");

    ws.onopen = () => {
      const subscribeMessage = {
        event: "subscribe",
        pair: coins.map((coin) => `${coin.symbol}/USD`),
        subscription: { name: "ticker" },
      };
      ws.send(JSON.stringify(subscribeMessage));
      console.log("Subscribed to spot tickers");
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data[3] === "XBT/USD") {
        setBTCprice(data[1].c[0]);
      } else if (data[3] === "ETH/USD") {
        setETHprice(data[1].c[0]);
      } else if (data[3] === "SOL/USD") {
        setSOLprice(data[1].c[0]);
      } else if (data[3] === "XRP/USD") {
        setXRPprice(data[1].c[0]);
      } else if (data[3] === "ADA/USD") {
        setADAprice(data[1].c[0]);
      } else if (data[3] === "LTC/USD") {
        setLTCprice(data[1].c[0]);
      } else if (data[3] === "BCH/USD") {
        setBCHprice(data[1].c[0]);
      } else if (data[3] === "UNI/USD") {
        setUNIprice(data[1].c[0]);
      } else if (data[3] === "TRUMP/USD") {
        setTRUMPprice(data[1].c[0]);
      } else if (data[3] === "JUP/USD") {
        setJUPprice(data[1].c[0]);
      } else if (data[3] === "SUI/USD") {
        setSUIprice(data[1].c[0]);
      } else if (data[3] === "POPCAT/USD") {
        setPOPCATprice(data[1].c[0]);
      } else if (data[3] === "WIF/USD") {
        setWIFprice(data[1].c[0]);
      } else if (data[3] === "RUNE/USD") {
        setRUNEprice(data[1].c[0]);
      } else if (data[3] === "LINK/USD") {
        setLINKprice(data[1].c[0]);
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
    const fws = new ReconnectingWebSocket("wss://futures.kraken.com/ws/v3");

    // Open WebSocket connection and subscribe to the ticker channel for ETH and BTC futures
    fws.onopen = () => {
      fws.send(
        JSON.stringify({
          event: "subscribe",
          feed: "ticker",
          product_ids: [
            ...coins.map((coin: { symbol: string }) => `PF_${coin.symbol}USD`),
            "FF_XBTUSD_250627",
            "FF_XBTUSD_250926",
            "FF_XBTUSD_251226",
            "FF_SOLUSD_250627",
            "FF_ETHUSD_250627",
            "FF_ETHUSD_250926",
            "FF_ETHUSD_251226",
          ],
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

  const findHookBySymbol: (symbol: string) => number = useCallback(
    (symbol: string) => {
      switch (symbol) {
        case "XBT":
          return BTCprice ? BTCprice : 0;
        case "ETH":
          return ETHprice ? ETHprice : 0;
        case "SOL":
          return SOLprice ? SOLprice : 0;
        case "XRP":
          return XRPprice ? XRPprice : 0;
        case "ADA":
          return ADAprice ? ADAprice : 0;
        case "LTC":
          return LTCprice ? LTCprice : 0;
        case "BCH":
          return BCHprice ? BCHprice : 0;
        case "UNI":
          return UNIprice ? UNIprice : 0;
        case "TRUMP":
          return TRUMPprice ? TRUMPprice : 0;
        case "JUP":
          return JUPprice ? JUPprice : 0;
        case "SUI":
          return SUIprice ? SUIprice : 0;
        case "POPCAT":
          return POPCATprice ? POPCATprice : 0;
        case "WIF":
          return WIFprice ? WIFprice : 0;
        case "RUNE":
          return RUNEprice ? RUNEprice : 0;
        case "LINK":
          return LINKprice ? LINKprice : 0;
        default:
          return 0;
      }
    },
    [
      BTCprice,
      ETHprice,
      SOLprice,
      XRPprice,
      ADAprice,
      LTCprice,
      BCHprice,
      UNIprice,
      TRUMPprice,
      JUPprice,
      SUIprice,
      POPCATprice,
      WIFprice,
      RUNEprice,
      LINKprice,
    ]
  );

  console.log(futures);

  return (
    <div className="rizz">
      <h3>Rizzfeed, the feed with rizz, made for Rizzi</h3>
      <table>
        <tbody>
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
              OI *<br />
              price
              <br />
              (mm)
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

          {coins
            .sort(
              (a: { symbol: string }, b: { symbol: string }) =>
                futures[`PF_${b.symbol}USD`]?.openInterest * findHookBySymbol(b.symbol) -
                futures[`PF_${a.symbol}USD`]?.openInterest * findHookBySymbol(a.symbol)
            )
            .map((coin: { symbol: string }, i: number) => [
              <tr key={i + "coin"}>
                <td className={`bold ${coin.symbol}`}>{coin.symbol}</td>
                <td className="bold">Spot</td>
                <td>n/a</td>
                <td className="big bold threecol">${findHookBySymbol(coin.symbol)}</td>
                <td className="sevencol">n/a</td>
              </tr>,
              <tr key={i + "perp"}>
                <td className={`bold ${coin.symbol}`}>{coin.symbol}</td>
                <td className="bold">Perp</td>
                <td>
                  $
                  {((futures[`PF_${coin.symbol}USD`]?.openInterest * findHookBySymbol(coin.symbol)) / 1000000).toFixed(
                    4
                  )}
                  <br />
                </td>
                <td>${futures[`PF_${coin.symbol}USD`]?.bid}</td>
                <td>${futures[`PF_${coin.symbol}USD`]?.ask}</td>
                <td>
                  ${((futures[`PF_${coin.symbol}USD`]?.bid + futures[`PF_${coin.symbol}USD`]?.ask) / 2).toFixed(4)}
                </td>
                <td>
                  $
                  {findHookBySymbol(coin.symbol)
                    ? (
                        (futures[`PF_${coin.symbol}USD`]?.bid + futures[`PF_${coin.symbol}USD`]?.ask) / 2 -
                        findHookBySymbol(coin.symbol)
                      ).toFixed(6)
                    : "spot loading..."}
                </td>
                <td>%{(futures[`PF_${coin.symbol}USD`]?.relative_funding_rate * 100 * 24 * 365).toFixed(8)}</td>
                <td>n/a</td>
                <td>n/a</td>
                <td>%{(futures[`PF_${coin.symbol}USD`]?.relative_funding_rate * 100).toFixed(9)}</td>
                <td>%{(futures[`PF_${coin.symbol}USD`]?.relative_funding_rate_prediction * 100).toFixed(9)}</td>
                <td>
                  %{(futures[`PF_${coin.symbol}USD`]?.relative_funding_rate_prediction * 100 * 24 * 365).toFixed(9)}
                </td>
              </tr>,
              coin.symbol === "XBT" || coin.symbol === "ETH" || coin.symbol === "SOL" ? (
                <tr key={i + "fixed1"}>
                  <td className={`bold ${coin.symbol}`}>{coin.symbol}</td>
                  <td className="bold">Fixed</td>
                  <td>
                    $
                    {(
                      (futures[`FF_${coin.symbol}USD_250627`]?.openInterest * findHookBySymbol(coin.symbol)) /
                      1000000
                    ).toFixed(4)}
                    <br />
                  </td>
                  <td>${futures[`FF_${coin.symbol}USD_250627`]?.bid}</td>
                  <td>${futures[`FF_${coin.symbol}USD_250627`]?.ask}</td>
                  <td>
                    $
                    {(
                      (futures[`FF_${coin.symbol}USD_250627`]?.bid + futures[`FF_${coin.symbol}USD_250627`]?.ask) /
                      2
                    ).toFixed(4)}
                  </td>
                  <td>
                    $
                    {findHookBySymbol(coin.symbol)
                      ? (
                          (futures[`FF_${coin.symbol}USD_250627`]?.bid + futures[`FF_${coin.symbol}USD_250627`]?.ask) /
                            2 -
                          findHookBySymbol(coin.symbol)
                        ).toFixed(6)
                      : "spot loading..."}
                  </td>
                  <td>
                    %
                    {findHookBySymbol(coin.symbol)
                      ? (((futures[`FF_${coin.symbol}USD_250627`]?.bid + futures[`FF_${coin.symbol}USD_250627`]?.ask) /
                          2 -
                          findHookBySymbol(coin.symbol)) /
                          findHookBySymbol(coin.symbol)) *
                        (365 / Math.round(Math.abs((new Date(2025, 6, 27).getTime() - Date.now()) / oneDay))) *
                        100
                      : "spot loading..."}
                  </td>
                  <td>6/27</td>
                  <td>{Math.round(Math.abs((new Date(2025, 6, 27).getTime() - Date.now()) / oneDay)).toString()}</td>
                  <td>n/a</td>
                  <td>n/a</td>
                  <td>n/a</td>
                </tr>
              ) : null,
              coin.symbol === "XBT" || coin.symbol === "ETH" ? (
                <tr key={i + "fixed2"}>
                  <td className={`bold ${coin.symbol}`}>{coin.symbol}</td>
                  <td className="bold">Fixed</td>
                  <td>
                    $
                    {(
                      (futures[`FF_${coin.symbol}USD_250926`]?.openInterest * findHookBySymbol(coin.symbol)) /
                      1000000
                    ).toFixed(4)}
                    <br />
                    mm
                  </td>
                  <td>${futures[`FF_${coin.symbol}USD_250926`]?.bid}</td>
                  <td>${futures[`FF_${coin.symbol}USD_250926`]?.ask}</td>
                  <td>
                    $
                    {(
                      (futures[`FF_${coin.symbol}USD_250926`]?.bid + futures[`FF_${coin.symbol}USD_250926`]?.ask) /
                      2
                    ).toFixed(4)}
                  </td>
                  <td>
                    $
                    {findHookBySymbol(coin.symbol)
                      ? (
                          (futures[`FF_${coin.symbol}USD_250926`]?.bid + futures[`FF_${coin.symbol}USD_250926`]?.ask) /
                            2 -
                          findHookBySymbol(coin.symbol)
                        ).toFixed(6)
                      : "spot loading..."}
                  </td>
                  <td>
                    %
                    {findHookBySymbol(coin.symbol)
                      ? (((futures[`FF_${coin.symbol}USD_250926`]?.bid + futures[`FF_${coin.symbol}USD_250926`]?.ask) /
                          2 -
                          findHookBySymbol(coin.symbol)) /
                          findHookBySymbol(coin.symbol)) *
                        (365 / Math.round(Math.abs((new Date(2025, 9, 26).getTime() - Date.now()) / oneDay))) *
                        100
                      : "spot loading..."}
                  </td>
                  <td>9/26</td>
                  <td>{Math.round(Math.abs((new Date(2025, 9, 26).getTime() - Date.now()) / oneDay)).toString()}</td>
                  <td>n/a</td>
                  <td>n/a</td>
                  <td>n/a</td>
                </tr>
              ) : null,
              coin.symbol === "XBT" || coin.symbol === "ETH" ? (
                <tr key={i + "fixed3"}>
                  <td className={`bold ${coin.symbol}`}>{coin.symbol}</td>
                  <td className="bold">Fixed</td>
                  <td>
                    $
                    {(
                      (futures[`FF_${coin.symbol}USD_251226`]?.openInterest * findHookBySymbol(coin.symbol)) /
                      1000000
                    ).toFixed(4)}
                    <br />
                    mm
                  </td>
                  <td>${futures[`FF_${coin.symbol}USD_251226`]?.bid}</td>
                  <td>${futures[`FF_${coin.symbol}USD_251226`]?.ask}</td>
                  <td>
                    $
                    {(
                      (futures[`FF_${coin.symbol}USD_251226`]?.bid + futures[`FF_${coin.symbol}USD_251226`]?.ask) /
                      2
                    ).toFixed(4)}
                  </td>
                  <td>
                    $
                    {findHookBySymbol(coin.symbol)
                      ? (
                          (futures[`FF_${coin.symbol}USD_251226`]?.bid + futures[`FF_${coin.symbol}USD_251226`]?.ask) /
                            2 -
                          findHookBySymbol(coin.symbol)
                        ).toFixed(6)
                      : "spot loading..."}
                  </td>
                  <td>
                    %
                    {findHookBySymbol(coin.symbol)
                      ? (((futures[`FF_${coin.symbol}USD_251226`]?.bid + futures[`FF_${coin.symbol}USD_251226`]?.ask) /
                          2 -
                          findHookBySymbol(coin.symbol)) /
                          findHookBySymbol(coin.symbol)) *
                        (365 / Math.round(Math.abs((new Date(2025, 12, 26).getTime() - Date.now()) / oneDay))) *
                        100
                      : "spot loading..."}
                  </td>
                  <td>12/26</td>
                  <td>{Math.round(Math.abs((new Date(2025, 12, 26).getTime() - Date.now()) / oneDay)).toString()}</td>
                  <td>n/a</td>
                  <td>n/a</td>
                  <td>n/a</td>
                </tr>
              ) : null,
            ])}
        </tbody>
      </table>
    </div>
  );
}

export default App;
