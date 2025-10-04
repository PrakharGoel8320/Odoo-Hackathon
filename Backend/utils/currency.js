// utils/currency.js
import axios from "axios";

export async function getCurrencyByCountry(countryName) {
  const url = `https://restcountries.com/v3.1/name/${countryName}?fields=currencies`;
  const res = await axios.get(url);
  const currencies = res.data[0].currencies;
  return Object.keys(currencies)[0]; // e.g. "INR"
}

export async function convertCurrency(amount, from, to) {
  const url = `https://api.exchangerate-api.com/v4/latest/${from}`;
  const res = await axios.get(url);
  const rate = res.data.rates[to];
  return amount * rate;
}
