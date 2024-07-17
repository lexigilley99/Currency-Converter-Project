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

    let currencies = []; // creates an empty array

    fetchCurrencies();
    async function fetchCurrencies() {
        try {
            const response = await fetch(`${apiUrl}/v1/currencies?apikey=${apiKey}`);
            const data = await response.json(); // response object to be parsed as JSON, which is then stored in the data variable
            currencies = Object.keys(data.data); // extracts the keys from the data.data object and assigns them to the currencies variable
            populateSelect(baseCurrencySelect, currencies); // Creates two dropdown menus and adds currency options to the DOM
            populateSelect(targetCurrencySelect, currencies);
        } catch (error) {
            console.error("Error fetching currencies:", error);
        }
    }

    function populateSelect(selectElement, options) {
        selectElement.innerHTML = ''; // Clear previous options
        options.forEach(option => {
            const optionElement = document.createElement("option");
            optionElement.value = option; // displayed text and the value of the option in the dropdown will both be set to the current option
            optionElement.textContent = option;
            selectElement.appendChild(optionElement); // appends the newly created optionElement to the selectElement, adding it to the dropdown list
        });
    }

    amountInput.addEventListener("input", convertCurrency);
    baseCurrencySelect.addEventListener("change", convertCurrency);
    targetCurrencySelect.addEventListener("change", convertCurrency);

    async function convertCurrency() {
        const baseCurrency = baseCurrencySelect.value;
        const targetCurrency = targetCurrencySelect.value;
        const amount = parseFloat(amountInput.value); // retrieves the base currency, target currency, and the amount to be converted 
        // parses it as a floating-point number and assigned to the amount variable

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
                throw new Error("Failed to fetch data from API."); // checks if the ok property is false, if false the http response does not work
            }
            const data = await response.json();
            const rate = data.data[targetCurrency]; // expected to be an object where keys are currency codes, and values are their corresponding exchange rates
            if (!rate) { // if nate is undefined or null
                throw new Error("Exchange rate data not available.");
            }
            const convertedAmount = amount * rate;
            convertedAmountSpan.textContent = `${convertedAmount.toFixed(2)} ${targetCurrency}`; // formats the converted amount to two decimal places
        } catch (error) {
            console.error("Error converting currency:", error);
            alert("Failed to convert currency. Please try again later.");
        }
    }

    historicalRatesButton.addEventListener("click", async () => { // asynchronous function will be executed on click
        const baseCurrency = baseCurrencySelect.value;
        const targetCurrency = targetCurrencySelect.value;
        const date = "2021-06-15"; // Example date for format

        try {
            const response = await fetch(`/api/historical-rates?baseCurrency=${baseCurrency}&targetCurrency=${targetCurrency}&date=${date}`);
            if (!response.ok) {
                throw new Error("Failed to fetch historical rates from API.");
            }
            const data = await response.json();
            historicalRatesContainer.textContent = data.message; // data object contains a message property (indicating an error or other important message from the API), display this message
        } catch (error) {
            console.error("Error fetching historical rate:", error);
            alert("Failed to fetch historical rates. Please try again later.");
        }
    });

    saveFavoriteButton.addEventListener("click", async () => {
        const baseCurrency = baseCurrencySelect.value;
        const targetCurrency = targetCurrencySelect.value;
        const favoritePair = `${baseCurrency}/${targetCurrency}`; // saves favorite pairs on click

        try {
            await fetch("/api/favorites", { // POST request to an API endpoint, If the request succeeds HTTP status 2xx
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
            favoriteCurrencyPairsDiv.innerHTML = ''; // Clear previous favorite pairs, displayed without duplication
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
                favoriteCurrencyPairsDiv.appendChild(button); adds the button to the DOM
            });
        } catch (error) {
            console.error("Error loading favorite pairs:", error);
            alert("Failed to load favorite pairs. Please try again later.");
        }
    }

    loadFavorites(); // Load favorites on page load
});



