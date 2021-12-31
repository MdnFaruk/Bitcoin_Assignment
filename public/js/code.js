const request_making = async (url, config) => {
    const res = await fetch(url, config);
    if (!res.ok) {
        const message = `Error : ${res.status}`;
        throw new Error(message);
    }
    const data = await res.json();
    if (res.status === 200) {
        load_element.classList.add("d-none");
    }
    return data;
};

function show_result() {

    if (date1.value === "" || date2.value === "") {
        document.querySelector(".warning").style.display = "inline-block";
        setTimeout(() => document.querySelector(".warning").style.display = 'none', 1000);
        return;
    }

    load_element.classList.remove("d-none");

    let decrease_day = 0;
    let volumes = [];
    let prices = [];
    let d1 = Math.round(new Date(date1.value).getTime() / 1000);
    let d2 = Math.round(new Date(date2.value).getTime() / 1000);
    let totaldays = d2 - d1;

    request_making(`https://api.coingecko.com/api/v3/coins/bitcoin/market_chart/range?vs_currency=eur&from=${d1}&to=${d2 + 3600}`)
        .then(data => {

            let new_data_prices = [...data.prices].reverse();
            let highest_volume_index;
            let trading_volume;
            let highest_price_index;
            let highest_price;
            let lowest_price_index;
            let lowest_price;

            if (totaldays <= 7776000) {
                for (let i = 0; i < data.prices.length; i += 24) {
                    volumes.push(data.total_volumes[i][1]);
                    prices.push(data.prices[i][1]);
                    if ((i + 24) < data.prices.length) {
                        let compare_price = new_data_prices[i][1] - new_data_prices[i + 24][1];
                        if (Math.sign(compare_price) === 1) {
                            decrease_day++;
                        }
                    }

                }
                highest_volume_index = sorting_data(volumes, 24, 0);
                highest_price_index = sorting_data(prices, 24, 0);
                lowest_price_index = sorting_data(prices, 24, prices.length - 1);
            } else {
                for (let i = 0; i < data.prices.length; i++) {
                    volumes.push(data.total_volumes[i][1]);
                    prices.push(data.prices[i][1]);
                    if ((i + 1) < data.prices.length) {
                        let compare_price = new_data_prices[i][1] - new_data_prices[i + 1][1];
                        if (Math.sign(compare_price) === 1) {
                            decrease_day++;
                        }
                    }

                }
                highest_volume_index = sorting_data(volumes, 1, 0);
                highest_price_index = sorting_data(prices, 1, 0);
                lowest_price_index = sorting_data(prices, 1, prices.length - 1);
            }

            trading_volume = data.total_volumes[highest_volume_index];
            highest_price = data.prices[highest_price_index];
            lowest_price = data.prices[lowest_price_index];

            const trading_vol_date = new Date(trading_volume[0]).toLocaleDateString();
            const trading_vol_price = "&euro;" + trading_volume[1].toLocaleString();
            const highest_price_date = new Date(highest_price[0]).toLocaleDateString();
            const lowest_price_date = new Date(lowest_price[0]).toLocaleDateString();
            let isOnlyDecreasing = decrease_day === (data.prices.length - 1);
            
            output_result_A(decrease_day, date1.value, date2.value);
            output_result_B(trading_vol_date, trading_vol_price);
            output_result_C(lowest_price_date, highest_price_date, isOnlyDecreasing);
           
        })
}

function output_result_A(...result) {
    const [day, date1, date2] = [...result];
    const message1 = "In bitcoin’s historical data from CoinGecko,";
    
    if (output1.textContent.includes(`${message1}`)) {
        document.getElementById("output1").innerHTML += `, and the price 
        decrease <b>${day}</b> days in a row for the inputs from <b>${date1}</b> and to <b>${date2}</b>`
    } else {
        document.getElementById("output1").innerHTML += `${message1} the price 
        decrease <b>${day}</b> days in a row for the inputs from <b>${date1}</b> and to <b>${date2}</b>`
    }

}

function output_result_B(...result) {
    const [date, price] = [...result];

    document.getElementById("output2").innerHTML = "";
    document.getElementById("output2").innerHTML = 
    `Highest trading volume <br> Date: <b>${date}</b>,  Vol: <b>${price}</b>`;
}

function output_result_C(...result) {
    const [date1, date2, isOnlyDecreasing] = [...result];
    const message2 = "You should not buy (nor sell) bitcoin on any of those days";
    const message3 = `The best day for buying bitcoin: <b>${date1}</b> and  the best 
    day for selling bitcoin: <b>${date2}</b>`;
        
    document.getElementById("output3").innerHTML = "";
    if (isOnlyDecreasing) {
        document.getElementById("output3").innerHTML = message2;
    } else {
        document.getElementById("output3").innerHTML = message3;
    }
}

function sorting_data(all_data, value, data_index) {
    const volume_value = [...all_data].sort((a, b) => { return b - a })[data_index];
    const volume_index = all_data.lastIndexOf(volume_value) * value;
    return volume_index;
}