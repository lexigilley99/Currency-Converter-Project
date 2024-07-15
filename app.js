const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { Sequelize, DataTypes } = require("sequelize");

const app = express();
const port = process.env.PORT || 3000;
const apiKey = "fca_live_ssjx0YyGhNqc8VdrECRVRticgJFeho7BG7eOVMsi";
const apiUrl = "https://api.freecurrencyapi.com/v1/historical";

app.use(bodyParser.json());
app.use(cors());
app.use(express.static("public"));

const sequelize = new Sequelize({
    dialect: "sqlite",
    storage: "database.sqlite"
});

const Favorite = sequelize.define("Favorite", {
    pair: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    }
});

sequelize.sync();

app.post("/api/favorites", async (req, res) => {
    try {
        const favorite = await Favorite.create({ pair: req.body.pair });
        res.status(201).json(favorite);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.get("/api/favorites", async (req, res) => {
    try {
        const favorites = await Favorite.findAll();
        res.json(favorites.map(fav => fav.pair));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get("/api/historical-rates", async (req, res) => {
    const { baseCurrency, targetCurrency, date } = req.query;

    try {
        const { default: fetch } = await import('node-fetch');
        const response = await fetch(`${apiUrl}?apikey=${apiKey}&date=${date}&base_currency=${baseCurrency}&currencies=${targetCurrency}`);
        const data = await response.json();

        if (data.data && data.data[date] && data.data[date][targetCurrency]) {
            const rate = data.data[date][targetCurrency];
            const message = `Historical exchange rate on ${date}: 1 ${baseCurrency} = ${rate.toFixed(4)} ${targetCurrency}`;
            res.json({ message });
        } else {
            res.status(404).json({ message: 'Rate not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});





