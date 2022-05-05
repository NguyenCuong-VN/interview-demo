//use this to storage all data (not enough time to use localstorage :)) )
let allData = {};
let quantitySelect = {};

//get all data
const renderAll = async () => {
    console.log("Start render all data");
    const data = callApi("", null, (isSuccess, res) => {
        if (!isSuccess) {
            alert(res);
            return;
        }

        console.log(`All data ${JSON.stringify(res)}`);

        const data = res;
        if (!data) return;

        allData = data;

        //render
        const money = document.getElementsByClassName("money")?.[0];
        if (money) {
            money.textContent = `${data.wallet || 0}`;
        }
        const available = document.getElementsByClassName("available")?.[0];
        if (available) {
            available.textContent = `${data.wallet || 0}`;
        }

        if (data.arrItems) {
            const cards = document.getElementsByClassName("cards")?.[0];
            if (cards) {
                let contents = "";
                for (const item of data.arrItems) {
                    if (!item) continue;
                    contents += createItemNode(item.src, item.name, item.quantity, item.price);
                }
                cards.innerHTML = contents.trim();
            }
        }

        //add evenEmitters
        const deposit = document.getElementsByClassName("deposit")?.[0];
        if (deposit) {
            deposit.addEventListener("click", btnDepositClick, false);
        }
        const withdrawal = document.getElementsByClassName("withdrawal")?.[0];
        if (withdrawal) {
            withdrawal.addEventListener("click", btnWithdrawalClick, false);
        }
        const buyBtn = document.getElementsByClassName("buy-btn")?.[0];
        if (buyBtn) {
            buyBtn.addEventListener("click", btnBuyClick, false);
        }

        const minus = document.getElementsByClassName("minus");
        if (minus) {
            for (const element of minus) {
                element.addEventListener("click", btnMinusClick, false);
            }
        }
        const add = document.getElementsByClassName("add");
        if (add) {
            for (const element of add) {
                element.addEventListener("click", btnAddClick, false);
            }
        }
    });
};

//-------handle------

const btnDepositClick = () => {
    const deposit = document.getElementsByClassName("deposit-amount")?.[0];
    let depositAmount = 0;
    if (deposit) {
        depositAmount = deposit.value || depositAmount;
    }

    console.log(`click deposit: ${depositAmount}`);

    callApi(
        "wallet",
        {
            method: "POST",
            body: JSON.stringify({ money: depositAmount })
        },
        (isSuccess, res) => {
            if (!isSuccess || !res || res.error) {
                alert(res.message || res);
                return;
            }
            alert("Success");
            renderAll();
        }
    );
};

const btnBuyClick = () => {
    if (allData.arrItems?.length > 0) {
        const listItemClicked = [];
        for (const item of allData.arrItems) {
            const amountEle = document.getElementsByClassName(`amount-item-${item.name}`)?.[0];
            if (amountEle) {
                let amount = parseInt(`${amountEle.innerHTML}`);
                if (isNaN(amount) || amount <= 0) {
                    console.log(`Ignore item: ${item.name}`);
                    continue;
                }
                if (item.name) {
                    listItemClicked.push({
                        item: item.name,
                        quantity: amount
                    });
                }
            }
        }

        console.log(`click btnBuyClick: ${JSON.stringify(listItemClicked)}`);

        callApi(
            "order",
            {
                method: "POST",
                body: JSON.stringify(listItemClicked)
            },
            (isSuccess, res) => {
                if (!isSuccess || !res || res.error) {
                    alert(res.message || res);
                    return;
                }
                alert("Success");
                quantitySelect = {};
                renderAll();
            }
        );
    } else {
        alert("Cannot get any item to buy");
        return;
    }
};

const btnWithdrawalClick = () => {
    console.log(`click withdrawal`);

    callApi(
        "wallet",
        {
            method: "DELETE"
        },
        (isSuccess, res) => {
            if (!isSuccess || !res || res.error) {
                alert(res.message || res);
                return;
            }
            alert("Success");
            renderAll();
        }
    );
};

const btnMinusClick = (event) => {
    const clickedId = event.target.id;
    console.log(`click Minus: ${clickedId}`);
    const amountEle = document.getElementsByClassName(`amount-item-${clickedId}`)?.[0];
    let amount = 0;
    if (amountEle) {
        amount = amountEle.innerHTML || amount;
        amount = parseInt(`${amount}`);
        if (isNaN(amount) || amount <= 0) {
            alert(`Amount is invalid value: ${amount}`);
            return;
        }
        amountEle.innerHTML = amount - 1;
        quantitySelect[clickedId] = amountEle.innerHTML;
    }
};

const btnAddClick = (event) => {
    const clickedId = event.target.id;
    console.log(`click Add: ${clickedId}`);
    const amountEle = document.getElementsByClassName(`amount-item-${clickedId}`)?.[0];
    let amount = 0;
    if (amountEle) {
        amount = amountEle.innerHTML || amount;
        amount = parseInt(`${amount}`);
        console.log(amount, typeof amount);
        if (isNaN(amount) || amount < 0) {
            alert(`Amount is invalid value: ${amount}`);
            return;
        }

        amountEle.innerHTML = amount + 1;
        quantitySelect[clickedId] = amountEle.innerHTML;
    }
};

//-------helpers------

const callApi = (path = "", options = {}, callback) => {
    const url = `https://momo-interview-demo.herokuapp.com/${path}`;
    const optionsCall = {
        headers: {
            "Content-Type": "application/json"
        },
        ...options
    };
    console.log(url, optionsCall);
    fetch(url, optionsCall)
        .then(async (res) => {
            console.log(res);
            const result = await res.json();
            return callback(true, result);
        })
        .catch(async (e) => {
            console.error(e);
            return callback(false, false);
        });
};

const createItemNode = (src, name, quantity, price) => {
    return `<div class="card">
                        <img
                        src="${src || ""}"
                        alt="${name || ""}"
                        class="card-image"
                        />
                        <div class="card-content">
                        <div class="card-top">
                            <h3 class="card-title" >${name || ""}</h3>
                            <div style="display: flex; align-items: baseline;">
                            
                            <h5 class="post-title">${price || ""}</h5>
                            <span style="margin-left: 10px;">VND</span>
                            
                            </div>
                            <h5 class="post-title">${quantity || ""}</h5>
                            
                        </div>
                        <div class="card-bottom">
                            <div class="card-live minus" id="${name}">
                                            <ion-icon name="remove-outline" id="${name}"></ion-icon>
                            </div>
                                        <h3 class="card-quantity amount-item-${name}"  id= "${name}">${quantitySelect[name] || 0}</h3>
                                        <div class="card-live add" id="${name}">
                                            <ion-icon name="add-outline" id="${name}"></ion-icon>
                            </div>
                        </div>
                        </div>
                    </div>`;
};

renderAll();
