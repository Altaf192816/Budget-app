"use strict";
//TODO----------------------Budget Controller----------------
const budgetController = (function () {
  const Expense = class {
    constructor(id, description, value) {
      this.id = id;
      this.description = description;
      this.value = value;
      this.percentageExp = -1;
    }
    calcPercenatge(totalIncome) {
      if (!totalIncome) return;
      this.percentageExp = Math.round((this.value / totalIncome) * 100);
    }

    getPercentageExp() {
      return this.percentageExp;
    }
  };

  const Income = class {
    constructor(id, description, value) {
      this.id = id;
      this.description = description;
      this.value = value;
    }
  };

  let data = {
    allItem: {
      exp: [],
      inc: [],
    },
    totals: {
      exp: 0,
      inc: 0,
    },
    budget: 0,
    percentage: -1,
  };

  const calcTotal = function (type) {
    data.totals[type] = data.allItem[type].reduce((acc, el) => {
      return acc + el.value;
    }, 0);
  };

  return {

    // getLocalStorage(){
    //  const localData = JSON.parse(localStorage.getItem("budgetData"));
    //  if(!localData) return;
    //  data = localData;
     
    // },

    // setLocalStorage(){
    //   localStorage.setItem("budgetData",JSON.stringify(data));
    // },

    addItems(type, des, val) {
      let newItem, Id;
      //create new ID
      Id = data.allItem[type].length > 0 ? data.allItem[type].at(-1).id + 1 : 0;

      //Create new items based on "inc" or "exp"
      if (type === "exp") {
        newItem = new Expense(Id, des, val);
      } else if (type === "inc") {
        newItem = new Income(Id, des, val);
      }

      //Push it into data object
      data.allItem[type].push(newItem);
      //Return the new element
      return newItem;
    },

    deleteItem(ID, type) {
      const removeEl = data.allItem[type].findIndex((el) => {
        return el.id === +ID;
      });
      data.allItem[type].splice(removeEl, 1);
    },

    calcBudget() {
      //1 Calculate total income and expense
      calcTotal("exp");
      calcTotal("inc");
      //2 Calculate the budget : income - expense
      data.budget = data.totals.inc - data.totals.exp;
      //3 Calculate the percentage of income thet we spent
      if (!data.totals.inc) return;
      data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
    },

    calcPercenatge() {
      data.allItem.exp.forEach((cur) => {
        cur.calcPercenatge(data.totals.inc);//! this function creating error for localstorage data  
      });
    },

    getPercentages() {
      const allPercentages = data.allItem.exp.map((cur) => {
        return cur.getPercentageExp();
      });

      return allPercentages;
    },

    getBudget() {
      return {
        budget: data.budget,
        percentage: data.percentage,
        incTotal: data.totals.inc,
        expTotal: data.totals.exp,
      };
    },
  };
})();

//TODO----------------------UI Controller--------------------
const UIController = (function () {
  const domString = {
    type: ".add__type",
    description: ".add__description",
    value: ".add__value",
    inputBtn: ".add__btn",
    incList: ".income__list",
    expList: ".expenses__list",
    budgetLable: ".budget__value",
    incomeLabel: ".budget__income--value",
    expenseLabel: ".budget__expenses--value",
    expensePercentageLabel: ".budget__expenses--percentage",
    container: ".container",
    expensePerLabel: ".item__percentage",
    dateLabel: ".budget__title--month",
  };
  return {
    getInput() {
      return {
        type: document.querySelector(domString.type).value,
        description: document.querySelector(domString.description).value,
        value: +document.querySelector(domString.value).value,
      };
    },

    addListItem(obj, type) {
      //Create HTML string
      // prettier-ignore
      const  html=`
        <div class="item clearfix" id="${type==="inc" ? "income" : "expense"}-${obj.id}">
         <div class="item__description">${obj.description}</div>
          <div class="right clearfix">
            <div class="item__value">${type==="inc" ? "+" : "-"} ${new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR"}).format(obj.value)}</div>
            ${type==="inc" ? "" : '<div class="item__percentage">21%</div>'}
            <div class="item__delete">
                <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
            </div>
            </div>
        </div>
      `;

      //Inserting HTML in container
      document
        .querySelector(type === "inc" ? domString.incList : domString.expList)
        .insertAdjacentHTML("beforeend", html);
    },

    deleteListItem(item) {
      item.remove();
    },

    clearFeild() {
      document.querySelector(domString.description).value = "";
      document.querySelector(domString.value).value = "";
      document.querySelector(domString.description).focus();
    },

    displayBudget(budget) {
      const numberFormat = (num) =>
        new Intl.NumberFormat("en-IN", {
          style: "currency",
          currency: "INR",
        }).format(num);

      document.querySelector(domString.budgetLable).textContent = numberFormat(
        budget.budget
      );
      document.querySelector(domString.incomeLabel).textContent = numberFormat(
        budget.incTotal
      );
      document.querySelector(domString.expenseLabel).textContent = numberFormat(
        budget.expTotal
      );
      document.querySelector(domString.expensePercentageLabel).textContent =
        budget.percentage > 0 ? `${budget.percentage}%` : "---";
    },

    displayPercenatgeExp(percentages) {
      const feilds = [...document.querySelectorAll(domString.expensePerLabel)];
      feilds.forEach((el, i) => {
        el.textContent = percentages[i] > 0 ? `${percentages[i]}%` : "---";
      });
    },

    displayMonth() {
      const date = new Date();
      const formatedDate = new Intl.DateTimeFormat("en-IN", {
        month: "long",
        year: "numeric",
      }).format(date);
      document.querySelector(domString.dateLabel).textContent = formatedDate;
    },

    changeType(){
     document.querySelector(domString.type).classList.toggle("red-focus");
     document.querySelector(domString.description).classList.toggle("red-focus");
     document.querySelector(domString.value).classList.toggle("red-focus");
     document.querySelector(domString.inputBtn).classList.toggle("red");
    },

    getDomString() {
      return domString;
    },
  };
})();

//TODO----------------------Controller------------------------
const controller = (function (budgetCtrl, UICtrl) {
  const updateBudget = function () {
    //1 Calculate the budget
    budgetCtrl.calcBudget();
    //2 Return the budget
    const budget = budgetCtrl.getBudget();
    //3 Dispaly  budget on the UI
    UICtrl.displayBudget(budget);
  };

  const updatePercentage = function () {
    //1 Calculate the percentage
    budgetCtrl.calcPercenatge();
    //2 Return the percentage
    const percentageArr = budgetCtrl.getPercentages();
    //3 Dispaly  percentage on the UI
    // console.log(percentageArr);
    UICtrl.displayPercenatgeExp(percentageArr);
  };

  const ctrlAdditems = function () {
    //1 Get input data
    const input = UICtrl.getInput();
    if (!input.description || !input.value) return; //Guard clause

    //2 Add items to the budget controller
    const newItem = budgetCtrl.addItems(
      input.type,
      input.description,
      input.value
    ); 
    //3 Add items to te UI
    UICtrl.addListItem(newItem, input.type);

    //4Clearing the feild
    UICtrl.clearFeild();

    //5 calculate and update budget
    updateBudget();

    //6 Calculate and update the percentage
    updatePercentage();

    //Updating Data in localStorage
    // budgetCtrl.setLocalStorage();
  };

  const ctrlDeleteItem = function (e) {
    const btn = e.target.closest(".item__delete--btn");
    if (!btn) return;
    const item = e.target.closest(".item");
    if (!item) return;
    const type = item.id.split("-")[0].slice(0, 3);
    const ID = item.id.split("-")[1];

    //1 Delete teh itme from datastructure
    budgetCtrl.deleteItem(ID, type);

    //2 Delete the items from UI
    UICtrl.deleteListItem(item);

    //3 Update and show the new budget
    updateBudget();

    //4 Calculate and update the percentage
    updatePercentage();

    //Updating Data in localStorage
    // budgetCtrl.setLocalStorage();
  };

  const setupEvent = function () {
    const DOM = UICtrl.getDomString();
    const addBtn = document.querySelector(DOM.inputBtn);
    addBtn.addEventListener("click", ctrlAdditems);

    document.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        ctrlAdditems();
      }
    });

    document
      .querySelector(DOM.container)
      .addEventListener("click", ctrlDeleteItem);
    document.querySelector(DOM.type).addEventListener("change",UICtrl.changeType);  
  };

  return {
    init() {
      UICtrl.displayBudget({
        budget: 0,
        percentage: -1,
        incTotal: 0,
        expTotal: 0,
      });
      setupEvent();
      UICtrl.displayMonth();
      // budgetCtrl.getLocalStorage();
    },
  };
})(budgetController, UIController);

controller.init();
