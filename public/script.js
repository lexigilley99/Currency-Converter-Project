document.addEventListener("DOMContentLoaded", () => {
    const baseCurrencySelect = document.getElementById("base-currency");
    const targetCurrencySelect = document.getElementById("target-currency");
    const amountInput = document.getElementById("amount");
    const convertedAmountSpan = document.getElementById("converted-amount");
    const historicalRatesButton = document.getElementById("historical-rates");
    const historicalRatesContainer = document.getElementById("historical-rates-container");
    const saveFavoriteButton = document.getElementById("save-favorite");
    const favoriteCurrencyPairsDiv = document.getElementById("favorite-currency-pairs");

    const apiKey = "fca_live_ssjx0YyGhNqc8VdrECRVRticgJFeho7BG7eOVMsi";
    const apiUrl = "https://api.freecurrencyapi.com";

    let currencies = [];

    fetchCurrencies();
    async function fetchCurrencies() {
        try {
            const response = await fetch(`${apiUrl}/v1/currencies?apikey=${apiKey}`);
            const data = await response.json();
            currencies = Object.keys(data.data);
            populateSelect(baseCurrencySelect, currencies);
            populateSelect(targetCurrencySelect, currencies);
        } catch (error) {
            console.error("Error fetching currencies:", error);
        }
    }

    function populateSelect(selectElement, options) {
        selectElement.innerHTML = ''; // Clear previous options
        options.forEach(option => {
            const optionElement = document.createElement("option");
            optionElement.value = option;
            optionElement.textContent = option;
            selectElement.appendChild(optionElement);
        });
    }

    amountInput.addEventListener("input", convertCurrency);
    baseCurrencySelect.addEventListener("change", convertCurrency);
    targetCurrencySelect.addEventListener("change", convertCurrency);

    async function convertCurrency() {
        const baseCurrency = baseCurrencySelect.value;
        const targetCurrency = targetCurrencySelect.value;
        const amount = parseFloat(amountInput.value);

        // Handle invalid amount input
        if (isNaN(amount) || amount <= 0) {
            alert("Please enter a valid positive number for amount.");
            amountInput.value = ""; // Clear invalid input
            convertedAmountSpan.textContent = "";
            return;
        }

        // Handle same base and target currency
        if (baseCurrency === targetCurrency) {
            alert("Base currency and target currency cannot be the same.");
            return;
        }

        try {
            const response = await fetch(`${apiUrl}/v1/latest?apikey=${apiKey}&base_currency=${baseCurrency}&currencies=${targetCurrency}`);
            if (!response.ok) {
                throw new Error("Failed to fetch data from API.");
            }
            const data = await response.json();
            const rate = data.data[targetCurrency];
            if (!rate) {
                throw new Error("Exchange rate data not available.");
            }
            const convertedAmount = amount * rate;
            convertedAmountSpan.textContent = `${convertedAmount.toFixed(2)} ${targetCurrency}`;
        } catch (error) {
            console.error("Error converting currency:", error);
            alert("Failed to convert currency. Please try again later.");
        }
    }

    historicalRatesButton.addEventListener("click", async () => {
        const baseCurrency = baseCurrencySelect.value;
        const targetCurrency = targetCurrencySelect.value;
        const date = "2021-06-15"; // Example date for format

        try {
            const response = await fetch(`/api/historical-rates?baseCurrency=${baseCurrency}&targetCurrency=${targetCurrency}&date=${date}`);
            if (!response.ok) {
                throw new Error("Failed to fetch historical rates from API.");
            }
            const data = await response.json();
            historicalRatesContainer.textContent = data.message;
        } catch (error) {
            console.error("Error fetching historical rate:", error);
            alert("Failed to fetch historical rates. Please try again later.");
        }
    });

    saveFavoriteButton.addEventListener("click", async () => {
        const baseCurrency = baseCurrencySelect.value;
        const targetCurrency = targetCurrencySelect.value;
        const favoritePair = `${baseCurrency}/${targetCurrency}`;

        try {
            await fetch("/api/favorites", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ pair: favoritePair })
            });
            loadFavorites();
        } catch (error) {
            console.error("Error saving favorite pair:", error);
            alert("Failed to save favorite pair. Please try again later.");
        }
    });

    async function loadFavorites() {
        try {
            const response = await fetch("/api/favorites");
            if (!response.ok) {
                throw new Error("Failed to fetch favorite pairs from API.");
            }
            const favorites = await response.json();
            favoriteCurrencyPairsDiv.innerHTML = ''; // Clear previous favorite pairs
            favorites.forEach(pair => {
                const button = document.createElement("button");
                button.textContent = pair;
                button.classList.add("favorite-pair");
                button.addEventListener("click", () => {
                    const [base, target] = pair.split('/');
                    baseCurrencySelect.value = base;
                    targetCurrencySelect.value = target;
                    convertCurrency();
                });
                favoriteCurrencyPairsDiv.appendChild(button);
            });
        } catch (error) {
            console.error("Error loading favorite pairs:", error);
            alert("Failed to load favorite pairs. Please try again later.");
        }
    }

    loadFavorites(); // Load favorites on page load
});



